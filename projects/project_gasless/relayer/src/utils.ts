import { ethers } from "ethers";

export function parseUnits(amount: string, decimals: number) {
  return ethers.parseUnits(amount, decimals);
}

export function formatUnits(amount: bigint, decimals: number) {
  return ethers.formatUnits(amount, decimals);
}
