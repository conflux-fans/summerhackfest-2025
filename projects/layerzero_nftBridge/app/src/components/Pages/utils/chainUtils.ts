import { SwitchChainMutate } from 'wagmi';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID, /* ETH_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID, */ ARBITRUM_CHAIN_ID } from './constants';
export const switchToChain = async (
switchChainAsync: SwitchChainMutate['switchChainAsync'],
targetChainId: number,
setTxStatus: (status: string) => void,
setTokenId: (tokenId: string) => void,
setIsApproved: (approved: boolean) => void
) => {
try {
await switchChainAsync({ chainId: targetChainId });
const chainName = getChainName(targetChainId);
setTxStatus(`Switched to ${chainName}`);
setTokenId('');
setIsApproved(false);
  } catch (err) {
console.error(`Failed to switch to chain ${targetChainId}:`, err);
setTxStatus(`Failed to switch to chain ${targetChainId}`);
  }
};
const getChainName = (id: number): string => {
switch (id) {
case CONFLUX_CHAIN_ID:
return 'Conflux eSpace';
case BASE_CHAIN_ID:
return 'Base';
// case ETH_SEPOLIA_CHAIN_ID:
// return 'Ethereum Sepolia';
// case BASE_SEPOLIA_CHAIN_ID:
// return 'Base Sepolia';
case ARBITRUM_CHAIN_ID:
return 'Arbitrum';
default:
return 'Unknown Chain';
  }
};