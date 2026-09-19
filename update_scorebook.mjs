import fs from 'fs';

const file = 'src/components/tools/ScoreBookGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add coverTheme state
// find const [includeData, setIncludeData] = useState(true);
content = content.replace(
  /const \[includeData, setIncludeData\] = useState\(true\);/,
  `const [includeData, setIncludeData] = useState(true);
  const [coverTheme, setCoverTheme] = useState<'standard' | 'modern' | 'cute'>('standard');`
);

// 2. Add imports for LayoutTemplate, Palette, Sparkles if missing
// find lucide-react imports
if (!content.includes('LayoutTemplate')) {
  content = content.replace(
    /import \{\s*Printer,\s*Settings,\s*Users,\s*FileText\s*\} from 'lucide-react';/,
    `import { Printer, Settings, Users, FileText, LayoutTemplate, Palette, Sparkles } from 'lucide-react';`
  );
}

// 3. Add Cover Theme Selector in config panel
// find {/* Data Option */}
const themeSelector = `{/* Cover Theme */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Palette size={16} className="mr-2 text-indigo-500" />
              {language === 'km' ? 'រចនាបថក្រប' : 'Cover Style'}
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button onClick={() => setCoverTheme('standard')} title="Standard Cover" className={\`flex-1 py-2 text-sm font-medium rounded-md transition-all \${coverTheme === 'standard' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}\`}>Standard</button>
              <button onClick={() => setCoverTheme('modern')} title="Modern Cover" className={\`flex-1 py-2 text-sm font-medium rounded-md transition-all \${coverTheme === 'modern' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500'}\`}>Modern</button>
              <button onClick={() => setCoverTheme('cute')} title="Cute Cover" className={\`flex-1 py-2 text-sm font-medium rounded-md transition-all \${coverTheme === 'cute' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500'}\`}>Cute</button>
            </div>
          </div>
          `;
content = content.replace(/\{\/\* Data Option \*\/\}/, themeSelector + '\n          {/* Data Option */}');

// 4. Update the Cover Page structure
const oldCoverRegex = /\{\/\* Cover Page \*\/\}[\s\S]*?(?=\s*\{\/\* Month Pages \*\/\})/m;

const newCover = `{/* Cover Page */}
          <div className={\`w-[1123px] h-[790px] relative print-page-break flex flex-col items-center justify-center p-12 overflow-hidden
            \${coverTheme === 'standard' ? 'border-8 border-double border-slate-800' : ''}
            \${coverTheme === 'modern' ? 'bg-slate-50 border border-slate-200' : ''}
            \${coverTheme === 'cute' ? 'bg-amber-50/50 border-4 border-dashed border-amber-300 rounded-3xl print:rounded-none' : ''}
          \`}>
            
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
                <h3 className={\`text-4xl font-moul \${coverTheme === 'cute' ? 'text-amber-600' : (coverTheme === 'modern' ? 'text-indigo-600' : 'text-slate-700')}\`}>សៀវភៅ</h3>
                <h1 className={\`text-[80px] font-moul tracking-widest leading-tight \${coverTheme === 'cute' ? 'text-rose-600' : (coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-900')}\`}>
                  បញ្ជីស្រង់ពិន្ទុ
                </h1>
              </div>

              <div className="space-y-6">
                <h3 className={\`text-3xl font-moul \${coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-800'}\`}>
                  ថ្នាក់ទី {activeClass?.nameKm || '៦ក'}
                </h3>
                <h3 className={\`text-3xl font-moul pt-4 \${coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-800'}\`}>
                  គ្រូបន្ទុកថ្នាក់៖ {activeClass?.teacherNameKm || 'គ្រូបង្រៀន'}
                </h3>
                <h3 className={\`text-3xl font-moul pt-4 \${coverTheme === 'modern' ? 'text-indigo-900' : 'text-slate-800'}\`}>
                  ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៦-២០២៧'}
                </h3>
              </div>
            </div>
          </div>`;

content = content.replace(oldCoverRegex, newCover + '\n');

