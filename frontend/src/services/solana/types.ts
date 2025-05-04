/**
 * Types for Solana blockchain integration
 */

export type CurrencyType = 'SOL' | 'USDC' | 'USDT';

export interface TokenMetadata {
  mint: string;
  decimals: number;
  symbol: string;
}

export const TOKENS: Record<CurrencyType, TokenMetadata> = {
  SOL: {
    mint: 'So11111111111111111111111111111111111111112', // Native SOL SPL wrapper
    decimals: 9,
    symbol: 'SOL'
  },
  USDC: {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Devnet USDC
    decimals: 6,
    symbol: 'USDC'
  },
  USDT: {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Devnet USDT
    decimals: 6,
    symbol: 'USDT'
  }
}; 