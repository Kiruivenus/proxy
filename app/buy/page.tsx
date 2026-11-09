import { getSession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { Header } from "@/components/header"
import { ProxyPurchaseForm } from "@/components/proxy-purchase-form"
import type { Pricing } from "@/lib/types"
import { redirect } from "next/navigation"

export default async function BuyPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const db = await getDb()
  const pricing = await db.collection<Pricing>("pricing").find({ isEnabled: true }).toArray()

  const pricingData = pricing.map((p) => ({
    country: p.country,
    countryCode: p.countryCode,
    daily: p.daily,
  }))

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/30">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-4xl relative">
        <ProxyPurchaseForm pricing={pricingData} userId={session.user._id.toString()} />
      </main>
    </div>
  )
}
