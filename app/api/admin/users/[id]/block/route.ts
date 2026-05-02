import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/audit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) return NextResponse.json({ error: 'غير موجودة' }, { status: 404 })
  const updated = await prisma.user.update({ where: { id: params.id }, data: { isBlocked: !user.isBlocked } })
  await logAction(auth.adminId, updated.isBlocked ? 'block_user' : 'unblock_user', params.id)
  return NextResponse.json({ isBlocked: updated.isBlocked })
}
