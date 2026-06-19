/**
 * appMode.ts — Single source of truth for application mode.
 *
 * Mode is resolved at BUILD TIME from the VITE_DEMO_MODE environment variable.
 * It is a compile-time constant — not a runtime toggle.
 *
 * To run in Demo Mode:    VITE_DEMO_MODE=true  npm run dev
 * To run in Production:   VITE_DEMO_MODE=false npm run dev (or omit the variable)
 *
 * Adding a new environment (e.g. Staging) in the future:
 *   1. Add `STAGING = 'staging'` to AppMode enum
 *   2. Update resolveModeFromEnv() to handle VITE_APP_MODE=staging
 *   3. Create services/[domain]/staging.ts implementations
 *   4. Update each services/[domain]/index.ts dispatcher
 */

// ─── App Mode Enum ───────────────────────────────────────────────────────────

export enum AppMode {
  DEMO = 'demo',
  STAGING = 'staging',       // Reserved for future use
  PRODUCTION = 'production',
}

// ─── Mode Resolution ─────────────────────────────────────────────────────────

function resolveModeFromEnv(): AppMode {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return AppMode.DEMO;
  // Future: if (import.meta.env.VITE_APP_MODE === 'staging') return AppMode.STAGING;
  return AppMode.PRODUCTION;
}

export const CURRENT_MODE: AppMode = resolveModeFromEnv();

/**
 * Boolean shorthand — use this in dispatchers and contexts.
 * Never use this inside UI components for service branching.
 */
export const DEMO_MODE: boolean = CURRENT_MODE === AppMode.DEMO;

// ─── Storage Keys ────────────────────────────────────────────────────────────

/**
 * Completely separate localStorage namespaces prevent any collision
 * between demo sessions and real user sessions.
 */
export const STORAGE = {
  /** JWT token key — never shared between modes */
  TOKEN: DEMO_MODE ? 'demo_medibridge_token' : 'medibridge_token',
  /** Serialized User object key */
  USER: DEMO_MODE ? 'demo_medibridge_user' : 'medibridge_user',
  /** Notifications namespace prefix — appended with userId */
  NOTIFICATIONS_PREFIX: DEMO_MODE ? 'demo_medibridge_notifications_' : 'medibridge_notifications_',
  /** Demo database namespace — only written in demo mode */
  DEMO_DB: {
    USERS:         'demo_db_users',
    APPOINTMENTS:  'demo_db_appointments',
    PRESCRIPTIONS: 'demo_db_prescriptions',
    HOSPITALS:     'demo_db_hospitals',
    NOTIFICATIONS: 'demo_db_notifications',
    REPORTS:       'demo_db_reports',
    MEDICINES:     'demo_db_medicines',
    SEEDED:        'demo_db_seeded',
  },
} as const;

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Simulates realistic network latency in demo services. */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Production API base URL. Demo services never use this. */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || 'https://medibridge-production-162c.up.railway.app/api';
