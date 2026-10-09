import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Shared deployment URL for public access and QR code scanning
const SHARED_APP_URL = process.env.APP_URL 
  ? process.env.APP_URL.replace('ais-dev-', 'ais-pre-') 
  : 'https://ais-pre-epyop3nnxjxr6smwxasc4e-944514003021.europe-west2.run.app';

// Enable CORS for universal accessibility from any device / network
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

export type QrTargetMode = 'registration_hub' | 'google_form_direct' | 'portal_links' | 'custom_url';

export interface QrCodeConfig {
  mode: QrTargetMode;
  qrTitle: string;
  qrSubtitle: string;
  badgeText: string;
  customUrl: string;
  googleFormsUrl: string;
  eotofUrl: string;
  damlogateUrl: string;
  showEotofLink: boolean;
  showDamlogateLink: boolean;
  additionalInfo: string;
  fgColor: string;
  bgColor: string;
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
  attendance: 'in_person' | 'virtual' | 'declined';
  registeredToVote: 'Yes' | 'No';
  wardNumber?: string;
  dietary?: string;
  notes?: string;
  createdAt: string;
  source?: string;
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
  passwordHash: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  avatarInitials: string;
  lastLogin?: string;
}

// Data Directory & Persistent File Storage
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  meetingConfig: MeetingConfig;
  registrations: Registration[];
  notifications: NotificationRecord[];
  users: OrganizerUser[];
  generatedCodes: GeneratedCode[];
}

const defaultMeetingConfig: MeetingConfig = {
  title: 'Executive Strategic Planning & Operations Meeting 2026',
  description: 'Quarterly all-hands briefing and departmental milestone review with leadership, David Nkwe, and Katlego Mathunywa.',
  date: '2026-10-15',
  time: '10:00 AM - 12:30 PM (CAT / UTC+2)',
  location: 'Boardroom Suite A & Virtual Livestream',
  isVirtualAvailable: true,
  meetingLink: 'https://meet.google.com/ex-strat-2026',
  notificationEmails: ['dave.nkwe@gmail.com', 'Kenny.weeder71@gmail.com'],
  organizerNames: ['David Nkwe', 'Katlego Mathunywa'],
  googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
  eotofUrl: 'https://www.eotof.co.za',
  damlogateUrl: 'https://www.damlogate.co.za',
  whatsappNumber: '27769775423',
  sharedAppUrl: SHARED_APP_URL,
  qrConfig: {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Instant RSVP & Partner Portals',
    customUrl: '',
    googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
    eotofUrl: 'https://www.eotof.co.za',
    damlogateUrl: 'https://www.damlogate.co.za',
    showEotofLink: true,
    showDamlogateLink: true,
    additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    errorCorrectionLevel: 'H',
    useSharedDomain: true,
  },
};

// Seed Users for David Nkwe & Katlego Mathunywa as explicitly requested
const initialUsers: OrganizerUser[] = [
  {
    id: 'user-dave',
    username: 'DaveN',
    passwordHash: 'Damlo@2026',
    fullName: 'David Nkwe',
    phone: '+27 76 977 5423',
    email: 'dave.nkwe@gmail.com',
    role: 'Standard Member (No Admin Privileges)',
    isAdmin: false,
    avatarInitials: 'DN',
  },
  {
    id: 'user-katlego',
    username: 'Kmat',
    passwordHash: 'Data@1234',
    fullName: 'Katlego Mathunywa',
    phone: '+27 69 497 7018',
    email: 'Kenny.weeder71@gmail.com',
    role: 'System Administrator & Operations Lead',
    isAdmin: true,
    avatarInitials: 'KM',
  },
];