// 5. Build pages array containing both months and semesters
// Find `const months = Array.from...`
const pagesSetup = `const months = Array.from({ length: monthCount }).map((_, i) => {
    const date = new Date(startYear, startMonth + i, 1);
    return {
      type: 'month',
      month: date.getMonth(),
      year: date.getFullYear(),
      title: 'តារាងស្រង់ពិន្ទុប្រចាំខែ',
      periodLabel: KHMER_MONTHS[date.getMonth()],
      periodPrefix: 'ប្រចាំខែ '
    };
  });
  
  const pages = [
    ...months,
    {
      type: 'semester',
      month: -1,
      year: -1,
      title: 'តារាងស្រង់ពិន្ទុប្រចាំឆមាសទី១',
      periodLabel: '១',
      periodPrefix: 'ប្រចាំឆមាសទី '
    },
    {
      type: 'semester',
      month: -1,
      year: -1,
      title: 'តារាងស្រង់ពិន្ទុប្រចាំឆមាសទី២',
      periodLabel: '២',
      periodPrefix: 'ប្រចាំឆមាសទី '
    }
  ];`;

content = content.replace(/const months = Array\.from\(\{ length: monthCount \}\)\.map\(\(_, i\) => \{[\s\S]*?\}\);\s*/, pagesSetup + '\n');

// Update `{months.map(({ month: mMonth, year: mYear }, mIndex) => {`
// to `{pages.map(({ type, month: mMonth, year: mYear, title, periodLabel, periodPrefix }, pIndex) => {`
content = content.replace(/\{months\.map\(\(\{ month: mMonth, year: mYear \}, mIndex\) => \{/g, 
  `{pages.map(({ type, month: mMonth, year: mYear, title, periodLabel, periodPrefix }, pIndex) => {`);

// Update keys: `key={\`month-\${mIndex}-chunk-\${chunkIndex}\`}` to `key={\`page-\${pIndex}-chunk-\${chunkIndex}\`}`
content = content.replace(/key=\{\`month-\$\{mIndex\}-chunk-\$\{chunkIndex\}\`\}/g, `key={\`page-\${pIndex}-chunk-\${chunkIndex}\`}`);

// Update `<h2 className="font-moul text-xl text-slate-900 mb-2">តារាងស្រង់ពិន្ទុប្រចាំខែ</h2>`
content = content.replace(/<h2 className="font-moul text-xl text-slate-900 mb-2">តារាងស្រង់ពិន្ទុប្រចាំខែ<\/h2>/g, 
  `<h2 className="font-moul text-xl text-slate-900 mb-2">{title}</h2>`);

// Update `<p>ថ្នាក់ទី <span className="border-b border-dotted border-slate-500 px-4 inline-block">{activeClass?.nameKm || '៦ក'}</span> ប្រចាំខែ <span className="border-b border-dotted border-slate-500 px-8 inline-block">{KHMER_MONTHS\[mMonth\]}<\/span> ឆ្នាំសិក្សា {activeClass\?.academicYear || '២០២៥-២០២៦'}<\/p>`
// to handle the semester display
const oldPeriodLine = /<p>ថ្នាក់ទី <span className="border-b border-dotted border-slate-500 px-4 inline-block">\{activeClass\?\.nameKm \|\| '៦ក'\}<\/span> ប្រចាំខែ <span className="border-b border-dotted border-slate-500 px-8 inline-block">\{KHMER_MONTHS\[mMonth\]\}<\/span> ឆ្នាំសិក្សា \{activeClass\?\.academicYear \|\| '២០២៥-២០២៦'\}<\/p>/g;
content = content.replace(oldPeriodLine, 
  `<p>ថ្នាក់ទី <span className="border-b border-dotted border-slate-500 px-4 inline-block">{activeClass?.nameKm || '៦ក'}</span> {periodPrefix}<span className="border-b border-dotted border-slate-500 px-8 inline-block">{periodLabel}</span> ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៥-២០២៦'}</p>`);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated the score book structure.');
