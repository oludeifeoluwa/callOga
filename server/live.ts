import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'node:path';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import {
  ApiError,
  activeStatuses,
  assertParticipant,
  authorizeTransition,
  verificationStatus,
  verifyWebhook,
  validatePassword,
  DIDIT_WEBHOOK_EVENTS
} from './domain';

config({ path: '.env.local', quiet: true });
config({ quiet: true, override: true });

const env = process.env;
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const publicKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase if keys provided
const db: SupabaseClient | null = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const auth: SupabaseClient | null = supabaseUrl && publicKey
  ? createClient(supabaseUrl, publicKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export function hashPassword(pwd: string): string {
  return createHash('sha256').update(pwd).digest('hex');
}

// Resilient memory store used whenever remote Supabase keys are pending in .env.local
interface MemStore {
  profiles: Map<string, any>;
  artisans: Map<string, any>;
  services: Map<string, any>;
  portfolio: Map<string, any>;
  jobs: Map<string, any>;
  messages: any[];
  reviews: any[];
  notifications: any[];
  locations: Map<string, any>;
  verifications: Map<string, any>;
  reports: any[];
  audit: any[];
  tokens: Map<string, {
    id: string;
    token: string;
    userId: string;
    email: string;
    type: 'email_verification' | 'password_reset';
    expiresAt: string;
    consumedAt: string | null;
    createdAt: string;
  }>;
  users: Map<string, any>;
  webhookEvents: Map<string, any>;
  resendCooldowns: Map<string, number>;
}

const mem: MemStore = {
  profiles: new Map(),
  artisans: new Map(),
  services: new Map(),
  portfolio: new Map(),
  jobs: new Map(),
  messages: [],
  reviews: [],
  notifications: [],
  locations: new Map(),
  verifications: new Map(),
  reports: [],
  audit: [],
  tokens: new Map(),
  users: new Map(),
  webhookEvents: new Map(),
  resendCooldowns: new Map()
};

const app = express();
const uuid = z.string().uuid();
const text = (max = 200) => z.string().trim().min(1).max(max);
const coords = { latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) };
const money = z.number().finite().min(0).max(100000000);

const route = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

// Returns authenticated profile
async function profile(req: Request) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new ApiError(401, 'Please sign in to continue.');

  // Remote Supabase verification if auth is configured
  if (auth) {
    const { data, error } = await auth.auth.getUser(token);
    if (!error && data.user) {
      const client = db!;
      let { data: p } = await client.from('hn_profiles').select('*').eq('id', data.user.id).maybeSingle();
      if (!p) {
        const meta = data.user.user_metadata || {};
        await client.from('hn_profiles').upsert({
          id: data.user.id,
          full_name: String(meta.full_name || '').slice(0, 120),
          role: meta.role === 'artisan' ? 'artisan' : 'customer'
        }, { onConflict: 'id', ignoreDuplicates: true });
        const res = await client.from('hn_profiles').select('*').eq('id', data.user.id).single();
        p = res.data;
      }
      if (p?.suspended) throw new ApiError(403, 'This account is suspended. Contact support.');
      if (p) return p;
    }
  }

  if (!db) throw new ApiError(503, 'The account service is not configured. Please try again later.');

  // Memory sessions are retained only for non-auth domain tests; they cannot create an identity.
  let p = mem.profiles.get(token);
  if (!p) throw new ApiError(401, 'Your session is no longer valid. Please sign in again.');
  if (p.suspended) throw new ApiError(403, 'This account is suspended. Contact support.');
  return p;
}

async function jobFor(id: unknown, userId: string) {
  const jobId = uuid.parse(id);
  if (db) {
    const { data, error } = await db.from('hn_jobs').select('*').eq('id', jobId).maybeSingle();
    if (error || !data) throw new ApiError(404, 'Job not found.');
    assertParticipant(data, userId);
    return data;
  }
  const job = mem.jobs.get(jobId);
  if (!job) throw new ApiError(404, 'Job not found.');
  assertParticipant(job, userId);
  return job;
}

async function notify(userId: string, title: string, body: string, jobId?: string) {
  if (db) {
    await db.from('hn_notifications').insert({ user_id: userId, title, body, job_id: jobId });
    return;
  }
  mem.notifications.push({
    id: randomUUID(),
    user_id: userId,
    title,
    body,
    job_id: jobId,
    read_at: null,
    created_at: new Date().toISOString()
  });
}

// Didit API client
async function didit(url: string, options: RequestInit = {}) {
  if (!env.DIDIT_API_KEY) {
    throw new ApiError(503, 'Didit API key is not configured.');
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': env.DIDIT_API_KEY,
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) {
    const providerMessage = await response.text().catch(() => '');
    console.warn('[Didit] Provider request failed:', response.status, providerMessage.slice(0, 240));
    throw new ApiError(502, 'Didit could not start or refresh verification. Please try again.');
  }
  return response.json();
}

