import { useAccount } from 'wagmi';

function ConnectWallet() {
  const { address, isConnected } = useAccount();

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-4xl w-full">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">Wallet Details</h2>
      <p className="mb-4">Manage your wallet connection here. Use the header button to connect if not already.</p>
      {isConnected ? (
        <p className="mt-4">Connected Wallet: {address} (Ready for Meson swaps via https://meson.dev/api/)</p>
      ) : (
        <p className="mt-4 text-red-500">Not connected. Click the button in the header.</p>
      )}
    </div>
  );
}

export default ConnectWallet;