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
    <div className="min-h-screen bg-background">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold">Buy Email Accounts</h1>
          <p className="mt-2 text-muted-foreground">
            Select your preferred email domain and purchase premium accounts for your business.
          </p>

          <div className="mt-8">
            <EmailPurchaseForm />
          </div>
        </div>
      </main>
    </div>
  )
}
