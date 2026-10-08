/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  MeetingConfig, 
  Registration, 
  RegistrationStats, 
  NotificationRecord,
  QrCodeConfig,
  OrganizerUser
} from './types';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { QrCodeDisplay } from './components/QrCodeDisplay';
import { AttendeeList } from './components/AttendeeList';
import { RegistrationForm } from './components/RegistrationForm';
import { PresenterStageMode } from './components/PresenterStageMode';
import { NotificationModal } from './components/NotificationModal';
import { MeetingSettingsModal } from './components/MeetingSettingsModal';
import { MobileSimulatorModal } from './components/MobileSimulatorModal';
import { QrInformationEditorModal } from './components/QrInformationEditorModal';
import { QrBarcodeGeneratorModal } from './components/QrBarcodeGeneratorModal';
import { ReportingModal } from './components/ReportingModal';
import { LoginModal } from './components/LoginModal';
import { MeetingCalendar } from './components/MeetingCalendar';
import { SharedLinkBanner } from './components/SharedLinkBanner';
import { WhatsAppRobotBadge } from './components/WhatsAppRobotBadge';
import { playNotificationChime } from './utils/audio';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tv, 
  Edit3, 
  Globe, 
  ExternalLink, 
  BarChart3,
  ShieldCheck,
  UserCheck,
  LogOut,
  Barcode,
  Sparkles
} from 'lucide-react';

const SHARED_APP_URL = 'https://ais-pre-epyop3nnxjxr6smwxasc4e-944514003021.europe-west2.run.app';

