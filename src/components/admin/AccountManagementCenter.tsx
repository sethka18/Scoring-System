import React, { useState, useMemo } from 'react';
import { useAuth, CreateUserDataByAdmin } from '../../context/AuthContext';
import { useGradebook } from '../../context/GradebookContext';
import { UserAccount } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  GraduationCap, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  KeyRound, 
  ExternalLink, 
  UserCheck, 
  X, 
  Check, 
  AlertCircle,
  Clock,
  MapPin,
  School,
  Lock,
  User,
  Shield,
  Filter
} from 'lucide-react';
import { CAMBODIAN_PROVINCES } from '../auth/SchoolClassOnboardingModal';

export const AccountManagementCenter: React.FC = () => {
  const { 
    users, 
    currentUser, 
    deleteUser, 
    updateUser, 
    createUserByAdmin, 
    resetUserPassword, 
    impersonateUser 
  } = useAuth();
  
  const { showToast } = useGradebook();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'principal' | 'administrator'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('password123');

  // Create form state
  const [createForm, setCreateForm] = useState<CreateUserDataByAdmin>({
    fullName: '',
    username: '',
    password: 'password123',
    role: 'teacher',
    schoolNameKm: '',
    schoolNameEn: '',
    province: 'រាជធានីភ្នំពេញ',
    district: '',
    classNameKm: 'ថ្នាក់ទី ៦(ក)',
    gradeLevel: 6,
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchRole;
      
      const matchQuery = 
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.schoolNameKm && u.schoolNameKm.toLowerCase().includes(q)) ||
        (u.province && u.province.toLowerCase().includes(q)) ||
        (u.district && u.district.toLowerCase().includes(q));

      return matchRole && matchQuery;
    });
  }, [users, roleFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalAccounts = users.length;
    const uniqueSchools = new Set(users.map(u => u.schoolNameKm).filter(Boolean)).size;
    const teachersCount = users.filter(u => u.role === 'teacher').length;
    const leadersCount = users.filter(u => u.role === 'principal' || u.role === 'administrator').length;

    return { totalAccounts, uniqueSchools, teachersCount, leadersCount };
  }, [users]);

  // Handle Create Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.username.trim() || !createForm.schoolNameKm.trim()) {
      showToast('សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់', 'warning');
      return;
    }

    const res = createUserByAdmin(createForm);
    if (res.success) {
      showToast(`បានបង្កើតគណនី "${createForm.fullName}" ដោយជោគជ័យ`, 'success');
      setIsCreateModalOpen(false);
      setCreateForm({
        fullName: '',
        username: '',
        password: 'password123',
        role: 'teacher',
        schoolNameKm: '',
        schoolNameEn: '',
        province: 'រាជធានីភ្នំពេញ',
        district: '',
        classNameKm: 'ថ្នាក់ទី ៦(ក)',
        gradeLevel: 6,
      });
    } else {
      showToast(res.message || 'មិនអាចបង្កើតគណនីបានទេ', 'error');
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const res = updateUser(editingUser.id, editingUser);
    if (res.success) {
      showToast('បានកែប្រែព័ត៌មានគណនីដោយជោគជ័យ', 'success');
      setEditingUser(null);
    } else {
      showToast(res.message || 'មិនអាចកែប្រែគណនីបានទេ', 'error');
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    if (res.success) {
      showToast(`បានលុបគណនី "${deletingUser.fullName}" ដោយជោគជ័យ`, 'success');
      setDeletingUser(null);
    } else {
      showToast(res.message || 'មិនអាចលុបគណនីបានទេ', 'error');
    }
  };

  // Handle Reset Password Confirm
  const handleResetPasswordConfirm = () => {
    if (!resettingUser) return;
    const res = resetUserPassword(resettingUser.id, newPasswordInput);
    if (res.success) {
      showToast(`បានកំណត់លេខសម្ងាត់ថ្មីសម្រាប់ "${resettingUser.fullName}" រួចរាល់`, 'success');
      setResettingUser(null);
      setNewPasswordInput('password123');
    } else {
      showToast(res.message || 'មិនអាចកំណត់លេខសម្ងាត់បានទេ', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-white">
                មជ្ឈមណ្ឌលគ្រប់គ្រងគណនីទាំងអស់
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                Admin Center
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              គ្រប់គ្រង ត្រួតពិនិត្យ និងកែប្រែគណនីគ្រូ និងសាលារៀនដែលបានចុះឈ្មោះក្នុងប្រព័ន្ធ
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតគណនីថ្មី (New Account)</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              គណនីសរុប
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalAccounts}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              សាលារៀនសរុប
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.uniqueSchools}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              គ្រូបន្ទុកថ្នាក់
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.teachersCount}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              នាយក & អភិបាល
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.leadersCount}
            </div>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ, Username, សាលា, ខេត្ត..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            តម្រង៖
          </span>
          {[
            { id: 'all', label: 'ទាំងអស់ (All)' },
            { id: 'teacher', label: 'គ្រូបន្ទុកថ្នាក់' },
            { id: 'principal', label: 'នាយកសាលា' },
            { id: 'administrator', label: 'អភិបាល' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-indigo-900 text-white dark:bg-indigo-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Accounts List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ព័ត៌មានគណនី (Account)</th>
                <th className="py-3 px-4">តួនាទី (Role)</th>
                <th className="py-3 px-4">សាលារៀន & ទីតាំង (School / Location)</th>
                <th className="py-3 px-4">ថ្នាក់រៀនដំបូង</th>
                <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-4 text-right">សកម្មភាព (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">រកមិនឃើញគណនីដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser?.id;
                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isCurrent ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-2xs ${
                            user.role === 'administrator' ? 'bg-purple-700' :
                            user.role === 'principal' ? 'bg-sky-700' :
                            'bg-indigo-900'
                          }`}>
                            {user.fullName.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{user.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black uppercase">
                                  កំពុងប្រើ (Current)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'administrator' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : user.role === 'principal'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {user.role === 'administrator' ? 'អភិបាលប្រព័ន្ធ' : user.role === 'principal' ? 'នាយកសាលា' : 'គ្រូបន្ទុកថ្នាក់'}
                        </span>
                      </td>

                      {/* School & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {user.schoolNameKm || 'មិនទាន់កំណត់'}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {user.district ? `${user.district}, ` : ''}{user.province || 'កម្ពុជា'}
                          </span>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {user.initialClassNameKm || (user.defaultGradeLevel ? `ថ្នាក់ទី ${user.defaultGradeLevel}` : '-')}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('km-KH') : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          
                          {/* Impersonate / View */}
                          {!isCurrent && (
                            <button
                              onClick={() => impersonateUser(user.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="ចូលមើលទិន្នន័យក្នុងនាមជាគណនីនេះ"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ចូលមើល</span>
                            </button>
                          )}

                          {/* Edit User */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="កែប្រែព័ត៌មានគណនី"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResettingUser(user);
                              setNewPasswordInput('password123');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="កំណត់ពាក្យសម្ងាត់ឡើងវិញ"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          {!isCurrent && (
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="លុបគណនី"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW ACCOUNT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-black text-slate-900 dark:text-white">
                    បង្កើតគណនីថ្មី
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    បញ្ចូលព័ត៌មានគណនីគ្រូ ឬនាយកសាលាថ្មី
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    គោត្តនាម-នាម <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="លោកគ្រូ កែវ សំណាង"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username / Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="teacher_samnang"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ពាក្យសម្ងាត់ដំបូង
                  </label>
                  <input
                    type="text"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    តួនាទី (Role)
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="teacher">គ្រូបន្ទុកថ្នាក់ (Teacher)</option>
                    <option value="principal">នាយកសាលា (Principal)</option>
                    <option value="administrator">អភិបាលប្រព័ន្ធ (Administrator)</option>
                  </select>
                </div>
              </div>

              {/* School Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះសាលារៀន (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.schoolNameKm}
                  onChange={(e) => setCreateForm({ ...createForm, schoolNameKm: e.target.value })}
                  placeholder="សាលាបឋមសិក្សា វត្តបូព៌"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Location: Province & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ខេត្ត / រាជធានី
                  </label>
                  <select
                    value={createForm.province}
                    onChange={(e) => setCreateForm({ ...createForm, province: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {CAMBODIAN_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ស្រុក / ក្រុង / ខណ្ឌ
                  </label>
                  <input
                    type="text"
                    value={createForm.district}
                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                    placeholder="ក្រុងសៀមរាប"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Initial Class & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះថ្នាក់រៀនដំបូង
                  </label>
                  <input
                    type="text"
                    value={createForm.classNameKm}
                    onChange={(e) => setCreateForm({ ...createForm, classNameKm: e.target.value })}
                    placeholder="ថ្នាក់ទី ៦(ក)"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    កម្រិតថ្នាក់ (Grade)
                  </label>
                  <select
                    value={createForm.gradeLevel}
                    onChange={(e) => setCreateForm({ ...createForm, gradeLevel: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs"
                >
                  រក្សាទុកគណនីថ្មី
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-black text-slate-900 dark:text-white">
                    កែប្រែព័ត៌មានគណនី
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    @{editingUser.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  គោត្តនាម-នាម (Full Name)
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    តួនាទី (Role)
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="teacher">គ្រូបន្ទុកថ្នាក់ (Teacher)</option>
                    <option value="principal">នាយកសាលា (Principal)</option>
                    <option value="administrator">អភិបាលប្រព័ន្ធ (Administrator)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះសាលារៀន (School Name)
                </label>
                <input
                  type="text"
                  value={editingUser.schoolNameKm || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, schoolNameKm: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ខេត្ត / រាជធានី
                  </label>
                  <select
                    value={editingUser.province || 'រាជធានីភ្នំពេញ'}
                    onChange={(e) => setEditingUser({ ...editingUser, province: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {CAMBODIAN_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ស្រុក / ក្រុង / ខណ្ឌ
                  </label>
                  <input
                    type="text"
                    value={editingUser.district || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, district: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs"
                >
                  រក្សាទុកការកែប្រែ
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-black text-slate-900 dark:text-white">
                  កំណត់ពាក្យសម្ងាត់ឡើងវិញ
                </h3>
                <p className="text-xs text-slate-400">
                  សម្រាប់គណនី <b>{resettingUser.fullName}</b> (@{resettingUser.username})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                បញ្ចូលពាក្យសម្ងាត់ថ្មី
              </label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="password123"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleResetPasswordConfirm}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs"
              >
                ប្តូរពាក្យសម្ងាត់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-black text-slate-900 dark:text-white">
                  តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ?
                </h3>
                <p className="text-xs text-slate-400">
                  សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <div className="font-black text-slate-900 dark:text-white">{deletingUser.fullName}</div>
              <div className="text-slate-400">Username: @{deletingUser.username}</div>
              <div className="text-slate-400">សាលា: {deletingUser.schoolNameKm || 'មិនទាន់កំណត់'}</div>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400">
              * រាល់ទិន្នន័យថ្នាក់រៀន និងពិន្ទុសិស្សទាំងអស់ដែលជាកម្មសិទ្ធិរបស់គណនីនេះនឹងត្រូវលុបចេញពីប្រព័ន្ធ។
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs"
              >
                យល់ព្រមលុបគណនី
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
