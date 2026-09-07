import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ClassSection, 
  Student, 
  Subject, 
  AssessmentPeriod, 
  AssessmentWeightConfig, 
  GradeScaleThreshold,
  CompetencyPillarsWeight,
  Language,
  CalendarEvent,
  TimetableSlot,
  CurriculumProgram,
  CurriculumLesson,
  DailyAttendanceRecord,
  AttendanceStatus,
  StudentAttendanceSummary,
  SchoolProfile,
  ReadingPassage,
  FluencyTestRecord
} from '../types';
import { 
  DEFAULT_SUBJECTS, 
  DEFAULT_PERIODS, 
  DEFAULT_WEIGHT_CONFIG, 
  DEFAULT_GRADE_SCALES, 
  DEFAULT_COMPETENCY_WEIGHTS,
  INITIAL_CLASSES, 
  INITIAL_STUDENTS, 
  DEFAULT_SCHOOL_PROFILE,
  generateInitialScores,
  generateInitialAttendanceRecords
} from '../data/initialData';
import { INITIAL_READING_PASSAGES } from '../data/initialReadingPassages';
import {
  DEFAULT_CALENDAR_EVENTS,
  INITIAL_TIMETABLE_SLOTS,
  DEFAULT_CURRICULUM_PROGRAMS,
  generateDefaultTimetable
} from '../data/calendarScheduleData';
import { formatConductRating } from '../utils/calculations';
import { 
  getSavedSyncKey, 
  saveSyncKey, 
  pushDataToCloud, 
  pullDataFromCloud, 
  isAutoSyncEnabled, 
  setAutoSyncEnabled as saveAutoSyncEnabled, 
  SyncStatusInfo, 
  SyncPayload 
} from '../utils/cloudSync';

