import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  ChevronRight,
  ArrowUpRight,
  Compass,
  MessagesSquare,
  Plus,
  Hammer,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  MapPin,
  CircleCheck,
  UserRound,
  X
} from 'lucide-react';
import { AuthScreen } from './live/Auth';
import { PublicSite } from './live/Public';
import { Onboarding } from './live/Onboarding';
import { Overview } from './live/Overview';
import { api, Artisan, Config, initialize, Me, supabase, Job } from './live/api';
import { Button } from './live/ui';
import { TwoToneStickHouse } from './components/TwoToneStickHouse';

const Account = lazy(() => import('./live/Account').then(module => ({ default: module.Account })));
const Discovery = lazy(() => import('./live/Discovery').then(module => ({ default: module.Discovery })));
const Jobs = lazy(() => import('./live/Jobs').then(module => ({ default: module.Jobs })));
const JobWorkspace = lazy(() => import('./live/Jobs').then(module => ({ default: module.JobWorkspace })));
const MissionControl = lazy(() => import('./live/MissionControl').then(module => ({ default: module.MissionControl })));
const ArtisanProfile = lazy(() => import('./live/Profile').then(module => ({ default: module.ArtisanProfile })));

type View = 'home' | 'discover' | 'jobs' | 'messages' | 'mission' | 'account';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function ShellIcon({ icon: Icon, label, active, collapsed, badge, onClick }: { icon: typeof Compass; label: string; active: boolean; collapsed: boolean; badge?: string; onClick: () => void }) {
  return (
    <button className={`shell-nav-item ${active ? 'active' : ''}`} onClick={onClick} title={collapsed ? label : undefined} aria-current={active ? 'page' : undefined}>
      <Icon size={18} />
      {!collapsed && <><span>{label}</span>{badge && <small className="nav-count">{badge}</small>}</>}
    </button>
  );
}

