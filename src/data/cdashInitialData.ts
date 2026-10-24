import { User, Task, AccountRequest, AppNotification, StatusItem, ColorPreset } from '../types/cdash';

export const STATUS_OPTIONS: StatusItem[] = [
  { id: 'active', label: 'Live / Active', badge: 'Active', desc: 'Online and working', color: '#10b981', emoji: '🟢' },
  { id: 'away', label: 'Away', badge: 'Away', desc: 'Stepped away temporarily', color: '#f59e0b', emoji: '🟡' },
  { id: 'busy', label: 'Busy', badge: 'Busy', desc: 'In focused work / meeting', color: '#ef4444', emoji: '🔴' },
  { id: 'dnd', label: 'Do Not Disturb', badge: 'DND', desc: 'Mute alerts & notifications', color: '#dc2626', emoji: '⛔' },
  { id: 'ooo', label: 'Out of Office', badge: 'Out of Office', desc: 'Vacation, sick leave, travel', color: '#8b5cf6', emoji: '🟣' },
];

export const PRESET_COLORS: ColorPreset[] = [
  {
    id: 'indigo',
    name: 'Electric Indigo',
    primary: '#6366f1',
    darkPrimary: '#4f46e5',
    gradient: ['#4f46e5', '#3730a3'],
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    primary: '#10b981',
    darkPrimary: '#059669',
    gradient: ['#059669', '#065f46'],
  },
  {
    id: 'ocean',
    name: 'Azure Ocean',
    primary: '#0ea5e9',
    darkPrimary: '#0284c7',
    gradient: ['#0284c7', '#075985'],
  },
  {
    id: 'purple',
    name: 'Royal Violet',
    primary: '#8b5cf6',
    darkPrimary: '#7c3aed',
    gradient: ['#7c3aed', '#5b21b6'],
  },
  {
    id: 'rose',
    name: 'Rose Coral',
    primary: '#f43f5e',
    darkPrimary: '#e11d48',
    gradient: ['#e11d48', '#9f1239'],
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    primary: '#f59e0b',
    darkPrimary: '#d97706',
    gradient: ['#d97706', '#92400e'],
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#06b6d4',
    darkPrimary: '#0891b2',
    gradient: ['#0891b2', '#155e75'],
  },
];

// Clean initial state matching real database - no fake sample data
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_jiikeeesh',
    username: 'jiikeeesh',
    role: 'admin',
    fullName: 'Jikesh',
    email: 'admin@company.com',
    department: 'Head',
    createdAt: '2025-01-01T00:00:00Z',
    presenceStatus: 'active',
  },
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_REQUESTS: AccountRequest[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
