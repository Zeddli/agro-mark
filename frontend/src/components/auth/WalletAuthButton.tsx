import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import bs58 from 'bs58';

interface WalletAuthButtonProps {
  onAuth?: (token: string) => void;
  buttonText?: string;
  className?: string;
}

/**
 * Wallet authentication button component
 * Handles wallet connection and server authentication
 */
const WalletAuthButton: React.FC<WalletAuthButtonProps> = ({
  onAuth,
  buttonText = 'Sign in with Wallet',
  className = ''
}) => {
  const { connected, publicKey, signMessage } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Attempt authentication when wallet is connected
  useEffect(() => {
    if (connected && publicKey && !isAuthenticating) {
      handleAuthentication();
    }
  }, [connected, publicKey]);

  const handleAuthentication = async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet does not support message signing');
      return;
    }

    try {
      setIsAuthenticating(true);
      setError(null);

      // 1. Request challenge from server
      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
        }),
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to get authentication challenge');
      }

      const { data: { challenge } } = await challengeResponse.json();

      // 2. Sign the challenge with wallet
      const encodedMessage = new TextEncoder().encode(challenge);
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);

      // 3. Verify signature with server
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature: signatureBase58,
          challenge,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const { data: { token, user } } = await verifyResponse.json();

      // Save auth token to local storage
      localStorage.setItem('authToken', token);
      
      // Call onAuth callback if provided
      if (onAuth) {
        onAuth(token);
      }

      // Redirect if user has no profile
      if (!user.name) {
        navigate('/profile/setup');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex flex-col">
      <WalletMultiButton 
        className={`wallet-adapter-button ${className}`} 
      />
      
      {isAuthenticating && (
        <div className="mt-2 text-sm text-blue-600">
          <span className="animate-pulse">Authenticating...</span>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletAuthButton; 