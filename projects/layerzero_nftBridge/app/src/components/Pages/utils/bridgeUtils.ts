import { WalletClient, PublicClient, Address, toHex, pad, decodeErrorResult } from "viem";
import {
  ERC721_ABI,
  BASE_WRAPPED_ABI,
  ESPACE_BRIDGE_ABI,
} from "./abis";
import { 
  CONFLUX_ORIGIN_ADDRESS, 
  BASE_BRIDGE_ADDRESS, 
  CONFLUX_CHAIN_ID, 
  CONFLUX_EID, 
  BASE_EID 
} from "./constants";

const BRIDGE_CONTRACT_ADDRESS = BASE_BRIDGE_ADDRESS as Address; // DynamicWrappedONFT on Base
const CONFLUX_BRIDGE_ADDRESS = CONFLUX_ORIGIN_ADDRESS as Address; // DynamicConfluxONFTAdapter on Conflux
// --- Helpers ---
const isHex = (s: string): boolean => /^0x[0-9a-fA-F]{40}$/.test(s);

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

// Helper to estimate gas with a buffer
async function estimateGasWithBuffer(
  publicClient: PublicClient,
  config: {
    address: Address;
    abi: any;
    functionName: string;
    args: any[];
    account: Address;
    value?: bigint;
  },
  bufferPercent: number = 20,
  defaultGas: bigint = 200000n
): Promise<bigint> {
  try {
    const gasEstimate = await publicClient.estimateContractGas(config);
    if (!gasEstimate) {
      console.warn(`Gas estimate for ${config.functionName} is falsy, using default`);
      return defaultGas;
    }
    return (gasEstimate * BigInt(100 + bufferPercent)) / BigInt(100);
  } catch (error) {
    console.error(`Gas estimation failed for ${config.functionName}, using default:`, error);
    return defaultGas;
  }
}

