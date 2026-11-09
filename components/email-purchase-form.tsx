"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GoogleIcon } from "@/components/ui/google-icon"

interface EmailDomain {
  _id: string
  domain: string
  type: "gmail" | "rayproxy"
  server?: string
}

interface EmailPricing {
  domainId: string
  pricePerEmail: number
}

const quickQuantities = [1, 5, 10, 25, 50]

export function EmailPurchaseForm() {
  const router = useRouter()
  const [domains, setDomains] = useState<EmailDomain[]>([])
  const [pricing, setPricing] = useState<Map<string, EmailPricing>>(new Map())
  const [availableEmails, setAvailableEmails] = useState<Map<string, number>>(new Map())
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("1")
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "balance">("mpesa")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [availabilityError, setAvailabilityError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [domainsRes, pricingRes, balanceRes, availableRes] = await Promise.all([
        fetch("/api/emails/domains"),
        fetch("/api/emails/pricing"),
        fetch("/api/user/balance"),
        fetch("/api/emails/available"),
      ])

      if (domainsRes.ok) {
        const data = await domainsRes.json()
        const domList = data.domains || []
        setDomains(domList)
        if (domList.length > 0) {
          setSelectedDomain(domList[0]._id)
        }
      }

      if (pricingRes.ok) {
        const data = await pricingRes.json()
        const pricingMap = new Map<string, EmailPricing>(
          data.pricing?.map((p: EmailPricing) => [p.domainId, p]) || []
        )
        setPricing(pricingMap)
      }

      if (balanceRes.ok) {
        const data = await balanceRes.json()
        setBalance(data.balance || 0)
      }

      if (availableRes.ok) {
        const data = await availableRes.json()
        const availableMap = new Map<string, number>(
          data.available?.map((item: { domainId: string; count: number }) => [item.domainId, item.count]) || []
        )
        setAvailableEmails(availableMap)
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load email configurations")
    } finally {
      setLoading(false)
    }
  }

  const selectedPricing = selectedDomain ? pricing.get(selectedDomain) : null
  const availableCount = selectedDomain ? (availableEmails.get(selectedDomain) || 0) : 0
  const qtyNumber = Number.parseInt(quantity) || 1
  const totalPrice = selectedPricing ? selectedPricing.pricePerEmail * qtyNumber : 0
  const hasEnoughBalance = balance >= totalPrice && totalPrice > 0

  const handleQuantityChange = (value: string) => {
    setQuantity(value)
    setAvailabilityError("")

    const qty = Number.parseInt(value)
    if (qty > availableCount) {
      setAvailabilityError(`Only ${availableCount} email${availableCount === 1 ? "" : "s"} available in stock`)
    }
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setAvailabilityError("")
    setSubmitting(true)
    setPaymentStatus("idle")

    if (!selectedDomain) {
      setError("Please select an email domain")
      setSubmitting(false)
      return
    }

    if (!quantity || qtyNumber < 1) {
      setError("Please enter a valid quantity")
      setSubmitting(false)
      return
    }

    if (qtyNumber > availableCount) {
      setAvailabilityError(`Only ${availableCount} email${availableCount === 1 ? "" : "s"} available`)
      setSubmitting(false)
      return
    }

    let formattedPhone = ""
    if (paymentMethod === "mpesa") {
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
        setError("Please enter a valid Safaricom phone number (e.g. 0712345678)")
        setSubmitting(false)
        return
      }

      formattedPhone = cleanPhone.startsWith("254")
        ? cleanPhone
        : cleanPhone.startsWith("0")
          ? `254${cleanPhone.slice(1)}`
          : `254${cleanPhone}`
    }

    try {
      const res = await fetch("/api/email-orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: selectedDomain,
          quantity: qtyNumber,
          paymentMethod,
          phoneNumber: formattedPhone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create order")
        setSubmitting(false)
        return
      }

      // If paid via balance directly
      if (data.status === "paid") {
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
        body: JSON.stringify({ orderId: data.orderId, type: "email" }),
      })

      const stkData = await stkRes.json()

      if (!stkRes.ok) {
        setError(stkData.error || "Failed to initiate M-Pesa payment")
        setPaymentStatus("failed")
        setSubmitting(false)
        return
      }

      // Poll for payment status
      let attempts = 0
      const maxAttempts = 30

      const pollInterval = setInterval(async () => {
        attempts++

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setPaymentStatus("failed")
          setError("Payment timed out. If money was deducted, your credentials will appear in your dashboard shortly.")
          setSubmitting(false)
          return
        }

        try {
          const statusRes = await fetch(
            `/api/mpesa/query-status?checkoutRequestId=${stkData.checkoutRequestId}&type=email`,
            { cache: "no-store" }
          )
          const statusData = await statusRes.json()

          if (statusData.status === "paid" || statusData.status === "completed") {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/dashboard")
              router.refresh()
            }, 1800)
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval)
            setPaymentStatus("failed")
            setError(statusData.error || "Payment was cancelled or failed.")
            setSubmitting(false)
          }
        } catch {
          // Continue polling
        }
      }, 2000)
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setPaymentStatus("failed")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <GoogleIcon name="progress_activity" size={32} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  if (domains.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-secondary/30 p-8 text-center max-w-md mx-auto">
        <GoogleIcon name="mail" size={36} className="mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No Email Domains In Stock</h3>
        <p className="text-xs text-muted-foreground mt-1">Please check back soon as new domains are provisioned regularly.</p>
      </div>
    )
  }

  const activeDomain = domains.find((d) => d._id === selectedDomain)

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handlePurchase} className="space-y-4">
        {/* Domain Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Email Domain</Label>
            {activeDomain && (
              <span className="text-[11px] font-medium text-emerald-500 dark:text-emerald-400">
                {availableCount} in stock
              </span>
            )}
          </div>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="h-11 text-xs sm:text-sm bg-secondary/40 dark:bg-zinc-900/60 border-border rounded-xl">
              <SelectValue placeholder="Select email domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => {
                const available = availableEmails.get(domain._id) || 0
                const priceItem = pricing.get(domain._id)
                return (
                  <SelectItem key={domain._id} value={domain._id} className="text-xs py-2">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="font-medium">{domain.domain}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {domain.type === "gmail" ? "Gmail" : "SMTP"}
                        </span>
                        <span className="text-xs font-mono font-semibold text-foreground">
                          KES {priceItem ? priceItem.pricePerEmail : 0}
                        </span>
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                          {available} left
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-quantity" className="text-xs font-semibold text-foreground">
              Quantity
            </Label>
            {selectedPricing && (
              <span className="text-xs font-mono text-muted-foreground">
                KES {selectedPricing.pricePerEmail.toLocaleString()} each
              </span>
            )}
          </div>
          <Input
            id="email-quantity"
            type="number"
            min="1"
            max={availableCount > 0 ? availableCount : 1}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="Enter quantity"
            className="h-11 text-xs sm:text-sm bg-secondary/40 dark:bg-zinc-900/60 border-border rounded-xl font-medium focus:border-emerald-500"
          />

          {/* Quick Quantity Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickQuantities.map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => handleQuantityChange(qty.toString())}
                className={`h-7 px-3 rounded-lg border text-xs font-medium transition-all ${
                  quantity === qty.toString()
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-500 dark:text-emerald-400 font-semibold"
                    : "border-border/70 bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {qty} {qty === 1 ? "Account" : "Accounts"}
              </button>
            ))}
          </div>

          {availabilityError && (
            <p className="flex items-center gap-1 text-[11px] text-destructive pt-1">
              <GoogleIcon name="error" size={13} /> {availabilityError}
            </p>
          )}
        </div>

        {/* Payment Method Toggle */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("mpesa")}
              className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl border text-xs font-medium transition-all ${
                paymentMethod === "mpesa"
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-500 dark:text-emerald-400 font-semibold shadow-sm"
                  : "bg-secondary/40 dark:bg-zinc-900/40 border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <GoogleIcon name="phone_android" size={16} />
              <span>M-Pesa STK Push</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (hasEnoughBalance) setPaymentMethod("balance")
              }}
              disabled={!hasEnoughBalance && totalPrice > 0}
              className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl border text-xs font-medium transition-all ${
                paymentMethod === "balance"
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-500 dark:text-emerald-400 font-semibold shadow-sm"
                  : !hasEnoughBalance && totalPrice > 0
                  ? "bg-secondary/20 border-border/40 text-muted-foreground/40 cursor-not-allowed"
                  : "bg-secondary/40 dark:bg-zinc-900/40 border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <GoogleIcon name="account_balance_wallet" size={16} />
              <span>Wallet (KES {balance.toLocaleString()})</span>
              {!hasEnoughBalance && totalPrice > 0 && (
                <span className="text-[9px] bg-red-500/15 text-red-500 px-1 py-0.5 rounded border border-red-500/20">
                  Low
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Phone Input (if M-Pesa) */}
        {paymentMethod === "mpesa" && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <Label htmlFor="email-phone" className="text-xs font-semibold text-foreground">
              M-Pesa Phone Number
            </Label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground font-mono pointer-events-none">
                <img
                  src="https://flagcdn.com/20x15/ke.png"
                  alt="Kenya"
                  className="h-3 w-4 object-cover rounded-[2px]"
                />
                <span>+254</span>
              </div>
              <Input
                id="email-phone"
                type="tel"
                placeholder="712345678 or 0712345678"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setError("")
                }}
                required
                className="pl-20 h-11 text-xs sm:text-sm bg-secondary/40 dark:bg-zinc-900/60 border-border rounded-xl font-mono focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enter your Safaricom number to receive an instant PIN prompt on your phone.
            </p>
          </div>
        )}

        {/* Order Price Breakdown */}
        {selectedPricing && (
          <div className="p-3.5 rounded-xl border border-border/70 bg-secondary/30 dark:bg-zinc-900/40 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Account Domain</span>
              <span className="font-medium text-foreground">{activeDomain?.domain}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Quantity</span>
              <span className="font-mono text-foreground">{quantity}</span>
            </div>
            <div className="border-t border-border/60 pt-2 flex justify-between font-semibold">
              <span className="text-foreground">Total Due:</span>
              <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 font-mono">
                KES {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
            <GoogleIcon name="error" size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pending State */}
        {paymentStatus === "pending" && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-1.5">
            <GoogleIcon name="progress_activity" size={24} className="mx-auto animate-spin text-emerald-500" />
            <p className="text-xs font-semibold text-foreground">Waiting for M-Pesa PIN confirmation...</p>
            <p className="text-[11px] text-muted-foreground">
              Check your phone screen and authorize payment of KES {totalPrice.toLocaleString()}.
            </p>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === "success" && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center space-y-1.5">
            <GoogleIcon name="check_circle" size={26} className="mx-auto text-emerald-500" />
            <p className="text-sm font-bold text-emerald-500">Purchase Completed!</p>
            <p className="text-[11px] text-muted-foreground">
              Your email credentials are ready in your dashboard. Redirecting...
            </p>
          </div>
        )}

        {/* Submit Action Button */}
        {paymentStatus !== "success" && (
          <Button
            type="submit"
            disabled={
              submitting ||
              !selectedDomain ||
              !quantity ||
              !!availabilityError ||
              (paymentMethod === "mpesa" && !phoneNumber) ||
              (paymentMethod === "balance" && !hasEnoughBalance)
            }
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <GoogleIcon name="progress_activity" size={16} className="animate-spin" />
                Processing Order...
              </span>
            ) : paymentMethod === "balance" ? (
              <span className="flex items-center gap-1.5">
                <GoogleIcon name="bolt" size={16} />
                Purchase Now (KES {totalPrice.toLocaleString()})
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <GoogleIcon name="lock" size={15} />
                Pay KES {totalPrice.toLocaleString()} via M-Pesa
              </span>
            )}
          </Button>
        )}
      </form>
    </div>
  )
}
