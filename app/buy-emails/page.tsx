import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"
import { EmailPurchaseForm } from "@/components/email-purchase-form"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Buy Emails - RayProxy Hub",
  description: "Purchase premium email accounts from RayProxy Hub",
}

export default async function BuyEmailsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/30">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-4xl relative">
        <EmailPurchaseForm />
      </main>
    </div>
  )
}
