import React from 'react';
import { Users, UserCheck, UserX, Video, Building2, TrendingUp, CheckSquare, Hash } from 'lucide-react';
import { RegistrationStats } from '../types';

interface StatsCardsProps {
  stats: RegistrationStats;
  hideDeclined?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, hideDeclined = false }) => {
  const totalVotersAnswered = (stats.registeredToVoteYes || 0) + (stats.registeredToVoteNo || 0);
  const totalWardsRecorded = Object.keys(stats.wardsCount || {}).length;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${hideDeclined ? 'lg:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-4 sm:gap-5`}>
      {/* 1. Total Registered Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Total Registered
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {stats.total}
          </span>
          <span className="text-xs text-slate-400">people RSVP'd</span>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Firebase Store
          </span>
          <span>100% synchronized</span>
        </div>
      </div>

      {/* 2. Will Attend Meeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 shadow-lg shadow-emerald-950/20 group hover:border-emerald-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Will Attend Meeting
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {stats.attending}
          </span>
          <span className="text-xs font-medium text-emerald-400">
            ({stats.attendanceRate}% of total)
          </span>
        </div>
        <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            {stats.inPerson} In-Person
          </span>
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            {stats.virtual} Virtual
          </span>
        </div>
      </div>

      {/* 3. Did you register to vote ! (Yes / No) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-5 shadow-lg shadow-cyan-950/20 group hover:border-cyan-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
            Did you register to vote !
          </span>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-cyan-300 tracking-tight">
              {stats.registeredToVoteYes ?? 0}
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase">Yes</span>
          </div>
          <span className="text-slate-500 font-light text-lg">/</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-300">
              {stats.registeredToVoteNo ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase">No</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-cyan-400 font-semibold">
            {stats.registeredToVoteRate ?? 0}% Registered Voters
          </span>
          <span className="text-slate-500">
            {totalVotersAnswered} responses
          </span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-cyan-900/40">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
              style={{ width: `${totalVotersAnswered > 0 ? ((stats.registeredToVoteYes || 0) / totalVotersAnswered) * 100 : 50}%` }}
              title={`Yes: ${stats.registeredToVoteYes}`}
            />
            <div 
              className="bg-slate-600 h-full transition-all duration-500"
              style={{ width: `${totalVotersAnswered > 0 ? ((stats.registeredToVoteNo || 0) / totalVotersAnswered) * 100 : 50}%` }}
              title={`No: ${stats.registeredToVoteNo}`}
            />
          </div>
        </div>
      </div>

      {/* 4. Ward Number Distribution */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 shadow-lg group hover:border-indigo-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-indigo-300 flex items-center gap-1.5">
            Ward Numbers
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Hash className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {totalWardsRecorded}
          </span>
          <span className="text-xs text-indigo-300">Wards Represented</span>
        </div>
        <div className="mt-4 pt-3 border-t border-indigo-900/40 flex items-center justify-between text-xs text-slate-300">
          <span>Active Wards:</span>
          <span className="font-mono text-cyan-300 font-bold truncate max-w-[120px]">
            {Object.keys(stats.wardsCount || {}).slice(0, 3).join(', ') || 'Ward 14, 08'}
          </span>
        </div>
      </div>

      {/* 5. Cannot Attend / Declined */}
      {!hideDeclined && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              Cannot Attend (Apologies)
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {stats.declined}
            </span>
            <span className="text-xs text-rose-400/80">not attending</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Minutes requested</span>
            <span className="text-slate-300 font-medium">Dave & Kenny Alerted</span>
          </div>
        </div>
      )}
    </div>
  );
};
