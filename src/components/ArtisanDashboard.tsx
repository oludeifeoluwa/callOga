import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Star,
  DollarSign,
  AlertCircle,
  Phone,
  MessageSquare,
  ChevronRight,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Job, ArtisanProfile } from '../types';

interface ArtisanDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export const ArtisanDashboard: React.FC<ArtisanDashboardProps> = ({ onNavigate }) => {
  const currentUser = storage.getCurrentUser();
  const currentArtisan = storage.getArtisans().find((a) => a.userId === currentUser?.id) || storage.getArtisans()[0];
  const jobs = storage.getJobs('artisan');

  const pendingRequests = storage.getJobRequestsForArtisan(currentArtisan.id);
  const activeJobs = jobs.filter((j) => j.status === 'scheduled' || j.status === 'in_progress');

  const [availability, setAvailability] = useState(currentArtisan.availabilityStatus);

  const handleJobAction = (jobId: string, action: 'accept' | 'decline') => {
    storage.artisanRespondToJobRequest(jobId, action);
  };

  const handleUpdateStatus = (jobId: string, status: any) => {
    storage.updateJobStatus(jobId, status);
  };

  return (
    <div id="artisan-dashboard-view" className="pb-32 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={currentArtisan.user.avatarUrl}
            alt={currentArtisan.user.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2563EB]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B0B0F]">
                Good morning, {currentArtisan.user.fullName.split(' ')[0]}
              </h1>
              {currentArtisan.verificationStatus === 'verified' && (
                <span className="p-1 rounded-full bg-[#2563EB] text-white" title="Verified Pro">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-[#2563EB] font-bold mt-0.5">
              {currentArtisan.headlineTitle} • {currentArtisan.location.area}
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-200 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-stone-500 pl-2">Status:</span>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as any)}
            className="text-xs font-bold py-1.5 px-3 bg-white border border-stone-200 rounded-xl text-[#0B0B0F] focus:outline-none focus:border-[#F97316]"
          >
            <option value="available_today">Available Today</option>
            <option value="available_now">Available Right Now</option>
            <option value="tomorrow">Booking for Tomorrow</option>
            <option value="busy">Busy on Site</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Rating Average
          </span>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 fill-[#F97316] text-[#F97316]" />
            <span className="text-xl font-black text-[#0B0B0F]">{currentArtisan.ratingAverage}</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">{currentArtisan.reviewCount} reviews</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Jobs Completed
          </span>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xl font-black text-[#0B0B0F]">{currentArtisan.completedJobs}</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">100% verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Active in Escrow
          </span>
          <div className="flex items-center gap-1 mt-1">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xl font-black text-[#0B0B0F]">
              ₦{jobs.reduce((s, j) => s + (j.escrowStatus === 'held_in_escrow' ? j.escrowAmount : 0), 0).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">Locked payouts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Profile Strength
          </span>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xl font-black text-[#0B0B0F]">92%</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">Didit Verified</span>
        </div>
      </div>

      {/* Incoming Job Requests (Section 18) */}
      <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#0B0B0F]">
              Incoming Job Requests
            </h2>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#F97316] text-xs font-bold">
                {pendingRequests.length} New
              </span>
            )}
          </div>
          <span className="text-xs text-stone-400">Respond within 30 mins</span>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">No pending job requests right now.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req: Job) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-stone-400">#{req.jobCode}</span>
                    <h4 className="text-sm font-bold text-[#0B0B0F]">{req.title}</h4>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{req.description}</p>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
                    <span>Customer: <strong className="text-[#0B0B0F]">{req.customer.fullName}</strong></span>
                    <span>•</span>
                    <span>{req.location.area}</span>
                    <span>•</span>
                    <span className="text-[#F97316] font-bold">Budget: ₦{req.budgetMin.toLocaleString()} - ₦{req.budgetMax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleJobAction(req.id, 'decline')}
                    className="px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-xl"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleJobAction(req.id, 'accept')}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#F97316] hover:bg-orange-600 rounded-xl shadow-2xs transition-all"
                  >
                    Accept Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ongoing Work in Progress */}
      <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-[#0B0B0F]">
          Ongoing Active Jobs ({activeJobs.length})
        </h2>

        {activeJobs.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">No jobs currently in progress.</p>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                      #{job.jobCode} • {job.status.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-extrabold text-[#0B0B0F] mt-0.5">
                      {job.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Customer: {job.customer.fullName} • {job.location.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Escrow Locked</span>
                    <span className="text-base font-black text-[#2563EB]">
                      ₦{job.escrowAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-500">
                    Ask customer for their 4-digit release OTP code to claim ₦{job.escrowAmount.toLocaleString()}.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('job_tracking', { jobId: job.id })}
                      className="px-3.5 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50"
                    >
                      Track Job
                    </button>
                    {job.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'in_progress')}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-[#F97316] hover:bg-orange-600 rounded-xl shadow-2xs"
                      >
                        I'm On the Way
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
