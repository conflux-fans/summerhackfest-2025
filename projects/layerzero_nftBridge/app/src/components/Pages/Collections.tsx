import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Loader2, Network, Plus, Info } from 'lucide-react';
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

  // Initialize and check network
  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient) {
        setReady(true);
        if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
          setTxStatus('Please switch to Base Sepolia');
        } else {
          setTxStatus('');
          fetchUserCollections(
            address,
            publicClient,
            setCollections,
            setSelectedCollection,
            setTxStatus
          );
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

  return (
    <div className="min-h-screen p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto pt-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              NFT Mint Studio
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Create and manage your NFT collections on Base Sepolia
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-3 animate-pulse ${
                  chainId === BASE_SEPOLIA_CHAIN_ID ? 'bg-green-400' : 'bg-yellow-400'
                }`}
              ></span>
              Network Status
            </h3>
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xs font-bold mr-3">
                  BASE
                </div>
                <div>
                  <div className="text-white font-medium">Base Sepolia</div>
                  <div
                    className={`text-sm ${
                      chainId === BASE_SEPOLIA_CHAIN_ID ? 'text-green-400' : 'text-yellow-400'
                    }`}
                  >
                    {chainId === BASE_SEPOLIA_CHAIN_ID ? 'Connected' : 'Switch Required'}
                  </div>
                </div>
              </div>
              <WalletConnectButton />
            </div>
            {chainId !== BASE_SEPOLIA_CHAIN_ID && (
              <button
                onClick={switchToBaseSepolia}
                disabled={isSwitching || !isConnected}
                className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center text-sm ${
                  isSwitching || !isConnected ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
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
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-white text-sm font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Select Collection
              </label>
              <select
                value={selectedCollection}
                onChange={(e) => handleCollectionSelect(e.target.value)}
                disabled={!isConnected || collections.length === 0}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  !isConnected || collections.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {collections.length === 0 ? (
                  <option value="">No collections found</option>
                ) : (
                  collections.map((coll) => (
                    <option key={coll.address} value={coll.address}>
                      {coll.name} ({coll.symbol})
                    </option>
                  ))
                )}
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!isConnected || chainId !== BASE_SEPOLIA_CHAIN_ID}
              className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center ${
                !isConnected || chainId !== BASE_SEPOLIA_CHAIN_ID ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {collections.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                Your Collections
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {collections.map((coll) => (
                  <div
                    key={coll.address}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300"
                    onClick={() => navigate(`/collection/${coll.address}`)}
                  >
                    <img
                      src={coll.image}
                      alt={coll.name}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://via.placeholder.com/150?text=Collection+Image';
                      }}
                    />
                    <div className="text-center">
                      <p className="text-white font-medium text-lg">{coll.name}</p>
                      <p className="text-gray-400 text-sm">{coll.symbol}</p>
                      <p className="text-purple-300 text-xs font-mono mt-2">
                        {coll.address.slice(0, 6)}...{coll.address.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {txStatus && (
            <div
              className={`p-4 rounded-2xl border mt-6 ${
                txStatus.includes('Failed') || txStatus.includes('Please')
                  ? 'bg-red-500/10 border-red-500/20 text-red-300'
                  : txStatus.includes('Successfully')
                  ? 'bg-green-500/10 border-green-500/20 text-green-300'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
              }`}
            >
              <p className="text-center font-medium">{txStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
              Create New Collection
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-semibold mb-3">
                  Collection Name
                </label>
                <input
                  type="text"
                  placeholder="Enter collection name..."
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-3">
                  Collection Symbol
                </label>
                <input
                  type="text"
                  placeholder="Enter collection symbol (e.g., ART)"
                  value={collectionSymbol}
                  onChange={(e) => setCollectionSymbol(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                  Collection Image CID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter IPFS CID for collection image (e.g., Qm...)"
                  value={collectionImageCid}
                  onChange={(e) => setCollectionImageCid(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Enter the IPFS CID of your collection image. Use services like{' '}
                  <a
                    href="https://pinata.cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Pinata
                  </a>{' '}
                  or{' '}
                  <a
                    href="https://nft.storage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    NFT.Storage
                  </a>
                  .
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCreateCollection}
                  disabled={!collectionName || !collectionSymbol || isCreating}
                  className={`flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                    !collectionName || !collectionSymbol || isCreating
                      ? 'opacity-50 cursor-not-allowed hover:scale-100'
                      : ''
                  }`}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-3" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-3" />
                      Create
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300"
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