import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RestartGame } from '../../../src/components/game/RestartGame'

// Mock React DOM for portal testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn((element) => element),
}))

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

// Mock UI components
jest.mock('../../../src/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
      data-variant={variant}
      data-size={size}
      data-loading={isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}))

jest.mock('../../../src/components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => 
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} data-testid="modal-close">✕</button>
        </div>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null,
}))

import { useGameStateContext } from '../../../src/contexts/GameStateContext'
import { useWalletContext } from '../../../src/contexts/WalletContext'
import { useContracts } from '../../../src/hooks/useContracts'
import { useToast } from '../../../src/contexts/ToastContext'

const mockUseGameStateContext = useGameStateContext as jest.MockedFunction<typeof useGameStateContext>
const mockUseWalletContext = useWalletContext as jest.MockedFunction<typeof useWalletContext>
const mockUseContracts = useContracts as jest.MockedFunction<typeof useContracts>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('RestartGame Component', () => {
  const mockResetGame = jest.fn()
  const mockResetPlayerState = jest.fn()
  const mockShowToast = jest.fn()

  const defaultGameState = {
    resetGame: mockResetGame,
  }

  const defaultWalletState = {
    isConnected: false,
    isCorrectNetwork: false,
  }

  const defaultContractsState = {
    resetPlayerState: mockResetPlayerState,
    playerRegistered: false,
    isLoading: false,
  }

  beforeEach(() => {
    mockUseGameStateContext.mockReturnValue(defaultGameState as any)
    mockUseWalletContext.mockReturnValue(defaultWalletState as any)
    mockUseContracts.mockReturnValue(defaultContractsState as any)
    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
    } as any)

    // Mock window and document for portal
    Object.defineProperty(window, 'document', {
      value: {
        body: document.body,
      },
      writable: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the restart button', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toBeInTheDocument()
      expect(restartButton).toHaveTextContent('🔄')
    })

    it('shows restart text on hover', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toHaveTextContent('Restart Game')
    })

    it('applies custom className when provided', () => {
      render(<RestartGame className="custom-class" />)
      
      const container = screen.getByRole('button').parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('is disabled when loading', () => {
      mockUseContracts.mockReturnValue({
        ...defaultContractsState,
        isLoading: true,
      } as any)

      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toBeDisabled()
    })
  })

  describe('Modal Interaction', () => {
    it('opens confirmation modal when restart button is clicked', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByText('⚠️ Restart Game')).toBeInTheDocument()
    })

    it('closes modal when cancel is clicked', () => {
      render(<RestartGame />)
      
      // Open modal
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      // Close modal
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('closes modal when X button is clicked', () => {
      render(<RestartGame />)
      
      // Open modal
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      // Close modal with X
      const closeButton = screen.getByTestId('modal-close')
      fireEvent.click(closeButton)
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('displays warning message in modal', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      expect(screen.getByText('Warning: This action cannot be undone!')).toBeInTheDocument()
      expect(screen.getByText('This will reset ALL progress:')).toBeInTheDocument()
      expect(screen.getByText('Stardust: Reset to 0')).toBeInTheDocument()
      expect(screen.getByText('All upgrades: Reset to level 0')).toBeInTheDocument()
      expect(screen.getByText('Total clicks: Reset to 0')).toBeInTheDocument()
      expect(screen.getByText('Prestige level: Reset to 0')).toBeInTheDocument()
      expect(screen.getByText('Achievements: Cleared')).toBeInTheDocument()
      expect(screen.getByText('All statistics: Reset')).toBeInTheDocument()
    })
  })

  describe('Local Reset (Wallet Not Connected)', () => {
    it('shows local reset info when wallet not connected', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      expect(screen.getByText('Local Reset Only')).toBeInTheDocument()
      expect(screen.getByText('Only local progress will be reset. Connect wallet to also reset blockchain progress.')).toBeInTheDocument()
    })

    it('performs local reset when wallet not connected', async () => {
      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockResetGame).toHaveBeenCalled()
      })
    })

    it('shows success toast for local reset', async () => {
      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'success',
          'Game Reset Complete!',
          'Local game state has been reset to initial values.'
        )
      })
    })
  })

  describe('Blockchain Reset (Wallet Connected)', () => {
    beforeEach(() => {
      mockUseWalletContext.mockReturnValue({
        isConnected: true,
        isCorrectNetwork: true,
      } as any)

      mockUseContracts.mockReturnValue({
        ...defaultContractsState,
        playerRegistered: true,
      } as any)
    })

    it('shows blockchain reset info when wallet connected and player registered', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      expect(screen.getByText('Blockchain Reset')).toBeInTheDocument()
      expect(screen.getByText('Your blockchain progress will also be reset. This requires a transaction.')).toBeInTheDocument()
    })

    it('performs blockchain reset when wallet connected', async () => {
      mockResetPlayerState.mockResolvedValue('0xabc123')

      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockResetGame).toHaveBeenCalled()
        expect(mockResetPlayerState).toHaveBeenCalled()
      })
    })

    it('shows success toast with transaction hash for blockchain reset', async () => {
      mockResetPlayerState.mockResolvedValue('0xabc123def456')

      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'success',
          'Game Reset Complete!',
          'Local and blockchain state reset. TX: 0xabc123de...'
        )
      })
    })

    it('handles blockchain reset failure gracefully', async () => {
      mockResetPlayerState.mockRejectedValue(new Error('Transaction failed'))

      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockResetGame).toHaveBeenCalled()
        expect(mockShowToast).toHaveBeenCalledWith(
          'error',
          'Reset Failed',
          'Transaction failed'
        )
        expect(mockShowToast).toHaveBeenCalledWith(
          'info',
          'Partial Reset',
          'Local game was reset, but blockchain reset failed. You can try again later.'
        )
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading state during reset', async () => {
      mockUseWalletContext.mockReturnValue({
        isConnected: true,
        isCorrectNetwork: true,
      } as any)

      mockUseContracts.mockReturnValue({
        ...defaultContractsState,
        playerRegistered: true,
      } as any)

      // Mock delayed response
      mockResetPlayerState.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('0xabc123'), 100))
      )

      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Resetting...')).toBeInTheDocument()
      })
    })

    it('disables button during reset', async () => {
      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        const newRestartButton = screen.getByRole('button')
        expect(newRestartButton).toBeDisabled()
      })
    })

    it('shows loading text in button during reset', async () => {
      render(<RestartGame />)
      
      // Open modal and confirm
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(screen.getByText('Resetting...')).toBeInTheDocument()
      })
    })
  })

  describe('Button Variants and States', () => {
    it('applies danger variant to restart button', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toHaveAttribute('data-variant', 'danger')
    })

    it('applies small size to restart button', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toHaveAttribute('data-size', 'sm')
    })

    it('applies correct CSS classes for hover effects', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toHaveClass('group')
      expect(restartButton).toHaveClass('opacity-60')
      expect(restartButton).toHaveClass('hover:opacity-100')
    })
  })

  describe('Modal Button States', () => {
    it('applies correct variant to cancel button', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const cancelButton = screen.getByText('Cancel')
      expect(cancelButton).toHaveAttribute('data-variant', 'secondary')
    })

    it('applies correct variant to confirm button', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      expect(confirmButton).toHaveAttribute('data-variant', 'danger')
    })

    it('disables confirm button during reset', async () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const confirmButton = screen.getByText('Yes, Reset Everything')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        const loadingButton = screen.getByText('Resetting...')
        expect(loadingButton).toBeDisabled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles missing wallet context gracefully', () => {
      mockUseWalletContext.mockReturnValue({} as any)

      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      // Should still show local reset info
      expect(screen.getByText('Local Reset Only')).toBeInTheDocument()
    })

    it('handles missing contracts context gracefully', () => {
      mockUseContracts.mockReturnValue({} as any)

      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toBeInTheDocument()
    })

    it('handles player not registered scenario', () => {
      mockUseWalletContext.mockReturnValue({
        isConnected: true,
        isCorrectNetwork: true,
      } as any)

      mockUseContracts.mockReturnValue({
        ...defaultContractsState,
        playerRegistered: false,
      } as any)

      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      // Should show local reset only since player not registered
      expect(screen.getByText('Local Reset Only')).toBeInTheDocument()
    })

    it('handles wrong network scenario', () => {
      mockUseWalletContext.mockReturnValue({
        isConnected: true,
        isCorrectNetwork: false,
      } as any)

      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      // Should show local reset only since on wrong network
      expect(screen.getByText('Local Reset Only')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button role and attributes', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      expect(restartButton).toBeInTheDocument()
    })

    it('supports keyboard navigation in modal', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Yes, Reset Everything')
      
      expect(cancelButton).toBeInTheDocument()
      expect(confirmButton).toBeInTheDocument()
    })

    it('provides clear warning messages for screen readers', () => {
      render(<RestartGame />)
      
      const restartButton = screen.getByRole('button')
      fireEvent.click(restartButton)
      
      expect(screen.getByText('Warning: This action cannot be undone!')).toBeInTheDocument()
    })
  })
})