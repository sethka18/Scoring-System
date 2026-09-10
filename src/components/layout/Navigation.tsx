import React, { useRef } from 'react';
import { useGradebook, NavTab } from '../../context/GradebookContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  TableProperties, 
  CalendarCheck,
  Trophy, 
  FileSpreadsheet, 
  TrendingUp, 
  Building2,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface PrimaryNavItem {
  id: NavTab;
  labelKm: string;
  labelEn: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

export const Navigation: React.FC = () => {
  const { language, activeTab, setActiveTab } = useGradebook();
  const { currentUser, isAdmin } = useAuth();
  const navScrollRef = useRef<HTMLDivElement>(null);

  // Streamlined primary items - clutter removed!
  const navItems: PrimaryNavItem[] = [
    ...(isAdmin ? [{
      id: 'account_management' as NavTab,
      labelKm: 'គ្រប់គ្រងគណនី',
      labelEn: 'Accounts',
      icon: ShieldCheck,
      badge: 'Admin'
    }] : []),
    {
      id: 'dashboard',
      labelKm: 'ផ្ទាំងព័ត៌មាន',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'roster',
      labelKm: 'បញ្ជីសិស្ស',
      labelEn: 'Students',
      icon: Users,
    },
    {
      id: 'scoring',
      labelKm: 'បញ្ចូលពិន្ទុ',
      labelEn: 'Scoring',
      icon: TableProperties,
    },
    {
      id: 'attendance',
      labelKm: 'វត្តមាន',
      labelEn: 'Attendance',
      icon: CalendarCheck,
    },
    {
      id: 'rankings',
      labelKm: 'ចំណាត់ថ្នាក់',
      labelEn: 'Rankings',
      icon: Trophy,
    },
    {
      id: 'report_card',
      labelKm: 'របាយការណ៍ & សៀវភៅតាមដាន',
      labelEn: 'Report Cards',
      icon: FileSpreadsheet,
    },
    {
      id: 'analytics',
      labelKm: 'លទ្ធផលប្រចាំឆ្នាំ',
      labelEn: 'Yearly Analytics',
      icon: TrendingUp,
    },
    {
      id: 'school_hub',
      labelKm: 'គ្រប់ថ្នាក់ (១-៦)',
      labelEn: 'All Classes',
      icon: Building2,
    },
    {
      id: 'schedule',
      labelKm: 'កាលវិភាគ',
      labelEn: 'Schedule',
      icon: Clock,
    },
    {
      id: 'settings',
      labelKm: 'ការកំណត់',
      labelEn: 'Settings',
      icon: SlidersHorizontal,
    },
  ];

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      navScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <nav className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative flex items-center">
        
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={() => scrollNav('left')}
          className="hidden sm:flex shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer mr-1"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Navigation List */}
        <div 
          ref={navScrollRef}
          className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none no-scrollbar scroll-smooth flex-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{language === 'km' ? item.labelKm : item.labelEn}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={() => scrollNav('right')}
          className="hidden sm:flex shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ml-1"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </nav>
  );
};
