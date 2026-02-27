import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()

    const { id } = await params

    const db = await getDb()
    await db.collection("proxies").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Proxy deletion error:", error)
    return NextResponse.json({ error: "Failed to delete proxy" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()

    const { id } = await params
    const updates = await request.json()

    const db = await getDb()

    const allowedUpdates: Record<string, any> = {}
    if (updates.ip !== undefined) allowedUpdates.ip = updates.ip
    if (updates.port !== undefined) allowedUpdates.port = updates.port
    if (updates.username !== undefined) allowedUpdates.username = updates.username
    if (updates.password !== undefined) allowedUpdates.password = updates.password
    if (updates.isActive !== undefined) allowedUpdates.isActive = updates.isActive
    if (updates.maxUsage !== undefined) allowedUpdates.maxUsage = updates.maxUsage
    if (updates.expiresAt !== undefined) {
      const expiryDate = new Date(updates.expiresAt)
      const now = new Date()
      allowedUpdates.expiresAt = expiryDate
      // Auto-set status to expired if expiry date is in the past
      if (expiryDate <= now) {
        allowedUpdates.status = "expired"
      } else if (allowedUpdates.status !== "dead") {
        // Only reset to available if not manually set to dead
        allowedUpdates.status = "available"
      }
    }
    if (updates.status !== undefined && ["available", "expired", "dead"].includes(updates.status)) {
      allowedUpdates.status = updates.status
    }

    await db.collection("proxies").updateOne({ _id: new ObjectId(id) }, { $set: allowedUpdates })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Proxy update error:", error)
    return NextResponse.json({ error: "Failed to update proxy" }, { status: 500 })
  }
}
