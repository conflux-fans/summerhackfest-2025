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
    // Verify trusted remote
    const trustedRemote = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: [
        {
          inputs: [{ name: "_dstChainId", type: "uint16" }],
          name: "trustedRemoteLookup",
          outputs: [{ name: "", type: "bytes" }],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: 'trustedRemoteLookup',
      args: [BASE_EID],
    }) as string;
    const expectedRemote = encodePacked(['address', 'address'], [BASE_WRAPPED_ADDRESS, CONFLUX_ORIGIN_ADDRESS]);
    if (trustedRemote.toLowerCase() !== expectedRemote.toLowerCase()) {
      setTxStatus(
        `Trusted remote not set. Call setTrustedRemote on EspaceBridge (0x${CONFLUX_ORIGIN_ADDRESS.slice(2)}) with dstChainId=30184 and path=0x${expectedRemote.slice(2)}.`
      );
      return;
    }

    const dstContractBytes = toHex(BASE_WRAPPED_ADDRESS);
    // Correctly encode adapterParams (version 2, 1,000,000 gas)
    const adapterParams = encodePacked(
      ['uint16', 'uint256'],
      [2, 1000000]
    );
    console.log('adapterParams:', adapterParams); // Debug: Should be 0x000200000000000000000000000f4240
    const payload = encodeFunctionData({
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeOut',
      args: [BASE_EID, dstContractBytes, BigInt(tokenId), recipient, adapterParams],
    });
    console.log('payload:', payload); // Debug
    const { nativeFee } = await publicClient.readContract({
      address: LAYERZERO_ENDPOINT,
      abi: LAYERZERO_ENDPOINT_ABI,
      functionName: 'estimateFees',
      args: [BASE_EID, BASE_WRAPPED_ADDRESS, payload, false, adapterParams],
    });
    console.log('Estimated native fee:', nativeFee); // Debug
    const hash = await walletClient.writeContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeOut',
      args: [BASE_EID, dstContractBytes, BigInt(tokenId), recipient, adapterParams],
      value: nativeFee,
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
    const trustedRemote = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: [
        {
          inputs: [{ name: "_dstChainId", type: "uint16" }],
          name: "trustedRemoteLookup",
          outputs: [{ name: "", type: "bytes" }],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: 'trustedRemoteLookup',
      args: [CONFLUX_EID],
    }) as string;
    const expectedRemote = encodePacked(['address', 'address'], [CONFLUX_ORIGIN_ADDRESS, BASE_WRAPPED_ADDRESS]);
    if (trustedRemote.toLowerCase() !== expectedRemote.toLowerCase()) {
      setTxStatus(
        `Trusted remote not set. Call setTrustedRemote on BaseWrappedBridge (0x${BASE_WRAPPED_ADDRESS.slice(2)}) with dstChainId=30212 and path=0x${expectedRemote.slice(2)}.`
      );
      return;
    }

    const dstContractBytes = toHex(CONFLUX_ORIGIN_ADDRESS);
    const adapterParams = encodePacked(
      ['uint16', 'uint256'],
      [2, 1000000]
    );
    console.log('adapterParams:', adapterParams); // Debug
    const payload = encodeFunctionData({
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeBack',
      args: [CONFLUX_EID, dstContractBytes, BigInt(tokenId), adapterParams],
    });
    console.log('payload:', payload); // Debug
    const { nativeFee } = await publicClient.readContract({
      address: LAYERZERO_ENDPOINT,
      abi: LAYERZERO_ENDPOINT_ABI,
      functionName: 'estimateFees',
      args: [CONFLUX_EID, BASE_WRAPPED_ADDRESS, payload, false, adapterParams],
    });
    console.log('Estimated native fee:', nativeFee); // Debug
    const hash = await walletClient.writeContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeBack',
      args: [CONFLUX_EID, dstContractBytes, BigInt(tokenId), adapterParams],
      value: nativeFee,
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