import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { OrderHistory } from "@/components/order-history"

export default async function OrdersPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="mt-2 text-muted-foreground">View all your past orders</p>
        </div>

        <OrderHistory />
      </main>
    </div>
  )
}
