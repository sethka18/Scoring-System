import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  RotateCw, 
  Save, 
  HardDrive, 
  ShieldCheck, 
  AlertCircle,
  X,
  History,
  CheckCircle2,
  Database
} from 'lucide-react';
import { AutoSaveBackupData } from '../../hooks/useAssessmentAutoSave';

interface AssessmentAutoSaveBadgeProps {
  language: 'en' | 'km';
  lastSavedTime: Date;
  isSaving: boolean;
  hasPendingChanges: boolean;
  secondsUntilSave: number;
  onSaveNow: () => void;
  backupInfo: AutoSaveBackupData | null;
  onRestoreBackup: (backup: AutoSaveBackupData) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AssessmentAutoSaveBadge: React.FC<AssessmentAutoSaveBadgeProps> = ({
  language,
  lastSavedTime,
  isSaving,
  hasPendingChanges,
  secondsUntilSave,
  onSaveNow,
  backupInfo,
  onRestoreBackup,
  showToast,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState<boolean>(false);

  const formattedTime = lastSavedTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const handleRestoreClick = () => {
    if (!backupInfo) {
      showToast(
        language === 'km' ? 'ពុំមានទិន្នន័យបម្រុងទុកពីមុនឡើយ' : 'No previous auto-save backup found',
        'warning'
      );
      return;
    }
    setShowConfirmRestore(true);
  };

  const handleConfirmRestore = () => {
    if (backupInfo) {
      onRestoreBackup(backupInfo);
      setShowConfirmRestore(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Visual Badge Indicator */}
      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`group inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
            isSaving
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              : hasPendingChanges
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70'
          }`}
          title={
            language === 'km'
              ? 'ចុចដើម្បីមើលព័ត៌មានលម្អិតអំពីប្រព័ន្ធរក្សាទុកស្វ័យប្រវត្តិចូល Local Storage'
              : 'Click to view Auto-Save details and storage history'
          }
        >
          {isSaving ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-black">
                {language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...'}
              </span>
            </>
          ) : hasPendingChanges ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[11px] font-black">
                {language === 'km'
                  ? `កែប្រែថ្មី (${secondsUntilSave}វិ)`
                  : `Modified (${secondsUntilSave}s)`}
              </span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black flex items-center space-x-1">
                <span>{language === 'km' ? 'ស្វ័យប្រវត្តិ៖' : 'Auto-Saved:'}</span>
                <span className="font-mono text-emerald-900 dark:text-emerald-100">{formattedTime}</span>
              </span>
            </>
          )}

          <span className="text-[10px] opacity-70 border-l border-current pl-1.5 hidden sm:inline">
            30s
          </span>
        </button>

        {/* Quick Manual Save Button when pending edits exist */}
        {hasPendingChanges && (
          <button
            type="button"
            onClick={onSaveNow}
            disabled={isSaving}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
            title={language === 'km' ? 'រក្សាទុកភ្លាមៗដោយមិនបាច់រង់ចាំ ៣០ វិនាទី' : 'Save changes immediately to local storage'}
          >
            <Save className="w-3 h-3" />
            <span>{language === 'km' ? 'រក្សាទុកភ្លាម' : 'Save Now'}</span>
          </button>
        )}
      </div>

      {/* Auto-Save Details & Recovery Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 dark:text-white text-sm">
                    {language === 'km' ? 'ប្រព័ន្ធរក្សាទុកពិន្ទុស្វ័យប្រវត្តិ' : 'Assessment Auto-Save System'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'km' ? 'រៀងរាល់ ៣០ វិនាទី (Local Storage)' : 'Every 30 seconds to browser local storage'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setShowConfirmRestore(false);
                }}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Status overview */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'km' ? 'វដ្តរក្សាទុកស្វ័យប្រវត្តិ៖' : 'Auto-Save Interval:'}</span>
                  </span>
                  <span className="font-black text-emerald-900 dark:text-emerald-200">
                    {language === 'km' ? 'រៀងរាល់ ៣០ វិនាទី' : 'Every 30 seconds'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'km' ? 'រក្សាទុកចុងក្រោយ៖' : 'Last Saved At:'}</span>
                  </span>
                  <span className="font-mono font-black text-slate-800 dark:text-slate-200">
                    {formattedTime}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'km' ? 'ទីតាំងផ្ទុកទិន្នន័យ៖' : 'Storage Engine:'}</span>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Browser LocalStorage
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/30">
                  <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'km' ? 'ស្ថានភាពបច្ចុប្បន្ន៖' : 'Current Status:'}</span>
                  </span>
                  <span className={`text-xs font-black ${hasPendingChanges ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {hasPendingChanges 
                      ? (language === 'km' ? `មានការកែប្រែ (នឹងរក្សាទុកក្នុង ${secondsUntilSave}វិ)` : `Edits queued (saving in ${secondsUntilSave}s)`)
                      : (language === 'km' ? 'ទិន្នន័យមានសុវត្ថិភាព ១០០%' : 'Synchronized & Safe')}
                  </span>
                </div>
              </div>

              {/* Data Loss Prevention Description */}
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'km' ? 'សុវត្ថិភាពខ្ពស់ គ្មានការបាត់បង់ទិន្នន័យ៖' : 'Zero Data Loss Guarantee:'}</span>
                </p>
                <p>
                  {language === 'km'
                    ? 'រាល់ពេលលោកគ្រូ-អ្នកគ្រូវាយបញ្ចូលពិន្ទុ ប្រព័ន្ធនឹងកត់ត្រាការផ្លាស់ប្តូរ ហើយរក្សាទុកដោយស្វ័យប្រវត្តិចូលក្នុង Browser Local Storage រៀងរាល់ ៣០ វិនាទី។ ទោះបីជាដាច់ភ្លើង ច្រឡំបិទផ្ទាំង ឬដាច់អ៊ីនធឺណិត ក៏ពិន្ទុមិនបាត់បង់ឡើយ។'
                    : 'All score inputs are automatically tracked and flushed to browser Local Storage every 30 seconds. If power fails or the tab is closed, all grading data is preserved.'}
                </p>
              </div>

              {/* Backup details if available */}
              {backupInfo && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{language === 'km' ? 'ទិន្នន័យបម្រុងទុក (Auto-Save Snapshot)' : 'Auto-Save Snapshot'}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {new Date(backupInfo.timestamp).toLocaleDateString()} {backupInfo.timeFormatted}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'km' 
                      ? `ថ្នាក់៖ ${backupInfo.className} | ចំនួនសិស្ស៖ ${backupInfo.studentCount} នាក់`
                      : `Class: ${backupInfo.className} | Students: ${backupInfo.studentCount}`}
                  </div>
                </div>
              )}

              {/* Confirmation prompt for Restore */}
              {showConfirmRestore && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-start space-x-2 text-xs text-rose-800 dark:text-rose-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-bold">
                        {language === 'km' ? 'តើអ្នកពិតជាចង់ស្តារពិន្ទុពី Auto-Save នេះមែនទេ?' : 'Restore scores from this Auto-Save backup?'}
                      </p>
                      <p className="text-[11px] mt-0.5 text-rose-700 dark:text-rose-300">
                        {language === 'km' 
                          ? 'ពិន្ទុបច្ចុប្បន្ននឹងត្រូវបានជំនួសដោយទិន្នន័យកាលពី៖ ' + backupInfo?.timeFormatted
                          : 'Current scores will be replaced with backup data from: ' + backupInfo?.timeFormatted}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmRestore(false)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg"
                    >
                      {language === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRestore}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg transition"
                    >
                      {language === 'km' ? 'យល់ព្រមស្តារ' : 'Yes, Restore'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                {backupInfo && !showConfirmRestore && (
                  <button
                    type="button"
                    onClick={handleRestoreClick}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'km' ? 'ស្តារពី Backup' : 'Restore Backup'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {language === 'km' ? 'បិទ' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveNow();
                    setShowModal(false);
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'រក្សាទុកឥឡូវនេះ' : 'Save Now'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
