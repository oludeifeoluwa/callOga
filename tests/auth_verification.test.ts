import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  validatePassword,
  verificationStatus,
  verifyWebhook,
  DIDIT_WEBHOOK_EVENTS
} from '../server/domain.js';

test('Password Validation (SchoolAI Compact Checklist)', async (t) => {
  await t.test('detects short password', () => {
    const res = validatePassword('Aa1!');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.length, false);
    assert.strictEqual(res.hasUpper, true);
    assert.strictEqual(res.hasLower, true);
    assert.strictEqual(res.hasNumber, true);
    assert.strictEqual(res.hasSpecial, true);
  });

  await t.test('detects missing uppercase', () => {
    const res = validatePassword('password123!');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.hasUpper, false);
  });

  await t.test('detects missing lowercase', () => {
    const res = validatePassword('PASSWORD123!');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.hasLower, false);
  });

  await t.test('detects missing number', () => {
    const res = validatePassword('PasswordSpecial!');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.hasNumber, false);
  });

  await t.test('detects missing special character', () => {
    const res = validatePassword('Password1234');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.hasSpecial, false);
  });

  await t.test('accepts strong compliant password', () => {
    const res = validatePassword('LagosVerified2026!');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.length, true);
    assert.strictEqual(res.hasUpper, true);
    assert.strictEqual(res.hasLower, true);
    assert.strictEqual(res.hasNumber, true);
    assert.strictEqual(res.hasSpecial, true);
  });
});

test('Didit V3 Webhook Signature Verification (HMAC-SHA256 & Timestamps)', async (t) => {
  const secret = 'G83BAaguuDupKkF6OjDRHrT8CEBygFcLP2wCf7SGY0c';
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    event_id: 'evt_test_123',
    session_id: 'sess_abc_789',
    webhook_type: 'status.updated',
    status: 'Approved'
  });
  const rawBuffer = Buffer.from(payload, 'utf8');

  // Compute valid signature
  const validSignature = createHmac('sha256', secret).update(rawBuffer).digest('hex');

  await t.test('accepts valid HMAC-SHA256 signature with fresh timestamp', () => {
    const isValid = verifyWebhook(rawBuffer, validSignature, String(now), secret, false);
    assert.strictEqual(isValid, true);
  });

  await t.test('rejects stale timestamp (> 300s old)', () => {
    const staleTime = String(now - 305);
    const isValid = verifyWebhook(rawBuffer, validSignature, staleTime, secret, false);
    assert.strictEqual(isValid, false);
  });

  await t.test('rejects future timestamp (> 300s in future)', () => {
    const futureTime = String(now + 305);
    const isValid = verifyWebhook(rawBuffer, validSignature, futureTime, secret, false);
    assert.strictEqual(isValid, false);
  });

  await t.test('rejects tampered body or invalid signature', () => {
    const tamperedBuffer = Buffer.from(JSON.stringify({ ...JSON.parse(payload), status: 'Declined' }), 'utf8');
    const isValid = verifyWebhook(tamperedBuffer, validSignature, String(now), secret, false);
    assert.strictEqual(isValid, false);
  });

  await t.test('rejects incorrect secret', () => {
    const isValid = verifyWebhook(rawBuffer, validSignature, String(now), 'wrong_secret_key', false);
    assert.strictEqual(isValid, false);
  });
});

test('Didit Exact Session Status Mappings (Phase 33)', async (t) => {
  assert.strictEqual(verificationStatus('Approved'), 'verified');
  assert.strictEqual(verificationStatus('Declined'), 'declined');
  assert.strictEqual(verificationStatus('In Review'), 'pending_review');
  assert.strictEqual(verificationStatus('In Progress'), 'in_progress');
  assert.strictEqual(verificationStatus('Resubmitted'), 'resubmitted');
  assert.strictEqual(verificationStatus('Abandoned'), 'abandoned');
  assert.strictEqual(verificationStatus('Awaiting User'), 'awaiting_user');
  assert.strictEqual(verificationStatus('Expired'), 'expired');
  assert.strictEqual(verificationStatus('Kyc Expired'), 'kyc_expired');
  assert.strictEqual(verificationStatus('Not Started'), 'not_started');
});

test('Didit Supported Webhook Types (Phase 32)', async (t) => {
  const expectedTypes = [
    'status.updated',
    'data.updated',
    'user.status.updated',
    'user.data.updated',
    'business.status.updated',
    'business.data.updated',
    'activity.created',
    'transaction.created',
    'transaction.status.updated',
    'travel_rule.status.updated'
  ];

  for (const type of expectedTypes) {
    assert.ok(DIDIT_WEBHOOK_EVENTS.includes(type as any), `Missing webhook type: ${type}`);
  }
});
