import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleIcon } from "@/components/ui/google-icon"
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
]

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/30">
      <Header
        user={session?.user ? { email: session.user.email, name: session.user.name, role: session.user.role } : null}
      />

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-8 md:pt-12 md:pb-12 border-b border-border/40">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[20%] w-[35%] h-[35%] bg-accent/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-accent/5 rounded-full blur-[100px]" />
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="text-balance text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2.5">
              Premium Proxies <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                Instant Access
              </span>
            </h1>
            
            <p className="mx-auto max-w-lg text-xs sm:text-sm text-muted-foreground mb-5 leading-relaxed">
              Scale your data extraction with high-quality proxies from multiple countries. Pay securely with M-Pesa and get instant access to your infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Button size="sm" className="w-full sm:w-auto h-8 px-4 text-xs group bg-accent hover:bg-accent/90 text-background font-semibold rounded-lg shadow-sm" asChild>
                <Link href="/buy">
                  Buy Proxies Now
                  <GoogleIcon name="arrow_forward" size={13} className="ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto h-8 px-4 text-xs bg-background/50 border-border/60 hover:bg-muted/50 rounded-lg" asChild>
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="py-3 border-b border-border/40 bg-secondary/40">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Trusted by thousands of users across Kenya
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 opacity-60 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><GoogleIcon name="shield" size={15} /> SecureNet</div>
              <div className="flex items-center gap-1.5"><GoogleIcon name="public" size={15} /> DataScrape</div>
              <div className="flex items-center gap-1.5"><GoogleIcon name="dns" size={15} /> InfraScale</div>
              <div className="flex items-center gap-1.5"><GoogleIcon name="bolt" size={15} /> SpeedProxy</div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-8 md:py-10 relative">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-6">
              <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1 text-foreground">Why Choose RayProxy Hub?</h2>
              <p className="text-xs text-muted-foreground">
                Built for performance, reliability, and ease of use.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[
                { icon: "public", title: "Multiple Countries", desc: "Access premium residential and datacenter IPs from diverse locations." },
                { icon: "bolt", title: "Instant Delivery", desc: "Your proxies are active immediately after successful payment confirmation." },
                { icon: "phone_android", title: "M-Pesa Payment", desc: "Seamless and secure local payments via automated M-Pesa STK Push." },
                { icon: "schedule", title: "Flexible Duration", desc: "Choose from daily, weekly, or monthly plans that fit your project scale." },
                { icon: "lock", title: "Secure & Private", desc: "Military-grade encryption ensures your proxy credentials stay private." },
                { icon: "dns", title: "99.9% Uptime", desc: "Highly available infrastructure built to handle your heaviest workloads." },
              ].map((feature, idx) => (
                <Card key={idx} className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-3.5">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-2 text-accent">
                      <GoogleIcon name={feature.icon} size={16} />
                    </div>
                    <CardTitle className="text-xs font-semibold text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground mt-0.5">{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-8 md:py-10 bg-secondary/30 border-y border-border/40 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1">How It Works</h2>
              <p className="text-xs text-muted-foreground">Start using your proxies in three simple steps.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center max-w-[240px]">
                <div className="h-12 w-12 rounded-xl bg-card border border-border shadow-xs flex items-center justify-center mb-2.5 relative">
                  <GoogleIcon name="person_add" size={20} className="text-muted-foreground" />
                  <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-accent text-background font-bold text-[10px] flex items-center justify-center">1</div>
                </div>
                <h3 className="text-xs font-bold mb-1">Create Account</h3>
                <p className="text-[11px] text-muted-foreground">Sign up in seconds and access our intuitive dashboard.</p>
              </div>

              <div className="flex flex-col items-center text-center max-w-[240px]">
                <div className="h-12 w-12 rounded-xl bg-card border border-border shadow-xs flex items-center justify-center mb-2.5 relative">
                  <GoogleIcon name="credit_card" size={20} className="text-muted-foreground" />
                  <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-accent text-background font-bold text-[10px] flex items-center justify-center">2</div>
                </div>
                <h3 className="text-xs font-bold mb-1">Pay via M-Pesa</h3>
                <p className="text-[11px] text-muted-foreground">Select your plan and complete payment securely via phone.</p>
              </div>

              <div className="flex flex-col items-center text-center max-w-[240px]">
                <div className="h-12 w-12 rounded-xl bg-card border border-border shadow-xs flex items-center justify-center mb-2.5 relative">
                  <GoogleIcon name="check_circle" size={20} className="text-muted-foreground" />
                  <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-accent text-background font-bold text-[10px] flex items-center justify-center">3</div>
                </div>
                <h3 className="text-xs font-bold mb-1">Get Proxies</h3>
                <p className="text-[11px] text-muted-foreground">Credentials are delivered instantly to your dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-6">
              <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1">Trusted by Thousands</h2>
              <p className="text-xs text-muted-foreground">See what developers and businesses are saying about RayProxy Hub.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {customerReviews.map((review, index) => (
                <Card key={index} className="bg-card border-border shadow-xs rounded-xl">
                  <CardHeader className="p-3.5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-[11px]">
                        {review.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold text-foreground/90">{review.name}</CardTitle>
                        <CardDescription className="text-[10px]">{review.location}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-1.5 text-accent">
                      {[...Array(review.rating)].map((_, i) => (
                        <GoogleIcon key={i} name="star" size={13} filled />
                      ))}
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground/90">"{review.review}"</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-8 md:py-10 relative overflow-hidden border-t border-border/40">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1.5 text-foreground">Ready to Get Started?</h2>
            <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
              Create an account and purchase your first high-performance proxy in minutes.
            </p>
            <Button size="sm" className="h-8 px-5 text-xs group bg-accent hover:bg-accent/90 text-background font-semibold rounded-lg shadow-sm" asChild>
              <Link href="/buy">
                Browse Proxies
                <GoogleIcon name="arrow_forward" size={13} className="ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-secondary/30 dark:bg-zinc-950 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="inline-flex items-center mb-2">
                <img
                  src="/logo-horizontal-dark.png"
                  alt="RayProxy"
                  className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
                />
                <img
                  src="/logo-horizontal-light.png"
                  alt="RayProxy"
                  className="h-8 sm:h-9 w-auto object-contain block dark:hidden"
                />
              </Link>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Premium proxy infrastructure for modern teams. Reliable, secure, and delivered instantly.
              </p>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-2">Platform</h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/" className="text-muted-foreground hover:text-accent transition-colors">Home</Link></li>
                <li><Link href="/buy" className="text-muted-foreground hover:text-accent transition-colors">Buy Proxies</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-accent transition-colors">Dashboard</Link></li>
                <li><Link href="/docs" className="text-muted-foreground hover:text-accent transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-2">Legal</h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="/support" className="text-muted-foreground hover:text-accent transition-colors">Support Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} RayProxy Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent"></span>
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
