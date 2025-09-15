"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { CONFLUX_TESTNET } from "@/lib/constants"
import type { Web3ContextType } from "@/types"

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<any>(null)
  const [signer, setSigner] = useState<any>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConnected = !!account
  const isOnConflux = chainId === CONFLUX_TESTNET.chainId

  const connectWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))

      // Switch to Conflux if not already on it
      if (Number(network.chainId) !== CONFLUX_TESTNET.chainId) {
        await switchToConflux()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchToConflux = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CONFLUX_TESTNET.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${CONFLUX_TESTNET.chainId.toString(16)}`,
                chainName: CONFLUX_TESTNET.name,
                rpcUrls: [CONFLUX_TESTNET.rpcUrl],
                blockExplorerUrls: [CONFLUX_TESTNET.blockExplorer],
                nativeCurrency: CONFLUX_TESTNET.nativeCurrency,
              },
            ],
          })
        } catch (addError: any) {
          throw new Error("Failed to add Conflux network to MetaMask")
        }
      } else {
        throw switchError
      }
    }
  }

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      // Eagerly detect current accounts and chainId without prompting
      (async () => {
        try {
          const currentChainIdHex = await window.ethereum.request({ method: "eth_chainId" })
          if (currentChainIdHex) {
            setChainId(Number.parseInt(currentChainIdHex, 16))
          }
          const currentAccounts: string[] = await window.ethereum.request({ method: "eth_accounts" })
          if (currentAccounts && currentAccounts.length > 0) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum)
            const currentSigner = await browserProvider.getSigner()
            setProvider(browserProvider)
            setSigner(currentSigner)
            setAccount(currentAccounts[0])
          }
        } catch (_) {
          // ignore eager detection failures
        }
      })()

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null)
          setSigner(null)
        } else {
          setAccount(accounts[0])
        }
      })

      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isOnConflux,
    connectWallet,
    switchToConflux,
    loading,
    error,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
