import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/audit'
import { addWeeks, setHours, setMinutes, startOfDay } from 'date-fns'
import { getSettingNumber } from '@/lib/settings'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { firstSessionDate } = await req.json()
  const profile = await prisma.profile.findUnique({
    where: { userId: params.id },
    include: { sessions: { where: { completedAt: null }, orderBy: { sessionNumber: 'asc' } } },
  })
  if (!profile) return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })

  const intervalWeeks = await getSettingNumber('session_interval_weeks')
  const newStart = new Date(firstSessionDate)
  const [h, m] = profile.preferredTime.split(':').map(Number)

  // Only update incomplete sessions' dates
  for (const session of profile.sessions) {
    const base = addWeeks(startOfDay(newStart), (session.sessionNumber - 1) * intervalWeeks)
    const scheduledAt = setMinutes(setHours(base, h), m)
    await prisma.session.update({ where: { id: session.id }, data: { scheduledAt } })
  }

  await prisma.profile.update({ where: { id: profile.id }, data: { firstSessionDate: newStart } })
  await logAction(auth.adminId, 'recalc_sessions', params.id, { newFirstSessionDate: firstSessionDate })
  return NextResponse.json({ success: true })
}
