import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const USER_SECRET = new TextEncoder().encode(
  process.env.JWT_USER_SECRET ?? 'oymo-user-secret-fallback-32-chars-key'
)

// ─── Password helpers ──────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT helpers ───────────────────────────────────────────────────────────────

export async function signUserToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(USER_SECRET)
}

export async function verifyUserToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, USER_SECRET)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

// ─── Cookie helper ─────────────────────────────────────────────────────────────

export async function getUserFromCookie(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('oymo_user_token')?.value
  if (!token) return null
  return verifyUserToken(token)
}

export const USER_COOKIE_OPTIONS = {
  name: 'oymo_user_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: '/',
}
