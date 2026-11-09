import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { restrictActionsIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictActionsIfExpired(user.role)
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })

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

    // Use already authenticated user
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If paying via wallet balance
    if (paymentMethod === "balance") {
      const userBalance = user.balance || 0
      if (userBalance < totalPrice) {
        return NextResponse.json({ error: "Insufficient balance. Please top up your wallet." }, { status: 400 })
      }

      // Deduct balance
      await db.collection("users").updateOne({ _id: user._id }, { $inc: { balance: -totalPrice } })

      // Assign emails to user
      const emailIds = availableEmails.map((e) => e._id)
      await db.collection("emails").updateMany(
        { _id: { $in: emailIds } },
        { $set: { status: "assigned", userId: user._id, assignedAt: new Date() } }
      )

      // Create completed order
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

      return NextResponse.json({
        orderId: order.insertedId.toString(),
        status: "paid",
      })
    }

    // M-Pesa payment: Create pending order
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
      status: "pending",
    })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("[v0] Error creating email order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
