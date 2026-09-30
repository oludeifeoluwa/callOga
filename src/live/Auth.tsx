import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, House, Mail, ShieldCheck, Wrench, LoaderCircle } from 'lucide-react';
import { supabase } from './api';
import { TwoToneStickHouse } from '../components/TwoToneStickHouse';
export type AuthMode = 'login' | 'signup' | 'reset' | 'update';
export type AccountRole = 'customer' | 'artisan';
export function AuthScreen({ initialMode = 'login', initialRole, onBack, onMode, onSuccess }: { initialMode?: AuthMode; initialRole?: AccountRole; onBack: () => void; onMode?: (mode: AuthMode) => void; onSuccess: () => void | Promise<void> }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<AccountRole | undefined>(initialRole);
  const [step, setStep] = useState(initialRole ? 1 : 0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { window.scrollTo(0, 0); }, []);
  function change(next: AuthMode) { setError(''); setNotice(''); setPassword(''); if (onMode) onMode(next); else setMode(next); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if (!supabase) { setError('We couldn’t connect to the account service. Please try again shortly.'); return; }
    if (mode === 'signup' && !role) { setStep(0); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), role }, emailRedirectTo: location.origin } });
        if (result.error) throw result.error;
        if (result.data.session) await onSuccess();
        else setNotice('We’ve sent a confirmation link to your email. Open it to activate your account, then sign in to finish setting up.');
      } else if (mode === 'reset') {
        const result = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/?recovery=1` });
        if (result.error) throw result.error;
        setNotice('If that email has an account, a password reset link is on its way. Check your inbox and spam folder.');
      } else if (mode === 'update') {
        const result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        await onSuccess();
      } else {
        const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (result.error) throw result.error;
        await onSuccess();
      }
    } catch (err: any) { setError(err.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }
  const choosing = mode === 'signup' && step === 0;
  const title = choosing ? 'What brings you here?' : mode === 'signup' ? 'Make yourself at home.' : mode === 'reset' ? 'Let’s get you back in.' : mode === 'update' ? 'A fresh start.' : 'Good to have you back.';
  return <main className="hn-auth-page"><header className="hn-auth-header"><a className="hn-brand" href="#home" onClick={event => { event.preventDefault(); onBack(); }}><span className="hn-brand-symbol"><TwoToneStickHouse size={22}/></span>callOga<span className="hn-brand-period">.</span></a><span>GOOD WORK STARTS HERE</span></header><div className="hn-auth-layout">
    <section className="hn-auth-form-panel"><button className="hn-back" onClick={() => { if (mode === 'signup' && step === 1) setStep(0); else onBack(); }}><ArrowLeft size={17}/>{mode === 'signup' && step === 1 ? 'Change my choice' : 'Back to home'}</button>
      <div className="hn-auth-content"><div className="hn-auth-emblem"><House size={28}/><span/></div><span className="hn-eyebrow">{mode === 'signup' ? `LET’S GET ACQUAINTED · ${choosing ? '1' : '2'} OF 2` : mode === 'login' ? 'YOUR CALLOGA ACCOUNT' : 'ACCOUNT RECOVERY'}</span><h1>{title}</h1><p className="hn-auth-intro">{choosing ? 'A home to look after or a craft to share? Let’s make this yours.' : mode === 'signup' ? 'A few details, and you’re one step closer to your next good connection.' : mode === 'reset' ? 'Enter your email and we’ll help you reset your password.' : mode === 'update' ? 'Choose a new password to keep your account secure.' : 'Your people, your projects, and your next step. All right here.'}</p>
      {choosing ? <div className="hn-role-choices"><button className={role === 'customer' ? 'selected' : ''} aria-pressed={role === 'customer'} onClick={() => setRole('customer')}><span className="hn-role-icon blue"><House size={28}/></span><span><strong>Find a helping hand</strong><small>I want to book an artisan for a project.</small></span><span className="hn-role-check">{role === 'customer' && <Check size={15}/>}</span></button><button className={role === 'artisan' ? 'selected' : ''} aria-pressed={role === 'artisan'} onClick={() => setRole('artisan')}><span className="hn-role-icon lilac"><Wrench size={28}/></span><span><strong>Share my skills</strong><small>I want to offer services and grow my craft.</small></span><span className="hn-role-check">{role === 'artisan' && <Check size={15}/>}</span></button><button className="hn-button hn-button-blue hn-auth-submit" disabled={!role} onClick={() => setStep(1)}>Continue<ArrowRight size={18}/></button></div> : <form className="hn-auth-form" onSubmit={submit}>
        {mode === 'signup' && <label>Your full name<input value={name} onChange={e => setName(e.target.value)} name="name" autoComplete="name" placeholder="First and last name" required maxLength={120}/></label>}
        {mode !== 'update' && <label>Email address<div className="hn-input-wrap"><Mail size={17}/><input value={email} onChange={e => setEmail(e.target.value)} name="email" type="email" autoComplete="email" placeholder="you@example.com" required/></div></label>}
        {mode !== 'reset' && <label>{mode === 'update' ? 'New password' : 'Password'}<div className="hn-input-wrap hn-password"><input value={password} onChange={e => setPassword(e.target.value)} name="password" type={visible ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}/><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>}
        {mode === 'login' && <button type="button" className="hn-forgot" onClick={() => change('reset')}>Forgot your password?</button>}
        {error && <div className="hn-form-error" role="alert">{error}</div>}{notice && <div className="hn-form-notice" role="status"><Mail size={20}/><span>{notice}</span></div>}
        <button className="hn-button hn-button-blue hn-auth-submit" disabled={busy || (mode === 'signup' && Boolean(notice))}>{busy && <LoaderCircle size={18} className="animate-spin"/>}{mode === 'signup' ? 'Create my account' : mode === 'reset' ? 'Send reset link' : mode === 'update' ? 'Save new password' : 'Sign in'}<ArrowRight size={18}/></button>
      </form>}
      {mode !== 'update' && <p className="hn-auth-switch">{mode === 'login' ? 'New around here?' : 'Already have an account?'} <button onClick={() => change(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>}
      <p className="hn-auth-safety"><ShieldCheck size={15}/> Your password is private. Your workspace is yours.</p></div>
    </section>
    <aside className="hn-auth-story"><div className="hn-auth-story-top"><span className="hn-eyebrow">GOOD WORK. CLOSER TO HOME.</span><h2>A little connection.<br/>A world of possibility.</h2><p>The right people make the everyday easier.</p></div><img src="/images/electrician.jpg" alt="A professional electrician working on an installation"/><div className="hn-auth-story-bottom"><span><ShieldCheck size={20}/></span><div><strong>Build confidence from the first hello.</strong><p>Explore profiles, agree on the details, and keep your conversation with the job.</p></div></div></aside>
  </div></main>;
}
