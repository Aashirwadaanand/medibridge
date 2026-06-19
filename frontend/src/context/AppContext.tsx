import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Notification, NotificationType } from '../types';
import { mockUsers, mockNotifications, mockEmergencyState, EmergencyState } from '../services/mockData';
import { useAuth } from './AuthContext';

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('medibridge_role') as UserRole) || 'patient';
  });
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[role]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emergencyState, setEmergencyState] = useState<EmergencyState>(mockEmergencyState);

  useEffect(() => {
    if (user) {
      setRoleState(user.role);
      setCurrentUser(user);
    } else {
      setRoleState('patient');
      setCurrentUser(mockUsers.patient);
    }
  }, [user]);

  // Load user-specific notifications from localStorage
  useEffect(() => {
    if (currentUser && currentUser.id) {
      const stored = localStorage.getItem(`medibridge_notifications_${currentUser.id}`);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        const initial = mockNotifications.map((n, i) => ({
          ...n,
          userId: currentUser.id,
          id: `not_${Date.now()}_${i}`
        }));
        setNotifications(initial);
        localStorage.setItem(`medibridge_notifications_${currentUser.id}`, JSON.stringify(initial));
      }
    }
  }, [currentUser]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setCurrentUser(mockUsers[newRole]);
    localStorage.setItem('medibridge_role', newRole);
    localStorage.setItem('medibridge_token', mockUsers[newRole].token || '');
  };

  useEffect(() => {
    localStorage.setItem('medibridge_token', currentUser.token || '');
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, isRead: true } : n));
      if (currentUser && currentUser.id) {
        localStorage.setItem(`medibridge_notifications_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      if (currentUser && currentUser.id) {
        localStorage.setItem(`medibridge_notifications_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      if (currentUser && currentUser.id) {
        localStorage.setItem(`medibridge_notifications_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (currentUser && currentUser.id) {
      localStorage.setItem(`medibridge_notifications_${currentUser.id}`, JSON.stringify([]));
    }
  };

  const addNotification = (title: string, message: string, type: NotificationType) => {
    const newNotif: Notification = {
      id: `not_${Date.now()}`,
      userId: currentUser.id,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      if (currentUser && currentUser.id) {
        localStorage.setItem(`medibridge_notifications_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const triggerSOS = () => {
    setEmergencyState({
      riskLevel: 'CRITICAL',
      sosActive: true,
      sosTriggeredAt: new Date().toISOString(),
      ambulanceStatus: 'dispatched',
      ambulanceEtaMinutes: 8,
      ambulanceDistanceKm: 4.2
    });
    addNotification(
      'CRITICAL SOS ACTIVE',
      'Emergency SOS response triggered. Medical details and telemetry shared with Apollo Hospital Emergency Team.',
      'emergency'
    );
  };

  const resetSOS = () => {
    setEmergencyState({
      riskLevel: 'MODERATE',
      sosActive: false,
      ambulanceStatus: 'idle'
    });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (emergencyState.sosActive && emergencyState.ambulanceStatus === 'dispatched') {
      timer = setTimeout(() => {
        setEmergencyState(prev => ({
          ...prev,
          ambulanceStatus: 'en_route',
          ambulanceEtaMinutes: 5,
          ambulanceDistanceKm: 2.8
        }));
      }, 5000);
    } else if (emergencyState.sosActive && emergencyState.ambulanceStatus === 'en_route') {
      timer = setTimeout(() => {
        setEmergencyState(prev => ({
          ...prev,
          ambulanceStatus: 'arrived',
          ambulanceEtaMinutes: 0,
          ambulanceDistanceKm: 0
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
        resetSOS
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
