import { getClientPromise } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

function generateResetCode(): string {
  return Math.random().toString().substring(2, 8)
}

async function sendResetEmail(email: string, code: string): Promise<boolean> {
  // Using Resend email service (free tier available)
  // You can replace this with your preferred email service
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "noreply@raypoxyhub.com",
        to: email,
        subject: "RayProxy Hub - Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>We received a request to reset your password. Use the code below to proceed:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; color: #007bff; margin: 0; letter-spacing: 5px;">${code}</p>
            </div>
            <p style="color: #666; font-size: 14px;">This code expires in 30 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} RayProxy Hub. All rights reserved.</p>
          </div>
        `,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Email send error:", error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, code, password, action } = body

    if (!email || !action) {
      return NextResponse.json({ error: "Email and action are required" }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db("raypoxy")
    const usersCollection = db.collection("users")

    // Step 1: Send reset code
    if (action === "send-code") {
      const user = await usersCollection.findOne({ email })

      if (!user) {
        return NextResponse.json({ error: "User not found. Please check your email address." }, { status: 404 })
      }

      const resetCode = generateResetCode()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            resetCode: resetCode,
            resetCodeExpires: expiresAt,
          },
        }
      )

      const emailSent = await sendResetEmail(email, resetCode)

      if (!emailSent) {
        return NextResponse.json(
          { error: "Failed to send reset code. Please try again later." },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 2: Verify reset code
    if (action === "verify-code") {
      const user = await usersCollection.findOne({ email })

      if (!user || !user.resetCode) {
        return NextResponse.json({ error: "Invalid reset code" }, { status: 400 })
      }

      if (user.resetCode !== code) {
        return NextResponse.json({ error: "Invalid reset code" }, { status: 400 })
      }

      if (new Date() > new Date(user.resetCodeExpires)) {
        return NextResponse.json({ error: "Reset code has expired" }, { status: 400 })
      }

      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 3: Reset password
    if (action === "reset-password") {
      if (!password || password.length < 6 || !code) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
      }

      const user = await usersCollection.findOne({ email })

      if (!user || user.resetCode !== code) {
        return NextResponse.json({ error: "Invalid reset request" }, { status: 400 })
      }

      if (new Date() > new Date(user.resetCodeExpires)) {
        return NextResponse.json({ error: "Reset code has expired" }, { status: 400 })
      }

      const hashedPassword = await hashPassword(password)

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            resetCode: null,
            resetCodeExpires: null,
          },
        }
      )

      return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