export default function LiveApp() {
  const [configReady, setConfigReady] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [configError, setConfigError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [artisansLoading, setArtisansLoading] = useState(false);
  const [artisansError, setArtisansError] = useState('');
  const [view, setView] = useState<View>('home');
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [recovering, setRecovering] = useState(() => new URLSearchParams(location.search).get('recovery') === '1');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const mapToken = config?.mapboxToken || '';
  const refresh = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setMe(null);
      setJobs([]);
      return;
    }
    const profile = await api<Me>('/me');
    const userJobs = await api<Job[]>('/jobs');
    setMe(profile);
    setJobs(userJobs);
  };

  const loadArtisans = async () => {
    setArtisansLoading(true);
    setArtisansError('');
    try {
      setArtisans(await api<Artisan[]>('/artisans'));
    } catch (error: any) {
      setArtisansError(error.message || 'We could not load the artisan directory.');
    } finally {
      setArtisansLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    void initialize()
      .then((nextConfig) => {
        if (alive) {
          setConfig(nextConfig);
          setConfigReady(true);
        }
      })
      .catch(() => {
        if (alive) setConfigError('callOga could not connect to its account service.');
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!configReady) return;
    if (!supabase) {
      setSessionReady(true);
      return;
    }
    let alive = true;
    const sync = async () => {
      try {
        await refresh();
        if (alive) setSessionReady(true);
      } catch (error: any) {
        if (error?.status === 401) {
          await supabase?.auth.signOut({ scope: 'local' });
          if (alive) {
            setMe(null);
            setJobs([]);
            setConfigError('Your session expired. Please sign in again.');
          }
        } else if (alive) {
          setConfigError('We could not load your account. Please try again.');
        }
        if (alive) setSessionReady(true);
      }
    };
    void sync();
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setRecovering(true); setTimeout(() => { if (alive) void sync(); }, 0); });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [configReady]);

  useEffect(() => {
    if (me) void loadArtisans();
  }, [me?.profile.id]);

  useEffect(() => {
    if (!me || new URLSearchParams(location.search).get('verification') !== 'return') return;
    let active = true;
    setView('account');
    void api<{ status: string }>('/verification/refresh', 'POST', {})
      .then(async ({ status }) => {
        if (!active) return;
        await refresh();
        setToast(status === 'verified' ? 'Identity verified. Your profile can now be published.' : 'Verification status updated.');
      })
      .catch((error: Error) => {
        if (active) setToast(error.message || 'We could not refresh verification yet.');
      })
      .finally(() => {
        if (active) history.replaceState(null, '', '/#home');
      });
    return () => { active = false; };
  }, [me?.profile.id]);

  const firstName = me?.profile.full_name.trim().split(/\s+/)[0] || '';
  const onboarding = useMemo(() => {
    if (!me) return [];
    if (me.profile.role === 'artisan') {
      return [
        { label: 'Complete your profile', description: 'Add your trade, service area, and a short introduction.', done: Boolean(me.artisan?.headline && me.artisan?.bio && me.artisan?.area), destination: 'account' as const },
        { label: 'Verify your identity', description: 'Build trust with customers through identity verification.', done: me.artisan?.verification_status === 'verified', destination: 'account' as const },
        { label: 'Receive your first booking', description: 'Your requests and active work will appear here.', done: jobs.length > 0, destination: 'jobs' as const }
      ];
    }
    if (me.profile.role === 'admin') return [];
    return [
      { label: 'Complete your profile', description: 'Add your contact number and neighbourhood.', done: Boolean(me.profile.full_name && me.profile.phone && me.profile.area), destination: 'account' as const },
      { label: 'Request your first service', description: 'Choose an artisan and tell them what you need.', done: jobs.length > 0, destination: 'discover' as const }
    ];
  }, [jobs.length, me]);
  const completedSteps = onboarding.filter((item) => item.done).length;
  const activeJobs = jobs.filter((job) => !['completed', 'declined', 'cancelled'].includes(job.status));

  const navigate = (next: View) => {
    setView(next);
    setSelectedArtisan(null);
    setSelectedJob(null);
    setMobileNav(false);
  };

  const signOut = async () => {
    await supabase?.auth.signOut({ scope: 'local' });
    setMe(null);
    setJobs([]);
    setView('home');
    history.replaceState(null, '', '/#home');
  };

  if (!configReady || !sessionReady) {
    return <div className="app-loading"><div className="brand-mark"><TwoToneStickHouse size={22} /></div><div className="loading-line" /><p>{configError || 'Connecting to callOga...'}</p></div>;
  }

  if (!supabase) {
    return <div className="center-state"><ShieldCheck size={32} /><h1>Accounts are not connected</h1><p>callOga needs its Supabase configuration before anyone can sign in.</p></div>;
  }

  if (recovering) return <AuthScreen initialMode="update" onBack={() => { setRecovering(false); history.replaceState(null, '', '/#home'); }} onSuccess={async () => { setRecovering(false); history.replaceState(null, '', '/#home'); await refresh(); }} />;
  if (!me) return <PublicSite onSignedIn={async () => { await refresh(); history.replaceState(null, '', '/#home'); }} />;
  if (me.profile.role !== 'admin' && (!me.profile.full_name || !me.profile.area || !me.profile.phone)) {
    return <Onboarding key={me.profile.id} me={me} onComplete={async () => { await refresh(); navigate(me.profile.role === 'artisan' ? 'account' : 'discover'); }} />;
  }
  const filteredArtisans = search.trim() ? artisans.filter((artisan) => `${artisan.display_name} ${artisan.trade} ${artisan.area} ${artisan.headline}`.toLowerCase().includes(search.toLowerCase())) : artisans;
  const activeView = selectedArtisan ? <ArtisanProfile initial={selectedArtisan} mapToken={mapToken} onBack={() => setSelectedArtisan(null)} onBooked={async (job) => { await refresh(); setSelectedArtisan(null); setSelectedJob(job); setView('jobs'); setToast('Booking request sent.'); }} /> : selectedJob ? <JobWorkspace job={selectedJob} userId={me.profile.id} token={mapToken} onBack={() => setSelectedJob(null)} onRefresh={refresh} toast={setToast} /> : view === 'discover' ? <Discovery artisans={filteredArtisans} loading={artisansLoading} error={artisansError} token={mapToken} name={firstName} onSelect={setSelectedArtisan} onJoin={() => navigate('account')} retry={loadArtisans} explore /> : view === 'jobs' ? <Jobs jobs={jobs} onOpen={setSelectedJob} /> : view === 'messages' ? <Jobs jobs={jobs} messages onOpen={setSelectedJob} /> : view === 'mission' ? <MissionControl token={mapToken} onOpenJob={setSelectedJob} /> : <Account me={me} refresh={refresh} toast={setToast} token={mapToken} onSignOut={signOut} />;

  return <div className={`app-shell ${collapsed ? 'nav-collapsed' : ''}`}>
    {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={`app-sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <div className="sidebar-head"><button className="brand-lockup" onClick={() => navigate('home')}><span className="brand-mark"><TwoToneStickHouse size={20} /></span>{!collapsed && <span>callOga</span>}</button><button className="icon-button mobile-only" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <nav className="shell-nav" aria-label="Main navigation">
        {!collapsed && <p className="nav-label">Workspace</p>}
        <ShellIcon icon={LayoutDashboard} label={me.profile.role === 'artisan' ? 'Business overview' : 'Home'} active={view === 'home' && !selectedArtisan && !selectedJob} collapsed={collapsed} onClick={() => navigate('home')} />
        {me.profile.role !== 'artisan' && <ShellIcon icon={Compass} label="Find artisans" active={view === 'discover' || Boolean(selectedArtisan)} collapsed={collapsed} onClick={() => navigate('discover')} />}
        <ShellIcon icon={BriefcaseBusiness} label={me.profile.role === 'artisan' ? 'Job requests' : 'My projects'} active={view === 'jobs' || Boolean(selectedJob)} collapsed={collapsed} badge={activeJobs.length ? String(activeJobs.length) : undefined} onClick={() => navigate('jobs')} />
        <ShellIcon icon={MessagesSquare} label="Messages" active={view === 'messages'} collapsed={collapsed} onClick={() => navigate('messages')} />
        {(me.profile.role === 'artisan' || me.profile.role === 'admin') && <ShellIcon icon={ShieldCheck} label="Live jobs" active={view === 'mission'} collapsed={collapsed} onClick={() => navigate('mission')} />}
        {!collapsed && <p className="nav-label nav-label-spaced">Account</p>}
        <ShellIcon icon={UserRound} label={me.profile.role === 'artisan' ? 'Business profile' : 'Profile & settings'} active={view === 'account'} collapsed={collapsed} onClick={() => navigate('account')} />
      </nav>
      <div className="sidebar-bottom"><button className="profile-shortcut" onClick={() => navigate('account')} title={collapsed ? (me.profile.full_name || 'Your account') : undefined}><span className="avatar-small">{initials(me.profile.full_name) || <UserRound size={14}/>}</span>{!collapsed && <span className="profile-shortcut-copy"><strong>{me.profile.full_name || 'Your account'}</strong><small>{me.profile.role}</small></span>}</button><button className="icon-button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button></div>
    </aside>
    <div className="app-main">
      <header className="app-topbar">
        <button className="icon-button mobile-only" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button>
        <button className="collapse-button desktop-only" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
        {me.profile.role === 'artisan' ? <div className="topbar-context"><span>Artisan workspace</span><strong>{me.artisan?.trade || 'Complete your business profile'}</strong></div> : <div className="topbar-search"><Search size={16} /><input value={search} onFocus={() => { if (view !== 'home' && view !== 'discover') navigate('discover'); }} onChange={(event) => { setSearch(event.target.value); if (view !== 'discover') navigate('discover'); }} placeholder="Search artisans by trade or area" aria-label="Search artisans by trade or area" /></div>}
        <button className="topbar-cta" onClick={() => navigate(me.profile.role === 'artisan' ? 'account' : 'discover')}><Plus size={16}/><span>{me.profile.role === 'artisan' ? 'Update business profile' : 'Find an artisan'}</span></button>
        <button className="topbar-profile" onClick={() => navigate('account')}><span className="avatar-small">{initials(me.profile.full_name) || <UserRound size={14}/>}</span><span className="desktop-only">{firstName || 'Account'}</span><ChevronRight size={15} /></button>
      </header>
      <main className="workspace"><Suspense fallback={<div className="hn-workspace-loading" role="status"><div className="loading-line"/><p>Opening your workspace…</p></div>}>{view === 'home' && !selectedArtisan && !selectedJob
        ? <Overview name={firstName} role={me.profile.role} profile={me.profile} artisan={me.artisan} jobs={jobs} artisanCount={artisans.length} artisansLoading={artisansLoading} onboarding={onboarding} onNavigate={(destination) => navigate(destination)} onOpenJob={setSelectedJob} />
        : <div className="workspace-content">{activeView}</div>}</Suspense>
      </main>
    </div>
    {toast && <button className="toast" onClick={() => setToast('')}>{toast}</button>}
  </div>;
}

