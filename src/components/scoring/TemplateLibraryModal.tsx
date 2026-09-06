import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Zap, 
  BookOpen, 
  Download, 
  Upload, 
  RotateCcw, 
  BookmarkCheck, 
  Layers, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Tag,
  MessageSquare
} from 'lucide-react';
import { 
  AssessmentTemplate, 
  AssessmentTemplateType, 
  AssessmentTargetField, 
  Subject, 
  Language 
} from '../../types';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: AssessmentTemplate[];
  subjects: Subject[];
  language: Language;
  onSelectTemplateForGrading: (template: AssessmentTemplate) => void;
  onSelectSubjectInMatrix: (subjectId: string) => void;
  onAddTemplate: (template: Omit<AssessmentTemplate, 'id' | 'createdAt'>) => AssessmentTemplate;
  onUpdateTemplate: (id: string, updates: Partial<AssessmentTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => AssessmentTemplate | null;
  onResetToDefaults: () => void;
  onExportTemplates: () => void;
  onImportTemplates: (jsonStr: string) => { success: boolean; count: number; error?: string };
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  initialCreateWithSubjectId?: string | null;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  templates,
  subjects,
  language,
  onSelectTemplateForGrading,
  onSelectSubjectInMatrix,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onResetToDefaults,
  onExportTemplates,
  onImportTemplates,
  showToast,
  initialCreateWithSubjectId = null,
}) => {
  if (!isOpen) return null;

  // View mode: 'browse' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'browse' | 'create' | 'edit'>(
    initialCreateWithSubjectId ? 'create' : 'browse'
  );
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'custom'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states for Create/Edit
  const [formName, setFormName] = useState<string>('');
  const [formNameKm, setFormNameKm] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formDescKm, setFormDescKm] = useState<string>('');
  const [formSubjectId, setFormSubjectId] = useState<string>(initialCreateWithSubjectId || 'sub_math');
  const [formType, setFormType] = useState<AssessmentTemplateType>('quiz');
  const [formTargetField, setFormTargetField] = useState<AssessmentTargetField>('rawScore');
  const [formMaxScore, setFormMaxScore] = useState<number>(10);
  const [formDefaultScore, setFormDefaultScore] = useState<number>(8.0);
  const [formPillsText, setFormPillsText] = useState<string>('5, 6, 7, 7.5, 8, 8.5, 9, 10');
  const [formRemarks, setFormRemarks] = useState<string[]>([
    'ធ្វើបានល្អណាស់',
    'ត្រូវខិតខំប្រឹងប្រែងបន្ថែម',
    'ការអនុវត្តមានការរីកចម្រើន'
  ]);
  const [newRemarkInput, setNewRemarkInput] = useState<string>('');
  const [formCriteria, setFormCriteria] = useState<string[]>([
    'ភាពត្រឹមត្រូវនៃចម្លើយ (៦ ពិន្ទុ)',
    'របៀបរបប និងសោភ័ណភាព (៤ ពិន្ទុ)'
  ]);
  const [newCriterionInput, setNewCriterionInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => {
      // Tab filter
      if (activeTab === 'system' && !tpl.isSystemDefault) return false;
      if (activeTab === 'custom' && tpl.isSystemDefault) return false;

      // Subject filter
      if (selectedSubjectFilter !== 'all' && tpl.subjectId !== selectedSubjectFilter) return false;

      // Type filter
      if (selectedTypeFilter !== 'all' && tpl.type !== selectedTypeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = tpl.name.toLowerCase().includes(q) || tpl.nameKm.toLowerCase().includes(q);
        const matchDesc = (tpl.description && tpl.description.toLowerCase().includes(q)) || 
                          (tpl.descriptionKm && tpl.descriptionKm.toLowerCase().includes(q));
        const matchField = tpl.targetField.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchField) return false;
      }

      return true;
    });
  }, [templates, activeTab, selectedSubjectFilter, selectedTypeFilter, searchQuery]);

  // Target field options based on selected subject
  const targetFieldOptions = useMemo(() => {
    if (formSubjectId === 'sub_khmer') {
      return [
        { id: 'khmerWriting', labelKm: 'ការសរសេរ (សរសេរតាមអាន)', labelEn: 'Khmer Writing (Dictation)' },
        { id: 'khmerReading', labelKm: 'ការអាន (ស្ទាត់ និងបញ្ចេញសំឡេង)', labelEn: 'Khmer Reading Fluency' },
        { id: 'khmerListening', labelKm: 'ការស្តាប់ (ការយល់ន័យ)', labelEn: 'Khmer Listening' },
        { id: 'khmerSpeaking', labelKm: 'ការនិយាយ (ការឆ្លើយផ្ទាល់មាត់)', labelEn: 'Khmer Speaking' },
        { id: 'rawScore', labelKm: 'ពិន្ទុសរុបភាសាខ្មែរ', labelEn: 'Khmer Total Score' },
        { id: 'homework', labelKm: 'កិច្ចការផ្ទះ (Homework)', labelEn: 'Homework' },
        { id: 'quizzes', labelKm: 'តេស្តខ្លី (Quizzes)', labelEn: 'Quizzes' },
      ];
    }
    if (formSubjectId === 'sub_math') {
      return [
        { id: 'mathNumbers', labelKm: 'ចំនួន និងលេខនព្វន្ត', labelEn: 'Numbers & Arithmetic' },
        { id: 'mathAlgebra', labelKm: 'ពិជគណិត / គិតរហ័ស', labelEn: 'Algebra & Mental Math' },
        { id: 'mathMeasurement', labelKm: 'រង្វាស់រង្វល់', labelEn: 'Measurement' },
        { id: 'mathGeometry', labelKm: 'ធរណីមាត្រ', labelEn: 'Geometry' },
        { id: 'mathStatistics', labelKm: 'ស្ថិតិ និងទិន្នន័យ', labelEn: 'Statistics' },
        { id: 'rawScore', labelKm: 'ពិន្ទុសរុបគណិតវិទ្យា', labelEn: 'Math Total Score' },
        { id: 'homework', labelKm: 'កិច្ចការផ្ទះ (Homework)', labelEn: 'Homework' },
        { id: 'quizzes', labelKm: 'តេស្តខ្លី (Quizzes)', labelEn: 'Quizzes' },
      ];
    }
    return [
      { id: 'rawScore', labelKm: 'ពិន្ទុសរុបមុខវិជ្ជា (Raw Score)', labelEn: 'Subject Total Score' },
      { id: 'homework', labelKm: 'កិច្ចការផ្ទះ (Homework)', labelEn: 'Homework' },
      { id: 'quizzes', labelKm: 'តេស្តខ្លី (Quizzes)', labelEn: 'Quizzes' },
      { id: 'midterm', labelKm: 'ប្រឡងឆមាស / ពាក់កណ្តាល (Midterm)', labelEn: 'Midterm Exam' },
    ];
  }, [formSubjectId]);

  // Open Edit Mode
  const handleOpenEdit = (tpl: AssessmentTemplate) => {
    setEditingTemplateId(tpl.id);
    setFormName(tpl.name);
    setFormNameKm(tpl.nameKm);
    setFormDesc(tpl.description || '');
    setFormDescKm(tpl.descriptionKm || '');
    setFormSubjectId(tpl.subjectId);
    setFormType(tpl.type);
    setFormTargetField(tpl.targetField);
    setFormMaxScore(tpl.maxScore);
    setFormDefaultScore(tpl.defaultScore);
    setFormPillsText(tpl.quickScorePills.join(', '));
    setFormRemarks(tpl.presetRemarks || []);
    setFormCriteria(tpl.criteria || []);
    setViewMode('edit');
  };

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingTemplateId(null);
    setFormName('Weekly Assessment');
    setFormNameKm('តេស្តវាយតម្លៃប្រចាំសប្តាហ៍');
    setFormDesc('Standard weekly check for student progression.');
    setFormDescKm('ការវាស់ស្ទង់សមត្ថភាពសិស្សប្រចាំសប្តាហ៍។');
    setFormSubjectId(initialCreateWithSubjectId || 'sub_math');
    setFormType('quiz');
    setFormTargetField(
      initialCreateWithSubjectId === 'sub_khmer' ? 'khmerWriting' :
      initialCreateWithSubjectId === 'sub_math' ? 'mathNumbers' : 'rawScore'
    );
    setFormMaxScore(10);
    setFormDefaultScore(8.0);
    setFormPillsText('5, 6, 7, 7.5, 8, 8.5, 9, 10');
    setFormRemarks([
      'ធ្វើបានល្អណាស់',
      'ត្រូវខិតខំប្រឹងប្រែងបន្ថែម',
      'ការអនុវត្តមានការរីកចម្រើន'
    ]);
    setFormCriteria([
      'ភាពត្រឹមត្រូវនៃចម្លើយ (៦ ពិន្ទុ)',
      'របៀបរបប និងសោភ័ណភាព (៤ ពិន្ទុ)'
    ]);
    setViewMode('create');
  };

  // Save Create or Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNameKm.trim()) {
      showToast(
        language === 'km' ? 'សូមបញ្ចូលឈ្មោះទម្រង់កិច្ចការជាភាសាខ្មែរ និងអង់គ្លេស' : 'Please provide template name in Khmer and English',
        'warning'
      );
      return;
    }

    // Parse pills
    const pills = formPillsText
      .split(',')
      .map(p => parseFloat(p.trim()))
      .filter(p => !isNaN(p) && p >= 0 && p <= formMaxScore);

    const selectedFieldObj = targetFieldOptions.find(o => o.id === formTargetField);

    const templateData = {
      name: formName.trim(),
      nameKm: formNameKm.trim(),
      description: formDesc.trim(),
      descriptionKm: formDescKm.trim(),
      subjectId: formSubjectId,
      type: formType,
      targetField: formTargetField,
      targetFieldLabelKm: selectedFieldObj?.labelKm || formTargetField,
      targetFieldLabelEn: selectedFieldObj?.labelEn || formTargetField,
      maxScore: formMaxScore,
      defaultScore: formDefaultScore,
      passingScore: 5.0,
      quickScorePills: pills.length > 0 ? pills : [5, 6, 7, 8, 9, 10],
      presetRemarks: formRemarks,
      criteria: formCriteria,
      isSystemDefault: false,
    };

    if (viewMode === 'edit' && editingTemplateId) {
      onUpdateTemplate(editingTemplateId, templateData);
      showToast(language === 'km' ? 'បានកែសម្រួលទម្រង់ជោគជ័យ!' : 'Updated template successfully!', 'success');
    } else {
      onAddTemplate(templateData);
      showToast(language === 'km' ? 'បានបង្កើតទម្រង់កិច្ចការថ្មីជោគជ័យ!' : 'Created new template successfully!', 'success');
    }

    setViewMode('browse');
  };

  // Handle Import File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = onImportTemplates(content);
        if (res.success) {
          showToast(
            language === 'km' 
              ? `បាននាំចូលទម្រង់ ${res.count} ដោយជោគជ័យ!` 
              : `Imported ${res.count} templates successfully!`,
            'success'
          );
        } else {
          showToast(
            language === 'km' 
              ? `បរាជ័យក្នុងការនាំចូល៖ ${res.error}` 
              : `Import failed: ${res.error}`,
            'warning'
          );
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSubjectObj = (subId: string) => subjects.find(s => s.id === subId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/10 shadow-xs">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-base sm:text-lg tracking-tight">
                  {language === 'km' ? 'បណ្ណាល័យទម្រង់កិច្ចការ និងតេស្ត' : 'Assessment Template Library'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {templates.length} {language === 'km' ? 'ទម្រង់' : 'Templates'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {language === 'km' 
                  ? 'រក្សាទុក ប្រើប្រាស់ឡើងវិញនូវរចនាសម្ព័ន្ធកិច្ចការ (តេស្តគណិត សរសេរតាមអាន...) ដើម្បីបញ្ចូលពិន្ទុបានលឿនរហ័ស' 
                  : 'Save, name, and reuse common assignment structures to speed up grading entry'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {viewMode === 'browse' && (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'បង្កើតទម្រង់ថ្មី' : 'New Template'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subheader / Tabs for Browse Mode */}
        {viewMode === 'browse' && (
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
            
            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'all' 
                    ? 'bg-indigo-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ទាំងអស់' : 'All'} ({templates.length})
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'system' 
                    ? 'bg-indigo-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ស្តង់ដារក្រសួង' : 'MoEYS Defaults'} ({templates.filter(t => t.isSystemDefault).length})
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'custom' 
                    ? 'bg-indigo-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ផ្ទាល់ខ្លួន' : 'My Custom'} ({templates.filter(t => !t.isSystemDefault).length})
              </button>
            </div>

            {/* Subject Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 text-slate-700"
              >
                <option value="all">{language === 'km' ? 'គ្រប់មុខវិជ្ជា' : 'All Subjects'}</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {language === 'km' ? s.nameKm : s.nameEn}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ស្វែងរកទម្រង់...' : 'Search templates...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white w-40 sm:w-52 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Reset to Defaults button */}
              <button
                onClick={() => {
                  if (confirm(language === 'km' ? 'តើអ្នកពិតជាចង់កំណត់ទម្រង់ទាំងអស់ទៅជាស្តង់ដារដើមមែនទេ?' : 'Reset templates to factory defaults?')) {
                    onResetToDefaults();
                    showToast(language === 'km' ? 'បានកំណត់ទម្រង់ដើមជោគជ័យ!' : 'Reset to default templates!', 'info');
                  }
                }}
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                title={language === 'km' ? 'កំណត់ទម្រង់ដើមឡើងវិញ' : 'Reset to factory defaults'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-50/50">
          
          {/* ========================================================= */}
          {/* 1. BROWSE TEMPLATES VIEW */}
          {/* ========================================================= */}
          {viewMode === 'browse' && (
            <div className="space-y-4">
              
              {filteredTemplates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
                    <BookmarkCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-black text-slate-900 text-base">
                    {language === 'km' ? 'មិនមានទម្រង់ដែលត្រូវនឹងការស្វែងរកទេ' : 'No templates match your criteria'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'km' 
                      ? 'សាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬចុច "បង្កើតទម្រង់ថ្មី" ដើម្បីបង្កើតទម្រង់តាមតម្រូវការ' 
                      : 'Try adjusting your search terms or click "New Template" to craft a custom assessment structure.'}
                  </p>
                  <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'បង្កើតទម្រង់ដំបូង' : 'Create Template'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map(tpl => {
                    const subj = getSubjectObj(tpl.subjectId);
                    return (
                      <div 
                        key={tpl.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition p-4 flex flex-col justify-between space-y-3 group"
                      >
                        <div>
                          {/* Card Top Pill Row */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              {/* Subject Badge */}
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-100">
                                {subj ? (language === 'km' ? subj.nameKm : subj.nameEn) : (language === 'km' ? 'គ្រប់មុខវិជ្ជា' : 'All Subjects')}
                              </span>

                              {/* Category Type */}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {tpl.type.toUpperCase()}
                              </span>

                              {/* System vs Custom */}
                              {tpl.isSystemDefault ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  MoEYS
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  Custom
                                </span>
                              )}
                            </div>

                            {/* Target Component */}
                            <span className="text-[11px] font-mono font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              {tpl.targetFieldLabelKm || tpl.targetField}
                            </span>
                          </div>

                          {/* Template Titles */}
                          <h4 className="font-heading font-black text-slate-900 text-base group-hover:text-indigo-950 transition">
                            {language === 'km' ? tpl.nameKm : tpl.name}
                          </h4>
                          <div className="text-[11px] font-bold text-slate-400">
                            {language === 'km' ? tpl.name : tpl.nameKm}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            {language === 'km' ? tpl.descriptionKm || tpl.description : tpl.description || tpl.descriptionKm}
                          </p>

                          {/* Quick Score Preview Pills */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400 mr-1">
                              {language === 'km' ? 'ពិន្ទុរហ័ស៖' : 'Quick Pills:'}
                            </span>
                            {tpl.quickScorePills.slice(0, 7).map(pill => (
                              <span 
                                key={pill}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {pill}
                              </span>
                            ))}
                          </div>

                          {/* Preset Remarks count */}
                          {tpl.presetRemarks && tpl.presetRemarks.length > 0 && (
                            <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3 text-indigo-500" />
                              <span>
                                {tpl.presetRemarks.length} {language === 'km' ? 'មតិយោបល់គំរូ' : 'preset comments'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-1">
                            {/* Duplicate */}
                            <button
                              onClick={() => {
                                onDuplicateTemplate(tpl.id);
                                showToast(language === 'km' ? 'បានចម្លងទម្រង់!' : 'Duplicated template!', 'info');
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                              title={language === 'km' ? 'ចម្លងទម្រង់' : 'Duplicate template'}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(tpl)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                              title={language === 'km' ? 'កែសម្រួលទម្រង់' : 'Edit template'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete (custom only) */}
                            {!tpl.isSystemDefault && (
                              <button
                                onClick={() => {
                                  if (confirm(language === 'km' ? `តើអ្នកចង់លុបទម្រង់ "${tpl.nameKm}" មែនទេ?` : `Delete template "${tpl.name}"?`)) {
                                    onDeleteTemplate(tpl.id);
                                    showToast(language === 'km' ? 'បានលុបទម្រង់!' : 'Deleted template!', 'info');
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                                title={language === 'km' ? 'លុបទម្រង់' : 'Delete template'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {/* Open In Matrix */}
                            {tpl.subjectId !== 'all' && (
                              <button
                                onClick={() => {
                                  onSelectSubjectInMatrix(tpl.subjectId);
                                  onClose();
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                                title={language === 'km' ? 'បើកមើលក្នុងតារាងពិន្ទុ' : 'Open in scoring matrix'}
                              >
                                {language === 'km' ? 'តារាងពិន្ទុ' : 'View in Grid'}
                              </button>
                            )}

                            {/* Rapid Grading Button */}
                            <button
                              onClick={() => {
                                onSelectTemplateForGrading(tpl);
                                onClose();
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
                            >
                              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                              <span>{language === 'km' ? 'បញ្ចូលពិន្ទុរហ័ស' : 'Grade Now'}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* 2. CREATE OR EDIT TEMPLATE VIEW */}
          {/* ========================================================= */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <BookmarkCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading font-black text-slate-900 text-base">
                    {viewMode === 'edit'
                      ? (language === 'km' ? 'កែសម្រួលទម្រង់កិច្ចការ' : 'Edit Assessment Template')
                      : (language === 'km' ? 'បង្កើតទម្រង់កិច្ចការថ្មី' : 'Create New Assessment Template')}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode('browse')}
                  className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  {language === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back to Library'}
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4 text-xs sm:text-sm">
                
                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'ឈ្មោះទម្រង់ (ជាភាសាខ្មែរ) *' : 'Template Name (Khmer) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. សរសេរតាមអានប្រចាំសប្តាហ៍"
                      value={formNameKm}
                      onChange={(e) => setFormNameKm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'ឈ្មោះទម្រង់ (English / Latin) *' : 'Template Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weekly Dictation Test"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Subject & Assessment Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'មុខវិជ្ជាគោលដៅ *' : 'Target Subject *'}
                    </label>
                    <select
                      value={formSubjectId}
                      onChange={(e) => {
                        const newSubj = e.target.value;
                        setFormSubjectId(newSubj);
                        if (newSubj === 'sub_khmer') setFormTargetField('khmerWriting');
                        else if (newSubj === 'sub_math') setFormTargetField('mathNumbers');
                        else setFormTargetField('rawScore');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="all">{language === 'km' ? 'គ្រប់មុខវិជ្ជា (ទូទៅ)' : 'All Subjects (General)'}</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {language === 'km' ? s.nameKm : s.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'ប្រភេទនៃការវាយតម្លៃ *' : 'Assessment Type *'}
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as AssessmentTemplateType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="quiz">{language === 'km' ? 'តេស្តខ្លី (Quiz)' : 'Quiz'}</option>
                      <option value="dictation">{language === 'km' ? 'សរសេរតាមអាន (Dictation)' : 'Dictation'}</option>
                      <option value="test">{language === 'km' ? 'ប្រឡង / តេស្តធំ (Test)' : 'Test'}</option>
                      <option value="homework">{language === 'km' ? 'កិច្ចការផ្ទះ (Homework)' : 'Homework'}</option>
                      <option value="practice">{language === 'km' ? 'កិច្ចការអនុវត្ត (Practice)' : 'Practice'}</option>
                      <option value="oral">{language === 'km' ? 'ផ្ទាល់មាត់ / អាន (Oral / Reading)' : 'Oral / Reading'}</option>
                      <option value="lab">{language === 'km' ? 'ពិសោធន៍ / សកម្មភាព (Lab)' : 'Lab / Activity'}</option>
                    </select>
                  </div>
                </div>

                {/* Target Score Field & Default Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'ផ្នែកពិន្ទុដែលត្រូវបញ្ចូល *' : 'Target Score Component *'}
                    </label>
                    <select
                      value={formTargetField}
                      onChange={(e) => setFormTargetField(e.target.value as AssessmentTargetField)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {targetFieldOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {language === 'km' ? opt.labelKm : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'ពិន្ទុលំនាំដើម (សម្រាប់បំពេញរហ័ស)' : 'Default Score (For Quick Fill)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      value={formDefaultScore}
                      onChange={(e) => setFormDefaultScore(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Score Pills Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ប៊ូតុងចុចពិន្ទុរហ័ស (Quick Score Pills - បំបែកដោយក្បៀស)' : 'Quick Score Tap Buttons (Comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={formPillsText}
                    onChange={(e) => setFormPillsText(e.target.value)}
                    placeholder="5, 6, 7, 7.5, 8, 8.5, 9, 10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'km' ? 'គ្រូអាចចុចលើលេខទាំងនេះដើម្បីដាក់ពិន្ទុភ្លាមៗដោយមិនបាច់វាយក្តារចុច' : 'Buttons allow teachers to tap to set scores instantly without keyboard input.'}
                  </p>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'សេចក្តីពិពណ៌នា (ភាសាខ្មែរ)' : 'Description (Khmer)'}
                    </label>
                    <textarea
                      rows={2}
                      value={formDescKm}
                      onChange={(e) => setFormDescKm(e.target.value)}
                      placeholder="ឧ. ការវាយតម្លៃអក្ខរាវិរុទ្ធ ព្យញ្ជនៈ ស្រៈ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'សេចក្តីពិពណ៌នា (English)' : 'Description (English)'}
                    </label>
                    <textarea
                      rows={2}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="e.g. Assessment of spelling, grammar, and..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Preset Remarks / Comments Tag Manager */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'km' ? 'មតិយោបល់ និងការវាយតម្លៃគំរូ (Preset Remarks)' : 'Preset Feedback Comments'}</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-bold">{formRemarks.length} {language === 'km' ? 'មតិយោបល់' : 'items'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formRemarks.map((rem, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs"
                      >
                        <span>{rem}</span>
                        <button
                          type="button"
                          onClick={() => setFormRemarks(formRemarks.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder={language === 'km' ? 'បញ្ចូលមតិយោបល់ថ្មី (ឧ. គណនាបានលឿន)...' : 'Add new remark...'}
                      value={newRemarkInput}
                      onChange={(e) => setNewRemarkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newRemarkInput.trim()) {
                            setFormRemarks([...formRemarks, newRemarkInput.trim()]);
                            setNewRemarkInput('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newRemarkInput.trim()) {
                          setFormRemarks([...formRemarks, newRemarkInput.trim()]);
                          setNewRemarkInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'km' ? 'បន្ថែម' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setViewMode('browse')}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer font-bold text-xs"
                  >
                    {language === 'km' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-black uppercase tracking-wider text-xs shadow-md transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{viewMode === 'edit' ? (language === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes') : (language === 'km' ? 'រក្សាទុកទម្រង់' : 'Save Template')}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

        {/* Footer with Export/Import Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onExportTemplates}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'km' ? 'នាំចេញ JSON' : 'Export JSON'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'km' ? 'នាំចូល JSON' : 'Import JSON'}</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </div>

          <div className="text-xs font-bold text-slate-400">
            {language === 'km' 
              ? 'ស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS Primary Assessment)' 
              : 'MoEYS Primary School Grading Standards'}
          </div>
        </div>

      </div>
    </div>
  );
};
