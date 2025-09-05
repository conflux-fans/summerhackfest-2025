// src/relayer.ts
import { ethers } from "ethers";
import {
  GAS_TOP_UP_ADDRESS,
  GAS_TOP_UP_ABI,
  RELAYER_PRIVATE_KEY,
  RPC_URL,
  PYTH_ADDRESS,
  PYTH_ABI,
} from "./config.js";

// Explicitly define the network (avoids ENS lookup)
const network = {
  chainId: 1030,
  name: "conflux-espace",
};

// Provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL, network);
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

// Contracts
const gasTopUpContract = new ethers.Contract(
  GAS_TOP_UP_ADDRESS,
  GAS_TOP_UP_ABI,
  relayerWallet
);
const pythContract = new ethers.Contract(
  PYTH_ADDRESS,
  PYTH_ABI,
  provider
);


/**
 * Handle gasless MetaSwap
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
}) {
  const { user, tokenAddress, amount, nonce, deadline, signature, updateData, maxAge } = request;

  try {
    // Validate inputs
    if (!ethers.isAddress(user) || !ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid user or token address");
    }
    if (!amount || BigInt(amount) <= 0n) {
      throw new Error("Invalid amount");
    }
    if (!signature || !ethers.isHexString(signature)) {
      throw new Error("Invalid signature");
    }
    if (deadline < Math.floor(Date.now() / 1000)) {
      throw new Error("Deadline expired");
    }
    if (!updateData || updateData.length === 0) {
      throw new Error("Empty updateData");
    }

    // Fetch Pyth update fee
    const fee = await pythContract.getUpdateFee(updateData);
    console.log(`Pyth update fee: ${ethers.formatEther(fee)} CFX`);

    // Check relayer balance
    const relayerBalance = await provider.getBalance(relayerWallet.address);
    if (relayerBalance < fee) {
      throw new Error(
        `Insufficient relayer balance: ${ethers.formatEther(relayerBalance)} CFX, needed: ${ethers.formatEther(fee)} CFX`
      );
    }

    // Log transaction details for debugging
    console.log("Sending metaSwap with:", {
      user,
      tokenAddress,
      amount,
      nonce,
      deadline,
      signature,
      updateData,
      maxAge,
      value: ethers.formatEther(fee),
    });

    // Send transaction
    const tx = await gasTopUpContract.metaSwap(
      user,
      tokenAddress,
      BigInt(amount),
      deadline,
      signature,
      updateData,
      maxAge,
      { value: fee, gasLimit: 5_000_000 }
    );

    console.log(`Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${receipt.transactionHash}`);

    return { success: true, txHash: receipt.transactionHash };
  } catch (err: any) {
    console.error("MetaSwap relayer error:", err);

    // Decode custom errors
    let decodedError = err.reason || err.message || "Unknown error";
    if (err.data) {
      try {
        const parsedError = gasTopUpContract.interface.parseError(err.data);
        decodedError = parsedError ? `${parsedError.name}: ${parsedError.args.join(", ")}` : err.data;
      } catch (decodeErr) {
        console.error("Failed to decode error:", decodeErr);
      }
    }

    return { success: false, error: decodedError };
  }
}

/**
 * Fetch nonce for a user
 */
export async function getNonce(user: string) {
  try {
    if (!ethers.isAddress(user)) {
      throw new Error("Invalid user address");
    }
    console.log(`Fetching nonce for user: ${user}`);
    const nonce: bigint = await gasTopUpContract.nonces(user);
    console.log(`Nonce for ${user}: ${nonce.toString()}`);
    return { success: true, nonce: nonce.toString() };
  } catch (err) {
    console.error("GetNonce failed:", err);
    return { success: false, error: `Failed to fetch nonce: ${err instanceof Error ? err.message : String(err)}` };
  }
}