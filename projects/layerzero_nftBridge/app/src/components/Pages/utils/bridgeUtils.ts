import { WalletClient, PublicClient, Address, toHex, pad } from 'viem';
import { CONFLUX_ORIGIN_ADDRESS, BASE_WRAPPED_ADDRESS, CONFLUX_EID, BASE_EID, CONFLUX_CHAIN_ID } from './constants';
import { ESPACE_BRIDGE_ABI, BASE_WRAPPED_ABI, ERC721_ABI } from './abis';

// --- Helpers ---
const isHex = (s: string) => /^0x[0-9a-fA-F]{40}$/.test(s);

/**
 * Build LayerZero V2 executor options for lzReceive: type 3 + size + uint128 gas + uint128 value
 */
const buildOptions = (gas: bigint): `0x${string}` => {
  const optionType = '0003'; // 2 bytes
  const workerId = '01'; // 1 byte (Executor)
  const optionSize = '0021'; // 2 bytes (33 bytes: 1 for option type + 16 for gas + 16 for value)
  const lzReceiveType = '01'; // 1 byte (lzReceive)
  const gasHex = gas.toString(16).padStart(32, '0'); // 16 bytes
  const value = 0n;
  const valueHex = value.toString(16).padStart(32, '0'); // 16 bytes
  return `0x${optionType}${workerId}${optionSize}${lzReceiveType}${gasHex}${valueHex}`;
};

/**
 * Pretty helper to extract revert reason from viem error if present
 */
const extractRevertReason = (err: any, abi?: readonly unknown[]): string | null => {
  try {
    if (!err) return null;
    if (typeof err === 'string') return err;
    if (err.shortMessage) return err.shortMessage;
    if (err.cause) {
      if (err.cause.reason) return err.cause.reason;
      if (err.cause.message) return err.cause.message;
      if (err.cause.data && abi) {
        const decoded = decodeErrorResult({
          abi,
          data: err.cause.data,
        });
        return decoded.errorName + (decoded.args ? `(${decoded.args.map(String).join(', ')})` : '');
      }
    }
    if (err.message) return err.message;
    return JSON.stringify(err);
  } catch (decodeErr) {
    console.warn('Failed to decode error:', decodeErr);
    return null;
  }
};

// Helper to estimate gas with buffer
const estimateGasWithBuffer = async (
  publicClient: PublicClient,
  params: {
    address: Address;
    abi: any;
    functionName: string;
    args: any[];
    account: Address;
    value?: bigint;
  },
  bufferPercent: number = 20,
  defaultGas: bigint = 200000n
): Promise<bigint> => {
  try {
    const estimatedGas = await publicClient.estimateContract(params);
    return estimatedGas + (estimatedGas * BigInt(bufferPercent) / 100n);
  } catch (err) {
    console.warn('Gas estimation failed, using default:', err);
    return defaultGas;
  }
};

// ---------------- registerCollection ----------------
export const registerCollection = async (
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  tokenContractAddress: string,
  setTxStatus: (status: string) => void,
  setIsSupported: (supported: boolean) => void,
  setIsWhitelisting: (whitelisting: boolean) => void
) => {
  if (!walletClient || !publicClient) {
    setTxStatus('Missing wallet');
    return;
  }
  if (!isHex(tokenContractAddress)) {
    setTxStatus('Invalid token contract address');
    return;
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return;
  }
  setIsWhitelisting(true);
  try {
    // Verify contract is ERC-721
    const isERC721 = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'isERC721',
      args: [tokenContractAddress as Address],
    });
    if (!isERC721) {
      setTxStatus('Contract is not a valid ERC-721 token');
      return;
    }

    const gas = await estimateGasWithBuffer(publicClient, {
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'registerToken',
      args: [tokenContractAddress as Address],
      account: walletClient.account.address,
    });

    const hash = await walletClient.writeContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'registerToken',
      args: [tokenContractAddress as Address],
      gas,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setIsSupported(true);
    setTxStatus('Collection whitelisted successfully');
  } catch (err) {
    console.error('Whitelist error:', err);
    setTxStatus('Failed to whitelist collection: ' + (extractRevertReason(err, ESPACE_BRIDGE_ABI) || 'Unknown error'));
  } finally {
    setIsWhitelisting(false);
  }
};

