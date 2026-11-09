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
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/30">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-4xl relative">
        <TopUpForm currentBalance={session.user.balance || 0} />
      </main>
    </div>
  )
}
