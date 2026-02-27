"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Loader2, ArrowLeft } from "lucide-react"

type Step = "email" | "code" | "password"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
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

      setSuccess("Reset code sent to your email")
      setStep("code")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, action: "verify-code" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid reset code")
        return
      }

      setSuccess("Code verified. Now set your new password.")
      setStep("password")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
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

      setSuccess("Password reset successfully! Redirecting to login...")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border border-border/50 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <CardHeader className="space-y-4 border-b border-border/50 pb-8">
            <Link href="/" className="mx-auto flex items-center gap-2 transition-transform hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">RayProxy Hub</span>
            </Link>
            <div className="text-center">
              <CardTitle className="text-3xl">Reset Password</CardTitle>
              <CardDescription className="mt-2 text-base">Recover access to your account</CardDescription>
            </div>
          </CardHeader>

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleSendCode}>
              <CardContent className="space-y-5 pt-8">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                )}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-background/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the email address associated with your account. We'll send you a reset code.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-8">
                <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Code"}
                </Button>
                <Button variant="ghost" asChild className="w-full justify-center gap-2">
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
              </CardFooter>
            </form>
          )}

          {/* Code Verification Step */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode}>
              <CardContent className="space-y-5 pt-8">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                )}
                <div className="space-y-3">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Reset Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter the code from your email"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="h-11 bg-background/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Check your email for the 6-digit reset code. It expires in 30 minutes.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-8">
                <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("email")
                    setError("")
                    setSuccess("")
                  }}
                  className="w-full justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </CardFooter>
            </form>
          )}

          {/* Password Reset Step */}
          {step === "password" && (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-5 pt-8">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                )}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-background/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-background/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-8">
                <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
