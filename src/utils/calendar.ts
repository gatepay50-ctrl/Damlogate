import { MeetingConfig } from '../types';

export function downloadCalendarEvent(meeting: MeetingConfig) {
  const startDateStr = meeting.date.replace(/-/g, '') + 'T080000Z';
  const endDateStr = meeting.date.replace(/-/g, '') + 'T103000Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RSVP Meeting System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${meeting.description}\\nVirtual Link: ${meeting.meetingLink}`,
    `LOCATION:${meeting.location}`,
    `DTSTART:${startDateStr}`,
    `DTEND:${endDateStr}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
