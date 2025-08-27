import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatsPanel from '../../src/components/game/StatsPanel'

// Mock game state props
const mockGameState = {
  stardust: BigInt(100),
  stardustPerClick: BigInt(2),
  stardustPerSecond: BigInt(5),
  totalClicks: 50,
  credits: BigInt(10),
  prestigeLevel: 1,
  prestigeProgress: 25.5,
}

describe('GameStats Component', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      stardust: 100,
      stardustPerClick: 2,
      stardustPerSecond: 5,
      totalClicks: 50,
      credits: 10,
      prestigeLevel: 1,
      prestigeProgress: 25.5,
      clickStar: jest.fn(),
      purchaseUpgrade: jest.fn(),
      purchaseCredits: jest.fn(),
      prestige: jest.fn(),
      resetGame: jest.fn(),
      loadGame: jest.fn(),
      saveGame: jest.fn(),
    })
  })

  it('renders all game statistics correctly', () => {
    render(<GameStats />)
    
    expect(screen.getByText('100')).toBeInTheDocument() // Stardust
    expect(screen.getByText('2')).toBeInTheDocument() // Per Click
    expect(screen.getByText('5')).toBeInTheDocument() // Per Second
    expect(screen.getByText('50')).toBeInTheDocument() // Total Clicks
    expect(screen.getByText('10')).toBeInTheDocument() // Credits
    expect(screen.getByText('1')).toBeInTheDocument() // Prestige Level
  })

  it('displays progress bar with correct percentage', () => {
    render(<GameStats />)
    
    const progressBar = screen.getByText('25.5%')
    expect(progressBar).toBeInTheDocument()
  })

  it('shows correct stat labels', () => {
    render(<GameStats />)
    
    expect(screen.getByText('Stardust')).toBeInTheDocument()
    expect(screen.getByText('Per Click')).toBeInTheDocument()
    expect(screen.getByText('Per Second')).toBeInTheDocument()
    expect(screen.getByText('Total Clicks')).toBeInTheDocument()
    expect(screen.getByText('Credits')).toBeInTheDocument()
    expect(screen.getByText('Prestige Level')).toBeInTheDocument()
  })
})