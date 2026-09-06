import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  YearlyAcademicArchive, 
  ClassSection, 
  Student 
} from '../../types';
import { 
  exportFullBackupJSON, 
  exportAssessmentDataToCSV, 
  exportStudentsToCSV 
} from '../../utils/exportImport';
import { 
  Database, 
  Download, 
  Upload, 
  Archive, 
  FileSpreadsheet, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  RefreshCw,
  Info,
  HardDrive
} from 'lucide-react';

export const YearlyBackupRestoreCenter: React.FC = () => {
  const {
    language,
    classes,
    activeClass,
    students,
    classStudents,
    subjects,
    periods,
    scoresMatrix,
    weights,
    competencyWeights,
    gradeScales,
    calendarEvents,
    timetableSlots,
    curriculumPrograms,
    attendanceRecords,
    importFullData,
    resetToDefaults,
    showToast
  } = useGradebook();

  const ARCHIVES_STORAGE_KEY = 'moeys_yearly_archives_list';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved yearly archives in browser
  const [archives, setArchives] = useState<YearlyAcademicArchive[]>(() => {
    try {
      const saved = localStorage.getItem(ARCHIVES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Archive creation form
  const [archiveYear, setArchiveYear] = useState<string>(activeClass?.academicYear || '២០២៥-២០២៦');
  const [isCreatingArchive, setIsCreatingArchive] = useState(false);

  // Pre-import verification modal
  const [importFileContent, setImportFileContent] = useState<any>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // New academic year rollover modal
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [nextAcademicYear, setNextAcademicYear] = useState<string>('២០២៦-២០២៧');
  const [promoteGrades, setPromoteGrades] = useState(true);

  // Local storage usage measurement
  const [storageUsageKB, setStorageUsageKB] = useState<number>(0);

  useEffect(() => {
    try {
      let totalLength = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalLength += (localStorage[key].length + key.length) * 2;
        }
      }
      setStorageUsageKB(Math.round(totalLength / 1024));
    } catch (e) {
      console.error(e);
    }
  }, [classes, students, scoresMatrix, attendanceRecords, archives]);

  // Persist archives list
  useEffect(() => {
    try {
      localStorage.setItem(ARCHIVES_STORAGE_KEY, JSON.stringify(archives));
    } catch (e) {
      console.error(e);
    }
  }, [archives]);

  // Total records calculation
  const totalScoreRecords = useMemo(() => {
    let count = 0;
    Object.values(scoresMatrix).forEach(periodObj => {
      Object.values(periodObj).forEach(stuObj => {
        count += Object.keys(stuObj).length;
      });
    });
    return count;
  }, [scoresMatrix]);

  // 1. Export Full System Backup JSON
  const handleExportFullJSON = () => {
    const fullBackup = {
      version: '2.5.0',
      system: 'MoEYS Primary Gradebook & School Management System',
      exportedAt: new Date().toISOString(),
      academicYear: activeClass?.academicYear || '២០២៥-២០២៦',
      schoolName: activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាគំរូ',
      activeClassId: activeClass?.id,
      classes,
      students,
      subjects,
      periods,
      scoresMatrix,
      weights,
      competencyWeights,
      gradeScales,
      attendanceRecords,
      calendarEvents,
      timetableSlots,
      curriculumPrograms
    };

    exportFullBackupJSON(fullBackup);
    showToast(
      language === 'km' 
        ? 'បានទាញយកឯកសារបម្រុងទុកប្រព័ន្ធពេញលេញ (Full JSON Backup)' 
        : 'Full system backup JSON exported successfully', 
      'success'
    );
  };

  // 2. Save Current Academic Year Archive Snapshot
  const handleCreateYearlyArchive = () => {
    const archiveId = `archive_${Date.now()}`;
    const newArchive: YearlyAcademicArchive = {
      id: archiveId,
      academicYear: archiveYear.trim() || '២០២៥-២០២៦',
      archivedAt: new Date().toISOString(),
      schoolName: activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាគំរូ',
      classesCount: classes.length,
      studentsCount: students.length,
      recordsCount: totalScoreRecords,
      data: {
        classes: JSON.parse(JSON.stringify(classes)),
        students: JSON.parse(JSON.stringify(students)),
        scoresMatrix: JSON.parse(JSON.stringify(scoresMatrix)),
        attendanceRecords: JSON.parse(JSON.stringify(attendanceRecords)),
        calendarEvents: JSON.parse(JSON.stringify(calendarEvents)),
        timetableSlots: JSON.parse(JSON.stringify(timetableSlots)),
        curriculumPrograms: JSON.parse(JSON.stringify(curriculumPrograms)),
        weights: JSON.parse(JSON.stringify(weights)),
        competencyWeights: JSON.parse(JSON.stringify(competencyWeights)),
        gradeScales: JSON.parse(JSON.stringify(gradeScales)),
        subjects: JSON.parse(JSON.stringify(subjects)),
        periods: JSON.parse(JSON.stringify(periods))
      }
    };

    setArchives(prev => [newArchive, ...prev]);
    setIsCreatingArchive(false);
    showToast(
      language === 'km' 
        ? `បានរក្សាទុកបណ្ណសារឆ្នាំសិក្សា ${archiveYear} ជោគជ័យ!` 
        : `Archived academic year ${archiveYear} successfully!`, 
      'success'
    );
  };

  // 3. Restore from a saved Archive
  const handleRestoreFromArchive = (archive: YearlyAcademicArchive) => {
    if (window.confirm(
      language === 'km'
        ? `តើអ្នកប្រាកដជាចង់ស្តារទិន្នន័យនៃឆ្នាំសិក្សា "${archive.academicYear}" មកវិញមែនទេ? ទិន្នន័យបច្ចុប្បន្ននឹងត្រូវបានជំនួស។`
        : `Are you sure you want to restore data from academic year "${archive.academicYear}"? Current data will be overwritten.`
    )) {
      importFullData(archive.data);
      showToast(
        language === 'km' 
          ? `បានស្តារទិន្នន័យឆ្នាំសិក្សា ${archive.academicYear} ជោគជ័យ!` 
          : `Restored records for ${archive.academicYear}!`, 
        'success'
      );
    }
  };

  // 4. Delete an archive entry
  const handleDeleteArchive = (id: string) => {
    if (window.confirm(language === 'km' ? 'តើអ្នកចង់លុបបណ្ណសារនេះមែនទេ?' : 'Delete this archive?')) {
      setArchives(prev => prev.filter(a => a.id !== id));
      showToast(language === 'km' ? 'បានលុបបណ្ណសារ' : 'Deleted archive', 'info');
    }
  };

  // 5. File selection for JSON restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setImportFileContent(parsed);
        setShowImportConfirm(true);
      } catch (err) {
        showToast(language === 'km' ? 'ឯកសារ JSON មិនត្រឹមត្រូវ' : 'Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 6. Confirm JSON import
  const handleConfirmImport = () => {
    if (!importFileContent) return;
    const success = importFullData(importFileContent);
    if (success) {
      setShowImportConfirm(false);
      setImportFileContent(null);
    }
  };

  // 7. Rollover to New Academic Year
  const handleRolloverNewYear = () => {
    // 1st: Automatically snapshot current year into archives first for safety!
    handleCreateYearlyArchive();

    // 2nd: Update classes with new academic year
    const updatedClasses = classes.map(c => ({
      ...c,
      academicYear: nextAcademicYear,
      gradeLevel: promoteGrades ? Math.min(6, c.gradeLevel + 1) : c.gradeLevel,
      name: promoteGrades ? c.name.replace(`Grade ${c.gradeLevel}`, `Grade ${Math.min(6, c.gradeLevel + 1)}`) : c.name,
      nameKm: promoteGrades ? c.nameKm.replace(`ថ្នាក់ទី${c.gradeLevel}`, `ថ្នាក់ទី${Math.min(6, c.gradeLevel + 1)}`) : c.nameKm,
    }));

    // 3rd: Reset scores matrix for the new school year
    const cleanScoresMatrix: Record<string, Record<string, Record<string, any>>> = {};

    importFullData({
      classes: updatedClasses,
      scoresMatrix: cleanScoresMatrix,
      attendanceRecords: [] // Start attendance fresh for the new year
    });

    setShowRolloverModal(false);
    showToast(
      language === 'km' 
        ? `បានចាប់ផ្តើមឆ្នាំសិក្សាថ្មី ${nextAcademicYear} ដោយជោគជ័យ! (ឆ្នាំចាស់ត្រូវបានរក្សាទុកក្នុងបណ្ណសារ)` 
        : `Rolled over to new academic year ${nextAcademicYear}! (Previous year saved to archive)`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-heading font-black text-slate-900 dark:text-white">
                  {language === 'km' 
                    ? 'មជ្ឈមណ្ឌលបម្រុងទុក & ស្តារទិន្នន័យប្រចាំឆ្នាំ' 
                    : 'Yearly Data Backup & Restore Center'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300/60">
                  Yearly Archives
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km'
                  ? 'នាំចេញ/នាំចូលទិន្នន័យប្រចាំឆ្នាំពេញលេញ ស្តារបណ្ណសារ និងរៀបចំផ្ទេរឡើងឆ្នាំសិក្សាថ្មី'
                  : 'Full annual export/import, multi-year archives snapshot, and new academic year rollover'}
              </p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreatingArchive(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>{language === 'km' ? 'រក្សាទុកបណ្ណសារឆ្នាំ' : 'Archive Year'}</span>
            </button>

            <button
              onClick={handleExportFullJSON}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'km' ? 'ទាញយក JSON បម្រុងទុក' : 'Export Full Backup'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer whitespace-nowrap border border-slate-200 dark:border-slate-700">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'ស្តារពី JSON' : 'Restore JSON'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Storage Health & Database Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span>{language === 'km' ? 'ទំហំផ្ទុកក្នុងម៉ាស៊ីន' : 'LocalStorage Used'}</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-heading font-black text-slate-900 dark:text-white">
            {storageUsageKB} <span className="text-xs font-normal text-slate-500">KB</span>
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">សុវត្ថិភាពខ្ពស់ មិនបាត់បង់</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span>{language === 'km' ? 'សិស្ស & ថ្នាក់រៀន' : 'Students & Classes'}</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-heading font-black text-slate-900 dark:text-white">
            {students.length} <span className="text-xs font-normal text-slate-500">នាក់ ({classes.length} ថ្នាក់)</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">ទិន្នន័យជីវប្រវត្តិពេញលេញ</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span>{language === 'km' ? 'កំណត់ត្រាពិន្ទុ & វត្តមាន' : 'Scores & Attendance'}</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-heading font-black text-slate-900 dark:text-white">
            {totalScoreRecords} <span className="text-xs font-normal text-slate-500">ពិន្ទុ</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{attendanceRecords.length} កំណត់ត្រាវត្តមាន</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span>{language === 'km' ? 'បណ្ណសារឆ្នាំសិក្សា' : 'Saved Archives'}</span>
            <Archive className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-heading font-black text-slate-900 dark:text-white">
            {archives.length} <span className="text-xs font-normal text-slate-500">ឆ្នាំសិក្សា</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">បណ្ណសាររក្សាទុកក្នុងប្រព័ន្ធ</p>
        </div>
      </div>

      {/* SECTION 1: YEARLY ACADEMIC ARCHIVES (បណ្ណសារប្រចាំឆ្នាំ) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-heading font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>{language === 'km' ? 'បណ្ណសារតាមឆ្នាំសិក្សា (Yearly Archives)' : 'Yearly Academic Archives'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'km'
                ? 'រក្សាទុកទិន្នន័យប្រចាំឆ្នាំនីមួយៗជា Snapshot ដាច់ដោយឡែក ដើម្បីអាចចូលមើល ឬស្តារឡើងវិញបានគ្រប់ពេល'
                : 'Store snapshots of each academic year to reference or restore anytime'}
            </p>
          </div>

          <button
            onClick={() => setShowRolloverModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{language === 'km' ? 'ផ្ទេរឡើងឆ្នាំសិក្សាថ្មី (Rollover)' : 'New Academic Year'}</span>
          </button>
        </div>

        {/* List of Saved Archives */}
        {archives.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">
              {language === 'km' ? 'មិនទាន់មានបណ្ណសារឆ្នាំសិក្សាដែលបានរក្សាទុកនៅឡើយទេ' : 'No yearly archives saved yet.'}
            </p>
            <p className="text-[11px] text-slate-500">
              {language === 'km' 
                ? 'ចុចប៊ូតុង "រក្សាទុកបណ្ណសារឆ្នាំ" ខាងលើដើម្បីបង្កើត Snapshot នៃឆ្នាំសិក្សាបច្ចុប្បន្ន' 
                : 'Click "Archive Year" above to create a snapshot of the current academic year'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archives.map(archive => (
              <div 
                key={archive.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      ឆ្នាំសិក្សា {archive.academicYear}
                    </span>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mt-1">
                      {archive.schoolName}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleDeleteArchive(archive.id)}
                    title={language === 'km' ? 'លុបបណ្ណសារ' : 'Delete Archive'}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>ចំនួនថ្នាក់ & សិស្ស៖</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{archive.classesCount} ថ្នាក់ ({archive.studentsCount} នាក់)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>កាលបរិច្ឆេទរក្សាទុក៖</span>
                    <span>{new Date(archive.archivedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleRestoreFromArchive(archive)}
                    className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    {language === 'km' ? 'ស្តារទិន្នន័យឆ្នាំនេះ' : 'Restore Year'}
                  </button>

                  <button
                    onClick={() => exportFullBackupJSON(archive.data)}
                    title={language === 'km' ? 'ទាញយក JSON ឆ្នាំនេះ' : 'Download JSON'}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: MULTI-FORMAT YEARLY EXPORTS (EXCEL / CSV) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
        <div>
          <h2 className="text-base font-heading font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'km' ? 'ការនាំចេញរបាយការណ៍ប្រចាំឆ្នាំ (Yearly CSV / Excel)' : 'Yearly CSV & Excel Exports'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'km'
              ? 'ទាញយកតារាងពិន្ទុរួមប្រចាំឆ្នាំ និងបញ្ជីរាយនាមសិស្សជាទម្រង់ CSV គាំទ្រពុម្ពអក្សរខ្មែរ ១០០% លើ Microsoft Excel'
              : 'Download complete annual scoring sheets and student rosters compatible with Microsoft Excel'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Export Master Yearly Assessment Matrix */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'km' ? 'តារាងពិន្ទុរួមប្រចាំឆ្នាំ' : 'Annual Master Sheet'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'km' 
                ? 'តារាងពិន្ទុគ្រប់ខែ ឆមាសទី១ ឆមាសទី២ មធ្យមភាគប្រចាំឆ្នាំ សម្បទាទាំង៣ និងចំណាត់ថ្នាក់សិស្សទាំងអស់'
                : 'All monthly periods, term 1 & 2 exams, 3-pillar breakdown, annual averages, and final rankings'}
            </p>
            <button
              onClick={() => {
                exportAssessmentDataToCSV({
                  scope: 'all_periods',
                  currentPeriodId: periods[0]?.id || 'p_feb',
                  className: activeClass?.name || 'Class',
                  classNameKm: activeClass?.nameKm || 'ថ្នាក់',
                  students: classStudents,
                  subjects,
                  periods,
                  scoresMatrix,
                  weights,
                  competencyWeights,
                  gradeScales,
                  includeSubSkills: true,
                  includeCompetencies: true,
                  includeAttendance: true,
                  includeGuardianInfo: true,
                });
                showToast(language === 'km' ? 'បានទាញយកតារាងពិន្ទុរួមប្រចាំឆ្នាំ' : 'Exported annual master sheet', 'success');
              }}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ទាញយក CSV តារាងពិន្ទុ' : 'Export Annual CSV'}</span>
            </button>
          </div>

          {/* Export Student Roster CSV */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'km' ? 'បញ្ជីរាយនាមសិស្ស (Roster)' : 'Student Roster'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'km' 
                ? 'បញ្ជីឈ្មោះសិស្ស អត្តលេខ ថ្ងៃខែឆ្នាំកំណើត ឈ្មោះអាណាព្យាបាល លេខទូរស័ព្ទ និងស្ថិតិវត្តមាន'
                : 'Complete student biodata, dates of birth, parent contacts, phones, and cumulative attendance'}
            </p>
            <button
              onClick={() => {
                exportStudentsToCSV(classStudents, activeClass?.name || 'Class');
                showToast(language === 'km' ? 'បានទាញយកបញ្ជីរាយនាមសិស្ស' : 'Exported student roster', 'success');
              }}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ទាញយក CSV បញ្ជីសិស្ស' : 'Export Roster CSV'}</span>
            </button>
          </div>

          {/* Export Attendance CSV */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{language === 'km' ? 'សៀវភៅតាមដានវត្តមាន' : 'Attendance Log CSV'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'km' 
                ? 'កំណត់ត្រាវត្តមានប្រចាំថ្ងៃ ច្បាប់ អត់ច្បាប់ និងអត្រាវត្តមានសរុបពេញមួយឆ្នាំសិក្សា'
                : 'Daily attendance logs, excuses, absences, and final cumulative attendance percentages'}
            </p>
            <button
              onClick={() => {
                exportAssessmentDataToCSV({
                  scope: 'current_period',
                  currentPeriodId: periods[0]?.id || 'p_feb',
                  className: activeClass?.name || 'Class',
                  classNameKm: activeClass?.nameKm || 'ថ្នាក់',
                  students: classStudents,
                  subjects,
                  periods,
                  scoresMatrix,
                  weights,
                  competencyWeights,
                  gradeScales,
                  includeSubSkills: false,
                  includeCompetencies: false,
                  includeAttendance: true,
                  includeGuardianInfo: true,
                });
                showToast(language === 'km' ? 'បានទាញយកកំណត់ត្រាវត្តមាន' : 'Exported attendance log', 'success');
              }}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ទាញយក CSV វត្តមាន' : 'Export Attendance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: EMERGENCY RECOVERY & SAMPLE RESET */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
            {language === 'km' ? 'កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset to Sample Data)' : 'Reset Sample Data'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'km'
              ? 'ស្តារឡើងវិញនូវទិន្នន័យគំរូផ្លូវការរបស់ក្រសួងអប់រំ (ថ្នាក់ទី ៦ក, ៦ខ, ៥ក និងពិន្ទុពេញមួយឆ្នាំ)'
              : 'Restore the official demo database (Grade 6A, 6B, 5A with full yearly scores)'}
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm(language === 'km' ? 'តើអ្នកប្រាកដជាចង់កំណត់ទិន្នន័យឡើងវិញមែនទេ?' : 'Reset all data to defaults?')) {
              resetToDefaults();
            }
          }}
          className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
        >
          {language === 'km' ? 'កំណត់ទិន្នន័យឡើងវិញ' : 'Reset Defaults'}
        </button>
      </div>

      {/* Modal: Create Archive Snapshot */}
      {isCreatingArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-500" />
              <span>{language === 'km' ? 'រក្សាទុកបណ្ណសារឆ្នាំសិក្សា' : 'Create Yearly Archive'}</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'km'
                ? 'ប្រព័ន្ធនឹងបង្កើតច្បាប់ចម្លងបណ្ណសារនៃថ្នាក់រៀន ពិន្ទុ វត្តមាន និងព័ត៌មានសិស្សទាំងអស់នៃឆ្នាំសិក្សានេះ។'
                : 'A complete snapshot of all classes, scores, attendance and students will be saved.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឆ្នាំសិក្សាដែលត្រូវរក្សាទុក' : 'Academic Year Label'}
              </label>
              <input
                type="text"
                value={archiveYear}
                onChange={(e) => setArchiveYear(e.target.value)}
                placeholder="២០២៥-២០២៦"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsCreatingArchive(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleCreateYearlyArchive}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
              >
                {language === 'km' ? 'រក្សាទុកឥឡូវនេះ' : 'Archive Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pre-import JSON Inspection & Confirmation */}
      {showImportConfirm && importFileContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  {language === 'km' ? 'ផ្ទៀងផ្ទាត់ការស្តារទិន្នន័យ' : 'Verify JSON Restore'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {importFileName}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">ឆ្នាំសិក្សា៖</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{importFileContent.academicYear || 'មិនបានបញ្ជាក់'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">សាលារៀន៖</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{importFileContent.schoolName || 'សាលាបឋមសិក្សា'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ចំនួនថ្នាក់រៀន៖</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{importFileContent.classes?.length || 0} ថ្នាក់</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ចំនួនសិស្ស៖</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{importFileContent.students?.length || 0} នាក់</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              ⚠️ {language === 'km'
                ? 'ការស្តារឡើងវិញនឹងជំនួសទិន្នន័យបច្ចុប្បន្នទាំងអស់។ សូមប្រាកដថាអ្នកបានបម្រុងទុកទិន្នន័យចាស់រួចរាល់។'
                : 'Restoring will overwrite current gradebook data. Ensure you have backed up any current records.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowImportConfirm(false);
                  setImportFileContent(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                {language === 'km' ? 'យល់ព្រមស្តារទិន្នន័យ' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Academic Year Rollover Wizard */}
      {showRolloverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <span>{language === 'km' ? 'ផ្ទេរឡើងឆ្នាំសិក្សាថ្មី (Academic Rollover)' : 'New Academic Year Rollover'}</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'km'
                ? 'ប្រព័ន្ធនឹងរក្សាទុកទិន្នន័យឆ្នាំចាស់ក្នុងបណ្ណសារដោយស្វ័យប្រវត្តិ រួចរៀបចំទម្រង់សម្រាប់ឆ្នាំសិក្សាថ្មី។'
                : 'Current records will be safely archived first, then prepared for the new academic year.'}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ឈ្មោះឆ្នាំសិក្សាថ្មី' : 'New Academic Year'}
                </label>
                <input
                  type="text"
                  value={nextAcademicYear}
                  onChange={(e) => setNextAcademicYear(e.target.value)}
                  placeholder="២០២៦-២០២៧"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={promoteGrades}
                  onChange={(e) => setPromoteGrades(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>{language === 'km' ? 'លើកកម្ពស់កម្រិតថ្នាក់សិស្ស (Grade 5 -> 6, etc.)' : 'Promote grades automatically'}</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowRolloverModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleRolloverNewYear}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20"
              >
                {language === 'km' ? 'ចាប់ផ្តើមឆ្នាំថ្មី' : 'Start New Year'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
