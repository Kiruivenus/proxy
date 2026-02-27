"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyCard } from "@/components/proxy-card"
import { Loader2, Package, Clock, Mail, Copy, Eye, EyeOff, Server } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Proxy {
  id: string
  ip: string
  port: number
  username?: string
  password?: string
  country: string
  countryCode: string
  expiresAt: string
  purchasedAt: string
  isExpired: boolean
}

interface PurchasedEmail {
  id: string
  emailAddress: string
  password: string
  domain: string
  server?: string
  purchasedAt: string
}

export function DashboardTabs() {
  const [activeProxies, setActiveProxies] = useState<Proxy[]>([])
  const [expiredProxies, setExpiredProxies] = useState<Proxy[]>([])
  const [purchasedEmails, setPurchasedEmails] = useState<PurchasedEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds to catch expired proxies
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [activeRes, expiredRes, emailsRes] = await Promise.all([
        fetch("/api/user/proxies?type=active"),
        fetch("/api/user/proxies?type=expired"),
        fetch("/api/user/emails"),
      ])

      const activeData = await activeRes.json()
      const expiredData = await expiredRes.json()
      const emailsData = await emailsRes.json()

      setActiveProxies(activeData.proxies || [])
      setExpiredProxies(expiredData.proxies || [])
      setPurchasedEmails(emailsData.emails || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProxies = async () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full max-w-2xl grid-cols-3">
        <TabsTrigger value="active" className="gap-2">
          <Package className="h-4 w-4" />
          Active ({activeProxies.length})
        </TabsTrigger>
        <TabsTrigger value="expired" className="gap-2">
          <Clock className="h-4 w-4" />
          Expired ({expiredProxies.length})
        </TabsTrigger>
        <TabsTrigger value="emails" className="gap-2">
          <Mail className="h-4 w-4" />
          Emails ({purchasedEmails.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-6">
        {activeProxies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No active proxies</h3>
            <p className="mt-2 text-sm text-muted-foreground">Purchase a proxy to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeProxies.map((proxy) => (
              <ProxyCard key={proxy.id} proxy={proxy} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="expired" className="mt-6">
        {expiredProxies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No expired proxies</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your expired proxies will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expiredProxies.map((proxy) => (
              <ProxyCard key={proxy.id} proxy={proxy} isExpired />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="emails" className="mt-6">
        {purchasedEmails.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No purchased emails</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your purchased emails will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchasedEmails.map((email) => {
              const passwordVisible = visiblePasswords.has(email.id)
              const isCopied = copiedItem === email.id

              const handleCopy = (text: string, type: string) => {
                navigator.clipboard.writeText(text)
                setCopiedItem(`${email.id}-${type}`)
                setTimeout(() => setCopiedItem(null), 2000)
              }

              const togglePasswordVisibility = () => {
                setVisiblePasswords((prev) => {
                  const newSet = new Set(prev)
                  if (newSet.has(email.id)) {
                    newSet.delete(email.id)
                  } else {
                    newSet.add(email.id)
                  }
                  return newSet
                })
              }

              return (
                <Card key={email.id} className="overflow-hidden border-l-4 border-l-accent">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Email Address */}
                      <div className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                          <p className="font-semibold text-sm break-all">{email.emailAddress}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(email.emailAddress, "email")}
                          className="flex-shrink-0"
                          title="Copy email address"
                        >
                          <Copy className={`h-4 w-4 ${copiedItem === `${email.id}-email` ? "text-accent" : ""}`} />
                        </Button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Password</p>
                          <p className="font-semibold text-sm font-mono">
                            {passwordVisible ? email.password : "•".repeat(email.password.length)}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePasswordVisibility}
                            title="Toggle password visibility"
                          >
                            {passwordVisible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(email.password, "password")}
                            title="Copy password"
                          >
                            <Copy className={`h-4 w-4 ${copiedItem === `${email.id}-password` ? "text-accent" : ""}`} />
                          </Button>
                        </div>
                      </div>

                      {/* Server Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Domain</p>
                          <p className="font-medium text-sm">{email.domain}</p>
                        </div>
                        {email.server && (
                          <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">Server</p>
                              <p className="font-mono text-xs break-all">{email.server}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(email.server || "", "server")}
                              className="flex-shrink-0"
                              title="Copy server"
                            >
                              <Copy className={`h-4 w-4 ${copiedItem === `${email.id}-server` ? "text-accent" : ""}`} />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Purchase Date */}
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Purchased (UTC):{" "}
                        {(() => {
                          const date = new Date(email.purchasedAt)
                          const year = date.getUTCFullYear()
                          const month = String(date.getUTCMonth() + 1).padStart(2, "0")
                          const day = String(date.getUTCDate()).padStart(2, "0")
                          const hours = String(date.getUTCHours()).padStart(2, "0")
                          const minutes = String(date.getUTCMinutes()).padStart(2, "0")
                          return `${month}/${day}/${year} at ${hours}:${minutes}`
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
