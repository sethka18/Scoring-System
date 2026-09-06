import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Settings, 
  ChevronDown, 
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { SchoolProfileSettingsModal } from '../school/SchoolProfileSettingsModal';

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
  } = useGradebook();

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState(false);

  return (
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & School Name with Configurable School Emblem */}
          <div className="flex items-center space-x-3">
            <button 
              type="button"
              className="h-11 w-11 flex items-center justify-center flex-shrink-0 cursor-pointer rounded-2xl hover:scale-105 transition-transform" 
              onClick={() => setIsSchoolSettingsOpen(true)} 
              title={language === 'km' ? 'ចុចដើម្បីប្តូរព័ត៌មានសាលារៀន & ឡូហ្គូ' : 'Click to edit school profile & logo'}
            >
              <SchoolLogo size={44} customLogoUrl={schoolProfile.logoUrl} />
            </button>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSchoolSettingsOpen(true)}
                  className="text-left font-heading font-black text-base sm:text-lg text-indigo-950 dark:text-white uppercase tracking-tight leading-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                  title={language === 'km' ? 'ចុចដើម្បីប្តូរព័ត៌មានសាលារៀន & ឡូហ្គូ' : 'Click to edit school profile'}
                >
                  {language === 'km' ? (schoolProfile.schoolNameKm || activeClass?.schoolNameKm) : (schoolProfile.schoolName || activeClass?.schoolName)}
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5">
                {language === 'km' 
                  ? `${schoolProfile.district || 'ស្រុកព្រៃឈរ'} • ${schoolProfile.province || 'ខេត្តកំពង់ចាម'} • ឆ្នាំសិក្សា ${schoolProfile.academicYear || activeClass?.academicYear}`
                  : `${schoolProfile.district || 'District'} • ${schoolProfile.province || 'Province'} • Year ${schoolProfile.academicYear || activeClass?.academicYear}`}
              </p>
            </div>
          </div>

          {/* Center Class Selector */}
          <div className="relative">
            <button
              onClick={() => setShowClassDropdown(!showClassDropdown)}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-slate-100 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? activeClass?.nameKm : activeClass?.name}</span>
              <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-black tracking-normal">
                {classStudents.length} {language === 'km' ? 'នាក់' : 'STS'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>

            {showClassDropdown && (
              <div className="absolute top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {language === 'km' ? 'ជ្រើសរើសថ្នាក់រៀន' : 'Select Active Class'}
                </div>
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setActiveClassId(cls.id);
                      setShowClassDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs sm:text-sm flex items-center justify-between transition hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer ${
                      cls.id === activeClassId ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-black border-l-4 border-indigo-600 dark:border-indigo-400' : 'text-slate-700 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">{language === 'km' ? cls.nameKm : cls.name}</div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{cls.roomNumber}</div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400">
                      {cls.studentIds?.length || 0} {language === 'km' ? 'នាក់' : 'students'}
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 px-3">
                  <button
                    onClick={() => {
                      setShowClassDropdown(false);
                      setActiveTab('roster');
                    }}
                    className="w-full text-center text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 py-1.5 cursor-pointer"
                  >
                    + {language === 'km' ? 'គ្រប់គ្រងថ្នាក់ & បញ្ជី' : 'Manage All Classes'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* PWA In-App Install Button */}
            <PWAInstallButton language={language} variant="header" />

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
    </header>
  );
};
