import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { getSaudiTodayStartUTC } from '@/lib/challenge'

export async function GET(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') ?? 'all'
  const range = searchParams.get('range') ?? 'all'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 30

  const where: Record<string, unknown> = {}
  const now = new Date()
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30)

  // نطاق زمني
  if (range === 'today') where.scheduledAt = { gte: today }
  if (range === 'week')  where.scheduledAt = { gte: weekAgo }
  if (range === 'month') where.scheduledAt = { gte: monthAgo }

  // فلتر الحالة
  const saudiTodayStart = getSaudiTodayStartUTC()
  const saudiTodayEnd = new Date(saudiTodayStart.getTime() + 24 * 60 * 60 * 1000)

  if (filter === 'completed') {
    where.completedAt = { not: null }
  } else if (filter === 'expired') {
    // خسارة التحدي: لم تكتمل + يومها فات بالتوقيت السعودي
    where.completedAt = null
    where.scheduledAt = { ...(where.scheduledAt as object ?? {}), lt: saudiTodayStart }
  } else if (filter === 'today') {
    // اليوم بالتوقيت السعودي
    where.completedAt = null
    where.scheduledAt = { gte: saudiTodayStart, lt: saudiTodayEnd }
  } else if (filter === 'upcoming') {
    // قادمة: لم تكتمل + يومها لم يأتِ بعد
    where.completedAt = null
    where.scheduledAt = { ...(where.scheduledAt as object ?? {}), gte: saudiTodayEnd }
  }

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        profile: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
          // challengeFailedAt is automatically included via include
        },
      },
    }),
    prisma.session.count({ where }),
  ])

  return NextResponse.json({ sessions, total, page, pages: Math.ceil(total / limit) })
}