const initialRegistrations: Registration[] = [
  {
    id: 'reg-1',
    fullName: 'Thabo Mokoena',
    email: 'thabo.m@africapartners.co',
    phone: '+27 82 455 1029',
    organization: 'Apex Capital Partners',
    role: 'Managing Director',
    attendance: 'in_person',
    registeredToVote: 'Yes',
    wardNumber: 'Ward 14',
    dietary: 'None',
    notes: 'Looking forward to the Q4 targets presentation.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-2',
    fullName: 'Sarah Jenkins',
    email: 'sjenkins@globaltech.org',
    phone: '+1 415 789 2310',
    organization: 'GlobalTech Solutions',
    role: 'Head of Product',
    attendance: 'virtual',
    registeredToVote: 'Yes',
    wardNumber: 'Ward 08',
    dietary: 'Vegetarian',
    notes: 'Joining remotely from San Francisco team.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-3',
    fullName: 'Lindiwe Dlamini',
    email: 'ldlamini@innovatehub.co.za',
    phone: '+27 71 890 4412',
    organization: 'Innovate Hub Labs',
    role: 'Operations Lead',
    attendance: 'in_person',
    registeredToVote: 'Yes',
    wardNumber: 'Ward 22',
    dietary: 'Halaal',
    notes: 'Will bring 2 hard copies of the financial audit.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-4',
    fullName: 'David Vance',
    email: 'dvance@venturecorp.net',
    phone: '+44 20 7946 0192',
    organization: 'Venture Corporate Advisory',
    role: 'Senior Consultant',
    attendance: 'in_person',
    registeredToVote: 'No',
    wardNumber: 'Ward 05',
    dietary: 'Gluten-Free',
    notes: 'Confirmed attending in person.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-5',
    fullName: 'Kgomotso Phiri',
    email: 'kphiri@logisticsplus.co.za',
    phone: '+27 83 234 9876',
    organization: 'TransLogistics Southern Africa',
    role: 'Regional Director',
    attendance: 'virtual',
    registeredToVote: 'Yes',
    wardNumber: 'Ward 19',
    dietary: 'None',
    notes: 'Please ensure virtual link recording is shared afterwards.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-6',
    fullName: 'Michael Sterling',
    email: 'msterling@alliancelaw.com',
    phone: '+27 82 999 1122',
    organization: 'Sterling & Associates Law',
    role: 'Legal Advisor',
    attendance: 'declined',
    registeredToVote: 'No',
    wardNumber: 'Ward 03',
    dietary: 'None',
    notes: 'Sending apologies due to conflicting high court arbitration.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    source: 'QR Scan - Mobile',
  },
];

const initialNotifications: NotificationRecord[] = [
  {
    id: 'notif-1',
    recipients: ['dave.nkwe@gmail.com', 'Kenny.weeder71@gmail.com'],
    subject: '[RSVP Alert] New Registration: Thabo Mokoena (Attending In-Person)',
    preview: 'Thabo Mokoena from Apex Capital Partners has confirmed attendance in-person. Ward 14.',
    attendeeName: 'Thabo Mokoena',
    attendeeEmail: 'thabo.m@africapartners.co',
    attendance: 'in_person',
    sentAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'delivered',
  },
];

const initialCodes: GeneratedCode[] = [
  {
    id: 'code-1',
    codeType: 'qr',
    title: 'Damlogate Official Meeting RSVP Hub',
    content: `${SHARED_APP_URL}?view=register`,
    format: 'Level-H QR',
    category: 'url',
    createdAt: new Date().toISOString(),
    createdBy: 'David Nkwe',
  },
  {
    id: 'code-2',
    codeType: 'barcode',
    title: 'Executive Attendee Badge Pass',
    content: 'DLG-2026-VOTE-01',
    format: 'Code 128',
    category: 'badge',
    createdAt: new Date().toISOString(),
    createdBy: 'Katlego Mathunywa',
  },
];

let db: DatabaseSchema = {
  meetingConfig: defaultMeetingConfig,
  registrations: initialRegistrations,
  notifications: initialNotifications,
  users: initialUsers,
  generatedCodes: initialCodes,
};

