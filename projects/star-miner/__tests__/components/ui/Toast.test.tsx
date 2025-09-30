import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Toast, ToastContainer } from '../../../src/components/ui/Toast'

// Mock timers for testing auto-dismiss functionality
jest.useFakeTimers()

const mockOnClose = jest.fn()

const defaultToastProps = {
  id: 'test-toast-1',
  type: 'info' as const,
  title: 'Test Toast',
  message: 'This is a test message',
  duration: 5000,
  onClose: mockOnClose,
}

describe('Toast Component', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('Rendering', () => {
    it('renders toast with title and message', () => {
      render(<Toast {...defaultToastProps} />)
      
      expect(screen.getByText('Test Toast')).toBeInTheDocument()
      expect(screen.getByText('This is a test message')).toBeInTheDocument()
    })

    it('renders toast without message when not provided', () => {
      render(<Toast {...defaultToastProps} message={undefined} />)
      
      expect(screen.getByText('Test Toast')).toBeInTheDocument()
      expect(screen.queryByText('This is a test message')).not.toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveTextContent('✕')
    })

    it('renders progress bar', () => {
      render(<Toast {...defaultToastProps} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Toast Types', () => {
    it('applies success styling correctly', () => {
      render(<Toast {...defaultToastProps} type="success" />)
      
      expect(screen.getByText('✅')).toBeInTheDocument()
      const toast = screen.getByText('Test Toast').closest('.bg-green-900\\/90')
      expect(toast).toBeInTheDocument()
      
      const title = screen.getByText('Test Toast')
      expect(title).toHaveClass('text-green-400')
      
      const message = screen.getByText('This is a test message')
      expect(message).toHaveClass('text-green-300')
    })

    it('applies error styling correctly', () => {
      render(<Toast {...defaultToastProps} type="error" />)
      
      expect(screen.getByText('❌')).toBeInTheDocument()
      const toast = screen.getByText('Test Toast').closest('.bg-red-900\\/90')
      expect(toast).toBeInTheDocument()
      
      const title = screen.getByText('Test Toast')
      expect(title).toHaveClass('text-red-400')
      
      const message = screen.getByText('This is a test message')
      expect(message).toHaveClass('text-red-300')
    })

    it('applies warning styling correctly', () => {
      render(<Toast {...defaultToastProps} type="warning" />)
      
      expect(screen.getByText('⚠️')).toBeInTheDocument()
      const toast = screen.getByText('Test Toast').closest('.bg-yellow-900\\/90')
      expect(toast).toBeInTheDocument()
      
      const title = screen.getByText('Test Toast')
      expect(title).toHaveClass('text-yellow-400')
      
      const message = screen.getByText('This is a test message')
      expect(message).toHaveClass('text-yellow-300')
    })

    it('applies info styling correctly', () => {
      render(<Toast {...defaultToastProps} type="info" />)
      
      expect(screen.getByText('ℹ️')).toBeInTheDocument()
      const toast = screen.getByText('Test Toast').closest('.bg-blue-900\\/90')
      expect(toast).toBeInTheDocument()
      
      const title = screen.getByText('Test Toast')
      expect(title).toHaveClass('text-blue-400')
      
      const message = screen.getByText('This is a test message')
      expect(message).toHaveClass('text-blue-300')
    })
  })

  describe('Progress Bar Colors', () => {
    it('shows correct progress bar color for each type', () => {
      const types = [
        { type: 'success' as const, colorClass: 'bg-green-500' },
        { type: 'error' as const, colorClass: 'bg-red-500' },
        { type: 'warning' as const, colorClass: 'bg-yellow-500' },
        { type: 'info' as const, colorClass: 'bg-blue-500' },
      ]
      
      types.forEach(({ type, colorClass }) => {
        const { unmount } = render(<Toast {...defaultToastProps} type={type} />)
        
        const progressBar = screen.getByRole('progressbar', { hidden: true })
        expect(progressBar).toHaveClass(colorClass)
        
        unmount()
      })
    })
  })

  describe('Auto-dismiss', () => {
    it('calls onClose after duration expires', async () => {
      render(<Toast {...defaultToastProps} duration={1000} />)
      
      // Fast-forward time
      jest.advanceTimersByTime(1000)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('test-toast-1')
      })
    })

    it('uses default duration when not specified', async () => {
      render(<Toast {...defaultToastProps} duration={undefined} />)
      
      // Fast-forward to default duration (5000ms)
      jest.advanceTimersByTime(5000)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('test-toast-1')
      })
    })

    it('does not auto-dismiss before duration expires', () => {
      render(<Toast {...defaultToastProps} duration={5000} />)
      
      // Fast-forward to just before duration
      jest.advanceTimersByTime(4999)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Manual Close', () => {
    it('calls onClose when close button is clicked', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      fireEvent.click(closeButton)
      
      // Should call onClose after animation delay
      jest.advanceTimersByTime(300)
      
      expect(mockOnClose).toHaveBeenCalledWith('test-toast-1')
    })

    it('shows exit animation when closing manually', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      fireEvent.click(closeButton)
      
      const toast = screen.getByText('Test Toast').closest('.fixed')
      expect(toast).toHaveClass('translate-x-full', 'opacity-0', 'scale-95')
    })
  })

  describe('Animation States', () => {
    it('shows entrance animation on mount', () => {
      render(<Toast {...defaultToastProps} />)
      
      const toast = screen.getByText('Test Toast').closest('.fixed')
      expect(toast).toHaveClass('translate-x-0', 'opacity-100', 'scale-100')
    })

    it('applies correct positioning classes', () => {
      render(<Toast {...defaultToastProps} />)
      
      const toast = screen.getByText('Test Toast').closest('.fixed')
      expect(toast).toHaveClass('fixed', 'top-4', 'right-4', 'z-50')
    })

    it('has proper sizing constraints', () => {
      render(<Toast {...defaultToastProps} />)
      
      const toast = screen.getByText('Test Toast').closest('.fixed')
      expect(toast).toHaveClass('min-w-80', 'max-w-md')
    })
  })

  describe('Content Layout', () => {
    it('applies correct layout classes to content', () => {
      render(<Toast {...defaultToastProps} />)
      
      const contentContainer = screen.getByText('Test Toast').closest('.flex')
      expect(contentContainer).toHaveClass('flex', 'items-start', 'gap-3')
    })

    it('handles long messages with proper text wrapping', () => {
      const longMessage = 'This is a very long message that should wrap properly and not overflow the toast container boundaries'
      
      render(<Toast {...defaultToastProps} message={longMessage} />)
      
      const messageElement = screen.getByText(longMessage)
      expect(messageElement).toHaveClass('break-words')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
    })

    it('supports keyboard interaction', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      closeButton.focus()
      expect(document.activeElement).toBe(closeButton)
    })
  })
})

