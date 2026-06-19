import { Notification } from '../../types';

export interface INotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  deleteNotification(id: string): Promise<void>;
}
