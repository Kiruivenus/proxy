import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { TopUp } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { amount, phoneNumber } = await request.json()

    if (!amount || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount < 10) {
      return NextResponse.json({ error: "Minimum top-up amount is KES 10" }, { status: 400 })
    }

    const db = await getDb()

    const topUp: TopUp = {
      _id: new ObjectId(),
      userId: user._id,
      amount,
      phoneNumber,
      status: "pending",
      createdAt: new Date(),
    }

    await db.collection<TopUp>("topups").insertOne(topUp)

    return NextResponse.json({
      success: true,
      topUp: {
        id: topUp._id.toString(),
        amount: topUp.amount,
      },
    })
  } catch (error) {
    console.error("Create top-up error:", error)
    return NextResponse.json({ error: "Failed to create top-up" }, { status: 500 })
  }
}
