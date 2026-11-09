import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ notifications: [] })
    }

    const db = await getDb()
    const userId = session.user._id
    const isAdmin = session.user.role === "admin" || session.user.role === "superadmin"

    // 1. Fetch user's recent proxy orders
    const userProxyOrders = await db
      .collection("orders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray()

    // 2. Fetch user's recent email orders
    const userEmailOrders = await db
      .collection("emailOrders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(4)
      .toArray()

    // 3. Fetch user's recent topups
    const userTopups = await db
      .collection("topups")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // 4. If admin, also fetch recent store orders from other users & inventory count
    let adminStoreOrders: any[] = []
    let proxyCount = 0
    if (isAdmin) {
      adminStoreOrders = await db
        .collection("orders")
        .find({ userId: { $ne: userId } })
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray()

      try {
        proxyCount = await db.collection("proxies").countDocuments({ status: "available", isActive: true })
      } catch {
        proxyCount = 0
      }
    }

    const items: Array<{
      id: string
      title: string
      message: string
      createdAt: string
      icon: string
      color: string
      href: string
      category: "order" | "topup" | "system" | "admin"
    }> = []

    // Convert proxy orders to notifications
    for (const o of userProxyOrders) {
      const isPaid = o.status === "paid"
      const isFailed = o.status === "failed" || o.status === "cancelled"
      items.push({
        id: `proxy_${o._id.toString()}`,
        title: isPaid
          ? `Proxy Activated: ${o.country}`
          : isFailed
          ? `Proxy Order Failed: ${o.country}`
          : `Proxy Order Pending: ${o.country}`,
        message: isPaid
          ? `Daily proxy for ${o.country} is ready. KES ${o.price} paid.`
          : isFailed
          ? `Payment of KES ${o.price} for ${o.country} was not completed.`
          : `Awaiting payment confirmation of KES ${o.price} for ${o.country}.`,
        createdAt: (o.createdAt || new Date()).toISOString(),
        icon: isPaid ? "verified" : isFailed ? "cancel" : "pending",
        color: isPaid ? "text-emerald-500" : isFailed ? "text-red-500" : "text-amber-500",
        href: isPaid ? "/dashboard" : "/dashboard/orders",
        category: "order",
      })
    }

    // Convert email orders
    for (const e of userEmailOrders) {
      const isPaid = e.status === "paid"
      items.push({
        id: `email_${e._id.toString()}`,
        title: isPaid ? `Email Accounts Ready: ${e.domain}` : `Email Order: ${e.domain}`,
        message: isPaid
          ? `${e.quantity} account(s) on ${e.domain} delivered. KES ${e.totalPrice || e.price} paid.`
          : `Order for ${e.quantity} account(s) on ${e.domain} (${e.status}).`,
        createdAt: (e.createdAt || new Date()).toISOString(),
        icon: isPaid ? "mail" : "schedule",
        color: isPaid ? "text-emerald-500" : "text-amber-500",
        href: "/dashboard/orders",
        category: "order",
      })
    }

    // Convert topups
    for (const t of userTopups) {
      const isCompleted = t.status === "completed"
      const isFailed = t.status === "failed"
      items.push({
        id: `topup_${t._id.toString()}`,
        title: isCompleted
          ? `Wallet Credited: KES ${t.amount}`
          : isFailed
          ? `Top-Up Failed: KES ${t.amount}`
          : `Top-Up Processing: KES ${t.amount}`,
        message: isCompleted
          ? `M-Pesa payment confirmed. Your balance was updated.`
          : isFailed
          ? `M-Pesa transaction of KES ${t.amount} was unsuccessful.`
          : `STK push sent to your phone. Awaiting M-Pesa PIN confirmation.`,
        createdAt: (t.createdAt || new Date()).toISOString(),
        icon: isCompleted ? "account_balance_wallet" : isFailed ? "error" : "sync",
        color: isCompleted ? "text-emerald-500" : isFailed ? "text-red-500" : "text-amber-500",
        href: "/topup",
        category: "topup",
      })
    }

    // Admin notifications
    if (isAdmin) {
      for (const ao of adminStoreOrders) {
        items.push({
          id: `admin_order_${ao._id.toString()}`,
          title: `Store Order: ${ao.country}`,
          message: `Customer purchased ${ao.country} proxy for KES ${ao.price} (${ao.status}).`,
          createdAt: (ao.createdAt || new Date()).toISOString(),
          icon: "storefront",
          color: "text-blue-500",
          href: "/admin",
          category: "admin",
        })
      }

      if (proxyCount > 0) {
        items.push({
          id: "admin_proxy_pool_status",
          title: "Proxy Inventory",
          message: `${proxyCount.toLocaleString()} proxies active in pool.`,
          createdAt: new Date().toISOString(),
          icon: "dns",
          color: "text-emerald-500",
          href: "/admin",
          category: "system",
        })
      }
    }

    // If user has no orders or transactions yet
    if (items.length === 0) {
      items.push({
        id: "welcome_notification",
        title: "Welcome to RayProxy Hub!",
        message: "Your account is ready. Top up your balance via M-Pesa to start activating proxies.",
        createdAt: new Date().toISOString(),
        icon: "celebration",
        color: "text-emerald-500",
        href: "/topup",
        category: "system",
      })
    }

    // Sort descending by createdAt
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ notifications: items.slice(0, 15) })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ notifications: [] })
  }
}

