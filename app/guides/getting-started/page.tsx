'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function GettingStartedPage() {
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    })()
  }, [])

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up for a free RayProxy Hub account to get started.',
      icon: 'lock',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      action: user ? null : { text: 'Register Now', href: '/register' },
      completed: !!user,
    },
    {
      number: 2,
      title: 'Top Up Your Balance',
      description: 'Add funds to your account using M-Pesa to purchase proxies and emails.',
      icon: 'account_balance_wallet',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      action: user ? { text: 'Top Up', href: '/topup' } : null,
    },
    {
      number: 3,
      title: 'Purchase Proxies',
      description: 'Browse available proxy locations from around the world and purchase daily access.',
      icon: 'public',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      action: user ? { text: 'Browse Proxies', href: '/buy' } : null,
    },
    {
      number: 4,
      title: 'Use Your Proxies',
      description: 'Access your purchased proxies from the dashboard and integrate them into your applications.',
      icon: 'bolt',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      action: user ? { text: 'View Dashboard', href: '/dashboard' } : null,
    },
    {
      number: 5,
      title: 'Purchase Emails',
      description: 'Buy quality email accounts from various domains for your business needs.',
      icon: 'mail',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      action: user ? { text: 'Buy Emails', href: '/buy-emails' } : null,
    },
    {
      number: 6,
      title: 'Configure & Send',
      description: 'Set up SMTP configuration to start sending emails from your applications.',
      icon: 'terminal',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      action: { text: 'View SMTP Guide', href: '/guides/smtp-setup' },
    },
  ]

  const faqs = [
    {
      q: 'What payment methods do you accept?',
      a: 'We currently accept M-Pesa for payment. More payment methods will be added soon.',
    },
    {
      q: 'How long are the proxies valid for?',
      a: 'Proxies are sold on a daily basis. Once purchased, they remain active until the expiry time shown in your dashboard.',
    },
    {
      q: 'Can I purchase proxies from multiple countries?',
      a: 'Yes! We have proxies available from various countries. You can purchase from different locations and use them simultaneously.',
    },
    {
      q: 'How do I use my purchased proxies?',
      a: 'After purchasing a proxy, you can find the IP, port, username, and password in your dashboard. Use these credentials to configure your application.',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />

      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Getting Started</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your complete guide to purchasing proxies and emails
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">
        {/* Quick Start Steps */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Quick Start Guide</h2>
          <div className="grid gap-2.5">
            {steps.map((step, index) => (
              <Card key={index} className={`bg-card border-border shadow-xs rounded-xl ${step.completed ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
                <CardContent className="p-3.5">
                  <div className="flex gap-3 items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg border flex-shrink-0 ${step.bg} ${step.color}`}>
                      {step.completed ? (
                        <GoogleIcon name="check_circle" size={18} className="text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <span className="text-xs font-bold text-accent">{step.number}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-foreground">{step.title}</h3>
                        {step.completed && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Completed</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                    {step.action && (
                      <Button asChild size="sm" className="h-7 text-xs px-2.5 flex-shrink-0 rounded-lg" variant={step.completed ? 'default' : 'outline'}>
                        <Link href={step.action.href} className="inline-flex items-center gap-1">
                          <span>{step.action.text}</span>
                          <GoogleIcon name="arrow_forward" size={11} />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Frequently Asked Questions</h2>
          <div className="grid gap-2">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-card border-border shadow-xs rounded-xl">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs font-semibold text-foreground">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
          <h2 className="text-sm font-bold text-foreground">Ready to Get Started?</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Join thousands of users already using RayProxy Hub</p>
          <div className="mt-3">
            {user ? (
              <Button asChild size="sm" className="h-7 text-xs bg-accent hover:bg-accent/90 text-background rounded-lg">
                <Link href="/buy">Start Shopping</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="h-7 text-xs bg-accent hover:bg-accent/90 text-background rounded-lg">
                <Link href="/register">Create Free Account</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
