import React from 'react';

interface TransactionSignatureProps {
  title: string;
  signature: string;
}

/**
 * Component to display a transaction signature with a link to the explorer
 */
export default function TransactionSignature({ title, signature }: TransactionSignatureProps) {
  // Format the signature for display (truncate with ellipsis)
  const formatSignature = (sig: string): string => {
    if (sig.length < 20) return sig;
    return `${sig.substring(0, 10)}...${sig.substring(sig.length - 10)}`;
  };

  // Generate a Solana explorer URL for the transaction
  const getExplorerUrl = (sig: string): string => {
    return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
  };

  return (
    <div className="mb-2 py-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">{title}:</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {formatSignature(signature)}
          </span>
          <a
            href={getExplorerUrl(signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
} 