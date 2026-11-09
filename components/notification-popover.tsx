"use client"

import * as React from "react"
import { GoogleIcon } from "@/components/ui/google-icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface NotificationItem {
  id: string
  title: string
  message: string
  createdAt: string
  icon: string
  color: string
  href: string
  category?: string
  unread?: boolean
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Math.max(0, Date.now() - new Date(dateString).getTime())
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return "Recently"
  }
}

const STORAGE_KEY = "rayproxy_read_notifications"

export function NotificationPopover({ className }: { className?: string }) {
  const router = useRouter()
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [readIds, setReadIds] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)

  // Load read IDs from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setReadIds(JSON.parse(stored))
      }
    } catch {}
  }, [])

  // Fetch real notifications from API
  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications)
        }
      }
    } catch (e) {
      console.error("Failed to load notifications:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchNotifications()
    // Poll every 45s for fresh transactions
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const itemsWithReadState = React.useMemo(() => {
    return notifications.map((n) => ({
      ...n,
      unread: !readIds.includes(n.id),
      time: formatRelativeTime(n.createdAt),
    }))
  }, [notifications, readIds])

  const unreadCount = itemsWithReadState.filter((n) => n.unread).length

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id)
    setReadIds(allIds)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds))
    } catch {}
  }

  const handleNotificationClick = (item: NotificationItem) => {
    if (!readIds.includes(item.id)) {
      const updated = [...readIds, item.id]
      setReadIds(updated)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {}
    }
    if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative h-8 w-8 rounded-full border border-border/60 bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-200 flex items-center justify-center shrink-0 outline-none hover:ring-2 hover:ring-blue-500/20 ${
            className || ""
          }`}
          title="Notifications"
          aria-label="View notifications"
        >
          <GoogleIcon name="notifications" size={16} className="text-muted-foreground hover:text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center leading-none ring-2 ring-background shadow-sm animate-in fade-in zoom-in duration-200">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-88 p-0 text-xs shadow-2xl border border-border bg-popover z-50">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/60 bg-secondary/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 ? (
              <span className="text-[10px] font-semibold bg-blue-600/15 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">All caught up</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <GoogleIcon name="progress_activity" size={20} className="animate-spin text-muted-foreground" />
              <span className="text-xs">Loading activity...</span>
            </div>
          ) : itemsWithReadState.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-1.5">
              <GoogleIcon name="notifications_off" size={26} className="text-muted-foreground/60" />
              <p className="font-medium text-xs text-foreground mt-1">No notifications yet</p>
              <p className="text-[11px]">Recent orders and wallet top-ups will appear here.</p>
            </div>
          ) : (
            itemsWithReadState.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start gap-2.5 p-3 cursor-pointer outline-none transition-colors ${
                  item.unread ? "bg-blue-500/5 hover:bg-blue-500/10" : "hover:bg-accent/40 opacity-85"
                }`}
              >
                <div className="mt-0.5 shrink-0 rounded-full p-1 bg-secondary border border-border/50">
                  <GoogleIcon name={item.icon} size={15} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className={`text-xs truncate ${item.unread ? "font-bold text-foreground" : "font-medium text-foreground/90"}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {item.message}
                  </p>
                </div>
                {item.unread && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

        <div className="border-t border-border/60 p-2 text-center bg-secondary/20">
          <Link
            href="/dashboard/orders"
            className="text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors inline-flex items-center gap-1"
          >
            <span>View Full Order History</span>
            <GoogleIcon name="arrow_forward" size={12} />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
