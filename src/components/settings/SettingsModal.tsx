import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  SlidersHorizontal, 
  BookOpen, 
  Award, 
  RotateCcw, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  Check,
  School,
  Calendar,
  Brain,
  Sun,
  Moon,
  Monitor,
  MapPin,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { exportFullBackupJSON } from '../../utils/exportImport';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Wifi, WifiOff, Smartphone, HardDrive, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

export const SettingsModal: React.FC = () => {
  const {
    theme,
    setTheme,
    language,
    activeClass,
    classes,
    students,
    subjects,
    periods,
    scoresMatrix,
    weights,
    competencyWeights,
    gradeScales,
    schoolProfile,
    updateSchoolProfile,
    resetSchoolLogo,
    updateWeights,
    updateCompetencyWeights,
    updateGradeScales,
    updateSubjects,
    updateClass,
    resetToDefaults,
    importFullData,
    showToast,
    setActiveTab,
  } = useGradebook();

  const { isOnline } = useOnlineStatus();

  const [currentCompetency, setCurrentCompetency] = useState({ ...competencyWeights });
  const [currentScales, setCurrentScales] = useState([...gradeScales]);
  const [currentSubjects, setCurrentSubjects] = useState([...subjects]);

  const [schoolProfileData, setSchoolProfileData] = useState({
    schoolName: schoolProfile?.schoolName || '',
    schoolNameKm: schoolProfile?.schoolNameKm || '',
    province: schoolProfile?.province || 'ខេត្តកំពង់ចាម',
    district: schoolProfile?.district || 'ស្រុកព្រៃឈរ',
    commune: schoolProfile?.commune || 'ឃុំព្រៃឈរ',
    village: schoolProfile?.village || '',
    schoolCode: schoolProfile?.schoolCode || '',
    principalNameKm: schoolProfile?.principalNameKm || '',
    phone: schoolProfile?.phone || '',
    email: schoolProfile?.email || '',
    logoUrl: schoolProfile?.logoUrl || '',
    academicYear: schoolProfile?.academicYear || activeClass?.academicYear || '២០២៥-២០២៦',
  });

  const [classInfo, setClassInfo] = useState({
    teacherName: activeClass?.teacherName || '',
    teacherNameKm: activeClass?.teacherNameKm || '',
    roomNumber: activeClass?.roomNumber || '',
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(language === 'km' ? 'សូមជ្រើសរើសឯកសាររូបភាព' : 'Please select an image file', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSchoolProfileData(prev => ({ ...prev, logoUrl: dataUrl }));
      showToast(language === 'km' ? 'បានបញ្ចូលឡូហ្គូថ្មី' : 'Logo uploaded', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const compSum = currentCompetency.knowledge + currentCompetency.skill + currentCompetency.attitude;
    if (compSum !== 100) {
      showToast(language === 'km' ? 'ផលបូកសម្បទា ៣ យ៉ាងត្រូវតែស្មើ ១០០%' : 'Competency weights must total 100%', 'warning');
      return;
    }

    updateCompetencyWeights(currentCompetency);
    updateGradeScales(currentScales);
    updateSubjects(currentSubjects);

    // Save global school profile
    updateSchoolProfile(schoolProfileData);

    // Update active class specific homeroom info
    if (activeClass) {
      updateClass(activeClass.id, {
        schoolName: schoolProfileData.schoolName,
        schoolNameKm: schoolProfileData.schoolNameKm,
        district: schoolProfileData.district,
        commune: schoolProfileData.commune,
        province: schoolProfileData.province,
        logoUrl: schoolProfileData.logoUrl,
        teacherName: classInfo.teacherName,
        teacherNameKm: classInfo.teacherNameKm,
        roomNumber: classInfo.roomNumber,
        academicYear: schoolProfileData.academicYear,
      });
    }

    showToast(language === 'km' ? 'បានរក្សាទុកការកំណត់ជោគជ័យ' : 'Settings saved successfully');
  };

  const handleSubjectChange = (id: string, field: string, value: any) => {
    setCurrentSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleScaleChange = (grade: string, minPercentage: number) => {
    setCurrentScales(prev => prev.map(s => s.grade === grade ? { ...s, minPercentage } : s));
  };

  const handleAddSubject = () => {
    const newId = `sub_${Date.now()}`;
    setCurrentSubjects(prev => [
      ...prev,
      {
        id: newId,
        nameEn: 'New Subject',
        nameKm: 'មុខវិជ្ជាថ្មី',
        code: 'NEW',
        maxScore: 10,
        coefficient: 1,
        color: '#6366f1',
      }
    ]);
  };

  const handleDeleteSubject = (id: string) => {
    if (currentSubjects.length <= 1) return;
    setCurrentSubjects(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'ការកំណត់ប្រព័ន្ធពិន្ទុ & សាលារៀន' : 'Grading & School System Settings'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'km' ? 'កែប្រែទម្រង់ពណ៌ (Light/Dark) ទម្ងន់ពិន្ទុ កម្រិតនិទ្ទេស មុខវិជ្ជា និងព័ត៌មានគ្រូបង្រៀន' : 'Configure theme mode (Light/Dark), assessment weights, letter grade boundaries, subjects, and homeroom details'}
            </p>
          </div>
          
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'km' ? 'រក្សាទុកការកំណត់' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Theme Selection Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{language === 'km' ? 'ស្បែក និងទម្រង់បង្ហាញ (Theme & Appearance)' : 'Theme & Appearance'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'km' 
                ? 'ជ្រើសរើសទម្រង់ពន្លឺ (Light) ឬទម្រង់ងងឹត (Dark) សម្រាប់ផ្ទាំងគ្រប់គ្រងពិន្ទុ' 
                : 'Choose Light or Dark mode for your grading interface (saved to your browser preference)'}
            </p>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {theme === 'dark' ? (language === 'km' ? 'កំពុងប្រើ: ងងឹត' : 'Active: Dark') : (language === 'km' ? 'កំពុងប្រើ: ពន្លឺ' : 'Active: Light')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition flex items-center space-x-4 cursor-pointer ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
            }`}
          >
            <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-white dark:bg-slate-700 text-slate-500'}`}>
              <Sun className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {language === 'km' ? 'ទម្រង់ពន្លឺ (Light Mode)' : 'Light Mode'}
                </span>
                {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km' ? 'ពណ៌សភ្លឺ ច្បាស់ សម្រាប់ការងារពេលថ្ងៃ' : 'Clean, high-contrast bright canvas'}
              </p>
            </div>
          </button>

          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition flex items-center space-x-4 cursor-pointer ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
            }`}
          >
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-indigo-950 text-indigo-300' : 'bg-white dark:bg-slate-700 text-slate-500'}`}>
              <Moon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {language === 'km' ? 'ទម្រង់ងងឹត (Dark Mode)' : 'Dark Mode'}
                </span>
                {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km' ? 'ពណ៌ងងឹតស្រទន់ ជួយកាត់បន្ថយការចាំងភ្នែក' : 'Eye-friendly twilight tones for night work'}
              </p>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        
        {/* Section 1: School Profile & Homeroom Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'ព័ត៌មានសាលារៀន ឡូហ្គូ និងថ្នាក់រៀន' : 'School Profile, Logo & Homeroom'}</span>
            </h3>
            {schoolProfileData.logoUrl && (
              <button
                type="button"
                onClick={() => {
                  setSchoolProfileData(prev => ({ ...prev, logoUrl: '' }));
                  resetSchoolLogo();
                }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ប្រើត្រាក្រសួងដើម' : 'Reset to MoEYS'}</span>
              </button>
            )}
          </div>

          {/* School Logo Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 shadow-xs flex items-center justify-center overflow-hidden">
                <SchoolLogo 
                  customLogoUrl={schoolProfileData.logoUrl} 
                  size={70} 
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ប្តូរឡូហ្គូសាលារៀន (Upload Logo)' : 'Upload School Logo'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'km'
                  ? 'ឡូហ្គូនេះនឹងត្រូវបង្ហាញលើក្បាលគេហទំព័រ ប្លង់តុ ព្រឹត្តិបត្រពិន្ទុ និងរបាយការណ៍បោះពុម្ពទាំងអស់។'
                  : 'This logo will appear on the app header, seating plan, gradebooks, and report cards.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឈ្មោះសាលារៀន (ខ្មែរ)' : 'School Name (Khmer)'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={schoolProfileData.schoolNameKm}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, schoolNameKm: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឈ្មោះសាលា (English)' : 'School Name (English)'}
              </label>
              <input
                type="text"
                value={schoolProfileData.schoolName}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'លេខកូដសាលា / EMIS Code' : 'School Code / EMIS'}
              </label>
              <input
                type="text"
                value={schoolProfileData.schoolCode}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, schoolCode: e.target.value })}
                placeholder="030704"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ស្រុក / ខណ្ឌ / ក្រុង' : 'District / Khan'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={schoolProfileData.district}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, district: e.target.value })}
                placeholder="ស្រុកព្រៃឈរ"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឃុំ / សង្កាត់' : 'Commune / Sangkat'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={schoolProfileData.commune}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, commune: e.target.value })}
                placeholder="ឃុំព្រៃឈរ"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'រាជធានី / ខេត្ត' : 'Capital / Province'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={schoolProfileData.province}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, province: e.target.value })}
                placeholder="ខេត្តកំពង់ចាម"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឈ្មោះលោកនាយក/នាយិកា' : 'Principal Name'}
              </label>
              <input
                type="text"
                value={schoolProfileData.principalNameKm}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, principalNameKm: e.target.value })}
                placeholder="លោកនាយកសាលា"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {language === 'km' ? 'ព័ត៌មានថ្នាក់រៀនបច្ចុប្បន្ន' : 'Current Active Class Details'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់ (ខ្មែរ)' : 'Homeroom Teacher (Khmer)'}
              </label>
              <input
                type="text"
                value={classInfo.teacherNameKm}
                onChange={(e) => setClassInfo({ ...classInfo, teacherNameKm: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឆ្នាំសិក្សា' : 'Academic Year'}
              </label>
              <input
                type="text"
                value={schoolProfileData.academicYear}
                onChange={(e) => setSchoolProfileData({ ...schoolProfileData, academicYear: e.target.value })}
                placeholder="២០២៥-២០២៦"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: MoEYS 3 Competency Pillars (Yearly Evaluation) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ទម្ងន់សម្បទា ៣ យ៉ាងសម្រាប់ការវាយតម្លៃប្រចាំឆ្នាំ (MoEYS)' : 'Yearly 3-Pillar Competency Weights (%)'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km' 
                  ? 'ប្រើប្រាស់សម្រាប់តែការគណនាសរុបលទ្ធផលប្រចាំឆ្នាំ (វិជ្ជា ៨០% + បំណិន ១០% + ចរិយា ១០%)' 
                  : 'Applied strictly to the Whole-Year consolidated evaluation and yearly report card'}
              </p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              currentCompetency.knowledge + currentCompetency.skill + currentCompetency.attitude === 100 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {currentCompetency.knowledge + currentCompetency.skill + currentCompetency.attitude}% / 100%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>{language === 'km' ? '១. វិជ្ជាសម្បទា' : '1. Knowledge'}</span>
                <span className="text-indigo-900 dark:text-indigo-300 font-black">{currentCompetency.knowledge}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={90}
                step={5}
                value={currentCompetency.knowledge}
                onChange={(e) => setCurrentCompetency({ ...currentCompetency, knowledge: parseInt(e.target.value) || 0 })}
                className="w-full mt-2 accent-indigo-600"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-2">
                {language === 'km' ? 'ពិន្ទុមធ្យមភាគមុខវិជ្ជាសរុប' : 'Subject score average'}
              </span>
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>{language === 'km' ? '២. បំណិនសម្បទា' : '2. Skill'}</span>
                <span className="text-emerald-800 dark:text-emerald-300 font-black">{currentCompetency.skill}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={currentCompetency.skill}
                onChange={(e) => setCurrentCompetency({ ...currentCompetency, skill: parseInt(e.target.value) || 0 })}
                className="w-full mt-2 accent-emerald-600"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-2">
                {language === 'km' ? 'ការអនុវត្តជាក់ស្តែង' : 'Practical application'}
              </span>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>{language === 'km' ? '៣. ចរិយាសម្បទា' : '3. Attitude'}</span>
                <span className="text-amber-800 dark:text-amber-300 font-black">{currentCompetency.attitude}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={currentCompetency.attitude}
                onChange={(e) => setCurrentCompetency({ ...currentCompetency, attitude: parseInt(e.target.value) || 0 })}
                className="w-full mt-2 accent-amber-600"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-2">
                {language === 'km' ? 'វិន័យ និងសីលធម៌' : 'Discipline & Conduct'}
              </span>
            </div>
          </div>
        </div>

        {/* Section: MoEYS Letter Grade Scale (A, B, C, D, E, F) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'km' ? 'មាត្រដ្ឋាននិទ្ទេសសិក្សា MoEYS (Grade Scales: A, B, C, D, E, F)' : 'MoEYS Letter Grade Scales (A, B, C, D, E, F)'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km'
                  ? 'និទ្ទេស E កំណត់ចាប់ពីមធ្យមភាគ ៥.០ (៥០%) ឡើងទៅជាកម្រិតជាប់ ចំណែកនិទ្ទេស F គឺមធ្យមភាគក្រោម ៥.០ (ធ្លាក់)'
                  : 'Grade E requires minimum average 5.0 (50% Pass), while Grade F is strictly below 5.0 (Fail)'}
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
              {language === 'km' ? 'E: មធ្យមភាគ ≥ ៥.០ | F: < ៥.០' : 'E: Avg ≥ 5.0 | F: < 5.0'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {currentScales.map((scale) => {
              const minAvg = (scale.minPercentage / 10).toFixed(1);
              const isPass = scale.grade !== 'F';
              return (
                <div
                  key={scale.grade}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-xs"
                      style={{ backgroundColor: scale.color }}
                    >
                      {scale.grade}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPass ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
                      {isPass ? (language === 'km' ? 'ជាប់' : 'Pass') : (language === 'km' ? 'ធ្លាក់' : 'Fail')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                      {language === 'km' ? 'ពិន្ទុអប្បបរមា (%)' : 'Min %'}
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        disabled={scale.grade === 'F'}
                        value={scale.minPercentage}
                        onChange={(e) => handleScaleChange(scale.grade, Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                        className={`w-full px-2 py-1 rounded text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${scale.grade === 'F' ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500'}`}
                      />
                      <span className="text-xs text-slate-500 font-bold">%</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    {scale.grade === 'F' ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{language === 'km' ? 'មធ្យមភាគ < ៥.០' : 'Avg < 5.0'}</span>
                    ) : (
                      <span>{language === 'km' ? `មធ្យមភាគ ≥ ${minAvg}` : `Avg ≥ ${minAvg}`}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Subject & Coefficient Management */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'បញ្ជីមុខវិជ្ជា និងមេគុណ (Subjects & Coefficients)' : 'Subjects & Coefficients'}</span>
            </h3>
            <button
              type="button"
              onClick={handleAddSubject}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បន្ថែមមុខវិជ្ជា' : '+ Add Subject'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">{language === 'km' ? 'ឈ្មោះមុខវិជ្ជា (ខ្មែរ)' : 'Subject Name (Khmer)'}</th>
                  <th className="py-2.5 px-3">{language === 'km' ? 'ឈ្មោះមុខវិជ្ជា (English)' : 'Subject Name (English)'}</th>
                  <th className="py-2.5 px-3 w-20">{language === 'km' ? 'កូដ' : 'Code'}</th>
                  <th className="py-2.5 px-3 w-24 text-center">{language === 'km' ? 'មេគុណ' : 'Coefficient'}</th>
                  <th className="py-2.5 px-3 w-16 text-right">{language === 'km' ? 'លុប' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentSubjects.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={s.nameKm}
                        onChange={(e) => handleSubjectChange(s.id, 'nameKm', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={s.nameEn}
                        onChange={(e) => handleSubjectChange(s.id, 'nameEn', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={s.code}
                        onChange={(e) => handleSubjectChange(s.id, 'code', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <select
                        value={s.coefficient}
                        onChange={(e) => handleSubjectChange(s.id, 'coefficient', parseInt(e.target.value))}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                      >
                        <option value={1}>x1</option>
                        <option value={2}>x2</option>
                        <option value={3}>x3</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(s.id)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Offline & Progressive Web App (PWA) Support */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ប្រព័ន្ធដំណើរការក្រៅបណ្ដាញ & PWA (Offline Support)' : 'Offline PWA Support & Cache'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km'
                  ? 'កម្មវិធីនេះគាំទ្រ Offline PWA ពេញលេញ អាចដំឡើងលើកុំព្យូទ័រ ទូរស័ព្ទដៃ និងដំណើរការដោយគ្មានអ៊ីនធឺណិត'
                  : 'Full offline Progressive Web App support — installable on desktop or mobile and works completely without internet'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isOnline 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'ភ្ជាប់អ៊ីនធឺណិត' : 'Online'}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'ក្រៅបណ្ដាញ (Offline)' : 'Offline Mode'}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'km' ? 'សុវត្ថិភាពទិន្នន័យ' : 'Data Persistence'}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'km' 
                  ? 'ទិន្នន័យពិន្ទុ និងវត្តមានត្រូវបានរក្សាទុកក្នុង Local Storage ដោយស្វ័យប្រវត្តិនឹងមិនបាត់បង់ឡើយ'
                  : 'All grades, rosters, and attendance are continuously cached in local storage safely'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                <HardDrive className="w-4 h-4" />
                <span>{language === 'km' ? 'Service Worker Caching' : 'Asset Caching'}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'km' 
                  ? 'ឯកសារ HTML, Script, Icon និងពុម្ពអក្សរខ្មែរ (Kantumruy Pro) ត្រូវបានផ្ទុកទុកក្នុង Cache ស្វ័យប្រវត្តិ'
                  : 'Precached UI bundle, scripts, Khmer typography, and symbols ready for zero-network use'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'km' ? 'ដំណើរការរលូន' : 'Zero Downtime'}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'km' 
                  ? 'លោកគ្រូ-អ្នកគ្រូអាចបើកកម្មវិធីវាយពិន្ទុនៅសាលាដាច់ស្រយាលដោយពុំចាំបាច់មាន WiFi ឬ 4G ឡើយ'
                  : 'Input scores, generate honor rolls, and calculate rankings even in remote areas'}
              </p>
            </div>
          </div>

          {/* In-App Install Prompt Banner */}
          <PWAInstallButton language={language} variant="banner" />
        </div>

        {/* Section 4: Yearly Data Backup & Restore Center */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 rounded-2xl p-5 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
              Master Backup & Archives
            </span>
            <h4 className="font-heading font-black text-sm text-white">
              {language === 'km' ? 'មជ្ឈមណ្ឌលបម្រុងទុក & ស្តារទិន្នន័យប្រចាំឆ្នាំ' : 'Yearly Data Backup & Restore Center'}
            </h4>
            <p className="text-xs text-indigo-200">
              {language === 'km'
                ? 'នាំចេញ/នាំចូល JSON ពេញលេញ បណ្ណសារប្រចាំឆ្នាំសិក្សា និងការផ្ទេរឡើងឆ្នាំថ្មី'
                : 'Export/import full JSON backups, manage yearly academic archives, and annual rollover'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('backup_restore')}
            className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-black text-xs hover:bg-indigo-50 transition cursor-pointer shadow-md whitespace-nowrap self-start sm:self-auto"
          >
            {language === 'km' ? 'បើកមជ្ឈមណ្ឌលបម្រុងទុក' : 'Open Backup Center'}
          </button>
        </div>

        {/* Section 5: Data Management & Reset */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div>
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
              {language === 'km' ? 'កំណត់ទិន្នន័យគំរូឡើងវិញ' : 'Reset to Original Data'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'km' ? 'កំណត់ទិន្នន័យគំរូថ្នាក់ទី៦(ក) ហ៊ុនណេងប្រទង ឡើងវិញទាំងអស់' : 'Restore original sample students, classes, and marks'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់កំណត់ឡើងវិញមែនទេ?' : 'Reset to original sample data?')) {
                resetToDefaults();
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-black transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'កំណត់ទិន្នន័យដើម' : 'Reset All'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
