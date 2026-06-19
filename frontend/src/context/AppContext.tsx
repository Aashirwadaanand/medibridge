/**
 * AppContext.tsx
 *
 * Manages UI-layer state: current role, notifications, and emergency (SOS) state.
 *
 * Key changes from the old architecture:
 *  - currentUser is ALWAYS sourced from AuthContext — never from mockUsers.
 *  - No mock tokens are ever written to localStorage here.
 *  - setRole() only updates UI state; auth state is exclusively owned by AuthContext.
 *  - Notification storage keys use STORAGE.NOTIFICATIONS_PREFIX (mode-scoped).
 *  - mockEmergencyState is still used as the initial SOS state (it's UI-only data, not auth).
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Notification, NotificationType } from '../types';
import { mockEmergencyState, EmergencyState } from '../services/mockData';
import { useAuth } from './AuthContext';
import { STORAGE } from '../config/appMode';

// ─── Fallback user (no auth, no mock data) ───────────────────────────────────

const ANONYMOUS_USER: User = {
  id: 'anonymous',
  name: 'Guest',
  email: '',
  role: 'patient',
};

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User;
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (title: string, message: string, type: NotificationType) => void;
  emergencyState: EmergencyState;
  triggerSOS: () => void;
  resetSOS: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Role is derived from the authenticated user when available
  const [role, setRoleState] = useState<UserRole>(
    () => (localStorage.getItem('medibridge_role') as UserRole) || 'patient'
  );

  // currentUser always comes from AuthContext — never from mock datasets
  const [currentUser, setCurrentUser] = useState<User>(user ?? ANONYMOUS_USER);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emergencyState, setEmergencyState] = useState<EmergencyState>(mockEmergencyState);

  // ── Sync with AuthContext user ─────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setRoleState(user.role);
      setCurrentUser(user);
    } else {
      setRoleState('patient');
      setCurrentUser(ANONYMOUS_USER);
    }
  }, [user]);

  // ── Load mode-scoped notifications from localStorage ──────────────────────
  useEffect(() => {
    if (!currentUser?.id || currentUser.id === 'anonymous') return;
    const key = `${STORAGE.NOTIFICATIONS_PREFIX}${currentUser.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  // ── setRole ───────────────────────────────────────────────────────────────
  // Only updates UI role label — does NOT write mock tokens or override auth.
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('medibridge_role', newRole);
    // ✅ REMOVED: localStorage.setItem('medibridge_token', mockUsers[newRole].token)
    //    That line was corrupting real JWT sessions in production.
  };

  // ── Notification helpers ───────────────────────────────────────────────────
  const saveNotifications = (updated: Notification[]) => {
    const key = `${STORAGE.NOTIFICATIONS_PREFIX}${currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const addNotification = (title: string, message: string, type: NotificationType) => {
    const newNotif: Notification = {
      id: `not_${Date.now()}`,
      userId: currentUser.id,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveNotifications(updated);
      return updated;
    });
  };

  // ── SOS / Emergency ────────────────────────────────────────────────────────
  const triggerSOS = () => {
    setEmergencyState({
      riskLevel: 'CRITICAL',
      sosActive: true,
      sosTriggeredAt: new Date().toISOString(),
      ambulanceStatus: 'dispatched',
      ambulanceEtaMinutes: 8,
      ambulanceDistanceKm: 4.2,
    });
    addNotification(
      'CRITICAL SOS ACTIVE',
      'Emergency SOS triggered. Medical telemetry shared with Apollo Hospital Emergency Team.',
      'emergency'
    );
  };

  const resetSOS = () => {
    setEmergencyState({
      riskLevel: 'MODERATE',
      sosActive: false,
      ambulanceStatus: 'idle',
    });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (emergencyState.sosActive && emergencyState.ambulanceStatus === 'dispatched') {
      timer = setTimeout(() => {
        setEmergencyState((prev) => ({
          ...prev,
          ambulanceStatus: 'en_route',
          ambulanceEtaMinutes: 5,
          ambulanceDistanceKm: 2.8,
        }));
      }, 5000);
    } else if (emergencyState.sosActive && emergencyState.ambulanceStatus === 'en_route') {
      timer = setTimeout(() => {
        setEmergencyState((prev) => ({
          ...prev,
          ambulanceStatus: 'arrived',
          ambulanceEtaMinutes: 0,
          ambulanceDistanceKm: 0,
        }));
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [emergencyState.sosActive, emergencyState.ambulanceStatus]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        emergencyState,
        triggerSOS,
        resetSOS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
