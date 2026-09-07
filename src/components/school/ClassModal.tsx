import React, { useState, useEffect } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { ClassSection, Student } from '../../types';
import { 
  X, 
  Check, 
  School, 
  Trash2, 
  AlertTriangle, 
  UserCheck, 
  Sparkles,
  Building,
  GraduationCap
} from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: ClassSection | null;
  onSuccess?: (classId: string) => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  initialClass,
  onSuccess,
}) => {
  const {
    language,
    classes,
    addClass,
    updateClass,
    deleteClass,
    addStudent,
    schoolProfile,
    showToast,
    setActiveClassId,
  } = useGradebook();

  const isEditing = Boolean(initialClass);

  // Form State
  const [gradeLevel, setGradeLevel] = useState<number>(6);
  const [nameKm, setNameKm] = useState('');
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [teacherNameKm, setTeacherNameKm] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [schoolNameKm, setSchoolNameKm] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [autoSeedStudents, setAutoSeedStudents] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset or Populate form on open/change
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      return;
    }

    if (initialClass) {
      // Edit mode
      setGradeLevel(initialClass.gradeLevel || 6);
      setNameKm(initialClass.nameKm || '');
      setName(initialClass.name || '');
      setAcademicYear(initialClass.academicYear || schoolProfile.academicYear || '២០២៥-២០២៦');
      setRoomNumber(initialClass.roomNumber || '');
      setTeacherNameKm(initialClass.teacherNameKm || '');
      setTeacherName(initialClass.teacherName || '');
      setSchoolNameKm(initialClass.schoolNameKm || schoolProfile.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង');
      setSchoolName(initialClass.schoolName || schoolProfile.schoolName || 'Hun Neng Pratong Primary School');
      setAutoSeedStudents(false);
    } else {
      // Create mode: calculate smart suggestion based on existing classes
      const defaultGrade = 6;
      const existingInGrade = classes.filter(c => c.gradeLevel === defaultGrade);
      const suffixLetterEn = String.fromCharCode(65 + existingInGrade.length); // A, B, C...
      const khmerLetters = ['ក', 'ខ', 'គ', 'ឃ', 'ង', 'ច'];
      const suffixLetterKm = khmerLetters[existingInGrade.length] || 'ក';

      setGradeLevel(defaultGrade);
      setNameKm(`ថ្នាក់ទី${defaultGrade}(${suffixLetterKm})`);
      setName(`Grade ${defaultGrade}${suffixLetterEn}`);
      setAcademicYear(schoolProfile.academicYear || '២០២៥-២០២៦');
      setRoomNumber(`Room 0${defaultGrade} (អគារ A)`);
      setTeacherNameKm('លោកគ្រូ សុខ សម្ភស្ស');
      setTeacherName('Mr. Sok Samphors');
      setSchoolNameKm(schoolProfile.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង');
      setSchoolName(schoolProfile.schoolName || 'Hun Neng Pratong Primary School');
      setAutoSeedStudents(true);
    }
    setShowDeleteConfirm(false);
  }, [isOpen, initialClass, schoolProfile, classes]);

  if (!isOpen) return null;

  // Change grade level in create mode to auto-suggest
  const handleGradeLevelSelect = (g: number) => {
    setGradeLevel(g);
    if (!isEditing) {
      const existingInGrade = classes.filter(c => c.gradeLevel === g);
      const suffixLetterEn = String.fromCharCode(65 + existingInGrade.length);
      const khmerLetters = ['ក', 'ខ', 'គ', 'ឃ', 'ង', 'ច'];
      const suffixLetterKm = khmerLetters[existingInGrade.length] || 'ក';

      setNameKm(`ថ្នាក់ទី${g}(${suffixLetterKm})`);
      setName(`Grade ${g}${suffixLetterEn}`);
      setRoomNumber(`Room 0${g} (អគារ A)`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNameKm = nameKm.trim();
    const trimmedName = name.trim();

    if (!trimmedNameKm || !trimmedName) {
      showToast(
        language === 'km' ? 'សូមបំពេញឈ្មោះថ្នាក់រៀនជាភាសាខ្មែរ និងអក្សរឡាតាំង' : 'Please fill in both Khmer and English class names',
        'warning'
      );
      return;
    }

    if (isEditing && initialClass) {
      updateClass(initialClass.id, {
        gradeLevel,
        nameKm: trimmedNameKm,
        name: trimmedName,
        academicYear: academicYear.trim() || '២០២៥-២០២៦',
        roomNumber: roomNumber.trim() || 'Room 1',
        teacherNameKm: teacherNameKm.trim() || 'លោកគ្រូ/អ្នកគ្រូ',
        teacherName: teacherName.trim() || 'Teacher',
        schoolNameKm: schoolNameKm.trim() || schoolProfile.schoolNameKm,
        schoolName: schoolName.trim() || schoolProfile.schoolName,
      });

      showToast(
        language === 'km' ? `បានកែប្រែព័ត៌មានថ្នាក់ ${trimmedNameKm} ដោយជោគជ័យ!` : `Class ${trimmedName} updated successfully!`,
        'success'
      );
      if (onSuccess) onSuccess(initialClass.id);
      onClose();
    } else {
      // Create new class
      const newClassId = `class_${Date.now()}`;
      const newStudentIds: string[] = [];

      // Auto-generate 5 sample students if requested
      if (autoSeedStudents) {
        const sampleSeedNames = [
          { km: 'សុខ គន្ធា', en: 'Sok Kunthea', g: 'Female' as const },
          { km: 'ចាន់ សុខា', en: 'Chan Sokha', g: 'Male' as const },
          { km: 'មាស ផល្លា', en: 'Meas Phalla', g: 'Female' as const },
          { km: 'ហេង ដារិទ្ធ', en: 'Heng Darith', g: 'Male' as const },
          { km: 'ប៉ែន ស្រីពៅ', en: 'Pen Sreypov', g: 'Female' as const },
        ];

        sampleSeedNames.forEach((item, idx) => {
          const sId = `stu_${Date.now()}_${idx}`;
          const newStu: Student = {
            id: sId,
            studentId: `STU-0${gradeLevel}-${idx + 1 < 10 ? '0' : ''}${idx + 1}`,
            name: item.km,
            nameLatin: item.en,
            gender: item.g,
            dob: `201${10 - gradeLevel}-06-15`,
            guardianName: `${item.km.split(' ')[0]} វណ្ណា`,
            guardianPhone: '012 889 900',
            attendanceCount: { present: 98, absentExcused: 1, absentUnexcused: 0, late: 1 },
            behaviorScore: 5,
            conductRating: 'ល្អ',
            skillScore: 9.0,
            attitudeScore: 9.0,
            notes: 'សិស្សទើបបង្កើតថ្មី',
          };
          addStudent(newStu, newClassId);
          newStudentIds.push(sId);
        });
      }

      addClass({
        id: newClassId,
        gradeLevel,
        nameKm: trimmedNameKm,
        name: trimmedName,
        academicYear: academicYear.trim() || schoolProfile.academicYear || '២០២៥-២០២៦',
        roomNumber: roomNumber.trim() || `Room 0${gradeLevel}`,
        teacherNameKm: teacherNameKm.trim() || 'លោកគ្រូ/អ្នកគ្រូ',
        teacherName: teacherName.trim() || 'Teacher',
        schoolNameKm: schoolNameKm.trim() || schoolProfile.schoolNameKm,
        schoolName: schoolName.trim() || schoolProfile.schoolName,
        district: schoolProfile.district,
        commune: schoolProfile.commune,
        province: schoolProfile.province,
        logoUrl: schoolProfile.logoUrl,
        studentIds: newStudentIds,
      });

      setActiveClassId(newClassId);

      showToast(
        language === 'km' ? `បានបង្កើតថ្នាក់ ${trimmedNameKm} ដោយជោគជ័យ!` : `Class ${trimmedName} created successfully!`,
        'success'
      );
      if (onSuccess) onSuccess(newClassId);
      onClose();
    }
  };

  const handleDelete = () => {
    if (!initialClass) return;
    if (classes.length <= 1) {
      showToast(
        language === 'km' ? 'មិនអាចលុបថ្នាក់ចុងក្រោយក្នុងប្រព័ន្ធបានទេ' : 'Cannot delete the only class in system',
        'warning'
      );
      return;
    }

    deleteClass(initialClass.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white leading-tight">
                {isEditing 
                  ? (language === 'km' ? 'កែប្រែព័ត៌មានថ្នាក់រៀន' : 'Edit Class Section')
                  : (language === 'km' ? 'បង្កើតថ្នាក់រៀនថ្មី' : 'Create New Class Section')}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                {isEditing
                  ? (language === 'km' ? `កែប្រែទិន្នន័យសម្រាប់ ${initialClass?.nameKm || initialClass?.name}` : `Updating details for ${initialClass?.name}`)
                  : (language === 'km' ? 'បំពេញព័ត៌មានដើម្បីបង្កើតថ្នាក់រៀនថ្មី' : 'Fill details to add a new class')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 flex-1 text-xs sm:text-sm pr-1">
          
          {/* Grade Level Selection Buttons */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {language === 'km' ? 'កម្រិតថ្នាក់ (Grade 1 to 6)' : 'Grade Level'} *
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => handleGradeLevelSelect(g)}
                  className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center ${
                    gradeLevel === g
                      ? 'bg-indigo-900 dark:bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                  <span>{language === 'km' ? `ទី${g}` : `G${g}`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Class Names (Khmer & English) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឈ្មោះថ្នាក់ (ភាសាខ្មែរ)' : 'Class Name (Khmer)'} *
              </label>
              <input
                type="text"
                required
                value={nameKm}
                onChange={(e) => setNameKm(e.target.value)}
                placeholder="ឧ. ថ្នាក់ទី៦(ក)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឈ្មោះថ្នាក់ (អក្សរឡាតាំង / Code)' : 'Class Name (Latin)'} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grade 6A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Academic Year & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'ឆ្នាំសិក្សា' : 'Academic Year'}
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="២០២៥-២០២៦"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'បន្ទប់រៀន / អគារ' : 'Room / Building'}
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Room 12 (អគារ B)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Teacher Names (Khmer & English) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់ (ភាសាខ្មែរ)' : 'Homeroom Teacher (Khmer)'}
              </label>
              <input
                type="text"
                value={teacherNameKm}
                onChange={(e) => setTeacherNameKm(e.target.value)}
                placeholder="លោកគ្រូ សុខ សម្ភស្ស"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'គ្រូបន្ទុកថ្នាក់ (អក្សរឡាតាំង)' : 'Homeroom Teacher (Latin)'}
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Mr. Sok Samphors"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* School Name */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              {language === 'km' ? 'ឈ្មោះសាលារៀន (ភាសាខ្មែរ)' : 'School Name (Khmer)'}
            </label>
            <input
              type="text"
              value={schoolNameKm}
              onChange={(e) => setSchoolNameKm(e.target.value)}
              placeholder="សាលាបឋមសិក្សាហ៊ុនណេងប្រទង"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            />
          </div>

          {/* Auto-seed Sample Students for New Class */}
          {!isEditing && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 flex items-start space-x-3">
              <input
                type="checkbox"
                id="autoSeedModal"
                checked={autoSeedStudents}
                onChange={(e) => setAutoSeedStudents(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer mt-0.5"
              />
              <label htmlFor="autoSeedModal" className="text-xs text-indigo-950 dark:text-indigo-200 font-bold cursor-pointer select-none">
                <span className="block font-black text-indigo-900 dark:text-indigo-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{language === 'km' ? 'បង្កើតសិស្សគំរូចំនួន ៥ នាក់ក្នុងថ្នាក់នេះ' : 'Generate 5 sample students'}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {language === 'km' 
                    ? 'បង្កើតបញ្ជីសិស្សគំរូស្រាប់ ដើម្បីងាយស្រួលសាកល្បងបញ្ចូលពិន្ទុ និងបោះពុម្ព' 
                    : 'Creates starter roster with sample scores to easily test features'}
                </span>
              </label>
            </div>
          )}

          {/* Delete Danger Section (Only in Edit Mode & if more than 1 class) */}
          {isEditing && classes.length > 1 && (
            <div className="pt-2">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center space-x-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 text-xs font-bold transition cursor-pointer p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'លុបថ្នាក់រៀននេះ...' : 'Delete this class section...'}</span>
                </button>
              ) : (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{language === 'km' ? 'តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបថ្នាក់នេះមែនទេ?' : 'Confirm delete this class?'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition cursor-pointer"
                    >
                      {language === 'km' ? 'យល់ព្រមលុប' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                    >
                      {language === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-900/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                {isEditing 
                  ? (language === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes') 
                  : (language === 'km' ? 'បង្កើតថ្នាក់រៀន' : 'Create Class')}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
