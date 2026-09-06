import React, { useState, useEffect } from 'react';
import { 
  Subject, 
  Language, 
  ExamDifficulty, 
  ExamPaper, 
  ExamQuestion,
  ExamPaperItem,
  AssessmentPeriod,
  ClassSection
} from '../../types';
import { 
  Sparkles, 
  X, 
  Printer, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  BookOpen, 
  HelpCircle, 
  Award, 
  Clock, 
  GraduationCap, 
  FileCheck,
  Wand2,
  AlertCircle
} from 'lucide-react';

interface QuickExamGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  periods: AssessmentPeriod[];
  language: Language;
  activeClass?: ClassSection | null;
  defaultGrade?: number;
  schoolName?: string;
  academicYear?: string;
  onGenerated: (paper: ExamPaper, questionsToSave?: ExamQuestion[]) => void;
}

// Curated topic suggestions by subject
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  sub_math: [
    'វិធីបូកនិងដកចំនួន',
    'វិធីគុណនិងចែក',
    'ប្រភាគ និងទសភាគ',
    'ធរណីមាត្រ (រង្វង់ មុំ ការ៉េ ចតុកោណ)',
    'រង្វាស់ប្រវែង និងទម្ងន់',
    'ចំណោទគណិតវិទ្យាជាក់ស្តែង'
  ],
  sub_khmer: [
    'ព្យញ្ជនៈ និងស្រៈនិស្ស័យ',
    'មេប្រកប និងព្យាង្គតម្រួត',
    'វេយ្យាករណ៍ខ្មែរ (នាម កិរិយា គុណនាម)',
    'ការតែងល្បះ និងកថាខណ្ឌ',
    'អក្ខរាវិរុទ្ធ និងសទិសសូរ',
    'ការយល់ដឹងពីអត្ថបទអាន'
  ],
  sub_science: [
    'រុក្ខជាតិ និងផ្នែកសំខាន់ៗនៃរុក្ខជាតិ',
    'ការបែងចែកសត្វ និងការរស់នៅ',
    'សារពាង្គកាយមនុស្ស និងសុខភាព',
    'រូបធាតុ និងស្ថានភាពនៃរូបធាតុ (រឹង រាវ ឧស្ម័ន)',
    'បរិស្ថាន ធនធានទឹក និងដី'
  ],
  sub_social: [
    'សីលធម៌ និងការគោរពវិន័យសាលារៀន',
    'ប្រវត្តិសាស្ត្រ និងវប្បធម៌ខ្មែរ',
    'ភូមិសាស្ត្រ និងខេត្ត-ក្រុងនៃកម្ពុជា',
    'សុវត្ថិភាពចរាចរណ៍ និងការការពារខ្លួន'
  ],
  sub_english: [
    'Alphabet and Phonics',
    'Daily Greetings and Self-Introduction',
    'Numbers, Colors, and Shapes',
    'Family Members and School Objects',
    'Action Verbs and Simple Sentences'
  ]
};

