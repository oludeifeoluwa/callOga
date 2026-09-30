import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Wrench,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Check,
  Eye
} from 'lucide-react';
import { storage } from '../lib/storage';
import { ArtisanProfile, Job } from '../types';

interface AdminDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'artisans' | 'jobs' | 'reports'>('verifications');
  const [searchFilter, setSearchFilter] = useState('');

  const artisans = storage.getArtisans();
  const jobs = storage.getJobs('admin');
  const reports = storage.getReports();
  const metrics = storage.getAdminMetrics();

  const pendingVerifications = artisans.filter((a) => a.verificationStatus === 'pending');
  const verifiedArtisans = artisans.filter((a) => a.verificationStatus === 'verified');

  const handleVerify = (artisanId: string, approve: boolean) => {
    storage.updateArtisanVerification(artisanId, approve ? 'verified' : 'failed');
  };

  return (
    <div id="admin-dashboard-view" className="pb-32 pt-4 px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B0B0F] text-white p-6 rounded-3xl border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#2563EB] text-[10px] font-black uppercase tracking-wider text-white">
              Operations Control
            </span>
            <span className="text-xs text-stone-400">callOga Governance Portal</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Platform Governance Dashboard</h1>
          <p className="text-xs text-stone-300">
            Monitor Didit verification pipelines, SafePay escrow transactions, and artisan safety records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-semibold text-blue-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>Real Database Ledger State</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards (Actual Database Aggregation, Zero Fake Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Total Platform Users
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-5 h-5 text-[#0B0B0F]" />
            <span className="text-2xl font-black text-[#0B0B0F]">{metrics.totalUsers}</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">Genuine accounts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Active Artisans
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Wrench className="w-5 h-5 text-[#F97316]" />
            <span className="text-2xl font-black text-[#0B0B0F]">{metrics.totalArtisans}</span>
          </div>
          <span className="text-[10px] text-[#2563EB] font-semibold">{metrics.verifiedArtisans} Didit verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Jobs Completed
          </span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
            <span className="text-2xl font-black text-[#0B0B0F]">{metrics.completedJobs}</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">{metrics.activeJobs} active in progress</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
            Escrow Volume Processed
          </span>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="w-5 h-5 text-[#F97316]" />
            <span className="text-xl sm:text-2xl font-black text-[#0B0B0F]">₦{metrics.totalEscrowHeld.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-[#2563EB] font-semibold">{metrics.totalReports} incident reports</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'verifications'
              ? 'bg-[#0B0B0F] text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Identity Verification Queue ({pendingVerifications.length})
        </button>

        <button
          onClick={() => setActiveTab('artisans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'artisans'
              ? 'bg-[#0B0B0F] text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All Artisans ({artisans.length})
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'jobs'
              ? 'bg-[#0B0B0F] text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Escrow & Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-[#0B0B0F] text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Incidents & Reports ({reports.length})
        </button>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0B0B0F]">
              Pending Didit Verification Requests
            </h2>
            <span className="text-xs text-stone-400">
              NIN & BVN matching via Didit
            </span>
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              All artisan verification requests have been processed. No queue backlog.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {pendingVerifications.map((artisan) => (
                <div
                  key={artisan.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={artisan.user.avatarUrl}
                      alt={artisan.user.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#0B0B0F]">{artisan.user.fullName}</h4>
                      <p className="text-xs text-[#2563EB] font-semibold">{artisan.headlineTitle}</p>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span>{artisan.location.area}</span>
                        <span>•</span>
                        <span>{artisan.user.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleVerify(artisan.id, false)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(artisan.id, true)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-2xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Didit ID</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: All Artisans Management */}
      {activeTab === 'artisans' && (
        <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0B0B0F]">
              Artisan Database & Verification Status
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              Showing {artisans.length} registered artisans
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={artisan.user.avatarUrl}
                    alt={artisan.user.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-[#0B0B0F]">{artisan.user.fullName}</h4>
                      {artisan.verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-[#2563EB]" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">{artisan.headlineTitle} • {artisan.location.area}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-[#0B0B0F]">
                    ₦{artisan.baseFee.toLocaleString()} base
                  </span>
                  <button
                    onClick={() => onNavigate('artisan_profile', { artisanId: artisan.id })}
                    className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold text-stone-700 text-xs"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: Escrow & Jobs */}
      {activeTab === 'jobs' && (
        <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0B0B0F]">
              Platform Escrow Transactions & Jobs
            </h2>
            <span className="text-xs text-stone-500">Real-time Escrow Ledger</span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-400 font-bold">#{job.jobCode}</span>
                    <span className="font-bold text-[#0B0B0F]">{job.title}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-[#2563EB] text-[10px] font-bold uppercase">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-stone-500 mt-1">
                    Customer: <strong>{job.customer.fullName}</strong> • Artisan: <strong>{job.artisan.user.fullName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Escrow</span>
                    <span className="font-black text-[#2563EB] block">
                      ₦{job.escrowAmount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('job_tracking', { jobId: job.id })}
                    className="px-3 py-1.5 bg-white border border-stone-200 text-[#0B0B0F] rounded-xl font-bold hover:bg-stone-100"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: Safety & Incident Reports */}
      {activeTab === 'reports' && (
        <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0B0B0F]">
              Dispute & Incident Reports Log
            </h2>
            <span className="text-xs text-stone-500">
              Showing {reports.length} user-submitted incidents
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No dispute or safety reports currently filed. Zero open complaints.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {reports.map((report) => (
                <div key={report.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="font-extrabold text-xs uppercase text-[#0B0B0F]">
                        {report.reason.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        report.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    "{report.description}"
                  </p>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                    <span>Reported User: <strong>{report.reportedUser.fullName}</strong></span>
                    {(report.status === 'pending' || report.status === 'investigating') && (
                      <button
                        onClick={() => storage.updateReportStatus(report.id, 'resolved', 'Resolved by platform administrator')}
                        className="px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold text-xs"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
