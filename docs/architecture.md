# AgroMark Architecture

This document outlines the high-level architecture of the AgroMark platform, explaining how the different components interact with each other.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Applications                          │
│                                                                     │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐       │
│  │   Web App     │    │  Mobile PWA   │    │ Offline Mode  │       │
│  │  (React.js)   │    │  (Responsive) │    │   Support     │       │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘       │
└─────────┬─────────────────────┬─────────────────────┬───────────────┘
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            API Gateway                               │
│                          (Express.js API)                            │
└─────────┬─────────────────────┬─────────────────────┬───────────────┘
          │                     │                     │
┌─────────▼──────────┐ ┌────────▼────────┐ ┌─────────▼───────────┐
│   Authentication   │ │   Marketplace   │ │   Shipping &        │
│   & User Service   │ │     Service     │ │  Logistics Service  │
└─────────┬──────────┘ └────────┬────────┘ └─────────┬───────────┘
          │                     │                     │
┌─────────▼──────────┐ ┌────────▼────────┐ ┌─────────▼───────────┐
│  Wallet Signature  │ │  Product Mgmt   │ │    Order Tracking   │
│    Verification    │ │     Engine      │ │        System       │
└─────────┬──────────┘ └────────┬────────┘ └─────────┬───────────┘
          │                     │                     │
          │                     │                     │
┌─────────▼─────────────────────▼─────────────────────▼───────────────┐
│                        Database Layer                                │
│                          (PostgreSQL)                                │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│                         Blockchain Layer                             │
│                                                                     │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐       │
│  │  Marketplace  │    │    Escrow     │    │  Reputation   │       │
│  │    Program    │    │    Program    │    │    System     │       │
│  └───────────────┘    └───────────────┘    └───────────────┘       │
│                                                                     │
│                         Solana Blockchain                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Client Layer
- **Web Application**: React.js with Vite, utilizing Solana wallet adapters
- **Mobile PWA**: Responsive design optimized for mobile devices
- **Offline Mode**: Support for transaction signing when internet connectivity is intermittent

### API Layer
- **API Gateway**: Central entry point for all client requests
- **Authentication Service**: Handles wallet-based authentication and user management
- **Marketplace Service**: Core business logic for product listing and ordering
- **Shipping & Logistics Service**: Handles delivery options and tracking

### Database Layer
- **PostgreSQL**: Primary relational database
- **Prisma ORM**: Type-safe database client
- **Redis**: Caching layer for frequently accessed data

### Blockchain Layer
- **Marketplace Program**: Handles on-chain product listings and transactions
- **Escrow Program**: Secures funds during transactions
- **Reputation System**: Stores seller ratings and review data on-chain

## Data Flow

1. **User Authentication**:
   - User connects wallet through frontend
   - Backend verifies wallet signature
   - Session token issued for subsequent requests

2. **Product Listing**:
   - Seller creates product in web interface
   - Data stored in PostgreSQL database
   - On-chain representation created in Solana

3. **Purchase Flow**:
   - Buyer initiates purchase
   - Escrow program locks funds
   - Seller notified and ships product
   - Buyer confirms receipt
   - Escrow releases funds to seller

4. **Reputation System**:
   - Transaction completion triggers review opportunity
   - Ratings stored both in database and on-chain
   - Aggregate scores affect visibility and trust indicators

## Technical Constraints

- **Performance**: Target <500ms API response time
- **Scalability**: Support for 10,000+ concurrent users
- **Reliability**: 99.9% uptime SLA target
- **Security**: End-to-end encryption for sensitive data
- **Compliance**: GDPR-compliant data handling

This architecture supports the core requirements of the AgroMark platform while maintaining flexibility for future expansion. 