// ---------------- approveNFT ----------------
export const approveNFT = async (
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  tokenId: string,
  tokenContractAddress: string,
  setTxStatus: (status: string) => void,
  setIsApproved: (approved: boolean) => void,
  setIsApproving: (approving: boolean) => void
) => {
  if (!walletClient || !publicClient || !tokenId || !tokenContractAddress) {
    setTxStatus('Missing wallet, token ID, or contract address');
    return;
  }
  if (!isHex(tokenContractAddress)) {
    setTxStatus('Invalid token contract address');
    return;
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return;
  }
  setIsApproving(true);
  try {
    // Verify token ownership
    const owner = await publicClient.readContract({
      address: tokenContractAddress as Address,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });
    if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
      setTxStatus('You do not own this token');
      return;
    }
    // Check if contract is ERC-721
    const isERC721 = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'isERC721',
      args: [tokenContractAddress as Address],
    });
    if (!isERC721) {
      setTxStatus('Contract is not a valid ERC-721 token');
      return;
    }

    const gas = await estimateGasWithBuffer(publicClient, {
      address: tokenContractAddress as Address,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [CONFLUX_ORIGIN_ADDRESS, BigInt(tokenId)],
      account: walletClient.account.address,
    });

    const hash = await walletClient.writeContract({
      address: tokenContractAddress as Address,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [CONFLUX_ORIGIN_ADDRESS, BigInt(tokenId)],
      gas,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setIsApproved(true);
    setTxStatus('NFT approved for bridging');
  } catch (err) {
    console.error('Approval error:', err);
    setTxStatus('Failed to approve NFT: ' + (extractRevertReason(err, ERC721_ABI) || 'Unknown error'));
  } finally {
    setIsApproving(false);
  }
};

// ---------------- approveWrappedNFT ----------------
export const approveWrappedNFT = async (
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
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return;
  }
  setIsApproving(true);
  try {
    // Verify ownership
    const owner = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });
    if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
      setTxStatus('You do not own this wrapped token');
      return;
    }
    // Verify wrapped token exists
    const originalToken = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'wrappedToOriginalToken',
      args: [BigInt(tokenId)],
    });
    if (originalToken === '0x0000000000000000000000000000000000000000') {
      setTxStatus('Invalid wrapped token ID');
      return;
    }

    const gas = await estimateGasWithBuffer(publicClient, {
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'approve',
      args: [BASE_WRAPPED_ADDRESS, BigInt(tokenId)],
      account: walletClient.account.address,
    });

    const hash = await walletClient.writeContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'approve',
      args: [BASE_WRAPPED_ADDRESS, BigInt(tokenId)],
      gas,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setIsApproved(true);
    setTxStatus('Wrapped NFT approved for bridging back');
  } catch (err) {
    console.error('Wrapped approval error:', err);
    setTxStatus('Failed to approve wrapped NFT: ' + (extractRevertReason(err, BASE_WRAPPED_ABI) || 'Unknown error'));
  } finally {
    setIsApproving(false);
  }
};

