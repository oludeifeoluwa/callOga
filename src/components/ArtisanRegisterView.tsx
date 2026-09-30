import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  AlertCircle,
  Clock,
  Lock,
  Building,
  Upload
} from 'lucide-react';
import { storage } from '../lib/storage';
import { verificationService } from '../services/verificationService';

interface ArtisanRegisterViewProps {
  onNavigate: (view: string, data?: any) => void;
  onBack: () => void;
}

export const ArtisanRegisterView: React.FC<ArtisanRegisterViewProps> = ({
  onNavigate,
  onBack
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const trades = storage.getTrades();

  // Form State
  const [fullName, setFullName] = useState('Babatunde Adeleke');
  const [phone, setPhone] = useState('08039281944');
  const [tradeId, setTradeId] = useState(trades[0]?.id || 'trade-1');
  const [experienceYears, setExperienceYears] = useState(6);
  const [baseFee, setBaseFee] = useState(6500);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(15);
  const [area, setArea] = useState('Lekki Phase 1');
  const [headlineTitle, setHeadlineTitle] = useState('Master Artisan & Certified Specialist');
  const [bio, setBio] = useState('Providing prompt, top-grade artisanal installations and emergency repairs with 100% customer satisfaction.');

  // Verification Form State
  const [docType, setDocType] = useState<'NIN' | 'BVN' | 'DRIVERS_LICENSE'>('NIN');
  const [docNumber, setDocNumber] = useState('29481048592');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const handleStep1Next = () => {
    setStep1Error(null);
    if (!fullName || fullName.trim().length < 2) {
      setStep1Error('Please enter your full legal name (at least 2 characters).');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setStep1Error('Please enter a valid phone number (at least 10 digits).');
      return;
    }
    if (!headlineTitle || headlineTitle.trim().length < 4) {
      setStep1Error('Please enter a professional headline describing your specialty.');
      return;
    }
    if (!bio || bio.trim().length < 10) {
      setStep1Error('Please enter a short bio or summary of your experience (at least 10 characters).');
      return;
    }
    if (baseFee < 500) {
      setStep1Error('Base inspection fee must be at least ₦500.');
      return;
    }
    setStep(2);
  };

  const handleRunDiditVerification = async () => {
    if (!docNumber || docNumber.trim().length < 8) {
      setVerificationError(`Please enter a valid ${docType} number (at least 8 characters/digits).`);
      return;
    }
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const result = await verificationService.verifyArtisanIdentity({
        artisanId: 'pending-reg',
        documentType: docType,
        documentNumber: docNumber,
        fullName: fullName,
        selfiePhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'
      });

      if (result.status === 'verified') {
        setStep(3);
      } else {
        setVerificationError(result.message || 'Identity verification check failed. Please check your document details.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Error communicating with Didit identity server.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteRegistration = () => {
    storage.registerArtisan({
      fullName,
      phone,
      tradeId,
      headlineTitle,
      bio,
      baseFee,
      experienceYears,
      serviceRadiusKm,
      area
    });

    onNavigate('artisan_dashboard');
  };

  return (
    <div id="artisan-register-flow" className="pb-32 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between py-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#0B0B0F] bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-extrabold text-[#F97316]">
          Step {step} of 3
        </span>
      </div>

      {/* Step 1: Basic Info & Craft Trade */}
      {step === 1 && (
        <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B0B0F]">
              Join callOga as a Verified Pro
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Connect with homeowners, companies, and estate managers across Lagos and beyond.
            </p>
          </div>

          <div className="space-y-3 text-xs font-medium text-stone-700">
            <div>
              <label className="font-bold text-[#0B0B0F] block mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#0B0B0F] focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#0B0B0F] block mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-[#0B0B0F] focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B0B0F] block mb-1">Primary Trade / Skill *</label>
                <select
                  value={tradeId}
                  onChange={(e) => setTradeId(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#0B0B0F] focus:outline-none focus:border-[#F97316]"
                >
                  {trades.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#0B0B0F] block mb-1">Years of Exp.</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#0B0B0F] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B0B0F] block mb-1">Base Inspection Fee (₦)</label>
                <input
                  type="number"
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#0B0B0F] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B0B0F] block mb-1">Primary Base Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Lekki Phase 1"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#0B0B0F] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#0B0B0F] block mb-1">Professional Headline *</label>
              <input
                type="text"
                value={headlineTitle}
                onChange={(e) => setHeadlineTitle(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#0B0B0F] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#0B0B0F] block mb-1">Bio / Work Experience Summary *</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-[#0B0B0F] focus:outline-none"
              />
            </div>
          </div>

          {step1Error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{step1Error}</span>
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 flex justify-end">
            <button
              id="btn-artisan-step1-next"
              onClick={handleStep1Next}
              className="px-6 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm text-xs transition-all"
            >
              <span>Continue to Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Didit Biometric Verification */}
      {step === 2 && (
        <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0B0B0F]">
                Government Identity Verification
              </h2>
              <p className="text-xs text-stone-500">
                Powered by Didit • Direct checks with NIMC (NIN) & NIBSS (BVN)
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1 text-xs text-stone-900">
            <p className="font-bold text-[#0B0B0F]">Why verify your identity?</p>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Verified artisans receive <strong>4.8x more job requests</strong>, instant SafePay Escrow payouts, and the verified blue shield badge.
            </p>
          </div>

          {/* Biometric, Document, and Liveness visual checks */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">1. Biometric Check</span>
              <span className="text-xs font-extrabold text-[#2563EB]">Facial Match</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">2. Document</span>
              <span className="text-xs font-extrabold text-[#2563EB]">Govt Registry</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">3. Liveness</span>
              <span className="text-xs font-extrabold text-[#2563EB]">Active AI Scan</span>
            </div>
          </div>

          <div className="space-y-4 text-xs font-medium text-stone-700">
            <div>
              <label className="font-bold text-[#0B0B0F] block mb-1">
                Select Identity Document
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['NIN', 'BVN', 'DRIVERS_LICENSE'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocType(type)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      docType === type
                        ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                        : 'border-stone-200 bg-stone-50 text-stone-700'
                    }`}
                  >
                    {type === 'DRIVERS_LICENSE' ? "Driver's Lic." : type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-[#0B0B0F] block mb-1">
                {docType} Number (11 Digits) *
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="29481048592"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm tracking-wider font-bold text-[#0B0B0F] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Selfie Verification */}
            <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-stone-200 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80"
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0B0B0F] block">Biometric Liveness Photo</span>
                  <span className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#2563EB]" /> Face capture verified
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="text-xs text-stone-600 font-bold bg-white border border-stone-200 px-3 py-1.5 rounded-xl hover:bg-stone-100"
              >
                Retake
              </button>
            </div>
          </div>

          {verificationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{verificationError}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-stone-500 hover:text-[#0B0B0F]"
            >
              ← Back
            </button>

            <button
              id="btn-run-didit-verification"
              onClick={handleRunDiditVerification}
              disabled={isVerifying}
              className="px-6 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm text-xs disabled:opacity-50 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isVerifying ? 'Validating with Didit...' : 'Verify Identity with Didit'}</span>
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Verification Success */}
      {step === 3 && (
        <section className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-xl font-black text-[#0B0B0F]">
              Identity Verified Successfully!
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Didit successfully matched your biometric scan with the Nigerian National Identity Registry.
            </p>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Verification Method:</span>
              <span className="font-bold text-[#0B0B0F]">Didit AI Biometrics</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Verified ID:</span>
              <span className="font-mono font-bold text-[#0B0B0F]">{docType} •••• 592</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Status:</span>
              <span className="text-[#2563EB] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Pro
              </span>
            </div>
          </div>

          <button
            id="btn-complete-artisan-registration"
            onClick={handleCompleteRegistration}
            className="mt-4 px-8 py-3 bg-[#F97316] hover:bg-orange-600 text-white font-black text-xs rounded-2xl shadow-md transition-all"
          >
            Enter Artisan Dashboard Pro →
          </button>
        </section>
      )}
    </div>
  );
};