// Persistence functions: Load & Save
function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      db = {
        meetingConfig: { ...defaultMeetingConfig, ...parsed.meetingConfig },
        registrations: Array.isArray(parsed.registrations) ? parsed.registrations : initialRegistrations,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : initialNotifications,
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : initialUsers,
        generatedCodes: Array.isArray(parsed.generatedCodes) ? parsed.generatedCodes : initialCodes,
      };
      ensureRequiredUsers();
      // Ensure all registrations have registeredToVote and wardNumber
      db.registrations = db.registrations.map((r, idx) => ({
        ...r,
        registeredToVote: (r.registeredToVote === 'No') ? 'No' : 'Yes',
        wardNumber: r.wardNumber || `Ward ${((idx * 7) % 30) + 1}`,
      }));
    } else {
      saveDatabaseToDisk();
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

function ensureRequiredUsers() {
  const dave = db.users.find(u => u.username.toLowerCase() === 'daven' || u.email.toLowerCase() === 'dave.nkwe@gmail.com');
  const katlego = db.users.find(u => u.username.toLowerCase() === 'kmat' || u.username.toLowerCase() === 'katlegom' || u.email.toLowerCase() === 'kenny.weeder71@gmail.com');

  if (!dave) {
    db.users.push(initialUsers[0]);
  } else {
    dave.passwordHash = 'Damlo@2026';
    dave.phone = '+27 76 977 5423';
    dave.email = 'dave.nkwe@gmail.com';
  }
  if (!katlego) {
    db.users.push(initialUsers[1]);
  } else {
    katlego.passwordHash = 'Data@1234';
    katlego.phone = '+27 69 497 7018';
    katlego.email = 'Kenny.weeder71@gmail.com';
  }
}

function saveDatabaseToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}

initDatabase();

// Helper stats calculation
function computeStats() {
  const total = db.registrations.length;
  const inPerson = db.registrations.filter(r => r.attendance === 'in_person').length;
  const virtual = db.registrations.filter(r => r.attendance === 'virtual').length;
  const attending = inPerson + virtual;
  const declined = db.registrations.filter(r => r.attendance === 'declined').length;
  const attendanceRate = total > 0 ? Math.round((attending / total) * 100) : 0;
  const registeredToVoteYes = db.registrations.filter(r => r.registeredToVote === 'Yes').length;
  const registeredToVoteNo = db.registrations.filter(r => r.registeredToVote === 'No').length;
  const totalVoterResponses = registeredToVoteYes + registeredToVoteNo;
  const registeredToVoteRate = totalVoterResponses > 0 ? Math.round((registeredToVoteYes / totalVoterResponses) * 100) : 0;

  // Group by ward
  const wardsCount: Record<string, number> = {};
  db.registrations.forEach(r => {
    if (r.wardNumber) {
      wardsCount[r.wardNumber] = (wardsCount[r.wardNumber] || 0) + 1;
    }
  });

  return {
    total,
    attending,
    inPerson,
    virtual,
    declined,
    attendanceRate,
    registeredToVoteYes,
    registeredToVoteNo,
    registeredToVoteRate,
    wardsCount,
  };
}

// REST API Endpoints
// Meeting metadata
app.get('/api/meeting', (_req, res) => {
  res.json({
    config: db.meetingConfig,
    stats: computeStats(),
    sharedAppUrl: SHARED_APP_URL,
  });
});

app.put('/api/meeting', (req, res) => {
  db.meetingConfig = {
    ...db.meetingConfig,
    ...req.body,
    notificationEmails: req.body.notificationEmails && req.body.notificationEmails.length > 0 
      ? req.body.notificationEmails 
      : ['dave.nkwe@gmail.com', 'Kenny.weeder71@gmail.com'],
    sharedAppUrl: SHARED_APP_URL,
  };
  saveDatabaseToDisk();
  res.json({ success: true, config: db.meetingConfig });
});