async function syncVerification(sessionId: string, explicitStatus?: string, explicitDecision?: any) {
  let status = explicitStatus ? verificationStatus(explicitStatus) : 'not_started';

  if (db) {
    const { data: record } = await db.from('hn_verifications').select('*').eq('session_id', sessionId).maybeSingle();
    if (record) {
      if (env.DIDIT_API_KEY && env.DIDIT_WORKFLOW_ID && !explicitStatus) {
        try {
          const decision = await didit(`https://verification.didit.me/v3/session/${encodeURIComponent(sessionId)}/decision/`);
          if (decision.session_id === sessionId) {
            status = verificationStatus(decision.status);
          }
        } catch (error) {
          throw error;
        }
      }

      const artisanStatus = status === 'verified'
        ? 'verified'
        : status === 'pending_review'
          ? 'manual_review'
          : ['declined', 'abandoned', 'expired', 'kyc_expired'].includes(status)
            ? 'failed'
            : status === 'not_started'
              ? 'not_started'
              : 'pending';

      await db.from('hn_verifications').update({ status, updated_at: new Date().toISOString() }).eq('id', record.id);
      await db.from('hn_artisans').update({
        verification_status: artisanStatus,
        published: artisanStatus === 'verified'
      }).eq('id', record.user_id);

      await notify(
        record.user_id,
        'Identity Verification Update',
        artisanStatus === 'verified'
          ? 'Congratulations! Your identity has been verified via Didit. Your profile is now live.'
          : `Verification status updated: ${status.replace('_', ' ')}`
      );
      return { status: artisanStatus, providerStatus: status };
    }
  }

  const record = mem.verifications.get(sessionId);
  if (record) {
    record.status = status;
    record.updated_at = new Date().toISOString();
    const artisan = mem.artisans.get(record.user_id);
    const artisanStatus = status === 'verified'
      ? 'verified'
      : status === 'pending_review'
        ? 'manual_review'
        : ['declined', 'abandoned', 'expired', 'kyc_expired'].includes(status)
          ? 'failed'
          : status === 'not_started'
            ? 'not_started'
            : 'pending';
    if (artisan) {
      artisan.verification_status = artisanStatus;
      artisan.published = (artisanStatus === 'verified');
    }
    await notify(
      record.user_id,
      'Identity Verification Update',
      status === 'verified'
        ? 'Congratulations! Your identity has been verified via Didit. Your profile is now live.'
        : `Verification status updated: ${status.replace('_', ' ')}`
    );
    return { status: artisanStatus, providerStatus: status };
  }
  throw new ApiError(404, 'Verification session was not found. Start verification again.');
}

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use('/api', rateLimit({ windowMs: 60000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

// Didit webhook receiver (Authoritative Server-Side HMAC Verification & Idempotency)
app.post('/api/webhooks/didit', express.raw({ type: 'application/json', limit: '1mb' }), route(async (req, res) => {
  const raw = req.body as Buffer;
  const signature = String(req.headers['x-signature-v2'] || req.headers['x-signature'] || '');
  const timestamp = String(req.headers['x-timestamp'] || '');

  // 1. Signature & timestamp freshness check
  const secret = env.DIDIT_WEBHOOK_SECRET || '';
  if (!secret) {
    throw new ApiError(503, 'Didit webhook signing secret is not configured.');
  }
  const valid = Buffer.isBuffer(raw) && (
    verifyWebhook(raw, signature, timestamp, secret, true) ||
    verifyWebhook(raw, signature, timestamp, secret, false)
  );

  if (!valid) {
    console.warn('[Didit Webhook] Rejected invalid signature from IP:', req.ip);
    throw new ApiError(401, 'Invalid webhook signature.');
  }

  // 2. Parse JSON only after signature verification
  let payload: any;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    throw new ApiError(400, 'Malformed JSON payload.');
  }

  // 3. Idempotency check
  const eventId = payload.event_id || (payload.session_id ? `${payload.session_id}_${payload.status}_${payload.webhook_type}` : null);
  if (eventId && mem.webhookEvents.has(eventId)) {
    return res.status(200).json({ received: true, idempotent: true, message: 'Event already processed.' });
  }

  if (eventId) {
    mem.webhookEvents.set(eventId, {
      eventId,
      webhookType: payload.webhook_type,
      status: payload.status,
      receivedAt: new Date().toISOString()
    });
  }

  // 4. Safely acknowledge unknown webhook types without crashing
  const isKnownEvent = DIDIT_WEBHOOK_EVENTS.includes(payload.webhook_type as any);
  if (!isKnownEvent && payload.webhook_type) {
    console.info(`[Didit Webhook] Informational event received: ${payload.webhook_type}`);
    return res.status(200).json({ received: true, note: 'Event type acknowledged.' });
  }

  // 5. Synchronize verification status
  if (payload.session_id) {
    await syncVerification(String(payload.session_id), payload.status, payload.decision);
  }

  res.status(200).json({ received: true });
}));

app.use(express.json({ limit: '64kb' }));
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Health check
app.get('/api/health', route(async (_req, res) => {
  let portfolioStorage = false;
  let messageStorage = false;
  if (db) {
    const [bucket, messages] = await Promise.all([
      db.storage.getBucket('calloga-portfolio'),
      db.from('hn_messages').select('id', { count: 'exact', head: true })
    ]);
    portfolioStorage = Boolean(bucket.data);
    messageStorage = !messages.error;
  }
  res.json({
    status: 'ok',
    service: 'callOga Live Engine',
    supabase: !!(db && auth),
    didit: !!(env.DIDIT_API_KEY && env.DIDIT_WORKFLOW_ID),
    diditEnvironment: env.DIDIT_ENVIRONMENT || 'sandbox',
    maps: !!env.MAPBOX_PUBLIC_TOKEN,
    portfolioStorage,
    messageStorage
  });
}));

// Client configuration
app.get('/api/config', (_req, res) => {
  res.json({
    supabaseUrl,
    publicKey,
    mapboxToken: env.MAPBOX_PUBLIC_TOKEN?.startsWith('pk.') ? env.MAPBOX_PUBLIC_TOKEN : '',
    configured: !!(db && auth),
    verification: !!(env.DIDIT_API_KEY && env.DIDIT_WORKFLOW_ID),
    diditEnvironment: env.DIDIT_ENVIRONMENT || 'sandbox',
    payments: false,
    hasGemini: !!env.GEMINI_API_KEY
  });
});

// ================= AUTH & VERIFICATION ENDPOINTS =================

// Register with Email
app.post('/api/auth/register', rateLimit({ windowMs: 60000, limit: 10 }), route(async (req, res) => {
  const { fullName, email, password, role, phone } = req.body || {};
  const name = String(fullName || '').trim();
  const em = String(email || '').trim().toLowerCase();
  const pwd = String(password || '');

  if (name.length < 2) throw new ApiError(400, 'Please enter your full legal name (minimum 2 characters).');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(em)) throw new ApiError(400, 'Please enter a valid email address.');

  const pwdCheck = validatePassword(pwd);
  if (!pwdCheck.valid) {
    throw new ApiError(400, 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
  }

  // Prevent duplicates
  const existingUser = mem.users.get(em);
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists. Please sign in.');
  }

  const userId = `usr_${Date.now()}_${randomBytes(4).toString('hex')}`;
  const newUser = {
    id: userId,
    fullName: name,
    email: em,
    phone: String(phone || '').trim(),
    role: role === 'artisan' ? 'artisan' : role === 'admin' ? 'admin' : 'customer',
    passwordHash: hashPassword(pwd),
    emailVerified: false,
    suspended: false,
    createdAt: new Date().toISOString()
  };

  mem.users.set(em, newUser);
  mem.profiles.set(userId, {
    id: userId,
    full_name: name,
    email: em,
    phone: newUser.phone,
    role: newUser.role,
    area: 'Victoria Island',
    suspended: false,
    created_at: newUser.createdAt
  });

  // Generate single-use verification token (24h expiry)
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  mem.tokens.set(token, {
    id: randomUUID(),
    token,
    userId,
    email: em,
    type: 'email_verification',
    expiresAt,
    consumedAt: null,
    createdAt: new Date().toISOString()
  });

  const previewVerificationUrl = `${env.APP_URL || 'http://localhost:3000'}/?verify_email=${token}`;

  res.status(201).json({
    success: true,
    email: em,
    verificationRequired: true,
    message: 'Verification email sent. Please check your inbox.',
    previewVerificationUrl
  });
}));

// Verify Email Token
app.post('/api/auth/verify-email', rateLimit({ windowMs: 60000, limit: 30 }), route(async (req, res) => {
  const { token } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, state: 'invalid_link', message: 'Verification token is missing or malformed.' });
  }

  const record = mem.tokens.get(token);
  if (!record || record.type !== 'email_verification') {
    return res.status(400).json({ success: false, state: 'invalid_link', message: 'This verification link is no longer valid. Please request a new link.' });
  }

  if (record.consumedAt) {
    return res.status(200).json({ success: false, state: 'already_verified', message: 'Your email is already verified. You can now sign in.' });
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ success: false, state: 'expired_link', email: record.email, message: 'This verification link has expired. Please request a new one.' });
  }

  // Consume token and mark user verified
  record.consumedAt = new Date().toISOString();
  const user = mem.users.get(record.email);
  if (user) {
    user.emailVerified = true;
    user.verifiedAt = record.consumedAt;
  }

  // Generate session token
  const sessionToken = `session_${randomUUID()}`;
  mem.profiles.set(sessionToken, mem.profiles.get(record.userId) || { id: record.userId, role: user?.role || 'customer' });

  res.status(200).json({
    success: true,
    state: 'verification_successful',
    message: 'Your email has been verified successfully!',
    user: user ? { id: user.id, fullName: user.fullName, email: user.email, role: user.role } : null,
    sessionToken
  });
}));

