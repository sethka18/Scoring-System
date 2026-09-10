import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  TableProperties, 
  Sliders, 
  Download, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Calendar, 
  BookOpen, 
  User, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Percent,
  Search,
  Zap,
  Star,
  Printer,
  Award,
  HeartHandshake,
  Brain,
  FileSpreadsheet,
  BookmarkCheck,
  FileQuestion
} from 'lucide-react';
import { calculatePeriodAverage, calculatePeriodRankings } from '../../utils/calculations';
import { exportAssessmentDataToCSV } from '../../utils/exportImport';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { ExportAssessmentCsvModal } from './ExportAssessmentCsvModal';
import { useAssessmentAutoSave, AutoSaveBackupData } from '../../hooks/useAssessmentAutoSave';
import { AssessmentAutoSaveBadge } from './AssessmentAutoSaveBadge';
import { useAssessmentTemplates } from '../../hooks/useAssessmentTemplates';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { RapidGradingModal } from './RapidGradingModal';
import { AssessmentTemplate } from '../../types';

export const AssessmentScoringHub: React.FC = () => {
  const {
    language,
    activeClass,
    classStudents,
    subjects,
    periods,
    scoresMatrix,
    weights,
    competencyWeights,
    gradeScales,
    updateSubjectScore,
    bulkUpdatePeriodScores,
    updateWeights,
    updateCompetencyWeights,
    updateStudent,
    restoreScoresMatrix,
    showToast,
    setActiveTab,
  } = useGradebook();

  const getLetterGrade = (avg: number) => {
    const percentage = avg * 10;
    const matched = gradeScales.find(s => percentage >= s.minPercentage);
    if (matched && ['A', 'B', 'C', 'D', 'E', 'F'].includes(matched.grade)) {
      return matched.grade;
    }
    return avg >= 8.5 ? 'A' : avg >= 7.5 ? 'B' : avg >= 6.5 ? 'C' : avg >= 6.0 ? 'D' : avg >= 5.0 ? 'E' : 'F';
  };

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(periods[0]?.id || 'month_dec');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [showSubSkillsMatrix, setShowSubSkillsMatrix] = useState<boolean>(true);
  const [showWeightsModal, setShowWeightsModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bulkScoreValue, setBulkScoreValue] = useState<number>(8.0);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showExportCsvModal, setShowExportCsvModal] = useState<boolean>(false);

  // Template Library & Rapid Grading State
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    resetToDefaults,
    exportTemplatesJson,
    importTemplates,
  } = useAssessmentTemplates();

  const [showTemplateLibraryModal, setShowTemplateLibraryModal] = useState<boolean>(false);
  const [activeRapidTemplate, setActiveRapidTemplate] = useState<AssessmentTemplate | null>(null);
  const [showRapidGradingModal, setShowRapidGradingModal] = useState<boolean>(false);
  const [initialTemplateSubjectId, setInitialTemplateSubjectId] = useState<string | null>(null);

  const handleSelectTemplateForGrading = (template: AssessmentTemplate) => {
    setActiveRapidTemplate(template);
    setShowRapidGradingModal(true);
  };

  const handleSelectSubjectInMatrix = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const handleOpenSaveCurrentAsTemplate = () => {
    setInitialTemplateSubjectId(selectedSubjectId === 'all' ? null : selectedSubjectId);
    setShowTemplateLibraryModal(true);
  };

  const handleApplyRapidScores = (
    updates: { studentId: string; score: number; remark?: string }[],
    targetField: string,
    subjectId: string
  ) => {
    markDirty();
    updates.forEach(u => {
      const payload: any = {
        [targetField]: u.score,
      };
      if (u.remark !== undefined) {
        payload.teacherRemark = u.remark;
        payload.remarks = u.remark;
      }
      updateSubjectScore(u.studentId, selectedPeriodId, subjectId, payload);
    });
  };

  // Temporary weight states for modal
  const [tempWeights, setTempWeights] = useState({ ...weights });
  const [tempCompetency, setTempCompetency] = useState({ ...competencyWeights });

  // 30-Second Auto-Save Mechanism for Assessment Scoring Hub
  const {
    lastSavedTime,
    isSaving,
    hasPendingChanges,
    secondsUntilSave,
    markDirty,
    saveImmediately,
    backupInfo,
  } = useAssessmentAutoSave({
    activeClassId: activeClass?.id,
    activeClassName: activeClass?.nameKm || activeClass?.name || 'Class',
    selectedPeriodId,
    scoresMatrix,
    studentCount: classStudents.length,
    intervalSeconds: 30,
    onAutoSaveSuccess: () => {
      // Quiet background save complete
    },
  });

  const handleRestoreBackup = (backup: AutoSaveBackupData) => {
    if (backup && backup.scoresMatrix) {
      restoreScoresMatrix(backup.scoresMatrix);
      showToast(
        language === 'km'
          ? `បានស្តារពិន្ទុពី Auto-Save (${backup.timeFormatted}) ដោយជោគជ័យ!`
          : `Restored assessment scores from auto-save backup (${backup.timeFormatted}) successfully!`,
        'success'
      );
    }
  };

  const currentPeriod = periods.find(p => p.id === selectedPeriodId) || periods[0];
  const rankings = calculatePeriodRankings(classStudents, selectedPeriodId, subjects, scoresMatrix, weights, competencyWeights);

  const filteredRankings = rankings.filter(r => 
    r.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScoreChange = (
    studentId: string, 
    subjectId: string, 
    field: string, 
    value: any
  ) => {
    markDirty();
    if (typeof value === 'number') {
      // Clamp score between 0 and 10 (or 0-5 for behavior)
      const maxVal = field === 'behaviorRating' ? 5 : 10;
      const clamped = isNaN(value) ? 0 : Math.min(maxVal, Math.max(0, value));
      updateSubjectScore(studentId, selectedPeriodId, subjectId, {
        [field]: clamped,
      } as any);
    } else {
      updateSubjectScore(studentId, selectedPeriodId, subjectId, {
        [field]: value,
      } as any);
    }
  };

  const handleStudentPillarChange = (
    studentId: string,
    field: 'skillScore' | 'attitudeScore',
    value: number
  ) => {
    markDirty();
    const clamped = isNaN(value) ? 0 : Math.min(10, Math.max(0, value));
    updateStudent(studentId, {
      [field]: clamped,
    });
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const compSum = tempCompetency.knowledge + tempCompetency.skill + tempCompetency.attitude;
    if (compSum !== 100) {
      showToast(language === 'km' ? 'ផលបូកសម្បទា ៣ យ៉ាងត្រូវតែស្មើ ១០០%' : 'Competency weights must sum to 100%', 'warning');
      return;
    }
    markDirty();
    updateCompetencyWeights(tempCompetency);
    setShowWeightsModal(false);
  };

  const handleApplyBulkScore = () => {
    if (selectedSubjectId === 'all') {
      showToast(language === 'km' ? 'សូមជ្រើសរើសមុខវិជ្ជាជាក់លាក់មួយ' : 'Please select a specific subject for bulk fill', 'warning');
      return;
    }
    markDirty();
    const updates: Record<string, number> = {};
    classStudents.forEach(s => {
      updates[s.id] = bulkScoreValue;
    });
    bulkUpdatePeriodScores(selectedPeriodId, selectedSubjectId, updates);
    setShowBulkModal(false);
  };

  const getScoreColor = (val: number) => {
    if (val >= 8.5) return 'text-emerald-700 font-bold bg-emerald-50 border-emerald-200';
    if (val >= 7.0) return 'text-blue-700 font-bold bg-blue-50 border-blue-200';
    if (val >= 5.0) return 'text-amber-800 font-medium bg-amber-50 border-amber-200';
    return 'text-rose-700 font-black bg-rose-50 border-rose-300 ring-1 ring-rose-300 shadow-2xs';
  };

  const activeSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      
      {/* Assessment Period & Month Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 uppercase tracking-wider">
                {language === 'km' ? 'ជ្រើសរើសខែ / ដំណាក់កាលវាយតម្លៃ' : 'Assessment Period / Month'}
              </h3>
              <p className="text-[11px] font-bold text-slate-400">
                {language === 'km' 
                  ? 'គណនាពិន្ទុតាមស្តង់ដារក្រសួង៖ វិជ្ជាសម្បទា ៨០% + បំណិនសម្បទា ១០% + ចរិយាសម្បទា ១០%' 
                  : 'MoEYS Primary Standard: Knowledge (80%) + Skill (10%) + Attitude (10%)'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* 30-Second Auto-Save Mechanism Indicator */}
            <AssessmentAutoSaveBadge
              language={language}
              lastSavedTime={lastSavedTime}
              isSaving={isSaving}
              hasPendingChanges={hasPendingChanges}
              secondsUntilSave={secondsUntilSave}
              onSaveNow={() => {
                saveImmediately();
                showToast(
                  language === 'km' ? 'បានរក្សាទុកពិន្ទុចូល Local Storage ភ្លាមៗដោយជោគជ័យ!' : 'Saved changes immediately to local storage!',
                  'success'
                );
              }}
              backupInfo={backupInfo}
              onRestoreBackup={handleRestoreBackup}
              showToast={showToast}
            />

            {/* Skills Assessment (Appendix 3) */}
            <button
              onClick={() => setActiveTab('skills_assessment')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-bold transition cursor-pointer shadow-2xs"
              title={language === 'km' ? 'វាយតម្លៃបំណិន ១៨ សកម្មភាព (ឧបសម្ព័ន្ធ៣)' : 'Skills Assessment (Appendix 3)'}
            >
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{language === 'km' ? 'វាយតម្លៃបំណិន (ឧបសម្ព័ន្ធ៣)' : 'Skills (App. 3)'}</span>
            </button>

            {/* Attitude Assessment (Appendix 4) */}
            <button
              onClick={() => setActiveTab('attitude_assessment')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs font-bold transition cursor-pointer shadow-2xs"
              title={language === 'km' ? 'វាយតម្លៃចរិយា ៧៤ លក្ខណៈវិនិច្ឆ័យ (ឧបសម្ព័ន្ធ៤)' : 'Attitude Assessment (Appendix 4)'}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{language === 'km' ? 'វាយតម្លៃចរិយា (ឧបសម្ព័ន្ធ៤)' : 'Attitude (App. 4)'}</span>
            </button>

            {/* Assessment Template Library Button */}
            <button
              onClick={() => {
                setInitialTemplateSubjectId(null);
                setShowTemplateLibraryModal(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
              title={language === 'km' ? 'បណ្ណាល័យទម្រង់កិច្ចការ និងតេស្ត (Template Library)' : 'Assessment Template Library'}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'បណ្ណាល័យទម្រង់' : 'Templates'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-200/70 dark:bg-indigo-800 text-indigo-950 dark:text-indigo-100 font-bold ml-0.5">
                {templates.length}
              </span>
            </button>

            {/* Exam & Question Bank Button */}
            <button
              onClick={() => setActiveTab('exam_bank')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
              title={language === 'km' ? 'ធនាគារសំណួរ និងវិញ្ញាសាប្រឡង' : 'Exam & Question Bank'}
            >
              <FileQuestion className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{language === 'km' ? 'ធនាគារវិញ្ញាសា' : 'Exam Bank'}</span>
            </button>

            <button
              onClick={() => {
                setTempWeights({ ...weights });
                setTempCompetency({ ...competencyWeights });
                setShowWeightsModal(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 transition cursor-pointer shadow-2xs"
            >
              <Percent className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'ទម្ងន់ពិន្ទុ (៨០/១០/១០)' : 'Pillars & Weights'}</span>
            </button>

            {/* Direct PDF Export for Score and Ranking Matrix */}
            <PrintToPdfButton
              targetElementId="scoring-matrix-table-container"
              documentTitle={`MoEYS_${activeClass?.nameKm || 'Class'}_Score_Matrix_${currentPeriod.code}`}
              pageSize="a4"
              orientation="landscape"
              variant="primary"
              size="sm"
              labelKm="ទាញយក PDF (A4)"
              labelEn="Export PDF (A4)"
            />

            {/* Comprehensive CSV Export for Offline Backup & Secondary Analysis */}
            <button
              onClick={() => setShowExportCsvModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-2xs hover:shadow-xs"
              title={language === 'km' ? 'នាំចេញទិន្នន័យពិន្ទុជាឯកសារ CSV' : 'Export assessment data to CSV'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ទាញយក CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Semester 1 & 2 Tabs */}
        <div className="space-y-2.5">
          
          {/* Semester 1 */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 flex-shrink-0">
              {language === 'km' ? 'ឆមាសទី ១:' : 'SEM 1:'}
            </span>
            {periods.filter(p => p.semester === 1).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriodId(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  selectedPeriodId === p.id
                    ? p.isExam 
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                      : 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                    : p.isExam
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'km' ? p.nameKm : p.nameEn}
              </button>
            ))}
          </div>

          {/* Semester 2 */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 flex-shrink-0">
              {language === 'km' ? 'ឆមាសទី ២:' : 'SEM 2:'}
            </span>
            {periods.filter(p => p.semester === 2).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriodId(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  selectedPeriodId === p.id
                    ? p.isExam 
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                      : 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                    : p.isExam
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'km' ? p.nameKm : p.nameEn}
              </button>
            ))}
          </div>

        </div>

        {/* Selected Period Info & Scoring Guide Bar */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-black text-slate-900 uppercase tracking-wide">
              {language === 'km' ? currentPeriod.nameKm : currentPeriod.nameEn}
            </span>
            {currentPeriod.lunarDateKm && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-600 border border-slate-200">
                {language === 'km' ? currentPeriod.lunarDateKm : currentPeriod.lunarDateEn}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-extrabold">
            <span className="inline-flex items-center space-x-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <span>{language === 'km' ? `ចំនួនមុខវិជ្ជា៖ ${subjects.length}` : `Subjects: ${subjects.length}`}</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              <span>{language === 'km' ? 'ពិន្ទុពេញ៖ ១០ / មុខវិជ្ជា' : 'Max Score: 10.0 / Subject'}</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              <span>{language === 'km' ? 'ពិន្ទុមធ្យមភាគប្រចាំខែ (០ ដល់ ១០)' : 'Monthly Average (0 - 10)'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subject Filter Bar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Subject Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'km' ? 'គ្រប់មុខវិជ្ជា (តារាងពិន្ទុរួម)' : 'All Subjects (Matrix)'}
          </button>
          {subjects.map(s => {
            const isKhmer = s.id === 'sub_khmer';
            const isMath = s.id === 'sub_math';
            const badgeText = isKhmer ? (language === 'km' ? '៤ ជំនាញ' : '4 Skills') : isMath ? (language === 'km' ? '៥ ផ្នែក' : '5 Sections') : null;

            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                  selectedSubjectId === s.id
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{language === 'km' ? s.nameKm : s.nameEn}</span>
                {badgeText && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    selectedSubjectId === s.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'km' ? 'ស្វែងរកសិស្ស...' : 'Search student...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 w-36 sm:w-48 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Quick Access to Template Library */}
          <button
            onClick={() => {
              setInitialTemplateSubjectId(null);
              setShowTemplateLibraryModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black uppercase tracking-wider transition shadow-2xs cursor-pointer"
            title={language === 'km' ? 'ជ្រើសរើសទម្រង់កិច្ចការ (Template Library)' : 'Choose assignment template'}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-indigo-700" />
            <span className="hidden sm:inline">{language === 'km' ? 'ទម្រង់' : 'Templates'}</span>
          </button>

          {/* Save Current Subject Setup as a New Template */}
          {selectedSubjectId !== 'all' && (
            <button
              onClick={handleOpenSaveCurrentAsTemplate}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-900 text-xs font-black uppercase tracking-wider transition shadow-2xs cursor-pointer"
              title={language === 'km' ? 'រក្សាទុកការរៀបចំនេះជាទម្រង់កិច្ចការថ្មី' : 'Save current setup as a new template'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">{language === 'km' ? 'រក្សាទុកជាទម្រង់' : 'Save as Template'}</span>
            </button>
          )}

          {selectedSubjectId !== 'all' && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បំពេញស្មើគ្នា' : 'Bulk Fill'}</span>
            </button>
          )}
        </div>

      </div>

      {/* 1. MASTER MATRIX GRID VIEW (When selectedSubjectId === 'all') */}
      {selectedSubjectId === 'all' && (
        <div 
          id="scoring-matrix-table-container"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs printable-area"
        >
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <TableProperties className="w-4 h-4 text-indigo-700" />
              <span>
                {language === 'km' 
                  ? 'តារាងបញ្ចូលពិន្ទុប្រចាំខែគ្រប់មុខវិជ្ជា' 
                  : 'Monthly All-Subjects Scoring Matrix'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Sub-components Toggle */}
              <button
                onClick={() => setShowSubSkillsMatrix(!showSubSkillsMatrix)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                  showSubSkillsMatrix 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-700" />
                <span>
                  {language === 'km' 
                    ? (showSubSkillsMatrix ? 'មុខវិជ្ជារងខ្មែរ & គណិត (បើក)' : 'ទិដ្ឋភាពសង្ខេប (បង្រួម)')
                    : (showSubSkillsMatrix ? 'Khmer & Math Sub-skills: ON' : 'Compact View')}
                </span>
              </button>

              {/* Quick CSV Export */}
              <button
                onClick={() => setShowExportCsvModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-black transition cursor-pointer shadow-2xs"
                title={language === 'km' ? 'នាំចេញទិន្នន័យពិន្ទុជាឯកសារ CSV' : 'Export scores to CSV'}
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'km' ? 'នាំចេញ CSV' : 'Export CSV'}</span>
              </button>

              <span className="text-[11px] font-extrabold text-slate-400">
                {language === 'km' ? `សរុបសិស្ស៖ ${filteredRankings.length} នាក់` : `Total: ${filteredRankings.length} Students`}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {showSubSkillsMatrix ? (
                /* MULTI-TIER HEADER WITH KHMER & MATH SUB-SKILLS */
                <thead className="bg-slate-100/90 text-slate-600 font-black uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th rowSpan={2} className="py-3 px-2 w-9 text-center border-r border-slate-200 bg-slate-100">#</th>
                    <th rowSpan={2} className="py-3 px-3 min-w-[125px] border-r border-slate-200 bg-slate-100">{language === 'km' ? 'ឈ្មោះសិស្ស' : 'Name'}</th>
                    <th rowSpan={2} className="py-3 px-1.5 text-center w-8 border-r border-slate-200 bg-slate-100">{language === 'km' ? 'ភេទ' : 'Sex'}</th>

                    {/* Khmer Language (4 sub-skills + average) */}
                    <th colSpan={5} className="py-2 px-2 text-center bg-indigo-50 border-r border-indigo-200 text-indigo-950 font-black">
                      <div className="flex items-center justify-center space-x-1">
                        <span>{language === 'km' ? 'ភាសាខ្មែរ (៤ ជំនាញ)' : 'Khmer Language (4 Skills)'}</span>
                      </div>
                    </th>

                    {/* Mathematics (5 sub-sections + average) */}
                    <th colSpan={6} className="py-2 px-2 text-center bg-emerald-50 border-r border-emerald-200 text-emerald-950 font-black">
                      <div className="flex items-center justify-center space-x-1">
                        <span>{language === 'km' ? 'គណិតវិទ្យា (៥ ផ្នែក)' : 'Mathematics (5 Sections)'}</span>
                      </div>
                    </th>

                    {/* Other Subjects */}
                    {subjects.filter(s => s.id !== 'sub_khmer' && s.id !== 'sub_math').map(s => (
                      <th key={s.id} rowSpan={2} className="py-3 px-1.5 text-center min-w-[62px] border-r border-slate-200 bg-slate-50">
                        <div className="truncate text-slate-800 font-black text-[10px]">{language === 'km' ? s.nameKm : s.code}</div>
                      </th>
                    ))}

                    {/* Total Points, Monthly Avg, Grade and Rank */}
                    <th rowSpan={2} className="py-3 px-2 text-center min-w-[65px] bg-slate-100 text-slate-900 font-black border-r border-slate-200">
                      {language === 'km' ? 'ពិន្ទុសរុប' : 'TOTAL'}
                    </th>
                    <th rowSpan={2} className="py-3 px-2 text-center min-w-[70px] bg-indigo-950 text-white font-black border-r border-indigo-900">
                      {language === 'km' ? 'ម.ប្រចាំខែ' : 'MONTH AVG'}
                    </th>
                    <th rowSpan={2} className="py-3 px-2 text-center w-14 bg-slate-100 text-slate-800 font-black border-r border-slate-200">
                      {language === 'km' ? 'និទ្ទេស' : 'GRADE'}
                    </th>
                    <th rowSpan={2} className="py-3 px-2 text-center w-12 bg-amber-100 text-amber-950 font-black">
                      {language === 'km' ? 'ចំណាត់ថ្នាក់' : 'RANK'}
                    </th>
                  </tr>

                  {/* Tier 2 Sub-Headers */}
                  <tr className="border-t border-slate-200 text-[9px] text-slate-500 font-black">
                    {/* Khmer Sub-Columns (4 sub-skills + average) */}
                    <th className="py-1.5 px-1 text-center bg-indigo-50/60 border-r border-indigo-100 min-w-[50px]">{language === 'km' ? 'អាន' : 'Read'}</th>
                    <th className="py-1.5 px-1 text-center bg-indigo-50/60 border-r border-indigo-100 min-w-[50px]">{language === 'km' ? 'សរសេរ' : 'Write'}</th>
                    <th className="py-1.5 px-1 text-center bg-indigo-50/60 border-r border-indigo-100 min-w-[50px]">{language === 'km' ? 'ស្តាប់' : 'Listen'}</th>
                    <th className="py-1.5 px-1 text-center bg-indigo-50/60 border-r border-indigo-100 min-w-[50px]">{language === 'km' ? 'និយាយ' : 'Speak'}</th>
                    <th className="py-1.5 px-1 text-center bg-indigo-100 text-indigo-950 font-black border-r border-indigo-200 min-w-[55px]">{language === 'km' ? 'ម.ភាសា' : 'Avg'}</th>

                    {/* Math Sub-Columns (5 sections + average) */}
                    <th className="py-1.5 px-1 text-center bg-emerald-50/60 border-r border-emerald-100 min-w-[52px]">{language === 'km' ? 'ចំនួន' : 'Num'}</th>
                    <th className="py-1.5 px-1 text-center bg-emerald-50/60 border-r border-emerald-100 min-w-[52px]">{language === 'km' ? 'ពិជគណិត' : 'Alg'}</th>
                    <th className="py-1.5 px-1 text-center bg-emerald-50/60 border-r border-emerald-100 min-w-[52px]">{language === 'km' ? 'រង្វាស់' : 'Meas'}</th>
                    <th className="py-1.5 px-1 text-center bg-emerald-50/60 border-r border-emerald-100 min-w-[52px]">{language === 'km' ? 'ធរណី' : 'Geom'}</th>
                    <th className="py-1.5 px-1 text-center bg-emerald-50/60 border-r border-emerald-100 min-w-[52px]">{language === 'km' ? 'ស្ថិតិ' : 'Stat'}</th>
                    <th className="py-1.5 px-1 text-center bg-emerald-100 text-emerald-950 font-black border-r border-emerald-200 min-w-[55px]">{language === 'km' ? 'ម.គណិត' : 'Avg'}</th>
                  </tr>
                </thead>
              ) : (
                /* COMPACT SINGLE ROW HEADER */
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="py-3.5 px-3 w-10 text-center">#</th>
                    <th className="py-3.5 px-3 min-w-[130px]">{language === 'km' ? 'ឈ្មោះសិស្ស' : 'Student Name'}</th>
                    <th className="py-3.5 px-2 text-center w-10">{language === 'km' ? 'ភេទ' : 'Sex'}</th>
                    
                    {/* Subject Columns */}
                    {subjects.map(s => (
                      <th key={s.id} className="py-3.5 px-2 text-center min-w-[70px]">
                        <div className="truncate text-slate-800 font-black">{language === 'km' ? s.nameKm : s.code}</div>
                      </th>
                    ))}

                    <th className="py-3.5 px-2 text-center min-w-[65px] bg-slate-100 text-slate-900 font-black">
                      {language === 'km' ? 'ពិន្ទុសរុប' : 'TOTAL'}
                    </th>
                    <th className="py-3.5 px-3 text-center min-w-[75px] bg-indigo-950 text-white font-black">
                      {language === 'km' ? 'ម.ប្រចាំខែ' : 'AVG / 10'}
                    </th>
                    <th className="py-3.5 px-2 text-center w-14 bg-slate-100 text-slate-800 font-black">
                      {language === 'km' ? 'និទ្ទេស' : 'GRADE'}
                    </th>
                    <th className="py-3.5 px-2 text-center w-14 bg-amber-100 text-amber-950 font-black">
                      {language === 'km' ? 'ចំ.ថ្នាក់' : 'RANK'}
                    </th>
                  </tr>
                </thead>
              )}

              <tbody className="divide-y divide-slate-100">
                {filteredRankings.map((item, idx) => {
                  const s = item.student;
                  const isTop3 = item.rank <= 3;

                  // Khmer 4 sub-skills: អាន, សរសេរ, ស្ដាប់, និយាយ
                  const khmerEntry = scoresMatrix[s.id]?.[selectedPeriodId]?.['sub_khmer'] || {};
                  const kr = khmerEntry.khmerReading ?? khmerEntry.rawScore ?? 8.0;
                  const kw = khmerEntry.khmerWriting ?? ((khmerEntry.khmerDictation !== undefined || khmerEntry.khmerComposition !== undefined) ? ((khmerEntry.khmerDictation ?? 8.0) + (khmerEntry.khmerComposition ?? 8.0)) / 2 : (khmerEntry.rawScore ?? 8.0));
                  const kl = khmerEntry.khmerListening ?? khmerEntry.rawScore ?? 8.0;
                  const ks = khmerEntry.khmerSpeaking ?? khmerEntry.rawScore ?? 8.0;
                  const khmerAvg = Number(((kr + kw + kl + ks) / 4).toFixed(2));

                  // Math 5 sections: ចំនួន, ពិជគណិត, រង្វាស់រង្វាល់, ធរណីមាត្រ, ស្ថិតិ
                  const mathEntry = scoresMatrix[s.id]?.[selectedPeriodId]?.['sub_math'] || {};
                  const kn = mathEntry.mathNumbers ?? mathEntry.mathAlgebra ?? mathEntry.rawScore ?? 8.0;
                  const ka = mathEntry.mathAlgebra ?? mathEntry.rawScore ?? 8.0;
                  const km_val = mathEntry.mathMeasurement ?? mathEntry.rawScore ?? 8.0;
                  const kg = mathEntry.mathGeometry ?? mathEntry.rawScore ?? 8.0;
                  const kst = mathEntry.mathStatistics ?? mathEntry.rawScore ?? 8.0;
                  const mathAvg = Number(((kn + ka + km_val + kg + kst) / 5).toFixed(2));

                  return (
                    <tr key={s.id} className={`hover:bg-slate-50 transition ${isTop3 ? 'bg-amber-50/20' : ''}`}>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-black border-r border-slate-100">{idx + 1}</td>
                      <td className="py-2.5 px-3 border-r border-slate-100">
                        <div className="font-black text-slate-900">{s.name}</div>
                      </td>
                      <td className="py-2.5 px-1.5 text-center border-r border-slate-100">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${s.gender === 'Female' ? 'text-pink-700 bg-pink-50' : 'text-blue-700 bg-blue-50'}`}>
                          {s.gender === 'Female' ? 'F' : 'M'}
                        </span>
                      </td>

                      {showSubSkillsMatrix ? (
                        <>
                          {/* 1. KHMER 4 SUB-SKILLS + AVG */}
                          <td className="py-1 px-1 text-center bg-indigo-50/20 border-r border-indigo-50">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={kr}
                              onChange={(e) => handleScoreChange(s.id, 'sub_khmer', 'khmerReading', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(kr)}`}
                            />
                          </td>
                          <td className="py-1 px-1 text-center bg-indigo-50/20 border-r border-indigo-50">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={kw}
                              onChange={(e) => handleScoreChange(s.id, 'sub_khmer', 'khmerWriting', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(kw)}`}
                            />
                          </td>
                          <td className="py-1 px-1 text-center bg-indigo-50/20 border-r border-indigo-50">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={kl}
                              onChange={(e) => handleScoreChange(s.id, 'sub_khmer', 'khmerListening', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(kl)}`}
                            />
                          </td>
                          <td className="py-1 px-1 text-center bg-indigo-50/20 border-r border-indigo-100">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={ks}
                              onChange={(e) => handleScoreChange(s.id, 'sub_khmer', 'khmerSpeaking', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(ks)}`}
                            />
                          </td>
                          <td className={`py-1 px-1.5 text-center font-mono font-black border-r transition ${
                            khmerAvg < 5.0 
                              ? 'bg-rose-100/90 text-rose-800 border-rose-200' 
                              : 'bg-indigo-100/60 text-indigo-950 border-indigo-200'
                          }`}>
                            {khmerAvg.toFixed(2)}
                          </td>

                          {/* 2. MATH 5 SECTIONS + AVG */}
                          <td className="py-1 px-1 text-center bg-emerald-50/20 border-r border-emerald-50">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={kn}
                              onChange={(e) => handleScoreChange(s.id, 'sub_math', 'mathNumbers', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(kn)}`}
                            />
                          </td>
                          <td className="py-1 px-1 text-center bg-emerald-50/20 border-r border-emerald-50">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={ka}
                              onChange={(e) => handleScoreChange(s.id, 'sub_math', 'mathAlgebra', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(ka)}`}
                            />
                          </td>
                          <td className="py-1 px-1 text-center bg-emerald-50/20 border-r border-emerald-50">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={km_val}
                              onChange={(e) => handleScoreChange(s.id, 'sub_math', 'mathMeasurement', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(km_val)}`}
                            />
                          </td>
                          <td className="py-1 px-1 text-center bg-emerald-50/20 border-r border-emerald-50">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={kg}
                              onChange={(e) => handleScoreChange(s.id, 'sub_math', 'mathGeometry', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(kg)}`}
                            />
                          </td>
                          <td className="py-1 px-1 text-center bg-emerald-50/20 border-r border-emerald-100">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={kst}
                              onChange={(e) => handleScoreChange(s.id, 'sub_math', 'mathStatistics', parseFloat(e.target.value))}
                              className={`w-11 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(kst)}`}
                            />
                          </td>
                          <td className={`py-1 px-1.5 text-center font-mono font-black border-r transition ${
                            mathAvg < 5.0 
                              ? 'bg-rose-100/90 text-rose-800 border-rose-200' 
                              : 'bg-emerald-100/60 text-emerald-950 border-emerald-200'
                          }`}>
                            {mathAvg.toFixed(2)}
                          </td>

                          {/* 3. OTHER SUBJECTS */}
                          {subjects.filter(subj => subj.id !== 'sub_khmer' && subj.id !== 'sub_math').map(subj => {
                            const scoreVal = item.subjectScores[subj.id] ?? 0;
                            return (
                              <td key={subj.id} className="py-1 px-1 text-center border-r border-slate-100">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="10"
                                  value={scoreVal}
                                  onChange={(e) => handleScoreChange(s.id, subj.id, 'rawScore', parseFloat(e.target.value))}
                                  className={`w-12 text-center py-1 rounded border border-slate-200 font-black text-xs font-mono ${getScoreColor(scoreVal)}`}
                                />
                              </td>
                            );
                          })}
                        </>
                      ) : (
                        /* COMPACT MATRIX VIEW: SINGLE INPUT PER SUBJECT */
                        subjects.map(subj => {
                          const scoreVal = item.subjectScores[subj.id] ?? 0;
                          return (
                            <td key={subj.id} className="py-2 px-1.5 text-center">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={scoreVal}
                                onChange={(e) => handleScoreChange(s.id, subj.id, 'rawScore', parseFloat(e.target.value))}
                                className={`w-14 text-center py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xs font-mono ${getScoreColor(scoreVal)}`}
                              />
                            </td>
                          );
                        })
                      )}

                      {/* Total Points */}
                      <td className="py-2.5 px-2 text-center bg-slate-50 font-mono font-black text-slate-800 border-r border-slate-100">
                        {item.totalPoints.toFixed(1)}
                      </td>

                      {/* Pure Monthly Average */}
                      <td className={`py-2.5 px-2 text-center font-mono font-black text-xs sm:text-sm border-r transition ${
                        item.average < 5.0
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-indigo-950 text-white border-indigo-900'
                      }`}>
                        {item.average.toFixed(2)}
                      </td>

                      {/* Letter Grade */}
                      <td className="py-2.5 px-1.5 text-center border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                          item.average >= 8.5 ? 'bg-emerald-100 text-emerald-800' :
                          item.average >= 7.0 ? 'bg-blue-100 text-blue-800' :
                          item.average >= 5.0 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {getLetterGrade(item.average)}
                        </span>
                      </td>

                      {/* Rank Badge */}
                      <td className="py-2.5 px-1.5 text-center bg-amber-50/40">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-black ${
                          item.rank === 1 ? 'bg-amber-400 text-amber-950 shadow-xs' :
                          item.rank === 2 ? 'bg-slate-300 text-slate-950' :
                          item.rank === 3 ? 'bg-amber-600 text-white' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          #{item.rank}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. KHMER LANGUAGE SUB-SKILLS VIEW (4 MoEYS Components) */}
      {selectedSubjectId === 'sub_khmer' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
                ភាសា
              </div>
              <div>
                <h4 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                  {language === 'km' ? 'ភាសាខ្មែរ (សមាសភាគ ៤ ជំនាញ)' : 'Khmer Language (4 MoEYS Sub-Skills)'}
                </h4>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  {language === 'km'
                    ? '១. អាន + ២. សរសេរ + ៣. ការស្តាប់ + ៤. ការនិយាយ'
                    : '1. Reading + 2. Writing + 3. Listening + 4. Speaking'}
                </p>
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
              {language === 'km' ? 'ពិន្ទុ ១-១០ ក្នុងមួយសមាសភាគ' : '0-10 SCORE PER COMPONENT'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-3 min-w-[130px]">{language === 'km' ? 'ឈ្មោះសិស្ស' : 'Student Name'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[100px]">{language === 'km' ? 'អាន' : 'Reading'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[100px]">{language === 'km' ? 'សរសេរ' : 'Writing'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[100px]">{language === 'km' ? 'ការស្តាប់' : 'Listening'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[100px]">{language === 'km' ? 'ការនិយាយ' : 'Speaking'}</th>
                  <th className="py-3.5 px-3 text-center bg-indigo-900 text-white min-w-[80px]">{language === 'km' ? 'ម.ភាសាខ្មែរ' : 'Khmer Avg'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((student, idx) => {
                  const entry = scoresMatrix[student.id]?.[selectedPeriodId]?.['sub_khmer'] || {};
                  const r = entry.khmerReading ?? entry.rawScore ?? 8.0;
                  const w = entry.khmerWriting ?? ((entry.khmerDictation !== undefined || entry.khmerComposition !== undefined) ? ((entry.khmerDictation ?? 8.0) + (entry.khmerComposition ?? 8.0)) / 2 : (entry.rawScore ?? 8.0));
                  const l = entry.khmerListening ?? entry.rawScore ?? 8.0;
                  const s = entry.khmerSpeaking ?? entry.rawScore ?? 8.0;
                  const khmerAvg = Number(((r + w + l + s) / 4).toFixed(2));

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-black">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">{student.name}</div>
                      </td>

                      {/* 1. Reading */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={r}
                          onChange={(e) => handleScoreChange(student.id, 'sub_khmer', 'khmerReading', parseFloat(e.target.value))}
                          className="w-18 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* 2. Writing */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={w}
                          onChange={(e) => handleScoreChange(student.id, 'sub_khmer', 'khmerWriting', parseFloat(e.target.value))}
                          className="w-18 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* 3. Listening */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={l}
                          onChange={(e) => handleScoreChange(student.id, 'sub_khmer', 'khmerListening', parseFloat(e.target.value))}
                          className="w-18 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* 4. Speaking */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={s}
                          onChange={(e) => handleScoreChange(student.id, 'sub_khmer', 'khmerSpeaking', parseFloat(e.target.value))}
                          className="w-18 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* Average */}
                      <td className="py-2 px-3 text-center bg-indigo-900 text-white font-mono font-black">
                        {khmerAvg.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MATHEMATICS SUB-SECTIONS VIEW (5 MoEYS Sections) */}
      {selectedSubjectId === 'sub_math' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                គណិត
              </div>
              <div>
                <h4 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                  {language === 'km' ? 'គណិតវិទ្យា (សមាសភាគ ៥ ផ្នែក)' : 'Mathematics (5 MoEYS Sections)'}
                </h4>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  {language === 'km'
                    ? '១. ចំនួន + ២. ពិជគណិត + ៣. រង្វាស់រង្វាល់ + ៤. ធរណីមាត្រ + ៥. ស្ថិតិ'
                    : '1. Numbers + 2. Algebra + 3. Measurement + 4. Geometry + 5. Statistics'}
                </p>
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
              {language === 'km' ? 'ពិន្ទុ ១-១០ ក្នុងមួយផ្នែក' : '0-10 SCORE PER SECTION'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-3 min-w-[130px]">{language === 'km' ? 'ឈ្មោះសិស្ស' : 'Student Name'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[90px]">{language === 'km' ? 'ចំនួន' : 'Numbers'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[90px]">{language === 'km' ? 'ពិជគណិត' : 'Algebra'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[90px]">{language === 'km' ? 'រង្វាស់រង្វាល់' : 'Measurement'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[90px]">{language === 'km' ? 'ធរណីមាត្រ' : 'Geometry'}</th>
                  <th className="py-3.5 px-2 text-center min-w-[90px]">{language === 'km' ? 'ស្ថិតិ' : 'Statistics'}</th>
                  <th className="py-3.5 px-3 text-center bg-blue-700 text-white min-w-[85px]">{language === 'km' ? 'ម.គណិត' : 'Math Avg'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((student, idx) => {
                  const entry = scoresMatrix[student.id]?.[selectedPeriodId]?.['sub_math'] || {};
                  const n = entry.mathNumbers ?? entry.mathAlgebra ?? entry.rawScore ?? 8.0;
                  const a = entry.mathAlgebra ?? entry.rawScore ?? 8.0;
                  const m = entry.mathMeasurement ?? entry.rawScore ?? 8.0;
                  const g = entry.mathGeometry ?? entry.rawScore ?? 8.0;
                  const st = entry.mathStatistics ?? entry.rawScore ?? 8.0;
                  const mathAvg = Number(((n + a + m + g + st) / 5).toFixed(2));

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-black">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">{student.name}</div>
                      </td>

                      {/* 1. Numbers */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={n}
                          onChange={(e) => handleScoreChange(student.id, 'sub_math', 'mathNumbers', parseFloat(e.target.value))}
                          className="w-16 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* 2. Algebra */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={a}
                          onChange={(e) => handleScoreChange(student.id, 'sub_math', 'mathAlgebra', parseFloat(e.target.value))}
                          className="w-16 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* 3. Measurement */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={m}
                          onChange={(e) => handleScoreChange(student.id, 'sub_math', 'mathMeasurement', parseFloat(e.target.value))}
                          className="w-16 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* 4. Geometry */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={g}
                          onChange={(e) => handleScoreChange(student.id, 'sub_math', 'mathGeometry', parseFloat(e.target.value))}
                          className="w-16 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* 5. Statistics */}
                      <td className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={st}
                          onChange={(e) => handleScoreChange(student.id, 'sub_math', 'mathStatistics', parseFloat(e.target.value))}
                          className="w-16 text-center py-1.5 rounded-lg border border-slate-200 font-black font-mono"
                        />
                      </td>

                      {/* Average */}
                      <td className="py-2 px-3 text-center bg-blue-700 text-white font-mono font-black">
                        {mathAvg.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. OTHER SUBJECTS DIRECT SCORE ENTRY (Science, Social Studies, Morals, PE, Arts, etc.) */}
      {selectedSubjectId !== 'all' && selectedSubjectId !== 'sub_khmer' && selectedSubjectId !== 'sub_math' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          
          <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-black text-base text-slate-900 uppercase tracking-tight">
                  {activeSubjectObj?.nameKm} ({activeSubjectObj?.nameEn})
                </h4>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  {language === 'km' 
                    ? 'បញ្ចូលពិន្ទុផ្ទាល់សម្រាប់មុខវិជ្ជា (មាត្រដ្ឋានពិន្ទុ ០ ដល់ ១០)' 
                    : 'Direct subject score assessment (Scale 0 to 10)'}
                </p>
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-900 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg font-mono">
              {language === 'km' ? 'ពិន្ទុពេញ ១០' : 'MAX SCORE: 10.0'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-3 min-w-[150px]">{language === 'km' ? 'ឈ្មោះសិស្ស' : 'Student Name'}</th>
                  <th className="py-3.5 px-2 text-center w-12">{language === 'km' ? 'ភេទ' : 'Sex'}</th>
                  <th className="py-3.5 px-3 text-center min-w-[140px] bg-indigo-50/80 text-indigo-950 font-black">
                    {language === 'km' ? `ពិន្ទុ ${activeSubjectObj?.nameKm || ''} (០-១០)` : 'Subject Score (/10)'}
                  </th>
                  <th className="py-3.5 px-3 text-center w-24">{language === 'km' ? 'និទ្ទេស' : 'Grade'}</th>
                  <th className="py-3.5 px-3 min-w-[200px]">{language === 'km' ? 'ការវាយតម្លៃ / កត់សម្គាល់' : 'Remarks / Feedback'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((student, idx) => {
                  const entry = scoresMatrix[student.id]?.[selectedPeriodId]?.[selectedSubjectId] || {};
                  const score = entry.rawScore ?? 8.0;
                  const remarks = entry.remarks || '';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-black">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">{student.name}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-xs font-bold ${student.gender === 'F' ? 'text-rose-600' : 'text-blue-600'}`}>
                          {student.gender === 'F' ? (language === 'km' ? 'ស្រី' : 'F') : (language === 'km' ? 'ប្រុស' : 'M')}
                        </span>
                      </td>

                      {/* Direct Single Score input */}
                      <td className="py-2 px-3 text-center bg-indigo-50/30">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={score}
                          onChange={(e) => handleScoreChange(student.id, selectedSubjectId, 'rawScore', parseFloat(e.target.value))}
                          className={`w-24 text-center py-2 rounded-xl border border-slate-200 font-black text-sm font-mono shadow-2xs ${getScoreColor(score)} bg-white`}
                        />
                      </td>

                      {/* Letter Grade */}
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                          score >= 8.5 ? 'bg-emerald-100 text-emerald-800' :
                          score >= 7.0 ? 'bg-blue-100 text-blue-800' :
                          score >= 5.0 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {getLetterGrade(score)}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder={language === 'km' ? 'បញ្ចូលការកត់សម្គាល់ ឬការវាយតម្លៃ...' : 'Add remarks or feedback...'}
                          value={remarks}
                          onChange={(e) => handleScoreChange(student.id, selectedSubjectId, 'remarks', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MoEYS Competency Pillars Configuration Modal */}
      {showWeightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
              {language === 'km' ? 'កែប្រែទម្ងន់សម្បទា ៣ យ៉ាង (MoEYS Standard)' : 'MoEYS 3 Competency Pillars (%)'}
            </h3>

            <form onSubmit={handleSaveWeights} className="space-y-5 mt-4 text-xs sm:text-sm">
              
              {/* MoEYS 3 Pillars Section */}
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-4">
                <div className="font-black text-indigo-950 flex items-center space-x-1.5">
                  <Brain className="w-4 h-4 text-indigo-700" />
                  <span>{language === 'km' ? 'សម្បទា ៣ យ៉ាង តាមស្តង់ដារបឋមសិក្សា' : '3 Primary MoEYS Competency Pillars'}</span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{language === 'km' ? '១. វិជ្ជាសម្បទា (Knowledge)' : '1. Knowledge (វិជ្ជាសម្បទា)'}</span>
                    <span className="text-indigo-900 font-bold">{tempCompetency.knowledge}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={90}
                    step={5}
                    value={tempCompetency.knowledge}
                    onChange={(e) => setTempCompetency({ ...tempCompetency, knowledge: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'km' ? 'គណនាពីពិន្ទុមធ្យមភាគគ្រប់មុខវិជ្ជា (ខ្មែរ គណិត វិទ្យាសាស្ត្រ សង្គម...)' : 'Calculated from average of all subjects'}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{language === 'km' ? '២. បំណិនសម្បទា (Skill)' : '2. Skill (បំណិនសម្បទា)'}</span>
                    <span className="text-emerald-700 font-bold">{tempCompetency.skill}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={tempCompetency.skill}
                    onChange={(e) => setTempCompetency({ ...tempCompetency, skill: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'km' ? 'ការអនុវត្តជាក់ស្តែង សកម្មភាព និងការដោះស្រាយបញ្ហា' : 'Practical application and skill demonstration'}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{language === 'km' ? '៣. ចរិយាសម្បទា (Attitude)' : '3. Attitude (ចរិយាសម្បទា)'}</span>
                    <span className="text-amber-700 font-bold">{tempCompetency.attitude}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={tempCompetency.attitude}
                    onChange={(e) => setTempCompetency({ ...tempCompetency, attitude: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'km' ? 'វិន័យ សីលធម៌ និងការចូលរួមក្នុងថ្នាក់' : 'Discipline, moral conduct, and classroom participation'}
                  </p>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between font-bold text-xs">
                  <span>{language === 'km' ? 'ផលបូកសម្បទា' : 'Pillars Total'}</span>
                  <span className={tempCompetency.knowledge + tempCompetency.skill + tempCompetency.attitude === 100 ? 'text-emerald-700' : 'text-rose-600'}>
                    {tempCompetency.knowledge + tempCompetency.skill + tempCompetency.attitude}% / 100%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWeightsModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-900 text-white font-bold cursor-pointer shadow-xs"
                >
                  {language === 'km' ? 'រក្សាទុក' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Fill Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-heading font-bold text-base text-slate-900 mb-2">
              {language === 'km' ? 'បំពេញពិន្ទុស្មើគ្នាសម្រាប់គ្រប់សិស្ស' : 'Bulk Set Scores'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'km' 
                ? 'ពិន្ទុនេះនឹងត្រូវដាក់ឱ្យសិស្សទាំងអស់ក្នុងមុខវិជ្ជានេះ៖'
                : 'This score will be applied to all students in this subject:'}
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'ពិន្ទុ (០ ដល់ ១០)' : 'Score Value (0 to 10)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={bulkScoreValue}
                onChange={(e) => setBulkScoreValue(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-center"
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleApplyBulkScore}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-xs cursor-pointer"
              >
                {language === 'km' ? 'អនុវត្ត' : 'Apply to All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Assessment CSV Modal */}
      <ExportAssessmentCsvModal
        isOpen={showExportCsvModal}
        onClose={() => setShowExportCsvModal(false)}
        language={language}
        className={activeClass?.name || 'Class'}
        classNameKm={activeClass?.nameKm || activeClass?.name || 'ថ្នាក់'}
        currentPeriod={currentPeriod}
        selectedSubjectId={selectedSubjectId}
        students={classStudents}
        subjects={subjects}
        periods={periods}
        scoresMatrix={scoresMatrix}
        weights={weights}
        competencyWeights={competencyWeights}
        gradeScales={gradeScales}
        showToast={showToast}
      />

      {/* Assessment Template Library Modal */}
      <TemplateLibraryModal
        isOpen={showTemplateLibraryModal}
        onClose={() => {
          setShowTemplateLibraryModal(false);
          setInitialTemplateSubjectId(null);
        }}
        templates={templates}
        subjects={subjects}
        language={language}
        onSelectTemplateForGrading={handleSelectTemplateForGrading}
        onSelectSubjectInMatrix={handleSelectSubjectInMatrix}
        onAddTemplate={addTemplate}
        onUpdateTemplate={updateTemplate}
        onDeleteTemplate={deleteTemplate}
        onDuplicateTemplate={duplicateTemplate}
        onResetToDefaults={resetToDefaults}
        onExportTemplates={exportTemplatesJson}
        onImportTemplates={importTemplates}
        showToast={showToast}
        initialCreateWithSubjectId={initialTemplateSubjectId}
      />

      {/* Rapid Grading Fast-Entry Modal */}
      <RapidGradingModal
        isOpen={showRapidGradingModal}
        onClose={() => {
          setShowRapidGradingModal(false);
          setActiveRapidTemplate(null);
        }}
        template={activeRapidTemplate}
        activeClass={activeClass}
        currentPeriod={currentPeriod}
        students={classStudents}
        subjects={subjects}
        scoresMatrix={scoresMatrix}
        language={language}
        onApplyScores={handleApplyRapidScores}
        showToast={showToast}
      />

    </div>
  );
};
