"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyCard } from "@/components/proxy-card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Package, Clock, Mail, Copy, Eye, EyeOff, Globe, Wallet } from "lucide-react"
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
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${day} ${months[date.getUTCMonth()]} ${year}, ${hours}:${minutes} UTC`
  }

  const uniqueCountriesCount = new Set(activeProxies.map((p) => p.countryCode || p.country)).size

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {/* Active Proxies */}
        <div className="bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-2 sm:p-3.5 flex items-center gap-1.5 sm:gap-3 min-w-0 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.02]">
          <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-green-500/5 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.02)] flex-shrink-0">
            <Package className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Active Proxies</p>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white mt-1 leading-none">{activeProxies.length}</h3>
            <p className="text-[8px] sm:text-[9px] text-zinc-500 font-medium mt-1 leading-none truncate">View all active proxies</p>
          </div>
        </div>

        {/* Countries */}
        <div className="bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-2 sm:p-3.5 flex items-center gap-1.5 sm:gap-3 min-w-0 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.02]">
          <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-purple-500/5 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.02)] flex-shrink-0">
            <Globe className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Countries</p>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white mt-1 leading-none">{uniqueCountriesCount}</h3>
            <p className="text-[8px] sm:text-[9px] text-zinc-500 font-medium mt-1 leading-none truncate">Across all proxies</p>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-2 sm:p-3.5 flex items-center gap-1.5 sm:gap-3 min-w-0 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.02]">
          <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-500/5 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.02)] flex-shrink-0">
            <Wallet className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Balance</p>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white mt-1 leading-none truncate">KES {balance.toFixed(2)}</h3>
            <p className="text-[8px] sm:text-[9px] text-zinc-500 font-medium mt-1 leading-none truncate">Available balance</p>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-[#0a0a0c] border border-white/[0.06] rounded-xl p-0 h-12 mb-6 overflow-hidden">
          <TabsTrigger
            value="active"
            className="flex items-center justify-center gap-2 h-full rounded-none border-b-2 border-transparent text-zinc-400 data-[state=active]:text-green-400 data-[state=active]:border-green-500 font-semibold transition-all duration-200 hover:text-zinc-200 bg-transparent"
          >
            <Package className="h-4 w-4" />
            Active ({activeProxies.length})
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="flex items-center justify-center gap-2 h-full rounded-none border-b-2 border-transparent text-zinc-400 data-[state=active]:text-green-400 data-[state=active]:border-green-500 font-semibold transition-all duration-200 hover:text-zinc-200 bg-transparent"
          >
            <Clock className="h-4 w-4" />
            Expired ({expiredProxies.length})
          </TabsTrigger>
          <TabsTrigger
            value="emails"
            className="flex items-center justify-center gap-2 h-full rounded-none border-b-2 border-transparent text-zinc-400 data-[state=active]:text-green-400 data-[state=active]:border-green-500 font-semibold transition-all duration-200 hover:text-zinc-200 bg-transparent"
          >
            <Mail className="h-4 w-4" />
            Emails ({purchasedEmails.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-2 outline-none">
          {activeProxies.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/[0.08] bg-white/[0.01] backdrop-blur-md py-20 text-center shadow-lg transition-all duration-300 hover:border-green-500/20 hover:bg-white/[0.02]">
              <div className="text-4xl mb-4 select-none">🌐</div>
              <h3 className="text-lg font-bold text-white">No Active Proxies</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-sm mx-auto">Purchase a proxy package to get started.</p>
              <Button
                onClick={() => router.push("/buy")}
                className="mt-6 bg-green-500 hover:bg-green-500/90 text-background font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]"
              >
                Browse Proxies
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {activeProxies.map((proxy) => (
                <ProxyCard key={proxy.id} proxy={proxy} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-2 outline-none">
          {expiredProxies.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/[0.08] bg-white/[0.01] backdrop-blur-md py-20 text-center shadow-lg transition-all duration-300 hover:border-red-500/20 hover:bg-white/[0.02]">
              <div className="text-4xl mb-4 select-none">⏱️</div>
              <h3 className="text-lg font-bold text-white">No Expired Proxies</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-sm mx-auto">Your expired proxies will appear here once their duration ends.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {expiredProxies.map((proxy) => (
                <ProxyCard key={proxy.id} proxy={proxy} isExpired />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="emails" className="mt-2 outline-none">
          {purchasedEmails.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/[0.08] bg-white/[0.01] backdrop-blur-md py-20 text-center shadow-lg transition-all duration-300 hover:border-green-500/20 hover:bg-white/[0.02]">
              <div className="text-4xl mb-4 select-none">📧</div>
              <h3 className="text-lg font-bold text-white">No Purchased Emails</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-sm mx-auto">Purchase email accounts to get started.</p>
              <Button
                onClick={() => router.push("/buy-emails")}
                className="mt-6 bg-green-500 hover:bg-green-500/90 text-background font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]"
              >
                Browse Emails
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {purchasedEmails.map((email) => {
                const passwordVisible = visiblePasswords.has(email.id)

                return (
                  <Card key={email.id} className="relative overflow-hidden bg-white/[0.01] border-white/[0.08] backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-green-500/[0.01] hover:-translate-y-0.5 rounded-[20px] border-green-500/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Domain Header */}
                        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06] mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-400 flex-shrink-0">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-none">{email.domain}</h3>
                            <p className="text-[10px] text-zinc-400 mt-1">Premium Email Account</p>
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="relative flex items-center justify-between rounded-xl bg-white/[0.01] border border-white/[0.05] p-3 transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.08]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Email Address</p>
                              <p className="font-semibold text-xs text-white mt-0.5 break-all select-all">{email.emailAddress}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(email.emailAddress, "Email Address")}
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg flex-shrink-0"
                            title="Copy email address"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Password */}
                        <div className="relative flex items-center justify-between rounded-xl bg-white/[0.01] border border-white/[0.05] p-3 transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.08]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Password</p>
                              <p className="font-mono text-xs font-semibold text-white mt-0.5 select-all">
                                {passwordVisible ? email.password : "••••••"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePasswordVisibility(email.id)}
                              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                              title="Toggle password visibility"
                            >
                              {passwordVisible ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(email.password, "Password")}
                              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                              title="Copy password"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Server Info if available */}
                        {email.server && (
                          <div className="relative flex items-center justify-between rounded-xl bg-white/[0.01] border border-white/[0.05] p-3 transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.08]">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="min-w-0">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Server</p>
                                <p className="font-mono text-xs font-semibold text-white mt-0.5 truncate select-all">{email.server}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(email.server || "", "Server")}
                              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg flex-shrink-0"
                              title="Copy server"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* Purchase Date */}
                        <div className="text-[11px] text-zinc-400 font-mono pt-3 border-t border-white/[0.06] mt-3">
                          Purchased (UTC): {formatUTCDate(new Date(email.purchasedAt))}
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
    </div>
  )
}

