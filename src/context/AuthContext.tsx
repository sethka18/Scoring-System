import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../types';

export interface OnboardingSchoolData {
  schoolNameKm: string;
  schoolNameEn?: string;
  province: string;
  district: string;
  classNameKm: string;
  gradeLevel: number;
  academicYear: string;
  teacherName: string;
  seedSampleStudents?: boolean;
}

export interface CreateUserDataByAdmin {
  fullName: string;
  username: string;
  password?: string;
  role: 'teacher' | 'principal' | 'administrator';
  schoolNameKm: string;
  schoolNameEn?: string;
  province: string;
  district: string;
  classNameKm?: string;
  gradeLevel?: number;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  impersonatingFromAdminId: string | null;
  login: (username: string, password?: string) => { success: boolean; message?: string };
  register: (data: {
    fullName: string;
    username: string;
    password?: string;
    role?: 'teacher' | 'principal' | 'administrator';
  }) => { success: boolean; message?: string };
  logout: () => void;
  completeOnboarding: (data: OnboardingSchoolData) => void;
  updateCurrentUser: (updates: Partial<UserAccount>) => void;
  switchAccount: (userId: string) => void;
  impersonateUser: (userId: string) => void;
  revertToAdmin: () => void;
  deleteUser: (userId: string) => { success: boolean; message?: string };
  updateUser: (userId: string, updates: Partial<UserAccount>) => { success: boolean; message?: string };
  createUserByAdmin: (userData: CreateUserDataByAdmin) => { success: boolean; message?: string };
  resetUserPassword: (userId: string, newPassword?: string) => { success: boolean; message?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_USERS_KEY = 'gradebook_users_v2';
const LS_CURRENT_USER_ID_KEY = 'gradebook_current_user_id_v2';

export const ADMIN_USER: UserAccount = {
  id: 'user_admin',
  username: 'admin',
  fullName: 'អភិបាលប្រព័ន្ធ (System Administrator)',
  role: 'administrator',
  password: 'password123',
  schoolNameKm: 'រដ្ឋបាលប្រព័ន្ធគ្រប់គ្រងសាលារៀនកម្ពុជា',
  schoolNameEn: 'Cambodia Primary Education Administration',
  province: 'រាជធានីភ្នំពេញ',
  district: 'ខណ្ឌដូនពេញ',
  defaultGradeLevel: 6,
  initialClassNameKm: 'គ្រប់ថ្នាក់រៀន',
  createdAt: '2026-01-01T00:00:00.000Z',
  hasCompletedOnboarding: true,
};

const DEFAULT_USERS: UserAccount[] = [
  ADMIN_USER,
  {
    id: 'user_prekchik',
    username: 'teacher',
    password: 'password123',
    fullName: 'លោកគ្រូ សុខា (គ្រូបន្ទុកថ្នាក់)',
    role: 'teacher',
    schoolNameKm: 'សាលាបឋមសិក្សា ព្រែកជីក',
    schoolNameEn: 'Prek Chik Primary School',
    province: 'ខេត្តត្បូងឃ្មុំ',
    district: 'ស្រុកក្រូចឆ្មារ',
    defaultGradeLevel: 6,
    initialClassNameKm: 'ថ្នាក់ទី ៦(ក)',
    createdAt: '2026-01-01T00:00:00.000Z',
    hasCompletedOnboarding: true,
  },
  {
    id: 'user_principal',
    username: 'principal',
    password: 'password123',
    fullName: 'អ្នកគ្រូ ចាន់ថន (នាយិកាសាលា)',
    role: 'principal',
    schoolNameKm: 'សាលាបឋមសិក្សា អនុវត្ត',
    schoolNameEn: 'Practice Primary School',
    province: 'រាជធានីភ្នំពេញ',
    district: 'ខណ្ឌដូនពេញ',
    defaultGradeLevel: 5,
    initialClassNameKm: 'ថ្នាក់ទី ៥(ក)',
    createdAt: '2026-01-15T00:00:00.000Z',
    hasCompletedOnboarding: true,
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(LS_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure admin account always exists
          if (!parsed.some((u: any) => u.username === 'admin' || u.id === 'user_admin' || u.role === 'administrator')) {
            return [ADMIN_USER, ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load users from localStorage:', e);
    }
    return DEFAULT_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const savedId = localStorage.getItem(LS_CURRENT_USER_ID_KEY);
      if (savedId) {
        return savedId;
      }
    } catch (e) {
      console.error('Failed to load current user ID:', e);
    }
    return 'user_admin'; // Default to admin for convenient first-time administrative management
  });

  const [impersonatingFromAdminId, setImpersonatingFromAdminId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('admin_impersonating_id');
    } catch {
      return null;
    }
  });

  const currentUser = users.find(u => u.id === currentUserId) || null;
  const isAdmin = currentUser?.role === 'administrator';

