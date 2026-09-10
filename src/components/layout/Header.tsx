import React, { useState, useRef, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ChevronDown, 
  BookOpen,
  Sun,
  Moon,
  Plus,
  Edit3,
  Building2,
  Cloud,
  User,
  LogOut,
  Users,
  ShieldCheck,
  Check,
  School
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

  const { currentUser, users, switchAccount, logout, isAdmin } = useAuth();

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classModalInitial, setClassModalInitial] = useState<ClassSection | null>(null);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const classDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) {
        setShowClassDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* Logo & School Name */}
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
                  className="text-left font-heading font-black text-xs sm:text-base md:text-lg text-indigo-950 dark:text-white uppercase tracking-tight leading-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer max-w-[110px] xs:max-w-[160px] sm:max-w-none truncate"
                  title={language === 'km' ? 'ចុចដើម្បីប្តូរព័ត៌មានសាលារៀន & ឡូហ្គូ' : 'Click to edit school profile'}
                >
                  {schoolProfile.schoolNameKm || activeClass?.schoolNameKm || currentUser?.schoolNameKm || 'សាលាបឋមសិក្សា'}
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5">
                {schoolProfile.district || currentUser?.district ? `${schoolProfile.district || currentUser?.district} • ` : ''}
                {schoolProfile.province || currentUser?.province || 'កម្ពុជា'}
                {` • ឆ្នាំសិក្សា ${schoolProfile.academicYear || activeClass?.academicYear || '២០២៥-២០២៦'}`}
              </p>
            </div>
          </div>

          {/* Center: Class Selector */}
          <div className="relative shrink-0" ref={classDropdownRef}>
            <button
              onClick={() => {
                setShowClassDropdown(!showClassDropdown);
                setShowUserDropdown(false);
              }}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-slate-100 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate max-w-[70px] xs:max-w-[100px] sm:max-w-none">
                {language === 'km' ? (activeClass?.nameKm || 'ជ្រើសរើសថ្នាក់') : (activeClass?.name || 'Select Class')}
              </span>
              <span className="hidden xs:inline-block bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] px-1.5 sm:px-2 py-0.5 rounded-lg font-black tracking-normal">
                {classStudents.length} {language === 'km' ? 'នាក់' : 'STS'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            </button>

            {showClassDropdown && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
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
                            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-md uppercase font-black">
                              {language === 'km' ? 'កំពុងប្រើ' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
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

          {/* Right Section: Cloud Sync, Theme Toggle, & User Account */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* PWA Install Button */}
            <PWAInstallButton language={language} variant="header" />

            {/* Cloud Sync Status */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl border transition cursor-pointer shadow-2xs ${
                syncStatus.state === 'synced'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                  : syncStatus.state === 'syncing'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
              }`}
              title={language === 'km' ? 'Cloud Sync - បន្សីទិន្នន័យ' : 'Cloud Sync'}
            >
              <Cloud className="w-4 h-4 shrink-0" />
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

            {/* User Account Button & Dropdown */}
            {currentUser && (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowClassDropdown(false);
                  }}
                  className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition cursor-pointer shadow-2xs group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {currentUser.fullName.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden md:block max-w-[120px] truncate">
                    <div className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {currentUser.role === 'principal' ? 'នាយកសាលា' : 'គ្រូបន្ទុកថ្នាក់'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform" />
                </button>

                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    
                    {/* User Card Header */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center text-sm font-black shadow-sm">
                          {currentUser.fullName.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {currentUser.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            @{currentUser.username}
                          </div>
                          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {currentUser.schoolNameKm || schoolProfile.schoolNameKm || 'សាលារៀន'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Switch Accounts List */}
                    <div className="px-3 py-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5">
                        ប្ដូរគណនីប្រើប្រាស់ (Switch Account)
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {users.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchAccount(u.id);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                              u.id === currentUser.id
                                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-black'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="truncate">{u.fullName}</div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {u.schoolNameKm || 'សាលារៀនថ្មី'}
                              </div>
                            </div>
                            {u.id === currentUser.id && (
                              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Items */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 px-2 space-y-0.5">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('account_management');
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>គ្រប់គ្រងគណនី (Admin Center)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsSchoolSettingsOpen(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <School className="w-4 h-4 text-slate-400" />
                        <span>ព័ត៌មានសាលារៀន & ឡូហ្គូ</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>ចាកចេញពីគណនី (Log Out)</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

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
