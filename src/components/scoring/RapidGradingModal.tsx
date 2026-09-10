import React, { useState, useMemo } from 'react';
import { 
  X, 
  Zap, 
  Check, 
  CheckCircle2, 
  User, 
  Save, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  Search,
  ChevronDown
} from 'lucide-react';
import { 
  AssessmentTemplate, 
  AssessmentPeriod, 
  ClassSection, 
  Language, 
  Student, 
  Subject 
} from '../../types';

interface RapidGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: AssessmentTemplate | null;
  activeClass: ClassSection | null;
  currentPeriod: AssessmentPeriod;
  students: Student[];
  subjects: Subject[];
  scoresMatrix: Record<string, Record<string, Record<string, any>>>;
  language: Language;
  onApplyScores: (updates: { studentId: string; score: number; remark?: string }[], targetField: string, subjectId: string) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const RapidGradingModal: React.FC<RapidGradingModalProps> = ({
  isOpen,
  onClose,
  template,
  activeClass,
  currentPeriod,
  students,
  subjects,
  scoresMatrix,
  language,
  onApplyScores,
  showToast,
}) => {
  if (!isOpen || !template) return null;

  const targetSubject = subjects.find(s => s.id === template.subjectId) || subjects[0];
  const isAllSubjects = template.subjectId === 'all';

  // Initialize draft scores and remarks from current scoresMatrix or template default
  const [studentGrades, setStudentGrades] = useState<Record<string, { score: number; remark: string }>>(() => {
    const initial: Record<string, { score: number; remark: string }> = {};
    students.forEach(stu => {
      const subjectKey = isAllSubjects ? 'sub_math' : template.subjectId;
      const currentScoreRecord = scoresMatrix[stu.id]?.[currentPeriod.id]?.[subjectKey] || {};
      
      let existingScore: number | undefined = undefined;
      if (template.targetField === 'rawScore') {
        existingScore = currentScoreRecord.rawScore;
      } else {
        existingScore = currentScoreRecord[template.targetField];
      }

      const scoreVal = typeof existingScore === 'number' && !isNaN(existingScore)
        ? existingScore
        : template.defaultScore;

      const remarkVal = currentScoreRecord.teacherRemark || currentScoreRecord.remarks || '';

      initial[stu.id] = {
        score: Math.min(10, Math.max(0, scoreVal)),
        remark: remarkVal,
      };
    });
    return initial;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [batchScoreInput, setBatchScoreInput] = useState<number>(template.defaultScore);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(q)
    );
  }, [students, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const grades = Object.values(studentGrades) as { score: number; remark: string }[];
    if (grades.length === 0) return { avg: 0, highest: 0, lowest: 0, passRate: 0, count: 0 };

    const scores = grades.map(g => g.score);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = scores.filter(s => s >= (template.passingScore || 5.0)).length;
    const passRate = (passCount / scores.length) * 100;

    return {
      avg: Number(avg.toFixed(2)),
      highest,
      lowest,
      passRate: Number(passRate.toFixed(1)),
      count: scores.length,
    };
  }, [studentGrades, template.passingScore]);

  // Update single student score
  const handleSetStudentScore = (studentId: string, score: number) => {
    const clamped = Math.min(10, Math.max(0, isNaN(score) ? 0 : Number(score.toFixed(1))));
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: clamped,
      },
    }));
  };

  // Adjust score by delta (+0.5 or -0.5)
  const handleAdjustScore = (studentId: string, delta: number) => {
    setStudentGrades(prev => {
      const current = prev[studentId]?.score ?? template.defaultScore;
      const next = Math.min(10, Math.max(0, Number((current + delta).toFixed(1))));
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          score: next,
        },
      };
    });
  };

  // Set remark
  const handleSetStudentRemark = (studentId: string, remark: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remark,
      },
    }));
  };

  // Bulk set all students to batchScoreInput
  const handleBulkSet = () => {
    const clamped = Math.min(10, Math.max(0, batchScoreInput));
    setStudentGrades(prev => {
      const updated: Record<string, { score: number; remark: string }> = {};
      Object.keys(prev).forEach(id => {
        updated[id] = {
          ...prev[id],
          score: clamped,
        };
      });
      return updated;
    });

    showToast(
      language === 'km' 
        ? `បានដាក់ពិន្ទុ ${clamped} ជូនសិស្សទាំងអស់ (${students.length} នាក់)` 
        : `Applied score ${clamped} to all ${students.length} students`,
      'info'
    );
  };

  // Save all to Gradebook
  const handleSaveAndApply = () => {
    const updates = (Object.entries(studentGrades) as [string, { score: number; remark: string }][]).map(([studentId, data]) => ({
      studentId,
      score: data.score,
      remark: data.remark,
    }));

    const finalSubjectId = isAllSubjects ? 'sub_math' : template.subjectId;
    onApplyScores(updates, template.targetField, finalSubjectId);
    
    showToast(
      language === 'km'
        ? `បានបញ្ចូលពិន្ទុតាមទម្រង់ "${template.nameKm}" ជោគជ័យ!`
        : `Applied scores using "${template.name}" successfully!`,
      'success'
    );
    onClose();
  };

  const getScoreColorClass = (val: number) => {
    if (val >= 8.5) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (val >= 7.0) return 'text-blue-700 bg-blue-50 border-blue-300';
    if (val >= 5.0) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300 font-black';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/10 shadow-xs">
              <Zap className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-base sm:text-lg tracking-tight">
                  {language === 'km' ? template.nameKm : template.name}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/20 text-white">
                  {template.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5 flex items-center space-x-2">
                <span>{language === 'km' ? activeClass?.nameKm || activeClass?.name : activeClass?.name}</span>
                <span>•</span>
                <span>{language === 'km' ? currentPeriod.nameKm : currentPeriod.nameEn}</span>
                <span>•</span>
                <span className="text-amber-300 font-bold">
                  {template.targetFieldLabelKm || template.targetField}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rapid Grading Controls & Live Stats Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs">
            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500 font-bold">{language === 'km' ? 'មធ្យមភាគថ្នាក់៖' : 'Class Avg:'}</span>
              <strong className="text-indigo-950 font-black font-mono">{stats.avg.toFixed(2)}</strong>
            </div>

            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500 font-bold">{language === 'km' ? 'ជាប់៖' : 'Pass Rate:'}</span>
              <strong className="text-emerald-700 font-black font-mono">{stats.passRate}%</strong>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-bold">{language === 'km' ? 'ខ្ពស់ / ទាប៖' : 'High / Low:'}</span>
              <strong className="text-slate-800 font-black font-mono">{stats.highest} / {stats.lowest}</strong>
            </div>
          </div>

          {/* Batch Fill Action */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">{language === 'km' ? 'ដាក់ពិន្ទុរួម៖' : 'Batch Fill:'}</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={batchScoreInput}
                onChange={(e) => setBatchScoreInput(parseFloat(e.target.value) || 0)}
                className="w-14 text-center py-0.5 rounded border border-slate-200 text-xs font-black font-mono"
              />
              <button
                onClick={handleBulkSet}
                className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-black uppercase transition cursor-pointer"
              >
                {language === 'km' ? 'ដាក់គ្រប់គ្នា' : 'Fill All'}
              </button>
            </div>
          </div>

        </div>

        {/* Search Bar & Template Quick Rubric Hint */}
        <div className="px-4 py-2 bg-indigo-50/40 border-b border-indigo-100/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'km' ? 'ស្វែងរកសិស្សតាមឈ្មោះ ឬអត្តលេខ...' : 'Filter student by name or ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none w-48 sm:w-64"
            />
          </div>

          {template.criteria && template.criteria.length > 0 && (
            <div className="hidden md:flex items-center space-x-1.5 text-[11px] text-indigo-900 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{language === 'km' ? 'លក្ខណៈវិនិច្ឆ័យ៖' : 'Rubric:'}</span>
              <span className="text-slate-600 font-medium truncate max-w-md">
                {template.criteria.join(' • ')}
              </span>
            </div>
          )}
        </div>

        {/* Student Scoring Table / Fast-Entry List */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 divide-y divide-slate-100">
          {filteredStudents.map((student, idx) => {
            const currentGrade = studentGrades[student.id] || { score: template.defaultScore, remark: '' };
            const scoreVal = currentGrade.score;

            return (
              <div 
                key={student.id} 
                className="py-3 px-2 sm:px-3 hover:bg-slate-50/80 rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Student Info */}
                <div className="flex items-center space-x-3 min-w-[200px]">
                  <span className="w-6 text-center text-xs font-black text-slate-400">
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                    {student.gender === 'F' ? (
                      <span className="text-rose-600">ស្រី</span>
                    ) : (
                      <span className="text-blue-600">ប្រុស</span>
                    )}
                  </div>
                  <div>
                    <div className="font-heading font-black text-slate-900 text-sm">
                      {student.name}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-400">
                      {student.studentId}
                    </div>
                  </div>
                </div>

                {/* Score Controls (Tap Buttons + Number Input) */}
                <div className="flex items-center space-x-2">
                  {/* Step Buttons */}
                  <button
                    onClick={() => handleAdjustScore(student.id, -0.5)}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center transition cursor-pointer"
                    title="-0.5"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={scoreVal}
                    onChange={(e) => handleSetStudentScore(student.id, parseFloat(e.target.value) || 0)}
                    className={`w-16 text-center py-1.5 rounded-xl border font-black text-sm font-mono shadow-2xs ${getScoreColorClass(scoreVal)}`}
                  />

                  <button
                    onClick={() => handleAdjustScore(student.id, 0.5)}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center transition cursor-pointer"
                    title="+0.5"
                  >
                    +
                  </button>

                  {/* One-Click Quick Score Pills */}
                  <div className="hidden sm:flex items-center space-x-1 pl-1">
                    {template.quickScorePills.map(pill => (
                      <button
                        key={pill}
                        onClick={() => handleSetStudentScore(student.id, pill)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                          scoreVal === pill 
                            ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs' 
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remarks & Quick Comment Dropdown */}
                <div className="flex items-center space-x-1.5 min-w-[240px] md:max-w-xs w-full">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={language === 'km' ? 'មតិយោបល់ / កត់សម្គាល់...' : 'Remark / feedback...'}
                      value={currentGrade.remark}
                      onChange={(e) => handleSetStudentRemark(student.id, e.target.value)}
                      className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Quick Preset Remarks Selector */}
                  {template.presetRemarks && template.presetRemarks.length > 0 && (
                    <div className="relative group">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                        title={language === 'km' ? 'ជ្រើសរើសមតិយោបល់គំរូ' : 'Choose preset comment'}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      </button>

                      {/* Dropdown menu on hover/click */}
                      <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-64 p-2 bg-white rounded-xl shadow-xl border border-slate-200 z-20 space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1">
                          {language === 'km' ? 'មតិយោបល់គំរូ' : 'Preset Comments'}
                        </div>
                        {template.presetRemarks.map((remark, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleSetStudentRemark(student.id, remark)}
                            className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 transition font-medium"
                          >
                            {remark}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-slate-500">
            {language === 'km' 
              ? `សិស្សសរុប៖ ${students.length} នាក់` 
              : `Total Students: ${students.length}`}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              onClick={handleSaveAndApply}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-900/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'km' ? 'រក្សាទុក និងបញ្ចូលពិន្ទុ' : 'Save & Apply Scores'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
