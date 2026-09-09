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
  district: 'ស្រុកស្ទឹងត្រង់',
  commune: 'ឃុំអូរម្លូ',
  village: 'ភូមិប្រទង',
  schoolCode: '030704',
  principalName: 'School Principal',
  principalNameKm: 'លោកនាយកសាលា',
  phone: '012 345 678',
  email: 'hunneng.pratong@moeys.gov.kh',
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
  { id: 'sub_science', nameEn: 'Science & Applied Nature', nameKm: 'វិទ្យាសាស្ត្រ', code: 'SCI', maxScore: 10, coefficient: 1, color: '#8b5cf6' },
  { id: 'sub_social', nameEn: 'Social Studies', nameKm: 'សិក្សាសង្គម', code: 'SOC', maxScore: 10, coefficient: 1, color: '#f59e0b' },
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

export const INITIAL_CLASSES: ClassSection[] = [
  {
    id: 'class_6',
    name: 'Grade 6',
    nameKm: 'ថ្នាក់ទី៦',
    gradeLevel: 6,
    academicYear: '២០២៦-២០២៧',
    roomNumber: '',
    teacherName: 'លោកគ្រូ ផាន សិតការណ៍',
    teacherNameKm: 'លោកគ្រូ ផាន សិតការណ៍',
    schoolName: 'Hun Neng Pratong Primary School',
    schoolNameKm: 'សាលាបឋមសិក្សាហ៊ុន ណេង ប្រទង',
    province: 'ខេត្តកំពង់ចាម',
    district: 'ស្រុកស្ទឹងត្រង់',
    commune: 'ឃុំអូរម្លូ',
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
    name: 'ចាន់ ផៃយ៉ា',
    nameLatin: 'Chan Phaiya',
    gender: 'Male',
    dob: '2014-04-12',
    guardianName: 'ចាន់ វណ្ណា',
    guardianPhone: '012 889 922',
    attendanceCount: { present: 98, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.8,
    attitudeScore: 8.51,
    notes: 'សិស្សមានវិន័យល្អ គោរពបទបញ្ជាផ្ទៃក្នុងសាលា។'
  },
  {
    id: 'stu_2',
    studentId: 'STU-06A-02',
    name: 'ចេន តាំងលី',
    nameLatin: 'Chen Tangly',
    gender: 'Male',
    dob: '2014-07-20',
    guardianName: 'ចេន សុខុម',
    guardianPhone: '098 776 543',
    attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 9.0,
    attitudeScore: 8.51,
    notes: 'ឧស្សាហ៍ព្យាយាម រៀនពូកែ និងរួសរាយរាក់ទាក់។'
  },
  {
    id: 'stu_3',
    studentId: 'STU-06A-03',
    name: 'ចេន សុខឃាង',
    nameLatin: 'Chen Sokkheang',
    gender: 'Female',
    dob: '2014-02-15',
    guardianName: 'ចេន ផល្លា',
    guardianPhone: '077 334 455',
    attendanceCount: { present: 96, absentExcused: 3, absentUnexcused: 1, late: 2 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.7,
    attitudeScore: 8.51,
    notes: 'សុភាពរាបសារ យកចិត្តទុកដាក់ស្តាប់ការពន្យល់របស់គ្រូ។'
  },
  {
    id: 'stu_4',
    studentId: 'STU-06A-04',
    name: 'ឆោម រស្មី',
    nameLatin: 'Chhom Reasmey',
    gender: 'Female',
    dob: '2014-11-05',
    guardianName: 'ឆោម ពិសិដ្ឋ',
    guardianPhone: '089 112 233',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 9.2,
    attitudeScore: 8.51,
    notes: 'សកម្មក្នុងការចូលរួមសកម្មភាពក្រុម និងឆ្លាតវៃ។'
  },
  {
    id: 'stu_5',
    studentId: 'STU-06A-05',
    name: 'ជី សុខជាតិ',
    nameLatin: 'Chey Sokcheat',
    gender: 'Male',
    dob: '2014-09-18',
    guardianName: 'ជី ប៊ុនធឿន',
    guardianPhone: '015 667 788',
    attendanceCount: { present: 94, absentExcused: 4, absentUnexcused: 1, late: 3 },
    behaviorScore: 4,
    conductRating: 'ល្អ',
    skillScore: 8.2,
    attitudeScore: 8.51,
    notes: 'មានភាពស្មោះត្រង់ ចូលចិត្តជួយមិត្តភក្តិ។'
  },
  {
    id: 'stu_6',
    studentId: 'STU-06A-06',
    name: 'ឈា សូលីសា',
    nameLatin: 'Chhea Solisa',
    gender: 'Female',
    dob: '2014-05-30',
    guardianName: 'ឈា គឹមហុង',
    guardianPhone: '092 445 566',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.9,
    attitudeScore: 8.51,
    notes: 'ស្អាតបាត មានសណ្តាប់ធ្នាប់ល្អជានិច្ច។'
  },
  {
    id: 'stu_7',
    studentId: 'STU-06A-07',
    name: 'ឈុម សារ៉ាយុទ្ធ',
    nameLatin: 'Chhum Sarayuth',
    gender: 'Male',
    dob: '2014-08-14',
    guardianName: 'ឈុម វិបុល',
    guardianPhone: '097 554 433',
    attendanceCount: { present: 99, absentExcused: 1, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.6,
    attitudeScore: 8.51,
    notes: 'ទៀងទាត់ពេលវេលា គោរពទង់ជាតិជាប់លាប់។'
  },
  {
    id: 'stu_8',
    studentId: 'STU-06A-08',
    name: 'នីម សំអាង',
    nameLatin: 'Nim Sam-ang',
    gender: 'Male',
    dob: '2014-01-28',
    guardianName: 'នីម សារិន',
    guardianPhone: '011 223 344',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 1, late: 2 },
    behaviorScore: 4,
    conductRating: 'ល្អ',
    skillScore: 8.4,
    attitudeScore: 8.51,
    notes: 'មានស្មារតីទទួលខុសត្រូវខ្ពស់។'
  },
  {
    id: 'stu_9',
    studentId: 'STU-06A-09',
    name: 'ពៅ យ៉ានីន',
    nameLatin: 'Pov Yanin',
    gender: 'Female',
    dob: '2014-12-10',
    guardianName: 'ពៅ សុវណ្ណារ៉ា',
    guardianPhone: '088 998 877',
    attendanceCount: { present: 98, absentExcused: 1, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.8,
    attitudeScore: 8.51,
    notes: 'អក្សរស្អាត ផ្ចិតផ្ចង់ និងមានគំនិតច្នៃប្រឌិត។'
  },
  {
    id: 'stu_10',
    studentId: 'STU-06A-10',
    name: 'ម៉េង មេត្តា',
    nameLatin: 'Meng Metta',
    gender: 'Female',
    dob: '2014-03-03',
    guardianName: 'ម៉េង ថន',
    guardianPhone: '016 778 899',
    attendanceCount: { present: 92, absentExcused: 4, absentUnexcused: 1, late: 2 },
    behaviorScore: 4,
    conductRating: 'ល្អ',
    skillScore: 8.1,
    attitudeScore: 8.51,
    notes: 'មានចិត្តសប្បុរស ជួយមិត្តភក្តិជុំវិញខ្លួន។'
  },
  {
    id: 'stu_11',
    studentId: 'STU-06A-11',
    name: 'មាស សុខហ៊ាន',
    nameLatin: 'Meas Sokhean',
    gender: 'Male',
    dob: '2014-06-25',
    guardianName: 'មាស វឌ្ឍនា',
    guardianPhone: '078 887 766',
    attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.5,
    attitudeScore: 8.51,
    notes: 'ក្លាហាន ចូលរួមឆ្លើយសំណួរក្នុងថ្នាក់។'
  },
  {
    id: 'stu_12',
    studentId: 'STU-06A-12',
    name: 'មួន សុចិន្ដា',
    nameLatin: 'Muon Sochinda',
    gender: 'Female',
    dob: '2014-10-17',
    guardianName: 'មួន សារឿន',
    guardianPhone: '093 332 211',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.7,
    attitudeScore: 8.51,
    notes: 'ស្លូតបូត សុភាព គោរពគ្រូនិងចាស់ទុំ។'
  },
  {
    id: 'stu_13',
    studentId: 'STU-06A-13',
    name: 'យាត ស៊ីយុទ្ធ',
    nameLatin: 'Yeat Siyuth',
    gender: 'Male',
    dob: '2014-04-09',
    guardianName: 'យាត សុខា',
    guardianPhone: '017 445 566',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.6,
    attitudeScore: 8.51,
    notes: 'មានភាពជាអ្នកដឹកនាំក្នុងក្រុម។'
  },
  {
    id: 'stu_14',
    studentId: 'STU-06A-14',
    name: 'យូ សុខនិតា',
    nameLatin: 'You Soknita',
    gender: 'Female',
    dob: '2014-08-01',
    guardianName: 'យូ ចាន់ថា',
    guardianPhone: '085 554 433',
    attendanceCount: { present: 98, absentExcused: 1, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.9,
    attitudeScore: 8.51,
    notes: 'ឆ្លាត យល់លឿន និងឧស្សាហ៍ធ្វើកិច្ចការផ្ទះ។'
  },
  {
    id: 'stu_15',
    studentId: 'STU-06A-15',
    name: 'រ៉ន ផាណេត',
    nameLatin: 'Rorn Phanet',
    gender: 'Male',
    dob: '2014-02-22',
    guardianName: 'រ៉ន សុភាព',
    guardianPhone: '096 665 544',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 0, late: 1 },
    behaviorScore: 4,
    conductRating: 'ល្អ',
    skillScore: 8.3,
    attitudeScore: 8.51,
    notes: 'ចូលចិត្តលេងកីឡា និងមានស្មារតីសាមគ្គី។'
  },
  {
    id: 'stu_16',
    studentId: 'STU-06A-16',
    name: 'រុំ ណារ៉ា',
    nameLatin: 'Rum Nara',
    gender: 'Male',
    dob: '2014-05-14',
    guardianName: 'រុំ ម៉េង',
    guardianPhone: '012 334 455',
    attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.6,
    attitudeScore: 8.51,
    notes: 'រៀនពូកែគណិតវិទ្យា និងគិតលេខបានលឿន។'
  },
  {
    id: 'stu_17',
    studentId: 'STU-06A-17',
    name: 'ស៊ន ស្រីលិស',
    nameLatin: 'Sorn Sreylis',
    gender: 'Female',
    dob: '2014-09-21',
    guardianName: 'ស៊ន ផល្លី',
    guardianPhone: '089 998 877',
    attendanceCount: { present: 98, absentExcused: 1, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 9.1,
    attitudeScore: 8.51,
    notes: 'ពូកែតែងសេចក្តី និងអានអត្ថបទច្បាស់ៗ។'
  },
  {
    id: 'stu_18',
    studentId: 'STU-06A-18',
    name: 'ស៊្រីន គឹមស្រួ',
    nameLatin: 'Srin Kimsruo',
    gender: 'Female',
    dob: '2014-01-11',
    guardianName: 'ស៊្រីន វុទ្ធី',
    guardianPhone: '077 112 233',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.7,
    attitudeScore: 8.51,
    notes: 'រួសរាយរាក់ទាក់ និងយកចិត្តទុកដាក់ក្នុងការរៀន។'
  },
  {
    id: 'stu_19',
    studentId: 'STU-06A-19',
    name: 'សី ផាន់នីត',
    nameLatin: 'Sey Phannit',
    gender: 'Male',
    dob: '2014-11-30',
    guardianName: 'សី ប៊ុនណា',
    guardianPhone: '098 445 566',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.8,
    attitudeScore: 8.51,
    notes: 'ស្ងប់ស្ងាត់ មានសមាធិល្អពេលរៀន។'
  },
  {
    id: 'stu_20',
    studentId: 'STU-06A-20',
    name: 'ស្រស់ ផាន់ណា',
    nameLatin: 'Sros Phanna',
    gender: 'Male',
    dob: '2014-07-08',
    guardianName: 'ស្រស់ គឹមឡេង',
    guardianPhone: '015 889 900',
    attendanceCount: { present: 94, absentExcused: 3, absentUnexcused: 1, late: 2 },
    behaviorScore: 4,
    conductRating: 'ល្អ',
    skillScore: 8.2,
    attitudeScore: 8.51,
    notes: 'សកម្មក្នុងម៉ោងសិក្សា និងគោរពវិន័យ។'
  },
  {
    id: 'stu_21',
    studentId: 'STU-06A-21',
    name: 'សំអូន ថៃរីន',
    nameLatin: 'Sam-oun Thairin',
    gender: 'Female',
    dob: '2014-03-10',
    guardianName: 'សំអូន វិចិត្រ',
    guardianPhone: '012 998 811',
    attendanceCount: { present: 99, absentExcused: 1, absentUnexcused: 0, late: 0 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 9.3,
    attitudeScore: 8.51,
    notes: 'ជាសិស្សគំរូប្រចាំថ្នាក់ មានការលះបង់ខ្ពស់។'
  },
  {
    id: 'stu_22',
    studentId: 'STU-06A-22',
    name: 'ហុង លីហូវ',
    nameLatin: 'Hong Lyhov',
    gender: 'Male',
    dob: '2014-08-19',
    guardianName: 'ហុង សារឿន',
    guardianPhone: '089 443 322',
    attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.8,
    attitudeScore: 8.51,
    notes: 'មានគំនិតដោះស្រាយបញ្ហាបានលឿន។'
  },
  {
    id: 'stu_23',
    studentId: 'STU-06A-23',
    name: 'ហេន សៀងហ៊ីម',
    nameLatin: 'Hen Sianghim',
    gender: 'Female',
    dob: '2014-11-22',
    guardianName: 'ហេន គង់',
    guardianPhone: '097 665 544',
    attendanceCount: { present: 97, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.9,
    attitudeScore: 8.51,
    notes: 'រៀបចំសម្ភារៈសិក្សាបានត្រឹមត្រូវនិងមានរបៀប។'
  },
  {
    id: 'stu_24',
    studentId: 'STU-06A-24',
    name: 'អ៊ូង សុខឃាង',
    nameLatin: 'Oung Sokkheang',
    gender: 'Male',
    dob: '2014-05-15',
    guardianName: 'អ៊ូង បូរី',
    guardianPhone: '070 887 766',
    attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.7,
    attitudeScore: 8.51,
    notes: 'មានទំនាក់ទំនងល្អជាមួយមិត្តភក្តិទាំងអស់។'
  },
  {
    id: 'stu_25',
    studentId: 'STU-06A-25',
    name: 'អាត ចាន់ត្រា',
    nameLatin: 'At Chantra',
    gender: 'Male',
    dob: '2014-09-08',
    guardianName: 'អាត សុខុម',
    guardianPhone: '011 445 566',
    attendanceCount: { present: 95, absentExcused: 3, absentUnexcused: 0, late: 1 },
    behaviorScore: 5,
    conductRating: 'ល្អ',
    skillScore: 8.6,
    attitudeScore: 8.51,
    notes: 'ចូលចិត្តស្វែងយល់ចំណេះដឹងថ្មីៗ និងគួរសម។'
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

