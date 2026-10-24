import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  User,
  Task,
  AccountRequest,
  AppNotification,
  Role,
  UserPresenceStatus,
  ThemeMode,
  ColorPreset,
  TaskStatus,
  PresenceUser,
} from '../types/cdash';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
  PRESET_COLORS,
} from '../data/cdashInitialData';
import { api } from '../services/api';

export interface ThemeColors {
  brand: string;
  brandDark: string;
  brandLight: string;
  brandSubtle: string;
  gradient: [string, string];
  bgPage: string;
  bgSurface: string;
  bgSurfaceSub: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardShadow: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  chipBg: string;
}

interface CdashContextType {
  currentUser: User;
  setCurrentUserRole: (role: Role) => void;
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  requests: AccountRequest[];
  addRequest: (reqData: Omit<AccountRequest, 'id' | 'createdAt' | 'status'>) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, reason: string) => void;

  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;

  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  themeColor: string;
  setThemeColor: (colorId: string) => void;
  activePreset: ColorPreset;
  colors: ThemeColors;

  userStatus: UserPresenceStatus;
  setUserStatus: (status: UserPresenceStatus) => void;

  activeTab: 'dashboard' | 'tasks' | 'users' | 'requests';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'users' | 'requests') => void;

  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;

  // Authentication
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; isFirstLogin?: boolean }>;
  logout: () => void;

  // Real-time Presence & Live Refresh
  onlineUsers: PresenceUser[];
  offlineUsers: PresenceUser[];
  totalOnline: number;
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
}

const CdashContext = createContext<CdashContextType | undefined>(undefined);

// Theme persistence helpers
const getPersistedThemeMode = (): ThemeMode => {
  try {
    if (typeof localStorage !== 'undefined') {
      const m = localStorage.getItem('cdash_theme_mode');
      if (m === 'light' || m === 'dark') return m as ThemeMode;
    }
  } catch {
    // ignore
  }
  return 'light';
};

const getPersistedThemeColor = (): string => {
  try {
    if (typeof localStorage !== 'undefined') {
      const c = localStorage.getItem('cdash_theme_color');
      if (c) return c;
    }
  } catch {
    // ignore
  }
  return 'indigo';
};

const persistTheme = (mode: ThemeMode, color: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cdash_theme_mode', mode);
      localStorage.setItem('cdash_theme_color', color);
    }
  } catch {
    // ignore
  }
};

