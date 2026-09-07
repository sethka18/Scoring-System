import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  X,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface NavItemDef {
  id: NavTab;
  labelEn: string;
  labelKm: string;
  descKm: string;
  descEn: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

interface NavCategoryDef {
  id: string;
  labelEn: string;
  labelKm: string;
  icon: React.FC<{ className?: string }>;
  items: NavItemDef[];
}

export const Navigation: React.FC = () => {
  const { language, activeTab, setActiveTab } = useGradebook();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const subScrollRef = useRef<HTMLDivElement>(null);

  const categories: NavCategoryDef[] = [
    {
      id: 'overview',
      labelEn: 'School & Overview',
      labelKm: 'សាលា & ទូទៅ',
      icon: Building2,
      items: [
        { 
          id: 'dashboard', 
          labelEn: 'Dashboard', 
          labelKm: 'ផ្ទាំងព័ត៌មាន', 
          descKm: 'ទិដ្ឋភាពទូទៅស្ថិតិ និងសកម្មភាព',
          descEn: 'Overview of statistics & shortcuts',
          icon: LayoutDashboard 
        },
        { 
          id: 'school_hub', 
          labelEn: 'All Classes (1-6)', 
          labelKm: 'គ្រប់ថ្នាក់ (១-៦)', 
          descKm: 'មជ្ឈមណ្ឌលគ្រប់គ្រងថ្នាក់រៀនទាំងអស់',
          descEn: 'All class sections hub & management',
          icon: Building2 
        },
        { 
          id: 'roster', 
          labelEn: 'Student Roster', 
          labelKm: 'បញ្ជីសិស្ស', 
          descKm: 'គ្រប់គ្រងព័ត៌មានសិស្ស នាំចូល និងបោះពុម្ព',
          descEn: 'Manage students, import & print',
          icon: Users 
        },
        { 
          id: 'seating', 
          labelEn: 'Seating Chart', 
          labelKm: 'ប្លង់តុ', 
          descKm: 'រៀបចំកន្លែងអង្គុយសិស្សតាមតុ',
          descEn: 'Arrange classroom desk layout',
          icon: LayoutGrid 
        },
      ]
    },
    {
      id: 'teaching',
      labelEn: 'Teaching & Attendance',
      labelKm: 'ការបង្រៀន & វត្តមាន',
      icon: CalendarCheck,
      items: [
        { 
          id: 'attendance', 
          labelEn: 'Daily Attendance', 
          labelKm: 'វត្តមានប្រចាំថ្ងៃ', 
          descKm: 'ស្រង់វត្តមានសិស្ស មានច្បាប់ អវត្តមាន យឺត',
          descEn: 'Track daily student attendance',
          icon: CalendarCheck 
        },
        { 
          id: 'homework', 
          labelEn: 'Homework Tracker', 
          labelKm: 'កិច្ចការផ្ទះ', 
          descKm: 'តាមដានការបំពេញកិច្ចការផ្ទះរបស់សិស្ស',
          descEn: 'Track homework submissions',
          icon: BookCheck 
        },
        { 
          id: 'schedule', 
          labelEn: 'Timetable', 
          labelKm: 'កាលវិភាគបង្រៀន', 
          descKm: 'កាលវិភាគប្រចាំសប្តាហ៍តាមស្តង់ដារក្រសួង',
          descEn: 'Weekly class teaching schedule',
          icon: Clock 
        },
        { 
          id: 'calendar', 
          labelEn: 'School Calendar', 
          labelKm: 'ប្រតិទិនសាលារៀន', 
          descKm: 'ព្រឹត្តិការណ៍ ថ្ងៃឈប់សម្រាក និងប្រឡង',
          descEn: 'School holidays, events & exams',
          icon: Calendar 
        },
        { 
          id: 'curriculum', 
          labelEn: 'Curriculum', 
          labelKm: 'កម្មវិធីសិក្សា', 
          descKm: 'មេរៀន និងកម្មវិធីលម្អិតតាមមុខវិជ្ជា',
          descEn: 'MoEYS syllabus & lessons plan',
          icon: BookOpen 
        },
      ]
    },
    {
      id: 'exams_scoring',
      labelEn: 'Exams & Scoring',
      labelKm: 'ការប្រឡង & ពិន្ទុ',
      icon: TableProperties,
      items: [
        { 
          id: 'scoring', 
          labelEn: 'Scoring Hub', 
          labelKm: 'បញ្ចូលពិន្ទុ', 
          descKm: 'បញ្ចូលពិន្ទុប្រចាំខែ និងឆមាស',
          descEn: 'Monthly & semester grade entry',
          icon: TableProperties 
        },
        { 
          id: 'exam_bank', 
          labelEn: 'Exam & Question Bank', 
          labelKm: 'ធនាគារសំណួរ & វិញ្ញាសា', 
          descKm: 'បង្កើតវិញ្ញាសាប្រឡង និងធនាគារសំណួរ',
          descEn: 'Exam generator & question library',
          icon: FileQuestion 
        },
        { 
          id: 'fluency_exam', 
          labelEn: 'Speed Fluency', 
          labelKm: 'ប្រឡងល្បឿនអំណាន & គិតលេខ', 
          descKm: 'តេស្តល្បឿនអំណានភាសាខ្មែរ & គណិតរហ័ស',
          descEn: 'Reading speed timer & mental math test',
          icon: Timer 
        },
        { 
          id: 'rankings', 
          labelEn: 'Top 5 & Honors', 
          labelKm: 'ចំណាត់ថ្នាក់ & កិត្តិយស', 
          descKm: 'តារាងកិត្តិយស និងចំណាត់ថ្នាក់ប្រចាំខែ',
          descEn: 'Honor roll & monthly top ranks',
          icon: Trophy 
        },
      ]
    },
    {
      id: 'reports',
      labelEn: 'Reports & Analytics',
      labelKm: 'របាយការណ៍ & វិភាគ',
      icon: FileSpreadsheet,
      items: [
        { 
          id: 'report_card', 
          labelEn: 'Reports & Print', 
          labelKm: 'សៀវភៅតាមដាន', 
          descKm: 'សៀវភៅតាមដានការសិក្សា & បោះពុម្ពប័ណ្ណសរសើរ',
          descEn: 'Printable report cards & certificates',
          icon: FileSpreadsheet 
        },
        { 
          id: 'analytics', 
          labelEn: 'Yearly Analytics', 
          labelKm: 'លទ្ធផលប្រចាំឆ្នាំ', 
          descKm: 'ក្រាហ្វវិភាគលទ្ធផលសិក្សាពេញមួយឆ្នាំ',
          descEn: 'Whole year academic performance trends',
          icon: TrendingUp 
        },
      ]
    },
    {
      id: 'system_tools',
      labelEn: 'Tools & Settings',
      labelKm: 'ឧបករណ៍ & ការកំណត់',
      icon: Wrench,
      items: [
        { 
          id: 'classroom_tools', 
          labelEn: 'Teacher Power Pack', 
          labelKm: 'ឧបករណ៍ជំនួយ & ហ្គេម', 
          descKm: 'ចាប់ឆ្នោត ក្តារខៀន ម៉ោងរាប់ថយក្រោយ & ហ្គេម',
          descEn: 'Random student picker, timer & mini-games',
          icon: Wrench 
        },
        { 
          id: 'backup_restore', 
          labelEn: 'Backup & Cloud', 
          labelKm: 'បម្រុងទុក & បណ្ណសារ', 
          descKm: 'ទាញយកឯកសារបម្រុងទុក និងរក្សាទុកទិន្នន័យ',
          descEn: 'Download JSON backup & archive',
          icon: Database 
        },
        { 
          id: 'settings', 
          labelEn: 'Grading Settings', 
          labelKm: 'ការកំណត់ពិន្ទុ', 
          descKm: 'កំណត់មេគុណពិន្ទុ និងកម្រិតនិទ្ទេស',
          descEn: 'Configure weights & grading scales',
          icon: SlidersHorizontal 
        },
      ]
    }
  ];

  // Determine active category based on current activeTab
  const findCategoryForTab = (tab: NavTab): string => {
    for (const cat of categories) {
      if (cat.items.some(item => item.id === tab)) {
        return cat.id;
      }
    }
    return 'overview';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(() => findCategoryForTab(activeTab));

  // Keep category in sync when activeTab changes elsewhere (e.g. clicking a link on dashboard)
  useEffect(() => {
    const parentCat = findCategoryForTab(activeTab);
    if (parentCat !== selectedCategory) {
      setSelectedCategory(parentCat);
    }
  }, [activeTab]);

  const activeCategoryObj = categories.find(c => c.id === selectedCategory) || categories[0];

  // Horizontal mouse-wheel helper so regular vertical mouse scrolling scrolls horizontally
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const scrollLeftCategory = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRightCategory = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Filter items for mega-menu search
  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      !searchQuery.trim() ||
      item.labelKm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descKm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descEn.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <nav className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 sm:top-18 z-20 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tier 1: Category Selector Bar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80 gap-2">
          
          {/* Scroll Left Button for small screens / standard mouse */}
          <button
            onClick={scrollLeftCategory}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Categories Pill Strip */}
          <div 
            ref={categoryScrollRef}
            onWheel={handleWheel}
            className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto scrollbar-none flex-1 py-0.5"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isCatActive = selectedCategory === cat.id;
              const containsActiveTab = cat.items.some(i => i.id === activeTab);

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    // If user clicks a different category, switch active tab to that category's first item
                    if (!containsActiveTab && cat.items.length > 0) {
                      setActiveTab(cat.items[0].id);
                    }
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-black tracking-tight whitespace-nowrap cursor-pointer transition-all ${
                    isCatActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCatActive ? 'text-amber-400 dark:text-indigo-600' : 'text-slate-400'}`} />
                  <span>{language === 'km' ? cat.labelKm : cat.labelEn}</span>
                  {containsActiveTab && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button for small screens / standard mouse */}
          <button
            onClick={scrollRightCategory}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* All Features Mega-Menu Button */}
          <button
            onClick={() => setIsMegaMenuOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-black tracking-tight cursor-pointer transition shrink-0"
            title={language === 'km' ? 'មើលមុខងារទាំងអស់ទាំង ១៨ ក្នុងផ្ទាំងតែមួយ' : 'View all 18 features in mega-menu'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'km' ? 'មុខងារទាំងអស់' : 'All Features'}</span>
          </button>
        </div>

        {/* Tier 2: Selected Category's Sub-Items Strip */}
        <div className="py-2 flex items-center justify-between gap-2">
          
          {/* Sub Items Wrap Container (fits without scrolling on most screens, wraps gracefully) */}
          <div 
            ref={subScrollRef}
            onWheel={handleWheel}
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1"
          >
            {activeCategoryObj.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-900 dark:bg-indigo-600 text-white shadow-md shadow-indigo-900/20 dark:shadow-indigo-600/30 ring-2 ring-indigo-900/20 dark:ring-indigo-600/40'
                      : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="whitespace-nowrap">{language === 'km' ? item.labelKm : item.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Current Category Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 select-none">
            <span>{language === 'km' ? activeCategoryObj.labelKm : activeCategoryObj.labelEn}</span>
            <span>({activeCategoryObj.items.length})</span>
          </div>

        </div>

      </div>

      {/* Mega Menu Modal: View & Search All 18 Features */}
      {isMegaMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 rounded-t-3xl flex items-center justify-between border-b border-indigo-900/50 sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-black tracking-tight">
                    {language === 'km' ? 'បញ្ជីមុខងារទាំង ១៨ នៃប្រព័ន្ធ' : 'All 18 System Features'}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {language === 'km' ? 'ជ្រើសរើសមុខងារដើម្បីបើកប្រើប្រាស់ភ្លាមៗ' : 'Click any feature to navigate directly'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMegaMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'km' ? 'ស្វែងរកមុខងារ (ឧទាហរណ៍៖ ពិន្ទុ, វត្តមាន, កាលវិភាគ, បញ្ជីសិស្ស)...' : 'Search features (e.g. Scoring, Attendance, Timetable)...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Categories & Features Grid */}
            <div className="p-6 space-y-6">
              {filteredCategories.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <div key={cat.id} className="space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <CatIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{language === 'km' ? cat.labelKm : cat.labelEn}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {cat.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isCurrentActive = activeTab === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setSelectedCategory(cat.id);
                              setIsMegaMenuOpen(false);
                            }}
                            className={`flex items-start space-x-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                              isCurrentActive
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isCurrentActive
                                ? 'bg-indigo-900 text-white dark:bg-indigo-600'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400'
                            }`}>
                              <ItemIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div className={`text-xs font-black tracking-tight truncate ${
                                  isCurrentActive ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-white'
                                }`}>
                                  {language === 'km' ? item.labelKm : item.labelEn}
                                </div>
                                {isCurrentActive && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                                {language === 'km' ? item.descKm : item.descEn}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between rounded-b-3xl">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === 'km' ? 'ចុចលើប្រអប់ណាមួយដើម្បីចូលទៅកាន់ទំព័រនោះ' : 'Click any box to open the feature'}
              </div>
              <button
                onClick={() => setIsMegaMenuOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black transition cursor-pointer"
              >
                {language === 'km' ? 'បិទ' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </nav>
  );
};
