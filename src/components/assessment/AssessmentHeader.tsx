import React from 'react';
import { 
  Award, 
  HeartHandshake, 
  User, 
  Users, 
  Eye, 
  FileSpreadsheet, 
  Sparkles,
  BarChart3,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { NavTab } from '../../context/GradebookContext';

interface AssessmentHeaderProps {
  currentTab: 'skills_assessment' | 'attitude_assessment';
  onSwitchTab: (tab: NavTab) => void;
  viewMode: 'individual' | 'matrix' | 'print';
  onViewModeChange: (mode: 'individual' | 'matrix' | 'print') => void;
  onExportExcel: () => void;
  classNameKm: string;
  totalStudents: number;
  evaluatedCount: number;
  averageScoreOn10: number;
  gradeCounts: {
    excellent: number; // ល្អ
    veryGood: number;  // ល្អបង្គួរ
    fair: number;      // មធ្យម
    poor: number;      // ខ្សោយ
  };
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  currentTab,
  onSwitchTab,
  viewMode,
  onViewModeChange,
  onExportExcel,
  classNameKm,
  totalStudents,
  evaluatedCount,
  averageScoreOn10,
  gradeCounts,
}) => {
  const isSkills = currentTab === 'skills_assessment';

  return (
    <div className="space-y-4 font-khmer">
      {/* Primary Domain Switcher (Skills vs Attitude Hub) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Domain Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl w-full lg:w-auto">
            {/* Skills Tab */}
            <button
              type="button"
              onClick={() => onSwitchTab('skills_assessment')}
              className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isSkills
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isSkills ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left leading-normal">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">វាយតម្លៃបំណិន</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800 font-mono font-bold">
                    ឧបសម្ព័ន្ធ ៣
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  ១៨ សកម្មភាព • ទម្ងន់ ១០%
                </div>
              </div>
            </button>

            {/* Attitude Tab */}
            <button
              type="button"
              onClick={() => onSwitchTab('attitude_assessment')}
              className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !isSkills
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${!isSkills ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="text-left leading-normal">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">វាយតម្លៃចរិយា</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800 font-mono font-bold">
                    ឧបសម្ព័ន្ធ ៤
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  ៧៤ លក្ខណៈវិនិច្ឆ័យ • ទម្ងន់ ១០%
                </div>
              </div>
            </button>
          </div>

          {/* Right Side: View Mode Switcher (Individual, Matrix, Print) & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onViewModeChange('individual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'individual'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>សិស្សម្នាក់ៗ</span>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>តារាងរួមថ្នាក់</span>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('print')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'print'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ទម្រង់បោះពុម្ព A4</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-medium transition-all shadow-xs"
              title="ទាញយកជាឯកសារ Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Quick Class Summary Ribbon */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ថ្នាក់៖ <strong className="text-slate-900 dark:text-slate-100">{classNameKm}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              សិស្សសរុប៖ <strong className="text-slate-900 dark:text-slate-100 font-mono">{totalStudents}</strong> នាក់
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              បានវាយតម្លៃ៖ <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{evaluatedCount}</strong>/{totalStudents} នាក់
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              មធ្យមភាគថ្នាក់៖ <strong className="text-indigo-700 dark:text-indigo-400 font-mono text-sm">{averageScoreOn10.toFixed(2)}</strong> <span className="text-[11px] text-slate-400">/១០</span>
            </span>
          </div>

          {/* Grade Distribution Pills */}
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200/60 dark:border-emerald-800">
              ល្អ: <strong className="font-mono font-bold">{gradeCounts.excellent}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200/60 dark:border-blue-800">
              ល្អបង្គួរ: <strong className="font-mono font-bold">{gradeCounts.veryGood}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-200/60 dark:border-amber-800">
              មធ្យម: <strong className="font-mono font-bold">{gradeCounts.fair}</strong>
            </span>
            {gradeCounts.poor > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-medium border border-rose-200/60 dark:border-rose-800">
                ខ្សោយ: <strong className="font-mono font-bold">{gradeCounts.poor}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
