import { redirect } from 'next/navigation'
import { getUserFromCookie } from '@/lib/auth/user'
import { prisma } from '@/lib/prisma'
import { getSettings, getSettingNumber } from '@/lib/settings'
import { getRandomMotivation, getProgressMessage } from '@/lib/sessions'
import { isSessionExpired, getDaysUntilDelete } from '@/lib/challenge'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import SessionCard from './SessionCard'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const auth = await getUserFromCookie()
  if (!auth) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      profile: {
        include: {
          sessions: { orderBy: { sessionNumber: 'asc' } },
        },
      },
    },
  })

  if (!user) redirect('/login')
  if (!user.profile) redirect('/setup')

  const s = await getSettings()
  const totalSessions = await getSettingNumber('total_sessions')
  const deleteDays = await getSettingNumber('challenge_failed_delete_days')
  const sessions = user.profile.sessions
  const profile = user.profile

  // ── اكتشاف خسارة التحدي ──────────────────────────────────────────────────
  // لو لم يُسجّل الخسارة بعد، نفحص الجلسات الآن
  let challengeFailedAt = profile.challengeFailedAt

  if (!challengeFailedAt) {
    const hasExpiredSession = sessions.some((session) =>
      isSessionExpired(new Date(session.scheduledAt), session.completedAt)
    )
    if (hasExpiredSession) {
      // نسجّل وقت الخسارة في قاعدة البيانات
      const updated = await prisma.profile.update({
        where: { id: profile.id },
        data: { challengeFailedAt: new Date() },
      })
      challengeFailedAt = updated.challengeFailedAt
    }
  }

  // ── Fire-and-forget cleanup (direct Prisma — أسرع وأموثوق) ──────────────
  // نحذف في الخلفية بدون await حتى لا نُبطئ الصفحة
  if (deleteDays > 0) {
    const cutoff = new Date(Date.now() - deleteDays * 24 * 60 * 60 * 1000)
    prisma.user.deleteMany({
      where: {
        profile: {
          is: {
            challengeFailedAt: { not: null, lt: cutoff },
          },
        },
      },
    }).catch(() => {}) // ignore errors silently
  }
  // ── الإحصائيات ──────────────────────────────────────────────────────────
  const completed = sessions.filter((s: any) => s.completedAt).length
  const progressPct = totalSessions > 0 ? Math.round((completed / totalSessions) * 100) : 0

  // الجلسة الحالية: أول جلسة غير مكتملة وغير منتهية
  const nextSession = challengeFailedAt
    ? null
    : sessions.find((session: any) =>
        !session.completedAt && !isSessionExpired(new Date(session.scheduledAt), session.completedAt)
      ) ?? null

  const motivation = await getRandomMotivation()
  const progressMsg = await getProgressMessage(completed, totalSessions)
  const daysUntilDelete = challengeFailedAt ? getDaysUntilDelete(challengeFailedAt, deleteDays) : null

  return (
    <main className="min-h-screen bg-background">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: challengeFailedAt
            ? 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-white">
              {s.dashboard_greeting_prefix}{' '}
              <span
                style={{
                  background: challengeFailedAt
                    ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                    : 'linear-gradient(135deg, #D4A843, #F0C050)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {user.name}
              </span>{' '}
              {challengeFailedAt ? '💔' : '✨'}
            </h1>
            <p className="text-muted text-sm mt-1">{progressMsg}</p>
          </div>
          <LogoutButton />
        </div>

        {/* ── بانر خسارة التحدي ───────────────────────────────────────────── */}
        {challengeFailedAt && (
          <div
            className="rounded-2xl p-5 space-y-3 animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
              border: '1px solid rgba(239,68,68,0.35)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">💔</span>
              <div>
                <p className="text-lg font-bold text-white">خسرت التحدي</p>
                <p className="text-sm text-muted">
                  {format(new Date(challengeFailedAt), 'd MMMM yyyy', { locale: ar })}
                </p>
              </div>
            </div>

            {/* رسالة الخسارة المخصصة */}
            <div
              className="rounded-xl p-4 space-y-1"
              style={{ background: 'rgba(0,0,0,0.25)' }}
            >
              {s.challenge_failed_warning_msg?.split('\n').map((line: string, i: number) => (
                <p key={i} className="text-sm text-muted leading-relaxed">
                  {line}
                </p>
              ))}
            </div>

            {/* عداد الحذف */}
            {daysUntilDelete !== null && (
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <span className="text-sm text-muted">سيُحذف الحساب خلال</span>
                <span className="text-lg font-black" style={{ color: '#EF4444' }}>
                  {daysUntilDelete === 0 ? 'قريباً جداً' : `${daysUntilDelete} يوم`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Progress Card ───────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 space-y-4 animate-slide-up"
          style={{
            background: '#111111',
            border: '1px solid #1F1F1F',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">{s.dashboard_progress_title}</h2>
            <span className="text-sm font-bold" style={{ color: '#D4A843' }}>
              {progressPct}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-white">{completed}</span>
            <span className="text-muted">/</span>
            <span className="text-xl font-bold text-muted">{totalSessions}</span>
            <span className="text-sm text-muted">جلسة</span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ background: '#1F1F1F' }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progressPct}%`,
                background: challengeFailedAt
                  ? 'linear-gradient(90deg, #991B1B, #EF4444)'
                  : 'linear-gradient(90deg, #C49832, #D4A843, #F0C050)',
                boxShadow: progressPct > 0 ? '0 0 12px rgba(212,168,67,0.4)' : 'none',
              }}
            />
          </div>
        </div>

        {/* ── Next Session Card (فقط لو لم يخسر) ─────────────────────────── */}
        {nextSession && !challengeFailedAt && (
          <div
            className="rounded-2xl p-5 space-y-3 animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, rgba(212,168,67,0.08), rgba(212,168,67,0.02))',
              border: '1px solid rgba(212,168,67,0.25)',
            }}
          >
            <h2 className="font-semibold text-white">{s.dashboard_next_title}</h2>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted">
                  الجلسة {nextSession.sessionNumber} من {totalSessions}
                </p>
                <p className="text-lg font-bold text-white">
                  {format(new Date(nextSession.scheduledAt), 'EEEE، d MMMM yyyy', { locale: ar })}
                </p>
                <p className="text-gold text-sm">
                  {format(new Date(nextSession.scheduledAt), 'hh:mm a', { locale: ar })}
                </p>
              </div>
              <div className="text-4xl select-none">📅</div>
            </div>
            <div
              className="rounded-xl p-3 text-sm text-muted italic"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <span className="text-gold">✦</span> {motivation}
            </div>
            <p className="text-xs text-muted/70">{s.dashboard_challenge_text}</p>
          </div>
        )}

        {/* ── Sessions List ─────────────────────────────────────────────────── */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-white">{s.dashboard_schedule_title}</h2>
          <div className="space-y-2">
            {sessions.map((session: any) => {
              const isCompleted = !!session.completedAt
              const isExpired = isSessionExpired(new Date(session.scheduledAt), session.completedAt)
              const isCurrent =
                !challengeFailedAt &&
                !isCompleted &&
                !isExpired &&
                nextSession?.id === session.id

              return (
                <SessionCard
                  key={session.id}
                  session={{
                    id: session.id,
                    sessionNumber: session.sessionNumber,
                    scheduledAt: session.scheduledAt.toISOString(),
                    completedAt: session.completedAt?.toISOString() ?? null,
                    photoUrl: session.photoUrl,
                    notes: session.notes,
                  }}
                  totalSessions={totalSessions}
                  isCompleted={isCompleted}
                  isExpired={isExpired}
                  isCurrent={isCurrent}
                  challengeFailed={!!challengeFailedAt}
                  settings={{
                    dashboard_complete_btn: s.dashboard_complete_btn,
                    dashboard_upload_btn: s.dashboard_upload_btn,
                    dashboard_locked_text: s.dashboard_locked_text,
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