export async function approveNFT(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenId: string,
  tokenAddress: Address,
  setTxStatus: (status: string) => void,
  setIsApproved: (approved: boolean) => void,
  setIsApproving: (approving: boolean) => void
) {
  if (!walletClient || !publicClient || !tokenId || !tokenAddress) {
    setTxStatus('Missing wallet, token ID, or contract address');
    return { status: "failed", txHash: null };
  }
  if (!isHex(tokenAddress)) {
    setTxStatus('Invalid token contract address');
    return { status: "failed", txHash: null };
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return { status: "failed", txHash: null };
  }
  setIsApproving(true);
  try {
    // Verify token ownership
    const owner = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[approveNFT] Token ${tokenId} owner: ${owner}`);
    if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
      setTxStatus('You do not own this token');
      return { status: "failed", txHash: null };
    }
    // Check if contract is ERC-721
    const isERC721 = await publicClient.readContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'isERC721',
      args: [tokenAddress],
    }) as boolean;
    if (!isERC721) {
      setTxStatus('Contract is not a valid ERC-721 token');
      return { status: "failed", txHash: null };
    }
    // Check approval status
    const approvedAddress = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'getApproved',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[approveNFT] Approved address for ${tokenId}: ${approvedAddress}`);
    if (approvedAddress.toLowerCase() === CONFLUX_BRIDGE_ADDRESS.toLowerCase()) {
      console.log(`[approveNFT] Token ${tokenId} already approved`);
      setIsApproved(true);
      setTxStatus('NFT already approved');
      setIsApproving(false);
      return { status: "success", txHash: null };
    }
    // Estimate gas
    const gasEstimate = await estimateGasWithBuffer(publicClient, {
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [CONFLUX_BRIDGE_ADDRESS, BigInt(tokenId)],
      account: walletClient.account.address,
    });
    console.log(`[approveNFT] Estimated gas for approve: ${gasEstimate}`);
    console.log(`[approveNFT] Approving token ${tokenId} to ${CONFLUX_BRIDGE_ADDRESS} with gas: ${gasEstimate}`);
    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [CONFLUX_BRIDGE_ADDRESS, BigInt(tokenId)],
      gas: gasEstimate,
    });
    console.log(`[approveNFT] Approval tx hash: ${txHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`[approveNFT] Receipt status: ${receipt.status === "success" ? "success" : "reverted"}`);
    if (receipt.status === "success") {
      setIsApproved(true);
      setTxStatus('NFT approved successfully');
    } else {
      setTxStatus('Failed to approve NFT');
    }
    setIsApproving(false);
    return { status: receipt.status === "success" ? "success" : "reverted", txHash };
  } catch (error) {
    console.error(`[approveNFT] Error:`, error);
    const reason = extractRevertReason(error, ERC721_ABI);
    setTxStatus(`Failed to approve NFT: ${reason || 'Unknown error'}`);
    setIsApproving(false);
    return { status: "failed", txHash: null };
  }
}

export async function approveWrappedNFT(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenId: string,
  tokenAddress: Address,
  setTxStatus: (status: string) => void,
  setIsApproved: (approved: boolean) => void,
  setIsApproving: (approving: boolean) => void
) {
  if (!walletClient || !publicClient || !tokenId || !tokenAddress) {
    setTxStatus('Missing wallet, token ID, or contract address');
    return { status: "failed", txHash: null };
  }
  if (!isHex(tokenAddress)) {
    setTxStatus('Invalid token contract address');
    return { status: "failed", txHash: null };
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return { status: "failed", txHash: null };
  }
  setIsApproving(true);
  try {
    // Verify ownership
    const owner = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[approveWrappedNFT] Token ${tokenId} owner: ${owner}`);
    if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
      setTxStatus('You do not own this wrapped token');
      return { status: "failed", txHash: null };
    }
    // Check approval status
    const approvedAddress = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'getApproved',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[approveWrappedNFT] Approved address for ${tokenId}: ${approvedAddress}`);
    if (approvedAddress.toLowerCase() === BRIDGE_CONTRACT_ADDRESS.toLowerCase()) {
      console.log(`[approveWrappedNFT] Token ${tokenId} already approved`);
      setIsApproved(true);
      setTxStatus('Wrapped NFT already approved');
      setIsApproving(false);
      return { status: "success", txHash: null };
    }
    // Estimate gas
    const gasEstimate = await estimateGasWithBuffer(publicClient, {
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [BRIDGE_CONTRACT_ADDRESS, BigInt(tokenId)],
      account: walletClient.account.address,
    });
    console.log(`[approveWrappedNFT] Estimated gas for approve: ${gasEstimate}`);
    console.log(`[approveWrappedNFT] Approving token ${tokenId} to ${BRIDGE_CONTRACT_ADDRESS} with gas: ${gasEstimate}`);
    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [BRIDGE_CONTRACT_ADDRESS, BigInt(tokenId)],
      gas: gasEstimate,
    });
    console.log(`[approveWrappedNFT] Approval tx hash: ${txHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`[approveWrappedNFT] Receipt status: ${receipt.status === "success" ? "success" : "reverted"}`);
    if (receipt.status === "success") {
      setIsApproved(true);
      setTxStatus('Wrapped NFT approved successfully');
    } else {
      setTxStatus('Failed to approve wrapped NFT');
    }
    setIsApproving(false);
    return { status: receipt.status === "success" ? "success" : "reverted", txHash };
  } catch (error) {
    console.error(`[approveWrappedNFT] Error:`, error);
    const reason = extractRevertReason(error, ERC721_ABI);
    setTxStatus(`Failed to approve wrapped NFT: ${reason || 'Unknown error'}`);
    setIsApproving(false);
    return { status: "failed", txHash: null };
  }
}

