import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  CheckCircle2,
  Award,
  Check,
  UserCheck,
  PhoneCall,
  FileCheck2,
  Hammer,
  Wrench,
  Zap,
  Building2,
  Paintbrush,
  Flame,
  Grid3X3,
  Home as HomeIcon,
  Layers,
  Armchair,
  Car,
  Cpu
} from 'lucide-react';
import { storage } from '../lib/storage';
import { ArtisanProfile, Trade } from '../types';
import { formatDistanceString } from '../services/locationService';
import { ArtisansInteractiveMap } from './ArtisansInteractiveMap';

interface CustomerHomeProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenLocationModal: () => void;
  locationArea?: string;
  onOpenDiagnostics?: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onNavigate,
  onOpenLocationModal,
  locationArea = 'Victoria Island',
  onOpenDiagnostics
}) => {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedRadius, setSelectedRadius] = useState<number>(25);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'rating' | 'jobs'>('nearest');
  const [viewMode, setViewMode] = useState<'editorial' | 'map'>('editorial');

  // Database Data
  const trades: Trade[] = storage.getTrades();
  const customerLoc = storage.getSavedCustomerLocation();

  // Dynamic filtered artisans based on real coordinates
  const filteredArtisans = useMemo(() => {
    return storage.getArtisans({
      lat: customerLoc.lat,
      lng: customerLoc.lng,
      tradeId: selectedTrade === 'all' ? undefined : selectedTrade,
      searchQuery: searchQuery.trim() || undefined,
      radiusKm: selectedRadius,
      verifiedOnly: verifiedOnly || undefined,
      availableOnly: availableOnly || undefined,
      sortBy: sortBy
    });
  }, [customerLoc.lat, customerLoc.lng, selectedTrade, searchQuery, selectedRadius, verifiedOnly, availableOnly, sortBy]);

  // Nearby Featured Artisans (first 4 for rich visual variation)
  const nearbyFeatured = useMemo(() => {
    return storage.getArtisans({
      lat: customerLoc.lat,
      lng: customerLoc.lng,
      sortBy: 'nearest'
    }).slice(0, 4);
  }, [customerLoc.lat, customerLoc.lng]);

  const getTradeIcon = (slug: string) => {
    switch (slug) {
      case 'carpenter': return <Hammer className="w-4 h-4" />;
      case 'plumber': return <Wrench className="w-4 h-4" />;
      case 'electrician': return <Zap className="w-4 h-4" />;
      case 'mason': return <Building2 className="w-4 h-4" />;
      case 'painter': return <Paintbrush className="w-4 h-4" />;
      case 'welder': return <Flame className="w-4 h-4" />;
      case 'tiler': return <Grid3X3 className="w-4 h-4" />;
      case 'roofer': return <HomeIcon className="w-4 h-4" />;
      case 'pop-installer': return <Layers className="w-4 h-4" />;
      case 'furniture-maker': return <Armchair className="w-4 h-4" />;
      case 'mechanic': return <Car className="w-4 h-4" />;
      case 'generator-technician': return <Cpu className="w-4 h-4" />;
      default: return <Hammer className="w-4 h-4" />;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('explore', { query: searchQuery.trim(), trade: selectedTrade !== 'all' ? selectedTrade : undefined });
    }
  };

  return (
    <div id="customer-home-view" className="pb-36 pt-2 bg-[#F7F7F5] min-h-screen text-[#0B0B0F]">
      {/* 1. EDITORIAL HERO SECTION */}
      <section id="editorial-hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Search */}
          <div className="lg:col-span-6 space-y-6">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                CALLOGA
              </span>
              <span className="text-stone-300">/</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B0B0F]">
                VERIFIED ARTISAN NETWORK
              </span>
            </div>

            {/* Large Typography Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B0B0F] tracking-tight leading-[1.05]">
                FIND THE RIGHT HANDS.
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B0B0F] tracking-tight leading-[1.05]">
                RIGHT AROUND YOU.
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl">
              Skilled, verified artisans for the work that matters — from quick repairs to full-scale projects.
            </p>

            {/* Prominent Search & Location Area */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E6E2] shadow-sm space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-400">
                What do you need done?
              </h3>

              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  {/* Search Query Input */}
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="hero-artisan-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Carpenter, plumber, electrician..."
                      className="w-full pl-11 pr-4 py-3 bg-[#F7F7F5] rounded-2xl text-sm font-semibold text-[#0B0B0F] placeholder-stone-400 border border-stone-200 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                  </div>

                  {/* Location Selector Button */}
                  <button
                    type="button"
                    id="hero-location-selector-btn"
                    onClick={onOpenLocationModal}
                    className="flex items-center gap-2 px-4 py-3 bg-[#F7F7F5] hover:bg-stone-200 border border-stone-200 rounded-2xl text-xs font-bold text-[#0B0B0F] transition-colors shrink-0"
                  >
                    <MapPin className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-[160px]">
                      {locationArea}, Lagos
                    </span>
                  </button>
                </div>

                {/* Primary Orange CTA Button */}
                <button
                  type="submit"
                  id="hero-find-artisan-submit-btn"
                  className="w-full py-3.5 bg-[#F97316] hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Find an Artisan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* Quick Trade Filter Pills */}
            <div className="pt-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedTrade('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedTrade === 'all'
                      ? 'bg-[#0B0B0F] text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  All Trades
                </button>
                {trades.slice(0, 7).map((trade) => (
                  <button
                    key={trade.id}
                    onClick={() => setSelectedTrade(selectedTrade === trade.slug ? 'all' : trade.slug)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      selectedTrade === trade.slug
                        ? 'bg-[#0B0B0F] text-white'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className={selectedTrade === trade.slug ? 'text-[#F97316]' : 'text-[#2563EB]'}>
                      {getTradeIcon(trade.slug)}
                    </span>
                    <span>{trade.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visually Rich Asymmetric Collage */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
              {/* Large Image: Nigerian Carpenter working on fine woodwork */}
              <div className="col-span-7 space-y-3">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-white/60 bg-stone-200 group aspect-4/5">
                  <img
                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                    alt="Master Nigerian carpenter shaping handcrafted furniture"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F97316] text-[10px] font-black uppercase tracking-wider">
                      Master Carpentry
                    </span>
                    <h4 className="text-sm font-extrabold mt-1">Bespoke Hardwood & Cabinetry</h4>
                    <p className="text-[11px] text-stone-200">Victoria Island & Lekki</p>
                  </div>
                </div>

                {/* Smaller Image: Mason laying precision blockwork */}
                <div className="relative rounded-3xl overflow-hidden shadow-md border border-white/60 bg-stone-200 group aspect-16/10">
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
                    alt="Mason building precision structural masonry"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs font-bold">Structural Masonry & Tiling</p>
                  </div>
                </div>
              </div>

              {/* Right Sub-Column: Electrician + Plumber */}
              <div className="col-span-5 space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                {/* Smaller Image: Electrician on distribution panel */}
                <div className="relative rounded-3xl overflow-hidden shadow-md border border-white/60 bg-stone-200 group aspect-4/4">
                  <img
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"
                    alt="Electrician calibrating solar inverter and distribution panel"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs font-bold">Certified Electrical & Inverters</p>
                  </div>
                </div>

                {/* Smaller Image: Plumber on pipe installation */}
                <div className="relative rounded-3xl overflow-hidden shadow-md border border-white/60 bg-stone-200 group aspect-4/5">
                  <img
                    src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80"
                    alt="Plumber installing water heater and pressure piping"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs font-bold">Piping & Water Pumps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING HERO TRUST ELEMENT */}
            <div className="absolute -bottom-6 -left-3 sm:left-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-[#E6E6E2] shadow-xl max-w-[260px]">
              <div className="flex items-center gap-2 text-[#2563EB]">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#0B0B0F]">
                  VERIFIED ARTISANS
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[11px] text-stone-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Identity checked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Local workers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Real reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NEARBY SECTION: "GOOD WORK, CLOSE BY." WITH REAL CALCULATED DISTANCES & VISUAL VARIATION */}
      <section id="nearby-artisans-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-[#E6E6E2]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                Proximity Radar
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B0B0F] tracking-tight mt-1">
              GOOD WORK, CLOSE BY.
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Verified professionals available around your location ({locationArea}, Lagos).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore All Artisans</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 EDITORIAL CARDS WITH DISTINCT ARCHETYPES & VISUAL VARIATION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CARD 1: Large Image Feature Card (Chinedu or 1st Artisan) */}
          {nearbyFeatured[0] && (
            <div className="md:col-span-7 bg-white rounded-3xl border border-[#E6E6E2] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
                <img
                  src={nearbyFeatured[0].portfolio[0]?.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                  alt={nearbyFeatured[0].headlineTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Tags */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-[#2563EB] text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Master
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-xs text-[#0B0B0F] text-xs font-bold shadow-sm">
                    {formatDistanceString(nearbyFeatured[0].distanceKm)}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{nearbyFeatured[0].ratingAverage}</span>
                    <span className="text-white/80">({nearbyFeatured[0].reviewCount} client reviews)</span>
                  </div>
                  <h3 className="text-xl font-black">{nearbyFeatured[0].user.fullName}</h3>
                  <p className="text-xs text-stone-200 mt-0.5">{nearbyFeatured[0].headlineTitle}</p>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {nearbyFeatured[0].bio}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 text-xs text-stone-500">
                  <span className="font-semibold text-stone-800">
                    📍 {nearbyFeatured[0].location.area}
                  </span>
                  <span>•</span>
                  <span>{nearbyFeatured[0].completedJobs} jobs completed</span>
                  <span>•</span>
                  <span>Responds in {nearbyFeatured[0].responseTimeMinutes}m</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Starting Rate
                    </span>
                    <span className="text-lg font-black text-[#0B0B0F]">
                      ₦{nearbyFeatured[0].baseFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('artisan_profile', { artisanId: nearbyFeatured[0].id })}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onNavigate('job_request', { artisanId: nearbyFeatured[0].id })}
                      className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-xs font-extrabold text-white shadow-sm transition-all"
                    >
                      Request Job
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CARD 2: Horizontal Profile Card (Babatunde or 2nd Artisan) */}
          {nearbyFeatured[1] && (
            <div className="md:col-span-5 bg-white rounded-3xl border border-[#E6E6E2] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={nearbyFeatured[1].user.avatarUrl}
                      alt={nearbyFeatured[1].user.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center ring-2 ring-white">
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[#2563EB] text-[10px] font-black uppercase">
                        {nearbyFeatured[1].trade.name}
                      </span>
                      <span className="text-xs font-black text-[#F97316]">
                        {formatDistanceString(nearbyFeatured[1].distanceKm)}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#0B0B0F] mt-1 truncate">
                      {nearbyFeatured[1].user.fullName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-stone-600 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                      <span className="font-bold text-[#0B0B0F]">{nearbyFeatured[1].ratingAverage}</span>
                      <span>({nearbyFeatured[1].reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F7F5] border border-stone-100">
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    "{nearbyFeatured[1].bio.slice(0, 130)}..."
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{nearbyFeatured[1].experienceYears} Years Professional Experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{nearbyFeatured[1].equipmentHighlight || 'Equipped with industrial tools'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Base Visit Fee
                  </span>
                  <span className="text-base font-black text-[#0B0B0F]">
                    ₦{nearbyFeatured[1].baseFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('artisan_profile', { artisanId: nearbyFeatured[1].id })}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onNavigate('job_request', { artisanId: nearbyFeatured[1].id })}
                    className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-orange-600 text-xs font-bold text-white shadow-2xs"
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CARD 3: Split Image/Text Card (Emeka or 3rd Artisan) */}
          {nearbyFeatured[2] && (
            <div className="md:col-span-6 bg-white rounded-3xl border border-[#E6E6E2] overflow-hidden p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="sm:w-1/3 aspect-square rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={nearbyFeatured[2].portfolio[0]?.imageUrl || nearbyFeatured[2].user.avatarUrl}
                    alt={nearbyFeatured[2].user.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-black uppercase">
                      {nearbyFeatured[2].trade.name}
                    </span>
                    <span className="text-xs font-bold text-[#F97316]">
                      {formatDistanceString(nearbyFeatured[2].distanceKm)}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0B0B0F]">
                    {nearbyFeatured[2].user.fullName}
                  </h3>
                  <p className="text-xs text-[#2563EB] font-bold line-clamp-1">
                    {nearbyFeatured[2].headlineTitle}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {nearbyFeatured[2].bio}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-stone-500 pt-1">
                    <span className="flex items-center gap-1 font-bold text-[#0B0B0F]">
                      <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                      {nearbyFeatured[2].ratingAverage}
                    </span>
                    <span>•</span>
                    <span>{nearbyFeatured[2].completedJobs} completed jobs</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Starting Fee
                  </span>
                  <span className="text-base font-black text-[#0B0B0F]">
                    ₦{nearbyFeatured[2].baseFee.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('job_request', { artisanId: nearbyFeatured[2].id })}
                  className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-orange-600 text-xs font-bold text-white shadow-2xs"
                >
                  Book Artisan
                </button>
              </div>
            </div>
          )}

          {/* CARD 4: Minimalist Typographic Profile Card (Musa or 4th Artisan) */}
          {nearbyFeatured[3] && (
            <div className="md:col-span-6 bg-white rounded-3xl border border-[#E6E6E2] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={nearbyFeatured[3].user.avatarUrl}
                      alt={nearbyFeatured[3].user.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-[#0B0B0F]">
                        {nearbyFeatured[3].user.fullName}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        {nearbyFeatured[3].location.area} • <strong className="text-[#0B0B0F]">{formatDistanceString(nearbyFeatured[3].distanceKm)}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase">
                    Available Today
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-100 text-center">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Rating</span>
                    <span className="text-sm font-black text-[#0B0B0F]">★ {nearbyFeatured[3].ratingAverage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Jobs</span>
                    <span className="text-sm font-black text-[#0B0B0F]">{nearbyFeatured[3].completedJobs}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Starting</span>
                    <span className="text-sm font-black text-[#0B0B0F]">₦{nearbyFeatured[3].baseFee.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {nearbyFeatured[3].bio}
                </p>
              </div>

              <div className="pt-3 mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => onNavigate('artisan_profile', { artisanId: nearbyFeatured[3].id })}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onNavigate('job_request', { artisanId: nearbyFeatured[3].id })}
                  className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-orange-600 text-xs font-bold text-white shadow-2xs"
                >
                  Request Job
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. DISCOVERY & FILTER SECTION WITH LIST / INTERACTIVE MAP TOGGLE */}
      <section id="artisan-discovery-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-[#E6E6E2]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B0B0F] tracking-tight">
              FIND YOUR NEXT ARTISAN
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              Filter by specific trade, distance radius, verification, and live customer reviews.
            </p>
          </div>

          {/* List vs Map Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-stone-200 p-1 rounded-2xl flex items-center">
              <button
                onClick={() => setViewMode('editorial')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'editorial'
                    ? 'bg-white text-[#0B0B0F] shadow-xs'
                    : 'text-stone-600 hover:text-[#0B0B0F]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-[#0B0B0F] shadow-xs'
                    : 'text-stone-600 hover:text-[#0B0B0F]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Interactive Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="bg-white p-4 rounded-3xl border border-[#E6E6E2] shadow-2xs mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Radius Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500">Radius:</span>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="bg-[#F7F7F5] border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0B0B0F] focus:outline-none"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F7F7F5] border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0B0B0F] focus:outline-none"
              >
                <option value="nearest">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="jobs">Most Completed Jobs</option>
              </select>
            </div>

            {/* Toggle: Verified Only */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                verifiedOnly
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-[#F7F7F5] text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>

            {/* Toggle: Available Today */}
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                availableOnly
                  ? 'bg-[#F97316] text-white shadow-2xs'
                  : 'bg-[#F7F7F5] text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Available Today</span>
            </button>

            <span className="text-xs text-stone-400 ml-auto font-semibold">
              Showing {filteredArtisans.length} verified artisans
            </span>
          </div>
        </div>

        {/* View Content: Interactive Map or Editorial List */}
        {viewMode === 'map' ? (
          <ArtisansInteractiveMap
            artisans={filteredArtisans}
            customerCoords={{ lat: customerLoc.lat, lng: customerLoc.lng }}
            customerAreaName={locationArea}
            onSelectArtisan={(art) => onNavigate('artisan_profile', { artisanId: art.id })}
            onRequestJob={(art) => onNavigate('job_request', { artisanId: art.id })}
            heightClass="h-[520px]"
          />
        ) : (
          <div>
            {filteredArtisans.length === 0 ? (
              /* REQUIRED EMPTY STATE */
              <div className="py-16 text-center bg-white rounded-3xl border border-[#E6E6E2] p-8 shadow-xs">
                <h3 className="text-2xl font-black text-[#0B0B0F] tracking-tight">
                  NO ONE NEARBY — YET.
                </h3>
                <p className="text-stone-500 text-sm mt-2 max-w-md mx-auto">
                  Try expanding your search radius or choosing another service.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedRadius(50);
                      setSelectedTrade('all');
                      setSearchQuery('');
                      setVerifiedOnly(false);
                    }}
                    className="px-6 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all"
                  >
                    Expand Radius to 50 km
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArtisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    className="bg-white rounded-3xl border border-[#E6E6E2] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={artisan.user.avatarUrl}
                            alt={artisan.user.fullName}
                            className="w-13 h-13 rounded-2xl object-cover border border-stone-200"
                          />
                          {artisan.verificationStatus === 'verified' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center ring-2 ring-white">
                              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#F97316]">
                              {formatDistanceString(artisan.distanceKm)}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
                              <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                              <span>{artisan.ratingAverage}</span>
                              <span className="text-stone-400 font-normal">({artisan.reviewCount})</span>
                            </div>
                          </div>

                          <h4 className="font-extrabold text-sm text-[#0B0B0F] truncate mt-0.5">
                            {artisan.user.fullName}
                          </h4>
                          <p className="text-xs text-[#2563EB] font-bold truncate">
                            {artisan.headlineTitle}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 mt-3 leading-relaxed">
                        {artisan.bio}
                      </p>

                      <div className="flex items-center gap-2 mt-3 text-xs text-stone-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{artisan.location.area}</span>
                        <span>•</span>
                        <span>{artisan.completedJobs} jobs</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          Base Fee
                        </span>
                        <span className="text-sm font-black text-[#0B0B0F]">
                          ₦{artisan.baseFee.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigate('artisan_profile', { artisanId: artisan.id })}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 transition-colors"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => onNavigate('job_request', { artisanId: artisan.id })}
                          className="px-4 py-1.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-xs font-bold text-white shadow-2xs transition-colors"
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. TRUST & VERIFICATION SECTION: "KNOW WHO YOU'RE HIRING." */}
      <section id="trust-and-verification" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-12 border-t border-[#E6E6E2]">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-black uppercase tracking-wider">
            Enterprise Grade Safety
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B0B0F] tracking-tight">
            KNOW WHO YOU'RE HIRING.
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Every professional on callOga passes a strict 4-step identity and trade verification pipeline before dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1: Identity Verified */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6E6E2] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <UserCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5 text-[#2563EB]">
              <Check className="w-4 h-4 stroke-[3]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0B0B0F]">
                Identity Verified
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Government National Identity (NIN) and Bank Verification Number (BVN) cross-checked via Didit KYC.
            </p>
          </div>

          {/* Step 2: Selfie / Liveness Verified */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6E6E2] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5 text-[#2563EB]">
              <Check className="w-4 h-4 stroke-[3]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0B0B0F]">
                Biometric Liveness
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Active 3D facial biometric scan and anti-spoofing detection ensures the person is who they claim.
            </p>
          </div>

          {/* Step 3: Phone Verified */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6E6E2] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center">
              <PhoneCall className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5 text-[#2563EB]">
              <Check className="w-4 h-4 stroke-[3]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0B0B0F]">
                Phone & Workshop
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Direct Nigerian telecom OTP verification and confirmed physical operational workshop address.
            </p>
          </div>

          {/* Step 4: Artisan Profile Completed */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6E6E2] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-[#0B0B0F] flex items-center justify-center">
              <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5 text-[#2563EB]">
              <Check className="w-4 h-4 stroke-[3]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0B0B0F]">
                Profile Completed
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Documented tool equipment inspection, verified work portfolio, and community trade references.
            </p>
          </div>
        </div>

        {/* Diagnostics & Governance Link in Footer */}
        {onOpenDiagnostics && (
          <div className="mt-12 text-center">
            <button
              onClick={onOpenDiagnostics}
              className="text-xs text-stone-400 hover:text-stone-700 font-mono underline inline-flex items-center gap-1.5 transition-colors"
            >
              <span>System & API Diagnostics (Supabase, Didit, PostGIS)</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
