import { CalendarEvent, TimetableSlot, CurriculumProgram } from '../types';
import { 
  ALL_MATH_CURRICULUM_PROGRAMS, 
  ALL_KHMER_CURRICULUM_PROGRAMS, 
  ALL_SOCIAL_CURRICULUM_PROGRAMS,
  ALL_SCIENCE_CURRICULUM_PROGRAMS
} from './curriculumData';

/**
 * Standard MoEYS Primary School Academic Calendar Events (2025-2026 / 2026-2027)
 * Compliant with the Ministry of Education, Youth and Sport (MoEYS) Academic Year Regulations
 */
export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  // Term 1 / Semester 1
  {
    id: 'evt_open_school',
    titleKm: 'ពិធីបើកបវេសនកាលឆ្នាំសិក្សាថ្មី ២០២៦-២០២៧',
    titleEn: 'Official School Opening Ceremony 2026-2027',
    date: '2026-11-01',
    type: 'academic',
    color: '#4f46e5',
    isMoEYSOfficial: true,
    descriptionKm: 'ពិធីបើកបវេសនកាលឆ្នាំសិក្សាថ្មីទូទាំងប្រទេសក្រោមការណែនាំរបស់ក្រសួងអប់រំ យុវជន និងកីឡា។',
    descriptionEn: 'National academic year inauguration ceremony.',
    lunarDateKm: '៧រោច ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក',
  },
  {
    id: 'evt_diag_khmer',
    titleKm: 'តេស្តដើមឆ្នាំសិក្សា ៖ ភាសាខ្មែរ (អំណាន & សរសេរ)',
    titleEn: 'Khmer Diagnostic Assessment (Reading & Writing)',
    date: '2026-11-02',
    endDate: '2026-11-07',
    type: 'exam',
    color: '#8b5cf6',
    isMoEYSOfficial: true,
    descriptionKm: 'ការវាស់ស្ទង់សមត្ថភាពអំណាន និងសំណេរដើមឆ្នាំ ដើម្បីកំណត់កម្រិតសមត្ថភាពសិស្ស និងរៀបចំផែនការជួយសិស្សរៀនយឺត។',
    descriptionEn: 'Baseline literacy and reading assessment for remediation.',
  },
  {
    id: 'evt_diag_math',
    titleKm: 'តេស្តដើមឆ្នាំសិក្សា ៖ គណិតវិទ្យា (លេខនព្វន្ត & ចំណោទ)',
    titleEn: 'Mathematics Diagnostic Assessment (Numeracy & Problems)',
    date: '2026-11-09',
    endDate: '2026-11-14',
    type: 'exam',
    color: '#7c3aed',
    isMoEYSOfficial: true,
    descriptionKm: 'ការវាស់ស្ទង់សមត្ថភាពគណិតវិទ្យា និងការគិតលេខដើមឆ្នាំ ដើម្បីបែងចែកក្រុមសិស្សទទួលការគាំទ្រពិសេស។',
    descriptionEn: 'Baseline mathematics and problem solving assessment.',
  },
  {
    id: 'evt_eval_nov',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែវិច្ឆិកា',
    titleEn: 'November Monthly Assessment & Scoring',
    date: '2026-11-23',
    endDate: '2026-11-28',
    type: 'academic',
    color: '#0284c7',
    isMoEYSOfficial: true,
    descriptionKm: 'ប្រឡង និងវាយតម្លៃ ៣ សម្បទា (វិជ្ជា, បំណិន, ចរិយា) ប្រចាំខែវិច្ឆិកា។',
    descriptionEn: 'Monthly continuous evaluation for November.',
  },
  {
    id: 'evt_eval_dec',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែធ្នូ',
    titleEn: 'December Monthly Assessment & Scoring',
    date: '2026-12-21',
    endDate: '2026-12-26',
    type: 'academic',
    color: '#0284c7',
    isMoEYSOfficial: true,
    descriptionKm: 'ប្រឡង និងវាយតម្លៃ ៣ សម្បទា (វិជ្ជា, បំណិន, ចរិយា) ប្រចាំខែធ្នូ។',
    descriptionEn: 'Monthly continuous evaluation for December.',
  },
  {
    id: 'evt_victory_day',
    titleKm: 'ទិវាជ័យជម្នះ ៧ មករា (ថ្ងៃឈប់សម្រាក)',
    titleEn: 'Victory Over Genocide Day (Public Holiday)',
    date: '2027-01-07',
    type: 'holiday',
    color: '#dc2626',
    isMoEYSOfficial: true,
    descriptionKm: 'ទិវាបុណ្យជាតិ ៧ មករា (សាលារៀនឈប់សម្រាក ១ ថ្ងៃ)។',
    descriptionEn: 'National Public Holiday.',
  },
  {
    id: 'evt_eval_jan',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែមករា',
    titleEn: 'January Monthly Assessment & Scoring',
    date: '2027-01-25',
    endDate: '2027-01-30',
    type: 'academic',
    color: '#0284c7',
    isMoEYSOfficial: true,
    descriptionKm: 'ការវាយតម្លៃប្រចាំខែមករា និងការចេញប័ណ្ណសរសើរ Top 5។',
    descriptionEn: 'Monthly continuous evaluation for January.',
  },
  {
    id: 'evt_meeting_pedagogy',
    titleKm: 'ការប្រជុំបច្ចេកទេសគរុកោសល្យ និងក្រុមប្រឹក្សាគ្រូ',
    titleEn: 'Monthly Pedagogical Technical Meeting',
    date: '2027-02-04',
    time: '14:00 - 17:00',
    type: 'meeting',
    color: '#7c3aed',
    isMoEYSOfficial: true,
    descriptionKm: 'ពិនិត្យវិធីសាស្ត្របង្រៀន និងតាមដានលទ្ធផលសិស្សរៀនយឺត។',
    descriptionEn: 'Staff pedagogical alignment and slow-learner support review.',
  },
  {
    id: 'evt_eval_feb',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែកុម្ភៈ',
    titleEn: 'February Monthly Assessment & Scoring',
    date: '2027-02-22',
    endDate: '2027-02-27',
    type: 'academic',
    color: '#0284c7',
    isMoEYSOfficial: true,
    descriptionKm: 'ការវាយតម្លៃប្រចាំខែកុម្ភៈ (ត្រៀមប្រឡងឆមាសទី១)។',
    descriptionEn: 'Monthly continuous evaluation for February.',
  },
  {
    id: 'evt_reading_day',
    titleKm: 'ទិវាជាតិអំណាន ១១ មីនា (National Reading Day)',
    titleEn: 'National Reading Day Celebration',
    date: '2027-03-11',
    type: 'activity',
    color: '#d97706',
    isMoEYSOfficial: true,
    descriptionKm: 'សកម្មភាពអំណានសៀវភៅ ការប្រកួតស្មូតកំណាព្យ និងតែងនិពន្ធថ្នាក់បឋមសិក្សា។',
    descriptionEn: 'Book reading contests, poetry recitation, and storytelling activities.',
  },
  {
    id: 'evt_exam_sem1',
    titleKm: 'សម័យប្រឡងឆមាសទី១ (Semester 1 Final Exam)',
    titleEn: 'Semester 1 Nationwide Comprehensive Exam',
    date: '2027-03-29',
    endDate: '2027-04-03',
    type: 'exam',
    color: '#e11d48',
    isMoEYSOfficial: true,
    descriptionKm: 'ការប្រឡងឆមាសទី១ គ្រប់មុខវិជ្ជាស្នូល (ភាសាខ្មែរ, គណិតវិទ្យា, វិទ្យាសាស្ត្រ, សិក្សាសង្គម)។',
    descriptionEn: 'Official Semester 1 Examination for Grades 1 to 6.',
  },
  {
    id: 'evt_khmer_new_year',
    titleKm: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ & វិស្សមកាលតូច',
    titleEn: 'Khmer New Year & Mid-Year Break',
    date: '2027-04-13',
    endDate: '2027-04-19',
    type: 'holiday',
    color: '#ea580c',
    isMoEYSOfficial: true,
    descriptionKm: 'ឈប់សម្រាកបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ (ឆ្នាំមមី អដ្ឋស័ក)។',
    descriptionEn: 'Khmer New Year Holidays and Mid-Year Vacation.',
  },

  // Term 2 / Semester 2
  {
    id: 'evt_start_sem2',
    titleKm: 'ការចាប់ផ្តើមដំណើរការបង្រៀនឆមាសទី២',
    titleEn: 'Semester 2 Resumption of Classes',
    date: '2027-04-20',
    type: 'academic',
    color: '#4f46e5',
    isMoEYSOfficial: true,
    descriptionKm: 'បើកដំណើរការបង្រៀន និងរៀនឆមាសទី២ តាមកម្មវិធីសិក្សាជាតិ។',
    descriptionEn: 'Commencement of Semester 2 curriculum.',
  },
  {
    id: 'evt_eval_may',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែឧសភា',
    titleEn: 'May Monthly Assessment & Scoring',
    date: '2027-05-24',
    endDate: '2027-05-29',
    type: 'academic',
    color: '#0284c7',
    isMoEYSOfficial: true,
    descriptionKm: 'ការវាយតម្លៃប្រចាំខែឧសភា ឆមាសទី២។',
    descriptionEn: 'Monthly continuous evaluation for May.',
  },
  {
    id: 'evt_sports_week',
    titleKm: 'សប្តាហ៍កីឡាសាលាបឋមសិក្សា & អនាម័យសុខភាព',
    titleEn: 'Primary School Sports & Health Week',
    date: '2027-06-07',
    endDate: '2027-06-12',
    type: 'activity',
    color: '#059669',
    isMoEYSOfficial: true,
    descriptionKm: 'ការប្រកួតកីឡាបាល់ទាត់ បាល់ទះ អត្តពលកម្ម និងការអប់រំសុខភាពអនាម័យ។',
    descriptionEn: 'Annual school athletic tournaments and hygiene promotion.',
  },
  {
    id: 'evt_eval_jun',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែមិថុនា',
    titleEn: 'June Monthly Assessment & Scoring',
    date: '2027-06-21',
    endDate: '2027-06-26',
    type: 'academic',
    color: '#0284c7',
    isMoEYSOfficial: true,
    descriptionKm: 'ការវាយតម្លៃប្រចាំខែមិថុនា។',
    descriptionEn: 'Monthly continuous evaluation for June.',
  },
  {
    id: 'evt_eval_jul',
    titleKm: 'ការវាយតម្លៃ និងប្រឡងប្រចាំខែកក្កដា',
    titleEn: 'July Monthly Assessment & Scoring',
    date: '2027-07-19',
    endDate: '2027-07-24',
    type: 'academic',
    color: '#0284c7',
    isMoEYSOfficial: true,
    descriptionKm: 'ការវាយតម្លៃប្រចាំខែកក្កដា និងត្រៀមប្រឡងបញ្ចប់ឆ្នាំ។',
    descriptionEn: 'Monthly continuous evaluation for July.',
  },
  {
    id: 'evt_exam_sem2',
    titleKm: 'សម័យប្រឡងឆមាសទី២ និងបញ្ចប់ឆ្នាំសិក្សា (Year-End Exam)',
    titleEn: 'Semester 2 Final & Year-End Examination',
    date: '2027-08-09',
    endDate: '2027-08-14',
    type: 'exam',
    color: '#be123c',
    isMoEYSOfficial: true,
    descriptionKm: 'ការប្រឡងបញ្ចប់ឆ្នាំសិក្សា និងប្រឡងបញ្ចប់កម្រិតបឋមសិក្សា (ថ្នាក់ទី៦)។',
    descriptionEn: 'Final Year-End Examination and Grade 6 Primary School Completion Evaluation.',
  },
  {
    id: 'evt_ceremony_closing',
    titleKm: 'ពិធីបិទឆ្នាំសិក្សា ចែកប័ណ្ណសរសើរ & វិស្សមកាលធំ',
    titleEn: 'Closing Ceremony, Awards & Grand Vacation',
    date: '2027-08-31',
    type: 'activity',
    color: '#b45309',
    isMoEYSOfficial: true,
    descriptionKm: 'ពិធីចែករង្វាន់សិស្សឆ្នើម Top 5 ទូទាំងសាលា ចែកសៀវភៅតាមដាន និងចាប់ផ្តើមវិស្សមកាលធំ។',
    descriptionEn: 'School awards presentation, report card handover, and grand summer vacation commencement.',
  },
];

