'use client'

import { Header } from '@/components/header'
import { getSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, CreditCard, Download, Lock, Mail, Zap, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function GettingStartedPage() {
  const [user, setUser] = useState<any>(null)

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
      icon: Lock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      action: user ? null : { text: 'Register Now', href: '/register' },
      completed: !!user,
    },
    {
      number: 2,
      title: 'Top Up Your Balance',
      description: 'Add funds to your account using M-Pesa to purchase proxies and emails.',
      icon: CreditCard,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      action: user ? { text: 'Top Up', href: '/topup' } : null,
    },
    {
      number: 3,
      title: 'Purchase Proxies',
      description: 'Browse available proxy locations from around the world and purchase daily access.',
      icon: Download,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      action: user ? { text: 'Browse Proxies', href: '/buy' } : null,
    },
    {
      number: 4,
      title: 'Use Your Proxies',
      description: 'Access your purchased proxies from the dashboard and integrate them into your applications.',
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      action: user ? { text: 'View Dashboard', href: '/dashboard' } : null,
    },
    {
      number: 5,
      title: 'Purchase Emails',
      description: 'Buy quality email accounts from various domains for your business needs.',
      icon: Mail,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      action: user ? { text: 'Buy Emails', href: '/buy-emails' } : null,
    },
    {
      number: 6,
      title: 'Configure & Send',
      description: 'Set up SMTP configuration to start sending emails from your applications.',
      icon: ShoppingCart,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
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
    {
      q: 'Can I resell your proxies or emails?',
      a: 'No, reselling is not permitted. Our proxies and emails are for your personal or business use only.',
    },
    {
      q: 'What if I have technical issues?',
      a: 'Contact our support team via WhatsApp or Telegram for immediate assistance. We\'re here to help 24/7.',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Getting Started with RayProxy Hub</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your complete guide to purchasing proxies and emails
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Quick Start Steps */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Quick Start Guide</h2>
          <div className="grid gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className={step.completed ? 'border-green-200 bg-green-50/50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${step.bg}`}>
                          {step.completed ? (
                            <CheckCircle className="h-7 w-7 text-green-500" />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center">
                              <span className="text-lg font-bold text-accent">{step.number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="mt-1 text-muted-foreground">{step.description}</p>
                        {step.action && (
                          <Button asChild className="mt-4" variant={step.completed ? 'default' : 'outline'}>
                            <Link href={step.action.href} className="inline-flex items-center gap-2">
                              {step.action.text}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                      {step.completed && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-green-600">Completed</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Key Features */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Why Choose RayProxy Hub?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Affordable Pricing',
                description: 'Competitive rates for daily proxy access from multiple countries',
                icon: CreditCard,
              },
              {
                title: 'Quality Emails',
                description: 'Premium email accounts from various domains ready to use',
                icon: Mail,
              },
              {
                title: 'Easy Integration',
                description: 'Simple SMTP setup guides and comprehensive documentation',
                icon: Zap,
              },
              {
                title: 'Secure Payments',
                description: 'Safe and easy M-Pesa integration for your transactions',
                icon: Lock,
              },
              {
                title: '24/7 Support',
                description: 'Get help from our support team anytime via WhatsApp or Telegram',
                icon: Download,
              },
              {
                title: 'Instant Activation',
                description: 'Start using your proxies and emails immediately after purchase',
                icon: Zap,
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-lg border border-border bg-accent/5 p-8">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white text-lg font-bold">
                1
              </div>
              <h3 className="mt-4 font-semibold">Sign Up</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your free account in minutes with just an email and password.
              </p>
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white text-lg font-bold">
                2
              </div>
              <h3 className="mt-4 font-semibold">Add Funds</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Top up your balance using M-Pesa for quick and secure payments.
              </p>
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white text-lg font-bold">
                3
              </div>
              <h3 className="mt-4 font-semibold">Purchase & Use</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse our catalog and start using proxies and emails instantly.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-lg border border-border bg-accent/10 p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="mt-2 text-muted-foreground">Join thousands of users already using RayProxy Hub</p>
          {user ? (
            <Button asChild size="lg" className="mt-6">
              <Link href="/buy">Start Shopping</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="mt-6">
              <Link href="/register">Create Free Account</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
