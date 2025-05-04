import React, { useState, useEffect } from 'react';
import { useIPFS } from '../../hooks/useIPFS';

interface IPFSImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * IPFSImage component for displaying images stored on IPFS
 * Handles different IPFS URL formats and provides fallback mechanisms
 */
const IPFSImage: React.FC<IPFSImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder-product.jpg',
  onLoad,
  onError,
}) => {
  const { parseIPFSUrl } = useIPFS();
  const [imageUrl, setImageUrl] = useState<string>(src);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Reset error state when src changes
    setError(false);
    
    // Handle different IPFS URL formats
    try {
      // If it's already an HTTP URL from an IPFS gateway, use it directly
      if (src.startsWith('http') && src.includes('/ipfs/')) {
        setImageUrl(src);
        return;
      }
      
      // If it's an IPFS protocol URL, convert it to HTTP gateway URL
      if (src.startsWith('ipfs://')) {
        const ipfsData = parseIPFSUrl(src);
        if (ipfsData) {
          setImageUrl(ipfsData.gatewayUrl);
        }
        return;
      }
      
      // If it's just a CID, convert it to a gateway URL
      if (src.match(/^[a-zA-Z0-9]{46,59}$/)) {
        setImageUrl(`https://ipfs.io/ipfs/${src}`);
        return;
      }
      
      // Otherwise use as is
      setImageUrl(src);
    } catch (err) {
      console.error('Error processing IPFS URL:', err);
      setError(true);
    }
  }, [src, parseIPFSUrl]);

  const handleError = () => {
    // Try an alternative gateway if the first one fails
    if (!error && imageUrl.includes('ipfs.io')) {
      console.log('Primary gateway failed, trying alternative gateway');
      // Use Infura or Cloudflare IPFS gateway as backup
      const cid = imageUrl.split('/ipfs/')[1];
      setImageUrl(`https://cloudflare-ipfs.com/ipfs/${cid}`);
      setError(true);
    } else if (error) {
      // If already tried an alternative, use fallback image
      setImageUrl(fallbackSrc);
      if (onError) onError();
    }
  };

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

export default IPFSImage; 