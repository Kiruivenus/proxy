"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2, Upload, AlertCircle, Edit2 } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface Proxy {
  id: string
  ip: string
  port: number
  username?: string
  password?: string
  country: string
  countryCode: string
  maxUsage: number
  currentUsage: number
  expiresAt: string
  isActive: boolean
  status: "available" | "expired" | "dead"
  createdAt: string
}

interface PricingItem {
  id: string
  country: string
  countryCode: string
  daily: number
  isEnabled: boolean
}

export function ProxyManagement() {
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [pricing, setPricing] = useState<PricingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ open: false, title: "", description: "", onConfirm: () => {} })

  const [newProxy, setNewProxy] = useState({
    ip: "",
    port: "",
    username: "",
    password: "",
    country: "",
    countryCode: "",
    maxUsage: "10",
    expiresAt: "",
  })

  const [bulkData, setBulkData] = useState("")
  const [bulkCountry, setBulkCountry] = useState("")

  useEffect(() => {
    fetchProxies()
    fetchPricing()
  }, [])

  const fetchProxies = async () => {
    try {
      const res = await fetch("/api/admin/proxies")
      const data = await res.json()
      setProxies(data.proxies || [])
    } catch (error) {
      console.error("Failed to fetch proxies:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/admin/pricing")
      const data = await res.json()
      setPricing(data.pricing || [])
    } catch (error) {
      console.error("Failed to fetch pricing:", error)
    }
  }

  const handleCountrySelect = (country: string) => {
    const selectedPricing = pricing.find((p) => p.country === country)
    if (selectedPricing) {
      setNewProxy({
        ...newProxy,
        country: selectedPricing.country,
        countryCode: selectedPricing.countryCode,
      })
    }
  }

  const handleAddProxy = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/proxies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProxy,
          port: Number.parseInt(newProxy.port),
          maxUsage: Number.parseInt(newProxy.maxUsage),
        }),
      })

      if (res.ok) {
        setAddOpen(false)
        setNewProxy({
          ip: "",
          port: "",
          username: "",
          password: "",
          country: "",
          countryCode: "",
          maxUsage: "10",
          expiresAt: "",
        })
        fetchProxies()
      }
    } catch (error) {
      console.error("Failed to add proxy:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkUpload = async () => {
    setSubmitting(true)
    try {
      const selectedPricing = pricing.find((p) => p.country === bulkCountry)
      if (!selectedPricing) {
        setSubmitting(false)
        return
      }

      // Parse bulk data (format: ip:port:username:password:maxUsage:expiresAt)
      const lines = bulkData.split("\n").filter((line) => line.trim())
      const proxiesToAdd = lines.map((line) => {
        const parts = line.split(":")
        return {
          ip: parts[0],
          port: parts[1],
          username: parts[2] || "",
          password: parts[3] || "",
          country: selectedPricing.country,
          countryCode: selectedPricing.countryCode,
          maxUsage: parts[4] || "10",
          expiresAt: parts[5],
        }
      })

      const res = await fetch("/api/admin/proxies/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proxies: proxiesToAdd }),
      })

      if (res.ok) {
        setBulkOpen(false)
        setBulkData("")
        setBulkCountry("")
        fetchProxies()
      }
    } catch (error) {
      console.error("Failed to bulk upload:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/proxies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      fetchProxies()
    } catch (error) {
      console.error("Failed to update proxy:", error)
    }
  }

  const handleStatusChange = async (id: string, status: "available" | "expired" | "dead") => {
    try {
      await fetch(`/api/admin/proxies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchProxies()
    } catch (error) {
      console.error("Failed to update proxy status:", error)
    }
  }

  const handleEdit = (proxy: Proxy) => {
    setEditingProxy(proxy)
    setNewProxy({
      ip: proxy.ip,
      port: proxy.port.toString(),
      username: proxy.username || "",
      password: proxy.password || "",
      country: proxy.country,
      countryCode: proxy.countryCode,
      maxUsage: proxy.maxUsage.toString(),
      expiresAt: new Date(proxy.expiresAt).toISOString().slice(0, 16),
    })
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingProxy) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/proxies/${editingProxy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: newProxy.ip,
          port: Number.parseInt(newProxy.port),
          username: newProxy.username,
          password: newProxy.password,
          maxUsage: Number.parseInt(newProxy.maxUsage),
          expiresAt: newProxy.expiresAt,
        }),
      })

      if (res.ok) {
        setEditOpen(false)
        setEditingProxy(null)
        setNewProxy({
          ip: "",
          port: "",
          username: "",
          password: "",
          country: "",
          countryCode: "",
          maxUsage: "10",
          expiresAt: "",
        })
        fetchProxies()
      }
    } catch (error) {
      console.error("Failed to update proxy:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Proxy",
      description: "This proxy will be permanently deleted. This action cannot be undone.",
      onConfirm: async () => {
        setSubmitting(true)
        try {
          await fetch(`/api/admin/proxies/${id}`, { method: "DELETE" })
          fetchProxies()
        } catch (error) {
          console.error("Failed to delete proxy:", error)
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

  const noPricingConfigured = pricing.length === 0

  return (
    <div className="space-y-6">
      {noPricingConfigured && (
        <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-4 text-amber-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Please add country pricing first before adding proxies.</p>
        </div>
      )}

      <div className="flex gap-4">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={noPricingConfigured}>
              <Plus className="mr-2 h-4 w-4" />
              Add Proxy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Proxy</DialogTitle>
              <DialogDescription>Enter the proxy details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IP Address</Label>
                  <Input
                    value={newProxy.ip}
                    onChange={(e) => setNewProxy({ ...newProxy, ip: e.target.value })}
                    placeholder="192.168.1.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    value={newProxy.port}
                    onChange={(e) => setNewProxy({ ...newProxy, port: e.target.value })}
                    placeholder="8080"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username (optional)</Label>
                  <Input
                    value={newProxy.username}
                    onChange={(e) => setNewProxy({ ...newProxy, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password (optional)</Label>
                  <Input
                    value={newProxy.password}
                    onChange={(e) => setNewProxy({ ...newProxy, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={newProxy.country} onValueChange={handleCountrySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricing.map((p) => (
                      <SelectItem key={p.id} value={p.country}>
                        {p.country} ({p.countryCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Usage</Label>
                  <Input
                    type="number"
                    value={newProxy.maxUsage}
                    onChange={(e) => setNewProxy({ ...newProxy, maxUsage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expires At</Label>
                  <Input
                    type="datetime-local"
                    value={newProxy.expiresAt}
                    onChange={(e) => setNewProxy({ ...newProxy, expiresAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddProxy} disabled={submitting || !newProxy.country}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Proxy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={noPricingConfigured}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Proxies</DialogTitle>
              <DialogDescription>
                Select a country and enter one proxy per line in format: ip:port:username:password:maxUsage:expiresAt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={bulkCountry} onValueChange={setBulkCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricing.map((p) => (
                      <SelectItem key={p.id} value={p.country}>
                        {p.country} ({p.countryCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder="192.168.1.1:8080:user:pass:10:2025-12-31T23:59"
                rows={10}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleBulkUpload} disabled={submitting || !bulkCountry}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Proxy</DialogTitle>
              <DialogDescription>Update the proxy details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IP Address</Label>
                  <Input
                    value={newProxy.ip}
                    onChange={(e) => setNewProxy({ ...newProxy, ip: e.target.value })}
                    placeholder="192.168.1.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    value={newProxy.port}
                    onChange={(e) => setNewProxy({ ...newProxy, port: e.target.value })}
                    placeholder="8080"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username (optional)</Label>
                  <Input
                    value={newProxy.username}
                    onChange={(e) => setNewProxy({ ...newProxy, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password (optional)</Label>
                  <Input
                    value={newProxy.password}
                    onChange={(e) => setNewProxy({ ...newProxy, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Usage</Label>
                  <Input
                    type="number"
                    value={newProxy.maxUsage}
                    onChange={(e) => setNewProxy({ ...newProxy, maxUsage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expires At</Label>
                  <Input
                    type="datetime-local"
                    value={newProxy.expiresAt}
                    onChange={(e) => setNewProxy({ ...newProxy, expiresAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proxies ({proxies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {proxies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No proxies added yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP:Port</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proxy Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proxies.map((proxy) => (
                  <TableRow key={proxy.id}>
                    <TableCell className="font-mono text-sm">
                      {proxy.ip}:{proxy.port}
                    </TableCell>
                    <TableCell>{proxy.country}</TableCell>
                    <TableCell>
                      {proxy.currentUsage}/{proxy.maxUsage}
                    </TableCell>
                    <TableCell>{new Date(proxy.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {proxy.status === "dead" ? (
                        <Badge className="bg-red-500/20 text-red-500">Dead</Badge>
                      ) : new Date(proxy.expiresAt) < new Date() ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : proxy.currentUsage >= proxy.maxUsage ? (
                        <Badge variant="secondary">Full</Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-500">Available</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={proxy.status} onValueChange={(v) => handleStatusChange(proxy.id, v as any)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="dead">Dead</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={proxy.isActive}
                        onCheckedChange={(checked) => handleToggleActive(proxy.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(proxy)}>
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(proxy.id)}>
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
