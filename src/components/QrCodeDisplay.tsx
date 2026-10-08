import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Smartphone, 
  Edit3, 
  Globe, 
  ShieldCheck,
  MessageCircle,
  Award
} from 'lucide-react';
import { MeetingConfig } from '../types';

interface QrCodeDisplayProps {
  meeting: MeetingConfig;
  onOpenMobileSimulator: () => void;
  onOpenQrEditor: () => void;
  onOpenFullscreenQr?: () => void;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  meeting,
  onOpenMobileSimulator,
  onOpenQrEditor,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [targetUrl, setTargetUrl] = useState<string>('');

  const qrConfig = meeting.qrConfig || {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Exclusive Premium QR Code',
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
    const baseOrigin = qrConfig.useSharedDomain && meeting.sharedAppUrl ? meeting.sharedAppUrl : window.location.origin;
    let finalUrl = '';
    if (qrConfig.mode === 'whatsapp_direct') {
      const phone = (qrConfig.whatsappNumber || '27769775423').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(qrConfig.whatsappPrefillMessage || `Hello David Nkwe and Katlego Mathunywa, I would like to RSVP for: ${meeting.title}`);
      finalUrl = `https://wa.me/${phone}?text=${msg}`;
    } else if (qrConfig.mode === 'registration_hub') {
      const url = new URL(baseOrigin);
      url.searchParams.set('view', 'register');
      finalUrl = url.toString();
    } else if (qrConfig.mode === 'google_form_direct') {
      finalUrl = qrConfig.googleFormsUrl || `${baseOrigin}?view=register`;
    } else if (qrConfig.mode === 'portal_links') {
      const url = new URL(baseOrigin);
      url.searchParams.set('view', 'portals');
      finalUrl = url.toString();
    } else if (qrConfig.mode === 'custom_url') {
      finalUrl = qrConfig.customUrl || baseOrigin;
    } else {
      const url = new URL(baseOrigin);
      url.searchParams.set('view', 'register');
      finalUrl = url.toString();
    }

    setTargetUrl(finalUrl);

    // Generate high-definition vector QR code with Level-H error correction
    QRCode.toDataURL(finalUrl, {
      width: 460,
      margin: 2,
      color: {
        dark: qrConfig.fgColor || '#0f172a',
        light: qrConfig.bgColor || '#ffffff',
      },
      errorCorrectionLevel: qrConfig.errorCorrectionLevel || 'H',
    }).then(setQrDataUrl).catch(console.error);
  }, [meeting, qrConfig]);

  const handleCopyLink = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `premium-rsvp-qr-${meeting.title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const qrPixelSize = 
    qrSize === 'md' ? 'w-48 h-48 sm:w-56 sm:h-56' :
    qrSize === 'lg' ? 'w-60 h-60 sm:w-72 sm:h-72' :
    'w-72 h-72 sm:w-84 sm:h-84';

  const isGold = qrConfig.qrTheme === 'gold_obsidian';
  const isEmerald = qrConfig.qrTheme === 'emerald_cyber';

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
        isGold ? 'bg-amber-500/10' : isEmerald ? 'bg-emerald-500/10' : 'bg-indigo-500/10'
      }`} />

      <div>
        {/* Header with Title and Editor Button */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                isGold 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : isEmerald
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {qrConfig.badgeText || 'Exclusive Premium QR Code'}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pure Secure &bull; Global Verified
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              {qrConfig.qrTitle || 'Scan from Desktop Screen'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {qrConfig.qrSubtitle || 'Compatible with any cell phone model, camera, or QR scanner app.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Edit QR Code Info button */}
            <button
              onClick={onOpenQrEditor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Edit QR information, links, and partner portals"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit QR</span>
            </button>

            {/* Size controls */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60">
              <button
                onClick={() => setQrSize('md')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${qrSize === 'md' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Standard Size"
              >
                M
              </button>
              <button
                onClick={() => setQrSize('lg')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${qrSize === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Large Size"
              >
                L
              </button>
              <button
                onClick={() => setQrSize('xl')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${qrSize === 'xl' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Extra Large"
              >
                XL
              </button>
            </div>
          </div>
        </div>

        {/* The QR Code Card Frame */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className={`relative p-4 sm:p-5 bg-white rounded-3xl shadow-2xl border-4 flex items-center justify-center transition-all ${
            isGold 
              ? 'border-amber-500/60 shadow-amber-950/20' 
              : isEmerald
              ? 'border-emerald-500/60 shadow-emerald-950/20'
              : 'border-indigo-500/30 shadow-indigo-950/20'
          }`}>
            {/* Target corners indicator */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600"></div>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Exclusive Premium QR Code"
                className={`${qrPixelSize} object-contain transition-all duration-200 select-none`}
              />
            ) : (
              <div className={`${qrPixelSize} flex items-center justify-center text-slate-400`}>
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Quick instructions pill below QR */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 max-w-md text-center">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
            <span className="line-clamp-1">Any Model (iPhone, Samsung, Android) &bull; Camera &bull; WhatsApp Ready</span>
          </div>

          {/* Quick Links Chips (WhatsApp + Portals) */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <a
              href="https://wa.me/27769775423?text=Hi%20David%20Nkwe%20and%20Katlego%20Mathunywa%2C%20I%20am%20confirming%20my%20Meeting%20RSVP."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs text-emerald-300 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Direct RSVP</span>
            </a>
            <a
              href={qrConfig.eotofUrl || 'https://www.eotof.co.za'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>www.eotof.co.za</span>
            </a>
            <a
              href={qrConfig.damlogateUrl || 'https://www.damlogate.co.za'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>www.damlogate.co.za</span>
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Test on screen / Simulator */}
          <button
            onClick={onOpenMobileSimulator}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Preview what mobile scanners see right on your desktop"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Scan</span>
          </button>
          {/* Open in new tab */}
          <a
            href={targetUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="Open link in a new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Link</span>
          </a>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          {/* Download Image */}
          <button
            onClick={handleDownloadQr}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Save PNG for slide decks or printed signage"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
