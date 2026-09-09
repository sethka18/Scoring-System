/**
 * Academic Year 2026-2027 MoEYS Teaching Calendar Metadata & Week Mappings
 * School Opening Date (ថ្ងៃបើកបវេសនកាល): 01 November 2026 (០១ វិច្ឆិកា ២០២៦)
 * Primary School: Hun Neng Pratong Primary School
 */

export interface AcademicWeekMapping {
  weekNumber: number;
  semester: 1 | 2;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string;   // YYYY-MM-DD (Saturday)
  monthKm: string;
  monthEn: string;
  isExamWeek?: boolean;
  isDiagnosticWeek?: boolean;
  noteKm?: string;
  noteEn?: string;
}

export interface TeachingCalendarSpecialEvent {
  id: string;
  startDate: string;
  endDate?: string;
  titleKm: string;
  titleEn: string;
  category: 'opening' | 'diagnostic' | 'monthly_exam' | 'semester_exam' | 'holiday' | 'event';
  color: string;
  badgeBg: string;
  badgeText: string;
  descriptionKm: string;
}

export const ACADEMIC_YEAR_2026_2027 = {
  academicYear: '២០២៦-២០២៧',
  openingDate: '2026-11-01',
  openingDateKm: 'ថ្ងៃអាទិត្យ ទី០១ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
  closingDate: '2027-08-31',
  closingDateKm: 'ថ្ងៃអង្គារ ទី៣១ ខែសីហា ឆ្នាំ២០២៧',
  totalWeeks: 36,
  sem1Weeks: 18,
  sem2Weeks: 18,
};

