import { useState } from 'react';
import {
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Upload,
  Trash2,
  LogOut,
  CheckCircle2,
  Check,
  LockKeyhole,
  MapPin
} from 'lucide-react';
import { api, Me, supabase, trades, currency, human } from './api';
import { Badge, Button, FormError, SectionTitle, Avatar } from './ui';
import { MapView } from './Map';

export function Account({
  me,
  refresh,
  toast,
  token,
  onSignOut
}: {
  me: Me;
  refresh: () => Promise<void>;
  toast: (s: string) => void;
  token: string;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<'details' | 'artisan' | 'verification'>('details');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [point, setPoint] = useState<{ latitude: number; longitude: number } | null>(
    me.artisan?.latitude !== null && me.artisan?.latitude !== undefined
      ? { latitude: me.artisan.latitude, longitude: me.artisan.longitude! }
      : null
  );

  async function run(fn: () => Promise<unknown>, message = 'Saved successfully') {
    setBusy(true);
    setError('');
    try {
      await fn();
      await refresh();
      if (message) toast(message);
    } catch (e: any) {
      setError(e.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function saveDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(() => api('/me', 'PATCH', Object.fromEntries(f)));
  }

  async function saveArtisan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(() =>
      api('/me/artisan', 'PUT', {
        ...Object.fromEntries(f),
        experience_years: Number(f.get('experience_years')),
        base_fee: Number(f.get('base_fee')),
        latitude: point?.latitude ?? null,
        longitude: point?.longitude ?? null
      })
    );
  }

  async function service(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    await run(async () => {
      await api('/me/services', 'POST', {
        ...Object.fromEntries(f),
        price: Number(f.get('price'))
      });
      form.reset();
    });
  }

  async function portfolio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const file = f.get('image') as File;

    await run(async () => {
      if (!file || file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Choose a JPG, PNG or WebP image under 5 MB.');
      }
      if (!supabase) throw new Error('Portfolio storage is not connected.');
      const ticket = await api<{ path: string; token: string; publicUrl: string }>('/me/upload', 'POST', { type: file.type });
      const uploaded = await supabase.storage
        .from('calloga-portfolio')
        .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
      if (uploaded.error) throw uploaded.error;
      await api('/me/portfolio', 'POST', { title: f.get('title'), image_url: ticket.publicUrl });
      form.reset();
    });
  }

  const a = me.artisan;
  const isArtisan = me.profile.role === 'artisan';

  return (
    <div className="account-page max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
        <div className="flex items-center gap-4">
          <Avatar name={me.profile.full_name || 'You'} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950">
              {me.profile.full_name || 'Complete your profile'}
            </h1>
            <p className="text-sm text-gray-500">
              {me.profile.area || 'Add your neighbourhood'} · <span className="capitalize font-semibold text-emerald-700">{me.profile.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {a && (
            <Badge green={a.verification_status === 'verified'}>
              {a.verification_status === 'verified' ? 'Didit Verified' : human(a.verification_status)}
            </Badge>
          )}
          <Button
            onClick={() =>
              run(async () => {
                if (supabase) await supabase.auth.signOut({ scope: 'local' });
                localStorage.removeItem('hn_auth_token');
                onSignOut();
              }, 'Signed out')
            }
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition font-medium"
          >
            <LogOut size={14} />
            Sign out
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-semibold">
        <button
          className={`pb-3 transition border-b-2 ${
            tab === 'details'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setTab('details')}
        >
          Personal Profile
        </button>
        {isArtisan && <button
          className={`pb-3 transition border-b-2 ${
            tab === 'artisan'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setTab('artisan')}
        >
          Artisan Business & Pin
        </button>}
        {isArtisan && <button
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${
            tab === 'verification'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setTab('verification')}
        >
          <ShieldCheck size={16} />
          Didit Verification
          {a?.verification_status === 'verified' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>}
      </div>

      <FormError error={error} />

      {/* Tab 1: Personal Details */}
      {tab === 'details' && (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your contact details are encrypted and only revealed on confirmed active bookings.
            </p>
          </div>

          <form className="space-y-4 max-w-xl" onSubmit={saveDetails}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name</label>
              <input
                name="full_name"
                defaultValue={me.profile.full_name}
                required
                maxLength={120}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (Nigeria)</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={me.profile.phone}
                  placeholder="0803 123 4567"
                  maxLength={30}
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Area / Neighbourhood</label>
                <input
                  name="area"
                  defaultValue={me.profile.area}
                  maxLength={120}
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                />
              </div>
            </div>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition"
              busy={busy}
            >
              Save Personal Details
            </Button>
          </form>
        </section>
      )}

      {/* Tab 2: Artisan Profile & High Definition Pin */}
      {isArtisan && tab === 'artisan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Artisan Profile & Public Presence</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Set up your craft details. Profiles with complete portfolios and Didit verification receive priority discovery.
              </p>
            </div>

            <form className="space-y-4" onSubmit={saveArtisan}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Trade</label>
                  <select
                    name="trade"
                    defaultValue={a?.trade || ''}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="" disabled>Select your trade</option>
                    {trades.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    min={0}
                    max={80}
                    required
                    defaultValue={a?.experience_years ?? ''}
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Headline</label>
                <input
                  name="headline"
                  required
                  maxLength={160}
                  defaultValue={a?.headline}
                  placeholder="e.g. Master Carpenter specialising in custom kitchens and cabinet fitting"
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">About Your Work & Guarantee</label>
                <textarea
                  name="bio"
                  required
                  maxLength={3000}
                  defaultValue={a?.bio}
                  rows={4}
                  placeholder="Describe your craft background, tools, and commitment to clean work..."
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Inspection (₦)</label>
                  <input
                    name="base_fee"
                    type="number"
                    min={0}
                    max={100000000}
                    required
                    defaultValue={a?.base_fee ?? ''}
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Service Area</label>
                  <input
                    name="area"
                    required
                    maxLength={120}
                    defaultValue={a?.area ?? me.profile.area}
                    placeholder="e.g. Ikeja, Lagos"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Availability</label>
                  <select
                    name="availability"
                    defaultValue={a?.availability ?? ''}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="" disabled>Select availability</option>
                    <option value="available">Available Now</option>
                    <option value="busy">Busy Today</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              {/* High-definition Workshop/Service Pin */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700">
                    Your service area
                  </label>
                  {point && (
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => setPoint(null)}
                    >
                      Remove pin
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Click the map to place your public workshop or neighbourhood anchor pin for customers exploring nearby.
                </p>

                <div className="h-64 rounded-2xl overflow-hidden border border-gray-200">
                  <MapView
                    token={token}
                    pins={point ? [{ ...point, id: 'area', label: `${me.profile.full_name}'s Workshop` }] : []}
                    onPick={(lat, lng) =>
                      setPoint({
                        latitude: Math.round(lat * 10000) / 10000,
                        longitude: Math.round(lng * 10000) / 10000
                      })
                    }
                  />
                </div>
              </div>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition flex items-center gap-1.5"
                busy={busy}
              >
                Save Artisan Profile <ArrowUpRight size={16} />
              </Button>
            </form>
          </section>

          {/* Right Column: Services & Portfolio */}
          {!a ? <aside className="artisan-tools-locked">
            <div className="artisan-tools-lock-icon"><LockKeyhole size={24}/></div>
            <span className="eyebrow">NEXT STEP</span>
            <h3>Save your business profile first</h3>
            <p>Add your trade, introduction, pricing base and service area. Once saved, services and portfolio uploads will unlock here.</p>
            <div><Check size={15}/>Prevents incomplete public listings</div>
          </aside> : <div className="space-y-6">
            {/* Services List */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Services & Pricing</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {a?.hn_services?.map((s) => (
                  <div key={s.id} className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-gray-900">{s.title}</div>
                      <div className="text-gray-500">{currency(s.price)} · {s.pricing_type}</div>
                    </div>
                    <button
                      onClick={() => run(() => api(`/me/services/${s.id}`, 'DELETE'))}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={service} className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <input
                  name="title"
                  required
                  placeholder="Service name (e.g. Tap replacement)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="price"
                    type="number"
                    min={0}
                    required
                    placeholder="Price (₦)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none"
                  />
                  <select name="pricing_type" className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white">
                    <option value="fixed">Fixed</option>
                    <option value="from">From</option>
                    <option value="hourly">Hourly</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold" busy={busy}>
                  Add Service
                </Button>
              </form>
            </section>

            {/* Portfolio */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Showcase Portfolio</h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {a?.hn_portfolio?.map((p) => (
                  <div key={p.id} className="relative group rounded-2xl overflow-hidden aspect-video bg-gray-100">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => run(() => api(`/me/portfolio/${p.id}`, 'DELETE'))}
                      className="absolute top-1.5 right-1.5 bg-red-600/90 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={portfolio} className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <input
                  name="title"
                  required
                  placeholder="Project title (e.g. Custom Wardrobe)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none"
                />
                <input
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="w-full text-[11px] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                />
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold" busy={busy}>
                  Add Photo to Portfolio
                </Button>
              </form>
            </section>
          </div>}
        </div>
      )}

      {/* Tab 3: Didit Identity Verification */}
      {isArtisan && tab === 'verification' && (
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/80 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck size={44} />
            </div>
            <div className="inline-block">
              <Badge green={a?.verification_status === 'verified'}>
                Status: {a?.verification_status === 'verified' ? 'Identity Verified' : human(a?.verification_status || 'not_started')}
              </Badge>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-950">
              Verify your identity
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Securely verify your identity via Didit. Once verified, your artisan profile displays the verified trust badge and is discoverable by customers across Nigeria.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 text-xs text-gray-700">
            <div className="font-semibold text-gray-900 flex items-center gap-1.5 font-mono">
              <CheckCircle2 size={15} className="text-emerald-600" />
              BEFORE YOU BEGIN
            </div>
            <ul className="space-y-1.5 text-gray-600 list-disc list-inside">
              <li>Have a government-issued identity document ready. Accepted documents are shown during verification.</li>
              <li>Follow the document and camera checks on the verification page.</li>
              <li>Return here and use Check Status to see the latest result.</li>
            </ul>
          </div>

          {!a && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-900">
              <span>Complete your artisan business profile and service area before starting identity verification.</span>
              <button type="button" className="shrink-0 font-bold text-blue-700 hover:underline" onClick={() => setTab('artisan')}>Complete profile</button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              busy={busy}
              disabled={!a || a.verification_status === 'verified'}
              onClick={() =>
                run(async () => {
                  const r = await api('/verification/session', 'POST', {});
                  if (r.url) {
                    window.location.assign(r.url);
                  } else if (r.status !== 'verified') {
                    throw new Error('Didit did not return a verification link. Please try again.');
                  }
                }, '')
              }
            >
              {a?.verification_status === 'verified' ? 'Identity Already Verified' : 'Verify with Didit'}
              <ArrowUpRight size={16} />
            </Button>

            <Button
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition"
              busy={busy}
              disabled={!a || a.verification_status === 'not_started'}
              onClick={() => run(() => api('/verification/refresh', 'POST', {}), 'Verification status refreshed')}
            >
              <RefreshCw size={15} />
              Check Status
            </Button>
          </div>
        </section>
      )}

    </div>
  );
}