export const QuickExamGeneratorModal: React.FC<QuickExamGeneratorModalProps> = ({
  isOpen,
  onClose,
  subjects,
  periods,
  language,
  activeClass,
  defaultGrade = 4,
  schoolName = 'សាលាបឋមសិក្សាគំរូ',
  academicYear = '២០២៥ - ២០២៦',
  onGenerated
}) => {
  const [topic, setTopic] = useState<string>('');
  const [grade, setGrade] = useState<number>(activeClass?.grade || defaultGrade);
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('medium');
  const [subjectId, setSubjectId] = useState<string>('sub_math');
  const [totalScore, setTotalScore] = useState<number>(10);
  const [saveToQuestionBank, setSaveToQuestionBank] = useState<boolean>(true);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // Loading and error states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingStep, setGeneratingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeClass?.grade) {
      setGrade(activeClass.grade);
    }
  }, [activeClass]);

  if (!isOpen) return null;

  // Auto detect subject if topic changes
  const handleTopicSelect = (suggestedTopic: string, sId?: string) => {
    setTopic(suggestedTopic);
    if (sId) {
      setSubjectId(sId);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage(language === 'km' ? 'សូមបញ្ចូលប្រធានបទ ឬជ្រើសរើសប្រធានបទគំរូ' : 'Please enter or select a topic');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratingStep(language === 'km' ? 'កំពុងភ្ជាប់ទៅ AI និងវិភាគកម្មវិធីសិក្សាជាតិ...' : 'Connecting to AI and analyzing curriculum standards...');

    try {
      // Small simulated steps to show progress
      const stepTimer1 = setTimeout(() => {
        setGeneratingStep(
          language === 'km'
            ? `កំពុងបង្កើតសំណួរទាំង ១០ សំណួរសម្រាប់ថ្នាក់ទី ${grade} (កម្រិត ${difficulty === 'easy' ? 'ងាយ' : difficulty === 'hard' ? 'លំបាក' : 'មធ្យម'})...`
            : `Generating 10 exam questions for Grade ${grade} (${difficulty})...`
        );
      }, 900);

      const stepTimer2 = setTimeout(() => {
        setGeneratingStep(
          language === 'km'
            ? 'កំពុងរៀបចំគន្លឹះចម្លើយ វិធីដោះស្រាយ និងទម្រង់សន្លឹកបោះពុម្ពផ្លូវការ...'
            : 'Formulating answer keys, rubrics, and printable exam paper format...'
        );
      }, 2200);

      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic.trim(),
          grade,
          difficulty,
          subjectId,
          totalScore,
          schoolName,
          academicYear
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error ${response.status}`);
      }

      const data = await response.json();
      const rawQuestions: any[] = data.questions || [];

      if (rawQuestions.length === 0) {
        throw new Error(language === 'km' ? 'ពុំមានសំណួរត្រូវបានបង្កើតឡើយ' : 'No questions returned from generator');
      }

      // Convert to full ExamQuestion format
      const pointPerQuestion = Math.round((totalScore / rawQuestions.length) * 10) / 10;
      const createdQuestions: ExamQuestion[] = rawQuestions.map((q: any, idx: number) => {
        const qId = `eq_ai_${Date.now()}_${idx + 1}`;
        return {
          id: qId,
          grade,
          subjectId,
          examCategory: 'weekly_quiz',
          chapterOrTopic: topic.trim(),
          difficulty,
          questionType: q.questionType || 'multiple_choice',
          title: `សំណួរទី${idx + 1} (${topic.trim()})`,
          prompt: q.prompt,
          options: q.options || [],
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || '',
          points: pointPerQuestion > 0 ? pointPerQuestion : 1,
          rubricGuide: q.rubricGuide || `ត្រឹមត្រូវទទួលបាន ${pointPerQuestion} ពិន្ទុ`,
          tags: ['AI-Generated', topic.trim(), `ថ្នាក់ទី${grade}`, difficulty],
          createdAt: new Date().toISOString()
        };
      });

      // Construct official ExamPaperItem array
      const paperItems: ExamPaperItem[] = createdQuestions.map((q, idx) => ({
        questionId: q.id,
        customPoints: q.points,
        order: idx + 1,
        questionSnapshot: q
      }));

      // Create official printable ExamPaper
      const subjectObj = subjects.find(s => s.id === subjectId);
      const subjectNameKh = language === 'km' ? (subjectObj?.nameKm || 'មុខវិជ្ជា') : (subjectObj?.nameEn || 'Subject');

      const newExamPaper: ExamPaper = {
        id: `ep_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: data.examTitle || `វិញ្ញាសាតេស្តសមត្ថភាពរហ័ស មុខវិជ្ជា${subjectNameKh} ថ្នាក់ទី${grade} (${topic.trim()})`,
        titleEn: `Quick Quiz - Grade ${grade} (${topic.trim()})`,
        code: `QUIZ-G${grade}-${subjectId.replace('sub_', '').toUpperCase()}-${Date.now().toString().slice(-4)}`,
        grade,
        subjectId,
        examCategory: 'weekly_quiz',
        periodId: 'all',
        durationMinutes,
        totalMaxScore: totalScore,
        schoolName: schoolName || 'សាលាបឋមសិក្សាគំរូ',
        academicYear: academicYear || '២០២៥ - ២០២៦',
        instructions: data.instructions || 'សិស្សត្រូវអានសំណួរនីមួយៗឱ្យបានច្បាស់លាស់ និងសរសេរចម្លើយលើសន្លឹកកិច្ចការនេះឱ្យបានត្រឹមត្រូវ និងស្អាតបាត។',
        items: paperItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Call success callback
      onGenerated(newExamPaper, saveToQuestionBank ? createdQuestions : undefined);
      onClose();
    } catch (err: any) {
      console.error('Failed to generate quick exam:', err);
      setErrorMessage(err?.message || (language === 'km' ? 'មានបញ្ហាក្នុងការបង្កើតវិញ្ញាសា សូមព្យាយាមម្តងទៀត' : 'Failed to generate quiz. Please try again.'));
    } finally {
      setIsGenerating(false);
      setGeneratingStep('');
    }
  };

  const subjectObj = subjects.find(s => s.id === subjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-xs shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  {language === 'km' ? 'កែច្នៃវិញ្ញាសាភ្លាមៗដោយ AI (Quick Exam Generator)' : 'AI Quick Exam Generator'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  10 Questions
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 mt-0.5">
                {language === 'km' 
                  ? 'បង្កើតវិញ្ញាសាតេស្តរហ័ស ១០ សំណួរតាមប្រធានបទ កម្រិតថ្នាក់ និងកម្រិតលំបាក ត្រៀមរួចជាស្រេចសម្រាប់បោះពុម្ព' 
                  : 'Auto-generate a 10-question quiz formatted for printing based on topic, grade & difficulty'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleGenerate} className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-bold">{language === 'km' ? 'មិនអាចបង្កើតវិញ្ញាសាបានទេ' : 'Generation Failed'}</p>
                <p className="text-[11px] mt-0.5 opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* 1. TOPIC INPUT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'km' ? '១. ប្រធានបទ ឬមេរៀនប្រឡង (Topic)' : '1. Exam Topic / Lesson'}</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'km' ? 'វាយបញ្ចូល ឬចុចរើសគំរូខាងក្រោម' : 'Type or pick suggestion'}
              </span>
            </div>

            <input
              type="text"
              required
              disabled={isGenerating}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                language === 'km' 
                  ? 'ឧ. ការបូកនិងដកប្រភាគ, វេយ្យាករណ៍ខ្មែរ, ធរណីមាត្រ, រូបធាតុរាវ...' 
                  : 'e.g., Fractions & Decimals, Khmer Grammar, Geometry, Plant Biology...'
              }
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden transition"
            />

            {/* Curated Topic Chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {language === 'km' ? 'ប្រធានបទពេញនិយមតាមកម្មវិធីសិក្សា៖' : 'Popular Curriculum Topics:'}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {(TOPIC_SUGGESTIONS[subjectId] || TOPIC_SUGGESTIONS['sub_math']).map((sTopic) => (
                  <button
                    key={sTopic}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleTopicSelect(sTopic)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                      topic === sTopic
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
                    }`}
                  >
                    + {sTopic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. GRADE LEVEL & SUBJECT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grade Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'km' ? '២. កម្រិតថ្នាក់ (Grade Level)' : '2. Grade Level'}</span>
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => setGrade(g)}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center ${
                      grade === g
                        ? 'bg-indigo-900 dark:bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-[10px] opacity-70">G</span>
                    <span>{g}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'km' ? 'មុខវិជ្ជា (Subject)' : 'Subject'}</span>
              </label>
              <select
                disabled={isGenerating}
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {language === 'km' ? sub.nameKm : sub.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. DIFFICULTY SETTING */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'km' ? '៣. កម្រិតលំបាក (Difficulty Setting)' : '3. Difficulty Setting'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Easy */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setDifficulty('easy')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  difficulty === 'easy'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{language === 'km' ? 'ងាយ (Easy)' : 'Easy'}</span>
                  {difficulty === 'easy' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {language === 'km' ? 'មូលដ្ឋានគ្រឹះ ចម្លើយផ្ទាល់ សំណួរច្បាស់ៗ' : 'Foundational concepts & direct recall'}
                </p>
              </button>

              {/* Medium */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setDifficulty('medium')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  difficulty === 'medium'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{language === 'km' ? 'មធ្យម (Standard)' : 'Medium'}</span>
                  {difficulty === 'medium' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {language === 'km' ? 'ស្តង់ដារក្រសួង ចម្រុះពហុជ្រើសរើស និងចំណោទ' : 'Balanced curriculum standard test'}
                </p>
              </button>

              {/* Hard */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setDifficulty('hard')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  difficulty === 'hard'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-950 dark:text-purple-100 ring-2 ring-purple-500/30'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{language === 'km' ? 'លំបាក (Advanced)' : 'Hard'}</span>
                  {difficulty === 'hard' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {language === 'km' ? 'ចំណោទពហុដំណាក់កាល ត្រិះរិះពិចារណាខ្ពស់' : 'Multi-step problems & critical thinking'}
                </p>
              </button>
            </div>
          </div>

          {/* 4. QUIZ SPECIFICATIONS & PRINT TOGGLE */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {language === 'km' ? 'ទម្រង់វិញ្ញាសាកំណត់រៀបចំ (10-Question Quiz Blueprint)' : '10-Question Quiz Blueprint'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 text-[10px] font-black">
                ១០ សំណួរ (10 Questions)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'ពិន្ទុសរុបវិញ្ញាសា' : 'Total Score'}
                </label>
                <select
                  disabled={isGenerating}
                  value={totalScore}
                  onChange={(e) => setTotalScore(Number(e.target.value))}
                  className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value={10}>១០ ពិន្ទុ (១ សំណួរ = ១ ពិន្ទុ)</option>
                  <option value={20}>២០ ពិន្ទុ (១ សំណួរ = ២ ពិន្ទុ)</option>
                  <option value={50}>៥០ ពិន្ទុ (១ សំណួរ = ៥ ពិន្ទុ)</option>
                  <option value={100}>១០០ ពិន្ទុ (១ សំណួរ = ១០ ពិន្ទុ)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'ថិរវេលាប្រឡង' : 'Duration'}
                </label>
                <select
                  disabled={isGenerating}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value={30}>៣០ នាទី (30 Mins)</option>
                  <option value={45}>៤៥ នាទី (45 Mins)</option>
                  <option value={60}>៦០ នាទី (60 Mins)</option>
                </select>
              </div>
            </div>

            {/* Checkbox: Save to Question Bank */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isGenerating}
                  checked={saveToQuestionBank}
                  onChange={(e) => setSaveToQuestionBank(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                />
                <span>{language === 'km' ? 'រក្សាទុកសំណួរទាំង ១០ នេះក្នុងធនាគារសំណួរផងដែរ' : 'Also save these 10 questions to Question Bank'}</span>
              </label>
            </div>
          </div>

          {/* GENERATION IN-PROGRESS STATE */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-indigo-700 dark:text-indigo-300 font-black text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'កំពុងបង្កើតវិញ្ញាសាតេស្តរហ័ស ១០ សំណួរ...' : 'Generating 10-Question Quiz with AI...'}</span>
              </div>
              <p className="text-xs text-indigo-600/90 dark:text-indigo-400/90 font-medium animate-pulse">
                {generatingStep}
              </p>
            </div>
          )}

          {/* MODAL ACTIONS */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isGenerating}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-800 hover:from-indigo-800 hover:to-purple-700 text-white text-xs font-black tracking-wide shadow-md shadow-indigo-900/20 transition cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'km' ? 'កំពុងកែច្នៃវិញ្ញាសា...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{language === 'km' ? 'បង្កើតវិញ្ញាសាភ្លាមៗ (Auto-Generate 10 Questions)' : 'Generate 10-Question Quiz'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
