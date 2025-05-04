import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../components/layout/Layout';
import { useIPFS } from '../hooks/useIPFS';
import { useSolanaProduct } from '../hooks/useSolanaProduct';
import { useCategories } from '../hooks/useCategories';
import { PublicKey } from '@solana/web3.js';
import TagSelector from '../components/products/TagSelector';

/**
 * CreateListingPage component for sellers to create new product listings
 */
const CreateListingPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();
  const { uploadFiles, isUploading, uploadProgress } = useIPFS();
  const { 
    createProduct, 
    formatProductForBlockchain, 
    loading: blockchainLoading, 
    error: blockchainError 
  } = useSolanaProduct();
  
  const {
    categories,
    tags,
    selectedTags,
    handleTagToggle,
    createTag,
    loading: categoriesLoading
  } = useCategories();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [blockchainTx, setBlockchainTx] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'SOL',
    quantity: '1',
    category: '',
    location: '',
    images: [] as File[],
    ipfsImageUrls: [] as string[],
  });

  // Redirect if not connected
  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/');
    }
  }, [connected, publicKey, navigate]);

  // Set blockchain error if it exists
  useEffect(() => {
    if (blockchainError) {
      setError(blockchainError);
    }
  }, [blockchainError]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      
      // Check if total would exceed the limit of 5 images
      if (formData.images.length + fileList.length > 5) {
        setError('You can upload a maximum of 5 images');
        return;
      }
      
      // Validate each file
      for (const file of fileList) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image file size must be less than 5MB');
          return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          setError('Files must be images');
          return;
        }
      }
      
      // Update state with valid files
      setFormData({
        ...formData,
        images: [...formData.images, ...fileList]
      });
      
      // Create preview URLs
      const newPreviewUrls = fileList.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
      
      setError(null);
    }
  };

  // Remove image from the list
  const removeImage = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    
    const updatedPreviews = [...previewUrls];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    
    const updatedIpfsUrls = [...formData.ipfsImageUrls];
    if (updatedIpfsUrls.length > index) {
      updatedIpfsUrls.splice(index, 1);
    }
    
    setFormData({
      ...formData,
      images: updatedImages,
      ipfsImageUrls: updatedIpfsUrls
    });
    setPreviewUrls(updatedPreviews);
  };

  // Upload images to IPFS using the useIPFS hook
  const uploadImagesToIPFS = async () => {
    try {
      // Use the uploadFiles method from useIPFS hook
      const results = await uploadFiles(formData.images);
      
      // Extract URLs from the results
      const ipfsUrls = results.map(result => result.url);
      
      setFormData({
        ...formData,
        ipfsImageUrls: ipfsUrls
      });
      
      return ipfsUrls;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      setError('Failed to upload images to IPFS. Please try again.');
      throw error;
    }
  };

  // Create product metadata for IPFS and blockchain
  const createProductMetadata = (ipfsImageUrls: string[]) => {
    return {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      currency: formData.currency,
      quantity: formData.quantity,
      category: formData.category,
      location: formData.location || '',
      images: ipfsImageUrls,
      seller: publicKey?.toString(),
      createdAt: new Date().toISOString(),
      tags: selectedTags
    };
  };

  // Save product to blockchain
  const saveToBlockchain = async (metadata: any, metadataUrl: string) => {
    try {
      // Format data for on-chain storage
      const blockchainData = formatProductForBlockchain(
        formData, 
        metadataUrl
      );
      
      // Create product on blockchain
      const txSignature = await createProduct(blockchainData);
      setBlockchainTx(txSignature);
      
      return txSignature;
    } catch (error) {
      console.error('Error saving to blockchain:', error);
      setError('Failed to save product to blockchain. Backend API storage will still proceed.');
      // We don't throw here to allow the process to continue with API storage
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }
      
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }
      
      if (!formData.category) {
        setError('Please select a category');
        return;
      }
      
      if (formData.images.length === 0) {
        setError('Please upload at least one image');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // First upload images to IPFS
      const ipfsImageUrls = await uploadImagesToIPFS();
      
      // Create complete metadata
      const metadata = createProductMetadata(ipfsImageUrls);
      
      // In a real implementation, we would upload the complete metadata to IPFS
      // For demo purposes, we'll assume the metadata URL is created
      const metadataUrl = `ipfs://metadata/${Date.now()}`;
      
      // Try to save to blockchain (but continue even if it fails)
      await saveToBlockchain(metadata, metadataUrl);
      
      // Create product data with IPFS image URLs for API
      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        currency: formData.currency,
        quantity: formData.quantity,
        category: formData.category,
        location: formData.location || '',
        images: ipfsImageUrls,
        tags: selectedTags,
        onChainId: blockchainTx // Include blockchain transaction if available
      };
      
      // Send data to API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product listing');
      }
      
      const data = await response.json();
      
      // Redirect to the new product page
      navigate(`/products/${data.data.product.id}`);
    } catch (err) {
      console.error('Product creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold mb-6">Create New Product Listing</h1>
            
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {blockchainTx && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-bold">Successfully created on blockchain!</p>
                <p className="text-sm break-all mt-1">Transaction: {blockchainTx}</p>
              </div>
            )}
            
            {(isUploading || blockchainLoading) && (
              <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                <div className="flex items-center mb-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>
                    {isUploading 
                      ? 'Uploading images to IPFS...' 
                      : 'Saving product to blockchain...'}
                  </span>
                </div>
                {isUploading && (
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Product Images */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4 mb-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Product preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {formData.images.length < 5 && (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-green-500 hover:text-green-500">
                      <svg 
                        className="w-8 h-8 mb-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                        />
                      </svg>
                      <span className="text-xs">Add Image</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-gray-500 text-xs mb-1">
                  Upload up to 5 images (max 5MB each). The first image will be used as the main product image.
                </p>
                <p className="text-green-600 text-xs">
                  Images will be uploaded to IPFS for decentralized, permanent storage when you create the listing.
                </p>
              </div>
              
              {/* Title */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input 
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter a descriptive title for your product"
                  maxLength={100}
                  required
                />
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Provide detailed information about your product"
                  rows={6}
                  maxLength={2000}
                  required
                />
              </div>
              
              {/* Price and Currency */}
              <div className="mb-6 flex space-x-4">
                <div className="flex-grow">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="price"
                    name="price"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="w-1/4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currency">
                    Currency
                  </label>
                  <select 
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>
              
              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                  Quantity Available <span className="text-red-500">*</span>
                </label>
                <input 
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              {/* Category */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </label>
                <select 
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Tags */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tags
                </label>
                <div className="p-3 border border-gray-300 rounded">
                  <TagSelector
                    availableTags={tags}
                    selectedTags={selectedTags}
                    onTagSelect={handleTagToggle}
                    onTagCreate={createTag}
                    allowCreation={true}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Add tags to make your product easier to discover. You can select existing tags or create new ones.
                </p>
              </div>
              
              {/* Location */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Location
                </label>
                <input 
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="City, Country (optional)"
                />
              </div>
              
              {/* Blockchain Integration Notice */}
              <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-yellow-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  Blockchain Integration
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This product will be stored both in our database and on the Solana blockchain for increased transparency and security.
                  Your wallet will need to approve the transaction to complete the blockchain storage.
                </p>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || isUploading || blockchainLoading}
                  className={`px-6 py-2 rounded text-white font-medium ${
                    loading || isUploading || blockchainLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading || isUploading || blockchainLoading ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateListingPage; 