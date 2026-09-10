import React, { useState, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student, StudentAgreementPlan } from '../../types';
import { 
  GRADE_LETTERS, 
  PTOM_GRADES,
  getGradeBadgeStyle, 
  getRecommendedTarget, 
  createDefaultStudentPlan,
  generateInitialAgreementPlans
} from '../../utils/agreementPlanUtils';
import { calculateSubjectScore } from '../../utils/calculations';
import { AgreementPrintDoc } from './AgreementPrintDoc';
import { PtomLearningPlanDoc } from './PtomLearningPlanDoc';
import { 
  FileText, 
  Printer, 
  Search, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Eye, 
  RotateCcw,
  Edit3,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  FileSpreadsheet,
  Check,
  SlidersHorizontal
} from 'lucide-react';

export const StudentLearningAgreementHub: React.FC = () => {
  const { 
    classStudents, 
    activeClass, 
    activeClassId, 
    schoolProfile, 
    periods,
    scoresMatrix,
    weights,
    studentAgreements, 
    updateStudentAgreement, 
    batchUpdateStudentAgreements, 
    showToast,
    language 
  } = useGradebook();

  // Navigation sub-tabs: PTOM Document (sample matching user PDF), Class Matrix, or 2-page Agreement
  const [hubTab, setHubTab] = useState<'ptom' | 'matrix' | 'agreement_doc'>('ptom');

  // Matrix Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'remedial' | 'incomplete' | 'high'>('all');

  // Preview / Print state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => classStudents[0]?.id || 'stu_1');
  const [isBatchPrintMode, setIsBatchPrintMode] = useState(false);
  const [showStamp, setShowStamp] = useState(true);

  // Edit details modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [modalForm, setModalForm] = useState<Partial<StudentAgreementPlan>>({});

  // Active student agreement
  const currentPlan = useMemo(() => {
    const sId = selectedStudentId || classStudents[0]?.id;
    if (!sId) return null;
    return studentAgreements[sId] || (classStudents.find(s => s.id === sId) ? createDefaultStudentPlan(classStudents.find(s => s.id === sId)!, activeClassId) : null);
  }, [selectedStudentId, studentAgreements, classStudents, activeClassId]);

  // Statistics calculation
  const stats = useMemo(() => {
    let testedCount = 0;
    let khmerRemedial = 0; // F or E
    let mathRemedial = 0; // F or E
    let abcCount = 0; // A, B, or C
    let achievedCount = 0;

    const isAbc = (g?: string) => g === 'A' || g === 'B+' || g === 'B' || g === 'C';

    classStudents.forEach(stu => {
      const plan = studentAgreements[stu.id];
      const hasKhmerBase = plan?.khmer?.baselineGrade;
      const hasMathBase = plan?.math?.baselineGrade;

      if (hasKhmerBase || hasMathBase) {
        testedCount++;
      }

      if (hasKhmerBase === 'F' || hasKhmerBase === 'E') khmerRemedial++;
      if (hasMathBase === 'F' || hasMathBase === 'E') mathRemedial++;

      if (isAbc(hasKhmerBase) || isAbc(hasMathBase)) {
        abcCount++;
      }

      if (plan?.khmer?.endYearTestGrade || plan?.khmer?.achievedGrade) {
        achievedCount++;
      }
    });

    return {
      total: classStudents.length,
      testedCount,
      khmerRemedial,
      mathRemedial,
      abcCount,
      achievedCount,
      remedialTotal: Math.max(khmerRemedial, mathRemedial),
    };
  }, [classStudents, studentAgreements]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    const isAbc = (g?: string) => g === 'A' || g === 'B+' || g === 'B' || g === 'C';

    return classStudents.filter(stu => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (stu.name || '').toLowerCase().includes(q) || (stu.nameKm || '').toLowerCase().includes(q);
        const matchId = (stu.studentIdNumber || stu.id).toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }

      const plan = studentAgreements[stu.id];
      const kBase = plan?.khmer?.baselineGrade;
      const mBase = plan?.math?.baselineGrade;

      if (gradeFilter === 'incomplete') {
        return !kBase || !mBase;
      }
      if (gradeFilter === 'remedial') {
        return kBase === 'F' || kBase === 'E' || mBase === 'F' || mBase === 'E';
      }
      if (gradeFilter === 'high') {
        return isAbc(kBase) || isAbc(mBase);
      }

      return true;
    });
  }, [classStudents, searchQuery, gradeFilter, studentAgreements]);

  // Handle Load Sample PTOM Plans (Directly addressing user prompt)
  const handleLoadSamplePtomPlans = () => {
    const plans = generateInitialAgreementPlans(
      classStudents,
      activeClassId,
      schoolProfile?.academicYear || '២០២៥-២០២៦',
      activeClass?.teacherNameKm || activeClass?.teacherName || 'ផាន សិតការណ៍'
    );
    batchUpdateStudentAgreements(plans);
    if (classStudents[0]) {
      setSelectedStudentId(classStudents[0].id);
    }
    showToast(
      language === 'km' 
        ? `បានបញ្ចូលគំរូផែនការរៀនសូត្រ (PTOM) សម្រាប់សិស្សទាំង ${classStudents.length} នាក់ដោយជោគជ័យ!` 
        : `Successfully loaded sample PTOM learning plans for ${classStudents.length} students!`,
      'success'
    );
  };

  // Handle Auto-Sync Quarterly grades from actual student scores matrix
  const handleAutoSyncQuarters = () => {
    const updates: Record<string, Partial<StudentAgreementPlan>> = {};
    let synced = 0;

    classStudents.forEach(stu => {
      const plan = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);

      const getSubjectAvg = (subjectCode: 'KHM' | 'MTH', pIds: string[]) => {
        let sum = 0, count = 0;
        pIds.forEach(pId => {
          const entry = scoresMatrix[stu.id]?.[pId]?.[subjectCode === 'KHM' ? 'sub_khmer' : 'sub_math'];
          if (entry) {
            const sc = calculateSubjectScore(entry, weights, subjectCode);
            if (sc > 0) { sum += sc; count++; }
          }
        });
        if (count === 0) return undefined;
        return sum / count;
      };

      const scoreToPtomGrade = (sc?: number): string | undefined => {
        if (sc === undefined) return undefined;
        if (sc >= 9.0) return 'A';
        if (sc >= 8.5) return 'B+';
        if (sc >= 8.0) return 'B';
        if (sc >= 7.0) return 'C';
        if (sc >= 6.0) return 'D';
        if (sc >= 5.0) return 'E';
        return 'F';
      };

      // Q1: Nov, Dec
      const kQ1 = scoreToPtomGrade(getSubjectAvg('KHM', ['month_nov', 'month_dec'])) || plan.khmer?.q1Grade;
      // Q2: Jan, Feb, Sem 1 Exam
      const kQ2 = scoreToPtomGrade(getSubjectAvg('KHM', ['month_jan', 'month_feb', 'sem_1_exam'])) || plan.khmer?.q2Grade;
      // Q3: May, Jun
      const kQ3 = scoreToPtomGrade(getSubjectAvg('KHM', ['month_may', 'month_jun'])) || plan.khmer?.q3Grade;
      // Q4: Jul, Sem 2 Exam
      const kQ4 = scoreToPtomGrade(getSubjectAvg('KHM', ['month_jul', 'sem_2_exam'])) || plan.khmer?.q4Grade;
      // End Year Test
      const kEnd = scoreToPtomGrade(getSubjectAvg('KHM', ['sem_2_exam'])) || plan.khmer?.endYearTestGrade;

      // Math
      const mQ1 = scoreToPtomGrade(getSubjectAvg('MTH', ['month_nov', 'month_dec'])) || plan.math?.q1Grade;
      const mQ2 = scoreToPtomGrade(getSubjectAvg('MTH', ['month_jan', 'month_feb', 'sem_1_exam'])) || plan.math?.q2Grade;
      const mQ3 = scoreToPtomGrade(getSubjectAvg('MTH', ['month_may', 'month_jun'])) || plan.math?.q3Grade;
      const mQ4 = scoreToPtomGrade(getSubjectAvg('MTH', ['month_jul', 'sem_2_exam'])) || plan.math?.q4Grade;
      const mEnd = scoreToPtomGrade(getSubjectAvg('MTH', ['sem_2_exam'])) || plan.math?.endYearTestGrade;

      updates[stu.id] = {
        khmer: {
          ...plan.khmer,
          ...(kQ1 ? { q1Grade: kQ1 } : {}),
          ...(kQ2 ? { q2Grade: kQ2 } : {}),
          ...(kQ3 ? { q3Grade: kQ3 } : {}),
          ...(kQ4 ? { q4Grade: kQ4 } : {}),
          ...(kEnd ? { endYearTestGrade: kEnd, achievedGrade: kEnd } : {}),
        },
        math: {
          ...plan.math,
          ...(mQ1 ? { q1Grade: mQ1 } : {}),
          ...(mQ2 ? { q2Grade: mQ2 } : {}),
          ...(mQ3 ? { q3Grade: mQ3 } : {}),
          ...(mQ4 ? { q4Grade: mQ4 } : {}),
          ...(mEnd ? { endYearTestGrade: mEnd, achievedGrade: mEnd } : {}),
        },
      };
      synced++;
    });

    batchUpdateStudentAgreements(updates);
    showToast(
      language === 'km' 
        ? `បានទាញយក និងគណនាលទ្ធផលតាមត្រីមាសសម្រាប់សិស្ស ${synced} នាក់` 
        : `Auto-synced quarterly results for ${synced} students`,
      'success'
    );
  };

  // Quick Auto-fill recommended target grades
  const handleAutoSuggestTargets = () => {
    const updates: Record<string, Partial<StudentAgreementPlan>> = {};
    let count = 0;

    classStudents.forEach(stu => {
      const plan = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);
      const kTarget = plan.khmer?.targetGrade || (plan.khmer?.baselineGrade ? getRecommendedTarget(plan.khmer.baselineGrade) : 'A');
      const mTarget = plan.math?.targetGrade || (plan.math?.baselineGrade ? getRecommendedTarget(plan.math.baselineGrade) : 'A');

      updates[stu.id] = {
        khmer: { ...plan.khmer, targetGrade: kTarget },
        math: { ...plan.math, targetGrade: mTarget },
      };
      count++;
    });

    batchUpdateStudentAgreements(updates);
    showToast(
      language === 'km' 
        ? `បានបំពេញគ្រោងចុងឆ្នាំស្វ័យប្រវត្តិជូនសិស្ស ${count} នាក់` 
        : `Auto-suggested target grades for ${count} students`,
      'success'
    );
  };

  // Open edit modal for student & guardian metadata
  const handleOpenEditModal = (stu: Student) => {
    setEditingStudent(stu);
    const existing = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);
    setModalForm({
      guardianName: existing.guardianName || stu.guardianName || '......................',
      guardianPhone: existing.guardianPhone || stu.guardianPhone || '0882559162',
      teacherName: existing.teacherName || activeClass?.teacherNameKm || activeClass?.teacherName || 'ផាន សិតការណ៍',
      teacherPhone: existing.teacherPhone || schoolProfile?.phone || '0882176987',
      districtOffice: existing.districtOffice || 'ការិយាល័យអប់រំ យុវជននិងកីឡា និងរដ្ឋបាលស្រុកស្ទឹងត្រង់',
      locationPlace: existing.locationPlace || 'ប្រទង',
      agreementDateSolar: existing.agreementDateSolar || '2026-01-19',
      agreementDateLunar: existing.agreementDateLunar || 'ថ្ងៃចន្ទ ១កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
      notes: existing.notes || '',
    });
  };

  // Save modal details
  const handleSaveModal = () => {
    if (!editingStudent) return;
    updateStudentAgreement(editingStudent.id, modalForm);
    setEditingStudent(null);
    showToast(language === 'km' ? 'បានរក្សាទុកព័ត៌មានកិច្ចព្រមព្រៀង' : 'Agreement details saved', 'success');
  };

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Export PLP & PTOM Table to CSV
  const handleExportCSV = () => {
    const headers = [
      'លេខរៀង',
      'អត្តលេខ',
      'គោត្តនាម-នាម',
      'ភេទ',
      'អាណាព្យាបាល',
      'ទូរស័ព្ទអាណាព្យាបាល',
      'ខ្មែរ_ដើមឆ្នាំ',
      'ខ្មែរ_ត្រី១',
      'ខ្មែរ_ត្រី២',
      'ខ្មែរ_ត្រី៣',
      'ខ្មែរ_ត្រី៤',
      'ខ្មែរ_ចុងឆ្នាំ',
      'គណិត_ដើមឆ្នាំ',
      'គណិត_ត្រី១',
      'គណិត_ត្រី២',
      'គណិត_ត្រី៣',
      'គណិត_ត្រី៤',
      'គណិត_ចុងឆ្នាំ',
    ];

    const rows = classStudents.map((stu, idx) => {
      const plan = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);
      return [
        idx + 1,
        stu.studentIdNumber || stu.id,
        `"${stu.nameKm || stu.name}"`,
        stu.gender === 'F' || stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
        `"${plan.guardianName || stu.guardianName || ''}"`,
        `"${plan.guardianPhone || stu.guardianPhone || ''}"`,
        plan.khmer?.baselineGrade || '',
        plan.khmer?.q1Grade || '',
        plan.khmer?.q2Grade || '',
        plan.khmer?.q3Grade || '',
        plan.khmer?.q4Grade || '',
        plan.khmer?.endYearTestGrade || plan.khmer?.achievedGrade || '',
        plan.math?.baselineGrade || '',
        plan.math?.q1Grade || '',
        plan.math?.q2Grade || '',
        plan.math?.q3Grade || '',
        plan.math?.q4Grade || '',
        plan.math?.endYearTestGrade || plan.math?.achievedGrade || '',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PTOM_Learning_Plan_${activeClass?.nameKm || 'Class'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Next and Prev student helpers
  const currentStudentIndex = classStudents.findIndex(s => s.id === selectedStudentId);
  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setSelectedStudentId(classStudents[currentStudentIndex - 1].id);
    }
  };
  const handleNextStudent = () => {
    if (currentStudentIndex < classStudents.length - 1) {
      setSelectedStudentId(classStudents[currentStudentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card (Hidden in Print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                គំរូផ្លូវការ PTOM / PLP
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                {activeClass?.nameKm || activeClass?.name || 'ថ្នាក់ទី ៦ (ក)'}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
                ឆ្នាំសិក្សា {schoolProfile?.academicYear || '២០២៥-២០២៦'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-moul text-slate-900 dark:text-white leading-relaxed">
              ផែនការរៀនសូត្រប្រចាំឆ្នាំរបស់សិស្សម្នាក់ៗ (PTOM)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              តាមដានលទ្ធផលតេស្តដើមឆ្នាំ លទ្ធផលសិក្សាតាមត្រីមាសទី១ ទី២ ទី៣ ទី៤ និងតេស្តចុងឆ្នាំ លើមុខវិជ្ជាភាសាខ្មែរ និងគណិតវិទ្យា តាមកម្រិតនិទ្ទេស ៤ កម្រិត ស្របតាមទម្រង់ផ្លូវការរបស់ក្រសួងអប់រំ យុវជន និងកីឡា។
            </p>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setHubTab('ptom')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                hubTab === 'ptom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              ផែនការរៀនសូត្រ (PTOM)
            </button>

            <button
              onClick={() => setHubTab('matrix')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                hubTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              តារាងបញ្ចូលពិន្ទុរួម
            </button>

            <button
              onClick={() => setHubTab('agreement_doc')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                hubTab === 'agreement_doc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              កិច្ចព្រមព្រៀងគ្រូ-មាតាបិតា
            </button>

            {/* Direct Sample Data Generator Button */}
            <button
              onClick={handleLoadSamplePtomPlans}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all cursor-pointer"
              title="បញ្ចូលគំរូទិន្នន័យផ្លូវការ PTOM ដូចក្នុងឯកសារគំរូរបស់ក្រសួង"
            >
              <Sparkles className="w-4 h-4" />
              បញ្ចូលគំរូផែនការរៀនសូត្រ
            </button>
          </div>
        </div>

        {/* Quick KPI Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <span>សិស្សមានផែនការ PTOM</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.testedCount} <span className="text-xs font-normal text-slate-500">/ {stats.total} នាក់</span>
            </div>
          </div>

          <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200/80 dark:border-rose-900/40">
            <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 font-medium mb-1">
              <span>កម្រិត ១ & ២ (ត្រូវការជួយ)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-rose-700 dark:text-rose-300">
              {stats.remedialTotal} <span className="text-xs font-normal text-rose-600 dark:text-rose-400">នាក់ (F & E)</span>
            </div>
          </div>

          <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200/80 dark:border-purple-900/40">
            <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-medium mb-1">
              <span>កម្រិត A, B & C</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
              {stats.abcCount} <span className="text-xs font-normal text-purple-600 dark:text-purple-400">នាក់</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
              <span>សម្រេចតេស្តចុងឆ្នាំ</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.achievedCount} <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">/ {stats.total} នាក់</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: PTOM OFFICIAL LEARNING PLAN DOCUMENT (A4 PRINT & PREVIEW)
          Exact reproduction of the user's uploaded sample document
          ===================================================================== */}
      {hubTab === 'ptom' && (
        <div className="space-y-6">
          {/* Top Control Bar (Hidden when printing) */}
          <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Student Navigation Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                ជ្រើសរើសសិស្ស ៖
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevStudent}
                  disabled={currentStudentIndex <= 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  title="សិស្សមុន"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setIsBatchPrintMode(false);
                  }}
                  className="px-3 py-1.5 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {classStudents.map((stu, idx) => (
                    <option key={stu.id} value={stu.id}>
                      {idx + 1}. {stu.nameKm || stu.name} ({stu.gender === 'F' || stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleNextStudent}
                  disabled={currentStudentIndex >= classStudents.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  title="សិស្សបន្ទាប់"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Student / Plan Metadata */}
              {(() => {
                const stu = classStudents.find(s => s.id === selectedStudentId) || classStudents[0];
                if (!stu) return null;
                return (
                  <button
                    onClick={() => handleOpenEditModal(stu)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    កែសម្រួលព័ត៌មាន
                  </button>
                );
              })()}
            </div>

            {/* Print & Batch Options */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={isBatchPrintMode}
                  onChange={(e) => setIsBatchPrintMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>បោះពុម្ពទាំងអស់ ({classStudents.length} នាក់)</span>
              </label>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                បោះពុម្ពផែនការ PTOM (A4)
              </button>
            </div>
          </div>

          {/* Document Content Rendering */}
          <div className="flex justify-center">
            {isBatchPrintMode ? (
              // Batch Print Mode: Every student on its own page
              <div className="space-y-8 w-full max-w-[880px] print:w-full print:max-w-none print:space-y-0">
                {classStudents.map((stu) => {
                  const plan = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);
                  return (
                    <div key={stu.id} className="bg-white shadow-md print:shadow-none rounded-lg print:rounded-none overflow-hidden page-break-after">
                      <PtomLearningPlanDoc
                        student={stu}
                        plan={plan}
                        className={activeClass?.nameKm || activeClass?.name || '៦ (ក)'}
                        schoolName={activeClass?.schoolNameKm || schoolProfile?.schoolNameKm || 'បឋមសិក្សា ហ៊ុនណេងប្រទង'}
                        province={activeClass?.province || schoolProfile?.province || 'កំពង់ចាម'}
                        academicYear={activeClass?.academicYear || schoolProfile?.academicYear || '២០២៥-២០២៦'}
                        teacherName={plan.teacherName || activeClass?.teacherNameKm || activeClass?.teacherName || 'ផាន សិតការណ៍'}
                        teacherPhone={plan.teacherPhone || schoolProfile?.phone || '0882176987'}
                        guardianName={plan.guardianName || stu.guardianName || '......................'}
                        guardianPhone={plan.guardianPhone || stu.guardianPhone || '0882559162'}
                        districtOffice={plan.districtOffice || 'ការិយាល័យអប់រំ យុវជននិងកីឡា និងរដ្ឋបាលស្រុកស្ទឹងត្រង់'}
                        locationPlace={plan.locationPlace || 'ប្រទង'}
                        solarDateText={plan.agreementDateSolar ? `ថ្ងៃទី១៩ ខែមករា ឆ្នាំ២០២៦` : 'ថ្ងៃទី១៩ ខែមករា ឆ្នាំ២០២៦'}
                        lunarDateText={plan.agreementDateLunar || 'ថ្ងៃចន្ទ ១កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩'}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              // Single Student Preview Mode
              <div className="w-full max-w-[880px] shadow-lg print:shadow-none rounded-lg print:rounded-none overflow-hidden bg-white">
                {(() => {
                  const stu = classStudents.find(s => s.id === selectedStudentId) || classStudents[0];
                  if (!stu) return null;
                  const plan = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);
                  return (
                    <PtomLearningPlanDoc
                      student={stu}
                      plan={plan}
                      className={activeClass?.nameKm || activeClass?.name || '៦ (ក)'}
                      schoolName={activeClass?.schoolNameKm || schoolProfile?.schoolNameKm || 'បឋមសិក្សា ហ៊ុនណេងប្រទង'}
                      province={activeClass?.province || schoolProfile?.province || 'កំពង់ចាម'}
                      academicYear={activeClass?.academicYear || schoolProfile?.academicYear || '២០២៥-២០២៦'}
                      teacherName={plan.teacherName || activeClass?.teacherNameKm || activeClass?.teacherName || 'ផាន សិតការណ៍'}
                      teacherPhone={plan.teacherPhone || schoolProfile?.phone || '0882176987'}
                      guardianName={plan.guardianName || stu.guardianName || '......................'}
                      guardianPhone={plan.guardianPhone || stu.guardianPhone || '0882559162'}
                      districtOffice={plan.districtOffice || 'ការិយាល័យអប់រំ យុវជននិងកីឡា និងរដ្ឋបាលស្រុកស្ទឹងត្រង់'}
                      locationPlace={plan.locationPlace || 'ប្រទង'}
                      solarDateText={plan.agreementDateSolar ? `ថ្ងៃទី១៩ ខែមករា ឆ្នាំ២០២៦` : 'ថ្ងៃទី១៩ ខែមករា ឆ្នាំ២០២៦'}
                      lunarDateText={plan.agreementDateLunar || 'ថ្ងៃចន្ទ ១កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩'}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CLASS MATRIX ENTRY (បញ្ចូលលទ្ធផលតេស្តដើមឆ្នាំ & ត្រីមាសទាំង៤)
          ===================================================================== */}
      {hubTab === 'matrix' && (
        <div className="no-print space-y-4">
          {/* Action Bar & Filter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Search & Filter pills */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setGradeFilter('all')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    gradeFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  ទាំងអស់ ({classStudents.length})
                </button>
                <button
                  onClick={() => setGradeFilter('remedial')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    gradeFilter === 'remedial'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
                  }`}
                >
                  កម្រិត F & E ({stats.remedialTotal})
                </button>
                <button
                  onClick={() => setGradeFilter('high')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    gradeFilter === 'high'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-600 dark:text-purple-400 hover:text-purple-700'
                  }`}
                >
                  កម្រិត A, B & C ({stats.abcCount})
                </button>
              </div>
            </div>

            {/* Bulk helper buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAutoSyncQuarters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                title="ទាញយកពិន្ទុពីការបញ្ចូលពិន្ទុប្រចាំខែ/ឆមាសមកគណនាត្រីមាសស្វ័យប្រវត្តិ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ទាញយកលទ្ធផលត្រីមាសពីពិន្ទុ
              </button>

              <button
                onClick={handleAutoSuggestTargets}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                title="ស្នើទិសដៅគ្រោងចុងឆ្នាំស្វ័យប្រវត្តិ"
              >
                <Sparkles className="w-3.5 h-3.5" />
                បំពេញគ្រោងស្វ័យប្រវត្តិ
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                ទាញយក CSV
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
                <thead>
                  {/* Top Level Category Headers */}
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <th rowSpan={2} className="p-3 font-bold text-center w-12 border-r border-slate-200 dark:border-slate-700">
                      ល.រ
                    </th>
                    <th rowSpan={2} className="p-3 font-bold w-48 border-r border-slate-200 dark:border-slate-700">
                      ឈ្មោះសិស្ស
                    </th>
                    <th colSpan={6} className="p-2 font-bold text-center bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-r border-blue-200 dark:border-blue-800">
                      មុខវិជ្ជា ភាសាខ្មែរ (លទ្ធផល PTOM)
                    </th>
                    <th colSpan={6} className="p-2 font-bold text-center bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-800">
                      មុខវិជ្ជា គណិតវិទ្យា (លទ្ធផល PTOM)
                    </th>
                    <th rowSpan={2} className="p-3 font-bold text-center w-28">
                      សកម្មភាព
                    </th>
                  </tr>
                  {/* Sub-column headers */}
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-[11px]">
                    {/* Khmer Columns */}
                    <th className="p-1.5 text-center font-semibold bg-blue-50/40 dark:bg-blue-950/20">ដើមឆ្នាំ</th>
                    <th className="p-1.5 text-center font-semibold bg-blue-50/40 dark:bg-blue-950/20">ត្រី១</th>
                    <th className="p-1.5 text-center font-semibold bg-blue-50/40 dark:bg-blue-950/20">ត្រី២</th>
                    <th className="p-1.5 text-center font-semibold bg-blue-50/40 dark:bg-blue-950/20">ត្រី៣</th>
                    <th className="p-1.5 text-center font-semibold bg-blue-50/40 dark:bg-blue-950/20">ត្រី៤</th>
                    <th className="p-1.5 text-center font-semibold bg-blue-50/40 dark:bg-blue-950/20 border-r border-blue-200 dark:border-blue-800">ចុងឆ្នាំ</th>

                    {/* Math Columns */}
                    <th className="p-1.5 text-center font-semibold bg-emerald-50/40 dark:bg-emerald-950/20">ដើមឆ្នាំ</th>
                    <th className="p-1.5 text-center font-semibold bg-emerald-50/40 dark:bg-emerald-950/20">ត្រី១</th>
                    <th className="p-1.5 text-center font-semibold bg-emerald-50/40 dark:bg-emerald-950/20">ត្រី២</th>
                    <th className="p-1.5 text-center font-semibold bg-emerald-50/40 dark:bg-emerald-950/20">ត្រី៣</th>
                    <th className="p-1.5 text-center font-semibold bg-emerald-50/40 dark:bg-emerald-950/20">ត្រី៤</th>
                    <th className="p-1.5 text-center font-semibold bg-emerald-50/40 dark:bg-emerald-950/20 border-r border-emerald-200 dark:border-emerald-800">ចុងឆ្នាំ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="p-8 text-center text-slate-500">
                        រកមិនឃើញសិស្សតាមលក្ខខណ្ឌស្វែងរកនេះឡើយ។
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu, idx) => {
                      const plan = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);

                      // Helper function to render a quick select cell
                      const renderGradeCell = (
                        subject: 'khmer' | 'math',
                        field: 'baselineGrade' | 'q1Grade' | 'q2Grade' | 'q3Grade' | 'q4Grade' | 'endYearTestGrade',
                        currentValue?: string
                      ) => {
                        return (
                          <div className="flex items-center justify-center">
                            <select
                              value={currentValue || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateStudentAgreement(stu.id, {
                                  [subject]: {
                                    ...plan[subject],
                                    [field]: val || undefined,
                                    ...(field === 'endYearTestGrade' ? { achievedGrade: val || undefined } : {})
                                  }
                                });
                              }}
                              className={`w-14 text-center py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                                currentValue
                                  ? getGradeBadgeStyle(currentValue as any)
                                  : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <option value="">-</option>
                              {PTOM_GRADES.map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                        );
                      };

                      return (
                        <tr key={stu.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2 text-center text-slate-500 font-semibold border-r border-slate-100 dark:border-slate-800">
                            {idx + 1}
                          </td>
                          <td className="p-2.5 border-r border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {stu.nameKm || stu.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {stu.gender === 'F' || stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'} • {stu.studentIdNumber || stu.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Khmer Columns */}
                          <td className="p-1.5 bg-blue-50/20 dark:bg-blue-950/10">
                            {renderGradeCell('khmer', 'baselineGrade', plan.khmer?.baselineGrade as string)}
                          </td>
                          <td className="p-1.5 bg-blue-50/20 dark:bg-blue-950/10">
                            {renderGradeCell('khmer', 'q1Grade', plan.khmer?.q1Grade)}
                          </td>
                          <td className="p-1.5 bg-blue-50/20 dark:bg-blue-950/10">
                            {renderGradeCell('khmer', 'q2Grade', plan.khmer?.q2Grade)}
                          </td>
                          <td className="p-1.5 bg-blue-50/20 dark:bg-blue-950/10">
                            {renderGradeCell('khmer', 'q3Grade', plan.khmer?.q3Grade)}
                          </td>
                          <td className="p-1.5 bg-blue-50/20 dark:bg-blue-950/10">
                            {renderGradeCell('khmer', 'q4Grade', plan.khmer?.q4Grade)}
                          </td>
                          <td className="p-1.5 bg-blue-50/30 dark:bg-blue-950/20 border-r border-blue-200 dark:border-blue-800">
                            {renderGradeCell('khmer', 'endYearTestGrade', plan.khmer?.endYearTestGrade || (plan.khmer?.achievedGrade as string))}
                          </td>

                          {/* Math Columns */}
                          <td className="p-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                            {renderGradeCell('math', 'baselineGrade', plan.math?.baselineGrade as string)}
                          </td>
                          <td className="p-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                            {renderGradeCell('math', 'q1Grade', plan.math?.q1Grade)}
                          </td>
                          <td className="p-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                            {renderGradeCell('math', 'q2Grade', plan.math?.q2Grade)}
                          </td>
                          <td className="p-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                            {renderGradeCell('math', 'q3Grade', plan.math?.q3Grade)}
                          </td>
                          <td className="p-1.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                            {renderGradeCell('math', 'q4Grade', plan.math?.q4Grade)}
                          </td>
                          <td className="p-1.5 bg-emerald-50/30 dark:bg-emerald-950/20 border-r border-emerald-200 dark:border-emerald-800">
                            {renderGradeCell('math', 'endYearTestGrade', plan.math?.endYearTestGrade || (plan.math?.achievedGrade as string))}
                          </td>

                          {/* Action Button */}
                          <td className="p-2 text-center">
                            <button
                              onClick={() => {
                                setSelectedStudentId(stu.id);
                                setIsBatchPrintMode(false);
                                setHubTab('ptom');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              ផែនការ
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: 2-PAGE TEACHER-PARENT AGREEMENT DOCUMENT (PRINT & PREVIEW)
          ===================================================================== */}
      {hubTab === 'agreement_doc' && (
        <div className="space-y-6">
          {/* Top Control Bar (Hidden when printing) */}
          <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Student Navigation Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                ជ្រើសរើសសិស្ស ៖
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevStudent}
                  disabled={currentStudentIndex <= 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  title="សិស្សមុន"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setIsBatchPrintMode(false);
                  }}
                  className="px-3 py-1.5 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {classStudents.map((stu, idx) => (
                    <option key={stu.id} value={stu.id}>
                      {idx + 1}. {stu.nameKm || stu.name} ({stu.gender === 'F' || stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleNextStudent}
                  disabled={currentStudentIndex >= classStudents.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  title="សិស្សបន្ទាប់"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Student Details */}
              {(() => {
                const stu = classStudents.find(s => s.id === selectedStudentId) || classStudents[0];
                if (!stu) return null;
                return (
                  <button
                    onClick={() => handleOpenEditModal(stu)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    កែសម្រួលព័ត៌មាន
                  </button>
                );
              })()}
            </div>

            {/* Print & Stamp Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={showStamp}
                  onChange={(e) => setShowStamp(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>ត្រាសាលារៀន (School Stamp)</span>
              </label>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                បោះពុម្ពកិច្ចព្រមព្រៀង (A4)
              </button>
            </div>
          </div>

          {/* Document Content Rendering */}
          <div className="flex justify-center">
            <div className="w-full max-w-[850px] shadow-lg print:shadow-none rounded-lg print:rounded-none overflow-hidden bg-white">
              {(() => {
                const stu = classStudents.find(s => s.id === selectedStudentId) || classStudents[0];
                if (!stu) return null;
                const plan = studentAgreements[stu.id] || createDefaultStudentPlan(stu, activeClassId);
                return (
                  <AgreementPrintDoc
                    student={stu}
                    plan={plan}
                    activeClass={activeClass}
                    schoolProfile={schoolProfile}
                    showStamp={showStamp}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          EDIT GUARDIAN & AGREEMENT DATES MODAL
          ===================================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  កែប្រែព័ត៌មានផែនការរៀនសូត្រ & កិច្ចព្រមព្រៀង
                </h3>
                <p className="text-xs text-slate-500">
                  សិស្ស៖ {editingStudent.nameKm || editingStudent.name} (ថ្នាក់ទី {activeClass?.nameKm || '៦'})
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ការិយាល័យអប់រំ / រដ្ឋបាលស្រុក
                </label>
                <input
                  type="text"
                  value={modalForm.districtOffice || ''}
                  onChange={(e) => setModalForm(prev => ({ ...prev, districtOffice: e.target.value }))}
                  placeholder="ការិយាល័យអប់រំ យុវជននិងកីឡា និងរដ្ឋបាលស្រុកស្ទឹងត្រង់"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះមាតាបិតា / អាណាព្យាបាល
                  </label>
                  <input
                    type="text"
                    value={modalForm.guardianName || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, guardianName: e.target.value }))}
                    placeholder="ឈ្មោះឪពុក ឬម្តាយ..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    លេខទូរស័ព្ទអាណាព្យាបាល
                  </label>
                  <input
                    type="text"
                    value={modalForm.guardianPhone || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                    placeholder="088 xxx xxxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះគ្រូទទួលបន្ទុកថ្នាក់
                  </label>
                  <input
                    type="text"
                    value={modalForm.teacherName || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, teacherName: e.target.value }))}
                    placeholder="ផាន សិតការណ៍"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    លេខទូរស័ព្ទគ្រូបង្រៀន
                  </label>
                  <input
                    type="text"
                    value={modalForm.teacherPhone || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, teacherPhone: e.target.value }))}
                    placeholder="088 xxx xxxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ទីកន្លែងធ្វើ (ធ្វើនៅ...)
                  </label>
                  <input
                    type="text"
                    value={modalForm.locationPlace || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, locationPlace: e.target.value }))}
                    placeholder="ប្រទង"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    កាលបរិច្ឆេទសុរិយគតិ (Solar Date)
                  </label>
                  <input
                    type="date"
                    value={modalForm.agreementDateSolar || '2026-01-19'}
                    onChange={(e) => setModalForm(prev => ({ ...prev, agreementDateSolar: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  កាលបរិច្ឆេទចន្ទគតិ (Lunar Date)
                </label>
                <input
                  type="text"
                  value={modalForm.agreementDateLunar || ''}
                  onChange={(e) => setModalForm(prev => ({ ...prev, agreementDateLunar: e.target.value }))}
                  placeholder="ថ្ងៃចន្ទ ១កើត ខែមាឃ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  កំណត់សម្គាល់បន្ថែម
                </label>
                <textarea
                  value={modalForm.notes || ''}
                  onChange={(e) => setModalForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="ចំណុចពិសេសដែលត្រូវជួយបន្ថែមលើសិស្ស..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                onClick={handleSaveModal}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
