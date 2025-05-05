import prisma from '../config/db.config';

/**
 * Service for user management operations
 */
export class UserService {
  /**
   * Get user by wallet address
   * @param walletAddress - Solana wallet address
   */
  static async getUserByWalletAddress(walletAddress: string) {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });
    
    return user;
  }

  /**
   * Get user by ID
   * @param userId - User ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    return user;
  }

  /**
   * Create a new user
   * @param walletAddress - Solana wallet address
   * @param data - Optional user data
   */
  static async createUser(walletAddress: string, data?: {
    name?: string;
    email?: string;
    profileImage?: string;
    bio?: string;
  }) {
    const user = await prisma.user.create({
      data: {
        walletAddress,
        name: data?.name,
        email: data?.email,
        profileImage: data?.profileImage,
        bio: data?.bio,
      },
    });
    
    return user;
  }

  /**
   * Update user profile
   * @param userId - User ID
   * @param data - User data to update
   */
  static async updateUserProfile(userId: string, data: {
    name?: string;
    email?: string;
    profileImage?: string;
    bio?: string;
  }) {
    // Check if email is already in use (if provided)
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new Error('Email is already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    
    return updatedUser;
  }

  /**
   * Get user statistics (sales, purchases, etc.)
   * @param userId - User ID
   */
  static async getUserStats(userId: string) {
    const [
      productsCount,
      activeListingsCount,
      soldItemsCount, 
      purchasesCount,
      averageRating
    ] = await Promise.all([
      // Total products ever listed
      prisma.product.count({
        where: { sellerId: userId },
      }),
      
      // Active listings
      prisma.product.count({
        where: { 
          sellerId: userId,
          status: 'ACTIVE',
        },
      }),
      
      // Completed sales
      prisma.order.count({
        where: {
          sellerId: userId,
          status: 'COMPLETED',
        },
      }),
      
      // Purchases
      prisma.order.count({
        where: {
          buyerId: userId,
          status: 'COMPLETED',
        },
      }),
      
      // Average rating from reviews
      prisma.review.aggregate({
        where: {
          recipientId: userId,
        },
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      productsCount,
      activeListingsCount,
      soldItemsCount,
      purchasesCount,
      averageRating: averageRating._avg.rating || 0,
    };
  }

  /**
   * Get public profile with basic stats
   * @param userId - User ID 
   */
  static async getPublicProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        walletAddress: true,
        profileImage: true,
        bio: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get stats
    const stats = await this.getUserStats(userId);
    
    // Get latest products
    const latestProducts = await prisma.product.findMany({
      where: {
        sellerId: userId,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        images: true,
      },
    });

    return {
      user,
      stats,
      latestProducts,
    };
  }

  /**
   * Search users
   * @param query - Search query
   * @param page - Page number
   * @param limit - Results per page
   */
  static async searchUsers(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { walletAddress: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          walletAddress: true,
          profileImage: true,
          isVerified: true,
          createdAt: true,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { walletAddress: { contains: query } },
          ],
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }
} 