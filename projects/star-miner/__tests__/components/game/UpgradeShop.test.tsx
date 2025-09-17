import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UpgradeShop } from '../../../src/components/game/UpgradeShop'

// Mock the contexts and hooks
jest.mock('../../../src/contexts/GameStateContext', () => ({
  useGameStateContext: jest.fn(),
}))

jest.mock('../../../src/contexts/WalletContext', () => ({
  useWalletContext: jest.fn(),
}))

jest.mock('../../../src/hooks/useContracts', () => ({
  useContracts: jest.fn(),
}))

jest.mock('../../../src/contexts/ToastContext', () => ({
  useToast: jest.fn(),
}))

// Mock the formatting utility
jest.mock('../../../src/lib/utils/formatting', () => ({
  formatNumber: jest.fn((value) => value.toString()),
}))

// Mock the game mechanics
jest.mock('../../../src/lib/game/mechanics', () => ({
  getUpgradeCost: jest.fn(),
  canAffordUpgrade: jest.fn(),
}))

// Mock constants
jest.mock('../../../src/lib/utils/constants', () => ({
  UPGRADE_CONFIGS: {
    telescope: {
      id: 'telescope',
      name: 'Telescope',
      description: 'A basic telescope to observe distant stars.',
      icon: '🔭',
      baseCost: 10n,
      costMultiplier: 1150,
      stardustPerClick: 1n,
      stardustPerSecond: 0n,
      costType: 'stardust',
      isActive: true,
    },
    starship: {
      id: 'starship',
      name: 'Starship',
      description: 'A powerful starship for harvesting stardust.',
      icon: '🚀',
      baseCost: 10n,
      costMultiplier: 1200,
      stardustPerClick: 50n,
      stardustPerSecond: 25n,
      costType: 'credits',
      isActive: true,
    },
  },
}))

import { useGameStateContext } from '../../../src/contexts/GameStateContext'
import { useWalletContext } from '../../../src/contexts/WalletContext'
import { useContracts } from '../../../src/hooks/useContracts'
import { useToast } from '../../../src/contexts/ToastContext'
import { getUpgradeCost, canAffordUpgrade } from '../../../src/lib/game/mechanics'

const mockUseGameStateContext = useGameStateContext as jest.MockedFunction<typeof useGameStateContext>
const mockUseWalletContext = useWalletContext as jest.MockedFunction<typeof useWalletContext>
const mockUseContracts = useContracts as jest.MockedFunction<typeof useContracts>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>
const mockGetUpgradeCost = getUpgradeCost as jest.MockedFunction<typeof getUpgradeCost>
const mockCanAffordUpgrade = canAffordUpgrade as jest.MockedFunction<typeof canAffordUpgrade>

