"use client"

import { useState } from "react"
import { Github, Globe, Mail, Facebook, Send, Instagram, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HireMeForm } from "./hire-me-form"

export function Footer() {
  const [isHireFormOpen, setIsHireFormOpen] = useState(false)

  return (
    <>
      <footer className="bg-slate-900/50 border-t border-purple-500/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">ESports Team Analyzer</h3>
              <p className="text-slate-400 text-sm">
                A powerful tool for managing esports team data, generating groups, and organizing tournaments with ease.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• CSV & TXT file parsing</li>
                <li>• Automatic data deduplication</li>
                <li>• Team group generation</li>
                <li>• Admin data management</li>
                <li>• Export functionality</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Developer</h4>
              <div className="space-y-3">
                <p className="text-slate-400 text-sm font-medium">Al Redowan Ahmed Fahim</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://al-redowan.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-300 transition-colors"
                    title="Portfolio"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com/al-redowan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-300 transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.facebook.com/AR.ERROR.404"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-300 transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://t.me/Al_redowan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-300 transition-colors"
                    title="Telegram"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/sinister.face0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-300 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="mailto:fahimdj071@gmail.com"
                    className="text-slate-400 hover:text-purple-300 transition-colors"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
                <Button
                  onClick={() => setIsHireFormOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 h-auto"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Hire Me
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-6 text-center">
            <p className="text-slate-500 text-sm">© 2025 Al Redowan Ahmed Fahim. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <HireMeForm isOpen={isHireFormOpen} onClose={() => setIsHireFormOpen(false)} />
    </>
  )
}
