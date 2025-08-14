"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { UploadResponse, ParsedFileData } from "@/lib/types"

interface FileUploadProps {
  onUploadSuccess?: (data: UploadResponse) => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [manualTeams, setManualTeams] = useState("")
  const [processingManual, setProcessingManual] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles)
    setUploadResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result: UploadResponse = await response.json()
      setUploadResult(result)

      if (result.success && onUploadSuccess) {
        onUploadSuccess(result)
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: "Failed to upload files",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleManualInput = async () => {
    if (!manualTeams.trim()) return

    setProcessingManual(true)
    try {
      const teamNames = manualTeams
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
        .map((name) => name.replace(/^\d+\.\s*/, "").replace(/^[-*]\s*/, "")) // Remove list markers

      const teams = teamNames.map((name) => ({
        team_name: name,
        email: `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
        username: name.toLowerCase().replace(/\s+/g, "_"),
      }))

      const response = await fetch("/api/manual-teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teams }),
      })

      const result: UploadResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      setUploadResult(result)
      if (onUploadSuccess) {
        onUploadSuccess(result)
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to process team names",
      })
    } finally {
      setProcessingManual(false)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setSelectedFiles([])
    setUploadResult(null)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400" />
            Upload Team Data
          </CardTitle>
          <CardDescription className="text-slate-300">
            Upload CSV or TXT files containing team names, emails, and usernames
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-purple-400 bg-purple-400/10"
                : "border-slate-600 hover:border-purple-500 hover:bg-slate-700/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-purple-300 text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-white text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-slate-500 text-sm">Supports CSV and TXT files up to 10MB each</p>
              </div>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Selected Files ({selectedFiles.length})</h3>
                <Button variant="outline" size="sm" onClick={clearAll} className="text-slate-300 bg-transparent">
                  Clear All
                </Button>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{file.name}</p>
                        <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              >
                {uploading ? "Processing..." : "Upload & Parse Files"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Manual Team Input
          </CardTitle>
          <CardDescription className="text-slate-300">
            Enter team names directly for quick group making (one per line)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              value={manualTeams}
              onChange={(e) => setManualTeams(e.target.value)}
              placeholder="Enter team names, one per line:&#10;Team Alpha&#10;Team Beta&#10;Team Gamma"
              className="w-full h-32 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
            />
            <Button
              onClick={handleManualInput}
              disabled={processingManual || !manualTeams.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {processingManual ? "Processing..." : "Process Team Names"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploadResult && (
        <Alert
          className={uploadResult.success ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}
        >
          {uploadResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className={uploadResult.success ? "text-green-300" : "text-red-300"}>
            {uploadResult.message}
            {uploadResult.success && uploadResult.totalTeams && (
              <span className="block mt-1">Total teams in database: {uploadResult.totalTeams}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {uploadResult?.success && uploadResult.parsedData && <ParsePreview data={uploadResult.parsedData} />}
    </div>
  )
}

function ParsePreview({ data }: { data: ParsedFileData }) {
  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Parse Preview - {data.filename}
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
            {data.rowCount} teams found
          </Badge>
          {data.duplicatesRemoved > 0 && (
            <Badge variant="secondary" className="bg-orange-600/20 text-orange-300">
              {data.duplicatesRemoved} duplicates removed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-medium mb-2">Sample Data (first 5 rows):</h4>
            <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-600">
                    <th className="text-left p-2">Team Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Username</th>
                  </tr>
                </thead>
                <tbody>
                  {data.teams.slice(0, 5).map((team, index) => (
                    <tr key={index} className="text-slate-300 border-b border-slate-700/50">
                      <td className="p-2">{team.team_name || "-"}</td>
                      <td className="p-2">{team.email || "-"}</td>
                      <td className="p-2">{team.username || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
