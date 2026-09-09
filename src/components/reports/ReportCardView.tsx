import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Eye,
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Calendar, 
  Brain,
  HeartHandshake,
  UserCheck,
  BookOpen,
  CalendarDays,
  FileCheck2,
  SlidersHorizontal,
  Send,
  PenLine,
  Check,
  RotateCcw,
  AlertCircle,
  Stamp as StampIcon,
  Layers,
  Sparkles,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { calculatePeriodRankings, calculateYearlySummaries, formatConductRating } from '../../utils/calculations';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { TelegramShareModal } from '../common/TelegramShareModal';
import { PrintOptionsModal, ReportPrintOptions, DEFAULT_PRINT_OPTIONS } from './PrintOptionsModal';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import { OfficialSchoolStamp } from './OfficialSchoolStamp';
import { ReportLayoutConfigPanel } from './ReportLayoutConfigPanel';
import { 
  ReportLayoutConfig, 
  DEFAULT_REPORT_LAYOUT_CONFIG, 
  MOEYS_LAYOUT_STYLES 
} from './reportLayoutTypes';
import { MultiPillarStudentReportModal } from './MultiPillarStudentReportModal';
import { exportSingleStudentMultiSheetExcel, exportAllStudentsClassWorkbook } from '../../utils/multiSheetExcelExport';

// Khmer numerals mapping
const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

const toKhmerNumber = (val: string | number): string => {
  return String(val).replace(/[0-9]/g, (d) => KHMER_DIGITS[parseInt(d, 10)] || d);
};

const KHMER_MONTHS_MAP: Record<string, string> = {
  '01': 'មករា', '02': 'កុម្ភៈ', '03': 'មីនា', '04': 'មេសា',
  '05': 'ឧសភា', '06': 'មិថុនា', '07': 'កក្កដា', '08': 'សីហា',
  '09': 'កញ្ញា', '10': 'តុលា', '11': 'វិច្ឆិកា', '12': 'ធ្នូ',
  'jan': 'មករា', 'feb': 'កុម្ភៈ', 'mar': 'មីនា', 'apr': 'មេសា',
  'may': 'ឧសភា', 'jun': 'មិថុនា', 'jul': 'កក្កដា', 'aug': 'សីហា',
  'sep': 'កញ្ញា', 'oct': 'តុលា', 'nov': 'វិច្ឆិកា', 'dec': 'ធ្នូ',
};

const solarDateToIso = (solarDate?: string): string => {
  if (!solarDate) return '';
  const solarMatch = solarDate.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (solarMatch) {
    const [, day, mon, year] = solarMatch;
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIndex = months.indexOf(mon.toLowerCase());
    if (mIndex >= 0) {
      const mStr = String(mIndex + 1).padStart(2, '0');
      const dStr = String(parseInt(day, 10)).padStart(2, '0');
      return `${year}-${mStr}-${dStr}`;
    }
  }
  return '';
};

const formatKhmerDateString = (dateInput: string): string => {
  if (!dateInput) return 'ថ្ងៃទី......... ខែ......... ឆ្នាំ២០២...';
  
  const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const monthName = KHMER_MONTHS_MAP[month] || month;
    const dayKm = toKhmerNumber(parseInt(day, 10));
    const yearKm = toKhmerNumber(year);
    return `ថ្ងៃទី${dayKm} ខែ${monthName} ឆ្នាំ${yearKm}`;
  }

  const solarMatch = dateInput.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (solarMatch) {
    const [, day, mon, year] = solarMatch;
    const monthName = KHMER_MONTHS_MAP[mon.toLowerCase()] || mon;
    const dayKm = toKhmerNumber(parseInt(day, 10));
    const yearKm = toKhmerNumber(year);
    return `ថ្ងៃទី${dayKm} ខែ${monthName} ឆ្នាំ${yearKm}`;
  }

  return dateInput;
};

