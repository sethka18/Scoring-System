import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Settings, 
  ChevronDown, 
  BookOpen,
  Sun,
  Moon,
  Plus,
  Edit3,
  Building2,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { SchoolProfileSettingsModal } from '../school/SchoolProfileSettingsModal';
import { ClassModal } from '../school/ClassModal';
import { ClassSection } from '../../types';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    language,
    classes,
    activeClassId,
    setActiveClassId,
    activeClass,
    classStudents,
    schoolProfile,
    setActiveTab,
    syncStatus,
    setIsSyncModalOpen,
  } = useGradebook();

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classModalInitial, setClassModalInitial] = useState<ClassSection | null>(null);

  return (
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-18 gap-1.5 sm:gap-4">
          
          {/* Logo & School Name with Configurable School Emblem */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button 
              type="button"
              className="h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center flex-shrink-0 cursor-pointer rounded-2xl hover:scale-105 transition-transform" 
              onClick={() => setIsSchoolSettingsOpen(true)} 
              title={language === 'km' ? 'ចុចដើម្បីប្តូរព័ត៌មានសាលារៀន & ឡូហ្គូ' : 'Click to edit school profile & logo'}
            >
              <SchoolLogo size={36} customLogoUrl={schoolProfile.logoUrl} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSchoolSettingsOpen(true)}
                  className="text-left font-heading font-black text-xs sm:text-base md:text-lg text-indigo-950 dark:text-white uppercase tracking-tight leading-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer max-w-[100px] xs:max-w-[150px] sm:max-w-none truncate"
                  title={language === 'km' ? 'ចុចដើម្បីប្តូរព័ត៌មានសាលារៀន & ឡូហ្គូ' : 'Click to edit school profile'}
                >
                  {language === 'km' ? (schoolProfile.schoolNameKm || activeClass?.schoolNameKm) : (schoolProfile.schoolName || activeClass?.schoolName)}
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5">
                {language === 'km' 
                  ? `${schoolProfile.district || 'ស្រុកត្បូងឃ្មុំ'} • ${schoolProfile.province || 'ខេត្តត្បូងឃ្មុំ'} • ឆ្នាំសិក្សា ${schoolProfile.academicYear || activeClass?.academicYear || '២០២៥-២០២៦'}`
                  : `${schoolProfile.district || 'Tboung Khmum'} • ${schoolProfile.province || 'Tboung Khmum'} • Year ${schoolProfile.academicYear || activeClass?.academicYear || '2025-2026'}`}
              </p>
            </div>
          </div>

          {/* Center Class Selector */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowClassDropdown(!showClassDropdown)}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-slate-100 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate max-w-[70px] xs:max-w-[100px] sm:max-w-none">{language === 'km' ? activeClass?.nameKm : activeClass?.name}</span>
              <span className="hidden xs:inline-block bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] px-1.5 sm:px-2 py-0.5 rounded-lg font-black tracking-normal">
                {classStudents.length} {language === 'km' ? 'នាក់' : 'STS'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            </button>

            {showClassDropdown && (
              <div className="absolute top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {language === 'km' ? 'ជ្រើសរើសថ្នាក់រៀន' : 'Select Active Class'}
                  </span>
                  <button
                    onClick={() => {
                      setClassModalInitial(null);
                      setIsClassModalOpen(true);
                      setShowClassDropdown(false);
                    }}
                    className="inline-flex items-center space-x-1 text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'km' ? 'ថ្នាក់ថ្មី' : 'New Class'}</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className={`group px-3 py-2 text-xs sm:text-sm flex items-center justify-between transition hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                        cls.id === activeClassId 
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-black border-l-4 border-indigo-600 dark:border-indigo-400' 
                          : 'text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setActiveClassId(cls.id);
                          setShowClassDropdown(false);
                        }}
                        className="flex-1 text-left cursor-pointer pr-2"
                      >
                        <div className="font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{language === 'km' ? cls.nameKm : cls.name}</span>
                          {cls.id === activeClassId && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-md uppercase font-black">
                              {language === 'km' ? 'កំពុងប្រើ' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500">
                          {cls.teacherNameKm || cls.teacherName || (language === 'km' ? `ថ្នាក់ទី ${cls.gradeLevel}` : `Grade ${cls.gradeLevel}`)}
                        </div>
                      </button>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400">
                          {cls.studentIds?.length || 0} {language === 'km' ? 'នាក់' : 'sts'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClassModalInitial(cls);
                            setIsClassModalOpen(true);
                            setShowClassDropdown(false);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                          title={language === 'km' ? `កែប្រែ ${cls.nameKm}` : `Edit ${cls.name}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 px-3 space-y-1">
                  <button
                    onClick={() => {
                      setClassModalInitial(null);
                      setIsClassModalOpen(true);
                      setShowClassDropdown(false);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'បង្កើតថ្នាក់រៀនថ្មី' : '+ Create New Class'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowClassDropdown(false);
                      setActiveTab('school_hub');
                    }}
                    className="w-full flex items-center justify-center space-x-1 text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-1 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'មើលគ្រប់ថ្នាក់ទាំងអស់ (Hub)' : 'View All Classes Hub'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* PWA In-App Install Button */}
            <PWAInstallButton language={language} variant="header" />

            {/* Cloud Sync Cross-Device Status Button */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl border transition cursor-pointer shadow-2xs ${
                syncStatus.state === 'synced'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  : syncStatus.state === 'syncing'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
              }`}
              title={language === 'km' ? 'ប្រព័ន្ធបន្សីទិន្នន័យឆ្លងឧបករណ៍ (Cloud Sync) - ចុចដើម្បីស្កេនភ្ជាប់ទូរស័ព្ទ' : 'Cloud Sync - Click to pair mobile device'}
            >
              <Cloud className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline text-xs font-black tracking-tight">
                {syncStatus.state === 'synced' ? (language === 'km' ? 'បានបន្សី' : 'Synced') :
                 syncStatus.state === 'syncing' ? (language === 'km' ? 'កំពុងបន្សី...' : 'Syncing...') :
                 (language === 'km' ? 'Cloud Sync' : 'Cloud Sync')}
              </span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                syncStatus.state === 'synced' ? 'bg-emerald-500 animate-pulse' :
                syncStatus.state === 'syncing' ? 'bg-indigo-500 animate-ping' :
                'bg-amber-500'
              }`} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs group"
              title={theme === 'dark' ? 'ប្ដូរទៅទម្រង់ពន្លឺ' : 'ប្ដូរទៅទម្រង់ងងឹត'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-200 group-hover:-rotate-12" />
              )}
            </button>

            {/* Settings Quick Tab */}
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs"
              title="Grading Settings"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>

          </div>

        </div>
      </div>

      <SchoolProfileSettingsModal 
        isOpen={isSchoolSettingsOpen} 
        onClose={() => setIsSchoolSettingsOpen(false)} 
      />

      <ClassModal
        isOpen={isClassModalOpen}
        initialClass={classModalInitial}
        onClose={() => {
          setIsClassModalOpen(false);
          setClassModalInitial(null);
        }}
      />
    </header>
  );
};
