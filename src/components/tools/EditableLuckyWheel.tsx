import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Shuffle, 
  Users, 
  Award, 
  Gift, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Copy, 
  Check, 
  Settings2, 
  HelpCircle,
  Trophy,
  Scissors,
  Star,
  ChevronDown
} from 'lucide-react';
import { useGradebook } from '../../context/GradebookContext';
import { gameAudio } from '../../utils/gameAudio';

export interface WheelSliceItem {
  id: string;
  text: string;
  color: string;
  subText?: string;
}

// 14 carefully balanced, high-contrast, beautiful classroom palette colors
export const WHEEL_PALETTE = [
  '#2563eb', // Royal Blue
  '#16a34a', // Vivid Green
  '#ea580c', // Tangerine Orange
  '#9333ea', // Deep Purple
  '#e11d48', // Crimson Rose
  '#0891b2', // Ocean Cyan
  '#d97706', // Warm Amber
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#db2777', // Pink Fuchsia
  '#ca8a04', // Golden Yellow
  '#7c3aed', // Bright Violet
  '#0284c7', // Sky Blue
  '#dc2626', // Bright Red
];

// Preset 1: Classroom Rewards & Motivations
const DEFAULT_REWARD_SLICES: WheelSliceItem[] = [
  { id: '1', text: 'ផ្កាយមាសកិត្តិយស', subText: '⭐️ លើកទឹកចិត្ត', color: '#f59e0b' },
  { id: '2', text: 'ជ្រើសរើសកន្លែងអង្គុយ ១ថ្ងៃ', subText: '🪑 អង្គុយតុមុខ', color: '#2563eb' },
  { id: '3', text: 'មេក្រុមប្រចាំថ្ងៃ', subText: '👑 ដឹកនាំមិត្តភក្តិ', color: '#9333ea' },
  { id: '4', text: 'លើកលែងកិច្ចការផ្ទះ ១លំហាត់', subText: '📝 បន្ធូរបន្ថយ', color: '#16a34a' },
  { id: '5', text: 'ជួយគ្រូចែកសៀវភៅ', subText: '📚 ជំនួយការគ្រូ', color: '#ea580c' },
  { id: '6', text: 'ច្រៀងចម្រៀង ១បទ', subText: '🎤 បង្ហាញទេពកោសល្យ', color: '#db2777' },
  { id: '7', text: 'ស្ទីគ័ររូបសត្វគួរឱ្យស្រឡាញ់', subText: '🐼 រង្វាន់អនុស្សាវរីយ៍', color: '#0891b2' },
  { id: '8', text: 'បន្ថែម ៥ ពិន្ទុលើកទឹកចិត្ត', subText: '💯 ពិន្ទុបន្ថែម', color: '#e11d48' },
];

// Preset 2: Bonus Points
const BONUS_POINTS_SLICES: WheelSliceItem[] = [
  { id: 'bp-1', text: '+៥ ពិន្ទុលើកទឹកចិត្ត', subText: 'ផ្កាយមាស ១', color: '#2563eb' },
  { id: 'bp-2', text: '+១០ ពិន្ទុលើកទឹកចិត្ត', subText: 'ផ្កាយមាស ២', color: '#16a34a' },
  { id: 'bp-3', text: '+១៥ ពិន្ទុលើកទឹកចិត្ត', subText: 'ផ្កាយមាស ៣', color: '#d97706' },
  { id: 'bp-4', text: '+២០ ពិន្ទុអស្ចារ្យ', subText: 'កំពូលពិន្ទុ', color: '#9333ea' },
  { id: 'bp-5', text: 'ទ្វេដង x២ ពិន្ទុ', subText: 'គុណនឹង ២', color: '#e11d48' },
  { id: 'bp-6', text: 'សំណាងល្អលើកក្រោយ', subText: 'ព្យាយាមម្តងទៀត', color: '#0891b2' },
];