// 36 Official Teaching Weeks starting from 1 Nov 2026
export const ACADEMIC_WEEKS_2026_2027: AcademicWeekMapping[] = [
  // Semester 1
  {
    weekNumber: 1,
    semester: 1,
    startDate: '2026-11-02',
    endDate: '2026-11-07',
    monthKm: 'វិច្ឆិកា',
    monthEn: 'November',
    isDiagnosticWeek: true,
    noteKm: 'បើកបវេសនកាល (០១ វិច្ឆិកា) & តេស្តដើមឆ្នាំ ភាសាខ្មែរ',
    noteEn: 'School Opening & Khmer Diagnostic Test'
  },
  {
    weekNumber: 2,
    semester: 1,
    startDate: '2026-11-09',
    endDate: '2026-11-14',
    monthKm: 'វិច្ឆិកា',
    monthEn: 'November',
    isDiagnosticWeek: true,
    noteKm: 'តេស្តដើមឆ្នាំ គណិតវិទ្យា & ចាត់ក្រុមសិស្សរៀនយឺត',
    noteEn: 'Math Diagnostic Test & Remediation Grouping'
  },
  {
    weekNumber: 3,
    semester: 1,
    startDate: '2026-11-16',
    endDate: '2026-11-21',
    monthKm: 'វិច្ឆិកា',
    monthEn: 'November',
    noteKm: 'ដំណើរការបង្រៀនពេញលេញតាមកម្មវិធីសិក្សា',
    noteEn: 'Regular Teaching Curriculum'
  },
  {
    weekNumber: 4,
    semester: 1,
    startDate: '2026-11-23',
    endDate: '2026-11-28',
    monthKm: 'វិច្ឆិកា',
    monthEn: 'November',
    isExamWeek: true,
    noteKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែវិច្ឆិកា',
    noteEn: 'November Monthly Assessment & Exam'
  },
  {
    weekNumber: 5,
    semester: 1,
    startDate: '2026-11-30',
    endDate: '2026-12-05',
    monthKm: 'ធ្នូ',
    monthEn: 'December',
    noteKm: 'សប្តាហ៍ទី៥ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 5 Curriculum'
  },
  {
    weekNumber: 6,
    semester: 1,
    startDate: '2026-12-07',
    endDate: '2026-12-12',
    monthKm: 'ធ្នូ',
    monthEn: 'December',
    noteKm: 'សប្តាហ៍ទី៦ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 6 Curriculum'
  },
  {
    weekNumber: 7,
    semester: 1,
    startDate: '2026-12-14',
    endDate: '2026-12-19',
    monthKm: 'ធ្នូ',
    monthEn: 'December',
    noteKm: 'សប្តាហ៍ទី៧ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 7 Curriculum'
  },
  {
    weekNumber: 8,
    semester: 1,
    startDate: '2026-12-21',
    endDate: '2026-12-26',
    monthKm: 'ធ្នូ',
    monthEn: 'December',
    isExamWeek: true,
    noteKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែធ្នូ',
    noteEn: 'December Monthly Assessment & Exam'
  },
  {
    weekNumber: 9,
    semester: 1,
    startDate: '2026-12-28',
    endDate: '2027-01-02',
    monthKm: 'មករា',
    monthEn: 'January',
    noteKm: 'សប្តាហ៍ទី៩ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 9 Curriculum'
  },
  {
    weekNumber: 10,
    semester: 1,
    startDate: '2027-01-04',
    endDate: '2027-01-09',
    monthKm: 'មករា',
    monthEn: 'January',
    noteKm: '៧ មករា ទិវាជ័យជម្នះ (ឈប់សម្រាក ១ថ្ងៃ)',
    noteEn: 'Victory Over Genocide Day'
  },
  {
    weekNumber: 11,
    semester: 1,
    startDate: '2027-01-11',
    endDate: '2027-01-16',
    monthKm: 'មករា',
    monthEn: 'January',
    noteKm: 'សប្តាហ៍ទី១១ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 11 Curriculum'
  },
  {
    weekNumber: 12,
    semester: 1,
    startDate: '2027-01-18',
    endDate: '2027-01-23',
    monthKm: 'មករា',
    monthEn: 'January',
    noteKm: 'សប្តាហ៍ទី១២ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 12 Curriculum'
  },
  {
    weekNumber: 13,
    semester: 1,
    startDate: '2027-01-25',
    endDate: '2027-01-30',
    monthKm: 'មករា',
    monthEn: 'January',
    isExamWeek: true,
    noteKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែមករា',
    noteEn: 'January Monthly Assessment & Exam'
  },
  {
    weekNumber: 14,
    semester: 1,
    startDate: '2027-02-01',
    endDate: '2027-02-06',
    monthKm: 'កុម្ភៈ',
    monthEn: 'February',
    noteKm: 'សប្តាហ៍ទី១៤ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 14 Curriculum'
  },
  {
    weekNumber: 15,
    semester: 1,
    startDate: '2027-02-08',
    endDate: '2027-02-13',
    monthKm: 'កុម្ភៈ',
    monthEn: 'February',
    noteKm: 'សប្តាហ៍ទី១៥ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 15 Curriculum'
  },
  {
    weekNumber: 16,
    semester: 1,
    startDate: '2027-02-15',
    endDate: '2027-02-20',
    monthKm: 'កុម្ភៈ',
    monthEn: 'February',
    noteKm: 'សប្តាហ៍ទី១៦ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 16 Curriculum'
  },
  {
    weekNumber: 17,
    semester: 1,
    startDate: '2027-02-22',
    endDate: '2027-02-27',
    monthKm: 'កុម្ភៈ',
    monthEn: 'February',
    isExamWeek: true,
    noteKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែកុម្ភៈ',
    noteEn: 'February Monthly Assessment & Exam'
  },
  {
    weekNumber: 18,
    semester: 1,
    startDate: '2027-03-01',
    endDate: '2027-03-06',
    monthKm: 'មីនា',
    monthEn: 'March',
    noteKm: 'រំលឹកមេរៀន និងត្រៀមប្រឡងឆមាសទី១',
    noteEn: 'Semester 1 Review & Revision'
  },

  // Semester 2
  {
    weekNumber: 19,
    semester: 2,
    startDate: '2027-03-08',
    endDate: '2027-03-13',
    monthKm: 'មីនា',
    monthEn: 'March',
    noteKm: '១១ មីនា ទិវាជាតិអំណាន & សប្តាហ៍ទី១៩',
    noteEn: 'National Reading Day & Week 19'
  },
  {
    weekNumber: 20,
    semester: 2,
    startDate: '2027-03-15',
    endDate: '2027-03-20',
    monthKm: 'មីនា',
    monthEn: 'March',
    noteKm: 'សប្តាហ៍ទី២០ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 20 Curriculum'
  },
  {
    weekNumber: 21,
    semester: 2,
    startDate: '2027-03-22',
    endDate: '2027-03-27',
    monthKm: 'មីនា',
    monthEn: 'March',
    noteKm: 'សប្តាហ៍ទី២១ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 21 Curriculum'
  },
  {
    weekNumber: 22,
    semester: 2,
    startDate: '2027-04-20',
    endDate: '2027-04-24',
    monthKm: 'មេសា',
    monthEn: 'April',
    noteKm: 'ចាប់ផ្តើមដំណើរការបង្រៀនបន្ទាប់ពីចូលឆ្នាំខ្មែរ',
    noteEn: 'Resumption after Khmer New Year'
  },
  {
    weekNumber: 23,
    semester: 2,
    startDate: '2027-04-26',
    endDate: '2027-05-01',
    monthKm: 'មេសា',
    monthEn: 'April',
    noteKm: 'សប្តាហ៍ទី២៣ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 23 Curriculum'
  },
  {
    weekNumber: 24,
    semester: 2,
    startDate: '2027-05-03',
    endDate: '2027-05-08',
    monthKm: 'ឧសភា',
    monthEn: 'May',
    noteKm: 'សប្តាហ៍ទី២៤ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 24 Curriculum'
  },
  {
    weekNumber: 25,
    semester: 2,
    startDate: '2027-05-10',
    endDate: '2027-05-15',
    monthKm: 'ឧសភា',
    monthEn: 'May',
    noteKm: 'សប្តាហ៍ទី២៥ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 25 Curriculum'
  },
  {
    weekNumber: 26,
    semester: 2,
    startDate: '2027-05-17',
    endDate: '2027-05-22',
    monthKm: 'ឧសភា',
    monthEn: 'May',
    noteKm: 'សប្តាហ៍ទី២៦ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 26 Curriculum'
  },
  {
    weekNumber: 27,
    semester: 2,
    startDate: '2027-05-24',
    endDate: '2027-05-29',
    monthKm: 'ឧសភា',
    monthEn: 'May',
    isExamWeek: true,
    noteKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែឧសភា',
    noteEn: 'May Monthly Assessment & Exam'
  },
  {
    weekNumber: 28,
    semester: 2,
    startDate: '2027-05-31',
    endDate: '2027-06-05',
    monthKm: 'មិថុនា',
    monthEn: 'June',
    noteKm: 'សប្តាហ៍ទី២៨ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 28 Curriculum'
  },
  {
    weekNumber: 29,
    semester: 2,
    startDate: '2027-06-07',
    endDate: '2027-06-12',
    monthKm: 'មិថុនា',
    monthEn: 'June',
    noteKm: 'សប្តាហ៍កីឡាសាលាបឋមសិក្សា & អនាម័យ',
    noteEn: 'School Sports & Health Promotion Week'
  },
  {
    weekNumber: 30,
    semester: 2,
    startDate: '2027-06-14',
    endDate: '2027-06-19',
    monthKm: 'មិថុនា',
    monthEn: 'June',
    noteKm: 'សប្តាហ៍ទី៣០ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 30 Curriculum'
  },
  {
    weekNumber: 31,
    semester: 2,
    startDate: '2027-06-21',
    endDate: '2027-06-26',
    monthKm: 'មិថុនា',
    monthEn: 'June',
    isExamWeek: true,
    noteKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែមិថុនា',
    noteEn: 'June Monthly Assessment & Exam'
  },
  {
    weekNumber: 32,
    semester: 2,
    startDate: '2027-06-28',
    endDate: '2027-07-03',
    monthKm: 'កក្កដា',
    monthEn: 'July',
    noteKm: 'សប្តាហ៍ទី៣២ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 32 Curriculum'
  },
  {
    weekNumber: 33,
    semester: 2,
    startDate: '2027-07-05',
    endDate: '2027-07-10',
    monthKm: 'កក្កដា',
    monthEn: 'July',
    noteKm: 'សប្តាហ៍ទី៣៣ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 33 Curriculum'
  },
  {
    weekNumber: 34,
    semester: 2,
    startDate: '2027-07-12',
    endDate: '2027-07-17',
    monthKm: 'កក្កដា',
    monthEn: 'July',
    noteKm: 'សប្តាហ៍ទី៣៤ កម្មវិធីសិក្សា MoEYS',
    noteEn: 'Week 34 Curriculum'
  },
  {
    weekNumber: 35,
    semester: 2,
    startDate: '2027-07-19',
    endDate: '2027-07-24',
    monthKm: 'កក្កដា',
    monthEn: 'July',
    isExamWeek: true,
    noteKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែកក្កដា',
    noteEn: 'July Monthly Assessment & Exam'
  },
  {
    weekNumber: 36,
    semester: 2,
    startDate: '2027-07-26',
    endDate: '2027-07-31',
    monthKm: 'កក្កដា',
    monthEn: 'July',
    noteKm: 'សប្តាហ៍បញ្ចប់កម្មវិធីសិក្សា ៣៦ សប្តាហ៍ & រំលឹកមេរៀនប្រឡង',
    noteEn: '36-Week Curriculum Completion & Revision'
  }
];

