import { Sparkles } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Sparkles className="w-8 h-8 text-gold animate-pulse" />
        <p className="text-muted text-sm animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  )
}
