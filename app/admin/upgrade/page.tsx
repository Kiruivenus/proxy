import { requireSuperAdmin } from "@/lib/auth"
import { Header } from "@/components/header"
import { UpgradeForm } from "@/components/superadmin/upgrade-form"

export default async function UpgradePage() {
  const user = await requireSuperAdmin()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 md:py-10">
      <UpgradeForm userName={user.name} />
    </div>
  )
}