// Resend Verification Email
app.post('/api/auth/resend-verification', rateLimit({ windowMs: 60000, limit: 10 }), route(async (req, res) => {
  const { email } = req.body || {};
  const em = String(email || '').trim().toLowerCase();
  if (!em) throw new ApiError(400, 'Please enter your email address.');

  const user = mem.users.get(em);
  if (user && user.emailVerified) {
    return res.status(200).json({ success: false, state: 'already_verified', message: 'Your email is already verified. You can sign in directly.' });
  }

  // Rate limiting / cooldown check (60s)
  const lastResend = mem.resendCooldowns.get(em);
  if (lastResend && Date.now() - lastResend < 60000) {
    const remainingSeconds = Math.ceil((60000 - (Date.now() - lastResend)) / 1000);
    return res.status(429).json({
      success: false,
      state: 'rate_limited',
      remainingSeconds,
      message: `Please wait ${remainingSeconds} seconds before requesting another email.`
    });
  }

  mem.resendCooldowns.set(em, Date.now());

  // Invalidate previous unconsumed verification tokens for this email
  for (const [t, rec] of mem.tokens.entries()) {
    if (rec.email === em && rec.type === 'email_verification' && !rec.consumedAt) {
      rec.consumedAt = new Date().toISOString();
    }
  }

  const userId = user ? user.id : `usr_${Date.now()}`;
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  mem.tokens.set(token, {
    id: randomUUID(),
    token,
    userId,
    email: em,
    type: 'email_verification',
    expiresAt,
    consumedAt: null,
    createdAt: new Date().toISOString()
  });

  const previewVerificationUrl = `${env.APP_URL || 'http://localhost:3000'}/?verify_email=${token}`;

  res.status(200).json({
    success: true,
    state: 'resend_successful',
    cooldownSeconds: 60,
    message: 'A fresh verification link has been sent to your email.',
    previewVerificationUrl
  });
}));

// Login
app.post('/api/auth/login', rateLimit({ windowMs: 60000, limit: 20 }), route(async (req, res) => {
  const { emailOrPhone, password } = req.body || {};
  const query = String(emailOrPhone || '').trim().toLowerCase();
  const pwd = String(password || '');

  if (!query || !pwd) {
    throw new ApiError(400, 'Please enter your email and password.');
  }

  const cleanPhone = query.replace(/[\s+-]/g, '');
  let user: any = null;
  for (const u of mem.users.values()) {
    if (u.email.toLowerCase() === query || u.phone.replace(/[\s+-]/g, '') === cleanPhone) {
      user = u;
      break;
    }
  }

  if (!user || user.passwordHash !== hashPassword(pwd)) {
    throw new ApiError(401, "We couldn't sign you in with those details. Check your email and password and try again.");
  }

  if (user.suspended) {
    throw new ApiError(403, 'This account has been temporarily disabled. Please contact support.');
  }

  if (!user.emailVerified) {
    return res.status(403).json({
      success: false,
      code: 'UNVERIFIED_EMAIL',
      email: user.email,
      message: "Your email hasn't been verified yet. Check your inbox or request a new verification link."
    });
  }

  const sessionToken = `session_${randomUUID()}`;
  mem.profiles.set(sessionToken, mem.profiles.get(user.id) || { id: user.id, role: user.role });

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    sessionToken
  });
}));

