import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import type { Order } from "@/lib/types"

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()
    const orders = await db.collection<Order>("orders").find().sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o._id.toString(),
        userId: o.userId.toString(),
        country: o.country,
        duration: o.duration,
        price: o.price,
        phoneNumber: o.phoneNumber,
        status: o.status,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
      })),
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Admin orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
