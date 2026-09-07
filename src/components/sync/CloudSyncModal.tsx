import React, { useState, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Cloud, 
  CloudRain, 
  RefreshCw, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone, 
  Laptop, 
  ExternalLink, 
  ShieldCheck, 
  ArrowDownCircle, 
  ArrowUpCircle,
  X,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { 
  getPairingUrl, 
  generateQrCodeDataUrl, 
  generateRandomSyncKey 
} from '../../utils/cloudSync';

export const CloudSyncModal: React.FC = () => {
  const { 
    language, 
    isSyncModalOpen, 
    setIsSyncModalOpen,
    syncKey,
    setSyncKey,
    syncStatus,
    syncNow,
    pullFromCloudNow,
    autoSyncEnabled,
    setAutoSyncEnabled,
    showToast
  } = useGradebook();

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [inputKey, setInputKey] = useState(syncKey);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const pairingUrl = typeof window !== 'undefined' ? getPairingUrl(syncKey) : '';

  useEffect(() => {
    setInputKey(syncKey);
    if (syncKey) {
      generateQrCodeDataUrl(pairingUrl).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [syncKey, pairingUrl]);

  if (!isSyncModalOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(syncKey);
    setCopiedKey(true);
    showToast(language === 'km' ? 'បានចម្លងកូដបន្សី!' : 'Sync key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopiedUrl(true);
    showToast(language === 'km' ? 'បានចម្លងតំណភ្ជាប់បន្សី!' : 'Pairing link copied!', 'success');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveCustomKey = () => {
    if (!inputKey.trim()) return;
    const clean = inputKey.trim().toUpperCase();
    setSyncKey(clean);
    setIsEditingKey(false);
    showToast(language === 'km' ? `បានប្តូរកូដបន្សីទៅ៖ ${clean}` : `Sync key updated to: ${clean}`, 'info');
  };

  const handleGenerateNewKey = () => {
    const newK = generateRandomSyncKey();
    setInputKey(newK);
    setSyncKey(newK);
    setIsEditingKey(false);
    showToast(language === 'km' ? `បានបង្កើតកូដបន្សីថ្មី៖ ${newK}` : `Generated new sync key: ${newK}`, 'info');
  };

  const handleManualPush = async () => {
    setIsActionLoading(true);
    try {
      await syncNow();
      showToast(language === 'km' ? 'បានបន្សីទិន្នន័យទៅ Cloud ជោគជ័យ!' : 'Pushed data to cloud successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'បរាជ័យក្នុងការបន្សីទិន្នន័យ', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleManualPull = async () => {
    setIsActionLoading(true);
    try {
      await pullFromCloudNow();
      showToast(language === 'km' ? 'បានទាញយកទិន្នន័យថ្មីពី Cloud ជោគជ័យ!' : 'Pulled latest data from cloud!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យ', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatLastSync = (ts: number | null) => {
    if (!ts) return language === 'km' ? 'មិនទាន់មាន' : 'Never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return language === 'km' ? 'ទើបតែបន្សីមុននេះ' : 'Just now';
    if (diff < 3600) return language === 'km' ? `${Math.floor(diff / 60)} នាទីមុន` : `${Math.floor(diff / 60)}m ago`;
    return new Date(ts).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 rounded-t-3xl relative flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-heading font-black tracking-tight">
                  {language === 'km' ? 'ប្រព័ន្ធបន្សីទិន្នន័យឆ្លងឧបករណ៍ (Cloud Sync)' : 'Cross-Device Cloud Sync'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Vercel Live
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {language === 'km' ? 'ប្រើប្រាស់ទិន្នន័យដូចគ្នារវាងកុំព្យូទ័រ ទូរស័ព្ទ និង Tablet' : 'Seamless real-time synchronization across phone, laptop & tablet'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">

          {/* Sync Status Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                syncStatus.state === 'synced' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                syncStatus.state === 'syncing' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}>
                <RefreshCw className={`w-5 h-5 ${syncStatus.state === 'syncing' || isActionLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {language === 'km' ? 'ស្ថានភាពបន្សីបច្ចុប្បន្ន' : 'CURRENT STATUS'}
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>
                    {syncStatus.state === 'synced' ? (language === 'km' ? 'បានបន្សីរួចរាល់ ១០០%' : 'Synchronized') :
                     syncStatus.state === 'syncing' || isActionLoading ? (language === 'km' ? 'កំពុងបន្សីទិន្នន័យ...' : 'Syncing...') :
                     (language === 'km' ? 'ទិន្នន័យក្នុងឧបករណ៍' : 'Local Only')}
                  </span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({formatLastSync(syncStatus.lastSyncedAt)})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleManualPush}
                disabled={isActionLoading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black shadow-xs transition cursor-pointer disabled:opacity-50"
                title={language === 'km' ? 'រុញទិន្នន័យបច្ចុប្បន្នទៅ Cloud' : 'Push local data to cloud'}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>{language === 'km' ? 'បន្សីទៅ Cloud' : 'Push to Cloud'}</span>
              </button>
              <button
                onClick={handleManualPull}
                disabled={isActionLoading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-black transition cursor-pointer disabled:opacity-50"
                title={language === 'km' ? 'ទាញយកទិន្នន័យថ្មីពី Cloud' : 'Pull latest data from cloud'}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>{language === 'km' ? 'ទាញយកពី Cloud' : 'Pull from Cloud'}</span>
              </button>
            </div>
          </div>

          {/* Sync Key (Pairing Code) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {language === 'km' ? 'កូដសម្ងាត់បន្សី (Sync Key)' : 'School Sync Key'}
                </span>
              </div>
              <button
                onClick={() => setIsEditingKey(!isEditingKey)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isEditingKey ? (language === 'km' ? 'បោះបង់' : 'Cancel') : (language === 'km' ? 'ប្តូរកូដ / បង្កើតថ្មី' : 'Change Key')}
              </button>
            </div>

            {isEditingKey ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                    placeholder="ឧទាហរណ៍៖ PRATONG-2025"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-indigo-400 font-mono font-black text-sm text-slate-900 dark:text-white bg-indigo-50/40 dark:bg-indigo-950/40 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSaveCustomKey}
                    className="px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs transition cursor-pointer"
                  >
                    {language === 'km' ? 'រក្សាទុក' : 'Save'}
                  </button>
                </div>
                <button
                  onClick={handleGenerateNewKey}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បង្កើតកូដសម្ងាត់ថ្មីដោយចៃដន្យ' : 'Generate random new sync key'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <span className="font-mono text-base font-black text-indigo-950 dark:text-indigo-200 tracking-wider">
                  {syncKey}
                </span>
                <button
                  onClick={handleCopyKey}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-900 dark:bg-indigo-600 hover:bg-indigo-950 text-white text-xs font-bold transition cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? (language === 'km' ? 'បានចម្លង' : 'Copied') : (language === 'km' ? 'ចម្លងកូដ' : 'Copy Key')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Instant QR Code Pairing for Phone */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/40 dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-800/60 rounded-2xl p-5 border border-indigo-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                {language === 'km' ? 'ស្កេនភ្ជាប់ទៅទូរស័ព្ទ / Tablet ភ្លាមៗ' : 'Scan to Connect Mobile Device'}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* QR Code Graphic */}
              <div className="w-40 h-40 bg-white p-2.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700/80 shadow-md shrink-0 flex items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Sync QR Code" className="w-full h-full object-contain" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                  <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    {language === 'km' 
                      ? '១. បើកកាមេរ៉ាទូរស័ព្ទរបស់អ្នក រួចចង្អុលមកកាន់ QR Code នេះ' 
                      : '1. Open phone camera and point at this QR Code'}
                  </span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                  <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {language === 'km' 
                      ? '២. ចុចលើតំណភ្ជាប់ដែលលោតឡើង នោះទូរស័ព្ទនឹងភ្ជាប់ និងផ្ទុកទិន្នន័យស្វ័យប្រវត្តិ' 
                      : '2. Tap the link to open and instantly sync all data on your phone'}
                  </span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                  <Laptop className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {language === 'km' 
                      ? '៣. រាល់ការកែប្រែលើឧបករណ៍មួយ នឹងបន្សីទៅឧបករណ៍មួយទៀត' 
                      : '3. Edits made on either device automatically synchronize'}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCopyUrl}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? (language === 'km' ? 'បានចម្លងតំណភ្ជាប់' : 'Link Copied') : (language === 'km' ? 'ចម្លងតំណភ្ជាប់បន្សី (Copy Link)' : 'Copy Direct Link')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Sync Switch */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white">
                {language === 'km' ? 'បន្សីស្វ័យប្រវត្តិក្នងផ្ទៃខាងក្រោយ (Auto-Sync)' : 'Automatic Background Sync'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'រក្សាទុកទិន្នន័យទៅ Cloud ដោយស្វ័យប្រវត្តិនីមួយៗពេលលោកគ្រូអ្នកគ្រូបញ្ចូលពិន្ទុ ឬវត្តមាន' 
                  : 'Automatically syncs changes when scores, attendance or rosters are updated'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoSyncEnabled} 
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between rounded-b-3xl">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{language === 'km' ? 'រក្សាទុកក្នុងទូរស័ព្ទផង និង Cloud ផង (គ្មានបាត់បង់ទិន្នន័យ)' : 'Persisted locally and in Cloud (No data loss)'}</span>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black transition cursor-pointer"
          >
            {language === 'km' ? 'យល់ព្រម' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
