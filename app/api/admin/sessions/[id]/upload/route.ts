import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { saveFile, deleteFile } from '@/lib/upload'
import { logAction } from '@/lib/audit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const session = await prisma.session.findUnique({ where: { id: params.id } })
  if (!session) return NextResponse.json({ error: 'غير موجودة' }, { status: 404 })
  const formData = await req.formData()
  const file = formData.get('photo') as File
  if (!file || file.size === 0) return NextResponse.json({ error: 'لا توجد صورة' }, { status: 400 })
  await deleteFile(session.photoUrl)
  const photoUrl = await saveFile(file, 'sessions')
  const updated = await prisma.session.update({ where: { id: params.id }, data: { photoUrl } })
  await logAction(auth.adminId, 'upload_session_photo', undefined, { sessionId: params.id })
  return NextResponse.json(updated)
}
