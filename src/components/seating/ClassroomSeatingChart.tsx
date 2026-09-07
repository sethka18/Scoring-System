import React, { useState, useEffect, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student, ClassroomSeatingLayout, DeskPosition } from '../../types';
import { calculatePeriodAverage, formatConductRating } from '../../utils/calculations';
import { 
  Users, 
  LayoutGrid, 
  Shuffle, 
  RotateCcw, 
  Sparkles, 
  Printer, 
  UserCheck, 
  Move, 
  GraduationCap, 
  X,
  Plus,
  School,
  Check,
  Columns as ColumnsIcon,
  Rows as RowsIcon
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

// Helper to build or resize grid while preserving student placements
const buildGridDesks = (targetRows: number, targetCols: number, existingDesks?: DeskPosition[]): DeskPosition[] => {
  const existingMap = new Map<string, string | null>();
  const orphanedStudentIds: string[] = [];

  if (existingDesks && existingDesks.length > 0) {
    existingDesks.forEach(d => {
      existingMap.set(d.deskId, d.studentId);
      // Check if this desk is outside new bounds
      if (d.row >= targetRows || d.col >= targetCols) {
        if (d.studentId) orphanedStudentIds.push(d.studentId);
      }
    });
  }

  const newDesks: DeskPosition[] = [];
  for (let r = 0; r < targetRows; r++) {
    for (let c = 0; c < targetCols; c++) {
      const deskId = `desk_${r}_${c}`;
      newDesks.push({
        deskId,
        row: r,
        col: c,
        studentId: existingMap.get(deskId) ?? null
      });
    }
  }

  // If any students were in out-of-bound desks, try to place them in newly available empty desks
  orphanedStudentIds.forEach(studentId => {
    const emptyDesk = newDesks.find(d => d.studentId === null);
    if (emptyDesk) {
      emptyDesk.studentId = studentId;
    }
  });

  return newDesks;
};

export const ClassroomSeatingChart: React.FC = () => {
  const {
    language,
    schoolProfile,
    activeClass,
    classStudents,
    subjects,
    activePeriodId,
    scoresMatrix,
    weights,
    showToast
  } = useGradebook();

  const classId = activeClass?.id || 'default_class';
  const STORAGE_KEY = `moeys_seating_layout_${classId}`;

  // Seating grid settings: Default to 4 columns and 7 rows (as requested for Cambodian schools)
  const [rows, setRows] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ClassroomSeatingLayout = JSON.parse(saved);
        if (parsed.rows) return parsed.rows;
      }
    } catch (e) {
      console.error(e);
    }
    return 7; // Default 7 rows
  });

  const [columns, setColumns] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ClassroomSeatingLayout = JSON.parse(saved);
        // Automatically upgrade previous legacy 6-column default to 4 columns
        if (parsed.columns === 6 && parsed.rows === 5) return 4;
        if (parsed.columns) return parsed.columns;
      }
    } catch (e) {
      console.error(e);
    }
    return 4; // Default 4 columns (៤ ជួរឈរ)
  });

  const [arrangement, setArrangement] = useState<'pairs' | 'grid' | 'groups'>('pairs');
  
  // Desks state: array of DeskPosition
  const [desks, setDesks] = useState<DeskPosition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ClassroomSeatingLayout = JSON.parse(saved);
        const targetR = parsed.rows || 7;
        const targetC = (parsed.columns === 6 && parsed.rows === 5) ? 4 : (parsed.columns || 4);
        if (parsed.desks && parsed.desks.length > 0) {
          return buildGridDesks(targetR, targetC, parsed.desks);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return buildGridDesks(7, 4);
  });

  // Reload if activeClass changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ClassroomSeatingLayout = JSON.parse(saved);
        const targetR = parsed.rows || 7;
        const targetC = (parsed.columns === 6 && parsed.rows === 5) ? 4 : (parsed.columns || 4);
        setRows(targetR);
        setColumns(targetC);
        if (parsed.arrangement) setArrangement(parsed.arrangement);
        if (parsed.desks && parsed.desks.length > 0) {
          setDesks(buildGridDesks(targetR, targetC, parsed.desks));
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setRows(7);
    setColumns(4);
    setDesks(buildGridDesks(7, 4));
  }, [classId, STORAGE_KEY]);

  // Save to local storage on change
  useEffect(() => {
    const layout: ClassroomSeatingLayout = {
      classId,
      rows,
      columns,
      arrangement,
      desks,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch (e) {
      console.error(e);
    }
  }, [desks, rows, columns, arrangement, classId, STORAGE_KEY]);

  // Track drag state & click-to-swap state
  const [, setDraggedStudentId] = useState<string | null>(null);
  const [dragSourceDeskId, setDragSourceDeskId] = useState<string | null>(null);
  const [selectedStudentForPlacement, setSelectedStudentForPlacement] = useState<string | null>(null);

  // Unassigned students who do not currently occupy any desk
  const assignedStudentIds = useMemo(() => {
    return new Set(desks.filter(d => d.studentId !== null).map(d => d.studentId as string));
  }, [desks]);

  const unassignedStudents = useMemo(() => {
    return classStudents.filter(s => !assignedStudentIds.has(s.id));
  }, [classStudents, assignedStudentIds]);

  // Seated students count
  const seatedCount = assignedStudentIds.size;
  const totalDesks = desks.length;

  // Handler for assigning/swapping student into a desk
  const placeStudentInDesk = (targetDeskId: string, studentId: string | null) => {
    setDesks(prevDesks => {
      const targetDesk = prevDesks.find(d => d.deskId === targetDeskId);
      if (!targetDesk) return prevDesks;

      const existingOccupantInTarget = targetDesk.studentId;
      const previousDeskOfIncoming = prevDesks.find(d => d.studentId === studentId);

      return prevDesks.map(d => {
        if (d.deskId === targetDeskId) {
          return { ...d, studentId };
        }
        if (previousDeskOfIncoming && d.deskId === previousDeskOfIncoming.deskId) {
          return { ...d, studentId: existingOccupantInTarget };
        }
        return d;
      });
    });

    setSelectedStudentForPlacement(null);
  };

  // Remove student from desk
  const removeStudentFromDesk = (deskId: string) => {
    setDesks(prev => prev.map(d => d.deskId === deskId ? { ...d, studentId: null } : d));
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStartFromUnassigned = (e: React.DragEvent, studentId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ studentId, sourceDeskId: null }));
    setDraggedStudentId(studentId);
    setDragSourceDeskId(null);
  };

  const handleDragStartFromDesk = (e: React.DragEvent, studentId: string, deskId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ studentId, sourceDeskId: deskId }));
    setDraggedStudentId(studentId);
    setDragSourceDeskId(deskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnDesk = (e: React.DragEvent, targetDeskId: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.studentId) {
        placeStudentInDesk(targetDeskId, data.studentId);
      }
    } catch (err) {
      console.error(err);
    }
    setDraggedStudentId(null);
    setDragSourceDeskId(null);
  };

  const handleDropOnUnassignedSidebar = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragSourceDeskId) {
      removeStudentFromDesk(dragSourceDeskId);
    }
    setDraggedStudentId(null);
    setDragSourceDeskId(null);
  };

  // Click-to-place handler for touch / accessibility
  const handleDeskClick = (desk: DeskPosition) => {
    if (selectedStudentForPlacement) {
      placeStudentInDesk(desk.deskId, selectedStudentForPlacement);
      showToast(language === 'km' ? 'បានរៀបចំកន្លែងអង្គុយ' : 'Placed student in desk', 'success');
    } else if (desk.studentId) {
      setSelectedStudentForPlacement(desk.studentId);
    }
  };

  // ==========================================
  // SMART AUTO-ARRANGEMENT ALGORITHMS
  // ==========================================

  // 1. Alternating Boy & Girl
  const autoArrangeBoyGirl = () => {
    const boys = classStudents.filter(s => s.gender === 'Male');
    const girls = classStudents.filter(s => s.gender === 'Female');
    
    const interleaved: Student[] = [];
    const maxLen = Math.max(boys.length, girls.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < girls.length) interleaved.push(girls[i]);
      if (i < boys.length) interleaved.push(boys[i]);
    }

    setDesks(prev => {
      return prev.map((desk, idx) => ({
        ...desk,
        studentId: interleaved[idx] ? interleaved[idx].id : null
      }));
    });

    showToast(language === 'km' ? 'បានរៀបតុប្រុស-ស្រីឆ្លាស់គ្នាជោគជ័យ' : 'Arranged boy-girl alternating pairs', 'success');
  };

  // 2. Academic Peer Mentoring Pairing (Pair High & Low performers together)
  const autoArrangePeerSupport = () => {
    const sorted = [...classStudents].sort((a, b) => {
      const avgA = calculatePeriodAverage(a.id, activePeriodId, subjects, scoresMatrix, weights).average;
      const avgB = calculatePeriodAverage(b.id, activePeriodId, subjects, scoresMatrix, weights).average;
      return avgB - avgA;
    });

    const half = Math.ceil(sorted.length / 2);
    const topHalf = sorted.slice(0, half);
    const bottomHalf = sorted.slice(half);

    const pairedList: Student[] = [];
    for (let i = 0; i < half; i++) {
      if (topHalf[i]) pairedList.push(topHalf[i]);
      if (bottomHalf[i]) pairedList.push(bottomHalf[i]);
    }

    setDesks(prev => {
      return prev.map((desk, idx) => ({
        ...desk,
        studentId: pairedList[idx] ? pairedList[idx].id : null
      }));
    });

    showToast(
      language === 'km' 
        ? 'បានរៀបគូសិស្សពូកែជួយសិស្សខ្សោយ (Peer Mentoring)' 
        : 'Arranged peer-mentoring academic pairs', 
      'success'
    );
  };

  // 3. Alphabetical / Student ID Order
  const autoArrangeAlphabetical = () => {
    const sorted = [...classStudents].sort((a, b) => a.name.localeCompare(b.name, 'km'));

    setDesks(prev => {
      return prev.map((desk, idx) => ({
        ...desk,
        studentId: sorted[idx] ? sorted[idx].id : null
      }));
    });

    showToast(language === 'km' ? 'បានរៀបតាមលំដាប់ឈ្មោះអក្ខរក្រម' : 'Arranged alphabetically by student name', 'info');
  };

  // 4. Random Shuffle
  const autoArrangeRandom = () => {
    const shuffled = [...classStudents].sort(() => Math.random() - 0.5);

    setDesks(prev => {
      return prev.map((desk, idx) => ({
        ...desk,
        studentId: shuffled[idx] ? shuffled[idx].id : null
      }));
    });

    showToast(language === 'km' ? 'បានរៀបតុដោយចៃដន្យ' : 'Randomly shuffled classroom seating', 'info');
  };

  // 5. Clear All Desks
  const handleClearAllDesks = () => {
    setDesks(prev => prev.map(d => ({ ...d, studentId: null })));
    setSelectedStudentForPlacement(null);
    showToast(language === 'km' ? 'បានសម្អាតកន្លែងអង្គុយទាំងអស់' : 'Cleared all classroom seats', 'info');
  };

  // Grid sizing adjustments
  const handleAdjustGrid = (newRows: number, newCols: number) => {
    const validatedRows = Math.max(3, Math.min(10, newRows));
    const validatedCols = Math.max(2, Math.min(8, newCols));
    setRows(validatedRows);
    setColumns(validatedCols);
    setDesks(prev => buildGridDesks(validatedRows, validatedCols, prev));
    showToast(
      language === 'km'
        ? `បានកែសម្រួលប្លង់តុទៅជា ${validatedRows} ជួរដេក x ${validatedCols} ជួរឈរ`
        : `Adjusted layout to ${validatedRows} rows x ${validatedCols} columns`,
      'info'
    );
  };

  // Khmer numbers conversion helper
  const toKhmerNum = (n: number) => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(n).split('').map(d => khmerDigits[parseInt(d, 10)] ?? d).join('');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BANNER & CONTROL BAR (Hidden during print) */}
      {/* ========================================================================= */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-heading font-black text-slate-900 dark:text-white">
                  {language === 'km' ? 'ប្លង់តុអង្គុយក្នុងថ្នាក់រៀន' : 'Interactive Classroom Seating Chart'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300/60">
                  {columns} ជួរឈរ x {rows} ជួរដេក ({totalDesks} តុ)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km'
                  ? `${schoolProfile?.schoolNameKm || activeClass?.schoolNameKm} • ថ្នាក់រៀន៖ ${activeClass?.nameKm || activeClass?.name} • បានរៀបចំ៖ ${seatedCount} / ${classStudents.length} នាក់ (${totalDesks} កៅអីសរុប)`
                  : `Class: ${activeClass?.name} • Seated: ${seatedCount} / ${classStudents.length} (${totalDesks} total desks)`}
              </p>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Arrange Dropdown / Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={autoArrangeBoyGirl}
                title={language === 'km' ? 'រៀបប្រុស-ស្រីឆ្លាស់គ្នា' : 'Alternate Boy & Girl'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'km' ? 'ប្រុស-ស្រីឆ្លាស់' : 'Boy/Girl'}</span>
              </button>

              <button
                onClick={autoArrangePeerSupport}
                title={language === 'km' ? 'ផ្គូផ្គងសិស្សពូកែជួយសិស្សខ្សោយ' : 'Peer Mentoring'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'km' ? 'សិស្សពូកែជួយខ្សោយ' : 'Peer Pair'}</span>
              </button>

              <button
                onClick={autoArrangeRandom}
                title={language === 'km' ? 'រៀបចៃដន្យ' : 'Random Shuffle'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'km' ? 'ចៃដន្យ' : 'Random'}</span>
              </button>

              <button
                onClick={autoArrangeAlphabetical}
                title={language === 'km' ? 'តាមលំដាប់អក្ខរក្រម' : 'Alphabetical'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>{language === 'km' ? 'អក្ខរក្រម' : 'A-Z'}</span>
              </button>

              <button
                onClick={handleClearAllDesks}
                title={language === 'km' ? 'សម្អាតតុទាំងអស់' : 'Clear All'}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'សម្អាត' : 'Clear'}</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'km' ? 'បោះពុម្ពប្លង់តុ' : 'Print Chart'}</span>
            </button>
          </div>
        </div>

        {/* 2. SCHOOL CUSTOM LAYOUT SELECTOR (4 Columns x 6 or 7 Rows) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Direct 1-Click Cambodian Classroom Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-1">
                <ColumnsIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ទម្រង់ពេញនិយមក្នុងសាលា៖' : 'Classroom Presets:'}</span>
              </span>

              {/* Preset: 6 Rows x 4 Columns */}
              <button
                type="button"
                onClick={() => handleAdjustGrid(6, 4)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  rows === 6 && columns === 4
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {rows === 6 && columns === 4 && <Check className="w-3.5 h-3.5" />}
                <span>{language === 'km' ? '៦ ជួរដេក x ៤ ជួរឈរ (២៤ តុ)' : '6 Rows x 4 Cols (24 Desks)'}</span>
              </button>

              {/* Preset: 7 Rows x 4 Columns (Recommended for ~25-28 students) */}
              <button
                type="button"
                onClick={() => handleAdjustGrid(7, 4)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  rows === 7 && columns === 4
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {rows === 7 && columns === 4 && <Check className="w-3.5 h-3.5" />}
                <span>{language === 'km' ? '៧ ជួរដេក x ៤ ជួរឈរ (២៨ តុ) ★' : '7 Rows x 4 Cols (28 Desks) ★'}</span>
              </button>

              {/* Desk arrangement style: Pairs (Left 2 + Right 2) vs Grid */}
              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ml-1">
                <button
                  type="button"
                  onClick={() => setArrangement('pairs')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    arrangement === 'pairs'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {language === 'km' ? 'តុគូ (ឆ្វេង ២ + ស្ដាំ ២)' : 'Paired (2L + 2R)'}
                </button>
                <button
                  type="button"
                  onClick={() => setArrangement('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    arrangement === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {language === 'km' ? 'តុទោលបំបែកជួរ' : 'Single Grid'}
                </button>
              </div>
            </div>

            {/* Custom Rows & Columns Steppers */}
            <div className="flex items-center gap-3 self-end md:self-auto text-xs">
              {/* Rows Adjustment */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <RowsIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {language === 'km' ? 'ជួរដេក៖' : 'Rows:'}
                </span>
                <button
                  type="button"
                  disabled={rows <= 3}
                  onClick={() => handleAdjustGrid(rows - 1, columns)}
                  className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 cursor-pointer border border-slate-200 dark:border-slate-600"
                >
                  -
                </button>
                <span className="font-black text-indigo-600 dark:text-indigo-400 px-1 min-w-4 text-center">
                  {rows}
                </span>
                <button
                  type="button"
                  disabled={rows >= 10}
                  onClick={() => handleAdjustGrid(rows + 1, columns)}
                  className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 cursor-pointer border border-slate-200 dark:border-slate-600"
                >
                  +
                </button>
              </div>

              {/* Columns Adjustment */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <ColumnsIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {language === 'km' ? 'ជួរឈរ៖' : 'Cols:'}
                </span>
                <button
                  type="button"
                  disabled={columns <= 2}
                  onClick={() => handleAdjustGrid(rows, columns - 1)}
                  className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 cursor-pointer border border-slate-200 dark:border-slate-600"
                >
                  -
                </button>
                <span className="font-black text-indigo-600 dark:text-indigo-400 px-1 min-w-4 text-center">
                  {columns}
                </span>
                <button
                  type="button"
                  disabled={columns >= 6}
                  onClick={() => handleAdjustGrid(rows, columns + 1)}
                  className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 cursor-pointer border border-slate-200 dark:border-slate-600"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SEATING FLOOR & SIDEBAR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT / MAIN FLOOR (3 columns wide on desktop) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xs relative print:p-0 print:border-none print:shadow-none transition-colors">
            
            {/* OFFICIAL PRINT HEADER (Only visible when printing or in formal view) */}
            <div className="hidden print:block text-center pb-5 border-b-2 border-slate-900 mb-6 text-slate-900">
              <div className="flex justify-between items-start text-xs font-semibold mb-3">
                <div className="text-left flex items-center space-x-3">
                  <SchoolLogo size={46} customLogoUrl={schoolProfile?.logoUrl || activeClass?.logoUrl} />
                  <div>
                    <p className="font-extrabold text-sm uppercase">
                      {schoolProfile?.schoolNameKm || activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង'}
                    </p>
                    <p className="text-slate-600 text-xs font-medium">
                      {schoolProfile?.district || activeClass?.district || 'ស្រុកព្រៃឈរ'} • {schoolProfile?.province || activeClass?.province || 'ខេត្តកំពង់ចាម'}
                    </p>
                    <p className="text-slate-700 font-bold text-xs mt-0.5">
                      {language === 'km' ? `ថ្នាក់ទី ${activeClass?.gradeLevel} (${activeClass?.nameKm})` : `Grade ${activeClass?.gradeLevel} (${activeClass?.name})`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-sm tracking-wider uppercase">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p className="font-semibold text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <p className="font-mono text-xs mt-1 text-slate-600 font-bold">
                    {language === 'km' ? `ឆ្នាំសិក្សា៖ ${schoolProfile?.academicYear || activeClass?.academicYear || '២០២៥-២០២៦'}` : `Year: ${schoolProfile?.academicYear || activeClass?.academicYear}`}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h2 className="font-heading font-black text-xl uppercase tracking-wide">
                  {language === 'km' ? 'ប្លង់តុអង្គុយសិស្សក្នុងថ្នាក់រៀន' : 'CLASSROOM SEATING PLAN'}
                </h2>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  {language === 'km'
                    ? `ទម្រង់៖ ៤ ជួរឈរ x ${rows} ជួរដេក • សិស្សសរុប៖ ${classStudents.length} នាក់ (ស្រី ${classStudents.filter(s => s.gender === 'Female').length} នាក់) • គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherNameKm || activeClass?.teacherName}`
                    : `Layout: 4 Columns x ${rows} Rows • Total: ${classStudents.length} (Female: ${classStudents.filter(s => s.gender === 'Female').length}) • Teacher: ${activeClass?.teacherName}`}
                </p>
              </div>
            </div>

            {/* FRONT OF ROOM: Blackboard & Teacher Podium */}
            <div className="mb-6 text-center space-y-2.5">
              <div className="max-w-md mx-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-emerald-100 shadow-md border-4 border-amber-900/30 flex items-center justify-center space-x-2">
                <span className="text-xs font-heading font-black tracking-widest uppercase">
                  {language === 'km' ? 'ក្តារខៀន / ក្តារអេក្រង់ (BLACKBOARD)' : 'CLASSROOM BLACKBOARD'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>🚪 {language === 'km' ? 'ទ្វារចូលថ្នាក់រៀន' : 'Main Entrance Door'}</span>
                <div className="px-4 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                  🧑‍🏫 {language === 'km' ? 'តុគ្រូបង្រៀន' : "Teacher's Desk"}
                </div>
                <span>🪟 {language === 'km' ? 'បង្អួចខ្យល់' : 'Windows'}</span>
              </div>
            </div>

            {/* SELECTED STUDENT PLACEMENT BANNER */}
            {selectedStudentForPlacement && (
              <div className="no-print mb-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span className="text-indigo-950 dark:text-indigo-200 font-bold">
                    {language === 'km'
                      ? `បានជ្រើសរើស៖ ${classStudents.find(s => s.id === selectedStudentForPlacement)?.name} — សូមចុចលើតុដែលចង់ដាក់ ឬប្តូរវេន`
                      : `Selected: ${classStudents.find(s => s.id === selectedStudentForPlacement)?.name} — Click any desk to place or swap`}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStudentForPlacement(null)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-200 transition cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
              </div>
            )}

            {/* ================================================================= */}
            {/* COLUMN HEADERS: ជួរឈរទី ១, ជួរឈរទី ២, [ច្រកកណ្ដាល], ជួរឈរទី ៣, ជួរឈរទី ៤ */}
            {/* ================================================================= */}
            <div className="mb-3 px-1">
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-center">
                {/* Left Row spacer matching row badge width */}
                <div className="w-8 sm:w-12 shrink-0"></div>

                {/* Columns Header Badges */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  {Array.from({ length: columns }).map((_, cIdx) => {
                    const isCenterAisle = arrangement === 'pairs' && columns === 4 && cIdx === 1;
                    const isOtherPair = arrangement === 'pairs' && columns > 4 && cIdx % 2 === 1 && cIdx !== columns - 1;

                    return (
                      <React.Fragment key={`col_hdr_${cIdx}`}>
                        <div className="w-24 sm:w-30 px-1 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                          <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 block tracking-tight">
                            {language === 'km' ? `ជួរឈរទី ${toKhmerNum(cIdx + 1)}` : `Col ${cIdx + 1}`}
                          </span>
                        </div>

                        {/* Center Aisle Indicator between Column 2 and Column 3 */}
                        {isCenterAisle && (
                          <div className="w-5 sm:w-8 text-center flex flex-col items-center justify-center shrink-0">
                            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 tracking-tighter uppercase whitespace-nowrap hidden sm:inline">
                              {language === 'km' ? 'ច្រកដើរ' : 'Aisle'}
                            </span>
                            <div className="h-3 w-0.5 bg-amber-400/80 rounded-full"></div>
                          </div>
                        )}

                        {isOtherPair && !isCenterAisle && (
                          <div className="w-3 sm:w-5 flex items-center justify-center shrink-0">
                            <div className="h-3 w-0.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row spacer */}
                <div className="w-8 sm:w-12 shrink-0"></div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* DESKS GRID ARRANGEMENT: Rows 1 to 6 or 7 */}
            {/* ================================================================= */}
            <div className="space-y-3.5 sm:space-y-4">
              {Array.from({ length: rows }).map((_, rIdx) => {
                const rowDesks = desks.filter(d => d.row === rIdx).sort((a, b) => a.col - b.col);

                return (
                  <div key={`row_${rIdx}`} className="flex items-center justify-center gap-2 sm:gap-4">
                    {/* LEFT ROW BADGE */}
                    <div className="w-8 sm:w-12 text-right shrink-0">
                      <span className="inline-block px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {language === 'km' ? `ជួរ ${toKhmerNum(rIdx + 1)}` : `R${rIdx + 1}`}
                      </span>
                    </div>

                    {/* DESKS IN THIS ROW */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                      {rowDesks.map((desk, cIdx) => {
                        const student = classStudents.find(s => s.id === desk.studentId);
                        const isCenterAisle = arrangement === 'pairs' && columns === 4 && cIdx === 1;
                        const isPairBoundary = arrangement === 'pairs' && columns !== 4 && cIdx % 2 === 1 && cIdx !== rowDesks.length - 1;
                        const isSelected = selectedStudentForPlacement && desk.studentId === selectedStudentForPlacement;

                        return (
                          <React.Fragment key={desk.deskId}>
                            <div
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDropOnDesk(e, desk.deskId)}
                              onClick={() => handleDeskClick(desk)}
                              className={`relative w-24 sm:w-30 h-20 sm:h-22 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between p-2 select-none print:shadow-none print:border-slate-400 ${
                                student
                                  ? student.gender === 'Female'
                                    ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                                    : 'bg-indigo-50/90 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400'
                                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/30'
                              } ${
                                isSelected ? 'ring-2 ring-indigo-500 scale-105 shadow-md z-10' : 'shadow-2xs'
                              }`}
                              draggable={Boolean(student)}
                              onDragStart={(e) => student && handleDragStartFromDesk(e, student.id, desk.deskId)}
                            >
                              {student ? (
                                <>
                                  {/* Top Row: Desk Coordinates + Gender Badge + Remove Button */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                                      {toKhmerNum(rIdx + 1)}-{toKhmerNum(cIdx + 1)}
                                    </span>

                                    <div className="flex items-center space-x-1">
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                                        student.gender === 'Female'
                                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                                      }`}>
                                        {student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                                      </span>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeStudentFromDesk(desk.deskId);
                                        }}
                                        title={language === 'km' ? 'ដកចេញពីតុ' : 'Remove from desk'}
                                        className="no-print w-4 h-4 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center transition"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Center: Student Khmer Name */}
                                  <div className="text-center my-auto px-0.5">
                                    <p className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                      {student.name}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-mono">
                                      {student.studentId}
                                    </p>
                                  </div>

                                  {/* Bottom: Conduct rating */}
                                  <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200/60 dark:border-slate-700/60">
                                    <span className="font-medium">វិន័យ៖ {formatConductRating(student.conductRating, language)}</span>
                                    <Move className="w-2.5 h-2.5 opacity-40 no-print" />
                                  </div>
                                </>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Plus className="w-3.5 h-3.5 opacity-60" />
                                    <span className="text-[9px] font-mono text-slate-400">
                                      {toKhmerNum(rIdx + 1)}-{toKhmerNum(cIdx + 1)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-medium">
                                    {language === 'km' ? 'តុទទេ' : 'Empty'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Center Aisle Divider between Column 2 and Column 3 */}
                            {isCenterAisle && (
                              <div className="w-5 sm:w-8 h-full flex items-center justify-center shrink-0">
                                <div className="h-10 w-0.5 bg-amber-400/60 dark:bg-amber-500/40 rounded-full"></div>
                              </div>
                            )}

                            {/* Other pair boundaries */}
                            {isPairBoundary && (
                              <div className="w-3 sm:w-5 h-full flex items-center justify-center shrink-0">
                                <div className="h-10 w-0.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* RIGHT ROW BADGE */}
                    <div className="w-8 sm:w-12 text-left shrink-0">
                      <span className="inline-block px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {language === 'km' ? `ជួរ ${toKhmerNum(rIdx + 1)}` : `R${rIdx + 1}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CLASSROOM REAR LABEL */}
            <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
              ⬇️ {language === 'km' ? 'ក្រោយថ្នាក់រៀន (Rear of Classroom)' : 'Rear of Classroom'}
            </div>

            {/* PRINT SIGNATURE FOOTER */}
            <div className="hidden print:block mt-10 pt-6 border-t border-slate-300 text-slate-900">
              <div className="flex justify-between items-start text-xs font-semibold px-4">
                <div className="text-center w-64">
                  <p className="font-bold mb-1">{language === 'km' ? 'បានឃើញ និងឯកភាព' : 'Approved By'}</p>
                  <p className="font-black uppercase">{language === 'km' ? 'នាយកសាលា' : 'Principal'}</p>
                  <div className="h-16 flex items-end justify-center">
                    {schoolProfile?.principalNameKm && (
                      <p className="font-bold text-xs">{schoolProfile.principalNameKm}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{language === 'km' ? '(ហត្ថលេខា និងត្រា)' : '(Signature & Stamp)'}</p>
                </div>

                <div className="text-center w-64">
                  <p className="mb-1 text-[11px] text-slate-600">
                    {language === 'km' ? 'ថ្ងៃ..................ខែ.........ឆ្នាំ........... ព.ស. ២៥...' : 'Date: ...... / ...... / 2026'}
                  </p>
                  <p className="font-black uppercase">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}</p>
                  <div className="h-16 flex items-end justify-center">
                    <p className="font-bold text-xs">{activeClass?.teacherNameKm || activeClass?.teacherName}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{language === 'km' ? '(ហត្ថលេខា និងឈ្មោះ)' : '(Signature & Name)'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR: UNASSIGNED ROSTER (Hidden during print) */}
        <div className="lg:col-span-1 no-print space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDropOnUnassignedSidebar}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                  {language === 'km' ? 'សិស្សមិនទាន់មានតុ' : 'Unassigned'}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                unassignedStudents.length === 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                {unassignedStudents.length} នាក់
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'km'
                ? 'ចាប់ទាញ (Drag) សិស្សខាងក្រោមទៅដាក់លើតុ ឬចុចលើឈ្មោះដើម្បីជ្រើសរើស'
                : 'Drag students into an empty desk or click to select and seat.'}
            </p>

            {/* Scrollable list of unassigned students */}
            <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {unassignedStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <UserCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'km' ? 'សិស្សទាំងអស់មានកន្លែងអង្គុយគ្រប់គ្នា!' : 'All students are seated!'}
                  </p>
                </div>
              ) : (
                unassignedStudents.map(student => {
                  const isSelected = selectedStudentForPlacement === student.id;

                  return (
                    <div
                      key={student.id}
                      draggable
                      onDragStart={(e) => handleDragStartFromUnassigned(e, student.id)}
                      onClick={() => setSelectedStudentForPlacement(isSelected ? null : student.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          student.gender === 'Female'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {student.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">{student.name}</p>
                          <p className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {student.studentId} • {student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </p>
                        </div>
                      </div>

                      <Move className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
