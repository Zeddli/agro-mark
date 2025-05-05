import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UploadService } from '../services/upload.service';

// Custom interface to extend Express Request with files
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

const prisma = new PrismaClient();
const uploadService = new UploadService();

/**
 * Product controller for the marketplace
 */
export class ProductController {
  /**
   * Get all products with pagination and filtering
   */
  static async getProducts(req: Request, res: Response) {
    try {
      const { 
        page = '1', 
        limit = '10',
        category,
        minPrice,
        maxPrice,
        search,
        sellerId,
        status = 'ACTIVE'
      } = req.query;

      // Parse pagination params
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter conditions
      const where: any = {};
      
      // Filter by category
      if (category) {
        where.category = category as string;
      }
      
      // Filter by price range
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) {
          where.price.gte = parseFloat(minPrice as string);
        }
        if (maxPrice) {
          where.price.lte = parseFloat(maxPrice as string);
        }
      }
      
      // Filter by search term
      if (search) {
        const searchTerm = search as string;
        where.OR = [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }
      
      // Filter by seller
      if (sellerId) {
        where.sellerId = sellerId as string;
      }
      
      // Filter by status
      if (status) {
        where.status = status as string;
      }

      // Get products with pagination
      const products = await prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
              isVerified: true,
            }
          }
        }
      });

      // Get total count for pagination
      const totalCount = await prisma.product.count({ where });
      const totalPages = Math.ceil(totalCount / limitNum);

      return res.status(200).json({
        status: 'success',
        data: {
          products,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
          }
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching products',
      });
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              walletAddress: true,
              name: true,
              profileImage: true,
              isVerified: true,
              _count: {
                select: {
                  products: true,
                  receivedReviews: true,
                }
              }
            }
          }
        }
      });

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          product,
        }
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching product details',
      });
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const multerReq = req as MulterRequest;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const {
        title,
        description,
        price,
        quantity,
        currency = 'SOL',
        category,
        location,
        metadataUri,
      } = req.body;

      // Validate required fields
      if (!title || !description || !price || !quantity || !category) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields',
        });
      }

      // Handle uploaded files
      let imageUrls: string[] = [];
      if (multerReq.files && Array.isArray(multerReq.files)) {
        imageUrls = await uploadService.saveMultipleFiles(multerReq.files, 'products');
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          sellerId: userId,
          title,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity, 10),
          currency,
          category,
          location,
          images: imageUrls,
          metadataUri,
          status: 'ACTIVE',
        }
      });

      return res.status(201).json({
        status: 'success',
        data: {
          product,
        }
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while creating product',
      });
    }
  }

  /**
   * Update a product
   */
  static async updateProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const multerReq = req as MulterRequest;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      // Check if product exists and belongs to the user
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      if (existingProduct.sellerId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this product',
        });
      }

      const {
        title,
        description,
        price,
        quantity,
        status,
        metadataUri,
        deleteImages,
      } = req.body;

      // Handle uploaded files
      let newImageUrls: string[] = [];
      if (multerReq.files && Array.isArray(multerReq.files)) {
        newImageUrls = await uploadService.saveMultipleFiles(multerReq.files, 'products');
      }

      // Handle image deletion if requested
      let updatedImages = [...existingProduct.images];
      
      if (deleteImages && Array.isArray(deleteImages)) {
        // Remove deleted images from storage
        for (const imageUrl of deleteImages) {
          if (existingProduct.images.includes(imageUrl)) {
            await uploadService.deleteFile(imageUrl);
            updatedImages = updatedImages.filter(url => url !== imageUrl);
          }
        }
      }
      
      // Combine existing (not deleted) images with new uploads
      updatedImages = [...updatedImages, ...newImageUrls];

      // Update product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(price && { price: parseFloat(price) }),
          ...(quantity && { quantity: parseInt(quantity, 10) }),
          ...(status && { status }),
          ...(metadataUri && { metadataUri }),
          images: updatedImages,
        }
      });

      return res.status(200).json({
        status: 'success',
        data: {
          product: updatedProduct,
        }
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while updating product',
      });
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      // Check if product exists and belongs to the user
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      if (existingProduct.sellerId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete this product',
        });
      }

      // Delete product images
      for (const imageUrl of existingProduct.images) {
        await uploadService.deleteFile(imageUrl);
      }

      // Delete product
      await prisma.product.delete({
        where: { id },
      });

      return res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while deleting product',
      });
    }
  }
} 