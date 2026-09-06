import { Student, Subject, AssessmentWeightConfig, GradeScaleThreshold, StudentYearlySummary, AssessmentPeriod, CompetencyPillarsWeight } from '../types';

export const DEFAULT_COMPETENCY_WEIGHTS: CompetencyPillarsWeight = {
  knowledge: 80, // វិជ្ជាសម្បទា (80%)
  skill: 10,     // បំណិនសម្បទា (10%)
  attitude: 10,  // ចរិយាសម្បទា (10%)
};

/**
 * Calculates a single subject score from assessment components or subcomponents
 */
export function calculateSubjectScore(
  entry: any,
  weights: AssessmentWeightConfig,
  subjectCode?: string
): number {
  if (!entry) return 0;

  // 1. If Khmer 4 sub-skills are populated (អាន, សរសេរ, ស្ដាប់, និយាយ)
  if (
    entry.khmerReading !== undefined ||
    entry.khmerWriting !== undefined ||
    entry.khmerDictation !== undefined ||
    entry.khmerComposition !== undefined ||
    entry.khmerListening !== undefined ||
    entry.khmerSpeaking !== undefined
  ) {
    const r = entry.khmerReading ?? 0;
    const w = entry.khmerWriting ?? ((entry.khmerDictation !== undefined || entry.khmerComposition !== undefined) ? ((entry.khmerDictation ?? 0) + (entry.khmerComposition ?? 0)) / 2 : 0);
    const l = entry.khmerListening ?? 0;
    const s = entry.khmerSpeaking ?? 0;
    return Number(((r + w + l + s) / 4).toFixed(2));
  }

  // 2. If Math 5 sections are populated (ចំនួន, ពិជគណិត, រង្វាស់រង្វាល់, ធរណីមាត្រ, ស្ថិតិ)
  if (
    entry.mathNumbers !== undefined ||
    entry.mathAlgebra !== undefined ||
    entry.mathMeasurement !== undefined ||
    entry.mathGeometry !== undefined ||
    entry.mathStatistics !== undefined
  ) {
    const n = entry.mathNumbers ?? entry.mathAlgebra ?? 0;
    const a = entry.mathAlgebra ?? 0;
    const m = entry.mathMeasurement ?? 0;
    const g = entry.mathGeometry ?? 0;
    const st = entry.mathStatistics ?? 0;
    return Number(((n + a + m + g + st) / 5).toFixed(2));
  }

  // 3. Direct subject score (Science, Social Studies, Morals, PE, Arts, English, etc.)
  if (entry.rawScore !== undefined) {
    return Number(Number(entry.rawScore).toFixed(2));
  }

  // 4. Continuous assessment fallback if ever present
  const totalWeight = weights.homework + weights.quizzes + weights.midterm + weights.finalExam;
  if (totalWeight === 0) return 0;

  const hw = entry.homework ?? 0;
  const qz = entry.quizzes ?? 0;
  const mid = entry.midterm ?? 0;
  const fin = entry.finalExam ?? 0;

  const weightedSum = (hw * weights.homework) + (qz * weights.quizzes) + (mid * weights.midterm) + (fin * weights.finalExam);
  return Number((weightedSum / totalWeight).toFixed(2));
}

/**
 * Calculates a student's Knowledge (វិជ្ជាសម្បទា) unweighted average for a specific period
 */
export function calculatePeriodAverage(
  studentId: string,
  periodId: string,
  subjects: Subject[],
  scoresMatrix: Record<string, Record<string, Record<string, any>>>,
  weights: AssessmentWeightConfig
): {
  average: number;
  totalPoints: number;
  totalCoefficients: number;
  subjectScores: Record<string, number>;
} {
  let totalScore = 0;
  const subjectScores: Record<string, number> = {};

  for (const subj of subjects) {
    const entry = scoresMatrix[studentId]?.[periodId]?.[subj.id];
    let score = 0;

    if (entry) {
      score = calculateSubjectScore(entry, weights, subj.code);
    }

    subjectScores[subj.id] = score;
    totalScore += score;
  }

  const count = subjects.length;
  const average = count > 0 ? Number((totalScore / count).toFixed(2)) : 0;
  return {
    average,
    totalPoints: Number(totalScore.toFixed(2)),
    totalCoefficients: count,
    subjectScores,
  };
}

