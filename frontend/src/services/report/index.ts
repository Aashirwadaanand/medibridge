import { DEMO_MODE } from '../../config/appMode';
import { demoReportService } from './demo';
import { prodReportService } from './prod';
export const reportService = DEMO_MODE ? demoReportService : prodReportService;
export { demoReportService, prodReportService };
