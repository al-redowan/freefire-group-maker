// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000, // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }

  const current = rateLimitMap.get(identifier)

  if (!current || current.resetTime < now) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  if (current.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  current.count++
  return {
    success: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  }
}
