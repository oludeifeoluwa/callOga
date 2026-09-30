import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Job } from '../types';

interface JobsListViewProps {
  onNavigate: (view: string, data?: any) => void;
}

export const JobsListView: React.FC<JobsListViewProps> = ({ onNavigate }) => {
  const currentUser = storage.getCurrentUser();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const jobs = (currentUser ? storage.getJobs(currentUser.role) : []);

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'active') return j.status === 'in_progress' || j.status === 'scheduled' || j.status === 'pending';
    if (filter === 'completed') return j.status === 'completed';
    return true;
  });

  return (
    <div id="jobs-list-view" className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            {currentUser?.role === 'artisan' ? 'Your Job Orders' : 'Your Booked Jobs'}
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Track active repair orders, milestone updates, and escrow guarantees
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start sm:self-auto border border-stone-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'active' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
            }`}
          >
            Active ({jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'completed' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
            }`}
          >
            Completed ({jobs.filter((j) => j.status === 'completed').length})
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900">No jobs in this category</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Browse verified nearby artisans to request repairs or custom craftsmanship.
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="mt-2 px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Find Artisans Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onNavigate('job_tracking', { jobId: job.id })}
              className="bg-white rounded-3xl border border-stone-200 p-5 hover:border-[#F97316]/50 transition-all hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    #{job.jobCode}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'completed'
                      ? 'bg-blue-100 text-[#2563EB]'
                      : job.status === 'in_progress'
                      ? 'bg-orange-100 text-[#F97316]'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  {job.escrowStatus === 'held_in_escrow' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#2563EB] font-bold">
                      <ShieldCheck className="w-3 h-3" /> SafePay Escrow
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-[#0B0B0F]">
                  {job.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="font-semibold text-stone-700">
                    Pro: {job.artisan.user.fullName} ({job.trade.name})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {job.location.area}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {job.scheduledDate}
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                    Escrow Amount
                  </span>
                  <span className="text-base font-black text-[#0B0B0F]">
                    ₦{job.escrowAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#F97316] mt-1">
                  <span>Track Live</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
