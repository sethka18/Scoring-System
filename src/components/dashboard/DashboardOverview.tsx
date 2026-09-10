import React, { useState, useMemo } from 'react';
import { useGradebook, NavTab } from '../../context/GradebookContext';
import { 
  Users, 
  BookOpen, 
  Award, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  PlusCircle, 
  FileText, 
  Trophy,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Camera,
  Crown,
  Medal,
  Star,
  UserCheck,
  HeartHandshake,
  FileSpreadsheet,
  TableProperties,
  BookCheck,
  FileQuestion,
  Timer,
  LayoutGrid,
  Wrench,
  Database,
  Search,
  X,
  ChevronRight,
  SlidersHorizontal,
  CalendarCheck,
  Building2,
  ExternalLink,
  Zap,
  Filter,
  Gamepad2,
  Settings
} from 'lucide-react';
import { calculateYearlySummaries, calculatePeriodRankings } from '../../utils/calculations';
import { StudentPhotoModal } from '../common/StudentPhotoModal';
import { Student } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface QuickActionItem {
  id: NavTab;
  titleKm: string;
  titleEn: string;
  descKm: string;
  descEn: string;
  badgeKm?: string;
  category: 'teaching' | 'scoring' | 'plans' | 'tools';
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
}

export const DashboardOverview: React.FC = () => {
  const { 
    language, 
    activeClass, 
    classStudents, 
    classes, 
    subjects, 
    periods, 
    scoresMatrix, 
    weights, 
    gradeScales, 
    setActiveTab, 
    setSelectedStudentId 
  } = useGradebook();

  const [photoModalStudent, setPhotoModalStudent] = useState<{ student: Student; rank?: number } | null>(null);
  const [quickActionCategory, setQuickActionCategory] = useState<'all' | 'teaching' | 'scoring' | 'plans' | 'tools'>('all');
  const [quickActionSearch, setQuickActionSearch] = useState('');

  const yearlySummaries = calculateYearlySummaries(
    classStudents,
    periods,
    subjects,
    scoresMatrix,
    weights,
    gradeScales
  );

  const currentPeriod = periods[0] || { id: 'month_dec', nameEn: 'December', nameKm: 'ខែធ្នូ' };
  const currentPeriodRankings = calculatePeriodRankings(
    classStudents,
    currentPeriod.id,
    subjects,
    scoresMatrix,
    weights
  );

  // Key Metrics
  const totalStudents = classStudents.length;
  const maleStudents = classStudents.filter(s => s.gender === 'Male').length;
  const femaleStudents = classStudents.filter(s => s.gender === 'Female').length;

  const totalAttSum = classStudents.reduce((acc, s) => {
    const present = s.attendanceCount?.present ?? 0;
    const excused = s.attendanceCount?.absentExcused ?? 0;
    const unexcused = s.attendanceCount?.absentUnexcused ?? 0;
    const tot = present + excused + unexcused;
    return acc + (tot > 0 ? (present / tot) * 100 : 100);
  }, 0);
  const avgAttendance = totalStudents > 0 ? Number((totalAttSum / totalStudents).toFixed(1)) : 100;

  const totalGpaSum = yearlySummaries.reduce((acc, s) => acc + s.yearlyAverage, 0);
  const classAvgGPA = totalStudents > 0 ? Number((totalGpaSum / totalStudents).toFixed(2)) : 0;
  const passCount = yearlySummaries.filter(s => s.passed).length;
  const passRate = totalStudents > 0 ? Number(((passCount / totalStudents) * 100).toFixed(0)) : 100;

  // Grade Distribution
  const gradeDistribution = gradeScales.map(scale => {
    const count = yearlySummaries.filter(s => s.letterGrade === scale.grade).length;
    return {
      name: scale.grade,
      label: language === 'km' ? scale.labelKm : scale.labelEn,
      count,
      color: scale.color,
    };
  });

  // Subject Performance Average
  const subjectAverages = subjects.map(subj => {
    let sum = 0;
    let count = 0;
    for (const student of classStudents) {
      for (const p of periods) {
        const entry = scoresMatrix[student.id]?.[p.id]?.[subj.id];
        if (entry) {
          const val = entry.rawScore ?? entry.homework ?? 0;
          sum += val;
          count++;
        }
      }
    }
    const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    return {
      name: language === 'km' ? subj.nameKm : subj.nameEn,
      code: subj.code,
      average: avg,
      color: subj.color,
    };
  });

  // Monthly Progression Trend
  const monthlyTrends = periods.map(period => {
    const rankings = calculatePeriodRankings(classStudents, period.id, subjects, scoresMatrix, weights);
    const avgScore = rankings.reduce((acc, r) => acc + r.average, 0) / (rankings.length || 1);
    return {
      period: language === 'km' ? period.nameKm.split(' ')[0] : period.nameEn.split(' ')[0],
      average: Number(avgScore.toFixed(2)),
    };
  });

  // Top 5 Students
  const topStudents = yearlySummaries.slice(0, 5);

  // All Primary Quick Actions
  const allQuickActions: QuickActionItem[] = useMemo(() => [
    {
      id: 'student_plan',
      titleKm: 'ផែនការរៀនសូត្រ (PTOM)',
      titleEn: 'Parent Agreement (PLP)',
      descKm: 'កិច្ចព្រមព្រៀងមាតាបិតា & តេស្តដើមឆ្នាំ ៤ កម្រិត',
      descEn: 'Individual student plan & diagnostic test',
      badgeKm: 'PTOM / PLP',
      category: 'plans',
      icon: UserCheck,
      iconBg: 'bg-violet-100 dark:bg-violet-950/60',
      iconColor: 'text-violet-600 dark:text-violet-400',
      accentBorder: 'hover:border-violet-500/60',
    },
    {
      id: 'scoring',
      titleKm: 'បញ្ចូលពិន្ទុប្រចាំខែ/ឆមាស',
      titleEn: 'Monthly & Semester Scores',
      descKm: 'បញ្ចូលពិន្ទុតាមមុខវិជ្ជា និងគណនាស្វ័យប្រវត្តិ',
      descEn: 'Gradebook & automated score calculation',
      badgeKm: 'ពិន្ទុ',
      category: 'scoring',
      icon: TableProperties,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      accentBorder: 'hover:border-indigo-500/60',
    },
    {
      id: 'attendance',
      titleKm: 'ស្រង់វត្តមានប្រចាំថ្ងៃ',
      titleEn: 'Daily Attendance',
      descKm: 'វត្តមាន មានច្បាប់ អវត្តមាន យឺត',
      descEn: 'Mark attendance, absences & permissions',
      badgeKm: 'ប្រចាំថ្ងៃ',
      category: 'teaching',
      icon: CalendarCheck,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentBorder: 'hover:border-emerald-500/60',
    },
    {
      id: 'skills_assessment',
      titleKm: 'វាយតម្លៃបំណិន (ឧបសម្ព័ន្ធ៣)',
      titleEn: 'Skills Assessment',
      descKm: '១៨ សកម្មភាពបំណិនជីវិតជាក់ស្តែង (ទម្ងន់ ១០%)',
      descEn: '18 practical life skills (10% weight)',
      badgeKm: 'ឧបសម្ព័ន្ធ ៣',
      category: 'scoring',
      icon: Award,
      iconBg: 'bg-amber-100 dark:bg-amber-950/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentBorder: 'hover:border-amber-500/60',
    },
    {
      id: 'attitude_assessment',
      titleKm: 'វាយតម្លៃចរិយា (ឧបសម្ព័ន្ធ៤)',
      titleEn: 'Attitude Assessment',
      descKm: '៧៤ លក្ខណៈវិនិច្ឆ័យ ៥ ជំពូក (ទម្ងន់ ១០%)',
      descEn: '74 attitude criteria across 5 categories',
      badgeKm: 'ឧបសម្ព័ន្ធ ៤',
      category: 'scoring',
      icon: HeartHandshake,
      iconBg: 'bg-rose-100 dark:bg-rose-950/60',
      iconColor: 'text-rose-600 dark:text-rose-400',
      accentBorder: 'hover:border-rose-500/60',
    },
    {
      id: 'report_card',
      titleKm: 'សៀវភៅតាមដាន & ប័ណ្ណសរសើរ',
      titleEn: 'Report Cards & Transcripts',
      descKm: 'បោះពុម្ពសៀវភៅតាមដានការសិក្សា និងប័ណ្ណសរសើរ A4',
      descEn: 'Print gradebooks & award certificates',
      badgeKm: 'បោះពុម្ព A4',
      category: 'plans',
      icon: FileSpreadsheet,
      iconBg: 'bg-sky-100 dark:bg-sky-950/60',
      iconColor: 'text-sky-600 dark:text-sky-400',
      accentBorder: 'hover:border-sky-500/60',
    },
    {
      id: 'record_book',
      titleKm: 'សៀវភៅសិក្ខាគរិកសិស្ស (MoEYS)',
      titleEn: 'Pupil Cumulative Record Book',
      descKm: 'សៀវភៅសិក្ខាគរិកស្តង់ដារក្រសួងបឋមសិក្សា (ផ្នែក ក, ខ, គ, ឃ)',
      descEn: 'Official primary school student record book with 11 subjects',
      badgeKm: 'គំរូក្រសួងផ្លូវការ',
      category: 'plans',
      icon: BookOpen,
      iconBg: 'bg-amber-100 dark:bg-amber-950/60',
      iconColor: 'text-amber-700 dark:text-amber-400',
      accentBorder: 'hover:border-amber-500/60',
    },
    {
      id: 'rankings',
      titleKm: 'តារាងចំណាត់ថ្នាក់ A4 & កិត្តិយស',
      titleEn: 'A4 Rankings & Honor Roll',
      descKm: 'តារាងចំណាត់ថ្នាក់ផ្លូវការ A4 & គំរូតារាងកិត្តិយសក្រសួង',
      descEn: 'Official A4 ranking sheets & MoEYS honor poster',
      badgeKm: 'បោះពុម្ព A4',
      category: 'scoring',
      icon: Trophy,
      iconBg: 'bg-amber-100 dark:bg-amber-950/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentBorder: 'hover:border-amber-500/60',
    },
    {
      id: 'homework',
      titleKm: 'កិច្ចការផ្ទះប្រចាំថ្ងៃ',
      titleEn: 'Homework Tracker',
      descKm: 'តាមដានការប្រគល់ និងកែកិច្ចការផ្ទះសិស្ស',
      descEn: 'Daily homework checklist & review',
      badgeKm: 'កិច្ចការផ្ទះ',
      category: 'teaching',
      icon: BookCheck,
      iconBg: 'bg-teal-100 dark:bg-teal-950/60',
      iconColor: 'text-teal-600 dark:text-teal-400',
      accentBorder: 'hover:border-teal-500/60',
    },
    {
      id: 'exam_bank',
      titleKm: 'ធនាគារសំណួរ & វិញ្ញាសា',
      titleEn: 'Exam & Question Bank',
      descKm: 'បង្កើតវិញ្ញាសាប្រឡង និងបណ្ណាល័យសំណួរ PDF',
      descEn: 'Create exam papers and question pool',
      badgeKm: 'វិញ្ញាសា',
      category: 'scoring',
      icon: FileQuestion,
      iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/60',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      accentBorder: 'hover:border-fuchsia-500/60',
    },
    {
      id: 'fluency_exam',
      titleKm: 'ប្រឡងល្បឿនអំណាន & គិតលេខ',
      titleEn: 'Speed Fluency Exam',
      descKm: 'នាឡិកាកំណត់ម៉ោងអំណានខ្មែរ & គណិតរហ័ស',
      descEn: 'Khmer reading speed & mental math timer',
      badgeKm: 'កំណត់ម៉ោង',
      category: 'scoring',
      icon: Timer,
      iconBg: 'bg-red-100 dark:bg-red-950/60',
      iconColor: 'text-red-600 dark:text-red-400',
      accentBorder: 'hover:border-red-500/60',
    },
    {
      id: 'seating',
      titleKm: 'ប្លង់តុអង្គុយសិស្ស',
      titleEn: 'Classroom Seating Chart',
      descKm: 'រៀបចំទីតាំងតុអង្គុយ និងផ្គូផ្គងដៃគូសិក្សា',
      descEn: 'Arrange desks and seat assignments',
      badgeKm: 'ប្លង់តុ',
      category: 'tools',
      icon: LayoutGrid,
      iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      accentBorder: 'hover:border-cyan-500/60',
    },
    {
      id: 'classroom_tools',
      titleKm: 'ឧបករណ៍ជំនួយ & ហ្គេម',
      titleEn: 'Classroom Power Tools',
      descKm: 'កងវិលសំណាង, ចាប់ឆ្នោត, ក្តារខៀន, ម៉ោងរាប់',
      descEn: 'Lucky wheel, dice, whiteboard, timer & games',
      badgeKm: 'ហ្គេម & ឧបករណ៍',
      category: 'tools',
      icon: Sparkles,
      iconBg: 'bg-blue-100 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'hover:border-blue-500/60',
    },
    {
      id: 'schedule',
      titleKm: 'កាលវិភាគបង្រៀន',
      titleEn: 'Weekly Timetable',
      descKm: 'កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍តាមស្តង់ដារ',
      descEn: 'Weekly class teaching schedule',
      badgeKm: 'កាលវិភាគ',
      category: 'teaching',
      icon: Clock,
      iconBg: 'bg-purple-100 dark:bg-purple-950/60',
      iconColor: 'text-purple-600 dark:text-purple-400',
      accentBorder: 'hover:border-purple-500/60',
    },
    {
      id: 'calendar',
      titleKm: 'ប្រតិទិនសាលារៀន',
      titleEn: 'School Calendar',
      descKm: 'ថ្ងៃឈប់សម្រាក ពិធីបុណ្យជាតិ និងប្រឡង',
      descEn: 'Holidays, events & exam dates',
      badgeKm: 'ប្រតិទិន',
      category: 'teaching',
      icon: Calendar,
      iconBg: 'bg-orange-100 dark:bg-orange-950/60',
      iconColor: 'text-orange-600 dark:text-orange-400',
      accentBorder: 'hover:border-orange-500/60',
    },
    {
      id: 'curriculum',
      titleKm: 'កម្មវិធីសិក្សាលម្អិត',
      titleEn: 'Curriculum & Lessons',
      descKm: 'មេរៀន និងកម្មវិធីសិក្សាស្តង់ដារ MoEYS',
      descEn: 'Official syllabus and lesson plans',
      badgeKm: 'MoEYS',
      category: 'teaching',
      icon: BookOpen,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      accentBorder: 'hover:border-slate-500/60',
    },
    {
      id: 'roster',
      titleKm: 'គ្រប់គ្រងបញ្ជីសិស្ស',
      titleEn: 'Student Roster',
      descKm: 'បញ្ជីឈ្មោះ អត្តលេខ រូបថត និងអាណាព្យាបាល',
      descEn: 'Student profiles, photos, guardian contacts',
      badgeKm: 'បញ្ជីសិស្ស',
      category: 'plans',
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'hover:border-blue-500/60',
    },
    {
      id: 'analytics',
      titleKm: 'វិភាគស្ថិតិសិក្សា',
      titleEn: 'Whole Year Analytics',
      descKm: 'ក្រាហ្វិកវិភាគលទ្ធផលសិក្សាពេញមួយឆ្នាំ',
      descEn: 'Annual academic performance analytics',
      badgeKm: 'ស្ថិតិ',
      category: 'plans',
      icon: TrendingUp,
      iconBg: 'bg-violet-100 dark:bg-violet-950/60',
      iconColor: 'text-violet-600 dark:text-violet-400',
      accentBorder: 'hover:border-violet-500/60',
    },
    {
      id: 'backup_restore',
      titleKm: 'បម្រុងទុក & Cloud Sync',
      titleEn: 'Backup & Restore',
      descKm: 'រក្សាទុកទិន្នន័យ នាំចេញ Excel និង Cloud Sync',
      descEn: 'Export JSON/Excel backup & cloud sync',
      badgeKm: 'បម្រុងទុក',
      category: 'tools',
      icon: Database,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentBorder: 'hover:border-emerald-500/60',
    },
    {
      id: 'school_hub',
      titleKm: 'មជ្ឈមណ្ឌលគ្រប់ថ្នាក់ (១-៦)',
      titleEn: 'All Classes Hub',
      descKm: 'គ្រប់គ្រង និងប្តូររវាងថ្នាក់រៀនទាំងអស់',
      descEn: 'Overview and switch between classes',
      badgeKm: 'ថ្នាក់ ១-៦',
      category: 'tools',
      icon: Building2,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      accentBorder: 'hover:border-slate-500/60',
    },
    {
      id: 'mini_games',
      titleKm: 'ហ្គេមអប់រំក្នុងថ្នាក់រៀន',
      titleEn: 'Educational Mini-Games',
      descKm: 'ហ្គេមពាក្យខ្មែរ គណិតរហ័ស និងល្បងប្រាជ្ញាសិស្ស',
      descEn: 'Khmer word puzzles, math quiz & trivia games',
      badgeKm: 'ហ្គេមសិក្សា',
      category: 'tools',
      icon: Gamepad2,
      iconBg: 'bg-pink-100 dark:bg-pink-950/60',
      iconColor: 'text-pink-600 dark:text-pink-400',
      accentBorder: 'hover:border-pink-500/60',
    },
    {
      id: 'settings',
      titleKm: 'ការកំណត់ប្រព័ន្ធ & មាត្រដ្ឋាន',
      titleEn: 'System Settings & Scales',
      descKm: 'កំណត់មាត្រដ្ឋានពិន្ទុ ទម្ងន់មុខវិជ្ជា និងសាលារៀន',
      descEn: 'Grade scales, subject weights & school configs',
      badgeKm: 'ការកំណត់',
      category: 'tools',
      icon: Settings,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      accentBorder: 'hover:border-slate-500/60',
    },
  ], []);

  // Filtered Quick Actions based on category and search
  const filteredQuickActions = useMemo(() => {
    return allQuickActions.filter(action => {
      const matchCat = quickActionCategory === 'all' || action.category === quickActionCategory;
      if (!matchCat) return false;

      if (!quickActionSearch.trim()) return true;
      const q = quickActionSearch.toLowerCase();
      return (
        action.titleKm.toLowerCase().includes(q) ||
        action.titleEn.toLowerCase().includes(q) ||
        action.descKm.toLowerCase().includes(q) ||
        action.descEn.toLowerCase().includes(q) ||
        (action.badgeKm && action.badgeKm.toLowerCase().includes(q))
      );
    });
  }, [allQuickActions, quickActionCategory, quickActionSearch]);

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Students */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {language === 'km' ? 'សិស្សសរុប' : 'TOTAL STUDENTS'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">{totalStudents}</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{language === 'km' ? 'នាក់' : 'ENROLLED'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900/40">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>{language === 'km' ? `ប្រុស: ${maleStudents}` : `BOYS: ${maleStudents}`}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{language === 'km' ? `ស្រី: ${femaleStudents}` : `GIRLS: ${femaleStudents}`}</span>
          </div>
        </div>

        {/* Card 2: Active Class & Room */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {language === 'km' ? 'ថ្នាក់បច្ចុប្បន្ន' : 'CURRENT CLASS'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-black text-indigo-950 dark:text-indigo-200 font-heading tracking-tight">
                  {language === 'km' ? activeClass?.nameKm : activeClass?.name}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-900/40">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="truncate max-w-[150px]">{language === 'km' ? `គ្រូបន្ទុក៖ ${activeClass?.teacherNameKm}` : `Teacher: ${activeClass?.teacherName}`}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{classes.length} {language === 'km' ? 'ថ្នាក់' : 'CLASSES'}</span>
          </div>
        </div>

        {/* Card 3: Average Attendance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {language === 'km' ? 'វត្តមានមធ្យម' : 'AVG ATTENDANCE'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-heading tracking-tight">{avgAttendance}%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, avgAttendance)}%` }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
            <span>{language === 'km' ? 'វត្តមានទៀងទាត់ល្អ' : 'EXCELLENT CONSISTENCY'}</span>
          </div>
        </div>

        {/* Card 4: Class Overall GPA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {language === 'km' ? 'មធ្យមភាគថ្នាក់' : 'OVERALL CLASS AVG'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-heading tracking-tight">{classAvgGPA}</span>
                <span className="text-xs text-slate-400 font-bold">/ 10</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-100 dark:border-amber-900/40">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (classAvgGPA / 10) * 100)}%` }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>{language === 'km' ? `ជាប់: ${passRate}%` : `PASS: ${passRate}%`}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[120px]">{yearlySummaries[0]?.student.name || 'សិស្សឆ្នើម'} (Top 1)</span>
          </div>
        </div>

      </div>

      {/* Quick Action Hub - Comprehensive & Clean */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
        
        {/* Header with Title & Live Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                {language === 'km' ? 'សកម្មភាព និងមុខងាររហ័ស (Quick Actions)' : 'Quick Actions & Direct Shortcuts'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ចុចចូលទៅកាន់មុខងារសំខាន់ៗភ្លាមៗដោយចុចតែម្តង' : 'Jump directly into any key feature with a single click'}
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickActionSearch}
              onChange={(e) => setQuickActionSearch(e.target.value)}
              placeholder={language === 'km' ? 'ស្វែងរកមុខងាររហ័ស...' : 'Filter shortcuts...'}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {quickActionSearch && (
              <button
                onClick={() => setQuickActionSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto scrollbar-none py-3">
          {[
            { id: 'all', labelKm: 'ទាំងអស់', labelEn: 'All', count: allQuickActions.length },
            { id: 'teaching', labelKm: 'ការបង្រៀន & វត្តមាន', labelEn: 'Teaching', count: allQuickActions.filter(a => a.category === 'teaching').length },
            { id: 'scoring', labelKm: 'ការវាយតម្លៃ & ពិន្ទុ', labelEn: 'Scoring', count: allQuickActions.filter(a => a.category === 'scoring').length },
            { id: 'plans', labelKm: 'ផែនការ & របាយការណ៍', labelEn: 'Plans & Reports', count: allQuickActions.filter(a => a.category === 'plans').length },
            { id: 'tools', labelKm: 'ឧបករណ៍ & កម្សាន្ត', labelEn: 'Tools & Classroom', count: allQuickActions.filter(a => a.category === 'tools').length },
          ].map(tab => {
            const isActive = quickActionCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setQuickActionCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <span>{language === 'km' ? tab.labelKm : tab.labelEn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 mt-1">
          {filteredQuickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className={`group relative flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer text-left ${action.accentBorder}`}
              >
                {/* Icon Container */}
                <div className={`w-10 h-10 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {language === 'km' ? action.titleKm : action.titleEn}
                    </span>
                    {action.badgeKm && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {action.badgeKm}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {language === 'km' ? action.descKm : action.descEn}
                  </p>
                </div>

                {/* Micro Arrow */}
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0 mt-2.5 opacity-0 group-hover:opacity-100 hidden sm:block" />
              </button>
            );
          })}
        </div>

        {filteredQuickActions.length === 0 && (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            {language === 'km' ? 'រកមិនឃើញមុខងារដែលត្រូវគ្នានឹងការស្វែងរកទេ' : 'No matching shortcuts found'}
          </div>
        )}
      </div>

      {/* Top Academic Achievers Podium - Refined & Clean */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                {language === 'km' ? 'សិស្សឆ្នើមប្រចាំថ្នាក់ (Top 5 Academic Achievers)' : 'Top 5 Academic Achievers'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'សិស្សដែលមានមធ្យមភាគពិន្ទុខ្ពស់ជាងគេក្នុងថ្នាក់' : 'Students with highest cumulative grade point averages'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('rankings')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1.5 cursor-pointer bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 transition"
          >
            <span>{language === 'km' ? 'មើលតារាងកិត្តិយសពេញលេញ' : 'View Full Honor Roll'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {topStudents.map((item, idx) => {
            const colors = [
              { 
                bg: 'bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900', 
                border: 'border-amber-200 dark:border-amber-700/40', 
                badge: 'bg-amber-400 text-amber-950 font-bold', 
                rankText: language === 'km' ? 'លេខ ១' : 'RANK 1', 
                ring: 'ring-amber-400',
                rankIcon: Crown,
                rankColor: 'text-amber-500'
              },
              { 
                bg: 'bg-gradient-to-b from-slate-50/60 to-white dark:from-slate-800/30 dark:to-slate-900', 
                border: 'border-slate-200 dark:border-slate-700/60', 
                badge: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold', 
                rankText: language === 'km' ? 'លេខ ២' : 'RANK 2', 
                ring: 'ring-slate-400',
                rankIcon: Medal,
                rankColor: 'text-slate-400'
              },
              { 
                bg: 'bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/15 dark:to-slate-900', 
                border: 'border-amber-600/20 dark:border-amber-700/30', 
                badge: 'bg-amber-600 text-white font-bold', 
                rankText: language === 'km' ? 'លេខ ៣' : 'RANK 3', 
                ring: 'ring-amber-600',
                rankIcon: Medal,
                rankColor: 'text-amber-600'
              },
              { 
                bg: 'bg-gradient-to-b from-indigo-50/20 to-white dark:from-indigo-950/15 dark:to-slate-900', 
                border: 'border-indigo-100 dark:border-indigo-900/30', 
                badge: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold', 
                rankText: language === 'km' ? 'លេខ ៤' : 'RANK 4', 
                ring: 'ring-indigo-400',
                rankIcon: Star,
                rankColor: 'text-indigo-400'
              },
              { 
                bg: 'bg-gradient-to-b from-indigo-50/20 to-white dark:from-indigo-950/15 dark:to-slate-900', 
                border: 'border-indigo-100 dark:border-indigo-900/30', 
                badge: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold', 
                rankText: language === 'km' ? 'លេខ ៥' : 'RANK 5', 
                ring: 'ring-indigo-400',
                rankIcon: Star,
                rankColor: 'text-indigo-400'
              },
            ];
            const cfg = colors[idx] || colors[4];

            return (
              <div
                key={item.student.id}
                className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex flex-col justify-between relative transition-all duration-200 hover:-translate-y-1 hover:shadow-xs`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${cfg.badge}`}>
                    #{idx + 1} {cfg.rankText}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalStudent({ student: item.student, rank: idx + 1 });
                    }}
                    title={language === 'km' ? 'បញ្ចូល ឬប្ដូររូបថត' : 'Upload or change photo'}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Avatar / Photo */}
                <div 
                  onClick={() => {
                    setSelectedStudentId(item.student.id);
                    setActiveTab('report_card');
                  }}
                  className="cursor-pointer text-center my-1.5"
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    {item.student.photoUrl ? (
                      <img 
                        src={item.student.photoUrl} 
                        alt={item.student.name}
                        className={`w-16 h-16 rounded-full object-cover shadow-xs border-2 border-white dark:border-slate-800 ring-2 ${cfg.ring}`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full bg-slate-800 dark:bg-slate-800 border-2 border-white dark:border-slate-700 ring-2 ${cfg.ring} flex items-center justify-center text-base font-bold font-heading text-white shadow-xs`}>
                        {item.student.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="text-sm font-bold truncate text-slate-900 dark:text-white tracking-tight" title={item.student.name}>
                    {item.student.name}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                    អត្តលេខ៖ {item.student.studentId}
                  </div>
                </div>

                {/* Scores & Badge */}
                <div 
                  onClick={() => {
                    setSelectedStudentId(item.student.id);
                    setActiveTab('report_card');
                  }}
                  className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{item.yearlyAverage} / 10</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {language === 'km' ? `និទ្ទេស ${item.letterGrade}` : `Grade ${item.letterGrade}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Chart 1: Subject Performance Averages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                {language === 'km' ? 'មធ្យមភាគតាមមុខវិជ្ជា' : 'Subject Performance Average'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {language === 'km' ? 'ពិន្ទុមធ្យមសរុបប្រចាំថ្នាក់តាមមុខវិជ្ជានីមួយៗ' : 'Overall class average score per subject'}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              ពិន្ទុពេញ៖ ១០
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="code" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} interval={0} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} / 10`, 'Average']}
                  labelFormatter={(code) => {
                    const item = subjectAverages.find(s => s.code === code);
                    return item ? item.name : code;
                  }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="average" fill="#312e81" radius={[6, 6, 0, 0]}>
                  {subjectAverages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Class Progress Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                {language === 'km' ? 'និន្នាការមធ្យមភាគប្រចាំខែ' : 'Monthly Progression Trend'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {language === 'km' ? 'ការប្រែប្រួលមធ្យមភាគពិន្ទុថ្នាក់តាមខែនីមួយៗ' : 'Class average score progression by month'}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              ឆមាសទី១ & ឆមាសទី២
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis domain={[5, 10]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} / 10`, 'Class Average']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#4f46e5' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Student Photo Modal */}
      {photoModalStudent && (
        <StudentPhotoModal
          student={photoModalStudent.student}
          rank={photoModalStudent.rank}
          isOpen={!!photoModalStudent}
          onClose={() => setPhotoModalStudent(null)}
        />
      )}

    </div>
  );
};
