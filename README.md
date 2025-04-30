# AgroMark - A Global Agricultural Marketplace on Solana

AgroMark is a global farmers' market where anyone—backyard growers to big ranchers—can buy and sell farm goods and livestock instantly with cryptocurrency, turning every farmer into a worldwide trader overnight.

## Project Overview

AgroMark leverages Solana blockchain to create a decentralized marketplace that connects farmers directly with buyers around the world, eliminating middlemen and reducing fees.

## Key Features

- Direct listing platform for farmers
- Instant settlement system using Solana
- Escrow smart contracts for secure transactions
- On-chain reputation system
- Dynamic pricing mechanism
- Multi-currency support (SOL and stablecoins)
- Mobile-optimized interface for areas with limited connectivity

## Project Structure

```
AgroMark/
├── docs/               # Documentation files
├── frontend/           # React.js frontend application 
├── backend/            # Express.js backend API
└── smart-contracts/    # Solana/Anchor smart contracts
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or Yarn
- Rust and Cargo (for Solana smart contracts)
- Solana CLI
- Anchor Framework
- PostgreSQL

### Frontend Setup (React + Vite + TypeScript)

```bash
# Navigate to frontend directory
cd frontend

# Initialize a new Vite React TypeScript project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional required packages
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui
npm install tailwindcss postcss autoprefixer
npm install react-router-dom @reduxjs/toolkit react-redux axios react-query

# Initialize Tailwind CSS
npx tailwindcss init -p

# Start development server
npm run dev
```

### Backend Setup (Express + TypeScript)

```bash
# Navigate to backend directory
cd backend

# Initialize a new Node.js project
npm init -y

# Install dependencies
npm install express typescript ts-node @types/node @types/express
npm install prisma @prisma/client
npm install cors dotenv jsonwebtoken @types/cors @types/jsonwebtoken
npm install @solana/web3.js

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init

# Setup development environment
npm install -D nodemon

# Start development server
npm run dev
```

### Smart Contract Setup (Solana/Anchor)

```bash
# Navigate to smart-contracts directory
cd smart-contracts

# Initialize a new Anchor project
anchor init agromark

# Build the project
anchor build

# Test the project
anchor test

# Deploy to Solana devnet
anchor deploy
```

## Development Timeline

See [Timeline.md](./Timeline.md) for detailed project implementation plan.

## Tech Stack

See [Techstack.md](./Techstack.md) for complete technology specifications.

## Problem Statement

See [ProblemStatement.md](./ProblemStatement.md) for detailed problem and solution description. 