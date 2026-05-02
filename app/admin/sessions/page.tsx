'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Download } from 'lucide-react'

interface Session {
  id: string
  sessionNumber: number
  scheduledAt: string
  completedAt: string | null
  photoUrl: string | null
  profile: {
    challengeFailedAt: string | null
    user: { id: string; name: string; phone: string }
  }
}

function getSessionStatus(session: Session): 'completed' | 'expired' | 'today' | 'upcoming' {
  if (session.completedAt) return 'completed'
  const now = new Date()
  const scheduled = new Date(session.scheduledAt)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate())
  if (sessionDay < todayStart) return 'expired'
  if (sessionDay.getTime() === todayStart.getTime()) return 'today'
  return 'upcoming'
}

const STATUS_CONFIG = {
  completed: { label: 'مكتملة', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  expired:   { label: 'خسارة تحدي', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  today:     { label: 'اليوم', color: '#D4A843', bg: 'rgba(212,168,67,0.1)' },
  upcoming:  { label: 'قادمة', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [filter, setFilter] = useState('all')
  const [range, setRange] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), filter, range })
    const res = await fetch(`/api/admin/sessions?${params}`)
    const data = await res.json()
    setSessions(data.sessions); setTotal(data.total); setPages(data.pages)
    setLoading(false)
  }, [page, filter, range])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">الجلسات</h1>
          <p className="text-muted text-sm">عرض {sessions.length} من {total}</p>
        </div>
        <a href="/api/admin/export/sessions" id="export-sessions"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-white transition-colors"
          style={{ border: '1px solid #2A2A2A' }}>
          <Download className="w-4 h-4" /> تصدير CSV
        </a>
      </div>

      {/* Filters — نطاق زمني */}
      <div className="flex flex-wrap gap-2">
        {[['all','الكل'],['today','اليوم'],['week','هذا الأسبوع'],['month','هذا الشهر']].map(([v,l]) => (
          <button key={v} onClick={() => { setRange(v); setPage(1) }} id={`range-${v}`}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{ background: range === v ? 'rgba(212,168,67,0.12)' : 'transparent', color: range === v ? '#D4A843' : '#9CA3AF', border: `1px solid ${range === v ? 'rgba(212,168,67,0.3)' : '#2A2A2A'}` }}>
            {l}
          </button>
        ))}
        <div className="w-px bg-card-border mx-1" />
        {/* فلاتر الحالة */}
        {[
          ['all','الكل'],
          ['completed','مكتملة'],
          ['expired','خسارة تحدي'],
          ['today','اليوم'],
          ['upcoming','قادمة'],
        ].map(([v,l]) => (
          <button key={v} onClick={() => { setFilter(v); setPage(1) }} id={`filter-${v}`}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: filter === v ? (v === 'expired' ? 'rgba(239,68,68,0.12)' : 'rgba(212,168,67,0.12)') : 'transparent',
              color: filter === v ? (v === 'expired' ? '#EF4444' : '#D4A843') : '#9CA3AF',
              border: `1px solid ${filter === v ? (v === 'expired' ? 'rgba(239,68,68,0.3)' : 'rgba(212,168,67,0.3)') : '#2A2A2A'}`,
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0D0D0D' }}>
                {['المستخدمة', 'الجلسة #', 'الموعد', 'الإتمام', 'الحالة', 'صورة'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-medium text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className="text-center py-12 text-muted">جاري التحميل...</td></tr>
                : sessions.length === 0
                  ? <tr><td colSpan={6} className="text-center py-12 text-muted">لا توجد نتائج</td></tr>
                  : sessions.map(s => {
                    const status = getSessionStatus(s)
                    const cfg = STATUS_CONFIG[status]
                    return (
                      <tr key={s.id} className="border-t hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#1A1A1A' }}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-white">{s.profile.user.name}</p>
                            {s.profile.challengeFailedAt && (
                              <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                                خسرت التحدي
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">الجلسة {s.sessionNumber}</td>
                        <td className="px-4 py-3 text-sm text-muted">{format(new Date(s.scheduledAt), 'd MMM yyyy', { locale: ar })}</td>
                        <td className="px-4 py-3 text-sm">
                          {s.completedAt
                            ? <span className="text-success">{format(new Date(s.completedAt), 'd MMM yyyy', { locale: ar })}</span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded-md"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.photoUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={s.photoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                            : <span className="text-muted text-xs">لا يوجد</span>}
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t" style={{ borderColor: '#1F1F1F' }}>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className="w-8 h-8 rounded-lg text-sm"
                style={{ background: page === i + 1 ? 'rgba(212,168,67,0.15)' : 'transparent', color: page === i + 1 ? '#D4A843' : '#9CA3AF' }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