// ---------------- bridgeToBase ----------------
export const bridgeToBase = async (
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  tokenId: string,
  tokenContractAddress: string,
  recipient: string,
  isApproved: boolean,
  setTxStatus: (status: string) => void,
  setIsApproved: (approved: boolean) => void,
  setTokenId: (tokenId: string) => void,
  setIsBridging: (bridging: boolean) => void
) => {
  if (!walletClient || !publicClient || !recipient || !tokenId || !tokenContractAddress) {
    setTxStatus('Missing wallet, recipient, token ID, or contract address');
    return;
  }
  if (!isHex(tokenContractAddress)) {
    setTxStatus('Invalid token contract address');
    return;
  }
  if (!isApproved) {
    setTxStatus('Please approve NFT first');
    return;
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return;
  }
  setIsBridging(true);
  try {
    // Verify peer mapping on the contract
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
    // Verify token exists and is owned by user
    try {
      const owner = await publicClient.readContract({
        address: tokenContractAddress as Address,
        abi: ERC721_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        setTxStatus('Token owner is zero address or token does not exist.');
        return;
      }
      if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
        setTxStatus('You do not own this token');
        return;
      }
    } catch (ownerErr) {
      console.warn('ownerOf failed', ownerErr);
      setTxStatus('Token does not exist or ownerOf reverted. Check tokenId.');
      return;
    }
    // Check if contract is ERC-721 and registered
    const isERC721 = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'isERC721',
      args: [tokenContractAddress as Address],
    });
    if (!isERC721) {
      setTxStatus('Contract is not a valid ERC-721 token');
      return;
    }
    const isSupported = await publicClient.readContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'supportedTokens',
      args: [tokenContractAddress as Address],
    });
    if (!isSupported) {
      setTxStatus('Token contract not registered. Please whitelist the collection.');
      return;
    }
    // Build options
    const gas = BigInt(300000);
    const options = buildOptions(gas);
    console.log('options (bridgeToBase):', options);
    // Estimate fee
    let fee: { nativeFee: bigint; lzTokenFee: bigint } | null = null;
    try {
      fee = await publicClient.readContract({
        address: CONFLUX_ORIGIN_ADDRESS,
        abi: ESPACE_BRIDGE_ABI,
        functionName: 'quoteBridgeSend',
        args: [tokenContractAddress as Address, BASE_EID, recipient as Address, [BigInt(tokenId)], options, false],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
    } catch (quoteErr: any) {
      const reason = extractRevertReason(quoteErr, ESPACE_BRIDGE_ABI) || 'unknown';
      console.error('quoteBridgeSend reverted:', quoteErr);
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

    const txGas = await estimateGasWithBuffer(publicClient, {
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeSend',
      args: [tokenContractAddress as Address, BASE_EID, recipient as Address, [BigInt(tokenId)], options, fee, recipient as Address],
      account: walletClient.account.address,
      value: fee.nativeFee,
    }, 20, 500000n); // Higher default for bridging

    // Bridge
    const hash = await walletClient.writeContract({
      address: CONFLUX_ORIGIN_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeSend',
      args: [tokenContractAddress as Address, BASE_EID, recipient as Address, [BigInt(tokenId)], options, fee, recipient as Address],
      value: fee.nativeFee,
      gas: txGas,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setTxStatus(`NFT ${tokenId} bridged to Base!`);
    setIsApproved(false);
    setTokenId('');
  } catch (err: any) {
    console.error('Bridge to Base error:', err);
    const reason = extractRevertReason(err, ESPACE_BRIDGE_ABI);
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
  isApproved: boolean,
  setTxStatus: (status: string) => void,
  setTokenId: (tokenId: string) => void,
  setIsBridging: (bridging: boolean) => void
) => {
  if (!walletClient || !publicClient || !recipient || !tokenId || !address) {
    setTxStatus('Missing wallet, recipient, or token ID');
    return;
  }
  if (!isApproved) {
    setTxStatus('Please approve wrapped NFT first');
    return;
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return;
  }
  setIsBridging(true);
  try {
    // Verify ownership
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
    // Verify wrapped token exists
    const originalToken = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'wrappedToOriginalToken',
      args: [BigInt(tokenId)],
    });
    if (originalToken === '0x0000000000000000000000000000000000000000') {
      setTxStatus('Invalid wrapped token ID');
      return;
    }
    // Verify approval
    const approved = await publicClient.readContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'getApproved',
      args: [BigInt(tokenId)],
    });
    if (approved.toLowerCase() !== BASE_WRAPPED_ADDRESS.toLowerCase()) {
      setTxStatus('Wrapped NFT not approved for bridging. Please approve again.');
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
    // Build options
    const gas = BigInt(300000);
    const options = buildOptions(gas);
    console.log('options (bridgeBackToConflux):', options);
    // Estimate fee
    let fee: { nativeFee: bigint; lzTokenFee: bigint } | null = null;
    try {
      fee = await publicClient.readContract({
        address: BASE_WRAPPED_ADDRESS,
        abi: BASE_WRAPPED_ABI,
        functionName: 'quoteBridgeSend',
        args: [CONFLUX_EID, recipient as Address, [BigInt(tokenId)], options, false],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
    } catch (quoteErr: any) {
      const reason = extractRevertReason(quoteErr, BASE_WRAPPED_ABI) || 'unknown';
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

    const txGas = await estimateGasWithBuffer(publicClient, {
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeSend',
      args: [CONFLUX_EID, recipient as Address, [BigInt(tokenId)], options, fee, recipient as Address],
      account: walletClient.account.address,
      value: fee.nativeFee,
    }, 20, 500000n); // Higher default for bridging

    // Bridge back
    const hash = await walletClient.writeContract({
      address: BASE_WRAPPED_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeSend',
      args: [CONFLUX_EID, recipient as Address, [BigInt(tokenId)], options, fee, recipient as Address],
      value: fee.nativeFee,
      gas: txGas,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    setTxStatus(`Wrapped NFT ${tokenId} bridged back to Conflux!`);
    setTokenId('');
  } catch (err: any) {
    console.error('Bridge back to Conflux error:', err);
    const reason = extractRevertReason(err, BASE_WRAPPED_ABI);
    setTxStatus(`Failed to bridge back: ${reason || err?.message || String(err)}`);
  } finally {
    setIsBridging(false);
  }
};