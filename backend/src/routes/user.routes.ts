import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  completeProfileSchema,
  updateProfileSchema,
  toggleAvailabilitySchema,
} from '../validators/user.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.post('/profile', validate(completeProfileSchema), userController.completeProfile.bind(userController));
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', validate(updateProfileSchema), userController.updateProfile.bind(userController));
router.patch('/availability', validate(toggleAvailabilitySchema), userController.toggleAvailability.bind(userController));

export default router;

