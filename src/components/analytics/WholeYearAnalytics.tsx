import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  TrendingUp, 
  Award, 
  Printer, 
  Download, 
  BarChart3, 
  PieChart as PieIcon, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { calculateYearlySummaries } from '../../utils/calculations';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export const WholeYearAnalytics: React.FC = () => {
  const {
    language,
    activeClass,
    classStudents,
    subjects,
    periods,
    scoresMatrix,
    weights,
    competencyWeights,
    gradeScales,
    setSelectedStudentId,
    setActiveTab,
  } = useGradebook();

  const [filterRank, setFilterRank] = useState<'All' | 'Honors' | 'Passed' | 'Failed'>('All');

  const yearlySummaries = calculateYearlySummaries(
    classStudents,
    periods,
    subjects,
    scoresMatrix,
    weights,
    gradeScales,
    competencyWeights
  );

  const filteredSummaries = yearlySummaries.filter(s => {
    if (filterRank === 'Honors') return s.yearlyAverage >= 7.5;
    if (filterRank === 'Passed') return s.passed;
    if (filterRank === 'Failed') return !s.passed;
    return true;
  });

  const totalPassed = yearlySummaries.filter(s => s.passed).length;
  const totalFailed = yearlySummaries.filter(s => !s.passed).length;
  const passPercentage = yearlySummaries.length > 0 ? ((totalPassed / yearlySummaries.length) * 100).toFixed(0) : '100';

  // Grade breakdown count
  const gradeCounts = gradeScales.map(g => ({
    grade: g.grade,
    label: language === 'km' ? `និទ្ទេស ${g.grade}` : `Grade ${g.grade}`,
    count: yearlySummaries.filter(s => s.letterGrade === g.grade).length,
    color: g.color,
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleExportYearlyCSV = () => {
    const headers = ['Yearly Rank', 'Student ID', 'Student Name', 'Gender', 'Semester 1 Avg', 'Sem 1 Rank', 'Semester 2 Avg', 'Sem 2 Rank', 'Yearly Avg', 'Grade', 'Classification', 'Result', 'Attendance %'];
    const rows = yearlySummaries.map(s => [
      s.yearlyRank,
      s.student.studentId,
      `"${s.student.name} (${s.student.nameLatin || ''})"`,
      s.student.gender,
      s.term1Average.toFixed(2),
      s.term1Rank,
      s.term2Average.toFixed(2),
      s.term2Rank,
      s.yearlyAverage.toFixed(2),
      s.letterGrade,
      `"${s.gradeLabelKm}"`,
      s.passed ? 'PASSED' : 'FAILED',
      `${s.attendanceRate}%`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Yearly_Results_${activeClass?.name || 'Class'}_${activeClass?.academicYear || '2026'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Controls */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>
                {language === 'km' 
                  ? 'លទ្ធផលប្រឡង & ការវាយតម្លៃប្រចាំឆ្នាំ (Whole-Year Academic Summary)' 
                  : 'Whole-Year Consolidated Results & Performance Analytics'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'km'
                ? `បូកសរុបលទ្ធផលឆមាសទី១ និងឆមាសទី២ ថ្នាក់ទី ${activeClass?.gradeLevel} (${activeClass?.nameKm})`
                : `Consolidation of Semester 1 & Semester 2 results for ${activeClass?.name}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <PrintToPdfButton
              targetElementId="yearly-rankings-print-container"
              documentTitle={`MoEYS_${activeClass?.nameKm || 'Class'}_Annual_Results_Rankings_${activeClass?.academicYear || '2026'}`}
              pageSize="a4"
              orientation="landscape"
              variant="primary"
              size="sm"
              labelKm="ទាញយកជា PDF (A4)"
              labelEn="Export to PDF (A4)"
            />

            <button
              onClick={handleExportYearlyCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? 'ទាញយក CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">
            {language === 'km' ? 'តម្រង៖' : 'Filter:'}
          </span>
          {(['All', 'Honors', 'Passed', 'Failed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterRank(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterRank === f
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'All' ? (language === 'km' ? 'សិស្សទាំងអស់' : 'All Students') :
               f === 'Honors' ? (language === 'km' ? '⭐ តារាងកិត្តិយស (≥7.5)' : '⭐ Honors (≥7.5)') :
               f === 'Passed' ? (language === 'km' ? `✅ ជាប់ (${totalPassed})` : `✅ Passed (${totalPassed})`) :
               (language === 'km' ? `❌ ធ្លាក់ (${totalFailed})` : `❌ Failed (${totalFailed})`)}
            </button>
          ))}
        </div>
      </div>

      {/* Grade Distribution Bar Visualizer */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
            {language === 'km' ? 'ការបែងចែកនិទ្ទេសសរុប (Yearly Grade Distribution)' : 'Yearly Grade Distribution'}
          </h3>
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {language === 'km' ? `អត្រាជាប់៖ ${passPercentage}%` : `Pass Rate: ${passPercentage}%`}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {gradeCounts.map(g => (
            <div key={g.grade} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-center">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-black text-white" style={{ backgroundColor: g.color }}>
                {g.grade}
              </span>
              <div className="text-xl font-bold font-heading text-slate-900 mt-2">{g.count}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{g.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consolidated Master Table */}
      <div 
        id="yearly-rankings-print-container"
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none printable-area text-slate-900"
      >
        
        {/* Document Header for Official School Printing */}
        <div className="text-center pb-6 border-b-2 border-slate-900/80 mb-6">
          <div className="flex justify-between items-start text-left text-xs font-semibold text-slate-700 mb-2">
            <div>
              <p className="font-bold text-slate-900 uppercase">
                {language === 'km' ? activeClass?.schoolNameKm : activeClass?.schoolName}
              </p>
              <p>{language === 'km' ? `ថ្នាក់ទី ${activeClass?.gradeLevel} (${activeClass?.nameKm})` : `Class: ${activeClass?.name}`}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">
                {language === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'Kingdom of Cambodia'}
              </p>
              <p className="text-slate-500">
                {language === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'Nation Religion King'}
              </p>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 uppercase tracking-wide">
            {language === 'km' ? 'តារាងបូកសរុបលទ្ធផលសិក្សាប្រចាំឆ្នាំ' : 'ANNUAL ACADEMIC RESULTS CONSOLIDATION'}
          </h1>
          <p className="font-semibold text-indigo-800 text-sm mt-1">
            {language === 'km' 
              ? `ឆ្នាំសិក្សា ${activeClass?.academicYear} • គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherNameKm}` 
              : `Academic Year ${activeClass?.academicYear} • Teacher: ${activeClass?.teacherName}`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center w-12">{language === 'km' ? 'ល.រ' : 'Rank'}</th>
                <th className="py-3 px-3 w-28">{language === 'km' ? 'អត្តលេខ' : 'Student ID'}</th>
                <th className="py-3 px-4">{language === 'km' ? 'គោត្តនាម និងនាម' : 'Student Name'}</th>
                <th className="py-3 px-2 text-center w-12">{language === 'km' ? 'ភេទ' : 'Gender'}</th>
                <th className="py-3 px-3 text-center bg-slate-800">{language === 'km' ? 'ឆមាសទី ១' : 'Sem 1 Avg'}</th>
                <th className="py-3 px-2 text-center bg-slate-800">{language === 'km' ? 'ចំ.ឆ១' : 'Rank 1'}</th>
                <th className="py-3 px-3 text-center bg-slate-800">{language === 'km' ? 'ឆមាសទី ២' : 'Sem 2 Avg'}</th>
                <th className="py-3 px-2 text-center bg-slate-800">{language === 'km' ? 'ចំ.ឆ២' : 'Rank 2'}</th>
                <th className="py-3 px-4 text-center bg-indigo-900">{language === 'km' ? 'មធ្យមភាគឆ្នាំ' : 'Yearly Avg'}</th>
                <th className="py-3 px-3 text-center">{language === 'km' ? 'និទ្ទេស' : 'Grade'}</th>
                <th className="py-3 px-3 text-center">{language === 'km' ? 'វត្តមាន' : 'Att %'}</th>
                <th className="py-3 px-3 text-center">{language === 'km' ? 'លទ្ធផល' : 'Decision'}</th>
                <th className="py-3 px-3 text-right no-print">{language === 'km' ? 'សកម្មភាព' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.map((item) => {
                const isTop3 = item.yearlyRank <= 3;
                const trend = item.term2Average - item.term1Average;

                return (
                  <tr key={item.student.id} className={`hover:bg-slate-50 transition ${isTop3 ? 'bg-amber-50/20' : ''}`}>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center font-black text-xs w-6 h-6 rounded-full ${
                        item.yearlyRank === 1 ? 'bg-amber-400 text-amber-950 font-black shadow-xs' :
                        item.yearlyRank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                        item.yearlyRank === 3 ? 'bg-amber-600 text-white font-black' :
                        'text-slate-600'
                      }`}>
                        {item.yearlyRank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700 text-xs">{item.student.studentId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.student.name}</div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs font-bold ${item.student.gender === 'Female' ? 'text-pink-600' : 'text-blue-600'}`}>
                        {item.student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                      </span>
                    </td>
                    
                    {/* Sem 1 */}
                    <td className="py-3 px-3 text-center font-semibold text-slate-700 bg-slate-50/50">
                      {item.term1Average.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-slate-500 bg-slate-50/50">
                      #{item.term1Rank}
                    </td>

                    {/* Sem 2 with trend indicator */}
                    <td className="py-3 px-3 text-center font-semibold text-slate-700 bg-slate-50/50">
                      <div className="flex items-center justify-center space-x-1">
                        <span>{item.term2Average.toFixed(2)}</span>
                        {trend > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        ) : trend < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-slate-500 bg-slate-50/50">
                      #{item.term2Rank}
                    </td>

                    {/* Consolidated Yearly Average */}
                    <td className="py-3 px-4 text-center bg-indigo-50/60">
                      <span className="text-sm sm:text-base font-black text-indigo-700">
                        {item.yearlyAverage.toFixed(2)}
                      </span>
                    </td>

                    {/* Letter Grade */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-black text-white" style={{
                        backgroundColor: gradeScales.find(g => g.grade === item.letterGrade)?.color || '#4f46e5'
                      }}>
                        {item.letterGrade}
                      </span>
                    </td>

                    {/* Attendance % */}
                    <td className="py-3 px-3 text-center text-xs font-medium text-slate-600">
                      {item.attendanceRate}%
                    </td>

                    {/* Pass / Promotion Decision */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        item.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.passed 
                          ? (language === 'km' ? 'ឡើងថ្នាក់' : 'Promoted') 
                          : (language === 'km' ? 'ត្រួតថ្នាក់' : 'Retained')}
                      </span>
                    </td>

                    {/* Quick Report Link */}
                    <td className="py-3 px-3 text-right no-print">
                      <button
                        onClick={() => {
                          setSelectedStudentId(item.student.id);
                          setActiveTab('report_card');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        {language === 'km' ? 'សន្លឹកលទ្ធផល' : 'Report'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures */}
        <div className="mt-12 pt-6 grid grid-cols-2 text-center text-xs text-slate-700 page-break-inside-avoid">
          <div>
            <p className="font-bold text-slate-900 uppercase">
              {language === 'km' ? 'បានឃើញ និងឯកភាព' : 'Approved By'}
            </p>
            <p className="font-semibold">{language === 'km' ? 'នាយកសាលា' : 'Principal'}</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-400">{language === 'km' ? '(ហត្ថលេខា និងត្រា)' : '(Signature & Stamp)'}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-600">
              {language === 'km' ? 'ថ្ងៃទី២៥ ខែសីហា ឆ្នាំ២០២៦' : '25-August-2026'}
            </p>
            <p className="font-bold text-slate-900 uppercase">
              {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}
            </p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900">
              {language === 'km' ? activeClass?.teacherNameKm : activeClass?.teacherName}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