// Official Special Academic Dates and Milestones
export const OFFICIAL_TEACHING_EVENTS: TeachingCalendarSpecialEvent[] = [
  // 1. School Opening
  {
    id: 'evt_opening_day',
    startDate: '2026-11-01',
    titleKm: 'ពិធីបើកបវេសនកាលឆ្នាំសិក្សាថ្មី ២០២៦-២០២៧',
    titleEn: 'Official School Opening Ceremony 2026-2027',
    category: 'opening',
    color: '#4f46e5',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
    descriptionKm: 'ពិធីបើកបវេសនកាលឆ្នាំសិក្សាថ្មីទូទាំងប្រទេសក្រោមការណែនាំរបស់ក្រសួងអប់រំ យុវជន និងកីឡា។ ការជួបជុំសិស្សានុសិស្ស គ្រូបង្រៀន និងមាតាបិតា។'
  },

  // 2. Diagnostic Testing (តេស្តដើមឆ្នាំសិក្សា)
  {
    id: 'evt_diag_khmer',
    startDate: '2026-11-02',
    endDate: '2026-11-07',
    titleKm: 'តេស្តដើមឆ្នាំសិក្សា ៖ ភាសាខ្មែរ (អំណាន & សរសេរ)',
    titleEn: 'Khmer Beginning-of-Year Diagnostic Assessment',
    category: 'diagnostic',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    descriptionKm: 'ការវាស់ស្ទង់សមត្ថភាពអំណាន និងសំណេរដើមឆ្នាំ ដើម្បីកំណត់កម្រិតសមត្ថភាពសិស្ស និងរៀបចំផែនការជួយសិស្សរៀនយឺត។'
  },
  {
    id: 'evt_diag_math',
    startDate: '2026-11-09',
    endDate: '2026-11-14',
    titleKm: 'តេស្តដើមឆ្នាំសិក្សា ៖ គណិតវិទ្យា (លេខនព្វន្ត & ចំណោទ)',
    titleEn: 'Mathematics Beginning-of-Year Diagnostic Assessment',
    category: 'diagnostic',
    color: '#7c3aed',
    badgeBg: 'bg-purple-700',
    badgeText: 'text-white',
    descriptionKm: 'ការវាស់ស្ទង់សមត្ថភាពគណិតវិទ្យា និងការគិតលេខដើមឆ្នាំ ដើម្បីបែងចែកក្រុមសិស្សទទួលការគាំទ្រពិសេស។'
  },

  // 3. Monthly Exams (ការវាយតម្លៃ និងប្រឡងប្រចាំខែ)
  {
    id: 'evt_exam_nov',
    startDate: '2026-11-23',
    endDate: '2026-11-28',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែវិច្ឆិកា',
    titleEn: 'November Monthly Assessment & Exam',
    category: 'monthly_exam',
    color: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡង និងវាយតម្លៃ ៣ សម្បទា (វិជ្ជា, បំណិន, ចរិយា) ប្រចាំខែវិច្ឆិកា គ្រប់មុខវិជ្ជា។'
  },
  {
    id: 'evt_exam_dec',
    startDate: '2026-12-21',
    endDate: '2026-12-26',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែធ្នូ',
    titleEn: 'December Monthly Assessment & Exam',
    category: 'monthly_exam',
    color: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡង និងវាយតម្លៃ ៣ សម្បទា ប្រចាំខែធ្នូ និងការបូកសរុបពិន្ទុចំណាត់ថ្នាក់។'
  },
  {
    id: 'evt_holiday_victory',
    startDate: '2027-01-07',
    titleKm: 'ទិវាជ័យជម្នះ ៧ មករា (ថ្ងៃឈប់សម្រាក)',
    titleEn: 'Victory Over Genocide Day (Holiday)',
    category: 'holiday',
    color: '#dc2626',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    descriptionKm: 'ទិវាបុណ្យជាតិ ៧ មករា សាលារៀនឈប់សម្រាក ១ ថ្ងៃ។'
  },
  {
    id: 'evt_exam_jan',
    startDate: '2027-01-25',
    endDate: '2027-01-30',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែមករា',
    titleEn: 'January Monthly Assessment & Exam',
    category: 'monthly_exam',
    color: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡង និងវាយតម្លៃប្រចាំខែមករា និងការចេញប័ណ្ណសរសើរ Top 5។'
  },
  {
    id: 'evt_exam_feb',
    startDate: '2027-02-22',
    endDate: '2027-02-27',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែកុម្ភៈ',
    titleEn: 'February Monthly Assessment & Exam',
    category: 'monthly_exam',
    color: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡងប្រចាំខែកុម្ភៈ និងការត្រៀមលក្ខណៈប្រឡងឆមាសទី១។'
  },
  {
    id: 'evt_day_reading',
    startDate: '2027-03-11',
    titleKm: 'ទិវាជាតិអំណាន ១១ មីនា (National Reading Day)',
    titleEn: 'National Reading Day Celebration',
    category: 'event',
    color: '#d97706',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រារព្ធទិវាជាតិអំណាន ការប្រកួតអំណានរហ័ស ស្មូតកំណាព្យ និងតែងនិពន្ធ។'
  },
  {
    id: 'evt_exam_sem1',
    startDate: '2027-03-29',
    endDate: '2027-04-03',
    titleKm: 'សម័យប្រឡងឆមាសទី១ (Semester 1 Final Exam)',
    titleEn: 'Semester 1 Nationwide Comprehensive Exam',
    category: 'semester_exam',
    color: '#e11d48',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡងឆមាសទី១ ទូទាំងប្រទេសគ្រប់មុខវិជ្ជាស្នូល ស្របតាមកម្មវិធីក្រសួង។'
  },
  {
    id: 'evt_holiday_kny',
    startDate: '2027-04-13',
    endDate: '2027-04-19',
    titleKm: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ & វិស្សមកាលតូច',
    titleEn: 'Khmer New Year Holidays & Mid-Year Recess',
    category: 'holiday',
    color: '#ea580c',
    badgeBg: 'bg-orange-600',
    badgeText: 'text-white',
    descriptionKm: 'ឈប់សម្រាកពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ និងវិស្សមកាលតូចឆមាសទី១។'
  },
  {
    id: 'evt_start_sem2',
    startDate: '2027-04-20',
    titleKm: 'ការចាប់ផ្តើមដំណើរការបង្រៀនឆមាសទី២',
    titleEn: 'Semester 2 Resumption of Classes',
    category: 'opening',
    color: '#4f46e5',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
    descriptionKm: 'បើកដំណើរការបង្រៀនឆមាសទី២ តាមកម្មវិធីសិក្សា ៣៦ សប្តាហ៍។'
  },
  {
    id: 'evt_exam_may',
    startDate: '2027-05-24',
    endDate: '2027-05-29',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែឧសភា',
    titleEn: 'May Monthly Assessment & Exam',
    category: 'monthly_exam',
    color: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡងប្រចាំខែឧសភា ក្នុងឆមាសទី២។'
  },
  {
    id: 'evt_exam_jun',
    startDate: '2027-06-21',
    endDate: '2027-06-26',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែមិថុនា',
    titleEn: 'June Monthly Assessment & Exam',
    category: 'monthly_exam',
    color: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡងប្រចាំខែមិថុនា។'
  },
  {
    id: 'evt_exam_jul',
    startDate: '2027-07-19',
    endDate: '2027-07-24',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែកក្កដា',
    titleEn: 'July Monthly Assessment & Exam',
    category: 'monthly_exam',
    color: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡងប្រចាំខែកក្កដា និងការត្រៀមលក្ខណៈប្រឡងឆមាសទី២ បញ្ចប់ឆ្នាំ។'
  },
  {
    id: 'evt_exam_sem2',
    startDate: '2027-08-09',
    endDate: '2027-08-14',
    titleKm: 'សម័យប្រឡងឆមាសទី២ និងបញ្ចប់ឆ្នាំសិក្សា (Year-End Exam)',
    titleEn: 'Semester 2 Final & Primary Completion Exam',
    category: 'semester_exam',
    color: '#be123c',
    badgeBg: 'bg-rose-700',
    badgeText: 'text-white',
    descriptionKm: 'ការប្រឡងឆមាសទី២ និងប្រឡងបញ្ចប់កម្រិតបឋមសិក្សា (ថ្នាក់ទី៦)។'
  },
  {
    id: 'evt_ceremony_closing',
    startDate: '2027-08-31',
    titleKm: 'ពិធីបិទឆ្នាំសិក្សា ចែកប័ណ្ណសរសើរ & វិស្សមកាលធំ',
    titleEn: 'Closing Ceremony & Grand Vacation',
    category: 'opening',
    color: '#b45309',
    badgeBg: 'bg-amber-700',
    badgeText: 'text-white',
    descriptionKm: 'ពិធីបូកសរុបលទ្ធផលប្រចាំឆ្នាំ ចែករង្វាន់សិស្សឆ្នើម Top 5 និងចាប់ផ្តើមវិស្សមកាលធំ។'
  }
];

