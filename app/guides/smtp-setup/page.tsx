'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
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
      <div className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">SMTP Setup Guide</h1>
          <p className="mt-2 text-muted-foreground">Configure email sending for your application</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Required configuration for SMTP email sending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-md bg-muted p-4 font-mono text-sm">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words">{envVariables}</pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(envVariables, 'env')}
                className="absolute right-2 top-2"
              >
                {copiedCode === 'env' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-sm">Variable</p>
              </div>
              <div>
                <p className="font-semibold text-sm">Description</p>
              </div>

              {[
                { name: 'SMTP_HOST', desc: 'SMTP server address (e.g., smtp.gmail.com)' },
                { name: 'SMTP_PORT', desc: 'SMTP port (587 for TLS, 465 for SSL)' },
                { name: 'SMTP_USER', desc: 'Email address for authentication' },
                { name: 'SMTP_PASSWORD', desc: 'App password or SMTP password' },
                { name: 'SMTP_FROM', desc: 'Default sender email address' },
                { name: 'SMTP_FROM_NAME', desc: 'Sender display name' },
              ].map((item) => (
                <div key={item.name} className="col-span-2 grid gap-4 sm:grid-cols-2 border-t border-border pt-4 first:border-0 first:pt-0">
                  <p className="font-mono text-sm">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gmail Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Gmail Setup</CardTitle>
            <CardDescription>Step-by-step guide for Gmail SMTP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gmailSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-accent hover:underline"
                    >
                      Open {step.link.split('/')[2]}
                      <span className="ml-1">→</span>
                    </a>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-6 rounded-md bg-accent/10 p-4 text-sm">
              <p className="font-semibold text-accent">Pro Tip</p>
              <p className="mt-1 text-muted-foreground">
                Use Gmail's App Passwords instead of your regular password for better security. Never commit environment variables to version control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>How to use SMTP in your application</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="nodejs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nodejs">Node.js Example</TabsTrigger>
                <TabsTrigger value="vercel">Next.js / Vercel</TabsTrigger>
              </TabsList>

              <TabsContent value="nodejs" className="space-y-4">
                <p className="text-sm text-muted-foreground">Basic Node.js nodemailer example</p>
                <div className="relative rounded-md bg-muted p-4">
                  <pre className="overflow-x-auto text-xs font-mono whitespace-pre-wrap break-words">
                    {nodejsExample}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(nodejsExample, 'nodejs')}
                    className="absolute right-2 top-2"
                  >
                    {copiedCode === 'nodejs' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="vercel" className="space-y-4">
                <p className="text-sm text-muted-foreground">Next.js API Route for email sending</p>
                <div className="relative rounded-md bg-muted p-4">
                  <pre className="overflow-x-auto text-xs font-mono whitespace-pre-wrap break-words">
                    {vercelExample}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(vercelExample, 'vercel')}
                    className="absolute right-2 top-2"
                  >
                    {copiedCode === 'vercel' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Other Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Other Email Providers</CardTitle>
            <CardDescription>SMTP settings for popular email services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: 'SendGrid',
                host: 'smtp.sendgrid.net',
                port: '587',
                user: 'apikey',
                notes: 'Password is your SendGrid API key',
              },
              {
                name: 'AWS SES',
                host: 'email-smtp.[region].amazonaws.com',
                port: '587',
                user: 'Your SMTP username from AWS Console',
                notes: 'Requires SMTP credentials from AWS SES',
              },
              {
                name: 'Mailgun',
                host: 'smtp.mailgun.org',
                port: '587',
                user: 'postmaster@[your domain]',
                notes: 'Find your domain in Mailgun dashboard',
              },
              {
                name: 'Brevo (Sendinblue)',
                host: 'smtp-relay.brevo.com',
                port: '587',
                user: 'Your Brevo email',
                notes: 'Get SMTP password from account settings',
              },
            ].map((provider) => (
              <div key={provider.name} className="rounded-lg border border-border p-4">
                <h3 className="font-semibold">{provider.name}</h3>
                <div className="mt-3 grid gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Host</p>
                    <p className="font-mono">{provider.host}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Port</p>
                    <p className="font-mono">{provider.port}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Username</p>
                    <p className="font-mono text-xs">{provider.user}</p>
                  </div>
                  {provider.notes && (
                    <div className="rounded bg-muted/50 p-2 text-xs">
                      <p className="text-muted-foreground">{provider.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                issue: 'Authentication Failed',
                solution: 'Verify your SMTP_USER and SMTP_PASSWORD are correct. For Gmail, ensure you\'re using an App Password, not your regular password.',
              },
              {
                issue: 'Connection Timeout',
                solution: 'Check that SMTP_HOST and SMTP_PORT are correct. Port 587 (TLS) is recommended over 465 (SSL).',
              },
              {
                issue: 'Environment Variables Not Loading',
                solution: 'Make sure variables are set in Vercel project settings or your .env.local file. Restart your development server after adding them.',
              },
              {
                issue: 'Emails Going to Spam',
                solution: 'Set up SPF, DKIM, and DMARC records for your domain. Use a proper sender name and avoid spam trigger words.',
              },
            ].map((item, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-destructive">{item.issue}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.solution}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-accent">Security Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Never commit environment variables to git or public repositories</p>
            <p>Use environment-specific passwords or API keys</p>
            <p>Rotate your SMTP password regularly</p>
            <p>Use TLS (port 587) instead of SSL for better compatibility</p>
            <p>Monitor failed email sends for suspicious activity</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
