import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Loader2, Network, Plus, Info, Palette, Check, AlertCircle } from 'lucide-react';
import { WalletConnectButton } from '../Buttons/WalletConnect';
import { fetchUserCollections, createCollection } from './utils/collections/contract';
import { validateIpfsCid } from './utils/collections/ipfs';
import { BASE_SEPOLIA_CHAIN_ID } from './utils/constants';

export function Collections() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [collections, setCollections] = useState<
    { address: string; name: string; symbol: string; image: string }[]
  >([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionSymbol, setCollectionSymbol] = useState('');
  const [collectionImageCid, setCollectionImageCid] = useState('');
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Initialize and check network
  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient) {
        setReady(true);
        if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
          setTxStatus('Please switch to Base Sepolia');
        } else {
          setTxStatus('');
          setIsLoadingCollections(true);
          await fetchUserCollections(
            address,
            publicClient,
            setCollections,
            setSelectedCollection,
            setTxStatus
          );
          setIsLoadingCollections(false);
        }
      } else {
        setReady(false);
        setTxStatus('Please connect wallet to proceed');
      }
    };
    initialize();
  }, [isConnected, address, walletClient, publicClient, chainId]);

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
      setTxStatus('Failed to switch to Base Sepolia network: ' + (err?.message || 'Unknown error'));
    }
    setIsSwitching(false);
  };

  const handleCreateCollection = async () => {
    if (!isConnected || !walletClient || !publicClient || !collectionName || !collectionSymbol || chainId !== BASE_SEPOLIA_CHAIN_ID) {
      setTxStatus(
        !isConnected ? 'Please connect wallet to create collection' :
        !collectionName || !collectionSymbol ? 'Please fill in collection name and symbol' :
        'Please switch to Base Sepolia'
      );
      return;
    }
    if (collectionImageCid && !validateIpfsCid(collectionImageCid)) {
      setTxStatus('Invalid collection image CID. Please enter a valid CID (e.g., Qm...).');
      return;
    }
    setIsCreating(true);
    try {
      await createCollection(
        walletClient,
        publicClient,
        collectionName,
        collectionSymbol,
        collectionImageCid,
        setSelectedCollection,
        setCollections,
        setTxStatus
      );
      setShowCreateModal(false);
      setCollectionName('');
      setCollectionSymbol('');
      setCollectionImageCid('');
    } catch (err: any) {
      console.error('Collection creation error:', err);
      setTxStatus('Failed to create collection: ' + (err?.message || 'Unknown error'));
    }
    setIsCreating(false);
  };

  const handleCollectionSelect = (address: string) => {
    setSelectedCollection(address);
    navigate(`/collection/${address}`);
  };

  const isOnCorrectNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  return (
    <div className="min-h-screen p-6 pt-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className='flex items-center justify-center'>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mb-6 border border-white/20 me-2 lg:me-5">
          <Palette className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-4">
          Collections
        </h1>
        </div>
        <p className="text-white/60 text-xl max-w-lg mx-auto">
          Create and manage your NFT collections on Base Sepolia
        </p>
      </div>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Connection Status Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isOnCorrectNetwork ? 'bg-green-400' : 'bg-amber-400'}`}></div>
              <div>
                <h3 className="text-white font-semibold">Network Status</h3>
                <p className={`text-sm ${isOnCorrectNetwork ? 'text-green-400' : 'text-amber-400'}`}>
                  {isOnCorrectNetwork ? 'Base Sepolia Connected' : 'Wrong Network'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isOnCorrectNetwork && (
                <button
                  onClick={switchToBaseSepolia}
                  disabled={isSwitching || !isConnected}
                  className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isSwitching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Network className="w-4 h-4 mr-2" />
                  )}
                  Switch Network
                </button>
              )}
              <WalletConnectButton />
            </div>
          </div>
        </div>
        {/* Status Alert */}
        {txStatus && (
          <div className={`rounded-2xl border p-4 ${
            txStatus.includes('Failed') || txStatus.includes('Please')
              ? 'bg-red-500/10 border-red-500/20'
              : txStatus.includes('Successfully')
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-blue-500/10 border-blue-500/20'
          }`}>
            <div className="flex items-center space-x-3">
              {txStatus.includes('Failed') || txStatus.includes('Please') ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : txStatus.includes('Successfully') ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" />
              )}
              <p className={`font-medium ${
                txStatus.includes('Failed') || txStatus.includes('Please')
                  ? 'text-red-300'
                  : txStatus.includes('Successfully')
                  ? 'text-green-300'
                  : 'text-blue-300'
              }`}>
                {txStatus}
              </p>
            </div>
          </div>
        )}
        {/* Collections Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Collections</h2>
              <p className="text-white/60">Manage your NFT collections</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!isConnected || !isOnCorrectNetwork}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Collection
            </button>
          </div>
          {/* Collections Grid */}
          {isLoadingCollections ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-white/10"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-white/60 text-lg mb-2">No collections yet</h3>
              <p className="text-white/40">Create your first NFT collection to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <div
                  key={collection.address}
                  onClick={() => handleCollectionSelect(collection.address)}
                  className="group bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://via.placeholder.com/300x300/1f2937/9ca3af?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-1">{collection.name}</h3>
                    <p className="text-white/60 text-sm mb-3">{collection.symbol}</p>
                    <p className="text-purple-300 text-xs font-mono bg-purple-500/10 px-3 py-1 rounded-lg inline-block">
                      {collection.address.slice(0, 6)}...{collection.address.slice(-4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Create Collection</h3>
              <p className="text-white/60">Set up your new NFT collection</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g., My Awesome Art"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Collection Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., MAA"
                  value={collectionSymbol}
                  onChange={(e) => setCollectionSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">
                  Collection Image <span className="text-white/60 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="IPFS CID (e.g., Qm...)"
                  value={collectionImageCid}
                  onChange={(e) => setCollectionImageCid(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <div className="flex items-start space-x-2 mt-3 text-xs text-white/50">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Upload to <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Pinata</a> or <a href="https://nft.storage" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">NFT.Storage</a> for IPFS hosting
                  </p>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleCreateCollection}
                  disabled={!collectionName || !collectionSymbol || isCreating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}