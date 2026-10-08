import React from 'react';
import { X, Smartphone, Wifi, Battery, Signal } from 'lucide-react';
import { MeetingConfig, Registration } from '../types';
import { RegistrationForm } from './RegistrationForm';

interface MobileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  onSubmitSuccess: (reg: Registration) => void;
}

export const MobileSimulatorModal: React.FC<MobileSimulatorModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSubmitSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center max-h-[95vh]">
        {/* Close Button on top */}
        <div className="w-full flex justify-between items-center mb-3 text-slate-300 px-2 max-w-sm">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Simulated Phone Scan Preview</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smartphone Hardware Frame */}
        <div className="w-[360px] sm:w-[390px] h-[720px] max-h-[85vh] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 relative flex flex-col overflow-hidden">
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          </div>

          {/* Status Bar */}
          <div className="h-6 w-full px-6 flex items-center justify-between text-[11px] text-slate-400 font-medium z-20 shrink-0 select-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Phone Screen Container */}
          <div className="flex-1 bg-slate-900 rounded-[36px] overflow-y-auto overflow-x-hidden relative text-white">
            <RegistrationForm
              meeting={meeting}
              onSubmitSuccess={(newReg) => {
                onSubmitSuccess(newReg);
              }}
              onBackToDashboard={onClose}
            />
          </div>

          {/* Home indicator bar at bottom */}
          <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto my-1.5 shrink-0" />
        </div>
      </div>
    </div>
  );
};
