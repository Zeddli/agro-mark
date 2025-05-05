import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { solanaEscrowService, EscrowData, EscrowStatus } from '../services/solana/escrow.service';
import { CurrencyType } from '../services/solana/types';

/**
 * Custom hook for interacting with the Solana blockchain escrow system
 * Provides methods for creating and managing escrow transactions
 */
export function useEscrow() {
  const { publicKey, connected, wallet } = useWallet();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the Solana escrow service when the wallet connects
  useEffect(() => {
    if (connected && publicKey && wallet) {
      try {
        solanaEscrowService.initialize(wallet.adapter);
        setInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Error initializing Solana escrow service:', err);
        setError('Failed to initialize Solana escrow service');
        setInitialized(false);
      }
    } else {
      setInitialized(false);
    }
  }, [connected, publicKey, wallet]);

  /**
   * Create a new escrow for a product purchase
   * @param productPublicKey Product's public key
   * @param quantity Quantity to purchase
   * @returns Transaction signature
   */
  const createEscrow = useCallback(async (
    productPublicKey: PublicKey,
    quantity: number
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Escrow service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to create the escrow
      const signature = await solanaEscrowService.createEscrow(productPublicKey, quantity);
      return signature;
    } catch (err) {
      console.error('Error creating escrow on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create escrow on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Fund an escrow with payment
   * @param escrowPublicKey Escrow's public key
   * @param escrowVault Escrow vault's public key
   * @param amount Amount to fund
   * @param currencyType Currency type
   * @returns Transaction signature
   */
  const fundEscrow = useCallback(async (
    escrowPublicKey: PublicKey,
    escrowVault: PublicKey,
    amount: number,
    currencyType: CurrencyType
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Escrow service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to fund the escrow
      const signature = await solanaEscrowService.fundEscrow(
        escrowPublicKey,
        escrowVault,
        amount,
        currencyType
      );
      return signature;
    } catch (err) {
      console.error('Error funding escrow on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fund escrow on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Mark an escrow as shipped (for sellers)
   * @param escrowPublicKey Escrow's public key
   * @param trackingId Optional tracking ID
   * @returns Transaction signature
   */
  const markAsShipped = useCallback(async (
    escrowPublicKey: PublicKey,
    trackingId?: string
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Escrow service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to mark as shipped
      const signature = await solanaEscrowService.markAsShipped(escrowPublicKey, trackingId);
      return signature;
    } catch (err) {
      console.error('Error marking escrow as shipped on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark escrow as shipped on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Confirm delivery of products (for buyers)
   * @param escrowPublicKey Escrow's public key
   * @returns Transaction signature
   */
  const confirmDelivery = useCallback(async (
    escrowPublicKey: PublicKey
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Escrow service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to confirm delivery
      const signature = await solanaEscrowService.confirmDelivery(escrowPublicKey);
      return signature;
    } catch (err) {
      console.error('Error confirming delivery on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm delivery on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Open a dispute for an escrow
   * @param escrowPublicKey Escrow's public key
   * @param reason Reason for the dispute
   * @returns Transaction signature
   */
  const disputeTransaction = useCallback(async (
    escrowPublicKey: PublicKey,
    reason: string
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Escrow service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to open a dispute
      const signature = await solanaEscrowService.disputeTransaction(escrowPublicKey, reason);
      return signature;
    } catch (err) {
      console.error('Error opening dispute on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to open dispute on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Cancel an escrow and refund the buyer
   * @param escrowPublicKey Escrow's public key
   * @returns Transaction signature
   */
  const cancelEscrow = useCallback(async (
    escrowPublicKey: PublicKey
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Escrow service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to cancel the escrow
      const signature = await solanaEscrowService.cancelEscrow(escrowPublicKey);
      return signature;
    } catch (err) {
      console.error('Error cancelling escrow on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel escrow on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Fetch a specific escrow by its public key
   * @param escrowPublicKey Escrow's public key
   * @returns Escrow data
   */
  const fetchEscrow = useCallback(async (
    escrowPublicKey: PublicKey
  ): Promise<EscrowData> => {
    if (!initialized) {
      throw new Error('Escrow service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to fetch the escrow
      const escrow = await solanaEscrowService.getEscrow(escrowPublicKey);
      return escrow;
    } catch (err) {
      console.error('Error fetching escrow from Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch escrow from blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * Fetch all escrows where the current wallet is the buyer
   * @returns Array of escrows
   */
  const fetchMyBuyerEscrows = useCallback(async (): Promise<{publicKey: PublicKey, data: EscrowData}[]> => {
    if (!initialized || !publicKey) {
      throw new Error('Escrow service not initialized or wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to fetch buyer escrows
      const escrows = await solanaEscrowService.getEscrowsByBuyer(publicKey);
      return escrows;
    } catch (err) {
      console.error('Error fetching buyer escrows from Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch buyer escrows from blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized, publicKey]);

  /**
   * Fetch all escrows where the current wallet is the seller
   * @returns Array of escrows
   */
  const fetchMySellerEscrows = useCallback(async (): Promise<{publicKey: PublicKey, data: EscrowData}[]> => {
    if (!initialized || !publicKey) {
      throw new Error('Escrow service not initialized or wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the service method to fetch seller escrows
      const escrows = await solanaEscrowService.getEscrowsBySeller(publicKey);
      return escrows;
    } catch (err) {
      console.error('Error fetching seller escrows from Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch seller escrows from blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized, publicKey]);

  /**
   * Complete purchase flow - creates and funds an escrow
   * @param productPublicKey Product's public key
   * @param quantity Quantity to purchase
   * @param price Price per unit
   * @param currency Currency type
   * @returns Transaction signatures for both create and fund
   */
  const completePurchase = useCallback(async (
    productPublicKey: PublicKey,
    quantity: number,
    price: number,
    currency: CurrencyType
  ): Promise<{createSignature: string, fundSignature: string}> => {
    if (!initialized || !publicKey) {
      throw new Error('Escrow service not initialized or wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create the escrow
      const createSignature = await solanaEscrowService.createEscrow(productPublicKey, quantity);
      
      // Step 2: Get the escrow PDA
      const [escrowPDA] = await solanaEscrowService.getEscrowPDA(publicKey, productPublicKey);
      
      // Mock escrow vault - in a real implementation, this would be determined by the escrow program
      const escrowVault = new PublicKey('EscrowVaultPubkey123456789123456789123456789');
      
      // Calculate total amount (price * quantity)
      const totalAmount = price * quantity;
      
      // Step 3: Fund the escrow
      const fundSignature = await solanaEscrowService.fundEscrow(
        escrowPDA,
        escrowVault,
        totalAmount,
        currency
      );
      
      return {
        createSignature,
        fundSignature
      };
    } catch (err) {
      console.error('Error completing purchase on Solana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete purchase on blockchain';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized, publicKey]);

  /**
   * Format escrow status into a user-friendly string
   * @param status Escrow status
   * @returns Formatted status string
   */
  const formatEscrowStatus = (status: EscrowStatus): string => {
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

  return {
    initialized,
    loading,
    error,
    createEscrow,
    fundEscrow,
    markAsShipped,
    confirmDelivery,
    disputeTransaction,
    cancelEscrow,
    fetchEscrow,
    fetchMyBuyerEscrows,
    fetchMySellerEscrows,
    completePurchase,
    formatEscrowStatus
  };
} 