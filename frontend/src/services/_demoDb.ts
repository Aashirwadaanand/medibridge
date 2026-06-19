/**
 * services/_demoDb.ts — Demo Database Helper
 *
 * Manages demo data lifecycle:
 *   1. Seeds localStorage from JSON files on first load.
 *   2. All reads and writes use demo_db_* keys (fully isolated from prod keys).
 *   3. Provides typed get/save helpers for each collection.
 *
 * Never imported by production service files.
 */
import { STORAGE } from '../config/appMode';
import appointmentsJson from '../demo-db/appointments.json';
import prescriptionsJson from '../demo-db/prescriptions.json';
import hospitalsJson from '../demo-db/hospitals.json';
import notificationsJson from '../demo-db/notifications.json';
import reportsJson from '../demo-db/reports.json';
import medicinesJson from '../demo-db/medicines.json';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getCollection<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  return JSON.parse(raw) as T[];
}

export function saveCollection<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

// ─── Seeding ─────────────────────────────────────────────────────────────────

/**
 * Seeds all demo collections from JSON files if not already seeded.
 * Call this once at app startup (from main.tsx or a DemoProvider).
 */
export function seedDemoDb(): void {
  if (localStorage.getItem(STORAGE.DEMO_DB.SEEDED)) return;

  localStorage.setItem(STORAGE.DEMO_DB.APPOINTMENTS, JSON.stringify(appointmentsJson));
  localStorage.setItem(STORAGE.DEMO_DB.PRESCRIPTIONS, JSON.stringify(prescriptionsJson));
  localStorage.setItem(STORAGE.DEMO_DB.HOSPITALS, JSON.stringify(hospitalsJson));
  localStorage.setItem(STORAGE.DEMO_DB.NOTIFICATIONS, JSON.stringify(notificationsJson));
  localStorage.setItem(STORAGE.DEMO_DB.REPORTS, JSON.stringify(reportsJson));
  localStorage.setItem(STORAGE.DEMO_DB.MEDICINES, JSON.stringify(medicinesJson));
  localStorage.setItem(STORAGE.DEMO_DB.SEEDED, 'true');
}

/**
 * Resets all demo collections back to the original JSON dataset.
 */
export function resetDemoDb(): void {
  localStorage.removeItem(STORAGE.DEMO_DB.SEEDED);
  seedDemoDb();
}

/**
 * Clears all demo localStorage keys.
 */
export function clearDemoDb(): void {
  Object.values(STORAGE.DEMO_DB).forEach((key) => localStorage.removeItem(key));
}
