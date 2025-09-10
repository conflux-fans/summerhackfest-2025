// bridgeUtils.ts
import { WalletClient, PublicClient, Address, toHex, pad } from 'viem';
import {
  CONFLUX_ORIGIN_ADDRESS,
  BASE_WRAPPED_ADDRESS,
  IMAGE_MINT_NFT_ADDRESS,
  CONFLUX_EID,
  BASE_EID,
  CONFLUX_CHAIN_ID
} from './constants';
import { ESPACE_BRIDGE_ABI, BASE_WRAPPED_ABI, IMAGE_MINT_NFT_ABI } from './abis';
// --- Helpers ---
const isHex = (s: string) => /^0x[0-9a-fA-F]*$/.test(s);
/**
 * Build LayerZero V2 executor options for lzReceive: type 3 + size + uint128 gas + uint128 value
 */
const buildOptions = (gas: bigint): `0x${string}` => {
  const optionType = '0003'; // 2 bytes
  const workerId = '01';     // 1 byte (Executor)
  const optionSize = '0011'; // 2 bytes (17 bytes: 1 for option type + 16 for gas)
  const lzReceiveType = '01';// 1 byte (lzReceive)
  const gasHex = gas.toString(16).padStart(32, '0'); // 16 bytes
  return `0x${optionType}${workerId}${optionSize}${lzReceiveType}${gasHex}`;
};
/**
 * Pretty helper to extract revert reason from viem error if present
 */
