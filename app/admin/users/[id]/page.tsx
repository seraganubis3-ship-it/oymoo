import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { getSettingNumber } from '@/lib/settings'
import { redirect } from 'next/navigation'
import AdminUserDetailClient from './AdminUserDetailClient'

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) redirect('/admin/login')

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { profile: { include: { sessions: { orderBy: { sessionNumber: 'asc' } } } } },
  })
  if (!user) notFound()

  const totalSessions = 10

  return (
    <AdminUserDetailClient
      user={JSON.parse(JSON.stringify(user))}
      totalSessions={totalSessions}
      adminRole={auth.role}
    />
  )
}
