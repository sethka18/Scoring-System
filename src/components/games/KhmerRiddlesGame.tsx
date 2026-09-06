import React, { useState } from 'react';
import { 
  HelpCircle, 
  Lightbulb, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Shuffle, 
  CheckCircle2, 
  Sparkles, 
  Award,
  Star
} from 'lucide-react';
import { KHMER_RIDDLES, KhmerRiddle } from './gameData';
import { gameAudio } from '../../utils/gameAudio';

export interface KhmerRiddlesGameProps {
  language: 'km' | 'en';
}

export const KhmerRiddlesGame: React.FC<KhmerRiddlesGameProps> = ({ language }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRiddles = selectedCategory === 'all'
    ? KHMER_RIDDLES
    : KHMER_RIDDLES.filter(r => r.categoryKm === selectedCategory);

  const currentRiddle: KhmerRiddle = filteredRiddles[currentIndex % filteredRiddles.length] || KHMER_RIDDLES[0];

  const handleNext = () => {
    gameAudio.playClick();
    setCurrentIndex(prev => (prev + 1) % filteredRiddles.length);
    setShowHint(false);
    setShowAnswer(false);
  };

  const handlePrev = () => {
    gameAudio.playClick();
    setCurrentIndex(prev => (prev - 1 + filteredRiddles.length) % filteredRiddles.length);
    setShowHint(false);
    setShowAnswer(false);
  };

  const handleRandom = () => {
    gameAudio.playClick();
    const rand = Math.floor(Math.random() * filteredRiddles.length);
    setCurrentIndex(rand);
    setShowHint(false);
    setShowAnswer(false);
  };

  const toggleAnswer = () => {
    if (!showAnswer) {
      gameAudio.playCorrect();
    } else {
      gameAudio.playClick();
    }
    setShowAnswer(!showAnswer);
  };

  const categories = ['all', ...Array.from(new Set(KHMER_RIDDLES.map(r => r.categoryKm)))];

  return (
    <div className="space-y-6">
      {/* Category Filter & Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'km' ? 'ប្រភេទទស្សន៍ទាយ៖' : 'Category:'}
          </span>
          <div className="flex flex-wrap gap-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => { setSelectedCategory(c); setCurrentIndex(0); setShowAnswer(false); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c === 'all' ? (language === 'km' ? 'ទាំងអស់' : 'All') : c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRandom}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ចៃដន្យ' : 'Shuffle'}</span>
          </button>
          <span className="text-xs font-mono font-bold text-slate-400">
            {currentIndex + 1} / {filteredRiddles.length}
          </span>
        </div>
      </div>

      {/* Main Riddle Flashcard */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/20 rounded-3xl border-2 border-amber-300 dark:border-amber-700/60 p-6 sm:p-12 shadow-lg text-center space-y-6 relative overflow-hidden">
        
        {/* Badges */}
        <div className="flex justify-center items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-2xs font-black uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
            {currentRiddle.categoryKm}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold ${
            currentRiddle.difficulty === 'ងាយ' 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
              : currentRiddle.difficulty === 'មធ្យម'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          }`}>
            កម្រិត៖ {currentRiddle.difficulty}
          </span>
        </div>

        {/* Riddle Verse / Question */}
        <div className="py-4">
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-slate-900 dark:text-white leading-relaxed tracking-wide max-w-3xl mx-auto">
            « {currentRiddle.riddleKm} »
          </h2>
        </div>

        {/* Hint Section */}
        {showHint && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 max-w-lg mx-auto text-xs text-amber-900 dark:text-amber-200 flex items-center justify-center space-x-2 animate-scale-in">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{language === 'km' ? 'គន្លឹះ៖ ' : 'Hint: '}{currentRiddle.explanationKm.substring(0, 45)}...</span>
          </div>
        )}

        {/* Answer Revealed Section */}
        {showAnswer ? (
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 dark:border-emerald-700 max-w-xl mx-auto shadow-md animate-scale-in space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{language === 'km' ? 'ចម្លើយពាក្យបណ្តៅ' : 'The Answer'}</span>
            </span>
            <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-900 dark:text-emerald-100">
              « {currentRiddle.answerKm} »
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto pt-1">
              {currentRiddle.explanationKm}
            </p>
          </div>
        ) : (
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 rounded-xl border border-amber-400/80 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 text-xs font-black transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{showHint ? (language === 'km' ? 'លាក់គន្លឹះ' : 'Hide Hint') : (language === 'km' ? 'សុំគន្លឹះជំនួយ' : 'Need Clue')}</span>
            </button>

            <button
              onClick={toggleAnswer}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-heading font-black text-xs uppercase tracking-wider transition transform hover:scale-105 shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{language === 'km' ? 'បង្ហាញចម្លើយ' : 'Reveal Answer'}</span>
            </button>
          </div>
        )}

        {/* Carousel Navigation Buttons */}
        <div className="flex justify-center items-center space-x-4 pt-4 border-t border-amber-200/60 dark:border-amber-800/40">
          <button
            onClick={handlePrev}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'km' ? 'ពាក្យបណ្តៅមុន' : 'Previous'}</span>
          </button>
          
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 flex items-center space-x-1 cursor-pointer shadow-xs"
          >
            <span>{language === 'km' ? 'ពាក្យបណ្តៅបន្ទាប់' : 'Next Riddle'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
