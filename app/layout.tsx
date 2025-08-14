import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { StructuredData } from "@/components/structured-data"
import "./globals.css"

export const metadata: Metadata = {
  title: "ESports Team Analyzer - Tournament Group Management",
  description:
    "Upload team data, generate groups, and manage esports tournaments with ease. Perfect for tournament organizers and esports communities.",
  generator: "ESports Team Analyzer",
  keywords: "esports, tournament, team management, group generator, csv parser, team analyzer, gaming, competition",
  authors: [{ name: "ESports Team Analyzer" }],
  creator: "ESports Team Analyzer",
  publisher: "ESports Team Analyzer",
  robots: "index, follow",
  canonical: "https://esports-analyzer.vercel.app",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://esports-analyzer.vercel.app",
    title: "ESports Team Analyzer - Tournament Group Management",
    description: "Upload team data, generate groups, and manage esports tournaments with ease.",
    siteName: "ESports Team Analyzer",
    images: [
      {
        url: "https://esports-analyzer.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ESports Team Analyzer - Tournament Management Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ESports Team Analyzer - Tournament Group Management",
    description: "Upload team data, generate groups, and manage esports tournaments with ease.",
    creator: "@esports_analyzer",
    images: ["https://esports-analyzer.vercel.app/twitter-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://esports-analyzer.vercel.app",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        <link rel="canonical" href="https://esports-analyzer.vercel.app" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
