"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Globe,
  LogOut,
  Menu,
  User,
  Shield,
  X,
  Home,
  ShoppingCart,
  LayoutDashboard,
  History,
  Wallet,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

interface HeaderProps {
  user?: { email: string; name: string; role: string } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [balance, setBalance] = useState<number>(0)

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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold">RayProxy Hub</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {!user && (
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
          )}
          <Link href="/buy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Buy Proxies
          </Link>
          <Link href="/buy-emails" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Buy Emails
          </Link>
          <Link href="/support" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Support
          </Link>
          <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Docs
          </Link>
          {user ? (
            <>
              <Link
                href="/topup"
                className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
              >
                <Wallet className="h-4 w-4" />
                KES {balance.toLocaleString()}
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">My Proxies</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders">Order History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/topup" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Top Up Balance
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <Link
              href="/topup"
              className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
            >
              <Wallet className="h-4 w-4" />
              <span>KES {balance.toLocaleString()}</span>
            </Link>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <div className="flex items-center justify-between border-b border-border bg-accent/5 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-accent" />
                  <span className="text-lg font-bold">RayProxy Hub</span>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              {user && (
                <div className="border-b border-border bg-accent/10 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/topup"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex items-center justify-between rounded-lg bg-background/50 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="font-semibold text-accent">KES {balance.toLocaleString()}</span>
                  </Link>
                </div>
              )}

              <nav className="flex flex-col p-4">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Navigation
                </p>
                {!user && (
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                  >
                    <Home className="h-5 w-5 text-accent" />
                    <span className="font-medium">Home</span>
                  </Link>
                )}
                <Link
                  href="/buy"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                >
                  <ShoppingCart className="h-5 w-5 text-accent" />
                  <span className="font-medium">Buy Proxies</span>
                </Link>
                <Link
                  href="/buy-emails"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                >
                  <ShoppingCart className="h-5 w-5 text-accent" />
                  <span className="font-medium">Buy Emails</span>
                </Link>
                <Link
                  href="/support"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                >
                  <span className="h-5 w-5 text-accent text-lg">🤝</span>
                  <span className="font-medium">Support</span>
                </Link>
                <Link
                  href="/docs"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                >
                  <span className="h-5 w-5 text-accent text-lg">📖</span>
                  <span className="font-medium">Documentation</span>
                </Link>

                {user ? (
                  <>
                    <div className="my-3 border-t border-border" />
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account
                    </p>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                    >
                      <LayoutDashboard className="h-5 w-5 text-accent" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                    >
                      <History className="h-5 w-5 text-accent" />
                      <span className="font-medium">Order History</span>
                    </Link>
                    <Link
                      href="/topup"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                    >
                      <Wallet className="h-5 w-5 text-accent" />
                      <span className="font-medium">Top Up Balance</span>
                    </Link>

                    {user.role === "admin" && (
                      <>
                        <div className="my-3 border-t border-border" />
                        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Admin
                        </p>
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-accent/10"
                        >
                          <Shield className="h-5 w-5 text-accent" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      </>
                    )}

                    <div className="mt-4 px-2">
                      <Button
                        onClick={() => {
                          handleLogout()
                          setOpen(false)
                        }}
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-6 flex flex-col gap-3 px-2">
                    <Button asChild className="w-full">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/register" onClick={() => setOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </nav>

              <div className="absolute inset-x-0 bottom-0 border-t border-border bg-accent/5 px-6 py-4">
                <p className="text-center text-xs text-muted-foreground">Premium Proxies, Instant Access</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
