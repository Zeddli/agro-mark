import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { Marketplace } from "../target/types/marketplace";
import { Escrow } from "../target/types/escrow";
import { Reputation } from "../target/types/reputation";

describe("AgroMark Integration Tests", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Get program IDs from deployed programs
  const marketplaceProgram = anchor.workspace.Marketplace as Program<Marketplace>;
  const escrowProgram = anchor.workspace.Escrow as Program<Escrow>;
  const reputationProgram = anchor.workspace.Reputation as Program<Reputation>;

  // Generate keypairs for test accounts
  const authority = Keypair.generate();
  const seller = Keypair.generate();
  const buyer = Keypair.generate();
  const feeDestination = Keypair.generate();
  
  // Product details
  const productTitle = "Organic Avocados";
  const productDescription = "Fresh organic avocados from Mexico";
  const productPrice = new anchor.BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL
  const productQuantity = new anchor.BN(100);
  const productCategory = "Fruits";
  const productMetadataUri = "https://ipfs.io/ipfs/QmXyNMhV8bQFp6wzoVpkz3NUAcbWMFZrtyubUjGjjbD2ye";
  
  // PDA addresses
  let marketplacePDA: PublicKey;
  let productPDA: PublicKey;
  let escrowPDA: PublicKey;
  let escrowVaultPDA: PublicKey;
  let sellerReputationPDA: PublicKey;
  let buyerReputationPDA: PublicKey;
  let reviewPDA: PublicKey;
  
  // Transaction data
  let purchaseQuantity = new anchor.BN(5);
  
  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(seller.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(buyer.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(feeDestination.publicKey, 1 * LAMPORTS_PER_SOL);
    
    // Wait for confirmation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Derive PDAs
    [marketplacePDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("marketplace"),
        authority.publicKey.toBuffer(),
      ],
      marketplaceProgram.programId
    );
    
    // Calculate product count (0 for the first product)
    const productCount = 0;
    
    [productPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("product"),
        marketplacePDA.toBuffer(),
        seller.publicKey.toBuffer(),
        new anchor.BN(productCount).toArrayLike(Buffer, "le", 8),
      ],
      marketplaceProgram.programId
    );
    
    [escrowPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("escrow"),
        marketplacePDA.toBuffer(),
        buyer.publicKey.toBuffer(),
        productPDA.toBuffer(),
      ],
      escrowProgram.programId
    );
    
    [escrowVaultPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("escrow_vault"),
        escrowPDA.toBuffer(),
      ],
      escrowProgram.programId
    );
    
    [sellerReputationPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("user_reputation"),
        seller.publicKey.toBuffer(),
      ],
      reputationProgram.programId
    );
    
    [buyerReputationPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("user_reputation"),
        buyer.publicKey.toBuffer(),
      ],
      reputationProgram.programId
    );
  });
  
  it("Initializes the marketplace", async () => {
    const feesBasisPoints = 250; // 2.5%
    
    await marketplaceProgram.methods
      .initializeMarketplace(feesBasisPoints)
      .accounts({
        authority: authority.publicKey,
        marketplace: marketplacePDA,
        feeDestination: feeDestination.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();
    
    // Fetch the marketplace account
    const marketplaceAccount = await marketplaceProgram.account.marketplaceState.fetch(marketplacePDA);
    
    // Verify the marketplace was initialized correctly
    assert.equal(marketplaceAccount.authority.toString(), authority.publicKey.toString());
    assert.equal(marketplaceAccount.feeDestination.toString(), feeDestination.publicKey.toString());
    assert.equal(marketplaceAccount.feesBasisPoints, feesBasisPoints);
    assert.equal(marketplaceAccount.productCount.toString(), "0");
    assert.equal(marketplaceAccount.isPaused, false);
  });
  
  it("Initializes seller's reputation", async () => {
    await reputationProgram.methods
      .initializeUserReputation()
      .accounts({
        user: seller.publicKey,
        userReputation: sellerReputationPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([seller])
      .rpc();
    
    // Fetch the reputation account
    const sellerReputationAccount = await reputationProgram.account.userReputation.fetch(sellerReputationPDA);
    
    // Verify the reputation was initialized correctly
    assert.equal(sellerReputationAccount.user.toString(), seller.publicKey.toString());
    assert.equal(sellerReputationAccount.totalRating.toString(), "0");
    assert.equal(sellerReputationAccount.reviewCount.toString(), "0");
    assert.equal(sellerReputationAccount.totalSales.toString(), "0");
    assert.equal(sellerReputationAccount.totalPurchases.toString(), "0");
    assert.equal(sellerReputationAccount.isVerified, false);
  });
  
  it("Initializes buyer's reputation", async () => {
    await reputationProgram.methods
      .initializeUserReputation()
      .accounts({
        user: buyer.publicKey,
        userReputation: buyerReputationPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    
    // Fetch the reputation account
    const buyerReputationAccount = await reputationProgram.account.userReputation.fetch(buyerReputationPDA);
    
    // Verify the reputation was initialized correctly
    assert.equal(buyerReputationAccount.user.toString(), buyer.publicKey.toString());
    assert.equal(buyerReputationAccount.reviewCount.toString(), "0");
  });
  
  it("Creates a product listing", async () => {
    await marketplaceProgram.methods
      .createProduct(
        productTitle,
        productDescription,
        productPrice,
        productQuantity,
        { sol: {} }, // CurrencyType.SOL
        productMetadataUri,
        productCategory
      )
      .accounts({
        seller: seller.publicKey,
        marketplace: marketplacePDA,
        product: productPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([seller])
      .rpc();
    
    // Fetch the product account
    const productAccount = await marketplaceProgram.account.product.fetch(productPDA);
    
    // Verify the product was created correctly
    assert.equal(productAccount.seller.toString(), seller.publicKey.toString());
    assert.equal(productAccount.title, productTitle);
    assert.equal(productAccount.price.toString(), productPrice.toString());
    assert.equal(productAccount.quantity.toString(), productQuantity.toString());
    assert.equal(productAccount.category, productCategory);
    assert.deepEqual(productAccount.status, { active: {} });
  });
  
  it("Creates an escrow for purchase", async () => {
    await escrowProgram.methods
      .createEscrow(purchaseQuantity)
      .accounts({
        buyer: buyer.publicKey,
        marketplace: marketplacePDA,
        product: productPDA,
        escrow: escrowPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    
    // Fetch the escrow account
    const escrowAccount = await escrowProgram.account.escrow.fetch(escrowPDA);
    
    // Verify the escrow was created correctly
    assert.equal(escrowAccount.buyer.toString(), buyer.publicKey.toString());
    assert.equal(escrowAccount.seller.toString(), seller.publicKey.toString());
    assert.equal(escrowAccount.product.toString(), productPDA.toString());
    assert.equal(escrowAccount.quantity.toString(), purchaseQuantity.toString());
    
    // Calculate expected amount
    const expectedAmount = productPrice.mul(purchaseQuantity);
    assert.equal(escrowAccount.amount.toString(), expectedAmount.toString());
    assert.deepEqual(escrowAccount.status, { created: {} });
  });
  
  it("Funds the escrow", async () => {
    await escrowProgram.methods
      .fundEscrow()
      .accounts({
        buyer: buyer.publicKey,
        escrow: escrowPDA,
        escrowVault: escrowVaultPDA,
        buyerTokenAccount: null, // Not needed for SOL
        escrowTokenAccount: null, // Not needed for SOL
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    
    // Fetch the escrow account
    const escrowAccount = await escrowProgram.account.escrow.fetch(escrowPDA);
    
    // Verify the escrow status was updated
    assert.deepEqual(escrowAccount.status, { funded: {} });
    
    // Verify the vault has the correct balance
    const vaultBalance = await provider.connection.getBalance(escrowVaultPDA);
    assert.equal(vaultBalance.toString(), escrowAccount.amount.toString());
  });
  
  it("Marks the order as shipped", async () => {
    const trackingId = "SHIPPING123456789";
    
    await escrowProgram.methods
      .markAsShipped(trackingId)
      .accounts({
        seller: seller.publicKey,
        escrow: escrowPDA,
      })
      .signers([seller])
      .rpc();
    
    // Fetch the escrow account
    const escrowAccount = await escrowProgram.account.escrow.fetch(escrowPDA);
    
    // Verify the escrow status was updated
    assert.deepEqual(escrowAccount.status, { shipped: {} });
  });
  
  it("Confirms delivery and releases funds", async () => {
    // Get seller's initial balance
    const initialSellerBalance = await provider.connection.getBalance(seller.publicKey);
    
    await escrowProgram.methods
      .confirmDelivery()
      .accounts({
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        escrow: escrowPDA,
        escrowVault: escrowVaultPDA,
        escrowTokenAccount: null, // Not needed for SOL
        sellerTokenAccount: null, // Not needed for SOL
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    
    // Fetch the escrow account
    const escrowAccount = await escrowProgram.account.escrow.fetch(escrowPDA);
    
    // Verify the escrow status was updated
    assert.deepEqual(escrowAccount.status, { completed: {} });
    
    // Verify the seller received the funds
    const finalSellerBalance = await provider.connection.getBalance(seller.publicKey);
    const expectedPayment = productPrice.mul(purchaseQuantity);
    assert.approximately(
      finalSellerBalance - initialSellerBalance,
      expectedPayment.toNumber(),
      1000000 // Allow for small rounding errors / gas fees
    );
  });
  
  it("Leaves a review for the seller", async () => {
    const reviewRating = 5;
    const reviewComment = "Great avocados! Very fresh and delivered quickly.";
    
    // Get current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    [reviewPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("review"),
        buyer.publicKey.toBuffer(),
        seller.publicKey.toBuffer(),
        new anchor.BN(currentTimestamp).toArrayLike(Buffer, "le", 8),
      ],
      reputationProgram.programId
    );
    
    await reputationProgram.methods
      .createReview(
        reviewRating,
        reviewComment,
        escrowPDA // transaction reference
      )
      .accounts({
        author: buyer.publicKey,
        recipient: seller.publicKey,
        userReputation: sellerReputationPDA,
        review: reviewPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    
    // Fetch the review account
    const reviewAccount = await reputationProgram.account.review.fetch(reviewPDA);
    
    // Verify the review was created correctly
    assert.equal(reviewAccount.author.toString(), buyer.publicKey.toString());
    assert.equal(reviewAccount.recipient.toString(), seller.publicKey.toString());
    assert.equal(reviewAccount.rating, reviewRating);
    assert.equal(reviewAccount.comment, reviewComment);
    
    // Fetch the updated seller reputation
    const sellerReputationAccount = await reputationProgram.account.userReputation.fetch(sellerReputationPDA);
    
    // Verify the reputation was updated
    assert.equal(sellerReputationAccount.totalRating.toString(), reviewRating.toString());
    assert.equal(sellerReputationAccount.reviewCount.toString(), "1");
  });
  
  it("Updates the transaction counts", async () => {
    // Record the sale for the seller
    await reputationProgram.methods
      .recordSale()
      .accounts({
        authority: authority.publicKey,
        marketplace: marketplacePDA,
        userReputation: sellerReputationPDA,
      })
      .signers([authority])
      .rpc();
    
    // Record the purchase for the buyer
    await reputationProgram.methods
      .recordPurchase()
      .accounts({
        authority: authority.publicKey,
        marketplace: marketplacePDA,
        userReputation: buyerReputationPDA,
      })
      .signers([authority])
      .rpc();
    
    // Fetch the updated reputations
    const sellerReputationAccount = await reputationProgram.account.userReputation.fetch(sellerReputationPDA);
    const buyerReputationAccount = await reputationProgram.account.userReputation.fetch(buyerReputationPDA);
    
    // Verify the transaction counts were updated
    assert.equal(sellerReputationAccount.totalSales.toString(), "1");
    assert.equal(buyerReputationAccount.totalPurchases.toString(), "1");
  });
  
  it("Verifies the seller", async () => {
    await reputationProgram.methods
      .verifyUser()
      .accounts({
        authority: authority.publicKey,
        marketplace: marketplacePDA,
        userReputation: sellerReputationPDA,
      })
      .signers([authority])
      .rpc();
    
    // Fetch the updated seller reputation
    const sellerReputationAccount = await reputationProgram.account.userReputation.fetch(sellerReputationPDA);
    
    // Verify the seller is now verified
    assert.equal(sellerReputationAccount.isVerified, true);
  });
}); 