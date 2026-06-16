import apiClient from './apiClient';
import { User } from '../types';
import { mockUsers, isDemoMode } from './mockData';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let role: string | null = null;
          if (email === 'patient@medibridge.com' && password === 'patient123') role = 'patient';
          else if (email === 'doctor@medibridge.com' && password === 'doctor123') role = 'doctor';
          else if (email === 'hospital@medibridge.com' && password === 'hospital123') role = 'hospital';
          else if (email === 'admin@medibridge.com' && password === 'admin123') role = 'admin';

          if (role && mockUsers[role]) {
            resolve({
              token: mockUsers[role].token || `mock-jwt-token-${role}`,
              user: mockUsers[role]
            });
          } else {
            reject(new Error('Invalid demo credentials. Use patient@medibridge.com / patient123, etc.'));
          }
        }, 800);
      });
    }

    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data?.status === 'success' && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Login failed.');
  },

  async register(name: string, email: string, password: string, role: string): Promise<{ token: string; user: User }> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newUser: User = {
            id: `user_pat_${Date.now()}`,
            name,
            email,
            role: role as any,
            token: `mock-jwt-token-${role}`,
            createdAt: new Date().toISOString()
          };
          resolve({
            token: newUser.token!,
            user: newUser
          });
        }, 800);
      });
    }

    const response = await apiClient.post('/auth/register', { name, email, password, role });
    if (response.data?.status === 'success' && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Registration failed.');
  },

  logout(): void {
    localStorage.removeItem('medibridge_token');
    localStorage.removeItem('medibridge_user');
  },

  async getCurrentUser(): Promise<User> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        const savedUser = localStorage.getItem('medibridge_user');
        if (savedUser) {
          resolve(JSON.parse(savedUser));
        } else {
          reject(new Error('No authenticated user found in demo context.'));
        }
      });
    }

    const response = await apiClient.get('/auth/profile');
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    }
    throw new Error(response.data?.message || 'Failed to retrieve profile.');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('medibridge_token');
    return !!token;
  }
};

export default authService;
