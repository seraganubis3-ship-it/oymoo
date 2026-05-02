import { getSettings } from '@/lib/settings'
import LoginClient from './LoginClient'

export default async function LoginPage() {
  const settings = await getSettings()
  return <LoginClient settings={settings} />
}