/**
 * Standard Primary School Period Timetable Configuration
 * Official MoEYS Guideline No. 41 / 2+1+2 Recess Formula / 40 minutes per period
 */
export interface PeriodDefinition {
  period: number;
  startTime: string;
  endTime: string;
  labelKm: string;
  labelEn: string;
  isBreak?: boolean;
  isAssembly?: boolean;
}

export const STANDARD_PERIOD_TIMES_MORNING: PeriodDefinition[] = [
  { period: 0, startTime: '06:55', endTime: '07:10', labelKm: 'គោរពទង់ជាតិ / អនាម័យ (០៦:៥៥ - ០៧:១០)', labelEn: 'Assembly / Hygiene (06:55 - 07:10)', isAssembly: true },
  { period: 1, startTime: '07:10', endTime: '07:50', labelKm: 'ម៉ោងទី ១ (០៧:១០ - ០៧:៥០)', labelEn: 'Period 1 (07:10 - 07:50)' },
  { period: 2, startTime: '07:50', endTime: '08:30', labelKm: 'ម៉ោងទី ២ (០៧:៥០ - ០៨:៣០)', labelEn: 'Period 2 (07:50 - 08:30)' },
  { period: -1, startTime: '08:30', endTime: '08:45', labelKm: 'ចេញលេង (០៨:៣០ - ០៨:៤៥)', labelEn: 'Recess 1 (08:30 - 08:45)', isBreak: true },
  { period: 3, startTime: '08:45', endTime: '09:25', labelKm: 'ម៉ោងទី ៣ (០៨:៤៥ - ០៩:២៥)', labelEn: 'Period 3 (08:45 - 09:25)' },
  { period: -2, startTime: '09:25', endTime: '09:40', labelKm: 'ចេញលេង (០៩:២៥ - ០៩:៤០)', labelEn: 'Recess 2 (09:25 - 09:40)', isBreak: true },
  { period: 4, startTime: '09:40', endTime: '10:20', labelKm: 'ម៉ោងទី ៤ (០៩:៤០ - ១០:២០)', labelEn: 'Period 4 (09:40 - 10:20)' },
  { period: 5, startTime: '10:20', endTime: '11:00', labelKm: 'ម៉ោងទី ៥ (១០:២០ - ១១:០០)', labelEn: 'Period 5 (10:20 - 11:00)' },
];

