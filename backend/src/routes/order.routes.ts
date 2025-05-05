import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/orders
 * @desc    Get orders for the authenticated user
 * @access  Private
 */
router.get('/', auth, OrderController.getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 * @access  Private (buyer or seller only)
 */
router.get('/:id', auth, OrderController.getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', auth, OrderController.createOrder);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (buyer or seller with appropriate permissions)
 */
router.patch('/:id/status', auth, OrderController.updateOrderStatus);

export default router; 