"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Server, Eye, EyeOff, Copy, User, Lock, Network } from "lucide-react"

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
    status?: "available" | "expired" | "dead"
  }
  isExpired?: boolean
}

export function ProxyCard({ proxy, isExpired = false }: ProxyCardProps) {
  const { toast } = useToast()
  const [showCredentials, setShowCredentials] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const expiresAt = new Date(proxy.expiresAt)
  const now = new Date()
  const timeLeft = expiresAt.getTime() - now.getTime()

  let countdownText = ""
  if (timeLeft < 0 || proxy.status === "dead") {
    countdownText = "Expired"
  } else {
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    if (hoursLeft < 24) {
      countdownText = `Expires in ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}`
    } else {
      const daysLeft = Math.floor(hoursLeft / 24)
      countdownText = `Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
    }
  }

  const formatUTCDate = (date: Date) => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${day} ${months[date.getUTCMonth()]} ${year}, ${hours}:${minutes} UTC`
  }

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return "🌐"
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const handleCopy = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text)
    toast({
      description: `✓ ${fieldName} copied successfully`,
    })
  }

  const copyFullProxy = async () => {
    const fullProxyString = proxy.username && proxy.password
      ? `${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`
      : `${proxy.ip}:${proxy.port}`
    
    await navigator.clipboard.writeText(fullProxyString)
    toast({
      description: "✓ Proxy copied successfully",
    })
  }

  const isCardExpired = isExpired || proxy.status === "dead"

  return (
    <Card 
      className={`relative overflow-hidden bg-[#0a0a0c] backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-green-500/[0.02] hover:-translate-y-0.5 rounded-[20px] ${
        isCardExpired ? "opacity-60 border-red-500/10 hover:shadow-red-500/[0.01]" : "border-green-500/15 shadow-[0_0_30px_rgba(34,197,94,0.05)]"
      }`}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-white/[0.06] mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl select-none leading-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {getFlagEmoji(proxy.countryCode)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight leading-none">{proxy.country}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isCardExpired
                    ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                    : "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.05)]"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isCardExpired ? "bg-red-400" : "bg-green-400 animate-pulse"}`} />
                  {isCardExpired ? "Expired" : "Active"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5">Residential Proxy</p>
            </div>
          </div>

          <div className="text-right flex flex-col justify-center">
            <span className="text-xs font-semibold text-zinc-300 leading-none">
              {countdownText}
            </span>
            <span className="text-[11px] text-green-500 font-semibold font-mono mt-1.5">
              {formatUTCDate(expiresAt)}
            </span>
          </div>
        </div>

        {/* Credentials Grid (2x2) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Server */}
          <div className="relative flex items-center justify-between rounded-xl bg-[#0c0c0d] border border-white/[0.06] p-3 transition-all duration-200 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.02] text-zinc-400 flex-shrink-0">
                <Server className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Server</p>
                <p className="font-mono text-xs font-semibold text-white mt-0.5 truncate select-all">
                  {proxy.ip}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg flex-shrink-0"
              onClick={() => handleCopy(proxy.ip, "Server")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Port */}
          <div className="relative flex items-center justify-between rounded-xl bg-[#0c0c0d] border border-white/[0.06] p-3 transition-all duration-200 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.02] text-zinc-400 flex-shrink-0">
                <Network className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Port</p>
                <p className="font-mono text-xs font-semibold text-white mt-0.5 truncate select-all">
                  {proxy.port}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg flex-shrink-0"
              onClick={() => handleCopy(String(proxy.port), "Port")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Username */}
          <div className="relative flex items-center justify-between rounded-xl bg-[#0c0c0d] border border-white/[0.06] p-3 transition-all duration-200 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.02] text-zinc-400 flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Username</p>
                <p className="font-mono text-xs font-semibold text-white mt-0.5 truncate select-all">
                  {showCredentials ? (proxy.username || "4afb") : "4afb"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg flex-shrink-0"
              onClick={() => handleCopy(proxy.username || "4afb", "Username")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Password */}
          <div className="relative flex items-center justify-between rounded-xl bg-[#0c0c0d] border border-white/[0.06] p-3 transition-all duration-200 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.02] text-zinc-400 flex-shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Password</p>
                <p className="font-mono text-xs font-semibold text-white mt-0.5 select-all">
                  {showPassword || showCredentials ? (proxy.password || "4afb") : "••••"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                onClick={() => handleCopy(proxy.password || "4afb", "Password")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowCredentials(!showCredentials)
              if (showCredentials) setShowPassword(false)
            }}
            className="w-[38%] h-12 border-white/[0.08] bg-[#0c0c0d] hover:bg-white/[0.04] text-zinc-100 font-semibold text-xs rounded-xl transition-all duration-200"
          >
            {showCredentials ? (
              <span className="flex items-center gap-1.5 justify-center">
                <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                Hide Details
              </span>
            ) : (
              <span className="flex items-center gap-1.5 justify-center">
                <Eye className="h-3.5 w-3.5 text-zinc-400" />
                Show Details
              </span>
            )}
          </Button>

          <Button
            type="button"
            onClick={copyFullProxy}
            disabled={isCardExpired}
            className="flex-grow flex-shrink-0 w-[58%] h-12 bg-green-500/5 border border-green-500/30 hover:border-green-500 hover:bg-green-500/10 text-green-400 rounded-xl transition-all duration-200 disabled:opacity-40"
          >
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                <Copy className="h-3.5 w-3.5" />
                Copy Proxy
              </span>
              <span className="text-[9px] opacity-75 font-mono mt-1 text-green-400/90 font-medium">
                {proxy.username && proxy.password ? `${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}` : `${proxy.ip}:${proxy.port}`}
              </span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

