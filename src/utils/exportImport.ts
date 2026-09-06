import { 
  Student, 
  ClassSection, 
  Subject, 
  AssessmentPeriod, 
  AssessmentWeightConfig, 
  CompetencyPillarsWeight, 
  GradeScaleThreshold 
} from '../types';
import { 
  calculateSubjectScore, 
  calculatePeriodAverage, 
  calculatePeriodRankings, 
  calculateYearlySummaries, 
  DEFAULT_COMPETENCY_WEIGHTS,
  formatConductRating
} from './calculations';

/**
 * Options for exporting assessment data to CSV
 */
export interface ComprehensiveCSVExportOptions {
  scope: 'current_period' | 'all_periods' | 'single_subject';
  currentPeriodId: string;
  currentPeriodNameKm?: string;
  currentPeriodNameEn?: string;
  selectedSubjectId?: string;
  className: string;
  classNameKm?: string;
  teacherName?: string;
  students: Student[];
  subjects: Subject[];
  periods: AssessmentPeriod[];
  scoresMatrix: Record<string, Record<string, Record<string, any>>>;
  weights: AssessmentWeightConfig;
  competencyWeights: CompetencyPillarsWeight;
  gradeScales: GradeScaleThreshold[];
  includeSubSkills: boolean;
  includeCompetencies: boolean;
  includeAttendance: boolean;
  includeGuardianInfo: boolean;
}

/**
 * Formats a CSV cell cleanly. Numbers remain unquoted for Excel mathematical analysis.
 */
function formatCSVCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  if (typeof val === 'number') {
    return isNaN(val) ? '0' : String(val);
  }
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Helper to get letter grade from average
 */
function getGradeLetter(avg: number, gradeScales: GradeScaleThreshold[]): string {
  const percentage = avg * 10;
  const matched = gradeScales.find(s => percentage >= s.minPercentage);
  if (matched && ['A', 'B', 'C', 'D', 'E', 'F'].includes(matched.grade)) {
    return matched.grade;
  }
  return avg >= 8.5 ? 'A' : avg >= 7.5 ? 'B' : avg >= 6.5 ? 'C' : avg >= 6.0 ? 'D' : avg >= 5.0 ? 'E' : 'F';
}

/**
 * Builds structured headers and rows for Assessment CSV export
 */
