"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GoogleIcon } from "@/components/ui/google-icon"
import { toast } from "sonner"

interface WebsiteSettings {
  subscriptionActive: boolean
  subscriptionDuration: "1min" | "1day" | "1week" | "2weeks" | "1month"
  subscriptionExpiresAt: string
  lastPaymentAt?: string
}

export function SettingsForm() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [duration, setDuration] = useState<string>("")

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/superadmin/settings")
      const data = await res.json()
      if (res.ok) {
        setSettings(data)
        setDuration(data.subscriptionDuration)
      } else {
        toast.error(data.error || "Failed to fetch settings")
      }
    } catch (error) {
      toast.error("An error occurred while fetching settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/superadmin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionDuration: duration }),
      })
      if (res.ok) {
        toast.success("Settings updated successfully")
        fetchSettings()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update settings")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setSaving(false)
    }
  }

  const getTimeRemaining = (expiry: string) => {
    const total = Date.parse(expiry) - Date.parse(new Date().toString())
    if (total <= 0) return "Expired"
    
    const seconds = Math.floor((total / 1000) % 60)
    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    if (minutes > 0) return `${minutes}m ${seconds}s remaining`
    return `${seconds}s remaining`
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <GoogleIcon name="progress_activity" size={22} className="animate-spin text-accent" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card className="bg-card border-border shadow-xs rounded-xl">
        <CardHeader className="p-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground">Website Subscription Status</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Monitor your platform's active status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchSettings} disabled={loading} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <GoogleIcon name="refresh" size={15} className={loading ? "animate-spin" : ""} />
              </Button>
              <Badge variant={settings.subscriptionActive ? "default" : "destructive"} className={settings.subscriptionActive ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-2 h-5" : "text-[10px] py-0 px-2 h-5"}>
                {settings.subscriptionActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <GoogleIcon name="calendar_today" size={14} />
                <span>Expires At</span>
              </div>
              <p className="text-xs font-mono font-bold text-foreground">
                {new Date(settings.subscriptionExpiresAt).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <GoogleIcon name="schedule" size={14} />
                <span>Time Remaining</span>
              </div>
              <p className={`text-xs font-mono font-bold ${!settings.subscriptionActive ? "text-destructive" : "text-accent"}`}>
                {getTimeRemaining(settings.subscriptionExpiresAt)}
              </p>
            </div>
          </div>

          {!settings.subscriptionActive && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <GoogleIcon name="warning" size={16} className="shrink-0" />
              <p>Your website subscription has expired. Please upgrade to restore full functionality.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-xs rounded-xl">
        <CardHeader className="p-4 border-b border-border/60">
          <CardTitle className="text-xs font-semibold text-foreground">Subscription Configuration</CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Set the duration for your next subscription renewal</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-xs font-medium">Renewal Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration" className="h-9 text-xs bg-background border-border text-foreground">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1min" className="text-xs">1 Minute (Testing)</SelectItem>
                <SelectItem value="1day" className="text-xs">1 Day</SelectItem>
                <SelectItem value="1week" className="text-xs">1 Week</SelectItem>
                <SelectItem value="2weeks" className="text-xs">2 Weeks</SelectItem>
                <SelectItem value="1month" className="text-xs">1 Month</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              This duration will be applied when you make a payment on the Upgrade page.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/60 p-4 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground italic">
            {duration !== settings.subscriptionDuration ? "⚠️ You have unsaved changes" : "✅ Current configuration is active"}
          </p>
          <Button 
            className="bg-accent hover:bg-accent/90 text-background font-semibold text-xs h-8 px-4"
            disabled={saving || duration === settings.subscriptionDuration}
            onClick={handleSave}
          >
            {saving && <GoogleIcon name="progress_activity" size={13} className="mr-1.5 animate-spin" />}
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
