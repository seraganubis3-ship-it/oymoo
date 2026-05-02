'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface Admin { id: string; name: string; phone: string; role: string; createdAt: string }

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'admin' })
  const [loading, setLoading] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<string>('')

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    const res = await fetch('/api/admin/admins')
    if (res.ok) setAdmins(await res.json())
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error); setLoading(false); return }
    toast.success('تم إضافة المشرف')
    setForm({ name: '', phone: '', password: '', role: 'admin' })
    fetchAdmins()
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`حذف ${name}؟`)) return
    const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error); return }
    toast.success('تم الحذف'); fetchAdmins()
  }

  const inputStyle = { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF', outline: 'none', width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8, fontSize: '0.875rem' }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-white">المشرفون</h1>

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#0D0D0D' }}>
              {['الاسم', 'رقم الجوال', 'الدور', 'التاريخ', ''].map(h => (
                <th key={h} className="px-4 py-3 text-right text-xs font-medium text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} className="border-t hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#1A1A1A' }}>
                <td className="px-4 py-3 text-sm text-white">{a.name}</td>
                <td className="px-4 py-3 text-sm text-muted" dir="ltr">{a.phone}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,0.1)', color: '#D4A843' }}>
                    {a.role === 'super_admin' ? 'مشرف رئيسي' : 'مشرف'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted">{new Date(a.createdAt).toLocaleDateString('ar-SA')}</td>
                <td className="px-4 py-3">
                  <button id={`delete-admin-${a.id}`} onClick={() => handleDelete(a.id, a.name)} className="text-muted hover:text-error transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add admin form */}
      <div className="rounded-2xl p-5 space-y-4 max-w-md" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <h2 className="font-semibold text-white">إضافة مشرف جديد</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input placeholder="الاسم" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} id="admin-name" required />
          <input placeholder="رقم الجوال" type="tel" dir="ltr" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} id="admin-phone-new" required />
          <input placeholder="كلمة المرور" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} id="admin-password-new" required />
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle} id="admin-role">
            <option value="admin">مشرف</option>
            <option value="super_admin">مشرف رئيسي</option>
          </select>
          <button id="add-admin-submit" type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-background disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #D4A843, #C49832)' }}>
            {loading ? 'جاري الإضافة...' : 'إضافة المشرف'}
          </button>
        </form>
      </div>
    </div>
  )
}
