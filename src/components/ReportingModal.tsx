import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Download, 
  Printer, 
  Building2, 
  Utensils, 
  ShieldCheck, 
  Check, 
  Copy, 
  Search 
} from 'lucide-react';
import { MeetingConfig, RegistrationStats, Registration, OrganizerUser } from '../types';

interface ReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  stats: RegistrationStats;
  registrations: Registration[];
  currentUser?: OrganizerUser | null;
}

export const ReportingModal: React.FC<ReportingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  stats,
  registrations,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  // Compute dietary breakdown
  const dietaryCounts: Record<string, number> = {};
  registrations.forEach((r) => {
    const d = r.dietary || 'None';
    dietaryCounts[d] = (dietaryCounts[d] || 0) + 1;
  });

  // Compute organization breakdown
  const orgCounts: Record<string, number> = {};
  registrations.forEach((r) => {
    const o = r.organization || 'Independent';
    orgCounts[o] = (orgCounts[o] || 0) + 1;
  });

  const handleCopyExecutiveSummary = () => {
    const text = `EXECUTIVE RSVP & ATTENDANCE REPORT
=================================================
Meeting: ${meeting.title}
Date & Time: ${meeting.date} at ${meeting.time}
Venue: ${meeting.location}
Lead Organizers: David Nkwe (+27 76 977 5423) & Katlego Mathunywa (+27 69 497 7018)
Report Generated: ${new Date().toLocaleString()}

KEY METRICS:
- Total Registered: ${stats.total}
- Confirmed Attending: ${stats.attending} (${stats.attendanceRate}%)
  * In-Person Seating: ${stats.inPerson}
  * Virtual Stream: ${stats.virtual}
- Cannot Attend / Apologies: ${stats.declined}
- Did you register to vote ! (Voting Registration Responses):
  * Registered to Vote (Yes): ${stats.registeredToVoteYes} (${stats.registeredToVoteRate}%)
  * Not Registered (No): ${stats.registeredToVoteNo}

CATERING & DIETARY REQUIREMENTS:
${Object.entries(dietaryCounts).map(([k, v]) => `  ${k}: ${v}`).join('\n')}

CONFIRMED ATTENDEES:
${registrations.filter(r => r.attendance !== 'declined').map(r => `  ${r.fullName} (${r.organization || 'Independent'}) - ${r.attendance === 'in_person' ? 'In-Person' : 'Virtual'}`).join('\n')}

APOLOGIES:
${registrations.filter(r => r.attendance === 'declined').map(r => `  ${r.fullName} (${r.organization || 'Independent'})`).join('\n')}

Portal Links: www.eotof.co.za | www.damlogate.co.za
Shared Application: ${meeting.sharedAppUrl || window.location.origin}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleOpenPrintable = () => {
    window.open('/api/reports/print-html', '_blank');
  };

  const handleDownloadCsv = () => {
    window.open('/api/export/csv', '_blank');
  };

  const filtered = registrations.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.organization && r.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Executive Attendance &amp; RSVP Reporting Suite
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  Data Stored &amp; Persistent
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved records accessible for David Nkwe, Katlego Mathunywa, and executive stakeholders.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Organizers & Persistent Storage Badge */}
          <div className="bg-slate-850 rounded-2xl p-4 border border-slate-755 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Authorized Meeting Custodians
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  <strong>David Nkwe</strong> (+27 76 977 5423 &bull; dave.nkwe@gmail.com) &amp; <strong>Katlego Mathunywa</strong> (+27 69 497 7018 &bull; Kenny.weeder71@gmail.com)
                </div>
              </div>
            </div>

            {/* Reporting Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyExecutiveSummary}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Copy formatted text report to clipboard"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedSummary ? 'Copied Summary' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleOpenPrintable}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                title="Open clean printable document for PDF saving"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF Report</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                title="Export complete attendee spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-755 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Registrations
              </span>
              <div className="text-3xl font-black text-white mt-1">{stats.total}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Stored in database</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-850 border border-emerald-500/30 text-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Confirmed Attending
              </span>
              <div className="text-3xl font-black text-emerald-300 mt-1">{stats.attending}</div>
              <div className="text-[11px] text-emerald-400/80 mt-0.5">{stats.attendanceRate}% Attendance Rate</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-850 border border-cyan-500/30 text-center">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                Did you register to vote !
              </span>
              <div className="text-2xl font-black text-cyan-300 mt-1">
                {stats.registeredToVoteYes} <span className="text-xs text-slate-400 font-normal">Yes</span> / {stats.registeredToVoteNo} <span className="text-xs text-slate-400 font-normal">No</span>
              </div>
              <div className="text-[11px] text-cyan-400/80 mt-0.5">{stats.registeredToVoteRate}% Confirmed Voters</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-755 text-center">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                In-Person Seating
              </span>
              <div className="text-3xl font-black text-blue-300 mt-1">{stats.inPerson}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Requires catering</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-755 text-center">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                Virtual Livestream
              </span>
              <div className="text-3xl font-black text-purple-300 mt-1">{stats.virtual}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Remote links sent</div>
            </div>
          </div>

          {/* Breakdown Section: Catering / Dietary & Organization Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Catering & Dietary */}
            <div className="p-5 rounded-2xl bg-slate-850 border border-slate-755 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  Catering &amp; Dietary Requirements
                </span>
                <span className="text-[11px] text-slate-400">{stats.inPerson} In-Person Attendees</span>
              </div>
              <div className="space-y-2">
                {Object.entries(dietaryCounts).map(([diet, count]) => (
                  <div key={diet} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-200">{diet}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold">
                      {count} {count === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizations Represented */}
            <div className="p-5 rounded-2xl bg-slate-850 border border-slate-755 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Organizations Represented ({Object.keys(orgCounts).length})
                </span>
                <span className="text-[11px] text-slate-400">Audience Split</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(orgCounts).map(([org, count]) => (
                  <div key={org} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-200 line-clamp-1">{org}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Saved Data Table */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-755 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Persistent Registrations Audit ({registrations.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Stored securely on server disk &bull; Accessible anywhere across sessions
                </p>
              </div>
              <div className="relative sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter report records..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-755 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Contact Email</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Attendance</th>
                    <th className="py-2.5 px-3">Did you register to vote !</th>
                    <th className="py-2.5 px-3">Dietary</th>
                    <th className="py-2.5 px-3">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-500">
                        No records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                        <td className="py-2 px-3 font-bold text-white">{r.fullName}</td>
                        <td className="py-2 px-3">{r.organization || 'Independent'}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{r.email}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{r.phone || 'N/A'}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.attendance === 'in_person'
                              ? 'bg-blue-500/20 text-blue-300'
                              : r.attendance === 'virtual'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {r.attendance === 'in_person' ? 'In-Person' : r.attendance === 'virtual' ? 'Virtual' : 'Apologies'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.registeredToVote === 'Yes'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}>
                            {r.registeredToVote === 'Yes' ? 'Yes (Registered)' : 'No'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{r.dietary || 'None'}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Audit Ready &bull; Portals: <a href="https://www.eotof.co.za" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">www.eotof.co.za</a> &bull; <a href="https://www.damlogate.co.za" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">www.damlogate.co.za</a>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