export async function bridgeToBase(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenId: string,
  tokenAddress: Address,
  recipient: Address,
  isApproved: boolean,
  setTxStatus: (status: string) => void,
  setIsApproved: (approved: boolean) => void,
  setTokenId: (tokenId: string) => void,
  setIsBridging: (bridging: boolean) => void
) {
  if (!walletClient || !publicClient || !recipient || !tokenId || !tokenAddress) {
    setTxStatus('Missing wallet, recipient, token ID, or contract address');
    return { status: "failed", txHash: null };
  }
  if (!isHex(tokenAddress) || !isHex(recipient)) {
    setTxStatus('Invalid token contract or recipient address');
    return { status: "failed", txHash: null };
  }
  if (!isApproved) {
    setTxStatus('Please approve NFT first');
    return { status: "failed", txHash: null };
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return { status: "failed", txHash: null };
  }
  setIsBridging(true);
  try {
    // Verify chain ID
    const chainId = walletClient.chain.id;
    console.log(`[bridgeToBase] Wallet account: ${walletClient.account.address}, chainId: ${chainId}`);
    if (chainId !== CONFLUX_CHAIN_ID) {
      setTxStatus('Must be on Conflux eSpace network');
      return { status: "failed", txHash: null };
    }
    // Verify token ownership
    const owner = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[bridgeToBase] Token ${tokenId} owner: ${owner}`);
    if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
      setTxStatus('You do not own this token');
      return { status: "failed", txHash: null };
    }
    // Check if contract is ERC-721
    const isERC721 = await publicClient.readContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'isERC721',
      args: [tokenAddress],
    }) as boolean;
    if (!isERC721) {
      setTxStatus('Contract is not a valid ERC-721 token');
      return { status: "failed", txHash: null };
    }
    // Check if token is supported
    const isSupported = await publicClient.readContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'supportedTokens',
      args: [tokenAddress],
    }) as boolean;
    if (!isSupported) {
      setTxStatus('Token contract not registered. Please whitelist the collection.');
      return { status: "failed", txHash: null };
    }
    // Verify peer mapping
    const peer = await publicClient.readContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'peers',
      args: [BASE_EID],
    }) as `0x${string}`;
    const expectedPeer = pad(BRIDGE_CONTRACT_ADDRESS, { size: 32 }) as `0x${string}`;
    console.log(`[bridgeToBase] Peer for dstEid=${BASE_EID}: ${peer}, expected: ${expectedPeer}`);
    if (!peer || peer === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      setTxStatus(`Peer not set on Conflux bridge for dstEid=${BASE_EID}. Configure via setPeer.`);
      return { status: "failed", txHash: null };
    }
    if (peer.toLowerCase() !== expectedPeer.toLowerCase()) {
      setTxStatus(`Peer mismatch. Contract peers[${BASE_EID}] = ${peer}. Expected ${expectedPeer}.`);
      return { status: "failed", txHash: null };
    }
    // Build options
    const gas = BigInt(300000);
    const options = buildOptions(gas);
    console.log(`[bridgeToBase] Options: ${options}`);
    // Estimate fee
    let fee: { nativeFee: bigint; lzTokenFee: bigint } | null = null;
    try {
      fee = await publicClient.readContract({
        address: CONFLUX_BRIDGE_ADDRESS,
        abi: ESPACE_BRIDGE_ABI,
        functionName: 'quoteBridgeSend',
        args: [tokenAddress, BASE_EID, recipient, [BigInt(tokenId)], options, false],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
      console.log(`[bridgeToBase] Fee quote: nativeFee=${fee.nativeFee}, lzTokenFee=${fee.lzTokenFee}`);
    } catch (error) {
      console.error(`[bridgeToBase] quoteBridgeSend error:`, error);
      const reason = extractRevertReason(error, ESPACE_BRIDGE_ABI) || 'unknown';
      if (reason.includes('peer')) {
        setTxStatus('quoteBridgeSend reverted: peer mismatch. Ensure peers mapping is set on LayerZero endpoint.');
      } else if (reason.includes('invalid') || reason.includes('options')) {
        setTxStatus(`quoteBridgeSend reverted: invalid options. Options: ${options}`);
      } else if (reason.includes('dv') || reason.includes('dvn') || reason.includes('executor')) {
        setTxStatus('quoteBridgeSend reverted: LayerZero endpoint DVN/executor may not be configured.');
      } else if (reason.includes('dst') || reason.includes('eid') || reason.includes('dsteid')) {
        setTxStatus(`quoteBridgeSend reverted: check destination EID (${BASE_EID}).`);
      } else if (reason.includes('no dvn configured')) {
        setTxStatus('quoteBridgeSend reverted: No DVN configured for this lane.');
      } else {
        setTxStatus(`quoteBridgeSend reverted: ${reason}`);
      }
      return { status: "failed", txHash: null };
    }
    if (!fee || fee.nativeFee === 0n) {
      setTxStatus('Failed to get valid fee quote. Check endpoint config or gas settings.');
      return { status: "failed", txHash: null };
    }
    // Estimate gas
    const gasEstimate = await estimateGasWithBuffer(publicClient, {
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeSend',
      args: [tokenAddress, BASE_EID, recipient, [BigInt(tokenId)], options, fee, recipient],
      account: walletClient.account.address,
      value: fee.nativeFee,
    }, 20, 500000n);
    console.log(`[bridgeToBase] Bridge tx gas: ${gasEstimate}`);
    // Simulate transaction
    console.log(`[bridgeToBase] Simulating bridgeSend`);
    try {
      await publicClient.simulateContract({
        address: CONFLUX_BRIDGE_ADDRESS,
        abi: ESPACE_BRIDGE_ABI,
        functionName: 'bridgeSend',
        args: [tokenAddress, BASE_EID, recipient, [BigInt(tokenId)], options, fee, recipient],
        value: fee.nativeFee,
        account: walletClient.account.address,
      });
    } catch (error) {
      console.error(`[bridgeToBase] Simulation error:`, error);
      const reason = extractRevertReason(error, ESPACE_BRIDGE_ABI);
      setTxStatus(`Simulation failed: ${reason || 'Unknown error'}`);
      return { status: "failed", txHash: null };
    }
    // Execute bridge
    console.log(`[bridgeToBase] Executing bridgeSend`);
    const txHash = await walletClient.writeContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'bridgeSend',
      args: [tokenAddress, BASE_EID, recipient, [BigInt(tokenId)], options, fee, recipient],
      value: fee.nativeFee,
      gas: gasEstimate,
    });
    console.log(`[bridgeToBase] Bridge tx hash: ${txHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`[bridgeToBase] Receipt status: ${receipt.status === "success" ? "success" : "reverted"}`);
    if (receipt.status === "success") {
      setTxStatus('NFT bridged to Base successfully');
      setIsApproved(false);
      setTokenId('');
    } else {
      setTxStatus('Failed to bridge NFT to Base');
    }
    setIsBridging(false);
    return { status: receipt.status === "success" ? "success" : "reverted", txHash };
  } catch (error) {
    console.error(`[bridgeToBase] Error:`, error);
    const reason = extractRevertReason(error, ESPACE_BRIDGE_ABI);
    setTxStatus(`Failed to bridge NFT to Base: ${reason || 'Unknown error'}`);
    setIsBridging(false);
    return { status: "failed", txHash: null };
  }
}

