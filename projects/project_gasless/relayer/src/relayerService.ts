import { ethers } from "ethers";
import {
  GAS_TOP_UP_ADDRESS,
  GAS_TOP_UP_ABI,
  RELAYER_PRIVATE_KEY,
  RPC_URL,
  PYTH_ADDRESS,
  PYTH_ABI,
  ERC20_ABI,
} from "./config.js";
// SOLUTION 1: Use StaticNetwork to completely disable ENS
const staticNetwork = new ethers.Network("conflux-espace", 1030);

// SOLUTION 2: Create provider with StaticNetwork (no ENS support)
const provider = new ethers.JsonRpcProvider(RPC_URL, staticNetwork, {
  staticNetwork: staticNetwork
});

// SOLUTION 3: Disable network detection to prevent ENS lookups
provider._detectNetwork = async () => staticNetwork;

// SOLUTION 4: Create wallet with the ENS-disabled provider
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

// SOLUTION 5: Validate all contract addresses before creating contracts
function validateContractAddress(address: string, name: string): string {
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid ${name} contract address: ${address}`);
  }
  return ethers.getAddress(address); // Return checksummed address
}

// Validate and create contracts with checksummed addresses
const gasTopUpContractAddress = validateContractAddress(GAS_TOP_UP_ADDRESS, "GasTopUp");
const pythContractAddress = validateContractAddress(PYTH_ADDRESS, "Pyth");

const gasTopUpContract = new ethers.Contract(
  gasTopUpContractAddress,
  GAS_TOP_UP_ABI,
  relayerWallet
);

const pythContract = new ethers.Contract(
  pythContractAddress,
  PYTH_ABI,
  provider
);

// Helper: Strict hex address validation with detailed error messages
function isHexAddress(addr: string | null | undefined): boolean {
  if (!addr || typeof addr !== "string") return false;
  try {
    return ethers.isAddress(addr);
  } catch {
    return false;
  }
}

// SOLUTION 6: Enhanced address validation and normalization
function ensureHexAddress(address: string, context: string = "address"): string {
  console.log(`Validating ${context}: ${address}`);
  
  if (!address || typeof address !== "string") {
    throw new Error(`${context} must be a non-empty string, got: ${typeof address}`);
  }
  
  // Remove any whitespace
  address = address.trim();
  
  if (!address.startsWith("0x")) {
    throw new Error(`${context} must start with '0x', got: ${address}`);
  }
  
  if (address.length !== 42) {
    throw new Error(`${context} must be 42 characters long (including 0x), got length: ${address.length}`);
  }
  
  if (!ethers.isAddress(address)) {
    throw new Error(`${context} is not a valid Ethereum address: ${address}`);
  }
  
  // Return checksummed address
  const checksummed = ethers.getAddress(address);
  console.log(`Validated ${context}: ${address} -> ${checksummed}`);
  return checksummed;
}

// SOLUTION 7: Pre-validate all addresses in the request
function validateSwapRequest(request: {
  user: string;
  tokenAddress: string;
  amount: string;
  nonce: string;
  deadline: number;
  signature: string;
  updateData: string[];
  maxAge: number;
}) {
  const errors: string[] = [];
  
  // Validate user address
  try {
    ensureHexAddress(request.user, "user address");
  } catch (err) {
    errors.push(`Invalid user: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  // Validate token address
  try {
    ensureHexAddress(request.tokenAddress, "token address");
  } catch (err) {
    errors.push(`Invalid token: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  // Validate amount
  if (!request.amount || isNaN(Number(request.amount)) || Number(request.amount) <= 0) {
    errors.push("Amount must be a positive number");
  }
  
  // Validate signature
  if (!request.signature || !ethers.isHexString(request.signature)) {
    errors.push("Invalid signature format");
  }
  
  // Validate deadline
  if (request.deadline < Math.floor(Date.now() / 1000)) {
    errors.push("Deadline has expired");
  }
  
  // Validate updateData
  if (!request.updateData || !Array.isArray(request.updateData) || request.updateData.length === 0) {
    errors.push("UpdateData must be a non-empty array");
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join("; ")}`);
  }
}

/**
 * Handle gasless MetaSwap with comprehensive ENS prevention
 */
export async function handleMetaSwap(request: {
  user: string;
  tokenAddress: string;
  amount: string;
  nonce: string;
  deadline: number;
  signature: string;
  updateData: string[];
  maxAge: number;
  permit?: {
    v: number;
    r: string;
    s: string;
    deadline: number;
    value: string;
  };
}) {
  const { user, tokenAddress, amount, nonce, deadline, signature, updateData, maxAge, permit } = request;

  try {
    console.log("=== Starting MetaSwap Request ===");

    // Validate + normalize
    const normalizedUser = ethers.getAddress(user);
    const normalizedTokenAddress = ethers.getAddress(tokenAddress);
    const amountBigInt = BigInt(amount);

    // Fetch Pyth fee
    const fee = await pythContract.getUpdateFee(updateData);

    const txOptions = {
      value: fee,
      gasLimit: 5_000_000n,
    };

    // --- NEW: Execute permit if provided ---
    if (permit) {
      console.log("Executing permit()");
      const token = new ethers.Contract(
        normalizedTokenAddress,
        ERC20_ABI,
        relayerWallet
      );
      const txPermit = await token.permit(
        normalizedUser,
        GAS_TOP_UP_ADDRESS,
        permit.value,
        permit.deadline,
        permit.v,
        permit.r,
        permit.s
      );
      await txPermit.wait();
      console.log(`✅ Permit executed in tx: ${txPermit.hash}`);
    }

    // MetaSwap
    const tx = await gasTopUpContract.metaSwap(
      normalizedUser,
      normalizedTokenAddress,
      amountBigInt,
      deadline,
      signature,
      updateData,
      maxAge,
      txOptions
    );
    console.log(`✅ MetaSwap sent: ${tx.hash}`);

    const receipt = await tx.wait();
    return { success: true, txHash: receipt?.transactionHash };

  } catch (err: any) {
    console.error("❌ MetaSwap relayer error:", err);
    return { success: false, error: err.message ?? "Unknown error" };
  }
}

/**
 * Fetch nonce for a user with enhanced validation
 */
export async function getNonce(user: string): Promise<string> {
  try {
    console.log("=== Getting Nonce ===");
    const normalizedUser = ensureHexAddress(user, "user for nonce lookup");
    
    console.log(`Fetching nonce for user: ${normalizedUser}`);
    
    const nonce: bigint = await gasTopUpContract.nonces(normalizedUser);
    const nonceStr = nonce.toString();
    
    console.log(`✅ Nonce for ${normalizedUser}: ${nonceStr}`);
    return nonceStr;
    
  } catch (err) {
    console.error("❌ GetNonce failed:", err);
    
    let errorMessage = "Failed to fetch nonce";
    if (err instanceof Error) {
      errorMessage = `Failed to fetch nonce: ${err.message}`;
      
      if (err.message.includes("ENS")) {
        errorMessage = `ENS error while fetching nonce. Ensure address is in hex format: ${err.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
}


