import { prisma } from '@/lib/prisma'

// ─── In-memory cache (60 second TTL) ──────────────────────────────────────────
let cache: Record<string, string> | null = null
let cacheExpiry = 0

let cachePromise: Promise<Record<string, string>> | null = null

async function fetchSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (cache && now < cacheExpiry) return cache

  if (!cachePromise) {
    cachePromise = prisma.appSettings.findMany().then((rows: { key: string; value: string }[]) => {
      cache = Object.fromEntries(rows.map(r => [r.key, r.value]))
      cacheExpiry = Date.now() + 60_000 // 60 seconds
      
      const result = cache
      // Do not nullify immediately to avoid race conditions, let the next call hit cache instead
      cachePromise = null
      return result
    })
  }
  
  return cachePromise as Promise<Record<string, string>>
}

/** Returns all settings as { key: value } */
export async function getSettings(): Promise<Record<string, string>> {
  return fetchSettings()
}

/** Single value as string */
export async function getSetting(key: string): Promise<string> {
  const s = await fetchSettings()
  return s[key] ?? ''
}

/** Parsed as number (falls back to 0) */
export async function getSettingNumber(key: string): Promise<number> {
  const val = await getSetting(key)
  return parseInt(val, 10) || 0
}

/** Parsed as boolean ('true' → true) */
export async function getSettingBool(key: string): Promise<boolean> {
  const val = await getSetting(key)
  return val === 'true'
}

/** Splits textarea value by newlines → string[] (filters empty lines) */
export async function getSettingLines(key: string): Promise<string[]> {
  const val = await getSetting(key)
  return val
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

/** Update a single setting in DB and clear the cache */
export async function updateSetting(key: string, value: string): Promise<void> {
  await prisma.appSettings.update({
    where: { key },
    data: { value },
  })
  cache = null // clear cache so next fetch is fresh
}

/** Get all settings as full objects (for admin settings page) */
export async function getAllSettingsRaw() {
  return prisma.appSettings.findMany({ orderBy: { section: 'asc' } })
}

/** Clear cache manually (called after batch updates) */
export function clearSettingsCache(): void {
  cache = null
}
