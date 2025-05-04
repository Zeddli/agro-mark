import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEscrow } from '../../hooks/useEscrow';
import { CurrencyType, TOKENS } from '../../services/solana/types';
import TransactionProgress from './TransactionProgress';
import TransactionSignature from './TransactionSignature';

interface PurchaseFlowProps {
  productId: string;
  productPublicKey: PublicKey;
  productTitle: string;
  productDescription: string;
  sellerPublicKey: PublicKey;
  price: number;
  currency: CurrencyType;
  availableQuantity: number;
  imageUri?: string;
  onComplete: () => void;
  onCancel: () => void;
}

enum PurchaseStep {
  Quantity = 0,
  Review = 1,
  Processing = 2,
  Confirmation = 3,
  Error = 4
}

export default function PurchaseFlow({
  productId,
  productPublicKey,
  productTitle,
  productDescription,
  sellerPublicKey,
  price,
  currency,
  availableQuantity,
  imageUri,
  onComplete,
  onCancel
}: PurchaseFlowProps) {
  const { publicKey, connected } = useWallet();
  const { completePurchase, loading, error } = useEscrow();
  
  const [step, setStep] = useState<PurchaseStep>(PurchaseStep.Quantity);
  const [quantity, setQuantity] = useState<number>(1);
  const [transactionSignatures, setTransactionSignatures] = useState<{
    createSignature?: string;
    fundSignature?: string;
  }>({});
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Calculate total price
  const totalPrice = price * quantity;
  
  // Check wallet connection
  useEffect(() => {
    if (!connected) {
      setProcessingError('Please connect your wallet to make a purchase');
      setStep(PurchaseStep.Error);
    }
  }, [connected]);
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= availableQuantity) {
      setQuantity(value);
    }
  };
  
  // Proceed to review
  const handleProceedToReview = () => {
    setStep(PurchaseStep.Review);
  };
  
  // Handle purchase confirmation
  const handleConfirmPurchase = async () => {
    if (!connected || !publicKey) {
      setProcessingError('Wallet not connected');
      setStep(PurchaseStep.Error);
      return;
    }
    
    setStep(PurchaseStep.Processing);
    setProcessingStep(0);
    
    try {
      // Step 1: Create and fund escrow
      setProcessingStep(1);
      const { createSignature, fundSignature } = await completePurchase(
        productPublicKey,
        quantity,
        price,
        currency
      );
      
      setTransactionSignatures({
        createSignature,
        fundSignature
      });
      
      // Step 2: Confirm transaction complete
      setProcessingStep(2);
      
      // Move to confirmation step
      setStep(PurchaseStep.Confirmation);
    } catch (err) {
      console.error('Error processing purchase:', err);
      setProcessingError(err instanceof Error ? err.message : 'An error occurred during purchase');
      setStep(PurchaseStep.Error);
    }
  };
  
  // Format currency display
  const formatCurrency = (value: number, currency: CurrencyType) => {
    const decimals = TOKENS[currency].decimals;
    return `${(value / Math.pow(10, decimals)).toFixed(decimals)} ${currency}`;
  };
  
  // Render different steps
  const renderStep = () => {
    switch (step) {
      case PurchaseStep.Quantity:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Purchase {productTitle}</h2>
            <div className="mb-4">
              {imageUri && (
                <img 
                  src={imageUri} 
                  alt={productTitle} 
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <p className="text-gray-700 mb-2">{productDescription}</p>
              <p className="text-xl font-semibold">
                Price: {formatCurrency(price, currency)} per unit
              </p>
              <p className="text-sm text-gray-500">
                Available: {availableQuantity} units
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={availableQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToReview}
                disabled={quantity <= 0 || quantity > availableQuantity}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Proceed to Review
              </button>
            </div>
          </div>
        );
        
      case PurchaseStep.Review:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Review Purchase</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg">{productTitle}</h3>
              <p className="text-gray-600 mb-4">From: {sellerPublicKey.toString().slice(0, 8)}...</p>
              
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <div className="flex justify-between mb-2">
                  <span>Price per unit:</span>
                  <span className="font-medium">{formatCurrency(price, currency)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">{formatCurrency(totalPrice, currency)}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-blue-800 mb-4">
                <h4 className="font-semibold mb-1">Escrow Protection</h4>
                <p className="text-sm">
                  Your payment will be held in a secure escrow contract until you confirm delivery.
                  Funds will only be released to the seller after you confirm receipt of the product.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(PurchaseStep.Quantity)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        );
        
      case PurchaseStep.Processing:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Processing Your Purchase</h2>
            <TransactionProgress 
              currentStep={processingStep}
              steps={[
                { 
                  title: 'Preparing', 
                  description: 'Getting ready to process your transaction' 
                },
                { 
                  title: 'Creating Escrow', 
                  description: 'Creating a secure escrow for your purchase' 
                },
                { 
                  title: 'Confirming', 
                  description: 'Confirming the transaction on the blockchain' 
                }
              ]}
            />
          </div>
        );
        
      case PurchaseStep.Confirmation:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Purchase Successful!</h2>
            
            <div className="mb-6">
              <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-800 mb-4">
                <h4 className="font-semibold mb-1">Escrow Created Successfully</h4>
                <p className="text-sm">
                  Your payment of {formatCurrency(totalPrice, currency)} has been securely 
                  placed in escrow. The seller has been notified and will ship your product soon.
                </p>
              </div>
              
              <h3 className="font-semibold text-lg mt-4 mb-2">Transaction Details</h3>
              {transactionSignatures.createSignature && (
                <TransactionSignature 
                  title="Escrow Creation" 
                  signature={transactionSignatures.createSignature} 
                />
              )}
              
              {transactionSignatures.fundSignature && (
                <TransactionSignature 
                  title="Escrow Funding" 
                  signature={transactionSignatures.fundSignature} 
                />
              )}
              
              <p className="mt-4 text-gray-600">
                You can view your purchase details and track status in your Orders page.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onComplete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Orders
              </button>
            </div>
          </div>
        );
        
      case PurchaseStep.Error:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800 mb-6">
              <h4 className="font-semibold mb-1">Transaction Failed</h4>
              <p>{processingError || 'An unexpected error occurred during the purchase process.'}</p>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(PurchaseStep.Quantity)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-lg mx-auto">
      {renderStep()}
    </div>
  );
} 