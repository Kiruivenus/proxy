"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, AlertCircle, Mail, CheckCircle, Wallet, Smartphone } from "lucide-react"

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

export function EmailPurchaseForm() {
  const router = useRouter()
  const [domains, setDomains] = useState<EmailDomain[]>([])
  const [pricing, setPricing] = useState<Map<string, EmailPricing>>(new Map())
  const [availableEmails, setAvailableEmails] = useState<Map<string, number>>(new Map())
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("1")
  const [balance, setBalance] = useState<number>(0)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"balance" | "mpesa">("mpesa")
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
        setDomains(data.domains || [])
      }

      if (pricingRes.ok) {
        const data = await pricingRes.json()
        const pricingMap = new Map(
          data.pricing?.map((p: EmailPricing) => [p.domainId, p]) || []
        )
        setPricing(pricingMap)
      }

      if (balanceRes.ok) {
        const data = await balanceRes.json()
        setBalance(data.balance || 0)
      } else {
        setBalance(0)
      }

      if (availableRes.ok) {
        const data = await availableRes.json()
        const availableMap = new Map(
          data.available?.map((item: { domainId: string; count: number }) => [item.domainId, item.count]) || []
        )
        setAvailableEmails(availableMap)
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load email domains")
    } finally {
      setLoading(false)
      setBalanceLoading(false)
    }
  }

  const selectedPricing = selectedDomain ? pricing.get(selectedDomain) : null
  const availableCount = selectedDomain ? (availableEmails.get(selectedDomain) || 0) : 0
  const totalPrice = selectedPricing
    ? selectedPricing.pricePerEmail * parseInt(quantity || "1")
    : 0
  const hasEnoughBalance = balance >= totalPrice

  const handleQuantityChange = (value: string) => {
    setQuantity(value)
    setAvailabilityError("")

    const qty = parseInt(value)
    const available = availableEmails.get(selectedDomain) || 0

    if (qty > available) {
      setAvailabilityError(
        `Only ${available} email${available === 1 ? "" : "s"} available for this domain`
      )
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

    const qty = parseInt(quantity)
    if (!quantity || qty < 1) {
      setError("Please enter a valid quantity")
      setSubmitting(false)
      return
    }

    if (qty > availableCount) {
      setAvailabilityError(`Only ${availableCount} email${availableCount === 1 ? "" : "s"} available`)
      setSubmitting(false)
      return
    }

    let formattedPhone = ""
    if (paymentMethod === "mpesa") {
      if (!phoneNumber) {
        setError("Please enter your phone number for M-Pesa payment")
        setSubmitting(false)
        return
      }
      
      // Validate phone number (Kenyan format)
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
        setError("Please enter a valid M-Pesa phone number")
        setSubmitting(false)
        return
      }

      formattedPhone = cleanPhone.startsWith("254")
        ? cleanPhone
        : cleanPhone.startsWith("0")
          ? `254${cleanPhone.slice(1)}`
          : `254${cleanPhone}`
    }

    if (paymentMethod === "balance" && balance < totalPrice) {
      setError(
        `Insufficient balance. You need KES ${totalPrice - balance} more`
      )
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/email-orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: selectedDomain,
          quantity: parseInt(quantity),
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

      // If paid with balance, redirect immediately
      if (data.success) {
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
        setError(stkData.error || "Failed to initiate payment")
        setPaymentStatus("failed")
        setSubmitting(false)
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
          setSubmitting(false)
          return
        }

        try {
          const statusRes = await fetch(`/api/user/orders`)
          const statusData = await statusRes.json()

          const order = statusData.orders?.find((o: any) => o.id === data.orderId)

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
            setSubmitting(false)
          }
        } catch {
          // Continue polling
        }
      }, 2000)
    } catch {
      setError("Something went wrong")
      setPaymentStatus("failed")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (domains.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No email domains available at the moment. Please check back later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Email Domain</CardTitle>
      </CardHeader>
      <form onSubmit={handlePurchase}>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

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

              {/* Domain Selection */}
              <div className="space-y-2">
                <Label>Email Domain</Label>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an email domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => {
                      const available = availableEmails.get(domain._id) || 0
                      return (
                        <SelectItem key={domain._id} value={domain._id}>
                          <div className="flex items-center gap-2">
                            <span>{domain.domain}</span>
                            <span className="text-xs text-muted-foreground">
                              ({domain.type === "gmail" ? "Gmail" : "RayProxy SMTP"})
                            </span>
                            <span className="ml-2 text-xs font-semibold text-accent">
                              {available} available
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedPricing && (
                <>
                  {/* Quantity Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Number of Emails</Label>
                      <span className="text-xs font-medium text-muted-foreground">
                        Available: <span className="text-accent">{availableCount}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="1"
                        max={availableCount}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        placeholder="Enter quantity"
                        className="h-11"
                      />
                      <div className="whitespace-nowrap text-sm text-muted-foreground">
                        KES {selectedPricing.pricePerEmail}/email
                      </div>
                    </div>
                    {availabilityError && (
                      <p className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" /> {availabilityError}
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="rounded-md border bg-muted/50 p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price per email:</span>
                        <span>KES {selectedPricing.pricePerEmail.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{quantity}</span>
                      </div>
                      <div className="border-t border-border pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Price:</span>
                          <span className="text-accent">KES {totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
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
                          disabled={!hasEnoughBalance && totalPrice > 0}
                        />
                        <Label
                          htmlFor="balance"
                          className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/5 peer-data-[state=checked]:border-accent ${
                            !hasEnoughBalance && totalPrice > 0 ? "cursor-not-allowed opacity-50" : ""
                          }`}
                        >
                          <Wallet className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">Balance</span>
                          {!hasEnoughBalance && totalPrice > 0 && (
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
                submitting ||
                !selectedDomain ||
                !quantity ||
                !!availabilityError ||
                (paymentMethod === "mpesa" && !phoneNumber) ||
                (paymentMethod === "balance" && !hasEnoughBalance)
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "balance" ? (
                `Pay KES ${totalPrice.toLocaleString()} from Balance`
              ) : (
                `Pay KES ${totalPrice.toLocaleString()} via M-Pesa`
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  )
}