/**
 * Months of the Academic Year 2026-2027
 */
export const ACADEMIC_MONTHS = [
  { year: 2026, month: 10, nameKm: 'វិច្ឆិកា ២០២៦', nameEn: 'Nov 2026', shortKm: 'វិច្ឆិកា', isOpening: true },
  { year: 2026, month: 11, nameKm: 'ធ្នូ ២០២៦', nameEn: 'Dec 2026', shortKm: 'ធ្នូ' },
  { year: 2027, month: 0,  nameKm: 'មករា ២០២៧', nameEn: 'Jan 2027', shortKm: 'មករា' },
  { year: 2027, month: 1,  nameKm: 'កុម្ភៈ ២០២៧', nameEn: 'Feb 2027', shortKm: 'កុម្ភៈ' },
  { year: 2027, month: 2,  nameKm: 'មីនា ២០២៧', nameEn: 'Mar 2027', shortKm: 'មីនា' },
  { year: 2027, month: 3,  nameKm: 'មេសា ២០២៧', nameEn: 'Apr 2027', shortKm: 'មេសា' },
  { year: 2027, month: 4,  nameKm: 'ឧសភា ២០២៧', nameEn: 'May 2027', shortKm: 'ឧសភា' },
  { year: 2027, month: 5,  nameKm: 'មិថុនា ២០២៧', nameEn: 'Jun 2027', shortKm: 'មិថុនា' },
  { year: 2027, month: 6,  nameKm: 'កក្កដា ២០២៧', nameEn: 'Jul 2027', shortKm: 'កក្កដា' },
  { year: 2027, month: 7,  nameKm: 'សីហា ២០២៧', nameEn: 'Aug 2027', shortKm: 'សីហា' },
];

