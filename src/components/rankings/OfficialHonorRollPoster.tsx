import React, { useState, useRef } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student, SchoolProfile, ClassSection } from '../../types';
import { 
  Camera, 
  Upload, 
  Printer, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff, 
  Palette, 
  RefreshCw,
  Award,
  Trophy,
  User,
  Crown,
  BookOpen,
  Edit2
} from 'lucide-react';

export type HonorPosterThemeId = 
  | 'bee'             // Page 1: ឃ្មុំឧស្សាហ៍ (Cute Bee with golden wings)
  | 'kitten'          // Page 2: កូនឆ្មាគួរឱ្យស្រឡាញ់ (Cute Kitten Duo)
  | 'scholar'         // Page 3 & 7: សិស្សឧស្សាហ៍រៀនសូត្រ (Student with desk & pencil)
  | 'blue_ribbon'     // Page 15, 16, 17: ស៊ុមរូបថតបូខៀវ (Official Photo Frames & Blue Ribbons)
  | 'royal_gold'      // Page 8 & 13: ក្បាច់រចនាមាសខ្មែរ (Royal Khmer Gold Carvings)
  | 'angel_wings'     // Page 9: ស្លាបទេវតាមាស (Golden Angel Wings & Crimson Ribbon)
  | 'window'          // Page 5: បង្អួចចំណេះដឹង (Windows of Knowledge)
  | 'emerald_nature'; // Page 12: ស៊ុមមរកតធម្មជាតិ (Emerald Leaves & Wreaths)

interface HonorPosterTheme {
  id: HonorPosterThemeId;
  nameKm: string;
  nameEn: string;
  icon: string;
  borderColor: string;
  primaryGradient: string;
  bannerBg: string;
  bannerText: string;
  badgeBg: string;
  badgeText: string;
  titleColor: string;
  photoBorder: string;
}

