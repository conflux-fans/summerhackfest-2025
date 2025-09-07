import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { WalletConnectButton } from '../Buttons/WalletConnect';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Your deployed contract
const CONTRACT_ABI = [
  "function execute((address to,uint256 value,bytes data)[] calldata calls, bytes calldata signature) external payable",
  "function nonce() view returns (uint256)"
];

export function MainPage() {
  const { address, isConnected } = useAppKitAccount();
  const { data: walletClient } = useWalletClient();
  const { isConnected: wagmiConnected } = useAccount();
  const [ready, setReady] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isDelegated, setIsDelegated] = useState(false);

  // Initialize signer when wallet is connected
  useEffect(() => {
    const initializeSigner = async () => {
      if (isConnected && wagmiConnected && address && walletClient) {
        try {
          console.log('Initializing provider with walletClient:', walletClient);
          const provider = new ethers.BrowserProvider(walletClient);
          const signer = await provider.getSigner();
          console.log('Signer initialized:', await signer.getAddress());
          setSigner(signer);
          setReady(true);
          // Check delegation status
          await checkDelegation(signer, address);
        } catch (err) {
          console.error('Failed to initialize provider or signer:', err);
          setSigner(null);
          setReady(false);
        }
      } else {
        console.log('Not connected or missing walletClient:', { isConnected, wagmiConnected, address, walletClient });
        setSigner(null);
        setReady(false);
      }
    };

    initializeSigner();
  }, [isConnected, wagmiConnected, address, walletClient]);

  // Check if EOA has an EIP-7702 delegation (0xef0100 prefix)
  const checkDelegation = async (signer: ethers.Signer, userAddress: string) => {
    try {
      const provider = await signer.provider;
      if (!provider) throw new Error('Provider not available');
      const code = await provider.getCode(userAddress);
      console.log('EOA code:', code);
      if (code.startsWith('0xef0100') && code.slice(6).toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
        setIsDelegated(true);
        console.log('EOA is delegated to:', CONTRACT_ADDRESS);
      } else {
        setIsDelegated(false);
        console.log('No delegation set for EOA');
      }
    } catch (err) {
      console.error('Failed to check delegation:', err);
      setIsDelegated(false);
    }
  };

  // Send EIP-7702 transaction to delegate to TokenTransferDelegate
  const executeEIP7702 = async () => {
    if (!signer || !address || !walletClient) {
      console.log('Signer, address, or walletClient not ready:', { signer, address, walletClient });
      alert('Wallet not properly connected');
      return;
    }

    try {
      const provider = await signer.provider;
      if (!provider) throw new Error('Provider not available');
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      console.log('Chain ID:', chainId);
      const nonce = await provider.getTransactionCount(address, 'pending');
      console.log('Nonce:', nonce);

      // Create authorization message for EIP-7702 delegation
      const authMessage = ethers.concat([
        ethers.toBeHex(chainId, 32),
        CONTRACT_ADDRESS,
        ethers.toBeHex(nonce, 32)
      ]);
      const authHash = ethers.keccak256(authMessage);
      console.log('Auth hash:', authHash);

      // Sign the authorization
      const signature = await walletClient.signMessage({
        account: address,
        message: { raw: authHash }
      });
      console.log('Signature:', signature);
      const { v, r, s } = ethers.Signature.from(signature);

      // Construct EIP-7702 transaction (type 0x04)
      const tx = {
        type: 0x04, // EIP-7702 transaction type
        chainId,
        nonce,
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxFeePerGas: ethers.parseUnits('20', 'gwei'),
        gasLimit: 100000, // Adjust based on network
        to: address, // Target is the user's EOA
        value: 0,
        data: '0x', // No data for delegation setup
        accessList: [],
        authorizationList: [{
          chainId,
          address: CONTRACT_ADDRESS,
          nonce,
          yParity: v - 27, // Convert v to yParity (0 or 1)
          r,
          s
        }]
      };

      console.log('Transaction object:', tx);
      // Send transaction
      const txResponse = await signer.sendTransaction(tx);
      console.log('Delegation transaction sent:', txResponse.hash);
      await txResponse.wait();
      console.log('Delegation confirmed!');
      setIsDelegated(true);
      alert('EIP-7702 delegation set successfully!');
    } catch (err: any) {
      console.error('Delegation error:', err);
      alert('Delegation failed: ' + (err?.message || err));
    }
  };

  // Placeholder for relayer execution
  const executeRelayerTransaction = async () => {
    if (!isDelegated) {
      alert('Please set delegation first using Execute EIP-7702');
      return;
    }
    alert('Relayer functionality not implemented yet. Delegation is set, ready for relayer to take over.');
  };

  if (!isConnected) return <WalletConnectButton />;

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
        Welcome to <span className="text-indigo-600">EIP-7702</span>
      </h1>
      <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-xl">
        Send and receive crypto seamlessly with EIP-7702. Sign once, let the relayer handle meta-transactions.
      </p>
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <WalletConnectButton />
        <button
          onClick={executeEIP7702}
          disabled={!ready || isDelegated}
          className={`bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition ${
            !ready || isDelegated ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDelegated ? 'Delegation Set' : 'Execute EIP-7702'}
        </button>
        <button
          onClick={executeRelayerTransaction}
          disabled={!isDelegated}
          className={`bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition ${
            !isDelegated ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Test Relayer
        </button>
      </div>
    </div>
  );
}