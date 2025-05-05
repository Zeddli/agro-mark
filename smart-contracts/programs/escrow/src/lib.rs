use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use marketplace::CurrencyType;

// Import the marketplace program for cross-program invocation
use marketplace::program::Marketplace;
use marketplace::{self, Product, ProductStatus};

declare_id!("Escrow1111111111111111111111111111111111111111");

#[program]
pub mod escrow {
    use super::*;

    /// Create a new escrow for a product purchase
    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        quantity: u64,
    ) -> Result<()> {
        // Validate quantity is greater than 0
        require!(quantity > 0, EscrowError::InvalidQuantity);

        // Calculate the total amount for the purchase
        let product = &ctx.accounts.product;
        let total_amount = product.price.checked_mul(quantity).ok_or(EscrowError::CalculationError)?;

        // Set up the escrow account
        let escrow = &mut ctx.accounts.escrow;
        escrow.marketplace = ctx.accounts.marketplace.key();
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = product.seller;
        escrow.product = ctx.accounts.product.key();
        escrow.quantity = quantity;
        escrow.amount = total_amount;
        escrow.currency = product.currency.clone();
        escrow.status = EscrowStatus::Created;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.updated_at = Clock::get()?.unix_timestamp;
        escrow.bump = *ctx.bumps.get("escrow").unwrap();

        Ok(())
    }

    /// Fund the escrow with payment
    pub fn fund_escrow(ctx: Context<FundEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Check that the escrow is in the correct state
        require!(
            escrow.status == EscrowStatus::Created,
            EscrowError::InvalidEscrowState
        );

        // Handle different currency types
        match escrow.currency {
            CurrencyType::SOL => {
                // For SOL transfers, we'll use system program
                // Verify the provided lamports match the escrow amount
                let rent = Rent::get()?;
                let required_lamports = escrow.amount + rent.minimum_balance(0);
                
                require!(
                    ctx.accounts.buyer.lamports() >= required_lamports,
                    EscrowError::InsufficientFunds
                );
                
                // Transfer SOL to the escrow account
                let transfer_instruction = anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.escrow_vault.to_account_info(),
                };
                
                anchor_lang::system_program::transfer(
                    CpiContext::new(
                        ctx.accounts.system_program.to_account_info(),
                        transfer_instruction,
                    ),
                    escrow.amount,
                )?;
            },
            CurrencyType::USDC | CurrencyType::USDT => {
                // For token transfers, we use the token program
                // Transfer tokens from the buyer to the escrow vault
                let transfer_instruction = Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                };
                
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        transfer_instruction,
                    ),
                    escrow.amount,
                )?;
            }
        }

        // Update escrow status
        escrow.status = EscrowStatus::Funded;
        escrow.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /// Mark the order as shipped by the seller
    pub fn mark_as_shipped(
        ctx: Context<MarkAsShipped>,
        tracking_id: Option<String>,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Check that the escrow is in the correct state
        require!(
            escrow.status == EscrowStatus::Funded,
            EscrowError::InvalidEscrowState
        );
        
        // Verify the signer is the seller
        require!(
            ctx.accounts.seller.key() == escrow.seller,
            EscrowError::UnauthorizedSeller
        );
        
        // Store tracking ID if provided
        if let Some(tracking_id) = tracking_id {
            require!(tracking_id.len() <= 50, EscrowError::TrackingIdTooLong);
            // In a real implementation, we would store the tracking ID in the account
            // For simplicity, we're not storing it in this example
        }
        
        // Update escrow status
        escrow.status = EscrowStatus::Shipped;
        escrow.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    /// Confirm delivery of the product and release funds to the seller
    pub fn confirm_delivery(ctx: Context<ConfirmDelivery>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Check that the escrow is in the correct state
        require!(
            escrow.status == EscrowStatus::Shipped,
            EscrowError::InvalidEscrowState
        );
        
        // Verify the signer is the buyer
        require!(
            ctx.accounts.buyer.key() == escrow.buyer,
            EscrowError::UnauthorizedBuyer
        );
        
        // Transfer funds to the seller based on currency type
        match escrow.currency {
            CurrencyType::SOL => {
                // For SOL transfers
                let bump = escrow.bump;
                let escrow_seeds = &[
                    b"escrow",
                    escrow.marketplace.as_ref(),
                    escrow.buyer.as_ref(),
                    escrow.product.as_ref(),
                    &[bump],
                ];
                let signer = &[&escrow_seeds[..]];
                
                // Transfer SOL from escrow vault to seller
                let transfer_instruction = anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                };
                
                anchor_lang::system_program::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.system_program.to_account_info(),
                        transfer_instruction,
                        signer,
                    ),
                    escrow.amount,
                )?;
            },
            CurrencyType::USDC | CurrencyType::USDT => {
                // For token transfers
                let bump = escrow.bump;
                let escrow_seeds = &[
                    b"escrow",
                    escrow.marketplace.as_ref(),
                    escrow.buyer.as_ref(),
                    escrow.product.as_ref(),
                    &[bump],
                ];
                let signer = &[&escrow_seeds[..]];
                
                // Transfer tokens from escrow to seller
                let transfer_instruction = Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.seller_token_account.to_account_info(),
                    authority: ctx.accounts.escrow_vault.to_account_info(),
                };
                
                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        transfer_instruction,
                        signer,
                    ),
                    escrow.amount,
                )?;
            }
        }
        
        // Update escrow status
        escrow.status = EscrowStatus::Completed;
        escrow.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    /// Dispute a transaction if there's an issue with the order
    pub fn dispute_transaction(
        ctx: Context<DisputeTransaction>,
        reason: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Check that the escrow is in a state that can be disputed
        require!(
            escrow.status == EscrowStatus::Funded || escrow.status == EscrowStatus::Shipped,
            EscrowError::InvalidEscrowState
        );
        
        // Verify the signer is either the buyer or seller
        require!(
            ctx.accounts.user.key() == escrow.buyer || ctx.accounts.user.key() == escrow.seller,
            EscrowError::Unauthorized
        );
        
        // Validate dispute reason
        require!(reason.len() <= 200, EscrowError::DisputeReasonTooLong);
        
        // Update escrow status
        escrow.status = EscrowStatus::Disputed;
        escrow.updated_at = Clock::get()?.unix_timestamp;
        
        // In a real implementation, we would store the dispute reason
        // For simplicity, we're not storing it in this example
        
        Ok(())
    }

    /// Cancel the escrow and refund the buyer
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Check that the escrow is in a state that can be cancelled
        require!(
            escrow.status == EscrowStatus::Created || escrow.status == EscrowStatus::Funded,
            EscrowError::InvalidEscrowState
        );
        
        // If escrow is funded, refund the buyer
        if escrow.status == EscrowStatus::Funded {
            match escrow.currency {
                CurrencyType::SOL => {
                    // For SOL refunds
                    let bump = escrow.bump;
                    let escrow_seeds = &[
                        b"escrow",
                        escrow.marketplace.as_ref(),
                        escrow.buyer.as_ref(),
                        escrow.product.as_ref(),
                        &[bump],
                    ];
                    let signer = &[&escrow_seeds[..]];
                    
                    // Transfer SOL from escrow vault back to buyer
                    let transfer_instruction = anchor_lang::system_program::Transfer {
                        from: ctx.accounts.escrow_vault.to_account_info(),
                        to: ctx.accounts.buyer.to_account_info(),
                    };
                    
                    anchor_lang::system_program::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.system_program.to_account_info(),
                            transfer_instruction,
                            signer,
                        ),
                        escrow.amount,
                    )?;
                },
                CurrencyType::USDC | CurrencyType::USDT => {
                    // For token refunds
                    let bump = escrow.bump;
                    let escrow_seeds = &[
                        b"escrow",
                        escrow.marketplace.as_ref(),
                        escrow.buyer.as_ref(),
                        escrow.product.as_ref(),
                        &[bump],
                    ];
                    let signer = &[&escrow_seeds[..]];
                    
                    // Transfer tokens from escrow back to buyer
                    let transfer_instruction = Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.buyer_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_vault.to_account_info(),
                    };
                    
                    token::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            transfer_instruction,
                            signer,
                        ),
                        escrow.amount,
                    )?;
                }
            }
        }
        
        // Update escrow status
        escrow.status = EscrowStatus::Cancelled;
        escrow.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    /// Resolve a dispute by an authorized marketplace authority
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        favor_seller: bool,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Check that the escrow is in disputed state
        require!(
            escrow.status == EscrowStatus::Disputed,
            EscrowError::InvalidEscrowState
        );
        
        // Verify the signer is the marketplace authority
        require!(
            ctx.accounts.authority.key() == ctx.accounts.marketplace.authority,
            EscrowError::UnauthorizedAuthority
        );
        
        // Transfer funds based on resolution
        match escrow.currency {
            CurrencyType::SOL => {
                // For SOL transfers
                let bump = escrow.bump;
                let escrow_seeds = &[
                    b"escrow",
                    escrow.marketplace.as_ref(),
                    escrow.buyer.as_ref(),
                    escrow.product.as_ref(),
                    &[bump],
                ];
                let signer = &[&escrow_seeds[..]];
                
                let transfer_instruction = anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: if favor_seller {
                        ctx.accounts.seller.to_account_info()
                    } else {
                        ctx.accounts.buyer.to_account_info()
                    },
                };
                
                anchor_lang::system_program::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.system_program.to_account_info(),
                        transfer_instruction,
                        signer,
                    ),
                    escrow.amount,
                )?;
            },
            CurrencyType::USDC | CurrencyType::USDT => {
                // For token transfers
                let bump = escrow.bump;
                let escrow_seeds = &[
                    b"escrow",
                    escrow.marketplace.as_ref(),
                    escrow.buyer.as_ref(),
                    escrow.product.as_ref(),
                    &[bump],
                ];
                let signer = &[&escrow_seeds[..]];
                
                let transfer_instruction = Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: if favor_seller {
                        ctx.accounts.seller_token_account.to_account_info()
                    } else {
                        ctx.accounts.buyer_token_account.to_account_info()
                    },
                    authority: ctx.accounts.escrow_vault.to_account_info(),
                };
                
                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        transfer_instruction,
                        signer,
                    ),
                    escrow.amount,
                )?;
            }
        }
        
        // Update escrow status
        escrow.status = if favor_seller {
            EscrowStatus::Completed
        } else {
            EscrowStatus::Refunded
        };
        escrow.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
}

