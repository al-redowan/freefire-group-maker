export function validateBasicAuth(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false
  }

  const base64Credentials = authHeader.slice(6)
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
  const [username, password] = credentials.split(":")

  const expectedUser = process.env.ADMIN_USER || "fahim"
  const expectedPass = process.env.ADMIN_PASS || "ptotrx"

  return username === expectedUser && password === expectedPass
}

export function createAuthResponse(): Response {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  })
}

// In-memory token storage for ephemeral tokens
const tokenStore = new Map<string, { expires: number; user: string }>()

export function generateToken(user: string): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const expires = Date.now() + 60 * 60 * 1000 // 1 hour

  tokenStore.set(token, { expires, user })

  // Clean up expired tokens
  for (const [key, value] of tokenStore.entries()) {
    if (value.expires < Date.now()) {
      tokenStore.delete(key)
    }
  }

  return token
}

export function validateToken(token: string): string | null {
  const tokenData = tokenStore.get(token)

  if (!tokenData || tokenData.expires < Date.now()) {
    if (tokenData) tokenStore.delete(token)
    return null
  }

  return tokenData.user
}
