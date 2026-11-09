"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GoogleIcon } from "@/components/ui/google-icon"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import { AddProxyModal } from "./add-proxy-modal"
import { EditProxyModal } from "./edit-proxy-modal"
import { BulkUploadModal } from "./bulk-upload-modal"

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
  const { toast } = useToast()
  
  // Table state
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [pricing, setPricing] = useState<PricingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState("")

  // Modal control states (edit is managed externally because it loads specific proxy)
  const [editOpen, setEditOpen] = useState(false)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ open: false, title: "", description: "", onConfirm: () => {} })

  // Search input debouncer
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(handler)
  }, [search])

  // Fetch paginated proxies from server
  const fetchProxies = useCallback(async (
    currentPage: number, 
    currentLimit: number, 
    currentSearch: string,
    currentStatus: string,
    currentActive: string
  ) => {
    setLoading(true)
    try {
      const url = new URL("/api/admin/proxies", window.location.origin)
      url.searchParams.set("page", currentPage.toString())
      url.searchParams.set("limit", currentLimit.toString())
      if (currentSearch) url.searchParams.set("search", currentSearch)
      if (currentStatus) url.searchParams.set("status", currentStatus)
      if (currentActive) url.searchParams.set("isActive", currentActive)

      const res = await fetch(url.toString())
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch proxies")

      setProxies(data.proxies || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (error: any) {
      console.error("Failed to fetch proxies:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/admin/pricing")
      const data = await res.json()
      setPricing(data.pricing || [])
    } catch (error) {
      console.error("Failed to fetch pricing:", error)
    }
  }

  // Load initial settings
  useEffect(() => {
    fetchPricing()
  }, [])

  // Auto reload when page/filters change
  useEffect(() => {
    fetchProxies(page, limit, debouncedSearch, statusFilter, activeFilter)
  }, [page, limit, debouncedSearch, statusFilter, activeFilter, fetchProxies])

  // CRUD Operations

  const handleAddProxy = async (proxyData: any) => {
    try {
      const res = await fetch("/api/admin/proxies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proxyData),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Proxy added successfully",
        })
        setPage(1)
        fetchProxies(1, limit, debouncedSearch, statusFilter, activeFilter)
        return true
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Failed to add proxy",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Failed to add proxy:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }

  const handleBulkUpload = async (bulkCountry: string, bulkData: string) => {
    try {
      const selectedPricing = pricing.find((p) => p.country === bulkCountry)
      if (!selectedPricing) return false

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
        toast({
          title: "Success",
          description: `Successfully uploaded ${proxiesToAdd.length} proxies`,
        })
        setPage(1)
        fetchProxies(1, limit, debouncedSearch, statusFilter, activeFilter)
        return true
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Failed to bulk upload",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Failed to bulk upload:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    // Optimistic Update
    const originalProxies = [...proxies]
    setProxies(prev => prev.map(p => p.id === id ? { ...p, isActive } : p))

    try {
      const res = await fetch(`/api/admin/proxies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) {
        const data = await res.json()
        setProxies(originalProxies)
        toast({
          title: "Error",
          description: data.error || "Failed to toggle active state",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to toggle active state:", error)
      setProxies(originalProxies)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, status: "available" | "expired" | "dead") => {
    // Optimistic Update
    const originalProxies = [...proxies]
    setProxies(prev => prev.map(p => p.id === id ? { ...p, status } : p))

    try {
      const res = await fetch(`/api/admin/proxies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        setProxies(originalProxies)
        toast({
          title: "Error",
          description: data.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      setProxies(originalProxies)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (proxy: Proxy) => {
    setEditingProxy(proxy)
    setEditOpen(true)
  }

  const handleSaveEdit = async (id: string, updatedFields: any) => {
    // Optimistic Update
    const originalProxies = [...proxies]
    setProxies(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p))

    try {
      const res = await fetch(`/api/admin/proxies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Proxy updated successfully",
        })
        return true
      } else {
        const data = await res.json()
        setProxies(originalProxies)
        toast({
          title: "Error",
          description: data.error || "Failed to update proxy",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Failed to update proxy:", error)
      setProxies(originalProxies)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Proxy",
      description: "This proxy will be permanently deleted. This action cannot be undone.",
      onConfirm: async () => {
        setSubmitting(true)
        // Optimistic Update
        const originalProxies = [...proxies]
        setProxies(prev => prev.filter(p => p.id !== id))
        const prevTotal = total
        setTotal(prev => Math.max(0, prev - 1))

        try {
          const res = await fetch(`/api/admin/proxies/${id}`, { method: "DELETE" })
          if (res.ok) {
            setConfirmDialog(prev => ({ ...prev, open: false }))
            toast({
              title: "Success",
              description: "Proxy deleted successfully",
            })
            fetchProxies(page, limit, debouncedSearch, statusFilter, activeFilter)
          } else {
            const data = await res.json()
            setProxies(originalProxies)
            setTotal(prevTotal)
            toast({
              title: "Error",
              description: data.error || "Failed to delete proxy",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Failed to delete proxy:", error)
          setProxies(originalProxies)
          setTotal(prevTotal)
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            variant: "destructive",
          })
        } finally {
          setSubmitting(false)
        }
      },
    })
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <GoogleIcon name="error" size={36} className="text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-destructive">Error Loading Data</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  const noPricingConfigured = pricing.length === 0

  return (
    <div className="space-y-6">
      {noPricingConfigured && (
        <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-amber-500 text-xs">
          <GoogleIcon name="warning" size={16} />
          <p>Please add country pricing first before adding proxies.</p>
        </div>
      )}

      {/* Action Header */}
      <div className="flex gap-4">
        <AddProxyModal
          pricing={pricing}
          onAdd={handleAddProxy}
          noPricingConfigured={noPricingConfigured}
        />
        <BulkUploadModal
          pricing={pricing}
          onUpload={handleBulkUpload}
          noPricingConfigured={noPricingConfigured}
        />
        <EditProxyModal
          proxy={editingProxy}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={handleSaveEdit}
        />
      </div>

      {/* Filtering Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <GoogleIcon name="search" size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, country..."
            className="pl-9 bg-background border-border text-foreground h-10 text-xs"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="bg-background border-border text-foreground h-11">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_statuses">All Statuses</SelectItem>
            <SelectItem value="available">Available Only</SelectItem>
            <SelectItem value="expired">Expired Only</SelectItem>
            <SelectItem value="dead">Dead Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Active/Visibility Filter */}
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(1); }}>
          <SelectTrigger className="bg-background border-border text-foreground h-11">
            <SelectValue placeholder="All Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_visibility">All Visibility</SelectItem>
            <SelectItem value="true">Active Only</SelectItem>
            <SelectItem value="false">Inactive Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Page Limit */}
        <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
          <SelectTrigger className="bg-background border-border text-foreground h-11">
            <SelectValue placeholder="50 rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25 rows per page</SelectItem>
            <SelectItem value="50">50 rows per page</SelectItem>
            <SelectItem value="100">100 rows per page</SelectItem>
            <SelectItem value="250">250 rows per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proxies ({total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <GoogleIcon name="progress_activity" size={24} className="animate-spin text-accent" />
            </div>
          ) : proxies.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No proxies found matching your criteria</p>
          ) : (
            <div className="overflow-x-auto">
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
                    <TableRow key={proxy.id} className="transition-colors hover:bg-muted/30">
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {proxy.ip}:{proxy.port}
                      </TableCell>
                      <TableCell>{proxy.country}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {proxy.currentUsage}/{proxy.maxUsage}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(proxy.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {proxy.status === "dead" ? (
                          <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Dead</Badge>
                        ) : new Date(proxy.expiresAt) < new Date() ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : proxy.currentUsage >= proxy.maxUsage ? (
                          <Badge variant="secondary">Full</Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={proxy.status} onValueChange={(v) => handleStatusChange(proxy.id, v as any)}>
                          <SelectTrigger className="w-32 bg-background border-border text-foreground">
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
                      <TableCell className="flex gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(proxy)} className="h-8 w-8">
                          <GoogleIcon name="edit" size={15} className="text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(proxy.id)} className="h-8 w-8">
                          <GoogleIcon name="delete" size={15} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/10 pt-4 mt-6 gap-4 px-4 sm:px-0 text-xs">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> ({total} total proxies)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-background border-border text-foreground hover:bg-muted h-8 text-xs gap-1"
                >
                  <GoogleIcon name="chevron_left" size={15} />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-background border-border text-foreground hover:bg-muted h-8 text-xs gap-1"
                >
                  Next
                  <GoogleIcon name="chevron_right" size={15} />
                </Button>
              </div>
            </div>
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
