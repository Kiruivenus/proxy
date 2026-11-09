"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyManagement } from "@/components/admin/proxy-management"
import { PricingManagement } from "@/components/admin/pricing-management"
import { OrderManagement } from "@/components/admin/order-management"
import { UserManagement } from "@/components/admin/user-management"
import { EmailManagement } from "@/components/admin/email-management"
import { SupportSettings } from "@/components/admin/support-settings"
import { Analytics } from "@/components/admin/analytics"
import { GoogleIcon } from "@/components/ui/google-icon"

export function AdminDashboard() {
  return (
    <Tabs defaultValue="analytics" className="w-full">
      {/* Sticky Admin Navigation attached right below main header (top-14 / 56px) */}
      <div className="sticky top-14 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5">
          <TabsList className="bg-transparent p-0 h-auto w-full flex flex-wrap items-center gap-1.5 sm:gap-2">
            <TabsTrigger
              value="analytics"
              className="flex-1 min-w-[75px] sm:min-w-fit h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-secondary/50 dark:bg-[#0e131d] text-muted-foreground hover:text-foreground text-xs font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-blue-500/25 flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="bar_chart" size={14} className="shrink-0" />
              <span>Analytics</span>
            </TabsTrigger>

            <TabsTrigger
              value="proxies"
              className="flex-1 min-w-[75px] sm:min-w-fit h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-secondary/50 dark:bg-[#0e131d] text-muted-foreground hover:text-foreground text-xs font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-blue-500/25 flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="dns" size={14} className="shrink-0" />
              <span>Proxies</span>
            </TabsTrigger>

            <TabsTrigger
              value="pricing"
              className="flex-1 min-w-[75px] sm:min-w-fit h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-secondary/50 dark:bg-[#0e131d] text-muted-foreground hover:text-foreground text-xs font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-blue-500/25 flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="payments" size={14} className="shrink-0" />
              <span>Pricing</span>
            </TabsTrigger>

            <TabsTrigger
              value="orders"
              className="flex-1 min-w-[75px] sm:min-w-fit h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-secondary/50 dark:bg-[#0e131d] text-muted-foreground hover:text-foreground text-xs font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-blue-500/25 flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="receipt_long" size={14} className="shrink-0" />
              <span>Orders</span>
            </TabsTrigger>

            <TabsTrigger
              value="users"
              className="flex-1 min-w-[75px] sm:min-w-fit h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-secondary/50 dark:bg-[#0e131d] text-muted-foreground hover:text-foreground text-xs font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-blue-500/25 flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="group" size={14} className="shrink-0" />
              <span>Users</span>
            </TabsTrigger>

            <TabsTrigger
              value="emails"
              className="flex-1 min-w-[75px] sm:min-w-fit h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-secondary/50 dark:bg-[#0e131d] text-muted-foreground hover:text-foreground text-xs font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-blue-500/25 flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="mail" size={14} className="shrink-0" />
              <span>Emails</span>
            </TabsTrigger>

            <TabsTrigger
              value="support"
              className="flex-1 min-w-[75px] sm:min-w-fit h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-secondary/50 dark:bg-[#0e131d] text-muted-foreground hover:text-foreground text-xs font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-blue-500/25 flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="support_agent" size={14} className="shrink-0" />
              <span>Support</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Main Admin Tab Contents */}
      <main className="container mx-auto px-4 py-4 md:py-6">
        <TabsContent value="analytics" className="mt-0 outline-none">
          <Analytics />
        </TabsContent>

        <TabsContent value="proxies" className="mt-0 outline-none">
          <ProxyManagement />
        </TabsContent>

        <TabsContent value="pricing" className="mt-0 outline-none">
          <PricingManagement />
        </TabsContent>

        <TabsContent value="orders" className="mt-0 outline-none">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="users" className="mt-0 outline-none">
          <UserManagement />
        </TabsContent>

        <TabsContent value="emails" className="mt-0 outline-none">
          <EmailManagement />
        </TabsContent>

        <TabsContent value="support" className="mt-0 outline-none">
          <SupportSettings />
        </TabsContent>
      </main>
    </Tabs>
  )
}
