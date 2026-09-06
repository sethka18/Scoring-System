import React, { useState, useEffect, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student, HomeworkAssignment, HomeworkStatus, StudentHomeworkSubmission } from '../../types';
import { 
  BookCheck, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  Save, 
  Download, 
  CheckCheck, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  XCircle
} from 'lucide-react';

export const DailyHomeworkTracker: React.FC = () => {
  const {
    language,
    activeClass,
    classStudents,
    subjects,
    activePeriodId,
    updateSubjectScore,
    showToast
  } = useGradebook();

  const classId = activeClass?.id || 'default_class';
  const STORAGE_KEY = `moeys_homework_records_${classId}`;

  // State: List of homework assignments
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial assignment
    const todayStr = new Date().toISOString().slice(0, 10);
    const initialSubmissions: Record<string, StudentHomeworkSubmission> = {};
    classStudents.forEach(s => {
      initialSubmissions[s.id] = {
        status: 'completed',
        score: 10,
        note: ''
      };
    });

    return [
      {
        id: `hw_${Date.now()}`,
        classId,
        subjectId: subjects[0]?.id || 'sub_khmer',
        date: todayStr,
        dueDate: todayStr,
        titleKm: 'លំហាត់អាន និងសរសេរពាក្យគន្លឹះមេរៀនទី ១២',
        titleEn: 'Reading and Key Vocabulary Lesson 12',
        maxPoints: 10,
        submissions: initialSubmissions,
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Active selected homework assignment
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(assignments[0]?.id || '');

  // Modal / Form state for creating new homework
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || 'sub_khmer');
  const [newTitleKm, setNewTitleKm] = useState<string>('លំហាត់គណិតវិទ្យាទំព័រ ៤៥ លេខ ១ ដល់ ៥');
  const [newDueDate, setNewDueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newMaxPoints, setNewMaxPoints] = useState<number>(10);

  // Active Assignment object
  const currentAssignment = useMemo(() => {
    return assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
  }, [assignments, selectedAssignmentId]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error(e);
    }
  }, [assignments, STORAGE_KEY]);

  // Current submissions map
  const submissions = currentAssignment?.submissions || {};

  // Single student status toggle
  const setStudentStatus = (studentId: string, status: HomeworkStatus) => {
    if (!currentAssignment) return;

    const defaultScore = status === 'completed' ? currentAssignment.maxPoints : status === 'partial' ? Math.round(currentAssignment.maxPoints / 2) : 0;

    setAssignments(prev => {
      return prev.map(a => {
        if (a.id !== currentAssignment.id) return a;
        return {
          ...a,
          submissions: {
            ...a.submissions,
            [studentId]: {
              ...a.submissions[studentId],
              status,
              score: defaultScore,
              submittedAt: new Date().toISOString()
            }
          }
        };
      });
    });
  };

  // Bulk action: Mark All Completed
  const handleMarkAllCompleted = () => {
    if (!currentAssignment) return;

    const updatedSubmissions: Record<string, StudentHomeworkSubmission> = {};
    classStudents.forEach(s => {
      updatedSubmissions[s.id] = {
        status: 'completed',
        score: currentAssignment.maxPoints,
        note: ''
      };
    });

    setAssignments(prev => {
      return prev.map(a => {
        if (a.id !== currentAssignment.id) return a;
        return {
          ...a,
          submissions: updatedSubmissions
        };
      });
    });

    showToast(language === 'km' ? 'បានសម្គាល់ "បានធ្វើគ្រប់គ្នា" ជោគជ័យ' : 'Marked all students completed', 'success');
  };

  // Bulk action: Mark All Missing
  const handleMarkAllMissing = () => {
    if (!currentAssignment) return;

    const updatedSubmissions: Record<string, StudentHomeworkSubmission> = {};
    classStudents.forEach(s => {
      updatedSubmissions[s.id] = {
        status: 'missing',
        score: 0,
        note: ''
      };
    });

    setAssignments(prev => {
      return prev.map(a => {
        if (a.id !== currentAssignment.id) return a;
        return {
          ...a,
          submissions: updatedSubmissions
        };
      });
    });

    showToast(language === 'km' ? 'បានសម្អាតស្ថានភាព' : 'Reset all to missing', 'info');
  };

  // Create new homework assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().slice(0, 10);
    const initialSubmissions: Record<string, StudentHomeworkSubmission> = {};
    classStudents.forEach(s => {
      initialSubmissions[s.id] = {
        status: 'completed',
        score: newMaxPoints,
        note: ''
      };
    });

    const newHw: HomeworkAssignment = {
      id: `hw_${Date.now()}`,
      classId,
      subjectId: newSubjectId,
      date: todayStr,
      dueDate: newDueDate,
      titleKm: newTitleKm.trim() || 'កិច្ចការផ្ទះប្រចាំថ្ងៃ',
      maxPoints: newMaxPoints,
      submissions: initialSubmissions,
      createdAt: new Date().toISOString()
    };

    setAssignments(prev => [newHw, ...prev]);
    setSelectedAssignmentId(newHw.id);
    setIsCreatingNew(false);
    showToast(language === 'km' ? 'បានបង្កើតកិច្ចការផ្ទះថ្មី' : 'Created new homework assignment', 'success');
  };

  // Sync with Gradebook Homework Component Score
  const handleSyncToGradebook = () => {
    if (!currentAssignment) return;

    let syncCount = 0;
    classStudents.forEach(student => {
      const sub = currentAssignment.submissions[student.id];
      const score = sub ? (sub.score !== undefined ? sub.score : sub.status === 'completed' ? 10 : sub.status === 'partial' ? 5 : 0) : 0;
      
      updateSubjectScore(student.id, activePeriodId, currentAssignment.subjectId, {
        homework: score
      });
      syncCount++;
    });

    showToast(
      language === 'km'
        ? `បានបញ្ជូនពិន្ទុកិច្ចការផ្ទះ (${currentAssignment.titleKm}) ទៅក្នុងតារាងពិន្ទុ ${syncCount} នាក់`
        : `Synced homework scores for ${syncCount} students to gradebook`,
      'success'
    );
  };

  // Submission Statistics
  const stats = useMemo(() => {
    let completed = 0;
    let partial = 0;
    let missing = 0;
    let excused = 0;

    classStudents.forEach(s => {
      const sub = submissions[s.id];
      const status = sub?.status || 'missing';
      if (status === 'completed') completed++;
      else if (status === 'partial') partial++;
      else if (status === 'missing') missing++;
      else if (status === 'excused') excused++;
    });

    const total = classStudents.length || 1;
    const rate = Math.round(((completed + partial * 0.5) / total) * 100);

    return { completed, partial, missing, excused, rate };
  }, [classStudents, submissions]);

  const currentSubject = subjects.find(s => s.id === currentAssignment?.subjectId) || subjects[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Hub Controls */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <BookCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-heading font-black text-slate-900 dark:text-white">
                  {language === 'km' ? 'តាមដានកិច្ចការផ្ទះប្រចាំថ្ងៃ' : 'Daily Homework Submission Tracker'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60">
                  Quick Log
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km'
                  ? `ថ្នាក់រៀន៖ ${activeClass?.nameKm || activeClass?.name} • អត្រាធ្វើរួច៖ ${stats.rate}% (${stats.completed} នាក់ពេញលេញ)`
                  : `Class: ${activeClass?.name} • Submission rate: ${stats.rate}% (${stats.completed} completed)`}
              </p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{language === 'km' ? 'ដាក់កិច្ចការផ្ទះថ្មី' : 'New Homework'}</span>
            </button>

            <button
              onClick={handleMarkAllCompleted}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{language === 'km' ? 'បានធ្វើគ្រប់គ្នា (1-Click)' : 'Mark All Done'}</span>
            </button>

            <button
              onClick={handleSyncToGradebook}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'km' ? 'បញ្ចូលពិន្ទុកិច្ចការផ្ទះ' : 'Sync to Gradebook'}</span>
            </button>
          </div>
        </div>

        {/* Assignment Selector Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {language === 'km' ? 'ជ្រើសរើសកិច្ចការផ្ទះ៖' : 'Assignment:'}
            </span>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 max-w-xs sm:max-w-md truncate"
            >
              {assignments.map(a => {
                const sub = subjects.find(s => s.id === a.subjectId);
                return (
                  <option key={a.id} value={a.id}>
                    {a.date} — [{sub?.nameKm || 'មុខវិជ្ជា'}] {a.titleKm}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>មុខវិជ្ជា៖ <strong className="text-slate-900 dark:text-white">{currentSubject?.nameKm}</strong></span>
            <span>•</span>
            <span>ថ្ងៃផុតកំណត់៖ <strong className="text-slate-900 dark:text-white">{currentAssignment?.dueDate}</strong></span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">បានធ្វើរួច (Done)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-heading font-black text-emerald-950 dark:text-emerald-100 mt-2">
            {stats.completed} <span className="text-xs font-normal text-emerald-700">/ {classStudents.length}</span>
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">ពេញលេញ ១០០%</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-800 dark:text-blue-300">ធ្វើបានខ្លះ (Partial)</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-heading font-black text-blue-950 dark:text-blue-100 mt-2">
            {stats.partial} <span className="text-xs font-normal text-blue-700">នាក់</span>
          </p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">បញ្ចប់បានពាក់កណ្តាល ៥០%</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-800 dark:text-rose-300">មិនបានធ្វើ (Missing)</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-heading font-black text-rose-950 dark:text-rose-100 mt-2">
            {stats.missing} <span className="text-xs font-normal text-rose-700">នាក់</span>
          </p>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">ខកខានមិនបានបំពេញ</p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-800 dark:text-indigo-300">អត្រាបំពេញសរុប</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-heading font-black text-indigo-950 dark:text-indigo-100 mt-2">
            {stats.rate}%
          </p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">ភាគរយកិច្ចការផ្ទះថ្នាក់</p>
        </div>
      </div>

      {/* Student Submissions List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
              {language === 'km' ? 'បញ្ជីត្រួតពិនិត្យកិច្ចការផ្ទះសិស្ស' : 'Student Homework Checklist'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentAssignment?.titleKm} • ពិន្ទុអតិបរមា {currentAssignment?.maxPoints || 10}
            </p>
          </div>

          <button
            onClick={handleMarkAllMissing}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            {language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset'}
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {classStudents.map((student, idx) => {
            const sub = submissions[student.id];
            const currentStatus = sub?.status || 'missing';

            return (
              <div 
                key={student.id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
              >
                {/* Student Info */}
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
                    {idx + 1}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    student.gender === 'Female'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-heading font-black text-sm text-slate-900 dark:text-white">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {student.studentId} • {student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                    </p>
                  </div>
                </div>

                {/* 4 Fast 1-Click Status Pills */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Completed */}
                  <button
                    onClick={() => setStudentStatus(student.id, 'completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      currentStatus === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'បានធ្វើ (100%)' : 'Done'}</span>
                  </button>

                  {/* Partial */}
                  <button
                    onClick={() => setStudentStatus(student.id, 'partial')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      currentStatus === 'partial'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'ខ្លះ (50%)' : 'Partial'}</span>
                  </button>

                  {/* Missing */}
                  <button
                    onClick={() => setStudentStatus(student.id, 'missing')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      currentStatus === 'missing'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'មិនបានធ្វើ (0%)' : 'Missing'}</span>
                  </button>

                  {/* Excused */}
                  <button
                    onClick={() => setStudentStatus(student.id, 'excused')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      currentStatus === 'excused'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <span>{language === 'km' ? 'ច្បាប់' : 'Excused'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Homework Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
              {language === 'km' ? 'ដាក់កិច្ចការផ្ទះថ្មី' : 'Create New Homework Assignment'}
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'km' ? 'មុខវិជ្ជា' : 'Subject'}
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.nameKm} ({s.nameEn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'km' ? 'ចំណងជើង / លំហាត់កិច្ចការផ្ទះ' : 'Assignment Title & Chapter'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitleKm}
                  onChange={(e) => setNewTitleKm(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ លំហាត់ទំព័រ ៤៥..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'km' ? 'ថ្ងៃផុតកំណត់' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'km' ? 'ពិន្ទុអតិបរមា' : 'Max Points'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newMaxPoints}
                    onChange={(e) => setNewMaxPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  {language === 'km' ? 'បង្កើតកិច្ចការ' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
