import { DEMO_MODE } from '../../config/appMode';
import { demoPrescriptionService } from './demo';
import { prodPrescriptionService } from './prod';
export const prescriptionService = DEMO_MODE ? demoPrescriptionService : prodPrescriptionService;
export { demoPrescriptionService, prodPrescriptionService };
