"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Trash2, Mail, Edit2 } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface PricingItem {
  id: string
  country: string
  countryCode: string
  daily: number
  isEnabled: boolean
}

interface EmailDomain {
  _id: string
  domain: string
}

interface EmailPricingItem {
  id: string
  domainId: string
  domain: string
  pricePerEmail: number
  isEnabled: boolean
}

export function PricingManagement() {
  const [pricing, setPricing] = useState<PricingItem[]>([])
  const [emailDomains, setEmailDomains] = useState<EmailDomain[]>([])
  const [emailPricing, setEmailPricing] = useState<EmailPricingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editProxyPricingOpen, setEditProxyPricingOpen] = useState(false)
  const [addEmailPricingOpen, setAddEmailPricingOpen] = useState(false)
  const [editEmailPricingOpen, setEditEmailPricingOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("proxy")
  const [editingProxyPricing, setEditingProxyPricing] = useState<PricingItem | null>(null)
  const [editingEmailPricing, setEditingEmailPricing] = useState<EmailPricingItem | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ open: false, title: "", description: "", onConfirm: () => {} })

  const [newPricing, setNewPricing] = useState({
    country: "",
    countryCode: "",
    daily: "",
  })

  const [newEmailPricing, setNewEmailPricing] = useState({
    domainId: "",
    pricePerEmail: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pricingRes, domainsRes, emailPricingRes] = await Promise.all([
        fetch("/api/admin/pricing"),
        fetch("/api/admin/emails/domains"),
        fetch("/api/admin/emails/pricing"),
      ])

      if (pricingRes.ok) {
        const data = await pricingRes.json()
        setPricing(data.pricing || [])
      }

      if (domainsRes.ok) {
        const data = await domainsRes.json()
        setEmailDomains(data.domains || [])
      }

      if (emailPricingRes.ok) {
        const data = await emailPricingRes.json()
        setEmailPricing(data.pricing || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPricing = async () => {
    fetchData()
  }

  const handleAddPricing = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPricing,
          daily: Number.parseInt(newPricing.daily),
        }),
      })

      if (res.ok) {
        setAddOpen(false)
        setNewPricing({
          country: "",
          countryCode: "",
          daily: "",
        })
        fetchPricing()
      }
    } catch (error) {
      console.error("Failed to add pricing:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEnabled = async (id: string, isEnabled: boolean) => {
    try {
      await fetch(`/api/admin/pricing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled }),
      })
      fetchPricing()
    } catch (error) {
      console.error("Failed to update pricing:", error)
    }
  }

  const handleEditProxyPricing = (item: PricingItem) => {
    setEditingProxyPricing(item)
    setNewPricing({
      country: item.country,
      countryCode: item.countryCode,
      daily: item.daily.toString(),
    })
    setEditProxyPricingOpen(true)
  }

  const handleSaveEditProxyPricing = async () => {
    if (!editingProxyPricing) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/pricing/${editingProxyPricing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daily: Number.parseInt(newPricing.daily),
          isEnabled: editingProxyPricing.isEnabled,
        }),
      })

      if (res.ok) {
        setEditProxyPricingOpen(false)
        setEditingProxyPricing(null)
        setNewPricing({ country: "", countryCode: "", daily: "" })
        fetchPricing()
      }
    } catch (error) {
      console.error("Failed to update pricing:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Proxy Pricing",
      description: "This pricing configuration will be permanently deleted.",
      onConfirm: async () => {
        setSubmitting(true)
        try {
          await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" })
          fetchPricing()
        } catch (error) {
          console.error("Failed to delete pricing:", error)
        } finally {
          setSubmitting(false)
        }
      },
    })
  }

  const handleAddEmailPricing = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/emails/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: newEmailPricing.domainId,
          pricePerEmail: Number.parseInt(newEmailPricing.pricePerEmail),
        }),
      })

      if (res.ok) {
        setAddEmailPricingOpen(false)
        setNewEmailPricing({ domainId: "", pricePerEmail: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to add email pricing:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEmailPricing = (item: EmailPricingItem) => {
    setEditingEmailPricing(item)
    setNewEmailPricing({
      domainId: item.domainId,
      pricePerEmail: item.pricePerEmail.toString(),
    })
    setEditEmailPricingOpen(true)
  }

  const handleSaveEditEmailPricing = async () => {
    if (!editingEmailPricing) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/emails/pricing/${editingEmailPricing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricePerEmail: Number.parseInt(newEmailPricing.pricePerEmail),
        }),
      })

      if (res.ok) {
        setEditEmailPricingOpen(false)
        setEditingEmailPricing(null)
        setNewEmailPricing({ domainId: "", pricePerEmail: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to update email pricing:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEmailPricing = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Email Pricing",
      description: "This email pricing configuration will be permanently deleted.",
      onConfirm: async () => {
        setSubmitting(true)
        try {
          await fetch(`/api/admin/emails/pricing/${id}`, { method: "DELETE" })
          fetchData()
        } catch (error) {
          console.error("Failed to delete email pricing:", error)
        } finally {
          setSubmitting(false)
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="proxy">Proxy Pricing</TabsTrigger>
        <TabsTrigger value="email">Email Pricing</TabsTrigger>
      </TabsList>

      <TabsContent value="proxy" className="space-y-6">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Country Pricing
            </Button>
          </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Country Pricing</DialogTitle>
            <DialogDescription>Set daily proxy price for a country</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={newPricing.country}
                  onChange={(e) => setNewPricing({ ...newPricing, country: e.target.value })}
                  placeholder="Kenya"
                />
              </div>
              <div className="space-y-2">
                <Label>Country Code</Label>
                <Input
                  value={newPricing.countryCode}
                  onChange={(e) => setNewPricing({ ...newPricing, countryCode: e.target.value })}
                  placeholder="KE"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Daily Price (KES)</Label>
              <Input
                type="number"
                value={newPricing.daily}
                onChange={(e) => setNewPricing({ ...newPricing, daily: e.target.value })}
                placeholder="50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddPricing} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Pricing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Country Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          {pricing.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pricing configured yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Daily Price</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.country} ({item.countryCode})
                    </TableCell>
                    <TableCell>KES {item.daily}</TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isEnabled}
                        onCheckedChange={(checked) => handleToggleEnabled(item.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProxyPricing(item)}>
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="email" className="space-y-6">
        <Dialog open={addEmailPricingOpen} onOpenChange={setAddEmailPricingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Email Domain Pricing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Email Domain Pricing</DialogTitle>
              <DialogDescription>Set price per email for a domain</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Email Domain</Label>
                <Select value={newEmailPricing.domainId} onValueChange={(v) => setNewEmailPricing({ ...newEmailPricing, domainId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain..." />
                  </SelectTrigger>
                  <SelectContent>
                    {emailDomains.map((domain) => (
                      <SelectItem key={domain._id} value={domain._id}>
                        {domain.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price per Email (KES)</Label>
                <Input
                  type="number"
                  value={newEmailPricing.pricePerEmail}
                  onChange={(e) => setNewEmailPricing({ ...newEmailPricing, pricePerEmail: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddEmailPricing} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Pricing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Email Domain Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            {emailPricing.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No email pricing configured yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Price per Email</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailPricing.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-accent" />
                        {item.domain}
                      </TableCell>
                      <TableCell>KES {item.pricePerEmail}</TableCell>
                      <TableCell>
                        <Switch checked={item.isEnabled} />
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditEmailPricing(item)}>
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEmailPricing(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog open={editProxyPricingOpen} onOpenChange={setEditProxyPricingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Country Pricing</DialogTitle>
          <DialogDescription>Update daily proxy price for {editingProxyPricing?.country}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Daily Price (KES)</Label>
            <Input
              type="number"
              value={newPricing.daily}
              onChange={(e) => setNewPricing({ ...newPricing, daily: e.target.value })}
              placeholder="50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveEditProxyPricing} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={editEmailPricingOpen} onOpenChange={setEditEmailPricingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Email Pricing</DialogTitle>
          <DialogDescription>Update price for {editingEmailPricing?.domain}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Price Per Email (KES)</Label>
            <Input
              type="number"
              value={newEmailPricing.pricePerEmail}
              onChange={(e) => setNewEmailPricing({ ...newEmailPricing, pricePerEmail: e.target.value })}
              placeholder="10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveEditEmailPricing} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Delete"
        onConfirm={confirmDialog.onConfirm}
        isLoading={submitting}
        variant="destructive"
      />
    </div>
  )
}
