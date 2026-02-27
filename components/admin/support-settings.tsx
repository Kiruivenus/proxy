"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"

export function SupportSettings() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState({
    whatsappNumber: "",
    whatsappGroup: "",
    telegramAgent: "",
    telegramGroup: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/support/config")
      if (res.ok) {
        const data = await res.json()
        setSettings(data.config || settings)
      }
    } catch (error) {
      console.error("Failed to fetch support settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/support/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSubmitting(false)
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Support Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                placeholder="254712345678"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Format: country code + phone number (e.g., 254712345678)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-group">WhatsApp Group Link</Label>
              <Input
                id="whatsapp-group"
                placeholder="https://chat.whatsapp.com/..."
                value={settings.whatsappGroup}
                onChange={(e) => setSettings({ ...settings, whatsappGroup: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Paste the full WhatsApp group invitation link</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram Agent Handle</Label>
              <Input
                id="telegram"
                placeholder="your_telegram_handle"
                value={settings.telegramAgent}
                onChange={(e) => setSettings({ ...settings, telegramAgent: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Username without @</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram-group">Telegram Group Link</Label>
              <Input
                id="telegram-group"
                placeholder="https://t.me/your_group"
                value={settings.telegramGroup}
                onChange={(e) => setSettings({ ...settings, telegramGroup: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Full Telegram group/channel link</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={submitting} className="flex gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
            {success && <p className="text-sm text-green-500 flex items-center">Settings saved successfully!</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
