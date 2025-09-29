import React from 'react'
import { useTranslation } from 'react-i18next'
import { X, Wallet } from 'lucide-react'
import type { WalletOption } from '../../context/WalletContext'

interface WalletSelectionModalProps {
  isOpen: boolean
  wallets: WalletOption[]
  onSelect: (wallet: WalletOption) => void
  onClose: () => void
}

export default function WalletSelectionModal({
  isOpen,
  wallets,
  onSelect,
  onClose
}: WalletSelectionModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('wallet.selectWallet', 'Select Wallet')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onSelect(wallet)}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                  {wallet.icon ? (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-6 h-6"
                    />
                  ) : (
                    <Wallet className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {wallet.name}
                </span>
              </button>
            ))}
          </div>

          {wallets.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('wallet.noWalletsFound', 'No wallets found')}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {t('wallet.installWallet', 'Please install a wallet extension')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