export type NavTab = 
  | 'school_hub' 
  | 'dashboard' 
  | 'attendance'
  | 'classroom_tools'
  | 'seating'
  | 'homework'
  | 'roster' 
  | 'scoring' 
  | 'exam_bank'
  | 'fluency_exam'
  | 'rankings' 
  | 'analytics' 
  | 'report_card' 
  | 'calendar' 
  | 'schedule' 
  | 'curriculum' 
  | 'backup_restore'
  | 'settings'
  | 'mini_games';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface GradebookContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  classes: ClassSection[];
  activeClassId: string;
  setActiveClassId: (id: string) => void;
  activeClass: ClassSection | undefined;
  activePeriodId: string;
  setActivePeriodId: (id: string) => void;
  students: Student[];
  classStudents: Student[];
  subjects: Subject[];
  periods: AssessmentPeriod[];
  scoresMatrix: Record<string, Record<string, Record<string, any>>>;
  weights: AssessmentWeightConfig;
  competencyWeights: CompetencyPillarsWeight;
  gradeScales: GradeScaleThreshold[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Calendar State & Actions
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void;
  updateCalendarEvent: (id: string, updated: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleEventCompleted: (id: string) => void;
  importCalendarEvents: (events: CalendarEvent[]) => void;

  // Timetable State & Actions
  timetableSlots: TimetableSlot[];
  updateTimetableSlot: (slotId: string, updated: Partial<TimetableSlot>) => void;
  setTimetableSlots: (slots: TimetableSlot[]) => void;
  resetClassTimetable: (classId: string) => void;
  saveTimetableBatch: (slots: TimetableSlot[]) => void;

  // Curriculum State & Actions
  curriculumPrograms: CurriculumProgram[];
  updateCurriculumLesson: (programId: string, lessonId: string, updated: Partial<CurriculumLesson>) => void;
  importCurriculumProgram: (program: CurriculumProgram) => void;
  syncCurriculumToCalendar: (programId: string) => void;

  // Attendance State & Actions
  attendanceRecords: DailyAttendanceRecord[];
  markAttendance: (studentId: string, date: string, status: AttendanceStatus, note?: string) => void;
  batchMarkAttendance: (date: string, records: { studentId: string; status: AttendanceStatus; note?: string }[]) => void;
  markAllPresent: (date: string, classId?: string) => void;
  getStudentMonthlyAttendance: (studentId: string, yearMonth?: string) => StudentAttendanceSummary;
  getStudentYearlyAttendance: (studentId: string) => StudentAttendanceSummary;
  
  // School Profile State & Actions
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  resetSchoolLogo: () => void;
  resetMoEYSLogo: () => void;
  duplicateClass: (classId: string, newNameKm: string, newNameEn: string, copyStudents: boolean) => void;
  
  // Actions
  addClass: (newClass: Omit<ClassSection, 'id' | 'studentIds'> | ClassSection) => void;
  createClass: (newClass: Omit<ClassSection, 'id' | 'studentIds'> | ClassSection) => void;
  updateClass: (id: string, updated: Partial<ClassSection>) => void;
  deleteClass: (id: string) => void;
  
  addStudent: (student: Omit<Student, 'id'> | Student, classId?: string) => void;
  addStudentsBatch: (newStudents: (Omit<Student, 'id'> | Student)[], classId?: string, replaceExisting?: boolean) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteStudents: (ids: string[]) => void;
  
  updateSubjectScore: (
    studentId: string, 
    periodId: string, 
    subjectId: string, 
    scoreData: Partial<{
      homework: number;
      quizzes: number;
      midterm: number;
      finalExam: number;
      rawScore: number;
      behaviorRating: number;
      teacherRemark: string;
      khmerReading: number;
      khmerWriting: number;
      khmerDictation: number;
      khmerComposition: number;
      khmerListening: number;
      khmerSpeaking: number;
      mathNumbers: number;
      mathAlgebra: number;
      mathMeasurement: number;
      mathGeometry: number;
      mathStatistics: number;
    }>
  ) => void;
  
  bulkUpdatePeriodScores: (
    periodId: string,
    subjectId: string,
    updates: Record<string, number> // studentId -> rawScore
  ) => void;
  
  updateWeights: (newWeights: AssessmentWeightConfig) => void;
  updateCompetencyWeights: (weights: CompetencyPillarsWeight) => void;
  updateGradeScales: (scales: GradeScaleThreshold[]) => void;
  updateSubjects: (newSubjects: Subject[]) => void;
  updatePeriods: (newPeriods: AssessmentPeriod[]) => void;
  
  resetToDefaults: () => void;
  importFullData: (data: any) => boolean;
  restoreScoresMatrix: (matrix: Record<string, Record<string, Record<string, any>>>) => void;
  
  // Reading Speed & Mental Math Fluency Exam
  readingPassages: ReadingPassage[];
  addReadingPassage: (passage: Omit<ReadingPassage, 'id'> | ReadingPassage) => void;
  updateReadingPassage: (id: string, updated: Partial<ReadingPassage>) => void;
  deleteReadingPassage: (id: string) => void;
  fluencyRecords: FluencyTestRecord[];
  saveFluencyRecord: (record: FluencyTestRecord) => void;
  deleteFluencyRecord: (id: string) => void;

  // Cloud Synchronization (Multi-Device)
  syncKey: string;
  setSyncKey: (key: string) => void;
  syncStatus: SyncStatusInfo;
  syncNow: () => Promise<void>;
  pullFromCloudNow: () => Promise<void>;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;

  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const GradebookContext = createContext<GradebookContextType | undefined>(undefined);

export const LS_PREFIX = 'primary_gradebook_v2_';

export const GradebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}theme`) as 'light' | 'dark';
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem(`${LS_PREFIX}theme`, newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const [language, setLanguageState] = useState<Language>('km');

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const [schoolProfile, setSchoolProfileState] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}school_profile`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SCHOOL_PROFILE;
  });

  const [classes, setClasses] = useState<ClassSection[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}classes`);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_CLASSES;
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}active_class`);
    if (saved) return saved;
    return INITIAL_CLASSES[0]?.id || 'class_6a';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}students`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((s: Student) => ({
            ...s,
            attendanceCount: s.attendanceCount || { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
            conductRating: formatConductRating(s.conductRating, 'km'),
          }));
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_STUDENTS.map(s => ({
      ...s,
      attendanceCount: s.attendanceCount || { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
      conductRating: formatConductRating(s.conductRating, 'km'),
    }));
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}subjects`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SUBJECTS;
  });

  const [periods, setPeriods] = useState<AssessmentPeriod[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}periods`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_PERIODS;
  });

  const [activePeriodId, setActivePeriodId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}active_period`);
    if (saved) return saved;
    return 'p_feb';
  });

  const [scoresMatrix, setScoresMatrix] = useState<Record<string, Record<string, Record<string, any>>>>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}scores`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateInitialScores();
  });

  const [weights, setWeights] = useState<AssessmentWeightConfig>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}weights`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_WEIGHT_CONFIG;
  });

  const [gradeScales, setGradeScales] = useState<GradeScaleThreshold[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}grade_scales`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If cached grade scales have old threshold where E < 50 or D <= 50, migrate to MoEYS standard
          const eScale = parsed.find((s: GradeScaleThreshold) => s.grade === 'E');
          const dScale = parsed.find((s: GradeScaleThreshold) => s.grade === 'D');
          if ((eScale && eScale.minPercentage < 50) || (dScale && dScale.minPercentage <= 50)) {
            localStorage.setItem(`${LS_PREFIX}grade_scales`, JSON.stringify(DEFAULT_GRADE_SCALES));
            return DEFAULT_GRADE_SCALES;
          }
          return parsed.map((s: GradeScaleThreshold) => ({
            ...s,
            labelKm: s.grade,
            labelEn: s.grade,
          }));
        }
      } catch (e) { console.error(e); }
    }
    return DEFAULT_GRADE_SCALES;
  });

  const [competencyWeights, setCompetencyWeights] = useState<CompetencyPillarsWeight>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}competency_weights`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_COMPETENCY_WEIGHTS;
  });

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}calendar_events`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_CALENDAR_EVENTS;
  });

  // Timetable Slots State
  const [timetableSlots, setTimetableSlotsState] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}timetable_slots`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TIMETABLE_SLOTS;
  });

  // Curriculum Programs State
  const [curriculumPrograms, setCurriculumPrograms] = useState<CurriculumProgram[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}curriculum_programs`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_CURRICULUM_PROGRAMS;
  });

  // Daily Attendance Records State
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}attendance_records`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateInitialAttendanceRecords();
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('stu_1');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent storage synchronizers
  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}lang`, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}classes`, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}active_class`, activeClassId);
  }, [activeClassId]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}active_period`, activePeriodId);
  }, [activePeriodId]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}subjects`, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}periods`, JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}scores`, JSON.stringify(scoresMatrix));
  }, [scoresMatrix]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}weights`, JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}grade_scales`, JSON.stringify(gradeScales));
  }, [gradeScales]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}competency_weights`, JSON.stringify(competencyWeights));
  }, [competencyWeights]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}calendar_events`, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}timetable_slots`, JSON.stringify(timetableSlots));
  }, [timetableSlots]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}curriculum_programs`, JSON.stringify(curriculumPrograms));
  }, [curriculumPrograms]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}attendance_records`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}school_profile`, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  const setLanguage = (_lang: Language) => {
    setLanguageState('km');
    localStorage.setItem(`${LS_PREFIX}lang`, 'km');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];

  const classStudents = students.filter(s => 
    Boolean(activeClass?.studentIds && activeClass.studentIds.includes(s.id))
  );

  // Class CRUD
  const addClass = (newClassData: Omit<ClassSection, 'id' | 'studentIds'> | ClassSection) => {
    const id = 'id' in newClassData && newClassData.id ? newClassData.id : `class_${Date.now()}`;
    const studentIds = 'studentIds' in newClassData && Array.isArray(newClassData.studentIds) ? newClassData.studentIds : [];
    const newClass: ClassSection = {
      schoolName: schoolProfile.schoolName,
      schoolNameKm: schoolProfile.schoolNameKm,
      district: schoolProfile.district,
      commune: schoolProfile.commune,
      province: schoolProfile.province,
      logoUrl: schoolProfile.logoUrl,
      ...newClassData,
      id,
      studentIds,
    };
    setClasses(prev => [...prev, newClass]);
    setActiveClassId(id);
    showToast(language === 'km' ? 'បានបន្ថែមថ្នាក់រៀនថ្មីជោគជ័យ' : 'New class created successfully');
  };

  const createClass = addClass;

  const updateClass = (id: string, updated: Partial<ClassSection>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    showToast(language === 'km' ? 'បានកែប្រែព័ត៌មានថ្នាក់' : 'Class updated');
  };

  const deleteClass = (id: string) => {
    if (classes.length <= 1) {
      showToast(language === 'km' ? 'មិនអាចលុបថ្នាក់ចុងក្រោយបានទេ' : 'Cannot delete the only class', 'warning');
      return;
    }
    setClasses(prev => prev.filter(c => c.id !== id));
    if (activeClassId === id) {
      const remaining = classes.filter(c => c.id !== id);
      setActiveClassId(remaining[0]?.id || '');
    }
    showToast(language === 'km' ? 'បានលុបថ្នាក់រៀន' : 'Class deleted', 'info');
  };

  // School Profile Actions
  const updateSchoolProfile = (updated: Partial<SchoolProfile>) => {
    setSchoolProfileState(prev => {
      const next = { ...prev, ...updated };
      localStorage.setItem(`${LS_PREFIX}school_profile`, JSON.stringify(next));

      // Propagate updated school information to all classes
      setClasses(prevClasses => prevClasses.map(cls => ({
        ...cls,
        schoolName: next.schoolName || cls.schoolName,
        schoolNameKm: next.schoolNameKm || cls.schoolNameKm,
        district: next.district !== undefined ? next.district : cls.district,
        commune: next.commune !== undefined ? next.commune : cls.commune,
        province: next.province !== undefined ? next.province : cls.province,
        logoUrl: next.logoUrl !== undefined ? next.logoUrl : cls.logoUrl,
      })));

      return next;
    });
    showToast(language === 'km' ? 'បានរក្សាទុកព័ត៌មានសាលារៀនជោគជ័យ' : 'School profile updated successfully');
  };

  const resetSchoolLogo = () => {
    updateSchoolProfile({ logoUrl: '' });
    showToast(language === 'km' ? 'បានកំណត់ឡូហ្គូទៅសញ្ញាសម្គាល់ក្រសួងដើម' : 'Reset to default MoEYS emblem', 'info');
  };

  const resetMoEYSLogo = () => {
    updateSchoolProfile({ moeysLogoUrl: '' });
    showToast(language === 'km' ? 'បានកំណត់ឡូហ្គូក្រសួងទៅសញ្ញាសម្គាល់ផ្លូវការដើម' : 'Reset to official MoEYS emblem', 'info');
  };

  // ==========================================
  // Reading Speed & Mental Math Fluency Exam
  // ==========================================
  const [readingPassages, setReadingPassages] = useState<ReadingPassage[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}reading_passages`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_READING_PASSAGES;
  });

  const [fluencyRecords, setFluencyRecords] = useState<FluencyTestRecord[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}fluency_records`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [];
  });

  const addReadingPassage = (newPass: Omit<ReadingPassage, 'id'> | ReadingPassage) => {
    const id = ('id' in newPass && newPass.id) ? newPass.id : `pass_${Date.now()}`;
    const fullPass: ReadingPassage = { ...newPass, id, isCustom: true };
    setReadingPassages(prev => {
      const next = [fullPass, ...prev];
      localStorage.setItem(`${LS_PREFIX}reading_passages`, JSON.stringify(next));
      return next;
    });
    showToast(language === 'km' ? 'បានបន្ថែមអត្ថបទអំណានថ្មីជោគជ័យ' : 'Added reading passage successfully', 'success');
  };

  const updateReadingPassage = (id: string, updated: Partial<ReadingPassage>) => {
    setReadingPassages(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updated } : p);
      localStorage.setItem(`${LS_PREFIX}reading_passages`, JSON.stringify(next));
      return next;
    });
    showToast(language === 'km' ? 'បានកែសម្រួលអត្ថបទអំណានជោគជ័យ' : 'Updated reading passage successfully', 'success');
  };

  const deleteReadingPassage = (id: string) => {
    setReadingPassages(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(`${LS_PREFIX}reading_passages`, JSON.stringify(next));
      return next;
    });
    showToast(language === 'km' ? 'បានលុបអត្ថបទអំណាន' : 'Deleted reading passage', 'info');
  };

  const saveFluencyRecord = (record: FluencyTestRecord) => {
    setFluencyRecords(prev => {
      const filtered = prev.filter(r => r.id !== record.id);
      const next = [record, ...filtered];
      localStorage.setItem(`${LS_PREFIX}fluency_records`, JSON.stringify(next));
      return next;
    });
  };

  const deleteFluencyRecord = (id: string) => {
    setFluencyRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem(`${LS_PREFIX}fluency_records`, JSON.stringify(next));
      return next;
    });
    showToast(language === 'km' ? 'បានលុបកំណត់ត្រាតេស្ត' : 'Deleted test record', 'info');
  };

  const duplicateClass = (classId: string, newNameKm: string, newNameEn: string, copyStudents: boolean) => {
    const target = classes.find(c => c.id === classId);
    if (!target) return;
    const newId = `class_${Date.now()}`;
    const newStudentIds: string[] = [];

    if (copyStudents) {
      const clonedStudents: Student[] = [];
      target.studentIds.forEach((sId, index) => {
        const originalStudent = students.find(s => s.id === sId);
        if (originalStudent) {
          const freshStudentId = `stu_${Date.now()}_${index}`;
          clonedStudents.push({
            ...originalStudent,
            id: freshStudentId,
            studentId: `STU-${target.gradeLevel}${newNameEn.slice(-1) || 'B'}-${(index + 1).toString().padStart(2, '0')}`,
            attendanceCount: { present: 0, absentExcused: 0, absentUnexcused: 0, late: 0 },
          });
          newStudentIds.push(freshStudentId);
        }
      });
      if (clonedStudents.length > 0) {
        setStudents(prev => [...prev, ...clonedStudents]);
      }
    }

    const newClass: ClassSection = {
      ...target,
      id: newId,
      name: newNameEn,
      nameKm: newNameKm,
      studentIds: newStudentIds,
    };

    setClasses(prev => [...prev, newClass]);
    setActiveClassId(newId);
    showToast(language === 'km' ? `បានចម្លង និងបង្កើតថ្នាក់ ${newNameKm} ដោយជោគជ័យ` : `Class ${newNameEn} duplicated successfully`);
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id'> | Student, targetClassId?: string) => {
    const newId = 'id' in studentData && studentData.id ? studentData.id : `stu_${Date.now()}_${Math.random().toString().slice(2, 5)}`;
    const newStudent: Student = {
      attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
      behaviorScore: 5,
      conductRating: 'ល្អ',
      ...studentData,
      id: newId,
    };
    setStudents(prev => [...prev, newStudent]);

    const cId = targetClassId || activeClassId;
    setClasses(prev => prev.map(c => {
      const studentIds = c.studentIds || [];
      if (c.id === cId && !studentIds.includes(newId)) {
        return { ...c, studentIds: [...studentIds, newId] };
      }
      return c;
    }));

    showToast(language === 'km' ? `បានបញ្ចូលសិស្ស ${studentData.name}` : `Student ${studentData.name} added`);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast(language === 'km' ? 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានសិស្ស' : 'Student details updated');
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setClasses(prev => prev.map(c => ({
      ...c,
      studentIds: (c.studentIds || []).filter(sId => sId !== id)
    })));
    showToast(language === 'km' ? 'បានលុបសិស្សចេញពីបញ្ជី' : 'Student removed from roster', 'info');
  };

  const deleteStudents = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setStudents(prev => prev.filter(s => !idSet.has(s.id)));
    setClasses(prev => prev.map(c => ({
      ...c,
      studentIds: (c.studentIds || []).filter(sId => !idSet.has(sId))
    })));
    showToast(
      language === 'km' 
        ? `បានលុបសិស្សចំនួន ${ids.length} នាក់ចេញពីបញ្ជី` 
        : `Removed ${ids.length} students from roster`,
      'info'
    );
  };

  const addStudentsBatch = (
    newStudents: (Omit<Student, 'id'> | Student)[], 
    classId?: string, 
    replaceExisting: boolean = false
  ) => {
    if (!newStudents || newStudents.length === 0) return;
    const targetClassId = classId || activeClassId;
    const formattedStudents: Student[] = newStudents.map((s, idx) => ({
      attendanceCount: s.attendanceCount || { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
      behaviorScore: s.behaviorScore ?? 5,
      conductRating: s.conductRating || 'ល្អ',
      ...s,
      id: 'id' in s && s.id ? s.id : `stu_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`
    }));

    const newIds = formattedStudents.map(s => s.id);

    setStudents(prev => {
      if (replaceExisting) {
        // Find students belonging to other classes so we don't accidentally wipe them
        const otherClasses = classes.filter(c => c.id !== targetClassId);
        const otherStudentIds = new Set(otherClasses.flatMap(c => c.studentIds || []));
        const retainedStudents = prev.filter(s => otherStudentIds.has(s.id));
        return [...retainedStudents, ...formattedStudents];
      } else {
        return [...prev, ...formattedStudents];
      }
    });

    setClasses(prev => prev.map(c => {
      if (c.id === targetClassId) {
        return {
          ...c,
          studentIds: replaceExisting ? newIds : [...(c.studentIds || []), ...newIds]
        };
      }
      return c;
    }));

    showToast(
      language === 'km'
        ? (replaceExisting 
            ? `បានជំនួសបញ្ជីសិស្សថ្មីចំនួន ${formattedStudents.length} នាក់ជោគជ័យ` 
            : `បានបន្ថែមសិស្សចំនួន ${formattedStudents.length} នាក់ជោគជ័យ`)
        : `Successfully imported ${formattedStudents.length} students`,
      'success'
    );
  };

  // Scoring updates
  const updateSubjectScore = (
    studentId: string, 
    periodId: string, 
    subjectId: string, 
    scoreData: Partial<{
      homework: number;
      quizzes: number;
      midterm: number;
      finalExam: number;
      rawScore: number;
      behaviorRating: number;
      teacherRemark: string;
      khmerReading: number;
      khmerWriting: number;
      khmerDictation: number;
      khmerComposition: number;
      khmerListening: number;
      khmerSpeaking: number;
      mathNumbers: number;
      mathAlgebra: number;
      mathMeasurement: number;
      mathGeometry: number;
      mathStatistics: number;
    }>
  ) => {
    setScoresMatrix(prev => {
      const studentPeriodScores = prev[studentId]?.[periodId] || {};
      const currentSubjectScore = studentPeriodScores[subjectId] || {};
      
      const newSubjectScore = {
        ...currentSubjectScore,
        ...scoreData,
      };

      // 1. If Khmer 4 sub-skills updated (អាន, សរសេរ, ស្ដាប់, និយាយ)
      if (
        scoreData.khmerReading !== undefined ||
        scoreData.khmerWriting !== undefined ||
        scoreData.khmerDictation !== undefined ||
        scoreData.khmerComposition !== undefined ||
        scoreData.khmerListening !== undefined ||
        scoreData.khmerSpeaking !== undefined
      ) {
        const r = newSubjectScore.khmerReading ?? 0;
        const w = newSubjectScore.khmerWriting ?? ((newSubjectScore.khmerDictation !== undefined || newSubjectScore.khmerComposition !== undefined) ? ((newSubjectScore.khmerDictation ?? 0) + (newSubjectScore.khmerComposition ?? 0)) / 2 : 0);
        const l = newSubjectScore.khmerListening ?? 0;
        const s = newSubjectScore.khmerSpeaking ?? 0;
        newSubjectScore.rawScore = Number(((r + w + l + s) / 4).toFixed(2));
      }
      // 2. If Math 5 sections updated (ចំនួន, ពិជគណិត, រង្វាស់រង្វល់, ធរណីមាត្រ, ស្ថិតិ)
      else if (
        scoreData.mathNumbers !== undefined ||
        scoreData.mathAlgebra !== undefined ||
        scoreData.mathMeasurement !== undefined ||
        scoreData.mathGeometry !== undefined ||
        scoreData.mathStatistics !== undefined
      ) {
        const n = newSubjectScore.mathNumbers ?? newSubjectScore.mathAlgebra ?? 0;
        const a = newSubjectScore.mathAlgebra ?? 0;
        const m = newSubjectScore.mathMeasurement ?? 0;
        const g = newSubjectScore.mathGeometry ?? 0;
        const st = newSubjectScore.mathStatistics ?? 0;
        newSubjectScore.rawScore = Number(((n + a + m + g + st) / 5).toFixed(2));
      }
      // 3. If standard continuous assessment breakdown provided
      else if (
        scoreData.homework !== undefined ||
        scoreData.quizzes !== undefined ||
        scoreData.midterm !== undefined ||
        scoreData.finalExam !== undefined
      ) {
        const hw = newSubjectScore.homework ?? 0;
        const qz = newSubjectScore.quizzes ?? 0;
        const mid = newSubjectScore.midterm ?? 0;
        const fin = newSubjectScore.finalExam ?? 0;
        const tw = weights.homework + weights.quizzes + weights.midterm + weights.finalExam;
        if (tw > 0) {
          newSubjectScore.rawScore = Number(((hw * weights.homework + qz * weights.quizzes + mid * weights.midterm + fin * weights.finalExam) / tw).toFixed(2));
        }
      }
      // 4. If rawScore explicitly passed for Khmer or Math (sync subcomponents)
      else if (scoreData.rawScore !== undefined) {
        if (subjectId === 'sub_khmer' && scoreData.khmerReading === undefined) {
          newSubjectScore.khmerReading = scoreData.rawScore;
          newSubjectScore.khmerWriting = scoreData.rawScore;
          newSubjectScore.khmerDictation = scoreData.rawScore;
          newSubjectScore.khmerComposition = scoreData.rawScore;
          newSubjectScore.khmerListening = scoreData.rawScore;
          newSubjectScore.khmerSpeaking = scoreData.rawScore;
        } else if (subjectId === 'sub_math' && scoreData.mathNumbers === undefined && scoreData.mathAlgebra === undefined) {
          newSubjectScore.mathNumbers = scoreData.rawScore;
          newSubjectScore.mathAlgebra = scoreData.rawScore;
          newSubjectScore.mathMeasurement = scoreData.rawScore;
          newSubjectScore.mathGeometry = scoreData.rawScore;
          newSubjectScore.mathStatistics = scoreData.rawScore;
        }
      }

      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [periodId]: {
            ...studentPeriodScores,
            [subjectId]: newSubjectScore,
          }
        }
      };
    });
  };

  const bulkUpdatePeriodScores = (
    periodId: string,
    subjectId: string,
    updates: Record<string, number>
  ) => {
    setScoresMatrix(prev => {
      const updated = { ...prev };
      for (const [studentId, scoreVal] of Object.entries(updates)) {
        if (!updated[studentId]) updated[studentId] = {};
        if (!updated[studentId][periodId]) updated[studentId][periodId] = {};
        
        const existing = updated[studentId][periodId][subjectId] || {};
        if (subjectId === 'sub_khmer') {
          updated[studentId][periodId][subjectId] = {
            ...existing,
            rawScore: scoreVal,
            khmerReading: scoreVal,
            khmerWriting: scoreVal,
            khmerDictation: scoreVal,
            khmerComposition: scoreVal,
            khmerListening: scoreVal,
            khmerSpeaking: scoreVal,
          };
        } else if (subjectId === 'sub_math') {
          updated[studentId][periodId][subjectId] = {
            ...existing,
            rawScore: scoreVal,
            mathNumbers: scoreVal,
            mathAlgebra: scoreVal,
            mathMeasurement: scoreVal,
            mathGeometry: scoreVal,
            mathStatistics: scoreVal,
          };
        } else {
          updated[studentId][periodId][subjectId] = {
            ...existing,
            rawScore: scoreVal,
            homework: scoreVal,
            quizzes: scoreVal,
            midterm: scoreVal,
            finalExam: scoreVal,
          };
        }
      }
      return updated;
    });
    showToast(language === 'km' ? 'បានរក្សាទុកពិន្ទុទាំងអស់' : 'Scores updated successfully');
  };

  const updateWeights = (newWeights: AssessmentWeightConfig) => {
    setWeights(newWeights);
    showToast(language === 'km' ? 'បានកែប្រែទម្ងន់ពិន្ទុ' : 'Grading weights updated');
  };

  const updateCompetencyWeights = (newWeights: CompetencyPillarsWeight) => {
    setCompetencyWeights(newWeights);
    showToast(language === 'km' ? 'បានកែប្រែទម្ងន់សម្បទា ៣ យ៉ាង (៨០% / ១០% / ១០%)' : 'MoEYS competency weights updated');
  };

  const updateGradeScales = (scales: GradeScaleThreshold[]) => {
    setGradeScales(scales);
    showToast(language === 'km' ? 'បានកែប្រែកម្រិតនិទ្ទេស' : 'Grade scales updated');
  };

  const updateSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    showToast(language === 'km' ? 'បានកែប្រែមុខវិជ្ជា' : 'Subjects list updated');
  };

  const updatePeriods = (newPeriods: AssessmentPeriod[]) => {
    setPeriods(newPeriods);
    showToast(language === 'km' ? 'បានកែប្រែដំណាក់កាលវាយតម្លៃ' : 'Assessment periods updated');
  };

  // Calendar Event Methods
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
    const id = 'id' in eventData && eventData.id ? eventData.id : `evt_${Date.now()}_${Math.random().toString().slice(2, 5)}`;
    const newEvent: CalendarEvent = {
      ...eventData,
      id,
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    showToast(language === 'km' ? 'បានបង្កើតព្រឹត្តិការណ៍ប្រតិទិនថ្មី' : 'Calendar event added');
  };

  const updateCalendarEvent = (id: string, updated: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    showToast(language === 'km' ? 'បានកែប្រែព្រឹត្តិការណ៍ប្រតិទិន' : 'Calendar event updated');
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    showToast(language === 'km' ? 'បានលុបព្រឹត្តិការណ៍' : 'Calendar event deleted', 'info');
  };

  const toggleEventCompleted = (id: string) => {
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
  };

  const importCalendarEvents = (events: CalendarEvent[]) => {
    setCalendarEvents(events);
    showToast(language === 'km' ? 'បាននាំចូលប្រតិទិនជោគជ័យ' : 'Calendar events imported');
  };

  // Timetable Slot Methods
  const updateTimetableSlot = (slotId: string, updated: Partial<TimetableSlot>) => {
    setTimetableSlotsState(prev => prev.map(slot => slot.id === slotId ? { ...slot, ...updated } : slot));
    showToast(language === 'km' ? 'បានកែប្រែម៉ោងបង្រៀន' : 'Timetable slot updated');
  };

  const setTimetableSlots = (slots: TimetableSlot[]) => {
    setTimetableSlotsState(slots);
  };

  const resetClassTimetable = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    const teacher = cls?.teacherNameKm || 'ស៊ុន ណារិទ្ធ';
    const room = '';
    const newSlots = generateDefaultTimetable(classId, teacher, room);

    setTimetableSlotsState(prev => {
      const otherClassSlots = prev.filter(s => s.classId !== classId);
      return [...otherClassSlots, ...newSlots];
    });
    showToast(language === 'km' ? 'បានកំណត់កាលវិភាគថ្នាក់នេះតាមស្តង់ដារក្រសួង' : 'Class timetable reset to MoEYS standard');
  };

  const saveTimetableBatch = (newSlots: TimetableSlot[]) => {
    setTimetableSlotsState(newSlots);
    showToast(language === 'km' ? 'បានរក្សាទុកកាលវិភាគបង្រៀន' : 'Weekly timetable saved');
  };

  // Curriculum Methods
  const updateCurriculumLesson = (programId: string, lessonId: string, updated: Partial<CurriculumLesson>) => {
    setCurriculumPrograms(prev => prev.map(prog => {
      if (prog.id !== programId) return prog;
      return {
        ...prog,
        lessons: prog.lessons.map(lesson => lesson.id === lessonId ? { ...lesson, ...updated } : lesson)
      };
    }));
    showToast(language === 'km' ? 'បានកែប្រែមេរៀនកម្មវិធីសិក្សា' : 'Curriculum lesson updated');
  };

  const importCurriculumProgram = (program: CurriculumProgram) => {
    setCurriculumPrograms(prev => {
      const exists = prev.some(p => p.id === program.id);
      if (exists) {
        return prev.map(p => p.id === program.id ? program : p);
      }
      return [...prev, program];
    });
    showToast(language === 'km' ? 'បាននាំចូលកម្មវិធីសិក្សាជោគជ័យ' : 'Curriculum program imported');
  };

  const syncCurriculumToCalendar = (programId: string) => {
    const program = curriculumPrograms.find(p => p.id === programId);
    if (!program) return;

    const newEvents: CalendarEvent[] = [];
    program.lessons.forEach(lesson => {
      if (lesson.startDate) {
        newEvents.push({
          id: `curric_evt_${lesson.id}_${Date.now()}`,
          titleKm: `[កម្មវិធីសិក្សា ${lesson.chapterKm || ''}] ${lesson.lessonTitleKm}`,
          titleEn: `[Curriculum W${lesson.weekNumber}] ${lesson.lessonTitleEn}`,
          date: lesson.startDate,
          endDate: lesson.endDate,
          type: 'curriculum',
          color: '#0284c7',
          descriptionKm: `${lesson.objectivesKm || ''} (ចំនួន ${lesson.hoursCount} ម៉ោង)`,
          descriptionEn: `${lesson.objectivesEn || ''} (${lesson.hoursCount} Hours)`,
          isMoEYSOfficial: true,
        });
      }
    });

    if (newEvents.length > 0) {
      setCalendarEvents(prev => [...prev, ...newEvents]);
      showToast(
        language === 'km' 
          ? `បានបញ្ចូលមេរៀនចំនួន ${newEvents.length} ទៅក្នុងប្រតិទិនសាលារៀន!` 
          : `Synced ${newEvents.length} lessons to School Calendar!`
      );
    } else {
      showToast(
        language === 'km' 
          ? 'មិនមានកាលបរិច្ឆេទក្នុងមេរៀនដើម្បីបញ្ចូលទៅប្រតិទិនទេ' 
          : 'No date-assigned lessons to sync', 
        'warning'
      );
    }
  };

  // Attendance Handler Methods
  const markAttendance = (studentId: string, date: string, status: AttendanceStatus, note?: string) => {
    const classId = activeClassId;
    const recordId = `${date}_${studentId}`;

    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => r.id !== recordId);
      return [
        ...filtered,
        {
          id: recordId,
          classId,
          studentId,
          date,
          status,
          note
        }
      ];
    });

    // Auto update student's cumulative attendanceCount
    setStudents(prevStudents => {
      return prevStudents.map(stu => {
        if (stu.id !== studentId) return stu;
        
        // Recompute counts based on updated records
        const stuRecords = [
          ...attendanceRecords.filter(r => r.studentId === studentId && r.id !== recordId),
          { id: recordId, classId, studentId, date, status, note }
        ];

        const present = stuRecords.filter(r => r.status === 'present').length;
        const absentExcused = stuRecords.filter(r => r.status === 'excused').length;
        const absentUnexcused = stuRecords.filter(r => r.status === 'unexcused').length;
        const late = stuRecords.filter(r => r.status === 'late').length;

        return {
          ...stu,
          attendanceCount: {
            present,
            absentExcused,
            absentUnexcused,
            late
          }
        };
      });
    });
  };

  const batchMarkAttendance = (date: string, records: { studentId: string; status: AttendanceStatus; note?: string }[]) => {
    const classId = activeClassId;
    const newRecords: DailyAttendanceRecord[] = records.map(r => ({
      id: `${date}_${r.studentId}`,
      classId,
      studentId: r.studentId,
      date,
      status: r.status,
      note: r.note
    }));

    const newRecordIds = new Set(newRecords.map(r => r.id));

    setAttendanceRecords(prev => [
      ...prev.filter(r => !newRecordIds.has(r.id)),
      ...newRecords
    ]);

    showToast(
      language === 'km' 
        ? `បានរក្សាទុកវត្តមានសម្រាប់ថ្ងៃ ${date} ចំនួន ${records.length} នាក់` 
        : `Saved attendance for ${records.length} students on ${date}`
    );
  };

  const markAllPresent = (date: string, targetClassId?: string) => {
    const classId = targetClassId || activeClassId;
    const targetStudents = students.filter(s => {
      const cls = classes.find(c => c.id === classId);
      return cls ? cls.studentIds.includes(s.id) : true;
    });

    const newRecords: DailyAttendanceRecord[] = targetStudents.map(s => ({
      id: `${date}_${s.id}`,
      classId,
      studentId: s.id,
      date,
      status: 'present',
      note: undefined
    }));

    const newRecordIds = new Set(newRecords.map(r => r.id));

    setAttendanceRecords(prev => [
      ...prev.filter(r => !newRecordIds.has(r.id)),
      ...newRecords
    ]);

    showToast(
      language === 'km' 
        ? `បានកត់ត្រាវត្តមាន "មកគ្រប់គ្នា" សម្រាប់ថ្ងៃ ${date}` 
        : `Marked all ${targetStudents.length} students present for ${date}`
    );
  };

  const getStudentMonthlyAttendance = (studentId: string, yearMonth?: string): StudentAttendanceSummary => {
    const studentRecords = attendanceRecords.filter(r => {
      if (r.studentId !== studentId) return false;
      if (yearMonth && !r.date.startsWith(yearMonth)) return false;
      return true;
    });

    const presentDays = studentRecords.filter(r => r.status === 'present').length;
    const excusedDays = studentRecords.filter(r => r.status === 'excused').length;
    const unexcusedDays = studentRecords.filter(r => r.status === 'unexcused').length;
    const lateDays = studentRecords.filter(r => r.status === 'late').length;
    const totalSchoolDays = studentRecords.length || 1;
    
    // Present + Late count towards attendance rate
    const attended = presentDays + lateDays;
    const attendanceRate = totalSchoolDays > 0 ? Number(((attended / totalSchoolDays) * 100).toFixed(1)) : 100;

    return {
      studentId,
      presentDays,
      excusedDays,
      unexcusedDays,
      lateDays,
      totalSchoolDays,
      attendanceRate
    };
  };

  const getStudentYearlyAttendance = (studentId: string): StudentAttendanceSummary => {
    return getStudentMonthlyAttendance(studentId, undefined);
  };

  const resetToDefaults = () => {
    setClasses(INITIAL_CLASSES);
    setActiveClassId('class_6a');
    setStudents(INITIAL_STUDENTS);
    setSubjects(DEFAULT_SUBJECTS);
    setPeriods(DEFAULT_PERIODS);
    setScoresMatrix(generateInitialScores());
    setWeights(DEFAULT_WEIGHT_CONFIG);
    setGradeScales(DEFAULT_GRADE_SCALES);
    setCompetencyWeights(DEFAULT_COMPETENCY_WEIGHTS);
    setCalendarEvents(DEFAULT_CALENDAR_EVENTS);
    setTimetableSlotsState(INITIAL_TIMETABLE_SLOTS);
    setCurriculumPrograms(DEFAULT_CURRICULUM_PROGRAMS);
    setSchoolProfileState(DEFAULT_SCHOOL_PROFILE);
    showToast(language === 'km' ? 'បានកំណត់ទិន្នន័យឡើងវិញ' : 'Reset to default sample data', 'info');
  };

  const importFullData = (data: any): boolean => {
    try {
      if (data.schoolProfile) setSchoolProfileState(data.schoolProfile);
      if (data.classes && Array.isArray(data.classes)) setClasses(data.classes);
      if (data.students && Array.isArray(data.students)) setStudents(data.students);
      if (data.scoresMatrix) setScoresMatrix(data.scoresMatrix);
      if (data.weights) setWeights(data.weights);
      if (data.competencyWeights) setCompetencyWeights(data.competencyWeights);
      if (data.subjects) setSubjects(data.subjects);
      if (data.periods) setPeriods(data.periods);
      if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
      if (data.timetableSlots) setTimetableSlotsState(data.timetableSlots);
      if (data.curriculumPrograms) setCurriculumPrograms(data.curriculumPrograms);
      if (data.activeClassId) setActiveClassId(data.activeClassId);
      showToast(language === 'km' ? 'បាននាំចូលទិន្នន័យជោគជ័យ' : 'Backup imported successfully');
      return true;
    } catch (e) {
      console.error(e);
      showToast(language === 'km' ? 'បរាជ័យក្នុងការអានឯកសារ' : 'Failed to import JSON file', 'error');
      return false;
    }
  };

  const restoreScoresMatrix = (matrix: Record<string, Record<string, Record<string, any>>>) => {
    if (matrix && typeof matrix === 'object') {
      setScoresMatrix(matrix);
      localStorage.setItem(`${LS_PREFIX}scores`, JSON.stringify(matrix));
      showToast(language === 'km' ? 'បានស្តារពិន្ទុពីទិន្នន័យរក្សាទុកស្វ័យប្រវត្តិដោយជោគជ័យ' : 'Scores restored from auto-save backup successfully', 'success');
    }
  };

  // ==========================================
  // Cross-Device Cloud Synchronization
  // ==========================================
  const [syncKey, setSyncKeyState] = useState<string>(() => getSavedSyncKey());
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(() => isAutoSyncEnabled());
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>({
    state: 'idle',
    lastSyncedAt: null,
    syncKey: getSavedSyncKey()
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const setSyncKey = (newKey: string) => {
    const clean = newKey.trim().toUpperCase();
    saveSyncKey(clean);
    setSyncKeyState(clean);
    setSyncStatus(prev => ({ ...prev, syncKey: clean }));
  };

  const setAutoSyncEnabled = (enabled: boolean) => {
    saveAutoSyncEnabled(enabled);
    setAutoSyncEnabledState(enabled);
  };

  const getFullPayload = (): SyncPayload => ({
    version: 2,
    updatedAt: Date.now(),
    schoolProfile,
    classes,
    students,
    scores: scoresMatrix as any,
    monthlyExams: [],
    annualRankings: [],
    attendanceRecords,
    homeworkAssignments: [],
    fluencyTests: fluencyRecords as any,
    timetableSlots,
    curriculumPrograms,
    questionBank: [],
    examPapers: []
  });

  const syncNow = async () => {
    setSyncStatus(prev => ({ ...prev, state: 'syncing' }));
    try {
      const payload = getFullPayload();
      const res = await pushDataToCloud(syncKey, payload);
      if (res.success) {
        setSyncStatus({
          state: 'synced',
          lastSyncedAt: res.updatedAt,
          syncKey
        });
      } else {
        setSyncStatus(prev => ({ ...prev, state: 'error' }));
      }
    } catch (err: any) {
      setSyncStatus(prev => ({ ...prev, state: 'error', errorMessage: err?.message }));
      throw err;
    }
  };

  const pullFromCloudNow = async () => {
    setSyncStatus(prev => ({ ...prev, state: 'syncing' }));
    try {
      const res = await pullDataFromCloud(syncKey);
      if (res.success && res.data) {
        const d = res.data;
        if (d.schoolProfile) setSchoolProfileState(d.schoolProfile);
        if (Array.isArray(d.classes) && d.classes.length) setClasses(d.classes);
        if (Array.isArray(d.students) && d.students.length) setStudents(d.students);
        if (d.scores && typeof d.scores === 'object') setScoresMatrix(d.scores);
        if (Array.isArray(d.attendanceRecords)) setAttendanceRecords(d.attendanceRecords);
        if (Array.isArray(d.timetableSlots)) setTimetableSlotsState(d.timetableSlots);
        if (Array.isArray(d.curriculumPrograms)) setCurriculumPrograms(d.curriculumPrograms);
        if (Array.isArray(d.fluencyTests)) setFluencyRecords(d.fluencyTests);

        setSyncStatus({
          state: 'synced',
          lastSyncedAt: res.updatedAt || Date.now(),
          syncKey
        });
      } else {
        setSyncStatus(prev => ({ ...prev, state: 'error' }));
        throw new Error('មិនមានទិន្នន័យលើ Cloud សម្រាប់កូដបន្សីនេះទេ');
      }
    } catch (err: any) {
      setSyncStatus(prev => ({ ...prev, state: 'error', errorMessage: err?.message }));
      throw err;
    }
  };

  // Check URL params on initial mount for pairing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const paramKey = urlParams.get('syncKey') || urlParams.get('sync') || urlParams.get('pair');
    if (paramKey && paramKey.trim()) {
      const cleanKey = paramKey.trim().toUpperCase();
      setSyncKey(cleanKey);
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      pullDataFromCloud(cleanKey).then(res => {
        if (res.success && res.data) {
          const d = res.data;
          if (d.schoolProfile) setSchoolProfileState(d.schoolProfile);
          if (Array.isArray(d.classes) && d.classes.length) setClasses(d.classes);
          if (Array.isArray(d.students) && d.students.length) setStudents(d.students);
          if (d.scores && typeof d.scores === 'object') setScoresMatrix(d.scores);
          if (Array.isArray(d.attendanceRecords)) setAttendanceRecords(d.attendanceRecords);
          if (Array.isArray(d.timetableSlots)) setTimetableSlotsState(d.timetableSlots);
          if (Array.isArray(d.curriculumPrograms)) setCurriculumPrograms(d.curriculumPrograms);
          if (Array.isArray(d.fluencyTests)) setFluencyRecords(d.fluencyTests);
          setSyncStatus({
            state: 'synced',
            lastSyncedAt: res.updatedAt || Date.now(),
            syncKey: cleanKey
          });
          showToast(language === 'km' ? 'បានភ្ជាប់ និងទាញយកទិន្នន័យពី Cloud ជោគជ័យ!' : 'Connected & synced from Cloud successfully!', 'success');
        }
      }).catch(err => {
        console.error('Auto pull failed:', err);
      });
    }
  }, []);

  // Background Debounced Auto-Sync when data changes
  useEffect(() => {
    if (!autoSyncEnabled || !syncKey) return;
    const timer = setTimeout(() => {
      const payload = getFullPayload();
      pushDataToCloud(syncKey, payload).then(res => {
        if (res.success) {
          setSyncStatus({
            state: 'synced',
            lastSyncedAt: res.updatedAt,
            syncKey
          });
        }
      }).catch(err => {
        console.error('Debounced auto-sync failed:', err);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    autoSyncEnabled,
    syncKey,
    classes,
    students,
    scoresMatrix,
    attendanceRecords,
    schoolProfile,
    timetableSlots,
    curriculumPrograms,
    fluencyRecords
  ]);

  return (
    <GradebookContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        classes,
        activeClassId,
        setActiveClassId,
        activeClass,
        activePeriodId,
        setActivePeriodId,
        students,
        classStudents,
        subjects,
        periods,
        scoresMatrix,
        weights,
        competencyWeights,
        gradeScales,
        selectedStudentId,
        setSelectedStudentId,
        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        toggleEventCompleted,
        importCalendarEvents,
        timetableSlots,
        updateTimetableSlot,
        setTimetableSlots,
        resetClassTimetable,
        saveTimetableBatch,
        curriculumPrograms,
        updateCurriculumLesson,
        importCurriculumProgram,
        syncCurriculumToCalendar,
        attendanceRecords,
        markAttendance,
        batchMarkAttendance,
        markAllPresent,
        getStudentMonthlyAttendance,
        getStudentYearlyAttendance,
        schoolProfile,
        updateSchoolProfile,
        resetSchoolLogo,
        resetMoEYSLogo,
        duplicateClass,
        addClass,
        createClass,
        updateClass,
        deleteClass,
        addStudent,
        addStudentsBatch,
        updateStudent,
        deleteStudent,
        deleteStudents,
        updateSubjectScore,
        bulkUpdatePeriodScores,
        updateWeights,
        updateCompetencyWeights,
        updateGradeScales,
        updateSubjects,
        updatePeriods,
        resetToDefaults,
        importFullData,
        restoreScoresMatrix,
        toasts,
        showToast,
        addToast: showToast,
        removeToast,
        readingPassages,
        addReadingPassage,
        updateReadingPassage,
        deleteReadingPassage,
        fluencyRecords,
        saveFluencyRecord,
        deleteFluencyRecord,
        syncKey,
        setSyncKey,
        syncStatus,
        syncNow,
        pullFromCloudNow,
        autoSyncEnabled,
        setAutoSyncEnabled,
        isSyncModalOpen,
        setIsSyncModalOpen,
      }}
    >
      {children}
    </GradebookContext.Provider>
  );
};

export const useGradebook = () => {
  const context = useContext(GradebookContext);
  if (!context) {
    throw new Error('useGradebook must be used within a GradebookProvider');
  }
  return context;
};
