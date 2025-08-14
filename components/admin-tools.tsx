"use client"

import { useState } from "react"
import { Key, RefreshCw, FileDown, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface AdminToolsProps {
  credentials: { username: string; password: string }
}

export function AdminTools({ credentials }: AdminToolsProps) {
  const [token, setToken] = useState<string | null>(null)
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const generateToken = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const authHeader = btoa(`${credentials.username}:${credentials.password}`)
      const response = await fetch("/api/admin/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setToken(result.token)
        setTokenExpiry(result.expires)
        setMessage({ type: "success", text: "Token generated successfully" })
      } else {
        setMessage({ type: "error", text: "Failed to generate token" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Token generation failed" })
    } finally {
      setLoading(false)
    }
  }

  const downloadWithToken = async () => {
    if (!token) return

    try {
      const response = await fetch(`/api/admin/download?token=${token}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      try {
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = "data.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setMessage({ type: "success", text: "Data downloaded via token" })
      } finally {
        // Always revoke the blob URL to prevent memory leaks
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      }
    } catch (error) {
      console.error("Download error:", error)
      setMessage({ type: "error", text: "Download failed" })
    }
  }

  const refreshData = () => {
    window.location.reload()
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Admin Tools</CardTitle>
        <CardDescription className="text-slate-300">Advanced administrative functions and utilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert
            className={`${message.type === "success" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}
          >
            <AlertDescription className={message.type === "success" ? "text-green-300" : "text-red-300"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Secure Download Token</h4>
              <p className="text-slate-400 text-sm">Generate a temporary token for secure data access</p>
            </div>
            <Button onClick={generateToken} disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Key className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate Token"}
            </Button>
          </div>

          {token && (
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Token:</span>
                <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                  Active
                </Badge>
              </div>
              <div className="font-mono text-xs text-purple-300 break-all mb-2">{token}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  Expires: {tokenExpiry ? new Date(tokenExpiry).toLocaleString() : "Unknown"}
                </div>
                <Button
                  onClick={downloadWithToken}
                  size="sm"
                  variant="outline"
                  className="text-slate-300 bg-transparent"
                >
                  <FileDown className="w-3 h-3 mr-1" />
                  Use Token
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div>
              <h4 className="text-white font-medium">Refresh Dashboard</h4>
              <p className="text-slate-400 text-sm">Reload all data and statistics</p>
            </div>
            <Button onClick={refreshData} size="sm" variant="outline" className="text-slate-300 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
