import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { CurriculumProgram, CurriculumLesson, Subject } from '../../types';
import { 
  BookOpen, 
  Upload, 
  Calendar, 
  CalendarDays,
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  Search, 
  Edit3, 
  Share2, 
  TrendingUp,
  FileCheck2,
  ListTodo,
  RotateCcw
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { CurriculumUploadModal } from './CurriculumUploadModal';
import { CurriculumTeachingCalendar } from './CurriculumTeachingCalendar';

export const CurriculumProgramHub: React.FC = () => {
  const { 
    language, 
    activeClass, 
    schoolProfile,
    subjects, 
    curriculumPrograms, 
    updateCurriculumLesson, 
    syncCurriculumToCalendar,
    resetCurriculumToMoEYS,
    showToast 
  } = useGradebook();

  const [activeHubTab, setActiveHubTab] = useState<'calendar' | 'table'>('calendar');
  const [selectedGrade, setSelectedGrade] = useState<number>(activeClass?.gradeLevel || 6);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub_math');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Find or select program with combined 1-3 support
  const currentProgram = curriculumPrograms.find(
    p => p.gradeLevel === selectedGrade && p.subjectId === selectedSubjectId
  ) || (selectedGrade <= 3 && (selectedSubjectId === 'sub_science' || selectedSubjectId === 'sub_social') ? curriculumPrograms.find(
    p => p.gradeLevel === selectedGrade && (p.subjectId === 'sub_social' || p.subjectId === 'sub_science')
  ) : undefined) || curriculumPrograms.find(
    p => p.gradeLevel === selectedGrade
  ) || curriculumPrograms.find(
    p => p.subjectId === selectedSubjectId
  ) || curriculumPrograms[0];

  const rawSubject = subjects.find(s => s.id === selectedSubjectId);
  const currentSubject = selectedGrade <= 3 && (selectedSubjectId === 'sub_social' || selectedSubjectId === 'sub_science')
    ? {
        ...rawSubject,
        id: 'sub_social',
        nameKm: 'សិក្សាសង្គម-វិទ្យាសាស្ត្រ',
        nameEn: 'Social Studies & Science (Combined)',
        color: '#f59e0b'
      }
    : rawSubject;

  // Filter lessons
  const lessons = currentProgram ? currentProgram.lessons.filter(l => {
    if (selectedSemester !== 'all' && l.semester !== selectedSemester) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchKm = l.lessonTitleKm?.toLowerCase().includes(q) || l.chapterKm?.toLowerCase().includes(q) || l.objectivesKm?.toLowerCase().includes(q);
      const matchEn = l.lessonTitleEn?.toLowerCase().includes(q) || l.objectivesEn?.toLowerCase().includes(q);
      if (!matchKm && !matchEn) return false;
    }
    return true;
  }) : [];

  // Metrics
  const totalLessons = currentProgram ? currentProgram.lessons.length : 0;
  const completedLessons = currentProgram ? currentProgram.lessons.filter(l => l.status === 'completed').length : 0;
  const inProgressLessons = currentProgram ? currentProgram.lessons.filter(l => l.status === 'in_progress').length : 0;
  const totalHours = currentProgram ? currentProgram.lessons.reduce((sum, l) => sum + (l.hoursCount || 0), 0) : 0;
  const completedHours = currentProgram ? currentProgram.lessons.filter(l => l.status === 'completed').reduce((sum, l) => sum + (l.hoursCount || 0), 0) : 0;
  
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleToggleStatus = (lessonId: string, currentStatus?: string) => {
    if (!currentProgram) return;
    const nextStatus = currentStatus === 'completed' ? 'upcoming' : currentStatus === 'in_progress' ? 'completed' : 'in_progress';
    updateCurriculumLesson(currentProgram.id, lessonId, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / MoEYS Curriculum Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1.5 shadow-lg shrink-0 flex items-center justify-center border border-white/20">
              <SchoolLogo size={56} customLogoUrl={schoolProfile?.logoUrl} />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-1.5">
                <span>{language === 'km' ? 'កម្មវិធីសិក្សាលម្អិតថ្នាក់ជាតិ (MoEYS National Syllabus)' : 'MoEYS Official Primary Curriculum'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'km' 
                  ? `កម្មវិធីសិក្សា និងផែនការបង្រៀន (ថ្នាក់ទី ${selectedGrade})` 
                  : `Curriculum & Lesson Planning (Grade ${selectedGrade})`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                {language === 'km' 
                  ? `ផែនការបង្រៀន ៣៦ សប្តាហ៍ • អនុវត្តតាមសៀវភៅគោល និងគោលបំណងរបស់ក្រសួងអប់រំ` 
                  : `36-Week standard lesson plan • Aligned with MoEYS national primary learning objectives`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => resetCurriculumToMoEYS()}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs shadow-md transition cursor-pointer border border-slate-700"
              title={language === 'km' ? 'ផ្ទុកឡើងវិញនូវកម្មវិធីសិក្សាគណិតវិទ្យាផ្លូវការ MoEYS' : 'Reload official MoEYS syllabus'}
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>{language === 'km' ? 'កម្មវិធី MoEYS ផ្លូវការ' : 'Reload MoEYS'}</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{language === 'km' ? 'បញ្ចូលកម្មវិធីសិក្សាថ្មី' : 'Upload Syllabus'}</span>
            </button>

            {currentProgram && (
              <button
                onClick={() => syncCurriculumToCalendar(currentProgram.id)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'km' ? 'បញ្ចូលទៅក្នុងប្រតិទិនសាលា' : 'Sync to Calendar'}</span>
              </button>
            )}

            <PrintToPdfButton
              pageSize="a4"
              variant="outline"
              size="md"
              labelKm="បោះពុម្ពកម្មវិធីសិក្សា A4"
              labelEn="Print Syllabus A4"
            />
          </div>
        </div>
      </div>

      {/* View Switcher: Calendar View vs 36-Week Table View */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveHubTab('calendar')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-heading text-xs font-black transition-all cursor-pointer ${
              activeHubTab === 'calendar'
                ? 'bg-indigo-950 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span>{language === 'km' ? 'ប្រតិទិនបង្រៀនប្រចាំថ្ងៃ (Teaching Calendar)' : 'Teaching Calendar'}</span>
          </button>

          <button
            onClick={() => setActiveHubTab('table')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-heading text-xs font-black transition-all cursor-pointer ${
              activeHubTab === 'table'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>{language === 'km' ? 'តារាងកម្មវិធីសិក្សា ៣៦ សប្តាហ៍ (Syllabus Table)' : '36-Week Syllabus Table'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>{language === 'km' ? 'បវេសនកាល៖ ០១ វិច្ឆិកា ២០២៦ • តេស្តដើមឆ្នាំ • ប្រឡងប្រចាំខែ' : 'Opening: Nov 01, 2026 • Diagnostic • Exams'}</span>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {activeHubTab === 'calendar' && (
        <CurriculumTeachingCalendar 
          initialGrade={selectedGrade} 
          initialSubjectId={selectedSubjectId} 
        />
      )}

      {/* SYLLABUS TABLE VIEW */}
      {activeHubTab === 'table' && (
        <>
          {/* Grade Selector & Subject Switcher */}
          <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Grade Level Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-black text-slate-500 uppercase shrink-0 mr-1">
              {language === 'km' ? 'កម្រិតថ្នាក់៖' : 'Grade:'}
            </span>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGrade(g);
                  // Check if current subject exists in this grade, if not pick first matching
                  const hasCurrentSub = curriculumPrograms.some(p => p.gradeLevel === g && p.subjectId === selectedSubjectId);
                  if (!hasCurrentSub) {
                    const altProgram = curriculumPrograms.find(p => p.gradeLevel === g);
                    if (altProgram) setSelectedSubjectId(altProgram.subjectId);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'km' ? `ថ្នាក់ទី ${g}` : `Grade ${g}`}
              </button>
            ))}
          </div>

          {/* Semester Selector */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedSemester('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedSemester === 'all' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {language === 'km' ? 'ទាំងពីរឆមាស' : 'All Semesters'}
            </button>
            <button
              onClick={() => setSelectedSemester(1)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedSemester === 1 ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {language === 'km' ? 'ឆមាសទី១ (សប្តាហ៍ ១-១៨)' : 'Semester 1 (W1-18)'}
            </button>
            <button
              onClick={() => setSelectedSemester(2)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedSemester === 2 ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {language === 'km' ? 'ឆមាសទី២ (សប្តាហ៍ ១៩-៣៦)' : 'Semester 2 (W19-36)'}
            </button>
          </div>
        </div>

        {/* Subjects Row & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-black text-slate-500 uppercase shrink-0 mr-1">
              {language === 'km' ? 'មុខវិជ្ជា៖' : 'Subject:'}
            </span>
            {subjects
              .filter(sub => ['sub_khmer', 'sub_math', 'sub_social', 'sub_science'].includes(sub.id))
              .filter(sub => !(selectedGrade <= 3 && sub.id === 'sub_science'))
              .map(sub => {
                const isCombinedSocSci = selectedGrade <= 3 && sub.id === 'sub_social';
                const isActive = sub.id === selectedSubjectId || (isCombinedSocSci && selectedSubjectId === 'sub_science');
                const hasProgram = isCombinedSocSci
                  ? curriculumPrograms.some(p => p.gradeLevel === selectedGrade && (p.subjectId === 'sub_social' || p.subjectId === 'sub_science'))
                  : curriculumPrograms.some(p => p.gradeLevel === selectedGrade && p.subjectId === sub.id);

                const displayName = isCombinedSocSci
                  ? (language === 'km' ? 'សិក្សាសង្គម-វិទ្យាសាស្ត្រ' : 'Social Studies & Science')
                  : (language === 'km' ? sub.nameKm : sub.nameEn);

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-indigo-900 text-white shadow-xs ring-2 ring-indigo-900/10'
                        : hasProgram 
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                    <span>{displayName}</span>
                    {isCombinedSocSci && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-black">
                        {language === 'km' ? 'ក្បាលរួម' : 'Combined'}
                      </span>
                    )}
                    {hasProgram && !isCombinedSocSci && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="មានកម្មវិធីសិក្សា" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'km' ? 'ស្វែងរកមេរៀន / ជំពូក / កូដ...' : 'Search lessons...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* MoEYS Subject Specific Guidelines Notice */}
        {selectedGrade <= 3 && (selectedSubjectId === 'sub_social' || selectedSubjectId === 'sub_science') && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <span className="text-lg shrink-0">📘</span>
              <div className="space-y-0.5">
                <p className="font-extrabold text-amber-950">
                  {language === 'km' ? 'សម្គាល់កម្មវិធីសិក្សាក្រសួងអប់រំ ថ្នាក់ទី១ ដល់ ថ្នាក់ទី៣ (សៀវភៅក្បាលរួមគ្នា)៖' : 'MoEYS Primary Curriculum Policy for Grades 1-3:'}
                </p>
                <p className="text-amber-900 leading-relaxed text-[11px]">
                  {language === 'km' 
                    ? 'សម្រាប់ថ្នាក់ទី១ ដល់ទី៣ មុខវិជ្ជា «សិក្សាសង្គម» និង «វិទ្យាសាស្ត្រ» គឺចងក្រងរួមគ្នាក្នុងសៀវភៅតែមួយ «សិក្សាសង្គម-វិទ្យាសាស្ត្រ» ស្របតាមបំណែងចែកកម្មវិធីសិក្សារបស់ក្រសួងអប់រំ យុវជន និងកីឡា។ ដោយឡែកសម្រាប់ថ្នាក់ទី៤ ដល់ទី៦ មុខវិជ្ជាទាំងពីរត្រូវបានបែងចែកដាច់ដោយឡែកពីគ្នា (សិក្សាសង្គម ១ក្បាល និង វិទ្យាសាស្ត្រ ១ក្បាលផ្សេងគ្នា)។' 
                    : 'For Grades 1 to 3, Social Studies and Science are combined into a single textbook ("Social Studies - Science") in accordance with MoEYS regulations. Grades 4 through 6 have separate dedicated textbooks and distinct curricula.'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-200 text-amber-950 font-black text-[10px] shrink-0 uppercase">
              {language === 'km' ? 'សៀវភៅរួមគ្នា' : 'Single Book'}
            </span>
          </div>
        )}

        {selectedGrade >= 4 && selectedSubjectId === 'sub_science' && (
          <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 text-xs text-purple-950 flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <span className="text-lg shrink-0">🔬</span>
              <div className="space-y-0.5">
                <p className="font-extrabold text-purple-950">
                  {language === 'km' ? `កម្មវិធីសិក្សាវិទ្យាសាស្ត្រ ថ្នាក់ទី ${selectedGrade} (MoEYS ផ្លូវការ ៣៦ សប្តាហ៍)៖` : `Official MoEYS Science Curriculum for Grade ${selectedGrade}:`}
                </p>
                <p className="text-purple-900 leading-relaxed text-[11px]">
                  {language === 'km'
                    ? `មុខវិជ្ជាវិទ្យាសាស្ត្រថ្នាក់ទី ${selectedGrade} ត្រូវបានបំបែកចេញពីសិក្សាសង្គមជាផ្លូវការ រួមបញ្ចូលជំពូករុក្ខជាតិ សត្វ បរិស្ថាន សុខភាព រូបធាតុ ថាមពល និងលំហ ពេញលេញ ៣៦ សប្តាហ៍ យោងតាមបំណែងចែកកម្មវិធីសិក្សាក្រសួងអប់រំ យុវជន និងកីឡា។`
                    : `Grade ${selectedGrade} Science is an independent subject separated from Social Studies, covering biology, ecology, health, matter, energy, and space across 36 academic weeks.`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-purple-200 text-purple-950 font-black text-[10px] shrink-0 uppercase">
              {language === 'km' ? 'មុខវិជ្ជាដាច់ដោយឡែក' : 'Separate Subject'}
            </span>
          </div>
        )}

        {selectedGrade >= 4 && selectedSubjectId === 'sub_social' && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <span className="text-lg shrink-0">🏛️</span>
              <div className="space-y-0.5">
                <p className="font-extrabold text-amber-950">
                  {language === 'km' ? `កម្មវិធីសិក្សាសិក្សាសង្គម ថ្នាក់ទី ${selectedGrade} (MoEYS ផ្លូវការ ៣៦ សប្តាហ៍)៖` : `Official MoEYS Social Studies Curriculum for Grade ${selectedGrade}:`}
                </p>
                <p className="text-amber-900 leading-relaxed text-[11px]">
                  {language === 'km'
                    ? `មុខវិជ្ជាសិក្សាសង្គមថ្នាក់ទី ${selectedGrade} ត្រូវបានបំបែកចេញពីវិទ្យាសាស្ត្រជាផ្លូវការ រួមបញ្ចូលប្រវត្តិវិទ្យា ភូមិវិទ្យា សីលធម៌-ពលរដ្ឋ និងគេហវិទ្យា ពេញលេញ ៣៦ សប្តាហ៍ យោងតាមបំណែងចែកកម្មវិធីសិក្សាក្រសួងអប់រំ យុវជន និងកីឡា។`
                    : `Grade ${selectedGrade} Social Studies is an independent subject separated from Science, covering history, geography, civics, and home economics.`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-200 text-amber-950 font-black text-[10px] shrink-0 uppercase">
              {language === 'km' ? 'មុខវិជ្ជាដាច់ដោយឡែក' : 'Separate Subject'}
            </span>
          </div>
        )}
      </div>

      {/* Progress & Overview Metric Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              {language === 'km' ? 'វឌ្ឍនភាពកម្មវិធីសិក្សា' : 'Curriculum Coverage'}
            </p>
            <h3 className="text-2xl font-black text-indigo-950 mt-1">{completionPercentage}%</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {completedLessons} / {totalLessons} {language === 'km' ? 'មេរៀនបានបង្រៀន' : 'lessons completed'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Completed Hours */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              {language === 'km' ? 'ម៉ោងបង្រៀនសរុប' : 'Total Teaching Hours'}
            </p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{totalHours} <span className="text-xs font-bold text-slate-500">{language === 'km' ? 'ម៉ោង' : 'hrs'}</span></h3>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              {completedHours} {language === 'km' ? 'ម៉ោងបានអនុវត្តចប់' : 'hours delivered'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Active Lessons */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              {language === 'km' ? 'មេរៀនកំពុងបង្រៀន' : 'In-Progress Units'}
            </p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{inProgressLessons}</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {language === 'km' ? 'កំពុងបង្រៀនក្នុងសប្តាហ៍នេះ' : 'Active this week'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Standard Alignment */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              {language === 'km' ? 'ស្តង់ដារក្រសួង MoEYS' : 'MoEYS Standard'}
            </p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">១០០%</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {language === 'km' ? 'ស្របតាមសៀវភៅពុម្ពជាតិ' : 'National Standard Validated'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Lessons Table / Timeline */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-sm p-6 sm:p-8 text-slate-900 print:border-none print:shadow-none print:p-2">
        {/* Printable Official Header */}
        <div className="pb-5 border-b-2 border-slate-900 mb-6">
          <div className="flex justify-between items-start text-xs font-semibold text-slate-800 mb-4">
            <div className="text-left flex items-start space-x-3">
              <SchoolLogo size={52} customLogoUrl={schoolProfile?.logoUrl} />
              <div className="space-y-0.5">
                <p className="font-extrabold text-slate-950 text-xs sm:text-sm">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="text-slate-700 font-bold text-[11px]">មន្ទីរអប់រំ យុវជន និងកីឡា{schoolProfile?.province || 'ខេត្តកំពង់ចាម'}</p>
                <p className="text-slate-700 font-bold text-[11px]">ការិយាល័យអប់រំ យុវជន និងកីឡា{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                <p className="text-indigo-950 font-black text-xs">{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង'}</p>
                <p className="text-slate-500 font-medium text-[10px]">
                  {schoolProfile?.village || 'ភូមិប្រទង'} {schoolProfile?.commune || 'ឃុំអូរម្លូ'} {schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'} {schoolProfile?.province || 'ខេត្តកំពង់ចាម'}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-900 text-xs sm:text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="font-bold text-slate-700 text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-1" />
            </div>
          </div>

          <div className="text-center pt-2">
            <h2 className="font-heading font-black text-lg sm:text-2xl text-slate-950 uppercase tracking-wide">
              {currentProgram?.titleKm || (language === 'km' 
                ? `តារាងបែងចែកកម្មវិធីសិក្សាប្រចាំឆ្នាំ៖ ${currentSubject?.nameKm || 'គណិតវិទ្យា'}` 
                : `Annual Curriculum & Lesson Plan: ${currentSubject?.nameEn || 'Mathematics'}`)}
            </h2>
            <p className="text-xs font-bold text-indigo-900 mt-1 uppercase">
              {language === 'km' 
                ? `កម្រិតថ្នាក់ទី ${selectedGrade} • ឆ្នាំសិក្សា ${schoolProfile?.academicYear || '២០២៦-២០២៧'}` 
                : `Grade ${selectedGrade} • Academic Year ${schoolProfile?.academicYear || '២០២៦-២០២៧'}`}
            </p>
          </div>
        </div>

        {/* Lessons Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase text-xs">
                <th className="border border-slate-700 py-3 px-1.5 w-12 text-center">
                  {language === 'km' ? 'សប្តាហ៍' : 'Wk'}
                </th>
                <th className="border border-slate-700 py-3 px-2 w-28 text-center bg-slate-800">
                  {language === 'km' ? 'ខែ និងកាលបរិច្ឆេទ' : 'Month & Dates'}
                </th>
                <th className="border border-slate-700 py-3 px-2.5 w-28 text-left">
                  {language === 'km' ? 'ជំពូក / កូដ' : 'Chapter / Code'}
                </th>
                <th className="border border-slate-700 py-3 px-3 text-left min-w-[200px]">
                  {language === 'km' ? 'ខ្លឹមសារមេរៀន / គោលបំណង' : 'Lesson Title & Objectives'}
                </th>
                <th className="border border-slate-700 py-3 px-1.5 w-16 text-center" title="ទំព័រសៀវភៅសិស្ស (Student Book)">
                  {language === 'km' ? 'ទំព័រ សស' : 'Book (SS)'}
                </th>
                <th className="border border-slate-700 py-3 px-1.5 w-16 text-center" title="ទំព័រសៀវភៅគ្រូ (Teacher Guide)">
                  {language === 'km' ? 'ទំព័រ សក' : 'Guide (SK)'}
                </th>
                <th className="border border-slate-700 py-3 px-1.5 w-12 text-center">
                  {language === 'km' ? 'ម៉ោង' : 'Hrs'}
                </th>
                <th className="border border-slate-700 py-3 px-2 w-18 text-center">
                  {language === 'km' ? 'ឆមាស' : 'Sem'}
                </th>
                <th className="no-print border border-slate-700 py-3 px-2.5 w-24 text-center">
                  {language === 'km' ? 'ស្ថានភាព' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lessons.map((lesson) => {
                const isCompleted = lesson.status === 'completed';
                const isInProgress = lesson.status === 'in_progress';
                const isSpecial = lesson.isExamOrHoliday;

                return (
                  <tr 
                    key={lesson.id}
                    className={`transition ${
                      isSpecial 
                        ? 'bg-amber-50/80 font-medium' 
                        : isCompleted 
                        ? 'bg-emerald-50/25 hover:bg-emerald-50/50' 
                        : isInProgress 
                        ? 'bg-sky-50/40 hover:bg-sky-50/70' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Week Number */}
                    <td className="border border-slate-300 py-2.5 px-1.5 text-center font-black text-indigo-950">
                      {lesson.weekNumber}
                    </td>

                    {/* Month & Date */}
                    <td className="border border-slate-300 py-2.5 px-2 text-center">
                      {lesson.monthKm && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-950 font-black text-[11px] mb-1">
                          {lesson.monthKm}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-600 font-semibold font-mono whitespace-nowrap">
                        {lesson.dateStr || (lesson.startDate ? `${lesson.startDate}${lesson.endDate ? ` → ${lesson.endDate}` : ''}` : '-')}
                      </p>
                    </td>

                    {/* Chapter & Code */}
                    <td className="border border-slate-300 py-2.5 px-2.5">
                      <p className="font-bold text-slate-900 text-xs">
                        {lesson.chapterKm || `មេរៀនទី ${lesson.lessonNumber}`}
                      </p>
                      {lesson.subLessonCode && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                          {lesson.subLessonCode}
                        </span>
                      )}
                    </td>

                    {/* Lesson Title & Objectives */}
                    <td className="border border-slate-300 py-2.5 px-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-extrabold text-xs sm:text-sm ${isSpecial ? 'text-amber-950' : 'text-slate-900'}`}>
                          {language === 'km' ? lesson.lessonTitleKm : lesson.lessonTitleEn}
                        </p>
                        {lesson.notes && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-extrabold">
                            {lesson.notes}
                          </span>
                        )}
                      </div>
                      {lesson.objectivesKm && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {language === 'km' ? lesson.objectivesKm : lesson.objectivesEn}
                        </p>
                      )}
                    </td>

                    {/* Student Book Page (សស) */}
                    <td className="border border-slate-300 py-2.5 px-1.5 text-center font-bold text-slate-800">
                      {lesson.pageSs ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">
                          {lesson.pageSs}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Teacher Guide Page (សក) */}
                    <td className="border border-slate-300 py-2.5 px-1.5 text-center font-bold text-slate-800">
                      {(lesson.pageSk || lesson.pageSc) ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">
                          {lesson.pageSk || lesson.pageSc}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Hours */}
                    <td className="border border-slate-300 py-2.5 px-1.5 text-center font-black text-slate-900">
                      {lesson.hoursCount}
                    </td>

                    {/* Semester */}
                    <td className="border border-slate-300 py-2.5 px-2 text-center font-bold text-slate-700 whitespace-nowrap">
                      {lesson.semester === 1 ? 'ឆមាស ១' : 'ឆមាស ២'}
                    </td>

                    {/* Status Toggle (No Print) */}
                    <td className="no-print border border-slate-300 py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleToggleStatus(lesson.id, lesson.status)}
                        className={`px-2 py-1 rounded-full text-[10px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                            : isInProgress
                            ? 'bg-sky-100 text-sky-900 hover:bg-sky-200 border border-sky-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                        }`}
                      >
                        {isCompleted 
                          ? (language === 'km' ? 'រួចរាល់' : 'Done') 
                          : isInProgress 
                          ? (language === 'km' ? 'កំពុងរៀន' : 'Teaching') 
                          : (language === 'km' ? 'មិនទាន់' : 'Upcoming')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signature Footer */}
        <div className="grid grid-cols-2 pt-10 mt-8 text-xs text-slate-900 border-t border-slate-300">
          <div className="text-center space-y-1">
            <p className="font-bold">{language === 'km' ? 'បានពិនិត្យ និងឯកភាព' : 'Approved by'}</p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'នាយកសាលា' : 'School Principal'}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា និងត្រា)</span>
            </div>
            <p className="font-extrabold text-slate-900">{schoolProfile?.principalNameKm || 'លោកនាយកសាលា'}</p>
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-600">
              {schoolProfile?.province ? `${schoolProfile.province}, ` : ''}{language === 'km' ? 'ថ្ងៃទី០១ ខែវិច្ឆិកា ឆ្នាំ២០២៦' : 'Nov 01, 2026'}
            </p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'គ្រូបង្រៀនទទួលបន្ទុកថ្នាក់' : 'Class Teacher'}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា)</span>
            </div>
            <p className="font-extrabold text-slate-900">{activeClass?.teacherNameKm || activeClass?.teacherName || 'អ្នកគ្រូ/លោកគ្រូ'}</p>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Upload Modal */}
      <CurriculumUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
