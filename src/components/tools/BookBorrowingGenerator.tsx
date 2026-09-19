import React, { useState, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { FileText, Sparkles, RotateCcw, Smartphone, Tablet } from 'lucide-react';

interface SubjectBorrowConfig {
  id: string;
  name: string;
  shortName?: string;
  color: string;
}

const SUBJECTS_CONFIG: SubjectBorrowConfig[] = [
  { id: 'khmer', name: 'ភាសាខ្មែរ', shortName: 'ខ្មែរ', color: 'text-rose-700' },
  { id: 'math', name: 'គណិតវិទ្យា', shortName: 'គណិត', color: 'text-indigo-900' },
  { id: 'science', name: 'វិទ្យាសាស្ត្រ', shortName: 'វិទ្យា', color: 'text-sky-700' },
  { id: 'social', name: 'សិក្សាសង្គម', shortName: 'សង្គម', color: 'text-amber-700' },
  { id: 'foreign', name: 'ភាសាបរទេស', shortName: 'អង់គ្លេស', color: 'text-emerald-700' }
];

export const BookBorrowingGenerator: React.FC = () => {
  const { language, activeClass, schoolProfile, classStudents, showToast } = useGradebook();
  const [includeData, setIncludeData] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  // Choose default row count: 35 to guarantee fitting in 1 A4 page
  const [maxRows, setMaxRows] = useState<number>(() => {
    const studentCount = classStudents?.length || 0;
    if (studentCount > 35) return 40;
    if (studentCount > 30) return 35;
    return 35;
  });

  const [borrowData, setBorrowData] = useState<Record<string, Record<string, boolean>>>({});

  // Local storage persistence per class
  const storageKey = `book_borrowing_${activeClass?.id || 'default'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setBorrowData(JSON.parse(saved));
      } else {
        setBorrowData({});
      }
    } catch (e) {
      console.error('Failed to load borrow data', e);
    }
  }, [activeClass?.id, storageKey]);

  const saveBorrowData = (newData: Record<string, Record<string, boolean>>) => {
    setBorrowData(newData);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save borrow data', e);
    }
  };

  // Date controls like ClassroomInventory
  const [signDate, setSignDate] = useState({
    day: new Date().getDate().toString(),
    month: (new Date().getMonth() + 1).toString(),
    yearAd: new Date().getFullYear().toString(),
    location: schoolProfile?.district ? `ស្រុក${schoolProfile.district}` : 'ប្រទង'
  });

  const handleDateChange = (field: keyof typeof signDate, value: string) => {
    setSignDate(prev => ({ ...prev, [field]: value }));
  };

  // Generate rows capped to maxRows so it ALWAYS fits in 1 single A4 sheet
  const rows = (() => {
    const result = [];
    const validStudents = (includeData && classStudents && classStudents.length > 0) ? classStudents : [];
    
    for (let i = 0; i < maxRows; i++) {
      if (i < validStudents.length) {
        result.push(validStudents[i]);
      } else {
        result.push({
          id: `blank-${i}`,
          name: '',
          gender: '',
          studentId: ''
        } as any);
      }
    }
    return result;
  })();

  const toggleBorrow = (studentId: string, colKey: string) => {
    if (!studentId) return;
    const currentVal = borrowData[studentId]?.[colKey] || false;
    const updated = {
      ...borrowData,
      [studentId]: {
        ...(borrowData[studentId] || {}),
        [colKey]: !currentVal
      }
    };
    saveBorrowData(updated);
  };

  // Quick fill all for a column
  const toggleColumnAll = (colKey: string) => {
    const activeStudentIds = rows.filter(s => !s.id.startsWith('blank')).map(s => s.id);
    if (activeStudentIds.length === 0) return;

    const allChecked = activeStudentIds.every(id => borrowData[id]?.[colKey]);
    const updated = { ...borrowData };

    activeStudentIds.forEach(id => {
      if (!updated[id]) updated[id] = {};
      updated[id][colKey] = !allChecked;
    });

    saveBorrowData(updated);
    if (showToast) {
      showToast(allChecked ? 'បានដោះការជ្រើសរើសទាំងអស់' : 'បានជ្រើសរើសទាំងអស់សម្រាប់ជួរឈរនេះ', 'info');
    }
  };

  // Quick fill all new books
  const checkAllNewBooks = () => {
    const activeStudentIds = rows.filter(s => !s.id.startsWith('blank')).map(s => s.id);
    if (activeStudentIds.length === 0) return;

    const updated = { ...borrowData };
    activeStudentIds.forEach(id => {
      if (!updated[id]) updated[id] = {};
      SUBJECTS_CONFIG.forEach(subj => {
        updated[id][`${subj.id}_new`] = true;
      });
    });

    saveBorrowData(updated);
    if (showToast) showToast('បានជ្រើសរើសសៀវភៅថ្មីគ្រប់មុខវិជ្ជាជូនសិស្សទាំងអស់', 'success');
  };

  // Reset all
  const resetBorrowData = () => {
    if (window.confirm('តើអ្នកពិតជាចង់សម្អាតទិន្នន័យខ្ចីសៀវភៅទាំងអស់មែនទេ?')) {
      saveBorrowData({});
      if (showToast) showToast('បានសម្អាតទិន្នន័យរួចរាល់', 'info');
    }
  };

  const getTotal = (colKey: string) => {
    let total = 0;
    Object.values(borrowData).forEach(studentData => {
      if (studentData[colKey]) total++;
    });
    return total;
  };

  const isPortrait = orientation === 'portrait';

  // Format teacher name cleanly without prefixes like 'លោកគ្រូ' or 'អ្នកគ្រូ'
  const cleanTeacherName = (activeClass?.teacherNameKm || '')
    .replace(/^(លោកគ្រូ|អ្នកគ្រូ)\s*/, '')
    .trim() || 'គ្រូបង្រៀន';

  // Format class name cleanly to prevent duplicate "ថ្នាក់ទី"
  const rawClassName = activeClass?.nameKm || '៦ក';
  const cleanClassName = rawClassName.startsWith('ថ្នាក់ទី')
    ? rawClassName
    : `ថ្នាក់ទី ${rawClassName}`;

  return (
    <div className="space-y-6">
      {/* Top Toolbar / Configuration Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>{language === 'km' ? 'បញ្ជីខ្ចីសៀវភៅ (ទម្រង់ A4 មួយសន្លឹក)' : 'Book Borrowing List (Single A4 Page)'}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                  {isPortrait ? 'A4 បញ្ឈរ (Portrait)' : 'A4 ផ្ដេក (Landscape)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'km' 
                  ? 'ឯកសារមួយសន្លឹក A4 ស្អាតបាត អាចចុចជ្រើសរើសសៀវភៅ និងបូកសរុបស្វ័យប្រវត្តិ' 
                  : 'Single sheet A4 format. Click cells to tick, auto-sum totals.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <PrintToPdfButton
              targetId="borrowing-print-area"
              fileName={`Book_Borrowing_${activeClass?.nameKm || 'Class'}_${orientation}`}
              documentTitle={`បញ្ជីខ្ចីសៀវភៅ_${activeClass?.nameKm || 'ថ្នាក់'}`}
              pageSize="a4"
              orientation={orientation}
              variant="primary"
              className="text-xs py-2 px-3.5 shadow-sm"
              showPrintOption={true}
            />
          </div>
        </div>

        {/* Options & Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Toggles */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Orientation Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1.5 font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  orientation === 'portrait'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone size={13} className="rotate-0" />
                <span>{language === 'km' ? 'A4 បញ្ឈរ (Portrait)' : 'Portrait'}</span>
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1.5 font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  orientation === 'landscape'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Tablet size={13} className="rotate-90" />
                <span>{language === 'km' ? 'A4 ផ្ដេក (Landscape)' : 'Landscape'}</span>
              </button>
            </div>

            {/* Student Names Option */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIncludeData(true)}
                className={`px-3 py-1.5 font-medium rounded-md transition-all ${
                  includeData 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'បញ្ចូលឈ្មោះសិស្ស' : 'With Names'}
              </button>
              <button
                onClick={() => setIncludeData(false)}
                className={`px-3 py-1.5 font-medium rounded-md transition-all ${
                  !includeData 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ទុកទទេ (បំពេញដៃ)' : 'Blank Grid'}
              </button>
            </div>

            {/* Row Count Option */}
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{language === 'km' ? 'ចំនួនជួរ:' : 'Rows:'}</span>
              <select
                value={maxRows}
                onChange={(e) => setMaxRows(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value={30}>30 ជួរ</option>
                <option value={35}>35 ជួរ (ស្តង់ដារ A4)</option>
                <option value={40}>40 ជួរ</option>
              </select>
            </div>
          </div>

          {/* Right: Quick Batch Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={checkAllNewBooks}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium transition cursor-pointer border border-indigo-200 dark:border-indigo-800"
              title="គូសសៀវភៅថ្មីទាំងអស់គ្រប់មុខវិជ្ជា"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>{language === 'km' ? 'គូសសៀវភៅថ្មីទាំងអស់' : 'Check All New'}</span>
            </button>
            <button
              onClick={resetBorrowData}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-medium transition cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-rose-200"
              title="សម្អាតការ Tick ទាំងអស់"
            >
              <RotateCcw size={13} />
              <span>{language === 'km' ? 'សម្អាត' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Single Sheet A4 Print Area */}
      <div className="overflow-auto bg-slate-100 dark:bg-slate-950 p-3 sm:p-6 rounded-2xl flex justify-center border border-slate-200 dark:border-slate-800">
        <div 
          id="borrowing-print-area" 
          className={`bg-white text-slate-900 px-6 py-5 relative shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 ${
            isPortrait 
              ? 'w-[760px] max-w-[760px]' 
              : 'w-[1020px] max-w-[1020px]'
          }`}
        >
          {/* Print CSS Rules: Enforce STRICT 1-Page A4 */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { 
                size: A4 ${orientation}; 
                margin: 0.4cm !important; 
              }
              html, body { 
                margin: 0 !important; 
                padding: 0 !important; 
                height: 100% !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              #borrowing-print-area { 
                width: 100% !important; 
                max-width: 100% !important; 
                margin: 0 auto !important; 
                padding: 0 !important; 
                border: none !important;
                box-shadow: none !important;
                page-break-after: avoid !important;
                break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              table, tr, td, th {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .no-print { 
                display: none !important; 
              }
            }
          `}} />

          {/* Header - Ministry & Kingdom */}
          {isPortrait ? (
            <div>
              {/* National Motto Centered */}
              <div className="text-center space-y-0.5 mb-2">
                <p className="font-moul text-sm text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-sm text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="w-24 h-0.5 bg-slate-900 mx-auto mt-1 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mx-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                </div>
              </div>

              {/* Office & School Name */}
              <div className="flex justify-between items-start mb-2 text-xs text-slate-900 font-bold leading-tight">
                <div className="space-y-0.5">
                  <p>ការិយាល័យអប់រំ យុវជន និងកីឡា នៃរដ្ឋបាល{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                  <p>{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សា ហ៊ុនណេង ប្រទង'}</p>
                </div>
              </div>

              {/* Title Centered */}
              <div className="text-center mb-3">
                <h1 className="font-moul text-lg text-slate-900 mb-0.5">
                  បញ្ជីរាយនាមសិស្សខ្ចីសៀវភៅពុម្ព
                </h1>
                <p className="font-bold text-xs text-slate-800">
                  {cleanClassName} ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៦-២០២៧'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-1 text-slate-900 leading-tight">
                <div className="space-y-0.5 font-bold text-[11px]">
                  <p>ការិយាល័យអប់រំ យុវជន និងកីឡា នៃរដ្ឋបាល{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                  <p>{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សា ហ៊ុនណេង ប្រទង'}</p>
                </div>
                
                <div className="text-center space-y-0.5">
                  <p className="font-moul text-xs">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p className="font-moul text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <div className="w-20 h-0.5 bg-slate-900 mx-auto mt-0.5"></div>
                </div>
              </div>

              <div className="text-center mb-1.5">
                <h1 className="font-moul text-base text-slate-900 mb-0.5 tracking-wide">
                  បញ្ជីរាយនាមសិស្សខ្ចីសៀវភៅ {cleanClassName}
                </h1>
                <p className="font-bold text-xs text-slate-800">
                  សម្រាប់ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៦-២០២៧'}
                </p>
              </div>
            </div>
          )}
          
          {/* The Borrowing Table */}
          <div className="w-full">
            <table 
              className={`w-full border-collapse border border-slate-900 text-slate-900 ${
                isPortrait ? 'text-[9.5px]' : 'text-[10px]'
              }`} 
              style={{ tableLayout: 'fixed' }}
            >
              <thead>
                <tr className="bg-slate-100 print:bg-slate-100">
                  <th rowSpan={2} className="border border-slate-900 w-7 py-0.5 text-center font-bold">ល.រ</th>
                  <th 
                    rowSpan={2} 
                    className="border border-slate-900 py-0.5 text-left px-1.5 font-bold" 
                    style={{ width: isPortrait ? '21%' : '17%' }}
                  >
                    គោត្តនាម-នាម
                  </th>
                  {SUBJECTS_CONFIG.map(subj => (
                    <th 
                      key={subj.id} 
                      colSpan={2} 
                      className={`border border-slate-900 py-0.5 text-center font-bold ${subj.color}`}
                    >
                      {isPortrait ? (subj.shortName || subj.name) : subj.name}
                    </th>
                  ))}
                  <th 
                    rowSpan={2} 
                    className="border border-slate-900 py-0.5 text-center font-bold"
                    style={{ width: isPortrait ? '9%' : '7%' }}
                  >
                    ផ្សេងៗ
                  </th>
                </tr>
                <tr className="bg-slate-50 print:bg-slate-50 text-[9px]">
                  {SUBJECTS_CONFIG.map(subj => (
                    <React.Fragment key={`sub-${subj.id}`}>
                      <th 
                        onClick={() => toggleColumnAll(`${subj.id}_old`)}
                        title="ចុចត្រង់នេះដើម្បី Tick ទាំងអស់ ឬដោះទាំងអស់"
                        className="border border-slate-900 py-0.5 text-center font-bold cursor-pointer hover:bg-slate-200 transition"
                        style={{ width: isPortrait ? '6.5%' : '7%' }}
                      >
                        ចាស់
                      </th>
                      <th 
                        onClick={() => toggleColumnAll(`${subj.id}_new`)}
                        title="ចុចត្រង់នេះដើម្បី Tick ទាំងអស់ ឬដោះទាំងអស់"
                        className="border border-slate-900 py-0.5 text-center font-bold cursor-pointer hover:bg-slate-200 transition"
                        style={{ width: isPortrait ? '6.5%' : '7%' }}
                      >
                        ថ្មី
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((student: any, index: number) => {
                  const isBlank = student.id.startsWith('blank');
                  // Calculate row height to fit comfortably on 1 sheet
                  const rowHeightClass = isPortrait
                    ? (maxRows > 35 ? 'h-[16px]' : maxRows > 30 ? 'h-[18px]' : 'h-[20px]')
                    : (maxRows > 35 ? 'h-[13px]' : maxRows > 30 ? 'h-[14px]' : 'h-[16px]');
                  
                  return (
                    <tr key={student.id} className={`text-center ${rowHeightClass} hover:bg-indigo-50/25 transition-colors`}>
                      <td className="border border-slate-900 text-center font-semibold text-[9px]">
                        {isBlank ? '' : index + 1}
                      </td>
                      <td className="border border-slate-900 text-left px-1 font-moul text-[9px] truncate">
                        {student.name}
                      </td>
                      
                      {SUBJECTS_CONFIG.map(subj => (
                        <React.Fragment key={`${student.id}-${subj.id}`}>
                          {/* Old Book Column */}
                          <td 
                            className="border border-slate-900 cursor-pointer hover:bg-slate-200 print:hover:bg-transparent transition-colors text-center p-0 select-none"
                            onClick={() => !isBlank && toggleBorrow(student.id, `${subj.id}_old`)}
                          >
                            {!isBlank && borrowData[student.id]?.[ `${subj.id}_old` ] ? (
                              <span className="text-slate-950 font-black text-[10px] leading-none block">✓</span>
                            ) : null}
                          </td>

                          {/* New Book Column */}
                          <td 
                            className="border border-slate-900 cursor-pointer hover:bg-slate-200 print:hover:bg-transparent transition-colors text-center p-0 select-none"
                            onClick={() => !isBlank && toggleBorrow(student.id, `${subj.id}_new`)}
                          >
                            {!isBlank && borrowData[student.id]?.[ `${subj.id}_new` ] ? (
                              <span className="text-slate-950 font-black text-[10px] leading-none block">✓</span>
                            ) : null}
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="border border-slate-900"></td>
                    </tr>
                  );
                })}
                
                {/* Total Row */}
                <tr className={`text-center font-bold bg-slate-100 print:bg-slate-100 ${isPortrait ? 'h-[20px]' : 'h-[17px]'}`}>
                  <td colSpan={2} className="border border-slate-900 text-left px-1.5 font-moul text-[9.5px]">
                    សរុបរួម
                  </td>
                  {SUBJECTS_CONFIG.map(subj => (
                    <React.Fragment key={`total-${subj.id}`}>
                      <td className="border border-slate-900 text-[9px] font-bold">
                        {getTotal(`${subj.id}_old`) || ''}
                      </td>
                      <td className="border border-slate-900 text-[9px] font-bold">
                        {getTotal(`${subj.id}_new`) || ''}
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="border border-slate-900"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer: Summary & Signatures */}
          {isPortrait ? (
            <div className="mt-3 text-slate-900">
              {/* Subject Counts Summary */}
              <div className="border border-slate-400 p-2 rounded-lg bg-slate-50/70 print:bg-transparent mb-3 text-[10px]">
                <p className="font-moul text-[10.5px] text-slate-900 mb-1">
                  សរុបចំនួនសៀវភៅពុម្ពបានខ្ចីតាមមុខវិជ្ជា៖
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {SUBJECTS_CONFIG.map(subj => (
                    <div key={`summary-${subj.id}`} className="flex items-center">
                      <span className="w-20 inline-block text-slate-800 font-bold">{subj.name}:</span>
                      <span className="text-slate-900">
                        ថ្មី <strong className="inline-block w-6 text-center border-b border-dashed border-slate-700">{getTotal(`${subj.id}_new`)}</strong> ក្បាល, 
                        ចាស់ <strong className="inline-block w-6 text-center border-b border-dashed border-slate-700">{getTotal(`${subj.id}_old`)}</strong> ក្បាល
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures 2-Column: Principal on Left, Teacher on Right (Like ClassroomInventory) */}
              <div className="flex justify-between items-start text-xs font-bold text-slate-900 mt-4 px-2">
                {/* Principal Approval */}
                <div className="text-center space-y-1 mt-4">
                  <p>បានឃើញ និងឯកភាព</p>
                  <p className="font-moul text-xs">នាយកសាលា</p>
                  <div className="h-12"></div>
                </div>

                {/* Class Teacher */}
                <div className="text-center space-y-1">
                  <div className="text-[11px] font-normal flex items-center justify-center gap-0.5">
                    <input
                      type="text"
                      value={signDate.location}
                      onChange={(e) => handleDateChange('location', e.target.value)}
                      className="w-16 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                      placeholder="ទីកន្លែង"
                    />
                    <span>, ថ្ងៃទី</span>
                    <input
                      type="text"
                      value={signDate.day}
                      onChange={(e) => handleDateChange('day', e.target.value)}
                      className="w-7 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                      placeholder="....."
                    />
                    <span>ខែ</span>
                    <input
                      type="text"
                      value={signDate.month}
                      onChange={(e) => handleDateChange('month', e.target.value)}
                      className="w-7 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                      placeholder="....."
                    />
                    <span>ឆ្នាំ</span>
                    <input
                      type="text"
                      value={signDate.yearAd}
                      onChange={(e) => handleDateChange('yearAd', e.target.value)}
                      className="w-11 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                      placeholder="២០២៦"
                    />
                  </div>
                  <p className="font-moul text-xs pt-1">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-xs">{cleanTeacherName}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start text-[10.5px] font-bold text-slate-900 mt-2 pt-0.5 leading-tight">
              <div className="text-left space-y-0.5">
                <p className="font-moul text-[10px] text-slate-800 mb-0.5">សរុបសៀវភៅបានខ្ចីតាមមុខវិជ្ជា៖</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {SUBJECTS_CONFIG.map(subj => (
                    <div key={`summary-${subj.id}`} className="flex items-center text-[10px]">
                      <span className="w-20 inline-block text-slate-800">{subj.name}:</span>
                      <span className="text-slate-900">
                        ថ្មី <strong className="inline-block w-6 text-center border-b border-dashed border-slate-600">{getTotal(`${subj.id}_new`)}</strong> ក្បាល, 
                        ចាស់ <strong className="inline-block w-6 text-center border-b border-dashed border-slate-600">{getTotal(`${subj.id}_old`)}</strong> ក្បាល
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center space-y-1 min-w-[200px]">
                <div className="text-[10px] font-normal flex items-center justify-center gap-0.5">
                  <input
                    type="text"
                    value={signDate.location}
                    onChange={(e) => handleDateChange('location', e.target.value)}
                    className="w-16 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                    placeholder="ទីកន្លែង"
                  />
                  <span>, ថ្ងៃទី</span>
                  <input
                    type="text"
                    value={signDate.day}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    className="w-7 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                    placeholder="....."
                  />
                  <span>ខែ</span>
                  <input
                    type="text"
                    value={signDate.month}
                    onChange={(e) => handleDateChange('month', e.target.value)}
                    className="w-7 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                    placeholder="....."
                  />
                  <span>ឆ្នាំ</span>
                  <input
                    type="text"
                    value={signDate.yearAd}
                    onChange={(e) => handleDateChange('yearAd', e.target.value)}
                    className="w-10 border-b border-dashed border-slate-400 bg-transparent text-center outline-none print:border-none focus:bg-amber-50"
                    placeholder="២០២៦"
                  />
                </div>
                <p className="font-moul text-xs pt-1">គ្រូបន្ទុកថ្នាក់</p>
                <div className="h-9"></div>
                <p className="font-bold text-xs">{cleanTeacherName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
