import React, { useState } from 'react';
import { useAuth, OnboardingSchoolData } from '../../context/AuthContext';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Building2, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  UserCheck, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  School,
  CheckCircle2
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

export const CAMBODIAN_PROVINCES = [
  'រាជធានីភ្នំពេញ',
  'ខេត្តត្បូងឃ្មុំ',
  'ខេត្តកំពង់ចាម',
  'ខេត្តបាត់ដំបង',
  'ខេត្តសៀមរាប',
  'ខេត្តកណ្តាល',
  'ខេត្តកំពង់ធំ',
  'ខេត្តកំពង់ឆ្នាំង',
  'ខេត្តកំពង់ស្ពឺ',
  'ខេត្តតាកែវ',
  'ខេត្តព្រៃវែង',
  'ខេត្តស្វាយរៀង',
  'ខេត្តបន្ទាយមានជ័យ',
  'ខេត្តពោធិ៍សាត់',
  'ខេត្តកំពត',
  'ខេត្តកែប',
  'ខេត្តព្រះសីហនុ',
  'ខេត្តកោះកុង',
  'ខេត្តក្រចេះ',
  'ខេត្តស្ទឹងត្រែង',
  'ខេត្តរតនគិរី',
  'ខេត្តមណ្ឌលគិរី',
  'ខេត្តព្រះវិហារ',
  'ខេត្តឧត្តរមានជ័យ',
  'ខេត្តប៉ៃលិន',
];

