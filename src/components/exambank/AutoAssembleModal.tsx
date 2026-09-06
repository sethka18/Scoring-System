import React, { useState, useMemo } from 'react';
import { 
  ExamQuestion, 
  ExamCategory, 
  ExamDifficulty, 
  Subject, 
  Language, 
  ExamPaper,
  AssessmentPeriod
} from '../../types';
import { 
  Sparkles, 
  X, 
  Wand2, 
  Award, 
  Clock, 
  BookOpen, 
  Layers, 
  HelpCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface AutoAssembleModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: ExamQuestion[];
  subjects: Subject[];
  periods: AssessmentPeriod[];
  language: Language;
  defaultGrade?: number;
  defaultSubjectId?: string;
  defaultPeriodId?: string;
  schoolName?: string;
  academicYear?: string;
  onAssemble: (params: {
    grade: number;
    subjectId: string;
    examCategory: ExamCategory;
    periodId: string;
    targetTotalScore: number;
    questionCount: number;
    title: string;
    instructions: string;
    schoolName: string;
    academicYear: string;
    difficultyPreference: 'all' | ExamDifficulty;
  }) => void;
}

export const AutoAssembleModal: React.FC<AutoAssembleModalProps> = ({
  isOpen,
  onClose,
  questions,
  subjects,
  periods,
  language,
  defaultGrade = 4,
  defaultSubjectId = 'sub_math',
  defaultPeriodId = 'p_nov',
  schoolName = 'សាលាបឋមសិក្សាគំរូ',
  academicYear = '២០២៥ - ២០២៦',
  onAssemble
}) => {
  const [grade, setGrade] = useState<number>(defaultGrade);
  const [subjectId, setSubjectId] = useState<string>(defaultSubjectId);
  const [examCategory, setExamCategory] = useState<ExamCategory>('monthly');
  const [periodId, setPeriodId] = useState<string>(defaultPeriodId);
  const [targetTotalScore, setTargetTotalScore] = useState<number>(10);
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [difficultyPreference, setDifficultyPreference] = useState<'all' | ExamDifficulty>('all');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>(
    'សិស្សត្រូវអានសំណួរ និងសរសេរចម្លើយឱ្យបានស្អាតបាត ហាមលួចចម្លងគ្នា និងគោរពបទបញ្ជាប្រឡង។'
  );

  // Available candidate questions matching current criteria
  const matchingCandidates = useMemo(() => {
    return questions.filter(q => {
      const matchGrade = q.grade === grade;
      const matchSubject = q.subjectId === subjectId;
      const matchDifficulty = difficultyPreference === 'all' || q.difficulty === difficultyPreference;
      return matchGrade && matchSubject && matchDifficulty;
    });
  }, [questions, grade, subjectId, difficultyPreference]);

  // Selected subject name
  const subjectObj = subjects.find(s => s.id === subjectId);
  const subjectName = language === 'km' ? (subjectObj?.nameKm || 'មុខវិជ្ជា') : (subjectObj?.nameEn || 'Subject');

  // Auto title suggestion
  const suggestedTitle = useMemo(() => {
    const periodObj = periods.find(p => p.id === periodId);
    const periodName = language === 'km' ? (periodObj?.nameKm || 'ប្រចាំខែ') : (periodObj?.nameEn || 'Monthly');
    const examTypeStr = examCategory === 'semester' 
      ? (language === 'km' ? 'ប្រឡងប្រចាំឆមាស' : 'Semester Examination')
      : (language === 'km' ? `ប្រឡង${periodName}` : `${periodName} Exam`);

    return language === 'km'
      ? `វិញ្ញាសា${examTypeStr} មុខវិជ្ជា${subjectName} ថ្នាក់ទី${grade}`
      : `Grade ${grade} ${subjectName} ${examTypeStr}`;
  }, [grade, subjectName, examCategory, periodId, periods, language]);

  if (!isOpen) return null;

  const handleRunAssembly = (e: React.FormEvent) => {
    e.preventDefault();
    onAssemble({
      grade,
      subjectId,
      examCategory,
      periodId,
      targetTotalScore: Number(targetTotalScore) || 10,
      questionCount: Number(questionCount) || 4,
      title: customTitle.trim() || suggestedTitle,
      instructions: customInstructions.trim(),
      schoolName,
      academicYear,
      difficultyPreference
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide">
                {language === 'km' ? 'កែច្នៃ / បង្កើតវិញ្ញាសាថ្មីស្វ័យប្រវត្តិ' : 'Auto-Assemble Exam Paper'}
              </h3>
              <p className="text-xs text-indigo-200">
                {language === 'km' 
                  ? 'ជ្រើសរើសរូបមន្តប្រឡង ប្រព័ន្ធនឹងចម្រាញ់សំណួរចេញពីធនាគារភ្លាមៗ' 
                  : 'Smart composition blueprint to generate exams without re-typing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRunAssembly} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Formula Parameters Box */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'km' ? 'រូបមន្តវិញ្ញាសា (Exam Blueprint)' : 'Exam Blueprint'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'កម្រិតថ្នាក់' : 'Target Grade'}
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>
                      {language === 'km' ? `ថ្នាក់ទី ${g}` : `Grade ${g}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'មុខវិជ្ជា' : 'Subject'}
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {language === 'km' ? s.nameKm : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'សម័យប្រឡង' : 'Exam Type'}
                </label>
                <select
                  value={examCategory}
                  onChange={(e) => setExamCategory(e.target.value as ExamCategory)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="monthly">{language === 'km' ? 'ប្រឡងប្រចាំខែ' : 'Monthly Exam'}</option>
                  <option value="semester">{language === 'km' ? 'ប្រឡងប្រចាំឆមាស' : 'Semester Exam'}</option>
                  <option value="weekly_quiz">{language === 'km' ? 'តេស្តប្រចាំសប្តាហ៍' : 'Weekly Quiz'}</option>
                  <option value="practice">{language === 'km' ? 'លំហាត់ហ្វឹកហាត់' : 'Practice'}</option>
                </select>
              </div>
            </div>

            {/* Sub-row: Assessment Period & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ខែ ឬ ឆមាស' : 'Period / Month'}
                </label>
                <select
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>
                      {language === 'km' ? p.nameKm : p.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'កម្រិតលំបាកលាយបញ្ចូល' : 'Difficulty Balance'}
                </label>
                <select
                  value={difficultyPreference}
                  onChange={(e) => setDifficultyPreference(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">{language === 'km' ? 'ចម្រុះគ្រប់កម្រិត (ងាយ, មធ្យម, លំបាក)' : 'Mixed / Balanced'}</option>
                  <option value="easy">{language === 'km' ? 'ផ្តោតលើកម្រិតងាយ' : 'Focus on Easy'}</option>
                  <option value="medium">{language === 'km' ? 'ផ្តោតលើកម្រិតមធ្យម' : 'Focus on Medium'}</option>
                  <option value="hard">{language === 'km' ? 'ផ្តោតលើកម្រិតលំបាក' : 'Focus on Hard'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row: Target Points & Questions Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ពិន្ទុសរុបនៃវិញ្ញាសា' : 'Total Target Score'}
              </label>
              <div className="flex items-center space-x-2">
                {[10, 20, 50, 100].map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setTargetTotalScore(pt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      targetTotalScore === pt
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {pt} {language === 'km' ? 'ពិន្ទុ' : 'pts'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ចំនួនសំណួរចង់បាន' : 'Desired Question Count'}
              </label>
              <div className="flex items-center space-x-2">
                {[3, 4, 5, 6].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      questionCount === count
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {count} {language === 'km' ? 'សំណួរ' : 'Qs'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'km' ? 'ចំណងជើងវិញ្ញាសា' : 'Exam Paper Title'}
            </label>
            <input
              type="text"
              placeholder={suggestedTitle}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              {language === 'km' ? 'លំនាំដើម៖ ' : 'Default: '}{suggestedTitle}
            </p>
          </div>

          {/* Student Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'km' ? 'ការណែនាំដល់សិស្ស (Instructions)' : 'Student Instructions'}
            </label>
            <textarea
              rows={2}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Candidate Count Status */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">
                {language === 'km' ? 'សំណួរមានក្នុងធនាគារត្រូវតាមលក្ខខណ្ឌ៖ ' : 'Matching Questions in Bank: '}
                <strong className="text-indigo-600 dark:text-indigo-400">{matchingCandidates.length}</strong>
              </span>
            </div>
            {matchingCandidates.length === 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                {language === 'km' ? '(ប្រព័ន្ធនឹងប្រើប្រាស់សំណួរមុខវិជ្ជានេះជំនួស)' : '(Fallback pool will be used)'}
              </span>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{language === 'km' ? 'បង្កើតវិញ្ញាសាថ្មីភ្លាមៗ' : 'Assemble Exam Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
