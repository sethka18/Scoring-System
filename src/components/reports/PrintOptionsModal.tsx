import React from 'react';
import { 
  X, 
  Check, 
  RotateCcw, 
  CalendarDays, 
  MessageSquare, 
  UserCheck, 
  Trophy, 
  ListTree, 
  HeartHandshake, 
  Award, 
  PenLine, 
  SlidersHorizontal,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

export interface ReportPrintOptions {
  showAttendance: boolean;
  showTeacherComments: boolean;
  showParentFeedback: boolean;
  showRank: boolean;
  showSubSkills: boolean;
  showConduct: boolean;
  show3Pillars: boolean;
  showSignatures: boolean;
}

export const DEFAULT_PRINT_OPTIONS: ReportPrintOptions = {
  showAttendance: true,
  showTeacherComments: true,
  showParentFeedback: true,
  showRank: true,
  showSubSkills: true,
  showConduct: true,
  show3Pillars: true,
  showSignatures: true,
};

interface PrintOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ReportPrintOptions;
  onOptionsChange: (newOptions: ReportPrintOptions) => void;
  reportMode: 'monthly' | 'yearly';
  onOpenLayoutConfig?: () => void;
}

export const PrintOptionsModal: React.FC<PrintOptionsModalProps> = ({
  isOpen,
  onClose,
  options,
  onOptionsChange,
  reportMode,
  onOpenLayoutConfig,
}) => {
  if (!isOpen) return null;

  const toggleOption = (key: keyof ReportPrintOptions) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  const handleSetAll = (enabled: boolean) => {
    onOptionsChange({
      showAttendance: enabled,
      showTeacherComments: enabled,
      showParentFeedback: enabled,
      showRank: enabled,
      showSubSkills: enabled,
      showConduct: enabled,
      show3Pillars: enabled,
      showSignatures: enabled,
    });
  };

  const handleApplyPreset = (preset: 'all' | 'compact' | 'scoresOnly') => {
    if (preset === 'all') {
      handleSetAll(true);
    } else if (preset === 'compact') {
      onOptionsChange({
        ...options,
        showAttendance: true,
        showTeacherComments: true,
        showParentFeedback: false,
        showRank: true,
        showSubSkills: false,
        showConduct: true,
        show3Pillars: false,
        showSignatures: true,
      });
    } else if (preset === 'scoresOnly') {
      onOptionsChange({
        ...options,
        showAttendance: false,
        showTeacherComments: false,
        showParentFeedback: false,
        showRank: true,
        showSubSkills: false,
        showConduct: false,
        show3Pillars: false,
        showSignatures: true,
      });
    }
  };

  const handleReset = () => {
    onOptionsChange(DEFAULT_PRINT_OPTIONS);
  };

  const activeCount = Object.values(options).filter(Boolean).length;
  const totalCount = Object.keys(options).length;

  const optionItems: {
    key: keyof ReportPrintOptions;
    title: string;
    description: string;
    icon: React.ReactNode;
    tag?: string;
    relevantModes: ('monthly' | 'yearly')[];
  }[] = [
    {
      key: 'showAttendance',
      title: 'វត្តមាន & អវត្តមាន (Attendance)',
      description: 'បង្ហាញចំនួនថ្ងៃអវត្តមាន និងភាគរយវត្តមានសិស្សប្រចាំខែ/ឆ្នាំ',
      icon: <CalendarDays className="w-5 h-5 text-sky-600" />,
      relevantModes: ['monthly', 'yearly'],
    },
    {
      key: 'showTeacherComments',
      title: 'មតិយោបល់គ្រូបន្ទុកថ្នាក់ (Teacher Comments)',
      description: 'បង្ហាញការសង្កេត ការវាយតម្លៃ និងការណែនាំរបស់គ្រូបង្រៀន',
      icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
      relevantModes: ['monthly', 'yearly'],
    },
    {
      key: 'showParentFeedback',
      title: 'ប្រអប់មតិមាតាបិតា (Parent Feedback)',
      description: 'បង្ហាញចន្លោះបន្ទាត់សម្រាប់មាតាបិតាសរសេរមតិឆ្លើយតប',
      icon: <PenLine className="w-5 h-5 text-amber-600" />,
      relevantModes: ['monthly'],
    },
    {
      key: 'showRank',
      title: 'ចំណាត់ថ្នាក់សិស្ស (Student Rank)',
      description: 'បង្ហាញលេខរៀងចំណាត់ថ្នាក់សិស្សក្នុងថ្នាក់ (ឧ. #1, #5)',
      icon: <Trophy className="w-5 h-5 text-yellow-600" />,
      relevantModes: ['monthly', 'yearly'],
    },
    {
      key: 'showSubSkills',
      title: 'ជំនាញរងលម្អិតមុខវិជ្ជា (Sub-Skills)',
      description: 'បង្ហាញពិន្ទុបំបែកផ្នែកដូចជា អាន សរសេរ ស្ដាប់ និយាយ ពិជគណិត',
      icon: <ListTree className="w-5 h-5 text-emerald-600" />,
      tag: 'ខែ (Monthly)',
      relevantModes: ['monthly'],
    },
    {
      key: 'showConduct',
      title: 'ចរិយាធម៌ & សីលធម៌ (Conduct Rating)',
      description: 'បង្ហាញកម្រិតចរិយាធម៌ (ល្អប្រសើរ ល្អណាស់ ល្អ មធ្យម)',
      icon: <HeartHandshake className="w-5 h-5 text-rose-600" />,
      relevantModes: ['monthly', 'yearly'],
    },
    {
      key: 'show3Pillars',
      title: 'សម្បទាទាំង ៣ MoEYS (3-Pillars Competency)',
      description: 'បង្ហាញការគណនា វិជ្ជាសម្បទា បំណិនសម្បទា និងចរិយាសម្បទា',
      icon: <Award className="w-5 h-5 text-purple-600" />,
      tag: 'ប្រចាំឆ្នាំ (Annual)',
      relevantModes: ['yearly'],
    },
    {
      key: 'showSignatures',
      title: 'កន្លែងចុះហត្ថលេខាផ្លូវការ (Signatures & Stamp)',
      description: 'បង្ហាញប្លុកហត្ថលេខា គ្រូបន្ទុកថ្នាក់ នាយកសាលា និងអាណាព្យាបាល',
      icon: <UserCheck className="w-5 h-5 text-teal-600" />,
      relevantModes: ['monthly', 'yearly'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                <span>ជម្រើសកំណត់ការបោះពុម្ព</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                  {activeCount}/{totalCount} បើក
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ជ្រើសរើសព័ត៌មាន និងផ្នែកដែលត្រូវបង្ហាញនៅលើសន្លឹកលទ្ធផលសិក្សា មុនពេលទាញយកជា PDF
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              កម្រងជម្រើសរហ័ស៖
            </span>
            <button
              onClick={() => handleApplyPreset('all')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900 transition cursor-pointer"
            >
              បង្ហាញទាំងអស់
            </button>
            <button
              onClick={() => handleApplyPreset('compact')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900 transition cursor-pointer"
            >
              ទម្រង់សង្ខេប
            </button>
            <button
              onClick={() => handleApplyPreset('scoresOnly')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900 transition cursor-pointer"
            >
              ពិន្ទុសុទ្ធ
            </button>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>កំណត់ឡើងវិញ</span>
          </button>
        </div>

        {/* Options List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {onOpenLayoutConfig && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs mb-2">
              <div className="flex items-center space-x-2.5">
                <span className="text-base">🏛️</span>
                <div>
                  <p className="font-heading font-black text-amber-950 text-xs">
                    ចង់ប្តូរទម្រង់ MoEYS ឬបន្ថែមត្រាសាលា?
                  </p>
                  <p className="text-[11px] text-amber-800">
                    ជ្រើសរើសទម្រង់ក្រសួង ៤ បែប បន្ថែមឡូហ្គោ និងត្រាមូលក្រហមផ្លូវការ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLayoutConfig();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 transition cursor-pointer shadow-2xs"
              >
                កំណត់ទម្រង់ & ត្រា
              </button>
            </div>
          )}

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>ផ្នែកទិន្នន័យនីមួយៗ (Data Sections)</span>
            <span className="text-slate-500">
              កំពុងមើល៖ {reportMode === 'monthly' ? 'លទ្ធផលសិក្សាប្រចាំខែ' : 'លទ្ធផលសិក្សាប្រចាំឆ្នាំ'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {optionItems.map((item) => {
              const isChecked = options[item.key];
              const isRelevant = item.relevantModes.includes(reportMode);

              return (
                <div
                  key={item.key}
                  onClick={() => toggleOption(item.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between space-x-3 ${
                    isChecked
                      ? 'border-indigo-300 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 opacity-75'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      isChecked ? 'bg-white shadow-xs' : 'bg-slate-200/70'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className={`text-xs font-black ${
                          isChecked ? 'text-slate-900' : 'text-slate-600'
                        }`}>
                          {item.title}
                        </span>
                        {item.tag && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {item.tag}
                          </span>
                        )}
                        {!isRelevant && (
                          <span className="text-[9px] font-medium text-slate-400 italic">
                            (សម្រាប់ទម្រង់ផ្សេង)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Switch toggle control */}
                  <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isChecked ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center space-x-2.5 text-xs text-blue-800">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <p>
              ការកំណត់ទាំងនេះនឹងមានប្រសិទ្ធភាពភ្លាមៗនៅលើសន្លឹកលទ្ធផលដែលកំពុងបង្ហាញ ក៏ដូចជាការទាញយកជា PDF (ទាំងសិស្សទោល និងទាញយកទាំងអស់)។
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            {activeCount === totalCount ? (
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <Check className="w-4 h-4" />
                <span>បង្ហាញគ្រប់ព័ត៌មានទាំងអស់</span>
              </span>
            ) : (
              <span className="font-semibold">
                បានបិទ {totalCount - activeCount} ផ្នែក
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition cursor-pointer"
            >
              រួចរាល់ (Apply Options)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
