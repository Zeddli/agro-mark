import prisma from '../config/db.config';
import { SolanaService } from './solana.service';
import { OrderStatus, ProductStatus } from '@prisma/client';

// Initialize Solana service
const solanaService = new SolanaService();

/**
 * Service for handling order-related operations
 */
export class OrderService {
  /**
   * Create a new order
   * @param buyerId - ID of the buyer
   * @param productId - ID of the product being purchased
   * @param quantity - Quantity being purchased
   * @param shippingAddress - Delivery address for the order
   */
  static async createOrder(
    buyerId: string,
    productId: string,
    quantity: number,
    shippingAddress?: string
  ) {
    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Get the product and verify it's available
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { seller: true },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.status !== ProductStatus.ACTIVE) {
        throw new Error('Product is not available for purchase');
      }

      if (product.quantity < quantity) {
        throw new Error('Not enough quantity available');
      }

      // Don't allow buying your own product
      if (product.sellerId === buyerId) {
        throw new Error('You cannot purchase your own product');
      }

      // Calculate total price
      const totalPrice = Number(product.price) * quantity;

      // Create the order
      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId: product.sellerId,
          productId,
          quantity,
          totalPrice,
          currency: product.currency,
          status: OrderStatus.CREATED,
          shippingAddress,
        },
      });

      // Update product quantity
      await tx.product.update({
        where: { id: productId },
        data: {
          quantity: { decrement: quantity },
          soldCount: { increment: quantity },
          // If quantity reaches 0, mark as sold out
          status: product.quantity - quantity <= 0 ? ProductStatus.SOLD_OUT : undefined,
        },
      });

      // Create escrow on-chain (in a real app, this would be done client-side)
      const escrow = await solanaService.createEscrow(
        product.seller.walletAddress,
        product.seller.walletAddress,
        totalPrice,
        product.onChainId || ''
      );

      // Update order with escrow address
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          escrowAddress: escrow.escrowPubkey,
          transactionHash: escrow.txId,
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              images: true,
            },
          },
        },
      });

      return updatedOrder;
    });
  }

  /**
   * Update order status
   * @param orderId - ID of the order
   * @param userId - ID of the user making the update (must be buyer or seller)
   * @param status - New status
   */
  static async updateOrderStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
    trackingNumber?: string
  ) {
    // Get the order and verify permissions
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true,
        product: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user is authorized to update this order
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error('You are not authorized to update this order');
    }

    // Validate state transitions based on current status and user role
    this.validateStatusTransition(order, userId, status);

    // If marking as shipped, tracking number is required
    if (status === OrderStatus.SHIPPED && !trackingNumber) {
      throw new Error('Tracking number is required when marking an order as shipped');
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber: trackingNumber || order.trackingNumber,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            images: true,
          },
        },
      },
    });

    // If status is COMPLETED, release funds from escrow (in a real app, this would involve blockchain)
    if (status === OrderStatus.COMPLETED && order.escrowAddress) {
      await solanaService.completeEscrow(
        order.escrowAddress,
        order.buyer.walletAddress,
        order.seller.walletAddress
      );
    }

    return updatedOrder;
  }

  /**
   * Validate order status transitions
   * @private
   */
  private static validateStatusTransition(
    order: any,
    userId: string,
    newStatus: OrderStatus
  ) {
    const currentStatus = order.status;
    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;

    // Define valid transitions based on current status and user role
    switch (currentStatus) {
      case OrderStatus.CREATED:
        // Only buyer can fund the order (move to FUNDED)
        if (newStatus === OrderStatus.FUNDED && !isBuyer) {
          throw new Error('Only the buyer can fund this order');
        }
        // Only buyer can cancel at this stage
        if (newStatus === OrderStatus.CANCELLED && !isBuyer) {
          throw new Error('Only the buyer can cancel this order at this stage');
        }
        // Cannot skip to other statuses
        if (newStatus !== OrderStatus.FUNDED && newStatus !== OrderStatus.CANCELLED) {
          throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
        break;

      case OrderStatus.FUNDED:
        // Only seller can mark as shipped
        if (newStatus === OrderStatus.SHIPPED && !isSeller) {
          throw new Error('Only the seller can mark this order as shipped');
        }
        // Both can cancel at this stage (but different refund logic would apply)
        if (newStatus === OrderStatus.CANCELLED && !isBuyer && !isSeller) {
          throw new Error('Only the buyer or seller can cancel this order');
        }
        break;

      case OrderStatus.SHIPPED:
        // Only buyer can confirm delivery or dispute
        if ((newStatus === OrderStatus.COMPLETED || newStatus === OrderStatus.DISPUTED) && !isBuyer) {
          throw new Error('Only the buyer can complete or dispute this order');
        }
        break;

      case OrderStatus.COMPLETED:
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUNDED:
        // Cannot change from final statuses
        throw new Error(`Cannot change status from ${currentStatus} as it is a final status`);

      case OrderStatus.DISPUTED:
        // Only admins can resolve disputes (not implemented in this version)
        throw new Error('Dispute resolution not implemented in this version');

      default:
        throw new Error(`Invalid current status: ${currentStatus}`);
    }
  }

  /**
   * Get orders for a user (as buyer or seller)
   */
  static async getUserOrders(
    userId: string,
    role: 'buyer' | 'seller' | 'all',
    status?: OrderStatus,
    page = 1,
    limit = 20
  ) {
    // Build the filter conditions
    const where: any = {};
    
    if (role === 'buyer') {
      where.buyerId = userId;
    } else if (role === 'seller') {
      where.sellerId = userId;
    } else {
      // 'all' - either buyer or seller
      where.OR = [
        { buyerId: userId },
        { sellerId: userId },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with count
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
              profileImage: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
              profileImage: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              images: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            profileImage: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            images: true,
          },
        },
        review: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Only buyer, seller, or admin should be able to view order details
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error('You do not have permission to view this order');
    }

    return order;
  }
} 