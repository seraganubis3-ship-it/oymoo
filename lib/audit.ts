import { prisma } from '@/lib/prisma'

/**
 * Log an admin action to the AuditLog table.
 */
export async function logAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  details?: string | object
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetUserId: targetUserId ?? null,
        details:
          details != null
            ? typeof details === 'string'
              ? details
              : JSON.stringify(details)
            : null,
      },
    })
  } catch (err) {
    // Audit failures must never crash the main request
    console.error('[AuditLog] Failed to write log:', err)
  }
}
