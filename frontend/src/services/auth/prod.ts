/**
 * services/auth/prod.ts
 *
 * Production-only auth implementation. Communicates exclusively with the
 * Railway backend via JWT. Never touches demo data or mock users.
 */
import { IAuthService } from '../../core/interfaces/IAuthService';
import { User } from '../../types';
import { STORAGE } from '../../config/appMode';
import apiClient from '../apiClient';

export const prodAuthService: IAuthService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data?.status === 'success' && response.data?.data) {
      const { token, user } = response.data.data;
      localStorage.setItem(STORAGE.TOKEN, token);
      localStorage.setItem(STORAGE.USER, JSON.stringify(user));
      return { token, user };
    }
    throw new Error(response.data?.message || 'Login failed.');
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<{ token: string; user: User }> {
    const response = await apiClient.post('/auth/register', { name, email, password, role });
    if (response.data?.status === 'success' && response.data?.data) {
      const { token, user } = response.data.data;
      localStorage.setItem(STORAGE.TOKEN, token);
      localStorage.setItem(STORAGE.USER, JSON.stringify(user));
      return { token, user };
    }
    throw new Error(response.data?.message || 'Registration failed.');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    }
    throw new Error(response.data?.message || 'Failed to retrieve profile.');
  },

  logout(): void {
    localStorage.removeItem(STORAGE.TOKEN);
    localStorage.removeItem(STORAGE.USER);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE.TOKEN);
  },
};
