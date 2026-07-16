import { Router } from 'express';
import ScreeningController from '../controllers/screening.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all endpoints
router.use(authenticateUser);

router
  .route('/')
  .post(authorizeRoles('chw', 'admin'), ScreeningController.createScreening)
  .get(authorizeRoles('chw', 'doctor', 'patient', 'admin'), ScreeningController.listScreenings);

router
  .route('/:id')
  .get(authorizeRoles('chw', 'doctor', 'patient', 'admin'), ScreeningController.getScreeningById);

router
  .route('/:id/review')
  .put(authorizeRoles('doctor', 'admin'), ScreeningController.reviewScreening);

export default router;
