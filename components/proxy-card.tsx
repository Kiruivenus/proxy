"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { GoogleIcon } from "@/components/ui/google-icon"

interface ProxyCardProps {
  proxy: {
    id: string
    ip: string
    port: number
    username?: string
    password?: string
    country: string
    countryCode: string
    expiresAt: string
    purchasedAt: string
    status?: "available" | "expired" | "dead" | "refunded"
    refundAmount?: number
    type?: string
    protocol?: string
  }
  isExpired?: boolean
}

export function ProxyCard({ proxy, isExpired = false }: ProxyCardProps) {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [flagFailed, setFlagFailed] = useState(false)
  const [copied, setCopied] = useState(false)

  // Note management (persisted in localStorage)
  const noteStorageKey = `proxy_note_${proxy.id}`
  const [note, setNote] = useState<string>("")
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [tempNote, setTempNote] = useState<string>("")

  useEffect(() => {
    try {
      const savedNote = localStorage.getItem(noteStorageKey)
      if (savedNote) {
        setNote(savedNote)
      }
    } catch {}
  }, [noteStorageKey])

  const saveNote = () => {
    setNote(tempNote)
    setIsEditingNote(false)
    try {
      if (tempNote.trim()) {
        localStorage.setItem(noteStorageKey, tempNote.trim())
      } else {
        localStorage.removeItem(noteStorageKey)
      }
    } catch {}
    toast({ description: "Note saved successfully" })
  }

  const getIso2 = (countryCode: string): string => {
    if (!countryCode) return "US"
    const code = countryCode.trim().toUpperCase()
    const iso3ToIso2: Record<string, string> = {
      USA: "US", KEN: "KE", GBR: "GB", CAN: "CA", DEU: "DE", FRA: "FR",
      ITA: "IT", ESP: "ES", JPN: "JP", CHN: "CN", IND: "IN", AUS: "AU",
      BRA: "BR", RUS: "RU", ZAF: "ZA", NGA: "NG", RWA: "RW", UGA: "UG",
      TZA: "TZ", BDI: "BI", ETH: "ET", SSD: "SS", SDN: "SD", SOM: "SO", EGY: "EG",
    }
    if (code.length === 3 && iso3ToIso2[code]) return iso3ToIso2[code]
    return code.slice(0, 2)
  }

  const iso2 = getIso2(proxy.countryCode)

  const formatExpiresUTC = (dateString: string): string => {
    try {
      const d = new Date(dateString)
      const day = String(d.getUTCDate()).padStart(2, "0")
      const month = String(d.getUTCMonth() + 1).padStart(2, "0")
      const year = d.getUTCFullYear()
      const hours = String(d.getUTCHours()).padStart(2, "0")
      const minutes = String(d.getUTCMinutes()).padStart(2, "0")
      return `${day}/${month}/${year} ${hours}:${minutes} UTC`
    } catch {
      return "N/A"
    }
  }

  const formatPurchasedAgo = (dateString: string): string => {
    try {
      const diff = Math.max(0, Date.now() - new Date(dateString).getTime())
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours < 1) return "Just now"
      if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
      const days = Math.floor(hours / 24)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    } catch {
      return "Recently"
    }
  }

  const isCardExpired = isExpired || proxy.status === "dead" || new Date(proxy.expiresAt).getTime() <= Date.now()
  const isRefunded = proxy.status === "refunded"

  const username = proxy.username || "user"
  const password = proxy.password || "pass"
  const maskedPassword = showPassword ? password : "••••••••"

  // Unified proxy connection string
  const fullProxyString = proxy.username && proxy.password
    ? `${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`
    : `${proxy.ip}:${proxy.port}`

  const maskedDisplayString = proxy.username && proxy.password
    ? `${username}:${maskedPassword}@${proxy.ip}:${proxy.port}`
    : `${proxy.ip}:${proxy.port}`

  const copyFullProxy = async () => {
    try {
      await navigator.clipboard.writeText(fullProxyString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        description: "✓ Proxy copied to clipboard",
      })
    } catch {
      toast({
        description: "Failed to copy proxy string",
        variant: "destructive",
      })
    }
  }

  // Short ID tag (e.g. #5147)
  const shortId = proxy.id ? `#${proxy.id.slice(-4).toUpperCase()}` : "#5147"

  return (
    <div className="rounded-2xl border border-border dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] hover:border-border/80 dark:hover:border-zinc-700/80 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between shadow-xs text-card-foreground">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {!flagFailed ? (
            <img
              src={`https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`}
              width="22"
              height="16"
              alt={proxy.country}
              className="rounded-xs object-cover border border-border shrink-0"
              onError={() => setFlagFailed(true)}
            />
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">
              {iso2}
            </span>
          )}

          <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate">
            {proxy.country}
          </h3>

          <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded tracking-wide uppercase shrink-0">
            {proxy.type || "FB MARKET"}
          </span>

          <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/80 dark:text-zinc-300 bg-secondary border border-border px-2 py-0.5 rounded tracking-wide uppercase shrink-0">
            {proxy.protocol || "BOTH"}
          </span>
        </div>

        {/* Status Badge Pill */}
        <div className="shrink-0">
          {isRefunded ? (
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-500 font-semibold px-3 py-1 rounded-full text-xs">
              Refunded (KES {proxy.refundAmount || 90})
            </span>
          ) : isCardExpired ? (
            <span className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Expired
            </span>
          ) : (
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>

      {/* Connection String Box with Eye Toggle & Copy Button */}
      <div className="rounded-xl bg-secondary/50 dark:bg-[#080b0f] border border-border dark:border-zinc-800/90 px-3 py-2 sm:py-2.5 flex items-center justify-between gap-2 my-3.5 shadow-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            onClick={copyFullProxy}
            className="font-mono text-xs sm:text-[13px] text-foreground dark:text-zinc-200 select-all truncate cursor-pointer hover:text-blue-600 dark:hover:text-white transition-colors"
            title="Click to copy full connection string"
          >
            {maskedDisplayString}
          </span>

          {proxy.password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors shrink-0"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <GoogleIcon name={showPassword ? "visibility_off" : "visibility"} size={16} />
            </button>
          )}
        </div>

        {/* Prominent Blue Copy Button */}
        <button
          type="button"
          onClick={copyFullProxy}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95"
          title="Copy full proxy"
        >
          <GoogleIcon name={copied ? "check" : "content_copy"} size={14} />
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Note Section */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        {isEditingNote ? (
          <div className="flex items-center gap-2 flex-1 mr-2">
            <input
              type="text"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Enter note (e.g. Account #1, FB Profile...)"
              className="bg-background border border-border text-foreground text-xs rounded px-2 py-1 flex-1 outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNote()
                if (e.key === "Escape") setIsEditingNote(false)
              }}
            />
            <button
              onClick={saveNote}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingNote(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            <GoogleIcon name="description" size={14} className="text-muted-foreground shrink-0" />
            {note ? (
              <span className="text-foreground text-xs truncate max-w-[260px] font-medium">{note}</span>
            ) : (
              <span className="italic text-muted-foreground text-xs">No note added</span>
            )}
          </div>
        )}

        {!isEditingNote && (
          <button
            type="button"
            onClick={() => {
              setTempNote(note)
              setIsEditingNote(true)
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium text-xs flex items-center gap-0.5 transition-colors shrink-0 ml-2"
          >
            {note ? "Edit Note" : "+ Note"}
          </button>
        )}
      </div>

      {/* Subtle Divider */}
      <div className="border-t border-border dark:border-zinc-800/80 my-3" />

      {/* Bottom Meta Row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded">
            {shortId}
          </span>
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground">
            <GoogleIcon name="schedule" size={13} className="text-blue-600 dark:text-blue-400" />
            <span>Purchased {formatPurchasedAgo(proxy.purchasedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground">
          <GoogleIcon name="schedule" size={13} className="text-muted-foreground" />
          <span>Expires: {formatExpiresUTC(proxy.expiresAt)}</span>
        </div>
      </div>
    </div>
  )
}
