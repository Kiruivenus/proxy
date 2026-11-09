"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/ui/google-icon"

interface Order {
  id: string
  type?: "proxy" | "email"
  country?: string
  domain?: string
  quantity?: number
  duration?: string
  price: number
  status: string
  createdAt: string
  paidAt?: string
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "failed">("all")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/orders")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paid
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            Failed
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-full">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full capitalize">
            {status}
          </span>
        )
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return isoString
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true
    if (filter === "paid") return o.status === "paid" || o.status === "completed"
    if (filter === "pending") return o.status === "pending"
    if (filter === "failed") return o.status === "failed" || o.status === "cancelled"
    return true
  })

  const paidCount = orders.filter((o) => o.status === "paid" || o.status === "completed").length
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const failedCount = orders.filter((o) => o.status === "failed" || o.status === "cancelled").length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <GoogleIcon name="progress_activity" size={28} className="animate-spin text-emerald-500 mb-2" />
        <p className="text-xs text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${filter === "all"
              ? "bg-foreground text-background font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
        >
          All ({orders.length})
        </button>

        <button
          onClick={() => setFilter("paid")}
          className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${filter === "paid"
              ? "bg-emerald-500 text-black font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
        >
          Paid ({paidCount})
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${filter === "pending"
              ? "bg-amber-500 text-black font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
        >
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setFilter("failed")}
          className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${filter === "failed"
              ? "bg-red-500 text-white font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
        >
          Failed ({failedCount})
        </button>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/80 p-10 text-center">
          <GoogleIcon name="receipt_long" size={32} className="mx-auto text-muted-foreground/40 mb-2" />
          <h3 className="text-sm font-semibold text-foreground">No orders found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            {filter === "all"
              ? "You haven't placed any orders yet. Choose a proxy or email package to get started."
              : `No ${filter} orders found in your account.`}
          </p>
          {filter === "all" && (
            <Button size="sm" asChild className="mt-4 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
              <Link href="/buy">Buy Proxies</Link>
            </Button>
          )}
        </div>
      )}

      {/* Desktop View (Table layout for PC/Tablets >= md) */}
      {filteredOrders.length > 0 && (
        <div className="hidden md:block rounded-xl border border-border/80 overflow-hidden bg-secondary/10 dark:bg-zinc-900/20">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Plan / Quantity</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredOrders.map((order) => {
                const isEmail = order.type === "email"
                return (
                  <tr key={order.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${isEmail ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                            }`}
                        >
                          <GoogleIcon name={isEmail ? "mail" : "dns"} size={14} />
                        </div>
                        <span className="font-semibold text-foreground">
                          {isEmail ? order.domain || "Email Account" : order.country || "Proxy"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground capitalize">
                      {isEmail ? `${order.quantity || 1} Accounts` : order.duration || "Daily"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      KES {order.price?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">{getStatusBadge(order.status)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Smartphone Mobile View (Stacked card list, zero horizontal scroll) */}
      {filteredOrders.length > 0 && (
        <div className="md:hidden space-y-2.5">
          {filteredOrders.map((order) => {
            const isEmail = order.type === "email"
            return (
              <div
                key={order.id}
                className="p-3.5 rounded-xl border border-border/80 bg-secondary/30 dark:bg-zinc-900/40 space-y-2.5"
              >
                {/* Top Row: Service Type + Date on Left, Status Badge on Right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${isEmail ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}
                    >
                      <GoogleIcon name={isEmail ? "mail" : "dns"} size={13} />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Middle Row: Name / Country */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {isEmail ? order.domain || "Email Account" : order.country || "Proxy"}
                  </span>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {isEmail ? `${order.quantity || 1} Accounts` : order.duration || "Daily"}
                  </span>
                </div>

                {/* Bottom Row: Amount */}
                <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Amount Paid:</span>
                  <span className="text-xs font-mono font-extrabold text-foreground">
                    KES {order.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
