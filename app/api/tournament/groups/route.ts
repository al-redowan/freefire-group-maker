import { type NextRequest, NextResponse } from "next/server"
import { loadData } from "@/lib/data-storage"
import { generateTournamentGroups, formatGroupsAsText } from "@/lib/tournament-grouping"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamsPerGroup = 4, algorithm = "balanced" } = body

    const data = await loadData()

    if (data.teams.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No teams available. Please upload team data or use Manual Team Input to add teams first.",
        },
        { status: 400 },
      )
    }

    const numberOfGroups = Math.ceil(data.teams.length / teamsPerGroup)
    const grouping = generateTournamentGroups(data.teams, numberOfGroups, algorithm)

    return NextResponse.json({
      success: true,
      grouping,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Tournament grouping error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate tournament groups",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const teamsPerGroup = Number.parseInt(url.searchParams.get("teamsPerGroup") || "4")
    const algorithm = (url.searchParams.get("algorithm") as "balanced" | "random" | "sequential") || "balanced"
    const format = url.searchParams.get("format")

    const data = await loadData()
    const numberOfGroups = Math.ceil(data.teams.length / teamsPerGroup)
    const grouping = generateTournamentGroups(data.teams, numberOfGroups, algorithm)

    if (format === "text") {
      const textOutput = formatGroupsAsText(grouping)
      return new NextResponse(textOutput, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    return NextResponse.json({
      success: true,
      grouping,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Tournament grouping error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate tournament groups",
      },
      { status: 500 },
    )
  }
}
