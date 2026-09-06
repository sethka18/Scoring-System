import React, { useState, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { AttendanceStatus, DailyAttendanceRecord, Student } from '../../types';
import { 
  CalendarCheck, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download, 
  FileText, 
  Sparkles, 
  Search,
  Filter,
  Users,
  Percent,
  Check,
  RotateCcw
} from 'lucide-react';
import { PrintToPdfButton } from '../common/PrintToPdfButton';

export const DailyAttendanceTracker: React.FC = () => {
  const { 
    language, 
    activeClass, 
    classStudents, 
    attendanceRecords, 
    markAttendance, 
    batchMarkAttendance, 
    markAllPresent,
    getStudentMonthlyAttendance,
    showToast 
  } = useGradebook();

  const [activeView, setActiveView] = useState<'daily' | 'monthly_summary'>('daily');
  
  // Format today's date YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>('2026-02-26');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-02');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'All' | 'Female' | 'Male'>('All');

  // Filtered students
  const filteredStudents = useMemo(() => {
    return classStudents.filter(stu => {
      const matchSearch = 
        stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.nameLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchGender = filterGender === 'All' || stu.gender === filterGender;
      return matchSearch && matchGender;
    });
  }, [classStudents, searchQuery, filterGender]);

  // Current day records map for fast lookup
  const dayRecordsMap = useMemo(() => {
    const map: Record<string, DailyAttendanceRecord> = {};
    attendanceRecords.forEach(rec => {
      if (rec.date === selectedDate) {
        map[rec.studentId] = rec;
      }
    });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Daily statistics for selected day
  const dailyStats = useMemo(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;
    let unmarked = 0;

    classStudents.forEach(stu => {
      const rec = dayRecordsMap[stu.id];
      if (!rec) {
        unmarked++;
      } else if (rec.status === 'present') {
        present++;
      } else if (rec.status === 'excused') {
        excused++;
      } else if (rec.status === 'unexcused') {
        unexcused++;
      } else if (rec.status === 'late') {
        late++;
      }
    });

    const total = classStudents.length;
    const attended = present + late;
    const rate = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;

    return { total, present, excused, unexcused, late, unmarked, rate };
  }, [classStudents, dayRecordsMap]);

  // Navigate date
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Status configuration badges & labels
  const STATUS_CONFIG: Record<AttendanceStatus, { labelKm: string; labelEn: string; symbolKm: string; color: string; bg: string; border: string }> = {
    present: {
      labelKm: 'វត្តមាន (មក)',
      labelEn: 'Present',
      symbolKm: '✓',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-300 dark:border-emerald-700'
    },
    excused: {
      labelKm: 'សុំច្បាប់ (ច)',
      labelEn: 'Excused',
      symbolKm: 'ច',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      border: 'border-amber-300 dark:border-amber-700'
    },
    unexcused: {
      labelKm: 'អត់ច្បាប់ (អច)',
      labelEn: 'Unexcused',
      symbolKm: 'អច',
      color: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-300 dark:border-rose-700'
    },
    late: {
      labelKm: 'មកយឺត (យ)',
      labelEn: 'Late',
      symbolKm: 'យ',
      color: 'text-sky-700 dark:text-sky-300',
      bg: 'bg-sky-50 dark:bg-sky-950/50',
      border: 'border-sky-300 dark:border-sky-700'
    }
  };

  // Quick mark status handler
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const currentNote = dayRecordsMap[studentId]?.note;
    markAttendance(studentId, selectedDate, status, currentNote);
  };

  // Quick update note handler
  const handleNoteChange = (studentId: string, note: string) => {
    const currentStatus = dayRecordsMap[studentId]?.status || 'present';
    markAttendance(studentId, selectedDate, currentStatus, note);
  };

  // Format date to Cambodian readable
  const formatKhmerDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const toKhmerNum = (str: string) => str.split('').map(c => khmerNumbers[parseInt(c)] || c).join('');
    
    const monthsKm = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    const monthName = monthsKm[parseInt(month) - 1] || month;
    return `ថ្ងៃទី ${toKhmerNum(day)} ខែ ${monthName} ឆ្នាំ ${toKhmerNum(year)}`;
  };

  // Export CSV for attendance
  const exportMonthlyAttendanceCsv = () => {
    const headers = [
      'No',
      'Student ID',
      'Name Khmer',
      'Name Latin',
      'Gender',
      'Present Days (វត្តមាន)',
      'Excused Absences (ច)',
      'Unexcused Absences (អច)',
      'Late (យ)',
      'Attendance Rate (%)'
    ];

    const rows = classStudents.map((stu, index) => {
      const summary = getStudentMonthlyAttendance(stu.id, selectedMonth);
      return [
        index + 1,
        stu.studentId,
        `"${stu.name}"`,
        `"${stu.nameLatin}"`,
        stu.gender,
        summary.presentDays,
        summary.excusedDays,
        summary.unexcusedDays,
        summary.lateDays,
        `${summary.attendanceRate}%`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `MoEYS_Attendance_${activeClass?.nameKm || 'Grade6'}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(language === 'km' ? 'បានទាញយកតារាងវត្តមានជា CSV' : 'Exported Attendance CSV');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Mode Toggle Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'km' ? 'ប្រព័ន្ធតាមដានវត្តមានសិស្សប្រចាំថ្ងៃ' : 'Daily Student Attendance & Absences'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                MoEYS Register
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'km' 
                ? 'កត់ត្រាវត្តមាន (មក, ច្បាប់ [ច], អវត្តមាន [អច], យឺត) គណនាផលបូកដោយស្វ័យប្រវត្តិចូលរបាយការណ៍' 
                : 'Mark Daily Attendance (Present, Excused [ច], Unexcused [អច], Late) auto-fed to report cards'}
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveView('daily')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                activeView === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'កត់វត្តមានប្រចាំថ្ងៃ' : 'Daily Roll Call'}</span>
            </button>
            <button
              onClick={() => setActiveView('monthly_summary')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                activeView === 'monthly_summary'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'តារាងសរុបប្រចាំខែ (MoEYS)' : 'Monthly Summary'}</span>
            </button>
          </div>

          {activeView === 'monthly_summary' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={exportMonthlyAttendanceCsv}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <PrintToPdfButton
                targetElementId="moeys-monthly-attendance-report"
                documentTitle={`Attendance_Report_${selectedMonth}_${activeClass?.nameKm || 'Class'}`}
                pageSize="a4"
                orientation="landscape"
                variant="primary"
                className="text-xs py-1.5 px-3"
              />
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: DAILY ROLL CALL */}
      {activeView === 'daily' && (
        <div className="space-y-5">
          
          {/* Daily Date Controller & Quick Actions Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Date Picker & Nav */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                />
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedDate === todayStr 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {language === 'km' ? 'ថ្ងៃនេះ' : 'Today'}
                </button>
              </div>

              <button
                onClick={() => changeDateByDays(1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="hidden sm:block text-xs font-bold text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 pl-3">
                {formatKhmerDate(selectedDate)}
              </div>
            </div>

            {/* Quick Batch Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => markAllPresent(selectedDate)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'km' ? 'វត្តមានមកគ្រប់គ្នា (All Present)' : 'Mark All Present'}</span>
              </button>
            </div>
          </div>

          {/* Daily Quick Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* Present Metric */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <p className="text-2xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                  {language === 'km' ? 'វត្តមានមក' : 'Present'}
                </p>
                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {dailyStats.present} <span className="text-xs font-normal text-emerald-600">/ {dailyStats.total}</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Excused Metric */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
              <div>
                <p className="text-2xs uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                  {language === 'km' ? 'សុំច្បាប់ (ច)' : 'Excused (ច)'}
                </p>
                <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5">
                  {dailyStats.excused}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-base">
                ច
              </div>
            </div>

            {/* Unexcused Metric */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
              <div>
                <p className="text-2xs uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400">
                  {language === 'km' ? 'អត់ច្បាប់ (អច)' : 'Unexcused (អច)'}
                </p>
                <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-0.5">
                  {dailyStats.unexcused}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold text-sm">
                អច
              </div>
            </div>

            {/* Late Metric */}
            <div className="bg-sky-50/70 dark:bg-sky-950/30 p-4 rounded-2xl border border-sky-200 dark:border-sky-800/60 flex items-center justify-between">
              <div>
                <p className="text-2xs uppercase tracking-wider font-bold text-sky-700 dark:text-sky-400">
                  {language === 'km' ? 'មកយឺត (យ)' : 'Late (យ)'}
                </p>
                <p className="text-2xl font-black text-sky-900 dark:text-sky-200 mt-0.5">
                  {dailyStats.late}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-700 dark:text-sky-300">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="col-span-2 sm:col-span-1 bg-indigo-50/70 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
              <div>
                <p className="text-2xs uppercase tracking-wider font-bold text-indigo-700 dark:text-indigo-400">
                  {language === 'km' ? 'អត្រាវត្តមាន' : 'Attendance Rate'}
                </p>
                <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-0.5">
                  {dailyStats.rate}%
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                <Percent className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Student Roll Call Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            
            {/* Search & Filter sub-bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះ ឬ អត្តលេខសិស្ស...' : 'Search student name or ID...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' ? 'ភេទ៖' : 'Gender:'}
                </span>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value as any)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="All">{language === 'km' ? 'ទាំងអស់' : 'All'}</option>
                  <option value="Female">{language === 'km' ? 'សិស្សស្រី' : 'Female'}</option>
                  <option value="Male">{language === 'km' ? 'សិស្សប្រុស' : 'Male'}</option>
                </select>
                <span className="text-xs font-mono text-slate-400">
                  ({filteredStudents.length} {language === 'km' ? 'នាក់' : 'students'})
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-2xs uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-28">{language === 'km' ? 'អត្តលេខ' : 'Student ID'}</th>
                    <th className="py-3 px-4 min-w-[180px]">{language === 'km' ? 'គោត្តនាម-នាម' : 'Full Name'}</th>
                    <th className="py-3 px-3 w-16 text-center">{language === 'km' ? 'ភេទ' : 'Sex'}</th>
                    <th className="py-3 px-4 min-w-[280px]">{language === 'km' ? 'ស្ថានភាពវត្តមាន' : 'Attendance Status'}</th>
                    <th className="py-3 px-4 min-w-[200px]">{language === 'km' ? 'មូលហេតុ / កំណត់ចំណាំ' : 'Reason / Note'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((stu, index) => {
                    const rec = dayRecordsMap[stu.id];
                    const currentStatus: AttendanceStatus = rec?.status || 'present';
                    const currentNote = rec?.note || '';

                    return (
                      <tr 
                        key={stu.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-mono text-2xs text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {stu.studentId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {stu.name}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-2xs font-bold ${
                            stu.gender === 'Female' 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}>
                            {stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>
                        
                        {/* Status Button Selection */}
                        <td className="py-3 px-4">
                          <div className="inline-flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                            
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stu.id, 'present')}
                              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{language === 'km' ? 'វត្តមាន' : 'Present'}</span>
                            </button>

                            {/* Excused (ច) */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stu.id, 'excused')}
                              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                currentStatus === 'excused'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300'
                              }`}
                            >
                              <span>ច</span>
                              <span>{language === 'km' ? 'សុំច្បាប់' : 'Excused'}</span>
                            </button>

                            {/* Unexcused (អច) */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stu.id, 'unexcused')}
                              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                currentStatus === 'unexcused'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300'
                              }`}
                            >
                              <span>អច</span>
                              <span>{language === 'km' ? 'អវត្តមាន' : 'Absent'}</span>
                            </button>

                            {/* Late (យ) */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stu.id, 'late')}
                              className={`px-2 py-1 rounded-lg text-2xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                                currentStatus === 'late'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300'
                              }`}
                            >
                              <span>យ</span>
                              <span>{language === 'km' ? 'យឺត' : 'Late'}</span>
                            </button>
                          </div>
                        </td>

                        {/* Note Input */}
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder={currentStatus === 'excused' ? 'បញ្ជាក់មូលហេតុច្បាប់ (ឧ. ឈឺផ្ដាសាយ)...' : (currentStatus === 'unexcused' ? 'អវត្តមានគ្មានដំណឹង...' : 'ចំណាំបន្ថែម...')}
                            value={currentNote}
                            onChange={(e) => handleNoteChange(stu.id, e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY ATTENDANCE REGISTER & MOEYS A4 PRINTABLE SUMMARY */}
      {activeView === 'monthly_summary' && (
        <div className="space-y-6">
          
          {/* Month Selector Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'km' ? 'ជ្រើសរើសខែសរុបវត្តមាន៖' : 'Select Month for Report:'}
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              />
            </div>

            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language === 'km' ? 'ទិន្នន័យត្រូវបានបូកសរុបដោយស្វ័យប្រវត្តិតាមស្ដង់ដារក្រសួងអប់រំ យុវជន និងកីឡា' : 'Auto-calculated totals ready for official MoEYS registers and print'}
            </div>
          </div>

          {/* MoEYS Official Printable Container */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            
            <div id="moeys-monthly-attendance-report" className="min-w-[800px] p-4 bg-white text-slate-900">
              
              {/* MoEYS Official Letterhead */}
              <div className="text-center space-y-1 mb-6">
                <p className="font-bold text-sm tracking-wide text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-bold text-sm tracking-wide text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="w-24 h-0.5 bg-slate-800 mx-auto my-1"></div>
                <div className="flex justify-between items-start text-xs font-bold text-slate-800 pt-2 px-4">
                  <div className="text-left space-y-0.5">
                    <p>ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                    <p>{activeClass?.schoolNameKm || 'សាលាបឋមសិក្សា'}</p>
                    <p>ថ្នាក់ទី៖ {activeClass?.nameKm || 'ថ្នាក់ទី៦'} | ឆ្នាំសិក្សា៖ {activeClass?.academicYear || '2026-2027'}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p>កាលបរិច្ឆេទសរុប៖ {selectedMonth}</p>
                    <p>គ្រូបន្ទុកថ្នាក់៖ {activeClass?.teacherNameKm || 'គ្រូបង្រៀន'}</p>
                  </div>
                </div>
                <h3 className="text-base font-black text-slate-900 pt-3">
                  បញ្ជីវត្តមាន និងសរុបអវត្តមានសិស្សប្រចាំខែ
                </h3>
              </div>

              {/* Attendance Matrix Table */}
              <table className="w-full border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                    <th className="border border-slate-400 py-2 px-1 w-10">ល.រ</th>
                    <th className="border border-slate-400 py-2 px-2 w-24">អត្តលេខ</th>
                    <th className="border border-slate-400 py-2 px-3 text-left">គោត្តនាម និងនាម</th>
                    <th className="border border-slate-400 py-2 px-2 w-14">ភេទ</th>
                    <th className="border border-slate-400 py-2 px-2 bg-emerald-50 text-emerald-900">វត្តមាន (ថ្ងៃ)</th>
                    <th className="border border-slate-400 py-2 px-2 bg-amber-50 text-amber-900">ច្បាប់ (ច)</th>
                    <th className="border border-slate-400 py-2 px-2 bg-rose-50 text-rose-900">អត់ច្បាប់ (អច)</th>
                    <th className="border border-slate-400 py-2 px-2 bg-sky-50 text-sky-900">មកយឺត (យ)</th>
                    <th className="border border-slate-400 py-2 px-2 w-24">អត្រាវត្តមាន</th>
                    <th className="border border-slate-400 py-2 px-2 min-w-[120px]">ចំណាំ</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((stu, index) => {
                    const summary = getStudentMonthlyAttendance(stu.id, selectedMonth);
                    return (
                      <tr key={stu.id} className="text-center hover:bg-slate-50">
                        <td className="border border-slate-300 py-1.5 px-1 font-mono text-2xs">{index + 1}</td>
                        <td className="border border-slate-300 py-1.5 px-2 font-mono font-bold text-xs">{stu.studentId}</td>
                        <td className="border border-slate-300 py-1.5 px-3 text-left font-bold text-xs">
                          {stu.name}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 text-2xs">
                          {stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 font-bold text-emerald-800 bg-emerald-50/40">
                          {summary.presentDays}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 font-bold text-amber-800 bg-amber-50/40">
                          {summary.excusedDays > 0 ? summary.excusedDays : '-'}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 font-bold text-rose-800 bg-rose-50/40">
                          {summary.unexcusedDays > 0 ? summary.unexcusedDays : '-'}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 font-bold text-sky-800 bg-sky-50/40">
                          {summary.lateDays > 0 ? summary.lateDays : '-'}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 font-bold text-xs font-mono">
                          {summary.attendanceRate}%
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 text-2xs text-left text-slate-600">
                          {summary.unexcusedDays >= 3 ? '⚠️ អវត្តមានញឹកញាប់' : (summary.attendanceRate === 100 ? '⭐ វត្តមានល្អឥតខ្ចោះ' : '')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures & Footer */}
              <div className="flex justify-between items-start mt-8 pt-4 px-6 text-xs text-slate-800">
                <div className="text-center space-y-12">
                  <p className="font-bold">បានឃើញ និងឯកភាព</p>
                  <p className="font-bold">នាយកសាលា</p>
                  <p className="text-slate-400">................................................</p>
                </div>
                <div className="text-center space-y-12">
                  <p>ថ្ងៃទី........... ខែ........... ឆ្នាំ ២០២៦</p>
                  <p className="font-bold">គ្រូបន្ទុកថ្នាក់</p>
                  <p className="font-bold">{activeClass?.teacherNameKm || 'គ្រូបង្រៀន'}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
