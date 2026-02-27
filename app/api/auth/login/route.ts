import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { verifyPassword, createSession, type User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    const user = await db.collection<User>("users").findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (user.isBanned) {
      return NextResponse.json({ error: "Your account has been suspended. Please contact support." }, { status: 403 })
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await createSession(user._id)

    return NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
