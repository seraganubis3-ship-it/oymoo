'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Log {
  id: string; action: string; targetUserId: string | null; details: string | null; createdAt: string
  admin: { name: string; phone: string }
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (actionFilter) params.set('action', actionFilter)
    const res = await fetch(`/api/admin/logs?${params}`)
    const data = await res.json()
    setLogs(data.logs); setTotal(data.total); setPages(data.pages)
    setLoading(false)
  }, [page, actionFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const actionLabel: Record<string, string> = {
    update_user: 'تعديل مستخدمة', delete_user: 'حذف مستخدمة',
    block_user: 'حظر', unblock_user: 'رفع حظر',
    reset_sessions: 'إعادة ضبط جلسات', recalc_sessions: 'إعادة حساب مواعيد',
    complete_session: 'إتمام جلسة', reset_session: 'إعادة ضبط جلسة',
    upload_session_photo: 'رفع صورة جلسة', update_session: 'تعديل جلسة',
    change_setting: 'تغيير إعداد',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">سجل الأحداث</h1>
          <p className="text-muted text-sm">{total} حدث مسجّل</p>
        </div>
        <input value={actionFilter} onChange={e => setActionFilter(e.target.value)} placeholder="فلترة بنوع الإجراء..." id="log-filter"
          className="px-3 py-2 rounded-lg text-sm text-white w-64"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none' }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0D0D0D' }}>
                {['المشرف', 'الإجراء', 'التفاصيل', 'التاريخ'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-medium text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={4} className="text-center py-12 text-muted">جاري التحميل...</td></tr>
                : logs.map(log => (
                  <tr key={log.id} className="border-t hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#1A1A1A' }}>
                    <td className="px-4 py-3 text-sm text-white">{log.admin.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full text-gold" style={{ background: 'rgba(212,168,67,0.1)' }}>
                        {actionLabel[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted max-w-xs truncate">
                      {log.details ? (
                        (() => { try { const d = JSON.parse(log.details); return JSON.stringify(d).slice(0, 60) } catch { return log.details?.slice(0, 60) } })()
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                      {format(new Date(log.createdAt), 'd MMM yyyy — HH:mm', { locale: ar })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t" style={{ borderColor: '#1F1F1F' }}>
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => (
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
