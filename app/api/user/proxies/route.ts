import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import type { ProxyPurchase } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "active"

    const db = await getDb()
    const now = new Date()

    // Auto-update proxy statuses that have expired
    await db.collection("proxies").updateMany(
      {
        status: "available",
        expiresAt: { $lte: now },
      },
      {
        $set: { status: "expired" },
      }
    )

    const query: any = { userId: session.user._id }

    if (type === "active") {
      query.expiresAt = { $gt: now }
    } else if (type === "expired") {
      query.expiresAt = { $lte: now }
    }

    const purchases = await db.collection<ProxyPurchase>("purchases").find(query).sort({ purchasedAt: -1 }).toArray()

    // Get proxy statuses
    const proxyIds = purchases.map((p) => p._id)
    const proxyStatuses = await db
      .collection("proxies")
      .find({ _id: { $in: purchases.map((p: any) => p._id) } })
      .toArray()
    const statusMap = new Map(proxyStatuses.map((p: any) => [p._id.toString(), p.status || "available"]))

    return NextResponse.json({
      proxies: purchases.map((p) => ({
        id: p._id.toString(),
        ip: p.proxy.ip,
        port: p.proxy.port,
        username: p.proxy.username,
        password: p.proxy.password,
        country: p.proxy.country,
        countryCode: p.proxy.countryCode,
        expiresAt: p.expiresAt,
        purchasedAt: p.purchasedAt,
        isExpired: p.expiresAt <= now,
        status: statusMap.get(p._id.toString()) || "available",
      })),
    })
  } catch (error) {
    console.error("Proxies fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch proxies" }, { status: 500 })
  }
}
