import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardTabs } from "@/components/dashboard-tabs"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="mt-2 text-muted-foreground">View and manage your purchased proxies</p>
        </div>

        <DashboardTabs />
      </main>
    </div>
  )
}
