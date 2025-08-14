"use client"

import { useEffect, useState } from "react"
import { Users, FileText, Database, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatsOverview() {
  const [stats, setStats] = useState<{
    totalTeams: number
    totalFiles: number
    hasData: boolean
  }>({
    totalTeams: 0,
    totalFiles: 0,
    hasData: false,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/output/blocks")
      const result = await response.json()

      if (result.success) {
        setStats({
          totalTeams: result.totalTeams || 0,
          totalFiles: 0, // We'll need to get this from another endpoint
          hasData: result.totalTeams > 0,
        })
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-300 text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalTeams}</div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-300 text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalFiles}</div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-300 text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium text-green-400">{stats.hasData ? "Active" : "Empty"}</div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-300 text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium text-purple-300">{stats.hasData ? "Yes" : "No"}</div>
        </CardContent>
      </Card>
    </div>
  )
}
