import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hashPassword, createSession, type User } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    const existingUser = await db.collection<User>("users").findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user: User = {
      _id: new ObjectId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: "user",
      balance: 0,
      isBanned: false,
      createdAt: new Date(),
    }

    await db.collection<User>("users").insertOne(user)
    await createSession(user._id)

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
