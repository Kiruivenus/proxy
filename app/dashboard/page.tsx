import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { Check } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/30">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-16 md:py-20 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[0%] left-[10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-5xl relative z-10">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-[36px] font-heading font-bold tracking-tight text-white mb-2 leading-none">
              My Dashboard
            </h1>
            <p className="text-sm md:text-base text-zinc-400">
              Manage your active proxies and premium email accounts.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <DashboardTabs />
          </div>

          <div className="flex items-center justify-center gap-2 mt-12 text-xs text-zinc-500 font-medium animate-in fade-in duration-1000 delay-300">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              <Check className="h-2.5 w-2.5" />
            </div>
            <span>Your privacy and data are always protected.</span>
          </div>
        </div>
      </main>
    </div>
  )
}
