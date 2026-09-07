export type Gender = 'Male' | 'Female';

export type Language = 'en' | 'km';

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2026-001"
  name: string; // Primary name (Khmer)
  nameLatin?: string; // Optional English / Latin transcription
  gender: Gender;
  dob?: string; // Date of birth
  guardianName?: string;
  guardianPhone?: string;
  photoUrl?: string;
  attendanceCount: {
    present: number;
    absentExcused: number;
    absentUnexcused: number;
    late: number;
  };
  behaviorScore: number; // 1 to 5 stars or points
  conductRating: string; // 'ល្អប្រសើរ' | 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ'
  skillScore?: number; // 0 to 10 (បំណិនសម្បទា - 10%)
  attitudeScore?: number; // 0 to 10 (ចរិយាសម្បទា - 10%)
  notes?: string;
}

export interface SubjectSubComponent {
  id: string;
  nameEn: string;
  nameKm: string;
  maxScore: number; // usually 10
  weight?: number; // percentage or ratio
}

export interface Subject {
  id: string;
  nameEn: string;
  nameKm: string;
  code: string;
  maxScore: number; // usually 10
  coefficient?: number; // optional, defaults to 1
  color: string;
  subComponents?: SubjectSubComponent[];
}

export interface AssessmentWeightConfig {
  homework: number; // e.g. 20%
  quizzes: number; // e.g. 20%
  midterm: number; // e.g. 20%
  finalExam: number; // e.g. 40%
  behaviorBonus: number; // e.g. 5%
}

// MoEYS 3-Pillar Competency Yearly Evaluation Weights
export interface CompetencyPillarsWeight {
  knowledge: number; // 80% (វិជ្ជាសម្បទា)
  skill: number; // 10% (បំណិនសម្បទា)
  attitude: number; // 10% (ចរិយាសម្បទា)
}

export interface AssessmentPeriod {
  id: string;
  nameEn: string;
  nameKm: string;
  semester: 1 | 2;
  isExam: boolean; // true if semester exam
  lunarDateEn?: string;
  lunarDateKm?: string;
  solarDate?: string;
  deadlineWarning?: string;
}

export interface SubjectScore {
  homework?: number;
  quizzes?: number;
  midterm?: number;
  finalExam?: number;
  rawScore?: number; // Total / final score for that period (0-10)
  behaviorRating?: number; // 1-5
  teacherRemark?: string;
  
  // Specific MoEYS component scores
  // Khmer language 4 sub-skills:
  khmerReading?: number; // ការអាន (សមត្ថភាពអាន)
  khmerWriting?: number; // ការសរសេរ (សរសេរតាមអាន/តែងសេចក្តី)
  khmerDictation?: number; // សរសេរតាមអាន (deprecated/fallback)
  khmerComposition?: number; // តែងសេចក្តី (deprecated/fallback)
  khmerListening?: number; // ការស្តាប់
  khmerSpeaking?: number; // ការនិយាយ
  
  // Mathematics 5 sections:
  mathNumbers?: number; // ចំនួន និងលេខនព្វន្ត
  mathAlgebra?: number; // ពិជគណិត
  mathMeasurement?: number; // រង្វាស់រង្វល់
  mathGeometry?: number; // ធរណីមាត្រ
  mathStatistics?: number; // ស្ថិតិ និងទិន្នន័យ
  
  // Generic sub-components
  subcomponents?: Record<string, number>;
}

export interface PeriodScoreRecord {
  studentId: string;
  periodId: string;
  scores: Record<string, SubjectScore>; // subjectId -> SubjectScore
  skillScore?: number; // Period specific skill assessment
  attitudeScore?: number; // Period specific attitude assessment
}

export interface SchoolProfile {
  schoolName: string; // English / Latin, e.g. "Hun Neng Pratong Primary School"
  schoolNameKm: string; // Khmer, e.g. "សាលាបឋមសិក្សាហ៊ុនណេងប្រទង"
  province: string; // e.g. "ខេត្តកំពង់ចាម"
  district: string; // e.g. "ស្រុកព្រៃឈរ"
  commune: string; // e.g. "ឃុំព្រៃឈរ"
  village?: string; // e.g. "ភូមិប្រទង"
  schoolCode?: string; // e.g. "030704"
  principalName?: string;
  principalNameKm?: string;
  phone?: string;
  email?: string;
  logoUrl?: string; // Custom school logo (Base64 data URL or web link)
  moeysLogoUrl?: string; // Custom Ministry of Education / MoEYS logo (Base64 data URL or web link)
  academicYear?: string; // e.g. "២០២៥-២០២៦"
}

