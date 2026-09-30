import { useMemo, useState } from 'react';
import { Search, ArrowUpRight, ArrowRight, MapPin, ShieldCheck, Star, Hammer, Wrench, Zap, Paintbrush, Grid2X2, Car, Flame, Building2, LocateFixed, SlidersHorizontal, Map, LayoutGrid, Laptop, Sparkles, PhoneCall } from 'lucide-react';
import { Artisan, currency, distance, trades } from './api';
import { Avatar, Badge, Button, Empty, Reveal, SectionTitle } from './ui';
import { MapView } from './Map';

const tradeIcons: Record<string, any> = {
  Carpenter: Hammer,
  Plumber: Wrench,
  Electrician: Zap,
  'Laptop repair': Laptop,
  Mason: Building2,
  Painter: Paintbrush,
  Welder: Flame,
  Tiler: Grid2X2,
  Mechanic: Car,
  Tailor: Sparkles,
  'AC technician': Zap,
  Cleaner: Sparkles,
  'Solar installer': Zap
};

export function Discovery({
  artisans,
  loading,
  error,
  token,
  name,
  onSelect,
  onJoin,
  retry,
  explore = false
}: {
  artisans: Artisan[];
  loading: boolean;
  error: string;
  token: string;
  name?: string;
  onSelect: (a: Artisan) => void;
  onJoin: () => void;
  retry: () => void;
  explore?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [trade, setTrade] = useState('All');
  const [available, setAvailable] = useState(false);
  const [map, setMap] = useState(explore);
  const [sort, setSort] = useState('recent');
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState('');
  const [locating, setLocating] = useState(false);

  const filtered = useMemo(() => {
    return artisans
      .filter(a =>
        (trade === 'All' || a.trade.toLowerCase() === trade.toLowerCase() || (trade === 'Laptop repair' && (a.trade.toLowerCase().includes('laptop') || a.headline.toLowerCase().includes('laptop')))) &&
        (!available || a.availability === 'available') &&
        `${a.display_name} ${a.trade} ${a.area} ${a.headline}`.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === 'price') return a.base_fee - b.base_fee;
        if (sort === 'nearest' && position && a.latitude !== null && b.latitude !== null) {
          return distance(position, { latitude: a.latitude, longitude: a.longitude! }) - distance(position, { latitude: b.latitude, longitude: b.longitude! });
        }
        if (sort === 'rating') return rating(b) - rating(a);
        return 0;
      });
  }, [artisans, trade, query, available, sort, position]);

  function locate() {
    setGeoError('');
    if (!window.isSecureContext) {
      setGeoError('Location needs HTTPS on your phone. Localhost works here.');
      return;
    }
    if (!navigator.geolocation) {
      setGeoError('Location is unavailable in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p => {
        setPosition({ latitude: p.coords.latitude, longitude: p.coords.longitude });
        setSort('nearest');
        setLocating(false);
      },
      reason => {
        setLocating(false);
        setGeoError(
          reason.code === 1
            ? 'Location permission was denied. Allow it in your browser settings and try again.'
            : 'We could not get your location. You can search by area instead.'
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  return (
    <>
      <Reveal>
        <div className="welcome">
          <div>
            <span className="eyebrow">YOUR NEIGHBOURHOOD. DIRECT ACCESS.</span>
            <h1>{name ? `Good to see you, ${name.split(' ')[0]}.` : 'A little help. A lot of possibility.'}</h1>
            <p>Find vetted local hands. Pay ₦400 to unlock direct contact and settle via OPay or cash.</p>
          </div>
          <span className="welcome-mark">
            <Hammer size={25} />
          </span>
        </div>
      </Reveal>

      {!explore && (
        <Reveal delay={0.08}>
          <section className="hero">
            <div className="hero-copy">
              <span className="hero-tag">
                <span className="dot" />
                RECOMMENDED CLOSER · ₦400 DIRECT CONNECT
              </span>
              <h2>
                Good work.<br />Closer than<br /><em>you think.</em>
              </h2>
              <p>
                From sudden plumbing leaks to laptop motherboard repairs.<br className="desktop" />
                Pay a minimal ₦400 connection fee to unlock phone & WhatsApp. Settle directly with your artisan.
              </p>
              <Button className="cream" onClick={() => document.getElementById('directory-search')?.focus()}>
                Find your artisan <ArrowUpRight size={18} />
              </Button>
              <div className="hero-foot">
                <ShieldCheck size={17} /> Identity checked. Settle via OPay / Cash. Zero escrow lockup.
              </div>
            </div>
            <div className="hero-image">
              <img src="/images/craft.png" alt="Craftsmanship: hands carefully shaping wood" />
              <div className="image-caption">
                <span>MADE WITH SKILL.</span>
                <strong>Built with care.</strong>
                <ArrowUpRight />
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.15}>
        <div className="search-panel">
          <Search />
          <input
            id="directory-search"
            aria-label="Search artisans"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Try ‘plumber’, ‘laptop repair’, ‘carpenter’ or area"
          />
          <button className="location-search" disabled={locating} onClick={locate}>
            <LocateFixed size={17} />
            <span>{locating ? 'Locating…' : position ? 'Location set' : 'Near me'}</span>
          </button>
          <Button className="primary search-button" onClick={() => document.getElementById('artisan-results')?.scrollIntoView({ behavior: 'smooth' })}>
            Search <ArrowRight size={17} />
          </Button>
        </div>
        {geoError && <p className="form-error">{geoError}</p>}

        <div className="category-header">
          <h3>What needs a skilled hand?</h3>
          <button className="text-button" onClick={() => setTrade('All')}>
            All services <ArrowRight size={15} />
          </button>
        </div>
        <div className="categories">
          {trades.slice(0, 9).map(t => {
            const Icon = tradeIcons[t] || Hammer;
            return (
              <button
                key={t}
                className={`category ${trade.toLowerCase() === t.toLowerCase() ? 'selected' : ''}`}
                onClick={() => setTrade(trade.toLowerCase() === t.toLowerCase() ? 'All' : t)}
              >
                <span>
                  <Icon size={24} />
                </span>
                {t}
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="discovery-layout">
        <section className="results" id="artisan-results">
          <SectionTitle eyebrow="MEET YOUR NEXT HELPING HAND" title={trade === 'All' ? 'Find your local expert' : `${trade}s near you`}>
            <div className="segmented">
              <button aria-label="List view" aria-pressed={!map} onClick={() => setMap(false)} className={!map ? 'active' : ''}>
                <LayoutGrid size={18} />
              </button>
              <button aria-label="Map view" aria-pressed={map} onClick={() => setMap(true)} className={map ? 'active' : ''}>
                <Map size={18} />
              </button>
            </div>
          </SectionTitle>

          <div className="filter-bar">
            <button className={`pill ${available ? 'active' : ''}`} onClick={() => setAvailable(!available)}>
              <span className="dot" /> Available now
            </button>
            <button
              className={`pill ${sort === 'nearest' ? 'active' : ''}`}
              onClick={() => {
                if (!position) locate();
                setSort(sort === 'nearest' ? 'recent' : 'nearest');
              }}
            >
              📍 Recommend closer
            </button>
            <select aria-label="Trade filter" value={trade} onChange={e => setTrade(e.target.value)}>
              <option>All</option>
              {trades.map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select aria-label="Sort artisans" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recent">Recently joined</option>
              <option value="nearest">Nearest closer first</option>
              <option value="price">Lowest base fee</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>

          {map && (
            <MapView
              token={token}
              pins={filtered
                .filter(a => a.latitude !== null && a.longitude !== null)
                .map(a => ({
                  id: a.id,
                  label: `${a.display_name} · ${a.trade}`,
                  latitude: a.latitude!,
                  longitude: a.longitude!
                }))}
            />
          )}

          {loading ? (
            <div className="card-grid">
              {[1, 2, 3, 4].map(n => (
                <div className="skeleton" key={n} />
              ))}
            </div>
          ) : error ? (
            <Empty title="We couldn’t load the directory" action={<Button onClick={retry}>Try again</Button>}>
              {error}
            </Empty>
          ) : filtered.length === 0 ? (
            <Empty
              title={query || trade !== 'All' ? 'No matches just yet' : 'Good connections start here'}
              action={
                <Button onClick={onJoin} className="primary">
                  Offer your services <ArrowRight size={16} />
                </Button>
              }
            >
              {query || trade !== 'All'
                ? 'Try another trade or a wider area.'
                : 'Artisans will appear here after creating a profile and completing identity verification.'}
            </Empty>
          ) : (
            <div className="card-grid">
              {filtered.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i * 0.05, 0.25)}>
                  <ArtisanCard artisan={a} onClick={() => onSelect(a)} position={position} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <aside className="discovery-aside">
          <div className="trust-card">
            <div className="round-icon">
              <ShieldCheck size={28} />
            </div>
            <h3>Direct Connection.<br />Zero Escrow.</h3>
            <p>Pay ₦400 to unlock direct phone, WhatsApp and workshop pin. Settle the job fee directly via OPay or cash.</p>
            <div>
              <Zap size={18} />
              <span>₦400 minimal platform connection</span>
            </div>
            <div>
              <PhoneCall size={18} />
              <span>Direct WhatsApp & Call access</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>Identity verification via Didit</span>
            </div>
            <div>
              <Star size={18} />
              <span>Fair rematch guarantee</span>
            </div>
          </div>

          <div className="join-card">
            <span className="eyebrow">YOUR CRAFT. YOUR REPUTATION.</span>
            <h3>Get direct<br />paying customers.</h3>
            <p>Connect with people nearby who need your carpentry, plumbing, electrical or laptop repair skills.</p>
            <button onClick={onJoin}>
              Become an artisan <ArrowUpRight size={20} />
            </button>
          </div>
          <p className="aside-note">
            Made for the hands<br />that keep Nigeria moving.
          </p>
        </aside>
      </div>
    </>
  );
}

function rating(a: Artisan) {
  return a.hn_reviews?.length ? a.hn_reviews.reduce((s, r) => s + r.rating, 0) / a.hn_reviews.length : 0;
}

function ArtisanCard({
  artisan: a,
  onClick,
  position
}: {
  artisan: Artisan;
  onClick: () => void;
  position: { latitude: number; longitude: number } | null;
}) {
  const score = rating(a);
  const dist = position && a.latitude !== null && a.longitude !== null
    ? distance(position, { latitude: a.latitude, longitude: a.longitude })
    : null;

  return (
    <article className="artisan-card">
      <div className="artisan-card-top">
        <Avatar name={a.display_name} url={a.avatar_url} />
        <div>
          <h3>{a.display_name}</h3>
          <p>{a.trade}</p>
        </div>
        {score > 0 && (
          <span className="rating">
            <Star size={12} fill="currentColor" />
            {score.toFixed(1)}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '4px 0 8px' }}>
        <Badge green>Identity verified</Badge>
        <span className="hn-connection-tag">₦400 Connect</span>
        {(dist !== null && dist < 10) && (
          <span className="recommended-closer-tag">📍 Closer ({dist.toFixed(1)} km)</span>
        )}
      </div>

      <p className="card-bio">{a.headline}</p>

      <div className="area-strip">
        <MapPin size={14} />
        {dist !== null ? `${dist.toFixed(1)} km · ` : ''}{a.area}
        <span className={`availability ${a.availability}`}>
          <i />
          {a.availability}
        </span>
      </div>

      <div className="card-bottom">
        <div>
          <small>Estimated rate</small>
          <strong>{currency(a.base_fee)}</strong>
        </div>
        <Button className="primary" onClick={onClick}>
          Connect <ArrowUpRight size={17} />
        </Button>
      </div>
    </article>
  );
}
