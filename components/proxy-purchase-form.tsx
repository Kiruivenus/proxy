"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle, XCircle, AlertCircle, Wallet, Smartphone } from "lucide-react"

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
      // Validate phone number (Kenyan format)
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
        setError("Please enter a valid M-Pesa phone number")
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
          setError("Payment timeout. Please try again.")
          setLoading(false)
          return
        }

        try {
          const statusRes = await fetch(`/api/user/orders`)
          const statusData = await statusRes.json()

          const order = statusData.orders?.find((o: any) => o.id === orderData.order.id)

          if (order?.status === "paid") {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/dashboard")
              router.refresh()
            }, 2000)
          } else if (order?.status === "failed") {
            clearInterval(pollInterval)
            setPaymentStatus("failed")
            setError("Payment failed. Please try again.")
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

  if (pricing.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No proxies available at the moment. Please check back later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Proxy</CardTitle>
        <CardDescription>Choose a country for your daily proxy access</CardDescription>
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
              <p className="mt-2 font-medium text-green-500">Payment Successful!</p>
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
          )}

          {paymentStatus !== "success" && (
            <>
              {/* Balance Display */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Wallet className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-xl font-bold">
                      {balanceLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        `KES ${balance.toLocaleString()}`
                      )}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" type="button" onClick={() => router.push("/topup")}>
                  Top Up
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricing.map((p) => (
                      <SelectItem key={p.countryCode} value={p.country}>
                        {p.country} - KES {p.daily}/day
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {checking && <p className="text-sm text-muted-foreground">Checking availability...</p>}
                {available === true && !checking && (
                  <p className="flex items-center gap-1 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" /> Available
                  </p>
                )}
                {available === false && !checking && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <XCircle className="h-4 w-4" /> Not available
                  </p>
                )}
              </div>

              {selectedPricing && (
                <>
                  <div className="rounded-md border bg-muted/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Daily Access</span>
                      <span className="text-lg font-bold">KES {selectedPricing.daily}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Get access to a premium proxy</p>
                    {availableProxy && (
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Proxy Expires (UTC):</span>
                          <span className="font-semibold text-accent">
                            {(() => {
                              const date = new Date(availableProxy.expiresAt)
                              const year = date.getUTCFullYear()
                              const month = String(date.getUTCMonth() + 1).padStart(2, "0")
                              const day = String(date.getUTCDate()).padStart(2, "0")
                              const hours = String(date.getUTCHours()).padStart(2, "0")
                              const minutes = String(date.getUTCMinutes()).padStart(2, "0")
                              return `${month}/${day}/${year} at ${hours}:${minutes}`
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as "mpesa" | "balance")}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="balance"
                          id="balance"
                          className="peer sr-only"
                          disabled={!hasEnoughBalance && price > 0}
                        />
                        <Label
                          htmlFor="balance"
                          className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/5 peer-data-[state=checked]:border-accent ${
                            !hasEnoughBalance && price > 0 ? "cursor-not-allowed opacity-50" : ""
                          }`}
                        >
                          <Wallet className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">Balance</span>
                          {!hasEnoughBalance && price > 0 && (
                            <span className="mt-1 text-xs text-destructive">Insufficient</span>
                          )}
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="mpesa" id="mpesa" className="peer sr-only" />
                        <Label
                          htmlFor="mpesa"
                          className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/5 peer-data-[state=checked]:border-accent"
                        >
                          <Smartphone className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">M-Pesa</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "mpesa" && (
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
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
        {paymentStatus !== "success" && (
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                !country ||
                available === false ||
                (paymentMethod === "mpesa" && !phoneNumber) ||
                (paymentMethod === "balance" && !hasEnoughBalance)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "balance" ? (
                `Pay KES ${price} from Balance`
              ) : (
                `Pay KES ${price} via M-Pesa`
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  )
}
