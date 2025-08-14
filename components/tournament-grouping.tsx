"use client"

import { useState } from "react"
import { Users, Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { TournamentGroupingType } from "@/lib/tournament-grouping"

interface TournamentGroupingProps {
  onGenerate?: () => void
}

export function TournamentGrouping({ onGenerate }: TournamentGroupingProps) {
  const [grouping, setGrouping] = useState<TournamentGroupingType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamsPerGroup, setTeamsPerGroup] = useState("4")
  const [algorithm, setAlgorithm] = useState<"balanced" | "random" | "sequential">("balanced")

  const generateGroups = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/tournament/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamsPerGroup: Number.parseInt(teamsPerGroup),
          algorithm,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setGrouping(result.grouping)
        onGenerate?.()
      } else {
        setError(result.error || "Failed to generate tournament groups")
      }
    } catch (err) {
      setError("Failed to generate tournament groups")
    } finally {
      setLoading(false)
    }
  }

  const downloadGroups = async () => {
    try {
      const response = await fetch(
        `/api/tournament/groups?format=text&teamsPerGroup=${teamsPerGroup}&algorithm=${algorithm}`,
      )
      const text = await response.text()

      const blob = new Blob([text], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = "tournament-groups.txt"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to download groups")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Tournament Grouping
          </CardTitle>
          <CardDescription className="text-slate-300">
            Organize teams into balanced groups for tournament brackets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="teamsPerGroup" className="text-slate-300">
                Teams/Group
              </Label>
              <Select value={teamsPerGroup} onValueChange={setTeamsPerGroup}>
                <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white hover:bg-slate-600/50 focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 [&>span]:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-600/50">
                  <SelectItem value="2">2 Teams</SelectItem>
                  <SelectItem value="3">3 Teams</SelectItem>
                  <SelectItem value="4">4 Teams</SelectItem>
                  <SelectItem value="5">5 Teams</SelectItem>
                  <SelectItem value="6">6 Teams</SelectItem>
                  <SelectItem value="7">7 Teams</SelectItem>
                  <SelectItem value="8">8 Teams</SelectItem>
                  <SelectItem value="10">10 Teams</SelectItem>
                  <SelectItem value="12">12 Teams</SelectItem>
                  <SelectItem value="16">16 Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="algorithm" className="text-slate-300">
                Distribution
              </Label>
              <Select
                value={algorithm}
                onValueChange={(value: "balanced" | "random" | "sequential") => setAlgorithm(value)}
              >
                <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white hover:bg-slate-600/50 focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 [&>span]:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-600/50">
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2 md:col-span-2">
              <Button
                onClick={generateGroups}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10 mb-4">
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {grouping && (
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                  {grouping.totalTeams} teams
                </Badge>
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                  {grouping.groups.length} groups
                </Badge>
                <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                  ~{grouping.groupSize} per group
                </Badge>
              </div>
              <Button onClick={downloadGroups} variant="outline" size="sm" className="text-slate-300 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {grouping && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {grouping.groups.map((group) => (
            <Card key={group.id} className="bg-slate-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  ☄ {group.name.toUpperCase()} ☄
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                    {group.teams.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.teams.map((team, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded text-sm">
                      <span className="text-purple-400 font-mono w-6">{index + 1}.</span>
                      <span className="text-slate-300 truncate">{team.team_name || team.email || team.username}</span>
                    </div>
                  ))}
                  {group.teams.length === 0 && (
                    <div className="text-slate-500 text-sm italic text-center py-4">No teams assigned</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
