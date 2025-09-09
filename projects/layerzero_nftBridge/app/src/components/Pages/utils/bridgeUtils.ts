// bridgeUtils.ts
import { WalletClient, PublicClient, Address, toHex, pad } from 'viem';
import { encodeFunctionData } from 'viem'; // Not used, but kept if needed
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
// --- Helpers ---
const isHex = (s: string) => /^0x[0-9a-fA-F]*$/.test(s);
/**
 * Build LayerZero V2 options: '0x0001' + 16-byte gas + 16-byte value
 */
const buildOptions = (gas: bigint, value: bigint): `0x${string}` => {
  const typeHex = toHex(1n, { size: 2 }).slice(2); // '0001'
  const sizeHex = toHex(32n, { size: 2 }).slice(2); // '0020' (data size in bytes)
  const gasHex = toHex(gas, { size: 16 }).slice(2);
  const valueHex = toHex(value, { size: 16 }).slice(2);
  const hex = `0x${typeHex}${sizeHex}${gasHex}${valueHex}`;
  if (!isHex(hex)) {
    throw new Error(`Invalid options hex generated: ${hex}`);
  }
  // Expected length: (2 + 2 + 16 + 16) bytes = 72 hex chars (excluding '0x')
  if ((hex.length - 2) !== 72) {
    console.warn('Warning: options length unexpected', { hexLength: hex.length - 2 });
  }
  return hex as `0x${string}`;
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
    // Sanity check: token exists on origin contract => call ownerOf or tokenURI
    let tokenUri = '';
    try {
      tokenUri = await publicClient.readContract({
        address: IMAGE_MINT_NFT_ADDRESS,
        abi: IMAGE_MINT_NFT_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      });
      // tokenURI may be empty string if not present
    } catch (e) {
      // tokenURI might revert for non-existent token; try ownerOf to confirm
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
        setTxStatus('Token does not exist or tokenURI/ownerOf reverted. Check tokenId.');
        return;
      }
    }
    // Build options safely and log
    const gas = BigInt(300000); // Increased from 200000 to avoid zero fee if gas was too low
    const value = BigInt(0);
    const options = buildOptions(gas, value);
    console.log('options (bridgeToBase):', options);
    // Attempt to quote. Quote may revert for several reasons:
    // - Endpoint/DVN/executor not configured for dstEid
    // - bad dstEid value
    // - options length/format unexpected
    // - endpoint internal checks (payload too large)
    let fee: { nativeFee: bigint; lzTokenFee: bigint } | null = null;
    try {
      fee = await publicClient.readContract({
        address: CONFLUX_ORIGIN_ADDRESS,
        abi: ESPACE_BRIDGE_ABI,
        functionName: 'quoteBridgeOut',
        args: [BASE_EID, BigInt(tokenId), recipient as Address, options],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
    } catch (quoteErr: any) {
      const reason = extractRevertReason(quoteErr) || 'unknown';
      console.error('quoteBridgeOut reverted:', quoteErr);
      // Provide actionable messages for common causes
      const lowerReason = String(reason).toLowerCase();
      if (lowerReason.includes('sender not peer') || lowerReason.includes('peer')) {
        setTxStatus('quoteBridgeOut reverted: peer mismatch. Ensure peers mapping on both bridges is set.');
      } else if (lowerReason.includes('invalid') || lowerReason.includes('options')) {
        setTxStatus(`quoteBridgeOut reverted: options may be invalid. Options: ${options}`);
      } else if (lowerReason.includes('dv') || lowerReason.includes('dvn') || lowerReason.includes('executor')) {
        setTxStatus('quoteBridgeOut reverted: LayerZero endpoint DVN/executor may not be configured. Use app.layerzero.network to configure OApp endpoints.');
      } else if (lowerReason.includes('dst') || lowerReason.includes('eid') || lowerReason.includes('dsteid')) {
        setTxStatus(`quoteBridgeOut reverted: check destination EID (${BASE_EID}) is correct and configured on endpoint.`);
      } else if (lowerReason.includes('no dvn configured')) {
        setTxStatus('quoteBridgeOut reverted: No DVN configured for this lane. Set DVNs on app.layerzero.network.');
      } else {
        // Generic, give the raw reason for debugging
        setTxStatus(`quoteBridgeOut reverted: ${reason}`);
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
      functionName: 'bridgeOut',
      args: [BASE_EID, BigInt(tokenId), recipient as Address, options],
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
        functionName: 'quoteBridgeBack',
        args: [CONFLUX_EID, BigInt(tokenId), recipient as Address, options],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
    } catch (quoteErr: any) {
      const reason = extractRevertReason(quoteErr) || 'unknown';
      console.error('quoteBridgeBack reverted:', quoteErr);
      if (String(reason).toLowerCase().includes('peer')) {
        setTxStatus('quoteBridgeBack reverted: peer mismatch. Ensure peers mapping on both bridges is set.');
      } else if (String(reason).toLowerCase().includes('no dvn configured')) {
        setTxStatus('quoteBridgeBack reverted: No DVN configured for this lane. Set DVNs on app.layerzero.network.');
      } else {
        setTxStatus(`quoteBridgeBack reverted: ${reason}`);
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
      functionName: 'bridgeBack',
      args: [CONFLUX_EID, BigInt(tokenId), recipient as Address, options],
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