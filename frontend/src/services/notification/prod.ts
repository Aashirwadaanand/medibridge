import { INotificationService } from '../../core/interfaces/INotificationService';
import { Notification } from '../../types';
import apiClient from '../apiClient';

export const prodNotificationService: INotificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications');
    return response.data?.data?.notifications || [];
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data?.data?.notification;
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
