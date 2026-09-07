import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { TimetableSlot, Subject } from '../../types';
import { 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  RotateCcw, 
  Edit2, 
  Save, 
  BookOpen, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  FileSpreadsheet,
  Building2,
  X
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { STANDARD_PERIOD_TIMES, DAYS_OF_WEEK } from '../../data/calendarScheduleData';

export const SchoolScheduleView: React.FC = () => {
  const { 
    language, 
    classes, 
    activeClassId, 
    setActiveClassId, 
    activeClass, 
    schoolProfile, 
    subjects, 
    timetableSlots, 
    updateTimetableSlot, 
    resetClassTimetable,
    showToast 
  } = useGradebook();

  const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon'>('morning');
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form State for editing slot
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [teacherNameKm, setTeacherNameKm] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [slotNotes, setSlotNotes] = useState<string>('');

  // Filter slots for current active class & shift
  const currentClassSlots = timetableSlots.filter(s => s.classId === activeClassId);

  // Get slot by Day and Period
  const getSlot = (dayNumber: number, periodNumber: number) => {
    return currentClassSlots.find(s => s.dayOfWeek === dayNumber && s.periodNumber === periodNumber);
  };

  // Calculate subject period counts (Workload / ម៉ោងបង្រៀនសរុបប្រចាំសប្តាហ៍)
  const subjectCounts: Record<string, number> = {};
  subjects.forEach(s => { subjectCounts[s.id] = 0; });
  currentClassSlots.forEach(slot => {
    if (slot.subjectId && subjectCounts[slot.subjectId] !== undefined) {
      subjectCounts[slot.subjectId]++;
    }
  });

  const totalPeriodsPerWeek = currentClassSlots.filter(s => s.subjectId).length;

  const openSlotEditor = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSelectedSubjectId(slot.subjectId || subjects[0]?.id || 'sub_khmer');
    setTeacherNameKm(slot.teacherNameKm || activeClass?.teacherNameKm || '');
    setRoomNumber(slot.room || activeClass?.roomNumber || 'បន្ទប់ ០១');
    setSlotNotes(slot.notes || '');
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    updateTimetableSlot(editingSlot.id, {
      subjectId: selectedSubjectId,
      teacherNameKm,
      room: roomNumber,
      notes: slotNotes || undefined,
    });

    setEditingSlot(null);
  };

  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find(s => s.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / MoEYS Schedule Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1.5 shadow-lg shrink-0 flex items-center justify-center border border-white/20">
              <SchoolLogo size={56} customLogoUrl={schoolProfile?.logoUrl} />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-1.5">
                <span>{language === 'km' ? 'កាលវិភាគបង្រៀន និងរៀនស្តង់ដារបឋមសិក្សា (MoEYS)' : 'MoEYS Primary School Standard Timetable'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'km' 
                  ? `កាលវិភាគប្រចាំសប្តាហ៍៖ ${activeClass?.nameKm} (ថ្នាក់ទី ${activeClass?.gradeLevel})` 
                  : `Weekly Timetable: ${activeClass?.name}`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                {language === 'km' 
                  ? `គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherNameKm} • សរុប ${totalPeriodsPerWeek} ម៉ោង/សប្តាហ៍` 
                  : `Teacher: ${activeClass?.teacherName} • Total ${totalPeriodsPerWeek} Periods/Week`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => resetClassTimetable(activeClassId)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs border border-slate-700 transition cursor-pointer"
              title="Reset to 30-period MoEYS curriculum standard"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{language === 'km' ? 'កំណត់តាមស្តង់ដារក្រសួង' : 'Reset Standard'}</span>
            </button>

            <PrintToPdfButton
              pageSize="a4"
              variant="primary"
              size="md"
              labelKm="បោះពុម្ពកាលវិភាគ A4"
              labelEn="Print Timetable A4"
            />
          </div>
        </div>
      </div>

      {/* Class Switcher & Shift Bar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Class Selection Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs font-black text-slate-500 uppercase shrink-0 mr-1">
            {language === 'km' ? 'ជ្រើសរើសថ្នាក់៖' : 'Class:'}
          </span>
          {classes.map(cls => {
            const isActive = cls.id === activeClassId;
            return (
              <button
                key={cls.id}
                onClick={() => setActiveClassId(cls.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20 ring-2 ring-indigo-900/10'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'km' ? cls.nameKm : cls.name}
              </button>
            );
          })}
        </div>

        {/* Shift Selector */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto text-xs font-bold">
          <button
            onClick={() => setSelectedShift('morning')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              selectedShift === 'morning' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {language === 'km' ? 'វេនព្រឹក (០៧:០០ - ១១:០០)' : 'Morning Shift (7:00 - 11:00)'}
          </button>
          <button
            onClick={() => setSelectedShift('afternoon')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              selectedShift === 'afternoon' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {language === 'km' ? 'វេនរសៀល (១៣:០០ - ១៧:០០)' : 'Afternoon Shift (13:00 - 17:00)'}
          </button>
        </div>
      </div>

      {/* Weekly Subject Hours Distribution Summary */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-700" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {language === 'km' ? 'បន្ទុកម៉ោងបង្រៀនតាមមុខវិជ្ជា (MoEYS Standard: ៣០ ម៉ោង/សប្តាហ៍)' : 'Weekly Subject Hours Distribution (Standard: 30 hrs/week)'}
            </h3>
          </div>
          <span className="text-xs font-extrabold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            {language === 'km' ? `សរុប៖ ${totalPeriodsPerWeek} ម៉ោង` : `Total: ${totalPeriodsPerWeek} Hours`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {subjects.map(sub => {
            const count = subjectCounts[sub.id] || 0;
            return (
              <div 
                key={sub.id} 
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                  <span className="text-[11px] font-bold text-slate-800 truncate" title={language === 'km' ? sub.nameKm : sub.nameEn}>
                    {language === 'km' ? sub.nameKm : sub.nameEn}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-950">{count}</span>
                  <span className="text-[10px] text-slate-500 font-semibold ml-0.5">
                    {language === 'km' ? 'ម៉ោង' : 'h'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Timetable Matrix View (Printable on A4) */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-sm p-6 sm:p-8 text-slate-900 print:border-none print:shadow-none print:p-2">
        {/* Printable Official Header */}
        <div className="text-center pb-5 border-b-2 border-slate-900 mb-6">
          <div className="flex justify-between items-start text-xs font-semibold text-slate-800 mb-2">
            <div className="text-left flex items-center space-x-3">
              <SchoolLogo size={46} customLogoUrl={schoolProfile?.logoUrl} />
              <div>
                <p className="font-extrabold uppercase text-slate-950">{activeClass?.schoolNameKm}</p>
                <p className="text-slate-600 font-bold text-[11px]">
                  {language === 'km' ? `ថ្នាក់ទី ${activeClass?.gradeLevel} (${activeClass?.nameKm})` : `Grade ${activeClass?.gradeLevel} (${activeClass?.name})`}
                </p>
                <p className="text-slate-500 text-[10px]">
                  {language === 'km' ? `គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherNameKm}` : `Class Teacher: ${activeClass?.teacherName}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900 text-xs">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="text-slate-600 font-bold text-[11px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <p className="text-[11px] text-amber-700 tracking-widest font-serif select-none leading-none mt-0.5">❖ ❖ ❖</p>
            </div>
          </div>

          <h2 className="font-heading font-black text-lg sm:text-2xl text-slate-950 uppercase tracking-wide mt-2">
            {language === 'km' ? 'កាលវិភាគបង្រៀន និងរៀនប្រចាំសប្តាហ៍' : 'WEEKLY TEACHING & LEARNING TIMETABLE'}
          </h2>
          <p className="text-xs font-bold text-indigo-900 mt-1 uppercase">
            {language === 'km' 
              ? `វេនព្រឹក (០៧:០០ - ១១:០០) • ឆ្នាំសិក្សា ${activeClass?.academicYear}` 
              : `Morning Shift (07:00 - 11:00) • Academic Year ${activeClass?.academicYear}`}
          </p>
        </div>

        {/* Timetable Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase text-xs">
                <th className="border border-slate-700 py-3 px-2 w-28">
                  {language === 'km' ? 'ម៉ោងសិក្សា' : 'Period / Time'}
                </th>
                {DAYS_OF_WEEK.map(d => (
                  <th key={d.dayNumber} className="border border-slate-700 py-3 px-2">
                    <p className="text-xs sm:text-sm">{language === 'km' ? d.nameKm : d.nameEn}</p>
                    <span className="text-[10px] font-normal text-slate-300">
                      {language === 'km' ? d.shortKm : d.shortEn}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STANDARD_PERIOD_TIMES.map((periodDef, idx) => {
                if (periodDef.isBreak) {
                  return (
                    <tr key={`break-${idx}`} className="bg-amber-100/70 font-black text-amber-900 border-y-2 border-slate-900">
                      <td className="border border-slate-400 py-1.5 text-[11px] font-mono">
                        {periodDef.startTime} - {periodDef.endTime}
                      </td>
                      <td colSpan={6} className="border border-slate-400 py-1.5 uppercase text-xs tracking-widest">
                        {language === 'km' ? '*** ម៉ោងចេញលេង និងសម្រាក (RECESS / BREAK - ១៥ នាទី) ***' : '*** RECESS / BREAK (15 MINS) ***'}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`period-${periodDef.period}`} className="hover:bg-slate-50 transition">
                    {/* Time Column */}
                    <td className="border border-slate-400 py-3 px-2 bg-slate-100/80 font-bold text-slate-800">
                      <p className="font-black text-xs text-indigo-950">{language === 'km' ? `ម៉ោងទី ${periodDef.period}` : `Period ${periodDef.period}`}</p>
                      <p className="text-[10px] font-mono text-slate-600 mt-0.5">{periodDef.startTime} - {periodDef.endTime}</p>
                    </td>

                    {/* 6 Day Columns */}
                    {DAYS_OF_WEEK.map(d => {
                      const slot = getSlot(d.dayNumber, periodDef.period);
                      const sub = slot?.subjectId ? getSubjectById(slot.subjectId) : undefined;

                      return (
                        <td 
                          key={`cell-${d.dayNumber}-${periodDef.period}`} 
                          onClick={() => slot && openSlotEditor(slot)}
                          className="border border-slate-400 p-2 sm:p-2.5 align-middle cursor-pointer hover:bg-indigo-50/60 transition group relative"
                        >
                          {sub ? (
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span 
                                className="px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-2xs w-full block truncate"
                                style={{ backgroundColor: sub.color }}
                              >
                                {language === 'km' ? sub.nameKm : sub.nameEn}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-600 truncate block">
                                {slot?.teacherNameKm || activeClass?.teacherNameKm}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              {language === 'km' ? 'ទំនេរ' : 'Free'}
                            </span>
                          )}

                          {/* Hover Edit Icon */}
                          <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition">
                            <Edit2 className="w-3 h-3" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Sign-Off Footer */}
        <div className="grid grid-cols-2 pt-10 mt-6 text-xs text-slate-900 border-t border-slate-300">
          <div className="text-center space-y-1">
            <p className="font-bold">{language === 'km' ? 'បានឃើញ និងអនុម័ត' : 'Seen and Approved'}</p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'នាយកសាលា' : 'School Principal'}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា និងត្រា)</span>
            </div>
            <p className="font-extrabold text-slate-900">ហ៊ឹម ម៉ាលីកា</p>
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-600">
              {language === 'km' ? 'ធ្វើនៅសាលាបឋមសិក្សា, ថ្ងៃទី០១ ខែធ្នូ ឆ្នាំ២០២៥' : 'Issued on Dec 01, 2025'}
            </p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Class Teacher'}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 italic">(ហត្ថលេខា)</span>
            </div>
            <p className="font-extrabold text-slate-900">{activeClass?.teacherNameKm || activeClass?.teacherName}</p>
          </div>
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-extrabold text-sm sm:text-base">
                  {language === 'km' 
                    ? `កែប្រែកាលវិភាគ៖ ថ្ងៃ${DAYS_OF_WEEK.find(d => d.dayNumber === editingSlot.dayOfWeek)?.nameKm} ម៉ោងទី ${editingSlot.periodNumber}` 
                    : `Edit Timetable Slot (Day ${editingSlot.dayOfWeek}, Period ${editingSlot.periodNumber})`}
                </h3>
              </div>
              <button 
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-6 space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'មុខវិជ្ជា' : 'Subject'} *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {language === 'km' ? s.nameKm : s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'គ្រូបង្រៀន' : 'Teacher Name'}
                </label>
                <input
                  type="text"
                  value={teacherNameKm}
                  onChange={(e) => setTeacherNameKm(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'ចំណាំ / បរិយាយមេរៀន (Optional)' : 'Notes / Lesson description'}
                </label>
                <input
                  type="text"
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  placeholder="ឧ. អនុវត្តលំហាត់ជាក់ស្តែង..."
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  {language === 'km' ? 'រក្សាទុក' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
