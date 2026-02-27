import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const domains = await db.collection("emailDomains").find({ isEnabled: true }).toArray()

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
