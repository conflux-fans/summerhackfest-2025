import { useWallet } from '../context/WalletContext'
import { useTranslation } from 'react-i18next'
import { Wallet, LogOut, AlertCircle, ExternalLink } from 'lucide-react'

interface WalletConnectButtonProps {
  className?: string
  showBalance?: boolean
  variant?: 'home' | 'normal'
  alwaysShowLabel?: boolean
}

export default function WalletConnectButton({ 
  className = '', 
  showBalance = true,
  variant = 'normal',
  alwaysShowLabel = false
}: WalletConnectButtonProps) {
  const {
    address,
    balance,
    isConnecting,
    chainId,
    connect,
    disconnect
  } = useWallet()
  
  const { t } = useTranslation()
  const isHomePage = variant === 'home'

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...`
  }

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal)
    if (num < 0.001) return '< 0.001 ETH'
    return `${num.toFixed(3)} ETH`
  }

  const hasEthereum = typeof window !== 'undefined' && !!(window as any).ethereum

  if (!address) {
    // No wallet installed
    if (!hasEthereum) {
      return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
          <button
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            className={`inline-flex items-center gap-1 lg:gap-2 px-2 py-2 lg:px-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm backdrop-blur-sm whitespace-nowrap ${
              isHomePage
                ? 'border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/15'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span className={alwaysShowLabel ? '' : 'hidden lg:inline'}>Install Wallet</span>
          </button>
        </div>
      )
    }

    return (
      <>
        <button
          onClick={connect}
          disabled={isConnecting}
          className={`inline-flex items-center gap-1 lg:gap-2 px-2 py-2 lg:px-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm backdrop-blur-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
            isHomePage
              ? 'border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/15'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 hover:border-gray-300 dark:hover:border-gray-600'
          } ${className}`}
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              <span className={alwaysShowLabel ? '' : 'hidden lg:inline'}>{t('wallet.connecting', 'Connecting...')}</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span className={alwaysShowLabel ? '' : 'hidden lg:inline'}>{t('wallet.connect', 'Connect Wallet')}</span>
            </>
          )}
        </button>
      </>
    )
  }

  // Wrong network indicator - support project deployed networks
  const supportedChainIds = [
    1,         // Ethereum Mainnet
    11155111,  // Sepolia
    17000,     // Holesky
    31337,     // Localhost/Hardhat
    71,        // Conflux eSpace Testnet
    1030,      // Conflux eSpace Mainnet
    137,       // Polygon Mainnet
    80002,     // Polygon Amoy Testnet
    56,        // BSC Mainnet
    97,        // BSC Testnet
    42161,     // Arbitrum Mainnet
    421614,    // Arbitrum Sepolia
    10,        // Optimism Mainnet
    11155420,  // Optimism Sepolia
  ]
  const isWrongNetwork = chainId && !supportedChainIds.includes(chainId)

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {isWrongNetwork && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
          isHomePage
            ? 'bg-yellow-400/20 dark:bg-yellow-500/20 text-yellow-100 dark:text-yellow-200 border border-yellow-400/30 dark:border-yellow-500/30'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
        }`}>
          <AlertCircle className="w-3 h-3" />
          <span>{t('wallet.wrongNetwork', 'Wrong Network')}</span>
        </div>
      )}
      
      <div className={`flex items-center gap-1 lg:gap-2 px-2 py-2 lg:px-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm backdrop-blur-sm ${
        isHomePage 
          ? 'border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/15' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isHomePage ? 'bg-green-300 dark:bg-green-400' : 'bg-green-500'
        }`}></div>
        
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <span className="text-xs lg:text-sm font-mono truncate max-w-20 lg:max-w-24">
            {formatAddress(address)}
          </span>
          
          {showBalance && balance && (
            <span className={`text-xs opacity-75 ${
              isHomePage ? 'text-white/80 dark:text-gray-300/80' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {formatBalance(balance)}
            </span>
          )}
        </div>
        
        <button
          onClick={disconnect}
          className={`p-1 rounded transition-colors ${
            isHomePage 
              ? 'hover:bg-white/20 dark:hover:bg-white/15' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={t('wallet.disconnect', 'Disconnect')}
        >
          <LogOut className={`w-3 h-3 ${
            isHomePage 
              ? 'text-white/70 hover:text-white dark:text-gray-300/70 dark:hover:text-gray-200' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`} />
        </button>
      </div>
    </div>
  )
}
