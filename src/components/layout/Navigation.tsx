import React from 'react';
import { useGradebook, NavTab } from '../../context/GradebookContext';
import { 
  Building2,
  LayoutDashboard, 
  Users, 
  TableProperties, 
  Trophy, 
  TrendingUp, 
  FileSpreadsheet, 
  SlidersHorizontal,
  Calendar,
  Clock,
  BookOpen,
  CalendarCheck,
  Wrench,
  LayoutGrid,
  BookCheck,
  Database,
  Timer,
  FileQuestion,
  Gamepad2
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { language, activeTab, setActiveTab } = useGradebook();

  const navItems: { id: NavTab; labelEn: string; labelKm: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'school_hub', labelEn: 'All Classes', labelKm: 'គ្រប់ថ្នាក់ (១-៦)', icon: Building2 },
    { id: 'dashboard', labelEn: 'Dashboard', labelKm: 'ផ្ទាំងព័ត៌មាន', icon: LayoutDashboard },
    { id: 'attendance', labelEn: 'Daily Attendance', labelKm: 'វត្តមានប្រចាំថ្ងៃ', icon: CalendarCheck },
    { id: 'seating', labelEn: 'Seating Chart', labelKm: 'ប្លង់តុ', icon: LayoutGrid },
    { id: 'homework', labelEn: 'Homework', labelKm: 'កិច្ចការផ្ទះ', icon: BookCheck },
    { id: 'classroom_tools', labelEn: 'Teacher Power Pack', labelKm: 'ឧបករណ៍ជំនួយ & ហ្គេម (Power Pack)', icon: Wrench },
    { id: 'exam_bank', labelEn: 'Exam & Question Bank', labelKm: 'ធនាគារសំណួរ & វិញ្ញាសា', icon: FileQuestion },
    { id: 'fluency_exam', labelEn: 'Speed Fluency', labelKm: 'ប្រឡងល្បឿនអំណាន & គិតលេខ', icon: Timer },
    { id: 'calendar', labelEn: 'School Calendar', labelKm: 'ប្រតិទិនសាលារៀន', icon: Calendar },
    { id: 'schedule', labelEn: 'Timetable', labelKm: 'កាលវិភាគបង្រៀន', icon: Clock },
    { id: 'curriculum', labelEn: 'Curriculum', labelKm: 'កម្មវិធីសិក្សា', icon: BookOpen },
    { id: 'roster', labelEn: 'Roster', labelKm: 'បញ្ជីសិស្ស', icon: Users },
    { id: 'scoring', labelEn: 'Scoring Hub', labelKm: 'បញ្ចូលពិន្ទុ', icon: TableProperties },
    { id: 'rankings', labelEn: 'Top 5 & Honors', labelKm: 'ចំណាត់ថ្នាក់ & កិត្តិយស', icon: Trophy },
    { id: 'analytics', labelEn: 'Analytics', labelKm: 'លទ្ធផលប្រចាំឆ្នាំ', icon: TrendingUp },
    { id: 'report_card', labelEn: 'Reports & Print', labelKm: 'សៀវភៅតាមដាន', icon: FileSpreadsheet },
    { id: 'backup_restore', labelEn: 'Backup & Archive', labelKm: 'បម្រុងទុក & បណ្ណសារ', icon: Database },
    { id: 'settings', labelEn: 'Settings', labelKm: 'ការកំណត់', icon: SlidersHorizontal },
  ];

  return (
    <nav className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 sm:top-18 z-20 shadow-2xs overflow-x-auto scrollbar-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1.5 sm:space-x-2 py-2.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-900 dark:bg-indigo-600 text-white shadow-md shadow-indigo-900/20 dark:shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{language === 'km' ? item.labelKm : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
