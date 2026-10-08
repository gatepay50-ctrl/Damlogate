export type AttendanceStatus = 'in_person' | 'virtual' | 'declined';
export type QrTargetMode = 'registration_hub' | 'google_form_direct' | 'portal_links' | 'custom_url' | 'whatsapp_direct';
export type QrTheme = 'executive_dark' | 'emerald_cyber' | 'gold_obsidian' | 'clean_white';

export interface QrCodeConfig {
  mode: QrTargetMode;
  qrTitle: string;
  qrSubtitle: string;
  badgeText: string;
  customUrl: string;
  googleFormsUrl: string;
  eotofUrl: string;
  damlogateUrl: string;
  whatsappNumber: string;
  whatsappPrefillMessage: string;
  showEotofLink: boolean;
  showDamlogateLink: boolean;
  showWhatsAppLink: boolean;
  additionalInfo: string;
  fgColor: string;
  bgColor: string;
  qrTheme: QrTheme;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  useSharedDomain?: boolean;
}

export interface MeetingConfig {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isVirtualAvailable: boolean;
  meetingLink: string;
  notificationEmails: string[];
  organizerNames: string[];
  googleFormsUrl?: string;
  eotofUrl: string;
  damlogateUrl: string;
  whatsappNumber: string;
  sharedAppUrl: string;
  qrConfig: QrCodeConfig;
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role?: string;
  attendance: AttendanceStatus;
  registeredToVote: 'Yes' | 'No';
  wardNumber?: string;
  dietary?: string;
  notes?: string;
  createdAt: string;
  source?: string;
}

export interface RegistrationStats {
  total: number;
  attending: number;
  inPerson: number;
  virtual: number;
  declined: number;
  attendanceRate: number;
  registeredToVoteYes: number;
  registeredToVoteNo: number;
  registeredToVoteRate: number;
  wardsCount?: Record<string, number>;
}

export interface GeneratedCode {
  id: string;
  codeType: 'qr' | 'barcode';
  title: string;
  content: string;
  format?: string;
  category: string;
  createdAt: string;
  createdBy?: string;
  fgColor?: string;
  bgColor?: string;
}

export interface NotificationRecord {
  id: string;
  recipients: string[];
  subject: string;
  preview: string;
  attendeeName: string;
  attendeeEmail: string;
  attendance: string;
  sentAt: string;
  status: 'sent' | 'delivered';
}

export interface OrganizerUser {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  avatarInitials: string;
  lastLogin?: string;
}

export interface WhatsAppRobotStatus {
  active: boolean;
  botName: string;
  engine: string;
  dispatchedCount: number;
  lastDispatchedAt?: string;
  targetPhones: { name: string; phone: string }[];
}
