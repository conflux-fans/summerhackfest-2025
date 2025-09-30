import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StatsPanel } from '../../src/components/game/StatsPanel'

// Mock the useGameState hook
jest.mock('../../src/hooks/useGameState', () => ({
  useGameState: jest.fn(),
}))

// Mock the formatting utility
jest.mock('../../src/lib/utils/formatting', () => ({
  formatNumber: jest.fn((value) => value.toString()),
}))

import { useGameState } from '../../src/hooks/useGameState'

const mockUseGameState = useGameState as jest.MockedFunction<typeof useGameState>

describe('GameStats Component', () => {
  beforeEach(() => {
    mockUseGameState.mockReturnValue({
      stardust: BigInt(100),
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
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders all game statistics correctly', () => {
    render(<StatsPanel />)
    
    expect(screen.getByText('Statistics')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument() // Stardust
    expect(screen.getByText('2')).toBeInTheDocument() // Per Click
    expect(screen.getByText('5')).toBeInTheDocument() // Per Second
    expect(screen.getByText('50')).toBeInTheDocument() // Total Clicks
    expect(screen.getByText('10')).toBeInTheDocument() // Credits
    expect(screen.getByText('1')).toBeInTheDocument() // Prestige Level
  })

  it('displays progress bar with correct percentage when below prestige requirement', () => {
    mockUseGameState.mockReturnValue({
      stardust: BigInt(500000), // Half of prestige requirement
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
    } as any)

    render(<StatsPanel />)
    
    expect(screen.getByText('Progress to Prestige')).toBeInTheDocument()
    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('shows correct stat labels', () => {
    render(<StatsPanel />)
    
    expect(screen.getByText('Stardust')).toBeInTheDocument()
    expect(screen.getByText('Per Click')).toBeInTheDocument()
    expect(screen.getByText('Per Second')).toBeInTheDocument()
    expect(screen.getByText('Total Clicks')).toBeInTheDocument()
    expect(screen.getByText('Credits')).toBeInTheDocument()
    expect(screen.getByText('Prestige Level')).toBeInTheDocument()
  })

  it('shows prestige button when requirement is met', () => {
    mockUseGameState.mockReturnValue({
      stardust: BigInt(1000000), // Meets prestige requirement
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
    } as any)

    render(<StatsPanel />)
    
    expect(screen.getByText('👑 Activate Prestige')).toBeInTheDocument()
  })

  it('renders all stat icons', () => {
    render(<StatsPanel />)
    
    expect(screen.getByText('✨')).toBeInTheDocument() // Stardust
    expect(screen.getByText('👆')).toBeInTheDocument() // Per Click
    expect(screen.getByText('⏱️')).toBeInTheDocument() // Per Second
    expect(screen.getByText('🎯')).toBeInTheDocument() // Total Clicks
    expect(screen.getByText('💎')).toBeInTheDocument() // Credits
    expect(screen.getByText('👑')).toBeInTheDocument() // Prestige Level
  })
})