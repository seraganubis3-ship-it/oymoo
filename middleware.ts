import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const USER_SECRET = new TextEncoder().encode(
  process.env.JWT_USER_SECRET ?? 'oymo-user-secret-fallback-32-chars-key'
)
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_ADMIN_SECRET ?? 'oymo-admin-secret-fallback-32-chars-key'
)

// Routes that require user auth
const USER_PROTECTED = ['/dashboard', '/setup', '/session']
// Routes that require admin auth
const ADMIN_PROTECTED = ['/admin']
// Admin login page (don't redirect if already authed admin — let admin layout handle)
const ADMIN_LOGIN = '/admin/login'
// User login page
const USER_LOGIN = '/login'

async function verifyToken(token: string, secret: Uint8Array) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  const nextWithHeaders = () => NextResponse.next({ request: { headers: requestHeaders } })

  // ── Skip static assets & API ──────────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/favicon') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/admin'))
  ) {
    return nextWithHeaders()
  }

  // ── Maintenance mode is now handled in layout.tsx ────────────────────────

  // ── Admin route protection ────────────────────────────────────────────────
  if (ADMIN_PROTECTED.some((p) => pathname.startsWith(p))) {
    // Admin login page — always allow
    if (pathname === ADMIN_LOGIN) {
      return nextWithHeaders()
    }

    const token = req.cookies.get('oymo_admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url))
    }
    const payload = await verifyToken(token, ADMIN_SECRET)
    if (!payload) {
      const res = NextResponse.redirect(new URL(ADMIN_LOGIN, req.url))
      res.cookies.delete('oymo_admin_token')
      return res
    }
    return nextWithHeaders()
  }

  // ── User route protection ─────────────────────────────────────────────────
  if (USER_PROTECTED.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get('oymo_user_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL(USER_LOGIN, req.url))
    }
    const payload = await verifyToken(token, USER_SECRET)
    if (!payload) {
      const res = NextResponse.redirect(new URL(USER_LOGIN, req.url))
      res.cookies.delete('oymo_user_token')
      return res
    }
    return nextWithHeaders()
  }

  // ── Redirect logged-in users away from /login ─────────────────────────────
  if (pathname === USER_LOGIN) {
    const token = req.cookies.get('oymo_user_token')?.value
    if (token) {
      const payload = await verifyToken(token, USER_SECRET)
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return nextWithHeaders()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
