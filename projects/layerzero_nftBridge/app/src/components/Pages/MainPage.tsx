import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { parseUnits, encodeFunctionData, toHex, Address } from 'viem';
import { WalletConnectButton } from '../Buttons/WalletConnect';

const CONFLUX_ORIGIN_ADDRESS = '0x17f99bad7981986c684FDc8d78B1342ec7470ac1';
const BASE_WRAPPED_ADDRESS = '0x16dED18bd0ead69b331B0222110F74b5716627f8';
const LAYERZERO_ENDPOINT = '0x1a44076050125825900e736c501f859c50fE728c';
const CONFLUX_EID = 30212; // Conflux eSpace Mainnet EID
const BASE_EID = 30184; // Base Mainnet EID
const CONFLUX_CHAIN_ID = 1030; // Conflux eSpace Mainnet
const BASE_CHAIN_ID = 8453; // Base Mainnet

const ESPACE_BRIDGE_ABI = [
  {
    "inputs": [
      { "name": "_dstChainId", "type": "uint16" },
      { "name": "_dstContractBytes", "type": "bytes" },
      { "name": "_tokenId", "type": "uint256" },
      { "name": "_recipient", "type": "address" },
      { "name": "_adapterParams", "type": "bytes" }
    ],
    "name": "bridgeOut",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "_getTokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "originalNFT",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const BASE_WRAPPED_ABI = [
  {
    "inputs": [
      { "name": "_dstChainId", "type": "uint16" },
      { "name": "_dstContractBytes", "type": "bytes" },
      { "name": "_wrappedTokenId", "type": "uint256" },
      { "name": "_adapterParams", "type": "bytes" }
    ],
    "name": "bridgeBack",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_wrappedTokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const ERC721_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "index", "type": "uint256" }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

interface NFT {
  tokenId: string;
  tokenURI?: string;
}

export function MainPage() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [originalNFTAddress, setOriginalNFTAddress] = useState<Address | null>(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address && walletClient && publicClient) {
        setReady(true);
        if (chainId === CONFLUX_CHAIN_ID) {
          try {
            const nftAddress = await publicClient.readContract({
              address: CONFLUX_ORIGIN_ADDRESS,
              abi: ESPACE_BRIDGE_ABI,
              functionName: 'originalNFT',
            }) as Address;
            setOriginalNFTAddress(nftAddress);
          } catch (err) {
            console.error('Failed to fetch originalNFT:', err);
            setTxStatus('Error fetching NFT contract');
          }
        }
      } else {
        setReady(false);
        setTxStatus('Please connect wallet');
      }
    };
    initialize();
  }, [isConnected, address, walletClient, publicClient, chainId]);

  const fetchNFTs = async () => {
    if (!publicClient || !address) return;
    setIsLoadingNfts(true);
    try {
      const contractAddress = chainId === CONFLUX_CHAIN_ID ? originalNFTAddress : BASE_WRAPPED_ADDRESS;
      if (!contractAddress) {
        setTxStatus('NFT contract address not available');
        return;
      }
      const balance = await publicClient.readContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;
      const nftList: NFT[] = [];
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(i)],
        }) as bigint;
        let tokenURI = '';
        try {
          tokenURI = await publicClient.readContract({
            address: contractAddress,
            abi: ERC721_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          }) as string;
        } catch (err) {
          console.warn(`Failed to fetch tokenURI for token ${tokenId}:`, err);
        }
        nftList.push({ tokenId: tokenId.toString(), tokenURI });
      }
      setNfts(nftList);
      setShowNFTModal(true);
    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      setTxStatus('Failed to load NFT inventory');
    } finally {
      setIsLoadingNfts(false);
    }
  };

  const selectNFT = (tokenId: string) => {
    setTokenId(tokenId);
    setShowNFTModal(false);
    setIsApproved(false); // Reset approval status when selecting a new NFT
  };

  const switchToConflux = async () => {
    try {
      await switchChainAsync({ chainId: CONFLUX_CHAIN_ID });
      setTxStatus('Switched to Conflux eSpace');
      setTokenId('');
      setIsApproved(false);
    } catch (err) {
      console.error('Failed to switch to Conflux:', err);
      setTxStatus('Failed to switch to Conflux');
    }
  };

  const switchToBase = async () => {
    try {
      await switchChainAsync({ chainId: BASE_CHAIN_ID });
      setTxStatus('Switched to Base');
      setTokenId('');
      setIsApproved(false);
    } catch (err) {
      console.error('Failed to switch to Base:', err);
      setTxStatus('Failed to switch to Base');
    }
  };

  const approveNFT = async () => {
    if (!walletClient || !publicClient || !originalNFTAddress || !tokenId) {
      setTxStatus('Missing wallet, NFT contract, or token ID');
      return;
    }
    try {
      const hash = await walletClient.writeContract({
        address: originalNFTAddress,
        abi: ERC721_ABI,
        functionName: 'approve',
        args: [CONFLUX_ORIGIN_ADDRESS, BigInt(tokenId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setIsApproved(true);
      setTxStatus('NFT approved for bridging');
    } catch (err) {
      console.error('Approval error:', err);
      setTxStatus('Failed to approve NFT');
    }
  };

  const bridgeToBase = async () => {
    if (!walletClient || !publicClient || !recipient || !tokenId) {
      setTxStatus('Missing wallet, recipient, or token ID');
      return;
    }
    if (!isApproved) {
      setTxStatus('Please approve NFT first');
      return;
    }
    try {
      const dstContractBytes = toHex(BASE_WRAPPED_ADDRESS);
      const adapterParams = toHex(
        Buffer.concat([
          Buffer.from('0002', 'hex'), // v2 adapter params type
          Buffer.from((200000).toString(16).padStart(64, '0'), 'hex'), // gas limit
          Buffer.from((0).toString(16).padStart(64, '0'), 'hex'), // native for dst
          Buffer.from('0000000000000000000000000000000000000000', 'hex'), // refund address
        ])
      );
      const payload = encodeFunctionData({
        abi: ESPACE_BRIDGE_ABI,
        functionName: 'bridgeOut',
        args: [BASE_EID, dstContractBytes, BigInt(tokenId), recipient, adapterParams],
      });
      const { nativeFee } = await publicClient.readContract({
        address: LAYERZERO_ENDPOINT,
        abi: [
          {
            inputs: [
              { name: "_dstChainId", type: "uint16" },
              { name: "_userApplication", type: "address" },
              { name: "_payload", type: "bytes" },
              { name: "_payInZRO", type: "bool" },
              { name: "_adapterParams", type: "bytes" }
            ],
            name: "estimateFees",
            outputs: [
              { name: "nativeFee", type: "uint256" },
              { name: "zroFee", type: "uint256" }
            ],
            stateMutability: "view",
            type: "function"
          }
        ],
        functionName: 'estimateFees',
        args: [BASE_EID, CONFLUX_ORIGIN_ADDRESS, payload, false, adapterParams],
      });
      const hash = await walletClient.writeContract({
        address: CONFLUX_ORIGIN_ADDRESS,
        abi: ESPACE_BRIDGE_ABI,
        functionName: 'bridgeOut',
        args: [BASE_EID, dstContractBytes, BigInt(tokenId), recipient, adapterParams],
        value: nativeFee,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTxStatus(`NFT ${tokenId} bridged to Base!`);
      setIsApproved(false);
      setTokenId('');
    } catch (err: any) {
      console.error('Bridge to Base error:', err);
      setTxStatus('Failed to bridge to Base: ' + (err?.message || err));
    }
  };

  const bridgeBackToConflux = async () => {
    if (!walletClient || !publicClient || !recipient || !tokenId) {
      setTxStatus('Missing wallet, recipient, or token ID');
      return;
    }
    try {
      const owner = await publicClient.readContract({
        address: BASE_WRAPPED_ADDRESS,
        abi: BASE_WRAPPED_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      if (owner.toLowerCase() !== address?.toLowerCase()) {
        setTxStatus('You do not own this wrapped token');
        return;
      }
      const dstContractBytes = toHex(CONFLUX_ORIGIN_ADDRESS);
      const adapterParams = toHex(
        Buffer.concat([
          Buffer.from('0002', 'hex'),
          Buffer.from((200000).toString(16).padStart(64, '0'), 'hex'),
          Buffer.from((0).toString(16).padStart(64, '0'), 'hex'),
          Buffer.from('0000000000000000000000000000000000000000', 'hex'),
        ])
      );
      const payload = encodeFunctionData({
        abi: BASE_WRAPPED_ABI,
        functionName: 'bridgeBack',
        args: [CONFLUX_EID, dstContractBytes, BigInt(tokenId), adapterParams],
      });
      const { nativeFee } = await publicClient.readContract({
        address: LAYERZERO_ENDPOINT,
        abi: [
          {
            inputs: [
              { name: "_dstChainId", type: "uint16" },
              { name: "_userApplication", type: "address" },
              { name: "_payload", type: "bytes" },
              { name: "_payInZRO", type: "bool" },
              { name: "_adapterParams", type: "bytes" }
            ],
            name: "estimateFees",
            outputs: [
              { name: "nativeFee", type: "uint256" },
              { name: "zroFee", type: "uint256" }
            ],
            stateMutability: "view",
            type: "function"
          }
        ],
        functionName: 'estimateFees',
        args: [CONFLUX_EID, BASE_WRAPPED_ADDRESS, payload, false, adapterParams],
      });
      const hash = await walletClient.writeContract({
        address: BASE_WRAPPED_ADDRESS,
        abi: BASE_WRAPPED_ABI,
        functionName: 'bridgeBack',
        args: [CONFLUX_EID, dstContractBytes, BigInt(tokenId), adapterParams],
        value: nativeFee,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTxStatus(`Wrapped NFT ${tokenId} bridged back to Conflux!`);
      setTokenId('');
    } catch (err: any) {
      console.error('Bridge back to Conflux error:', err);
      setTxStatus('Failed to bridge back: ' + (err?.message || err));
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
        <div className="flex flex-col gap-2">
          <button
            onClick={switchToConflux}
            className={`bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition ${
              chainId === CONFLUX_CHAIN_ID ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={chainId === CONFLUX_CHAIN_ID}
          >
            Switch to Conflux
          </button>
          <button
            onClick={switchToBase}
            className={`bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition ${
              chainId === BASE_CHAIN_ID ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={chainId === BASE_CHAIN_ID}
          >
            Switch to Base
          </button>
        </div>
        <button
          onClick={fetchNFTs}
          disabled={!ready || isLoadingNfts}
          className={`bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition ${
            !ready || isLoadingNfts ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoadingNfts ? 'Loading NFTs...' : 'Select NFT'}
        </button>
        {tokenId && (
          <p className="text-gray-700">Selected Token ID: {tokenId}</p>
        )}
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />
        {chainId === CONFLUX_CHAIN_ID && (
          <button
            onClick={approveNFT}
            disabled={!ready || !tokenId || isApproved}
            className={`bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition ${
              !ready || !tokenId || isApproved ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isApproved ? 'NFT Approved' : 'Approve NFT'}
          </button>
        )}
        <button
          onClick={chainId === CONFLUX_CHAIN_ID ? bridgeToBase : bridgeBackToConflux}
          disabled={!ready || !tokenId || !recipient || (chainId === CONFLUX_CHAIN_ID && !isApproved)}
          className={`bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition ${
            !ready || !tokenId || !recipient || (chainId === CONFLUX_CHAIN_ID && !isApproved) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {chainId === CONFLUX_CHAIN_ID ? 'Bridge to Base' : 'Bridge Back to Conflux'}
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
              <div className="grid grid-cols-1 gap-4">
                {nfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="border border-gray-300 rounded-md p-4 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectNFT(nft.tokenId)}
                  >
                    <p className="font-semibold">Token ID: {nft.tokenId}</p>
                    {nft.tokenURI && (
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