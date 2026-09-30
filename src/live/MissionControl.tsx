import { useEffect, useState, useMemo } from 'react';
import {
  Activity,
  Navigation,
  ShieldCheck,
  Radio,
  Clock,
  MapPin,
  RefreshCw,
  Users,
  Compass,
  AlertCircle
} from 'lucide-react';
import { MapView, Pin } from './Map';
import { api, TelemetryFeed, Job, currency, human } from './api';
import { Badge, Button, Empty, SectionTitle } from './ui';
import { motion } from 'motion/react';

export function MissionControl({
  token,
  onOpenJob
}: {
  token: string;
  onOpenJob: (job: Job) => void;
}) {
  const [telemetry, setTelemetry] = useState<TelemetryFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'moving' | 'active'>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      setError('');
      const data = await api<TelemetryFeed>('/live/telemetry');
      setTelemetry(data);
    } catch (e: any) {
      setError(e.message || 'We could not refresh live jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const pins: Pin[] = useMemo(() => {
    if (!telemetry) return [];
    const list: Pin[] = [];

    // Add artisan live locations
    Object.entries(telemetry.liveLocations).forEach(([jobId, loc]) => {
      const job = telemetry.activeJobs.find((j) => j.id === jobId);
      list.push({
        id: `live-${jobId}`,
        latitude: loc.latitude,
        longitude: loc.longitude,
        label: `${job?.artisan?.display_name || 'Artisan'} · ${human(job?.status || 'Active')}`,
        live: true,
        accuracy: loc.accuracy,
        heading: loc.heading
      });
    });

    // Add destination pins for active jobs
    telemetry.activeJobs.forEach((job) => {
      if (job.latitude !== null && job.longitude !== null) {
        list.push({
          id: `dest-${job.id}`,
          latitude: job.latitude,
          longitude: job.longitude,
          label: `Site: ${job.title} (${job.address})`
        });
      }
    });

    return list;
  }, [telemetry]);

  const activeJobs = telemetry?.activeJobs || [];
  const liveCount = Object.keys(telemetry?.liveLocations || {}).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#2864e2] text-white p-7 rounded-3xl shadow-xl border border-blue-500 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-300 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
              LIVE JOBS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            See the work that is moving.
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Follow active bookings and location updates that artisans have chosen to share with their customers.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="bg-white/12 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center">
            <div className="text-xs text-blue-100">SHARING NOW</div>
            <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
              <Radio size={16} />
              {liveCount}
            </div>
          </div>
          <div className="bg-white/12 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center">
            <div className="text-xs text-blue-100">ACTIVE JOBS</div>
            <div className="text-xl font-bold text-white">{activeJobs.length}</div>
          </div>
          <Button
            onClick={fetchTelemetry}
            className="bg-white/12 hover:bg-white/20 text-white p-2.5 rounded-2xl border border-white/15 transition"
            aria-label="Refresh live jobs"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Map and active work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Compass className="text-emerald-600" size={20} />
              <h2 className="text-base font-bold text-gray-900">
                Shared job locations
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Refreshes every 6 seconds · Old positions expire automatically
            </span>
          </div>

          <div className="h-[460px] w-full rounded-2xl overflow-hidden relative">
            <MapView pins={pins} token={token} />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 px-2 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Live shared location
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13}/>
                Destination Site
              </span>
            </div>
            <span className="font-mono">
              Sharing requires artisan consent and ends with the job
            </span>
          </div>
        </div>

        {/* Live Active Feed (1 Col) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 flex flex-col h-[550px]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" />
              Active Engagements
            </h2>
            <Badge green={liveCount > 0}>{liveCount} sharing</Badge>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 mt-2 pr-1 space-y-2">
            {activeJobs.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Radio size={32} className="mx-auto text-gray-300 animate-pulse" />
                <p className="text-sm">No active jobs in transit right now.</p>
                <p className="text-xs text-gray-400">
                  When an artisan starts an active job and shares their location, it appears here.
                </p>
              </div>
            ) : (
              activeJobs.map((job) => {
                const loc = telemetry?.liveLocations[job.id];
                const isSelected = selectedJobId === job.id;

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      onOpenJob(job);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition border ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {job.title}
                      </h3>
                      <Badge green={job.status === 'in_progress'}>
                        {human(job.status)}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-600 mt-1 flex items-center justify-between">
                      <span>Artisan: {job.artisan?.display_name}</span>
                      <strong className="text-emerald-700">{currency(job.budget)}</strong>
                    </div>

                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                      <MapPin size={13} className="shrink-0 text-gray-400" />
                      <span className="truncate">{job.address}</span>
                    </div>

                    {loc ? (
                      <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-mono">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          GPS ±{Math.round(loc.accuracy)}m
                        </span>
                        <span>{new Date(loc.updated_at).toLocaleTimeString()}</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        Location sharing awaiting consent
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
