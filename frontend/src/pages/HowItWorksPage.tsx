import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

/**
 * HowItWorksPage component that explains the platform to users
 */
const HowItWorksPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">How AgroMark Works</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AgroMark is revolutionizing agricultural trade by connecting farmers directly with buyers 
              worldwide through secure blockchain technology.
            </p>
          </div>
          
          {/* Steps Section */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Step 1 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 py-3 px-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="flex items-center justify-center bg-white text-green-600 w-8 h-8 rounded-full mr-3 text-lg">1</span>
                    Connect Your Wallet
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Start by connecting your Solana wallet to AgroMark. We support popular wallets like Phantom and Solflare.
                  </p>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">What you'll need:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>A Solana wallet (Phantom, Solflare, etc.)</li>
                      <li>Some SOL for transactions</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your wallet serves as your secure identity on the platform and allows for fast, low-cost transactions.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 py-3 px-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="flex items-center justify-center bg-white text-green-600 w-8 h-8 rounded-full mr-3 text-lg">2</span>
                    Create Your Profile
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Set up your profile with your business information. Choose whether you want to buy, sell, or both.
                  </p>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Profile includes:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Your name or business name</li>
                      <li>Location information</li>
                      <li>Profile picture</li>
                      <li>Business description</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">
                    Complete profiles help build trust between buyers and sellers in the marketplace.
                  </p>
                </div>
              </div>
              
              {/* Step 3 - Selling */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 py-3 px-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="flex items-center justify-center bg-white text-green-600 w-8 h-8 rounded-full mr-3 text-lg">3A</span>
                    Selling Products
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Create detailed listings for your agricultural products with images, descriptions, and pricing.
                  </p>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Listing includes:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Product title and description</li>
                      <li>High-quality images</li>
                      <li>Pricing and available quantity</li>
                      <li>Shipping options and location</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your listing is recorded on the blockchain for security and visibility to potential buyers globally.
                  </p>
                </div>
              </div>
              
              {/* Step 3 - Buying */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 py-3 px-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="flex items-center justify-center bg-white text-green-600 w-8 h-8 rounded-full mr-3 text-lg">3B</span>
                    Buying Products
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Browse the marketplace to find agricultural products that meet your needs and make secure purchases.
                  </p>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">When buying:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Browse products by category</li>
                      <li>View seller profiles and ratings</li>
                      <li>Compare prices and shipping options</li>
                      <li>Purchase with SOL or USDC</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">
                    Our platform provides powerful search and filtering tools to find exactly what you need.
                  </p>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 py-3 px-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="flex items-center justify-center bg-white text-green-600 w-8 h-8 rounded-full mr-3 text-lg">4</span>
                    Secure Transactions
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Our escrow system ensures secure transactions between buyers and sellers, protecting both parties.
                  </p>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">How it works:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Buyer's funds are locked in a secure smart contract</li>
                      <li>Seller ships the product with tracking</li>
                      <li>Buyer confirms receipt or reports issues</li>
                      <li>Funds are released to seller upon confirmation</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">
                    Blockchain technology ensures transparent, tamper-proof transaction records.
                  </p>
                </div>
              </div>
              
              {/* Step 5 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 py-3 px-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="flex items-center justify-center bg-white text-green-600 w-8 h-8 rounded-full mr-3 text-lg">5</span>
                    Build Reputation
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    After transactions, buyers and sellers can review each other, building trust in the community.
                  </p>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Reputation includes:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Star ratings (1-5 stars)</li>
                      <li>Written reviews</li>
                      <li>On-chain verification badges</li>
                      <li>Transaction history metrics</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">
                    Reviews are stored on the blockchain for transparency and cannot be manipulated.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Why Use AgroMark?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Transactions settle in seconds, not days, thanks to Solana's high-performance blockchain.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure & Transparent</h3>
                <p className="text-gray-600">
                  Blockchain technology ensures transaction security and complete transparency for all parties.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Global Marketplace</h3>
                <p className="text-gray-600">
                  Connect with farmers and buyers from around the world, expanding your market reach.
                </p>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join the global network of farmers and buyers using blockchain technology for secure and efficient agricultural trade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/marketplace" 
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
              >
                Explore Marketplace
              </Link>
              <Link 
                to="/faq" 
                className="bg-white border border-green-600 text-green-600 hover:bg-green-50 py-2 px-6 rounded"
              >
                Read FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorksPage; 