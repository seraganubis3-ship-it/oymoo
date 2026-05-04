import { prisma } from '@/lib/prisma'
import { getSettingNumber, getSettingLines, getSetting } from '@/lib/settings'
import { addWeeks, setHours, setMinutes, startOfDay } from 'date-fns'

// ─── Generate sessions for a new profile ──────────────────────────────────────

export async function generateSessions(
  profileId: string,
  firstSessionDate: Date,
  preferredTime: string // "HH:MM"
): Promise<void> {
  const totalSessions = 10
  // We no longer use session_interval_weeks setting directly

  const [hoursStr, minutesStr] = preferredTime.split(':')
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)

  const sessions = Array.from({ length: totalSessions }, (_, i) => {
    // Custom scheduling logic:
    // - Sessions 1-4 (i < 4): 1 session per week
    // - Sessions 5+ (i >= 4): 1 session every 2 weeks
    const weeksToAdd = i < 4 ? i : 3 + (i - 3) * 2
    
    const baseDate = addWeeks(startOfDay(firstSessionDate), weeksToAdd)
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
