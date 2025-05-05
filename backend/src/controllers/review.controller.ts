import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Review controller for managing user reviews and ratings
 */
export class ReviewController {
  /**
   * Get reviews for a specific user
   */
  static async getUserReviews(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '10' } = req.query;

      // Parse pagination params
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get reviews with pagination
      const reviews = await prisma.review.findMany({
        where: {
          recipientId: userId
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          },
          order: {
            select: {
              id: true,
              productId: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                }
              }
            }
          }
        }
      });

      // Get total count for pagination
      const totalCount = await prisma.review.count({
        where: {
          recipientId: userId
        }
      });
      
      // Calculate average rating
      const averageRating = await prisma.review.aggregate({
        where: {
          recipientId: userId
        },
        _avg: {
          rating: true
        }
      });

      const totalPages = Math.ceil(totalCount / limitNum);

      return res.status(200).json({
        status: 'success',
        data: {
          reviews,
          stats: {
            totalReviews: totalCount,
            averageRating: averageRating._avg.rating || 0
          },
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
          }
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching reviews',
      });
    }
  }

  /**
   * Create a review for a completed order
   */
  static async createReview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { orderId, rating, comment } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      // Validate required fields
      if (!orderId || !rating) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields',
        });
      }

      // Validate rating range (1-5)
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          status: 'error',
          message: 'Rating must be between 1 and 5',
        });
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          review: true
        }
      });

      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
      }

      // Check if user is the buyer
      if (order.buyerId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the buyer can leave a review',
        });
      }

      // Check if order is completed
      if (order.status !== 'COMPLETED') {
        return res.status(400).json({
          status: 'error',
          message: 'Can only review completed orders',
        });
      }

      // Check if review already exists
      if (order.review) {
        return res.status(400).json({
          status: 'error',
          message: 'A review already exists for this order',
        });
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          authorId: userId,
          recipientId: order.sellerId,
          orderId,
          rating,
          comment,
        },
        include: {
          author: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          },
          order: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  title: true,
                }
              }
            }
          }
        }
      });

      return res.status(201).json({
        status: 'success',
        data: {
          review,
        }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while creating review',
      });
    }
  }

  /**
   * Get a single review by ID
   */
  static async getReviewById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          },
          recipient: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
            }
          },
          order: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                }
              }
            }
          }
        }
      });

      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          review,
        }
      });
    } catch (error) {
      console.error('Error fetching review:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching review details',
      });
    }
  }

  /**
   * Get review statistics for a user
   */
  static async getUserReviewStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Get statistics
      const totalReviews = await prisma.review.count({
        where: {
          recipientId: userId
        }
      });
      
      const averageRating = await prisma.review.aggregate({
        where: {
          recipientId: userId
        },
        _avg: {
          rating: true
        }
      });
      
      // Get distribution of ratings
      const ratingDistribution = await Promise.all(
        [1, 2, 3, 4, 5].map(async (rating) => {
          const count = await prisma.review.count({
            where: {
              recipientId: userId,
              rating
            }
          });
          return { rating, count };
        })
      );

      return res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalReviews,
            averageRating: averageRating._avg.rating || 0,
            ratingDistribution
          }
        }
      });
    } catch (error) {
      console.error('Error fetching review statistics:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching review statistics',
      });
    }
  }
} 