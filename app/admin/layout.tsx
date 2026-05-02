import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAdminFromCookie } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const auth = await getAdminFromCookie()
  if (!auth) redirect('/admin/login')

  const admin = await prisma.admin.findUnique({ where: { id: auth.adminId } })
  if (!admin) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar adminName={admin.name} adminRole={admin.role} adminId={admin.id} />
      <main className="flex-1 min-w-0 overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}
