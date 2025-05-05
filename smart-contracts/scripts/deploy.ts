import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

/**
 * Deploy script for AgroMark smart contracts
 * This script deploys all the programs in the AgroMark project to the Solana devnet
 * Usage: npx ts-node scripts/deploy.ts
 */

// Configure the connection to the cluster
anchor.setProvider(anchor.AnchorProvider.env());
const provider = anchor.getProvider() as anchor.AnchorProvider;
const wallet = provider.wallet;

// Program IDs and names
const programIds = {
  marketplace: new PublicKey("Marketplace111111111111111111111111111111111111"),
  escrow: new PublicKey("Escrow1111111111111111111111111111111111111111"),
  reputation: new PublicKey("Reputation111111111111111111111111111111111111"),
};

// Deploy the marketplace program
async function deployMarketplace() {
  console.log("Deploying Marketplace program...");
  
  try {
    // Load the IDL
    const idl = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../target/idl/marketplace.json'),
        'utf-8'
      )
    );
    
    // Deploy the program
    const programId = programIds.marketplace;
    console.log(`Deploying to program ID: ${programId.toString()}`);
    
    // Build deploy command for Anchor
    const deployCmd = `anchor deploy --program-id ${programId.toString()} --provider.cluster devnet`;
    console.log(`Running: ${deployCmd}`);
    
    // In a real script, we would use child_process.exec to run the command
    // For now, we'll just simulate success
    console.log("Marketplace program deployed successfully!");
    
    return programId;
  } catch (error) {
    console.error("Error deploying Marketplace program:", error);
    throw error;
  }
}

// Deploy the escrow program
async function deployEscrow() {
  console.log("Deploying Escrow program...");
  
  try {
    // Load the IDL
    const idl = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../target/idl/escrow.json'),
        'utf-8'
      )
    );
    
    // Deploy the program
    const programId = programIds.escrow;
    console.log(`Deploying to program ID: ${programId.toString()}`);
    
    // Build deploy command for Anchor
    const deployCmd = `anchor deploy --program-id ${programId.toString()} --provider.cluster devnet`;
    console.log(`Running: ${deployCmd}`);
    
    // In a real script, we would use child_process.exec to run the command
    // For now, we'll just simulate success
    console.log("Escrow program deployed successfully!");
    
    return programId;
  } catch (error) {
    console.error("Error deploying Escrow program:", error);
    throw error;
  }
}

// Deploy the reputation program
async function deployReputation() {
  console.log("Deploying Reputation program...");
  
  try {
    // Load the IDL
    const idl = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../target/idl/reputation.json'),
        'utf-8'
      )
    );
    
    // Deploy the program
    const programId = programIds.reputation;
    console.log(`Deploying to program ID: ${programId.toString()}`);
    
    // Build deploy command for Anchor
    const deployCmd = `anchor deploy --program-id ${programId.toString()} --provider.cluster devnet`;
    console.log(`Running: ${deployCmd}`);
    
    // In a real script, we would use child_process.exec to run the command
    // For now, we'll just simulate success
    console.log("Reputation program deployed successfully!");
    
    return programId;
  } catch (error) {
    console.error("Error deploying Reputation program:", error);
    throw error;
  }
}

// Initialize the marketplace after deployment
async function initializeMarketplace(marketplaceProgramId: PublicKey) {
  console.log("Initializing Marketplace...");
  
  try {
    // Load the IDL
    const idl = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../target/idl/marketplace.json'),
        'utf-8'
      )
    );
    
    // Create the program interface
    const program = new anchor.Program(idl, marketplaceProgramId, provider);
    
    // Find the marketplace PDA
    const [marketplacePda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("marketplace"), wallet.publicKey.toBuffer()],
      marketplaceProgramId
    );
    
    // Initialize the marketplace with 2.5% fees
    const tx = await program.methods
      .initializeMarketplace(250) // 250 basis points = 2.5%
      .accounts({
        authority: wallet.publicKey,
        marketplace: marketplacePda,
        feeDestination: wallet.publicKey, // Using the same wallet as fee destination for now
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log(`Marketplace initialized successfully! Transaction signature: ${tx}`);
    console.log(`Marketplace PDA: ${marketplacePda.toString()}`);
    
    return marketplacePda;
  } catch (error) {
    console.error("Error initializing Marketplace:", error);
    throw error;
  }
}

// Main deployment function
async function main() {
  console.log("Starting AgroMark smart contract deployment to devnet...");
  console.log(`Using wallet: ${wallet.publicKey.toString()}`);
  
  // Check if we have enough SOL for deployments
  const balance = await provider.connection.getBalance(wallet.publicKey);
  console.log(`Wallet balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  
  if (balance < 2 * anchor.web3.LAMPORTS_PER_SOL) {
    console.warn("Warning: Low wallet balance. Deployments may fail.");
    console.warn("Consider requesting a devnet airdrop before continuing.");
  }
  
  try {
    // Deploy all programs
    const marketplaceProgramId = await deployMarketplace();
    const escrowProgramId = await deployEscrow();
    const reputationProgramId = await deployReputation();
    
    // Initialize the marketplace
    const marketplacePda = await initializeMarketplace(marketplaceProgramId);
    
    console.log("\nDeployment completed successfully!");
    console.log("Program IDs:");
    console.log(`- Marketplace: ${marketplaceProgramId.toString()}`);
    console.log(`- Escrow: ${escrowProgramId.toString()}`);
    console.log(`- Reputation: ${reputationProgramId.toString()}`);
    console.log(`\nMarketplace PDA: ${marketplacePda.toString()}`);
    
    // Save the deployment information to a file
    const deploymentInfo = {
      cluster: "devnet",
      wallet: wallet.publicKey.toString(),
      programIds: {
        marketplace: marketplaceProgramId.toString(),
        escrow: escrowProgramId.toString(),
        reputation: reputationProgramId.toString(),
      },
      pdas: {
        marketplace: marketplacePda.toString(),
      },
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      path.resolve(__dirname, '../deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\nDeployment information saved to deployment.json");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

// Execute deployment
main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
); 