import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ProductGrid from '../components/products/ProductGrid';
import { Product } from '../../frontend/src/components/products/ProductCard';
import { useCategories } from '../hooks/useCategories';

/**
 * MarketplacePage component that displays the product listings
 */
const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { 
    categories, 
    tags, 
    selectedCategory, 
    selectedTags, 
    handleCategorySelect, 
    handleTagToggle 
  } = useCategories();
  
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: 'recent' as 'recent' | 'price_asc' | 'price_desc' | 'popular',
  });

  // Update the filters when the category is selected via the hook
  useEffect(() => {
    if (selectedCategory) {
      setFilters(prev => ({ ...prev, category: selectedCategory }));
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Function to fetch products from the API
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.sort) queryParams.append('sort', filters.sort);
        
        // Add selected tags to query params
        selectedTags.forEach(tag => {
          queryParams.append('tags', tag);
        });
        
        const response = await fetch(`/api/products?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.data.products);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, selectedTags]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle category selection - sync with the categories hook
    if (name === 'category') {
      handleCategorySelect(value);
    }
    
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Update is handled by the effect when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'recent',
    });
    
    // Also clear the selected category and tags in the hook
    handleCategorySelect('');
    selectedTags.forEach(tag => handleTagToggle(tag));
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Banner */}
          <div className="bg-green-700 text-white rounded-lg p-8 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Global Agricultural Marketplace
              </h1>
              <p className="text-lg md:text-xl mb-6 max-w-2xl">
                Connect directly with farmers worldwide and purchase quality agricultural products with secure blockchain transactions.
              </p>
              <form 
                onSubmit={handleSearchSubmit}
                className="flex max-w-lg"
              >
                <input
                  type="text"
                  name="search"
                  placeholder="Search for products..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="flex-grow px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-r-lg"
                >
                  Search
                </button>
              </form>
            </div>
            {/* Background pattern */}
            <div className="absolute right-0 bottom-0 opacity-10">
              <svg width="400" height="300" viewBox="0 0 156 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M108.8 5.44444C116.335 5.44444 122.445 11.5541 122.445 19.0889C122.445 26.6236 116.335 32.7333 108.8 32.7333C101.266 32.7333 95.1556 26.6236 95.1556 19.0889C95.1556 11.5541 101.266 5.44444 108.8 5.44444ZM47.2 49.1C54.7348 49.1 60.8444 55.2096 60.8444 62.7444C60.8444 70.2791 54.7348 76.3889 47.2 76.3889C39.6652 76.3889 33.5556 70.2791 33.5556 62.7444C33.5556 55.2096 39.6652 49.1 47.2 49.1ZM108.8 49.1C116.335 49.1 122.445 55.2096 122.445 62.7444C122.445 70.2791 116.335 76.3889 108.8 76.3889C101.266 76.3889 95.1556 70.2791 95.1556 62.7444C95.1556 55.2096 101.266 49.1 108.8 49.1ZM47.2 5.44444C54.7348 5.44444 60.8444 11.5541 60.8444 19.0889C60.8444 26.6236 54.7348 32.7333 47.2 32.7333C39.6652 32.7333 33.5556 26.6236 33.5556 19.0889C33.5556 11.5541 39.6652 5.44444 47.2 5.44444Z" fill="white"/>
              </svg>
            </div>
          </div>

          {/* Content Area with Filters and Products */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="md:w-64 bg-white p-6 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Price Range (SOL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Sort By
                </label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Available Products</h2>
                    <p className="text-gray-600">
                      {products.length} products found
                    </p>
                  </div>
                  <ProductGrid
                    products={products}
                    loading={loading}
                    emptyMessage="No products match your search criteria. Try adjusting your filters."
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MarketplacePage; 