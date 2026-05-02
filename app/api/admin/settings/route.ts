import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { getAllSettingsRaw, updateSetting, clearSettingsCache } from '@/lib/settings'
import { logAction } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const settings = await getAllSettingsRaw()
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const updates = await req.json() as { key: string; value: string }[]
  for (const { key, value } of updates) {
    const old = await prisma.appSettings.findUnique({ where: { key } })
    await updateSetting(key, value)
    await logAction(auth.adminId, 'change_setting', undefined, { key, oldValue: old?.value, newValue: value })
  }
  clearSettingsCache()
  return NextResponse.json({ success: true })
}
