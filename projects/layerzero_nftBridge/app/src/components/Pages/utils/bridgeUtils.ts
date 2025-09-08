import { WalletClient, PublicClient, Address, encodePacked } from 'viem';
import { encodeFunctionData, toHex } from 'viem';
import {
  CONFLUX_ORIGIN_ADDRESS,
  BASE_WRAPPED_ADDRESS,
  IMAGE_MINT_NFT_ADDRESS,
  LAYERZERO_ENDPOINT,
  CONFLUX_EID,
  BASE_EID,
  CONFLUX_CHAIN_ID
} from './constants';
import { ESPACE_BRIDGE_ABI, BASE_WRAPPED_ABI, IMAGE_MINT_NFT_ABI, LAYERZERO_ENDPOINT_ABI } from './abis';

export const approveNFT = async (
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  tokenId: string,
  setTxStatus: (status: string) => void,
  setIsApproved: (approved: boolean) => void,
  setIsApproving: (approving: boolean) => void
) => {
  if (!walletClient || !publicClient || !tokenId) {
    setTxStatus('Missing wallet or token ID');
    return;
  }
  setIsApproving(true);
  try {
    const hash = await walletClient.writeContract({
      address: IMAGE_MINT_NFT_ADDRESS,
      abi: IMAGE_MINT_NFT_ABI,
      functionName: 'approve',
      args: [CONFLUX_ORIGIN_ADDRESS, BigInt(tokenId)],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setIsApproved(true);
    setTxStatus('NFT approved for bridging');
  } catch (err) {
    console.error('Approval error:', err);
    setTxStatus('Failed to approve NFT');
  } finally {
    setIsApproving(false);
  }
};

export const bridgeToBase = async (
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  tokenId: string,
  recipient: string,
  isApproved: boolean,
  setTxStatus: (status: string) => void,
  setIsApproved: (approved: boolean) => void,
  setTokenId: (tokenId: string) => void,
  setIsBridging: (bridging: boolean) => void
) => {
  if (!walletClient || !publicClient || !recipient || !tokenId) {
    setTxStatus('Missing wallet, recipient, or token ID');
    return;
  }
  if (!isApproved) {
    setTxStatus('Please approve NFT first');
    return;
  }
  setIsBridging(true);
  try {
    // Verify peer
    const peer = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'peers',
      args: [BASE_EID],
    }) as `0x${string}`;
    const expectedPeer = encodePacked(['address'], [BASE_WRAPPED_ADDRESS]).padStart(66, '0') as `0x${string}`;
    if (peer.toLowerCase() !== expectedPeer.toLowerCase()) {
      setTxStatus(
        `Peer not set. Call setPeer on EspaceBridge (0x${CONFLUX_ORIGIN_ADDRESS.slice(2)}) with dstEid=30184 and peer=0x${expectedPeer.slice(2)}.`
      );
      return;
    }
    // V2 options for lzReceive: type 1, gas 1,000,000, value 0
    const adapterParams = encodePacked(
      ['uint8', 'uint16', 'uint128', 'uint128'],
      [1, 32, 1000000n, 0n]
    );
    console.log('adapterParams:', adapterParams);
    // Estimate fee using contract's quote function
    const fee = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'quoteBridgeOut',
      args: [BASE_EID, BigInt(tokenId), recipient as Address, adapterParams],
    }) as { nativeFee: bigint; lzTokenFee: bigint };
    console.log('Estimated native fee:', fee.nativeFee);
    // Bridge
    const hash = await walletClient.writeContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeOut',
      args: [BASE_EID, BigInt(tokenId), recipient as Address, adapterParams],
      value: fee.nativeFee,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setTxStatus(`NFT ${tokenId} bridged to Base!`);
    setIsApproved(false);
    setTokenId('');
  } catch (err: any) {
    console.error('Bridge to Base error:', err);
    setTxStatus(`Failed to bridge to Base: ${err?.message || err}`);
  } finally {
    setIsBridging(false);
  }
};

export const bridgeBackToConflux = async (
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  tokenId: string,
  recipient: string,
  address: Address | undefined,
  setTxStatus: (status: string) => void,
  setTokenId: (tokenId: string) => void,
  setIsBridging: (bridging: boolean) => void
) => {
  if (!walletClient || !publicClient || !recipient || !tokenId || !address) {
    setTxStatus('Missing wallet, recipient, or token ID');
    return;
  }
  setIsBridging(true);
  try {
    const owner = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });
    if (owner.toLowerCase() !== address.toLowerCase()) {
      setTxStatus('You do not own this wrapped token');
      return;
    }
    // Verify peer
    const peer = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'peers',
      args: [CONFLUX_EID],
    }) as `0x${string}`;
    const expectedPeer = encodePacked(['address'], [CONFLUX_ORIGIN_ADDRESS]).padStart(66, '0') as `0x${string}`;
    if (peer.toLowerCase() !== expectedPeer.toLowerCase()) {
      setTxStatus(
        `Peer not set. Call setPeer on BaseWrappedBridge (0x${BASE_WRAPPED_ADDRESS.slice(2)}) with dstEid=30212 and peer=0x${expectedPeer.slice(2)}.`
      );
      return;
    }
    // V2 options
    const adapterParams = encodePacked(
      ['uint8', 'uint16', 'uint128', 'uint128'],
      [1, 32, 1000000n, 0n]
    );
    console.log('adapterParams:', adapterParams);
    // Estimate fee using contract's quote function
    const fee = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'quoteBridgeBack',
      args: [CONFLUX_EID, BigInt(tokenId), recipient as Address, adapterParams],
    }) as { nativeFee: bigint; lzTokenFee: bigint };
    console.log('Estimated native fee:', fee.nativeFee);
    // Bridge back
    const hash = await walletClient.writeContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeBack',
      args: [CONFLUX_EID, BigInt(tokenId), recipient as Address, adapterParams],
      value: fee.nativeFee,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setTxStatus(`Wrapped NFT ${tokenId} bridged back to Conflux!`);
    setTokenId('');
  } catch (err: any) {
    console.error('Bridge back to Conflux error:', err);
    setTxStatus(`Failed to bridge back: ${err?.message || err}`);
  } finally {
    setIsBridging(false);
  }
};