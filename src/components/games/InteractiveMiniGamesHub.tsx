import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Gamepad2, 
  Calculator, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Trophy, 
  Users, 
  Flame, 
  Award,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { MathBlitzGame } from './MathBlitzGame';
import { KhmerWordMatchGame } from './KhmerWordMatchGame';
import { LuckyWheelGame } from './LuckyWheelGame';
import { KhmerRiddlesGame } from './KhmerRiddlesGame';
import { TeamScoreboard } from './TeamScoreboard';
import { gameAudio } from '../../utils/gameAudio';

export type GameTab = 'math' | 'khmer' | 'wheel' | 'riddles';

export const InteractiveMiniGamesHub: React.FC = () => {
  const { language, activeClass, classStudents } = useGradebook();

  const [activeGame, setActiveGame] = useState<GameTab>('math');
  const [showScoreboard, setShowScoreboard] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(gameAudio.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      gameAudio.playClick();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl border border-indigo-950 text-white shadow-xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shadow-inner">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  {language === 'km' ? 'ហ្គេមអន្តរកម្ម' : 'Interactive'}
                </span>
                <span className="text-2xs font-bold text-sky-200">
                  {activeClass ? `${activeClass.name} • ${classStudents.length} សិស្ស` : 'បឋមសិក្សា'}
                </span>
              </div>
              <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-wide mt-0.5">
                {language === 'km' ? 'ល្បែងសិក្សាអន្តរកម្មខ្លីៗក្នុងថ្នាក់' : 'Classroom Interactive Mini-Games'}
              </h1>
              <p className="text-xs text-slate-300 max-w-xl">
                {language === 'km'
                  ? 'ឧបករណ៍លេងកម្សាន្តខ្លីៗក្នុងម៉ោងបង្រៀន ដើម្បីបង្កើនការចងចាំ ស្មារតីសកម្ម និងភាពសប្បាយរីករាយក្នុងមុខវិជ្ជាគណិតវិទ្យា និងភាសាខ្មែរ'
                  : 'Engaging classroom mini-games designed for primary students to reinforce math arithmetic and Khmer language skills.'}
              </p>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setShowScoreboard(!showScoreboard)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 border ${
                showScoreboard 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm' 
                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{language === 'km' ? (showScoreboard ? 'លាក់តារាងពិន្ទុ' : 'តារាងពិន្ទុប្រកួត') : 'Scoreboard'}</span>
            </button>

            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                isMuted 
                  ? 'bg-white/10 text-rose-300 border-rose-400/30 hover:bg-white/20' 
                  : 'bg-white/15 text-emerald-300 border-emerald-400/30 hover:bg-white/25'
              }`}
              title={isMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition cursor-pointer"
              title={language === 'km' ? 'បញ្ចាំងពេញអេក្រង់ (Projector)' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Scoreboard (Collapsible) */}
      {showScoreboard && (
        <TeamScoreboard language={language} />
      )}

      {/* Game Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => { setActiveGame('math'); gameAudio.playClick(); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs group ${
            activeGame === 'math'
              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-110 ${
              activeGame === 'math'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
            }`}>
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950 px-2 py-0.5 rounded-full">
              ថ្នាក់ ១-៦
            </span>
          </div>
          <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
            {language === 'km' ? 'គណិតវិទ្យារហ័ស' : 'Math Blitz'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'km' ? 'បូក ដក គុណ ចែក & ប្រកួត ២ ក្រុម' : 'Speed calculations & 2-team battle'}
          </p>
        </button>

        <button
          onClick={() => { setActiveGame('khmer'); gameAudio.playClick(); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs group ${
            activeGame === 'khmer'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-110 ${
              activeGame === 'khmer'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              ភាសាខ្មែរ
            </span>
          </div>
          <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
            {language === 'km' ? 'ពាក្យ & ល្បះខ្មែរ' : 'Khmer Word Match'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'km' ? 'ពាក្យផ្ទុយ ន័យដូច ផ្គុំជើង & ល្បះ' : 'Antonyms, synonyms & sentence order'}
          </p>
        </button>

        <button
          onClick={() => { setActiveGame('wheel'); gameAudio.playClick(); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs group ${
            activeGame === 'wheel'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-110 ${
              activeGame === 'wheel'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              សំណាង
            </span>
          </div>
          <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
            {language === 'km' ? 'កង់សំណាងផ្ទៀងចំណេះ' : 'Lucky Wheel'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'km' ? 'បង្វិលកង់ចាប់ប្រធានបទ ឬឈ្មោះសិស្ស' : 'Random category & student spinner'}
          </p>
        </button>

        <button
          onClick={() => { setActiveGame('riddles'); gameAudio.playClick(); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs group ${
            activeGame === 'riddles'
              ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-400 dark:border-purple-600 ring-2 ring-purple-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-110 ${
              activeGame === 'riddles'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
            }`}>
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-950 px-2 py-0.5 rounded-full">
              បុរាណ
            </span>
          </div>
          <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
            {language === 'km' ? 'ពាក្យបណ្តៅខ្មែរ' : 'Khmer Riddles'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'km' ? 'ទាយចំណោទបុរាណ & គន្លឹះឆ្លាតវៃ' : 'Traditional folk riddles & clues'}
          </p>
        </button>
      </div>

      {/* Active Game Component Stage */}
      <div className="mt-6">
        {activeGame === 'math' && <MathBlitzGame language={language} defaultGrade={Number(activeClass?.gradeLevel) || 2} />}
        {activeGame === 'khmer' && <KhmerWordMatchGame language={language} />}
        {activeGame === 'wheel' && <LuckyWheelGame language={language} />}
        {activeGame === 'riddles' && <KhmerRiddlesGame language={language} />}
      </div>
    </div>
  );
};
