import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { WalletConnectButton } from '../Buttons/WalletConnect';
import { NFT } from './utils/types';
import { fetchNFTs } from './utils/nftUtils';
import { NetworkDropdown } from '../Common/NetworkDropdown';
import { approveNFT, approveWrappedNFT, bridgeToBase, bridgeBackToConflux, registerCollection } from './utils/bridgeUtils';
import { CONFLUX_CHAIN_ID, CONFLUX_ORIGIN_ADDRESS, BASE_BRIDGE_ADDRESS } from './utils/constants';
import { ESPACE_BRIDGE_ABI, BASE_WRAPPED_ABI } from './utils/abis';
import { ethers } from 'ethers';

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
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isWhitelisting, setIsWhitelisting] = useState(false);
  const [tokenContractAddress, setTokenContractAddress] = useState('');

  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient) {
        setReady(true);
        setRecipient(address);
        if (chainId !== CONFLUX_CHAIN_ID && chainId !== 8453) {
          setTxStatus('Please switch to Conflux eSpace or Base');
          setIsApproved(false);
        } else {
          setTxStatus('');
        }
        if (tokenContractAddress && chainId === CONFLUX_CHAIN_ID) {
          try {
            const bridgeAddress = CONFLUX_ORIGIN_ADDRESS;
            const bridgeAbi = ESPACE_BRIDGE_ABI;
            const supported = await publicClient.readContract({
              address: bridgeAddress as `0x${string}`,
              abi: bridgeAbi,
              functionName: 'supportedTokens',
              args: [tokenContractAddress as `0x${string}`],
            });
            setIsSupported(!!supported);
            if (!supported) {
              setTxStatus('Token contract not registered. Please whitelist the collection to proceed.');
            }
          } catch (err) {
            console.error('Failed to check supportedTokens', err);
            setIsSupported(false);
            setTxStatus('Failed to verify token contract status. Please whitelist the collection.');
          }
        } else {
          setIsSupported(true);
        }
      } else {
        setReady(false);
        setRecipient('');
        setTxStatus('Please connect wallet to proceed');
        setIsApproved(false);
      }
    };
    initialize();
  }, [isConnected, address, walletClient, publicClient, chainId, tokenContractAddress]);

  const handleFetchNFTs = () => {
    if (!isConnected) {
      setTxStatus('Please connect wallet to browse NFTs');
      return;
    }
    fetchNFTs(publicClient, address, chainId, setNfts, setTxStatus, setIsLoadingNfts).then(() =>
      setShowNFTModal(true)
    );
  };

  const selectNFT = (nft: NFT) => {
    setTokenId(nft.tokenId);
    setTokenContractAddress(nft.contractAddress || '');
    setSelectedNFT(nft);
    setShowNFTModal(false);
    setIsApproved(false);
    setTxStatus('');
  };

  const toggleCustomRecipient = () => {
    setUseCustomRecipient(!useCustomRecipient);
    setRecipient(!useCustomRecipient ? '' : address || '');
  };

  const getChainInfo = (id: number) => {
    switch (id) {
      case CONFLUX_CHAIN_ID:
        return { name: 'Conflux', color: 'from-emerald-400 to-teal-500', logo: 'CFX' };
      case 8453:
        return { name: 'Base', color: 'from-blue-400 to-indigo-500', logo: 'BASE' };
      default:
        return { name: 'Unknown', color: 'from-gray-400 to-gray-500', logo: '?' };
    }
  };

  const currentChain = getChainInfo(chainId || 0);
  const targetChain = getChainInfo(chainId === CONFLUX_CHAIN_ID ? 8453 : CONFLUX_CHAIN_ID);

  const handleWhitelistClick = async () => {
    console.log('[MainPage] Calling registerCollection with:', {
      walletClient,
      publicClient,
      tokenId,
      tokenContractAddress,
      setTxStatus: typeof setTxStatus,
      setIsSupported: typeof setIsSupported,
      setIsWhitelisting: typeof setIsWhitelisting,
    });
    try {
      await registerCollection(
        walletClient,
        publicClient,
        tokenId,
        tokenContractAddress,
        setTxStatus,
        setIsSupported,
        setIsWhitelisting
      );
    } catch (error) {
      console.error('[MainPage] Whitelisting error:', error);
      setTxStatus(`Failed to whitelist collection: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto pt-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">🌉</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              NFT Bridge
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Bridge any ERC-721 NFT between Conflux eSpace and Base using LayerZero technology
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Network Selection
                </h3>
                <NetworkDropdown
                  chainId={chainId}
                  switchChainAsync={switchChainAsync}
                  setTxStatus={setTxStatus}
                  setTokenId={setTokenId}
                  setIsApproved={setIsApproved}
                />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 bg-gradient-to-br ${currentChain.color} rounded-xl flex items-center justify-center text-white text-xs font-bold mr-3`}>
                      {currentChain.logo}
                    </div>
                    <div>
                      <div className="text-white font-medium">{currentChain.name}</div>
                      <div className="text-gray-400 text-sm">Current Network</div>
                    </div>
                  </div>
                  <div className="text-purple-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 bg-gradient-to-br ${targetChain.color} rounded-xl flex items-center justify-center text-white text-xs font-bold mr-3`}>
                      {targetChain.logo}
                    </div>
                    <div>
                      <div className="text-white font-medium">{targetChain.name}</div>
                      <div className="text-gray-400 text-sm">Destination</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Select NFT
              </h3>
              <button
                onClick={handleFetchNFTs}
                disabled={!ready || isLoadingNfts}
                className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                  !ready || isLoadingNfts ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
                }`}
              >
                {isLoadingNfts ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning Collection...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Browse NFTs
                  </>
                )}
              </button>
            </div>
            <div className="mb-8">
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
                Recipient Address
              </h3>
              <div className="mb-4">
                <label className="flex items-center text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomRecipient}
                    onChange={toggleCustomRecipient}
                    className="sr-only"
                    disabled={!isConnected}
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 mr-3 flex items-center justify-center transition-all ${useCustomRecipient ? 'bg-purple-500 border-purple-500' : 'border-gray-500'} ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {useCustomRecipient && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                  Use custom recipient address
                </label>
              </div>
              <input
                type="text"
                placeholder="Recipient Address (0x...)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={!useCustomRecipient || !isConnected}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm ${
                  !useCustomRecipient || !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div className="space-y-4">
              {(chainId === CONFLUX_CHAIN_ID || chainId === 8453) && !isSupported && (
                <button
                  onClick={handleWhitelistClick}
                  disabled={!ready || !tokenContractAddress || isWhitelisting}
                  className={`w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                    !ready || !tokenContractAddress || isWhitelisting ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
                  }`}
                >
                  {isWhitelisting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Whitelisting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 0 0 0118 0z"/>
                      </svg>
                      Whitelist Collection
                    </>
                  )}
                </button>
              )}
              {(chainId === CONFLUX_CHAIN_ID || chainId === 8453) && (
                <button
                  onClick={() =>
                    chainId === CONFLUX_CHAIN_ID
                      ? approveNFT(walletClient, publicClient, tokenId, tokenContractAddress, setTxStatus, setIsApproved, setIsApproving)
                      : approveWrappedNFT(walletClient, publicClient, tokenId, tokenContractAddress, setTxStatus, setIsApproved, setIsApproving)
                  }
                  disabled={!ready || !tokenId || (chainId === CONFLUX_CHAIN_ID && (!isSupported || !tokenContractAddress)) || isApproved || isApproving}
                  className={`w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                    !ready || !tokenId || (chainId === CONFLUX_CHAIN_ID && (!isSupported || !tokenContractAddress)) || isApproved || isApproving ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
                  }`}
                >
                  {isApproving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Approving...
                    </>
                  ) : isApproved ? (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      NFT Approved
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Approve NFT
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() =>
                  chainId === CONFLUX_CHAIN_ID
                    ? bridgeToBase(walletClient, publicClient, tokenId, tokenContractAddress, recipient, isApproved, setTxStatus, setIsApproved, setTokenId, setIsBridging)
                    : bridgeBackToConflux(walletClient, publicClient, tokenId, recipient, tokenContractAddress, isApproved, setTxStatus, setTokenId, setIsBridging)
                }
                disabled={!ready || !tokenId || !recipient || !isApproved || (chainId === CONFLUX_CHAIN_ID && (!isSupported || !tokenContractAddress)) || isBridging}
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                  !ready || !tokenId || !recipient || !isApproved || (chainId === CONFLUX_CHAIN_ID && (!isSupported || !tokenContractAddress)) || isBridging
                    ? 'opacity-50 cursor-not-allowed hover:scale-100'
                    : ''
                }`}
              >
                {isBridging ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Bridging NFT...
                  </>
                ) : (
                  <>
                    <span className="mr-3">🌉</span>
                    {chainId === CONFLUX_CHAIN_ID ? 'Bridge to Base' : 'Bridge to Conflux'}
                  </>
                )}
              </button>
            </div>
            {txStatus && (
              <div className={`mt-6 p-4 rounded-2xl border ${
                txStatus.includes('Failed') || txStatus.includes('Please') || txStatus.includes('Invalid')
                  ? 'bg-red-500/10 border-red-500/20 text-red-300'
                  : 'bg-green-500/10 border-green-500/20 text-green-300'
              }`}>
                <p className="text-center font-medium">{txStatus}</p>
              </div>
            )}
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
              <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse"></span>
              Selected NFT
            </h3>
            {selectedNFT ? (
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-full max-w-sm mx-auto aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-4 border border-white/10">
                    {selectedNFT.image ? (
                      <img
                        src={selectedNFT.image}
                        alt={`NFT ${selectedNFT.tokenId}`}
                        className="w-full h-full object-contain rounded-2xl"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x400/6366f1/ffffff?text=NFT';
                          e.currentTarget.alt = 'No image available';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🖼️</div>
                          <p className="text-gray-400">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    #{selectedNFT.tokenId}
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h4 className="text-white text-xl font-bold mb-2">
                    {selectedNFT.name || `Token #${selectedNFT.tokenId}`}
                  </h4>
                  <div className="text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span>Token ID:</span>
                      <span className="font-mono text-purple-300">#{selectedNFT.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span className="text-emerald-300">{currentChain.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contract:</span>
                      <span className="font-mono text-xs text-cyan-300">
                        {selectedNFT.contractAddress ? `${selectedNFT.contractAddress.slice(0, 6)}...${selectedNFT.contractAddress.slice(-4)}` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`${isApproved ? 'text-green-300' : 'text-yellow-300'}`}>
                        {isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-6">
                  <span className="text-4xl text-gray-500">🖼️</span>
                </div>
                <h4 className="text-white text-xl font-semibold mb-2">No NFT Selected</h4>
                <p className="text-gray-400">Click "Browse NFTs" to select an NFT for bridging</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {showNFTModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <span className="mr-3">🎨</span>
                Select Your NFT
              </h2>
              <button
                onClick={() => setShowNFTModal(false)}
                className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl flex items-center justify-center text-red-300 hover:text-red-200 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {nfts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-3xl">😕</span>
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">No NFTs Found</h3>
                  <p className="text-gray-400">We couldn't find any NFTs in your wallet on this network.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <div
                      key={`${nft.contractAddress}-${nft.tokenId}`}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all duration-300 transform hover:scale-105 group"
                      onClick={() => selectNFT(nft)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-2 mb-4 overflow-hidden">
                        {nft.image ? (
                          <img
                            src={nft.image}
                            alt={`NFT ${nft.tokenId}`}
                            className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT';
                              e.currentTarget.alt = 'No image available';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-800">
                            <span className="text-4xl text-gray-500">🖼️</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <h4 className="text-white font-semibold text-lg mb-1">
                          {nft.name || `Token #${nft.tokenId}`}
                        </h4>
                        <p className="text-gray-400 text-sm font-mono">ID: {nft.tokenId}</p>
                        <p className="text-gray-400 text-sm font-mono">
                          Contract: {nft.contractAddress ? `${nft.contractAddress.slice(0, 6)}...${nft.contractAddress.slice(-4)}` : 'Unknown'}
                        </p>
                      </div>
                      <div className="mt-4 bg-purple-500/20 rounded-lg p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-purple-300 text-sm font-medium">Click to Select</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}