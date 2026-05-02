import Link from 'next/link'
import { getSettings, getSettingBool, getSettingNumber } from '@/lib/settings'

export default async function LandingPage() {
  const s = await getSettings()
  const maintenanceMode = await getSettingBool('maintenance_mode')
  const totalSessions = await getSettingNumber('total_sessions')

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden px-4">
      {/* Radial gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(212,168,67,0.13) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,168,67,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm w-full animate-slide-up">
        {/* Sparkle icon */}
        <div className="relative">
          <span
            className="text-5xl select-none"
            style={{
              filter: 'drop-shadow(0 0 16px rgba(212,168,67,0.6))',
              animation: 'spin 6s linear infinite',
              display: 'inline-block',
            }}
          >
            ✦
          </span>
        </div>

        {/* App name */}
        <div className="space-y-1">
          <h1
            className="text-7xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #D4A843 0%, #F0C050 50%, #C49832 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {s.app_name}
          </h1>
          <p className="text-xs tracking-[0.35em] text-muted uppercase font-light">
            LASER TRACKER
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />
          <span className="text-gold opacity-40 text-xs">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-card-border to-transparent" />
        </div>

        {/* Tagline */}
        <p className="text-muted text-base leading-relaxed font-medium">
          {s.app_tagline}
        </p>

        {/* Sessions count */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className="text-2xl font-black"
            style={{
              background: 'linear-gradient(135deg, #D4A843, #F0C050)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {totalSessions}
          </span>
          <span className="text-muted">{s.landing_sessions_text}</span>
        </div>

        {/* CTA / Maintenance */}
        {maintenanceMode ? (
          <div className="w-full p-4 rounded-xl border border-card-border bg-card text-muted text-sm text-center">
            {s.maintenance_message}
          </div>
        ) : (
          <Link
            href="/login"
            id="cta-button"
            className="w-full max-w-sm flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-200 text-background hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #D4A843 0%, #C49832 100%)',
              boxShadow: '0 0 24px rgba(212,168,67,0.3), 0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            {s.landing_cta_button}
          </Link>
        )}

        {/* SFDA badge */}
        <div className="flex items-center gap-2 text-xs text-muted">
          <div
            className="w-3 h-3 rounded-sm border border-gold flex items-center justify-center"
            style={{ borderColor: 'rgba(212,168,67,0.5)' }}
          >
            <div className="w-1.5 h-1.5 rounded-sm bg-gold opacity-70" />
          </div>
          <span>{s.app_badge_text}</span>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, #0A0A0A, transparent)',
        }}
      />
    </main>
  )
}
