import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  LogIn,
  LogOut,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { OrganizerUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: OrganizerUser) => void;
  currentUser?: OrganizerUser | null;
  onLogout?: () => void;
  isLandingPage?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout,
  isLandingPage = false,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<'dave' | 'katlego'>('dave');
  const [username, setUsername] = useState('DaveN');
  const [password, setPassword] = useState('Damlo@2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = (account: 'dave' | 'katlego') => {
    setSelectedAccount(account);
    if (account === 'dave') {
      setUsername('DaveN');
      setPassword('Damlo@2026');
    } else {
      setUsername('Kmat');
      setPassword('Data@1234');
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in, show profile card with Log-off button as requested
  if (currentUser) {
    const content = (
      <div className="w-full max-w-md bg-[#0e172a] border border-slate-800 rounded-[28px] shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5235e8] flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Organizer Profile &amp; Session</h2>
              <p className="text-xs text-slate-400">{currentUser.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile details */}
        <div className="p-4 rounded-2xl bg-[#131b2e] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white">{currentUser.fullName}</div>
              <div className="text-xs text-indigo-400 font-mono mt-0.5">User ID: {currentUser.username}</div>
              <div className="text-[11px] font-semibold mt-1">
                {currentUser.isAdmin ? (
                  <span className="text-emerald-400">System Administrator</span>
                ) : (
                  <span className="text-amber-400">Standard Member &bull; No Admin Privileges</span>
                )}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active Session
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Profile Actions: Replace Organizer Login with Log-off */}
        <div className="flex items-center gap-3 pt-2">
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs border border-rose-500 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Log-Off</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#5235e8] hover:bg-[#4327d8] text-white font-bold text-xs transition-colors cursor-pointer shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );

    if (isLandingPage) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          {content}
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  // Matching the organizer modal UI design
  const cardContent = (
    <div className="w-full max-w-[480px] bg-[#0c1322] border border-slate-800/90 rounded-[28px] shadow-2xl p-6 sm:p-7 space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#5235e8] flex items-center justify-center text-white shadow-lg shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Access Portal Login</h2>
            <p className="text-xs text-slate-400 mt-0.5">Admin: Katlego Mathunywa &bull; Member: David Nkwe</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Section 1: AUTHORIZED ACCOUNTS: */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          AUTHORIZED ACCOUNTS:
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: David Nkwe */}
          <button
            type="button"
            onClick={() => handleSelectAccount('dave')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedAccount === 'dave'
                ? 'border-[#5235e8] bg-[#16183a] shadow-md ring-1 ring-[#5235e8]/40'
                : 'border-slate-800 bg-[#0e1628] hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-sm text-white">David Nkwe</div>
            <div className="text-xs text-indigo-300 font-medium mt-0.5">User ID: DaveN</div>
            <div className="text-[10px] text-amber-400 font-semibold mt-0.5">Standard Member (No Admin)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">+27 76 977 5423</div>
          </button>

          {/* Card 2: Katlego Mathunywa */}
          <button
            type="button"
            onClick={() => handleSelectAccount('katlego')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedAccount === 'katlego'
                ? 'border-[#5235e8] bg-[#16183a] shadow-md ring-1 ring-[#5235e8]/40'
                : 'border-slate-800 bg-[#0e1628] hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-sm text-white">Katlego Mathunywa</div>
            <div className="text-xs text-indigo-300 font-medium mt-0.5">User ID: Kmat</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Administrator (Full Access)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">+27 69 497 7018</div>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 2: Form with USER ID / LOGIN ID and PASSWORD */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            USER ID / LOGIN ID
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="DaveN or Kmat"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-[#131b2e] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#5235e8] font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            PASSWORD
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-[#131b2e] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#5235e8] font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {selectedAccount === 'dave' ? 'Default: Damlo@2026' : 'Default: Data@1234'}
          </p>
        </div>

        {/* Big Purple Pill Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#5235e8] hover:bg-[#4327d8] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>
                {selectedAccount === 'dave' ? 'Sign In as DaveN (Standard Member)' : 'Sign In as KatlegoM (Administrator)'}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Footer text */}
      <p className="text-center text-xs text-slate-500 pt-1 leading-relaxed">
        Authentication portal &bull; Administrator: Katlego Mathunywa &bull; Member: David Nkwe
      </p>
    </div>
  );

  if (isLandingPage) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {cardContent}
    </div>
  );
};
