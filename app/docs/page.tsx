import { Header } from '@/components/header'
import { getSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'
import Link from 'next/link'

export const metadata = {
  title: 'Documentation - RayProxy Hub',
  description: 'Complete documentation and guides for RayProxy Hub',
}

export default async function DocsPage() {
  const session = await getSession()

  const guides = [
    {
      icon: 'bolt',
      title: 'Getting Started',
      description: 'Learn the basics of using RayProxy Hub',
      href: '/guides/getting-started',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: 'shield',
      title: 'SMTP Setup Guide',
      description: 'Configure email sending with SMTP',
      href: '/guides/smtp-setup',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: 'help',
      title: 'FAQ',
      description: 'Frequently asked questions and answers',
      href: '/docs/faq',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header user={session?.user ? { email: session.user.email, name: session.user.name, role: session.user.role } : null} />

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Hero */}
        <div className="mb-6 text-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Documentation</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Everything you need to know about using RayProxy Hub
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <div className="grid gap-3 md:grid-cols-3">
            {guides.map((guide) => (
              <Link key={guide.href} href={guide.href} className="group">
                <Card className="h-full bg-card border-border shadow-xs rounded-xl transition-colors hover:border-accent/40">
                  <CardHeader className="p-3.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${guide.bg} ${guide.color}`}>
                      <GoogleIcon name={guide.icon} size={16} />
                    </div>
                    <CardTitle className="text-xs font-semibold text-foreground mt-2">{guide.title}</CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs bg-transparent border-border rounded-lg justify-between">
                      <span>Read Guide</span>
                      <GoogleIcon name="open_in_new" size={12} />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Getting Started Section */}
          <Card className="mt-4 bg-card border-border shadow-xs rounded-xl">
            <CardHeader className="p-3.5 border-b border-border/60">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <GoogleIcon name="menu_book" size={15} className="text-accent" />
                Getting Started with RayProxy Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2.5">
              {[
                { title: 'Create an Account', description: 'Sign up for a free RayProxy Hub account to get started with proxies and emails.' },
                { title: 'Top Up Your Balance', description: 'Add funds to your account using M-Pesa to start purchasing proxies and emails.' },
                { title: 'Buy Proxies', description: 'Browse available proxy locations and purchase daily proxy access.' },
                { title: 'Use Your Proxies', description: 'Access your purchased proxies from the dashboard and use them in your applications.' },
                { title: 'Buy Emails', description: 'Purchase email accounts from various domains for your business needs.' },
                { title: 'Configure SMTP', description: 'Set up SMTP environment variables to send emails from your application.' },
              ].map((item, index) => (
                <div key={index} className="flex gap-2.5 items-start">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-[10px] font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mt-4 bg-card border-border shadow-xs rounded-xl">
            <CardHeader className="p-3.5 border-b border-border/60">
              <CardTitle className="text-xs font-semibold text-foreground">Key Features</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5">
              <div className="grid gap-2.5 md:grid-cols-2">
                {[
                  { title: 'Affordable Proxies', description: 'Daily proxy access from various countries at competitive prices' },
                  { title: 'Email Services', description: 'Purchase quality email accounts for business and personal use' },
                  { title: 'Easy Payments', description: 'Secure M-Pesa payment integration for hassle-free transactions' },
                  { title: '24/7 Support', description: 'Get help from our support team via WhatsApp or Telegram' },
                  { title: 'Dashboard', description: 'Manage your proxies, emails, and purchases from one place' },
                  { title: 'SMTP Support', description: 'Easy SMTP configuration guides for sending emails' },
                ].map((feature, index) => (
                  <div key={index} className="rounded-lg border border-border bg-secondary/40 p-2.5">
                    <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support CTA */}
          <Card className="mt-4 border-accent/30 bg-accent/5 rounded-xl">
            <CardHeader className="p-3.5">
              <CardTitle className="text-xs font-semibold text-foreground">Need Help?</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">Can't find what you're looking for?</CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <Button asChild size="sm" className="h-7 text-xs bg-accent hover:bg-accent/90 text-background rounded-lg">
                <Link href="/support" className="flex items-center gap-1.5">
                  <span>Contact Support</span>
                  <GoogleIcon name="open_in_new" size={12} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
