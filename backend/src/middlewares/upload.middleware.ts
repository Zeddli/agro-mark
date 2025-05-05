import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

/**
 * Configure multer for memory storage
 * Files will be processed in memory and then saved to permanent storage
 */
const storage = multer.memoryStorage();

/**
 * File filter to accept only images
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

/**
 * Configure multer with size limits and filters
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 10 // Max 10 files
  },
  fileFilter
});

/**
 * Middleware for handling single file uploads
 * @param fieldName - Form field name for the file
 */
export const singleUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              status: 'error',
              message: 'File too large. Maximum size is 5MB.'
            });
          }
          return res.status(400).json({
            status: 'error',
            message: `Upload error: ${err.message}`
          });
        }
        
        // Other errors
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      next();
    });
  };
};

/**
 * Middleware for handling multiple file uploads
 * @param fieldName - Form field name for the files
 * @param maxCount - Maximum number of files
 */
export const multipleUpload = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMultiple = upload.array(fieldName, maxCount);
    
    uploadMultiple(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              status: 'error',
              message: 'File too large. Maximum size is 5MB.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              status: 'error',
              message: `Too many files. Maximum is ${maxCount}.`
            });
          }
          return res.status(400).json({
            status: 'error',
            message: `Upload error: ${err.message}`
          });
        }
        
        // Other errors
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      next();
    });
  };
}; 