// Preset 3: Classroom Challenges & Icebreakers
const CHALLENGE_SLICES: WheelSliceItem[] = [
  { id: 'ch-1', text: 'គិតលេខបូករហ័ស ១លំហាត់', subText: 'គណិតវិទ្យា', color: '#2563eb' },
  { id: 'ch-2', text: 'អានអត្ថបទ ១កថាខណ្ឌ', subText: 'ភាសាខ្មែរ', color: '#16a34a' },
  { id: 'ch-3', text: 'សរសេរពាក្យលើក្តារខៀន', subText: 'អក្ខរាវិរុទ្ធ', color: '#ea580c' },
  { id: 'ch-4', text: 'ប្រាប់ឈ្មោះខេត្ត ៣ នៅកម្ពុជា', subText: 'ភូមិវិទ្យា', color: '#9333ea' },
  { id: 'ch-5', text: 'ធ្វើកាយវិការកំប្លែង ៥វិនាទី', subText: 'ភាពរីករាយ', color: '#db2777' },
  { id: 'ch-6', text: 'ដោះស្រាយល្បងប្រាជ្ញា ១សំណួរ', subText: 'បញ្ញាឈ្លាសវៃ', color: '#0891b2' },
];

// Preset 4: Classroom Duty / Chores
const CHORE_SLICES: WheelSliceItem[] = [
  { id: 'cr-1', text: 'មេថ្នាក់ដឹកនាំគោរពទង់ជាតិ', subText: 'ភារកិច្ចមេថ្នាក់', color: '#2563eb' },
  { id: 'cr-2', text: 'សម្អាតក្តារខៀនឱ្យស្អាត', subText: 'អនាម័យក្តារខៀន', color: '#16a34a' },
  { id: 'cr-3', text: 'ត្រួតពិនិត្យអនាម័យតុរៀន', subText: 'សណ្តាប់ធ្នាប់', color: '#d97706' },
  { id: 'cr-4', text: 'បិទបើកភ្លើង និងកង្ហារ', subText: 'សន្សំសំចៃអគ្គិសនី', color: '#9333ea' },
  { id: 'cr-5', text: 'ប្រមូលសៀវភៅកិច្ចការ', subText: 'ជំនួយការគ្រូ', color: '#ea580c' },
  { id: 'cr-6', text: 'រៀបចំតុគ្រូឱ្យមានរបៀប', subText: 'ការគួរសម', color: '#0891b2' },
];

const STORAGE_KEY = 'teacher_powerpack_lucky_wheel_slices_v1';
const SETTINGS_KEY = 'teacher_powerpack_lucky_wheel_settings_v1';

