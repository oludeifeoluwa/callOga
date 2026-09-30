import { useEffect, useState, useMemo, useRef, MouseEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  House,
  Wrench,
  Zap,
  PaintRoller,
  Wind,
  Scissors,
  ShieldCheck,
  MessagesSquare,
  CalendarCheck,
  Menu,
  X,
  BriefcaseBusiness,
  Building2,
  Flame,
  Laptop,
  Compass,
  PhoneCall,
  Sparkles,
  Star,
  Lock,
  Unlock,
  Clock,
  Coins,
  TrendingUp,
  MapPin,
  RotateCcw,
  CheckCircle2,
  BadgeCheck,
  Sliders,
  DollarSign
} from 'lucide-react';
import { AuthScreen, AuthMode, AccountRole } from './Auth';
import { TwoToneStickHouse } from '../components/TwoToneStickHouse';

export function Brand() {
  return (
    <a className="hn-brand" href="#home" aria-label="callOga home">
      <span className="hn-brand-symbol">
        <TwoToneStickHouse size={22} />
      </span>
      callOga<span className="hn-brand-period">.</span>
    </a>
  );
}

export interface ServiceDetail {
  name: string;
  category: 'home' | 'power' | 'metal' | 'tech';
  icon: typeof TwoToneStickHouse;
  color: string;
  image: string;
  badge: string;
  tagline: string;
  description: string;
  rate: string;
  turnaround: string;
  popularJobs: string[];
  materialsNote: string;
  detail: string;
}

