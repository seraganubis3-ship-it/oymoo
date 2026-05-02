import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth/user'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getUserFromCookie()
    if (!auth) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Verify session belongs to user
    const session = await prisma.session.findFirst({
      where: {
        id: params.id,
        profile: { userId: auth.userId },
      },
    })
    if (!session) {
      return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 })
    }

    const { notes } = await req.json()

    await prisma.session.update({
      where: { id: params.id },
      data: { notes: notes ?? '' },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/user/session/notes]', err)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
