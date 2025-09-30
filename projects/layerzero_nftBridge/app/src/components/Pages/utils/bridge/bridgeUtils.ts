// utils/bridge/bridgeUtils.ts
import { WalletClient, PublicClient, Address, toHex, pad, decodeErrorResult, Hash } from "viem";
import {
ERC721_ABI,
BRIDGE_ABI,
} from "../abi/bridgeAbi";
import {
CONFLUX_BRIDGE_ADDRESS,
BASE_BRIDGE_ADDRESS,
// ETH_SEPOLIA_BRIDGE_ADDRESS,
// BASE_SEPOLIA_BRIDGE_ADDRESS,
ARBITRUM_BRIDGE_ADDRESS,
CONFLUX_CHAIN_ID,
BASE_CHAIN_ID,
// ETH_SEPOLIA_CHAIN_ID,
// BASE_SEPOLIA_CHAIN_ID,
ARBITRUM_CHAIN_ID,
CONFLUX_EID,
BASE_EID,
// ETH_SEPOLIA_EID,
// BASE_SEPOLIA_EID,
ARBITRUM_EID
} from "../constants";
interface ChainConfig {
bridgeAddress: Address;
eid: number;
}
const chainConfigs: Record<number, ChainConfig> = {
[CONFLUX_CHAIN_ID]: { bridgeAddress: CONFLUX_BRIDGE_ADDRESS, eid: CONFLUX_EID },
[BASE_CHAIN_ID]: { bridgeAddress: BASE_BRIDGE_ADDRESS, eid: BASE_EID },
// [ETH_SEPOLIA_CHAIN_ID]: { bridgeAddress: ETH_SEPOLIA_BRIDGE_ADDRESS, eid: ETH_SEPOLIA_EID },
// [BASE_SEPOLIA_CHAIN_ID]: { bridgeAddress: BASE_SEPOLIA_BRIDGE_ADDRESS, eid: BASE_SEPOLIA_EID },
[ARBITRUM_CHAIN_ID]: { bridgeAddress: ARBITRUM_BRIDGE_ADDRESS, eid: ARBITRUM_EID },
};
const chainNames: Record<number, string> = {
[CONFLUX_CHAIN_ID]: 'Conflux',
[BASE_CHAIN_ID]: 'Base',
// [ETH_SEPOLIA_CHAIN_ID]: 'Ethereum Sepolia',
// [BASE_SEPOLIA_CHAIN_ID]: 'Base Sepolia',
[ARBITRUM_CHAIN_ID]: 'Arbitrum',
};
interface BridgeParams {
walletClient: WalletClient;
publicClient: PublicClient;
tokenIds: string[]; // Now array for batch support
localTokenAddress: Address;
recipient: Address;
isApproved: boolean;
setTxStatus: (status: string) => void;
setIsApproved: (approved: boolean) => void;
setTokenIds: (tokenIds: string[]) => void; // Updated for batch
setIsBridging: (bridging: boolean) => void;
}
interface ApproveParams {
walletClient: WalletClient;
publicClient: PublicClient;
tokenId: string;
tokenAddress: Address;
bridgeAddress: Address;
setTxStatus: (status: string) => void;
setIsApproved: (approved: boolean) => void;
setIsApproving: (approving: boolean) => void;
}
interface RegisterParams {
walletClient: WalletClient;
publicClient: PublicClient;
tokenAddress: Address;
bridgeAddress: Address;
setTxStatus: (status: string) => void;
setIsSupported: (supported: boolean) => void;
setIsRegistering: (registering: boolean) => void;
}
// --- Helpers ---
const isHex = (s: string): boolean => /^0x[0-9a-fA-F]{40}$/.test(s);
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
const extractRevertReason = (err: any, abi?: readonly unknown[]): string | null => {
try {
if (!err) return null;
if (typeof err === 'string') return err;
if (err.shortMessage) return err.shortMessage;
if (err.cause) {
if (err.cause.reason) return err.cause.reason;
if (err.cause.message) return err.cause.message;
if (err.cause.data && abi) {
const decoded = decodeErrorResult({ abi, data: err.cause.data });
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
bufferPercent: number = 15, // Reduced from 20 for optimization
defaultGas: bigint = 750000n
): Promise<bigint> {
try {
const gasEstimate = await publicClient.estimateContractGas(config);
return gasEstimate ? (gasEstimate * BigInt(100 + bufferPercent)) / BigInt(100) : defaultGas;
  } catch (error) {
console.error(`Gas estimation failed for ${config.functionName}, using default:`, error);
return defaultGas;
  }
}
// --- Check Functions ---
// Check if collection is supported
export async function checkIsSupported(
publicClient: PublicClient,
tokenAddress: Address,
bridgeAddress: Address
): Promise<boolean> {
try {
return await publicClient.readContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'supportedTokens',
args: [tokenAddress],
    }) as boolean;
  } catch (error) {
console.error('Failed to check supportedTokens:', error);
return false;
  }
}
// Check if NFT is approved
export async function checkIsApproved(
publicClient: PublicClient,
tokenId: string,
tokenAddress: Address,
bridgeAddress: Address
): Promise<boolean> {
try {
const approved = await publicClient.readContract({
address: tokenAddress,
abi: ERC721_ABI,
functionName: 'getApproved',
args: [BigInt(tokenId)],
    }) as Address;
return approved.toLowerCase() === bridgeAddress.toLowerCase();
  } catch (error) {
console.error('Failed to check approval:', error);
return false;
  }
}
// --- Modular Functions ---
// General approval (works for both native and wrapped ERC721)
export async function approveNFT(
params: ApproveParams
): Promise<{ status: "success" | "reverted" | "failed"; txHash: Hash | null }> {
const { walletClient, publicClient, tokenId, tokenAddress, bridgeAddress, setTxStatus, setIsApproved, setIsApproving } = params;
if (!walletClient || !publicClient || !tokenId || !tokenAddress || !bridgeAddress) {
setTxStatus('Missing parameters');
return { status: "failed", txHash: null };
  }
if (!isHex(tokenAddress) || !isHex(bridgeAddress)) {
setTxStatus('Invalid address');
return { status: "failed", txHash: null };
  }
if (!walletClient.account?.address) {
setTxStatus('Missing account');
return { status: "failed", txHash: null };
  }
setIsApproving(true);
try {
const owner = await publicClient.readContract({
address: tokenAddress,
abi: ERC721_ABI,
functionName: 'ownerOf',
args: [BigInt(tokenId)],
    }) as Address;
if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
setTxStatus('Not owner');
return { status: "failed", txHash: null };
    }
const approved = await publicClient.readContract({
address: tokenAddress,
abi: ERC721_ABI,
functionName: 'getApproved',
args: [BigInt(tokenId)],
    }) as Address;
if (approved.toLowerCase() === bridgeAddress.toLowerCase()) {
setIsApproved(true);
setTxStatus('Already approved');
setIsApproving(false);
return { status: "success", txHash: null };
    }
const gasEstimate = await estimateGasWithBuffer(publicClient, {
address: tokenAddress,
abi: ERC721_ABI,
functionName: 'approve',
args: [bridgeAddress, BigInt(tokenId)],
account: walletClient.account.address,
    });
const txHash = await walletClient.writeContract({
address: tokenAddress,
abi: ERC721_ABI,
functionName: 'approve',
args: [bridgeAddress, BigInt(tokenId)],
gas: gasEstimate,
    });
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
if (receipt.status === "success") {
setIsApproved(true);
setTxStatus('Approved successfully');
    } else {
setTxStatus('Approval transaction reverted');
    }
setIsApproving(false);
return { status: receipt.status, txHash };
  } catch (error) {
const reason = extractRevertReason(error, ERC721_ABI);
setTxStatus(`Approval failed: ${reason || 'Unknown error'}`);
setIsApproving(false);
return { status: "failed", txHash: null };
  }
}
// General registration (on any chain's bridge)
export async function registerCollection(
params: RegisterParams
): Promise<{ status: "success" | "reverted" | "failed"; txHash: Hash | null }> {
const { walletClient, publicClient, tokenAddress, bridgeAddress, setTxStatus, setIsSupported, setIsRegistering } = params;
if (!walletClient || !publicClient || !tokenAddress || !bridgeAddress) {
setTxStatus('Missing parameters');
return { status: "failed", txHash: null };
  }
if (!isHex(tokenAddress) || !isHex(bridgeAddress)) {
setTxStatus('Invalid address');
return { status: "failed", txHash: null };
  }
if (!walletClient.account?.address) {
setTxStatus('Missing account');
return { status: "failed", txHash: null };
  }
setIsRegistering(true);
try {
const isERC721 = await publicClient.readContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'isERC721',
args: [tokenAddress],
    }) as boolean;
