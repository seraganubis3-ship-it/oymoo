import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_ADMIN_SECRET ?? 'oymo-admin-secret-fallback-32-chars-key'
)

// ─── JWT helpers ───────────────────────────────────────────────────────────────

export async function signAdminToken(
  adminId: string,
  role: string
): Promise<string> {
  return new SignJWT({ adminId, role, type: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(ADMIN_SECRET)
}

export async function verifyAdminToken(
  token: string
): Promise<{ adminId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET)
    return {
      adminId: payload.adminId as string,
      role: payload.role as string,
    }
  } catch {
    return null
  }
}

// ─── Cookie helper ─────────────────────────────────────────────────────────────

export async function getAdminFromCookie(): Promise<{
  adminId: string
  role: string
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('oymo_admin_token')?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export const ADMIN_COOKIE_OPTIONS = {
  name: 'oymo_admin_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60,
  path: '/',
}
