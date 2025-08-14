export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ESports Team Analyzer",
    description: "Upload team data, generate groups, and manage esports tournaments with ease",
    url: "https://esports-analyzer.vercel.app",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "ESports Team Analyzer",
    },
    featureList: [
      "CSV and TXT file parsing",
      "Automatic data deduplication",
      "Team group generation",
      "Admin data management",
      "Export functionality",
    ],
    screenshot: "https://esports-analyzer.vercel.app/screenshot.png",
    softwareVersion: "1.0.0",
    datePublished: "2025-01-08",
    dateModified: new Date().toISOString().split("T")[0],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}
