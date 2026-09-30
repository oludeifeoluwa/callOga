import React from 'react';
import {
  User,
  MapPin,
  ShieldCheck,
  CreditCard,
  Bell,
  LogOut,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { storage } from '../lib/storage';

interface UserProfileViewProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenLocationModal: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onNavigate,
  onOpenLocationModal
}) => {
  const currentUser = storage.getCurrentUser();
  const customerLocation = storage.getSavedCustomerLocation();

  return (
    <div id="user-profile-view" className="pb-32 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex items-center gap-4">
        <img
          src={currentUser?.avatarUrl}
          alt={currentUser?.fullName}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2563EB]"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#0B0B0F]">{currentUser?.fullName}</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-bold uppercase border border-blue-200">
              {currentUser?.role}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{currentUser?.email} • {currentUser?.phone}</p>
          <p className="text-xs text-[#F97316] font-semibold mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {customerLocation.area}, Lagos
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden text-xs font-semibold text-stone-800">
        <button
          onClick={onOpenLocationModal}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[#0B0B0F] font-bold">Change Lagos Location</span>
              <span className="text-stone-400 text-[11px] font-normal">
                Currently set to {customerLocation.area}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => onNavigate('jobs')}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[#0B0B0F] font-bold">SafePay Escrow Wallet</span>
              <span className="text-stone-400 text-[11px] font-normal">
                Active deposits held securely in escrow
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => onNavigate('artisan_register')}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[#0B0B0F] font-bold">Become an Artisan Pro</span>
              <span className="text-stone-400 text-[11px] font-normal">
                Verify with Didit & start receiving high-value jobs
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      <div className="p-4 bg-stone-100 rounded-2xl text-center text-xs text-stone-500">
        callOga Production Build • Lagos, Nigeria
      </div>
    </div>
  );
};
