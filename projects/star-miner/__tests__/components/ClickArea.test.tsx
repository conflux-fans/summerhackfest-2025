import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ClickArea } from '../../src/components/game/ClickArea'

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

describe('ClickArea Component', () => {
  const mockClickStar = jest.fn()

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
      clickStar: mockClickStar,
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the clickable star', () => {
    render(<ClickArea />)
    
    const clickableArea = screen.getByRole('button')
    expect(clickableArea).toBeInTheDocument()
  })

  it('displays current stardust and per click values', () => {
    render(<ClickArea />)
    
    expect(screen.getByText('100')).toBeInTheDocument() // Current stardust
    expect(screen.getByText('+2 per click')).toBeInTheDocument() // Per click value
  })

  it('calls clickStar when clicked', () => {
    render(<ClickArea />)
    
    const clickableArea = screen.getByRole('button')
    fireEvent.click(clickableArea)
    
    expect(mockClickStar).toHaveBeenCalledTimes(1)
  })

  it('shows click animation when clicked', () => {
    render(<ClickArea />)
    
    const clickableArea = screen.getByRole('button')
    fireEvent.click(clickableArea)
    
    // Check if animation elements are present
    expect(clickableArea).toHaveClass('transform')
  })

  it('displays the star icon', () => {
    render(<ClickArea />)
    
    // The star should be visible in the component
    const starElement = screen.getByText('⭐')
    expect(starElement).toBeInTheDocument()
  })

  it('handles multiple rapid clicks', () => {
    render(<ClickArea />)
    
    const clickableArea = screen.getByRole('button')
    
    // Simulate rapid clicking
    fireEvent.click(clickableArea)
    fireEvent.click(clickableArea)
    fireEvent.click(clickableArea)
    
    expect(mockClickStar).toHaveBeenCalledTimes(3)
  })

  it('has proper accessibility attributes', () => {
    render(<ClickArea />)
    
    const clickableArea = screen.getByRole('button')
    expect(clickableArea).toHaveAttribute('aria-label')
  })

  it('updates display when stardust changes', () => {
    const { rerender } = render(<ClickArea />)
    
    expect(screen.getByText('100')).toBeInTheDocument()
    
    // Update mock to return different stardust value
    mockUseGameState.mockReturnValue({
      stardust: BigInt(150),
      stardustPerClick: BigInt(2),
      stardustPerSecond: BigInt(5),
      totalClicks: 51,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: false,
      userAddress: '',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: mockClickStar,
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })
    
    rerender(<ClickArea />)
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('updates per click display when upgraded', () => {
    const { rerender } = render(<ClickArea />)
    
    expect(screen.getByText('+2 per click')).toBeInTheDocument()
    
    // Update mock to return higher per click value
    mockUseGameState.mockReturnValue({
      stardust: BigInt(100),
      stardustPerClick: BigInt(5),
      stardustPerSecond: BigInt(5),
      totalClicks: 50,
      credits: BigInt(10),
      prestigeLevel: 1,
      upgrades: {},
      walletConnected: false,
      userAddress: '',
      achievements: [],
      lastSaveTime: Date.now(),
      clickStar: mockClickStar,
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })
    
    rerender(<ClickArea />)
    expect(screen.getByText('+5 per click')).toBeInTheDocument()
  })
})