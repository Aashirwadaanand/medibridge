/**
 * services/auth/demo.ts
 *
 * Demo-only auth implementation. Never calls Railway or MongoDB.
 * All data comes from the demo-db JSON dataset.
 */
import { IAuthService } from '../../core/interfaces/IAuthService';
import { User } from '../../types';
import { STORAGE, delay } from '../../config/appMode';
import usersDb from '../../demo-db/users.json';

// Credential + role lookup maps (derived from the JSON dataset)
const CREDENTIALS = usersDb.credentials as Record<string, string>;
const EMAIL_TO_ROLE = usersDb.emailToRole as Record<string, string>;
// Cast via unknown — the JSON has extra keys (credentials, emailToRole, allUsers)
// that don't match User shape, but we only access the role-keyed entries.
const DEMO_USERS = usersDb as unknown as Record<string, User & { token: string }>;

export const demoAuthService: IAuthService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    await delay(700);

    const expectedPassword = CREDENTIALS[email];
    const role = EMAIL_TO_ROLE[email];

    if (!expectedPassword || password !== expectedPassword || !role) {
      throw new Error(
        'Invalid demo credentials. Try: patient@medibridge.com / patient123'
      );
    }

    const user: User = DEMO_USERS[role];
    const token: string = user.token!;

    // Store in demo-scoped keys only
    localStorage.setItem(STORAGE.TOKEN, token);
    localStorage.setItem(STORAGE.USER, JSON.stringify(user));

    return { token, user };
  },

  async register(
    name: string,
    email: string,
    _password: string,
    role: string
  ): Promise<{ token: string; user: User }> {
    await delay(800);

    const newUser: User = {
      id: `demo_user_${Date.now()}`,
      name,
      email,
      role: role as User['role'],
      token: `demo-jwt-${role}-${Date.now()}-NOT-REAL`,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    localStorage.setItem(STORAGE.TOKEN, newUser.token!);
    localStorage.setItem(STORAGE.USER, JSON.stringify(newUser));

    return { token: newUser.token!, user: newUser };
  },

  async getCurrentUser(): Promise<User> {
    await delay(200);

    const saved = localStorage.getItem(STORAGE.USER);
    if (!saved) {
      throw new Error('No demo session found. Please log in.');
    }
    return JSON.parse(saved) as User;
  },

  logout(): void {
    localStorage.removeItem(STORAGE.TOKEN);
    localStorage.removeItem(STORAGE.USER);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE.TOKEN);
  },
};

/**
 * Demo-only helper — switches the active demo user to a different role.
 * Only used by the Navbar Quick Role Switcher (visible in demo mode only).
 */
export function switchDemoRole(role: string): void {
  const user = DEMO_USERS[role];
  if (!user) return;
  localStorage.setItem(STORAGE.TOKEN, user.token!);
  localStorage.setItem(STORAGE.USER, JSON.stringify(user));
  window.location.href = `/${role}`;
}
