import { create } from 'ipfs-http-client';

/**
 * Configuration for IPFS connection
 * Using Infura's IPFS service as the provider
 */
const IPFS_BASE_URL = 'https://ipfs.infura.io:5001/api/v0';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

/**
 * Service for interacting with IPFS
 * Provides methods for uploading images and files to IPFS
 */
export class IPFSService {
  private client;

  constructor() {
    // Create a client using the infura IPFS API
    this.client = create({
      url: IPFS_BASE_URL,
      headers: {
        authorization: `Basic ${btoa(
          `${process.env.REACT_APP_INFURA_PROJECT_ID}:${process.env.REACT_APP_INFURA_PROJECT_SECRET}`
        )}`,
      }
    });
  }

  /**
   * Upload a single file to IPFS
   * @param file - The file to upload
   * @returns The IPFS CID and URL of the uploaded file
   */
  async uploadFile(file: File): Promise<{ cid: string; url: string }> {
    try {
      // Convert file to buffer for IPFS
      const buffer = await this.fileToBuffer(file);
      
      // Add the file to IPFS
      const result = await this.client.add(buffer);
      
      // Get the CID (Content Identifier)
      const cid = result.path;
      
      // Create a public URL through an IPFS gateway
      const url = `${IPFS_GATEWAY}${cid}`;
      
      return { cid, url };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  /**
   * Upload multiple files to IPFS
   * @param files - Array of files to upload
   * @returns Array of CIDs and URLs for the uploaded files
   */
  async uploadFiles(files: File[]): Promise<Array<{ cid: string; url: string }>> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Convert a file to a buffer for IPFS upload
   * @param file - The file to convert
   * @returns A buffer of the file
   */
  private async fileToBuffer(file: File): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const buffer = Buffer.from(reader.result as ArrayBuffer);
          resolve(buffer);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}

// Create and export a singleton instance
export const ipfsService = new IPFSService(); 