export async function bridgeBackToConflux(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenId: string,
  recipient: Address,
  tokenAddress: Address,
  isApproved: boolean,
  setTxStatus: (status: string) => void,
  setTokenId: (tokenId: string) => void,
  setIsBridging: (bridging: boolean) => void
) {
  if (!walletClient || !publicClient || !recipient || !tokenId || !tokenAddress) {
    setTxStatus('Missing wallet, recipient, token ID, or contract address');
    return { status: "failed", txHash: null };
  }
  if (!isHex(tokenAddress) || !isHex(recipient)) {
    setTxStatus('Invalid token contract or recipient address');
    return { status: "failed", txHash: null };
  }
  if (!isApproved) {
    setTxStatus('Please approve wrapped NFT first');
    return { status: "failed", txHash: null };
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return { status: "failed", txHash: null };
  }
  setIsBridging(true);
  try {
    // Verify chain ID
    const chainId = walletClient.chain.id;
    console.log(`[bridgeBackToConflux] Wallet account: ${walletClient.account.address}, chainId: ${chainId}`);
    if (chainId !== 8453) {
      setTxStatus('Must be on Base network');
      return { status: "failed", txHash: null };
    }
    // Verify ownership
    const owner = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[bridgeBackToConflux] Token ${tokenId} owner: ${owner}`);
    if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
      setTxStatus('You do not own this wrapped token');
      return { status: "failed", txHash: null };
    }
    // Retrieve the original token address from Conflux
    const originalToken = await publicClient.readContract({
      address: BRIDGE_CONTRACT_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'wrappedToOriginalToken',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[bridgeBackToConflux] Original token for wrapped ${tokenId}: ${originalToken}`);
    if (originalToken.toLowerCase() === '0x0000000000000000000000000000000000000000') {
      setTxStatus('Invalid wrapped NFT - no original token mapped');
      return { status: "failed", txHash: null };
    }
    // Verify approval
    const approved = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC721_ABI,
      functionName: 'getApproved',
      args: [BigInt(tokenId)],
    }) as Address;
    console.log(`[bridgeBackToConflux] Approved address for ${tokenId}: ${approved}`);
    if (!isApproved && approved.toLowerCase() !== BRIDGE_CONTRACT_ADDRESS.toLowerCase()) {
      setTxStatus('Wrapped NFT not approved for bridging');
      return { status: "failed", txHash: null };
    }
    // Verify peer mapping
    const peer = await publicClient.readContract({
      address: BRIDGE_CONTRACT_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'peers',
      args: [CONFLUX_EID],
    }) as `0x${string}`;
    const expectedPeer = pad(CONFLUX_BRIDGE_ADDRESS, { size: 32 }) as `0x${string}`;
    console.log(`[bridgeBackToConflux] Peer for dstEid=${CONFLUX_EID}: ${peer}, expected: ${expectedPeer}`);
    if (!peer || peer === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      setTxStatus(`Peer not set on Base bridge for dstEid=${CONFLUX_EID}. Configure via setPeer.`);
      return { status: "failed", txHash: null };
    }
    if (peer.toLowerCase() !== expectedPeer.toLowerCase()) {
      setTxStatus(`Peer mismatch. Contract peers[${CONFLUX_EID}] = ${peer}. Expected ${expectedPeer}.`);
      return { status: "failed", txHash: null };
    }
    // Build options
    const gas = BigInt(300000);
    const options = buildOptions(gas);
    console.log(`[bridgeBackToConflux] Options: ${options}`);
    // Estimate fee
    let fee: { nativeFee: bigint; lzTokenFee: bigint } | null = null;
    try {
      fee = await publicClient.readContract({
        address: BRIDGE_CONTRACT_ADDRESS,
        abi: BASE_WRAPPED_ABI,
        functionName: 'quoteBridgeSend',
        args: [originalToken, CONFLUX_EID, recipient, [BigInt(tokenId)], options, false],
      }) as { nativeFee: bigint; lzTokenFee: bigint };
      console.log(`[bridgeBackToConflux] Fee quote: nativeFee=${fee.nativeFee}, lzTokenFee=${fee.lzTokenFee}`);
    } catch (error) {
      console.error(`[bridgeBackToConflux] quoteBridgeSend error:`, error);
      const reason = extractRevertReason(error, BASE_WRAPPED_ABI) || 'unknown';
      if (reason.includes('peer')) {
        setTxStatus('quoteBridgeSend reverted: peer mismatch. Ensure peers mapping is set on LayerZero endpoint.');
      } else if (reason.includes('invalid') || reason.includes('options')) {
        setTxStatus(`quoteBridgeSend reverted: invalid options. Options: ${options}`);
      } else if (reason.includes('dv') || reason.includes('dvn') || reason.includes('executor')) {
        setTxStatus('quoteBridgeSend reverted: LayerZero endpoint DVN/executor may not be configured.');
      } else if (reason.includes('dst') || reason.includes('eid') || reason.includes('dsteid')) {
        setTxStatus(`quoteBridgeSend reverted: check destination EID (${CONFLUX_EID}).`);
      } else if (reason.includes('no dvn configured')) {
        setTxStatus('quoteBridgeSend reverted: No DVN configured for this lane.');
      } else {
        setTxStatus(`quoteBridgeSend reverted: ${reason}`);
      }
      return { status: "failed", txHash: null };
    }
    if (!fee || fee.nativeFee === 0n) {
      setTxStatus('Failed to get valid fee quote. Check endpoint config or gas settings.');
      return { status: "failed", txHash: null };
    }
    // Estimate gas
    const gasEstimate = await estimateGasWithBuffer(publicClient, {
      address: BRIDGE_CONTRACT_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeSend',
      args: [originalToken, CONFLUX_EID, recipient, [BigInt(tokenId)], options, fee, recipient],
      account: walletClient.account.address,
      value: fee.nativeFee,
    }, 20, 500000n);
    console.log(`[bridgeBackToConflux] Bridge tx gas: ${gasEstimate}`);
    // Simulate transaction
    console.log(`[bridgeBackToConflux] Simulating bridgeSend`);
    try {
      await publicClient.simulateContract({
        address: BRIDGE_CONTRACT_ADDRESS,
        abi: BASE_WRAPPED_ABI,
        functionName: 'bridgeSend',
        args: [originalToken, CONFLUX_EID, recipient, [BigInt(tokenId)], options, fee, recipient],
        value: fee.nativeFee,
        account: walletClient.account.address,
      });
    } catch (error) {
      console.error(`[bridgeBackToConflux] Simulation error:`, error);
      const reason = extractRevertReason(error, BASE_WRAPPED_ABI);
      setTxStatus(`Simulation failed: ${reason || 'Unknown error'}`);
      return { status: "failed", txHash: null };
    }
    // Execute bridge
    console.log(`[bridgeBackToConflux] Executing bridgeSend`);
    const txHash = await walletClient.writeContract({
      address: BRIDGE_CONTRACT_ADDRESS,
      abi: BASE_WRAPPED_ABI,
      functionName: 'bridgeSend',
      args: [originalToken, CONFLUX_EID, recipient, [BigInt(tokenId)], options, fee, recipient],
      value: fee.nativeFee,
      gas: gasEstimate,
    });
    console.log(`[bridgeBackToConflux] Bridge tx hash: ${txHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`[bridgeBackToConflux] Receipt status: ${receipt.status === "success" ? "success" : "reverted"}`);
    if (receipt.status === "success") {
      setTxStatus('NFT bridged back to Conflux successfully');
      setTokenId('');
    } else {
      setTxStatus('Failed to bridge NFT back to Conflux');
    }
    setIsBridging(false);
    return { status: receipt.status === "success" ? "success" : "reverted", txHash };
  } catch (error) {
    console.error(`[bridgeBackToConflux] Error:`, error);
    const reason = extractRevertReason(error, BASE_WRAPPED_ABI);
    setTxStatus(`Failed to bridge NFT back to Conflux: ${reason || 'Unknown error'}`);
    setIsBridging(false);
    return { status: "failed", txHash: null };
  }
}

export async function registerCollection(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenId: string,
  tokenAddress: Address,
  setTxStatus: (status: string) => void,
  setIsSupported: (supported: boolean) => void,
  setIsWhitelisting: (whitelisting: boolean) => void
) {
  if (!walletClient || !publicClient || !tokenId || !tokenAddress) {
    setTxStatus('Missing wallet, token ID, or contract address');
    return { status: "failed", txHash: null };
  }
  if (!isHex(tokenAddress)) {
    setTxStatus('Invalid token contract address');
    return { status: "failed", txHash: null };
  }
  if (!walletClient.account?.address) {
    setTxStatus('Missing account address');
    return { status: "failed", txHash: null };
  }
  setIsWhitelisting(true);
  try {
    // Check if contract is ERC-721
    const isERC721 = await publicClient.readContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'isERC721',
      args: [tokenAddress],
    }) as boolean;
    if (!isERC721) {
      setTxStatus('Contract is not a valid ERC-721 token');
      return { status: "failed", txHash: null };
    }
    // Check if already supported
    const isSupported = await publicClient.readContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'supportedTokens',
      args: [tokenAddress],
    }) as boolean;
    if (isSupported) {
      console.log(`[registerCollection] Token ${tokenAddress} already supported`);
      setIsSupported(true);
      setTxStatus('Collection already whitelisted');
      setIsWhitelisting(false);
      return { status: "success", txHash: null };
    }
    // Estimate gas
    const gasEstimate = await estimateGasWithBuffer(publicClient, {
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'registerToken',
      args: [tokenAddress],
      account: walletClient.account.address,
    });
    console.log(`[registerCollection] Estimated gas for registerToken: ${gasEstimate}`);
    console.log(`[registerCollection] Registering token ${tokenAddress} on bridge ${CONFLUX_BRIDGE_ADDRESS}`);
    const txHash = await walletClient.writeContract({
      address: CONFLUX_BRIDGE_ADDRESS,
      abi: ESPACE_BRIDGE_ABI,
      functionName: 'registerToken',
      args: [tokenAddress],
      gas: gasEstimate,
    });
    console.log(`[registerCollection] Transaction hash: ${txHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`[registerCollection] Receipt status: ${receipt.status === "success" ? "success" : "reverted"}`);
    if (receipt.status === "success") {
      setIsSupported(true);
      setTxStatus('Collection whitelisted successfully');
    } else {
      setTxStatus('Failed to whitelist collection');
    }
    setIsWhitelisting(false);
    return { status: receipt.status === "success" ? "success" : "reverted", txHash };
  } catch (error) {
    console.error(`[registerCollection] Error:`, error);
    const reason = extractRevertReason(error, ESPACE_BRIDGE_ABI);
    setTxStatus(`Failed to whitelist collection: ${reason || 'Unknown error'}`);
    setIsWhitelisting(false);
    return { status: "failed", txHash: null };
  }
}