/// Account structure for escrow state
#[account]
pub struct Escrow {
    /// Reference to marketplace
    pub marketplace: Pubkey,
    /// Buyer of the product
    pub buyer: Pubkey,
    /// Seller of the product
    pub seller: Pubkey,
    /// Reference to the product being purchased
    pub product: Pubkey,
    /// Quantity being purchased
    pub quantity: u64,
    /// Total amount for the purchase
    pub amount: u64,
    /// Currency type (SOL, USDC, etc.)
    pub currency: CurrencyType,
    /// Current status of the escrow
    pub status: EscrowStatus,
    /// Timestamp of creation
    pub created_at: i64,
    /// Timestamp of last update
    pub updated_at: i64,
    /// PDA bump seed
    pub bump: u8,
}

/// Status of an escrow
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    /// Escrow created but not funded
    Created,
    /// Buyer has funded the escrow
    Funded,
    /// Seller has marked the order as shipped
    Shipped,
    /// Buyer has confirmed delivery
    Completed,
    /// Either party has raised a dispute
    Disputed,
    /// Escrow was cancelled
    Cancelled,
    /// Funds were refunded to buyer
    Refunded,
}

/// Accounts required for creating an escrow
#[derive(Accounts)]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// Marketplace account
    pub marketplace: AccountInfo<'info>,
    
    /// Product being purchased
    pub product: Account<'info, Product>,
    
    /// Escrow account
    #[account(
        init,
        payer = buyer,
        space = 8 + std::mem::size_of::<Escrow>(),
        seeds = [
            b"escrow",
            marketplace.key().as_ref(),
            buyer.key().as_ref(),
            product.key().as_ref(),
        ],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub system_program: Program<'info, System>,
}