const services: ServiceDetail[] = [
  {
    name: 'Carpentry',
    category: 'home',
    icon: TwoToneStickHouse,
    color: 'lilac',
    image: '/images/skills/carpentry.webp',
    badge: 'Popular',
    tagline: 'Custom woodwork & fittings',
    description: 'Furniture repairs, bespoke cabinetry, door framing & woodwork.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Cabinetry & Wardrobes', 'Door & Lock Realignment', 'Furniture Restoration', 'Kitchen Fitting'],
    materialsNote: 'Wood, hinges, screws & lacquer can be pre-agreed or supplied by customer.',
    detail: 'Explore furniture repairs, custom wardrobes, kitchen cabinets, and artisanal woodwork. Review portfolios and discuss measurements, wood selection, and finish with local carpenters.'
  },
  {
    name: 'Plumbing',
    category: 'home',
    icon: Wrench,
    color: 'blue',
    image: '/images/skills/plumbing.webp',
    badge: 'Essential',
    tagline: 'Pipes, leaks & water systems',
    description: 'From leaking taps to borehole pumps & modern bathroom fixtures.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Pipe Leak Repair', 'Water Pump / Borehole', 'Toilet & Basin Setup', 'Drainage Unclogging'],
    materialsNote: 'Pipes, valves and sealants sourced locally with direct cost receipts.',
    detail: 'Describe the leak, repair or pipe installation you need. Connect with plumbers for water pressure issues, water heaters, sump pumps, and sanitary fixtures.'
  },
  {
    name: 'Electrical',
    category: 'power',
    icon: Zap,
    color: 'yellow',
    image: '/images/skills/electrical.webp',
    badge: 'High Demand',
    tagline: 'Wiring, solar & power backup',
    description: 'Certified domestic wiring, inverter solar installations & repairs.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Solar / Inverter Setup', 'Conduit Wiring', 'Distribution Board Repair', 'Lighting Installation'],
    materialsNote: 'Pure copper cables, surge protectors & circuit breakers recommended.',
    detail: 'Find electricians for distribution boards, domestic conduit wiring, inverter/solar battery systems, and circuit diagnostics. Agree on scope upfront.'
  },
  {
    name: 'Painting',
    category: 'home',
    icon: PaintRoller,
    color: 'coral',
    image: '/images/skills/painting.webp',
    badge: 'Finishing',
    tagline: 'Screeding & luxury finishes',
    description: 'Interior & exterior luxury finishes, wall screeding & stucco.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Wall Screeding', 'Interior Emulsion', 'Exterior Weather-shield', 'Textured Finishes'],
    materialsNote: 'Dulux, Berger, or fine POP screeding paste agreed prior to start.',
    detail: 'Give your walls, doors or entire space a fresh look with smooth screeding, weather-resistant coating, or decorative textured finishes.'
  },
  {
    name: 'AC & Cooling',
    category: 'power',
    icon: Wind,
    color: 'mint',
    image: '/images/skills/ac-cooling.webp',
    badge: 'Cooling',
    tagline: 'Servicing & split unit repairs',
    description: 'Servicing, gas refill, repair & new unit installations.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Split Unit Servicing', 'Refrigerant Gas Top-up', 'Compressor Repair', 'AC Installation'],
    materialsNote: 'R410A / R22 refrigerant cylinders and copper piping tested on site.',
    detail: 'Find help with AC servicing, leak detection, coil cleaning, and compressor repairs. Share unit specs so technicians come fully prepared.'
  },
  {
    name: 'Tailoring',
    category: 'metal',
    icon: Scissors,
    color: 'pink',
    image: '/images/skills/tailoring.webp',
    badge: 'Bespoke',
    tagline: 'Custom clothing & alterations',
    description: 'Custom bespoke native wear, alterations & precision styling.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Agbada & Kaftan Tailoring', 'Formal Suit Alterations', 'Traditional Attire', 'Dress Making'],
    materialsNote: 'Bring your fabric or discuss luxury cotton/wool selection with artisan.',
    detail: 'Connect with skilled tailors and fashion designers for alterations, bespoke native attires, and formal wear. Discuss fabric and delivery date before booking.'
  },
  {
    name: 'Masonry & Tiling',
    category: 'home',
    icon: Building2,
    color: 'blue',
    image: '/images/skills/masonry.webp',
    badge: 'Structural',
    tagline: 'Tiles, plastering & screeding',
    description: 'Floor tiling, foundation blockwork & structural repairs.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Floor Tile Laying', 'Wall Plastering', 'Concrete Floor Casting', 'Foundation Work'],
    materialsNote: 'Tile adhesive, cement mix and spacers confirmed upfront.',
    detail: 'Hire experienced masons and tilers for floor tile laying, wall screeding, blockwork, and structural restorations.'
  },
  {
    name: 'Welding & Metal',
    category: 'metal',
    icon: Flame,
    color: 'coral',
    image: '/images/skills/welding.webp',
    badge: 'Fabrication',
    tagline: 'Iron gates & security burglar proofs',
    description: 'Iron security gates, burglar proofs & structural steel.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Security Burglar Proofs', 'Iron Gate Fabrication', 'Handrails & Balconies', 'Car Port Frames'],
    materialsNote: 'Galvanized iron pipes, anti-rust coatings and precision welds.',
    detail: 'Commission bespoke metal gates, handrails, carports, and secure burglar proofing built by skilled metal fabricators.'
  },
  {
    name: 'Laptop & Gadgets',
    category: 'tech',
    icon: Laptop,
    color: 'yellow',
    image: '/images/skills/laptop-repair.webp',
    badge: 'Tech Care',
    tagline: 'Motherboards, screens & repairs',
    description: 'Laptop motherboard diagnostics, screens, battery & power fixes.',
    rate: 'Discuss pricing directly',
    turnaround: 'Agree timing with artisan',
    popularJobs: ['Laptop Motherboard Repair', 'Screen & Hinge Replacement', 'Power Jack & Battery Fix', 'OS & Virus Cleanup'],
    materialsNote: 'OEM replacement displays, chips and testing equipment used.',
    detail: 'Need someone to repair your laptop or smartphone? Connect with experienced gadget technicians for board-level diagnostics, component replacement, and quick turnaround.'
  }
];

const liveTickerItems = [
  'Browse local trades and review profiles',
  'See past work before sending a booking request',
  'Keep job details and messages in one place',
  'Artisans can build a profile for their craft'
];

const popularLocations = [
  'Ikeja, Lagos',
  'Lekki Phase 1',
  'Yaba / Surulere',
  'Maitama, Abuja',
  'Gwarinpa, Abuja',
  'Bodija, Ibadan'
];

const questions = [
  ['How do I find an artisan?', 'Choose a trade and location, review available profiles and past work, then send a booking request with the job details.'],
  ['How does verification work?', 'Artisans can complete identity verification through Didit. Check the badge on an individual profile to see its verification status.'],
  ['Is a connection fee charged?', 'The planned direct-contact fee is ₦400. Online payments are not enabled yet, so the app does not offer a paid contact unlock today.'],
  ['How are job payments handled?', 'Discuss scope and price with the artisan before work begins. Online job payments and escrow are not available in the app.'],
  ['Can I register as an artisan?', 'Yes. Create an artisan profile, add your trade and work photos, and complete the available verification steps.']
];

function readMode(): AuthMode | null {
  return ({ '#sign-in': 'login', '#sign-up': 'signup', '#reset-password': 'reset' } as Record<string, AuthMode>)[location.hash] || null;
}

