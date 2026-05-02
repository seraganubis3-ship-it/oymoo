'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }
  return (
    <button
      id="logout-button"
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-error transition-colors px-3 py-2 rounded-lg hover:bg-error/10"
    >
      <LogOut className="w-3.5 h-3.5" />
      خروج
    </button>
  )
}
