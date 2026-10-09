import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, 
  Check, 
  Barcode,
  Award,
  ShieldCheck,
  FileText,
  ExternalLink
} from 'lucide-react';
import { MeetingConfig } from '../types';

interface QrCodeDisplayProps {
  meeting: MeetingConfig;
  onOpenMobileSimulator?: () => void;
  onOpenQrEditor?: () => void;
  onOpenGeneratorSuite: () => void;
  isDave?: boolean;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  meeting,
  onOpenGeneratorSuite,
  isDave = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFormLink, setCopiedFormLink] = useState<boolean>(false);
  const [targetUrl, setTargetUrl] = useState<string>('');

  // Attendee Form link attached to QR code
  const attendeeFormUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?view=register`
    : '?view=register';

  const qrConfig = meeting.qrConfig || {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Instant RSVP & Partner Portals',
    customUrl: '',
    googleFormsUrl: meeting.googleFormsUrl || '',
    eotofUrl: meeting.eotofUrl || 'https://www.eotof.co.za',
    damlogateUrl: meeting.damlogateUrl || 'https://www.damlogate.co.za',
    whatsappNumber: '27769775423',
    whatsappPrefillMessage: `Hello David Nkwe and Katlego Mathunywa, I am registering for ${meeting.title}. Please confirm my attendance.`,
    showEotofLink: true,
    showDamlogateLink: true,
    showWhatsAppLink: true,
    additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    qrTheme: 'executive_dark',
    errorCorrectionLevel: 'H',
    useSharedDomain: true,
  };

  useEffect(() => {
    // Explicitly attach the Attendee Form link to the QR code URL
    const finalUrl = attendeeFormUrl;
    setTargetUrl(finalUrl);

    // Generate high-definition vector QR code with Level-H error correction (works on all cell phone makes & models)
    QRCode.toDataURL(finalUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: qrConfig.fgColor || '#0f172a',
        light: qrConfig.bgColor || '#ffffff',
      },
      errorCorrectionLevel: qrConfig.errorCorrectionLevel || 'H',
    }).then(setQrDataUrl).catch(console.error);
  }, [meeting, qrConfig, attendeeFormUrl]);

  const handleCopyLink = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleCopyFormLink = () => {
    if (!attendeeFormUrl) return;
    navigator.clipboard.writeText(attendeeFormUrl);
    setCopiedFormLink(true);
    setTimeout(() => setCopiedFormLink(false), 2200);
  };

  const isGold = qrConfig.qrTheme === 'gold_obsidian';
  const isEmerald = qrConfig.qrTheme === 'emerald_cyber';

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
        isGold ? 'bg-amber-500/10' : isEmerald ? 'bg-emerald-500/10' : 'bg-indigo-500/10'
      }`} />

      <div>
        {/* Header with Title: Scan to Register & Access Portals */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                isGold 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : isEmerald
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {qrConfig.badgeText || 'Instant RSVP & Partner Portals'}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pure Secure &bull; Global Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Scan to Register &amp; Access Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Compatible with any cell phone model, camera, or QR scanner app.
            </p>
          </div>
        </div>

        {/* Link for the Attendee Form attached on the QR Code */}
        <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Attendee Form Link (Attached to QR Code):
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live QR Destination
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={attendeeFormUrl}
              className="flex-1 bg-slate-900 border border-slate-750 px-2.5 py-1.5 rounded-lg text-indigo-300 text-xs font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyFormLink}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Copy Attendee Form Link"
            >
              {copiedFormLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormLink ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={attendeeFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer shrink-0"
              title="Open Attendee Form in new tab"
            >
              <span>Open</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* The QR Code Card Frame */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className={`relative p-5 sm:p-6 bg-white rounded-3xl shadow-2xl border-4 flex items-center justify-center transition-all ${
            isGold 
              ? 'border-amber-500/60 shadow-amber-950/20' 
              : isEmerald
              ? 'border-emerald-500/60 shadow-emerald-950/20'
              : 'border-indigo-500/40 shadow-indigo-950/20'
          }`}>
            {/* Target corners indicator */}
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-slate-900"></div>
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-slate-900"></div>
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-slate-900"></div>
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-slate-900"></div>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Scan to Register & Access Portals"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain transition-all duration-200 select-none"
              />
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: ONLY keep QR code generator next to copy url */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-3 sm:gap-4 w-full">
        {/* Copy URL */}
        <button
          onClick={handleCopyLink}
          className="flex-1 max-w-[220px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer shadow-sm"
          title="Copy the scannable portal URL to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy URL</span>
            </>
          )}
        </button>

        {/* QR Code Generator */}
        <button
          onClick={onOpenGeneratorSuite}
          className="flex-1 max-w-[240px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer"
          title="Open QR & Barcode Generator Suite"
        >
          <Barcode className="w-4 h-4 text-white" />
          <span>QR Code Generator</span>
        </button>
      </div>
    </div>
  );
};
