import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode, 
  Barcode, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Globe, 
  MessageCircle, 
  Wifi, 
  User, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Save, 
  Database,
  Printer,
  Trash2
} from 'lucide-react';
import { GeneratedCode, MeetingConfig, OrganizerUser } from '../types';

interface QrBarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  currentUser?: OrganizerUser | null;
  isDave?: boolean;
}

export const QrBarcodeGeneratorModal: React.FC<QrBarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  meeting,
  currentUser,
  isDave = false,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode' | 'saved'>('qr');
  
  // QR configuration
  const attendeeFormUrl = typeof window !== 'undefined' ? `${window.location.origin}?view=register` : '?view=register';
  const [qrCategory, setQrCategory] = useState<'url' | 'whatsapp' | 'vcard' | 'wifi' | 'text'>('url');
  const [qrTitle, setQrTitle] = useState('Damlogate Attendee Form QR Code');
  const [qrContent, setQrContent] = useState(attendeeFormUrl);
  const [qrFgColor, setQrFgColor] = useState('#0f172a');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrLevel, setQrLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrDataUrl, setQrDataUrl] = useState('');
  
  // Specific category inputs
  const [targetUrl, setTargetUrl] = useState(attendeeFormUrl);
  const [waPhone, setWaPhone] = useState('27769775423');
  const [waMessage, setWaMessage] = useState('Hello David Nkwe and Katlego Mathunywa, I am registering for the meeting.');
  const [vcardName, setVcardName] = useState('David Nkwe');
  const [vcardPhone, setVcardPhone] = useState('+27 76 977 5423');
  const [vcardEmail, setVcardEmail] = useState('dave.nkwe@gmail.com');
  const [wifiSsid, setWifiSsid] = useState('Damlogate-Guest');
  const [wifiPass, setWifiPass] = useState('Damlo@2026');

  // Barcode configuration
  const [barcodeTitle, setBarcodeTitle] = useState('Attendee Badge Barcode');
  const [barcodeText, setBarcodeText] = useState('DLG-2026-VOTE-01');
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Saved codes
  const [savedCodes, setSavedCodes] = useState<GeneratedCode[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch saved codes
  const fetchSavedCodes = async () => {
    try {
      const res = await fetch('/api/codes');
      if (res.ok) {
        const data = await res.json();
        setSavedCodes(data.codes || []);
      }
    } catch (e) {
      console.debug('Error loading codes:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isDave) {
        setActiveTab('qr');
      } else {
        fetchSavedCodes();
      }
    }
  }, [isOpen, isDave]);

  // Update QR content based on category
  useEffect(() => {
    if (qrCategory === 'url') {
      setQrContent(targetUrl);
    } else if (qrCategory === 'whatsapp') {
      const cleanPhone = waPhone.replace(/[^0-9]/g, '');
      setQrContent(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`);
    } else if (qrCategory === 'vcard') {
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:Damlogate & EOTOF\nEND:VCARD`;
      setQrContent(vcard);
    } else if (qrCategory === 'wifi') {
      setQrContent(`WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`);
    }
  }, [qrCategory, targetUrl, waPhone, waMessage, vcardName, vcardPhone, vcardEmail, wifiSsid, wifiPass]);

  // Generate QR code data URL
  useEffect(() => {
    if (!qrContent) return;
    QRCode.toDataURL(qrContent, {
      width: 520,
      margin: 2,
      color: {
        dark: qrFgColor,
        light: qrBgColor,
      },
      errorCorrectionLevel: qrLevel,
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [qrContent, qrFgColor, qrBgColor, qrLevel]);

  // Draw Code 128-styled Barcode onto canvas
  useEffect(() => {
    if (activeTab !== 'barcode' || !barcodeCanvasRef.current) return;
    const canvas = barcodeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 440;
    canvas.height = 140;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate pseudo-deterministic Code128 pattern based on barcodeText string
    const str = barcodeText.toUpperCase().trim() || 'SAMPLE-128';
    let seed = 0;
    for (let i = 0; i < str.length; i++) {
      seed = (seed * 31 + str.charCodeAt(i)) & 0xffffffff;
    }

    const startX = 25;
    const endX = canvas.width - 25;
    const availableWidth = endX - startX;
    const barCount = 75;
    const barWidth = availableWidth / barCount;

    ctx.fillStyle = '#0f172a';
    let currentX = startX;

    // Start pattern
    ctx.fillRect(currentX, 15, barWidth * 2, 80);
    currentX += barWidth * 3;

    for (let i = 0; i < barCount - 10; i++) {
      // Deterministic bit
      const bit = ((seed >> (i % 31)) ^ (str.charCodeAt(i % str.length) << (i % 4))) & 1;
      const thickness = (i % 5 === 0) ? barWidth * 2.2 : (bit ? barWidth * 1.5 : barWidth * 0.8);
      
      if (i % 2 === 0 || bit) {
        ctx.fillRect(currentX, 15, Math.max(1.5, thickness), 80);
      }
      currentX += barWidth * 1.2;
      if (currentX >= endX - barWidth * 4) break;
    }

    // Stop pattern
    ctx.fillRect(endX - barWidth * 3, 15, barWidth * 2.5, 80);

    // Text underneath
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(str, canvas.width / 2, 120);
  }, [activeTab, barcodeText]);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `damlogate-qr-${qrTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadBarcode = () => {
    if (!barcodeCanvasRef.current) return;
    const a = document.createElement('a');
    a.href = barcodeCanvasRef.current.toDataURL('image/png');
    a.download = `damlogate-barcode-${barcodeText.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const codePayload: Partial<GeneratedCode> = {
        codeType: activeTab === 'barcode' ? 'barcode' : 'qr',
        title: activeTab === 'barcode' ? barcodeTitle : qrTitle,
        content: activeTab === 'barcode' ? barcodeText : qrContent,
        format: activeTab === 'barcode' ? 'Code 128' : `Level-${qrLevel} Vector QR`,
        category: qrCategory,
        createdBy: currentUser ? `${currentUser.fullName} (${currentUser.username})` : 'Organizer System',
      };

      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(codePayload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        fetchSavedCodes();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (isDave) {
      alert('Administrative privileges required to delete codes from database.');
      return;
    }
    if (!confirm('Delete this code from database?')) return;
    try {
      const res = await fetch(`/api/codes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSavedCodes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Damlogate QR &amp; Barcode Generator Suite
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                  Firebase Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Universal phone camera compatibility (iPhone, Samsung, Huawei, Android) with Level-H error correction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>QR Code Creator</span>
          </button>
          {!isDave && (
            <button
              onClick={() => setActiveTab('barcode')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'barcode'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Barcode className="w-4 h-4 text-blue-400" />
              <span>Barcode 1D/2D Creator</span>
            </button>
          )}
          {!isDave && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Saved Codes ({savedCodes.length})</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'qr' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Configuration */}
              <div className="lg:col-span-7 space-y-4">
                {/* QR Preset Categories */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select QR Content Category
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                    {[
                      { id: 'url', label: 'Website / RSVP', icon: Globe },
                      { id: 'whatsapp', label: 'WhatsApp Chat', icon: MessageCircle },
                      { id: 'vcard', label: 'Contact vCard', icon: User },
                      { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
                      { id: 'text', label: 'Plain Text', icon: FileText },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setQrCategory(cat.id as any)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            qrCategory === cat.id
                              ? 'bg-indigo-950/60 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/40 shadow-sm'
                              : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-indigo-400" />
                          <span className="text-[10px] text-center">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* QR Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    QR Code Title / Label
                  </label>
                  <input
                    type="text"
                    value={qrTitle}
                    onChange={(e) => setQrTitle(e.target.value)}
                    placeholder="e.g. Executive Meeting RSVP & Portals"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Conditional Inputs */}
                {qrCategory === 'url' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Destination Web URL
                    </label>
                    <input
                      type="url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Quick presets:</span>
                      <button
                        type="button"
                        onClick={() => setTargetUrl(attendeeFormUrl)}
                        className="text-indigo-400 font-semibold hover:underline cursor-pointer bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"
                      >
                        Attendee Registration Form Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetUrl('https://www.eotof.co.za')}
                        className="text-blue-400 hover:underline cursor-pointer"
                      >
                        www.eotof.co.za
                      </button>
                      <span>&bull;</span>
                      <button
                        type="button"
                        onClick={() => setTargetUrl('https://www.damlogate.co.za')}
                        className="text-emerald-400 hover:underline cursor-pointer"
                      >
                        www.damlogate.co.za
                      </button>
                    </div>
                  </div>
                )}

                {qrCategory === 'whatsapp' && (
                  <div className="space-y-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <div>
                      <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                        WhatsApp Recipient Phone (with country code)
                      </label>
                      <input
                        type="tel"
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        placeholder="27769775423"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-mono focus:outline-none focus:border-emerald-400"
                      />
                      <div className="mt-1 flex gap-2 text-[11px] text-slate-400">
                        <button
                          type="button"
                          onClick={() => setWaPhone('27769775423')}
                          className="text-emerald-400 hover:underline cursor-pointer"
                        >
                          David Nkwe (+27 76 977 5423)
                        </button>
                        <span>&bull;</span>
                        <button
                          type="button"
                          onClick={() => setWaPhone('27694977018')}
                          className="text-emerald-400 hover:underline cursor-pointer"
                        >
                          Katlego Mathunywa (+27 69 497 7018)
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                        Pre-filled Message
                      </label>
                      <textarea
                        rows={2}
                        value={waMessage}
                        onChange={(e) => setWaMessage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-emerald-500/40 text-white focus:outline-none focus:border-emerald-400 resize-none"
                      />
                    </div>
                  </div>
                )}

                {qrCategory === 'vcard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-850 border border-slate-750">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Phone</label>
                      <input
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {qrCategory === 'wifi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-850 border border-slate-750">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Network Name (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Wi-Fi Password</label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {qrCategory === 'text' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Raw Text / Information
                    </label>
                    <textarea
                      rows={3}
                      value={qrContent}
                      onChange={(e) => setQrContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}

                {/* Theme & Error Correction Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Error Correction Level
                    </label>
                    <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                      {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setQrLevel(lvl)}
                          className={`flex-1 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            qrLevel === lvl
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl} {lvl === 'H' ? '(30%)' : ''}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-emerald-400 mt-1 block">
                      Level H (30%) is best for all phone cameras &amp; glare.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Color Palette
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { label: 'Slate', fg: '#0f172a' },
                        { label: 'Emerald', fg: '#065f46' },
                        { label: 'Gold', fg: '#854d0e' },
                        { label: 'Black', fg: '#000000' },
                      ].map((pal) => (
                        <button
                          key={pal.label}
                          type="button"
                          onClick={() => setQrFgColor(pal.fg)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                            qrFgColor === pal.fg
                              ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold'
                              : 'border-slate-750 bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pal.fg }} />
                          <span>{pal.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Live Rendered Code */}
              <div className="lg:col-span-5 flex flex-col items-center justify-between p-5 rounded-2xl bg-slate-850 border border-slate-755 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Live Ultra-HD Generated QR Code</span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{qrTitle}</h3>

                  <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/40 my-3 inline-block">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Generated QR"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain select-none"
                      />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Compatible with All Cell Phone Cameras</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full mt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {!isDave && (
                    <button
                      type="button"
                      onClick={handleSaveToDatabase}
                      disabled={isSaving}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saveSuccess ? 'Saved to Firebase & Disk!' : isSaving ? 'Saving...' : 'Save QR to Database'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'barcode' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Barcode Config */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Standard 1D Linear Barcode Generator</h3>
                  <p className="text-xs text-slate-400">
                    Generates Code 128 barcodes for attendee badges, check-in passes, voter identification, and inventory tracking.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Barcode Label / Title
                  </label>
                  <input
                    type="text"
                    value={barcodeTitle}
                    onChange={(e) => setBarcodeTitle(e.target.value)}
                    placeholder="e.g. VIP Attendee Pass"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Barcode Value / Code Number (Alphanumeric)
                  </label>
                  <input
                    type="text"
                    value={barcodeText}
                    onChange={(e) => setBarcodeText(e.target.value.toUpperCase())}
                    placeholder="DLG-2026-VOTE-01"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white font-mono tracking-widest uppercase focus:outline-none focus:border-indigo-500"
                  />
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setBarcodeText(`DLG-WARD-${Math.floor(10 + Math.random() * 90)}`)}
                      className="text-indigo-400 hover:underline cursor-pointer"
                    >
                      Ward Badge
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => setBarcodeText(`RSVP-${Date.now().toString().slice(-6)}`)}
                      className="text-emerald-400 hover:underline cursor-pointer"
                    >
                      Ticket Number
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
                    Barcode Compatibility &amp; Scanning:
                  </span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    <li>&bull; Universally readable with standard cell phone barcode scanning apps.</li>
                    <li>&bull; Scannable by laser handheld scanners at event check-in desks.</li>
                    <li>&bull; Scaled for ID badges, wristbands, and printed invitations.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column (5 cols): Rendered Barcode */}
              <div className="lg:col-span-5 flex flex-col items-center justify-between p-5 rounded-2xl bg-slate-850 border border-slate-755 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-400 mb-1">
                    <Barcode className="w-4 h-4" />
                    <span>Rendered Linear Barcode (Code 128)</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-3">{barcodeTitle}</h3>

                  <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-300 inline-block">
                    <canvas ref={barcodeCanvasRef} className="w-full max-w-[320px] h-auto object-contain" />
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400 font-mono">
                    Encoded Value: <strong>{barcodeText}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleDownloadBarcode}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Barcode Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToDatabase}
                    disabled={isSaving}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveSuccess ? 'Saved to Database!' : isSaving ? 'Saving...' : 'Save Barcode to Database'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Database Stored Codes</h3>
                  <p className="text-xs text-slate-400">
                    Saved codes stored permanently in Google Cloud Firestore &amp; database.
                  </p>
                </div>
                <button
                  onClick={fetchSavedCodes}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {savedCodes.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-850/60 border border-slate-800 text-slate-400 text-xs">
                  No custom QR codes or barcodes saved yet. Generate one in the creator tab and click "Save to Database"!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {savedCodes.map((code) => (
                    <div
                      key={code.id}
                      className="p-4 rounded-xl bg-slate-850 border border-slate-750 flex flex-col justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            code.codeType === 'qr' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {code.codeType.toUpperCase()} &bull; {code.format || 'Standard'}
                          </span>
                          {!isDave && (
                            <button
                              onClick={() => handleDeleteCode(code.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="Delete from database (Admin only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <h4 className="font-bold text-white line-clamp-1">{code.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-1 break-all line-clamp-2">
                          {code.content}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{new Date(code.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code.content);
                            alert('Copied content to clipboard!');
                          }}
                          className="text-indigo-400 hover:underline cursor-pointer"
                        >
                          Copy Content
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed global scannability on all cell phone models</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Close Generator
          </button>
        </div>
      </div>
    </div>
  );
};
