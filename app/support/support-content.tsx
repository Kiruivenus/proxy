"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, ExternalLink, BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"

interface SupportConfig {
  whatsappNumber: string
  whatsappGroup: string
  telegramAgent: string
  telegramGroup: string
}

export function SupportContent() {
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
      <Header user={null} />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Get Support</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Connect with our support team via WhatsApp or Telegram
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {/* WhatsApp Agent */}
                <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                        <MessageCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <CardTitle>WhatsApp Agent</CardTitle>
                    </div>
                    <CardDescription>Chat with our support agent directly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {whatsappAgentUrl ? (
                      <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                        <a href={whatsappAgentUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Chat on WhatsApp
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">WhatsApp agent not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* WhatsApp Group */}
                <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                        <Users className="h-5 w-5 text-green-500" />
                      </div>
                      <CardTitle>WhatsApp Group</CardTitle>
                    </div>
                    <CardDescription>Join our community group for updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {supportConfig.whatsappGroup ? (
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <a href={supportConfig.whatsappGroup} target="_blank" rel="noopener noreferrer" className="flex gap-2">
                          <Users className="h-4 w-4" />
                          Join Group
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">WhatsApp group not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Telegram Agent */}
                <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                        <MessageCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardTitle>Telegram Agent</CardTitle>
                    </div>
                    <CardDescription>Message our support agent on Telegram</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {telegramAgentUrl ? (
                      <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                        <a href={telegramAgentUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Chat on Telegram
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Telegram agent not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Telegram Group */}
                <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardTitle>Telegram Group</CardTitle>
                    </div>
                    <CardDescription>Join our Telegram community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {supportConfig.telegramGroup ? (
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <a href={supportConfig.telegramGroup} target="_blank" rel="noopener noreferrer" className="flex gap-2">
                          <Users className="h-4 w-4" />
                          Join Group
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Telegram group not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {/* SMTP Guide */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                      </div>
                      <CardTitle>SMTP Setup Guide</CardTitle>
                    </div>
                    <CardDescription>Configure email sending with SMTP</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/guides/smtp-setup" className="flex gap-2">
                        <BookOpen className="h-4 w-4" />
                        View Guide
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Documentation */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                      </div>
                      <CardTitle>Documentation</CardTitle>
                    </div>
                    <CardDescription>View our comprehensive documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <a href="/docs" className="flex gap-2">
                        <BookOpen className="h-4 w-4" />
                        Read Docs
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* SMTP Guide Preview */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Quick SMTP Setup</span>
                  </CardTitle>
                  <CardDescription>Get started with email configuration in minutes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Required Environment Variables</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-3 font-mono text-sm">
                      <div>
                        <p className="text-muted-foreground"># Gmail SMTP</p>
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
                      <div className="mt-4 text-muted-foreground">
                        <p># Custom SMTP (RayProxy)</p>
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
                    <h3 className="font-semibold mb-2">Node.js Example</h3>
                    <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
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

                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-amber-700">
                      <strong>Note:</strong> For Gmail, you need to generate an{" "}
                      <a
                        href="https://support.google.com/accounts/answer/185833"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-amber-800"
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
