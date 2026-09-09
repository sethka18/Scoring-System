import React, { useState, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { CurriculumLesson, Subject, TimetableSlot } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Award, 
  FileText, 
  Filter, 
  Search, 
  Info, 
  CheckSquare, 
  HelpCircle, 
  Flag,
  CalendarDays,
  Printer
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { 
  ACADEMIC_YEAR_2026_2027, 
  ACADEMIC_WEEKS_2026_2027, 
  OFFICIAL_TEACHING_EVENTS, 
  ACADEMIC_MONTHS, 
  getAcademicWeekForDate, 
  getSpecialEventsForDate, 
  formatKhmerFullDate,
  TeachingCalendarSpecialEvent
} from '../../data/teachingScheduleDates';

interface CurriculumTeachingCalendarProps {
  initialGrade?: number;
  initialSubjectId?: string;
}

export const CurriculumTeachingCalendar: React.FC<CurriculumTeachingCalendarProps> = ({
  initialGrade,
  initialSubjectId
}) => {
  const { 
    language, 
    activeClass, 
    schoolProfile, 
    subjects, 
    curriculumPrograms, 
    timetableSlots,
    updateCurriculumLesson,
    showToast 
  } = useGradebook();

  // Grade & Subject Selection
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade || activeClass?.gradeLevel || 6);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'sub_math');
  const [showAllSubjects, setShowAllSubjects] = useState<boolean>(false);

  // Month navigation: default to November 2026 (Opening of academic year)
  // Year: 2026, Month: 10 (0-indexed for November)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 = Nov

  // Selected Date for Lesson Inspector (default: 2026-11-02, the first teaching day)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-11-02');

  // Search filter for lessons
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Find curriculum programs for the selected grade
  const gradePrograms = useMemo(() => {
    return curriculumPrograms.filter(p => p.gradeLevel === selectedGrade);
  }, [curriculumPrograms, selectedGrade]);

  // Current active subject program
  const currentProgram = useMemo(() => {
    const direct = gradePrograms.find(p => p.subjectId === selectedSubjectId);
    if (direct) return direct;
    if (selectedGrade <= 3 && (selectedSubjectId === 'sub_social' || selectedSubjectId === 'sub_science')) {
      return gradePrograms.find(p => p.subjectId === 'sub_social' || p.subjectId === 'sub_science');
    }
    return gradePrograms[0];
  }, [gradePrograms, selectedSubjectId, selectedGrade]);

  // Timetable slots for the active class to see periods on that day
  const classTimetableSlots = useMemo(() => {
    return timetableSlots.filter(s => s.classId === activeClass?.id);
  }, [timetableSlots, activeClass]);

  // Calendar calculations for currentYear & currentMonth
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
  // Adjusted for Monday start: Mon=0, Tue=1, ..., Sat=5, Sun=6
  const startDayCol = (firstDayOfWeek + 6) % 7;

  // Month information
  const monthMeta = ACADEMIC_MONTHS.find(m => m.year === currentYear && m.month === currentMonth) || {
    nameKm: `ខែ ${currentMonth + 1} ឆ្នាំ ${currentYear}`,
    nameEn: `Month ${currentMonth + 1} ${currentYear}`,
    shortKm: `ខែ ${currentMonth + 1}`
  };

  const prevMonth = () => {
    const currentIdx = ACADEMIC_MONTHS.findIndex(m => m.year === currentYear && m.month === currentMonth);
    if (currentIdx > 0) {
      const target = ACADEMIC_MONTHS[currentIdx - 1];
      setCurrentYear(target.year);
      setCurrentMonth(target.month);
    } else {
      if (currentMonth === 0) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(11);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const nextMonth = () => {
    const currentIdx = ACADEMIC_MONTHS.findIndex(m => m.year === currentYear && m.month === currentMonth);
    if (currentIdx >= 0 && currentIdx < ACADEMIC_MONTHS.length - 1) {
      const target = ACADEMIC_MONTHS[currentIdx + 1];
      setCurrentYear(target.year);
      setCurrentMonth(target.month);
    } else {
      if (currentMonth === 11) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(0);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const jumpToOpeningMonth = () => {
    setCurrentYear(2026);
    setCurrentMonth(10); // Nov
    setSelectedDateStr('2026-11-01');
  };

  // Helper to find lessons for a specific date and subject
  const getLessonsForDate = (dateStr: string, subjectId?: string) => {
    const weekMapping = getAcademicWeekForDate(dateStr);
    if (!weekMapping) return [];

    const prog = subjectId 
      ? gradePrograms.find(p => p.subjectId === subjectId) 
      : currentProgram;

    if (!prog || !prog.lessons) return [];

    return prog.lessons.filter(l => l.weekNumber === weekMapping.weekNumber);
  };

  // Get all scheduled lessons across all core subjects for that date's academic week
  const getAllSubjectLessonsForDate = (dateStr: string) => {
    const weekMapping = getAcademicWeekForDate(dateStr);
    if (!weekMapping) return [];

    const result: { subject: Subject | undefined; lessons: CurriculumLesson[] }[] = [];
    
    gradePrograms.forEach(prog => {
      const sub = subjects.find(s => s.id === prog.subjectId);
      const matchedLessons = prog.lessons.filter(l => l.weekNumber === weekMapping.weekNumber);
      if (matchedLessons.length > 0) {
        result.push({
          subject: sub,
          lessons: matchedLessons
        });
      }
    });

    return result;
  };

  // Selected date details
  const selectedDateWeek = getAcademicWeekForDate(selectedDateStr);
  const selectedDateEvents = getSpecialEventsForDate(selectedDateStr);
  const selectedDateLessons = getLessonsForDate(selectedDateStr, showAllSubjects ? undefined : selectedSubjectId);
  const selectedAllLessons = getAllSubjectLessonsForDate(selectedDateStr);

  // Day of week for selected date (1 = Monday, ..., 6 = Saturday, 0 = Sunday)
  const selectedDateObj = new Date(selectedDateStr);
  const selectedDayOfWeekNum = selectedDateObj.getDay() === 0 ? 7 : selectedDateObj.getDay(); // 1=Mon..6=Sat
  const selectedDateSlots = classTimetableSlots.filter(s => s.dayOfWeek === selectedDayOfWeekNum && s.periodNumber > 0);

  const handleToggleLessonStatus = (programId: string, lessonId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'completed' ? 'upcoming' : currentStatus === 'in_progress' ? 'completed' : 'in_progress';
    updateCurriculumLesson(programId, lessonId, { status: nextStatus });
    showToast(language === 'km' ? 'បានកែប្រែស្ថានភាពមេរៀន' : 'Lesson status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1.5 shadow-lg shrink-0 flex items-center justify-center border border-white/20">
              <SchoolLogo size={56} customLogoUrl={schoolProfile?.logoUrl} />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase mb-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {language === 'km' 
                    ? 'ប្រតិទិនបង្រៀនផ្លូវការ MoEYS • ឆ្នាំសិក្សា ២០២៦-២០២៧' 
                    : 'MoEYS Academic Teaching Calendar 2026-2027'}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'km' 
                  ? `ប្រតិទិនបង្រៀនប្រចាំថ្ងៃ (ថ្នាក់ទី ${selectedGrade})` 
                  : `Teaching Calendar & Daily Lessons (Grade ${selectedGrade})`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                {language === 'km' 
                  ? 'ថ្ងៃបើកបវេសនកាល៖ ០១ វិច្ឆិកា ២០២៦ • តេស្តដើមឆ្នាំសិក្សា • ប្រឡងប្រចាំខែ • កម្មវិធី ៣៦ សប្តាហ៍' 
                  : 'Opening Date: Nov 01, 2026 • Diagnostic Assessment • Monthly Exams • 36-Week Plan'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              onClick={jumpToOpeningMonth}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
              title="ទៅកាន់ថ្ងៃបើកបវេសនកាល ០១ វិច្ឆិកា ២០២៦"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'km' ? 'បវេសនកាល (០១ វិច្ឆិកា)' : 'Opening (Nov 1)'}</span>
            </button>

            <PrintToPdfButton
              pageSize="a4"
              variant="outline"
              size="md"
              labelKm="បោះពុម្ពប្រតិទិន A4"
              labelEn="Print Calendar A4"
            />
          </div>
        </div>
      </div>

      {/* Grade Level, Subject Switcher & Month Navigation Bar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Top Controls: Grade Tabs & Quick Jump */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-black text-slate-500 uppercase shrink-0 mr-1">
              {language === 'km' ? 'កម្រិតថ្នាក់៖' : 'Grade:'}
            </span>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-slate-950 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'km' ? `ថ្នាក់ទី ${g}` : `Grade ${g}`}
              </button>
            ))}
          </div>

          {/* Academic Month Quick Selector Dropdown / Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-black text-slate-500 uppercase shrink-0">
              {language === 'km' ? 'ខែសិក្សា៖' : 'Month:'}
            </span>
            {ACADEMIC_MONTHS.map(m => {
              const isCurrent = m.year === currentYear && m.month === currentMonth;
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  onClick={() => {
                    setCurrentYear(m.year);
                    setCurrentMonth(m.month);
                    // Select 1st day of that month
                    const dayStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-02`;
                    setSelectedDateStr(dayStr);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isCurrent 
                      ? 'bg-indigo-950 text-white shadow-xs font-black' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m.shortKm}
                </button>
              );
            })}
          </div>
        </div>

        {/* Second Row: Subject Selector & View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-black text-slate-500 uppercase shrink-0 mr-1">
              {language === 'km' ? 'មុខវិជ្ជា៖' : 'Subject:'}
            </span>

            <button
              onClick={() => setShowAllSubjects(!showAllSubjects)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
                showAllSubjects
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'គ្រប់មុខវិជ្ជាទាំងអស់' : 'All Subjects'}</span>
            </button>

            {subjects
              .filter(sub => ['sub_khmer', 'sub_math', 'sub_social', 'sub_science'].includes(sub.id))
              .filter(sub => !(selectedGrade <= 3 && sub.id === 'sub_science'))
              .map(sub => {
                const isCombined = selectedGrade <= 3 && sub.id === 'sub_social';
                const isActive = !showAllSubjects && sub.id === selectedSubjectId;
                const displayName = isCombined
                  ? (language === 'km' ? 'សិក្សាសង្គម-វិទ្យាសាស្ត្រ' : 'Social & Science')
                  : (language === 'km' ? sub.nameKm : sub.nameEn);

                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      setShowAllSubjects(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs ring-2 ring-indigo-500'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                    <span>{displayName}</span>
                  </button>
                );
              })}
          </div>

          {/* Month Stepper Buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="ខែមុន"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-heading font-black text-sm text-slate-900 min-w-[140px] text-center">
              {language === 'km' ? monthMeta.nameKm : monthMeta.nameEn}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="ខែបន្ទាប់"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Day Teaching Inspector Hero Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg border border-indigo-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative z-10">
          {/* Left: Date & Academic Week Info */}
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black tracking-wide">
                {formatKhmerFullDate(selectedDateStr)}
              </span>

              {selectedDateWeek && (
                <span className="px-3 py-1 rounded-full bg-indigo-800/80 border border-indigo-400/40 text-indigo-100 text-xs font-black">
                  {language === 'km' 
                    ? `សប្តាហ៍ទី ${selectedDateWeek.weekNumber} (ឆមាស ${selectedDateWeek.semester})` 
                    : `Week ${selectedDateWeek.weekNumber} (Sem ${selectedDateWeek.semester})`}
                </span>
              )}

              {selectedDateStr === '2026-11-01' && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black animate-pulse flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ថ្ងៃបើកបវេសនកាលផ្លូវការ' : 'School Opening Day'}</span>
                </span>
              )}

              {selectedDateEvents.map(evt => (
                <span 
                  key={evt.id} 
                  className={`px-3 py-1 rounded-full ${evt.badgeBg} ${evt.badgeText} text-xs font-black flex items-center space-x-1 shadow-xs`}
                >
                  <span>{language === 'km' ? evt.titleKm : evt.titleEn}</span>
                </span>
              ))}
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-black text-white pt-1">
              {language === 'km' ? 'ផែនការបង្រៀនប្រចាំថ្ងៃ និងមេរៀនត្រូវរៀន' : 'Daily Teaching Plan & Lesson Targets'}
            </h2>

            <p className="text-xs text-indigo-200">
              {language === 'km' 
                ? 'ចុចលើថ្ងៃណាមួយក្នុងតារាងប្រតិទិនខាងក្រោម ដើម្បីមើលមេរៀនដែលត្រូវបង្រៀន គោលបំណង និងទំព័រសៀវភៅពុម្ពជាតិ។' 
                : 'Click any calendar date below to inspect teaching contents, learning objectives, and textbook pages.'}
            </p>

            {/* Scheduled Timetable Periods for this Day */}
            {selectedDateSlots.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-indigo-300 font-bold text-[11px]">
                  {language === 'km' ? 'ម៉ោងបង្រៀនថ្ងៃនេះ៖' : 'Class periods today:'}
                </span>
                {selectedDateSlots.map(slot => (
                  <span 
                    key={slot.id} 
                    className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-black text-[11px]"
                  >
                    ម៉ោងទី{slot.periodNumber}៖ {slot.customTitleKm || subjects.find(s => s.id === slot.subjectId)?.nameKm || 'មុខវិជ្ជា'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Milestone / Special Activity Notice */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-sm w-full space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-black uppercase">
              <Award className="w-4 h-4" />
              <span>{language === 'km' ? 'កាលវិភាគសំខាន់ប្រចាំសប្តាហ៍' : 'Weekly Academic Focus'}</span>
            </div>
            {selectedDateWeek ? (
              <div className="text-xs space-y-1">
                <p className="font-bold text-white text-sm">
                  {selectedDateWeek.noteKm}
                </p>
                <p className="text-indigo-200 text-[11px]">
                  កាលបរិច្ឆេទសប្តាហ៍៖ {selectedDateWeek.startDate} ដល់ {selectedDateWeek.endDate}
                </p>
                {selectedDateWeek.isDiagnosticWeek && (
                  <div className="p-2 rounded-xl bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[11px] font-bold mt-2">
                    {language === 'km' 
                      ? '✍️ សប្តាហ៍ធ្វើតេស្តដើមឆ្នាំសិក្សា ដើម្បីវាយតម្លៃសមត្ថភាពសិស្ស និងបែងចែកក្រុមរៀនយឺត។' 
                      : '✍️ Beginning of year baseline diagnostic testing week.'}
                  </div>
                )}
                {selectedDateWeek.isExamWeek && (
                  <div className="p-2 rounded-xl bg-sky-500/30 border border-sky-400/40 text-sky-200 text-[11px] font-bold mt-2">
                    {language === 'km' 
                      ? '📊 សប្តាហ៍ប្រឡង និងវាយតម្លៃប្រចាំខែ ៣ សម្បទា (វិជ្ជា, បំណិន, ចរិយា)។' 
                      : '📊 Monthly continuous assessment & scoring week.'}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">
                {language === 'km' ? 'ថ្ងៃឈប់សម្រាក ឬក្រៅសប្តាហ៍សិក្សាផ្លូវការ' : 'Break or weekend'}
              </p>
            )}
          </div>
        </div>

        {/* Lessons List for Selected Day */}
        <div className="mt-6 pt-5 border-t border-white/15">
          {/* Thursday Special MoEYS Notice */}
          {selectedDayOfWeekNum === 4 ? (
            <div className="mb-4 bg-amber-500/20 border border-amber-400/50 rounded-2xl p-4 text-white">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <h4 className="font-heading font-black text-amber-300 text-sm sm:text-base">
                      {language === 'km' 
                        ? '✨ ថ្ងៃព្រហស្បតិ៍ ៖ មិនបង្រៀនមេរៀនតទេ (គោលការណ៍ក្រសួងអប់រំ យុវជន និងកីឡា)' 
                        : '✨ Thursday: Non-Curriculum Day (MoEYS Official Standard)'}
                    </h4>
                    <p className="text-amber-100/90 text-[11px] mt-0.5">
                      {language === 'km' 
                        ? 'ថ្ងៃព្រហស្បតិ៍ មិនមានការបង្រៀនមេរៀនបន្តតាមសៀវភៅពុម្ពទេ ដោយទុកពេលសម្រាប់ពង្រឹងសមត្ថភាពសិស្ស និងកិច្ចការបច្ចេកទេសសាលា៖' 
                        : 'Thursdays are dedicated to local life skills, arts, remedial learning, and school technical meetings:'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-xl bg-black/30 border border-amber-400/30">
                      <p className="font-black text-amber-300 text-[11px]">
                        {language === 'km' ? 'ម៉ោងទី ១ ដល់ ទី ៣ (៣ ម៉ោងសិក្សា)' : 'Periods 1 to 3 (3 Hours)'}
                      </p>
                      <p className="text-white font-bold text-xs mt-0.5">
                        {selectedGrade <= 3 
                          ? 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត' 
                          : 'បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ / ជួយសិស្សរៀនយឺត និងភាសាបរទេស'}
                      </p>
                      <p className="text-slate-300 text-[10px] mt-0.5">
                        ពេលព្រឹក៖ ០៧:១០ - ០៩:២៥ • ពេលរសៀល៖ ១៣:០០ - ១៥:១៥
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/30 border border-amber-400/30">
                      <p className="font-black text-amber-300 text-[11px]">
                        {language === 'km' ? 'ម៉ោងទី ៤ ដល់ ទី ៥ (២ ម៉ោងសិក្សា)' : 'Periods 4 to 5 (2 Hours)'}
                      </p>
                      <p className="text-white font-bold text-xs mt-0.5">
                        ប្រជុំបច្ចេកទេសគរុកោសល្យគ្រូ / សិស្សធ្វើពលកម្មសម្អាតបរិស្ថាន
                      </p>
                      <p className="text-slate-300 text-[10px] mt-0.5">
                        ពេលព្រឹក៖ ០៩:៤០ - ១១:០០ • ពេលរសៀល៖ ១៥:៣០ - ១៦:៥០
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-3 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'km' 
                ? (selectedDayOfWeekNum === 4 
                    ? `កម្មវិធីមេរៀនប្រចាំសប្តាហ៍នេះ (សម្រាប់ថ្ងៃចន្ទ អង្គារ ពុធ សុក្រ សៅរ៍)` 
                    : `មេរៀនត្រូវបង្រៀនក្នុងសប្តាហ៍នេះ (${showAllSubjects ? 'គ្រប់មុខវិជ្ជា' : currentProgram?.titleKm || 'មុខវិជ្ជា'})`)
                : 'Lessons scheduled for this week'}
            </span>
          </h3>

          {showAllSubjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedAllLessons.map(({ subject, lessons }) => (
                <div 
                  key={subject?.id || 'all'} 
                  className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-2.5"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subject?.color || '#6366f1' }} />
                    <h4 className="font-extrabold text-xs text-white uppercase">{subject?.nameKm}</h4>
                  </div>
                  {lessons.map(lesson => (
                    <div key={lesson.id} className="text-xs space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/10">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-amber-300">{lesson.chapterKm}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono">
                          {lesson.hoursCount} ម៉ោង
                        </span>
                      </div>
                      <p className="text-white text-[11px] font-semibold">{lesson.lessonTitleKm}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-indigo-200 pt-0.5 font-mono">
                        {lesson.pageSs && <span>សៀវភៅសិស្ស (សស)៖ ទំព័រ {lesson.pageSs}</span>}
                        {lesson.pageSk && <span>• សៀវភៅគ្រូ (សក)៖ ទំព័រ {lesson.pageSk}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : selectedDateLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDateLessons.map(lesson => {
                const isCompleted = lesson.status === 'completed';
                const isInProgress = lesson.status === 'in_progress';

                return (
                  <div 
                    key={lesson.id} 
                    className="bg-white/10 hover:bg-white/15 transition rounded-2xl p-4 border border-white/15 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-black text-amber-300">
                          {lesson.chapterKm || `មេរៀនទី ${lesson.lessonNumber}`}
                          {lesson.subLessonCode && ` (${lesson.subLessonCode})`}
                        </span>
                        <h4 className="font-extrabold text-sm text-white mt-0.5">
                          {language === 'km' ? lesson.lessonTitleKm : lesson.lessonTitleEn}
                        </h4>
                      </div>

                      <button
                        onClick={() => currentProgram && handleToggleLessonStatus(currentProgram.id, lesson.id, lesson.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black transition cursor-pointer shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isInProgress
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {isCompleted 
                          ? (language === 'km' ? '✓ បង្រៀនរួច' : 'Done') 
                          : isInProgress 
                          ? (language === 'km' ? 'កំពុងបង្រៀន' : 'Teaching') 
                          : (language === 'km' ? 'មិនទាន់' : 'Upcoming')}
                      </button>
                    </div>

                    {lesson.objectivesKm && (
                      <p className="text-[11px] text-slate-200 line-clamp-2">
                        {language === 'km' ? lesson.objectivesKm : lesson.objectivesEn}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-indigo-200 border-t border-white/10 font-mono">
                      {lesson.pageSs && (
                        <span className="bg-white/10 px-2 py-0.5 rounded">
                          ទំព័រសៀវភៅសិស្ស (សស)៖ <strong className="text-white">{lesson.pageSs}</strong>
                        </span>
                      )}
                      {lesson.pageSk && (
                        <span className="bg-white/10 px-2 py-0.5 rounded">
                          ទំព័រសៀវភៅគ្រូ (សក)៖ <strong className="text-white">{lesson.pageSk}</strong>
                        </span>
                      )}
                      <span className="bg-white/10 px-2 py-0.5 rounded">
                        ម៉ោងបង្រៀន៖ <strong className="text-white">{lesson.hoursCount} ម៉ោង</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl p-4 text-center text-xs text-indigo-200 italic">
              {language === 'km' 
                ? 'មិនមានមេរៀនត្រូវបានកំណត់ក្នុងកាលវិភាគសម្រាប់ថ្ងៃនេះទេ' 
                : 'No lessons scheduled for this day.'}
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Monthly Teaching Calendar Grid */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-sm p-6 sm:p-8 text-slate-900 print:border-none print:shadow-none print:p-2">
        {/* Printable Official Header */}
        <div className="pb-5 border-b-2 border-slate-900 mb-6">
          <div className="flex justify-between items-start text-xs font-semibold text-slate-800 mb-3">
            <div className="text-left flex items-start space-x-3">
              <SchoolLogo size={48} customLogoUrl={schoolProfile?.logoUrl} />
              <div className="space-y-0.5">
                <p className="font-black text-slate-950 text-xs">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="text-slate-700 font-bold text-[11px]">{schoolProfile?.province || 'ខេត្តកំពង់ចាម'} • {schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                <p className="text-indigo-950 font-black text-xs">{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង'}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-950 text-xs">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="font-bold text-slate-700 text-[11px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <p className="text-xs text-amber-700 select-none">❖ ❖ ❖</p>
            </div>
          </div>

          <div className="text-center pt-1">
            <h2 className="font-heading font-black text-base sm:text-xl text-slate-950 uppercase tracking-wide">
              {language === 'km' 
                ? `ប្រតិទិនបង្រៀនប្រចាំខែ ${monthMeta.nameKm} (ថ្នាក់ទី ${selectedGrade})` 
                : `MONTHLY TEACHING SCHEDULE: ${monthMeta.nameEn} (GRADE ${selectedGrade})`}
            </h2>
            <p className="text-xs font-bold text-indigo-900 mt-0.5">
              {language === 'km' 
                ? `ឆ្នាំសិក្សា ${ACADEMIC_YEAR_2026_2027.academicYear} • ថ្ងៃបើកបវេសនកាល៖ ${ACADEMIC_YEAR_2026_2027.openingDateKm}` 
                : `Academic Year ${ACADEMIC_YEAR_2026_2027.academicYear} • Opening Date: Nov 01, 2026`}
            </p>
          </div>
        </div>

        {/* Calendar Day Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-black text-xs uppercase mb-2">
          {['ច័ន្ទ (Mon)', 'អង្គារ (Tue)', 'ពុធ (Wed)', 'ព្រហស្បតិ៍ (Thu)', 'សុក្រ (Fri)', 'សៅរ៍ (Sat)', 'អាទិត្យ (Sun)'].map((dayHeader, idx) => (
            <div 
              key={dayHeader} 
              className={`py-2 rounded-xl text-xs font-black ${
                idx === 6 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              {dayHeader}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDayCol }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[105px] rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 opacity-40" />
          ))}

          {/* Actual days of month */}
          {Array.from({ length: daysInMonth }).map((_, dIdx) => {
            const dayNum = dIdx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDateStr === dateStr;
            const isOpeningDay = dateStr === '2026-11-01';

            // Find events for this date
            const events = getSpecialEventsForDate(dateStr);
            const weekMapping = getAcademicWeekForDate(dateStr);
            const dayLessons = getLessonsForDate(dateStr, showAllSubjects ? undefined : selectedSubjectId);
            
            // Check day of week (0=Sunday, 6=Saturday)
            const cellDate = new Date(currentYear, currentMonth, dayNum);
            const isSunday = cellDate.getDay() === 0;

            const isDiagTest = events.some(e => e.category === 'diagnostic');
            const isMonthlyExam = events.some(e => e.category === 'monthly_exam');
            const isSemesterExam = events.some(e => e.category === 'semester_exam');
            const isHoliday = events.some(e => e.category === 'holiday');

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`min-h-[110px] sm:min-h-[120px] rounded-2xl p-2 transition-all cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'ring-3 ring-indigo-600 bg-indigo-50/60 border-indigo-400 shadow-md'
                    : isOpeningDay
                    ? 'bg-amber-50/90 border-amber-400 shadow-xs'
                    : isDiagTest
                    ? 'bg-purple-50/60 border-purple-300 hover:bg-purple-50'
                    : isMonthlyExam
                    ? 'bg-sky-50/70 border-sky-300 hover:bg-sky-50'
                    : isSemesterExam
                    ? 'bg-rose-50/70 border-rose-300 hover:bg-rose-50'
                    : isHoliday
                    ? 'bg-orange-50/60 border-orange-300'
                    : isSunday
                    ? 'bg-slate-50/60 border-slate-200 text-slate-500'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
              >
                {/* Date Header: Day Number + Badges */}
                <div className="flex items-start justify-between">
                  <span className={`text-xs sm:text-sm font-black w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected 
                      ? 'bg-indigo-950 text-white' 
                      : isOpeningDay
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : isSunday
                      ? 'text-rose-600'
                      : 'text-slate-900'
                  }`}>
                    {dayNum}
                  </span>

                  {weekMapping && !isSunday && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      សប្តាហ៍ {weekMapping.weekNumber}
                    </span>
                  )}
                </div>

                {/* Event Badges */}
                <div className="space-y-1 my-1">
                  {isOpeningDay && (
                    <span className="block text-center text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow-2xs">
                      🌟 បើកបវេសនកាល
                    </span>
                  )}

                  {events.map(evt => (
                    <span 
                      key={evt.id} 
                      className={`block truncate text-[9px] font-black px-1.5 py-0.5 rounded ${evt.badgeBg} ${evt.badgeText} shadow-2xs`}
                      title={evt.titleKm}
                    >
                      {evt.category === 'diagnostic' ? '✍️ ' : evt.category === 'monthly_exam' ? '📊 ' : ''}
                      {evt.titleKm}
                    </span>
                  ))}
                </div>

                {/* Thursday vs Lesson Preview Pill */}
                {cellDate.getDay() === 4 ? (
                  <div className="pt-1 border-t border-amber-200">
                    <span className="block text-center text-[9px] font-black px-1 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 truncate">
                      🛠️ មិនបង្រៀនមេរៀនត
                    </span>
                    <p className="text-[8px] sm:text-[9px] text-amber-800 font-bold text-center mt-0.5 truncate">
                      {selectedGrade <= 3 ? 'បំណិន • ជួយសិស្ស • ប្រជុំ' : 'បំណិន • ភាសា • ប្រជុំ'}
                    </p>
                  </div>
                ) : !isSunday && dayLessons.length > 0 ? (
                  <div className="space-y-0.5 pt-1 border-t border-slate-200/60">
                    {dayLessons.slice(0, 2).map(lesson => (
                      <p 
                        key={lesson.id} 
                        className="text-[10px] font-bold text-slate-800 truncate"
                        title={lesson.lessonTitleKm}
                      >
                        • {lesson.chapterKm || lesson.lessonTitleKm}
                      </p>
                    ))}
                    {dayLessons.length > 2 && (
                      <span className="text-[9px] text-indigo-600 font-bold">
                        +{dayLessons.length - 2} មេរៀនទៀត
                      </span>
                    )}
                  </div>
                ) : null}

                {isSunday && !isOpeningDay && (
                  <span className="text-[10px] text-slate-400 italic text-center block pt-1">
                    {language === 'km' ? 'ថ្ងៃឈប់សម្រាក' : 'Weekend'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend / Key Milestones for MoEYS Guidelines */}
        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0" />
            <span className="font-bold text-slate-800">
              {language === 'km' ? 'បើកបវេសនកាល (០១ វិច្ឆិកា)' : 'Opening Day (Nov 1)'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-purple-600 shrink-0" />
            <span className="font-bold text-slate-800">
              {language === 'km' ? 'តេស្តដើមឆ្នាំសិក្សា' : 'Diagnostic Assessment'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-sky-600 shrink-0" />
            <span className="font-bold text-slate-800">
              {language === 'km' ? 'ប្រឡងប្រចាំខែ' : 'Monthly Exams'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-200 border border-amber-400 shrink-0" />
            <span className="font-bold text-slate-800">
              {language === 'km' ? 'ព្រហស្បតិ៍ (មិនបង្រៀនត)' : 'Thursday (Non-Curriculum)'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 shrink-0" />
            <span className="font-bold text-slate-800">
              {language === 'km' ? 'ប្រឡងឆមាស & បញ្ចប់ឆ្នាំ' : 'Semester & Year-End Exams'}
            </span>
          </div>
        </div>

        {/* Signature Footer */}
        <div className="grid grid-cols-2 pt-8 mt-6 text-xs text-slate-900 border-t border-slate-300">
          <div className="text-center space-y-1">
            <p className="font-bold">{language === 'km' ? 'បានពិនិត្យ និងអនុម័ត' : 'Approved by'}</p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'នាយកសាលា' : 'School Principal'}</p>
            <div className="h-14 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា និងត្រា)</span>
            </div>
            <p className="font-extrabold text-slate-900">{schoolProfile?.principalNameKm || 'លោក ផាត ថា'}</p>
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-600 text-[11px]">
              {schoolProfile?.province ? `${schoolProfile.province}, ` : ''}{language === 'km' ? 'ថ្ងៃទី០១ ខែវិច្ឆិកា ឆ្នាំ២០២៦' : 'November 01, 2026'}
            </p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Class Teacher'}</p>
            <div className="h-14 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា)</span>
            </div>
            <p className="font-extrabold text-slate-900">{activeClass?.teacherNameKm || activeClass?.teacherName || 'គ្រូបន្ទុកថ្នាក់'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