export const STANDARD_PERIOD_TIMES_AFTERNOON: PeriodDefinition[] = [
  { period: 1, startTime: '01:00', endTime: '01:40', labelKm: 'ម៉ោងទី ១ (១៣:០០ - ១៣:៤០)', labelEn: 'Period 1 (13:00 - 13:40)' },
  { period: 2, startTime: '01:40', endTime: '02:20', labelKm: 'ម៉ោងទី ២ (១៣:៤០ - ១៤:២០)', labelEn: 'Period 2 (13:40 - 14:20)' },
  { period: -1, startTime: '02:20', endTime: '02:35', labelKm: 'ចេញលេងលើកទី១ (១៤:២០ - ១៤:៣៥)', labelEn: 'Recess 1 (14:20 - 14:35)', isBreak: true },
  { period: 3, startTime: '02:35', endTime: '03:15', labelKm: 'ម៉ោងទី ៣ (១៤:៣៥ - ១៥:១៥)', labelEn: 'Period 3 (14:35 - 15:15)' },
  { period: -2, startTime: '03:15', endTime: '03:30', labelKm: 'ចេញលេងលើកទី២ (១៥:១៥ - ១៥:៣០)', labelEn: 'Recess 2 (15:15 - 15:30)', isBreak: true },
  { period: 4, startTime: '03:30', endTime: '04:10', labelKm: 'ម៉ោងទី ៤ (១៥:៣០ - ១៦:១០)', labelEn: 'Period 4 (15:30 - 16:10)' },
  { period: 5, startTime: '04:10', endTime: '04:50', labelKm: 'ម៉ោងទី ៥ (១៦:១០ - ១៦:៥០)', labelEn: 'Period 5 (16:10 - 16:50)' },
  { period: 6, startTime: '04:50', endTime: '05:00', labelKm: 'គោរពទង់ជាតិ / អនាម័យពេលចេញទៅផ្ទះ (១៦:៥០ - ១៧:០០)', labelEn: 'Assembly / Hygiene Dismissal (16:50 - 17:00)', isAssembly: true },
];

