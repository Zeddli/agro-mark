import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to the request object
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No authentication token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; walletAddress: string };
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Verify the wallet address in the token matches the user's wallet address
      if (user.walletAddress !== decoded.walletAddress) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid authentication token',
        });
      }

      // Attach user to request object
      (req as any).user = {
        id: user.id,
        walletAddress: user.walletAddress,
      };

      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token',
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if token is missing
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // If no token, continue without attaching user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; walletAddress: string };
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (user && user.walletAddress === decoded.walletAddress) {
        // Attach user to request object
        (req as any).user = {
          id: user.id,
          walletAddress: user.walletAddress,
        };
      }
    } catch (error) {
      // Ignore errors in optional auth
      console.warn('Optional auth token error:', error);
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    console.warn('Optional auth middleware error:', error);
    next();
  }
}; 