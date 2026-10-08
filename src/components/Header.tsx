import React from 'react';
import { 
  QrCode, 
  Tv, 
  Mail, 
  Settings, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Users, 
  Edit3, 
  BarChart3, 
  Lock, 
  UserCheck,
  LogOut,
  Calendar,
  Barcode
} from 'lucide-react';
import { MeetingConfig, OrganizerUser } from '../types';

interface HeaderProps {
  meeting: MeetingConfig;
  onOpenStageMode: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenQrEditor: () => void;
  onOpenGeneratorSuite: () => void;
  onOpenReporting: () => void;
  onOpenLogin: () => void;
  onOpenRegistrationForm: () => void;
  onExportCsv: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  unreadNotificationsCount?: number;
  viewMode: 'dashboard' | 'calendar' | 'form' | 'login';
  onSetViewMode: (mode: 'dashboard' | 'calendar' | 'form' | 'login') => void;
  currentUser?: OrganizerUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  meeting,
  onOpenStageMode,
  onOpenNotifications,
  onOpenSettings,
  onOpenQrEditor,
  onOpenGeneratorSuite,
  onOpenReporting,
  onOpenLogin,
  onOpenRegistrationForm,
  soundEnabled,
  onToggleSound,
  unreadNotificationsCount = 0,
  viewMode,
  onSetViewMode,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Branding & Status */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div 
              onClick={() => onSetViewMode('dashboard')}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            >
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
                  Damlogate QR Code Generator
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Firebase Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Organizers: David Nkwe &bull; Katlego Mathunywa &bull; Universal Cell Phone Compatibility
              </p>
            </div>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* View Mode Toggle: Dashboard | Calendar | Attendee Form */}
            <div className="bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 flex items-center">
              <button
                onClick={() => onSetViewMode('dashboard')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="View Dashboard"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Dashboard</span>
                </span>
              </button>

              <button
                onClick={() => onSetViewMode('calendar')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="View Event Calendar"
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Calendar</span>
                </span>
              </button>

              <button
                onClick={() => onSetViewMode('form')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'form'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="View Registration Form"
              >
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Attendee Form</span>
                </span>
              </button>
            </div>

            {/* QR & Barcode Generator Suite Button */}
            <button
              onClick={onOpenGeneratorSuite}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
              title="Generate Custom QR Codes & Barcodes for any phone"
            >
              <Barcode className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Generator Suite</span>
            </button>

            {/* Reports Suite Button */}
            <button
              onClick={onOpenReporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              title="Access Persistent Attendance & RSVP Reports"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Reports</span>
            </button>

            {/* Edit QR Code Information */}
            <button
              onClick={onOpenQrEditor}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Edit QR Code Destinations & Information"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Edit QR</span>
            </button>

            {/* Stage / Projector Mode */}
            <button
              onClick={onOpenStageMode}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Show Fullscreen Presenter / TV Screen with Big QR Code"
            >
              <Tv className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Screen Mode</span>
            </button>

            {/* Profile View / Authentication */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60 transition-colors cursor-pointer"
                  title={`Organizer Profile: ${currentUser.fullName} (${currentUser.username})`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono">{currentUser.username}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold border bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border-rose-800/60 transition-colors cursor-pointer shadow-sm"
                  title={`Log-Off ${currentUser.fullName} session`}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="inline">Log-Off</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  onOpenLogin();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold border bg-slate-800 hover:bg-rose-950/40 text-rose-300 hover:text-white border-slate-700 hover:border-rose-800/60 transition-colors cursor-pointer"
                title="Log-Off session"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="inline">Log-Off</span>
              </button>
            )}

            {/* Email Notifications Center */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Notifications Log (Dave Nkwe & Kenny Weeder)"
            >
              <Mail className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Sound Chime Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-slate-800 text-indigo-400 border-indigo-500/40 hover:bg-slate-750' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={soundEnabled ? 'Chime sound: Enabled' : 'Chime sound: Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Meeting Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Meeting & Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