const extractRevertReason = (err: any): string | null => {
  try {
    if (!err) return null;
    // viem often embeds the RPC error string in message
    if (typeof err === 'string') return err;
    if (err?.shortMessage) return err.shortMessage;
    if (err?.cause?.message) return err.cause.message;
    if (err?.message) return err.message;
    return JSON.stringify(err);
  } catch {
    return null;
  }
};
// ---------------- registerCollection ----------------
export const registerCollection = async (
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  setTxStatus: (status: string) => void,
  setIsSupported: (supported: boolean) => void,
  setIsWhitelisting: (whitelisting: boolean) => void
) => {
  if (!walletClient || !publicClient) {
    setTxStatus('Missing wallet');
    return;
  }
  setIsWhitelisting(true);
  try {
    const hash = await walletClient.writeContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'registerToken',
      args: [IMAGE_MINT_NFT_ADDRESS],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setIsSupported(true);
    setTxStatus('Collection whitelisted successfully');
  } catch (err) {
    console.error('Whitelist error:', err);
    setTxStatus('Failed to whitelist collection');
  } finally {
    setIsWhitelisting(false);
  }
};
// ---------------- approveNFT ----------------
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
// ---------------- bridgeToBase ----------------
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
    // Verify peer mapping on the contract (that peers[BASE_EID] is set)
    const peer = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'peers',
      args: [BASE_EID],
    }) as `0x${string}`;
    const expectedPeer = pad(BASE_WRAPPED_ADDRESS, { dir: 'left', size: 32 }) as `0x${string}`;
    if (!peer || peer === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      setTxStatus(`Peer not set on EspaceBridge for dstEid=${BASE_EID}.`);
      return;
    }
    if (peer.toLowerCase() !== expectedPeer.toLowerCase()) {
      setTxStatus(
        `Peer mismatch. Contract peers[${BASE_EID}] = ${peer}. Expected ${expectedPeer}. Call setPeer on EspaceBridge.`
      );
      return;
    }
    // Sanity check: token exists on origin contract => call ownerOf
    try {
      const owner = await publicClient.readContract({
        address: IMAGE_MINT_NFT_ADDRESS,
        abi: IMAGE_MINT_NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        setTxStatus('Token owner is zero address or token does not exist.');
        return;
      }
    } catch (ownerErr) {
      console.warn('ownerOf failed', ownerErr);
      setTxStatus('Token does not exist or ownerOf reverted. Check tokenId.');
      return;
    }
    // Build options safely and log
    const gas = BigInt(300000); // Increased from 200000 to avoid zero fee if gas was too low
    const value = BigInt(0);
    const options = buildOptions(gas, value);
    console.log('options (bridgeToBase):', options);
    // Attempt to quote.
    let fee: { nativeFee: bigint; lzTokenFee: bigint } | null = null;
    try {
      fee = await publicClient.readContract({
        address: CONFLUX_ORIGIN_ADDRESS,
        abi: ESPACE_BRIDGE_ABI,
        functionName: 'quoteBridgeSend',
        args: [IMAGE_MINT_NFT_ADDRESS, BASE_EID, recipient as Address, [BigInt(tokenId)], options, false],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
    } catch (quoteErr: any) {
      const reason = extractRevertReason(quoteErr) || 'unknown';
      console.error('quoteBridgeSend reverted:', quoteErr);
      // Provide actionable messages for common causes
      const lowerReason = String(reason).toLowerCase();
      if (lowerReason.includes('sender not peer') || lowerReason.includes('peer')) {
        setTxStatus('quoteBridgeSend reverted: peer mismatch. Ensure peers mapping on both bridges is set.');
      } else if (lowerReason.includes('invalid') || lowerReason.includes('options')) {
        setTxStatus(`quoteBridgeSend reverted: options may be invalid. Options: ${options}`);
      } else if (lowerReason.includes('dv') || lowerReason.includes('dvn') || lowerReason.includes('executor')) {
        setTxStatus('quoteBridgeSend reverted: LayerZero endpoint DVN/executor may not be configured. Use app.layerzero.network to configure OApp endpoints.');
      } else if (lowerReason.includes('dst') || lowerReason.includes('eid') || lowerReason.includes('dsteid')) {
        setTxStatus(`quoteBridgeSend reverted: check destination EID (${BASE_EID}) is correct and configured on endpoint.`);
      } else if (lowerReason.includes('no dvn configured')) {
        setTxStatus('quoteBridgeSend reverted: No DVN configured for this lane. Set DVNs on app.layerzero.network.');
      } else {
        // Generic, give the raw reason for debugging
        setTxStatus(`quoteBridgeSend reverted: ${reason}`);
      }
      return;
    }
    if (!fee) {
      setTxStatus('Failed to get fee quote (unknown).');
      return;
    }
    console.log('Estimated native fee:', fee.nativeFee);
    if (fee.nativeFee === 0n) {
      setTxStatus('Zero fee estimated – check endpoint config, increase gas parameter, or ensure DVNs/executors are set.');
      return;
    }
    // Bridge: submit transaction
    const hash = await walletClient.writeContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeSend',
      args: [IMAGE_MINT_NFT_ADDRESS, BASE_EID, recipient as Address, [BigInt(tokenId)], options, fee, recipient as Address],
      value: fee.nativeFee,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setTxStatus(`NFT ${tokenId} bridged to Base!`);
    setIsApproved(false);
    setTokenId('');
  } catch (err: any) {
    console.error('Bridge to Base error:', err);
    const reason = extractRevertReason(err);
    setTxStatus(`Failed to bridge to Base: ${reason || err?.message || String(err)}`);
  } finally {
    setIsBridging(false);
  }
};
// ---------------- bridgeBackToConflux ----------------
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
    // Verify peer on wrapped bridge
    const peer = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'peers',
      args: [CONFLUX_EID],
    }) as `0x${string}`;
    const expectedPeer = pad(CONFLUX_ORIGIN_ADDRESS, { dir: 'left', size: 32 }) as `0x${string}`;
    if (peer.toLowerCase() !== expectedPeer.toLowerCase()) {
      setTxStatus(
        `Peer not set. Call setPeer on BaseWrappedBridge (0x${BASE_WRAPPED_ADDRESS.slice(2)}) with dstEid=${CONFLUX_EID} and peer=${expectedPeer}.`
      );
      return;
    }
    // Build options safely
    const gas = BigInt(300000); // Increased from 200000 to avoid zero fee if gas was too low
    const value = BigInt(0);
    const options = buildOptions(gas, value);
    console.log('options (bridgeBackToConflux):', options);
    // Estimate fee using contract's quote function
    let fee: { nativeFee: bigint; lzTokenFee: bigint } | null = null;
    try {
      fee = await publicClient.readContract({
        address: BASE_WRAPPED_ADDRESS,
        abi: BASE_WRAPPED_ABI,
        functionName: 'quoteBridgeSend',
        args: [CONFLUX_EID, recipient as Address, [BigInt(tokenId)], options, false],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
    } catch (quoteErr: any) {
      const reason = extractRevertReason(quoteErr) || 'unknown';
      console.error('quoteBridgeSend reverted:', quoteErr);
      if (String(reason).toLowerCase().includes('peer')) {
        setTxStatus('quoteBridgeSend reverted: peer mismatch. Ensure peers mapping on both bridges is set.');
      } else if (String(reason).toLowerCase().includes('no dvn configured')) {
        setTxStatus('quoteBridgeSend reverted: No DVN configured for this lane. Set DVNs on app.layerzero.network.');
      } else {
        setTxStatus(`quoteBridgeSend reverted: ${reason}`);
      }
      return;
    }
    if (!fee) {
      setTxStatus('Failed to get fee quote for bridge back (unknown).');
      return;
    }
    console.log('Estimated native fee:', fee.nativeFee);
    if (fee.nativeFee === 0n) {
      setTxStatus('Zero fee estimated – check endpoint config or increase gas parameter.');
      return;
    }
    // Bridge back
    const hash = await walletClient.writeContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeSend',
      args: [CONFLUX_EID, recipient as Address, [BigInt(tokenId)], options, fee, recipient as Address],
      value: fee.nativeFee,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setTxStatus(`Wrapped NFT ${tokenId} bridged back to Conflux!`);
    setTokenId('');
  } catch (err: any) {
    console.error('Bridge back to Conflux error:', err);
    const reason = extractRevertReason(err);
    setTxStatus(`Failed to bridge back: ${reason || err?.message || String(err)}`);
  } finally {
    setIsBridging(false);
  }
};