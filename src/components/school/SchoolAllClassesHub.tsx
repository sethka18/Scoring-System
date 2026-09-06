import React, { useState, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { ClassSection, Student } from '../../types';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Award, 
  Plus, 
  Search, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Layers, 
  Crown, 
  ChevronRight, 
  UserCheck, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  BarChart3, 
  Camera, 
  School,
  X,
  Check,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
  ArrowUpRight,
  Copy
} from 'lucide-react';
import { calculatePeriodRankings } from '../../utils/calculations';
import { StudentPhotoModal } from '../common/StudentPhotoModal';
import { SchoolLogo } from '../common/SchoolLogo';
import { PrintToPdfButton } from '../common/PrintToPdfButton';
import { SchoolProfileSettingsModal } from './SchoolProfileSettingsModal';

export const SchoolAllClassesHub: React.FC = () => {
  const { 
    classes, 
    activeClass, 
    setActiveClassId, 
    students, 
    scoresMatrix, 
    activePeriodId, 
    periods, 
    subjects,
    weights,
    competencyWeights,
    language, 
    schoolProfile,
    duplicateClass,
    createClass, 
    updateClass, 
    deleteClass, 
    addStudent,
    setActiveTab, 
    showToast 
  } = useGradebook();

  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'classes' | 'school_top5' | 'analytics'>('classes');
  
  // Modals
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isSchoolProfileModalOpen, setIsSchoolProfileModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [photoModalStudent, setPhotoModalStudent] = useState<{ student: Student; rank: number } | null>(null);

  // Form State for Add / Edit Class
  const [formGradeLevel, setFormGradeLevel] = useState<number>(6);
  const [formClassName, setFormClassName] = useState('');
  const [formClassNameKm, setFormClassNameKm] = useState('');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formTeacherNameKm, setFormTeacherNameKm] = useState('');
  const [autoSeedStudents, setAutoSeedStudents] = useState(true);

  // Current active period object
  const currentPeriod = periods.find(p => p.id === activePeriodId) || periods[0];

  // Calculate statistics across the entire school
  const schoolStats = useMemo(() => {
    const totalClasses = classes.length;
    const totalStudents = students.length;
    const totalBoys = students.filter(s => s.gender === 'Male').length;
    const totalGirls = students.filter(s => s.gender === 'Female').length;
    
    // Average GPA across all classes
    let totalScoreSum = 0;
    let totalScoreCount = 0;

    const classMetrics = classes.map(cls => {
      const classStudents = students.filter(s => cls.studentIds?.includes(s.id));
      const boys = classStudents.filter(s => s.gender === 'Male').length;
      const girls = classStudents.filter(s => s.gender === 'Female').length;
      
      const rankings = calculatePeriodRankings(classStudents, activePeriodId, subjects, scoresMatrix, weights, competencyWeights);
      const avgGPA = rankings.length > 0
        ? Number((rankings.reduce((sum, r) => sum + r.average, 0) / rankings.length).toFixed(2))
        : 0;

      if (avgGPA > 0) {
        totalScoreSum += avgGPA;
        totalScoreCount++;
      }

      const top5Students = rankings.slice(0, 5);

      return {
        classSection: cls,
        studentsCount: classStudents.length,
        boysCount: boys,
        girlsCount: girls,
        avgGPA,
        rankings,
        top5Students,
      };
    });

    const schoolAverageGPA = totalScoreCount > 0 
      ? Number((totalScoreSum / totalScoreCount).toFixed(2)) 
      : 0;

    // Find best performing star class
    const starClass = [...classMetrics].sort((a, b) => b.avgGPA - a.avgGPA)[0];

    return {
      totalClasses,
      totalStudents,
      totalBoys,
      totalGirls,
      schoolAverageGPA,
      starClass,
      classMetrics,
    };
  }, [classes, students, scoresMatrix, activePeriodId]);

  // Filtered classes
  const filteredClassMetrics = useMemo(() => {
    return schoolStats.classMetrics.filter(({ classSection }) => {
      const matchGrade = selectedGradeFilter === 'all' || classSection.gradeLevel === selectedGradeFilter;
      const matchSearch = 
        classSection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classSection.nameKm.includes(searchQuery) ||
        classSection.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classSection.teacherNameKm.includes(searchQuery) ||
        classSection.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchGrade && matchSearch;
    });
  }, [schoolStats.classMetrics, selectedGradeFilter, searchQuery]);

  // Overall Top Scholars across the whole school
  const allSchoolTopScholars = useMemo(() => {
    const list: Array<{
      student: Student;
      classSection: ClassSection;
      averageScore: number;
      rankInClass: number;
      gradeLetter: string;
      distinctionKm: string;
      distinctionEn: string;
    }> = [];

    schoolStats.classMetrics.forEach(cm => {
      cm.rankings.forEach(r => {
        const student = students.find(s => s.id === r.studentId);
        if (student) {
          list.push({
            student,
            classSection: cm.classSection,
            averageScore: r.averageScore,
            rankInClass: r.rank,
            gradeLetter: r.gradeLetter,
            distinctionKm: r.distinctionKm,
            distinctionEn: r.distinctionEn,
          });
        }
      });
    });

    return list.sort((a, b) => b.averageScore - a.averageScore).slice(0, 10);
  }, [schoolStats.classMetrics, students]);

  // Helper to open Add modal
  const handleOpenAddModal = () => {
    setEditingClass(null);
    setFormGradeLevel(6);
    setFormClassName('Grade 6C');
    setFormClassNameKm('ថ្នាក់ទី៦(គ)');
    setFormRoomNumber('Room 14 (អគារ A)');
    setFormTeacherName('Mr. Chea Samat');
    setFormTeacherNameKm('លោកគ្រូ ជា សាម៉ាត');
    setAutoSeedStudents(true);
    setIsAddClassModalOpen(true);
  };

  // Helper to open Edit modal
  const handleOpenEditModal = (cls: ClassSection) => {
    setEditingClass(cls);
    setFormGradeLevel(cls.gradeLevel);
    setFormClassName(cls.name);
    setFormClassNameKm(cls.nameKm);
    setFormRoomNumber(cls.roomNumber);
    setFormTeacherName(cls.teacherName);
    setFormTeacherNameKm(cls.teacherNameKm);
    setAutoSeedStudents(false);
    setIsAddClassModalOpen(true);
  };

  // Handle Save / Update Class
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassName.trim() || !formClassNameKm.trim()) {
      showToast(language === 'km' ? 'សូមបញ្ចូលឈ្មោះថ្នាក់រៀន' : 'Please enter class name', 'warning');
      return;
    }

    if (editingClass) {
      updateClass(editingClass.id, {
        name: formClassName,
        nameKm: formClassNameKm,
        gradeLevel: formGradeLevel,
        roomNumber: formRoomNumber,
        teacherName: formTeacherName,
        teacherNameKm: formTeacherNameKm,
      });
      showToast(
        language === 'km' 
          ? `បានកែប្រែថ្នាក់ ${formClassNameKm} ដោយជោគជ័យ!` 
          : `Class ${formClassName} updated successfully!`,
        'success'
      );
    } else {
      const newClassId = `class_${Date.now()}`;
      const newStudentIds: string[] = [];

      // If auto-seed students is checked, generate 5 sample students for this new class
      if (autoSeedStudents) {
        const sampleNames = [
          { km: 'ឡេង វីរៈ', en: 'Leng Virak', g: 'Male' as const },
          { km: 'ប៉ែន ស្រីពៅ', en: 'Pen Sreypov', g: 'Female' as const },
          { km: 'សូត្រ សម្បត្តិ', en: 'Sotr Sambath', g: 'Male' as const },
          { km: 'ខៀវ កុសល', en: 'Khiev Kosal', g: 'Female' as const },
          { km: 'ហេង ដារិទ្ធ', en: 'Heng Darith', g: 'Male' as const },
        ];

        sampleNames.forEach((sn, idx) => {
          const stuId = `stu_new_${Date.now()}_${idx}`;
          const newStudent: Student = {
            id: stuId,
            studentId: `STU-0${formGradeLevel}-${idx + 1 < 10 ? '0' : ''}${idx + 1}`,
            name: sn.km,
            nameLatin: sn.en,
            gender: sn.g,
            dob: `201${10 - formGradeLevel}-05-15`,
            guardianName: `${sn.km.split(' ')[0]} វណ្ណា`,
            guardianPhone: '012 345 678',
            attendanceCount: { present: 96, absentExcused: 2, absentUnexcused: 0, late: 1 },
            behaviorScore: 5,
            conductRating: 'ល្អ',
            skillScore: 9.0,
            attitudeScore: 9.2,
            notes: 'សិស្សថ្មីទើបបង្កើត'
          };
          addStudent(newStudent);
          newStudentIds.push(stuId);
        });
      }

      createClass({
        id: newClassId,
        name: formClassName,
        nameKm: formClassNameKm,
        gradeLevel: formGradeLevel,
        academicYear: schoolProfile?.academicYear || activeClass?.academicYear || '២០២៥-២០២៦',
        roomNumber: formRoomNumber,
        teacherName: formTeacherName,
        teacherNameKm: formTeacherNameKm,
        schoolName: schoolProfile?.schoolName || 'Hun Neng Pratong Primary School',
        schoolNameKm: schoolProfile?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង',
        district: schoolProfile?.district || 'ស្រុកព្រៃឈរ',
        commune: schoolProfile?.commune || 'ឃុំព្រៃឈរ',
        province: schoolProfile?.province || 'ខេត្តកំពង់ចាម',
        logoUrl: schoolProfile?.logoUrl || '',
        studentIds: newStudentIds,
      });

      showToast(
        language === 'km' 
          ? `បានបង្កើតថ្នាក់ ${formClassNameKm} ដោយជោគជ័យ!` 
          : `Class ${formClassName} created successfully!`,
        'success'
      );
    }

    setIsAddClassModalOpen(false);
  };

  // Jump directly to specific class and tab
  const handleSelectClassAndTab = (classId: string, tab: 'scoring' | 'rankings' | 'report_card' | 'roster' | 'dashboard') => {
    setActiveClassId(classId);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* 1. School Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <School className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsSchoolProfileModalOpen(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1.5 shadow-lg shrink-0 flex items-center justify-center border border-white/20 hover:scale-105 transition cursor-pointer"
              title={language === 'km' ? 'ចុចដើម្បីប្តូរព័ត៌មានសាលារៀន & ឡូហ្គូ' : 'Click to edit school profile & logo'}
            >
              <SchoolLogo size={56} customLogoUrl={schoolProfile?.logoUrl} />
            </button>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ក្រសួងអប់រំ យុវជន និងកីឡា • ប្រព័ន្ធគ្រប់គ្រងសាលារៀន' : 'MoEYS Cambodia • School Management System'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {schoolProfile?.schoolNameKm || activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង'}
              </h1>
              <p className="text-sm text-slate-300 font-medium">
                {schoolProfile?.district || 'ស្រុកព្រៃឈរ'} • {schoolProfile?.commune || 'ឃុំព្រៃឈរ'} • {schoolProfile?.province || 'ខេត្តកំពង់ចាម'} • {language === 'km' ? 'ឆ្នាំសិក្សា៖' : 'Academic Year:'} {schoolProfile?.academicYear || activeClass?.academicYear || '២០២៥-២០២៦'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsSchoolProfileModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/20 shadow-md transition cursor-pointer"
            >
              <School className="w-4 h-4 text-amber-300" />
              <span>{language === 'km' ? 'កំណត់ព័ត៌មានសាលា & ឡូហ្គូ' : 'School Profile & Logo'}</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-lg shadow-amber-950/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'km' ? '+ បង្កើតថ្នាក់ថ្មី' : '+ Add New Class'}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('rankings');
              }}
              className="inline-flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-white font-black text-xs border border-indigo-400/30 shadow-md transition cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{language === 'km' ? 'តារាងកិត្តិយស Top 5' : 'Honor Hall Top 5'}</span>
            </button>
            <PrintToPdfButton
              pageSize="a4"
              variant="outline"
              size="md"
              labelKm="បោះពុម្ព A4 / PDF"
              labelEn="Print A4 / PDF"
            />
          </div>
        </div>

        {/* School Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>{language === 'km' ? 'ថ្នាក់រៀនសរុប' : 'Total Classes'}</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {schoolStats.totalClasses} <span className="text-xs font-medium text-slate-400">{language === 'km' ? 'ថ្នាក់' : 'classes'}</span>
            </div>
            <div className="text-[11px] text-indigo-300 mt-0.5">
              {language === 'km' ? 'ថ្នាក់ទី ១ ដល់ ទី ៦' : 'Grades 1 to 6'}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>{language === 'km' ? 'សិស្សទូទាំងសាលា' : 'Total Enrollment'}</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {schoolStats.totalStudents} <span className="text-xs font-medium text-slate-400">{language === 'km' ? 'នាក់' : 'students'}</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 flex items-center space-x-2">
              <span>👦 {schoolStats.totalBoys}</span>
              <span>•</span>
              <span>👧 {schoolStats.totalGirls}</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>{language === 'km' ? 'ពិន្ទុមធ្យមសាលា' : 'School Average GPA'}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">
              {schoolStats.schoolAverageGPA} <span className="text-xs font-medium text-slate-400">/ 10</span>
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-0.5">
              {currentPeriod.nameKm}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>{language === 'km' ? 'ថ្នាក់ឆ្នើមប្រចាំខែ' : 'Star Class'}</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-amber-300 truncate">
              {schoolStats.starClass?.classSection.nameKm || 'ថ្នាក់ទី៦(ក)'}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {language === 'km' ? 'មធ្យមភាគ៖' : 'Avg:'} {schoolStats.starClass?.avgGPA || 0} / 10
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Mode Tabs & Grade Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 font-black text-xs">
            <button
              onClick={() => setViewMode('classes')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'classes' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បញ្ជីថ្នាក់រៀនទាំងអស់' : 'All Classes'} ({schoolStats.totalClasses})</span>
            </button>
            <button
              onClick={() => setViewMode('school_top5')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'school_top5' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'km' ? 'សិស្សឆ្នើម Top 5 ទូទាំងសាលា' : 'School Top 5 Showcase'}</span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'analytics' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'km' ? 'ស្ថិតិប្រៀបធៀបតាមកម្រិត' : 'Grade Analytics'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'km' ? 'ស្វែងរកថ្នាក់ ឬគ្រូបន្ទុក...' : 'Search class or teacher...'}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Grade Level Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-black">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider shrink-0 mr-1">
            {language === 'km' ? 'កម្រិតថ្នាក់៖' : 'Grade Level:'}
          </span>
          <button
            onClick={() => setSelectedGradeFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              selectedGradeFilter === 'all' 
                ? 'bg-indigo-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'km' ? 'ទាំងអស់' : 'All Grades'} ({schoolStats.totalClasses})
          </button>
          {[1, 2, 3, 4, 5, 6].map((grade) => {
            const countInGrade = classes.filter(c => c.gradeLevel === grade).length;
            return (
              <button
                key={grade}
                onClick={() => setSelectedGradeFilter(grade)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  selectedGradeFilter === grade 
                    ? 'bg-indigo-900 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'km' ? `ថ្នាក់ទី${grade}` : `Grade ${grade}`} ({countInGrade})
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. VIEW MODE 1: ALL CLASSES CARDS GRID */}
      {viewMode === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-900" />
              <span>{language === 'km' ? 'បញ្ជីថ្នាក់រៀនសកម្មក្នុងសាលា' : 'Active Classes in School'}</span>
              <span className="text-xs bg-indigo-100 text-indigo-900 font-black px-2.5 py-0.5 rounded-full">
                {filteredClassMetrics.length} {language === 'km' ? 'ថ្នាក់' : 'classes'}
              </span>
            </h2>
            <div className="text-xs text-slate-500">
              {language === 'km' ? 'ពិន្ទុសម្រាប់៖' : 'Viewing scores for:'} <strong className="text-indigo-950">{currentPeriod.nameKm}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredClassMetrics.map(({ classSection, studentsCount, boysCount, girlsCount, avgGPA, top5Students }) => {
              const isActive = activeClass?.id === classSection.id;

              return (
                <div
                  key={classSection.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isActive 
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-lg' 
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-900 text-white font-black text-xs shadow-xs">
                            {classSection.nameKm}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {classSection.name}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{language === 'km' ? 'កំពុងជ្រើស' : 'Active'}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{classSection.roomNumber}</span>
                        </div>
                      </div>

                      {/* Class GPA Badge */}
                      <div className="text-right">
                        <div className="text-lg font-black text-indigo-950">
                          {avgGPA > 0 ? avgGPA : '0.00'}
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-400">
                          {language === 'km' ? 'មធ្យមភាគ GPA' : 'Class GPA'}
                        </div>
                      </div>
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {classSection.teacherNameKm.charAt(classSection.teacherNameKm.lastIndexOf(' ') + 1) || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {classSection.teacherNameKm}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {classSection.teacherName} • {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-bold text-slate-800">{studentsCount}</span>
                        <span className="text-[10px] text-slate-400 block">{language === 'km' ? 'សិស្ស' : 'students'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top 3 Achievers Mini Showcase */}
                  <div className="p-4 bg-slate-50/70 border-b border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                      <span className="flex items-center space-x-1">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>{language === 'km' ? 'សិស្សឆ្នើម Top 3 ក្នុងថ្នាក់' : 'Top 3 Achievers'}</span>
                      </span>
                      <button
                        onClick={() => handleSelectClassAndTab(classSection.id, 'rankings')}
                        className="text-indigo-700 hover:text-indigo-900 text-[11px] font-black cursor-pointer flex items-center space-x-0.5"
                      >
                        <span>Top 5</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((idx) => {
                        const topR = top5Students[idx];
                        const stu = topR ? students.find(s => s.id === topR.studentId) : null;
                        const rankMedals = ['🥇', '🥈', '🥉'];
                        
                        return (
                          <div 
                            key={idx}
                            className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center text-center relative group"
                          >
                            <span className="absolute -top-1.5 -left-1 text-xs">
                              {rankMedals[idx]}
                            </span>
                            
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 my-1 flex items-center justify-center">
                              {stu?.photoUrl ? (
                                <img src={stu.photoUrl} alt={stu.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-black text-slate-400">
                                  {stu ? stu.name.charAt(0) : '-'}
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] font-black text-slate-900 truncate w-full">
                              {stu ? stu.name : `សិស្ស #${idx + 1}`}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700">
                              {topR ? `${topR.averageScore} ពិន្ទុ` : '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-4 bg-white space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSelectClassAndTab(classSection.id, 'scoring')}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{language === 'km' ? 'បញ្ចូលពិន្ទុ' : 'Enter Scores'}</span>
                      </button>

                      <button
                        onClick={() => handleSelectClassAndTab(classSection.id, 'rankings')}
                        className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'km' ? 'តារាង Top 5' : 'Honor Top 5'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <button
                          onClick={() => handleOpenEditModal(classSection)}
                          title={language === 'km' ? 'កែប្រែថ្នាក់' : 'Edit Class'}
                          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const newKm = prompt(
                              language === 'km' ? 'បញ្ចូលឈ្មោះថ្នាក់ថ្មី (ខ្មែរ)៖' : 'New class name (Khmer):',
                              `${classSection.nameKm} (ខ)`
                            );
                            if (!newKm) return;
                            const newEn = prompt(
                              language === 'km' ? 'បញ្ចូលឈ្មោះថ្នាក់ (English)៖' : 'New class name (English):',
                              `${classSection.name} B`
                            ) || newKm;
                            const copyStus = window.confirm(
                              language === 'km' 
                                ? 'តើអ្នកចង់ចម្លងបញ្ជីឈ្មោះសិស្សចូលក្នុងថ្នាក់ថ្មីនេះដែរឬទេ?' 
                                : 'Do you want to copy the student roster?'
                            );
                            duplicateClass(classSection.id, newKm, newEn, copyStus);
                          }}
                          title={language === 'km' ? 'ចម្លងថ្នាក់រៀន' : 'Duplicate Class'}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {classes.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'km' ? `តើអ្នកពិតជាចង់លុបថ្នាក់ ${classSection.nameKm} មែនទេ?` : `Are you sure you want to delete ${classSection.name}?`)) {
                                deleteClass(classSection.id);
                              }
                            }}
                            title={language === 'km' ? 'លុបថ្នាក់' : 'Delete Class'}
                            className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelectClassAndTab(classSection.id, 'dashboard')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs transition shadow-xs cursor-pointer"
                      >
                        <span>{language === 'km' ? 'ចូលផ្ទាំងថ្នាក់នេះ' : 'Open Class'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VIEW MODE 2: SCHOOL-WIDE TOP 5 & TOP SCHOLARS SHOWCASE */}
      {viewMode === 'school_top5' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-amber-50 to-indigo-50 p-5 rounded-2xl border border-amber-200">
            <div>
              <h2 className="font-heading font-black text-xl text-amber-950 flex items-center space-x-2">
                <Crown className="w-6 h-6 text-amber-600" />
                <span>{language === 'km' ? 'តារាងកិត្តិយសសិស្សឆ្នើមទូទាំងសាលា (Top 5 គ្រប់ថ្នាក់)' : 'School-Wide Top 5 Honor Showcase'}</span>
              </h2>
              <p className="text-xs text-amber-900 mt-1">
                {language === 'km' 
                  ? 'បង្ហាញសិស្សឆ្នើម Top 5 នៃថ្នាក់រៀននីមួយៗទូទាំងសាលាបឋមសិក្សា ជាមួយជម្រើសបញ្ចូលរូបថត' 
                  : 'Displaying top 5 scholars across each class in the school with photo insert options.'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('rankings')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'km' ? 'បើកផ្ទាំង Honor Hall ធំ' : 'Open Full Honor Hall'}</span>
            </button>
          </div>

          {/* Grouped by Each Class Section */}
          <div className="space-y-6">
            {schoolStats.classMetrics.map(({ classSection, top5Students }) => (
              <div key={classSection.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header for this class's Top 5 */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs">
                      {classSection.nameKm}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-sm text-white">
                        {classSection.name} • {classSection.teacherNameKm} ({language === 'km' ? 'គ្រូបន្ទុក' : 'Teacher'})
                      </h3>
                      <span className="text-[11px] text-slate-300">
                        {classSection.roomNumber} • {top5Students.length} {language === 'km' ? 'សិស្សឆ្នើម' : 'top scholars'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectClassAndTab(classSection.id, 'rankings')}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-black transition cursor-pointer"
                  >
                    <span>{language === 'km' ? 'បោះពុម្ពតារាង Top 5 ថ្នាក់នេះ' : 'Print Class Board'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Top 5 Cards Row for This Class */}
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 bg-slate-50/40">
                  {top5Students.map((ranking) => {
                    const student = students.find(s => s.id === ranking.studentId);
                    if (!student) return null;

                    const rank = ranking.rank;
                    const isChampion = rank === 1;

                    return (
                      <div
                        key={ranking.studentId}
                        className={`bg-white rounded-2xl p-4 border transition flex flex-col items-center text-center relative ${
                          rank === 1 ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md bg-gradient-to-b from-amber-50/30 to-white' :
                          rank === 2 ? 'border-slate-300 ring-1 ring-slate-300/30 shadow-xs' :
                          rank === 3 ? 'border-amber-600/50 shadow-xs' :
                          'border-slate-200'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`absolute -top-2.5 px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs ${
                          rank === 1 ? 'bg-amber-400 text-amber-950' :
                          rank === 2 ? 'bg-slate-200 text-slate-900' :
                          rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-indigo-900 text-white'
                        }`}>
                          {rank === 1 ? '🥇 #1 ជើងឯក' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `🎖️ #${rank}`}
                        </div>

                        {/* Student Photo Frame with 1-click update */}
                        <div className="relative mt-2 mb-2.5 group">
                          <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-xs flex items-center justify-center bg-slate-100 ${
                            rank === 1 ? 'border-amber-400' : 'border-slate-300'
                          }`}>
                            {student.photoUrl ? (
                              <img 
                                src={student.photoUrl} 
                                alt={student.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            ) : (
                              <div className="text-center p-1">
                                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                              </div>
                            )}
                          </div>

                          {/* Quick Insert Photo Button */}
                          <button
                            onClick={() => setPhotoModalStudent({ student, rank })}
                            title={language === 'km' ? 'បញ្ចូល / ប្តូររូបថត' : 'Insert / Change Photo'}
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-900 hover:bg-indigo-950 text-white flex items-center justify-center shadow-md transition cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Student Details */}
                        <div className="font-heading font-black text-sm text-slate-900 truncate w-full">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate w-full">
                          {student.nameLatin || student.studentId}
                        </div>

                        {/* Scores & Distinction */}
                        <div className="mt-2 pt-2 border-t border-slate-100 w-full flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-950">
                            {ranking.averageScore} <span className="text-[10px] font-medium text-slate-400">/ 10</span>
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                            ranking.gradeLetter === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            ranking.gradeLetter === 'B' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {language === 'km' ? ranking.distinctionKm : ranking.distinctionEn}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. VIEW MODE 3: SCHOOL-WIDE COMPARATIVE ANALYTICS */}
      {viewMode === 'analytics' && (
        <div className="space-y-5 animate-in fade-in">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-heading font-black text-lg text-slate-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>{language === 'km' ? 'តារាងប្រៀបធៀបលទ្ធផលសិក្សាតាមកម្រិតថ្នាក់ (១ ដល់ ៦)' : 'Grade-by-Grade Performance Comparison'}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[11px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{language === 'km' ? 'កម្រិតថ្នាក់' : 'Grade Level'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'ចំនួនបន្ទប់' : 'Classes'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'សិស្សសរុប' : 'Total Students'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'ប្រុស / ស្រី' : 'Boys / Girls'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'មធ្យមភាគ GPA' : 'Average GPA'}</th>
                    <th className="py-3 px-4">{language === 'km' ? 'សិស្សជើងឯក' : 'Top Scholar'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[1, 2, 3, 4, 5, 6].map((grade) => {
                    const gradeClasses = schoolStats.classMetrics.filter(cm => cm.classSection.gradeLevel === grade);
                    const gradeStudentsCount = gradeClasses.reduce((sum, c) => sum + c.studentsCount, 0);
                    const gradeBoysCount = gradeClasses.reduce((sum, c) => sum + c.boysCount, 0);
                    const gradeGirlsCount = gradeClasses.reduce((sum, c) => sum + c.girlsCount, 0);
                    
                    const gradeAvg = gradeClasses.length > 0 
                      ? Number((gradeClasses.reduce((sum, c) => sum + c.avgGPA, 0) / gradeClasses.length).toFixed(2))
                      : 0;

                    const allTopInGrade = gradeClasses.flatMap(c => c.top5Students).sort((a, b) => b.averageScore - a.averageScore);
                    const topStudentInGrade = allTopInGrade[0] ? students.find(s => s.id === allTopInGrade[0].studentId) : null;

                    return (
                      <tr key={grade} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900 flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold">
                            {grade}
                          </span>
                          <span>{language === 'km' ? `ថ្នាក់ទី ${grade}` : `Grade ${grade}`}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {gradeClasses.map(c => c.classSection.nameKm).join(', ') || '-'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {gradeStudentsCount} {language === 'km' ? 'នាក់' : 'students'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          👦 {gradeBoysCount} • 👧 {gradeGirlsCount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-indigo-950 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {gradeAvg} / 10
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {topStudentInGrade ? (
                            <div className="flex items-center space-x-2">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span className="font-black text-slate-900">{topStudentInGrade.name}</span>
                              <span className="text-[10px] text-amber-800 font-bold">({allTopInGrade[0].averageScore} ពិន្ទុ)</span>
                            </div>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 6. MODAL: ADD / EDIT CLASS */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">
                    {editingClass 
                      ? (language === 'km' ? 'កែសម្រួលព័ត៌មានថ្នាក់' : 'Edit Class Section')
                      : (language === 'km' ? 'បង្កើតថ្នាក់រៀនថ្មី' : 'Create New Class Section')}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'km' ? 'កំណត់កម្រិតថ្នាក់ បន្ទប់ និងគ្រូបន្ទុក' : 'Set grade level, room, and teacher details'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddClassModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-6 overflow-y-auto space-y-4">
              
              {/* Grade Level */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {language === 'km' ? 'កម្រិតថ្នាក់ (Grade Level)' : 'Grade Level (1 to 6)'}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => {
                        setFormGradeLevel(g);
                        if (!editingClass) {
                          setFormClassName(`Grade ${g}A`);
                          setFormClassNameKm(`ថ្នាក់ទី${g}(ក)`);
                          setFormRoomNumber(`Room 0${g} (អគារ B)`);
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        formGradeLevel === g 
                          ? 'bg-indigo-900 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {language === 'km' ? `ទី${g}` : `G${g}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ឈ្មោះថ្នាក់ (ភាសាខ្មែរ)' : 'Class Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formClassNameKm}
                    onChange={(e) => setFormClassNameKm(e.target.value)}
                    placeholder="ថ្នាក់ទី៦(ក)"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ឈ្មោះថ្នាក់ (អក្សរឡាតាំង)' : 'Class Name (Latin)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    placeholder="Grade 6A"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Teacher Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ឈ្មោះគ្រូបន្ទុក (ភាសាខ្មែរ)' : 'Homeroom Teacher (Khmer)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeacherNameKm}
                    onChange={(e) => setFormTeacherNameKm(e.target.value)}
                    placeholder="លោកគ្រូ សុខ សម្ភស្ស"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ឈ្មោះគ្រូបន្ទុក (អក្សរឡាតាំង)' : 'Homeroom Teacher (Latin)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    placeholder="Mr. Sok Samphors"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'លេខបន្ទប់រៀន / អគារ' : 'Room Number / Building'}
                </label>
                <input
                  type="text"
                  value={formRoomNumber}
                  onChange={(e) => setFormRoomNumber(e.target.value)}
                  placeholder="Room 12 (អគារ A)"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Auto-seed sample students (for new class only) */}
              {!editingClass && (
                <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200/60 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoSeed"
                    checked={autoSeedStudents}
                    onChange={(e) => setAutoSeedStudents(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="autoSeed" className="text-xs text-indigo-950 font-bold cursor-pointer">
                    {language === 'km' 
                      ? 'បង្កើតសិស្សគំរូ ៥ នាក់ដោយស្វ័យប្រវត្តិក្នុងថ្នាក់នេះ' 
                      : 'Auto-generate 5 sample students for this class'}
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-black transition cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{editingClass ? (language === 'km' ? 'រក្សាទុក' : 'Save Changes') : (language === 'km' ? 'បង្កើតថ្នាក់' : 'Create Class')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 7. STUDENT PHOTO MODAL */}
      <StudentPhotoModal
        student={photoModalStudent?.student || null}
        isOpen={Boolean(photoModalStudent)}
        onClose={() => setPhotoModalStudent(null)}
        rank={photoModalStudent?.rank}
      />

      {/* 8. SCHOOL PROFILE SETTINGS MODAL */}
      <SchoolProfileSettingsModal
        isOpen={isSchoolProfileModalOpen}
        onClose={() => setIsSchoolProfileModalOpen(false)}
      />

    </div>
  );
};
