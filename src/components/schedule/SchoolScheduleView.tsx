import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { TimetableSlot, Subject } from '../../types';
import { 
  Clock, 
  Calendar, 
  User, 
  RotateCcw, 
  Edit2, 
  BookOpen, 
  Info, 
  X,
  FileCheck2,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { 
  STANDARD_PERIOD_TIMES_MORNING, 
  STANDARD_PERIOD_TIMES_AFTERNOON, 
  DAYS_OF_WEEK,
  TIMETABLE_SUBJECTS_META,
  OFFICIAL_TIMETABLE_METADATA
} from '../../data/calendarScheduleData';

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
  const [slotSubTopicKm, setSlotSubTopicKm] = useState<string>('');
  const [slotCustomTitleKm, setSlotCustomTitleKm] = useState<string>('');
  const [teacherNameKm, setTeacherNameKm] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [slotNotes, setSlotNotes] = useState<string>('');

  const gradeLevel = activeClass?.gradeLevel || 6;
  const isLowerGrade = gradeLevel <= 3;

  // Filter slots for current active class & selected shift
  const currentClassSlots = timetableSlots.filter(
    s => s.classId === activeClassId && (s.shift === selectedShift || (!s.shift && selectedShift === 'morning'))
  );

  // Active period configuration depending on shift
  const periodTimes = selectedShift === 'morning' 
    ? STANDARD_PERIOD_TIMES_MORNING 
    : STANDARD_PERIOD_TIMES_AFTERNOON;

  // Get slot by Day and Period
  const getSlot = (dayNumber: number, periodNumber: number) => {
    return currentClassSlots.find(s => s.dayOfWeek === dayNumber && s.periodNumber === periodNumber);
  };

  // Resolve subject meta details (names, color, badge)
  const getSubjectMeta = (subjectId: string) => {
    if (!subjectId) return null;
    if (TIMETABLE_SUBJECTS_META[subjectId]) {
      return TIMETABLE_SUBJECTS_META[subjectId];
    }
    const found = subjects.find(s => s.id === subjectId);
    if (found) {
      return {
        nameKm: found.nameKm,
        nameEn: found.nameEn,
        color: found.color,
        shortKm: found.code || found.nameKm
      };
    }
    return null;
  };

  // Calculate subject period counts (Workload / ម៉ោងបង្រៀនសរុបប្រចាំសប្តាហ៍)
  const subjectCounts: Record<string, number> = {};
  subjects.forEach(s => { subjectCounts[s.id] = 0; });
  currentClassSlots.forEach(slot => {
    if (slot.subjectId && subjectCounts[slot.subjectId] !== undefined) {
      subjectCounts[slot.subjectId]++;
    }
  });

  const totalPeriodsPerWeek = currentClassSlots.filter(s => s.subjectId && s.periodNumber >= 1 && s.periodNumber <= 5).length;

  const openSlotEditor = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSelectedSubjectId(slot.subjectId || 'sub_khmer');
    setSlotSubTopicKm(slot.subTopicKm || '');
    setSlotCustomTitleKm(slot.customTitleKm || '');
    setTeacherNameKm(slot.teacherNameKm || activeClass?.teacherNameKm || '');
    setRoomNumber(slot.room || activeClass?.roomNumber || 'បន្ទប់ ០៤');
    setSlotNotes(slot.notes || '');
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    updateTimetableSlot(editingSlot.id, {
      subjectId: selectedSubjectId,
      subTopicKm: slotSubTopicKm || undefined,
      customTitleKm: slotCustomTitleKm || undefined,
      teacherNameKm,
      room: roomNumber,
      notes: slotNotes || undefined,
    });

    setEditingSlot(null);
  };

  const activeNotesList = isLowerGrade 
    ? OFFICIAL_TIMETABLE_METADATA.notesGrade1to3Km 
    : OFFICIAL_TIMETABLE_METADATA.notesGrade4to6Km;

  return (
    <div className="space-y-6">
      {/* Top Banner / MoEYS Schedule Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1.5 shadow-lg shrink-0 flex items-center justify-center border border-white/20">
              <SchoolLogo size={56} customLogoUrl={schoolProfile?.logoUrl} />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {language === 'km' 
                    ? `កាលវិភាគផ្លូវការ MoEYS ${isLowerGrade ? 'ថ្នាក់ទី១-ទី៣' : 'ថ្នាក់ទី៤-ទី៦'} (សេចក្តីណែនាំលេខ ៤១)` 
                    : `MoEYS Standard Timetable ${isLowerGrade ? 'Grades 1-3' : 'Grades 4-6'}`}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'km' 
                  ? `កាលវិភាគប្រចាំសប្តាហ៍៖ ${activeClass?.nameKm} (ថ្នាក់ទី ${activeClass?.gradeLevel})` 
                  : `Weekly Timetable: ${activeClass?.name}`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                {language === 'km' 
                  ? `សាលាបឋមសិក្សា ហ៊ុន ណេង ប្រទង • គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherNameKm || activeClass?.teacherName} • រូបមន្តចេញលេង ២+១+២` 
                  : `Hun Neng Pratong Primary School • Teacher: ${activeClass?.teacherNameKm || activeClass?.teacherName} • 2+1+2 Recess Formula`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => resetClassTimetable(activeClassId)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs border border-slate-700 transition cursor-pointer"
              title="កំណត់កាលវិភាគថ្នាក់នេះឡើងវិញតាមគំរូផ្លូវការក្រសួង"
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
            const isClsLower = cls.gradeLevel <= 3;
            return (
              <button
                key={cls.id}
                onClick={() => setActiveClassId(cls.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-indigo-950 text-white shadow-md shadow-indigo-950/20 ring-2 ring-indigo-950/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{language === 'km' ? cls.nameKm : cls.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isClsLower ? (language === 'km' ? 'ថ្នាក់១-៣' : 'G1-3') : (language === 'km' ? 'ថ្នាក់៤-៦' : 'G4-6')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shift Selector */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto text-xs font-bold">
          <button
            onClick={() => setSelectedShift('morning')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              selectedShift === 'morning' ? 'bg-white text-indigo-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'km' ? 'ពេលព្រឹក (០៦:៥៥ - ១១:០០)' : 'Morning (06:55 - 11:00)'}</span>
          </button>
          <button
            onClick={() => setSelectedShift('afternoon')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              selectedShift === 'afternoon' ? 'bg-white text-indigo-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{language === 'km' ? 'ពេលរសៀល (១៣:០០ - ១៧:០០)' : 'Afternoon (13:00 - 17:00)'}</span>
          </button>
        </div>
      </div>

      {/* Main Timetable Matrix View (Printable on A4) */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-sm p-6 sm:p-8 text-slate-900 print:border-none print:shadow-none print:p-2">
        {/* Printable Official Header */}
        <div className="pb-5 border-b-2 border-slate-900 mb-6">
          <div className="grid grid-cols-2 text-xs font-semibold text-slate-900 mb-2">
            <div className="text-left space-y-0.5">
              <p className="font-extrabold uppercase text-slate-950">{OFFICIAL_TIMETABLE_METADATA.provinceKm}</p>
              <p className="font-bold text-slate-800">{OFFICIAL_TIMETABLE_METADATA.districtKm}</p>
              <p className="font-black text-indigo-950 text-sm">{OFFICIAL_TIMETABLE_METADATA.schoolKm}</p>
              <p className="text-slate-600 font-bold text-[11px] pt-1">
                {language === 'km' ? `ថ្នាក់ទី ${activeClass?.gradeLevel} (${activeClass?.nameKm}) • បន្ទប់ ${activeClass?.roomNumber || '០៤'}` : `Grade ${activeClass?.gradeLevel} (${activeClass?.name})`}
              </p>
              <p className="text-slate-700 text-[11px] font-bold">
                {language === 'km' ? `គ្រូបន្ទុកថ្នាក់៖ ${activeClass?.teacherNameKm || activeClass?.teacherName}` : `Class Teacher: ${activeClass?.teacherNameKm || activeClass?.teacherName}`}
              </p>
            </div>
            
            <div className="text-right space-y-0.5">
              <p className="font-black text-slate-950 text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="font-black text-slate-900 text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <p className="text-xs text-amber-700 tracking-widest font-serif select-none leading-none py-1">❖ ❖ ❖</p>
            </div>
          </div>

          <div className="text-center mt-3">
            <h2 className="font-heading font-black text-lg sm:text-2xl text-slate-950 uppercase tracking-wide">
              {language === 'km' 
                ? `កាលវិភាគប្រចាំសប្តាហ៍ ${isLowerGrade ? 'ថ្នាក់ទី១-ទី៣' : 'ថ្នាក់ទី៤-ទី៦'}` 
                : `WEEKLY TIMETABLE (${isLowerGrade ? 'GRADES 1 - 3' : 'GRADES 4 - 6'})`}
            </h2>
            <p className="text-xs font-bold text-indigo-900 mt-1">
              {language === 'km' 
                ? `( វេន${selectedShift === 'morning' ? 'ព្រឹក' : 'រសៀល'} សម្រាប់ថ្នាក់រៀនមួយពេល ) • ឆ្នាំសិក្សា ${activeClass?.academicYear}` 
                : `(${selectedShift === 'morning' ? 'Morning Shift' : 'Afternoon Shift'}) • Academic Year ${activeClass?.academicYear}`}
            </p>
            <p className="text-[11px] text-slate-600 font-semibold italic mt-0.5">
              យោង៖ {OFFICIAL_TIMETABLE_METADATA.ministryRefKm}
            </p>
          </div>
        </div>

        {/* MoEYS Standard Weekly Hours Allocation Breakdown */}
        <div className="no-print mb-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h3 className="font-heading font-black text-xs sm:text-sm text-indigo-950 uppercase tracking-wide">
                {language === 'km' 
                  ? `បន្ទុកម៉ោងបង្រៀនប្រចាំសប្តាហ៍ MoEYS (${isLowerGrade ? 'ថ្នាក់ទី១-ទី៣' : 'ថ្នាក់ទី៤-ទី៦'} ៖ សរុប ៣០ ម៉ោង)` 
                  : `MoEYS Weekly Teaching Load (${isLowerGrade ? 'Grades 1-3' : 'Grades 4-6'}: 30 Hours Total)`}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200 border border-amber-400 text-amber-950 font-black text-[10px]">
              {language === 'km' ? '✨ ថ្ងៃព្រហស្បតិ៍ មិនបង្រៀនមេរៀនត' : 'Thursday: Non-Curriculum Day'}
            </span>
          </div>

          {isLowerGrade ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">ភាសាខ្មែរ (រួមទាំង អ.ផ្ទាល់, សរ.អាន, គស.ក្តី)</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">១៣ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">គណិតវិទ្យា</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">៧ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">វិទ្យាសាស្ត្រ-សិក្សាសង្គម (បញ្ចូលគ្នា)</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">៣ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">អប់រំកាយ-សុខភាព</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">២ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                <p className="font-bold text-amber-800 text-[10px]">ព្រហស្បតិ៍ ម៉ោង១-៣ (បំណិន/គំនូរ/ជួយសិស្ស)</p>
                <p className="font-black text-amber-950 text-sm mt-0.5">៣ ម៉ោង</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                <p className="font-bold text-amber-800 text-[10px]">ព្រហស្បតិ៍ ម៉ោង៤-៥ (ប្រជុំគ្រូ/ពលកម្មសិស្ស)</p>
                <p className="font-black text-amber-950 text-sm mt-0.5">២ ម៉ោង</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">ភាសាខ្មែរ (សរ.អាន, គស.ក្តី, អ.ផ្ទាល់)</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">១០ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">គណិតវិទ្យា</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">៦ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">សិក្សាសង្គម</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">៤ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">វិទ្យាសាស្ត្រ</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">៣ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <p className="font-bold text-slate-600 text-[10px]">អប់រំកាយ និងកីឡា</p>
                <p className="font-black text-indigo-950 text-sm mt-0.5">២ ម៉ោង/សប្តាហ៍</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                <p className="font-bold text-amber-800 text-[10px]">ព្រហស្បតិ៍ ម៉ោង១-៣ (បំណិន/គំនូរ/ជួយសិស្ស/ភាសា)</p>
                <p className="font-black text-amber-950 text-sm mt-0.5">៣ ម៉ោង</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                <p className="font-bold text-amber-800 text-[10px]">ព្រហស្បតិ៍ ម៉ោង៤-៥ (ប្រជុំគ្រូ/ពលកម្មសិស្ស)</p>
                <p className="font-black text-amber-950 text-sm mt-0.5">២ ម៉ោង</p>
              </div>
            </div>
          )}
        </div>

        {/* Timetable Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
            <thead>
              <tr className="bg-slate-950 text-white font-black uppercase text-xs">
                <th className="border border-slate-700 py-3 px-2 w-32">
                  {language === 'km' ? 'ម៉ោងសិក្សា' : 'Period / Time'}
                </th>
                <th className="border border-slate-700 py-3 px-2 w-24">
                  {language === 'km' ? 'រយៈពេល' : 'Duration'}
                </th>
                {DAYS_OF_WEEK.map(d => {
                  const isThursday = d.dayNumber === 4;
                  return (
                    <th 
                      key={d.dayNumber} 
                      className={`border border-slate-700 py-3 px-2 ${
                        isThursday ? 'bg-amber-950 text-amber-200 ring-1 ring-amber-400' : ''
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-black">{language === 'km' ? d.nameKm : d.nameEn}</p>
                      {isThursday ? (
                        <span className="block text-[9px] font-black text-amber-300 uppercase mt-0.5">
                          {language === 'km' ? 'មិនបង្រៀនមេរៀនត' : 'Non-Curriculum'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal text-slate-300">
                          {language === 'km' ? d.shortKm : d.shortEn}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {periodTimes.map((periodDef, idx) => {
                // Break / Recess Row
                if (periodDef.isBreak) {
                  return (
                    <tr key={`break-${idx}`} className="bg-amber-100/80 font-black text-amber-950 border-y-2 border-slate-900">
                      <td className="border border-slate-500 py-2 text-[11px] font-mono font-bold">
                        {periodDef.startTime} - {periodDef.endTime}
                      </td>
                      <td className="border border-slate-500 py-2 text-[11px] font-bold">
                        ១៥ នាទី
                      </td>
                      <td colSpan={6} className="border border-slate-500 py-2 uppercase text-xs tracking-widest font-black">
                        {language === 'km' ? '*** ម៉ោងចេញលេង (RECESS) ***' : '*** RECESS (15 MINS) ***'}
                      </td>
                    </tr>
                  );
                }

                // Assembly / Hygiene Row
                if (periodDef.isAssembly) {
                  return (
                    <tr key={`assembly-${periodDef.period}`} className="bg-sky-50/70 hover:bg-sky-50 transition border-b border-slate-400">
                      <td className="border border-slate-400 py-2.5 px-2 font-bold text-slate-800">
                        <p className="font-black text-xs text-sky-950">
                          {language === 'km' ? (selectedShift === 'morning' ? 'ពេលព្រឹក' : 'ពេលរសៀល') : 'Assembly'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">{periodDef.startTime} - {periodDef.endTime}</p>
                      </td>
                      <td className="border border-slate-400 py-2.5 px-2 font-bold text-slate-700 text-xs">
                        {selectedShift === 'morning' ? '១៥ នាទី' : '១០ នាទី'}
                      </td>

                      {/* 6 Days */}
                      {DAYS_OF_WEEK.map(d => {
                        const slot = getSlot(d.dayNumber, periodDef.period);
                        const isFlag = d.dayNumber === 1 || d.dayNumber === 3 || d.dayNumber === 4 || d.dayNumber === 6;
                        const label = isFlag ? 'គោរពទង់ជាតិ' : 'អនាម័យថ្នាក់រៀន';

                        return (
                          <td 
                            key={`cell-${d.dayNumber}-${periodDef.period}`}
                            onClick={() => slot && openSlotEditor(slot)}
                            className="border border-slate-400 p-2 align-middle cursor-pointer hover:bg-sky-100/50 transition group relative"
                          >
                            <span className={`px-2 py-1 rounded-md text-[11px] font-black inline-block ${
                              isFlag 
                                ? 'bg-sky-100 text-sky-900 border border-sky-300' 
                                : 'bg-teal-100 text-teal-900 border border-teal-300'
                            }`}>
                              {slot?.customTitleKm || label}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }

                // Standard Academic Period Row (1 to 5)
                return (
                  <tr key={`period-${periodDef.period}`} className="hover:bg-slate-50 transition">
                    {/* Time Column */}
                    <td className="border border-slate-400 py-3 px-2 bg-slate-100/80 font-bold text-slate-800">
                      <p className="font-black text-xs text-indigo-950">
                        {language === 'km' ? `ម៉ោងទី ${periodDef.period}` : `Period ${periodDef.period}`}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600 mt-0.5">{periodDef.startTime} - {periodDef.endTime}</p>
                    </td>

                    {/* Duration Column */}
                    <td className="border border-slate-400 py-3 px-2 font-bold text-slate-700 text-xs">
                      ៤០ នាទី
                    </td>

                    {/* 6 Day Columns */}
                    {DAYS_OF_WEEK.map(d => {
                      const slot = getSlot(d.dayNumber, periodDef.period);
                      const subMeta = slot?.subjectId ? getSubjectMeta(slot.subjectId) : undefined;
                      const hasCustomTitle = !!slot?.customTitleKm;

                      return (
                        <td 
                          key={`cell-${d.dayNumber}-${periodDef.period}`} 
                          onClick={() => slot && openSlotEditor(slot)}
                          className="border border-slate-400 p-2 sm:p-2.5 align-middle cursor-pointer hover:bg-indigo-50/60 transition group relative"
                        >
                          {hasCustomTitle ? (
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span 
                                className="px-2 py-1 rounded-lg text-[11px] font-black leading-tight shadow-2xs w-full block text-white"
                                style={{ backgroundColor: subMeta?.color || '#4f46e5' }}
                              >
                                {slot.customTitleKm}
                              </span>
                              {slot?.subTopicKm && (
                                <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  ({slot.subTopicKm})
                                </span>
                              )}
                            </div>
                          ) : subMeta ? (
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span 
                                className="px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-2xs w-full block truncate"
                                style={{ backgroundColor: subMeta.color }}
                              >
                                {language === 'km' ? subMeta.nameKm : subMeta.nameEn}
                              </span>
                              {slot?.subTopicKm && (
                                <span className="text-[10px] font-black text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                                  ({slot.subTopicKm})
                                </span>
                              )}
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

        {/* Official Guideline Notes (កំណត់សំគាល់) */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-slate-800">
          <p className="font-black text-amber-950 text-xs mb-2 uppercase flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>កំណត់សំគាល់ផ្លូវការ៖</span>
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-800">
            {activeNotesList.map((note, nIdx) => (
              <li key={nIdx} className="font-medium">
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Official Sign-Off Footer */}
        <div className="grid grid-cols-2 pt-8 mt-6 text-xs text-slate-900 border-t border-slate-300">
          <div className="text-center space-y-1">
            <p className="font-bold">{language === 'km' ? 'បានឃើញ និងអនុម័ត' : 'Seen and Approved'}</p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'នាយកសាលា' : 'School Principal'}</p>
            <div className="h-20 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-red-600/40 border-dashed flex items-center justify-center text-red-600 text-[10px] font-bold select-none rotate-12">
                ត្រាសាលា
              </div>
            </div>
            <p className="font-black text-slate-900 text-sm">{OFFICIAL_TIMETABLE_METADATA.principalNameKm}</p>
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-600 text-[11px]">
              {OFFICIAL_TIMETABLE_METADATA.issueDateFullKm}
            </p>
            <p className="font-extrabold uppercase text-slate-950">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Class Teacher'}</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[11px] text-slate-400 italic">(ហត្ថលេខា)</span>
            </div>
            <p className="font-black text-slate-900 text-sm">{activeClass?.teacherNameKm || activeClass?.teacherName}</p>
          </div>
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4.5 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-extrabold text-sm sm:text-base">
                  {language === 'km' 
                    ? `កែប្រែកាលវិភាគ៖ ថ្ងៃ${DAYS_OF_WEEK.find(d => d.dayNumber === editingSlot.dayOfWeek)?.nameKm} ${editingSlot.periodNumber === 0 ? 'គោរពទង់ជាតិ/អនាម័យ' : `ម៉ោងទី ${editingSlot.periodNumber}`}` 
                    : `Edit Slot (Day ${editingSlot.dayOfWeek}, Period ${editingSlot.periodNumber})`}
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
                  <option value="">-- {language === 'km' ? 'ទំនេរ' : 'Free'} --</option>
                  {Object.entries(TIMETABLE_SUBJECTS_META).map(([id, meta]) => (
                    <option key={id} value={id}>
                      {meta.nameKm} ({meta.shortKm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'ចំណងជើងរង / សកម្មភាពជាក់លាក់ (ឧ. សរ.អាន, គស.ក្តី, អ.ផ្ទាល់)' : 'Sub-topic / Lesson tag'}
                </label>
                <div className="flex gap-2 mb-1.5">
                  {['សរ.អាន', 'គស.ក្តី', 'អ.ផ្ទាល់'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSlotSubTopicKm(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSlotSubTopicKm('')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] cursor-pointer"
                  >
                    លុប
                  </button>
                </div>
                <input
                  type="text"
                  value={slotSubTopicKm}
                  onChange={(e) => setSlotSubTopicKm(e.target.value)}
                  placeholder="ឧ. សរ.អាន, គស.ក្តី, អ.ផ្ទាល់..."
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'ឈ្មោះមុខវិជ្ជាបង្ហាញពិសេស (Custom Title)' : 'Custom Title Display'}
                </label>
                <input
                  type="text"
                  value={slotCustomTitleKm}
                  onChange={(e) => setSlotCustomTitleKm(e.target.value)}
                  placeholder="ឧ. បំណិនជីវិតតាមមូលដ្ឋាន / គំនូរ..."
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
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
                  {language === 'km' ? 'ចំណាំ (Optional)' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  placeholder="ចំណាំបន្ថែម..."
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
                  className="px-5 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md cursor-pointer"
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
