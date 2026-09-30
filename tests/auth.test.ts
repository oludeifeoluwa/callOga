import test from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../src/lib/storage.js';

test('Authentication - Registration Validation', async (t) => {
  await t.test('rejects registration with invalid name', () => {
    const res = storage.registerUser({
      fullName: 'A',
      email: 'valid@example.com',
      phone: '08012345678',
      role: 'customer',
      password: 'password123'
    });
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /full name/i);
  });

  await t.test('rejects registration with invalid email', () => {
    const res = storage.registerUser({
      fullName: 'Valid User',
      email: 'not-an-email',
      phone: '08012345678',
      role: 'customer',
      password: 'password123'
    });
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /valid email/i);
  });

  await t.test('rejects registration with invalid phone', () => {
    const res = storage.registerUser({
      fullName: 'Valid User',
      email: 'valid2@example.com',
      phone: '123',
      role: 'customer',
      password: 'password123'
    });
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /valid.*phone/i);
  });

  await t.test('rejects registration with short password', () => {
    const res = storage.registerUser({
      fullName: 'Valid User',
      email: 'valid3@example.com',
      phone: '08012345678',
      role: 'customer',
      password: '123'
    });
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /6 characters/i);
  });
});

test('Authentication - Registration & Duplicate Prevention', async (t) => {
  const uniqueEmail = `testuser_${Date.now()}@test.ng`;
  const uniquePhone = `080${Math.floor(10000000 + Math.random() * 90000000)}`;

  await t.test('successfully registers customer account', () => {
    const res = storage.registerUser({
      fullName: 'Tunde Bakare',
      email: uniqueEmail,
      phone: uniquePhone,
      role: 'customer',
      password: 'Password123!'
    });
    assert.strictEqual(res.success, true);
    assert.ok(res.user);
    assert.strictEqual(res.user?.email, uniqueEmail.toLowerCase());
    assert.strictEqual(res.user?.role, 'customer');

    const currentUser = storage.getCurrentUser();
    assert.strictEqual(currentUser?.id, res.user?.id);
  });

  await t.test('prevents duplicate email registration', () => {
    const res = storage.registerUser({
      fullName: 'Another Name',
      email: uniqueEmail,
      phone: '09099887766',
      role: 'customer',
      password: 'Password123!'
    });
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /email address already exists/i);
  });

  await t.test('prevents duplicate phone registration', () => {
    const res = storage.registerUser({
      fullName: 'Another Name',
      email: `another_${Date.now()}@test.ng`,
      phone: uniquePhone,
      role: 'customer',
      password: 'Password123!'
    });
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /phone number already exists/i);
  });
});

test('Authentication - Sign In & Session Handling', async (t) => {
  const testEmail = `signin_${Date.now()}@test.ng`;
  const testPhone = `070${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = 'SecurePassword456!';

  storage.registerUser({
    fullName: 'Grace Oladipo',
    email: testEmail,
    phone: testPhone,
    role: 'customer',
    password: testPassword
  });

  await t.test('fails with wrong email or phone', () => {
    const res = storage.login('nonexistent@domain.com', testPassword);
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /no account found/i);
  });

  await t.test('fails with wrong password', () => {
    const res = storage.login(testEmail, 'wrong-password-here');
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /incorrect password/i);
  });

  await t.test('succeeds with correct email and password', () => {
    const res = storage.login(testEmail, testPassword);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user?.email, testEmail.toLowerCase());
    assert.strictEqual(storage.getCurrentUser()?.id, res.user?.id);
  });

  await t.test('succeeds with phone number and password', () => {
    const res = storage.login(testPhone, testPassword);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user?.phone, testPhone);
    assert.strictEqual(storage.getCurrentUser()?.id, res.user?.id);
  });

  await t.test('logout clears active session', () => {
    storage.logout();
    assert.strictEqual(storage.getCurrentUser(), null);
  });
});
