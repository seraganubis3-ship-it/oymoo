'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Search, Download, Plus, Eye, Ban, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface User {
  id: string; name: string; phone: string; isBlocked: boolean
  createdAt: string; completed: number; total: number
  lastSession: string | null; hasProfile: boolean
  challengeFailedAt: string | null
}

export default function AdminUsersClient() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('createdAt_desc')
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search, filter, sort })
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users); setTotal(data.total); setPages(data.pages)
    setLoading(false)
  }, [page, search, filter, sort])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  const handleBlock = async (id: string, name: string, isBlocked: boolean) => {
    if (!confirm(`هل تريد ${isBlocked ? 'رفع حظر' : 'حظر'} ${name}؟`)) return
    await fetch(`/api/admin/users/${id}/block`, { method: 'POST' })
    toast.success(isBlocked ? 'تم رفع الحظر' : 'تم الحظر')
    fetchUsers()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`اكتب "حذف" لتأكيد حذف المستخدمة ${name}`)) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    toast.success('تم الحذف')
    fetchUsers()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">المستخدمات</h1>
          <p className="text-muted text-sm">عرض {users.length} من {total}</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/admin/export/users" id="export-users"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-white transition-colors"
            style={{ border: '1px solid #2A2A2A' }}>
            <Download className="w-4 h-4" /> تصدير CSV
          </a>
          <Link href="/admin/users/new" id="new-user"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-background transition-all"
            style={{ background: 'linear-gradient(135deg, #D4A843, #C49832)' }}>
            <Plus className="w-4 h-4" /> مستخدمة جديدة
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحثي باسم أو جوال..." id="search-users"
            className="w-full pr-9 pl-4 py-2.5 rounded-lg text-sm text-white"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none' }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} id="filter-users"
          className="px-3 py-2.5 rounded-lg text-sm text-white cursor-pointer"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none' }}>
          <option value="all">الكل</option>
          <option value="active">نشطات</option>
          <option value="blocked">محظورات</option>
          <option value="completed">أكملن الرحلة</option>
          <option value="challenge_failed">خسرن التحدي</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} id="sort-users"
          className="px-3 py-2.5 rounded-lg text-sm text-white cursor-pointer"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none' }}>
          <option value="createdAt_desc">تاريخ التسجيل ↓</option>
          <option value="name_asc">الاسم أ-ي</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0D0D0D' }}>
                {['الاسم', 'الجوال', 'تاريخ التسجيل', 'التقدم', 'آخر جلسة', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-medium text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted">جاري التحميل...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted">لا توجد نتائج</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: '#1A1A1A' }}>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      {u.challengeFailedAt && (
                        <span className="inline-flex text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                          💔 خسرت التحدي
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted" dir="ltr">{u.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {format(new Date(u.createdAt), 'd MMM yyyy', { locale: ar })}
                  </td>
                  <td className="px-4 py-3">
                    {u.hasProfile ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#2A2A2A' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${u.total > 0 ? (u.completed / u.total) * 100 : 0}%`,
                            background: u.challengeFailedAt ? '#EF4444' : '#D4A843',
                          }} />
                        </div>
                        <span className="text-xs text-muted">{u.completed}/{u.total}</span>
                      </div>
                    ) : <span className="text-xs text-muted">لم يكمل الإعداد</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {u.lastSession ? format(new Date(u.lastSession), 'd MMM', { locale: ar }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {u.challengeFailedAt ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                          خسرت التحدي
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isBlocked ? 'text-error bg-error/10' : 'text-success bg-success/10'}`}>
                          {u.isBlocked ? 'محظورة' : 'نشطة'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/users/${u.id}`} id={`view-user-${u.id}`} className="text-muted hover:text-gold transition-colors" title="عرض">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button id={`block-user-${u.id}`} onClick={() => handleBlock(u.id, u.name, u.isBlocked)}
                        className={`transition-colors ${u.isBlocked ? 'text-success hover:text-success/80' : 'text-error hover:text-error/80'}`} title={u.isBlocked ? 'رفع حظر' : 'حظر'}>
                        <Ban className="w-4 h-4" />
                      </button>
                      <button id={`delete-user-${u.id}`} onClick={() => handleDelete(u.id, u.name)}
                        className="text-muted hover:text-error transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t" style={{ borderColor: '#1F1F1F' }}>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className="w-8 h-8 rounded-lg text-sm transition-all"
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
