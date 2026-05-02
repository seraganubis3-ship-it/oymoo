import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth/user'
import { prisma } from '@/lib/prisma'
import { saveFile, deleteFile } from '@/lib/upload'
import { getSaudiTodayStartUTC, getSessionDayStartUTC } from '@/lib/challenge'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getUserFromCookie()
    if (!auth) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Verify session belongs to user and include profile for challenge check
    const session = await prisma.session.findFirst({
      where: {
        id: params.id,
        profile: { userId: auth.userId },
      },
    })
    if (!session) {
      return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 })
    }

    // Get profile to check challenge status
    const profile = await prisma.profile.findUnique({
      where: { id: session.profileId },
      select: { challengeFailedAt: true },
    })

    // ── حماية 1: هل خسر التحدي مسبقاً؟ ──────────────────────────────────────
    if (profile?.challengeFailedAt) {
      return NextResponse.json(
        { error: 'خسرت التحدي، لا يمكن رفع أي صورة' },
        { status: 403 }
      )
    }

    // ── حماية 2: هل انتهى يوم الجلسة بالتوقيت السعودي؟ ──────────────────────
    const saudiTodayStart = getSaudiTodayStartUTC()
    const sessionDayStart = getSessionDayStartUTC(new Date(session.scheduledAt))
    if (sessionDayStart < saudiTodayStart) {
      return NextResponse.json(
        { error: 'انتهى وقت هذه الجلسة لا يمكن رفع الصورة' },
        { status: 400 }
      )
    }

    let photoUrl = session.photoUrl

    // Handle photo upload (multipart)
    const contentType = req.headers.get('content-type') ?? ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const photoFile = formData.get('photo') as File | null
      if (photoFile && photoFile.size > 0) {
        // Delete old photo if exists
        await deleteFile(session.photoUrl)
        photoUrl = await saveFile(photoFile, 'sessions')
      }
    }

    if (!photoUrl) {
      return NextResponse.json({ error: 'يجب رفع صورة لإكمال الجلسة' }, { status: 400 })
    }

    const updated = await prisma.session.update({
      where: { id: params.id },
      data: {
        completedAt: new Date(),
        photoUrl,
      },
    })

    return NextResponse.json({ success: true, session: updated })
  } catch (err) {
    console.error('[/api/user/session/complete]', err)
    return NextResponse.json({ error: 'حدث خطأ، حاولي مجدداً' }, { status: 500 })
  }
}
