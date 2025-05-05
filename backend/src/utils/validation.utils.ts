import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';

/**
 * Middleware for handling validation errors from express-validator
 * @returns Express middleware function
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for validation errors
  const errors = validationResult(req);
  
  // If there are errors, return them as a JSON response
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: errors.array().map((err: ValidationError) => ({
        field: typeof err === 'object' && 'path' in err ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  
  // No errors, continue to the next middleware
  next();
};

/**
 * Validation middleware helper that combines express-validator chains with error handling
 * @param validations - Array of validation chains
 * @returns Middleware array with validations and error handler
 */
export const validate = (validations: ValidationChain[]) => {
  return [...validations, handleValidationErrors];
};

/**
 * Format error message for use in API responses
 * @param error - Error object
 * @param defaultMessage - Default message to use if error doesn't have a message
 * @returns Formatted error object
 */
export const formatError = (error: any, defaultMessage = 'An error occurred') => {
  console.error(error);
  
  return {
    status: 'error',
    message: error.message || defaultMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};

/**
 * Validate ID format (for UUID validation)
 * @param id - ID to validate
 * @returns Whether ID is valid
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validate Solana wallet address format
 * @param address - Wallet address to validate
 * @returns Whether address is valid
 */
export const isValidSolanaAddress = (address: string): boolean => {
  // Simple validation - Solana addresses are base58 encoded and typically 32-44 characters
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  // Basic sanitization - replace HTML tags with entity equivalents
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}; 