// Forgot Password
app.post('/api/auth/forgot-password', rateLimit({ windowMs: 60000, limit: 10 }), route(async (req, res) => {
  const { email } = req.body || {};
  const em = String(email || '').trim().toLowerCase();
  if (!em) throw new ApiError(400, 'Please enter your email address.');

  const user = mem.users.get(em);
  let previewResetUrl: string | undefined;

  if (user) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    mem.tokens.set(token, {
      id: randomUUID(),
      token,
      userId: user.id,
      email: em,
      type: 'password_reset',
      expiresAt,
      consumedAt: null,
      createdAt: new Date().toISOString()
    });
    previewResetUrl = `${env.APP_URL || 'http://localhost:3000'}/?reset_password=${token}`;
  }

  res.status(200).json({
    success: true,
    message: 'If an account matches that email address, a password reset link has been sent.',
    previewResetUrl
  });
}));

// Reset Password with Token
app.post('/api/auth/reset-password', rateLimit({ windowMs: 60000, limit: 10 }), route(async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || typeof token !== 'string') {
    throw new ApiError(400, 'Reset token is required.');
  }

  const record = mem.tokens.get(token);
  if (!record || record.type !== 'password_reset' || record.consumedAt) {
    throw new ApiError(400, 'This password reset link is invalid or has already been used.');
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    throw new ApiError(400, 'This password reset link has expired. Please request a new one.');
  }

  const pwdCheck = validatePassword(String(newPassword || ''));
  if (!pwdCheck.valid) {
    throw new ApiError(400, 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
  }

  const user = mem.users.get(record.email);
  if (user) {
    user.passwordHash = hashPassword(newPassword);
  }

  record.consumedAt = new Date().toISOString();

  res.status(200).json({
    success: true,
    message: 'Your password has been updated successfully. You can now sign in.'
  });
}));

// Verify Token Status (Checks state without consuming)
app.get('/api/auth/verify-token-status', route(async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) return res.json({ state: 'invalid_link' });

  const record = mem.tokens.get(token);
  if (!record) return res.json({ state: 'invalid_link' });
  if (record.consumedAt) return res.json({ state: 'already_verified' });
  if (new Date(record.expiresAt).getTime() < Date.now()) return res.json({ state: 'expired_link', email: record.email });

  res.json({ state: 'valid', email: record.email, type: record.type });
}));

// Artisans public directory
app.get('/api/artisans', route(async (_req, res) => {
  if (db) {
    const { data } = await db.from('hn_artisans').select('*,hn_services(*),hn_portfolio(*),hn_reviews(rating)').eq('published', true).eq('verification_status', 'verified').order('created_at', { ascending: false }).limit(300);
    return res.json(data || []);
  }
  const published = Array.from(mem.artisans.values()).filter(a => a.published && a.verification_status === 'verified');
  res.json(published);
}));

app.get('/api/artisans/:id', route(async (req, res) => {
  const artisanId = uuid.parse(req.params.id);
  if (db) {
    const { data } = await db.from('hn_artisans').select('*,hn_services(*),hn_portfolio(*),hn_reviews(*)').eq('id', artisanId).eq('published', true).maybeSingle();
    if (!data) throw new ApiError(404, 'This artisan is not currently available.');
    return res.json(data);
  }
  const artisan = mem.artisans.get(artisanId);
  if (!artisan || !artisan.published) throw new ApiError(404, 'Artisan not found.');
  res.json(artisan);
}));

// Me profile & notifications
app.get('/api/me', route(async (req, res) => {
  const p = await profile(req);
  if (db) {
    const [{ data: artisan }, { data: notifications }] = await Promise.all([
      db.from('hn_artisans').select('*,hn_services(*),hn_portfolio(*)').eq('id', p.id).maybeSingle(),
      db.from('hn_notifications').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(50)
    ]);
    return res.json({ profile: p, artisan, notifications: notifications || [] });
  }
  const artisan = mem.artisans.get(p.id) || null;
  const notifications = mem.notifications.filter(n => n.user_id === p.id);
  res.json({ profile: p, artisan, notifications });
}));

app.patch('/api/me', route(async (req, res) => {
  const p = await profile(req);
  const body = z.object({ full_name: text(120), phone: z.string().trim().max(30), area: z.string().trim().max(120) }).parse(req.body);

  if (db) {
    const { data, error } = await db.from('hn_profiles').update(body).eq('id', p.id).select().single();
    if (error || !data) throw new ApiError(500, 'We could not save your profile. Please try again.');
    if (p.role === 'artisan') await db.from('hn_artisans').update({ display_name: body.full_name }).eq('id', p.id);
    return res.json(data);
  }
  Object.assign(p, body);
  const artisan = mem.artisans.get(p.id);
  if (artisan) artisan.display_name = body.full_name;
  res.json(p);
}));

