import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { CacheService } from '../services/cache.service';
import { UploadService } from '../services/upload.service';
import { formatError } from '../utils/validation.utils';
import { ProductStatus } from '@prisma/client';

// Custom interface to extend Express Request with files
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

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
        sort = 'recent',
        status = 'ACTIVE'
      } = req.query;

      // Parse pagination params
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      // Prepare filters
      const filters: any = {
        page: pageNum,
        limit: limitNum,
        status: status as ProductStatus,
        sortBy: sort as string,
      };
      
      if (category) filters.category = category as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (search) filters.search = search as string;
      if (sellerId) filters.sellerId = sellerId as string;

      // Generate cache key based on query parameters
      const cacheKey = `products:${JSON.stringify(filters)}`;

      // Try to get from cache first, then fallback to database
      const result = await CacheService.getOrSet(
        cacheKey,
        () => ProductService.getProducts(filters),
        300 // Cache for 5 minutes
      );

      return res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json(formatError(error, 'Server error while fetching products'));
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Generate cache key
      const cacheKey = `product:${id}`;

      // Try to get from cache first, then fallback to database
      const product = await CacheService.getOrSet(
        cacheKey,
        () => ProductService.getProductById(id),
        300 // Cache for 5 minutes
      );

      return res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }
      return res.status(500).json(formatError(error, 'Server error while fetching product details'));
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
      if (!title || !description || price === undefined || quantity === undefined || !category) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields (title, description, price, quantity, category)',
        });
      }

      // Handle image uploads
      let imageUrls: string[] = [];
      if (multerReq.files && multerReq.files.length > 0) {
        // Process uploaded files
        imageUrls = await uploadService.saveMultipleFiles(multerReq.files);
      }

      // Create product with service
      const product = await ProductService.createProduct(userId, {
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        currency,
        category,
        location,
        images: imageUrls,
        metadataUri,
      });

      // Clear product listing cache when a new product is added
      await CacheService.clearByPattern('products:*');

      return res.status(201).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json(formatError(error, 'Server error while creating product'));
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
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
        currency,
        category,
        location,
        status,
        metadataUri,
      } = req.body;

      // Process updates
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = parseFloat(price);
      if (quantity !== undefined) updates.quantity = parseInt(quantity, 10);
      if (currency !== undefined) updates.currency = currency;
      if (category !== undefined) updates.category = category;
      if (location !== undefined) updates.location = location;
      if (status !== undefined) updates.status = status as ProductStatus;
      if (metadataUri !== undefined) updates.metadataUri = metadataUri;

      // Handle image uploads if provided
      if (multerReq.files && multerReq.files.length > 0) {
        // Process uploaded files
        let imageUrls: string[] = [];
        imageUrls = await uploadService.saveMultipleFiles(multerReq.files);
        updates.images = imageUrls;
      }

      // Update product with service
      const product = await ProductService.updateProduct(id, userId, updates);

      // Clear related cache entries
      await Promise.all([
        CacheService.del(`product:${id}`),
        CacheService.clearByPattern('products:*'),
      ]);

      return res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof Error && error.message.includes('not found or you do not have permission')) {
        return res.status(403).json({
          status: 'error',
          message: error.message,
        });
      }
      return res.status(500).json(formatError(error, 'Server error while updating product'));
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

      // Delete product with service
      await ProductService.deleteProduct(id, userId);

      // Clear related cache entries
      await Promise.all([
        CacheService.del(`product:${id}`),
        CacheService.clearByPattern('products:*'),
      ]);

      return res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error instanceof Error && error.message.includes('not found or you do not have permission')) {
        return res.status(403).json({
          status: 'error',
          message: error.message,
        });
      }
      return res.status(500).json(formatError(error, 'Server error while deleting product'));
    }
  }
} 