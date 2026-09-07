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

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'Hun Neng Pratong Primary School',
  schoolNameKm: 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង',
  province: 'ខេត្តកំពង់ចាម',
  district: 'ស្រុកព្រៃឈរ',
  commune: 'ឃុំព្រៃឈរ',
  village: 'ភូមិប្រទង',
  schoolCode: '030704',
  principalName: 'School Principal',
  principalNameKm: 'លោកនាយកសាលា',
  phone: '012 345 678',
  email: 'hunneng.pratong@moeys.gov.kh',
  logoUrl: '',
  academicYear: '២០២៥-២០២៦',
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
  { id: 'sub_science', nameEn: 'Science & Applied Nature', nameKm: 'វិទ្យាសាស្ត្រ', code: 'SCI', maxScore: 10, coefficient: 1, color: '#8b5cf6' },
  { id: 'sub_social', nameEn: 'Social Studies', nameKm: 'សិក្សាសង្គម', code: 'SOC', maxScore: 10, coefficient: 1, color: '#f59e0b' },
  { id: 'sub_morals', nameEn: 'Morality & Civics', nameKm: 'សីលធម៌-ពលរដ្ឋ', code: 'CIV', maxScore: 10, coefficient: 1, color: '#ec4899' },
  { id: 'sub_home_arts', nameEn: 'Home Economics & Arts', nameKm: 'គេហវិទ្យា-សិល្បៈ', code: 'HEA', maxScore: 10, coefficient: 1, color: '#06b6d4' },
  { id: 'sub_pe', nameEn: 'Physical Education & Sport', nameKm: 'អប់រំកាយ-កីឡា', code: 'PES', maxScore: 10, coefficient: 1, color: '#14b8a6' },
  { id: 'sub_health', nameEn: 'Health & Hygiene', nameKm: 'សុខភាព-អនាម័យ', code: 'HLT', maxScore: 10, coefficient: 1, color: '#10b981' },
  { id: 'sub_lifeskills', nameEn: 'Life Skills Education', nameKm: 'អប់រំបំណិនជីវិត', code: 'LSK', maxScore: 10, coefficient: 1, color: '#eab308' },
  { id: 'sub_foreign', nameEn: 'Foreign Language (English/French)', nameKm: 'ភាសាបរទេស', code: 'FOR', maxScore: 10, coefficient: 1, color: '#6366f1' },
];

