import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()

    // Get all email domains
    const domains = await db.collection("emailDomains").find({ isEnabled: true }).toArray()

    // Count available emails for each domain
    const available = await Promise.all(
      domains.map(async (domain) => {
        const count = await db.collection("emails").countDocuments({
          domainId: domain._id,
          status: "available",
        })
        return {
          domainId: domain._id.toString(),
          count,
        }
      })
    )

    return NextResponse.json({ available })
  } catch (error) {
    console.error("Failed to fetch available emails:", error)
    return NextResponse.json(
      { error: "Failed to fetch available emails" },
      { status: 500 }
    )
  }
}
