import { IAdminService, AdminStats } from '../../core/interfaces/IAdminService';
import { User } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';
import usersDb from '../../demo-db/users.json';

function getAllUsers(): User[] {
  seedDemoDb();
  return (usersDb.allUsers as User[]).map((u) => ({ ...u, isActive: u.isActive ?? true }));
}

export const demoAdminService: IAdminService = {
  async getUsers(search?: string, role?: string, isActive?: boolean): Promise<User[]> {
    await delay(500);
    let users = getAllUsers();
    if (role) users = users.filter((u) => u.role === role);
    if (isActive !== undefined) users = users.filter((u) => u.isActive === isActive);
    if (search) {
      const term = search.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      );
    }
    return users;
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    await delay(400);
    const users = getAllUsers();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('User not found in demo database');
    return { ...user, role: role as User['role'] };
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    await delay(400);
    const users = getAllUsers();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('User not found in demo database');
    return { ...user, isActive };
  },

  async deleteUser(_id: string): Promise<void> {
    await delay(400);
    // In demo mode deletion is simulated — no persistent delete
  },

  async getStats(): Promise<AdminStats> {
    await delay(600);
    const appts = getCollection(STORAGE.DEMO_DB.APPOINTMENTS);
    const presc = getCollection(STORAGE.DEMO_DB.PRESCRIPTIONS);
    const hosp = getCollection(STORAGE.DEMO_DB.HOSPITALS);
    const meds = getCollection(STORAGE.DEMO_DB.MEDICINES);
    const notifs = getCollection(STORAGE.DEMO_DB.NOTIFICATIONS);
    const reports = getCollection(STORAGE.DEMO_DB.REPORTS);
    const users = getAllUsers();
    const roles = users.reduce((acc: Record<string, number>, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    return {
      db: {
        status: 'Connected (Demo Simulation)',
        collections: {
          users: users.length,
          appointments: appts.length,
          hospitals: hosp.length,
          medicines: meds.length,
          notifications: notifs.length,
          prescriptions: presc.length,
          reports: reports.length,
        },
      },
      system: {
        uptime: 86420,
        memory: {
          total: 16 * 1024 * 1024 * 1024,
          free: 6.2 * 1024 * 1024 * 1024,
          usagePercentage: 61,
        },
        cpuLoad: [0.85, 0.42, 0.28],
        activeSessions: 142,
      },
      users: { total: users.length, roles },
    };
  },

  async broadcastNotification(
    title: string,
    message: string,
    type: string,
    _targetRole?: string
  ): Promise<{ sentCount: number }> {
    await delay(800);
    const notifs = getCollection<any>(STORAGE.DEMO_DB.NOTIFICATIONS);
    const newNotif = {
      id: `notif_broadcast_${Date.now()}`,
      userId: 'user_pat_01',
      title,
      message,
      type: type || 'general',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    saveCollection(STORAGE.DEMO_DB.NOTIFICATIONS, notifs);
    return { sentCount: getAllUsers().length };
  },
};