export const EditableLuckyWheel: React.FC = () => {
  const { language, activeClass, classStudents, showToast } = useGradebook();

  // Wheel Items state with local persistence
  const [slices, setSlices] = useState<WheelSliceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_REWARD_SLICES;
  });

  // Settings
  const [autoEliminate, setAutoEliminate] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) return JSON.parse(s).autoEliminate ?? false;
    } catch {}
    return false;
  });
  const [spinDuration, setSpinDuration] = useState<number>(5); // 3, 5, 8
  const [isMuted, setIsMuted] = useState<boolean>(gameAudio.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Wheel Spin Animation State
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState<number>(0);
  const [winningSlice, setWinningSlice] = useState<WheelSliceItem | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'items' | 'presets' | 'bulk'>('items');

  // New Slice Form
  const [newItemText, setNewItemText] = useState('');
  const [newItemSubtext, setNewItemSubtext] = useState('');
  const [selectedColor, setSelectedColor] = useState(WHEEL_PALETTE[0]);

  // Bulk Import state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkMode, setBulkMode] = useState<'replace' | 'append'>('replace');

  // Container ref for fullscreen
  const containerRef = useRef<HTMLDivElement>(null);

  // Save slices on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slices));
    } catch {}
  }, [slices]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ autoEliminate }));
    } catch {}
  }, [autoEliminate]);

  // Toggle Mute
  const toggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) gameAudio.playClick();
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // -------------------------------------------------------------
  // SPIN WHEEL ENGINE
  // -------------------------------------------------------------
  const spinWheel = () => {
    if (isSpinning) return;
    if (slices.length < 2) {
      showToast(
        language === 'km' ? 'សូមបញ្ចូលយ៉ាងតិច ២ ធាតុដើម្បីបង្វិលកង់' : 'Please add at least 2 items to spin the wheel', 
        'warning'
      );
      return;
    }

    setShowWinnerModal(false);
    setWinningSlice(null);
    setIsSpinning(true);
    gameAudio.playClick();

    const numSlices = slices.length;
    const sliceAngle = 360 / numSlices;

    // Pick random target slice
    const winningIdx = Math.floor(Math.random() * numSlices);
    const targetSlice = slices[winningIdx];

    // Pointer is at TOP (270 degrees in SVG coordinates)
    // When wheel rotates by R degrees:
    // (270 - (R % 360) + 360) % 360 falls inside [winningIdx * sliceAngle, (winningIdx + 1) * sliceAngle]
    // Center of winning slice is at:
    const sliceCenterAngle = (winningIdx + 0.5) * sliceAngle;
    // We want (270 - (R % 360) + 360) % 360 = sliceCenterAngle
    // => (R % 360) = (270 - sliceCenterAngle + 360) % 360
    const desiredModulo = (270 - sliceCenterAngle + 360) % 360;

    // We do at least 5 to 8 full turns
    const fullSpins = (spinDuration >= 8 ? 10 : spinDuration >= 5 ? 6 : 4);
    const currentRot = rotation;
    const baseRot = currentRot + fullSpins * 360;
    const currentModulo = baseRot % 360;
    let diff = desiredModulo - currentModulo;
    if (diff < 0) diff += 360;

    // Add slight random jitter within center of slice (±35% of slice half-width)
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.5);
    const finalRot = baseRot + diff + jitter;

    // Ticking audio interval simulation
    const totalDurationMs = spinDuration * 1000;
    const tickInterval = Math.max(70, Math.floor(totalDurationMs / (fullSpins * numSlices * 1.5)));
    let ticksPlayed = 0;
    const maxTicks = Math.min(60, fullSpins * numSlices);
    const soundInterval = setInterval(() => {
      ticksPlayed++;
      gameAudio.playWheelSpinTick();
      if (ticksPlayed >= maxTicks) clearInterval(soundInterval);
    }, tickInterval);

    setRotation(finalRot);

    // End of spin
    setTimeout(() => {
      clearInterval(soundInterval);
      setIsSpinning(false);
      setWinningSlice(targetSlice);
      setShowWinnerModal(true);
      gameAudio.playFanfare();

      if (autoEliminate) {
        // Automatically schedule removal of winner from wheel if toggle is on
        handleEliminateSlice(targetSlice.id, false);
      }
    }, totalDurationMs);
  };

  // Add Item to Slices
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    const newItem: WheelSliceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      text: trimmed,
      subText: newItemSubtext.trim() || undefined,
      color: selectedColor || WHEEL_PALETTE[slices.length % WHEEL_PALETTE.length],
    };

    setSlices(prev => [...prev, newItem]);
    setNewItemText('');
    setNewItemSubtext('');
    // Rotate to next palette color
    const nextColorIdx = (WHEEL_PALETTE.indexOf(selectedColor) + 1) % WHEEL_PALETTE.length;
    setSelectedColor(WHEEL_PALETTE[nextColorIdx]);
    showToast(language === 'km' ? 'បានបន្ថែមធាតុទៅក្នុងកង់' : 'Added item to lucky wheel', 'success');
  };

  // Delete Slice
  const handleDeleteSlice = (id: string) => {
    if (slices.length <= 2) {
      showToast(
        language === 'km' ? 'កង់ត្រូវមានយ៉ាងតិច ២ ធាតុ' : 'Wheel must have at least 2 items',
        'warning'
      );
      return;
    }
    setSlices(prev => prev.filter(s => s.id !== id));
    gameAudio.playClick();
  };

  // Eliminate winning slice
  const handleEliminateSlice = (id: string, notify = true) => {
    if (slices.length <= 2) {
      if (notify) {
        showToast(
          language === 'km' ? 'មិនអាចលុបបានទេ (កង់ត្រូវមានយ៉ាងតិច ២ ធាតុ)' : 'Cannot eliminate (wheel needs at least 2 items)',
          'warning'
        );
      }
      return;
    }
    setSlices(prev => prev.filter(s => s.id !== id));
    if (notify) {
      showToast(
        language === 'km' ? 'បានកាត់ធាតុដែលឈ្នះចេញពីកង់' : 'Eliminated winner from wheel',
        'info'
      );
      setShowWinnerModal(false);
    }
  };

  // Update Slice Item
  const handleUpdateSlice = (id: string, updates: Partial<WheelSliceItem>) => {
    setSlices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Shuffle Slices
  const handleShuffle = () => {
    gameAudio.playClick();
    setSlices(prev => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    showToast(language === 'km' ? 'បានច្របល់លំដាប់ធាតុចៃដន្យ' : 'Shuffled items', 'info');
  };

  // 1-Click Load Students from active class
  const handleLoadClassStudents = () => {
    if (!classStudents || classStudents.length === 0) {
      showToast(
        language === 'km' ? 'មិនទាន់មានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ' : 'No students found in current class roster',
        'warning'
      );
      return;
    }

    gameAudio.playClick();
    const studentSlices: WheelSliceItem[] = classStudents.map((stu, idx) => ({
      id: `student-${stu.id}`,
      text: stu.name,
      subText: stu.studentId ? `#${stu.studentId}` : (stu.gender === 'Female' ? 'សិស្សស្រី' : 'សិស្សប្រុស'),
      color: WHEEL_PALETTE[idx % WHEEL_PALETTE.length],
    }));

    setSlices(studentSlices);
    showToast(
      language === 'km' 
        ? `បានបញ្ចូលឈ្មោះសិស្ស ${studentSlices.length} នាក់ពីថ្នាក់ ${activeClass?.name || ''}` 
        : `Loaded ${studentSlices.length} students from class roster`,
      'success'
    );
  };

  // Load Preset
  const handleLoadPreset = (presetName: 'rewards' | 'bonus' | 'challenges' | 'chores') => {
    gameAudio.playClick();
    if (presetName === 'rewards') setSlices(DEFAULT_REWARD_SLICES);
    else if (presetName === 'bonus') setSlices(BONUS_POINTS_SLICES);
    else if (presetName === 'challenges') setSlices(CHALLENGE_SLICES);
    else if (presetName === 'chores') setSlices(CHORE_SLICES);

    showToast(language === 'km' ? 'បានផ្ទុកគំរូកង់ជោគជ័យ' : 'Loaded wheel preset', 'success');
  };

  // Handle Bulk Import
  const handleBulkImport = () => {
    const lines = bulkInput
      .split(/[\n,]+/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length < 2 && bulkMode === 'replace') {
      showToast(
        language === 'km' ? 'សូមបញ្ចូលយ៉ាងតិច ២ ធាតុ (១ជួរ = ១ធាតុ ឬខណ្ឌដោយក្បៀស)' : 'Please enter at least 2 items',
        'warning'
      );
      return;
    }

    const newItems: WheelSliceItem[] = lines.map((text, idx) => ({
      id: 'bulk-' + Date.now() + '-' + idx,
      text,
      color: WHEEL_PALETTE[(idx + (bulkMode === 'append' ? slices.length : 0)) % WHEEL_PALETTE.length],
    }));

    if (bulkMode === 'replace') {
      setSlices(newItems);
    } else {
      setSlices(prev => [...prev, ...newItems]);
    }

    setBulkInput('');
    setActiveEditorTab('items');
    gameAudio.playCorrect();
    showToast(
      language === 'km' ? `បានបញ្ចូល ${newItems.length} ធាតុទៅក្នុងកង់សំណាង` : `Imported ${newItems.length} items`,
      'success'
    );
  };

  // -------------------------------------------------------------
  // SVG WHEEL PATH RENDERING MATH
  // -------------------------------------------------------------
  const wheelSize = 420;
  const center = wheelSize / 2;
  const radius = wheelSize / 2 - 16;
  const numSlices = Math.max(1, slices.length);
  const sliceAngleDeg = 360 / numSlices;
  const sliceAngleRad = (2 * Math.PI) / numSlices;

  const svgSlices = useMemo(() => {
    return slices.map((slice, idx) => {
      const startAngle = idx * sliceAngleRad;
      const endAngle = (idx + 1) * sliceAngleRad;

      // Coordinates on wheel circumference
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      // Large arc flag
      const largeArc = sliceAngleRad > Math.PI ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      // Angle for text rotation (in degrees)
      const midAngleDeg = (idx + 0.5) * sliceAngleDeg;

      // Text distance from center (approx 62% of radius)
      const textRadius = radius * 0.62;

      return {
        slice,
        pathData,
        midAngleDeg,
        textRadius,
      };
    });
  }, [slices, numSlices, sliceAngleRad, sliceAngleDeg, radius, center]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-2xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                Teacher Power Pack
              </span>
              <span className="text-2xs font-bold text-slate-500 dark:text-slate-400">
                {slices.length} {language === 'km' ? 'ធាតុលើកង់' : 'Slices'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-white mt-0.5">
              {language === 'km' ? 'កង់សំណាងកែប្រែបាន (Editable Lucky Wheel)' : 'Editable Classroom Lucky Wheel'}
            </h2>
          </div>
        </div>

        {/* Global Toolbar Options */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSound}
            title={isMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              !isMuted 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title={language === 'km' ? 'ពង្រីកពេញអេក្រង់' : 'Fullscreen'}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Wheel Arena & Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE WHEEL STAGE (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-950 shadow-xl text-white flex flex-col items-center justify-center relative overflow-hidden min-h-[520px]">
          
          {/* Subtle Ambient Stage Lights */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Wheel Pointer at TOP */}
          <div className="relative z-30 mb-[-18px] flex flex-col items-center">
            <div className={`w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)] ${isSpinning ? 'animate-bounce' : ''}`} />
            <div className="w-3 h-3 rounded-full bg-amber-300 border-2 border-slate-950 mt-[-24px] shadow-sm" />
          </div>

          {/* The Rotating Wheel */}
          <div className="relative z-20 flex items-center justify-center p-2">
            <div 
              style={{
                width: wheelSize,
                height: wheelSize,
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? `transform ${spinDuration}s cubic-bezier(0.15, 0.9, 0.2, 1)` : 'none',
              }}
              className="rounded-full shadow-2xl relative select-none"
            >
              <svg 
                viewBox={`0 0 ${wheelSize} ${wheelSize}`}
                className="w-full h-full rounded-full"
              >
                <defs>
                  {/* Outer Rim Gold Gradient */}
                  <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>
                  {/* Center Hub Gradient */}
                  <radialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </radialGradient>
                </defs>

                {/* Outer Decorative Ring */}
                <circle 
                  cx={center} 
                  cy={center} 
                  r={radius + 8} 
                  fill="none" 
                  stroke="url(#goldRim)" 
                  strokeWidth="8"
                  className="filter drop-shadow-md"
                />

                {/* Slices */}
                {svgSlices.map((item, i) => (
                  <g key={item.slice.id}>
                    <path
                      d={item.pathData}
                      fill={item.slice.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                    
                    {/* Slice Text Label */}
                    <g 
                      transform={`rotate(${item.midAngleDeg} ${center} ${center}) translate(${center + item.textRadius}, ${center})`}
                    >
                      <text
                        x={0}
                        y={0}
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-black select-none pointer-events-none"
                        style={{
                          fontSize: numSlices > 24 ? '9px' : numSlices > 16 ? '11px' : numSlices > 10 ? '12px' : '14px',
                          textShadow: '0 1px 3px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {item.slice.text.length > 14 ? item.slice.text.slice(0, 13) + '…' : item.slice.text}
                      </text>
                    </g>
                  </g>
                ))}

                {/* Outer Border Pins / Pegs */}
                {Array.from({ length: Math.min(36, numSlices * 2) }).map((_, i) => {
                  const angle = (i * 2 * Math.PI) / Math.min(36, numSlices * 2);
                  const pinX = center + (radius + 4) * Math.cos(angle);
                  const pinY = center + (radius + 4) * Math.sin(angle);
                  return (
                    <circle 
                      key={`pin-${i}`}
                      cx={pinX} 
                      cy={pinY} 
                      r="2.5" 
                      fill="#ffffff" 
                      stroke="#475569"
                      strokeWidth="0.8"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Interactive Center Hub Spin Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning || slices.length < 2}
              className={`absolute z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 font-black shadow-2xl border-4 border-white flex flex-col items-center justify-center transition transform active:scale-95 cursor-pointer ${
                isSpinning ? 'opacity-80 scale-95' : 'hover:scale-105 hover:shadow-amber-500/50'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-950 mb-0.5 animate-spin" style={{ animationDuration: isSpinning ? '1s' : '4s' }} />
              <span className="text-xs sm:text-sm tracking-tight font-heading">
                {isSpinning ? (language === 'km' ? 'កំពុងបង្វិល…' : 'Spinning…') : (language === 'km' ? 'បង្វិល' : 'SPIN')}
              </span>
            </button>
          </div>

          {/* Quick Spin Trigger and Duration Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 relative z-20 w-full max-w-md">
            <button
              onClick={spinWheel}
              disabled={isSpinning || slices.length < 2}
              className={`flex-1 py-3 px-6 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                isSpinning || slices.length < 2
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 shadow-amber-500/20 border border-amber-300'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'km' ? 'ចុចបង្វិលកង់សំណាង' : 'Spin Lucky Wheel'}</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={isSpinning}
              title={language === 'km' ? 'ច្របល់លំដាប់ធាតុ' : 'Shuffle items'}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Spin Duration Selector */}
            <div className="flex items-center bg-white/10 rounded-2xl p-1 border border-white/15 text-xs">
              {[3, 5, 8].map(dur => (
                <button
                  key={dur}
                  onClick={() => setSpinDuration(dur)}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
                    spinDuration === dur 
                      ? 'bg-amber-400 text-slate-950 shadow-xs' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Auto Eliminate Option Bar */}
          <div className="mt-4 flex items-center space-x-2 text-xs text-slate-300 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
            <input
              id="auto-eliminate"
              type="checkbox"
              checked={autoEliminate}
              onChange={(e) => setAutoEliminate(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
            />
            <label htmlFor="auto-eliminate" className="cursor-pointer select-none">
              {language === 'km' ? 'កាត់ធាតុដែលឈ្នះចេញពីកង់ស្វ័យប្រវត្តិ (Eliminate Winner)' : 'Auto-eliminate winning slice'}
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN: SLICE EDITOR & PRESET CONTROLS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Editor Tabs */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-1">
            <button
              onClick={() => setActiveEditorTab('items')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeEditorTab === 'items'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? `បញ្ជីធាតុ (${slices.length})` : `Items (${slices.length})`}</span>
            </button>
            <button
              onClick={() => setActiveEditorTab('presets')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeEditorTab === 'presets'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'គំរូស្រាប់' : 'Presets'}</span>
            </button>
            <button
              onClick={() => setActiveEditorTab('bulk')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeEditorTab === 'bulk'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បញ្ចូលជាបាច់' : 'Bulk Paste'}</span>
            </button>
          </div>

          {/* TAB 1: ITEMS EDITOR */}
          {activeEditorTab === 'items' && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              
              {/* Add New Item Form */}
              <form onSubmit={handleAddItem} className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'km' ? 'បន្ថែមធាតុថ្មីទៅលើកង់' : 'Add New Item to Wheel'}</span>
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder={language === 'km' ? 'ឈ្មោះសិស្ស រង្វាន់ ឬសំណួរ…' : 'Enter name, prize or task…'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newItemSubtext}
                      onChange={(e) => setNewItemSubtext(e.target.value)}
                      placeholder={language === 'km' ? 'កំណត់សម្គាល់បន្ថែម (ស្រេចចិត្ត)' : 'Subtext (optional)'}
                      className="flex-1 px-3 py-1.5 text-2xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden"
                    />

                    {/* Color Swatch Picker */}
                    <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div 
                        className="w-5 h-5 rounded-full border border-white shadow-xs shrink-0" 
                        style={{ backgroundColor: selectedColor }}
                      />
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="text-2xs font-semibold bg-transparent text-slate-700 dark:text-slate-300 border-none focus:outline-hidden cursor-pointer"
                      >
                        {WHEEL_PALETTE.map((c, i) => (
                          <option key={c} value={c}>ពណ៌ {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newItemText.trim()}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បញ្ចូលធាតុ' : 'Add Slice'}</span>
                </button>
              </form>

              {/* Slices List with Scrollbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-2xs font-bold text-slate-500 dark:text-slate-400 px-1">
                  <span>{language === 'km' ? 'បញ្ជីធាតុទាំងអស់' : 'All Slices'} ({slices.length})</span>
                  <span>{language === 'km' ? 'ចុចលើឈ្មោះដើម្បីកែប្រែ' : 'Editable inline'}</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {slices.map((slice, idx) => (
                    <div
                      key={slice.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 hover:border-amber-300 dark:hover:border-amber-700 transition group"
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        {/* Slice Color Circle */}
                        <input
                          type="color"
                          value={slice.color}
                          onChange={(e) => handleUpdateSlice(slice.id, { color: e.target.value })}
                          title={language === 'km' ? 'ផ្លាស់ប្តូរពណ៌' : 'Change color'}
                          className="w-5 h-5 rounded-full border border-white shadow-2xs cursor-pointer shrink-0 p-0 overflow-hidden"
                        />
                        
                        {/* Editable Name */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={slice.text}
                            onChange={(e) => handleUpdateSlice(slice.id, { text: e.target.value })}
                            className="w-full text-xs font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent focus:border-amber-500 focus:outline-hidden py-0.5"
                          />
                          {slice.subText && (
                            <p className="text-[10px] text-slate-400 truncate">
                              {slice.subText}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteSlice(slice.id)}
                        disabled={slices.length <= 2}
                        title={language === 'km' ? 'លុបធាតុនេះ' : 'Delete item'}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESETS */}
          {activeEditorTab === 'presets' && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {language === 'km' ? 'ជ្រើសរើសគំរូកង់សំណាងដែលរៀបចំស្រាប់' : 'Choose a ready-to-use classroom preset'}
              </p>

              {/* 1-Click Load Students from Class Roster */}
              <button
                onClick={handleLoadClassStudents}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 hover:border-blue-400 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-950 dark:text-blue-200">
                      {language === 'km' ? `សិស្សទាំងអស់ក្នុងថ្នាក់ (${classStudents.length} នាក់)` : `Current Class Students (${classStudents.length})`}
                    </p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400">
                      {activeClass?.name ? `ថ្នាក់ ${activeClass.name}` : 'ផ្ទុកឈ្មោះសិស្សទាំងអស់ចូលកង់ភ្លាមៗ'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-blue-500 -rotate-90" />
              </button>

              {/* Preset: Rewards */}
              <button
                onClick={() => handleLoadPreset('rewards')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'km' ? 'រង្វាន់ & ការលើកទឹកចិត្តក្នុងថ្នាក់' : 'Classroom Rewards & Perks'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {language === 'km' ? 'ផ្កាយមាស, កន្លែងអង្គុយ, មេក្រុម, លើកលែងកិច្ចការ' : 'Gold star, seat choice, team leader, stickers'}
                    </p>
                  </div>
                </div>
              </button>

              {/* Preset: Bonus Points */}
              <button
                onClick={() => handleLoadPreset('bonus')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'km' ? 'ពិន្ទុលើកទឹកចិត្ត (+៥, +១០, x២)' : 'Bonus Points (+5, +10, x2)'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {language === 'km' ? 'សម្រាប់បន្ថែមពិន្ទុលើកទឹកចិត្តពេលលេងហ្គេម' : 'Bonus points for quiz and challenges'}
                    </p>
                  </div>
                </div>
              </button>

              {/* Preset: Challenges */}
              <button
                onClick={() => handleLoadPreset('challenges')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'km' ? 'ចំណោទ & សកម្មភាពរហ័ស' : 'Quick Classroom Challenges'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {language === 'km' ? 'គិតលេខរហ័ស, អានអត្ថបទ, សរសេរពាក្យ' : 'Quick math, reading, spelling & trivia'}
                    </p>
                  </div>
                </div>
              </button>

              {/* Preset: Chores */}
              <button
                onClick={() => handleLoadPreset('chores')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'km' ? 'វេនភារកិច្ចក្នុងថ្នាក់' : 'Classroom Duties / Chores'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {language === 'km' ? 'សម្អាតក្តារខៀន, បិទភ្លើង, ប្រមូលសៀវភៅ' : 'Board cleaning, lights monitor, books helper'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* TAB 3: BULK IMPORT */}
          {activeEditorTab === 'bulk' && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'km' ? 'ចម្លង និងបិទភ្ជាប់បញ្ជីធាតុ (Bulk Import)' : 'Bulk Paste Items'}
              </p>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                {language === 'km' 
                  ? 'បិទភ្ជាប់ឈ្មោះ ឬរង្វាន់ (១ជួរ = ១ធាតុ ឬខណ្ឌដោយក្បៀស ,) ពី Excel ឬ Telegram' 
                  : 'Paste list of names or prizes separated by line breaks or commas'}
              </p>

              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={"សុខា\nវាសនា\nបូរី\nកល្យាណ\nចិន្តា"}
                className="w-full p-3 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
              />

              <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-slate-300">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="bulkMode"
                    value="replace"
                    checked={bulkMode === 'replace'}
                    onChange={() => setBulkMode('replace')}
                    className="text-amber-500 focus:ring-amber-400"
                  />
                  <span>{language === 'km' ? 'ជំនួសកង់ទាំងមូល' : 'Replace all'}</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="bulkMode"
                    value="append"
                    checked={bulkMode === 'append'}
                    onChange={() => setBulkMode('append')}
                    className="text-amber-500 focus:ring-amber-400"
                  />
                  <span>{language === 'km' ? 'បន្ថែមពីលើ' : 'Append to existing'}</span>
                </label>
              </div>

              <button
                onClick={handleBulkImport}
                disabled={!bulkInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'km' ? 'បញ្ចូលទៅក្នុងកង់សំណាង' : 'Import to Wheel'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WINNER CELEBRATION MODAL */}
      {showWinnerModal && winningSlice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-400 dark:border-amber-500 shadow-2xl text-center relative overflow-hidden transform scale-100 transition"
          >
            {/* Confetti Glow Background */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-2xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300">
                  {language === 'km' ? '🎉 លទ្ធផលឈ្នះកង់សំណាង 🎉' : '🎉 LUCKY WINNER 🎉'}
                </span>

                <h3 
                  className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white mt-2"
                  style={{ color: winningSlice.color }}
                >
                  {winningSlice.text}
                </h3>

                {winningSlice.subText && (
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
                    {winningSlice.subText}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setShowWinnerModal(false);
                    spinWheel();
                  }}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បង្វិលម្តងទៀត' : 'Spin Again'}</span>
                </button>

                <button
                  onClick={() => handleEliminateSlice(winningSlice.id, true)}
                  disabled={slices.length <= 2}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 font-bold text-xs transition border border-rose-200 dark:border-rose-800 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'កាត់ធាតុនេះចេញ' : 'Eliminate'}</span>
                </button>

                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  <span>{language === 'km' ? 'បិទ' : 'Close'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
