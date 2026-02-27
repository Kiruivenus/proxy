import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { domainId, quantity, paymentMethod, phoneNumber } = await request.json()

    if (!domainId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (paymentMethod === "mpesa" && !phoneNumber) {
      return NextResponse.json({ error: "Phone number required for M-Pesa" }, { status: 400 })
    }

    const db = await getDb()

    // Get email pricing
    const pricing = await db.collection("emailPricing").findOne({
      domainId: new ObjectId(domainId),
      isEnabled: true,
    })

    if (!pricing) {
      return NextResponse.json({ error: "Pricing not found" }, { status: 404 })
    }

    // Get domain info
    const domain = await db.collection("emailDomains").findOne({
      _id: new ObjectId(domainId),
      isEnabled: true,
    })

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    const totalPrice = pricing.pricePerEmail * quantity

    if (paymentMethod === "balance") {
      // Get user
      const user = await db.collection("users").findOne({
        email: session.user.email,
      })

      if (!user || user.balance < totalPrice) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        )
      }

      // Get available emails
      const availableEmails = await db
        .collection("emails")
        .find({
          domainId: new ObjectId(domainId),
          status: "available",
        })
        .limit(quantity)
        .toArray()

      if (availableEmails.length < quantity) {
        return NextResponse.json(
          { error: `Only ${availableEmails.length} emails available` },
          { status: 400 }
        )
      }

      // Create order
      const order = await db.collection("emailOrders").insertOne({
        userId: user._id,
        domainId: new ObjectId(domainId),
        domain: domain.domain,
        quantity,
        pricePerEmail: pricing.pricePerEmail,
        totalPrice,
        paymentMethod: "balance",
        status: "paid",
        createdAt: new Date(),
        paidAt: new Date(),
      })

      // Update user balance
      await db.collection("users").updateOne(
        { _id: user._id },
        { $inc: { balance: -totalPrice } }
      )

      // Update emails to sold and create purchase record
      const emailIds = availableEmails.map((e) => e._id)
      await db.collection("emails").updateMany(
        { _id: { $in: emailIds } },
        { $set: { status: "sold" } }
      )

      // Create email purchase record
      await db.collection("emailPurchases").insertOne({
        userId: user._id,
        orderId: order.insertedId,
        emails: availableEmails.map((e) => ({
          emailAddress: e.emailAddress,
          password: e.password,
          domain: e.domain,
          server: e.server,
        })),
        quantity,
        domain: domain.domain,
        totalPrice,
        purchasedAt: new Date(),
      })

      return NextResponse.json({
        orderId: order.insertedId.toString(),
        success: true,
      })
    } else {
      // M-Pesa payment
      // Check availability first
      const availableEmails = await db
        .collection("emails")
        .find({
          domainId: new ObjectId(domainId),
          status: "available",
        })
        .limit(quantity)
        .toArray()

      if (availableEmails.length < quantity) {
        return NextResponse.json(
          { error: `Only ${availableEmails.length} emails available` },
          { status: 400 }
        )
      }

      // Get user ID
      const user = await db.collection("users").findOne({
        email: session.user.email,
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Create pending order
      const order = await db.collection("emailOrders").insertOne({
        userId: user._id,
        domainId: new ObjectId(domainId),
        domain: domain.domain,
        quantity,
        pricePerEmail: pricing.pricePerEmail,
        totalPrice,
        phoneNumber,
        paymentMethod: "mpesa",
        status: "pending",
        createdAt: new Date(),
      })

      return NextResponse.json({
        orderId: order.insertedId.toString(),
      })
    }
  } catch (error) {
    console.error("[v0] Error creating email order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
