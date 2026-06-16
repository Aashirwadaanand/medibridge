import apiClient from './apiClient';
import { User } from '../types';
import { isDemoMode } from './mockData';

// Helper to get and save local storage lists
const getStoredList = <T>(key: string): T[] => {
  return JSON.parse(localStorage.getItem(key) || '[]');
};

const saveStoredList = <T>(key: string, list: T[]) => {
  localStorage.setItem(key, JSON.stringify(list));
};

export const adminService = {
  /**
   * Fetch all registered users
   */
  async getUsers(search?: string, role?: string, isActive?: boolean): Promise<User[]> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Gather users from different lists in localStorage
          const patients = getStoredList<any>('medibridge_demo_patients').map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: 'patient' as const,
            createdAt: p.createdAt || '2026-06-10T12:00:00Z',
            isActive: p.isActive !== undefined ? p.isActive : true
          }));

          const doctors = getStoredList<any>('medibridge_demo_doctors').map(d => ({
            id: d.id,
            name: d.name,
            email: d.email || `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@medibridge.com`,
            role: 'doctor' as const,
            createdAt: '2026-06-08T09:30:00Z',
            isActive: d.isActive !== undefined ? d.isActive : true
          }));

          const hospitals = getStoredList<any>('medibridge_demo_hospitals').map(h => ({
            id: h.id,
            name: h.name,
            email: h.email || 'hospital@medibridge.com',
            role: 'hospital' as const,
            createdAt: '2026-06-05T08:00:00Z',
            isActive: h.isActive !== undefined ? h.isActive : true
          }));

          const staticAdmin: User = {
            id: 'user_adm_01',
            name: 'System Operations Control',
            email: 'admin@medibridge.com',
            role: 'admin',
            createdAt: '2026-06-01T07:15:00Z',
            isActive: true
          };

          // Combine lists
          let allUsers: User[] = [staticAdmin, ...patients, ...doctors, ...hospitals];

          // Apply filters
          if (role) {
            allUsers = allUsers.filter(u => u.role === role);
          }
          if (isActive !== undefined) {
            allUsers = allUsers.filter(u => u.isActive === isActive);
          }
          if (search) {
            const term = search.toLowerCase();
            allUsers = allUsers.filter(u => 
              u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
            );
          }

          resolve(allUsers);
        }, 500);
      });
    }

    const params: any = {};
    if (search) params.search = search;
    if (role) params.role = role;
    if (isActive !== undefined) params.isActive = isActive;

    const response = await apiClient.get('/admin/users', { params });
    return response.data?.data?.users || [];
  },

  /**
   * Update user role
   */
  async updateUserRole(id: string, role: string): Promise<User> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let foundUser: any = null;
          
          // Search and update role in patients list
          const patients = getStoredList<any>('medibridge_demo_patients');
          const patIdx = patients.findIndex(p => p.id === id);
          if (patIdx > -1) {
            patients[patIdx].role = role;
            saveStoredList('medibridge_demo_patients', patients);
            foundUser = patients[patIdx];
          }

          // Search in doctors
          const doctors = getStoredList<any>('medibridge_demo_doctors');
          const docIdx = doctors.findIndex(d => d.id === id);
          if (docIdx > -1) {
            doctors[docIdx].role = role;
            saveStoredList('medibridge_demo_doctors', doctors);
            foundUser = doctors[docIdx];
          }

          // Search in hospitals
          const hospitals = getStoredList<any>('medibridge_demo_hospitals');
          const hospIdx = hospitals.findIndex(h => h.id === id);
          if (hospIdx > -1) {
            hospitals[hospIdx].role = role;
            saveStoredList('medibridge_demo_hospitals', hospitals);
            foundUser = hospitals[hospIdx];
          }

          if (foundUser) {
            resolve({
              id: foundUser.id,
              name: foundUser.name,
              email: foundUser.email || `${foundUser.name.toLowerCase().replace(/[^a-z]/g, '')}@medibridge.com`,
              role: role as any,
              isActive: foundUser.isActive !== undefined ? foundUser.isActive : true
            });
          } else {
            reject(new Error('User not found in demo database'));
          }
        }, 400);
      });
    }

    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data?.data?.user;
  },

  /**
   * Toggle user active/suspended status
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let foundUser: any = null;

          const patients = getStoredList<any>('medibridge_demo_patients');
          const patIdx = patients.findIndex(p => p.id === id);
          if (patIdx > -1) {
            patients[patIdx].isActive = isActive;
            saveStoredList('medibridge_demo_patients', patients);
            foundUser = patients[patIdx];
          }

          const doctors = getStoredList<any>('medibridge_demo_doctors');
          const docIdx = doctors.findIndex(d => d.id === id);
          if (docIdx > -1) {
            doctors[docIdx].isActive = isActive;
            saveStoredList('medibridge_demo_doctors', doctors);
            foundUser = doctors[docIdx];
          }

          const hospitals = getStoredList<any>('medibridge_demo_hospitals');
          const hospIdx = hospitals.findIndex(h => h.id === id);
          if (hospIdx > -1) {
            hospitals[hospIdx].isActive = isActive;
            saveStoredList('medibridge_demo_hospitals', hospitals);
            foundUser = hospitals[hospIdx];
          }

          if (foundUser) {
            resolve({
              id: foundUser.id,
              name: foundUser.name,
              email: foundUser.email || `${foundUser.name.toLowerCase().replace(/[^a-z]/g, '')}@medibridge.com`,
              role: foundUser.role || 'patient',
              isActive: isActive
            });
          } else {
            reject(new Error('User not found in demo database'));
          }
        }, 400);
      });
    }

    const response = await apiClient.patch(`/admin/users/${id}/status`, { isActive });
    return response.data?.data?.user;
  },

  /**
   * Delete user account
   */
  async deleteUser(id: string): Promise<void> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const patients = getStoredList<any>('medibridge_demo_patients');
          const patFiltered = patients.filter(p => p.id !== id);
          saveStoredList('medibridge_demo_patients', patFiltered);

          const doctors = getStoredList<any>('medibridge_demo_doctors');
          const docFiltered = doctors.filter(d => d.id !== id);
          saveStoredList('medibridge_demo_doctors', docFiltered);

          const hospitals = getStoredList<any>('medibridge_demo_hospitals');
          const hospFiltered = hospitals.filter(h => h.id !== id);
          saveStoredList('medibridge_demo_hospitals', hospFiltered);

          resolve();
        }, 400);
      });
    }

    await apiClient.delete(`/admin/users/${id}`);
  },

  /**
   * Fetch database telemetry and metrics
   */
  async getStats(): Promise<any> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const patients = getStoredList<any>('medibridge_demo_patients');
          const doctors = getStoredList<any>('medibridge_demo_doctors');
          const hospitals = getStoredList<any>('medibridge_demo_hospitals');
          const appointments = getStoredList<any>('medibridge_demo_appointments');
          const prescriptions = getStoredList<any>('medibridge_demo_prescriptions');
          const reports = getStoredList<any>('medibridge_demo_reports');
          const medicines = getStoredList<any>('medibridge_demo_medicines');
          const notifications = getStoredList<any>('medibridge_demo_notifications');

          resolve({
            db: {
              status: 'Connected (Simulated)',
              collections: {
                users: patients.length + doctors.length + hospitals.length + 1,
                appointments: appointments.length,
                hospitals: hospitals.length,
                medicines: medicines.length,
                notifications: notifications.length,
                prescriptions: prescriptions.length,
                reports: reports.length
              }
            },
            system: {
              uptime: 86420,
              memory: {
                total: 16 * 1024 * 1024 * 1024,
                free: 6.2 * 1024 * 1024 * 1024,
                usagePercentage: 61
              },
              cpuLoad: [0.85, 0.42, 0.28],
              activeSessions: 142
            },
            users: {
              total: patients.length + doctors.length + hospitals.length + 1,
              roles: {
                patient: patients.length,
                doctor: doctors.length,
                hospital: hospitals.length,
                pharmacy: 0,
                admin: 1
              }
            }
          });
        }, 600);
      });
    }

    const response = await apiClient.get('/admin/stats');
    return response.data?.data?.stats;
  },

  /**
   * Dispatch system notification
   */
  async broadcastNotification(
    title: string,
    message: string,
    type: string,
    targetRole?: string
  ): Promise<any> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const notifications = getStoredList<any>('medibridge_demo_notifications');
          const patients = getStoredList<any>('medibridge_demo_patients');

          // Target specific users
          let targets = patients;
          if (targetRole && targetRole !== 'all' && targetRole !== 'patient') {
            // In demo mode we only store patient notifications, so general targets map to patient demo list for display purposes
            targets = patients;
          }

          targets.forEach((p, idx) => {
            notifications.unshift({
              id: `not_broadcast_${Date.now()}_${idx}`,
              userId: p.id,
              title,
              message,
              type: type || 'general',
              isRead: false,
              createdAt: new Date().toISOString()
            });
          });

          saveStoredList('medibridge_demo_notifications', notifications);

          resolve({
            sentCount: targets.length
          });
        }, 800);
      });
    }

    const response = await apiClient.post('/admin/notifications/broadcast', {
      title,
      message,
      type,
      targetRole
    });
    return response.data?.data;
  }
};

export default adminService;
