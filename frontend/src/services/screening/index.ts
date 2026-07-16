import { DEMO_MODE } from '../../config/appMode';
import { demoScreeningService } from './demo';
import { prodScreeningService } from './prod';

export const screeningService = DEMO_MODE ? demoScreeningService : prodScreeningService;
export { demoScreeningService, prodScreeningService };
