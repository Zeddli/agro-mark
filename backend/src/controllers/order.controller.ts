import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Order controller for managing purchase orders
 */
export class OrderController {
  /**
   * Get orders for the authenticated user (both as buyer and seller)
   * Can be filtered by type: 'buying', 'selling', or 'all'
   */
  static async getMyOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { type = 'all', status, page = '1', limit = '10' } = req.query;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      // Parse pagination params
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter conditions
      const where: any = {};
      
      // Filter by order type (buying/selling)
      if (type === 'buying') {
        where.buyerId = userId;
      } else if (type === 'selling') {
        where.sellerId = userId;
      } else {
        // For 'all', show both buying and selling orders
        where.OR = [
          { buyerId: userId },
          { sellerId: userId }
        ];
      }
      
      // Filter by status if provided
      if (status) {
        where.status = status as OrderStatus;
      }

      // Get orders with pagination
      const orders = await prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
          buyer: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          },
          seller: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          }
        }
      });

      // Get total count for pagination
      const totalCount = await prisma.order.count({ where });
      const totalPages = Math.ceil(totalCount / limitNum);

      return res.status(200).json({
        status: 'success',
        data: {
          orders,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
          }
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching orders',
      });
    }
  }

  /**
   * Get a single order by ID
   * User must be either the buyer or seller
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

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          product: true,
          buyer: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          },
          seller: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
      }

      // Check if user is either buyer or seller
      if (order.buyerId !== userId && order.sellerId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view this order',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          order,
        }
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching order details',
      });
    }
  }

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

      const {
        productId,
        quantity,
        shippingAddress
      } = req.body;

      // Validate required fields
      if (!productId || !quantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields',
        });
      }

      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      // Prevent buying own products
      if (product.sellerId === userId) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot purchase your own product',
        });
      }

      // Check product availability
      if (product.status !== 'ACTIVE') {
        return res.status(400).json({
          status: 'error',
          message: 'This product is not available for purchase',
        });
      }

      // Check quantity
      if (quantity > product.quantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Requested quantity exceeds available stock',
        });
      }

      // Calculate total price
      const totalPrice = product.price * quantity;

      // Create order
      const order = await prisma.order.create({
        data: {
          buyerId: userId,
          sellerId: product.sellerId,
          productId,
          quantity,
          totalPrice,
          currency: product.currency,
          status: 'CREATED',
          shippingAddress,
        }
      });

      return res.status(201).json({
        status: 'success',
        data: {
          order,
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while creating order',
      });
    }
  }

  /**
   * Update order status
   * Different actions allowed based on current status and user role
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { status, trackingNumber } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'New status is required',
        });
      }

      // Get current order
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          product: true,
        }
      });

      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
      }

      // Verify user is either buyer or seller
      const isBuyer = order.buyerId === userId;
      const isSeller = order.sellerId === userId;

      if (!isBuyer && !isSeller) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this order',
        });
      }

      // Validate state transitions
      let isValidTransition = false;
      let updateData: any = { status };

      // Add tracking number if provided by seller
      if (isSeller && trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }

      // Validate transitions based on user role and current status
      if (isBuyer) {
        // Buyer can only mark as FUNDED, COMPLETED or DISPUTED
        if (
          (order.status === 'CREATED' && status === 'FUNDED') ||
          (order.status === 'SHIPPED' && status === 'COMPLETED') ||
          (['CREATED', 'FUNDED', 'SHIPPED'].includes(order.status) && status === 'DISPUTED')
        ) {
          isValidTransition = true;
        }
      } else if (isSeller) {
        // Seller can only mark as SHIPPED, CANCELLED or REFUNDED
        if (
          (order.status === 'FUNDED' && status === 'SHIPPED') ||
          (order.status === 'CREATED' && status === 'CANCELLED') ||
          (['FUNDED', 'DISPUTED'].includes(order.status) && status === 'REFUNDED')
        ) {
          isValidTransition = true;
        }
      }

      if (!isValidTransition) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status transition',
        });
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          product: true,
          buyer: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
            }
          },
          seller: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
            }
          }
        }
      });

      // If order is completed, update product's soldCount
      if (status === 'COMPLETED') {
        await prisma.product.update({
          where: { id: order.productId },
          data: {
            soldCount: {
              increment: order.quantity
            },
            // If all quantity is sold, mark as SOLD_OUT
            ...(order.product.quantity === order.quantity && {
              status: 'SOLD_OUT'
            })
          }
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          order: updatedOrder,
        }
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while updating order status',
      });
    }
  }
} 