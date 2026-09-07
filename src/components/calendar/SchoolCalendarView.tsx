import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { CalendarEvent, CalendarEventType } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Clock, 
  MapPin, 
  BookOpen, 
  Award, 
  Flag, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Upload, 
  List, 
  Grid,
  FileSpreadsheet
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { CurriculumUploadModal } from '../curriculum/CurriculumUploadModal';

export const SchoolCalendarView: React.FC = () => {
  const { 
    language, 
    activeClass, 
    schoolProfile,
    calendarEvents, 
    addCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent, 
    toggleEventCompleted 
  } = useGradebook();

  // Current view date (defaults to current academic month, e.g., Feb 2026 or today)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 1, 1)); // Feb 2026 default
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form State
  const [eventTitleKm, setEventTitleKm] = useState('');
  const [eventTitleEn, setEventTitleEn] = useState('');
  const [eventDate, setEventDate] = useState('2026-02-15');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('academic');
  const [eventDescKm, setEventDescKm] = useState('');
  const [eventLunarKm, setEventLunarKm] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 1, 1));
  };

  // Month Calendar Calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Starting day index (0 = Sunday, 1 = Monday, etc.)
  // Let's make Monday index 0 for Cambodian primary school week
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 

  const monthNamesKm = [
    'ខែមករា (មករ)', 'ខែកុម្ភៈ (កុម្ភៈ)', 'ខែមីនា (មីនា)', 'ខែមេសា (មេសា)', 
    'ខែឧសភា (ឧសភា)', 'ខែមិថុនា (មិថុនា)', 'ខែកក្កដា (កក្កដា)', 'ខែសីហា (សីហា)', 
    'ខែកញ្ញា (កញ្ញា)', 'ខែតុលា (តុលា)', 'ខែវិច្ឆិកា (វិច្ឆិកា)', 'ខែធ្នូ (ធ្នូ)'
  ];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];

  const dayHeaders = [
    { km: 'ច័ន្ទ', en: 'Mon' },
    { km: 'អង្គារ', en: 'Tue' },
    { km: 'ពុធ', en: 'Wed' },
    { km: 'ព្រហ', en: 'Thu' },
    { km: 'សុក្រ', en: 'Fri' },
    { km: 'សៅរ៍', en: 'Sat' },
    { km: 'អាទិត្យ', en: 'Sun' },
  ];

  // Filtering Events
  const filteredEvents = calendarEvents.filter(event => {
    if (selectedTypeFilter !== 'all' && event.type !== selectedTypeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchKm = event.titleKm?.toLowerCase().includes(q) || event.descriptionKm?.toLowerCase().includes(q);
      const matchEn = event.titleEn?.toLowerCase().includes(q) || event.descriptionEn?.toLowerCase().includes(q);
      if (!matchKm && !matchEn) return false;
    }
    return true;
  });

  // Get events for a specific day string "YYYY-MM-DD"
  const getEventsForDay = (dayNumber: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return filteredEvents.filter(e => {
      if (e.date === dateStr) return true;
      if (e.endDate && e.date <= dateStr && e.endDate >= dateStr) return true;
      return false;
    });
  };

  const getEventTypeBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'exam':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-600', labelKm: 'សម័យប្រឡង', labelEn: 'Exam' };
      case 'holiday':
        return { bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-600', labelKm: 'ថ្ងៃឈប់សម្រាក', labelEn: 'Holiday' };
      case 'academic':
        return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: 'bg-indigo-600', labelKm: 'កិច្ចការសិក្សា', labelEn: 'Academic' };
      case 'meeting':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-600', labelKm: 'ការប្រជុំ', labelEn: 'Meeting' };
      case 'activity':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', labelKm: 'សកម្មភាព', labelEn: 'Activity' };
      case 'curriculum':
        return { bg: 'bg-cyan-100 text-cyan-800 border-cyan-300', dot: 'bg-cyan-600', labelKm: 'កម្មវិធីសិក្សា', labelEn: 'Curriculum' };
      default:
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-500', labelKm: 'ទូទៅ', labelEn: 'General' };
    }
  };

  const openAddModal = (defaultDate?: string) => {
    setEditingEvent(null);
    setEventTitleKm('');
    setEventTitleEn('');
    setEventDate(defaultDate || `${year}-${String(month + 1).padStart(2, '0')}-15`);
    setEventEndDate('');
    setEventTime('');
    setEventType('academic');
    setEventDescKm('');
    setEventLunarKm('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitleKm(event.titleKm);
    setEventTitleEn(event.titleEn);
    setEventDate(event.date);
    setEventEndDate(event.endDate || '');
    setEventTime(event.time || '');
    setEventType(event.type);
    setEventDescKm(event.descriptionKm || '');
    setEventLunarKm(event.lunarDateKm || '');
    setIsAddModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitleKm.trim()) return;

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, {
        titleKm: eventTitleKm,
        titleEn: eventTitleEn || eventTitleKm,
        date: eventDate,
        endDate: eventEndDate || undefined,
        time: eventTime || undefined,
        type: eventType,
        descriptionKm: eventDescKm || undefined,
        lunarDateKm: eventLunarKm || undefined,
      });
    } else {
      addCalendarEvent({
        titleKm: eventTitleKm,
        titleEn: eventTitleEn || eventTitleKm,
        date: eventDate,
        endDate: eventEndDate || undefined,
        time: eventTime || undefined,
        type: eventType,
        descriptionKm: eventDescKm || undefined,
        lunarDateKm: eventLunarKm || undefined,
        isMoEYSOfficial: true,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / MoEYS National Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1.5 shadow-lg shrink-0 flex items-center justify-center border border-white/20">
              <SchoolLogo size={56} customLogoUrl={schoolProfile?.logoUrl} />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-1.5">
                <span>{language === 'km' ? 'ប្រតិទិនសិក្សាផ្លូវការ • ក្រសួងអប់រំ យុវជន និងកីឡា' : 'MoEYS Official Academic Calendar & Events'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'km' ? 'ប្រតិទិនសាលារៀន និងកាលបរិច្ឆេទសិក្សា' : 'Primary School Academic Calendar'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                {language === 'km' 
                  ? `ឆ្នាំសិក្សា ${activeClass?.academicYear || '2025-2026'} • តាមដានសម័យប្រឡង ថ្ងៃឈប់សម្រាក និងកម្មវិធីសិក្សា` 
                  : `Academic Year ${activeClass?.academicYear || '2025-2026'} • Track examination periods, holidays, and curriculum`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCurriculumModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{language === 'km' ? 'បញ្ចូលកម្មវិធីសិក្សា (Curriculum)' : 'Upload Curriculum'}</span>
            </button>

            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'km' ? 'បន្ថែមព្រឹត្តិការណ៍' : 'Add Event'}</span>
            </button>

            <PrintToPdfButton
              pageSize="a4"
              variant="outline"
              size="md"
              labelKm="បោះពុម្ពប្រតិទិន A4"
              labelEn="Print Calendar A4"
            />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-white rounded-lg transition cursor-pointer"
            >
              {language === 'km' ? 'ខែបច្ចុប្បន្ន' : 'Current'}
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="font-heading font-black text-base sm:text-lg text-slate-900">
            {language === 'km' ? `${monthNamesKm[month]} ${year}` : `${monthNamesEn[month]} ${year}`}
          </div>
        </div>

        {/* Filters & View Modes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center overflow-x-auto space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            {[
              { id: 'all', km: 'ទាំងអស់', en: 'All' },
              { id: 'exam', km: 'ប្រឡង', en: 'Exams' },
              { id: 'holiday', km: 'ឈប់សម្រាក', en: 'Holidays' },
              { id: 'academic', km: 'សិក្សា', en: 'Academic' },
              { id: 'curriculum', km: 'កម្មវិធីសិក្សា', en: 'Curriculum' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedTypeFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedTypeFilter === f.id
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? f.km : f.en}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-2 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'agenda' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Agenda List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar View Area */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden text-slate-900">
          {/* Printable Kingdom Header (Visible on print) */}
          <div className="hidden print:block p-6 text-center border-b-2 border-slate-900">
            <div className="flex justify-between items-start text-xs font-semibold text-slate-800 mb-2">
              <div className="text-left flex items-center space-x-2">
                <SchoolLogo size={40} customLogoUrl={schoolProfile?.logoUrl} />
                <div>
                  <p className="font-extrabold uppercase">{activeClass?.schoolNameKm}</p>
                  <p className="text-[11px]">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="text-[11px] font-bold">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              </div>
            </div>
            <h2 className="font-heading font-black text-xl uppercase mt-2">
              {language === 'km' ? `ប្រតិទិនសកម្មភាពសិក្សា - ${monthNamesKm[month]} ${year}` : `Academic Calendar - ${monthNamesEn[month]} ${year}`}
            </h2>
            <p className="text-xs text-slate-600 font-bold">
              {language === 'km' ? `ឆ្នាំសិក្សា ${activeClass?.academicYear}` : `Academic Year ${activeClass?.academicYear}`}
            </p>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center text-xs font-black text-slate-700 py-3 uppercase tracking-wider">
            {dayHeaders.map((d, i) => (
              <div key={i} className={i >= 5 ? 'text-rose-600' : ''}>
                <span>{language === 'km' ? d.km : d.en}</span>
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200">
            {/* Empty slots for leading days of previous month */}
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={`empty-prev-${index}`} className="min-h-[110px] sm:min-h-[130px] p-2 bg-slate-50/50 text-slate-300" />
            ))}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dayEvents = getEventsForDay(dayNum);
              const dayOfWeekIndex = (startDayOfWeek + index) % 7;
              const isWeekend = dayOfWeekIndex >= 5;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 sm:p-2.5 transition-colors relative flex flex-col justify-between group ${
                    isWeekend ? 'bg-rose-50/20' : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs sm:text-sm font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        isWeekend ? 'text-rose-600 font-black' : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Quick Add on Hover */}
                    <button
                      onClick={() => openAddModal(`${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`)}
                      className="no-print opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                      title="Add Event"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Events List */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[80px] scrollbar-none">
                    {dayEvents.map(event => {
                      const badge = getEventTypeBadge(event.type);
                      return (
                        <div
                          key={event.id}
                          onClick={() => openEditModal(event)}
                          className={`px-2 py-1 rounded-lg border text-[10px] sm:text-[11px] font-bold leading-tight cursor-pointer transition shadow-2xs flex items-center space-x-1.5 ${badge.bg}`}
                          title={language === 'km' ? event.titleKm : event.titleEn}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          <span className="truncate">
                            {language === 'km' ? event.titleKm : event.titleEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Chronological List View */
        <div className="bg-white rounded-3xl border border-slate-300 shadow-sm p-6 space-y-4 text-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              {language === 'km' ? 'បញ្ជីព្រឹត្តិការណ៍ និងកាលវិភាគលម្អិត' : 'Detailed Agenda & Event Schedule'}
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {filteredEvents.length} {language === 'km' ? 'ព្រឹត្តិការណ៍' : 'events'}
            </span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map(event => {
              const badge = getEventTypeBadge(event.type);
              return (
                <div
                  key={event.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 transition shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <button
                      onClick={() => toggleEventCompleted(event.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                    >
                      {event.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${badge.bg}`}>
                          {language === 'km' ? badge.labelKm : badge.labelEn}
                        </span>
                        {event.lunarDateKm && (
                          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {event.lunarDateKm}
                          </span>
                        )}
                      </div>

                      <h3 className={`font-bold text-sm sm:text-base text-slate-950 ${event.isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {language === 'km' ? event.titleKm : event.titleEn}
                      </h3>

                      {event.descriptionKm && (
                        <p className="text-xs text-slate-600 mt-1">
                          {language === 'km' ? event.descriptionKm : event.descriptionEn}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 mt-2">
                        <div className="flex items-center space-x-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-700" />
                          <span>{event.date} {event.endDate ? `→ ${event.endDate}` : ''}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-700" />
                            <span>{event.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => openEditModal(event)}
                      className="p-2 rounded-xl text-slate-500 hover:text-indigo-900 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCalendarEvent(event.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-base sm:text-lg">
                {editingEvent 
                  ? (language === 'km' ? 'កែប្រែព្រឹត្តិការណ៍' : 'Edit Calendar Event') 
                  : (language === 'km' ? 'បន្ថែមព្រឹត្តិការណ៍ថ្មី' : 'Add Calendar Event')}
              </h2>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'ចំណងជើង (ភាសាខ្មែរ)' : 'Title (Khmer)'} *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitleKm}
                  onChange={(e) => setEventTitleKm(e.target.value)}
                  placeholder="ឧ. សម័យប្រឡងឆមាសទី១"
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'ចំណងជើង (អង់គ្លេស / English)' : 'Title (English)'}
                </label>
                <input
                  type="text"
                  value={eventTitleEn}
                  onChange={(e) => setEventTitleEn(e.target.value)}
                  placeholder="e.g. Semester 1 Exam"
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-[11px] mb-1">
                    {language === 'km' ? 'កាលបរិច្ឆេទចាប់ផ្តើម' : 'Start Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[11px] mb-1">
                    {language === 'km' ? 'កាលបរិច្ឆេទបញ្ចប់' : 'End Date (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-[11px] mb-1">
                    {language === 'km' ? 'ប្រភេទ' : 'Category'}
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="academic">{language === 'km' ? 'កិច្ចការសិក្សា (Academic)' : 'Academic'}</option>
                    <option value="exam">{language === 'km' ? 'សម័យប្រឡង (Exam)' : 'Exam'}</option>
                    <option value="holiday">{language === 'km' ? 'ថ្ងៃឈប់សម្រាក (Holiday)' : 'Holiday'}</option>
                    <option value="meeting">{language === 'km' ? 'ការប្រជុំ (Meeting)' : 'Meeting'}</option>
                    <option value="activity">{language === 'km' ? 'សកម្មភាពសាលា (Activity)' : 'Activity'}</option>
                    <option value="curriculum">{language === 'km' ? 'កម្មវិធីសិក្សា (Curriculum)' : 'Curriculum'}</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-[11px] mb-1">
                    {language === 'km' ? 'ពេលវេលា' : 'Time (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="07:30 - 11:00"
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'កាលបរិច្ឆេទចន្ទគតិ (Lunar Date)' : 'Khmer Lunar Date'}
                </label>
                <input
                  type="text"
                  value={eventLunarKm}
                  onChange={(e) => setEventLunarKm(e.target.value)}
                  placeholder="ឧ. ៦កើត ខែមាឃ ឆ្នាំម្សាញ់"
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase text-[11px] mb-1">
                  {language === 'km' ? 'ការពិពណ៌នាលម្អិត' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={eventDescKm}
                  onChange={(e) => setEventDescKm(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  {language === 'km' ? 'រក្សាទុក' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Upload & Recreate Modal */}
      <CurriculumUploadModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
      />
    </div>
  );
};
