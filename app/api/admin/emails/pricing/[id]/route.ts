import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { pricePerEmail } = await request.json()

    if (!pricePerEmail) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 })
    }

    const db = await getDb()
    await db.collection("emailPricing").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          pricePerEmail,
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating email pricing:", error)
    return NextResponse.json({ error: "Failed to update email pricing" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const db = await getDb()
    const result = await db.collection("emailPricing").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Pricing not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting email pricing:", error)
    return NextResponse.json({ error: "Failed to delete email pricing" }, { status: 500 })
  }
}
