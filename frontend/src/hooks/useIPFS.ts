import { useState } from 'react';
import { ipfsService } from '../services/ipfs.service';

/**
 * Custom hook for interacting with IPFS services
 * Provides methods and state for uploading files to IPFS
 */
export function useIPFS() {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Upload a single file to IPFS
   * @param file - The file to upload
   * @returns The IPFS CID and URL of the uploaded file
   */
  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Mock progress updates (since IPFS client doesn't provide progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Perform the upload
      const result = await ipfsService.uploadFile(file);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return result;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      setUploadError('Failed to upload file to IPFS');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Upload multiple files to IPFS
   * @param files - Array of files to upload
   * @returns Array of CIDs and URLs for the uploaded files
   */
  const uploadFiles = async (files: File[]) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Mock progress updates for UI feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Perform the upload
      const results = await ipfsService.uploadFiles(files);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return results;
    } catch (error) {
      console.error('Error uploading files to IPFS:', error);
      setUploadError('Failed to upload files to IPFS');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Parse an IPFS URL to get its components
   * @param url - The IPFS URL to parse
   * @returns An object containing the IPFS components
   */
  const parseIPFSUrl = (url: string) => {
    // Support for parsing both ipfs:// and https://ipfs.io/ipfs/ formats
    if (url.startsWith('ipfs://')) {
      const cid = url.replace('ipfs://', '');
      return {
        cid,
        protocol: 'ipfs://',
        gateway: 'https://ipfs.io/ipfs/',
        gatewayUrl: `https://ipfs.io/ipfs/${cid}`
      };
    } else if (url.includes('/ipfs/')) {
      const parts = url.split('/ipfs/');
      const gateway = parts[0] + '/ipfs/';
      const cid = parts[1];
      return {
        cid,
        protocol: 'https://',
        gateway,
        gatewayUrl: url
      };
    }
    
    // Not a valid IPFS URL
    return null;
  };

  /**
   * Convert a CID to a gateway URL
   * @param cid - The IPFS Content Identifier 
   * @returns A public gateway URL for the content
   */
  const cidToGatewayUrl = (cid: string) => {
    return `https://ipfs.io/ipfs/${cid}`;
  };

  return {
    uploadFile,
    uploadFiles,
    parseIPFSUrl,
    cidToGatewayUrl,
    isUploading,
    uploadProgress,
    uploadError
  };
} 