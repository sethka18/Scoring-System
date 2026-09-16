import React, { useState } from 'react';
import { useAuth, isValidCambodianPhone, formatPhoneNumber } from '../../context/AuthContext';
import { 
  Lock, 
  Phone, 
  User, 
  Building2, 
  BookOpen, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register form state
  const [regPhone, setRegPhone] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regSchoolName, setRegSchoolName] = useState('');
  const [regClassName, setRegClassName] = useState('');
  const [regGradeLevel, setRegGradeLevel] = useState('៤');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

  const isRegPhoneValid = regPhone.length > 0 && isValidCambodianPhone(regPhone);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const result = login(loginPhone, loginPassword);
    if (!result.success) {
      setLoginError(result.message || 'ការចូលមិនបានជោគជ័យ');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!isRegPhoneValid) {
      setRegError('សូមបញ្ចូលលេខទូរស័ព្ទឱ្យបានត្រឹមត្រូវតាមទម្រង់កម្ពុជា (ឧ. 012 345 678 ឬ 097 123 4567)');
      return;
    }

    if (!regFullName.trim()) {
      setRegError('សូមបញ្ចូលឈ្មោះលោកគ្រូ-អ្នកគ្រូ');
      return;
    }

    if (!regSchoolName.trim()) {
      setRegError('សូមបញ្ចូលឈ្មោះសាលារៀនរបស់អ្នក');
      return;
    }

    if (!regClassName.trim()) {
      setRegError('សូមបញ្ចូលឈ្មោះថ្នាក់រៀន (ឧទាហរណ៍៖ ថ្នាក់ទី ៤(គ))');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៤ ខ្ទង់');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ');
      return;
    }

    setIsLoading(true);
    const res = register({
      phoneNumber: regPhone,
      password: regPassword,
      fullName: regFullName,
      schoolName: regSchoolName,
      className: regClassName,
      gradeLevel: regGradeLevel,
    });

    if (!res.success) {
      setRegError(res.message || 'ការចុះឈ្មោះមិនបានជោគជ័យ');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo and App Title */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-3">
          <SchoolLogo size={48} />
        </div>
        
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-heading">
          ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងការវាយតម្លៃសិស្ស
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          បឋមសិក្សា • សៀវភៅតាមដានពិន្ទុ និងវត្តមានប្រចាំថ្នាក់
        </p>

        {/* Mode Toggle (Minimalist Segmented Control) */}
        <div className="mt-6 inline-flex p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl w-full max-w-xs border border-slate-300/60 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { setActiveMode('login'); setLoginError(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeMode === 'login'
                ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ចូលប្រើប្រាស់ (Log In)
          </button>
          <button
            type="button"
            onClick={() => { setActiveMode('register'); setRegError(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeMode === 'register'
                ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ចុះឈ្មោះ (Sign Up)
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-6 sm:py-8 px-5 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          
          {/* LOGIN VIEW */}
          {activeMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  ឈ្មោះគណនី ឬ លេខទូរស័ព្ទ (Username or Phone)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="sethka ឬ 012 345 678"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  ពាក្យសម្ងាត់ (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់..."
                    className="block w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-black text-white bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>{isLoading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ចូលប្រើប្រាស់'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER VIEW */}
          {activeMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Phone Number with Validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    លេខទូរស័ព្ទ (Phone Number) *
                  </label>
                  {regPhone.length > 0 && (
                    <span className={`text-[10px] font-bold inline-flex items-center space-x-0.5 ${
                      isRegPhoneValid ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {isRegPhoneValid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>លេខត្រឹមត្រូវ</span>
                        </>
                      ) : (
                        <span>យ៉ាងតិច ៩-១០ ខ្ទង់</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="012 345 678 ឬ 097 123 4567"
                    className={`block w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:white placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition ${
                      regPhone.length > 0
                        ? isRegPhoneValid
                          ? 'border-emerald-400 focus:ring-emerald-500'
                          : 'border-amber-400 focus:ring-amber-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-600'
                    }`}
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  ឈ្មោះលោកគ្រូ-អ្នកគ្រូ (Teacher's Full Name) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ សុខ សុភា"
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>

              {/* School Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  ឈ្មោះសាលារៀន (School Name) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regSchoolName}
                    onChange={(e) => setRegSchoolName(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ សាលាបឋមសិក្សាព្រែកជីក"
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>

              {/* Class Name and Grade Level */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    ឈ្មោះថ្នាក់រៀន (Class) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regClassName}
                      onChange={(e) => setRegClassName(e.target.value)}
                      placeholder="ថ្នាក់ទី ៤(គ)"
                      className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    កម្រិត (Grade)
                  </label>
                  <select
                    value={regGradeLevel}
                    onChange={(e) => setRegGradeLevel(e.target.value)}
                    className="block w-full py-2 px-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
                  >
                    <option value="១">ទី ១</option>
                    <option value="២">ទី ២</option>
                    <option value="៣">ទី ៣</option>
                    <option value="៤">ទី ៤</option>
                    <option value="៥">ទី ៥</option>
                    <option value="៦">ទី ៦</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    ពាក្យសម្ងាត់ *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="យ៉ាងតិច ៤ ខ្ទង់"
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    បញ្ជាក់ពាក្យសម្ងាត់ *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="ដូចគ្នា"
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  {showRegPassword ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isRegPhoneValid}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-black text-white bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition cursor-pointer shadow-xs disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'កំពុងបង្កើតគណនី...' : 'ចុះឈ្មោះ និងចាប់ផ្តើម'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Minimalist Note */}
        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          ទិន្នន័យត្រូវបានរក្សាទុកដាច់ដោយឡែកតាមគណនី និងមានសុវត្ថិភាពខ្ពស់
        </p>
      </div>
    </div>
  );
};
