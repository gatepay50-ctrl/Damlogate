import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle, 
  ExternalLink, 
  ShieldCheck
} from 'lucide-react';
import { NotificationRecord, MeetingConfig, RegistrationStats, Registration } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  stats: RegistrationStats;
  notifications: NotificationRecord[];
  registrations: Registration[];
  onTriggerDigest: () => Promise<void>;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  meeting,
  stats,
  notifications,
  registrations,
  onTriggerDigest,
}) => {
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [digestStatusMsg, setDigestStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendDigest = async () => {
    setIsSendingDigest(true);
    setDigestStatusMsg(null);
    try {
      await onTriggerDigest();
      setDigestStatusMsg('Live RSVP summary digest successfully dispatched to Dave & Kenny!');
      setTimeout(() => setDigestStatusMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setDigestStatusMsg('Error sending digest.');
    } finally {
      setIsSendingDigest(false);
    }
  };

  // Generate mailto link preloaded with Dave and Kenny, subject, and attendee breakdown
  const generateMailtoLink = () => {
    const recipients = meeting.notificationEmails.join(',');
    const subject = encodeURIComponent(`[RSVP Status Report] ${meeting.title} - ${stats.attending} Attending (${stats.total} Total)`);
    
    const attendingNames = registrations
      .filter(r => r.attendance !== 'declined')
      .map(r => `• ${r.fullName} (${r.organization || 'Attendee'}) - ${r.attendance === 'in_person' ? 'In-Person' : 'Virtual'}`)
      .join('\n');

    const declinedNames = registrations
      .filter(r => r.attendance === 'declined')
      .map(r => `• ${r.fullName} (${r.organization || 'Attendee'}) - Apologies`)
      .join('\n');

    const bodyText = `Hi Dave & Kenny,

Here is the current live RSVP report for: ${meeting.title}
Date & Time: ${meeting.date} at ${meeting.time}
Location: ${meeting.location}

=== SUMMARY COUNTS ===
Total Registered: ${stats.total}
Confirmed Attending: ${stats.attending} (In-Person: ${stats.inPerson}, Virtual: ${stats.virtual})
Cannot Attend (Apologies): ${stats.declined}
Attendance Rate: ${stats.attendanceRate}%

=== CONFIRMED ATTENDEES ===
${attendingNames || 'None recorded yet'}

=== APOLOGIES / CANNOT ATTEND ===
${declinedNames || 'None'}

Live Dashboard URL: ${window.location.origin}`;

    return `mailto:${recipients}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Email Notification Center</h2>
              <p className="text-xs text-slate-400">
                Automated RSVP alerts configured for Dave Nkwe &amp; Kenny Weeder
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Configured Recipients Banner */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Active Notification Recipients
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Auto-Alert Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {meeting.notificationEmails.map((email, idx) => (
                <div key={email} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{idx === 0 ? 'Dave Nkwe' : 'Kenny Weeder'}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{email}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Every time an attendee scans the desktop QR code and registers, an automated notification is instantly logged and routed to these addresses.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSendDigest}
              disabled={isSendingDigest}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingDigest ? 'Dispatching Summary...' : 'Send RSVP Digest to Dave & Kenny'}</span>
            </button>

            <a
              href={generateMailtoLink()}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Open in Email App (Draft Mail)</span>
            </a>
          </div>

          {digestStatusMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{digestStatusMsg}</span>
            </div>
          )}

          {/* Real-time Notification Logs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Notification Dispatch Log ({notifications.length})
              </h4>
              <span className="text-[11px] text-slate-500">Live Server Log</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-slate-800/40 text-xs text-slate-500">
                  No notifications recorded yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white line-clamp-1">
                        {notif.subject}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        {notif.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{notif.preview}</p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>To: {notif.recipients.join(', ')}</span>
                      <span>{new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
