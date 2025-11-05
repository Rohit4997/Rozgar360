import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { addReviewSchema } from '../validators/review.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Review routes
router.post('/', validate(addReviewSchema), reviewController.addReview.bind(reviewController));
router.get('/:userId', reviewController.getReviews.bind(reviewController));
router.delete('/:id', reviewController.deleteReview.bind(reviewController));

export default router;

