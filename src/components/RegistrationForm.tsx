import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Mail, 
  User, 
  Phone, 
  Building, 
  Briefcase, 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Sparkles, 
  Download, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Vote,
  Hash
} from 'lucide-react';
import { MeetingConfig, AttendanceStatus, Registration } from '../types';
import { downloadCalendarEvent } from '../utils/calendar';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface RegistrationFormProps {
  meeting: MeetingConfig;
  onSubmitSuccess?: (newRegistration: Registration) => void;
  onBackToDashboard?: () => void;
  isStandalone?: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  meeting,
  onSubmitSuccess,
  onBackToDashboard,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [attendance, setAttendance] = useState<AttendanceStatus>('in_person');
  const [registeredToVote, setRegisteredToVote] = useState<'Yes' | 'No'>('Yes');
  const [wardNumber, setWardNumber] = useState('');
  const [dietary, setDietary] = useState('None');
  const [notes, setNotes] = useState('');
  const [formTheme, setFormTheme] = useState<'google_forms' | 'modern'>('google_forms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<Registration | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone or WhatsApp contact number.');
      return;
    }
    if (!wardNumber.trim()) {
      setErrorMsg('Please enter your Ward number (e.g. Ward 14 or 04).');
      return;
    }

    setIsSubmitting(true);
    const regId = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const regPayload: Registration = {
      id: regId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      organization: organization.trim() || 'Independent',
      role: role.trim(),
      attendance,
      registeredToVote,
      wardNumber: wardNumber.trim().startsWith('Ward') ? wardNumber.trim() : `Ward ${wardNumber.trim()}`,
      dietary: dietary.trim() || 'None',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      source: 'Damlogate QR Code Mobile Form',
    };

    try {
      // 1. Save directly to Firebase Firestore
      try {
        await setDoc(doc(db, 'registrations', regId), regPayload);
      } catch (firestoreErr) {
        console.warn('Direct Firestore write handled:', firestoreErr);
        handleFirestoreError(firestoreErr, OperationType.CREATE, `registrations/${regId}`);
      }

      // 2. Also sync to Express backend for disk persistence & notifications
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regPayload),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to submit registration');
      }

      const result = await response.json();
      setSubmittedData(result.registration || regPayload);

      // Trigger celebratory confetti
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(result.registration || regPayload);
      }
    } catch (err: any) {
      console.error('Registration submission error:', err);
      // If Firestore failed with security error, still show the user confirmation if saved locally or show friendly message
      if (err.message && err.message.includes('permission')) {
        setErrorMsg('Submission security check failed. Please verify required fields.');
      } else {
        setErrorMsg(err.message || 'Error recording RSVP. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setOrganization('');
    setRole('');
    setAttendance('in_person');
    setRegisteredToVote('Yes');
    setWardNumber('');
    setDietary('None');
    setNotes('');
    setSubmittedData(null);
    setErrorMsg(null);
  };

  // If already submitted, show instant confirmation screen
  if (submittedData) {
    const isAttending = submittedData.attendance === 'in_person' || submittedData.attendance === 'virtual';
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white text-center relative">
            <div className="inline-flex p-3 rounded-2xl bg-white/20 backdrop-blur-md mb-3 shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black">Registration Confirmed!</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Recorded in Google Cloud Firestore &amp; Damlogate Database.
            </p>
          </div>

          {/* Attendee Confirmation Pass */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Registered Attendee
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{submittedData.fullName}</h3>
                  <p className="text-xs text-slate-600">
                    {submittedData.organization || 'Independent'} {submittedData.role ? `• ${submittedData.role}` : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  submittedData.attendance === 'in_person' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : submittedData.attendance === 'virtual'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {submittedData.attendance === 'in_person' ? 'In-Person Attendee' : submittedData.attendance === 'virtual' ? 'Virtual Stream' : 'Apologies (Declined)'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span className="font-semibold block text-slate-400 text-[10px] uppercase">Email</span>
                  {submittedData.email}
                </div>
                <div>
                  <span className="font-semibold block text-slate-400 text-[10px] uppercase">Phone</span>
                  {submittedData.phone || 'N/A'}
                </div>
              </div>

              {/* Questionnaire Results: Voter Registration & Ward Number */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Voter Status</span>
                    <span className="text-xs font-bold text-slate-800">Did you register to vote:</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    submittedData.registeredToVote === 'Yes'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {submittedData.registeredToVote === 'Yes' ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Voter Ward</span>
                    <span className="text-xs font-bold text-slate-800">Ward Number:</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                    {submittedData.wardNumber || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Confirmation Box */}
            <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
              <Mail className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Host Notification Dispatched</p>
                <p className="text-indigo-700 mt-0.5">
                  Real-time alert routed to David Nkwe (<strong>dave.nkwe@gmail.com</strong>) and Katlego Mathunywa (<strong>Kenny.weeder71@gmail.com</strong>).
                </p>
              </div>
            </div>

            {/* Meeting Info Reminder */}
            {isAttending && (
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 text-sm mb-2">{meeting.title}</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{meeting.date} • {meeting.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{submittedData.attendance === 'in_person' ? meeting.location : meeting.meetingLink}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {isAttending && (
                <button
                  onClick={() => downloadCalendarEvent(meeting)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Add to Calendar (.ics)</span>
                </button>
              )}
              <button
                onClick={handleResetForm}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Register Another Attendee
              </button>
              {onBackToDashboard && (
                <button
                  onClick={onBackToDashboard}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 text-slate-500 hover:text-slate-800 font-medium text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Damlogate Dashboard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isGoogleFormsStyle = formTheme === 'google_forms';

  return (
    <div className={`max-w-2xl mx-auto px-4 py-6 sm:py-10 transition-colors ${
      isGoogleFormsStyle ? 'font-sans' : ''
    }`}>
      {/* Top bar controls */}
      <div className="flex items-center justify-between mb-4">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        )}

        {/* Style toggle */}
        <div className="flex items-center gap-2 text-xs text-slate-400 ml-auto">
          <span>Form View:</span>
          <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex">
            <button
              type="button"
              onClick={() => setFormTheme('google_forms')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                isGoogleFormsStyle ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Forms Style
            </button>
            <button
              type="button"
              onClick={() => setFormTheme('modern')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                !isGoogleFormsStyle ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sleek Modern
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl overflow-hidden shadow-2xl transition-all ${
        isGoogleFormsStyle 
          ? 'bg-[#f0ebf8] text-slate-900 border border-purple-200' 
          : 'bg-slate-900 text-white border border-slate-800'
      }`}>
        {/* Purple Accent Bar */}
        {isGoogleFormsStyle && (
          <div className="h-3.5 bg-[#673ab7] w-full" />
        )}

        {/* Title Header Card */}
        <div className={`p-6 sm:p-8 ${
          isGoogleFormsStyle 
            ? 'bg-white rounded-t-xl mx-3 mt-3 border border-slate-200 shadow-sm' 
            : 'border-b border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isGoogleFormsStyle 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              Damlogate RSVP &amp; Voter Questionnaire
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isGoogleFormsStyle ? 'text-slate-900' : 'text-white'
          }`}>
            {meeting.title}
          </h1>
          <p className={`mt-2 text-sm leading-relaxed ${
            isGoogleFormsStyle ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {meeting.description}
          </p>

          <div className={`mt-4 pt-4 flex flex-wrap gap-4 text-xs ${
            isGoogleFormsStyle ? 'border-t border-slate-100 text-slate-500' : 'border-t border-slate-800 text-slate-400'
          }`}>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              {meeting.date} • {meeting.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              {meeting.location}
            </span>
          </div>

          <div className={`mt-3 text-xs flex items-center justify-between flex-wrap gap-2 ${
            isGoogleFormsStyle ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <span className="text-red-500 font-bold">*</span>
              <span>Indicates required question</span>
            </div>
            {meeting.googleFormsUrl && (
              <a
                href={meeting.googleFormsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700 font-semibold"
              >
                <FileText className="w-3 h-3" />
                <span>Open in Google Forms</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Partner Portals Accessible From Any Cell Phone */}
        <div className={`mx-3 sm:mx-4 mt-3 p-4 rounded-xl border transition-all ${
          isGoogleFormsStyle 
            ? 'bg-purple-50/60 border-purple-200 text-purple-950' 
            : 'bg-slate-850/80 border-slate-755 text-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              Official Organization Portals
            </span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
              Cell Phone Verified
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a
              href={meeting.eotofUrl || 'https://www.eotof.co.za'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-900 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  EO
                </div>
                <div>
                  <div className="font-bold text-xs group-hover:text-blue-600 transition-colors">www.eotof.co.za</div>
                  <div className="text-[10px] text-slate-500">Official Portal &bull; EOTOF</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </a>

            <a
              href={meeting.damlogateUrl || 'https://www.damlogate.co.za'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-900 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  DL
                </div>
                <div>
                  <div className="font-bold text-xs group-hover:text-emerald-600 transition-colors">www.damlogate.co.za</div>
                  <div className="text-[10px] text-slate-500">Official Portal &bull; Damlogate</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
            </a>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 mx-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Full Name */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm focus-within:border-purple-600' 
              : 'bg-slate-850 border border-slate-800 focus-within:border-indigo-500'
          }`}>
            <label className="block text-sm font-semibold mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <p className={`text-xs mb-3 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
              First and last name for attendance registration
            </p>
            <div className="relative">
              <User className={`absolute left-3 top-2.5 w-4 h-4 ${isGoogleFormsStyle ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sipho Ndlovu"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                  isGoogleFormsStyle
                    ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-purple-600 text-slate-900'
                    : 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white'
                }`}
              />
            </div>
          </div>

          {/* Section 2: Email Address */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm focus-within:border-purple-600' 
              : 'bg-slate-850 border border-slate-800 focus-within:border-indigo-500'
          }`}>
            <label className="block text-sm font-semibold mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <p className={`text-xs mb-3 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
              Confirmation &amp; meeting materials will be sent to this email
            </p>
            <div className="relative">
              <Mail className={`absolute left-3 top-2.5 w-4 h-4 ${isGoogleFormsStyle ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                  isGoogleFormsStyle
                    ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-purple-600 text-slate-900'
                    : 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white'
                }`}
              />
            </div>
          </div>

          {/* Section 3: Phone Number */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm focus-within:border-purple-600' 
              : 'bg-slate-850 border border-slate-800 focus-within:border-indigo-500'
          }`}>
            <label className="block text-sm font-semibold mb-1">
              Phone / WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <p className={`text-xs mb-3 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
              For meeting reminders and door check-in verification
            </p>
            <div className="relative">
              <Phone className={`absolute left-3 top-2.5 w-4 h-4 ${isGoogleFormsStyle ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 82 123 4567"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                  isGoogleFormsStyle
                    ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-purple-600 text-slate-900'
                    : 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white'
                }`}
              />
            </div>
          </div>

          {/* Section 4: Organization & Role */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm' 
              : 'bg-slate-850 border border-slate-800'
          }`}>
            <label className="block text-sm font-semibold mb-3">
              Organization &amp; Job Title
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Building className={`absolute left-3 top-2.5 w-4 h-4 ${isGoogleFormsStyle ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Company / Organization"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                    isGoogleFormsStyle
                      ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-purple-600 text-slate-900'
                      : 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white'
                  }`}
                />
              </div>
              <div className="relative">
                <Briefcase className={`absolute left-3 top-2.5 w-4 h-4 ${isGoogleFormsStyle ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Job Title / Role"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                    isGoogleFormsStyle
                      ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-purple-600 text-slate-900'
                      : 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Attendance Choice */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm focus-within:border-purple-600' 
              : 'bg-slate-850 border border-slate-800 focus-within:border-indigo-500'
          }`}>
            <label className="block text-sm font-semibold mb-1">
              Will you attend the meeting? <span className="text-red-500">*</span>
            </label>
            <p className={`text-xs mb-4 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
              Please indicate your confirmed attendance format.
            </p>

            <div className="space-y-2.5">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                attendance === 'in_person'
                  ? isGoogleFormsStyle 
                    ? 'bg-purple-50/70 border-purple-500 text-purple-950 font-medium' 
                    : 'bg-indigo-950/40 border-indigo-500 text-white font-medium'
                  : isGoogleFormsStyle 
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-800' 
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="attendance"
                  value="in_person"
                  checked={attendance === 'in_person'}
                  onChange={() => setAttendance('in_person')}
                  className="mt-0.5 text-purple-600"
                />
                <div>
                  <div className="text-sm font-bold">Yes, attending in person</div>
                  <div className={`text-xs ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
                    At {meeting.location}
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                attendance === 'virtual'
                  ? isGoogleFormsStyle 
                    ? 'bg-purple-50/70 border-purple-500 text-purple-950 font-medium' 
                    : 'bg-indigo-950/40 border-indigo-500 text-white font-medium'
                  : isGoogleFormsStyle 
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-800' 
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="attendance"
                  value="virtual"
                  checked={attendance === 'virtual'}
                  onChange={() => setAttendance('virtual')}
                  className="mt-0.5 text-purple-600"
                />
                <div>
                  <div className="text-sm font-bold">Yes, attending virtually / online</div>
                  <div className={`text-xs ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
                    Joining via Google Meet livestream
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                attendance === 'declined'
                  ? isGoogleFormsStyle 
                    ? 'bg-rose-50 border-rose-400 text-rose-950 font-medium' 
                    : 'bg-rose-950/40 border-rose-500 text-white font-medium'
                  : isGoogleFormsStyle 
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-800' 
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="attendance"
                  value="declined"
                  checked={attendance === 'declined'}
                  onChange={() => setAttendance('declined')}
                  className="mt-0.5 text-rose-600"
                />
                <div>
                  <div className="text-sm font-bold">No, cannot attend (Sending apologies)</div>
                  <div className={`text-xs ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
                    Meeting minutes will be emailed
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 6: Questionnaire - Did you register to vote (Yes / No) */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm focus-within:border-purple-600' 
              : 'bg-slate-850 border border-slate-800 focus-within:border-indigo-500'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold flex items-center gap-1.5">
                <Vote className="w-4 h-4 text-purple-600" />
                <span>Did you register to vote !</span>
                <span className="text-red-500">*</span>
              </label>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isGoogleFormsStyle 
                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                Official Questionnaire
              </span>
            </div>
            <p className={`text-xs mb-3.5 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
              Please confirm whether you are registered to vote (Yes / No)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                registeredToVote === 'Yes'
                  ? isGoogleFormsStyle
                    ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-medium shadow-sm'
                    : 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-white font-medium shadow-sm'
                  : isGoogleFormsStyle
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="registeredToVote"
                  value="Yes"
                  checked={registeredToVote === 'Yes'}
                  onChange={() => setRegisteredToVote('Yes')}
                  className="mt-0.5 text-purple-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Yes</span>
                    {registeredToVote === 'Yes' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                        Registered
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
                    Yes, I am registered to vote
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                registeredToVote === 'No'
                  ? isGoogleFormsStyle
                    ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/20 text-rose-950 font-medium shadow-sm'
                    : 'bg-slate-800/90 border-slate-600 ring-2 ring-slate-600/30 text-white font-medium shadow-sm'
                  : isGoogleFormsStyle
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="registeredToVote"
                  value="No"
                  checked={registeredToVote === 'No'}
                  onChange={() => setRegisteredToVote('No')}
                  className="mt-0.5 text-rose-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">No</span>
                    {registeredToVote === 'No' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold border border-slate-600">
                        Not Registered
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
                    No, I am not registered to vote
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 7: Ward Number */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm focus-within:border-purple-600' 
              : 'bg-slate-850 border border-slate-800 focus-within:border-indigo-500'
          }`}>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-purple-600" />
              <span>Ward number</span> <span className="text-red-500">*</span>
            </label>
            <p className={`text-xs mb-3 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
              Please enter your local municipal voting ward number (e.g. Ward 14, Ward 04, Ward 22)
            </p>
            <div className="relative">
              <input
                type="text"
                required
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                placeholder="e.g. Ward 14"
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none font-medium transition-all ${
                  isGoogleFormsStyle
                    ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-purple-600 text-slate-900'
                    : 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white'
                }`}
              />
            </div>
          </div>

          {/* Section 8: Dietary Preferences */}
          {attendance === 'in_person' && (
            <div className={`p-5 rounded-xl transition-all ${
              isGoogleFormsStyle 
                ? 'bg-white border border-slate-200 shadow-sm' 
                : 'bg-slate-850 border border-slate-800'
            }`}>
              <label className="block text-sm font-semibold mb-2">
                Dietary Preference (Catering requirement)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {['None', 'Vegetarian', 'Vegan', 'Halaal', 'Kosher', 'Gluten-Free'].map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      dietary === item
                        ? isGoogleFormsStyle 
                          ? 'bg-purple-100/60 border-purple-500 font-bold text-purple-900' 
                          : 'bg-indigo-900/40 border-indigo-500 font-bold text-white'
                        : isGoogleFormsStyle 
                          ? 'border-slate-200 hover:bg-slate-50 text-slate-700' 
                          : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dietary"
                      value={item}
                      checked={dietary === item}
                      onChange={() => setDietary(item)}
                      className="text-purple-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Section 9: Comments */}
          <div className={`p-5 rounded-xl transition-all ${
            isGoogleFormsStyle 
              ? 'bg-white border border-slate-200 shadow-sm' 
              : 'bg-slate-850 border border-slate-800'
          }`}>
            <label className="block text-sm font-semibold mb-1">
              Comments or Questions for Meeting Organizers
            </label>
            <p className={`text-xs mb-3 ${isGoogleFormsStyle ? 'text-slate-500' : 'text-slate-400'}`}>
              Any topics for David Nkwe or Katlego Mathunywa
            </p>
            <div className="relative">
              <MessageSquare className={`absolute left-3 top-3 w-4 h-4 ${isGoogleFormsStyle ? 'text-slate-400' : 'text-slate-500'}`} />
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or topics..."
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all resize-none ${
                  isGoogleFormsStyle
                    ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-purple-600 text-slate-900'
                    : 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white'
                }`}
              />
            </div>
          </div>

          {/* Form Footer with Submission */}
          <div className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isGoogleFormsStyle ? 'bg-transparent' : 'bg-slate-850/50 rounded-xl'
          }`}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isGoogleFormsStyle
                  ? 'bg-[#673ab7] hover:bg-[#5e35b1] text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Recording in Firebase...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Clear form
            </button>
          </div>
        </form>
      </div>

      {/* Trust Notice */}
      <div className="mt-4 text-center text-xs text-slate-400">
        Stored in Cloud Firestore &bull; Routed to <strong>dave.nkwe@gmail.com</strong> and <strong>Kenny.weeder71@gmail.com</strong>.
      </div>
    </div>
  );
};
