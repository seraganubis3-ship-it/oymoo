import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { startOfMonth, subMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const monthStart = startOfMonth(new Date())

  const [totalUsers, todaySessions, monthActive, totalCompleted, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.session.count({ where: { scheduledAt: { gte: today, lt: tomorrow } } }),
    prisma.user.count({
      where: { profile: { sessions: { some: { completedAt: { gte: monthStart } } } } },
    }),
    prisma.session.count({ where: { completedAt: { not: null } } }),
    prisma.session.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      take: 15,
      include: { profile: { include: { user: { select: { name: true } } } } },
    }),
  ])

  // Users per month (last 6)
  const usersPerMonth = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const start = startOfMonth(subMonths(new Date(), 5 - i))
      const end = startOfMonth(subMonths(new Date(), 4 - i))
      return prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }).then((count: number) => ({
        month: start.toLocaleDateString('ar-SA', { month: 'short' }),
        count,
      }))
    })
  )

  // Completed sessions per month (last 6)
  const sessionsPerMonth = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const start = startOfMonth(subMonths(new Date(), 5 - i))
      const end = startOfMonth(subMonths(new Date(), 4 - i))
      return prisma.session.count({ where: { completedAt: { gte: start, lt: end } } }).then((count: number) => ({
        month: start.toLocaleDateString('ar-SA', { month: 'short' }),
        count,
      }))
    })
  )

  const totalSessionsInDb = await prisma.session.count()

  return NextResponse.json({
    totalUsers, todaySessions, monthActive, totalCompleted,
    totalSessions: totalSessionsInDb,
    usersPerMonth, sessionsPerMonth,
    recentActivity: recentActivity.map(s => ({
      id: s.id,
      userName: s.profile.user.name,
      sessionNumber: s.sessionNumber,
      completedAt: s.completedAt,
      photoUrl: s.photoUrl,
    })),
  })
}
