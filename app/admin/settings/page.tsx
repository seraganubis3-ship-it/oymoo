'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

interface Setting {
  id: string; key: string; value: string; label: string; type: string; section: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [localValues, setLocalValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then((data: Setting[]) => {
      setSettings(data)
      setLocalValues(Object.fromEntries(data.map(s => [s.key, s.value])))
    })
  }, [])

  const sections = Array.from(new Set(settings.map(s => s.section)))

  const saveSection = async (section: string) => {
    setSaving(section)
    const sectionSettings = settings.filter(s => s.section === section)
    const updates = sectionSettings.map(s => ({ key: s.key, value: localValues[s.key] ?? s.value }))
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) toast.success('تم الحفظ ✓')
    else toast.error('فشل الحفظ')
    setSaving(null)
  }

  const renderField = (s: Setting) => {
    const val = localValues[s.key] ?? s.value
    const set = (v: string) => setLocalValues(prev => ({ ...prev, [s.key]: v }))
    const inputStyle = { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF', outline: 'none', padding: '0.6rem 0.875rem', borderRadius: 8, fontSize: '0.875rem', width: '100%' }

    if (s.type === 'toggle') {
      return (
        <label className="flex items-center gap-3 cursor-pointer" htmlFor={`setting-${s.key}`}>
          <div className="relative" onClick={() => set(val === 'true' ? 'false' : 'true')}>
            <div className="w-11 h-6 rounded-full transition-all" style={{ background: val === 'true' ? '#D4A843' : '#2A2A2A' }} />
            <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ right: val === 'true' ? '0.125rem' : 'auto', left: val === 'true' ? 'auto' : '0.125rem' }} />
          </div>
          <span className="text-sm text-muted">{val === 'true' ? 'مفعّل' : 'معطّل'}</span>
        </label>
      )
    }

    if (s.key === 'motivational_messages') {
      const lines = val.split('\n').filter(l => l.trim())
      return (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <input value={line} onChange={e => {
                const updated = [...lines]; updated[i] = e.target.value
                set(updated.join('\n'))
              }} style={{ ...inputStyle, flex: 1 }} id={`motivation-line-${i}`} />
              <button onClick={() => { const updated = lines.filter((_, j) => j !== i); set(updated.join('\n')) }}
                className="px-2 text-error hover:text-error/80">✕</button>
            </div>
          ))}
          <button id="add-motivation" onClick={() => set(val + '\nرسالة جديدة')}
            className="text-sm text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/10 transition-all">
            + إضافة رسالة
          </button>
        </div>
      )
    }

    if (s.type === 'textarea') {
      return <textarea value={val} onChange={e => set(e.target.value)} rows={3} id={`setting-${s.key}`} style={inputStyle} />
    }

    return (
      <input type={s.type === 'number' ? 'number' : 'text'} value={val} onChange={e => set(e.target.value)}
        id={`setting-${s.key}`} style={inputStyle}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.6)' }}
        onBlur={e => { e.currentTarget.style.borderColor = '#2A2A2A' }} />
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">إعدادات التطبيق</h1>
        <p className="text-muted text-sm mt-1">كل النصوص والإعدادات تُدار من هنا</p>
      </div>
      {sections.map(section => {
        const sectionSettings = settings.filter(s => s.section === section)
        return (
          <div key={section} className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#1F1F1F' }}>
              <h2 className="font-semibold text-white">{section}</h2>
              <button id={`save-section-${section}`} onClick={() => saveSection(section)} disabled={saving === section}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-background disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg, #D4A843, #C49832)' }}>
                <Save className="w-3.5 h-3.5" />
                {saving === section ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
            <div className="p-5 space-y-5">
              {sectionSettings.map(s => (
                <div key={s.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">{s.label}</label>
                  <p className="text-xs text-muted/60 font-mono">{s.key}</p>
                  {renderField(s)}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
