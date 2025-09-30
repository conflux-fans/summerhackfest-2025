import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import * as Avatars from '@dicebear/avatars';
import * as IdenticonSprites from '@dicebear/avatars-identicon-sprites';

export function WalletConnectButton() {
  const { open } = useAppKit(); // Hook to open the modal
  const { address, isConnected } = useAppKitAccount(); // Hook for account info

  const buttonText = isConnected && address
    ? `${address.slice(0, 4)}...${address.slice(-6)}`
    : 'Connect Wallet';

  // Generate avatar SVG if connected
  const avatarSvg = isConnected && address
    ? new Avatars.default(IdenticonSprites.default).create(address)
    : '';

  return (
    <div className="inline-block">
      <button
        className="bg-indigo-600 text-white px-4 py-3 rounded-xl cursor-pointer hover:bg-indigo-700 transition font-medium flex items-center gap-2"
        onClick={() => open()}
      >
        {isConnected && (
          <span
            className="w-6 h-6 rounded-full overflow-hidden"
            dangerouslySetInnerHTML={{ __html: avatarSvg }}
          />
        )}
        {buttonText}
      </button>
    </div>
  );
}
