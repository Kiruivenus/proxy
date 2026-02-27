import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import type { Pricing } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()
    const pricing = await db.collection<Pricing>("pricing").find().toArray()

    return NextResponse.json({
      pricing: pricing.map((p) => ({
        id: p._id.toString(),
        country: p.country,
        countryCode: p.countryCode,
        daily: p.daily,
        isEnabled: p.isEnabled,
      })),
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Pricing fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { country, countryCode, daily } = await request.json()

    if (!country || !countryCode || !daily) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    const existing = await db.collection<Pricing>("pricing").findOne({ countryCode })
    if (existing) {
      await db.collection<Pricing>("pricing").updateOne({ countryCode }, { $set: { country, daily, isEnabled: true } })
    } else {
      const pricing: Pricing = {
        _id: new ObjectId(),
        country,
        countryCode,
        daily,
        isEnabled: true,
      }
      await db.collection<Pricing>("pricing").insertOne(pricing)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Pricing creation error:", error)
    return NextResponse.json({ error: "Failed to create pricing" }, { status: 500 })
  }
}
