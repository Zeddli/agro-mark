import React, { useState } from 'react';
import Layout from '../components/layout/Layout';

/**
 * FAQPage component for frequently asked questions
 */
const FAQPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  // FAQ items
  const faqItems = [
    {
      question: 'What is AgroMark?',
      answer: 'AgroMark is a global agricultural marketplace built on the Solana blockchain. It connects farmers directly with buyers worldwide, enabling secure and efficient agricultural trade with instant settlements and low transaction fees.'
    },
    {
      question: 'How do I get started as a buyer?',
      answer: 'To get started as a buyer, you need to: 1) Create a Solana wallet (like Phantom or Solflare), 2) Connect your wallet to AgroMark, 3) Complete your profile, and 4) Browse the marketplace to find products you want to purchase.'
    },
    {
      question: 'How do I get started as a seller?',
      answer: 'To start selling on AgroMark: 1) Create a Solana wallet, 2) Connect your wallet to AgroMark, 3) Complete your profile and check the "seller" option, 4) Navigate to the "Sell" section to create your first product listing.'
    },
    {
      question: 'How does the escrow system work?',
      answer: 'Our escrow system protects both buyers and sellers. When you make a purchase, your funds are held in a secure smart contract until you confirm receipt of the goods. This ensures that sellers only receive payment after successful delivery, and buyers can be confident their funds are protected.'
    },
    {
      question: 'What currencies are accepted on AgroMark?',
      answer: 'AgroMark currently supports payments in SOL (Solana\'s native token) and USDC (a stablecoin pegged to the US dollar). This gives users flexibility to choose between cryptocurrency or stable value options.'
    },
    {
      question: 'How are transaction fees calculated?',
      answer: 'AgroMark charges a small platform fee of 2% on each successful transaction, which helps maintain and improve the platform. Additionally, there are minimal Solana network fees (typically less than $0.01 per transaction) which are much lower than traditional payment processors.'
    },
    {
      question: 'How is shipping handled?',
      answer: 'Shipping is arranged between the buyer and seller. Sellers specify available shipping options and costs in their listings. After purchase, sellers are responsible for arranging delivery and providing tracking information through the platform.'
    },
    {
      question: 'What if I have a dispute with a transaction?',
      answer: 'If you encounter issues with a transaction, you can: 1) Contact the other party directly through our messaging system, 2) If unresolved, open a formal dispute through your order details page, 3) Our dispute resolution team will review the evidence and help mediate a fair solution.'
    },
    {
      question: 'How does the reputation system work?',
      answer: 'After completing a transaction, buyers can leave reviews and ratings for sellers. These reviews are stored on the blockchain for transparency and cannot be altered. Sellers build their reputation over time, helping buyers make informed decisions about who to purchase from.'
    },
    {
      question: 'Is AgroMark available worldwide?',
      answer: 'Yes, AgroMark is designed for global use. However, users are responsible for ensuring compliance with their local regulations regarding agricultural trade and cryptocurrency transactions.'
    },
    {
      question: 'Do I need technical blockchain knowledge to use AgroMark?',
      answer: 'No, we\'ve designed AgroMark to be user-friendly even for those with no blockchain experience. You\'ll need a digital wallet like Phantom or Solflare, but our interface guides you through the process without requiring technical knowledge.'
    },
    {
      question: 'How secure is the platform?',
      answer: 'AgroMark leverages the security of the Solana blockchain, which uses advanced cryptography to protect transactions. Our smart contracts are carefully designed and audited. User data is encrypted and protected according to industry best practices.'
    }
  ];

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none"
                  >
                    <span className="font-medium text-gray-900">{item.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transform ${openFaq === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div
                    className={`px-6 pb-4 ${openFaq === index ? 'block' : 'hidden'}`}
                  >
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
              <p className="mb-4">Our support team is here to help you.</p>
              <a 
                href="mailto:support@agromark.com"
                className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage; 