const POSTER_THEMES: Record<HonorPosterThemeId, HonorPosterTheme> = {
  bee: {
    id: 'bee',
    nameKm: 'ឃ្មុំឧស្សាហ៍ (ទំព័រទី១)',
    nameEn: 'Diligent Bee (Page 1)',
    icon: '🐝',
    borderColor: '#eab308',
    primaryGradient: 'from-amber-400 via-yellow-300 to-amber-500',
    bannerBg: 'bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border-2 border-amber-400',
    bannerText: 'text-amber-950',
    badgeBg: 'bg-amber-500 text-white shadow-amber-300',
    badgeText: 'text-amber-950',
    titleColor: 'from-amber-600 via-yellow-500 to-orange-600',
    photoBorder: 'border-amber-400 ring-4 ring-amber-200 shadow-amber-200/50',
  },
  kitten: {
    id: 'kitten',
    nameKm: 'កូនឆ្មាគួរឱ្យស្រឡាញ់ (ទំព័រទី២)',
    nameEn: 'Cute Kittens (Page 2)',
    icon: '🐱',
    borderColor: '#f97316',
    primaryGradient: 'from-orange-400 via-rose-300 to-amber-400',
    bannerBg: 'bg-gradient-to-r from-rose-50 via-orange-50 to-rose-50 border-2 border-rose-300',
    bannerText: 'text-rose-950',
    badgeBg: 'bg-rose-500 text-white shadow-rose-300',
    badgeText: 'text-rose-950',
    titleColor: 'from-rose-600 via-orange-500 to-amber-600',
    photoBorder: 'border-rose-400 ring-4 ring-rose-200 shadow-rose-200/50',
  },
  scholar: {
    id: 'scholar',
    nameKm: 'សិស្សឧស្សាហ៍រៀនសូត្រ (ទំព័រទី៣/៧)',
    nameEn: 'Studious Scholar (Page 3/7)',
    icon: '📚',
    borderColor: '#0284c7',
    primaryGradient: 'from-sky-500 via-teal-400 to-indigo-500',
    bannerBg: 'bg-gradient-to-r from-sky-50 via-white to-sky-50 border-2 border-sky-400',
    bannerText: 'text-sky-950',
    badgeBg: 'bg-sky-600 text-white shadow-sky-300',
    badgeText: 'text-sky-950',
    titleColor: 'from-sky-700 via-indigo-600 to-teal-600',
    photoBorder: 'border-sky-500 ring-4 ring-sky-200 shadow-sky-200/50',
  },
  blue_ribbon: {
    id: 'blue_ribbon',
    nameKm: 'ស៊ុមរូបថតបូខៀវ (ទំព័រទី១៥-១៧)',
    nameEn: 'Photo Frames & Blue Ribbons (Page 15-17)',
    icon: '🎖️',
    borderColor: '#1d4ed8',
    primaryGradient: 'from-blue-600 via-indigo-500 to-cyan-500',
    bannerBg: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-500',
    bannerText: 'text-blue-950',
    badgeBg: 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-blue-300',
    badgeText: 'text-blue-950',
    titleColor: 'from-blue-700 via-indigo-600 to-blue-900',
    photoBorder: 'border-blue-600 ring-4 ring-blue-200 shadow-blue-200/50',
  },
  royal_gold: {
    id: 'royal_gold',
    nameKm: 'ក្បាច់រចនាមាសខ្មែរ (ទំព័រទី៨/១៣)',
    nameEn: 'Royal Khmer Gold (Page 8/13)',
    icon: '👑',
    borderColor: '#d97706',
    primaryGradient: 'from-amber-500 via-yellow-400 to-amber-600',
    bannerBg: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-500',
    bannerText: 'text-amber-950',
    badgeBg: 'bg-gradient-to-tr from-amber-500 to-yellow-600 text-white shadow-amber-300',
    badgeText: 'text-amber-950',
    titleColor: 'from-amber-700 via-yellow-600 to-amber-900',
    photoBorder: 'border-amber-500 ring-4 ring-amber-200 shadow-amber-200/50',
  },
  angel_wings: {
    id: 'angel_wings',
    nameKm: 'ស្លាបទេវតាមាស (ទំព័រទី៩)',
    nameEn: 'Golden Wings & Crimson Ribbon (Page 9)',
    icon: '🪽',
    borderColor: '#dc2626',
    primaryGradient: 'from-red-500 via-amber-400 to-red-600',
    bannerBg: 'bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border-2 border-red-400',
    bannerText: 'text-red-950',
    badgeBg: 'bg-gradient-to-tr from-red-600 to-amber-600 text-white shadow-red-300',
    badgeText: 'text-red-950',
    titleColor: 'from-red-600 via-amber-600 to-red-800',
    photoBorder: 'border-red-500 ring-4 ring-amber-200 shadow-red-200/50',
  },
  window: {
    id: 'window',
    nameKm: 'បង្អួចចំណេះដឹង (ទំព័រទី៥)',
    nameEn: 'Windows of Knowledge (Page 5)',
    icon: '🪟',
    borderColor: '#b45309',
    primaryGradient: 'from-amber-600 via-orange-400 to-amber-700',
    bannerBg: 'bg-gradient-to-r from-amber-100 via-white to-amber-100 border-2 border-amber-600',
    bannerText: 'text-amber-950',
    badgeBg: 'bg-amber-700 text-white shadow-amber-400',
    badgeText: 'text-amber-950',
    titleColor: 'from-amber-800 via-orange-700 to-amber-950',
    photoBorder: 'border-amber-700 ring-4 ring-amber-300 shadow-amber-300/50',
  },
  emerald_nature: {
    id: 'emerald_nature',
    nameKm: 'ស៊ុមមរកតធម្មជាតិ (ទំព័រទី១២)',
    nameEn: 'Emerald Leaves & Wreaths (Page 12)',
    icon: '🌿',
    borderColor: '#15803d',
    primaryGradient: 'from-emerald-500 via-green-400 to-teal-500',
    bannerBg: 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-2 border-emerald-400',
    bannerText: 'text-emerald-950',
    badgeBg: 'bg-emerald-600 text-white shadow-emerald-300',
    badgeText: 'text-emerald-950',
    titleColor: 'from-emerald-700 via-teal-600 to-green-800',
    photoBorder: 'border-emerald-500 ring-4 ring-emerald-200 shadow-emerald-200/50',
  },
};