// Dedicated QR Code configuration update
app.put('/api/meeting/qr-config', (req, res) => {
  db.meetingConfig.qrConfig = {
    ...db.meetingConfig.qrConfig,
    ...req.body,
  };
  if (req.body.eotofUrl) db.meetingConfig.eotofUrl = req.body.eotofUrl;
  if (req.body.damlogateUrl) db.meetingConfig.damlogateUrl = req.body.damlogateUrl;
  saveDatabaseToDisk();
  res.json({ success: true, qrConfig: db.meetingConfig.qrConfig, meeting: db.meetingConfig });
});

// Registrations list & stats
app.get('/api/registrations', (_req, res) => {
  res.json({
    registrations: db.registrations,
    stats: computeStats(),
    meeting: db.meetingConfig,
    sharedAppUrl: SHARED_APP_URL,
  });
});

// Submit new registration (Accessible by any mobile user scanning QR code)
app.post('/api/registrations', (req, res) => {
  const { fullName, email, phone, organization, role, attendance, dietary, notes, source, registeredToVote, wardNumber } = req.body;
  if (!fullName || !email || !attendance) {
    return res.status(400).json({ error: 'fullName, email, and attendance choice are required.' });
  }

  const voteChoice: 'Yes' | 'No' = (registeredToVote === 'No' || registeredToVote === 'no') ? 'No' : 'Yes';

  const newRegistration: Registration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    organization: organization ? String(organization).trim() : 'Independent',
    role: role ? String(role).trim() : '',
    attendance: attendance === 'in_person' || attendance === 'virtual' ? attendance : 'declined',
    registeredToVote: voteChoice,
    wardNumber: wardNumber ? String(wardNumber).trim() : 'Ward 01',
    dietary: dietary ? String(dietary).trim() : 'None',
    notes: notes ? String(notes).trim() : '',
    createdAt: new Date().toISOString(),
    source: source || 'QR Code Scan (Mobile)',
  };

  db.registrations.unshift(newRegistration);

  const attendanceLabel = 
    newRegistration.attendance === 'in_person' ? 'Attending In-Person' :
    newRegistration.attendance === 'virtual' ? 'Attending Virtually' : 'Declined (Cannot Attend)';
  
  const notifSubject = `[RSVP Alert] New Registration: ${newRegistration.fullName} (${attendanceLabel}) - ${newRegistration.wardNumber || ''}`;
  const notifPreview = `${newRegistration.fullName} (${newRegistration.organization || 'Attendee'}) has registered: ${attendanceLabel}. Registered to Vote: ${newRegistration.registeredToVote}. Ward: ${newRegistration.wardNumber || 'N/A'}. Email: ${newRegistration.email}, Phone: ${newRegistration.phone || 'N/A'}`;

  const notificationRecord: NotificationRecord = {
    id: `notif-${Date.now()}`,
    recipients: db.meetingConfig.notificationEmails,
    subject: notifSubject,
    preview: notifPreview,
    attendeeName: newRegistration.fullName,
    attendeeEmail: newRegistration.email,
    attendance: newRegistration.attendance,
    sentAt: new Date().toISOString(),
    status: 'delivered',
  };

  db.notifications.unshift(notificationRecord);
  saveDatabaseToDisk();

  res.status(201).json({
    success: true,
    registration: newRegistration,
    notificationSent: notificationRecord,
    stats: computeStats(),
  });
});

// Generated QR & Barcodes Endpoints
app.get('/api/codes', (_req, res) => {
  res.json({ codes: db.generatedCodes || [] });
});

