import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Marketplace } from '../target/types/marketplace';
import { expect } from 'chai';
import { PublicKey } from '@solana/web3.js';

describe('marketplace', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Marketplace as Program<Marketplace>;
  const marketplaceAuthority = provider.wallet;
  const feesDestination = provider.wallet.publicKey;
  
  let marketplacePda: PublicKey;
  let marketplaceBump: number;
  
  // Product data for testing
  const productTitle = "Organic Tomatoes";
  const productDescription = "Fresh organic tomatoes from local farm";
  const productPrice = new anchor.BN(500000); // 0.5 SOL in lamports
  const productQuantity = new anchor.BN(100);
  const productCategory = "Vegetables";
  const metadataUri = "https://arweave.net/abc123";

  beforeEach(async () => {
    // Find the marketplace PDA
    const [pda, bump] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("marketplace"),
        marketplaceAuthority.publicKey.toBuffer()
      ],
      program.programId
    );
    
    marketplacePda = pda;
    marketplaceBump = bump;
  });

  it('Initializes the marketplace', async () => {
    // Initialize the marketplace with 2.5% fees
    const tx = await program.methods
      .initializeMarketplace(250) // 250 basis points = 2.5%
      .accounts({
        authority: marketplaceAuthority.publicKey,
        marketplace: marketplacePda,
        feeDestination: feesDestination,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
      
    // Fetch the marketplace account
    const marketplace = await program.account.marketplaceState.fetch(marketplacePda);
    
    // Verify the marketplace was initialized correctly
    expect(marketplace.authority.toString()).to.equal(marketplaceAuthority.publicKey.toString());
    expect(marketplace.productCount.toNumber()).to.equal(0);
    expect(marketplace.feesBasisPoints).to.equal(250);
    expect(marketplace.feeDestination.toString()).to.equal(feesDestination.toString());
    expect(marketplace.isPaused).to.equal(false);
    expect(marketplace.bump).to.equal(marketplaceBump);
  });

  it('Creates a product', async () => {
    // Create a seller for testing
    const seller = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL to the seller
    const airdropSignature = await provider.connection.requestAirdrop(
      seller.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);
    
    // Find the product PDA
    const [productPda, _] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("product"),
        marketplacePda.toBuffer(),
        seller.publicKey.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, "le", 8) // First product for this seller
      ],
      program.programId
    );
    
    // Create the product
    const tx = await program.methods
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
      
    // Fetch the product account
    const product = await program.account.product.fetch(productPda);
    
    // Verify the product was created correctly
    expect(product.marketplace.toString()).to.equal(marketplacePda.toString());
    expect(product.seller.toString()).to.equal(seller.publicKey.toString());
    expect(product.price.toNumber()).to.equal(productPrice.toNumber());
    expect(product.quantity.toNumber()).to.equal(productQuantity.toNumber());
    expect(product.title).to.equal(productTitle);
    expect(product.description).to.equal(productDescription);
    expect(product.metadataUri).to.equal(metadataUri);
    expect(product.status).to.deep.equal({ active: {} });
    expect(product.category).to.equal(productCategory);
    
    // Verify marketplace product count was incremented
    const marketplace = await program.account.marketplaceState.fetch(marketplacePda);
    expect(marketplace.productCount.toNumber()).to.equal(1);
  });

  it('Updates a product', async () => {
    // Create a seller for testing
    const seller = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL to the seller
    const airdropSignature = await provider.connection.requestAirdrop(
      seller.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);
    
    // Find the product PDA
    const [productPda, _] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("product"),
        marketplacePda.toBuffer(),
        seller.publicKey.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, "le", 8) // First product for this seller
      ],
      program.programId
    );
    
    // Create the product
    await program.methods
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
      
    // New values for update
    const updatedTitle = "Premium Organic Tomatoes";
    const updatedPrice = new anchor.BN(600000); // 0.6 SOL
    
    // Update the product
    await program.methods
      .updateProduct(
        updatedTitle,         // Update title
        null,                 // Don't update description
        updatedPrice,         // Update price
        null,                 // Don't update quantity
        null,                 // Don't update metadata URI
        null                  // Don't update status
      )
      .accounts({
        seller: seller.publicKey,
        product: productPda,
      })
      .signers([seller])
      .rpc();
      
    // Fetch the updated product
    const updatedProduct = await program.account.product.fetch(productPda);
    
    // Verify the product was updated correctly
    expect(updatedProduct.title).to.equal(updatedTitle);
    expect(updatedProduct.price.toNumber()).to.equal(updatedPrice.toNumber());
    
    // Verify other fields remained unchanged
    expect(updatedProduct.description).to.equal(productDescription);
    expect(updatedProduct.quantity.toNumber()).to.equal(productQuantity.toNumber());
    expect(updatedProduct.metadataUri).to.equal(metadataUri);
    expect(updatedProduct.status).to.deep.equal({ active: {} });
  });
}); 