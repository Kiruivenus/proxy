import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import type { Proxy } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()
    const proxies = await db.collection<Proxy>("proxies").find().sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      proxies: proxies.map((p) => ({
        id: p._id.toString(),
        ip: p.ip,
        port: p.port,
        username: p.username,
        password: p.password,
        country: p.country,
        countryCode: p.countryCode,
        maxUsage: p.maxUsage,
        currentUsage: p.currentUsage,
        expiresAt: p.expiresAt,
        isActive: p.isActive,
        status: p.status || "available",
        createdAt: p.createdAt,
      })),
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Admin proxies fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch proxies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { ip, port, username, password, country, countryCode, maxUsage, expiresAt } = await request.json()

    if (!ip || !port || !country || !countryCode || !maxUsage || !expiresAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    const expiryDate = new Date(expiresAt)
    const now = new Date()
    let status: "available" | "expired" | "dead" = "available"
    
    if (expiryDate <= now) {
      status = "expired"
    }

    const proxy: Proxy = {
      _id: new ObjectId(),
      ip,
      port,
      username,
      password,
      country,
      countryCode,
      maxUsage,
      currentUsage: 0,
      expiresAt: expiryDate,
      isActive: true,
      status,
      createdAt: new Date(),
    }

    await db.collection<Proxy>("proxies").insertOne(proxy)

    return NextResponse.json({ success: true, proxy: { id: proxy._id.toString() } })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Proxy creation error:", error)
    return NextResponse.json({ error: "Failed to create proxy" }, { status: 500 })
  }
}
