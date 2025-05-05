use anchor_lang::prelude::*;

// Import SPL token program for handling token transfers
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Marketplace111111111111111111111111111111111111");

#[program]
pub mod marketplace {
    use super::*;

    /// Initialize the marketplace with the authority that can manage settings
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        fees_basis_points: u16,
    ) -> Result<()> {
        // Check that fees are reasonable (max 10%)
        require!(fees_basis_points <= 1000, MarketplaceError::FeesTooHigh);

        // Initialize marketplace state
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.product_count = 0;
        marketplace.fees_basis_points = fees_basis_points;
        marketplace.fee_destination = ctx.accounts.fee_destination.key();
        marketplace.is_paused = false;
        marketplace.bump = *ctx.bumps.get("marketplace").unwrap();

        Ok(())
    }

    /// Create a new product listing on the marketplace
    pub fn create_product(
        ctx: Context<CreateProduct>,
        title: String,
        description: String,
        price: u64,
        quantity: u64,
        currency: CurrencyType,
        metadata_uri: String,
        category: String,
    ) -> Result<()> {
        // Validate inputs
        require!(price > 0, MarketplaceError::InvalidPrice);
        require!(quantity > 0, MarketplaceError::InvalidQuantity);
        require!(title.len() <= 50, MarketplaceError::TitleTooLong);
        require!(description.len() <= 1000, MarketplaceError::DescriptionTooLong);
        require!(metadata_uri.len() <= 200, MarketplaceError::MetadataUriTooLong);
        require!(category.len() <= 20, MarketplaceError::CategoryTooLong);

        // Create the product
        let product = &mut ctx.accounts.product;
        let marketplace = &mut ctx.accounts.marketplace;
        
        product.marketplace = marketplace.key();
        product.seller = ctx.accounts.seller.key();
        product.price = price;
        product.quantity = quantity;
        product.currency = currency;
        product.title = title;
        product.description = description;
        product.metadata_uri = metadata_uri;
        product.status = ProductStatus::Active;
        product.created_at = Clock::get()?.unix_timestamp;
        product.updated_at = Clock::get()?.unix_timestamp;
        product.category = category;
        product.bump = *ctx.bumps.get("product").unwrap();

        // Increment product count
        marketplace.product_count = marketplace.product_count.checked_add(1).unwrap();

        Ok(())
    }

    /// Update an existing product listing
    pub fn update_product(
        ctx: Context<UpdateProduct>,
        title: Option<String>,
        description: Option<String>,
        price: Option<u64>,
        quantity: Option<u64>,
        metadata_uri: Option<String>,
        status: Option<ProductStatus>,
    ) -> Result<()> {
        let product = &mut ctx.accounts.product;

        // Apply updates conditionally
        if let Some(title) = title {
            require!(title.len() <= 50, MarketplaceError::TitleTooLong);
            product.title = title;
        }

        if let Some(description) = description {
            require!(description.len() <= 1000, MarketplaceError::DescriptionTooLong);
            product.description = description;
        }

        if let Some(price) = price {
            require!(price > 0, MarketplaceError::InvalidPrice);
            product.price = price;
        }

        if let Some(quantity) = quantity {
            product.quantity = quantity;
        }

        if let Some(metadata_uri) = metadata_uri {
            require!(metadata_uri.len() <= 200, MarketplaceError::MetadataUriTooLong);
            product.metadata_uri = metadata_uri;
        }

        if let Some(status) = status {
            product.status = status;
        }

        // Update the timestamp
        product.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /// Purchase a product from the marketplace
    /// This function will be called by the escrow program
    pub fn purchase_product(
        ctx: Context<PurchaseProduct>,
        quantity: u64,
    ) -> Result<()> {
        let product = &mut ctx.accounts.product;
        
        // Verify the product is active
        require!(
            product.status == ProductStatus::Active,
            MarketplaceError::ProductNotActive
        );
        
        // Verify there's enough inventory
        require!(
            product.quantity >= quantity,
            MarketplaceError::InsufficientInventory
        );
        
        // Update the product quantity
        product.quantity = product.quantity.checked_sub(quantity).unwrap();
        
        // If quantity becomes 0, mark as sold out
        if product.quantity == 0 {
            product.status = ProductStatus::SoldOut;
        }
        
        // Update the timestamp
        product.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
}

/// Account structure for marketplace state
#[account]
pub struct MarketplaceState {
    /// Authority that can manage marketplace settings
    pub authority: Pubkey,
    /// Counter for total products listed
    pub product_count: u64,
    /// Marketplace fee in basis points (1/100 of a percent)
    pub fees_basis_points: u16,
    /// Account where fees are collected
    pub fee_destination: Pubkey,
    /// Whether the marketplace is paused
    pub is_paused: bool,
    /// PDA bump seed
    pub bump: u8,
}

/// Account structure for a product listing
#[account]
pub struct Product {
    /// Reference to marketplace
    pub marketplace: Pubkey,
    /// Seller of the product
    pub seller: Pubkey,
    /// Price in the specified currency
    pub price: u64,
    /// Available quantity
    pub quantity: u64,
    /// Currency type (SOL, USDC, etc.)
    pub currency: CurrencyType,
    /// Product title (max 50 chars)
    pub title: String,
    /// Product description (max 1000 chars)
    pub description: String,
    /// URI to additional metadata (IPFS/Arweave)
    pub metadata_uri: String,
    /// Current product status
    pub status: ProductStatus,
    /// Timestamp of creation
    pub created_at: i64,
    /// Timestamp of last update
    pub updated_at: i64,
    /// Product category
    pub category: String,
    /// PDA bump seed
    pub bump: u8,
}

/// Currency types supported by the marketplace
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CurrencyType {
    SOL,
    USDC,
    USDT,
}

/// Status of a product
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProductStatus {
    Active,
    SoldOut,
    Deactivated,
    Flagged,
}

/// Accounts required for initializing a marketplace
#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<MarketplaceState>(),
        seeds = [b"marketplace", authority.key().as_ref()],
        bump
    )]
    pub marketplace: Account<'info, MarketplaceState>,
    
    /// Fee destination account
    pub fee_destination: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Accounts required for creating a product
