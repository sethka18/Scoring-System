import React, { useState } from 'react';
import { useAuth, formatPhoneNumber, isValidCambodianPhone } from '../../context/AuthContext';
import { UserAccount } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  KeyRound, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  BookOpen,
  Phone,
  Power,
  AtSign,
  Lock
} from 'lucide-react';

interface AdminUserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({ isOpen, onClose }) => {
  const { 
    users, 
    currentUser, 
    adminCreateUser, 
    adminUpdateUser, 
    adminDeleteUser, 
    adminResetPassword, 
    adminToggleStatus,
    adminSwitchToUser 
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [resetPassUser, setResetPassUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New user form state
  const [newPhone, setNewPhone] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'teacher'>('teacher');
  const [newPass, setNewPass] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.phoneNumber.includes(q) ||
      (u.schoolName && u.schoolName.toLowerCase().includes(q)) ||
      (u.className && u.className.toLowerCase().includes(q))
    );
  });

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCambodianPhone(newPhone)) {
      alert('លេខទូរស័ព្ទមិនត្រឹមត្រូវតាមទម្រង់កម្ពុជា');
      return;
    }
    const res = adminCreateUser({
      phoneNumber: newPhone,
      username: newUsername.trim() || undefined,
      fullName: newName,
      schoolName: newSchool,
      className: newClass,
      role: newRole,
      password: newPass || '123456',
    });

    if (res.success) {
      showToast('បានបង្កើតគណនីថ្មីដោយជោគជ័យ');
      setIsAddModalOpen(false);
      setNewPhone('');
      setNewUsername('');
      setNewName('');
      setNewSchool('');
      setNewClass('');
      setNewPass('');
    } else {
      alert(res.message || 'បរាជ័យក្នុងការបង្កើត');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updates: Partial<UserAccount> = {
      fullName: editingUser.fullName,
      schoolName: editingUser.schoolName,
      className: editingUser.className,
      phoneNumber: editingUser.phoneNumber,
      username: editingUser.username?.trim() || undefined,
      role: editingUser.role,
    };
    if (editPassword.trim()) {
      if (editPassword.trim().length < 4) {
        alert('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៤ តួអក្សរ');
        return;
      }
      updates.password = editPassword.trim();
    }
    adminUpdateUser(editingUser.id, updates);
    showToast('បានកែប្រែព័ត៌មានគណនីរួចរាល់');
    setEditingUser(null);
    setEditPassword('');
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser || !newPassword.trim()) return;
    adminResetPassword(resetPassUser.id, newPassword);
    showToast('បានប្ដូរពាក្យសម្ងាត់ដោយជោគជ័យ');
    setResetPassUser(null);
    setNewPassword('');
  };

  const handleDelete = (u: UserAccount) => {
    if (confirm(`តើអ្នកពិតជាចង់លុបគណនី "${u.fullName}" (${u.phoneNumber}) មែនទេ?`)) {
      const res = adminDeleteUser(u.id);
      if (res.success) {
        showToast('បានលុបគណនីរួចរាល់');
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                ផ្ទាំងគ្រប់គ្រងគណនី (Admin Management Hub)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                គ្រប់គ្រង ពិនិត្យ និងកែប្រែគណនីគ្រូបង្រៀន និងអ្នកប្រើប្រាស់ទាំងអស់
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">គណនីសរុប</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{users.length}</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">គ្រូបង្រៀន</span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {users.filter(u => u.role === 'teacher').length}
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">អ្នកគ្រប់គ្រង (Admin)</span>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">គណនីសកម្ម</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {users.filter(u => u.isActive).length}
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតគណនីថ្មី</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center">
            {toastMessage}
          </div>
        )}

        {/* Table of Users */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[11px] text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-3">ឈ្មោះ & តួនាទី</th>
                  <th className="py-2.5 px-3">លេខទូរស័ព្ទ</th>
                  <th className="py-2.5 px-3">សាលារៀន</th>
                  <th className="py-2.5 px-3">ថ្នាក់រៀន</th>
                  <th className="py-2.5 px-3 text-center">ស្ថានភាព</th>
                  <th className="py-2.5 px-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{u.fullName}</span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-black">
                              កំពុងប្រើ
                            </span>
                          )}
                        </div>
                        <span className={`inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}>
                          {u.role === 'admin' ? '🛡️ Admin' : '👨‍🏫 គ្រូបង្រៀន'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <div>{formatPhoneNumber(u.phoneNumber)}</div>
                        {u.username && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-sans font-bold flex items-center space-x-0.5 mt-0.5">
                            <span className="opacity-60">@</span>
                            <span>{u.username}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {u.schoolName || '-'}
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">
                        {u.className || '-'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => adminToggleStatus(u.id)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                          title="ចុចដើម្បីបើក/បិទ ដំណើរការ"
                        >
                          <Power className="w-2.5 h-2.5 mr-1" />
                          <span>{u.isActive ? 'សកម្ម' : 'ផ្អាក'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Switch to view account */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => {
                                adminSwitchToUser(u.id);
                                onClose();
                              }}
                              className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                              title="ចូលមើលទិន្នន័យថ្នាក់នេះ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit user info */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="កែប្រែព័ត៌មាន"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset password */}
                          <button
                            onClick={() => {
                              setResetPassUser(u);
                              setNewPassword('');
                            }}
                            className="p-1 rounded-md text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition cursor-pointer"
                            title="ប្ដូរពាក្យសម្ងាត់"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete user */}
                          {u.username !== 'admin' && !isCurrent && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                              title="លុបគណនី"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>

      </div>

      {/* MODAL: ADD USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase mb-3">
              បង្កើតគណនីថ្មី (Add User Account)
            </h3>
            <form onSubmit={handleCreateNewUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  លេខទូរស័ព្ទ (Phone Number) *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="012 345 678"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះគណនី (Username)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="ឧ. sethka (ស្រេចចិត្ត)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះពេញលោកគ្រូ-អ្នកគ្រូ *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ឈ្មោះគ្រូ"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះសាលារៀន *
                </label>
                <input
                  type="text"
                  required
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  placeholder="សាលាបឋមសិក្សា..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះថ្នាក់រៀន *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="ថ្នាក់ទី ៤(ក)"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    តួនាទី (Role)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
                    <option value="admin">អ្នកគ្រប់គ្រង (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ពាក្យសម្ងាត់ដំបូង
                </label>
                <input
                  type="text"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="123456 (បើទុកទំនេរ)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold shadow-xs"
                >
                  បង្កើតគណនី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase mb-3">
              កែប្រែព័ត៌មានគណនី
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះពេញ
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  លេខទូរស័ព្ទ
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.phoneNumber}
                  onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះគណនី (Username)
                </label>
                <input
                  type="text"
                  value={editingUser.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="ឧ. username"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ពាក្យសម្ងាត់ថ្មី (ទុកទំនេរបើមិនចង់ប្តូរ)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៤ ខ្ទង់)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះសាលារៀន
                </label>
                <input
                  type="text"
                  value={editingUser.schoolName}
                  onChange={(e) => setEditingUser({ ...editingUser, schoolName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះថ្នាក់រៀន
                  </label>
                  <input
                    type="text"
                    value={editingUser.className}
                    onChange={(e) => setEditingUser({ ...editingUser, className: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    តួនាទី
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
                    <option value="admin">អ្នកគ្រប់គ្រង (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold shadow-xs"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetPassUser && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase mb-1">
              ប្ដូរពាក្យសម្ងាត់
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              សម្រាប់គណនី៖ <strong>{resetPassUser.fullName}</strong> ({resetPassUser.phoneNumber})
            </p>
            <form onSubmit={handleSaveResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៤ ខ្ទង់)
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                >
                  ប្ដូរពាក្យសម្ងាត់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
