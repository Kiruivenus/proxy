import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import type { Proxy } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")
    const userIdParam = searchParams.get("userId")

    if (!country) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 })
    }

    const db = await getDb()

    // If userId is provided, get the actual proxy that would be selected for this user
    let selectedProxy = null
    if (userIdParam) {
      const { ObjectId } = await import("mongodb")
      const userId = new ObjectId(userIdParam)

      // Get all proxy IDs the user has already purchased (active purchases only)
      const userPurchases = await db
        .collection("purchases")
        .find({
          userId,
          expiresAt: { $gt: new Date() },
        })
        .toArray()

      const purchasedProxyIds = userPurchases.map((p: any) => p.proxyId)

      const now = new Date()
      const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000)

      // First try to find a proxy with more than 6 hours until expiry (sorted by expiry desc - freshest first)
      const freshProxy = await db
        .collection<Proxy>("proxies")
        .find({
          country,
          isActive: true,
          status: { $nin: ["expired", "dead"] },
          expiresAt: { $gt: sixHoursFromNow },
          $expr: { $lt: ["$currentUsage", "$maxUsage"] },
          _id: { $nin: purchasedProxyIds },
        })
        .sort({ expiresAt: -1 })
        .limit(1)
        .toArray()

      if (freshProxy.length > 0) {
        selectedProxy = freshProxy[0]
      } else {
        // Fallback: If no fresh proxies, get any available proxy
        const anyProxy = await db
          .collection<Proxy>("proxies")
          .find({
            country,
            isActive: true,
            status: { $nin: ["expired", "dead"] },
            expiresAt: { $gt: now },
            $expr: { $lt: ["$currentUsage", "$maxUsage"] },
            _id: { $nin: purchasedProxyIds },
          })
          .sort({ expiresAt: -1 })
          .limit(1)
          .toArray()

        if (anyProxy.length > 0) {
          selectedProxy = anyProxy[0]
        }
      }
    } else {
      // If no userId, just get the first available proxy
      const baseQuery: any = {
        country,
        isActive: true,
        status: { $nin: ["expired", "dead"] },
        expiresAt: { $gt: new Date() },
        $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      }

      selectedProxy = await db.collection<Proxy>("proxies").findOne(baseQuery)
    }

    const query: any = {
      isActive: true,
      status: { $nin: ["expired", "dead"] },
      expiresAt: { $gt: new Date() },
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      country,
    }

    const availableCount = await db.collection<Proxy>("proxies").countDocuments(query)

    let proxy = null
    if (selectedProxy) {
      proxy = {
        id: selectedProxy._id.toString(),
        country: selectedProxy.country,
        expiresAt: selectedProxy.expiresAt.toISOString(),
      }
    }

    return NextResponse.json({ available: availableCount > 0, count: availableCount, proxy })
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
