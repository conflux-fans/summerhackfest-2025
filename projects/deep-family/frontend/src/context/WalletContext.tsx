import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import { useToast } from '../components/ToastProvider'
import { useTranslation } from 'react-i18next'

interface WalletState {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnecting: boolean
  chainId: number | null
  balance: string | null
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
  switchChain: (chainId: number) => Promise<void>
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const toast = useToast()
  
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null,
    isConnecting: false,
    chainId: null,
    balance: null
  })

  const refreshBalance = useCallback(async () => {
    if (!walletState.provider || !walletState.address) return
    
    try {
      const balance = await walletState.provider.getBalance(walletState.address)
      setWalletState(prev => ({
        ...prev,
        balance: ethers.formatEther(balance)
      }))
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }, [walletState.provider, walletState.address])

  const selectEthereumProvider = useCallback((): any | null => {
    if (typeof window === 'undefined' || !window.ethereum) return null
    const eth: any = window.ethereum
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      const metaMask = eth.providers.find((p: any) => p && p.isMetaMask)
      return metaMask || eth.providers[0]
    }
    return eth
  }, [])

  const getBoundProvider = useCallback(() => {
    const eth = selectEthereumProvider()
    if (!eth) return null
    // IMPORTANT: do not bind methods; some providers rely on private brand checks
    // Calling via eth.request / eth.on / eth.removeListener preserves internal context
    return { eth }
  }, [selectEthereumProvider])

  const connect = useCallback(async () => {
    const bound = getBoundProvider()
    if (!bound) {
      toast.show(t('wallet.noMetaMask', 'Please install MetaMask'))
      return
    }

    setWalletState(prev => ({ ...prev, isConnecting: true }))

    try {
      // First request accounts directly from the injected provider to avoid brand/proxy issues
      const accounts = await bound.eth.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned')
      }
      
      const provider = new ethers.BrowserProvider(bound.eth as any)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      
      const newState: WalletState = {
        address,
        provider,
        signer,
        isConnecting: false,
        chainId: Number(network.chainId),
        balance: null
      }
      
      setWalletState(newState)
      
      // Refresh balance after connection
      try {
        const balance = await provider.getBalance(address)
        setWalletState(prev => ({
          ...prev,
          balance: ethers.formatEther(balance)
        }))
      } catch (balanceError) {
        console.warn('Failed to fetch balance:', balanceError)
      }
      
      toast.show(t('wallet.connected', 'Wallet connected successfully'))
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      setWalletState(prev => ({ ...prev, isConnecting: false }))
      
      if (error.code === 4001) {
        toast.show(t('wallet.rejected', 'Connection rejected by user'))
      } else if (error.code === -32002) {
        toast.show(t('wallet.pending', 'Connection request already pending'))
      } else {
        toast.show(t('wallet.connectionFailed', `Failed to connect wallet: ${error.message || 'Unknown error'}`))
      }
    }
  }, [t, toast])

  const disconnect = useCallback(() => {
    setWalletState({
      address: null,
      provider: null,
      signer: null,
      isConnecting: false,
      chainId: null,
      balance: null
    })
    toast.show(t('wallet.disconnected', 'Wallet disconnected'))
  }, [t, toast])

  const switchChain = useCallback(async (targetChainId: number) => {
    const bound = getBoundProvider()
    if (!bound) {
      toast.show(t('wallet.noMetaMask', 'Please install MetaMask'))
      return
    }

    try {
      await bound.eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      
      // Update chain ID in state
      setWalletState(prev => ({
        ...prev,
        chainId: targetChainId
      }))
      
      toast.show(t('wallet.chainSwitched', 'Chain switched successfully'))
    } catch (error: any) {
      console.error('Failed to switch chain:', error)
      if (error.code === 4902) {
        toast.show(t('wallet.chainNotAdded', 'Chain not added to wallet'))
      } else {
        toast.show(t('wallet.chainSwitchFailed', 'Failed to switch chain'))
      }
    }
  }, [t, toast, getBoundProvider])

  // Listen to account and chain changes
  useEffect(() => {
    const bound = getBoundProvider()
    if (!bound) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== walletState.address) {
        // Account changed, refresh signer/address without prompting
        ;(async () => {
          try {
            const provider = new ethers.BrowserProvider(bound.eth as any)
            const signer = await provider.getSigner()
            const address = await signer.getAddress()
            setWalletState(prev => ({ ...prev, provider, signer, address }))
            refreshBalance()
          } catch (e) {
            console.warn('Failed to refresh after account change:', e)
          }
        })()
      }
    }

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16)
      }))
      // Refresh balance on chain change
      if (walletState.address) {
        refreshBalance()
      }
    }

    const handleDisconnect = () => { disconnect() }

    let cleanupAccountsChanged = () => {}
    let cleanupChainChanged = () => {}
    let cleanupDisconnect = () => {}

    let pollTimer: any = null

    const trySubscribe = () => {
      try {
        if (typeof bound.eth.on === 'function') {
          bound.eth.on('accountsChanged', handleAccountsChanged)
          cleanupAccountsChanged = () => { try { bound.eth.removeListener?.('accountsChanged', handleAccountsChanged) } catch {} }
        }
        if (typeof bound.eth.on === 'function') {
          bound.eth.on('chainChanged', handleChainChanged)
          cleanupChainChanged = () => { try { bound.eth.removeListener?.('chainChanged', handleChainChanged) } catch {} }
        }
        if (typeof bound.eth.on === 'function') {
          bound.eth.on('disconnect', handleDisconnect)
          cleanupDisconnect = () => { try { bound.eth.removeListener?.('disconnect', handleDisconnect) } catch {} }
        }
      } catch (error) {
        console.warn('Failed to add wallet listener:', error)
        // Fallback to polling
        pollTimer = setInterval(async () => {
          try {
            const accounts: string[] = await bound.eth.request({ method: 'eth_accounts' })
            if (!accounts || accounts.length === 0) {
              if (walletState.address) disconnect()
            } else if (accounts[0] !== walletState.address) {
              handleAccountsChanged(accounts)
            }
          } catch {}
          try {
            const chainIdHex: string = await bound.eth.request({ method: 'eth_chainId' })
            handleChainChanged(chainIdHex)
          } catch {}
        }, 1500)
      }
    }

    trySubscribe()

    return () => {
      cleanupAccountsChanged()
      cleanupChainChanged()
      cleanupDisconnect()
      if (pollTimer) { try { clearInterval(pollTimer) } catch {} }
    }
  }, [walletState.address, disconnect, refreshBalance, getBoundProvider])

  // Auto-connect if previously connected
  const isAutoConnectDone = useRef(false)
  useEffect(() => {
    if (isAutoConnectDone.current) return
    
    const autoConnect = async () => {
      const bound = getBoundProvider()
      if (!bound) {
        isAutoConnectDone.current = true
        return
      }
      
      try {
        const accounts = await bound.eth.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          // Hydrate state without prompting user
          const provider = new ethers.BrowserProvider(bound.eth as any)
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          const network = await provider.getNetwork()
          setWalletState(prev => ({
            ...prev,
            address,
            provider,
            signer,
            isConnecting: false,
            chainId: Number(network.chainId)
          }))
          try {
            const balance = await provider.getBalance(address)
            setWalletState(prev => ({ ...prev, balance: ethers.formatEther(balance) }))
          } catch {}
        }
        isAutoConnectDone.current = true
      } catch (error) {
        console.warn('Auto-connect failed:', error)
        isAutoConnectDone.current = true
      }
    }

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(autoConnect, 100)
    return () => clearTimeout(timer)
  }, [selectEthereumProvider])

  const contextValue: WalletContextValue = {
    ...walletState,
    connect,
    disconnect,
    switchChain,
    refreshBalance
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}