import { type NextRequest, NextResponse } from "next/server"
import { loadData } from "@/lib/data-storage"
import { generateOutputBlocks, formatOutputBlocksAsText } from "@/lib/output-generator"
import { generateTournamentGroups } from "@/lib/tournament-grouping"

export async function GET(request: NextRequest) {
  try {
    const data = await loadData()

    const url = new URL(request.url)
    const teamsPerGroup = Number.parseInt(url.searchParams.get("teamsPerGroup") || "4")
    const algorithm = (url.searchParams.get("algorithm") as "balanced" | "random" | "sequential") || "balanced"
    const format = url.searchParams.get("format")

    const numberOfGroups = Math.ceil(data.teams.length / teamsPerGroup)
    const grouping = generateTournamentGroups(data.teams, numberOfGroups, algorithm)

    const outputBlocks = generateOutputBlocks(data, grouping)

    if (format === "text") {
      const textOutput = formatOutputBlocksAsText(outputBlocks)
      return new NextResponse(textOutput, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    // Return JSON format by default
    return NextResponse.json({
      success: true,
      blocks: outputBlocks,
      totalTeams: data.teams.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Output generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate output blocks",
      },
      { status: 500 },
    )
  }
}
