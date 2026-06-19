/**
 * services/auth/index.ts — Dispatcher
 *
 * Selects the correct auth implementation at build time.
 * Components import from 'services/authService' (the legacy shim) or
 * directly from here — either way they receive the correct instance.
 */
import { DEMO_MODE } from '../../config/appMode';
import { demoAuthService } from './demo';
import { prodAuthService } from './prod';

export const authService = DEMO_MODE ? demoAuthService : prodAuthService;

// Named re-export for direct imports
export { demoAuthService, prodAuthService };

// Re-export the demo-only helper (tree-shaken in prod builds)
export { switchDemoRole } from './demo';
