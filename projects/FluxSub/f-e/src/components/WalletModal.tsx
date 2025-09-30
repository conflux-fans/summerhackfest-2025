"use client";

import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
}

interface EIP6963Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  selectedAddress?: string;
  isMetaMask?: boolean;
  [key: string]: unknown;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP6963Provider;
}

interface EIP6963AnnounceEventDetail {
  info: EIP6963ProviderInfo;
  provider: EIP6963Provider;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnect: (name: string, account: string, providerDetail: EIP6963ProviderDetail, provider: EIP6963Provider) => void;
}

const WalletModal = ({ isOpen, onClose, onWalletConnect }: WalletModalProps) => {
  const [connectingWallet, setConnectingWallet] = React.useState('');
  const [walletProviders, setWalletProviders] = React.useState<EIP6963ProviderDetail[]>([]);
  const [hasAutoConnected, setHasAutoConnected] = React.useState(false);

  console.log('WalletModal rendered with isOpen:', isOpen);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleAnnounceProvider = (event: Event) => {
      const customEvent = event as CustomEvent<EIP6963AnnounceEventDetail>;
      if (customEvent.detail?.info) {
        setWalletProviders((prevProviders) => {
          if (prevProviders.some((p) => p.info.uuid === customEvent.detail.info.uuid)) {
            return prevProviders;
          }
          return [...prevProviders, customEvent.detail];
        });
      } else {
        console.warn('Received announceProvider event with missing detail:', event);
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);
    };
  }, []);

  const handleWalletConnect = React.useCallback(
    async (providerDetail: EIP6963ProviderDetail) => {
      try {
        setConnectingWallet(providerDetail.info.uuid);

        const providerInstance = providerDetail.provider;
        if (!providerInstance) {
          console.error(`Provider not found for ${providerDetail.info.name}`);
          return;
        }

        // Try to get the currently selected accounts without prompting.
        let accounts: string[] = await providerInstance.request({ method: 'eth_accounts' }) as string[];
        // If no accounts returned, check if the provider instance exposes a selectedAddress.
        if ((!accounts || accounts.length === 0) && providerInstance.selectedAddress) {
          accounts = [providerInstance.selectedAddress];
        }
        // If still empty, request accounts (this will prompt the user).
        if (!accounts || accounts.length === 0) {
          accounts = await providerInstance.request({ method: 'eth_requestAccounts' }) as string[];
        }
        
        if (accounts && accounts[0]) {
          localStorage.setItem(
            'lastConnectedWallet',
            JSON.stringify({
              account: accounts[0],
              providerDetailInfo: providerDetail.info,
            })
          );

          console.log(`${providerDetail.info.name} connected successfully!`);
          console.log('WalletModal calling onWalletConnect with:', {
            name: providerDetail.info.name,
            account: accounts[0] as string,
            providerDetail,
            providerInstance
          });
          onWalletConnect(providerDetail.info.name, accounts[0] as string, providerDetail, providerInstance);
          onClose();
        } else {
          console.error('No accounts found');
        }
      } catch (error) {
        console.error(
          `Error connecting to ${providerDetail.info?.name || 'unknown wallet'}:`,
          error
        );
      } finally {
        setConnectingWallet('');
      }
    },
    [onWalletConnect, onClose]
  );

  // Auto-connect is now handled by the useAutoConnect hook in SimpleConnectButton

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'all 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--background)',
          borderRadius: '24px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '70vh',
          border: '1px solid var(--gray-alpha-200)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          zIndex: 100000,
          animation: 'modalFadeIn 0.2s ease-out',
          fontFamily: 'var(--font-geist-sans)',
          overflow: 'auto',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
          transition: 'all 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(var(--foreground-rgb), 0.5)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
              e.currentTarget.style.backgroundColor = 'var(--gray-alpha-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(var(--foreground-rgb), 0.5)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {walletProviders.length > 0 ? (
            walletProviders.map((providerDetail) =>
              providerDetail?.info ? (
                <button
                  key={providerDetail.info.uuid}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--gray-alpha-200)',
                    borderRadius: '12px',
                    cursor: connectingWallet === providerDetail.info.uuid ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: connectingWallet === providerDetail.info.uuid ? 0.7 : 1,
                    fontFamily: 'var(--font-geist-sans)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => handleWalletConnect(providerDetail)}
                  disabled={connectingWallet === providerDetail.info.uuid}
                  onMouseEnter={(e) => {
                    if (connectingWallet !== providerDetail.info.uuid) {
                      e.currentTarget.style.backgroundColor = 'var(--gray-alpha-50)';
                      e.currentTarget.style.borderColor = 'var(--gray-alpha-300)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (connectingWallet !== providerDetail.info.uuid) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--gray-alpha-200)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {connectingWallet === providerDetail.info.uuid && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                      animation: 'loadingBar 2s linear infinite'
                    }} />
                  )}
                  
                  <div style={{
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <Image
                      src={providerDetail.info.icon.trim()}
                      alt={`${providerDetail.info.name} icon`}
                      width={28}
                      height={28}
                      style={{
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                  
                  <div style={{
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    <div style={{
                      fontWeight: '500',
                      marginBottom: '0.125rem',
                      color: 'var(--foreground)',
                      fontSize: '0.9rem'
                    }}>
                      {providerDetail.info.name}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(var(--foreground-rgb), 0.6)'
                    }}>
                      {connectingWallet === providerDetail.info.uuid ? 'Connecting...' : 'Click to connect'}
                    </div>
                  </div>

                  {connectingWallet === providerDetail.info.uuid && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid var(--foreground)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                </button>
              ) : null
            )
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(var(--foreground-rgb), 0.6)',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                No wallets detected. Please install a compatible wallet.
              </p>
            </div>
          )}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes modalFadeIn {
              0% {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes loadingBar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `
        }} />
      </div>
    </div>
  );
};

export default WalletModal;
