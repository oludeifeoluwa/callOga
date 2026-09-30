import { useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, House, MapPin, LoaderCircle, ShieldCheck } from 'lucide-react';
import { api, Me } from './api';
import { TwoToneStickHouse } from '../components/TwoToneStickHouse';
export function Onboarding({ me, onComplete }: { me: Me; onComplete: () => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(me.profile.full_name);
  const [area, setArea] = useState(me.profile.area);
  const [phone, setPhone] = useState(me.profile.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isArtisan = me.profile.role === 'artisan';
  async function finish(event: React.FormEvent) {
    event.preventDefault(); setError('');
    if (!name.trim()) { setError('Please enter your name.'); setStep(0); return; }
    if (step > 0 && (!area.trim() || !phone.trim())) { setError('Please add your neighbourhood and contact number.'); setStep(1); return; }
    if (step < 2) { setStep(step + 1); return; }
    setBusy(true);
    try { await api('/me', 'PATCH', { full_name: name.trim(), area: area.trim(), phone: phone.trim() }); await onComplete(); }
    catch (err: any) { setError(err.message || 'We couldn’t save your details. Please try again.'); }
    finally { setBusy(false); }
  }
  const progressLabels = isArtisan ? ['Introduce yourself', 'Service area', 'Build your business'] : ['Say hello', 'Your location', 'Find local help'];
  return <main className="hn-onboarding"><header className="hn-auth-header"><span className="hn-brand"><span className="hn-brand-symbol"><TwoToneStickHouse size={22}/></span>callOga<span className="hn-brand-period">.</span></span><span className="hn-onboarding-role">{isArtisan ? 'Artisan setup' : 'Customer setup'}</span></header><div className="hn-onboarding-progress" aria-label={`Setup step ${step + 1} of 3`}>{progressLabels.map((label, i) => <span className={i <= step ? 'active' : ''} key={label}><i>{i < step ? <Check size={12}/> : i + 1}</i>{label}</span>)}</div><section className="hn-onboarding-content" key={step}><div className={`hn-setup-object step-${step}`} aria-hidden="true">{step === 0 ? <House size={55}/> : step === 1 ? <MapPin size={55}/> : isArtisan ? <BriefcaseBusiness size={55}/> : <Check size={55}/>}</div><span className="hn-eyebrow">LET’S MAKE THIS YOURS</span><h1>{step === 0 ? 'First, what should we call you?' : step === 1 ? 'Where’s close to home?' : isArtisan ? `${name.trim().split(/\s+/)[0] || 'Your'} business starts here.` : `${name.trim().split(/\s+/)[0] || 'You'}, local help is ready.`}</h1><p>{step === 0 ? 'A real name makes the first hello a little easier.' : step === 1 ? 'Add your neighbourhood and a contact number for bookings and service updates.' : isArtisan ? 'Next, add your trade, pricing, work photos and location pin.' : 'Explore local professionals, compare profiles and start your first project.'}</p><form onSubmit={finish} className="hn-onboarding-form">
      {step === 0 && <label className="hn-field-label">Full name<input autoFocus name="full_name" autoComplete="name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="First and last name"/></label>}
      {step === 1 && <><label className="hn-field-label">Your neighbourhood<input autoFocus name="area" autoComplete="address-level2" required maxLength={120} value={area} onChange={e => setArea(e.target.value)} placeholder="Neighbourhood, city"/></label><label className="hn-field-label">Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your contact number"/></label><small className="hn-field-help">Your phone number is part of your account details, not a public directory listing.</small></>}
      {step === 2 && <><div className="hn-setup-summary"><span><House size={20}/><span><strong>{name}</strong><small>{isArtisan ? 'Artisan business workspace' : 'Customer workspace'}</small></span></span><span><MapPin size={20}/>{area}<button type="button" onClick={() => setStep(1)}>Edit</button></span></div><div className="hn-onboarding-next"><span><ShieldCheck size={16}/>{isArtisan ? 'Verification unlocks your public listing' : 'Verified profiles are clearly identified'}</span><span><MapPin size={16}/>{isArtisan ? 'Add a map pin from your business profile' : 'Nearby results use your neighbourhood'}</span></div></>}
      {error && <div className="hn-form-error" role="alert">{error}</div>}<div className="hn-onboarding-actions">{step > 0 && <button className="hn-button hn-button-quiet" type="button" disabled={busy} onClick={() => setStep(step - 1)}><ArrowLeft size={17}/>Back</button>}<button className="hn-button hn-button-blue hn-button-large" disabled={busy}>{busy && <LoaderCircle size={17} className="animate-spin"/>}{step === 2 ? isArtisan ? 'Set up my business' : 'Explore local artisans' : 'Continue'}<ArrowRight size={18}/></button></div></form></section><footer className="hn-onboarding-footer">Good work starts with a good introduction.</footer></main>;
}
