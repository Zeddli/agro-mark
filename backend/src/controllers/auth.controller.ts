import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';
const JWT_EXPIRY = '7d';

/**
 * Authentication controller for wallet-based authentication
 */
export class AuthController {
  /**
   * Generate a challenge message for the user to sign with their wallet
   * This ensures that the user owns the wallet they claim to own
   */
  static async generateChallenge(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      // Validate wallet address
      if (!walletAddress) {
        return res.status(400).json({
          status: 'error',
          message: 'Wallet address is required',
        });
      }

      try {
        // Verify the wallet address is a valid Solana address
        new PublicKey(walletAddress);
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid wallet address',
        });
      }

      // Generate a random challenge with timestamp
      const timestamp = new Date().toISOString();
      const challenge = `Sign this message to authenticate with AgroMark: ${timestamp}`;

      return res.status(200).json({
        status: 'success',
        data: {
          challenge,
          timestamp,
        }
      });
    } catch (error) {
      console.error('Error generating challenge:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error generating authentication challenge',
      });
    }
  }

  /**
   * Verify the signature and authenticate the user
   * If the user doesn't exist, create a new user account
   */
  static async verifySignature(req: Request, res: Response) {
    try {
      const { walletAddress, signature, challenge } = req.body;

      // Validate inputs
      if (!walletAddress || !signature || !challenge) {
        return res.status(400).json({
          status: 'error',
          message: 'Wallet address, signature, and challenge are required',
        });
      }

      try {
        // Verify the wallet address format
        const publicKey = new PublicKey(walletAddress);
        
        // Verify signature
        const messageBytes = new TextEncoder().encode(challenge);
        const signatureBytes = bs58.decode(signature);
        
        const isValid = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKey.toBytes()
        );

        if (!isValid) {
          return res.status(401).json({
            status: 'error',
            message: 'Invalid signature',
          });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { walletAddress },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              walletAddress,
            },
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id,
            walletAddress: user.walletAddress 
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRY }
        );

        return res.status(200).json({
          status: 'success',
          data: {
            token,
            user: {
              id: user.id,
              walletAddress: user.walletAddress,
              name: user.name,
              profileImage: user.profileImage,
              isVerified: user.isVerified,
            },
          },
        });
      } catch (error) {
        console.error('Signature verification error:', error);
        return res.status(401).json({
          status: 'error',
          message: 'Signature verification failed',
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Authentication failed due to server error',
      });
    }
  }

  /**
   * Get the current user's profile based on JWT token
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      // User will be attached to req by the auth middleware
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          walletAddress: true,
          name: true,
          email: true,
          profileImage: true,
          bio: true,
          isVerified: true,
          createdAt: true,
          // Get aggregated review stats
          _count: {
            select: {
              products: true,
              purchaseOrders: true,
              saleOrders: true,
              receivedReviews: true,
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while fetching user profile',
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { name, email, bio } = req.body;
      
      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          bio,
        },
        select: {
          id: true,
          walletAddress: true,
          name: true,
          email: true,
          profileImage: true,
          bio: true,
          isVerified: true,
          updatedAt: true,
        }
      });

      return res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while updating profile',
      });
    }
  }
} 