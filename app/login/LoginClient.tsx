'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface LoginPageProps {
  settings: Record<string, string>
}

const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^05\d{8}$/, 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginClient({ settings }: LoginPageProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'حدث خطأ')
        return
      }
      toast.success('تم تسجيل الدخول بنجاح')
      router.push(json.redirectTo)
    } catch {
      setServerError('حدث خطأ في الاتصال، حاولي مجدداً')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(212,168,67,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span
              className="text-4xl font-black"
              style={{
                background: 'linear-gradient(135deg, #D4A843, #F0C050)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {settings.app_name}
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 space-y-6"
          style={{
            background: '#111111',
            border: '1px solid #1F1F1F',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">
              {settings.login_title}
            </h1>
            <p className="text-muted text-sm">{settings.login_subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80" htmlFor="phone-input">
                {settings.login_phone_label}
              </label>
              <input
                id="phone-input"
                type="tel"
                dir="ltr"
                placeholder={settings.login_phone_placeholder}
                className="w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 placeholder:text-muted/50 oymo-input"
                style={{
                  background: '#1A1A1A',
                  border: errors.phone ? '1px solid #EF4444' : '1px solid #2A2A2A',
                  color: '#FFFFFF',
                  outline: 'none',
                }}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-error flex items-center gap-1">
                  <span>⚠</span> {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80" htmlFor="password-input">
                {settings.login_password_label}
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pe-12 rounded-lg text-sm transition-all duration-200 oymo-input"
                  style={{
                    background: '#1A1A1A',
                    border: errors.password ? '1px solid #EF4444' : '1px solid #2A2A2A',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                  {...register('password')}
                />
                <button
                  type="button"
                  id="toggle-password"
                  className="absolute inset-y-0 start-3 flex items-center text-muted hover:text-white transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error">⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="rounded-lg px-4 py-3 text-sm text-error flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <span>⚠</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  <span
                    className="w-4 h-4 rounded-full border-2 border-muted border-t-transparent animate-spin"
                  />
                  جاري الدخول...
                </span>
              ) : (
                settings.login_button_text
              )}
            </button>

            {/* Link to signup */}
            <div className="text-center mt-4">
              <Link href="/signup" className="text-sm text-muted hover:text-gold transition-colors">
                ليس لديك حساب؟ إنشاء حساب جديد
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
