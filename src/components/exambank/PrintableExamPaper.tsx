import React, { useState } from 'react';
import { ExamPaper, Subject, Language, SchoolProfile } from '../../types';
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Eye, 
  Award, 
  Clock, 
  Sparkles,
  School,
  Edit3
} from 'lucide-react';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { SchoolLogo } from '../common/SchoolLogo';

interface PrintableExamPaperProps {
  examPaper: ExamPaper;
  subjects: Subject[];
  schoolProfile?: SchoolProfile;
  language: Language;
  onBack: () => void;
  onEdit?: (paper: ExamPaper) => void;
}

export const PrintableExamPaper: React.FC<PrintableExamPaperProps> = ({
  examPaper,
  subjects,
  schoolProfile,
  language,
  onBack,
  onEdit
}) => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher_key'>('student');
  const [showAnswerLines, setShowAnswerLines] = useState<boolean>(true);
  const [showScoreBox, setShowScoreBox] = useState<boolean>(true);

  const subject = subjects.find(s => s.id === examPaper.subjectId);
  const subjectName = language === 'km' 
    ? (subject?.nameKm || examPaper.subjectId) 
    : (subject?.nameEn || examPaper.subjectId);

  // Total points
  const totalCalculatedScore = examPaper.items.reduce((sum, item) => sum + (item.customPoints || item.questionSnapshot.points || 1), 0);

  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNumber = (num: number): string => {
    return num.toString().split('').map(d => khmerNumbers[parseInt(d, 10)] || d).join('');
  };

  return (
    <div className="space-y-6">
      {/* Action Navigation & Controls Bar (no-print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'km' ? 'ត្រឡប់ទៅបញ្ជីវិញ្ញាសា' : 'Back to Repository'}</span>
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(examPaper)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'កែសម្រួលវិញ្ញាសា' : 'Edit Exam'}</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              viewMode === 'student'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'km' ? 'សន្លឹកកិច្ចការប្រឡងសិស្ស' : 'Student Test Paper'}
          </button>
          <button
            onClick={() => setViewMode('teacher_key')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              viewMode === 'teacher_key'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'km' ? 'សន្លឹកគន្លឹះចម្លើយ & បំណែងចែកពិន្ទុ (គ្រូ)' : 'Teacher Answer Key'}
          </button>
        </div>

        {/* Print Toggles & Print Button */}
        <div className="flex items-center space-x-2">
          <label className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnswerLines}
              onChange={(e) => setShowAnswerLines(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>{language === 'km' ? 'បន្ទាត់ចម្លើយ' : 'Ruled Lines'}</span>
          </label>

          <PrintToPdfButton
            targetElementId="printable-exam-paper-container"
            documentTitle={`${examPaper.code || 'Exam'}_${viewMode === 'teacher_key' ? 'AnswerKey' : 'StudentPaper'}`}
            pageSize="a4"
            orientation="portrait"
            labelKm={viewMode === 'teacher_key' ? 'បោះពុម្ពគន្លឹះចម្លើយ' : 'បោះពុម្ពវិញ្ញាសា (PDF)'}
            labelEn={viewMode === 'teacher_key' ? 'Print Answer Key' : 'Print Exam Paper (PDF)'}
          />
        </div>
      </div>

      {/* Printable Sheet Canvas */}
      <div className="flex justify-center">
        <div 
          id="printable-exam-paper-container"
          className="w-full max-w-[800px] bg-white text-slate-900 shadow-lg border border-slate-200 p-8 sm:p-12 print:p-0 print:border-0 print:shadow-none print:max-w-none text-sm font-serif leading-relaxed"
          style={{ fontFamily: "'Kantumruy Pro', 'Hanuman', serif" }}
        >
          {/* Official Kingdom Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
            {/* Left: Ministry / School Info */}
            <div className="text-center sm:text-left space-y-1">
              <p className="font-bold text-xs uppercase tracking-wider text-slate-700">
                {schoolProfile?.provinceEn ? `មន្ទីរអប់រំ យុវជន និងកីឡា ${schoolProfile.provinceKm || 'រាជធានីភ្នំពេញ'}` : 'មន្ទីរអប់រំ យុវជន និងកីឡា'}
              </p>
              <p className="font-bold text-xs text-slate-700">
                {schoolProfile?.districtKm ? `ការិយាល័យអប់រំ យុវជន និងកីឡា ${schoolProfile.districtKm}` : 'ការិយាល័យអប់រំ យុវជន និងកីឡា'}
              </p>
              <p className="font-black text-sm text-slate-900">
                {examPaper.schoolName || schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាគំរូ'}
              </p>
              <div className="pt-1 text-[11px] text-slate-600">
                <span>ឆ្នាំសិក្សា៖ <strong>{examPaper.academicYear || '២០២៥ - ២០២៦'}</strong></span>
              </div>
            </div>

            {/* Center: School Logo */}
            <div className="hidden sm:flex flex-col items-center">
              <SchoolLogo size={52} customLogoUrl={schoolProfile?.logoUrl} />
            </div>

            {/* Right: Kingdom / Motto */}
            <div className="text-center space-y-1">
              <h4 className="font-black text-sm text-slate-900 tracking-wide">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h4>
              <p className="font-bold text-xs text-slate-800">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </p>
              <div className="text-amber-600 text-xs tracking-widest">
                * * *
              </div>
              <div className="pt-1 text-[11px] text-slate-600">
                កាលបរិច្ឆេទ៖ ថ្ងៃទី...... ខែ...... ឆ្នាំ២០២...
              </div>
            </div>
          </div>

          {/* Exam Title & Period Banner */}
          <div className="text-center py-2 mb-4 bg-slate-50 border border-slate-300 rounded-lg">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              {examPaper.title}
            </h2>
            <div className="flex items-center justify-center space-x-4 text-xs font-bold text-slate-700 mt-1">
              <span>មុខវិជ្ជា៖ <strong>{subjectName}</strong></span>
              <span>•</span>
              <span>កម្រិតថ្នាក់៖ <strong>ថ្នាក់ទី {toKhmerNumber(examPaper.grade)}</strong></span>
              <span>•</span>
              <span>រយៈពេល៖ <strong>{toKhmerNumber(examPaper.durationMinutes)} នាទី</strong></span>
              <span>•</span>
              <span>ពិន្ទុសរុប៖ <strong>{toKhmerNumber(totalCalculatedScore)} ពិន្ទុ</strong></span>
            </div>
            {viewMode === 'teacher_key' && (
              <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
                ★ សន្លឹកកម្រងចម្លើយ និងបំណែងចែកពិន្ទុ (សម្រាប់លោកគ្រូ-អ្នកគ្រូ) ★
              </div>
            )}
          </div>

          {/* Student Identification & Score Card Box */}
          {showScoreBox && (
            <div className="border border-slate-400 rounded-lg p-3 mb-6 grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold">ឈ្មោះសិស្ស៖</span>
                  <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
                  <span className="font-bold">ភេទ៖</span>
                  <span className="border-b border-dotted border-slate-500 w-12 h-4"></span>
                  <span className="font-bold">លេខតុ៖</span>
                  <span className="border-b border-dotted border-slate-500 w-12 h-4"></span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span>ហត្ថលេខាសិស្ស៖ ........................................</span>
                  <span>ហត្ថលេខាអ្នកអនុរក្ស៖ ........................................</span>
                </div>
              </div>

              {/* Score Box */}
              <div className="border-l border-slate-300 pl-3 flex flex-col justify-center items-center text-center">
                <span className="font-bold text-[11px] text-slate-600 uppercase">ពិន្ទុទទួលបាន / ពិន្ទុសរុប</span>
                <div className="mt-1 w-20 h-9 border border-slate-400 rounded flex items-center justify-center font-black text-base text-slate-900">
                  / {toKhmerNumber(totalCalculatedScore)}
                </div>
              </div>
            </div>
          )}

          {/* Exam Instructions */}
          {examPaper.instructions && (
            <div className="mb-6 p-2.5 rounded bg-slate-50 border-l-4 border-slate-700 text-xs italic text-slate-700">
              <strong>ការណែនាំ៖ </strong> {examPaper.instructions}
            </div>
          )}

          {/* Questions Body */}
          <div className="space-y-6">
            {examPaper.items.map((item, idx) => {
              const q = item.questionSnapshot;
              const points = item.customPoints || q.points || 1;

              return (
                <div key={idx} className="space-y-2 break-inside-avoid">
                  {/* Question Prompt Line */}
                  <div className="flex items-start space-x-2">
                    <span className="font-black text-slate-900 shrink-0">
                      សំណួរទី {toKhmerNumber(idx + 1)} ({toKhmerNumber(points)} ពិន្ទុ)៖
                    </span>
                    <div className="flex-1 font-medium text-slate-900 whitespace-pre-line">
                      {q.prompt}
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {q.questionType === 'multiple_choice' && q.options && q.options.length > 0 && (
                    <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-normal">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = viewMode === 'teacher_key' && (
                          opt.trim() === q.correctAnswer.trim() || 
                          opt.startsWith(q.correctAnswer.slice(0, 2))
                        );

                        return (
                          <div 
                            key={optIdx} 
                            className={`flex items-center space-x-2 p-1.5 rounded ${
                              isCorrect 
                                ? 'bg-emerald-100 font-bold text-emerald-900 border border-emerald-400' 
                                : ''
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] shrink-0">
                              {isCorrect ? '✓' : ''}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Teacher View: Answer Key & Rubric */}
                  {viewMode === 'teacher_key' && (
                    <div className="ml-6 p-3 rounded-md bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-1">
                      <div>
                        <strong>ចម្លើយត្រឹមត្រូវ៖ </strong>
                        <span className="font-bold underline">{q.correctAnswer}</span>
                      </div>
                      {q.explanation && (
                        <div>
                          <strong>វិធីដោះស្រាយ / ការពន្យល់៖ </strong>
                          {q.explanation}
                        </div>
                      )}
                      {q.rubricGuide && (
                        <div>
                          <strong>បំណែងចែកពិន្ទុ៖ </strong>
                          {q.rubricGuide}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Student View: Ruled Answer Lines or Working Area */}
                  {viewMode === 'student' && showAnswerLines && q.questionType !== 'multiple_choice' && (
                    <div className="ml-6 space-y-3 pt-1">
                      {q.questionType === 'problem_solving' ? (
                        <div className="border border-slate-300 border-dashed rounded p-3 h-28 flex items-start text-xs text-slate-400">
                          <span>ដោះស្រាយចំណោទនៅទីនេះ...</span>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-1">
                          <div className="border-b border-dotted border-slate-400 h-4"></div>
                          <div className="border-b border-dotted border-slate-400 h-4"></div>
                          {(q.questionType === 'dictation_writing' || q.questionType === 'short_answer') && (
                            <>
                              <div className="border-b border-dotted border-slate-400 h-4"></div>
                              <div className="border-b border-dotted border-slate-400 h-4"></div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Exam Paper Footer */}
          <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between items-center text-[11px] text-slate-500">
            <span>វិញ្ញាសា៖ {examPaper.code || 'EXAM-CODE'}</span>
            <span className="font-bold italic">--- សូមជូនពរប្រឡងជាប់ជោគជ័យ ---</span>
            <span>ទំព័រទី ១/១</span>
          </div>
        </div>
      </div>
    </div>
  );
};
