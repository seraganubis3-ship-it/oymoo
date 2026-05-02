import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/user'

export async function GET(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, name: true, phone: true, role: true, createdAt: true } })
  return NextResponse.json(admins)
}

export async function POST(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (auth.role !== 'super_admin') return NextResponse.json({ error: 'غير مصرح (super_admin فقط)' }, { status: 403 })
  const { name, phone, password, role } = await req.json()
  const existing = await prisma.admin.findUnique({ where: { phone } })
  if (existing) return NextResponse.json({ error: 'رقم الجوال مسجّل بالفعل' }, { status: 400 })
  const hashed = await hashPassword(password)
  const admin = await prisma.admin.create({ data: { name, phone, password: hashed, role: role ?? 'admin' } })
  return NextResponse.json({ success: true, adminId: admin.id })
}