export const DEFAULT_PERIODS: AssessmentPeriod[] = [
  // Semester 1
  {
    id: 'month_dec',
    nameEn: 'December (Month 1)',
    nameKm: 'ខែធ្នូ (ខែទី១)',
    semester: 1,
    isExam: false,
    lunarDateKm: 'ថ្ងែព្រហស្បតិ៍ ៦កើត ខែបុស្ស ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Thursday 6th Waxing Moon of Pusya, Year of Snake',
    solarDate: '25-Dec-2025',
    deadlineWarning: 'បញ្ចូលពិន្ទុមុនថ្ងៃទី ២០ ជារៀងរាល់ខែ',
  },
  {
    id: 'month_jan',
    nameEn: 'January (Month 2)',
    nameKm: 'ខែមករា (ខែទី២)',
    semester: 1,
    isExam: false,
    lunarDateKm: 'ថ្ងែសៅរ៍ ៦កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Saturday 6th Waxing Moon of Magha, Year of Snake',
    solarDate: '24-Jan-2026',
  },
  {
    id: 'month_feb',
    nameEn: 'February (Month 3)',
    nameKm: 'ខែកុម្ភៈ (ខែទី៣)',
    semester: 1,
    isExam: false,
    lunarDateKm: 'ថ្ងៃពុធ ៩កើត ខែផល្គុន ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Wednesday 9th Waxing Moon of Phalguna, Year of Snake',
    solarDate: '25-Feb-2026',
  },
  {
    id: 'month_mar',
    nameEn: 'March (Month 4)',
    nameKm: 'ខែមីនា (ខែទី៤)',
    semester: 1,
    isExam: false,
    lunarDateKm: 'ថ្ងៃពុធ ៧កើត ខែចេត្រ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Wednesday 7th Waxing Moon of Caitra, Year of Snake',
    solarDate: '25-Mar-2026',
  },
  {
    id: 'sem_1_exam',
    nameEn: 'Semester 1 Exam',
    nameKm: 'ប្រឡងឆមាសទី១',
    semester: 1,
    isExam: true,
    lunarDateKm: 'ថ្ងៃពុធ ៧កើត ខែចេត្រ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    lunarDateEn: 'Wednesday 7th Waxing Moon of Caitra, Year of Snake',
    solarDate: '25-Mar-2026',
  },
  // Semester 2
  {
    id: 'month_may',
    nameEn: 'May (Month 5)',
    nameKm: 'ខែឧសភា (ខែទី៥)',
    semester: 2,
    isExam: false,
    lunarDateKm: 'ថ្ងៃចន្ទ ៩កើត ខែជេស្ឋ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Monday 9th Waxing Moon of Jyaistha, Year of Horse',
    solarDate: '25-May-2026',
  },
  {
    id: 'month_jun',
    nameEn: 'June (Month 6)',
    nameKm: 'ខែមិថុនា (ខែទី៦)',
    semester: 2,
    isExam: false,
    lunarDateKm: 'ថ្ងៃព្រហស្បតិ៍ ១១កើត ខែអាសាឍ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Thursday 11th Waxing Moon of Asadha, Year of Horse',
    solarDate: '25-Jun-2026',
  },
  {
    id: 'month_jul',
    nameEn: 'July (Month 7)',
    nameKm: 'ខែកក្កដា (ខែទី៧)',
    semester: 2,
    isExam: false,
    lunarDateKm: 'ថ្ងៃសៅរ៍ ១១កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Saturday 11th Waxing Moon of Sravana, Year of Horse',
    solarDate: '25-Jul-2026',
  },
  {
    id: 'month_aug',
    nameEn: 'August (Month 8)',
    nameKm: 'ខែសីហា (ខែទី៨)',
    semester: 2,
    isExam: false,
    lunarDateKm: 'ថ្ងៃអង្គារ ១២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស ២៥៧០',
    lunarDateEn: 'Tuesday 12th Waxing Moon of Sravana, Year of Horse',
    solarDate: '25-Aug-2026',
  },
  {
    id: 'sem_2_exam',
    nameEn: 'Semester 2 Exam',
    nameKm: 'ប្រឡងឆមាសទី២',
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

export const INITIAL_CLASSES: ClassSection[] = [
  {
    id: 'class_6',
    name: 'Grade 6',
    nameKm: 'ថ្នាក់ទី៦',
    gradeLevel: 6,
    academicYear: '២០២៥-២០២៦',
    roomNumber: '',
    teacherName: 'Mr. Phan Sethka',
    teacherNameKm: 'លោកគ្រូ ផាន់ សេដ្ឋកា',
    schoolName: 'Hun Neng Pratong Primary School',
    schoolNameKm: 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង',
    province: 'ខេត្តកំពង់ចាម',
    district: 'ស្រុកព្រៃឈរ',
    commune: 'ឃុំព្រៃឈរ',
    studentIds: [
      'stu_1', 'stu_2', 'stu_3', 'stu_4', 'stu_5', 
      'stu_6', 'stu_7', 'stu_8', 'stu_9', 'stu_10',
      'stu_11', 'stu_12', 'stu_13', 'stu_14', 'stu_15',
      'stu_16', 'stu_17', 'stu_18', 'stu_19', 'stu_20',
      'stu_21', 'stu_22', 'stu_23', 'stu_24', 'stu_25'
    ],
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu_1',
    studentId: 'STU-06A-01',
    name: 'ចាន់ សុខា',
    nameLatin: 'Chan Sokha',
    gender: 'Male',
    dob: '2014-04-12',
    guardianName: 'ចាន់ វណ្ណា',
    guardianPhone: '012 889 922',
    attendanceCount: { present: 98, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 9.0,
    attitudeScore: 9.5,
    notes: 'Outstanding class leader, active listener and helpful to peers.'
  },
  {
    id: 'stu_2',
    studentId: 'STU-06A-02',
    name: 'មាស សុវណ្ណ',
    nameLatin: 'Meas Sovann',
    gender: 'Female',
    dob: '2014-07-20',
    guardianName: 'មាស ផល្លា',
    guardianPhone: '098 776 543',
    attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 9.6,
    attitudeScore: 9.8,
    notes: 'Top academic achiever, excellent mathematics and literacy skills.'
  },
  {
    id: 'stu_3',
    studentId: 'STU-06A-03',
    name: 'ទេព រតនា',
    nameLatin: 'Tep Rathana',
    gender: 'Male',
    dob: '2014-02-15',
    guardianName: 'ទេព សុភា',
    guardianPhone: '077 334 455',
    attendanceCount: { present: 96, absentExcused: 3, absentUnexcused: 1, late: 2 },
    behaviorScore: 4,
    conductRating: 'A',
    skillScore: 9.2,
    attitudeScore: 8.8,
    notes: 'Creative thinker, excels in science experiments and arts.'
  },
  {
    id: 'stu_4',
    studentId: 'STU-06A-04',
    name: 'កែវ វិច្ឆិកា',
    nameLatin: 'Keo Vicheka',
    gender: 'Female',
    dob: '2014-11-05',
    guardianName: 'កែវ ពិសិដ្ឋ',
    guardianPhone: '089 112 233',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 9.4,
    attitudeScore: 9.6,
    notes: 'Enthusiastic participant, very diligent with homework assignments.'
  },
  {
    id: 'stu_5',
    studentId: 'STU-06A-05',
    name: 'លី ចន្ធី',
    nameLatin: 'Ly Chanthy',
    gender: 'Female',
    dob: '2014-09-18',
    guardianName: 'លី ប៊ុនធឿន',
    guardianPhone: '015 667 788',
    attendanceCount: { present: 94, absentExcused: 4, absentUnexcused: 1, late: 3 },
    behaviorScore: 4,
    conductRating: 'B',
    skillScore: 7.8,
    attitudeScore: 8.5,
    notes: 'Good progress in Khmer reading, needs a bit more focus in Math.'
  },
  {
    id: 'stu_6',
    studentId: 'STU-06A-06',
    name: 'ពេជ្រ សំណាង',
    nameLatin: 'Pich Samnang',
    gender: 'Male',
    dob: '2014-05-30',
    guardianName: 'ពេជ្រ គឹមហុង',
    guardianPhone: '092 445 566',
    attendanceCount: { present: 92, absentExcused: 5, absentUnexcused: 2, late: 4 },
    behaviorScore: 3,
    conductRating: 'B',
    skillScore: 7.0,
    attitudeScore: 7.5,
    notes: 'Friendly student, energetic in physical education.'
  },
  {
    id: 'stu_7',
    studentId: 'STU-06A-07',
    name: 'សុខ បញ្ញា',
    nameLatin: 'Sok Panha',
    gender: 'Male',
    dob: '2014-08-14',
    guardianName: 'សុខ វិបុល',
    guardianPhone: '097 554 433',
    attendanceCount: { present: 99, absentExcused: 1, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 8.6,
    attitudeScore: 9.4,
    notes: 'Consistent performance, very respectful to teachers and classmates.'
  },
  {
    id: 'stu_8',
    studentId: 'STU-06A-08',
    name: 'អ៊ុក ដារ៉ារិទ្ធ',
    nameLatin: 'Ouk Dararith',
    gender: 'Male',
    dob: '2014-01-28',
    guardianName: 'អ៊ុក សារិន',
    guardianPhone: '011 223 344',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 1, late: 2 },
    behaviorScore: 4,
    conductRating: 'B',
    skillScore: 8.4,
    attitudeScore: 8.2,
    notes: 'Strong in social studies and basic English conversations.'
  },
  {
    id: 'stu_9',
    studentId: 'STU-06A-09',
    name: 'ហេង ស្រីលីន',
    nameLatin: 'Heng Sreylin',
    gender: 'Female',
    dob: '2014-12-10',
    guardianName: 'ហេង សុវណ្ណារ៉ា',
    guardianPhone: '088 998 877',
    attendanceCount: { present: 98, absentExcused: 1, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 8.8,
    attitudeScore: 9.2,
    notes: 'Pleasant attitude, thorough neat handwriting.'
  },
  {
    id: 'stu_10',
    studentId: 'STU-06A-10',
    name: 'ស៊ន វិរៈ',
    nameLatin: 'Sorn Virak',
    gender: 'Male',
    dob: '2014-03-03',
    guardianName: 'ស៊ន ថន',
    guardianPhone: '016 778 899',
    attendanceCount: { present: 89, absentExcused: 6, absentUnexcused: 3, late: 5 },
    behaviorScore: 3,
    conductRating: 'C',
    skillScore: 6.2,
    attitudeScore: 6.8,
    notes: 'Has potential, benefits from extra homework monitoring.'
  },
  {
    id: 'stu_11',
    studentId: 'STU-06A-11',
    name: 'ជា ធីតា',
    nameLatin: 'Chea Thida',
    gender: 'Female',
    dob: '2014-06-25',
    guardianName: 'ជា វឌ្ឍនា',
    guardianPhone: '078 887 766',
    attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 8.5,
    attitudeScore: 9.0,
    notes: 'Very quiet and focused, performs consistently in all topics.'
  },
  {
    id: 'stu_12',
    studentId: 'STU-06A-12',
    name: 'នួន វិចិត្រ',
    nameLatin: 'Nuon Vichetr',
    gender: 'Male',
    dob: '2014-10-17',
    guardianName: 'នួន សារឿន',
    guardianPhone: '093 332 211',
    attendanceCount: { present: 91, absentExcused: 4, absentUnexcused: 2, late: 3 },
    behaviorScore: 4,
    conductRating: 'B',
    skillScore: 7.5,
    attitudeScore: 8.0,
    notes: 'Shows quick problem solving instincts, participates well.'
  },
  {
    id: 'stu_13',
    studentId: 'STU-06A-13',
    name: 'ព្រំ កល្យាណ',
    nameLatin: 'Prum Kalyan',
    gender: 'Female',
    dob: '2014-04-09',
    guardianName: 'ព្រំ សុខា',
    guardianPhone: '017 445 566',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 8.7,
    attitudeScore: 9.3,
    notes: 'Helpful and polite, good artistic and presentation skills.'
  },
  {
    id: 'stu_14',
    studentId: 'STU-06A-14',
    name: 'អ៊ឹម វឌ្ឍនៈ',
    nameLatin: 'Im Vattanak',
    gender: 'Male',
    dob: '2014-08-01',
    guardianName: 'អ៊ឹម ចាន់ថា',
    guardianPhone: '085 554 433',
    attendanceCount: { present: 94, absentExcused: 3, absentUnexcused: 1, late: 2 },
    behaviorScore: 4,
    conductRating: 'B',
    skillScore: 8.0,
    attitudeScore: 8.4,
    notes: 'Enjoys science and sports activities with high energy.'
  },
  {
    id: 'stu_15',
    studentId: 'STU-06A-15',
    name: 'វ៉ាន់ ស្រីមុំ',
    nameLatin: 'Van Sreymom',
    gender: 'Female',
    dob: '2014-02-22',
    guardianName: 'វ៉ាន់ សុភាព',
    guardianPhone: '096 665 544',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 0, late: 1 },
    behaviorScore: 4,
    conductRating: 'A',
    skillScore: 8.3,
    attitudeScore: 8.9,
    notes: 'Solid academic standard, always submits work on time.'
  },
  // Grade 5B students
  {
    id: 'stu_16',
    studentId: 'STU-05B-01',
    name: 'គង់ ដារ៉ា',
    nameLatin: 'Kong Dara',
    gender: 'Male',
    dob: '2015-05-14',
    guardianName: 'គង់ ម៉េង',
    guardianPhone: '012 334 455',
    attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 8.6,
    attitudeScore: 9.0,
    notes: 'Enthusiastic math learner.'
  },
  {
    id: 'stu_17',
    studentId: 'STU-05B-02',
    name: 'សួស រតនា',
    nameLatin: 'Suos Rathana',
    gender: 'Female',
    dob: '2015-09-21',
    guardianName: 'សួស ផល្លី',
    guardianPhone: '089 998 877',
    attendanceCount: { present: 98, absentExcused: 1, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 9.2,
    attitudeScore: 9.5,
    notes: 'Excellent reading and vocabulary.'
  },
  {
    id: 'stu_18',
    studentId: 'STU-05B-03',
    name: 'ម៉ៅ វិបុល',
    nameLatin: 'Mao Vibol',
    gender: 'Male',
    dob: '2015-01-11',
    guardianName: 'ម៉ៅ វុទ្ធី',
    guardianPhone: '077 112 233',
    attendanceCount: { present: 93, absentExcused: 4, absentUnexcused: 1, late: 2 },
    behaviorScore: 4,
    conductRating: 'B',
    skillScore: 7.7,
    attitudeScore: 8.0,
    notes: 'Good team player.'
  },
  {
    id: 'stu_19',
    studentId: 'STU-05B-04',
    name: 'ឈុន សុភា',
    nameLatin: 'Chhun Sophea',
    gender: 'Female',
    dob: '2015-11-30',
    guardianName: 'ឈុន ប៊ុនណា',
    guardianPhone: '098 445 566',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 8.9,
    attitudeScore: 9.2,
    notes: 'Hardworking and well-mannered.'
  },
  {
    id: 'stu_20',
    studentId: 'STU-05B-05',
    name: 'ហាក់ សម្បត្តិ',
    nameLatin: 'Hak Sambath',
    gender: 'Male',
    dob: '2015-07-08',
    guardianName: 'ហាក់ គឹមឡេង',
    guardianPhone: '015 889 900',
    attendanceCount: { present: 90, absentExcused: 5, absentUnexcused: 2, late: 3 },
    behaviorScore: 3,
    conductRating: 'B',
    skillScore: 6.8,
    attitudeScore: 7.2,
    notes: 'Needs encouragement during test preparation.'
  },
  // Grade 6B Students
  {
    id: 'stu_21',
    studentId: 'STU-06B-01',
    name: 'យឹម វណ្ណារ៉ា',
    nameLatin: 'Yim Vannara',
    gender: 'Male',
    dob: '2014-03-10',
    guardianName: 'យឹម វិចិត្រ',
    guardianPhone: '012 998 811',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    attendanceCount: { present: 99, absentExcused: 1, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 9.4,
    attitudeScore: 9.6,
    notes: 'Top scholar in Grade 6B.'
  },
  {
    id: 'stu_22',
    studentId: 'STU-06B-02',
    name: 'ភឿន ធីតា',
    nameLatin: 'Phoeun Thida',
    gender: 'Female',
    dob: '2014-08-19',
    guardianName: 'ភឿន សារឿន',
    guardianPhone: '089 443 322',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 9.1,
    attitudeScore: 9.3,
    notes: 'Excellent math analytical skills.'
  },
  {
    id: 'stu_23',
    studentId: 'STU-06B-03',
    name: 'ខៀវ ពិសិដ្ឋ',
    nameLatin: 'Khiev Piseth',
    gender: 'Male',
    dob: '2014-11-22',
    guardianName: 'ខៀវ គង់',
    guardianPhone: '097 665 544',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 0, late: 2 },
    behaviorScore: 4,
    conductRating: 'A',
    skillScore: 8.5,
    attitudeScore: 8.8,
    notes: 'Active in science experiments.'
  },
  {
    id: 'stu_24',
    studentId: 'STU-06B-04',
    name: 'អ៊ឹង សុវណ្ណារី',
    nameLatin: 'Eang Sovannary',
    gender: 'Female',
    dob: '2014-05-15',
    guardianName: 'អ៊ឹង បូរី',
    guardianPhone: '070 887 766',
    attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'A',
    skillScore: 8.7,
    attitudeScore: 9.0,
    notes: 'Well-rounded academic performer.'
  },
  {
    id: 'stu_25',
    studentId: 'STU-06B-05',
    name: 'ចេង ម៉េងហុង',
    nameLatin: 'Cheng Menghong',
    gender: 'Male',
    dob: '2014-09-08',
    guardianName: 'ចេង សុខុម',
    guardianPhone: '011 445 566',
    attendanceCount: { present: 92, absentExcused: 4, absentUnexcused: 1, late: 3 },
    behaviorScore: 4,
    conductRating: 'B',
    skillScore: 7.9,
    attitudeScore: 8.1,
    notes: 'Good participation.'
  }
];

// Generate deterministic realistic initial score matrix
export function generateInitialScores(): Record<string, Record<string, Record<string, {
  homework: number;
  quizzes: number;
  midterm: number;
  finalExam: number;
  rawScore: number;
  behaviorRating: number;
}>>> {
  // Structure: scores[studentId][periodId][subjectId] = scoreObj
  const scores: Record<string, Record<string, Record<string, any>>> = {};

  // Base ability profile for students (10-point scale primary school system)
  const studentProfiles: Record<string, number> = {
    stu_1: 8.8, // Chan Sokha
    stu_2: 9.4, // Meas Sovann (Top 1)
    stu_3: 8.9, // Tep Rathana
    stu_4: 9.1, // Keo Vicheka (Top 2)
    stu_5: 7.6, // Ly Chanthy
    stu_6: 6.8, // Pich Samnang
    stu_7: 8.5, // Sok Panha
    stu_8: 8.1, // Ouk Dararith
    stu_9: 8.7, // Heng Sreylin
    stu_10: 5.9, // Sorn Virak
    stu_11: 8.4, // Chea Thida
    stu_12: 7.2, // Nuon Vichetr
    stu_13: 8.6, // Prum Kalyan
    stu_14: 7.8, // Im Vattanak
    stu_15: 8.2, // Van Sreymom
    stu_16: 8.6,
    stu_17: 9.2,
    stu_18: 7.7,
    stu_19: 8.9,
    stu_20: 6.8,
    stu_21: 9.4,
    stu_22: 9.1,
    stu_23: 8.5,
    stu_24: 8.7,
    stu_25: 7.9,
  };

  const periodFactors: Record<string, number> = {
    month_dec: 0.0,
    month_jan: 0.1,
    month_feb: -0.1,
    month_mar: 0.2,
    sem_1_exam: 0.1,
    month_may: 0.0,
    month_jun: 0.2,
    month_jul: 0.1,
    month_aug: 0.3,
    sem_2_exam: 0.2,
  };

  const subjectVariations: Record<string, number> = {
    sub_khmer: 0.1,
    sub_math: 0.0,
    sub_science: 0.2,
    sub_social: 0.3,
    sub_morals: 0.5,
    sub_arts: 0.6,
    sub_pe: 0.8,
    sub_english: -0.2,
  };

  for (const student of INITIAL_STUDENTS) {
    const stuId = student.id;
    scores[stuId] = {};
    const base = studentProfiles[stuId] || 7.5;

    for (const period of DEFAULT_PERIODS) {
      scores[stuId][period.id] = {};
      const pFactor = periodFactors[period.id] || 0;

      for (const subj of DEFAULT_SUBJECTS) {
        const sVariation = subjectVariations[subj.id] || 0;
        
        // Add slight pseudo-random variation based on hash
        const seed = (stuId.charCodeAt(stuId.length - 1) * 17 + period.id.charCodeAt(period.id.length - 1) * 13 + subj.id.charCodeAt(subj.id.length - 1) * 7) % 10;
        const variation = (seed - 5) * 0.12;

        let hw = Math.min(10, Math.max(4.0, Number((base + pFactor + sVariation + variation + 0.3).toFixed(1))));
        let qz = Math.min(10, Math.max(3.5, Number((base + pFactor + sVariation + variation - 0.2).toFixed(1))));
        let mid = Math.min(10, Math.max(3.5, Number((base + pFactor + sVariation + variation).toFixed(1))));
        let fin = Math.min(10, Math.max(3.0, Number((base + pFactor + sVariation + variation + 0.1).toFixed(1))));

        // Subcomponent generation for Khmer language (4 sub-skills):
        const khmerReading = Math.min(10, Math.max(4.0, Number((base + pFactor + 0.2 + (seed % 4) * 0.1).toFixed(1))));
        const khmerWriting = Math.min(10, Math.max(3.5, Number((base + pFactor + 0.1 + (seed % 3) * 0.1).toFixed(1))));
        const khmerListening = Math.min(10, Math.max(4.0, Number((base + pFactor + 0.3).toFixed(1))));
        const khmerSpeaking = Math.min(10, Math.max(4.0, Number((base + pFactor + 0.2).toFixed(1))));

        // Subcomponent generation for Mathematics (5 sections):
        const mathNumbers = Math.min(10, Math.max(4.0, Number((base + pFactor + 0.1 + (seed % 3) * 0.1).toFixed(1))));
        const mathAlgebra = Math.min(10, Math.max(3.5, Number((base + pFactor + (seed % 3) * 0.1).toFixed(1))));
        const mathMeasurement = Math.min(10, Math.max(3.5, Number((base + pFactor - 0.2 + (seed % 4) * 0.1).toFixed(1))));
        const mathGeometry = Math.min(10, Math.max(3.5, Number((base + pFactor + 0.1).toFixed(1))));
        const mathStatistics = Math.min(10, Math.max(4.0, Number((base + pFactor + 0.2).toFixed(1))));

        // Calculate weighted score: HW 20%, QZ 20%, MID 20%, FIN 40%
        let raw = Number((hw * 0.2 + qz * 0.2 + mid * 0.2 + fin * 0.4).toFixed(2));
        
        // If Khmer, raw is average of 4 components (អាន, សរសេរ, ស្ដាប់, និយាយ)
        if (subj.id === 'sub_khmer') {
          raw = Number(((khmerReading + khmerWriting + khmerListening + khmerSpeaking) / 4).toFixed(2));
        } else if (subj.id === 'sub_math') {
          // If Math, raw is average of 5 components (ចំនួន, ពិជគណិត, រង្វាស់រង្វល់, ធរណីមាត្រ, ស្ថិតិ)
          raw = Number(((mathNumbers + mathAlgebra + mathMeasurement + mathGeometry + mathStatistics) / 5).toFixed(2));
        }

        const behRating = Math.min(5, Math.max(3, Math.round(base / 2)));

        scores[stuId][period.id][subj.id] = {
          homework: hw,
          quizzes: qz,
          midterm: mid,
          finalExam: fin,
          rawScore: raw,
          behaviorRating: behRating,
          khmerReading,
          khmerWriting,
          khmerDictation: khmerWriting,
          khmerComposition: khmerWriting,
          khmerListening,
          khmerSpeaking,
          mathNumbers,
          mathAlgebra,
          mathMeasurement,
          mathGeometry,
          mathStatistics,
        };
      }
    }
  }

  return scores;
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

