"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoogleIcon } from "@/components/ui/google-icon"

interface PricingItem {
  country: string
  countryCode: string
  daily: number
}

interface AvailableProxy {
  id: string
  country: string
  expiresAt: string
}

interface ProxyPurchaseFormProps {
  pricing: PricingItem[]
  userId?: string
}

export function ProxyPurchaseForm({ pricing, userId }: ProxyPurchaseFormProps) {
  const router = useRouter()
  const [country, setCountry] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "balance">("mpesa")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [availableProxy, setAvailableProxy] = useState<AvailableProxy | null>(null)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")
  const [balance, setBalance] = useState<number>(0)
  const [balanceLoading, setBalanceLoading] = useState(true)

  const selectedPricing = pricing.find((p) => p.country === country)
  const price = selectedPricing ? selectedPricing.daily : 0
  const hasEnoughBalance = balance >= price

  useEffect(() => {
    fetchBalance()
  }, [])

  useEffect(() => {
    if (country) {
      checkAvailability()
    } else {
      setAvailable(null)
      setAvailableProxy(null)
    }
  }, [country])

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/user/balance")
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance || 0)
      }
    } catch {
      // User might not be logged in
    } finally {
      setBalanceLoading(false)
    }
  }

  const checkAvailability = async () => {
    setChecking(true)
    try {
      const url = new URL("/api/proxies/available", window.location.origin)
      url.searchParams.set("country", country)
      if (userId) {
        url.searchParams.set("userId", userId)
      }
      const res = await fetch(url.toString())
      const data = await res.json()
      setAvailable(data.available)
      if (data.available && data.proxy) {
        setAvailableProxy(data.proxy)
      } else {
        setAvailableProxy(null)
      }
    } catch {
      setAvailable(null)
      setAvailableProxy(null)
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setPaymentStatus("idle")

    let formattedPhone = ""
    if (paymentMethod === "mpesa") {
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
        setError("Please enter a valid M-Pesa phone number (e.g. 0712345678)")
        setLoading(false)
        return
      }

      formattedPhone = cleanPhone.startsWith("254")
        ? cleanPhone
        : cleanPhone.startsWith("0")
          ? `254${cleanPhone.slice(1)}`
          : `254${cleanPhone}`
    }

    try {
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          duration: "daily",
          phoneNumber: formattedPhone,
          paymentMethod,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        setError(orderData.error || "Failed to create order")
        setLoading(false)
        return
      }

      // If paid with balance, redirect immediately
      if (orderData.paid) {
        setPaymentStatus("success")
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
        return
      }

      // Initiate STK Push for M-Pesa
      setPaymentStatus("pending")
      const stkRes = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      })

      const stkData = await stkRes.json()

      if (!stkRes.ok) {
        setError(stkData.error || "Failed to initiate payment")
        setPaymentStatus("failed")
        setLoading(false)
        return
      }

      // Poll for payment status
      let attempts = 0
      const maxAttempts = 30 // 60 seconds

      const pollInterval = setInterval(async () => {
        attempts++

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setPaymentStatus("failed")
          setError("Payment timeout. If money was deducted, please check your dashboard as it may take a few moments to process.")
          setLoading(false)
          return
        }

        try {
          const statusRes = await fetch(`/api/mpesa/query-status?checkoutRequestId=${stkData.checkoutRequestId}&type=proxy`, { cache: "no-store" })
          const statusData = await statusRes.json()

          if (statusData.status === "paid") {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/dashboard")
              router.refresh()
            }, 1800)
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval)
            setPaymentStatus("failed")
            setError(statusData.error || "Payment failed. If money was deducted, please check your dashboard as it may take a few moments to process.")
            setLoading(false)
          }
        } catch {
          // Continue polling
        }
      }, 2000)
    } catch {
      setError("Something went wrong")
      setPaymentStatus("failed")
      setLoading(false)
    }
  }

  const formatUTCDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = String(date.getUTCDate()).padStart(2, "0")
    const month = months[date.getUTCMonth()]
    const year = date.getUTCFullYear()
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    return `${day} ${month} ${year}, ${hours}:${minutes} UTC`
  }

  if (pricing.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card text-card-foreground p-8 text-center max-w-md mx-auto shadow-xs">
        <GoogleIcon name="dns" size={32} className="mx-auto text-muted-foreground mb-2" />
        <h3 className="text-sm font-semibold text-foreground">No Proxies Available</h3>
        <p className="mt-1 text-xs text-muted-foreground">Please check back later or contact support.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Alert Notices */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500 dark:text-red-400 flex items-center gap-2">
          <GoogleIcon name="error" size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {paymentStatus === "pending" && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center max-w-md mx-auto">
          <GoogleIcon name="progress_activity" size={28} className="mx-auto animate-spin text-emerald-500 dark:text-emerald-400 mb-2" />
          <h4 className="text-sm font-semibold text-foreground">Check your phone for M-Pesa prompt</h4>
          <p className="text-xs text-muted-foreground mt-1">Enter your M-Pesa PIN to complete the KES {price} payment.</p>
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center max-w-md mx-auto">
          <GoogleIcon name="check_circle" size={28} className="mx-auto text-emerald-500 dark:text-emerald-400 mb-2" />
          <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Payment Successful!</h4>
          <p className="text-xs text-muted-foreground mt-1">Your proxy is now ready. Redirecting to your dashboard...</p>
        </div>
      )}

      {paymentStatus !== "success" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Stripe-Style Checkout Fields */}
          <div className="lg:col-span-7 space-y-5">
            {/* Country Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="country-select" className="text-xs font-semibold text-foreground">
                  Select Location
                </Label>
                {checking && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <GoogleIcon name="progress_activity" size={12} className="animate-spin" />
                    Checking stock...
                  </span>
                )}
                {available === true && !checking && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 dark:text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock
                  </span>
                )}
                {available === false && !checking && (
                  <span className="flex items-center gap-1 text-[11px] text-red-500 dark:text-red-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>

              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country-select" className="h-10 text-xs bg-background border-border rounded-lg text-foreground">
                  <SelectValue placeholder="Choose a country..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-xs text-popover-foreground">
                  {pricing.map((p) => (
                    <SelectItem key={p.countryCode} value={p.country} className="text-xs py-2">
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/20x15/${p.countryCode.toLowerCase()}.png`}
                            alt={p.country}
                            className="h-3.5 w-5 object-cover rounded-[2px]"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none"
                            }}
                          />
                          <span className="font-medium text-foreground">{p.country}</span>
                        </div>
                        <span className="font-mono text-muted-foreground font-medium">KES {p.daily}/day</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Selector (Stripe-style segmented pills) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Payment Method</Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`flex items-center justify-center gap-2 h-11 px-3 rounded-lg border text-xs font-medium transition-all ${
                    paymentMethod === "mpesa"
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                      : "bg-secondary/40 border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}
                >
                  <GoogleIcon name="phone_android" size={16} className={paymentMethod === "mpesa" ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground"} />
                  <span>M-Pesa STK Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (hasEnoughBalance || price === 0) {
                      setPaymentMethod("balance")
                    }
                  }}
                  disabled={!hasEnoughBalance && price > 0}
                  className={`flex items-center justify-center gap-2 h-11 px-3 rounded-lg border text-xs font-medium transition-all ${
                    paymentMethod === "balance"
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                      : !hasEnoughBalance && price > 0
                        ? "bg-secondary/20 border-border/40 text-muted-foreground/40 cursor-not-allowed"
                        : "bg-secondary/40 border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}
                >
                  <GoogleIcon name="account_balance_wallet" size={16} className={paymentMethod === "balance" ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground"} />
                  <span>Wallet Balance</span>
                  {!hasEnoughBalance && price > 0 && (
                    <span className="text-[9px] bg-red-500/10 text-red-500 px-1 py-0.5 rounded border border-red-500/20">Low</span>
                  )}
                </button>
              </div>
            </div>

            {/* M-Pesa Phone Input */}
            {paymentMethod === "mpesa" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label htmlFor="phone-input" className="text-xs font-semibold text-foreground">
                  M-Pesa Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground font-mono pointer-events-none">
                    <img src="https://flagcdn.com/20x15/ke.png" alt="Kenya" className="h-3 w-4 object-cover rounded-[1px]" />
                    <span>+254</span>
                  </div>
                  <Input
                    id="phone-input"
                    type="tel"
                    placeholder="712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="pl-20 h-10 text-xs bg-background border-border rounded-lg font-mono text-foreground focus:border-emerald-500/50"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Enter your Safaricom number to receive an instant PIN prompt on your phone.
                </p>
              </div>
            )}

            {/* Balance Overview Strip */}
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 border border-border p-3 text-xs">
              <div className="flex items-center gap-2">
                <GoogleIcon name="account_balance_wallet" size={15} className="text-muted-foreground" />
                <span className="text-muted-foreground">Available Balance:</span>
                <span className="font-mono font-bold text-foreground">
                  {balanceLoading ? "..." : `KES ${balance.toFixed(2)}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/topup")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
              >
                + Top Up
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Stripe Order Summary Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm text-card-foreground space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <GoogleIcon name="receipt_long" size={16} className="text-emerald-500 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Order Summary</h3>
                </div>
                <span className="text-[10px] text-muted-foreground bg-secondary border border-border px-1.5 py-0.5 rounded font-mono">
                  1-Day Access
                </span>
              </div>

              {/* Line Items */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium text-foreground">Residential Proxy</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground">
                    {country ? (
                      <span className="flex items-center gap-1.5">
                        {selectedPricing && (
                          <img
                            src={`https://flagcdn.com/16x12/${selectedPricing.countryCode.toLowerCase()}.png`}
                            alt={country}
                            className="h-3 w-4 object-cover rounded-[1px]"
                          />
                        )}
                        <span>{country}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">None selected</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">24 Hours (Daily)</span>
                </div>

                {availableProxy && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-muted-foreground">Expires (UTC)</span>
                    <span className="font-mono text-foreground/80">{formatUTCDate(availableProxy.expiresAt)}</span>
                  </div>
                )}

                <div className="border-t border-border pt-3 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-foreground">Total Due</span>
                  <div className="text-right">
                    <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      KES {price.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-muted-foreground">VAT inclusive</p>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <Button
                type="submit"
                disabled={
                  loading ||
                  !country ||
                  available === false ||
                  (paymentMethod === "mpesa" && !phoneNumber) ||
                  (paymentMethod === "balance" && !hasEnoughBalance)
                }
                className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs tracking-wide rounded-lg transition-all shadow-md shadow-emerald-500/10 active:scale-[0.99] disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <GoogleIcon name="progress_activity" size={15} className="animate-spin" />
                    Processing...
                  </span>
                ) : !country ? (
                  "Select a location to continue"
                ) : available === false ? (
                  "Out of stock for this location"
                ) : paymentMethod === "balance" ? (
                  `Pay KES ${price} from Balance`
                ) : (
                  `Pay KES ${price} via M-Pesa`
                )}
              </Button>

              {/* Stripe-style trust indicators */}
              <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GoogleIcon name="lock" size={12} className="text-emerald-500 dark:text-emerald-400" />
                  Secure checkout
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GoogleIcon name="bolt" size={12} className="text-emerald-500 dark:text-emerald-400" />
                  Instant delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
