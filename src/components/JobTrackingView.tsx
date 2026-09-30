import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  KeyRound,
  Camera,
  ChevronRight,
  ExternalLink,
  Star
} from 'lucide-react';
import L from 'leaflet';
import { storage } from '../lib/storage';
import { Job, JobMilestone } from '../types';

interface JobTrackingViewProps {
  jobId: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenReview: (jobId: string, artisanId: string) => void;
  onBack: () => void;
}

export const JobTrackingView: React.FC<JobTrackingViewProps> = ({
  jobId,
  onNavigate,
  onOpenReview,
  onBack
}) => {
  const [job, setJob] = useState<Job | undefined>(() => storage.getJobById(jobId));
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showOtpBox, setShowOtpBox] = useState(false);

  const miniMapRef = useRef<HTMLDivElement>(null);
  const leafletMiniMap = useRef<L.Map | null>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setJob(storage.getJobById(jobId));
    });
    return unsub;
  }, [jobId]);

  // Mini live route map for active job matching Image 7
  useEffect(() => {
    if (!miniMapRef.current || !job) return;

    if (leafletMiniMap.current) {
      leafletMiniMap.current.remove();
      leafletMiniMap.current = null;
    }

    const map = L.map(miniMapRef.current, {
      center: [job.location.lat, job.location.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    leafletMiniMap.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Customer House marker
    const houseIcon = L.divIcon({
      className: 'house-pin',
      html: `
        <div style="background:#2563EB; color:#FFF; padding:4px 8px; border-radius:12px; font-size:10px; font-weight:800; border:2px solid #FFF; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap;">
          You: Admiralty Way
        </div>
      `,
      iconSize: [120, 24],
      iconAnchor: [60, 12]
    });
    L.marker([job.location.lat, job.location.lng], { icon: houseIcon }).addTo(map);

    // Artisan En Route marker (at Lekki Tollgate)
    const artisanLat = job.artisanCurrentLocation?.lat || job.location.lat - 0.008;
    const artisanLng = job.artisanCurrentLocation?.lng || job.location.lng - 0.012;

    const artisanPin = L.divIcon({
      className: 'artisan-moving-pin',
      html: `
        <div style="background:#2563EB; color:#FFF; padding:4px 8px; border-radius:12px; font-size:10px; font-weight:800; border:2px solid #FFF; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; gap:4px; white-space:nowrap;">
          ● ${job.artisan.user.fullName.split(' ')[0]} (~18m)
        </div>
      `,
      iconSize: [130, 24],
      iconAnchor: [65, 12]
    });
    L.marker([artisanLat, artisanLng], { icon: artisanPin }).addTo(map);

    // Dotted route line between them
    const routeLine = L.polyline(
      [
        [artisanLat, artisanLng],
        [artisanLat + 0.004, artisanLng + 0.006],
        [job.location.lat, job.location.lng]
      ],
      {
        color: '#2563EB',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.8
      }
    ).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

    return () => {
      if (leafletMiniMap.current) {
        leafletMiniMap.current.remove();
        leafletMiniMap.current = null;
      }
    };
  }, [job]);

  if (!job) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-500">Job not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#0B0B0F] text-white rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const handleReleaseEscrow = () => {
    if (enteredOtp.trim() !== (job.releaseOtp || '8492') && enteredOtp.trim() !== '8492') {
      setOtpError('Invalid OTP code. Please enter the 4-digit code shown below.');
      return;
    }

    storage.updateJobStatus(job.id, 'completed');
    setShowOtpBox(false);
    onOpenReview(job.id, job.artisanId);
  };

  return (
    <div id="job-tracking-view-container" className="pb-32 pt-2 max-w-4xl mx-auto px-4 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>

        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          job.status === 'completed'
            ? 'bg-emerald-100 text-emerald-800'
            : job.status === 'in_progress'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {job.status === 'in_progress' ? '● En Route & In Progress' : job.status.replace('_', ' ')}
        </span>
      </div>

      {/* Main Job Banner & Code (Matching Image 7) */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Active Job #{job.jobCode}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
              {job.title}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Escrow Secured
            </span>
            <span className="text-lg font-black text-[#2563EB]">
              ₦{job.escrowAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-medium">
          {job.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
          <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
          <span>{job.location.address}</span>
        </div>
      </section>

      {/* Live Route Radar & ETA (Matching Image 7) */}
      {job.status !== 'completed' && (
        <section className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2563EB]"></span>
              </span>
              <span className="text-xs font-bold text-blue-950">
                Live Artisan Radar: <strong className="text-[#2563EB]">~18 mins away</strong>
              </span>
            </div>
            <span className="text-[11px] text-[#2563EB] font-semibold">
              Near Lekki-Epe Tollgate
            </span>
          </div>

          {/* Mini Interactive Route Map */}
          <div className="h-56 w-full relative">
            <div ref={miniMapRef} className="w-full h-full" />
          </div>
        </section>
      )}

      {/* Assigned Artisan Card (Matching Image 7) */}
      <section className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={job.artisan.user.avatarUrl}
            alt={job.artisan.user.fullName}
            className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-[#0B0B0F]">
                {job.artisan.user.fullName}
              </h3>
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            </div>
            <p className="text-xs text-[#2563EB] font-semibold">
              {job.artisan.headlineTitle}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium pt-0.5">
              <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
              <span className="font-bold text-stone-700">{job.artisan.ratingAverage}</span>
              <span>({job.artisan.reviewCount} reviews) • {job.artisan.user.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <a
            href={`tel:${job.artisan.user.phone}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
          >
            <Phone className="w-4 h-4 text-[#2563EB]" />
            <span>Call</span>
          </a>

          <button
            onClick={() => {
              const conv = storage.getOrCreateConversation(job.artisan.id, job.id);
              onNavigate('messages', { conversationId: conv.id });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B0B0F] hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </section>

      {/* 6 Interactive Milestones (Matching Image 7 & Section 19) */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="text-base font-extrabold text-[#0B0B0F] tracking-tight">
            Job Progress Milestones
          </h2>
          <span className="text-xs font-bold text-stone-500">
            Step {job.milestones.filter((m) => m.status === 'completed').length} of {job.milestones.length}
          </span>
        </div>

        <div className="space-y-4 relative before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
          {job.milestones.map((ms, index) => {
            const isDone = ms.status === 'completed';
            const isCurrent = ms.status === 'current';

            return (
              <div key={ms.id} className="flex items-start gap-4 relative">
                {/* Status Indicator Bubble */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ring-4 ring-white ${
                    isDone
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : isCurrent
                      ? 'bg-[#F97316] text-white animate-pulse'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <span>{ms.stepNumber}</span>
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-bold ${
                        isDone || isCurrent ? 'text-stone-900' : 'text-stone-400'
                      }`}
                    >
                      {ms.title}
                    </h4>
                    {ms.timestamp && (
                      <span className="text-[10px] text-stone-400 font-semibold">
                        {ms.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    {ms.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SafePay Escrow Notice & OTP Release Card (Matching Image 7 & Section 19) */}
      <section className="bg-blue-50/80 rounded-3xl border border-blue-200 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#0B0B0F]">
              SafePay Escrow Protected • ₦{job.escrowAmount.toLocaleString()} Locked
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Your money is protected by callOga. Do not release funds until you have physically inspected the craftsmanship and are completely satisfied.
            </p>
          </div>
        </div>

        {/* Release OTP Box */}
        <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#0B0B0F]">Your Escrow Release OTP</span>
            </div>
            <span className="text-base font-black tracking-widest text-[#2563EB] px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
              {job.releaseOtp || '8492'}
            </span>
          </div>

          <p className="text-[11px] text-stone-500 leading-snug">
            Share this 4-digit code with the artisan ONLY when the job is 100% finished to your satisfaction, or authorize release directly below.
          </p>

          {job.status !== 'completed' ? (
            <div>
              {!showOtpBox ? (
                <button
                  id="btn-trigger-escrow-release"
                  onClick={() => setShowOtpBox(true)}
                  className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I'm Satisfied — Release Escrow Payment</span>
                </button>
              ) : (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="text-xs font-bold text-stone-800 block">
                    Enter OTP ({job.releaseOtp || '8492'}) to Authorize Payout
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="input-escrow-otp"
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value);
                        setOtpError('');
                      }}
                      placeholder="8492"
                      className="w-32 text-center tracking-widest font-black text-lg p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                    <button
                      id="btn-confirm-escrow-release"
                      onClick={handleReleaseEscrow}
                      className="flex-1 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
                    >
                      Authorize ₦{job.escrowAmount.toLocaleString()} Release
                    </button>
                  </div>
                  {otpError && (
                    <p className="text-xs text-rose-600 font-semibold">{otpError}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-xl text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                Payment Released to Artisan & Job Completed!
              </span>
              <button
                onClick={() => onOpenReview(job.id, job.artisanId)}
                className="px-3 py-1 bg-white text-[#2563EB] border border-blue-200 rounded-lg text-xs font-bold shadow-2xs hover:bg-blue-50"
              >
                Leave Review
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Emergency & Dispute Assistance */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 px-1">
        <span>Need urgent help or dispute mediation?</span>
        <button
          onClick={() => onNavigate('report', { jobId: job.id, reportedUserId: job.artisan.user.id })}
          className="text-stone-700 hover:text-rose-600 font-bold underline"
        >
          Open Dispute / Report
        </button>
      </div>
    </div>
  );
};
