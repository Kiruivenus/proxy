import { Header } from '@/components/header'
import { getSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Shield, Zap, HelpCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Documentation - RayProxy Hub',
  description: 'Complete documentation and guides for RayProxy Hub',
}

export default async function DocsPage() {
  const session = await getSession()

  const guides = [
    {
      icon: Zap,
      title: 'Getting Started',
      description: 'Learn the basics of using RayProxy Hub',
      href: '/guides/getting-started',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: Shield,
      title: 'SMTP Setup Guide',
      description: 'Configure email sending with SMTP',
      href: '/guides/smtp-setup',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Frequently asked questions and answers',
      href: '/docs/faq',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header user={session?.user} />

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Documentation</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Everything you need to know about using RayProxy Hub
          </p>
        </div>

        {/* Quick Links */}
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            {guides.map((guide) => {
              const Icon = guide.icon
              return (
                <Link key={guide.href} href={guide.href}>
                  <Card className="h-full transition-all hover:border-accent/50 hover:shadow-md">
                    <CardHeader>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${guide.bg}`}>
                        <Icon className={`h-6 w-6 ${guide.color}`} />
                      </div>
                      <CardTitle className="mt-4">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Read Guide
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Getting Started Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                Getting Started with RayProxy Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    title: 'Create an Account',
                    description:
                      'Sign up for a free RayProxy Hub account to get started with proxies and emails.',
                  },
                  {
                    title: 'Top Up Your Balance',
                    description: 'Add funds to your account using M-Pesa to start purchasing proxies and emails.',
                  },
                  {
                    title: 'Buy Proxies',
                    description: 'Browse available proxy locations and purchase daily proxy access.',
                  },
                  {
                    title: 'Use Your Proxies',
                    description: 'Access your purchased proxies from the dashboard and use them in your applications.',
                  },
                  {
                    title: 'Buy Emails',
                    description:
                      'Purchase email accounts from various domains for your business needs.',
                  },
                  {
                    title: 'Configure SMTP',
                    description: 'Set up SMTP environment variables to send emails from your application.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    title: 'Affordable Proxies',
                    description: 'Daily proxy access from various countries at competitive prices',
                  },
                  {
                    title: 'Email Services',
                    description: 'Purchase quality email accounts for business and personal use',
                  },
                  {
                    title: 'Easy Payments',
                    description: 'Secure M-Pesa payment integration for hassle-free transactions',
                  },
                  {
                    title: '24/7 Support',
                    description: 'Get help from our support team via WhatsApp or Telegram',
                  },
                  {
                    title: 'Dashboard',
                    description: 'Manage your proxies, emails, and purchases from one place',
                  },
                  {
                    title: 'SMTP Support',
                    description: 'Easy SMTP configuration guides for sending emails',
                  },
                ].map((feature, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <p className="font-semibold">{feature.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support CTA */}
          <Card className="mt-6 border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Can't find what you're looking for?</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/support" className="flex gap-2">
                  Contact Support
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
