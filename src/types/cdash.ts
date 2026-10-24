export type Role = 'admin' | 'moderator' | 'user';

export type UserPresenceStatus = 'active' | 'away' | 'busy' | 'dnd' | 'ooo' | 'offline';

export type TaskStatus = 'pending' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  username: string;
  role: Role;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  department: string;
  createdBy?: string;
  createdAt: string;
  isFirstLogin?: boolean;
  presenceStatus?: UserPresenceStatus;
  themeMode?: ThemeMode;
  themeColor?: string;
}

export interface PresenceUser {
  id: string;
  fullName: string;
  username: string;
  role: string;
  department: string;
  isOnline: boolean;
  lastActive: number | null;
  status: UserPresenceStatus;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedById: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assigneeIds: string[];
  notes?: string;
}

export interface AccountRequest {
  id: string;
  requestedById: string;
  requestedRole: Role;
  fullName: string;
  email: string;
  department: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedById?: string;
  rejectionReason?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_updated' | 'request_pending' | 'request_resolved' | 'system';
  isRead: boolean;
  createdAt: string;
  linkTab?: 'dashboard' | 'tasks' | 'users' | 'requests';
}

export interface StatusItem {
  id: UserPresenceStatus;
  label: string;
  badge: string;
  desc: string;
  color: string;
  emoji: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  darkPrimary: string;
  gradient: [string, string];
}
