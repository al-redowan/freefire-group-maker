"use client"

import { useState } from "react"
import { FileOutput, Copy, Download, RefreshCw, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { OutputBlocks } from "@/lib/types"

interface OutputGeneratorProps {
  onGenerate?: () => void
}

export function OutputGenerator({ onGenerate }: OutputGeneratorProps) {
  const [outputs, setOutputs] = useState<OutputBlocks | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalTeams, setTotalTeams] = useState<number>(0)
  const [teamsPerGroup, setTeamsPerGroup] = useState("4")
  const [algorithm, setAlgorithm] = useState<"balanced" | "random" | "sequential">("balanced")
  const [copiedBlocks, setCopiedBlocks] = useState<Set<string>>(new Set())

  const generateOutputs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/output/blocks?teamsPerGroup=${teamsPerGroup}&algorithm=${algorithm}`)
      const result = await response.json()

      if (result.success) {
        setOutputs(result.blocks)
        setTotalTeams(result.totalTeams)
        onGenerate?.()
      } else {
        setError(result.error || "Failed to generate outputs")
      }
    } catch (err) {
      setError("Failed to generate outputs")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, blockName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedBlocks((prev) => new Set(prev).add(blockName))
      setTimeout(() => {
        setCopiedBlocks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(blockName)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const copyAllBlocks = async () => {
    if (!outputs) return

    const allContent = [
      outputs.teamsList,
      "",
      outputs.emailsList,
      "",
      outputs.tabularMapping,
      "",
      outputs.usernamesList,
    ].join("\n")

    try {
      await navigator.clipboard.writeText(allContent)
      setCopiedBlocks(new Set(["all"]))
      setTimeout(() => {
        setCopiedBlocks((prev) => {
          const newSet = new Set(prev)
          newSet.delete("all")
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy all:", err)
    }
  }

  const downloadAsText = async () => {
    try {
      const response = await fetch(
        `/api/output/blocks?format=text&teamsPerGroup=${teamsPerGroup}&algorithm=${algorithm}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()

      const blob = new Blob([text], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)

      try {
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = "esports-groups.txt"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } finally {
        // Always revoke the blob URL to prevent memory leaks
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      }
    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download outputs")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileOutput className="w-5 h-5 text-purple-400" />
            Generate Output Blocks
          </CardTitle>
          <CardDescription className="text-slate-300">
            Create formatted team groups, emails, and usernames from your uploaded data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="teamsPerGroup" className="text-slate-300">
                Teams/Group
              </Label>
              <Select value={teamsPerGroup} onValueChange={setTeamsPerGroup}>
                <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/30">
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
                <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/30">
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={generateOutputs}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generating..." : "Generate Outputs"}
            </Button>

            {totalTeams > 0 && (
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                {totalTeams} teams available
              </Badge>
            )}
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {outputs && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Generated Output Blocks</h3>
            <div className="flex gap-2">
              <Button
                onClick={copyAllBlocks}
                variant="outline"
                className="text-slate-300 bg-transparent hover:bg-purple-600/20"
              >
                {copiedBlocks.has("all") ? (
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy All
              </Button>
              <Button
                onClick={downloadAsText}
                variant="outline"
                className="text-slate-300 bg-transparent hover:bg-purple-600/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>

          {/* Block 1: Teams List */}
          <OutputBlock
            title="Block 1: Teams List"
            content={outputs.teamsList}
            onCopy={() => copyToClipboard(outputs.teamsList, "Teams List")}
            isCopied={copiedBlocks.has("Teams List")}
          />

          {/* Block 2: Emails List */}
          <OutputBlock
            title="Block 2: Team Emails"
            content={outputs.emailsList}
            onCopy={() => copyToClipboard(outputs.emailsList, "Team Emails")}
            isCopied={copiedBlocks.has("Team Emails")}
          />

          {/* Block 3: Tabular Mapping */}
          <OutputBlock
            title="Block 3: Tabular Mapping"
            content={outputs.tabularMapping}
            onCopy={() => copyToClipboard(outputs.tabularMapping, "Tabular Mapping")}
            isCopied={copiedBlocks.has("Tabular Mapping")}
          />

          {/* Block 4: Usernames List */}
          <OutputBlock
            title="Block 4: Team Usernames"
            content={outputs.usernamesList}
            onCopy={() => copyToClipboard(outputs.usernamesList, "Team Usernames")}
            isCopied={copiedBlocks.has("Team Usernames")}
          />
        </div>
      )}
    </div>
  )
}

interface OutputBlockProps {
  title: string
  content: string
  onCopy: () => void
  isCopied?: boolean
}

function OutputBlock({ title, content, onCopy, isCopied }: OutputBlockProps) {
  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">{title}</CardTitle>
          <Button
            onClick={onCopy}
            variant="outline"
            size="sm"
            className="text-slate-300 bg-transparent hover:bg-purple-600/20"
          >
            {isCopied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto border border-slate-700/50">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono select-all cursor-text">{content}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
