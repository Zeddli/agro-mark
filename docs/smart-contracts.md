# AgroMark Smart Contract Specifications

This document outlines the design and functionality of the Solana programs that power the AgroMark platform.

## Overview

AgroMark's blockchain layer consists of three main Anchor programs:

1. **Marketplace Program**: Handles product listings and offers
2. **Escrow Program**: Manages secure payment flows
3. **Reputation Program**: Stores verified reviews and reputation scores

## Marketplace Program

### Account Structures

```rust
#[account]
pub struct MarketplaceState {
    pub authority: Pubkey,
    pub product_count: u64,
    pub fees_basis_points: u16,  // e.g., 250 = 2.5%
    pub fee_destination: Pubkey,
    pub is_paused: bool,
    pub bump: u8,
}

#[account]
pub struct Product {
    pub marketplace: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
    pub quantity: u64,
    pub currency: CurrencyType,
    pub title: String,  // Max 50 chars
    pub description: String,  // Max 1000 chars
    pub metadata_uri: String,  // IPFS/Arweave URI for extended data
    pub status: ProductStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub category: String,  // Max 20 chars
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProductStatus {
    Active,
    Sold,
    Deactivated,
    Flagged,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CurrencyType {
    SOL,
    USDC,
    USDT,
}
```

### Instructions

```rust
pub fn initialize_marketplace(
    ctx: Context<InitializeMarketplace>,
    fees_basis_points: u16,
) -> Result<()>

pub fn create_product(
    ctx: Context<CreateProduct>,
    title: String,
    description: String,
    price: u64,
    quantity: u64,
    currency: CurrencyType,
    metadata_uri: String,
    category: String,
) -> Result<()>

pub fn update_product(
    ctx: Context<UpdateProduct>,
    title: Option<String>,
    description: Option<String>,
    price: Option<u64>,
    quantity: Option<u64>,
    metadata_uri: Option<String>,
    status: Option<ProductStatus>,
) -> Result<()>

pub fn purchase_product(
    ctx: Context<PurchaseProduct>,
    quantity: u64,
) -> Result<()>
```

## Escrow Program

### Account Structures

```rust
#[account]
pub struct Escrow {
    pub marketplace: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub product: Pubkey,
    pub quantity: u64,
    pub amount: u64,
    pub currency: CurrencyType,
    pub status: EscrowStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Shipped,
    Completed,
    Disputed,
    Cancelled,
    Refunded,
}
```

### Instructions

```rust
pub fn create_escrow(
    ctx: Context<CreateEscrow>,
    product_id: Pubkey,
    quantity: u64,
) -> Result<()>

pub fn fund_escrow(
    ctx: Context<FundEscrow>,
) -> Result<()>

pub fn mark_as_shipped(
    ctx: Context<MarkAsShipped>,
    tracking_id: Option<String>,
) -> Result<()>

pub fn confirm_delivery(
    ctx: Context<ConfirmDelivery>,
) -> Result<()>

pub fn dispute_transaction(
    ctx: Context<DisputeTransaction>,
    reason: String,
) -> Result<()>

pub fn cancel_escrow(
    ctx: Context<CancelEscrow>,
) -> Result<()>

pub fn resolve_dispute(
    ctx: Context<ResolveDispute>,
    favor_seller: bool,
) -> Result<()>
```

## Reputation Program

### Account Structures

```rust
#[account]
pub struct UserReputation {
    pub user: Pubkey,
    pub total_rating: u64,
    pub review_count: u64,
    pub total_sales: u64,
    pub total_purchases: u64,
    pub is_verified: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct Review {
    pub author: Pubkey,
    pub recipient: Pubkey,
    pub rating: u8,  // 1-5 stars
    pub comment: String,  // Max 500 chars
    pub transaction_reference: Option<Pubkey>,
    pub created_at: i64,
    pub bump: u8,
}
```

### Instructions

```rust
pub fn initialize_user_reputation(
    ctx: Context<InitializeUserReputation>,
) -> Result<()>

pub fn create_review(
    ctx: Context<CreateReview>,
    rating: u8,
    comment: String,
    transaction_reference: Option<Pubkey>,
) -> Result<()>

pub fn verify_user(
    ctx: Context<VerifyUser>,
    user: Pubkey,
) -> Result<()>
```

## Security Considerations

1. **Access Control**:
   - Only the seller can update their product listings
   - Only the marketplace authority can change fees or pause the marketplace
   - Only the buyer or seller can initiate disputes on their transactions

2. **Fund Safety**:
   - Escrow program holds funds in PDAs until delivery confirmation
   - Cancel and refund mechanisms for failed transactions
   - Dispute resolution process for contested deliveries

3. **Data Integrity**:
   - Reviews can only be created for completed transactions
   - Product data has size limits to prevent storage attacks
   - Critical state changes are logged with timestamps

## Integration with Frontend

1. **Wallet Adapter**:
   - Frontend uses @solana/wallet-adapter libraries
   - Transaction signing through connected wallet

2. **Transaction Building**:
   - Uses @solana/web3.js for transaction construction
   - Built-in retry and confirmation tracking

3. **Program Derived Addresses**:
   - Products: `[b"product", marketplace, seller, product_count]`
   - Escrows: `[b"escrow", marketplace, buyer, seller, product]`
   - Reputation: `[b"reputation", user]`

This contract design supports all key features described in the AgroMark specification while leveraging Solana's speed and cost advantages. 