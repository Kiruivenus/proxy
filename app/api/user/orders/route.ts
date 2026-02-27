import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import type { Order } from "@/lib/types"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    const orders = await db
      .collection<Order>("orders")
      .find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o._id.toString(),
        country: o.country,
        duration: o.duration,
        price: o.price,
        status: o.status,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
      })),
    })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
