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

export interface WalletOption {
  id: string
  name: string
  icon: string
  provider: any
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>
  connectWithProvider: (provider: any) => Promise<void>
  disconnect: () => void
  switchChain: (chainId: number) => Promise<void>
  refreshBalance: () => Promise<void>
  getAvailableWallets: () => WalletOption[]
  showWalletSelection: boolean
  setShowWalletSelection: (show: boolean) => void
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

  const [showWalletSelection, setShowWalletSelection] = useState(false)

  const refreshBalance = useCallback(async () => {
    if (!walletState.provider || !walletState.address) return
    
    try {
      const balance = await walletState.provider.getBalance(walletState.address)
      setWalletState(prev => ({
        ...prev,
        balance: ethers.formatEther(balance)
      }))
    } catch (error) {
      console.error('[WalletContext] Failed to fetch balance:', error)
    }
  }, [walletState.provider, walletState.address])

  const getAvailableWallets = useCallback((): WalletOption[] => {
    if (typeof window === 'undefined') return []

    const wallets: WalletOption[] = []

    // Check for ethereum providers
    const eth: any = window.ethereum
    const conflux: any = (window as any).conflux

    console.log('[WalletContext] Detecting wallet providers:', {
      hasEthereum: !!eth,
      hasConflux: !!conflux,
      isMetaMask: eth?.isMetaMask,
      isFluent: eth?.isFluent,
      confluxFluent: conflux?.isFluent,
      ethKeys: eth ? Object.keys(eth) : [],
      providers: eth?.providers
    })

    if (!eth && !conflux) {
      console.log('[WalletContext] No wallet providers found')
      return []
    }

    // Check for multiple providers (when multiple wallets are installed)
    if (Array.isArray(eth?.providers) && eth.providers.length > 0) {
      console.log('[WalletContext] Multiple providers detected:', eth.providers.length)

      eth.providers.forEach((provider: any, index: number) => {
        console.log(`[WalletContext] Provider ${index}:`, {
          isMetaMask: provider?.isMetaMask,
          isFluent: provider?.isFluent,
          constructor: provider?.constructor?.name
        })

        if (provider && provider.isMetaMask && !provider.isFluent) {
          console.log('[WalletContext] MetaMask detected in providers array')
          wallets.push({
            id: 'metamask',
            name: 'MetaMask',
            icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
            provider: provider
          })
        } else if (provider && (provider.isFluent || provider.isFluentWallet)) {
          console.log('[WalletContext] Fluent Wallet detected in providers array')
          wallets.push({
            id: 'fluent',
            name: 'Fluent Wallet',
            icon: 'https://fluentwallet.com/assets/logo.b3425fdb.svg',
            provider: provider
          })
        }
      })
    } else if (eth) {
      // Single ethereum provider or no providers array
      console.log('[WalletContext] Single ethereum provider detected')

      if (eth.isMetaMask && !eth.isFluent) {
        console.log('[WalletContext] MetaMask detected')
        wallets.push({
          id: 'metamask',
          name: 'MetaMask',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjY4NTFCIi8+CjxwYXRoIGQ9Ik0yNS4xIDkuN0wyMC4yIDYuMkMxOS44IDUuOSAxOS4zIDUuOSAxOC45IDYuMkwxNi4xIDguNUMxNS45IDguNyAxNS42IDguNyAxNS40IDguNUwxMi42IDYuMkMxMi4yIDUuOSAxMS43IDUuOSAxMS4zIDYuMkw2LjQgOS43QzYgMTAgNi4xIDEwLjcgNi42IDEwLjlMMTAuNSAxMi44QzEwLjcgMTIuOSAxMC44IDEzLjEgMTAuOCAxMy4zVjE2LjZDMTAuOCAxNi44IDEwLjkgMTcgMTEuMSAxNy4xTDEzLjkgMTguOEMxNC4xIDE4LjkgMTQuMyAxOC44IDE0LjMgMTguNlYxNS43QzE0LjMgMTUuNSAxNC41IDE1LjMgMTQuNyAxNS4zSDE3QzE3LjIgMTUuMyAxNy40IDE1LjUgMTcuNCAxNS43VjE4LjZDMTcuNCAxOC4gMTcuNiAxOC45IDE3LjggMTguOEwyMC42IDE3LjFDMjAuOCAxNyAyMC45IDE2LjggMjAuOSAxNi42VjEzLjNDMjAuOSAxMy4xIDIxIDEyLjkgMjEuMiAxMi44TDI1LjEgMTAuOUMyNS42IDEwLjcgMjUuNyAxMCAyNS4xIDkuN1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
          provider: eth
        })
      } else if (eth.isFluent || eth.isFluentWallet) {
        console.log('[WalletContext] Fluent Wallet detected via ethereum provider')
        wallets.push({
          id: 'fluent',
          name: 'Fluent Wallet',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMzYzOEJBIi8+CjxwYXRoIGQ9Ik0yMCA4TDEyIDhDMTAuOSA4IDEwIDguOSAxMCAxMEwxMCAyMkMxMCAyMy4xIDEwLjkgMjQgMTIgMjRMMjAgMjRDMjEuMSAyNCAyMiAyMy4xIDIyIDIyTDIyIDEwQzIyIDguOSAyMS4xIDggMjAgOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
          provider: eth
        })
      }
    }

    // Check for Conflux provider (Fluent Wallet)
    if (conflux && !wallets.find(w => w.id === 'fluent')) {
      console.log('[WalletContext] Fluent Wallet detected via conflux provider')
      wallets.push({
        id: 'fluent',
        name: 'Fluent Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMzYzOEJBIi8+CjxwYXRoIGQ9Ik0yMCA4TDEyIDhDMTAuOSA4IDEwIDguOSAxMCAxMEwxMCAyMkMxMCAyMy4xIDEwLjkgMjQgMTIgMjRMMjAgMjRDMjEuMSAyNCAyMiAyMy4xIDIyIDIyTDIyIDEwQzIyIDguOSAyMS4xIDggMjAgOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
        provider: conflux
      })
    }

    console.log('[WalletContext] Available wallets found:', wallets.map(w => w.name))
    return wallets
  }, [])

