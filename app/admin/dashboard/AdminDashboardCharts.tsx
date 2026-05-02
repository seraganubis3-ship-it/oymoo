'use client'

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useEffect, useState } from 'react'

interface Props {
  totalCompleted: number
  totalSessions: number
}

export default function AdminDashboardCharts({ totalCompleted, totalSessions }: Props) {
  const [stats, setStats] = useState<{
    usersPerMonth: { month: string; count: number }[]
    sessionsPerMonth: { month: string; count: number }[]
  } | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d))
  }, [])

  const donutData = [
    { name: 'مكتملة', value: totalCompleted },
    { name: 'متبقية', value: Math.max(0, totalSessions - totalCompleted) },
  ]

  const tooltipStyle = { background: '#111111', border: '1px solid #1F1F1F', color: '#FFFFFF', fontFamily: 'Cairo' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Line chart - new users */}
      <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <h3 className="font-semibold text-white mb-4">مستخدمات جدد (آخر 6 أشهر)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats?.usersPerMonth ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#D4A843" strokeWidth={2} dot={{ fill: '#D4A843', r: 4 }} name="مستخدمات" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Donut - completed vs remaining */}
      <div className="rounded-2xl p-5" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <h3 className="font-semibold text-white mb-4">الجلسات المكتملة</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
              <Cell fill="#D4A843" />
              <Cell fill="#1F1F1F" />
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend formatter={(v) => <span style={{ color: '#9CA3AF', fontSize: 12 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart - completed sessions per month */}
      <div className="lg:col-span-3 rounded-2xl p-5" style={{ background: '#111111', border: '1px solid #1F1F1F' }}>
        <h3 className="font-semibold text-white mb-4">جلسات مكتملة شهريًا (آخر 6 أشهر)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats?.sessionsPerMonth ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#D4A843" radius={[4, 4, 0, 0]} name="جلسات" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
