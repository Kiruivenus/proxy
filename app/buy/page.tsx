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
    <div className="min-h-screen bg-background">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold">Buy Proxies</h1>
          <p className="mt-2 text-muted-foreground">
            Select your preferred country and complete your purchase with M-Pesa.
          </p>

          <div className="mt-8">
            <ProxyPurchaseForm pricing={pricingData} userId={session.user._id.toString()} />
          </div>
        </div>
      </main>
    </div>
  )
}
