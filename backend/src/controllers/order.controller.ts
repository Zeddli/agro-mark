import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { CacheService } from '../services/cache.service';
import { formatError } from '../utils/validation.utils';
import { OrderStatus } from '@prisma/client';

/**
 * Order controller for the marketplace
 */
export class OrderController {
  /**
   * Create a new order
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { productId, quantity, shippingAddress } = req.body;

      // Validate required fields
      if (!productId || !quantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Product ID and quantity are required',
        });
      }

      // Parse quantity to number
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Quantity must be a positive number',
        });
      }

      // Create the order
      const order = await OrderService.createOrder(
        userId,
        productId,
        parsedQuantity,
        shippingAddress
      );

      // Clear user orders cache
      await CacheService.clearByPattern(`orders:user:${userId}:*`);

      return res.status(201).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof Error) {
        if (error.message.includes('Product not found')) {
          return res.status(404).json({
            status: 'error',
            message: 'Product not found',
          });
        }
        if (error.message.includes('not available') || 
            error.message.includes('Not enough quantity') ||
            error.message.includes('own product')) {
          return res.status(400).json({
            status: 'error',
            message: error.message,
          });
        }
      }
      return res.status(500).json(formatError(error, 'Server error while creating order'));
    }
  }

  /**
   * Get user's orders (as buyer or seller)
   */
  static async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { 
        role = 'all', 
        status, 
        page = '1', 
        limit = '10' 
      } = req.query;

      // Parse pagination params
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      // Validate role
      if (role !== 'buyer' && role !== 'seller' && role !== 'all') {
        return res.status(400).json({
          status: 'error',
          message: 'Role must be "buyer", "seller", or "all"',
        });
      }

      // Generate cache key
      const cacheKey = `orders:user:${userId}:${role}:${status || 'all'}:${pageNum}:${limitNum}`;

      // Get orders with caching
      const result = await CacheService.getOrSet(
        cacheKey,
        () => OrderService.getUserOrders(
          userId,
          role as 'buyer' | 'seller' | 'all',
          status as OrderStatus,
          pageNum,
          limitNum
        ),
        300 // Cache for 5 minutes
      );

      return res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return res.status(500).json(formatError(error, 'Server error while fetching orders'));
    }
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      // Generate cache key
      const cacheKey = `order:${id}:${userId}`;

      // Get order with caching
      const order = await CacheService.getOrSet(
        cacheKey,
        () => OrderService.getOrderById(id, userId),
        300 // Cache for 5 minutes
      );

      return res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          return res.status(404).json({
            status: 'error',
            message: 'Order not found',
          });
        }
        if (error.message.includes('permission')) {
          return res.status(403).json({
            status: 'error',
            message: error.message,
          });
        }
      }
      return res.status(500).json(formatError(error, 'Server error while fetching order'));
    }

  /**
   * Update order status
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { status, trackingNumber } = req.body;

      // Validate status
      if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid order status is required',
        });
      }

      // Update order status
      const updatedOrder = await OrderService.updateOrderStatus(
        id,
        userId,
        status as OrderStatus,
        trackingNumber
      );

      // Clear related caches
      await Promise.all([
        CacheService.del(`order:${id}:${userId}`),
        CacheService.clearByPattern(`orders:user:${userId}:*`),
        // Clear cache for the other party in the transaction
        updatedOrder.buyerId !== userId 
          ? CacheService.clearByPattern(`orders:user:${updatedOrder.buyerId}:*`) 
          : CacheService.clearByPattern(`orders:user:${updatedOrder.sellerId}:*`)
      ]);

      return res.status(200).json({
        status: 'success',
        data: { order: updatedOrder }
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          return res.status(404).json({
            status: 'error',
            message: 'Order not found',
          });
        }
        if (error.message.includes('authorized') || 
            error.message.includes('transition') ||
            error.message.includes('required')) {
          return res.status(400).json({
            status: 'error',
            message: error.message,
          });
        }
      }
      return res.status(500).json(formatError(error, 'Server error while updating order status'));
    }
  }
} 