if (!isERC721) {
setTxStatus('Not ERC721');
return { status: "failed", txHash: null };
    }
const isSupported = await publicClient.readContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'supportedTokens',
args: [tokenAddress],
    }) as boolean;
if (isSupported) {
setIsSupported(true);
setTxStatus('Already registered');
setIsRegistering(false);
return { status: "success", txHash: null };
    }
const gasEstimate = await estimateGasWithBuffer(publicClient, {
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'registerToken',
args: [tokenAddress],
account: walletClient.account.address,
    });
const txHash = await walletClient.writeContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'registerToken',
args: [tokenAddress],
gas: gasEstimate,
    });
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
if (receipt.status === "success") {
setIsSupported(true);
setTxStatus('Registered successfully');
    } else {
setTxStatus('Registration transaction reverted');
    }
setIsRegistering(false);
return { status: receipt.status, txHash };
  } catch (error) {
const reason = extractRevertReason(error, BRIDGE_ABI);
setTxStatus(`Registration failed: ${reason || 'Unknown error'}`);
setIsRegistering(false);
return { status: "failed", txHash: null };
  }
}
// General bridging (handles any supported source to destination)
export async function bridgeNFT(
params: BridgeParams,
dstChainId: number
): Promise<{ status: "success" | "reverted" | "failed"; txHash: Hash | null }> {
const { walletClient, publicClient, tokenIds, localTokenAddress, recipient, isApproved, setTxStatus, setIsApproved, setTokenIds, setIsBridging } = params;
if (!walletClient || !publicClient || !recipient || !tokenIds.length || !localTokenAddress) {
setTxStatus('Missing parameters');
return { status: "failed", txHash: null };
  }
if (!isHex(localTokenAddress) || !isHex(recipient)) {
setTxStatus('Invalid address');
return { status: "failed", txHash: null };
  }
if (!isApproved) {
setTxStatus('Approve first');
return { status: "failed", txHash: null };
  }
if (!walletClient.account?.address) {
setTxStatus('Missing account');
return { status: "failed", txHash: null };
  }
setIsBridging(true);
try {
const srcChainId = walletClient.chain?.id;
if (!srcChainId || !chainConfigs[srcChainId]) {
setTxStatus('Unsupported source chain');
return { status: "failed", txHash: null };
    }
if (srcChainId === dstChainId) {
setTxStatus('Source and destination cannot be the same');
return { status: "failed", txHash: null };
    }
if (!chainConfigs[dstChainId]) {
setTxStatus('Unsupported destination chain');
return { status: "failed", txHash: null };
    }
const bridgeAddress = chainConfigs[srcChainId].bridgeAddress;
const dstEid = chainConfigs[dstChainId].eid;
const expectedPeer = chainConfigs[dstChainId].bridgeAddress;
// Batch ownership check
for (const tokenId of tokenIds) {
const owner = await publicClient.readContract({
address: localTokenAddress,
abi: ERC721_ABI,
functionName: 'ownerOf',
args: [BigInt(tokenId)],
      }) as Address;
if (owner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
setTxStatus(`Not owner of ${tokenId}`);
return { status: "failed", txHash: null };
      }
    }
const isERC721 = await publicClient.readContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'isERC721',
args: [localTokenAddress],
    }) as boolean;
