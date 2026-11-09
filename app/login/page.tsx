"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/ui/google-icon"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      if (data.user?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
      router.refresh()
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
            Global <span className="text-accent">Infrastructure</span> <br />
            for Modern Teams
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Scale your operations with our premium residential and datacenter proxies. Secure, fast, and completely reliable.
          </p>
        </div>
        
        {/* Trust Indicators */}
        <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--color-accent),0.8)]" />
            <span>Systems Operational</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
          <span>SOC2 Certified</span>
          <div className="h-1 w-1 rounded-full bg-border" />
          <span>99.9% Uptime</span>
        </div>
      </div>

      {/* Right Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 bg-background lg:hidden">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-accent/5 to-transparent" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[80px]" />
        </div>
        
        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
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

          <div className="text-center lg:text-left mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-1 text-foreground">Welcome back</h2>
            <p className="text-xs text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-foreground/90">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
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
            </div>

            <Button 
              type="submit" 
              className="group w-full h-9 mt-1 bg-accent hover:bg-accent/90 text-background font-semibold text-xs transition-colors rounded-lg shadow-sm" 
              disabled={loading}
            >
              {loading ? (
                <GoogleIcon name="progress_activity" size={16} className="mr-2 animate-spin" />
              ) : (
                <>
                  Sign In
                  <GoogleIcon name="arrow_forward" size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-foreground hover:text-accent transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

