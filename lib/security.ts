import DOMPurify from "isomorphic-dompurify"

export function sanitizeText(text: string): string {
  if (!text) return ""

  // Remove HTML tags and potentially dangerous content
  const cleaned = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })

  // Additional sanitization for CSV/TXT content
  return cleaned
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

export function validateFileContent(content: string, filename: string): { valid: boolean; error?: string } {
  // Check file size (already handled in upload, but double-check)
  if (content.length > 10 * 1024 * 1024) {
    return { valid: false, error: "File content too large" }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return { valid: false, error: "File contains potentially malicious content" }
    }
  }

  return { valid: true }
}

export function getClientIP(request: Request): string {
  // Try to get real IP from headers (for production behind proxy)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  // Fallback for development
  return "127.0.0.1"
}
