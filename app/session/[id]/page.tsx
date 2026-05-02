import { redirect, notFound } from 'next/navigation'
import { getUserFromCookie } from '@/lib/auth/user'
import { prisma } from '@/lib/prisma'
import { getSettings, getSettingNumber } from '@/lib/settings'
import { getNextSession } from '@/lib/sessions'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import SessionDetailClient from './SessionDetailClient'

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const auth = await getUserFromCookie()
  if (!auth) redirect('/login')

  const session = await prisma.session.findFirst({
    where: { id: params.id, profile: { userId: auth.userId } },
    include: { profile: true },
  })
  if (!session) notFound()

  const totalSessions = await getSettingNumber('total_sessions')
  const s = await getSettings()
  const nextSession = await getNextSession(session.profileId)
  const isCurrentSession = nextSession?.id === session.id
  const isCompleted = !!session.completedAt

  return (
    <main className="min-h-screen bg-background">
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-gold transition-colors">
          <ChevronRight className="w-4 h-4" />
          العودة للوحة
        </Link>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              الجلسة {session.sessionNumber} <span className="text-muted font-normal text-lg">من {totalSessions}</span>
            </h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isCompleted ? 'bg-success/10 text-success border border-success/20' : 'bg-gold/10 text-gold border border-gold/20'}`}>
              {isCompleted ? 'مكتملة ✓' : 'قادمة'}
            </span>
          </div>
          <p className="text-muted text-sm">
            {format(new Date(session.scheduledAt), 'EEEE، d MMMM yyyy — hh:mm a', { locale: ar })}
          </p>
          {isCompleted && session.completedAt && (
            <p className="text-success text-sm">
              ✓ أُكملت في {format(new Date(session.completedAt), 'd MMMM yyyy', { locale: ar })}
            </p>
          )}
        </div>
        <SessionDetailClient
          session={{
            id: session.id,
            sessionNumber: session.sessionNumber,
            scheduledAt: session.scheduledAt.toISOString(),
            completedAt: session.completedAt?.toISOString() ?? null,
            photoUrl: session.photoUrl,
            notes: session.notes,
          }}
          beforePhotoUrl={session.profile.beforePhotoUrl}
          isCurrentSession={isCurrentSession}
          settings={{ dashboard_complete_btn: s.dashboard_complete_btn, dashboard_upload_btn: s.dashboard_upload_btn }}
        />
      </div>
    </main>
  )
}
