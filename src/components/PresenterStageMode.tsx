import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Maximize, 
  Minimize, 
  Users, 
  UserCheck, 
  Smartphone,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Edit3,
  Globe,
  ExternalLink,
  CheckSquare
} from 'lucide-react';
import { MeetingConfig, RegistrationStats, Registration } from '../types';

interface PresenterStageModeProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  stats: RegistrationStats;
  registrations: Registration[];
  onOpenQrEditor?: () => void;
}

export const PresenterStageMode: React.FC<PresenterStageModeProps> = ({
  isOpen,
  onClose,
  meeting,
  stats,
  registrations,
  onOpenQrEditor,
}) => {
  const [stageQrUrl, setStageQrUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const qrConfig = meeting.qrConfig || {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Instant RSVP & Partner Portals',
    customUrl: '',
    googleFormsUrl: meeting.googleFormsUrl || '',
    eotofUrl: meeting.eotofUrl || 'https://www.eotof.co.za',
    damlogateUrl: meeting.damlogateUrl || 'https://www.damlogate.co.za',
    showEotofLink: true,
    showDamlogateLink: true,
    additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
    fgColor: '#020617',
    bgColor: '#ffffff',
    errorCorrectionLevel: 'H',
  };

  useEffect(() => {
    if (!isOpen) return;
    const origin = window.location.origin;
    let target = '';
    if (qrConfig.mode === 'registration_hub') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'register');
      target = url.toString();
    } else if (qrConfig.mode === 'google_form_direct') {
      target = qrConfig.googleFormsUrl || `${origin}?view=register`;
    } else if (qrConfig.mode === 'portal_links') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'portals');
      target = url.toString();
    } else if (qrConfig.mode === 'custom_url') {
      target = qrConfig.customUrl || origin;
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'register');
      target = url.toString();
    }

    QRCode.toDataURL(target, {
      width: 500,
      margin: 2,
      color: {
        dark: qrConfig.fgColor || '#020617',
        light: qrConfig.bgColor || '#ffffff',
      },
      errorCorrectionLevel: qrConfig.errorCorrectionLevel || 'H',
    }).then(setStageQrUrl).catch(console.error);
  }, [isOpen, meeting, qrConfig]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!isOpen) return null;

  const latestAttendees = registrations.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto animate-in fade-in duration-300">
      {/* Top Bar Controls */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE DESKTOP MONITOR DISPLAY
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Any Cell Phone Model &bull; Camera or QR App &bull; Instant RSVP &amp; Portals
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQrEditor && (
            <button
              onClick={onOpenQrEditor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/40 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit QR Info</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Exit Stage Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Stage Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-10 flex flex-col justify-center">
        {/* Meeting Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{qrConfig.badgeText || 'Instant RSVP & Partner Portals'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            {meeting.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 line-clamp-2">
            {meeting.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {meeting.date}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <Clock className="w-4 h-4 text-indigo-400" />
              {meeting.time}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <MapPin className="w-4 h-4 text-indigo-400" />
              {meeting.location}
            </span>
          </div>
        </div>

        {/* Centerpiece: QR Code & Live Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Big QR Code Card (Left / Center) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/40">
              {/* Corner targeting marks */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-indigo-600"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-indigo-600"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-indigo-600"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-indigo-600"></div>

              {stageQrUrl ? (
                <img
                  src={stageQrUrl}
                  alt="Desktop Screen QR Code"
                  className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain select-none"
                />
              ) : (
                <div className="w-72 h-72 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm sm:text-base font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-5 py-2 rounded-full">
              <Smartphone className="w-5 h-5 animate-bounce" />
              <span>Point cell phone camera at screen to register</span>
            </div>

            {/* Partner Portals Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <a
                href={qrConfig.eotofUrl || 'https://www.eotof.co.za'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>www.eotof.co.za</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={qrConfig.damlogateUrl || 'https://www.damlogate.co.za'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>www.damlogate.co.za</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Real-time RSVP Counters & Ticker (Right) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Massive Counter 1: Total Registered */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Total Registered
                </span>
                <div className="text-4xl sm:text-6xl font-black text-white mt-2 tracking-tight">
                  {stats.total}
                </div>
                <div className="text-xs text-slate-400 mt-1">Confirmed responses from scans</div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-8 h-8" />
              </div>
            </div>

            {/* Massive Counter 2: Will Attend Meeting */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/50 shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Will Attend Meeting
                </span>
                <div className="text-4xl sm:text-6xl font-black text-white mt-2 tracking-tight">
                  {stats.attending}
                </div>
                <div className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-3">
                  <span>{stats.inPerson} In-Person</span>
                  <span>•</span>
                  <span>{stats.virtual} Virtual</span>
                  <span>•</span>
                  <span>{stats.attendanceRate}% Attendance Rate</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <UserCheck className="w-8 h-8" />
              </div>
            </div>

            {/* Massive Counter 3: Did you register to vote ! */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/40 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  Did you register to vote !
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-300 tracking-tight">
                    {stats.registeredToVoteYes ?? 0}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 uppercase">Yes</span>
                  <span className="text-slate-500 font-light text-xl">/</span>
                  <span className="text-2xl sm:text-3xl font-bold text-slate-300">
                    {stats.registeredToVoteNo ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase">No</span>
                </div>
                <div className="text-xs text-cyan-400 mt-1 font-semibold">
                  {stats.registeredToVoteRate ?? 0}% Confirmed Registered Voters
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <CheckSquare className="w-7 h-7" />
              </div>
            </div>

            {/* Live Registrant Feed Ticker */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Recent Check-Ins
                </span>
                <span className="text-slate-500">Live Feed</span>
              </div>
              <div className="space-y-2">
                {latestAttendees.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    Awaiting first QR scan...
                  </div>
                ) : (
                  latestAttendees.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {att.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{att.fullName}</div>
                          <div className="text-[11px] text-slate-400">{att.organization || 'Attendee'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          att.registeredToVote === 'Yes'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-700/60 text-slate-400'
                        }`}>
                          {att.registeredToVote === 'Yes' ? 'Voter: Yes' : 'Voter: No'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          att.attendance === 'in_person'
                            ? 'bg-blue-500/20 text-blue-300'
                            : att.attendance === 'virtual'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {att.attendance === 'in_person' ? 'In-Person' : att.attendance === 'virtual' ? 'Virtual' : 'Apologies'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
