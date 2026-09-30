import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { storage } from '../lib/storage';

interface ReportModalProps {
  reportedUserId?: string;
  jobId?: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportedUserId,
  jobId,
  onClose
}) => {
  const [reason, setReason] = useState<'payment_issue' | 'unsafe_conduct' | 'inappropriate_behaviour' | 'fraud' | 'other'>('payment_issue');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    storage.createReport({
      reportedUserId: reportedUserId || 'reported-user',
      jobId,
      reason,
      description: details
    });

    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-black text-lg text-stone-900">Safety & Trust Report</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-[#0B0B0F]">Report Submitted</h4>
            <p className="text-xs text-stone-500">
              Our trust and security team has received your incident report and will inspect the audit logs within 2 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-[#0B0B0F] text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-stone-700">
            <div>
              <label className="font-bold text-stone-900 block mb-1">Reason for Report *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
              >
                <option value="payment_issue">Asking for direct offline cash outside SafePay Escrow</option>
                <option value="unsafe_conduct">Safety or property damage concern</option>
                <option value="inappropriate_behaviour">Unprofessional conduct or verbal abuse</option>
                <option value="fraud">Fraudulent claims or fake profile</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-900 block mb-1">Incident Details *</label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe what happened in detail..."
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Submit Report to Operations Team
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
