'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  status?: string;
  vendor?: {
    id: string;
    businessName: string;
    status: string;
    slug?: string;
  } | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: any) => Promise<AuthUser>;
  setAuthUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  refreshUser: (force?: boolean) => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'bazaarone_has_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // Fast synchronous check on client: if there's definitely no session recorded, don't block
    if (typeof window === 'undefined') return true;
    try {
      const hasLocal = localStorage.getItem(SESSION_STORAGE_KEY) === 'true';
      const hasCookie = document.cookie.includes('bazaarone_session=1') || document.cookie.includes('token=');
      return hasLocal || hasCookie;
    } catch {
      return false;
    }
  });

  const setAuthUser = React.useCallback((newUser: AuthUser | null) => {
    setUser(newUser);
    setIsLoading(false);
    if (typeof window !== 'undefined') {
      try {
        if (newUser) {
          localStorage.setItem(SESSION_STORAGE_KEY, 'true');
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {}
    }
  }, []);

  const refreshUser = React.useCallback(async (force = false): Promise<AuthUser | null> => {
    // Fast path: Check if any indicator of session exists
    let hasSession = false;
    if (typeof window !== 'undefined') {
      try {
        hasSession =
          localStorage.getItem(SESSION_STORAGE_KEY) === 'true' ||
          document.cookie.includes('bazaarone_session=1') ||
          document.cookie.includes('token=');
      } catch {}
    }

    if (!force && !hasSession) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout to prevent hanging on cold starts

    try {
      const res = await fetch('/api/auth/me', {
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        setUser(data.data.user);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, 'true');
        } catch {}
        return data.data.user;
      } else {
        setUser(null);
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {}
        return null;
      }
    } catch {
      clearTimeout(timeoutId);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    const authUser: AuthUser = data.data.user;
    setUser(authUser);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {}
    return authUser;
  };

  const register = async (formData: any): Promise<AuthUser> => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      credentials: 'include',
      body: isFormData ? formData : JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const detailMsg = data.errors.map((e) => (e.field ? (e.field + ': ' + e.message) : e.message)).join(' | ');
        throw new Error(detailMsg || data.message || 'Registration failed.');
      }
      throw new Error(data.message || 'Registration failed.');
    }

    const authUser: AuthUser = data.data.user;
    setUser(authUser);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {}
    return authUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    setUser(null);
    setIsLoading(false);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, setAuthUser, logout, refreshUser }}>
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
