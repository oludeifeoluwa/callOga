import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { NIGERIAN_AREAS, NigerianLocationArea } from '../services/locationService';
import { storage } from '../lib/storage';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (coords: { lat: number; lng: number; area: string }) => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onLocationSelected
}) => {
  const [denied, setDenied] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number>(0);

  if (!isOpen) return null;

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setDenied(true);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          area: 'Current GPS Location'
        };
        storage.saveCustomerLocation(coords);
        onLocationSelected(coords);
        onClose();
      },
      (error) => {
        setIsLocating(false);
        // Graceful fallback to manual selector as required by Section 7
        setDenied(true);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleSelectManual = () => {
    const chosen = NIGERIAN_AREAS[selectedAreaIndex];
    const coords = {
      lat: chosen.lat,
      lng: chosen.lng,
      area: `${chosen.area}, ${chosen.state}`
    };
    storage.saveCustomerLocation(coords);
    onLocationSelected(coords);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      id="location-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        id="location-permission-dialog"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden text-[#101312]"
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center text-[#F97316]">
            <MapPin className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h2 id="location-modal-title" className="text-xl font-bold text-[#0B0B0F]">
            Find skilled workers near you
          </h2>

          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            Allow callOga to use your location so we can calculate real proximity and show verified artisans closest to you.
          </p>

          {denied && (
            <div
              id="location-denied-notice"
              className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-amber-900"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Location access is currently disabled.</span>
                Please choose your area manually from the list below:
              </div>
            </div>
          )}

          {/* Manual Area Selector */}
          <div className="mt-5 text-left">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">
              Select City / Area
            </label>
            <div className="relative">
              <select
                id="select-nigerian-area"
                value={selectedAreaIndex}
                onChange={(e) => setSelectedAreaIndex(Number(e.target.value))}
                className="w-full appearance-none bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-stone-800 focus:outline-none focus:border-[#F97316]"
              >
                {NIGERIAN_AREAS.map((item, idx) => (
                  <option key={`${item.state}-${item.area}`} value={idx}>
                    {item.area} — {item.city}, {item.state}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            {!denied ? (
              <button
                id="btn-use-my-location"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="w-full py-3.5 px-4 bg-[#F97316] hover:bg-orange-600 active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                {isLocating ? 'Detecting coordinates...' : 'Use my location'}
              </button>
            ) : (
              <button
                id="btn-confirm-manual-location"
                onClick={handleSelectManual}
                className="w-full py-3.5 px-4 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Check className="w-4 h-4" />
                Confirm Selected Location
              </button>
            )}

            <button
              id="btn-not-now-location"
              onClick={handleSelectManual}
              className="w-full py-2.5 px-4 text-stone-500 hover:text-[#0B0B0F] font-medium text-sm transition-colors"
            >
              Not now (Use {NIGERIAN_AREAS[selectedAreaIndex].area})
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
