import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  X,
  ArrowRight,
  Shield,
  Clock,
  ChevronDown
} from 'lucide-react';
import L from 'leaflet';
import { storage } from '../lib/storage';
import { ArtisanProfile, Trade } from '../types';
import { formatDistanceString } from '../services/locationService';

interface ArtisanExploreProps {
  onNavigate: (view: string, data?: any) => void;
  initialTrade?: string;
  initialSearch?: string;
  initialViewMode?: 'map' | 'list';
}

export const ArtisanExplore: React.FC<ArtisanExploreProps> = ({
  onNavigate,
  initialTrade = 'all',
  initialSearch = '',
  initialViewMode = 'list'
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTrade, setSelectedTrade] = useState(initialTrade);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'nearest' | 'rating' | 'jobs'>('nearest');
  const [selectedArtisanForModal, setSelectedArtisanForModal] = useState<ArtisanProfile | null>(null);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const trades = storage.getTrades();
  const customerCoords = storage.getSavedCustomerLocation();

  const artisans = storage.getArtisans({
    lat: customerCoords.lat,
    lng: customerCoords.lng,
    radiusKm,
    tradeId: selectedTrade,
    verifiedOnly,
    availableOnly,
    minRating: minRating > 0 ? minRating : undefined,
    searchQuery,
    sortBy
  });

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    // Destroy existing instance if any
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [customerCoords.lat, customerCoords.lng],
      zoom: 13,
      zoomControl: true
    });

    leafletMapRef.current = map;

    // Use clean CartoDB Voyager tiles (crisp, high-contrast, free)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    // Customer Location Pin (Blue with radar pulse)
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(37,99,235,0.25); animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:20px; height:20px; border-radius:50%; background:#2563EB; border:3px solid #FFFFFF; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<strong>Your Location</strong><br/>${customerCoords.area}`);

    // Clean previous markers
    markersRef.current = [];

    // Artisan Pins
    artisans.forEach((artisan) => {
      const isVerified = artisan.verificationStatus === 'verified';
      const pinHtml = `
        <div style="
          display:flex;
          align-items:center;
          gap:5px;
          background:${isVerified ? '#0B0B0F' : '#334155'};
          color:#FFFFFF;
          padding:5px 9px;
          border-radius:20px;
          font-family:sans-serif;
          font-size:11px;
          font-weight:700;
          box-shadow:0 4px 10px rgba(0,0,0,0.25);
          border:2px solid ${isVerified ? '#2563EB' : '#94A3B8'};
          white-space:nowrap;
          cursor:pointer;
        ">
          <span style="color:#2563EB;">●</span>
          <span>${artisan.user.fullName.split(' ')[0]}</span>
          <span style="color:#F97316; font-weight:800; display:inline-flex; align-items:center; gap:2px;">
            <svg style="width:10px;height:10px;fill:#F97316;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${artisan.ratingAverage}
          </span>
        </div>
      `;

      const artisanIcon = L.divIcon({
        className: 'custom-artisan-pin',
        html: pinHtml,
        iconSize: [110, 32],
        iconAnchor: [55, 16]
      });

      const marker = L.marker([artisan.location.lat, artisan.location.lng], { icon: artisanIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedArtisanForModal(artisan);
        });

      markersRef.current.push(marker);
    });

    // Invalidate size after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [viewMode, artisans.length, customerCoords.lat, customerCoords.lng]);

  return (
    <div id="artisan-explore-view" className="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-4">
      {/* Top Filter & View Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        {/* Search Input */}
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          <input
            id="explore-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artisans, trades, or services..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Trade Selector */}
        <div className="flex items-center gap-2">
          <select
            id="explore-trade-select"
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="text-xs font-semibold py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#F97316]"
          >
            <option value="all">All Trades</option>
            {trades.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Toggle Filter Drawer */}
          <button
            id="btn-toggle-filters"
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              showFiltersDrawer || verifiedOnly || availableOnly || radiusKm < 25
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Map / List View Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              id="btn-switch-list-view"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              id="btn-switch-map-view"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFiltersDrawer && (
        <div
          id="filters-drawer-panel"
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs font-medium text-stone-700"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-bold text-sm text-stone-900">Filter Discovery Parameters</span>
            <button
              onClick={() => {
                setRadiusKm(25);
                setVerifiedOnly(false);
                setAvailableOnly(false);
                setMinRating(0);
                setSortBy('nearest');
              }}
              className="text-stone-400 hover:text-stone-700 underline text-[11px]"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Radius Slider */}
            <div>
              <label className="font-semibold block mb-1">
                Distance Radius: <strong className="text-[#F97316]">{radiusKm} km</strong>
              </label>
              <input
                id="filter-radius-slider"
                type="range"
                min="1"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-[#F97316]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>1 km</span>
                <span>10 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="font-semibold block mb-1">Sort Results By</label>
              <select
                id="filter-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none"
              >
                <option value="nearest">Nearest First (GPS Proximity)</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="jobs">Most Completed Jobs</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="font-semibold block mb-1">Minimum Rating</label>
              <select
                id="filter-rating-select"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none"
              >
                <option value="0">Any Rating</option>
                <option value="4.5">4.5+ Rating</option>
                <option value="4.8">4.8+ Rating (Top Master)</option>
              </select>
            </div>

            {/* Verification & Availability Toggles */}
            <div className="flex flex-col gap-2 justify-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="filter-verified-checkbox"
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
                />
                <span className="font-semibold">NIN / BVN Verified Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="filter-available-checkbox"
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
                />
                <span className="font-semibold">Available Today</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
        <span>
          Showing <strong className="text-stone-900">{artisans.length}</strong> verified artisans near {customerCoords.area}
        </span>
        <span>Radius: ≤ {radiusKm} km</span>
      </div>

      {/* MAIN VIEW: Interactive Map or List */}
      {viewMode === 'map' ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md h-[550px] w-full bg-stone-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay Bottom Sheet for Selected Artisan */}
          {selectedArtisanForModal && (
            <div
              id="map-selected-artisan-sheet"
              className="absolute bottom-4 left-4 right-4 z-20 max-w-lg mx-auto bg-white rounded-2xl p-4 shadow-2xl border border-stone-200 animate-in fade-in slide-in-from-bottom-4 duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedArtisanForModal.user.avatarUrl}
                    alt={selectedArtisanForModal.user.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-stone-900">
                        {selectedArtisanForModal.user.fullName}
                      </h4>
                      {selectedArtisanForModal.verificationStatus === 'verified' && (
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                      )}
                    </div>
                    <p className="text-xs text-[#2563EB] font-semibold">
                      {selectedArtisanForModal.headlineTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span className="flex items-center gap-0.5 text-stone-800 font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                        {selectedArtisanForModal.ratingAverage} ({selectedArtisanForModal.reviewCount})
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-[#0B0B0F]">
                        {formatDistanceString(selectedArtisanForModal.distanceKm)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-close-map-sheet"
                  onClick={() => setSelectedArtisanForModal(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-semibold">STARTING FEE</span>
                  <span className="text-sm font-black text-[#0B0B0F]">
                    ₦{selectedArtisanForModal.baseFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-sheet-view-profile"
                    onClick={() => onNavigate('artisan_profile', { artisanId: selectedArtisanForModal.id })}
                    className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                  >
                    Profile
                  </button>
                  <button
                    id="btn-sheet-request-job"
                    onClick={() => onNavigate('job_request', { artisanId: selectedArtisanForModal.id })}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#F97316] hover:bg-orange-600 rounded-xl shadow-2xs"
                  >
                    Request Job
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIST VIEW */
        <div id="artisan-list-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artisans.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-800">No artisans found matching your filters</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try broadening your distance radius slider, clearing search keywords, or selecting "All Trades".
              </p>
              <button
                onClick={() => {
                  setSelectedTrade('all');
                  setSearchQuery('');
                  setRadiusKm(30);
                  setVerifiedOnly(false);
                }}
                className="mt-2 px-4 py-2 bg-[#0B0B0F] hover:bg-stone-800 text-white text-xs font-bold rounded-xl"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            artisans.map((artisan) => (
              <div
                key={artisan.id}
                id={`explore-card-${artisan.id}`}
                className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-[#F97316]/50 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={artisan.user.avatarUrl}
                      alt={artisan.user.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-stone-200"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-[#0B0B0F] text-sm truncate">
                          {artisan.user.fullName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-stone-900 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                          <span>{artisan.ratingAverage}</span>
                          <span className="text-stone-400 font-normal">({artisan.reviewCount})</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#2563EB] font-semibold truncate mt-0.5">
                        {artisan.headlineTitle}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{artisan.location.area}</span>
                        <span>•</span>
                        <strong className="text-stone-800">
                          {formatDistanceString(artisan.distanceKm)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {artisan.bio}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {artisan.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#2563EB]" />
                        Identity Verified
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-semibold">
                      {artisan.completedJobs} jobs
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-semibold">
                      {artisan.experienceYears}+ yrs
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                      Starting Fee
                    </span>
                    <span className="text-sm font-black text-[#0B0B0F]">
                      ₦{artisan.baseFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-explore-profile-${artisan.id}`}
                      onClick={() => onNavigate('artisan_profile', { artisanId: artisan.id })}
                      className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      id={`btn-explore-request-${artisan.id}`}
                      onClick={() => onNavigate('job_request', { artisanId: artisan.id })}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#F97316] hover:bg-orange-600 rounded-xl transition-colors shadow-2xs"
                    >
                      Request Job
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
