import { IAdminService, AdminStats } from '../../core/interfaces/IAdminService';
import { User } from '../../types';
import apiClient from '../apiClient';

export const prodAdminService: IAdminService = {
  async getUsers(search?: string, role?: string, isActive?: boolean): Promise<User[]> {
    const params: Record<string, unknown> = {};
    if (search) params.search = search;
    if (role) params.role = role;
    if (isActive !== undefined) params.isActive = isActive;
    const response = await apiClient.get('/admin/users', { params });
    return response.data?.data?.users || [];
  },
  async updateUserRole(id: string, role: string): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data?.data?.user;
  },
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { isActive });
    return response.data?.data?.user;
  },
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data?.data?.stats;
  },
  async broadcastNotification(
    title: string,
    message: string,
    type: string,
    targetRole?: string
  ): Promise<{ sentCount: number }> {
    const response = await apiClient.post('/admin/notifications/broadcast', { title, message, type, targetRole });
    return response.data?.data;
  },
};
