import { 
  ClassSection, 
  Student, 
  Subject, 
  AssessmentPeriod, 
  AssessmentWeightConfig, 
  GradeScaleThreshold, 
  CompetencyPillarsWeight,
  DailyAttendanceRecord,
  SchoolProfile
} from '../types';
import { PREK_CHIK_CLASSES, PREK_CHIK_STUDENTS, PREK_CHIK_STUDENT_PROFILES } from './prekChikStudents';

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'Prek Chik Primary School',
  schoolNameKm: 'សាលាបឋមសិក្សា ព្រែកជីក',
  province: 'ខេត្តស្ទឹងត្រែង',
  district: 'ស្រុកសៀមបូក',
  commune: 'ឃុំអូរម្រះ',
  village: 'ភូមិប្រទង',
  schoolCode: '190402',
  principalName: 'លោកគ្រូ ផាន សិតការណ៍',
  principalNameKm: 'លោកគ្រូ ផាន សិតការណ៍',
  phone: '012 999 818',
  email: 'prekchik.primary@moeys.gov.kh',
  logoUrl: '',
  academicYear: '២០២៦-២០២៧',
};

export const DEFAULT_COMPETENCY_WEIGHTS: CompetencyPillarsWeight = {
  knowledge: 80, // វិជ្ជាសម្បទា (80%)
  skill: 10,     // បំណិនសម្បទា (10%)
  attitude: 10,  // ចរិយាសម្បទា (10%)
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub_khmer',
    nameEn: 'Khmer Language',
    nameKm: 'ភាសាខ្មែរ',
    code: 'KHM',
    maxScore: 10,
    coefficient: 1,
    color: '#3b82f6',
    subComponents: [
      { id: 'khmer_reading', nameEn: 'Reading', nameKm: 'អាន', maxScore: 10, weight: 25 },
      { id: 'khmer_writing', nameEn: 'Writing', nameKm: 'សរសេរ', maxScore: 10, weight: 25 },
      { id: 'khmer_listening', nameEn: 'Listening', nameKm: 'ស្ដាប់', maxScore: 10, weight: 25 },
      { id: 'khmer_speaking', nameEn: 'Speaking', nameKm: 'និយាយ', maxScore: 10, weight: 25 },
    ],
  },
  {
    id: 'sub_math',
    nameEn: 'Mathematics',
    nameKm: 'គណិតវិទ្យា',
    code: 'MTH',
    maxScore: 10,
    coefficient: 1,
    color: '#10b981',
    subComponents: [
      { id: 'math_numbers', nameEn: 'Numbers', nameKm: 'ចំនួន', maxScore: 10, weight: 20 },
      { id: 'math_algebra', nameEn: 'Algebra', nameKm: 'ពិជគណិត', maxScore: 10, weight: 20 },
      { id: 'math_measurement', nameEn: 'Measurement', nameKm: 'រង្វាស់រង្វល់', maxScore: 10, weight: 20 },
      { id: 'math_geometry', nameEn: 'Geometry', nameKm: 'ធរណីមាត្រ', maxScore: 10, weight: 20 },
      { id: 'math_statistics', nameEn: 'Statistics', nameKm: 'ស្ថិតិ', maxScore: 10, weight: 20 },
    ],
  },
  { id: 'sub_science', nameEn: 'Science & Nature', nameKm: 'វិទ្យាសាស្ត្រ', code: 'SCI', maxScore: 10, coefficient: 1, color: '#8b5cf6' },
  { id: 'sub_moral_civics', nameEn: 'Moral & Civics', nameKm: 'សីលធម៌-ពលរដ្ឋ', code: 'MOR', maxScore: 10, coefficient: 1, color: '#f59e0b' },
  { id: 'sub_geography_history', nameEn: 'Geography & History', nameKm: 'ភូមិ-ប្រវត្តិ', code: 'GEO', maxScore: 10, coefficient: 1, color: '#d97706' },
  { id: 'sub_home_arts', nameEn: 'Home Economics & Arts', nameKm: 'គេហវិទ្យា-សិល្បៈ', code: 'ART', maxScore: 10, coefficient: 1, color: '#ec4899' },
  { id: 'sub_pe_sports', nameEn: 'Physical Education & Sports', nameKm: 'អប់រំកាយ-កីឡា', code: 'PES', maxScore: 10, coefficient: 1, color: '#06b6d4' },
  { id: 'sub_health_hygiene', nameEn: 'Health & Hygiene', nameKm: 'សុខភាព-អនាម័យ', code: 'HLT', maxScore: 10, coefficient: 1, color: '#14b8a6' },
  { id: 'sub_life_skills', nameEn: 'Life Skills Education', nameKm: 'អប់រំបំណិនជីវិត', code: 'LFS', maxScore: 10, coefficient: 1, color: '#84cc16' },
  { id: 'sub_foreign_lang', nameEn: 'Foreign Language', nameKm: 'ភាសាបរទេស', code: 'ENG', maxScore: 10, coefficient: 1, color: '#6366f1' },
  { id: 'sub_social', nameEn: 'Social Studies', nameKm: 'សិក្សាសង្គម', code: 'SOC', maxScore: 10, coefficient: 1, color: '#f97316' },
];

