import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { WalletConnectButton } from '../Buttons/WalletConnect';
import { NFT } from './utils/types';
import { fetchNFTs } from './utils/nftUtils';
import { approveNFT, bridgeToBase, bridgeBackToConflux } from './utils/bridgeUtils';
import { switchToConflux, switchToBase } from './utils/chainUtils';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID } from './utils/constants';

export function MainPage() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [useCustomRecipient, setUseCustomRecipient] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient) {
        setReady(true);
        setRecipient(address); // Set default recipient to user's wallet
        if (chainId !== CONFLUX_CHAIN_ID && chainId !== BASE_CHAIN_ID) {
          setTxStatus('Please switch to Conflux eSpace or Base');
        } else {
          setTxStatus('');
        }
      } else {
        setReady(false);
        setRecipient('');
        setTxStatus('Please connect wallet');
      }
    };
    initialize();
  }, [isConnected, address, walletClient, publicClient, chainId]);

  const handleFetchNFTs = () => {
    fetchNFTs(publicClient, address, chainId, setNfts, setTxStatus, setIsLoadingNfts).then(() => setShowNFTModal(true));
  };

  const selectNFT = (tokenId: string) => {
    setTokenId(tokenId);
    setShowNFTModal(false);
    setIsApproved(false);
  };

  const toggleCustomRecipient = () => {
    setUseCustomRecipient(!useCustomRecipient);
    if (!useCustomRecipient) {
      setRecipient(''); // Clear for custom input
    } else {
      setRecipient(address || ''); // Reset to wallet address
    }
  };

  if (!isConnected) return <WalletConnectButton />;

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
        NFT Bridge: <span className="text-indigo-600">Conflux ↔ Base</span>
      </h1>
      <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-xl">
        Bridge your NFTs between Conflux eSpace and Base using LayerZero.
      </p>
      <div className="flex flex-col gap-4 mb-12 w-full max-w-md">
        <WalletConnectButton />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => switchToConflux(switchChainAsync, setTxStatus, setTokenId, setIsApproved)}
            className={`bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition ${
              chainId === CONFLUX_CHAIN_ID ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={chainId === CONFLUX_CHAIN_ID}
          >
            Switch to Conflux
          </button>
          <button
            onClick={() => switchToBase(switchChainAsync, setTxStatus, setTokenId, setIsApproved)}
            className={`bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition ${
              chainId === BASE_CHAIN_ID ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={chainId === BASE_CHAIN_ID}
          >
            Switch to Base
          </button>
        </div>
        <button
          onClick={handleFetchNFTs}
          disabled={!ready || isLoadingNfts}
          className={`bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition flex items-center justify-center ${
            !ready || isLoadingNfts ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoadingNfts ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading NFTs...
            </>
          ) : (
            'Select NFT'
          )}
        </button>
        {tokenId && (
          <p className="text-gray-700">Selected Token ID: {tokenId}</p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useCustomRecipient}
            onChange={toggleCustomRecipient}
            className="w-5 h-5"
          />
          <label className="text-gray-700">Use custom recipient address</label>
        </div>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={!useCustomRecipient}
          className={`border border-gray-300 rounded-md px-4 py-2 w-full ${
            !useCustomRecipient ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        {chainId === CONFLUX_CHAIN_ID && (
          <button
            onClick={() => approveNFT(walletClient, publicClient, tokenId, setTxStatus, setIsApproved, setIsApproving)}
            disabled={!ready || !tokenId || isApproved || isApproving}
            className={`bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition flex items-center justify-center ${
              !ready || !tokenId || isApproved || isApproving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isApproving ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Approving...
              </>
            ) : isApproved ? (
              'NFT Approved'
            ) : (
              'Approve NFT'
            )}
          </button>
        )}
        <button
          onClick={() =>
            chainId === CONFLUX_CHAIN_ID
              ? bridgeToBase(walletClient, publicClient, tokenId, recipient, isApproved, setTxStatus, setIsApproved, setTokenId, setIsBridging)
              : bridgeBackToConflux(walletClient, publicClient, tokenId, recipient, address, setTxStatus, setTokenId, setIsBridging)
          }
          disabled={!ready || !tokenId || !recipient || (chainId === CONFLUX_CHAIN_ID && !isApproved) || isBridging}
          className={`bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition flex items-center justify-center ${
            !ready || !tokenId || !recipient || (chainId === CONFLUX_CHAIN_ID && !isApproved) || isBridging ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isBridging ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Bridging...
            </>
          ) : (
            chainId === CONFLUX_CHAIN_ID ? 'Bridge to Base' : 'Bridge Back to Conflux'
          )}
        </button>
        {txStatus && (
          <p className={`mt-4 ${txStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {txStatus}
          </p>
        )}
      </div>

      {/* NFT Selection Modal */}
      {showNFTModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Select an NFT</h2>
            {nfts.length === 0 ? (
              <p className="text-gray-700">No NFTs found in your wallet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="border border-gray-300 rounded-md p-4 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectNFT(nft.tokenId)}
                  >
                    <p className="font-semibold">Token ID: {nft.tokenId}</p>
                    {nft.name && <p className="text-gray-600">Name: {nft.name}</p>}
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={`NFT ${nft.tokenId}`}
                        className="w-full h-48 object-contain rounded-md mt-2"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                          e.currentTarget.alt = 'No image available';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md mt-2">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                    {nft.tokenURI && !nft.image && (
                      <p className="text-gray-600 truncate">URI: {nft.tokenURI}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowNFTModal(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}