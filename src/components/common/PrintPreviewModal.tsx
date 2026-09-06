import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Printer, 
  FileDown, 
  Eye, 
  EyeOff, 
  X, 
  RotateCcw, 
  SlidersHorizontal, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Check, 
  CheckSquare, 
  Square, 
  Users, 
  FileText, 
  Layout, 
  Calendar, 
  Award, 
  Sparkles, 
  School, 
  Columns, 
  Layers, 
  Settings2, 
  ChevronDown,
  Info,
  Loader2
} from 'lucide-react';
import { MoEYSLogo } from './MoEYSLogo';
import { SchoolLogo } from './SchoolLogo';
import { exportElementToPdf } from '../../utils/pdfExport';
import { formatConductRating } from '../../utils/calculations';
import { Student, ClassSection, AssessmentPeriod } from '../../types';
import { ReportPrintOptions, DEFAULT_PRINT_OPTIONS } from '../reports/PrintOptionsModal';

// Khmer numerals mapping
const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
const toKhmerNum = (val: string | number): string => {
  return String(val).replace(/[0-9]/g, (d) => KHMER_DIGITS[parseInt(d, 10)] || d);
};

export interface RosterColumnConfig {
  showIndex: boolean;
  showStudentId: boolean;
  showName: boolean;
  showNameLatin: boolean;
  showGender: boolean;
  showDob: boolean;
  showGuardianName: boolean;
  showGuardianPhone: boolean;
  showAttendance: boolean;
  showConduct: boolean;
  showRemarks: boolean;
}

export const DEFAULT_ROSTER_COLUMNS: RosterColumnConfig = {
  showIndex: true,
  showStudentId: true,
  showName: true,
  showNameLatin: true,
  showGender: true,
  showDob: true,
  showGuardianName: true,
  showGuardianPhone: true,
  showAttendance: true,
  showConduct: true,
  showRemarks: true,
};

export interface RosterPrintSettings {
  columns: RosterColumnConfig;
  orientation: 'landscape' | 'portrait';
  pageSize: 'a4' | 'letter';
  density: 'compact' | 'normal' | 'spacious';
  showHeader: boolean;
  showSignatures: boolean;
  showStatistics: boolean;
  genderFilter: 'All' | 'Male' | 'Female';
}

