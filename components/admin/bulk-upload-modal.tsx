"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { GoogleIcon } from "@/components/ui/google-icon"

interface PricingItem {
  id: string
  country: string
  countryCode: string
}

interface BulkUploadModalProps {
  pricing: PricingItem[]
  onUpload: (bulkCountry: string, bulkData: string) => Promise<boolean>
  noPricingConfigured: boolean
}

export function BulkUploadModal({ pricing, onUpload, noPricingConfigured }: BulkUploadModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bulkCountry, setBulkCountry] = useState("")
  const [bulkData, setBulkData] = useState("")

  const handleSubmit = async () => {
    if (!bulkCountry || !bulkData) return
    setSubmitting(true)
    const success = await onUpload(bulkCountry, bulkData)
    setSubmitting(false)
    if (success) {
      setOpen(false)
      setBulkCountry("")
      setBulkData("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={noPricingConfigured} size="sm" className="h-8 text-xs gap-1.5">
          <GoogleIcon name="upload" size={15} />
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
          <Button onClick={handleSubmit} disabled={submitting || !bulkCountry || !bulkData} size="sm" className="h-8 text-xs">
            {submitting && <GoogleIcon name="progress_activity" size={14} className="mr-1.5 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
