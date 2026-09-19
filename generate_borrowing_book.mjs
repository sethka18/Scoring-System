import fs from 'fs';

const file = 'src/components/tools/BookBorrowingGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace component name
content = content.replace(/ScoreBookGenerator/g, 'BookBorrowingGenerator');

// Replace Title texts
content = content.replace(/បញ្ជីស្រង់ពិន្ទុ/g, 'បញ្ជីខ្ចីសៀវភៅ');
content = content.replace(/Score Book Generator/g, 'Book Borrowing Generator');
content = content.replace(/បង្កើត និងបោះពុម្ពសៀវភៅស្រង់ពិន្ទុសិស្សប្រចាំខែ/g, 'បង្កើត និងបោះពុម្ពបញ្ជីសិស្សខ្ចីសៀវភៅពុម្ព');
content = content.replace(/Generate and print monthly student score book/g, 'Generate and print student book borrowing list');
content = content.replace(/Print Score Book/g, 'Print Borrowing List');

// Remove period options from configuration UI
const monthOptionsRegex = /\{\/\* Calendar Settings \*\/\}.*?\{\/\* Data Option \*\/\}/s;
content = content.replace(monthOptionsRegex, '{/* Data Option */}');

// Pages generation: We only need ONE cover page and ONE chunked list.
const pagesLogicRegex = /const pages: any\[\] = \[\];[\s\S]*?\}\s*\n/m;
content = content.replace(pagesLogicRegex, `const pages = [{ type: 'list', title: 'បញ្ជីរាយនាមសិស្សខ្ចីសៀវភៅ' }];\n`);

// Update the Print ID
content = content.replace(/score-book-print-area/g, 'borrowing-book-print-area');

// Update Table structure
const tableRegex = /\{\/\* Table \*\/\}.*?(?=\{\/\* Footer - Only show)/s;
const tableHTML = `{/* Table */}
                <div className="flex-1 w-full flex flex-col justify-start pb-4">
                  <table className="w-full border-collapse border border-slate-900 text-slate-900 text-[10px]" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr className="bg-slate-100">
                        <th rowSpan={2} className="border border-slate-900 w-8 py-1">ល.រ</th>
                        <th rowSpan={2} className="border border-slate-900 py-1" style={{ width: '18%' }}>គោត្តនាម-នាម</th>
                        <th colSpan={2} className="border border-slate-900 py-1 text-red-500">ភាសាខ្មែរ</th>
                        <th colSpan={2} className="border border-slate-900 py-1">គណិតវិទ្យា</th>
                        <th colSpan={2} className="border border-slate-900 py-1 text-blue-500">វិទ្យាសាស្ត្រ</th>
                        <th colSpan={2} className="border border-slate-900 py-1 text-amber-500">សិក្សាសង្គម</th>
                        <th colSpan={2} className="border border-slate-900 py-1 text-teal-600">ភាសាបរទេស</th>
                        <th rowSpan={2} className="border border-slate-900 py-1 w-12">ផ្សេងៗ</th>
                      </tr>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-900 w-8 py-1">ចាស់</th>
                        <th className="border border-slate-900 w-8 py-1">ថ្មី</th>
                        <th className="border border-slate-900 w-8 py-1">ចាស់</th>
                        <th className="border border-slate-900 w-8 py-1">ថ្មី</th>
                        <th className="border border-slate-900 w-8 py-1">ចាស់</th>
                        <th className="border border-slate-900 w-8 py-1">ថ្មី</th>
                        <th className="border border-slate-900 w-8 py-1">ចាស់</th>
                        <th className="border border-slate-900 w-8 py-1">ថ្មី</th>
                        <th className="border border-slate-900 w-8 py-1">ចាស់</th>
                        <th className="border border-slate-900 w-8 py-1">ថ្មី</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chunk.map((student: any, index: number) => (
                        <tr key={student.id} className="text-center h-6">
                          <td className="border border-slate-900">{student.id.startsWith('blank') ? '' : (chunkIndex * MAX_ROWS) + index + 1}</td>
                          <td className="border border-slate-900 text-left px-2 font-moul text-[9px]">{student.name}</td>
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
                      {/* Subtotal / Grand Total row for the last chunk */}
                      {chunkIndex === chunks.length - 1 && (
                        <tr className="text-center h-6 font-bold bg-slate-50">
                          <td colSpan={2} className="border border-slate-900 text-left px-2 font-moul text-[10px]">សរុបរួម</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900">0</td>
                          <td className="border border-slate-900"></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                `;

content = content.replace(tableRegex, tableHTML);

// Replace Footer logic
const footerRegex = /\{\/\* Footer - Only show.*?(?=\s*<\/div>\s*\)\s*:\s*null\})/s;
const footerHTML = `{/* Footer - Only show on the last chunk of the month */}
                {chunkIndex === chunks.length - 1 ? (
                  <div className="flex justify-between items-start text-[11px] font-bold text-slate-900 mt-1">
                    {/* Left: Summary */}
                    <div className="text-left space-y-1">
                      {['ភាសាខ្មែរ', 'គណិតវិទ្យា', 'វិទ្យាសាស្ត្រ', 'សិក្សាសង្គម', 'ភាសាបរទេស'].map(subj => (
                        <div key={subj} className="flex">
                          <span className="w-20 inline-block">{subj}</span>
                          <span className="ml-2">ថ្មី..... ចាស់.....</span>
                        </div>
                      ))}
                    </div>
                    {/* Right: Date & Sign */}
                    <div className="text-center space-y-1 mt-1 ml-4 mr-16">
                      <p>ប្រទង, ថ្ងៃទី០១ ខែ វិច្ឆិកា ឆ្នាំ២០២៥</p>
                      <p className="font-moul pt-2">គ្រូបន្ទុកថ្នាក់</p>
                    </div>
                  </div>`;
content = content.replace(footerRegex, footerHTML);

// Replace period headers in the chunked page
const pageHeaderRegex = /<div className="text-center mb-2">[\s\S]*?<\/div>\s*<div className="flex justify-between items-end mb-1\.5 text-\[11px\] font-bold text-slate-900">[\s\S]*?<\/div>/m;
const newPageHeader = `<div className="text-center mb-6">
                  <h2 className="font-moul text-xl text-slate-900 mb-2">បញ្ជីរាយនាមសិស្សខ្ចីសៀវភៅថ្នាក់ទី {activeClass?.nameKm || '៦ក'}</h2>
                  <p className="font-bold text-sm text-slate-900">សម្រាប់ឆ្នាំសិក្សា {activeClass?.academicYear || '២០២៥-២០២៦'}</p>
                </div>`;
content = content.replace(pageHeaderRegex, newPageHeader);

fs.writeFileSync(file, content, 'utf8');
console.log('Done mapping ScoreBook to BookBorrowingGenerator');
