import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { P2ERewards } from '../../src/components/p2e/P2ERewards'

// Mock the hooks
jest.mock('../../src/hooks/useWallet', () => ({
  useWallet: jest.fn(),
}))

jest.mock('../../src/hooks/useContracts', () => ({
  useContracts: jest.fn(),
}))

jest.mock('../../src/hooks/useGameState', () => ({
  useGameState: jest.fn(),
}))

import { useWallet } from '../../src/hooks/useWallet'
import { useContracts } from '../../src/hooks/useContracts'
import { useGameState } from '../../src/hooks/useGameState'

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>
const mockUseContracts = useContracts as jest.MockedFunction<typeof useContracts>
const mockUseGameState = useGameState as jest.MockedFunction<typeof useGameState>

describe('P2ERewards Component', () => {
  const mockExchangeStardust = jest.fn()
  const mockGetRewardPool = jest.fn()
  const mockGetDailyLimit = jest.fn()

  beforeEach(() => {
    mockUseWallet.mockReturnValue({
      isConnected: false,
      address: '',
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchNetwork: jest.fn(),
      isCorrectNetwork: true,
    })

    mockUseContracts.mockReturnValue({
      exchangeStardust: mockExchangeStardust,
      getRewardPool: mockGetRewardPool,
      getDailyLimit: mockGetDailyLimit,
      purchaseCredits: jest.fn(),
      loadGameState: jest.fn(),
      syncGameState: jest.fn(),
      registerPlayer: jest.fn(),
      checkPlayerRegistration: jest.fn(),
    })

    mockUseGameState.mockReturnValue({
      stardust: BigInt(1000),
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: false,
      userAddress: '',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })

    mockGetRewardPool.mockResolvedValue(BigInt(1000000))
    mockGetDailyLimit.mockResolvedValue(BigInt(100))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows connect wallet message when wallet not connected', () => {
    render(<P2ERewards />)
    
    expect(screen.getByText('Connect your wallet to access P2E features')).toBeInTheDocument()
    expect(screen.getByText('Exchange your Stardust for real CFX rewards!')).toBeInTheDocument()
  })

  it('shows P2E interface when wallet is connected', async () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: '0x123...abc',
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchNetwork: jest.fn(),
      isCorrectNetwork: true,
    })

    mockUseGameState.mockReturnValue({
      stardust: BigInt(1000),
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: true,
      userAddress: '0x123...abc',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })

    render(<P2ERewards />)

    await waitFor(() => {
      expect(screen.getByText('Reward Pool')).toBeInTheDocument()
      expect(screen.getByText('Daily Limit')).toBeInTheDocument()
      expect(screen.getByText('Exchange Rate')).toBeInTheDocument()
    })
  })

  it('displays current stardust balance', async () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: '0x123...abc',
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchNetwork: jest.fn(),
      isCorrectNetwork: true,
    })

    mockUseGameState.mockReturnValue({
      stardust: BigInt(5000),
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: true,
      userAddress: '0x123...abc',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })

    render(<P2ERewards />)

    await waitFor(() => {
      expect(screen.getByText('5,000')).toBeInTheDocument()
    })
  })

  it('handles exchange button click', async () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: '0x123...abc',
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchNetwork: jest.fn(),
      isCorrectNetwork: true,
    })

    mockUseGameState.mockReturnValue({
      stardust: BigInt(1000),
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: true,
      userAddress: '0x123...abc',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })

    mockExchangeStardust.mockResolvedValue({ hash: '0xabc123' })

    render(<P2ERewards />)

    await waitFor(() => {
      const exchangeButton = screen.getByText('Exchange for CFX')
      expect(exchangeButton).toBeInTheDocument()
    })

    const exchangeButton = screen.getByText('Exchange for CFX')
    fireEvent.click(exchangeButton)

    await waitFor(() => {
      expect(mockExchangeStardust).toHaveBeenCalled()
    })
  })

  it('shows minimum exchange validation', async () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: '0x123...abc',
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchNetwork: jest.fn(),
      isCorrectNetwork: true,
    })

    mockUseGameState.mockReturnValue({
      stardust: BigInt(10), // Very low amount
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: true,
      userAddress: '0x123...abc',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })

    render(<P2ERewards />)

    await waitFor(() => {
      const exchangeButton = screen.getByText('Exchange for CFX')
      expect(exchangeButton).toBeDisabled()
    })
  })

  it('displays loading state during exchange', async () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: '0x123...abc',
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchNetwork: jest.fn(),
      isCorrectNetwork: true,
    })

    mockUseGameState.mockReturnValue({
      stardust: BigInt(1000),
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: true,
      userAddress: '0x123...abc',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })

    // Mock a delayed response
    mockExchangeStardust.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ hash: '0xabc123' }), 100))
    )

    render(<P2ERewards />)

    await waitFor(() => {
      const exchangeButton = screen.getByText('Exchange for CFX')
      fireEvent.click(exchangeButton)
    })

    expect(screen.getByText('Exchanging...')).toBeInTheDocument()
  })

  it('handles exchange errors gracefully', async () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: '0x123...abc',
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchNetwork: jest.fn(),
      isCorrectNetwork: true,
    })

    mockUseGameState.mockReturnValue({
      stardust: BigInt(1000),
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: true,
      userAddress: '0x123...abc',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })

    mockExchangeStardust.mockRejectedValue(new Error('Transaction failed'))

    render(<P2ERewards />)

    await waitFor(() => {
      const exchangeButton = screen.getByText('Exchange for CFX')
      fireEvent.click(exchangeButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Exchange failed. Please try again.')).toBeInTheDocument()
    })
  })
})