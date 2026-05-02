/**
 * lib/challenge.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * منطق التحدي والتوقيت السعودي (Asia/Riyadh = UTC+3)
 */

// ─── التوقيت السعودي ──────────────────────────────────────────────────────────

const SAUDI_TZ = 'Asia/Riyadh'

/**
 * يُعيد بداية اليوم الحالي بالتوقيت السعودي كـ UTC Date
 * مثال: لو اليوم السعودي هو 2024-05-03، يُعيد 2024-05-02T21:00:00Z
 */
export function getSaudiTodayStartUTC(): Date {
  const now = new Date()
  // نحصل على تاريخ اليوم بالتوقيت السعودي بصيغة YYYY-MM-DD
  const saudiDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: SAUDI_TZ,
  }).format(now) // e.g. "2024-05-03"

  const [y, m, d] = saudiDateStr.split('-').map(Number)
  // الساعة 00:00 بالتوقيت السعودي (UTC+3) = الساعة 21:00 من اليوم السابق بـ UTC
  return new Date(Date.UTC(y, m - 1, d) - 3 * 60 * 60 * 1000)
}

/**
 * يُعيد بداية يوم جلسة بعينها بالتوقيت السعودي كـ UTC Date
 */
export function getSessionDayStartUTC(scheduledAt: Date): Date {
  const saudiDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: SAUDI_TZ,
  }).format(scheduledAt)

  const [y, m, d] = saudiDateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d) - 3 * 60 * 60 * 1000)
}

// ─── منطق الخسارة ─────────────────────────────────────────────────────────────

/**
 * هل انتهى وقت الجلسة (مضى يومها بالتوقيت السعودي) بدون إتمامها؟
 */
export function isSessionExpired(
  scheduledAt: Date,
  completedAt: Date | null
): boolean {
  if (completedAt) return false
  const saudiTodayStart = getSaudiTodayStartUTC()
  const sessionDayStart = getSessionDayStartUTC(scheduledAt)
  return sessionDayStart < saudiTodayStart
}

/**
 * هل يوم الجلسة هو اليوم الحالي بالتوقيت السعودي؟
 */
export function isSessionToday(scheduledAt: Date): boolean {
  const saudiTodayStart = getSaudiTodayStartUTC()
  const sessionDayStart = getSessionDayStartUTC(scheduledAt)
  // اليوم = من بداية اليوم السعودي إلى بداية اليوم التالي
  const nextDay = new Date(saudiTodayStart.getTime() + 24 * 60 * 60 * 1000)
  return sessionDayStart >= saudiTodayStart && sessionDayStart < nextDay
}

/**
 * يُعيد تاريخ الحذف المتوقع للحساب
 */
export function getDeleteDate(challengeFailedAt: Date, deleteDays: number): Date {
  return new Date(challengeFailedAt.getTime() + deleteDays * 24 * 60 * 60 * 1000)
}

/**
 * يُعيد عدد الأيام المتبقية حتى الحذف (يُقرّب للأعلى)
 */
export function getDaysUntilDelete(challengeFailedAt: Date, deleteDays: number): number {
  const deleteDate = getDeleteDate(challengeFailedAt, deleteDays)
  const diff = deleteDate.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}