/**
 * Computes ranks for a list of students in a specific period (Monthly calculation - pure subject average)
 */
export function calculatePeriodRankings(
  students: Student[],
  periodId: string,
  subjects: Subject[],
  scoresMatrix: Record<string, Record<string, Record<string, any>>>,
  weights: AssessmentWeightConfig,
  competencyWeights: CompetencyPillarsWeight = DEFAULT_COMPETENCY_WEIGHTS,
  sortBy: 'total_score' | 'average' | 'student_id' | 'name' = 'total_score'
): Array<{
  student: Student;
  knowledgeScore: number;
  skillScore: number;
  attitudeScore: number;
  average: number;        // Pure Monthly Subject Average (មធ្យមភាគប្រចាំខែ)
  totalPoints: number;    // Total Score (ផលបូកពិន្ទុសរុប)
  rank: number;
  subjectScores: Record<string, number>;
}> {
  const results = students.map(student => {
    const calc = calculatePeriodAverage(student.id, periodId, subjects, scoresMatrix, weights);
    const monthlyAverage = calc.average;

    return {
      student,
      knowledgeScore: calc.average,
      skillScore: student.skillScore ?? 8.5,
      attitudeScore: student.attitudeScore ?? (student.behaviorScore ? Math.min(10, student.behaviorScore * 2) : 9.0),
      average: monthlyAverage,
      totalPoints: calc.totalPoints,
      rank: 0,
      subjectScores: calc.subjectScores,
    };
  });

  // Sort by selected metric (default: totalPoints descending)
  results.sort((a, b) => {
    if (sortBy === 'total_score') {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.average - a.average;
    } else if (sortBy === 'average') {
      if (b.average !== a.average) return b.average - a.average;
      return b.totalPoints - a.totalPoints;
    } else if (sortBy === 'student_id') {
      return a.student.studentId.localeCompare(b.student.studentId, undefined, { numeric: true });
    } else if (sortBy === 'name') {
      return a.student.name.localeCompare(b.student.name, 'km');
    }
    // Default fallback
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.average - a.average;
  });

  // Assign ranks strictly based on total score / average descending rank order
  // When sorting by student_id or name, we still compute their objective academic rank position based on totalPoints/average
  const academicRankMap = new Map<string, number>();
  const scoreSorted = [...results].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.average - a.average;
  });

  let currentRank = 1;
  for (let i = 0; i < scoreSorted.length; i++) {
    if (i > 0 && scoreSorted[i].totalPoints < scoreSorted[i - 1].totalPoints) {
      currentRank = i + 1;
    }
    academicRankMap.set(scoreSorted[i].student.id, currentRank);
  }

  // Populate assigned ranks
  for (const item of results) {
    item.rank = academicRankMap.get(item.student.id) || 1;
  }

  return results;
}

/**
 * Calculates full year consolidated performance for all students in a class
 * strictly using the official Cambodian MoEYS breakdown:
 * - Knowledge (វិជ្ជាសម្បទា) = 80%
 * - Skill (បំណិនសម្បទា) = 10%
 * - Attitude (ចរិយាសម្បទា) = 10%
 */
