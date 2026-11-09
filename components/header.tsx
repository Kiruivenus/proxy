"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/ui/google-icon"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationPopover } from "@/components/notification-popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"

interface HeaderProps {
  user?: { email: string; name: string; role: string } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      fetch("/api/subscription/status")
        .then((res) => res.json())
        .then((data) => setIsExpired(data.isExpired))
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetch("/api/user/balance")
        .then((res) => res.json())
        .then((data) => {
          if (data.balance !== undefined) {
            setBalance(data.balance)
          }
        })
        .catch(() => {})
    }
  }, [user])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const userInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : user?.email
    ? user.email.trim().charAt(0).toUpperCase()
    : "U"

  return (
    <div className="sticky top-0 z-50">
      {isExpired && (user?.role === "admin" || user?.role === "superadmin") && (
        <div className="bg-destructive text-destructive-foreground py-1.5 px-4 text-center font-bold text-xs">
          internal error : vercel resources exceeded
        </div>
      )}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="container mx-auto flex h-14 items-center justify-between px-3 sm:px-4">
          {/* Horizontal Brand Logo */}
          <Link href="/" className="flex items-center shrink-0 hover:opacity-95 transition-opacity py-0.5">
            <img
              src="/logo-horizontal-dark.png"
              alt="RayProxy"
              className="h-9 sm:h-10 md:h-11 lg:h-[48px] w-auto object-contain hidden dark:block transition-all"
            />
            <img
              src="/logo-horizontal-light.png"
              alt="RayProxy"
              className="h-9 sm:h-10 md:h-11 lg:h-[48px] w-auto object-contain block dark:hidden transition-all"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 lg:gap-5 md:flex">
            {!user ? (
              <Link href="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Home
              </Link>
            ) : (
              <Link href="/dashboard" className="text-xs text-muted-foreground transition-colors hover:text-foreground font-medium">
                Dashboard
              </Link>
            )}
            <Link href="/buy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Buy Proxies
            </Link>
            <Link href="/buy-emails" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Buy Emails
            </Link>
            <Link href="/support" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Support
            </Link>
            <Link href="/docs" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Docs
            </Link>

            {user ? (
              <>
                <Link
                  href="/topup"
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-500 dark:text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/30 shrink-0"
                >
                  <GoogleIcon name="account_balance_wallet" size={13} className="text-emerald-500 dark:text-emerald-400" />
                  <span>KES {balance.toFixed(2)}</span>
                </Link>

                <ThemeToggle />

                <NotificationPopover />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-8 w-8 rounded-full border border-border/60 bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-200 flex items-center justify-center shrink-0 outline-none hover:ring-2 hover:ring-blue-500/20"
                      title="Menu"
                      aria-label="Toggle user menu"
                    >
                      <GoogleIcon name="menu" size={18} className="text-muted-foreground hover:text-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 text-xs p-1 shadow-xl border border-border bg-popover">
                    <div className="px-2 py-2 border-b border-border/60">
                      <p className="font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] bg-secondary/50 rounded px-2 py-1">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                          KES {balance.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 py-1.5 font-medium">
                        <GoogleIcon name="space_dashboard" size={14} />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 py-1.5">
                        <GoogleIcon name="dns" size={14} />
                        My Proxies
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders" className="flex items-center gap-2 py-1.5">
                        <GoogleIcon name="history" size={14} />
                        Order History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/topup" className="flex items-center gap-2 py-1.5">
                        <GoogleIcon name="account_balance_wallet" size={14} />
                        Top Up Balance
                      </Link>
                    </DropdownMenuItem>

                    {(user.role === "admin" || user.role === "superadmin") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 py-1.5 text-blue-500 dark:text-blue-400 font-medium">
                            <GoogleIcon name="shield" size={14} />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {user.role === "superadmin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/settings" className="flex items-center gap-2 py-1.5">
                            <GoogleIcon name="settings" size={14} />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/upgrade" className="flex items-center gap-2 py-1.5">
                            <GoogleIcon name="bolt" size={14} />
                            Upgrade
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 py-1.5 text-red-500">
                      <GoogleIcon name="logout" size={14} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationPopover />
                <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Smartphone / Mobile Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
            {user && (
              <Link
                href="/topup"
                className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400 shrink-0"
              >
                <GoogleIcon name="account_balance_wallet" size={12} />
                <span className="text-[11px] sm:text-xs">KES {balance.toFixed(0)}</span>
              </Link>
            )}

            <ThemeToggle />

            <NotificationPopover />

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  className="h-8 w-8 rounded-full border border-border/60 bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-200 flex items-center justify-center shrink-0 outline-none hover:ring-2 hover:ring-blue-500/20"
                  aria-label="Open navigation menu"
                  title="Menu"
                >
                  <GoogleIcon name="menu" size={18} className="text-muted-foreground hover:text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" showClose={false} className="w-[280px] p-0 gap-0 flex flex-col h-full bg-background border-l border-border">
                {/* Header with single close button */}
                <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3 shrink-0">
                  <div className="flex items-center">
                    <img
                      src="/logo-horizontal-dark.png"
                      alt="RayProxy"
                      className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
                    />
                    <img
                      src="/logo-horizontal-light.png"
                      alt="RayProxy"
                      className="h-8 sm:h-9 w-auto object-contain block dark:hidden"
                    />
                    <SheetTitle className="sr-only">RayProxy</SheetTitle>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <GoogleIcon name="close" size={16} />
                    </Button>
                  </SheetClose>
                </div>

                {/* Scrollable Menu Body */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {user && (
                    <div className="border-b border-border bg-emerald-500/[0.04] px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/topup"
                        onClick={() => setOpen(false)}
                        className="mt-2.5 flex items-center justify-between rounded-md bg-secondary/60 border border-border/60 px-2.5 py-1.5 transition-colors hover:border-emerald-500/30"
                      >
                        <span className="text-xs text-muted-foreground">Balance</span>
                        <span className="font-semibold text-xs text-emerald-500 dark:text-emerald-400">
                          KES {balance.toLocaleString()}
                        </span>
                      </Link>
                    </div>
                  )}

                  <nav className="flex flex-col p-3 text-xs pb-6">
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Navigation
                    </p>
                    {!user ? (
                      <Link
                        href="/"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                      >
                        <GoogleIcon name="home" size={16} className="text-emerald-500" />
                        <span>Home</span>
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60 font-medium"
                      >
                        <GoogleIcon name="space_dashboard" size={16} className="text-emerald-500" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <Link
                      href="/buy"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                    >
                      <GoogleIcon name="shopping_cart" size={16} className="text-emerald-500" />
                      <span>Buy Proxies</span>
                    </Link>
                    <Link
                      href="/buy-emails"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                    >
                      <GoogleIcon name="mail" size={16} className="text-emerald-500" />
                      <span>Buy Emails</span>
                    </Link>
                    <Link
                      href="/support"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                    >
                      <GoogleIcon name="support_agent" size={16} className="text-emerald-500" />
                      <span>Support</span>
                    </Link>
                    <Link
                      href="/docs"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                    >
                      <GoogleIcon name="description" size={16} className="text-emerald-500" />
                      <span>Documentation</span>
                    </Link>

                    {user ? (
                      <>
                        <div className="my-2 border-t border-border" />
                        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Account
                        </p>
                        <Link
                          href="/dashboard"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60 font-medium"
                        >
                          <GoogleIcon name="space_dashboard" size={16} className="text-emerald-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                        >
                          <GoogleIcon name="dns" size={16} className="text-emerald-500" />
                          <span>My Proxies</span>
                        </Link>
                        <Link
                          href="/dashboard/orders"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                        >
                          <GoogleIcon name="history" size={16} className="text-emerald-500" />
                          <span>Order History</span>
                        </Link>
                        <Link
                          href="/topup"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                        >
                          <GoogleIcon name="account_balance_wallet" size={16} className="text-emerald-500" />
                          <span>Top Up Balance</span>
                        </Link>

                        {(user.role === "admin" || user.role === "superadmin") && (
                          <>
                            <div className="my-2 border-t border-border" />
                            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Admin
                            </p>
                            <Link
                              href="/admin"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-blue-500 dark:text-blue-400 font-medium transition-colors hover:bg-secondary/60"
                            >
                              <GoogleIcon name="shield" size={16} className="text-blue-500" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </>
                        )}

                        {user.role === "superadmin" && (
                          <>
                            <Link
                              href="/admin/settings"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                            >
                              <GoogleIcon name="settings" size={16} className="text-emerald-500" />
                              <span>Settings</span>
                            </Link>
                            <Link
                              href="/admin/upgrade"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary/60"
                            >
                              <GoogleIcon name="bolt" size={16} className="text-emerald-500" />
                              <span>Upgrade</span>
                            </Link>
                          </>
                        )}

                        <div className="mt-3 px-2">
                          <Button
                            onClick={() => {
                              handleLogout()
                              setOpen(false)
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2 h-8 text-xs text-red-500 hover:text-red-400"
                          >
                            <GoogleIcon name="logout" size={14} />
                            Logout
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 flex flex-col gap-2 px-2">
                        <Button asChild size="sm" className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                          <Link href="/login" onClick={() => setOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="w-full h-8 text-xs bg-transparent">
                          <Link href="/register" onClick={() => setOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  )
}
