import { INotificationService } from '../../core/interfaces/INotificationService';
import { Notification } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';

const KEY = STORAGE.DEMO_DB.NOTIFICATIONS;

function getNotifications(): Notification[] {
  seedDemoDb();
  return getCollection<Notification>(KEY);
}

export const demoNotificationService: INotificationService = {
  async getNotifications(): Promise<Notification[]> {
    await delay(400);
    return getNotifications();
  },

  async markAsRead(id: string): Promise<Notification> {
    await delay(200);
    const list = getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Notification not found');
    list[idx] = { ...list[idx], isRead: true };
    saveCollection(KEY, list);
    return list[idx];
  },

  async deleteNotification(id: string): Promise<void> {
    await delay(200);
    const list = getNotifications().filter((n) => n.id !== id);
    saveCollection(KEY, list);
  },
};
