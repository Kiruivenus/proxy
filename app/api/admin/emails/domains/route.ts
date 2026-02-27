import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const db = await getDb()
    const domains = await db.collection("emailDomains").find({}).toArray()

    return NextResponse.json({
      domains: domains.map((d) => ({
        _id: d._id.toString(),
        domain: d.domain,
        type: d.type,
        server: d.server,
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching email domains:", error)
    return NextResponse.json({ error: "Failed to fetch email domains" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const result = await db.collection("emailDomains").insertOne({
      domain,
      type,
      server: type === "rayproxy" ? server : null,
      isEnabled: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating email domain:", error)
    return NextResponse.json({ error: "Failed to create email domain" }, { status: 500 })
  }
}
