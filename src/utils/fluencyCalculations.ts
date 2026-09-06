import { MathOperation, KhmerReadingErrorType, ReadingErrorBreakdown } from '../types';

export interface GeneratedMathQuestion {
  id: string;
  num1: number;
  num2: number;
  operation: '+' | '-' | '×' | '÷';
  questionText: string;
  correctAnswer: number;
}

export interface ReadingBenchmark {
  grade: number;
  targetWpm: number;
  minWpm: number;
  advancedWpm: number;
}

export const MOEYS_READING_BENCHMARKS: Record<number, ReadingBenchmark> = {
  1: { grade: 1, targetWpm: 35, minWpm: 20, advancedWpm: 45 },
  2: { grade: 2, targetWpm: 50, minWpm: 35, advancedWpm: 65 },
  3: { grade: 3, targetWpm: 70, minWpm: 50, advancedWpm: 85 },
  4: { grade: 4, targetWpm: 85, minWpm: 65, advancedWpm: 105 },
  5: { grade: 5, targetWpm: 100, minWpm: 80, advancedWpm: 120 },
  6: { grade: 6, targetWpm: 115, minWpm: 95, advancedWpm: 135 },
};

/**
 * Diagnostic analysis report for Khmer reading speed & fluency
 */
export interface KhmerReadingDiagnosticReport {
  primaryWeaknessKm: string;
  primaryWeaknessType: KhmerReadingErrorType | 'none';
  weaknessPercentage: number;
  errorDistribution: ReadingErrorBreakdown;
  predictedLevel: 'advanced' | 'proficient' | 'basic' | 'below_basic';
  predictedLevelKm: string;
  predictedGradeEquivalent: string;
  comprehensionBarrierRisk: 'ទាប' | 'មធ្យម' | 'ខ្ពស់';
  remedialAdviceKm: string[];
  moeysOfficialRemark: string;
}

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates an age-appropriate primary school math question based on operation and digit count
 */
export function generateMathQuestion(
  opChoice: MathOperation,
  digits: 1 | 2 | 3 | 4,
  customMax?: number
): GeneratedMathQuestion {
  // Determine actual operation for this question
  let op: '+' | '-' | '×' | '÷';
  if (opChoice === 'mixed') {
    const ops: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];
    op = ops[Math.floor(Math.random() * ops.length)];
  } else if (opChoice === 'add') {
    op = '+';
  } else if (opChoice === 'subtract') {
    op = '-';
  } else if (opChoice === 'multiply') {
    op = '×';
  } else {
    op = '÷';
  }

  let num1 = 0;
  let num2 = 0;
  let correctAnswer = 0;

  // Handle custom range (e.g. up to 20 for Grade 1 & 2)
  if (customMax && customMax <= 20) {
    if (op === '+') {
      num1 = randomInt(1, 10);
      num2 = randomInt(1, 10);
      correctAnswer = num1 + num2;
    } else if (op === '-') {
      num1 = randomInt(5, 20);
      num2 = randomInt(1, num1);
      correctAnswer = num1 - num2;
    } else if (op === '×') {
      num1 = randomInt(1, 5);
      num2 = randomInt(1, 4);
      correctAnswer = num1 * num2;
    } else {
      const quotient = randomInt(1, 5);
      num2 = randomInt(1, 4);
      num1 = quotient * num2;
      correctAnswer = quotient;
    }
    return {
      id: `q_${Date.now()}_${Math.random().toString().slice(2, 6)}`,
      num1,
      num2,
      operation: op,
      questionText: `${num1} ${op} ${num2}`,
      correctAnswer
    };
  }

  // Handle digit ranges
  let minVal = 1;
  let maxVal = 9;

  if (digits === 1) {
    minVal = 1;
    maxVal = 9;
  } else if (digits === 2) {
    minVal = 10;
    maxVal = 99;
  } else if (digits === 3) {
    minVal = 100;
    maxVal = 999;
  } else {
    minVal = 1000;
    maxVal = 9999;
  }

  if (op === '+') {
    num1 = randomInt(minVal, maxVal);
    num2 = randomInt(minVal, maxVal);
    correctAnswer = num1 + num2;
  } else if (op === '-') {
    const a = randomInt(minVal, maxVal);
    const b = randomInt(minVal, maxVal);
    num1 = Math.max(a, b);
    num2 = Math.min(a, b);
    correctAnswer = num1 - num2;
  } else if (op === '×') {
    if (digits === 1) {
      num1 = randomInt(2, 9);
      num2 = randomInt(2, 9);
    } else if (digits === 2) {
      // 2-digit times 1-digit or simple 2-digit
      num1 = randomInt(11, 49);
      num2 = randomInt(2, 9);
    } else {
      num1 = randomInt(50, 199);
      num2 = randomInt(2, 9);
    }
    correctAnswer = num1 * num2;
  } else {
    // Division: produce clean integer quotient
    let divisor = 2;
    let quotient = 2;
    if (digits === 1) {
      divisor = randomInt(2, 9);
      quotient = randomInt(1, 9);
    } else if (digits === 2) {
      divisor = randomInt(2, 9);
      quotient = randomInt(10, 40);
    } else {
      divisor = randomInt(2, 12);
      quotient = randomInt(20, 99);
    }
    num1 = divisor * quotient;
    num2 = divisor;
    correctAnswer = quotient;
  }

  return {
    id: `q_${Date.now()}_${Math.random().toString().slice(2, 6)}`,
    num1,
    num2,
    operation: op,
    questionText: `${num1} ${op} ${num2}`,
    correctAnswer
  };
}