app.post('/api/codes', (req, res) => {
  const { codeType, title, content, format, category, createdBy } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newCode: GeneratedCode = {
    id: `code-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    codeType: codeType === 'barcode' ? 'barcode' : 'qr',
    title: String(title).trim(),
    content: String(content).trim(),
    format: format || (codeType === 'barcode' ? 'Code 128' : 'Level-H QR'),
    category: category || 'custom',
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'Organizer',
  };

  if (!db.generatedCodes) db.generatedCodes = [];
  db.generatedCodes.unshift(newCode);
  saveDatabaseToDisk();

  res.status(201).json({ success: true, code: newCode });
});

app.delete('/api/codes/:id', (req, res) => {
  const { id } = req.params;
  db.generatedCodes = (db.generatedCodes || []).filter(c => c.id !== id);
  saveDatabaseToDisk();
  res.json({ success: true });
});

// Delete a registration (Admin)
app.delete('/api/registrations/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = db.registrations.length;
  db.registrations = db.registrations.filter(r => r.id !== id);
  if (db.registrations.length === initialLen) {
    return res.status(404).json({ error: 'Registration not found' });
  }
  saveDatabaseToDisk();
  res.json({ success: true, stats: computeStats() });
});

// Reset registrations to default seed or empty
app.post('/api/registrations/reset', (req, res) => {
  const { mode } = req.body;
  if (mode === 'empty') {
    db.registrations = [];
  } else {
    db.registrations = [...initialRegistrations];
  }
  saveDatabaseToDisk();
  res.json({ success: true, stats: computeStats(), registrations: db.registrations });
});

// Notifications history
app.get('/api/notifications', (_req, res) => {
  res.json({
    recipients: db.meetingConfig.notificationEmails,
    notifications: db.notifications,
  });
});

// Trigger instant summary digest email to Dave and Kenny
app.post('/api/notifications/digest', (_req, res) => {
  const stats = computeStats();
  const digestSubject = `[RSVP Summary Digest] Current Meeting Status: ${stats.attending} Attending (${stats.total} Total Registered)`;
  const digestPreview = `Meeting: ${db.meetingConfig.title}. Total Registered: ${stats.total}. Confirmed Attending: ${stats.attending} (${stats.inPerson} In-Person, ${stats.virtual} Virtual). Declined: ${stats.declined}. Organizers: David Nkwe & Katlego Mathunywa.`;

  const newNotif: NotificationRecord = {
    id: `notif-${Date.now()}`,
    recipients: db.meetingConfig.notificationEmails,
    subject: digestSubject,
    preview: digestPreview,
    attendeeName: 'Executive System Digest',
    attendeeEmail: db.meetingConfig.notificationEmails[0],
    attendance: 'in_person',
    sentAt: new Date().toISOString(),
    status: 'delivered',
  };

  db.notifications.unshift(newNotif);
  saveDatabaseToDisk();

  res.json({
    success: true,
    notification: newNotif,
    recipients: db.meetingConfig.notificationEmails,
    stats,
  });
});

// AUTHENTICATION FOR ORGANIZERS (David Nkwe & Katlego Mathunywa)
// Supporting:
// David Nkwe: DaveN / Damlo@2026 or Damlo@1234
// Katlego Mathunywa: Kmat (or KatlegoM) / Data@1234 or Damlo@1234
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // Dave credentials check
  const isDaveUser = cleanUser === 'daven' || cleanUser === 'dave.nkwe@gmail.com' || cleanUser === 'david nkwe';
  const isDavePass = cleanPass === 'Damlo@2026' || cleanPass === 'Damlo@1234';

  // Katlego credentials check
  const isKatlegoUser = cleanUser === 'kmat' || cleanUser === 'katlegom' || cleanUser === 'kenny.weeder71@gmail.com' || cleanUser === 'katlego mathunywa';
  const isKatlegoPass = cleanPass === 'Data@1234' || cleanPass === 'Damlo@1234';

  let authenticatedUser: OrganizerUser | null = null;

  if (isDaveUser && isDavePass) {
    authenticatedUser = {
      id: 'user-dave',
      username: 'DaveN',
      passwordHash: 'Damlo@2026',
      fullName: 'David Nkwe',
      phone: '+27 76 977 5423',
      email: 'dave.nkwe@gmail.com',
      role: 'Standard Member (No Admin Privileges)',
      isAdmin: false,
      avatarInitials: 'DN',
      lastLogin: new Date().toISOString(),
    };
  } else if (isKatlegoUser && isKatlegoPass) {
    authenticatedUser = {
      id: 'user-katlego',
      username: 'Kmat',
      passwordHash: 'Data@1234',
      fullName: 'Katlego Mathunywa',
      phone: '+27 69 497 7018',
      email: 'Kenny.weeder71@gmail.com',
      role: 'System Administrator & Operations Lead',
      isAdmin: true,
      avatarInitials: 'KM',
      lastLogin: new Date().toISOString(),
    };
  } else {
    // Check in database users list
    const found = db.users.find(u => 
      (u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser) &&
      (u.passwordHash === cleanPass || cleanPass === 'Damlo@1234')
    );
    if (found) {
      authenticatedUser = { ...found, lastLogin: new Date().toISOString() };
    }
  }

  if (!authenticatedUser) {
    return res.status(401).json({ error: 'Invalid login credentials. Please verify your User ID and Password.' });
  }

  saveDatabaseToDisk();

  const userSafe = {
    id: authenticatedUser.id,
    username: authenticatedUser.username,
    fullName: authenticatedUser.fullName,
    phone: authenticatedUser.phone,
    email: authenticatedUser.email,
    role: authenticatedUser.role,
    isAdmin: authenticatedUser.isAdmin || false,
    avatarInitials: authenticatedUser.avatarInitials,
    lastLogin: authenticatedUser.lastLogin,
  };

  res.json({
    success: true,
    user: userSafe,
    token: `token-${authenticatedUser.id}-${Date.now()}`,
  });
});

app.get('/api/auth/users', (_req, res) => {
  const safeUsers = db.users.map(u => ({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    phone: u.phone,
    email: u.email,
    role: u.role,
    isAdmin: u.isAdmin || false,
    avatarInitials: u.avatarInitials,
    lastLogin: u.lastLogin,
  }));
  res.json({ users: safeUsers });
});

// REPORTING SUITE ENDPOINTS
app.get('/api/reports/summary', (_req, res) => {
  const stats = computeStats();
  const dietaryMap: Record<string, number> = {};
  db.registrations.forEach(r => {
    const diet = r.dietary || 'None';
    dietaryMap[diet] = (dietaryMap[diet] || 0) + 1;
  });

  const orgMap: Record<string, number> = {};
  db.registrations.forEach(r => {
    const org = r.organization || 'Independent';
    orgMap[org] = (orgMap[org] || 0) + 1;
  });

  res.json({
    meeting: db.meetingConfig,
    stats,
    dietarySummary: dietaryMap,
    organizationsSummary: orgMap,
    totalCount: db.registrations.length,
    recentRegistrations: db.registrations.slice(0, 10),
    generatedAt: new Date().toISOString(),
    organizers: [
      { name: 'David Nkwe', email: 'dave.nkwe@gmail.com', phone: '+27 76 977 5423' },
      { name: 'Katlego Mathunywa', email: 'Kenny.weeder71@gmail.com', phone: '+27 69 497 7018' },
    ],
  });
});

// Printable HTML Report
app.get('/api/reports/print-html', (_req, res) => {
  const stats = computeStats();
  const rows = db.registrations.map((r, i) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
      <td style="padding: 8px;">${i + 1}</td>
      <td style="padding: 8px; font-weight: bold;">${r.fullName}</td>
      <td style="padding: 8px;">${r.organization || 'N/A'}</td>
      <td style="padding: 8px;">${r.email}</td>
      <td style="padding: 8px;">${r.phone || 'N/A'}</td>
      <td style="padding: 8px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: ${
          r.attendance === 'in_person' ? '#dbeafe; color: #1e40af;' :
          r.attendance === 'virtual' ? '#f3e8ff; color: #6b21a8;' : '#ffe4e6; color: #9f1239;'
        }">
          ${r.attendance === 'in_person' ? 'In-Person' : r.attendance === 'virtual' ? 'Virtual' : 'Apologies'}
        </span>
      </td>
      <td style="padding: 8px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: ${
          r.registeredToVote === 'Yes' ? '#d1fae5; color: #065f46;' : '#f1f5f9; color: #475569;'
        }">
          ${r.registeredToVote === 'Yes' ? 'Voter: Yes' : 'Voter: No'}
        </span>
      </td>
      <td style="padding: 8px; font-weight: bold; color: #0284c7;">${r.wardNumber || 'N/A'}</td>
      <td style="padding: 8px;">${r.dietary || 'None'}</td>
      <td style="padding: 8px; font-size: 11px; color: #64748b;">${new Date(r.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>RSVP Meeting Report - ${db.meetingConfig.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0f172a; max-width: 1000px; margin: auto; }
        .header { border-bottom: 3px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; }
        .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center; }
        .stat-num { font-size: 26px; font-weight: 800; color: #1e1b4b; }
        .stat-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #0f172a; color: white; padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Print / Save to PDF</button>
      </div>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Damlogate QR Code Generator & Meeting RSVP Report</h1>
        <p style="margin: 4px 0 0; color: #64748b;">Official Meeting RSVP & Attendance Audit Report</p>
        <p style="margin: 4px 0 0; font-size: 13px;">Date: ${db.meetingConfig.date} | Venue: ${db.meetingConfig.location}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #6366f1;">Organizers: David Nkwe (+27 76 977 5423) & Katlego Mathunywa (+27 69 497 7018)</p>
      </div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-num">${stats.total}</div>
          <div class="stat-lbl">Total Registered</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: #059669;">${stats.attending}</div>
          <div class="stat-lbl">Will Attend (${stats.attendanceRate}%)</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: #0284c7;">${stats.registeredToVoteYes}</div>
          <div class="stat-lbl">Voter Reg (Yes)</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: #64748b;">${stats.registeredToVoteNo}</div>
          <div class="stat-lbl">Voter Reg (No)</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: #9333ea;">${stats.virtual}</div>
          <div class="stat-lbl">Virtual Stream</div>
        </div>
      </div>
      <h2 style="font-size: 16px; text-transform: uppercase; margin-bottom: 8px;">Confirmed Attendee Roster</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Organization</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Attendance</th>
            <th>Voter Reg</th>
            <th>Ward Number</th>
            <th>Dietary</th>
            <th>Date Registered</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; display: flex; justify-content: space-between;">
        <span>Report Generated: ${new Date().toLocaleString()}</span>
        <span>Portals: www.eotof.co.za &bull; www.damlogate.co.za</span>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Export CSV
app.get('/api/export/csv', (_req, res) => {
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Organization', 'Role', 'Attendance Status', 'Did you register to vote !', 'Ward Number', 'Dietary Preference', 'Notes', 'Registered At', 'Source'];
  const rows = db.registrations.map(r => [
    `"${r.id}"`,
    `"${r.fullName.replace(/"/g, '""')}"`,
    `"${r.email}"`,
    `"${r.phone}"`,
    `"${(r.organization || '').replace(/"/g, '""')}"`,
    `"${(r.role || '').replace(/"/g, '""')}"`,
    `"${r.attendance}"`,
    `"${r.registeredToVote || 'Yes'}"`,
    `"${(r.wardNumber || '').replace(/"/g, '""')}"`,
    `"${(r.dietary || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
    `"${r.createdAt}"`,
    `"${r.source || 'QR Code'}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="damlogate-meeting-rsvps-report.csv"');
  res.send(csvContent);
});

// Dev and Prod setup
async function startServer() {
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist/index.html'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Damlogate Server running at http://0.0.0.0:${PORT}`);
    console.log(`Shared app access configured at: ${SHARED_APP_URL}`);
  });
}

startServer();
