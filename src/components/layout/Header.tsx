import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { useAuth } from '../../context/AuthContext';
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
  RefreshCw,
  ShieldCheck,
  LogOut,
  User,
  Check
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { SchoolProfileSettingsModal } from '../school/SchoolProfileSettingsModal';
import { ClassModal } from '../school/ClassModal';
import { AdminUserManagementModal } from '../auth/AdminUserManagementModal';
import { UserProfileSettingsModal } from '../auth/UserProfileSettingsModal';
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

  const { currentUser, logout } = useAuth();

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classModalInitial, setClassModalInitial] = useState<ClassSection | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

          {/* Global Class Switcher Selector Dropdown (Only switchable for Admins) */}
          {currentUser?.role === 'admin' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition cursor-pointer text-left shadow-2xs bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border-amber-300 dark:border-amber-750 text-amber-950 dark:text-amber-100"
                title={language === 'km' ? 'សិទ្ធិ Admin៖ ចុចដើម្បីប្តូរពិនិត្យ ឬកែប្រែថ្នាក់ណាក៏បាន' : 'Admin: Switch to inspect/edit any class'}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs bg-amber-500 text-white">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[170px]">
                      {language === 'km' ? (activeClass?.nameKm || activeClass?.name) : (activeClass?.name || activeClass?.nameKm)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md font-black bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 uppercase tracking-wider shrink-0">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[180px]">
                    {language === 'km'
                      ? `${classStudents.length} នាក់ • ${activeClass?.teacherNameKm || activeClass?.teacherName || 'គ្មានគ្រូ'}`
                      : `${classStudents.length} students`}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showClassDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu (Only shown when admin opens it) */}
              {showClassDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowClassDropdown(false)} />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-84 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {language === 'km' ? 'ជ្រើសរើសថ្នាក់រៀន' : 'Switch Class'}
                      </p>
                      {currentUser?.role === 'admin' && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          {language === 'km' ? '★ សិទ្ធិ Admin៖ ពិនិត្យ & កែប្រែគ្រប់ថ្នាក់ក្នុងប្រព័ន្ធ' : '★ Admin: Review & edit any class'}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {classes.length} ថ្នាក់
                    </span>
                  </div>

                  {/* List of classes */}
                  <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                    {classes.map(cls => {
                      const isSelected = cls.id === activeClassId;
                      const studentCount = (cls.studentIds || []).length;

                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            setActiveClassId(cls.id);
                            setShowClassDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer ${
                            isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {cls.gradeLevel || cls.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-black truncate">{cls.nameKm || cls.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {cls.teacherNameKm || cls.teacherName || 'គ្រូបន្ទុកថ្នាក់'} • {cls.roomNumber || 'បន្ទប់'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {studentCount} នាក់
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Class actions inside dropdown */}
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 px-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowClassDropdown(false);
                        setClassModalInitial(activeClass || null);
                        setIsClassModalOpen(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{language === 'km' ? 'កែប្រែព័ត៌មានថ្នាក់បច្ចុប្បន្ន' : 'Edit Current Class'}</span>
                    </button>

                    {currentUser?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowClassDropdown(false);
                          setActiveTab('all_classes');
                        }}
                        className="w-full py-1.5 px-3 rounded-xl text-left text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center space-x-2 cursor-pointer transition"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{language === 'km' ? 'មជ្ឈមណ្ឌលគ្រប់គ្រងគ្រប់ថ្នាក់ (Hub)' : 'All Classes Management Hub'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            </div>
          )}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Admin Management Button (Visible if user is admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white transition cursor-pointer shadow-xs font-bold text-xs"
                title="គ្រប់គ្រងគណនីគ្រូ និងអ្នកប្រើប្រាស់"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="hidden lg:inline">គ្រប់គ្រងគណនី</span>
              </button>
            )}

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

            {/* User Info & Logout */}
            {currentUser && (
              <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-700 space-x-1.5 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                  title="កែប្រែព័ត៌មានគណនី (ឈ្មោះ លេខទូរស័ព្ទ username និងពាក្យសម្ងាត់)"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate max-w-[120px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <span>{currentUser.role === 'admin' ? 'Admin' : currentUser.className || 'គ្រូបង្រៀន'}</span>
                      <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 sm:p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition cursor-pointer shadow-2xs"
                  title="ចាកចេញ (Logout)"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'km' ? 'ចាកចេញពីគណនី' : 'Sign Out'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {currentUser?.fullName} ({currentUser?.role === 'admin' ? 'Admin' : currentUser?.className || 'គ្រូបង្រៀន'})
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {language === 'km' 
                ? 'តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ? រាល់ទិន្នន័យត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិក្នងម៉ាស៊ីនរួចរាល់។' 
                : 'Are you sure you want to sign out of the system? All changes have been automatically saved locally.'}
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition cursor-pointer shadow-xs"
              >
                {language === 'km' ? 'ចាកចេញ' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      <AdminUserManagementModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <UserProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
