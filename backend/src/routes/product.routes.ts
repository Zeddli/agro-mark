import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { auth } from '../middlewares/auth.middleware';
import { multipleUpload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and filtering
 * @access  Public
 */
router.get('/', ProductController.getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', ProductController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post('/', auth, multipleUpload('images', 5), ProductController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (owner only)
 */
router.put('/:id', auth, multipleUpload('images', 5), ProductController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (owner only)
 */
router.delete('/:id', auth, ProductController.deleteProduct);

export default router; 