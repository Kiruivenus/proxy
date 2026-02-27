import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin, type User } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    await requireAdmin()
    const db = await getDb()

    const users = await db.collection<User>("users").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        balance: u.balance || 0,
        isBanned: u.isBanned || false,
        createdAt: u.createdAt,
      })),
    })
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    if (action === "ban") {
      await db.collection<User>("users").updateOne({ _id: new ObjectId(userId) }, { $set: { isBanned: true } })
      // Also destroy all sessions for this user
      await db.collection("sessions").deleteMany({ userId: new ObjectId(userId) })
    } else if (action === "unban") {
      await db.collection<User>("users").updateOne({ _id: new ObjectId(userId) }, { $set: { isBanned: false } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
