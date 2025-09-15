import { ethers } from 'ethers'

// Create a JsonRpcProvider using a static network when possible
// This avoids the initial eth_chainId probe which can be rate-limited
export function makeProvider(rpcUrl: string): ethers.JsonRpcProvider {
  const env: any = (import.meta as any).env || {}
  const chainIdRaw = env.VITE_CHAIN_ID
  const name = env.VITE_NETWORK_NAME || undefined
  const chainId = chainIdRaw !== undefined && chainIdRaw !== null && String(chainIdRaw).trim() !== ''
    ? Number(chainIdRaw)
    : undefined

  try {
    if (chainId && Number.isFinite(chainId)) {
      return new ethers.JsonRpcProvider(rpcUrl, { chainId, name: name || String(chainId) })
    }
  } catch {
    // fall through to default provider below
  }
  return new ethers.JsonRpcProvider(rpcUrl)
}

