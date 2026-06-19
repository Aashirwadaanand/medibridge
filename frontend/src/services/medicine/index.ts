import { DEMO_MODE } from '../../config/appMode';
import { demoMedicineService } from './demo';
import { prodMedicineService } from './prod';
export const medicineService = DEMO_MODE ? demoMedicineService : prodMedicineService;
export { demoMedicineService, prodMedicineService };
