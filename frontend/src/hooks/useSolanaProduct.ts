import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { solanaProductService, ProductData } from '../services/solana/product.service';

/**
 * Custom hook for interacting with Solana blockchain product listings
 * Provides methods for creating and managing products on-chain
 */
export function useSolanaProduct() {
  const { publicKey, connected, wallet } = useWallet();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the Solana product service when the wallet connects
  useEffect(() => {
    if (connected && publicKey && wallet) {
      try {
        solanaProductService.initialize(wallet.adapter);
        setInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Error initializing Solana product service:', err);
        setError('Failed to initialize Solana service');
        setInitialized(false);
      }
    } else {
      setInitialized(false);
    }
  }, [connected, publicKey, wallet]);

  /**
   * Create a product on the Solana blockchain
   * @param productData Product data to store on-chain
   * @returns Transaction signature
   */
  const createProduct = useCallback(async (productData: ProductData): Promise<string> => {
    if (!initialized) {
      throw new Error('Solana service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to create the product
      const signature = await solanaProductService.createProduct(productData);
      return signature;
    } catch (err) {
      console.error('Error creating product on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Update a product on the Solana blockchain
   * @param productPDA Public key of the product to update
   * @param updates Product data fields to update
   * @returns Transaction signature
   */
  const updateProduct = useCallback(async (
    productPDA: PublicKey, 
    updates: Partial<ProductData>
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Solana service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to update the product
      const signature = await solanaProductService.updateProduct(productPDA, updates);
      return signature;
    } catch (err) {
      console.error('Error updating product on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Fetch a product from the Solana blockchain
   * @param productPDA Public key of the product to fetch
   * @returns Product data
   */
  const fetchProduct = useCallback(async (productPDA: PublicKey): Promise<any> => {
    if (!initialized) {
      throw new Error('Solana service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to fetch the product
      const product = await solanaProductService.getProduct(productPDA);
      return product;
    } catch (err) {
      console.error('Error fetching product from Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product from blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Fetch all products by a seller
   * @param sellerPublicKey Public key of the seller
   * @returns Array of products
   */
  const fetchSellerProducts = useCallback(async (
    sellerPublicKey: PublicKey = publicKey!
  ): Promise<any[]> => {
    if (!initialized) {
      throw new Error('Solana service not initialized');
    }
    
    if (!sellerPublicKey) {
      throw new Error('Seller public key not provided');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to fetch the products
      const products = await solanaProductService.getProductsBySeller(sellerPublicKey);
      return products;
    } catch (err) {
      console.error('Error fetching seller products from Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch seller products from blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized, publicKey]);

  /**
   * Convert raw product data to the format required for on-chain storage
   * @param product Product data from the form
   * @param metadataUri IPFS URI with extended metadata
   * @returns Product data formatted for blockchain storage
   */
  const formatProductForBlockchain = (
    product: any,
    metadataUri: string
  ): ProductData => {
    return {
      title: product.title,
      description: product.description,
      price: parseFloat(product.price) * 1000000, // Convert to smallest unit (e.g., lamports for SOL, 6 decimals for USDC)
      quantity: parseInt(product.quantity),
      currency: product.currency as 'SOL' | 'USDC' | 'USDT',
      metadataUri,
      category: product.category
    };
  };

  return {
    initialized,
    loading,
    error,
    createProduct,
    updateProduct,
    fetchProduct,
    fetchSellerProducts,
    formatProductForBlockchain
  };
} 