export const DEFAULT_PERIODS: AssessmentPeriod[] = [
  // Semester 1
  {
    id: 'month_dec',
    nameEn: 'December',
    nameKm: 'ខែធ្នូ',
    semester: 1,
    isExam: false,
    lunarDateKm: 'ថ្ងែព្រហស្បតិ៍ ៦កើត ខែបុស្ស ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Thursday 6th Waxing Moon of Pusya, Year of Snake',
    solarDate: '25-Dec-2025',
    deadlineWarning: 'បញ្ចូលពិន្ទុមុនថ្ងៃទី ២០ ជារៀងរាល់ខែ',
  },
  {
    id: 'month_jan',
    nameEn: 'January',
    nameKm: 'ខែមករា',
    semester: 1,
    isExam: false,
    lunarDateKm: 'ថ្ងែសៅរ៍ ៦កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Saturday 6th Waxing Moon of Magha, Year of Snake',
    solarDate: '24-Jan-2026',
  },
  {
    id: 'month_feb',
    nameEn: 'February',
    nameKm: 'ខែកុម្ភៈ',
    semester: 1,
    isExam: false,
    lunarDateKm: 'ថ្ងៃពុធ ៩កើត ខែផល្គុន ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Wednesday 9th Waxing Moon of Phalguna, Year of Snake',
    solarDate: '25-Feb-2026',
  },
  {
    id: 'sem_1_exam',
    nameEn: 'Semester 1 Exam',
    nameKm: 'ឆមាស១',
    semester: 1,
    isExam: true,
    lunarDateKm: 'ថ្ងៃពុធ ៧កើត ខែចេត្រ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Wednesday 7th Waxing Moon of Caitra, Year of Snake',
    solarDate: '25-Mar-2026',
  },
  // Semester 2
  {
    id: 'month_may',
    nameEn: 'May',
    nameKm: 'ខែឧសភា',
    semester: 2,
    isExam: false,
    lunarDateKm: 'ថ្ងៃចន្ទ ៩កើត ខែជេស្ឋ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Monday 9th Waxing Moon of Jyaistha, Year of Horse',
    solarDate: '25-May-2026',
  },
  {
    id: 'month_jun',
    nameEn: 'June',
    nameKm: 'ខែមិថុនា',
    semester: 2,
    isExam: false,
    lunarDateKm: 'ថ្ងៃព្រហស្បតិ៍ ១១កើត ខែអាសាឍ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Thursday 11th Waxing Moon of Asadha, Year of Horse',
    solarDate: '25-Jun-2026',
  },
  {
    id: 'month_jul',
    nameEn: 'July',
    nameKm: 'ខែកក្កដា',
    semester: 2,
    isExam: false,
    lunarDateKm: 'ថ្ងៃសៅរ៍ ១១កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Saturday 11th Waxing Moon of Sravana, Year of Horse',
    solarDate: '25-Jul-2026',
  },
  {
    id: 'sem_2_exam',
    nameEn: 'Semester 2 Exam',
    nameKm: 'ឆមាស២',
    semester: 2,
    isExam: true,
    lunarDateKm: 'ថ្ងៃអង្គារ ១២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Tuesday 12th Waxing Moon of Sravana, Year of Horse',
    solarDate: '25-Aug-2026',
  },
];

