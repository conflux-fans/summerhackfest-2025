import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { WalletConnectButton } from '../Buttons/WalletConnect';

const CONTRACT_ADDRESS = '0x79d9d9837F4E2a31259d4C1e89578D7Be82508dE'; // Your deployed contract
const CONTRACT_ABI = [
  "function execute((address to,uint256 value,bytes data)[] calldata calls, bytes calldata signature) external payable",
  "function nonce() view returns (uint256)"
];

export function MainPage() {
  const { address, isConnected } = useAppKitAccount();
  const { data: walletClient } = useWalletClient();
  const { isConnected: wagmiConnected } = useAccount();
  const publicClient = usePublicClient(); // ✅ comes from current connected chain

  const [ready, setReady] = useState(false);
  const [isDelegated, setIsDelegated] = useState(false);

  // Initialize when wallet is connected
  useEffect(() => {
    const initialize = async () => {
      if (isConnected && wagmiConnected && address && walletClient && publicClient) {
        try {
          console.log('WalletClient ready:', walletClient);
          setReady(true);
          // Check delegation status
          await checkDelegation(address);
        } catch (err) {
          console.error('Failed to initialize:', err);
          setReady(false);
        }
      } else {
        console.log('Not connected or missing client:', { isConnected, wagmiConnected, address, walletClient, publicClient });
        setReady(false);
      }
    };

    initialize();
  }, [isConnected, wagmiConnected, address, walletClient, publicClient]);

  // Check if EOA has an EIP-7702 delegation (0xef0100 prefix)
  const checkDelegation = async (userAddress: string) => {
    if (!publicClient) return;

    try {
      const code = await publicClient.getBytecode({ address: userAddress });
      console.log('EOA code:', code);
      if (code && code.startsWith('0xef0100') && code.slice(6).toLowerCase() === CONTRACT_ADDRESS.slice(2).toLowerCase()) {
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
    if (!address || !walletClient || !publicClient) {
      console.log('Missing dependencies:', { address, walletClient, publicClient });
      alert('Wallet not properly connected');
      return;
    }

    try {
      const chainId = await walletClient.getChainId();
      console.log('Chain ID:', chainId);
      const nonce = await publicClient.getTransactionCount({ address, blockTag: 'pending' });
      console.log('Nonce:', nonce);

      // Sign the authorization (delegates the contract to the EOA)
      const authorization = await walletClient.signAuthorization({
        account: walletClient.account,
        contractAddress: CONTRACT_ADDRESS,
        chainId,
        nonce,
      });
      console.log('Authorization:', authorization);

      // Construct and send EIP-7702 transaction
      const hash = await walletClient.sendTransaction({
        authorizationList: [authorization],
        chainId,
        nonce,
        maxPriorityFeePerGas: parseUnits('2', 'gwei'),
        maxFeePerGas: parseUnits('20', 'gwei'),
        gas: 100000n,
        to: address,
        value: 0n,
        data: '0x',
      });
      console.log('Delegation transaction sent:', hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Delegation confirmed!', receipt);

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