export function PublicSite({ onSignedIn }: { onSignedIn: () => Promise<void> }) {
  const [mode, setMode] = useState<AuthMode | null>(readMode);
  const [audience, setAudience] = useState<AccountRole>('customer');
  const [initialRole, setInitialRole] = useState<AccountRole | undefined>();
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'home' | 'power' | 'metal' | 'tech'>('all');

  // Interactive 3D Card Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const cardRef = useRef<HTMLDivElement>(null);

  // Hero Quick Search & Proximity Estimator
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Ikeja, Lagos');
  const [phoneView, setPhoneView] = useState<'discover' | 'projects' | 'messages'>('discover');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const change = () => {
      setMode(readMode());
      setMenu(false);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);

  function openAuth(next: AuthMode, role?: AccountRole) {
    setInitialRole(role);
    location.hash = next === 'login' ? 'sign-in' : next === 'reset' ? 'reset-password' : 'sign-up';
    setMode(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 3D Card mouse move tracking for buttery 60fps tilt
  const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.hn-phone-device')) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 16, y: -y * 16, active: true });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0, active: false });
  };

  // Card mouse-tracker spotlight effect
  const handleServiceCardMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
  };

  const filteredServices = useMemo(() => {
    const byCategory = activeCategory === 'all' ? services : services.filter((service) => service.category === activeCategory);
    const query = searchQuery.trim().toLowerCase();
    return query ? byCategory.filter((service) => [service.name, service.tagline, service.description, ...service.popularJobs].join(' ').toLowerCase().includes(query)) : byCategory;
  }, [activeCategory, searchQuery]);

  if (mode) {
    return (
      <AuthScreen
        key={mode}
        initialMode={mode}
        initialRole={initialRole}
        onMode={(next) => openAuth(next, initialRole)}
        onBack={() => {
          location.hash = 'home';
          setMode(null);
        }}
        onSuccess={onSignedIn}
      />
    );
  }

  const isPro = audience === 'artisan';
  const featuredServices = [services[2], services[0], services[1]];
  const featuredService = featuredServices[featuredIndex];

  function openFeaturedService() {
    setActiveCategory('all');
    setSearchQuery('');
    setSelected(services.indexOf(featuredService));
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="hn-public">
      <a className="hn-skip" href="#main-content">
        Skip to content
      </a>

      {/* 1. TOP LIVE TICKER / ANNOUNCEMENT BAR (60fps Infinite Marquee) */}
      <div className="hn-marquee-strip" aria-hidden="true">
        <div className="hn-marquee-track">
          {[...liveTickerItems, ...liveTickerItems].map((item, idx) => (
            <span key={idx} className="hn-marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 2. FLOATING ISLAND NAVIGATION */}
      <header className="hn-nav-wrapper hn-container">
        <div className="hn-nav">
          <Brand />

          <nav className={menu ? 'hn-nav-links is-open' : 'hn-nav-links'} aria-label="Main navigation">
            <a href="#services" onClick={() => setMenu(false)}>
              Explore Services
            </a>
            <a href="#featured" onClick={() => setMenu(false)}>
              Craft gallery
            </a>
            <a href="#how-it-works" onClick={() => setMenu(false)}>
              How It Works
            </a>
            <a href="#trust" onClick={() => setMenu(false)}>
              Trust & Safety
            </a>
            <a href="#questions" onClick={() => setMenu(false)}>
              FAQs
            </a>
          </nav>

          <div className="hn-nav-actions">
            <div className="hn-nav-live-dot desktop-only">
              <span className="hn-pulse-dot" />
              <span>Find skilled local help</span>
            </div>
            <button className="hn-button hn-button-quiet" onClick={() => openAuth('login')}>
              Sign in
            </button>
            <button className="hn-button hn-button-blue" onClick={() => openAuth('signup')}>
              Get started <ArrowUpRight size={16} />
            </button>
            <button
              className="hn-menu"
              aria-label={menu ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* 3. HERO SECTION */}
        <section className="hn-hero hn-container">
          <div className="hn-hero-copy">
            {/* Persona Switcher with Springy Pill */}
            <div className="hn-personas" aria-label="Choose your experience">
              <button
                type="button"
                aria-pressed={!isPro}
                className={!isPro ? 'selected' : ''}
                onClick={() => setAudience('customer')}
              >
                <House size={15} /> For your home
              </button>
              <button
                type="button"
                aria-pressed={isPro}
                className={isPro ? 'selected' : ''}
                onClick={() => setAudience('artisan')}
              >
                <BriefcaseBusiness size={15} /> For your craft
              </button>
            </div>

            {/* High-Impact Headline */}
            <h1>
              {isPro ? (
                <>
                  Turn your craft into <br />
                  <em>steady local income.</em>
                </>
              ) : (
                <>
                  Trusted local artisans. <br />
                  <em>One clear connection.</em>
                </>
              )}
            </h1>

            <p className="hn-hero-subtitle">
              {isPro
                ? 'Build a trade profile, show previous work, and connect with customers in your area. Manage new requests and conversations in one place.'
                : 'Browse skilled local artisans, review their profiles and past work, then send a clear booking request. Keep the conversation and project details together.'}
            </p>

            {/* Quick Proximity Search Interactive Tool (Design Spell #1) */}
            <div className="hn-hero-interactive-search">
              <div className="hn-search-input-wrap">
                <Compass size={18} className="hn-search-icon" />
                <input
                  type="text"
                  placeholder="Search trades, e.g. plumbing or solar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hn-hero-search-field"
                  aria-label="Search trade"
                />
              </div>
              <div className="hn-location-select-wrap">
                <MapPin size={16} className="hn-loc-icon" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="hn-hero-location-dropdown"
                  aria-label="Select location"
                >
                  {popularLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="hn-hero-quick-btn"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                title="Browse matching trades"
              >
                <span>Browse trades</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Actions & Guarantee */}
            <div className="hn-hero-actions">
              <button
                className="hn-button hn-button-blue hn-button-large hn-glow-button"
                onClick={() => openAuth('signup', audience)}
              >
                <span>{isPro ? 'Register As An Artisan' : 'Find A Verified Artisan'}</span>
                <span className="hn-button-circle">
                  <ArrowRight size={18} />
                </span>
              </button>
              <a className="hn-text-link" href="#how-it-works">
                <span>See how it works</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="hn-hero-trust">
              <span>
                <BadgeCheck size={16} className="hn-trust-accent" /> Verification status on profiles
              </span>
              <span>
                <MessagesSquare size={16} className="hn-trust-accent" /> Requests and messages in one place
              </span>
              <span>
                <RotateCcw size={16} className="hn-trust-accent" /> Work details before booking
              </span>
            </div>

            {/* Popular Trade Filter Chips */}
            <div className="hn-hero-skills-strip">
              <span className="hn-hero-strip-label">Explore trades:</span>
              {services.slice(0, 5).map((s, idx) => (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => {
                    setSelected(idx);
                    const el = document.getElementById('services');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`hn-hero-skill-chip ${selected === idx ? 'active-chip' : ''}`}
                >
                  <s.icon size={13} /> {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="hn-phone-stage" ref={cardRef} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
            <div className="hn-phone-stage-orbit hn-phone-stage-orbit-one" aria-hidden="true" />
            <div className="hn-phone-stage-orbit hn-phone-stage-orbit-two" aria-hidden="true" />
            <div className="hn-phone-float hn-phone-float-top" aria-hidden="true"><MapPin size={16} /> Local skills, closer</div>
            <div className="hn-phone-float hn-phone-float-bottom" aria-hidden="true"><ShieldCheck size={17} /> Review before booking</div>
            <div className="hn-phone-device" onMouseEnter={handleCardMouseLeave} style={{ transform: `rotateX(${tilt.active ? tilt.y : -7}deg) rotateY(${tilt.active ? tilt.x : -17}deg) rotateZ(-5deg)` }}>
              <div className="hn-phone-side" aria-hidden="true" />
              <div className="hn-phone-bezel">
                <div className="hn-phone-screen">
                  <div className="hn-phone-status"><span>9:41</span><span className="hn-phone-island" /><span>●●● ▰</span></div>
                  <div className="hn-phone-app-head"><span className="hn-phone-app-mark">c.</span><span>callOga</span><span className="hn-phone-avatar">O</span></div>
                  {phoneView === 'discover' && <div className="hn-phone-app-content" key="discover">
                    <span className="hn-phone-eyebrow">FIND GOOD HANDS</span>
                    <h3>Who can help<br />you today?</h3>
                    <div className="hn-phone-search"><Compass size={15} /> Search a trade</div>
                    <div className="hn-phone-chips"><span>Electrical</span><span>Plumbing</span><span>Carpentry</span></div>
                    <p className="hn-phone-list-label">Explore local skills <ArrowRight size={13} /></p>
                    <div className="hn-phone-profile"><img src="/images/electrician.jpg" alt="Electrician at work" fetchPriority="high" /><div><strong>Electrical & solar</strong><small>View work, area and profile</small><span>Explore profiles <ArrowUpRight size={12} /></span></div></div>
                    <div className="hn-phone-profile hn-phone-profile-second"><img src="/images/skills/carpentry.webp" alt="Carpenter at work" /><div><strong>Carpentry</strong><small>Furniture & fittings</small></div></div>
                  </div>}
                  {phoneView === 'projects' && <div className="hn-phone-app-content" key="projects">
                    <span className="hn-phone-eyebrow">KEEP THE WORK CLEAR</span><h3>One place for<br />every project.</h3>
                    <div className="hn-phone-project"><span className="hn-phone-project-icon"><Wrench size={21} /></span><strong>Describe the work</strong><small>Scope, date and location</small></div>
                    <div className="hn-phone-project"><span className="hn-phone-project-icon"><CalendarCheck size={21} /></span><strong>Track the request</strong><small>See each step in one view</small></div>
                    <div className="hn-phone-project"><span className="hn-phone-project-icon"><Check size={21} /></span><strong>Agree together</strong><small>Confirm the details before work</small></div>
                  </div>}
                  {phoneView === 'messages' && <div className="hn-phone-app-content" key="messages">
                    <span className="hn-phone-eyebrow">STAY IN THE LOOP</span><h3>Every detail,<br />in the chat.</h3>
                    <div className="hn-phone-chat"><span>Hello, I need help with an installation.</span><span>Share the job details and preferred date.</span><span>Saturday morning works for me.</span></div>
                    <div className="hn-phone-compose">Write a message… <ArrowUpRight size={14} /></div>
                  </div>}
                  <div className="hn-phone-nav" aria-label="Preview app screens">
                    <button type="button" className={phoneView === 'discover' ? 'is-active' : ''} onPointerDown={() => setPhoneView('discover')} onClick={() => setPhoneView('discover')} aria-label="Preview Discover" aria-pressed={phoneView === 'discover'}><Compass size={18} /><span>Discover</span></button>
                    <button type="button" className={phoneView === 'projects' ? 'is-active' : ''} onPointerDown={() => setPhoneView('projects')} onClick={() => setPhoneView('projects')} aria-label="Preview Projects" aria-pressed={phoneView === 'projects'}><Wrench size={18} /><span>Projects</span></button>
                    <button type="button" className={phoneView === 'messages' ? 'is-active' : ''} onPointerDown={() => setPhoneView('messages')} onClick={() => setPhoneView('messages')} aria-label="Preview Messages" aria-pressed={phoneView === 'messages'}><MessagesSquare size={18} /><span>Messages</span></button>
                  </div>
                  <div className="hn-phone-homebar" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="hn-phone-stage-controls" aria-label="Change phone preview">
              <button type="button" className={phoneView === 'discover' ? 'is-active' : ''} onClick={() => setPhoneView('discover')}>Discover</button>
              <button type="button" className={phoneView === 'projects' ? 'is-active' : ''} onClick={() => setPhoneView('projects')}>Projects</button>
              <button type="button" className={phoneView === 'messages' ? 'is-active' : ''} onClick={() => setPhoneView('messages')}>Messages</button>
            </div>
            <span className="hn-phone-caption">Interactive product preview · move your pointer or tap a phone tab</span>
          </div>
        </section>

        <section className="hn-proof-bar hn-container" aria-label="How callOga works">
          <div><strong>Explore local skills</strong><span>Search by trade and area to find relevant artisans.</span></div>
          <div><strong>Review real profiles</strong><span>Look at work photos and each profile’s verification status.</span></div>
          <div><strong>Discuss the job</strong><span>Send a request and keep the conversation with the project.</span></div>
        </section>

        <section className="hn-featured-scene hn-container" id="featured" aria-label="Explore the crafts">
          <div className="hn-featured-copy">
            <span className="hn-eyebrow">CRAFT IS ALL AROUND US</span>
            <h2>The city runs on <em>skilled hands.</em></h2>
            <p>From the power in your home to the details in your space, find the trade that fits the work. Choose a card to explore its craft.</p>
            <div className="hn-featured-current" aria-live="polite">
              <span>0{featuredIndex + 1} / 03</span>
              <strong>{featuredService.name}</strong>
              <small>{featuredService.tagline}</small>
            </div>
            <div className="hn-featured-actions">
              <button type="button" className="hn-featured-explore" onClick={openFeaturedService}>Explore {featuredService.name} <ArrowUpRight size={17} /></button>
              <div className="hn-featured-arrows">
                <button type="button" aria-label="Previous craft" onPointerDown={() => setFeaturedIndex((value) => (value + 2) % 3)} onClick={(event) => { if (event.detail === 0) setFeaturedIndex((value) => (value + 2) % 3); }}><ArrowRight size={19} /></button>
                <button type="button" aria-label="Next craft" onPointerDown={() => setFeaturedIndex((value) => (value + 1) % 3)} onClick={(event) => { if (event.detail === 0) setFeaturedIndex((value) => (value + 1) % 3); }}><ArrowRight size={19} /></button>
              </div>
            </div>
          </div>
          <div className="hn-featured-gallery" aria-label="Select a craft to preview">
            <div className="hn-featured-halo" aria-hidden="true" />
            {featuredServices.map((service, index) => {
              const position = (index - featuredIndex + 3) % 3;
              const place = position === 0 ? 'is-front' : position === 1 ? 'is-right' : 'is-left';
              return <button type="button" key={service.name} className={`hn-featured-card ${place}`} onPointerDown={() => setFeaturedIndex(index)} onClick={(event) => { if (event.detail === 0) setFeaturedIndex(index); }} aria-label={`Preview ${service.name}`} aria-pressed={index === featuredIndex}>
                <img src={service.image} alt="" loading="lazy" />
                <span className="hn-featured-card-gradient" />
                <span className="hn-featured-card-index">0{index + 1}</span>
                <span className="hn-featured-card-label">{service.name}<ArrowUpRight size={18} /></span>
              </button>;
            })}
            <div className="hn-featured-floor" aria-hidden="true" />
          </div>
        </section>

        {/* 6. SERVICES SHOWCASE WITH EXPANDABLE SCOPE ESTIMATOR */}
        <section className="hn-section hn-container" id="services">
          <div className="hn-section-heading">
            <div>
              <span className="hn-eyebrow">VERIFIED CRAFT & PRECISION</span>
              <h2>What needs a skilled hand today?</h2>
            </div>
            <p>
              From urgent pipe bursts and solar setups to bespoke woodwork. <br className="hn-desktop-break" />
              Check each profile for its identity verification status and work history.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="hn-service-tabs-bar" role="tablist" aria-label="Service categories">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'home', label: 'Home & Finishing' },
              { id: 'power', label: 'Power & Climate' },
              { id: 'metal', label: 'Metal & Tailoring' },
              { id: 'tech', label: 'Tech & Gadgets' }
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeCategory === tab.id}
                className={`hn-service-tab-btn ${activeCategory === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid of Service Cards with Mouse-Spotlight Interaction */}
          <div className="hn-service-grid">
            {filteredServices.map((s, index) => {
              const Icon = s.icon;
              const serviceIndex = services.indexOf(s);
              const isSelected = selected === serviceIndex;
              return (
                <button
                  type="button"
                  key={s.name}
                  className={`hn-service-card ${s.color} ${isSelected ? 'selected' : ''}`}
                  aria-expanded={isSelected}
                  aria-controls="service-detail"
                  onMouseMove={handleServiceCardMouseMove}
                  onClick={() => setSelected(isSelected ? null : serviceIndex)}
                >
                  <div className="hn-service-spotlight-glow" />
                  <div className="hn-service-art">
                    <img src={s.image} alt={`${s.name} skill`} className="hn-service-img" loading="lazy" />
                    <div className="hn-service-scrim" />
                    <span className="hn-service-badge">{s.badge}</span>
                    <span className="hn-service-icon-pill">
                      <Icon size={16} />
                    </span>
                  </div>
                  <div className="hn-service-body">
                    <div className="hn-service-name">
                      <span>{s.name}</span>
                      <ArrowUpRight size={15} />
                    </div>
                    <p className="hn-service-tagline">{s.tagline}</p>
                    <div className="hn-service-card-footer">
                      <span className="hn-card-rate-pill">{s.rate}</span>
                      <small>{s.turnaround}</small>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredServices.length === 0 && <p className="hn-no-results">No matching trade in this list. Try a shorter term or another category.</p>}

          {/* Active Service Detailed Drawer */}
          {selected !== null && services[selected] && filteredServices.includes(services[selected]) && (
            <div className="hn-service-detail" id="service-detail">
              <div className="hn-service-detail-media">
                <img
                  src={services[selected].image}
                  alt={services[selected].name}
                  className="hn-service-detail-img"
                />
                <div className="hn-service-detail-badge">{services[selected].badge}</div>
              </div>

              <div className="hn-service-detail-content">
                <div className="hn-service-detail-head">
                  <div>
                    <span className="hn-service-detail-pill">
                      <span className="hn-pill-dot" /> Explore {services[selected].name} in {selectedLocation}
                    </span>
                    <strong>{services[selected].name} profiles</strong>
                  </div>
                  <span className="hn-service-detail-rate">{services[selected].rate}</span>
                </div>
                <p>{services[selected].detail}</p>
                <div className="hn-service-meta-checklist">
                  <div className="hn-service-popular-tags">
                    <span className="hn-popular-label">Popular jobs:</span>
                    {services[selected].popularJobs.map((job) => (
                      <span key={job} className="hn-job-tag">
                        {job}
                      </span>
                    ))}
                  </div>
                  <div className="hn-service-material-note">
                    <strong>Materials Note:</strong> {services[selected].materialsNote}
                  </div>
                </div>
              </div>

              <div className="hn-service-detail-action">
                <button
                  className="hn-button hn-button-blue hn-button-large"
                  onClick={() => openAuth('signup', 'customer')}
                >
                  Explore {services[selected].name} Pros <ArrowRight size={16} />
                </button>
                <small className="hn-action-subtext">Review profiles before booking</small>
              </div>
            </div>
          )}
        </section>

        {/* 7. HOW IT WORKS 3-STEP TACTILE WALKTHROUGH */}
        <section className="hn-how" id="how-it-works">
          <div className="hn-container">
            <div className="hn-section-heading">
              <div>
                <span className="hn-eyebrow">SIMPLE. DIRECT. RESPECTFUL.</span>
                <h2>
                  How callOga works in 3 clear steps.
                </h2>
              </div>
              <a className="hn-text-link" href="#sign-up" onClick={() => setInitialRole(undefined)}>
                Get started today <ArrowRight size={17} />
              </a>
            </div>

            <div className="hn-how-grid">
              {[
                {
                  step: '01',
                  title: 'Find a local artisan.',
                  text: 'Browse trades in your area. Review profiles, work photos, and verification status where available.',
                  icon: Compass
                },
                {
                  step: '02',
                  title: 'Send a clear request.',
                  text: 'Review profiles and past work, then send a request describing what needs doing.',
                  icon: Zap
                },
                {
                  step: '03',
                  title: 'Agree scope & pay artisan directly.',
                  text: 'Use the project conversation to agree on scope and price. Arrange payment directly with the artisan when the work is done.',
                  icon: MessagesSquare
                }
              ].map((item) => (
                <article className="hn-how-card" key={item.step}>
                  <div className="hn-how-top">
                    <span>{item.step}</span>
                    <div className="hn-how-icon-circle">
                      <item.icon size={22} />
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8. TRUST, SAFETY & DIDIT VERIFICATION SPOTLIGHT */}
        <section className="hn-section hn-container hn-trust-section" id="trust">
          <div className="hn-trust-intro">
            <span className="hn-eyebrow">NO ANONYMOUS PROFILES</span>
            <h2>
              Trust starts with <br />
              <em>real verification.</em>
            </h2>
            <p>
              Inviting someone into your home or business requires complete confidence. We build trust through
              clear profile information and identity checks.
            </p>
            <div className="hn-trust-seal">
              <ShieldCheck size={40} />
              <span>
                Identity checks with Didit <br />
                <strong>See verification status on each profile</strong>
              </span>
            </div>
            <div className="hn-trust-sculpture" aria-label="Three steps to a clearer booking">
              <div className="hn-trust-plane hn-trust-plane-one"><ShieldCheck size={21} /><span>Check the profile</span></div>
              <div className="hn-trust-plane hn-trust-plane-two"><Compass size={21} /><span>See the work</span></div>
              <div className="hn-trust-plane hn-trust-plane-three"><MessagesSquare size={21} /><span>Agree the details</span></div>
            </div>
          </div>

          <div className="hn-trust-grid">
            <article>
              <div className="hn-trust-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h3>Biometric & National ID</h3>
              <p>
                Artisans can complete identity verification through Didit. Review each profile badge before booking.
              </p>
            </article>

            <article>
              <div className="hn-trust-icon-box">
                <MapPin size={24} />
              </div>
              <h3>Neighbourhood Proximity</h3>
              <p>
                Search by operating area and discuss travel, timing, and any extra costs before confirming a job.
              </p>
            </article>

            <article>
              <div className="hn-trust-icon-box">
                <RotateCcw size={24} />
              </div>
              <h3>More choice when plans change</h3>
              <p>
                If a request is declined or an artisan is unavailable, return to search and contact another suitable profile.
              </p>
            </article>

            <article>
              <div className="hn-trust-icon-box">
                <CheckCircle2 size={24} />
              </div>
              <h3>Direct Peer Payments</h3>
              <p>
                Agree on payment terms directly with the artisan. Online payment and escrow are not enabled in the app.
              </p>
            </article>
          </div>
        </section>

        {/* 9. FOR ARTISANS / PROFESSIONALS CALLOUT */}
        <section className="hn-pro-section hn-container" id="professionals">
          <div className="hn-pro-content">
            <span className="hn-eyebrow text-blue-200">FOR HARDWORKING ARTISANS</span>
            <h2>
              Your skill deserves respect. <br />
              And a clearer way to grow.
            </h2>
            <p>
              Show the work you are proud of, make your skills easier to discover, and manage local customer requests in one place.
            </p>
            <div className="hn-pro-actions">
              <button
                className="hn-button hn-button-white hn-button-large"
                onClick={() => openAuth('signup', 'artisan')}
              >
                Join As An Artisan <ArrowUpRight size={18} />
              </button>
              <span className="hn-pro-note">Create a profile and complete identity verification</span>
            </div>
          </div>
          <div className="hn-pro-visual">
            <img
              src="/images/skills/carpenter-work.webp"
              alt="Master carpentry and artisan woodwork"
              loading="lazy"
            />
            <span className="hn-pro-visual-badge">
              <TwoToneStickHouse size={20} /> Built for everyday Naija craftsmanship.
            </span>
          </div>
        </section>

        {/* 10. FAQS (Interactive Smooth Accordion) */}
        <section className="hn-section hn-container hn-faq" id="questions">
          <div>
            <span className="hn-eyebrow">COMMON QUESTIONS</span>
            <h2>
              A few things <br />
              worth knowing.
            </h2>
            <p>Clear, direct answers for your first connection.</p>
          </div>

          <div className="hn-faq-list">
            {questions.map(([q, a]) => (
              <details key={q} className="hn-faq-item">
                <summary>
                  <span>{q}</span>
                  <ChevronDown size={18} className="hn-faq-chevron" />
                </summary>
                <div className="hn-faq-content">
                  <p>{a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 11. HIGH IMPACT FINAL CTA */}
        <section className="hn-final-cta hn-container">
          <div className="hn-final-cta-glow" />
          <span className="hn-eyebrow">LET’S GET IT DONE</span>
          <h2>
            Your next skilled connection <br />
            is closer than you think.
          </h2>
          <p className="hn-final-cta-sub">
            Explore local trades, compare profiles, and start the right conversation for your next project.
          </p>
          <div className="hn-final-cta-buttons">
            <button
              className="hn-button hn-button-blue hn-button-large hn-glow-button"
              onClick={() => openAuth('signup', 'customer')}
            >
              Find A Verified Pro <ArrowRight size={19} />
            </button>
            <button
              className="hn-button hn-button-quiet hn-button-large"
              onClick={() => openAuth('signup', 'artisan')}
            >
              Sign Up As An Artisan <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* 12. COMPREHENSIVE MODERN FOOTER */}
      <footer className="hn-footer hn-container">
        <div className="hn-footer-brand-col">
          <Brand />
          <p>
            callOga helps Nigerians discover local artisans, review their work, and manage job requests and conversations.
          </p>
          <div className="hn-footer-copyright">
            © {new Date().getFullYear()} callOga Technologies. All rights reserved.
          </div>
        </div>

        <div className="hn-footer-links-grid">
          <div>
            <strong>Explore Services</strong>
            <a href="#services">Carpentry & Woodwork</a>
            <a href="#services">Plumbing & Borehole</a>
            <a href="#services">Electrical & Solar</a>
            <a href="#services">AC & Cooling Tech</a>
            <a href="#services">Painting & Screeding</a>
          </div>
          <div>
            <strong>Platform</strong>
            <a href="#how-it-works">How connections work</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#trust">Didit Verification</a>
            <a href="#questions">Common Questions</a>
          </div>
          <div>
            <strong>Artisans</strong>
            <a href="#professionals" onClick={() => openAuth('signup', 'artisan')}>
              Register As An Artisan
            </a>
            <a href="#how-it-works">For artisans</a>
            <a href="#trust">Finding another artisan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