export interface ClassSection {
  id: string;
  name: string; // e.g. "Grade 6A - ថ្នាក់ទី៦(ក)"
  nameKm: string;
  gradeLevel: number; // 1 to 6
  academicYear: string; // "2026-2027"
  roomNumber?: string;
  teacherName: string;
  teacherNameKm: string;
  schoolName: string;
  schoolNameKm: string;
  province?: string;
  district?: string;
  commune?: string;
  logoUrl?: string;
  studentIds: string[];
}

export interface GradeScaleThreshold {
  grade: string;
  labelEn: string;
  labelKm: string;
  minPercentage: number;
  color: string;
}

export interface StudentYearlySummary {
  student: Student;
  // Semester 1
  term1Knowledge: number;
  term1Skill: number;
  term1Attitude: number;
  term1Average: number;
  term1Rank: number;
  
  // Semester 2
  term2Knowledge: number;
  term2Skill: number;
  term2Attitude: number;
  term2Average: number;
  term2Rank: number;
  
  // Final Yearly 3-Pillar Breakdown
  yearlyKnowledge: number; // វិជ្ជាសម្បទា (80%)
  yearlySkill: number; // បំណិនសម្បទា (10%)
  yearlyAttitude: number; // ចរិយាសម្បទា (10%)
  yearlyAverage: number; // មធ្យមភាគប្រចាំឆ្នាំ = (K * 0.80) + (S * 0.10) + (A * 0.10)
  yearlyRank: number;
  
  letterGrade: string;
  gradeLabelEn: string;
  gradeLabelKm: string;
  attendanceRate: number;
  passed: boolean;
  honorDistinction?: 'Honor Roll' | 'High Honors' | 'Highest Honors' | 'None';
  honorDistinctionKm?: string;
}

// School Calendar Types
export type CalendarEventType = 'exam' | 'holiday' | 'academic' | 'meeting' | 'activity' | 'curriculum';

export interface CalendarEvent {
  id: string;
  titleKm: string;
  titleEn: string;
  date: string; // ISO format "YYYY-MM-DD"
  endDate?: string; // Optional for multi-day events
  time?: string; // e.g. "07:30 - 11:00"
  type: CalendarEventType;
  descriptionKm?: string;
  descriptionEn?: string;
  color?: string;
  isMoEYSOfficial?: boolean;
  classId?: string; // Optional: all classes or specific class
  lunarDateKm?: string;
  isCompleted?: boolean;
}

// Weekly Timetable / Teaching Schedule Types
export interface TimetableSlot {
  id: string;
  classId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6; // 1 = Monday (ច័ន្ទ) to 6 = Saturday (សៅរ៍)
  periodNumber: number; // 1, 2, 3, 4, 5
  shift: 'morning' | 'afternoon';
  startTime: string; // e.g. "07:00"
  endTime: string; // e.g. "07:45"
  subjectId: string;
  teacherName?: string;
  teacherNameKm?: string;
  room?: string;
  notes?: string;
}

// Curriculum (កម្មវិធីសិក្សា) Types
export interface CurriculumLesson {
  id: string;
  weekNumber: number; // 1 to 36
  subjectId: string;
  lessonNumber?: number;
  chapterKm?: string;
  chapterEn?: string;
  lessonTitleKm: string;
  lessonTitleEn: string;
  objectivesKm?: string;
  objectivesEn?: string;
  hoursCount: number; // e.g. 2 hours
  semester: 1 | 2;
  status: 'upcoming' | 'in_progress' | 'completed';
  startDate?: string;
  endDate?: string;
}

export interface CurriculumProgram {
  id: string;
  gradeLevel: number; // 1 to 6
  academicYear: string;
  titleKm: string;
  titleEn: string;
  subjectId: string;
  lessons: CurriculumLesson[];
}

// Attendance Types
export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface DailyAttendanceRecord {
  id: string; // `${date}_${studentId}`
  classId: string;
  studentId: string;
  date: string; // ISO format "YYYY-MM-DD"
  status: AttendanceStatus;
  note?: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  presentDays: number;
  excusedDays: number; // ច (ច្បាប់)
  unexcusedDays: number; // អច (អត់ច្បាប់)
  lateDays: number;
  totalSchoolDays: number;
  attendanceRate: number; // percentage 0-100
}

// Classroom Tools Types
export interface ClassroomGroup {
  id: string;
  nameKm: string;
  nameEn: string;
  color: string;
  studentIds: string[];
}

// 1. Interactive Classroom Seating Chart Types
export interface DeskPosition {
  deskId: string;
  row: number; // 0-based
  col: number; // 0-based
  studentId: string | null; // null if empty desk
}

export interface ClassroomSeatingLayout {
  classId: string;
  rows: number; // default e.g. 4-6
  columns: number; // default e.g. 6 (or paired 3 pairs)
  arrangement: 'pairs' | 'grid' | 'u_shape' | 'groups';
  desks: DeskPosition[];
  updatedAt: string;
}

