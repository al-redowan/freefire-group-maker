import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { validateBasicAuth, createAuthResponse, validateToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  // Check token-based auth first, then fall back to basic auth
  if (token) {
    const user = validateToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }
  } else {
    // Check basic auth
    const authHeader = request.headers.get("authorization")
    if (!validateBasicAuth(authHeader)) {
      return createAuthResponse()
    }
  }

  try {
    const dataPath = path.join(process.cwd(), "data", "data.json")
    const data = await fs.readFile(dataPath, "utf-8")

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="data.json"',
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Failed to download data" }, { status: 500 })
  }
}
