import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

interface AdminCredentials {
  username: string;
  password: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  adminLogin: (credentials: AdminCredentials) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  
  // Getters
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        console.log('🔍 [AuthStore] [setAuth] user:', user.email);
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        set({ user, accessToken, refreshToken });
      },

      setAccessToken: (accessToken) => {
        console.log('🔍 [AuthStore] [setAccessToken]');
        localStorage.setItem('access_token', accessToken);
        set({ accessToken });
      },

      login: async (credentials) => {
        console.log('🔍 [AuthStore] [login] email:', credentials.email);
        set({ isLoading: true });
        
        try {
          const response = await api.post('/auth/login', credentials);
          const { accessToken, refreshToken, user } = response.data;
          
          get().setAuth(user, accessToken, refreshToken);
        } catch (error) {
          console.error('🔴 [AuthStore] [login] error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (credentials) => {
        console.log('🔍 [AuthStore] [register] email:', credentials.email);
        set({ isLoading: true });
        
        try {
          const response = await api.post('/auth/register', credentials);
          const { accessToken, refreshToken, user } = response.data;
          
          get().setAuth(user, accessToken, refreshToken);
        } catch (error) {
          console.error('🔴 [AuthStore] [register] error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      adminLogin: async (credentials) => {
        console.log('🔍 [AuthStore] [adminLogin] username:', credentials.username);
        set({ isLoading: true });
        
        try {
          const response = await api.post('/auth/admin/login', credentials);
          const { accessToken, refreshToken, user } = response.data;
          
          get().setAuth(user, accessToken, refreshToken);
        } catch (error) {
          console.error('🔴 [AuthStore] [adminLogin] error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        console.log('🔍 [AuthStore] [logout]');
        
        try {
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.error('🔴 [AuthStore] [logout] error:', error);
        } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      logoutAll: async () => {
        console.log('🔍 [AuthStore] [logoutAll]');
        
        try {
          await api.post('/auth/logout-all');
        } catch (error) {
          console.error('🔴 [AuthStore] [logoutAll] error:', error);
        } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      refreshAccessToken: async () => {
        console.log('🔍 [AuthStore] [refreshAccessToken]');
        
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) {
            console.log('⚠️ [AuthStore] [refreshAccessToken] No refresh token');
            return false;
          }

          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          
          get().setAccessToken(accessToken);
          return true;
        } catch (error) {
          console.error('🔴 [AuthStore] [refreshAccessToken] error:', error);
          // Refresh failed, logout user
          get().logout();
          return false;
        }
      },

      isAdmin: () => get().user?.role === 'admin',
      isLoggedIn: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken 
      }),
    }
  )
);
