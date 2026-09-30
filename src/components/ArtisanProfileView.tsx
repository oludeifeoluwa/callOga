import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Award,
  Wrench,
  Hammer,
  Share2,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  Smartphone,
  Check
} from 'lucide-react';
import { storage } from '../lib/storage';
import { ArtisanProfile, Review } from '../types';
import { formatDistanceString, calculateDistanceKm } from '../services/locationService';

interface ArtisanProfileViewProps {
  artisanId: string;
  onNavigate: (view: string, data?: any) => void;
  onBack: () => void;
}

export const ArtisanProfileView: React.FC<ArtisanProfileViewProps> = ({
  artisanId,
  onNavigate,
  onBack
}) => {
  const [selectedPortfolioImg, setSelectedPortfolioImg] = useState<string | null>(null);

  const artisan = storage.getArtisanById(artisanId) || storage.getArtisans()[0];
  const reviews = storage.getReviewsForArtisan(artisan.id);

  return (
    <div id="artisan-profile-view-container" className="pb-32 pt-2 max-w-4xl mx-auto px-4 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between py-2">
        <button
          id="btn-back-from-profile"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${artisan.user.fullName} on callOga`,
                  text: `Check out ${artisan.user.fullName}, ${artisan.headlineTitle} on callOga.`,
                  url: window.location.href
                });
              }
            }}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs"
            title="Share profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('report', { reportedUserId: artisan.user.id })}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-rose-600 shadow-2xs"
            title="Report this profile"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Header Card (Matching Image 4) */}
      <section id="profile-header-card" className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gradient top band */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F97316] via-[#2563EB] to-[#0B0B0F]" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar with Verified Ring */}
          <div className="relative shrink-0">
            <img
              id="profile-avatar-img"
              src={artisan.user.avatarUrl}
              alt={artisan.user.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-white shadow-md ring-4 ring-blue-50"
            />
            {artisan.verificationStatus === 'verified' && (
              <div
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center ring-4 ring-white shadow-sm"
                title="Identity Verified"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.8]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 id="profile-full-name" className="text-xl sm:text-2xl font-black text-[#0B0B0F]">
                {artisan.user.fullName}
              </h1>
              {artisan.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  NIN & BVN Verified
                </span>
              )}
            </div>

            <p id="profile-headline-title" className="text-sm font-bold text-[#2563EB] mt-1">
              {artisan.headlineTitle}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-stone-600 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {artisan.location.address || artisan.location.area}
              </span>
              <span>•</span>
              <strong className="text-[#0B0B0F]">
                {formatDistanceString(artisan.distanceKm)}
              </strong>
            </div>

            {/* Badges Row */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-[11px] font-bold">
                <Award className="w-3.5 h-3.5 text-[#F97316]" />
                Top 5% Rated in Lagos
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-[11px] font-semibold">
                <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                Phone Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-[11px] font-semibold">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                {artisan.responseTimeMinutes}m avg response
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Highlights Grid (Matching Image 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Rating
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-[#F97316] text-[#F97316]" />
              <span className="text-base font-black text-[#0B0B0F]">{artisan.ratingAverage}</span>
            </div>
            <span className="text-[10px] text-stone-500 font-medium">{artisan.reviewCount} reviews</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Distance
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="w-4 h-4 text-[#F97316]" />
              <span className="text-base font-black text-[#0B0B0F]">
                {(() => {
                  const custLoc = storage.getSavedCustomerLocation();
                  const dist = artisan.distanceKm !== undefined
                    ? artisan.distanceKm
                    : calculateDistanceKm(custLoc.lat, custLoc.lng, artisan.location.lat, artisan.location.lng);
                  return `${dist.toFixed(1)} km`;
                })()}
              </span>
            </div>
            <span className="text-[10px] text-stone-500 font-medium">{artisan.location.area}</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Experience
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-stone-700" />
              <span className="text-base font-black text-[#0B0B0F]">{artisan.experienceYears}+ Yrs</span>
            </div>
            <span className="text-[10px] text-stone-500 font-medium">{artisan.completedJobs} jobs done</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Availability
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-black text-[#2563EB] uppercase">Today</span>
            </div>
            <span className="text-[10px] text-stone-500 font-medium">Ready for dispatch</span>
          </div>
        </div>
      </section>

      {/* About & Equipment Highlights */}
      <section id="profile-about-section" className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
          About the Artisan
        </h2>

        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          {artisan.bio}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {artisan.education && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Training & Credentials</span>
                <span className="text-xs font-bold text-stone-800">{artisan.education}</span>
              </div>
            </div>
          )}

          {artisan.equipmentHighlight && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Workshop Equipment</span>
                <span className="text-xs font-bold text-stone-800">{artisan.equipmentHighlight}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services & Pricing (Matching Image 4) */}
      <section id="profile-services-section" className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0B0B0F] tracking-tight">
            Services & Rates
          </h2>
          <span className="text-xs font-semibold text-stone-500">
            Escrow Protected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {artisan.services.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-[#F97316]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0B0B0F] text-sm">{srv.serviceName}</h4>
                  <span className="text-xs font-black text-[#0B0B0F]">
                    ₦{srv.startingPrice.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-stone-600 leading-snug">
                  {srv.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">
                  {srv.pricingType === 'fixed' ? 'Fixed Price' : srv.pricingType === 'inspection_fee' ? 'Inspection Fee' : 'Starting From'}
                </span>
                <button
                  onClick={() => onNavigate('job_request', { artisanId: artisan.id, serviceName: srv.serviceName })}
                  className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5"
                >
                  Book this →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Work Gallery (Matching Image 4) */}
      <section id="profile-gallery-section" className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#0B0B0F] tracking-tight">
              Verified Work Gallery
            </h2>
            <p className="text-xs text-stone-500">
              Real jobs completed and verified in Lagos homes
            </p>
          </div>
          <span className="text-xs font-bold text-[#2563EB]">
            {artisan.portfolio.length} Projects
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {artisan.portfolio.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPortfolioImg(item.imageUrl)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-square relative"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                  {item.locationTag}
                </span>
                <h5 className="text-xs font-bold leading-tight">{item.title}</h5>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Client Reviews */}
      <section id="profile-reviews-section" className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
              Client Reviews & Feedback
            </h2>
            <p className="text-xs text-stone-500">
              Only customers with verified completed jobs can leave reviews
            </p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-900 text-xs font-black">
            <Star className="w-3.5 h-3.5 fill-[#F2B84B] text-[#F2B84B]" />
            <span>{artisan.ratingAverage}</span>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-xs text-stone-500 py-3 text-center">No reviews yet.</p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                      {rev.customerName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{rev.customerName}</h4>
                      <span className="text-[10px] text-stone-400">{rev.customerArea}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-[#F2B84B] text-[#F2B84B]'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {rev.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600 text-[10px] font-semibold"
                      >
                        <Check className="w-3 h-3 text-[#2563EB]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Sticky Bottom Booking Bar (Matching Image 4) */}
      <div
        id="profile-sticky-bottom-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Starting Fee
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-stone-900">
                ₦{artisan.baseFee.toLocaleString()}
              </span>
              <span className="text-xs text-stone-500 font-normal">/ inspection</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-profile-message-pro"
              onClick={() => {
                const conv = storage.getOrCreateConversation(artisan.id);
                onNavigate('messages', { conversationId: conv.id });
              }}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Pro</span>
            </button>

            <button
              id="btn-profile-request-job"
              onClick={() => onNavigate('job_request', { artisanId: artisan.id })}
              className="px-5 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <span>Request a Job</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
