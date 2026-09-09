import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartHandshake, 
  Search, 
  CheckCircle2, 
  Printer, 
  Users, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Copy, 
  Sparkles,
  FileSpreadsheet,
  Check,
  Eye,
  Info,
  ShieldCheck,
  Sparkle,
  Smile,
  Clock,
  Activity,
  Layers,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useGradebook } from '../../context/GradebookContext';
import { 
  APPENDIX_4_CRITERIA, 
  calculateAttitudeEvaluation, 
  generateInitialAttitudeRecords,
  StudentAttitudeAssessmentRecord,
  AttitudeCategoryType
} from '../../data/competencyAssessmentData';
import { AssessmentHeader } from './AssessmentHeader';

export const AttitudeAssessmentView: React.FC = () => {
  const { students, activeClass, language, updateStudent, notify, setActiveTab } = useGradebook();
  
  // Synchronized active student with localStorage
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const savedId = localStorage.getItem('gradebook_active_competency_student_id');
    if (savedId && students.some(s => s.id === savedId)) return savedId;
    return students[0]?.id || 'stu_1';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'individual' | 'matrix' | 'print'>('individual');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [printAllStudents, setPrintAllStudents] = useState(false);

  const LS_ATTITUDE_KEY = `gradebook_attitude_assessment_${activeClass?.id || 'class_6a'}`;

  // Sync selectedStudentId to localStorage
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    try {
      localStorage.setItem('gradebook_active_competency_student_id', id);
    } catch (e) {
      console.error(e);
    }
  };

  // Local storage state for attitude records
  const [attitudeRecords, setAttitudeRecords] = useState<Record<string, StudentAttitudeAssessmentRecord>>(() => {
    const studentIds = students.map(s => s.id);
    const saved = localStorage.getItem(LS_ATTITUDE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        studentIds.forEach(id => {
          if (!parsed[id]) {
            const defaultScores: Record<number, 0 | 1> = {};
            APPENDIX_4_CRITERIA.forEach(c => { defaultScores[c.id] = c.defaultScore; });
            const ev = calculateAttitudeEvaluation(defaultScores);
            parsed[id] = {
              studentId: id,
              criteriaScores: defaultScores,
              categorySubtotals: { ...ev.categorySubtotals },
              totalRawScore: ev.totalRawScore,
              scoreOn10: ev.scoreOn10,
              scoreOn1: ev.scoreOn1,
              grade: ev.grade,
              updatedAt: new Date().toISOString(),
            };
          }
        });
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return generateInitialAttitudeRecords(studentIds);
  });

  // Save to local storage whenever records change
  useEffect(() => {
    try {
      localStorage.setItem(LS_ATTITUDE_KEY, JSON.stringify(attitudeRecords));
    } catch (e) {
      console.error(e);
    }
  }, [attitudeRecords, LS_ATTITUDE_KEY]);

  // Sync attitudeScore with Gradebook Student model
  const syncStudentAttitudeScore = (studentId: string, scoreOn10: number) => {
    const student = students.find(s => s.id === studentId);
    if (student && student.attitudeScore !== scoreOn10) {
      updateStudent({
        ...student,
        attitudeScore: scoreOn10,
      });
    }
  };

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const currentRecord = useMemo(() => {
    if (!selectedStudent) return null;
    const existing = attitudeRecords[selectedStudent.id];
    if (existing) return existing;

    const defaultScores: Record<number, 0 | 1> = {};
    APPENDIX_4_CRITERIA.forEach(c => { defaultScores[c.id] = c.defaultScore; });
    const ev = calculateAttitudeEvaluation(defaultScores);
    return {
      studentId: selectedStudent.id,
      criteriaScores: defaultScores,
      categorySubtotals: { ...ev.categorySubtotals },
      totalRawScore: ev.totalRawScore,
      scoreOn10: ev.scoreOn10,
      scoreOn1: ev.scoreOn1,
      grade: ev.grade,
      updatedAt: new Date().toISOString(),
    };
  }, [selectedStudent, attitudeRecords]);

  // Toggle single criterion
  const handleToggleCriterion = (criterionId: number) => {
    if (!selectedStudent) return;
    const currentScore = currentRecord?.criteriaScores[criterionId] ?? 0;
    const newScore: 0 | 1 = currentScore === 1 ? 0 : 1;

    const newScores = {
      ...(currentRecord?.criteriaScores || {}),
      [criterionId]: newScore,
    };
    const ev = calculateAttitudeEvaluation(newScores);

    const updatedRecord: StudentAttitudeAssessmentRecord = {
      studentId: selectedStudent.id,
      criteriaScores: newScores,
      categorySubtotals: { ...ev.categorySubtotals },
      totalRawScore: ev.totalRawScore,
      scoreOn10: ev.scoreOn10,
      scoreOn1: ev.scoreOn1,
      grade: ev.grade,
      updatedAt: new Date().toISOString(),
    };

    setAttitudeRecords(prev => ({
      ...prev,
      [selectedStudent.id]: updatedRecord,
    }));

    syncStudentAttitudeScore(selectedStudent.id, ev.scoreOn10);
  };

  // Quick action: Set official sample (63/74)
  const handleSetOfficialSample = () => {
    if (!selectedStudent) return;
    const defaultScores: Record<number, 0 | 1> = {};
    APPENDIX_4_CRITERIA.forEach(c => { defaultScores[c.id] = c.defaultScore; });
    const ev = calculateAttitudeEvaluation(defaultScores);

    const updatedRecord: StudentAttitudeAssessmentRecord = {
      studentId: selectedStudent.id,
      criteriaScores: defaultScores,
      categorySubtotals: { ...ev.categorySubtotals },
      totalRawScore: ev.totalRawScore,
      scoreOn10: ev.scoreOn10,
      scoreOn1: ev.scoreOn1,
      grade: ev.grade,
      updatedAt: new Date().toISOString(),
    };

    setAttitudeRecords(prev => ({
      ...prev,
      [selectedStudent.id]: updatedRecord,
    }));

    syncStudentAttitudeScore(selectedStudent.id, ev.scoreOn10);
    notify('success', `បានកំណត់គំរូពិន្ទុផ្លូវការ (៦៣/៧៤) សម្រាប់ ${selectedStudent.name}`);
  };

  // Quick action: Toggle all in specific category
  const handleBatchCategory = (categoryId: AttitudeCategoryType, value: 0 | 1) => {
    if (!selectedStudent || !currentRecord) return;
    const newScores = { ...currentRecord.criteriaScores };
    APPENDIX_4_CRITERIA.filter(c => c.categoryId === categoryId).forEach(c => {
      newScores[c.id] = value;
    });

    const ev = calculateAttitudeEvaluation(newScores);
    const updatedRecord: StudentAttitudeAssessmentRecord = {
      studentId: selectedStudent.id,
      criteriaScores: newScores,
      categorySubtotals: { ...ev.categorySubtotals },
      totalRawScore: ev.totalRawScore,
      scoreOn10: ev.scoreOn10,
      scoreOn1: ev.scoreOn1,
      grade: ev.grade,
      updatedAt: new Date().toISOString(),
    };

    setAttitudeRecords(prev => ({
      ...prev,
      [selectedStudent.id]: updatedRecord,
    }));

    syncStudentAttitudeScore(selectedStudent.id, ev.scoreOn10);
  };

  // Quick action: Fill all with 1 or 0
  const handleFillAll = (value: 0 | 1) => {
    if (!selectedStudent) return;
    const newScores: Record<number, 0 | 1> = {};
    APPENDIX_4_CRITERIA.forEach(c => { newScores[c.id] = value; });
    const ev = calculateAttitudeEvaluation(newScores);

    const updatedRecord: StudentAttitudeAssessmentRecord = {
      studentId: selectedStudent.id,
      criteriaScores: newScores,
      categorySubtotals: { ...ev.categorySubtotals },
      totalRawScore: ev.totalRawScore,
      scoreOn10: ev.scoreOn10,
      scoreOn1: ev.scoreOn1,
      grade: ev.grade,
      updatedAt: new Date().toISOString(),
    };

    setAttitudeRecords(prev => ({
      ...prev,
      [selectedStudent.id]: updatedRecord,
    }));

    syncStudentAttitudeScore(selectedStudent.id, ev.scoreOn10);
    notify('success', value === 1 
      ? `បានជ្រើសរើស (១) គ្រប់ ៧៤ លក្ខណៈវិនិច្ឆ័យសម្រាប់ ${selectedStudent.name}`
      : `បានសម្អាត (០) គ្រប់លក្ខណៈវិនិច្ឆ័យសម្រាប់ ${selectedStudent.name}`
    );
  };

  // Copy current student's scores to all students
  const handleApplyToAllStudents = () => {
    if (!currentRecord) return;
    const newRecords: Record<string, StudentAttitudeAssessmentRecord> = {};
    students.forEach(s => {
      newRecords[s.id] = {
        studentId: s.id,
        criteriaScores: { ...currentRecord.criteriaScores },
        categorySubtotals: { ...currentRecord.categorySubtotals },
        totalRawScore: currentRecord.totalRawScore,
        scoreOn10: currentRecord.scoreOn10,
        scoreOn1: currentRecord.scoreOn1,
        grade: currentRecord.grade,
        updatedAt: new Date().toISOString(),
      };
      syncStudentAttitudeScore(s.id, currentRecord.scoreOn10);
    });
    setAttitudeRecords(newRecords);
    notify('success', `បានចម្លងលទ្ធផលពិន្ទុចរិយាទៅកាន់សិស្សទាំង ${students.length} នាក់ដោយជោគជ័យ`);
  };

  // Navigation between students
  const currentIndex = students.findIndex(s => s.id === selectedStudentId);
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      handleSelectStudent(students[currentIndex - 1].id);
    }
  };
  const handleNextStudent = () => {
    if (currentIndex < students.length - 1) {
      handleSelectStudent(students[currentIndex + 1].id);
    }
  };

  // Filtered students for sidebar
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.studentId.toLowerCase().includes(term) ||
      (s.nameLatin && s.nameLatin.toLowerCase().includes(term))
    );
  }, [students, searchTerm]);

  // Categories metadata
  const categoriesList: { id: AttitudeCategoryType | 'all'; nameKm: string; icon: any; max: number }[] = [
    { id: 'all', nameKm: 'ទាំងអស់', icon: Layers, max: 74 },
    { id: 'clean', nameKm: '១. ស្អាត', icon: Sparkle, max: 17 },
    { id: 'polite', nameKm: '២. សុភាព', icon: Smile, max: 22 },
    { id: 'discipline', nameKm: '៣. របៀប', icon: ShieldCheck, max: 18 },
    { id: 'punctual', nameKm: '៤. ទៀងពេល', icon: Clock, max: 8 },
    { id: 'meditation', nameKm: '៥. សមាធិ', icon: Activity, max: 14 },
  ];

  // Filter criteria by category
  const displayedCriteria = useMemo(() => {
    if (activeCategoryFilter === 'all') return APPENDIX_4_CRITERIA;
    return APPENDIX_4_CRITERIA.filter(c => c.categoryId === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Class Stats Calculation
  const classStats = useMemo(() => {
    let totalScoreOn10 = 0;
    const gradeCounts = {
      excellent: 0,
      veryGood: 0,
      fair: 0,
      poor: 0,
    };

    students.forEach(s => {
      const rec = attitudeRecords[s.id];
      const s10 = rec?.scoreOn10 ?? 8.5;
      totalScoreOn10 += s10;

      const g = rec?.grade || 'ល្អ';
      if (g === 'ល្អ') gradeCounts.excellent++;
      else if (g === 'ល្អបង្គួរ') gradeCounts.veryGood++;
      else if (g === 'មធ្យម') gradeCounts.fair++;
      else gradeCounts.poor++;
    });

    return {
      averageScoreOn10: students.length > 0 ? totalScoreOn10 / students.length : 0,
      gradeCounts,
    };
  }, [students, attitudeRecords]);

  // Export to Excel
  const handleExportExcel = () => {
    const rows = students.map((s, idx) => {
      const rec = attitudeRecords[s.id];
      const rowData: Record<string, any> = {
        'ល.រ': idx + 1,
        'អត្តលេខ': s.studentId,
        'គោត្តនាម-នាម': s.name,
        'ភេទ': s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
        'ស្អាត (១៧)': rec?.categorySubtotals?.clean ?? 14,
        'សុភាព (២២)': rec?.categorySubtotals?.polite ?? 19,
        'របៀប (១៨)': rec?.categorySubtotals?.discipline ?? 16,
        'ទៀងពេល (៨)': rec?.categorySubtotals?.punctual ?? 6,
        'សមាធិ (១៤)': rec?.categorySubtotals?.meditation ?? 8,
        'ពិន្ទុសរុប (លើ ៧៤)': rec?.totalRawScore ?? 63,
        'មធ្យមភាគ (លើ ១០.០០)': rec?.scoreOn10 ?? 8.5,
        'ពិន្ទុរួមចំណែក (លើ ១.០០)': rec?.scoreOn1 ?? 0.85,
        'និទ្ទេស': rec?.grade ?? 'ល្អ',
      };
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ឧបសម្ព័ន្ធ៤_ចរិយាសម្បទា');
    XLSX.writeFile(workbook, `ឧបសម្ព័ន្ធ៤_វាយតម្លៃចរិយា_${activeClass?.nameKm || 'ថ្នាក់ទី៦'}.xlsx`);
    notify('success', 'បានទាញយកឯកសារ Excel ឧបសម្ព័ន្ធ៤ ដោយជោគជ័យ');
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'ល្អ': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'ល្អបង្គួរ': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'មធ្យម': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default: return 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-5 pb-12 font-khmer" id="attitude-assessment-container">
      {/* Top Assessment Hub Switcher Header */}
      <AssessmentHeader
        currentTab="attitude_assessment"
        onSwitchTab={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportExcel={handleExportExcel}
        classNameKm={activeClass?.nameKm || '៦(ក)'}
        totalStudents={students.length}
        evaluatedCount={students.length}
        averageScoreOn10={classStats.averageScoreOn10}
        gradeCounts={classStats.gradeCounts}
      />

      {/* Mode 1: Individual Assessment View */}
      {viewMode === 'individual' && selectedStudent && currentRecord && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Student Selector Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  បញ្ជីសិស្ស ({filteredStudents.length}/{students.length})
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                ថ្នាក់ {activeClass?.nameKm || '៦(ក)'}
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Student List */}
            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredStudents.map((s, idx) => {
                const rec = attitudeRecords[s.id];
                const isSelected = s.id === selectedStudentId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-50/90 dark:bg-rose-950/40 border border-rose-300/80 dark:border-rose-700/80 text-rose-950 dark:text-rose-100 shadow-xs' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-slate-400 font-mono text-[11px] shrink-0 text-center">
                        {idx + 1}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        s.gender === 'Female' 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' 
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}>
                        {s.name.charAt(0)}
                      </div>
                      <div className="leading-tight">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {s.studentId} • {s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 leading-tight">
                      <div className="font-bold font-mono text-rose-700 dark:text-rose-400 text-xs">
                        {(rec?.scoreOn10 ?? 8.5).toFixed(2)}/10
                      </div>
                      <span className={`inline-block mt-1 px-1.5 py-0.2 text-[10px] rounded font-semibold border ${getGradeBadgeColor(rec?.grade || 'ល្អ')}`}>
                        {rec?.grade || 'ល្អ'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Student Rubric & Scoring */}
          <div className="lg:col-span-8 space-y-4">
            {/* Student Header & Quick Navigation Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
                    selectedStudent.gender === 'Female'
                      ? 'bg-rose-600 text-white shadow-rose-200 dark:shadow-none'
                      : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                  }`}>
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {selectedStudent.name}
                      </h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        selectedStudent.gender === 'Female'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                      }`}>
                        {selectedStudent.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      អត្តលេខ៖ <span className="font-mono">{selectedStudent.studentId}</span> • ថ្នាក់ទី {activeClass?.nameKm || '៦(ក)'} • ឆ្នាំសិក្សា ២០២៦-២០២៧
                    </p>
                  </div>
                </div>

                {/* Next / Previous Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevStudent}
                    disabled={currentIndex <= 0}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    title="សិស្សមុន"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                    {currentIndex + 1} / {students.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextStudent}
                    disabled={currentIndex >= students.length - 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    title="សិស្សបន្ទាប់"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Key Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/80">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ពិន្ទុសរុប (លើ ៧៤)</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 font-mono">
                    {currentRecord.totalRawScore} <span className="text-xs text-slate-400 font-normal">/ ៧៤</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">៥ ជំពូកចរិយា</div>
                </div>

                <div className="bg-rose-50/80 dark:bg-rose-950/30 rounded-xl p-3 border border-rose-200/70 dark:border-rose-800/60">
                  <div className="text-xs text-rose-700 dark:text-rose-300 font-medium">មធ្យមភាគ (លើ ១០.០០)</div>
                  <div className="text-xl font-bold text-rose-800 dark:text-rose-200 mt-1 font-mono">
                    {currentRecord.scoreOn10.toFixed(2)} <span className="text-xs text-rose-400 font-normal">/ ១០</span>
                  </div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">សមាមាត្រស្មើមុខវិជ្ជា</div>
                </div>

                <div className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-200/70 dark:border-emerald-800/60">
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">រួមចំណែកប្រចាំឆ្នាំ (១០%)</div>
                  <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-1 font-mono">
                    {currentRecord.scoreOn1.toFixed(2)} <span className="text-xs text-emerald-400 font-normal">/ ១.០០</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">ទម្ងន់ ១០% ក្នុងឆ្នាំ</div>
                </div>

                <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200/70 dark:border-amber-800/60">
                  <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">និទ្ទេសវាយតម្លៃ</div>
                  <div className="text-xl font-bold text-amber-800 dark:text-amber-200 mt-1">
                    {currentRecord.grade}
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                    {currentRecord.scoreOn10 >= 8 ? 'ពិន្ទុ ៨.០-១០.០' : currentRecord.scoreOn10 >= 6.5 ? 'ពិន្ទុ ៦.៥-៧.៩' : currentRecord.scoreOn10 >= 5 ? 'ពិន្ទុ ៥.០-៦.៤' : 'ពិន្ទុក្រោម ៥.០'}
                  </div>
                </div>
              </div>

              {/* 5 Category Subtotal Breakdown Pills */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                  ពិន្ទុតាមជំពូកទាំង ៥៖
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">១. ស្អាត</div>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentRecord.categorySubtotals?.clean ?? 14} <span className="text-[10px] text-slate-400">/១៧</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">២. សុភាព</div>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentRecord.categorySubtotals?.polite ?? 19} <span className="text-[10px] text-slate-400">/២២</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">៣. របៀប</div>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentRecord.categorySubtotals?.discipline ?? 16} <span className="text-[10px] text-slate-400">/១៨</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">៤. ទៀងពេល</div>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentRecord.categorySubtotals?.punctual ?? 6} <span className="text-[10px] text-slate-400">/៨</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">៥. សមាធិ</div>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentRecord.categorySubtotals?.meditation ?? 8} <span className="text-[10px] text-slate-400">/១៤</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Toolbar */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">កំណត់រហ័ស៖</span>
                  <button
                    type="button"
                    onClick={handleSetOfficialSample}
                    className="px-2.5 py-1.5 text-xs bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg transition-all font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>គំរូផ្លូវការ (៦៣/៧៤)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillAll(1)}
                    className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    ជ្រើសរើស (១) ទាំងអស់
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillAll(0)}
                    className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    សម្អាត (០ ទាំងអស់)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleApplyToAllStudents}
                  className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-xs font-medium cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>ចម្លងពិន្ទុនេះទៅសិស្សទាំងអស់</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              {categoriesList.map(cat => {
                const isActive = activeCategoryFilter === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.nameKm}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200/70 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                      {cat.max}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Rubric Criteria List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    តារាងលក្ខណៈវិនិច្ឆ័យវាយតម្លៃ (បង្ហាញ {displayedCriteria.length}/{APPENDIX_4_CRITERIA.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    សូមចុចលើប្រអប់ដើម្បីធីក ១ (បានអនុវត្ត) ឬ ០ (មិនទាន់បានអនុវត្ត)
                  </p>
                </div>

                {activeCategoryFilter !== 'all' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBatchCategory(activeCategoryFilter as AttitudeCategoryType, 1)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium cursor-pointer"
                    >
                      ជ្រើសរើសទាំងអស់
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchCategory(activeCategoryFilter as AttitudeCategoryType, 0)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
                    >
                      សម្អាតទាំងអស់
                    </button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                {displayedCriteria.map((crit) => {
                  const isChecked = (currentRecord.criteriaScores[crit.id] ?? crit.defaultScore) === 1;
                  return (
                    <div
                      key={crit.id}
                      onClick={() => handleToggleCriterion(crit.id)}
                      className={`p-3.5 transition-colors flex items-center justify-between gap-3 cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70' 
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-slate-200/70 dark:border-slate-700">
                          {crit.id}
                        </span>
                        <div>
                          <div className={`font-semibold text-xs sm:text-sm leading-relaxed ${
                            isChecked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {crit.criteriaKm}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {crit.criteriaEn}
                          </div>
                        </div>
                      </div>

                      {/* Checkbox Icon Indicator */}
                      <div className="shrink-0 pl-2">
                        {isChecked ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 flex items-center justify-center text-slate-400">
                            <span className="text-xs font-mono font-semibold">០</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Footer Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  ពិន្ទុសរុបចរិយាសម្បទា៖
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-rose-700 dark:text-rose-400">
                    {currentRecord.totalRawScore} / ៧៤
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {currentRecord.scoreOn10.toFixed(2)} / ១០.០០
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadgeColor(currentRecord.grade)}`}>
                    និទ្ទេស {currentRecord.grade}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Class Matrix View */}
      {viewMode === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                តារាងពិន្ទុចរិយាសម្បទារួមទាំងថ្នាក់ (ឧបសម្ព័ន្ធ ៤)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                បង្ហាញលទ្ធផលពិន្ទុតាមជំពូកទាំង ៥ សម្រាប់សិស្សទាំង {students.length} នាក់
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ទាញយក Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  <th className="p-2 border border-slate-200 dark:border-slate-700 w-10 text-center sticky left-0 bg-slate-100 dark:bg-slate-800 z-10">
                    ល.រ
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 min-w-[140px] sticky left-10 bg-slate-100 dark:bg-slate-800 z-10">
                    គោត្តនាម-នាម
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 w-12 text-center">
                    ភេទ
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                    ១. ស្អាត (១៧)
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                    ២. សុភាព (២២)
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                    ៣. របៀប (១៨)
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                    ៤. ទៀងពេល (៨)
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                    ៥. សមាធិ (១៤)
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold min-w-[65px]">
                    សរុប/៧៤
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold min-w-[60px]">
                    លើ ១០
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold min-w-[60px]">
                    ១០% ឆ្នាំ
                  </th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center min-w-[75px]">
                    និទ្ទេស
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s, idx) => {
                  const rec = attitudeRecords[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-mono text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">
                        {idx + 1}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 sticky left-10 bg-white dark:bg-slate-900 z-10">
                        {s.name}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center text-slate-600 dark:text-slate-400">
                        {s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {rec?.categorySubtotals?.clean ?? 14}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {rec?.categorySubtotals?.polite ?? 19}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {rec?.categorySubtotals?.discipline ?? 16}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {rec?.categorySubtotals?.punctual ?? 6}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {rec?.categorySubtotals?.meditation ?? 8}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold font-mono bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200">
                        {rec?.totalRawScore ?? 63}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold font-mono bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                        {(rec?.scoreOn10 ?? 8.5).toFixed(2)}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold font-mono bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                        {(rec?.scoreOn1 ?? 0.85).toFixed(2)}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getGradeBadgeColor(rec?.grade || 'ល្អ')}`}>
                          {rec?.grade || 'ល្អ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode 3: Print Official Appendix 4 View (MoEYS Authentic Standard) */}
      {viewMode === 'print' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printAllStudents}
                  onChange={e => setPrintAllStudents(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span>បោះពុម្ពសិស្សទាំងអស់ ({students.length} នាក់)</span>
              </label>

              {!printAllStudents && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <select
                    value={selectedStudentId}
                    onChange={e => handleSelectStudent(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {students.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        {idx + 1}. {s.name} ({s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពឥឡូវនេះ (Print A4)</span>
            </button>
          </div>

          {/* Render printable pages */}
          <div className="space-y-8 bg-slate-100 p-4 rounded-2xl print:bg-white print:p-0">
            {(printAllStudents ? students : [selectedStudent]).map((s) => {
              const rec = attitudeRecords[s.id];
              return (
                <div
                  key={s.id}
                  className="bg-white w-[210mm] min-h-[297mm] mx-auto p-[12mm] shadow-md print:shadow-none print:w-full print:p-0 print:min-h-0 print:break-after-page text-slate-900 text-[10.5px] font-khmer leading-normal"
                  style={{ boxSizing: 'border-box' }}
                >
                  {/* Official Khmer Royal Header */}
                  <div className="text-center space-y-1 mb-3">
                    <div className="font-moul text-sm sm:text-base text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div className="font-moul text-xs text-slate-800 mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    <div className="text-xs text-slate-400 select-none">🙣 🙡 🙢 🙠</div>
                  </div>

                  <div className="flex justify-between items-start mb-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900">មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តកំពង់ចាម</div>
                      <div className="font-semibold text-slate-900">ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកស្ទឹងត្រង់</div>
                      <div className="font-bold text-slate-900">សាលាបឋមសិក្សា ហ៊ុន ណេង ប្រទង</div>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-slate-100 rounded text-xs font-bold border border-slate-300 inline-block font-mono">
                        ឧបសម្ព័ន្ធ ៤
                      </div>
                    </div>
                  </div>

                  {/* Title in Moul Font */}
                  <div className="text-center my-3">
                    <h2 className="font-moul text-sm sm:text-base text-slate-900 underline underline-offset-8 decoration-slate-400">
                      ឧបករណ៍វាយតម្លៃពិន្ទុចរិយាសម្បទារបស់សិស្ស
                    </h2>
                  </div>

                  {/* Student Info Box */}
                  <div className="flex justify-between items-center my-2 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium">
                    <div>ឈ្មោះសិស្ស៖ <span className="font-bold text-slate-900 text-sm">{s.name}</span></div>
                    <div>ភេទ៖ <span>{s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}</span></div>
                    <div>ថ្នាក់ទី៖ <span className="font-bold">{activeClass?.nameKm || '៦(ក)'}</span></div>
                    <div>ឆ្នាំសិក្សា៖ <span>២០២៦-២០២៧</span></div>
                  </div>

                  {/* 74 Criteria Table grouped by 5 categories */}
                  <table className="w-full border-collapse border border-slate-900 text-[10px] my-2">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-slate-900 p-1 w-8">ល.រ</th>
                        <th className="border border-slate-900 p-1">លក្ខណៈវិនិច្ឆ័យ</th>
                        <th className="border border-slate-900 p-1 w-10">០</th>
                        <th className="border border-slate-900 p-1 w-10">១</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Section 1: ស្អាត */}
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-900 p-1 text-center">I</td>
                        <td className="border border-slate-900 p-1" colSpan={3}>
                          ស្អាត (១៧ លក្ខណៈវិនិច្ឆ័យ)
                        </td>
                      </tr>
                      {APPENDIX_4_CRITERIA.filter(c => c.categoryId === 'clean').map((c) => {
                        const val = rec?.criteriaScores[c.id] ?? c.defaultScore;
                        return (
                          <tr key={c.id}>
                            <td className="border border-slate-900 p-0.5 text-center font-mono">{c.id}</td>
                            <td className="border border-slate-900 p-0.5 px-1.5">{c.criteriaKm}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 0 ? '✓' : ''}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 1 ? '✓' : ''}</td>
                          </tr>
                        );
                      })}

                      {/* Section 2: សុភាព */}
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-900 p-1 text-center">II</td>
                        <td className="border border-slate-900 p-1" colSpan={3}>
                          សុភាព (២២ លក្ខណៈវិនិច្ឆ័យ)
                        </td>
                      </tr>
                      {APPENDIX_4_CRITERIA.filter(c => c.categoryId === 'polite').map((c) => {
                        const val = rec?.criteriaScores[c.id] ?? c.defaultScore;
                        return (
                          <tr key={c.id}>
                            <td className="border border-slate-900 p-0.5 text-center font-mono">{c.id}</td>
                            <td className="border border-slate-900 p-0.5 px-1.5">{c.criteriaKm}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 0 ? '✓' : ''}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 1 ? '✓' : ''}</td>
                          </tr>
                        );
                      })}

                      {/* Section 3: របៀប */}
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-900 p-1 text-center">III</td>
                        <td className="border border-slate-900 p-1" colSpan={3}>
                          របៀប (១៨ លក្ខណៈវិនិច្ឆ័យ)
                        </td>
                      </tr>
                      {APPENDIX_4_CRITERIA.filter(c => c.categoryId === 'discipline').map((c) => {
                        const val = rec?.criteriaScores[c.id] ?? c.defaultScore;
                        return (
                          <tr key={c.id}>
                            <td className="border border-slate-900 p-0.5 text-center font-mono">{c.id}</td>
                            <td className="border border-slate-900 p-0.5 px-1.5">{c.criteriaKm}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 0 ? '✓' : ''}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 1 ? '✓' : ''}</td>
                          </tr>
                        );
                      })}

                      {/* Section 4: ទៀងពេល */}
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-900 p-1 text-center">IV</td>
                        <td className="border border-slate-900 p-1" colSpan={3}>
                          ទៀងពេល (៨ លក្ខណៈវិនិច្ឆ័យ)
                        </td>
                      </tr>
                      {APPENDIX_4_CRITERIA.filter(c => c.categoryId === 'punctual').map((c) => {
                        const val = rec?.criteriaScores[c.id] ?? c.defaultScore;
                        return (
                          <tr key={c.id}>
                            <td className="border border-slate-900 p-0.5 text-center font-mono">{c.id}</td>
                            <td className="border border-slate-900 p-0.5 px-1.5">{c.criteriaKm}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 0 ? '✓' : ''}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 1 ? '✓' : ''}</td>
                          </tr>
                        );
                      })}

                      {/* Section 5: សមាធិ */}
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-900 p-1 text-center">V</td>
                        <td className="border border-slate-900 p-1" colSpan={3}>
                          សមាធិ (១៤ លក្ខណៈវិនិច្ឆ័យ)
                        </td>
                      </tr>
                      {APPENDIX_4_CRITERIA.filter(c => c.categoryId === 'meditation').map((c) => {
                        const val = rec?.criteriaScores[c.id] ?? c.defaultScore;
                        return (
                          <tr key={c.id}>
                            <td className="border border-slate-900 p-0.5 text-center font-mono">{c.id}</td>
                            <td className="border border-slate-900 p-0.5 px-1.5">{c.criteriaKm}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 0 ? '✓' : ''}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-bold font-mono">{val === 1 ? '✓' : ''}</td>
                          </tr>
                        );
                      })}

                      {/* Grand Total Row */}
                      <tr className="font-bold bg-slate-100">
                        <td className="border border-slate-900 p-1.5 text-center" colSpan={2}>
                          ពិន្ទុសរុប (លើ ៧៤)
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-mono text-xs" colSpan={2}>
                          {rec?.totalRawScore ?? 63}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Notes & Grades Checkboxes */}
                  <div className="space-y-1.5 mt-3 text-[10.5px] leading-relaxed">
                    <p className="font-medium">
                      <strong>សម្គាល់៖</strong> ០=មិនបានអនុវត្ត, ១=បានអនុវត្ត
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span>ពិន្ទុសរុបមិនឱ្យលើសពី ១(មួយ)ធៀបនឹងមធ្យមភាគ ១០.០០ = <strong>{(rec?.scoreOn1 ?? 0.85).toFixed(2)}</strong></span>
                      <span className="font-bold ml-2">និទ្ទេស</span>
                      <span className="flex items-center gap-1">
                        [{rec?.grade === 'ល្អ' ? '✓' : ' '}] ល្អ
                      </span>
                      <span className="flex items-center gap-1">
                        [{rec?.grade === 'ល្អបង្គួរ' ? '✓' : ' '}] ល្អបង្គួរ
                      </span>
                      <span className="flex items-center gap-1">
                        [{rec?.grade === 'មធ្យម' ? '✓' : ' '}] មធ្យម
                      </span>
                      <span className="flex items-center gap-1">
                        [{rec?.grade === 'ខ្សោយ' ? '✓' : ' '}] ខ្សោយ
                      </span>
                    </div>
                  </div>

                  {/* Date and Signatures */}
                  <div className="mt-6 flex justify-between items-start text-[10.5px]">
                    <div className="text-center w-48 space-y-1">
                      <div>បានឃើញ និងឯកភាព</div>
                      <div className="font-bold">នាយកសាលា</div>
                      <div className="h-14"></div>
                    </div>

                    <div className="text-center w-56 space-y-1">
                      <div>ថ្ងៃសៅរ៍ ២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស២៥៧០</div>
                      <div>ប្រទង, ថ្ងៃទី១៥ ខែសីហា ឆ្នាំ២០២៦</div>
                      <div className="font-bold">គ្រូបន្ទុកថ្នាក់</div>
                      <div className="h-14 flex items-end justify-center">
                        <span className="font-bold text-slate-800">ផាន សិតការណ៍</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttitudeAssessmentView;
