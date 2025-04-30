# AgroMark Database Schema

This document outlines the database schema for the AgroMark application using PostgreSQL with Prisma ORM.

## Core Entities

### User

```prisma
model User {
  id             String    @id @default(uuid())
  walletAddress  String    @unique
  username       String?
  email          String?   @unique
  profilePicture String?
  bio            String?
  location       String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  isVerified     Boolean   @default(false)
  
  // Relationships
  products       Product[]
  reviews        Review[]  @relation("ReviewAuthor")
  receivedReviews Review[] @relation("ReviewReceiver")
  orders         Order[]   @relation("Buyer")
  sales          Order[]   @relation("Seller")
}
```

### Product

```prisma
model Product {
  id              String        @id @default(uuid())
  title           String
  description     String
  price           Float
  currency        Currency      @default(USDC)
  quantity        Int
  unit            String        // e.g., kg, bushel, head (for livestock)
  images          String[]      // URLs to IPFS/Arweave
  category        Category      @relation(fields: [categoryId], references: [id])
  categoryId      String
  tags            Tag[]
  availableFrom   DateTime      @default(now())
  availableTo     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  status          ProductStatus @default(ACTIVE)
  isFeatured      Boolean       @default(false)
  onChainId       String?       // Reference to on-chain data
  
  // Relationships
  seller          User          @relation(fields: [sellerId], references: [id])
  sellerId        String
  orders          OrderItem[]
}

enum ProductStatus {
  DRAFT
  ACTIVE
  SOLD_OUT
  ARCHIVED
}

enum Currency {
  SOL
  USDC
  USDT
}
```

### Category

```prisma
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  imageUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relationships
  products    Product[]
}
```

### Tag

```prisma
model Tag {
  id          String    @id @default(uuid())
  name        String    @unique
  createdAt   DateTime  @default(now())
  
  // Relationships
  products    Product[]
}
```

### Order

```prisma
model Order {
  id                String      @id @default(uuid())
  buyerId           String
  buyer             User        @relation("Buyer", fields: [buyerId], references: [id])
  sellerId          String
  seller            User        @relation("Seller", fields: [sellerId], references: [id])
  status            OrderStatus @default(PENDING)
  totalAmount       Float
  escrowAddress     String?     // On-chain escrow address
  transactionHash   String?     // Blockchain transaction hash
  shippingAddress   String?
  shippingMethod    String?
  trackingNumber    String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relationships
  items             OrderItem[]
}

model OrderItem {
  id              String    @id @default(uuid())
  orderId         String
  order           Order     @relation(fields: [orderId], references: [id])
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  quantity        Int
  priceAtPurchase Float
  currencyAtPurchase Currency
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  COMPLETED
  CANCELLED
  DISPUTED
}
```

### Review

```prisma
model Review {
  id           String   @id @default(uuid())
  rating       Int      // 1-5 stars
  comment      String?
  authorId     String
  author       User     @relation("ReviewAuthor", fields: [authorId], references: [id])
  receiverId   String
  receiver     User     @relation("ReviewReceiver", fields: [receiverId], references: [id])
  onChainId    String?  // Reference to on-chain data
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Shipping

```prisma
model ShippingOption {
  id           String   @id @default(uuid())
  name         String
  description  String?
  price        Float
  estimatedDays Int
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Relationships Overview

- Users can list multiple Products
- Products belong to Categories
- Products can have multiple Tags
- Orders are created between a Buyer and Seller
- Orders contain multiple OrderItems (products)
- Users can leave Reviews for other Users
- Reviews are stored both on-chain and in the database

## Indexing Strategy

- Indexing on `walletAddress` for quick user lookup
- Indexing on product `categoryId` and `status` for efficient filtering
- Indexing on `sellerId` and `buyerId` for order history retrieval
- Compound index on product title and description for search functionality

This schema design supports all core features of the AgroMark platform while maintaining data integrity and efficient querying patterns. 