export const DEFAULT_ROSTER_PRINT_SETTINGS: RosterPrintSettings = {
  columns: DEFAULT_ROSTER_COLUMNS,
  orientation: 'landscape',
  pageSize: 'a4',
  density: 'normal',
  showHeader: true,
  showSignatures: true,
  showStatistics: true,
  genderFilter: 'All',
};

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'roster' | 'report';
  // Props for Roster mode
  rosterStudents?: Student[];
  activeClass?: ClassSection;
  // Props for Report mode
  reportMode?: 'monthly' | 'yearly';
  reportOptions?: ReportPrintOptions;
  onReportOptionsChange?: (opts: ReportPrintOptions) => void;
  onOpenLayoutConfig?: () => void;
  renderReportCard?: (rankingOrSummary: any, options: ReportPrintOptions) => React.ReactNode;
  activeRanking?: any;
  activeSummary?: any;
  allRankings?: any[];
  allSummaries?: any[];
  currentStudent?: Student;
  currentPeriod?: AssessmentPeriod;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  rosterStudents = [],
  activeClass,
  reportMode = 'monthly',
  reportOptions = DEFAULT_PRINT_OPTIONS,
  onReportOptionsChange,
  onOpenLayoutConfig,
  renderReportCard,
  activeRanking,
  activeSummary,
  allRankings = [],
  allSummaries = [],
  currentStudent,
  currentPeriod,
}) => {
  const { language, schoolProfile, classStudents, addToast } = useGradebook();

  // Local Roster print settings
  const [rosterSettings, setRosterSettings] = useState<RosterPrintSettings>(DEFAULT_ROSTER_PRINT_SETTINGS);
  
  // Local Report settings
  const [localReportOptions, setLocalReportOptions] = useState<ReportPrintOptions>(reportOptions);
  const [reportPageSize, setReportPageSize] = useState<'a4' | 'a5' | 'letter'>(reportMode === 'monthly' ? 'a5' : 'a4');
  const [reportOrientation, setReportOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [reportBatchMode, setReportBatchMode] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent?.id || '');

  // UI view controls
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMsg, setExportMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'columns' | 'layout'>('columns');

  // Keep local report options synced
  useEffect(() => {
    setLocalReportOptions(reportOptions);
  }, [reportOptions]);

  // Keep selected student synced
  useEffect(() => {
    if (currentStudent?.id) {
      setSelectedStudentId(currentStudent.id);
    }
  }, [currentStudent?.id]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter roster students
  const displayedStudents = useMemo(() => {
    const list = rosterStudents.length > 0 ? rosterStudents : classStudents;
    if (rosterSettings.genderFilter === 'All') return list;
    return list.filter(s => s.gender === rosterSettings.genderFilter);
  }, [rosterStudents, classStudents, rosterSettings.genderFilter]);

  // Roster column definitions
  const rosterColumnItems: {
    key: keyof RosterColumnConfig;
    labelKm: string;
    labelEn: string;
    descKm: string;
    descEn: string;
  }[] = [
    { key: 'showIndex', labelKm: 'ល.រ (#)', labelEn: 'Index (#)', descKm: 'លេខរៀងលំដាប់សិស្ស', descEn: 'Sequential row number' },
    { key: 'showStudentId', labelKm: 'អត្តលេខ', labelEn: 'Student ID', descKm: 'កូដអត្តលេខសម្គាល់សិស្ស', descEn: 'Official ID code' },
    { key: 'showName', labelKm: 'គោត្តនាម និងនាម (ខ្មែរ)', labelEn: 'Full Name (Khmer)', descKm: 'ឈ្មោះពេញជាភាសាខ្មែរ', descEn: 'Full primary Khmer name' },
    { key: 'showNameLatin', labelKm: 'ឈ្មោះជាអក្សរឡាតាំង', labelEn: 'Latin Name', descKm: 'ឈ្មោះអង់គ្លេស / ឡាតាំង', descEn: 'Latin/English alphabet transcription' },
    { key: 'showGender', labelKm: 'ភេទ', labelEn: 'Gender', descKm: 'ភេទប្រុស ឬស្រី', descEn: 'Male or Female' },
    { key: 'showDob', labelKm: 'ថ្ងៃខែឆ្នាំកំណើត', labelEn: 'Date of Birth', descKm: 'កាលបរិច្ឆេតកំណើត', descEn: 'Birth date string' },
    { key: 'showGuardianName', labelKm: 'ឈ្មោះអាណាព្យាបាល', labelEn: 'Guardian Name', descKm: 'ឪពុក ម្តាយ ឬអាណាព្យាបាល', descEn: 'Parent or Guardian name' },
    { key: 'showGuardianPhone', labelKm: 'លេខទូរស័ព្ទ', labelEn: 'Phone Number', descKm: 'លេខទំនាក់ទំនងអាណាព្យាបាល', descEn: 'Guardian contact number' },
    { key: 'showAttendance', labelKm: 'វត្តមាន', labelEn: 'Attendance Record', descKm: 'អត្រាភាគរយ & វត្តមានសរុប', descEn: 'Attendance rate & days present' },
    { key: 'showConduct', labelKm: 'សីលធម៌', labelEn: 'Conduct Rating', descKm: 'ការវាយតម្លៃចរិយាធម៌សិស្ស', descEn: 'Conduct evaluation rating' },
    { key: 'showRemarks', labelKm: 'កំណត់សម្គាល់ / ហត្ថលេខា', labelEn: 'Remarks / Signatures', descKm: 'ប្រអប់ទទេសម្រាប់ចុះហត្ថលេខា ឬកំណត់សម្គាល់', descEn: 'Blank box for teacher remarks or sign-in' },
  ];

  // Report section & column definitions
  const reportOptionItems: {
    key: keyof ReportPrintOptions;
    labelKm: string;
    labelEn: string;
    descKm: string;
    descEn: string;
  }[] = [
    { key: 'showSubSkills', labelKm: 'ជួរឈរជំនាញរងលម្អិត (Sub-Skills)', labelEn: 'Sub-Skills Breakdown', descKm: 'អាន សរសេរ ស្ដាប់ និយាយ ពិជគណិត ធរណីមាត្រ', descEn: 'Detailed reading, writing, algebra components' },
    { key: 'showRank', labelKm: 'ចំណាត់ថ្នាក់សិស្ស (Student Rank)', labelEn: 'Rank Position', descKm: 'បង្ហាញចំណាត់ថ្នាក់សិស្សប្រចាំថ្នាក់ (#1, #2)', descEn: 'Show student class rank badge' },
    { key: 'showConduct', labelKm: 'កម្រិតចរិយាធម៌ (Conduct)', labelEn: 'Conduct Rating', descKm: 'ល្អប្រសើរ ល្អ ល្អបង្គួរ មធ្យម', descEn: 'Show official conduct evaluation' },
    { key: 'showAttendance', labelKm: 'វត្តមាន & អវត្តមាន (Attendance)', labelEn: 'Attendance Record', descKm: 'វត្តមាន អវត្តមានមានច្បាប់ និងឥតច្បាប់', descEn: 'Attendance rates and absence records' },
    { key: 'showTeacherComments', labelKm: 'មតិយោបល់គ្រូបន្ទុកថ្នាក់', labelEn: 'Teacher Comments', descKm: 'ការសង្កេត និងការវាយតម្លៃរបស់គ្រូ', descEn: 'Homeroom teacher feedback and notes' },
    { key: 'showParentFeedback', labelKm: 'ប្រអប់មតិមាតាបិតា', labelEn: 'Parent Feedback', descKm: 'បន្ទាត់ឆ្លើយតបសម្រាប់មាតាបិតា', descEn: 'Lines for parent observation & reply' },
    { key: 'show3Pillars', labelKm: 'សម្បទាទាំង ៣ MoEYS', labelEn: '3-Pillars Competency', descKm: 'វិជ្ជាសម្បទា បំណិនសម្បទា ចរិយាសម្បទា', descEn: 'Knowledge, skills, attitude scores' },
    { key: 'showSignatures', labelKm: 'ហត្ថលេខា & ត្រាសាលា', labelEn: 'Signatures & Seal', descKm: 'ហត្ថលេខាគ្រូ នាយកសាលា និងអាណាព្យាបាល', descEn: 'Official signature blocks and stamp' },
  ];

  // Roster column toggle
  const toggleRosterColumn = (key: keyof RosterColumnConfig) => {
    setRosterSettings(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [key]: !prev.columns[key],
      }
    }));
  };

  // Report option toggle
  const toggleReportOption = (key: keyof ReportPrintOptions) => {
    const updated = {
      ...localReportOptions,
      [key]: !localReportOptions[key],
    };
    setLocalReportOptions(updated);
    if (onReportOptionsChange) {
      onReportOptionsChange(updated);
    }
  };

  // Presets for Roster
  const applyRosterPreset = (preset: 'all' | 'standard' | 'attendance' | 'contacts' | 'compact') => {
    switch (preset) {
      case 'all':
        setRosterSettings(prev => ({
          ...prev,
          columns: { ...DEFAULT_ROSTER_COLUMNS },
          orientation: 'landscape',
        }));
        break;
      case 'standard':
        setRosterSettings(prev => ({
          ...prev,
          columns: {
            showIndex: true,
            showStudentId: true,
            showName: true,
            showNameLatin: false,
            showGender: true,
            showDob: true,
            showGuardianName: true,
            showGuardianPhone: true,
            showAttendance: false,
            showConduct: true,
            showRemarks: true,
          },
          orientation: 'landscape',
        }));
        break;
      case 'attendance':
        setRosterSettings(prev => ({
          ...prev,
          columns: {
            showIndex: true,
            showStudentId: true,
            showName: true,
            showNameLatin: false,
            showGender: true,
            showDob: false,
            showGuardianName: false,
            showGuardianPhone: false,
            showAttendance: true,
            showConduct: false,
            showRemarks: true,
          },
          orientation: 'portrait',
        }));
        break;
      case 'contacts':
        setRosterSettings(prev => ({
          ...prev,
          columns: {
            showIndex: true,
            showStudentId: true,
            showName: true,
            showNameLatin: false,
            showGender: true,
            showDob: false,
            showGuardianName: true,
            showGuardianPhone: true,
            showAttendance: false,
            showConduct: false,
            showRemarks: true,
          },
          orientation: 'portrait',
        }));
        break;
      case 'compact':
        setRosterSettings(prev => ({
          ...prev,
          columns: {
            showIndex: true,
            showStudentId: true,
            showName: true,
            showNameLatin: false,
            showGender: true,
            showDob: true,
            showGuardianName: false,
            showGuardianPhone: false,
            showAttendance: false,
            showConduct: true,
            showRemarks: false,
          },
          orientation: 'portrait',
          density: 'compact',
        }));
        break;
    }
  };

  // Presets for Report
  const applyReportPreset = (preset: 'all' | 'compact' | 'scoresOnly') => {
    let updated: ReportPrintOptions;
    if (preset === 'all') {
      updated = { ...DEFAULT_PRINT_OPTIONS };
    } else if (preset === 'compact') {
      updated = {
        showAttendance: true,
        showTeacherComments: true,
        showParentFeedback: false,
        showRank: true,
        showSubSkills: false,
        showConduct: true,
        show3Pillars: false,
        showSignatures: true,
      };
    } else {
      updated = {
        showAttendance: false,
        showTeacherComments: false,
        showParentFeedback: false,
        showRank: true,
        showSubSkills: false,
        showConduct: false,
        show3Pillars: false,
        showSignatures: true,
      };
    }
    setLocalReportOptions(updated);
    if (onReportOptionsChange) {
      onReportOptionsChange(updated);
    }
  };

  // Count active columns
  const activeRosterColumnsCount = Object.values(rosterSettings.columns).filter(Boolean).length;
  const totalRosterColumnsCount = Object.keys(rosterSettings.columns).length;

  const activeReportOptionsCount = Object.values(localReportOptions).filter(Boolean).length;
  const totalReportOptionsCount = Object.keys(localReportOptions).length;

  // Print Action
  const handlePrint = () => {
    const orientation = type === 'roster' ? rosterSettings.orientation : reportOrientation;
    const pageSize = type === 'roster' ? rosterSettings.pageSize : reportPageSize;

    document.documentElement.setAttribute('data-print-size', pageSize);
    document.documentElement.setAttribute('data-print-orientation', orientation);

    // Add helper class
    document.body.classList.add('body-print-preview-active');

    const originalTitle = document.title;
    const docTitle = type === 'roster'
      ? `MoEYS_Roster_${activeClass?.nameKm || 'Class'}_${pageSize.toUpperCase()}`
      : `MoEYS_Report_${currentStudent?.name || 'Student'}_${pageSize.toUpperCase()}`;
    document.title = docTitle;

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('body-print-preview-active');
        document.title = originalTitle;
      }, 500);
    }, 150);
  };

  // PDF Export Action
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportMsg(language === 'km' ? 'កំពុងបង្កើតឯកសារ PDF ផ្លូវការ...' : 'Exporting official PDF...');

    try {
      const orientation = type === 'roster' ? rosterSettings.orientation : reportOrientation;
      const pageSize = type === 'roster' ? rosterSettings.pageSize : reportPageSize;
      const fileName = type === 'roster'
        ? `MoEYS_Roster_${activeClass?.nameKm || activeClass?.name || 'Class'}`
        : `MoEYS_Report_${currentStudent?.name || 'Student'}_${reportMode}`;

      const element = document.getElementById('print-preview-document-sheet');
      if (!element) {
        throw new Error('Preview element not found');
      }

      const success = await exportElementToPdf(element, {
        fileName,
        pageSize: pageSize as 'a4' | 'a5' | 'letter',
        orientation: orientation as 'portrait' | 'landscape',
        marginMm: pageSize === 'a5' ? 5 : 8,
        scale: 2,
        onProgress: (msg) => setExportMsg(msg),
      });

      if (success) {
        addToast(
          language === 'km' ? `បានទាញយកឯកសារ PDF (${fileName}.pdf) ដោយជោគជ័យ!` : `Exported ${fileName}.pdf successfully!`,
          'success'
        );
      } else {
        handlePrint();
      }
    } catch (err) {
      console.error('PDF Export failed:', err);
      addToast(
        language === 'km' ? 'មិនអាចទាញយក PDF បានទេ កំពុងបើកផ្ទាំងបោះពុម្ពជំនួស...' : 'PDF generation failed, launching print...',
        'warning'
      );
      handlePrint();
    } finally {
      setIsExporting(false);
      setExportMsg('');
    }
  };

  // Gender counts for statistics
  const femaleCount = displayedStudents.filter(s => s.gender === 'Female').length;
  const maleCount = displayedStudents.filter(s => s.gender === 'Male').length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Top Header & Navigation Controls */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0 no-print">
        
        {/* Left: Document Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <Eye className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="font-heading font-black text-sm sm:text-base text-white truncate">
                {language === 'km' ? 'ផ្ទាំងមើលទិដ្ឋភាពបោះពុម្ព' : 'Print Preview Modal'}
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider shrink-0">
                {type === 'roster' 
                  ? (language === 'km' ? 'បញ្ជីរាយនាមសិស្ស (Roster)' : 'Class Roster') 
                  : (language === 'km' ? 'សន្លឹកលទ្ធផល (Report Card)' : 'Report Card')}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              {type === 'roster'
                ? `${activeClass?.nameKm || activeClass?.name || 'Class'} • ${schoolProfile?.schoolNameKm || 'MoEYS'} • ${displayedStudents.length} ${language === 'km' ? 'នាក់' : 'students'}`
                : `${currentStudent?.name || 'Student'} • ${reportMode === 'monthly' ? currentPeriod?.nameKm : activeClass?.academicYear}`}
            </p>
          </div>
        </div>

        {/* Center: Zoom & View Controls */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setZoomScale(prev => Math.max(50, prev - 15))}
            disabled={zoomScale <= 50}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-mono font-bold text-slate-300 min-w-[52px] text-center">
            {zoomScale}%
          </span>
          <button
            onClick={() => setZoomScale(prev => Math.min(150, prev + 15))}
            disabled={zoomScale >= 150}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomScale(100)}
            className="px-2 py-1 text-[11px] font-bold rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Reset Zoom to 100%"
          >
            100%
          </button>
        </div>

        {/* Right: Primary Print & PDF Export Buttons & Close */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Export to PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-75"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? (exportMsg || (language === 'km' ? 'កំពុងបង្កើត...' : 'Exporting...')) : (language === 'km' ? 'ទាញយកជា PDF' : 'Download PDF')}
            </span>
          </button>

          {/* Hardware Print Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'km' ? 'បោះពុម្ព (Print)' : 'Print Now'}
            </span>
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Left Settings Drawer & Right Live Preview Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Left Sidebar: Print & Column Settings (Width ~340px) */}
        <div className="w-full md:w-84 lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 no-print">
          
          {/* Settings Sub-Tabs */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('columns')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'columns'
                    ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ជម្រើសជួរឈរ' : 'Columns & Data'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                  {type === 'roster' ? `${activeRosterColumnsCount}/${totalRosterColumnsCount}` : `${activeReportOptionsCount}/${totalReportOptionsCount}`}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('layout')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'layout'
                    ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ប្លង់ & ក្រដាស' : 'Layout & Paper'}</span>
              </button>
            </div>

            {/* Quick Reset */}
            <button
              onClick={() => {
                if (type === 'roster') {
                  setRosterSettings(DEFAULT_ROSTER_PRINT_SETTINGS);
                } else {
                  setLocalReportOptions(DEFAULT_PRINT_OPTIONS);
                  if (onReportOptionsChange) onReportOptionsChange(DEFAULT_PRINT_OPTIONS);
                }
              }}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              title={language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset to Defaults'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tab 1: Column Toggles */}
          {activeTab === 'columns' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Presets Header */}
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  {language === 'km' ? 'កម្រងជម្រើសរហ័ស (Quick Presets)' : 'Quick Presets'}
                </span>
                
                {type === 'roster' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', labelKm: 'ទាំងអស់', labelEn: 'All' },
                      { id: 'standard', labelKm: 'ស្តង់ដារ', labelEn: 'Standard' },
                      { id: 'attendance', labelKm: 'វត្តមាន', labelEn: 'Attendance' },
                      { id: 'contacts', labelKm: 'ទំនាក់ទំនង', labelEn: 'Contacts' },
                      { id: 'compact', labelKm: 'សង្ខេប', labelEn: 'Compact' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyRosterPreset(p.id as any)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        {language === 'km' ? p.labelKm : p.labelEn}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', labelKm: 'បង្ហាញទាំងអស់', labelEn: 'Show All' },
                      { id: 'compact', labelKm: 'ទម្រង់សង្ខេប', labelEn: 'Compact' },
                      { id: 'scoresOnly', labelKm: 'ពិន្ទុសុទ្ធ', labelEn: 'Scores Only' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyReportPreset(p.id as any)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        {language === 'km' ? p.labelKm : p.labelEn}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Roster Column Checkboxes */}
              {type === 'roster' ? (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-500">
                    <span>{language === 'km' ? 'ជួរឈរតារាងសិស្ស (Columns)' : 'Roster Columns'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allOn = activeRosterColumnsCount === totalRosterColumnsCount;
                        const newCols = Object.keys(rosterSettings.columns).reduce((acc, k) => {
                          acc[k as keyof RosterColumnConfig] = !allOn;
                          return acc;
                        }, {} as RosterColumnConfig);
                        setRosterSettings(prev => ({ ...prev, columns: newCols }));
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {activeRosterColumnsCount === totalRosterColumnsCount 
                        ? (language === 'km' ? 'បិទទាំងអស់' : 'Disable All') 
                        : (language === 'km' ? 'បើកទាំងអស់' : 'Enable All')}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {rosterColumnItems.map((col) => {
                      const isChecked = rosterSettings.columns[col.key];
                      return (
                        <div
                          key={col.key}
                          onClick={() => toggleRosterColumn(col.key)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
                            isChecked
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 text-slate-900 dark:text-white'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-75'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate">
                                {language === 'km' ? col.labelKm : col.labelEn}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                                {language === 'km' ? col.descKm : col.descEn}
                              </span>
                            </div>
                          </div>

                          <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            isChecked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}>
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isChecked ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Report Card Section Toggles */
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-500">
                    <span>{language === 'km' ? 'ផ្នែកទិន្នន័យលើសន្លឹកពិន្ទុ' : 'Report Card Sections'}</span>
                  </div>

                  <div className="space-y-1.5">
                    {reportOptionItems.map((item) => {
                      const isChecked = localReportOptions[item.key];
                      return (
                        <div
                          key={item.key}
                          onClick={() => toggleReportOption(item.key)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
                            isChecked
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 text-slate-900 dark:text-white'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-75'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate">
                                {language === 'km' ? item.labelKm : item.labelEn}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                                {language === 'km' ? item.descKm : item.descEn}
                              </span>
                            </div>
                          </div>

                          <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            isChecked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}>
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isChecked ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Layout & Paper Settings */}
          {activeTab === 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* MoEYS Layout & Stamp Configuration Trigger (for report cards) */}
              {type === 'report' && onOpenLayoutConfig && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-slate-800 dark:text-amber-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading font-black text-xs text-amber-950 dark:text-amber-200 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{language === 'km' ? 'ទម្រង់ MoEYS & ត្រាសាលា' : 'MoEYS Style & Stamp'}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-[10px] font-black text-amber-950">
                      {language === 'km' ? 'ផ្លូវការ' : 'Official'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300 mb-2.5">
                    {language === 'km' 
                      ? 'ប្តូររចនាបថទម្រង់ក្រសួង MoEYS ៤ បែប បន្ថែមឡូហ្គោ ឬត្រាមូលក្រហម' 
                      : 'Switch between 4 MoEYS layout styles, custom school logos, or red official stamps.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenLayoutConfig()}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'បើកផ្ទាំងកំណត់ទម្រង់ & ត្រា' : 'Configure MoEYS Layout & Stamp'}</span>
                  </button>
                </div>
              )}

              {/* Paper Size */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  {language === 'km' ? 'ទំហំក្រដាស (Paper Size)' : 'Paper Size'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['a4', 'a5', 'letter'] as const).map((ps) => {
                    const active = type === 'roster' ? rosterSettings.pageSize === ps : reportPageSize === ps;
                    return (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => {
                          if (type === 'roster') {
                            setRosterSettings(prev => ({ ...prev, pageSize: ps as any }));
                          } else {
                            setReportPageSize(ps);
                          }
                        }}
                        className={`py-2 px-3 rounded-xl font-bold uppercase transition cursor-pointer text-center border ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {ps.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  {language === 'km' ? 'ទិសដៅក្រដាស (Orientation)' : 'Orientation'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'portrait', labelKm: 'បញ្ឈរ (Portrait)', labelEn: 'Portrait' },
                    { id: 'landscape', labelKm: 'ផ្ដេក (Landscape)', labelEn: 'Landscape' },
                  ].map((o) => {
                    const active = type === 'roster' ? rosterSettings.orientation === o.id : reportOrientation === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          if (type === 'roster') {
                            setRosterSettings(prev => ({ ...prev, orientation: o.id as any }));
                          } else {
                            setReportOrientation(o.id as any);
                          }
                        }}
                        className={`py-2 px-3 rounded-xl font-bold transition cursor-pointer text-center border ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {language === 'km' ? o.labelKm : o.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Roster Specific: Density & Header Settings */}
              {type === 'roster' && (
                <>
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      {language === 'km' ? 'គម្លាតបន្ទាត់ជួរដេក (Row Density)' : 'Row Density'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'compact', labelKm: 'ណែន (Compact)', labelEn: 'Compact' },
                        { id: 'normal', labelKm: 'មធ្យម (Normal)', labelEn: 'Normal' },
                        { id: 'spacious', labelKm: 'ទូលាយ (Spacious)', labelEn: 'Spacious' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setRosterSettings(prev => ({ ...prev, density: d.id as any }))}
                          className={`py-2 px-2 text-[11px] rounded-xl font-bold transition cursor-pointer text-center border ${
                            rosterSettings.density === d.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {language === 'km' ? d.labelKm : d.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Header & Signatures */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      {language === 'km' ? 'ក្បាលទំព័រ & កន្ទុយទំព័រ' : 'Header & Footer Elements'}
                    </label>

                    {[
                      { key: 'showHeader', labelKm: 'បង្ហាញក្បាលទំព័រផ្លូវការ MoEYS', labelEn: 'Show Official MoEYS Header' },
                      { key: 'showStatistics', labelKm: 'បង្ហាញស្ថិតិសិស្ស (សរុប & ស្រី)', labelEn: 'Show Student Statistics Summary' },
                      { key: 'showSignatures', labelKm: 'បង្ហាញកន្លែងចុះហត្ថលេខាគ្រូ & នាយក', labelEn: 'Show Signatures & Date Block' },
                    ].map(h => {
                      const checked = rosterSettings[h.key as keyof RosterPrintSettings] as boolean;
                      return (
                        <label key={h.key} className="flex items-center space-x-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setRosterSettings(prev => ({ ...prev, [h.key]: e.target.checked }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {language === 'km' ? h.labelKm : h.labelEn}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Gender Filter within Print */}
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      {language === 'km' ? 'ចម្រាញ់តាមភេទ (Gender Filter)' : 'Filter by Gender'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'All', labelKm: 'ទាំងអស់', labelEn: 'All' },
                        { id: 'Female', labelKm: 'សិស្សស្រី', labelEn: 'Female' },
                        { id: 'Male', labelKm: 'សិស្សប្រុស', labelEn: 'Male' },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setRosterSettings(prev => ({ ...prev, genderFilter: g.id as any }))}
                          className={`py-1.5 px-2 text-xs rounded-xl font-bold transition cursor-pointer text-center border ${
                            rosterSettings.genderFilter === g.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {language === 'km' ? g.labelKm : g.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Report Specific: Batch / Student Selection */}
              {type === 'report' && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      {language === 'km' ? 'ជ្រើសរើសសិស្សដើម្បីមើល' : 'Select Student to Preview'}
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {classStudents.map(stu => (
                        <option key={stu.id} value={stu.id}>
                          {stu.name} ({stu.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2.5 cursor-pointer p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-850">
                      <input
                        type="checkbox"
                        checked={reportBatchMode}
                        onChange={(e) => setReportBatchMode(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 block">
                          {language === 'km' ? 'មើល និងបោះពុម្ពសិស្សទាំងអស់ក្នុងថ្នាក់' : 'Batch Preview All Students'}
                        </span>
                        <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block">
                          {language === 'km' ? `រៀបចំទម្រង់បោះពុម្ពសម្រាប់សិស្សទាំង ${classStudents.length} នាក់` : `Generate slips for all ${classStudents.length} students`}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Sidebar Footer Info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                {language === 'km' ? 'ទិដ្ឋភាពផ្សាយបន្តផ្ទាល់តាមការកែសម្រួល' : 'Live reactive print preview'}
              </span>
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {type === 'roster' ? `${displayedStudents.length} rows` : (reportBatchMode ? `${classStudents.length} slips` : '1 slip')}
            </span>
          </div>
        </div>

        {/* Right Canvas: Realistic Paper Preview */}
        <div className="flex-1 bg-slate-900/90 overflow-auto p-4 sm:p-8 flex items-start justify-center">
          
          <div 
            style={{ 
              transform: `scale(${zoomScale / 100})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="flex flex-col items-center"
          >
            
            {/* Paper Dimension Badge */}
            <div className="mb-3 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-300 flex items-center space-x-2 no-print shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {type === 'roster' 
                  ? `${rosterSettings.pageSize.toUpperCase()} • ${rosterSettings.orientation === 'landscape' ? 'Landscape (297 × 210 mm)' : 'Portrait (210 × 297 mm)'}` 
                  : `${reportPageSize.toUpperCase()} • ${reportOrientation === 'landscape' ? 'Landscape' : 'Portrait'}`}
              </span>
              <span>•</span>
              <span className="text-indigo-300">
                {type === 'roster' ? `${activeRosterColumnsCount} columns` : `${activeReportOptionsCount} sections`}
              </span>
            </div>

            {/* Realistic Paper Sheet */}
            <div 
              id="print-preview-document-sheet"
              className={`bg-white text-slate-900 shadow-2xl rounded-sm transition-all printable-area ${
                type === 'roster'
                  ? (rosterSettings.orientation === 'landscape' 
                      ? 'w-[297mm] min-h-[210mm] p-8 sm:p-10' 
                      : 'w-[210mm] min-h-[297mm] p-8 sm:p-10')
                  : (reportPageSize === 'a5'
                      ? 'w-[148mm] min-h-[210mm] p-6'
                      : (reportOrientation === 'landscape' ? 'w-[297mm] min-h-[210mm] p-8' : 'w-[210mm] min-h-[297mm] p-8 sm:p-10'))
              }`}
            >

              {/* ========================================================= */}
              {/* ROSTER PREVIEW RENDERING */}
              {/* ========================================================= */}
              {type === 'roster' && (
                <div className="space-y-5">
                  
                  {/* MoEYS Official Header */}
                  {rosterSettings.showHeader && (
                    <div className="border-b-2 border-slate-900 pb-3">
                      <div className="flex justify-between items-start text-xs font-semibold text-slate-800">
                        {/* School / Ministry Info */}
                        <div className="text-left flex items-start space-x-3">
                          <MoEYSLogo size={42} />
                          <div>
                            <p className="font-extrabold text-slate-950 uppercase text-xs tracking-wide">
                              {language === 'km' ? 'ក្រសួងអប់រំ យុវជន និងកីឡា' : 'Ministry of Education, Youth and Sport'}
                            </p>
                            <p className="text-slate-700 font-bold text-[11px]">
                              {language === 'km' 
                                ? (schoolProfile?.schoolNameKm || activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាព្រៃឈរ') 
                                : (schoolProfile?.schoolName || activeClass?.schoolName || 'Prey Chhor Primary School')}
                            </p>
                            <p className="text-slate-500 font-medium text-[10px]">
                              {schoolProfile?.district || activeClass?.district || 'ស្រុកព្រៃឈរ'} • {schoolProfile?.province || activeClass?.province || 'ខេត្តកំពង់ចាម'}
                            </p>
                          </div>
                        </div>

                        {/* Kingdom Motto */}
                        <div className="text-right">
                          <p className="font-black text-slate-950 text-xs tracking-wider">
                            {language === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'Kingdom of Cambodia'}
                          </p>
                          <p className="text-slate-600 font-bold text-[11px]">
                            {language === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'Nation Religion King'}
                          </p>
                          <p className="text-[11px] text-amber-700 tracking-widest font-serif select-none leading-none mt-0.5">❖ ❖ ❖</p>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="text-center mt-3">
                        <h1 className="font-heading font-black text-base sm:text-xl text-slate-950 uppercase tracking-wide">
                          {language === 'km' ? 'បញ្ជីរាយនាមសិស្សប្រចាំថ្នាក់' : 'Official Class Student Roster'}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-x-3 text-xs font-bold text-indigo-950 mt-1">
                          <span>
                            {language === 'km' ? `ថ្នាក់ទី៖ ${activeClass?.nameKm || activeClass?.name || '៦ក'}` : `Class: ${activeClass?.name || 'Grade 6A'}`}
                          </span>
                          <span>•</span>
                          <span>
                            {language === 'km' ? `បន្ទប់លេខ៖ ${activeClass?.roomNumber || '០១'}` : `Room: ${activeClass?.roomNumber || '01'}`}
                          </span>
                          <span>•</span>
                          <span>
                            {language === 'km' ? `ឆ្នាំសិក្សា៖ ${activeClass?.academicYear || '២០២៦-២០២៧'}` : `Year: ${activeClass?.academicYear || '2026-2027'}`}
                          </span>
                          <span>•</span>
                          <span>
                            {language === 'km' ? `គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherName || 'លោកគ្រូ អ្នកគ្រូ'}` : `Teacher: ${activeClass?.teacherName || 'Homeroom Teacher'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Roster Table */}
                  <div className="overflow-x-auto border border-slate-400">
                    <table className={`w-full text-left border-collapse ${
                      rosterSettings.density === 'compact' ? 'text-[10px]' : (rosterSettings.density === 'spacious' ? 'text-xs sm:text-sm' : 'text-xs')
                    }`}>
                      <thead className="bg-slate-100 text-slate-950 font-black border-b-2 border-slate-400">
                        <tr>
                          {rosterSettings.columns.showIndex && (
                            <th className="py-2 px-2 text-center w-10 border-r border-slate-300 font-bold">ល.រ</th>
                          )}
                          {rosterSettings.columns.showStudentId && (
                            <th className="py-2 px-2.5 border-r border-slate-300 font-bold">អត្តលេខ</th>
                          )}
                          {rosterSettings.columns.showName && (
                            <th className="py-2 px-3 border-r border-slate-300 font-bold">គោត្តនាម និងនាម</th>
                          )}
                          {rosterSettings.columns.showNameLatin && (
                            <th className="py-2 px-2.5 border-r border-slate-300 font-bold">ឈ្មោះឡាតាំង</th>
                          )}
                          {rosterSettings.columns.showGender && (
                            <th className="py-2 px-2 text-center w-12 border-r border-slate-300 font-bold">ភេទ</th>
                          )}
                          {rosterSettings.columns.showDob && (
                            <th className="py-2 px-2.5 border-r border-slate-300 font-bold">ថ្ងៃខែឆ្នាំកំណើត</th>
                          )}
                          {rosterSettings.columns.showGuardianName && (
                            <th className="py-2 px-2.5 border-r border-slate-300 font-bold">ឈ្មោះអាណាព្យាបាល</th>
                          )}
                          {rosterSettings.columns.showGuardianPhone && (
                            <th className="py-2 px-2.5 border-r border-slate-300 font-bold">លេខទូរស័ព្ទ</th>
                          )}
                          {rosterSettings.columns.showAttendance && (
                            <th className="py-2 px-2 text-center border-r border-slate-300 font-bold">វត្តមាន (%)</th>
                          )}
                          {rosterSettings.columns.showConduct && (
                            <th className="py-2 px-2 text-center border-r border-slate-300 font-bold">សីលធម៌</th>
                          )}
                          {rosterSettings.columns.showRemarks && (
                            <th className="py-2 px-3 font-bold min-w-[90px]">កំណត់សម្គាល់/ហត្ថលេខា</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {displayedStudents.map((student, idx) => {
                          const present = student.attendanceCount?.present ?? 0;
                          const excused = student.attendanceCount?.absentExcused ?? 0;
                          const unexcused = student.attendanceCount?.absentUnexcused ?? 0;
                          const totalDays = present + excused + unexcused;
                          const attRate = totalDays > 0 ? ((present / totalDays) * 100).toFixed(0) : '100';

                          const cellPadding = rosterSettings.density === 'compact' ? 'py-1 px-2' : (rosterSettings.density === 'spacious' ? 'py-2.5 px-3' : 'py-1.5 px-2.5');

                          return (
                            <tr key={student.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                              {rosterSettings.columns.showIndex && (
                                <td className={`${cellPadding} text-center font-bold text-slate-700 border-r border-slate-200`}>
                                  {idx + 1}
                                </td>
                              )}
                              {rosterSettings.columns.showStudentId && (
                                <td className={`${cellPadding} font-mono font-bold text-slate-800 border-r border-slate-200`}>
                                  {student.studentId}
                                </td>
                              )}
                              {rosterSettings.columns.showName && (
                                <td className={`${cellPadding} font-bold text-slate-950 border-r border-slate-200`}>
                                  {student.name}
                                </td>
                              )}
                              {rosterSettings.columns.showNameLatin && (
                                <td className={`${cellPadding} font-medium text-slate-700 border-r border-slate-200`}>
                                  {student.nameLatin || '-'}
                                </td>
                              )}
                              {rosterSettings.columns.showGender && (
                                <td className={`${cellPadding} text-center font-bold border-r border-slate-200`}>
                                  <span className={student.gender === 'Female' ? 'text-pink-700' : 'text-blue-800'}>
                                    {student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                                  </span>
                                </td>
                              )}
                              {rosterSettings.columns.showDob && (
                                <td className={`${cellPadding} text-slate-700 border-r border-slate-200 whitespace-nowrap`}>
                                  {student.dob || '-'}
                                </td>
                              )}
                              {rosterSettings.columns.showGuardianName && (
                                <td className={`${cellPadding} text-slate-800 border-r border-slate-200`}>
                                  {student.guardianName || '-'}
                                </td>
                              )}
                              {rosterSettings.columns.showGuardianPhone && (
                                <td className={`${cellPadding} text-slate-700 font-mono border-r border-slate-200 whitespace-nowrap`}>
                                  {student.guardianPhone || '-'}
                                </td>
                              )}
                              {rosterSettings.columns.showAttendance && (
                                <td className={`${cellPadding} text-center font-bold text-slate-800 border-r border-slate-200`}>
                                  {attRate}%
                                </td>
                              )}
                              {rosterSettings.columns.showConduct && (
                                <td className={`${cellPadding} text-center font-bold border-r border-slate-200`}>
                                  {formatConductRating(student.conductRating, language)}
                                </td>
                              )}
                              {rosterSettings.columns.showRemarks && (
                                <td className={`${cellPadding} text-slate-400 italic text-[10px]`}>
                                  {student.notes || ''}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Statistics */}
                  {rosterSettings.showStatistics && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                      <div className="flex items-center space-x-4">
                        <span>សរុបសិស្ស៖ <strong className="text-indigo-950 font-black">{displayedStudents.length}</strong> នាក់</span>
                        <span>ស្រី៖ <strong className="text-pink-700 font-black">{femaleCount}</strong> នាក់</span>
                        <span>ប្រុស៖ <strong className="text-blue-800 font-black">{maleCount}</strong> នាក់</span>
                      </div>
                      <div className="text-slate-500 font-medium">
                        * បញ្ជីផ្លូវការទទួលស្គាល់ដោយនាយកសាលា និងគ្រូបន្ទុកថ្នាក់
                      </div>
                    </div>
                  )}

                  {/* Official Signatures Block */}
                  {rosterSettings.showSignatures && (
                    <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-slate-800">
                      {/* Principal Signature */}
                      <div className="text-center space-y-1">
                        <p className="font-bold">បានឃើញ និងឯកភាព</p>
                        <p className="text-[11px] text-slate-600">ថ្ងៃទី......... ខែ......... ឆ្នាំ២០២...</p>
                        <p className="font-black text-slate-950 text-sm mt-1">នាយក/នាយិកាសាលា</p>
                        <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                          (ហត្ថលេខា និងត្រា)
                        </div>
                        <p className="font-bold text-slate-900">
                          {schoolProfile?.principalNameKm || 'នាយកសាលា'}
                        </p>
                      </div>

                      {/* Homeroom Teacher Signature */}
                      <div className="text-center space-y-1">
                        <p className="text-[11px] text-slate-600">ថ្ងៃ................ ទី...... ខែ......... ឆ្នាំ២០២...</p>
                        <p className="font-black text-slate-950 text-sm mt-1">គ្រូបន្ទុកថ្នាក់</p>
                        <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                          (ហត្ថលេខា)
                        </div>
                        <p className="font-bold text-slate-900">
                          {activeClass?.teacherName || 'គ្រូបន្ទុកថ្នាក់'}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ========================================================= */}
              {/* REPORT CARD PREVIEW RENDERING */}
              {/* ========================================================= */}
              {type === 'report' && renderReportCard && (
                <div className="space-y-6">
                  {reportBatchMode ? (
                    (reportMode === 'monthly' ? allRankings : allSummaries).map(item => (
                      <div key={item.student?.id || Math.random()} className="page-break-after">
                        {renderReportCard(item, localReportOptions)}
                      </div>
                    ))
                  ) : (
                    <div>
                      {(() => {
                        const targetStudent = classStudents.find(s => s.id === selectedStudentId) || currentStudent;
                        const targetItem = reportMode === 'monthly'
                          ? (allRankings.find(r => r.student?.id === targetStudent?.id) || activeRanking)
                          : (allSummaries.find(s => s.student?.id === targetStudent?.id) || activeSummary);
                        
                        return renderReportCard(targetItem, localReportOptions);
                      })()}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
