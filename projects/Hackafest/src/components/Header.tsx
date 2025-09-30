import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from './Button';
import { simulateWalletConnection, simulateWalletDisconnection, getWalletState, addMockCollectionForDemo, simulationNotice } from '../utils/simulation';

const Header: React.FC = () => {
  const [wallet, setWallet] = useState(getWalletState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Show simulation notice on first load
    setShowNotice(true);
    const timer = setTimeout(() => setShowNotice(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleConnectWallet = async () => {
    if (wallet.connected) {
      setIsConnecting(true);
      await simulateWalletDisconnection();
      setWallet(getWalletState());
      setIsConnecting(false);
    } else {
      setIsConnecting(true);
      try {
        const connectedWallet = await simulateWalletConnection();
        setWallet(connectedWallet);
        // Add demo collection when wallet connects
        addMockCollectionForDemo();
      } catch (error) {
        console.error('Connection failed:', error);
      }
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {showNotice && (
        <div className="simulation-notice">
          <div className="container">
            <p>{simulationNotice}</p>
          </div>
        </div>
      )}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="header-logo">
              OWNERSHIP
            </Link>
            
            <nav className="header-nav">
              <Link href="/" className="header-nav-link">
                Home
              </Link>
              <Link href="/nft-showcase" className="header-nav-link">
                NFT Demo
              </Link>
              <Link href="/create" className="header-nav-link">
                Create
              </Link>
              <Link href="/marketplace" className="header-nav-link">
                Marketplace
              </Link>
              <Link href="/verify" className="header-nav-link">
                Verify
              </Link>
              <Link href="/link" className="header-nav-link">
                Link
              </Link>
              <Link href="/docs" className="header-nav-link">
                Docs
              </Link>
            </nav>
            
            <div className="header-actions">
              <Button 
                variant="primary" 
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 
                 wallet.connected ? formatAddress(wallet.address) : 'Connect Wallet'}
              </Button>
              {wallet.connected && (
                <>
                  <span className="wallet-balance">{wallet.balance} CFX</span>
                  <Link href="/account" className="header-nav-link">
                    Account
                  </Link>
                  <Link href="/dashboard" className="header-nav-link">
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;