// Fallback for existing components
export const STANDARD_PERIOD_TIMES = STANDARD_PERIOD_TIMES_MORNING;

export const DAYS_OF_WEEK = [
  { dayNumber: 1, nameKm: 'ថ្ងៃច័ន្ទ', nameEn: 'Monday', shortKm: 'ច័ន្ទ', shortEn: 'Mon' },
  { dayNumber: 2, nameKm: 'ថ្ងៃអង្គារ', nameEn: 'Tuesday', shortKm: 'អង្គារ', shortEn: 'Tue' },
  { dayNumber: 3, nameKm: 'ថ្ងៃពុធ', nameEn: 'Wednesday', shortKm: 'ពុធ', shortEn: 'Wed' },
  { dayNumber: 4, nameKm: 'ថ្ងៃព្រហស្បតិ៍', nameEn: 'Thursday', shortKm: 'ព្រហស្បតិ៍', shortEn: 'Thu' },
  { dayNumber: 5, nameKm: 'ថ្ងៃសុក្រ', nameEn: 'Friday', shortKm: 'សុក្រ', shortEn: 'Fri' },
  { dayNumber: 6, nameKm: 'ថ្ងៃសៅរ៍', nameEn: 'Saturday', shortKm: 'សៅរ៍', shortEn: 'Sat' },
];

