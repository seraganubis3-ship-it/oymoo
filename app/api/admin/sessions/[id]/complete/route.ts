import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/audit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { completedAt } = await req.json()
  const session = await prisma.session.update({
    where: { id: params.id },
    data: { completedAt: completedAt ? new Date(completedAt) : new Date() },
  })
  await logAction(auth.adminId, 'complete_session', undefined, { sessionId: params.id })
  return NextResponse.json(session)
}
