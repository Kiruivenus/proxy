import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()

    const { id } = await params
    const updates = await request.json()

    const db = await getDb()

    await db.collection("pricing").updateOne({ _id: new ObjectId(id) }, { $set: updates })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Pricing update error:", error)
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()

    const { id } = await params

    const db = await getDb()
    await db.collection("pricing").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Pricing deletion error:", error)
    return NextResponse.json({ error: "Failed to delete pricing" }, { status: 500 })
  }
}