export function calculateYearlySummaries(
  students: Student[],
  periods: AssessmentPeriod[],
  subjects: Subject[],
  scoresMatrix: Record<string, Record<string, Record<string, any>>>,
  weights: AssessmentWeightConfig,
  gradeScales: GradeScaleThreshold[],
  competencyWeights: CompetencyPillarsWeight = DEFAULT_COMPETENCY_WEIGHTS
): StudentYearlySummary[] {
  const sem1Periods = periods.filter(p => p.semester === 1);
  const sem2Periods = periods.filter(p => p.semester === 2);

  const kWeight = (competencyWeights.knowledge || 80) / 100;
  const sWeight = (competencyWeights.skill || 10) / 100;
  const aWeight = (competencyWeights.attitude || 10) / 100;

  const summaries = students.map(student => {
    // 1. Knowledge Pillar (វិជ្ជាសម្បទា): Average across subject tests in Semester 1
    let sem1KnowledgeSum = 0;
    let sem1Count = 0;
    for (const p of sem1Periods) {
      const calc = calculatePeriodAverage(student.id, p.id, subjects, scoresMatrix, weights);
      sem1KnowledgeSum += calc.average;
      sem1Count++;
    }
    const term1Knowledge = sem1Count > 0 ? Number((sem1KnowledgeSum / sem1Count).toFixed(2)) : 0;

    // 2. Knowledge Pillar (វិជ្ជាសម្បទា): Average across subject tests in Semester 2
    let sem2KnowledgeSum = 0;
    let sem2Count = 0;
    for (const p of sem2Periods) {
      const calc = calculatePeriodAverage(student.id, p.id, subjects, scoresMatrix, weights);
      sem2KnowledgeSum += calc.average;
      sem2Count++;
    }
    const term2Knowledge = sem2Count > 0 ? Number((sem2KnowledgeSum / sem2Count).toFixed(2)) : 0;

    // 3. Skill Pillar (បំណិនសម្បទា) - 10%
    const term1Skill = student.skillScore ?? 8.5;
    const term2Skill = student.skillScore ?? 8.5;
    const yearlySkill = Number(((term1Skill + term2Skill) / 2).toFixed(2));

    // 4. Attitude Pillar (ចរិយាសម្បទា) - 10%
    const term1Attitude = student.attitudeScore ?? (student.behaviorScore ? Math.min(10, student.behaviorScore * 2) : 9.0);
    const term2Attitude = student.attitudeScore ?? (student.behaviorScore ? Math.min(10, student.behaviorScore * 2) : 9.0);
    const yearlyAttitude = Number(((term1Attitude + term2Attitude) / 2).toFixed(2));

    // Consolidated Knowledge across whole year
    const yearlyKnowledge = Number(((term1Knowledge + term2Knowledge) / 2).toFixed(2));

    // Semester 1 Composite Average (មធ្យមភាគឆមាសទី១)
    const term1Average = Number(((term1Knowledge * kWeight) + (term1Skill * sWeight) + (term1Attitude * aWeight)).toFixed(2));

    // Semester 2 Composite Average (មធ្យមភាគឆមាសទី២)
    const term2Average = Number(((term2Knowledge * kWeight) + (term2Skill * sWeight) + (term2Attitude * aWeight)).toFixed(2));

    // Final Whole Year Average (មធ្យមភាគប្រចាំឆ្នាំ): Knowledge 80% + Skill 10% + Attitude 10%
    const yearlyAverage = Number(((yearlyKnowledge * kWeight) + (yearlySkill * sWeight) + (yearlyAttitude * aWeight)).toFixed(2));

    // Grade scale lookup
    const percentage = yearlyAverage * 10;
    const fallbackGrade = { grade: 'F', labelEn: 'Fail', labelKm: 'ធ្លាក់', minPercentage: 0, gpa: 0, color: '#ef4444' };
    const gradeObj = (gradeScales && gradeScales.length > 0)
      ? (gradeScales.find(g => percentage >= g.minPercentage) || gradeScales[gradeScales.length - 1] || fallbackGrade)
      : fallbackGrade;

    // Attendance calculation
    const att = student.attendanceCount || { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 };
    const totalDays = (att.present || 0) + (att.absentExcused || 0) + (att.absentUnexcused || 0);
    const attendanceRate = totalDays > 0 ? Number((((att.present || 0) / totalDays) * 100).toFixed(1)) : 100;

    const passed = yearlyAverage >= 5.0;

    let honorDistinction: 'Honor Roll' | 'High Honors' | 'Highest Honors' | 'None' = 'None';
    let honorDistinctionKm = 'ធម្មតា';

    if (yearlyAverage >= 9.0) {
      honorDistinction = 'Highest Honors';
      honorDistinctionKm = 'សិស្សឆ្នើមលេខ១ (កិត្តិយសកំពូល)';
    } else if (yearlyAverage >= 8.5) {
      honorDistinction = 'High Honors';
      honorDistinctionKm = 'សិស្សពូកែ (កិត្តិយសខ្ពស់)';
    } else if (yearlyAverage >= 7.5) {
      honorDistinction = 'Honor Roll';
      honorDistinctionKm = 'តារាងកិត្តិយស';
    }

    return {
      student,
      term1Knowledge,
      term1Skill,
      term1Attitude,
      term1Average,
      term1Rank: 0,
      term2Knowledge,
      term2Skill,
      term2Attitude,
      term2Average,
      term2Rank: 0,
      yearlyKnowledge,
      yearlySkill,
      yearlyAttitude,
      yearlyAverage,
      yearlyRank: 0,
      letterGrade: gradeObj.grade,
      gradeLabelEn: gradeObj.labelEn,
      gradeLabelKm: gradeObj.labelKm,
      attendanceRate,
      passed,
      honorDistinction,
      honorDistinctionKm,
    };
  });

  // Calculate Term 1 Ranks
  const byTerm1 = [...summaries].sort((a, b) => b.term1Average - a.term1Average);
  byTerm1.forEach((s, idx) => {
    s.term1Rank = idx + 1;
  });

  // Calculate Term 2 Ranks
  const byTerm2 = [...summaries].sort((a, b) => b.term2Average - a.term2Average);
  byTerm2.forEach((s, idx) => {
    s.term2Rank = idx + 1;
  });

  // Calculate Yearly Ranks
  const byYearly = [...summaries].sort((a, b) => b.yearlyAverage - a.yearlyAverage);
  byYearly.forEach((s, idx) => {
    s.yearlyRank = idx + 1;
  });

  return summaries.sort((a, b) => a.yearlyRank - b.yearlyRank);
}

