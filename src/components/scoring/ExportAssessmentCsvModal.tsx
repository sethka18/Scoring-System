import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  X, 
  Layers, 
  Calendar, 
  Percent, 
  FileText, 
  CheckCircle2, 
  Info,
  Users,
  Award
} from 'lucide-react';
import { 
  Student, 
  Subject, 
  AssessmentPeriod, 
  AssessmentWeightConfig, 
  CompetencyPillarsWeight, 
  GradeScaleThreshold 
} from '../../types';
import { 
  exportAssessmentDataToCSV, 
  copyAssessmentDataToClipboard,
  buildAssessmentCSVData,
  ComprehensiveCSVExportOptions 
} from '../../utils/exportImport';

interface ExportAssessmentCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'km';
  className: string;
  classNameKm?: string;
  currentPeriod: AssessmentPeriod;
  selectedSubjectId: string;
  students: Student[];
  subjects: Subject[];
  periods: AssessmentPeriod[];
  scoresMatrix: Record<string, Record<string, Record<string, any>>>;
  weights: AssessmentWeightConfig;
  competencyWeights: CompetencyPillarsWeight;
  gradeScales: GradeScaleThreshold[];
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ExportAssessmentCsvModal: React.FC<ExportAssessmentCsvModalProps> = ({
  isOpen,
  onClose,
  language,
  className,
  classNameKm,
  currentPeriod,
  selectedSubjectId,
  students,
  subjects,
  periods,
  scoresMatrix,
  weights,
  competencyWeights,
  gradeScales,
  showToast,
}) => {
  const [scope, setScope] = useState<'current_period' | 'all_periods' | 'single_subject'>('current_period');
  const [includeSubSkills, setIncludeSubSkills] = useState<boolean>(true);
  const [includeCompetencies, setIncludeCompetencies] = useState<boolean>(true);
  const [includeAttendance, setIncludeAttendance] = useState<boolean>(true);
  const [includeGuardianInfo, setIncludeGuardianInfo] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  const exportOptions: ComprehensiveCSVExportOptions = {
    scope,
    currentPeriodId: currentPeriod.id,
    currentPeriodNameKm: currentPeriod.nameKm,
    currentPeriodNameEn: currentPeriod.nameEn,
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
  };

  // Preview metrics
  const previewData = buildAssessmentCSVData(exportOptions);

  const handleDownload = () => {
    setIsExporting(true);
    try {
      exportAssessmentDataToCSV(exportOptions);
      showToast(
        language === 'km' 
          ? `បានទាញយកឯកសារ CSV (${previewData.filename}) ដោយជោគជ័យ!` 
          : `Successfully exported CSV (${previewData.filename})!`,
        'success'
      );
      onClose();
    } catch (err) {
      console.error(err);
      showToast(
        language === 'km' ? 'មានបញ្ហាក្នុងការទាញយកឯកសារ' : 'Failed to export CSV',
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    const success = await copyAssessmentDataToClipboard(exportOptions);
    if (success) {
      setCopied(true);
      showToast(
        language === 'km' 
          ? 'បានចម្លងទិន្នន័យជាតារាងរួចរាល់! លោកគ្រូ-អ្នកគ្រូអាច Paste ចូល Excel ឬ Google Sheets បានភ្លាមៗ' 
          : 'Table copied to clipboard! You can paste directly into Excel or Google Sheets.',
        'success'
      );
      setTimeout(() => setCopied(false), 3000);
    } else {
      showToast(
        language === 'km' ? 'មិនអាចចម្លងទិន្នន័យបានទេ' : 'Failed to copy to clipboard',
        'warning'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">
                {language === 'km' ? 'នាំចេញទិន្នន័យពិន្ទុជាឯកសារ CSV' : 'Export Assessment Data to CSV'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'សម្រាប់រក្សាទុកក្រៅបណ្ដាញ (Backup) ឬវិភាគបន្តក្នុង Excel / Sheets' 
                  : 'For offline backup, Excel reporting, or secondary statistical analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {language === 'km' ? '១. ជ្រើសរើសទិន្នន័យដែលត្រូវនាំចេញ (Data Scope)' : '1. Select Export Scope'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option 1: Current Period */}
              <button
                type="button"
                onClick={() => setScope('current_period')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  scope === 'current_period'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-900 dark:text-white shadow-2xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 text-xs font-black">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'km' ? 'ដំណាក់កាលបច្ចុប្បន្ន' : 'Current Period'}</span>
                  </div>
                  {scope === 'current_period' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' 
                    ? `${currentPeriod.nameKm} (ពិន្ទុគ្រប់មុខវិជ្ជា)` 
                    : `${currentPeriod.nameEn} (All subjects matrix)`}
                </p>
              </button>

              {/* Option 2: All Periods Annual Ledger */}
              <button
                type="button"
                onClick={() => setScope('all_periods')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  scope === 'all_periods'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-900 dark:text-white shadow-2xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 text-xs font-black">
                    <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{language === 'km' ? 'សង្ខេបពេញមួយឆ្នាំសិក្សា' : 'Annual Ledger (All Periods)'}</span>
                  </div>
                  {scope === 'all_periods' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'km' 
                    ? 'ពិន្ទុគ្រប់ខែ ឆមាសទី១ ទី២ និងប្រចាំឆ្នាំ' 
                    : 'Full 10-month & 2-semester historical matrix'}
                </p>
              </button>

              {/* Option 3: Filtered Subject Only (if active) */}
              {selectedSubjectId !== 'all' && activeSubjectObj && (
                <button
                  type="button"
                  onClick={() => setScope('single_subject')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between sm:col-span-2 ${
                    scope === 'single_subject'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-900 dark:text-white shadow-2xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-xs font-black">
                      <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{language === 'km' ? `តែមុខវិជ្ជា៖ ${activeSubjectObj.nameKm}` : `Subject only: ${activeSubjectObj.nameEn}`}</span>
                    </div>
                    {scope === 'single_subject' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'km' 
                      ? 'ពិន្ទុលម្អិត និងចំណាត់ថ្នាក់ក្នុងមុខវិជ្ជានេះ' 
                      : 'Scores and ranking for this subject specifically'}
                  </p>
                </button>
              )}

            </div>
          </div>

          {/* Options Checklist */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {language === 'km' ? '២. ជម្រើសជួរឈរដែលត្រូវរួមបញ្ចូល (Column Fields)' : '2. Column Fields to Include'}
            </label>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              
              {/* Sub-skills breakdown */}
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSubSkills}
                  onChange={(e) => setIncludeSubSkills(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'km' ? 'រួមបញ្ចូលពិន្ទុជំនាញរងលម្អិត' : 'Include Sub-skills breakdown'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'km' 
                      ? 'ភាសាខ្មែរ (អាន, សរសេរ, ស្ដាប់, និយាយ) និង គណិតវិទ្យា (៥ ផ្នែក)' 
                      : 'Khmer 4-skills (reading, writing, listening, speaking) & Math 5 sections'}
                  </div>
                </div>
              </label>

              {/* 3 Pillars */}
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCompetencies}
                  onChange={(e) => setIncludeCompetencies(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'km' ? 'រួមបញ្ចូលសម្បទា ៣ យ៉ាង (៨០/១០/១០)' : 'Include MoEYS 3-Pillars Competencies'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'km' 
                      ? 'វិជ្ជាសម្បទា ៨០% + បំណិនសម្បទា ១០% + ចរិយាសម្បទា ១០%' 
                      : 'Knowledge (80%), Skill (10%), Attitude (10%) scores'}
                  </div>
                </div>
              </label>

              {/* Attendance */}
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAttendance}
                  onChange={(e) => setIncludeAttendance(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'km' ? 'រួមបញ្ចូលព័ត៌មានវត្តមាន និងចរិយាធម៌' : 'Include Attendance & Conduct'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'km' 
                      ? 'ចំនួនថ្ងៃវត្តមាន, អវត្តមានច្បាប់/ឥតច្បាប់, កម្រិតចរិយាធម៌' 
                      : 'Present days, excused/unexcused absences, and conduct grade'}
                  </div>
                </div>
              </label>

              {/* Guardian Info */}
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGuardianInfo}
                  onChange={(e) => setIncludeGuardianInfo(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'km' ? 'រួមបញ្ចូលព័ត៌មានអាណាព្យាបាល និងទំនាក់ទំនង' : 'Include Guardian contact details'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'km' 
                      ? 'ឈ្មោះអាណាព្យាបាល លេខទូរស័ព្ទ និងថ្ងៃខែឆ្នាំកំណើត' 
                      : 'Guardian name, telephone number, and student date of birth'}
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Export File Summary Box */}
          <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ចំនួនសិស្ស៖' : 'Students:'}</span>
              </span>
              <span className="font-black text-indigo-950 dark:text-indigo-200">
                {language === 'km' ? `${students.length} នាក់` : `${students.length} Students`}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ចំនួនជួរឈរទិន្នន័យ៖' : 'Columns Count:'}</span>
              </span>
              <span className="font-black text-indigo-950 dark:text-indigo-200">
                {language === 'km' ? `${previewData.headers.length} ជួរឈរ` : `${previewData.headers.length} Columns`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-100/60 dark:border-indigo-900/30">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ឈ្មោះឯកសារ៖' : 'Filename:'}</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                {previewData.filename}
              </span>
            </div>

            <div className="flex items-start space-x-1.5 pt-1 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                {language === 'km'
                  ? 'ឯកសារ CSV ត្រូវបានអ៊ិនកូដជាមួយ UTF-8 BOM ដូច្នេះអាចបើកជាមួយ Microsoft Excel ឬ Google Sheets ដោយមិនខូចពុម្ពអក្សរខ្មែរឡើយ។'
                  : 'Encoded with UTF-8 BOM to ensure flawless Khmer Unicode display in MS Excel & Google Sheets.'}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
            title="Copy as TSV table for immediate paste into Excel"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">{language === 'km' ? 'បានចម្លង!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'km' ? 'ចម្លងជាតារាង (Copy to Excel)' : 'Copy Table'}</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm hover:shadow shadow-emerald-600/20 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ទាញយកឯកសារ CSV' : 'Download CSV'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
