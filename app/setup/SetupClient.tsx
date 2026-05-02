'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface SetupClientProps {
  settings: Record<string, string>
}

const setupSchema = z.object({
  firstSessionDate: z.string().min(1, 'تاريخ الجلسة الأولى مطلوب'),
  preferredTime: z.string().min(1, 'الوقت المفضل مطلوب'),
})

type SetupForm = z.infer<typeof setupSchema>

export default function SetupClient({ settings }: SetupClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: { preferredTime: '10:00' },
  })

  const handleFileSelect = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('يُقبل فقط JPG, PNG, WEBP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يتجاوز 5MB')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: SetupForm) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('firstSessionDate', data.firstSessionDate)
      formData.append('preferredTime', data.preferredTime)
      if (photo) formData.append('photo', photo)

      const res = await fetch('/api/user/setup', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'حدث خطأ')
        return
      }
      toast.success('تم إعداد ملفك بنجاح! 🎉')
      router.push('/dashboard')
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(212,168,67,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">{settings.setup_title}</h1>
          <p className="text-muted text-sm mt-1">{settings.setup_subtitle}</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{
            background: '#111111',
            border: '1px solid #1F1F1F',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">


            {/* First session date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80" htmlFor="date-input">
                تاريخ الجلسة الأولى
              </label>
              <input
                id="date-input"
                type="date"
                className="w-full px-4 py-3 rounded-lg text-sm text-white oymo-input"
                style={{
                  background: '#1A1A1A',
                  border: errors.firstSessionDate ? '1px solid #EF4444' : '1px solid #2A2A2A',
                  outline: 'none',
                  colorScheme: 'dark',
                }}
                {...register('firstSessionDate')}
              />
              {errors.firstSessionDate && (
                <p className="text-xs text-error">⚠ {errors.firstSessionDate.message}</p>
              )}
            </div>

            {/* Preferred time */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80" htmlFor="time-input">
                الوقت المفضل
              </label>
              <input
                id="time-input"
                type="time"
                className="w-full px-4 py-3 rounded-lg text-sm text-white oymo-input"
                style={{
                  background: '#1A1A1A',
                  border: errors.preferredTime ? '1px solid #EF4444' : '1px solid #2A2A2A',
                  outline: 'none',
                  colorScheme: 'dark',
                }}
                {...register('preferredTime')}
              />
            </div>

            {/* Photo upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">
                صورة قبل البدء (اختياري)
              </label>
              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    id="remove-photo"
                    onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                    className="absolute top-2 left-2 p-1 rounded-full bg-black/60 hover:bg-error/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  id="photo-drop-zone"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    const f = e.dataTransfer.files[0]
                    if (f) handleFileSelect(f)
                  }}
                  className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    border: `2px dashed ${dragging ? 'rgba(212,168,67,0.6)' : '#2A2A2A'}`,
                    background: dragging ? 'rgba(212,168,67,0.04)' : '#1A1A1A',
                  }}
                >
                  <div className="p-3 rounded-full" style={{ background: 'rgba(212,168,67,0.1)' }}>
                    <ImageIcon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/70">اسحبي صورتك هنا</p>
                    <p className="text-xs text-muted mt-0.5">أو اضغطي للاختيار</p>
                    <p className="text-xs text-muted/60 mt-1">JPG, PNG, WEBP — حتى 5MB</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gold">
                    <Upload className="w-3 h-3" />
                    اختاري صورة
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileSelect(f)
                }}
              />
            </div>

            {/* Submit */}
            <button
              id="setup-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60"
              style={{
                background: loading
                  ? '#2A2A2A'
                  : 'linear-gradient(135deg, #D4A843 0%, #C49832 100%)',
                color: loading ? '#9CA3AF' : '#0A0A0A',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(212,168,67,0.25)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-muted border-t-transparent animate-spin" />
                  جاري الإعداد...
                </span>
              ) : (
                settings.setup_button_text
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
