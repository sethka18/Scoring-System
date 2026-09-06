import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  Trophy, 
  Shuffle, 
  Layers,
  Award,
  Check
} from 'lucide-react';
import { 
  KHMER_WORD_PAIRS, 
  KHMER_SYLLABLE_WORDS, 
  KHMER_SENTENCE_SCRAMBLES,
  WordPair,
  SyllableWord,
  SentenceScramble
} from './gameData';
import { gameAudio } from '../../utils/gameAudio';

export interface KhmerWordMatchGameProps {
  language: 'km' | 'en';
}

type SubTab = 'pairs' | 'builder' | 'scramble';

export const KhmerWordMatchGame: React.FC<KhmerWordMatchGameProps> = ({ language }) => {
  const [subTab, setSubTab] = useState<SubTab>('pairs');
  const [pairType, setPairType] = useState<'antonym' | 'synonym'>('antonym');

  // -------------------------------------------------------------
  // 1. WORD PAIRS MATCHING STATE
  // -------------------------------------------------------------
  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<boolean>(false);

  const initPairsGame = (type: 'antonym' | 'synonym') => {
    gameAudio.playClick();
    const filtered = KHMER_WORD_PAIRS.filter(p => p.type === type);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
    setLeftWords([...shuffled]);
    setRightWords([...shuffled].sort(() => Math.random() - 0.5));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds([]);
    setWrongPair(false);
  };

  useEffect(() => {
    initPairsGame(pairType);
  }, [pairType]);

  const handleSelectLeft = (id: string) => {
    if (matchedIds.includes(id)) return;
    gameAudio.playClick();
    setSelectedLeft(id);
    if (selectedRight) {
      checkPairMatch(id, selectedRight);
    }
  };

  const handleSelectRight = (id: string) => {
    if (matchedIds.includes(id)) return;
    gameAudio.playClick();
    setSelectedRight(id);
    if (selectedLeft) {
      checkPairMatch(selectedLeft, id);
    }
  };

  const checkPairMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Match!
      gameAudio.playCorrect();
      setMatchedIds(prev => {
        const next = [...prev, leftId];
        if (next.length === leftWords.length) {
          setTimeout(() => gameAudio.playFanfare(), 300);
        }
        return next;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Wrong match
      gameAudio.playWrong();
      setWrongPair(true);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(false);
      }, 700);
    }
  };

  // -------------------------------------------------------------
  // 2. WORD BUILDER (ផ្គុំតួអក្សរ & ជើង)
  // -------------------------------------------------------------
  const [builderIndex, setBuilderIndex] = useState<number>(0);
  const currentBuilderWord: SyllableWord = KHMER_SYLLABLE_WORDS[builderIndex % KHMER_SYLLABLE_WORDS.length];
  const [assembledParts, setAssembledParts] = useState<string[]>([]);
  const [availableParts, setAvailableParts] = useState<{ id: string; char: string }[]>([]);
  const [isBuilderSolved, setIsBuilderSolved] = useState<boolean>(false);

  const initBuilderWord = (idx: number) => {
    const word = KHMER_SYLLABLE_WORDS[idx % KHMER_SYLLABLE_WORDS.length];
    const partsWithId = word.parts.map((p, i) => ({ id: `${p}-${i}-${Math.random()}`, char: p }));
    // Shuffle parts
    setAvailableParts([...partsWithId].sort(() => Math.random() - 0.5));
    setAssembledParts([]);
    setIsBuilderSolved(false);
  };

  useEffect(() => {
    initBuilderWord(builderIndex);
  }, [builderIndex]);

  const handleAddPart = (part: { id: string; char: string }) => {
    gameAudio.playClick();
    setAssembledParts(prev => {
      const next = [...prev, part.char];
      const joined = next.join('');
      if (joined === currentBuilderWord.targetWord) {
        setIsBuilderSolved(true);
        gameAudio.playCorrect();
      }
      return next;
    });
    setAvailableParts(prev => prev.filter(p => p.id !== part.id));
  };

  const handleResetBuilder = () => {
    gameAudio.playClick();
    initBuilderWord(builderIndex);
  };

  const handleNextBuilder = () => {
    gameAudio.playClick();
    setBuilderIndex(prev => prev + 1);
  };

  // -------------------------------------------------------------
  // 3. SENTENCE SCRAMBLE (រៀបលំដាប់ពាក្យជាល្បះ)
  // -------------------------------------------------------------
  const [scrambleIndex, setScrambleIndex] = useState<number>(0);
  const currentScramble: SentenceScramble = KHMER_SENTENCE_SCRAMBLES[scrambleIndex % KHMER_SENTENCE_SCRAMBLES.length];
  const [chosenWords, setChosenWords] = useState<string[]>([]);
  const [poolWords, setPoolWords] = useState<string[]>([]);
  const [isScrambleSolved, setIsScrambleSolved] = useState<boolean>(false);

  const initScrambleWord = (idx: number) => {
    const item = KHMER_SENTENCE_SCRAMBLES[idx % KHMER_SENTENCE_SCRAMBLES.length];
    setPoolWords([...item.scrambledWords].sort(() => Math.random() - 0.5));
    setChosenWords([]);
    setIsScrambleSolved(false);
  };

  useEffect(() => {
    initScrambleWord(scrambleIndex);
  }, [scrambleIndex]);

  const handleAddScrambleWord = (word: string) => {
    gameAudio.playClick();
    setChosenWords(prev => {
      const next = [...prev, word];
      const joined = next.join('');
      if (joined === currentScramble.targetSentence) {
        setIsScrambleSolved(true);
        gameAudio.playCorrect();
      }
      return next;
    });
    setPoolWords(prev => {
      const idx = prev.indexOf(word);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
  };

  const handleResetScramble = () => {
    gameAudio.playClick();
    initScrambleWord(scrambleIndex);
  };

  const handleNextScramble = () => {
    gameAudio.playClick();
    setScrambleIndex(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex space-x-1.5">
          <button
            onClick={() => setSubTab('pairs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'pairs'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ផ្គូផ្គងពាក្យផ្ទុយ & ន័យដូច' : 'Word Pair Match'}</span>
          </button>
          
          <button
            onClick={() => setSubTab('builder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'builder'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ផ្គុំព្យញ្ជនៈ & ជើងអក្សរ' : 'Word & Syllable Builder'}</span>
          </button>

          <button
            onClick={() => setSubTab('scramble')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'scramble'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'រៀបលំដាប់ពាក្យជាល្បះ' : 'Sentence Scramble'}</span>
          </button>
        </div>

        {subTab === 'pairs' && (
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setPairType('antonym')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                pairType === 'antonym'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {language === 'km' ? 'ពាក្យផ្ទុយ' : 'Antonyms'}
            </button>
            <button
              onClick={() => setPairType('synonym')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                pairType === 'synonym'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {language === 'km' ? 'ពាក្យន័យដូច' : 'Synonyms'}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. WORD PAIR MATCHING ARENA */}
      {/* ========================================================= */}
      {subTab === 'pairs' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{pairType === 'antonym' ? 'ល្បែងផ្គូផ្គងពាក្យផ្ទុយ (Antonyms Match)' : 'ល្បែងផ្គូផ្គងពាក្យន័យដូច (Synonyms Match)'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ចុចរើសពាក្យខាងឆ្វេង រួចចុចរើសពាក្យខាងស្តាំដែលត្រូវគ្នា' : 'Click a word on the left, then click its corresponding match on the right'}
              </p>
            </div>

            <button
              onClick={() => initPairsGame(pairType)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ប្តូរសំណុំពាក្យ' : 'New Set'}</span>
            </button>
          </div>

          {/* Victory Banner if all matched */}
          {matchedIds.length === leftWords.length && leftWords.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center animate-bounce">
              <p className="font-heading font-black text-sm text-emerald-700 dark:text-emerald-300 flex items-center justify-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{language === 'km' ? 'អបអរសាទរ! អ្នកបានផ្គូផ្គងត្រឹមត្រូវគ្រប់ពាក្យទាំងអស់!' : 'Congratulations! You matched all word pairs!'}</span>
              </p>
            </div>
          )}

          {/* Word Columns Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto">
            
            {/* Left Column */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{language === 'km' ? 'ពាក្យទី ១' : 'Word 1'}</p>
              {leftWords.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedLeft === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleSelectLeft(item.id)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-heading font-black text-base sm:text-lg transition cursor-pointer shadow-2xs flex items-center justify-between border-2 ${
                      isMatched
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 line-through opacity-60'
                        : isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-100 dark:ring-emerald-900'
                        : wrongPair && isSelected
                        ? 'bg-rose-500 text-white border-rose-600 animate-shake'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span>{item.word1}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                {language === 'km' ? (pairType === 'antonym' ? 'ពាក្យផ្ទុយ' : 'ពាក្យន័យដូច') : 'Match'}
              </p>
              {rightWords.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedRight === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleSelectRight(item.id)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-heading font-black text-base sm:text-lg transition cursor-pointer shadow-2xs flex items-center justify-between border-2 ${
                      isMatched
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 line-through opacity-60'
                        : isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-100 dark:ring-emerald-900'
                        : wrongPair && isSelected
                        ? 'bg-rose-500 text-white border-rose-600 animate-shake'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span>{item.word2}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. WORD & SYLLABLE BUILDER ARENA */}
      {/* ========================================================= */}
      {subTab === 'builder' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                {language === 'km' ? 'ផ្គុំព្យញ្ជនៈ ស្រៈ និងជើងអក្សរ (Khmer Word Assembly)' : 'Khmer Syllable Builder'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ជ្រើសរើសតួអក្សរ និងជើងខាងក្រោមដើម្បីផ្គុំចេញជាពាក្យត្រឹមត្រូវ' : 'Click the pieces below in order to assemble the target Khmer word'}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleResetBuilder}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'រៀបឡើងវិញ' : 'Reset'}</span>
              </button>
              <button
                onClick={handleNextBuilder}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center space-x-1 cursor-pointer shadow-xs"
              >
                <span>{language === 'km' ? 'ពាក្យបន្ទាប់' : 'Next Word'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Word Clue Box */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center space-x-3 text-xs">
            <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-black text-emerald-900 dark:text-emerald-300">
                {language === 'km' ? 'ពាក្យគន្លឹះទស្សន៍ទាយ៖' : 'Clue:'} {currentBuilderWord.hintKm}
              </p>
              <p className="text-emerald-700/80 dark:text-emerald-400 text-[11px]">
                {language === 'km' ? `មានចំនួន ${currentBuilderWord.parts.length} តួ/ជើង` : `${currentBuilderWord.parts.length} pieces required`}
              </p>
            </div>
          </div>

          {/* Construction Board Area */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 sm:p-10 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center min-h-[140px] flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {assembledParts.map((char, i) => (
                <span
                  key={i}
                  className="w-12 h-14 sm:w-16 sm:h-18 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-md font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center justify-center animate-scale-in"
                >
                  {char}
                </span>
              ))}
              {assembledParts.length === 0 && (
                <span className="text-sm font-bold text-slate-400">
                  {language === 'km' ? 'ចុចលើតួអក្សរខាងក្រោមដើម្បីដាក់ចូលក្នុងប្រអប់នេះ' : 'Click the pieces below to build the word'}
                </span>
              )}
            </div>

            {/* Assembled Result */}
            {assembledParts.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-slate-400">{language === 'km' ? 'ពាក្យកំពុងផ្គុំ៖ ' : 'Current: '}</span>
                <span className="font-heading font-black text-xl text-emerald-600 dark:text-emerald-400">
                  {assembledParts.join('')}
                </span>
              </div>
            )}

            {isBuilderSolved && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-heading font-black text-sm flex items-center space-x-2 animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{language === 'km' ? `ត្រឹមត្រូវហើយ! ពាក្យថា «${currentBuilderWord.targetWord}»` : 'Correctly Assembled!'}</span>
              </div>
            )}
          </div>

          {/* Available Letter Pieces Pool */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              {language === 'km' ? 'តួអក្សរ និងជើងសម្រាប់ជ្រើសរើស' : 'Available Pieces'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {availableParts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddPart(item)}
                  className="w-12 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:scale-105 font-heading font-black text-2xl text-slate-900 dark:text-white flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                >
                  {item.char}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SENTENCE SCRAMBLE ARENA */}
      {/* ========================================================= */}
      {subTab === 'scramble' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                {language === 'km' ? 'រៀបលំដាប់ពាក្យជាល្បះ (Sentence Scrambler)' : 'Sentence Scrambler'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ចុចជ្រើសរើសពាក្យតាមលំដាប់ដើម្បីផ្គុំចេញជាល្បះពេញលេញមានន័យស្ដាប់បាន' : 'Click the scrambled words in order to form a meaningful sentence'}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleResetScramble}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'រៀបឡើងវិញ' : 'Reset'}</span>
              </button>
              <button
                onClick={handleNextScramble}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center space-x-1 cursor-pointer shadow-xs"
              >
                <span>{language === 'km' ? 'ល្បះបន្ទាប់' : 'Next Sentence'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Topic Badge */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ប្រធានបទ៖ {currentScramble.topicKm} • ថ្នាក់ទី {currentScramble.level}
            </span>
          </div>

          {/* Completed Sentence Construction Drop Area */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 sm:p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center min-h-[140px] flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {chosenWords.map((word, i) => (
                <span
                  key={i}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-sm font-heading font-black text-base sm:text-xl text-slate-900 dark:text-white flex items-center space-x-1"
                >
                  <span>{word}</span>
                </span>
              ))}
              {chosenWords.length === 0 && (
                <span className="text-sm font-bold text-slate-400">
                  {language === 'km' ? 'ចុចលើពាក្យខាងក្រោមដើម្បីតម្រៀបជាល្បះ' : 'Click the words below to form a sentence'}
                </span>
              )}
            </div>

            {isScrambleSolved && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-heading font-black text-sm flex items-center space-x-2 animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{language === 'km' ? 'ត្រឹមត្រូវណាស់! ល្បះនេះមានន័យត្រឹមត្រូវស្ដាប់បានល្អ!' : 'Well Done! The sentence is perfectly ordered!'}</span>
              </div>
            )}
          </div>

          {/* Word Pool Area */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              {language === 'km' ? 'ពាក្យសម្រាប់រៀបចំ' : 'Word Choices'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {poolWords.map((word, i) => (
                <button
                  key={i}
                  onClick={() => handleAddScrambleWord(word)}
                  className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50/50 font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white transition cursor-pointer shadow-xs transform active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
