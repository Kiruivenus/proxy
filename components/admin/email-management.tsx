"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Loader2, Plus, Trash2, Mail, Edit2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface EmailDomain {
  _id: string
  domain: string
  type: "gmail" | "rayproxy"
  server?: string
}

interface EmailItem {
  id: string
  emailAddress: string
  domain: string
  status: "available" | "sold" | "reserved"
}

export function EmailManagement() {
  const [domains, setDomains] = useState<EmailDomain[]>([])
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addDomainOpen, setAddDomainOpen] = useState(false)
  const [editDomainOpen, setEditDomainOpen] = useState(false)
  const [addEmailOpen, setAddEmailOpen] = useState(false)
  const [editEmailOpen, setEditEmailOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("domains")
  const [editingDomain, setEditingDomain] = useState<EmailDomain | null>(null)
  const [editingEmail, setEditingEmail] = useState<EmailItem | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ open: false, title: "", description: "", onConfirm: () => {} })

  const [newDomain, setNewDomain] = useState({
    domain: "",
    type: "gmail" as "gmail" | "rayproxy",
    server: "",
  })

  const [newEmail, setNewEmail] = useState({
    emailAddress: "",
    password: "",
    domainId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [domainsRes, emailsRes] = await Promise.all([
        fetch("/api/admin/emails/domains"),
        fetch("/api/admin/emails"),
      ])

      if (domainsRes.ok) {
        const data = await domainsRes.json()
        setDomains(data.domains || [])
      }

      if (emailsRes.ok) {
        const data = await emailsRes.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDomain = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/emails/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDomain),
      })

      if (res.ok) {
        setAddDomainOpen(false)
        setNewDomain({ domain: "", type: "gmail", server: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to add domain:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddEmail = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmail),
      })

      if (res.ok) {
        setAddEmailOpen(false)
        setNewEmail({ emailAddress: "", password: "", domainId: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to add email:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditDomain = (domain: EmailDomain) => {
    setEditingDomain(domain)
    setNewDomain({
      domain: domain.domain,
      type: domain.type,
      server: domain.server || "",
    })
    setEditDomainOpen(true)
  }

  const handleSaveEditDomain = async () => {
    if (!editingDomain) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/emails/domains/${editingDomain._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDomain),
      })

      if (res.ok) {
        setEditDomainOpen(false)
        setEditingDomain(null)
        setNewDomain({ domain: "", type: "gmail", server: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to update domain:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDomain = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Email Domain",
      description: "This action cannot be undone. All associated emails will be affected.",
      onConfirm: async () => {
        setSubmitting(true)
        try {
          const res = await fetch(`/api/admin/emails/domains/${id}`, { method: "DELETE" })
          if (res.ok) {
            fetchData()
          } else {
            console.error("Failed to delete domain")
          }
        } catch (error) {
          console.error("Failed to delete domain:", error)
        } finally {
          setSubmitting(false)
        }
      },
    })
  }

  const handleEditEmail = (email: EmailItem) => {
    setEditingEmail(email)
    setNewEmail({
      emailAddress: email.emailAddress,
      password: "",
      domainId: "",
    })
    setEditEmailOpen(true)
  }

  const handleSaveEditEmail = async () => {
    if (!editingEmail) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/emails/${editingEmail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmail),
      })

      if (res.ok) {
        setEditEmailOpen(false)
        setEditingEmail(null)
        setNewEmail({ emailAddress: "", password: "", domainId: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to update email:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEmail = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Email Account",
      description: "This email account will be permanently deleted. This action cannot be undone.",
      onConfirm: async () => {
        setSubmitting(true)
        try {
          const res = await fetch(`/api/admin/emails/${id}`, { method: "DELETE" })
          if (res.ok) {
            fetchData()
          } else {
            console.error("Failed to delete email")
          }
        } catch (error) {
          console.error("Failed to delete email:", error)
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
        <TabsTrigger value="domains">Email Domains</TabsTrigger>
        <TabsTrigger value="emails">Email Accounts</TabsTrigger>
      </TabsList>

      <TabsContent value="domains" className="mt-6 space-y-6">
        <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Email Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Email Domain</DialogTitle>
              <DialogDescription>Add a new email domain for users to purchase from</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Domain Name</Label>
                <Input
                  value={newDomain.domain}
                  onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
                  placeholder="gmail.com or custom-domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newDomain.type} onValueChange={(v) => setNewDomain({ ...newDomain, type: v as "gmail" | "rayproxy" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="rayproxy">RayProxy SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newDomain.type === "rayproxy" && (
                <div className="space-y-2">
                  <Label>SMTP Server</Label>
                  <Input
                    value={newDomain.server}
                    onChange={(e) => setNewDomain({ ...newDomain, server: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleAddDomain} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Domain
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editDomainOpen} onOpenChange={setEditDomainOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Email Domain</DialogTitle>
              <DialogDescription>Update email domain details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Domain Name</Label>
                <Input
                  value={newDomain.domain}
                  onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
                  placeholder="gmail.com or custom-domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newDomain.type} onValueChange={(v) => setNewDomain({ ...newDomain, type: v as "gmail" | "rayproxy" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="rayproxy">RayProxy SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newDomain.type === "rayproxy" && (
                <div className="space-y-2">
                  <Label>SMTP Server</Label>
                  <Input
                    value={newDomain.server}
                    onChange={(e) => setNewDomain({ ...newDomain, server: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEditDomain} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Available Email Domains</CardTitle>
          </CardHeader>
          <CardContent>
            {domains.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No domains configured yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain._id}>
                      <TableCell className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-accent" />
                        {domain.domain}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                          {domain.type === "gmail" ? "Gmail" : "RayProxy SMTP"}
                        </span>
                      </TableCell>
                      <TableCell>{domain.server || "-"}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditDomain(domain)}>
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDomain(domain._id)}>
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

      <TabsContent value="emails" className="mt-6 space-y-6">
        <Dialog open={addEmailOpen} onOpenChange={setAddEmailOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Email Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Email Account</DialogTitle>
              <DialogDescription>Add a new email account to sell to users</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={newEmail.emailAddress}
                  onChange={(e) => setNewEmail({ ...newEmail, emailAddress: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newEmail.password}
                  onChange={(e) => setNewEmail({ ...newEmail, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Select value={newEmail.domainId} onValueChange={(v) => setNewEmail({ ...newEmail, domainId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain..." />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain._id} value={domain._id}>
                        {domain.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddEmail} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editEmailOpen} onOpenChange={setEditEmailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Email Account</DialogTitle>
              <DialogDescription>Update email account details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={newEmail.emailAddress}
                  onChange={(e) => setNewEmail({ ...newEmail, emailAddress: e.target.value })}
                  placeholder="user@example.com"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label>Password (leave empty to keep current)</Label>
                <Input
                  type="password"
                  value={newEmail.password}
                  onChange={(e) => setNewEmail({ ...newEmail, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEditEmail} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Email Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {emails.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No emails added yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-mono text-sm">{email.emailAddress}</TableCell>
                      <TableCell>{email.domain}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            email.status === "available"
                              ? "bg-green-100 text-green-700"
                              : email.status === "sold"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {email.status}
                        </span>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEmail(email)}
                        >
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmail(email.id)}
                        >
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