/// Accounts required for funding an escrow
#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        mut,
        constraint = escrow.buyer == buyer.key() @ EscrowError::UnauthorizedBuyer
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// Escrow vault account that will hold the funds
    #[account(mut)]
    pub escrow_vault: AccountInfo<'info>,
    
    /// Buyer's token account (for token payments)
    #[account(mut)]
    pub buyer_token_account: Option<Account<'info, TokenAccount>>,
    
    /// Escrow's token account (for token payments)
    #[account(mut)]
    pub escrow_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Accounts required for marking an order as shipped
#[derive(Accounts)]
pub struct MarkAsShipped<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    
    #[account(
        mut,
        constraint = escrow.seller == seller.key() @ EscrowError::UnauthorizedSeller
    )]
    pub escrow: Account<'info, Escrow>,
}

/// Accounts required for confirming delivery
#[derive(Accounts)]
pub struct ConfirmDelivery<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = escrow.buyer == buyer.key() @ EscrowError::UnauthorizedBuyer,
        constraint = escrow.seller == seller.key() @ EscrowError::InvalidEscrowAccount
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// Escrow vault account that holds the funds
    #[account(mut)]
    pub escrow_vault: AccountInfo<'info>,
    
    /// Escrow's token account (for token payments)
    #[account(mut)]
    pub escrow_token_account: Option<Account<'info, TokenAccount>>,
    
    /// Seller's token account (for token payments)
    #[account(mut)]
    pub seller_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Accounts required for disputing a transaction
