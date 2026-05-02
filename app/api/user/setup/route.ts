import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth/user'
import { prisma } from '@/lib/prisma'
import { saveFile } from '@/lib/upload'
import { generateSessions } from '@/lib/sessions'

export async function POST(req: NextRequest) {
  try {
    const auth = await getUserFromCookie()
    if (!auth) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Check profile doesn't already exist
    const existing = await prisma.profile.findUnique({
      where: { userId: auth.userId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'الملف الشخصي موجود بالفعل' },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const firstSessionDate = formData.get('firstSessionDate') as string
    const preferredTime = formData.get('preferredTime') as string
    const photoFile = formData.get('photo') as File | null

    if (!firstSessionDate || !preferredTime) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 })
    }

    // Save before photo if provided
    let beforePhotoUrl: string | undefined
    if (photoFile && photoFile.size > 0) {
      beforePhotoUrl = await saveFile(photoFile, 'before')
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId: auth.userId,
        firstSessionDate: new Date(firstSessionDate),
        preferredTime,
        beforePhotoUrl,
      },
    })

    // Generate sessions
    await generateSessions(
      profile.id,
      new Date(firstSessionDate),
      preferredTime
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/user/setup]', err)
    return NextResponse.json({ error: 'حدث خطأ، حاولي مجدداً' }, { status: 500 })
  }
}
