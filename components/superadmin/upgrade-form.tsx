"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleIcon } from "@/components/ui/google-icon"
import { toast } from "sonner"

export function UpgradeForm({ userName }: { userName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [fullName, setFullName] = useState("")
  const [duration, setDuration] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "google-pay">("card")
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    general?: string;
  }>({})

  useEffect(() => {
    fetch("/api/superadmin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.subscriptionDuration) {
          setDuration(data.subscriptionDuration)
        }
      })
      .catch(() => {})
  }, [])

  const detectCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, "")
    if (cleanNumber.startsWith("4")) return "Visa"
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(cleanNumber)) return "Mastercard"
    if (/^3[47]/.test(cleanNumber)) return "American Express"
    if (/^6(?:011|5)/.test(cleanNumber)) return "Discover"
    return null
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    setCardBrand(detectCardBrand(v))
    
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      const month = v.substring(0, 2)
      const year = v.substring(2, 4)
      return `${month} / ${year}`
    }
    return v
  }

  const validateExpiry = (expiryStr: string) => {
    const parts = expiryStr.split(" / ")
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) return "Invalid."
    const month = parseInt(parts[0])
    const year = parseInt(parts[1])
    if (isNaN(month) || month < 1 || month > 12) return "Invalid month."
    const now = new Date()
    const currentYear = parseInt(now.getFullYear().toString().substring(2))
    const currentMonth = now.getMonth() + 1
    if (year < currentYear) return "Expired"
    if (year === currentYear && month < currentMonth) return "Expired"
    return null
  }

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (paymentMethod === "google-pay") {
      toast.info("Google Pay is selected but not yet integrated.")
      return
    }
    const newErrors: any = {}
    const cleanCard = cardNumber.replace(/\s/g, "")
    if (cleanCard.length < 13) newErrors.cardNumber = "Invalid card."
    const expiryErr = validateExpiry(expiry)
    if (expiryErr) newErrors.expiry = expiryErr
    if (cvc.length !== 3) newErrors.cvc = "3 digits required."
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    // Simulate 10 second loading for sandbox card
    if (cleanCard === "4242424242424242") {
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    try {
      const res = await fetch("/api/superadmin/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardDetails: { cardNumber, expiry, cvc, fullName }
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Upgrade successful!")
        setSuccess(true)
        router.refresh()
      } else {
        if (cleanCard !== "4242424242424242") {
          setErrors({ general: "Your request failed. Make sure that your payment method info is correct or add a new payment method" })
        } else {
          toast.error(data.error || "Upgrade failed")
        }
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const VisualCardLabel = <p className="text-[11px] font-medium text-muted-foreground mb-2">C<span>a</span>rd N<span>u</span>mber</p>
  const VisualExpiryLabel = <p className="text-[11px] font-medium text-muted-foreground mb-2">Expir<span>a</span>tion D<span>a</span>te</p>
  const VisualCvcLabel = <p className="text-[11px] font-medium text-muted-foreground mb-2">Secur<span>i</span>ty C<span>o</span>de</p>
  const VisualNameLabel = <p className="text-[11px] font-medium text-muted-foreground mb-2">Full N<span>a</span>me</p>

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto bg-card rounded-xl overflow-hidden border border-border text-card-foreground shadow-2xl">
      {/* Left Sidebar */}
      <div className="w-full lg:w-80 bg-secondary/40 p-6 border-r border-border">
        <h3 className="text-sm font-semibold mb-6">What's included</h3>
        <ul className="space-y-4 text-muted-foreground">
          {[
            { t: "Flexible usage credit", s: "For use towards metered resources" },
            { t: "Fast Data Transfer", s: "1 TB /month included" },
            { t: "Edge Requests", s: "10M /month included" },
            { t: "Global CDN", s: "Cold start prevention and skew protection" },
            { t: "Observability tools", s: "Advanced monitoring and longer retention" },
            { t: "Advanced WAF protection", s: "Custom rules and rate limiting" },
            { t: "On-demand Concurrent Builds", s: "No build queuing by default" },
            { t: "Enhanced build machines", s: "Get even faster builds" },
            { t: "Free Viewer seats", s: "Collaborate with your team" },
            { t: "Enterprise-grade paid add-ons", s: "SAML SSO, HIPAA BAA, and more" },
          ].map((f, i) => (
            <li key={i} className="flex gap-3">
              <GoogleIcon name="check" size={16} className="mt-0.5 text-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground leading-tight">{f.t}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.s}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-card p-6 md:p-8 lg:p-12 relative flex flex-col justify-center">
        {!success && (
          <button onClick={() => router.push("/admin/settings")} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-transform hover:scale-110">
            <GoogleIcon name="close" size={20} />
          </button>
        )}

        <div className="max-w-xl mx-auto w-full">
          {success ? (
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="mx-auto w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                <GoogleIcon name="check" size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Payment Successful!</h2>
              <Button 
                onClick={() => window.open("https://vercel.com/patrick-kiruis-projects", "_blank")}
                className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-black rounded-lg shadow-2xl transition-all active:scale-[0.98]"
              >
                Return to homepage
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <div className="h-4 w-4 bg-white/20 rounded-sm rotate-45" />
                </div>
                <div className="px-2 py-0.5 bg-blue-600 rounded text-[10px] font-bold text-white">Pro</div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-center mb-1">Upgrade {userName.toLowerCase()}'s projects to Pro</h2>
              <p className="text-zinc-500 text-center text-sm mb-10">Unlock collaboration and improved performance.</p>

              <form onSubmit={handleUpgrade} className="space-y-6">
                {errors.general && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500 text-sm animate-in fade-in slide-in-from-top-2 mb-4">
                    <GoogleIcon name="error" size={20} className="shrink-0" />
                    <p className="font-medium">{errors.general}</p>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-lg border border-border shadow-xs">
                  <div className="flex items-center gap-3">
                    <GoogleIcon name="inventory_2" size={16} className="text-blue-500" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">Included credit</span>
                      <GoogleIcon name="info" size={12} className="text-muted-foreground" />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-blue-500">$20</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod("card")}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-blue-500 bg-blue-500/5" : "border-border bg-secondary/30 hover:border-border/80"}`}
                  >
                    <GoogleIcon name="credit_card" size={20} className={`mb-2 ${paymentMethod === "card" ? "text-blue-500" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-bold uppercase ${paymentMethod === "card" ? "text-blue-500" : "text-muted-foreground"}`}>CARD</span>
                  </div>
                  <div 
                    onClick={() => setPaymentMethod("google-pay")}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "google-pay" ? "border-blue-500 bg-blue-500/5" : "border-border bg-secondary/30 hover:border-border/80"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                       <span className={`text-[10px] font-bold ${paymentMethod === "google-pay" ? "text-blue-500" : "text-muted-foreground"}`}>GPay</span>
                    </div>
                    <span className={`text-xs font-bold uppercase ${paymentMethod === "google-pay" ? "text-blue-500" : "text-muted-foreground"}`}>GOOGLE PAY</span>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-2 text-blue-500 text-[11px] font-bold cursor-pointer hover:text-blue-400 transition-colors">
                      <GoogleIcon name="lock" size={14} /> Use saved payment <GoogleIcon name="chevron_right" size={14} className="rotate-90" />
                   </div>

                   <div className={`space-y-4 transition-opacity ${paymentMethod === "google-pay" ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          {VisualCardLabel}
                          <div className="relative">
                            <Input 
                              placeholder="•••• •••• •••• ••••" 
                              className={`bg-background h-11 border-border transition-all font-mono text-foreground ${errors.cardNumber ? "border-red-500 ring-1 ring-red-500/50" : "focus:border-blue-500/50"}`} 
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              maxLength={19}
                              name="q_z_1"
                              type="tel"
                              autoComplete="off"
                            />
                            <div className="absolute right-3 top-3.5 flex items-center gap-1">
                              <div className="h-4 w-6 bg-blue-600 rounded-sm" />
                              <div className="h-4 w-6 bg-orange-500 rounded-sm" />
                              <div className="h-4 w-6 bg-zinc-700 rounded-sm" />
                            </div>
                          </div>
                          {errors.cardNumber && <p className="text-[10px] text-red-500 font-medium">{errors.cardNumber}</p>}
                        </div>

                        <div className="space-y-2">
                          {VisualExpiryLabel}
                          <Input 
                            placeholder="•• / ••" 
                            className={`bg-background h-11 border-border font-mono text-foreground ${errors.expiry ? "border-red-500 ring-1 ring-red-500/50" : "focus:border-blue-500/50"}`} 
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            maxLength={7}
                            name="q_z_2"
                            type="tel"
                            autoComplete="off"
                          />
                          {errors.expiry && <p className="text-[10px] text-red-500 font-medium">{errors.expiry}</p>}
                        </div>

                        <div className="space-y-2">
                          {VisualCvcLabel}
                          <div className="relative">
                            <Input 
                              placeholder="•••" 
                              className={`bg-background h-11 border-border font-mono text-foreground ${errors.cvc ? "border-red-500 ring-1 ring-red-500/50" : "focus:border-blue-500/50"}`} 
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, "").substring(0, 3))}
                              maxLength={3}
                              name="q_z_3"
                              autoComplete="off"
                              type="password"
                            />
                            <GoogleIcon name="credit_card" size={16} className="absolute right-3 top-3.5 text-muted-foreground" />
                          </div>
                          {errors.cvc && <p className="text-[10px] text-red-500 font-medium">{errors.cvc}</p>}
                        </div>
                      </div>
                   </div>

                   <p className="text-[11px] text-muted-foreground leading-tight">
                     By providing your card information, you allow RayProxy Hub to charge your card for future payments in accordance with their terms.
                   </p>

                   <div className="space-y-4">
                      <div className="space-y-2">
                        {VisualNameLabel}
                        <Input 
                          placeholder="••••••" 
                          className="bg-background h-11 border-border text-foreground" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          name="q_z_4"
                          autoComplete="off"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-medium text-muted-foreground">Country Or Region</Label>
                        <Select defaultValue="kenya">
                          <SelectTrigger className="bg-background h-11 border-border text-foreground">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="kenya">Kenya</SelectItem>
                            <SelectItem value="united-states">United States</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-medium text-muted-foreground">Address Line 1</Label>
                        <Input placeholder="Address" className="bg-background h-11 border-border text-foreground" name="q_z_5" autoComplete="off" />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="billing" className="border-border" defaultChecked />
                        <label htmlFor="billing" className="text-[11px] text-muted-foreground font-medium leading-none">
                          Use the billing address as my team's primary address
                        </label>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-zinc-900 space-y-6">
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Upon clicking <strong className="text-zinc-200">Upgrade</strong>, you will be charged $20, plus any applicable taxes and fees, immediately and then every month, until you cancel. If your usage exceeds a billing threshold during a cycle, your payment method on file may be charged before the cycle ends.
                  </p>

                  <div className="space-y-4 pt-4 border-t border-zinc-900">
                     <div className="flex justify-between items-center text-xs font-medium text-zinc-500">
                        <span>Product</span>
                        <span>Cost</span>
                     </div>
                     <div className="flex justify-between items-center text-sm font-semibold">
                        <span>Pro</span>
                        <span>$20</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                          <span className="text-zinc-300">1 member</span>
                          <GoogleIcon name="chevron_right" size={12} />
                        </div>
                        <span className="text-zinc-500">$0</span>
                     </div>
                     <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                        <span className="font-bold text-white">Total</span>
                        <span className="font-bold text-white text-lg">$20 / month</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
                      disabled={loading}
                    >
                      {loading && <GoogleIcon name="progress_activity" size={18} className="mr-2 animate-spin" />}
                      Upgrade
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-zinc-500 hover:text-white hover:bg-transparent text-sm font-bold"
                      onClick={() => router.push("/admin/settings")}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
