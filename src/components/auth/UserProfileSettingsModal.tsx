import React, { useState } from 'react';
import { useAuth, isValidCambodianPhone, formatPhoneNumber, cleanPhoneNumber } from '../../context/AuthContext';
import { 
  User, 
  Phone, 
  Lock, 
  AtSign, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  X, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface UserProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileSettingsModal: React.FC<UserProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [schoolName, setSchoolName] = useState(currentUser?.schoolName || '');
  const [className, setClassName] = useState(currentUser?.className || '');
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset fields when opening with user data
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setUsername(currentUser.username || '');
      setSchoolName(currentUser.schoolName || '');
      setClassName(currentUser.className || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate phone number
    const rawPhone = cleanPhoneNumber(phoneNumber);
    if (!isValidCambodianPhone(rawPhone)) {
      setError('លេខទូរស័ព្ទមិនត្រឹមត្រូវតាមទម្រង់ប្រទេសកម្ពុជាទេ (ឧ. 012 345 678 ឬ 097 123 4567)');
      return;
    }

    // Validate username if provided
    if (username.trim()) {
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(cleanUsername)) {
        setError('ឈ្មោះគណនី (Username) ត្រូវមានពី ៣ ដល់ ២០ តួអក្សរ (អក្សរឡាតាំង លេខ ឬ _ . -) ដោយគ្មានដកឃ្លា');
        return;
      }
    }

    // Validate password change if attempted
    if (newPassword.trim()) {
      if (!currentPassword.trim()) {
        setError('សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្នដើម្បីផ្ទៀងផ្ទាត់ការប្តូរពាក្យសម្ងាត់');
        return;
      }
      if (newPassword.trim().length < 4) {
        setError('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៤ តួអក្សរ');
        return;
      }
      if (newPassword.trim() !== confirmPassword.trim()) {
        setError('ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់ពាក្យសម្ងាត់មិនដូចគ្នាទេ');
        return;
      }
    }

    setIsSaving(true);

    const result = updateUserProfile({
      fullName: fullName.trim(),
      phoneNumber: rawPhone,
      username: username.trim(),
      schoolName: schoolName.trim(),
      className: className.trim(),
      currentPassword: currentPassword.trim() || undefined,
      newPassword: newPassword.trim() || undefined,
    });

    setIsSaving(false);

    if (result.success) {
      setSuccess('បានកែប្រែព័ត៌មានគណនី និងរក្សាទុកដោយជោគជ័យ!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setError(result.message || 'មិនអាចធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនីបានទេ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                ព័ត៌មានគណនីផ្ទាល់ខ្លួន (My Profile)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ផ្លាស់ប្តូរឈ្មោះ លេខទូរស័ព្ទ ឈ្មោះគណនី (Username) និងពាក្យសម្ងាត់
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start space-x-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Account Role Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                តួនាទីគណនី:
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
              {currentUser.role === 'admin' ? 'អ្នកគ្រប់គ្រង (Admin)' : 'លោកគ្រូ-អ្នកគ្រូ (Teacher)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ឈ្មោះពេញលោកគ្រូ-អ្នកគ្រូ (Full Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ឧ. ឈន សុផល"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                លេខទូរស័ព្ទ (Phone Number) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="012 345 678"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                ប្រើប្រាស់សម្រាប់ចូលប្រើប្រព័ន្ធ (Login)
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ឈ្មោះគណនី (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ឧ. sethka_teacher"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                អាចប្រើឈ្មោះនេះជំនួសលេខទូរស័ព្ទពេលចូលប្រើប្រព័ន្ធ
              </p>
            </div>

            {/* School Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                សាលារៀន (School Name)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="សាលាបឋមសិក្សា..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Class Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ថ្នាក់រៀនបន្ទុក (Class Section)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="ឧ. ថ្នាក់ទី ៤(ក)"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                ប្ដូរពាក្យសម្ងាត់ (Change Password)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ទុកចន្លោះនេះទំនេរ ប្រសិនបើលោកគ្រូ-អ្នកគ្រូមិនចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់ទេ។
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Current Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ពាក្យសម្ងាត់ចាស់
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ចាស់"
                    className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ពាក្យសម្ងាត់ថ្មី
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="យ៉ាងតិច ៤ ខ្ទង់"
                    className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="វាយពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black transition cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
