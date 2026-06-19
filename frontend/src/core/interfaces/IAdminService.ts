import { User } from '../../types';

export interface AdminStats {
  db: {
    status: string;
    collections: Record<string, number>;
  };
  system: {
    uptime: number;
    memory: { total: number; free: number; usagePercentage: number };
    cpuLoad: number[];
    activeSessions: number;
  };
  users: {
    total: number;
    roles: Record<string, number>;
  };
}

export interface IAdminService {
  getUsers(search?: string, role?: string, isActive?: boolean): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserStatus(id: string, isActive: boolean): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getStats(): Promise<AdminStats>;
  broadcastNotification(title: string, message: string, type: string, targetRole?: string): Promise<{ sentCount: number }>;
}
