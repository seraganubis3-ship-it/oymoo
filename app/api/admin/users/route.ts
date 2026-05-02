import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/user'

export async function GET(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 20
  const search = searchParams.get('search') ?? ''
  const filter = searchParams.get('filter') ?? 'all'
  const sort = searchParams.get('sort') ?? 'createdAt_desc'

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  }
  if (filter === 'active') where.isBlocked = false
  if (filter === 'blocked') where.isBlocked = true
  if (filter === 'completed') {
    where.profile = {
      sessions: { every: { completedAt: { not: null } } },
    }
  }
  if (filter === 'challenge_failed') {
    where.profile = { challengeFailedAt: { not: null } }
  }

  const [field, dir] = sort.split('_')
  const orderBy: Record<string, string> = {}
  orderBy[field === 'name' ? 'name' : 'createdAt'] = dir === 'asc' ? 'asc' : 'desc'

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        profile: {
          include: {
            sessions: { select: { completedAt: true, scheduledAt: true } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users: users.map((u: any) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      isBlocked: u.isBlocked,
      createdAt: u.createdAt,
      challengeFailedAt: u.profile?.challengeFailedAt ?? null,
      completed: u.profile?.sessions.filter((s: any) => s.completedAt).length ?? 0,
      total: u.profile?.sessions.length ?? 0,
      lastSession: u.profile?.sessions.filter((s: any) => s.completedAt).sort((a: any, b: any) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
      )[0]?.completedAt ?? null,
      hasProfile: !!u.profile,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { name, phone, password } = await req.json()
  const phoneRegex = /^05\d{8}$/
  if (!phoneRegex.test(phone)) {
    return NextResponse.json({ error: 'رقم الجوال غير صحيح' }, { status: 400 })
  }
  const existing = await prisma.user.findUnique({ where: { phone } })
  if (existing) {
    return NextResponse.json({ error: 'رقم الجوال مسجّل بالفعل' }, { status: 400 })
  }
  const hashed = await hashPassword(password)
  const user = await prisma.user.create({ data: { name, phone, password: hashed } })
  return NextResponse.json({ success: true, userId: user.id })
}
