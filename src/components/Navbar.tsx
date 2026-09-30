import React, { useState } from 'react';
import {
  MapPin,
  Bell,
  ShieldCheck,
  User,
  CheckCircle,
  Briefcase,
  Users,
  Settings,
  ChevronDown,
  LogIn,
  Activity
} from 'lucide-react';
import { storage } from '../lib/storage';
import { UserRole } from '../types';
import { TwoToneStickHouse } from './TwoToneStickHouse';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenLocationModal: () => void;
  locationArea: string;
  onOpenAuthModal?: () => void;
  onOpenDiagnostics?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLocationModal,
  locationArea,
  onOpenAuthModal,
  onOpenDiagnostics
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const currentUser = storage.getCurrentUser();
  const notifications = storage.getNotifications();
  const unreadNotifs = notifications.filter((n) => !n.readAt);

  const handleRoleSelect = (role: UserRole) => {
    storage.switchRole(role);
    setShowRoleDropdown(false);
    if (role === 'artisan') {
      onNavigate('artisan_dashboard');
    } else if (role === 'admin') {
      onNavigate('admin_dashboard');
    } else {
      onNavigate('home');
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TwoToneStickHouse size={24} />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-[#0B0B0F]">
                call<span className="text-[#2563EB]">Oga</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase font-bold tracking-wider text-stone-500">
                Verified Artisan Network
              </span>
            </div>
          </button>

          {/* Location Picker Pill */}
          <button
            id="navbar-location-btn"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-[#0B0B0F] text-xs font-semibold transition-colors border border-stone-200"
            title="Change proximity location"
          >
            <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
            <span className="max-w-[110px] sm:max-w-[180px] truncate">{locationArea || 'Victoria Island'}</span>
            <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
          </button>
        </div>

        {/* Right Navigation & Interactive Role Switcher */}
        <div className="flex items-center gap-2">
          {/* SafePay Escrow status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SafePay Escrow Protected</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowRoleDropdown(false);
              }}
              className="relative p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316] ring-2 ring-white" />
              )}
            </button>

          {/* System API Diagnostics Trigger */}
          {onOpenDiagnostics && (
            <button
              id="btn-system-diagnostics"
              onClick={onOpenDiagnostics}
              className="p-2 rounded-xl text-stone-500 hover:text-[#2563EB] hover:bg-stone-100 transition-colors"
              title="System & API Diagnostics (Supabase, Didit, PostGIS)"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}

            {showNotifDropdown && (
              <div
                id="notifications-popover"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 text-[#0B0B0F]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                  <h4 className="font-bold text-sm text-[#0B0B0F]">Notifications</h4>
                  <span className="text-[11px] font-semibold text-[#2563EB]">
                    {unreadNotifs.length} new
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-stone-500 py-4 text-center">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          storage.markNotificationAsRead(n.id);
                          if (n.data?.jobId) {
                            onNavigate('job_tracking', { jobId: n.data.jobId });
                            setShowNotifDropdown(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                          n.readAt ? 'bg-stone-50 text-stone-600' : 'bg-blue-50/70 text-stone-900 font-medium border border-blue-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#0B0B0F]">{n.title}</span>
                          <span className="text-[10px] text-stone-400">Recent</span>
                        </div>
                        <p className="mt-1 text-[11px] text-stone-600 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Role Switcher & Auth Access Pill */}
          <div className="relative">
            <button
              id="btn-role-switcher-toggle"
              onClick={() => {
                if (!currentUser) { onOpenAuthModal?.(); return; }
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors text-xs font-semibold text-[#0B0B0F]"
            >
              <img
                src={currentUser?.avatarUrl}
                alt={currentUser?.fullName}
                className="w-6 h-6 rounded-full object-cover border border-stone-300"
              />
              <span className="hidden sm:inline-block max-w-[90px] truncate">
                {currentUser?.fullName.split(' ')[0] || 'Sign in'}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentUser?.role === 'artisan'
                  ? 'bg-orange-100 text-[#F97316]'
                  : currentUser?.role === 'admin'
                  ? 'bg-stone-900 text-white'
                  : 'bg-blue-100 text-[#2563EB]'
              }`}>
                {currentUser?.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {showRoleDropdown && (
              <div
                id="role-switcher-popover"
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 text-[#0B0B0F]"
              >
                <div className="px-3 py-2 border-b border-stone-100">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Role & Mode Switcher
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    Experience callOga across all 3 key roles:
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    id="role-opt-customer"
                    onClick={() => handleRoleSelect('customer')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      currentUser?.role === 'customer'
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-[#2563EB]" />
                      <div>
                        <div>Customer Mode</div>
                        <div className="text-[10px] text-stone-500 font-normal">Amina Bello (Lagos)</div>
                      </div>
                    </div>
                    {currentUser?.role === 'customer' && <CheckCircle className="w-4 h-4 text-[#2563EB]" />}
                  </button>

                  <button
                    id="role-opt-artisan"
                    onClick={() => handleRoleSelect('artisan')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      currentUser?.role === 'artisan'
                        ? 'bg-orange-50 text-orange-900 font-bold'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-[#F97316]" />
                      <div>
                        <div>Artisan Dashboard</div>
                        <div className="text-[10px] text-stone-500 font-normal">Chinedu Okafor (Carpenter)</div>
                      </div>
                    </div>
                    {currentUser?.role === 'artisan' && <CheckCircle className="w-4 h-4 text-[#F97316]" />}
                  </button>

                  <button
                    id="role-opt-admin"
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      currentUser?.role === 'admin'
                        ? 'bg-stone-100 text-[#0B0B0F] font-bold'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#0B0B0F]" />
                      <div>
                        <div>Admin Governance Portal</div>
                        <div className="text-[10px] text-stone-500 font-normal">Verification & Disputes</div>
                      </div>
                    </div>
                    {currentUser?.role === 'admin' && <CheckCircle className="w-4 h-4 text-[#0B0B0F]" />}
                  </button>
                </div>

                {onOpenAuthModal && (
                  <div className="pt-2 mt-1 border-t border-stone-100 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-[#F97316]" />
                      <span>Sign In / Create Account</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