  // Persist users
  useEffect(() => {
    try {
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }, [users]);

  // Persist currentUserId
  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, currentUserId);
      } else {
        localStorage.removeItem(LS_CURRENT_USER_ID_KEY);
      }
    } catch (e) {
      console.error('Failed to save current user ID:', e);
    }
  }, [currentUserId]);

  const login = (username: string, password?: string): { success: boolean; message?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      return {
        success: false,
        message: 'រកមិនឃើញគណនីនេះទេ។ សូមពិនិត្យឈ្មោះអ្នកប្រើប្រាស់ ឬចុះឈ្មោះគណនីថ្មី។',
      };
    }

    // Optional password verification
    if (user.password && password && user.password !== password) {
      return {
        success: false,
        message: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។ សូមព្យាយាមម្តងទៀត។',
      };
    }

    setCurrentUserId(user.id);
    return { success: true };
  };

  const register = (data: {
    fullName: string;
    username: string;
    password?: string;
    role?: 'teacher' | 'principal' | 'administrator';
  }): { success: boolean; message?: string } => {
    const cleanUsername = data.username.trim().toLowerCase();

    if (!data.fullName.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះពេញ ឬគោត្តនាម-នាមរបស់អ្នក' };
    }

    if (!cleanUsername) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ ឬអ៊ីមែល' };
    }

    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'ឈ្មោះអ្នកប្រើប្រាស់នេះមានរួចហើយ។ សូមជ្រើសរើសឈ្មោះផ្សេង។' };
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      fullName: data.fullName.trim(),
      password: data.password || '',
      role: data.role || 'teacher',
      schoolNameKm: '',
      province: '',
      district: '',
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: false, // Must set up school & class right after registering!
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUserId(newUser.id);

    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    setImpersonatingFromAdminId(null);
    try {
      sessionStorage.removeItem('admin_impersonating_id');
    } catch {}
  };

  const switchAccount = (userId: string) => {
    const exists = users.some(u => u.id === userId);
    if (exists) {
      setCurrentUserId(userId);
    }
  };

  const impersonateUser = (userId: string) => {
    if (currentUser?.role === 'administrator') {
      try {
        sessionStorage.setItem('admin_impersonating_id', currentUser.id);
      } catch {}
      setImpersonatingFromAdminId(currentUser.id);
      setCurrentUserId(userId);
    }
  };

  const revertToAdmin = () => {
    if (impersonatingFromAdminId) {
      setCurrentUserId(impersonatingFromAdminId);
      setImpersonatingFromAdminId(null);
      try {
        sessionStorage.removeItem('admin_impersonating_id');
      } catch {}
    } else {
      const adminAcc = users.find(u => u.role === 'administrator');
      if (adminAcc) {
        setCurrentUserId(adminAcc.id);
      }
    }
  };

  const updateCurrentUser = (updates: Partial<UserAccount>) => {
    if (!currentUserId) return;
    setUsers(prev =>
      prev.map(u => (u.id === currentUserId ? { ...u, ...updates } : u))
    );
  };

  const updateUser = (userId: string, updates: Partial<UserAccount>): { success: boolean; message?: string } => {
    const exists = users.some(u => u.id === userId);
    if (!exists) {
      return { success: false, message: 'រកមិនឃើញគណនីដែលត្រូវកែប្រែទេ' };
    }

    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const duplicate = users.some(u => u.id !== userId && u.username.toLowerCase() === cleanUsername);
      if (duplicate) {
        return { success: false, message: 'ឈ្មោះអ្នកប្រើប្រាស់នេះមានរួចហើយ' };
      }
      updates.username = cleanUsername;
    }

    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    return { success: true };
  };

  const deleteUser = (userId: string): { success: boolean; message?: string } => {
    if (userId === currentUserId) {
      return { success: false, message: 'មិនអាចលុបគណនីដែលកំពុងដំណើរការបានទេ' };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'រកមិនឃើញគណនីដែលត្រូវលុបទេ' };
    }

    if (targetUser.username === 'admin' && users.filter(u => u.role === 'administrator').length <= 1) {
      return { success: false, message: 'មិនអាចលុបគណនី Admin ចុងក្រោយនៃប្រព័ន្ធបានឡើយ' };
    }

    // Remove user and clean up their localStorage keys
    setUsers(prev => prev.filter(u => u.id !== userId));

    try {
      const prefix = `primary_gradebook_v2_${userId}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error cleaning up user storage:', e);
    }

    return { success: true };
  };

  const createUserByAdmin = (userData: CreateUserDataByAdmin): { success: boolean; message?: string } => {
    const cleanUsername = userData.username.trim().toLowerCase();

    if (!userData.fullName.trim()) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះពេញ' };
    }
    if (!cleanUsername) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះសម្គាល់គណនី' };
    }
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'ឈ្មោះអ្នកប្រើប្រាស់នេះមានរួចហើយ' };
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      fullName: userData.fullName.trim(),
      password: userData.password || 'password123',
      role: userData.role,
      schoolNameKm: userData.schoolNameKm.trim(),
      schoolNameEn: userData.schoolNameEn?.trim() || '',
      province: userData.province.trim(),
      district: userData.district.trim(),
      defaultGradeLevel: userData.gradeLevel || 6,
      initialClassNameKm: userData.classNameKm?.trim() || 'ថ្នាក់ទី ៦(ក)',
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: true,
    };

    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const resetUserPassword = (userId: string, newPassword = 'password123'): { success: boolean; message?: string } => {
    const exists = users.some(u => u.id === userId);
    if (!exists) {
      return { success: false, message: 'រកមិនឃើញគណនី' };
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, password: newPassword } : u)));
    return { success: true };
  };

  const completeOnboarding = (data: OnboardingSchoolData) => {
    if (!currentUserId) return;

    setUsers(prev =>
      prev.map(u => {
        if (u.id === currentUserId) {
          return {
            ...u,
            schoolNameKm: data.schoolNameKm.trim(),
            schoolNameEn: data.schoolNameEn?.trim() || '',
            province: data.province.trim(),
            district: data.district.trim(),
            defaultGradeLevel: data.gradeLevel,
            initialClassNameKm: data.classNameKm.trim(),
            hasCompletedOnboarding: true,
          };
        }
        return u;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !!currentUser,
        isAdmin,
        impersonatingFromAdminId,
        login,
        register,
        logout,
        completeOnboarding,
        updateCurrentUser,
        switchAccount,
        impersonateUser,
        revertToAdmin,
        deleteUser,
        updateUser,
        createUserByAdmin,
        resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