// 3. Quick Daily Homework Submission Tracker Types
export type HomeworkStatus = 'completed' | 'partial' | 'missing' | 'excused';

export interface StudentHomeworkSubmission {
  status: HomeworkStatus;
  score?: number; // 0-10
  note?: string;
  submittedAt?: string;
}

export interface HomeworkAssignment {
  id: string;
  classId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  titleKm: string;
  titleEn?: string;
  description?: string;
  maxPoints: number; // e.g. 10
  submissions: Record<string, StudentHomeworkSubmission>; // studentId -> StudentHomeworkSubmission
  createdAt: string;
}

// 4. Yearly Academic Archive & Complete Backup Types
export interface YearlyAcademicArchive {
  id: string;
  academicYear: string; // e.g. "2025-2026", "2026-2027"
  archivedAt: string;
  schoolName: string;
  classesCount: number;
  studentsCount: number;
  recordsCount: number;
  data: {
    schoolProfile?: SchoolProfile;
    classes: ClassSection[];
    students: Student[];
    scoresMatrix: Record<string, Record<string, Record<string, any>>>;
    attendanceRecords: DailyAttendanceRecord[];
    homeworkAssignments?: HomeworkAssignment[];
    seatingLayouts?: ClassroomSeatingLayout[];
    calendarEvents?: CalendarEvent[];
    timetableSlots?: TimetableSlot[];
    curriculumPrograms?: CurriculumProgram[];
    weights: AssessmentWeightConfig;
    competencyWeights: CompetencyPillarsWeight;
    gradeScales: GradeScaleThreshold[];
    subjects: Subject[];
    periods: AssessmentPeriod[];
  };
}

// 5. Reading Speed & Mental Math Fluency Exam Types
export interface ReadingPassage {
  id: string;
  title: string;
  gradeLevel: number; // 1 to 6
  category?: string; // e.g. រឿងខ្លី, វិទ្យាសាស្ត្រ, សីលធម៌, etc.
  content: string; // The passage text
  targetWords?: number; // Calculated or pre-set word count
  targetWpm?: number; // Target words per minute for this grade level
  description?: string;
  isCustom?: boolean;
}

export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'mixed';

export interface SpeedMathConfig {
  operation: MathOperation;
  digits: 1 | 2 | 3 | 4;
  customMaxNumber?: number; // e.g. up to 20 for grade 1 & 2
  timeLimitSeconds: number; // e.g. 60
}

// Khmer Reading Diagnostic Error Types (4 standard MoEYS reading error types)
export type KhmerReadingErrorType = 
  | 'misread'      // អានខុស
  | 'omission'     // អានរំលង
  | 'repetition'   // អានស្ទួន
  | 'addition';    // អានលើស

export interface ReadingErrorBreakdown {
  misread: number;     // អានខុស
  omission: number;    // អានរំលង
  repetition: number;  // អានស្ទួន
  addition: number;    // អានលើស
}

export interface MarkedWordError {
  wordIndex: number;
  word: string;
  errorType: KhmerReadingErrorType;
  note?: string;
}

export interface FluencyTestRecord {
  id: string;
  studentId: string;
  classId: string;
  periodId: string;
  testType: 'reading' | 'math';
  timestamp: string;
  durationSeconds: number;
  
  // Reading specific
  passageId?: string;
  passageTitle?: string;
  totalWordsAttempted?: number;
  errorCount?: number;
  correctCount?: number;
  wordsPerMinute?: number;
  accuracyPercentage: number;
  errorBreakdown?: ReadingErrorBreakdown;
  markedErrors?: MarkedWordError[];
  diagnosedWeakness?: string;
  predictedMoEYSLevel?: 'advanced' | 'proficient' | 'basic' | 'below_basic';
  remedialAdvice?: string;
  
  // Math specific
  operation?: MathOperation;
  digits?: number;
  mathMistakes?: { question: string; studentAnswer?: string; correctAnswer: string }[];
  
  calculatedScore10: number; // 0 to 10
  syncedToGradebook: boolean;
  targetSubjectId: string; // 'sub_khmer' | 'sub_math'
  targetComponent: string; // 'khmerReading' | 'mathNumbers' | 'quizzes' | 'rawScore'
  notes?: string;
}

// Assessment Template Library Types
export type AssessmentTemplateType = 
  | 'quiz' 
  | 'dictation' 
  | 'test' 
  | 'homework' 
  | 'practice' 
  | 'oral' 
  | 'lab' 
  | 'exam';

