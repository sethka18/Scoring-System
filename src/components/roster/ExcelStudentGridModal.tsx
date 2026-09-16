import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Clipboard, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  RefreshCw,
  Info,
  Check,
  ArrowDown
} from 'lucide-react';
import { useGradebook } from '../../context/GradebookContext';
import { Gender, Student } from '../../types';

interface ExcelRow {
  id: string; // unique key for row
  studentId: string;
  name: string;
  gender: Gender;
  dob: string;
  guardianName: string;
  guardianPhone: string;
  birthPlace: string;
  notes: string;
}

interface ExcelStudentGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClassId?: string;
}

export const ExcelStudentGridModal: React.FC<ExcelStudentGridModalProps> = ({
  isOpen,
  onClose,
  targetClassId
}) => {
  const { 
    classes, 
    activeClassId, 
    addStudentsBatch, 
    language, 
    showToast 
  } = useGradebook();

  const selectedClassId = targetClassId || activeClassId;
  const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const classPrefix = targetClass?.name?.replace(/[^0-9A-Za-z]/g, '') || '01';

  // Generate initial blank rows
  const createBlankRow = (index: number): ExcelRow => ({
    id: `row_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`,
    studentId: `STU-${classPrefix}-${(index + 1).toString().padStart(2, '0')}`,
    name: '',
    gender: 'Male',
    dob: '',
    guardianName: '',
    guardianPhone: '',
    birthPlace: '',
    notes: ''
  });

  const [rows, setRows] = useState<ExcelRow[]>(() => {
    return Array.from({ length: 8 }, (_, i) => createBlankRow(i));
  });

  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [showPasteHelper, setShowPasteHelper] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(selectedClassId);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const nameInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  // Handlers for cell editing
  const handleCellChange = (rowIndex: number, field: keyof ExcelRow, value: any) => {
    setRows(prev => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [field]: value };
      return next;
    });
  };

  // Keyboard navigation on Enter
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < rows.length - 1) {
        // Focus next row's name input
        nameInputRefs.current[rowIndex + 1]?.focus();
      } else {
        // Add new row and focus it
        const newRow = createBlankRow(rows.length);
        setRows(prev => [...prev, newRow]);
        setTimeout(() => {
          nameInputRefs.current[rows.length]?.focus();
        }, 50);
      }
    }
  };

  // Row operations
  const addRows = (count: number) => {
    setRows(prev => {
      const startIndex = prev.length;
      const newItems = Array.from({ length: count }, (_, i) => createBlankRow(startIndex + i));
      return [...prev, ...newItems];
    });
    showToast(
      language === 'km' 
        ? `បានបន្ថែម ${count} ជួរដេកថ្មី` 
        : `Added ${count} new rows`,
      'info'
    );
  };

  const removeRow = (index: number) => {
    setRows(prev => {
      if (prev.length <= 1) {
        return [createBlankRow(0)];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const cleanEmptyRows = () => {
    setRows(prev => {
      const filtered = prev.filter(r => r.name.trim().length > 0 || r.guardianName.trim().length > 0);
      if (filtered.length === 0) {
        return Array.from({ length: 5 }, (_, i) => createBlankRow(i));
      }
      return filtered;
    });
    showToast(
      language === 'km' 
        ? 'បានសម្អាតជួរដេកទទេរួចរាល់' 
        : 'Cleaned empty rows',
      'info'
    );
  };

  const clearAllRows = () => {
    if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់សម្អាតទិន្នន័យក្នុងតារាងទាំងអស់មែនទេ?' : 'Clear all entered data?')) {
      setRows(Array.from({ length: 8 }, (_, i) => createBlankRow(i)));
    }
  };

  const autoReNumberIDs = () => {
    setRows(prev => prev.map((row, idx) => ({
      ...row,
      studentId: `STU-${classPrefix}-${(idx + 1).toString().padStart(2, '0')}`
    })));
    showToast(
      language === 'km' ? 'បានកំណត់អត្តលេខសិស្សឡើងវិញជោគជ័យ' : 'Auto-numbered Student IDs',
      'success'
    );
  };

  // Smart Parse from Text / Excel Clipboard
  const handleParsePastedText = (rawText: string) => {
    if (!rawText.trim()) return;

    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return;

    const parsed: ExcelRow[] = [];

    // Check if line 0 is a header
    const firstLineLower = lines[0].toLowerCase();
    const hasHeader = 
      firstLineLower.includes('ឈ្មោះ') || 
      firstLineLower.includes('name') || 
      firstLineLower.includes('ភេទ') || 
      firstLineLower.includes('gender') || 
      firstLineLower.includes('ល.រ') ||
      firstLineLower.includes('id') ||
      firstLineLower.includes('អត្តលេខ');

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split by tab (\t) if present, else comma (,)
      const cells = line.includes('\t') 
        ? line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''))
        : line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

      if (cells.length === 0 || cells.every(c => c === '')) continue;

      let studentId = '';
      let name = '';
      let gender: Gender = 'Male';
      let dob = '';
      let guardianName = '';
      let guardianPhone = '';
      let birthPlace = '';
      let notes = '';

      // Normalize gender helper
      const parseGender = (val: string): Gender => {
        const v = val.toLowerCase().trim();
        if (v === 'ស្រី' || v === 'ស' || v === 'female' || v === 'f' || v === 'girl' || v === '2') {
          return 'Female';
        }
        return 'Male';
      };

      // Format date helper: converts DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
      const parseDate = (val: string): string => {
        const cleaned = val.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
        const ddmmyyyy = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (ddmmyyyy) {
          const day = ddmmyyyy[1].padStart(2, '0');
          const month = ddmmyyyy[2].padStart(2, '0');
          const year = ddmmyyyy[3];
          return `${year}-${month}-${day}`;
        }
        return cleaned;
      };

      // Intelligent mapping based on cell count
      if (cells.length === 1) {
        // Just name
        name = cells[0];
      } else if (cells.length === 2) {
        // Could be (No, Name) or (Name, Gender)
        if (/^\d+$/.test(cells[0])) {
          name = cells[1];
        } else {
          name = cells[0];
          gender = parseGender(cells[1]);
        }
      } else if (cells.length === 3) {
        // (No/ID, Name, Gender) OR (Name, Gender, DOB)
        if (/^stu|^\d+/i.test(cells[0])) {
          studentId = cells[0];
          name = cells[1];
          gender = parseGender(cells[2]);
        } else {
          name = cells[0];
          gender = parseGender(cells[1]);
          dob = parseDate(cells[2]);
        }
      } else {
        // 4 or more cells:
        // Format A: No, ID, Name, Gender, DOB, Parent, Phone, Address, Notes
        // Format B: ID/No, Name, Gender, DOB, Parent, Phone, Address
        let colIndex = 0;
        
        // Skip row number if it's purely 1, 2, 3...
        if (/^\d+$/.test(cells[0]) && cells[0].length <= 3 && cells.length >= 4) {
          colIndex = 1;
        }

        if (colIndex < cells.length && (cells[colIndex].toUpperCase().startsWith('STU') || /^[A-Z0-9-]{3,}$/i.test(cells[colIndex]))) {
          studentId = cells[colIndex];
          colIndex++;
        }

        if (colIndex < cells.length) {
          name = cells[colIndex];
          colIndex++;
        }

        if (colIndex < cells.length) {
          gender = parseGender(cells[colIndex]);
          colIndex++;
        }

        if (colIndex < cells.length) {
          dob = parseDate(cells[colIndex]);
          colIndex++;
        }

        if (colIndex < cells.length) {
          guardianName = cells[colIndex];
          colIndex++;
        }

        if (colIndex < cells.length) {
          guardianPhone = cells[colIndex];
          colIndex++;
        }

        if (colIndex < cells.length) {
          birthPlace = cells[colIndex];
          colIndex++;
        }

        if (colIndex < cells.length) {
          notes = cells[colIndex];
          colIndex++;
        }
      }

      const rowIdx = parsed.length;
      parsed.push({
        id: `row_pasted_${Date.now()}_${rowIdx}`,
        studentId: studentId || `STU-${classPrefix}-${(rowIdx + 1).toString().padStart(2, '0')}`,
        name: name.trim(),
        gender,
        dob: dob.trim(),
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        birthPlace: birthPlace.trim(),
        notes: notes.trim()
      });
    }

    if (parsed.length > 0) {
      setRows(parsed);
      setShowPasteHelper(false);
      setPasteText('');
      showToast(
        language === 'km' 
          ? `បានបិទភ្ជាប់ និងវិភាគសិស្សចំនួន ${parsed.length} ជោគជ័យ!` 
          : `Successfully imported ${parsed.length} rows from clipboard!`,
        'success'
      );
    } else {
      showToast(
        language === 'km' ? 'រកមិនឃើញទិន្នន័យសិស្សត្រឹមត្រូវឡើយ' : 'No valid student data found',
        'warning'
      );
    }
  };

  // Download Sample Template for Excel
  const downloadExcelTemplate = () => {
    const csvContent = 
      "\uFEFF" +
      "ល.រ,អត្តលេខ,គោត្តនាម និងនាម,ភេទ,ថ្ងៃខែឆ្នាំកំណើត,ឈ្មោះអាណាព្យាបាល,លេខទូរស័ព្ទ,ទីកន្លែងកំណើត,ចំណាំ\n" +
      "1,STU-601,ចាន់ សុខា,ប្រុស,2014-03-15,ចាន់ សុខ,012345678,ភ្នំពេញ,សិស្សពូកែគណិត\n" +
      "2,STU-602,សុខ គន្ធា,ស្រី,2014-05-20,សុខ គង់,098765432,កណ្តាល,សិស្សពូកែអក្សរសាស្ត្រ\n" +
      "3,STU-603,កែវ ពិសិដ្ឋ,ប្រុស,2014-07-10,កែវ ពិសាល,088123456,ស្ទឹងត្រែង,";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `គំរូបញ្ចូលសិស្ស_Excel_${targetClass?.name || 'Class'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Validation & Statistics
  const validRows = rows.filter(r => r.name.trim().length > 0);
  const maleCount = validRows.filter(r => r.gender === 'Male').length;
  const femaleCount = validRows.filter(r => r.gender === 'Female').length;
  const incompleteRowsCount = rows.filter(r => !r.name.trim() && (r.guardianName.trim() || r.guardianPhone.trim() || r.dob.trim())).length;

  // Save to class
  const handleSaveToClass = () => {
    if (validRows.length === 0) {
      showToast(
        language === 'km' 
          ? 'សូមបញ្ចូលឈ្មោះសិស្សយ៉ាងហោចណាស់ម្នាក់ មុននឹងរក្សាទុក!' 
          : 'Please enter at least one student name before saving!',
        'warning'
      );
      return;
    }

    const studentsToSave: Omit<Student, 'id'>[] = validRows.map((r, idx) => ({
      studentId: r.studentId.trim() || `STU-${classPrefix}-${(idx + 1).toString().padStart(2, '0')}`,
      name: r.name.trim(),
      gender: r.gender,
      dob: r.dob.trim() || '2014-01-01',
      guardianName: r.guardianName.trim(),
      guardianPhone: r.guardianPhone.trim(),
      birthPlace: r.birthPlace.trim(),
      notes: r.notes.trim(),
      behaviorScore: 5,
      conductRating: 'ល្អ',
      attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 }
    }));

    addStudentsBatch(studentsToSave, selectedClass, importMode === 'replace');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {language === 'km' ? 'បញ្ចូលសិស្សបែប Excel (Excel Spreadsheet Matrix)' : 'Excel Student Matrix Entry'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {language === 'km' ? 'បញ្ចូលច្រើននាក់រហ័ស' : 'Fast Batch Entry'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'វាយបញ្ចូលផ្ទាល់ក្នុងតារាង ឬចម្លងពី Excel/Sheets មកបិទភ្ជាប់ (Paste) ដោយមិនបាច់ចុចម្តងម្នាក់ឡើយ' 
                  : 'Type directly in the grid or paste rows from Excel / Google Sheets without repetitive clicking'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics & Target Class Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Target class and mode */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-600 dark:text-slate-400">
                {language === 'km' ? 'ថ្នាក់គោលដៅ:' : 'Target Class:'}
              </span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameKm || c.name} ({c.studentIds?.length || 0} នាក់)
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            {/* Mode: Append or Replace */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="importModeModal"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>{language === 'km' ? 'បន្ថែមលើសិស្សចាស់ (Append)' : 'Append'}</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer font-semibold text-rose-600 dark:text-rose-400">
                <input
                  type="radio"
                  name="importModeModal"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>{language === 'km' ? 'ជំនួសសិស្សទាំងអស់ (Replace)' : 'Replace All'}</span>
              </label>
            </div>
          </div>

          {/* Quick validation summary counters */}
          <div className="flex items-center space-x-2 font-bold">
            <div className="flex items-center space-x-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'km' ? 'សិស្សត្រៀមបញ្ចូល:' : 'Ready:'} {validRows.length} នាក់</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1">
                (ប្រុស {maleCount} / ស្រី {femaleCount})
              </span>
            </div>

            {incompleteRowsCount > 0 && (
              <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'km' ? `ខ្វះឈ្មោះ: ${incompleteRowsCount}` : `Missing Name: ${incompleteRowsCount}`}</span>
              </div>
            )}
          </div>
        </div>

        {/* Excel-style Toolbar Ribbon */}
        <div className="px-5 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setShowPasteHelper(!showPasteHelper)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              title="Copy rows from Excel or Google Sheets and paste here"
            >
              <Clipboard className="w-4 h-4" />
              <span>{language === 'km' ? '📋 ចម្លងបិទភ្ជាប់ពី Excel / Sheets' : '📋 Paste from Excel / Sheets'}</span>
            </button>

            <button
              onClick={() => addRows(5)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ ៥ ជួរ</span>
            </button>

            <button
              onClick={() => addRows(10)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ ១០ ជួរ</span>
            </button>

            <button
              onClick={autoReNumberIDs}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
              title="Re-generate sequential STU IDs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'km' ? 'កំណត់អត្តលេខឡើងវិញ' : 'Auto IDs'}</span>
            </button>

            <button
              onClick={cleanEmptyRows}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
              title="Remove rows with no student name"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'km' ? 'សម្អាតជួរទទេ' : 'Clean Empty'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={downloadExcelTemplate}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition"
              title="Download empty CSV template for Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ទាញយកគំរូ Excel' : 'Excel Template'}</span>
            </button>

            <button
              onClick={clearAllRows}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition"
              title="Clear all rows"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'សម្អាតទាំងអស់' : 'Clear'}</span>
            </button>
          </div>
        </div>

        {/* Quick Paste from Excel / Google Sheets Drawer */}
        {showPasteHelper && (
          <div className="p-4 bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <Clipboard className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'km' ? 'ចម្លងទិន្នន័យពី Excel / Google Sheets រួចចុចបិទភ្ជាប់ (Ctrl+V) នៅទីនេះ៖' : 'Copy rows from Excel or Google Sheets and Paste (Ctrl+V) below:'}</span>
                </div>
                <textarea
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`ឧទាហរណ៍ទិន្នន័យចម្លងពី Excel៖\n1\tSTU-601\tចាន់ សុខា\tប្រុស\t2014-03-15\tចាន់ សុខ\t012345678\tភ្នំពេញ\n2\tSTU-602\tសុខ គន្ធា\tស្រី\t2014-05-20\tសុខ គង់\t098765432\tកណ្តាល`}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>💡 គាំទ្រការចម្លងទាំងមាន Header (ចំណងជើង) ឬគ្មាន Header</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => setShowPasteHelper(false)}
                      className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold"
                    >
                      {language === 'km' ? 'បិទ' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleParsePastedText(pasteText)}
                      disabled={!pasteText.trim()}
                      className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition shadow-xs"
                    >
                      {language === 'km' ? 'បញ្ចូលទៅក្នុងតារាង Excel' : 'Insert into Matrix'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The Excel Spreadsheet Table */}
        <div 
          ref={tableContainerRef}
          className="flex-1 overflow-auto bg-slate-100/60 dark:bg-slate-950 p-2 sm:p-3"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 sticky top-0 z-10 select-none border-b border-slate-200 dark:border-slate-700 font-bold">
                <tr>
                  <th className="p-2 w-12 text-center border-r border-slate-200 dark:border-slate-700">#</th>
                  <th className="p-2 w-28 border-r border-slate-200 dark:border-slate-700">
                    {language === 'km' ? 'អត្តលេខ' : 'Student ID'}
                  </th>
                  <th className="p-2 min-w-[180px] border-r border-slate-200 dark:border-slate-700 text-emerald-950 dark:text-emerald-300">
                    <span className="flex items-center space-x-1">
                      <span>{language === 'km' ? 'គោត្តនាម និងនាម' : 'Student Name'}</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </span>
                  </th>
                  <th className="p-2 w-24 text-center border-r border-slate-200 dark:border-slate-700">
                    {language === 'km' ? 'ភេទ' : 'Gender'}
                  </th>
                  <th className="p-2 w-32 border-r border-slate-200 dark:border-slate-700">
                    {language === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត' : 'Date of Birth'}
                  </th>
                  <th className="p-2 min-w-[140px] border-r border-slate-200 dark:border-slate-700">
                    {language === 'km' ? 'អាណាព្យាបាល/ឪពុកម្តាយ' : 'Guardian / Parent'}
                  </th>
                  <th className="p-2 w-32 border-r border-slate-200 dark:border-slate-700">
                    {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}
                  </th>
                  <th className="p-2 min-w-[140px] border-r border-slate-200 dark:border-slate-700">
                    {language === 'km' ? 'ទីកន្លែងកំណើត / អាសយដ្ឋាន' : 'Birthplace / Address'}
                  </th>
                  <th className="p-2 min-w-[120px] border-r border-slate-200 dark:border-slate-700">
                    {language === 'km' ? 'ចំណាំ' : 'Notes'}
                  </th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {rows.map((row, idx) => {
                  const hasName = row.name.trim().length > 0;
                  const isPartiallyFilled = !hasName && (row.guardianName.trim() || row.guardianPhone.trim() || row.dob.trim());

                  return (
                    <tr 
                      key={row.id}
                      className={`hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition ${
                        isPartiallyFilled ? 'bg-amber-50/40 dark:bg-amber-950/20' : idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="p-1.5 text-center text-slate-400 font-mono text-[11px] border-r border-slate-200 dark:border-slate-800">
                        {idx + 1}
                      </td>

                      {/* Student ID */}
                      <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                        <input
                          type="text"
                          value={row.studentId}
                          onChange={(e) => handleCellChange(idx, 'studentId', e.target.value)}
                          placeholder={`STU-${idx + 1}`}
                          className="w-full px-2 py-1 bg-transparent border-0 font-mono text-xs focus:ring-1 focus:ring-emerald-500 rounded"
                        />
                      </td>

                      {/* Student Name (Khmer) */}
                      <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                        <div className="relative flex items-center">
                          <input
                            ref={el => { nameInputRefs.current[idx] = el; }}
                            type="text"
                            value={row.name}
                            onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'name')}
                            placeholder="ឧ. ចាន់ សុខា"
                            className={`w-full px-2.5 py-1 bg-transparent border-0 font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 rounded ${
                              hasName ? 'text-slate-900 dark:text-white' : 'placeholder:text-slate-300 dark:placeholder:text-slate-600'
                            }`}
                          />
                          {hasName && (
                            <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-2 pointer-events-none" />
                          )}
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="p-1 text-center border-r border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleCellChange(idx, 'gender', row.gender === 'Male' ? 'Female' : 'Male')}
                          className={`w-full py-1 px-2 rounded font-bold text-xs transition cursor-pointer ${
                            row.gender === 'Female'
                              ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                          title="ចុចដើម្បីប្តូរភេទ"
                        >
                          {row.gender === 'Female' ? 'ស្រី (F)' : 'ប្រុស (M)'}
                        </button>
                      </td>

                      {/* DOB */}
                      <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                        <input
                          type="text"
                          value={row.dob}
                          onChange={(e) => handleCellChange(idx, 'dob', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'dob')}
                          placeholder="2014-03-15"
                          className="w-full px-2 py-1 bg-transparent border-0 font-mono text-xs focus:ring-1 focus:ring-emerald-500 rounded"
                        />
                      </td>

                      {/* Guardian Name */}
                      <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                        <input
                          type="text"
                          value={row.guardianName}
                          onChange={(e) => handleCellChange(idx, 'guardianName', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'guardianName')}
                          placeholder="ឧ. ចាន់ សុខ"
                          className="w-full px-2 py-1 bg-transparent border-0 text-xs focus:ring-1 focus:ring-emerald-500 rounded"
                        />
                      </td>

                      {/* Phone */}
                      <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                        <input
                          type="text"
                          value={row.guardianPhone}
                          onChange={(e) => handleCellChange(idx, 'guardianPhone', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'guardianPhone')}
                          placeholder="012 345 678"
                          className="w-full px-2 py-1 bg-transparent border-0 font-mono text-xs focus:ring-1 focus:ring-emerald-500 rounded"
                        />
                      </td>

                      {/* Birthplace / Address */}
                      <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                        <input
                          type="text"
                          value={row.birthPlace}
                          onChange={(e) => handleCellChange(idx, 'birthPlace', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'birthPlace')}
                          placeholder="ភូមិ... ឃុំ... ខេត្ត..."
                          className="w-full px-2 py-1 bg-transparent border-0 text-xs focus:ring-1 focus:ring-emerald-500 rounded"
                        />
                      </td>

                      {/* Notes */}
                      <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => handleCellChange(idx, 'notes', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'notes')}
                          placeholder="..."
                          className="w-full px-2 py-1 bg-transparent border-0 text-xs focus:ring-1 focus:ring-emerald-500 rounded"
                        />
                      </td>

                      {/* Delete Row Button */}
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                          title="លុបជួរដេកនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Add Row Helper */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => addRows(1)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-dashed border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'km' ? '+ បន្ថែម ១ ជួរថ្មី (ឬចុច Enter នៅលើតារាង)' : '+ Add 1 Row (or press Enter)'}</span>
              </button>
            </div>
            <span>
              {language === 'km' ? '💡 គន្លឹះ៖ ចុចគ្រាប់ចុច Tab ដើម្បីរំកិលទៅប្រអប់បន្ទាប់ ឬចុច Enter ដើម្បីចុះបន្ទាត់ថ្មី' : '💡 Tip: Press Tab to move to next cell, Enter to move to next row'}
            </span>
          </div>
        </div>

        {/* Bottom Footer Action Bar */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <Info className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600 dark:text-slate-300">
              {language === 'km' 
                ? `សិស្សត្រឹមត្រូវចំនួន ${validRows.length} នាក់ នឹងត្រូវបានបញ្ចូលទៅកាន់ «${targetClass?.nameKm || targetClass?.name || 'ថ្នាក់រៀន'}» (${importMode === 'replace' ? 'ជំនួសសិស្សចាស់' : 'បន្ថែមលើសិស្សចាស់'})`
                : `${validRows.length} valid student(s) will be saved to ${targetClass?.name || 'Class'} (${importMode})`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              onClick={handleSaveToClass}
              disabled={validRows.length === 0}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {language === 'km' 
                  ? `💾 រក្សាទុកសិស្សទាំងអស់ (${validRows.length} នាក់)` 
                  : `Save Students (${validRows.length})`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
