'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getSettingNumber } from '@/lib/settings'

export default function AdminNewUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'الاسم مطلوب'
    if (!/^05\d{8}$/.test(form.phone)) e.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام'
    if (form.password.length < 8) e.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    if (form.password !== form.confirm) e.confirm = 'كلمات المرور غير متطابقة'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, password: form.password }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success('تم إنشاء المستخدمة بنجاح')
      router.push('/admin/users')
    } catch { toast.error('حدث خطأ') } finally { setLoading(false) }
  }

  const inputStyle = {
    background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF',
    outline: 'none', width: '100%', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem',
  }

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white/80" htmlFor={`field-${key}`}>{label}</label>
      <input id={`field-${key}`} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ ...inputStyle, borderColor: errors[key] ? '#EF4444' : '#2A2A2A' }}
        onFocus={e => { if (!errors[key]) e.currentTarget.style.borderColor = 'rgba(212,168,67,0.6)' }}
        onBlur={e => { if (!errors[key]) e.currentTarget.style.borderColor = '#2A2A2A' }} />
      {errors[key] && <p className="text-xs text-error">⚠ {errors[key]}</p>}
    </div>
  )

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">إنشاء مستخدمة جديدة</h1>
      <div className="rounded-2xl p-6 space-y-5" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'الاسم')}
          {field('phone', 'رقم الجوال', 'tel')}
          {field('password', 'كلمة المرور', 'password')}
          {field('confirm', 'تأكيد كلمة المرور', 'password')}
          <p className="text-xs text-muted">المستخدمة ستُكمل إعداد ملفها عند أول تسجيل دخول.</p>
          <button id="create-user-submit" type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 transition-all text-background"
            style={{ background: 'linear-gradient(135deg, #D4A843, #C49832)', boxShadow: '0 4px 16px rgba(212,168,67,0.25)' }}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدمة'}
          </button>
        </form>
      </div>
    </div>
  )
}
