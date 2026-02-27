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
    const pricing = await db
      .collection("emailPricing")
      .aggregate([
        {
          $lookup: {
            from: "emailDomains",
            localField: "domainId",
            foreignField: "_id",
            as: "domainData",
          },
        },
        { $unwind: "$domainData" },
      ])
      .toArray()

    return NextResponse.json({
      pricing: pricing.map((p) => ({
        id: p._id.toString(),
        domainId: p.domainId.toString(),
        domain: p.domainData.domain,
        pricePerEmail: p.pricePerEmail,
        isEnabled: p.isEnabled,
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching email pricing:", error)
    return NextResponse.json({ error: "Failed to fetch email pricing" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { domainId, pricePerEmail } = await request.json()

    if (!domainId || !pricePerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    // Check if pricing already exists for this domain
    const existing = await db.collection("emailPricing").findOne({
      domainId: new ObjectId(domainId),
    })

    if (existing) {
      return NextResponse.json(
        { error: "Pricing already exists for this domain" },
        { status: 400 }
      )
    }

    const result = await db.collection("emailPricing").insertOne({
      domainId: new ObjectId(domainId),
      pricePerEmail,
      isEnabled: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating email pricing:", error)
    return NextResponse.json({ error: "Failed to create email pricing" }, { status: 500 })
  }
}
