import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  User, 
  Lock, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

export const AuthGateway: React.FC = () => {
  const { login, register, users } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<'teacher' | 'principal' | 'administrator'>('teacher');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginUsername, loginPassword);
      if (!res.success) {
        setError(res.message || 'ការចូលប្រើប្រាស់មិនជោគជ័យទេ។');
        setIsLoading(false);
      }
    }, 250);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regFullName.trim()) {
      setError('សូមបញ្ចូលឈ្មោះពេញ ឬគោត្តនាម-នាមរបស់អ្នក');
      return;
    }

    if (!regUsername.trim()) {
      setError('សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ ឬអ៊ីមែល');
      return;
    }

    if (regPassword.length < 4) {
      setError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៤ តួអក្សរ');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('ការផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = register({
        fullName: regFullName,
        username: regUsername,
        password: regPassword,
        role: regRole,
      });

      if (!res.success) {
        setError(res.message || 'ការចុះឈ្មោះមិនជោគជ័យទេ។');
        setIsLoading(false);
      }
      // If success, AuthProvider sets current user and onboarding modal opens automatically!
    }, 250);
  };

  const handleQuickDemo = (username: string) => {
    setError(null);
    login(username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden z-10 transition-all">
        
        {/* Header Branding */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-950/40 border-b border-slate-100 dark:border-slate-800/80">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-900 text-white shadow-lg mb-3 ring-4 ring-indigo-500/20">
            <SchoolLogo size={44} />
          </div>

          <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-900 dark:text-white uppercase">
            ប្រព័ន្ធគ្រប់គ្រងសាលារៀន & ពិន្ទុសិស្ស
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-400 mt-1">
            School & Primary Gradebook System
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            គាំទ្រគ្រប់សាលារៀន និងថ្នាក់រៀនទូទាំងប្រទេសកម្ពុជា
          </p>

          {/* Tab Switcher */}
          <div className="mt-6 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>ចូលប្រើប្រាស់ (Log In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ចុះឈ្មោះថ្មី (Register)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ឈ្មោះអ្នកប្រើប្រាស់ ឬអ៊ីមែល (Username / Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ teacher ឬអ៊ីមែល"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ពាក្យសម្ងាត់ (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider transition shadow-md hover:shadow-indigo-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
              >
                <span>{isLoading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ចូលប្រើប្រាស់ (Sign In)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Accounts Quick Pick */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  ឬចូលប្រើប្រាស់គណនីសាកល្បងរហ័ស (Quick Demo Accounts)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/30 hover:border-purple-500 hover:bg-purple-100/50 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-1 font-black text-xs text-purple-950 dark:text-purple-300 group-hover:text-purple-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Admin ប្រព័ន្ធ</span>
                    </div>
                    <div className="text-[10px] text-purple-700/80 dark:text-purple-400">
                      គ្រប់គ្រងគណនីទាំងអស់
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('teacher')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left transition cursor-pointer group"
                  >
                    <div className="font-black text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      សាលា ព្រែកជីក
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      លោកគ្រូ សុខា (ថ្នាក់ទី៦)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('principal')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left transition cursor-pointer group"
                  >
                    <div className="font-black text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      សាលា អនុវត្ត
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      អ្នកគ្រូ ចាន់ថន (នាយិកា)
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  គោត្តនាម និងនាម (Full Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ លោកគ្រូ ហេង វិចិត្រ"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ឈ្មោះសម្គាល់គណនី / អ៊ីមែល (Username / Email) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ teacher_vichet"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ពាក្យសម្ងាត់ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-8 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  តួនាទី (Role)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('teacher')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 text-center ${
                      regRole === 'teacher'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 mb-0.5 sm:mb-0" />
                    <span>គ្រូបន្ទុកថ្នាក់</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('principal')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 text-center ${
                      regRole === 'principal'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 mb-0.5 sm:mb-0" />
                    <span>នាយកសាលា</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('administrator')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 text-center ${
                      regRole === 'administrator'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mb-0.5 sm:mb-0" />
                    <span>អភិបាល</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex items-center space-x-1.5 font-bold mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>ជំហានបន្ទាប់៖</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  បន្ទាប់ពីចុះឈ្មោះរួច អ្នកនឹងអាចបញ្ចូលឈ្មោះសាលារៀន និងថ្នាក់រៀនរបស់អ្នកភ្លាមៗ!
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-black text-sm uppercase tracking-wider transition shadow-md hover:shadow-indigo-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{isLoading ? 'កំពុងបង្កើតគណនី...' : 'ចុះឈ្មោះ និងចាប់ផ្ដើម (Register & Start)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-400 flex items-center space-x-2">
        <span>ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សា</span>
        <span>•</span>
        <span>សុវត្ថិភាពទិន្នន័យ 100% ក្នុងឧបករណ៍របស់អ្នក</span>
      </div>
    </div>
  );
};
