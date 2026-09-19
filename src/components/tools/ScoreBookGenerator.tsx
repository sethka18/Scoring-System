import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Printer, Settings, Users, FileText, LayoutTemplate, Palette, Sparkles } from 'lucide-react';

const KHMER_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

export const ScoreBookGenerator: React.FC = () => {
  const { language, activeClass, schoolProfile, classStudents } = useGradebook();
  const [includeData, setIncludeData] = useState(true);
  const [coverTheme, setCoverTheme] = useState<'standard' | 'modern' | 'cute'>('standard');
  
  // Calendar Settings
  const [startMonth, setStartMonth] = useState(10); // 10 = November (0-indexed)
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [monthCount, setMonthCount] = useState(10);

  const MAX_ROWS = 25;

  const generateRows = () => {
    let rows = [];
    if (includeData && classStudents && classStudents.length > 0) {
      rows = [...classStudents]; 
    } else {
      for (let i = 0; i < MAX_ROWS; i++) {
        rows.push({ id: `blank-${i}`, name: '', gender: '' } as any);
      }
    }
    return rows;
  };

  const handlePrint = () => {
    window.print();
  };

  const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const rows = generateRows();
  const chunks = chunkArray(rows, MAX_ROWS);

  const pages: any[] = [];
  for (let i = 0; i < monthCount; i++) {
    const date = new Date(startYear, startMonth + i, 1);
    const monthIndex = date.getMonth();
    
    // Skip March (2), April (3), August (7)
    if (monthIndex === 2 || monthIndex === 3 || monthIndex === 7) {
      continue;
    }

    pages.push({
      type: 'month',
      month: monthIndex,
      year: date.getFullYear(),
      title: 'តារាងស្រង់ពិន្ទុប្រចាំខែ',
      periodLabel: KHMER_MONTHS[monthIndex],
      periodPrefix: 'ប្រចាំខែ '
    });

    // Insert Semester 1 after February (1)
    if (monthIndex === 1) {
      pages.push({
        type: 'semester',
        month: -1,
        year: -1,
        title: 'តារាងស្រង់ពិន្ទុប្រចាំឆមាសទី១',
        periodLabel: '១',
        periodPrefix: 'ប្រចាំឆមាសទី '
      });
    }

    // Insert Semester 2 after July (6)
    if (monthIndex === 6) {
      pages.push({
        type: 'semester',
        month: -1,
        year: -1,
        title: 'តារាងស្រង់ពិន្ទុប្រចាំឆមាសទី២',
        periodLabel: '២',
        periodPrefix: 'ប្រចាំឆមាសទី '
      });
    }
  }
return (
    <div className="space-y-6">
      {/* Configuration Header - Hidden during print */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {language === 'km' ? 'បញ្ជីស្រង់ពិន្ទុ' : 'Score Book Generator'}
              </h2>
              <p className="text-sm text-slate-500">
                {language === 'km' ? 'បង្កើត និងបោះពុម្ពសៀវភៅស្រង់ពិន្ទុសិស្សប្រចាំខែ' : 'Generate and print monthly student score book'}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Printer size={18} />
            <span>{language === 'km' ? 'បោះពុម្ពបញ្ជីពិន្ទុ' : 'Print Score Book'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cover Theme */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Palette size={16} className="mr-2 text-indigo-500" />
              {language === 'km' ? 'រចនាបថក្រប' : 'Cover Style'}
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button onClick={() => setCoverTheme('standard')} title="Standard Cover" className={`flex-1 py-2 flex items-center justify-center text-sm font-medium rounded-md transition-all ${coverTheme === 'standard' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutTemplate className="w-4 h-4 mr-2" /> Standard</button>
              <button onClick={() => setCoverTheme('modern')} title="Modern Cover" className={`flex-1 py-2 flex items-center justify-center text-sm font-medium rounded-md transition-all ${coverTheme === 'modern' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Palette className="w-4 h-4 mr-2" /> Modern</button>
              <button onClick={() => setCoverTheme('cute')} title="Cute Cover" className={`flex-1 py-2 flex items-center justify-center text-sm font-medium rounded-md transition-all ${coverTheme === 'cute' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Sparkles className="w-4 h-4 mr-2" /> Cute</button>
            </div>
          </div>
          
          {/* Data Option */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Users size={16} className="mr-2 text-indigo-500" />
              {language === 'km' ? 'ទិន្នន័យសិស្ស' : 'Student Data'}
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setIncludeData(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  includeData 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'មានឈ្មោះស្រាប់' : 'Include Names'}
              </button>
              <button
                onClick={() => setIncludeData(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  !includeData 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ទុកទំនេរ (សម្រាប់សរសេរ)' : 'Blank Grid'}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Settings size={16} className="mr-2 text-indigo-500" />
              {language === 'km' ? 'ខែចាប់ផ្តើម' : 'Start Month'}
            </label>
            <div className="flex space-x-2">
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                {KHMER_MONTHS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-24 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Settings size={16} className="mr-2 text-indigo-500" />
              {language === 'km' ? 'ចំនួនខែសរុប' : 'Total Months'}
            </label>
            <select
              value={monthCount}
              onChange={(e) => setMonthCount(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              {[1, 3, 6, 9, 10, 12].map(num => (
                <option key={num} value={num}>{language === 'km' ? `${num} ខែ` : `${num} Months`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Print Area Preview */}
      <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-2xl overflow-x-auto print:p-0 print:bg-white">
        <div id="score-book-print-area" className="w-[1123px] mx-auto bg-white text-slate-900 print:bg-white print:p-0">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              #score-book-print-area { width: 100% !important; margin: 0 !important; }
              .print-page-break { page-break-after: always; break-after: page; }
              .print-page-break:last-child { page-break-after: auto; break-after: auto; }
            }
          `}} />
          
          {/* Cover Page */}
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
                  បញ្ជីស្រង់ពិន្ទុ
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


          {/* Month Pages */}
          {pages.map(({ type, month: mMonth, year: mYear, title, periodLabel, periodPrefix }, pIndex) => {
            return chunks.map((chunk, chunkIndex) => (
              <div key={`page-${pIndex}-chunk-${chunkIndex}`} className="w-[1123px] h-[790px] print-page-break p-8 pt-6 relative bg-white flex flex-col justify-start">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 text-slate-900">
                  <div className="space-y-1 font-bold text-xs mt-6">
                    <p>មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្ត{schoolProfile?.province || 'កំពង់ចាម'}</p>
                    <p>ការិយាល័យអប់រំ យុវជន និងកីឡា នៃរដ្ឋបាល{schoolProfile?.district || 'ស្រុកស្ទឹងត្រង់'}</p>
                    <p>{schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សា ហ៊ុនណេង ប្រទង'}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p className="font-moul text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <h2 className="font-moul text-xl text-slate-900 mb-2">{title}</h2>
                </div>

                <div className="flex justify-between items-end mb-1.5 text-[11px] font-bold text-slate-900">
                  <p>ថ្នាក់ទី <span className="border-b border-dotted border-slate-500 px-4 inline-block">{activeClass?.nameKm || '៦ក'}</span> {periodPrefix}<span className="border-b border-dotted border-slate-500 px-8 inline-block">{periodLabel}</span> ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៥-២០២៦'}</p>
                  <div className="flex space-x-6">
                    <p>សិស្សសរុប <span className="font-mono border-b border-dotted border-slate-500 px-2 inline-block min-w-8 text-center">{includeData && classStudents ? classStudents.length : '..........'}</span> នាក់</p>
                    <p>ប្រុស <span className="font-mono border-b border-dotted border-slate-500 px-2 inline-block min-w-8 text-center">{includeData && classStudents ? classStudents.filter(s=>s.gender==='Male').length : '..........'}</span> នាក់</p>
                    <p>ស្រី <span className="font-mono border-b border-dotted border-slate-500 px-2 inline-block min-w-8 text-center">{includeData && classStudents ? classStudents.filter(s=>s.gender==='Female').length : '..........'}</span> នាក់</p>
                  </div>
                </div>

                {/* Table */}
                <div className="mb-2">
                  <table className="w-full border-collapse border border-slate-900 text-[10px] text-slate-900 text-center">
                    <thead>
                      <tr className="font-bold">
                        <th className="border border-slate-900 py-1 w-[20px] align-middle" rowSpan={2}>ល.រ</th>
                        <th className="border border-slate-900 py-1 w-[120px] align-middle" rowSpan={2}>គោត្តនាម និងនាម</th>
                        <th className="border border-slate-900 py-1 w-[25px] align-middle" rowSpan={2}>ភេទ</th>
                        <th className="border border-slate-900 py-1 align-middle" colSpan={4}>ភាសាខ្មែរ</th>
                        <th className="border border-slate-900 py-1 align-middle" colSpan={5}>គណិតវិទ្យា</th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]" rowSpan={2}>
                           <div className="h-28 flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">វិទ្យាសាស្ត្រ</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]" rowSpan={2}>
                           <div className="h-28 flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">សិក្សាសង្គម</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 py-1 align-middle" colSpan={3}>អប់រំកាយ សុខភាព សិល្បៈ</th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]" rowSpan={2}>
                           <div className="h-28 flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">អប់រំបំណិនជីវិត</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]" rowSpan={2}>
                           <div className="h-28 flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">ភាសាបរទេស</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 py-1 align-middle" colSpan={3}>លទ្ធផលប្រចាំខែ</th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]" rowSpan={2}>
                           <div className="h-28 flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">សេចក្តីផ្សេងៗ</span>
                           </div>
                        </th>
                      </tr>
                      <tr className="font-bold text-[9px]">
                        {/* Khmer */}
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">សមត្ថភាពស្តាប់</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">សមត្ថភាពសរសេរ</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">សមត្ថភាពអាន</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">សមត្ថភាពនិយាយ</span>
                           </div>
                        </th>
                        {/* Math */}
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">ចំនួន</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">រង្វាស់រង្វាល់</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">ធរណីមាត្រ</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">ពីជគណិត</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">ស្ថិតិ</span>
                           </div>
                        </th>
                        {/* PE */}
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">គេហវិទ្យា-អប់រំសិល្បៈ</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">អប់រំកាយ-កីឡា</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">សុខភាព-អនាម័យ</span>
                           </div>
                        </th>
                        {/* Result */}
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">ពិន្ទុសរុប</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">មធ្យមភាគ</span>
                           </div>
                        </th>
                        <th className="border border-slate-900 p-0 align-middle w-[30px]">
                           <div className="h-[90px] flex items-center justify-center">
                              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="whitespace-nowrap">ចំណាត់ថ្នាក់</span>
                           </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {chunk.map((stu, i) => (
                        <tr key={stu.id} className="text-center h-[18px]">
                          <td className="border border-slate-900 font-bold">{chunkIndex * MAX_ROWS + i + 1}</td>
                          <td className="border border-slate-900 text-left px-2 font-bold whitespace-nowrap overflow-hidden max-w-[120px]">{stu.name}</td>
                          <td className="border border-slate-900">{stu.name ? (stu.gender === 'Female' ? 'ស' : 'ប') : ''}</td>
                          
                          {/* Khmer */}
                          <td className="border border-slate-900"></td><td className="border border-slate-900"></td><td className="border border-slate-900"></td><td className="border border-slate-900"></td>
                          {/* Math */}
                          <td className="border border-slate-900"></td><td className="border border-slate-900"></td><td className="border border-slate-900"></td><td className="border border-slate-900"></td><td className="border border-slate-900"></td>
                          {/* Science, Social */}
                          <td className="border border-slate-900"></td><td className="border border-slate-900"></td>
                          {/* PE */}
                          <td className="border border-slate-900"></td><td className="border border-slate-900"></td><td className="border border-slate-900"></td>
                          {/* Life Skills, Foreign Lang */}
                          <td className="border border-slate-900"></td><td className="border border-slate-900"></td>
                          {/* Result */}
                          <td className="border border-slate-900"></td><td className="border border-slate-900"></td><td className="border border-slate-900"></td>
                          {/* Remarks */}
                          <td className="border border-slate-900"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer - Only show on the last chunk of the month */}
                {chunkIndex === chunks.length - 1 ? (
                  <div className="flex justify-between items-start text-[11px] font-bold text-slate-900 mt-2">
                    {/* Left */}
                    <div className="text-center space-y-1 ml-8 pt-9">
                      <p className="font-moul">បានឃើញ និងឯកភាព</p>
                      <p className="font-moul">នាយកសាលា</p>
                    </div>
                    {/* Middle */}
                    <div className="text-center space-y-1 text-slate-800 ml-4">
                      <p>ថ្ងៃ<span className="border-b border-dotted border-slate-500 w-8 inline-block mx-1"></span>ខែ<span className="border-b border-dotted border-slate-500 w-8 inline-block mx-1"></span>ឆ្នាំ<span className="border-b border-dotted border-slate-500 w-12 inline-block mx-1"></span> ព.ស.២៥<span className="border-b border-dotted border-slate-500 w-8 inline-block mx-1"></span></p>
                      <p>ធ្វើនៅ<span className="border-b border-dotted border-slate-500 w-24 inline-block mx-1"></span>ថ្ងៃទី<span className="border-b border-dotted border-slate-500 w-6 inline-block mx-1"></span>ខែ<span className="border-b border-dotted border-slate-500 w-12 inline-block mx-1"></span>ឆ្នាំ២០<span className="border-b border-dotted border-slate-500 w-6 inline-block mx-1"></span></p>
                      <p className="font-moul pt-2">គ្រូបន្ទុកថ្នាក់</p>
                    </div>
                    {/* Right */}
                    <div className="flex items-center ml-2">
                      <div className="text-center pr-3">
                        <span className="font-moul text-[11px] leading-tight block w-[90px]">សរុបសិស្សនិទ្ទេស</span>
                      </div>
                      <div className="border-l-2 border-slate-900 pl-3 py-0.5 text-[10px] font-mono leading-[1.3] space-y-[2px]">
                        {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                          <div key={grade} className="flex items-center">
                            <span className="font-bold w-4 text-center mr-1">{grade}</span>
                            <span>មាន<span className="border-b border-dotted border-slate-500 w-5 inline-block mx-1"></span>នាក់ ស្រី<span className="border-b border-dotted border-slate-500 w-5 inline-block mx-1"></span>នាក់<span className="border-b border-dotted border-slate-500 w-6 inline-block mx-1"></span>%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
};
