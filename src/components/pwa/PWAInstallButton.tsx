import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  language?: 'km' | 'en';
  variant?: 'header' | 'banner' | 'menu';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language = 'km',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed as a standalone PWA
  if (isInstalled) {
    if (variant === 'menu') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{language === 'km' ? 'បានដំឡើងរួចរាល់ (PWA)' : 'App Installed'}</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {language === 'km' ? 'ដំឡើងកម្មវិធីលើឧបករណ៍របស់អ្នក (Offline PWA)' : 'Install App for Offline Use'}
              </h4>
              <p className="text-xs text-indigo-100">
                {language === 'km' 
                  ? 'អាចប្រើប្រាស់ក្រៅបណ្ដាញដោយគ្មានអ៊ីនធឺណិត និងបើកដំណើរការលឿនដូច Native App' 
                  : 'Work smoothly without internet connection and launch faster like a native app'}
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'km' ? 'ដំឡើងឥឡូវនេះ' : 'Install Now'}</span>
          </button>
        </div>
      );
    }

    if (variant === 'menu') {
      return (
        <button
          onClick={handleInstallClick}
          className="w-full text-left px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center space-x-2 cursor-pointer transition rounded-lg"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'km' ? 'ដំឡើងកម្មវិធី (PWA App)' : 'Install App (PWA)'}</span>
        </button>
      );
    }

    // Default: 'header' compact button
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-2xs hover:shadow-sm cursor-pointer whitespace-nowrap"
        title={language === 'km' ? 'ដំឡើងកម្មវិធីប្រើក្រៅបណ្ដាញ' : 'Install App for Offline Use'}
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span className="hidden sm:inline">
          {language === 'km' ? 'ដំឡើង App' : 'Install App'}
        </span>
      </button>
    );
  }

  // iOS Safari flow (WebKit does not support beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        {variant === 'menu' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center space-x-2 cursor-pointer transition rounded-lg"
          >
            <Smartphone className="w-4 h-4" />
            <span>{language === 'km' ? 'ដំឡើងលើ iPhone/iPad' : 'Install on iOS'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer whitespace-nowrap"
            title="Install on iOS"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">
              {language === 'km' ? 'ដំឡើង iOS' : 'Install on iOS'}
            </span>
          </button>
        )}

        {/* iOS Step-by-Step Guidance Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'km' ? 'ដំឡើងលើ iPhone / iPad' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'km' ? 'ប្រើប្រាស់ Safari ដើម្បីបន្ថែមលើ Home Screen' : 'Add to Home Screen via Safari'}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 my-5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {language === 'km' ? 'ចុចលើប៊ូតុង Share (ចែករំលែក)' : 'Tap the Share button'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Share className="w-3.5 h-3.5 text-indigo-600 inline" /> {language === 'km' ? 'នៅផ្នែកខាងក្រោមនៃ Safari' : 'At the bottom toolbar of Safari'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {language === 'km' ? 'ជ្រើសរើស "បន្ថែមទៅអេក្រង់ដើម"' : 'Select "Add to Home Screen"'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <PlusSquare className="w-3.5 h-3.5 text-indigo-600 inline" /> {language === 'km' ? 'រំកិលចុះក្រោមក្នុង Menu' : 'Scroll down in the action sheet'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {language === 'km' ? 'ចុចប៊ូតុង "បន្ថែម (Add)"' : 'Tap "Add" at the top right'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'km' ? 'កម្មវិធីនឹងបង្ហាញលើផ្ទាំងទូរស័ព្ទ អាចបើកប្រើប្រាស់ក្រៅបណ្ដាញបានភ្លាមៗ!' : 'The app icon appears on your home screen and works fully offline!'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {language === 'km' ? 'យល់ព្រម' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback if browser doesn't expose prompt yet, but user wants manual install guidance
  if (variant === 'menu') {
    return (
      <div className="px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
        <span>{language === 'km' ? 'គាំទ្រ Offline PWA ពេញលេញ' : 'Offline PWA Supported'}</span>
      </div>
    );
  }

  return null;
};
