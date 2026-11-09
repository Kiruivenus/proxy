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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoogleIcon } from "@/components/ui/google-icon"
import { parseProxyString } from "@/lib/proxy-parser"

interface PricingItem {
  id: string
  country: string
  countryCode: string
}

interface AddProxyModalProps {
  pricing: PricingItem[]
  onAdd: (proxyData: any) => Promise<boolean>
  noPricingConfigured: boolean
}

// Helper to generate local current datetime + 24 hours in YYYY-MM-DDTHH:mm format
const getFutureExpiry = () => {
  const d = new Date()
  d.setHours(d.getHours() + 24)
  const pad = (n: number) => n.toString().padStart(2, "0")
  const yyyy = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const HH = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`
}

export function AddProxyModal({ pricing, onAdd, noPricingConfigured }: AddProxyModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pasteValue, setPasteValue] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)

  const [form, setForm] = useState({
    ip: "",
    port: "",
    username: "",
    password: "",
    country: "",
    countryCode: "",
    maxUsage: "5",
    expiresAt: "",
  })

  // Sync form defaults when the modal opens
  useEffect(() => {
    if (open) {
      setForm({
        ip: "",
        port: "",
        username: "",
        password: "",
        country: "",
        countryCode: "",
        maxUsage: "5",
        expiresAt: getFutureExpiry(),
      })
      setPasteValue("")
      setParseError(null)
    }
  }, [open])

  const handleCountrySelect = (countryName: string) => {
    const selectedPricing = pricing.find((p) => p.country === countryName)
    if (selectedPricing) {
      setForm((prev) => ({
        ...prev,
        country: selectedPricing.country,
        countryCode: selectedPricing.countryCode,
      }))
    }
  }

  const handlePasteChange = (value: string) => {
    setPasteValue(value)
    if (!value.trim()) {
      setParseError(null)
      return
    }

    const parsed = parseProxyString(value)
    if (parsed) {
      setForm((prev) => ({
        ...prev,
        ip: parsed.ip,
        port: parsed.port,
        username: parsed.username || "",
        password: parsed.password || "",
      }))
      setParseError(null)
    } else {
      setParseError("Could not auto-detect format. Expected: username:password@ip:port, ip:port:username:password, ip:port, or username:password:ip:port")
    }
  }

  const handleClear = () => {
    setForm({
      ip: "",
      port: "",
      username: "",
      password: "",
      country: "",
      countryCode: "",
      maxUsage: "5",
      expiresAt: getFutureExpiry(),
    })
    setPasteValue("")
    setParseError(null)
  }

  const handleSubmit = async () => {
    if (!form.ip || !form.port || !form.country) return
    setSubmitting(true)
    const success = await onAdd({
      ...form,
      port: Number.parseInt(form.port) || 0,
      maxUsage: Number.parseInt(form.maxUsage) || 5,
    })
    setSubmitting(false)
    if (success) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={noPricingConfigured} size="sm" className="h-8 text-xs gap-1.5">
          <GoogleIcon name="add" size={15} />
          Add Proxy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Proxy</DialogTitle>
          <DialogDescription>Paste a proxy string to auto-fill or enter manually</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          
          {/* Paste Proxy Field */}
          <div className="space-y-2">
            <Label htmlFor="paste-proxy">Paste Proxy</Label>
            <Input
              id="paste-proxy"
              value={pasteValue}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder="e.g. username:password@ip:port or ip:port"
              className={parseError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <p className="text-[11px] text-muted-foreground">
              Paste proxy in any supported format and fields will be filled automatically.
            </p>
            {parseError && (
              <p className="text-[11px] text-destructive font-medium mt-1">
                {parseError}
              </p>
            )}
          </div>

          <div className="border-t border-border/30 my-1" />

          {/* Manual Input Fields */}
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
                placeholder="user"
              />
            </div>
            <div className="space-y-2">
              <Label>Password (optional)</Label>
              <Input
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="pass"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={form.country} onValueChange={handleCountrySelect}>
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
        <DialogFooter className="flex flex-row justify-between items-center sm:justify-between gap-2 mt-2">
          <Button variant="outline" type="button" onClick={handleClear} disabled={submitting}>
            Clear
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !form.country || !form.ip || !form.port} size="sm" className="h-8 text-xs">
            {submitting && <GoogleIcon name="progress_activity" size={14} className="mr-1.5 animate-spin" />}
            Add Proxy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
