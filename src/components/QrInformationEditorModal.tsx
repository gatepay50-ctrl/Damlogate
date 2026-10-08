import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Save, 
  Globe, 
  Check, 
  Smartphone, 
  Layers, 
  Sparkles, 
  Palette, 
  Copy, 
  ShieldCheck,
  MessageCircle,
  Award
} from 'lucide-react';
import { MeetingConfig, QrCodeConfig, QrTheme } from '../types';

interface QrInformationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  onSaveQrConfig: (config: QrCodeConfig) => Promise<void>;
  onOpenMobileSimulator: () => void;
}

export const QrInformationEditorModal: React.FC<QrInformationEditorModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSaveQrConfig,
  onOpenMobileSimulator,
}) => {
  const [config, setConfig] = useState<QrCodeConfig>(() => meeting.qrConfig || {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Exclusive Premium QR Code',
    customUrl: '',
    googleFormsUrl: meeting.googleFormsUrl || 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
    eotofUrl: meeting.eotofUrl || 'https://www.eotof.co.za',
    damlogateUrl: meeting.damlogateUrl || 'https://www.damlogate.co.za',
    whatsappNumber: '27769775423',
    whatsappPrefillMessage: `Hello David Nkwe and Katlego Mathunywa, I am registering for the ${meeting.title}. Please confirm my attendance.`,
    showEotofLink: true,
    showDamlogateLink: true,
    showWhatsAppLink: true,
    additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    qrTheme: 'executive_dark',
    errorCorrectionLevel: 'H',
    useSharedDomain: true,
  });

  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');
  const [resolvedEncodedUrl, setResolvedEncodedUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Compute what URL is encoded into the QR code based on selected mode & domain
  const getEncodedUrl = (cfg: QrCodeConfig): string => {
    const baseOrigin = cfg.useSharedDomain && meeting.sharedAppUrl ? meeting.sharedAppUrl : window.location.origin;
    if (cfg.mode === 'whatsapp_direct') {
      const phone = (cfg.whatsappNumber || '27769775423').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(cfg.whatsappPrefillMessage || `Hello David Nkwe and Katlego Mathunywa, I would like to RSVP for: ${meeting.title}`);
      return `https://wa.me/${phone}?text=${msg}`;
    } else if (cfg.mode === 'registration_hub') {
      const url = new URL(baseOrigin);
      url.searchParams.set('view', 'register');
      return url.toString();
    } else if (cfg.mode === 'google_form_direct') {
      return cfg.googleFormsUrl || `${baseOrigin}?view=register`;
    } else if (cfg.mode === 'portal_links') {
      const url = new URL(baseOrigin);
      url.searchParams.set('view', 'portals');
      return url.toString();
    } else if (cfg.mode === 'custom_url') {
      return cfg.customUrl || baseOrigin;
    }
    return `${baseOrigin}?view=register`;
  };

  // Re-generate live preview QR code whenever config changes
  useEffect(() => {
    const encoded = getEncodedUrl(config);
    setResolvedEncodedUrl(encoded);
    QRCode.toDataURL(encoded, {
      width: 440,
      margin: 2,
      color: {
        dark: config.fgColor || '#0f172a',
        light: config.bgColor || '#ffffff',
      },
      errorCorrectionLevel: config.errorCorrectionLevel || 'H',
    }).then(setPreviewQrUrl).catch(console.error);
  }, [config]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveQrConfig(config);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resolvedEncodedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const applyTheme = (theme: QrTheme) => {
    if (theme === 'executive_dark') {
      setConfig({ ...config, qrTheme: theme, fgColor: '#0f172a', bgColor: '#ffffff' });
    } else if (theme === 'gold_obsidian') {
      setConfig({ ...config, qrTheme: theme, fgColor: '#854d0e', bgColor: '#ffffff' });
    } else if (theme === 'emerald_cyber') {
      setConfig({ ...config, qrTheme: theme, fgColor: '#065f46', bgColor: '#ffffff' });
    } else {
      setConfig({ ...config, qrTheme: theme, fgColor: '#020617', bgColor: '#ffffff' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Exclusive Premium QR Code Generator &amp; Content Editor
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  Production Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Universal scannability across all phone makes/models with WhatsApp 1-tap integration and partner portals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (7 cols) */}
          <form id="qr-editor-form" onSubmit={handleSave} className="lg:col-span-7 space-y-5">
            {/* 1. Destination Mode Selection */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-755 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                QR Destination &amp; Scan Behavior
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Mode 1: Registration Hub */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'registration_hub'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="registration_hub"
                      checked={config.mode === 'registration_hub'}
                      onChange={() => setConfig({ ...config, mode: 'registration_hub' })}
                      className="text-indigo-600"
                    />
                    <span className="font-bold text-white">Full Registration Hub</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Google Form RSVP + WhatsApp + Instant buttons for www.eotof.co.za &amp; www.damlogate.co.za
                  </p>
                </label>

                {/* Mode 2: WhatsApp Direct Link Option */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'whatsapp_direct'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="whatsapp_direct"
                      checked={config.mode === 'whatsapp_direct'}
                      onChange={() => setConfig({ ...config, mode: 'whatsapp_direct' })}
                      className="text-emerald-600"
                    />
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Direct RSVP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Opens WhatsApp immediately with pre-filled registration text to Dave or Katlego
                  </p>
                </label>

                {/* Mode 3: Direct Google Form */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'google_form_direct'
                    ? 'bg-purple-950/60 border-purple-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="google_form_direct"
                      checked={config.mode === 'google_form_direct'}
                      onChange={() => setConfig({ ...config, mode: 'google_form_direct' })}
                      className="text-purple-600"
                    />
                    <span className="font-bold text-white">Direct Google Form</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Opens external Google Form link directly upon smartphone scan
                  </p>
                </label>

                {/* Mode 4: Portals Landing */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'portal_links'
                    ? 'bg-blue-950/60 border-blue-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="portal_links"
                      checked={config.mode === 'portal_links'}
                      onChange={() => setConfig({ ...config, mode: 'portal_links' })}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-white">Partner Portals Hub</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Multi-link portal focusing on www.eotof.co.za &amp; www.damlogate.co.za
                  </p>
                </label>
              </div>
            </div>

            {/* WhatsApp Options if WhatsApp Direct selected */}
            {config.mode === 'whatsapp_direct' && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  WhatsApp Direct Recipient &amp; Message
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, whatsappNumber: '27769775423' })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                      config.whatsappNumber.includes('769775423')
                        ? 'bg-emerald-900/60 border-emerald-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>David Nkwe</div>
                    <div className="text-[10px] text-emerald-400 font-mono">+27 76 977 5423</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, whatsappNumber: '27694977018' })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                      config.whatsappNumber.includes('694977018')
                        ? 'bg-emerald-900/60 border-emerald-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>Katlego Mathunywa</div>
                    <div className="text-[10px] text-emerald-400 font-mono">+27 69 497 7018</div>
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Pre-filled WhatsApp Message:</label>
                  <textarea
                    rows={2}
                    value={config.whatsappPrefillMessage}
                    onChange={(e) => setConfig({ ...config, whatsappPrefillMessage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-emerald-500/40 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            )}

            {/* 2. Global Domain Target */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-755 space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" />
                Production Domain Target (Global Live Scan)
              </label>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="domainMode"
                    checked={config.useSharedDomain === true}
                    onChange={() => setConfig({ ...config, useSharedDomain: true })}
                    className="text-indigo-600"
                  />
                  <span>Live Production Shared URL (<strong>ais-pre</strong>)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="domainMode"
                    checked={config.useSharedDomain === false}
                    onChange={() => setConfig({ ...config, useSharedDomain: false })}
                    className="text-indigo-600"
                  />
                  <span>Current Origin</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Target: {config.useSharedDomain ? meeting.sharedAppUrl : window.location.origin}
              </p>
            </div>

            {/* 3. Partner Websites */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-755 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" />
                Partner Portals (www.eotof.co.za &amp; www.damlogate.co.za)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">EOTOF Portal</span>
                  <input
                    type="text"
                    value={config.eotofUrl}
                    onChange={(e) => setConfig({ ...config, eotofUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Damlogate Portal</span>
                  <input
                    type="text"
                    value={config.damlogateUrl}
                    onChange={(e) => setConfig({ ...config, damlogateUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. Exclusive Premium Themes */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-755 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-400" />
                Exclusive Premium QR Code Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'executive_dark', label: 'Executive Slate', fg: '#0f172a' },
                  { id: 'gold_obsidian', label: 'Obsidian Gold', fg: '#854d0e' },
                  { id: 'emerald_cyber', label: 'Emerald Cyber', fg: '#065f46' },
                  { id: 'clean_white', label: 'Pure Studio', fg: '#020617' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => applyTheme(th.id as QrTheme)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      config.qrTheme === th.id
                        ? 'bg-indigo-950/70 border-indigo-500 font-bold text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full mx-auto mb-1 border" style={{ backgroundColor: th.fg }} />
                    <span className="text-[11px]">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Right Column: Live QR Code Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="p-5 rounded-2xl bg-slate-850 border border-slate-755 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Exclusive Premium Scannable QR Code</span>
              </div>
              {/* The Rendered QR Code */}
              <div className="relative p-5 bg-white rounded-3xl shadow-2xl border-4 border-amber-500/40 my-2">
                {/* Targeting corners */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-600"></div>
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-600"></div>
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-600"></div>
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-600"></div>
                {previewQrUrl ? (
                  <img
                    src={previewQrUrl}
                    alt="Preview QR Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain select-none"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {/* Verification & Compatibility Badge */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Any Phone Model &bull; Camera &bull; WhatsApp Ready</span>
              </div>
              {/* Encoded URL display & copy */}
              <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Encoded Production Link:</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-white font-mono break-all line-clamp-2">
                  {resolvedEncodedUrl}
                </p>
              </div>
              {/* Mobile Scan Simulator test button */}
              <button
                type="button"
                onClick={onOpenMobileSimulator}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test Phone Scan Experience</span>
              </button>
            </div>

            {/* Quick summary of features */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
              <span className="font-bold text-white block text-[11px] uppercase tracking-wider">
                Production Integrity &bull; Pure Secure QR:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>30% Error Correction (Level H) for computer monitors &amp; glare</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Returns real production data across any device globally</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>WhatsApp integration to David (+27 76 977 5423) &amp; Katlego (+27 69 497 7018)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-400 hidden sm:block">
            Changes immediately update the desktop screen QR code.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="qr-editor-form"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved &amp; Updated!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save QR Code Information</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
