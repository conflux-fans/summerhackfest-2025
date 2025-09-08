import { ReactNode } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

interface WalletGuardProps {
  children: ReactNode;
}

export function WalletGuard({ children }: WalletGuardProps) {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-gray-700 text-lg">Please connect your wallet first</p>
        <button
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          onClick={() => open()}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
