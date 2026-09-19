import React, { useState, useEffect, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student, ClassroomSeatingLayout, DeskPosition } from '../../types';
import { calculatePeriodAverage, formatConductRating } from '../../utils/calculations';
import { 
  Users, 
  User,
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
  Rows as RowsIcon,
  HeartHandshake,
  Maximize2,
  Minimize2,
  Building2
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

// Helper to build or resize grid while preserving student placements and desk capacities
const buildGridDesks = (targetRows: number, targetCols: number, existingDesks?: DeskPosition[]): DeskPosition[] => {
  const existingMap = new Map<string, { studentId: string | null; studentId2: string | null; capacity: 1 | 2 }>();
  const orphanedStudentIds: string[] = [];

  if (existingDesks && existingDesks.length > 0) {
    existingDesks.forEach(d => {
      existingMap.set(d.deskId, {
        studentId: d.studentId,
        studentId2: d.studentId2 ?? null,
        capacity: d.capacity ?? 2 // Default to 2 students per desk
      });
      // Check if this desk is outside new bounds
      if (d.row >= targetRows || d.col >= targetCols) {
        if (d.studentId) orphanedStudentIds.push(d.studentId);
        if (d.studentId2) orphanedStudentIds.push(d.studentId2);
      }
    });
  }

  const newDesks: DeskPosition[] = [];
  for (let r = 0; r < targetRows; r++) {
    for (let c = 0; c < targetCols; c++) {
      const deskId = `desk_${r}_${c}`;
      const prev = existingMap.get(deskId);
      newDesks.push({
        deskId,
        row: r,
        col: c,
        capacity: prev?.capacity ?? 2, // Default to double desk (តុអង្គុយ២នាក់)
        studentId: prev ? prev.studentId : null,
        studentId2: prev ? prev.studentId2 : null
      });
    }
  }

  // If any students were in out-of-bound desks, try to place them in newly available empty seats
  orphanedStudentIds.forEach(studentId => {
    for (const d of newDesks) {
      if (d.studentId === null) {
        d.studentId = studentId;
        return;
      }
      if ((d.capacity ?? 2) === 2 && d.studentId2 === null) {
        d.studentId2 = studentId;
        return;
      }
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
    classes,
    activeClassId,
    setActiveClassId,
    subjects,
    activePeriodId,
    scoresMatrix,
    weights,
    showToast
  } = useGradebook();

  const [isFullWidth, setIsFullWidth] = useState(false);

  const classId = activeClass?.id || 'default_class';
  const STORAGE_KEY = `Ministry_seating_layout_${classId}`;

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
        if (parsed.columns === 6 && parsed.rows === 5) return 4;
        if (parsed.columns) return parsed.columns;
      }
    } catch (e) {
      console.error(e);
    }
    return 4; // Default 4 columns (៤ ជួរឈរ)
  });

  const [arrangement, setArrangement] = useState<'pairs' | 'grid' | 'groups'>('pairs');
  
  // Desks state: array of DeskPosition with capacity and 2 student slots
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
  const [dragSource, setDragSource] = useState<{ deskId: string | null; slot: 1 | 2 | null }>({ deskId: null, slot: null });
  const [selectedStudentForPlacement, setSelectedStudentForPlacement] = useState<string | null>(null);

  // Assigned students across both Slot 1 and Slot 2
  const assignedStudentIds = useMemo(() => {
    const ids = new Set<string>();
    desks.forEach(d => {
      if (d.studentId) ids.add(d.studentId);
      if ((d.capacity ?? 2) === 2 && d.studentId2) ids.add(d.studentId2);
    });
    return ids;
  }, [desks]);

  // Unassigned students
  const unassignedStudents = useMemo(() => {
    return classStudents.filter(s => !assignedStudentIds.has(s.id));
  }, [classStudents, assignedStudentIds]);

  // Seating statistics
  const seatedCount = assignedStudentIds.size;
  const totalDesks = desks.length;
  const doubleDesksCount = useMemo(() => desks.filter(d => (d.capacity ?? 2) === 2).length, [desks]);
  const singleDesksCount = useMemo(() => desks.filter(d => (d.capacity ?? 2) === 1).length, [desks]);
  const totalSeats = useMemo(() => desks.reduce((sum, d) => sum + (d.capacity ?? 2), 0), [desks]);

  // Handler for placing / swapping student into a desk slot (slot 1 or slot 2)
  const placeStudentInSlot = (targetDeskId: string, slot: 1 | 2, studentId: string | null) => {
    setDesks(prevDesks => {
      const targetDesk = prevDesks.find(d => d.deskId === targetDeskId);
      if (!targetDesk) return prevDesks;

      const existingOccupantInTarget = slot === 1 ? targetDesk.studentId : targetDesk.studentId2;

      // Find if student was already in another desk/slot
      let sourceDeskId: string | null = null;
      let sourceSlot: 1 | 2 = 1;
      for (const d of prevDesks) {
        if (d.studentId === studentId) {
          sourceDeskId = d.deskId;
          sourceSlot = 1;
          break;
        }
        if ((d.capacity ?? 2) === 2 && d.studentId2 === studentId) {
          sourceDeskId = d.deskId;
          sourceSlot = 2;
          break;
        }
      }

      return prevDesks.map(d => {
        // Target desk update
        if (d.deskId === targetDeskId) {
          // If swapping within the same desk
          if (sourceDeskId === targetDeskId) {
            if (slot === 1) {
              return { ...d, studentId, studentId2: existingOccupantInTarget };
            } else {
              return { ...d, studentId: existingOccupantInTarget, studentId2: studentId };
            }
          }

          if (slot === 1) {
            return { ...d, studentId };
          } else {
            return { ...d, studentId2: studentId };
          }
        }

        // Source desk update (swap the existing occupant back)
        if (sourceDeskId && d.deskId === sourceDeskId) {
          if (sourceSlot === 1) {
            return { ...d, studentId: existingOccupantInTarget };
          } else {
            return { ...d, studentId2: existingOccupantInTarget };
          }
        }

        return d;
      });
    });

    setSelectedStudentForPlacement(null);
  };

  // Remove student from a specific slot in a desk
  const removeStudentFromSlot = (deskId: string, slot: 1 | 2) => {
    setDesks(prev => prev.map(d => {
      if (d.deskId !== deskId) return d;
      if (slot === 1) return { ...d, studentId: null };
      return { ...d, studentId2: null };
    }));
  };

  // Toggle desk capacity between 2 students (តុគូ) and 1 student (តុទោល)
  const toggleDeskCapacity = (deskId: string) => {
    setDesks(prevDesks => {
      return prevDesks.map(d => {
        if (d.deskId !== deskId) return d;
        const currentCap = d.capacity ?? 2;
        if (currentCap === 2) {
          // Change to single desk (1 student)
          if (d.studentId2) {
            showToast(
              language === 'km'
                ? 'បានប្តូរជាតុទោល (សិស្សកៅអីទី២ ត្រូវបានដាក់ក្នុងបញ្ជីមិនទាន់មានតុ)'
                : 'Changed to single desk (Seat 2 student moved to unassigned)',
              'info'
            );
          }
          return {
            ...d,
            capacity: 1,
            studentId2: null
          };
        } else {
          // Change to double desk (2 students)
          return {
            ...d,
            capacity: 2,
            studentId2: null
          };
        }
      });
    });
  };

  // Bulk set all desks capacity
  const setAllDesksCapacity = (cap: 1 | 2) => {
    setDesks(prev => prev.map(d => ({
      ...d,
      capacity: cap,
      studentId2: cap === 1 ? null : d.studentId2
    })));
    showToast(
      language === 'km'
        ? (cap === 2 ? 'បានកំណត់តុទាំងអស់ជា តុគូ (២ នាក់/តុ)' : 'បានកំណត់តុទាំងអស់ជា តុទោល (១ នាក់/តុ)')
        : (cap === 2 ? 'Set all desks to Double Desks (2 seats/desk)' : 'Set all desks to Single Desks (1 seat/desk)'),
      'success'
    );
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStartFromUnassigned = (e: React.DragEvent, studentId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ studentId, sourceDeskId: null, sourceSlot: null }));
    setDraggedStudentId(studentId);
    setDragSource({ deskId: null, slot: null });
  };

  const handleDragStartFromSlot = (e: React.DragEvent, studentId: string, deskId: string, slot: 1 | 2) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', JSON.stringify({ studentId, sourceDeskId: deskId, sourceSlot: slot }));
    setDraggedStudentId(studentId);
    setDragSource({ deskId, slot });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (e: React.DragEvent, targetDeskId: string, targetSlot: 1 | 2) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.studentId) {
        placeStudentInSlot(targetDeskId, targetSlot, data.studentId);
      }
    } catch (err) {
      console.error(err);
    }
    setDraggedStudentId(null);
    setDragSource({ deskId: null, slot: null });
  };

  const handleDropOnUnassignedSidebar = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragSource.deskId && dragSource.slot) {
      removeStudentFromSlot(dragSource.deskId, dragSource.slot);
    }
    setDraggedStudentId(null);
    setDragSource({ deskId: null, slot: null });
  };

  // Click-to-place handler for touch / accessibility
  const handleSlotClick = (desk: DeskPosition, slot: 1 | 2) => {
    const currentStudentId = slot === 1 ? desk.studentId : desk.studentId2;

    if (selectedStudentForPlacement) {
      placeStudentInSlot(desk.deskId, slot, selectedStudentForPlacement);
      const studentName = classStudents.find(s => s.id === selectedStudentForPlacement)?.name || '';
      showToast(
        language === 'km' 
          ? `បានដាក់សិស្ស «${studentName}» លើតុ (កៅអីទី ${toKhmerNum(slot)})` 
          : `Placed ${studentName} into seat ${slot}`, 
        'success'
      );
    } else if (currentStudentId) {
      setSelectedStudentForPlacement(currentStudentId);
    }
  };

  // =========================================================================
  // SMART AUTO-ARRANGEMENT ALGORITHMS SUPPORTING DOUBLE & SINGLE DESKS
  // =========================================================================

  // 1. Alternating Boy & Girl across double desks (Boy + Girl seated together)
  const autoArrangeBoyGirl = () => {
    const boys = [...classStudents.filter(s => s.gender === 'Male')];
    const girls = [...classStudents.filter(s => s.gender === 'Female')];

    const doubleDesks = desks.filter(d => (d.capacity ?? 2) === 2);
    const singleDesks = desks.filter(d => (d.capacity ?? 2) === 1);

    const doubleDeskAssignments = new Map<string, { s1: string | null; s2: string | null }>();
    doubleDesks.forEach(d => {
      const g = girls.shift();
      const b = boys.shift();
      doubleDeskAssignments.set(d.deskId, {
        s1: g ? g.id : (boys.shift()?.id ?? null),
        s2: b ? b.id : (girls.shift()?.id ?? null)
      });
    });

    const remaining = [...girls, ...boys];
    const singleDeskAssignments = new Map<string, string | null>();
    singleDesks.forEach(d => {
      singleDeskAssignments.set(d.deskId, remaining.shift()?.id ?? null);
    });

    setDesks(prev => prev.map(d => {
      if ((d.capacity ?? 2) === 2) {
        const assign = doubleDeskAssignments.get(d.deskId);
        return {
          ...d,
          studentId: assign?.s1 ?? null,
          studentId2: assign?.s2 ?? null
        };
      } else {
        return {
          ...d,
          studentId: singleDeskAssignments.get(d.deskId) ?? null,
          studentId2: null
        };
      }
    }));

    showToast(language === 'km' ? 'បានរៀបតុប្រុស-ស្រីអង្គុយគូគ្នាជោគជ័យ' : 'Arranged boy-girl paired seating', 'success');
  };

  // 2. Academic Peer Mentoring Pairing (Pair High & Low performers together in 2-person desks)
  const autoArrangePeerSupport = () => {
    const sorted = [...classStudents].sort((a, b) => {
      const avgA = calculatePeriodAverage(a.id, activePeriodId, subjects, scoresMatrix, weights).average;
      const avgB = calculatePeriodAverage(b.id, activePeriodId, subjects, scoresMatrix, weights).average;
      return avgB - avgA;
    });

    const doubleDesks = desks.filter(d => (d.capacity ?? 2) === 2);
    const singleDesks = desks.filter(d => (d.capacity ?? 2) === 1);

    const numDoubleDesks = doubleDesks.length;
    const doubleCapacityStudents = sorted.slice(0, numDoubleDesks * 2);
    const half = Math.ceil(doubleCapacityStudents.length / 2);
    const topHalf = doubleCapacityStudents.slice(0, half);
    const bottomHalf = doubleCapacityStudents.slice(half).reverse(); // pair highest with lowest

    const doubleDeskAssignments = new Map<string, { s1: string | null; s2: string | null }>();
    doubleDesks.forEach((d, idx) => {
      doubleDeskAssignments.set(d.deskId, {
        s1: topHalf[idx]?.id ?? null,
        s2: bottomHalf[idx]?.id ?? null
      });
    });

    const remainingStudents = sorted.slice(numDoubleDesks * 2);
    const singleDeskAssignments = new Map<string, string | null>();
    singleDesks.forEach((d, idx) => {
      singleDeskAssignments.set(d.deskId, remainingStudents[idx]?.id ?? null);
    });

    setDesks(prev => prev.map(d => {
      if ((d.capacity ?? 2) === 2) {
        const assign = doubleDeskAssignments.get(d.deskId);
        return {
          ...d,
          studentId: assign?.s1 ?? null,
          studentId2: assign?.s2 ?? null
        };
      } else {
        return {
          ...d,
          studentId: singleDeskAssignments.get(d.deskId) ?? null,
          studentId2: null
        };
      }
    }));

    showToast(
      language === 'km' 
        ? 'បានរៀបគូសិស្សពូកែជួយសិស្សខ្សោយអង្គុយជាមួយគ្នា (Peer Study Buddies)' 
        : 'Arranged peer-mentoring study partners at each desk', 
      'success'
    );
  };

  // 3. Same Gender Pairing (Girls with Girls, Boys with Boys)
  const autoArrangeSameGender = () => {
    const girls = [...classStudents.filter(s => s.gender === 'Female')];
    const boys = [...classStudents.filter(s => s.gender === 'Male')];

    const doubleDesks = desks.filter(d => (d.capacity ?? 2) === 2);
    const singleDesks = desks.filter(d => (d.capacity ?? 2) === 1);

    const doubleDeskAssignments = new Map<string, { s1: string | null; s2: string | null }>();
    doubleDesks.forEach(d => {
      if (girls.length >= 2) {
        doubleDeskAssignments.set(d.deskId, { s1: girls.shift()!.id, s2: girls.shift()!.id });
      } else if (boys.length >= 2) {
        doubleDeskAssignments.set(d.deskId, { s1: boys.shift()!.id, s2: boys.shift()!.id });
      } else {
        const s1 = girls.shift() || boys.shift();
        const s2 = girls.shift() || boys.shift();
        doubleDeskAssignments.set(d.deskId, { s1: s1 ? s1.id : null, s2: s2 ? s2.id : null });
      }
    });

    const remaining = [...girls, ...boys];
    const singleDeskAssignments = new Map<string, string | null>();
    singleDesks.forEach(d => {
      singleDeskAssignments.set(d.deskId, remaining.shift()?.id ?? null);
    });

    setDesks(prev => prev.map(d => {
      if ((d.capacity ?? 2) === 2) {
        const assign = doubleDeskAssignments.get(d.deskId);
        return {
          ...d,
          studentId: assign?.s1 ?? null,
          studentId2: assign?.s2 ?? null
        };
      } else {
        return {
          ...d,
          studentId: singleDeskAssignments.get(d.deskId) ?? null,
          studentId2: null
        };
      }
    }));

    showToast(language === 'km' ? 'បានរៀបតុប្រុស-ប្រុស ស្រី-ស្រី គូគ្នា' : 'Arranged same-gender pairs', 'info');
  };

  // 4. Alphabetical / Student ID Order
  const autoArrangeAlphabetical = () => {
    const sorted = [...classStudents].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    let studentIdx = 0;

    setDesks(prev => prev.map(d => {
      const s1 = sorted[studentIdx++]?.id ?? null;
      const s2 = (d.capacity ?? 2) === 2 ? (sorted[studentIdx++]?.id ?? null) : null;
      return {
        ...d,
        studentId: s1,
        studentId2: s2
      };
    }));

    showToast(language === 'km' ? 'បានរៀបតាមលំដាប់ឈ្មោះអក្ខរក្រម' : 'Arranged alphabetically by student name', 'info');
  };

  // 5. Random Shuffle
  const autoArrangeRandom = () => {
    const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
    let studentIdx = 0;

    setDesks(prev => prev.map(d => {
      const s1 = shuffled[studentIdx++]?.id ?? null;
      const s2 = (d.capacity ?? 2) === 2 ? (shuffled[studentIdx++]?.id ?? null) : null;
      return {
        ...d,
        studentId: s1,
        studentId2: s2
      };
    }));

    showToast(language === 'km' ? 'បានរៀបតុដោយចៃដន្យ' : 'Randomly shuffled classroom seating', 'info');
  };

  // 6. Clear All Desks
  const handleClearAllDesks = () => {
    setDesks(prev => prev.map(d => ({ ...d, studentId: null, studentId2: null })));
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
                  {columns} ជួរឈរ x {rows} ជួរដេក ({totalDesks} តុ • {totalSeats} កៅអី)
                </span>

                {/* Class Switcher for Multi-Class / Admin */}
                {classes.length > 1 && (
                  <div className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-indigo-200/80 dark:border-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-slate-300">
                      {language === 'km' ? 'ប្តូរថ្នាក់៖' : 'Class:'}
                    </span>
                    <select
                      value={activeClassId}
                      onChange={(e) => setActiveClassId(e.target.value)}
                      className="bg-transparent text-xs font-black text-indigo-950 dark:text-white outline-none cursor-pointer pr-1"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c.nameKm || c.name} ({(c.studentIds || []).length} នាក់)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km'
                  ? `${schoolProfile?.schoolNameKm || activeClass?.schoolNameKm} • ថ្នាក់រៀន៖ ${activeClass?.nameKm || activeClass?.name} • បានរៀបចំ៖ ${seatedCount} / ${classStudents.length} នាក់ (តុគូ៖ ${doubleDesksCount} តុ • តុទោល៖ ${singleDesksCount} តុ)`
                  : `Class: ${activeClass?.name} • Seated: ${seatedCount} / ${classStudents.length} • Double: ${doubleDesksCount} • Single: ${singleDesksCount}`}
              </p>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Arrange Dropdown / Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={autoArrangePeerSupport}
                title={language === 'km' ? 'ផ្គូផ្គងសិស្សពូកែជួយសិស្សខ្សោយអង្គុយជាមួយគ្នា (Peer Mentoring)' : 'Peer Mentoring (Strong + Need help)'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'km' ? 'សិស្សពូកែជួយខ្សោយ' : 'Peer Pair'}</span>
              </button>

              <button
                onClick={autoArrangeBoyGirl}
                title={language === 'km' ? 'រៀបប្រុស-ស្រីអង្គុយគូគ្នា' : 'Pair Boy + Girl together'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'km' ? 'ប្រុស-ស្រីគូគ្នា' : 'Boy/Girl Pair'}</span>
              </button>

              <button
                onClick={autoArrangeSameGender}
                title={language === 'km' ? 'រៀបប្រុស-ប្រុស ស្រី-ស្រី គូគ្នា' : 'Pair Boys together and Girls together'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-pink-500" />
                <span>{language === 'km' ? 'ប្រុស-ប្រុស/ស្រី-ស្រី' : 'Same Gender'}</span>
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

            {/* Full Interface Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullWidth(!isFullWidth)}
              title={language === 'km' ? 'ពង្រីកពេញ interface កុំឱ្យទាញ scroll bar ទៅមក' : 'Optimize to fit interface without horizontal scrolling'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                isFullWidth
                  ? 'bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              {isFullWidth ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              <span>{isFullWidth ? (language === 'km' ? 'ប្លង់ធម្មតា' : 'Standard View') : (language === 'km' ? 'ពង្រីកពេញ Interface' : 'Fit Screen')}</span>
            </button>

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

        {/* 2. SCHOOL CUSTOM LAYOUT SELECTOR & CAPACITY PRESETS */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Direct 1-Click Cambodian Classroom Presets & Bulk Desk Capacity */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-1">
                <ColumnsIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ទម្រង់តុ៖' : 'Layout & Capacity:'}</span>
              </span>

              {/* Preset: 6 Rows x 4 Columns */}
              <button
                type="button"
                onClick={() => handleAdjustGrid(6, 4)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  rows === 6 && columns === 4
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {rows === 6 && columns === 4 && <Check className="w-3.5 h-3.5" />}
                <span>{language === 'km' ? '៦ ជួរដេក x ៤ ជួរឈរ (២៤ តុ)' : '6R x 4C (24 Desks)'}</span>
              </button>

              {/* Preset: 7 Rows x 4 Columns */}
              <button
                type="button"
                onClick={() => handleAdjustGrid(7, 4)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  rows === 7 && columns === 4
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {rows === 7 && columns === 4 && <Check className="w-3.5 h-3.5" />}
                <span>{language === 'km' ? '៧ ជួរដេក x ៤ ជួរឈរ (២៨ តុ) ★' : '7R x 4C (28 Desks) ★'}</span>
              </button>

              {/* Bulk Desk Capacity Switcher */}
              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ml-1">
                <button
                  type="button"
                  onClick={() => setAllDesksCapacity(2)}
                  title={language === 'km' ? 'កំណត់តុទាំងអស់ជាតុគូ (ដាក់សិស្ស២នាក់ក្នុង១តុ)' : 'Set all desks as double desks (2 students each)'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    doubleDesksCount === totalDesks
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>{language === 'km' ? 'តុគូទាំងអស់ (២ នាក់/តុ)' : 'All 2-Students'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllDesksCapacity(1)}
                  title={language === 'km' ? 'កំណត់តុទាំងអស់ជាតុទោល (ដាក់សិស្សតែម្នាក់ក្នុង១តុ)' : 'Set all desks as single desks (1 student each)'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    singleDesksCount === totalDesks
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{language === 'km' ? 'តុទោលទាំងអស់ (១ នាក់/តុ)' : 'All 1-Student'}</span>
                </button>
              </div>

              {/* Desk spacing style */}
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
                  {language === 'km' ? 'ច្រកកណ្ដាល' : 'Center Aisle'}
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
                  {language === 'km' ? 'ស្មើជួរ' : 'Even Grid'}
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
      <div className={isFullWidth ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}>
        {/* LEFT / MAIN FLOOR (Full width or 3 columns) */}
        <div className={isFullWidth ? 'w-full space-y-4' : 'lg:col-span-3 space-y-4'}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-2xs relative print:p-0 print:border-none print:shadow-none transition-colors">
            
            {/* OFFICIAL PRINT HEADER (Only visible when printing) */}
            <div className="hidden print:block text-center pb-5 border-b-2 border-slate-900 mb-6 text-slate-900">
              <div className="flex justify-between items-start text-xs font-semibold mb-3">
                <div className="text-left flex items-center space-x-3 mt-6">
                  <SchoolLogo size={46} customLogoUrl={schoolProfile?.logoUrl || activeClass?.logoUrl} />
                  <div>
                    <p className="font-extrabold text-sm uppercase">
                      {schoolProfile?.schoolNameKm || activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង'}
                    </p>
                    <p className="text-slate-600 text-xs font-medium">
                      {schoolProfile?.district || activeClass?.district || 'ស្រុកស្ទឹងត្រង់'} • {schoolProfile?.province || activeClass?.province || 'ខេត្តកំពង់ចាម'}
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
                    {language === 'km' ? `ឆ្នាំសិក្សា៖ ${schoolProfile?.academicYear || activeClass?.academicYear || '២០២៦-២០២៧'}` : `Year: ${schoolProfile?.academicYear || activeClass?.academicYear || '2026-2027'}`}
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
            <div className="mb-4 text-center space-y-2">
              <div className="max-w-md mx-auto py-2.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-emerald-100 shadow-md border-3 border-amber-900/30 flex items-center justify-center space-x-2">
                <span className="text-xs font-heading font-black tracking-widest uppercase">
                  {language === 'km' ? 'ក្តារខៀន / ក្តារអេក្រង់ (BLACKBOARD)' : 'CLASSROOM BLACKBOARD'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>🚪 {language === 'km' ? 'ទ្វារចូលថ្នាក់រៀន' : 'Main Entrance Door'}</span>
                <div className="px-3.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
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
                      ? `បានជ្រើសរើស៖ «${classStudents.find(s => s.id === selectedStudentForPlacement)?.name}» — សូមចុចលើកៅអីដែលចង់ដាក់ ឬប្តូរវេន`
                      : `Selected: «${classStudents.find(s => s.id === selectedStudentForPlacement)?.name}» — Click any seat slot to place or swap`}
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
            {/* DESKS FLOOR: ZERO HORIZONTAL SCROLL RESPONSIVE GRID */}
            {/* ================================================================= */}
            <div className="w-full pb-2">
              <div className="w-full">
                
                {/* COLUMN HEADERS */}
                <div className="mb-2.5 w-full">
                  <div className="flex items-center justify-center gap-1 sm:gap-2 text-center w-full">
                    {/* Left Row spacer matching row badge width */}
                    <div className="w-6 sm:w-8 shrink-0"></div>

                    {/* Columns Header Badges */}
                    <div className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2">
                      {Array.from({ length: columns }).map((_, cIdx) => {
                        const isCenterAisle = arrangement === 'pairs' && columns === 4 && cIdx === 1;

                        return (
                          <React.Fragment key={`col_hdr_${cIdx}`}>
                            <div className="flex-1 min-w-0 px-1 sm:px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                              <span className="text-[10px] sm:text-[11px] font-black text-indigo-700 dark:text-indigo-400 block tracking-tight truncate">
                                {language === 'km' ? `ជួរឈរ ${toKhmerNum(cIdx + 1)}` : `Col ${cIdx + 1}`}
                              </span>
                            </div>

                            {/* Center Aisle Indicator between Column 2 and Column 3 */}
                            {isCenterAisle && (
                              <div className="w-2 sm:w-4 text-center flex flex-col items-center justify-center shrink-0">
                                <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase hidden md:inline">
                                  {language === 'km' ? 'ច្រក' : 'Aisle'}
                                </span>
                                <div className="h-3 w-0.5 bg-amber-400/80 rounded-full"></div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Right Row spacer */}
                    <div className="w-6 sm:w-8 shrink-0"></div>
                  </div>
                </div>

                {/* DESKS ROWS: Rows 1 to rows */}
                <div className="space-y-2 sm:space-y-2.5 w-full">
                  {Array.from({ length: rows }).map((_, rIdx) => {
                    const rowDesks = desks.filter(d => d.row === rIdx).sort((a, b) => a.col - b.col);

                    return (
                      <div key={`row_${rIdx}`} className="flex items-center justify-center gap-1 sm:gap-2 w-full">
                        {/* LEFT ROW BADGE */}
                        <div className="w-6 sm:w-8 text-right shrink-0">
                          <span className="inline-block px-1 sm:px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[8px] sm:text-[9px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {language === 'km' ? `ជួរ ${toKhmerNum(rIdx + 1)}` : `R${rIdx + 1}`}
                          </span>
                        </div>

                        {/* DESKS IN THIS ROW */}
                        <div className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2">
                          {rowDesks.map((desk, cIdx) => {
                            const isDouble = (desk.capacity ?? 2) === 2;
                            const student1 = classStudents.find(s => s.id === desk.studentId);
                            const student2 = isDouble ? classStudents.find(s => s.id === desk.studentId2) : null;
                            const isCenterAisle = arrangement === 'pairs' && columns === 4 && cIdx === 1;

                            // Occupancy counts for this desk
                            const occupiedCount = (student1 ? 1 : 0) + (student2 ? 1 : 0);
                            const maxSeats = isDouble ? 2 : 1;

                            return (
                              <React.Fragment key={desk.deskId}>
                                <div 
                                  className="flex-1 min-w-0 relative rounded-xl sm:rounded-2xl border-2 transition-all p-1 sm:p-1.5 flex flex-col justify-between select-none print:shadow-none print:border-slate-700 min-h-[94px] sm:min-h-[104px] bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 shadow-2xs hover:shadow-xs"
                                >
                                  {/* DESK HEADER BAR: Coordinates + Capacity Toggle + Occupancy Badge */}
                                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 gap-0.5">
                                    <div className="flex items-center space-x-1 min-w-0">
                                      <span className="text-[8px] sm:text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded shrink-0">
                                        {toKhmerNum(rIdx + 1)}-{toKhmerNum(cIdx + 1)}
                                      </span>

                                      {/* Desk Capacity Toggle Button (តុគូ ២ នាក់ vs តុទោល ១ នាក់) */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleDeskCapacity(desk.deskId);
                                        }}
                                        title={
                                          isDouble
                                            ? (language === 'km' ? 'តុគូ (២ នាក់) — ចុចដើម្បីប្តូរជាតុទោល (១ នាក់)' : 'Double Desk (2 seats) — Click to make single')
                                            : (language === 'km' ? 'តុទោល (១ នាក់) — ចុចដើម្បីប្តូរជាតុគូ (២ នាក់)' : 'Single Desk (1 seat) — Click to make double')
                                        }
                                        className={`no-print inline-flex items-center space-x-0.5 px-1 py-0.2 rounded text-[8px] font-black tracking-tight transition cursor-pointer shrink-0 ${
                                          isDouble
                                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60'
                                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60'
                                        }`}
                                      >
                                        {isDouble ? <Users className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                                        <span className="hidden sm:inline">{isDouble ? (language === 'km' ? 'តុគូ' : '2') : (language === 'km' ? 'តុទោល' : '1')}</span>
                                      </button>
                                    </div>

                                    {/* Occupancy Badge */}
                                    <span className={`text-[8px] font-mono font-black px-1 py-0.2 rounded shrink-0 ${
                                      occupiedCount === maxSeats
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : occupiedCount > 0
                                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                          : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                    }`}>
                                      {occupiedCount}/{maxSeats}
                                    </span>
                                  </div>

                                  {/* SEAT SLOTS: 2 seats side-by-side if capacity==2, or 1 seat full-width if capacity==1 */}
                                  {isDouble ? (
                                    <div className="grid grid-cols-2 gap-1 mt-1 flex-1 w-full">
                                      {/* SLOT 1 (LEFT SEAT) */}
                                      <SeatSlotCard
                                        desk={desk}
                                        slot={1}
                                        slotLabel={language === 'km' ? 'កៅអី ១' : 'Seat 1'}
                                        student={student1}
                                        isSelected={Boolean(selectedStudentForPlacement && desk.studentId === selectedStudentForPlacement)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDropOnSlot(e, desk.deskId, 1)}
                                        onClick={() => handleSlotClick(desk, 1)}
                                        onDragStart={(e) => student1 && handleDragStartFromSlot(e, student1.id, desk.deskId, 1)}
                                        onRemove={() => removeStudentFromSlot(desk.deskId, 1)}
                                        language={language}
                                      />

                                      {/* SLOT 2 (RIGHT SEAT) */}
                                      <SeatSlotCard
                                        desk={desk}
                                        slot={2}
                                        slotLabel={language === 'km' ? 'កៅអី ២' : 'Seat 2'}
                                        student={student2}
                                        isSelected={Boolean(selectedStudentForPlacement && desk.studentId2 === selectedStudentForPlacement)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDropOnSlot(e, desk.deskId, 2)}
                                        onClick={() => handleSlotClick(desk, 2)}
                                        onDragStart={(e) => student2 && handleDragStartFromSlot(e, student2.id, desk.deskId, 2)}
                                        onRemove={() => removeStudentFromSlot(desk.deskId, 2)}
                                        language={language}
                                      />
                                    </div>
                                  ) : (
                                    /* SINGLE DESK (1 FULL-WIDTH SEAT) */
                                    <div className="mt-1 flex-1 w-full">
                                      <SeatSlotCard
                                        desk={desk}
                                        slot={1}
                                        slotLabel={language === 'km' ? 'កៅអីទោល' : 'Single Seat'}
                                        student={student1}
                                        isSelected={Boolean(selectedStudentForPlacement && desk.studentId === selectedStudentForPlacement)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDropOnSlot(e, desk.deskId, 1)}
                                        onClick={() => handleSlotClick(desk, 1)}
                                        onDragStart={(e) => student1 && handleDragStartFromSlot(e, student1.id, desk.deskId, 1)}
                                        onRemove={() => removeStudentFromSlot(desk.deskId, 1)}
                                        language={language}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Center Aisle Divider between Column 2 and Column 3 */}
                                {isCenterAisle && (
                                  <div className="w-1.5 sm:w-2.5 h-full flex items-center justify-center shrink-0">
                                    <div className="h-10 sm:h-12 w-0.5 bg-amber-400/60 dark:bg-amber-500/40 rounded-full"></div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* RIGHT ROW BADGE */}
                        <div className="w-6 sm:w-8 text-left shrink-0">
                          <span className="inline-block px-1 sm:px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[8px] sm:text-[9px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {language === 'km' ? `ជួរ ${toKhmerNum(rIdx + 1)}` : `R${rIdx + 1}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* CLASSROOM REAR LABEL */}
            <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
              ⬇️ {language === 'km' ? 'ក្រោយថ្នាក់រៀន (Rear of Classroom)' : 'Rear of Classroom'}
            </div>

            {/* PRINT SIGNATURE FOOTER */}
            <div className="hidden print:block mt-10 pt-6 border-t border-slate-300 text-slate-900">
              <div className="flex justify-between items-start text-xs font-semibold px-4">
                <div className="text-center w-64 mt-6">
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

        {/* UNASSIGNED ROSTER: SIDEBAR (Standard mode) OR BOTTOM TRAY (Full interface mode) */}
        {!isFullWidth ? (
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
                  ? 'ចាប់ទាញ (Drag) សិស្សខាងក្រោមទៅដាក់លើកៅអីតុ ឬចុចលើឈ្មោះដើម្បីរៀបចំ'
                  : 'Drag students into an empty seat or click to select and place.'}
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
        ) : (
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDropOnUnassignedSidebar}
            className="no-print w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                  {language === 'km' ? 'សិស្សមិនទាន់មានតុ (ចុចលើឈ្មោះ ឬចាប់ទាញដាក់លើកៅអី)' : 'Unassigned Students (Click or Drag to seat)'}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                unassignedStudents.length === 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                {unassignedStudents.length} នាក់
              </span>
            </div>

            {/* Horizontal wrap list of unassigned students */}
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {unassignedStudents.length === 0 ? (
                <div className="w-full py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'km' ? 'សិស្សទាំងអស់មានកន្លែងអង្គុយគ្រប់គ្នា!' : 'All students are seated!'}
                  </span>
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
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 select-none ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${student.gender === 'Female' ? 'bg-rose-500' : 'bg-indigo-500'}`}></span>
                      <span className="font-bold text-xs">{student.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        ({student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'})
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: SEAT SLOT CARD (Handles Left / Right or Single Seat)
// =========================================================================
interface SeatSlotCardProps {
  desk: DeskPosition;
  slot: 1 | 2;
  slotLabel: string;
  student: Student | undefined | null;
  isSelected: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onRemove: () => void;
  language: string;
}

const SeatSlotCard: React.FC<SeatSlotCardProps> = ({
  slotLabel,
  student,
  isSelected,
  onDragOver,
  onDrop,
  onClick,
  onDragStart,
  onRemove,
  language
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      draggable={Boolean(student)}
      onDragStart={onDragStart}
      className={`relative h-20 rounded-xl border transition-all cursor-pointer flex flex-col justify-between p-1.5 select-none print:shadow-none print:border-slate-400 ${
        student
          ? student.gender === 'Female'
            ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
            : 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400'
          : 'bg-slate-50/80 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/30'
      } ${
        isSelected ? 'ring-2 ring-indigo-500 scale-102 shadow-md z-10' : 'shadow-2xs'
      }`}
    >
      {student ? (
        <>
          {/* Top Row: Gender Tag & Remove Button */}
          <div className="flex items-center justify-between">
            <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase tracking-tight ${
              student.gender === 'Female'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
            }`}>
              {student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              title={language === 'km' ? 'ដកចេញពីកៅអី' : 'Remove from seat'}
              className="no-print w-3.5 h-3.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center transition"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Center: Khmer Name & ID */}
          <div className="text-center my-auto px-0.5">
            <p className="font-heading font-black text-[11px] sm:text-xs text-slate-900 dark:text-white truncate leading-tight">
              {student.name}
            </p>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {student.studentId}
            </p>
          </div>

          {/* Bottom: Conduct or Slot Label */}
          <div className="flex items-center justify-between text-[8px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="truncate max-w-[70px]">
              {formatConductRating(student.conductRating, language)}
            </span>
            <Move className="w-2 h-2 opacity-40 no-print shrink-0" />
          </div>
        </>
      ) : (
        /* EMPTY SEAT SLOT */
        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-0.5">
          <Plus className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[9px] font-bold text-center leading-tight">
            {slotLabel}
          </span>
        </div>
      )}
    </div>
  );
};
