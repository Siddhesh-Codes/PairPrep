import { create } from 'zustand';
import { api, setUnauthorizedListener } from './api';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  profileId: string;
  profileComplete: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  login: async (email, password) => {
    const user = await api.post<AuthUser>('/api/v1/auth/login', { email, password });
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (email, password, displayName) => {
    const user = await api.post<AuthUser>('/api/v1/auth/register', { email, password, displayName });
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // ignore errors during logout
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const user = await api.post<AuthUser>('/api/v1/auth/refresh');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Automatically clear the client state if any request encounters an unhandled 401 Unauthorized status
setUnauthorizedListener(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});
