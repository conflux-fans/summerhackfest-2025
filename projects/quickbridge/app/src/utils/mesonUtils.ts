// utils/mesonUtils.ts (unchanged)
import { useContractRead, useWriteContract, usePublicClient } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';
// Token contract addresses per network (for ERC20 approval)
export const TOKEN_CONTRACTS = {
  usdc: {
    base: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    conflux: '0x6963efed0ab40f6c3d7bda44a05dcf1437c44372',
  }
};
// Meson contract address (same on all EVM chains via CREATE2 deployment)
export const MESON_CONTRACT = '0x25aB3Efd52e6470681CE037cD546Dc60726948D3';
// ERC20 ABI snippets for allowance and approve
export const ERC20_ABI = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
];
export const relayerUrl = 'https://relayer.meson.fi/api/v1';
export function extractRawMessage(fullHex: string) {
  if (!fullHex.startsWith('0x')) {
    throw new Error('Invalid hex string');
  }
  const hex = fullHex.slice(2).toLowerCase();
  const prefixHex = '19457468657265756d205369676e6564204d6573736167653a0a'.toLowerCase();
  if (!hex.startsWith(prefixHex)) {
    throw new Error('Invalid message prefix');
  }
  const rest = hex.slice(prefixHex.length);
  let lenStr = '';
  let pos = 0;
  while (pos < rest.length) {
    const byteHex = rest.substr(pos, 2);
    const charCode = parseInt(byteHex, 16);
    const char = String.fromCharCode(charCode);
    if (/\d/.test(char)) {
      lenStr += char;
      pos += 2;
    } else {
      break;
    }
  }
  if (!lenStr) {
    throw new Error('No length found');
  }
  const len = parseInt(lenStr, 10);
  const dataHex = rest.slice(pos, pos + len * 2);
  if (dataHex.length !== len * 2) {
    throw new Error('Message length mismatch');
  }
  return '0x' + dataHex;
}
export function stringToBigInt(value: string, decimals: number): bigint {
  const [intPart, decPart = ''] = value.split('.');
  const paddedDec = decPart.padEnd(decimals, '0').slice(0, decimals);
  const fullInt = intPart + paddedDec;
  return BigInt(fullInt);
}
export async function fetchQuote(from: string, to: string, amount: string, address: string) {
  const response = await fetch(`${relayerUrl}/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, amount, fromAddress: address }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || data.error);
  return data;
}
export async function initiateSwap(from: string, to: string, amount: string, address: string, signMessageAsync: any) {
  const recipient = address;
  const response = await fetch(`${relayerUrl}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, amount, fromAddress: address, recipient }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || data.error);
  const rawMsg = extractRawMessage(data.result.signingRequest.message);
  const signature = await signMessageAsync({ message: { raw: rawMsg } });
  if (!signature) throw new Error('Signing failed');
  const submitResponse = await fetch(`${relayerUrl}/swap/${data.result.encoded}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress: address, recipient, signature }),
  });
  const submitData = await submitResponse.json();
  if (submitData.error) throw new Error(submitData.error.message || submitData.error);
  return { swapId: submitData.result.swapId, tx: data.result.tx };
}
export async function checkStatus(swapId: string) {
  const response = await fetch(`${relayerUrl}/swap/${swapId}`);
  const data = await response.json();
  return data.result.status || 'Pending';
}
export function useTokenApproval(
  tokenId: string,
  fromNetworkId: string,
  amount: string,
  address: string | undefined,
  chainId: number
) {
  const tokenContract = TOKEN_CONTRACTS[tokenId]?.[fromNetworkId] as `0x${string}` | undefined;
  const enabled = !!tokenContract && !!address && tokenId !== 'eth';
  const publicClient = usePublicClient({ chainId });
  const { data: decimals } = useContractRead({
    address: tokenContract,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId,
    enabled,
  });
  const { data: allowance, refetch: allowanceRefetch } = useContractRead({
    address: tokenContract,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, MESON_CONTRACT],
    chainId,
    enabled,
    watch: true,
    pollingInterval: 1000,
  });
  const { writeContractAsync } = useWriteContract();
  const amountWei = amount && enabled && decimals ? stringToBigInt(amount, Number(decimals)) : 0n;
  const needsApproval = enabled && allowance !== undefined && allowance < amountWei;
  const approve = async () => {
    if (!tokenContract || !publicClient) return;
    const hash = await writeContractAsync({
      address: tokenContract,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [MESON_CONTRACT, amountWei],
      chainId,
    });
    await waitForTransactionReceipt(publicClient, { hash });
    await allowanceRefetch();
  };
  return { needsApproval, approve, allowanceRefetch };
}