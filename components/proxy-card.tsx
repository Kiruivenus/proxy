"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Globe, Clock, Eye, EyeOff } from "lucide-react"

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
  const [copied, setCopied] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)

  const expiresAt = new Date(proxy.expiresAt)
  const now = new Date()
  const timeLeft = expiresAt.getTime() - now.getTime()
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

  const proxyString =
    proxy.username && proxy.password
      ? `${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`
      : `${proxy.ip}:${proxy.port}`

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(proxyString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusColor = proxy.status === "dead" ? "bg-red-500/20 text-red-500" : isExpired ? "destructive" : "default"
  const statusLabel = proxy.status === "dead" ? "Dead" : isExpired ? "Expired" : "Active"

  return (
    <Card className={isExpired || proxy.status === "dead" ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-accent" />
          {proxy.country}
        </CardTitle>
        <Badge variant={statusColor === "destructive" ? "destructive" : "default"} className={statusColor}>
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">IP:Port</span>
            <code className="rounded bg-muted px-2 py-1 text-sm">
              {proxy.ip}:{proxy.port}
            </code>
          </div>

          {proxy.username && proxy.password && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {showCredentials ? proxy.username : "••••••"}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Password</span>
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {showCredentials ? proxy.password : "••••••"}
                </code>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expires (UTC)</span>
            <span className="flex items-center gap-1 text-sm font-medium">
              <Clock className="h-3 w-3" />
              {(() => {
                const year = expiresAt.getUTCFullYear()
                const month = String(expiresAt.getUTCMonth() + 1).padStart(2, "0")
                const day = String(expiresAt.getUTCDate()).padStart(2, "0")
                const hours = String(expiresAt.getUTCHours()).padStart(2, "0")
                const minutes = String(expiresAt.getUTCMinutes()).padStart(2, "0")
                return `${month}/${day}/${year} ${hours}:${minutes}`
              })()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {proxy.username && proxy.password && (
            <Button variant="outline" size="sm" onClick={() => setShowCredentials(!showCredentials)} className="flex-1">
              {showCredentials ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={isExpired}
            className="flex-1 bg-transparent"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
