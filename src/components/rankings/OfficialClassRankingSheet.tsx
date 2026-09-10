import React, { useState, useMemo, useRef } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Printer, 
  Download, 
  Palette, 
  Calendar, 
  Award, 
  Check, 
  Edit3, 
  Sparkles,
  BookOpen,
  Filter,
  Info,
  Building,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { 
  calculatePeriodRankings, 
  calculatePeriodAverage, 
  calculateYearlySummaries 
} from '../../utils/calculations';
import { Student, AssessmentPeriod } from '../../types';

export type RankingSheetTheme = 'moeys_standard' | 'royal_gold' | 'sapphire_blue' | 'emerald_green' | 'crimson_lotus';

export type RankingPeriodMode = 'monthly' | 'sem1' | 'sem2' | 'yearly';

interface ThemeConfig {
  id: RankingSheetTheme;
  nameKm: string;
  nameEn: string;
  borderColor: string;
  headerBg: string;
  headerTextColor: string;
  tableBorder: string;
  rowAltBg: string;
  accentColor: string;
  cardBorder: string;
  highlightBadge: string;
}

export const RANKING_THEMES: Record<RankingSheetTheme, ThemeConfig> = {
  moeys_standard: {
    id: 'moeys_standard',
    nameKm: 'ក្រសួងស្តង់ដារ (MoEYS Standard)',
    nameEn: 'Official MoEYS Standard',
    borderColor: 'border-slate-900',
    headerBg: 'bg-slate-100',
    headerTextColor: 'text-slate-900',
    tableBorder: 'border-slate-800',
    rowAltBg: 'bg-white',
    accentColor: 'text-slate-900',
    cardBorder: 'border-slate-300',
    highlightBadge: 'bg-slate-100 text-slate-800 font-bold border border-slate-300',
  },
  royal_gold: {
    id: 'royal_gold',
    nameKm: 'រាជបល្ល័ង្កមាស (Angkor Gold)',
    nameEn: 'Angkor Royal Gold',
    borderColor: 'border-amber-700',
    headerBg: 'bg-amber-50/80',
    headerTextColor: 'text-amber-950',
    tableBorder: 'border-amber-700',
    rowAltBg: 'bg-amber-50/20',
    accentColor: 'text-amber-800',
    cardBorder: 'border-amber-300',
    highlightBadge: 'bg-amber-100 text-amber-900 font-bold border border-amber-300',
  },
  sapphire_blue: {
    id: 'sapphire_blue',
    nameKm: 'ត្បូងពេជ្រនិលវ័ន្ត (Sapphire Blue)',
    nameEn: 'Royal Sapphire Blue',
    borderColor: 'border-blue-800',
    headerBg: 'bg-blue-50/80',
    headerTextColor: 'text-blue-950',
    tableBorder: 'border-blue-800',
    rowAltBg: 'bg-blue-50/20',
    accentColor: 'text-blue-800',
    cardBorder: 'border-blue-300',
    highlightBadge: 'bg-blue-100 text-blue-900 font-bold border border-blue-300',
  },
  emerald_green: {
    id: 'emerald_green',
    nameKm: 'ត្បូងមរកតរុងរឿង (Emerald Green)',
    nameEn: 'Imperial Emerald',
    borderColor: 'border-emerald-800',
    headerBg: 'bg-emerald-50/80',
    headerTextColor: 'text-emerald-950',
    tableBorder: 'border-emerald-800',
    rowAltBg: 'bg-emerald-50/20',
    accentColor: 'text-emerald-800',
    cardBorder: 'border-emerald-300',
    highlightBadge: 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300',
  },
  crimson_lotus: {
    id: 'crimson_lotus',
    nameKm: 'ផ្កាឈូករុងរឿង (Crimson Lotus)',
    nameEn: 'Crimson Lotus',
    borderColor: 'border-rose-800',
    headerBg: 'bg-rose-50/80',
    headerTextColor: 'text-rose-950',
    tableBorder: 'border-rose-800',
    rowAltBg: 'bg-rose-50/20',
    accentColor: 'text-rose-800',
    cardBorder: 'border-rose-300',
    highlightBadge: 'bg-rose-100 text-rose-900 font-bold border border-rose-300',
  },
};

