import { redirect } from 'next/navigation'
import { getUserFromCookie } from '@/lib/auth/user'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/settings'
import SetupClient from './SetupClient'

export default async function SetupPage() {
  const auth = await getUserFromCookie()
  if (!auth) redirect('/login')

  const existing = await prisma.profile.findUnique({
    where: { userId: auth.userId },
  })
  if (existing) redirect('/dashboard')

  const settings = await getSettings()
  return <SetupClient settings={settings} />
}
