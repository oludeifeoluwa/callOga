import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Phone,
  Wrench,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Check,
  Circle,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Star
} from 'lucide-react';
import { storage } from '../lib/storage';
import { UserRole } from '../types';
import { validatePassword } from '../utils/validation';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type AuthPageMode =
  | 'choose_method'
  | 'signup'
  | 'login'
  | 'verify_email'
  | 'forgot_password'
  | 'reset_password';

type VerificationState =
  | 'email_sent'
  | 'waiting'
  | 'verification_successful'
  | 'invalid_link'
  | 'expired_link'
  | 'already_verified'
  | 'request_failed'
  | 'rate_limited';

interface AuthPageProps {
  initialMode?: AuthPageMode;
  initialToken?: string;
  initialEmail?: string;
  onAuthSuccess: (role: UserRole) => void;
  onNavigateBack?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

/** Animated left-side brand panel */
const BrandPanel: React.FC<{ mode: AuthPageMode }> = ({ mode }) => {
  const testimonials = [
    {
      quote: 'Found a certified electrician in 20 minutes. Total lifesaver.',
      author: 'Amina B.',
      role: 'Lagos Customer',
      rating: 5,
    },
    {
      quote: 'My bookings doubled within a month of joining callOga.',
      author: 'Chinedu O.',
      role: 'Verified Plumber',
      rating: 5,
    },
    {
      quote: 'Trusted, fast, and transparent. This is how it should work.',
      author: 'Funke A.',
      role: 'Abuja Customer',
      rating: 5,
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Verified Artisans', value: '12,000+' },
    { label: 'Cities Covered', value: '36' },
    { label: 'Jobs Completed', value: '94K+' },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-12 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0F] via-[#1a1a2e] to-[#0d1117]" />
      {/* Subtle orange accent glow */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#F97316]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#F97316] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">callOga</span>
        </div>

        {/* Headline */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[11px] font-bold text-orange-300 backdrop-blur-sm">
            <Shield className="w-3 h-3" />
            <span>Nigeria's #1 Verified Artisan Platform</span>
          </div>
          <h2 className="text-4xl font-black leading-[1.1] tracking-tight">
            {mode === 'login' ? (
              <>Welcome<br />back.</>
            ) : mode === 'signup' || mode === 'choose_method' ? (
              <>Find. Book.<br />Trust.</>
            ) : (
              <>Secure.<br />Verified.</>
            )}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Connect with identity-verified skilled artisans across Nigeria — plumbers, electricians, tailors, and more.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-[#F97316]">{s.value}</div>
              <div className="text-[11px] text-white/50 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Carousel */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="p-6 bg-white/8 backdrop-blur-md border border-white/12 rounded-3xl"
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
              ))}
            </div>
            <p className="text-sm text-white/90 font-medium leading-relaxed mb-4">
              "{testimonials[activeTestimonial].quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F97316]/20 border border-[#F97316]/30 rounded-full flex items-center justify-center text-[11px] font-black text-[#F97316]">
                {testimonials[activeTestimonial].author[0]}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{testimonials[activeTestimonial].author}</div>
                <div className="text-[10px] text-white/50">{testimonials[activeTestimonial].role}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center gap-1.5 mt-4 justify-center">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTestimonial(i)}
              className={`transition-all rounded-full cursor-pointer ${
                i === activeTestimonial ? 'w-5 h-1.5 bg-[#F97316]' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Location badge */}
      <div className="relative z-10 mt-6 flex items-center gap-2 text-[11px] text-white/40">
        <MapPin className="w-3 h-3" />
        <span>Serving Lagos • Abuja • Port Harcourt • Kano and 32+ more cities</span>
      </div>
    </div>
  );
};

/** Reusable field wrapper */
const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-stone-700">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-stone-400">{hint}</p>}
  </div>
);

/** Icon input wrapper */
const IconInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  trailing?: React.ReactNode;
}> = ({ icon, trailing, className = '', ...props }) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
      {icon}
    </span>
    <input
      {...props}
      className={`w-full pl-10 ${trailing ? 'pr-11' : 'pr-4'} py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all ${className}`}
    />
    {trailing && (
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</span>
    )}
  </div>
);

/** Alert banner */
const AlertBanner: React.FC<{ type: 'error' | 'success'; message: string }> = ({ type, message }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-start gap-3 p-4 rounded-2xl text-sm font-medium leading-snug ${
      type === 'error'
        ? 'bg-red-50 border border-red-200 text-red-700'
        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
    }`}
    role={type === 'error' ? 'alert' : 'status'}
  >
    {type === 'error'
      ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
    }
    <span>{message}</span>
  </motion.div>
);

/** Password strength checklist */
const PasswordChecklist: React.FC<{ password: string }> = ({ password }) => {
  const v = validatePassword(password);
  if (!password) return null;

  const rules = [
    { label: '8+ characters', pass: v.length },
    { label: 'Uppercase & lowercase', pass: v.hasUpper && v.hasLower },
    { label: 'Number', pass: v.hasNumber },
    { label: 'Special character', pass: v.hasSpecial },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="p-4 bg-stone-50 border border-stone-200 rounded-2xl"
      aria-live="polite"
    >
      <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
        Password Requirements
      </span>
      <div className="grid grid-cols-2 gap-2">
        {rules.map((r) => (
          <div
            key={r.label}
            className={`flex items-center gap-2 text-xs font-medium ${
              r.pass ? 'text-emerald-700' : 'text-stone-400'
            }`}
          >
            {r.pass
              ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            }
            <span>{r.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/** Primary CTA button */
const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
}> = ({ loading, loadingText, children, className = '', disabled, ...props }) => (
  <button
    {...props}
    disabled={loading || disabled}
    className={`w-full py-3.5 px-6 bg-[#F97316] hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl shadow-md shadow-orange-200 transition-all flex items-center justify-center gap-2 cursor-pointer ${className}`}
  >
    {loading ? (
      <>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>{loadingText || 'Please wait...'}</span>
      </>
    ) : children}
  </button>
);

/** Divider with label */
const OrDivider: React.FC<{ label?: string }> = ({ label = 'or' }) => (
  <div className="relative flex items-center">
    <div className="flex-1 border-t border-stone-200" />
    <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-white">
      {label}
    </span>
    <div className="flex-1 border-t border-stone-200" />
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main AuthPage Component
// ─────────────────────────────────────────────────────────────
export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'choose_method',
  initialToken = '',
  initialEmail = '',
  onAuthSuccess,
  onNavigateBack,
}) => {
  const [mode, setMode] = useState<AuthPageMode>(initialMode);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);

  const [verificationState, setVerificationState] = useState<VerificationState>('email_sent');
  const [verificationEmail, setVerificationEmail] = useState(initialEmail);
  const [activeToken, setActiveToken] = useState(initialToken);
  const [previewVerifyUrl, setPreviewVerifyUrl] = useState<string | null>(null);
  const [previewResetUrl, setPreviewResetUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdValidation = validatePassword(password);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (initialMode === 'verify_email' && initialToken) {
      handleEmailVerification(initialToken);
    }
  }, []);

  const clearAlerts = () => { setErrorMsg(''); setSuccessMsg(''); };

  const navigate = (m: AuthPageMode) => { clearAlerts(); setMode(m); };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    const name = fullName.trim();
    const em = email.trim().toLowerCase();
    const ph = phone.trim();
    if (name.length < 2) { setErrorMsg('Please enter your full name (at least 2 characters).'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setErrorMsg('Please enter a valid email address.'); return; }
    if (!pwdValidation.valid) { setErrorMsg('Please satisfy all password requirements before continuing.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email: em, password, role: selectedRole, phone: ph }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'Registration failed.');
      storage.registerUser({ fullName: name, email: em, phone: ph, role: selectedRole, password });
      sessionStorage.setItem('calloga_pending_verify_email', em);
      setVerificationEmail(em);
      setPreviewVerifyUrl(data.previewVerificationUrl || null);
      setVerificationState('email_sent');
      setResendCooldown(60);
      navigate('verify_email');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = useCallback(async (tokenArg?: string) => {
    const token = tokenArg || activeToken;
    if (!token) { setVerificationState('invalid_link'); return; }
    setLoading(true);
    setVerificationState('waiting');
    clearAlerts();
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.state === 'expired_link') { setVerificationState('expired_link'); if (data.email) setVerificationEmail(data.email); }
        else if (data.state === 'already_verified') { setVerificationState('already_verified'); }
        else { setVerificationState('invalid_link'); }
        return;
      }
      setVerificationState('verification_successful');
      sessionStorage.removeItem('calloga_pending_verify_email');
      if (data.user) storage.login(data.user.email, password);
      setTimeout(() => onAuthSuccess(data.user?.role || selectedRole || 'customer'), 1600);
    } catch {
      setVerificationState('request_failed');
      setErrorMsg('Network error. Could not verify email.');
    } finally {
      setLoading(false);
    }
  }, [activeToken, password, selectedRole, onAuthSuccess]);

  const handleResend = async () => {
    if (!verificationEmail || resendCooldown > 0) return;
    setLoading(true);
    clearAlerts();
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.state === 'rate_limited') { setVerificationState('rate_limited'); setResendCooldown(data.remainingSeconds || 60); }
        else if (data.state === 'already_verified') { setVerificationState('already_verified'); }
        else { setErrorMsg(data.message || 'Could not resend email.'); }
        return;
      }
      setResendCooldown(data.cooldownSeconds || 60);
      setPreviewVerifyUrl(data.previewVerificationUrl || null);
      setVerificationState('email_sent');
      setSuccessMsg('A fresh verification email has been sent ✓');
    } catch {
      setErrorMsg('Failed to send verification email. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    const query = email.trim();
    if (!query || !password) { setErrorMsg('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: query, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === 'UNVERIFIED_EMAIL') {
          setVerificationEmail(data.email || query);
          setVerificationState('email_sent');
          navigate('verify_email');
          setErrorMsg("Your email hasn't been verified. Check your inbox or resend.");
          return;
        }
        throw new Error(data.message || "We couldn't sign you in with those details.");
      }
      storage.login(query, password);
      onAuthSuccess(data.user?.role || 'customer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!email.trim()) { setErrorMsg('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      setPreviewResetUrl(data.previewResetUrl || null);
      setSuccessMsg('If an account matches that email, password reset instructions have been sent.');
    } catch {
      setErrorMsg('Could not process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    if (!pwdValidation.valid) { setErrorMsg('Please fulfill all password requirements.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Password reset link is invalid or expired.');
      setSuccessMsg('Your password has been updated! Redirecting to sign in...');
      setTimeout(() => { navigate('login'); setPassword(''); setConfirmPassword(''); }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  const backTarget: AuthPageMode | null = (() => {
    if (mode === 'signup') return 'choose_method';
    if (mode === 'login') return 'choose_method';
    if (mode === 'verify_email') return 'signup';
    if (mode === 'forgot_password') return 'login';
    if (mode === 'reset_password') return 'login';
    return null;
  })();

  const pageTitle: Record<AuthPageMode, string> = {
    choose_method: 'Get started',
    signup: 'Create account',
    login: 'Sign in',
    verify_email: 'Verify email',
    forgot_password: 'Reset password',
    reset_password: 'New password',
  };

  // ── Screen: Choose Method ──────────────────────────────────
  const renderChooseMethod = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-[11px] font-bold text-[#F97316]">
          <Shield className="w-3 h-3" />
          <span>callOga Verified Platform</span>
        </div>
        <h1 className="text-3xl font-black text-[#0B0B0F] tracking-tight leading-tight">
          Welcome to<br />callOga
        </h1>
        <p className="text-sm text-stone-500 leading-relaxed">
          Sign in or create an account to book verified artisans or offer your skilled craft.
        </p>
      </div>
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-stone-200" />
        <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-white">or</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>
      <div className="space-y-2.5">
        <PrimaryButton onClick={() => navigate('signup')}>
          <Mail className="w-4 h-4" />
          <span>Continue with Email</span>
        </PrimaryButton>
        <button type="button" onClick={() => navigate('login')}
          className="w-full py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold rounded-2xl transition-all cursor-pointer">
          Sign in to existing account
        </button>
      </div>
      <p className="text-[11px] text-center text-stone-400 leading-relaxed">
        By continuing, you agree to callOga's{' '}
        <a href="#" className="underline hover:text-stone-600">Terms of Service</a>{' '}and{' '}
        <a href="#" className="underline hover:text-stone-600">Privacy Policy</a>.
      </p>
    </div>
  );

  // ── Screen: Sign Up ────────────────────────────────────────
  const renderSignUp = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0B0B0F] tracking-tight">Create your account</h1>
        <p className="text-sm text-stone-500 mt-1">Join thousands of Nigerians using callOga.</p>
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">I want to join as</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { role: 'customer' as UserRole, icon: User, label: 'Customer', sub: 'Book verified pros' },
            { role: 'artisan' as UserRole, icon: Wrench, label: 'Artisan / Pro', sub: 'Offer expert services' },
          ] as const).map(({ role, icon: Icon, label, sub }) => (
            <button key={role} type="button" onClick={() => setSelectedRole(role)}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${selectedRole === role ? 'border-[#F97316] bg-orange-50/70 shadow-sm' : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'}`}>
              <Icon className={`w-5 h-5 mb-2 ${selectedRole === role ? 'text-[#F97316]' : 'text-stone-400'}`} />
              <div className="font-bold text-sm text-[#0B0B0F]">{label}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">Full Legal Name</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><User className="w-4 h-4" /></span>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Babatunde Adeleke" autoComplete="name"
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">Email Address</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Mail className="w-4 h-4" /></span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">Phone Number <span className="font-normal text-stone-400">(optional)</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Phone className="w-4 h-4" /></span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="0803 123 4567" autoComplete="tel"
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Lock className="w-4 h-4" /></span>
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password" autoComplete="new-password"
              className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl" aria-live="polite">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Password Requirements</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '8+ characters', pass: pwdValidation.length },
                  { label: 'Upper & lowercase', pass: pwdValidation.hasUpper && pwdValidation.hasLower },
                  { label: 'Number', pass: pwdValidation.hasNumber },
                  { label: 'Special character', pass: pwdValidation.hasSpecial },
                ].map((r) => (
                  <div key={r.label} className={`flex items-center gap-2 text-xs font-medium ${r.pass ? 'text-emerald-700' : 'text-stone-400'}`}>
                    {r.pass ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />}
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <PrimaryButton type="submit" loading={loading} loadingText="Creating account..." disabled={!pwdValidation.valid}>
          <span>Continue to Verification</span>
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </form>
      <div className="text-center text-sm text-stone-500">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('login')} className="font-bold text-[#2563EB] hover:underline cursor-pointer">Sign in</button>
      </div>
    </div>
  );

  // ── Screen: Verify Email ────────────────────────────────────
  const renderVerifyEmail = () => {
    const isSuccess = verificationState === 'verification_successful';
    const isExpired = verificationState === 'expired_link';
    const isAlreadyVerified = verificationState === 'already_verified';
    const isWaiting = verificationState === 'waiting';
    return (
      <div className="space-y-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div key={verificationState} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="mx-auto">
            {isSuccess ? (
              <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
            ) : isExpired ? (
              <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm"><AlertCircle className="w-10 h-10 text-amber-600" /></div>
            ) : isWaiting ? (
              <div className="w-20 h-20 bg-blue-50 border-2 border-blue-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm"><RefreshCw className="w-10 h-10 text-blue-600 animate-spin" /></div>
            ) : (
              <div className="w-20 h-20 bg-orange-50 border-2 border-orange-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm"><Mail className="w-10 h-10 text-[#F97316]" /></div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="space-y-2">
          {isSuccess && <><h1 className="text-2xl font-black text-[#0B0B0F]">Email verified!</h1><p className="text-sm text-stone-500">Your email address has been verified. Welcome aboard!</p></>}
          {isExpired && <><h1 className="text-2xl font-black text-[#0B0B0F]">Link expired</h1><p className="text-sm text-stone-500 max-w-xs mx-auto">This link has expired for your security. Request a fresh one below.</p></>}
          {isAlreadyVerified && <><h1 className="text-2xl font-black text-[#0B0B0F]">Already verified</h1><p className="text-sm text-stone-500">This account is already verified. You can sign in now.</p></>}
          {isWaiting && <><h1 className="text-2xl font-black text-[#0B0B0F]">Verifying...</h1><p className="text-sm text-stone-500">Please wait while we verify your email.</p></>}
          {!isSuccess && !isExpired && !isAlreadyVerified && !isWaiting && (
            <><h1 className="text-2xl font-black text-[#0B0B0F]">Check your email</h1>
            <p className="text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
              We sent a secure verification link to{' '}<span className="font-bold text-[#0B0B0F]">{verificationEmail || 'your email'}</span>.
            </p></>
          )}
        </div>
        {isAlreadyVerified && <PrimaryButton onClick={() => navigate('login')}>Continue to Sign In</PrimaryButton>}
        {isSuccess && <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-800">Redirecting to your dashboard...</div>}
        {!isSuccess && !isAlreadyVerified && !isWaiting && (
          <div className="space-y-3">
            <button type="button" onClick={() => window.open('mailto:', '_blank')}
              className="w-full py-3.5 px-6 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-bold rounded-2xl shadow-md shadow-orange-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <ExternalLink className="w-4 h-4" /><span>Open email app</span>
            </button>
            <button type="button" disabled={loading || resendCooldown > 0} onClick={handleResend}
              className="w-full py-3.5 px-6 bg-white hover:bg-stone-50 disabled:bg-stone-100 disabled:text-stone-400 border border-stone-200 text-sm font-bold text-stone-700 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
              {loading ? (<><RefreshCw className="w-4 h-4 animate-spin" /><span>Sending...</span></>) : resendCooldown > 0 ? (<span>Resend available in {resendCooldown}s</span>) : (<span>Didn't receive it? Resend email</span>)}
            </button>
          </div>
        )}
        {previewVerifyUrl && !isSuccess && (
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500" />One-Click Verification Test</span>
              <span className="text-[10px] font-mono text-blue-600 uppercase bg-blue-100 px-2 py-0.5 rounded-full">Dev Sandbox</span>
            </div>
            <button type="button" onClick={() => { const token = previewVerifyUrl.split('verify_email=')[1]; if (token) handleEmailVerification(token); }}
              className="w-full py-2 px-4 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
              Simulate Email Click & Verify Account →
            </button>
          </div>
        )}
        {!isSuccess && (
          <div className="flex items-center justify-center gap-5 text-sm">
            <button type="button" onClick={() => { sessionStorage.removeItem('calloga_pending_verify_email'); navigate('signup'); }}
              className="font-semibold text-stone-500 hover:text-[#0B0B0F] hover:underline cursor-pointer">Change email</button>
            <span className="text-stone-300">·</span>
            <button type="button" onClick={() => navigate('login')} className="font-semibold text-[#2563EB] hover:underline cursor-pointer">Return to sign in</button>
          </div>
        )}
      </div>
    );
  };

  // ── Screen: Sign In ────────────────────────────────────────
  const renderLogin = () => (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-[#0B0B0F] tracking-tight">Sign in</h1><p className="text-sm text-stone-500 mt-1">Enter your credentials to access your dashboard.</p></div>
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-stone-200" />
        <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-white">or sign in with email</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">Email or Phone</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Mail className="w-4 h-4" /></span>
            <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com or 08031234567" autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-stone-700">Password</label>
            <button type="button" onClick={() => navigate('forgot_password')} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">Forgot password?</button>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Lock className="w-4 h-4" /></span>
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
              className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <PrimaryButton type="submit" loading={loading} loadingText="Signing in...">
          <span>Sign In</span><ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </form>
      <div className="text-center text-sm text-stone-500">
        Don't have an account?{' '}
        <button type="button" onClick={() => navigate('signup')} className="font-bold text-[#2563EB] hover:underline cursor-pointer">Create account</button>
      </div>
    </div>
  );

  // ── Screen: Forgot Password ────────────────────────────────
  const renderForgotPassword = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="w-14 h-14 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center"><KeyRound className="w-7 h-7 text-[#2563EB]" /></div>
        <h1 className="text-2xl font-black text-[#0B0B0F]">Reset your password</h1>
        <p className="text-sm text-stone-500 leading-relaxed max-w-xs">Enter the email address associated with your account and we'll send you reset instructions.</p>
      </div>
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">Email Address</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Mail className="w-4 h-4" /></span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
          </div>
        </div>
        <PrimaryButton type="submit" loading={loading} loadingText="Sending link...">Send reset link</PrimaryButton>
      </form>
      {previewResetUrl && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-amber-900">Dev Sandbox — Reset Link:</span>
          <button type="button" onClick={() => { const token = previewResetUrl.split('reset_password=')[1]; if (token) { setActiveToken(token); navigate('reset_password'); } }}
            className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
            Open Password Reset Form →
          </button>
        </div>
      )}
      <div className="text-center">
        <button type="button" onClick={() => navigate('login')} className="text-sm font-bold text-stone-500 hover:text-[#0B0B0F] hover:underline cursor-pointer">Return to sign in</button>
      </div>
    </div>
  );

  // ── Screen: Reset Password ─────────────────────────────────
  const renderResetPassword = () => (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-[#0B0B0F]">Set new password</h1><p className="text-sm text-stone-500 mt-1">Create a new strong password for your account.</p></div>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">New Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Lock className="w-4 h-4" /></span>
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
              className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl" aria-live="polite">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Password Requirements</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '8+ characters', pass: pwdValidation.length },
                  { label: 'Upper & lowercase', pass: pwdValidation.hasUpper && pwdValidation.hasLower },
                  { label: 'Number', pass: pwdValidation.hasNumber },
                  { label: 'Special character', pass: pwdValidation.hasSpecial },
                ].map((r) => (
                  <div key={r.label} className={`flex items-center gap-2 text-xs font-medium ${r.pass ? 'text-emerald-700' : 'text-stone-400'}`}>
                    {r.pass ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />}
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">Confirm New Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"><Lock className="w-4 h-4" /></span>
            <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 transition-all" />
          </div>
          {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-500 font-medium mt-1">Passwords do not match</p>}
        </div>
        <PrimaryButton type="submit" loading={loading} loadingText="Updating password..." disabled={!pwdValidation.valid || password !== confirmPassword}>
          Update Password & Sign In
        </PrimaryButton>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (mode) {
      case 'choose_method': return renderChooseMethod();
      case 'signup': return renderSignUp();
      case 'verify_email': return renderVerifyEmail();
      case 'login': return renderLogin();
      case 'forgot_password': return renderForgotPassword();
      case 'reset_password': return renderResetPassword();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* Left: brand panel (desktop only) */}
      <div className="hidden lg:block w-[440px] shrink-0 h-full">
        <BrandPanel mode={mode} />
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Top nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          {backTarget ? (
            <button type="button" onClick={() => navigate(backTarget)}
              className="flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-[#0B0B0F] transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" /><span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 lg:opacity-0 pointer-events-none">
              <div className="w-7 h-7 bg-[#F97316] rounded-xl flex items-center justify-center"><Wrench className="w-4 h-4 text-white" /></div>
              <span className="text-sm font-black text-[#0B0B0F]">callOga</span>
            </div>
          )}
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{pageTitle[mode]}</span>
          {onNavigateBack ? (
            <button type="button" onClick={onNavigateBack} className="text-sm font-semibold text-stone-400 hover:text-stone-700 transition-colors cursor-pointer">✕ Close</button>
          ) : (
            <div className="w-16" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex items-start justify-center pt-10 pb-16 px-6">
          <div className="w-full max-w-md">
            <AnimatePresence>
              {errorMsg && <div className="mb-6"><motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 rounded-2xl text-sm font-medium leading-snug bg-red-50 border border-red-200 text-red-700" role="alert"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errorMsg}</span></motion.div></div>}
              {successMsg && <div className="mb-6"><motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 rounded-2xl text-sm font-medium leading-snug bg-emerald-50 border border-emerald-200 text-emerald-700" role="status"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{successMsg}</span></motion.div></div>}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-stone-100 text-center text-[11px] text-stone-400">
          © {new Date().getFullYear()} callOga · All rights reserved
        </div>
      </div>
    </div>
  );
};
