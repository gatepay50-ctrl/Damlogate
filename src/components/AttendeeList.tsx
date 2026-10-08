import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  Clock, 
  CheckCircle2, 
  Video, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare,
  Hash
} from 'lucide-react';
import { Registration, AttendanceStatus } from '../types';

interface AttendeeListProps {
  registrations: Registration[];
  onDeleteAttendee: (id: string) => void;
  onRefreshData?: () => void;
}

export const AttendeeList: React.FC<AttendeeListProps> = ({
  registrations,
  onDeleteAttendee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const voteYesCount = registrations.filter(r => r.registeredToVote === 'Yes').length;
  const voteNoCount = registrations.filter(r => r.registeredToVote === 'No').length;

  const filteredList = registrations.filter((item) => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.organization && item.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.wardNumber && item.wardNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone && item.phone.includes(searchTerm));

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'attending') return item.attendance === 'in_person' || item.attendance === 'virtual';
    if (filterStatus === 'voter_yes') return item.registeredToVote === 'Yes';
    if (filterStatus === 'voter_no') return item.registeredToVote === 'No';
    return item.attendance === filterStatus;
  });

  const getAttendanceBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'in_person':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            In-Person
          </span>
        );
      case 'virtual':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            Virtual
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Declined
          </span>
        );
    }
  };

  const getVoterBadge = (voterStatus?: 'Yes' | 'No') => {
    if (voterStatus === 'No') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Voter: No
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckSquare className="w-3 h-3 text-emerald-400" />
        Voter: Yes
      </span>
    );
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">Live RSVP &amp; Voter Registrations</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
              {registrations.length} Total
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {voteYesCount} Registered Voters
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed stored in Firebase Firestore and synchronized across devices.
          </p>
        </div>

        {/* Search input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, ward, email, company..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        {[
          { key: 'all', label: `All (${registrations.length})` },
          { key: 'attending', label: `Attending (${registrations.filter(r => r.attendance !== 'declined').length})` },
          { key: 'in_person', label: `In-Person (${registrations.filter(r => r.attendance === 'in_person').length})` },
          { key: 'virtual', label: `Virtual (${registrations.filter(r => r.attendance === 'virtual').length})` },
          { key: 'voter_yes', label: `Voter: Yes (${voteYesCount})` },
          { key: 'voter_no', label: `Voter: No (${voteNoCount})` },
          { key: 'declined', label: `Declined (${registrations.filter(r => r.attendance === 'declined').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Registrations Roster Table / List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-850/50 border border-slate-800 text-slate-400 text-sm">
          <p className="font-medium text-slate-300">No registrations found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? 'Try adjusting your search query or filter.' : 'Scan the QR code to submit the first registration!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((attendee) => {
            const isExpanded = expandedId === attendee.id;
            return (
              <div
                key={attendee.id}
                className="rounded-xl bg-slate-850/80 border border-slate-800 hover:border-slate-700 p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Attendee primary info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-300 shrink-0">
                      {attendee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {attendee.fullName}
                        </span>
                        {getAttendanceBadge(attendee.attendance)}
                        {getVoterBadge(attendee.registeredToVote)}
                        {attendee.wardNumber && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            <Hash className="w-3 h-3 text-cyan-400" />
                            {attendee.wardNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {attendee.email}
                        </span>
                        {attendee.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {attendee.phone}
                          </span>
                        )}
                        {attendee.organization && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-500" />
                            {attendee.organization} {attendee.role ? `(${attendee.role})` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Timestamp & actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatTimestamp(attendee.createdAt)}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{attendee.source || 'QR Scan'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : attendee.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                        title="View attendee details & notes"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove ${attendee.fullName} from RSVP list?`)) {
                            onDeleteAttendee(attendee.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                        title="Remove attendee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg">
                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">Did you register to vote:</span>
                      <span className={`font-bold ${attendee.registeredToVote === 'Yes' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {attendee.registeredToVote === 'Yes' ? 'Yes (Confirmed Registered Voter)' : 'No (Not Registered)'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">Ward Number:</span>
                      <span className="text-cyan-300 font-bold font-mono">{attendee.wardNumber || 'Not specified'}</span>
                    </div>
                    {attendee.dietary && attendee.dietary !== 'None' && (
                      <div>
                        <span className="font-semibold text-slate-400 block mb-0.5">Dietary:</span>
                        <span className="text-amber-300 font-medium">{attendee.dietary}</span>
                      </div>
                    )}
                    {attendee.notes && (
                      <div className="sm:col-span-4">
                        <span className="font-semibold text-slate-400 block mb-0.5">Notes for Hosts:</span>
                        <p className="text-slate-300 italic">"{attendee.notes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
