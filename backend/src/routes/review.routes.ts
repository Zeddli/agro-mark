import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { auth, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/reviews/users/:userId
 * @desc    Get reviews for a specific user
 * @access  Public
 */
router.get('/users/:userId', ReviewController.getUserReviews);

/**
 * @route   GET /api/reviews/users/:userId/stats
 * @desc    Get review statistics for a user
 * @access  Public
 */
router.get('/users/:userId/stats', ReviewController.getUserReviewStats);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a single review by ID
 * @access  Public
 */
router.get('/:id', ReviewController.getReviewById);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', auth, ReviewController.createReview);

export default router; 