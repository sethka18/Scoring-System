import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  BookOpen, 
  Brain, 
  Heart, 
  CheckCircle2, 
  Sparkles,
  Download,
  RotateCcw,
  Check,
  Building2,
  Calendar
} from 'lucide-react';
import { useGradebook } from '../../context/GradebookContext';
import { Student } from '../../types';
import { 
  ATTITUDE_CRITERIA, 
  DEFAULT_SKILL_RUBRIC, 
  SkillRubricItem,
  getDefaultAttitudeRecords,
  StudentAttitudeEvaluationRecord 
} from '../../data/attitudeEvaluationData';
import { exportSingleStudentMultiSheetExcel, exportAllStudentsClassWorkbook } from '../../utils/multiSheetExcelExport';
import { calculateSubjectScore } from '../../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialStudentId?: string;
}

export const MultiPillarStudentReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialStudentId,
}) => {
  const {
    classStudents,
    subjects,
    periods,
    scoresMatrix,
    weights,
    schoolProfile,
    activeClass,
    updateStudent,
  } = useGradebook();

  const [activeStudentId, setActiveStudentId] = useState<string>(
    initialStudentId || classStudents[0]?.id || 'stu_1'
  );

  const [activeTab, setActiveTab] = useState<'knowledge' | 'skills' | 'attitude' | 'annual'>('annual');

  // Attitude records in state initialized with MoEYS Appendix 4 data (63 / 74 default)
  const [attitudeRecords, setAttitudeRecords] = useState<Record<string, StudentAttitudeEvaluationRecord>>(() => {
    try {
      const saved = localStorage.getItem('moeys_appendix4_records');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getDefaultAttitudeRecords();
  });

  // Skills state
  const [skillRubrics, setSkillRubrics] = useState<SkillRubricItem[]>(() => DEFAULT_SKILL_RUBRIC);

  if (!isOpen) return null;

  const currentStudent = classStudents.find(s => s.id === activeStudentId) || classStudents[0];
  const currentIndex = classStudents.findIndex(s => s.id === currentStudent?.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveStudentId(classStudents[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < classStudents.length - 1) {
      setActiveStudentId(classStudents[currentIndex + 1].id);
    }
  };

  const studentAttitude = attitudeRecords[currentStudent?.id] || {
    studentName: currentStudent?.name || '',
    studentId: currentStudent?.id || '',
    className: '៦(ក)',
    scores: {},
    totalScore: 63,
    maxScore: 74,
    scaledTen: 8.51,
    scaledOne: 0.85,
    grade: 'ល្អ',
    lunarDateKm: 'ថ្ងៃសៅរ៍ ២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស២៥៧០',
    solarDateKm: 'ប្រទង, ថ្ងៃទី១៥ ខែសីហា ឆ្នាំ២០២៦',
    principalNameKm: 'នាយកសាលា',
    teacherNameKm: 'ផាន សិតការណ៍',
  };

  // Toggle criterion score (0 or 1)
  const toggleCriterionScore = (criterionId: string) => {
    const currentVal = studentAttitude.scores[criterionId] !== undefined
      ? studentAttitude.scores[criterionId]
      : (ATTITUDE_CRITERIA.find(c => c.id === criterionId)?.defaultScore ?? 1);
    
    const newVal = currentVal === 1 ? 0 : 1;
    const newScores = { ...studentAttitude.scores, [criterionId]: newVal };

    // Recalculate total
    let total = 0;
    ATTITUDE_CRITERIA.forEach(c => {
      const sc = newScores[c.id] !== undefined ? newScores[c.id] : c.defaultScore;
      total += sc;
    });

    const scaledTen = Number(((total / 74) * 10).toFixed(2));
    const scaledOne = Number((total / 74).toFixed(2));
    const grade = scaledTen >= 8.0 ? 'ល្អ' : scaledTen >= 6.5 ? 'ល្អបង្គួរ' : scaledTen >= 5.0 ? 'មធ្យម' : 'ខ្សោយ';

    const updatedRecord: StudentAttitudeEvaluationRecord = {
      ...studentAttitude,
      scores: newScores,
      totalScore: total,
      scaledTen,
      scaledOne,
      grade,
    };

    const updatedAll = {
      ...attitudeRecords,
      [currentStudent.id]: updatedRecord,
    };

    setAttitudeRecords(updatedAll);
    try {
      localStorage.setItem('moeys_appendix4_records', JSON.stringify(updatedAll));
    } catch {
      // ignore
    }

    // Also update student's attitudeScore in gradebook
    updateStudent(currentStudent.id, {
      attitudeScore: scaledTen,
      conductRating: grade,
    });
  };

  const resetAttitudeToDefault = () => {
    const defaultMap: Record<string, number> = {};
    ATTITUDE_CRITERIA.forEach(c => {
      defaultMap[c.id] = c.defaultScore;
    });

    const resetRecord: StudentAttitudeEvaluationRecord = {
      ...studentAttitude,
      scores: defaultMap,
      totalScore: 63,
      scaledTen: 8.51,
      scaledOne: 0.85,
      grade: 'ល្អ',
    };

    const updatedAll = {
      ...attitudeRecords,
      [currentStudent.id]: resetRecord,
    };

    setAttitudeRecords(updatedAll);
    try {
      localStorage.setItem('moeys_appendix4_records', JSON.stringify(updatedAll));
    } catch {
      // ignore
    }

    updateStudent(currentStudent.id, {
      attitudeScore: 8.51,
      conductRating: 'ល្អ',
    });
  };

  // Requested Periods: Dec, Jan, Feb, Sem 1, May, Jun, Jul, Sem 2
  const sem1MonthPeriods = periods.filter(p => p.semester === 1 && !p.isExam);
  const sem1ExamPeriod = periods.find(p => p.semester === 1 && p.isExam);
  const sem2MonthPeriods = periods.filter(p => p.semester === 2 && !p.isExam);
  const sem2ExamPeriod = periods.find(p => p.semester === 2 && p.isExam);

  // Calculate knowledge scores for the student
  let totalSem1Sum = 0;
  let totalSem2Sum = 0;
  let totalAnnualKnowledgeSum = 0;

  const subjectScoresData = subjects.map(subj => {
    // Sem 1
    let s1Sum = 0;
    let s1Count = 0;
    const s1MonthScores = sem1MonthPeriods.map(p => {
      const entry = scoresMatrix[currentStudent.id]?.[p.id]?.[subj.id];
      const sc = entry ? calculateSubjectScore(entry, weights, subj.code) : 0;
      s1Sum += sc;
      s1Count++;
      return { periodId: p.id, periodName: p.nameKm, score: sc };
    });

    let s1ExamScore = 0;
    if (sem1ExamPeriod) {
      const entry = scoresMatrix[currentStudent.id]?.[sem1ExamPeriod.id]?.[subj.id];
      s1ExamScore = entry ? calculateSubjectScore(entry, weights, subj.code) : 0;
      s1Sum += s1ExamScore;
      s1Count++;
    }

    const sem1Avg = s1Count > 0 ? Number((s1Sum / s1Count).toFixed(2)) : 0;
    totalSem1Sum += sem1Avg;

    // Sem 2
    let s2Sum = 0;
    let s2Count = 0;
    const s2MonthScores = sem2MonthPeriods.map(p => {
      const entry = scoresMatrix[currentStudent.id]?.[p.id]?.[subj.id];
      const sc = entry ? calculateSubjectScore(entry, weights, subj.code) : 0;
      s2Sum += sc;
      s2Count++;
      return { periodId: p.id, periodName: p.nameKm, score: sc };
    });

    let s2ExamScore = 0;
    if (sem2ExamPeriod) {
      const entry = scoresMatrix[currentStudent.id]?.[sem2ExamPeriod.id]?.[subj.id];
      s2ExamScore = entry ? calculateSubjectScore(entry, weights, subj.code) : 0;
      s2Sum += s2ExamScore;
      s2Count++;
    }

    const sem2Avg = s2Count > 0 ? Number((s2Sum / s2Count).toFixed(2)) : 0;
    totalSem2Sum += sem2Avg;

    const annualSubjAvg = Number(((sem1Avg + sem2Avg) / 2).toFixed(2));
    totalAnnualKnowledgeSum += annualSubjAvg;

    return {
      subject: subj,
      s1MonthScores,
      s1ExamScore,
      sem1Avg,
      s2MonthScores,
      s2ExamScore,
      sem2Avg,
      annualSubjAvg,
    };
  });

  const subjCount = subjects.length || 1;
  const overallSem1Avg = Number((totalSem1Sum / subjCount).toFixed(2));
  const overallSem2Avg = Number((totalSem2Sum / subjCount).toFixed(2));
  const overallAnnualKnowledge = Number((totalAnnualKnowledgeSum / subjCount).toFixed(2));

  // Consolidated 3 Pillars: 80% Knowledge, 10% Skill, 10% Attitude
  const skillScore = currentStudent.skillScore ?? 8.5;
  const attitudeScore = studentAttitude.scaledTen; // out of 10.00

  const knowledgeWeighted = Number((overallAnnualKnowledge * 0.8).toFixed(2));
  const skillWeighted = Number((skillScore * 0.1).toFixed(2));
  const attitudeWeighted = Number((attitudeScore * 0.1).toFixed(2));
  const grandTotal = Number((knowledgeWeighted + skillWeighted + attitudeWeighted).toFixed(2));

  let finalGradeLabel = 'មធ្យម';
  if (grandTotal >= 8.5) finalGradeLabel = 'ល្អប្រសើរ (A)';
  else if (grandTotal >= 7.5) finalGradeLabel = 'ល្អណាស់ (B)';
  else if (grandTotal >= 6.5) finalGradeLabel = 'ល្អ (C)';
  else if (grandTotal >= 5.0) finalGradeLabel = 'មធ្យម (D)';
  else finalGradeLabel = 'ខ្សោយ (F)';

  const handleExportExcel = () => {
    exportSingleStudentMultiSheetExcel({
      student: currentStudent,
      periods,
      subjects,
      scoresMatrix,
      weights,
      schoolProfile,
      activeClass,
      attitudeScores: studentAttitude.scores,
      attitudeTotal: studentAttitude.totalScore,
    });
  };

  const handleExportClassExcel = () => {
    exportAllStudentsClassWorkbook(
      classStudents,
      periods,
      subjects,
      scoresMatrix,
      weights,
      schoolProfile,
      activeClass
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Modal Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black font-heading tracking-wide">
                  របាយការណ៍វាយតម្លៃសិស្ស (វិជ្ជា ៨០% + បំណិន ១០% + ចរិយា ១០%)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  MoEYS Standard
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-sans">
                {schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុន ណេង ប្រទង'} • ថ្នាក់ទី {activeClass?.nameKm || '៦(ក)'} • ឆ្នាំសិក្សា ២០២៦-២០២៧
              </p>
            </div>
          </div>

          {/* Quick Student Selector */}
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-200"
              title="សិស្សមុន"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="bg-transparent text-xs font-black text-amber-300 focus:outline-hidden cursor-pointer"
            >
              {classStudents.map((s, idx) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {idx + 1}. {s.name} ({s.studentId})
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={currentIndex >= classStudents.length - 1}
              className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-200"
              title="សិស្សបន្ទាប់"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actions: Export Excel & Close */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition cursor-pointer"
              title="ទាញយកសន្លឹកកិច្ចការ Excel ដែលមាន Sheet ចំនួន ៤ ផ្សេងគ្នា"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ទាញយក Excel (សន្លឹកច្រើន .xlsx)</span>
            </button>

            <button
              onClick={handleExportClassExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
              title="ទាញយក Excel សិស្សទាំងអស់ក្នុងថ្នាក់"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel ទាំងថ្នាក់</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ព</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Matching Excel Sheets) */}
        <div className="bg-slate-100 px-6 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-200 gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('annual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'annual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>សរុបលទ្ធផល ៣ វិស័យ (៨០-១០-១០)</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>សន្លឹក ១៖ វិជ្ជាសម្បទា (៨០%)</span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>សន្លឹក ២៖ បំណិនសម្បទា (១០%)</span>
            </button>

            <button
              onClick={() => setActiveTab('attitude')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'attitude'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>សន្លឹក ៣៖ ឧបសម្ព័ន្ធ៤-ចរិយាសម្បទា ({studentAttitude.totalScore}/៧៤)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
            <span>សិស្ស៖</span>
            <span className="font-black text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {currentStudent.name} ({currentStudent.gender === 'Female' ? 'ស្រី' : 'ប្រុស'})
            </span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* TAB 1: វិជ្ជាសម្បទា (KNOWLEDGE - 80%) */}
          {activeTab === 'knowledge' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="text-center mb-6">
                <h3 className="text-sm font-black text-slate-800 font-heading">
                  របាយការណ៍ពិន្ទុវិជ្ជាសម្បទា (ចំណេះដឹងទូទៅ ៨០%)
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  ខែធ្នូ, ខែមករា, ខែកុម្ភៈ, ឆមាស១ • ខែឧសភា, ខែមិថុនា, ខែកក្កដា, ឆមាស២
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black text-center">
                      <th rowSpan={2} className="border border-slate-300 p-2 w-10">ល.រ</th>
                      <th rowSpan={2} className="border border-slate-300 p-2 text-left min-w-[140px]">មុខវិជ្ជា</th>
                      <th colSpan={sem1MonthPeriods.length + (sem1ExamPeriod ? 1 : 0) + 1} className="border border-slate-300 p-2 bg-indigo-50/70 text-indigo-950">
                        ឆមាសទី១
                      </th>
                      <th colSpan={sem2MonthPeriods.length + (sem2ExamPeriod ? 1 : 0) + 1} className="border border-slate-300 p-2 bg-emerald-50/70 text-emerald-950">
                        ឆមាសទី២
                      </th>
                      <th rowSpan={2} className="border border-slate-300 p-2 bg-amber-100/70 text-amber-950 w-24">
                        មធ្យមភាគ<br/>វិជ្ជាប្រចាំឆ្នាំ
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 text-center">
                      {/* Sem 1 */}
                      {sem1MonthPeriods.map(p => (
                        <th key={p.id} className="border border-slate-300 px-2 py-1.5 min-w-[65px]">{p.nameKm}</th>
                      ))}
                      {sem1ExamPeriod && (
                        <th className="border border-slate-300 px-2 py-1.5 bg-indigo-100/80 text-indigo-900 font-black min-w-[70px]">
                          {sem1ExamPeriod.nameKm}
                        </th>
                      )}
                      <th className="border border-slate-300 px-2 py-1.5 bg-indigo-100 text-indigo-950 font-black min-w-[75px]">
                        ម.ភាគ ឆ.១
                      </th>

                      {/* Sem 2 */}
                      {sem2MonthPeriods.map(p => (
                        <th key={p.id} className="border border-slate-300 px-2 py-1.5 min-w-[65px]">{p.nameKm}</th>
                      ))}
                      {sem2ExamPeriod && (
                        <th className="border border-slate-300 px-2 py-1.5 bg-emerald-100/80 text-emerald-900 font-black min-w-[70px]">
                          {sem2ExamPeriod.nameKm}
                        </th>
                      )}
                      <th className="border border-slate-300 px-2 py-1.5 bg-emerald-100 text-emerald-950 font-black min-w-[75px]">
                        ម.ភាគ ឆ.២
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectScoresData.map((row, idx) => (
                      <tr key={row.subject.id} className="hover:bg-slate-50/80 text-center">
                        <td className="border border-slate-300 p-2 font-bold text-slate-500">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 text-left font-black text-slate-900">
                          {row.subject.nameKm}
                        </td>

                        {/* Sem 1 Scores */}
                        {row.s1MonthScores.map(m => (
                          <td key={m.periodId} className="border border-slate-300 p-2 font-bold text-slate-700">
                            {m.score.toFixed(1)}
                          </td>
                        ))}
                        {sem1ExamPeriod && (
                          <td className="border border-slate-300 p-2 font-black text-indigo-900 bg-indigo-50/40">
                            {row.s1ExamScore.toFixed(1)}
                          </td>
                        )}
                        <td className="border border-slate-300 p-2 font-black text-indigo-950 bg-indigo-50">
                          {row.sem1Avg.toFixed(2)}
                        </td>

                        {/* Sem 2 Scores */}
                        {row.s2MonthScores.map(m => (
                          <td key={m.periodId} className="border border-slate-300 p-2 font-bold text-slate-700">
                            {m.score.toFixed(1)}
                          </td>
                        ))}
                        {sem2ExamPeriod && (
                          <td className="border border-slate-300 p-2 font-black text-emerald-900 bg-emerald-50/40">
                            {row.s2ExamScore.toFixed(1)}
                          </td>
                        )}
                        <td className="border border-slate-300 p-2 font-black text-emerald-950 bg-emerald-50">
                          {row.sem2Avg.toFixed(2)}
                        </td>

                        {/* Annual Subject Avg */}
                        <td className="border border-slate-300 p-2 font-black text-amber-950 bg-amber-50">
                          {row.annualSubjAvg.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Summary Row */}
                    <tr className="bg-slate-100 font-black text-center text-slate-900">
                      <td colSpan={2} className="border border-slate-300 p-2 text-right">
                        មធ្យមភាគរួមវិជ្ជាសម្បទា៖
                      </td>
                      {sem1MonthPeriods.map(p => (
                        <td key={p.id} className="border border-slate-300 p-2 text-slate-400">-</td>
                      ))}
                      {sem1ExamPeriod && <td className="border border-slate-300 p-2 text-slate-400">-</td>}
                      <td className="border border-slate-300 p-2 font-black text-indigo-900 bg-indigo-100">
                        {overallSem1Avg.toFixed(2)}
                      </td>

                      {sem2MonthPeriods.map(p => (
                        <td key={p.id} className="border border-slate-300 p-2 text-slate-400">-</td>
                      ))}
                      {sem2ExamPeriod && <td className="border border-slate-300 p-2 text-slate-400">-</td>}
                      <td className="border border-slate-300 p-2 font-black text-emerald-900 bg-emerald-100">
                        {overallSem2Avg.toFixed(2)}
                      </td>

                      <td className="border border-slate-300 p-2 font-black text-amber-950 bg-amber-200">
                        {overallAnnualKnowledge.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold">ពិន្ទុវិជ្ជាគិតជាមធ្យមភាគប្រចាំឆ្នាំ (៨០%)៖ </span>
                  <span className="font-black text-indigo-900 text-sm">
                    {(overallAnnualKnowledge * 0.8).toFixed(2)} / ៨.០០
                  </span>
                </div>
                <div className="text-slate-500 italic">
                  * យោងតាមបំណែងចែកម៉ោង និងកាលវិភាគផ្លូវការរបស់ក្រសួងអប់រំ យុវជន និងកីឡា
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: បំណិនសម្បទា (SKILLS - 10%) */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-800 font-heading">
                    របាយការណ៍វាយតម្លៃពិន្ទុបំណិនសម្បទាសិស្ស (Skill Competencies - ១០%)
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    វាយតម្លៃសមត្ថភាពអនុវត្ត ការគិតស៊ីជម្រៅ ការដោះស្រាយបញ្ហា និងការសហការ
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                  <span className="text-xs font-bold text-indigo-900">ពិន្ទុសរុបបំណិន៖</span>
                  <span className="text-sm font-black text-indigo-950">{skillScore.toFixed(1)} / ១០.០០</span>
                  <span className="text-xs font-bold text-indigo-600">({(skillScore * 0.1).toFixed(2)} លើ ១.០០)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black text-center">
                      <th className="border border-slate-300 p-2.5 w-12">ល.រ</th>
                      <th className="border border-slate-300 p-2.5 text-left w-64">សមាសភាគបំណិន (Rubrics)</th>
                      <th className="border border-slate-300 p-2.5 text-left">ខ្លឹមសារលម្អិត និងការសង្កេត</th>
                      <th className="border border-slate-300 p-2.5 w-24">ពិន្ទុពេញ</th>
                      <th className="border border-slate-300 p-2.5 w-28 bg-indigo-50 text-indigo-950">ពិន្ទុទទួលបាន</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillRubrics.map((item, idx) => {
                      const itemScore = Number(((skillScore / 10) * item.weight).toFixed(2));
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="border border-slate-300 p-3 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 p-3 font-black text-slate-900">
                            {item.nameKm}
                          </td>
                          <td className="border border-slate-300 p-3 text-slate-700 leading-relaxed">
                            {item.descriptionKm}
                          </td>
                          <td className="border border-slate-300 p-3 text-center font-bold text-slate-600">
                            {item.weight}
                          </td>
                          <td className="border border-slate-300 p-3 text-center font-black text-indigo-900 bg-indigo-50/40">
                            {itemScore.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-black text-slate-900">
                      <td colSpan={3} className="border border-slate-300 p-3 text-right">
                        ពិន្ទុសរុបបំណិនសម្បទា (ធៀបនឹង ១០.០០)៖
                      </td>
                      <td className="border border-slate-300 p-3 text-center font-black">10</td>
                      <td className="border border-slate-300 p-3 text-center font-black text-indigo-950 bg-indigo-100 text-sm">
                        {skillScore.toFixed(1)}
                      </td>
                    </tr>
                    <tr className="bg-amber-50 font-black text-amber-950">
                      <td colSpan={3} className="border border-slate-300 p-3 text-right">
                        រួមចំណែកក្នុងមធ្យមភាគប្រចាំឆ្នាំ (១០%)៖
                      </td>
                      <td className="border border-slate-300 p-3 text-center font-black">1.00</td>
                      <td className="border border-slate-300 p-3 text-center font-black text-amber-900 bg-amber-100 text-sm">
                        {(skillScore * 0.1).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ឧបសម្ព័ន្ធ៤៖ ចរិយាសម្បទា (ATTITUDE APPENDIX 4 FORM) */}
          {activeTab === 'attitude' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between mb-4 pb-3 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      ឧបសម្ព័ន្ធ៤៖ ឧបករណ៍វាយតម្លៃពិន្ទុចរិយាសម្បទារបស់សិស្ស
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                      ៧៤ លក្ខណៈវិនិច្ឆ័យ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    ចុចលើប្រអប់ពិន្ទុ ដើម្បីកែប្រែ ០ ឬ ១ តាមការអនុវត្តជាក់ស្តែងរបស់សិស្ស
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-900 text-white px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-sm">
                    <span className="text-xs font-bold text-indigo-200">ពិន្ទុសរុប៖</span>
                    <span className="text-base font-black text-amber-300">
                      {studentAttitude.totalScore} / ៧៤
                    </span>
                    <span className="text-xs font-bold text-indigo-200">
                      (= {studentAttitude.scaledTen} / ១០)
                    </span>
                  </div>

                  <button
                    onClick={resetAttitudeToDefault}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                    title="កំណត់ទៅតម្លៃដើម ៦៣/៧៤ (និទ្ទេស ល្អ)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>កំណត់ឡើងវិញ (៦៣/៧៤)</span>
                  </button>
                </div>
              </div>

              {/* Form Metadata header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="font-bold text-slate-500">សាលារៀន៖ </span>
                  <span className="font-black text-slate-900">{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុន ណេង ប្រទង'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">ឈ្មោះសិស្ស៖ </span>
                  <span className="font-black text-slate-900">{currentStudent.name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">ថ្នាក់ទី៖ </span>
                  <span className="font-black text-slate-900">{activeClass?.nameKm || '៦(ក)'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">ឆ្នាំសិក្សា៖ </span>
                  <span className="font-black text-slate-900">២០២៦-២០២៧</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">គ្រូបន្ទុកថ្នាក់៖ </span>
                  <span className="font-black text-slate-900">{activeClass?.teacherNameKm || 'ផាន សិតការណ៍'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">និទ្ទេសចរិយា៖ </span>
                  <span className="font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {studentAttitude.grade}
                  </span>
                </div>
              </div>

              {/* Appendix 4 Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black text-center">
                      <th className="border border-slate-300 p-2.5 w-24">សូចនាករ</th>
                      <th className="border border-slate-300 p-2.5 text-left">លក្ខណៈវិនិច្ឆ័យនៃការវាយតម្លៃ</th>
                      <th className="border border-slate-300 p-2.5 w-24 bg-indigo-50 text-indigo-950">ពិន្ទុ (០ ឬ ១)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['clean', 'polite', 'order', 'punctual', 'meditation'] as const).map(catKey => {
                      const catCriteria = ATTITUDE_CRITERIA.filter(c => c.category === catKey);
                      const catLabel = catCriteria[0]?.categoryKm || '';
                      
                      let catTotal = 0;
                      catCriteria.forEach(c => {
                        const sc = studentAttitude.scores[c.id] !== undefined ? studentAttitude.scores[c.id] : c.defaultScore;
                        catTotal += sc;
                      });

                      return (
                        <React.Fragment key={catKey}>
                          {/* Category Header Row */}
                          <tr className="bg-indigo-900 text-white font-black">
                            <td colSpan={2} className="border border-slate-300 px-3 py-2 text-sm">
                              {catLabel === 'ស្អាត' && '១. ស្អាត (១៦ លក្ខណៈវិនិច្ឆ័យ)'}
                              {catLabel === 'សុភាព' && '២. សុភាព (២២ លក្ខណៈវិនិច្ឆ័យ)'}
                              {catLabel === 'របៀប' && '៣. របៀប (១៨ លក្ខណៈវិនិច្ឆ័យ)'}
                              {catLabel === 'ទៀងពេល' && '៤. ទៀងពេល (៨ លក្ខណៈវិនិច្ឆ័យ)'}
                              {catLabel === 'សមាធិ' && '៥. សមាធិ (១៤ លក្ខណៈវិនិច្ឆ័យ)'}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-center text-amber-300 font-black">
                              សរុប {catTotal} / {catCriteria.length}
                            </td>
                          </tr>

                          {/* Criteria Rows */}
                          {catCriteria.map((c, idx) => {
                            const sc = studentAttitude.scores[c.id] !== undefined ? studentAttitude.scores[c.id] : c.defaultScore;
                            return (
                              <tr key={c.id} className="hover:bg-indigo-50/40 transition">
                                <td className="border border-slate-300 p-2 text-center font-bold text-slate-500">
                                  {idx === 0 ? catLabel : ''}
                                </td>
                                <td className="border border-slate-300 p-2 text-slate-800">
                                  {c.criterionText}
                                </td>
                                <td className="border border-slate-300 p-1 text-center">
                                  <button
                                    onClick={() => toggleCriterionScore(c.id)}
                                    className={`w-9 h-7 rounded-md font-black text-xs transition cursor-pointer flex items-center justify-center mx-auto ${
                                      sc === 1
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                    }`}
                                    title="ចុចដើម្បីប្តូរ ០ ឬ ១"
                                  >
                                    {sc}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}

                    {/* Final Appendix 4 Result Calculation */}
                    <tr className="bg-slate-100 font-black text-slate-900">
                      <td colSpan={2} className="border border-slate-300 p-3 text-right">
                        ពិន្ទុសរុបមិនឱ្យលើសពី ១ (មួយ) ធៀបនឹងមធ្យមភាគ ១០.០០ = 
                        <span className="ml-2 inline-flex items-center space-x-3 text-xs">
                          <span className={studentAttitude.grade === 'ល្អ' ? 'text-emerald-700 underline font-black' : 'text-slate-400'}>
                            {studentAttitude.grade === 'ល្អ' ? '☑ ល្អ' : '☐ ល្អ'}
                          </span>
                          <span className={studentAttitude.grade === 'ល្អបង្គួរ' ? 'text-blue-700 underline font-black' : 'text-slate-400'}>
                            {studentAttitude.grade === 'ល្អបង្គួរ' ? '☑ ល្អបង្គួរ' : '☐ ល្អបង្គួរ'}
                          </span>
                          <span className={studentAttitude.grade === 'មធ្យម' ? 'text-amber-700 underline font-black' : 'text-slate-400'}>
                            {studentAttitude.grade === 'មធ្យម' ? '☑ មធ្យម' : '☐ មធ្យម'}
                          </span>
                          <span className={studentAttitude.grade === 'ខ្សោយ' ? 'text-rose-700 underline font-black' : 'text-slate-400'}>
                            {studentAttitude.grade === 'ខ្សោយ' ? '☑ ខ្សោយ' : '☐ ខ្សោយ'}
                          </span>
                        </span>
                      </td>
                      <td className="border border-slate-300 p-3 text-center font-black text-emerald-950 bg-emerald-100 text-sm">
                        {studentAttitude.scaledOne.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures & Dates from user document */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-700">
                <div>
                  <p className="font-bold text-slate-500">បានឃើញ និងឯកភាព</p>
                  <p className="font-black text-slate-900 mt-1">នាយកសាលា</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-slate-400 italic text-[11px]">(ហត្ថលេខា និងត្រា)</span>
                  </div>
                </div>

                <div>
                  <p className="italic text-slate-500">ថ្ងៃសៅរ៍ ២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស២៥៧០</p>
                  <p className="font-bold text-slate-700">ប្រទង, ថ្ងៃទី១៥ ខែសីហា ឆ្នាំ២០២៦</p>
                  <p className="font-black text-slate-900 mt-1">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-16 flex items-end justify-center">
                    <p className="font-black text-slate-900">{activeClass?.teacherNameKm || 'ផាន សិតការណ៍'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: សរុបលទ្ធផល ៣ វិស័យ (CONSOLIDATED 80-10-10) */}
          {activeTab === 'annual' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500">១. វិជ្ជាសម្បទា (៨០%)</span>
                    <h4 className="text-2xl font-black text-indigo-950 mt-1">
                      {overallAnnualKnowledge.toFixed(2)}
                    </h4>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5">
                      ពិន្ទុរួម៖ {knowledgeWeighted.toFixed(2)} / ៨.០០
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500">២. បំណិនសម្បទា (១០%)</span>
                    <h4 className="text-2xl font-black text-sky-950 mt-1">
                      {skillScore.toFixed(2)}
                    </h4>
                    <p className="text-xs text-sky-600 font-bold mt-0.5">
                      ពិន្ទុរួម៖ {skillWeighted.toFixed(2)} / ១.០០
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500">៣. ចរិយាសម្បទា (១០%)</span>
                    <h4 className="text-2xl font-black text-emerald-950 mt-1">
                      {attitudeScore.toFixed(2)}
                    </h4>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">
                      ពិន្ទុរួម៖ {attitudeWeighted.toFixed(2)} / ១.០០ ({studentAttitude.totalScore}/៧៤)
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Master Consolidated Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="text-center mb-6">
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    តារាងសរុបលទ្ធផលសិក្សាប្រចាំឆ្នាំ តាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    សាលាបឋមសិក្សាហ៊ុន ណេង ប្រទង • ថ្នាក់ទី {activeClass?.nameKm || '៦(ក)'} • ឆ្នាំសិក្សា ២០២៦-២០២៧
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black text-center">
                        <th className="border border-slate-300 p-3 text-left">វិស័យវាយតម្លៃ</th>
                        <th className="border border-slate-300 p-3 w-28">កម្រិតទម្ងន់</th>
                        <th className="border border-slate-300 p-3 w-32">ពិន្ទុដើម (លើ ១០)</th>
                        <th className="border border-slate-300 p-3 w-36 bg-indigo-50 text-indigo-950">
                          ពិន្ទុទទួលបាន
                        </th>
                        <th className="border border-slate-300 p-3 text-left">ខ្លឹមសារ និងមូលដ្ឋានវាយតម្លៃ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-3 font-black text-slate-900">
                          ១. វិជ្ជាសម្បទា (Knowledge)
                        </td>
                        <td className="border border-slate-300 p-3 text-center font-bold text-slate-700">៨០%</td>
                        <td className="border border-slate-300 p-3 text-center font-bold">{overallAnnualKnowledge.toFixed(2)}</td>
                        <td className="border border-slate-300 p-3 text-center font-black text-indigo-900 bg-indigo-50/50">
                          {knowledgeWeighted.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-3 text-slate-600">
                          មធ្យមភាគពិន្ទុមុខវិជ្ជាចំណេះដឹងទូទៅពេញមួយឆ្នាំ (ខែធ្នូ មករា កុម្ភៈ ឆ.១ ឧសភា មិថុនា កក្កដា ឆ.២)
                        </td>
                      </tr>

                      <tr>
                        <td className="border border-slate-300 p-3 font-black text-slate-900">
                          ២. បំណិនសម្បទា (Skills)
                        </td>
                        <td className="border border-slate-300 p-3 text-center font-bold text-slate-700">១០%</td>
                        <td className="border border-slate-300 p-3 text-center font-bold">{skillScore.toFixed(2)}</td>
                        <td className="border border-slate-300 p-3 text-center font-black text-sky-900 bg-sky-50/50">
                          {skillWeighted.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-3 text-slate-600">
                          ការអនុវត្តជាក់ស្តែង ទំនាក់ទំនង ការដោះស្រាយបញ្ហា និងការសហការជាក្រុម
                        </td>
                      </tr>

                      <tr>
                        <td className="border border-slate-300 p-3 font-black text-slate-900">
                          ៣. ចរិយាសម្បទា (Attitude / Conduct)
                        </td>
                        <td className="border border-slate-300 p-3 text-center font-bold text-slate-700">១០%</td>
                        <td className="border border-slate-300 p-3 text-center font-bold">{attitudeScore.toFixed(2)}</td>
                        <td className="border border-slate-300 p-3 text-center font-black text-emerald-900 bg-emerald-50/50">
                          {attitudeWeighted.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-3 text-slate-600">
                          វាយតម្លៃតាមឧបសម្ព័ន្ធ៤ ក្រសួងអប់រំ (៧៤ លក្ខណៈវិនិច្ឆ័យ: ស្អាត សុភាព របៀប ទៀងពេល សមាធិ)
                        </td>
                      </tr>

                      {/* Grand Total Row */}
                      <tr className="bg-amber-100/70 font-black text-amber-950 text-sm">
                        <td className="border border-slate-300 p-3">
                          មធ្យមភាគសរុបប្រចាំឆ្នាំ (Final Average)៖
                        </td>
                        <td className="border border-slate-300 p-3 text-center">១០០%</td>
                        <td className="border border-slate-300 p-3 text-center">-</td>
                        <td className="border border-slate-300 p-3 text-center text-base text-amber-900 bg-amber-200">
                          {grandTotal.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-3 font-bold">
                          និទ្ទេសរួម៖ <span className="underline">{finalGradeLabel}</span>
                        </td>
                      </tr>

                      <tr className="bg-emerald-50 font-black text-emerald-950">
                        <td colSpan={2} className="border border-slate-300 p-3 text-right">
                          សេចក្តីសម្រេចរបស់ក្រុមប្រឹក្សាវិន័យ និងការវាយតម្លៃ៖
                        </td>
                        <td colSpan={3} className="border border-slate-300 p-3 text-emerald-900">
                          {grandTotal >= 5.0 ? '✓ បានឡើងទៅរៀននៅថ្នាក់ទី ៧ (អនុវិទ្យាល័យ)' : 'ត្រួតថ្នាក់'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom Signature Section */}
                <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-700">
                  <div>
                    <p className="font-bold text-slate-500">បានឃើញ និងយល់ព្រម</p>
                    <p className="font-black text-slate-900 mt-1">នាយកសាលា</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-slate-400 italic text-[11px]">(ហត្ថលេខា និងត្រា)</span>
                    </div>
                  </div>

                  <div>
                    <p className="italic text-slate-500">ថ្ងៃសៅរ៍ ២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស២៥៧០</p>
                    <p className="font-bold text-slate-700">ប្រទង, ថ្ងៃទី១៥ ខែសីហា ឆ្នាំ២០២៦</p>
                    <p className="font-black text-slate-900 mt-1">គ្រូបន្ទុកថ្នាក់ទទួលបន្ទុក</p>
                    <div className="h-20 flex items-end justify-center">
                      <p className="font-black text-slate-900">{activeClass?.teacherNameKm || 'ផាន សិតការណ៍'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              ទិន្នន័យត្រូវបានរៀបចំតាមក្បួនគណនា MoEYS (៨០% វិជ្ជា, ១០% បំណិន, ១០% ចរិយា) ត្រៀមរួចជាស្រេចសម្រាប់ទាញយក
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-sm transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ទាញយក Excel សន្លឹកច្រើន (.xlsx)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              បិទ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
