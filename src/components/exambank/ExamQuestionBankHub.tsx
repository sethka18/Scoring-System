import React, { useState, useMemo, useRef } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { useExamBank } from '../../hooks/useExamBank';
import { 
  ExamQuestion, 
  ExamPaper, 
  ExamCategory, 
  ExamDifficulty, 
  ExamQuestionType, 
  Subject 
} from '../../types';
import { QuestionCard } from './QuestionCard';
import { QuestionFormModal } from './QuestionFormModal';
import { AutoAssembleModal } from './AutoAssembleModal';
import { QuickExamGeneratorModal } from './QuickExamGeneratorModal';
import { PrintableExamPaper } from './PrintableExamPaper';
import { ExamPaperEditorModal } from './ExamPaperEditorModal';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  Plus, 
  Wand2, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RotateCcw, 
  Printer, 
  Check, 
  Layers, 
  Award, 
  Clock, 
  Trash2, 
  Copy, 
  Edit3, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FolderArchive
} from 'lucide-react';

export const ExamQuestionBankHub: React.FC = () => {
  const { 
    language, 
    subjects, 
    periods, 
    activeClass, 
    schoolProfile,
    showToast 
  } = useGradebook();

  const {
    questions,
    examPapers,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    resetQuestionsToDefault,
    exportQuestionsJson,
    importQuestionsJson,
    addExamPaper,
    updateExamPaper,
    deleteExamPaper,
    duplicateExamPaper,
    autoAssembleExamPaper
  } = useExamBank();

  // Active view: 'bank' (Question Bank), 'papers' (Saved Papers), or 'print_preview'
  const [activeSubTab, setActiveSubTab] = useState<'bank' | 'papers' | 'print_preview'>('bank');

  // Currently viewing/printing paper
  const [activeExamPaper, setActiveExamPaper] = useState<ExamPaper | null>(null);

  // Filters
  const initialGrade = activeClass?.grade || 0; // 0 = all grades
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart / Selection for Custom Exam Paper Assembly
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Modal states
  const [showQuickExamModal, setShowQuickExamModal] = useState<boolean>(false);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [showAutoAssembleModal, setShowAutoAssembleModal] = useState<boolean>(false);
  const [showPaperEditorModal, setShowPaperEditorModal] = useState<boolean>(false);
  const [editingPaper, setEditingPaper] = useState<ExamPaper | null>(null);

  // Hidden file input for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Questions List
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Grade filter
      if (selectedGrade !== 0 && q.grade !== selectedGrade) return false;
      // Subject filter
      if (selectedSubjectId !== 'all' && q.subjectId !== selectedSubjectId) return false;
      // Category filter
      if (selectedCategory !== 'all' && q.examCategory !== selectedCategory) return false;
      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      // Question type filter
      if (selectedQuestionType !== 'all' && q.questionType !== selectedQuestionType) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchPrompt = q.prompt.toLowerCase().includes(query);
        const matchTopic = q.chapterOrTopic.toLowerCase().includes(query);
        const matchAns = q.correctAnswer.toLowerCase().includes(query);
        const matchTags = q.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchPrompt && !matchTopic && !matchAns && !matchTags) return false;
      }
      return true;
    });
  }, [questions, selectedGrade, selectedSubjectId, selectedCategory, selectedDifficulty, selectedQuestionType, searchQuery]);

  // Filtered Exam Papers List
  const filteredExamPapers = useMemo(() => {
    return examPapers.filter(p => {
      if (selectedGrade !== 0 && p.grade !== selectedGrade) return false;
      if (selectedSubjectId !== 'all' && p.subjectId !== selectedSubjectId) return false;
      return true;
    });
  }, [examPapers, selectedGrade, selectedSubjectId]);

  // Handle Question Selection Toggle
  const handleToggleSelectQuestion = (q: ExamQuestion) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(q.id)) {
        next.delete(q.id);
      } else {
        next.add(q.id);
      }
      return next;
    });
  };

  // Selected questions count & points sum
  const selectedQuestionsList = useMemo(() => {
    return questions.filter(q => selectedQuestionIds.has(q.id));
  }, [questions, selectedQuestionIds]);

  const selectedTotalPoints = useMemo(() => {
    return selectedQuestionsList.reduce((sum, q) => sum + (q.points || 1), 0);
  }, [selectedQuestionsList]);

  // Assemble Exam from Selected Cart Questions
  const handleAssembleFromSelected = () => {
    if (selectedQuestionsList.length === 0) return;

    // Detect common grade and subject if uniform, otherwise fallback
    const targetGrade = selectedGrade !== 0 ? selectedGrade : selectedQuestionsList[0].grade;
    const targetSubjectId = selectedSubjectId !== 'all' ? selectedSubjectId : selectedQuestionsList[0].subjectId;
    const subjectObj = subjects.find(s => s.id === targetSubjectId);
    const subjectName = language === 'km' ? (subjectObj?.nameKm || 'វិញ្ញាសា') : (subjectObj?.nameEn || 'Exam');

    const newPaper = addExamPaper({
      title: language === 'km' 
        ? `វិញ្ញាសាសម្រាំងមុខវិជ្ជា${subjectName} ថ្នាក់ទី${targetGrade}` 
        : `Custom Grade ${targetGrade} ${subjectName} Exam`,
      code: `EXAM-SEL-${Date.now().toString().slice(-4)}`,
      grade: targetGrade,
      subjectId: targetSubjectId,
      examCategory: 'monthly',
      periodId: 'p_nov',
      durationMinutes: 60,
      totalMaxScore: selectedTotalPoints,
      schoolName: schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាគំរូ',
      academicYear: activeClass?.academicYear || '២០២៥ - ២០២៦',
      instructions: 'សិស្សត្រូវអានសំណួរ និងដោះស្រាយចម្លើយឱ្យបានស្អាតបាតតាមលំដាប់លំដោយ។',
      items: selectedQuestionsList.map((q, idx) => ({
        questionId: q.id,
        customPoints: q.points || 1,
        order: idx + 1,
        questionSnapshot: q
      }))
    });

    setSelectedQuestionIds(new Set());
    setActiveExamPaper(newPaper);
    setActiveSubTab('print_preview');
    showToast(language === 'km' ? 'បានបង្កើតវិញ្ញាសាដោយជោគជ័យ!' : 'Exam paper assembled successfully!');
  };

  // Handle Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const result = importQuestionsJson(text);
        if (result.success) {
          showToast(language === 'km' ? `បាននាំចូលសំណួរចំនួន ${result.count} ដោយជោគជ័យ!` : `Successfully imported ${result.count} questions!`);
        } else {
          showToast(result.error || 'Failed to import JSON', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Export JSON
  const handleExportJson = () => {
    const jsonStr = exportQuestionsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExamQuestionBank_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(language === 'km' ? 'បាននាំចេញទិន្នន័យជា JSON ដោយជោគជ័យ!' : 'Exported JSON successfully!');
  };

  // Handle Auto-Assemble Submit
  const handleAutoAssemble = (params: any) => {
    const createdPaper = autoAssembleExamPaper(params);
    setActiveExamPaper(createdPaper);
    setActiveSubTab('print_preview');
    showToast(
      language === 'km' 
        ? `បានបង្កើត ${createdPaper.title} ស្វ័យប្រវត្តិចំនួន ${createdPaper.items.length} សំណួរ!`
        : `Successfully auto-assembled ${createdPaper.title}!`
    );
  };

  // Handle AI Quick Exam Generated
  const handleQuickExamGenerated = (createdPaper: ExamPaper, questionsToSave?: ExamQuestion[]) => {
    addExamPaper(createdPaper);

    if (questionsToSave && questionsToSave.length > 0) {
      questionsToSave.forEach(q => {
        addQuestion(q);
      });
    }

    setActiveExamPaper(createdPaper);
    setActiveSubTab('print_preview');

    showToast(
      language === 'km'
        ? `បានបង្កើតវិញ្ញាសាតេស្ត ១០ សំណួរដោយជោគជ័យ! ទម្រង់សន្លឹកកិច្ចការ និងគន្លឹះចម្លើយបានត្រៀមរួចរាល់សម្រាប់បោះពុម្ព។`
        : `Successfully generated 10-question quiz "${createdPaper.title}" formatted for printing!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-indigo-900 dark:bg-indigo-600 text-white shadow-md shadow-indigo-900/20">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {language === 'km' ? 'ធនាគារសំណួរ & វិញ្ញាសាប្រឡង' : 'Exam & Question Bank Repository'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-black border border-indigo-200 dark:border-indigo-800">
                  ថ្នាក់ទី ១ - ៦
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {language === 'km' 
                  ? 'រក្សាទុកលំហាត់ កម្រងសំណួរប្រឡងប្រចាំខែ ឬប្រចាំឆមាស និងកែច្នៃចេញជាវិញ្ញាសាថ្មីៗភ្លាមៗ' 
                  : 'Manage exercises, monthly & semester questions, and instantly assemble official MoEYS exam papers'}
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation Switcher */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveSubTab('bank')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSubTab === 'bank'
                  ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>{language === 'km' ? 'ធនាគារសំណួរ' : 'Question Bank'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-[10px] text-indigo-900 dark:text-indigo-200">
                {questions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('papers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSubTab === 'papers'
                  ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>{language === 'km' ? 'កម្រងវិញ្ញាសា' : 'Saved Exams'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-[10px] text-emerald-900 dark:text-emerald-200">
                {examPapers.length}
              </span>
            </button>

            {activeExamPaper && (
              <button
                onClick={() => setActiveSubTab('print_preview')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeSubTab === 'print_preview'
                    ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Printer className="w-4 h-4 text-amber-500" />
                <span>{language === 'km' ? 'ទម្រង់បោះពុម្ព' : 'Print Sheet'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Grade Level Selector Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            {language === 'km' ? 'កម្រិតថ្នាក់៖' : 'Grade:'}
          </span>
          <button
            onClick={() => setSelectedGrade(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              selectedGrade === 0
                ? 'bg-indigo-900 dark:bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {language === 'km' ? 'គ្រប់ថ្នាក់ (១-៦)' : 'All Grades (1-6)'}
          </button>
          {[1, 2, 3, 4, 5, 6].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                selectedGrade === g
                  ? 'bg-indigo-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {language === 'km' ? `ថ្នាក់ទី ${g}` : `Grade ${g}`}
            </button>
          ))}
        </div>

        {/* AI Quick Exam Generator Callout Strip */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shadow-indigo-950/20 border border-indigo-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-xs text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black tracking-tight">
                  {language === 'km' ? 'កែច្នៃវិញ្ញាសាភ្លាមៗដោយ AI (Quick Exam Generator)' : 'AI Quick Exam Generator'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  10 Qs Quiz
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 mt-0.5">
                {language === 'km' 
                  ? 'បញ្ចូលប្រធានបទ ជ្រើសកម្រិតថ្នាក់ (១-៦) និងកម្រិតលំបាក (ងាយ/មធ្យម/លំបាក) ដើម្បីបង្កើតវិញ្ញាសា ១០ សំណួរស្វ័យប្រវត្តិតាមស្តង់ដារបោះពុម្ព (A4)' 
                  : 'Enter topic, grade & difficulty to auto-generate a 10-question quiz formatted for printing'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickExamModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-indigo-950 text-xs font-black transition shadow-xs cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{language === 'km' ? 'បង្កើតវិញ្ញាសា ១០ សំណួរ' : 'Auto-Generate Quiz'}</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SUB-TAB 1: QUESTION BANK VIEW                                       */}
      {/* =================================================================== */}
      {activeSubTab === 'bank' && (
        <div className="space-y-4">
          {/* Action Ribbon & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ស្វែងរកសំណួរ លំហាត់ មេរៀន ឬស្លាក...' : 'Search question prompt, topic, keyword...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* AI Quick Exam Generator Button */}
                <button
                  onClick={() => setShowQuickExamModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-800 hover:from-indigo-800 hover:to-purple-700 text-white text-xs font-black transition shadow-xs cursor-pointer"
                  title={language === 'km' ? 'កែច្នៃវិញ្ញាសាតេស្ត ១០ សំណួរដោយ AI' : 'AI-Powered Quick 10-Question Quiz Generator'}
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>{language === 'km' ? 'AI Quick Exam (១០ សំណួរ)' : 'AI Quick Exam (10 Qs)'}</span>
                </button>

                {/* Auto Assemble Wizard Button */}
                <button
                  onClick={() => setShowAutoAssembleModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black transition shadow-xs cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{language === 'km' ? 'កែច្នៃវិញ្ញាសាស្វ័យប្រវត្តិ' : 'Auto-Assemble'}</span>
                </button>

                {/* Add New Question Button */}
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionModal(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'km' ? 'បន្ថែមសំណួរថ្មី' : 'Add Question'}</span>
                </button>

                {/* Import / Export JSON */}
                <button
                  onClick={handleExportJson}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title={language === 'km' ? 'នាំចេញ JSON' : 'Export JSON'}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title={language === 'km' ? 'នាំចូល JSON' : 'Import JSON'}
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />

                {/* Reset to defaults */}
                <button
                  onClick={() => {
                    if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់កំណត់សំណួរគំរូឡើងវិញមែនទេ?' : 'Reset to default questions?')) {
                      resetQuestionsToDefault();
                      showToast(language === 'km' ? 'បានកំណត់ឡើងវិញនូវសំណួរគំរូ!' : 'Reset questions to default!');
                    }
                  }}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-500 transition cursor-pointer"
                  title={language === 'km' ? 'កំណត់លំនាំដើមឡើងវិញ' : 'Reset to default'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Subject Filter */}
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">{language === 'km' ? 'មុខវិជ្ជា៖ ទាំងអស់' : 'All Subjects'}</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {language === 'km' ? s.nameKm : s.nameEn}
                  </option>
                ))}
              </select>

              {/* Exam Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">{language === 'km' ? 'ប្រភេទ៖ ទាំងអស់' : 'All Exam Types'}</option>
                <option value="monthly">{language === 'km' ? 'ប្រឡងប្រចាំខែ' : 'Monthly Exam'}</option>
                <option value="semester">{language === 'km' ? 'ប្រឡងប្រចាំឆមាស' : 'Semester Exam'}</option>
                <option value="weekly_quiz">{language === 'km' ? 'តេស្តប្រចាំសប្តាហ៍' : 'Weekly Quiz'}</option>
                <option value="practice">{language === 'km' ? 'លំហាត់ហ្វឹកហាត់' : 'Practice'}</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">{language === 'km' ? 'កម្រិត៖ ទាំងអស់' : 'All Difficulties'}</option>
                <option value="easy">{language === 'km' ? 'កម្រិតងាយ' : 'Easy'}</option>
                <option value="medium">{language === 'km' ? 'កម្រិតមធ្យម' : 'Medium'}</option>
                <option value="hard">{language === 'km' ? 'កម្រិតលំបាក' : 'Hard'}</option>
              </select>

              {/* Question Type Filter */}
              <select
                value={selectedQuestionType}
                onChange={(e) => setSelectedQuestionType(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">{language === 'km' ? 'ទម្រង់៖ ទាំងអស់' : 'All Question Types'}</option>
                <option value="multiple_choice">{language === 'km' ? 'ពហុជ្រើសរើស' : 'Multiple Choice'}</option>
                <option value="problem_solving">{language === 'km' ? 'ចំណោទ / ដោះស្រាយ' : 'Problem Solving'}</option>
                <option value="fill_in_blank">{language === 'km' ? 'បំពេញចន្លោះ' : 'Fill in Blank'}</option>
                <option value="true_false">{language === 'km' ? 'ត្រូវ ឬ ខុស' : 'True / False'}</option>
                <option value="short_answer">{language === 'km' ? 'សំណួរឆ្លើយខ្លី' : 'Short Answer'}</option>
                <option value="dictation_writing">{language === 'km' ? 'សរសេរតាមអាន/តែងសេចក្តី' : 'Dictation / Essay'}</option>
              </select>
            </div>
          </div>

          {/* Matching Count Bar */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <span>
              {language === 'km' ? 'បង្ហាញ ' : 'Showing '}
              <strong className="text-slate-900 dark:text-slate-100">{filteredQuestions.length}</strong>
              {language === 'km' ? ` ក្នុងចំណោម ${questions.length} សំណួរ` : ` of ${questions.length} questions`}
            </span>

            {selectedQuestionIds.size > 0 && (
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {language === 'km' ? `បានជ្រើសរើស ${selectedQuestionIds.size} សំណួរ (${selectedTotalPoints} ពិន្ទុ)` : `Selected ${selectedQuestionIds.size} (${selectedTotalPoints} pts)`}
              </span>
            )}
          </div>

          {/* Questions Grid */}
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {language === 'km' ? 'រកមិនឃើញសំណួរត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ' : 'No questions matching criteria'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'km' 
                  ? 'សូមសាកល្បងផ្លាស់ប្តូរកម្រិតថ្នាក់ មុខវិជ្ជា ឬបន្ថែមសំណួរថ្មីចូលទៅក្នុងធនាគារ។' 
                  : 'Try changing the grade or subject filter, or add a new question.'}
              </p>
              <button
                onClick={() => {
                  setSelectedGrade(0);
                  setSelectedSubjectId('all');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSelectedQuestionType('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
              >
                {language === 'km' ? 'សម្អាតលក្ខខណ្ឌទាំងអស់' : 'Clear All Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuestions.map(q => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  subjects={subjects}
                  language={language}
                  isSelected={selectedQuestionIds.has(q.id)}
                  onToggleSelect={handleToggleSelectQuestion}
                  onEdit={(targetQ) => {
                    setEditingQuestion(targetQ);
                    setShowQuestionModal(true);
                  }}
                  onDuplicate={(qId) => {
                    const dup = duplicateQuestion(qId);
                    if (dup) {
                      showToast(language === 'km' ? 'បានចម្លងសំណួរថ្មីដោយជោគជ័យ!' : 'Duplicated question!');
                    }
                  }}
                  onDelete={(qId) => {
                    if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់លុបសំណួរនេះមែនទេ?' : 'Delete this question?')) {
                      deleteQuestion(qId);
                      showToast(language === 'km' ? 'បានលុបសំណួររួចរាល់!' : 'Deleted question!');
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* Sticky Bottom Cart Drawer when questions are selected */}
          {selectedQuestionIds.size > 0 && (
            <div className="sticky bottom-4 z-30 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm">
                  {selectedQuestionIds.size}
                </div>
                <div>
                  <h4 className="text-sm font-black">
                    {language === 'km' ? 'វិញ្ញាសាកំពុងរៀបចំ' : 'Selected Questions for Exam'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {selectedQuestionIds.size} {language === 'km' ? 'សំណួរ' : 'questions'} • {language === 'km' ? 'សរុប' : 'Total'} <strong>{selectedTotalPoints}</strong> {language === 'km' ? 'ពិន្ទុ' : 'points'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedQuestionIds(new Set())}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  {language === 'km' ? 'សម្អាត' : 'Clear'}
                </button>
                <button
                  onClick={handleAssembleFromSelected}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black transition shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{language === 'km' ? 'បង្កើតវិញ្ញាសាភ្លាមៗ' : 'Assemble Exam Paper'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 2: SAVED EXAM PAPERS REPOSITORY                             */}
      {/* =================================================================== */}
      {activeSubTab === 'papers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                {language === 'km' ? 'កម្រងវិញ្ញាសាដែលបានបង្កើតរួច' : 'Saved Exam Papers Repository'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'អាចទាញយកមកបោះពុម្ព កែសម្រួល ឬចម្លងចេញជាវិញ្ញាសា ក និង វិញ្ញាសា ខ' 
                  : 'Ready to print, edit points, or clone into Exam Version A and B'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowQuickExamModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-800 hover:from-indigo-800 hover:to-purple-700 text-white text-xs font-black transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{language === 'km' ? 'AI Quick Exam (១០ សំណួរ)' : 'AI Quick Exam (10 Qs)'}</span>
              </button>

              <button
                onClick={() => setShowAutoAssembleModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-xs cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>{language === 'km' ? 'កែច្នៃវិញ្ញាសាថ្មី' : 'Assemble New Exam'}</span>
              </button>
            </div>
          </div>

          {filteredExamPapers.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {language === 'km' ? 'មិនទាន់មានវិញ្ញាសារក្សាទុកសម្រាប់កម្រិតថ្នាក់នេះទេ' : 'No saved exam papers found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'km' 
                  ? 'អ្នកអាចជ្រើសរើសសំណួរពីធនាគារ ឬប្រើមុខងារ "កែច្នៃវិញ្ញាសាស្វ័យប្រវត្តិ" ដើម្បីបង្កើតភ្លាមៗ។' 
                  : 'Pick questions from the bank or use Auto-Assemble to generate an exam paper.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExamPapers.map(paper => {
                const subObj = subjects.find(s => s.id === paper.subjectId);
                const subName = language === 'km' ? (subObj?.nameKm || paper.subjectId) : (subObj?.nameEn || paper.subjectId);
                const totalPoints = paper.items.reduce((s, it) => s + (it.customPoints || it.questionSnapshot.points || 1), 0);

                return (
                  <div 
                    key={paper.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-black">
                            {language === 'km' ? `ថ្នាក់ទី ${paper.grade}` : `Grade ${paper.grade}`}
                          </span>
                          <span 
                            className="px-2 py-0.5 rounded-md text-xs font-bold border"
                            style={{
                              backgroundColor: `${subObj?.color || '#4f46e5'}15`,
                              borderColor: `${subObj?.color || '#4f46e5'}40`,
                              color: subObj?.color || '#4f46e5'
                            }}
                          >
                            {subName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {paper.code}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-slate-100 mt-2">
                          {paper.title}
                        </h4>
                      </div>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                        <span><strong>{paper.items.length}</strong> {language === 'km' ? 'សំណួរ' : 'Qs'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span><strong>{totalPoints}</strong> {language === 'km' ? 'ពិន្ទុ' : 'pts'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span><strong>{paper.durationMinutes}</strong> {language === 'km' ? 'នាទី' : 'mins'}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            setActiveExamPaper(paper);
                            setActiveSubTab('print_preview');
                          }}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs font-black transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{language === 'km' ? 'មើល & បោះពុម្ព' : 'Preview & Print'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingPaper(paper);
                            setShowPaperEditorModal(true);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{language === 'km' ? 'កែសម្រួល' : 'Edit'}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const dup = duplicateExamPaper(paper.id);
                            if (dup) {
                              showToast(language === 'km' ? 'បានចម្លងបង្កើតវិញ្ញាសាថ្មី!' : 'Duplicated exam paper!');
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                          title={language === 'km' ? 'ចម្លងបង្កើតវិញ្ញាសាថ្មី' : 'Duplicate'}
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់លុបវិញ្ញាសានេះមែនទេ?' : 'Delete this exam paper?')) {
                              deleteExamPaper(paper.id);
                              if (activeExamPaper?.id === paper.id) {
                                setActiveExamPaper(null);
                              }
                              showToast(language === 'km' ? 'បានលុបវិញ្ញាសារួចរាល់!' : 'Deleted exam paper!');
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          title={language === 'km' ? 'លុប' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 3: PRINT PREVIEW SHEET VIEW                                 */}
      {/* =================================================================== */}
      {activeSubTab === 'print_preview' && activeExamPaper && (
        <PrintableExamPaper
          examPaper={activeExamPaper}
          subjects={subjects}
          schoolProfile={schoolProfile}
          language={language}
          onBack={() => setActiveSubTab('papers')}
          onEdit={(paper) => {
            setEditingPaper(paper);
            setShowPaperEditorModal(true);
          }}
        />
      )}

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestion(null);
        }}
        onSave={(data) => {
          if (editingQuestion) {
            updateQuestion(editingQuestion.id, data);
            showToast(language === 'km' ? 'បានកែសម្រួលសំណួររួចរាល់!' : 'Updated question!');
          } else {
            addQuestion(data);
            showToast(language === 'km' ? 'បានបន្ថែមសំណួរថ្មីចូលធនាគារ!' : 'Added question to bank!');
          }
        }}
        editingQuestion={editingQuestion}
        subjects={subjects}
        language={language}
        defaultGrade={selectedGrade !== 0 ? selectedGrade : 4}
        defaultSubjectId={selectedSubjectId !== 'all' ? selectedSubjectId : 'sub_math'}
      />

      {/* Auto-Assemble Blueprint Modal */}
      <AutoAssembleModal
        isOpen={showAutoAssembleModal}
        onClose={() => setShowAutoAssembleModal(false)}
        questions={questions}
        subjects={subjects}
        periods={periods}
        language={language}
        defaultGrade={selectedGrade !== 0 ? selectedGrade : (activeClass?.grade || 4)}
        defaultSubjectId={selectedSubjectId !== 'all' ? selectedSubjectId : 'sub_math'}
        schoolName={schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាគំរូ'}
        academicYear={activeClass?.academicYear || '២០២៥ - ២០២៦'}
        onAssemble={handleAutoAssemble}
      />

      {/* AI-Powered Quick Exam Generator Modal */}
      <QuickExamGeneratorModal
        isOpen={showQuickExamModal}
        onClose={() => setShowQuickExamModal(false)}
        subjects={subjects}
        periods={periods}
        language={language}
        activeClass={activeClass}
        defaultGrade={selectedGrade !== 0 ? selectedGrade : (activeClass?.grade || 4)}
        schoolName={schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាគំរូ'}
        academicYear={activeClass?.academicYear || '២០២៥ - ២០២៦'}
        onGenerated={handleQuickExamGenerated}
      />

      {/* Exam Paper Editor Modal */}
      <ExamPaperEditorModal
        isOpen={showPaperEditorModal}
        onClose={() => {
          setShowPaperEditorModal(false);
          setEditingPaper(null);
        }}
        examPaper={editingPaper}
        subjects={subjects}
        language={language}
        onSave={(id, updates) => {
          updateExamPaper(id, updates);
          if (activeExamPaper?.id === id) {
            setActiveExamPaper(prev => prev ? { ...prev, ...updates } : null);
          }
          showToast(language === 'km' ? 'បានរក្សាទុកការកែប្រែវិញ្ញាសា!' : 'Updated exam paper!');
        }}
      />
    </div>
  );
};
