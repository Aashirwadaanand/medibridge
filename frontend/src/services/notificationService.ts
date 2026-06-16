import apiClient from './apiClient';
import { Notification } from '../types';
import { mockNotifications, isDemoMode } from './mockData';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockNotifications]), 500);
      });
    }
    const response = await apiClient.get('/notifications');
    return response.data?.data?.notifications || [];
  },

  async markAsRead(id: string): Promise<Notification> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const notif = mockNotifications.find(n => n.id === id);
          if (notif) {
            notif.isRead = true;
            const stored = JSON.parse(localStorage.getItem('medibridge_demo_notifications') || '[]');
            const idx = stored.findIndex((n: any) => n.id === id);
            if (idx > -1) {
              stored[idx].isRead = true;
              localStorage.setItem('medibridge_demo_notifications', JSON.stringify(stored));
            }
            resolve({ ...notif });
          } else {
            reject(new Error('Notification not found'));
          }
        }, 200);
      });
    }
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data?.data?.notification;
  },

  async deleteNotification(id: string): Promise<void> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockNotifications.findIndex(n => n.id === id);
          if (index > -1) {
            mockNotifications.splice(index, 1);
          }
          const stored = JSON.parse(localStorage.getItem('medibridge_demo_notifications') || '[]');
          const idx = stored.findIndex((n: any) => n.id === id);
          if (idx > -1) {
            stored.splice(idx, 1);
            localStorage.setItem('medibridge_demo_notifications', JSON.stringify(stored));
          }
          resolve();
        }, 200);
      });
    }
    await apiClient.delete(`/notifications/${id}`);
  }
};

export default notificationService;
