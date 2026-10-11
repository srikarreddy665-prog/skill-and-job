import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />,
          info: <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />,
          error: <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,
        }[toast.type];

        const bgBorder = {
          success: 'bg-white border-emerald-200 text-slate-800 shadow-lg shadow-emerald-500/5',
          info: 'bg-white border-blue-200 text-slate-800 shadow-lg shadow-blue-500/5',
          warning: 'bg-white border-amber-200 text-slate-800 shadow-lg shadow-amber-500/5',
          error: 'bg-white border-red-200 text-slate-800 shadow-lg shadow-red-500/5',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in ${bgBorder}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {toast.title}
                </p>
              )}
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
