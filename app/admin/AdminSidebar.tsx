'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Calendar, Settings, Shield, FileText,
  LogOut, ChevronLeft, Menu, X, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

const links = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { href: '/admin/users',     icon: Users,           label: 'المستخدمات' },
  { href: '/admin/sessions',  icon: Calendar,        label: 'الجلسات' },
  { href: '/admin/settings',  icon: Settings,        label: 'إعدادات التطبيق' },
  { href: '/admin/admins',    icon: Shield,          label: 'المشرفون' },
  { href: '/admin/logs',      icon: FileText,        label: 'سجل الأحداث' },
]

interface Props {
  adminName: string
  adminRole: string
  adminId: string
}

export default function AdminSidebar({ adminName, adminRole }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    toast.success('تم تسجيل الخروج')
    router.push('/admin/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A0A0A] border-l border-[#1F1F1F] text-white">
      {/* Header & Logo */}
      <div className="flex items-center gap-3 px-6 py-7 border-b border-[#1F1F1F]">
        <Sparkles className="w-6 h-6 text-gold shrink-0" />
        {(!collapsed || mobileOpen) && (
          <span className="font-black text-xl" style={{
            background: 'linear-gradient(135deg, #D4A843, #F0C050)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            OYMO ADMIN
          </span>
        )}
      </div>

      {/* Admin Info */}
      {(!collapsed || mobileOpen) && (
        <div className="px-6 py-5 border-b border-[#1F1F1F] bg-[#0F0F0F]">
          <p className="text-base font-bold text-white truncate">{adminName}</p>
          <span className="text-xs px-2.5 py-1 rounded-md mt-2 inline-block font-medium"
            style={{ background: 'rgba(212,168,67,0.1)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)' }}>
            {adminRole === 'super_admin' ? 'مدير النظام' : 'مشرف'}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${href.split('/').pop()}`}
              className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative group"
              style={{
                background: active ? 'linear-gradient(90deg, rgba(212,168,67,0.15) 0%, transparent 100%)' : 'transparent',
                color: active ? '#D4A843' : '#A1A1AA',
              }}
              title={collapsed && !mobileOpen ? label : undefined}
            >
              {active && (
                <div className="absolute right-0 top-0 bottom-0 w-1 rounded-l-full" style={{ background: '#D4A843' }} />
              )}
              <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-gold' : 'text-zinc-500 group-hover:text-gold'}`} />
              {(!collapsed || mobileOpen) && <span className="font-semibold text-sm tracking-wide">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#1F1F1F]">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-[#1A1A1A] hover:bg-error/10 hover:text-error text-zinc-400 transition-all duration-300"
          title={(collapsed && !mobileOpen) ? 'تسجيل الخروج' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!collapsed || mobileOpen) && <span className="font-bold text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-[#1F1F1F] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold shrink-0" />
          <span className="font-black text-lg" style={{
            background: 'linear-gradient(135deg, #D4A843, #F0C050)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            OYMO
          </span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-gold">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] h-full bg-[#0A0A0A] shadow-2xl flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute left-4 top-5 p-1 text-zinc-400 hover:text-white bg-[#1F1F1F] rounded-full">
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex relative flex-col shrink-0 transition-all duration-300 z-30"
        style={{
          width: collapsed ? 80 : 280,
          minHeight: '100vh',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -left-4 top-8 z-50 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300"
          style={{ background: '#1F1F1F', border: '1px solid #333', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          {collapsed ? <ChevronLeft className="w-4 h-4 rotate-180" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {sidebarContent}
      </aside>
    </>
  )
}
