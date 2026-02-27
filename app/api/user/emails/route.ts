import { getSession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get user
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all email purchases for this user
    const emailPurchases = await db
      .collection("emailPurchases")
      .find({ userId: user._id })
      .sort({ purchasedAt: -1 })
      .toArray()

    // Flatten all emails from purchases with purchase date
    const emails = emailPurchases.flatMap((purchase) =>
      purchase.emails.map((email: any, index: number) => ({
        id: `${purchase._id.toString()}-${index}`,
        ...email,
        purchasedAt: purchase.purchasedAt,
      }))
    )

    return NextResponse.json({ emails })
  } catch (error) {
    console.error("Failed to fetch user emails:", error)
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    )
  }
}
