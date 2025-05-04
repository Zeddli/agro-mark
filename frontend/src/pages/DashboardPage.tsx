import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../components/layout/Layout';

/**
 * User dashboard interface for managing account,
 * listings, orders, and transactions
 */
const DashboardPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  
  // Redirect if not connected
  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/');
    } else {
      fetchUserData();
    }
  }, [connected, publicKey, navigate]);
  
  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        // If user needs to complete profile
        if (response.status === 404) {
          navigate('/profile/setup');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data.data.user);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="flex mb-8">
              {['Overview', 'Listings', 'Orders', 'Transactions'].map((_, i) => (
                <div key={i} className="h-10 bg-gray-300 rounded-lg w-28 mr-2"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-40 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="h-60 bg-gray-300 rounded-lg mt-8"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button 
            onClick={fetchUserData}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }
  
  // No user data
  if (!userData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No User Profile Found</h2>
            <p className="mb-6">Please complete your profile to access your dashboard.</p>
            <Link 
              to="/profile/setup" 
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
            >
              Complete Your Profile
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Your Dashboard</h1>
          
          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                
                {userData.isSeller && (
                  <button
                    onClick={() => handleTabChange('listings')}
                    className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'listings'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    My Listings
                  </button>
                )}
                
                <button
                  onClick={() => handleTabChange('orders')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Orders
                </button>
                
                <button
                  onClick={() => handleTabChange('transactions')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'transactions'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Transactions
                </button>
                
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile
                </button>
              </nav>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Welcome, {userData.name}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Wallet Balance */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Wallet Balance</h3>
                    <p className="text-2xl font-bold">
                      {userData.balance?.toFixed(4) || '0.0000'} SOL
                    </p>
                    <button className="mt-2 text-sm text-green-700 hover:text-green-800">
                      View Transactions
                    </button>
                  </div>
                  
                  {/* Orders Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Active Orders</h3>
                    <p className="text-2xl font-bold">
                      {userData.activeOrders || 0}
                    </p>
                    <button 
                      onClick={() => handleTabChange('orders')}
                      className="mt-2 text-sm text-blue-700 hover:text-blue-800"
                    >
                      View Orders
                    </button>
                  </div>
                  
                  {/* Listings or Purchases */}
                  {userData.isSeller ? (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <h3 className="text-lg font-medium text-purple-800 mb-2">Active Listings</h3>
                      <p className="text-2xl font-bold">
                        {userData.activeListings || 0}
                      </p>
                      <button 
                        onClick={() => handleTabChange('listings')}
                        className="mt-2 text-sm text-purple-700 hover:text-purple-800"
                      >
                        Manage Listings
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <h3 className="text-lg font-medium text-amber-800 mb-2">Purchases</h3>
                      <p className="text-2xl font-bold">
                        {userData.totalPurchases || 0}
                      </p>
                      <Link 
                        to="/marketplace" 
                        className="mt-2 text-sm text-amber-700 hover:text-amber-800 inline-block"
                      >
                        Browse Marketplace
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to="/marketplace" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
                    >
                      Browse Products
                    </Link>
                    
                    {userData.isSeller && (
                      <Link 
                        to="/sell/new" 
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                      >
                        Create Listing
                      </Link>
                    )}
                    
                    <button 
                      onClick={() => handleTabChange('profile')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  
                  {/* Placeholder for recent activity */}
                  <div className="text-gray-500 text-center py-8">
                    <p>Your recent activity will appear here.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Listings Tab */}
            {activeTab === 'listings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">My Product Listings</h2>
                  <Link 
                    to="/sell/new" 
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                  >
                    Add New Listing
                  </Link>
                </div>
                
                {/* Placeholder for listings */}
                <div className="text-gray-500 text-center py-8 border border-gray-200 rounded-lg">
                  <p>You don't have any product listings yet.</p>
                  <p className="mt-2">
                    <Link 
                      to="/sell/new" 
                      className="text-green-600 hover:text-green-700"
                    >
                      Create your first listing
                    </Link>
                  </p>
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your Orders</h2>
                
                {/* Order type selector */}
                <div className="mb-6">
                  <select 
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    defaultValue="all"
                  >
                    <option value="all">All Orders</option>
                    <option value="buying">Purchases</option>
                    {userData.isSeller && (
                      <option value="selling">Sales</option>
                    )}
                  </select>
                </div>
                
                {/* Placeholder for orders */}
                <div className="text-gray-500 text-center py-8 border border-gray-200 rounded-lg">
                  <p>You don't have any orders yet.</p>
                  <p className="mt-2">
                    <Link 
                      to="/marketplace" 
                      className="text-green-600 hover:text-green-700"
                    >
                      Browse the marketplace
                    </Link>
                  </p>
                </div>
              </div>
            )}
            
            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
                
                {/* Placeholder for transactions */}
                <div className="text-gray-500 text-center py-8 border border-gray-200 rounded-lg">
                  <p>No transactions found.</p>
                </div>
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your Profile</h2>
                
                <div className="flex items-center mb-8">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mr-4">
                    {userData.profileImage ? (
                      <img 
                        src={userData.profileImage} 
                        alt={userData.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{userData.name}</h3>
                    <p className="text-gray-500">
                      {userData.isSeller ? 'Seller Account' : 'Buyer Account'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Wallet Address</p>
                    <p className="font-medium break-all">
                      {userData.walletAddress}
                    </p>
                  </div>
                  
                  {userData.location && (
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Location</p>
                      <p className="font-medium">{userData.location}</p>
                    </div>
                  )}
                  
                  {userData.phoneNumber && (
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Phone Number</p>
                      <p className="font-medium">{userData.phoneNumber}</p>
                    </div>
                  )}
                  
                  {userData.bio && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 text-sm mb-1">Bio</p>
                      <p>{userData.bio}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8">
                  <Link 
                    to="/profile/edit" 
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage; 