import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { GoogleIcon } from "@/components/ui/google-icon"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/30">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-4 md:py-6 relative">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[0%] left-[10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-5xl relative z-10">
          <div className="mb-3.5">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground leading-tight">
              My Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your active proxies and premium email accounts.
            </p>
          </div>

          <div>
            <DashboardTabs />
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-6 text-[10px] text-muted-foreground font-medium">
            <GoogleIcon name="verified_user" size={13} className="text-emerald-500 dark:text-emerald-400" />
            <span>Your privacy and data are always protected.</span>
          </div>
        </div>
      </main>
    </div>
  )
}
