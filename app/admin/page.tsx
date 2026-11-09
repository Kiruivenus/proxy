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

        <AdminDashboard />
      </div>
    )
  } catch {
    redirect("/login")
  }
}
