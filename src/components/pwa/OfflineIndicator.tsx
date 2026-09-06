import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Wifi, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface OfflineIndicatorProps {
  language?: 'km' | 'en';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language = 'km' }) => {
  const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        resetWasOffline();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, resetWasOffline]);

  // If back online notification is showing
  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-bold border border-emerald-500/50">
          <Wifi className="w-4 h-4 text-emerald-100" />
          <span>
            {language === 'km' 
              ? 'បានភ្ជាប់អ៊ីនធឺណិតឡើងវិញជោគជ័យ!' 
              : 'Back online! Connection restored.'}
          </span>
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  // If currently online, nothing to display
  if (isOnline) {
    return null;
  }

  // If minimized offline badge
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xl transition cursor-pointer"
        title="Offline Mode Active"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
        <WifiOff className="w-3.5 h-3.5" />
        <span>{language === 'km' ? 'Offline' : 'Offline'}</span>
      </button>
    );
  }

  // Full offline banner
  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="bg-amber-500 dark:bg-amber-600 text-white rounded-2xl p-3.5 shadow-2xl border border-amber-400/50 dark:border-amber-500/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>{language === 'km' ? 'ដំណើរការក្រៅបណ្ដាញ (Offline Mode)' : 'Offline Mode Active'}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
              <p className="text-[11px] text-amber-50 mt-0.5 leading-snug">
                {language === 'km'
                  ? 'គ្មានការតភ្ជាប់អ៊ីនធឺណិតទេ។ ទិន្នន័យទាំងអស់ (ពិន្ទុ, វត្តមាន) រក្សាទុកក្នុងម៉ាស៊ីនដោយសុវត្ថិភាព។'
                  : 'No internet connection. All data and scores are safely preserved locally.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer flex-shrink-0"
            title="Minimize"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-amber-100 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>{language === 'km' ? 'មុខងារគ្រប់គ្រងដំណើរការ ១០០%' : '100% Offline Functional'}</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white underline hover:no-underline cursor-pointer"
          >
            {language === 'km' ? 'បង្រួម' : 'Minimize'}
          </button>
        </div>
      </div>
    </div>
  );
};
