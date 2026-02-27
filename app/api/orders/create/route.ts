import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession, type User } from "@/lib/auth"
import type { Order, Pricing, Proxy, ProxyPurchase } from "@/lib/types"
import { ObjectId } from "mongodb"

async function findAvailableProxy(db: any, country: string, userId: ObjectId) {
  // Get all proxy IDs the user has already purchased (active purchases only)
  const userPurchases = await db
    .collection<ProxyPurchase>("purchases")
    .find({
      userId,
      expiresAt: { $gt: new Date() },
    })
    .toArray()

  const purchasedProxyIds = userPurchases.map((p: ProxyPurchase) => p.proxyId)

  const now = new Date()
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000)

  // First try to find a proxy with more than 6 hours until expiry (sorted by expiry desc - freshest first)
  const freshProxy = await db
    .collection<Proxy>("proxies")
    .find({
      country,
      isActive: true,
      expiresAt: { $gt: sixHoursFromNow }, // More than 6 hours until expiry
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      _id: { $nin: purchasedProxyIds },
    })
    .sort({ expiresAt: -1 }) // Freshest first
    .limit(1)
    .toArray()

  if (freshProxy.length > 0) {
    return freshProxy[0]
  }

  // Fallback: If no fresh proxies, get any available proxy (even if <6 hours expiry)
  const anyProxy = await db
    .collection<Proxy>("proxies")
    .find({
      country,
      isActive: true,
      expiresAt: { $gt: now },
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      _id: { $nin: purchasedProxyIds },
    })
    .sort({ expiresAt: -1 }) // Still prefer ones with more time
    .limit(1)
    .toArray()

  return anyProxy.length > 0 ? anyProxy[0] : null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { country, duration, phoneNumber, paymentMethod } = await request.json()

    if (!country || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (paymentMethod === "mpesa" && !phoneNumber) {
      return NextResponse.json({ error: "Phone number required for M-Pesa payment" }, { status: 400 })
    }

    const db = await getDb()

    // Check pricing
    const pricing = await db.collection<Pricing>("pricing").findOne({ country, isEnabled: true })
    if (!pricing) {
      return NextResponse.json({ error: "Country not available" }, { status: 400 })
    }

    const availableProxy = await findAvailableProxy(db, country, session.user._id)

    if (!availableProxy) {
      return NextResponse.json(
        { error: "No new proxies available for this country. You may have already purchased all available proxies." },
        { status: 400 },
      )
    }

    const price = pricing.daily

    // Handle balance payment
    if (paymentMethod === "balance") {
      const user = await db.collection<User>("users").findOne({ _id: session.user._id })

      if (!user || (user.balance || 0) < price) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }

      // Deduct balance
      await db.collection<User>("users").updateOne({ _id: session.user._id }, { $inc: { balance: -price } })

      const proxy = await db.collection<Proxy>("proxies").findOneAndUpdate(
        {
          country,
          isActive: true,
          expiresAt: { $gt: new Date() },
          $expr: { $lt: ["$currentUsage", "$maxUsage"] },
          _id: availableProxy._id, // Use the specific proxy we found
        },
        { $inc: { currentUsage: 1 } },
        { returnDocument: "after" },
      )

      if (!proxy) {
        // Refund if no proxy available
        await db.collection<User>("users").updateOne({ _id: session.user._id }, { $inc: { balance: price } })
        return NextResponse.json({ error: "No proxies available" }, { status: 400 })
      }

      // Use the proxy's admin-set expiry date, not a calculated one
      const expiresAt = proxy.expiresAt

      const order: Order = {
        _id: new ObjectId(),
        userId: session.user._id,
        country,
        duration: "daily",
        price,
        paymentMethod: "balance",
        status: "paid",
        createdAt: new Date(),
        paidAt: new Date(),
      }

      await db.collection<Order>("orders").insertOne(order)

      const purchase: ProxyPurchase = {
        _id: new ObjectId(),
        userId: session.user._id,
        proxyId: proxy._id,
        orderId: order._id,
        proxy: {
          ip: proxy.ip,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
          country: proxy.country,
          countryCode: proxy.countryCode,
        },
        expiresAt,
        purchasedAt: new Date(),
      }

      await db.collection<ProxyPurchase>("purchases").insertOne(purchase)

      if (proxy.currentUsage >= proxy.maxUsage) {
        await db.collection<Proxy>("proxies").updateOne({ _id: proxy._id }, { $set: { isActive: false } })
      }

      return NextResponse.json({
        success: true,
        paid: true,
        order: {
          id: order._id.toString(),
          price,
          country,
          duration: "daily",
          expiresAt: expiresAt.toISOString(),
        },
      })
    }

    const order: Order = {
      _id: new ObjectId(),
      userId: session.user._id,
      country,
      duration: "daily",
      price,
      phoneNumber,
      paymentMethod: "mpesa",
      status: "pending",
      createdAt: new Date(),
      targetProxyId: availableProxy._id, // Store the proxy to assign later
    }

    await db.collection<Order>("orders").insertOne(order)

    return NextResponse.json({
      success: true,
      paid: false,
      order: {
        id: order._id.toString(),
        price,
        country,
        duration: "daily",
        expiresAt: availableProxy.expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
