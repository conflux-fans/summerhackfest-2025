import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { Loader2, Network, Plus, Image as ImageIcon, Info } from 'lucide-react';
import { WalletConnectButton } from '../Buttons/WalletConnect';
import { fetchNfts, mintNFT } from './utils/collections/contract';
import { validateIpfsCid, getIpfsUrl } from './utils/collections/ipfs';
import { BASE_SEPOLIA_CHAIN_ID } from './utils/constants';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
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
  const [tokenId, setTokenId] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [nfts, setNfts] = useState<{ tokenId: string; uri: string; image: string }[]>([]);
  const [txStatus, setTxStatus] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Initialize and fetch collection details
  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient && collectionAddress) {
        setReady(true);
        if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
          setTxStatus('Please switch to Base Sepolia');
        } else {
          setTxStatus('');
          try {
            const name = await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: require('./utils/collections/collectionAbi').COLLECTION_ABI,
              functionName: 'name',
            }) as string;
            const symbol = await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: require('./utils/collections/collectionAbi').COLLECTION_ABI,
              functionName: 'symbol',
            }) as string;
            setCollectionName(name);
            setCollectionSymbol(symbol);
            fetchNfts(collectionAddress, address, publicClient, setNfts, setTxStatus);
          } catch (err) {
            console.error('Failed to fetch collection details:', err);
            setTxStatus('Failed to load collection details');
          }
        }
      } else {
        setReady(false);
        setTxStatus('Please connect wallet to proceed');
      }
    };
    initialize();
  }, [isConnected, address, walletClient, publicClient, chainId, collectionAddress]);

  // Handle IPFS CID for preview
  useEffect(() => {
    if (ipfsCid && validateIpfsCid(ipfsCid)) {
      setPreviewUrl(getIpfsUrl(ipfsCid));
    } else {
      setPreviewUrl('');
    }
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
      setTxStatus('Failed to switch to Base Sepolia network: ' + (err?.message || 'Unknown error'));
    }
    setIsSwitching(false);
  };

  const handleMintNFT = async () => {
    if (!isConnected || !walletClient || !publicClient || !tokenId || !ipfsCid || !collectionAddress || chainId !== BASE_SEPOLIA_CHAIN_ID) {
      setTxStatus(
        !isConnected ? 'Please connect wallet to mint NFT' :
        !tokenId || !ipfsCid ? 'Please fill in all fields' :
        'Please switch to Base Sepolia'
      );
      return;
    }
    if (!validateIpfsCid(ipfsCid)) {
      setTxStatus('Invalid IPFS CID. Please enter a valid CID (e.g., Qm...).');
      return;
    }
    setIsMinting(true);
    try {
      await mintNFT(
        walletClient,
        publicClient,
        collectionAddress,
        address,
        tokenId,
        ipfsCid,
        setNfts,
        fetchNfts,
        setTxStatus
      );
      setTokenId('');
      setIpfsCid('');
      setShowMintModal(false);
    } catch (err: any) {
      console.error('Minting error:', err);
      setTxStatus('Failed to mint NFT: ' + (err?.message || 'Unknown error'));
    }
    setIsMinting(false);
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
              {collectionName || 'Collection Management'}
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Mint and manage NFTs for {collectionName} ({collectionSymbol})
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-400 hover:underline"
          >
            Back to Collections
          </button>
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
          {nfts.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                  NFTs in Collection
                </h3>
                <button
                  onClick={() => setShowMintModal(true)}
                  disabled={!isConnected || chainId !== BASE_SEPOLIA_CHAIN_ID}
                  className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center ${
                    !isConnected || chainId !== BASE_SEPOLIA_CHAIN_ID ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {nfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <img
                      src={nft.image}
                      alt={`NFT ${nft.tokenId}`}
                      className="w-full h-32 object-cover rounded-xl mb-2"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://via.placeholder.com/150?text=NFT+Image';
                      }}
                    />
                    <p className="text-white text-sm font-medium">Token ID: {nft.tokenId}</p>
                    <p className="text-gray-400 text-xs font-mono">
                      CID: {nft.uri.replace('ipfs://', '').slice(0, 8)}...
                    </p>
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
                  : txStatus.includes('🎉') || txStatus.includes('Successfully')
                  ? 'bg-green-500/10 border-green-500/20 text-green-300'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
              }`}
            >
              <p className="text-center font-medium">{txStatus}</p>
            </div>
          )}
        </div>

        {/* Mint NFT Modal */}
        {showMintModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Mint New NFT
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                    Token ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter token ID (e.g., 1)"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    disabled={!isConnected}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                    IPFS CID (JSON Metadata)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter IPFS CID for JSON metadata (e.g., Qm...)"
                    value={ipfsCid}
                    onChange={(e) => setIpfsCid(e.target.value)}
                    disabled={!isConnected}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm ${
                      !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <p className="text-gray-400 text-xs mt-2 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    Enter the IPFS CID of your NFT metadata JSON (with name, description, image). Use services like{' '}
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
                <div className="relative mb-6">
                  <div className="w-full max-w-sm mx-auto aspect-square bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl p-4 border border-white/10">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="NFT Preview"
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          if (previewUrl.startsWith('https://ipfs.io/')) {
                            setPreviewUrl(getIpfsUrl(ipfsCid, true));
                          } else {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 ${
                        previewUrl ? 'hidden' : 'flex'
                      }`}
                      style={{ display: previewUrl ? 'none' : 'flex' }}
                    >
                      <div className="text-center">
                        <ImageIcon className="text-6xl mb-4" />
                        <p className="text-gray-400">
                          {ipfsCid ? 'Loading preview...' : 'Enter IPFS CID to preview'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleMintNFT}
                    disabled={
                      !ready ||
                      !tokenId ||
                      !ipfsCid ||
                      chainId !== BASE_SEPOLIA_CHAIN_ID ||
                      isMinting
                    }
                    className={`flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                      !ready ||
                      !tokenId ||
                      !ipfsCid ||
                      chainId !== BASE_SEPOLIA_CHAIN_ID ||
                      isMinting
                        ? 'opacity-50 cursor-not-allowed hover:scale-100'
                        : ''
                    }`}
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-3" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-3" />
                        Mint NFT
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowMintModal(false)}
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
    </div>
  );
}