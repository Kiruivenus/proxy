"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/ui/google-icon"
import Link from "next/link"

interface SupportConfig {
  whatsappNumber: string
  whatsappGroup: string
  telegramAgent: string
  telegramGroup: string
}

interface SupportContentProps {
  user?: { email: string; name: string; role: string } | null
}

export function SupportContent({ user }: SupportContentProps) {
  const [supportConfig, setSupportConfig] = useState<SupportConfig>({
    whatsappNumber: "",
    whatsappGroup: "",
    telegramAgent: "",
    telegramGroup: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/support/config")
        if (response.ok) {
          const data = await response.json()
          setSupportConfig(data.config || {
            whatsappNumber: "",
            whatsappGroup: "",
            telegramAgent: "",
            telegramGroup: "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch support config:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const whatsappAgentUrl = supportConfig.whatsappNumber
    ? `https://wa.me/${supportConfig.whatsappNumber.replace(/\D/g, "")}`
    : ""
  const telegramAgentUrl = supportConfig.telegramAgent ? `https://t.me/${supportConfig.telegramAgent}` : ""

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Get Support</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect with our support team via WhatsApp or Telegram
          </p>
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <GoogleIcon name="progress_activity" size={24} className="animate-spin text-accent" />
            </div>
          ) : (
            <>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* WhatsApp Agent */}
                <Card className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                        <GoogleIcon name="chat" size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold text-foreground">WhatsApp Agent</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">Chat with our support agent directly</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {whatsappAgentUrl ? (
                      <Button asChild className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg">
                        <a href={whatsappAgentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <GoogleIcon name="chat" size={14} />
                            Chat on WhatsApp
                          </span>
                          <GoogleIcon name="open_in_new" size={13} />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground">WhatsApp agent not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* WhatsApp Group */}
                <Card className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                        <GoogleIcon name="group" size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold text-foreground">WhatsApp Group</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">Join our community group for updates</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {supportConfig.whatsappGroup ? (
                      <Button asChild variant="outline" className="w-full h-8 text-xs border-border rounded-lg">
                        <a href={supportConfig.whatsappGroup} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <GoogleIcon name="group" size={14} />
                            Join Group
                          </span>
                          <GoogleIcon name="open_in_new" size={13} />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground">WhatsApp group not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Telegram Agent */}
                <Card className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 dark:text-sky-400">
                        <GoogleIcon name="send" size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold text-foreground">Telegram Agent</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">Message our support agent on Telegram</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {telegramAgentUrl ? (
                      <Button asChild className="w-full h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-lg">
                        <a href={telegramAgentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <GoogleIcon name="send" size={14} />
                            Chat on Telegram
                          </span>
                          <GoogleIcon name="open_in_new" size={13} />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground">Telegram agent not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Telegram Group */}
                <Card className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 dark:text-sky-400">
                        <GoogleIcon name="forum" size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold text-foreground">Telegram Group</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">Join our Telegram community</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {supportConfig.telegramGroup ? (
                      <Button asChild variant="outline" className="w-full h-8 text-xs border-border rounded-lg">
                        <a href={supportConfig.telegramGroup} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <GoogleIcon name="forum" size={14} />
                            Join Group
                          </span>
                          <GoogleIcon name="open_in_new" size={13} />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground">Telegram group not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                {/* SMTP Guide */}
                <Card className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400">
                        <GoogleIcon name="menu_book" size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold text-foreground">SMTP Setup Guide</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">Configure email sending with SMTP</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Button asChild className="w-full h-8 text-xs rounded-lg" variant="secondary">
                      <Link href="/guides/smtp-setup" className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <GoogleIcon name="menu_book" size={14} />
                          View Guide
                        </span>
                        <GoogleIcon name="arrow_forward" size={13} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Documentation */}
                <Card className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                        <GoogleIcon name="description" size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold text-foreground">Documentation</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">View our comprehensive documentation</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Button asChild variant="outline" className="w-full h-8 text-xs border-border rounded-lg">
                      <a href="/docs" className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <GoogleIcon name="description" size={14} />
                          Read Docs
                        </span>
                        <GoogleIcon name="open_in_new" size={13} />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* SMTP Guide Preview */}
              <Card className="mt-4 bg-card border-border shadow-xs rounded-xl">
                <CardHeader className="p-4 border-b border-border/60">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <GoogleIcon name="terminal" size={16} className="text-accent" />
                    Quick SMTP Setup
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Get started with email configuration in minutes</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold mb-1.5 text-foreground">Required Environment Variables</h3>
                    <div className="bg-secondary/50 border border-border/60 p-3 rounded-lg space-y-1 font-mono text-[11px]">
                      <div>
                        <p className="text-muted-foreground text-[10px]"># Gmail SMTP</p>
                        <code>SMTP_HOST=smtp.gmail.com</code>
                      </div>
                      <div>
                        <code>SMTP_PORT=587</code>
                      </div>
                      <div>
                        <code>SMTP_USER=your-email@gmail.com</code>
                      </div>
                      <div>
                        <code>SMTP_PASSWORD=your-app-password</code>
                      </div>
                      <div>
                        <code>SMTP_FROM=noreply@yourdomain.com</code>
                      </div>
                      <div className="mt-2 text-muted-foreground">
                        <p className="text-muted-foreground text-[10px]"># Custom SMTP (RayProxy)</p>
                        <code>CUSTOM_SMTP_HOST=mail.rayproxy.com</code>
                      </div>
                      <div>
                        <code>CUSTOM_SMTP_PORT=587</code>
                      </div>
                      <div>
                        <code>CUSTOM_SMTP_USER=your-email@rayproxy.com</code>
                      </div>
                      <div>
                        <code>CUSTOM_SMTP_PASSWORD=your-password</code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-1.5 text-foreground">Node.js Example</h3>
                    <div className="bg-secondary/50 border border-border/60 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
                      <pre>{`import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send email
await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: 'recipient@example.com',
  subject: 'Hello',
  html: '<b>Welcome!</b>',
});`}</pre>
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-500 flex items-start gap-2">
                    <GoogleIcon name="info" size={15} className="shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Note:</strong> For Gmail, you need to generate an{" "}
                      <a
                        href="https://support.google.com/accounts/answer/185833"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-amber-400"
                      >
                        App Password
                      </a>{" "}
                      instead of using your regular password. Enable 2FA first.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