export default function App() {
  const [meeting, setMeeting] = useState<MeetingConfig>({
    title: 'Executive Strategic Planning & Operations Meeting 2026',
    description: 'Quarterly all-hands briefing and departmental milestone review with leadership, David Nkwe, and Katlego Mathunywa.',
    date: '2026-10-15',
    time: '10:00 AM - 12:30 PM (CAT / UTC+2)',
    location: 'Boardroom Suite A & Virtual Livestream',
    isVirtualAvailable: true,
    meetingLink: 'https://meet.google.com/ex-strat-2026',
    notificationEmails: ['dave.nkwe@gmail.com', 'Kenny.weeder71@gmail.com'],
    organizerNames: ['David Nkwe', 'Katlego Mathunywa'],
    googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
    eotofUrl: 'https://www.eotof.co.za',
    damlogateUrl: 'https://www.damlogate.co.za',
    whatsappNumber: '27769775423',
    sharedAppUrl: SHARED_APP_URL,
    qrConfig: {
      mode: 'registration_hub',
      qrTitle: 'Scan to Register & Access Portals',
      qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
      badgeText: 'Instant RSVP & Partner Portals',
      customUrl: '',
      googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
      eotofUrl: 'https://www.eotof.co.za',
      damlogateUrl: 'https://www.damlogate.co.za',
      showEotofLink: true,
      showDamlogateLink: true,
      showWhatsAppLink: true,
      whatsappNumber: '27769775423',
      whatsappPrefillMessage: 'Hello David Nkwe and Katlego Mathunywa, I am registering for the meeting. Please confirm my attendance.',
      additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      qrTheme: 'executive_dark',
      errorCorrectionLevel: 'H',
      useSharedDomain: true,
    },
  });

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats>({
    total: 0,
    attending: 0,
    inPerson: 0,
    virtual: 0,
    declined: 0,
    attendanceRate: 0,
    registeredToVoteYes: 0,
    registeredToVoteNo: 0,
    registeredToVoteRate: 0,
    wardsCount: {},
  });
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  // Navigation & Modals
  const [viewMode, setViewMode] = useState<'dashboard' | 'calendar' | 'form' | 'login'>('dashboard');
  const [isStageModeOpen, setIsStageModeOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [isQrEditorOpen, setIsQrEditorOpen] = useState(false);
  const [isGeneratorSuiteOpen, setIsGeneratorSuiteOpen] = useState(false);
  const [isReportingModalOpen, setIsReportingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Authenticated Organizer User (David Nkwe / Katlego Mathunywa)
  const [currentUser, setCurrentUser] = useState<OrganizerUser | null>(() => {
    try {
      const saved = localStorage.getItem('organizer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const previousCountRef = useRef<number | null>(null);

  // Check if current user is David Nkwe (DaveN)
  const isDave = Boolean(
    currentUser && (
      currentUser.username?.toLowerCase() === 'daven' ||
      currentUser.fullName?.toLowerCase().includes('david nkwe') ||
      currentUser.email?.toLowerCase() === 'dave.nkwe@gmail.com'
    )
  );

  // Check URL query parameters: if ?view=register or ?view=portals
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'register' || viewParam === 'form' || viewParam === 'portals') {
      setViewMode('form');
    } else if (viewParam === 'calendar') {
      setViewMode('calendar');
    } else if (viewParam === 'login' || params.get('login') === 'true') {
      setViewMode('login');
    }
  }, []);

  // Fetch live registrations & stats from backend
  const fetchData = async () => {
    try {
      const res = await fetch('/api/registrations');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        setStats(data.stats || {
          total: 0,
          attending: 0,
          inPerson: 0,
          virtual: 0,
          declined: 0,
          attendanceRate: 0,
          registeredToVoteYes: 0,
          registeredToVoteNo: 0,
          registeredToVoteRate: 0,
          wardsCount: {},
        });
        if (data.meeting) {
          setMeeting(data.meeting);
        }

        const newCount = (data.registrations || []).length;
        if (previousCountRef.current !== null && newCount > previousCountRef.current) {
          if (soundEnabled) {
            playNotificationChime();
          }
        }
        previousCountRef.current = newCount;
      }

      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.debug('Error fetching real-time data:', err);
    }
  };

  // 1. Initial backend polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // 2. Real-time Firebase Firestore onSnapshot listener for instant live updates across devices
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'registrations'), (snapshot) => {
        if (!snapshot.empty) {
          const firestoreRegs: Registration[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as Registration;
            firestoreRegs.push({ ...data, id: doc.id });
          });
          // Merge with current state
          setRegistrations(prev => {
            const map = new Map<string, Registration>();
            prev.forEach(r => map.set(r.id, r));
            firestoreRegs.forEach(r => map.set(r.id, r));
            return Array.from(map.values()).sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'registrations');
      });

      return () => unsub();
    } catch (e) {
      console.debug('Firestore listener initialized with fallback');
    }
  }, []);

  const handleDeleteAttendee = async (id: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleResetData = async (mode: 'sample' | 'empty') => {
    try {
      const res = await fetch('/api/registrations/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleSaveMeeting = async (updated: MeetingConfig) => {
    const res = await fetch('/api/meeting', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const result = await res.json();
      setMeeting(result.config);
    }
  };

  const handleSaveQrConfig = async (updatedConfig: QrCodeConfig) => {
    const res = await fetch('/api/meeting/qr-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig),
    });
    if (res.ok) {
      const result = await res.json();
      setMeeting(prev => ({
        ...prev,
        qrConfig: result.qrConfig,
        eotofUrl: result.meeting?.eotofUrl || prev.eotofUrl,
        damlogateUrl: result.meeting?.damlogateUrl || prev.damlogateUrl,
        googleFormsUrl: result.qrConfig?.googleFormsUrl || prev.googleFormsUrl,
      }));
    }
  };

  const handleTriggerDigest = async () => {
    const res = await fetch('/api/notifications/digest', { method: 'POST' });
    if (res.ok) {
      fetchData();
    }
  };

  const handleExportCsv = () => {
    window.open('/api/export/csv', '_blank');
  };

  const handleLoginSuccess = (user: OrganizerUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('organizer_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('organizer_user');
    } catch (e) {
      console.error(e);
    }
  };

  // If viewing standalone attendee form (e.g. mobile scan)
  if (viewMode === 'form') {
    return (
      <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-600 selection:text-white">
        <RegistrationForm
          meeting={meeting}
          onSubmitSuccess={() => {
            fetchData();
          }}
          onBackToDashboard={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('view');
            window.history.pushState({}, '', url.toString());
            setViewMode('dashboard');
          }}
        />
      </div>
    );
  }

  // If viewing standalone meeting calendar
  if (viewMode === 'calendar') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        <Header
          meeting={meeting}
          onOpenStageMode={() => setIsStageModeOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenQrEditor={() => setIsQrEditorOpen(true)}
          onOpenGeneratorSuite={() => setIsGeneratorSuiteOpen(true)}
          onOpenReporting={() => setIsReportingModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenRegistrationForm={() => setViewMode('form')}
          onExportCsv={handleExportCsv}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          unreadNotificationsCount={notifications.length}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('view');
                window.history.pushState({}, '', url.toString());
                setViewMode('dashboard');
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
            >
              &larr; Back to Damlogate Dashboard
            </button>
            <span className="text-xs text-slate-400">
              Synchronized meeting dates &bull; CAT / UTC+2
            </span>
          </div>
          <MeetingCalendar
            meeting={meeting}
            registrations={registrations}
          />
        </main>
      </div>
    );
  }

  // If viewing standalone organizer login landing screen
  if (viewMode === 'login') {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        <Header
          meeting={meeting}
          onOpenStageMode={() => setIsStageModeOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenQrEditor={() => setIsQrEditorOpen(true)}
          onOpenGeneratorSuite={() => setIsGeneratorSuiteOpen(true)}
          onOpenReporting={() => setIsReportingModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenRegistrationForm={() => setViewMode('form')}
          onExportCsv={handleExportCsv}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          unreadNotificationsCount={notifications.length}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-[480px] mb-3 flex items-center justify-between">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('view');
                window.history.pushState({}, '', url.toString());
                setViewMode('dashboard');
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              &larr; Back to Damlogate Dashboard
            </button>
            <span className="text-xs text-slate-400">Organizer Landing Portal</span>
          </div>
          <LoginModal
            isOpen={true}
            isLandingPage={true}
            onClose={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('view');
              window.history.pushState({}, '', url.toString());
              setViewMode('dashboard');
            }}
            onLoginSuccess={(u) => {
              handleLoginSuccess(u);
              setViewMode('dashboard');
            }}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        meeting={meeting}
        onOpenStageMode={() => setIsStageModeOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenQrEditor={() => setIsQrEditorOpen(true)}
        onOpenGeneratorSuite={() => setIsGeneratorSuiteOpen(true)}
        onOpenReporting={() => setIsReportingModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegistrationForm={() => setViewMode('form')}
        onExportCsv={handleExportCsv}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        unreadNotificationsCount={notifications.length}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Meeting Overview Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Damlogate QR Code Generator
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Google Cloud Firestore Active
                </span>
                {currentUser && (
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Signed in: {currentUser.fullName} ({currentUser.username})</span>
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Log-off session"
                    >
                      <LogOut className="w-3 h-3 text-rose-400" />
                      <span>Log-off</span>
                    </button>
                  </div>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {meeting.title}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {meeting.description}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  {meeting.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {meeting.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {meeting.location}
                </span>
              </div>
            </div>

            {/* Quick Hero Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => setIsGeneratorSuiteOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Barcode className="w-4 h-4 text-white" />
                <span>QR &amp; Barcode Generator</span>
              </button>
              <button
                onClick={() => setIsReportingModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Executive Reports &amp; Ward Audit</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Event Calendar</span>
              </button>
              <button
                onClick={() => setIsStageModeOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Tv className="w-4 h-4 text-indigo-400" />
                <span>Stage Mode</span>
              </button>
            </div>
          </div>

          {/* Quick Partner Portal Banner in Hero */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-300">Shared in QR Code:</span>
              <span className="text-slate-400">Cell phones scanning this screen receive official partner portals</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={meeting.eotofUrl || 'https://www.eotof.co.za'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 font-mono text-indigo-300 hover:underline"
              >
                <span>www.eotof.co.za</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>&bull;</span>
              <a
                href={meeting.damlogateUrl || 'https://www.damlogate.co.za'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 font-mono text-emerald-300 hover:underline"
              >
                <span>www.damlogate.co.za</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Live Shared URL Banner with Persistent Storage Indicator (Hidden for David Nkwe) */}
        {!isDave && (
          <SharedLinkBanner
            sharedUrl={meeting.sharedAppUrl || SHARED_APP_URL}
            totalSaved={registrations.length}
            onOpenReporting={() => setIsReportingModalOpen(true)}
          />
        )}

        {/* Autonomous WhatsApp Background Automation Robot (Hidden for David Nkwe) */}
        {!isDave && <WhatsAppRobotBadge />}

        {/* Real-time RSVP Metrics Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attendance, Voter Status &amp; Ward Analytics
            </h2>
            <span className="text-[11px] text-slate-500">Live Firebase Synchronization</span>
          </div>
          <StatsCards stats={stats} hideDeclined={isDave} />
        </div>

        {/* Main Grid: QR Code Card & Notification Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Prominent Desktop Scannable QR Code */}
          <div className="lg:col-span-7">
            <QrCodeDisplay
              meeting={meeting}
              onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
              onOpenQrEditor={() => setIsQrEditorOpen(true)}
            />
          </div>

          {/* Side Panel: Designated Organizers & Quick actions */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Authorized Custodians &amp; Alerts
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Firebase Active
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Designated Organizers
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Notifications routed and administrative credentials active for:
                </p>
              </div>

              {/* The two required recipient chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-755">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      DN
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">David Nkwe</div>
                      <div className="text-[11px] text-slate-400 font-mono">+27 76 977 5423 &bull; dave.nkwe@gmail.com</div>
                      <div className="text-[10px] text-indigo-400 font-mono mt-0.5">User ID: DaveN</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Ready</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-755">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                      KM
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Katlego Mathunywa</div>
                      <div className="text-[11px] text-slate-400 font-mono">+27 69 497 7018 &bull; Kenny.weeder71@gmail.com</div>
                      <div className="text-[10px] text-purple-400 font-mono mt-0.5">User ID: Kmat (KatlegoM)</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Ready</span>
                </div>
              </div>

              {/* Partner Portals Fast Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Partner Websites Shared via QR:
                </span>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={meeting.eotofUrl || 'https://www.eotof.co.za'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-[11px] text-slate-400 hover:text-white group"
                  >
                    <span className="font-mono text-indigo-300">www.eotof.co.za</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-300" />
                  </a>
                  <a
                    href={meeting.damlogateUrl || 'https://www.damlogate.co.za'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-[11px] text-slate-400 hover:text-white group"
                  >
                    <span className="font-mono text-emerald-300">www.damlogate.co.za</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-300" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Panel */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setIsGeneratorSuiteOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Create QR/Barcode</span>
              </button>
              <button
                onClick={() => setIsReportingModalOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Audit Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Event Calendar & Schedule */}
        <div id="calendar-section" className="scroll-mt-24">
          <MeetingCalendar
            meeting={meeting}
            registrations={registrations}
          />
        </div>

        {/* Full Attendees Live Roster (Hidden for David Nkwe) */}
        {!isDave && (
          <div>
            <AttendeeList
              registrations={registrations}
              onDeleteAttendee={handleDeleteAttendee}
              onRefreshData={fetchData}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Damlogate QR Code Generator &bull; Google Cloud Firestore &bull; Persistent Storage
          </div>
          <div className="flex items-center gap-3">
            <a href={meeting.eotofUrl || 'https://www.eotof.co.za'} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400">
              www.eotof.co.za
            </a>
            <span>&bull;</span>
            <a href={meeting.damlogateUrl || 'https://www.damlogate.co.za'} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-400">
              www.damlogate.co.za
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PresenterStageMode
        isOpen={isStageModeOpen}
        onClose={() => setIsStageModeOpen(false)}
        meeting={meeting}
        stats={stats}
        registrations={registrations}
        onOpenQrEditor={() => {
          setIsStageModeOpen(false);
          setIsQrEditorOpen(true);
        }}
      />

      <QrBarcodeGeneratorModal
        isOpen={isGeneratorSuiteOpen}
        onClose={() => setIsGeneratorSuiteOpen(false)}
        meeting={meeting}
        currentUser={currentUser}
      />

      <QrInformationEditorModal
        isOpen={isQrEditorOpen}
        onClose={() => setIsQrEditorOpen(false)}
        meeting={meeting}
        onSaveQrConfig={handleSaveQrConfig}
        onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
      />

      <ReportingModal
        isOpen={isReportingModalOpen}
        onClose={() => setIsReportingModalOpen(false)}
        meeting={meeting}
        stats={stats}
        registrations={registrations}
        currentUser={currentUser}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        meeting={meeting}
        stats={stats}
        notifications={notifications}
        registrations={registrations}
        onTriggerDigest={handleTriggerDigest}
      />

      <MeetingSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        meeting={meeting}
        onSaveMeeting={handleSaveMeeting}
        onResetData={handleResetData}
      />

      <MobileSimulatorModal
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        meeting={meeting}
        onSubmitSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
