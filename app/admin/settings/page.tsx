import { requireSuperAdmin } from "@/lib/auth"
import { Header } from "@/components/header"
import { SettingsForm } from "@/components/superadmin/settings-form"
import { GoogleIcon } from "@/components/ui/google-icon"

export default async function SettingsPage() {
  const user = await requireSuperAdmin()

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ email: user.email, name: user.name, role: user.role }} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <GoogleIcon name="shield_person" size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SuperAdmin Settings</h1>
            <p className="text-xs text-muted-foreground">Configure platform-wide subscription and limits</p>
          </div>
        </div>

        <SettingsForm />
      </main>
    </div>
  )
}
