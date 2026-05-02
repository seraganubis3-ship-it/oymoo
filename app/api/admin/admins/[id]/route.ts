import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (auth.role !== 'super_admin') return NextResponse.json({ error: 'غير مصرح (super_admin فقط)' }, { status: 403 })
  if (auth.adminId === params.id) return NextResponse.json({ error: 'لا يمكنك حذف نفسك' }, { status: 400 })

  // Cannot remove last super_admin
  const superAdmins = await prisma.admin.count({ where: { role: 'super_admin' } })
  const target = await prisma.admin.findUnique({ where: { id: params.id } })
  if (target?.role === 'super_admin' && superAdmins <= 1) {
    return NextResponse.json({ error: 'لا يمكن حذف آخر مشرف رئيسي' }, { status: 400 })
  }

  await prisma.admin.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
