use anchor_lang::prelude::*;

declare_id!("Reputation111111111111111111111111111111111111");

#[program]
pub mod reputation {
    use super::*;

    /// Initialize a user's reputation account
    pub fn initialize_user_reputation(ctx: Context<InitializeUserReputation>) -> Result<()> {
        let reputation = &mut ctx.accounts.user_reputation;
        
        // Initialize the reputation account with default values
        reputation.user = ctx.accounts.user.key();
        reputation.total_rating = 0;
        reputation.review_count = 0;
        reputation.total_sales = 0;
        reputation.total_purchases = 0;
        reputation.is_verified = false;
        reputation.created_at = Clock::get()?.unix_timestamp;
        reputation.bump = *ctx.bumps.get("user_reputation").unwrap();
        
        Ok(())
    }

    /// Create a review for a user
    pub fn create_review(
        ctx: Context<CreateReview>,
        rating: u8,
        comment: String,
        transaction_reference: Option<Pubkey>,
    ) -> Result<()> {
        // Validate the rating is between 1 and 5
        require!(rating >= 1 && rating <= 5, ReputationError::InvalidRating);
        
        // Validate comment length
        require!(comment.len() <= 500, ReputationError::CommentTooLong);
        
        // Create the review
        let review = &mut ctx.accounts.review;
        review.author = ctx.accounts.author.key();
        review.recipient = ctx.accounts.recipient.key();
        review.rating = rating;
        review.comment = comment;
        review.transaction_reference = transaction_reference;
        review.created_at = Clock::get()?.unix_timestamp;
        review.bump = *ctx.bumps.get("review").unwrap();
        
        // Update the recipient's reputation
        let user_reputation = &mut ctx.accounts.user_reputation;
        
        // Add the new rating to the total and increment review count
        user_reputation.total_rating = user_reputation.total_rating.checked_add(rating as u64).unwrap();
        user_reputation.review_count = user_reputation.review_count.checked_add(1).unwrap();
        
        Ok(())
    }

    /// Verify a user (can only be called by a marketplace authority)
    pub fn verify_user(ctx: Context<VerifyUser>) -> Result<()> {
        // Update the user's verification status
        let user_reputation = &mut ctx.accounts.user_reputation;
        user_reputation.is_verified = true;
        
        Ok(())
    }

    /// Record a completed sale for a user
    pub fn record_sale(ctx: Context<RecordTransactionCount>) -> Result<()> {
        // Increment the user's total sales count
        let user_reputation = &mut ctx.accounts.user_reputation;
        user_reputation.total_sales = user_reputation.total_sales.checked_add(1).unwrap();
        
        Ok(())
    }

    /// Record a completed purchase for a user
    pub fn record_purchase(ctx: Context<RecordTransactionCount>) -> Result<()> {
        // Increment the user's total purchases count
        let user_reputation = &mut ctx.accounts.user_reputation;
        user_reputation.total_purchases = user_reputation.total_purchases.checked_add(1).unwrap();
        
        Ok(())
    }
}

/// Account structure for user reputation data
#[account]
pub struct UserReputation {
    /// The user this reputation belongs to
    pub user: Pubkey,
    /// Sum of all ratings received (sum of stars)
    pub total_rating: u64,
    /// Number of reviews received
    pub review_count: u64,
    /// Total number of successful sales
    pub total_sales: u64,
    /// Total number of successful purchases
    pub total_purchases: u64,
    /// Whether the user is verified by the marketplace
    pub is_verified: bool,
    /// Timestamp when the reputation was created
    pub created_at: i64,
    /// PDA bump seed
    pub bump: u8,
}

/// Account structure for a review
#[account]
pub struct Review {
    /// User who wrote the review
    pub author: Pubkey,
    /// User who received the review
    pub recipient: Pubkey,
    /// Rating (1-5 stars)
    pub rating: u8,
    /// Review comment
    pub comment: String,
    /// Optional reference to the transaction this review is for
    pub transaction_reference: Option<Pubkey>,
    /// Timestamp when the review was created
    pub created_at: i64,
    /// PDA bump seed
    pub bump: u8,
}

/// Accounts required for initializing a user's reputation
#[derive(Accounts)]
pub struct InitializeUserReputation<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + std::mem::size_of::<UserReputation>(),
        seeds = [b"user_reputation", user.key().as_ref()],
        bump
    )]
    pub user_reputation: Account<'info, UserReputation>,
    
    pub system_program: Program<'info, System>,
}

/// Accounts required for creating a review
#[derive(Accounts)]
pub struct CreateReview<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    
    /// The user being reviewed
    pub recipient: AccountInfo<'info>,
    
    /// The reputation account of the recipient
    #[account(
        mut,
        seeds = [b"user_reputation", recipient.key().as_ref()],
        bump = user_reputation.bump
    )]
    pub user_reputation: Account<'info, UserReputation>,
    
    /// The review account
    #[account(
        init,
        payer = author,
        space = 8 + std::mem::size_of::<Review>() + 500, // Extra space for the comment string
        seeds = [
            b"review",
            author.key().as_ref(),
            recipient.key().as_ref(),
            &Clock::get()?.unix_timestamp.to_le_bytes(),
        ],
        bump
    )]
    pub review: Account<'info, Review>,
    
    pub system_program: Program<'info, System>,
}

/// Accounts required for verifying a user
#[derive(Accounts)]
pub struct VerifyUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// The marketplace account (to check authority)
    /// In a real implementation, we would have a proper checks here
    /// For simplicity, we're just assuming the signer is authorized
    pub marketplace: AccountInfo<'info>,
    
    /// The reputation account to verify
    #[account(
        mut,
        seeds = [b"user_reputation", user_reputation.user.as_ref()],
        bump = user_reputation.bump
    )]
    pub user_reputation: Account<'info, UserReputation>,
}

/// Accounts required for recording a transaction count
#[derive(Accounts)]
pub struct RecordTransactionCount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// The marketplace account (to check authority)
    /// In a real implementation, we would have a proper checks here
    /// For simplicity, we're just assuming the signer is authorized
    pub marketplace: AccountInfo<'info>,
    
    /// The user's reputation account
    #[account(
        mut,
        seeds = [b"user_reputation", user_reputation.user.as_ref()],
        bump = user_reputation.bump
    )]
    pub user_reputation: Account<'info, UserReputation>,
}

/// Error codes for the reputation program
#[error_code]
pub enum ReputationError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
    #[msg("Comment exceeds maximum length of 500 characters")]
    CommentTooLong,
} 