export function buildAssessmentCSVData(options: ComprehensiveCSVExportOptions): {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
} {
  const {
    scope,
    currentPeriodId,
    currentPeriodNameKm,
    currentPeriodNameEn,
    selectedSubjectId,
    className,
    classNameKm,
    students,
    subjects,
    periods,
    scoresMatrix,
    weights,
    competencyWeights,
    gradeScales,
    includeSubSkills,
    includeCompetencies,
    includeAttendance,
    includeGuardianInfo,
  } = options;

  const currentPeriod = periods.find(p => p.id === currentPeriodId) || periods[0];
  const safeClassName = (classNameKm || className || 'ថ្នាក់').replace(/\s+/g, '_');
  const safePeriodName = (currentPeriodNameKm || currentPeriod?.nameKm || currentPeriodNameEn || 'ដំណាក់កាល').replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);

  // --- 1. SCOPE: ALL PERIODS MASTER ANNUAL MATRIX ---
  if (scope === 'all_periods') {
    const yearlySummaries = calculateYearlySummaries(
      students,
      periods,
      subjects,
      scoresMatrix,
      weights,
      gradeScales,
      competencyWeights
    );

    const headers: string[] = [
      'ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ (Yearly Rank)',
      'អត្តលេខ (Student ID)',
      'គោត្តនាម និងនាម (Student Name)',
      'ឈ្មោះជាឡាតាំង (Latin Name)',
      'ភេទ (Gender)',
    ];

    // Add columns for each period in academic year
    periods.forEach(p => {
      headers.push(`${p.nameKm} (ម.ភាគ)`);
      headers.push(`${p.nameKm} (ចំណាត់ថ្នាក់)`);
    });

    headers.push(
      'មធ្យមភាគឆមាសទី១ (Sem 1)',
      'មធ្យមភាគឆមាសទី២ (Sem 2)',
      'មធ្យមភាគប្រចាំឆ្នាំសរុប (Annual Avg)',
      'និទ្ទេសសរុប (Grade)',
      'វិជ្ជាសម្បទា (Knowledge 80%)',
      'បំណិនសម្បទា (Skill 10%)',
      'ចរិយាសម្បទា (Attitude 10%)',
      'សេចក្តីសម្រេច (Decision)',
      'កិត្តិយស (Distinction)',
      'អត្រាវត្តមាន (%)'
    );

    if (includeAttendance) {
      headers.push('អវត្តមានសរុប (ថ្ងៃ)', 'ចរិយាធម៌ (Conduct)');
    }

    if (includeGuardianInfo) {
      headers.push('អាណាព្យាបាល', 'លេខទូរស័ព្ទ');
    }

    // Precalculate period rankings for each period
    const periodRankingsMap = new Map<string, Map<string, { rank: number; avg: number }>>();
    periods.forEach(p => {
      const pRanks = calculatePeriodRankings(students, p.id, subjects, scoresMatrix, weights, competencyWeights);
      const studentMap = new Map<string, { rank: number; avg: number }>();
      pRanks.forEach(r => studentMap.set(r.student.id, { rank: r.rank, avg: r.average }));
      periodRankingsMap.set(p.id, studentMap);
    });

    const rows = yearlySummaries.map(sum => {
      const s = sum.student;
      const row: (string | number)[] = [
        sum.yearlyRank,
        s.studentId,
        s.name,
        s.nameLatin || '',
        s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
      ];

      // Add scores for each period
      periods.forEach(p => {
        const pData = periodRankingsMap.get(p.id)?.get(s.id);
        row.push(pData ? pData.avg.toFixed(2) : '0.00');
        row.push(pData ? pData.rank : '-');
      });

      row.push(
        sum.term1Average.toFixed(2),
        sum.term2Average.toFixed(2),
        sum.yearlyAverage.toFixed(2),
        sum.letterGrade,
        sum.yearlyKnowledge.toFixed(2),
        sum.yearlySkill.toFixed(2),
        sum.yearlyAttitude.toFixed(2),
        sum.passed ? 'ឡើងថ្នាក់' : 'ត្រួតថ្នាក់',
        sum.honorDistinctionKm,
        `${sum.attendanceRate}%`
      );

      if (includeAttendance) {
        const totalAbs = (s.attendanceCount?.absentExcused || 0) + (s.attendanceCount?.absentUnexcused || 0);
        row.push(totalAbs, s.conductRating || 'A');
      }

      if (includeGuardianInfo) {
        row.push(s.guardianName || '', s.guardianPhone || '');
      }

      return row;
    });

    return {
      headers,
      rows,
      filename: `តារាងពិន្ទុប្រចាំឆ្នាំ_${safeClassName}_${dateStr}.csv`,
    };
  }

  // --- 2. SCOPE: SINGLE FILTERED SUBJECT ---
  if (scope === 'single_subject' && selectedSubjectId && selectedSubjectId !== 'all') {
    const subject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
    const isKhmer = subject.id === 'sub_khmer';
    const isMath = subject.id === 'sub_math';

    const headers: string[] = [
      'ចំណាត់ថ្នាក់',
      'អត្តលេខ',
      'គោត្តនាម និងនាម',
      'ភេទ',
    ];

    if (isKhmer && includeSubSkills) {
      headers.push('អាន (/១០)', 'សរសេរ (/១០)', 'ស្ដាប់ (/១០)', 'និយាយ (/១០)');
    } else if (isMath && includeSubSkills) {
      headers.push('ចំនួន (/១០)', 'ពិជគណិត (/១០)', 'រង្វាស់ (/១០)', 'ធរណីមាត្រ (/១០)', 'ស្ថិតិ (/១០)');
    }

    headers.push(`${subject.nameKm} (ពិន្ទុសរុប)`, 'និទ្ទេស');

    if (includeAttendance) {
      headers.push('ចរិយាធម៌');
    }

    const studentRows = students.map(s => {
      const entry = scoresMatrix[s.id]?.[currentPeriodId]?.[subject.id] || {};
      const score = calculateSubjectScore(entry, weights, subject.code);
      const grade = getGradeLetter(score, gradeScales);

      const row: (string | number)[] = [
        0, // rank placeholder
        s.studentId,
        s.name,
        s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
      ];

      if (isKhmer && includeSubSkills) {
        const kr = entry.khmerReading ?? 8.0;
        const kw = entry.khmerWriting ?? 8.0;
        const kl = entry.khmerListening ?? 8.5;
        const ks = entry.khmerSpeaking ?? 8.5;
        row.push(Number(kr).toFixed(1), Number(kw).toFixed(1), Number(kl).toFixed(1), Number(ks).toFixed(1));
      } else if (isMath && includeSubSkills) {
        const kn = entry.mathNumbers ?? 8.0;
        const ka = entry.mathAlgebra ?? 8.0;
        const kmVal = entry.mathMeasurement ?? 8.0;
        const kg = entry.mathGeometry ?? 8.0;
        const kst = entry.mathStatistics ?? 8.0;
        row.push(Number(kn).toFixed(1), Number(ka).toFixed(1), Number(kmVal).toFixed(1), Number(kg).toFixed(1), Number(kst).toFixed(1));
      }

      row.push(Number(score).toFixed(1), grade);

      if (includeAttendance) {
        row.push(s.conductRating || 'A');
      }

      return {
        score,
        row,
      };
    });

    // Sort by score desc
    studentRows.sort((a, b) => b.score - a.score);
    studentRows.forEach((item, idx) => {
      item.row[0] = idx + 1; // assign rank
    });

    return {
      headers,
      rows: studentRows.map(i => i.row),
      filename: `ពិន្ទុ_${subject.nameKm.replace(/\s+/g, '_')}_${safeClassName}_${safePeriodName}_${dateStr}.csv`,
    };
  }

  // --- 3. SCOPE: CURRENT PERIOD (DEFAULT FULL MATRIX) ---
  const rankings = calculatePeriodRankings(
    students,
    currentPeriodId,
    subjects,
    scoresMatrix,
    weights,
    competencyWeights
  );

  const headers: string[] = [
    'ចំណាត់ថ្នាក់ (Rank)',
    'អត្តលេខ (Student ID)',
    'គោត្តនាម និងនាម (Student Name)',
    'ឈ្មោះជាឡាតាំង (Latin Name)',
    'ភេទ (Gender)',
  ];

  if (includeGuardianInfo) {
    headers.push('ថ្ងៃខែឆ្នាំកំណើត (DOB)');
  }

  // Add Subject columns
  subjects.forEach(subj => {
    if (subj.id === 'sub_khmer' && includeSubSkills) {
      headers.push('ខ្មែរ-អាន', 'ខ្មែរ-សរសេរ', 'ខ្មែរ-ស្ដាប់', 'ខ្មែរ-និយាយ');
    } else if (subj.id === 'sub_math' && includeSubSkills) {
      headers.push('គណិត-ចំនួន', 'គណិត-ពិជគណិត', 'គណិត-រង្វាស់', 'គណិត-ធរណីមាត្រ', 'គណិត-ស្ថិតិ');
    }
    headers.push(`${subj.nameKm} (/១០)`);
  });

  headers.push(
    'ពិន្ទុសរុប (Total Points)',
    'មធ្យមភាគប្រចាំខែ (Monthly Avg)',
    'និទ្ទេស (Grade)'
  );

  if (includeCompetencies) {
    headers.push(
      `វិជ្ជាសម្បទា (${competencyWeights.knowledge}%)`,
      `បំណិនសម្បទា (${competencyWeights.skill}%)`,
      `ចរិយាសម្បទា (${competencyWeights.attitude}%)`,
      'មធ្យមភាគរួមសម្បទា'
    );
  }

  if (includeAttendance) {
    headers.push(
      'ចរិយាធម៌ (Conduct)',
      'វត្តមាន (ថ្ងៃ)',
      'អវត្តមានច្បាប់',
      'អវត្តមានឥតច្បាប់'
    );
  }

  if (includeGuardianInfo) {
    headers.push(
      'អាណាព្យាបាល (Guardian)',
      'លេខទូរស័ព្ទ (Phone)'
    );
  }

  headers.push('មតិយោបល់គ្រូ (Teacher Notes)');

  const rows = rankings.map(r => {
    const s = r.student;
    const row: (string | number)[] = [
      r.rank,
      s.studentId,
      s.name,
      s.nameLatin || '',
      s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
    ];

    if (includeGuardianInfo) {
      row.push(s.dob || '');
    }

    // Populate Subject Scores
    subjects.forEach(subj => {
      const entry = scoresMatrix[s.id]?.[currentPeriodId]?.[subj.id] || {};
      const score = r.subjectScores[subj.id] ?? 0;

      if (subj.id === 'sub_khmer' && includeSubSkills) {
        const kr = entry.khmerReading ?? 8.0;
        const kw = entry.khmerWriting ?? 8.0;
        const kl = entry.khmerListening ?? 8.5;
        const ks = entry.khmerSpeaking ?? 8.5;
        row.push(Number(kr).toFixed(1), Number(kw).toFixed(1), Number(kl).toFixed(1), Number(ks).toFixed(1));
      } else if (subj.id === 'sub_math' && includeSubSkills) {
        const kn = entry.mathNumbers ?? 8.0;
        const ka = entry.mathAlgebra ?? 8.0;
        const kmVal = entry.mathMeasurement ?? 8.0;
        const kg = entry.mathGeometry ?? 8.0;
        const kst = entry.mathStatistics ?? 8.0;
        row.push(Number(kn).toFixed(1), Number(ka).toFixed(1), Number(kmVal).toFixed(1), Number(kg).toFixed(1), Number(kst).toFixed(1));
      }

      row.push(Number(score).toFixed(1));
    });

    // Total points and Monthly Avg
    row.push(
      r.totalPoints.toFixed(1),
      r.average.toFixed(2),
      getGradeLetter(r.average, gradeScales)
    );

    if (includeCompetencies) {
      const kw = (competencyWeights.knowledge || 80) / 100;
      const sw = (competencyWeights.skill || 10) / 100;
      const aw = (competencyWeights.attitude || 10) / 100;
      const composite = (r.knowledgeScore * kw) + (r.skillScore * sw) + (r.attitudeScore * aw);

      row.push(
        r.knowledgeScore.toFixed(2),
        r.skillScore.toFixed(2),
        r.attitudeScore.toFixed(2),
        composite.toFixed(2)
      );
    }

    if (includeAttendance) {
      row.push(
        s.conductRating || 'A',
        s.attendanceCount?.present ?? 0,
        s.attendanceCount?.absentExcused ?? 0,
        s.attendanceCount?.absentUnexcused ?? 0
      );
    }

    if (includeGuardianInfo) {
      row.push(s.guardianName || '', s.guardianPhone || '');
    }

    row.push(s.notes || '');

    return row;
  });

  return {
    headers,
    rows,
    filename: `ពិន្ទុ_${safeClassName}_${safePeriodName}_${dateStr}.csv`,
  };
}

