import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  Share2
} from 'lucide-react';

interface SharedLinkBannerProps {
  sharedUrl: string;
  totalSaved: number;
  onOpenReporting: () => void;
}

export const SharedLinkBanner: React.FC<SharedLinkBannerProps> = ({
  sharedUrl,
  totalSaved,
  onOpenReporting,
}) => {
  const [copied, setCopied] = useState(false);
  const registrationLink = `${sharedUrl}?view=register`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Shared URL &bull; Globally Accessible (ais-pre)
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                Persistent Data Storage ({totalSaved} Saved)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Anyone with this link or scanning the desktop QR code can register from any device. Responses are permanently stored on server disk for reporting.
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 font-mono break-all">
              <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>{registrationLink}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Shared Link</span>
              </>
            )}
          </button>
          <a
            href={registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="Open registration page on shared link"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Link</span>
          </a>
          <button
            onClick={onOpenReporting}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Open Executive Reporting Suite"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
