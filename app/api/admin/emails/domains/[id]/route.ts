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

    const { domain, type, server } = await request.json()

    if (!domain || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    await db.collection("emailDomains").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          domain,
          type,
          server: type === "rayproxy" ? server : null,
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating email domain:", error)
    return NextResponse.json({ error: "Failed to update email domain" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const db = await getDb()
    const result = await db.collection("emailDomains").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting email domain:", error)
    return NextResponse.json({ error: "Failed to delete email domain" }, { status: 500 })
  }
}
