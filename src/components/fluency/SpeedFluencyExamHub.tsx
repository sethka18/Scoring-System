import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student, ReadingPassage, MathOperation, FluencyTestRecord } from '../../types';
import { KhmerReadingEvaluator } from './KhmerReadingEvaluator';
import { 
  generateMathQuestion, 
  GeneratedMathQuestion, 
  tokenizeKhmerText, 
  calculateWCPM, 
  calculateMathSpeedScore 
} from '../../utils/fluencyCalculations';
import { 
  Timer, 
  BookOpen, 
  Calculator, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  Save, 
  Volume2, 
  VolumeX, 
  Award, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Sparkles, 
  History, 
  Printer, 
  Check, 
  X, 
  Layers, 
  ArrowRight,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { PrintToPdfButton } from '../common/PrintToPdfButton';

export const SpeedFluencyExamHub: React.FC = () => {
  const { 
    language, 
    activeClass, 
    classStudents, 
    periods, 
    activePeriodId, 
    scoresMatrix, 
    updateSubjectScore,
    showToast,
    readingPassages,
    addReadingPassage,
    updateReadingPassage,
    deleteReadingPassage,
    fluencyRecords,
    saveFluencyRecord,
    deleteFluencyRecord
  } = useGradebook();

  // Active Hub Tab: 'reading' | 'math' | 'history'
  const [activeMode, setActiveMode] = useState<'reading' | 'math' | 'history'>('reading');

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return classStudents[0]?.id || '';
  });

  // Selected Assessment Period for score posting
  const [targetPeriodId, setTargetPeriodId] = useState<string>(activePeriodId || periods[0]?.id || 'month_dec');

  // Auto-save toggle
  const [autoSaveToGradebook, setAutoSaveToGradebook] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync selected student if class changes
  useEffect(() => {
    if (classStudents.length > 0 && (!selectedStudentId || !classStudents.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents]);

  const currentStudent = useMemo(() => {
    return classStudents.find(s => s.id === selectedStudentId) || classStudents[0];
  }, [classStudents, selectedStudentId]);

  const currentStudentIndex = useMemo(() => {
    return classStudents.findIndex(s => s.id === selectedStudentId);
  }, [classStudents, selectedStudentId]);

  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setSelectedStudentId(classStudents[currentStudentIndex - 1].id);
      resetReadingSession();
      resetMathSession();
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < classStudents.length - 1) {
      setSelectedStudentId(classStudents[currentStudentIndex + 1].id);
      resetReadingSession();
      resetMathSession();
    }
  };

  // Sound Synthesizer via Web Audio API
  const playChime = (type: 'tick' | 'start' | 'success' | 'buzzer') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'start') {
        [440, 554.37, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.45);
        });
      } else if (type === 'buzzer') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 180;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  };

  // =========================================================================
  // MODULE 1: READING SPEED & FLUENCY EXAM (ល្បឿនអំណាន)
  // =========================================================================
  const [selectedPassageId, setSelectedPassageId] = useState<string>(() => {
    // Default passage matching active class grade level if available
    const grade = activeClass?.gradeLevel || 1;
    const matched = readingPassages.find(p => p.gradeLevel === grade);
    return matched ? matched.id : readingPassages[0]?.id || '';
  });

  const [passageGradeFilter, setPassageGradeFilter] = useState<number>(activeClass?.gradeLevel || 0);

  const activePassage = useMemo(() => {
    return readingPassages.find(p => p.id === selectedPassageId) || readingPassages[0];
  }, [readingPassages, selectedPassageId]);

  // Tokenized passage words
  const passageWords = useMemo(() => {
    if (!activePassage?.content) return [];
    return tokenizeKhmerText(activePassage.content);
  }, [activePassage]);

  // Reading Timer State
  const [readingTimerLimit, setReadingTimerLimit] = useState<number>(60); // 60s standard reading test
  const [readingRemainingSeconds, setReadingRemainingSeconds] = useState<number>(60);
  const [readingElapsedSeconds, setReadingElapsedSeconds] = useState<number>(0);
  const [isReadingRunning, setIsReadingRunning] = useState<boolean>(false);
  const [readingExamFinished, setReadingExamFinished] = useState<boolean>(false);

  // Reading Error Tracking
  const [markedErrorWordIndices, setMarkedErrorWordIndices] = useState<Set<number>>(new Set());
  const [lastReadWordIndex, setLastReadWordIndex] = useState<number | null>(null);
  const [manualWordsAttempted, setManualWordsAttempted] = useState<number>(0);
  const [manualErrorCount, setManualErrorCount] = useState<number>(0);

  const readingTimerRef = useRef<any>(null);

  // Sync words when passage changes
  useEffect(() => {
    resetReadingSession();
  }, [selectedPassageId]);

  // Reading Timer Interval
  useEffect(() => {
    if (isReadingRunning) {
      readingTimerRef.current = setInterval(() => {
        setReadingElapsedSeconds(prev => prev + 1);
        setReadingRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(readingTimerRef.current);
            setIsReadingRunning(false);
            setReadingExamFinished(true);
            playChime('success');
            showToast(language === 'km' ? '⏰ អស់ពេលកំណត់ ១ នាទីនៃការអានហើយ!' : '⏰ Reading time is up!', 'info');
            return 0;
          }
          if (prev <= 6) {
            playChime('tick');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (readingTimerRef.current) clearInterval(readingTimerRef.current);
    }

    return () => {
      if (readingTimerRef.current) clearInterval(readingTimerRef.current);
    };
  }, [isReadingRunning]);

  const startReadingTimer = () => {
    if (readingExamFinished) {
      resetReadingSession();
    }
    setIsReadingRunning(true);
    playChime('start');
  };

  const pauseReadingTimer = () => {
    setIsReadingRunning(false);
  };

  const finishReadingExamEarly = () => {
    setIsReadingRunning(false);
    setReadingExamFinished(true);
    playChime('success');
    showToast(language === 'km' ? 'បានបញ្ចប់ការវាស់ល្បឿនអំណាន' : 'Reading assessment concluded', 'success');
  };

  const resetReadingSession = () => {
    setIsReadingRunning(false);
    setReadingExamFinished(false);
    setReadingRemainingSeconds(readingTimerLimit);
    setReadingElapsedSeconds(0);
    setMarkedErrorWordIndices(new Set());
    setLastReadWordIndex(null);
    setManualWordsAttempted(0);
    setManualErrorCount(0);
  };

  // Toggle word error on tap
  const toggleWordError = (wordIdx: number) => {
    setMarkedErrorWordIndices(prev => {
      const next = new Set(prev);
      if (next.has(wordIdx)) {
        next.delete(wordIdx);
      } else {
        next.add(wordIdx);
      }
      return next;
    });
  };

  // Mark word as last read
  const markLastReadWord = (wordIdx: number) => {
    setLastReadWordIndex(wordIdx);
    setManualWordsAttempted(wordIdx + 1);
  };

  // Effective calculation values
  const effectiveWordsAttempted = useMemo(() => {
    if (manualWordsAttempted > 0) return manualWordsAttempted;
    if (lastReadWordIndex !== null) return lastReadWordIndex + 1;
    if (readingExamFinished) return passageWords.length;
    return 0;
  }, [manualWordsAttempted, lastReadWordIndex, readingExamFinished, passageWords.length]);

  const effectiveErrors = useMemo(() => {
    if (manualErrorCount > 0) return manualErrorCount;
    return markedErrorWordIndices.size;
  }, [manualErrorCount, markedErrorWordIndices]);

  const readingMetrics = useMemo(() => {
    const elapsed = readingElapsedSeconds > 0 ? readingElapsedSeconds : readingTimerLimit;
    return calculateWCPM(effectiveWordsAttempted, effectiveErrors, elapsed);
  }, [effectiveWordsAttempted, effectiveErrors, readingElapsedSeconds, readingTimerLimit]);

  // Target Component for Gradebook
  const [readingTargetComponent, setReadingTargetComponent] = useState<'khmerReading' | 'quizzes' | 'rawScore'>('khmerReading');

  // Save Reading Exam to Gradebook
  const handleSaveReadingToGradebook = () => {
    if (!currentStudent) return;

    // 1. Update score in Gradebook
    const scoreVal = readingMetrics.score10;
    const remark = `តេស្តល្បឿនអំណាន (${activePassage?.title}): ${readingMetrics.wcpm} ពាក្យ/នាទី, កំហុស ${effectiveErrors}, ត្រឹមត្រូវ ${readingMetrics.accuracy}%`;

    const scoreData: any = {
      teacherRemark: remark
    };
    if (readingTargetComponent === 'khmerReading') {
      scoreData.khmerReading = scoreVal;
    } else if (readingTargetComponent === 'quizzes') {
      scoreData.quizzes = scoreVal;
    } else {
      scoreData.rawScore = scoreVal;
    }

    updateSubjectScore(currentStudent.id, targetPeriodId, 'sub_khmer', scoreData);

    // 2. Save Fluency Record
    const record: FluencyTestRecord = {
      id: `fl_read_${Date.now()}`,
      studentId: currentStudent.id,
      classId: activeClass?.id || '',
      periodId: targetPeriodId,
      testType: 'reading',
      timestamp: new Date().toISOString(),
      durationSeconds: readingElapsedSeconds || readingTimerLimit,
      passageId: activePassage?.id,
      passageTitle: activePassage?.title,
      totalWordsAttempted: effectiveWordsAttempted,
      errorCount: effectiveErrors,
      correctCount: readingMetrics.correctWords,
      wordsPerMinute: readingMetrics.wcpm,
      accuracyPercentage: readingMetrics.accuracy,
      calculatedScore10: scoreVal,
      syncedToGradebook: true,
      targetSubjectId: 'sub_khmer',
      targetComponent: readingTargetComponent,
      notes: remark
    };
    saveFluencyRecord(record);

    showToast(
      language === 'km' 
        ? `✅ បានបញ្ចូលពិន្ទុអំណាន ${scoreVal} ទៅសិស្ស «${currentStudent.name}» ក្នុងបញ្ជីពិន្ទុជោគជ័យ!` 
        : `Saved reading score ${scoreVal} for ${currentStudent.name} to gradebook!`,
      'success'
    );
  };

  // Auto save on finish if toggled
  useEffect(() => {
    if (readingExamFinished && autoSaveToGradebook && effectiveWordsAttempted > 0 && currentStudent) {
      handleSaveReadingToGradebook();
    }
  }, [readingExamFinished]);

  // Modal: Manage / Add Custom Reading Passage
  const [isPassageModalOpen, setIsPassageModalOpen] = useState<boolean>(false);
  const [editingPassage, setEditingPassage] = useState<Partial<ReadingPassage> | null>(null);
  const [passageFormTitle, setPassageFormTitle] = useState('');
  const [passageFormGrade, setPassageFormGrade] = useState<number>(activeClass?.gradeLevel || 1);
  const [passageFormCategory, setPassageFormCategory] = useState('រឿងខ្លី');
  const [passageFormTargetWpm, setPassageFormTargetWpm] = useState<number>(60);
  const [passageFormContent, setPassageFormContent] = useState('');

  const openNewPassageModal = () => {
    setEditingPassage(null);
    setPassageFormTitle('');
    setPassageFormGrade(activeClass?.gradeLevel || 1);
    setPassageFormCategory('រឿងខ្លី');
    setPassageFormTargetWpm(50);
    setPassageFormContent('');
    setIsPassageModalOpen(true);
  };

  const openEditPassageModal = (passage: ReadingPassage) => {
    setEditingPassage(passage);
    setPassageFormTitle(passage.title);
    setPassageFormGrade(passage.gradeLevel);
    setPassageFormCategory(passage.category || 'រឿងខ្លី');
    setPassageFormTargetWpm(passage.targetWpm || 60);
    setPassageFormContent(passage.content);
    setIsPassageModalOpen(true);
  };

  const handleSavePassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passageFormTitle.trim() || !passageFormContent.trim()) {
      showToast(language === 'km' ? 'សូមបញ្ចូលចំណងជើង និងអត្ថបទអំណាន' : 'Please fill in title and text', 'warning');
      return;
    }

    const calculatedWords = tokenizeKhmerText(passageFormContent).length;

    if (editingPassage && editingPassage.id) {
      updateReadingPassage(editingPassage.id, {
        title: passageFormTitle.trim(),
        gradeLevel: passageFormGrade,
        category: passageFormCategory.trim(),
        targetWpm: passageFormTargetWpm,
        content: passageFormContent.trim(),
        targetWords: calculatedWords
      });
    } else {
      addReadingPassage({
        title: passageFormTitle.trim(),
        gradeLevel: passageFormGrade,
        category: passageFormCategory.trim(),
        targetWpm: passageFormTargetWpm,
        content: passageFormContent.trim(),
        targetWords: calculatedWords,
        description: `អត្ថបទបង្កើតដោយគ្រូបង្រៀន (ពាក្យសរុប ${calculatedWords})`
      });
    }

    setIsPassageModalOpen(false);
  };

  // =========================================================================
  // MODULE 2: SPEED / MENTAL MATH EXAM (ការគិតលេខរហ័ស)
  // =========================================================================
  const [mathOperation, setMathOperation] = useState<MathOperation>('add');
  const [mathDigits, setMathDigits] = useState<1 | 2 | 3 | 4>(1);
  const [mathCustomPreset, setMathCustomPreset] = useState<'normal' | 'up_to_20'>('normal');
  const [mathTestMode, setMathTestMode] = useState<'oral' | 'keypad'>('oral'); // oral (teacher-clicks) vs keypad (student inputs)

  // Math Timer State
  const [mathTimerLimit, setMathTimerLimit] = useState<number>(60); // 60s
  const [mathRemainingSeconds, setMathRemainingSeconds] = useState<number>(60);
  const [mathElapsedSeconds, setMathElapsedSeconds] = useState<number>(0);
  const [isMathRunning, setIsMathRunning] = useState<boolean>(false);
  const [mathExamFinished, setMathExamFinished] = useState<boolean>(false);

  // Questions & Results
  const [currentMathQuestion, setCurrentMathQuestion] = useState<GeneratedMathQuestion | null>(null);
  const [mathAttemptedCount, setMathAttemptedCount] = useState<number>(0);
  const [mathCorrectCount, setMathCorrectCount] = useState<number>(0);
  const [mathMistakes, setMathMistakes] = useState<{ question: string; studentAnswer?: string; correctAnswer: string }[]>([]);
  const [studentInputAnswer, setStudentInputAnswer] = useState<string>('');

  const mathTimerRef = useRef<any>(null);

  // Next math question generator
  const spawnNextQuestion = () => {
    const customMax = mathCustomPreset === 'up_to_20' ? 20 : undefined;
    const q = generateMathQuestion(mathOperation, mathDigits, customMax);
    setCurrentMathQuestion(q);
    setStudentInputAnswer('');
  };

  // Initialize first question
  useEffect(() => {
    spawnNextQuestion();
  }, [mathOperation, mathDigits, mathCustomPreset]);

  // Math Timer Effect
  useEffect(() => {
    if (isMathRunning) {
      mathTimerRef.current = setInterval(() => {
        setMathElapsedSeconds(prev => prev + 1);
        setMathRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(mathTimerRef.current);
            setIsMathRunning(false);
            setMathExamFinished(true);
            playChime('success');
            showToast(language === 'km' ? '⏰ អស់ពេលកំណត់តេស្តគិតលេខរហ័សហើយ!' : '⏰ Math speed test time is up!', 'info');
            return 0;
          }
          if (prev <= 6) {
            playChime('tick');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (mathTimerRef.current) clearInterval(mathTimerRef.current);
    }

    return () => {
      if (mathTimerRef.current) clearInterval(mathTimerRef.current);
    };
  }, [isMathRunning]);

  const startMathTimer = () => {
    if (mathExamFinished) {
      resetMathSession();
    }
    setIsMathRunning(true);
    playChime('start');
  };

  const pauseMathTimer = () => {
    setIsMathRunning(false);
  };

  const finishMathExamEarly = () => {
    setIsMathRunning(false);
    setMathExamFinished(true);
    playChime('success');
    showToast(language === 'km' ? 'បានបញ្ចប់ការវាស់ល្បឿនគិតលេខ' : 'Mental math assessment concluded', 'success');
  };

  const resetMathSession = () => {
    setIsMathRunning(false);
    setMathExamFinished(false);
    setMathRemainingSeconds(mathTimerLimit);
    setMathElapsedSeconds(0);
    setMathAttemptedCount(0);
    setMathCorrectCount(0);
    setMathMistakes([]);
    setStudentInputAnswer('');
    spawnNextQuestion();
  };

  // Handler for Oral Mode: Teacher clicks Correct or Wrong
  const handleOralAnswer = (isCorrect: boolean) => {
    if (!isMathRunning && !mathExamFinished) {
      startMathTimer();
    }
    if (!currentMathQuestion) return;

    setMathAttemptedCount(prev => prev + 1);
    if (isCorrect) {
      setMathCorrectCount(prev => prev + 1);
      playChime('tick');
    } else {
      playChime('buzzer');
      setMathMistakes(prev => [
        ...prev,
        {
          question: currentMathQuestion.questionText,
          studentAnswer: language === 'km' ? 'ខុស' : 'Incorrect',
          correctAnswer: String(currentMathQuestion.correctAnswer)
        }
      ]);
    }
    spawnNextQuestion();
  };

  // Handler for Input Keypad / Enter submission
  const handleInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentMathQuestion || !studentInputAnswer.trim()) return;

    if (!isMathRunning && !mathExamFinished) {
      startMathTimer();
    }

    const parsedNum = parseInt(studentInputAnswer.trim());
    const isCorrect = parsedNum === currentMathQuestion.correctAnswer;

    setMathAttemptedCount(prev => prev + 1);
    if (isCorrect) {
      setMathCorrectCount(prev => prev + 1);
      playChime('tick');
    } else {
      playChime('buzzer');
      setMathMistakes(prev => [
        ...prev,
        {
          question: currentMathQuestion.questionText,
          studentAnswer: studentInputAnswer,
          correctAnswer: String(currentMathQuestion.correctAnswer)
        }
      ]);
    }
    spawnNextQuestion();
  };

  const mathMetrics = useMemo(() => {
    const elapsed = mathElapsedSeconds > 0 ? mathElapsedSeconds : mathTimerLimit;
    const errors = Math.max(0, mathAttemptedCount - mathCorrectCount);
    return calculateMathSpeedScore(mathAttemptedCount, errors, elapsed);
  }, [mathAttemptedCount, mathCorrectCount, mathElapsedSeconds, mathTimerLimit]);

  // Target Component for Math in Gradebook
  const [mathTargetComponent, setMathTargetComponent] = useState<'mathNumbers' | 'quizzes' | 'rawScore'>('mathNumbers');

  // Save Math Exam to Gradebook
  const handleSaveMathToGradebook = () => {
    if (!currentStudent) return;

    const scoreVal = mathMetrics.score10;
    const opLabel = mathOperation === 'add' ? 'បូក' : mathOperation === 'subtract' ? 'ដក' : mathOperation === 'multiply' ? 'គុណ' : mathOperation === 'divide' ? 'ចែក' : 'ចម្រុះ';
    const remark = `តេស្តគិតលេខរហ័ស (${opLabel} ${mathDigits}ខ្ទង់): ត្រូវ ${mathCorrectCount}/${mathAttemptedCount}, ភាពត្រឹមត្រូវ ${mathMetrics.accuracy}%, ល្បឿន ${mathMetrics.questionsPerMin} លំហាត់/នាទី`;

    const scoreData: any = {
      teacherRemark: remark
    };
    if (mathTargetComponent === 'mathNumbers') {
      scoreData.mathNumbers = scoreVal;
    } else if (mathTargetComponent === 'quizzes') {
      scoreData.quizzes = scoreVal;
    } else {
      scoreData.rawScore = scoreVal;
    }

    updateSubjectScore(currentStudent.id, targetPeriodId, 'sub_math', scoreData);

    const record: FluencyTestRecord = {
      id: `fl_math_${Date.now()}`,
      studentId: currentStudent.id,
      classId: activeClass?.id || '',
      periodId: targetPeriodId,
      testType: 'math',
      timestamp: new Date().toISOString(),
      durationSeconds: mathElapsedSeconds || mathTimerLimit,
      operation: mathOperation,
      digits: mathDigits,
      totalWordsAttempted: mathAttemptedCount,
      errorCount: mathAttemptedCount - mathCorrectCount,
      correctCount: mathCorrectCount,
      accuracyPercentage: mathMetrics.accuracy,
      mathMistakes: mathMistakes,
      calculatedScore10: scoreVal,
      syncedToGradebook: true,
      targetSubjectId: 'sub_math',
      targetComponent: mathTargetComponent,
      notes: remark
    };
    saveFluencyRecord(record);

    showToast(
      language === 'km' 
        ? `✅ បានបញ្ចូលពិន្ទុគណិត ${scoreVal} ទៅសិស្ស «${currentStudent.name}» ក្នុងបញ្ជីពិន្ទុជោគជ័យ!` 
        : `Saved math speed score ${scoreVal} for ${currentStudent.name} to gradebook!`,
      'success'
    );
  };

  // Auto-save math on finish
  useEffect(() => {
    if (mathExamFinished && autoSaveToGradebook && mathAttemptedCount > 0 && currentStudent) {
      handleSaveMathToGradebook();
    }
  }, [mathExamFinished]);

  // Current Gradebook score of student in Khmer and Math
  const studentScoresInPeriod = useMemo(() => {
    if (!currentStudent || !scoresMatrix[targetPeriodId]) return null;
    return scoresMatrix[targetPeriodId][currentStudent.id] || null;
  }, [scoresMatrix, targetPeriodId, currentStudent]);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                  {language === 'km' ? 'មជ្ឈមណ្ឌលប្រឡងល្បឿនអំណាន & គិតលេខរហ័ស' : 'Speed Reading & Mental Math Assessment Hub'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {activeClass ? (language === 'km' ? activeClass.nameKm : activeClass.name) : 'ថ្នាក់រៀន'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km' 
                  ? 'វាស់ស្ទង់ល្បឿនអំណាន WCPM (Words Correct Per Minute) និងការគិតលេខរហ័ស ជាមួយនាទីកំណត់ និងបញ្ចូលពិន្ទុក្នុងបញ្ជីដោយស្វ័យប្រវត្តិ' 
                  : 'Assess Oral Reading Fluency and Mental Math with live countdown, error tracking, and direct gradebook integration'}
              </p>
            </div>
          </div>

          {/* Quick Global Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto-Save Toggle */}
            <button
              onClick={() => setAutoSaveToGradebook(!autoSaveToGradebook)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                autoSaveToGradebook
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
              title={language === 'km' ? 'បញ្ចូលពិន្ទុដោយស្វ័យប្រវត្តិទៅបញ្ជីពិន្ទុពេលប្រឡងចប់' : 'Auto-save score to gradebook on completion'}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'km' ? (autoSaveToGradebook ? 'រក្សាទុកស្វ័យប្រវត្តិ: បើក' : 'រក្សាទុកស្វ័យប្រវត្តិ: បិទ') : (autoSaveToGradebook ? 'Auto-Save: ON' : 'Auto-Save: OFF')}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Period Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ខែ/តារាងពិន្ទុ:' : 'Target Period:'}
              </span>
              <select
                value={targetPeriodId}
                onChange={(e) => setTargetPeriodId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900">
                    {language === 'km' ? p.nameKm : p.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Selector Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={handlePrevStudent}
              disabled={currentStudentIndex <= 0}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={language === 'km' ? 'សិស្សមុន' : 'Previous Student'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Student Dropdown & Identity */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                {currentStudent?.gender === 'Female' ? 'កញ្ញា' : 'កុមារ'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      resetReadingSession();
                      resetMathSession();
                    }}
                    className="bg-white dark:bg-slate-900 font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {classStudents.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        {idx + 1}. {s.name} ({s.studentId}) - {s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                      </option>
                    ))}
                  </select>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    currentStudent?.gender === 'Female' 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                  }`}>
                    {currentStudent?.gender === 'Female' ? (language === 'km' ? 'ស្រី' : 'Female') : (language === 'km' ? 'ប្រុស' : 'Male')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>អត្តលេខ៖ {currentStudent?.studentId}</span>
                  <span>•</span>
                  <span>សិស្សទី {currentStudentIndex + 1} នៃ {classStudents.length} នាក់</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStudent}
              disabled={currentStudentIndex >= classStudents.length - 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={language === 'km' ? 'សិស្សបន្ទាប់' : 'Next Student'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Recorded Scores in Target Period */}
          <div className="flex items-center space-x-3 text-xs w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 dark:border-slate-700">
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300">
              <span className="font-medium text-[11px]">ភាសាខ្មែរ (អាន): </span>
              <span className="font-black text-sm">
                {studentScoresInPeriod?.sub_khmer?.khmerReading !== undefined 
                  ? studentScoresInPeriod.sub_khmer.khmerReading.toFixed(1) 
                  : (studentScoresInPeriod?.sub_khmer?.rawScore !== undefined ? studentScoresInPeriod.sub_khmer.rawScore.toFixed(1) : '-')}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
              <span className="font-medium text-[11px]">គណិត (លេខនព្វន្ត): </span>
              <span className="font-black text-sm">
                {studentScoresInPeriod?.sub_math?.mathNumbers !== undefined 
                  ? studentScoresInPeriod.sub_math.mathNumbers.toFixed(1) 
                  : (studentScoresInPeriod?.sub_math?.rawScore !== undefined ? studentScoresInPeriod.sub_math.rawScore.toFixed(1) : '-')}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveMode('reading')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeMode === 'reading'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'km' ? '១. ប្រព័ន្ធទាយ & វាយតម្លៃល្បឿនអានភាសាខ្មែរ' : '1. Khmer Reading Speed & Fluency Evaluator'}</span>
          </button>

          <button
            onClick={() => setActiveMode('math')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeMode === 'math'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{language === 'km' ? '២. តេស្តគិតលេខរហ័ស (Mental Math)' : '2. Mental Math Speed'}</span>
          </button>

          <button
            onClick={() => setActiveMode('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeMode === 'history'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'km' ? '៣. បញ្ជីលទ្ធផលរួមថ្នាក់ & របាយការណ៍' : '3. Class Roster & Report'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: KHMER READING SPEED & FLUENCY EVALUATOR */}
      {/* ========================================================================= */}
      {activeMode === "reading" && (
        <KhmerReadingEvaluator
          selectedStudentId={selectedStudentId}
          onSelectStudentId={setSelectedStudentId}
          targetPeriodId={targetPeriodId}
          onSelectPeriodId={setTargetPeriodId}
          soundEnabled={soundEnabled}
          onPlayChime={playChime}
        />
      )}

            {/* ========================================================================= */}
      {/* VIEW 2: SPEED / MENTAL MATH EXAM */}
      {/* ========================================================================= */}
      {activeMode === 'math' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Math Configuration, Flashcard Problem, & Keypad (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Configuration Card: Operations & Number of Digits */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    {language === 'km' ? 'កំណត់ប្រមាណវិធី & ចំនួនខ្ទង់' : 'Math Operation & Digits Configuration'}
                  </h2>
                </div>

                {/* Mode toggle: Oral vs Keypad */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setMathTestMode('oral')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      mathTestMode === 'oral'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {language === 'km' ? 'គ្រូសួរ-សិស្សឆ្លើយផ្ទាល់មាត់' : 'Oral Mode'}
                  </button>
                  <button
                    onClick={() => setMathTestMode('keypad')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      mathTestMode === 'keypad'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {language === 'km' ? 'វាយបញ្ចូលចម្លើយ' : 'Input Mode'}
                  </button>
                </div>
              </div>

              {/* Operations Selector (បូក ដក គុណ ចែក ចម្រុះ) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'ជ្រើសរើសប្រមាណវិធី៖' : 'Select Operation:'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'add', labelKm: 'បូក (+)', labelEn: 'Addition (+)', icon: '+' },
                    { id: 'subtract', labelKm: 'ដក (-)', labelEn: 'Subtraction (-)', icon: '-' },
                    { id: 'multiply', labelKm: 'គុណ (×)', labelEn: 'Multiplication (×)', icon: '×' },
                    { id: 'divide', labelKm: 'ចែក (÷)', labelEn: 'Division (÷)', icon: '÷' },
                    { id: 'mixed', labelKm: 'ចម្រុះ (+-×÷)', labelEn: 'Mixed (+-×÷)', icon: '±' },
                  ].map(op => (
                    <button
                      key={op.id}
                      onClick={() => setMathOperation(op.id as MathOperation)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        mathOperation === op.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-lg font-black">{op.icon}</span>
                      <span className="text-[11px] font-bold mt-0.5 whitespace-nowrap">
                        {language === 'km' ? op.labelKm : op.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Digits Selector (ចំនួនខ្ទង់) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'ជ្រើសរើសចំនួនខ្ទង់ / កម្រិតថ្នាក់៖' : 'Select Digits & Number Range:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => {
                      setMathCustomPreset('up_to_20');
                      setMathDigits(1);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      mathCustomPreset === 'up_to_20'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {language === 'km' ? 'ត្រឹម ២០ (ថ្នាក់ទី១-២)' : 'Up to 20 (G1-2)'}
                  </button>

                  <button
                    onClick={() => {
                      setMathCustomPreset('normal');
                      setMathDigits(1);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      mathCustomPreset === 'normal' && mathDigits === 1
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {language === 'km' ? '១ ខ្ទង់ (1 - 9)' : '1 Digit (1-9)'}
                  </button>

                  <button
                    onClick={() => {
                      setMathCustomPreset('normal');
                      setMathDigits(2);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      mathCustomPreset === 'normal' && mathDigits === 2
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {language === 'km' ? '២ ខ្ទង់ (10 - 99)' : '2 Digits (10-99)'}
                  </button>

                  <button
                    onClick={() => {
                      setMathCustomPreset('normal');
                      setMathDigits(3);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      mathCustomPreset === 'normal' && mathDigits === 3
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {language === 'km' ? '៣ ខ្ទង់ (100 - 999)' : '3 Digits (100-999)'}
                  </button>

                  <button
                    onClick={() => {
                      setMathCustomPreset('normal');
                      setMathDigits(4);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      mathCustomPreset === 'normal' && mathDigits === 4
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {language === 'km' ? '៤ ខ្ទង់ (1000 - 9999)' : '4 Digits'}
                  </button>
                </div>
              </div>
            </div>

            {/* Massive Flashcard Question Screen */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-2xs flex flex-col items-center justify-center space-y-6 text-center">
              <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {language === 'km' ? `លំហាត់ទី #${mathAttemptedCount + 1}` : `Question #${mathAttemptedCount + 1}`}
              </div>

              {/* Big Math Expression */}
              <div className="font-mono font-black text-6xl sm:text-7xl lg:text-8xl tracking-tight text-slate-900 dark:text-white select-none py-4">
                {currentMathQuestion ? currentMathQuestion.questionText : '...'}
                <span className="text-emerald-500 ml-3">=</span>
                <span className="text-slate-400 dark:text-slate-600 ml-3">?</span>
              </div>

              {/* Mode A: Oral Teacher Controls */}
              {mathTestMode === 'oral' && (
                <div className="w-full max-w-md space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleOralAnswer(true)}
                      className="flex items-center justify-center space-x-2 py-4 rounded-2xl font-heading font-black text-base sm:text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      <Check className="w-6 h-6 stroke-[3]" />
                      <span>{language === 'km' ? 'ឆ្លើយត្រូវ (+១)' : 'Correct (+1)'}</span>
                    </button>

                    <button
                      onClick={() => handleOralAnswer(false)}
                      className="flex items-center justify-center space-x-2 py-4 rounded-2xl font-heading font-black text-base sm:text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
                    >
                      <X className="w-6 h-6 stroke-[3]" />
                      <span>{language === 'km' ? 'ឆ្លើយខុស (កំហុស)' : 'Wrong (Error)'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    {language === 'km' 
                      ? 'ចម្លើយពិត៖ ' + (currentMathQuestion?.correctAnswer ?? '') + ' (សិស្សឆ្លើយផ្ទាល់មាត់ គ្រូចុចប៊ូតុងខាងលើ)'
                      : 'Correct Answer: ' + (currentMathQuestion?.correctAnswer ?? '')}
                  </div>
                </div>
              )}

              {/* Mode B: Keypad / Digital Answer Mode */}
              {mathTestMode === 'keypad' && (
                <div className="w-full max-w-sm space-y-3">
                  <form onSubmit={handleInputSubmit} className="flex items-center space-x-2">
                    <input
                      type="number"
                      autoFocus
                      placeholder="?"
                      value={studentInputAnswer}
                      onChange={(e) => setStudentInputAnswer(e.target.value)}
                      className="w-full px-4 py-3 text-center font-mono font-black text-3xl rounded-2xl border-2 border-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3.5 rounded-2xl font-heading font-black text-sm bg-emerald-600 text-white shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      {language === 'km' ? 'បញ្ជូន' : 'Enter'}
                    </button>
                  </form>

                  {/* On-screen numeric keypad */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(digit => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => setStudentInputAnswer(prev => prev + digit.toString())}
                        className={`py-3 rounded-xl font-mono font-bold text-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer ${
                          digit === 0 ? 'col-span-2' : ''
                        }`}
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setStudentInputAnswer(prev => prev.slice(0, -1))}
                      className="py-3 rounded-xl font-bold text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 cursor-pointer"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mistake Log List Card (បញ្ជីកំហុសរបស់សិស្ស) */}
            {mathMistakes.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                      {language === 'km' ? `បញ្ជីលំហាត់ដែលសិស្សឆ្លើយខុស (${mathMistakes.length} កំហុស)` : `Mistakes Log (${mathMistakes.length} errors)`}
                    </h3>
                  </div>
                  <button
                    onClick={() => setMathMistakes([])}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    {language === 'km' ? 'សម្អាតបញ្ជី' : 'Clear Log'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {mathMistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs flex items-center justify-between"
                    >
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {m.question} =
                      </span>
                      <div className="flex items-center space-x-2">
                        {m.studentAnswer && (
                          <span className="text-rose-600 font-bold line-through">{m.studentAnswer}</span>
                        )}
                        <span className="font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          {m.correctAnswer}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Math Countdown Timer & Live Evaluation Score (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Timer & Controls Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    {language === 'km' ? 'នាទីកំណត់គិតលេខ' : 'Math Speed Timer'}
                  </h3>
                </div>

                {/* Duration Presets */}
                <select
                  disabled={isMathRunning}
                  value={mathTimerLimit}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMathTimerLimit(val);
                    setMathRemainingSeconds(val);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
                >
                  <option value={30}>៣០ វិនាទី (30s)</option>
                  <option value={60}>១ នាទី (60s - ស្តង់ដារ)</option>
                  <option value={90}>១ នាទីកន្លះ (90s)</option>
                  <option value={120}>២ នាទី (120s)</option>
                  <option value={180}>៣ នាទី (180s)</option>
                </select>
              </div>

              {/* Big Animated Clock */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-mono font-black text-5xl sm:text-6xl tracking-tight text-slate-900 dark:text-white flex items-center">
                  <span>{Math.floor(mathRemainingSeconds / 60).toString().padStart(2, '0')}</span>
                  <span className="animate-pulse text-emerald-500 mx-1">:</span>
                  <span className={mathRemainingSeconds <= 10 && mathRemainingSeconds > 0 ? 'text-rose-500 animate-bounce' : ''}>
                    {(mathRemainingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>ប្រើពេល៖ {mathElapsedSeconds} វិនាទី</span>
                  <span>•</span>
                  <span>កម្រិតកំណត់៖ {mathTimerLimit} វិនាទី</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      mathRemainingSeconds <= 10 ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${(mathRemainingSeconds / mathTimerLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Timer Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {!isMathRunning ? (
                  <button
                    onClick={startMathTimer}
                    className="col-span-2 flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>{language === 'km' ? 'ចាប់ផ្តើមវាស់ល្បឿន' : 'Start Math Timer'}</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseMathTimer}
                    className="flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4" />
                    <span>{language === 'km' ? 'ផ្អាកសិន' : 'Pause'}</span>
                  </button>
                )}

                <button
                  onClick={finishMathExamEarly}
                  disabled={!isMathRunning && !mathExamFinished}
                  className="flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'km' ? 'បញ្ចប់តេស្ត' : 'Finish Test'}</span>
                </button>

                <button
                  onClick={resetMathSession}
                  className="flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
                </button>
              </div>
            </div>

            {/* Live Performance & Evaluation Score Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  {language === 'km' ? 'លទ្ធផល & ពិន្ទុគណិត' : 'Math Speed Score'}
                </h3>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'km' ? 'ឆ្លើយត្រូវ / សរុប' : 'Correct / Attempted'}
                  </div>
                  <div className="font-heading font-black text-3xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {mathCorrectCount} <span className="text-base text-slate-400">/ {mathAttemptedCount}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    កំហុស {mathAttemptedCount - mathCorrectCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'km' ? 'ល្បឿន & ភាពត្រឹមត្រូវ' : 'Speed & Accuracy'}
                  </div>
                  <div className="font-heading font-black text-3xl text-blue-600 dark:text-blue-400 mt-0.5">
                    {mathMetrics.accuracy}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {mathMetrics.questionsPerMin} លំហាត់/នាទី
                  </div>
                </div>
              </div>

              {/* Fluency Benchmark Level */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {language === 'km' ? 'កម្រិតសមត្ថភាព៖' : 'Fluency Benchmark:'}
                </span>
                <span
                  className="font-heading font-black text-xs px-3 py-1 rounded-full text-white shadow-xs"
                  style={{ backgroundColor: mathMetrics.color }}
                >
                  {mathMetrics.levelKm}
                </span>
              </div>

              {/* Converted 10-Point Score for Gradebook */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  {language === 'km' ? 'ពិន្ទុបំលែងលើ ១០ (សម្រាប់បញ្ជីពិន្ទុ)' : 'Converted Score out of 10'}
                </div>
                <div className="font-heading font-black text-4xl text-emerald-700 dark:text-emerald-300">
                  {mathMetrics.score10.toFixed(1)} <span className="text-lg font-bold text-slate-400">/ ១០</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {language === 'km' ? 'គណនាផ្អែកលើចំនួនត្រូវ និងភាពត្រឹមត្រូវ' : 'Calculated from correct answers and accuracy'}
                </div>
              </div>

              {/* Gradebook Target Component Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'បញ្ចូលទៅជួរឈរមុខវិជ្ជា៖' : 'Target Component:'}
                </label>
                <select
                  value={mathTargetComponent}
                  onChange={(e: any) => setMathTargetComponent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="mathNumbers">គណិតវិទ្យា ➔ ចំនួន និងលេខនព្វន្ត (mathNumbers - ២០%)</option>
                  <option value="quizzes">គណិតវិទ្យា ➔ កិច្ចការ/តេស្តប្រចាំខែ (quizzes)</option>
                  <option value="rawScore">គណិតវិទ្យា ➔ ពិន្ទុសរុបប្រចាំខែ (rawScore)</option>
                </select>
              </div>

              {/* One-Click Save to Gradebook Button */}
              <button
                onClick={handleSaveMathToGradebook}
                disabled={mathAttemptedCount === 0}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-heading font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {language === 'km' 
                    ? `💾 បញ្ចូលពិន្ទុ ${mathMetrics.score10.toFixed(1)} ទៅក្នុងបញ្ជីពិន្ទុ` 
                    : `Save Score ${mathMetrics.score10.toFixed(1)} to Gradebook`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CLASS ROSTER & TEST HISTORY */}
      {/* ========================================================================= */}
      {activeMode === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-600" />
                <span>{language === 'km' ? 'បញ្ជីលទ្ធផលតេស្តអំណាន និងគិតលេខរហ័សប្រចាំថ្នាក់' : 'Class Fluency & Mental Math Assessment Roster'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km' 
                  ? `ថ្នាក់៖ ${activeClass?.nameKm} • សរុប ${classStudents.length} នាក់ • វគ្គវាយតម្លៃ៖ ${periods.find(p => p.id === targetPeriodId)?.nameKm || targetPeriodId}` 
                  : `Class: ${activeClass?.name} • Total ${classStudents.length} students`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <PrintToPdfButton 
                labelEn="Print Test Report" 
                labelKm="បោះពុម្ពរបាយការណ៍តេស្ត" 
                documentTitle={`Fluency_Exam_${activeClass?.nameKm || 'Class'}`}
              />
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-heading font-black border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">ឈ្មោះសិស្ស</th>
                  <th className="py-3 px-3 text-center">ភេទ</th>
                  <th className="py-3 px-3 text-center">អត្តលេខ</th>
                  <th className="py-3 px-4 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                    ល្បឿនអំណាន (WCPM)
                  </th>
                  <th className="py-3 px-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                    កំហុស
                  </th>
                  <th className="py-3 px-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                    ពិន្ទុអំណាន/១០
                  </th>
                  <th className="py-3 px-4 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                    គិតលេខ (ត្រូវ/សរុប)
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                    ភាពត្រឹមត្រូវ
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                    ពិន្ទុគណិត/១០
                  </th>
                  <th className="py-3 px-3 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {classStudents.map((stu, idx) => {
                  // Find latest reading test for student
                  const readingRecord = fluencyRecords.find(r => r.studentId === stu.id && r.testType === 'reading');
                  // Find latest math test for student
                  const mathRecord = fluencyRecords.find(r => r.studentId === stu.id && r.testType === 'math');

                  return (
                    <tr
                      key={stu.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedStudentId === stu.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{stu.name}</span>
                        {selectedStudentId === stu.id && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                            កំពុងរើស
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          stu.gender === 'Female' 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {stu.studentId}
                      </td>

                      {/* Reading Stats */}
                      <td className="py-2.5 px-4 bg-blue-50/20 dark:bg-blue-950/10">
                        {readingRecord ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-blue-700 dark:text-blue-300">
                              {readingRecord.wordsPerMinute} WPM
                            </span>
                            {readingRecord.diagnosedWeakness && (
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate max-w-[150px]" title={readingRecord.diagnosedWeakness}>
                                ⚠️ {readingRecord.diagnosedWeakness}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">មិនទាន់តេស្ត</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-blue-50/20 dark:bg-blue-950/10">
                        {readingRecord ? (
                          <span className={`font-bold ${readingRecord.errorCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {readingRecord.errorCount}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-blue-50/20 dark:bg-blue-950/10">
                        {readingRecord ? (
                          <span className="font-black text-sm text-blue-700 dark:text-blue-300">
                            {readingRecord.calculatedScore10.toFixed(1)}
                          </span>
                        ) : '-'}
                      </td>

                      {/* Math Stats */}
                      <td className="py-2.5 px-4 bg-emerald-50/20 dark:bg-emerald-950/10">
                        {mathRecord ? (
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {mathRecord.correctCount} / {mathRecord.totalWordsAttempted}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">មិនទាន់តេស្ត</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                        {mathRecord ? (
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {mathRecord.accuracyPercentage}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                        {mathRecord ? (
                          <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                            {mathRecord.calculatedScore10.toFixed(1)}
                          </span>
                        ) : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentId(stu.id);
                            setActiveMode('reading');
                            resetReadingSession();
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                        >
                          តេស្តសិស្សនេះ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Test History Records Log */}
          {fluencyRecords.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                  {language === 'km' ? 'កំណត់ត្រាតេស្តលម្អិតនាពេលថ្មីៗ' : 'Recent Test Session Records'}
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {fluencyRecords.length} កំណត់ត្រា
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fluencyRecords.slice(0, 12).map((rec) => {
                  const student = classStudents.find(s => s.id === rec.studentId);
                  const isReading = rec.testType === 'reading';

                  return (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isReading 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isReading ? 'តេស្តអំណាន' : 'តេស្តគិតលេខ'}
                        </span>
                        <button
                          onClick={() => deleteFluencyRecord(rec.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="font-black text-slate-900 dark:text-white">
                          {student?.name || 'សិស្ស'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {rec.notes}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                        <span className="text-slate-400">
                          {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                          ពិន្ទុ៖ {rec.calculatedScore10.toFixed(1)} / ១០
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT READING PASSAGE */}
      {/* ========================================================================= */}
      {isPassageModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                  {editingPassage ? (language === 'km' ? 'កែសម្រួលអត្ថបទអំណាន' : 'Edit Reading Passage') : (language === 'km' ? 'បន្ថែមអត្ថបទអំណានថ្មី' : 'Add New Reading Passage')}
                </h3>
              </div>
              <button
                onClick={() => setIsPassageModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'km' ? 'ចំណងជើងអត្ថបទ *' : 'Passage Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ដំណើរកម្សាន្តទៅកាន់ខេត្តសៀមរាប"
                    value={passageFormTitle}
                    onChange={(e) => setPassageFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Grade level */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'km' ? 'កម្រិតថ្នាក់ *' : 'Grade Level *'}
                  </label>
                  <select
                    value={passageFormGrade}
                    onChange={(e) => setPassageFormGrade(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>{language === 'km' ? `ថ្នាក់ទី ${g}` : `Grade ${g}`}</option>
                    ))}
                  </select>
                </div>

                {/* Target WPM */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'km' ? 'គោលដៅពាក្យ/នាទី (Target WPM)' : 'Target WPM'}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={250}
                    value={passageFormTargetWpm}
                    onChange={(e) => setPassageFormTargetWpm(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'km' ? 'ប្រភេទអត្ថបទ' : 'Category'}
                  </label>
                  <input
                    type="text"
                    placeholder="ឧ. រឿងខ្លី, វិទ្យាសាស្ត្រ, សីលធម៌, បរិស្ថាន"
                    value={passageFormCategory}
                    onChange={(e) => setPassageFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                {/* Content */}
                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'km' ? 'ខ្លឹមសារអត្ថបទអំណាន (Text Content) *' : 'Passage Content *'}
                    </label>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      ចំនួនពាក្យសរុប៖ {tokenizeKhmerText(passageFormContent).length} ពាក្យ
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder="វាយបញ្ចូល ឬចម្លងអត្ថបទអំណានជាភាសាខ្មែរនៅទីនេះ..."
                    value={passageFormContent}
                    onChange={(e) => setPassageFormContent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPassageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {language === 'km' ? 'រក្សាទុកអត្ថបទ' : 'Save Passage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
