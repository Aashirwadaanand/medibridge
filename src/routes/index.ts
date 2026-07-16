import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import appointmentRoutes from './appointment.routes';
import reportRoutes from './report.routes';
import prescriptionRoutes from './prescription.routes';
import hospitalRoutes from './hospital.routes';
import medicineRoutes from './medicine.routes';
import notificationRoutes from './notification.routes';
import aiRoutes from './ai.routes';
import adminRoutes from './admin.routes';
import screeningRoutes from './screening.routes';

const router = Router();

/**
 * Health Check Endpoint
 * GET /api/health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'MEDIBRIDGE Server is running healthy.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount authentication routes under '/auth'
router.use('/auth', authRoutes);

// Mount appointment routes under '/appointments'
router.use('/appointments', appointmentRoutes);

// Mount report routes under '/reports'
router.use('/reports', reportRoutes);

// Mount prescription routes under '/prescriptions'
router.use('/prescriptions', prescriptionRoutes);

// Mount hospital routes under '/hospitals'
router.use('/hospitals', hospitalRoutes);

// Mount medicine routes under '/medicines'
router.use('/medicines', medicineRoutes);

// Mount notification routes under '/notifications'
router.use('/notifications', notificationRoutes);

// Mount AI assistant routes under '/ai'
router.use('/ai', aiRoutes);

// Mount administrative routes under '/admin'
router.use('/admin', adminRoutes);

// Mount screening routes under '/screenings'
router.use('/screenings', screeningRoutes);

export default router;






