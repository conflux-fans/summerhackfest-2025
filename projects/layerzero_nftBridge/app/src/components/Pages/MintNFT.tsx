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
    try {
      await switchChainAsync({ chainId: CONFLUX_CHAIN_ID });
      setTxStatus('Switched to Conflux eSpace');
    } catch (err) {
      console.error('Failed to switch to Conflux:', err);
      setTxStatus('Failed to switch to Conflux');
    }
  };

  const mintNFT = async () => {
    if (!walletClient || !publicClient || !nftName || !ipfsCid) {
      setTxStatus('Missing wallet, NFT name, or IPFS CID');
      return;
    }
    if (chainId !== CONFLUX_CHAIN_ID) {
      setTxStatus('Please switch to Conflux eSpace Mainnet');
      return;
    }
    try {
      const hash = await walletClient.writeContract({
        address: IMAGE_MINT_NFT_ADDRESS,
        abi: IMAGE_MINT_NFT_ABI,
        functionName: 'mintNFT',
        args: [nftName, ipfsCid],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setTxStatus(`NFT minted successfully! Token ID: ${receipt.logs[0].topics[3] ? BigInt(receipt.logs[0].topics[3]).toString() : 'unknown'}`);
      setNftName('');
      setIpfsCid('');
    } catch (err: any) {
      console.error('Minting error:', err);
      setTxStatus('Failed to mint NFT: ' + (err?.message || err));
    }
  };

  if (!isConnected) return <WalletConnectButton />;

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
        Mint NFT on <span className="text-indigo-600">Conflux eSpace</span>
      </h1>
      <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-xl">
        Create your own NFT by providing a name and an IPFS CID for the image.
      </p>
      <div className="flex flex-col gap-4 mb-12 w-full max-w-md">
        {chainId !== CONFLUX_CHAIN_ID && (
          <button
            onClick={switchToConflux}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Switch to Conflux eSpace
          </button>
        )}
        <input
          type="text"
          placeholder="NFT Name"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />
        <input
          type="text"
          placeholder="IPFS CID (e.g., Qm...)"
          value={ipfsCid}
          onChange={(e) => setIpfsCid(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />
        <button
          onClick={mintNFT}
          disabled={!ready || !nftName || !ipfsCid || chainId !== CONFLUX_CHAIN_ID}
          className={`bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition ${
            !ready || !nftName || !ipfsCid || chainId !== CONFLUX_CHAIN_ID ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Mint NFT
        </button>
        {txStatus && (
          <p className={`mt-4 ${txStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {txStatus}
          </p>
        )}
      </div>
    </div>
  );
}