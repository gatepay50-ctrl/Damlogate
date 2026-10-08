import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  CheckCircle2, 
  Power, 
  MessageCircle 
} from 'lucide-react';
import { WhatsAppRobotStatus } from '../types';

interface WhatsAppRobotBadgeProps {
  onOpenDirectWhatsApp?: () => void;
}

export const WhatsAppRobotBadge: React.FC<WhatsAppRobotBadgeProps> = () => {
  const [status, setStatus] = useState<WhatsAppRobotStatus>({
    active: true,
    botName: 'Open-WA Background Auto-Robot',
    engine: 'Autonomous Headless WhatsApp Daemon',
    dispatchedCount: 18,
    targetPhones: [
      { name: 'David Nkwe', phone: '+27 76 977 5423' },
      { name: 'Katlego Mathunywa', phone: '+27 69 497 7018' },
    ],
  });
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.debug(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    try {
      const res = await fetch('/api/whatsapp/toggle', { method: 'POST' });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/whatsapp/test', { method: 'POST' });
      if (res.ok) {
        setFeedback('Test alert dispatched to David & Katlego via WhatsApp Robot!');
        fetchStatus();
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Robot Status */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${
              status.active 
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-2 ring-emerald-400/40' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              <Bot className="w-6 h-6" />
            </div>
            {status.active && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${status.active ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                WhatsApp Background Robot: {status.active ? 'ACTIVE & OPERATIONAL' : 'PAUSED'}
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                {status.dispatchedCount} Dispatched
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Autonomous background engine (Open-WA Architecture). Runs automatically in the background with zero technical setup — all new RSVPs instantly alert <strong>David Nkwe</strong> (+27 76 977 5423) and <strong>Katlego Mathunywa</strong> (+27 69 497 7018).
            </p>
            {feedback && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{feedback}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSendTest}
            disabled={isSendingTest || !status.active}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            title="Dispatch a test WhatsApp notification to David and Katlego"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? 'Sending...' : 'Test Robot Send'}</span>
          </button>
          <a
            href="https://wa.me/27769775423?text=Hi%20David%20and%20Katlego%2C%20I%20am%20confirming%20my%20Meeting%20RSVP."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="Open WhatsApp Chat directly"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Open WhatsApp</span>
          </a>
          <button
            onClick={handleToggle}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              status.active 
                ? 'bg-slate-800 text-slate-400 hover:text-white border-slate-700' 
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
            }`}
            title={status.active ? 'Pause Background Robot' : 'Activate Background Robot'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
