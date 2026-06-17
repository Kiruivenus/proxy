import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" })


export const metadata: Metadata = {
  title: {
    default: "RayProxy Hub | Premium Residential Proxies Kenya",
    template: "%s | RayProxy Hub",
  },
  description: "Get high-performance residential proxies instantly. Secure M-Pesa payments, 99.9% uptime, and global coverage. The #1 proxy service in Kenya.",
  keywords: [
    "Residential Proxies Kenya",
    "M-Pesa Proxy Payment",
    "Buy Proxies Kenya",
    "RayProxy Hub",
    "Anonymous Browsing",
    "Data Scraping Proxies",
    "Cheap Proxies Kenya",
  ],
  authors: [{ name: "RayProxy Team" }],
  creator: "RayProxy Hub",
  publisher: "RayProxy Hub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rayproxy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RayProxy Hub | Premium Residential Proxies",
    description: "Purchase premium proxies instantly with M-Pesa. Global coverage and high-speed residential IPs.",
    url: "/",
    siteName: "RayProxy Hub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RayProxy Hub Premium Proxies",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RayProxy Hub | Premium Residential Proxies",
    description: "Instant proxy delivery with M-Pesa. Premium residential IPs for secure browsing.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RayProxy Hub",
    "operatingSystem": "Web",
    "applicationCategory": "NetworkingApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KES"
    },
    "description": "Premium residential proxy service with instant M-Pesa payment integration.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1200"
    }
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased bg-[#050505] text-zinc-100`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
