import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEscrow } from '../../../src/hooks/useEscrow';
import { EscrowData, EscrowStatus } from '../../../src/services/solana/escrow.service';
import OrderDetailsCard from '../components/orders/OrderDetailsCard';

interface DisplayOrder {
  escrowPublicKey: PublicKey;
  escrowData: EscrowData;
  productName: string;
  productImage?: string;
  sellerName: string;
  signature?: string;
  trackingId?: string;
}

enum OrderTab {
  Purchases = 'purchases',
  Sales = 'sales'
}

/**
 * Page for displaying and managing orders (purchases and sales)
 */
export default function OrdersPage() {
  const { connected, publicKey } = useWallet();
  const { 
    fetchMyBuyerEscrows, 
    fetchMySellerEscrows, 
    confirmDelivery, 
    disputeTransaction,
    cancelEscrow,
    markAsShipped,
    loading, 
    error 
  } = useEscrow();
  
  // State for active tab, orders, and actions
  const [activeTab, setActiveTab] = useState<OrderTab>(OrderTab.Purchases);
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loadingAction, setLoadingAction] = useState<{ [key: string]: boolean }>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const [currentEscrow, setCurrentEscrow] = useState<PublicKey | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');
  const [showShippingModal, setShowShippingModal] = useState<boolean>(false);
  
  // Load orders when tab changes or wallet connects
  useEffect(() => {
    if (!connected || !publicKey) return;
    
    const fetchOrders = async () => {
      try {
        let escrowsWithPublicKey: { publicKey: PublicKey, data: EscrowData }[] = [];
        
        if (activeTab === OrderTab.Purchases) {
          escrowsWithPublicKey = await fetchMyBuyerEscrows();
        } else {
          escrowsWithPublicKey = await fetchMySellerEscrows();
        }
        
        // For a real implementation, we would fetch product details from a database
        // or from IPFS based on the product public key in each escrow
        const mockProductData: { [key: string]: { name: string, image?: string, seller: string } } = {
          'default': {
            name: 'Product Name',
            image: 'https://via.placeholder.com/150',
            seller: 'Farm Co-op'
          }
        };
        
        // Map escrow data to display format
        const displayOrders = escrowsWithPublicKey.map(({ publicKey, data }) => {
          // In a real app, fetch product details using data.product
          const productDetails = mockProductData['default'];
          
          return {
            escrowPublicKey: publicKey,
            escrowData: data,
            productName: productDetails.name,
            productImage: productDetails.image,
            sellerName: productDetails.seller,
            signature: 'mockSignature123456789abcdef', // Mock data
            trackingId: data.status === EscrowStatus.Shipped ? 'TRK123456789' : undefined
          };
        });
        
        setOrders(displayOrders);
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
      }
    };
    
    fetchOrders();
  }, [activeTab, connected, publicKey, fetchMyBuyerEscrows, fetchMySellerEscrows, refreshTrigger]);
  
  // Handle tab change
  const handleTabChange = (tab: OrderTab) => {
    setActiveTab(tab);
  };
  
  // Handle confirm delivery action
  const handleConfirmDelivery = async (escrowPublicKey: PublicKey) => {
    if (loadingAction[escrowPublicKey.toString()]) return;
    
    setLoadingAction({ ...loadingAction, [escrowPublicKey.toString()]: true });
    setActionError(null);
    
    try {
      await confirmDelivery(escrowPublicKey);
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error confirming delivery:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to confirm delivery');
    } finally {
      setLoadingAction({ ...loadingAction, [escrowPublicKey.toString()]: false });
    }
  };
  
  // Handle dispute action
  const handleOpenDispute = (escrowPublicKey: PublicKey) => {
    setCurrentEscrow(escrowPublicKey);
    setShowDisputeModal(true);
  };
  
  // Submit dispute
  const submitDispute = async () => {
    if (!currentEscrow || !disputeReason.trim()) return;
    
    setLoadingAction({ ...loadingAction, [currentEscrow.toString()]: true });
    setActionError(null);
    
    try {
      await disputeTransaction(currentEscrow, disputeReason);
      setShowDisputeModal(false);
      setDisputeReason('');
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error opening dispute:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to open dispute');
    } finally {
      setLoadingAction({ ...loadingAction, [currentEscrow.toString()]: false });
    }
  };
  
  // Handle cancel order action
  const handleCancelOrder = async (escrowPublicKey: PublicKey) => {
    if (loadingAction[escrowPublicKey.toString()]) return;
    
    setLoadingAction({ ...loadingAction, [escrowPublicKey.toString()]: true });
    setActionError(null);
    
    try {
      await cancelEscrow(escrowPublicKey);
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setLoadingAction({ ...loadingAction, [escrowPublicKey.toString()]: false });
    }
  };
  
  // Handle mark as shipped action
  const handleMarkAsShippedClick = (escrowPublicKey: PublicKey) => {
    setCurrentEscrow(escrowPublicKey);
    setShowShippingModal(true);
  };
  
  // Submit shipping info
  const submitShippingInfo = async () => {
    if (!currentEscrow) return;
    
    setLoadingAction({ ...loadingAction, [currentEscrow.toString()]: true });
    setActionError(null);
    
    try {
      await markAsShipped(currentEscrow, trackingId);
      setShowShippingModal(false);
      setTrackingId('');
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error marking as shipped:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to mark as shipped');
    } finally {
      setLoadingAction({ ...loadingAction, [currentEscrow.toString()]: false });
    }
  };
  
  // Render wallet connection prompt
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <h2 className="text-xl font-medium text-yellow-800 mb-2">Connect Your Wallet</h2>
          <p className="text-yellow-700">Please connect your wallet to view your orders.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {/* Error display */}
      {(error || actionError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error || actionError}
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => handleTabChange(OrderTab.Purchases)}
            className={`py-4 px-6 text-center text-sm font-medium ${
              activeTab === OrderTab.Purchases
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Purchases
          </button>
          <button
            onClick={() => handleTabChange(OrderTab.Sales)}
            className={`py-4 px-6 text-center text-sm font-medium ${
              activeTab === OrderTab.Sales
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Sales
          </button>
        </nav>
      </div>
      
      {/* Orders list */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {activeTab === OrderTab.Purchases
              ? 'You have not made any purchases yet.'
              : 'You have not made any sales yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderDetailsCard
              key={order.escrowPublicKey.toString()}
              escrowPublicKey={order.escrowPublicKey}
              productName={order.productName}
              productImage={order.productImage}
              sellerName={order.sellerName}
              sellerPublicKey={order.escrowData.seller}
              quantity={order.escrowData.quantity}
              price={order.escrowData.amount / order.escrowData.quantity}
              currency={order.escrowData.currency}
              status={order.escrowData.status}
              createdAt={order.escrowData.createdAt}
              updatedAt={order.escrowData.updatedAt}
              signature={order.signature}
              trackingId={order.trackingId}
              isBuyer={activeTab === OrderTab.Purchases}
              isSeller={activeTab === OrderTab.Sales}
              onMarkAsReceived={() => handleConfirmDelivery(order.escrowPublicKey)}
              onOpenDispute={() => handleOpenDispute(order.escrowPublicKey)}
              onCancelOrder={() => handleCancelOrder(order.escrowPublicKey)}
              onMarkAsShipped={() => handleMarkAsShippedClick(order.escrowPublicKey)}
            />
          ))}
        </div>
      )}
      
      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Report a Problem</h3>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe the issue with your order..."
              className="w-full p-2 border border-gray-300 rounded mb-4 h-32"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                disabled={!disputeReason.trim() || loadingAction[currentEscrow?.toString() || '']}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
              >
                {loadingAction[currentEscrow?.toString() || ''] ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Enter Shipping Information</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number (optional)
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowShippingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitShippingInfo}
                disabled={loadingAction[currentEscrow?.toString() || '']}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
              >
                {loadingAction[currentEscrow?.toString() || ''] ? 'Processing...' : 'Mark as Shipped'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 