import { useEffect, useState } from 'react';

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

export function useAutoConnect(onWalletConnect: (name: string, account: string, provider: EIP6963Provider) => void) {
  const [walletProviders, setWalletProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [hasAutoConnected, setHasAutoConnected] = useState(false);

  useEffect(() => {
    const handleAnnounceProvider = (event: Event) => {
      const customEvent = event as CustomEvent<EIP6963AnnounceEventDetail>;
      if (customEvent.detail?.info) {
        setWalletProviders((prevProviders) => {
          if (prevProviders.some((p) => p.info.uuid === customEvent.detail.info.uuid)) {
            return prevProviders;
          }
          return [...prevProviders, customEvent.detail];
        });
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);
    };
  }, []);

  useEffect(() => {
    if (!hasAutoConnected && walletProviders.length > 0) {
      const lastWalletJSON = localStorage.getItem('lastConnectedWallet');
      if (lastWalletJSON) {
        try {
          const lastConnectedWallet = JSON.parse(lastWalletJSON);
          console.log('useAutoConnect: Found saved wallet:', lastConnectedWallet);
          const matchingProvider = walletProviders.find(
            (providerDetail) =>
              providerDetail?.info?.uuid === lastConnectedWallet.providerDetailInfo.uuid
          );
          if (matchingProvider) {
            console.log('useAutoConnect: Found matching provider, attempting auto-connect');
            
            // Auto-connect logic
            const handleWalletConnect = async (providerDetail: EIP6963ProviderDetail) => {
              try {
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
                
                if (accounts && accounts[0]) {
                  console.log('useAutoConnect: Auto-connecting wallet:', providerDetail.info.name);
                  // Call the connectWallet function with the correct parameters
                  onWalletConnect(providerDetail.info.name, accounts[0] as string, providerInstance);
                } else {
                  console.log('useAutoConnect: No accounts found for auto-connect');
                }
              } catch (error) {
                console.error('useAutoConnect: Error during auto-connect:', error);
              }
            };

            handleWalletConnect(matchingProvider);
          } else {
            console.log('useAutoConnect: No matching provider found');
          }
        } catch (err) {
          console.error('useAutoConnect: Error parsing lastConnectedWallet from localStorage:', err);
        }
      }
      setHasAutoConnected(true);
    }
  }, [walletProviders, hasAutoConnected, onWalletConnect]);

  return { walletProviders };
}
