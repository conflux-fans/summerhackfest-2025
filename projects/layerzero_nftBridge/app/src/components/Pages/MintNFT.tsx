import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { WalletConnectButton } from '../Buttons/WalletConnect';

const CONFLUX_CHAIN_ID = 1030; // Conflux eSpace Mainnet
const IMAGE_MINT_NFT_ADDRESS = '0xD9Ed0B00Aa868Cd2E7aa4198C7D792D3aF9ec61d';

const IMAGE_MINT_NFT_ABI = [
  {
    "inputs": [
      { "name": "_name", "type": "string" },
      { "name": "_cid", "type": "string" }
    ],
    "name": "mintNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function MintNFT() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);
  const [nftName, setNftName] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient) {
        setReady(true);
        if (chainId !== CONFLUX_CHAIN_ID) {
          setTxStatus('Please switch to Conflux eSpace Mainnet');
        } else {
          setTxStatus('');
        }
      } else {
        setReady(false);
        setTxStatus('Please connect wallet');
      }
    };
    initialize();
  }, [isConnected, address, walletClient, publicClient, chainId]);

  const switchToConflux = async () => {
    setIsSwitching(true);
    try {
      await switchChainAsync({ chainId: CONFLUX_CHAIN_ID });
      setTxStatus('Successfully switched to Conflux eSpace!');
    } catch (err) {
      console.error('Failed to switch to Conflux:', err);
      setTxStatus('Failed to switch to Conflux network');
    }
    setIsSwitching(false);
  };

  const mintNFT = async () => {
    if (!walletClient || !publicClient || !nftName || !ipfsCid) {
      setTxStatus('Please fill in all fields');
      return;
    }
    if (chainId !== CONFLUX_CHAIN_ID) {
      setTxStatus('Please switch to Conflux eSpace Mainnet');
      return;
    }
    
    setIsMinting(true);
    try {
      setTxStatus('Preparing transaction...');
      const hash = await walletClient.writeContract({
        address: IMAGE_MINT_NFT_ADDRESS,
        abi: IMAGE_MINT_NFT_ABI,
        functionName: 'mintNFT',
        args: [nftName, ipfsCid],
      });
      
      setTxStatus('Transaction sent! Waiting for confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      const tokenId = receipt.logs[0].topics[3] ? BigInt(receipt.logs[0].topics[3]).toString() : 'unknown';
      setTxStatus(`🎉 NFT minted successfully! Token ID: ${tokenId}`);
      
      // Reset form
      setNftName('');
      setIpfsCid('');
    } catch (err: any) {
      console.error('Minting error:', err);
      setTxStatus('Failed to mint NFT: ' + (err?.message || 'Unknown error'));
    }
    setIsMinting(false);
  };

  // Generate preview URL from IPFS CID
  const getImagePreview = (cid: string) => {
    if (!cid || !cid.startsWith('Qm')) return null;
    return `https://ipfs.io/ipfs/${cid}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🎨</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-4">
              NFT Mint Studio
            </h1>
            <p className="text-gray-300 text-xl mb-8">Connect your wallet to start creating</p>
          </div>
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              NFT Mint Studio
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Create unique digital assets on Conflux eSpace with your custom artwork and metadata
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel - Minting Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Network Status */}
            <div className="mb-8">
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-3 animate-pulse ${chainId === CONFLUX_CHAIN_ID ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                Network Status
              </h3>
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-xs font-bold mr-3">
                    CFX
                  </div>
                  <div>
                    <div className="text-white font-medium">Conflux eSpace</div>
                    <div className={`text-sm ${chainId === CONFLUX_CHAIN_ID ? 'text-green-400' : 'text-yellow-400'}`}>
                      {chainId === CONFLUX_CHAIN_ID ? 'Connected' : 'Switch Required'}
                    </div>
                  </div>
                </div>
                {chainId !== CONFLUX_CHAIN_ID && (
                  <button
                    onClick={switchToConflux}
                    disabled={isSwitching}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center text-sm"
                  >
                    {isSwitching ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Switching...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                        </svg>
                        Switch Network
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* NFT Details Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                  NFT Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your NFT name..."
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                  IPFS CID
                </label>
                <input
                  type="text"
                  placeholder="Qm... (IPFS Content Identifier)"
                  value={ipfsCid}
                  onChange={(e) => setIpfsCid(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Upload your image to IPFS and paste the CID here
                </p>
              </div>

              {/* Mint Button */}
              <button
                onClick={mintNFT}
                disabled={!ready || !nftName || !ipfsCid || chainId !== CONFLUX_CHAIN_ID || isMinting}
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                  !ready || !nftName || !ipfsCid || chainId !== CONFLUX_CHAIN_ID || isMinting
                    ? 'opacity-50 cursor-not-allowed hover:scale-100'
                    : ''
                }`}
              >
                {isMinting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting NFT...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Mint NFT
                  </>
                )}
              </button>

              {/* Status Message */}
              {txStatus && (
                <div className={`p-4 rounded-2xl border ${
                  txStatus.includes('Failed') || txStatus.includes('Please') 
                    ? 'bg-red-500/10 border-red-500/20 text-red-300' 
                    : txStatus.includes('🎉') || txStatus.includes('Successfully')
                    ? 'bg-green-500/10 border-green-500/20 text-green-300'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}>
                  <p className="text-center font-medium">{txStatus}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
              <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse"></span>
              NFT Preview
            </h3>
            
            <div className="text-center">
              {/* Image Preview */}
              <div className="relative mb-6">
                <div className="w-full max-w-sm mx-auto aspect-square bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl p-4 border border-white/10">
                  {getImagePreview(ipfsCid) ? (
                    <img
                      src={getImagePreview(ipfsCid)}
                      alt="NFT Preview"
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 ${getImagePreview(ipfsCid) ? 'hidden' : 'flex'}`}>
                    <div className="text-center">
                      <div className="text-6xl mb-4">🖼️</div>
                      <p className="text-gray-400">
                        {ipfsCid ? 'Loading preview...' : 'Enter IPFS CID to preview'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                {nftName && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {nftName}
                  </div>
                )}
              </div>
              
              {/* NFT Info */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-white text-xl font-bold mb-4">
                  {nftName || 'Your NFT Name'}
                </h4>
                <div className="text-gray-300 space-y-3">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="text-emerald-300">Conflux eSpace</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract:</span>
                    <span className="font-mono text-xs text-purple-300">
                      {IMAGE_MINT_NFT_ADDRESS.slice(0, 6)}...{IMAGE_MINT_NFT_ADDRESS.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IPFS CID:</span>
                    <span className="font-mono text-xs text-cyan-300">
                      {ipfsCid ? `${ipfsCid.slice(0, 8)}...` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`${
                      chainId === CONFLUX_CHAIN_ID && nftName && ipfsCid 
                        ? 'text-green-300' 
                        : 'text-yellow-300'
                    }`}>
                      {chainId === CONFLUX_CHAIN_ID && nftName && ipfsCid 
                        ? 'Ready to Mint' 
                        : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div className="text-left">
                    <h5 className="text-blue-300 font-semibold text-sm mb-1">Pro Tip</h5>
                    <p className="text-blue-200 text-xs">
                      Use services like Pinata or NFT.Storage to upload your images to IPFS. Make sure your image is high quality for the best NFT experience!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}