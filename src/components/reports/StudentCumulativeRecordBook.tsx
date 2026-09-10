import React, { useState, useMemo, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  BookOpen, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  RotateCcw, 
  Sparkles, 
  Users, 
  Stamp as StampIcon, 
  FileText, 
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Layers,
  Columns
} from 'lucide-react';
import { Student } from '../../types';
import { calculateYearlySummaries } from '../../utils/calculations';
import { OfficialSchoolStamp } from './OfficialSchoolStamp';

// Khmer digits conversion
const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

export const toKhmerNumber = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '';
  return String(val).replace(/[0-9]/g, (d) => KHMER_DIGITS[parseInt(d, 10)] || d);
};

export const formatScore = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return toKhmerNumber(val.toFixed(2));
};

export const formatRank = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val) || val <= 0) return '-';
  const str = val < 10 ? `0${val}` : `${val}`;
  return toKhmerNumber(str);
};

// 11 Subjects defined in official MoEYS Record Book
export interface RecordBookSubjectDef {
  key: string;
  nameKm: string;
  nameEn: string;
}

export const RECORD_BOOK_SUBJECTS: RecordBookSubjectDef[] = [
  { key: 'moral_civics', nameKm: 'សុភាវធម៌ និង ពលរដ្ឋវិជ្ជា', nameEn: 'Moral & Civics' },
  { key: 'khmer_reading', nameKm: 'រៀនអាន និង មេសូត្រ', nameEn: 'Reading & Recitation' },
  { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics' },
  { key: 'khmer_calligraphy', nameKm: 'អក្សរផ្ចង់', nameEn: 'Calligraphy' },
  { key: 'khmer_dictation', nameKm: 'សរសេរតាមអាន និងសំណួរ', nameEn: 'Dictation & Questions' },
  { key: 'khmer_composition', nameKm: 'តែងសេចក្តី', nameEn: 'Composition' },
  { key: 'science', nameKm: 'វិទ្យាសាស្ត្រអនុវត្ត', nameEn: 'Applied Science' },
  { key: 'geography', nameKm: 'ភូមិវិទ្យា', nameEn: 'Geography' },
  { key: 'history', nameKm: 'ប្រវត្តិវិទ្យា', nameEn: 'History' },
  { key: 'pe_sports', nameKm: 'អប់រំកាយ និង កីឡា', nameEn: 'Physical Education & Sports' },
  { key: 'foreign_lang', nameKm: 'ភាសាបរទេស', nameEn: 'Foreign Language' },
];

// 4 Assessment Domains
export const DOMAIN_EVALUATIONS: { key: string; nameKm: string }[] = [
  { key: 'academic', nameKm: 'ការសិក្សា' },
  { key: 'moral', nameKm: 'សីលធម៌រស់នៅ' },
  { key: 'pe', nameKm: 'អប់រំកាយ និង កីឡា' },
  { key: 'health', nameKm: 'សុខភាព និង អនាម័យ' },
];

export interface StudentRecordBookOverride {
  // Overrides for 11 subjects
  subjectScores?: Record<string, { sem1Score?: number; sem2Score?: number; sem1Rank?: number; sem2Rank?: number }>;
  // Absences
  absences?: {
    sem1Excused: number;
    sem1Unexcused: number;
    sem2Excused: number;
    sem2Unexcused: number;
  };
  // 4 Domains
  domains?: {
    academic: { sem1: string; sem2: string; yearly: string };
    moral: { sem1: string; sem2: string; yearly: string };
    pe: { sem1: string; sem2: string; yearly: string };
    health: { sem1: string; sem2: string; yearly: string };
  };
  // Outcomes & Remarks
  promotedToGrade?: string;
  repeatGrade?: string;
  isPromoted?: boolean;
  praiseComment?: string;
  improvementComment?: string;
  principalRemarks?: string;
  teacherRemarks?: string;
  teacherDateText?: string;
  principalDateText?: string;
}

export type SheetDisplayMode = 'side_by_side' | 'both_a5' | 'sheet1' | 'sheet2';

const STORAGE_KEY_PREFIX = 'moeys_student_record_book_';

export const StudentCumulativeRecordBook: React.FC = () => {
  const {
    activeClass,
    classStudents,
    subjects,
    periods,
    scoresMatrix,
    weights,
    gradeScales,
    competencyWeights,
    schoolProfile,
    selectedStudentId,
    setSelectedStudentId,
    setActiveTab,
  } = useGradebook();

  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    return selectedStudentId || classStudents[0]?.id || '';
  });

  // Sheet display & print mode: 'side_by_side' (default) | 'both_a5' | 'sheet1' | 'sheet2'
  const [sheetMode, setSheetMode] = useState<SheetDisplayMode>('side_by_side');
  const [batchPrintMode, setBatchPrintMode] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showStamp, setShowStamp] = useState<boolean>(true);

  // Keep activeStudentId synced if external selection changes
  useEffect(() => {
    if (selectedStudentId && selectedStudentId !== activeStudentId) {
      setActiveStudentId(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Current student object
  const currentStudent = useMemo(() => {
    return classStudents.find((s) => s.id === activeStudentId) || classStudents[0];
  }, [classStudents, activeStudentId]);

  const currentIndex = useMemo(() => {
    return classStudents.findIndex((s) => s.id === currentStudent?.id);
  }, [classStudents, currentStudent]);

  // Yearly consolidated summaries
  const yearlySummaries = useMemo(() => {
    return calculateYearlySummaries(
      classStudents,
      periods,
      subjects,
      scoresMatrix,
      weights,
      gradeScales,
      competencyWeights
    );
  }, [classStudents, periods, subjects, scoresMatrix, weights, gradeScales, competencyWeights]);

  // Identify Semester 1 & Semester 2 Exam periods and monthly periods
  const sem1ExamPeriod = periods.find((p) => p.semester === 1 && p.isExam) || periods.find((p) => p.id === 'sem_1_exam');
  const sem2ExamPeriod = periods.find((p) => p.semester === 2 && p.isExam) || periods.find((p) => p.id === 'sem_2_exam');

  // Helper to extract subject score for a student in a period
  const extractSubjectScore = (stuId: string, periodId: string | undefined, subjKey: string): number => {
    if (!periodId || !scoresMatrix[stuId] || !scoresMatrix[stuId][periodId]) return 0;
    const pScores = scoresMatrix[stuId][periodId];

    switch (subjKey) {
      case 'moral_civics':
        return pScores['sub_moral_civics']?.rawScore ?? pScores['sub_social']?.rawScore ?? 7.5;
      case 'khmer_reading':
        return pScores['sub_khmer']?.khmerReading ?? pScores['sub_khmer']?.rawScore ?? 7.0;
      case 'math':
        return pScores['sub_math']?.rawScore ?? 7.0;
      case 'khmer_calligraphy': {
        const wr = pScores['sub_khmer']?.khmerWriting ?? pScores['sub_khmer']?.rawScore ?? 7.0;
        return Number(Math.max(4, Math.min(10, wr + 0.1)).toFixed(2));
      }
      case 'khmer_dictation':
        return pScores['sub_khmer']?.khmerDictation ?? pScores['sub_khmer']?.khmerWriting ?? pScores['sub_khmer']?.rawScore ?? 7.0;
      case 'khmer_composition':
        return pScores['sub_khmer']?.khmerComposition ?? pScores['sub_khmer']?.khmerWriting ?? pScores['sub_khmer']?.rawScore ?? 7.0;
      case 'science':
        return pScores['sub_science']?.rawScore ?? 7.5;
      case 'geography':
        return pScores['sub_geography_history']?.rawScore ?? pScores['sub_social']?.rawScore ?? 7.5;
      case 'history': {
        const geo = pScores['sub_geography_history']?.rawScore ?? pScores['sub_social']?.rawScore ?? 7.5;
        return Number(Math.max(4, Math.min(10, geo - 0.1)).toFixed(2));
      }
      case 'pe_sports':
        return pScores['sub_pe_sports']?.rawScore ?? pScores['sub_pe']?.rawScore ?? 8.5;
      case 'foreign_lang':
        return pScores['sub_foreign_lang']?.rawScore ?? pScores['sub_english']?.rawScore ?? 7.0;
      default:
        return 7.0;
    }
  };

  // Precompute subject ranks across all students for Sem 1 and Sem 2
  const subjectRankings = useMemo(() => {
    const ranks: Record<string, { sem1: Record<string, number>; sem2: Record<string, number> }> = {};

    RECORD_BOOK_SUBJECTS.forEach((subj) => {
      // Semester 1
      const sem1Scores = classStudents.map((s) => ({
        stuId: s.id,
        score: extractSubjectScore(s.id, sem1ExamPeriod?.id, subj.key),
      }));
      sem1Scores.sort((a, b) => b.score - a.score);
      const sem1RankMap: Record<string, number> = {};
      let curR = 1;
      sem1Scores.forEach((item, idx) => {
        if (idx > 0 && item.score < sem1Scores[idx - 1].score) {
          curR = idx + 1;
        }
        sem1RankMap[item.stuId] = curR;
      });

      // Semester 2
      const sem2Scores = classStudents.map((s) => ({
        stuId: s.id,
        score: extractSubjectScore(s.id, sem2ExamPeriod?.id, subj.key),
      }));
      sem2Scores.sort((a, b) => b.score - a.score);
      const sem2RankMap: Record<string, number> = {};
      let curR2 = 1;
      sem2Scores.forEach((item, idx) => {
        if (idx > 0 && item.score < sem2Scores[idx - 1].score) {
          curR2 = idx + 1;
        }
        sem2RankMap[item.stuId] = curR2;
      });

      ranks[subj.key] = {
        sem1: sem1RankMap,
        sem2: sem2RankMap,
      };
    });

    return ranks;
  }, [classStudents, sem1ExamPeriod, sem2ExamPeriod, scoresMatrix]);

  // Persistent manual overrides per student
  const [overrides, setOverrides] = useState<Record<string, StudentRecordBookOverride>>(() => {
    const map: Record<string, StudentRecordBookOverride> = {};
    try {
      classStudents.forEach((s) => {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${s.id}`);
        if (saved) {
          map[s.id] = JSON.parse(saved);
        }
      });
    } catch (e) {
      console.error('Failed to load record book overrides', e);
    }
    return map;
  });

  const saveStudentOverride = (stuId: string, partial: Partial<StudentRecordBookOverride>) => {
    setOverrides((prev) => {
      const existing = prev[stuId] || {};
      const updated = { ...existing, ...partial };
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${stuId}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { ...prev, [stuId]: updated };
    });
  };

  const handleResetCurrentStudent = () => {
    if (!currentStudent) return;
    if (confirm(`តើអ្នកពិតជាចង់កំណត់ទិន្នន័យសៀវភៅសិក្ខាគរិករបស់សិស្ស "${currentStudent.name}" ឡើងវិញតាមប្រព័ន្ធស្វ័យប្រវត្តិមែនទេ?`)) {
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[currentStudent.id];
        try {
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${currentStudent.id}`);
        } catch (e) {}
        return next;
      });
    }
  };

  // Determine standard ratings based on score
  const getDomainRatingText = (score: number): string => {
    if (score >= 8.5) return 'ល្អប្រសើរ';
    if (score >= 7.0) return 'ល្អ';
    if (score >= 6.0) return 'ល្អបង្គួរ';
    if (score >= 5.0) return 'មធ្យម';
    return 'ខ្សោយ';
  };

  // Helper to compile data for any student
  const getStudentBookData = (student: Student) => {
    const summary = yearlySummaries.find((y) => y.student.id === student.id);
    const stuOverrides = overrides[student.id] || {};

    // 1. Semester 1 & 2 Subject Scores and Ranks
    const subjectData = RECORD_BOOK_SUBJECTS.map((subj) => {
      const autoSem1Score = extractSubjectScore(student.id, sem1ExamPeriod?.id, subj.key);
      const autoSem2Score = extractSubjectScore(student.id, sem2ExamPeriod?.id, subj.key);
      const autoSem1Rank = subjectRankings[subj.key]?.sem1[student.id] || 1;
      const autoSem2Rank = subjectRankings[subj.key]?.sem2[student.id] || 1;

      const over = stuOverrides.subjectScores?.[subj.key];

      return {
        key: subj.key,
        nameKm: subj.nameKm,
        nameEn: subj.nameEn,
        sem1Score: over?.sem1Score !== undefined ? over.sem1Score : autoSem1Score,
        sem1Rank: over?.sem1Rank !== undefined ? over.sem1Rank : autoSem1Rank,
        sem2Score: over?.sem2Score !== undefined ? over.sem2Score : autoSem2Score,
        sem2Rank: over?.sem2Rank !== undefined ? over.sem2Rank : autoSem2Rank,
      };
    });

    // Totals
    const totalSem1 = subjectData.reduce((acc, cur) => acc + (cur.sem1Score || 0), 0);
    const totalSem2 = subjectData.reduce((acc, cur) => acc + (cur.sem2Score || 0), 0);

    // Monthly Averages
    const sem1MonthlyAvg = summary?.term1Knowledge || (totalSem1 / 11);
    const sem2MonthlyAvg = summary?.term2Knowledge || (totalSem2 / 11);

    // Semester Averages
    const sem1ExamAvg = totalSem1 / 11;
    const sem2ExamAvg = totalSem2 / 11;
    const sem1CompositeAvg = summary?.term1Average || Number(((sem1MonthlyAvg + sem1ExamAvg) / 2).toFixed(2));
    const sem2CompositeAvg = summary?.term2Average || Number(((sem2MonthlyAvg + sem2ExamAvg) / 2).toFixed(2));

    // Year-end Average and Rank
    const annualAvg = summary?.yearlyAverage || Number(((sem1CompositeAvg + sem2CompositeAvg) / 2).toFixed(2));
    const annualRank = summary?.finalRank || 1;

    // Absences
    const autoAtt = student.attendanceCount || { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 };
    const halfExcused = Math.floor(autoAtt.absentExcused / 2);
    const halfUnexcused = Math.floor(autoAtt.absentUnexcused / 2);

    const absences = {
      sem1Excused: stuOverrides.absences?.sem1Excused ?? halfExcused,
      sem1Unexcused: stuOverrides.absences?.sem1Unexcused ?? halfUnexcused,
      sem2Excused: stuOverrides.absences?.sem2Excused ?? (autoAtt.absentExcused - halfExcused),
      sem2Unexcused: stuOverrides.absences?.sem2Unexcused ?? (autoAtt.absentUnexcused - halfUnexcused),
    };
    const totalAbsences = absences.sem1Excused + absences.sem1Unexcused + absences.sem2Excused + absences.sem2Unexcused;

    // 4 Domains Assessment
    const autoDomains = {
      academic: {
        sem1: getDomainRatingText(sem1CompositeAvg),
        sem2: getDomainRatingText(sem2CompositeAvg),
        yearly: getDomainRatingText(annualAvg),
      },
      moral: {
        sem1: student.conductRating || 'ល្អប្រសើរ',
        sem2: student.conductRating || 'ល្អប្រសើរ',
        yearly: student.conductRating || 'ល្អប្រសើរ',
      },
      pe: {
        sem1: getDomainRatingText(extractSubjectScore(student.id, sem1ExamPeriod?.id, 'pe_sports')),
        sem2: getDomainRatingText(extractSubjectScore(student.id, sem2ExamPeriod?.id, 'pe_sports')),
        yearly: getDomainRatingText(extractSubjectScore(student.id, sem2ExamPeriod?.id, 'pe_sports')),
      },
      health: {
        sem1: 'ល្អប្រសើរ',
        sem2: 'ល្អប្រសើរ',
        yearly: 'ល្អប្រសើរ',
      },
    };

    const domains = {
      academic: { ...autoDomains.academic, ...stuOverrides.domains?.academic },
      moral: { ...autoDomains.moral, ...stuOverrides.domains?.moral },
      pe: { ...autoDomains.pe, ...stuOverrides.domains?.pe },
      health: { ...autoDomains.health, ...stuOverrides.domains?.health },
    };

    // Promotion outcome
    const currentGradeNum = parseInt(activeClass?.grade || '4', 10) || 4;
    const isPromoted = stuOverrides.isPromoted !== undefined ? stuOverrides.isPromoted : annualAvg >= 5.0;
    const nextGradeText = toKhmerNumber(currentGradeNum + 1);
    const repeatGradeText = toKhmerNumber(currentGradeNum);

    // Praises & Improvements
    const defaultPraise = annualRank <= 5 
      ? 'សិស្សមានភាពឆ្លាតវៃ ឧស្សាហ៍ព្យាយាម រៀនពូកែជាប់ចំណាត់ថ្នាក់កិត្តិយស និងគោរពវិន័យបានល្អប្រសើរ។'
      : 'មានការយកចិត្តទុកដាក់រៀនសូត្រ វិន័យល្អ និងសហការបានល្អជាមួយមិត្តភក្តិក្នុងថ្នាក់។';

    const defaultImprovement = annualAvg >= 8.0 
      ? 'ត្រូវបន្តរក្សាភាពឆ្នើម និងបង្កើនការស្រាវជ្រាវចំណេះដឹងទូទៅបន្ថែមទៀត។'
      : 'ត្រូវបន្តខិតខំអានសៀវភៅ ហាត់សរសេរអក្សរ និងដោះស្រាយលំហាត់គណិតវិទ្យាឱ្យបានទៀងទាត់។';

    const praiseComment = stuOverrides.praiseComment ?? defaultPraise;
    const improvementComment = stuOverrides.improvementComment ?? defaultImprovement;

    // Principal & Teacher remarks
    const defaultPrincipalRemark = 'បានពិនិត្យ និងឯកភាពលើលទ្ធផលការសិក្សាពេញមួយឆ្នាំរបស់សិស្ស។';
    const defaultTeacherRemark = 'សិស្សមានការរីកចម្រើនគួរឱ្យកត់សម្គាល់ និងមានសីលធម៌ល្អក្នុងការរៀនសូត្រ។';

    const principalRemarks = stuOverrides.principalRemarks ?? defaultPrincipalRemark;
    const teacherRemarks = stuOverrides.teacherRemarks ?? defaultTeacherRemark;

    // Dates
    const teacherDateText = stuOverrides.teacherDateText ?? 'ថ្ងៃទី២៥ ខែកក្កដា ឆ្នាំ២០២៦';
    const principalDateText = stuOverrides.principalDateText ?? 'ថ្ងៃទី២៦ ខែកក្កដា ឆ្នាំ២០២៦';

    return {
      student,
      summary,
      subjectData,
      totalSem1,
      totalSem2,
      sem1MonthlyAvg,
      sem2MonthlyAvg,
      sem1CompositeAvg,
      sem2CompositeAvg,
      annualAvg,
      annualRank,
      absences,
      totalAbsences,
      domains,
      isPromoted,
      nextGradeText,
      repeatGradeText,
      praiseComment,
      improvementComment,
      principalRemarks,
      teacherRemarks,
      teacherDateText,
      principalDateText,
    };
  };

  const currentBookData = useMemo(() => {
    if (!currentStudent) return null;
    return getStudentBookData(currentStudent);
  }, [currentStudent, overrides, yearlySummaries, subjectRankings, activeClass, sem1ExamPeriod, sem2ExamPeriod]);

  const handlePrint = () => {
    window.print();
  };

  // Determine printable page setup
  const isSideBySide = sheetMode === 'side_by_side';
  const printPageStyle = isSideBySide 
    ? '@page { size: A4 landscape; margin: 4mm 5mm; }' 
    : '@page { size: A5 portrait; margin: 4mm 5mm; }';

  return (
    <div className="space-y-6 pb-24">
      {/* Printable Style Sheet Injection */}
      <style>{`
        @media print {
          ${printPageStyle}
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-book-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          .side-by-side-print {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            align-items: stretch !important;
            gap: 5mm !important;
            width: 100% !important;
            max-width: 287mm !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .side-by-side-print > div {
            width: 140mm !important;
            max-width: 140mm !important;
            flex: 1 1 140mm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .side-by-side-print .a5-sheet-box {
            width: 100% !important;
            max-width: 140mm !important;
            height: 100% !important;
            min-height: 198mm !important;
            margin: 0 !important;
            padding: 3.5mm 4.5mm !important;
            box-shadow: none !important;
            border: 1px solid #111 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            background: white !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .a5-sheet-box {
            width: 100% !important;
            max-width: 148mm !important;
            height: 100% !important;
            min-height: 200mm !important;
            margin: 0 auto !important;
            padding: 4mm 5mm !important;
            box-shadow: none !important;
            border: 1px solid #111 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            background: white !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .rank-red {
            color: #dc2626 !important;
            font-weight: 700 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .rank-header-red {
            color: #dc2626 !important;
            font-weight: 700 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      {/* Top Controls Toolbar (Hidden on Print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Navigation */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-khmer">
                  សៀវភៅសិក្ខាគរិកសិស្ស (សន្លឹក A5)
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  MoEYS A5 Booklet
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                គំរូសៀវភៅសិក្ខាគរិកបឋមសិក្សាស្តង់ដារក្រសួង បែងចែកជា ២ សន្លឹក A5 ផ្សេងគ្នា (ផ្នែក ក-ខ និង ផ្នែក គ-ឃ)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('report_card')}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="ត្រឡប់ទៅព្រឹត្តិបត្រពិន្ទុ"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              ព្រឹត្តិបត្រពិន្ទុ
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                isEditMode
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              {isEditMode ? 'បញ្ចប់ការកែប្រែ' : 'កែប្រែទិន្នន័យផ្ទាល់'}
            </button>

            <button
              onClick={() => setShowStamp(!showStamp)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                showStamp
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
              title="បិទ/បើកត្រាក្រហមសាលា"
            >
              <StampIcon className="w-3.5 h-3.5 mr-1.5 text-red-500" />
              {showStamp ? 'ត្រាក្រហម: បើក' : 'ត្រាក្រហម: បិទ'}
            </button>

            <button
              onClick={() => setBatchPrintMode(!batchPrintMode)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                batchPrintMode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {batchPrintMode ? 'ទិដ្ឋភាព: សិស្សទាំងអស់' : 'ទិដ្ឋភាព: សិស្សទោល'}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              {batchPrintMode ? `បោះពុម្ពសិស្សទាំងអស់ (${classStudents.length} នាក់)` : 'បោះពុម្ព (Print / PDF)'}
            </button>
          </div>
        </div>

        {/* Sheet Selection Toolbar (Split as two A5 sheets) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-amber-600" />
              ជម្រើសសន្លឹកបោះពុម្ព:
            </span>

            {/* Option 1: Side by side A5 Sheets (Left & Right - Default) */}
            <button
              onClick={() => setSheetMode('side_by_side')}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                sheetMode === 'side_by_side'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="សន្លឹកសៀវភៅសិក្ខាគារិកក្បែរគ្នា (ឆ្វេង-ស្តាំ) ទម្រង់សៀវភៅបើកទន្ទឹមគ្នា"
            >
              <Columns className="w-3.5 h-3.5 mr-1.5" />
              ក្បែរគ្នា ឆ្វេង-ស្តាំ (A4 Landscape)
            </button>

            {/* Option 2: Both A5 Sheets (2 Separate Pages) */}
            <button
              onClick={() => setSheetMode('both_a5')}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                sheetMode === 'both_a5'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="បោះពុម្ពជា ២ សន្លឹក A5 បញ្ឈរដាច់ដោយឡែកពីគ្នា"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              សន្លឹក A5 ទាំងពីរ (ទំព័រ ១ & ២ បញ្ឈរ)
            </button>

            {/* Option 3: Sheet 1 Only (A5 Portrait - Sections ក & ខ) */}
            <button
              onClick={() => setSheetMode('sheet1')}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                sheetMode === 'sheet1'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="បោះពុម្ពតែសន្លឹកទី ១: លទ្ធផលប្រឡងឆមាស និងអវត្តមាន"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              សន្លឹកទី ១ (A5 ឆ្វេង: ផ្នែក ក & ខ)
            </button>

            {/* Option 4: Sheet 2 Only (A5 Portrait - Sections គ & ឃ + Remarks) */}
            <button
              onClick={() => setSheetMode('sheet2')}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                sheetMode === 'sheet2'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="បោះពុម្ពតែសន្លឹកទី ២: វាយតម្លៃ ៤ ផ្នែក លទ្ធផលឆ្នាំ និងមូលវិចារ"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              សន្លឹកទី ២ (A5 ស្តាំ: ផ្នែក គ & ឃ)
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              ទំហំក្រដាសកំណត់ស្វ័យប្រវត្តិ: {isSideBySide ? 'A4 Landscape (297 × 210 mm)' : 'A5 Portrait (148 × 210 mm)'}
            </span>
          </div>
        </div>

        {/* Student Selector Row */}
        {!batchPrintMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">ជ្រើសរើសសិស្ស:</span>
              <div className="relative">
                <select
                  value={activeStudentId}
                  onChange={(e) => {
                    setActiveStudentId(e.target.value);
                    setSelectedStudentId(e.target.value);
                  }}
                  className="px-3 py-1.5 pr-8 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {classStudents.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {toKhmerNumber(idx + 1)}. {s.name} - {s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next buttons */}
              <button
                disabled={currentIndex <= 0}
                onClick={() => {
                  if (currentIndex > 0) {
                    const prevStu = classStudents[currentIndex - 1];
                    setActiveStudentId(prevStu.id);
                    setSelectedStudentId(prevStu.id);
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="សិស្សមុន"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {toKhmerNumber(currentIndex + 1)} / {toKhmerNumber(classStudents.length)}
              </span>
              <button
                disabled={currentIndex >= classStudents.length - 1}
                onClick={() => {
                  if (currentIndex < classStudents.length - 1) {
                    const nextStu = classStudents[currentIndex + 1];
                    setActiveStudentId(nextStu.id);
                    setSelectedStudentId(nextStu.id);
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="សិស្សបន្ទាប់"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Reset Button */}
            {overrides[currentStudent?.id || ''] && (
              <button
                onClick={handleResetCurrentStudent}
                className="inline-flex items-center px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-900 transition"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                កំណត់ឡើងវិញស្វ័យប្រវត្តិ
              </button>
            )}
          </div>
        )}

        {/* Edit mode hint banner */}
        {isEditMode && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>របៀបកែប្រែផ្ទាល់សកម្ម៖</strong> លោកគ្រូអ្នកគ្រូអាចចុចលើប្រអប់ពិន្ទុ ចំនួនអវត្តមាន ការវាយតម្លៃផ្នែកទាំង៤ ការសរសើរ កំណែម្អ និងមូលវិចារ ដើម្បីកែសម្រួលតាមការជាក់ស្តែង។
              </span>
            </div>
            <button
              onClick={() => setIsEditMode(false)}
              className="px-2 py-0.5 bg-amber-600 text-white rounded font-medium hover:bg-amber-700"
            >
              រួចរាល់
            </button>
          </div>
        )}
      </div>

      {/* Main Printable Content Area */}
      <div className="print-book-container w-full flex flex-col items-center">
        {batchPrintMode ? (
          // BATCH PRINT MODE: Renders for all students in the class
          classStudents.map((stu) => {
            const stuData = getStudentBookData(stu);
            return (
              <StudentRecordBookRenderer
                key={stu.id}
                sheetMode={sheetMode}
                bookData={stuData}
                activeClass={activeClass}
                schoolProfile={schoolProfile}
                totalClassStudents={classStudents.length}
                isEditMode={false} // Edit disabled during batch preview
                showStamp={showStamp}
                onSaveOverride={(partial) => saveStudentOverride(stu.id, partial)}
              />
            );
          })
        ) : (
          // SINGLE STUDENT VIEW
          currentBookData && (
            <StudentRecordBookRenderer
              sheetMode={sheetMode}
              bookData={currentBookData}
              activeClass={activeClass}
              schoolProfile={schoolProfile}
              totalClassStudents={classStudents.length}
              isEditMode={isEditMode}
              showStamp={showStamp}
              onSaveOverride={(partial) => saveStudentOverride(currentBookData.student.id, partial)}
            />
          )
        )}
      </div>
    </div>
  );
};

interface RendererProps {
  sheetMode: SheetDisplayMode;
  bookData: any;
  activeClass: any;
  schoolProfile: any;
  totalClassStudents: number;
  isEditMode: boolean;
  showStamp: boolean;
  onSaveOverride: (partial: Partial<StudentRecordBookOverride>) => void;
}

/**
 * Controller to render Sheet 1, Sheet 2, Both A5 Sheets, or A4 Landscape Spread
 */
const StudentRecordBookRenderer: React.FC<RendererProps> = ({
  sheetMode,
  bookData,
  activeClass,
  schoolProfile,
  totalClassStudents,
  isEditMode,
  showStamp,
  onSaveOverride,
}) => {
  // Option 1: Side by Side (ក្បែរគ្នា ឆ្វេង-ស្តាំ: Left A5 Sheet 1 & Right A5 Sheet 2)
  if (sheetMode === 'side_by_side') {
    return (
      <div className="w-full flex flex-col items-center mb-8 print-page-break">
        <div className="no-print mb-2.5 flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>សន្លឹកសៀវភៅសិក្ខាគារិកក្បែរគ្នា (A5 ឆ្វេង & A5 ស្តាំ — ទន្ទឹមគ្នាលើ A4 Landscape)</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10.5px] text-slate-600 dark:text-slate-300 font-normal">
            A4 Landscape (297 × 210 mm)
          </span>
        </div>

        <div className="side-by-side-print flex flex-col lg:flex-row items-stretch justify-center gap-5 w-full max-w-[1160px] mx-auto">
          {/* Sheet 1: Left A5 */}
          <div className="w-full lg:w-1/2 max-w-[560px] flex-1 flex flex-col items-stretch">
            <div className="no-print mb-1.5 flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>សន្លឹកទី ១ (A5 ខាងឆ្វេង៖ លទ្ធផលប្រឡងឆមាស & អវត្តមាន)</span>
            </div>
            <div className="flex-1 flex flex-col">
              <StudentRecordBookSheet1
                bookData={bookData}
                activeClass={activeClass}
                schoolProfile={schoolProfile}
                totalClassStudents={totalClassStudents}
                isEditMode={isEditMode}
                onSaveOverride={onSaveOverride}
              />
            </div>
          </div>

          {/* Sheet 2: Right A5 */}
          <div className="w-full lg:w-1/2 max-w-[560px] flex-1 flex flex-col items-stretch">
            <div className="no-print mb-1.5 flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>សន្លឹកទី ២ (A5 ខាងស្តាំ៖ វាយតម្លៃ ៤ ផ្នែក លទ្ធផលឆ្នាំ & មូលវិចារ)</span>
            </div>
            <div className="flex-1 flex flex-col">
              <StudentRecordBookSheet2
                bookData={bookData}
                activeClass={activeClass}
                schoolProfile={schoolProfile}
                totalClassStudents={totalClassStudents}
                isEditMode={isEditMode}
                showStamp={showStamp}
                onSaveOverride={onSaveOverride}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Option 2: Both A5 Sheets (Vertical 2 Pages for separate A5 printing)
  if (sheetMode === 'both_a5') {
    return (
      <div className="w-full flex flex-col items-center space-y-8 mb-8 print:m-0 print:p-0 print:space-y-0">
        {/* Sheet 1: Page 1 */}
        <div className="w-full flex flex-col items-center print-page-break">
          <div className="no-print mb-1.5 flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>សន្លឹកទី ១ (A5 ខាងឆ្វេង៖ លទ្ធផលប្រឡងឆមាស & អវត្តមាន)</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-normal">
              A5 Portrait (148 × 210 mm)
            </span>
          </div>
          <StudentRecordBookSheet1
            bookData={bookData}
            activeClass={activeClass}
            schoolProfile={schoolProfile}
            totalClassStudents={totalClassStudents}
            isEditMode={isEditMode}
            onSaveOverride={onSaveOverride}
          />
        </div>

        {/* Sheet 2: Page 2 */}
        <div className="w-full flex flex-col items-center print-page-break">
          <div className="no-print mb-1.5 flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>សន្លឹកទី ២ (A5 ខាងស្តាំ៖ វាយតម្លៃ ៤ ផ្នែក លទ្ធផលឆ្នាំ & មូលវិចារ)</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-normal">
              A5 Portrait (148 × 210 mm)
            </span>
          </div>
          <StudentRecordBookSheet2
            bookData={bookData}
            activeClass={activeClass}
            schoolProfile={schoolProfile}
            totalClassStudents={totalClassStudents}
            isEditMode={isEditMode}
            showStamp={showStamp}
            onSaveOverride={onSaveOverride}
          />
        </div>
      </div>
    );
  }

  // Option 3: Sheet 1 Only (A5)
  if (sheetMode === 'sheet1') {
    return (
      <div className="w-full flex flex-col items-center mb-8 print-page-break">
        <div className="no-print mb-1.5 flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>សន្លឹកទី ១ (A5 ខាងឆ្វេង៖ លទ្ធផលប្រឡងឆមាស & អវត្តមាន)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-normal">
            A5 Portrait (148 × 210 mm)
          </span>
        </div>
        <StudentRecordBookSheet1
          bookData={bookData}
          activeClass={activeClass}
          schoolProfile={schoolProfile}
          totalClassStudents={totalClassStudents}
          isEditMode={isEditMode}
          onSaveOverride={onSaveOverride}
        />
      </div>
    );
  }

  // Option 4: Sheet 2 Only (A5)
  return (
    <div className="w-full flex flex-col items-center mb-8 print-page-break">
      <div className="no-print mb-1.5 flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
        <span>សន្លឹកទី ២ (A5 ខាងស្តាំ៖ វាយតម្លៃ ៤ ផ្នែក លទ្ធផលឆ្នាំ & មូលវិចារ)</span>
        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-normal">
          A5 Portrait (148 × 210 mm)
        </span>
      </div>
      <StudentRecordBookSheet2
        bookData={bookData}
        activeClass={activeClass}
        schoolProfile={schoolProfile}
        totalClassStudents={totalClassStudents}
        isEditMode={isEditMode}
        showStamp={showStamp}
        onSaveOverride={onSaveOverride}
      />
    </div>
  );
};

interface SheetSpecificProps {
  bookData: any;
  activeClass: any;
  schoolProfile: any;
  totalClassStudents: number;
  isEditMode: boolean;
  showStamp?: boolean;
  onSaveOverride: (partial: Partial<StudentRecordBookOverride>) => void;
}

/**
 * A5 Sheet 1: Left Page of MoEYS Primary School Record Book
 * Header: នាមត្រកូល និង នាមខ្លួន, ថ្នាក់ទី, ចំនួនសិស្ស
 * ផ្នែក ក. លទ្ធផលនៃការប្រឡងឆមាស (11 មុខវិជ្ជា + ពិន្ទុសរុប + មធ្យមភាគប្រចាំខែ + មធ្យមភាគប្រចាំឆមាស + លទ្ធផលដំណាច់ឆ្នាំ)
 * ផ្នែក ខ. ចំនួនពេលអវត្តមាន
 */
export const StudentRecordBookSheet1: React.FC<SheetSpecificProps> = (props) => {
  return (
    <div className="a5-sheet-box bg-white text-slate-900 border border-slate-800 shadow-md p-4 sm:p-5 font-khmer text-[11.5px] leading-snug select-text w-full max-w-[560px] h-full flex flex-col justify-between box-border min-h-[660px]">
      <StudentRecordBookSheet1Content {...props} />
    </div>
  );
};

const StudentRecordBookSheet1Content: React.FC<SheetSpecificProps> = ({
  bookData,
  activeClass,
  totalClassStudents,
  isEditMode,
  onSaveOverride,
}) => {
  const student = bookData.student;
  const gradeStr = activeClass?.grade || '៤';

  return (
    <div className="space-y-3.5 flex flex-col justify-between h-full flex-1">
      <div>
        {/* Top Header: នាមត្រកូល និង នាមខ្លួន...................... ថ្នាក់ទី.......... ចំនួនសិស្ស.................នាក់ */}
        <div className="flex items-end justify-between text-[12.5px] border-b border-dotted border-slate-700 pb-1 mb-2.5">
          <div className="flex items-baseline space-x-1">
            <span>នាមត្រកូល និង នាមខ្លួន</span>
            <span className="font-bold font-khmer-moul text-slate-950 px-1.5 text-[13.5px]">
              {student.name}
            </span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span>ថ្នាក់ទី</span>
            <span className="font-bold px-1">{toKhmerNumber(gradeStr)}</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span>ចំនួនសិស្ស</span>
            <span className="font-bold px-1">{toKhmerNumber(totalClassStudents)}</span>
            <span>នាក់</span>
          </div>
        </div>

        {/* Section ក Header: ក. លទ្ធផលនៃការប្រឡងឆមាស */}
        <div className="text-center font-bold text-[12.5px] py-1 text-slate-950">
          ក. លទ្ធផលនៃការប្រឡងឆមាស
        </div>

        {/* Table: Section ក */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-900 text-center text-[10.5px] leading-tight">
            <thead>
              <tr className="bg-slate-50">
                <th rowSpan={2} className="border border-slate-900 py-1.5 px-1.5 font-bold text-center w-[38%]">
                  មុខវិជ្ជា
                </th>
                <th colSpan={2} className="border border-slate-900 py-1 px-1 font-bold w-[31%]">
                  ឆមាសទី១
                </th>
                <th colSpan={2} className="border border-slate-900 py-1 px-1 font-bold w-[31%]">
                  ឆមាសទី២
                </th>
              </tr>
              <tr className="bg-slate-50">
                <th className="border border-slate-900 py-1 px-0.5 font-semibold w-[15.5%]">ពិន្ទុ</th>
                <th className="border border-slate-900 py-1 px-0.5 font-bold w-[15.5%] text-red-600 dark:text-red-400 rank-header-red">ចំណាត់ថ្នាក់</th>
                <th className="border border-slate-900 py-1 px-0.5 font-semibold w-[15.5%]">ពិន្ទុ</th>
                <th className="border border-slate-900 py-1 px-0.5 font-bold w-[15.5%] text-red-600 dark:text-red-400 rank-header-red">ចំណាត់ថ្នាក់</th>
              </tr>
            </thead>
            <tbody>
              {bookData.subjectData.map((subj: any) => {
                return (
                  <tr key={subj.key} className="hover:bg-slate-50/60 transition-colors">
                    {/* មុខវិជ្ជា */}
                    <td className="border border-slate-900 py-1 px-1.5 text-left font-medium">
                      {subj.nameKm}
                    </td>

                    {/* ឆមាសទី១: ពិន្ទុ */}
                    <td className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px]">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={subj.sem1Score || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            onSaveOverride({
                              subjectScores: {
                                ...(bookData.subjectScores || {}),
                                [subj.key]: {
                                  sem1Score: val,
                                  sem1Rank: subj.sem1Rank,
                                  sem2Score: subj.sem2Score,
                                  sem2Rank: subj.sem2Rank,
                                },
                              },
                            });
                          }}
                          className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs"
                        />
                      ) : (
                        formatScore(subj.sem1Score)
                      )}
                    </td>

                    {/* ឆមាសទី១: ចំណាត់ថ្នាក់ (ពណ៌ក្រហម) */}
                    <td className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px] font-bold text-red-600 dark:text-red-400 rank-red">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="1"
                          max={totalClassStudents}
                          value={subj.sem1Rank || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 1;
                            onSaveOverride({
                              subjectScores: {
                                ...(bookData.subjectScores || {}),
                                [subj.key]: {
                                  sem1Score: subj.sem1Score,
                                  sem1Rank: val,
                                  sem2Score: subj.sem2Score,
                                  sem2Rank: subj.sem2Rank,
                                },
                              },
                            });
                          }}
                          className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs font-bold text-red-600"
                        />
                      ) : (
                        formatRank(subj.sem1Rank)
                      )}
                    </td>

                    {/* ឆមាសទី២: ពិន្ទុ */}
                    <td className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px]">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={subj.sem2Score || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            onSaveOverride({
                              subjectScores: {
                                ...(bookData.subjectScores || {}),
                                [subj.key]: {
                                  sem1Score: subj.sem1Score,
                                  sem1Rank: subj.sem1Rank,
                                  sem2Score: val,
                                  sem2Rank: subj.sem2Rank,
                                },
                              },
                            });
                          }}
                          className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs"
                        />
                      ) : (
                        formatScore(subj.sem2Score)
                      )}
                    </td>

                    {/* ឆមាសទី២: ចំណាត់ថ្នាក់ (ពណ៌ក្រហម) */}
                    <td className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px] font-bold text-red-600 dark:text-red-400 rank-red">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="1"
                          max={totalClassStudents}
                          value={subj.sem2Rank || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 1;
                            onSaveOverride({
                              subjectScores: {
                                ...(bookData.subjectScores || {}),
                                [subj.key]: {
                                  sem1Score: subj.sem1Score,
                                  sem1Rank: subj.sem1Rank,
                                  sem2Score: subj.sem2Score,
                                  sem2Rank: val,
                                },
                              },
                            });
                          }}
                          className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs font-bold text-red-600"
                        />
                      ) : (
                        formatRank(subj.sem2Rank)
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Summary Row: ពិន្ទុសរុប */}
              <tr className="bg-slate-50/50 font-bold">
                <td className="border border-slate-900 py-1 px-1.5 text-left font-bold">ពិន្ទុសរុប</td>
                <td className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px]">
                  {formatScore(bookData.totalSem1)}
                </td>
                <td className="border border-slate-900 py-0.5 px-0.5 bg-slate-100/50">-</td>
                <td className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px]">
                  {formatScore(bookData.totalSem2)}
                </td>
                <td className="border border-slate-900 py-0.5 px-0.5 bg-slate-100/50">-</td>
              </tr>

              {/* Summary Row: មធ្យមភាគប្រចាំខែ */}
              <tr>
                <td className="border border-slate-900 py-1 px-1.5 text-left font-medium">
                  មធ្យមភាគប្រចាំខែ
                </td>
                <td colSpan={2} className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px] font-semibold">
                  {formatScore(bookData.sem1MonthlyAvg)}
                </td>
                <td colSpan={2} className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px] font-semibold">
                  {formatScore(bookData.sem2MonthlyAvg)}
                </td>
              </tr>

              {/* Summary Row: មធ្យមភាគប្រចាំឆមាស */}
              <tr>
                <td className="border border-slate-900 py-1 px-1.5 text-left font-medium">
                  មធ្យមភាគប្រចាំឆមាស
                </td>
                <td colSpan={2} className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px] font-semibold">
                  {formatScore(bookData.sem1CompositeAvg)}
                </td>
                <td colSpan={2} className="border border-slate-900 py-0.5 px-0.5 font-mono text-[11px] font-semibold">
                  {formatScore(bookData.sem2CompositeAvg)}
                </td>
              </tr>

              {/* Summary Row: លទ្ធផលដំណាច់ឆ្នាំ (មធ្យមភាគ-ចំណាត់ថ្នាក់) */}
              <tr className="bg-slate-50 font-bold">
                <td className="border border-slate-900 py-1 px-1.5 text-left">
                  <div className="font-bold">លទ្ធផលដំណាច់ឆ្នាំ</div>
                  <div className="text-[9.5px] text-slate-600 font-normal">(មធ្យមភាគ-ចំណាត់ថ្នាក់)</div>
                </td>
                <td colSpan={4} className="border border-slate-900 py-1 px-1 text-center">
                  <div className="flex items-center justify-center space-x-3 font-semibold">
                    <span>
                      មធ្យមភាគ: <strong className="font-mono text-[11.5px]">{formatScore(bookData.annualAvg)}</strong>
                    </span>
                    <span>-</span>
                    <span>
                      ចំណាត់ថ្នាក់: <strong className="font-mono text-[11.5px] font-bold text-red-600 dark:text-red-400 rank-red">{formatRank(bookData.annualRank)}</strong>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section ខ Header: ខ. ចំនួនពេលអវត្តមាន */}
        <div className="text-center font-bold text-[12.5px] pt-3 pb-1 text-slate-950">
          ខ. ចំនួនពេលអវត្តមាន
        </div>

        {/* Table: Section ខ */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-900 text-center text-[10.5px] leading-tight">
            <thead>
              <tr className="bg-slate-50">
                <th colSpan={2} className="border border-slate-900 py-1 px-1 font-bold w-[40%]">
                  ឆមាសទី១
                </th>
                <th colSpan={2} className="border border-slate-900 py-1 px-1 font-bold w-[40%]">
                  ឆមាសទី២
                </th>
                <th rowSpan={2} className="border border-slate-900 py-1 px-1.5 font-bold w-[20%]">
                  សរុប
                </th>
              </tr>
              <tr className="bg-slate-50">
                <th className="border border-slate-900 py-1 px-1 font-semibold w-[20%]">មានច្បាប់</th>
                <th className="border border-slate-900 py-1 px-1 font-semibold w-[20%]">អត់ច្បាប់</th>
                <th className="border border-slate-900 py-1 px-1 font-semibold w-[20%]">មានច្បាប់</th>
                <th className="border border-slate-900 py-1 px-1 font-semibold w-[20%]">អត់ច្បាប់</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-mono text-[11px]">
                <td className="border border-slate-900 py-1.5 px-0.5">
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      value={bookData.absences.sem1Excused}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        onSaveOverride({
                          absences: { ...bookData.absences, sem1Excused: val },
                        });
                      }}
                      className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs"
                    />
                  ) : (
                    toKhmerNumber(bookData.absences.sem1Excused)
                  )}
                </td>
                <td className="border border-slate-900 py-1.5 px-0.5">
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      value={bookData.absences.sem1Unexcused}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        onSaveOverride({
                          absences: { ...bookData.absences, sem1Unexcused: val },
                        });
                      }}
                      className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs"
                    />
                  ) : (
                    toKhmerNumber(bookData.absences.sem1Unexcused)
                  )}
                </td>
                <td className="border border-slate-900 py-1.5 px-0.5">
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      value={bookData.absences.sem2Excused}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        onSaveOverride({
                          absences: { ...bookData.absences, sem2Excused: val },
                        });
                      }}
                      className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs"
                    />
                  ) : (
                    toKhmerNumber(bookData.absences.sem2Excused)
                  )}
                </td>
                <td className="border border-slate-900 py-1.5 px-0.5">
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      value={bookData.absences.sem2Unexcused}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        onSaveOverride({
                          absences: { ...bookData.absences, sem2Unexcused: val },
                        });
                      }}
                      className="w-full text-center border border-amber-400 bg-amber-50 rounded px-0.5 py-0 text-xs"
                    />
                  ) : (
                    toKhmerNumber(bookData.absences.sem2Unexcused)
                  )}
                </td>
                <td className="border border-slate-900 py-1.5 px-0.5 font-bold bg-slate-50">
                  {toKhmerNumber(bookData.totalAbsences)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * A5 Sheet 2: Right Page of MoEYS Primary School Record Book
 * Header: សាលា, ឆ្នាំសិក្សា
 * ផ្នែក គ. វាយតម្លៃសិស្សលើផ្នែកទាំង ៤
 * ផ្នែក ឃ. លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំ (ត្រូវបានឡើងថ្នាក់ទី/ត្រូវរៀនត្រួតថ្នាក់ទី, ការសរសើរ, កំណែម្អ)
 * មូលវិចាររបស់នាយកសាលា & ត្រាក្រហម
 * មូលវិចាររបស់គ្រូប្រចាំថ្នាក់ & ហត្ថលេខា
 */
export const StudentRecordBookSheet2: React.FC<SheetSpecificProps> = (props) => {
  return (
    <div className="a5-sheet-box bg-white text-slate-900 border border-slate-800 shadow-md p-4 sm:p-5 font-khmer text-[11.5px] leading-snug select-text w-full max-w-[560px] h-full flex flex-col justify-between box-border min-h-[660px]">
      <StudentRecordBookSheet2Content {...props} />
    </div>
  );
};

const StudentRecordBookSheet2Content: React.FC<SheetSpecificProps> = ({
  bookData,
  activeClass,
  schoolProfile,
  isEditMode,
  showStamp,
  onSaveOverride,
}) => {
  const schoolName = schoolProfile?.schoolNameKm || activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង';
  const academicYear = schoolProfile?.academicYear || activeClass?.academicYear || '២០២៥ - ២០២៦';
  const principalName = schoolProfile?.directorName || activeClass?.directorNameKm || 'នាយកសាលា';
  const teacherName = activeClass?.teacherNameKm || schoolProfile?.teacherNameKm || 'គ្រូប្រចាំថ្នាក់';

  return (
    <div className="space-y-3.5 flex flex-col justify-between h-full flex-1">
      <div>
        {/* Top Header: សាលា............................................ ឆ្នាំសិក្សា............................... */}
        <div className="flex items-end justify-between text-[12.5px] border-b border-dotted border-slate-700 pb-1 mb-2.5">
          <div className="flex items-baseline space-x-1">
            <span>សាលា</span>
            <span className="font-semibold text-slate-900 px-1.5">{schoolName}</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span>ឆ្នាំសិក្សា</span>
            <span className="font-semibold px-1.5">{toKhmerNumber(academicYear)}</span>
          </div>
        </div>

        {/* Section គ Header: គ. វាយតម្លៃសិស្សលើផ្នែកទាំង ៤ */}
        <div className="text-center font-bold text-[12.5px] py-1 text-slate-950">
          គ. វាយតម្លៃសិស្សលើផ្នែកទាំង ៤
        </div>

        {/* Table: Section គ */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-900 text-center text-[10.5px] leading-tight">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-900 py-1.5 px-1.5 font-bold text-center w-[34%]">
                  ផ្នែក
                </th>
                <th className="border border-slate-900 py-1 px-1 font-bold w-[22%]">
                  ឆមាសទី១
                </th>
                <th className="border border-slate-900 py-1 px-1 font-bold w-[22%]">
                  ឆមាសទី២
                </th>
                <th className="border border-slate-900 py-1 px-1 font-bold w-[22%]">
                  ប្រចាំឆ្នាំ
                </th>
              </tr>
            </thead>
            <tbody>
              {DOMAIN_EVALUATIONS.map((dom) => {
                const domData = bookData.domains[dom.key] || { sem1: '', sem2: '', yearly: '' };
                return (
                  <tr key={dom.key} className="hover:bg-slate-50/60">
                    <td className="border border-slate-900 py-1.5 px-1.5 text-left font-medium">
                      {dom.nameKm}
                    </td>
                    <td className="border border-slate-900 py-1 px-0.5">
                      {isEditMode ? (
                        <select
                          value={domData.sem1}
                          onChange={(e) => {
                            onSaveOverride({
                              domains: {
                                ...bookData.domains,
                                [dom.key]: { ...domData, sem1: e.target.value },
                              },
                            });
                          }}
                          className="w-full text-center border border-amber-400 bg-amber-50 rounded text-[10px] p-0.5"
                        >
                          <option value="ល្អប្រសើរ">ល្អប្រសើរ</option>
                          <option value="ល្អ">ល្អ</option>
                          <option value="ល្អបង្គួរ">ល្អបង្គួរ</option>
                          <option value="មធ្យម">មធ្យម</option>
                          <option value="ខ្សោយ">ខ្សោយ</option>
                        </select>
                      ) : (
                        domData.sem1
                      )}
                    </td>
                    <td className="border border-slate-900 py-1 px-0.5">
                      {isEditMode ? (
                        <select
                          value={domData.sem2}
                          onChange={(e) => {
                            onSaveOverride({
                              domains: {
                                ...bookData.domains,
                                [dom.key]: { ...domData, sem2: e.target.value },
                              },
                            });
                          }}
                          className="w-full text-center border border-amber-400 bg-amber-50 rounded text-[10px] p-0.5"
                        >
                          <option value="ល្អប្រសើរ">ល្អប្រសើរ</option>
                          <option value="ល្អ">ល្អ</option>
                          <option value="ល្អបង្គួរ">ល្អបង្គួរ</option>
                          <option value="មធ្យម">មធ្យម</option>
                          <option value="ខ្សោយ">ខ្សោយ</option>
                        </select>
                      ) : (
                        domData.sem2
                      )}
                    </td>
                    <td className="border border-slate-900 py-1 px-0.5 font-semibold">
                      {isEditMode ? (
                        <select
                          value={domData.yearly}
                          onChange={(e) => {
                            onSaveOverride({
                              domains: {
                                ...bookData.domains,
                                [dom.key]: { ...domData, yearly: e.target.value },
                              },
                            });
                          }}
                          className="w-full text-center border border-amber-400 bg-amber-50 rounded text-[10px] p-0.5"
                        >
                          <option value="ល្អប្រសើរ">ល្អប្រសើរ</option>
                          <option value="ល្អ">ល្អ</option>
                          <option value="ល្អបង្គួរ">ល្អបង្គួរ</option>
                          <option value="មធ្យម">មធ្យម</option>
                          <option value="ខ្សោយ">ខ្សោយ</option>
                        </select>
                      ) : (
                        domData.yearly
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section ឃ Header: ឃ. លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំ */}
        <div className="text-center font-bold text-[12.5px] pt-3 pb-1 text-slate-950">
          ឃ. លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំ
        </div>

        {/* Promotion outcome: ត្រូវបានឡើងថ្នាក់ទី... / ត្រូវរៀនត្រួតថ្នាក់ទី... */}
        <div className="flex items-center justify-between text-[11.5px] px-1 py-1">
          <div className="flex items-center space-x-1.5">
            <span className={bookData.isPromoted ? 'font-bold text-slate-950' : 'text-slate-500'}>
              ត្រូវបានឡើងថ្នាក់ទី
            </span>
            <span className={`px-2 pb-0.5 border-b border-dotted border-slate-700 min-w-[50px] text-center font-bold ${bookData.isPromoted ? 'text-slate-950' : 'text-slate-400'}`}>
              {bookData.isPromoted ? bookData.nextGradeText : '..........'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className={!bookData.isPromoted ? 'font-bold text-rose-700' : 'text-slate-500'}>
              ត្រូវរៀនត្រួតថ្នាក់ទី
            </span>
            <span className={`px-2 pb-0.5 border-b border-dotted border-slate-700 min-w-[50px] text-center font-bold ${!bookData.isPromoted ? 'text-rose-700' : 'text-slate-400'}`}>
              {!bookData.isPromoted ? bookData.repeatGradeText : '..........'}
            </span>
          </div>
        </div>

        {/* Praise & Improvement Lines */}
        <div className="space-y-1 text-[11px] mt-1">
          {/* ការសរសើរ */}
          <div className="space-y-0.5">
            <div className="flex items-baseline space-x-1">
              <span className="font-semibold shrink-0">ការសរសើរ</span>
              <div className="flex-1 border-b border-dotted border-slate-700 pb-0.5 text-slate-900 px-1 text-[10.5px]">
                {isEditMode ? (
                  <input
                    type="text"
                    value={bookData.praiseComment}
                    onChange={(e) => onSaveOverride({ praiseComment: e.target.value })}
                    className="w-full border border-amber-400 bg-amber-50 rounded px-1 py-0.5 text-xs"
                  />
                ) : (
                  bookData.praiseComment
                )}
              </div>
            </div>
            <div className="border-b border-dotted border-slate-700 h-2.5"></div>
          </div>

          {/* កំណែម្អ */}
          <div className="space-y-0.5 pt-1">
            <div className="flex items-baseline space-x-1">
              <span className="font-semibold shrink-0">កំណែម្អ</span>
              <div className="flex-1 border-b border-dotted border-slate-700 pb-0.5 text-slate-900 px-1 text-[10.5px]">
                {isEditMode ? (
                  <input
                    type="text"
                    value={bookData.improvementComment}
                    onChange={(e) => onSaveOverride({ improvementComment: e.target.value })}
                    className="w-full border border-amber-400 bg-amber-50 rounded px-1 py-0.5 text-xs"
                  />
                ) : (
                  bookData.improvementComment
                )}
              </div>
            </div>
            <div className="border-b border-dotted border-slate-700 h-2.5"></div>
          </div>
        </div>
      </div>

      {/* Signatures block: នាយកសាលា & គ្រូប្រចាំថ្នាក់ */}
      <div>
        <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
          {/* LEFT: មូលវិចាររបស់នាយកសាលា */}
          <div className="flex flex-col justify-between text-center relative">
            <div>
              <div className="font-bold text-[11.5px] text-slate-950 mb-0.5">
                មូលវិចាររបស់នាយកសាលា
              </div>
              <div className="border-b border-dotted border-slate-700 min-h-[15px] text-[10px] px-1 text-slate-800">
                {isEditMode ? (
                  <input
                    type="text"
                    value={bookData.principalRemarks}
                    onChange={(e) => onSaveOverride({ principalRemarks: e.target.value })}
                    className="w-full text-center border border-amber-400 bg-amber-50 rounded text-[9.5px]"
                  />
                ) : (
                  bookData.principalRemarks
                )}
              </div>
              <div className="border-b border-dotted border-slate-700 h-3"></div>
            </div>

            <div className="mt-2.5 relative">
              <div className="text-[10.5px] text-slate-700">
                {bookData.principalDateText}
              </div>
              <div className="font-bold font-khmer-moul text-[11.5px] text-slate-950 mt-0.5">
                នាយកសាលា
              </div>

              {/* Stamp & signature space */}
              <div className="h-16 relative flex items-center justify-center">
                {showStamp && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
                    <OfficialSchoolStamp size={85} opacity={0.88} />
                  </div>
                )}
              </div>

              <div className="font-semibold text-[11px] text-slate-950">
                {principalName}
              </div>
            </div>
          </div>

          {/* RIGHT: មូលវិចាររបស់គ្រូប្រចាំថ្នាក់ */}
          <div className="flex flex-col justify-between text-center">
            <div>
              <div className="font-bold text-[11.5px] text-slate-950 mb-0.5">
                មូលវិចាររបស់គ្រូប្រចាំថ្នាក់
              </div>
              <div className="border-b border-dotted border-slate-700 min-h-[15px] text-[10px] px-1 text-slate-800">
                {isEditMode ? (
                  <input
                    type="text"
                    value={bookData.teacherRemarks}
                    onChange={(e) => onSaveOverride({ teacherRemarks: e.target.value })}
                    className="w-full text-center border border-amber-400 bg-amber-50 rounded text-[9.5px]"
                  />
                ) : (
                  bookData.teacherRemarks
                )}
              </div>
              <div className="border-b border-dotted border-slate-700 h-3"></div>
            </div>

            <div className="mt-2.5">
              <div className="text-[10.5px] text-slate-700">
                {bookData.teacherDateText}
              </div>
              <div className="font-bold font-khmer-moul text-[11.5px] text-slate-950 mt-0.5">
                គ្រូប្រចាំថ្នាក់
              </div>

              {/* Signature space */}
              <div className="h-16 flex items-center justify-center">
                <div className="font-cursive italic text-slate-400 text-xs">
                  {/* Handwritten signature placeholder */}
                </div>
              </div>

              <div className="font-semibold text-[11px] text-slate-950">
                {teacherName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
