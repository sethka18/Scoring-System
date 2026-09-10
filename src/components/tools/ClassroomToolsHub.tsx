import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { Student } from '../../types';
import { calculatePeriodAverage } from '../../utils/calculations';
import { 
  Wrench, 
  Dice5, 
  Users, 
  Timer as TimerIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Printer, 
  Shuffle, 
  Clock, 
  Flag,
  UserCheck,
  ChevronRight,
  Download,
  LayoutGrid,
  BookCheck,
  Gamepad2
} from 'lucide-react';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { EditableLuckyWheel } from './EditableLuckyWheel';
import { InteractiveMiniGamesHub } from '../games/InteractiveMiniGamesHub';

export interface ClassroomToolsHubProps {
  initialTab?: 'lucky_wheel' | 'games' | 'picker' | 'groups' | 'timer';
}

export const ClassroomToolsHub: React.FC<ClassroomToolsHubProps> = ({ initialTab = 'lucky_wheel' }) => {
  const { 
    language, 
    activeClass, 
    classStudents, 
    subjects,
    activePeriodId, 
    scoresMatrix, 
    weights,
    showToast,
    setActiveTab: setNavTab
  } = useGradebook();

  const [activeTab, setActiveTab] = useState<'lucky_wheel' | 'games' | 'picker' | 'groups' | 'timer'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ==========================================
  // TOOL 1: RANDOM STUDENT PICKER STATE
  // ==========================================
  const [pickerGender, setPickerGender] = useState<'All' | 'Female' | 'Male'>('All');
  const [preventRepeat, setPreventRepeat] = useState(true);
  const [pickedHistory, setPickedHistory] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayName, setDisplayName] = useState<string>('???');

  // Available students for picker
  const eligibleStudents = useMemo(() => {
    return classStudents.filter(s => {
      const matchGender = pickerGender === 'All' || s.gender === pickerGender;
      const notPicked = !preventRepeat || !pickedHistory.some(p => p.id === s.id);
      return matchGender && notPicked;
    });
  }, [classStudents, pickerGender, preventRepeat, pickedHistory]);

  const spinRandomPicker = () => {
    if (eligibleStudents.length === 0) {
      showToast(
        language === 'km' ? 'សិស្សទាំងអស់ត្រូវបានចាប់រួចរាល់! សូមចុចកំណត់ឡើងវិញ' : 'All eligible students have been picked! Please reset history.', 
        'warning'
      );
      return;
    }

    setIsSpinning(true);
    let counter = 0;
    const totalFlips = 25;
    const intervalTime = 70;

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * eligibleStudents.length);
      setDisplayName(eligibleStudents[randomIdx].name);
      counter++;

      if (counter >= totalFlips) {
        clearInterval(interval);
        const finalWinner = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
        setSelectedStudent(finalWinner);
        setDisplayName(finalWinner.name);
        setPickedHistory(prev => [finalWinner, ...prev]);
        setIsSpinning(false);
        playChimeSound();
      }
    }, intervalTime);
  };

  const resetPickerHistory = () => {
    setPickedHistory([]);
    setSelectedStudent(null);
    setDisplayName('???');
    showToast(language === 'km' ? 'បានកំណត់បញ្ជីចាប់ឈ្មោះឡើងវិញ' : 'Reset picker history', 'info');
  };

  // ==========================================
  // TOOL 2: FAIR GROUP GENERATOR STATE
  // ==========================================
  const [groupCount, setGroupCount] = useState<number>(4);
  const [groupStrategy, setGroupStrategy] = useState<'random' | 'gender_balanced' | 'ability_balanced'>('gender_balanced');
  const [generatedGroups, setGeneratedGroups] = useState<{ id: string; nameKm: string; nameEn: string; color: string; members: Student[] }[]>([]);
  const [copiedGroups, setCopiedGroups] = useState(false);

  // Khmer Team Themes
  const KHMER_GROUP_THEMES = [
    { nameKm: 'ក្រុម ឥន្ទ្រីយ៍ដែក', nameEn: 'Iron Eagles', color: 'from-blue-600 to-indigo-700' },
    { nameKm: 'ក្រុម តោរាជ្យ', nameEn: 'Royal Lions', color: 'from-amber-600 to-yellow-600' },
    { nameKm: 'ក្រុម នាគរាជ', nameEn: 'Dragon Kings', color: 'from-emerald-600 to-teal-700' },
    { nameKm: 'ក្រុម ហង្សមាស', nameEn: 'Golden Phoenix', color: 'from-rose-600 to-pink-600' },
    { nameKm: 'ក្រុម ពេជ្រចរណៃ', nameEn: 'Diamond Stars', color: 'from-purple-600 to-indigo-600' },
    { nameKm: 'ក្រុម ព្រះអាទិត្យ', nameEn: 'Solar Suns', color: 'from-orange-600 to-red-600' },
    { nameKm: 'ក្រុម រន្ទះខៀវ', nameEn: 'Blue Lightning', color: 'from-sky-600 to-blue-700' },
    { nameKm: 'ក្រុម ត្បូងកណ្តៀង', nameEn: 'Sapphire Sapphires', color: 'from-cyan-600 to-blue-800' }
  ];

  const generateGroups = () => {
    if (classStudents.length === 0) return;

    const count = Math.max(2, Math.min(8, groupCount));
    const groups: { id: string; nameKm: string; nameEn: string; color: string; members: Student[] }[] = [];

    for (let i = 0; i < count; i++) {
      const theme = KHMER_GROUP_THEMES[i % KHMER_GROUP_THEMES.length];
      groups.push({
        id: `group_${i + 1}`,
        nameKm: theme.nameKm,
        nameEn: theme.nameEn,
        color: theme.color,
        members: []
      });
    }

    if (groupStrategy === 'random') {
      const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
      shuffled.forEach((stu, idx) => {
        groups[idx % count].members.push(stu);
      });
    } else if (groupStrategy === 'gender_balanced') {
      const females = [...classStudents.filter(s => s.gender === 'Female')].sort(() => Math.random() - 0.5);
      const males = [...classStudents.filter(s => s.gender === 'Male')].sort(() => Math.random() - 0.5);

      females.forEach((stu, idx) => {
        groups[idx % count].members.push(stu);
      });
      males.forEach((stu, idx) => {
        groups[idx % count].members.push(stu);
      });
    } else if (groupStrategy === 'ability_balanced') {
      // Sort by academic standing
      const ranked = [...classStudents].sort((a, b) => {
        const avgA = calculatePeriodAverage(a.id, activePeriodId, subjects, scoresMatrix, weights).average;
        const avgB = calculatePeriodAverage(b.id, activePeriodId, subjects, scoresMatrix, weights).average;
        return avgB - avgA;
      });

      // Snake draft distribution (1,2,3,4 then 4,3,2,1) to balance smarts
      ranked.forEach((stu, idx) => {
        const round = Math.floor(idx / count);
        const groupIdx = round % 2 === 0 ? (idx % count) : (count - 1 - (idx % count));
        groups[groupIdx].members.push(stu);
      });
    }

    setGeneratedGroups(groups);
    showToast(
      language === 'km' 
        ? `បានបែងចែកសិស្សជា ${count} ក្រុមដោយជោគជ័យ!` 
        : `Generated ${count} balanced groups successfully!`
    );
  };

  const copyGroupsToClipboard = () => {
    if (generatedGroups.length === 0) return;

    const lines: string[] = [];
    lines.push(`📚 បញ្ជីក្រុមការងារថ្នាក់៖ ${activeClass?.nameKm || 'ថ្នាក់ទី៦'} (${activeClass?.schoolNameKm || 'សាលាបឋមសិក្សា'})`);
    lines.push(`──────────────────────────────`);

    generatedGroups.forEach((g, idx) => {
      lines.push(`\n🚩 ${g.nameKm} (${g.members.length} នាក់):`);
      g.members.forEach((m, mIdx) => {
        lines.push(`  ${mIdx + 1}. ${m.name} (${m.gender === 'Female' ? 'សិស្សស្រី' : 'សិស្សប្រុស'}) - ${m.studentId}`);
      });
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedGroups(true);
    showToast(language === 'km' ? 'បានចម្លងបញ្ជីក្រុមជោគជ័យ' : 'Copied groups to clipboard');
    setTimeout(() => setCopiedGroups(false), 3000);
  };

  // ==========================================
  // TOOL 3: CLASSROOM COUNTDOWN TIMER & STOPWATCH
  // ==========================================
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [totalSeconds, setTotalSeconds] = useState<number>(300); // 5 mins
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [laps, setLaps] = useState<{ id: number; timeFormatted: string }[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const timerRef = useRef<any>(null);

  // Timer Tick Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        if (timerMode === 'countdown') {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsTimerRunning(false);
              playChimeSound();
              showToast(language === 'km' ? '⏰ អស់ម៉ោងកំណត់ហើយ!' : '⏰ Time is up!', 'warning');
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sound Synthesizer (No external asset needed)
  const playChimeSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Pleasant double chord chime
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
    } catch (e) {
      console.warn('Audio synthesis disabled or blocked');
    }
  };

  const handleSetPresetTimer = (minutes: number) => {
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsTimerRunning(false);
  };

  const addTimeSeconds = (secs: number) => {
    setTotalSeconds(prev => prev + secs);
    setRemainingSeconds(prev => prev + secs);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'countdown') {
      setRemainingSeconds(totalSeconds);
    } else {
      setStopwatchSeconds(0);
      setLaps([]);
    }
  };

  const recordLap = () => {
    setLaps(prev => [
      { id: prev.length + 1, timeFormatted: formatTime(stopwatchSeconds) },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'km' ? 'ប្រអប់ឧបករណ៍បង្រៀនក្នុងថ្នាក់ (Classroom Tools)' : 'Classroom Teaching & Utility Widgets'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Teacher Power-Pack
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'km' 
                ? 'ឧបករណ៍ជំនួយបង្រៀន៖ ចាប់ឈ្មោះសិស្សចៃដន្យ, បែងចែកក្រុមការងារស្មើភាព, និងនាឡិការាប់ថយក្រោយ' 
                : 'Random Picker, Balanced Team Generator, and Big Screen Classroom Timer'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('lucky_wheel')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'lucky_wheel'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'km' ? 'កង់សំណាងកែប្រែបាន' : 'Lucky Wheel (Editable)'}</span>
            <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-1 rounded-xs">ថ្មី</span>
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'games'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ហ្គេមអន្តរកម្ម' : 'Mini-Games'}</span>
          </button>
          <button
            onClick={() => setActiveTab('picker')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'picker'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dice5 className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ចាប់ឈ្មោះសិស្ស' : 'Random Picker'}</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'groups'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'បែងចែកក្រុម' : 'Group Maker'}</span>
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'timer'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TimerIcon className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'នាឡិកាកំណត់ម៉ោង' : 'Class Timer'}</span>
          </button>
        </div>
      </div>

      {/* Quick Access to Classroom Power Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('lucky_wheel')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent dark:from-amber-950/40 border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition shadow-2xs flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                <span>{language === 'km' ? 'កង់សំណាងកែប្រែបាន' : 'Editable Lucky Wheel'}</span>
                <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-1 rounded-xs">ថ្មី</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ប្ដូរឈ្មោះ រង្វាន់ & បញ្ចូលបញ្ជីសិស្ស' : 'Custom items, prizes & student roster'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-transparent dark:from-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-2xs flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                <span>{language === 'km' ? 'ហ្គេមអន្តរកម្មក្នុងថ្នាក់' : 'Mini-Games Hub'}</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'គណិតវិទ្យា ភាសាខ្មែរ & ក្ដារពិន្ទុ' : 'Math Blitz, Word Match & Riddles'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
        </button>

        <button
          onClick={() => setNavTab('fluency_exam')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition shadow-2xs flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
              <TimerIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'km' ? 'ប្រឡងល្បឿនអំណាន & គិតលេខ' : 'Speed Reading & Math'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'វាស់ WCPM, កំហុស & ចូលពិន្ទុ' : 'Timed exam & auto gradebook sync'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
        </button>

        <button
          onClick={() => setNavTab('seating')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-2xs flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'km' ? 'ប្លង់តុអង្គុយក្នុងថ្នាក់' : 'Seating Chart'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'Drag & drop និងរៀបតុស្វ័យប្រវត្តិ' : 'Drag & drop interactive grid'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 0: EDITABLE LUCKY WHEEL */}
      {/* ========================================================= */}
      {activeTab === 'lucky_wheel' && <EditableLuckyWheel />}

      {/* ========================================================= */}
      {/* TAB 0.5: INTERACTIVE MINI GAMES */}
      {/* ========================================================= */}
      {activeTab === 'games' && <InteractiveMiniGamesHub />}

      {/* ========================================================= */}
      {/* TAB 1: RANDOM STUDENT PICKER */}
      {/* ========================================================= */}
      {activeTab === 'picker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left / Main: Spinning Canvas & Winner Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 p-6 sm:p-10 rounded-3xl border border-indigo-950 text-white text-center shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
              
              {/* Decorative Glow */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Tag */}
              <span className="px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-sky-300 border border-white/10 mb-6 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'km' ? 'កម្មវិធីចាប់ឈ្មោះសិស្សឆ្លើយសំណួរ ឬ ឡើងធ្វើលំហាត់' : 'Classroom Roulette Picker'}</span>
              </span>

              {/* Big Animated Display Box */}
              <div className="w-full max-w-lg bg-slate-950/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl my-2">
                <div className="text-3xs uppercase tracking-widest text-sky-400 font-bold mb-2">
                  {isSpinning 
                    ? (language === 'km' ? 'កំពុងជ្រើសរើស...' : 'SPINNING...') 
                    : (selectedStudent ? (language === 'km' ? '🎉 សិស្សដែលបានជ្រើសរើស' : 'SELECTED WINNER') : (language === 'km' ? 'ត្រៀមចាប់ឈ្មោះ' : 'READY'))}
                </div>

                <div className={`text-3xl sm:text-5xl font-black transition-all duration-100 ${
                  isSpinning 
                    ? 'text-amber-400 scale-95 blur-2xs' 
                    : (selectedStudent ? 'text-white scale-105' : 'text-slate-400')
                }`}>
                  {displayName}
                </div>

                {selectedStudent && !isSpinning && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold">
                      {selectedStudent.gender === 'Female' ? 'សិស្សស្រី' : 'សិស្សប្រុស'}
                    </span>
                  </div>
                )}
              </div>

              {/* Spin Button */}
              <div className="mt-6 flex items-center space-x-3">
                <button
                  onClick={spinRandomPicker}
                  disabled={isSpinning || eligibleStudents.length === 0}
                  className={`px-8 py-4 rounded-2xl font-black text-base shadow-xl transition transform active:scale-95 cursor-pointer flex items-center space-x-2.5 ${
                    isSpinning || eligibleStudents.length === 0
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/25'
                  }`}
                >
                  <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? (language === 'km' ? 'កំពុងចាប់...' : 'Picking...') : (language === 'km' ? 'ចាប់ឈ្មោះសិស្ស (Pick Random)' : 'Pick Student!')}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Sidebar: Filter Options & History */}
          <div className="space-y-4">
            
            {/* Filter Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'km' ? 'ជម្រើសនៃការចាប់ឈ្មោះ' : 'Picker Settings'}
              </h3>

              <div>
                <label className="block text-2xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  {language === 'km' ? 'ជ្រើសរើសភេទ' : 'Gender Filter'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {(['All', 'Female', 'Male'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setPickerGender(g)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        pickerGender === g
                          ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {g === 'All' ? (language === 'km' ? 'ទាំងអស់' : 'All') : (g === 'Female' ? (language === 'km' ? 'ស្រី' : 'Girls') : (language === 'km' ? 'ប្រុស' : 'Boys'))}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preventRepeat}
                    onChange={(e) => setPreventRepeat(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>{language === 'km' ? 'មិនចាប់សិស្សដែលធ្លាប់បានឆ្លើយម្តងទៀត' : 'No repeats in current session'}</span>
                </label>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  {language === 'km' ? 'សិស្សនៅសល់ក្នុងប្រអប់៖' : 'Remaining eligible:'}
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                  {eligibleStudents.length} / {classStudents.length}
                </span>
              </div>
            </div>

            {/* History Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{language === 'km' ? 'ប្រវត្តិចាប់ឈ្មោះ' : 'Session History'}</span>
                  <span className="text-2xs font-mono text-slate-400">({pickedHistory.length})</span>
                </h3>

                {pickedHistory.length > 0 && (
                  <button
                    onClick={resetPickerHistory}
                    className="text-2xs font-bold text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {pickedHistory.map((s, idx) => (
                  <div 
                    key={`${s.id}_${idx}`}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-2xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                    </div>
                    <span className="text-2xs font-mono text-slate-400">{s.studentId}</span>
                  </div>
                ))}

                {pickedHistory.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    {language === 'km' ? 'មិនទាន់មានសិស្សត្រូវបានចាប់ឈ្មោះនៅឡើយ' : 'No students picked yet'}
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TOOL 2: FAIR GROUP GENERATOR */}
      {/* ========================================================= */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ចំនួនក្រុមដែលត្រូវបង្កើត' : 'Number of Groups'}
                </label>
                <div className="flex items-center space-x-1.5">
                  {[2, 3, 4, 5, 6, 8].map(num => (
                    <button
                      key={num}
                      onClick={() => setGroupCount(num)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                        groupCount === num
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'រូបមន្តបែងចែក' : 'Balance Strategy'}
                </label>
                <select
                  value={groupStrategy}
                  onChange={(e) => setGroupStrategy(e.target.value as any)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="gender_balanced">⚖️ {language === 'km' ? 'សមាមាត្រប្រុស-ស្រីស្មើគ្នា (Gender Balanced)' : 'Gender Balanced'}</option>
                  <option value="ability_balanced">🌟 {language === 'km' ? 'បែងចែកសិស្សពូកែ/មធ្យមស្មើគ្នា (Mixed-Ability)' : 'Academic Mixed-Ability'}</option>
                  <option value="random">🎲 {language === 'km' ? 'ចៃដន្យសុទ្ធសាធ (Pure Random)' : 'Pure Random'}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={generateGroups}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>{language === 'km' ? 'បែងចែកក្រុមឥឡូវនេះ (Generate)' : 'Generate Groups'}</span>
              </button>

              {generatedGroups.length > 0 && (
                <>
                  <button
                    onClick={copyGroupsToClipboard}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {copiedGroups ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGroups ? (language === 'km' ? 'បានចម្លង!' : 'Copied!') : (language === 'km' ? 'ចម្លងបញ្ជី' : 'Copy List')}</span>
                  </button>

                  <PrintToPdfButton
                    targetElementId="classroom-groups-sheet"
                    documentTitle={`Class_Groups_${activeClass?.nameKm || 'Class6'}`}
                    pageSize="a4"
                    orientation="portrait"
                    variant="primary"
                    className="text-xs py-2 px-3.5"
                  />
                </>
              )}
            </div>

          </div>

          {/* Groups Display Grid */}
          {generatedGroups.length > 0 ? (
            <div id="classroom-groups-sheet" className="p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-slate-200 dark:border-slate-800">
              
              {/* MoEYS Official Sheet Header when Printing */}
              <div className="text-center space-y-1 mb-6 pt-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
                  បញ្ជីឈ្មោះក្រុមការងារសិស្សក្នុងថ្នាក់ (CLASSROOM ACTIVITY GROUPS)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeClass?.nameKm || 'ថ្នាក់ទី៦'} • {activeClass?.schoolNameKm || 'សាលាបឋមសិក្សា'} • ឆ្នាំសិក្សា {activeClass?.academicYear || '2026-2027'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {generatedGroups.map(group => (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    {/* Group Header Card */}
                    <div className={`p-4 bg-gradient-to-r ${group.color} text-white flex items-center justify-between`}>
                      <div>
                        <h4 className="font-black text-sm">{group.nameKm}</h4>
                        <p className="text-2xs text-white/80 font-medium">{group.nameEn}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-white/20 backdrop-blur-md">
                        {group.members.length} {language === 'km' ? 'នាក់' : 'members'}
                      </span>
                    </div>

                    {/* Member List */}
                    <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
                      {group.members.map((stu, mIdx) => (
                        <div 
                          key={stu.id}
                          className="py-2 px-1 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-2xs flex items-center justify-center font-bold">
                              {mIdx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{stu.name}</div>
                            </div>
                          </div>

                          <span className={`px-1.5 py-0.5 rounded text-3xs font-bold ${
                            stu.gender === 'Female' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' 
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}>
                            {stu.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                {language === 'km' ? 'មិនទាន់បានបែងចែកក្រុមនៅឡើយ' : 'No groups generated yet'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {language === 'km' 
                  ? 'ជ្រើសរើសចំនួនក្រុម និងរូបមន្តបែងចែកខាងលើ រួចចុចលើប៊ូតុង "បែងចែកក្រុមឥឡូវនេះ"' 
                  : 'Choose group count and balancing strategy above, then click "Generate Groups"'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TOOL 3: CLASSROOM COUNTDOWN TIMER & STOPWATCH */}
      {/* ========================================================= */}
      {activeTab === 'timer' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Main: Big Digital Display */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 sm:p-12 rounded-3xl border border-indigo-950 text-white text-center shadow-2xl flex flex-col items-center justify-center space-y-6">
              
              {/* Mode switch */}
              <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <button
                  onClick={() => { setTimerMode('countdown'); setIsTimerRunning(false); }}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    timerMode === 'countdown' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {language === 'km' ? 'រាប់ថយក្រោយ (Countdown)' : 'Countdown'}
                </button>
                <button
                  onClick={() => { setTimerMode('stopwatch'); setIsTimerRunning(false); }}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    timerMode === 'stopwatch' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {language === 'km' ? 'ស្ទង់ពេល (Stopwatch)' : 'Stopwatch'}
                </button>
              </div>

              {/* Huge Digital Clock */}
              <div className="font-mono text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-white drop-shadow-lg select-none py-4">
                {timerMode === 'countdown' ? formatTime(remainingSeconds) : formatTime(stopwatchSeconds)}
              </div>

              {/* Progress Bar for countdown */}
              {timerMode === 'countdown' && (
                <div className="w-full max-w-md h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (remainingSeconds / (totalSeconds || 1)) * 100))}%` }}
                  ></div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-8 py-3.5 rounded-2xl font-black text-base transition transform active:scale-95 shadow-xl flex items-center space-x-2 cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  <span>{isTimerRunning ? (language === 'km' ? 'ផ្អាក (Pause)' : 'Pause') : (language === 'km' ? 'ចាប់ផ្តើម (Start)' : 'Start')}</span>
                </button>

                <button
                  onClick={resetTimer}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/10"
                  title="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {timerMode === 'countdown' && (
                  <button
                    onClick={() => addTimeSeconds(60)}
                    className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/10"
                  >
                    +1 {language === 'km' ? 'នាទី' : 'Min'}
                  </button>
                )}

                {timerMode === 'stopwatch' && isTimerRunning && (
                  <button
                    onClick={recordLap}
                    className="px-4 py-3.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs transition cursor-pointer border border-sky-400/30 flex items-center space-x-1"
                  >
                    <Flag className="w-4 h-4" />
                    <span>{language === 'km' ? 'កត់ត្រាជុំ (Lap)' : 'Lap'}</span>
                  </button>
                )}

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer border ${
                    soundEnabled 
                      ? 'bg-white/10 text-white border-white/10' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                  title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

            </div>

            {/* Right Sidebar: Preset Buttons & Laps */}
            <div className="space-y-4">
              
              {/* Presets Card */}
              {timerMode === 'countdown' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'km' ? 'កំណត់ម៉ោងរហ័ស (Quick Presets)' : 'Quick Timer Presets'}
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { mins: 1, labelKm: '១ នាទី (អានល្បឿន)' },
                      { mins: 3, labelKm: '៣ នាទី (កម្តៅសាច់ដុំ)' },
                      { mins: 5, labelKm: '៥ នាទី (ពិភាក្សាក្រុម)' },
                      { mins: 10, labelKm: '១០ នាទី (លំហាត់ថ្នាក់)' },
                      { mins: 15, labelKm: '១៥ នាទី (កិច្ចការផ្ទាល់ខ្លួន)' },
                      { mins: 20, labelKm: '២០ នាទី (ប្រឡងសាកល្បង)' }
                    ].map(p => (
                      <button
                        key={p.mins}
                        onClick={() => handleSetPresetTimer(p.mins)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                          totalSeconds === p.mins * 60
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs">{p.mins} {language === 'km' ? 'នាទី' : 'Mins'}</div>
                        <div className="text-3xs text-slate-400 mt-0.5">{p.labelKm}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stopwatch Laps Card */}
              {timerMode === 'stopwatch' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Flag className="w-4 h-4 text-sky-600" />
                    <span>{language === 'km' ? 'កំណត់ត្រាជុំស្ទង់ពេល (Laps)' : 'Split / Lap Records'}</span>
                  </h3>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                    {laps.map(lap => (
                      <div 
                        key={lap.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {language === 'km' ? `ជុំទី ${lap.id}` : `Lap ${lap.id}`}
                        </span>
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                          {lap.timeFormatted}
                        </span>
                      </div>
                    ))}

                    {laps.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6 italic">
                        {language === 'km' ? 'ចុចលើប៊ូតុង "កត់ត្រាជុំ" ដើម្បីកត់ត្រាពេលវេលា' : 'Click "Lap" while running to record splits'}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
