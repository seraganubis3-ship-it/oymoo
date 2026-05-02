import { getSettings } from '@/lib/settings'
import SignupClient from './SignupClient'

export const metadata = {
  title: 'إنشاء حساب جديد',
}

export default async function SignupPage() {
  const settings = await getSettings()
  return <SignupClient settings={settings} />
}
