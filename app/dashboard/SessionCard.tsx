'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

interface SessionData {
  id: string
  sessionNumber: number
  scheduledAt: string
  completedAt: string | null
  photoUrl: string | null
  notes: string | null
}

interface SessionCardProps {
  session: SessionData
  totalSessions: number
  isCompleted: boolean
  isExpired: boolean
  isCurrent: boolean
  challengeFailed: boolean
  settings: {
    dashboard_complete_btn: string
    dashboard_upload_btn: string
    dashboard_locked_text: string
  }
}

export default function SessionCard({
  session,
  totalSessions,
  isCompleted,
  isExpired,
  isCurrent,
  challengeFailed,
  settings,
}: SessionCardProps) {
  const router = useRouter()
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const scheduledDate = new Date(session.scheduledAt)

  const handlePhotoUpload = async (file: File) => {
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch(`/api/user/session/${session.id}/complete`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'فشل الرفع')
      }
      toast.success('تم رفع الصورة ✅')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'فشل رفع الصورة')
    } finally {
      setUploadLoading(false)
    }
  }

  // ── COMPLETED ─────────────────────────────────────────────────────────────
  if (isCompleted) {
    return (
      <Link
        href={`/session/${session.id}`}
        id={`session-card-${session.id}`}
        className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(34,197,94,0.02))',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
          >
            {session.sessionNumber}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              الجلسة {session.sessionNumber} من {totalSessions}
            </p>
            {session.completedAt && (
              <p className="text-xs text-muted">
                أُكملت {format(new Date(session.completedAt), 'd MMM yyyy', { locale: ar })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.photoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={session.photoUrl}
              alt="صورة الجلسة"
              className="w-10 h-10 rounded-lg object-cover"
              style={{ border: '1px solid rgba(34,197,94,0.3)' }}
            />
          )}
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
      </Link>
    )
  }

  // ── EXPIRED (خسرت التحدي في هذه الجلسة) ──────────────────────────────────
  if (isExpired) {
    return (
      <div
        id={`session-card-${session.id}`}
        className="flex items-center justify-between p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.07), rgba(239,68,68,0.02))',
          border: '1px solid rgba(239,68,68,0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
          >
            {session.sessionNumber}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              الجلسة {session.sessionNumber} من {totalSessions}
            </p>
            <p className="text-xs" style={{ color: '#EF4444' }}>
              {format(scheduledDate, 'd MMMM yyyy', { locale: ar })} — انتهى الوقت
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
            خسارة
          </span>
          <XCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
        </div>
      </div>
    )
  }

  // ── CHALLENGE FAILED (خسر ولكن الجلسة لم تنتهِ بعد) ──────────────────────
  // لو challengeFailed=true والجلسة قادمة → تظهر مقفولة بشكل خاص
  if (challengeFailed) {
    return (
      <div
        id={`session-card-${session.id}`}
        className="flex items-center justify-between p-4 rounded-xl opacity-40"
        style={{
          background: '#111111',
          border: '1px solid rgba(239,68,68,0.15)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-muted"
            style={{ background: '#1A1A1A' }}
          >
            {session.sessionNumber}
          </div>
          <div>
            <p className="text-sm text-muted">الجلسة {session.sessionNumber}</p>
            <p className="text-xs text-muted/60">
              {format(scheduledDate, 'd MMMM yyyy', { locale: ar })}
            </p>
          </div>
        </div>
        <Lock className="w-4 h-4 text-muted/40" />
      </div>
    )
  }

  // ── CURRENT ───────────────────────────────────────────────────────────────
  if (isCurrent) {
    // الجلسة تبدأ من بداية يومها بالتوقيت السعودي
    // isUnlocked هنا تعني: وصلنا ليوم الجلسة أو تجاوزناه (يُحسب في الـ Server)
    // بما أن isCurrent = true يعني غير منتهية وليست قادمة → هي اليوم أو الأيام السابقة بدون خسارة
    const today = new Date()
    const sessionDay = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate())
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const isUnlocked = todayDay >= sessionDay

    return (
      <div
        id={`session-card-${session.id}`}
        className="p-4 rounded-xl space-y-3"
        style={{
          background: 'linear-gradient(135deg, rgba(212,168,67,0.09), rgba(212,168,67,0.02))',
          border: '1px solid rgba(212,168,67,0.35)',
          animation: 'pulseGold 2.5s ease-in-out infinite',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843' }}
            >
              {session.sessionNumber}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                الجلسة {session.sessionNumber} من {totalSessions}
              </p>
              <p className="text-xs text-muted">
                {format(scheduledDate, 'EEEE، d MMMM yyyy — hh:mm a', { locale: ar })}
              </p>
            </div>
          </div>
          <Clock className="w-5 h-5 text-gold" />
        </div>
        <div className="flex gap-2">
          <button
            id={`upload-photo-${session.id}`}
            onClick={() => fileRef.current?.click()}
            disabled={uploadLoading || !isUnlocked}
            className="flex-1 py-3 px-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 text-background"
            style={{
              background: isUnlocked ? 'linear-gradient(135deg, #D4A843, #C49832)' : '#2A2A2A',
              boxShadow: isUnlocked ? '0 2px 8px rgba(212,168,67,0.3)' : 'none',
              color: isUnlocked ? '#0A0A0A' : '#9CA3AF',
            }}
          >
            {uploadLoading ? '⏳ جاري الرفع...' : (isUnlocked ? 'رفع صورة وإكمال الجلسة 📸' : 'لم يحن الموعد بعد')}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handlePhotoUpload(f)
          }}
        />
      </div>
    )
  }

  // ── UPCOMING ──────────────────────────────────────────────────────────────
  return (
    <div
      id={`session-card-${session.id}`}
      className="flex items-center justify-between p-4 rounded-xl opacity-50"
      style={{
        background: '#111111',
        border: '1px solid #1F1F1F',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-muted"
          style={{ background: '#1A1A1A' }}
        >
          {session.sessionNumber}
        </div>
        <div>
          <p className="text-sm text-muted">الجلسة {session.sessionNumber}</p>
          <p className="text-xs text-muted/60">
            {format(scheduledDate, 'd MMMM yyyy', { locale: ar })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted/60">
        <Lock className="w-4 h-4" />
        <span className="text-xs">{settings.dashboard_locked_text}</span>
      </div>
    </div>
  )
}
