import { User, Task, AccountRequest, UserPresenceStatus, PresenceUser } from '../types/cdash';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://cdash-kc83nmhot-jikesh2000t-4970s-projects.vercel.app/api';

// Vercel Protection Bypass header
export const VERCEL_BYPASS_SECRET =
  process.env.EXPO_PUBLIC_VERCEL_BYPASS || 'tz3pvttuWudvARfGcyXEzlxOx0Fqbt39';

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (VERCEL_BYPASS_SECRET) {
    headers['x-vercel-protection-bypass'] = VERCEL_BYPASS_SECRET;
    headers['x-vercel-set-bypass-cookie'] = 'samesite=none';
  }
  return headers;
}

export const api = {
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 && data?.protection) {
        // Vercel deployment protection is active
        return {
          success: false,
          error: 'Vercel Deployment Protection is active on this deployment. Please disable it in Vercel settings or use demo login.',
        };
      }

      if (!res.ok) {
        return { success: false, error: data?.error || 'Invalid credentials' };
      }

      return { success: true, user: data?.user };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error connecting to API';
      return { success: false, error: msg };
    }
  },

  async fetchTasks(): Promise<Task[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createTask(task: Partial<Task>): Promise<Task | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchUsers(): Promise<User[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async fetchRequests(): Promise<AccountRequest[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/requests`, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async sendPresence(userId: string, status: UserPresenceStatus): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/presence`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, status }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async logoutPresence(userId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/presence`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, action: 'logout' }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchPresence(
    userId: string,
    role: string,
    status?: string
  ): Promise<{
    onlineUsers: PresenceUser[];
    offlineUsers: PresenceUser[];
    totalAccessible: number;
    totalOnline: number;
  } | null> {
    try {
      const url = `${API_BASE_URL}/presence?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(
        role
      )}${status ? `&status=${encodeURIComponent(status)}` : ''}`;
      const res = await fetch(url, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
