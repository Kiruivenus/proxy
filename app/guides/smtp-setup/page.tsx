'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SMTPSetupGuide() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const envVariables = `SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourapp.com
SMTP_FROM_NAME=Your App Name`

  const nodejsExample = `import nodemailer from 'nodemailer'

// Create transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Send email
await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: 'recipient@example.com',
  subject: 'Hello',
  html: '<h1>Welcome</h1>',
})`

  const vercelExample = `// app/api/send-email/route.ts
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()

    await transporter.sendMail({
      from: \`\${process.env.SMTP_FROM_NAME} <\${process.env.SMTP_FROM}>\`,
      to,
      subject,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}`

  const gmailSteps = [
    {
      title: 'Enable 2-Factor Authentication',
      description: 'Go to your Google Account and enable 2-factor authentication if you haven\'t already.',
      link: 'https://myaccount.google.com/security',
    },
    {
      title: 'Create App Password',
      description: 'Visit the App Passwords page (requires 2FA) to generate a password for your app.',
      link: 'https://myaccount.google.com/apppasswords',
    },
    {
      title: 'Copy the App Password',
      description: 'Gmail will provide a 16-character password. Use this as your SMTP_PASSWORD.',
    },
    {
      title: 'Set Environment Variables',
      description: 'Add the SMTP variables to your .env.local or Vercel project settings.',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">SMTP Setup Guide</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Configure email sending for your application</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-4 px-4 py-5 sm:px-6">
        {/* Environment Variables */}
        <Card className="bg-card border-border shadow-xs rounded-xl">
          <CardHeader className="p-3.5 border-b border-border/60">
            <CardTitle className="text-xs font-semibold text-foreground">Environment Variables</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">Required configuration for SMTP email sending</CardDescription>
          </CardHeader>
          <CardContent className="p-3.5 space-y-3">
            <div className="relative rounded-lg bg-secondary/60 dark:bg-zinc-900/60 border border-border/60 p-3 font-mono text-[11px]">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words">{envVariables}</pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(envVariables, 'env')}
                className="absolute right-2 top-2 h-7 w-7 p-0"
              >
                {copiedCode === 'env' ? (
                  <GoogleIcon name="check" size={14} className="text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <GoogleIcon name="content_copy" size={14} />
                )}
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {[
                { name: 'SMTP_HOST', desc: 'SMTP server address (e.g., smtp.gmail.com)' },
                { name: 'SMTP_PORT', desc: 'SMTP port (587 for TLS, 465 for SSL)' },
                { name: 'SMTP_USER', desc: 'Email address for authentication' },
                { name: 'SMTP_PASSWORD', desc: 'App password or SMTP password' },
                { name: 'SMTP_FROM', desc: 'Default sender email address' },
                { name: 'SMTP_FROM_NAME', desc: 'Sender display name' },
              ].map((item) => (
                <div key={item.name} className="col-span-2 grid gap-2 sm:grid-cols-2 border-t border-border/40 pt-2 first:border-0 first:pt-0">
                  <p className="font-mono text-[11px] text-foreground font-semibold">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gmail Setup */}
        <Card className="bg-card border-border shadow-xs rounded-xl">
          <CardHeader className="p-3.5 border-b border-border/60">
            <CardTitle className="text-xs font-semibold text-foreground">Gmail Setup</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">Step-by-step guide for Gmail SMTP</CardDescription>
          </CardHeader>
          <CardContent className="p-3.5 space-y-3">
            {gmailSteps.map((step, index) => (
              <div key={index} className="flex gap-2.5 items-start">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-background text-[10px] font-bold mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-foreground">{step.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center text-[11px] text-accent hover:underline"
                    >
                      Open {step.link.split('/')[2]}
                      <GoogleIcon name="arrow_forward" size={11} className="ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-3 rounded-lg bg-accent/10 border border-accent/20 p-2.5 text-xs">
              <p className="font-semibold text-accent text-[11px]">Pro Tip</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Use Gmail's App Passwords instead of your regular password for better security. Never commit environment variables to version control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card className="bg-card border-border shadow-xs rounded-xl">
          <CardHeader className="p-3.5 border-b border-border/60">
            <CardTitle className="text-xs font-semibold text-foreground">Code Examples</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">How to use SMTP in your application</CardDescription>
          </CardHeader>
          <CardContent className="p-3.5">
            <Tabs defaultValue="nodejs" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8 p-0.5 bg-secondary border border-border rounded-lg">
                <TabsTrigger value="nodejs" className="text-xs h-7">Node.js Example</TabsTrigger>
                <TabsTrigger value="vercel" className="text-xs h-7">Next.js / Vercel</TabsTrigger>
              </TabsList>

              <TabsContent value="nodejs" className="space-y-2 mt-2">
                <p className="text-[11px] text-muted-foreground">Basic Node.js nodemailer example</p>
                <div className="relative rounded-lg bg-secondary/60 dark:bg-zinc-900/60 border border-border/60 p-3">
                  <pre className="overflow-x-auto text-[11px] font-mono whitespace-pre-wrap break-words">
                    {nodejsExample}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(nodejsExample, 'nodejs')}
                    className="absolute right-2 top-2 h-7 w-7 p-0"
                  >
                    {copiedCode === 'nodejs' ? (
                      <GoogleIcon name="check" size={14} className="text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <GoogleIcon name="content_copy" size={14} />
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="vercel" className="space-y-2 mt-2">
                <p className="text-[11px] text-muted-foreground">Next.js API Route for email sending</p>
                <div className="relative rounded-lg bg-secondary/60 dark:bg-zinc-900/60 border border-border/60 p-3">
                  <pre className="overflow-x-auto text-[11px] font-mono whitespace-pre-wrap break-words">
                    {vercelExample}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(vercelExample, 'vercel')}
                    className="absolute right-2 top-2 h-7 w-7 p-0"
                  >
                    {copiedCode === 'vercel' ? (
                      <GoogleIcon name="check" size={14} className="text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <GoogleIcon name="content_copy" size={14} />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Other Providers */}
        <Card className="bg-card border-border shadow-xs rounded-xl">
          <CardHeader className="p-3.5 border-b border-border/60">
            <CardTitle className="text-xs font-semibold text-foreground">Other Email Providers</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">SMTP settings for popular email services</CardDescription>
          </CardHeader>
          <CardContent className="p-3.5">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { name: 'SendGrid', host: 'smtp.sendgrid.net', port: '587', user: 'apikey', notes: 'Password is your SendGrid API key' },
                { name: 'AWS SES', host: 'email-smtp.[region].amazonaws.com', port: '587', user: 'Your SMTP username', notes: 'Requires SMTP credentials from AWS SES' },
                { name: 'Mailgun', host: 'smtp.mailgun.org', port: '587', user: 'postmaster@[your domain]', notes: 'Find in Mailgun dashboard' },
                { name: 'Brevo', host: 'smtp-relay.brevo.com', port: '587', user: 'Your Brevo email', notes: 'Get SMTP password from account settings' },
              ].map((provider) => (
                <div key={provider.name} className="rounded-lg border border-border bg-secondary/40 p-2.5">
                  <h3 className="text-xs font-semibold text-foreground">{provider.name}</h3>
                  <div className="mt-1.5 space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Host:</span>
                      <span className="font-mono">{provider.host}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Port:</span>
                      <span className="font-mono">{provider.port}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="bg-card border-border shadow-xs rounded-xl">
          <CardHeader className="p-3.5 border-b border-border/60">
            <CardTitle className="text-xs font-semibold text-foreground">Troubleshooting</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2">
            {[
              { issue: 'Authentication Failed', solution: 'Verify SMTP credentials. For Gmail, use an App Password, not regular password.' },
              { issue: 'Connection Timeout', solution: 'Check that SMTP_HOST and SMTP_PORT are correct. Port 587 (TLS) is recommended.' },
              { issue: 'Environment Variables Not Loading', solution: 'Ensure variables are in .env.local or Vercel settings and restart server.' },
              { issue: 'Emails Going to Spam', solution: 'Set up SPF, DKIM, and DMARC records and avoid spam trigger words.' },
            ].map((item, index) => (
              <div key={index} className="rounded-lg border border-border bg-secondary/40 p-2.5">
                <h3 className="text-xs font-semibold text-rose-500 dark:text-rose-400">{item.issue}</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.solution}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-accent/30 bg-accent/5 rounded-xl">
          <CardHeader className="p-3.5">
            <CardTitle className="text-xs font-semibold text-accent">Security Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 space-y-1 text-[11px] text-muted-foreground">
            <p>• Never commit environment variables to git or public repositories</p>
            <p>• Use environment-specific passwords or API keys</p>
            <p>• Rotate your SMTP password regularly</p>
            <p>• Use TLS (port 587) instead of SSL for better compatibility</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