export const ReportCardView: React.FC = () => {
  const {
    language,
    activeClass,
    classStudents,
    subjects,
    periods,
    scoresMatrix,
    weights,
    competencyWeights,
    gradeScales,
    schoolProfile,
    selectedStudentId,
    setSelectedStudentId,
  } = useGradebook();

  const [reportMode, setReportMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(periods[0]?.id || 'month_dec');
  const [batchPrintMode, setBatchPrintMode] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isMultiPillarModalOpen, setIsMultiPillarModalOpen] = useState(false);

  const handleExportSingleStudentExcel = () => {
    if (!currentStudent) return;
    exportSingleStudentMultiSheetExcel({
      student: currentStudent,
      periods,
      subjects,
      scoresMatrix,
      weights,
      schoolProfile,
      activeClass,
    });
  };

  const handleExportClassExcel = () => {
    exportAllStudentsClassWorkbook(
      classStudents,
      periods,
      subjects,
      scoresMatrix,
      weights,
      schoolProfile,
      activeClass
    );
  };

  // Date management per period and yearly
  const classId = activeClass?.id || 'default';
  const DATE_STORAGE_KEY = `moeys_report_dates_${classId}`;

  const [dateSettings, setDateSettings] = useState<Record<string, { isoDate: string; customText?: string }>>(() => {
    try {
      const saved = localStorage.getItem(DATE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [editInputText, setEditInputText] = useState('');

  const [printOptions, setPrintOptions] = useState<ReportPrintOptions>(() => {
    try {
      const saved = localStorage.getItem('moeys_report_print_options');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PRINT_OPTIONS;
  });

  const handlePrintOptionsChange = (newOptions: ReportPrintOptions) => {
    setPrintOptions(newOptions);
    try {
      localStorage.setItem('moeys_report_print_options', JSON.stringify(newOptions));
    } catch {
      // ignore
    }
  };

  // MoEYS Layout Styles & Official Stamp Configuration
  const [layoutConfig, setLayoutConfig] = useState<ReportLayoutConfig>(() => {
    try {
      const saved = localStorage.getItem('moeys_report_layout_config');
      if (saved) return { ...DEFAULT_REPORT_LAYOUT_CONFIG, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_REPORT_LAYOUT_CONFIG;
  });

  const [isLayoutConfigOpen, setIsLayoutConfigOpen] = useState(false);

  const handleLayoutConfigChange = (newConfig: ReportLayoutConfig) => {
    setLayoutConfig(newConfig);
    try {
      localStorage.setItem('moeys_report_layout_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  const yearlySummaries = calculateYearlySummaries(
    classStudents,
    periods,
    subjects,
    scoresMatrix,
    weights,
    gradeScales,
    competencyWeights
  );

  const periodRankings = calculatePeriodRankings(
    classStudents,
    selectedPeriodId,
    subjects,
    scoresMatrix,
    weights,
    competencyWeights
  );

  const activeStudentId = selectedStudentId || classStudents[0]?.id;
  const currentStudent = classStudents.find(s => s.id === activeStudentId) || classStudents[0];
  const currentSummary = yearlySummaries.find(s => s.student.id === activeStudentId) || yearlySummaries[0];
  const currentMonthlyRanking = periodRankings.find(r => r.student.id === activeStudentId) || periodRankings[0];
  const currentPeriod = periods.find(p => p.id === selectedPeriodId) || periods[0];

  const currentIndex = classStudents.findIndex(s => s.id === activeStudentId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(classStudents[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < classStudents.length - 1) {
      setSelectedStudentId(classStudents[currentIndex + 1].id);
    }
  };

  const handlePrint = (all = false) => {
    setBatchPrintMode(all);
    setTimeout(() => {
      window.print();
      setBatchPrintMode(false);
    }, 250);
  };

  const getLetterGrade = (avg: number) => {
    const percentage = avg * 10;
    const matched = gradeScales.find(s => percentage >= s.minPercentage);
    if (matched && ['A', 'B', 'C', 'D', 'E', 'F'].includes(matched.grade)) {
      return matched.grade;
    }
    if (avg >= 8.5) return 'A';
    if (avg >= 7.5) return 'B';
    if (avg >= 6.5) return 'C';
    if (avg >= 6.0) return 'D';
    if (avg >= 5.0) return 'E';
    return 'F';
  };

  if (!currentStudent) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 font-bold">{language === 'km' ? 'មិនមានទិន្នន័យសិស្សឡើយ' : 'No students found.'}</p>
      </div>
    );
  }

  // Current active period key or 'yearly'
  const currentTargetKey = reportMode === 'monthly' ? selectedPeriodId : 'yearly';
  const savedDateConfig = dateSettings[currentTargetKey];

  // Default ISO string
  const defaultIso = reportMode === 'monthly'
    ? (solarDateToIso(currentPeriod?.solarDate) || '2026-01-31')
    : '2026-08-25';

  const currentIsoDate = savedDateConfig?.isoDate || defaultIso;
  const currentCustomText = savedDateConfig?.customText;
  const effectiveDateDisplay = currentCustomText !== undefined && currentCustomText !== ''
    ? currentCustomText
    : formatKhmerDateString(currentIsoDate);

  const saveDateForCurrent = (iso: string, text?: string) => {
    const updated = {
      ...dateSettings,
      [currentTargetKey]: {
        isoDate: iso,
        customText: text !== undefined ? text : (iso ? formatKhmerDateString(iso) : undefined),
      }
    };
    setDateSettings(updated);
    try {
      localStorage.setItem(DATE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // ==========================================
  // 1. RENDER MONTHLY RESULT & PARENT SIGNATURE SLIP
  // ==========================================
  const renderMonthlyReportCard = (
    studentRanking?: typeof currentMonthlyRanking, 
    customOptions?: ReportPrintOptions,
    customLayout?: ReportLayoutConfig
  ) => {
    if (!studentRanking || !studentRanking.student) return null;
    const activeOpts = customOptions || printOptions;
    const activeLayout = customLayout || layoutConfig;
    const stu = studentRanking.student;
    const khmerScores = scoresMatrix[stu.id]?.[selectedPeriodId]?.['sub_khmer'] || {};
    const kr = khmerScores.khmerReading ?? khmerScores.rawScore ?? 8.0;
    const kw = khmerScores.khmerWriting ?? ((khmerScores.khmerDictation !== undefined || khmerScores.khmerComposition !== undefined) ? ((khmerScores.khmerDictation ?? 8.0) + (khmerScores.khmerComposition ?? 8.0)) / 2 : (khmerScores.rawScore ?? 8.0));
    const kl = khmerScores.khmerListening ?? khmerScores.rawScore ?? 8.0;
    const ks = khmerScores.khmerSpeaking ?? khmerScores.rawScore ?? 8.0;
    const khmerAvg = Number(((kr + kw + kl + ks) / 4).toFixed(1));

    const mathScores = scoresMatrix[stu.id]?.[selectedPeriodId]?.['sub_math'] || {};
    const kn = mathScores.mathNumbers ?? mathScores.mathAlgebra ?? mathScores.rawScore ?? 8.0;
    const ka = mathScores.mathAlgebra ?? mathScores.rawScore ?? 8.0;
    const km_val = mathScores.mathMeasurement ?? mathScores.rawScore ?? 8.0;
    const kg = mathScores.mathGeometry ?? mathScores.rawScore ?? 8.0;
    const kst = mathScores.mathStatistics ?? mathScores.rawScore ?? 8.0;
    const mathAvg = Number(((kn + ka + km_val + kg + kst) / 5).toFixed(1));

    const letterGrade = getLetterGrade(studentRanking.average);

    // Layout configuration styles
    let containerClasses = "bg-white rounded-2xl border border-slate-300 p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-2 mb-8 page-break-inside-avoid text-slate-900 printable-area relative overflow-hidden";

    if (activeLayout.layoutStyle === 'standard') {
      containerClasses = "bg-white rounded-2xl border-2 border-slate-900 p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-2 mb-8 page-break-inside-avoid text-slate-900 printable-area relative overflow-hidden";
    } else if (activeLayout.layoutStyle === 'modern') {
      containerClasses = "bg-white rounded-3xl border border-indigo-200/80 p-6 sm:p-10 shadow-lg shadow-indigo-100/50 print:border-none print:shadow-none print:p-2 mb-8 page-break-inside-avoid text-slate-900 printable-area relative overflow-hidden";
    } else if (activeLayout.layoutStyle === 'compact_booklet') {
      containerClasses = "bg-white rounded-xl border border-slate-400 p-3 sm:p-5 shadow-2xs print:border-none print:shadow-none print:p-1 mb-6 page-break-inside-avoid text-slate-900 printable-area text-xs relative max-w-3xl mx-auto overflow-hidden";
    } else if (activeLayout.layoutStyle === 'honor_formal') {
      containerClasses = "bg-white rounded-2xl border-4 border-double border-amber-600 p-6 sm:p-10 shadow-xl print:border-4 print:border-amber-700 print:p-3 mb-8 page-break-inside-avoid text-slate-900 printable-area relative ring-1 ring-amber-400/50 overflow-hidden";
    }

    const logoPixelSize = activeLayout.logoSize === 'sm' ? 36 : activeLayout.logoSize === 'lg' ? 56 : 46;
    const effectiveLogoUrl = activeLayout.customLogoUrl || schoolProfile?.logoUrl || activeClass?.logoUrl;

    const periodMonthDisplay = (() => {
      const p = currentPeriod?.nameKm?.trim() || '';
      if (!p) return 'ខែ';
      if (p.startsWith('ខែ') || p.startsWith('ប្រឡង') || p.startsWith('ឆមាស')) {
        return p;
      }
      return `ខែ${p}`;
    })();

    const monthlyReportHeading = activeLayout.layoutStyle === 'honor_formal'
      ? (language === 'km' 
          ? (periodMonthDisplay.startsWith('ប្រឡង') || periodMonthDisplay.startsWith('ឆមាស')
              ? `សន្លឹកលទ្ធផលសិក្សាកិត្តិយស ${periodMonthDisplay}`
              : `សន្លឹកលទ្ធផលសិក្សាកិត្តិយសប្រចាំ${periodMonthDisplay}`)
          : `HONOR ROLL REPORT CARD - ${currentPeriod?.nameEn || periodMonthDisplay}`)
      : (language === 'km' 
          ? (periodMonthDisplay.startsWith('ប្រឡង') || periodMonthDisplay.startsWith('ឆមាស')
              ? `លទ្ធផលសិក្សា ${periodMonthDisplay}`
              : `លទ្ធផលសិក្សាប្រចាំ${periodMonthDisplay}`)
          : `STUDENT REPORT CARD - ${currentPeriod?.nameEn || periodMonthDisplay}`);

    return (
      <div 
        id={batchPrintMode ? `monthly-card-${stu.id}` : "active-report-card-container"}
        key={`monthly-${stu.id}-${selectedPeriodId}`} 
        className={containerClasses}
      >
        {/* Background Watermark & Seal */}
        {(activeLayout.showWatermark || activeLayout.stampPosition === 'center_watermark' || activeLayout.stampPosition === 'both') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
            {activeLayout.showWatermark && (
              <div className="opacity-[0.04] transform scale-150">
                <SchoolLogo size={320} customLogoUrl={effectiveLogoUrl} />
              </div>
            )}
            {(activeLayout.stampPosition === 'center_watermark' || activeLayout.stampPosition === 'both') && activeLayout.stampMode !== 'none' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <OfficialSchoolStamp
                  size={240}
                  customStampUrl={activeLayout.stampMode === 'custom' ? activeLayout.customStampUrl : undefined}
                  rotation={activeLayout.stampRotation}
                  opacity={0.06}
                  customText={activeLayout.stampText}
                  isWatermark={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Honor Formal Corner Badges */}
        {activeLayout.layoutStyle === 'honor_formal' && (
          <div className="absolute top-2 left-3 right-3 flex justify-between pointer-events-none text-amber-700 select-none text-xs font-serif z-1">
            <span>❖ ❖ ❖</span>
            <span className="tracking-widest text-[10px] uppercase font-black">
              កិត្តិយស & វិញ្ញាបនបត្រ
            </span>
            <span>❖ ❖ ❖</span>
          </div>
        )}

        {/* National Header with MoEYS / School Logo */}
        <div className={`text-center pb-4 mb-4 relative z-1 ${
          activeLayout.layoutStyle === 'honor_formal' 
            ? 'border-b-2 border-amber-600' 
            : activeLayout.layoutStyle === 'modern'
            ? 'border-b border-indigo-200'
            : 'border-b-2 border-slate-900'
        }`}>
          <div className="flex justify-between items-start text-xs font-semibold text-slate-700 mb-2">
            {/* Left Header: School Info and Logo */}
            <div className="text-left flex items-center space-x-2.5">
              {activeLayout.logoMode !== 'minimal' && (
                <SchoolLogo size={logoPixelSize} customLogoUrl={effectiveLogoUrl} />
              )}
              <div>
                <p className="font-extrabold text-slate-900 uppercase text-xs">
                  {language === 'km' ? (schoolProfile?.schoolNameKm || activeClass?.schoolNameKm) : (schoolProfile?.schoolName || activeClass?.schoolName)}
                </p>
                <p className="text-slate-500 font-medium text-[10px]">
                  {schoolProfile?.district || activeClass?.district || 'ស្រុកស្ទឹងត្រង់'} • {schoolProfile?.province || activeClass?.province || 'ខេត្តកំពង់ចាម'}
                </p>
                <p className="text-slate-600 font-bold text-[11px]">
                  {language === 'km' ? `ថ្នាក់ទី ${activeClass?.gradeLevel} (${activeClass?.nameKm})` : `Grade ${activeClass?.gradeLevel} (${activeClass?.name})`}
                </p>
              </div>
            </div>

            {/* Right Header: Kingdom of Cambodia */}
            <div className="text-right flex items-center space-x-2.5">
              <div>
                <p className="font-black text-slate-900 text-xs">
                  {language === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'Kingdom of Cambodia'}
                </p>
                <p className="text-slate-500 font-bold text-[11px]">
                  {language === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'Nation Religion King'}
                </p>
                <p className="text-[11px] text-amber-700 tracking-widest font-serif select-none leading-none mt-0.5">❖ ❖ ❖</p>
              </div>
            </div>
          </div>

          <h1 className={`font-heading font-black text-base sm:text-xl uppercase tracking-wide mt-1 ${
            activeLayout.layoutStyle === 'honor_formal' 
              ? 'text-amber-950' 
              : activeLayout.layoutStyle === 'modern'
              ? 'text-indigo-950'
              : 'text-slate-950'
          }`}>
            {monthlyReportHeading}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-2 text-xs font-black text-indigo-900 mt-0.5 uppercase tracking-wider">
            <span>ឆ្នាំសិក្សា {activeClass?.academicYear}</span>
            {currentPeriod?.lunarDateKm && (
              <span className="font-semibold text-slate-600 normal-case hidden sm:inline">
                • {currentPeriod.lunarDateKm}
              </span>
            )}
            {effectiveDateDisplay && effectiveDateDisplay !== 'ថ្ងៃទី......... ខែ......... ឆ្នាំ២០២...' && (
              <span className="font-bold text-slate-600 normal-case hidden sm:inline">
                • កាលបរិច្ឆេទចេញ៖ {effectiveDateDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-3.5 mb-5 text-xs sm:text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">គោត្តនាម និងនាម</span>
              <strong className="text-slate-950 text-base font-black">{stu.name}</strong>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">អត្តលេខ / ភេទ</span>
              <span className="font-mono font-black text-slate-800">{stu.studentId}</span>
              <span className="ml-2 font-bold text-slate-600">({stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'})</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">ថ្ងៃខែឆ្នាំកំណើត</span>
              <span className="font-bold text-slate-800">{stu.dob || '-'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">អាណាព្យាបាល / ទំនាក់ទំនង</span>
              <span className="font-bold text-slate-800">{stu.guardianName || '-'}</span>
              {stu.guardianPhone && <div className="text-xs text-slate-500">{stu.guardianPhone}</div>}
            </div>
          </div>
        </div>

        {/* Monthly Subject Scores Table with Sub-skills Breakdown */}
        <div className="overflow-x-auto mb-5">
          <div className="text-xs font-black text-slate-800 mb-2 flex items-center space-x-1.5 uppercase tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
            <span>{language === 'km' ? '១. លទ្ធផលមុខវិជ្ជាចំណេះដឹងទូទៅ (វិជ្ជាសម្បទា ៨០%)' : '1. Academic Subject Scores Breakdown (Knowledge 80%)'}</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] border-b border-slate-300">
              <tr>
                <th className="py-2 px-2.5 border-r border-slate-300 w-10 text-center">#</th>
                <th className="py-2 px-3 border-r border-slate-300 min-w-[130px]">{language === 'km' ? 'មុខវិជ្ជា' : 'Subject'}</th>
                {activeOpts.showSubSkills && (
                  <th className="py-2 px-3 border-r border-slate-300 min-w-[200px]">{language === 'km' ? 'ជំនាញរង / ផ្នែកលម្អិត' : 'Sub-skills Breakdown'}</th>
                )}
                <th className="py-2 px-3 text-center border-r border-slate-300 w-24 bg-indigo-50/50">{language === 'km' ? 'ពិន្ទុ/១០' : 'Score/10'}</th>
                <th className="py-2 px-3 text-center w-24">{language === 'km' ? 'និទ្ទេស' : 'Grade'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* 1. Khmer Language */}
              <tr className={`hover:bg-slate-50 transition ${khmerAvg < 5.0 ? 'bg-rose-50/40' : ''}`}>
                <td className="py-2 px-2.5 text-center font-bold text-slate-400 border-r border-slate-200">1</td>
                <td className="py-2 px-3 font-black text-slate-900 border-r border-slate-200">
                  <div className="flex items-center justify-between">
                    <span>{language === 'km' ? 'ភាសាខ្មែរ' : 'Khmer Language'}</span>
                    {khmerAvg < 5.0 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                        {language === 'km' ? 'ត្រូវការជំនួយ' : 'Needs Help'}
                      </span>
                    )}
                  </div>
                </td>
                {activeOpts.showSubSkills && (
                  <td className="py-2 px-3 text-[11px] text-slate-600 border-r border-slate-200">
                    <div className="flex flex-wrap gap-1 font-mono">
                      <span className={`px-1.5 py-0.5 rounded border transition ${kr < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-indigo-50 text-indigo-900 border-indigo-100'}`}>
                        {language === 'km' ? 'អាន' : 'Read'}: {kr}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border transition ${kw < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-indigo-50 text-indigo-900 border-indigo-100'}`}>
                        {language === 'km' ? 'សរសេរ' : 'Write'}: {kw}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border transition ${kl < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-indigo-50 text-indigo-900 border-indigo-100'}`}>
                        {language === 'km' ? 'ស្ដាប់' : 'Listen'}: {kl}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border transition ${ks < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-indigo-50 text-indigo-900 border-indigo-100'}`}>
                        {language === 'km' ? 'និយាយ' : 'Speak'}: {ks}
                      </span>
                    </div>
                  </td>
                )}
                <td className={`py-2 px-3 text-center font-black font-mono border-r border-slate-200 transition ${
                  khmerAvg < 5.0 
                    ? 'bg-rose-100/90 text-rose-700 border-rose-200' 
                    : 'text-indigo-900 bg-indigo-50/50'
                }`}>
                  {khmerAvg.toFixed(1)}
                </td>
                <td className={`py-2 px-3 text-center font-bold transition ${
                  khmerAvg < 5.0 ? 'bg-rose-50 text-rose-700 font-black' : 'text-slate-700'
                }`}>
                  {getLetterGrade(khmerAvg)}
                </td>
              </tr>

              {/* 2. Mathematics */}
              <tr className={`hover:bg-slate-50 transition ${mathAvg < 5.0 ? 'bg-rose-50/40' : ''}`}>
                <td className="py-2 px-2.5 text-center font-bold text-slate-400 border-r border-slate-200">2</td>
                <td className="py-2 px-3 font-black text-slate-900 border-r border-slate-200">
                  <div className="flex items-center justify-between">
                    <span>{language === 'km' ? 'គណិតវិទ្យា' : 'Mathematics'}</span>
                    {mathAvg < 5.0 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                        {language === 'km' ? 'ត្រូវការជំនួយ' : 'Needs Help'}
                      </span>
                    )}
                  </div>
                </td>
                {activeOpts.showSubSkills && (
                  <td className="py-2 px-3 text-[11px] text-slate-600 border-r border-slate-200">
                    <div className="flex flex-wrap gap-1 font-mono">
                      <span className={`px-1.5 py-0.5 rounded border transition ${kn < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-emerald-50 text-emerald-900 border-emerald-100'}`}>
                        {language === 'km' ? 'ចំនួន' : 'Num'}: {kn}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border transition ${ka < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-emerald-50 text-emerald-900 border-emerald-100'}`}>
                        {language === 'km' ? 'ពិជគណិត' : 'Alg'}: {ka}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border transition ${km_val < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-emerald-50 text-emerald-900 border-emerald-100'}`}>
                        {language === 'km' ? 'រង្វាស់' : 'Meas'}: {km_val}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border transition ${kg < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-emerald-50 text-emerald-900 border-emerald-100'}`}>
                        {language === 'km' ? 'ធរណី' : 'Geom'}: {kg}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border transition ${kst < 5.0 ? 'bg-rose-100/90 text-rose-800 border-rose-300 font-black' : 'bg-emerald-50 text-emerald-900 border-emerald-100'}`}>
                        {language === 'km' ? 'ស្ថិតិ' : 'Stat'}: {kst}
                      </span>
                    </div>
                  </td>
                )}
                <td className={`py-2 px-3 text-center font-black font-mono border-r border-slate-200 transition ${
                  mathAvg < 5.0 
                    ? 'bg-rose-100/90 text-rose-700 border-rose-200' 
                    : 'text-emerald-900 bg-emerald-50/50'
                }`}>
                  {mathAvg.toFixed(1)}
                </td>
                <td className={`py-2 px-3 text-center font-bold transition ${
                  mathAvg < 5.0 ? 'bg-rose-50 text-rose-700 font-black' : 'text-slate-700'
                }`}>
                  {getLetterGrade(mathAvg)}
                </td>
              </tr>

              {/* 3. Other Subjects */}
              {subjects.filter(s => s.id !== 'sub_khmer' && s.id !== 'sub_math').map((subj, sIdx) => {
                const rawScore = studentRanking.subjectScores[subj.id] ?? 8.0;
                const isBelowThreshold = rawScore < 5.0;

                return (
                  <tr key={subj.id} className={`hover:bg-slate-50 transition ${isBelowThreshold ? 'bg-rose-50/40' : ''}`}>
                    <td className="py-2 px-2.5 text-center font-bold text-slate-400 border-r border-slate-200">{sIdx + 3}</td>
                    <td className="py-2 px-3 font-black text-slate-900 border-r border-slate-200">
                      <div className="flex items-center justify-between">
                        <span>{language === 'km' ? subj.nameKm : subj.nameEn}</span>
                        {isBelowThreshold && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                            {language === 'km' ? 'ត្រូវការជំនួយ' : 'Needs Help'}
                          </span>
                        )}
                      </div>
                    </td>
                    {activeOpts.showSubSkills && (
                      <td className="py-2 px-3 text-slate-400 text-xs italic border-r border-slate-200">
                        {language === 'km' ? 'ការវាយតម្លៃបន្តប្រចាំខែ' : 'Monthly Continuous Evaluation'}
                      </td>
                    )}
                    <td className={`py-2 px-3 text-center font-bold border-r border-slate-200 font-mono transition ${
                      isBelowThreshold ? 'bg-rose-100/90 text-rose-700 font-black border-rose-200' : 'text-slate-900'
                    }`}>
                      {rawScore.toFixed(1)}
                    </td>
                    <td className={`py-2 px-3 text-center font-bold transition ${
                      isBelowThreshold ? 'bg-rose-50 text-rose-700 font-black' : 'text-slate-700'
                    }`}>
                      {getLetterGrade(rawScore)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Monthly Total & Average Footer */}
            <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300 text-[11px]">
              <tr>
                <td colSpan={activeOpts.showSubSkills ? 3 : 2} className="py-2.5 px-3 border-r border-slate-300 uppercase text-slate-800">
                  {language === 'km' ? 'ពិន្ទុសរុប និងមធ្យមភាគប្រចាំខែ (Monthly Total & Average)' : 'Monthly Total Points & Average'}
                </td>
                <td className={`py-2.5 px-3 text-center font-black font-mono border-r border-slate-300 text-sm transition ${
                  studentRanking.average < 5.0 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : 'text-indigo-950 bg-indigo-100/90'
                }`}>
                  {studentRanking.average.toFixed(2)} / 10
                </td>
                <td className={`py-2.5 px-3 text-center font-black transition ${
                  studentRanking.average < 5.0 
                    ? 'text-rose-800 bg-rose-50 border-rose-200' 
                    : 'text-emerald-800 bg-emerald-50/50'
                }`}>
                  {letterGrade}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Conditional Intervention Note below the Monthly Results Table */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-3 h-3 rounded bg-rose-100 border border-rose-300"></span>
              <span className="font-semibold">
                {language === 'km'
                  ? 'រំលេចពណ៌ក្រហមស្រាល = ពិន្ទុ < ៥.០ (ក្រោម ៥០%) សម្គាល់មុខវិជ្ជា/ជំនាញដែលសិស្សត្រូវការការអន្តរាគមន៍ និងជួយបំប៉នបន្ថែម'
                  : 'Soft Red Highlight = Score < 5.0 (< 50%) flags subjects/skills requiring teacher intervention & remedial support'}
              </span>
            </div>
            {(khmerAvg < 5.0 || mathAvg < 5.0 || subjects.some(s => (studentRanking.subjectScores[s.id] ?? 8.0) < 5.0) || studentRanking.average < 5.0) && (
              <span className="font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-200 text-[10px] flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{language === 'km' ? 'សិស្សនេះត្រូវការការយកចិត្តទុកដាក់អន្តរាគមន៍' : 'Intervention Needed'}</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Monthly Summary Highlights: Average, Total Points, Rank, Grade, Conduct, Absences */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-5">
          <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 text-center">
            <span className="text-indigo-900 text-[10px] block uppercase font-bold">{language === 'km' ? 'មធ្យមភាគប្រចាំខែ' : 'Monthly Avg'}</span>
            <strong className="text-xl font-black text-indigo-950 font-heading">
              {studentRanking.average.toFixed(2)}
            </strong>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'km' ? 'ពិន្ទុសរុប' : 'Total Points'}</span>
            <strong className="text-xl font-black text-slate-800 font-heading">
              {studentRanking.totalPoints.toFixed(1)}
            </strong>
          </div>

          {activeOpts.showRank && (
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-center">
              <span className="text-amber-900 text-[10px] block uppercase font-bold">{language === 'km' ? 'ចំណាត់ថ្នាក់' : 'Monthly Rank'}</span>
              <strong className="text-xl font-black text-amber-950 font-heading">
                #{studentRanking.rank} <span className="text-[10px] text-slate-500 font-normal">/ {classStudents.length}</span>
              </strong>
            </div>
          )}

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
            <span className="text-emerald-900 text-[10px] block uppercase font-bold">{language === 'km' ? 'និទ្ទេស' : 'Grade'}</span>
            <strong className="text-xl font-black text-emerald-800 font-heading">
              {letterGrade}
            </strong>
          </div>

          {activeOpts.showConduct && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'km' ? 'វិន័យ / សីលធម៌' : 'Conduct'}</span>
              <strong className="text-sm font-black text-slate-800 font-heading">
                {formatConductRating(stu.conductRating, language)}
              </strong>
            </div>
          )}

          {activeOpts.showAttendance && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'km' ? 'អវត្តមាន' : 'Absences'}</span>
              <strong className="text-sm font-bold text-slate-800 font-heading">
                {stu.attendanceCount?.absentUnexcused ? `${stu.attendanceCount.absentUnexcused} ថ្ងៃ` : (language === 'km' ? '០ ថ្ងៃ' : '0 Days')}
              </strong>
            </div>
          )}
        </div>

        {/* 4. Teacher's Evaluation & Parent Engagement Section (SIGNATURE BOX) */}
        {(activeOpts.showTeacherComments || activeOpts.showParentFeedback) && (
          <div className="border border-slate-300 rounded-xl p-4 mb-6 bg-slate-50/60 text-xs">
            {activeOpts.showTeacherComments && (
              <div className={activeOpts.showParentFeedback ? "mb-3" : ""}>
                <span className="font-black text-slate-900 block mb-1">
                  {language === 'km' ? 'មតិយោបល់ និងការណែនាំរបស់គ្រូបន្ទុកថ្នាក់៖' : 'Homeroom Teacher Remarks & Advice:'}
                </span>
                <p className="text-slate-700 italic">
                  "{stu.notes || (language === 'km' 
                    ? 'សិស្សមានការខិតខំប្រឹងប្រែងរៀនសូត្រ យកចិត្តទុកដាក់ស្តាប់ការពន្យល់ និងចូលរួមសកម្មភាពក្នុងថ្នាក់បានយ៉ាងល្អ។' 
                    : 'Diligent student with consistent classroom participation and good conduct throughout this month.')}"
                </p>
              </div>
            )}

            {activeOpts.showParentFeedback && (
              <div className={activeOpts.showTeacherComments ? "border-t border-slate-200 pt-3" : ""}>
                <span className="font-black text-slate-900 block mb-1">
                  {language === 'km' ? 'មតិយោបល់របស់មាតាបិតា ឬអាណាព្យាបាលសិស្ស៖' : 'Parent / Guardian Feedback & Notes:'}
                </span>
                <div className="h-6 border-b border-dashed border-slate-400"></div>
              </div>
            )}
          </div>
        )}

        {/* 5. Signatures Grid (Teacher, Principal, and Parent/Guardian Signature) */}
        {activeOpts.showSignatures && (
          <div className="mt-6 pt-4 grid grid-cols-3 text-center text-xs text-slate-700 gap-4 relative z-1">
            <div>
              <p className="font-bold text-slate-600 mb-0.5">
                {language === 'km' ? 'បានឃើញ និងឯកភាព' : 'Seen & Acknowledged'}
              </p>
              <p className="font-black text-slate-900 uppercase">
                {language === 'km' ? 'មាតាបិតា / អាណាព្យាបាល' : 'Parent / Guardian'}
              </p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-400">{language === 'km' ? '(ហត្ថលេខា និងឈ្មោះ)' : '(Signature & Name)'}</p>
            </div>

            <div>
              <div className="group relative inline-block">
                <p className="font-bold text-slate-800 mb-0.5 text-xs">
                  {effectiveDateDisplay}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditInputText(effectiveDateDisplay);
                    setIsCustomEditing(true);
                  }}
                  className="no-print opacity-0 group-hover:opacity-100 transition absolute -right-5 top-0 text-slate-400 hover:text-indigo-600 cursor-pointer p-0.5"
                  title={language === 'km' ? 'កែប្រែកាលបរិច្ឆេទ' : 'Edit Date'}
                >
                  <PenLine className="w-3 h-3" />
                </button>
              </div>
              <p className="font-black text-slate-900 uppercase">
                {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}
              </p>
              <div className="h-16 flex items-center justify-center relative">
                {activeLayout.teacherSignatureUrl && (
                  <img
                    src={activeLayout.teacherSignatureUrl}
                    alt="Teacher Signature"
                    className="max-h-12 object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <p className="font-black text-slate-900">
                {activeClass?.teacherNameKm || activeClass?.teacherName}
              </p>
            </div>

            <div className="relative">
              <p className="font-bold text-slate-600 mb-0.5">
                {language === 'km' ? 'បានឃើញ និងឯកភាព' : 'Approved By'}
              </p>
              <p className="font-black text-slate-900 uppercase">
                {language === 'km' ? 'នាយកសាលា' : 'Principal'}
              </p>
              <div className="h-16 flex items-end justify-center relative">
                {/* Principal Digital Signature */}
                {activeLayout.principalSignatureUrl && (
                  <img
                    src={activeLayout.principalSignatureUrl}
                    alt="Principal Signature"
                    className="max-h-12 object-contain absolute bottom-1 pointer-events-none z-1"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Official Red Rubber Stamp */}
                {activeLayout.showPrincipalStamp && activeLayout.stampMode !== 'none' && (activeLayout.stampPosition === 'principal' || activeLayout.stampPosition === 'both') && (
                  <div className="absolute -top-6 right-1/2 translate-x-1/2 sm:translate-x-1/3 pointer-events-none z-10">
                    <OfficialSchoolStamp
                      size={Math.round(activeLayout.stampScale * 1.05)}
                      customStampUrl={activeLayout.stampMode === 'custom' ? activeLayout.customStampUrl : undefined}
                      rotation={activeLayout.stampRotation}
                      opacity={activeLayout.stampOpacity}
                      customText={activeLayout.stampText}
                    />
                  </div>
                )}

                {schoolProfile?.principalNameKm && (
                  <p className="font-bold text-slate-900 text-xs relative z-2">{schoolProfile.principalNameKm}</p>
                )}
              </div>
              <p className="font-bold text-slate-400">{language === 'km' ? '(ហត្ថលេខា និងត្រា)' : '(Signature & Stamp)'}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // 2. RENDER ANNUAL ACADEMIC TRANSCRIPT / REPORT CARD
  // ==========================================
  const renderYearlyReportCard = (
    summary?: typeof currentSummary, 
    customOptions?: ReportPrintOptions,
    customLayout?: ReportLayoutConfig
  ) => {
    if (!summary || !summary.student) return null;
    const activeOpts = customOptions || printOptions;
    const activeLayout = customLayout || layoutConfig;
    const stu = summary.student;
    const sem1Periods = periods.filter(p => p.semester === 1);
    const sem2Periods = periods.filter(p => p.semester === 2);

    // Layout configuration styles
    let containerClasses = "bg-white rounded-2xl border border-slate-300 p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-2 mb-8 page-break-inside-avoid text-slate-900 printable-area relative overflow-hidden";

    if (activeLayout.layoutStyle === 'standard') {
      containerClasses = "bg-white rounded-2xl border-2 border-slate-900 p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-2 mb-8 page-break-inside-avoid text-slate-900 printable-area relative overflow-hidden";
    } else if (activeLayout.layoutStyle === 'modern') {
      containerClasses = "bg-white rounded-3xl border border-indigo-200/80 p-6 sm:p-10 shadow-lg shadow-indigo-100/50 print:border-none print:shadow-none print:p-2 mb-8 page-break-inside-avoid text-slate-900 printable-area relative overflow-hidden";
    } else if (activeLayout.layoutStyle === 'compact_booklet') {
      containerClasses = "bg-white rounded-xl border border-slate-400 p-3.5 sm:p-5 shadow-2xs print:border-none print:shadow-none print:p-1 mb-6 page-break-inside-avoid text-slate-900 printable-area text-xs relative max-w-3xl mx-auto overflow-hidden";
    } else if (activeLayout.layoutStyle === 'honor_formal') {
      containerClasses = "bg-white rounded-2xl border-4 border-double border-amber-600 p-6 sm:p-10 shadow-xl print:border-4 print:border-amber-700 print:p-3 mb-8 page-break-inside-avoid text-slate-900 printable-area relative ring-1 ring-amber-400/50 overflow-hidden";
    }

    const logoPixelSize = activeLayout.logoSize === 'sm' ? 38 : activeLayout.logoSize === 'lg' ? 58 : 48;
    const effectiveLogoUrl = activeLayout.customLogoUrl || schoolProfile?.logoUrl || activeClass?.logoUrl;

    return (
      <div 
        id={batchPrintMode ? `yearly-card-${stu.id}` : "active-report-card-container"}
        key={`yearly-${stu.id}`} 
        className={containerClasses}
      >
        {/* Background Watermark & Seal */}
        {(activeLayout.showWatermark || activeLayout.stampPosition === 'center_watermark' || activeLayout.stampPosition === 'both') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
            {activeLayout.showWatermark && (
              <div className="opacity-[0.04] transform scale-150">
                <SchoolLogo size={340} customLogoUrl={effectiveLogoUrl} />
              </div>
            )}
            {(activeLayout.stampPosition === 'center_watermark' || activeLayout.stampPosition === 'both') && activeLayout.stampMode !== 'none' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <OfficialSchoolStamp
                  size={260}
                  customStampUrl={activeLayout.stampMode === 'custom' ? activeLayout.customStampUrl : undefined}
                  rotation={activeLayout.stampRotation}
                  opacity={0.06}
                  customText={activeLayout.stampText}
                  isWatermark={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Honor Formal Corner Badges */}
        {activeLayout.layoutStyle === 'honor_formal' && (
          <div className="absolute top-2 left-3 right-3 flex justify-between pointer-events-none text-amber-700 select-none text-xs font-serif z-1">
            <span>❖ ❖ ❖</span>
            <span className="tracking-widest text-[10px] uppercase font-black">
              កិត្តិយស & វិញ្ញាបនបត្រ
            </span>
            <span>❖ ❖ ❖</span>
          </div>
        )}

        {/* Top Header with School Logo */}
        <div className={`text-center pb-5 mb-5 relative z-1 ${
          activeLayout.layoutStyle === 'honor_formal' 
            ? 'border-b-2 border-amber-600' 
            : activeLayout.layoutStyle === 'modern'
            ? 'border-b border-indigo-200'
            : 'border-b-2 border-slate-900'
        }`}>
          <div className="flex justify-between items-start text-xs font-semibold text-slate-700 mb-2">
            {/* Left Header: School Info and Logo */}
            <div className="text-left flex items-center space-x-2.5">
              {activeLayout.logoMode !== 'minimal' && (
                <SchoolLogo size={logoPixelSize} customLogoUrl={effectiveLogoUrl} />
              )}
              <div>
                <p className="font-extrabold text-slate-900 uppercase text-xs">
                  {language === 'km' ? (schoolProfile?.schoolNameKm || activeClass?.schoolNameKm) : (schoolProfile?.schoolName || activeClass?.schoolName)}
                </p>
                <p className="text-slate-500 font-medium text-[10px]">
                  {schoolProfile?.district || activeClass?.district || 'ស្រុកស្ទឹងត្រង់'} • {schoolProfile?.province || activeClass?.province || 'ខេត្តកំពង់ចាម'}
                </p>
                <p className="text-slate-600 font-bold text-[11px]">{language === 'km' ? `ថ្នាក់ទី ${activeClass?.gradeLevel} (${activeClass?.nameKm})` : `Grade ${activeClass?.gradeLevel} (${activeClass?.name})`}</p>
              </div>
            </div>

            {/* Right Header: Kingdom of Cambodia */}
            <div className="text-right flex items-center space-x-2.5">
              <div>
                <p className="font-black text-slate-900 text-xs">
                  {language === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'Kingdom of Cambodia'}
                </p>
                <p className="text-slate-500 font-bold text-[11px]">
                  {language === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'Nation Religion King'}
                </p>
                <p className="text-[11px] text-amber-700 tracking-widest font-serif select-none leading-none mt-0.5">❖ ❖ ❖</p>
              </div>
            </div>
          </div>

          <h1 className={`font-heading font-extrabold text-lg sm:text-2xl uppercase tracking-wider mt-2 ${
            activeLayout.layoutStyle === 'honor_formal' 
              ? 'text-amber-950' 
              : activeLayout.layoutStyle === 'modern'
              ? 'text-indigo-950'
              : 'text-slate-900'
          }`}>
            {activeLayout.layoutStyle === 'honor_formal' ? 'សន្លឹកលទ្ធផលសិក្សាកិត្តិយសប្រចាំឆ្នាំ' : 'លទ្ធផលសិក្សាប្រចាំឆ្នាំ'}
          </h1>
          <p className="text-xs font-bold text-indigo-700 mt-1 uppercase">
            ឆ្នាំសិក្សា {activeClass?.academicYear} • សាលាបឋមសិក្សា (ក្រសួងអប់រំ យុវជន និងកីឡា)
          </p>
        </div>

        {/* Student Profile Overview Card */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 mb-6 text-xs sm:text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 text-[11px] block">គោត្តនាម និងនាម</span>
              <strong className="text-slate-900 text-base">{stu.name}</strong>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">អត្តលេខ / ភេទ</span>
              <span className="font-mono font-bold text-slate-800">{stu.studentId}</span>
              <span className="ml-2 font-medium text-slate-600">({stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'})</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">ថ្ងៃខែឆ្នាំកំណើត</span>
              <span className="font-medium text-slate-800">{stu.dob || '-'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">អាណាព្យាបាល</span>
              <span className="font-medium text-slate-800">{stu.guardianName || '-'}</span>
            </div>
          </div>
        </div>

        {/* 1. Academic Subject Knowledge Breakdown Table */}
        <div className="overflow-x-auto mb-6">
          <div className="text-xs font-black text-slate-700 mb-2 flex items-center space-x-1.5 uppercase tracking-wide">
            <Brain className="w-3.5 h-3.5 text-indigo-700" />
            <span>{language === 'km' ? '១. លទ្ធផលមុខវិជ្ជាចំណេះដឹង (វិជ្ជាសម្បទា)' : '1. Academic Subject Knowledge Breakdown'}</span>
          </div>
          <table className="w-full text-left text-xs sm:text-sm border border-slate-200">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">{language === 'km' ? 'មុខវិជ្ជា' : 'Subject'}</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-200">{language === 'km' ? 'ឆមាសទី ១' : 'Sem 1'}</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-200">{language === 'km' ? 'ឆមាសទី ២' : 'Sem 2'}</th>
                <th className="py-2.5 px-3 text-center bg-indigo-50 border-r border-slate-200">{language === 'km' ? 'ម.ប្រចាំឆ្នាំ' : 'Year Avg'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'km' ? 'ការវាយតម្លៃ' : 'Assessment'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjects.map(subj => {
                let sem1Sum = 0;
                sem1Periods.forEach(p => {
                  const entry = scoresMatrix[stu.id]?.[p.id]?.[subj.id];
                  sem1Sum += entry?.rawScore ?? (entry?.homework ?? 0);
                });
                const sem1SubjAvg = sem1Periods.length > 0 ? Number((sem1Sum / sem1Periods.length).toFixed(1)) : 0;

                let sem2Sum = 0;
                sem2Periods.forEach(p => {
                  const entry = scoresMatrix[stu.id]?.[p.id]?.[subj.id];
                  sem2Sum += entry?.rawScore ?? (entry?.homework ?? 0);
                });
                const sem2SubjAvg = sem2Periods.length > 0 ? Number((sem2Sum / sem2Periods.length).toFixed(1)) : 0;

                const yearlySubjAvg = Number(((sem1SubjAvg + sem2SubjAvg) / 2).toFixed(1));

                return (
                  <tr key={subj.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">
                      {language === 'km' ? subj.nameKm : subj.nameEn}
                    </td>
                    <td className="py-2 px-3 text-center font-medium border-r border-slate-200">
                      {sem1SubjAvg.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-center font-medium border-r border-slate-200">
                      {sem2SubjAvg.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-indigo-700 bg-indigo-50/40 border-r border-slate-200">
                      {yearlySubjAvg.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-center text-xs font-semibold text-slate-600">
                      {getLetterGrade(yearlySubjAvg)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <tr>
                <td className="py-2.5 px-3 border-r border-slate-200 uppercase">
                  {language === 'km' ? 'មធ្យមភាគវិជ្ជាសម្បទា (Knowledge Avg)' : 'Knowledge Average (80%)'}
                </td>
                <td className="py-2.5 px-3 text-center border-r border-slate-200">{summary.term1Knowledge.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-center border-r border-slate-200">{summary.term2Knowledge.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-center text-indigo-900 bg-indigo-100/70 text-sm font-black border-r border-slate-200">
                  {summary.yearlyKnowledge.toFixed(2)} / 10
                </td>
                <td className="py-2.5 px-3 text-center text-slate-600 font-bold">
                  {competencyWeights.knowledge}% {language === 'km' ? 'នៃពិន្ទុសរុប' : 'of Total'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 2. MoEYS 3-Pillars Evaluation */}
        {activeOpts.show3Pillars && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-indigo-700" />
                <span>{language === 'km' ? '២. លទ្ធផលវាយតម្លៃសម្បទា ៣ យ៉ាង (ស្តង់ដារក្រសួង MoEYS)' : '2. MoEYS 3-Pillar Competency Breakdown'}</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-700 font-bold">
                ({competencyWeights.knowledge}% + {competencyWeights.skill}% + {competencyWeights.attitude}%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-bold mb-1 flex items-center space-x-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'km' ? 'វិជ្ជាសម្បទា' : 'Knowledge'} ({competencyWeights.knowledge}%)</span>
                </div>
                <div className="text-base font-black text-indigo-900 font-mono">
                  {summary.yearlyKnowledge.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">/ 10</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-bold mb-1 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'km' ? 'បំណិនសម្បទា' : 'Skill'} ({competencyWeights.skill}%)</span>
                </div>
                <div className="text-base font-black text-emerald-700 font-mono">
                  {summary.yearlySkill.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">/ 10</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-bold mb-1 flex items-center space-x-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'km' ? 'ចរិយាសម្បទា' : 'Attitude'} ({competencyWeights.attitude}%)</span>
                </div>
                <div className="text-base font-black text-amber-700 font-mono">
                  {summary.yearlyAttitude.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">/ 10</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-900 text-white rounded-lg flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-indigo-200 font-black block">
                  {language === 'km' ? 'មធ្យមភាគប្រចាំឆ្នាំសរុប (ម.ប្រចាំឆ្នាំ)' : 'Final Annual Composite Average'}
                </span>
                <span className="text-xs text-indigo-100">
                  = ({summary.yearlyKnowledge.toFixed(2)} × {competencyWeights.knowledge}%) + ({summary.yearlySkill.toFixed(2)} × {competencyWeights.skill}%) + ({summary.yearlyAttitude.toFixed(2)} × {competencyWeights.attitude}%)
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono">
                {summary.yearlyAverage.toFixed(2)} / 10
              </div>
            </div>
          </div>
        )}

        {/* Summary Highlights: Rank, Attendance, Conduct, Decision */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {activeOpts.showRank && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-slate-500 text-[11px] block uppercase font-semibold">{language === 'km' ? 'ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ' : 'Yearly Rank'}</span>
              <strong className="text-xl font-extrabold text-indigo-700 font-heading">
                #{summary.yearlyRank} <span className="text-xs text-slate-400 font-normal">/ {classStudents.length}</span>
              </strong>
            </div>
          )}

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-slate-500 text-[11px] block uppercase font-semibold">{language === 'km' ? 'និទ្ទេសសរុប' : 'Final Grade'}</span>
            <strong className="text-xl font-extrabold text-emerald-600 font-heading">
              {summary.letterGrade}
            </strong>
          </div>

          {(activeOpts.showConduct || activeOpts.showAttendance) && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-slate-500 text-[11px] block uppercase font-semibold">
                {activeOpts.showConduct && activeOpts.showAttendance 
                  ? (language === 'km' ? 'វិន័យសីលធម៌ & វត្តមាន' : 'Conduct & Attendance')
                  : activeOpts.showConduct
                    ? (language === 'km' ? 'វិន័យ / សីលធម៌' : 'Conduct')
                    : (language === 'km' ? 'វត្តមាន' : 'Attendance')
                }
              </span>
              <strong className="text-base font-bold text-slate-800 font-heading">
                {activeOpts.showConduct && activeOpts.showAttendance 
                  ? `${formatConductRating(stu.conductRating, language)} (${summary.attendanceRate}%)`
                  : activeOpts.showConduct
                    ? formatConductRating(stu.conductRating, language)
                    : `${summary.attendanceRate}%`
                }
              </strong>
            </div>
          )}

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-slate-500 text-[11px] block uppercase font-semibold">{language === 'km' ? 'សេចក្តីសម្រេច' : 'Decision'}</span>
            <strong className={`text-base font-bold font-heading ${summary.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
              {summary.passed ? (language === 'km' ? '✅ ឡើងថ្នាក់' : '✅ Promoted') : (language === 'km' ? '❌ ត្រួតថ្នាក់' : '❌ Retained')}
            </strong>
          </div>
        </div>

        {/* Teacher Feedback & Remarks */}
        {activeOpts.showTeacherComments && (
          <div className="border border-slate-200 rounded-xl p-4 mb-6 bg-slate-50/50 text-xs sm:text-sm">
            <span className="font-bold text-slate-800 block mb-1">
              {language === 'km' ? 'មតិយោបល់ និងការវាយតម្លៃរបស់គ្រូបន្ទុកថ្នាក់៖' : 'Homeroom Teacher Evaluation & Remarks:'}
            </span>
            <p className="text-slate-700 italic">
              "{stu.notes || (language === 'km' 
                ? 'សិស្សមានការយកចិត្តទុកដាក់ក្នុងការរៀនសូត្រ ប្រព្រឹត្តខ្លួនបានល្អក្នុងថ្នាក់រៀន និងមានទំនាក់ទំនងល្អជាមួយមិត្តភក្តិ។' 
                : 'Diligent student with consistent classroom participation and excellent conduct throughout the academic year.')}"
            </p>
          </div>
        )}

        {/* Signatures */}
        {activeOpts.showSignatures && (
          <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs text-slate-700 relative z-1">
            <div className="relative">
              <p className="font-bold text-slate-900 uppercase">
                {language === 'km' ? 'បានឃើញ និងឯកភាព' : 'Approved By'}
              </p>
              <p className="font-semibold">{language === 'km' ? 'នាយកសាលា' : 'Principal'}</p>
              
              <div className="h-16 flex items-end justify-center relative">
                {/* Principal Digital Signature */}
                {activeLayout.principalSignatureUrl && (
                  <img
                    src={activeLayout.principalSignatureUrl}
                    alt="Principal Signature"
                    className="max-h-12 object-contain absolute bottom-1 pointer-events-none z-1"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Official Red Rubber Stamp */}
                {activeLayout.showPrincipalStamp && activeLayout.stampMode !== 'none' && (activeLayout.stampPosition === 'principal' || activeLayout.stampPosition === 'both') && (
                  <div className="absolute -top-6 right-1/2 translate-x-1/2 sm:translate-x-1/3 pointer-events-none z-10">
                    <OfficialSchoolStamp
                      size={Math.round(activeLayout.stampScale * 1.05)}
                      customStampUrl={activeLayout.stampMode === 'custom' ? activeLayout.customStampUrl : undefined}
                      rotation={activeLayout.stampRotation}
                      opacity={activeLayout.stampOpacity}
                      customText={activeLayout.stampText}
                    />
                  </div>
                )}

                {schoolProfile?.principalNameKm && (
                  <p className="font-bold text-slate-900 text-xs relative z-2">{schoolProfile.principalNameKm}</p>
                )}
              </div>
              <p className="font-semibold text-slate-400">{language === 'km' ? '(ហត្ថលេខា និងត្រា)' : '(Signature & Stamp)'}</p>
            </div>

            <div>
              <div className="group relative inline-block">
                <p className="font-bold text-slate-800 mb-0.5 text-xs">
                  {effectiveDateDisplay}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditInputText(effectiveDateDisplay);
                    setIsCustomEditing(true);
                  }}
                  className="no-print opacity-0 group-hover:opacity-100 transition absolute -right-5 top-0 text-slate-400 hover:text-indigo-600 cursor-pointer p-0.5"
                  title={language === 'km' ? 'កែប្រែកាលបរិច្ឆេទ' : 'Edit Date'}
                >
                  <PenLine className="w-3 h-3" />
                </button>
              </div>
              <p className="font-bold text-slate-900 uppercase">
                {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}
              </p>
              <div className="h-16 flex items-center justify-center relative">
                {activeLayout.teacherSignatureUrl && (
                  <img
                    src={activeLayout.teacherSignatureUrl}
                    alt="Teacher Signature"
                    className="max-h-12 object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <p className="font-bold text-slate-900">
                {activeClass?.teacherNameKm || activeClass?.teacherName}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Ribbon */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setReportMode('monthly')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                reportMode === 'monthly'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-indigo-700" />
              <span>លទ្ធផលសិក្សាប្រចាំខែ</span>
            </button>

            <button
              onClick={() => setReportMode('yearly')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                reportMode === 'yearly'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-indigo-700" />
              <span>លទ្ធផលសិក្សាប្រចាំឆ្នាំ</span>
            </button>
          </div>

          {/* Month Selector (Shown in Monthly mode) */}
          {reportMode === 'monthly' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-500 whitespace-nowrap">
                ជ្រើសរើសខែ៖
              </span>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameKm}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Picker and Customizer for Monthly & Yearly Reports */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-700 shrink-0" />
              <span className="text-slate-600 font-extrabold whitespace-nowrap text-xs">
                {language === 'km' ? 'កាលបរិច្ឆេទថ្ងៃខែ៖' : 'Date:'}
              </span>
            </div>

            {isCustomEditing ? (
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={editInputText}
                  onChange={(e) => setEditInputText(e.target.value)}
                  placeholder="ឧ. ថ្ងៃទី៣០ ខែធ្នូ ឆ្នាំ២០២៥"
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-indigo-400 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveDateForCurrent(currentIsoDate, editInputText);
                      setIsCustomEditing(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    saveDateForCurrent(currentIsoDate, editInputText);
                    setIsCustomEditing(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer flex items-center space-x-1"
                >
                  <Check className="w-3 h-3" />
                  <span>{language === 'km' ? 'រួចរាល់' : 'Done'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomEditing(false)}
                  className="px-2 py-1 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                  <span className="text-xs font-black text-indigo-950 font-heading">
                    {effectiveDateDisplay}
                  </span>
                  
                  {/* Native Date Picker trigger */}
                  <label
                    htmlFor="report-native-date-input"
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer transition"
                    title={language === 'km' ? 'ជ្រើសរើសថ្ងៃខែពីប្រតិទិន' : 'Pick from Calendar'}
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                  </label>
                  <input
                    id="report-native-date-input"
                    type="date"
                    value={currentIsoDate}
                    onChange={(e) => {
                      const newIso = e.target.value;
                      const newKhmer = formatKhmerDateString(newIso);
                      saveDateForCurrent(newIso, newKhmer);
                    }}
                    className="sr-only"
                  />

                  {/* Text Edit Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditInputText(effectiveDateDisplay);
                      setIsCustomEditing(true);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer transition"
                    title={language === 'km' ? 'កែសម្រួលអត្ថបទថ្ងៃខែដោយផ្ទាល់' : 'Edit date text'}
                  >
                    <PenLine className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="hidden xl:flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const todayIso = today.toISOString().split('T')[0];
                      const todayKm = formatKhmerDateString(todayIso);
                      saveDateForCurrent(todayIso, todayKm);
                    }}
                    className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-200/70 rounded-md transition cursor-pointer"
                    title={language === 'km' ? 'កំណត់ជាថ្ងៃនេះ' : 'Set to today'}
                  >
                    {language === 'km' ? 'ថ្ងៃនេះ' : 'Today'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const defIso = reportMode === 'monthly'
                        ? (solarDateToIso(currentPeriod?.solarDate) || '2026-01-31')
                        : '2026-08-25';
                      const defKm = formatKhmerDateString(defIso);
                      saveDateForCurrent(defIso, defKm);
                    }}
                    className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-200/70 rounded-md transition cursor-pointer"
                    title={language === 'km' ? 'កំណត់តាមកាលបរិច្ឆេទដើមនៃខែនេះ' : 'Reset to period default'}
                  >
                    {language === 'km' ? 'តាមខែ' : 'Default'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      saveDateForCurrent('', 'ថ្ងៃទី......... ខែ......... ឆ្នាំ២០២...');
                    }}
                    className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-200/70 rounded-md transition cursor-pointer"
                    title={language === 'km' ? 'ទុកចន្លោះចុចៗសម្រាប់សរសេរដៃ' : 'Blank dotted format'}
                  >
                    {language === 'km' ? 'សរសេរដៃ (...)' : 'Blank'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Student Navigator */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>

            <select
              value={activeStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 max-w-xs cursor-pointer"
            >
              {reportMode === 'monthly'
                ? periodRankings.map(r => (
                    <option key={r.student.id} value={r.student.id}>
                      #{r.rank} - {r.student.name} ({r.student.studentId}) - {r.average.toFixed(2)}
                    </option>
                  ))
                : yearlySummaries.map(s => (
                    <option key={s.student.id} value={s.student.id}>
                      #{s.yearlyRank} - {s.student.name} ({s.student.studentId}) - {s.yearlyAverage.toFixed(2)}
                    </option>
                  ))
              }
            </select>

            <button
              onClick={handleNext}
              disabled={currentIndex >= classStudents.length - 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          {/* PDF Export & Print Actions (A5 Paper size configured specifically for សៀវភៅតាមដាន) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* MoEYS Layout & Stamp Configuration Panel Trigger */}
            <button
              onClick={() => setIsLayoutConfigOpen(prev => !prev)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-black transition cursor-pointer shadow-2xs ${
                isLayoutConfigOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400/50'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
              }`}
              title={language === 'km' ? 'កំណត់ទម្រង់ក្រសួង (MoEYS) & ត្រាសាលាផ្លូវការ' : 'MoEYS Layout & Official Stamp'}
            >
              <StampIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'km' ? 'ទម្រង់ & ត្រាផ្លូវការ' : 'Layout & Official Stamp'}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-200/80 text-[10px] font-black text-amber-950 uppercase">
                {layoutConfig.layoutStyle === 'standard' ? 'ស្តង់ដារ' : layoutConfig.layoutStyle === 'modern' ? 'ទំនើប' : layoutConfig.layoutStyle === 'compact_booklet' ? 'សៀវភៅ' : 'កិត្តិយស'}
              </span>
            </button>

            {/* Dedicated Print Preview Modal Trigger */}
            <button
              onClick={() => setIsPrintPreviewOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black shadow-2xs transition cursor-pointer"
              title={language === 'km' ? 'មើលទិដ្ឋភាពបោះពុម្ព (Print Preview Modal)' : 'Print Preview Modal'}
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'km' ? 'មើលទិដ្ឋភាពបោះពុម្ព' : 'Print Preview'}</span>
            </button>

            {/* Multi-Pillar Student Assessment & Multi-Sheet Excel */}
            <button
              onClick={() => setIsMultiPillarModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition cursor-pointer"
              title="របាយការណ៍សិស្ស វិជ្ជា (៨០%), បំណិន (១០%), ចរិយា (១០%) និងទាញយក Excel សន្លឹកច្រើន"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
              <span>របាយការណ៍ ៣ វិស័យ (វិជ្ជា-បំណិន-ចរិយា)</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-800 text-[10px] text-amber-300 font-bold">
                Excel
              </span>
            </button>

            <button
              onClick={handleExportSingleStudentExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
              title="ទាញយកសន្លឹកកិច្ចការ Excel សិស្សនេះ (Sheet វិជ្ជា, បំណិន, ចរិយា, សរុប)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>ទាញយក Excel (.xlsx)</span>
            </button>

            {/* Print Options Settings Button */}
            <button
              onClick={() => setIsPrintOptionsOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
              title={language === 'km' ? 'កំណត់ជម្រើសបោះពុម្ព (បង្ហាញ/លាក់ទិន្នន័យ)' : 'Print Options (Toggle Metrics)'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-700" />
              <span>{language === 'km' ? 'ជម្រើសបោះពុម្ព' : 'Print Options'}</span>
            </button>

            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ផ្ញើ Telegram' : 'Send Telegram'}</span>
            </button>

            <PrintToPdfButton
              targetElementId="active-report-card-container"
              documentTitle={
                reportMode === 'monthly'
                  ? `MoEYS_Monthly_Slip_${currentStudent.name.replace(/\s+/g, '_')}_${currentPeriod.code}`
                  : `MoEYS_Annual_Transcript_${currentStudent.name.replace(/\s+/g, '_')}_${activeClass?.academicYear}`
              }
              pageSize={reportMode === 'monthly' ? 'a5' : 'a4'}
              variant="primary"
              size="md"
              labelKm="ទាញយកជា PDF"
              labelEn="Export to PDF"
              onBeforePrint={() => setBatchPrintMode(false)}
            />

            <PrintToPdfButton
              targetElementIds={classStudents.map(s => reportMode === 'monthly' ? `monthly-card-${s.id}` : `yearly-card-${s.id}`)}
              documentTitle={
                reportMode === 'monthly'
                  ? `MoEYS_All_Monthly_Slips_${activeClass?.nameKm || 'Class'}_${currentPeriod.code}`
                  : `MoEYS_All_Annual_Transcripts_${activeClass?.nameKm || 'Class'}_${activeClass?.academicYear}`
              }
              pageSize={reportMode === 'monthly' ? 'a5' : 'a4'}
              variant="secondary"
              size="md"
              batchAll={true}
              labelKm="ទាញយក PDF ទាំងអស់"
              labelEn="Batch Export PDF"
              onBeforePrint={() => setBatchPrintMode(true)}
            />
          </div>

        </div>
      </div>

      {/* Quick MoEYS Layout Styles Bar */}
      <div className="no-print bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-extrabold text-slate-700 px-1 flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-indigo-700" />
            <span>{language === 'km' ? 'ទម្រង់ក្រសួង MoEYS៖' : 'MoEYS Layout Style:'}</span>
          </span>
          {MOEYS_LAYOUT_STYLES.map((style) => {
            const isSelected = layoutConfig.layoutStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleLayoutConfigChange({ ...layoutConfig, layoutStyle: style.id })}
                className={`px-3 py-1.5 rounded-xl font-heading font-black text-xs transition cursor-pointer flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
                title={style.descKm}
              >
                <span>{style.nameKm}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500">
          <span className="hidden sm:inline">
            ឡូហ្គោ៖ {layoutConfig.logoMode === 'minimal' ? 'អក្សរសុទ្ធ' : 'ឡូហ្គោសាលា'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="hidden sm:inline">
            ត្រា៖ {layoutConfig.stampMode === 'moeys_circular' ? 'ត្រាមូលក្រហម' : layoutConfig.stampMode === 'custom' ? 'ត្រាផ្ទាល់ខ្លួន' : 'គ្មាន'}
          </span>
          <button
            onClick={() => setIsLayoutConfigOpen(true)}
            className="text-indigo-700 hover:text-indigo-900 underline font-black cursor-pointer ml-1"
          >
            {language === 'km' ? 'កែសម្រួលលម្អិត' : 'Configure'}
          </button>
        </div>
      </div>

      {/* Render Current Student or All if batchPrintMode */}
      {batchPrintMode ? (
        <div className="space-y-8">
          {reportMode === 'monthly'
            ? periodRankings.map(r => renderMonthlyReportCard(r, printOptions, layoutConfig))
            : yearlySummaries.map(s => renderYearlyReportCard(s, printOptions, layoutConfig))
          }
        </div>
      ) : (
        reportMode === 'monthly' 
          ? renderMonthlyReportCard(currentMonthlyRanking, printOptions, layoutConfig)
          : renderYearlyReportCard(currentSummary, printOptions, layoutConfig)
      )}

      {/* Telegram Share Modal */}
      {currentStudent && (
        <TelegramShareModal
          student={currentStudent}
          isOpen={isTelegramModalOpen}
          onClose={() => setIsTelegramModalOpen(false)}
        />
      )}

      {/* Print Options Settings Modal */}
      <PrintOptionsModal
        isOpen={isPrintOptionsOpen}
        onClose={() => setIsPrintOptionsOpen(false)}
        options={printOptions}
        onOptionsChange={handlePrintOptionsChange}
        reportMode={reportMode}
        onOpenLayoutConfig={() => setIsLayoutConfigOpen(true)}
      />

      {/* MoEYS Layout & Official Stamp Configuration Panel */}
      <ReportLayoutConfigPanel
        isOpen={isLayoutConfigOpen}
        onClose={() => setIsLayoutConfigOpen(false)}
        config={layoutConfig}
        onConfigChange={handleLayoutConfigChange}
        reportMode={reportMode}
      />

      {/* Dedicated Print Preview Modal Overlay */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        type="report"
        reportMode={reportMode}
        reportOptions={printOptions}
        onReportOptionsChange={handlePrintOptionsChange}
        onOpenLayoutConfig={() => setIsLayoutConfigOpen(true)}
        activeRanking={currentMonthlyRanking}
        activeSummary={currentSummary}
        allRankings={periodRankings}
        allSummaries={yearlySummaries}
        currentStudent={currentStudent}
        currentPeriod={currentPeriod}
        renderReportCard={(item, opts) => 
          reportMode === 'monthly'
            ? renderMonthlyReportCard(item, opts, layoutConfig)
            : renderYearlyReportCard(item, opts, layoutConfig)
        }
      />

      {/* Multi-Pillar Student Assessment Modal (Knowledge 80% + Skills 10% + Attitude Appendix 4 10%) */}
      {currentStudent && (
        <MultiPillarStudentReportModal
          isOpen={isMultiPillarModalOpen}
          onClose={() => setIsMultiPillarModalOpen(false)}
          initialStudentId={currentStudent.id}
        />
      )}

    </div>
  );
};