/**
 * Helper to get week mapping for any date string 'YYYY-MM-DD'
 */
export function getAcademicWeekForDate(dateStr: string): AcademicWeekMapping | null {
  for (const week of ACADEMIC_WEEKS_2026_2027) {
    if (dateStr >= week.startDate && dateStr <= week.endDate) {
      return week;
    }
  }
  // If opening day Nov 1
  if (dateStr === '2026-11-01') {
    return ACADEMIC_WEEKS_2026_2027[0];
  }
  return null;
}

/**
 * Helper to get special event on a date
 */
export function getSpecialEventsForDate(dateStr: string): TeachingCalendarSpecialEvent[] {
  return OFFICIAL_TEACHING_EVENTS.filter(evt => {
    if (evt.endDate) {
      return dateStr >= evt.startDate && dateStr <= evt.endDate;
    }
    return dateStr === evt.startDate;
  });
}

/**
 * Format date string into readable Khmer
 */
export function formatKhmerFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayNamesKm = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const monthNamesKm = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  
  const dayName = dayNamesKm[date.getDay()];
  const dayNum = String(d).padStart(2, '0');
  const monthName = monthNamesKm[m - 1];

  return `ថ្ងៃ${dayName} ទី${dayNum} ខែ${monthName} ឆ្នាំ${y}`;
}