export type AssessmentTargetField = 
  | 'rawScore' 
  | 'khmerReading' 
  | 'khmerWriting' 
  | 'khmerListening' 
  | 'khmerSpeaking' 
  | 'mathNumbers' 
  | 'mathAlgebra' 
  | 'mathMeasurement' 
  | 'mathGeometry' 
  | 'mathStatistics' 
  | 'homework' 
  | 'quizzes' 
  | 'midterm'
  | 'finalExam';

export interface AssessmentTemplate {
  id: string;
  name: string; // English / Latin title, e.g. "Weekly Math Quiz"
  nameKm: string; // Khmer title, e.g. "តេស្តគណិតវិទ្យាប្រចាំសប្តាហ៍"
  description?: string;
  descriptionKm?: string;
  subjectId: string; // 'sub_math', 'sub_khmer', 'sub_science', 'sub_social', etc., or 'all'
  type: AssessmentTemplateType;
  targetField: AssessmentTargetField;
  targetFieldLabelKm?: string;
  targetFieldLabelEn?: string;
  maxScore: number; // default 10
  defaultScore: number; // e.g. 8.0 for quick default
  passingScore?: number; // e.g. 5.0
  quickScorePills: number[]; // e.g. [5, 6, 7, 8, 8.5, 9, 10]
  presetRemarks: string[]; // Reusable feedback comments
  criteria?: string[]; // Grading criteria / rubric bullets
  isSystemDefault?: boolean; // built-in MoEYS template
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// Exam Question Bank & Exam Paper Builder Types
// ==========================================

export type ExamQuestionType = 
  | 'multiple_choice'    // ពហុជ្រើសរើស (ក, ខ, គ, ឃ)
  | 'problem_solving'    // ចំណោទ / លំហាត់គណិតវិទ្យា
  | 'fill_in_blank'      // បំពេញចន្លោះ
  | 'true_false'        // ត្រូវ ឬ ខុស
  | 'matching'          // ផ្គូផ្គង
  | 'short_answer'      // សំណួរឆ្លើយខ្លី / ត្រិះរិះ
  | 'dictation_writing'; // សរសេរតាមអាន / តែងសេចក្តី

export type ExamCategory = 
  | 'monthly'       // ប្រឡងប្រចាំខែ
  | 'semester'      // ប្រឡងប្រចាំឆមាស
  | 'weekly_quiz'   // តេស្តខ្លីប្រចាំសប្តាហ៍
  | 'practice';     // លំហាត់ហ្វឹកហាត់

export type ExamDifficulty = 'easy' | 'medium' | 'hard'; // ងាយ, មធ្យម, លំបាក

export interface ExamQuestion {
  id: string;
  grade: number; // 1 to 6
  subjectId: string; // 'sub_khmer', 'sub_math', 'sub_science', 'sub_social', 'sub_english', 'sub_arts_pe', etc.
  examCategory: ExamCategory;
  periodId?: string; // e.g. 'p_oct', 'p_nov', 'sem_1', 'sem_2', or 'all'
  chapterOrTopic: string; // e.g. "មេរៀនទី៣៖ ការបូកនិងដក" or "វេយ្យាករណ៍ខ្មែរ"
  difficulty: ExamDifficulty;
  questionType: ExamQuestionType;
  title?: string;
  prompt: string; // តួសំណួរ ឬខ្លឹមសារលំហាត់
  options?: string[]; // ជម្រើស ក, ខ, គ, ឃ សម្រាប់ពហុជ្រើសរើស
  correctAnswer: string; // ចម្លើយត្រឹមត្រូវ / គន្លឹះចម្លើយ
  explanation?: string; // វិធីដោះស្រាយ ឬការពន្យល់លម្អិត
  points: number; // ពិន្ទុដើម (Default Points)
  rubricGuide?: string; // បំណែងចែកពិន្ទុ ឬលក្ខណៈវិនិច្ឆ័យ
  tags?: string[];
  isSystemDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ExamPaperItem {
  questionId: string;
  customPoints?: number;
  order: number;
  questionSnapshot: ExamQuestion;
}

export interface ExamPaper {
  id: string;
  title: string; // e.g. "វិញ្ញាសាប្រឡងគណិតវិទ្យា ប្រចាំខែវិច្ឆិកា ថ្នាក់ទី៤"
  titleEn?: string;
  code: string; // e.g. "EXAM-G4-MATH-M11"
  grade: number; // 1 to 6
  subjectId: string;
  examCategory: ExamCategory;
  periodId: string; // e.g. 'p_nov'
  durationMinutes: number; // e.g. 45, 60, 90 minutes
  totalMaxScore: number; // e.g. 10, 20, 50, 100 points
  schoolName?: string;
  academicYear?: string;
  provinceDistrict?: string;
  instructions?: string;
  items: ExamPaperItem[];
  createdAt: string;
  updatedAt?: string;
}


