import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireAuth()
    const db = await getDb()

    const userData = await db.collection("users").findOne({ _id: user._id })

    return NextResponse.json({
      balance: userData?.balance || 0,
    })
  } catch (error) {
    console.error("Fetch balance error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
