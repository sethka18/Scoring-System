import React, { useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { exportStudentsToCSV, parseStudentsCSV } from '../../utils/exportImport';
import { formatConductRating, CONDUCT_OPTIONS } from '../../utils/calculations';
import { Student, Gender, ClassSection } from '../../types';
import { PrintPreviewModal } from '../common/PrintPreviewModal';

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
    updateStudent, 
    deleteStudent,
    setSelectedStudentId,
    setActiveTab,
    showToast
  } = useGradebook();

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  
  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');

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

  const handleCSVImport = () => {
    if (!importCsvText.trim()) return;
    const parsed = parseStudentsCSV(importCsvText);
    if (parsed.length === 0) {
      showToast(language === 'km' ? 'រកមិនឃើញទិន្នន័យត្រឹមត្រូវក្នុង CSV' : 'No valid students found in CSV', 'error');
      return;
    }

    parsed.forEach(s => {
      addStudent({
        studentId: s.studentId || `STU-${Date.now().toString().slice(-4)}`,
        name: s.name || 'សិស្សថ្មី',
        nameLatin: s.nameLatin || '',
        gender: s.gender || 'Male',
        dob: s.dob || '2014-01-01',
        guardianName: s.guardianName || '',
        guardianPhone: s.guardianPhone || '',
        attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
        behaviorScore: 5,
        conductRating: formatConductRating(s.conductRating || 'ល្អ', 'km'),
        notes: s.notes || '',
      });
    });

    showToast(language === 'km' ? `បានបញ្ចូលសិស្សចំនួន ${parsed.length} នាក់` : `Imported ${parsed.length} students successfully`);
    setShowImportModal(false);
    setImportCsvText('');
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
          <div className="flex items-center space-x-2">
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
              onClick={handleOpenAddStudent}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-900/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'km' ? 'បញ្ចូលសិស្សថ្មី' : '+ Add Student'}</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer shadow-2xs"
              title="Import Roster from CSV"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              onClick={() => exportStudentsToCSV(classStudents, activeClass?.name || 'Class')}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer shadow-2xs"
              title="Export Roster to CSV"
            >
              <Download className="w-4 h-4 text-indigo-600" />
            </button>
          </div>

        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
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
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                    {language === 'km' ? 'មិនមានទិន្នន័យសិស្សត្រូវបង្ហាញឡើយ' : 'No students found matching current filters.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const present = student.attendanceCount?.present ?? 0;
                  const excused = student.attendanceCount?.absentExcused ?? 0;
                  const unexcused = student.attendanceCount?.absentUnexcused ?? 0;
                  const totalDays = present + excused + unexcused;
                  const attRate = totalDays > 0 ? ((present / totalDays) * 100).toFixed(0) : '100';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-center font-black text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-black text-slate-700">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900">{student.name}</div>
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

      {/* Add New Class Modal */}
      {(showAddClassModal || editingClass) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-heading font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
              {editingClass 
                ? (language === 'km' ? 'កែប្រែព័ត៌មានថ្នាក់' : 'Edit Class Section')
                : (language === 'km' ? 'បង្កើតថ្នាក់រៀនថ្មី' : 'Create New Class Section')}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const name = form.name.value;
                const nameKm = form.nameKm.value;
                const gradeLevel = Number(form.gradeLevel.value);
                const academicYear = form.academicYear.value;
                const roomNumber = form.roomNumber.value;
                const teacherName = form.teacherName.value;
                const teacherNameKm = form.teacherNameKm.value;
                const schoolName = form.schoolName.value;
                const schoolNameKm = form.schoolNameKm.value;

                if (editingClass) {
                  updateClass(editingClass.id, {
                    name, nameKm, gradeLevel, academicYear, roomNumber, teacherName, teacherNameKm, schoolName, schoolNameKm
                  });
                  setEditingClass(null);
                } else {
                  addClass({
                    name, nameKm, gradeLevel, academicYear, roomNumber, teacherName, teacherNameKm, schoolName, schoolNameKm
                  });
                  setShowAddClassModal(false);
                }
              }}
              className="space-y-3 mt-4 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះថ្នាក់ (English / Code)' : 'Class Name (English)'} *
                </label>
                <input
                  name="name"
                  defaultValue={editingClass?.name || 'Grade 6B'}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះថ្នាក់ជាភាសាខ្មែរ' : 'Class Name (Khmer)'} *
                </label>
                <input
                  name="nameKm"
                  defaultValue={editingClass?.nameKm || 'ថ្នាក់ទី៦(ខ)'}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'កម្រិតថ្នាក់ (Grade 1-6)' : 'Grade Level'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    name="gradeLevel"
                    defaultValue={editingClass?.gradeLevel || 6}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'ឆ្នាំសិក្សា' : 'Academic Year'}
                  </label>
                  <input
                    name="academicYear"
                    defaultValue={editingClass?.academicYear || '២០២៦-២០២៧'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Teacher (English)'}
                  </label>
                  <input
                    name="teacherName"
                    defaultValue={editingClass?.teacherName || 'Teacher Name'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់ (ខ្មែរ)' : 'Teacher (Khmer)'}
                  </label>
                  <input
                    name="teacherNameKm"
                    defaultValue={editingClass?.teacherNameKm || 'លោកគ្រូ/អ្នកគ្រូ'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'បន្ទប់រៀន / អគារ' : 'Room Number'}
                </label>
                <input
                  name="roomNumber"
                  defaultValue={editingClass?.roomNumber || 'Room 12'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះសាលា (ខ្មែរ)' : 'School Name (Khmer)'}
                </label>
                <input
                  name="schoolNameKm"
                  defaultValue={editingClass?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddClassModal(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
                >
                  {language === 'km' ? 'រក្សាទុក' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {language === 'km' ? 'នាំចូលបញ្ជីសិស្សតាម CSV' : 'Import Roster from CSV'}
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <p className="text-slate-600">
                {language === 'km' 
                  ? 'បិទភ្ជាប់ (Paste) ទិន្នន័យពី Excel / Google Sheets ឬ CSV នៅខាងក្រោម៖'
                  : 'Paste CSV contents below (Headers: ID, Student ID, Full Name, Latin Name, Gender, Birth Date...):'}
              </p>
              <textarea
                rows={7}
                placeholder="STU-01, ចាន់ សុខា, Chan Sokha, Male, 2014-04-12, ចាន់ វណ្ណា, 012 889 922&#10;STU-02, មាស សុវណ្ណ, Meas Sovann, Female, 2014-07-20, មាស ផល្លា, 098 776 543"
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
              />
              
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleCSVImport}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  {language === 'km' ? 'នាំចូលទិន្នន័យ' : 'Import Students'}
                </button>
              </div>
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
