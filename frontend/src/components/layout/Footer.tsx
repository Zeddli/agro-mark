import { Link } from 'react-router-dom';

/**
 * Footer component for the application
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-3">About AgroMark</h3>
            <p className="text-green-200 text-sm">
              A global agricultural marketplace built on Solana blockchain, 
              connecting farmers directly with buyers worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-green-200 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-green-200 hover:text-white text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-green-200 hover:text-white text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-green-200 hover:text-white text-sm">
                  Sell Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-green-200 hover:text-white text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-green-200 hover:text-white text-sm">
                  Support
                </Link>
              </li>
              <li>
                <a 
                  href="https://solana.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-200 hover:text-white text-sm"
                >
                  Solana Blockchain
                </a>
              </li>
              <li>
                <a 
                  href="https://phantom.app" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-200 hover:text-white text-sm"
                >
                  Get a Wallet
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <p className="text-green-200 text-sm mb-4">
              Have questions or suggestions? Reach out to our team.
            </p>
            <a 
              href="mailto:info@agromark.com" 
              className="text-green-200 hover:text-white text-sm"
            >
              info@agromark.com
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-green-200 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} AgroMark. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="text-green-200 hover:text-white"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.38 4.482 13.941 13.941 0 01-10.12-5.13 4.916 4.916 0 001.524 6.574 4.88 4.88 0 01-2.23-.616v.061a4.917 4.917 0 003.95 4.827 4.904 4.904 0 01-2.224.084 4.918 4.918 0 004.6 3.42 9.86 9.86 0 01-6.115 2.107c-.4 0-.79-.023-1.177-.068a13.913 13.913 0 007.548 2.213c9.057 0 14.009-7.503 14.009-14.01 0-.213-.005-.425-.014-.636A10.006 10.006 0 0024 4.557z" />
              </svg>
            </a>
            <a 
              href="#" 
              className="text-green-200 hover:text-white"
              aria-label="Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 2.48v19.038c0 .261-.213.482-.482.482h-5.455v-8.297h2.776l.416-3.233h-3.192V8.563c0-.936.26-1.573 1.604-1.573h1.714V4.121c-.297-.04-1.315-.127-2.499-.127-2.474 0-4.168 1.51-4.168 4.29v2.394h-2.797v3.233h2.797v8.298H2.482A.483.483 0 012 21.518V2.482C2 2.212 2.213 2 2.482 2h19.036c.269 0 .482.212.482.48z" />
              </svg>
            </a>
            <a 
              href="#" 
              className="text-green-200 hover:text-white"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 