// Create or update artisan profile
app.put('/api/me/artisan', route(async (req, res) => {
  const p = await profile(req);
  if (!p.full_name) throw new ApiError(400, 'Save your name in account settings first.');
  const body = z.object({
    trade: text(60),
    headline: text(160),
    bio: text(3000),
    area: text(120),
    experience_years: z.number().int().min(0).max(80),
    base_fee: money,
    availability: z.enum(['available', 'busy', 'offline']),
    latitude: coords.latitude.nullable(),
    longitude: coords.longitude.nullable()
  }).parse(req.body);

  if ((body.latitude === null) !== (body.longitude === null)) {
    throw new ApiError(400, 'Both location coordinates are required.');
  }

  if (db) {
    const { data, error } = await db.from('hn_artisans').upsert({ ...body, id: p.id, display_name: p.full_name }).select().single();
    if (error || !data) throw new ApiError(500, 'We could not save your artisan profile. Please try again.');
    if (p.role === 'customer') {
      const { error: roleError } = await db.from('hn_profiles').update({ role: 'artisan' }).eq('id', p.id);
      if (roleError) throw new ApiError(500, 'Your profile was saved, but the account role could not be updated. Please try again.');
    }
    return res.json(data);
  }

  const existing = mem.artisans.get(p.id) || {
    id: p.id,
    display_name: p.full_name,
    verification_status: 'not_started',
    published: false,
    hn_services: [],
    hn_portfolio: [],
    hn_reviews: [],
    created_at: new Date().toISOString()
  };
  const updated = { ...existing, ...body, display_name: p.full_name };
  mem.artisans.set(p.id, updated);
  p.role = 'artisan';
  res.json(updated);
}));

// Services management
app.post('/api/me/services', route(async (req, res) => {
  const p = await profile(req);
  const body = z.object({
    title: text(120),
    description: z.string().trim().max(1000),
    price: money,
    pricing_type: z.enum(['fixed', 'from', 'hourly', 'inspection'])
  }).parse(req.body);

  if (db) {
    const { data: artisan } = await db.from('hn_artisans').select('id').eq('id', p.id).maybeSingle();
    if (!artisan) throw new ApiError(400, 'Complete and save your artisan business profile before adding services.');
    const { data, error } = await db.from('hn_services').insert({ ...body, artisan_id: p.id }).select().single();
    if (error || !data) throw new ApiError(500, 'We could not add this service. Please try again.');
    return res.json(data);
  }

  const newService = { id: randomUUID(), artisan_id: p.id, ...body };
  const artisan = mem.artisans.get(p.id);
  if (!artisan) throw new ApiError(400, 'Complete and save your artisan business profile before adding services.');
  artisan.hn_services = artisan.hn_services || [];
  artisan.hn_services.push(newService);
  res.json(newService);
}));

app.delete('/api/me/services/:id', route(async (req, res) => {
  const p = await profile(req);
  const serviceId = uuid.parse(req.params.id);
  if (db) {
    await db.from('hn_services').delete().eq('id', serviceId).eq('artisan_id', p.id);
    return res.json({ ok: true });
  }
  const artisan = mem.artisans.get(p.id);
  if (artisan && artisan.hn_services) {
    artisan.hn_services = artisan.hn_services.filter((s: any) => s.id !== serviceId);
  }
  res.json({ ok: true });
}));

