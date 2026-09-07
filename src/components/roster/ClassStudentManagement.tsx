import React, { useState, useRef } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  UserPlus, 
  Search, 
  Download, 
  Upload, 
  Edit3, 
  Trash2, 
  Printer, 
  Eye, 
  Filter, 
  Plus, 
  Check, 
  X, 
  Phone, 
  Award, 
  Calendar,
  Layers,
  School,
  FileSpreadsheet,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  FileText,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Timer
} from 'lucide-react';
import { 
  exportStudentsToCSV, 
  exportStudentsToJSON, 
  downloadStudentCSVTemplate, 
  parseStudentsFlexible 
} from '../../utils/exportImport';
import { formatConductRating, CONDUCT_OPTIONS } from '../../utils/calculations';
import { Student, Gender, ClassSection } from '../../types';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import { ClassModal } from '../school/ClassModal';

export const ClassStudentManagement: React.FC = () => {
  const { 
    language, 
    activeClass, 
    classes, 
    classStudents, 
    students,
    activeClassId, 
    setActiveClassId,
    addClass, 
    updateClass, 
    deleteClass, 
    addStudent, 
    addStudentsBatch,
    updateStudent, 
    deleteStudent,
    deleteStudents,
    setSelectedStudentId,
    setActiveTab,
    showToast
  } = useGradebook();

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  
  // Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  // Enhanced Import State
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importRawText, setImportRawText] = useState('');
  const [parsedImportStudents, setParsedImportStudents] = useState<Partial<Student>[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    nameLatin: '',
    gender: 'Male' as Gender,
    dob: '2014-01-01',
    guardianName: '',
    guardianPhone: '',
    behaviorScore: 5,
    conductRating: 'ល្អ',
    notes: '',
  });

  // Filtered Students
  const filteredStudents = classStudents.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nameLatin && s.nameLatin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = genderFilter === 'All' || s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  // Selection helpers
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.has(s.id));
  const isSomeSelected = filteredStudents.some(s => selectedStudentIds.has(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Deselect filtered
      const next = new Set(selectedStudentIds);
      filteredStudents.forEach(s => next.delete(s.id));
      setSelectedStudentIds(next);
    } else {
      // Select all filtered
      const next = new Set(selectedStudentIds);
      filteredStudents.forEach(s => next.add(s.id));
      setSelectedStudentIds(next);
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenAddStudent = () => {
    const nextNum = (classStudents.length + 1).toString().padStart(2, '0');
    const classPrefix = activeClass?.name.replace(/[^0-9A-Za-z]/g, '') || '06A';
    setFormData({
      studentId: `STU-${classPrefix}-${nextNum}`,
      name: '',
      nameLatin: '',
      gender: 'Male',
      dob: '2014-01-01',
      guardianName: '',
      guardianPhone: '',
      behaviorScore: 5,
      conductRating: 'ល្អ',
      notes: '',
    });
    setShowAddStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast(language === 'km' ? 'សូមបញ្ចូលឈ្មោះសិស្ស' : 'Please enter student name', 'warning');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        ...formData,
      });
      setEditingStudent(null);
    } else {
      addStudent({
        ...formData,
        attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 }
      });
      setShowAddStudentModal(false);
    }
  };

  // Bulk Delete Handler
  const handleConfirmBulkDelete = () => {
    const idsToDelete = Array.from(selectedStudentIds);
    if (idsToDelete.length === 0) return;
    deleteStudents(idsToDelete);
    setSelectedStudentIds(new Set());
    setShowDeleteConfirmModal(false);
  };

  // Bulk Export Handlers
  const handleExportSelected = (format: 'csv' | 'json' = 'csv') => {
    const selectedList = classStudents.filter(s => selectedStudentIds.has(s.id));
    if (selectedList.length === 0) {
      showToast(language === 'km' ? 'សូមជ្រើសរើសសិស្សដែលត្រូវនាំចេញ' : 'Please select students to export', 'warning');
      return;
    }

    const classNameStr = activeClass?.nameKm || activeClass?.name || 'Class';
    if (format === 'csv') {
      exportStudentsToCSV(
        selectedList, 
        classNameStr, 
        `បញ្ជីសិស្សជ្រើសរើស_${selectedList.length}នាក់_${classNameStr.replace(/\s+/g, '_')}.csv`
      );
    } else {
      exportStudentsToJSON(
        selectedList, 
        classNameStr, 
        `បញ្ជីសិស្សជ្រើសរើស_${selectedList.length}នាក់_${classNameStr.replace(/\s+/g, '_')}.json`
      );
    }
    showToast(
      language === 'km' 
        ? `បាននាំចេញសិស្សចំនួន ${selectedList.length} នាក់ជាឯកសារ ${format.toUpperCase()}` 
        : `Exported ${selectedList.length} selected students (${format.toUpperCase()})`,
      'success'
    );
  };

  const handleExportAll = (format: 'csv' | 'json' = 'csv') => {
    const classNameStr = activeClass?.nameKm || activeClass?.name || 'Class';
    if (format === 'csv') {
      exportStudentsToCSV(classStudents, classNameStr);
    } else {
      exportStudentsToJSON(classStudents, classNameStr);
    }
    showToast(
      language === 'km' 
        ? `បាននាំចេញសិស្សទាំងអស់ (${classStudents.length} នាក់)` 
        : `Exported all ${classStudents.length} students`,
      'success'
    );
    setShowExportModal(false);
  };

  // File & Text Import Handlers
  const handleImportTextChange = (text: string) => {
    setImportRawText(text);
    const parsed = parseStudentsFlexible(text);
    setParsedImportStudents(parsed);
  };

  const handleImportFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportRawText(content);
        const parsed = parseStudentsFlexible(content);
        setParsedImportStudents(parsed);
        if (parsed.length === 0) {
          showToast(
            language === 'km' ? 'មិនអាចអានទិន្នន័យពីឯកសារនេះបានឡើយ' : 'Could not parse student data from file',
            'warning'
          );
        } else {
          showToast(
            language === 'km' ? `រកឃើញសិស្សចំនួន ${parsed.length} នាក់ក្នុងឯកសារ` : `Found ${parsed.length} students in file`,
            'info'
          );
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedImportStudents.length === 0) {
      showToast(
        language === 'km' ? 'រកមិនឃើញទិន្នន័យសិស្សត្រូវនាំចូលឡើយ' : 'No student records to import',
        'warning'
      );
      return;
    }

    addStudentsBatch(parsedImportStudents, activeClassId, importMode === 'replace');
    setShowImportModal(false);
    setImportRawText('');
    setParsedImportStudents([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Class Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-heading font-black text-lg sm:text-xl text-slate-900 uppercase tracking-tight">
                  {language === 'km' ? activeClass?.nameKm : activeClass?.name}
                </h2>
                <span className="bg-indigo-50 text-indigo-900 text-[10px] px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                  {activeClass?.academicYear}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {language === 'km' ? `បន្ទប់: ${activeClass?.roomNumber} | គ្រូបន្ទុកថ្នាក់: ${activeClass?.teacherNameKm}` : `ROOM: ${activeClass?.roomNumber} | HOMEROOM TEACHER: ${activeClass?.teacherName}`}
              </p>
            </div>
          </div>

          {/* Action Buttons for Class */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEditingClass(activeClass || null)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-700 transition cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'km' ? 'កែប្រែថ្នាក់' : 'Edit Class'}</span>
            </button>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md shadow-indigo-900/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បង្កើតថ្នាក់ថ្មី' : '+ New Class'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster Controls: Search, Filter, Add, Import, Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'km' ? 'ស្វែងរកតាមឈ្មោះ ឬ អត្តលេខ...' : 'Search student by name or ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Gender Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Male', 'Female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  genderFilter === g
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {g === 'All' 
                  ? (language === 'km' ? 'ទាំងអស់' : 'ALL') 
                  : g === 'Male' 
                    ? (language === 'km' ? 'ប្រុស' : 'BOYS') 
                    : (language === 'km' ? 'ស្រី' : 'GIRLS')}
              </button>
            ))}
          </div>

          {/* Student Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPrintPreview(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black shadow-2xs transition cursor-pointer"
              title={language === 'km' ? 'មើលទិដ្ឋភាពបោះពុម្ពបញ្ជីសិស្ស (Print Preview)' : 'Print Preview Class Roster'}
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'km' ? 'មើលទិដ្ឋភាពបោះពុម្ព' : 'Print Preview'}</span>
            </button>

            <button
              onClick={() => {
                setImportRawText('');
                setParsedImportStudents([]);
                setShowImportModal(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black transition cursor-pointer shadow-2xs"
              title={language === 'km' ? 'នាំចូលបញ្ជីសិស្សពី Excel / CSV' : 'Import Roster from CSV / Excel'}
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>{language === 'km' ? 'នាំចូល (Import)' : 'Import'}</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-black transition cursor-pointer shadow-2xs"
              title={language === 'km' ? 'នាំចេញបញ្ជីសិស្សជា Excel CSV ឬ JSON' : 'Export Roster to CSV or JSON'}
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>{language === 'km' ? 'នាំចេញ (Export)' : 'Export'}</span>
              {selectedStudentIds.size > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {selectedStudentIds.size}
                </span>
              )}
            </button>

            <button
              onClick={handleOpenAddStudent}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-900/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'km' ? 'បញ្ចូលសិស្សថ្មី' : '+ Add Student'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Floating Selection Action Bar */}
      {selectedStudentIds.size > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-indigo-700 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-inner">
              {selectedStudentIds.size} / {filteredStudents.length}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold">
                {language === 'km' 
                  ? `បានជ្រើសរើសសិស្សចំនួន ${selectedStudentIds.size} នាក់` 
                  : `Selected ${selectedStudentIds.size} students`}
              </p>
              <p className="text-[11px] text-indigo-200">
                {language === 'km' 
                  ? 'លោកគ្រូ/អ្នកគ្រូអាចធ្វើការលុប ឬនាំចេញសិស្សដែលបានជ្រើសរើសក្នុងពេលតែមួយ' 
                  : 'You can bulk delete or export only the selected students'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export Selected as CSV */}
            <button
              onClick={() => handleExportSelected('csv')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black transition cursor-pointer"
              title="Export Selected to Excel CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              <span>{language === 'km' ? 'នាំចេញ CSV' : 'Export CSV'}</span>
            </button>

            {/* Export Selected as JSON */}
            <button
              onClick={() => handleExportSelected('json')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black transition cursor-pointer"
              title="Export Selected to JSON"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>{language === 'km' ? 'នាំចេញ JSON' : 'Export JSON'}</span>
            </button>

            {/* Bulk Delete */}
            <button
              onClick={() => setShowDeleteConfirmModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer shadow-xs"
              title="Delete Selected Students"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? `លុបសិស្ស (${selectedStudentIds.size})` : `Delete (${selectedStudentIds.size})`}</span>
            </button>

            {/* Deselect All */}
            <button
              onClick={() => setSelectedStudentIds(new Set())}
              className="p-1.5 rounded-xl hover:bg-white/10 text-indigo-300 hover:text-white transition cursor-pointer ml-1"
              title={language === 'km' ? 'បោះបង់ការជ្រើសរើស' : 'Deselect All'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => {
                      if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title={language === 'km' ? 'ជ្រើសរើសទាំងអស់' : 'Select All'}
                  />
                </th>
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'អត្តលេខ' : 'Student ID'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'គោត្តនាម និងនាម' : 'Full Name'}</th>
                <th className="py-3.5 px-4 text-center">{language === 'km' ? 'ភេទ' : 'Gender'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត' : 'Birth Date'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'អាណាព្យាបាល / ទូរស័ព្ទ' : 'Guardian & Phone'}</th>
                <th className="py-3.5 px-4 text-center">{language === 'km' ? 'វត្តមាន' : 'Attendance'}</th>
                <th className="py-3.5 px-4 text-center">{language === 'km' ? 'សីលធម៌' : 'Conduct'}</th>
                <th className="py-3.5 px-4 text-right">{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                    {language === 'km' ? 'មិនមានទិន្នន័យសិស្សត្រូវបង្ហាញឡើយ' : 'No students found matching current filters.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const isSelected = selectedStudentIds.has(student.id);
                  const present = student.attendanceCount?.present ?? 0;
                  const excused = student.attendanceCount?.absentExcused ?? 0;
                  const unexcused = student.attendanceCount?.absentUnexcused ?? 0;
                  const totalDays = present + excused + unexcused;
                  const attRate = totalDays > 0 ? ((present / totalDays) * 100).toFixed(0) : '100';

                  return (
                    <tr 
                      key={student.id} 
                      className={`transition ${
                        isSelected 
                          ? 'bg-indigo-50/80 hover:bg-indigo-100/70' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(student.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-black text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-black text-slate-700">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900">{student.name}</div>
                        {student.nameLatin && (
                          <div className="text-[11px] font-semibold text-slate-400">{student.nameLatin}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          student.gender === 'Female' 
                            ? 'bg-pink-50 text-pink-700 border border-pink-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {student.gender === 'Female' 
                            ? (language === 'km' ? 'ស្រី' : 'F') 
                            : (language === 'km' ? 'ប្រុស' : 'M')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-medium">
                        {student.dob || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-black text-slate-800">{student.guardianName || '-'}</div>
                        <div className="text-xs text-slate-400">{student.guardianPhone || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-emerald-600">{attRate}%</span>
                        <div className="text-[10px] text-slate-400">{present}d pres</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {formatConductRating(student.conductRating, language)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setActiveTab('fluency_exam');
                            }}
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"
                            title={language === 'km' ? 'វាយតម្លៃល្បឿនអំណានភាសាខ្មែរ (Timer & Fluency)' : 'Khmer Reading Speed & Fluency Evaluator'}
                          >
                            <Timer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setActiveTab('report_card');
                            }}
                            className="p-1.5 rounded hover:bg-slate-100 text-indigo-600 transition"
                            title="View Report Card"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(student);
                              setFormData({
                                studentId: student.studentId,
                                name: student.name,
                                nameLatin: student.nameLatin || '',
                                gender: student.gender,
                                dob: student.dob || '2014-01-01',
                                guardianName: student.guardianName || '',
                                guardianPhone: student.guardianPhone || '',
                                behaviorScore: student.behaviorScore || 5,
                                conductRating: student.conductRating || 'A',
                                notes: student.notes || '',
                              });
                            }}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
                            title="Edit Student"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'km' ? `តើអ្នកចង់លុបសិស្ស ${student.name} មែនទេ?` : `Delete student ${student.name}?`)) {
                                deleteStudent(student.id);
                                setSelectedStudentIds(prev => {
                                  const next = new Set(prev);
                                  next.delete(student.id);
                                  return next;
                                });
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(showAddStudentModal || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {editingStudent
                  ? (language === 'km' ? 'កែប្រែព័ត៌មានសិស្ស' : 'Edit Student Details')
                  : (language === 'km' ? 'បញ្ចូលសិស្សថ្មី' : 'Add New Student')}
              </h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setEditingStudent(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'អត្តលេខសិស្ស' : 'Student ID'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'ភេទ' : 'Gender'} *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">{language === 'km' ? 'ប្រុស (Male)' : 'Male'}</option>
                    <option value="Female">{language === 'km' ? 'ស្រី (Female)' : 'Female'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'គោត្តនាម និងនាម (ខ្មែរ)' : 'Full Name (Khmer)'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ចាន់ សុខា"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត' : 'Date of Birth'}
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'វិន័យ / សីលធម៌' : 'Conduct / Discipline'}
                  </label>
                  <select
                    value={formatConductRating(formData.conductRating, 'km')}
                    onChange={(e) => setFormData({ ...formData, conductRating: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="ល្អប្រសើរ">{language === 'km' ? 'ល្អប្រសើរ' : 'Excellent (ល្អប្រសើរ)'}</option>
                    <option value="ល្អ">{language === 'km' ? 'ល្អ' : 'Good (ល្អ)'}</option>
                    <option value="ល្អបង្គួរ">{language === 'km' ? 'ល្អបង្គួរ' : 'Fairly Good (ល្អបង្គួរ)'}</option>
                    <option value="មធ្យម">{language === 'km' ? 'មធ្យម' : 'Medium (មធ្យម)'}</option>
                    <option value="ខ្សោយ">{language === 'km' ? 'ខ្សោយ' : 'Needs Improvement (ខ្សោយ)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'ឈ្មោះអាណាព្យាបាល' : 'Guardian Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'កំណត់ចំណាំផ្សេងៗ' : 'Teacher Notes'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {language === 'km' ? 'រក្សាទុក' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Add / Edit Modal */}
      <ClassModal
        isOpen={showAddClassModal || Boolean(editingClass)}
        initialClass={editingClass}
        onClose={() => {
          setShowAddClassModal(false);
          setEditingClass(null);
        }}
      />

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {language === 'km' ? 'បញ្ជាក់ការលុបសិស្សជាក្រុម' : 'Confirm Bulk Deletion'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'km' 
                    ? `តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបសិស្សចំនួន ${selectedStudentIds.size} នាក់នេះមែនទេ?` 
                    : `Are you sure you want to delete ${selectedStudentIds.size} selected students?`}
                </p>
              </div>
            </div>

            <div className="my-4 space-y-3">
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {language === 'km' 
                  ? '⚠️ ការលុបនេះនឹងលុបសិស្សដែលបានជ្រើសរើស និងកំណត់ត្រាពិន្ទុពាក់ព័ន្ធចេញពីថ្នាក់រៀននេះ។' 
                  : '⚠️ This action will remove the selected students and their score records from this class.'}
              </p>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50 text-xs">
                {classStudents
                  .filter(s => selectedStudentIds.has(s.id))
                  .map((s, idx) => (
                    <div key={s.id} className="py-1.5 px-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-400 text-[10px]">{idx + 1}.</span>
                        <span className="font-bold text-slate-800">{s.name}</span>
                        {s.nameLatin && <span className="text-slate-400 text-[10px]">({s.nameLatin})</span>}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{s.studentId}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer shadow-xs"
              >
                {language === 'km' ? `លុបសិស្ស ${selectedStudentIds.size} នាក់` : `Delete ${selectedStudentIds.size} Students`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    {language === 'km' ? 'នាំចេញទិន្នន័យបញ្ជីសិស្ស' : 'Export Student Roster'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'km' ? 'ជ្រើសរើសជម្រើសនាំចេញជា Excel CSV ឬ JSON' : 'Choose export format and selection'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Option 1: Selected Students */}
              <div className={`p-4 rounded-xl border transition ${
                selectedStudentIds.size > 0 
                  ? 'bg-indigo-50/60 border-indigo-200' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                      {language === 'km' ? '១. សិស្សដែលបានជ្រើសរើស (Selected Only)' : '1. Selected Students Only'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'km' 
                        ? `ចំនួនសិស្សដែលបានគូសជ្រើសរើស៖ ${selectedStudentIds.size} នាក់` 
                        : `Currently selected: ${selectedStudentIds.size} students`}
                    </p>
                  </div>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">
                    {selectedStudentIds.size}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    disabled={selectedStudentIds.size === 0}
                    onClick={() => {
                      handleExportSelected('csv');
                      setShowExportModal(false);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'នាំចេញជា CSV (Excel)' : 'Export as CSV'}</span>
                  </button>
                  <button
                    disabled={selectedStudentIds.size === 0}
                    onClick={() => {
                      handleExportSelected('json');
                      setShowExportModal(false);
                    }}
                    className="py-2 px-3 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 disabled:bg-slate-100 text-indigo-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Option 2: All Class Students */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                      {language === 'km' ? '២. សិស្សទាំងអស់ក្នុងថ្នាក់ (All Class Students)' : '2. All Students in Class'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'km' 
                        ? `ថ្នាក់: ${activeClass?.nameKm || activeClass?.name} (${classStudents.length} នាក់)` 
                        : `Class: ${activeClass?.name} (${classStudents.length} students)`}
                    </p>
                  </div>
                  <span className="text-xs font-black text-slate-700 bg-slate-200 px-2.5 py-1 rounded-lg">
                    {classStudents.length}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => handleExportAll('csv')}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'នាំចេញទាំងអស់ជា CSV' : 'Export All as CSV'}</span>
                  </button>
                  <button
                    onClick={() => handleExportAll('json')}
                    className="py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Option 3: Download Template */}
              <div className="p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-emerald-900 text-xs">
                    {language === 'km' ? 'ទាញយកគំរូទម្រង់បញ្ជីសិស្ស (CSV Template)' : 'Download Standard CSV Template'}
                  </h5>
                  <p className="text-[11px] text-emerald-700">
                    {language === 'km' ? 'ទម្រង់គំរូស្តង់ដារក្រសួង MoEYS ងាយស្រួលបំពេញក្នុង Excel' : 'Standard template ready to fill in Excel'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    downloadStudentCSVTemplate();
                    showToast(language === 'km' ? 'បានទាញយកគំរូ CSV ដោយជោគជ័យ' : 'Downloaded CSV template', 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ទាញយកគំរូ' : 'Template'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                {language === 'km' ? 'បិទ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    {language === 'km' ? 'នាំចូលបញ្ជីសិស្ស (Import Roster)' : 'Import Student Roster'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'km' 
                      ? 'គាំទ្រឯកសារ CSV, Excel Copy-Paste ឬ JSON' 
                      : 'Supports CSV, pasted Excel rows, or JSON'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 py-4 flex-1 text-xs sm:text-sm">
              {/* Mode & Template Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-700 text-xs">
                    {language === 'km' ? 'របៀបបញ្ចូល:' : 'Import Mode:'}
                  </span>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{language === 'km' ? 'បន្ថែមលើសិស្សចាស់ (Append)' : 'Append to existing'}</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-rose-700">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{language === 'km' ? 'ជំនួសសិស្សទាំងអស់ (Replace)' : 'Replace all'}</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={downloadStudentCSVTemplate}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition cursor-pointer"
                  title="Download standard CSV template"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ទាញយកគំរូ CSV' : 'CSV Template'}</span>
                </button>
              </div>

              {/* Tabs: File vs Paste */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setImportTab('file')}
                  className={`py-2 px-4 font-bold text-xs border-b-2 transition ${
                    importTab === 'file'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'km' ? '📁 ផ្ទុកឡើងឯកសារ (Upload File)' : '📁 Upload File'}
                </button>
                <button
                  onClick={() => setImportTab('paste')}
                  className={`py-2 px-4 font-bold text-xs border-b-2 transition ${
                    importTab === 'paste'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'km' ? '📋 ចម្លងបិទភ្ជាប់ (Paste Text/Excel)' : '📋 Paste Text/Excel'}
                </button>
              </div>

              {importTab === 'file' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.json,.tsv"
                    onChange={handleImportFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 p-6 rounded-2xl text-center cursor-pointer transition"
                  >
                    <Upload className="w-8 h-8 mx-auto text-indigo-600 mb-2" />
                    <p className="font-bold text-slate-800 text-sm">
                      {language === 'km' ? 'ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ CSV ឬ JSON' : 'Click to browse CSV, TSV, or JSON file'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === 'km' ? 'គាំទ្រឯកសារ .csv, .txt, .json' : 'Supports .csv, .txt, .json'}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={6}
                    placeholder="ចម្លងទិន្នន័យពី Microsoft Excel ឬ Google Sheets ហើយបិទភ្ជាប់នៅទីនេះ...&#10;STU-6001, ចាន់ សុខា, Chan Sokha, ប្រុស, 2014-03-15, 012 345 678&#10;STU-6002, សុខ គន្ធា, Sok Kunthea, ស្រី, 2014-05-20, 098 765 432"
                    value={importRawText}
                    onChange={(e) => handleImportTextChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Parsed Preview Section */}
              {parsedImportStudents.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-black text-slate-900 text-xs">
                        {language === 'km' 
                          ? `រកឃើញសិស្សចំនួន ${parsedImportStudents.length} នាក់៖` 
                          : `Successfully parsed ${parsedImportStudents.length} students:`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] font-bold">
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {language === 'km' ? 'ប្រុស:' : 'Boys:'} {parsedImportStudents.filter(s => s.gender === 'Male').length}
                      </span>
                      <span className="text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                        {language === 'km' ? 'ស្រី:' : 'Girls:'} {parsedImportStudents.filter(s => s.gender === 'Female').length}
                      </span>
                    </div>
                  </div>

                  {/* Mini Preview Table */}
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-500 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">ID</th>
                          <th className="p-2">{language === 'km' ? 'ឈ្មោះខ្មែរ' : 'Khmer Name'}</th>
                          <th className="p-2">{language === 'km' ? 'ឈ្មោះឡាតាំង' : 'Latin Name'}</th>
                          <th className="p-2">{language === 'km' ? 'ភេទ' : 'Gender'}</th>
                          <th className="p-2">{language === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត' : 'DOB'}</th>
                          <th className="p-2">{language === 'km' ? 'ទូរស័ព្ទ' : 'Phone'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedImportStudents.slice(0, 8).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-mono font-bold text-slate-700">{s.studentId}</td>
                            <td className="p-2 font-bold text-slate-900">{s.name}</td>
                            <td className="p-2 text-slate-500">{s.nameLatin || '-'}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                s.gender === 'Female' ? 'text-pink-700 bg-pink-50' : 'text-blue-700 bg-blue-50'
                              }`}>
                                {s.gender === 'Female' ? (language === 'km' ? 'ស្រី' : 'F') : (language === 'km' ? 'ប្រុស' : 'M')}
                              </span>
                            </td>
                            <td className="p-2 text-slate-600">{s.dob || '-'}</td>
                            <td className="p-2 text-slate-600">{s.guardianPhone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedImportStudents.length > 8 && (
                    <p className="text-[10px] text-slate-400 text-right">
                      {language === 'km' 
                        ? `...និងសិស្សចំនួន ${parsedImportStudents.length - 8} នាក់ទៀត` 
                        : `...and ${parsedImportStudents.length - 8} more students`}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={parsedImportStudents.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs transition cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                {language === 'km' 
                  ? `បញ្ជាក់ការនាំចូល (${parsedImportStudents.length} នាក់)` 
                  : `Confirm Import (${parsedImportStudents.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Print Preview Modal Overlay */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        type="roster"
        rosterStudents={filteredStudents}
        activeClass={activeClass}
      />

    </div>
  );
};
