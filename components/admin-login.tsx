"use client"

import type React from "react"

import { useState } from "react"
import { Lock, User, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminLoginProps {
  onLoginSuccess: (credentials: { username: string; password: string }) => void
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Test credentials by making a request to the admin endpoint
      const credentials = btoa(`${username}:${password}`)
      const response = await fetch("/api/admin/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      })

      if (response.ok) {
        onLoginSuccess({ username, password })
      } else {
        setError("Invalid credentials. Please check your username and password.")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-purple-500/20">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-purple-400" />
        </div>
        <CardTitle className="text-white">Admin Login</CardTitle>
        <CardDescription className="text-slate-300">Enter your credentials to access the admin panel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
          <p className="text-xs text-slate-400 text-center">
            Default credentials for development:
            <br />
            <span className="text-slate-300">Username: hiedan amin</span>
            <br />
            <span className="text-slate-300">Password: admin123</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
