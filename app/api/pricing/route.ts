import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import type { Pricing } from "@/lib/types"

export async function GET() {
  try {
    const db = await getDb()
    const pricing = await db.collection<Pricing>("pricing").find({ isEnabled: true }).toArray()

    return NextResponse.json({
      pricing: pricing.map((p) => ({
        country: p.country,
        countryCode: p.countryCode,
        daily: p.daily,
      })),
    })
  } catch (error) {
    console.error("Pricing fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
  }
}
