import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { OrderHistory } from "@/components/order-history"

export const metadata = {
  title: "Order History - RayProxy Hub",
  description: "View all your past proxy and email orders",
}

export default async function OrdersPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-3 sm:px-4 py-5 md:py-8 max-w-5xl">
        <OrderHistory />
      </main>
    </div>
  )
}
