import { type NextRequest, NextResponse } from "next/server"
import { loadData, saveData, mergeTeamData } from "@/lib/data-storage"
import { rateLimit } from "@/lib/rate-limiter"
import { sanitizeText, getClientIP } from "@/lib/security"
import type { UploadResponse, ParsedFileData, TeamData } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(clientIP, 10, 60000) // 10 requests per minute for manual input

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      )
    }

    const body = await request.json()
    const { teams } = body

    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      return NextResponse.json({ success: false, message: "No teams provided" }, { status: 400 })
    }

    // Validate and sanitize teams
    const sanitizedTeams: TeamData[] = teams.map((team) => ({
      team_name: sanitizeText(team.team_name || ""),
      email: sanitizeText(team.email || ""),
      username: sanitizeText(team.username || ""),
    }))

    // Load existing data and merge
    const existingData = await loadData()
    const updatedData = await mergeTeamData(existingData, sanitizedTeams, "Manual Input")

    // Save updated data
    await saveData(updatedData)

    const parsedFileData: ParsedFileData = {
      teams: sanitizedTeams,
      filename: "Manual Input",
      rowCount: sanitizedTeams.length,
      duplicatesRemoved: existingData.teams.length + sanitizedTeams.length - updatedData.teams.length,
    }

    const response: UploadResponse = {
      success: true,
      message: `Successfully processed ${sanitizedTeams.length} team names`,
      parsedData: parsedFileData,
      totalTeams: updatedData.teams.length,
    }

    return NextResponse.json(response, {
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    })
  } catch (error) {
    console.error("Manual teams error:", error)
    return NextResponse.json({ success: false, message: "Failed to process team names" }, { status: 500 })
  }
}
