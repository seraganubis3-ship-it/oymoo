import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { saveFile, deleteFile } from '@/lib/upload'
import { logAction } from '@/lib/audit'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.notes !== undefined) data.notes = body.notes
  if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt)
  if (body.completedAt) data.completedAt = new Date(body.completedAt)
  const updated = await prisma.session.update({ where: { id: params.id }, data })
  await logAction(auth.adminId, 'update_session', undefined, { sessionId: params.id, fields: Object.keys(data) })
  return NextResponse.json(updated)
}
