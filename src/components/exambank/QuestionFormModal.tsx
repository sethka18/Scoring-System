import React, { useState, useEffect } from 'react';
import { 
  ExamQuestion, 
  ExamQuestionType, 
  ExamCategory, 
  ExamDifficulty, 
  Subject, 
  Language 
} from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Award,
  CheckCircle2
} from 'lucide-react';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Omit<ExamQuestion, 'id' | 'createdAt'>) => void;
  editingQuestion?: ExamQuestion | null;
  subjects: Subject[];
  language: Language;
  defaultGrade?: number;
  defaultSubjectId?: string;
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingQuestion,
  subjects,
  language,
  defaultGrade = 4,
  defaultSubjectId = 'sub_math'
}) => {
  const [grade, setGrade] = useState<number>(defaultGrade);
  const [subjectId, setSubjectId] = useState<string>(defaultSubjectId);
  const [examCategory, setExamCategory] = useState<ExamCategory>('monthly');
  const [periodId, setPeriodId] = useState<string>('all');
  const [chapterOrTopic, setChapterOrTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('medium');
  const [questionType, setQuestionType] = useState<ExamQuestionType>('multiple_choice');
  const [title, setTitle] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['ក. ', 'ខ. ', 'គ. ', 'ឃ. ']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [points, setPoints] = useState<number>(1);
  const [rubricGuide, setRubricGuide] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');

  useEffect(() => {
    if (editingQuestion) {
      setGrade(editingQuestion.grade);
      setSubjectId(editingQuestion.subjectId);
      setExamCategory(editingQuestion.examCategory);
      setPeriodId(editingQuestion.periodId || 'all');
      setChapterOrTopic(editingQuestion.chapterOrTopic || '');
      setDifficulty(editingQuestion.difficulty);
      setQuestionType(editingQuestion.questionType);
      setTitle(editingQuestion.title || '');
      setPrompt(editingQuestion.prompt);
      setOptions(editingQuestion.options && editingQuestion.options.length > 0 ? editingQuestion.options : ['ក. ', 'ខ. ', 'គ. ', 'ឃ. ']);
      setCorrectAnswer(editingQuestion.correctAnswer);
      setExplanation(editingQuestion.explanation || '');
      setPoints(editingQuestion.points || 1);
      setRubricGuide(editingQuestion.rubricGuide || '');
      setTagsInput(editingQuestion.tags ? editingQuestion.tags.join(', ') : '');
    } else {
      setGrade(defaultGrade);
      setSubjectId(defaultSubjectId);
      setExamCategory('monthly');
      setPeriodId('all');
      setChapterOrTopic('');
      setDifficulty('medium');
      setQuestionType('multiple_choice');
      setTitle('');
      setPrompt('');
      setOptions(['ក. ', 'ខ. ', 'គ. ', 'ឃ. ']);
      setCorrectAnswer('');
      setExplanation('');
      setPoints(1);
      setRubricGuide('');
      setTagsInput('');
    }
  }, [editingQuestion, defaultGrade, defaultSubjectId, isOpen]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    const prefixes = ['ក. ', 'ខ. ', 'គ. ', 'ឃ. ', 'ង. ', 'ច. '];
    const nextPrefix = prefixes[options.length] || `${options.length + 1}. `;
    setOptions([...options, nextPrefix]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert(language === 'km' ? 'សូមបញ្ចូលខ្លឹមសារសំណួរ ឬលំហាត់!' : 'Please enter question prompt!');
      return;
    }
    if (!correctAnswer.trim()) {
      alert(language === 'km' ? 'សូមបញ្ចូលចម្លើយត្រឹមត្រូវ!' : 'Please enter correct answer!');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      grade,
      subjectId,
      examCategory,
      periodId,
      chapterOrTopic: chapterOrTopic.trim() || 'ទូទៅ',
      difficulty,
      questionType,
      title: title.trim() || undefined,
      prompt: prompt.trim(),
      options: questionType === 'multiple_choice' ? options.filter(o => o.trim().length > 0) : undefined,
      correctAnswer: correctAnswer.trim(),
      explanation: explanation.trim() || undefined,
      points: Number(points) > 0 ? Number(points) : 1,
      rubricGuide: rubricGuide.trim() || undefined,
      tags
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                {editingQuestion
                  ? (language === 'km' ? 'កែប្រែសំណួរ / លំហាត់' : 'Edit Question')
                  : (language === 'km' ? 'បន្ថែមសំណួរថ្មីចូលធនាគារ' : 'Add Question to Bank')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'រក្សាទុកសំណួរក្នុងប្រព័ន្ធ ដើម្បីងាយស្រួលទាញយក ឬកែច្នៃជាវិញ្ញាសា' 
                  : 'Save question to repository for easy exam composition'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Grade, Subject, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'កម្រិតថ្នាក់' : 'Grade Level'}
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
                {language === 'km' ? 'ប្រភេទប្រឡង' : 'Exam Category'}
              </label>
              <select
                value={examCategory}
                onChange={(e) => setExamCategory(e.target.value as ExamCategory)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="monthly">{language === 'km' ? 'ប្រឡងប្រចាំខែ' : 'Monthly Exam'}</option>
                <option value="semester">{language === 'km' ? 'ប្រឡងប្រចាំឆមាស' : 'Semester Exam'}</option>
                <option value="weekly_quiz">{language === 'km' ? 'តេស្តប្រចាំសប្តាហ៍' : 'Weekly Quiz'}</option>
                <option value="practice">{language === 'km' ? 'លំហាត់ហ្វឹកហាត់' : 'Practice Exercise'}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Chapter/Topic & Question Type & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Chapter / Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'មេរៀន / ជំពូក' : 'Chapter / Unit'}
              </label>
              <input
                type="text"
                placeholder={language === 'km' ? 'ឧ. មេរៀនទី២៖ ការបូក...' : 'e.g. Unit 2: Addition'}
                value={chapterOrTopic}
                onChange={(e) => setChapterOrTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ទម្រង់សំណួរ' : 'Question Type'}
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as ExamQuestionType)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="multiple_choice">{language === 'km' ? 'ពហុជ្រើសរើស (MCQ)' : 'Multiple Choice'}</option>
                <option value="problem_solving">{language === 'km' ? 'ចំណោទ / ដោះស្រាយ' : 'Problem Solving'}</option>
                <option value="fill_in_blank">{language === 'km' ? 'បំពេញចន្លោះ' : 'Fill in the Blank'}</option>
                <option value="true_false">{language === 'km' ? 'ត្រូវ ឬ ខុស' : 'True / False'}</option>
                <option value="short_answer">{language === 'km' ? 'សំណួរឆ្លើយខ្លី' : 'Short Answer'}</option>
                <option value="dictation_writing">{language === 'km' ? 'សរសេរតាមអាន / តែងសេចក្តី' : 'Dictation / Essay'}</option>
                <option value="matching">{language === 'km' ? 'ផ្គូផ្គង' : 'Matching'}</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'កម្រិតលំបាក' : 'Difficulty'}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ExamDifficulty)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">{language === 'km' ? 'ងាយ (Easy)' : 'Easy'}</option>
                <option value="medium">{language === 'km' ? 'មធ្យម (Medium)' : 'Medium'}</option>
                <option value="hard">{language === 'km' ? 'លំបាក (Hard)' : 'Hard'}</option>
              </select>
            </div>
          </div>

          {/* Title (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'km' ? 'ចំណងជើងរង (ស្រេចចិត្ត)' : 'Question Title (Optional)'}
            </label>
            <input
              type="text"
              placeholder={language === 'km' ? 'ឧ. លំហាត់ទី១៖ ចូរគណនាប្រមាណវិធីខាងក្រោម' : 'e.g. Exercise 1: Calculate the following'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Question Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'km' ? 'ខ្លឹមសារសំណួរ ឬលំហាត់ *' : 'Question Prompt *'}
            </label>
            <textarea
              rows={3}
              required
              placeholder={language === 'km' ? 'សរសេរខ្លឹមសារសំណួរ ឬលំហាត់នៅទីនេះ...' : 'Enter question text or prompt here...'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Multiple Choice Options Builder */}
          {questionType === 'multiple_choice' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'km' ? 'ជម្រើសចម្លើយ (ក, ខ, គ, ឃ...)' : 'Answer Choices'}
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បន្ថែមជម្រើស' : 'Add Option'}</span>
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`ជម្រើសទី ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 3: Correct Answer & Points */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ចម្លើយត្រឹមត្រូវ (គន្លឹះ) *' : 'Correct Answer / Key *'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'km' ? 'ឧ. ខ. ៧៧ ឬ ៥ ផ្លែ' : 'e.g. B or 75'}
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ពិន្ទុ (Points)' : 'Points'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={points}
                onChange={(e) => setPoints(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-black text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Explanation / Solution */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'km' ? 'ការពន្យល់ / វិធីដោះស្រាយលម្អិត (ស្រេចចិត្ត)' : 'Explanation / Solution (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'km' ? 'ពន្យល់ពីរបៀបគិត ឬវិធីដោះស្រាយដើម្បីបង្ហាញដល់គ្រូ ឬសិស្ស...' : 'Explain solution steps...'}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Rubric Guide & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'បំណែងចែកពិន្ទុ (Rubric)' : 'Scoring Rubric'}
              </label>
              <input
                type="text"
                placeholder={language === 'km' ? 'ឧ. រូបមន្ត ១ពិន្ទុ, ចម្លើយ ១ពិន្ទុ' : 'e.g. Formula 1pt, Answer 1pt'}
                value={rubricGuide}
                onChange={(e) => setRubricGuide(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ស្លាកសម្គាល់ (Tags បំបែកដោយសញ្ញាក្បៀស)' : 'Tags (comma separated)'}
              </label>
              <input
                type="text"
                placeholder={language === 'km' ? 'ឧ. ធរណីមាត្រ, បរិមាត្រ, ខែធ្នូ' : 'e.g. geometry, quiz, algebra'}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit Footer */}
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
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'km' ? 'រក្សាទុកសំណួរ' : 'Save Question'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
