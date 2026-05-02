/**
 * In-memory rate limiter.
 * Tracks failed attempts per key (e.g. IP or email).
 * After `max` attempts within `windowMs`, returns true (rate limited).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Check if a key is rate-limited.
 * @returns true if the request should be blocked, false if allowed.
 */
export function checkRateLimit(
  key: string,
  max: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // First attempt or window expired — reset
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= max) {
    return true // blocked
  }

  entry.count++
  return false
}

/**
 * Record a successful login — reset the counter for this key.
 */
export function resetRateLimit(key: string): void {
  store.delete(key)
}

/**
 * Get remaining attempts for a key.
 */
export function getRemainingAttempts(
  key: string,
  max: number = 5
): number {
  const entry = store.get(key)
  if (!entry || Date.now() > entry.resetAt) return max
  return Math.max(0, max - entry.count)
}
