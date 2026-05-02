import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/upload'
import { logAction } from '@/lib/audit'
import { generateSessions } from '@/lib/sessions'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (auth.role !== 'super_admin') return NextResponse.json({ error: 'غير مصرح (super_admin فقط)' }, { status: 403 })

  const profile = await prisma.profile.findUnique({
    where: { userId: params.id },
    include: { sessions: { select: { id: true, photoUrl: true } } },
  })
  if (!profile) return NextResponse.json({ error: 'الملف الشخصي غير موجود' }, { status: 404 })

  // Delete session photos
  for (const s of profile.sessions) await deleteFile(s.photoUrl)
  // Delete all sessions
  await prisma.session.deleteMany({ where: { profileId: profile.id } })
  // Regenerate
  await generateSessions(profile.id, profile.firstSessionDate, profile.preferredTime)
  await logAction(auth.adminId, 'reset_sessions', params.id)
  return NextResponse.json({ success: true })
}
