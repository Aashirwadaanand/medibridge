import { DEMO_MODE } from '../../config/appMode';
import { demoNotificationService } from './demo';
import { prodNotificationService } from './prod';
export const notificationService = DEMO_MODE ? demoNotificationService : prodNotificationService;
export { demoNotificationService, prodNotificationService };
