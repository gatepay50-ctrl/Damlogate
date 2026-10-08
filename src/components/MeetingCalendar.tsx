import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Download, 
  ExternalLink,
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { MeetingConfig, Registration } from '../types';
import { downloadCalendarEvent } from '../utils/calendar';

interface MeetingCalendarProps {
  meeting: MeetingConfig;
  registrations: Registration[];
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  meeting,
  registrations,
}) => {
  // Parse meeting date (default 2026-10-15)
  const meetingDateObj = new Date(meeting.date || '2026-10-15');
  const [currentYear, setCurrentYear] = useState(meetingDateObj.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState(meetingDateObj.getMonth() || 9); // 0-indexed, 9 = October

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in current view month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(meeting.title);
    const details = encodeURIComponent(`${meeting.description}\n\nVirtual Link: ${meeting.meetingLink}\nHosts: David Nkwe & Katlego Mathunywa\nPortal: www.eotof.co.za | www.damlogate.co.za`);
    const location = encodeURIComponent(meeting.location);
    const dateFormatted = meeting.date.replace(/-/g, '');
    const dates = `${dateFormatted}T080000Z/${dateFormatted}T103000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  // Calculate days until meeting
  const today = new Date();
  const diffTime = meetingDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Event Calendar &amp; Schedule</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Synchronized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live calendar tracking for {meeting.title}
            </p>
          </div>
        </div>

        {/* Calendar Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Calendar</span>
          </a>
          <button
            onClick={() => downloadCalendarEvent(meeting)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Download .ICS for Apple Calendar & Outlook"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>.ICS File</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Grid (Left) & Event Details Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar View (7 cols) */}
        <div className="lg:col-span-7 bg-slate-850 rounded-2xl p-4 sm:p-5 border border-slate-750">
          {/* Month Selector Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <span>{monthNames[currentMonth]} {currentYear}</span>
              {currentMonth === meetingDateObj.getMonth() && currentYear === meetingDateObj.getFullYear() && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  Meeting Month
                </span>
              )}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
            {daysOfWeek.map(d => (
              <div key={d} className="py-1 text-[11px] uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Empty slots before month start */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-slate-900/30 border border-transparent" />
            ))}
            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isMeetingDay = 
                currentYear === meetingDateObj.getFullYear() &&
                currentMonth === meetingDateObj.getMonth() &&
                dayNum === meetingDateObj.getDate();

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                    isMeetingDay
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black shadow-lg shadow-indigo-950/50 border-indigo-400 ring-2 ring-indigo-400/50'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-xs ${isMeetingDay ? 'font-black scale-110' : ''}`}>
                    {dayNum}
                  </span>
                  {isMeetingDay && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200 mt-0.5">
                      Event
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-indigo-600 border border-indigo-400 inline-block" />
              Confirmed Meeting Date ({meeting.date})
            </span>
            <span>All times synchronized with CAT / UTC+2</span>
          </div>
        </div>

        {/* Scheduled Event Milestone Summary (5 cols) */}
        <div className="lg:col-span-5 bg-slate-850 rounded-2xl p-5 border border-slate-750 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Event Timeline Milestone
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
              {diffDays > 0 ? `In ${diffDays} Days` : 'Scheduled'}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white line-clamp-2">
              {meeting.title}
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {meeting.description}
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Date &amp; Time</span>
                <span className="text-slate-400">{meeting.date} &bull; {meeting.time}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Venue / Link</span>
                <span className="text-slate-400">{meeting.location}</span>
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline block text-[11px] mt-0.5 font-mono"
                  >
                    {meeting.meetingLink}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Organizers</span>
                <span className="text-slate-400">
                  David Nkwe (+27 76 977 5423) &bull; Katlego Mathunywa (+27 69 497 7018)
                </span>
              </div>
            </div>
          </div>

          {/* Quick RSVP Stats */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">RSVPs Registered:</span>
            <span className="font-bold text-white">{registrations.length} Attendees</span>
          </div>
        </div>
      </div>
    </div>
  );
};
