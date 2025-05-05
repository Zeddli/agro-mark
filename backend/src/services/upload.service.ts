import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Request } from 'express';

/**
 * Upload Service for handling file uploads
 * In production, this would be replaced with a proper cloud storage solution
 */
export class UploadService {
  private uploadDir: string;
  
  constructor() {
    // Set upload directory
    this.uploadDir = path.join(process.cwd(), 'uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
  
  /**
   * Save file to local storage
   * @param file - Express file upload object
   * @param subfolder - Subfolder to organize uploads
   */
  async saveFile(file: Express.Multer.File, subfolder: string = 'products'): Promise<string> {
    try {
      // Create a unique filename
      const fileExt = path.extname(file.originalname);
      const randomName = crypto.randomBytes(16).toString('hex');
      const fileName = `${randomName}${fileExt}`;
      
      // Create subfolder if it doesn't exist
      const targetDir = path.join(this.uploadDir, subfolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Save file
      const filePath = path.join(targetDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      
      // Return the relative URL path to the file
      return `/uploads/${subfolder}/${fileName}`;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }
  
  /**
   * Save multiple files
   * @param files - Array of Express file upload objects
   * @param subfolder - Subfolder to organize uploads
   */
  async saveMultipleFiles(files: Express.Multer.File[], subfolder: string = 'products'): Promise<string[]> {
    try {
      const fileUrls: string[] = [];
      
      for (const file of files) {
        const fileUrl = await this.saveFile(file, subfolder);
        fileUrls.push(fileUrl);
      }
      
      return fileUrls;
    } catch (error) {
      console.error('Error saving multiple files:', error);
      throw new Error('Failed to save files');
    }
  }
  
  /**
   * Delete a file
   * @param fileUrl - The URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract the file path from the URL
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(this.uploadDir, relativePath);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
} 