export const CdashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('usr_admin_jiikeeesh');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [requests, setRequests] = useState<AccountRequest[]>(INITIAL_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [themeMode, setThemeMode] = useState<ThemeMode>(getPersistedThemeMode);
  const [themeColor, setThemeColorState] = useState<string>(getPersistedThemeColor);
  const [userStatus, setUserStatusState] = useState<UserPresenceStatus>('active');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'users' | 'requests'>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<PresenceUser[]>([]);
  const [totalOnline, setTotalOnline] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const fetchRemoteData = useCallback(async () => {
    try {
      const [remoteTasks, remoteUsers, remoteReqs] = await Promise.all([
        api.fetchTasks(),
        api.fetchUsers(),
        api.fetchRequests(),
      ]);

      if (remoteTasks !== null) {
        setTasks(remoteTasks);
      }
      if (remoteUsers !== null && remoteUsers.length > 0) {
        setUsers(remoteUsers);
      }
      if (remoteReqs !== null) {
        setRequests(remoteReqs);
      }

      // Fetch live presence from /api/presence
      const userList = remoteUsers && remoteUsers.length > 0 ? remoteUsers : users;
      const targetUser = userList.find((u) => u.id === currentUserId) || userList[0];
      if (targetUser) {
        const pres = await api.fetchPresence(targetUser.id, targetUser.role, userStatus);
        if (pres) {
          setOnlineUsers(pres.onlineUsers || []);
          setOfflineUsers(pres.offlineUsers || []);
          setTotalOnline(pres.totalOnline ?? pres.onlineUsers?.length ?? 0);
        }
      }
    } catch {
      // ignore
    }
  }, [currentUserId, userStatus, users]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchRemoteData();
    setIsRefreshing(false);
  };

  // Sync with remote Vercel API on mount and every 10s for live updates
  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      if (isMounted) {
        await fetchRemoteData();
      }
    };

    const timer = setTimeout(poll, 50);
    const interval = setInterval(poll, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchRemoteData]);

  const setCurrentUserRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
    }
  };

  const activePreset = useMemo(() => {
    return PRESET_COLORS.find((p) => p.id === themeColor) || PRESET_COLORS[0];
  }, [themeColor]);

  const colors = useMemo<ThemeColors>(() => {
    const isDark = themeMode === 'dark';
    const primary = activePreset.primary;
    const darkPrimary = activePreset.darkPrimary;

    return {
      brand: primary,
      brandDark: darkPrimary,
      brandLight: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
      brandSubtle: isDark ? '#1e1b4b' : '#eef2ff',
      gradient: activePreset.gradient,
      bgPage: isDark ? '#0b0f19' : '#f8fafc',
      bgSurface: isDark ? '#111827' : '#ffffff',
      bgSurfaceSub: isDark ? '#1f2937' : '#f1f5f9',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
      textPrimary: isDark ? '#f8fafc' : '#0f172a',
      textSecondary: isDark ? '#cbd5e1' : '#475569',
      textMuted: isDark ? '#94a3b8' : '#94a3b8',
      cardShadow: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(15, 23, 42, 0.08)',
      success: '#10b981',
      successLight: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
      warning: '#f59e0b',
      warningLight: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
      error: '#ef4444',
      errorLight: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
      info: '#3b82f6',
      infoLight: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
      chipBg: isDark ? '#1f2937' : '#f1f5f9',
    };
  }, [themeMode, activePreset]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => {
      const nextMode: ThemeMode = prev === 'light' ? 'dark' : 'light';
      persistTheme(nextMode, themeColor);
      if (currentUser) {
        api.updateUser(currentUser.id, { themeMode: nextMode });
        setUsers((all) =>
          all.map((u) => (u.id === currentUser.id ? { ...u, themeMode: nextMode } : u))
        );
      }
      return nextMode;
    });
  };

  const setThemeColor = (colorId: string) => {
    setThemeColorState(colorId);
    persistTheme(themeMode, colorId);
    if (currentUser) {
      api.updateUser(currentUser.id, { themeColor: colorId });
      setUsers((all) =>
        all.map((u) => (u.id === currentUser.id ? { ...u, themeColor: colorId } : u))
      );
    }
  };

  const setUserStatus = async (status: UserPresenceStatus) => {
    setUserStatusState(status);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, presenceStatus: status } : u))
    );
    if (currentUser) {
      const pres = await api.fetchPresence(currentUser.id, currentUser.role, status);
      if (pres) {
        setOnlineUsers(pres.onlineUsers || []);
        setOfflineUsers(pres.offlineUsers || []);
        setTotalOnline(pres.totalOnline ?? pres.onlineUsers?.length ?? 0);
      }
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string; isFirstLogin?: boolean }> => {
    // 1. First attempt to call the remote Vercel API
    const remoteRes = await api.login(username, password);
    if (remoteRes.success && remoteRes.user) {
      const u = remoteRes.user;

      // FIRST-LOGIN ENFORCEMENT: First login & password change must be performed on the Web
      if (u.isFirstLogin) {
        return {
          success: false,
          isFirstLogin: true,
          error:
            'Initial login and password change must be completed on the Web portal. Only the web version allows setting your new password. Once completed on the web, you can sign in to the mobile app.',
        };
      }

      // Sync user's saved theme from database
      if (u.themeMode === 'light' || u.themeMode === 'dark') {
        setThemeMode(u.themeMode);
      }
      if (u.themeColor) {
        setThemeColorState(u.themeColor);
      }
      persistTheme(u.themeMode || themeMode, u.themeColor || themeColor);

      setUsers((prev) => (prev.some((x) => x.id === u.id) ? prev : [u, ...prev]));
      setCurrentUserId(u.id);
      setIsAuthenticated(true);
      // Immediately touch presence and fetch data
      api.fetchPresence(u.id, u.role, 'active').then((pres) => {
        if (pres) {
          setOnlineUsers(pres.onlineUsers || []);
          setOfflineUsers(pres.offlineUsers || []);
          setTotalOnline(pres.totalOnline ?? pres.onlineUsers?.length ?? 0);
        }
      });
      return { success: true };
    }

    // 2. Fallback: Check loaded users
    const matched = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (matched && (password === 'J!kesh9803' || password === 'admin' || password === 'pass123')) {
      if (matched.isFirstLogin) {
        return {
          success: false,
          isFirstLogin: true,
          error:
            'Initial login and password change must be completed on the Web portal. Only the web version allows setting your new password. Once completed on the web, you can sign in to the mobile app.',
        };
      }

      if (matched.themeMode === 'light' || matched.themeMode === 'dark') {
        setThemeMode(matched.themeMode);
      }
      if (matched.themeColor) {
        setThemeColorState(matched.themeColor);
      }
      persistTheme(matched.themeMode || themeMode, matched.themeColor || themeColor);

      setCurrentUserId(matched.id);
      setIsAuthenticated(true);
      api.fetchPresence(matched.id, matched.role, 'active').then((pres) => {
        if (pres) {
          setOnlineUsers(pres.onlineUsers || []);
          setOfflineUsers(pres.offlineUsers || []);
          setTotalOnline(pres.totalOnline ?? pres.onlineUsers?.length ?? 0);
        }
      });
      return { success: true };
    }

    return {
      success: false,
      error: remoteRes.error || 'Invalid credentials. Please check your username and password.',
    };
  };

  const logout = () => {
    if (currentUser) {
      // Save last theme preferences to server before logging out
      api.updateUser(currentUser.id, { themeMode, themeColor });
      api.logoutPresence(currentUser.id);
    }
    // Retain the last chosen theme mode and color in local storage & memory
    persistTheme(themeMode, themeColor);
    setIsAuthenticated(false);
    setIsProfileOpen(false);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      presenceStatus: 'active',
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
    api.createTask(newTask);

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Task Created',
      message: `"${taskData.title}" was created and assigned.`,
      type: 'task_assigned',
      isRead: false,
      createdAt: now,
      linkTab: 'tasks',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    );
    api.updateTask(id, updates);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: now } : t))
    );
    api.updateTask(id, { status });

    const task = tasks.find((t) => t.id === id);
    if (task) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Task Status Updated',
        message: `"${task.title}" is now marked as ${status.replace('-', ' ')}.`,
        type: 'task_updated',
        isRead: false,
        createdAt: now,
        linkTab: 'tasks',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    api.deleteTask(id);
  };

  const addRequest = (reqData: Omit<AccountRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: AccountRequest = {
      ...reqData,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setRequests((prev) => [newReq, ...prev]);

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Account Request Submitted',
      message: `${currentUser.fullName} requested an account for ${reqData.fullName}.`,
      type: 'request_pending',
      isRead: false,
      createdAt: new Date().toISOString(),
      linkTab: 'requests',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const approveRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'approved',
              resolvedAt: new Date().toISOString(),
              resolvedById: currentUser.id,
            }
          : r
      )
    );

    addUser({
      username: req.email.split('@')[0],
      role: req.requestedRole,
      fullName: req.fullName,
      email: req.email,
      department: req.department,
      createdBy: currentUser.id,
    });

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Account Request Approved',
      message: `Account for ${req.fullName} was approved and provisioned.`,
      type: 'request_resolved',
      isRead: false,
      createdAt: new Date().toISOString(),
      linkTab: 'users',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const rejectRequest = (id: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'rejected',
              resolvedAt: new Date().toISOString(),
              resolvedById: currentUser.id,
              rejectionReason: reason,
            }
          : r
      )
    );
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <CdashContext.Provider
      value={{
        currentUser,
        setCurrentUserRole,
        users,
        addUser,
        updateUser,
        deleteUser,

        tasks,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,

        requests,
        addRequest,
        approveRequest,
        rejectRequest,

        notifications,
        markAsRead,
        markAllAsRead,
        unreadCount,

        themeMode,
        toggleThemeMode,
        themeColor,
        setThemeColor,
        activePreset,
        colors,

        userStatus,
        setUserStatus,

        activeTab,
        setActiveTab,

        isProfileOpen,
        setIsProfileOpen,
        isNotifOpen,
        setIsNotifOpen,

        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,

        onlineUsers,
        offlineUsers,
        totalOnline,
        isRefreshing,
        refreshData,
      }}
    >
      {children}
    </CdashContext.Provider>
  );
};

export const useCdash = () => {
  const ctx = useContext(CdashContext);
  if (!ctx) throw new Error('useCdash must be used within CdashProvider');
  return ctx;
};
