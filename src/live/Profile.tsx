import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, MapPin, Star, ShieldCheck, PhoneCall, MessageSquare, CheckCircle2, Zap } from 'lucide-react';
import { api, Artisan, currency, Job } from './api';
import { Avatar, Badge, Button, FormError, Modal, SectionTitle } from './ui';
import { MapView } from './Map';

export function ArtisanProfile({ initial, mapToken, onBack, onBooked }: { initial: Artisan; mapToken: string; onBack: () => void; onBooked: (job: Job) => void }) {
  const [a, setA] = useState(initial);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [unlockedContact, setUnlockedContact] = useState<{ phone: string; whatsapp: string } | null>(null);

  useEffect(() => {
    api<Artisan>(`/artisans/${initial.id}`).then(setA).catch(e => setError(e.message));
  }, [initial.id]);

  return (
    <>
      <button className="text-button" onClick={onBack}>
        <ArrowLeft size={17} /> Back to discovery
      </button>

      <div className="profile-hero">
        <div className="profile-cover">
          <span className="eyebrow">GOOD HANDS. REAL SKILLS.</span>
          <h1>{a.headline}</h1>
        </div>
        <div className="profile-summary">
          <Avatar name={a.display_name} url={a.avatar_url} />
          <div>
            <h2>{a.display_name}</h2>
            <p>{a.trade} · {a.area}</p>
          </div>
          <Badge green>Identity verified</Badge>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button className="primary" onClick={() => setConnecting(true)} disabled={a.availability === 'offline'}>
              <PhoneCall size={16} /> Unlock contact (₦400)
            </Button>
            <Button onClick={() => setBooking(true)} disabled={a.availability === 'offline'}>
              Send job brief <ArrowUpRight size={17} />
            </Button>
          </div>
        </div>
      </div>

      <FormError error={error} />

      {unlockedContact && (
        <div className="connection-unlocked-card" style={{ margin: '20px 0' }}>
          <div className="connection-unlocked-header">
            <CheckCircle2 size={20} color="#16a34a" />
            <span>Direct contact unlocked for {a.display_name}</span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
            Deal directly! Call or WhatsApp {a.display_name} now to discuss your work. Agree on price and settle directly via OPay, transfer, or cash.
          </p>
          <div className="connection-contact-grid">
            <a href={`tel:${unlockedContact.phone.replace(/\s+/g, '')}`} className="contact-action-btn call-btn">
              <PhoneCall size={16} /> Call {unlockedContact.phone}
            </a>
            <a
              href={`https://wa.me/${unlockedContact.whatsapp}?text=${encodeURIComponent(`Hello ${a.display_name}, I just connected with you on callOga regarding a ${a.trade} job in ${a.area}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-action-btn whatsapp-btn"
            >
              <MessageSquare size={16} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <div className="profile-columns">
        <div>
          <section className="panel">
            <h3>Meet your artisan</h3>
            <p className="body-copy">{a.bio}</p>
            <div className="profile-facts">
              <span><strong>{a.experience_years}</strong>Years of experience</span>
              <span><strong>{a.hn_reviews?.length || 0}</strong>Customer reviews</span>
              <span><strong>{a.availability}</strong>Availability</span>
            </div>
          </section>

          <section className="panel">
            <SectionTitle title="Work that speaks for itself" />
            {a.hn_portfolio?.length ? (
              <div className="portfolio-grid">
                {a.hn_portfolio.map(p => (
                  <figure key={p.id}>
                    <img src={p.image_url} alt={p.title} />
                    <figcaption>{p.title}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="muted">This artisan hasn’t added portfolio photos yet.</p>
            )}
          </section>

          <section className="panel">
            <h3>From real customers</h3>
            {a.hn_reviews?.length ? (
              a.hn_reviews.map(r => (
                <div className="review" key={r.id}>
                  <div>
                    <strong>{r.author_name}</strong>
                    <span><Star size={14} />{r.rating}/5</span>
                  </div>
                  <p>{r.body}</p>
                </div>
              ))
            ) : (
              <p className="muted">Reviews appear after completed bookings.</p>
            )}
          </section>
        </div>

        <aside className="panel">
          <span className="eyebrow">DIRECT CONNECTION</span>
          <h2>{currency(a.base_fee)}<small> estimated rate</small></h2>
          <p className="muted">
            Pay a minimal <strong>₦400 connection fee</strong> to unlock direct phone & WhatsApp. You pay the artisan directly via OPay, transfer or cash.
          </p>
          <div className="service-list">
            {a.hn_services?.map(s => (
              <div key={s.id}>
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.description}</small>
                </span>
                <span>
                  {currency(s.price)}
                  <small>{s.pricing_type}</small>
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
            <Button className="primary full" onClick={() => setConnecting(true)} disabled={a.availability === 'offline'}>
              <PhoneCall size={16} /> Unlock direct contact (₦400)
            </Button>
            <Button className="full" onClick={() => setBooking(true)} disabled={a.availability === 'offline'}>
              Send job brief <ArrowUpRight size={17} />
            </Button>
          </div>
          <p className="privacy-note">
            <ShieldCheck size={18} /> Zero escrow lockup. Direct OPay or cash settlement.
          </p>
        </aside>
      </div>

      {connecting && (
        <ConnectionModal
          artisan={a}
          onClose={() => setConnecting(false)}
          onSuccess={(contact) => {
            setUnlockedContact(contact);
            setConnecting(false);
          }}
        />
      )}

      {booking && (
        <Booking
          artisan={a}
          token={mapToken}
          onClose={() => setBooking(false)}
          onCreated={onBooked}
        />
      )}
    </>
  );
}

export function ConnectionModal({
  artisan,
  onClose,
  onSuccess
}: {
  artisan: Artisan;
  onClose: () => void;
  onSuccess: (contact: { phone: string; whatsapp: string }) => void;
}) {
  const [method, setMethod] = useState<'opay' | 'card'>('opay');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'pay' | 'unlocked'>('pay');
  const [contactData, setContactData] = useState<{ phone: string; whatsapp: string } | null>(null);
  const [error, setError] = useState('');

  async function handlePay() {
    setProcessing(true);
    setError('');
    try {
      const res = await api<{ success: boolean; artisan: { phone: string; whatsapp: string } }>('/connections', 'POST', {
        artisan_id: artisan.id,
        payment_method: method === 'opay' ? 'OPay' : 'Card / Bank'
      });
      setContactData({
        phone: res.artisan?.phone || '0803 762 1984',
        whatsapp: res.artisan?.whatsapp || '2348037621984'
      });
      setStep('unlocked');
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Modal className="connection-modal" title={step === 'pay' ? 'Connect with Artisan' : 'Contact Details Unlocked!'} onClose={onClose}>
      <div className="connection-modal-body">
        <div className="connection-hero-artisan">
          <Avatar name={artisan.display_name} url={artisan.avatar_url} />
          <div>
            <h3>{artisan.display_name}</h3>
            <p>{artisan.trade} · {artisan.area}</p>
          </div>
          <span style={{ marginLeft: 'auto' }}><Badge green>Verified</Badge></span>
        </div>

        {step === 'pay' ? (
          <>
            <div className="connection-fee-card">
              <div className="connection-fee-row">
                <span>callOga Connection Fee</span>
                <strong>₦400</strong>
              </div>
              <p className="connection-fee-note">
                • Unlocks {artisan.display_name}’s direct verified phone & WhatsApp immediately.<br />
                • The artisan is immediately alerted with your referral request.<br />
                • You pay the artisan’s actual job fee directly to them via <strong>OPay</strong>, transfer, or cash on delivery. No escrow hassle.
              </p>
            </div>

            <div>
              <span className="eyebrow" style={{ marginBottom: '8px', display: 'block' }}>SELECT CONNECTION PAYMENT</span>
              <div className="connection-payment-options">
                <button
                  type="button"
                  className={`payment-choice-btn ${method === 'opay' ? 'selected' : ''}`}
                  onClick={() => setMethod('opay')}
                >
                  <strong><span className="opay-indicator" /> Pay with OPay</strong>
                  <small>Instant automated connection</small>
                </button>
                <button
                  type="button"
                  className={`payment-choice-btn ${method === 'card' ? 'selected' : ''}`}
                  onClick={() => setMethod('card')}
                >
                  <strong>Debit Card / Transfer</strong>
                  <small>Paystack / Bank Transfer</small>
                </button>
              </div>
            </div>

            <div className="connection-rematch-note">
              <ShieldCheck size={18} />
              <span><strong>Fair Connection Policy:</strong> If the artisan cannot accept your work within 2 hours, get a free instant rematch to another nearby pro.</span>
            </div>

            {error && <p className="form-error">{error}</p>}

            <Button className="primary full" onClick={handlePay} busy={processing}>
              <Zap size={16} /> Pay ₦400 & Unlock Direct Contact
            </Button>
          </>
        ) : (
          contactData && (
            <div className="connection-unlocked-card">
              <div className="connection-unlocked-header">
                <CheckCircle2 size={24} color="#16a34a" />
                <span>Payment Confirmed (₦400)</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#14532d' }}>
                We have notified {artisan.display_name} of your request! Reach out to them directly now:
              </p>

              <div className="connection-contact-grid">
                <a href={`tel:${contactData.phone.replace(/\s+/g, '')}`} className="contact-action-btn call-btn">
                  <PhoneCall size={16} /> Call {contactData.phone}
                </a>
                <a
                  href={`https://wa.me/${contactData.whatsapp}?text=${encodeURIComponent(`Hello ${artisan.display_name}, I just unlocked your contact on callOga for a ${artisan.trade} job in ${artisan.area}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-action-btn whatsapp-btn"
                >
                  <MessageSquare size={16} /> Chat on WhatsApp
                </a>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #d1fae5', fontSize: '12px', color: '#334155' }}>
                <strong>Direct Settlement Reminder:</strong> Discuss the job scope and pay {artisan.display_name} directly via OPay, transfer or cash. callOga does not take any cut of the job fee.
              </div>

              <Button className="primary full" onClick={() => onSuccess(contactData)}>
                Done & View Profile
              </Button>
            </div>
          )
        )}
      </div>
    </Modal>
  );
}

export function Booking({ artisan, onClose, onCreated, token }: { artisan: Artisan; onClose: () => void; onCreated: (j: Job) => void; token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [point, setPoint] = useState<{ latitude: number; longitude: number } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      const job = await api<Job>('/jobs', 'POST', {
        ...Object.fromEntries(f),
        budget: Number(f.get('budget')),
        artisan_id: artisan.id,
        latitude: point?.latitude ?? null,
        longitude: point?.longitude ?? null
      });
      onCreated(job);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal className="booking-modal" title="Tell us what needs doing." onClose={onClose}>
      <div className="booking-modal-body">
        <p className="muted">Send a request to {artisan.display_name}. They’ll review the details and respond.</p>
        <form className="form booking-form" onSubmit={submit}>
          <label>Job title<input name="title" required maxLength={160} placeholder="A short description of the work" /></label>
          <label>What do you need?<textarea name="description" required maxLength={4000} rows={3} /></label>
          <div className="form-grid">
            <label>Preferred date<input type="date" name="scheduled_date" min={new Date().toISOString().slice(0, 10)} required /></label>
            <label>Your budget (₦)<input type="number" name="budget" min={1} max={100000000} required /></label>
          </div>
          <label>Job address<textarea name="address" required maxLength={500} rows={2} /></label>
          <details>
            <summary><MapPin size={16} />Add a precise job pin (optional)</summary>
            <p className="small muted">Visible only to you and the assigned artisan.</p>
            <div className="booking-map">
              <MapView token={token} pins={point ? [{ ...point, id: 'job', label: 'Job location' }] : []} onPick={(latitude, longitude) => setPoint({ latitude, longitude })} />
            </div>
          </details>
          <FormError error={error} />
          <Button className="primary booking-submit" busy={busy}>Send booking request<ArrowUpRight size={17} /></Button>
          <p className="small muted booking-note">A request is not a confirmed appointment. No payment is taken.</p>
        </form>
      </div>
    </Modal>
  );
}
