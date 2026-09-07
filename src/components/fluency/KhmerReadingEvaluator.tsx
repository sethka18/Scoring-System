import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Student, 
  ReadingPassage, 
  FluencyTestRecord, 
  KhmerReadingErrorType, 
  ReadingErrorBreakdown, 
  MarkedWordError 
} from '../../types';
import { 
  tokenizeKhmerText, 
  calculateWCPM, 
  diagnoseKhmerReadingFluency,
  MOEYS_READING_BENCHMARKS,
  KhmerReadingDiagnosticReport
} from '../../utils/fluencyCalculations';
import { 
  Timer, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Save, 
  Award, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Printer, 
  Check, 
  X, 
  ArrowRight,
  HelpCircle,
  FileText,
  AlertCircle,
  Plus,
  Minus,
  Activity,
  Brain,
  History,
  Info,
  Layers,
  ChevronDown
} from 'lucide-react';
import { PrintToPdfButton } from '../common/PrintToPdfButton';

export interface KhmerReadingEvaluatorProps {
  selectedStudentId: string;
  onSelectStudentId: (studentId: string) => void;
  targetPeriodId: string;
  onSelectPeriodId: (periodId: string) => void;
  soundEnabled: boolean;
  onPlayChime: (type: 'tick' | 'start' | 'success' | 'buzzer') => void;
}

// Diagnostic error configuration with 4 standard Khmer reading error types:
// ១. អានខុស (Misread)
// ២. អានរំលង (Omission)
// ៣. អានស្ទួន (Repetition)
// ៤. អានលើស (Addition)
export const KHMER_ERROR_CATEGORIES: {
  type: KhmerReadingErrorType;
  labelKm: string;
  shortLabelKm: string;
  descKm: string;
  colorClass: string;
  badgeClass: string;
  dotColor: string;
}[] = [
  {
    type: 'misread',
    labelKm: 'អានខុស (បញ្ចេញសំឡេងខុស / ប្រកបខុស)',
    shortLabelKm: 'អានខុស',
    descKm: 'បញ្ចេញសំឡេងខុស ប្រកបខុស ច្រឡំតួអក្សរ ឬច្រឡំពាក្យ',
    colorClass: 'bg-rose-500 text-white',
    badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dotColor: '#ef4444'
  },
  {
    type: 'omission',
    labelKm: 'អានរំលង (រំលងពាក្យ / រំលងជួរ)',
    shortLabelKm: 'អានរំលង',
    descKm: 'អានរំលងពាក្យចោល ឬរំលងឃ្លាដែលត្រូវអាន',
    colorClass: 'bg-amber-500 text-white',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dotColor: '#f59e0b'
  },
  {
    type: 'repetition',
    labelKm: 'អានស្ទួន (អានត្រឡប់ដដែលៗ)',
    shortLabelKm: 'អានស្ទួន',
    descKm: 'អានពាក្យ ឬឃ្លាដដែលៗឡើងវិញច្រើនដងដោយសារស្ទាក់ស្ទើរ',
    colorClass: 'bg-purple-600 text-white',
    badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dotColor: '#9333ea'
  },
  {
    type: 'addition',
    labelKm: 'អានលើស (បន្ថែមពាក្យដែលគ្មានក្នុងអត្ថបទ)',
    shortLabelKm: 'អានលើស',
    descKm: 'បន្ថែមពាក្យ ឬព្យាង្គដែលគ្មាននៅក្នុងអត្ថបទ',
    colorClass: 'bg-blue-600 text-white',
    badgeClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dotColor: '#2563eb'
  }
];

