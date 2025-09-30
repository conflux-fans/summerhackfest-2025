import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Plus, Image, Star, Wallet, AlertCircle } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import WalletConnectButton from '../components/WalletConnectButton'
import AddVersionModal from '../components/modals/AddVersionModal'
import MintNFTModal from '../components/modals/MintNFTModal'
import EndorseModal from '../components/modals/EndorseModal'
import PageContainer from '../components/PageContainer'

type ActionTab = 'add-version' | 'mint-nft' | 'endorse'

export default function ActionsPage() {
  const { t } = useTranslation()
  const { address } = useWallet()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<ActionTab>('add-version')

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActionTab
    if (tabParam && ['add-version', 'mint-nft', 'endorse'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Auto-open Endorse modal if URL carries target hash/index
  useEffect(() => {
    if (!address) return
    const tabParam = searchParams.get('tab') as ActionTab
    if (tabParam !== 'endorse') return
    const qHash = searchParams.get('hash') || searchParams.get('personHash') || ''
    const qIndexStr = searchParams.get('vi') || searchParams.get('version') || searchParams.get('versionIndex') || ''
    const qIndex = qIndexStr ? parseInt(qIndexStr, 10) : NaN
    if (qHash && Number.isFinite(qIndex) && qIndex > 0) {
      setEndorseModal({ isOpen: true, personHash: qHash, versionIndex: qIndex })
    }
  }, [address, searchParams])

  // Auto-open MintNFT modal if URL carries target hash/index
  useEffect(() => {
    if (!address) return
    const tabParam = searchParams.get('tab') as ActionTab
    if (tabParam !== 'mint-nft') return
    const qHash = searchParams.get('hash') || searchParams.get('personHash') || ''
    const qIndexStr = searchParams.get('vi') || searchParams.get('version') || searchParams.get('versionIndex') || ''
    const qIndex = qIndexStr ? parseInt(qIndexStr, 10) : NaN
    if (qHash && Number.isFinite(qIndex) && qIndex > 0) {
      setMintNFTModal({ isOpen: true, personHash: qHash, versionIndex: qIndex })
    }
  }, [address, searchParams])
  
  // Modal states
  const [addVersionModal, setAddVersionModal] = useState<{
    isOpen: boolean
    personHash?: string
    existingPersonData?: any
  }>({ isOpen: false })
  
  const [mintNFTModal, setMintNFTModal] = useState<{
    isOpen: boolean
    personHash?: string
    versionIndex?: number
    versionData?: any
  }>({ isOpen: false })
  
  const [endorseModal, setEndorseModal] = useState<{
    isOpen: boolean
    personHash?: string
    versionIndex?: number
    versionData?: any
  }>({ isOpen: false })

  const tabs = useMemo(() => [
    {
      id: 'add-version' as ActionTab,
      name: t('actions.add', 'Add'),
      subtitle: t('actions.addVersion', 'Add Version'),
      icon: Plus,
      description: t('actions.addVersionDesc', 'Add a new version of person data with zero-knowledge proofs'),
      color: 'blue'
    },
    {
      id: 'endorse' as ActionTab,
      name: t('actions.endorse', 'Endorse'),
      subtitle: t('actions.endorsement', 'Endorsement'),
      icon: Star,
      description: t('actions.endorseDesc', 'Support quality data by endorsing versions with DEEP tokens'),
      color: 'green'
    },
    {
      id: 'mint-nft' as ActionTab,
      name: t('actions.mint', 'Mint'),
      subtitle: t('actions.mintNFT', 'Mint NFT'),
      icon: Image,
      description: t('actions.mintNFTDesc', 'Convert endorsed person data into valuable NFT collectibles'),
      color: 'purple'
    }
  ], [t])

  // Wallet not connected view
  if (!address) {
    return (
      <PageContainer className="py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Wallet className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('actions.walletRequired', 'Wallet Connection Required')}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {t('actions.walletRequiredDesc', 'Connect your wallet to access blockchain features like adding versions, minting NFTs, and endorsing data.')}
          </p>
          
          <div className="space-y-6">
            <WalletConnectButton className="mx-auto" alwaysShowLabel />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {t('actions.whatYouCanDo', 'What you can do after connecting:')}
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-2">
                    <li className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {t('actions.feature1', 'Add new person versions with privacy protection')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      {t('actions.feature2', 'Mint NFTs from endorsed data')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {t('actions.feature3', 'Endorse quality data and earn rewards')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('actions.title', 'Blockchain Actions')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('actions.subtitle', 'Interact with the DeepFamily protocol using your connected wallet')}
          </p>
        </div>

        {/* Wallet Status removed to avoid duplication with top header */}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSearchParams({ tab: tab.id })
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? `text-${tab.color}-700 dark:text-${tab.color}-300 bg-white dark:bg-gray-700 shadow-sm`
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          {tabs.map((tab) => {
            if (activeTab !== tab.id) return null
            
            const Icon = tab.icon
            
            return (
              <div key={tab.id} className="p-8">
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${tab.color}-100 dark:bg-${tab.color}-900/30 mb-4`}>
                    <Icon className={`w-8 h-8 text-${tab.color}-600 dark:text-${tab.color}-400`} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {tab.subtitle}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    {tab.description}
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  {tab.id === 'add-version' && (
                    <button
                      onClick={() => setAddVersionModal({ isOpen: true })}
                      className={`w-full px-6 py-3 bg-${tab.color}-600 text-white rounded-lg hover:bg-${tab.color}-700 font-medium transition-colors`}
                    >
                      {t('actions.startAddVersion', 'Start Adding Version')}
                    </button>
                  )}

                  {tab.id === 'mint-nft' && (
                    <div className="text-center">
                      <button
                        onClick={() => setMintNFTModal({ 
                          isOpen: true,
                          personHash: undefined,
                          versionIndex: undefined
                        })}
                        className={`w-full px-6 py-3 bg-${tab.color}-600 text-white rounded-lg hover:bg-${tab.color}-700 font-medium transition-colors`}
                      >
                        {t('actions.openMintNFT', 'Open NFT Minting')}
                      </button>
                    </div>
                  )}

                  {tab.id === 'endorse' && (
                    <div className="text-center">
                      <button
                        onClick={() => setEndorseModal({ 
                          isOpen: true,
                          personHash: undefined,
                          versionIndex: undefined
                        })}
                        className={`w-full px-6 py-3 bg-${tab.color}-600 text-white rounded-lg hover:bg-${tab.color}-700 font-medium transition-colors`}
                      >
                        {t('actions.openEndorse', 'Open Endorsement')}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>


        {/* Modals */}
        <AddVersionModal
          isOpen={addVersionModal.isOpen}
          onClose={() => setAddVersionModal({ isOpen: false })}
          onSuccess={(result) => {
            console.log('Version added:', result)
            // Modal will show success message and user can close manually
          }}
          personHash={addVersionModal.personHash}
          existingPersonData={addVersionModal.existingPersonData}
        />

        <MintNFTModal
          isOpen={mintNFTModal.isOpen}
          onClose={() => setMintNFTModal({ isOpen: false })}
          onSuccess={(tokenId) => {
            console.log('NFT minted:', tokenId)
            // Modal will show success message and user can continue minting or close manually
          }}
          personHash={mintNFTModal.personHash}
          versionIndex={mintNFTModal.versionIndex}
          onPersonHashChange={(hash) => setMintNFTModal(prev => ({ ...prev, personHash: hash }))}
          onVersionIndexChange={(index) => setMintNFTModal(prev => ({ ...prev, versionIndex: index }))}
          versionData={mintNFTModal.versionData}
        />

        <EndorseModal
          isOpen={endorseModal.isOpen}
          onClose={() => setEndorseModal({ isOpen: false })}
          onSuccess={(result) => {
            console.log('Endorsement submitted:', result)
            setEndorseModal({ isOpen: false })
          }}
          personHash={endorseModal.personHash}
          versionIndex={endorseModal.versionIndex}
          onPersonHashChange={(hash) => setEndorseModal(prev => ({ ...prev, personHash: hash }))}
          onVersionIndexChange={(index) => setEndorseModal(prev => ({ ...prev, versionIndex: index }))}
          versionData={endorseModal.versionData}
        />
      </div>
    </PageContainer>
  )
}