/**
 * Conduct / Morals / Discipline helper options
 * Cambodian standards: ល្អប្រសើរ, ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ
 */
export const CONDUCT_OPTIONS = [
  { value: 'ល្អប្រសើរ', labelKm: 'ល្អប្រសើរ', labelEn: 'Excellent', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'ល្អ', labelKm: 'ល្អ', labelEn: 'Good', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'ល្អបង្គួរ', labelKm: 'ល្អបង្គួរ', labelEn: 'Fairly Good', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  { value: 'មធ្យម', labelKm: 'មធ្យម', labelEn: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'ខ្សោយ', labelKm: 'ខ្សោយ', labelEn: 'Needs Improvement', color: 'text-rose-700 bg-rose-50 border-rose-200' },
] as const;

/**
 * Formats conduct rating cleanly in Khmer or English.
 * Always returns conduct ratings like ល្អ, ល្អបង្គួរ, មធ្យម, ល្អប្រសើរ, ខ្សោយ.
 */
export function formatConductRating(rating?: string, language: 'km' | 'en' = 'km'): string {
  if (!rating) return language === 'km' ? 'ល្អ' : 'Good';

  const mapKm: Record<string, string> = {
    'A': 'ល្អប្រសើរ',
    'B': 'ល្អ',
    'C': 'ល្អបង្គួរ',
    'D': 'មធ្យម',
    'E': 'ខ្សោយ',
    'F': 'ខ្សោយ',
    'ល្អប្រសើរ': 'ល្អប្រសើរ',
    'ល្អ': 'ល្អ',
    'ល្អណាស់': 'ល្អ',
    'ល្អបង្គួរ': 'ល្អបង្គួរ',
    'មធ្យម': 'មធ្យម',
    'ខ្សោយ': 'ខ្សោយ',
  };

  const mapEn: Record<string, string> = {
    'A': 'Excellent',
    'B': 'Good',
    'C': 'Fairly Good',
    'D': 'Medium',
    'E': 'Needs Improvement',
    'F': 'Needs Improvement',
    'ល្អប្រសើរ': 'Excellent',
    'ល្អ': 'Good',
    'ល្អណាស់': 'Very Good',
    'ល្អបង្គួរ': 'Fairly Good',
    'មធ្យម': 'Medium',
    'ខ្សោយ': 'Needs Improvement',
  };

  if (language === 'km') {
    return mapKm[rating] || rating;
  }
  return mapEn[rating] || rating;
}

/**
 * Academic Letter Grade Helper
 * Strictly returns only A, B, C, D, E, or F.
 */
export function getAcademicGrade(avg: number, gradeScales?: GradeScaleThreshold[]): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  if (gradeScales && gradeScales.length > 0) {
    const percentage = avg * 10;
    const matched = gradeScales.find(s => percentage >= s.minPercentage);
    if (matched && ['A', 'B', 'C', 'D', 'E', 'F'].includes(matched.grade)) {
      return matched.grade as any;
    }
  }
  if (avg >= 8.5) return 'A';
  if (avg >= 7.5) return 'B';
  if (avg >= 6.5) return 'C';
  if (avg >= 6.0) return 'D';
  if (avg >= 5.0) return 'E';
  return 'F';
}

