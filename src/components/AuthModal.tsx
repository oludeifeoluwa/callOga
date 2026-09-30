import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  User,
  Wrench,
  ArrowRight,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  KeyRound,
  Check,
  Circle,
  Building,
  GraduationCap
} from 'lucide-react';
import { storage } from '../lib/storage';
import { UserRole } from '../types';
import { validatePassword } from '../utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (role: UserRole) => void;
  initialMode?: AuthMode;
  initialEmail?: string;
  initialToken?: string;
  redirectUrl?: string;
}

export type AuthMode =
  | 'choose_method'
  | 'signup'
  | 'login'
  | 'verify_email'
  | 'forgot_password'
  | 'reset_password';

export type VerificationScreenState =
  | 'email_sent'
  | 'waiting'
  | 'verification_successful'
  | 'invalid_link'
  | 'expired_link'
  | 'already_verified'
  | 'request_failed'
  | 'rate_limited';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'choose_method',
  initialEmail = '',
  initialToken = '',
  redirectUrl = ''
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  // Verification state machine
  const [verificationState, setVerificationState] = useState<VerificationScreenState>('email_sent');
  const [verificationEmail, setVerificationEmail] = useState(initialEmail);
  const [activeVerificationToken, setActiveVerificationToken] = useState(initialToken);
  const [previewVerifyUrl, setPreviewVerifyUrl] = useState<string | null>(null);
  const [previewResetUrl, setPreviewResetUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // General feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Restore pending email verification on load or mode switch
  useEffect(() => {
    if (initialMode) setMode(initialMode);
    if (initialEmail) {
      setEmail(initialEmail);
      setVerificationEmail(initialEmail);
    }
    if (initialToken) {
      setActiveVerificationToken(initialToken);
      if (initialMode === 'verify_email') {
        handleExecuteEmailVerification(initialToken);
      }
    }
  }, [initialMode, initialEmail, initialToken, isOpen]);

  // Handle countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live password validation checklist
  const pwdValidation = validatePassword(password);

  if (!isOpen) return null;

  // ----------------------------------------------------
  // ACTION: Register Account
  // ----------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!pwdValidation.valid) {
      setErrorMsg('Please ensure your password fulfills all requirements below.');
      return;
    }

    setLoading(true);

    try {
      // Call authoritative server registration endpoint
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          password,
          role: selectedRole,
          phone: trimmedPhone
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Registration failed.');
      }

      // Sync with local client storage
      storage.registerUser({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        role: selectedRole,
        password
      });

      // Save pending verification email to sessionStorage
      sessionStorage.setItem('calloga_pending_verify_email', trimmedEmail);
      setVerificationEmail(trimmedEmail);
      setPreviewVerifyUrl(data.previewVerificationUrl || null);
      setVerificationState('email_sent');
      setResendCooldown(60);
      setMode('verify_email');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Execute Email Verification with Token
  // ----------------------------------------------------
  const handleExecuteEmailVerification = async (tokenToVerify?: string) => {
    const token = tokenToVerify || activeVerificationToken;
    if (!token) {
      setVerificationState('invalid_link');
      return;
    }

    setLoading(true);
    setVerificationState('waiting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.state === 'expired_link') {
          setVerificationState('expired_link');
          if (data.email) setVerificationEmail(data.email);
        } else if (data.state === 'already_verified') {
          setVerificationState('already_verified');
        } else {
          setVerificationState('invalid_link');
        }
        return;
      }

      setVerificationState('verification_successful');
      sessionStorage.removeItem('calloga_pending_verify_email');

      // Update client session
      if (data.user) {
        storage.login(data.user.email, password);
      }

      setTimeout(() => {
        onAuthSuccess(data.user?.role || selectedRole || 'customer');
        onClose();
      }, 1500);
    } catch (err: any) {
      setVerificationState('request_failed');
      setErrorMsg('Network error. Could not verify email.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Resend Verification Email
  // ----------------------------------------------------
  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    if (resendCooldown > 0) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.state === 'rate_limited') {
          setVerificationState('rate_limited');
          setResendCooldown(data.remainingSeconds || 60);
        } else if (data.state === 'already_verified') {
          setVerificationState('already_verified');
        } else {
          setErrorMsg(data.message || 'Could not resend email.');
        }
        return;
      }

      setResendCooldown(data.cooldownSeconds || 60);
      setPreviewVerifyUrl(data.previewVerificationUrl || null);
      setVerificationState('email_sent');
      setSuccessMsg('A new verification email has been sent ✓');
    } catch (err: any) {
      setErrorMsg('Failed to send verification email. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Sign In
  // ----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const query = email.trim();
    if (!query || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: query, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Handle unverified user gracefully (Phase 9)
        if (data.code === 'UNVERIFIED_EMAIL') {
          setVerificationEmail(data.email || query);
          setVerificationState('email_sent');
          setMode('verify_email');
          setErrorMsg("Your email hasn't been verified yet. Check your email or click resend.");
          return;
        }
        throw new Error(data.message || "We couldn't sign you in with those details.");
      }

      // Sync local storage session
      storage.login(query, password);

      onAuthSuccess(data.user?.role || 'customer');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Forgot Password Request
  // ----------------------------------------------------
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await res.json().catch(() => ({}));
      setPreviewResetUrl(data.previewResetUrl || null);
      setSuccessMsg(
        'If an account matches that email, password reset instructions have been sent.'
      );
    } catch (err: any) {
      setErrorMsg('Could not process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Reset Password Submit
  // ----------------------------------------------------
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!pwdValidation.valid) {
      setErrorMsg('Please fulfill all password requirements.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activeVerificationToken,
          newPassword: password
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Password reset link is invalid or expired.');
      }

      setSuccessMsg('Your password has been updated! Redirecting to sign in...');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Top Header & Close Button */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          {mode !== 'choose_method' ? (
            <button
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                if (mode === 'verify_email') setMode('signup');
                else if (mode === 'signup' || mode === 'login') setMode('choose_method');
                else setMode('login');
              }}
              className="p-1.5 -ml-1 text-stone-400 hover:text-stone-800 rounded-full transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="p-1.5 -mr-1 text-stone-400 hover:text-stone-800 rounded-full transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="px-8 pb-8 pt-2">
          {/* Notifications / Alerts */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 leading-relaxed font-semibold animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 1: CHOOSE METHOD */}
          {/* ======================================================== */}
          {mode === 'choose_method' && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-[11px] font-extrabold text-[#F97316] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>callOga Verified Platform</span>
                </div>
                <h1 className="text-2xl font-black text-[#0B0B0F] tracking-tight">
                  Welcome to callOga
                </h1>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Sign in or create an account to book verified artisans or offer your skilled craft.
                </p>
              </div>

              {/* Primary Email Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('signup');
                  }}
                  className="w-full py-3 px-4 bg-[#F97316] hover:bg-orange-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Continue with Email</span>
                </button>
              </div>

              {/* Sign in toggle */}
              <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('login');
                  }}
                  className="font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>

              {/* Legal Note */}
              <p className="text-[10px] text-center text-stone-400 leading-tight">
                By continuing, you agree to callOga's Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: SIGN UP WITH EMAIL & LIVE PASSWORD CHECKLIST     */}
          {/* ======================================================== */}
          {mode === 'signup' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-[#0B0B0F]">Create your account</h2>
                <p className="text-xs text-stone-500">
                  Join thousands across Nigeria using callOga.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  I want to join as
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('customer')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'customer'
                        ? 'border-[#F97316] bg-orange-50/60 ring-2 ring-orange-200'
                        : 'border-stone-200 bg-stone-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#0B0B0F]">
                      <User className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Customer</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">Book verified pros</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('artisan')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'artisan'
                        ? 'border-[#F97316] bg-orange-50/60 ring-2 ring-orange-200'
                        : 'border-stone-200 bg-stone-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#0B0B0F]">
                      <Wrench className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Artisan / Pro</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">Offer expert services</p>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Babatunde Adeleke"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0803 123 4567 (optional)"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Compact Live Password Checklist (Phase 3) */}
                  {password.length > 0 && (
                    <div
                      aria-live="polite"
                      className="mt-2.5 p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5 text-[11px]"
                    >
                      <span className="block font-bold text-stone-600 mb-1 text-[10px] uppercase">
                        Password Requirements:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            pwdValidation.length ? 'text-emerald-700 font-bold' : 'text-stone-500'
                          }`}
                        >
                          {pwdValidation.length ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          )}
                          <span>8+ characters</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            pwdValidation.hasUpper && pwdValidation.hasLower
                              ? 'text-emerald-700 font-bold'
                              : 'text-stone-500'
                          }`}
                        >
                          {pwdValidation.hasUpper && pwdValidation.hasLower ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          )}
                          <span>Upper & lowercase</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            pwdValidation.hasNumber ? 'text-emerald-700 font-bold' : 'text-stone-500'
                          }`}
                        >
                          {pwdValidation.hasNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          )}
                          <span>Number</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            pwdValidation.hasSpecial ? 'text-emerald-700 font-bold' : 'text-stone-500'
                          }`}
                        >
                          {pwdValidation.hasSpecial ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          )}
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !pwdValidation.valid}
                  className="w-full mt-2 py-3 px-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 text-xs text-stone-500 border-t border-stone-100">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('login');
                  }}
                  className="font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 3: DEDICATED VERIFY EMAIL SCREEN (14 States UX)     */}
          {/* ======================================================== */}
          {mode === 'verify_email' && (
            <div className="space-y-5 text-center">
              {/* Dynamic State Header */}
              {verificationState === 'verification_successful' ? (
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm animate-in zoom-in">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : verificationState === 'expired_link' ? (
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-orange-50 text-[#F97316] rounded-3xl flex items-center justify-center mx-auto border border-orange-200 shadow-sm">
                  <Mail className="w-8 h-8" />
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-1.5">
                {verificationState === 'verification_successful' ? (
                  <>
                    <h2 className="text-xl font-black text-[#0B0B0F]">Email verified!</h2>
                    <p className="text-xs text-stone-500">
                      Your email address has been verified. Welcome aboard!
                    </p>
                  </>
                ) : verificationState === 'expired_link' ? (
                  <>
                    <h2 className="text-xl font-black text-[#0B0B0F]">Verification link expired</h2>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      This link has expired for your security. Click below to receive a fresh verification email.
                    </p>
                  </>
                ) : verificationState === 'already_verified' ? (
                  <>
                    <h2 className="text-xl font-black text-[#0B0B0F]">Already verified</h2>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      This account is already verified. You can sign in immediately.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-black text-[#0B0B0F]">Check your email</h2>
                    <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                      We sent a secure verification link to{' '}
                      <span className="font-bold text-[#0B0B0F]">{verificationEmail || 'your email'}</span>.
                    </p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {verificationState === 'already_verified' ? (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full py-3 px-4 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                  >
                    Continue to Sign In
                  </button>
                ) : verificationState === 'verification_successful' ? (
                  <div className="p-3 bg-emerald-50 rounded-2xl text-xs font-bold text-emerald-800">
                    Redirecting to your dashboard...
                  </div>
                ) : (
                  <>
                    {/* Primary CTA: Open Email App */}
                    <button
                      type="button"
                      onClick={() => window.open('mailto:', '_blank')}
                      className="w-full py-3 px-4 bg-[#F97316] hover:bg-orange-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open email app</span>
                    </button>

                    {/* Secondary CTA: Resend Email with Countdown Cooldown */}
                    <button
                      type="button"
                      disabled={loading || resendCooldown > 0}
                      onClick={handleResendVerification}
                      className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 disabled:bg-stone-100 disabled:text-stone-400 border border-stone-200 text-xs font-bold text-stone-700 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : resendCooldown > 0 ? (
                        <span>Resend available in {resendCooldown}s</span>
                      ) : (
                        <span>Didn't receive it? Resend email</span>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Developer Instant Test Button */}
              {previewVerifyUrl && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>One-Click Verification Test</span>
                    </span>
                    <span className="text-[10px] text-blue-600 uppercase font-mono">Dev Sandbox</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const token = previewVerifyUrl.split('verify_email=')[1];
                      if (token) handleExecuteEmailVerification(token);
                    }}
                    className="w-full mt-1 py-1.5 px-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Simulate Email Click & Verify Account →
                  </button>
                </div>
              )}

              {/* Auxiliary actions */}
              <div className="pt-2 flex items-center justify-center gap-4 text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('calloga_pending_verify_email');
                    setMode('signup');
                  }}
                  className="font-semibold text-stone-600 hover:text-[#0B0B0F] hover:underline cursor-pointer"
                >
                  Change email address
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Return to sign in
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 4: SIGN IN (Phase 8 & 9)                            */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-[#0B0B0F]">Sign in to callOga</h2>
                <p className="text-xs text-stone-500">
                  Enter your credentials to access your dashboard.
                </p>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-2.5 text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  or sign in with email
                </span>
                <div className="border-t border-stone-200 w-full" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email or Phone</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com or 08031234567"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setSuccessMsg('');
                        setMode('forgot_password');
                      }}
                      className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 text-xs text-stone-500 border-t border-stone-100">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('signup');
                  }}
                  className="font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Create account
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 5: FORGOT PASSWORD (Phase 10)                       */}
          {/* ======================================================== */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-200">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-[#0B0B0F]">Reset your password</h2>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Enter the email address associated with your account and we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Sending link...' : 'Send reset link'}
                </button>
              </form>

              {previewResetUrl && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 block">Dev Simulation Link:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const token = previewResetUrl.split('reset_password=')[1];
                      if (token) {
                        setActiveVerificationToken(token);
                        setMode('reset_password');
                      }
                    }}
                    className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Open Password Reset Form →
                  </button>
                </div>
              )}

              <div className="text-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-stone-600 hover:text-[#0B0B0F] hover:underline cursor-pointer"
                >
                  Return to sign in
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 6: RESET PASSWORD WITH TOKEN                        */}
          {/* ======================================================== */}
          {mode === 'reset_password' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-[#0B0B0F]">Set new password</h2>
                <p className="text-xs text-stone-500">
                  Create a new strong password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                {/* Password checklist */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      pwdValidation.valid ? 'text-emerald-700 font-bold' : 'text-stone-500'
                    }`}
                  >
                    {pwdValidation.valid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    )}
                    <span>Meets complexity (8+ chars, upper, lower, number, special)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !pwdValidation.valid}
                  className="w-full py-3 px-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Updating password...' : 'Update Password & Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
