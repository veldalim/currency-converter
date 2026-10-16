import React from 'react';
import { AirAlert } from '../types/psi';
import { Bell, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AlertToastProps {
  toast: { title: string; body: string; type?: 'alert' | 'success' | 'info' } | null;
  onClose: () => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
          {toast.type === 'success' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-0.5">
            <Bell className="w-3 h-3 text-amber-400" />
            <span>{toast.title}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{toast.body}</p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