export const TIMETABLE_SUBJECTS_META: Record<string, { nameKm: string; nameEn: string; color: string; shortKm: string }> = {
  sub_khmer: { nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Language', color: '#2563eb', shortKm: 'ខ្មែរ' },
  sub_math: { nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', color: '#059669', shortKm: 'គណិត' },
  sub_science: { nameKm: 'វិទ្យាសាស្ត្រ', nameEn: 'Science', color: '#7c3aed', shortKm: 'វិទ្យា' },
  sub_social: { nameKm: 'សិក្សាសង្គម', nameEn: 'Social Studies', color: '#d97706', shortKm: 'សង្គម' },
  sub_social_science: { nameKm: 'វិទ្យាសាស្ត្រ-សិក្សាសង្គម', nameEn: 'Science & Social Studies', color: '#0891b2', shortKm: 'វិទ្យា-សិក្សា' },
  sub_pe: { nameKm: 'អប់រំកាយ-កីឡា', nameEn: 'Physical Education & Sports', color: '#e11d48', shortKm: 'អប់រំកាយ-កីឡា' },
  sub_pe_health: { nameKm: 'អប់រំកាយ-សុខភាព', nameEn: 'PE & Health', color: '#e11d48', shortKm: 'អប់រំកាយ-សុខភាព' },
  sub_lifeskills: { nameKm: 'បំណិនជីវិត / គំនូរ / ជួយសិស្សរៀនយឺត', nameEn: 'Life Skills / Arts / Remedial', color: '#4f46e5', shortKm: 'បំណិនជីវិត' },
  sub_assembly: { nameKm: 'គោរពទង់ជាតិ', nameEn: 'National Flag Ceremony', color: '#0284c7', shortKm: 'ទង់ជាតិ' },
  sub_hygiene: { nameKm: 'អនាម័យថ្នាក់រៀន', nameEn: 'Classroom Hygiene', color: '#0d9488', shortKm: 'អនាម័យ' },
  sub_meeting: { nameKm: 'ប្រជុំបច្ចេកទេស / ពលកម្ម', nameEn: 'Technical Meeting / Labor', color: '#64748b', shortKm: 'ប្រជុំ/ពលកម្ម' },
};

export const OFFICIAL_TIMETABLE_METADATA = {
  ministryRefKm: 'សេចក្តីណែនាំលេខ ៤១ អយក.សណន ចុះនៅថ្ងៃទី០៣ ខែតុលា ឆ្នាំ២០២៥ របស់ក្រសួងអប់រំ យុវជន និងកីឡា',
  provinceKm: 'មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តកំពង់ចាម',
  districtKm: 'ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុកស្ទឹងត្រង់',
  schoolKm: 'សាលាបឋមសិក្សា ហ៊ុន ណេង ប្រទង',
  principalNameKm: 'ផាត ថា',
  issueDateFullKm: 'ថ្ងៃចន្ទ ១៣កើត ខែកត្តិក ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩ / ត្រូវនឹងថ្ងៃទី ០៣ ខែ វិច្ឆិកា ឆ្នាំ២០២៥',
  notesGrade4to6Km: [
    'ភាសាខ្មែរ ១០ ម៉ោង/សប្តាហ៍, គណិតវិទ្យា ៦ ម៉ោង/សប្តាហ៍, សិក្សាសង្គម ៤ ម៉ោង/សប្តាហ៍, វិទ្យាសាស្ត្រ ៣ ម៉ោង/សប្តាហ៍, អប់រំកាយ និងកីឡា ២ ម៉ោង/សប្តាហ៍។',
    'ថ្ងៃព្រហស្បតិ៍ មិនបង្រៀនមេរៀនតទេ៖ ម៉ោងទី១-៣ (៣ម៉ោង) ជាម៉ោងបំណិនជីវិតតាមមូលដ្ឋាន គំនូរ ជួយសិស្សរៀនយឺត និងភាសាបរទេស។ ម៉ោងទី៤-៥ (២ម៉ោង) ប្រជុំបច្ចេកទេសគរុកោសល្យគ្រូ និងសិស្សធ្វើពលកម្មសម្អាតបរិស្ថាន។',
    'សរុបម៉ោងបង្រៀនស្នូល ២៥ ម៉ោង + ម៉ោងព្រហស្បតិ៍ ៥ ម៉ោង = ៣០ ម៉ោងសិក្សាក្នុងមួយសប្តាហ៍។',
    'អនុវត្តចេញលេងតាមរូបមន្ត ២+១+២ (២ម៉ោង ចេញលេង១៥នាទី + ១ម៉ោង ចេញលេង១៥នាទី + ២ម៉ោង) ស្តង់ដារ ៤០ នាទីក្នុងមួយម៉ោងសិក្សា។',
    'សម្រាប់ភាសាខ្មែរ រួមបញ្ចូលការអនុវត្តសរសេរតាមអាន (សរ.អាន) ២ ម៉ោង, តែងសេចក្តី (គស.ក្តី) ២ ម៉ោង, និងសរសេរអក្សរផ្ចង់/អក្ខរាវិរុទ្ធ (អ.ផ្ទាល់) ១ ម៉ោង។',
    'ពិធីគោរពទង់ជាតិពេលព្រឹក (០៦:៥៥ - ០៧:១០) ថ្ងៃចន្ទ ពុធ ព្រហស្បតិ៍ សៅរ៍ និងអនាម័យថ្នាក់រៀន ថ្ងៃអង្គារ សុក្រ។ ពេលរសៀលគោរពទង់ជាតិ/អនាម័យពេលចេញទៅផ្ទះ (០៤:៥០ - ០៥:០០)។'
  ],
  notesGrade1to3Km: [
    'ភាសាខ្មែរ ១៣ ម៉ោង/សប្តាហ៍, គណិតវិទ្យា ៧ ម៉ោង/សប្តាហ៍, វិទ្យាសាស្ត្រ-សិក្សាសង្គម ៣ ម៉ោង/សប្តាហ៍ (បញ្ចូលមុខវិជ្ជាតែមួយ), អប់រំកាយ និងសុខភាព ២ ម៉ោង/សប្តាហ៍។',
    'ថ្ងៃព្រហស្បតិ៍ មិនបង្រៀនមេរៀនតទេ៖ ម៉ោងទី១-៣ (៣ម៉ោង) ជាម៉ោងបំណិនជីវិតតាមមូលដ្ឋាន គំនូរ និងជួយសិស្សរៀនយឺត។ ម៉ោងទី៤-៥ (២ម៉ោង) ប្រជុំបច្ចេកទេស និងសកម្មភាពពលកម្ម/សាលា។',
    'សរុបម៉ោងបង្រៀនស្នូល ២៥ ម៉ោង + ម៉ោងព្រហស្បតិ៍ ៥ ម៉ោង = ៣០ ម៉ោងសិក្សាក្នុងមួយសប្តាហ៍។',
    'អនុវត្តចេញលេងតាមរូបមន្ត ២+១+២ (២ម៉ោង ចេញលេង១៥នាទី + ១ម៉ោង ចេញលេង១៥នាទី + ២ម៉ោង) ស្តង់ដារ ៤០ នាទីក្នុងមួយម៉ោងសិក្សា។',
    'សម្រាប់ភាសាខ្មែរ រួមបញ្ចូលសរសេរអក្សរផ្ចង់ (អ.ផ្ទាល់) ១ ម៉ោង, សរសេរតាមអាន (សរ.អាន) ២ ម៉ោង, និងតែងសេចក្តី (គស.ក្តី) ២ ម៉ោង (ថ្នាក់ទី៣) / បំណិនសរសេរ។',
    'ពិធីគោរពទង់ជាតិពេលព្រឹក (០៦:៥៥ - ០៧:១០) ថ្ងៃចន្ទ ពុធ ព្រហស្បតិ៍ សៅរ៍ និងអនាម័យថ្នាក់រៀន ថ្ងៃអង្គារ សុក្រ។ ពេលរសៀលគោរពទង់ជាតិ/អនាម័យពេលចេញទៅផ្ទះ (០៤:៥០ - ០៥:០០)។'
  ],
};

interface SlotBlueprint {
  day: 1 | 2 | 3 | 4 | 5 | 6;
  period: number;
  subjectId: string;
  subTopicKm?: string;
  customTitleKm?: string;
}

// Official MoEYS Timetable for Grades 4 - 6 (Morning)
// Khmer: 10h, Math: 6h, Social: 4h, Science: 3h, PE: 2h, Thu AM P1-3 (LifeSkills): 3h, Thu AM P4-5 (Meeting/Labor): 2h = Total 30h
const TIMETABLE_G4_6_MORNING: SlotBlueprint[] = [
  // Period 0 (06:55 - 07:10) Flag ceremony / Hygiene
  { day: 1, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 2, period: 0, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 3, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 4, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 5, period: 0, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 6, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },

  // Period 1 (07:10 - 07:50)
  { day: 1, period: 1, subjectId: 'sub_pe', customTitleKm: 'អប់រំកាយ-កីឡា' },
  { day: 2, period: 1, subjectId: 'sub_khmer' },
  { day: 3, period: 1, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 1, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត និងភាសាបរទេស' },
  { day: 5, period: 1, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 1, subjectId: 'sub_pe', customTitleKm: 'អប់រំកាយ-កីឡា' },

  // Period 2 (07:50 - 08:30)
  { day: 1, period: 2, subjectId: 'sub_khmer' },
  { day: 2, period: 2, subjectId: 'sub_khmer' },
  { day: 3, period: 2, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 2, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត និងភាសាបរទេស' },
  { day: 5, period: 2, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 2, subjectId: 'sub_science' },

  // Period 3 (08:45 - 09:25)
  { day: 1, period: 3, subjectId: 'sub_khmer', subTopicKm: 'អ.ផ្ទាល់' },
  { day: 2, period: 3, subjectId: 'sub_math' },
  { day: 3, period: 3, subjectId: 'sub_math' },
  { day: 4, period: 3, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត និងភាសាបរទេស' },
  { day: 5, period: 3, subjectId: 'sub_math' },
  { day: 6, period: 3, subjectId: 'sub_math' },

  // Period 4 (09:40 - 10:20)
  { day: 1, period: 4, subjectId: 'sub_math' },
  { day: 2, period: 4, subjectId: 'sub_social' },
  { day: 3, period: 4, subjectId: 'sub_science' },
  { day: 4, period: 4, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / ពលកម្ម' },
  { day: 5, period: 4, subjectId: 'sub_social' },
  { day: 6, period: 4, subjectId: 'sub_khmer' },

  // Period 5 (10:20 - 11:00)
  { day: 1, period: 5, subjectId: 'sub_math' },
  { day: 2, period: 5, subjectId: 'sub_social' },
  { day: 3, period: 5, subjectId: 'sub_science' },
  { day: 4, period: 5, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / ពលកម្ម' },
  { day: 5, period: 5, subjectId: 'sub_social' },
  { day: 6, period: 5, subjectId: 'sub_khmer' },
];

// Official MoEYS Timetable for Grades 4 - 6 (Afternoon)
const TIMETABLE_G4_6_AFTERNOON: SlotBlueprint[] = [
  // Period 1 (01:00 - 01:40)
  { day: 1, period: 1, subjectId: 'sub_pe', customTitleKm: 'អប់រំកាយ-កីឡា' },
  { day: 2, period: 1, subjectId: 'sub_khmer' },
  { day: 3, period: 1, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 1, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត និងភាសាបរទេស' },
  { day: 5, period: 1, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 1, subjectId: 'sub_pe', customTitleKm: 'អប់រំកាយ-កីឡា' },

  // Period 2 (01:40 - 02:20)
  { day: 1, period: 2, subjectId: 'sub_khmer' },
  { day: 2, period: 2, subjectId: 'sub_khmer' },
  { day: 3, period: 2, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 2, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត និងភាសាបរទេស' },
  { day: 5, period: 2, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 2, subjectId: 'sub_science' },

  // Period 3 (02:35 - 03:15)
  { day: 1, period: 3, subjectId: 'sub_khmer', subTopicKm: 'អ.ផ្ទាល់' },
  { day: 2, period: 3, subjectId: 'sub_math' },
  { day: 3, period: 3, subjectId: 'sub_math' },
  { day: 4, period: 3, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត និងភាសាបរទេស' },
  { day: 5, period: 3, subjectId: 'sub_math' },
  { day: 6, period: 3, subjectId: 'sub_math' },

  // Period 4 (03:30 - 04:10)
  { day: 1, period: 4, subjectId: 'sub_math' },
  { day: 2, period: 4, subjectId: 'sub_social' },
  { day: 3, period: 4, subjectId: 'sub_science' },
  { day: 4, period: 4, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / ពលកម្ម' },
  { day: 5, period: 4, subjectId: 'sub_social' },
  { day: 6, period: 4, subjectId: 'sub_khmer' },

  // Period 5 (04:10 - 04:50)
  { day: 1, period: 5, subjectId: 'sub_math' },
  { day: 2, period: 5, subjectId: 'sub_social' },
  { day: 3, period: 5, subjectId: 'sub_science' },
  { day: 4, period: 5, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / ពលកម្ម' },
  { day: 5, period: 5, subjectId: 'sub_social' },
  { day: 6, period: 5, subjectId: 'sub_khmer' },

  // Period 6 (04:50 - 05:00) Flag ceremony / Hygiene
  { day: 1, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 2, period: 6, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 3, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 4, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 5, period: 6, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 6, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
];

// Official MoEYS Timetable for Grades 1 - 3 (Morning)
// Khmer: 13h, Math: 7h, Science-Social: 3h, PE-Health: 2h, Thu AM P1-3 (LifeSkills/Remedial): 3h, Thu AM P4-5 (Meeting/Labor): 2h = Total 30h
const TIMETABLE_G1_3_MORNING: SlotBlueprint[] = [
  // Period 0 (06:55 - 07:10) Flag ceremony / Hygiene
  { day: 1, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 2, period: 0, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 3, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 4, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 5, period: 0, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 6, period: 0, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },

  // Period 1 (07:10 - 07:50)
  { day: 1, period: 1, subjectId: 'sub_pe_health', customTitleKm: 'អប់រំកាយ-សុខភាព' },
  { day: 2, period: 1, subjectId: 'sub_khmer' },
  { day: 3, period: 1, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 1, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត' },
  { day: 5, period: 1, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 1, subjectId: 'sub_pe_health', customTitleKm: 'អប់រំកាយ-សុខភាព' },

  // Period 2 (07:50 - 08:30)
  { day: 1, period: 2, subjectId: 'sub_math' },
  { day: 2, period: 2, subjectId: 'sub_khmer' },
  { day: 3, period: 2, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 2, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត' },
  { day: 5, period: 2, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 2, subjectId: 'sub_math' },

  // Period 3 (08:45 - 09:25)
  { day: 1, period: 3, subjectId: 'sub_math' },
  { day: 2, period: 3, subjectId: 'sub_math' },
  { day: 3, period: 3, subjectId: 'sub_math' },
  { day: 4, period: 3, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត' },
  { day: 5, period: 3, subjectId: 'sub_social_science', customTitleKm: 'វិទ្យាសាស្ត្រ-សិក្សាសង្គម' },
  { day: 6, period: 3, subjectId: 'sub_khmer' },

  // Period 4 (09:40 - 10:20)
  { day: 1, period: 4, subjectId: 'sub_khmer' },
  { day: 2, period: 4, subjectId: 'sub_social_science', customTitleKm: 'វិទ្យាសាស្ត្រ-សិក្សាសង្គម' },
  { day: 3, period: 4, subjectId: 'sub_khmer' },
  { day: 4, period: 4, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / សិស្សធ្វើពលកម្ម' },
  { day: 5, period: 4, subjectId: 'sub_math' },
  { day: 6, period: 4, subjectId: 'sub_khmer' },

  // Period 5 (10:20 - 11:00)
  { day: 1, period: 5, subjectId: 'sub_khmer', subTopicKm: 'អ.ផ្ទាល់' },
  { day: 2, period: 5, subjectId: 'sub_social_science', customTitleKm: 'វិទ្យាសាស្ត្រ-សិក្សាសង្គម' },
  { day: 3, period: 5, subjectId: 'sub_khmer' },
  { day: 4, period: 5, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / សិស្សធ្វើពលកម្ម' },
  { day: 5, period: 5, subjectId: 'sub_math' },
  { day: 6, period: 5, subjectId: 'sub_khmer' },
];

// Official MoEYS Timetable for Grades 1 - 3 (Afternoon)
const TIMETABLE_G1_3_AFTERNOON: SlotBlueprint[] = [
  // Period 1 (01:00 - 01:40)
  { day: 1, period: 1, subjectId: 'sub_pe_health', customTitleKm: 'អប់រំកាយ-សុខភាព' },
  { day: 2, period: 1, subjectId: 'sub_khmer' },
  { day: 3, period: 1, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 1, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត' },
  { day: 5, period: 1, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 1, subjectId: 'sub_pe_health', customTitleKm: 'អប់រំកាយ-សុខភាព' },

  // Period 2 (01:40 - 02:20)
  { day: 1, period: 2, subjectId: 'sub_math' },
  { day: 2, period: 2, subjectId: 'sub_khmer' },
  { day: 3, period: 2, subjectId: 'sub_khmer', subTopicKm: 'សរ.អាន' },
  { day: 4, period: 2, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត' },
  { day: 5, period: 2, subjectId: 'sub_khmer', subTopicKm: 'គស.ក្តី' },
  { day: 6, period: 2, subjectId: 'sub_math' },

  // Period 3 (02:35 - 03:15)
  { day: 1, period: 3, subjectId: 'sub_math' },
  { day: 2, period: 3, subjectId: 'sub_math' },
  { day: 3, period: 3, subjectId: 'sub_math' },
  { day: 4, period: 3, subjectId: 'sub_lifeskills', customTitleKm: 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត' },
  { day: 5, period: 3, subjectId: 'sub_social_science', customTitleKm: 'វិទ្យាសាស្ត្រ-សិក្សាសង្គម' },
  { day: 6, period: 3, subjectId: 'sub_khmer' },

  // Period 4 (03:30 - 04:10)
  { day: 1, period: 4, subjectId: 'sub_khmer' },
  { day: 2, period: 4, subjectId: 'sub_social_science', customTitleKm: 'វិទ្យាសាស្ត្រ-សិក្សាសង្គម' },
  { day: 3, period: 4, subjectId: 'sub_khmer' },
  { day: 4, period: 4, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / សិស្សធ្វើពលកម្ម' },
  { day: 5, period: 4, subjectId: 'sub_math' },
  { day: 6, period: 4, subjectId: 'sub_khmer' },

  // Period 5 (04:10 - 04:50)
  { day: 1, period: 5, subjectId: 'sub_khmer', subTopicKm: 'អ.ផ្ទាល់' },
  { day: 2, period: 5, subjectId: 'sub_social_science', customTitleKm: 'វិទ្យាសាស្ត្រ-សិក្សាសង្គម' },
  { day: 3, period: 5, subjectId: 'sub_khmer' },
  { day: 4, period: 5, subjectId: 'sub_meeting', customTitleKm: 'ប្រជុំបច្ចេកទេស / សិស្សធ្វើពលកម្ម' },
  { day: 5, period: 5, subjectId: 'sub_math' },
  { day: 6, period: 5, subjectId: 'sub_khmer' },

  // Period 6 (04:50 - 05:00) Flag ceremony / Hygiene
  { day: 1, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 2, period: 6, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 3, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 4, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
  { day: 5, period: 6, subjectId: 'sub_hygiene', customTitleKm: 'អនាម័យថ្នាក់រៀន' },
  { day: 6, period: 6, subjectId: 'sub_assembly', customTitleKm: 'គោរពទង់ជាតិ' },
];

/**
 * Generate standard weekly timetable slots for a class section
 * Supporting both Grades 1-3 and Grades 4-6, both Morning and Afternoon shifts
 */
export function generateDefaultTimetable(
  classId: string,
  gradeLevel: number = 6,
  teacherNameKm: string = 'ស៊ុន ណារិទ្ធ',
  room: string = 'បន្ទប់ ០៤'
): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  const isLowerGrade = gradeLevel <= 3;

  // 1. Morning Shift Generation
  const morningPlan = isLowerGrade ? TIMETABLE_G1_3_MORNING : TIMETABLE_G4_6_MORNING;
  morningPlan.forEach((bp) => {
    const timeDef = STANDARD_PERIOD_TIMES_MORNING.find(p => p.period === bp.period);
    slots.push({
      id: `slot_${classId}_m_d${bp.day}_p${bp.period}`,
      classId,
      dayOfWeek: bp.day,
      periodNumber: bp.period,
      shift: 'morning',
      startTime: timeDef ? timeDef.startTime : '07:10',
      endTime: timeDef ? timeDef.endTime : '07:50',
      subjectId: bp.subjectId,
      subTopicKm: bp.subTopicKm,
      customTitleKm: bp.customTitleKm,
      teacherNameKm,
      room,
    });
  });

  // 2. Afternoon Shift Generation
  const afternoonPlan = isLowerGrade ? TIMETABLE_G1_3_AFTERNOON : TIMETABLE_G4_6_AFTERNOON;
  afternoonPlan.forEach((bp) => {
    const timeDef = STANDARD_PERIOD_TIMES_AFTERNOON.find(p => p.period === bp.period);
    slots.push({
      id: `slot_${classId}_a_d${bp.day}_p${bp.period}`,
      classId,
      dayOfWeek: bp.day,
      periodNumber: bp.period,
      shift: 'afternoon',
      startTime: timeDef ? timeDef.startTime : '01:00',
      endTime: timeDef ? timeDef.endTime : '01:40',
      subjectId: bp.subjectId,
      subTopicKm: bp.subTopicKm,
      customTitleKm: bp.customTitleKm,
      teacherNameKm,
      room,
    });
  });

  return slots;
}

/**
 * Initial Multi-class Timetable slots for all standard primary classes
 * Grades 1-3 use Lower Primary Schedule, Grades 4-6 use Upper Primary Schedule
 */
export const INITIAL_TIMETABLE_SLOTS: TimetableSlot[] = [
  ...generateDefaultTimetable('class_6a', 6, 'ស៊ុន ណារិទ្ធ', 'បន្ទប់ ០៤'),
  ...generateDefaultTimetable('class_6b', 6, 'សេង គីមស៊ុន', 'បន្ទប់ ០៥'),
  ...generateDefaultTimetable('class_5a', 5, 'ប៉ាង វុទ្ធី', 'បន្ទប់ ០៣'),
  ...generateDefaultTimetable('class_5b', 5, 'ចាន់ ផល្លា', 'បន្ទប់ ០២'),
  ...generateDefaultTimetable('class_4a', 4, 'កែវ សុខុម', 'បន្ទប់ ០១'),
  ...generateDefaultTimetable('class_3a', 3, 'លី សុភារម្យ', 'បន្ទប់ ០៦'),
  ...generateDefaultTimetable('class_2a', 2, 'ម៉ៅ វណ្ណា', 'បន្ទប់ ០៧'),
  ...generateDefaultTimetable('class_1a', 1, 'ហេង សុវណ្ណារ៉ា', 'បន្ទប់ ០៨'),
];

/**
 * Standard MoEYS Primary School Curriculum (កម្មវិធីសិក្សាបឋមសិក្សា) 
 * 36 Weeks Detailed Lesson Program covering Grade 1 to 6
 */
export const DEFAULT_CURRICULUM_PROGRAMS: CurriculumProgram[] = [
  ...ALL_KHMER_CURRICULUM_PROGRAMS,
  ...ALL_MATH_CURRICULUM_PROGRAMS,
  ...ALL_SOCIAL_CURRICULUM_PROGRAMS,
  ...ALL_SCIENCE_CURRICULUM_PROGRAMS,
];
