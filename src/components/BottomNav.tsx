import React from 'react';
import { Home, Compass, Wrench, MessageSquare, User, ShieldCheck } from 'lucide-react';
import { storage } from '../lib/storage';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const currentUser = storage.getCurrentUser();
  const jobs = (currentUser ? storage.getJobs(currentUser.role) : []);
  const activeJobs = jobs.filter((j) => j.status === 'in_progress' || j.status === 'scheduled');

  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          id="nav-tab-home"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
            currentView === 'home' ? 'text-[#F97316]' : 'text-stone-500 hover:text-[#0B0B0F]'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span>Home</span>
        </button>

        {/* Explore / Map */}
        <button
          id="nav-tab-explore"
          onClick={() => onNavigate('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
            currentView === 'explore' ? 'text-[#F97316]' : 'text-stone-500 hover:text-[#0B0B0F]'
          }`}
        >
          <Compass className="w-5 h-5 stroke-[2.2]" />
          <span>Explore</span>
        </button>

        {/* Jobs (with badge) */}
        <button
          id="nav-tab-jobs"
          onClick={() => onNavigate('jobs')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
            currentView === 'jobs' || currentView === 'job_tracking'
              ? 'text-[#F97316]'
              : 'text-stone-500 hover:text-[#0B0B0F]'
          }`}
        >
          <div className="relative">
            <Wrench className="w-5 h-5 stroke-[2.2]" />
            {activeJobs.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#F97316] text-white text-[10px] flex items-center justify-center font-bold">
                {activeJobs.length}
              </span>
            )}
          </div>
          <span>Jobs</span>
        </button>

        {/* Messages */}
        <button
          id="nav-tab-messages"
          onClick={() => onNavigate('messages')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
            currentView === 'messages' ? 'text-[#F97316]' : 'text-stone-500 hover:text-[#0B0B0F]'
          }`}
        >
          <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          <span>Messages</span>
        </button>

        {/* Profile / Role Dashboard */}
        <button
          id="nav-tab-profile"
          onClick={() => {
            if (currentUser?.role === 'artisan') {
              onNavigate('artisan_dashboard');
            } else if (currentUser?.role === 'admin') {
              onNavigate('admin_dashboard');
            } else {
              onNavigate('profile');
            }
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
            currentView === 'profile' || currentView === 'artisan_dashboard' || currentView === 'admin_dashboard'
              ? 'text-[#F97316]'
              : 'text-stone-500 hover:text-[#0B0B0F]'
          }`}
        >
          {currentUser?.role === 'admin' ? (
            <ShieldCheck className="w-5 h-5 stroke-[2.2] text-[#0B0B0F]" />
          ) : (
            <User className="w-5 h-5 stroke-[2.2]" />
          )}
          <span>{currentUser?.role === 'artisan' ? 'Pro Hub' : currentUser?.role === 'admin' ? 'Admin' : 'Profile'}</span>
        </button>
      </div>
    </nav>
  );
};
