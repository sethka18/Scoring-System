import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { CurriculumProgram, CurriculumLesson } from '../../types';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Calendar,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (program: CurriculumProgram) => void;
}

export const CurriculumUploadModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    language, 
    subjects, 
    activeClass, 
    importCurriculumProgram, 
    addCalendarEvent, 
    showToast 
  } = useGradebook();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub_khmer');
  const [gradeLevel, setGradeLevel] = useState<number>(activeClass?.gradeLevel || 6);
  const [academicYear, setAcademicYear] = useState<string>(activeClass?.academicYear || '2025-2026');
  const [programTitleKm, setProgramTitleKm] = useState<string>('កម្មវិធីសិក្សាភាសាខ្មែរ ថ្នាក់ទី៦');
  const [programTitleEn, setProgramTitleEn] = useState<string>('Grade 6 Khmer Language Curriculum');
  
  const [inputText, setInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedLessons, setParsedLessons] = useState<CurriculumLesson[]>([]);
  const [autoSyncToCalendar, setAutoSyncToCalendar] = useState<boolean>(true);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      parseCurriculumContent(content);
    };

    reader.readAsText(file);
  };

  const parseCurriculumContent = (rawText: string) => {
    try {
      // 1. Check if valid JSON
      const trimmed = rawText.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const parsedJson = JSON.parse(trimmed);
        if (Array.isArray(parsedJson)) {
          setParsedLessons(parsedJson);
          setStep('preview');
          return;
        } else if (parsedJson.lessons && Array.isArray(parsedJson.lessons)) {
          if (parsedJson.titleKm) setProgramTitleKm(parsedJson.titleKm);
          if (parsedJson.titleEn) setProgramTitleEn(parsedJson.titleEn);
          if (parsedJson.gradeLevel) setGradeLevel(parsedJson.gradeLevel);
          if (parsedJson.subjectId) setSelectedSubjectId(parsedJson.subjectId);
          setParsedLessons(parsedJson.lessons);
          setStep('preview');
          return;
        }
      }
    } catch (e) {
      // Fallback to text line parser
    }

    // 2. Fallback: Parse unstructured MoEYS text lines
    // Handles formats like:
    // "សប្តាហ៍ទី ១: មេរៀនទី១ ការបើកបវេសនកាល (១០ ម៉ោង)"
    // "Week 1: Lesson 1 - Intro to Khmer (10 hours)"
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const generatedLessons: CurriculumLesson[] = [];

    let currentWeek = 1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#') || line.startsWith('---') || line.toLowerCase().includes('curriculum')) continue;

      // Extract week if present
      const weekMatch = line.match(/(?:សប្តាហ៍ទី|Week)\s*(\d+)/i);
      const weekNum = weekMatch ? parseInt(weekMatch[1], 10) : currentWeek;

      // Clean title
      let title = line
        .replace(/(?:សប្តាហ៍ទី|Week)\s*\d+[\s:.-]*/i, '')
        .replace(/\(\s*\d+\s*(?:ម៉ោង|hours?)\s*\)/i, '')
        .trim();

      if (!title) title = `មេរៀនប្រចាំសប្តាហ៍ទី ${weekNum}`;

      // Chapter if present
      const chapterMatch = title.match(/(?:មេរៀនទី|ជំពូកទី|Chapter|Lesson)\s*(\d+)/i);
      const chapterKm = chapterMatch ? `មេរៀនទី ${chapterMatch[1]}` : `សប្តាហ៍ទី ${weekNum}`;

      generatedLessons.push({
        id: `custom_lesson_${Date.now()}_${i}`,
        weekNumber: weekNum,
        subjectId: selectedSubjectId,
        lessonNumber: i + 1,
        chapterKm,
        lessonTitleKm: title,
        lessonTitleEn: `Week ${weekNum}: ${title}`,
        objectivesKm: `អនុវត្តតាមគោលបំណងកម្មវិធីសិក្សាជាតិក្រសួងអប់រំ សប្តាហ៍ទី ${weekNum}។`,
        objectivesEn: `National curriculum standard objectives for week ${weekNum}.`,
        hoursCount: selectedSubjectId === 'sub_khmer' ? 10 : selectedSubjectId === 'sub_math' ? 7 : 4,
        semester: weekNum <= 18 ? 1 : 2,
        status: weekNum <= 4 ? 'completed' : weekNum <= 6 ? 'in_progress' : 'upcoming',
      });

      currentWeek = weekNum + 1;
    }

    if (generatedLessons.length === 0) {
      showToast(
        language === 'km' 
          ? 'សូមបញ្ចូលអត្ថបទ ឬឯកសារកម្មវិធីសិក្សា' 
          : 'Please enter curriculum content', 
        'warning'
      );
      return;
    }

    setParsedLessons(generatedLessons);
    setStep('preview');
  };

  const handleApplyCurriculum = () => {
    if (parsedLessons.length === 0) return;

    const program: CurriculumProgram = {
      id: `prog_${Date.now()}`,
      gradeLevel,
      academicYear,
      subjectId: selectedSubjectId,
      titleKm: programTitleKm,
      titleEn: programTitleEn,
      lessons: parsedLessons,
    };

    importCurriculumProgram(program);

    // Auto-create calendar events for each lesson if enabled
    if (autoSyncToCalendar) {
      let syncCount = 0;
      parsedLessons.forEach((les, idx) => {
        // Approximate starting date for 36 weeks starting from Dec 1, 2025
        const baseDate = new Date(2025, 11, 1); // Dec 1, 2025
        const lessonDate = new Date(baseDate.getTime() + (les.weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
        const isoDate = lessonDate.toISOString().split('T')[0];

        addCalendarEvent({
          id: `curric_auto_${Date.now()}_${idx}`,
          titleKm: `[${les.chapterKm || `សប្តាហ៍ ${les.weekNumber}`}] ${les.lessonTitleKm}`,
          titleEn: `[W${les.weekNumber}] ${les.lessonTitleEn}`,
          date: isoDate,
          type: 'curriculum',
          color: '#0284c7',
          descriptionKm: `${les.objectivesKm || ''} (${les.hoursCount} ម៉ោង/សប្តាហ៍)`,
          descriptionEn: `${les.objectivesEn || ''} (${les.hoursCount} hrs/week)`,
          isMoEYSOfficial: true,
        });
        syncCount++;
      });
      showToast(
        language === 'km' 
          ? `បានបញ្ចូលកម្មវិធីសិក្សា និងបង្កើតព្រឹត្តិការណ៍ប្រតិទិនចំនួន ${syncCount} ដោយស្វ័យប្រវត្តិ!` 
          : `Curriculum imported and created ${syncCount} calendar events!`
      );
    } else {
      showToast(
        language === 'km' 
          ? 'បានបញ្ចូលកម្មវិធីសិក្សាថ្មីជោគជ័យ' 
          : 'Curriculum program successfully imported'
      );
    }

    if (onSuccess) onSuccess(program);
    onClose();
  };

  const loadSampleCurriculumTemplate = () => {
    const sampleText = `សប្តាហ៍ទី ១: មេរៀនទី១ ការបើកបវេសនកាល និងសារៈសំខាន់នៃការសិក្សា (១០ ម៉ោង)
សប្តាហ៍ទី ២: មេរៀនទី២ មិត្តភាព និងការយោគយល់គ្នាក្នុងថ្នាក់រៀន (១០ ម៉ោង)
សប្តាហ៍ទី ៣: មេរៀនទី៣ ភូមិឋានខ្មែរ និងប្រពៃណីរស់នៅ (១០ ម៉ោង)
សប្តាហ៍ទី ៤: មេរៀនទី៤ ការវាយតម្លៃ និងរំលឹកមេរៀនប្រចាំខែធ្នូ (១០ ម៉ោង)
សប្តាហ៍ទី ៥: មេរៀនទី៥ បរិស្ថានស្អាត សុខភាពល្អក្នុងសាលារៀន (១០ ម៉ោង)
សប្តាហ៍ទី ៦: មេរៀនទី៦ ប្រាសាទអង្គរវត្ត និងកេរដំណែលដូនតា (១០ ម៉ោង)
សប្តាហ៍ទី ៧: មេរៀនទី៧ ទំនៀមទម្លាប់ និងពិធីបុណ្យជាតិខ្មែរ (១០ ម៉ោង)
សប្តាហ៍ទី ៨: មេរៀនទី៨ ការវាយតម្លៃប្រចាំខែមករា (១០ ម៉ោង)
សប្តាហ៍ទី ៩: មេរៀនទី៩ សិទ្ធិកុមារ និងកាតព្វកិច្ចក្នុងគ្រួសារ (១០ ម៉ោង)
សប្តាហ៍ទី ១០: មេរៀនទី១០ ការសន្សំសំចៃ និងការប្រើប្រាស់ប្រាក់រៀល (១០ ម៉ោង)
សប្តាហ៍ទី ១១: មេរៀនទី១១ ធនធានធម្មជាតិ និងទន្លេមេគង្គ (១០ ម៉ោង)
សប្តាហ៍ទី ១២: មេរៀនទី១២ ការវាយតម្លៃប្រចាំខែកុម្ភៈ (១០ ម៉ោង)
សប្តាហ៍ទី ១៣: មេរៀនទី១៣ សុវត្ថិភាពចរាចរណ៍ផ្លូវគោក (១០ ម៉ោង)
សប្តាហ៍ទី ១៤: មេរៀនទី១៤ របាំប្រពៃណី និងសិល្បៈល្ខោនខោល (១០ ម៉ោង)
សប្តាហ៍ទី ១៥: មេរៀនទី១៥ ការរំលឹកមេរៀនទូទៅមុនប្រឡងឆមាសទី១ (១០ ម៉ោង)
សប្តាហ៍ទី ១៦: សប្តាហ៍ប្រឡងឆមាសទី១ (Semester 1 Examination) (១០ ម៉ោង)
សប្តាហ៍ទី ១៧: វិស្សមកាលតូច បុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (Mid-Year Break)
សប្តាហ៍ទី ១៨: មេរៀនទី១៦ បច្ចេកវិទ្យា និងការទំនាក់ទំនងសម័យថ្មី (១០ ម៉ោង)`;

    setInputText(sampleText);
    parseCurriculumContent(sampleText);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg">
                {language === 'km' ? 'បញ្ចូល ឬបង្កើតកម្មវិធីសិក្សាថ្មី (Curriculum)' : 'Upload & Recreate School Curriculum'}
              </h2>
              <p className="text-xs text-slate-300">
                {language === 'km' 
                  ? 'នាំចូលកម្មវិធីសិក្សា និងបង្កើតព្រឹត្តិការណ៍ប្រតិទិនដោយស្វ័យប្រវត្តិ' 
                  : 'Import lesson plans and auto-generate school calendar events'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {language === 'km' ? 'កម្រិតថ្នាក់' : 'Grade Level'}
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>
                    {language === 'km' ? `ថ្នាក់ទី ${g} (Grade ${g})` : `Grade ${g}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {language === 'km' ? 'មុខវិជ្ជា' : 'Subject'}
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {language === 'km' ? s.nameKm : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {language === 'km' ? 'ឆ្នាំសិក្សា' : 'Academic Year'}
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {step === 'input' ? (
            <div className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/60 rounded-2xl p-6 text-center transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".txt,.json,.csv,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-slate-800">
                    {fileName ? fileName : (language === 'km' ? 'ចុច ឬអូសទម្លាក់ឯកសារកម្មវិធីសិក្សា (TXT, JSON, CSV)' : 'Click or drag & drop curriculum file')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'km' 
                      ? 'គាំទ្រឯកសារតារាងមេរៀន សប្តាហ៍ទី១ ដល់ ទី៣៦' 
                      : 'Supports structured 36-week MoEYS curriculum files'}
                  </p>
                </div>
              </div>

              {/* Or Paste Raw Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">
                    {language === 'km' ? 'ឬចម្លង និងបិទភ្ជាប់អត្ថបទកម្មវិធីសិក្សា (Paste Text)' : 'Or Paste Curriculum Text'}
                  </label>
                  <button
                    type="button"
                    onClick={loadSampleCurriculumTemplate}
                    className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'ផ្ទុកគំរូកម្មវិធីសិក្សា MoEYS' : 'Load MoEYS Sample'}</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={language === 'km' 
                    ? 'ឧទាហរណ៍៖\nសប្តាហ៍ទី ១: មេរៀនទី១ ការបើកបវេសនកាល\nសប្តាហ៍ទី ២: មេរៀនទី២ មិត្តភាព និងការយោគយល់គ្នា...' 
                    : 'Example:\nWeek 1: Lesson 1 - School Opening\nWeek 2: Lesson 2 - Friendship...'}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-2xl p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!inputText.trim()}
                  onClick={() => parseCurriculumContent(inputText)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>{language === 'km' ? 'វិភាគ និងមើលលទ្ធផល (Parse)' : 'Parse & Preview'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Header */}
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-indigo-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">
                      {language === 'km' 
                        ? `បានវិភាគឃើញ ${parsedLessons.length} មេរៀនដោយជោគជ័យ` 
                        : `Successfully parsed ${parsedLessons.length} lesson units`}
                    </p>
                    <p className="text-[11px] text-indigo-800">
                      {language === 'km' ? 'ពិនិត្យបញ្ជីមេរៀនមុននឹងបញ្ចូលទៅក្នុងប្រព័ន្ធ' : 'Review lesson plan units before saving'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 cursor-pointer"
                >
                  {language === 'km' ? 'កែប្រែអត្ថបទ' : 'Edit Input'}
                </button>
              </div>

              {/* Parsed Lessons List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                {parsedLessons.map((les, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-900 font-extrabold flex items-center justify-center text-xs">
                        W{les.weekNumber}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{les.lessonTitleKm}</p>
                        <p className="text-[11px] text-slate-500">{les.chapterKm} • {les.hoursCount} ម៉ោង • ឆមាស {les.semester}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {les.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Auto Sync Toggle */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      {language === 'km' ? 'បង្កើតព្រឹត្តិការណ៍ប្រតិទិនសាលាស្វ័យប្រវត្តិ' : 'Auto-Generate School Calendar Events'}
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      {language === 'km' 
                        ? 'បញ្ចូលមេរៀននីមួយៗទៅក្នុងប្រតិទិនសិក្សាប្រចាំខែដោយផ្ទាល់' 
                        : 'Populate each week onto the official academic calendar'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSyncToCalendar}
                  onChange={(e) => setAutoSyncToCalendar(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            {language === 'km' ? 'បោះបង់' : 'Cancel'}
          </button>

          {step === 'preview' && (
            <button
              type="button"
              onClick={handleApplyCurriculum}
              className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-xs shadow-md transition inline-flex items-center space-x-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{language === 'km' ? 'អនុវត្ត & បង្កើតប្រតិទិន (Confirm & Apply)' : 'Apply to Calendar & Schedule'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
