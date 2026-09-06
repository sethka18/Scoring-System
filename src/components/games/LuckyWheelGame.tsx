import React, { useState, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Star, 
  Award, 
  Users, 
  Volume2, 
  Eye, 
  EyeOff,
  ChevronRight
} from 'lucide-react';
import { LUCKY_WHEEL_CATEGORIES, WheelCategory } from './gameData';
import { useGradebook } from '../../context/GradebookContext';
import { gameAudio } from '../../utils/gameAudio';

export interface LuckyWheelGameProps {
  language: 'km' | 'en';
}

export const LuckyWheelGame: React.FC<LuckyWheelGameProps> = ({ language }) => {
  const { classStudents, activeClass } = useGradebook();

  const [wheelType, setWheelType] = useState<'categories' | 'students'>('categories');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  
  // Selected category or student
  const [selectedCategory, setSelectedCategory] = useState<WheelCategory | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<{ qKm: string; aKm: string } | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Timer for question
  const [timerSeconds, setTimerSeconds] = useState<number>(25);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Categories segments
  const categories = LUCKY_WHEEL_CATEGORIES;
  const numSlices = wheelType === 'categories' 
    ? categories.length 
    : Math.max(4, Math.min(classStudents.length, 12));

  // Names for student wheel
  const studentSlices = classStudents.slice(0, 12).map(s => s.name);
  if (studentSlices.length === 0) {
    studentSlices.push('សិស្ស ១', 'សិស្ស ២', 'សិស្ស ៣', 'សិស្ស ៤');
  }

  // Slice colors for students
  const sliceColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', 
    '#6366f1', '#e11d48', '#84cc16', '#a855f7'
  ];

  const spinWheel = () => {
    if (isSpinning) return;

    gameAudio.playClick();
    setIsSpinning(true);
    setSelectedCategory(null);
    setSelectedStudentName(null);
    setActiveQuestion(null);
    setShowAnswer(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);

    // Calculate random rotations: at least 5 full turns (1800 deg) + random angle
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalNewRotation = rotation + (extraSpins * 360) + randomAngle;

    // Simulate sound ticks during rotation
    let tickCount = 0;
    const soundInterval = setInterval(() => {
      tickCount++;
      gameAudio.playWheelSpinTick();
      if (tickCount > 35) clearInterval(soundInterval);
    }, 90);

    setRotation(totalNewRotation);

    // Wheel stops after 3.8s (matching CSS duration)
    setTimeout(() => {
      setIsSpinning(false);
      gameAudio.playFanfare();

      // Determine which slice landed at the top pointer (pointer is at top 270 deg or 90 deg)
      const degreesPerSlice = 360 / numSlices;
      const normalizedDegree = (360 - (totalNewRotation % 360)) % 360;
      const winningIndex = Math.floor(normalizedDegree / degreesPerSlice) % numSlices;

      if (wheelType === 'categories') {
        const cat = categories[winningIndex];
        setSelectedCategory(cat);
        const randomQ = cat.sampleQuestions[Math.floor(Math.random() * cat.sampleQuestions.length)];
        setActiveQuestion(randomQ);
        setTimerSeconds(randomQ.timeSeconds || 25);
      } else {
        const sName = studentSlices[winningIndex];
        setSelectedStudentName(sName);
        // Also pair with a random question
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const randomQ = randomCat.sampleQuestions[Math.floor(Math.random() * randomCat.sampleQuestions.length)];
        setActiveQuestion(randomQ);
        setTimerSeconds(25);
      }
    }, 3800);
  };

  const startQuestionTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          gameAudio.playWrong();
          return 0;
        }
        if (prev <= 5) {
          gameAudio.playTick();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopQuestionTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{language === 'km' ? 'កង់សំណាងផ្ទៀងចំណេះ (Lucky Wheel of Knowledge)' : 'Classroom Lucky Wheel'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'km' ? 'បង្វិលកង់ដើម្បីចាប់ប្រធានបទសំណួរ ឬចាប់ឈ្មោះសិស្សឡើងឆ្លើយ' : 'Spin to choose random quiz topics or call on students'}
          </p>
        </div>

        {/* Wheel Mode Picker */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => { setWheelType('categories'); setSelectedCategory(null); setSelectedStudentName(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              wheelType === 'categories'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'km' ? 'កង់ប្រធានបទ/មុខវិជ្ជា' : 'Topic Wheel'}
          </button>
          <button
            onClick={() => { setWheelType('students'); setSelectedCategory(null); setSelectedStudentName(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
              wheelType === 'students'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'km' ? `ចាប់ឈ្មោះសិស្ស (${activeClass?.name || 'ក្នុងថ្នាក់'})` : 'Student Roster'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: The Wheel Stage */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Wheel Pointer at Top */}
          <div className="relative z-10 -mb-6 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-rose-600 filter drop-shadow-md"></div>
          </div>

          {/* SVG Wheel Element */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-4">
            <svg
              viewBox="0 0 300 300"
              className="w-full h-full transform transition-transform filter drop-shadow-xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '3.8s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
              }}
            >
              <circle cx="150" cy="150" r="146" fill="#1e293b" stroke="#f8fafc" strokeWidth="4" />
              
              {/* Slices */}
              {Array.from({ length: numSlices }).map((_, idx) => {
                const angle = 360 / numSlices;
                const startAngle = idx * angle;
                const endAngle = startAngle + angle;

                // SVG Arc Path
                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);
                const x1 = 150 + 140 * Math.cos(startRad);
                const y1 = 150 + 140 * Math.sin(startRad);
                const x2 = 150 + 140 * Math.cos(endRad);
                const y2 = 150 + 140 * Math.sin(endRad);

                const sliceColor = wheelType === 'categories' 
                  ? categories[idx % categories.length].color 
                  : sliceColors[idx % sliceColors.length];

                const label = wheelType === 'categories'
                  ? categories[idx % categories.length].titleKm
                  : studentSlices[idx % studentSlices.length];

                // Middle angle for label placement
                const midRad = (startAngle + angle / 2 - 90) * (Math.PI / 180);
                const textX = 150 + 85 * Math.cos(midRad);
                const textY = 150 + 85 * Math.sin(midRad);
                const textRotation = startAngle + angle / 2;

                return (
                  <g key={idx}>
                    <path
                      d={`M150,150 L${x1},${y1} A140,140 0 0,1 ${x2},${y2} Z`}
                      fill={sliceColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#ffffff"
                      fontSize={numSlices > 8 ? "10" : "12"}
                      fontWeight="900"
                      fontFamily="system-ui, 'Hanuman', 'Kantumruy Pro', sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                      className="select-none"
                    >
                      {label.length > 12 ? label.substring(0, 11) + '...' : label}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub */}
              <circle cx="150" cy="150" r="28" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="150" cy="150" r="16" fill="#f59e0b" />
            </svg>
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-4">
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className={`px-8 py-3.5 rounded-2xl font-heading font-black text-sm uppercase tracking-wider transition transform active:scale-95 flex items-center space-x-2 shadow-lg cursor-pointer ${
                isSpinning
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 hover:scale-105 shadow-amber-500/30'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? (language === 'km' ? 'កំពុងបង្វិល...' : 'Spinning...') : (language === 'km' ? 'បង្វិលកង់សំណាង' : 'SPIN THE WHEEL')}</span>
            </button>
          </div>
        </div>

        {/* Right: Selected Challenge / Question Card */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCategory || selectedStudentName ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-scale-in">
              
              {/* Category / Winner Title */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    {language === 'km' ? 'លទ្ធផលបង្វិលកង់' : 'Wheel Result'}
                  </span>
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{selectedCategory ? selectedCategory.titleKm : `សិស្ស៖ ${selectedStudentName}`}</span>
                  </h3>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono text-sm font-black text-slate-700 dark:text-slate-300">
                    {timerSeconds}s
                  </span>
                </div>
              </div>

              {/* Active Question Box */}
              {activeQuestion && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white">
                    <p className="text-2xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1.5">
                      {language === 'km' ? 'សំណួរប្រកួតប្រជែង៖' : 'Challenge Question:'}
                    </p>
                    <p className="font-heading font-black text-base sm:text-lg leading-relaxed text-slate-900 dark:text-amber-100">
                      {activeQuestion.qKm}
                    </p>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {!isTimerRunning ? (
                        <button
                          onClick={startQuestionTimer}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>{language === 'km' ? 'ចាប់ផ្តើមរាប់ថយក្រោយ' : 'Start Timer'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopQuestionTimer}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer"
                        >
                          <span>{language === 'km' ? 'ផ្អាកនាឡិកា' : 'Pause'}</span>
                        </button>
                      )}
                    </div>

                    {/* Reveal Answer Toggle */}
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition flex items-center space-x-1 cursor-pointer"
                    >
                      {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAnswer ? (language === 'km' ? 'លាក់ចម្លើយ' : 'Hide Answer') : (language === 'km' ? 'បង្ហាញចម្លើយ' : 'Reveal Answer')}</span>
                    </button>
                  </div>

                  {/* Answer Box */}
                  {showAnswer && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-scale-in">
                      <p className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'km' ? 'ចម្លើយត្រឹមត្រូវ' : 'Correct Answer'}</span>
                      </p>
                      <p className="font-heading font-black text-base">
                        {activeQuestion.aKm}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* Standby Card */
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-heading font-black text-sm text-slate-600 dark:text-slate-300">
                {language === 'km' ? 'ចុចប៊ូតុង «បង្វិលកង់» ដើម្បីចាប់ផ្ដើម' : 'Click "SPIN THE WHEEL" to start!'}
              </p>
              <p className="text-xs max-w-xs mx-auto">
                {language === 'km'
                  ? 'កង់នឹងវិលយ៉ាងរលូន ហើយឈប់ចង្អុលលើប្រធានបទ ឬឈ្មោះសិស្សដោយចៃដន្យ'
                  : 'The wheel will stop randomly on a challenge category or a student.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
