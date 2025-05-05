import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Escrow } from '../target/types/escrow';
import { Marketplace } from '../target/types/marketplace';
import { expect } from 'chai';
import { PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';

describe('escrow', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Program clients
  const escrowProgram = anchor.workspace.Escrow as Program<Escrow>;
  const marketplaceProgram = anchor.workspace.Marketplace as Program<Marketplace>;
  
  // Test accounts
  const marketplaceAuthority = provider.wallet;
  const buyer = Keypair.generate();
  const seller = Keypair.generate();
  const feesDestination = provider.wallet.publicKey;
  
  // PDAs
  let marketplacePda: PublicKey;
  let productPda: PublicKey;
  let escrowPda: PublicKey;
  let escrowVaultPda: PublicKey;
  
  // Product data for testing
  const productTitle = "Organic Apples";
  const productDescription = "Fresh organic apples from local orchard";
  const productPrice = new anchor.BN(300000); // 0.3 SOL in lamports
  const productQuantity = new anchor.BN(50);
  const productCategory = "Fruits";
  const metadataUri = "https://arweave.net/xyz789";
  
  // Purchase data
  const purchaseQuantity = new anchor.BN(5);
  
  beforeEach(async () => {
    // Airdrop SOL to buyer and seller
    const buyerAirdrop = await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(buyerAirdrop);
    
    const sellerAirdrop = await provider.connection.requestAirdrop(
      seller.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sellerAirdrop);
    
    // Find the marketplace PDA
    const [mpPda, _] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("marketplace"),
        marketplaceAuthority.publicKey.toBuffer()
      ],
      marketplaceProgram.programId
    );
    marketplacePda = mpPda;
    
    // Initialize the marketplace
    try {
      await marketplaceProgram.methods
        .initializeMarketplace(250) // 250 basis points = 2.5%
        .accounts({
          authority: marketplaceAuthority.publicKey,
          marketplace: marketplacePda,
          feeDestination: feesDestination,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      // Marketplace might already be initialized in previous tests
      console.log("Marketplace initialization error (might be already initialized):", e);
    }
    
    // Find the product PDA
    const [prodPda, _2] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("product"),
        marketplacePda.toBuffer(),
        seller.publicKey.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, "le", 8) // First product for this seller
      ],
      marketplaceProgram.programId
    );
    productPda = prodPda;
    
    // Create the product if it doesn't exist
    try {
      await marketplaceProgram.methods
        .createProduct(
          productTitle,
          productDescription,
          productPrice,
          productQuantity,
          { sol: {} }, // CurrencyType enum
          metadataUri,
          productCategory
        )
        .accounts({
          seller: seller.publicKey,
          marketplace: marketplacePda,
          product: productPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([seller])
        .rpc();
    } catch (e) {
      // Product might already be created in previous tests
      console.log("Product creation error (might be already created):", e);
    }
    
    // Find the escrow PDA
    const [escPda, _3] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        marketplacePda.toBuffer(),
        buyer.publicKey.toBuffer(),
        productPda.toBuffer(),
      ],
      escrowProgram.programId
    );
    escrowPda = escPda;
    
    // Find the escrow vault PDA
    const [vaultPda, _4] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow_vault"),
        escrowPda.toBuffer(),
      ],
      escrowProgram.programId
    );
    escrowVaultPda = vaultPda;
  });
  
  it('Creates an escrow', async () => {
    // Create the escrow
    const tx = await escrowProgram.methods
      .createEscrow(purchaseQuantity)
      .accounts({
        buyer: buyer.publicKey,
        marketplace: marketplacePda,
        product: productPda,
        escrow: escrowPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
      
    // Fetch the escrow account
    const escrow = await escrowProgram.account.escrow.fetch(escrowPda);
    
    // Verify the escrow was created correctly
    expect(escrow.marketplace.toString()).to.equal(marketplacePda.toString());
    expect(escrow.buyer.toString()).to.equal(buyer.publicKey.toString());
    expect(escrow.seller.toString()).to.equal(seller.publicKey.toString());
    expect(escrow.product.toString()).to.equal(productPda.toString());
    expect(escrow.quantity.toNumber()).to.equal(purchaseQuantity.toNumber());
    
    // Total amount should be price * quantity
    const expectedAmount = productPrice.toNumber() * purchaseQuantity.toNumber();
    expect(escrow.amount.toNumber()).to.equal(expectedAmount);
    
    // Verify status is Created
    expect(escrow.status).to.deep.equal({ created: {} });
  });

  it('Funds an escrow with SOL', async () => {
    // Create the escrow first
    await escrowProgram.methods
      .createEscrow(purchaseQuantity)
      .accounts({
        buyer: buyer.publicKey,
        marketplace: marketplacePda,
        product: productPda,
        escrow: escrowPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    
    // Fund the escrow
    await escrowProgram.methods
      .fundEscrow()
      .accounts({
        buyer: buyer.publicKey,
        escrow: escrowPda,
        escrowVault: escrowVaultPda,
        buyerTokenAccount: null, // Not needed for SOL
        escrowTokenAccount: null, // Not needed for SOL
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
      
    // Fetch the escrow account
    const escrow = await escrowProgram.account.escrow.fetch(escrowPda);
    
    // Verify the escrow was funded
    expect(escrow.status).to.deep.equal({ funded: {} });
    
    // Verify the escrow vault has the correct balance
    const vaultBalance = await provider.connection.getBalance(escrowVaultPda);
    expect(vaultBalance).to.be.at.least(escrow.amount.toNumber());
  });
}); 