export const DEFAULT_WEIGHT_CONFIG: AssessmentWeightConfig = {
  homework: 20,
  quizzes: 20,
  midterm: 20,
  finalExam: 40,
  behaviorBonus: 5,
};

export const DEFAULT_GRADE_SCALES: GradeScaleThreshold[] = [
  { grade: 'A', labelEn: 'A', labelKm: 'A', minPercentage: 85, color: '#16a34a' },
  { grade: 'B', labelEn: 'B', labelKm: 'B', minPercentage: 75, color: '#2563eb' },
  { grade: 'C', labelEn: 'C', labelKm: 'C', minPercentage: 65, color: '#0891b2' },
  { grade: 'D', labelEn: 'D', labelKm: 'D', minPercentage: 60, color: '#d97706' },
  { grade: 'E', labelEn: 'E', labelKm: 'E', minPercentage: 50, color: '#ea580c' },
  { grade: 'F', labelEn: 'F', labelKm: 'F', minPercentage: 0, color: '#dc2626' },
];

export const INITIAL_CLASSES: ClassSection[] = PREK_CHIK_CLASSES;

export const INITIAL_STUDENTS: Student[] = PREK_CHIK_STUDENTS;

// Generate initial score matrix (empty by default so teacher enters real monthly scores)
export function generateInitialScores(): Record<string, Record<string, Record<string, {
  homework: number;
  quizzes: number;
  midterm: number;
  finalExam: number;
  rawScore: number;
  behaviorRating: number;
}>>> {
  // Empty scores matrix as requested: scores will be entered by teacher later
  return {};
}

/**
 * Generate initial daily attendance records for Cambodian school year (e.g. past 14 school days)
 */
export function generateInitialAttendanceRecords(): DailyAttendanceRecord[] {
  const records: DailyAttendanceRecord[] = [];
  const classId = 'class_6a';
  const students = INITIAL_STUDENTS.slice(0, 35); // 35 students in Class 6A

  // 14 recent school days (Monday to Friday dates in Feb/March 2026)
  const schoolDates = [
    '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13',
    '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
    '2026-02-23', '2026-02-24', '2026-02-25', '2026-02-26'
  ];

  schoolDates.forEach((date, dayIdx) => {
    students.forEach((stu, stuIdx) => {
      let status: 'present' | 'excused' | 'unexcused' | 'late' = 'present';
      let note: string | undefined = undefined;

      // Realistic occasional absences
      if (stuIdx === 3 && (dayIdx === 2 || dayIdx === 3)) {
        status = 'excused';
        note = 'ឈឺមានលិខិតសុំច្បាប់ពីអាណាព្យាបាល';
      } else if (stuIdx === 8 && dayIdx === 5) {
        status = 'unexcused';
        note = 'អវត្តមានគ្មានដំណឹង';
      } else if (stuIdx === 14 && dayIdx === 9) {
        status = 'late';
        note = 'យឺត ១៥ នាទី ដោយសារភ្លៀងធ្លាក់';
      } else if (stuIdx === 19 && (dayIdx === 7 || dayIdx === 8)) {
        status = 'excused';
        note = 'ជួយការងារបុណ្យគ្រួសារ (សុំច្បាប់)';
      } else if (stuIdx === 27 && dayIdx === 11) {
        status = 'unexcused';
        note = 'អវត្តមាន';
      }

      records.push({
        id: `${date}_${stu.id}`,
        classId,
        studentId: stu.id,
        date,
        status,
        note
      });
    });
  });

  return records;
}

