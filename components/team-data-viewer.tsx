"use client"

import { useState, useEffect } from "react"
import { Eye, Search, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { DataStorage, TeamData } from "@/lib/types"

interface TeamDataViewerProps {
  credentials: { username: string; password: string }
}

export function TeamDataViewer({ credentials }: TeamDataViewerProps) {
  const [data, setData] = useState<DataStorage | null>(null)
  const [filteredTeams, setFilteredTeams] = useState<TeamData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "email" | "username" | "team_name">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (data) {
      filterTeams()
    }
  }, [data, searchTerm, filterBy])

  const loadData = async () => {
    try {
      const authHeader = btoa(`${credentials.username}:${credentials.password}`)
      const response = await fetch("/api/admin/download", {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      })

      if (response.ok) {
        const jsonData = await response.json()
        setData(jsonData)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTeams = () => {
    if (!data) return

    let filtered = data.teams

    if (searchTerm) {
      filtered = filtered.filter((team) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          team.team_name?.toLowerCase().includes(searchLower) ||
          team.email?.toLowerCase().includes(searchLower) ||
          team.username?.toLowerCase().includes(searchLower) ||
          team.source_file?.toLowerCase().includes(searchLower)
        )
      })
    }

    if (filterBy !== "all") {
      filtered = filtered.filter((team) => {
        switch (filterBy) {
          case "email":
            return team.email && team.email.trim() !== ""
          case "username":
            return team.username && team.username.trim() !== ""
          case "team_name":
            return team.team_name && team.team_name.trim() !== ""
          default:
            return true
        }
      })
    }

    setFilteredTeams(filtered)
  }

  const exportFilteredData = () => {
    try {
      const csvContent = [
        "Team Name,Email,Username,Source File",
        ...filteredTeams.map((team) =>
          [team.team_name || "", team.email || "", team.username || "", team.source_file || ""].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)

      try {
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `filtered-teams-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } finally {
        // Always revoke the blob URL to prevent memory leaks
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      }
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-slate-300">Loading team data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          Team Data Viewer
        </CardTitle>
        <CardDescription className="text-slate-300">
          View, search, and filter your team data ({data?.teams.length || 0} total teams)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search teams, emails, usernames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm"
            >
              <option value="all">All Fields</option>
              <option value="team_name">Has Team Name</option>
              <option value="email">Has Email</option>
              <option value="username">Has Username</option>
            </select>
            <Button onClick={exportFilteredData} size="sm" variant="outline" className="text-slate-300 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          Showing {filteredTeams.length} of {data?.teams.length || 0} teams
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredTeams.map((team, index) => (
              <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Team:</span>
                    <div className="text-white font-medium">{team.team_name || "-"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <div className="text-purple-300">{team.email || "-"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Username:</span>
                    <div className="text-slate-300">{team.username || "-"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Source:</span>
                    <Badge variant="secondary" className="bg-slate-600/50 text-slate-300 text-xs">
                      {team.source_file}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            {searchTerm || filterBy !== "all" ? "No teams match your search criteria" : "No team data available"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
