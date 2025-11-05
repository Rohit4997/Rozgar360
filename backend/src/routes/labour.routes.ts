import { Router } from 'express';
import labourController from '../controllers/labour.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Labour routes
router.get('/', labourController.searchLabours.bind(labourController));
router.get('/nearby', labourController.getNearbyLabours.bind(labourController));
router.get('/:id', labourController.getLabourById.bind(labourController));

export default router;

