'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Image as ImageIcon } from 'lucide-react'

interface Props {
  session: {
    id: string
    sessionNumber: number
    scheduledAt: string
    completedAt: string | null
    photoUrl: string | null
    notes: string | null
  }
  beforePhotoUrl: string | null | undefined
  isCurrentSession: boolean
  settings: { dashboard_complete_btn: string; dashboard_upload_btn: string }
}

export default function SessionDetailClient({ session, beforePhotoUrl, isCurrentSession, settings }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState(session.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const saveNotes = async () => {
    setSaving(true)
    try {
      await fetch(`/api/user/session/${session.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
    } catch { /* silent */ } finally { setSaving(false) }
  }



  const handlePhoto = async (file: File) => {
    setUploadLoading(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await fetch(`/api/user/session/${session.id}/complete`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      toast.success('تم رفع الصورة ✅')
      router.refresh()
    } catch { toast.error('فشل رفع الصورة') } finally { setUploadLoading(false) }
  }

  return (
    <div className="space-y-5">
      {/* Photo section */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <h2 className="font-semibold text-white">صورة الجلسة</h2>
        {session.photoUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={session.photoUrl} alt="صورة الجلسة" className="w-full rounded-xl object-cover" style={{ maxHeight: 300 }} />
            <button id="change-photo" onClick={() => fileRef.current?.click()} className="text-sm text-gold hover:text-gold-hover transition-colors">
              تغيير الصورة
            </button>
          </div>
        ) : (
          <button
            id="upload-session-photo"
            onClick={() => fileRef.current?.click()}
            disabled={uploadLoading}
            className="w-full flex flex-col items-center gap-3 py-8 rounded-xl transition-all duration-200 disabled:opacity-50"
            style={{ border: '2px dashed #2A2A2A', background: '#1A1A1A' }}
          >
            <div className="p-3 rounded-full" style={{ background: 'rgba(212,168,67,0.1)' }}>
              <ImageIcon className="w-6 h-6 text-gold" />
            </div>
            <span className="text-sm text-muted">{uploadLoading ? 'جاري الرفع...' : 'رفع صورة الجلسة (إكمال الجلسة)'}</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f) }} />
      </div>

      {/* Before/After comparison */}
      {beforePhotoUrl && session.photoUrl && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
          <h2 className="font-semibold text-white">مقارنة قبل/بعد</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted text-center">قبل</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforePhotoUrl} alt="قبل" className="w-full rounded-xl object-cover" style={{ height: 180 }} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gold text-center">بعد</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={session.photoUrl} alt="بعد" className="w-full rounded-xl object-cover" style={{ height: 180 }} />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">ملاحظاتي</h2>
          {saving && <span className="text-xs text-muted">جاري الحفظ...</span>}
        </div>
        <textarea
          id="session-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={4}
          placeholder="اكتبي ملاحظاتك عن هذه الجلسة..."
          className="w-full px-4 py-3 rounded-lg text-sm text-white resize-none"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.5)' }}
          onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#2A2A2A' }}
        />
      </div>


    </div>
  )
}
