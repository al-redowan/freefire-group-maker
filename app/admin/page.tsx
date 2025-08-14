"use client"

import { useState } from "react"
import { Download, Trash2, Database, Users, FileText, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AdminLogin } from "@/components/admin-login"
import { TeamDataViewer } from "@/components/team-data-viewer"
import { AdminTools } from "@/components/admin-tools"
import type { DataStorage } from "@/lib/types"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)
  const [data, setData] = useState<DataStorage | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleLoginSuccess = (creds: { username: string; password: string }) => {
    setCredentials(creds)
    setIsAuthenticated(true)
    loadData(creds)
  }

  const loadData = async (creds: { username: string; password: string }) => {
    try {
      const authHeader = btoa(`${creds.username}:${creds.password}`)
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
    }
  }

  const handleDownload = async () => {
    if (!credentials) return

    setLoading(true)
    try {
      const authHeader = btoa(`${credentials.username}:${credentials.password}`)
      const response = await fetch("/api/admin/download", {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      })

      if (response.ok) {
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
          setMessage({ type: "success", text: "Data downloaded successfully" })
        } finally {
          // Always revoke the blob URL to prevent memory leaks
          setTimeout(() => window.URL.revokeObjectURL(url), 100)
        }
      } else {
        setMessage({ type: "error", text: "Failed to download data" })
      }
    } catch (error) {
      console.error("Download error:", error)
      setMessage({ type: "error", text: "Download failed" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!credentials || !confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      const authHeader = btoa(`${credentials.username}:${credentials.password}`)
      const response = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      })

      if (response.ok) {
        setData({ teams: [], created_at: new Date().toISOString(), uploaded_files: [] })
        setMessage({ type: "success", text: "All data deleted successfully" })
      } else {
        setMessage({ type: "error", text: "Failed to delete data" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Delete failed" })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-purple-200">Manage your esports team data</p>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${message.type === "success" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}
          >
            <AlertDescription className={message.type === "success" ? "text-green-300" : "text-red-300"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-purple-400" />
                Total Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-300">{data?.teams.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-purple-400" />
                Files Uploaded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-300">{data?.uploaded_files.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
                Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-purple-300">
                {data?.created_at ? new Date(data.created_at).toLocaleDateString() : "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-purple-400" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                Active
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Data Management</CardTitle>
              <CardDescription className="text-slate-300">Download or delete your team data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleDownload}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download data.json
              </Button>
              <Button onClick={handleDelete} disabled={loading} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Data
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Uploaded Files</CardTitle>
              <CardDescription className="text-slate-300">Files currently in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.uploaded_files.length ? (
                <div className="space-y-2">
                  {data.uploaded_files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300 text-sm">{file}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No files uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {credentials && <TeamDataViewer credentials={credentials} />}
          {credentials && <AdminTools credentials={credentials} />}
        </div>
      </div>
    </div>
  )
}
