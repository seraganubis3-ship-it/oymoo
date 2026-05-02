import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signUserToken, USER_COOKIE_OPTIONS } from '@/lib/auth/user'
import { getSetting, getSettingBool } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, password } = body

    // Validate Saudi phone format
    const phoneRegex = /^05\d{8}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { phone } })

    if (!user) {
      // User not found — self-registration is NOT allowed
      const allowReg = await getSettingBool('allow_new_registrations')
      if (!allowReg) {
        const msg = await getSetting('registration_closed_message')
        return NextResponse.json({ error: msg }, { status: 403 })
      }
      return NextResponse.json(
        { error: 'يرجى التواصل مع الإدارة لإنشاء حسابك' },
        { status: 401 }
      )
    }

    // Check blocked
    if (user.isBlocked) {
      const msg = await getSetting('login_blocked_message')
      return NextResponse.json({ error: msg }, { status: 403 })
    }

    // Verify password
    const valid = await comparePassword(password, user.password)
    if (!valid) {
      const msg = await getSetting('login_wrong_credentials')
      return NextResponse.json({ error: msg }, { status: 401 })
    }

    // Sign token
    const token = await signUserToken(user.id)

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    const res = NextResponse.json({
      redirectTo: profile ? '/dashboard' : '/setup',
    })

    res.cookies.set({
      ...USER_COOKIE_OPTIONS,
      value: token,
    })

    return res
  } catch (err) {
    console.error('[/api/auth/login]', err)
    return NextResponse.json({ error: 'حدث خطأ، حاولي مجدداً' }, { status: 500 })
  }
}
