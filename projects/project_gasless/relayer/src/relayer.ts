import { ethers } from "ethers";
import { GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI, RELAYER_PRIVATE_KEY, RPC_URL } from "./config.js";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
const gasTopUpContract = new ethers.Contract(GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI, relayerWallet);

export async function handleMetaSwap(request: {
  user: string;
  tokenAddress: string;
  amount: string;
  nonce: number;
  deadline: number;
  signature: string;
  updateData: string[];
  maxAge: number;
}) {
  const { user, tokenAddress, amount, nonce, deadline, signature, updateData, maxAge } = request;

  try {
    const tx = await gasTopUpContract.metaSwap!(
        user,
        tokenAddress,
        BigInt(amount),
        deadline,
        signature,
        updateData,
        maxAge,
        { value: 0n } 
      );
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.transactionHash };
  } catch (err) {
    console.error("MetaSwap relayer error:", err);
    return { success: false, error: (err as any).message };
  }
}
