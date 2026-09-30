import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ArtisanProfile } from '../types';
import { formatDistanceString } from '../services/locationService';
import { Star, ShieldCheck, MapPin, ArrowRight, X } from 'lucide-react';

interface ArtisansInteractiveMapProps {
  artisans: ArtisanProfile[];
  customerCoords: { lat: number; lng: number };
  customerAreaName: string;
  onSelectArtisan: (artisan: ArtisanProfile) => void;
  onRequestJob: (artisan: ArtisanProfile) => void;
  heightClass?: string;
}

export const ArtisansInteractiveMap: React.FC<ArtisansInteractiveMapProps> = ({
  artisans,
  customerCoords,
  customerAreaName,
  onSelectArtisan,
  onRequestJob,
  heightClass = 'h-[460px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeArtisan, setActiveArtisan] = useState<ArtisanProfile | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [customerCoords.lat, customerCoords.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false
    });
    leafletMapRef.current = map;

    // CartoDB Voyager tiles (crisp, modern neutral palette)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Customer Location Marker
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(37, 99, 235, 0.25); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; background: #2563EB; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
      .addTo(map)
      .bindTooltip(`<strong>Your Location</strong><br/>${customerAreaName}`, {
        direction: 'top',
        className: 'font-sans text-xs shadow-md rounded-lg p-2'
      });

    // Artisan markers
    markersRef.current = [];
    artisans.forEach((artisan) => {
      const isVerified = artisan.verificationStatus === 'verified';
      const initial = artisan.trade.name.slice(0, 1);

      const artisanIcon = L.divIcon({
        className: `custom-artisan-pin-${artisan.id}`,
        html: `
          <div style="display: flex; align-items: center; gap: 4px; background: #0B0B0F; color: #ffffff; padding: 4px 8px; border-radius: 9999px; border: 2px solid ${isVerified ? '#2563EB' : '#F97316'}; box-shadow: 0 4px 10px rgba(0,0,0,0.25); font-family: system-ui; cursor: pointer; transform: translate(-50%, -50%); transition: transform 0.2s;">
            <span style="font-weight: 800; font-size: 11px; color: ${isVerified ? '#60A5FA' : '#F97316'};">${initial}</span>
            <span style="font-weight: 700; font-size: 11px; white-space: nowrap;">${artisan.user.fullName.split(' ')[0]}</span>
            <span style="font-size: 10px; opacity: 0.8; font-weight: 600;">★${artisan.ratingAverage}</span>
          </div>
        `,
        iconSize: [80, 32],
        iconAnchor: [40, 16]
      });

      const marker = L.marker([artisan.location.lat, artisan.location.lng], { icon: artisanIcon })
        .addTo(map)
        .on('click', () => {
          setActiveArtisan(artisan);
          map.panTo([artisan.location.lat, artisan.location.lng], { animate: true });
        });

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple artisans
    if (artisans.length > 0) {
      const group = L.featureGroup([
        L.marker([customerCoords.lat, customerCoords.lng]),
        ...markersRef.current
      ]);
      map.fitBounds(group.getBounds().pad(0.18));
    }

    // Leaflet needs an invalidateSize when layout finishes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [artisans, customerCoords, customerAreaName]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200 shadow-md">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      {/* Floating Header Over Map */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
        <span className="text-xs font-bold text-[#0B0B0F]">
          {artisans.length} Verified Artisans Around {customerAreaName}
        </span>
      </div>

      {/* Selected Artisan Floating Detail Card */}
      {activeArtisan && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-10 bg-white rounded-2xl border border-stone-200 p-4 shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setActiveArtisan(null)}
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <img
              src={activeArtisan.user.avatarUrl}
              alt={activeArtisan.user.fullName}
              className="w-13 h-13 rounded-2xl object-cover border border-stone-200"
            />
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-[#0B0B0F] truncate">
                  {activeArtisan.user.fullName}
                </h4>
                {activeArtisan.verificationStatus === 'verified' && (
                  <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                )}
              </div>
              <p className="text-xs text-[#2563EB] font-bold">{activeArtisan.trade.name}</p>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                  {activeArtisan.ratingAverage}
                </span>
                <span>•</span>
                <span className="text-stone-700 font-bold">
                  {formatDistanceString(activeArtisan.distanceKm)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
            {activeArtisan.bio}
          </p>

          <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Starting Fee
              </span>
              <span className="text-sm font-black text-[#0B0B0F]">
                ₦{activeArtisan.baseFee.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectArtisan(activeArtisan)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => onRequestJob(activeArtisan)}
                className="px-4 py-1.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-xs font-bold text-white shadow-2xs transition-colors"
              >
                Request Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
