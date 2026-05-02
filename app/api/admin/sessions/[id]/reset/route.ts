import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/upload'
import { logAction } from '@/lib/audit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const session = await prisma.session.findUnique({ where: { id: params.id } })
  if (!session) return NextResponse.json({ error: 'غير موجودة' }, { status: 404 })
  await deleteFile(session.photoUrl)
  const updated = await prisma.session.update({
    where: { id: params.id },
    data: { completedAt: null, photoUrl: null },
  })
  await logAction(auth.adminId, 'reset_session', undefined, { sessionId: params.id })
  return NextResponse.json(updated)
}
