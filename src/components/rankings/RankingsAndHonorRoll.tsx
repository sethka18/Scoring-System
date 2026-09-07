import React, { useState, useMemo, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Trophy, 
  Award, 
  Crown, 
  Medal, 
  Printer, 
  Calendar, 
  Sparkles, 
  Download, 
  Star,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Camera,
  Building2,
  UserCheck,
  Flame,
  Zap,
  Palette,
  ArrowUpDown,
  Edit3,
  Check,
  X,
  TrendingUp,
  RefreshCw,
  Send,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { calculatePeriodRankings, formatConductRating } from '../../utils/calculations';
import confetti from 'canvas-confetti';
import { StudentPhotoModal } from '../common/StudentPhotoModal';
import { TelegramShareModal } from '../common/TelegramShareModal';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { Student, Subject } from '../../types';

export type HonorHallTheme = 'royal_gold' | 'sapphire_blue' | 'imperial_emerald' | 'crimson_laurel' | 'modern_minimal';
export type SortOption = 'total_score' | 'average' | 'student_id' | 'name';

interface ThemeConfig {
  id: HonorHallTheme;
  nameKm: string;
  nameEn: string;
  swatchClass: string;
  boardBg: string;
  boardBorder: string;
  headerAccent: string;
  tableHeader: string;
  tableHover: string;
  ranks: {
    1: { border: string; bg: string; badge: string; avatarRing: string; titleKm: string; titleEn: string; icon: typeof Crown; textAccent: string };
    2: { border: string; bg: string; badge: string; avatarRing: string; titleKm: string; titleEn: string; icon: typeof Medal; textAccent: string };
    3: { border: string; bg: string; badge: string; avatarRing: string; titleKm: string; titleEn: string; icon: typeof Award; textAccent: string };
    4: { border: string; bg: string; badge: string; avatarRing: string; titleKm: string; titleEn: string; icon: typeof Star; textAccent: string };
    5: { border: string; bg: string; badge: string; avatarRing: string; titleKm: string; titleEn: string; icon: typeof Star; textAccent: string };
  };
}

const THEMES: Record<HonorHallTheme, ThemeConfig> = {
  royal_gold: {
    id: 'royal_gold',
    nameKm: 'រាជបល្ល័ង្កមាស (Royal Angkor Gold)',
    nameEn: 'Royal Angkor Gold',
    swatchClass: 'bg-gradient-to-r from-amber-400 to-amber-600 border-amber-300',
    boardBg: 'bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20',
    boardBorder: 'border-amber-300/80 ring-2 ring-amber-200/50',
    headerAccent: 'text-amber-900',
    tableHeader: 'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-amber-50',
    tableHover: 'hover:bg-amber-50/50',
    ranks: {
      1: {
        border: 'border-amber-400 ring-2 ring-amber-300/50',
        bg: 'bg-gradient-to-b from-amber-100/90 via-amber-50 to-white',
        badge: 'bg-amber-400 text-amber-950 font-black',
        avatarRing: 'ring-amber-400 shadow-amber-200',
        titleKm: 'សិស្សឆ្នើមលេខ ១',
        titleEn: '1st Place Valedictorian',
        icon: Crown,
        textAccent: 'text-amber-900'
      },
      2: {
        border: 'border-slate-300 ring-1 ring-slate-200',
        bg: 'bg-gradient-to-b from-slate-100 via-slate-50 to-white',
        badge: 'bg-slate-300 text-slate-900 font-black',
        avatarRing: 'ring-slate-300',
        titleKm: 'សិស្សឆ្នើមលេខ ២',
        titleEn: '2nd Place Star',
        icon: Medal,
        textAccent: 'text-slate-800'
      },
      3: {
        border: 'border-amber-700/60 ring-1 ring-amber-600/30',
        bg: 'bg-gradient-to-b from-amber-100/50 via-amber-50/30 to-white',
        badge: 'bg-amber-600 text-white font-black',
        avatarRing: 'ring-amber-600',
        titleKm: 'សិស្សឆ្នើមលេខ ៣',
        titleEn: '3rd Place Star',
        icon: Award,
        textAccent: 'text-amber-950'
      },
      4: {
        border: 'border-amber-200',
        bg: 'bg-gradient-to-b from-amber-50/40 to-white',
        badge: 'bg-amber-100 text-amber-900 font-black border border-amber-200',
        avatarRing: 'ring-amber-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៤',
        titleEn: '4th Place Honor',
        icon: Star,
        textAccent: 'text-amber-900'
      },
      5: {
        border: 'border-amber-200',
        bg: 'bg-gradient-to-b from-amber-50/40 to-white',
        badge: 'bg-amber-100 text-amber-900 font-black border border-amber-200',
        avatarRing: 'ring-amber-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៥',
        titleEn: '5th Place Honor',
        icon: Star,
        textAccent: 'text-amber-900'
      }
    }
  },
  sapphire_blue: {
    id: 'sapphire_blue',
    nameKm: 'ត្បូងពេជ្រនិលវ័ន្ត (Royal Sapphire)',
    nameEn: 'Royal Sapphire',
    swatchClass: 'bg-gradient-to-r from-sky-500 to-indigo-600 border-sky-300',
    boardBg: 'bg-gradient-to-b from-sky-50/40 via-white to-indigo-50/20',
    boardBorder: 'border-sky-300/80 ring-2 ring-sky-200/50',
    headerAccent: 'text-sky-950',
    tableHeader: 'bg-gradient-to-r from-slate-950 via-sky-950 to-indigo-950 text-sky-100',
    tableHover: 'hover:bg-sky-50/50',
    ranks: {
      1: {
        border: 'border-sky-400 ring-2 ring-sky-300/50',
        bg: 'bg-gradient-to-b from-sky-100/90 via-sky-50 to-white',
        badge: 'bg-sky-500 text-white font-black',
        avatarRing: 'ring-sky-400 shadow-sky-200',
        titleKm: 'សិស្សឆ្នើមលេខ ១',
        titleEn: '1st Place Valedictorian',
        icon: Crown,
        textAccent: 'text-sky-950'
      },
      2: {
        border: 'border-slate-300 ring-1 ring-slate-200',
        bg: 'bg-gradient-to-b from-slate-100 via-slate-50 to-white',
        badge: 'bg-slate-300 text-slate-900 font-black',
        avatarRing: 'ring-slate-300',
        titleKm: 'សិស្សឆ្នើមលេខ ២',
        titleEn: '2nd Place Star',
        icon: Medal,
        textAccent: 'text-slate-800'
      },
      3: {
        border: 'border-blue-600/60 ring-1 ring-blue-500/30',
        bg: 'bg-gradient-to-b from-blue-100/50 via-blue-50/30 to-white',
        badge: 'bg-blue-600 text-white font-black',
        avatarRing: 'ring-blue-600',
        titleKm: 'សិស្សឆ្នើមលេខ ៣',
        titleEn: '3rd Place Star',
        icon: Award,
        textAccent: 'text-blue-950'
      },
      4: {
        border: 'border-sky-200',
        bg: 'bg-gradient-to-b from-sky-50/40 to-white',
        badge: 'bg-sky-100 text-sky-900 font-black border border-sky-200',
        avatarRing: 'ring-sky-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៤',
        titleEn: '4th Place Honor',
        icon: Star,
        textAccent: 'text-sky-900'
      },
      5: {
        border: 'border-sky-200',
        bg: 'bg-gradient-to-b from-sky-50/40 to-white',
        badge: 'bg-sky-100 text-sky-900 font-black border border-sky-200',
        avatarRing: 'ring-sky-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៥',
        titleEn: '5th Place Honor',
        icon: Star,
        textAccent: 'text-sky-900'
      }
    }
  },
  imperial_emerald: {
    id: 'imperial_emerald',
    nameKm: 'ត្បូងមរកតរុងរឿង (Imperial Emerald)',
    nameEn: 'Imperial Emerald',
    swatchClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-300',
    boardBg: 'bg-gradient-to-b from-emerald-50/40 via-white to-teal-50/20',
    boardBorder: 'border-emerald-300/80 ring-2 ring-emerald-200/50',
    headerAccent: 'text-emerald-950',
    tableHeader: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-emerald-50',
    tableHover: 'hover:bg-emerald-50/50',
    ranks: {
      1: {
        border: 'border-emerald-400 ring-2 ring-emerald-300/50',
        bg: 'bg-gradient-to-b from-emerald-100/90 via-emerald-50 to-white',
        badge: 'bg-emerald-600 text-white font-black',
        avatarRing: 'ring-emerald-400 shadow-emerald-200',
        titleKm: 'សិស្សឆ្នើមលេខ ១',
        titleEn: '1st Place Valedictorian',
        icon: Crown,
        textAccent: 'text-emerald-950'
      },
      2: {
        border: 'border-slate-300 ring-1 ring-slate-200',
        bg: 'bg-gradient-to-b from-slate-100 via-slate-50 to-white',
        badge: 'bg-slate-300 text-slate-900 font-black',
        avatarRing: 'ring-slate-300',
        titleKm: 'សិស្សឆ្នើមលេខ ២',
        titleEn: '2nd Place Star',
        icon: Medal,
        textAccent: 'text-slate-800'
      },
      3: {
        border: 'border-teal-600/60 ring-1 ring-teal-500/30',
        bg: 'bg-gradient-to-b from-teal-100/50 via-teal-50/30 to-white',
        badge: 'bg-teal-700 text-white font-black',
        avatarRing: 'ring-teal-600',
        titleKm: 'សិស្សឆ្នើមលេខ ៣',
        titleEn: '3rd Place Star',
        icon: Award,
        textAccent: 'text-teal-950'
      },
      4: {
        border: 'border-emerald-200',
        bg: 'bg-gradient-to-b from-emerald-50/40 to-white',
        badge: 'bg-emerald-100 text-emerald-900 font-black border border-emerald-200',
        avatarRing: 'ring-emerald-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៤',
        titleEn: '4th Place Honor',
        icon: Star,
        textAccent: 'text-emerald-900'
      },
      5: {
        border: 'border-emerald-200',
        bg: 'bg-gradient-to-b from-emerald-50/40 to-white',
        badge: 'bg-emerald-100 text-emerald-900 font-black border border-emerald-200',
        avatarRing: 'ring-emerald-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៥',
        titleEn: '5th Place Honor',
        icon: Star,
        textAccent: 'text-emerald-900'
      }
    }
  },
  crimson_laurel: {
    id: 'crimson_laurel',
    nameKm: 'គោមមាសកិត្តិយស (Crimson Laurels)',
    nameEn: 'Crimson Laurels',
    swatchClass: 'bg-gradient-to-r from-rose-500 to-red-600 border-rose-300',
    boardBg: 'bg-gradient-to-b from-rose-50/40 via-white to-red-50/20',
    boardBorder: 'border-rose-300/80 ring-2 ring-rose-200/50',
    headerAccent: 'text-rose-950',
    tableHeader: 'bg-gradient-to-r from-rose-950 via-red-950 to-rose-950 text-rose-50',
    tableHover: 'hover:bg-rose-50/50',
    ranks: {
      1: {
        border: 'border-rose-400 ring-2 ring-rose-300/50',
        bg: 'bg-gradient-to-b from-rose-100/90 via-rose-50 to-white',
        badge: 'bg-rose-600 text-white font-black',
        avatarRing: 'ring-rose-400 shadow-rose-200',
        titleKm: 'សិស្សឆ្នើមលេខ ១',
        titleEn: '1st Place Valedictorian',
        icon: Crown,
        textAccent: 'text-rose-950'
      },
      2: {
        border: 'border-slate-300 ring-1 ring-slate-200',
        bg: 'bg-gradient-to-b from-slate-100 via-slate-50 to-white',
        badge: 'bg-slate-300 text-slate-900 font-black',
        avatarRing: 'ring-slate-300',
        titleKm: 'សិស្សឆ្នើមលេខ ២',
        titleEn: '2nd Place Star',
        icon: Medal,
        textAccent: 'text-slate-800'
      },
      3: {
        border: 'border-amber-600/70 ring-1 ring-amber-500/30',
        bg: 'bg-gradient-to-b from-amber-100/50 via-amber-50/30 to-white',
        badge: 'bg-amber-600 text-white font-black',
        avatarRing: 'ring-amber-600',
        titleKm: 'សិស្សឆ្នើមលេខ ៣',
        titleEn: '3rd Place Star',
        icon: Award,
        textAccent: 'text-amber-950'
      },
      4: {
        border: 'border-rose-200',
        bg: 'bg-gradient-to-b from-rose-50/40 to-white',
        badge: 'bg-rose-100 text-rose-900 font-black border border-rose-200',
        avatarRing: 'ring-rose-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៤',
        titleEn: '4th Place Honor',
        icon: Star,
        textAccent: 'text-rose-900'
      },
      5: {
        border: 'border-rose-200',
        bg: 'bg-gradient-to-b from-rose-50/40 to-white',
        badge: 'bg-rose-100 text-rose-900 font-black border border-rose-200',
        avatarRing: 'ring-rose-300',
        titleKm: 'សិស្សកិត្តិយសលេខ ៥',
        titleEn: '5th Place Honor',
        icon: Star,
        textAccent: 'text-rose-900'
      }
    }
  },
  modern_minimal: {
    id: 'modern_minimal',
    nameKm: 'តិចណូឡូជីទំនើប (Modern Minimalist)',
    nameEn: 'Modern Minimalist',
    swatchClass: 'bg-gradient-to-r from-slate-700 to-indigo-900 border-slate-500',
    boardBg: 'bg-white',
    boardBorder: 'border-slate-200 shadow-sm',
    headerAccent: 'text-slate-900',
    tableHeader: 'bg-slate-900 text-white',
    tableHover: 'hover:bg-slate-50',
    ranks: {
      1: {
        border: 'border-indigo-400 ring-2 ring-indigo-300/40',
        bg: 'bg-gradient-to-b from-indigo-50/80 via-white to-white',
        badge: 'bg-indigo-600 text-white font-black',
        avatarRing: 'ring-indigo-400 shadow-indigo-100',
        titleKm: 'សិស្សឆ្នើមលេខ ១',
        titleEn: '1st Place Valedictorian',
        icon: Crown,
        textAccent: 'text-indigo-950'
      },
      2: {
        border: 'border-slate-300 ring-1 ring-slate-200',
        bg: 'bg-white',
        badge: 'bg-slate-200 text-slate-900 font-black',
        avatarRing: 'ring-slate-300',
        titleKm: 'សិស្សឆ្នើមលេខ ២',
        titleEn: '2nd Place Star',
        icon: Medal,
        textAccent: 'text-slate-800'
      },
      3: {
        border: 'border-slate-300 ring-1 ring-slate-200',
        bg: 'bg-white',
        badge: 'bg-amber-600 text-white font-black',
        avatarRing: 'ring-amber-600',
        titleKm: 'សិស្សឆ្នើមលេខ ៣',
        titleEn: '3rd Place Star',
        icon: Award,
        textAccent: 'text-amber-950'
      },
      4: {
        border: 'border-slate-200',
        bg: 'bg-white',
        badge: 'bg-slate-100 text-slate-800 font-black border border-slate-200',
        avatarRing: 'ring-slate-200',
        titleKm: 'សិស្សកិត្តិយសលេខ ៤',
        titleEn: '4th Place Honor',
        icon: Star,
        textAccent: 'text-slate-800'
      },
      5: {
        border: 'border-slate-200',
        bg: 'bg-white',
        badge: 'bg-slate-100 text-slate-800 font-black border border-slate-200',
        avatarRing: 'ring-slate-200',
        titleKm: 'សិស្សកិត្តិយសលេខ ៥',
        titleEn: '5th Place Honor',
        icon: Star,
        textAccent: 'text-slate-800'
      }
    }
  }
};

export const RankingsAndHonorRoll: React.FC = () => {
  const {
    language,
    activeClass,
    schoolProfile,
    classStudents,
    subjects,
    periods,
    scoresMatrix,
    weights,
    competencyWeights,
    updateSubjectScore,
    showToast,
    setActiveTab,
  } = useGradebook();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('p_feb');
  const [viewMode, setViewMode] = useState<'honor_roll' | 'full_ranking'>('honor_roll');
  const [sortBy, setSortBy] = useState<SortOption>('total_score');
  const [selectedTheme, setSelectedTheme] = useState<HonorHallTheme>(() => {
    const saved = localStorage.getItem('ls_honor_hall_theme');
    return (saved as HonorHallTheme) || 'royal_gold';
  });

  const [photoModalStudent, setPhotoModalStudent] = useState<{ student: Student; rank?: number } | null>(null);
  const [telegramStudent, setTelegramStudent] = useState<Student | null>(null);
  const [quickScoreModal, setQuickScoreModal] = useState<{ student: Student; subject: Subject; currentScore: number } | null>(null);
  const [scoreInputValue, setScoreInputValue] = useState<string>('');
  const [interventionThreshold, setInterventionThreshold] = useState<number>(5.0); // 5.0 = 50%
  const [filterInterventionOnly, setFilterInterventionOnly] = useState<boolean>(false);

  // Persist theme choice
  const handleThemeChange = (theme: HonorHallTheme) => {
    setSelectedTheme(theme);
    localStorage.setItem('ls_honor_hall_theme', theme);
    showToast(
      language === 'km' 
        ? `បានប្ដូរស្ទីលតារាងកិត្តិយស៖ ${THEMES[theme].nameKm}` 
        : `Theme updated to ${THEMES[theme].nameEn}`,
      'info'
    );
  };

  const currentPeriod = periods.find(p => p.id === selectedPeriodId) || periods[0];
  const activeThemeConfig = THEMES[selectedTheme] || THEMES.royal_gold;

  // Automatically recalculate rankings and sort whenever scoresMatrix, weights, classStudents, or sortBy change
  const rankings = useMemo(() => {
    return calculatePeriodRankings(
      classStudents,
      selectedPeriodId,
      subjects,
      scoresMatrix,
      weights,
      competencyWeights,
      sortBy
    );
  }, [classStudents, selectedPeriodId, subjects, scoresMatrix, weights, competencyWeights, sortBy]);

  // Identify students needing intervention (overall average or any subject below threshold)
  const studentsNeedingIntervention = useMemo(() => {
    return rankings.filter(item => {
      const avgBelow = item.average < interventionThreshold;
      const anySubjectBelow = subjects.some(s => (item.subjectScores[s.id] ?? 0) < interventionThreshold);
      return avgBelow || anySubjectBelow;
    });
  }, [rankings, subjects, interventionThreshold]);

  const displayedRankings = useMemo(() => {
    if (filterInterventionOnly) {
      return studentsNeedingIntervention;
    }
    return rankings;
  }, [rankings, filterInterventionOnly, studentsNeedingIntervention]);

  // Top 5 achievers always extracted from the highest total score ranking
  const topAchievers = useMemo(() => {
    // Top 5 strictly by academic rank 1 to 5
    const rankedByScore = calculatePeriodRankings(
      classStudents,
      selectedPeriodId,
      subjects,
      scoresMatrix,
      weights,
      competencyWeights,
      'total_score'
    );
    return rankedByScore.slice(0, 5);
  }, [classStudents, selectedPeriodId, subjects, scoresMatrix, weights, competencyWeights]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleOpenQuickScore = (student: Student, subject: Subject, currentScore: number) => {
    setQuickScoreModal({ student, subject, currentScore });
    setScoreInputValue(currentScore.toString());
  };

  const handleSaveQuickScore = () => {
    if (!quickScoreModal) return;
    const parsed = parseFloat(scoreInputValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 10) {
      showToast(
        language === 'km' ? 'សូមបញ្ចូលពិន្ទុត្រឹមត្រូវពី ០ ដល់ ១០' : 'Please enter a valid score between 0 and 10',
        'warning'
      );
      return;
    }

    updateSubjectScore(quickScoreModal.student.id, selectedPeriodId, quickScoreModal.subject.id, {
      rawScore: parsed,
      midterm: parsed,
      finalExam: parsed
    });

    showToast(
      language === 'km' 
        ? `បានកែប្រែពិន្ទុ ${quickScoreModal.student.name} (${parsed.toFixed(1)}/10) - ចំណាត់ថ្នាក់បានគណនាឡើងវិញដោយស្វ័យប្រវត្តិ!`
        : `Updated score for ${quickScoreModal.student.name} - Rankings auto-recalculated!`,
      'success'
    );

    if (parsed >= 9.5) {
      triggerCelebration();
    }

    setQuickScoreModal(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Controls Panel */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        
        {/* Main Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>តារាងចំណាត់ថ្នាក់ & តារាងកិត្តិយស</span>
            </h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>គណនា & តម្រៀបស្វ័យប្រវត្តិតាមពិន្ទុ</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                សរុប៖ {classStudents.length} នាក់
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('school_hub')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 text-xs font-black transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-700" />
              <span>{language === 'km' ? 'កិត្តិយសទូទាំងសាលា' : 'Schoolwide Top 5'}</span>
            </button>

            <button
              onClick={triggerCelebration}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'km' ? 'អបអរសាទរ 🎉' : 'Celebrate 🎉'}</span>
            </button>

            {/* A4 Clean Print to PDF Button */}
            <PrintToPdfButton
              targetElementId="official-rankings-print-container"
              documentTitle={`MoEYS_${activeClass?.nameKm || 'Class'}_${viewMode === 'honor_roll' ? 'Top5_Honor_Roll' : 'Full_Rank_Table'}_${currentPeriod.code}`}
              pageSize="a4"
              orientation="portrait"
              variant="primary"
              size="sm"
              labelKm="ទាញយកជា PDF (A4)"
              labelEn="Export to PDF (A4)"
            />
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriodId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedPeriodId === p.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'km' ? p.nameKm : p.nameEn}
            </button>
          ))}
        </div>

        {/* Control Toolbar: Sort Criterion & Honor Hall Theme Picker */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          
          {/* Left: View Mode & Auto-Sort Options */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('honor_roll')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  viewMode === 'honor_roll' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                🏆 {language === 'km' ? 'តារាងកិត្តិយស Top 5' : 'Top 5 Honor Roll'}
              </button>
              <button
                onClick={() => setViewMode('full_ranking')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  viewMode === 'full_ranking' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                📋 {language === 'km' ? 'តារាងចំណាត់ថ្នាក់ពេញលេញ' : 'Full Rank Table'}
              </button>
            </div>

            {/* Auto-Sort Selector */}
            <div className="inline-flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-500">
                {language === 'km' ? 'តម្រៀបតាម៖' : 'Sort by:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="total_score">{language === 'km' ? '🥇 ផលបូកពិន្ទុសរុប (ខ្ពស់-ទាប)' : 'Total Score (High-Low)'}</option>
                <option value="average">{language === 'km' ? '📊 មធ្យមភាគពិន្ទុ (ខ្ពស់-ទាប)' : 'Average Score (High-Low)'}</option>
                <option value="student_id">{language === 'km' ? '🔢 អត្តលេខសិស្ស' : 'Student ID'}</option>
                <option value="name">{language === 'km' ? '🔤 ឈ្មោះសិស្ស (ក-អ)' : 'Student Name (A-Z)'}</option>
              </select>
            </div>
          </div>

          {/* Right: Honor Hall Theme Selector */}
          <div className="flex items-center md:justify-end space-x-2">
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-600">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px]">{language === 'km' ? 'ស្ទីលតារាងកិត្តិយស៖' : 'Honor Theme:'}</span>
            </div>
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {(Object.keys(THEMES) as HonorHallTheme[]).map((themeKey) => {
                const t = THEMES[themeKey];
                const isSelected = selectedTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => handleThemeChange(themeKey)}
                    title={language === 'km' ? t.nameKm : t.nameEn}
                    className={`group relative flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${t.swatchClass} border shadow-2xs`}></span>
                    <span className="truncate max-w-[85px] sm:max-w-none">
                      {themeKey === 'royal_gold' ? (language === 'km' ? 'មាស' : 'Gold') :
                       themeKey === 'sapphire_blue' ? (language === 'km' ? 'ត្បូងពេជ្រ' : 'Sapphire') :
                       themeKey === 'imperial_emerald' ? (language === 'km' ? 'មរកត' : 'Emerald') :
                       themeKey === 'crimson_laurel' ? (language === 'km' ? 'គោមមាស' : 'Crimson') :
                       (language === 'km' ? 'ទំនើប' : 'Minimal')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* OFFICIAL PRINTABLE CERTIFICATE & HONOR ROLL / RANK SHEET */}
      <div 
        id="official-rankings-print-container"
        className={`rounded-2xl border ${activeThemeConfig.boardBorder} ${activeThemeConfig.boardBg} p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none printable-area text-slate-900 transition-all duration-300`}
      >
        
        {/* Official Header with MoEYS Logo matching Cambodian Primary School Standard */}
        <div className="text-center pb-6 border-b-2 border-slate-900/80 mb-6">
          <div className="flex justify-between items-start text-left text-xs font-semibold text-slate-700 mb-2">
            <div className="flex items-center space-x-3">
              <SchoolLogo size={52} customLogoUrl={schoolProfile?.logoUrl} />
              <div>
                <p className="font-extrabold text-slate-900 text-xs uppercase tracking-tight">
                  ក្រសួងអប់រំ យុវជន និងកីឡា
                </p>
                <p className={`font-black ${activeThemeConfig.headerAccent} text-sm uppercase`}>
                  {language === 'km' ? activeClass?.schoolNameKm : activeClass?.schoolName}
                </p>
                <p className="text-slate-600 font-bold text-[11px]">{language === 'km' ? `ថ្នាក់៖ ${activeClass?.nameKm}` : `Class: ${activeClass?.name}`}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-900 text-xs">
                {language === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'Kingdom of Cambodia'}
              </p>
              <p className="text-slate-500 font-bold text-[11px]">
                {language === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'Nation Religion King'}
              </p>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {activeClass?.academicYear}
              </div>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 mt-3 uppercase tracking-wide">
            {viewMode === 'honor_roll' 
              ? (language === 'km' ? 'តារាងកិត្តិយសសិស្សឆ្នើមទាំង ៥ រូប (TOP 5 HONOR ROLL)' : 'TOP 5 ACADEMIC HONOR ROLL')
              : (language === 'km' ? 'តារាងចំណាត់ថ្នាក់លទ្ធផលសិក្សា' : 'CLASS RANKING & SCORE SHEET')}
          </h1>
          
          <p className="font-semibold text-slate-800 text-sm mt-1">
            {language === 'km' 
              ? `ប្រចាំ៖ ${currentPeriod.nameKm} • ឆ្នាំសិក្សា ${activeClass?.academicYear}` 
              : `Period: ${currentPeriod.nameEn} • Academic Year ${activeClass?.academicYear}`}
          </p>

          {/* Lunar & Solar Calendar Information */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/60">
            {currentPeriod.lunarDateKm && (
              <span>
                <strong className="text-slate-900">{language === 'km' ? 'ចន្ទគតិ៖ ' : 'Lunar: '}</strong>
                {language === 'km' ? currentPeriod.lunarDateKm : currentPeriod.lunarDateEn}
              </span>
            )}
            {currentPeriod.solarDate && (
              <span>
                <strong className="text-slate-900">{language === 'km' ? 'សុរិយគតិ៖ ' : 'Solar: '}</strong>
                {currentPeriod.solarDate}
              </span>
            )}
          </div>
        </div>

        {/* 1. HONOR ROLL VIEW: ALL TOP 5 STUDENTS SHOWCASE (ALL 5 CARDS + TABLE + PHOTO UPLOAD) */}
        {viewMode === 'honor_roll' && (
          <div className="space-y-6">
            
            {/* Top 5 Showcase Cards Grid (Styled by Selected Honor Hall Theme) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
              {topAchievers.map((item, idx) => {
                const rankNum = (item.rank <= 5 ? item.rank : idx + 1) as 1 | 2 | 3 | 4 | 5;
                const style = activeThemeConfig.ranks[rankNum] || activeThemeConfig.ranks[5];
                const Icon = style.icon;

                return (
                  <div
                    key={item.student.id}
                    className={`rounded-2xl border-2 ${style.border} ${style.bg} p-4 text-center relative shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
                  >
                    {/* Top Rank Badge with Theme Icon */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider shadow-xs ${style.badge}`}>
                        <Icon className="w-3 h-3" />
                        <span>#{item.rank}</span>
                      </span>
                    </div>

                    <div>
                      {/* Student Photo / Avatar with photo change trigger */}
                      <div className="relative w-20 h-20 mx-auto mb-2 mt-2 group">
                        {item.student.photoUrl ? (
                          <img 
                            src={item.student.photoUrl} 
                            alt={item.student.name}
                            className={`w-20 h-20 rounded-full object-cover shadow-md border-2 border-white ring-2 ${style.avatarRing}`}
                          />
                        ) : (
                          <div className={`w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 border-2 border-slate-100 ring-2 ${style.avatarRing} font-black text-xl`}>
                            {item.student.name.charAt(item.student.name.lastIndexOf(' ') + 1) || item.student.name.charAt(0)}
                          </div>
                        )}
                        
                        <button
                          onClick={() => setPhotoModalStudent({ student: item.student, rank: item.rank })}
                          title={language === 'km' ? 'បញ្ចូល ឬប្ដូររូបថត' : 'Upload or change photo'}
                          className="no-print absolute bottom-0 right-0 p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md cursor-pointer transition transform hover:scale-110"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className={`text-[11px] font-black ${style.textAccent} uppercase tracking-wider`}>
                        {language === 'km' ? style.titleKm : style.titleEn}
                      </div>

                      <h3 className="font-heading font-extrabold text-base text-slate-900 mt-1 truncate" title={item.student.name}>
                        {item.student.name}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-500 font-mono">{item.student.studentId}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                      
                      {/* Total Score & Average Display */}
                      <div className="bg-white/80 rounded-xl p-2 border border-slate-200/60 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                          <span>{language === 'km' ? 'ពិន្ទុសរុប៖' : 'Total Score:'}</span>
                          <span className="font-black text-slate-900 font-mono">{item.totalPoints.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span>{language === 'km' ? 'មធ្យមភាគ៖' : 'Average:'}</span>
                          <span className="font-black text-indigo-700 font-mono text-sm">{item.average.toFixed(2)}/10</span>
                        </div>
                      </div>

                      <div className="mt-1 text-[10px] font-black text-emerald-700">
                        {language === 'km' ? 'និទ្ទេស A' : 'Grade A'}
                      </div>

                      {/* Action Buttons for Top Students */}
                      <div className="no-print mt-2.5 grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setPhotoModalStudent({ student: item.student, rank: item.rank })}
                          className="py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[10px] font-black transition cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Camera className="w-3 h-3 text-slate-600" />
                          <span>{item.student.photoUrl ? (language === 'km' ? 'រូបថត' : 'Photo') : (language === 'km' ? '+ រូប' : '+ Photo')}</span>
                        </button>

                        <button
                          onClick={() => setTelegramStudent(item.student)}
                          className="py-1 px-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-[10px] font-black transition cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Send className="w-3 h-3 text-sky-600" />
                          <span>Telegram</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Honor Roll Table for All Top 5 Achievers */}
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className={`${activeThemeConfig.tableHeader} font-bold uppercase text-[11px]`}>
                  <tr>
                    <th className="py-3 px-4 text-center w-14">{language === 'km' ? 'ល.រ' : 'Rank'}</th>
                    <th className="py-3 px-3 text-center w-16">{language === 'km' ? 'រូបថត' : 'Photo'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'អត្តលេខ' : 'Student ID'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'គោត្តនាម និងនាម' : 'Student Name'}</th>
                    <th className="py-3 px-4 text-center">{language === 'km' ? 'ភេទ' : 'Gender'}</th>
                    <th className="py-3 px-4 text-center bg-black/10">{language === 'km' ? 'ពិន្ទុសរុប' : 'Total Score'}</th>
                    <th className="py-3 px-4 text-center">{language === 'km' ? 'មធ្យមភាគ' : 'Average Score'}</th>
                    <th className="py-3 px-4 text-center">{language === 'km' ? 'សីលធម៌' : 'Conduct'}</th>
                    <th className="py-3 px-4 text-right">{language === 'km' ? 'កិត្តិយស' : 'Distinction'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topAchievers.map((item) => (
                    <tr key={item.student.id} className={`${activeThemeConfig.tableHover} transition`}>
                      <td className="py-3 px-4 text-center">
                        <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                          item.rank === 1 ? 'bg-amber-400 text-amber-950 font-black ring-1 ring-amber-300' :
                          item.rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                          item.rank === 3 ? 'bg-amber-600 text-white font-black' :
                          'bg-indigo-50 text-indigo-900 font-black border border-indigo-200'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setPhotoModalStudent({ student: item.student, rank: item.rank })}
                          className="relative inline-block group cursor-pointer"
                          title={language === 'km' ? 'បញ្ចូល ឬប្ដូររូបថត' : 'Upload or edit photo'}
                        >
                          {item.student.photoUrl ? (
                            <img
                              src={item.student.photoUrl}
                              alt={item.student.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-indigo-500"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                              <Camera className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{item.student.studentId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.student.name}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-semibold text-slate-600">
                          {item.student.gender === 'Female' ? (language === 'km' ? 'ស្រី' : 'Female') : (language === 'km' ? 'ប្រុស' : 'Male')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center bg-slate-50/70 font-mono font-bold text-slate-900">
                        {item.totalPoints.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm font-black text-indigo-700 font-mono">{item.average.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {formatConductRating(item.student.conductRating, language)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {item.rank === 1 
                          ? (language === 'km' ? 'សិស្សឆ្នើមលេខ ១' : 'Valedictorian (Top 1)') 
                          : (language === 'km' ? `តារាងកិត្តិយស Top 5 (#${item.rank})` : `Top 5 Honor Roll (#${item.rank})`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 2. FULL RANKING TABLE (WITH TOTAL SCORE, AUTOMATIC RANK SORTING & QUICK EDIT) */}
        {viewMode === 'full_ranking' && (
          <div className="space-y-4">
            
            {/* Intervention Summary & Controls Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-black text-slate-900">
                        {language === 'km' ? 'ការកំណត់ចំណាំអន្តរាគមន៍ និងការបំប៉នសិស្ស' : 'Intervention & Remedial Highlighting'}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        {studentsNeedingIntervention.length} {language === 'km' ? 'នាក់ត្រូវការជំនួយ' : 'need intervention'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {language === 'km' 
                        ? `រំលេចពណ៌ក្រហមស្រាលលើក្រឡាពិន្ទុ < ${Math.round(interventionThreshold * 10)}% (< ${interventionThreshold.toFixed(1)}) ដើម្បីជួយលោកគ្រូអ្នកគ្រូកំណត់អត្តសញ្ញាណសិស្សត្រូវការជំនួយភ្លាមៗ`
                        : `Highlighting scores below ${Math.round(interventionThreshold * 10)}% (< ${interventionThreshold.toFixed(1)}) with soft red background to help identify students needing intervention`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Threshold Selector */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-[11px]">
                    <span className="text-slate-600 px-1 font-bold">
                      {language === 'km' ? 'កម្រិត៖' : 'Threshold:'}
                    </span>
                    {[
                      { label: '< ៥០% (៥.០)', val: 5.0 },
                      { label: '< ៦០% (៦.០)', val: 6.0 },
                      { label: '< ៤០% (៤.០)', val: 4.0 },
                    ].map(t => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setInterventionThreshold(t.val)}
                        className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                          interventionThreshold === t.val 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Filter Only Intervention Students Button */}
                  <button
                    type="button"
                    onClick={() => setFilterInterventionOnly(!filterInterventionOnly)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      filterInterventionOnly 
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>
                      {filterInterventionOnly 
                        ? (language === 'km' ? 'បង្ហាញទាំងអស់' : 'Show All')
                        : (language === 'km' ? `បង្ហាញតែសិស្សត្រូវការជំនួយ (${studentsNeedingIntervention.length})` : `Show Needing Help (${studentsNeedingIntervention.length})`)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Legend Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-300 inline-block"></span>
                    <span className="font-semibold text-rose-800">
                      {language === 'km' 
                        ? `ក្រឡាពណ៌ក្រហមស្រាល = ពិន្ទុ < ${interventionThreshold.toFixed(1)} (${Math.round(interventionThreshold * 10)}%) ត្រូវការជំនួយអន្តរាគមន៍`
                        : `Soft Red Cells = Score < ${interventionThreshold.toFixed(1)} (${Math.round(interventionThreshold * 10)}%) Needs Intervention`}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  {language === 'km' ? '* ចុចលើពិន្ទុដើម្បីកែប្រែ ឬបន្ថែមពិន្ទុភ្លាមៗ' : '* Click on any score to quickly edit and re-calculate'}
                </div>
              </div>
            </div>

            {/* Table Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">{language === 'km' ? 'លំដាប់តម្រៀបបច្ចុប្បន្ន៖ ' : 'Current Sorting: '}</span>
                <span className="font-semibold text-indigo-700">
                  {sortBy === 'total_score' ? (language === 'km' ? 'ផលបូកពិន្ទុសរុប (ខ្ពស់-ទាប)' : 'Total Score (Descending)') :
                   sortBy === 'average' ? (language === 'km' ? 'មធ្យមភាគពិន្ទុ (ខ្ពស់-ទាប)' : 'Average Score (Descending)') :
                   sortBy === 'student_id' ? (language === 'km' ? 'អត្តលេខសិស្ស' : 'Student ID') :
                   (language === 'km' ? 'ឈ្មោះសិស្ស' : 'Student Name')}
                </span>
                {filterInterventionOnly && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                    {language === 'km' ? '(កំពុងច្រោះបង្ហាញតែសិស្សត្រូវការជំនួយ)' : '(Filtered for intervention)'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {language === 'km' ? `បង្ហាញ ${displayedRankings.length} / ${rankings.length} នាក់` : `Showing ${displayedRankings.length} / ${rankings.length} students`}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-200 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">{language === 'km' ? 'ចំណាត់ថ្នាក់' : 'Rank'}</th>
                    <th className="py-3 px-3 w-24">{language === 'km' ? 'អត្តលេខ' : 'Student ID'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'ឈ្មោះសិស្ស' : 'Full Name'}</th>
                    <th className="py-3 px-2 text-center">{language === 'km' ? 'ភេទ' : 'Gender'}</th>
                    
                    {subjects.map(s => (
                      <th key={s.id} className="py-3 px-2 text-center">
                        <div className="truncate max-w-[80px]" title={s.nameKm}>{language === 'km' ? s.nameKm : s.code}</div>
                      </th>
                    ))}

                    <th className="py-3 px-3 text-center bg-amber-500/20 text-amber-200 font-black">{language === 'km' ? 'ពិន្ទុសរុប' : 'Total'}</th>
                    <th className="py-3 px-3 text-center bg-indigo-600/30 text-indigo-200 font-black">{language === 'km' ? 'មធ្យមភាគ' : 'Avg'}</th>
                    <th className="py-3 px-2 text-center">{language === 'km' ? 'និទ្ទេស' : 'Grade'}</th>
                    <th className="py-3 px-2 text-center">{language === 'km' ? 'លទ្ធផល' : 'Status'}</th>
                    <th className="py-3 px-2 text-center no-print">{language === 'km' ? 'សកម្មភាព' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedRankings.map((item) => {
                    const passed = item.average >= 5.0;
                    const lowSubjects = subjects.filter(s => (item.subjectScores[s.id] ?? 0) < interventionThreshold);
                    const hasIntervention = lowSubjects.length > 0 || item.average < interventionThreshold;

                    return (
                      <tr key={item.student.id} className={`transition ${hasIntervention ? 'bg-rose-50/20 hover:bg-rose-50/50' : 'hover:bg-slate-50/80'}`}>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block font-black text-xs px-2 py-0.5 rounded-full ${
                            item.rank === 1 ? 'bg-amber-400 text-amber-950 font-black shadow-xs' :
                            item.rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                            item.rank === 3 ? 'bg-amber-600 text-white font-black' :
                            item.rank <= 5 ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200' :
                            'text-slate-600'
                          }`}>
                            #{item.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{item.student.studentId}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center">
                            <span className="font-semibold text-slate-900">{item.student.name}</span>
                            {lowSubjects.length > 0 && (
                              <span 
                                title={language === 'km' ? `${lowSubjects.map(s => s.nameKm).join(', ')} ក្រោម ${Math.round(interventionThreshold * 10)}%` : `${lowSubjects.map(s => s.nameEn).join(', ')} below threshold`}
                                className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0"
                              >
                                {language === 'km' ? `⚠️ ${lowSubjects.length} មុខ < ${Math.round(interventionThreshold * 10)}%` : `⚠️ ${lowSubjects.length} low`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`text-[10px] font-bold ${item.student.gender === 'Female' ? 'text-pink-600' : 'text-blue-600'}`}>
                            {item.student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>

                        {subjects.map(s => {
                          const val = item.subjectScores[s.id] ?? 0;
                          const isLow = val < interventionThreshold;

                          return (
                            <td 
                              key={s.id} 
                              onClick={() => handleOpenQuickScore(item.student, s, val)}
                              title={language === 'km' 
                                ? `${isLow ? '⚠️ ពិន្ទុក្រោម ' + Math.round(interventionThreshold * 10) + '% (ត្រូវការជំនួយអន្តរាគមន៍) - ' : ''}ចុចដើម្បីកែប្រែពិន្ទុ ${s.nameKm}` 
                                : `${isLow ? '⚠️ Below threshold (Needs intervention) - ' : ''}Click to edit ${s.nameEn}`}
                              className={`py-2.5 px-2 text-center cursor-pointer transition border-r border-slate-100 ${
                                isLow 
                                  ? 'bg-rose-50 text-rose-700 font-black hover:bg-rose-100' 
                                  : 'font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                              }`}
                            >
                              <span className={`inline-block px-1.5 py-0.5 rounded transition ${
                                isLow 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300 font-black shadow-2xs' 
                                  : 'border-b border-dashed border-slate-300'
                              }`}>
                                {val.toFixed(1)}
                              </span>
                            </td>
                          );
                        })}

                        {/* Dedicated Total Score Column */}
                        <td className="py-2.5 px-3 text-center bg-amber-50/50">
                          <span className="font-black text-amber-900 font-mono text-xs sm:text-sm">
                            {item.totalPoints.toFixed(1)}
                          </span>
                        </td>

                        {/* Average Score Column */}
                        <td className={`py-2.5 px-3 text-center transition ${item.average < interventionThreshold ? 'bg-rose-50 border-r border-rose-200' : 'bg-indigo-50/50'}`}>
                          <span className={`font-black font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded ${
                            item.average < interventionThreshold 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs' 
                              : 'text-indigo-700'
                          }`}>
                            {item.average.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <span className={`font-black text-xs ${item.average >= 8.5 ? 'text-emerald-600' : item.average >= 7.5 ? 'text-blue-600' : item.average >= 6.5 ? 'text-cyan-600' : item.average >= 6.0 ? 'text-amber-600' : item.average >= 5.0 ? 'text-orange-600' : 'text-rose-600'}`}>
                            {item.average >= 8.5 ? 'A' : item.average >= 7.5 ? 'B' : item.average >= 6.5 ? 'C' : item.average >= 6.0 ? 'D' : item.average >= 5.0 ? 'E' : 'F'}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                            {passed ? (language === 'km' ? 'ជាប់' : 'Pass') : (language === 'km' ? 'ធ្លាក់' : 'Fail')}
                          </span>
                        </td>

                        {/* Row Quick Action Buttons */}
                        <td className="py-2.5 px-2 text-center no-print">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setTelegramStudent(item.student)}
                              title={language === 'km' ? 'ផ្ញើរបាយការណ៍ Telegram' : 'Share via Telegram'}
                              className="p-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 transition cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setPhotoModalStudent({ student: item.student, rank: item.rank })}
                              title={language === 'km' ? 'រូបថតសិស្ស' : 'Student Photo'}
                              className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                            >
                              <Camera className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Signature Footer for Cambodian Primary School Records */}
        <div className="mt-12 pt-6 grid grid-cols-2 text-center text-xs text-slate-700 page-break-inside-avoid border-t border-slate-200">
          <div>
            <p className="font-bold text-slate-900 uppercase">
              {language === 'km' ? 'បានឃើញ និងឯកភាព' : 'Approved By'}
            </p>
            <p className="font-semibold">{language === 'km' ? 'នាយកសាលា' : 'Principal'}</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-400">{language === 'km' ? '(ហត្ថលេខា និងត្រា)' : '(Signature & Stamp)'}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-600">
              {currentPeriod.solarDate || 'ថ្ងៃទី...... ខែ...... ឆ្នាំ២០២៦'}
            </p>
            <p className="font-bold text-slate-900 uppercase">
              {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}
            </p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900">
              {language === 'km' ? activeClass?.teacherNameKm : activeClass?.teacherName}
            </p>
          </div>
        </div>

      </div>

      {/* Quick Score Edit Modal (Directly test and watch automatic re-ranking in real time) */}
      {quickScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-heading font-bold text-base text-slate-900">
                  {language === 'km' ? 'កែប្រែពិន្ទុ & គណនាចំណាត់ថ្នាក់' : 'Quick Score & Auto-Rank'}
                </h3>
              </div>
              <button
                onClick={() => setQuickScoreModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500">{language === 'km' ? 'សិស្ស៖' : 'Student:'}</p>
                <p className="font-bold text-slate-900 text-sm">{quickScoreModal.student.name} ({quickScoreModal.student.studentId})</p>
                <p className="text-xs text-indigo-700 font-bold mt-1">
                  {language === 'km' ? 'មុខវិជ្ជា៖ ' : 'Subject: '}
                  {language === 'km' ? quickScoreModal.subject.nameKm : quickScoreModal.subject.nameEn}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ពិន្ទុថ្មី (០ ដល់ ១០)៖' : 'New Score (0 to 10):'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={scoreInputValue}
                  onChange={(e) => setScoreInputValue(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-indigo-500 rounded-xl text-lg font-black text-slate-900 text-center focus:ring-2 focus:ring-indigo-300 outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                {language === 'km' ? '⚡ ចំណាត់ថ្នាក់ និងតារាងកិត្តិយសនឹងរៀបតាមលំដាប់ឡើងវិញភ្លាមៗ' : '⚡ Ranks and Honor Roll will automatically update immediately'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setQuickScoreModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveQuickScore}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center space-x-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'រក្សាទុក & គណនា' : 'Save & Re-rank'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Photo Modal */}
      <StudentPhotoModal
        student={photoModalStudent?.student || null}
        isOpen={Boolean(photoModalStudent)}
        onClose={() => setPhotoModalStudent(null)}
        rank={photoModalStudent?.rank}
      />

      {/* Telegram Share Modal */}
      {telegramStudent && (
        <TelegramShareModal
          student={telegramStudent}
          isOpen={!!telegramStudent}
          onClose={() => setTelegramStudent(null)}
        />
      )}

    </div>
  );
};
