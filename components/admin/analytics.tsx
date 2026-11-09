"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { GoogleIcon } from "@/components/ui/google-icon"

interface AnalyticsData {
    summary: {
        proxiesSoldToday: number
        revenueToday: number
        totalRevenue: number
    }
    chartData: {
        name: string
        proxies: number
        emails: number
    }[]
    topCountries: {
        name: string
        value: number
    }[]
}

export function Analytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch analytics")
                }
                return data
            })
            .then((data) => {
                setData(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Analytics fetch error:", err)
                setError(err.message)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="flex h-[320px] items-center justify-center">
                <GoogleIcon name="progress_activity" size={24} className="animate-spin text-accent" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-destructive/10 p-3">
                    <GoogleIcon name="public" size={32} className="text-destructive" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-destructive">Error Loading Analytics</h2>
                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
                <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 p-3.5">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Proxies Sold Today</CardTitle>
                        <GoogleIcon name="shopping_cart" size={16} className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3.5 pt-0">
                        <div className="text-xl font-bold text-foreground">{data.summary.proxiesSoldToday}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Orders completed today</p>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 p-3.5">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Profit Today</CardTitle>
                        <GoogleIcon name="payments" size={16} className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3.5 pt-0">
                        <div className="text-xl font-bold text-foreground">KES {data.summary.revenueToday.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Combined proxy & email revenue</p>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 p-3.5">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Total Lifetime Profit</CardTitle>
                        <GoogleIcon name="trending_up" size={16} className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3.5 pt-0">
                        <div className="text-xl font-bold text-foreground">KES {data.summary.totalRevenue.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Total platform revenue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-semibold text-foreground">Sales Trend</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">Daily proxies and email sales (Last 7 Days)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[260px] p-4 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData}>
                                <defs>
                                    <linearGradient id="colorProxies" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-15" />
                                <XAxis dataKey="name" stroke="currentColor" className="opacity-60" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="currentColor" className="opacity-60" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", fontSize: "11px", color: "var(--foreground)" }}
                                    itemStyle={{ color: "#3b82f6" }}
                                />
                                <Area type="monotone" dataKey="proxies" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProxies)" />
                                <Area type="monotone" dataKey="emails" stroke="#10b981" fillOpacity={0.5} fill="#10b981" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-semibold text-foreground">Top Selling Areas</CardTitle>
                        <CardDescription className="text-[11px] text-muted-foreground">Proxy demand by country</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[260px] p-4 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topCountries} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="opacity-15" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="currentColor" className="opacity-60" fontSize={10} tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", fontSize: "11px", color: "var(--foreground)" }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
