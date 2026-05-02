import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/user'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password } = await req.json()
    
    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 })
    }

    const phoneRegex = /^05\d{8}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'رقم الجوال غير صحيح' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json({ error: 'رقم الجوال مسجّل بالفعل' }, { status: 400 })
    }

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({ data: { name, phone, password: hashed } })
    
    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'حدث خطأ في السيرفر' }, { status: 500 })
  }
}
