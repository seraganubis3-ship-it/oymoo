import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/user'
import { deleteFile } from '@/lib/upload'
import { logAction } from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { profile: { include: { sessions: { orderBy: { sessionNumber: 'asc' } } } } },
  })
  if (!user) return NextResponse.json({ error: 'المستخدمة غير موجودة' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { name, phone, password } = await req.json()
  const data: Record<string, string> = {}
  if (name) data.name = name
  if (phone) data.phone = phone
  if (password) data.password = await hashPassword(password)

  await prisma.user.update({ where: { id: params.id }, data })
  await logAction(auth.adminId, 'update_user', params.id, { fields: Object.keys(data) })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAdminFromCookie()
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  // Fetch user + all session photos + before photo before deletion
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { profile: { include: { sessions: { select: { photoUrl: true } } } } },
  })
  if (!user) return NextResponse.json({ error: 'غير موجودة' }, { status: 404 })

  // Delete all uploaded files first
  if (user.profile) {
    await deleteFile(user.profile.beforePhotoUrl)
    for (const session of user.profile.sessions) {
      await deleteFile(session.photoUrl)
    }
  }

  await prisma.user.delete({ where: { id: params.id } })
  await logAction(auth.adminId, 'delete_user', params.id, { name: user.name })
  return NextResponse.json({ success: true })
}
