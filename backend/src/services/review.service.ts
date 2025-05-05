import prisma from '../config/db.config';
import { SolanaService } from './solana.service';
import { OrderStatus } from '@prisma/client';

// Initialize Solana service
const solanaService = new SolanaService();

/**
 * Service for handling review-related operations
 */
export class ReviewService {
  /**
   * Create a new review for a completed order
   * @param authorId - ID of the user writing the review (must be the buyer)
   * @param orderId - ID of the completed order
   * @param reviewData - Review details
   */
  static async createReview(
    authorId: string,
    orderId: string,
    reviewData: {
      rating: number;
      comment?: string;
    }
  ) {
    // Validate rating (1-5 stars)
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }

    // Get the order and verify it's completed and the author is the buyer
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        review: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new Error('Can only review completed orders');
    }

    if (order.buyerId !== authorId) {
      throw new Error('Only the buyer can review an order');
    }

    if (order.review) {
      throw new Error('This order already has a review');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        authorId,
        recipientId: order.sellerId,
        orderId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
        order: {
          select: {
            id: true,
            productId: true,
          },
        },
      },
    });

    // In a real implementation, we would register this review on the blockchain
    // This is a placeholder for now
    // const onChainId = await solanaService.createReview(...);

    return review;
  }

  /**
   * Get reviews for a user
   * @param userId - ID of the user to get reviews for
   * @param page - Page number
   * @param limit - Results per page
   */
  static async getUserReviews(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
              profileImage: true,
            },
          },
          order: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.count({
        where: { recipientId: userId },
      }),
    ]);

    // Calculate average rating
    const averageRating = await prisma.review.aggregate({
      where: { recipientId: userId },
      _avg: {
        rating: true,
      },
    });

    return {
      reviews,
      stats: {
        total,
        averageRating: averageRating._avg.rating || 0,
      },
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  /**
   * Get reviews written by a user
   * @param authorId - ID of the review author
   * @param page - Page number
   * @param limit - Results per page
   */
  static async getReviewsByAuthor(authorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { authorId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
              profileImage: true,
            },
          },
          order: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.count({
        where: { authorId },
      }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  /**
   * Get a specific review by ID
   * @param reviewId - ID of the review
   */
  static async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            profileImage: true,
          },
        },
        order: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }
} 