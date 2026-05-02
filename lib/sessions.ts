import { prisma } from '@/lib/prisma'
import { getSettingNumber, getSettingLines, getSetting } from '@/lib/settings'
import { addWeeks, setHours, setMinutes, startOfDay } from 'date-fns'

// ─── Generate sessions for a new profile ──────────────────────────────────────

export async function generateSessions(
  profileId: string,
  firstSessionDate: Date,
  preferredTime: string // "HH:MM"
): Promise<void> {
  const totalSessions = await getSettingNumber('total_sessions')
  const intervalWeeks = await getSettingNumber('session_interval_weeks')

  const [hoursStr, minutesStr] = preferredTime.split(':')
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)

  const sessions = Array.from({ length: totalSessions }, (_, i) => {
    const baseDate = addWeeks(startOfDay(firstSessionDate), i * intervalWeeks)
    const scheduledAt = setMinutes(setHours(baseDate, hours), minutes)
    return {
      profileId,
      sessionNumber: i + 1,
      scheduledAt,
    }
  })

  await prisma.session.createMany({ data: sessions })
}

// ─── Get next incomplete session for a profile ────────────────────────────────

export async function getNextSession(profileId: string) {
  return prisma.session.findFirst({
    where: { profileId, completedAt: null },
    orderBy: { sessionNumber: 'asc' },
  })
}

// ─── Random motivational message ─────────────────────────────────────────────

export async function getRandomMotivation(): Promise<string> {
  const messages = await getSettingLines('motivational_messages')
  if (!messages.length) return ''
  return messages[Math.floor(Math.random() * messages.length)]
}

// ─── Progress message based on completed/total ────────────────────────────────

export async function getProgressMessage(
  completed: number,
  total: number
): Promise<string> {
  if (completed === 0) return getSetting('progress_msg_0')
  if (completed >= total) return getSetting('progress_msg_done')

  const pct = (completed / total) * 100
  if (pct <= 33) return getSetting('progress_msg_low')
  if (pct <= 66) return getSetting('progress_msg_mid')
  return getSetting('progress_msg_high')
}