#[derive(Accounts)]
pub struct DisputeTransaction<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        constraint = (escrow.buyer == user.key() || escrow.seller == user.key()) @ EscrowError::Unauthorized
    )]
    pub escrow: Account<'info, Escrow>,
}

/// Accounts required for cancelling an escrow
#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        mut,
        constraint = escrow.buyer == buyer.key() @ EscrowError::UnauthorizedBuyer
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// Escrow vault account that holds the funds
    #[account(mut)]
    pub escrow_vault: AccountInfo<'info>,
    
    /// Buyer's token account (for token refunds)
    #[account(mut)]
    pub buyer_token_account: Option<Account<'info, TokenAccount>>,
    
    /// Escrow's token account (for token refunds)
    #[account(mut)]
    pub escrow_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Accounts required for resolving a dispute
#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Marketplace account
    #[account(
        constraint = marketplace.authority == authority.key() @ EscrowError::UnauthorizedAuthority
    )]
    pub marketplace: Account<'info, marketplace::MarketplaceState>,
    
    #[account(mut)]
    pub buyer: AccountInfo<'info>,
    
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = escrow.buyer == buyer.key() @ EscrowError::InvalidEscrowAccount,
        constraint = escrow.seller == seller.key() @ EscrowError::InvalidEscrowAccount
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// Escrow vault account that holds the funds
    #[account(mut)]
    pub escrow_vault: AccountInfo<'info>,
    
    /// Buyer's token account (for token refunds)
    #[account(mut)]
    pub buyer_token_account: Option<Account<'info, TokenAccount>>,
    
    /// Seller's token account (for token payments)
    #[account(mut)]
    pub seller_token_account: Option<Account<'info, TokenAccount>>,
    
    /// Escrow's token account (for token transfers)
    #[account(mut)]
    pub escrow_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Error codes for the escrow program
#[error_code]
pub enum EscrowError {
    #[msg("Invalid quantity")]
    InvalidQuantity,
    #[msg("Calculation error in escrow amount")]
    CalculationError,
    #[msg("Invalid escrow state for this operation")]
    InvalidEscrowState,
    #[msg("Insufficient funds for escrow")]
    InsufficientFunds,
    #[msg("Unauthorized buyer")]
    UnauthorizedBuyer,
    #[msg("Unauthorized seller")]
    UnauthorizedSeller,
    #[msg("Unauthorized authority")]
    UnauthorizedAuthority,
    #[msg("Unauthorized user")]
    Unauthorized,
    #[msg("Tracking ID too long")]
    TrackingIdTooLong,
    #[msg("Dispute reason too long")]
    DisputeReasonTooLong,
    #[msg("Invalid escrow account")]
    InvalidEscrowAccount,
} 