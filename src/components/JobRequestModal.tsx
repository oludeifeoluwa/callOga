import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Upload,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { storage } from '../lib/storage';
import { ArtisanProfile, Trade } from '../types';

interface JobRequestModalProps {
  artisanId?: string;
  serviceName?: string;
  onClose: () => void;
  onJobCreated: (jobId: string) => void;
}

export const JobRequestModal: React.FC<JobRequestModalProps> = ({
  artisanId,
  serviceName,
  onClose,
  onJobCreated
}) => {
  const defaultArtisan = artisanId ? storage.getArtisanById(artisanId) : storage.getArtisans()[0];
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanProfile>(defaultArtisan || storage.getArtisans()[0]);

  const [title, setTitle] = useState(serviceName ? `${serviceName} Project` : '');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState(40000);
  const [budgetMax, setBudgetMax] = useState(70000);
  const [scheduledDate, setScheduledDate] = useState('Tomorrow');
  const [timeWindow, setTimeWindow] = useState('Morning (09:00 AM - 12:00 PM)');
  const [address, setAddress] = useState('Admiralty Way, Lekki Phase 1, Lagos');
  const [area, setArea] = useState('Lekki Phase 1');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Escrow initial lock is 70% of min budget
  const escrowDeposit = Math.round(budgetMin * 0.7);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      setUploadedPhotos((prev) => [...prev, fakeUrl]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please specify a project title and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newJob = storage.createJob({
        artisanId: selectedArtisan.id,
        tradeId: selectedArtisan.tradeId,
        title,
        description,
        budgetMin,
        budgetMax,
        scheduledDate,
        preferredTimeWindow: timeWindow,
        address,
        area,
        images: uploadedPhotos
      });

      setIsSubmitting(false);
      onJobCreated(newJob.id);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit job request.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="job-request-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="job-request-dialog"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="text-lg font-black text-[#0B0B0F]">
              Request a Job from {selectedArtisan.user.fullName}
            </h2>
            <p className="text-xs text-[#2563EB] font-semibold">
              {selectedArtisan.headlineTitle} • {selectedArtisan.location.area}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-white border border-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-stone-700">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="font-bold text-[#0B0B0F] block mb-1">
              Project Title *
            </label>
            <input
              id="job-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Repair custom mahogany dining table & deep polish"
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F97316] text-sm text-[#0B0B0F] font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-[#0B0B0F] block mb-1">
              Detailed Description of Work *
            </label>
            <textarea
              id="job-description-input"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs fixing, room dimensions, wood or pipe type, and any specific requirements..."
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F97316] text-sm text-[#0B0B0F] font-normal leading-relaxed"
            />
          </div>

          {/* Photos Upload */}
          <div>
            <label className="font-bold text-stone-900 block mb-1">
              Upload Problem Photos (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-stone-700 font-semibold transition-colors">
                <Upload className="w-4 h-4 text-stone-500" />
                <span>Choose Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-stone-500">
                {uploadedPhotos.length} photo(s) selected
              </span>
            </div>
          </div>

          {/* Location & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                Job Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 12, Admiralty Way"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                Lagos Area / Neighborhood *
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Lekki Phase 1"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                Preferred Date *
              </label>
              <select
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none font-medium"
              >
                <option value="Today (Urgent Dispatch)">Today (Urgent Same-Day Dispatch)</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="Saturday">This Saturday</option>
                <option value="Next Week">Next Week</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                Preferred Time *
              </label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none font-medium"
              >
                <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (01:00 PM - 04:00 PM)</option>
                <option value="Evening (05:00 PM - 07:00 PM)">Evening (05:00 PM - 07:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-900">
                Your Estimated Budget (₦)
              </label>
              <span className="text-[11px] font-bold text-[#F97316]">
                ₦{budgetMin.toLocaleString()} – ₦{budgetMax.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-stone-400 block">Min (₦)</span>
                <input
                  type="number"
                  step="5000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-[#0B0B0F]"
                />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Max (₦)</span>
                <input
                  type="number"
                  step="5000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-[#0B0B0F]"
                />
              </div>
            </div>
          </div>

          {/* SafePay Escrow Notice */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="text-[11px] text-stone-700 leading-relaxed">
              <span className="font-bold text-[#0B0B0F] block">SafePay Escrow Protection:</span>
              ₦{escrowDeposit.toLocaleString()} (70% commitment) will be held safely in escrow. The artisan will only receive it after you personally inspect and approve the completed work with your release code.
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-[#0B0B0F] font-bold"
            >
              Cancel
            </button>
            <button
              id="btn-submit-job-request"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Job Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
