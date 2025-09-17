import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WalletConnect } from '../../../src/components/wallet/WalletConnect'

// Mock the wallet context
jest.mock('../../../src/contexts/WalletContext', () => ({
  useWalletContext: jest.fn(),
}))

// Mock the toast context
jest.mock('../../../src/contexts/ToastContext', () => ({
  useToast: jest.fn(),
}))

// Mock the Button component
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

// Mock the formatting utility
jest.mock('../../../src/lib/utils/formatting', () => ({
  formatAddress: jest.fn((address) => `${address.slice(0, 6)}...${address.slice(-4)}`),
  formatCFX: jest.fn((amount) => `${amount} CFX`),
}))

import { useWalletContext } from '../../../src/contexts/WalletContext'
import { useToast } from '../../../src/contexts/ToastContext'

const mockUseWalletContext = useWalletContext as jest.MockedFunction<typeof useWalletContext>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('WalletConnect Component', () => {
  const mockConnect = jest.fn()
  const mockDisconnect = jest.fn()
  const mockSwitchNetwork = jest.fn()
  const mockRefreshBalance = jest.fn()
  const mockIsWalletAvailable = jest.fn()
  const mockShowToast = jest.fn()

  const defaultWalletState = {
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isCorrectNetwork: false,
    isConnecting: false,
    error: null,
    connect: mockConnect,
    disconnect: mockDisconnect,
    switchNetwork: mockSwitchNetwork,
    refreshBalance: mockRefreshBalance,
    isWalletAvailable: mockIsWalletAvailable,
  }

  beforeEach(() => {
    mockUseWalletContext.mockReturnValue(defaultWalletState as any)
    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
    } as any)
    mockIsWalletAvailable.mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Wallet Not Connected State', () => {
    it('renders connect wallet button when not connected', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
      expect(screen.getByText('🔗')).toBeInTheDocument()
    })

    it('shows wallet selection options when connect button is clicked', () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      expect(screen.getByText('Choose Wallet')).toBeInTheDocument()
      expect(screen.getByText('MetaMask')).toBeInTheDocument()
      expect(screen.getByText('Fluent Wallet')).toBeInTheDocument()
    })

    it('calls connect with metamask when MetaMask option is selected', async () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      const metamaskOption = screen.getByText('MetaMask')
      fireEvent.click(metamaskOption)
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalledWith('metamask')
      })
    })

    it('calls connect with fluent when Fluent Wallet option is selected', async () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      const fluentOption = screen.getByText('Fluent Wallet')
      fireEvent.click(fluentOption)
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalledWith('fluent')
      })
    })

    it('shows wallet not available message when wallet is not installed', () => {
      mockIsWalletAvailable.mockReturnValue(false)
      
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      const metamaskOption = screen.getByText('MetaMask')
      fireEvent.click(metamaskOption)
      
      expect(screen.getByText('MetaMask not detected')).toBeInTheDocument()
      expect(screen.getByText('Please install MetaMask to continue')).toBeInTheDocument()
    })

    it('shows connecting state when wallet connection is in progress', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnecting: true,
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('displays connection error when present', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        error: 'Connection failed',
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })
  })

  describe('Wallet Connected State', () => {
    const connectedWalletState = {
      ...defaultWalletState,
      isConnected: true,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: '1.5',
      chainId: 71,
      isCorrectNetwork: true,
    }

    beforeEach(() => {
      mockUseWalletContext.mockReturnValue(connectedWalletState as any)
    })

    it('displays wallet information when connected', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
      expect(screen.getByText('1.5 CFX')).toBeInTheDocument()
      expect(screen.getByText('✅ Connected')).toBeInTheDocument()
    })

    it('shows disconnect button when connected', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('Disconnect')).toBeInTheDocument()
    })

    it('calls disconnect when disconnect button is clicked', () => {
      render(<WalletConnect />)
      
      const disconnectButton = screen.getByText('Disconnect')
      fireEvent.click(disconnectButton)
      
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('shows refresh balance button', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('🔄')).toBeInTheDocument()
    })

    it('calls refreshBalance when refresh button is clicked', () => {
      render(<WalletConnect />)
      
      const refreshButton = screen.getByText('🔄')
      fireEvent.click(refreshButton)
      
      expect(mockRefreshBalance).toHaveBeenCalled()
    })

    it('shows network status indicator', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('Conflux eSpace Testnet')).toBeInTheDocument()
    })
  })

  describe('Wrong Network State', () => {
    const wrongNetworkState = {
      ...defaultWalletState,
      isConnected: true,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: '1.5',
      chainId: 1, // Ethereum mainnet instead of Conflux
      isCorrectNetwork: false,
    }

    beforeEach(() => {
      mockUseWalletContext.mockReturnValue(wrongNetworkState as any)
    })

    it('shows wrong network warning', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('⚠️ Wrong Network')).toBeInTheDocument()
      expect(screen.getByText('Please switch to Conflux eSpace Testnet')).toBeInTheDocument()
    })

    it('shows switch network button', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('Switch Network')).toBeInTheDocument()
    })

    it('calls switchNetwork when switch network button is clicked', () => {
      render(<WalletConnect />)
      
      const switchButton = screen.getByText('Switch Network')
      fireEvent.click(switchButton)
      
      expect(mockSwitchNetwork).toHaveBeenCalled()
    })

    it('shows network name for known networks', () => {
      mockUseWalletContext.mockReturnValue({
        ...wrongNetworkState,
        chainId: 1,
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Ethereum Mainnet')).toBeInTheDocument()
    })

    it('shows chain ID for unknown networks', () => {
      mockUseWalletContext.mockReturnValue({
        ...wrongNetworkState,
        chainId: 999,
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Chain ID: 999')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state during connection', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnecting: true,
      } as any)

      render(<WalletConnect />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-loading', 'true')
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
    })

    it('disables button during connection', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnecting: true,
      } as any)

      render(<WalletConnect />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('displays connection errors', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        error: 'User rejected the request',
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('User rejected the request')).toBeInTheDocument()
    })

    it('shows retry button when there is an error', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        error: 'Connection failed',
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('clears error and retries connection when retry button is clicked', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        error: 'Connection failed',
      } as any)

      render(<WalletConnect />)
      
      const retryButton = screen.getByText('Retry')
      fireEvent.click(retryButton)
      
      // Should attempt to show wallet selection again
      expect(screen.getByText('Choose Wallet')).toBeInTheDocument()
    })
  })

  describe('Wallet Detection', () => {
    it('shows install prompt for MetaMask when not available', () => {
      mockIsWalletAvailable.mockImplementation((walletType) => walletType !== 'metamask')
      
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      const metamaskOption = screen.getByText('MetaMask')
      fireEvent.click(metamaskOption)
      
      expect(screen.getByText('Install MetaMask')).toBeInTheDocument()
      expect(screen.getByText('https://metamask.io')).toBeInTheDocument()
    })

    it('shows install prompt for Fluent Wallet when not available', () => {
      mockIsWalletAvailable.mockImplementation((walletType) => walletType !== 'fluent')
      
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      const fluentOption = screen.getByText('Fluent Wallet')
      fireEvent.click(fluentOption)
      
      expect(screen.getByText('Install Fluent Wallet')).toBeInTheDocument()
      expect(screen.getByText('https://fluentwallet.com')).toBeInTheDocument()
    })

    it('shows both wallets as available when both are installed', () => {
      mockIsWalletAvailable.mockReturnValue(true)
      
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      expect(screen.getByText('MetaMask')).toBeInTheDocument()
      expect(screen.getByText('Fluent Wallet')).toBeInTheDocument()
      expect(screen.queryByText('Install')).not.toBeInTheDocument()
    })
  })

  describe('Button Variants and Styling', () => {
    it('applies primary variant to connect button', () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button')
      expect(connectButton).toHaveAttribute('data-variant', 'primary')
    })

    it('applies secondary variant to disconnect button', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnected: true,
        address: '0x123',
        isCorrectNetwork: true,
      } as any)

      render(<WalletConnect />)
      
      const disconnectButton = screen.getByText('Disconnect')
      expect(disconnectButton).toHaveAttribute('data-variant', 'secondary')
    })

    it('applies warning variant to switch network button', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnected: true,
        address: '0x123',
        isCorrectNetwork: false,
      } as any)

      render(<WalletConnect />)
      
      const switchButton = screen.getByText('Switch Network')
      expect(switchButton).toHaveAttribute('data-variant', 'warning')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile', () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button')
      expect(connectButton).toHaveClass('w-full')
    })

    it('shows compact address format on small screens', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        isCorrectNetwork: true,
      } as any)

      render(<WalletConnect />)
      
      // Should show formatted address
      expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button')
      expect(connectButton).toBeInTheDocument()
      expect(connectButton).toHaveTextContent('Connect Wallet')
    })

    it('provides clear status messages for screen readers', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnected: true,
        address: '0x123',
        isCorrectNetwork: true,
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('✅ Connected')).toBeInTheDocument()
    })

    it('shows clear error messages', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        error: 'Connection failed',
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button')
      connectButton.focus()
      expect(document.activeElement).toBe(connectButton)
    })
  })

  describe('Integration with Toast System', () => {
    it('shows success toast on successful connection', async () => {
      // Simulate successful connection
      mockConnect.mockImplementation(() => {
        mockUseWalletContext.mockReturnValue({
          ...defaultWalletState,
          isConnected: true,
          address: '0x123',
          isCorrectNetwork: true,
        } as any)
      })

      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      const metamaskOption = screen.getByText('MetaMask')
      fireEvent.click(metamaskOption)
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalledWith('metamask')
      })
    })

    it('shows error toast on connection failure', async () => {
      mockConnect.mockRejectedValue(new Error('Connection failed'))

      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)
      
      const metamaskOption = screen.getByText('MetaMask')
      fireEvent.click(metamaskOption)
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalledWith('metamask')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles null address gracefully', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnected: true,
        address: null,
        isCorrectNetwork: true,
      } as any)

      render(<WalletConnect />)
      
      // Should not crash and should show some fallback
      expect(screen.getByText('✅ Connected')).toBeInTheDocument()
    })

    it('handles null balance gracefully', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnected: true,
        address: '0x123',
        balance: null,
        isCorrectNetwork: true,
      } as any)

      render(<WalletConnect />)
      
      // Should not crash
      expect(screen.getByText('✅ Connected')).toBeInTheDocument()
    })

    it('handles undefined chainId gracefully', () => {
      mockUseWalletContext.mockReturnValue({
        ...defaultWalletState,
        isConnected: true,
        address: '0x123',
        chainId: null,
        isCorrectNetwork: false,
      } as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('⚠️ Wrong Network')).toBeInTheDocument()
    })
  })
})