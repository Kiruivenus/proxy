import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { TopUpForm } from "@/components/topup-form"

export default async function TopUpPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Top Up Balance</h1>
            <p className="mt-2 text-muted-foreground">Add funds to your account via M-Pesa</p>
          </div>

          <TopUpForm currentBalance={session.user.balance || 0} />
        </div>
      </main>
    </div>
  )
}
