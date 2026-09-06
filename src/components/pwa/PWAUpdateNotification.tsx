import React, { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { RefreshCw, CheckCircle2, DownloadCloud, X } from 'lucide-react';

interface PWAUpdateNotificationProps {
  language?: 'km' | 'en';
}

export const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({
  language = 'km',
}) => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFunction, setUpdateFunction] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    try {
      const update = registerSW({
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          setOfflineReady(true);
          // Auto-hide offline ready notification after 5 seconds
          setTimeout(() => setOfflineReady(false), 5000);
        },
      });
      setUpdateFunction(() => update);
    } catch (err) {
      console.warn('PWA service worker registration notice:', err);
    }
  }, []);

  const handleUpdate = () => {
    if (updateFunction) {
      updateFunction();
    } else {
      window.location.reload();
    }
  };

  // When app content has been cached and is ready to work offline
  if (offlineReady) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-900/95 text-white shadow-2xl border border-indigo-700/60 backdrop-blur-xs text-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">
              {language === 'km' ? 'កម្មវិធីត្រៀមរួចរាល់សម្រាប់ប្រើក្រៅបណ្ដាញ' : 'App Ready for Offline Use'}
            </p>
            <p className="text-[11px] text-indigo-200">
              {language === 'km' ? 'ទិន្នន័យនិងទំព័រត្រូវបានរក្សាទុកក្នុងម៉ាស៊ីនរួចរាល់' : 'All assets and pages cached for offline capability'}
            </p>
          </div>
          <button
            onClick={() => setOfflineReady(false)}
            className="p-1 hover:bg-white/10 rounded-lg text-indigo-300 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // When a new version is available
  if (needRefresh) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950 text-white shadow-2xl border border-indigo-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center flex-shrink-0">
              <DownloadCloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-xs">
                {language === 'km' ? 'មានកំណែអាប់ដេតថ្មី!' : 'New Version Available'}
              </p>
              <p className="text-[11px] text-indigo-200">
                {language === 'km' ? 'ចុច Refresh ដើម្បីទទួលបានកំណែចុងក្រោយ' : 'Click to refresh and get latest version'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'អាប់ដេត' : 'Update'}</span>
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-indigo-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
