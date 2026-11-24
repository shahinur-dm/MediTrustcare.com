import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, Permission } from '../types';

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('meditrust_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            setPermissions(res.data.data.permissions || []);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('meditrust_access_token');
          localStorage.removeItem('meditrust_refresh_token');
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user, permissions, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('meditrust_access_token', accessToken);
        localStorage.setItem('meditrust_refresh_token', refreshToken);
        setUser(user);
        setPermissions(permissions);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password',
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('meditrust_refresh_token');
      await api.post('/auth/logout', { token: refreshToken });
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('meditrust_access_token');
      localStorage.removeItem('meditrust_refresh_token');
      setUser(null);
      setPermissions([]);
    }
  };

  const hasPermission = (module: string, action: string) => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true;

    const mod = permissions.find((p) => p.module === module || p.module === '*');
    if (!mod) return false;
    return mod.actions.includes(action as any) || (mod.actions as string[]).includes('*');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
