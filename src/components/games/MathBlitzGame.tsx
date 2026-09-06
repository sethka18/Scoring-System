import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calculator, 
  Play, 
  RotateCcw, 
  Zap, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Star,
  Users,
  Lightbulb,
  Award
} from 'lucide-react';
import { MathQuestion, generateMathQuestion } from './gameData';
import { gameAudio } from '../../utils/gameAudio';

export interface MathBlitzGameProps {
  language: 'km' | 'en';
  defaultGrade?: number;
}

export const MathBlitzGame: React.FC<MathBlitzGameProps> = ({ language, defaultGrade = 2 }) => {
  const [grade, setGrade] = useState<number>(defaultGrade);
  const [gameMode, setGameMode] = useState<'solo' | 'battle'>('solo');
  const [timeLimit, setTimeLimit] = useState<number>(30); // 15, 30, 60, 0=unlimited
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Question & state
  const [currentQ, setCurrentQ] = useState<MathQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Battle mode specific
  const [teamTurn, setTeamTurn] = useState<1 | 2>(1);
  const [team1Points, setTeam1Points] = useState<number>(0);
  const [team2Points, setTeam2Points] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextQuestion = useCallback(() => {
    const q = generateMathQuestion(grade);
    setCurrentQ(q);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowHint(false);
  }, [grade]);

  // Start new game
  const startGame = () => {
    gameAudio.playClick();
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalAnswered(0);
    setTeam1Points(0);
    setTeam2Points(0);
    setTeamTurn(1);
    setTimeLeft(timeLimit);
    nextQuestion();
  };

  // Reset
  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsGameOver(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setCurrentQ(null);
  };

  // Timer countdown
  useEffect(() => {
    if (isPlaying && timeLimit > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            setIsGameOver(true);
            gameAudio.playFanfare();
            return 0;
          }
          if (prev <= 5) {
            gameAudio.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLimit]);

  // Handle student clicking option
  const handleSelectOption = (opt: number | string) => {
    if (!currentQ || selectedOption !== null) return;

    setSelectedOption(opt);
    const correct = opt === currentQ.answer;
    setIsCorrect(correct);
    setTotalAnswered(prev => prev + 1);

    if (correct) {
      gameAudio.playCorrect();
      const streakBonus = streak >= 3 ? 2 : 1;
      const pointsWon = 10 * streakBonus;

      if (gameMode === 'solo') {
        setScore(prev => prev + pointsWon);
        setStreak(prev => {
          const next = prev + 1;
          if (next > maxStreak) setMaxStreak(next);
          return next;
        });
      } else {
        // Battle mode
        if (teamTurn === 1) {
          setTeam1Points(prev => prev + 10);
        } else {
          setTeam2Points(prev => prev + 10);
        }
      }
    } else {
      gameAudio.playWrong();
      if (gameMode === 'solo') {
        setStreak(0);
      }
    }

    // Move to next question after short delay
    setTimeout(() => {
      if (gameMode === 'battle') {
        setTeamTurn(prev => (prev === 1 ? 2 : 1));
      }
      nextQuestion();
    }, 750);
  };

  return (
    <div className="space-y-6">
      {/* Game Config Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Grade Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'km' ? 'កម្រិតថ្នាក់៖' : 'Grade Level:'}
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => {
                  setGrade(g);
                  if (isPlaying) {
                    const q = generateMathQuestion(g);
                    setCurrentQ(q);
                  }
                }}
                className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer ${
                  grade === g
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setGameMode('solo'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              gameMode === 'solo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'គិតរហ័សទោល (Solo Blitz)' : 'Solo Speed'}</span>
          </button>
          <button
            onClick={() => { setGameMode('battle'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              gameMode === 'battle'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ប្រកួត ២ ក្រុម (Team Battle)' : 'Team Battle'}</span>
          </button>
        </div>

        {/* Timer Config */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ម៉ោង៖' : 'Timer:'}</span>
          </span>
          <div className="flex space-x-1">
            {[15, 30, 60].map(s => (
              <button
                key={s}
                onClick={() => { setTimeLimit(s); setTimeLeft(s); }}
                className={`px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  timeLimit === s
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Play Arena */}
      {!isPlaying && !isGameOver ? (
        /* Welcome / Ready Screen */
        <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-blue-900/60 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <Calculator className="w-8 h-8" />
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mb-2">
            {language === 'km' ? 'គណិតវិទ្យារហ័សរហួន (Math Lightning Blitz)' : 'Math Lightning Blitz'}
          </h2>
          <p className="text-sm text-blue-200/90 max-w-xl mx-auto mb-6">
            {language === 'km'
              ? `ល្បែងគណនាលេខលឿនរហ័សសម្រាប់ថ្នាក់ទី ${grade}។ សិស្សត្រូវរើសចម្លើយដែលត្រឹមត្រូវមុនពេលកំណត់ម៉ោងផុត!`
              : `Fast-paced calculation challenge for Grade ${grade}. Pick the right answer before time runs out!`}
          </p>

          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-heading font-black text-base transition transform hover:scale-105 shadow-lg shadow-blue-500/30 cursor-pointer inline-flex items-center space-x-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{language === 'km' ? 'ចាប់ផ្តើមលេងឥឡូវនេះ' : 'Start Challenge'}</span>
          </button>
        </div>
      ) : isGameOver ? (
        /* Game Over / Results Screen */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-500 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white mb-1">
              {language === 'km' ? 'ចប់ការប្រកួត! អបអរសាទរ!' : 'Challenge Complete! Great Job!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'km' ? `លទ្ធផលការឆ្លើយសំណួរគណិតវិទ្យា ថ្នាក់ទី ${grade}` : `Results for Grade ${grade} Math Blitz`}
            </p>
          </div>

          {gameMode === 'solo' ? (
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                <p className="text-2xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{language === 'km' ? 'ពិន្ទុសរុប' : 'Total Score'}</p>
                <p className="font-mono text-3xl font-black text-blue-700 dark:text-blue-300">{score}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                <p className="text-2xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{language === 'km' ? 'ត្រឹមត្រូវជាប់គ្នា' : 'Max Streak'}</p>
                <p className="font-mono text-3xl font-black text-amber-700 dark:text-amber-300">{maxStreak}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                <p className="text-2xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{language === 'km' ? 'បានឆ្លើយ' : 'Answered'}</p>
                <p className="font-mono text-3xl font-black text-emerald-700 dark:text-emerald-300">{totalAnswered}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className={`p-5 rounded-2xl border text-center ${
                team1Points > team2Points 
                  ? 'bg-rose-100 dark:bg-rose-950/50 border-rose-400 ring-2 ring-rose-400' 
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200'
              }`}>
                <p className="font-black text-sm text-rose-700 dark:text-rose-400">ក្រុមក្រហម (Team A)</p>
                <p className="font-mono text-4xl font-black text-rose-600 my-1">{team1Points}</p>
                {team1Points > team2Points && <span className="text-xs font-black text-rose-600 uppercase">🏆 ឈ្នះការប្រកួត</span>}
              </div>
              <div className={`p-5 rounded-2xl border text-center ${
                team2Points > team1Points 
                  ? 'bg-sky-100 dark:bg-sky-950/50 border-sky-400 ring-2 ring-sky-400' 
                  : 'bg-sky-50 dark:bg-sky-950/20 border-sky-200'
              }`}>
                <p className="font-black text-sm text-sky-700 dark:text-sky-400">ក្រុមខៀវ (Team B)</p>
                <p className="font-mono text-4xl font-black text-sky-600 my-1">{team2Points}</p>
                {team2Points > team1Points && <span className="text-xs font-black text-sky-600 uppercase">🏆 ឈ្នះការប្រកួត</span>}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'km' ? 'លេងម្តងទៀត' : 'Play Again'}</span>
            </button>
            <button
              onClick={resetGame}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {language === 'km' ? 'ត្រឡប់ក្រោយ' : 'Exit to Menu'}
            </button>
          </div>
        </div>
      ) : (
        /* Active Game Session */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
          
          {/* Header Stats Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            
            {/* Timer Display */}
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base shadow-xs ${
                timeLeft <= 5 
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-900' 
                  : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
              }`}>
                {timeLeft}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'km' ? 'ពេលវេលា' : 'Time Left'}</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{timeLeft} វិនាទី</p>
              </div>
            </div>

            {/* Turn / Streak */}
            {gameMode === 'solo' ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'km' ? 'ពិន្ទុ' : 'Score'}</p>
                  <p className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">{score}</p>
                </div>
                {streak > 1 && (
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-black">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-bounce" />
                    <span>x{streak} Combo</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                  teamTurn === 1 
                    ? 'bg-rose-600 text-white border-rose-700 animate-pulse' 
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200'
                }`}>
                  ក្រហម៖ {team1Points}
                </span>
                <span className="text-slate-300">vs</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                  teamTurn === 2 
                    ? 'bg-sky-600 text-white border-sky-700 animate-pulse' 
                    : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200'
                }`}>
                  ខៀវ៖ {team2Points}
                </span>
              </div>
            )}

            {/* Exit button */}
            <button
              onClick={resetGame}
              className="text-xs text-slate-400 hover:text-rose-500 transition font-bold cursor-pointer"
            >
              {language === 'km' ? 'ឈប់លេង' : 'Quit'}
            </button>
          </div>

          {/* Active Question Display */}
          {currentQ && (
            <div className="text-center py-4 space-y-6">
              <span className="px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {currentQ.categoryKm} • ថ្នាក់ទី {grade}
              </span>

              {/* Big Equation Box for Projector View */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
                <h1 className="font-mono text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-wide">
                  {currentQ.questionKm}
                </h1>
              </div>

              {/* Hint button */}
              {currentQ.hintKm && (
                <div className="flex justify-center">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{language === 'km' ? 'ជំនួយគន្លឹះគិត' : 'Need a hint?'}</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{currentQ.hintKm}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Choice Options Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30";
                  
                  if (selectedOption !== null) {
                    if (opt === currentQ.answer) {
                      btnStyle = "bg-emerald-500 text-white border-2 border-emerald-600 shadow-md ring-4 ring-emerald-200 dark:ring-emerald-900";
                    } else if (opt === selectedOption && !isCorrect) {
                      btnStyle = "bg-rose-500 text-white border-2 border-rose-600 shadow-md";
                    } else {
                      btnStyle = "opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      disabled={selectedOption !== null}
                      className={`h-20 sm:h-24 rounded-2xl font-mono text-2xl sm:text-3xl font-black transition-all transform active:scale-95 flex items-center justify-center cursor-pointer shadow-sm ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
