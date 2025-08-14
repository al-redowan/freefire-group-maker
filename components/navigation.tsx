"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Shield, Home, Upload, FileOutput } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileOutput className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">ESports Analyzer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="#upload"
              className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Link>
            <Link
              href="#generate"
              className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              <FileOutput className="w-4 h-4" />
              Generate
            </Link>
            <Link
              href="/admin"
              className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden text-slate-300" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2 px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="#upload"
                className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2 px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Link>
              <Link
                href="#generate"
                className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2 px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                <FileOutput className="w-4 h-4" />
                Generate
              </Link>
              <Link
                href="/admin"
                className="text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-2 px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
