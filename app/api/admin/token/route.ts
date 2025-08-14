import { type NextRequest, NextResponse } from "next/server"
import { validateBasicAuth, createAuthResponse, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Check basic auth
  const authHeader = request.headers.get("authorization")

  if (!validateBasicAuth(authHeader)) {
    return createAuthResponse()
  }

  try {
    const expectedUser = process.env.ADMIN_USER || "hiedan amin"
    const token = generateToken(expectedUser)

    return NextResponse.json({
      success: true,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error("Token generation error:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
