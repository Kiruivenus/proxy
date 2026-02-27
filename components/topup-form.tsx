"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, Wallet } from "lucide-react"

interface TopUpFormProps {
  currentBalance: number
}

const quickAmounts = [100, 250, 500, 1000]

export function TopUpForm({ currentBalance }: TopUpFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
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

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
      setError("Please enter a valid M-Pesa phone number")
      setLoading(false)
      return
    }

    const formattedPhone = cleanPhone.startsWith("254")
      ? cleanPhone
      : cleanPhone.startsWith("0")
        ? `254${cleanPhone.slice(1)}`
        : `254${cleanPhone}`

    try {
      // Create top-up
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

      // Poll for balance update
      let attempts = 0
      const maxAttempts = 30
      const initialBalance = currentBalance

      const pollInterval = setInterval(async () => {
        attempts++

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setPaymentStatus("failed")
          setError("Payment timeout. If money was deducted, your balance will be updated shortly.")
          setLoading(false)
          return
        }

        try {
          const balanceRes = await fetch("/api/user/balance")
          const balanceData = await balanceRes.json()

          if (balanceData.balance > initialBalance) {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/buy")
              router.refresh()
            }, 2000)
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>Top up your balance via M-Pesa</CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2">
            <Wallet className="h-5 w-5 text-accent" />
            <span className="font-bold">KES {currentBalance.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          {paymentStatus === "pending" && (
            <div className="rounded-md bg-accent/10 p-4 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
              <p className="mt-2 font-medium">Check your phone for M-Pesa prompt</p>
              <p className="text-sm text-muted-foreground">Enter your PIN to complete payment</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="rounded-md bg-green-500/10 p-4 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-2 font-medium text-green-500">Top-up Successful!</p>
              <p className="text-sm text-muted-foreground">Redirecting to buy proxies...</p>
            </div>
          )}

          {paymentStatus !== "success" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={10}
                  required
                />
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(amt)}
                      className={amount === amt.toString() ? "border-accent bg-accent/10" : ""}
                    >
                      KES {amt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">You will receive an STK push on this number</p>
              </div>
            </>
          )}
        </CardContent>
        {paymentStatus !== "success" && (
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || !amount || !phoneNumber}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Top Up KES ${amount || "0"}`
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  )
}
