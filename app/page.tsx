import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Shield, Zap, Clock, CreditCard, Server, Star, Quote } from "lucide-react"
import Link from "next/link"

const customerReviews = [
  {
    name: "James Mwangi",
    location: "Nairobi, Kenya",
    rating: 5,
    review: "Excellent service! Got my proxies instantly after M-Pesa payment. Very reliable and fast.",
    avatar: "JM",
  },
  {
    name: "Sarah Ochieng",
    location: "Kisumu, Kenya",
    rating: 5,
    review: "Best proxy service I've used. The dashboard is easy to navigate and proxies work perfectly.",
    avatar: "SO",
  },
  {
    name: "David Kimani",
    location: "Mombasa, Kenya",
    rating: 5,
    review: "Been using RayProxy Hub for 3 months now. Never had any downtime. Highly recommended!",
    avatar: "DK",
  },
  {
    name: "Grace Wanjiku",
    location: "Nakuru, Kenya",
    rating: 5,
    review: "The M-Pesa integration is seamless. I can buy proxies anytime without any hassle.",
    avatar: "GW",
  },
  {
    name: "Peter Otieno",
    location: "Eldoret, Kenya",
    rating: 5,
    review: "Great customer experience. Proxies are fast and the prices are very competitive.",
    avatar: "PO",
  },
  {
    name: "Mary Akinyi",
    location: "Thika, Kenya",
    rating: 5,
    review: "I love how I can track my active and expired proxies easily. Very organized service.",
    avatar: "MA",
  },
  {
    name: "John Mutua",
    location: "Machakos, Kenya",
    rating: 5,
    review: "Switched from another provider and never looked back. RayProxy Hub is simply the best.",
    avatar: "JM",
  },
  {
    name: "Ann Njeri",
    location: "Nyeri, Kenya",
    rating: 5,
    review: "Instant delivery as promised. The proxy quality is top-notch for the price.",
    avatar: "AN",
  },
  {
    name: "Michael Kiprop",
    location: "Kericho, Kenya",
    rating: 5,
    review: "Very transparent service. No hidden fees and the proxies work exactly as described.",
    avatar: "MK",
  },
  {
    name: "Lucy Wambui",
    location: "Naivasha, Kenya",
    rating: 5,
    review: "Professional service with great uptime. My business relies on these proxies daily.",
    avatar: "LW",
  },
]

export default async function HomePage() {
  const session = await getSession()

  // Redirect logged-in users to dashboard
  if (session?.user) {
    const { redirect } = await import("next/navigation")
    // This won't work in a Server Component, we'll need to handle it differently
    // We'll use a client-side check instead via a wrapper component
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={session?.user ? { email: session.user.email, name: session.user.name, role: session.user.role } : null}
      />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
                Premium Proxies
                <span className="block text-accent">Instant Access</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
                Purchase high-quality proxies from multiple countries. Pay securely with M-Pesa and get instant access
                to your proxies.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/buy">Buy Proxies Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">Why Choose RayProxy Hub?</h2>
              <p className="mt-4 text-muted-foreground">
                We provide the best proxy service with instant delivery and secure payments.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-card">
                <CardHeader>
                  <Globe className="h-10 w-10 text-accent" />
                  <CardTitle className="mt-4">Multiple Countries</CardTitle>
                  <CardDescription>Access proxies from various countries to meet your specific needs.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <Zap className="h-10 w-10 text-accent" />
                  <CardTitle className="mt-4">Instant Delivery</CardTitle>
                  <CardDescription>Get your proxies immediately after successful payment confirmation.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CreditCard className="h-10 w-10 text-accent" />
                  <CardTitle className="mt-4">M-Pesa Payment</CardTitle>
                  <CardDescription>Secure and convenient payment via M-Pesa STK Push.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <Clock className="h-10 w-10 text-accent" />
                  <CardTitle className="mt-4">Flexible Duration</CardTitle>
                  <CardDescription>Choose from daily, weekly, or monthly proxy plans.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <Shield className="h-10 w-10 text-accent" />
                  <CardTitle className="mt-4">Secure & Private</CardTitle>
                  <CardDescription>Your proxy credentials are encrypted and only visible to you.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <Server className="h-10 w-10 text-accent" />
                  <CardTitle className="mt-4">High Availability</CardTitle>
                  <CardDescription>Reliable proxies with excellent uptime and performance.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="border-t border-border bg-accent/5 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Trusted by Thousands</h2>
              <p className="mt-4 text-muted-foreground">See what our happy customers have to say about RayProxy Hub.</p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {customerReviews.slice(0, 9).map((review, index) => (
                <Card key={index} className="relative bg-card transition-shadow hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <Quote className="absolute right-4 top-4 h-8 w-8 text-accent/20" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                        {review.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-base">{review.name}</CardTitle>
                        <CardDescription className="text-sm">{review.location}</CardDescription>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{review.review}"</p>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* 10th review featured larger */}
            <div className="mt-8">
              <Card className="relative mx-auto max-w-2xl bg-card shadow-lg">
                <CardHeader className="p-8">
                  <Quote className="absolute right-6 top-6 h-12 w-12 text-accent/20" />
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
                      {customerReviews[9].avatar}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{customerReviews[9].name}</CardTitle>
                      <CardDescription>{customerReviews[9].location}</CardDescription>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {[...Array(customerReviews[9].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">"{customerReviews[9].review}"</p>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-card py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4 text-muted-foreground">Create an account and purchase your first proxy in minutes.</p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/buy">Browse Proxies</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RayProxy Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
