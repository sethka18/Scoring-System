import React, { useState } from 'react';
import { ExamQuestion, Subject, Language } from '../../types';
import { 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Check, 
  Edit3, 
  Copy, 
  Trash2, 
  BookOpen, 
  Award,
  Clock,
  Sparkles
} from 'lucide-react';

interface QuestionCardProps {
  question: ExamQuestion;
  subjects: Subject[];
  language: Language;
  isSelected?: boolean;
  onToggleSelect?: (question: ExamQuestion) => void;
  onEdit?: (question: ExamQuestion) => void;
  onDuplicate?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  showSelectButton?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  subjects,
  language,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onDelete,
  showSelectButton = true
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // Find subject details
  const subject = subjects.find(s => s.id === question.subjectId);
  const subjectName = language === 'km' ? (subject?.nameKm || question.subjectId) : (subject?.nameEn || question.subjectId);

  // Difficulty badge styling
  const difficultyBadge = {
    easy: {
      labelKm: 'កម្រិតងាយ',
      labelEn: 'Easy',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
    },
    medium: {
      labelKm: 'កម្រិតមធ្យម',
      labelEn: 'Medium',
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
    },
    hard: {
      labelKm: 'កម្រិតលំបាក',
      labelEn: 'Hard',
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
    }
  }[question.difficulty];

  // Question type badge styling
  const typeLabel = {
    multiple_choice: { km: 'ពហុជ្រើសរើស (MCQ)', en: 'Multiple Choice' },
    problem_solving: { km: 'ចំណោទ / ដោះស្រាយ', en: 'Problem Solving' },
    fill_in_blank: { km: 'បំពេញចន្លោះ', en: 'Fill in Blank' },
    true_false: { km: 'ត្រូវ ឬ ខុស', en: 'True / False' },
    matching: { km: 'ផ្គូផ្គង', en: 'Matching' },
    short_answer: { km: 'សំណួរឆ្លើយខ្លី', en: 'Short Answer' },
    dictation_writing: { km: 'សរសេរតាមអាន/តែងសេចក្តី', en: 'Dictation / Essay' }
  }[question.questionType];

  // Category badge
  const categoryLabel = {
    monthly: { km: 'ប្រឡងប្រចាំខែ', en: 'Monthly Exam' },
    semester: { km: 'ប្រឡងប្រចាំឆមាស', en: 'Semester Exam' },
    weekly_quiz: { km: 'តេស្តប្រចាំសប្តាហ៍', en: 'Weekly Quiz' },
    practice: { km: 'លំហាត់ហ្វឹកហាត់', en: 'Practice' }
  }[question.examCategory];

  return (
    <div 
      className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md ${
        isSelected 
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20' 
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Header Badges */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-black tracking-wide border border-indigo-200 dark:border-indigo-800">
            {language === 'km' ? `ថ្នាក់ទី ${question.grade}` : `Grade ${question.grade}`}
          </span>

          {/* Subject Badge */}
          <span 
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border"
            style={{
              backgroundColor: `${subject?.color || '#4f46e5'}15`,
              borderColor: `${subject?.color || '#4f46e5'}40`,
              color: subject?.color || '#4f46e5'
            }}
          >
            {subjectName}
          </span>

          {/* Exam Category */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
            {language === 'km' ? categoryLabel.km : categoryLabel.en}
          </span>

          {/* Difficulty */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${difficultyBadge.bg}`}>
            {language === 'km' ? difficultyBadge.labelKm : difficultyBadge.labelEn}
          </span>

          {/* Question Type */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-[11px] font-medium">
            {language === 'km' ? typeLabel.km : typeLabel.en}
          </span>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          {/* Points Pill */}
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{question.points} {language === 'km' ? 'ពិន្ទុ' : 'pts'}</span>
          </span>

          {/* Select / Cart Toggle Button */}
          {showSelectButton && onToggleSelect && (
            <button
              onClick={() => onToggleSelect(question)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === 'km' ? 'បានជ្រើស' : 'Selected'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ជ្រើសចូលវិញ្ញាសា' : 'Add to Exam'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5">
        {/* Chapter or Topic */}
        {question.chapterOrTopic && (
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>{question.chapterOrTopic}</span>
          </div>
        )}

        {/* Title if present */}
        {question.title && (
          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-1.5">
            {question.title}
          </h4>
        )}

        {/* Question Prompt */}
        <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
          {question.prompt}
        </p>

        {/* Multiple Choice Options */}
        {question.questionType === 'multiple_choice' && question.options && question.options.length > 0 && (
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options.map((opt, idx) => {
              const isCorrectOpt = showAnswer && (
                opt.trim() === question.correctAnswer.trim() || 
                opt.startsWith(question.correctAnswer.slice(0, 2))
              );

              return (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors ${
                    isCorrectOpt
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        )}

        {/* Answer Key & Explanation Accordion */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="inline-flex items-center space-x-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {showAnswer 
                ? (language === 'km' ? 'លាក់ចម្លើយ & គន្លឹះដោះស្រាយ' : 'Hide Answer & Solution')
                : (language === 'km' ? 'បង្ហាញចម្លើយ & គន្លឹះដោះស្រាយ' : 'View Answer & Solution')}
            </span>
            {showAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAnswer && (
            <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">
                    {language === 'km' ? 'ចម្លើយត្រឹមត្រូវ៖ ' : 'Correct Answer: '}
                  </span>
                  <span className="font-black text-emerald-950 dark:text-emerald-100">
                    {question.correctAnswer}
                  </span>
                </div>
              </div>

              {question.explanation && (
                <div className="pl-6 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {language === 'km' ? 'ការពន្យល់ / វិធីដោះស្រាយ៖ ' : 'Explanation / Solution: '}
                  </span>
                  {question.explanation}
                </div>
              )}

              {question.rubricGuide && (
                <div className="pl-6 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs italic">
                  <span className="font-bold">{language === 'km' ? 'បំណែងចែកពិន្ទុ៖ ' : 'Rubric: '}</span>
                  {question.rubricGuide}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {question.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(question)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                title={language === 'km' ? 'កែសម្រួល' : 'Edit'}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(question.id)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                title={language === 'km' ? 'ចម្លងបង្កើតថ្មី' : 'Duplicate'}
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && !question.isSystemDefault && (
              <button
                onClick={() => onDelete(question.id)}
                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title={language === 'km' ? 'លុប' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
