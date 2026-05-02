import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const sessions = await prisma.session.findMany({
    orderBy: { scheduledAt: 'asc' },
    include: { profile: { include: { user: { select: { name: true, phone: true } } } } },
  })

  const rows = [
    ['المستخدمة', 'الجوال', 'رقم الجلسة', 'الموعد', 'الإتمام', 'ملاحظات'],
    ...sessions.map(s => [
      s.profile.user.name,
      s.profile.user.phone,
      s.sessionNumber,
      s.scheduledAt.toLocaleDateString('ar-SA'),
      s.completedAt ? s.completedAt.toLocaleDateString('ar-SA') : '',
      s.notes ?? '',
    ]),
  ]

  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sessions.csv"',
    },
  })
}