/**
 * Splits Khmer text into words / syllables by whitespace and punctuation
 */
export function tokenizeKhmerText(text: string): string[] {
  if (!text) return [];
  // Split by whitespace, punctuation, newlines, and MoEYS delimiters
  const words = text
    .replace(/[។៕៖ៗ]/g, ' $& ')
    .trim()
    .split(/\s+/)
    .filter(w => w.trim().length > 0);
  return words;
}

/**
 * Calculates Reading Fluency WCPM (Words Correct Per Minute) with MoEYS grade level awareness
 */
export function calculateWCPM(
  wordsAttempted: number,
  errors: number,
  elapsedSeconds: number,
  gradeLevel: number = 1
): {
  correctWords: number;
  wcpm: number;
  accuracy: number;
  score10: number;
  levelKm: string;
  levelEn: string;
  color: string;
  benchmark: ReadingBenchmark;
} {
  const safeSeconds = Math.max(1, elapsedSeconds);
  const correctWords = Math.max(0, wordsAttempted - errors);
  const wcpm = Math.round((correctWords / safeSeconds) * 60);
  const accuracy = wordsAttempted > 0 ? Math.round((correctWords / wordsAttempted) * 100) : 0;

  const benchmark = MOEYS_READING_BENCHMARKS[gradeLevel] || MOEYS_READING_BENCHMARKS[1];

  // Grade-aware MoEYS Primary Fluency Benchmarks
  let levelKm = 'ក្រោមមូលដ្ឋាន (ត្រូវការជំនួយ)';
  let levelEn = 'Below Basic (Needs Support)';
  let color = '#dc2626'; // Red

  if (accuracy >= 94 && wcpm >= benchmark.targetWpm) {
    levelKm = 'ស្ទាត់ជំនាញ (កម្រិតខ្ពស់)';
    levelEn = 'Advanced / Fluent';
    color = '#16a34a'; // Green
  } else if (accuracy >= 88 && wcpm >= benchmark.minWpm) {
    levelKm = 'ល្អប្រសើរ (សមរម្យ)';
    levelEn = 'Proficient';
    color = '#2563eb'; // Blue
  } else if (accuracy >= 75 || wcpm >= Math.round(benchmark.minWpm * 0.7)) {
    levelKm = 'មូលដ្ឋាន (ល្អបង្គួរ)';
    levelEn = 'Basic / Developing';
    color = '#d97706'; // Amber
  }

  // Convert to 10-point scale: 65% based on accuracy, 35% on speed rate relative to grade benchmark
  let score10 = 0;
  if (wordsAttempted > 0) {
    const accuracyFactor = (accuracy / 100) * 6.5;
    const speedRatio = Math.min(1.2, wcpm / benchmark.targetWpm);
    const speedFactor = speedRatio * 3.5;
    score10 = Math.min(10, Math.max(0, Math.round((accuracyFactor + speedFactor) * 10) / 10));
  }

  return {
    correctWords,
    wcpm,
    accuracy,
    score10,
    levelKm,
    levelEn,
    color,
    benchmark
  };
}

/**
 * Diagnoses Khmer Reading weaknesses, predicts competency level, and generates pedagogical advice
 */
