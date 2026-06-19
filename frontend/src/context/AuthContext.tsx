import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/auth/index';
import { STORAGE } from '../config/appMode';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  setSessionExpired: (val: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
  updateProfileName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(STORAGE.TOKEN)
  );
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem(STORAGE.TOKEN);
      if (savedToken) {
        try {
          /**
           * In demo mode: demoAuthService.getCurrentUser() reads from
           * demo_medibridge_user — no Railway call is ever made.
           *
           * In production: prodAuthService.getCurrentUser() calls
           * /auth/profile and validates the real JWT with MongoDB.
           *
           * The "No authenticated user found in demo context" error is
           * IMPOSSIBLE in production because we never run demo code there.
           */
          const fetchedUser = await authService.getCurrentUser();
          setUser(fetchedUser);
          setToken(savedToken);
          setRole(fetchedUser.role);
          localStorage.setItem(STORAGE.USER, JSON.stringify(fetchedUser));
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
          setSessionExpired(true);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to 401 events from the API client (production only — demo never fires this)
    const handleUnauthorized = () => {
      logout();
      setSessionExpired(true);
    };

    window.addEventListener('medibridge-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('medibridge-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setSessionExpired(false);
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    setRole(data.user.role);
    // authService.login() already writes to the correct STORAGE.TOKEN key internally
    localStorage.setItem(`medibridge_last_login_${data.user.id}`, new Date().toISOString());
    return data.user;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<User> => {
    setSessionExpired(false);
    const data = await authService.register(name, email, password, role);
    setToken(data.token);
    setUser(data.user);
    setRole(data.user.role);
    localStorage.setItem(`medibridge_last_login_${data.user.id}`, new Date().toISOString());
    return data.user;
  };

  const logout = () => {
    authService.logout(); // clears the correct storage key (demo or prod)
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const updateProfileName = async (newName: string): Promise<void> => {
    if (!user) return;
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    localStorage.setItem(STORAGE.USER, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isAuthenticated,
        sessionExpired,
        setSessionExpired,
        login,
        register,
        logout,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
