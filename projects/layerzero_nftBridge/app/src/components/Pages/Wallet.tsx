import { useState } from 'react';
import { ethers } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/react';
import { WalletGuard } from '../WalletGuard';

// Replace with your deployed contract address
const CONTRACT_ADDRESS = '0xYourContractAddressHere';
const CONTRACT_ABI = [
  "function execute((address to,uint256 value,bytes data)[] calldata calls) external payable"
];

export function WalletPage() {
  const { provider } = useAppKitAccount();

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [data, setData] = useState('');
  const [txStatus, setTxStatus] = useState('');

  const sendTransaction = async () => {
    try {
      if (!provider) return;

      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const call = [
        {
          to: toAddress,
          value: ethers.utils.parseEther(amount || '0'),
          data: data || '0x'
        }
      ];

      setTxStatus('Sending transaction...');
      const tx = await contract.execute(call, { value: ethers.utils.parseEther(amount || '0') });
      await tx.wait();
      setTxStatus('Transaction confirmed!');
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  return (
    <WalletGuard>
      <div className="max-w-md mx-auto py-12 px-6 bg-white shadow-lg rounded-xl border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Send Transaction</h1>

        <label className="block mb-4">
          To Address
          <input
            type="text"
            value={toAddress}
            onChange={e => setToAddress(e.target.value)}
            placeholder="0x..."
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </label>

        <label className="block mb-4">
          Amount (ETH)
          <input
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.1"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </label>

        <label className="block mb-6">
          Data (Hex, optional)
          <input
            type="text"
            value={data}
            onChange={e => setData(e.target.value)}
            placeholder="0x..."
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </label>

        <button
          onClick={sendTransaction}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Send
        </button>

        {txStatus && <p className="mt-4 text-center text-gray-700">{txStatus}</p>}
      </div>
    </WalletGuard>
  );
}
