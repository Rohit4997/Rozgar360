import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import labourRoutes from './labour.routes';
import reviewRoutes from './review.routes';
import contactRoutes from './contact.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Rozgar360 API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/labours', labourRoutes);
router.use('/reviews', reviewRoutes);
router.use('/contacts', contactRoutes);

export default router;

