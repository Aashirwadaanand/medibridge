import { DEMO_MODE } from '../../config/appMode';
import { demoAppointmentService } from './demo';
import { prodAppointmentService } from './prod';

export const appointmentService = DEMO_MODE ? demoAppointmentService : prodAppointmentService;
export { demoAppointmentService, prodAppointmentService };
