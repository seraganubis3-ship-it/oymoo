'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CheckCircle, Clock, Lock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Session {
  id: string; sessionNumber: number; scheduledAt: string
  completedAt: string | null; photoUrl: string | null; notes: string | null
}
interface Profile {
  id: string; firstSessionDate: string; preferredTime: string; beforePhotoUrl: string | null
  sessions: Session[]
}
interface User {
  id: string; name: string; phone: string; isBlocked: boolean; createdAt: string
  profile: Profile | null
}

interface Props { user: User; totalSessions: number; adminRole: string }

export default function AdminUserDetailClient({ user, totalSessions, adminRole }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'sessions'>('profile')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [editName, setEditName] = useState(user.name)
  const [editPhone, setEditPhone] = useState(user.phone)
  const [editPassword, setEditPassword] = useState('')

  const sessions = user.profile?.sessions ?? []
  const completed = sessions.filter(s => s.completedAt).length
  const nextSession = sessions.find(s => !s.completedAt)

  const save = async () => {
    const body: Record<string, string> = {}
    if (editName !== user.name) body.name = editName
    if (editPhone !== user.phone) body.phone = editPhone
    if (editPassword) body.password = editPassword
    if (!Object.keys(body).length) { toast.info('لا تغييرات'); return }
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) { toast.error('فشل التحديث'); return }
    toast.success('تم التحديث'); router.refresh()
  }

  const toggleBlock = async () => {
    await fetch(`/api/admin/users/${user.id}/block`, { method: 'POST' })
    toast.success(user.isBlocked ? 'تم رفع الحظر' : 'تم الحظر'); router.refresh()
  }

  const resetSessions = async () => {
    if (!confirm(`هل تريد إعادة ضبط كل جلسات ${user.name}؟`)) return
    const res = await fetch(`/api/admin/users/${user.id}/reset-sessions`, { method: 'POST' })
    if (!res.ok) { toast.error('فشل العملية'); return }
    toast.success('تم إعادة ضبط الجلسات'); router.refresh()
  }

  const completeSession = async (sessionId: string) => {
    await fetch(`/api/admin/sessions/${sessionId}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completedAt: new Date() }) })
    toast.success('تم تمييز الجلسة كمكتملة'); setSelectedSession(null); router.refresh()
  }

  const resetSession = async (sessionId: string) => {
    await fetch(`/api/admin/sessions/${sessionId}/reset`, { method: 'POST' })
    toast.success('تم إعادة ضبط الجلسة'); setSelectedSession(null); router.refresh()
  }

  const inputStyle = { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF', outline: 'none', width: '100%', padding: '0.6rem 0.875rem', borderRadius: 8, fontSize: '0.875rem' }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-muted hover:text-gold transition-colors"><ChevronRight className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-white">{user.name}</h1>
          <p className="text-muted text-sm" dir="ltr">{user.phone}</p>
        </div>
        <span className={`mr-auto text-xs px-2 py-0.5 rounded-full ${user.isBlocked ? 'text-error bg-error/10' : 'text-success bg-success/10'}`}>
          {user.isBlocked ? 'محظورة' : 'نشطة'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: '#1F1F1F' }}>
        {(['profile', 'sessions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
            style={{ color: tab === t ? '#D4A843' : '#9CA3AF', borderColor: tab === t ? '#D4A843' : 'transparent' }}>
            {t === 'profile' ? 'الملف الشخصي' : 'الجلسات'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4 max-w-lg">
          <div className="rounded-2xl p-5 space-y-4" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
            <h2 className="font-semibold text-white">تعديل البيانات</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-muted">الاسم</label><input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} /></div>
              <div><label className="text-xs text-muted">الجوال</label><input value={editPhone} onChange={e => setEditPhone(e.target.value)} dir="ltr" style={inputStyle} /></div>
              <div><label className="text-xs text-muted">كلمة مرور جديدة (اختياري)</label><input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} style={inputStyle} /></div>
            </div>
            <button id="save-user" onClick={save} className="px-4 py-2 rounded-lg text-sm font-semibold text-background" style={{ background: 'linear-gradient(135deg, #D4A843, #C49832)' }}>حفظ التغييرات</button>
          </div>
          <div className="flex gap-2">
            <button id="toggle-block" onClick={toggleBlock} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${user.isBlocked ? 'text-success border border-success/30 hover:bg-success/10' : 'text-error border border-error/30 hover:bg-error/10'}`}>
              {user.isBlocked ? 'رفع الحظر' : 'حظر المستخدمة'}
            </button>
          </div>
          {user.profile?.beforePhotoUrl && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1F1F1F' }}>
              <p className="px-4 py-3 text-sm font-medium text-white border-b" style={{ borderColor: '#1F1F1F', background: '#111111' }}>صورة قبل البدء</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.profile.beforePhotoUrl} alt="قبل" className="w-full object-cover" style={{ maxHeight: 250 }} />
            </div>
          )}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-muted text-sm">{completed} / {totalSessions} جلسة مكتملة</p>
            {adminRole === 'super_admin' && (
              <button id="reset-all-sessions" onClick={resetSessions} className="text-xs text-error border border-error/30 px-3 py-1.5 rounded-lg hover:bg-error/10 transition-all">
                إعادة ضبط كل الجلسات
              </button>
            )}
          </div>

          {/* Sessions grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
            {Array.from({ length: totalSessions }, (_, i) => {
              const session = sessions[i]
              const isCompleted = !!session?.completedAt
              const isCurrent = session?.id === nextSession?.id
              return (
                <button key={i} id={`session-square-${i + 1}`}
                  onClick={() => session && setSelectedSession(session)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: isCompleted ? 'rgba(34,197,94,0.12)' : isCurrent ? 'rgba(212,168,67,0.12)' : '#1A1A1A',
                    border: isCompleted ? '1px solid rgba(34,197,94,0.3)' : isCurrent ? '1px solid rgba(212,168,67,0.4)' : '1px solid #2A2A2A',
                    color: isCompleted ? '#22C55E' : isCurrent ? '#D4A843' : '#4B5563',
                    animation: isCurrent ? 'pulseGold 2s ease-in-out infinite' : 'none',
                  }}>
                  {i + 1}
                  {isCompleted && <CheckCircle className="w-3 h-3 mt-0.5" />}
                  {!session && <Lock className="w-3 h-3 mt-0.5 opacity-40" />}
                </button>
              )
            })}
          </div>

          {/* Session detail modal */}
          {selectedSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
              onClick={() => setSelectedSession(null)}>
              <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: '#111111', border: '1px solid #1F1F1F' }}
                onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-white text-lg">الجلسة {selectedSession.sessionNumber}</h3>
                <p className="text-muted text-sm">
                  الموعد المجدول: <span dir="ltr">{format(new Date(selectedSession.scheduledAt), 'dd MMM yyyy — hh:mm a', { locale: ar })}</span>
                </p>
                <div className="text-sm space-y-1">
                  {selectedSession.completedAt ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-success font-semibold">مكتملة ✓</span>
                      <span className="text-xs text-muted">
                        تم الإكمال في: <span dir="ltr">{format(new Date(selectedSession.completedAt), 'dd MMM yyyy — hh:mm a', { locale: ar })}</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-gold font-semibold">قادمة</span>
                  )}
                </div>
                {selectedSession.photoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={selectedSession.photoUrl} alt="صورة" className="w-full rounded-xl object-cover" style={{ maxHeight: 200 }} />
                )}
                {selectedSession.notes && <p className="text-muted text-sm">{selectedSession.notes}</p>}
                <div className="flex gap-2 pt-2">
                  {!selectedSession.completedAt
                    ? <button id={`admin-complete-${selectedSession.id}`} onClick={() => completeSession(selectedSession.id)} className="flex-1 py-2 rounded-lg text-sm font-semibold text-background" style={{ background: 'linear-gradient(135deg, #D4A843, #C49832)' }}>تمييز كمكتملة</button>
                    : <button id={`admin-reset-${selectedSession.id}`} onClick={() => resetSession(selectedSession.id)} className="flex-1 py-2 rounded-lg text-sm font-semibold text-error border border-error/30 hover:bg-error/10">إعادة ضبط</button>}
                  <button onClick={() => setSelectedSession(null)} className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white border" style={{ borderColor: '#2A2A2A' }}>إغلاق</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
