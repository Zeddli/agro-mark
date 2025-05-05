import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Header component for the application
 * Contains navigation and wallet connection
 */
const Header: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-green-700 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-white text-2xl font-bold">AgroMark</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-green-200 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-white hover:text-green-200">
              Marketplace
            </Link>
            <Link to="/how-it-works" className="text-white hover:text-green-200">
              How It Works
            </Link>
            {connected && (
              <>
                <Link to="/sell/new" className="text-white hover:text-green-200">
                  Sell Products
                </Link>
                <Link to="/orders" className="text-white hover:text-green-200">
                  My Orders
                </Link>
                <Link to="/dashboard" className="text-white hover:text-green-200">
                  Dashboard
                </Link>
              </>
            )}
            
            {/* Wallet Button */}
            <div>
              <WalletMultiButton className="!bg-green-600 hover:!bg-green-500" />
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            <div className="flex flex-col space-y-4 pb-4">
              <Link 
                to="/marketplace" 
                className="text-white hover:text-green-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-white hover:text-green-200"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              {connected && (
                <>
                  <Link 
                    to="/sell/new" 
                    className="text-white hover:text-green-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sell Products
                  </Link>
                  <Link 
                    to="/orders" 
                    className="text-white hover:text-green-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="text-white hover:text-green-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              )}
              
              {/* Wallet Button */}
              <div>
                <WalletMultiButton className="!bg-green-600 hover:!bg-green-500" />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 