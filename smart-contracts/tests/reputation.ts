import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Reputation } from '../target/types/reputation';
import { expect } from 'chai';
import { PublicKey, Keypair } from '@solana/web3.js';

describe('reputation', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Reputation as Program<Reputation>;
  
  // Test accounts
  const marketplaceAuthority = provider.wallet;
  const user = Keypair.generate();
  const reviewer = Keypair.generate();
  
  // PDAs
  let userReputationPda: PublicKey;
  let reviewPda: PublicKey;
  
  beforeEach(async () => {
    // Airdrop SOL to test accounts
    const userAirdrop = await provider.connection.requestAirdrop(
      user.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(userAirdrop);
    
    const reviewerAirdrop = await provider.connection.requestAirdrop(
      reviewer.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(reviewerAirdrop);
    
    // Find the user reputation PDA
    const [repPda, _] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user_reputation"), user.publicKey.toBuffer()],
      program.programId
    );
    userReputationPda = repPda;
    
    // Find the review PDA - note that we're using current time for uniqueness
    // In a real test, we might want to use a more deterministic approach
    const timestamp = new anchor.BN(Math.floor(Date.now() / 1000)).toArrayLike(Buffer, "le", 8);
    const [revPda, _2] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("review"),
        reviewer.publicKey.toBuffer(),
        user.publicKey.toBuffer(),
        timestamp
      ],
      program.programId
    );
    reviewPda = revPda;
  });

  it('Initializes user reputation', async () => {
    // Initialize the user's reputation
    const tx = await program.methods
      .initializeUserReputation()
      .accounts({
        user: user.publicKey,
        userReputation: userReputationPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
      
    // Fetch the user reputation account
    const userReputation = await program.account.userReputation.fetch(userReputationPda);
    
    // Verify the user reputation was initialized correctly
    expect(userReputation.user.toString()).to.equal(user.publicKey.toString());
    expect(userReputation.totalRating.toNumber()).to.equal(0);
    expect(userReputation.reviewCount.toNumber()).to.equal(0);
    expect(userReputation.totalSales.toNumber()).to.equal(0);
    expect(userReputation.totalPurchases.toNumber()).to.equal(0);
    expect(userReputation.isVerified).to.equal(false);
  });

  it('Creates a review for a user', async () => {
    // Initialize user reputation first
    await program.methods
      .initializeUserReputation()
      .accounts({
        user: user.publicKey,
        userReputation: userReputationPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    
    // Review details
    const rating = 4; // 4 stars
    const comment = "Great seller, fast shipping and excellent product quality.";
    const transactionReference = null; // No transaction reference for this test
    
    // Find the review PDA with current timestamp for uniqueness
    const timestamp = Clock.get().unix_timestamp;
    const [revPda, _] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("review"),
        reviewer.publicKey.toBuffer(),
        user.publicKey.toBuffer(),
        new anchor.BN(timestamp).toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    const currentReviewPda = revPda;
    
    // Create the review
    await program.methods
      .createReview(
        rating,
        comment,
        transactionReference
      )
      .accounts({
        author: reviewer.publicKey,
        recipient: user.publicKey,
        userReputation: userReputationPda,
        review: currentReviewPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([reviewer])
      .rpc();
      
    // Fetch the review
    const review = await program.account.review.fetch(currentReviewPda);
    
    // Verify the review was created correctly
    expect(review.author.toString()).to.equal(reviewer.publicKey.toString());
    expect(review.recipient.toString()).to.equal(user.publicKey.toString());
    expect(review.rating).to.equal(rating);
    expect(review.comment).to.equal(comment);
    
    // Fetch the updated user reputation
    const userReputation = await program.account.userReputation.fetch(userReputationPda);
    
    // Verify the user reputation was updated
    expect(userReputation.totalRating.toNumber()).to.equal(rating);
    expect(userReputation.reviewCount.toNumber()).to.equal(1);
  });

  it('Verifies a user', async () => {
    // Initialize user reputation first
    await program.methods
      .initializeUserReputation()
      .accounts({
        user: user.publicKey,
        userReputation: userReputationPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    
    // Create a mock marketplace account
    const marketplace = Keypair.generate();
    
    // Verify the user
    await program.methods
      .verifyUser()
      .accounts({
        authority: marketplaceAuthority.publicKey,
        marketplace: marketplace.publicKey,
        userReputation: userReputationPda,
      })
      .rpc();
      
    // Fetch the user reputation
    const userReputation = await program.account.userReputation.fetch(userReputationPda);
    
    // Verify the user is now verified
    expect(userReputation.isVerified).to.equal(true);
  });

  it('Records a sale for a user', async () => {
    // Initialize user reputation first
    await program.methods
      .initializeUserReputation()
      .accounts({
        user: user.publicKey,
        userReputation: userReputationPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    
    // Create a mock marketplace account
    const marketplace = Keypair.generate();
    
    // Record a sale
    await program.methods
      .recordSale()
      .accounts({
        authority: marketplaceAuthority.publicKey,
        marketplace: marketplace.publicKey,
        userReputation: userReputationPda,
      })
      .rpc();
      
    // Fetch the user reputation
    const userReputation = await program.account.userReputation.fetch(userReputationPda);
    
    // Verify the sale count was incremented
    expect(userReputation.totalSales.toNumber()).to.equal(1);
  });
}); 