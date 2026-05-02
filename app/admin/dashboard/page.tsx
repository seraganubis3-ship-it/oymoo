import { prisma } from '@/lib/prisma'
import { getSettingNumber } from '@/lib/settings'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import AdminDashboardCharts from './AdminDashboardCharts'

export default async function AdminDashboardPage() {
  const [totalUsers, totalCompleted, totalSessions, recentSessions] = await Promise.all([
    prisma.user.count(),
    prisma.session.count({ where: { completedAt: { not: null } } }),
    prisma.session.count(),
    prisma.session.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      take: 15,
      include: { profile: { include: { user: { select: { name: true } } } } },
    }),
  ])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const todaySessions = await prisma.session.count({ where: { scheduledAt: { gte: today, lt: tomorrow } } })
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthActive = await prisma.user.count({ where: { profile: { sessions: { some: { completedAt: { gte: monthStart } } } } } })

  const stats = [
    { label: 'إجمالي المستخدمات', value: totalUsers, icon: '👥', color: '#D4A843' },
    { label: 'جلسات اليوم', value: todaySessions, icon: '📅', color: '#22C55E' },
    { label: 'نشطات هذا الشهر', value: monthActive, icon: '🌟', color: '#60A5FA' },
    { label: 'كل الجلسات المكتملة', value: totalCompleted, icon: '✅', color: '#A78BFA' },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
        <p className="text-muted text-sm mt-1">مرحباً بك في لوحة إدارة OYMO</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs px-2 py-0.5 rounded-full text-white/60" style={{ background: 'rgba(255,255,255,0.05)' }}>
                الكل
              </span>
            </div>
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-sm text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AdminDashboardCharts totalCompleted={totalCompleted} totalSessions={totalSessions} />

      {/* Recent activity */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: '#1F1F1F' }}>
          <h2 className="font-semibold text-white">آخر الجلسات المكتملة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0D0D0D' }}>
                {['المستخدمة', 'الجلسة', 'التاريخ', 'صورة'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-medium text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#1A1A1A' }}>
              {recentSessions.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-white">{s.profile.user.name}</td>
                  <td className="px-4 py-3 text-sm text-muted">الجلسة {s.sessionNumber}</td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {s.completedAt ? format(new Date(s.completedAt), 'd MMM yyyy', { locale: ar }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {s.photoUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={s.photoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      : <span className="text-muted text-xs">لا يوجد</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
