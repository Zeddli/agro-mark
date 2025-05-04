import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { CurrencyType } from '../../services/solana/types';
import PurchaseFlow from '../purchase/PurchaseFlow';

interface ProductBuyButtonProps {
  productId: string;
  productPublicKey: PublicKey;
  productTitle: string;
  productDescription: string;
  sellerPublicKey: PublicKey;
  price: number;
  currency: CurrencyType;
  availableQuantity: number;
  imageUri?: string;
  buttonText?: string;
  className?: string;
}

/**
 * Buy button for product that opens the purchase flow when clicked
 */
export default function ProductBuyButton({
  productId,
  productPublicKey,
  productTitle,
  productDescription,
  sellerPublicKey,
  price,
  currency,
  availableQuantity,
  imageUri,
  buttonText = 'Buy Now',
  className = ''
}: ProductBuyButtonProps) {
  // State to track if purchase flow is open
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  
  // Get wallet connection state
  const { connected } = useWallet();
  
  // Handle button click
  const handleBuyClick = () => {
    setShowPurchaseFlow(true);
  };
  
  // Handle purchase flow completion
  const handlePurchaseComplete = () => {
    setShowPurchaseFlow(false);
    // Optionally redirect to orders page
    window.location.href = '/orders';
  };
  
  // Handle purchase flow cancellation
  const handlePurchaseCancel = () => {
    setShowPurchaseFlow(false);
  };
  
  // Default button styles if none provided
  const defaultClassName = 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow transition-colors';
  const buttonClassName = className || defaultClassName;
  
  return (
    <>
      <button
        onClick={handleBuyClick}
        disabled={!connected || availableQuantity <= 0}
        className={`${buttonClassName} ${
          (!connected || availableQuantity <= 0) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {availableQuantity <= 0 ? 'Out of Stock' : buttonText}
      </button>
      
      {/* Show purchase flow modal when open */}
      {showPurchaseFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <PurchaseFlow
              productId={productId}
              productPublicKey={productPublicKey}
              productTitle={productTitle}
              productDescription={productDescription}
              sellerPublicKey={sellerPublicKey}
              price={price}
              currency={currency}
              availableQuantity={availableQuantity}
              imageUri={imageUri}
              onComplete={handlePurchaseComplete}
              onCancel={handlePurchaseCancel}
            />
          </div>
        </div>
      )}
    </>
  );
} 