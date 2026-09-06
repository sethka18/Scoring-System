import React, { useState } from 'react';
import { Trophy, Plus, Minus, RotateCcw, Award, Star, Flame, Sparkles } from 'lucide-react';
import { gameAudio } from '../../utils/gameAudio';

export interface TeamScoreboardProps {
  language: 'km' | 'en';
}

export const TeamScoreboard: React.FC<TeamScoreboardProps> = ({ language }) => {
  const [team1Name, setTeam1Name] = useState('ក្រុមក្រហម (Team A)');
  const [team2Name, setTeam2Name] = useState('ក្រុមខៀវ (Team B)');
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1Streak, setTeam1Streak] = useState(0);
  const [team2Streak, setTeam2Streak] = useState(0);

  const addScore = (team: 1 | 2, points: number) => {
    gameAudio.playCorrect();
    if (team === 1) {
      setTeam1Score(prev => Math.max(0, prev + points));
      if (points > 0) setTeam1Streak(prev => prev + 1);
    } else {
      setTeam2Score(prev => Math.max(0, prev + points));
      if (points > 0) setTeam2Streak(prev => prev + 1);
    }
  };

  const deductScore = (team: 1 | 2, points: number) => {
    gameAudio.playWrong();
    if (team === 1) {
      setTeam1Score(prev => Math.max(0, prev - points));
      setTeam1Streak(0);
    } else {
      setTeam2Score(prev => Math.max(0, prev - points));
      setTeam2Streak(0);
    }
  };

  const resetScores = () => {
    gameAudio.playClick();
    setTeam1Score(0);
    setTeam2Score(0);
    setTeam1Streak(0);
    setTeam2Streak(0);
  };

  const leadTeam = team1Score > team2Score ? 1 : team2Score > team1Score ? 2 : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-heading font-black text-slate-900 dark:text-white text-xs uppercase tracking-wide">
              {language === 'km' ? 'តារាងពិន្ទុប្រកួតក្នុងថ្នាក់ (Classroom Scoreboard)' : 'Classroom Battle Scoreboard'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'km' ? 'សម្រាប់បែងចែកក្រុមប្រកួតប្រជែងឆ្លើយសំណួរ' : 'Live score tracking for Team vs Team quiz battles'}
            </p>
          </div>
        </div>

        <button
          onClick={resetScores}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{language === 'km' ? 'កំណត់ពិន្ទុឡើងវិញ' : 'Reset Scores'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Team 1 Card */}
        <div className={`rounded-xl border p-4 transition-all ${
          leadTeam === 1 
            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-600 shadow-xs ring-1 ring-rose-400/40' 
            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              className="font-heading font-black text-xs text-rose-700 dark:text-rose-400 bg-transparent border-b border-dashed border-rose-300 dark:border-rose-700 focus:outline-hidden focus:border-rose-500 max-w-[200px]"
            />
            {leadTeam === 1 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                <Flame className="w-2.5 h-2.5" />
                <span>{language === 'km' ? 'នាំមុខ' : 'Leading'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400">
                {team1Score}
              </span>
              <span className="text-xs font-bold text-slate-500">{language === 'km' ? 'ពិន្ទុ' : 'pts'}</span>
              {team1Streak > 2 && (
                <span className="text-xs text-amber-500 font-black flex items-center space-x-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>x{team1Streak}</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => deductScore(1, 1)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center font-black transition cursor-pointer text-xs"
                title="-1"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => addScore(1, 1)}
                className="px-2.5 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center font-black transition cursor-pointer text-xs space-x-0.5 shadow-xs"
                title="+1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1</span>
              </button>
              <button
                onClick={() => addScore(1, 5)}
                className="px-2.5 h-8 rounded-lg bg-rose-700 hover:bg-rose-800 text-white flex items-center justify-center font-black transition cursor-pointer text-xs space-x-0.5 shadow-xs"
                title="+5 Bonus"
              >
                <Star className="w-3 h-3 fill-white" />
                <span>+5</span>
              </button>
            </div>
          </div>
        </div>

        {/* Team 2 Card */}
        <div className={`rounded-xl border p-4 transition-all ${
          leadTeam === 2 
            ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-400 dark:border-sky-600 shadow-xs ring-1 ring-sky-400/40' 
            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              className="font-heading font-black text-xs text-sky-700 dark:text-sky-400 bg-transparent border-b border-dashed border-sky-300 dark:border-sky-700 focus:outline-hidden focus:border-sky-500 max-w-[200px]"
            />
            {leadTeam === 2 && (
              <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                <Flame className="w-2.5 h-2.5" />
                <span>{language === 'km' ? 'នាំមុខ' : 'Leading'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400">
                {team2Score}
              </span>
              <span className="text-xs font-bold text-slate-500">{language === 'km' ? 'ពិន្ទុ' : 'pts'}</span>
              {team2Streak > 2 && (
                <span className="text-xs text-amber-500 font-black flex items-center space-x-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>x{team2Streak}</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => deductScore(2, 1)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center font-black transition cursor-pointer text-xs"
                title="-1"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => addScore(2, 1)}
                className="px-2.5 h-8 rounded-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center font-black transition cursor-pointer text-xs space-x-0.5 shadow-xs"
                title="+1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1</span>
              </button>
              <button
                onClick={() => addScore(2, 5)}
                className="px-2.5 h-8 rounded-lg bg-sky-700 hover:bg-sky-800 text-white flex items-center justify-center font-black transition cursor-pointer text-xs space-x-0.5 shadow-xs"
                title="+5 Bonus"
              >
                <Star className="w-3 h-3 fill-white" />
                <span>+5</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
