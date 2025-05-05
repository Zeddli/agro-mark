import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

// Components and Pages
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import HomePage from './pages/HomePage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DashboardPage from './pages/DashboardPage';
import CreateListingPage from './pages/CreateListingPage';
import FAQPage from './pages/FAQPage';
import HowItWorksPage from './pages/HowItWorksPage';
import OrdersPage from './pages/OrdersPage';

// Load wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

/**
 * Main App component that serves as the entry point for our application
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // @solana/wallet-adapter-wallets imports all the adapters but supports tree shaking
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/profile/setup" element={<ProfileSetupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sell/new" element={<CreateListingPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
            </Routes>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
