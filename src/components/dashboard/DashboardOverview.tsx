import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Users, 
  BookOpen, 
  Award, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  PlusCircle, 
  FileText, 
  Trophy,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Camera,
  Crown,
  Medal,
  Star
} from 'lucide-react';
import { calculateYearlySummaries, calculatePeriodRankings } from '../../utils/calculations';
import { StudentPhotoModal } from '../common/StudentPhotoModal';
import { Student } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { 
    language, 
    activeClass, 
    classStudents, 
    classes, 
    subjects, 
    periods, 
    scoresMatrix, 
    weights, 
    gradeScales, 
    setActiveTab, 
    setSelectedStudentId 
  } = useGradebook();

  const [photoModalStudent, setPhotoModalStudent] = useState<{ student: Student; rank?: number } | null>(null);

  const yearlySummaries = calculateYearlySummaries(
    classStudents,
    periods,
    subjects,
    scoresMatrix,
    weights,
    gradeScales
  );

  const currentPeriod = periods[0] || { id: 'month_dec', nameEn: 'December', nameKm: 'ខែធ្នូ' };
  const currentPeriodRankings = calculatePeriodRankings(
    classStudents,
    currentPeriod.id,
    subjects,
    scoresMatrix,
    weights
  );

  // Key Metrics
  const totalStudents = classStudents.length;
  const maleStudents = classStudents.filter(s => s.gender === 'Male').length;
  const femaleStudents = classStudents.filter(s => s.gender === 'Female').length;

  const totalAttSum = classStudents.reduce((acc, s) => {
    const present = s.attendanceCount?.present ?? 0;
    const excused = s.attendanceCount?.absentExcused ?? 0;
    const unexcused = s.attendanceCount?.absentUnexcused ?? 0;
    const tot = present + excused + unexcused;
    return acc + (tot > 0 ? (present / tot) * 100 : 100);
  }, 0);
  const avgAttendance = totalStudents > 0 ? Number((totalAttSum / totalStudents).toFixed(1)) : 100;

  const totalGpaSum = yearlySummaries.reduce((acc, s) => acc + s.yearlyAverage, 0);
  const classAvgGPA = totalStudents > 0 ? Number((totalGpaSum / totalStudents).toFixed(2)) : 0;
  const passCount = yearlySummaries.filter(s => s.passed).length;
  const passRate = totalStudents > 0 ? Number(((passCount / totalStudents) * 100).toFixed(0)) : 100;

  // Grade Distribution
  const gradeDistribution = gradeScales.map(scale => {
    const count = yearlySummaries.filter(s => s.letterGrade === scale.grade).length;
    return {
      name: scale.grade,
      label: language === 'km' ? scale.labelKm : scale.labelEn,
      count,
      color: scale.color,
    };
  });

  // Subject Performance Average
  const subjectAverages = subjects.map(subj => {
    let sum = 0;
    let count = 0;
    for (const student of classStudents) {
      for (const p of periods) {
        const entry = scoresMatrix[student.id]?.[p.id]?.[subj.id];
        if (entry) {
          const val = entry.rawScore ?? entry.homework ?? 0;
          sum += val;
          count++;
        }
      }
    }
    const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    return {
      name: language === 'km' ? subj.nameKm : subj.nameEn,
      code: subj.code,
      average: avg,
      color: subj.color,
    };
  });

  // Monthly Progression Trend
  const monthlyTrends = periods.map(period => {
    const rankings = calculatePeriodRankings(classStudents, period.id, subjects, scoresMatrix, weights);
    const avgScore = rankings.reduce((acc, r) => acc + r.average, 0) / (rankings.length || 1);
    return {
      period: language === 'km' ? period.nameKm.split(' ')[0] : period.nameEn.split(' ')[0],
      average: Number(avgScore.toFixed(2)),
    };
  });

  // Top 5 Students
  const topStudents = yearlySummaries.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Teacher Instruction / Deadline Alert Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 text-amber-950 shadow-2xs">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm leading-relaxed">
          <span className="font-black uppercase tracking-wider text-amber-900 mr-1.5">
            {language === 'km' ? 'សេចក្តីជូនដំណឹងគ្រូបន្ទុក៖' : 'OFFICIAL TEACHER NOTICE:'}
          </span>
          <span className="font-semibold text-amber-900/90">
            {language === 'km' 
              ? 'សូមលោកគ្រូ-អ្នកគ្រូបញ្ចូលពិន្ទុឱ្យបានមុនថ្ងៃទី២០ ជារៀងរាល់ខែ សម្រាប់តារាងចំ.ថ្នាក់ និងតារាងកិត្តិយស។'
              : 'Please enter continuous assessment scores before the 20th of each month for monthly ranking and honor rolls.'}
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {language === 'km' ? 'សិស្សសរុប' : 'TOTAL STUDENTS'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">{totalStudents}</span>
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">{language === 'km' ? 'នាក់' : 'ENROLLED'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>{language === 'km' ? `ប្រុស: ${maleStudents}` : `BOYS: ${maleStudents}`}</span>
            <span className="text-slate-300">•</span>
            <span>{language === 'km' ? `ស្រី: ${femaleStudents}` : `GIRLS: ${femaleStudents}`}</span>
          </div>
        </div>

        {/* Card 2: Active Class & Room */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {language === 'km' ? 'ថ្នាក់បច្ចុប្បន្ន' : 'CURRENT CLASS'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-black text-indigo-900 font-heading tracking-tight">
                  {language === 'km' ? activeClass?.nameKm : activeClass?.name}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>{language === 'km' ? `គ្រូបន្ទុក៖ ${activeClass?.teacherNameKm}` : `Teacher: ${activeClass?.teacherName}`}</span>
            <span className="text-slate-300">•</span>
            <span>{classes.length} {language === 'km' ? 'ថ្នាក់សរុប' : 'CLASSES'}</span>
          </div>
        </div>

        {/* Card 3: Average Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {language === 'km' ? 'វត្តមានមធ្យម' : 'AVG ATTENDANCE'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-heading tracking-tight">{avgAttendance}%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, avgAttendance)}%` }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-700 font-extrabold uppercase tracking-wider">
            <span>{language === 'km' ? 'វត្តមានទៀងទាត់ល្អ' : 'EXCELLENT CONSISTENCY'}</span>
          </div>
        </div>

        {/* Card 4: Class Overall GPA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {language === 'km' ? 'មធ្យមភាគថ្នាក់' : 'OVERALL CLASS AVG'}
              </p>
              <div className="flex items-baseline space-x-2 mt-1.5">
                <span className="text-3xl sm:text-4xl font-black text-amber-600 font-heading tracking-tight">{classAvgGPA}</span>
                <span className="text-xs text-slate-400 font-extrabold">/ 10</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (classAvgGPA / 10) * 100)}%` }}></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>{language === 'km' ? `ជាប់: ${passRate}%` : `PASS: ${passRate}%`}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-black">{yearlySummaries[0]?.student.name} (TOP 1)</span>
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
          {language === 'km' ? 'សកម្មភាពរហ័ស' : 'QUICK ACTIONS & TOOLS'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('scoring')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-indigo-900">
              {language === 'km' ? 'បញ្ចូលពិន្ទុ' : 'Input Scores'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-cyan-600 hover:bg-cyan-50/50 transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-cyan-900">
              {language === 'km' ? 'ប្រតិទិនសាលា' : 'Calendar'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-purple-900">
              {language === 'km' ? 'កាលវិភាគបង្រៀន' : 'Timetable'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-blue-900">
              {language === 'km' ? 'កម្មវិធីសិក្សា' : 'Curriculum'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-amber-800">
              {language === 'km' ? 'តារាងកិត្តិយស' : 'Honor Roll'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('report_card')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-emerald-800">
              {language === 'km' ? 'សៀវភៅតាមដាន' : 'Reports'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-blue-800">
              {language === 'km' ? 'គ្រប់គ្រងបញ្ជីសិស្ស' : 'Manage Students'}
            </span>
          </button>
        </div>
      </div>

      {/* Top Academic Achievers Podium - All 5 Students */}
      <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/15">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-heading font-black text-base sm:text-lg uppercase tracking-wider">
              {language === 'km' ? 'សិស្សឆ្នើមប្រចាំថ្នាក់ (Top 5 Academic Achievers)' : 'Top 5 Academic Achievers'}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('rankings')}
            className="text-xs font-black uppercase tracking-wider text-indigo-200 hover:text-white flex items-center space-x-1.5 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            <span>{language === 'km' ? 'មើលតារាងកិត្តិយសពេញលេញ' : 'View Full Honor Roll'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {topStudents.map((item, idx) => {
            const colors = [
              { bg: 'bg-amber-400/10 hover:bg-amber-400/20', border: 'border-amber-400/40', badge: 'bg-amber-400 text-amber-950 font-black', rankText: language === 'km' ? 'លេខ ១' : 'RANK 1', ring: 'ring-amber-400' },
              { bg: 'bg-slate-300/10 hover:bg-slate-300/20', border: 'border-slate-300/40', badge: 'bg-slate-300 text-slate-950 font-black', rankText: language === 'km' ? 'លេខ ២' : 'RANK 2', ring: 'ring-slate-300' },
              { bg: 'bg-amber-600/10 hover:bg-amber-600/20', border: 'border-amber-600/40', badge: 'bg-amber-600 text-white font-black', rankText: language === 'km' ? 'លេខ ៣' : 'RANK 3', ring: 'ring-amber-600' },
              { bg: 'bg-indigo-500/10 hover:bg-indigo-500/20', border: 'border-indigo-400/30', badge: 'bg-indigo-400 text-indigo-950 font-black', rankText: language === 'km' ? 'លេខ ៤' : 'RANK 4', ring: 'ring-indigo-400' },
              { bg: 'bg-indigo-500/10 hover:bg-indigo-500/20', border: 'border-indigo-400/30', badge: 'bg-indigo-400 text-indigo-950 font-black', rankText: language === 'km' ? 'លេខ ៥' : 'RANK 5', ring: 'ring-indigo-400' },
            ];
            const cfg = colors[idx] || colors[4];

            return (
              <div
                key={item.student.id}
                className={`${cfg.bg} border ${cfg.border} rounded-2xl p-3.5 flex flex-col justify-between relative transition hover:scale-[1.02] shadow-sm`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${cfg.badge}`}>
                    #{idx + 1} {cfg.rankText}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalStudent({ student: item.student, rank: idx + 1 });
                    }}
                    title={language === 'km' ? 'បញ្ចូល ឬប្ដូររូបថត' : 'Upload or change photo'}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Avatar / Photo */}
                <div 
                  onClick={() => {
                    setSelectedStudentId(item.student.id);
                    setActiveTab('report_card');
                  }}
                  className="cursor-pointer text-center my-1"
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    {item.student.photoUrl ? (
                      <img 
                        src={item.student.photoUrl} 
                        alt={item.student.name}
                        className={`w-16 h-16 rounded-full object-cover shadow-md border-2 border-white/20 ring-2 ${cfg.ring}`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full bg-slate-900 border-2 border-white/20 ring-2 ${cfg.ring} flex items-center justify-center text-lg font-black font-heading text-white shadow-md`}>
                        {item.student.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="text-sm font-black truncate text-white tracking-tight" title={item.student.name}>
                    {item.student.name}
                  </div>
                  <div className="text-[11px] font-medium text-indigo-200 truncate">
                    អត្តលេខ៖ {item.student.studentId}
                  </div>
                </div>

                {/* Scores & Badge */}
                <div 
                  onClick={() => {
                    setSelectedStudentId(item.student.id);
                    setActiveTab('report_card');
                  }}
                  className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-black text-emerald-400 font-mono">{item.yearlyAverage} / 10</span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/15 text-slate-200">
                    {language === 'km' ? `និទ្ទេស ${item.letterGrade}` : `Grade ${item.letterGrade}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Subject Performance Averages */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              មធ្យមភាគតាមមុខវិជ្ជា
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              ពិន្ទុពេញ៖ ១០
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} interval={0} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} / 10`, 'Average']}
                  labelFormatter={(code) => {
                    const item = subjectAverages.find(s => s.code === code);
                    return item ? item.name : code;
                  }}
                />
                <Bar dataKey="average" fill="#312e81" radius={[6, 6, 0, 0]}>
                  {subjectAverages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#312e81'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Class Progress Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              និន្នាការមធ្យមភាគប្រចាំខែ
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              ឆមាសទី១ & ឆមាសទី២
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis domain={[5, 10]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip formatter={(value: any) => [`${value} / 10`, 'Class Average']} />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#312e81" 
                  strokeWidth={3.5} 
                  dot={{ r: 5, fill: '#312e81' }} 
                  activeDot={{ r: 7 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Student Photo Modal */}
      {photoModalStudent && (
        <StudentPhotoModal
          student={photoModalStudent.student}
          rank={photoModalStudent.rank}
          isOpen={!!photoModalStudent}
          onClose={() => setPhotoModalStudent(null)}
        />
      )}

    </div>
  );
};
