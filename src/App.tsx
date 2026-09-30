import React, { useState, useEffect } from 'react';
import { storage } from './lib/storage';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LocationPermissionModal } from './components/LocationPermissionModal';
import { AuthPage, AuthPageMode } from './pages/AuthPage';
import { CustomerHome } from './components/CustomerHome';
import { ArtisanExplore } from './components/ArtisanExplore';
import { ArtisanProfileView } from './components/ArtisanProfileView';
import { JobRequestModal } from './components/JobRequestModal';
import { JobTrackingView } from './components/JobTrackingView';
import { JobsListView } from './components/JobsListView';
import { MessagingView } from './components/MessagingView';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { ArtisanRegisterView } from './components/ArtisanRegisterView';
import { AdminDashboard } from './components/AdminDashboard';
import { ReviewModal } from './components/ReviewModal';
import { ReportModal } from './components/ReportModal';
import { UserProfileView } from './components/UserProfileView';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { UserRole } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'explore' | 'artisan_profile' | 'jobs' | 'job_tracking' | 'messages' | 'artisan_dashboard' | 'artisan_register' | 'admin_dashboard' | 'profile' | 'auth'>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Active modals
  const [jobRequestArtisanId, setJobRequestArtisanId] = useState<string | null>(null);
  const [reviewJobData, setReviewJobData] = useState<{ jobId: string; artisanId: string } | null>(null);
  const [reportData, setReportData] = useState<{ reportedUserId?: string; jobId?: string } | null>(null);

  const [customerLocation, setCustomerLocation] = useState(() => storage.getSavedCustomerLocation());
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());

  // Auth page state & Redirect Preservation
  const [authPageInitialMode, setAuthPageInitialMode] = useState<AuthPageMode>('choose_method');
  const [authPageInitialToken, setAuthPageInitialToken] = useState<string>('');
  const [pendingRedirectView, setPendingRedirectView] = useState<string | null>(null);
  const [pendingRedirectParams, setPendingRedirectParams] = useState<any>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setCustomerLocation(storage.getSavedCustomerLocation());
      setCurrentUser(storage.getCurrentUser());
    });

    // Check URL parameters for email verification or password reset links
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyToken = urlParams.get('verify_email');
      const resetToken = urlParams.get('reset_password');
      const inviteCode = urlParams.get('invite');

      if (inviteCode) {
        sessionStorage.setItem('calloga_invite', inviteCode);
      }

      if (verifyToken) {
        setAuthPageInitialMode('verify_email');
        setAuthPageInitialToken(verifyToken);
        setCurrentView('auth');
      } else if (resetToken) {
        setAuthPageInitialMode('reset_password');
        setAuthPageInitialToken(resetToken);
        setCurrentView('auth');
      }
    } catch {}

    return unsub;
  }, []);

  const openAuthPage = (mode: AuthPageMode = 'choose_method') => {
    setAuthPageInitialMode(mode);
    setAuthPageInitialToken('');
    setCurrentView('auth');
  };

  const handleNavigate = (view: string, params?: any) => {
    if (!storage.getCurrentUser() && ['jobs', 'messages', 'profile', 'artisan_dashboard', 'admin_dashboard', 'job_request', 'job_tracking'].includes(view)) {
      setPendingRedirectView(view);
      setPendingRedirectParams(params || {});
      openAuthPage('choose_method');
      return;
    }
    setViewParams(params || {});
    if (view === 'job_request') {
      setJobRequestArtisanId(params?.artisanId || null);
    } else if (view === 'report') {
      setReportData(params || {});
    } else {
      setCurrentView(view as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    // Preserve intended destination after authentication
    if (pendingRedirectView) {
      const target = pendingRedirectView;
      const targetParams = pendingRedirectParams;
      setPendingRedirectView(null);
      setPendingRedirectParams(null);
      handleNavigate(target, targetParams);
      return;
    }

    if (role === 'artisan') {
      setCurrentView('artisan_dashboard');
    } else if (role === 'admin') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <div id="calloga-app" className="min-h-screen bg-[#F7F8FA] text-[#0B0B0F] font-sans antialiased selection:bg-[#F97316] selection:text-white">
      {/* 1. Splash Screen Animation */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* 2. Global Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenLocationModal={() => setShowLocationModal(true)}
        locationArea={customerLocation.area}
        onOpenAuthModal={() => openAuthPage('choose_method')}
        onOpenDiagnostics={() => setShowDiagnostics(true)}
      />

      {/* 3. Full-Page Auth View (renders over everything, hides nav) */}
      {currentView === 'auth' && (
        <AuthPage
          initialMode={authPageInitialMode}
          initialToken={authPageInitialToken}
          onAuthSuccess={(role) => {
            setCurrentView('home');
            handleRoleChange(role);
          }}
          onNavigateBack={() => {
            setCurrentView('home');
            setAuthPageInitialMode('choose_method');
            setAuthPageInitialToken('');
          }}
        />
      )}

      {/* 4. Main Views Router (hidden when auth page is active) */}
      <main className="min-h-[calc(100vh-140px)]" style={{ display: currentView === 'auth' ? 'none' : undefined }}>
        {currentView === 'home' && (
          <CustomerHome
            onNavigate={handleNavigate}
            onOpenLocationModal={() => setShowLocationModal(true)}
            locationArea={customerLocation.area}
            onOpenDiagnostics={() => setShowDiagnostics(true)}
          />
        )}

        {currentView === 'explore' && (
          <ArtisanExplore
            onNavigate={handleNavigate}
            initialTrade={viewParams.trade || 'all'}
            initialSearch={viewParams.search || ''}
            initialViewMode={viewParams.viewMode || 'list'}
          />
        )}

        {currentView === 'artisan_profile' && (
          <ArtisanProfileView
            artisanId={viewParams.artisanId}
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('explore')}
          />
        )}

        {currentView === 'jobs' && (
          <JobsListView onNavigate={handleNavigate} />
        )}

        {currentView === 'job_tracking' && (
          <JobTrackingView
            jobId={viewParams.jobId || storage.getJobs()[0]?.id}
            onNavigate={handleNavigate}
            onOpenReview={(jobId, artisanId) => setReviewJobData({ jobId, artisanId })}
            onBack={() => handleNavigate('jobs')}
          />
        )}

        {currentView === 'messages' && (
          <MessagingView
            initialConversationId={viewParams.conversationId}
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentView === 'artisan_dashboard' && (
          <ArtisanDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'artisan_register' && (
          <ArtisanRegisterView
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentView === 'admin_dashboard' && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'profile' && (
          <UserProfileView
            onNavigate={handleNavigate}
            onOpenLocationModal={() => setShowLocationModal(true)}
          />
        )}
      </main>

      {/* 4. Mobile Bottom Navigation Bar */}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />

      {/* 5. Modals & Sheets */}

      {showLocationModal && (
        <LocationPermissionModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onLocationSelected={(loc) => {
            storage.saveCustomerLocation(loc);
            setShowLocationModal(false);
          }}
        />
      )}

      {jobRequestArtisanId && (
        <JobRequestModal
          artisanId={jobRequestArtisanId}
          serviceName={viewParams.serviceName}
          onClose={() => setJobRequestArtisanId(null)}
          onJobCreated={(jobId) => {
            setJobRequestArtisanId(null);
            handleNavigate('job_tracking', { jobId });
          }}
        />
      )}

      {reviewJobData && (
        <ReviewModal
          jobId={reviewJobData.jobId}
          artisanId={reviewJobData.artisanId}
          onClose={() => setReviewJobData(null)}
          onSubmitted={() => {
            setReviewJobData(null);
            handleNavigate('artisan_profile', { artisanId: reviewJobData.artisanId });
          }}
        />
      )}

      {reportData && (
        <ReportModal
          reportedUserId={reportData.reportedUserId}
          jobId={reportData.jobId}
          onClose={() => setReportData(null)}
        />
      )}

      {showDiagnostics && (
        <DiagnosticsModal
          isOpen={showDiagnostics}
          onClose={() => setShowDiagnostics(false)}
        />
      )}
    </div>
  );
}
