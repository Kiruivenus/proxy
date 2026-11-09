"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/ui/google-icon"

interface TopUpFormProps {
  currentBalance: number
}

const quickAmounts = [100, 250, 500, 1000, 2000, 5000]

export function TopUpForm({ currentBalance }: TopUpFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setPaymentStatus("idle")

    const numAmount = Number.parseInt(amount)
    if (isNaN(numAmount) || numAmount < 10) {
      setError("Minimum top-up amount is KES 10")
      setLoading(false)
      return
    }

    // Clean and validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
      setError("Please enter a valid Safaricom phone number (e.g. 0712345678)")
      setLoading(false)
      return
    }

    const formattedPhone = cleanPhone.startsWith("254")
      ? cleanPhone
      : cleanPhone.startsWith("0")
        ? `254${cleanPhone.slice(1)}`
        : `254${cleanPhone}`

    try {
      // Create top-up record
      const topUpRes = await fetch("/api/topup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount, phoneNumber: formattedPhone }),
      })

      const topUpData = await topUpRes.json()

      if (!topUpRes.ok) {
        setError(topUpData.error || "Failed to create top-up")
        setLoading(false)
        return
      }

      // Initiate STK Push
      setPaymentStatus("pending")
      const stkRes = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpId: topUpData.topUp.id }),
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
      const maxAttempts = 30

      const pollInterval = setInterval(async () => {
        attempts++

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setPaymentStatus("failed")
          setError("Payment timeout. If money was deducted, your balance will update shortly.")
          setLoading(false)
          return
        }

        try {
          const statusRes = await fetch(
            `/api/mpesa/query-status?checkoutRequestId=${stkData.checkoutRequestId}&type=topup`,
            { cache: "no-store" }
          )
          const statusData = await statusRes.json()

          if (statusData.status === "completed" || statusData.status === "paid") {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/buy")
              router.refresh()
            }, 2000)
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval)
            setPaymentStatus("failed")
            setError(statusData.error || "Payment was cancelled or failed. Please try again.")
            setLoading(false)
          }
        } catch {
          // Continue polling
        }
      }, 2000)
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setPaymentStatus("failed")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Balance Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-secondary/30">
          <span className="text-xs text-muted-foreground font-medium">Current Balance</span>
          <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 font-mono">
            KES {currentBalance.toLocaleString()}
          </span>
        </div>

        {/* Amount Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="topup-amount" className="text-xs font-semibold text-foreground">
            Deposit Amount (KES)
          </Label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
              KES
            </div>
            <Input
              id="topup-amount"
              type="number"
              placeholder="Enter amount (min. 10)"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError("")
              }}
              min={10}
              required
              className="pl-13 h-11 text-sm bg-secondary/40 dark:bg-zinc-900/60 border-border rounded-xl font-medium focus:border-emerald-500"
            />
          </div>

          {/* Quick Amount Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickAmounts.map((amt) => {
              const isSelected = amount === amt.toString()
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-500 dark:text-emerald-400 font-semibold shadow-sm"
                      : "border-border/70 bg-secondary/40 dark:bg-zinc-900/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  KES {amt.toLocaleString()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-1.5">
          <Label htmlFor="topup-phone" className="text-xs font-semibold text-foreground">
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
              id="topup-phone"
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
            An instant M-Pesa STK push notification will be sent to this phone number.
          </p>
        </div>

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
            <p className="text-xs font-semibold text-foreground">Waiting for M-Pesa Confirmation...</p>
            <p className="text-[11px] text-muted-foreground">
              Please check your phone and enter your M-Pesa PIN.
            </p>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === "success" && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center space-y-1.5">
            <GoogleIcon name="check_circle" size={26} className="mx-auto text-emerald-500" />
            <p className="text-sm font-bold text-emerald-500">Payment Successful!</p>
            <p className="text-[11px] text-muted-foreground">
              Your wallet balance has been credited. Redirecting to Buy Proxies...
            </p>
          </div>
        )}

        {/* Submit Action Button */}
        {paymentStatus !== "success" && (
          <Button
            type="submit"
            disabled={loading || !amount || !phoneNumber}
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <GoogleIcon name="progress_activity" size={16} className="animate-spin" />
                Sending STK Push...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <GoogleIcon name="lock" size={15} />
                Top Up KES {amount ? Number.parseInt(amount || "0").toLocaleString() : "0"} via M-Pesa
              </span>
            )}
          </Button>
        )}

        {/* Security footnote */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
          <GoogleIcon name="verified_user" size={14} className="text-emerald-500" />
          <span>Encrypted 256-bit M-Pesa integration</span>
        </div>
      </form>
    </div>
  )
}
