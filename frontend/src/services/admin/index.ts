import { DEMO_MODE } from '../../config/appMode';
import { demoAdminService } from './demo';
import { prodAdminService } from './prod';
export const adminService = DEMO_MODE ? demoAdminService : prodAdminService;
export { demoAdminService, prodAdminService };
