import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student, AssessmentPeriod } from '../../types';
import { calculatePeriodAverage, calculatePeriodRankings } from '../../utils/calculations';
import { 
  Send, 
  Copy, 
  Check, 
  X, 
  MessageCircle, 
  Share2, 
  Sparkles,
  Phone,
  UserCheck,
  Award
} from 'lucide-react';

interface TelegramShareModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  periodId?: string;
}

export const TelegramShareModal: React.FC<TelegramShareModalProps> = ({
  student,
  isOpen,
  onClose,
  periodId
}) => {
  const { 
    language, 
    activeClass, 
    periods, 
    activePeriodId, 
    subjects, 
    scoresMatrix, 
    weights,
    classStudents,
    getStudentMonthlyAttendance,
    showToast
  } = useGradebook();

  const [copied, setCopied] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periodId || activePeriodId);
  const [includeSubjectBreakdown, setIncludeSubjectBreakdown] = useState(true);
  const [includeAttendance, setIncludeAttendance] = useState(true);
  const [includeTeacherRemark, setIncludeTeacherRemark] = useState(true);
  const [customRemark, setCustomRemark] = useState('');

  if (!isOpen) return null;

  const currentPeriod = periods.find(p => p.id === selectedPeriod) || periods[0];
  const rankings = calculatePeriodRankings(classStudents, selectedPeriod, subjects, scoresMatrix, weights);
  const studentRankInfo = rankings.find(r => r.student.id === student.id);
  const studentAvgData = calculatePeriodAverage(student.id, selectedPeriod, subjects, scoresMatrix, weights);
  const studentAverage = studentAvgData.average;
  
  // Attendance for the period
  const attendance = getStudentMonthlyAttendance(student.id);

  // Generate Cambodian MoEYS parent progress message
  const generateMessage = (): string => {
    const isKm = language === 'km';
    const lines: string[] = [];

    // Header
    lines.push(`🇰🇭 របាយការណ៍លទ្ធផលសិក្សាសិស្ស`);
    lines.push(`🏫 ${activeClass?.schoolNameKm || 'សាលាបឋមសិក្សា'}`);
    lines.push(`📚 ថ្នាក់៖ ${activeClass?.nameKm || 'ថ្នាក់ទី៦'} | ឆ្នាំសិក្សា៖ ${activeClass?.academicYear || '2026-2027'}`);
    lines.push(`👨‍🏫 គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherNameKm || 'គ្រូបង្រៀន'}`);
    lines.push(`────────────────────────`);
    
    // Student Info
    lines.push(`👤 សិស្សឈ្មោះ៖ ${student.name}`);
    lines.push(`🆔 អត្តលេខ៖ ${student.studentId} | ភេទ៖ ${student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}`);
    lines.push(`📅 ប្រចាំ៖ ${currentPeriod.nameKm}`);
    
    // Overall Academic Standing
    lines.push(`────────────────────────`);
    lines.push(`🏆 ចំណាត់ថ្នាក់៖ លេខ ${studentRankInfo?.rank || 1} នៃ ${classStudents.length} នាក់`);
    lines.push(`📊 មធ្យមភាគពិន្ទុ៖ ${studentAverage.toFixed(2)} / 10.00`);
    
    let gradeLabel = 'ល្អប្រសើរ';
    if (studentAverage >= 9.0) gradeLabel = '🌟 ឆ្នើម';
    else if (studentAverage >= 8.0) gradeLabel = '🥇 ល្អណាស់';
    else if (studentAverage >= 6.5) gradeLabel = '🥈 ល្អ';
    else if (studentAverage >= 5.0) gradeLabel = '🥉 មធ្យម';
    else gradeLabel = '⚠️ ត្រូវខិតខំបន្ថែម';
    
    lines.push(`🎖️ កម្រិតនិទ្ទេស៖ ${gradeLabel}`);

    // Subject Breakdown
    if (includeSubjectBreakdown) {
      lines.push(`\n📖 ពិន្ទុតាមមុខវិជ្ជា៖`);
      subjects.forEach(subj => {
        const score = scoresMatrix[student.id]?.[selectedPeriod]?.[subj.id]?.rawScore;
        const scoreVal = score !== undefined ? Number(score).toFixed(1) : '-';
        lines.push(`  • ${subj.nameKm}: ${scoreVal}/10`);
      });
    }

    // Attendance
    if (includeAttendance) {
      lines.push(`\n📋 វត្តមានប្រចាំខែ៖`);
      lines.push(`  • វត្តមានមកស្មើ៖ ${attendance.presentDays} ថ្ងៃ`);
      lines.push(`  • អវត្តមានមានច្បាប់ (ច)៖ ${attendance.excusedDays} ថ្ងៃ`);
      lines.push(`  • អវត្តមានអត់ច្បាប់ (អច)៖ ${attendance.unexcusedDays} ថ្ងៃ`);
      lines.push(`  • អត្រាវត្តមាន៖ ${attendance.attendanceRate}%`);
    }

    // Teacher remarks
    if (includeTeacherRemark) {
      const defaultRemark = studentAverage >= 8.0 
        ? 'សិស្សមានការយកចិត្តទុកដាក់ និងខិតខំរៀនសូត្របានល្អណាស់។ សូមអាណាព្យាបាលបន្តលើកទឹកចិត្តបន្ថែម។'
        : studentAverage >= 5.0 
        ? 'សិស្សរៀនបានមធ្យម សូមអាណាព្យាបាលជួយជម្រុញបន្ថែមលើការអាន និងលំហាត់គណិតវិទ្យានៅផ្ទះ។'
        : 'សិស្សត្រូវការការជួយជ្រោមជ្រែងបន្ថែមជាប្រចាំពីគ្រូ និងអាណាព្យាបាលដើម្បីពង្រឹងការសិក្សា។';
      
      const remarkToUse = customRemark.trim() || defaultRemark;
      lines.push(`\n✍️ មតិយោបល់របស់លោកគ្រូ/អ្នកគ្រូ៖`);
      lines.push(`"${remarkToUse}"`);
    }

    // Footer
    lines.push(`\n🙏 សូមអរគុណលោកឪពុកអ្នកម្តាយ និងអាណាព្យាបាលសម្រាប់ការសហការជានិច្ច! ❤️`);
    
    return lines.join('\n');
  };

  const messageText = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    showToast(
      language === 'km' 
        ? 'បានចម្លងរបាយការណ៍ជោគជ័យ! អ្នកអាចបិទភ្ជាប់ក្នុង Telegram/WhatsApp បានហើយ' 
        : 'Report summary copied! Ready to paste into Telegram or WhatsApp'
    );
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareTelegram = () => {
    const encodedText = encodeURIComponent(messageText);
    const url = `https://t.me/share/url?url=&text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(messageText);
    const phone = student.guardianPhone ? student.guardianPhone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center space-x-2">
                <span>{language === 'km' ? 'ផ្ញើរបាយការណ៍ទៅ Telegram / WhatsApp' : 'Telegram & WhatsApp Parent Share'}</span>
                <span className="px-2 py-0.5 rounded-full text-2xs bg-white/20 font-mono">1-Click</span>
              </h3>
              <p className="text-xs text-blue-100">
                {student.name} ({student.studentId}) • {currentPeriod.nameKm}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Controls / Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ជ្រើសរើសខែ / ឆមាស' : 'Assessment Period'}
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>
                    {language === 'km' ? p.nameKm : p.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {student.guardianPhone && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'លេខទូរស័ព្ទអាណាព្យាបាល' : 'Guardian Phone'}
                </label>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{student.guardianPhone}</span>
                  <span className="text-2xs text-slate-400">({student.guardianName || 'Parent'})</span>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSubjectBreakdown}
                  onChange={(e) => setIncludeSubjectBreakdown(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{language === 'km' ? 'បញ្ចូលពិន្ទុតាមមុខវិជ្ជា' : 'Include Subjects'}</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAttendance}
                  onChange={(e) => setIncludeAttendance(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{language === 'km' ? 'បញ្ចូលស្ថិតិវត្តមាន (ច/អច)' : 'Include Attendance'}</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTeacherRemark}
                  onChange={(e) => setIncludeTeacherRemark(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{language === 'km' ? 'បញ្ចូលមតិយោបល់គ្រូ' : 'Include Teacher Remark'}</span>
              </label>
            </div>

            {includeTeacherRemark && (
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={customRemark}
                  onChange={(e) => setCustomRemark(e.target.value)}
                  placeholder={language === 'km' ? 'សរសេរមតិយោបល់បន្ថែមពិសេសសម្រាប់សិស្សរូបនេះ (ស្រេចចិត្ត)...' : 'Optional custom teacher note for this student...'}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Formatted Text Preview Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'km' ? 'ទម្រង់សារដែលត្រូវផ្ញើ (Message Preview)' : 'Generated Parent Message'}</span>
              </span>
              <button
                onClick={handleCopy}
                className="text-2xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? (language === 'km' ? 'បានចម្លង!' : 'Copied!') : (language === 'km' ? 'ចម្លងអត្ថបទ' : 'Copy Text')}</span>
              </button>
            </div>

            <pre className="w-full bg-slate-900 text-slate-100 font-sans text-xs p-4 rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 select-all scrollbar-thin">
              {messageText}
            </pre>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm ${
              copied 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (language === 'km' ? 'បានចម្លងរួចរាល់' : 'Copied to Clipboard!') : (language === 'km' ? 'ចម្លងសារ (Copy)' : 'Copy Message')}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareTelegram}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'km' ? 'ផ្ញើទៅ Telegram' : 'Send via Telegram'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{language === 'km' ? 'ផ្ញើទៅ WhatsApp' : 'Send via WhatsApp'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
