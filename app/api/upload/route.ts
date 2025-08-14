import { type NextRequest, NextResponse } from "next/server"
import { parseFile } from "@/lib/file-parser"
import { loadData, saveData, mergeTeamData } from "@/lib/data-storage"
import { rateLimit } from "@/lib/rate-limiter"
import { sanitizeText, validateFileContent, getClientIP } from "@/lib/security"
import type { UploadResponse, ParsedFileData } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(clientIP, 5, 60000) // 5 requests per minute

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
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 })
    }

    // Validate files
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        return NextResponse.json({ success: false, message: `File ${file.name} exceeds 10MB limit` }, { status: 400 })
      }

      const extension = file.name.toLowerCase().split(".").pop()
      if (!["csv", "txt"].includes(extension || "")) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} must be CSV or TXT format` },
          { status: 400 },
        )
      }
    }

    const existingData = await loadData()
    let updatedData = existingData
    const parsedFiles: ParsedFileData[] = []
    let totalNewTeams = 0

    // Process each file
    for (const file of files) {
      const content = await file.text()

      const validation = validateFileContent(content, file.name)
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.error || "Invalid file content" },
          { status: 400 },
        )
      }

      const parsedTeams = parseFile(content, file.name)

      const sanitizedTeams = parsedTeams.map((team) => ({
        team_name: sanitizeText(team.team_name),
        email: sanitizeText(team.email),
        username: sanitizeText(team.username),
      }))

      // Merge with existing data
      updatedData = await mergeTeamData(updatedData, sanitizedTeams, file.name)

      const parsedFileData: ParsedFileData = {
        teams: sanitizedTeams,
        filename: file.name,
        rowCount: sanitizedTeams.length,
        duplicatesRemoved: 0, // Will be calculated during merge
      }

      parsedFiles.push(parsedFileData)
      totalNewTeams += sanitizedTeams.length
    }

    // Save updated data
    await saveData(updatedData)

    const response: UploadResponse = {
      success: true,
      message: `Successfully processed ${files.length} file(s)`,
      parsedData: parsedFiles[0], // Return first file's data for preview
      totalTeams: updatedData.teams.length,
    }

    return NextResponse.json(response, {
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, message: "Failed to process files" }, { status: 500 })
  }
}