export function diagnoseKhmerReadingFluency(
  wcpm: number,
  accuracy: number,
  gradeLevel: number,
  breakdown: ReadingErrorBreakdown,
  passageTitle?: string
): KhmerReadingDiagnosticReport {
  const benchmark = MOEYS_READING_BENCHMARKS[gradeLevel] || MOEYS_READING_BENCHMARKS[1];
  const totalErrors = 
    breakdown.misread + 
    breakdown.omission + 
    breakdown.repetition + 
    breakdown.addition;

  // Find dominant error type
  const errorMap: { type: KhmerReadingErrorType; count: number; nameKm: string }[] = [
    { type: 'misread', count: breakdown.misread, nameKm: 'ការអានខុស (អានខុសពាក្យ/បញ្ចេញសំឡេងខុស)' },
    { type: 'omission', count: breakdown.omission, nameKm: 'ការអានរំលង (រំលងពាក្យ/រំលងជួរ)' },
    { type: 'repetition', count: breakdown.repetition, nameKm: 'ការអានស្ទួន (អានត្រឡប់ដដែលៗ)' },
    { type: 'addition', count: breakdown.addition, nameKm: 'ការអានលើស (បន្ថែមពាក្យដែលគ្មានក្នុងអត្ថបទ)' },
  ];

  errorMap.sort((a, b) => b.count - a.count);
  const highest = errorMap[0];

  let primaryWeaknessKm = 'គ្មានកំហុសគួរឱ្យកត់សម្គាល់ (អានបានល្អណាស់)';
  let primaryWeaknessType: KhmerReadingErrorType | 'none' = 'none';
  let weaknessPercentage = 0;

  if (totalErrors > 0 && highest.count > 0) {
    primaryWeaknessKm = highest.nameKm;
    primaryWeaknessType = highest.type;
    weaknessPercentage = Math.round((highest.count / totalErrors) * 100);
  }

  // Predicted MoEYS Level & Grade Equivalence
  let predictedLevel: 'advanced' | 'proficient' | 'basic' | 'below_basic' = 'below_basic';
  let predictedLevelKm = 'កម្រិតក្រោមមូលដ្ឋាន (ត្រូវការជួយបំប៉នបន្ទាន់)';
  let predictedGradeEquivalent = `ក្រោមថ្នាក់ទី ${gradeLevel}`;
  let comprehensionBarrierRisk: 'ទាប' | 'មធ្យម' | 'ខ្ពស់' = 'ខ្ពស់';

  if (wcpm >= benchmark.targetWpm && accuracy >= 94) {
    predictedLevel = 'advanced';
    predictedLevelKm = 'កម្រិតស្ទាត់ជំនាញ (ល្អប្រសើរណាស់)';
    predictedGradeEquivalent = `លើស ឬស្មើថ្នាក់ទី ${gradeLevel}`;
    comprehensionBarrierRisk = 'ទាប';
  } else if (wcpm >= benchmark.minWpm && accuracy >= 88) {
    predictedLevel = 'proficient';
    predictedLevelKm = 'កម្រិតសមរម្យ (តាមស្តង់ដារក្រសួង)';
    predictedGradeEquivalent = `ស្មើនឹងថ្នាក់ទី ${gradeLevel}`;
    comprehensionBarrierRisk = 'ទាប';
  } else if (accuracy >= 75 || wcpm >= Math.round(benchmark.minWpm * 0.7)) {
    predictedLevel = 'basic';
    predictedLevelKm = 'កម្រិតមូលដ្ឋាន (ជិតដល់គោលដៅ)';
    predictedGradeEquivalent = gradeLevel > 1 ? `ប្រហាក់ប្រហែលថ្នាក់ទី ${gradeLevel - 1}` : 'ថ្នាក់ទី ១ (កម្រិតដំបូង)';
    comprehensionBarrierRisk = 'មធ្យម';
  }

  // Actionable Remedial Advice (អនុសាសន៍គរុកោសល្យជាក់ស្តែង)
  const remedialAdviceKm: string[] = [];

  if (primaryWeaknessType === 'misread') {
    remedialAdviceKm.push('ពង្រឹងការផ្គួបផ្សំសំឡេងព្យញ្ជនៈ ស្រៈ និងជើងអក្សរ ដោយផ្តល់លំហាត់បំបែកព្យាង្គ និងបណ្ណពាក្យ (Flashcards)។');
    remedialAdviceKm.push('ណែនាំឱ្យសិស្សសង្កេតមើលរូបរាងពាក្យឱ្យច្បាស់មុននឹងបន្លឺសំឡេង និងអនុវត្តអានពាក្យគូប្រៀបធៀប។');
  } else if (primaryWeaknessType === 'omission') {
    remedialAdviceKm.push('ណែនាំឱ្យសិស្សយកចង្អុលដៃ ឬបន្ទាត់ទ្រាប់ពីក្រោមបន្ទាត់អក្សរពេលកំពុងអាន ដើម្បីកុំឱ្យរំលងពាក្យ ឬរំលងជួរ។');
    remedialAdviceKm.push('អនុវត្តការអានជាគូ (Paired Reading) ឬអានតាមគ្រូ (Echo Reading) ឃ្លាខ្លីៗ។');
  } else if (primaryWeaknessType === 'repetition') {
    remedialAdviceKm.push('ជួយសិស្សឱ្យមានទំនុកចិត្តកុំឱ្យអានពាក្យត្រឡប់ដដែលៗ ដោយឱ្យអានដោយល្បឿនសមរម្យ និងដកដង្ហើមតាមសញ្ញាខណ្ឌ។');
    remedialAdviceKm.push('បង្វឹកការអានដោយរលូន តាមរយៈវិធី «អានដដែលៗ ៣ លើក (Repeated Reading)» លើអត្ថបទខ្លីប្រចាំថ្ងៃ។');
  } else if (primaryWeaknessType === 'addition') {
    remedialAdviceKm.push('ណែនាំសិស្សឱ្យយកចិត្តទុកដាក់លើពាក្យពិតប្រាកដក្នុងអត្ថបទ ចៀសវាងការទាយពាក្យតាមការស្មាន ឬបន្ថែមពាក្យតាមទម្លាប់និយាយ។');
    remedialAdviceKm.push('ឱ្យសិស្សអានយឺតៗច្បាស់ៗមួយៗតាមលំដាប់អក្សរ មុននឹងបង្កើនល្បឿន។');
  } else {
    remedialAdviceKm.push('សិស្សមានមូលដ្ឋានអំណានរឹងមាំ! គួរលើកទឹកចិត្តឱ្យអានសៀវភៅរឿងកុមារប្លែកៗដើម្បីបង្កើនវាក្យសព្ទ និងការយល់ន័យស៊ីជម្រៅ។');
  }

  // Official MoEYS Gradebook Evaluation Note
  const passNote = passageTitle ? ` «${passageTitle}»` : '';
  const errorNote = totalErrors > 0 
    ? `ចំណុចខ្សោយ៖ ${primaryWeaknessKm} (${highest.count}ពាក្យ)`
    : 'អានត្រូវឥតខ្ចោះ';
  const moeysOfficialRemark = `តេស្តល្បឿនអំណាន${passNote}៖ ${wcpm} ពាក្យ/នាទី (ត្រូវ ${accuracy}%), ${errorNote} • កម្រិត៖ ${predictedLevelKm}`;

  return {
    primaryWeaknessKm,
    primaryWeaknessType,
    weaknessPercentage,
    errorDistribution: breakdown,
    predictedLevel,
    predictedLevelKm,
    predictedGradeEquivalent,
    comprehensionBarrierRisk,
    remedialAdviceKm,
    moeysOfficialRemark
  };
}

