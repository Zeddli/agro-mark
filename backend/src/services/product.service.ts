import prisma from '../config/db.config';
import { SolanaService } from './solana.service';
import { ProductStatus } from '@prisma/client';

// Initialize Solana service
const solanaService = new SolanaService();

/**
 * Service for handling product-related operations
 */
export class ProductService {
  /**
   * Create a new product listing
   * @param sellerId - ID of the user creating the product
   * @param productData - Product details
   */
  static async createProduct(sellerId: string, productData: {
    title: string;
    description: string;
    price: number;
    quantity: number;
    currency: string;
    category: string;
    location?: string;
    images: string[];
    metadataUri?: string;
  }) {
    try {
      // First create the product in database
      const product = await prisma.product.create({
        data: {
          sellerId,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          quantity: productData.quantity,
          currency: productData.currency,
          category: productData.category,
          location: productData.location,
          images: productData.images,
          metadataUri: productData.metadataUri,
          status: ProductStatus.ACTIVE,
        },
      });

      // Get the seller's wallet address for on-chain listing
      const seller = await prisma.user.findUnique({
        where: { id: sellerId },
        select: { walletAddress: true },
      });

      if (!seller) {
        throw new Error('Seller not found');
      }

      // Create the listing on Solana blockchain
      // Note: In a real implementation, this would be done client-side
      // with the user's wallet signing the transaction
      const onChainListing = await solanaService.createListing(
        seller.walletAddress,
        productData.price,
        productData.quantity,
        productData.metadataUri || ''
      );

      // Update product with on-chain reference
      const updatedProduct = await prisma.product.update({
        where: { id: product.id },
        data: {
          onChainId: onChainListing.listingPubkey,
        },
      });

      return updatedProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(filters: {
    category?: string;
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: ProductStatus;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'recent' | 'popular';
  }) {
    const {
      category,
      sellerId,
      minPrice,
      maxPrice,
      status = ProductStatus.ACTIVE,
      search,
      page = 1,
      limit = 20,
      sortBy = 'recent',
    } = filters;

    // Build the filter conditions
    const where: any = { status };
    
    if (category) {
      where.category = category;
    }
    
    if (sellerId) {
      where.sellerId = sellerId;
    }
    
    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }
    
    // Text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Determine sort order
    let orderBy: any;
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { soldCount: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
              profileImage: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            profileImage: true,
            bio: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  /**
   * Update a product
   */
  static async updateProduct(id: string, sellerId: string, updates: {
    title?: string;
    description?: string;
    price?: number;
    quantity?: number;
    currency?: string;
    category?: string;
    location?: string;
    images?: string[];
    status?: ProductStatus;
    metadataUri?: string;
  }) {
    // Verify the product exists and belongs to the seller
    const product = await prisma.product.findFirst({
      where: {
        id,
        sellerId,
      },
    });

    if (!product) {
      throw new Error('Product not found or you do not have permission to update it');
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updates,
    });

    return updatedProduct;
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string, sellerId: string) {
    // Verify the product exists and belongs to the seller
    const product = await prisma.product.findFirst({
      where: {
        id,
        sellerId,
      },
    });

    if (!product) {
      throw new Error('Product not found or you do not have permission to delete it');
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    return { success: true };
  }
} 