import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { profile: { include: { sessions: { select: { completedAt: true } } } } },
  })

  const rows = [
    ['الاسم', 'الجوال', 'تاريخ التسجيل', 'الجلسات المكتملة', 'الحالة'],
    ...users.map(u => [
      u.name,
      u.phone,
      u.createdAt.toLocaleDateString('ar-SA'),
      u.profile?.sessions.filter(s => s.completedAt).length ?? 0,
      u.isBlocked ? 'محظورة' : 'نشطة',
    ]),
  ]

  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="users.csv"',
    },
  })
}
