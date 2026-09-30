import { createHmac, timingSafeEqual } from 'node:crypto';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const activeStatuses = ['accepted', 'en_route', 'in_progress'];
export function authorizeTransition(status: string, next: string, actor: 'customer' | 'artisan') {
  const transitions: Record<string, Partial<Record<typeof actor, string[]>>> = {
    requested: { customer: ['cancelled'], artisan: ['accepted', 'declined'] },
    accepted: { customer: ['cancelled', 'disputed'], artisan: ['en_route', 'in_progress', 'cancelled'] },
    en_route: { customer: ['disputed'], artisan: ['in_progress', 'cancelled'] },
    in_progress: { customer: ['disputed'], artisan: ['awaiting_confirmation', 'disputed'] },
    awaiting_confirmation: { customer: ['completed', 'disputed'] },
  };
  if (!transitions[status]?.[actor]?.includes(next)) throw new ApiError(409, 'This job cannot move to that status. Refresh and try again.');
}
export function assertParticipant(job: { customer_id: string; artisan_id: string }, userId: string) {
  if (job.customer_id !== userId && job.artisan_id !== userId) throw new ApiError(403, 'This job is private.');
  return job.customer_id === userId ? 'customer' as const : 'artisan' as const;
}
export const DIDIT_WEBHOOK_EVENTS = [
  'status.updated',
  'data.updated',
  'user.status.updated',
  'user.data.updated',
  'business.status.updated',
  'business.data.updated',
  'activity.created',
  'transaction.created',
  'transaction.status.updated',
  'travel_rule.status.updated',
] as const;

export function verificationStatus(status: string) {
  switch (status) {
    case 'Approved':
      return 'verified';
    case 'Declined':
      return 'declined';
    case 'In Review':
      return 'pending_review';
    case 'In Progress':
      return 'in_progress';
    case 'Resubmitted':
      return 'resubmitted';
    case 'Abandoned':
      return 'abandoned';
    case 'Awaiting User':
      return 'awaiting_user';
    case 'Expired':
      return 'expired';
    case 'Kyc Expired':
      return 'kyc_expired';
    case 'Not Started':
    default:
      return 'not_started';
  }
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, canonical(v)])
    );
  }
  return value;
}

export function verifyWebhook(
  raw: Buffer,
  signature: string,
  timestamp: string,
  secret: string,
  v2 = true,
  now = Date.now()
): boolean {
  if (!secret || !/^\d+$/.test(timestamp)) return false;
  const timeSeconds = Number(timestamp);
  const currentSeconds = now / 1000;
  if (Math.abs(currentSeconds - timeSeconds) > 300) return false;
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

  try {
    const receivedBuf = Buffer.from(signature.toLowerCase(), 'hex');
    if (receivedBuf.length !== 32) return false;

    // Try V2 canonical JSON, raw buffer, and timestamp prefixed variations
    const candidates: Buffer[] = [];
    if (v2) {
      try {
        const parsed = JSON.parse(raw.toString('utf8'));
        const canon = JSON.stringify(canonical(parsed));
        candidates.push(createHmac('sha256', secret).update(canon).digest());
        candidates.push(createHmac('sha256', secret).update(`${timestamp}.${canon}`).digest());
      } catch {}
    }
    candidates.push(createHmac('sha256', secret).update(raw).digest());
    candidates.push(createHmac('sha256', secret).update(`${timestamp}.${raw.toString('utf8')}`).digest());

    for (const cand of candidates) {
      if (cand.length === 32 && timingSafeEqual(cand, receivedBuf)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export interface PasswordCheckResult {
  valid: boolean;
  length: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function validatePassword(password: string): PasswordCheckResult {
  const length = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return {
    valid: length && hasUpper && hasLower && hasNumber && hasSpecial,
    length,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial
  };
}

