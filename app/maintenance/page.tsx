import { getSetting } from '@/lib/settings'

export default async function MaintenancePage() {
  const appName = await getSetting('app_name')
  const message = await getSetting('maintenance_message')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <div className="text-6xl">🔧</div>
        <h1 className="text-3xl font-bold text-gold-gradient">{appName}</h1>
        <p className="text-muted text-lg leading-relaxed">{message}</p>
        <div className="w-16 h-1 bg-gold rounded-full mx-auto opacity-50" />
        <p className="text-muted text-sm">سنعود قريباً إن شاء الله</p>
      </div>
    </div>
  )
}
