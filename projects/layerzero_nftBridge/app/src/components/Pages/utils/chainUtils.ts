import { SwitchChainMutate } from 'wagmi';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID } from './constants';

export const switchToConflux = async (
  switchChainAsync: SwitchChainMutate['switchChainAsync'],
  setTxStatus: (status: string) => void,
  setTokenId: (tokenId: string) => void,
  setIsApproved: (approved: boolean) => void
) => {
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

export const switchToBase = async (
  switchChainAsync: SwitchChainMutate['switchChainAsync'],
  setTxStatus: (status: string) => void,
  setTokenId: (tokenId: string) => void,
  setIsApproved: (approved: boolean) => void
) => {
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