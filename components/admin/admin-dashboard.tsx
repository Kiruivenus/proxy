"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyManagement } from "@/components/admin/proxy-management"
import { PricingManagement } from "@/components/admin/pricing-management"
import { OrderManagement } from "@/components/admin/order-management"
import { UserManagement } from "@/components/admin/user-management"
import { EmailManagement } from "@/components/admin/email-management"
import { SupportSettings } from "@/components/admin/support-settings"
import { Server, DollarSign, Receipt, Users, Mail, MessageCircle } from "lucide-react"

export function AdminDashboard() {
  return (
    <Tabs defaultValue="proxies" className="w-full">
      <TabsList className="grid w-full max-w-full grid-cols-6">
        <TabsTrigger value="proxies" className="gap-2">
          <Server className="h-4 w-4" />
          <span className="hidden sm:inline">Proxies</span>
        </TabsTrigger>
        <TabsTrigger value="emails" className="gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Emails</span>
        </TabsTrigger>
        <TabsTrigger value="pricing" className="gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Pricing</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Orders</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Users</span>
        </TabsTrigger>
        <TabsTrigger value="support" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Support</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="proxies" className="mt-6">
        <ProxyManagement />
      </TabsContent>

      <TabsContent value="emails" className="mt-6">
        <EmailManagement />
      </TabsContent>

      <TabsContent value="pricing" className="mt-6">
        <PricingManagement />
      </TabsContent>

      <TabsContent value="orders" className="mt-6">
        <OrderManagement />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <UserManagement />
      </TabsContent>

      <TabsContent value="support" className="mt-6">
        <SupportSettings />
      </TabsContent>
    </Tabs>
  )
}