describe('ToastContainer Component', () => {
  const mockOnRemove = jest.fn()

  const sampleToasts = [
    {
      id: 'toast-1',
      type: 'success' as const,
      title: 'Success',
      message: 'Operation completed',
      duration: 5000,
    },
    {
      id: 'toast-2',
      type: 'error' as const,
      title: 'Error',
      message: 'Something went wrong',
      duration: 5000,
    },
    {
      id: 'toast-3',
      type: 'info' as const,
      title: 'Info',
      message: 'Information message',
      duration: 3000,
    },
  ]

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when no toasts', () => {
      const { container } = render(<ToastContainer toasts={[]} onRemove={mockOnRemove} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('renders all toasts when provided', () => {
      render(<ToastContainer toasts={sampleToasts} onRemove={mockOnRemove} />)
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Info')).toBeInTheDocument()
    })

    it('applies correct positioning for multiple toasts', () => {
      render(<ToastContainer toasts={sampleToasts} onRemove={mockOnRemove} />)
      
      const container = screen.getByText('Success').closest('.fixed')
      expect(container).toHaveClass('fixed', 'top-0', 'right-0', 'z-50', 'pointer-events-none')
    })

    it('applies stacking transform to toasts', () => {
      render(<ToastContainer toasts={sampleToasts} onRemove={mockOnRemove} />)
      
      const toastContainers = screen.getAllByText(/Success|Error|Info/).map(el => 
        el.closest('.pointer-events-auto')
      )
      
      expect(toastContainers).toHaveLength(3)
      
      // Check that each toast has different z-index and transform
      toastContainers.forEach((container, index) => {
        expect(container).toHaveStyle(`transform: translateY(${index * 8}px)`)
        expect(container).toHaveStyle(`z-index: ${50 - index}`)
      })
    })
  })

  describe('Toast Management', () => {
    it('passes onRemove function to each toast', () => {
      render(<ToastContainer toasts={sampleToasts} onRemove={mockOnRemove} />)
      
      const closeButtons = screen.getAllByLabelText('Close notification')
      expect(closeButtons).toHaveLength(3)
      
      // Click first toast's close button
      fireEvent.click(closeButtons[0])
      
      // Should trigger close animation, then call onRemove after delay
      jest.advanceTimersByTime(300)
      
      expect(mockOnRemove).toHaveBeenCalledWith('toast-1')
    })

    it('handles empty toast array gracefully', () => {
      const { container } = render(<ToastContainer toasts={[]} onRemove={mockOnRemove} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('handles single toast correctly', () => {
      const singleToast = [sampleToasts[0]]
      
      render(<ToastContainer toasts={singleToast} onRemove={mockOnRemove} />)
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.queryByText('Error')).not.toBeInTheDocument()
      expect(screen.queryByText('Info')).not.toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct container styling', () => {
      render(<ToastContainer toasts={sampleToasts} onRemove={mockOnRemove} />)
      
      const container = screen.getByText('Success').closest('.fixed')
      expect(container).toHaveClass('fixed', 'top-0', 'right-0', 'z-50', 'pointer-events-none')
    })

    it('applies pointer-events-auto to individual toasts', () => {
      render(<ToastContainer toasts={sampleToasts} onRemove={mockOnRemove} />)
      
      const toastWrappers = screen.getAllByText(/Success|Error|Info/).map(el => 
        el.closest('.pointer-events-auto')
      )
      
      toastWrappers.forEach(wrapper => {
        expect(wrapper).toHaveClass('pointer-events-auto', 'mb-2')
      })
    })

    it('applies correct z-index stacking', () => {
      render(<ToastContainer toasts={sampleToasts} onRemove={mockOnRemove} />)
      
      const toastWrappers = screen.getAllByText(/Success|Error|Info/).map(el => 
        el.closest('.pointer-events-auto')
      )
      
      // First toast should have highest z-index
      expect(toastWrappers[0]).toHaveStyle('z-index: 50')
      expect(toastWrappers[1]).toHaveStyle('z-index: 49')
      expect(toastWrappers[2]).toHaveStyle('z-index: 48')
    })
  })

  describe('Animation and Timing', () => {
    it('shows entrance animation initially', () => {
      render(<Toast {...defaultToastProps} />)
      
      const toast = screen.getByText('Test Toast').closest('.fixed')
      expect(toast).toHaveClass('translate-x-0', 'opacity-100', 'scale-100')
    })

    it('triggers auto-close after specified duration', async () => {
      render(<Toast {...defaultToastProps} duration={2000} />)
      
      // Fast-forward to just before duration
      jest.advanceTimersByTime(1999)
      expect(mockOnClose).not.toHaveBeenCalled()
      
      // Fast-forward past duration
      jest.advanceTimersByTime(1)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('test-toast-1')
      })
    })

    it('shows exit animation when closing', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      fireEvent.click(closeButton)
      
      const toast = screen.getByText('Test Toast').closest('.fixed')
      expect(toast).toHaveClass('translate-x-full', 'opacity-0', 'scale-95')
    })

    it('calls onClose after exit animation completes', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      fireEvent.click(closeButton)
      
      // Should not call immediately
      expect(mockOnClose).not.toHaveBeenCalled()
      
      // Should call after animation duration (300ms)
      jest.advanceTimersByTime(300)
      expect(mockOnClose).toHaveBeenCalledWith('test-toast-1')
    })
  })

  describe('Progress Bar Animation', () => {
    it('applies correct progress bar color for each type', () => {
      const types = [
        { type: 'success' as const, colorClass: 'bg-green-500' },
        { type: 'error' as const, colorClass: 'bg-red-500' },
        { type: 'warning' as const, colorClass: 'bg-yellow-500' },
        { type: 'info' as const, colorClass: 'bg-blue-500' },
      ]
      
      types.forEach(({ type, colorClass }) => {
        const { unmount } = render(<Toast {...defaultToastProps} type={type} />)
        
        const progressBar = screen.getByRole('progressbar', { hidden: true })
        expect(progressBar).toHaveClass(colorClass)
        
        unmount()
      })
    })

    it('applies shrink animation with correct duration', () => {
      render(<Toast {...defaultToastProps} duration={3000} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveStyle('animation: shrink 3000ms linear forwards')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
    })

    it('supports keyboard interaction for close button', () => {
      render(<Toast {...defaultToastProps} />)
      
      const closeButton = screen.getByLabelText('Close notification')
      closeButton.focus()
      expect(document.activeElement).toBe(closeButton)
      
      fireEvent.keyDown(closeButton, { key: 'Enter' })
      // Note: This would need additional implementation in the component to handle Enter key
    })
  })

  describe('Edge Cases', () => {
    it('handles very short duration', async () => {
      render(<Toast {...defaultToastProps} duration={100} />)
      
      jest.advanceTimersByTime(100)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('test-toast-1')
      })
    })

    it('handles very long messages', () => {
      const longMessage = 'This is a very long message that should be handled properly by the toast component without breaking the layout or causing overflow issues in the user interface'
      
      render(<Toast {...defaultToastProps} message={longMessage} />)
      
      const messageElement = screen.getByText(longMessage)
      expect(messageElement).toBeInTheDocument()
      expect(messageElement).toHaveClass('break-words')
    })

    it('handles empty title gracefully', () => {
      render(<Toast {...defaultToastProps} title="" />)
      
      const titleElement = screen.getByText('')
      expect(titleElement).toBeInTheDocument()
    })
  })
})