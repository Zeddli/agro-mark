import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Layout from '../components/layout/Layout';
import { Product } from '../components/products/ProductCard';
import ProductBuyButton from '../components/products/ProductBuyButton';
import { CurrencyType } from '../services/solana/types';

/**
 * ProductDetailPage component for viewing a single product
 */
const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

  useEffect(() => {
    // Mock data for now - this would be fetched from backend in a real application
    const mockProduct = {
      id: id || '1',
      title: 'Organic Tomatoes',
      description: 'Fresh, organic tomatoes grown with sustainable practices.',
      price: 1500000, // 1.5 SOL (represented in lamports)
      currency: 'SOL' as CurrencyType,
      quantity: 50,
      location: 'California, USA',
      category: 'Vegetables',
      seller: {
        id: 'seller1',
        name: 'Green Valley Farm',
        publicKey: new PublicKey('8ZRdBbm5iXTAMXAvz7MHgERnt1arKg9x8UzTxF6zTewb')
      },
      images: [
        'https://via.placeholder.com/800x600?text=Organic+Tomatoes',
        'https://via.placeholder.com/800x600?text=Tomatoes+Close+Up',
        'https://via.placeholder.com/800x600?text=Packaged+Tomatoes'
      ],
      tags: ['organic', 'fresh', 'sustainable'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Mock Solana-specific fields
      productPublicKey: new PublicKey('7ZRdBbm5iXTAMXAvz7MHgERnt1arKg9x8UzTxF6zTewd')
    };

    // Simulate API fetch with timeout
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProduct(mockProduct);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (product && value >= 1 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <div className="bg-gray-300 h-96 w-full rounded-lg"></div>
                <div className="flex mt-4 gap-2">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="bg-gray-300 h-20 w-20 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
                <div className="h-10 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="h-12 bg-gray-300 rounded w-full mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Product not found'}
          </div>
          <Link 
            to="/marketplace" 
            className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Back to Marketplace
          </Link>
        </div>
      </Layout>
    );
  }

  // Format the price display based on the currency
  const formatPrice = (price: number, currency: CurrencyType) => {
    if (currency === 'SOL') {
      return `${(price / 1_000_000_000).toFixed(2)} SOL`;
    } else if (currency === 'USDC' || currency === 'USDT') {
      return `${(price / 1_000_000).toFixed(2)} ${currency}`;
    }
    return `${price}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-green-600">Home</Link>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-gray-500">/</span>
              <Link to="/marketplace" className="text-gray-500 hover:text-green-600">Marketplace</Link>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-gray-500">/</span>
              <span className="text-gray-900">{product.title}</span>
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            {/* Main Image */}
            <div className="bg-gray-100 rounded-lg overflow-hidden h-96 flex items-center justify-center mb-4">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[activeImageIndex]} 
                  alt={product.title}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <svg 
                    className="w-16 h-16 mx-auto mb-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p>No image available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      index === activeImageIndex ? 'border-green-500' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} - Image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              <div className="flex items-center mb-4">
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                  {product.category}
                </span>
                {product.location && (
                  <span className="ml-4 text-gray-500 flex items-center text-sm">
                    <svg 
                      className="w-4 h-4 mr-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    {product.location}
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  {formatPrice(product.price, product.currency)}
                </h2>
                <p className="text-gray-500 text-sm">
                  {product.quantity > 0 
                    ? `${product.quantity} units available` 
                    : 'Out of stock'}
                </p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <p className="text-gray-700 mb-4">{product.description}</p>
                
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex">
                  <button
                    onClick={decreaseQuantity}
                    className="px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-l-md hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="p-2 w-20 text-center border-t border-b border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    onClick={increaseQuantity}
                    className="px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                {/* Use the ProductBuyButton component instead of the old handleBuyNow function */}
                <ProductBuyButton
                  productId={product.id}
                  productPublicKey={product.productPublicKey}
                  productTitle={product.title}
                  productDescription={product.description}
                  sellerPublicKey={product.seller.publicKey}
                  price={product.price}
                  currency={product.currency}
                  availableQuantity={product.quantity}
                  imageUri={product.images && product.images.length > 0 ? product.images[0] : undefined}
                  buttonText="Buy Now"
                  className="flex-1 py-3 px-8 bg-green-600 hover:bg-green-700 text-white rounded-md shadow transition-colors text-center"
                />
                
                <button
                  className="flex-1 py-3 px-8 border border-green-600 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                >
                  Contact Seller
                </button>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p className="flex items-center mb-1">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Escrow-protected purchase
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  On-chain transaction with Solana
                </p>
              </div>
            </div>
            
            {/* Seller Information */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-4">
              <h2 className="text-lg font-medium mb-4">Seller Information</h2>
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">{product.seller.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {product.seller.publicKey.toString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage; 