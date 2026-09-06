import { useState, useEffect, useCallback } from 'react';
import { ExamQuestion, ExamPaper, ExamPaperItem, ExamCategory, ExamDifficulty } from '../types';
import { DEFAULT_EXAM_QUESTIONS, DEFAULT_EXAM_PAPERS } from '../data/defaultExamQuestions';
import { LS_PREFIX } from '../context/GradebookContext';

const QUESTIONS_LS_KEY = `${LS_PREFIX}exam_questions_bank`;
const PAPERS_LS_KEY = `${LS_PREFIX}exam_papers_repository`;

export const useExamBank = () => {
  // Questions State
  const [questions, setQuestions] = useState<ExamQuestion[]>(() => {
    try {
      const stored = localStorage.getItem(QUESTIONS_LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse saved exam questions:', err);
    }
    return DEFAULT_EXAM_QUESTIONS;
  });

  // Exam Papers State
  const [examPapers, setExamPapers] = useState<ExamPaper[]>(() => {
    try {
      const stored = localStorage.getItem(PAPERS_LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse saved exam papers:', err);
    }
    return DEFAULT_EXAM_PAPERS;
  });

  // Sync Questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(QUESTIONS_LS_KEY, JSON.stringify(questions));
    } catch (err) {
      console.error('Failed to persist questions to localStorage:', err);
    }
  }, [questions]);

  // Sync Exam Papers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PAPERS_LS_KEY, JSON.stringify(examPapers));
    } catch (err) {
      console.error('Failed to persist exam papers to localStorage:', err);
    }
  }, [examPapers]);

  // -------------------------------------------------------------------------
  // Question Operations
  // -------------------------------------------------------------------------
  const addQuestion = useCallback((questionData: any): ExamQuestion => {
    const newQuestion: ExamQuestion = {
      ...questionData,
      id: questionData.id || `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: questionData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystemDefault: false
    };
    setQuestions(prev => [newQuestion, ...prev]);
    return newQuestion;
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<ExamQuestion>) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return q;
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const duplicateQuestion = useCallback((id: string): ExamQuestion | null => {
    const target = questions.find(q => q.id === id);
    if (!target) return null;

    const dup: ExamQuestion = {
      ...target,
      id: `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: target.title ? `${target.title} (ចម្លង)` : undefined,
      prompt: `${target.prompt} (ចម្លង)`,
      isSystemDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setQuestions(prev => [dup, ...prev]);
    return dup;
  }, [questions]);

  const resetQuestionsToDefault = useCallback(() => {
    setQuestions(DEFAULT_EXAM_QUESTIONS);
  }, []);

  const exportQuestionsJson = useCallback((): string => {
    return JSON.stringify(questions, null, 2);
  }, [questions]);

  const importQuestionsJson = useCallback((jsonString: string): { success: boolean; count: number; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'ទម្រង់ឯកសារ JSON មិនត្រឹមត្រូវ (ត្រូវតែជាបញ្ជី array)' };
      }

      const validList: ExamQuestion[] = [];
      for (const item of parsed) {
        if (item && item.prompt && typeof item.grade === 'number' && item.subjectId) {
          validList.push({
            id: item.id || `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            grade: item.grade,
            subjectId: item.subjectId,
            examCategory: item.examCategory || 'monthly',
            periodId: item.periodId || 'all',
            chapterOrTopic: item.chapterOrTopic || 'លំហាត់ទូទៅ',
            difficulty: item.difficulty || 'medium',
            questionType: item.questionType || 'multiple_choice',
            title: item.title,
            prompt: item.prompt,
            options: item.options || [],
            correctAnswer: item.correctAnswer || '',
            explanation: item.explanation || '',
            points: typeof item.points === 'number' ? item.points : 1,
            rubricGuide: item.rubricGuide,
            tags: item.tags || [],
            isSystemDefault: false,
            createdAt: item.createdAt || new Date().toISOString()
          });
        }
      }

      if (validList.length === 0) {
        return { success: false, count: 0, error: 'រកមិនឃើញសំណួរដែលមានទិន្នន័យត្រឹមត្រូវឡើយ' };
      }

      setQuestions(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const newOnes = validList.filter(q => !existingIds.has(q.id));
        return [...newOnes, ...prev];
      });

      return { success: true, count: validList.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'កំហុសបច្ចេកទេសក្នុងការទាញយក JSON' };
    }
  }, []);

  // -------------------------------------------------------------------------
  // Exam Paper Operations
  // -------------------------------------------------------------------------
  const addExamPaper = useCallback((paperData: any): ExamPaper => {
    const newPaper: ExamPaper = {
      ...paperData,
      id: paperData.id || `ep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: paperData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExamPapers(prev => [newPaper, ...prev]);
    return newPaper;
  }, []);

  const updateExamPaper = useCallback((id: string, updates: Partial<ExamPaper>) => {
    setExamPapers(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  }, []);

  const deleteExamPaper = useCallback((id: string) => {
    setExamPapers(prev => prev.filter(p => p.id !== id));
  }, []);

  const duplicateExamPaper = useCallback((id: string): ExamPaper | null => {
    const target = examPapers.find(p => p.id === id);
    if (!target) return null;

    const dup: ExamPaper = {
      ...target,
      id: `ep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (ច្បាប់ចម្លង)`,
      code: `${target.code}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setExamPapers(prev => [dup, ...prev]);
    return dup;
  }, [examPapers]);

  // Auto-Assemble / Smart Generator based on Blueprint
  const autoAssembleExamPaper = useCallback((params: {
    grade: number;
    subjectId: string;
    examCategory: ExamCategory;
    periodId: string;
    targetTotalScore: number;
    questionCount?: number;
    title?: string;
    instructions?: string;
    schoolName?: string;
    academicYear?: string;
    difficultyPreference?: 'all' | ExamDifficulty;
  }): ExamPaper => {
    // 1. Filter eligible candidate questions
    let candidates = questions.filter(q => q.grade === params.grade && q.subjectId === params.subjectId);

    if (params.difficultyPreference && params.difficultyPreference !== 'all') {
      const preferred = candidates.filter(q => q.difficulty === params.difficultyPreference);
      if (preferred.length >= 3) {
        candidates = preferred;
      }
    }

    // Fallback if not enough grade-specific: include all questions for this subject
    if (candidates.length === 0) {
      candidates = questions.filter(q => q.subjectId === params.subjectId);
    }
    if (candidates.length === 0) {
      candidates = [...questions];
    }

    // 2. Shuffle candidates
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());

    // 3. Pick questions up to count or score
    const targetCount = params.questionCount || Math.min(Math.max(3, Math.round(params.targetTotalScore / 2)), 6);
    const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));

    // Calculate individual points to sum up to targetTotalScore
    const rawTotalPoints = selected.reduce((sum, q) => sum + (q.points || 1), 0);
    const scaleFactor = rawTotalPoints > 0 ? params.targetTotalScore / rawTotalPoints : 1;

    const items: ExamPaperItem[] = selected.map((q, idx) => {
      // Pro-rate points or keep clean round numbers
      const scaledPoint = Math.round((q.points || 1) * scaleFactor * 2) / 2; // round to nearest 0.5
      return {
        questionId: q.id,
        customPoints: scaledPoint > 0 ? scaledPoint : 1,
        order: idx + 1,
        questionSnapshot: q
      };
    });

    // Make sure total sum matches target exactly by adjusting last item if needed
    const currentSum = items.reduce((sum, item) => sum + (item.customPoints || 1), 0);
    const diff = Math.round((params.targetTotalScore - currentSum) * 10) / 10;
    if (diff !== 0 && items.length > 0) {
      const last = items[items.length - 1];
      last.customPoints = Math.max(0.5, Math.round(((last.customPoints || 1) + diff) * 10) / 10);
    }

    const newPaper: ExamPaper = {
      id: `ep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: params.title || `វិញ្ញាសាប្រឡងគំរូ ថ្នាក់ទី${params.grade} (${params.examCategory === 'semester' ? 'ប្រចាំឆមាស' : 'ប្រចាំខែ'})`,
      code: `EXAM-G${params.grade}-${params.subjectId.replace('sub_', '').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      grade: params.grade,
      subjectId: params.subjectId,
      examCategory: params.examCategory,
      periodId: params.periodId,
      durationMinutes: params.examCategory === 'semester' ? 90 : 60,
      totalMaxScore: params.targetTotalScore,
      schoolName: params.schoolName || 'សាលាបឋមសិក្សាគំរូ',
      academicYear: params.academicYear || '២០២៥ - ២០២៦',
      instructions: params.instructions || 'ចូរអានសំណួរ និងសរសេរចម្លើយឱ្យបានស្អាតបាត ត្រឹមត្រូវតាមលំដាប់លំដោយ។',
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setExamPapers(prev => [newPaper, ...prev]);
    return newPaper;
  }, [questions]);

  return {
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
  };
};
