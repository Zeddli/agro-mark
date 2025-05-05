import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

/**
 * HomePage component for the landing page
 */
const HomePage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Revolutionizing Global Agricultural Trade
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              AgroMark connects farmers directly with buyers worldwide through a secure blockchain marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/marketplace" 
                className="inline-block bg-white text-green-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-center"
              >
                Explore Marketplace
              </Link>
              <Link 
                to="/sell" 
                className="inline-block bg-green-600 text-white hover:bg-green-500 px-6 py-3 rounded-md font-medium text-center"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AgroMark?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600">
                Escrow-based payments powered by Solana blockchain ensure safe trades for both buyers and sellers.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Marketplace</h3>
              <p className="text-gray-600">
                Connect with farmers and buyers from around the world, breaking geographical barriers.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Suppliers</h3>
              <p className="text-gray-600">
                On-chain reputation system ensures trustworthy sellers and quality products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-600">
                Set up your Solana wallet and connect to AgroMark with a few clicks.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Create Profile</h3>
              <p className="text-gray-600">
                Create your buyer or seller profile with verification for enhanced trust.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">{`${navigator.language === 'en-US' ? 'Buy or Sell' : 'Buy/Sell'}`}</h3>
              <p className="text-gray-600">
                Browse products or list your agricultural goods with detailed information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-xl font-semibold mb-2">Secure Transaction</h3>
              <p className="text-gray-600">
                Complete transactions through our escrow system with fast settlement.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/how-it-works" 
              className="inline-flex items-center text-green-600 hover:text-green-800"
            >
              Learn more about how AgroMark works
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform agricultural trade?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the global network of farmers and buyers using blockchain technology for secure and efficient transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/marketplace" 
              className="inline-block bg-white text-green-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
            >
              Start Shopping
            </Link>
            <Link 
              to="/sell" 
              className="inline-block bg-green-600 text-white hover:bg-green-500 border border-white px-6 py-3 rounded-md font-medium"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage; 