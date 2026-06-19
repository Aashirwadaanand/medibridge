import { User } from '../../types';

export interface IAuthService {
  login(email: string, password: string): Promise<{ token: string; user: User }>;
  register(name: string, email: string, password: string, role: string): Promise<{ token: string; user: User }>;
  getCurrentUser(): Promise<User>;
  logout(): void;
  isAuthenticated(): boolean;
}