#[derive(Accounts)]
pub struct CreateProduct<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"marketplace", marketplace.authority.as_ref()],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, MarketplaceState>,
    
    #[account(
        init,
        payer = seller,
        space = 8 + std::mem::size_of::<Product>() + 50 + 1000 + 200 + 20, // Additional space for strings
        seeds = [
            b"product",
            marketplace.key().as_ref(),
            seller.key().as_ref(),
            &marketplace.product_count.to_le_bytes()
        ],
        bump
    )]
    pub product: Account<'info, Product>,
    
    pub system_program: Program<'info, System>,
}

/// Accounts required for updating a product
#[derive(Accounts)]
pub struct UpdateProduct<'info> {
    #[account(
        constraint = seller.key() == product.seller @ MarketplaceError::NotProductOwner
    )]
    pub seller: Signer<'info>,
    
    #[account(
        mut,
        seeds = [
            b"product",
            product.marketplace.as_ref(),
            product.seller.as_ref(),
            &get_product_index(product.key()).to_le_bytes()
        ],
        bump = product.bump
    )]
    pub product: Account<'info, Product>,
}

/// Accounts required for purchasing a product
#[derive(Accounts)]
pub struct PurchaseProduct<'info> {
    /// The buyer of the product
    pub buyer: Signer<'info>,
    
    /// The product being purchased
    #[account(
        mut,
        seeds = [
            b"product",
            product.marketplace.as_ref(),
            product.seller.as_ref(),
            &get_product_index(product.key()).to_le_bytes()
        ],
        bump = product.bump
    )]
    pub product: Account<'info, Product>,
    
    /// Token program for transfers
    pub token_program: Program<'info, Token>,
}

/// Helper function to extract product index from PDA
pub fn get_product_index(product_key: Pubkey) -> u64 {
    // In a real implementation, we would need to find a way to extract
    // the index from the PDA or store it in the account
    // For simplicity, we return 0
    0
}

/// Error codes for the marketplace program
#[error_code]
pub enum MarketplaceError {
    #[msg("Marketplace fee is too high")]
    FeesTooHigh,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid quantity")]
    InvalidQuantity,
    #[msg("Title exceeds maximum length")]
    TitleTooLong,
    #[msg("Description exceeds maximum length")]
    DescriptionTooLong,
    #[msg("Metadata URI exceeds maximum length")]
    MetadataUriTooLong,
    #[msg("Category exceeds maximum length")]
    CategoryTooLong,
    #[msg("Not the product owner")]
    NotProductOwner,
    #[msg("Product is not active")]
    ProductNotActive,
    #[msg("Insufficient inventory")]
    InsufficientInventory,
} 