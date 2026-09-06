import React from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGradebook();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full no-print">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
        };

        const bg = {
          success: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 shadow-lg',
          error: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/60 text-slate-800 dark:text-slate-100 shadow-lg',
          warning: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-100 shadow-lg',
          info: 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800/60 text-slate-800 dark:text-slate-100 shadow-lg',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border ${bg} text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-200`}
          >
            <div className="flex items-center space-x-2.5">
              {icons[toast.type]}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
