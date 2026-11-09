"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/ui/google-icon"

type Step = "request" | "reset" | "success"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const getPasswordStrength = () => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }

  const strength = getPasswordStrength()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "send-code" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send reset code")
        return
      }

      setStep("reset")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!code) {
      setError("Please enter the reset code")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, action: "reset-password" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to reset password")
        return
      }

      setStep("success")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Left Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-muted/30 dark:bg-zinc-950 border-r border-border">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-background" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
        
        {/* Branding */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center transition-transform hover:scale-105 duration-300">
            <img
              src="/logo-horizontal-dark.png"
              alt="RayProxy"
              className="h-12 sm:h-14 w-auto object-contain hidden dark:block"
            />
            <img
              src="/logo-horizontal-light.png"
              alt="RayProxy"
              className="h-12 sm:h-14 w-auto object-contain block dark:hidden"
            />
          </Link>
        </div>

        {/* Hero Message */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Secure Account <br />
            <span className="text-accent">Recovery</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Follow the steps to securely verify your identity and regain access to your RayProxy account.
          </p>
          
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2.5 text-foreground/90 text-xs">
              <GoogleIcon name="verified_user" size={16} className="text-accent" />
              <span>Encrypted verification process</span>
            </div>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--color-accent),0.8)]" />
            <span>Secure process</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
          <span>SOC2 Certified</span>
        </div>
      </div>

      {/* Right Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 bg-background lg:hidden z-0">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-accent/5 to-transparent" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[80px]" />
        </div>
        
        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out py-8">
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/logo-horizontal-dark.png"
                alt="RayProxy"
                className="h-10 sm:h-11 w-auto object-contain hidden dark:block"
              />
              <img
                src="/logo-horizontal-light.png"
                alt="RayProxy"
                className="h-10 sm:h-11 w-auto object-contain block dark:hidden"
              />
            </Link>
          </div>

          <div className="mb-6">
            <Link href="/login" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 group">
              <GoogleIcon name="arrow_back" size={14} className="mr-1.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Login
            </Link>
            <h2 className="text-xl font-bold tracking-tight mb-1 text-foreground">
              {step === "request" && "Recover access"}
              {step === "reset" && "Reset password"}
              {step === "success" && "Success!"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {step === "request" && "Enter your email to receive a reset code."}
              {step === "reset" && "Check your email for the reset code and enter your new password."}
              {step === "success" && "Your password has been successfully reset."}
            </p>
          </div>

          {/* Request Code Step */}
          {step === "request" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-2">
                  <GoogleIcon name="error" size={15} />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground/90">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent">
                    <GoogleIcon name="mail" size={16} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-8 h-9 text-xs bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-accent"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="group w-full h-9 mt-2 bg-accent hover:bg-accent/90 text-background font-semibold text-xs transition-colors rounded-lg shadow-sm" 
                disabled={loading}
              >
                {loading ? (
                  <GoogleIcon name="progress_activity" size={16} className="mr-2 animate-spin" />
                ) : (
                  <>
                    Send Reset Code
                    <GoogleIcon name="arrow_forward" size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Enter Code + New Password Step */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-2">
                  <GoogleIcon name="error" size={15} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="code" className="text-xs font-medium text-foreground/90">
                    Reset Code
                  </Label>
                  <button 
                    type="button" 
                    onClick={() => setStep("request")}
                    className="text-[11px] text-accent hover:text-accent/80 transition-colors"
                  >
                    Resend code
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent">
                    <GoogleIcon name="key" size={16} />
                  </div>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="pl-8 h-9 text-xs bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-accent"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-foreground/90">
                  New Password
                </Label>
                <div className="relative group">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent">
                    <GoogleIcon name="lock" size={16} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-8 h-9 text-xs bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-accent"
                  />
                </div>
                {password.length > 0 && (
                  <div className="pt-1">
                    <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 transition-all duration-300 ${
                            strength >= i 
                              ? strength <= 2 ? "bg-amber-500" : "bg-accent" 
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">
                      {strength <= 1 && "Weak"}
                      {strength === 2 && "Fair"}
                      {strength === 3 && "Good"}
                      {strength >= 4 && "Strong"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground/90">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent">
                    <GoogleIcon name="lock" size={16} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-8 h-9 text-xs bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-accent"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="group w-full h-9 mt-2 bg-accent hover:bg-accent/90 text-background font-semibold text-xs transition-colors rounded-lg shadow-sm" 
                disabled={loading}
              >
                {loading ? (
                  <GoogleIcon name="progress_activity" size={16} className="mr-2 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <GoogleIcon name="arrow_forward" size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                <GoogleIcon name="check_circle" size={28} className="text-accent" />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-6">
                  Your password has been successfully reset. You can now use your new password to sign in.
                </p>
                <Button asChild className="group w-full h-9 bg-accent hover:bg-accent/90 text-background font-semibold text-xs transition-colors rounded-lg shadow-sm">
                  <Link href="/login">
                    Back to Login
                    <GoogleIcon name="arrow_forward" size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
