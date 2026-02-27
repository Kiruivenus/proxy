import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  try {
    const user = await requireAdmin()

    return (
      <div className="min-h-screen bg-background">
        <Header user={{ email: user.email, name: user.name, role: user.role }} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage proxies, pricing, and orders</p>
          </div>

          <AdminDashboard />
        </main>
      </div>
    )
  } catch {
    redirect("/login")
  }
}
