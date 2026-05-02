'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'بيانات غير صحيحة'); return }
      toast.success('مرحباً بك في لوحة التحكم')
      router.push('/admin/dashboard')
    } catch { setError('حدث خطأ في الاتصال') } finally { setLoading(false) }
  }

  const inputStyle = {
    background: '#1A1A1A', border: '1px solid #2A2A2A',
    color: '#FFFFFF', outline: 'none', width: '100%',
    padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem',
    transition: 'border-color 0.2s',
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(212,168,67,0.07) 0%, transparent 70%)' }} />
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-3xl font-black" style={{ background: 'linear-gradient(135deg, #D4A843, #F0C050)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>OYMO</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-2">لوحة التحكم</h1>
          <p className="text-muted text-sm">أدخل بياناتك للمتابعة</p>
        </div>
        <div className="rounded-2xl p-7 space-y-5" style={{ background: '#111111', border: '1px solid #1F1F1F', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80" htmlFor="admin-phone">رقم الجوال</label>
              <input id="admin-phone" type="tel" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="05XXXXXXXX" style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.6)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#2A2A2A' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80" htmlFor="admin-password">كلمة المرور</label>
              <input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.6)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#2A2A2A' }} />
            </div>
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-error flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠ {error}
              </div>
            )}
            <button id="admin-login-submit" type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 transition-all duration-200 text-background"
              style={{ background: loading ? '#2A2A2A' : 'linear-gradient(135deg, #D4A843, #C49832)', color: loading ? '#9CA3AF' : '#0A0A0A', boxShadow: loading ? 'none' : '0 4px 16px rgba(212,168,67,0.25)' }}>
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