export interface StudentRankRow {
  student: Student;
  rank: number;
  totalPoints: number;
  average: number;
  letterGrade: string;
  // For Yearly mode
  sem1Avg?: number;
  sem2Avg?: number;
  yearlyAvg?: number;
}

export const OfficialClassRankingSheet: React.FC = () => {
  const { 
    students, 
    activeClass, 
    schoolProfile, 
    subjects, 
    periods, 
    scoresMatrix, 
    weights, 
    gradeScales, 
    language,
    updateSchoolProfile
  } = useGradebook();

  // Mode Selection: Monthly, Semester 1, Semester 2, Yearly
  const [periodMode, setPeriodMode] = useState<RankingPeriodMode>('yearly');
  const [selectedMonthId, setSelectedMonthId] = useState<string>(() => {
    // Default to June (month_jun) if available, or first period
    const jun = periods.find(p => p.id === 'month_jun' || p.nameKm.includes('មិថុនា'));
    return jun ? jun.id : (periods[0]?.id || 'month_dec');
  });

  // Selected visual theme
  const [theme, setTheme] = useState<RankingSheetTheme>('moeys_standard');

  // Inline Customizable Header & Details State
  const [isEditingHeaders, setIsEditingHeaders] = useState(false);
  const [customOffice, setCustomOffice] = useState('ការិយាល័យអប់រំយុវជន និងកីឡា ស្រុកត្បូងឃ្មុំ');
  const [customSchool, setCustomSchool] = useState(schoolProfile.schoolNameKm || 'សាលាបឋមសិក្សា ព្រែកជីក');
  const [customClass, setCustomClass] = useState(activeClass?.nameKm || 'ថ្នាក់ទី៤(គ)');
  const [customAcademicYear, setCustomAcademicYear] = useState(activeClass?.academicYear || '២០២៥-២០២៦');
  const [customLocation, setCustomLocation] = useState('ព្រែកជីក');
  const [customLunarDate, setCustomLunarDate] = useState('ថ្ងៃចន្ទ ៨រោច ខែអស្សុជ ឆ្នាំមមី សប្តស័ក ព.ស. ២៥៧០');
  const [customSolarDate, setCustomSolarDate] = useState('ថ្ងៃទី២៧ ខែកក្កដា ឆ្នាំ២០២៦');
  const [customPrincipalTitle, setCustomPrincipalTitle] = useState('នាយកសាលា');
  const [customTeacherTitle, setCustomTeacherTitle] = useState('គ្រូបន្ទុកថ្នាក់');
  const [customTeacherName, setCustomTeacherName] = useState(activeClass?.teacherNameKm || activeClass?.teacherName || 'លោកគ្រូ ផាន សិតការណ៍');

  // Filter students for current active class
  const classStudents = useMemo(() => {
    if (!activeClass || !activeClass.studentIds || activeClass.studentIds.length === 0) {
      return students;
    }
    const idSet = new Set(activeClass.studentIds);
    const filtered = students.filter(s => idSet.has(s.id));
    return filtered.length > 0 ? filtered : students;
  }, [students, activeClass]);

  // Current selected month period
  const currentMonthPeriod = useMemo(() => {
    return periods.find(p => p.id === selectedMonthId) || periods[0];
  }, [periods, selectedMonthId]);

  // Compute letter grade from an average
  const getLetterGrade = (avg: number): string => {
    if (avg >= 9.0) return 'A';
    if (avg >= 8.0) return 'B';
    if (avg >= 7.0) return 'C';
    if (avg >= 6.0) return 'D';
    if (avg >= 5.0) return 'E';
    return 'F';
  };

  // 1. Calculate Monthly Ranked Data
  const monthlyRankedData: StudentRankRow[] = useMemo(() => {
    if (!currentMonthPeriod) return [];
    const rawRanks = calculatePeriodRankings(
      classStudents,
      currentMonthPeriod.id,
      subjects,
      scoresMatrix,
      weights,
      undefined,
      'total_score'
    );
    return rawRanks.map(item => ({
      student: item.student,
      rank: item.rank,
      totalPoints: Number(item.totalPoints.toFixed(1)),
      average: Number(item.average.toFixed(2)),
      letterGrade: getLetterGrade(item.average),
    }));
  }, [classStudents, currentMonthPeriod, subjects, scoresMatrix, weights]);

  // 2. Calculate Semester 1 Consolidated Ranked Data
  const sem1RankedData: StudentRankRow[] = useMemo(() => {
    const sem1Periods = periods.filter(p => p.semester === 1);
    if (sem1Periods.length === 0) return monthlyRankedData;

    const rows = classStudents.map(student => {
      let totalPts = 0;
      let count = 0;
      for (const p of sem1Periods) {
        const calc = calculatePeriodAverage(student.id, p.id, subjects, scoresMatrix, weights);
        totalPts += calc.totalPoints;
        count++;
      }
      const avg = count > 0 ? Number((totalPts / (count * (subjects.length || 1))).toFixed(2)) : 0;
      return {
        student,
        rank: 0,
        totalPoints: Number(totalPts.toFixed(1)),
        average: avg,
        letterGrade: getLetterGrade(avg),
      };
    });

    // Sort descending by totalPoints
    rows.sort((a, b) => b.totalPoints - a.totalPoints || b.average - a.average);
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }, [classStudents, periods, subjects, scoresMatrix, weights, monthlyRankedData]);

  // 3. Calculate Semester 2 Consolidated Ranked Data
  const sem2RankedData: StudentRankRow[] = useMemo(() => {
    const sem2Periods = periods.filter(p => p.semester === 2);
    if (sem2Periods.length === 0) return monthlyRankedData;

    const rows = classStudents.map(student => {
      let totalPts = 0;
      let count = 0;
      for (const p of sem2Periods) {
        const calc = calculatePeriodAverage(student.id, p.id, subjects, scoresMatrix, weights);
        totalPts += calc.totalPoints;
        count++;
      }
      const avg = count > 0 ? Number((totalPts / (count * (subjects.length || 1))).toFixed(2)) : 0;
      return {
        student,
        rank: 0,
        totalPoints: Number(totalPts.toFixed(1)),
        average: avg,
        letterGrade: getLetterGrade(avg),
      };
    });

    // Sort descending by totalPoints
    rows.sort((a, b) => b.totalPoints - a.totalPoints || b.average - a.average);
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }, [classStudents, periods, subjects, scoresMatrix, weights, monthlyRankedData]);

  // 4. Calculate Yearly Summary Ranked Data (With Sem 1, Sem 2, Yearly Average & Rank)
  const yearlyRankedData: StudentRankRow[] = useMemo(() => {
    const yearlySummaries = calculateYearlySummaries(
      classStudents,
      periods,
      subjects,
      scoresMatrix,
      weights,
      gradeScales
    );

    // Sort descending by yearly average
    const sorted = [...yearlySummaries].sort((a, b) => b.yearlyAverage - a.yearlyAverage);
    
    return sorted.map((item, idx) => ({
      student: item.student,
      rank: idx + 1,
      totalPoints: Number((item.yearlyAverage * (subjects.length || 1)).toFixed(1)),
      average: item.yearlyAverage,
      letterGrade: item.letterGrade || getLetterGrade(item.yearlyAverage),
      sem1Avg: item.term1Average,
      sem2Avg: item.term2Average,
      yearlyAvg: item.yearlyAverage,
    }));
  }, [classStudents, periods, subjects, scoresMatrix, weights, gradeScales]);

  // Active ranked list based on periodMode
  const activeRankedData: StudentRankRow[] = useMemo(() => {
    switch (periodMode) {
      case 'monthly':
        return monthlyRankedData;
      case 'sem1':
        return sem1RankedData;
      case 'sem2':
        return sem2RankedData;
      case 'yearly':
        return yearlyRankedData;
      default:
        return yearlyRankedData;
    }
  }, [periodMode, monthlyRankedData, sem1RankedData, sem2RankedData, yearlyRankedData]);

  // Split students into Left Column (1 to N/2) and Right Column (N/2 + 1 to N)
  const { leftColumnData, rightColumnData } = useMemo(() => {
    const half = Math.ceil(activeRankedData.length / 2);
    return {
      leftColumnData: activeRankedData.slice(0, half),
      rightColumnData: activeRankedData.slice(half),
    };
  }, [activeRankedData]);

  // Calculate Official Summary Statistics Box (4 Rows)
  const statistics = useMemo(() => {
    const total = activeRankedData.length;
    const female = activeRankedData.filter(r => r.student.gender === 'Female').length;

    // Passing threshold: average >= 5.0
    const passedList = activeRankedData.filter(r => r.average >= 5.0);
    const passedTotal = passedList.length;
    const passedFemale = passedList.filter(r => r.student.gender === 'Female').length;
    const passedPct = total > 0 ? ((passedTotal / total) * 100).toFixed(2) : '0.00';
    const passedFemalePct = total > 0 ? ((passedFemale / total) * 100).toFixed(2) : '0.00';

    // Failing: average < 5.0
    const failedList = activeRankedData.filter(r => r.average < 5.0);
    const failedTotal = failedList.length;
    const failedFemale = failedList.filter(r => r.student.gender === 'Female').length;
    const failedPct = total > 0 ? ((failedTotal / total) * 100).toFixed(2) : '0.00';
    const failedFemalePct = total > 0 ? ((failedFemale / total) * 100).toFixed(2) : '0.00';

    // Letter grades counts
    const getGradeCounts = (g: string) => {
      const list = activeRankedData.filter(r => r.letterGrade === g);
      return {
        total: list.length,
        female: list.filter(r => r.student.gender === 'Female').length,
      };
    };

    return {
      total,
      female,
      passedTotal,
      passedFemale,
      passedPct,
      passedFemalePct,
      failedTotal,
      failedFemale,
      failedPct,
      failedFemalePct,
      droppedTotal: 0,
      droppedFemale: 0,
      droppedPct: '0.00',
      droppedFemalePct: '0.00',
      gradeA: getGradeCounts('A'),
      gradeB: getGradeCounts('B'),
      gradeC: getGradeCounts('C'),
      gradeD: getGradeCounts('D'),
      gradeE: getGradeCounts('E'),
      gradeF: getGradeCounts('F'),
    };
  }, [activeRankedData]);

  // Title generation
  const pageTitleKm = useMemo(() => {
    switch (periodMode) {
      case 'monthly':
        return `ចំណាត់ថ្នាក់ប្រចាំ${currentMonthPeriod?.nameKm || 'ខែ'}`;
      case 'sem1':
        return 'ចំណាត់ថ្នាក់ប្រចាំឆមាសទី១';
      case 'sem2':
        return 'ចំណាត់ថ្នាក់ប្រចាំឆមាសទី២';
      case 'yearly':
        return 'ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ';
      default:
        return 'ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ';
    }
  }, [periodMode, currentMonthPeriod]);

  const currentTheme = RANKING_THEMES[theme];

  // Handler to print
  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP CONTROL TOOLBAR (Theme, Period Selector, Direct Print, PDF, Custom Edit) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                  <span>តារាងចំណាត់ថ្នាក់សិស្សផ្លូវការ (គំរូក្រសួង A4)</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    A4 2-Column Ready
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  តារាងបែងចែកជា ២ ជួរឈរ លើក្រដាស A4 តែមួយសន្លឹកតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Toggle Inline Edit */}
            <button
              type="button"
              onClick={() => setIsEditingHeaders(!isEditingHeaders)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isEditingHeaders 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="កែសម្រួលឈ្មោះសាលា ស្រុក ថ្នាក់ និងកាលបរិច្ឆេទ"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingHeaders ? 'បិទការកែសម្រួល' : 'កែសម្រួលបឋមកថា & ហត្ថលេខា'}</span>
            </button>

            {/* Direct Window Print */}
            <button
              type="button"
              onClick={handleDirectPrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>បោះពុម្ព A4 ភ្លាមៗ</span>
            </button>

            {/* PDF Export Button */}
            <PrintToPdfButton
              targetElementId="official-ranking-sheet-a4"
              documentTitle={`MoEYS_Ranking_${customClass}_${periodMode}_${customAcademicYear}`}
              pageSize="a4"
              orientation="portrait"
              variant="primary"
              size="md"
              labelKm="ទាញយកជា PDF (A4)"
              labelEn="Export to PDF (A4)"
            />
          </div>
        </div>

        {/* Period Selector Tabs (Monthly, Sem 1, Sem 2, Yearly) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPeriodMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                periodMode === 'monthly'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ប្រឡងប្រចាំខែ</span>
            </button>

            <button
              type="button"
              onClick={() => setPeriodMode('sem1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                periodMode === 'sem1'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>ប្រចាំឆមាសទី១ (សរុបខែ+ប្រឡង)</span>
            </button>

            <button
              type="button"
              onClick={() => setPeriodMode('sem2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                periodMode === 'sem2'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>ប្រចាំឆមាសទី២ (សរុបខែ+ប្រឡង)</span>
            </button>

            <button
              type="button"
              onClick={() => setPeriodMode('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                periodMode === 'yearly'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ប្រចាំឆ្នាំ (ម.ឆ១ + ម.ឆ២ + ម.ឆ្នាំ)</span>
            </button>
          </div>

          {/* If Monthly, Month Selector */}
          {periodMode === 'monthly' && (
            <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-indigo-900">ជ្រើសរើសខែប្រឡង៖</span>
              <select
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                className="bg-white border border-indigo-200 text-xs font-bold text-indigo-950 px-2.5 py-1 rounded-lg outline-none cursor-pointer"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameKm} ({p.semester === 1 ? 'ឆមាសទី១' : 'ឆមាសទី២'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Theme Picker Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">រចនាប័ទ្មពណ៌តារាង (Themes)៖</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {Object.values(RANKING_THEMES).map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    t.id === 'moeys_standard' ? 'bg-slate-800' :
                    t.id === 'royal_gold' ? 'bg-amber-500' :
                    t.id === 'sapphire_blue' ? 'bg-blue-600' :
                    t.id === 'emerald_green' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`} />
                  <span>{t.nameKm}</span>
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Inline Editing Drawer for School, District, Class, Dates */}
        {isEditingHeaders && (
          <div className="pt-4 border-t border-amber-200 bg-amber-50/40 p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>កែសម្រួលព័ត៌មានបឋមកថា និងហត្ថលេខាផ្លូវការ</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setCustomOffice('ការិយាល័យអប់រំយុវជន និងកីឡា ស្រុកត្បូងឃ្មុំ');
                  setCustomSchool('សាលាបឋមសិក្សា ព្រែកជីក');
                  setCustomClass('ថ្នាក់ទី៤(គ)');
                  setCustomAcademicYear('២០២៥-២០២៦');
                  setCustomLocation('ព្រែកជីក');
                  setCustomLunarDate('ថ្ងៃចន្ទ ៨រោច ខែអស្សុជ ឆ្នាំមមី សប្តស័ក ព.ស. ២៥៧០');
                  setCustomSolarDate('ថ្ងៃទី២៧ ខែកក្កដា ឆ្នាំ២០២៦');
                  setCustomTeacherName('លោកគ្រូ ផាន សិតការណ៍');
                }}
                className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>កំណត់លំនាំដើម (សាលាបឋមសិក្សា ព្រែកជីក)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ការិយាល័យអប់រំស្រុក៖</label>
                <input
                  type="text"
                  value={customOffice}
                  onChange={(e) => setCustomOffice(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ឈ្មោះសាលារៀន៖</label>
                <input
                  type="text"
                  value={customSchool}
                  onChange={(e) => setCustomSchool(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ថ្នាក់ទី៖</label>
                <input
                  type="text"
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ឆ្នាំសិក្សា៖</label>
                <input
                  type="text"
                  value={customAcademicYear}
                  onChange={(e) => setCustomAcademicYear(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ទីតាំង (ឃុំ/ភូមិ/ស្រុក)៖</label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">កាលបរិច្ឆេទចន្ទគតិ៖</label>
                <input
                  type="text"
                  value={customLunarDate}
                  onChange={(e) => setCustomLunarDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">កាលបរិច្ឆេទសុរិយគតិ៖</label>
                <input
                  type="text"
                  value={customSolarDate}
                  onChange={(e) => setCustomSolarDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ឈ្មោះគ្រូបន្ទុកថ្នាក់៖</label>
                <input
                  type="text"
                  value={customTeacherName}
                  onChange={(e) => setCustomTeacherName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE OFFICIAL A4 PRINTABLE DOCUMENT CONTAINER */}
      <div className="flex justify-center overflow-x-auto pb-8">
        <div
          id="official-ranking-sheet-a4"
          className={`bg-white shadow-xl mx-auto text-slate-900 transition-colors ${
            // Standard A4 Portrait Aspect Ratio & Dimensions
            'w-[210mm] min-h-[297mm] p-[10mm] relative'
          }`}
          style={{
            boxSizing: 'border-box',
            fontFamily: "'Kantumruy Pro', 'Siemreap', sans-serif",
          }}
        >
          {/* Header Block: Left Office/School & Right Kingdom */}
          <div className="flex justify-between items-start mb-2">
            
            {/* Left Block */}
            <div className="text-left space-y-0.5">
              <div className="font-moul text-[11px] text-slate-900 leading-normal tracking-wide">
                {customOffice}
              </div>
              <div className="font-moul text-[11.5px] text-slate-900 leading-normal">
                {customSchool}
              </div>
              <div className="text-[11px] font-bold text-slate-800">
                {customClass}
              </div>
            </div>

            {/* Right Block */}
            <div className="text-center space-y-0.5">
              <div className="font-moul text-[11.5px] text-slate-900 leading-normal tracking-wide">
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div className="font-moul text-[11px] text-slate-900 leading-normal tracking-wide">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
              {/* Traditional Cambodian Flourish / Swash */}
              <div className="flex justify-center pt-0.5">
                <svg className="w-20 h-2.5 text-slate-800" viewBox="0 0 100 12" fill="none" stroke="currentColor">
                  <path d="M5 6 Q 25 1, 50 6 T 95 6" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="50" cy="6" r="2" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {/* Central Title */}
          <div className="text-center my-2 space-y-0.5">
            <h1 className={`font-moul text-[15px] leading-relaxed tracking-wide ${currentTheme.accentColor}`}>
              {pageTitleKm}
            </h1>
            <div className="font-bold text-[11px] text-slate-800">
              {customClass} ឆ្នាំសិក្សា {customAcademicYear}
            </div>
          </div>

          {/* 3. SPLIT 2-COLUMN TABLE (Left Half: 1-17, Right Half: 18-34) */}
          <div className="grid grid-cols-2 gap-1.5 my-2">
            
            {/* LEFT HALF TABLE (Students 1 to N/2) */}
            <table className={`w-full text-center border-collapse border ${currentTheme.tableBorder} text-[10px]`}>
              <thead className={currentTheme.headerBg}>
                <tr className="border-b border-slate-800 font-bold text-[9.5px]">
                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[26px]`}>ល.រ</th>
                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-1.5 text-left`}>គោត្តនាម នាម</th>
                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[22px]`}>ភេទ</th>
                  
                  {periodMode === 'yearly' ? (
                    <>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[28px]`}>ម.ឆ១</th>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[28px]`}>ម.ឆ២</th>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[30px] font-black`}>ម.ឆ្នាំ</th>
                    </>
                  ) : (
                    <>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[38px]`}>ពិន្ទុសរុប</th>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[34px]`}>ម.ភាគ</th>
                    </>
                  )}

                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[32px]`}>ចំ.ថ្នាក់</th>
                  <th className="py-1 px-1 w-[28px]">និទ្ទេស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leftColumnData.map((row) => (
                  <tr key={row.student.id} className={`h-[21px] ${currentTheme.rowAltBg}`}>
                    <td className={`border-r ${currentTheme.tableBorder} font-bold py-0.5`}>
                      {row.rank}
                    </td>
                    <td className={`border-r ${currentTheme.tableBorder} text-left font-bold px-1.5 truncate max-w-[110px]`}>
                      {row.student.name}
                    </td>
                    <td className={`border-r ${currentTheme.tableBorder} py-0.5 font-bold ${row.student.gender === 'Female' ? 'text-slate-900' : 'text-slate-500'}`}>
                      {row.student.gender === 'Female' ? 'ស' : ''}
                    </td>

                    {periodMode === 'yearly' ? (
                      <>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono py-0.5 text-[9.5px]`}>
                          {row.sem1Avg?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono py-0.5 text-[9.5px]`}>
                          {row.sem2Avg?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono font-bold py-0.5 text-[9.5px] bg-slate-50/50`}>
                          {row.yearlyAvg?.toFixed(2) ?? '0.00'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono font-bold py-0.5 text-[9.5px]`}>
                          {row.totalPoints.toFixed(periodMode === 'monthly' ? 0 : 1)}
                        </td>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono font-bold py-0.5 text-[9.5px]`}>
                          {row.average.toFixed(2)}
                        </td>
                      </>
                    )}

                    <td className={`border-r ${currentTheme.tableBorder} font-bold py-0.5`}>
                      {row.rank}
                    </td>
                    <td className={`font-bold py-0.5 ${
                      row.letterGrade === 'A' ? 'text-emerald-700' :
                      row.letterGrade === 'F' ? 'text-rose-700' : 'text-slate-900'
                    }`}>
                      {row.letterGrade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* RIGHT HALF TABLE (Students N/2 + 1 to N) */}
            <table className={`w-full text-center border-collapse border ${currentTheme.tableBorder} text-[10px]`}>
              <thead className={currentTheme.headerBg}>
                <tr className="border-b border-slate-800 font-bold text-[9.5px]">
                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[26px]`}>ល.រ</th>
                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-1.5 text-left`}>គោត្តនាម នាម</th>
                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[22px]`}>ភេទ</th>
                  
                  {periodMode === 'yearly' ? (
                    <>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[28px]`}>ម.ឆ១</th>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[28px]`}>ម.ឆ២</th>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-0.5 w-[30px] font-black`}>ម.ឆ្នាំ</th>
                    </>
                  ) : (
                    <>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[38px]`}>ពិន្ទុសរុប</th>
                      <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[34px]`}>ម.ភាគ</th>
                    </>
                  )}

                  <th className={`border-r ${currentTheme.tableBorder} py-1 px-1 w-[32px]`}>ចំ.ថ្នាក់</th>
                  <th className="py-1 px-1 w-[28px]">និទ្ទេស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rightColumnData.map((row) => (
                  <tr key={row.student.id} className={`h-[21px] ${currentTheme.rowAltBg}`}>
                    <td className={`border-r ${currentTheme.tableBorder} font-bold py-0.5`}>
                      {row.rank}
                    </td>
                    <td className={`border-r ${currentTheme.tableBorder} text-left font-bold px-1.5 truncate max-w-[110px]`}>
                      {row.student.name}
                    </td>
                    <td className={`border-r ${currentTheme.tableBorder} py-0.5 font-bold ${row.student.gender === 'Female' ? 'text-slate-900' : 'text-slate-500'}`}>
                      {row.student.gender === 'Female' ? 'ស' : ''}
                    </td>

                    {periodMode === 'yearly' ? (
                      <>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono py-0.5 text-[9.5px]`}>
                          {row.sem1Avg?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono py-0.5 text-[9.5px]`}>
                          {row.sem2Avg?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono font-bold py-0.5 text-[9.5px] bg-slate-50/50`}>
                          {row.yearlyAvg?.toFixed(2) ?? '0.00'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono font-bold py-0.5 text-[9.5px]`}>
                          {row.totalPoints.toFixed(periodMode === 'monthly' ? 0 : 1)}
                        </td>
                        <td className={`border-r ${currentTheme.tableBorder} font-mono font-bold py-0.5 text-[9.5px]`}>
                          {row.average.toFixed(2)}
                        </td>
                      </>
                    )}

                    <td className={`border-r ${currentTheme.tableBorder} font-bold py-0.5`}>
                      {row.rank}
                    </td>
                    <td className={`font-bold py-0.5 ${
                      row.letterGrade === 'A' ? 'text-emerald-700' :
                      row.letterGrade === 'F' ? 'text-rose-700' : 'text-slate-900'
                    }`}>
                      {row.letterGrade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          {/* 4. OFFICIAL MINISTRY SUMMARY STATISTICS BOX (4 Rows) */}
          <div className="my-2.5">
            <table className={`w-full border-collapse border ${currentTheme.tableBorder} text-[9.5px]`}>
              <tbody>
                {/* Row 1: Total & Grade A & Grade D */}
                <tr className={`border-b ${currentTheme.tableBorder} h-[21px]`}>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold w-[140px]`}>
                    សិស្សសរុប {statistics.total} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold w-[110px]`}>
                    ស្រី {statistics.female} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold w-[120px]`}>
                    និទ្ទេស A {statistics.gradeA.total} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold w-[90px]`}>
                    ស្រី {statistics.gradeA.female} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold w-[120px]`}>
                    និទ្ទេស D {statistics.gradeD.total} នាក់
                  </td>
                  <td className="px-2 font-bold">
                    ស្រី {statistics.gradeD.female} នាក់
                  </td>
                </tr>

                {/* Row 2: Passed & % & Grade B & Grade E */}
                <tr className={`border-b ${currentTheme.tableBorder} h-[21px]`}>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    សិស្សជាប់ {statistics.passedTotal} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    ស្រី {statistics.passedFemale} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    {statistics.passedPct}%
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    ស្រី {statistics.passedFemalePct}%
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    និទ្ទេស B {statistics.gradeB.total} នាក់ (ស្រី {statistics.gradeB.female} នាក់)
                  </td>
                  <td className="px-2 font-bold">
                    និទ្ទេស E {statistics.gradeE.total} នាក់ (ស្រី {statistics.gradeE.female} នាក់)
                  </td>
                </tr>

                {/* Row 3: Failed & % & Grade C & Grade F */}
                <tr className={`border-b ${currentTheme.tableBorder} h-[21px]`}>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    សិស្សធ្លាក់ {statistics.failedTotal} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    ស្រី {statistics.failedFemale} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    {statistics.failedPct}%
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    ស្រី {statistics.failedFemalePct}%
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    និទ្ទេស C {statistics.gradeC.total} នាក់ (ស្រី {statistics.gradeC.female} នាក់)
                  </td>
                  <td className="px-2 font-bold">
                    និទ្ទេស F {statistics.gradeF.total} នាក់ (ស្រី {statistics.gradeF.female} នាក់)
                  </td>
                </tr>

                {/* Row 4: Dropped out */}
                <tr className="h-[21px]">
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    សិស្សបោះបង់ {statistics.droppedTotal} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    ស្រី {statistics.droppedFemale} នាក់
                  </td>
                  <td className={`border-r ${currentTheme.tableBorder} px-2 font-bold`}>
                    {statistics.droppedPct}%
                  </td>
                  <td colSpan={3} className="px-2 font-bold">
                    ស្រី {statistics.droppedFemalePct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. OFFICIAL DATES & SIGNATURES SECTION */}
          <div className="mt-3 pt-2">
            
            {/* Top Date Header above Teacher Signature */}
            <div className="flex justify-end text-[10px] text-slate-900 mb-1">
              <div className="text-center space-y-0.5 min-w-[240px]">
                <div className="font-semibold text-[9.5px]">{customLunarDate}</div>
                <div className="font-bold text-[10px]">{customLocation}, {customSolarDate}</div>
              </div>
            </div>

            {/* Signature Blocks (Left: Principal, Right: Homeroom Teacher) */}
            <div className="grid grid-cols-2 gap-4 text-center mt-2">
              
              {/* Left: School Principal */}
              <div className="space-y-1">
                <div className="font-bold text-[10.5px]">បានឃើញ និងឯកភាព</div>
                <div className="font-moul text-[11px] leading-normal">{customPrincipalTitle}</div>
                {/* Spacer for physical stamp & signature */}
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic no-print">(ហត្ថលេខា និងត្រា)</span>
                </div>
              </div>

              {/* Right: Homeroom Teacher */}
              <div className="space-y-1">
                <div className="font-moul text-[11px] leading-normal">{customTeacherTitle}</div>
                {/* Spacer for physical signature */}
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic no-print">(ហត្ថលេខា)</span>
                </div>
                <div className="font-bold text-[11px] text-slate-900 font-khmer-heading">
                  {customTeacherName}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
