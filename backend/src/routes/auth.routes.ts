import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/challenge
 * @desc    Generate a challenge for wallet signature
 * @access  Public
 */
router.post('/challenge', AuthController.generateChallenge);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify signature and authenticate
 * @access  Public
 */
router.post('/verify', AuthController.verifySignature);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, AuthController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, AuthController.updateProfile);

export default router; 