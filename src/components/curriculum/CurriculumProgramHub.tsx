import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { CurriculumProgram, CurriculumLesson, Subject } from '../../types';
import { 
  BookOpen, 
  Upload, 
  Calendar, 
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
  ListTodo
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { CurriculumUploadModal } from './CurriculumUploadModal';

export const CurriculumProgramHub: React.FC = () => {
  const { 
    language, 
    activeClass, 
    schoolProfile,
    subjects, 
    curriculumPrograms, 
    updateCurriculumLesson, 
    syncCurriculumToCalendar,
    showToast 
  } = useGradebook();

  const [selectedGrade, setSelectedGrade] = useState<number>(activeClass?.gradeLevel || 6);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub_khmer');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Find or select program
  const currentProgram = curriculumPrograms.find(
    p => p.gradeLevel === selectedGrade && p.subjectId === selectedSubjectId
  ) || curriculumPrograms.find(p => p.gradeLevel === selectedGrade) || curriculumPrograms[0];

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

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
                onClick={() => setSelectedGrade(g)}
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

        {/* Subjects Row */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs font-black text-slate-500 uppercase shrink-0 mr-1">
            {language === 'km' ? 'មុខវិជ្ជា៖' : 'Subject:'}
          </span>
          {subjects.map(sub => {
            const isActive = sub.id === selectedSubjectId;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-indigo-900 text-white shadow-xs ring-2 ring-indigo-900/10'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                <span>{language === 'km' ? sub.nameKm : sub.nameEn}</span>
              </button>
            );
          })}
        </div>
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
        <div className="text-center pb-5 border-b-2 border-slate-900 mb-6">
          <div className="flex justify-between items-start text-xs font-semibold text-slate-800 mb-2">
            <div className="text-left flex items-center space-x-3">
              <SchoolLogo size={46} customLogoUrl={schoolProfile?.logoUrl} />
              <div>
                <p className="font-extrabold uppercase text-slate-950">{activeClass?.schoolNameKm}</p>
                <p className="text-slate-600 font-bold text-[11px]">
                  {language === 'km' ? `កម្មវិធីសិក្សាលម្អិត • ថ្នាក់ទី ${selectedGrade}` : `Curriculum Program • Grade ${selectedGrade}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900 text-xs">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="text-slate-600 font-bold text-[11px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            </div>
          </div>

          <h2 className="font-heading font-black text-lg sm:text-2xl text-slate-950 uppercase tracking-wide mt-2">
            {language === 'km' 
              ? `តារាងបែងចែកកម្មវិធីសិក្សាប្រចាំឆ្នាំ៖ ${currentSubject?.nameKm || 'ភាសាខ្មែរ'}` 
              : `Annual Curriculum & Lesson Plan: ${currentSubject?.nameEn || 'Khmer'}`}
          </h2>
          <p className="text-xs font-bold text-indigo-900 mt-1 uppercase">
            {language === 'km' 
              ? `កម្រិតថ្នាក់ទី ${selectedGrade} • ឆ្នាំសិក្សា ${activeClass?.academicYear || '2025-2026'}` 
              : `Grade ${selectedGrade} • Academic Year ${activeClass?.academicYear || '2025-2026'}`}
          </p>
        </div>

        {/* Lessons Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase text-xs">
                <th className="border border-slate-700 py-3 px-2 w-16 text-center">
                  {language === 'km' ? 'សប្តាហ៍' : 'Week'}
                </th>
                <th className="border border-slate-700 py-3 px-3 w-32 text-left">
                  {language === 'km' ? 'ជំពូក / មេរៀន' : 'Chapter'}
                </th>
                <th className="border border-slate-700 py-3 px-4 text-left">
                  {language === 'km' ? 'ចំណងជើងមេរៀន និងខ្លឹមសារសំខាន់' : 'Lesson Title & Content'}
                </th>
                <th className="border border-slate-700 py-3 px-3 text-left">
                  {language === 'km' ? 'គោលបំណងសិក្សា (Objectives)' : 'Learning Objectives'}
                </th>
                <th className="border border-slate-700 py-3 px-2 w-16 text-center">
                  {language === 'km' ? 'ម៉ោង' : 'Hours'}
                </th>
                <th className="border border-slate-700 py-3 px-2 w-20 text-center">
                  {language === 'km' ? 'ឆមាស' : 'Sem'}
                </th>
                <th className="no-print border border-slate-700 py-3 px-3 w-28 text-center">
                  {language === 'km' ? 'ស្ថានភាព' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lessons.map((lesson) => {
                const isCompleted = lesson.status === 'completed';
                const isInProgress = lesson.status === 'in_progress';

                return (
                  <tr 
                    key={lesson.id}
                    className={`hover:bg-indigo-50/40 transition ${
                      isCompleted ? 'bg-emerald-50/20' : isInProgress ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Week Number */}
                    <td className="border border-slate-300 py-3 px-2 text-center font-black text-indigo-950">
                      {lesson.weekNumber}
                    </td>

                    {/* Chapter */}
                    <td className="border border-slate-300 py-3 px-3 font-bold text-slate-800">
                      {lesson.chapterKm || `មេរៀនទី ${lesson.lessonNumber}`}
                    </td>

                    {/* Lesson Title */}
                    <td className="border border-slate-300 py-3 px-4">
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {language === 'km' ? lesson.lessonTitleKm : lesson.lessonTitleEn}
                      </p>
                      {lesson.startDate && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {lesson.startDate} {lesson.endDate ? `→ ${lesson.endDate}` : ''}
                        </p>
                      )}
                    </td>

                    {/* Objectives */}
                    <td className="border border-slate-300 py-3 px-3 text-slate-600 text-[11px]">
                      {language === 'km' ? lesson.objectivesKm : lesson.objectivesEn}
                    </td>

                    {/* Hours */}
                    <td className="border border-slate-300 py-3 px-2 text-center font-bold text-slate-900">
                      {lesson.hoursCount}
                    </td>

                    {/* Semester */}
                    <td className="border border-slate-300 py-3 px-2 text-center font-bold text-slate-700">
                      {lesson.semester === 1 ? 'ឆមាស ១' : 'ឆមាស ២'}
                    </td>

                    {/* Status Toggle (No Print) */}
                    <td className="no-print border border-slate-300 py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(lesson.id, lesson.status)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                        }`}
                      >
                        {isCompleted 
                          ? (language === 'km' ? 'រួចរាល់' : 'Done') 
                          : isInProgress 
                          ? (language === 'km' ? 'កំពុងបង្រៀន' : 'Teaching') 
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
        <div className="grid grid-cols-2 pt-10 mt-6 text-xs text-slate-900 border-t border-slate-300">
          <div className="text-center space-y-1">
            <p className="font-bold">{language === 'km' ? 'បានពិនិត្យ និងយល់ព្រម' : 'Approved by'}</p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'នាយកសាលា' : 'School Director'}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា និងត្រា)</span>
            </div>
            <p className="font-extrabold text-slate-900">ហ៊ឹម ម៉ាលីកា</p>
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-600">
              {language === 'km' ? 'ថ្ងៃទី០១ ខែធ្នូ ឆ្នាំ២០២៥' : 'Dec 01, 2025'}
            </p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'គ្រូបង្រៀនមុខវិជ្ជា' : 'Subject Teacher'}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា)</span>
            </div>
            <p className="font-extrabold text-slate-900">{activeClass?.teacherNameKm || activeClass?.teacherName}</p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <CurriculumUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