if (!isERC721) {
setTxStatus('Not ERC721');
return { status: "failed", txHash: null };
    }
const isSupported = await publicClient.readContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'supportedTokens',
args: [localTokenAddress],
    }) as boolean;
if (!isSupported) {
setTxStatus('Register collection first');
return { status: "failed", txHash: null };
    }
const peer = await publicClient.readContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'peers',
args: [dstEid],
    }) as `0x${string}`;
const expectedPeerHex = pad(expectedPeer, { size: 32 }) as `0x${string}`;
if (peer.toLowerCase() !== expectedPeerHex.toLowerCase()) {
setTxStatus('Peer not set');
return { status: "failed", txHash: null };
    }
const gas = BigInt(750000 * tokenIds.length); // Increased from 300000 to handle wrapper deployment + mint; scale with batch size
const options = buildOptions(gas);
const fee = await publicClient.readContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'quoteBridgeSend',
args: [localTokenAddress, dstEid, recipient, tokenIds.map(BigInt), options, false],
    }) as { nativeFee: bigint; lzTokenFee: bigint };
if (!fee.nativeFee) {
setTxStatus('Invalid fee quote');
return { status: "failed", txHash: null };
    }
const gasEstimate = await estimateGasWithBuffer(publicClient, {
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'bridgeSend',
args: [localTokenAddress, dstEid, recipient, tokenIds.map(BigInt), options, fee, recipient],
account: walletClient.account.address,
value: fee.nativeFee,
    });
await publicClient.simulateContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'bridgeSend',
args: [localTokenAddress, dstEid, recipient, tokenIds.map(BigInt), options, fee, recipient],
value: fee.nativeFee,
account: walletClient.account.address,
    });
const txHash = await walletClient.writeContract({
address: bridgeAddress,
abi: BRIDGE_ABI,
functionName: 'bridgeSend',
args: [localTokenAddress, dstEid, recipient, tokenIds.map(BigInt), options, fee, recipient],
value: fee.nativeFee,
gas: gasEstimate,
    });
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
if (receipt.status === "success") {
setIsApproved(false);
setTokenIds([]);
setTxStatus('Bridged successfully');
    } else {
setTxStatus('Bridge transaction reverted');
    }
setIsBridging(false);
return { status: receipt.status, txHash };
  } catch (error) {
const reason = extractRevertReason(error, BRIDGE_ABI);
setTxStatus(`Bridge failed: ${reason || 'Unknown error'}`);
setIsBridging(false);
return { status: "failed", txHash: null };
  }
}