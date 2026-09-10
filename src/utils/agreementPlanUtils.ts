import { GradeLetter, Student, StudentAgreementPlan } from '../types';

export const GRADE_LETTERS: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export const GRADE_CRITERIA_NOTE = [
  { grade: 'A', labelKm: 'ពូកែណាស់', range: '៩.០០ - ១០.០០', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { grade: 'B', labelKm: 'ពូកែ', range: '៨.០០ - ៨.៩៩', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { grade: 'C', labelKm: 'ល្អបង្គួរ', range: '៧.០០ - ៧.៩៩', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { grade: 'D', labelKm: 'មធ្យម', range: '៦.០០ - ៦.៩៩', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { grade: 'E', labelKm: 'ខ្សោយ', range: '៥.០០ - ៥.៩៩', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  { grade: 'F', labelKm: 'ខ្សោយណាស់', range: 'ក្រោម ៥.០០', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
];

/**
 * Convert a raw numerical score (0 to 10) to the official MoEYS Grade Letter
 */
export const scoreToGradeLetter = (score: number | undefined | null): GradeLetter | undefined => {
  if (score === undefined || score === null || isNaN(score)) return undefined;
  if (score >= 9.0) return 'A';
  if (score >= 8.0) return 'B';
  if (score >= 7.0) return 'C';
  if (score >= 6.0) return 'D';
  if (score >= 5.0) return 'E';
  return 'F';
};

/**
 * Get color styling for each grade pill
 */
export const getGradeBadgeStyle = (grade?: GradeLetter) => {
  switch (grade) {
    case 'A':
      return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700';
    case 'B':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700';
    case 'C':
      return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700';
    case 'D':
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700';
    case 'E':
      return 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-700';
    case 'F':
      return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  }
};

export const PTOM_LEVEL_ROWS = [
  { level: 4, levelKm: '៤', gradeRange: 'B & A', descKm: '៨០% ឡើង', scoreRange: '81-100' },
  { level: 3, levelKm: '៣', gradeRange: 'D & C', descKm: '៦៥-៧៩%', scoreRange: '61-80' },
  { level: 2, levelKm: '២', gradeRange: 'E & D', descKm: '៥០-៦៤%', scoreRange: '50-60' },
  { level: 1, levelKm: '១', gradeRange: 'F', descKm: 'ក្រោម ៥០%', scoreRange: 'ក្រោម 50' },
] as const;

export const PTOM_GRADES = ['A', 'B+', 'B', 'C', 'D', 'E', 'F'] as const;

/**
 * Maps a grade letter (e.g. 'A', 'B+', 'B', 'C', 'D', 'E', 'F') to its PTOM row level (4, 3, 2, or 1)
 */
export const mapGradeToPtomLevel = (grade?: string): 4 | 3 | 2 | 1 | undefined => {
  if (!grade) return undefined;
  const clean = grade.trim().toUpperCase();
  if (clean.startsWith('A') || clean.startsWith('B')) return 4;
  if (clean.startsWith('C')) return 3;
  if (clean.startsWith('D')) return 3; // 'D & C' level 3 in PTOM matrix or 2 if low
  if (clean.startsWith('E')) return 2;
  if (clean.startsWith('F')) return 1;
  return undefined;
};

/**
 * Recommend an aspirational yet realistic end-of-year target grade
 */
export const getRecommendedTarget = (baseline?: GradeLetter | string): GradeLetter => {
  switch (baseline) {
    case 'F': return 'E';
    case 'E': return 'C';
    case 'D': return 'B';
    case 'C': return 'A';
    case 'B': return 'A';
    case 'A': return 'A';
    default: return 'C';
  }
};

/**
 * Create a fresh default student agreement plan
 */
export const createDefaultStudentPlan = (
  student: Student,
  classId: string,
  academicYear: string = '២០២៥-២០២៦',
  teacherName: string = 'ផាន សិតការណ៍',
  teacherPhone: string = '0882176987'
): StudentAgreementPlan => {
  return {
    studentId: student.id,
    classId: classId,
    academicYear,
    khmer: {
      baselineGrade: undefined,
      targetGrade: undefined,
      achievedGrade: undefined,
      q1Grade: undefined,
      q2Grade: undefined,
      q3Grade: undefined,
      q4Grade: undefined,
      endYearTestGrade: undefined,
    },
    math: {
      baselineGrade: undefined,
      targetGrade: undefined,
      achievedGrade: undefined,
      q1Grade: undefined,
      q2Grade: undefined,
      q3Grade: undefined,
      q4Grade: undefined,
      endYearTestGrade: undefined,
    },
    guardianName: student.guardianName || '',
    guardianPhone: student.guardianPhone || '',
    teacherName,
    teacherPhone,
    agreementDateSolar: '2026-01-19',
    agreementDateLunar: 'ថ្ងៃចន្ទ ១កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    parentSignatureName: student.guardianName || '',
    teacherSignatureName: teacherName,
    districtOffice: 'ការិយាល័យអប់រំ យុវជននិងកីឡា និងរដ្ឋបាលស្រុកស្ទឹងត្រង់',
    locationPlace: 'ប្រទង',
    committeeLeaderTitle: 'ប្រធានគណៈកម្មការគ្រប់គ្រងសាលារៀន',
    principalTitle: 'នាយកសាលា',
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Generate initial demo agreement plans with sample PLP baseline & PTOM test data
 */
export const generateInitialAgreementPlans = (
  students: Student[],
  classId: string,
  academicYear: string = '២០២៥-២០២៦',
  teacherName: string = 'ផាន សិតការណ៍'
): Record<string, StudentAgreementPlan> => {
  const result: Record<string, StudentAgreementPlan> = {};

  const samplePlpResults: { 
    khmer: [string, string, string, string, string, string]; 
    math: [string, string, string, string, string, string];
  }[] = [
    // គំរូដូចក្នុងឯកសារជាក់ស្តែងរបស់សិស្ស អាត ចាន់ត្រា:
    // Khmer: baseline=B, Q1=B+, Q2=A, Q3=A, Q4=A, endYear=A
    // Math: baseline=C, Q1=B, Q2=B+, Q3=A, Q4=A, endYear=A
    { 
      khmer: ['B', 'B+', 'A', 'A', 'A', 'A'], 
      math: ['C', 'B', 'B+', 'A', 'A', 'A'] 
    },
    { 
      khmer: ['C', 'B', 'B+', 'A', 'A', 'A'], 
      math: ['D', 'C', 'B', 'B+', 'A', 'A'] 
    },
    { 
      khmer: ['D', 'C', 'B', 'B', 'A', 'A'], 
      math: ['E', 'D', 'C', 'B', 'B', 'B'] 
    },
    { 
      khmer: ['B', 'A', 'A', 'A', 'A', 'A'], 
      math: ['B', 'B+', 'A', 'A', 'A', 'A'] 
    },
    { 
      khmer: ['E', 'D', 'C', 'C', 'B', 'B'], 
      math: ['F', 'E', 'D', 'C', 'C', 'C'] 
    },
  ];

  students.forEach((stu, index) => {
    const sample = samplePlpResults[index % samplePlpResults.length];
    result[stu.id] = {
      studentId: stu.id,
      classId,
      academicYear,
      khmer: {
        baselineGrade: sample.khmer[0],
        q1Grade: sample.khmer[1],
        q2Grade: sample.khmer[2],
        q3Grade: sample.khmer[3],
        q4Grade: sample.khmer[4],
        endYearTestGrade: sample.khmer[5],
        targetGrade: 'A',
        achievedGrade: sample.khmer[5],
      },
      math: {
        baselineGrade: sample.math[0],
        q1Grade: sample.math[1],
        q2Grade: sample.math[2],
        q3Grade: sample.math[3],
        q4Grade: sample.math[4],
        endYearTestGrade: sample.math[5],
        targetGrade: 'A',
        achievedGrade: sample.math[5],
      },
      guardianName: stu.guardianName || '......................',
      guardianPhone: stu.guardianPhone || '0882559162',
      teacherName,
      teacherPhone: '0882176987',
      agreementDateSolar: '2026-01-19',
      agreementDateLunar: 'ថ្ងៃចន្ទ ១កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
      parentSignatureName: stu.guardianName || '',
      teacherSignatureName: teacherName,
      districtOffice: 'ការិយាល័យអប់រំ យុវជននិងកីឡា និងរដ្ឋបាលស្រុកស្ទឹងត្រង់',
      locationPlace: 'ប្រទង',
      committeeLeaderTitle: 'ប្រធានគណៈកម្មការគ្រប់គ្រងសាលារៀន',
      principalTitle: 'នាយកសាលា',
      updatedAt: new Date().toISOString(),
    };
  });

  return result;
};
