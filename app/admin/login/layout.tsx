// Admin login page has no sidebar — override the admin layout
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
