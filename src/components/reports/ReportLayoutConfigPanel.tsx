import React, { useState, useRef } from 'react';
import { 
  X, 
  Check, 
  RotateCcw, 
  Upload, 
  Trash2, 
  Sparkles, 
  Sliders, 
  Stamp as StampIcon, 
  Image as ImageIcon, 
  Layers, 
  Award, 
  FileText, 
  Info, 
  Maximize2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  PenTool
} from 'lucide-react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  MoeysLayoutStyle, 
  ReportLogoMode, 
  ReportStampMode, 
  StampPosition, 
  ReportLayoutConfig, 
  DEFAULT_REPORT_LAYOUT_CONFIG,
  MOEYS_LAYOUT_STYLES 
} from './reportLayoutTypes';
import { OfficialSchoolStamp } from './OfficialSchoolStamp';
import { SchoolLogo } from '../common/SchoolLogo';

interface ReportLayoutConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReportLayoutConfig;
  onConfigChange: (newConfig: ReportLayoutConfig) => void;
  reportMode: 'monthly' | 'yearly';
}

export const ReportLayoutConfigPanel: React.FC<ReportLayoutConfigPanelProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  reportMode,
}) => {
  const { language, schoolProfile, updateSchoolProfile, showToast } = useGradebook();
  const [activeTab, setActiveTab] = useState<'layout' | 'logo' | 'stamp' | 'signatures'>('layout');
  const [isExpanded, setIsExpanded] = useState(true);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const teacherSigInputRef = useRef<HTMLInputElement>(null);
  const principalSigInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const updateConfig = (patch: Partial<ReportLayoutConfig>) => {
    onConfigChange({
      ...config,
      ...patch,
    });
  };

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(language === 'km' ? 'សូមជ្រើសរើសឯកសារជារូបភាព (PNG/JPG/SVG)' : 'Please select an image file (PNG/JPG/SVG)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateConfig({ 
        customLogoUrl: dataUrl,
        logoMode: config.logoMode === 'moeys_only' ? 'school_only' : config.logoMode 
      });
      // Also update school profile so other components can use it
      updateSchoolProfile({ logoUrl: dataUrl });
      showToast(language === 'km' ? 'បានបញ្ចូលឡូហ្គោសាលាជោគជ័យ' : 'School logo uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Stamp file upload
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(language === 'km' ? 'សូមជ្រើសរើសឯកសាររូបភាពត្រា (PNG Transparent)' : 'Please select a stamp image file (PNG with transparency)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateConfig({
        customStampUrl: dataUrl,
        stampMode: 'custom',
        showPrincipalStamp: true,
      });
      showToast(language === 'km' ? 'បានបញ្ចូលត្រាសាលាផ្ទាល់ខ្លួនជោគជ័យ' : 'Custom school stamp uploaded', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Signatures upload
  const handleSignatureUpload = (type: 'teacher' | 'principal', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === 'teacher') {
        updateConfig({ teacherSignatureUrl: dataUrl });
        showToast(language === 'km' ? 'បានបញ្ចូលហត្ថលេខាគ្រូ' : 'Teacher signature uploaded', 'success');
      } else {
        updateConfig({ principalSignatureUrl: dataUrl });
        showToast(language === 'km' ? 'បានបញ្ចូលហត្ថលេខានាយក' : 'Principal signature uploaded', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetToDefaults = () => {
    onConfigChange(DEFAULT_REPORT_LAYOUT_CONFIG);
    showToast(language === 'km' ? 'បានកំណត់ជម្រើសទម្រង់ឡើងវិញ' : 'Reset to default layout configuration', 'info');
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden mb-6 transition-all duration-300">
      {/* Panel Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 sm:px-7 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-heading font-black text-sm sm:text-base text-white">
                {language === 'km' ? 'ផ្ទាំងកំណត់ទម្រង់ក្រសួង (MoEYS) & ត្រាផ្លូវការ' : 'MoEYS Layout & Official Stamp Configuration'}
              </h2>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide font-sans">
                {MOEYS_LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.nameKm || 'ស្តង់ដារ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'km' 
                ? 'ជ្រើសរើសទម្រង់សន្លឹកពិន្ទុ បន្ថែមឡូហ្គោសាលា និងត្រាមូលក្រហមផ្លូវការមុនពេលបោះពុម្ព ឬទាញយក'
                : 'Customize official ministry templates, school crests, and administrative red seals before export'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition cursor-pointer"
            title={language === 'km' ? 'កំណត់ជម្រើសទាំងអស់ឡើងវិញ' : 'Reset to defaults'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
            title={isExpanded ? 'បង្រួញ' : 'ពង្រីក'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-7 bg-slate-50/50">
          {/* Section Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl mb-6 max-w-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-heading font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'layout'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'km' ? '១. ទម្រង់ក្រសួង MoEYS' : '1. MoEYS Layouts'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logo')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-heading font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'logo'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'km' ? '២. ឡូហ្គោសាលា' : '2. School Logo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stamp')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-heading font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'stamp'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <StampIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'km' ? '៣. ត្រាក្រហមផ្លូវការ' : '3. Official Stamp'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('signatures')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-heading font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'signatures'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'km' ? '៤. ហត្ថលេខា & ត្រាទឹក' : '4. Signatures & Watermark'}</span>
            </button>
          </div>

          {/* TAB 1: MOEYS LAYOUT STYLES */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-heading font-black text-sm text-slate-900">
                    {language === 'km' ? 'ជ្រើសរើសទម្រង់រចនាសន្លឹកលទ្ធផល MoEYS' : 'Select MoEYS Layout Template'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'km' 
                      ? 'ទម្រង់នីមួយៗត្រូវបានរៀបចំត្រឹមត្រូវតាមស្ដង់ដារបឋមសិក្សាជាតិ'
                      : 'Choose between 4 calibrated administrative styles suitable for diverse printing needs'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {MOEYS_LAYOUT_STYLES.map((style) => {
                  const isSelected = config.layoutStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => updateConfig({ layoutStyle: style.id })}
                      className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      {/* Top status indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {style.badge}
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Style Mini Mockup preview */}
                      <div className="w-full h-20 rounded-xl bg-slate-100 p-2 mb-3 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                        {style.id === 'standard' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[7px] text-slate-600 font-bold border-b border-slate-300 pb-0.5">
                              <span>សាលាបឋមសិក្សា</span>
                              <span>ព្រះរាជាណាចក្រកម្ពុជា</span>
                            </div>
                            <div className="h-2 w-16 bg-slate-800 rounded-xs mx-auto"></div>
                            <div className="grid grid-cols-4 gap-0.5 pt-1">
                              <div className="h-4 bg-slate-200 rounded-xs"></div>
                              <div className="h-4 bg-slate-200 rounded-xs"></div>
                              <div className="h-4 bg-slate-200 rounded-xs"></div>
                              <div className="h-4 bg-slate-200 rounded-xs"></div>
                            </div>
                          </div>
                        )}

                        {style.id === 'modern' && (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                              <div className="h-1.5 w-12 bg-indigo-300 rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-1 pt-1">
                              <div className="h-5 rounded-md bg-indigo-100/80 border border-indigo-200"></div>
                              <div className="h-5 rounded-md bg-indigo-100/80 border border-indigo-200"></div>
                              <div className="h-5 rounded-md bg-indigo-100/80 border border-indigo-200"></div>
                            </div>
                            <div className="flex justify-end">
                              <div className="w-4 h-4 rounded-full bg-rose-400/40 border border-rose-500"></div>
                            </div>
                          </div>
                        )}

                        {style.id === 'compact_booklet' && (
                          <div className="space-y-0.5">
                            <div className="text-[6px] font-black text-center text-slate-700 uppercase">A5 សម្រាប់សៀវភៅតាមដាន</div>
                            <div className="space-y-0.5 pt-0.5">
                              <div className="h-1.5 w-full bg-slate-300 rounded-2xs"></div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-2xs"></div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-2xs"></div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-2xs"></div>
                            </div>
                            <div className="flex justify-between pt-0.5 text-[5px] text-slate-400">
                              <span>ហត្ថលេខាគ្រូ</span>
                              <span>នាយក</span>
                            </div>
                          </div>
                        )}

                        {style.id === 'honor_formal' && (
                          <div className="h-full border-2 border-amber-400/90 rounded-lg p-1 bg-amber-50/40 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[7px] text-amber-900 font-bold">
                              <span>⚜️ MoEYS</span>
                              <span>ព្រះរាជាណាចក្រកម្ពុជា</span>
                            </div>
                            <div className="h-2 w-14 bg-amber-700 rounded-xs mx-auto"></div>
                            <div className="flex justify-between items-center">
                              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-[6px]">★</div>
                              <div className="w-4 h-4 rounded-full border border-rose-500 bg-rose-100 text-[5px] text-rose-700 flex items-center justify-center font-bold">ត្រា</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-heading font-black text-slate-900 text-xs sm:text-sm">
                          {style.nameKm}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">
                          {style.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {style.descKm}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCHOOL LOGO SETTINGS */}
          {activeTab === 'logo' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900 mb-1">
                  {language === 'km' ? 'ជម្រើសបង្ហាញឡូហ្គោ និងសញ្ញាសម្គាល់' : 'Logo & Header Crest Settings'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'km' 
                    ? 'ជ្រើសរើសរបៀបបង្ហាញឡូហ្គោសាលា ឬផ្ទុកឡើងឡូហ្គោផ្លូវការរបស់សាលាបឋមសិក្សាផ្ទាល់'
                    : 'Display the school emblem or upload your custom school logo'}
                </p>
              </div>

              {/* Logo Mode Selection */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    mode: 'school_only' as ReportLogoMode,
                    titleKm: 'ឡូហ្គោសាលា (School Logo)',
                    descKm: 'បង្ហាញឡូហ្គោសាលា ឬសញ្ញាសម្គាល់ផ្លូវការ',
                    icon: <Building2 className="w-4 h-4 text-indigo-600" />,
                  },
                  {
                    mode: 'minimal' as ReportLogoMode,
                    titleKm: 'អក្សរសុទ្ធ (Minimal)',
                    descKm: 'គ្មានរូបភាពឡូហ្គោ (សន្សំទឹកថ្នាំ)',
                    icon: <FileText className="w-4 h-4 text-slate-600" />,
                  },
                ].map((item) => {
                  const isSelected = config.logoMode === item.mode || (item.mode === 'school_only' && (config.logoMode === 'dual' || config.logoMode === 'moeys_only'));
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => updateConfig({ logoMode: item.mode })}
                      className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/50 shadow-xs ring-1 ring-sky-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {item.icon}
                        {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="font-heading font-black text-xs text-slate-900">{item.titleKm}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.descKm}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Upload School Logo Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {/* Live Preview of School Logo */}
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {config.customLogoUrl || schoolProfile?.logoUrl ? (
                        <img 
                          src={config.customLogoUrl || schoolProfile?.logoUrl} 
                          alt="Custom School Logo" 
                          className="w-full h-full object-contain p-1"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <SchoolLogo size={36} />
                      )}
                    </div>

                    <div>
                      <h4 className="font-heading font-black text-slate-900 text-xs sm:text-sm">
                        {config.customLogoUrl || schoolProfile?.logoUrl 
                          ? (language === 'km' ? 'ឡូហ្គោសាលាបច្ចុប្បន្ន' : 'Current School Logo')
                          : (language === 'km' ? 'ឡូហ្គោស្តង់ដារ (សញ្ញាសម្គាល់ផ្លូវការ)' : 'Default Official Emblem')}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === 'km'
                          ? 'គាំទ្រឯកសារ PNG, JPG ឬ SVG (ទំហំល្អបំផុត 512x512px, ផ្ទៃថ្លា Transparent)'
                          : 'Supports PNG, JPG, or SVG (Recommended square transparent logo)'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{language === 'km' ? 'ផ្ទុកឡើងឡូហ្គោ' : 'Upload Logo'}</span>
                    </button>

                    {(config.customLogoUrl || schoolProfile?.logoUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig({ customLogoUrl: '' });
                          updateSchoolProfile({ logoUrl: '' });
                          showToast(language === 'km' ? 'បានលុបឡូហ្គោសាលា' : 'School logo removed', 'info');
                        }}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title={language === 'km' ? 'លុបឡូហ្គោ' : 'Remove logo'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo Size Selector */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {language === 'km' ? 'ទំហំឡូហ្គោលើសន្លឹកពិន្ទុ៖' : 'Logo Display Size:'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateConfig({ logoSize: size })}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                          config.logoSize === size
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {size === 'sm' ? 'តូច (38px)' : size === 'md' ? 'មធ្យម (48px)' : 'ធំ (58px)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL RED STAMP SETTINGS */}
          {activeTab === 'stamp' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900 mb-1">
                  {language === 'km' ? 'ការកំណត់ត្រាមូលក្រហមរដ្ឋបាលសាលា (Official Stamp)' : 'Administrative Red Rubber Stamp Settings'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'km' 
                    ? 'ត្រាមូលក្រហមផ្លូវការត្រូវបោះពុម្ពត្រួតលើហត្ថលេខានាយកសាលា ដើម្បីបញ្ជាក់ភាពត្រឹមត្រូវនៃលទ្ធផល'
                    : 'Authentic circular red rubber seal displayed over the principal signature area'}
                </p>
              </div>

              {/* Stamp Mode Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    mode: 'generated' as ReportStampMode,
                    titleKm: 'ត្រាមូលឌីជីថល MoEYS (ស្វ័យប្រវត្តិ)',
                    descKm: 'បង្កើតត្រាមូលក្រហមរដ្ឋបាលដោយស្វ័យប្រវត្តិតាមឈ្មោះសាលា និងខេត្ត',
                    badge: 'ណែនាំ (Recommended)',
                  },
                  {
                    mode: 'custom' as ReportStampMode,
                    titleKm: 'ផ្ទុកឡើងត្រាផ្ទាល់ខ្លួន (Custom)',
                    descKm: 'ប្រើរូបភាពត្រាស្កេនរបស់សាលាផ្ទាល់ (ឯកសារ PNG ផ្ទៃថ្លា)',
                    badge: 'ផ្ទាល់ខ្លួន (Custom)',
                  },
                  {
                    mode: 'none' as ReportStampMode,
                    titleKm: 'គ្មានត្រា (No Stamp)',
                    descKm: 'ទុកចន្លោះទទេ សម្រាប់បោះត្រាដៃដោយទឹកថ្នាំក្រហមពិតជាក់ស្ដែង',
                    badge: 'បោះដៃ (Manual)',
                  },
                ].map((item) => {
                  const isSelected = config.stampMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => updateConfig({ 
                        stampMode: item.mode,
                        showPrincipalStamp: item.mode !== 'none' 
                      })}
                      className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/40 shadow-xs ring-1 ring-rose-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-rose-600 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="font-heading font-black text-xs text-slate-900">{item.titleKm}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.descKm}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Stamp Live Preview & Fine Tuning */}
              {config.stampMode !== 'none' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Visual Stamp Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                      <div className="relative w-32 h-32 flex items-center justify-center bg-white rounded-xl shadow-inner border border-slate-100 mb-2">
                        <OfficialSchoolStamp
                          size={config.stampScale * 0.95}
                          customStampUrl={config.stampMode === 'custom' ? config.customStampUrl : undefined}
                          rotation={config.stampRotation}
                          opacity={config.stampOpacity}
                          customText={config.stampText}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {language === 'km' ? 'ទិដ្ឋភាពត្រាក្រហម' : 'Red Stamp Preview'}
                      </span>
                    </div>

                    {/* Fine Tuning Controls */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Stamp Placement */}
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1.5">
                          {language === 'km' ? 'ទីតាំងបោះត្រា៖' : 'Stamp Placement:'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'principal' as StampPosition, label: 'លើហត្ថលេខានាយក (Standard)' },
                            { id: 'center_watermark' as StampPosition, label: 'ត្រាទឹកកណ្តាល (Watermark)' },
                            { id: 'both' as StampPosition, label: 'ទាំងពីរ (Both)' },
                          ].map(pos => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => updateConfig({ stampPosition: pos.id })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                                config.stampPosition === pos.id
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stamp Scale Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>{language === 'km' ? 'ទំហំត្រា (Scale)' : 'Stamp Size:'}</span>
                          <span className="font-mono text-rose-600">{config.stampScale}%</span>
                        </div>
                        <input
                          type="range"
                          min="75"
                          max="130"
                          value={config.stampScale}
                          onChange={(e) => updateConfig({ stampScale: Number(e.target.value) })}
                          className="w-full accent-rose-600 cursor-pointer"
                        />
                      </div>

                      {/* Stamp Rotation / Realistic Tilt Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>{language === 'km' ? 'មុំទ្រេតត្រាធម្មជាតិ (Tilt Angle)' : 'Realistic Stamp Tilt:'}</span>
                          <span className="font-mono text-rose-600">{config.stampRotation}°</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="-8"
                            max="8"
                            step="1"
                            value={config.stampRotation}
                            onChange={(e) => updateConfig({ stampRotation: Number(e.target.value) })}
                            className="w-full accent-rose-600 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => updateConfig({ stampRotation: -4 })}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                            title="Reset to natural -4° tilt"
                          >
                            -4°
                          </button>
                          <button
                            type="button"
                            onClick={() => updateConfig({ stampRotation: 0 })}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                            title="Set straight 0°"
                          >
                            0°
                          </button>
                        </div>
                      </div>

                      {/* Stamp Custom Text */}
                      {config.stampMode === 'generated' && (
                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1">
                            {language === 'km' ? 'អត្ថបទកណ្តាលត្រា៖' : 'Stamp Center Text:'}
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={config.stampText || ''}
                              onChange={(e) => updateConfig({ stampText: e.target.value })}
                              placeholder="បានពិនិត្យ និងយល់ព្រម"
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => updateConfig({ stampText: 'បានពិនិត្យ និងយល់ព្រម' })}
                              className="px-2 py-1.5 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap"
                            >
                              យល់ព្រម
                            </button>
                            <button
                              type="button"
                              onClick={() => updateConfig({ stampText: 'នាយកសាលា' })}
                              className="px-2 py-1.5 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap"
                            >
                              នាយកសាលា
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Custom Stamp Upload trigger */}
                      {config.stampMode === 'custom' && (
                        <div>
                          <input
                            ref={stampFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleStampUpload}
                            className="hidden"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => stampFileInputRef.current?.click()}
                              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{config.customStampUrl ? (language === 'km' ? 'ប្តូររូបភាពត្រាថ្មី' : 'Change Stamp File') : (language === 'km' ? 'ផ្ទុកឡើងរូបភាពត្រា (PNG)' : 'Upload Stamp PNG')}</span>
                            </button>
                            {config.customStampUrl && (
                              <button
                                type="button"
                                onClick={() => updateConfig({ customStampUrl: '', stampMode: 'generated' })}
                                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                title="Delete custom stamp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SIGNATURES & WATERMARK */}
          {activeTab === 'signatures' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-heading font-black text-sm text-slate-900 mb-1">
                  {language === 'km' ? 'ការកំណត់ហត្ថលេខា និងត្រាទឹកផ្លូវការ' : 'Signatures & Official Watermark'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'km' 
                    ? 'កំណត់បង្ហាញហត្ថលេខាឌីជីថល ឈ្មោះគ្រូ ឈ្មោះនាយក និងសញ្ញាសម្គាល់ត្រាទឹកលើផ្ទៃក្រដាស'
                    : 'Manage digital signatures for homeroom teacher and school principal, plus faint page watermarks'}
                </p>
              </div>

              {/* Watermark Toggle */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900">
                    {language === 'km' ? 'បង្ហាញសញ្ញាសម្គាល់ត្រាទឹកកណ្តាលទំព័រ (Watermark)' : 'Show Background Watermark'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'km' 
                      ? 'បង្ហាញរូបសញ្ញាសម្គាល់ MoEYS ឬឡូហ្គោសាលាស្រាលៗនៅកណ្តាលសន្លឹកលទ្ធផល'
                      : 'Faint crest watermark in the center of the report card for anti-counterfeit authenticity'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showWatermark}
                    onChange={(e) => updateConfig({ showWatermark: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Digital Signatures Upload Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Principal Signature */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading font-black text-xs text-slate-900">
                      {language === 'km' ? 'ហត្ថលេខានាយកសាលា' : 'Principal Signature'}
                    </span>
                    <input
                      ref={principalSigInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSignatureUpload('principal', e)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => principalSigInputRef.current?.click()}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{config.principalSignatureUrl ? (language === 'km' ? 'ប្តូរ' : 'Change') : (language === 'km' ? 'បញ្ចូល' : 'Upload')}</span>
                    </button>
                  </div>

                  <div className="h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {config.principalSignatureUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center p-1">
                        <img 
                          src={config.principalSignatureUrl} 
                          alt="Principal Signature" 
                          className="max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => updateConfig({ principalSignatureUrl: '' })}
                          className="absolute right-1 top-1 p-1 bg-white/90 rounded-md text-rose-600 hover:bg-rose-50"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {language === 'km' ? '(ចុះហត្ថលេខាដោយដៃលើក្រដាស)' : '(Handwritten signature on paper)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Homeroom Teacher Signature */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading font-black text-xs text-slate-900">
                      {language === 'km' ? 'ហត្ថលេខាគ្រូបន្ទុកថ្នាក់' : 'Teacher Signature'}
                    </span>
                    <input
                      ref={teacherSigInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSignatureUpload('teacher', e)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => teacherSigInputRef.current?.click()}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{config.teacherSignatureUrl ? (language === 'km' ? 'ប្តូរ' : 'Change') : (language === 'km' ? 'បញ្ចូល' : 'Upload')}</span>
                    </button>
                  </div>

                  <div className="h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {config.teacherSignatureUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center p-1">
                        <img 
                          src={config.teacherSignatureUrl} 
                          alt="Teacher Signature" 
                          className="max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => updateConfig({ teacherSignatureUrl: '' })}
                          className="absolute right-1 top-1 p-1 bg-white/90 rounded-md text-rose-600 hover:bg-rose-50"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {language === 'km' ? '(ចុះហត្ថលេខាដោយដៃលើក្រដាស)' : '(Handwritten signature on paper)'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom helper bar */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{language === 'km' ? 'រាល់ការកែប្រែនឹងបង្ហាញផ្ទាល់នៅលើសន្លឹកលទ្ធផលភ្លាមៗ' : 'All modifications update the live preview instantaneously'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'រួចរាល់ (Done)' : 'Apply & Close'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
