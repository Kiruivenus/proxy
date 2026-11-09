"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyCard } from "@/components/proxy-card"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/ui/google-icon"

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
  status?: "available" | "expired" | "dead"
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
  const router = useRouter()
  const { toast } = useToast()
  const [activeProxies, setActiveProxies] = useState<Proxy[]>([])
  const [expiredProxies, setExpiredProxies] = useState<Proxy[]>([])
  const [purchasedEmails, setPurchasedEmails] = useState<PurchasedEmail[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [activeRes, expiredRes, emailsRes, balanceRes] = await Promise.all([
        fetch("/api/user/proxies?type=active"),
        fetch("/api/user/proxies?type=expired"),
        fetch("/api/user/emails"),
        fetch("/api/user/balance"),
      ])

      const activeData = await activeRes.json()
      const expiredData = await expiredRes.json()
      const emailsData = await emailsRes.json()
      const balanceData = await balanceRes.json()

      setActiveProxies(activeData.proxies || [])
      setExpiredProxies(expiredData.proxies || [])
      setPurchasedEmails(emailsData.emails || [])
      setBalance(balanceData.balance || 0)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text)
    toast({
      description: `✓ ${fieldName} copied successfully`,
    })
  }

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatUTCDate = (date: Date) => {
    const year = date.getUTCFullYear()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[date.getUTCMonth()]
    const day = String(date.getUTCDate()).padStart(2, "0")
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    return `${day} ${month} ${year}, ${hours}:${minutes} UTC`
  }

  const uniqueCountriesCount = new Set(activeProxies.map((p) => p.countryCode || p.country)).size

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-emerald-400">
        <GoogleIcon name="progress_activity" size={24} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-3.5">
      {/* Compact Statistics Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Active Proxies */}
        <div className="bg-card border border-border rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 min-w-0 transition-colors shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            <GoogleIcon name="inventory_2" size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
              Active Proxies
            </p>
            <h3 className="text-xs sm:text-sm font-bold text-foreground mt-1 leading-none">
              {activeProxies.length}
            </h3>
            <p className="text-[9px] text-muted-foreground mt-1 leading-none truncate hidden sm:block">
              Running proxies
            </p>
          </div>
        </div>

        {/* Countries */}
        <div className="bg-card border border-border rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 min-w-0 transition-colors shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20 flex-shrink-0">
            <GoogleIcon name="public" size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
              Countries
            </p>
            <h3 className="text-xs sm:text-sm font-bold text-foreground mt-1 leading-none">
              {uniqueCountriesCount}
            </h3>
            <p className="text-[9px] text-muted-foreground mt-1 leading-none truncate hidden sm:block">
              Geolocations
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-card border border-border rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 min-w-0 transition-colors shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 flex-shrink-0">
            <GoogleIcon name="account_balance_wallet" size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
              Balance
            </p>
            <h3 className="text-xs sm:text-sm font-bold text-foreground mt-1 leading-none truncate">
              KES {balance.toFixed(2)}
            </h3>
            <p className="text-[9px] text-muted-foreground mt-1 leading-none truncate hidden sm:block">
              Available funds
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-secondary/60 border border-border rounded-lg p-0.5 h-9 mb-4">
          <TabsTrigger
            value="active"
            className="flex items-center justify-center gap-1.5 h-full rounded-md text-xs font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            <GoogleIcon name="inventory_2" size={14} />
            <span>Active ({activeProxies.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="flex items-center justify-center gap-1.5 h-full rounded-md text-xs font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            <GoogleIcon name="schedule" size={14} />
            <span>Expired ({expiredProxies.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="emails"
            className="flex items-center justify-center gap-1.5 h-full rounded-md text-xs font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            <GoogleIcon name="mail" size={14} />
            <span>Emails ({purchasedEmails.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Active Proxies Tab */}
        <TabsContent value="active" className="mt-0 outline-none">
          {activeProxies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 py-8 text-center shadow-xs">
              <GoogleIcon name="dns" size={24} className="text-muted-foreground mb-1.5" />
              <h3 className="text-xs font-semibold text-foreground">No Active Proxies</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground max-w-xs mx-auto">
                Purchase a residential proxy package to get started.
              </p>
              <Button
                onClick={() => router.push("/buy")}
                size="sm"
                className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs h-7 px-3.5 rounded-md"
              >
                Browse Proxies
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-3.5 grid-cols-1 md:grid-cols-2">
              {activeProxies.map((proxy) => (
                <ProxyCard key={proxy.id} proxy={proxy} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Expired Proxies Tab */}
        <TabsContent value="expired" className="mt-0 outline-none">
          {expiredProxies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 py-12 text-center shadow-xs">
              <GoogleIcon name="schedule" size={28} className="text-muted-foreground mb-2" />
              <h3 className="text-xs font-semibold text-foreground">No Expired Proxies</h3>
              <p className="mt-1 text-[11px] text-muted-foreground max-w-xs mx-auto">
                Your expired proxies will appear here once their duration ends.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-3.5 grid-cols-1 md:grid-cols-2">
              {expiredProxies.map((proxy) => (
                <ProxyCard key={proxy.id} proxy={proxy} isExpired />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="mt-0 outline-none">
          {purchasedEmails.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 py-12 text-center shadow-xs">
              <GoogleIcon name="mail" size={28} className="text-muted-foreground mb-2" />
              <h3 className="text-xs font-semibold text-foreground">No Purchased Emails</h3>
              <p className="mt-1 text-[11px] text-muted-foreground max-w-xs mx-auto">
                Purchase premium email accounts to get started.
              </p>
              <Button
                onClick={() => router.push("/buy-emails")}
                size="sm"
                className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs h-8 px-4 rounded-md"
              >
                Browse Emails
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-3.5 grid-cols-1 md:grid-cols-2">
              {purchasedEmails.map((email) => {
                const passwordVisible = visiblePasswords.has(email.id)

                return (
                  <div
                    key={email.id}
                    className="rounded-xl border border-border bg-card text-card-foreground p-3.5 transition-all duration-200 hover:border-border/80 shadow-xs flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                          <GoogleIcon name="mail" size={13} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-foreground truncate tracking-tight">
                            {email.domain}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground bg-secondary border border-border px-1.5 py-0.5 rounded font-medium">
                        Email Account
                      </span>
                    </div>

                    {/* Email credentials */}
                    <div className="space-y-1.5 my-2.5">
                      {/* Address */}
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border/60 px-2.5 py-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <GoogleIcon name="alternate_email" size={13} className="text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium block leading-none">
                              Email
                            </span>
                            <span className="font-mono text-[11px] font-medium text-foreground truncate block mt-0.5 leading-none select-all">
                              {email.emailAddress}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(email.emailAddress, "Email Address")}
                          className="h-5 w-5 ml-1 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors flex-shrink-0"
                          title="Copy email"
                        >
                          <GoogleIcon name="content_copy" size={12} />
                        </button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border/60 px-2.5 py-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <GoogleIcon name="lock" size={13} className="text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium block leading-none">
                              Password
                            </span>
                            <span className="font-mono text-[11px] font-medium text-foreground block mt-0.5 leading-none select-all truncate">
                              {passwordVisible ? email.password : "••••••••"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(email.id)}
                            className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                            title={passwordVisible ? "Hide password" : "Show password"}
                          >
                            <GoogleIcon name={passwordVisible ? "visibility_off" : "visibility"} size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(email.password, "Password")}
                            className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                            title="Copy password"
                          >
                            <GoogleIcon name="content_copy" size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Server if available */}
                      {email.server && (
                        <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border/60 px-2.5 py-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <GoogleIcon name="dns" size={13} className="text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium block leading-none">
                                Server
                              </span>
                              <span className="font-mono text-[11px] font-medium text-foreground truncate block mt-0.5 leading-none select-all">
                                {email.server}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(email.server || "", "Server")}
                            className="h-5 w-5 ml-1 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors flex-shrink-0"
                            title="Copy server"
                          >
                            <GoogleIcon name="content_copy" size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Purchased</span>
                      <span>{formatUTCDate(new Date(email.purchasedAt))}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