export const SchoolClassOnboardingModal: React.FC = () => {
  const { currentUser, completeOnboarding } = useAuth();
  const { 
    updateSchoolProfile, 
    addClass, 
    setActiveClassId, 
    addStudentsBatch, 
    showToast,
    language 
  } = useGradebook();

  const [schoolNameKm, setSchoolNameKm] = useState('');
  const [schoolNameEn, setSchoolNameEn] = useState('');
  const [province, setProvince] = useState('ខេត្តត្បូងឃ្មុំ');
  const [district, setDistrict] = useState('');
  const [classNameKm, setClassNameKm] = useState('ថ្នាក់ទី ៦(ក)');
  const [classNameEn, setClassNameEn] = useState('Grade 6A');
  const [gradeLevel, setGradeLevel] = useState<number>(6);
  const [academicYear, setAcademicYear] = useState('២០២៥-២០២៦');
  const [teacherName, setTeacherName] = useState(currentUser?.fullName || '');
  const [seedSampleStudents, setSeedSampleStudents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser || currentUser.hasCompletedOnboarding) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!schoolNameKm.trim()) {
      setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះសាលារៀនជាភាសាខ្មែរ' : 'Please enter the school name');
      return;
    }

    if (!classNameKm.trim()) {
      setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះថ្នាក់រៀនដំបូង' : 'Please enter the initial class name');
      return;
    }

    setIsSubmitting(true);

    try {
      const newClassId = `class_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // 1. Create onboarding payload
      const onboardingData: OnboardingSchoolData = {
        schoolNameKm: schoolNameKm.trim(),
        schoolNameEn: schoolNameEn.trim() || undefined,
        province,
        district: district.trim(),
        classNameKm: classNameKm.trim(),
        gradeLevel,
        academicYear,
        teacherName: teacherName.trim() || currentUser.fullName,
        seedSampleStudents,
      };

      // 2. Complete Auth Context onboarding
      completeOnboarding(onboardingData);

      // 3. Update School Profile in Gradebook
      updateSchoolProfile({
        schoolNameKm: schoolNameKm.trim(),
        schoolName: schoolNameEn.trim() || schoolNameKm.trim(),
        province,
        district: district.trim(),
        academicYear,
        principalName: currentUser.role === 'principal' ? currentUser.fullName : undefined,
      });

      // 4. Create new Class Section
      const newClass = {
        id: newClassId,
        name: classNameEn.trim() || classNameKm.trim(),
        nameKm: classNameKm.trim(),
        gradeLevel,
        academicYear,
        teacherName: teacherName.trim() || currentUser.fullName,
        teacherNameKm: teacherName.trim() || currentUser.fullName,
        schoolName: schoolNameEn.trim() || schoolNameKm.trim(),
        schoolNameKm: schoolNameKm.trim(),
        studentIds: [] as string[],
        roomNumber: '01',
      };

      addClass(newClass);
      setActiveClassId(newClassId);

      // 5. Seed sample students if requested so teacher has ready-to-test data
      if (seedSampleStudents) {
        const sampleStudents = [
          {
            name: 'ចាន់ សុខណា',
            gender: 'Female' as const,
            dob: '2014-03-15',
            guardianName: 'ចាន់ សុខ',
            guardianPhone: '012 345 678',
            attendanceCount: { present: 100, absentExcused: 0, absentUnexcused: 0, late: 0 },
            conductRating: 'ល្អប្រសើរ',
            behaviorScore: 5,
          },
          {
            name: 'រ៉េត វិរៈដែន',
            gender: 'Male' as const,
            dob: '2014-05-20',
            guardianName: 'រ៉េត វណ្ណា',
            guardianPhone: '097 123 456',
            attendanceCount: { present: 98, absentExcused: 1, absentUnexcused: 0, late: 1 },
            conductRating: 'ល្អប្រសើរ',
            behaviorScore: 5,
          },
          {
            name: 'គឹម លុយលុយ',
            gender: 'Female' as const,
            dob: '2014-08-10',
            guardianName: 'គឹម ហេង',
            guardianPhone: '088 987 654',
            attendanceCount: { present: 95, absentExcused: 2, absentUnexcused: 0, late: 0 },
            conductRating: 'ល្អ',
            behaviorScore: 4,
          },
          {
            name: 'សឿន ពិសិដ្ឋ',
            gender: 'Male' as const,
            dob: '2014-11-02',
            guardianName: 'សឿន ចន្ថា',
            guardianPhone: '070 456 789',
            attendanceCount: { present: 92, absentExcused: 1, absentUnexcused: 1, late: 2 },
            conductRating: 'ល្អ',
            behaviorScore: 4,
          },
          {
            name: 'ណាត ចាន់ណា',
            gender: 'Female' as const,
            dob: '2014-02-28',
            guardianName: 'ណាត វិសាល',
            guardianPhone: '085 222 333',
            attendanceCount: { present: 97, absentExcused: 1, absentUnexcused: 0, late: 0 },
            conductRating: 'ល្អប្រសើរ',
            behaviorScore: 5,
          }
        ];

        addStudentsBatch(sampleStudents, newClassId);
      }

      showToast(
        language === 'km' 
          ? `សូមស្វាគមន៍! ការរៀបចំ ${schoolNameKm} (${classNameKm}) ត្រូវបានបញ្ចប់ដោយជោគជ័យ` 
          : `Welcome! Setup for ${schoolNameKm} (${classNameKm}) completed successfully`,
        'success'
      );
    } catch (err) {
      console.error(err);
      setError('មានបញ្ហាក្នុងការរក្សាទុក។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <School className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-amber-950">
                <Sparkles className="w-3 h-3" />
                <span>ជំហានដំបូង (Initial Setup)</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-heading mt-1">
                រៀបចំសាលារៀន និងថ្នាក់រៀនរបស់អ្នក
              </h2>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            សូមស្វាគមន៍ <strong>{currentUser.fullName}</strong>! សូមបំពេញឈ្មោះសាលារៀន និងថ្នាក់រៀនរបស់អ្នក ដើម្បីឱ្យប្រព័ន្ធរៀបចំទិន្នន័យស្របតាមសាលាផ្ទាល់ខ្លួនរបស់អ្នក។
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Section 1: School Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-black text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>ព័ត៌មានសាលារៀន (School Information)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះសាលារៀន (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={schoolNameKm}
                  onChange={(e) => setSchoolNameKm(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ សាលាបឋមសិក្សា វត្តបូព៌"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ខេត្ត / រាជធានី <span className="text-rose-500">*</span>
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium cursor-pointer"
                >
                  {CAMBODIAN_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ស្រុក / ក្រុង / ខណ្ឌ
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ ស្រុកក្រូចឆ្មារ"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Class Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-black text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>ព័ត៌មានថ្នាក់រៀនដំបូង (Initial Class Information)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះថ្នាក់ (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={classNameKm}
                  onChange={(e) => setClassNameKm(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ ថ្នាក់ទី ៦(ក)"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  កម្រិតថ្នាក់ (Grade) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => {
                    const lvl = Number(e.target.value);
                    setGradeLevel(lvl);
                    if (!classNameKm || classNameKm.startsWith('ថ្នាក់ទី')) {
                      setClassNameKm(`ថ្នាក់ទី ${lvl}(ក)`);
                      setClassNameEn(`Grade ${lvl}A`);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium cursor-pointer"
                >
                  <option value={1}>ថ្នាក់ទី ១ (Grade 1)</option>
                  <option value={2}>ថ្នាក់ទី ២ (Grade 2)</option>
                  <option value={3}>ថ្នាក់ទី ៣ (Grade 3)</option>
                  <option value={4}>ថ្នាក់ទី ៤ (Grade 4)</option>
                  <option value={5}>ថ្នាក់ទី ៥ (Grade 5)</option>
                  <option value={6}>ថ្នាក់ទី ៦ (Grade 6)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឆ្នាំសិក្សា (Academic Year)
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="២០២៥-២០២៦"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះគ្រូបន្ទុកថ្នាក់ (Teacher Name)
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="ឈ្មោះលោកគ្រូ ឬអ្នកគ្រូ"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Seed Students Option */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={seedSampleStudents}
                onChange={(e) => setSeedSampleStudents(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-indigo-950 dark:text-indigo-200">
                  បញ្ចូលសិស្សគំរូសាកល្បង ៥ នាក់ដំបូង
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  ជួយឱ្យអ្នកអាចសាកល្បងបញ្ចូលពិន្ទុ ស្រង់វត្តមាន និងមើលតារាងចំណាត់ថ្នាក់បានភ្លាមៗ (អ្នកអាចកែប្រែ ឬលុបចេញវិញបានគ្រប់ពេល)។
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'កំពុងរៀបចំ...' : 'រក្សាទុក និងចូលប្រើប្រាស់ (Complete & Enter System)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
