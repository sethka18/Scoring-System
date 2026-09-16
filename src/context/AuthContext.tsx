import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, RegisterCredentials } from '../types';

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, '');
}

export function isValidCambodianPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  // Cambodian phone numbers: starts with 0 or +855, followed by 8 or 9 digits (total 9 or 10 digits)
  // E.g., 012345678, 0971234567, +85512345678
  const cambodianRegex = /^(?:\+855|0)[1-9]\d{7,8}$/;
  return cambodianRegex.test(cleaned);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  if (cleaned.startsWith('0') && cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user_admin_sethka',
    phoneNumber: '012999888',
    username: 'sethka',
    password: '12344321',
    fullName: 'សេដ្ឋកា (Admin)',
    schoolName: 'សាលាបឋមសិក្សា ព្រែកជីក',
    className: '',
    gradeLevel: 'គ្រប់កម្រិត',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_teacher_sethka18',
    phoneNumber: '012999818',
    username: 'sethka18',
    password: '12344321',
    fullName: 'លោកគ្រូ ផាន សិតការណ៍',
    schoolName: 'សាលាបឋមសិក្សា ព្រែកជីក',
    className: 'ថ្នាក់ទី៦ក',
    gradeLevel: 'ថ្នាក់ទី៦',
    role: 'teacher',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
];

const LS_USERS_KEY = 'primary_gradebook_users_v3';
const LS_CURRENT_USER_KEY = 'primary_gradebook_current_user_id_v3';
const LS_ADMIN_ORIGINAL_KEY = 'primary_gradebook_admin_original_id_v3';