export const KhmerReadingEvaluator: React.FC<KhmerReadingEvaluatorProps> = ({
  selectedStudentId,
  onSelectStudentId,
  targetPeriodId,
  onSelectPeriodId,
  soundEnabled,
  onPlayChime
}) => {
  const { 
    language, 
    activeClass, 
    classStudents, 
    periods, 
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

  // Current Student & Navigation
  const currentStudent = useMemo(() => {
    return classStudents.find(s => s.id === selectedStudentId) || classStudents[0];
  }, [classStudents, selectedStudentId]);

  const currentStudentIndex = useMemo(() => {
    return classStudents.findIndex(s => s.id === selectedStudentId);
  }, [classStudents, selectedStudentId]);

  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      onSelectStudentId(classStudents[currentStudentIndex - 1].id);
      resetReadingSession();
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < classStudents.length - 1) {
      onSelectStudentId(classStudents[currentStudentIndex + 1].id);
      resetReadingSession();
    }
  };

  // Grade level benchmark
  const gradeLevel = activeClass?.gradeLevel || 1;
  const gradeBenchmark = MOEYS_READING_BENCHMARKS[gradeLevel] || MOEYS_READING_BENCHMARKS[1];

  // Passage selection
  const [selectedPassageId, setSelectedPassageId] = useState<string>(() => {
    const matched = readingPassages.find(p => p.gradeLevel === gradeLevel);
    return matched ? matched.id : readingPassages[0]?.id || '';
  });

  const [passageGradeFilter, setPassageGradeFilter] = useState<number>(gradeLevel || 0);

  const activePassage = useMemo(() => {
    return readingPassages.find(p => p.id === selectedPassageId) || readingPassages[0];
  }, [readingPassages, selectedPassageId]);

  // Tokenized words
  const passageWords = useMemo(() => {
    if (!activePassage?.content) return [];
    return tokenizeKhmerText(activePassage.content);
  }, [activePassage]);

  // Timer State
  const [readingTimerLimit, setReadingTimerLimit] = useState<number>(60); // 60s standard MoEYS reading test
  const [readingRemainingSeconds, setReadingRemainingSeconds] = useState<number>(60);
  const [readingElapsedSeconds, setReadingElapsedSeconds] = useState<number>(0);
  const [isReadingRunning, setIsReadingRunning] = useState<boolean>(false);
  const [readingExamFinished, setReadingExamFinished] = useState<boolean>(false);

  // Diagnostic Error Pen Selection (Active error tool)
  const [activeErrorPen, setActiveErrorPen] = useState<KhmerReadingErrorType | 'eraser'>('misread');

  // Word-by-word marked errors: Map<wordIndex, MarkedWordError>
  const [markedWordErrors, setMarkedWordErrors] = useState<Map<number, MarkedWordError>>(new Map());

  // Quick Tally Additions (from oral live counting pads)
  const [tallyAdjustments, setTallyAdjustments] = useState<ReadingErrorBreakdown>({
    misread: 0,
    omission: 0,
    repetition: 0,
    addition: 0
  });

  // Last read word index ("ដល់ទី")
  const [lastReadWordIndex, setLastReadWordIndex] = useState<number | null>(null);
  const [manualWordsAttempted, setManualWordsAttempted] = useState<number>(0);

  // Print Slip Modal
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);

  // Custom Passage Modal
  const [isPassageModalOpen, setIsPassageModalOpen] = useState<boolean>(false);
  const [editingPassage, setEditingPassage] = useState<Partial<ReadingPassage> | null>(null);

  const readingTimerRef = useRef<any>(null);

  // Reset when passage or student changes
  useEffect(() => {
    resetReadingSession();
  }, [selectedPassageId]);

  // Reading Timer Loop
  useEffect(() => {
    if (isReadingRunning) {
      readingTimerRef.current = setInterval(() => {
        setReadingElapsedSeconds(prev => prev + 1);
        setReadingRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(readingTimerRef.current);
            setIsReadingRunning(false);
            setReadingExamFinished(true);
            onPlayChime('success');
            showToast(
              language === 'km' 
                ? '⏰ អស់ពេលកំណត់ ១ នាទីនៃការអានហើយ! សូមពិនិត្យមើលពិន្ទុ និងការវិភាគចំណុចខ្សោយ' 
                : '⏰ Reading time is up! Review fluency scores and diagnostics', 
              'info'
            );
            return 0;
          }
          if (prev <= 6) {
            onPlayChime('tick');
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
    onPlayChime('start');
  };

  const pauseReadingTimer = () => {
    setIsReadingRunning(false);
  };

  const finishReadingExamEarly = () => {
    setIsReadingRunning(false);
    setReadingExamFinished(true);
    onPlayChime('success');
    showToast(language === 'km' ? 'បានបញ្ចប់ការវាស់ល្បឿនអំណាន' : 'Reading assessment concluded', 'success');
  };

  const resetReadingSession = () => {
    setIsReadingRunning(false);
    setReadingExamFinished(false);
    setReadingRemainingSeconds(readingTimerLimit);
    setReadingElapsedSeconds(0);
    setMarkedWordErrors(new Map());
    setTallyAdjustments({
      misread: 0,
      omission: 0,
      repetition: 0,
      addition: 0
    });
    setLastReadWordIndex(null);
    setManualWordsAttempted(0);
  };

  // Word Click Handler: Mark with active Error Pen or erase
  const handleWordClick = (wordIdx: number, word: string) => {
    setMarkedWordErrors(prev => {
      const next = new Map<number, MarkedWordError>(prev);
      if (activeErrorPen === 'eraser') {
        next.delete(wordIdx);
      } else {
        const existing = next.get(wordIdx);
        if (existing && existing.errorType === activeErrorPen) {
          // Toggle off if same type
          next.delete(wordIdx);
        } else {
          // Set to new error pen type
          next.set(wordIdx, {
            wordIndex: wordIdx,
            word,
            errorType: activeErrorPen
          });
        }
      }
      return next;
    });
  };

  // Mark word as last read point ("ដល់ទី")
  const handleMarkLastRead = (wordIdx: number) => {
    setLastReadWordIndex(wordIdx);
    setManualWordsAttempted(wordIdx + 1);
    showToast(language === 'km' ? `បានកំណត់ពាក្យដល់ទី៖ #${wordIdx + 1} (${passageWords[wordIdx]})` : `Last word reached: #${wordIdx + 1}`, 'info');
  };

  // Adjust quick tally pads
  const handleAdjustTally = (type: KhmerReadingErrorType, delta: number) => {
    setTallyAdjustments(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };

  // Combined error breakdown (marked words on text + tally adjustments)
  const combinedErrorBreakdown = useMemo<ReadingErrorBreakdown>(() => {
    const counts: ReadingErrorBreakdown = {
      misread: tallyAdjustments.misread,
      omission: tallyAdjustments.omission,
      repetition: tallyAdjustments.repetition,
      addition: tallyAdjustments.addition
    };

    markedWordErrors.forEach((err: MarkedWordError) => {
      counts[err.errorType] = (counts[err.errorType] || 0) + 1;
    });

    return counts;
  }, [markedWordErrors, tallyAdjustments]);

  // Total error count
  const totalErrors = useMemo(() => {
    return (
      combinedErrorBreakdown.misread +
      combinedErrorBreakdown.omission +
      combinedErrorBreakdown.repetition +
      combinedErrorBreakdown.addition
    );
  }, [combinedErrorBreakdown]);

  // Effective words attempted
  const effectiveWordsAttempted = useMemo(() => {
    if (manualWordsAttempted > 0) return manualWordsAttempted;
    if (lastReadWordIndex !== null) return lastReadWordIndex + 1;
    if (readingExamFinished) return passageWords.length;
    return 0;
  }, [manualWordsAttempted, lastReadWordIndex, readingExamFinished, passageWords.length]);

  // Reading Metrics & Calculation
  const readingMetrics = useMemo(() => {
    const elapsed = readingElapsedSeconds > 0 ? readingElapsedSeconds : readingTimerLimit;
    return calculateWCPM(effectiveWordsAttempted, totalErrors, elapsed, gradeLevel);
  }, [effectiveWordsAttempted, totalErrors, readingElapsedSeconds, readingTimerLimit, gradeLevel]);

  // Diagnostic & Predictive Report
  const diagnosticReport: KhmerReadingDiagnosticReport = useMemo(() => {
    return diagnoseKhmerReadingFluency(
      readingMetrics.wcpm,
      readingMetrics.accuracy,
      gradeLevel,
      combinedErrorBreakdown,
      activePassage?.title
    );
  }, [readingMetrics, gradeLevel, combinedErrorBreakdown, activePassage]);

  // Gradebook Target Column Selector
  const [readingTargetComponent, setReadingTargetComponent] = useState<'khmerReading' | 'quizzes' | 'rawScore'>('khmerReading');

  // Save Reading Exam to Gradebook
  const handleSaveReadingToGradebook = () => {
    if (!currentStudent) return;

    const scoreVal = readingMetrics.score10;
    const remark = diagnosticReport.moeysOfficialRemark;

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

    // Update in Gradebook scoresMatrix
    updateSubjectScore(currentStudent.id, targetPeriodId, 'sub_khmer', scoreData);

    // Save Fluency Record
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
      errorCount: totalErrors,
      correctCount: readingMetrics.correctWords,
      wordsPerMinute: readingMetrics.wcpm,
      accuracyPercentage: readingMetrics.accuracy,
      calculatedScore10: scoreVal,
      syncedToGradebook: true,
      targetSubjectId: 'sub_khmer',
      targetComponent: readingTargetComponent,
      errorBreakdown: combinedErrorBreakdown,
      markedErrors: Array.from(markedWordErrors.values()),
      diagnosedWeakness: diagnosticReport.primaryWeaknessKm,
      predictedMoEYSLevel: diagnosticReport.predictedLevel,
      remedialAdvice: diagnosticReport.remedialAdviceKm[0] || '',
      notes: remark
    };
    saveFluencyRecord(record);

    showToast(
      language === 'km' 
        ? `✅ បានបញ្ចូលពិន្ទុអំណាន ${scoreVal}/១០ និងការវិភាគចំណុចខ្សោយទៅសិស្ស «${currentStudent.name}» ក្នុងបញ្ជីពិន្ទុខែជោគជ័យ!` 
        : `Saved reading fluency score ${scoreVal}/10 to gradebook!`,
      'success'
    );
  };

  // Student Past Reading History
  const studentReadingHistory = useMemo(() => {
    if (!currentStudent) return [];
    return fluencyRecords
      .filter(r => r.studentId === currentStudent.id && r.testType === 'reading')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [fluencyRecords, currentStudent]);

  // Passage Modal Handlers
  const openNewPassageModal = () => {
    setEditingPassage({
      title: '',
      gradeLevel: gradeLevel,
      category: 'រឿងខ្លីសម្រាប់កុមារ',
      targetWpm: gradeBenchmark.targetWpm,
      content: '',
      description: ''
    });
    setIsPassageModalOpen(true);
  };

  const openEditPassageModal = (passage: ReadingPassage) => {
    setEditingPassage({ ...passage });
    setIsPassageModalOpen(true);
  };

  const handleSavePassage = () => {
    if (!editingPassage || !editingPassage.title?.trim() || !editingPassage.content?.trim()) {
      showToast(language === 'km' ? 'សូមបញ្ចូលចំណងជើង និងខ្លឹមសារអត្ថបទ' : 'Please provide title and content', 'error');
      return;
    }

    const calculatedWords = tokenizeKhmerText(editingPassage.content).length;

    if (editingPassage.id) {
      updateReadingPassage(editingPassage.id, {
        title: editingPassage.title,
        gradeLevel: editingPassage.gradeLevel || 1,
        category: editingPassage.category || 'ទូទៅ',
        content: editingPassage.content,
        targetWpm: editingPassage.targetWpm || 50,
        targetWords: calculatedWords,
        description: editingPassage.description || ''
      });
      showToast(language === 'km' ? 'បានកែសម្រួលអត្ថបទជោគជ័យ' : 'Passage updated', 'success');
    } else {
      const newId = `pass_custom_${Date.now()}`;
      addReadingPassage({
        id: newId,
        title: editingPassage.title,
        gradeLevel: editingPassage.gradeLevel || 1,
        category: editingPassage.category || 'អត្ថបទបង្កើតដោយគ្រូ',
        content: editingPassage.content,
        targetWpm: editingPassage.targetWpm || 50,
        targetWords: calculatedWords,
        description: editingPassage.description || '',
        isCustom: true
      });
      setSelectedPassageId(newId);
      showToast(language === 'km' ? 'បានបន្ថែមអត្ថបទថ្មីជោគជ័យ' : 'New passage created', 'success');
    }

    setIsPassageModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. STUDENT SWITCHER & ASSESSMENT CONTEXT BAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Active Student Info */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-heading font-black text-xl shadow-sm shadow-blue-500/20">
                {currentStudent?.name?.slice(0, 1) || 'ស'}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                currentStudent?.gender === 'F' ? 'bg-rose-500' : 'bg-blue-500'
              }`} />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {currentStudent?.name || (language === 'km' ? 'សូមជ្រើសរើសសិស្ស' : 'Select Student')}
                </h3>
                {currentStudent?.latinName && (
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    ({currentStudent.latinName})
                  </span>
                )}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentStudent?.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  #{currentStudent?.studentId || currentStudent?.id?.slice(-4)}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                <span>ថ្នាក់៖ <strong>{activeClass?.nameKm || 'ថ្នាក់ទី'}</strong></span>
                <span>•</span>
                <span>សិស្សទី {currentStudentIndex + 1} នៃ {classStudents.length} នាក់</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  ស្តង់ដារថ្នាក់ទី {gradeLevel}៖ ≥ {gradeBenchmark.targetWpm} ពាក្យ/នាទី
                </span>
              </p>
            </div>
          </div>

          {/* Right: Student Navigation & Period Selector */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
            {/* Student Dropdown */}
            <select
              value={selectedStudentId}
              onChange={(e) => {
                onSelectStudentId(e.target.value);
                resetReadingSession();
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {classStudents.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {idx + 1}. {s.name} ({s.gender === 'F' ? 'ស្រី' : 'ប្រុស'})
                </option>
              ))}
            </select>

            {/* Target Period Dropdown */}
            <select
              value={targetPeriodId}
              onChange={(e) => onSelectPeriodId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {periods.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nameKm}
                </option>
              ))}
            </select>

            {/* Prev / Next Student Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevStudent}
                disabled={currentStudentIndex <= 0}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title={language === 'km' ? 'សិស្សមុន' : 'Previous Student'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextStudent}
                disabled={currentStudentIndex >= classStudents.length - 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title={language === 'km' ? 'សិស្សបន្ទាប់' : 'Next Student'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Print Slip Button */}
            <button
              onClick={() => setIsSlipModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'km' ? 'ប័ណ្ណវាយតម្លៃ' : 'Evaluation Slip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN EVALUATOR WORKSPACE (2 COLUMNS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Passage Selector, Diagnostic Pen, Word Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Passage Selection & Meta Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  {language === 'km' ? 'ជ្រើសរើសអត្ថបទអំណានភាសាខ្មែរ' : 'Khmer Reading Passage'}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                {/* Grade filter */}
                <select
                  value={passageGradeFilter}
                  onChange={(e) => setPassageGradeFilter(parseInt(e.target.value))}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value={0}>{language === 'km' ? 'គ្រប់ថ្នាក់ (១-៦)' : 'All Grades (1-6)'}</option>
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>{language === 'km' ? `ថ្នាក់ទី ${g}` : `Grade ${g}`}</option>
                  ))}
                </select>

                {/* Add Custom Passage Button */}
                <button
                  onClick={openNewPassageModal}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បន្ថែមអត្ថបទ' : 'New Passage'}</span>
                </button>
              </div>
            </div>

            {/* Passage Selector Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <select
                value={selectedPassageId}
                onChange={(e) => setSelectedPassageId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {readingPassages
                  .filter(p => passageGradeFilter === 0 || p.gradeLevel === passageGradeFilter)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} (ថ្នាក់ទី {p.gradeLevel} • {p.targetWords || tokenizeKhmerText(p.content).length} ពាក្យ • គោលដៅ {p.targetWpm} WPM) {p.isCustom ? '★ បង្កើតដោយគ្រូ' : ''}
                    </option>
                  ))}
              </select>

              {activePassage && (
                <button
                  onClick={() => openEditPassageModal(activePassage)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer shrink-0"
                  title={language === 'km' ? 'កែសម្រួលអត្ថបទនេះ' : 'Edit this passage'}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Passage Info Badges */}
            {activePassage && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
                  ថ្នាក់ទី {activePassage.gradeLevel}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  ពាក្យសរុប៖ {passageWords.length} ពាក្យ
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                  គោលដៅស្តង់ដារ៖ ≥ {activePassage.targetWpm || gradeBenchmark.targetWpm} ពាក្យ/នាទី
                </span>
                {activePassage.category && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
                    {activePassage.category}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Diagnostic Error Pen Selector Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>{language === 'km' ? 'ប៊ិចសម្គាល់ចំណុចខ្សោយ (ជ្រើសរើសប្រភេទកំហុស)' : 'Diagnostic Error Pen'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'km' 
                    ? 'ជ្រើសរើសប៊ិចខាងក្រោម រួចចុចលើពាក្យក្នុងអត្ថបទដើម្បីសម្គាល់កំហុស ឬចុច២ដងកំណត់ពាក្យអានដល់' 
                    : 'Select error type then tap words in passage to diagnose'}
                </p>
              </div>

              {/* Total marked badge */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">កំហុសសរុប៖</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {totalErrors} ពាក្យ
                </span>
              </div>
            </div>

            {/* Error Type Selector Pills (4 categories + 1 eraser) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {KHMER_ERROR_CATEGORIES.map(cat => {
                const isSelected = activeErrorPen === cat.type;
                const count = combinedErrorBreakdown[cat.type] || 0;

                return (
                  <button
                    key={cat.type}
                    onClick={() => setActiveErrorPen(cat.type)}
                    className={`p-2 rounded-xl text-left transition-all border cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-blue-500 shadow-xs border-blue-300 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.dotColor }} />
                      <span className="text-[10px] font-black px-1 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-2xs">
                        {count}
                      </span>
                    </div>
                    <div className="mt-1.5 font-bold text-[11px] leading-tight text-slate-900 dark:text-white">
                      {cat.shortLabelKm}
                    </div>
                  </button>
                );
              })}

              {/* Eraser Tool */}
              <button
                onClick={() => setActiveErrorPen('eraser')}
                className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  activeErrorPen === 'eraser'
                    ? 'ring-2 ring-slate-500 shadow-xs border-slate-400 bg-slate-200 dark:bg-slate-700'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <X className="w-3 h-3 text-slate-500" />
                  <span className="text-[9px] text-slate-400 font-bold">លុប</span>
                </div>
                <div className="mt-1.5 font-bold text-[11px] text-slate-600 dark:text-slate-300">
                  ជ័រលុប
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Passage Word Canvas */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                  {activePassage?.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'km' 
                    ? 'ចុចលើពាក្យដើម្បីដាក់កំហុសតាមប៊ិចដែលបានរើស • ចុច២ដងកំណត់ពាក្យដែលសិស្សអានដល់' 
                    : 'Click word to tag error • Double-click to set last read word'}
                </p>
              </div>

              {lastReadWordIndex !== null && (
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>អានដល់ពាក្យទី #{lastReadWordIndex + 1} ({effectiveWordsAttempted}/{passageWords.length})</span>
                </div>
              )}
            </div>

            {/* Word Tokens Grid */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 select-none max-h-[380px] overflow-y-auto">
              <div className="flex flex-wrap gap-2 text-base sm:text-lg leading-relaxed font-sans">
                {passageWords.map((word, idx) => {
                  const markedError = markedWordErrors.get(idx);
                  const isError = !!markedError;
                  const isLastRead = lastReadWordIndex === idx;
                  const isPastLastRead = lastReadWordIndex !== null && idx > lastReadWordIndex;

                  const catConfig = isError 
                    ? KHMER_ERROR_CATEGORIES.find(c => c.type === markedError.errorType) 
                    : null;

                  return (
                    <span
                      key={idx}
                      onClick={() => handleWordClick(idx, word)}
                      onDoubleClick={() => handleMarkLastRead(idx)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-xl transition-all cursor-pointer relative group ${
                        isError
                          ? `${catConfig?.colorClass || 'bg-rose-500 text-white'} font-black shadow-xs scale-105`
                          : isLastRead
                          ? 'bg-emerald-600 text-white font-black ring-2 ring-emerald-400 shadow-xs'
                          : isPastLastRead
                          ? 'opacity-35 text-slate-400 dark:text-slate-600 bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-slate-200/80 dark:border-slate-700/80'
                      }`}
                      title={`#${idx + 1} (${word}) • ចុចដើម្បីដាក់/ដកកំហុស • ចុច២ដងកំណត់ដល់ទី`}
                    >
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mr-1 select-none">
                        {idx + 1}
                      </span>
                      <span>{word}</span>

                      {isError && (
                        <span className="text-[9px] bg-black/30 px-1 rounded ml-1 font-bold">
                          {catConfig?.shortLabelKm}
                        </span>
                      )}
                      {isLastRead && (
                        <span className="text-[9px] bg-white text-emerald-700 px-1 rounded ml-1 font-bold">
                          ដល់ទី
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quick Live Oral Tally Counter Pads */}
            <div className="bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'km' ? 'បន្ទះចុចរាប់ចំណុចខ្សោយរហ័ស (សម្រាប់គ្រូកាន់សៀវភៅ ឬតេស្ដផ្ទាល់មាត់)' : 'Oral Quick Tally Pads'}</span>
                </span>

                <button
                  onClick={() => {
                    setMarkedWordErrors(new Map());
                    setTallyAdjustments({
                      misread: 0,
                      omission: 0,
                      repetition: 0,
                      addition: 0
                    });
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  {language === 'km' ? 'សម្អាតកំហុសទាំងអស់' : 'Clear All Errors'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {KHMER_ERROR_CATEGORIES.map(cat => {
                  const count = combinedErrorBreakdown[cat.type] || 0;
                  return (
                    <div 
                      key={cat.type}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold truncate text-slate-700 dark:text-slate-300">
                          {cat.shortLabelKm}
                        </span>
                        <span className="font-black text-xs px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between space-x-1">
                        <button
                          onClick={() => handleAdjustTally(cat.type, -1)}
                          disabled={count === 0}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAdjustTally(cat.type, 1)}
                          className="flex-1 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs hover:bg-blue-100 cursor-pointer"
                        >
                          +១
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Word Adjustment Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-600 dark:text-slate-400">ពាក្យអានដល់៖</span>
                <input
                  type="number"
                  min={0}
                  max={passageWords.length}
                  value={effectiveWordsAttempted}
                  onChange={(e) => setManualWordsAttempted(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1 text-center font-black text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => {
                    setManualWordsAttempted(passageWords.length);
                    setLastReadWordIndex(passageWords.length - 1);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  {language === 'km' ? 'អានចប់ទាំងអស់' : 'Mark All Read'}
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                ចុច ២ដងលើពាក្យណាមួយដើម្បីកំណត់កន្លែងឈប់
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timer, Scorecard, Predictive Diagnostics & Gradebook Sync (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1-Minute Timer Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  {language === 'km' ? 'នាឡិកាចាប់ពេល (Timer)' : 'Reading Timer'}
                </h3>
              </div>

              {/* Presets */}
              <select
                disabled={isReadingRunning}
                value={readingTimerLimit}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setReadingTimerLimit(val);
                  setReadingRemainingSeconds(val);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
              >
                <option value={30}>៣០ វិនាទី (30s)</option>
                <option value={60}>១ នាទី (60s - ស្តង់ដារក្រសួង)</option>
                <option value={90}>១ នាទីកន្លះ (90s)</option>
                <option value={120}>២ នាទី (120s)</option>
                <option value={180}>៣ នាទី (180s)</option>
              </select>
            </div>

            {/* Big Digital Clock */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="font-mono font-black text-5xl sm:text-6xl tracking-tight text-slate-900 dark:text-white flex items-center">
                <span>{Math.floor(readingRemainingSeconds / 60).toString().padStart(2, '0')}</span>
                <span className="animate-pulse text-blue-500 mx-1">:</span>
                <span className={readingRemainingSeconds <= 10 && readingRemainingSeconds > 0 ? 'text-rose-500 animate-bounce' : ''}>
                  {(readingRemainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>ប្រើពេល៖ {readingElapsedSeconds} វិនាទី</span>
                <span>•</span>
                <span>កំណត់៖ {readingTimerLimit} វិនាទី</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    readingRemainingSeconds <= 10 ? 'bg-rose-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${(readingRemainingSeconds / readingTimerLimit) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer Controls */}
            <div className="grid grid-cols-2 gap-2">
              {!isReadingRunning ? (
                <button
                  onClick={startReadingTimer}
                  className="col-span-2 flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{language === 'km' ? 'ចាប់ផ្តើមវាស់នាទីអាន' : 'Start Timer'}</span>
                </button>
              ) : (
                <button
                  onClick={pauseReadingTimer}
                  className="flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>{language === 'km' ? 'ផ្អាកសិន' : 'Pause'}</span>
                </button>
              )}

              <button
                onClick={finishReadingExamEarly}
                disabled={!isReadingRunning && !readingExamFinished}
                className="flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'km' ? 'សិស្សអានចប់' : 'Finish Test'}</span>
              </button>

              <button
                onClick={resetReadingSession}
                className="flex items-center justify-center space-x-2 py-3 rounded-xl font-heading font-black text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
              </button>
            </div>
          </div>

          {/* Performance KPIs & Live Score Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  {language === 'km' ? 'លទ្ធផល & ពិន្ទុសមត្ថភាព' : 'Fluency Result'}
                </h3>
              </div>

              <span className="text-[11px] font-bold text-slate-500">
                គោលដៅ៖ ≥ {gradeBenchmark.targetWpm} WPM
              </span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'ពាក្យត្រូវ/នាទី (WCPM)' : 'WCPM Rate'}
                </div>
                <div className="font-heading font-black text-3xl text-blue-600 dark:text-blue-400 mt-0.5">
                  {readingMetrics.wcpm}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ត្រូវ {readingMetrics.correctWords} / {effectiveWordsAttempted} ពាក្យ
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'ភាពសុក្រឹត / ត្រូវ' : 'Accuracy'}
                </div>
                <div className="font-heading font-black text-3xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {readingMetrics.accuracy}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  កំហុស {totalErrors} ពាក្យ
                </div>
              </div>
            </div>

            {/* MoEYS Benchmark Level Pill */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {language === 'km' ? 'កម្រិតសមត្ថភាពក្រសួង៖' : 'MoEYS Level:'}
              </span>
              <span
                className="font-heading font-black text-xs px-3 py-1 rounded-full text-white shadow-xs"
                style={{ backgroundColor: readingMetrics.color }}
              >
                {language === 'km' ? readingMetrics.levelKm : readingMetrics.levelEn}
              </span>
            </div>

            {/* Converted 10-Point Score for Gradebook */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-900 text-center space-y-1">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                {language === 'km' ? 'ពិន្ទុបំលែងលើ ១០ (សម្រាប់តារាងពិន្ទុ)' : 'Converted Score out of 10'}
              </div>
              <div className="font-heading font-black text-4xl text-indigo-700 dark:text-indigo-300">
                {readingMetrics.score10.toFixed(1)} <span className="text-lg font-bold text-slate-400">/ ១០</span>
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                {language === 'km' ? 'គណនាផ្អែកលើ WCPM, ភាពសុក្រឹត និងស្តង់ដារថ្នាក់ទី ' + gradeLevel : 'Aligned with MoEYS primary curriculum'}
              </div>
            </div>
          </div>

          {/* Predictive & Diagnostic Analysis Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-900/60 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                {language === 'km' ? 'ការទាយទុក & វិភាគចំណុចខ្សោយ' : 'Diagnostic Analysis'}
              </h3>
            </div>

            {/* Dominant Weakness Highlight */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
              <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>ចំណុចខ្សោយចម្បង៖</span>
                {diagnosticReport.weaknessPercentage > 0 && (
                  <span className="font-black px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-[10px]">
                    {diagnosticReport.weaknessPercentage}% នៃកំហុស
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {diagnosticReport.primaryWeaknessKm}
              </div>
            </div>

            {/* Error Breakdown Distribution Bars */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                ការបែងចែកកំហុសតាមប្រភេទ៖
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {KHMER_ERROR_CATEGORIES.map(cat => {
                  const count = combinedErrorBreakdown[cat.type] || 0;
                  return (
                    <div 
                      key={cat.type} 
                      className={`p-2 rounded-xl border flex items-center justify-between ${cat.badgeClass}`}
                    >
                      <span className="truncate font-bold text-[11px]">{cat.shortLabelKm}</span>
                      <span className="font-black text-xs px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 shadow-2xs">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Predictive Indicators: Grade Equivalence & Risk */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-500">កម្រិតសមមូល៖</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                  {diagnosticReport.predictedGradeEquivalent}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-500">ហានិភ័យយល់ន័យ៖</div>
                <div className={`font-bold text-xs mt-0.5 ${
                  diagnosticReport.comprehensionBarrierRisk === 'ទាប'
                    ? 'text-emerald-600'
                    : diagnosticReport.comprehensionBarrierRisk === 'មធ្យម'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}>
                  {diagnosticReport.comprehensionBarrierRisk}
                </div>
              </div>
            </div>

            {/* Pedagogical Remedial Advice */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>វិធីសាស្ត្រគរុកោសល្យជួយសិស្ស៖</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs leading-relaxed border border-slate-200 dark:border-slate-700 space-y-1">
                {diagnosticReport.remedialAdviceKm.map((advice, i) => (
                  <p key={i} className="flex items-start space-x-1.5">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{advice}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* MoEYS Gradebook Sync Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Save className="w-4 h-4 text-indigo-600" />
              <span>{language === 'km' ? 'បញ្ចូលពិន្ទុក្នុងតារាងពិន្ទុក្រសួង' : 'Sync to MoEYS Gradebook'}</span>
            </h3>

            {/* Target Component Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ជួរឈរមុខវិជ្ជាគោលដៅ៖' : 'Target Component:'}
              </label>
              <select
                value={readingTargetComponent}
                onChange={(e: any) => setReadingTargetComponent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="khmerReading">ភាសាខ្មែរ ➔ ការអាន (khmerReading - ២៥%)</option>
                <option value="quizzes">ភាសាខ្មែរ ➔ កិច្ចការ/តេស្តប្រចាំខែ (quizzes)</option>
                <option value="rawScore">ភាសាខ្មែរ ➔ ពិន្ទុសរុបប្រចាំខែ (rawScore)</option>
              </select>
            </div>

            {/* Official Remark Preview */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-500 mb-0.5">ការកត់សម្គាល់ក្នុងបញ្ជីពិន្ទុ៖</div>
              <div>{diagnosticReport.moeysOfficialRemark}</div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveReadingToGradebook}
              disabled={effectiveWordsAttempted === 0}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-heading font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {language === 'km' 
                  ? `💾 បញ្ចូលពិន្ទុ ${readingMetrics.score10.toFixed(1)} ទៅក្នុងតារាងពិន្ទុ` 
                  : `Save Score ${readingMetrics.score10.toFixed(1)} to Gradebook`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STUDENT READING HISTORY & PROGRESSION TABLE */}
      {/* ========================================================================= */}
      {studentReadingHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>
                {language === 'km' 
                  ? `ប្រវត្តិតេស្តល្បឿនអំណានរបស់សិស្ស «${currentStudent?.name}» (${studentReadingHistory.length} លើក)` 
                  : `Reading Fluency History for ${currentStudent?.name}`}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-heading font-black border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">កាលបរិច្ឆេទ</th>
                  <th className="py-2.5 px-3">អត្ថបទ</th>
                  <th className="py-2.5 px-3 text-center">រយៈពេល</th>
                  <th className="py-2.5 px-3 text-center">WCPM</th>
                  <th className="py-2.5 px-3 text-center">ភាពត្រឹមត្រូវ</th>
                  <th className="py-2.5 px-3 text-center">កំហុស</th>
                  <th className="py-2.5 px-3">ចំណុចខ្សោយចម្បង</th>
                  <th className="py-2.5 px-3 text-center">ពិន្ទុ/១០</th>
                  <th className="py-2.5 px-3 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {studentReadingHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {new Date(rec.timestamp).toLocaleDateString('km-KH')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {rec.passageTitle || 'អត្ថបទអំណាន'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {rec.durationSeconds}s
                    </td>
                    <td className="py-2.5 px-3 text-center font-heading font-black text-blue-600 dark:text-blue-400">
                      {rec.wordsPerMinute} WPM
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                      {rec.accuracyPercentage}%
                    </td>
                    <td className="py-2.5 px-3 text-center text-rose-600 font-bold">
                      {rec.errorCount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {rec.diagnosedWeakness || 'គ្មាន'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-heading font-black text-indigo-600 dark:text-indigo-400">
                      {rec.calculatedScore10.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => deleteFluencyRecord(rec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="លុបកំណត់ត្រា"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: OFFICIAL PRINTABLE EVALUATION SLIP */}
      {/* ========================================================================= */}
      {isSlipModalOpen && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                  ប័ណ្ណវាយតម្លៃល្បឿនអាន & វិភាគចំណុចខ្សោយភាសាខ្មែរ
                </h3>
              </div>
              <button
                onClick={() => setIsSlipModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Container */}
            <div 
              id="khmer-reading-diagnostic-slip"
              className="p-6 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl space-y-5"
            >
              {/* MoEYS Official Header */}
              <div className="text-center space-y-1">
                <div className="font-heading font-bold text-xs tracking-wider uppercase">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </div>
                <div className="font-heading text-xs">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </div>
                <div className="w-16 h-0.5 bg-slate-900 mx-auto mt-1" />
                <div className="font-heading font-black text-base text-slate-900 mt-2">
                  ប័ណ្ណវាយតម្លៃល្បឿនអាន និងវិភាគចំណុចខ្សោយភាសាខ្មែរ
                </div>
                <div className="text-[11px] text-slate-600">
                  (Khmer Reading Speed & Fluency Diagnostic Slip - MoEYS Standard)
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-300 py-3">
                <div>
                  <p><strong>ឈ្មោះសិស្ស៖</strong> {currentStudent.name}</p>
                  <p><strong>ភេទ៖</strong> {currentStudent.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</p>
                  <p><strong>អត្តលេខ៖</strong> {currentStudent.studentId || currentStudent.id}</p>
                </div>
                <div>
                  <p><strong>ថ្នាក់រៀន៖</strong> {activeClass?.nameKm}</p>
                  <p><strong>កាលបរិច្ឆេទ៖</strong> {new Date().toLocaleDateString('km-KH')}</p>
                  <p><strong>វគ្គវាយតម្លៃ៖</strong> {periods.find(p => p.id === targetPeriodId)?.nameKm || targetPeriodId}</p>
                </div>
              </div>

              {/* Assessment Metrics Summary */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm border-b border-slate-200 pb-1">
                  ១. លទ្ធផលល្បឿនអាន និងភាពត្រឹមត្រូវ (អត្ថបទ៖ «{activePassage?.title}»)
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-500">រយៈពេល</div>
                    <div className="font-black text-sm">{readingElapsedSeconds || readingTimerLimit} វិនាទី</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-500">ពាក្យអានសរុប</div>
                    <div className="font-black text-sm">{effectiveWordsAttempted} ពាក្យ</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-blue-50">
                    <div className="text-[10px] text-blue-700">WCPM (ពាក្យត្រូវ/នាទី)</div>
                    <div className="font-black text-base text-blue-700">{readingMetrics.wcpm}</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-emerald-50">
                    <div className="text-[10px] text-emerald-700">ភាពសុក្រឹត</div>
                    <div className="font-black text-base text-emerald-700">{readingMetrics.accuracy}%</div>
                  </div>
                </div>
              </div>

              {/* Error Diagnostic Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm border-b border-slate-200 pb-1">
                  ២. សម្គាល់ចំណុចខ្សោយនៃការអាន (កំហុសសរុប {totalErrors} ពាក្យ)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {KHMER_ERROR_CATEGORIES.map(cat => (
                    <div key={cat.type} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between">
                      <span className="text-[11px]">{cat.shortLabelKm}</span>
                      <span className="font-bold">{combinedErrorBreakdown[cat.type]} ពាក្យ</span>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <strong>ចំណុចខ្សោយចម្បង៖</strong> {diagnosticReport.primaryWeaknessKm}
                </div>
              </div>

              {/* Evaluation & Score */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm border-b border-slate-200 pb-1">
                  ៣. ការវាយតម្លៃសមត្ថភាព និងពិន្ទុ
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-300 rounded-lg">
                  <div>
                    <p><strong>កម្រិតសមត្ថភាពក្រសួង៖</strong> {diagnosticReport.predictedLevelKm}</p>
                    <p><strong>កម្រិតសមមូល៖</strong> {diagnosticReport.predictedGradeEquivalent}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">ពិន្ទុលើ ១០</div>
                    <div className="font-black text-2xl text-indigo-700">
                      {readingMetrics.score10.toFixed(1)} / ១០
                    </div>
                  </div>
                </div>
              </div>

              {/* Remedial Advice */}
              <div className="space-y-1 text-xs">
                <div className="font-bold">៤. អនុសាសន៍គរុកោសល្យ និងវិធីសាស្ត្រជួយសិស្ស៖</div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px]">
                  {diagnosticReport.remedialAdviceKm.map((ad, idx) => (
                    <p key={idx}>• {ad}</p>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-xs text-center">
                <div>
                  <p>មតិយោបល់មាតាបិតា / អាណាព្យាបាល</p>
                  <div className="h-16" />
                  <p>................................................</p>
                </div>
                <div>
                  <p>គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-16" />
                  <p className="font-bold">{activeClass?.teacherName || 'លោកគ្រូ / អ្នកគ្រូ'}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <PrintToPdfButton
                targetElementId="khmer-reading-diagnostic-slip"
                documentTitle={`Reading_Slip_${currentStudent.name}`}
                labelKm="បោះពុម្ព ឬទាញយក PDF"
                labelEn="Print / Export PDF"
                variant="primary"
              />
              <button
                onClick={() => setIsSlipModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CREATE / EDIT PASSAGE */}
      {/* ========================================================================= */}
      {isPassageModalOpen && editingPassage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>{editingPassage.id ? 'កែសម្រួលអត្ថបទអំណាន' : 'បន្ថែមអត្ថបទអំណានថ្មី'}</span>
              </h3>
              <button
                onClick={() => setIsPassageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ចំណងជើងអត្ថបទ *</label>
                <input
                  type="text"
                  value={editingPassage.title || ''}
                  onChange={(e) => setEditingPassage(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="ឧ. ដំណើរកម្សាន្តនៅសួនសត្វ"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">កម្រិតថ្នាក់</label>
                  <select
                    value={editingPassage.gradeLevel || 1}
                    onChange={(e) => setEditingPassage(prev => ({ ...prev, gradeLevel: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">គោលដៅ WPM (ពាក្យ/នាទី)</label>
                  <input
                    type="number"
                    value={editingPassage.targetWpm || 50}
                    onChange={(e) => setEditingPassage(prev => ({ ...prev, targetWpm: parseInt(e.target.value) || 50 }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ប្រភេទអត្ថបទ</label>
                <input
                  type="text"
                  value={editingPassage.category || ''}
                  onChange={(e) => setEditingPassage(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="ឧ. រឿងខ្លី, វិទ្យាសាស្ត្រ, សីលធម៌..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ខ្លឹមសារអត្ថបទ * (ដកឃ្លារវាងពាក្យដើម្បីរាប់ពាក្យបានត្រឹមត្រូវ)
                </label>
                <textarea
                  rows={6}
                  value={editingPassage.content || ''}
                  onChange={(e) => setEditingPassage(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed font-sans"
                  placeholder="បញ្ចូលអត្ថបទអំណានភាសាខ្មែរនៅទីនេះ..."
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  ពាក្យប៉ាន់ស្មាន៖ {tokenizeKhmerText(editingPassage.content || '').length} ពាក្យ
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {editingPassage.id && editingPassage.isCustom && (
                <button
                  onClick={() => {
                    if (confirm('តើលោកគ្រូអ្នកគ្រូពិតជាចង់លុបអត្ថបទនេះមែនទេ?')) {
                      deleteReadingPassage(editingPassage.id!);
                      setIsPassageModalOpen(false);
                      showToast('បានលុបអត្ថបទ', 'info');
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  លុបអត្ថបទ
                </button>
              )}
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  onClick={() => setIsPassageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  onClick={handleSavePassage}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  រក្សាទុក
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
