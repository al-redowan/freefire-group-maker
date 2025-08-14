import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { validateBasicAuth, createAuthResponse } from "@/lib/auth"

export async function DELETE(request: NextRequest) {
  // Check basic auth
  const authHeader = request.headers.get("authorization")

  if (!validateBasicAuth(authHeader)) {
    return createAuthResponse()
  }

  try {
    const dataPath = path.join(process.cwd(), "data", "data.json")

    // Reset to empty data structure
    const emptyData = {
      teams: [],
      created_at: new Date().toISOString(),
      uploaded_files: [],
    }

    await fs.writeFile(dataPath, JSON.stringify(emptyData, null, 2), "utf-8")

    return NextResponse.json({
      success: true,
      message: "Data deleted successfully",
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 })
  }
}
