import React, { useState, useEffect } from 'react';
import { ExamPaper, ExamPaperItem, Subject, Language } from '../../types';
import { 
  X, 
  Save, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Award, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface ExamPaperEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  examPaper: ExamPaper | null;
  subjects: Subject[];
  language: Language;
  onSave: (id: string, updates: Partial<ExamPaper>) => void;
}

export const ExamPaperEditorModal: React.FC<ExamPaperEditorModalProps> = ({
  isOpen,
  onClose,
  examPaper,
  subjects,
  language,
  onSave
}) => {
  const [title, setTitle] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [totalMaxScore, setTotalMaxScore] = useState<number>(10);
  const [schoolName, setSchoolName] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [items, setItems] = useState<ExamPaperItem[]>([]);

  useEffect(() => {
    if (examPaper) {
      setTitle(examPaper.title);
      setDurationMinutes(examPaper.durationMinutes || 60);
      setTotalMaxScore(examPaper.totalMaxScore || 10);
      setSchoolName(examPaper.schoolName || '');
      setInstructions(examPaper.instructions || '');
      setItems([...examPaper.items]);
    }
  }, [examPaper, isOpen]);

  if (!isOpen || !examPaper) return null;

  // Calculate live sum
  const currentTotal = items.reduce((sum, it) => sum + (it.customPoints || it.questionSnapshot.points || 1), 0);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    // update order
    newItems.forEach((it, idx) => { it.order = idx + 1; });
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    // update order
    newItems.forEach((it, idx) => { it.order = idx + 1; });
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert(language === 'km' ? 'វិញ្ញាសាត្រូវមានយ៉ាងហោចណាស់សំណួរមួយ!' : 'Exam must have at least one question!');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    newItems.forEach((it, idx) => { it.order = idx + 1; });
    setItems(newItems);
  };

  const handlePointChange = (index: number, points: number) => {
    const newItems = [...items];
    newItems[index].customPoints = Math.max(0.5, points);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(language === 'km' ? 'សូមបញ្ចូលចំណងជើងវិញ្ញាសា!' : 'Please enter exam title!');
      return;
    }

    onSave(examPaper.id, {
      title: title.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      totalMaxScore: Number(totalMaxScore) || currentTotal,
      schoolName: schoolName.trim() || undefined,
      instructions: instructions.trim() || undefined,
      items
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                {language === 'km' ? 'កែសម្រួលវិញ្ញាសា និងបែងចែកពិន្ទុ' : 'Edit Exam Paper'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {examPaper.code} • {language === 'km' ? `ថ្នាក់ទី ${examPaper.grade}` : `Grade ${examPaper.grade}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ចំណងជើងវិញ្ញាសា' : 'Exam Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'រយៈពេល (នាទី)' : 'Duration (mins)'}
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 60)}
                className="w-full px-3 py-2 text-xs font-black text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* School Name & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឈ្មោះសាលា' : 'School Name'}
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ការណែនាំសិស្ស' : 'Instructions'}
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Score Summary Box */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'km' ? 'ផលបូកពិន្ទុបច្ចុប្បន្ន៖ ' : 'Current Points Sum: '}
                <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-black">{currentTotal}</strong> / {totalMaxScore}
              </span>
            </div>

            {currentTotal !== totalMaxScore && (
              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                {language === 'km' 
                  ? `(ខុសគ្នា ${Math.abs(totalMaxScore - currentTotal)} ពិន្ទុពីគោលដៅ)`
                  : `(Differs by ${Math.abs(totalMaxScore - currentTotal)} pts)`}
              </span>
            )}
          </div>

          {/* Questions Reordering & Point Customization List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {language === 'km' ? 'បញ្ជីសំណួរក្នុងវិញ្ញាសា (អាចរៀបលំដាប់ និងកែពិន្ទុ)' : 'Exam Questions (Reorder & Adjust Points)'}
            </label>

            <div className="space-y-2.5">
              {items.map((it, idx) => {
                const q = it.questionSnapshot;
                return (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    {/* Index & Order Buttons */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col space-y-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Question summary text */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {q.prompt}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{q.chapterOrTopic}</span>
                        <span>•</span>
                        <span>{q.questionType}</span>
                      </div>
                    </div>

                    {/* Points input */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[11px] text-slate-500 font-bold">{language === 'km' ? 'ពិន្ទុ៖' : 'Pts:'}</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="20"
                        value={it.customPoints || q.points || 1}
                        onChange={(e) => handlePointChange(idx, parseFloat(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-xs font-black text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                      title={language === 'km' ? 'ដកចេញពីវិញ្ញាសា' : 'Remove'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
