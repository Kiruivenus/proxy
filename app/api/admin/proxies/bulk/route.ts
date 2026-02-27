import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import type { Proxy } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { proxies } = await request.json()

    if (!Array.isArray(proxies) || proxies.length === 0) {
      return NextResponse.json({ error: "Invalid proxies data" }, { status: 400 })
    }

    const db = await getDb()

    const proxyDocs: Proxy[] = proxies.map((p: any) => ({
      _id: new ObjectId(),
      ip: p.ip,
      port: Number.parseInt(p.port),
      username: p.username || undefined,
      password: p.password || undefined,
      country: p.country,
      countryCode: p.countryCode,
      maxUsage: Number.parseInt(p.maxUsage) || 10,
      currentUsage: 0,
      expiresAt: new Date(p.expiresAt),
      isActive: true,
      createdAt: new Date(),
    }))

    await db.collection<Proxy>("proxies").insertMany(proxyDocs)

    return NextResponse.json({ success: true, count: proxyDocs.length })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Bulk proxy creation error:", error)
    return NextResponse.json({ error: "Failed to create proxies" }, { status: 500 })
  }
}
