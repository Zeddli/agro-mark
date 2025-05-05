// Import the PrismaClient from @prisma/client
import { PrismaClient } from '@prisma/client';

// Create a single instance of PrismaClient to be used throughout the application
// This follows the singleton pattern for database connections
const prisma = new PrismaClient({
  // Enable query logging in development mode
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle connection errors
prisma.$on('error', (e) => {
  console.error('Prisma Client error:', e);
});

// Export the prisma instance
export default prisma;

// Handle application shutdown gracefully
process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 