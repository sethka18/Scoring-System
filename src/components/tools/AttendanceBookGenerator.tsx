import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { Book, Settings2, Sparkles, LayoutTemplate, Palette, CheckSquare, Square, CalendarDays } from 'lucide-react';

const KHMER_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const KHMER_DAYS = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស'];

export const AttendanceBookGenerator: React.FC = () => {
  const { language, activeClass, schoolProfile, classStudents } = useGradebook();
  const [includeData, setIncludeData] = useState(true);
  const [coverTheme, setCoverTheme] = useState<'standard' | 'modern' | 'cute'>('standard');
  
  // Calendar Settings
  const [startMonth, setStartMonth] = useState(10); // 10 = November (0-indexed)
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [monthCount, setMonthCount] = useState(10);
  const [holidaySunday, setHolidaySunday] = useState(true);
  const [holidayThursday, setHolidayThursday] = useState(false);

  const MAX_ROWS = 25;

  const generateRows = () => {
    let rows = [];
    if (includeData && classStudents && classStudents.length > 0) {
      rows = [...classStudents]; // User requested: តារាងដាក់តែគ្រប់ចំនួនសិស្សបានហើយ
    } else {
      for (let i = 0; i < MAX_ROWS * 2; i++) {
        rows.push({ id: `blank-${i}`, name: '', gender: '' } as any);
      }
    }
    return rows;
  };

  const rows = generateRows();
  const chunks = [];
  for (let i = 0; i < rows.length; i += MAX_ROWS) {
    chunks.push(rows.slice(i, i + MAX_ROWS));
  }

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Top Row: Title & Basic Settings */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                {language === 'km' ? 'សៀវភៅបញ្ជីហៅឈ្មោះសិស្ស (ស្វ័យប្រវត្តិ)' : 'Automated Attendance Book'}
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">Pro</span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'km' ? 'រៀបចំប្រតិទិន ថ្ងៃឈប់សម្រាក និងទាញឈ្មោះចូលតារាងដោយស្វ័យប្រវត្តិ' : 'Auto-fill dates, holidays, and student names into a printable book'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIncludeData(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${!includeData ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Square className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'km' ? 'តារាងទទេ' : 'Blank'}</span>
              </button>
              <button
                onClick={() => setIncludeData(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${includeData ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'km' ? 'ទាញទិន្នន័យចូល' : 'Auto-Fill'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button onClick={() => setCoverTheme('standard')} title="Standard Cover" className={`p-1.5 rounded-lg transition-all ${coverTheme === 'standard' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutTemplate className="w-4 h-4" /></button>
              <button onClick={() => setCoverTheme('modern')} title="Modern Cover" className={`p-1.5 rounded-lg transition-all ${coverTheme === 'modern' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Palette className="w-4 h-4" /></button>
              <button onClick={() => setCoverTheme('cute')} title="Cute Cover" className={`p-1.5 rounded-lg transition-all ${coverTheme === 'cute' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Sparkles className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Calendar Configuration */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === 'km' ? 'រៀបចំប្រតិទិនសិក្សា៖' : 'Calendar Setup:'}</span>
            </div>
            
            <select value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none text-indigo-700 dark:text-indigo-400">
              {KHMER_MONTHS.map((m, i) => (
                <option key={i} value={i}>{language === 'km' ? `ខែ${m}` : m}</option>
              ))}
            </select>
            
            <input 
              type="number" 
              value={startYear} 
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-20 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none text-indigo-700 dark:text-indigo-400"
            />
            
            <select value={monthCount} onChange={(e) => setMonthCount(Number(e.target.value))} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none text-indigo-700 dark:text-indigo-400">
              {[1, 2, 5, 10, 11, 12].map(n => (
                <option key={n} value={n}>{language === 'km' ? `រយៈពេល ${n} ខែ` : `${n} Months`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-4">
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === 'km' ? 'ថ្ងៃឈប់សម្រាក៖' : 'Holidays:'}</span>
             <label className="flex items-center gap-1.5 text-xs cursor-pointer text-slate-600">
               <input type="checkbox" checked={holidaySunday} onChange={(e) => setHolidaySunday(e.target.checked)} className="rounded text-indigo-600" />
               អាទិត្យ
             </label>
             <label className="flex items-center gap-1.5 text-xs cursor-pointer text-slate-600">
               <input type="checkbox" checked={holidayThursday} onChange={(e) => setHolidayThursday(e.target.checked)} className="rounded text-indigo-600" />
               ព្រហស្បតិ៍
             </label>

             <div className="ml-2">
               <PrintToPdfButton
                targetElementId="attendance-book-print-area"
                documentTitle={`Attendance_Book_${activeClass?.nameKm || 'Class'}`}
                pageSize="a4"
                orientation="landscape"
                variant="primary"
                className="text-xs py-1.5 px-4 shadow-sm h-8"
              />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
            <span>💡</span>
            {language === 'km' 
              ? 'គន្លឹះ៖ ពេលព្រីន សូមកំណត់ Layout ជា Landscape និងជម្រើស Scale ជា Default (ឬ Fit to Page) ព្រមទាំងធីកយក Background graphics ផងទើបចេញពណ៌លើថ្ងៃឈប់សម្រាក។' 
              : 'Tip: Use A4 Landscape. Enable "Background graphics" in print settings to show grayed-out holiday columns.'}
          </p>
        </div>

        <div className="overflow-x-auto p-4 sm:p-8">
          {/* Print Area */}
          <div id="attendance-book-print-area" className="w-[1123px] mx-auto bg-white text-slate-900 print:bg-white print:p-0">
            
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                @page { size: A4 landscape; margin: 5mm 10mm; }
                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .print-page-break { page-break-after: always; break-after: page; }
                .holiday-cell { background-color: #f1f5f9 !important; }
                .invalid-cell { background-color: #cbd5e1 !important; }
                .holiday-text { color: #dc2626 !important; }
              }
              .holiday-cell { background-color: #f1f5f9; }
              .invalid-cell { background-color: #cbd5e1; }
              .holiday-text { color: #dc2626; }
            `}} />

            {/* =========================================
                COVER PAGE
               ========================================= */}
            <div className={`w-[1123px] h-[790px] relative print-page-break flex flex-col items-center justify-center p-12 overflow-hidden
              ${coverTheme === 'standard' ? 'border-8 border-double border-slate-800' : ''}
              ${coverTheme === 'modern' ? 'bg-slate-50 border border-slate-200' : ''}
              ${coverTheme === 'cute' ? 'bg-amber-50/50 border-4 border-dashed border-amber-300 rounded-3xl print:rounded-none' : ''}
            `}>
              
              {coverTheme === 'modern' && (
                <>
                  <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-br-full print:bg-indigo-500/10" style={{WebkitPrintColorAdjust: 'exact'}}></div>
                  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-tl-full print:bg-sky-500/10" style={{WebkitPrintColorAdjust: 'exact'}}></div>
                  <div className="absolute top-20 right-32 w-48 h-48 bg-amber-500/10 rounded-full print:bg-amber-500/10" style={{WebkitPrintColorAdjust: 'exact'}}></div>
                  <div className="absolute bottom-32 left-20 w-24 h-24 bg-rose-500/10 rounded-full print:bg-rose-500/10" style={{WebkitPrintColorAdjust: 'exact'}}></div>
                </>
              )}

              {coverTheme === 'cute' && (
                <>
                  <div className="absolute top-12 left-16 text-6xl opacity-80 print:opacity-100">🏫</div>
                  <div className="absolute top-24 right-24 text-7xl opacity-80 print:opacity-100">🎒</div>
                  <div className="absolute bottom-24 left-24 text-7xl opacity-80 print:opacity-100">📚</div>
                  <div className="absolute bottom-16 right-20 text-7xl opacity-80 print:opacity-100">🎨</div>
                  <div className="absolute top-1/3 left-12 text-5xl opacity-50 print:opacity-100">✨</div>
                  <div className="absolute bottom-1/3 right-16 text-5xl opacity-50 print:opacity-100">⭐</div>
                  <div className="absolute top-12 right-1/2 text-5xl opacity-60 print:opacity-100">☀️</div>
                  <div className="absolute bottom-12 left-1/2 text-5xl opacity-60 print:opacity-100">🌱</div>
                </>
              )}

              <div className="relative z-10 text-center w-full max-w-4xl flex flex-col items-center space-y-16">
                <h2 className="text-4xl font-moul tracking-wider text-slate-800 leading-relaxed">
                  {schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សា ហ៊ុនណេង ប្រទង'}
                </h2>
                
                <div className="space-y-10 pt-8 pb-16">
                  <h3 className={`text-4xl font-moul ${coverTheme === 'cute' ? 'text-amber-600' : (coverTheme === 'modern' ? 'text-indigo-600' : 'text-slate-700')}`}>សៀវភៅ</h3>
                  <h1 className={`text-[80px] font-moul tracking-widest leading-tight ${coverTheme === 'cute' ? 'text-rose-600' : (coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-900')}`}>
                    បញ្ជីហៅឈ្មោះសិស្ស
                  </h1>
                </div>

                <div className="space-y-6">
                  <h3 className={`text-3xl font-moul ${coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-800'}`}>
                    ថ្នាក់ទី {activeClass?.nameKm || '៦ក'}
                  </h3>
                  <h3 className={`text-3xl font-moul pt-4 ${coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-800'}`}>
                    គ្រូបន្ទុកថ្នាក់៖ {activeClass?.teacherNameKm || 'គ្រូបង្រៀន'}
                  </h3>
                  <h3 className={`text-3xl font-moul pt-4 ${coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-800'}`}>
                    ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៦-២០២៧'}
                  </h3>
                </div>
              </div>
            </div>

            {/* =========================================
                STUDENT PROFILE LIST (បញ្ជីរាយនាមសិស្ស)
               ========================================= */}
            {chunks.map((chunk, chunkIndex) => (
              <div key={`profile-page-${chunkIndex}`} className="w-[1123px] h-[790px] print-page-break p-8 pt-10 relative bg-white flex flex-col justify-start">
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1 font-bold text-xs text-slate-900 mt-8">
                      <p>ការិយាល័យអប់រំ យុវជន និងកីឡា នៃរដ្ឋបាល{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                      <p>កម្រង {schoolProfile?.cluster || 'ដងក្តារ'}</p>
                      <p>{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សា ហ៊ុនណេង ប្រទង'}</p>
                    </div>
                    <div className="text-center space-y-1 text-slate-900">
                      <p className="font-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                      <p className="font-moul text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                      <p className="text-lg">~~~~~ * ~~~~~</p>
                    </div>
                    <div className="w-48"></div> {/* Spacer to center the title properly */}
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="font-moul text-xl text-slate-900 mb-2">បញ្ជីរាយនាមសិស្សរៀនថ្នាក់ទី {activeClass?.nameKm || '៦ក'}</h2>
                    <p className="font-bold text-sm text-slate-900">ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៦-២០២៧'}</p>
                  </div>

                  {/* Table */}
                  <div>
                    <table className="w-full border-collapse border border-slate-900 text-[11px] text-slate-900">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-center">
                          <th className="border border-slate-900 py-2.5 px-1 w-8 align-middle" rowSpan={2}>ល.រ</th>
                          <th className="border border-slate-900 py-2.5 px-1 w-12 align-middle" rowSpan={2}>អត្តលេខ</th>
                          <th className="border border-slate-900 py-2.5 px-2 w-36 align-middle" rowSpan={2}>គោត្តនាម និងនាម</th>
                          <th className="border border-slate-900 py-2.5 px-1 w-8 align-middle" rowSpan={2}>ភេទ</th>
                          <th className="border border-slate-900 py-1.5 px-1 align-middle" colSpan={3}>ថ្ងៃ ខែ ឆ្នាំកំណើត</th>
                          <th className="border border-slate-900 py-1.5 px-1 align-middle" colSpan={4}>ទីកន្លែងកំណើត</th>
                          <th className="border border-slate-900 py-2.5 px-2 w-28 align-middle" rowSpan={2}>ឈ្មោះឪពុក</th>
                          <th className="border border-slate-900 py-2.5 px-2 w-20 align-middle" rowSpan={2}>មុខរបរ</th>
                          <th className="border border-slate-900 py-2.5 px-2 w-28 align-middle" rowSpan={2}>ឈ្មោះម្តាយ</th>
                          <th className="border border-slate-900 py-2.5 px-2 w-20 align-middle" rowSpan={2}>មុខរបរ</th>
                          <th className="border border-slate-900 py-2.5 px-2 w-28 align-middle" rowSpan={2}>ទីលំនៅ<br/>បច្ចុប្បន្ន</th>
                          <th className="border border-slate-900 py-2.5 px-2 w-20 align-middle" rowSpan={2}>ផ្សេងៗ</th>
                        </tr>
                        <tr className="bg-slate-100 font-bold text-center">
                          <th className="border border-slate-900 py-1 px-1 w-8">ថ្ងៃ</th>
                          <th className="border border-slate-900 py-1 px-1 w-8">ខែ</th>
                          <th className="border border-slate-900 py-1 px-1 w-12">ឆ្នាំ</th>
                          <th className="border border-slate-900 py-1 px-1 w-16">ភូមិ</th>
                          <th className="border border-slate-900 py-1 px-1 w-16">ឃុំ</th>
                          <th className="border border-slate-900 py-1 px-1 w-16">ស្រុក</th>
                          <th className="border border-slate-900 py-1 px-1 w-16">ខេត្ត</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chunk.map((stu, i) => (
                          <tr key={stu.id} className="text-center h-7">
                            <td className="border border-slate-900 font-bold">{chunkIndex * MAX_ROWS + i + 1}</td>
                            <td className="border border-slate-900 text-left px-1"></td>
                            <td className="border border-slate-900 text-left px-2 font-bold">{stu.name}</td>
                            <td className="border border-slate-900">{stu.name ? (stu.gender === 'Female' ? 'ស' : 'ប') : ''}</td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                            <td className="border border-slate-900"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {chunkIndex === chunks.length - 1 && (
                  <div className="flex justify-between items-start mt-4 text-xs font-bold text-slate-900">
                    <div>
                       សរុប {classStudents && classStudents.length > 0 && includeData ? classStudents.length : '......'} នាក់ ស្រី {classStudents && classStudents.length > 0 && includeData ? classStudents.filter(s => s.gender === 'Female').length : '......'} នាក់
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* =========================================
                MONTHLY ATTENDANCE SHEETS (Automated Calendar)
               ========================================= */}
            {Array.from({ length: monthCount }).map((_, mIndex) => {
              
              // Calendar calculations for this specific month
              const monthDate = new Date(startYear, startMonth + mIndex, 1);
              const mYear = monthDate.getFullYear();
              const mMonth = monthDate.getMonth();
              const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
              
              return chunks.map((chunk, chunkIndex) => (
                <div key={`month-${mIndex}-chunk-${chunkIndex}`} className="w-[1123px] h-[790px] print-page-break p-8 pt-10 relative bg-white flex flex-col justify-start">
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 text-slate-900">
                      <div className="space-y-1 font-bold text-xs mt-8">
                        <p>ការិយាល័យអប់រំ យុវជន និងកីឡា នៃរដ្ឋបាល{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                        <p>{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សា ហ៊ុនណេង ប្រទង'}</p>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p className="font-moul text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <p className="text-lg">~~~~~ * ~~~~~</p>
                      </div>
                      <div className="w-48"></div>
                    </div>

                    <div className="text-center mb-6 text-slate-900">
                      <h2 className="font-moul text-xl mb-3">បញ្ជីហៅឈ្មោះសិស្ស</h2>
                      <div className="font-bold text-sm flex items-center justify-center space-x-8">
                        <p className="bg-amber-100 print:bg-transparent px-3 py-1 rounded border border-amber-300 print:border-none inline-block">
                           ប្រចាំខែ <span className="text-lg text-indigo-700 print:text-slate-900 mx-2 underline underline-offset-4">{KHMER_MONTHS[mMonth]}</span> 
                           ឆ្នាំ <span className="text-lg text-indigo-700 print:text-slate-900 mx-1">{mYear}</span>
                        </p>
                        <p>សិស្សសរុប <span className="font-mono text-base border-b border-dotted border-slate-500 px-2 inline-block min-w-8 text-center">{includeData && classStudents ? classStudents.length : '..........'}</span> នាក់</p>
                        <p>ប្រុស <span className="font-mono text-base border-b border-dotted border-slate-500 px-2 inline-block min-w-8 text-center">{includeData && classStudents ? classStudents.filter(s => s.gender === 'Male').length : '..........'}</span> នាក់</p>
                        <p>ស្រី <span className="font-mono text-base border-b border-dotted border-slate-500 px-2 inline-block min-w-8 text-center">{includeData && classStudents ? classStudents.filter(s => s.gender === 'Female').length : '..........'}</span> នាក់</p>
                      </div>
                    </div>

                    {/* Table */}
                    <div>
                      <table className="w-full border-collapse border border-slate-900 text-[10.5px] text-slate-900 table-fixed">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-center">
                            <th className="border border-slate-900 py-1 px-0.5 w-[25px] align-middle" rowSpan={3}>ល.រ</th>
                            <th className="border border-slate-900 py-1 px-1 w-[45px] align-middle" rowSpan={3}>អត្តលេខ</th>
                            <th className="border border-slate-900 py-1 px-2 w-[140px] text-left align-middle" rowSpan={3}>គោត្តនាម និងនាម</th>
                            <th className="border border-slate-900 py-1 px-0.5 w-[25px] align-middle" rowSpan={3}>ភេទ</th>
                            <th className="border border-slate-900 py-1 px-0 align-middle tracking-tighter bg-indigo-50 print:bg-slate-100" colSpan={31}>
                               កាលបរិច្ឆេទ (ថ្ងៃទី និង ថ្ងៃនៃសប្តាហ៍)
                            </th>
                            <th className="border border-slate-900 py-1 px-1 align-middle" colSpan={3} rowSpan={2}>ចំនួនអវត្តមាន</th>
                            <th className="border border-slate-900 py-1 px-1 w-[80px] align-middle" rowSpan={3}>សេចក្តីផ្សេងៗ</th>
                          </tr>
                          
                          {/* Row for Dates (1-31) */}
                          <tr className="bg-slate-100 font-bold text-center">
                            {daysArray.map(d => {
                               if (d > daysInMonth) return <th key={`date-${d}`} className="border border-slate-900 p-0 align-middle w-[18px] text-[10px] leading-tight text-center invalid-cell"></th>;
                               
                               const dow = new Date(mYear, mMonth, d).getDay();
                               const isHoliday = (holidaySunday && dow === 0) || (holidayThursday && dow === 4);
                               
                               return (
                                 <th key={`date-${d}`} className={`border border-slate-900 p-0 align-middle w-[18px] text-[10px] leading-tight text-center ${isHoliday ? 'holiday-cell holiday-text' : ''}`}>
                                   {d}
                                 </th>
                               )
                            })}
                          </tr>

                          {/* Row for Days of Week (ច, អ, ព...) */}
                          <tr className="bg-slate-100 font-bold text-center">
                            {daysArray.map(d => {
                               if (d > daysInMonth) return <th key={`dow-${d}`} className="border border-slate-900 p-0 align-middle w-[18px] text-[9px] leading-tight text-center invalid-cell"></th>;
                               
                               const dow = new Date(mYear, mMonth, d).getDay();
                               const isHoliday = (holidaySunday && dow === 0) || (holidayThursday && dow === 4);
                               
                               return (
                                 <th key={`dow-${d}`} className={`border border-slate-900 p-0.5 align-middle w-[18px] text-[9px] leading-tight text-center ${isHoliday ? 'holiday-cell holiday-text' : ''}`}>
                                   {KHMER_DAYS[dow]}
                                 </th>
                               )
                            })}
                            <th className="border border-slate-900 py-1 px-0.5 w-[25px] text-[9px]">ច្ប</th>
                            <th className="border border-slate-900 py-1 px-0.5 w-[25px] text-[9px]">អច្ប</th>
                            <th className="border border-slate-900 py-1 px-0.5 w-[30px] text-[9px]">សរុប</th>
                          </tr>
                        </thead>
                        
                        {/* Student Rows */}
                        <tbody>
                          {chunk.map((stu, i) => (
                            <tr key={stu.id} className="text-center h-[20px]">
                              <td className="border border-slate-900 font-bold">{chunkIndex * MAX_ROWS + i + 1}</td>
                              <td className="border border-slate-900 text-left px-1"></td>
                              <td className="border border-slate-900 text-left px-2 font-bold whitespace-nowrap overflow-hidden text-[10px]">{stu.name}</td>
                              <td className="border border-slate-900">{stu.name ? (stu.gender === 'Female' ? 'ស' : 'ប') : ''}</td>
                              
                              {/* Dynamic Day Cells */}
                              {daysArray.map(d => {
                                if (d > daysInMonth) return <td key={`cell-${stu.id}-${d}`} className="border border-slate-900 p-0 text-center text-[10px] invalid-cell"></td>;
                                
                                const dow = new Date(mYear, mMonth, d).getDay();
                                const isHoliday = (holidaySunday && dow === 0) || (holidayThursday && dow === 4);
                                
                                return (
                                  <td key={`cell-${stu.id}-${d}`} className={`border border-slate-900 p-0 text-center text-[10px] ${isHoliday ? 'holiday-cell' : ''}`}>
                                     {isHoliday && stu.name ? <span className="text-[8px] text-slate-300 print:text-slate-400">X</span> : ''}
                                  </td>
                                )
                              })}
                              
                              <td className="border border-slate-900 p-0"></td>
                              <td className="border border-slate-900 p-0"></td>
                              <td className="border border-slate-900 p-0 font-bold bg-slate-50 print:bg-transparent"></td>
                              <td className="border border-slate-900 p-0 text-xs"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer - Only show on the last chunk of the month */}
                  {chunkIndex === chunks.length - 1 ? (
                    <div className="mt-2 pt-2 text-[12px] font-bold text-slate-900">
                      <div className="flex justify-between items-end mb-3 gap-4">
                        <div className="space-y-1.5 whitespace-nowrap">
                          <p>- ចំនួនសិស្សក្នុងបញ្ជី <span className="font-mono text-sm border-b border-dotted border-slate-500 px-2 inline-block min-w-[2rem] text-center">{includeData && classStudents ? classStudents.length : ''}</span> នាក់ ស្រី <span className="font-mono text-sm border-b border-dotted border-slate-500 px-2 inline-block min-w-[2rem] text-center">{includeData && classStudents ? classStudents.filter(s => s.gender === 'Female').length : ''}</span> នាក់</p>
                          <p className="flex items-center">- បញ្ឈប់បញ្ជីក្នុងខែនេះនូវចំនួន <span className="border-b border-dotted border-slate-500 w-16 inline-block mx-1"></span> ពេល</p>
                        </div>
                        <div className="space-y-1.5 whitespace-nowrap">
                          <p className="flex items-center gap-2">ចំនួនពេលដែលសិស្សត្រូវមករៀន <span className="border-b border-dotted border-slate-500 w-12 inline-block"></span> ចំនួនពេលអវត្តមាន <span className="border-b border-dotted border-slate-500 w-12 inline-block"></span></p>
                          <p className="flex items-center gap-2 mt-2">ចំនួនពេលដែលសិស្សមករៀនពិតប្រាកដ <span className="border-b border-dotted border-slate-500 w-24 inline-block"></span></p>
                        </div>
                        <div className="whitespace-nowrap pb-1">
                          <div className="flex items-center gap-1">
                            <span>ភាគរយអវត្តមានៈ</span>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] leading-tight ml-16">x100</span>
                              <div className="w-28 border-b border-slate-900"></div>
                            </div>
                            <span className="ml-1 flex items-end gap-1">= <span className="border-b border-dotted border-slate-500 w-16 inline-block mb-1"></span> %</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-start mt-3 px-16">
                        <div className="w-1/4"></div>
                        <div className="text-center space-y-1 w-1/4">
                          <p className="font-moul">បានឃើញ និងឯកភាព</p>
                          <p className="font-moul">នាយកសាលា</p>
                        </div>
                        <div className="text-center space-y-1.5 text-[12px] w-[35%]">
                          <p className="flex justify-center items-center">ថ្ងៃ<span className="border-b border-dotted border-slate-500 w-8 inline-block mx-1"></span>ខែ<span className="border-b border-dotted border-slate-500 w-8 inline-block mx-1"></span>ឆ្នាំ<span className="border-b border-dotted border-slate-500 w-8 inline-block mx-1"></span> ព.ស.២៥<span className="border-b border-dotted border-slate-500 w-8 inline-block mx-1"></span></p>
                          <p className="flex justify-center items-center">ធ្វើនៅ<span className="border-b border-dotted border-slate-500 w-24 inline-block mx-1"></span>ថ្ងៃទី<span className="border-b border-dotted border-slate-500 w-6 inline-block mx-1"></span>ខែ<span className="border-b border-dotted border-slate-500 w-12 inline-block mx-1"></span>ឆ្នាំ២០<span className="border-b border-dotted border-slate-500 w-6 inline-block mx-1"></span></p>
                          <p className="font-moul mt-1">គ្រូបន្ទុកថ្នាក់</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32"></div> /* Spacer for pages that don't have the footer */
                  )}
                </div>
              ));
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
