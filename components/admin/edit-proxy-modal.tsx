"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/ui/google-icon"

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
}

interface EditProxyModalProps {
  proxy: Proxy | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updatedFields: any) => Promise<boolean>
}

export function EditProxyModal({ proxy, open, onOpenChange, onSave }: EditProxyModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    ip: "",
    port: "",
    username: "",
    password: "",
    maxUsage: "10",
    expiresAt: "",
  })

  // Sync form state when proxy prop changes
  useEffect(() => {
    if (proxy && open) {
      setForm({
        ip: proxy.ip || "",
        port: proxy.port ? proxy.port.toString() : "",
        username: proxy.username || "",
        password: proxy.password || "",
        maxUsage: proxy.maxUsage ? proxy.maxUsage.toString() : "10",
        expiresAt: proxy.expiresAt ? new Date(proxy.expiresAt).toISOString().slice(0, 16) : "",
      })
    }
  }, [proxy, open])

  const handleSubmit = async () => {
    if (!proxy || !form.ip || !form.port) return
    setSubmitting(true)
    const success = await onSave(proxy.id, {
      ip: form.ip,
      port: Number.parseInt(form.port) || 0,
      username: form.username,
      password: form.password,
      maxUsage: Number.parseInt(form.maxUsage) || 10,
      expiresAt: form.expiresAt,
    })
    setSubmitting(false)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                value={form.ip}
                onChange={(e) => setForm((prev) => ({ ...prev, ip: e.target.value }))}
                placeholder="192.168.1.1"
              />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                value={form.port}
                onChange={(e) => setForm((prev) => ({ ...prev, port: e.target.value }))}
                placeholder="8080"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username (optional)</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password (optional)</Label>
              <Input
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Usage</Label>
              <Input
                type="number"
                value={form.maxUsage}
                onChange={(e) => setForm((prev) => ({ ...prev, maxUsage: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires At</Label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting || !form.ip || !form.port} size="sm" className="h-8 text-xs">
            {submitting && <GoogleIcon name="progress_activity" size={14} className="mr-1.5 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