  const getBoundProvider = useCallback((provider?: any) => {
    if (provider) {
      return { eth: provider }
    }

    const wallets = getAvailableWallets()
    if (wallets.length === 0) return null

    // If only one wallet, use it directly
    if (wallets.length === 1) {
      return { eth: wallets[0].provider }
    }

    // Multiple wallets available, will need selection
    return null
  }, [getAvailableWallets])

  const connectWithProvider = useCallback(async (selectedProvider: any) => {
    console.log('[WalletContext] ConnectWithProvider called with:', {
      selectedProvider: selectedProvider,
      isMetaMask: selectedProvider?.isMetaMask,
      isFluent: selectedProvider?.isFluent,
      constructor: selectedProvider?.constructor?.name,
      keys: Object.keys(selectedProvider || {})
    })

    // Use the selected provider directly instead of getBoundProvider
    if (!selectedProvider) {
      toast.show(t('wallet.noWallet', 'Wallet not available'))
      return
    }

    console.log('[WalletContext] Using selected provider directly:', {
      provider: selectedProvider,
      isMetaMask: selectedProvider?.isMetaMask,
      isFluent: selectedProvider?.isFluent
    })

    setWalletState(prev => ({ ...prev, isConnecting: true }))

    try {
      // Use the selected provider directly to avoid interception
      const accounts = await selectedProvider.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned')
      }

      const provider = new ethers.BrowserProvider(selectedProvider as any)
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

      console.log('[WalletContext] Wallet connected successfully:', { address, chainId: Number(network.chainId) })
      toast.show(t('wallet.connected', 'Wallet connected successfully'))
    } catch (error: any) {
      console.error('[WalletContext] Failed to connect wallet:', error)
      setWalletState(prev => ({ ...prev, isConnecting: false }))

      if (error.code === 4001) {
        toast.show(t('wallet.rejected', 'Connection rejected by user'))
      } else if (error.code === -32002) {
        toast.show(t('wallet.pending', 'Connection request already pending'))
      } else {
        toast.show(t('wallet.connectionFailed', `Failed to connect wallet: ${error.message || 'Unknown error'}`))
      }
    }
  }, [t, toast, getBoundProvider])

  const connect = useCallback(async () => {
    const wallets = getAvailableWallets()
    console.log('[WalletContext] Connect initiated, wallets available:', wallets.length)

    if (wallets.length === 0) {
      console.log('[WalletContext] No wallets available for connection')
      toast.show(t('wallet.noWallet', 'Please install a wallet extension'))
      return
    }

    if (wallets.length === 1) {
      console.log('[WalletContext] Single wallet detected, connecting directly:', wallets[0].name)
      await connectWithProvider(wallets[0].provider)
    } else {
      console.log('[WalletContext] Multiple wallets detected, showing selection modal')
      setShowWalletSelection(true)
    }
  }, [t, toast, getAvailableWallets, connectWithProvider])

  const disconnect = useCallback(() => {
    let shouldNotify = false

    setWalletState(prev => {
      const wasConnected = !!(prev.address || prev.provider || prev.signer)
      if (!wasConnected) {
        return prev
      }

      shouldNotify = true
      return {
        address: null,
        provider: null,
        signer: null,
        isConnecting: false,
        chainId: null,
        balance: null
      }
    })

    if (shouldNotify) {
      console.log('[WalletContext] Disconnecting wallet')
      toast.show(t('wallet.disconnected', 'Wallet disconnected'))
    }
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
      
      console.log('[WalletContext] Chain switched successfully to:', targetChainId)
      // Update chain ID in state
      setWalletState(prev => ({
        ...prev,
        chainId: targetChainId
      }))

      toast.show(t('wallet.chainSwitched', 'Chain switched successfully'))
    } catch (error: any) {
      console.error('[WalletContext] Failed to switch chain:', error)
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
        } else {
          console.log('[WalletContext] No previously connected accounts found')
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
  }, [getAvailableWallets])

  const contextValue: WalletContextValue = {
    ...walletState,
    connect,
    connectWithProvider,
    disconnect,
    switchChain,
    refreshBalance,
    getAvailableWallets,
    showWalletSelection,
    setShowWalletSelection
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