interface UpdateProfileData {
  fullName: string;
  phoneNumber: string;
  username?: string;
  schoolName?: string;
  className?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  isAdmin: boolean;
  isSwitchedView: boolean;
  originalAdminUser: UserAccount | null;
  login: (identifier: string, password: string) => { success: boolean; message?: string };
  register: (data: RegisterCredentials) => { success: boolean; message?: string };
  logout: () => void;
  updateUserProfile: (data: UpdateProfileData) => { success: boolean; message?: string };
  adminCreateUser: (data: RegisterCredentials & { role?: 'admin' | 'teacher' }) => { success: boolean; message?: string };
  adminUpdateUser: (userId: string, updates: Partial<UserAccount>) => boolean;
  adminDeleteUser: (userId: string) => { success: boolean; message?: string };
  adminResetPassword: (userId: string, newPass: string) => boolean;
  adminToggleStatus: (userId: string) => boolean;
  adminSwitchToUser: (userId: string) => boolean;
  adminReturnToAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(LS_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Make sure sethka admin exists and has role admin and password 12344321
          const sethkaIndex = parsed.findIndex(u => (u.username || '').toLowerCase() === 'sethka');
          if (sethkaIndex === -1) {
            parsed.unshift(DEFAULT_USERS[0]);
          } else {
            parsed[sethkaIndex].role = 'admin';
            parsed[sethkaIndex].password = '12344321';
          }

          // Make sure sethka18 teacher exists and has credentials
          const sethka18Index = parsed.findIndex(u => (u.username || '').toLowerCase() === 'sethka18');
          if (sethka18Index === -1) {
            parsed.push(DEFAULT_USERS[1]);
          } else {
            parsed[sethka18Index].password = '12344321';
            parsed[sethka18Index].fullName = 'លោកគ្រូ ផាន សិតការណ៍';
            parsed[sethka18Index].className = 'ថ្នាក់ទី៦ក';
            parsed[sethka18Index].schoolName = 'សាលាបឋមសិក្សា ព្រែកជីក';
            parsed[sethka18Index].isActive = true;
          }

          localStorage.setItem(LS_USERS_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(LS_CURRENT_USER_KEY);
      if (saved) return saved;
      return null;
    } catch (e) {
      return null;
    }
  });

  const [originalAdminId, setOriginalAdminId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LS_ADMIN_ORIGINAL_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  const currentUser = users.find(u => u.id === currentUserId) || null;
  const originalAdminUser = users.find(u => u.id === originalAdminId) || null;
  const isSwitchedView = !!originalAdminId && !!currentUser && originalAdminId !== currentUser.id;
  const isAdmin = (currentUser?.role === 'admin') || (isSwitchedView && originalAdminUser?.role === 'admin');

  const saveUsers = (updatedUsers: UserAccount[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.error(e);
    }
  };

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const rawId = identifier.trim().toLowerCase();
    const cleanId = cleanPhoneNumber(identifier).toLowerCase().trim();
    const cleanPass = password.trim();

    if (!rawId || !cleanPass) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះគណនី (Username) ឬលេខទូរស័ព្ទ និងពាក្យសម្ងាត់' };
    }

    const matchedUser = users.find(u => {
      const uPhoneClean = cleanPhoneNumber(u.phoneNumber).toLowerCase();
      const uUsername = (u.username || '').toLowerCase().trim();
      return (uUsername === rawId || uUsername === cleanId || uPhoneClean === cleanId || uPhoneClean === rawId) && u.password === cleanPass;
    });

    if (!matchedUser) {
      return { 
        success: false, 
        message: 'ឈ្មោះគណនី/លេខទូរស័ព្ទ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ! សូមពិនិត្យម្ដងទៀត' 
      };
    }

    if (!matchedUser.isActive) {
      return { 
        success: false, 
        message: 'គណនីនេះត្រូវបានផ្អាកដំណើរការជាបណ្តោះអាសន្ន។ សូមទាក់ទងអ្នកគ្រប់គ្រង (Admin)' 
      };
    }

    // Update last login
    const updated = users.map(u => u.id === matchedUser.id ? { ...u, lastLoginAt: new Date().toISOString() } : u);
    saveUsers(updated);

    setCurrentUserId(matchedUser.id);
    localStorage.setItem(LS_CURRENT_USER_KEY, matchedUser.id);
    setOriginalAdminId(null);
    localStorage.removeItem(LS_ADMIN_ORIGINAL_KEY);

    return { success: true };
  };

  const register = (data: RegisterCredentials): { success: boolean; message?: string } => {
    const rawPhone = cleanPhoneNumber(data.phoneNumber);
    if (!isValidCambodianPhone(rawPhone)) {
      return { 
        success: false, 
        message: 'សូមបញ្ចូលលេខទូរស័ព្ទឱ្យបានត្រឹមត្រូវ (ឧទាហរណ៍៖ 012 345 678 ឬ 097 123 4567)' 
      };
    }

    if (!data.fullName.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះលោកគ្រូ-អ្នកគ្រូឱ្យបានពេញលេញ' };
    }

    if (!data.schoolName.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះសាលារៀន' };
    }

    if (!data.className.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះថ្នាក់រៀន (ឧទាហរណ៍៖ ថ្នាក់ទី ៤(គ))' };
    }

    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៤ តួអក្សរ' };
    }

    // Check duplicate phone
    const exists = users.some(u => cleanPhoneNumber(u.phoneNumber) === rawPhone);
    if (exists) {
      return { success: false, message: 'លេខទូរស័ព្ទនេះត្រូវបានចុះឈ្មោះរួចហើយ! សូមចូលប្រើប្រាស់' };
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      phoneNumber: rawPhone,
      password: data.password.trim(),
      fullName: data.fullName.trim(),
      schoolName: data.schoolName.trim(),
      className: data.className.trim(),
      gradeLevel: data.gradeLevel?.trim() || '៤',
      role: 'teacher',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    saveUsers(updated);

    setCurrentUserId(newUser.id);
    localStorage.setItem(LS_CURRENT_USER_KEY, newUser.id);
    setOriginalAdminId(null);
    localStorage.removeItem(LS_ADMIN_ORIGINAL_KEY);

    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(LS_CURRENT_USER_KEY);
    setOriginalAdminId(null);
    localStorage.removeItem(LS_ADMIN_ORIGINAL_KEY);
  };

  const updateUserProfile = (data: UpdateProfileData): { success: boolean; message?: string } => {
    if (!currentUser) {
      return { success: false, message: 'មិនមានគណនីដែលកំពុងដំណើរការទេ' };
    }

    const rawPhone = cleanPhoneNumber(data.phoneNumber);
    if (!isValidCambodianPhone(rawPhone)) {
      return { success: false, message: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវតាមទម្រង់ប្រទេសកម្ពុជាទេ (ឧ. 012 345 678)' };
    }

    if (!data.fullName.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះឱ្យបានពេញលេញ' };
    }

    // Check if phone is taken by another user
    const phoneDuplicate = users.some(u => u.id !== currentUser.id && cleanPhoneNumber(u.phoneNumber) === rawPhone);
    if (phoneDuplicate) {
      return { success: false, message: 'លេខទូរស័ព្ទនេះមានអ្នកផ្សេងប្រើប្រាស់រួចហើយ' };
    }

    // Check if username is taken by another user (case-insensitive)
    const cleanUsername = data.username ? data.username.trim().toLowerCase() : undefined;
    if (cleanUsername) {
      const usernameDuplicate = users.some(u => u.id !== currentUser.id && (u.username || '').toLowerCase() === cleanUsername);
      if (usernameDuplicate) {
        return { success: false, message: 'ឈ្មោះគណនី (Username) នេះមានអ្នកផ្សេងប្រើរួចហើយ' };
      }
    }

    // If changing password, verify current password
    if (data.newPassword) {
      if (!data.currentPassword || data.currentPassword !== currentUser.password) {
        return { success: false, message: 'ពាក្យសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ' };
      }
      if (data.newPassword.length < 4) {
        return { success: false, message: 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៤ តួអក្សរ' };
      }
    }

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          fullName: data.fullName.trim(),
          phoneNumber: rawPhone,
          username: cleanUsername || u.username,
          schoolName: data.schoolName !== undefined ? data.schoolName.trim() : u.schoolName,
          className: data.className !== undefined ? data.className.trim() : u.className,
          password: data.newPassword ? data.newPassword.trim() : u.password,
        };
      }
      return u;
    });

    saveUsers(updatedUsers);
    return { success: true };
  };

  const adminCreateUser = (data: RegisterCredentials & { role?: 'admin' | 'teacher' }): { success: boolean; message?: string } => {
    const rawPhone = cleanPhoneNumber(data.phoneNumber);
    if (!isValidCambodianPhone(rawPhone)) {
      return { success: false, message: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ' };
    }

    const exists = users.some(u => cleanPhoneNumber(u.phoneNumber) === rawPhone);
    if (exists) {
      return { success: false, message: 'លេខទូរស័ព្ទនេះមានរួចហើយ' };
    }

    const cleanUsername = data.username ? data.username.trim().toLowerCase() : undefined;
    if (cleanUsername) {
      const usernameExists = users.some(u => (u.username || '').toLowerCase() === cleanUsername);
      if (usernameExists) {
        return { success: false, message: 'ឈ្មោះគណនី (Username) នេះមានអ្នកផ្សេងប្រើរួចហើយ' };
      }
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      phoneNumber: rawPhone,
      username: cleanUsername,
      password: data.password.trim() || '123456',
      fullName: data.fullName.trim(),
      schoolName: data.schoolName.trim() || 'សាលាបឋមសិក្សា',
      className: data.className.trim() || 'ថ្នាក់ទី ៤',
      gradeLevel: data.gradeLevel?.trim() || '៤',
      role: data.role || 'teacher',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    return { success: true };
  };

  const adminUpdateUser = (userId: string, updates: Partial<UserAccount>): boolean => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });
    saveUsers(updated);
    return true;
  };

  const adminDeleteUser = (userId: string): { success: boolean; message?: string } => {
    if (userId === currentUserId && !isSwitchedView) {
      return { success: false, message: 'មិនអាចលុបគណនីដែលកំពុងដំណើរការនេះបានទេ' };
    }
    const target = users.find(u => u.id === userId);
    if (target?.username === 'sethka' || target?.id === 'user_admin_sethka') {
      return { success: false, message: 'មិនអាចលុបគណនី Admin មេ (sethka) បានទេ' };
    }
    const filtered = users.filter(u => u.id !== userId);
    saveUsers(filtered);
    return { success: true };
  };

  const adminResetPassword = (userId: string, newPass: string): boolean => {
    if (!newPass || newPass.trim().length < 4) return false;
    const updated = users.map(u => u.id === userId ? { ...u, password: newPass.trim() } : u);
    saveUsers(updated);
    return true;
  };

  const adminToggleStatus = (userId: string): boolean => {
    const updated = users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u);
    saveUsers(updated);
    return true;
  };

  const adminSwitchToUser = (userId: string): boolean => {
    if (!currentUser) return false;
    // Remember original admin
    if (!originalAdminId) {
      setOriginalAdminId(currentUser.id);
      localStorage.setItem(LS_ADMIN_ORIGINAL_KEY, currentUser.id);
    }
    setCurrentUserId(userId);
    localStorage.setItem(LS_CURRENT_USER_KEY, userId);
    return true;
  };

  const adminReturnToAdmin = () => {
    if (originalAdminId) {
      setCurrentUserId(originalAdminId);
      localStorage.setItem(LS_CURRENT_USER_KEY, originalAdminId);
      setOriginalAdminId(null);
      localStorage.removeItem(LS_ADMIN_ORIGINAL_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAdmin,
        isSwitchedView,
        originalAdminUser,
        login,
        register,
        logout,
        updateUserProfile,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        adminResetPassword,
        adminToggleStatus,
        adminSwitchToUser,
        adminReturnToAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