describe('UpgradeShop Component', () => {
  const mockBuyUpgrade = jest.fn()
  const mockUpdateCredits = jest.fn()
  const mockUpdateWalletConnection = jest.fn()
  const mockPurchaseCredits = jest.fn()
  const mockRefreshBalances = jest.fn()
  const mockShowToast = jest.fn()

  const defaultGameState = {
    stardust: BigInt(1000),
    stardustPerClick: BigInt(2),
    stardustPerSecond: BigInt(5),
    totalClicks: 50,
    credits: BigInt(100),
    prestigeLevel: 1,
    upgrades: {},
    walletConnected: false,
    userAddress: '',
    achievements: [],
    lastSaveTime: Date.now(),
  }

  const defaultWalletState = {
    isConnected: false,
    isCorrectNetwork: false,
    address: '',
  }

  const defaultContractsState = {
    isLoading: false,
    creditsBalance: BigInt(100),
    refreshBalances: mockRefreshBalances,
    purchaseCredits: mockPurchaseCredits,
  }

  beforeEach(() => {
    mockUseGameStateContext.mockReturnValue({
      ...defaultGameState,
      buyUpgrade: mockBuyUpgrade,
      updateCredits: mockUpdateCredits,
      updateWalletConnection: mockUpdateWalletConnection,
    } as any)

    mockUseWalletContext.mockReturnValue(defaultWalletState as any)

    mockUseContracts.mockReturnValue(defaultContractsState as any)

    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
    } as any)

    mockGetUpgradeCost.mockReturnValue(BigInt(10))
    mockCanAffordUpgrade.mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  describe('Rendering', () => {
    it('renders the upgrade shop with title', () => {
      render(<UpgradeShop />)
      
      expect(screen.getByText('🛒 Upgrade Shop')).toBeInTheDocument()
    })

    it('renders tab navigation with stardust and credits tabs', () => {
      render(<UpgradeShop />)
      
      expect(screen.getByText('✨ Stardust Upgrades')).toBeInTheDocument()
      expect(screen.getByText('💎 Credit Upgrades')).toBeInTheDocument()
    })

    it('renders stardust upgrades by default', () => {
      render(<UpgradeShop />)
      
      expect(screen.getByText('Telescope')).toBeInTheDocument()
      expect(screen.getByText('🔭')).toBeInTheDocument()
    })

    it('shows wallet connection info when wallet is not connected', () => {
      render(<UpgradeShop />)
      
      expect(screen.getByText('Blockchain Features')).toBeInTheDocument()
      expect(screen.getByText('Connect your wallet to unlock these features!')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('switches to credits tab when clicked', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      expect(screen.getByText('Starship')).toBeInTheDocument()
      expect(screen.getByText('🚀')).toBeInTheDocument()
    })

    it('shows credits purchase section when on credits tab', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      expect(screen.getByText('Need more Credits?')).toBeInTheDocument()
      expect(screen.getByText('1 CFX = 1000 💎')).toBeInTheDocument()
    })
  })

  describe('Upgrade Items', () => {
    it('displays upgrade information correctly', () => {
      render(<UpgradeShop />)
      
      expect(screen.getByText('Telescope')).toBeInTheDocument()
      expect(screen.getByText('Level 0')).toBeInTheDocument()
      expect(screen.getByText('10 ✨')).toBeInTheDocument()
      expect(screen.getByText('+1 per click')).toBeInTheDocument()
      expect(screen.getByText('+0 per second')).toBeInTheDocument()
    })

    it('shows purchase button when upgrade is affordable', () => {
      mockCanAffordUpgrade.mockReturnValue(true)
      render(<UpgradeShop />)
      
      const purchaseButton = screen.getByText('Purchase')
      expect(purchaseButton).toBeInTheDocument()
      expect(purchaseButton).not.toBeDisabled()
    })

    it('shows cannot afford button when upgrade is not affordable', () => {
      mockCanAffordUpgrade.mockReturnValue(false)
      render(<UpgradeShop />)
      
      const cannotAffordButton = screen.getByText('Cannot Afford')
      expect(cannotAffordButton).toBeInTheDocument()
      expect(cannotAffordButton).toBeDisabled()
    })

    it('calls buyUpgrade when purchase button is clicked', () => {
      mockCanAffordUpgrade.mockReturnValue(true)
      render(<UpgradeShop />)
      
      const purchaseButton = screen.getByText('Purchase')
      fireEvent.click(purchaseButton)
      
      expect(mockBuyUpgrade).toHaveBeenCalledWith('telescope')
    })
  })

  describe('Credits Purchase - Wallet Not Connected', () => {
    it('shows connect wallet message when wallet not connected', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      expect(screen.getByText('Connect Wallet to Purchase')).toBeInTheDocument()
    })

    it('shows CFX input field on credits tab', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      expect(screen.getByLabelText('CFX Amount')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter CFX amount')).toBeInTheDocument()
    })
  })

  describe('Credits Purchase - Wallet Connected', () => {
    beforeEach(() => {
      mockUseWalletContext.mockReturnValue({
        isConnected: true,
        isCorrectNetwork: true,
        address: '0x123',
      } as any)
    })

    it('enables purchase button when wallet is connected and on correct network', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      const purchaseButton = screen.getByText('Purchase Credits with CFX')
      expect(purchaseButton).not.toBeDisabled()
    })

    it('calls purchaseCredits when purchase button is clicked', async () => {
      mockPurchaseCredits.mockResolvedValue('0xabc123')

      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      const cfxInput = screen.getByPlaceholderText('Enter CFX amount')
      fireEvent.change(cfxInput, { target: { value: '1' } })
      
      const purchaseButton = screen.getByText('Purchase Credits with CFX')
      fireEvent.click(purchaseButton)
      
      await waitFor(() => {
        expect(mockPurchaseCredits).toHaveBeenCalledWith('1')
      })
    })

    it('shows success toast after successful purchase', async () => {
      mockPurchaseCredits.mockResolvedValue('0xabc123')

      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      const cfxInput = screen.getByPlaceholderText('Enter CFX amount')
      fireEvent.change(cfxInput, { target: { value: '1' } })
      
      const purchaseButton = screen.getByText('Purchase Credits with CFX')
      fireEvent.click(purchaseButton)
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'success',
          'Credits Purchased!',
          'Successfully purchased 1,000 💎'
        )
      })
    })
  })

  describe('Input Validation', () => {
    it('handles invalid CFX input gracefully', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      const cfxInput = screen.getByPlaceholderText('Enter CFX amount')
      fireEvent.change(cfxInput, { target: { value: 'invalid' } })
      
      expect(screen.getByText('You will receive 0 💎')).toBeInTheDocument()
    })

    it('respects min and max values for CFX input', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      const cfxInput = screen.getByPlaceholderText('Enter CFX amount') as HTMLInputElement
      
      expect(cfxInput.min).toBe('0.01')
      expect(cfxInput.max).toBe('100')
      expect(cfxInput.step).toBe('0.01')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<UpgradeShop />)
      
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      fireEvent.click(creditsTab)
      
      const purchaseButtons = screen.getAllByRole('button')
      expect(purchaseButtons.length).toBeGreaterThan(0)
      
      const cfxInput = screen.getByLabelText('CFX Amount')
      expect(cfxInput).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<UpgradeShop />)
      
      const stardustTab = screen.getByRole('button', { name: /✨ Stardust Upgrades/ })
      const creditsTab = screen.getByRole('button', { name: /💎 Credit Upgrades/ })
      
      expect(stardustTab).toBeInTheDocument()
      expect(creditsTab).toBeInTheDocument()
    })
  })
})