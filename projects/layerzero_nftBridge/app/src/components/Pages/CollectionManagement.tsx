import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { Loader2, Network, Plus, Image as ImageIcon, Info, ArrowLeft } from 'lucide-react';
import { WalletConnectButton } from '../Buttons/WalletConnect';
import { fetchNfts, mintNFT } from './utils/collections/contract';
import { validateIpfsCid, getIpfsUrl } from './utils/collections/ipfs';
import { BASE_SEPOLIA_CHAIN_ID } from './utils/constants';
import { COLLECTION_ABI } from './utils/abi/collectionAbi';

// Define interfaces for type safety
interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

interface NFT {
  tokenId: string;
  uri: string;
  image: string;
  name?: string;
}

export function CollectionManagement() {
  const { address: collectionAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionSymbol, setCollectionSymbol] = useState('');
  const [collectionImage, setCollectionImage] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [nftName, setNftName] = useState('');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [txStatus, setTxStatus] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [isLoadingCollection, setIsLoadingCollection] = useState(true);
  const [isLoadingNfts, setIsLoadingNfts] = useState(true);

  // Initialize and fetch collection details
  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient && collectionAddress) {
        setReady(true);
        if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
          setTxStatus('Please switch to Base Sepolia');
        } else {
          setTxStatus('');
          setIsLoadingCollection(true);
          setIsLoadingNfts(true);
          try {
            const name = (await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: COLLECTION_ABI,
              functionName: 'name',
            })) as string;
            const symbol = (await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: COLLECTION_ABI,
              functionName: 'symbol',
            })) as string;
            const imageCid = (await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: COLLECTION_ABI,
              functionName: 'collectionImage',
            })) as string;
            setCollectionName(name);
            setCollectionSymbol(symbol);
            setCollectionImage(
              imageCid
                ? getIpfsUrl(imageCid.replace('ipfs://', ''))
                : 'https://via.placeholder.com/150?text=Collection+Image'
            );
          } catch (err) {
            console.error('Failed to fetch collection details:', err);
            setTxStatus('Failed to load collection details');
          } finally {
            setIsLoadingCollection(false);
          }
          try {
            await fetchNfts(collectionAddress, address, publicClient, setNfts, setTxStatus);
          } catch (err) {
            console.error('Failed to fetch NFTs:', err);
            setTxStatus('Failed to load NFTs');
          } finally {
            setIsLoadingNfts(false);
          }
        }
      } else {
        setReady(false);
        setTxStatus('Please connect wallet to proceed');
      }
    };
    initialize();
  }, [isConnected, address, walletClient, publicClient, chainId, collectionAddress]);

  // Fetch metadata for NFTs to get names and images
  useEffect(() => {
    const fetchNftMetadata = async () => {
      const updatedNfts = await Promise.all(
        nfts.map(async (nft) => {
          if (nft.uri && validateIpfsCid(nft.uri.replace('ipfs://', ''))) {
            try {
              const response = await fetch(getIpfsUrl(nft.uri.replace('ipfs://', '')));
              const metadata: NFTMetadata = await response.json();
              return {
                ...nft,
                name: metadata.name || `Token #${nft.tokenId}`,
                image: metadata.image?.startsWith('ipfs://')
                  ? getIpfsUrl(metadata.image.replace('ipfs://', ''))
                  : metadata.image || 'https://via.placeholder.com/150?text=NFT+Image',
              };
            } catch (err) {
              console.error(`Failed to fetch metadata for NFT ${nft.tokenId}:`, err);
              return { ...nft, name: `Token #${nft.tokenId}` };
            }
          }
          return { ...nft, name: `Token #${nft.tokenId}` };
        })
      );
      setNfts(updatedNfts);
    };
    if (nfts.length > 0) {
      fetchNftMetadata();
    }
  }, [nfts]);

  // Handle IPFS CID for preview
  useEffect(() => {
    const fetchPreview = async () => {
      if (ipfsCid && validateIpfsCid(ipfsCid)) {
        try {
          const response = await fetch(getIpfsUrl(ipfsCid));
          const metadata: NFTMetadata = await response.json();
          const image = metadata.image?.startsWith('ipfs://')
            ? getIpfsUrl(metadata.image.replace('ipfs://', ''))
            : metadata.image || '';
          setPreviewUrl(image);
          setPreviewName(metadata.name || '');
        } catch (err) {
          console.error('Failed to fetch preview metadata:', err);
          setPreviewUrl('');
          setPreviewName('');
        }
      } else {
        setPreviewUrl('');
        setPreviewName('');
      }
    };
    fetchPreview();
  }, [ipfsCid]);

  const switchToBaseSepolia = async () => {
    if (!isConnected) {
      setTxStatus('Please connect wallet to switch networks');
      return;
    }
    setIsSwitching(true);
    try {
      await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID });
      setTxStatus('Successfully switched to Base Sepolia!');
    } catch (err: any) {
      console.error('Failed to switch to Base Sepolia:', err);
      setTxStatus(`Failed to switch to Base Sepolia network: ${err?.message || 'Unknown error'}`);
    }
    setIsSwitching(false);
  };

  const handleMintNFT = async () => {
    if (!isConnected || !walletClient || !publicClient || !ipfsCid || !collectionAddress || chainId !== BASE_SEPOLIA_CHAIN_ID) {
      setTxStatus(
        !isConnected ? 'Please connect wallet to mint NFT' :
        !ipfsCid ? 'Please enter IPFS CID' :
        'Please switch to Base Sepolia'
      );
      return;
    }
    if (!validateIpfsCid(ipfsCid)) {
      setTxStatus('Invalid IPFS CID. Please enter a valid CID (e.g., Qm...).');
      return;
    }
    setIsMinting(true);
    setIsLoadingNfts(true);
    try {
      await mintNFT(
        walletClient,
        publicClient,
        collectionAddress,
        address,
        ipfsCid,
        setNfts,
        fetchNfts,
        setTxStatus
      );
      setIpfsCid('');
      setNftName('');
      setShowMintModal(false);
      // Refetch NFTs after mint
      await fetchNfts(collectionAddress, address, publicClient, setNfts, setTxStatus);
    } catch (err: any) {
      console.error('Minting error:', err);
      setTxStatus(`Failed to mint NFT: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsMinting(false);
      setIsLoadingNfts(false);
    }
  };

  // Simplify txStatus class logic
  const getTxStatusClasses = () => {
    if (txStatus.includes('Failed') || txStatus.includes('Please')) {
      return 'bg-red-500/10 border-red-500/20 text-red-300';
    }
    if (txStatus.includes('🎉') || txStatus.includes('Successfully')) {
      return 'bg-green-500/10 border-green-500/20 text-green-300';
    }
    return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
  };

  const SkeletonLoader = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`}>
      <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/5"></div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Keep the existing gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <button
            onClick={() => navigate('/collections')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Collections
          </button>
          <WalletConnectButton />
        </header>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Collection Info and Network */}
          <div className="lg:col-span-1 space-y-6">
            {/* Collection Preview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              {isLoadingCollection ? (
                <>
                  <SkeletonLoader className="h-8 w-32 mb-4" />
                  <SkeletonLoader className="aspect-square mb-4" />
                  <div className="space-y-2">
                    <SkeletonLoader className="h-4" />
                    <SkeletonLoader className="h-4" />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">{collectionName || 'Collection'}</h2>
                  <div className="relative mb-4">
                    <img
                      src={collectionImage}
                      alt={collectionName}
                      className="w-full aspect-square object-cover rounded-2xl"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Collection+Image';
                      }}
                    />
                    {collectionSymbol && (
                      <div className="absolute top-2 right-2 bg-indigo-500/80 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {collectionSymbol}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Network:</span>
                      <span className="text-blue-300">Base Sepolia</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Contract:</span>
                      <span className="font-mono text-purple-300 truncate">
                        {collectionAddress ? `${collectionAddress.slice(0, 6)}...${collectionAddress.slice(-4)}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Network Status */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Network className="w-5 h-5 mr-2 text-blue-400" />
                Network Status
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                    B
                  </div>
                  <div>
                    <div className="text-white font-medium">Base Sepolia</div>
                    <div className={`text-sm ${chainId === BASE_SEPOLIA_CHAIN_ID ? 'text-green-400' : 'text-yellow-400'}`}>
                      {chainId === BASE_SEPOLIA_CHAIN_ID ? 'Connected' : 'Switch Required'}
                    </div>
                  </div>
                </div>
                <span className={`w-3 h-3 rounded-full ${chainId === BASE_SEPOLIA_CHAIN_ID ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></span>
              </div>
              {chainId !== BASE_SEPOLIA_CHAIN_ID && (
                <button
                  onClick={switchToBaseSepolia}
                  disabled={isSwitching || !isConnected}
                  className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                    isSwitching || !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSwitching ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Switching...
                    </>
                  ) : (
                    <>
                      <Network className="w-4 h-4 mr-2" />
                      Switch Network
                    </>
                  )}
                </button>
              )}
            </div>
            {/* Status Message */}
            {txStatus && (
              <div className={`p-4 rounded-2xl border ${getTxStatusClasses()}`}>
                <p className="text-center font-medium">{txStatus}</p>
              </div>
            )}
          </div>
          {/* Right Column: NFTs List */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-400" />
                NFTs in Collection
              </h3>
              <button
                onClick={() => setShowMintModal(true)}
                disabled={!isConnected || chainId !== BASE_SEPOLIA_CHAIN_ID}
                className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-300 flex items-center ${
                  !isConnected || chainId !== BASE_SEPOLIA_CHAIN_ID ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Mint NFT
              </button>
            </div>
            {isLoadingNfts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-64" />
                ))}
              </div>
            ) : nfts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT ${nft.tokenId}`}
                      className="w-full aspect-square object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/150?text=NFT+Image';
                      }}
                    />
                    <p className="text-white text-sm font-medium mb-1 truncate">{nft.name || `Token #${nft.tokenId}`}</p>
                    <p className="text-gray-400 text-xs font-mono truncate">
                      CID: {nft.uri.replace('ipfs://', '').slice(0, 8)}...
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>No NFTs found in this collection yet.</p>
                <p className="text-sm mt-2">Mint your first one!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mint Modal */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Mint New NFT</h3>
            <div className="md:flex md:gap-6 mb-6">
              <div className="space-y-6 md:flex-1">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">NFT Name (for metadata)</label>
                  <input
                    type="text"
                    placeholder="Enter NFT name (e.g., My Cool NFT)"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    disabled={!isConnected}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">IPFS CID (JSON Metadata)</label>
                  <input
                    type="text"
                    placeholder="Enter IPFS CID (e.g., Qm...)"
                    value={ipfsCid}
                    onChange={(e) => setIpfsCid(e.target.value)}
                    disabled={!isConnected}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-mono text-sm"
                  />
                  <p className="text-gray-400 text-xs mt-2 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    Use <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mx-1">Pinata</a> or <a href="https://nft.storage" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mx-1">NFT.Storage</a> for uploading.
                  </p>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:flex-1">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 h-full">
                  <p className="text-gray-300 text-sm font-medium mb-2">Preview</p>
                  <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="NFT Preview"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (previewUrl.startsWith('https://ipfs.io/')) {
                            setPreviewUrl(getIpfsUrl(ipfsCid, true));
                          } else {
                            target.src = 'https://via.placeholder.com/150?text=Preview';
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                        <p className="text-gray-500 text-xs">{ipfsCid ? 'Loading...' : 'Enter CID to preview'}</p>
                      </div>
                    )}
                  </div>
                  {previewName && (
                    <p className="text-white text-sm font-medium mt-2 truncate">Name: {previewName}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleMintNFT}
                disabled={!ready || !ipfsCid || chainId !== BASE_SEPOLIA_CHAIN_ID || isMinting}
                className={`flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                  !ready || !ipfsCid || chainId !== BASE_SEPOLIA_CHAIN_ID || isMinting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isMinting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Mint NFT
                  </>
                )}
              </button>
              <button
                onClick={() => setShowMintModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-2xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}