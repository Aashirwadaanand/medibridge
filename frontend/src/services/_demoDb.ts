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
import screeningsJson from '../demo-db/screenings.json';
import villagesJson from '../demo-db/villages.json';

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
  if (localStorage.getItem(STORAGE.DEMO_DB.SEEDED) && localStorage.getItem(STORAGE.DEMO_DB.SCREENING_REQUESTS)) return;

  localStorage.setItem(STORAGE.DEMO_DB.APPOINTMENTS, JSON.stringify(appointmentsJson));
  localStorage.setItem(STORAGE.DEMO_DB.PRESCRIPTIONS, JSON.stringify(prescriptionsJson));
  localStorage.setItem(STORAGE.DEMO_DB.HOSPITALS, JSON.stringify(hospitalsJson));
  localStorage.setItem(STORAGE.DEMO_DB.NOTIFICATIONS, JSON.stringify(notificationsJson));
  localStorage.setItem(STORAGE.DEMO_DB.REPORTS, JSON.stringify(reportsJson));
  localStorage.setItem(STORAGE.DEMO_DB.MEDICINES, JSON.stringify(medicinesJson));
  localStorage.setItem(STORAGE.DEMO_DB.SCREENINGS, JSON.stringify(screeningsJson));
  localStorage.setItem(STORAGE.DEMO_DB.VILLAGES, JSON.stringify(villagesJson));

  // Seed default screening requests
  const defaultRequests = [
    {
      id: 'req_01',
      patientId: 'user_pat_06',
      patientName: 'Priya Patel (Pregnant)',
      villageId: 'vil_03',
      screeningType: 'Anemia Screening',
      symptoms: 'Mild fatigue, weakness',
      preferredDate: '2026-07-17',
      preferredTime: '10:00 AM',
      notes: 'Please check hemoglobin levels.',
      status: 'requested',
      createdAt: new Date().toISOString()
    },
    {
      id: 'req_02',
      patientId: 'user_pat_01',
      patientName: 'Anshuman Das',
      villageId: 'vil_01',
      screeningType: 'Blood Pressure Screening',
      symptoms: 'Frequent headaches',
      preferredDate: '2026-07-18',
      preferredTime: '11:30 AM',
      notes: 'Family history of high blood pressure.',
      status: 'accepted',
      assignedChwId: 'user_chw_01',
      assignedChwName: 'Ramesh Kumar',
      createdAt: new Date().toISOString()
    },
    {
      id: 'req_03',
      patientId: 'user_pat_07',
      patientName: 'Rahul Kumar (Child)',
      villageId: 'vil_01',
      screeningType: 'Diabetes Screening',
      symptoms: 'Increased thirst',
      preferredDate: '2026-07-19',
      preferredTime: '09:00 AM',
      notes: 'Routine pediatric checkup.',
      status: 'scheduled',
      assignedChwId: 'user_chw_01',
      assignedChwName: 'Ramesh Kumar',
      scheduledVisitDate: '2026-07-17',
      createdAt: new Date().toISOString()
    },
    {
      id: 'req_04',
      patientId: 'user_pat_05',
      patientName: 'Aditi Sharma (Adolescent)',
      villageId: 'vil_02',
      screeningType: 'General Health Check',
      symptoms: 'General wellness check',
      preferredDate: '2026-07-15',
      preferredTime: '02:00 PM',
      notes: 'Completed checkup yesterday.',
      status: 'completed',
      assignedChwId: 'user_chw_01',
      assignedChwName: 'Ramesh Kumar',
      scheduledVisitDate: '2026-07-15',
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(STORAGE.DEMO_DB.SCREENING_REQUESTS, JSON.stringify(defaultRequests));

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