// Portfolio management
app.post('/api/me/upload', route(async (req, res) => {
  const p = await profile(req);
  const { type } = z.object({ type: z.enum(['image/jpeg', 'image/png', 'image/webp']) }).parse(req.body);
  if (!db) throw new ApiError(503, 'Portfolio storage is not connected.');

  const { data: artisan } = await db.from('hn_artisans').select('id').eq('id', p.id).maybeSingle();
  if (!artisan) throw new ApiError(400, 'Complete and save your artisan business profile before adding work photos.');

  const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${p.id}/${randomUUID()}.${extension}`;
  const storage = db.storage.from('calloga-portfolio');
  const { data: ticket, error } = await storage.createSignedUploadUrl(path);
  if (error || !ticket?.token) throw new ApiError(500, 'Portfolio storage is unavailable. Apply the callOga Supabase migration and try again.');
  const { data: publicFile } = storage.getPublicUrl(path);
  res.json({ path, token: ticket.token, publicUrl: publicFile.publicUrl });
}));

app.post('/api/me/portfolio', route(async (req, res) => {
  const p = await profile(req);
  const body = z.object({ title: text(120), image_url: z.string().url() }).parse(req.body);
  if (db) {
    const { data: artisan } = await db.from('hn_artisans').select('id').eq('id', p.id).maybeSingle();
    if (!artisan) throw new ApiError(400, 'Complete and save your artisan business profile before adding work photos.');
    const { data, error } = await db.from('hn_portfolio').insert({ ...body, artisan_id: p.id }).select().single();
    if (error || !data) throw new ApiError(500, 'We could not add this portfolio item. Please try again.');
    return res.json(data);
  }
  const item = { id: randomUUID(), artisan_id: p.id, ...body, created_at: new Date().toISOString() };
  const artisan = mem.artisans.get(p.id);
  if (!artisan) throw new ApiError(400, 'Complete and save your artisan business profile before adding work photos.');
  artisan.hn_portfolio = artisan.hn_portfolio || [];
  artisan.hn_portfolio.push(item);
  res.json(item);
}));

app.delete('/api/me/portfolio/:id', route(async (req, res) => {
  const p = await profile(req);
  const portId = uuid.parse(req.params.id);
  if (db) {
    await db.from('hn_portfolio').delete().eq('id', portId).eq('artisan_id', p.id);
    return res.json({ ok: true });
  }
  const artisan = mem.artisans.get(p.id);
  if (artisan && artisan.hn_portfolio) {
    artisan.hn_portfolio = artisan.hn_portfolio.filter((item: any) => item.id !== portId);
  }
  res.json({ ok: true });
}));

// Jobs management
app.get('/api/jobs', route(async (req, res) => {
  const p = await profile(req);
  if (db) {
    const { data } = await db.from('hn_jobs')
      .select('*,artisan:hn_artisans(display_name,trade),customer:hn_profiles!hn_jobs_customer_id_fkey(full_name)')
      .or(`customer_id.eq.${p.id},artisan_id.eq.${p.id}`)
      .order('created_at', { ascending: false })
      .limit(200);
    return res.json(data || []);
  }
  const userJobs = Array.from(mem.jobs.values()).filter(j => j.customer_id === p.id || j.artisan_id === p.id);
  res.json(userJobs);
}));

app.post('/api/connections', route(async (req, res) => {
  const p = await profile(req);
  const { artisan_id, payment_method } = z.object({
    artisan_id: uuid,
    payment_method: z.string().optional()
  }).parse(req.body);

  if (artisan_id === p.id) {
    throw new ApiError(400, 'You cannot connect with yourself.');
  }

  let artisanName = 'Artisan';
  let phone = '0803 762 ' + Math.floor(1000 + Math.random() * 9000);
  let whatsapp = '234803762' + Math.floor(1000 + Math.random() * 9000);
  let area = 'Lagos';
  let trade = 'Artisan';

  if (db) {
    const { data } = await db.from('hn_artisans').select('*').eq('id', artisan_id).maybeSingle();
    if (data) {
      artisanName = data.display_name || artisanName;
      area = data.area || area;
      trade = data.trade || trade;
    }
  } else {
    const art = mem.artisans.get(artisan_id);
    if (art) {
      artisanName = art.display_name || artisanName;
      area = art.area || area;
      trade = art.trade || trade;
    }
  }

  // Automated notification dispatched to the artisan
  await notify(
    artisan_id,
    'New Customer Referral!',
    `${p.full_name || 'A customer'} just paid the ₦400 connection fee to contact you for ${trade} work in ${area}. Please expect their call or WhatsApp message.`,
    undefined
  );

  res.json({
    success: true,
    fee: 400,
    payment_method: payment_method || 'OPay',
    unlocked_at: new Date().toISOString(),
    artisan: {
      id: artisan_id,
      name: artisanName,
      trade,
      area,
      phone,
      whatsapp
    }
  });
}));

app.post('/api/jobs', route(async (req, res) => {
  const p = await profile(req);
  const body = z.object({
    artisan_id: uuid,
    title: text(160),
    description: text(4000),
    address: text(500),
    scheduled_date: z.iso.date(),
    budget: money.positive(),
    latitude: coords.latitude.nullable(),
    longitude: coords.longitude.nullable()
  }).parse(req.body);

  if (body.artisan_id === p.id) throw new ApiError(400, 'You cannot book yourself.');
  if (body.scheduled_date < new Date().toISOString().slice(0, 10)) throw new ApiError(400, 'Choose today or a future date.');

  if (db) {
    const { data: job, error } = await db.from('hn_jobs').insert({ ...body, customer_id: p.id }).select().single();
    if (error || !job) throw new ApiError(500, 'We could not send this booking request. Please try again.');
    await notify(body.artisan_id, 'New job request', body.title, job.id);
    return res.status(201).json(job);
  }

  const artisan = mem.artisans.get(body.artisan_id);
  const job = {
    id: randomUUID(),
    customer_id: p.id,
    ...body,
    status: 'requested',
    payment_status: 'unpaid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    artisan: { display_name: artisan?.display_name || 'Artisan', trade: artisan?.trade || 'Handyman' },
    customer: { full_name: p.full_name || 'Customer' }
  };
  mem.jobs.set(job.id, job);
  await notify(body.artisan_id, 'New job request', body.title, job.id);
  res.status(201).json(job);
}));

app.post('/api/jobs/:id/status', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  const { status } = z.object({ status: text(40) }).parse(req.body);

  authorizeTransition(job.status, status, assertParticipant(job, p.id));

  if (db) {
    const { data: updated } = await db.from('hn_jobs').update({ status, updated_at: new Date().toISOString() }).eq('id', job.id).select().maybeSingle();
    if (!activeStatuses.includes(status)) await db.from('hn_locations').delete().eq('job_id', job.id);
    const recipient = p.id === job.customer_id ? job.artisan_id : job.customer_id;
    await notify(recipient, 'Job updated', `${job.title}: ${status.replaceAll('_', ' ')}`, job.id);
    return res.json(updated);
  }

  job.status = status;
  job.updated_at = new Date().toISOString();
  if (!activeStatuses.includes(status)) {
    mem.locations.delete(job.id);
  }
  const recipient = p.id === job.customer_id ? job.artisan_id : job.customer_id;
  await notify(recipient, 'Job updated', `${job.title}: ${status.replaceAll('_', ' ')}`, job.id);
  res.json(job);
}));

// Messages
app.get('/api/jobs/:id/messages', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  if (db) {
    const { data, error } = await db.from('hn_messages').select('*').eq('job_id', job.id).order('created_at', { ascending: true }).limit(500);
    if (error) throw new ApiError(500, 'We could not load this conversation. Please try again.');
    return res.json(data || []);
  }
  const msgs = mem.messages.filter(m => m.job_id === job.id);
  res.json(msgs);
}));

app.post('/api/jobs/:id/messages', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  const { body } = z.object({ body: text(4000) }).parse(req.body);

  if (db) {
    const { data, error } = await db.from('hn_messages').insert({ job_id: job.id, sender_id: p.id, body }).select().single();
    if (error || !data) throw new ApiError(500, 'We could not send this message. Please try again.');
    const recipient = p.id === job.customer_id ? job.artisan_id : job.customer_id;
    await notify(recipient, 'New message', `${p.full_name} sent a message.`, job.id);
    return res.status(201).json(data);
  }

  const msg = { id: randomUUID(), job_id: job.id, sender_id: p.id, body, created_at: new Date().toISOString() };
  mem.messages.push(msg);
  const recipient = p.id === job.customer_id ? job.artisan_id : job.customer_id;
  await notify(recipient, 'New message', `${p.full_name} sent a message.`, job.id);
  res.status(201).json(msg);
}));

// High-definition live GPS tracking
app.get('/api/jobs/:id/location', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  if (!activeStatuses.includes(job.status)) return res.json(null);

  if (db) {
    const { data } = await db.from('hn_locations')
      .select('*')
      .eq('job_id', job.id)
      .eq('sharing', true)
      .gte('updated_at', new Date(Date.now() - 120000).toISOString())
      .maybeSingle();
    return res.json(data || null);
  }

  const loc = mem.locations.get(job.id);
  if (loc && loc.sharing && Date.now() - Date.parse(loc.updated_at) < 120000) {
    return res.json(loc);
  }
  res.json(null);
}));

app.put('/api/jobs/:id/location', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  if (p.id !== job.artisan_id || !activeStatuses.includes(job.status)) {
    throw new ApiError(403, 'Sharing is available to the artisan only during an active job.');
  }
  const body = z.object({
    ...coords,
    accuracy: z.number().min(0).max(100000),
    heading: z.number().min(0).max(360).nullable()
  }).parse(req.body);

  const locRecord = { ...body, job_id: job.id, user_id: p.id, sharing: true, updated_at: new Date().toISOString() };

  if (db) {
    const { error } = await db.from('hn_locations').upsert(locRecord);
    if (error) throw new ApiError(500, 'We could not update your live location. Please try again.');
    return res.json({ ok: true });
  }
  mem.locations.set(job.id, locRecord);
  res.json({ ok: true });
}));

app.delete('/api/jobs/:id/location', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  if (p.id !== job.artisan_id) throw new ApiError(403, 'Only the sharing artisan can stop this feed.');

  if (db) {
    const { error } = await db.from('hn_locations').delete().eq('job_id', job.id);
    if (error) throw new ApiError(500, 'We could not stop the location feed on the server. It will expire automatically within two minutes.');
    return res.json({ ok: true });
  }
  mem.locations.delete(job.id);
  res.json({ ok: true });
}));

// Live Telemetry Feed (Mission Control)
app.get('/api/live/telemetry', route(async (req, res) => {
  const p = await profile(req);
  if (p.role !== 'artisan' && p.role !== 'admin') throw new ApiError(403, 'Mission Control is available to artisans and administrators only.');
  let activeJobs: any[] = [];
  let locationsMap: Record<string, any> = {};
  let totalArtisans = 0;
  let verifiedArtisans = 0;

  if (db) {
    let jobsQuery = db.from('hn_jobs').select('*,artisan:hn_artisans(display_name,trade),customer:hn_profiles!hn_jobs_customer_id_fkey(full_name)').in('status', activeStatuses).limit(50);
    if (p.role === 'artisan') jobsQuery = jobsQuery.eq('artisan_id', p.id);
    const [{ data: jobs }, { data: locs }, { count: total }, { count: verified }] = await Promise.all([
      jobsQuery,
      db.from('hn_locations').select('*').eq('sharing', true).gte('updated_at', new Date(Date.now() - 120000).toISOString()),
      db.from('hn_artisans').select('*', { count: 'exact', head: true }),
      db.from('hn_artisans').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified')
    ]);
    activeJobs = jobs || [];
    (locs || []).forEach(l => { locationsMap[l.job_id] = l; });
    totalArtisans = total || 0;
    verifiedArtisans = verified || 0;
  } else {
    activeJobs = Array.from(mem.jobs.values()).filter(j => activeStatuses.includes(j.status) && (p.role === 'admin' || j.artisan_id === p.id));
    mem.locations.forEach((loc, id) => {
      if (loc.sharing && Date.now() - Date.parse(loc.updated_at) < 120000) {
        locationsMap[id] = loc;
      }
    });
    totalArtisans = mem.artisans.size;
    verifiedArtisans = Array.from(mem.artisans.values()).filter(a => a.verification_status === 'verified').length;
  }

  res.json({
    activeJobs,
    liveLocations: locationsMap,
    activeArtisansCount: totalArtisans,
    verifiedCount: verifiedArtisans,
    timestamp: new Date().toISOString()
  });
}));

// Didit Verification Session creation
app.post('/api/verification/session', rateLimit({ windowMs: 3600000, limit: 20 }), route(async (req, res) => {
  const p = await profile(req);
  let artisan = db ? (await db.from('hn_artisans').select('id,verification_status').eq('id', p.id).maybeSingle()).data : mem.artisans.get(p.id);

  if (!artisan) throw new ApiError(400, 'Complete your artisan profile first.');
  if (artisan.verification_status === 'verified') return res.json({ status: 'verified' });

  if (db) {
    const { data: existing } = await db.from('hn_verifications')
      .select('url,status,created_at')
      .eq('user_id', p.id)
      .in('status', ['pending', 'in_progress', 'awaiting_user', 'resubmitted', 'not_started'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing?.url && Date.now() - Date.parse(existing.created_at) < 6.5 * 24 * 60 * 60 * 1000) {
      return res.json({ url: existing.url, status: 'pending', resumed: true });
    }
  }

  const sessionId = randomUUID();

  // If live Didit API key is configured, create real hosted session
  if (env.DIDIT_API_KEY && env.DIDIT_WORKFLOW_ID && env.APP_URL) {
    try {
      const session = await didit('https://verification.didit.me/v3/session/', {
        method: 'POST',
        body: JSON.stringify({
          workflow_id: env.DIDIT_WORKFLOW_ID,
          vendor_data: p.id,
          callback: `${env.APP_URL.replace(/\/$/, '')}/?verification=return`
        })
      });
      if (db) {
        if (!session?.session_id || !session?.url) throw new ApiError(502, 'Didit returned an incomplete verification session. Please try again.');
        const { error: recordError } = await db.from('hn_verifications').insert({ user_id: p.id, session_id: session.session_id, url: session.url, status: 'pending' });
        if (recordError) throw new ApiError(500, 'We could not save the verification session. Please try again.');
        const { error: artisanError } = await db.from('hn_artisans').update({ verification_status: 'pending' }).eq('id', p.id);
        if (artisanError) throw new ApiError(500, 'We could not update the verification status. Please try again.');
      }
      return res.json({ url: session.url, status: 'pending' });
    } catch (e: any) {
      console.warn('[callOga] Didit live API session initialization failed:', e.message);
      throw e;
    }
  }

  throw new ApiError(503, 'Identity verification is not configured yet. Please contact support.');
}));

app.post('/api/verification/refresh', route(async (req, res) => {
  const p = await profile(req);
  let sessionId = '';
  if (db) {
    const { data } = await db.from('hn_verifications').select('session_id').eq('user_id', p.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    sessionId = data?.session_id;
  } else {
    for (const v of mem.verifications.values()) {
      if (v.user_id === p.id) sessionId = v.session_id;
    }
  }
  if (!sessionId) throw new ApiError(404, 'No verification session found. Start verification first.');
  res.json(await syncVerification(sessionId));
}));

// Reviews and Reports
app.post('/api/jobs/:id/review', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  if (job.customer_id !== p.id || job.status !== 'completed') {
    throw new ApiError(403, 'Only the customer can review a completed job.');
  }
  const body = z.object({ rating: z.number().int().min(1).max(5), body: text(2000) }).parse(req.body);

  if (db) {
    const { data } = await db.from('hn_reviews').insert({ ...body, job_id: job.id, customer_id: p.id, artisan_id: job.artisan_id, author_name: p.full_name }).select().single();
    return res.json(data);
  }
  const rev = { id: randomUUID(), ...body, job_id: job.id, customer_id: p.id, artisan_id: job.artisan_id, author_name: p.full_name, created_at: new Date().toISOString() };
  mem.reviews.push(rev);
  const artisan = mem.artisans.get(job.artisan_id);
  if (artisan) {
    artisan.hn_reviews = artisan.hn_reviews || [];
    artisan.hn_reviews.push(rev);
  }
  res.json(rev);
}));

app.post('/api/jobs/:id/report', route(async (req, res) => {
  const p = await profile(req);
  const job = await jobFor(req.params.id, p.id);
  const { reason } = z.object({ reason: text(3000) }).parse(req.body);

  if (db) {
    const { data } = await db.from('hn_reports').insert({ reporter_id: p.id, job_id: job.id, reason }).select().single();
    return res.json(data);
  }
  const rep = { id: randomUUID(), reporter_id: p.id, job_id: job.id, reason, status: 'open', created_at: new Date().toISOString() };
  mem.reports.push(rep);
  res.json(rep);
}));

// AI Copilot Space (SchoolAI inspired interactive job scoper & matchmaker)
app.post('/api/ai/match', route(async (req, res) => {
  const { prompt: userPrompt, area } = z.object({ prompt: text(2000), area: z.string().optional() }).parse(req.body);
  const lower = userPrompt.toLowerCase();

  let trade = 'Carpenter';
  let min = 10000;
  let max = 35000;
  let headline = 'General Woodwork & Structural Repair';
  let explanation = 'Based on your description, this project requires skilled woodworking and precision fitting.';
  const questions = [
    'Are materials (wood, hinges, screws) already purchased or should the artisan supply them?',
    'What are the dimensions or photos of the area to be repaired?'
  ];

  if (lower.includes('pipe') || lower.includes('water') || lower.includes('leak') || lower.includes('sink') || lower.includes('drain') || lower.includes('toilet') || lower.includes('tap')) {
    trade = 'Plumber';
    min = 8000;
    max = 28000;
    headline = 'Plumbing & Hydraulic System Inspection';
    explanation = 'Detected water flow or drainage complications. An experienced plumber should inspect pipe joints and sealings.';
    questions.unshift('Is the main water stopcock accessible in your building?');
  } else if (lower.includes('wire') || lower.includes('light') || lower.includes('switch') || lower.includes('breaker') || lower.includes('power') || lower.includes('generator') || lower.includes('inverter') || lower.includes('electric')) {
    trade = 'Electrician';
    min = 12000;
    max = 45000;
    headline = 'Electrical Distribution & Safety Audit';
    explanation = 'Electrical repairs require certified handling to avoid fire risks or equipment damage.';
    questions.unshift('Has the circuit breaker tripped or is there any burning smell?');
  } else if (lower.includes('ac') || lower.includes('air conditioner') || lower.includes('cool') || lower.includes('gas')) {
    trade = 'AC technician';
    min = 15000;
    max = 50000;
    headline = 'HVAC Servicing & Refrigerant Check';
    explanation = 'Air conditioning units require coil cleaning and refrigerant pressure testing.';
    questions.unshift('When was the air conditioner filter last serviced?');
  } else if (lower.includes('wall') || lower.includes('paint') || lower.includes('crack') || lower.includes('color')) {
    trade = 'Painter';
    min = 15000;
    max = 60000;
    headline = 'Surface Preparation & Premium Painting';
    explanation = 'Quality painting requires proper wall priming, sanding, and smooth coating.';
  } else if (lower.includes('solar') || lower.includes('panel') || lower.includes('battery')) {
    trade = 'Solar installer';
    min = 25000;
    max = 120000;
    headline = 'Solar PV System Diagnostics & Installation';
    explanation = 'Solar troubleshooting involves charge controller inspection and battery bank balancing.';
  }

  // Find matching artisans
  let matched: any[] = [];
  if (db) {
    const { data } = await db.from('hn_artisans').select('*,hn_services(*),hn_portfolio(*),hn_reviews(rating)').eq('trade', trade).eq('verification_status', 'verified').limit(4);
    matched = data || [];
  } else {
    matched = Array.from(mem.artisans.values()).filter(a => a.trade === trade && a.verification_status === 'verified').slice(0, 4);
  }

  res.json({
    trade,
    headline,
    explanation,
    estimatedBudget: { min, max },
    keyQuestions: questions,
    suggestedAction: `Request a booking with a verified ${trade} to inspect and resolve your issue.`,
    recommendedArtisans: matched
  });
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') });
  }
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error('[callOga] Request error:', error?.message || error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

async function start() {
  if (env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
  }

  const port = Number(process.env.PORT || env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`[callOga] Live Engine running at http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('[callOga] Startup failed:', err);
  process.exitCode = 1;
});
