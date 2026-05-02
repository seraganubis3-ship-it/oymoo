import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSettingNumber } from '@/lib/settings'

/**
 * POST /api/internal/cleanup
 * يحذف الحسابات التي خسرت التحدي وتجاوزت مدة الانتظار
 * محمي بـ header: x-internal: true
 */
export async function POST(req: NextRequest) {
  if (req.headers.get('x-internal') !== 'true') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const deleteDays = await getSettingNumber('challenge_failed_delete_days')
    if (!deleteDays || deleteDays <= 0) {
      return NextResponse.json({ deleted: 0, skipped: 'delete_days=0' })
    }

    // حساب وقت القطع: الحسابات التي خسرت قبل أكثر من deleteDays يوم
    const cutoff = new Date(Date.now() - deleteDays * 24 * 60 * 60 * 1000)

    const result = await prisma.user.deleteMany({
      where: {
        profile: {
          is: {
            challengeFailedAt: {
              not: null,
              lt: cutoff,
            },
          },
        },
      },
    })

    console.log(`[cleanup] Deleted ${result.count} expired challenge accounts`)
    return NextResponse.json({ deleted: result.count })
  } catch (err) {
    console.error('[cleanup] Error:', err)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