/**
 * Calculates Mental Math score out of 10
 */
export function calculateMathSpeedScore(
  attempted: number,
  errors: number,
  elapsedSeconds: number
): {
  correctCount: number;
  accuracy: number;
  questionsPerMin: number;
  score10: number;
  levelKm: string;
  color: string;
} {
  const safeSeconds = Math.max(1, elapsedSeconds);
  const correctCount = Math.max(0, attempted - errors);
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
  const questionsPerMin = Math.round((correctCount / safeSeconds) * 60);

  let levelKm = 'ត្រូវការជំនួយ';
  let color = '#dc2626';

  if (accuracy >= 90 && correctCount >= 10) {
    levelKm = 'ស្ទាត់ជំនាញ';
    color = '#16a34a';
  } else if (accuracy >= 80 && correctCount >= 7) {
    levelKm = 'ល្អប្រសើរ';
    color = '#2563eb';
  } else if (accuracy >= 60 && correctCount >= 5) {
    levelKm = 'មធ្យម';
    color = '#d97706';
  }

  // Score out of 10: based on correct count and accuracy
  let score10 = 0;
  if (attempted > 0) {
    // Scale: 10+ correct with high accuracy = 9.0-10.0
    const raw = (correctCount / Math.max(10, attempted)) * 10;
    const accMultiplier = accuracy / 100;
    score10 = Math.min(10, Math.max(0, Math.round(raw * accMultiplier * 10) / 10));
  }

  return {
    correctCount,
    accuracy,
    questionsPerMin,
    score10,
    levelKm,
    color
  };
}