interface OfficialHonorRollPosterProps {
  topStudents: Array<{
    student: Student;
    rank: number;
    totalPoints: number;
    average: number;
  }>;
  currentPeriodName: string;
  onOpenPhotoModal: (student: Student, rank: number) => void;
}

export const OfficialHonorRollPoster: React.FC<OfficialHonorRollPosterProps> = ({
  topStudents,
  currentPeriodName,
  onOpenPhotoModal,
}) => {
  const {
    language,
    activeClass,
    schoolProfile,
    updateStudent,
    showToast,
  } = useGradebook();

  // State for Theme selection
  const [currentThemeId, setCurrentThemeId] = useState<HonorPosterThemeId>(() => {
    const saved = localStorage.getItem('ls_official_honor_poster_theme');
    return (saved as HonorPosterThemeId) || 'blue_ribbon';
  });

  // State for display options
  const [showScores, setShowScores] = useState<boolean>(true);
  const [useDottedSignatures, setUseDottedSignatures] = useState<boolean>(true);
  
  // Custom editable text fields (matching the PDF template)
  const [districtText, setDistrictText] = useState<string>(
    schoolProfile?.district ? `ការិយាល័យ អ យក នៃរដ្ឋបាលស្រុក${schoolProfile.district.replace('ស្រុក', '')}` : 'ការិយាល័យ អ យក នៃរដ្ឋបាលស្រុកស្ទឹងត្រង់'
  );
  const [clusterText, setClusterText] = useState<string>('កម្រងអូរម្លូ');
  const [schoolText, setSchoolText] = useState<string>(schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង');
  const [gradeText, setGradeText] = useState<string>(activeClass?.nameKm || 'ថ្នាក់ទី៦(ក)');
  const [examPeriodText, setExamPeriodText] = useState<string>(
    currentPeriodName ? `ប្រឡងប្រចាំ${currentPeriodName}` : 'ប្រឡងប្រចាំខែមករា'
  );

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const theme = POSTER_THEMES[currentThemeId] || POSTER_THEMES.blue_ribbon;

  const handleThemeChange = (newTheme: HonorPosterThemeId) => {
    setCurrentThemeId(newTheme);
    localStorage.setItem('ls_official_honor_poster_theme', newTheme);
    showToast(
      language === 'km' 
        ? `បានប្ដូរស្ទីល៖ ${POSTER_THEMES[newTheme].nameKm}` 
        : `Theme changed to ${POSTER_THEMES[newTheme].nameEn}`,
      'info'
    );
  };

  // Direct file upload handler for any student slot
  const handleDirectPhotoUpload = (studentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(language === 'km' ? 'សូមជ្រើសរើសឯកសារជារូបភាព' : 'Please select an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        updateStudent(studentId, { photoUrl: dataUrl });
        showToast(
          language === 'km' ? 'បានបញ្ចូលរូបភាពសិស្សដោយជោគជ័យ' : 'Student photo updated successfully',
          'success'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    window.print();
  };

  // Mapping top 5 students into the 5 positions
  const rank1 = topStudents[0];
  const rank2 = topStudents[1];
  const rank3 = topStudents[2];
  const rank4 = topStudents[3];
  const rank5 = topStudents[4];

  // Khmer numerals for ranks
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥'];

  // Helper renderer for individual student slot
  const renderStudentSlot = (
    item: typeof topStudents[0] | undefined,
    positionRank: number,
    size: 'large' | 'standard' = 'standard'
  ) => {
    const rankKm = khmerNumbers[positionRank] || String(positionRank);
    const hasStudent = !!item;
    const student = item?.student;
    const hasPhoto = !!student?.photoUrl;

    const isLarge = size === 'large';
    const photoBoxWidth = isLarge ? 'w-28 sm:w-32' : 'w-24 sm:w-28';
    const photoBoxHeight = isLarge ? 'h-36 sm:h-40' : 'h-32 sm:h-36';

    return (
      <div className="flex flex-col items-center text-center relative group">
        {/* Hidden File Input for direct photo upload */}
        {student && (
          <input
            type="file"
            ref={(el) => (fileInputRefs.current[student.id] = el)}
            onChange={(e) => handleDirectPhotoUpload(student.id, e)}
            accept="image/*"
            className="hidden"
          />
        )}

        {/* Mascot / Decoration above the rank number badge */}
        <div className="relative -mb-4 z-20 flex flex-col items-center">
          {/* Top Rank Badge */}
          <div 
            className={`flex items-center justify-center font-black rounded-full border-2 border-white shadow-md ${
              isLarge 
                ? 'w-11 h-11 text-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-amber-950 ring-4 ring-amber-300' 
                : positionRank === 2
                ? 'w-9 h-9 text-base bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 ring-2 ring-slate-300'
                : positionRank === 3
                ? 'w-9 h-9 text-base bg-gradient-to-tr from-amber-600 to-amber-700 text-amber-100 ring-2 ring-amber-400'
                : 'w-9 h-9 text-base bg-gradient-to-tr from-indigo-600 to-blue-600 text-white ring-2 ring-blue-300'
            }`}
          >
            {rankKm}
          </div>
        </div>

        {/* Student Photo Frame (3:4 standard portrait ratio) */}
        <div 
          onClick={() => {
            if (student) {
              onOpenPhotoModal(student, positionRank);
            }
          }}
          title={hasStudent ? (language === 'km' ? 'ចុចដើម្បីបញ្ចូល ឬប្ដូររូបថតសិស្ស' : 'Click to upload or change photo') : undefined}
          className={`relative ${photoBoxWidth} ${photoBoxHeight} rounded-xl bg-white border-3 ${theme.photoBorder} shadow-lg overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group-hover:border-indigo-500`}
        >
          {hasPhoto ? (
            <img 
              src={student.photoUrl} 
              alt={student.name}
              className="w-full h-full object-cover object-top"
            />
          ) : hasStudent ? (
            <div className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-indigo-600 transition">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1 text-slate-400 border border-dashed border-slate-300">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 leading-tight">
                {language === 'km' ? '+ រូបថត' : '+ Photo'}
              </span>
              <span className="text-[8px] text-slate-400">
                {language === 'km' ? '(3x4)' : '(3x4)'}
              </span>
            </div>
          ) : (
            <div className="text-slate-300 text-xs font-bold p-2">
              {language === 'km' ? 'គ្មានទិន្នន័យ' : 'Empty'}
            </div>
          )}

          {/* Hover Overlay Button to Change Photo */}
          {hasStudent && (
            <div className="no-print absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2">
              <Camera className="w-6 h-6 text-yellow-300 animate-bounce" />
              <span className="text-[10px] font-black text-center leading-tight">
                {hasPhoto ? (language === 'km' ? 'ប្ដូររូបថត' : 'Change') : (language === 'km' ? 'បញ្ចូលរូបថត' : 'Upload')}
              </span>
            </div>
          )}
        </div>

        {/* Name Banner Box (Styled matching the PDF) */}
        <div className={`mt-2 w-44 sm:w-52 rounded-xl ${theme.bannerBg} px-3 py-1.5 shadow-sm text-center transition-all`}>
          {hasStudent ? (
            <div>
              <div className={`font-heading font-black text-sm sm:text-base ${theme.bannerText} truncate tracking-wide`}>
                {student.name}
              </div>
              
              {showScores && (
                <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] sm:text-[11px] font-bold text-slate-600 border-t border-slate-200/60 pt-0.5">
                  <span>ភេទ៖ <strong className="text-slate-900">{student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}</strong></span>
                  <span>•</span>
                  <span>មធ្យមភាគ៖ <strong className="text-indigo-700 font-mono">{item.average.toFixed(2)}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-400 py-1">
              {language === 'km' ? '--- ឈ្មោះសិស្ស ---' : '--- Student Name ---'}
            </div>
          )}
        </div>

        {/* Quick Upload Button for Non-print view */}
        {hasStudent && (
          <div className="no-print flex items-center gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRefs.current[student.id]?.click();
              }}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-50 flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Upload className="w-2.5 h-2.5 text-indigo-600" />
              <span>{hasPhoto ? 'ប្តូរ' : 'ជ្រើសរើសរូប'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPhotoModal(student, positionRank);
              }}
              className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
              <span>រូបតំណាង</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP CONTROL TOOLBAR (Hidden during printing) */}
      <div className="no-print bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        
        {/* Top Header of the Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h2 className="font-heading font-black text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                <span>{language === 'km' ? 'គំរូតារាងកិត្តិយសផ្លូវការ (Top 5)' : 'Official Top 5 Honor Roll Poster'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                  {language === 'km' ? 'ស្តង់ដារក្រសួងអប់រំ' : 'MoEYS Standard'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'ទម្រង់ផ្ទាំងរូបភាព A4 ដូចគំរូក្រសួងអប់រំ ដែលអាចបញ្ចូលរូបថតសិស្ស (3x4) និងបោះពុម្ពបានយ៉ាងស្រស់ស្អាត' 
                  : 'Official MoEYS A4 Portrait layout with student photo slots (3x4) and instant printing.'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Print & PDF */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 flex items-center space-x-2 cursor-pointer transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'km' ? 'បោះពុម្ពតារាងកិត្តិយស (A4)' : 'Print Honor Roll (A4)'}</span>
            </button>
          </div>
        </div>

        {/* Theme Picker Grid (Matching the User's 18-page PDF Styles) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'km' ? 'ជ្រើសរើសស្ទីលតាមគំរូ PDF (១៨ ទំព័រ)៖' : 'Choose Theme from PDF Sample:'}</span>
            </span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {theme.nameKm}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {(Object.keys(POSTER_THEMES) as HonorPosterThemeId[]).map((tid) => {
              const t = POSTER_THEMES[tid];
              const isSelected = currentThemeId === tid;

              return (
                <button
                  key={tid}
                  onClick={() => handleThemeChange(tid)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-400 dark:bg-indigo-600 dark:border-indigo-500' 
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[10px] font-black leading-tight line-clamp-1">
                    {t.nameKm.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Toggles & Quick Customization */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showScores} 
                onChange={(e) => setShowScores(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>{language === 'km' ? 'បង្ហាញពិន្ទុ & មធ្យមភាគលើប័ណ្ណឈ្មោះ' : 'Show score & average on badge'}</span>
            </label>

            <label className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useDottedSignatures} 
                onChange={(e) => setUseDottedSignatures(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>{language === 'km' ? 'បន្ទាត់ចុចសម្រាប់ចុះហត្ថលេខា & ត្រាផ្ទាល់ដៃ' : 'Dotted lines for physical signing & stamping'}</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            💡 {language === 'km' ? 'អ្នកអាចចុចលើកន្លែងរូបថត ឬអក្សរដើម្បីកែសម្រួលផ្ទាល់លើក្រដាស' : 'You can click on photo slots or text to edit in-place'}
          </div>
        </div>

      </div>

      {/* 2. THE OFFICIAL A4 HONOR ROLL POSTER CONTAINER (Matching PDF screenshots) */}
      <div className="flex justify-center">
        <div 
          id="official-honor-poster-a4"
          className="w-full max-w-[820px] bg-white text-slate-900 shadow-2xl rounded-2xl print:rounded-none print:shadow-none p-6 sm:p-10 relative overflow-hidden transition-all duration-300 print:p-8 print:w-full print:max-w-none print:m-0"
          style={{
            minHeight: '1100px',
            fontFamily: "'Kantumruy Pro', 'Outfit', sans-serif",
          }}
        >
          {/* TRADITIONAL CAMBODIAN ORNATE FLORAL BORDER (Matching PDF) */}
          <div 
            className="absolute inset-2 sm:inset-3.5 border-4 rounded-xl pointer-events-none"
            style={{
              borderColor: theme.borderColor,
              borderStyle: 'double',
              borderWidth: '6px',
            }}
          >
            {/* Corner Decorative Ornaments (Traditional Khmer Rosettes) */}
            <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-amber-500 border-2 border-red-600 flex items-center justify-center text-[10px] text-white shadow-xs">❖</div>
            <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-amber-500 border-2 border-red-600 flex items-center justify-center text-[10px] text-white shadow-xs">❖</div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-amber-500 border-2 border-red-600 flex items-center justify-center text-[10px] text-white shadow-xs">❖</div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-amber-500 border-2 border-red-600 flex items-center justify-center text-[10px] text-white shadow-xs">❖</div>
            
            {/* Fine Inner Decorative Border Line */}
            <div className="absolute inset-1.5 border border-amber-600/40 rounded-lg"></div>
          </div>

          {/* INNER POSTER CONTENT */}
          <div className="relative z-10 p-2 sm:p-4">
            
            {/* A. NATIONAL MOTTO (Top Center) */}
            <div className="text-center">
              <h2 className="font-heading font-black text-base sm:text-lg text-slate-900 tracking-wide">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h2>
              <h3 className="font-heading font-bold text-sm sm:text-base text-slate-800">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </h3>
              {/* Traditional Curved Underline Motif */}
              <div className="flex items-center justify-center gap-1.5 text-amber-600 text-xs font-serif my-0.5">
                <span>~~~</span>
                <span>៚</span>
                <span>~~~</span>
              </div>
            </div>

            {/* B. ADMINISTRATIVE DETAILS (Top Left) */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 text-xs font-bold text-slate-800 gap-1">
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    value={districtText}
                    onChange={(e) => setDistrictText(e.target.value)}
                    className="bg-transparent border-b border-dotted border-slate-400 focus:border-indigo-600 focus:bg-indigo-50/50 outline-none w-full text-slate-800 font-bold"
                  />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="shrink-0">កម្រង</span>
                  <input
                    type="text"
                    value={clusterText}
                    onChange={(e) => setClusterText(e.target.value)}
                    className="bg-transparent border-b border-dotted border-slate-400 focus:border-indigo-600 focus:bg-indigo-50/50 outline-none w-full text-slate-800 font-bold"
                  />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="shrink-0">សាលាបឋមសិក្សា</span>
                  <input
                    type="text"
                    value={schoolText}
                    onChange={(e) => setSchoolText(e.target.value)}
                    className="bg-transparent border-b border-dotted border-slate-400 focus:border-indigo-600 focus:bg-indigo-50/50 outline-none w-full text-slate-800 font-bold"
                  />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="shrink-0">ថ្នាក់ទី</span>
                  <input
                    type="text"
                    value={gradeText}
                    onChange={(e) => setGradeText(e.target.value)}
                    className="bg-transparent border-b border-dotted border-slate-400 focus:border-indigo-600 focus:bg-indigo-50/50 outline-none w-full text-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Right side academic year info */}
              <div className="text-right text-xs text-slate-600 font-bold space-y-1 sm:pt-1">
                <p>ឆ្នាំសិក្សា៖ <strong className="text-slate-900 font-mono text-sm">{activeClass?.academicYear || '២០២៦-២០២៧'}</strong></p>
                <p className="text-[11px] text-slate-500">
                  {schoolProfile?.province || 'ខេត្តកំពង់ចាម'}
                </p>
              </div>
            </div>

            {/* C. MAIN POSTER TITLE: "តារាងកិត្តិយស" (Stylized 3D Decorative Typography) */}
            <div className="text-center my-6">
              <h1 
                className="font-heading font-black text-4xl sm:text-5xl uppercase tracking-wider select-none"
                style={{
                  color: '#1e3a8a',
                  textShadow: `
                    2px 2px 0 #fbbf24,
                    -2px -2px 0 #fbbf24,
                    2px -2px 0 #fbbf24,
                    -2px 2px 0 #fbbf24,
                    4px 4px 0 #b45309,
                    0 0 15px rgba(251, 191, 36, 0.4)
                  `,
                }}
              >
                តារាងកិត្តិយស
              </h1>

              {/* Subtitle: "ប្រឡងប្រចាំខែ..." */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={examPeriodText}
                  onChange={(e) => setExamPeriodText(e.target.value)}
                  className="text-center text-lg sm:text-xl font-heading font-black text-blue-900 bg-transparent border-b-2 border-dotted border-blue-400 focus:border-blue-700 outline-none px-2 py-0.5 max-w-sm"
                />
              </div>
            </div>

            {/* D. THE 5 STUDENT SLOTS IN PODIUM LAYOUT (Matching PDF Layout) */}
            <div className="mt-6 space-y-6">
              
              {/* 1. TOP CENTER: RANK 1 (លេខ ១) */}
              <div className="flex justify-center">
                {renderStudentSlot(rank1, 1, 'large')}
              </div>

              {/* 2. MIDDLE ROW: RANK 2 (លេខ ២ - Left) & RANK 3 (លេខ ៣ - Right) */}
              <div className="grid grid-cols-2 gap-4 sm:gap-12 px-2 sm:px-8">
                <div className="flex justify-center">
                  {renderStudentSlot(rank2, 2, 'standard')}
                </div>
                <div className="flex justify-center">
                  {renderStudentSlot(rank3, 3, 'standard')}
                </div>
              </div>

              {/* 3. BOTTOM ROW: RANK 4 (លេខ ៤ - Left) & RANK 5 (លេខ ៥ - Right) */}
              <div className="grid grid-cols-2 gap-4 sm:gap-12 px-2 sm:px-8">
                <div className="flex justify-center">
                  {renderStudentSlot(rank4, 4, 'standard')}
                </div>
                <div className="flex justify-center">
                  {renderStudentSlot(rank5, 5, 'standard')}
                </div>
              </div>

            </div>

            {/* E. OFFICIAL BOTTOM SIGNATURES (Matching PDF Bottom Layout) */}
            <div className="mt-14 pt-4 grid grid-cols-2 text-xs font-semibold text-slate-800">
              
              {/* Left Side: Principal Approval */}
              <div className="text-center space-y-1">
                <p className="font-bold text-slate-900">បានឃើញ និងឯកភាព</p>
                {useDottedSignatures ? (
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p>ថ្ងៃ................ខែ..............ឆ្នាំ...............ព.ស២៥៦.....</p>
                    <p>.........ត្រូវនឹងថ្ងៃទី........ខែ.........ឆ្នាំ២០.......</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600">
                    ថ្ងៃទី........ ខែ............... ឆ្នាំ២០២៦
                  </p>
                )}
                
                <p className="font-black text-sm text-slate-900 pt-1">
                  នាយកសាលា
                </p>
                
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-normal italic">
                    (ហត្ថលេខា និងត្រា)
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-xs">
                  {schoolProfile?.principalNameKm || '...........................................'}
                </p>
              </div>

              {/* Right Side: Homeroom Teacher */}
              <div className="text-center space-y-1">
                {useDottedSignatures ? (
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p>ថ្ងៃ................ខែ..............ឆ្នាំ...............ព.ស២៥៦.....</p>
                    <p>.........ត្រូវនឹងថ្ងៃទី........ខែ.........ឆ្នាំ២០.......</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600">
                    ថ្ងៃទី........ ខែ............... ឆ្នាំ២០២៦
                  </p>
                )}

                <p className="font-black text-sm text-slate-900 pt-1">
                  គ្រូទទួលបន្ទុកថ្នាក់
                </p>

                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-normal italic">
                    (ហត្ថលេខា)
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-xs">
                  {activeClass?.teacherNameKm || 'លោកគ្រូ សុខ សម្ភស្ស'}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
