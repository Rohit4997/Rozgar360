import { Router } from 'express';
import contactController from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { trackContactSchema } from '../validators/contact.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Contact routes
router.post('/', validate(trackContactSchema), contactController.trackContact.bind(contactController));
router.get('/history', contactController.getHistory.bind(contactController));

export default router;

