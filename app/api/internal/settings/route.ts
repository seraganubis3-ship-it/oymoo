import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Internal endpoint called by middleware to check maintenance_mode
// Protected by a simple header check to prevent public access
export async function GET(req: NextRequest) {
  if (req.headers.get('x-internal') !== 'true') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const settings = await prisma.appSettings.findMany({
      where: { key: { in: ['maintenance_mode', 'allow_new_registrations'] } },
    })
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({}, { status: 200 })
  }
}
