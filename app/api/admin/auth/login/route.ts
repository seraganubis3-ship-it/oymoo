import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, hashPassword } from '@/lib/auth/user'
import { signAdminToken, ADMIN_COOKIE_OPTIONS } from '@/lib/auth/admin'
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const key = `admin-login:${ip}:${phone}`

    if (checkRateLimit(key, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد المحاولات. حاول بعد 15 دقيقة.' },
        { status: 429 }
      )
    }

    const admin = await prisma.admin.findUnique({ where: { phone } })
    if (!admin) {
      return NextResponse.json({ error: 'رقم الجوال أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    const valid = await comparePassword(password, admin.password)
    if (!valid) {
      return NextResponse.json({ error: 'رقم الجوال أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    resetRateLimit(key)
    const token = await signAdminToken(admin.id, admin.role)
    const res = NextResponse.json({ success: true })
    res.cookies.set({ ...ADMIN_COOKIE_OPTIONS, value: token })
    return res
  } catch (err) {
    console.error('[admin/auth/login]', err)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
