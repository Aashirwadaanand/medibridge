import { DEMO_MODE } from '../../config/appMode';
import { demoHospitalService } from './demo';
import { prodHospitalService } from './prod';
export const hospitalService = DEMO_MODE ? demoHospitalService : prodHospitalService;
export { demoHospitalService, prodHospitalService };
