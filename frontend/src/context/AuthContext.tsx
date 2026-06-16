import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import authService from '../services/authService';

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
  const [token, setToken] = useState<string | null>(localStorage.getItem('medibridge_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('medibridge_user') ? JSON.parse(localStorage.getItem('medibridge_user')!).role : null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('medibridge_token');
      if (savedToken) {
        try {
          const fetchedUser = await authService.getCurrentUser();
          setUser(fetchedUser);
          setToken(savedToken);
          setRole(fetchedUser.role);
          localStorage.setItem('medibridge_user', JSON.stringify(fetchedUser));
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
          setSessionExpired(true);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to custom unauthorized event from API client interceptor
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
    localStorage.setItem('medibridge_token', data.token);
    localStorage.setItem('medibridge_user', JSON.stringify(data.user));
    
    // Store last login timestamp
    localStorage.setItem(`medibridge_last_login_${data.user.id}`, new Date().toISOString());
    
    return data.user;
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<User> => {
    setSessionExpired(false);
    const data = await authService.register(name, email, password, role);
    setToken(data.token);
    setUser(data.user);
    setRole(data.user.role);
    localStorage.setItem('medibridge_token', data.token);
    localStorage.setItem('medibridge_user', JSON.stringify(data.user));
    
    // Store last login timestamp
    localStorage.setItem(`medibridge_last_login_${data.user.id}`, new Date().toISOString());
    
    return data.user;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const updateProfileName = async (newName: string): Promise<void> => {
    if (!user) return;
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    localStorage.setItem('medibridge_user', JSON.stringify(updatedUser));
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
