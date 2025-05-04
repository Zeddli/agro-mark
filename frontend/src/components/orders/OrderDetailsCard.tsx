import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { EscrowStatus } from '../../services/solana/escrow.service';
import { CurrencyType, TOKENS } from '../../services/solana/types';
import TransactionSignature from '../purchase/TransactionSignature';

interface OrderDetailsCardProps {
  escrowPublicKey: PublicKey;
  productName: string;
  productImage?: string;
  sellerName: string;
  sellerPublicKey: PublicKey;
  quantity: number;
  price: number;
  currency: CurrencyType;
  status: EscrowStatus;
  createdAt: number;
  updatedAt: number;
  signature?: string;
  trackingId?: string;
  onMarkAsReceived?: () => void;
  onOpenDispute?: () => void;
  onCancelOrder?: () => void;
  onMarkAsShipped?: () => void;
  isBuyer?: boolean;
  isSeller?: boolean;
}

/**
 * Card component for displaying comprehensive order details
 * Shows different actions based on order status and user role (buyer/seller)
 */
export default function OrderDetailsCard({
  escrowPublicKey,
  productName,
  productImage,
  sellerName,
  sellerPublicKey,
  quantity,
  price,
  currency,
  status,
  createdAt,
  updatedAt,
  signature,
  trackingId,
  onMarkAsReceived,
  onOpenDispute,
  onCancelOrder,
  onMarkAsShipped,
  isBuyer = false,
  isSeller = false
}: OrderDetailsCardProps) {
  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // Format currency display with proper decimals
  const formatCurrency = (value: number): string => {
    const decimals = TOKENS[currency].decimals;
    return `${(value / Math.pow(10, decimals)).toFixed(decimals)} ${currency}`;
  };
  
  // Calculate total price
  const totalPrice = price * quantity;
  
  // Get status badge style
  const getStatusBadge = () => {
    switch (status) {
      case EscrowStatus.Created:
        return 'bg-yellow-100 text-yellow-800';
      case EscrowStatus.Funded:
        return 'bg-blue-100 text-blue-800';
      case EscrowStatus.Shipped:
        return 'bg-purple-100 text-purple-800';
      case EscrowStatus.Completed:
        return 'bg-green-100 text-green-800';
      case EscrowStatus.Disputed:
        return 'bg-red-100 text-red-800';
      case EscrowStatus.Cancelled:
        return 'bg-gray-100 text-gray-800';
      case EscrowStatus.Refunded:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get humanized status text
  const getStatusText = (): string => {
    switch (status) {
      case EscrowStatus.Created:
        return 'Awaiting Payment';
      case EscrowStatus.Funded:
        return 'Paid - Awaiting Shipment';
      case EscrowStatus.Shipped:
        return 'Shipped - In Transit';
      case EscrowStatus.Completed:
        return 'Completed';
      case EscrowStatus.Disputed:
        return 'Disputed';
      case EscrowStatus.Cancelled:
        return 'Cancelled';
      case EscrowStatus.Refunded:
        return 'Refunded';
      default:
        return 'Unknown';
    }
  };
  
  // Determine available actions based on status and user role
  const getBuyerActions = () => {
    if (!isBuyer) return null;
    
    switch (status) {
      case EscrowStatus.Shipped:
        return (
          <div className="mt-2 space-x-2 flex justify-between">
            <button 
              onClick={onMarkAsReceived}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Confirm Receipt
            </button>
            <button 
              onClick={onOpenDispute}
              className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
            >
              Report Issue
            </button>
          </div>
        );
      
      case EscrowStatus.Funded:
        return (
          <div className="mt-2 space-x-2 flex justify-end">
            <button 
              onClick={onCancelOrder}
              className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200"
            >
              Cancel Order
            </button>
          </div>
        );
        
      case EscrowStatus.Created:
        return (
          <div className="mt-2 space-x-2 flex justify-end">
            <button 
              onClick={onCancelOrder}
              className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200"
            >
              Cancel Order
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Seller actions based on status
  const getSellerActions = () => {
    if (!isSeller) return null;
    
    switch (status) {
      case EscrowStatus.Funded:
        return (
          <div className="mt-2 flex justify-end">
            <button 
              onClick={onMarkAsShipped}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Mark as Shipped
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Header with status */}
      <div className={`p-3 ${getStatusBadge()}`}>
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">Order #{escrowPublicKey.toString().slice(-6)}</span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white bg-opacity-30">
            {getStatusText()}
          </span>
        </div>
      </div>
      
      {/* Product info */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {productImage && (
            <img 
              src={productImage} 
              alt={productName} 
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div>
            <h3 className="font-medium text-gray-900">{productName}</h3>
            <p className="text-sm text-gray-500">
              {isBuyer 
                ? `Seller: ${sellerName}` 
                : `Buyer: ${sellerPublicKey.toString().slice(0, 8)}...`}
            </p>
          </div>
        </div>
        
        {/* Order details */}
        <div className="mt-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500">Quantity:</p>
              <p className="font-medium">{quantity}</p>
            </div>
            <div>
              <p className="text-gray-500">Price:</p>
              <p className="font-medium">{formatCurrency(price)} per unit</p>
            </div>
            <div>
              <p className="text-gray-500">Total:</p>
              <p className="font-medium">{formatCurrency(totalPrice)}</p>
            </div>
            <div>
              <p className="text-gray-500">Date:</p>
              <p className="font-medium">{formatDate(createdAt)}</p>
            </div>
          </div>
          
          {/* Tracking info (if available) */}
          {trackingId && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800 text-xs">
              <p className="font-semibold">Tracking Number:</p>
              <p className="font-mono">{trackingId}</p>
            </div>
          )}
          
          {/* Transaction signature */}
          {signature && (
            <div className="mt-2">
              <TransactionSignature title="Transaction" signature={signature} />
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        {getBuyerActions() || getSellerActions()}
      </div>
    </div>
  );
} 