/**
 * Generates and downloads a CSV file with UTF-8 BOM encoding
 */
export function exportAssessmentDataToCSV(options: ComprehensiveCSVExportOptions): void {
  const { headers, rows, filename } = buildAssessmentCSVData(options);

  const formattedRows = rows.map(row => row.map(cell => formatCSVCell(cell)).join(','));
  const headerLine = headers.map(h => formatCSVCell(h)).join(',');

  // \uFEFF is UTF-8 Byte Order Mark, ensuring Microsoft Excel & Google Sheets open Khmer Unicode text flawlessly
  const csvContent = '\uFEFF' + [headerLine, ...formattedRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies the assessment table to clipboard as TSV for immediate paste into Excel or Google Sheets
 */
export async function copyAssessmentDataToClipboard(options: ComprehensiveCSVExportOptions): Promise<boolean> {
  try {
    const { headers, rows } = buildAssessmentCSVData(options);
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.map(c => String(c ?? '')).join('\t'))
    ].join('\r\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsvContent);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Exports students list to CSV format
 */
export function exportStudentsToCSV(students: Student[], className: string): void {
  const headers = ['ID', 'Student ID', 'Full Name (Khmer)', 'Full Name (Latin)', 'Gender', 'Date of Birth', 'Guardian Name', 'Guardian Phone', 'Conduct Rating', 'Behavior Points', 'Present Days', 'Absent Excused', 'Absent Unexcused', 'Notes'];
  
  const rows = students.map(s => [
    s.id,
    s.studentId,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${(s.nameLatin || '').replace(/"/g, '""')}"`,
    s.gender,
    s.dob || '',
    `"${(s.guardianName || '').replace(/"/g, '""')}"`,
    s.guardianPhone || '',
    formatConductRating(s.conductRating, 'km'),
    s.behaviorScore || 5,
    s.attendanceCount?.present ?? 0,
    s.attendanceCount?.absentExcused ?? 0,
    s.attendanceCount?.absentUnexcused ?? 0,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Roster_${className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports a period's full scores matrix to CSV (backward-compatible)
 */
export function exportPeriodScoresToCSV(
  periodName: string,
  className: string,
  students: Student[],
  subjects: Subject[],
  scoresMatrix: Record<string, Record<string, Record<string, any>>>,
  periodId: string
): void {
  exportAssessmentDataToCSV({
    scope: 'current_period',
    currentPeriodId: periodId,
    currentPeriodNameKm: periodName,
    currentPeriodNameEn: periodName,
    className,
    students,
    subjects,
    periods: [{ id: periodId, nameEn: periodName, nameKm: periodName, semester: 1, isExam: false }],
    scoresMatrix,
    weights: { homework: 20, quizzes: 20, midterm: 20, finalExam: 40, behaviorBonus: 5 },
    competencyWeights: DEFAULT_COMPETENCY_WEIGHTS,
    gradeScales: [],
    includeSubSkills: true,
    includeCompetencies: true,
    includeAttendance: true,
    includeGuardianInfo: false,
  });
}

/**
 * Exports entire state to JSON file
 */
export function exportFullBackupJSON(data: any): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PrimaryGradebook_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses CSV text to student records
 */
export function parseStudentsCSV(csvText: string): Partial<Student>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const students: Partial<Student>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parser supporting quotes
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = '';

    for (const char of lines[i]) {
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentVal.trim().replace(/^"|"$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^"|"$/g, ''));

    if (values.length >= 2) {
      // Find name index or fallback
      const name = values[2] || values[1] || values[0] || 'Unknown Student';
      const studentId = values[1] || `STU-${Date.now().toString().slice(-4)}`;
      const gender = (values[4] || values[2] || 'Male').toLowerCase().startsWith('f') ? 'Female' : 'Male';

      students.push({
        id: `stu_${Date.now()}_${i}`,
        studentId: studentId.replace(/^"|"$/g, ''),
        name: name.replace(/^"|"$/g, ''),
        nameLatin: values[3] ? values[3].replace(/^"|"$/g, '') : '',
        gender,
        dob: values[5] || '2014-01-01',
        guardianName: values[6] || '',
        guardianPhone: values[7] || '',
        conductRating: 'A',
        behaviorScore: 5,
        attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
      });
    }
  }

  return students;
}
