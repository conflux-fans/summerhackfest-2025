import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Modal, ConfirmModal } from '../../../src/components/ui/Modal'

// Mock document.body for testing body style changes
Object.defineProperty(document.body, 'style', {
  value: {
    overflow: 'unset',
  },
  writable: true,
})

describe('Modal Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = 'unset'
  })

  afterEach(() => {
    jest.clearAllMocks()
    // Clean up body overflow
    document.body.style.overflow = 'unset'
  })

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('renders close button', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveTextContent('✕')
    })

    it('renders footer when provided', () => {
      const footer = <button>Footer Button</button>
      
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" footer={footer}>
          <p>Modal content</p>
        </Modal>
      )
      
      expect(screen.getByText('Footer Button')).toBeInTheDocument()
    })

    it('does not render footer when not provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      // Footer section should not exist
      const footerSection = screen.queryByText('Footer Button')
      expect(footerSection).not.toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('applies medium size by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const modalContainer = screen.getByText('Test Modal').closest('div')
      expect(modalContainer).toHaveClass('max-w-lg')
    })

    it('applies small size correctly', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="sm">
          <p>Modal content</p>
        </Modal>
      )
      
      const modalContainer = screen.getByText('Test Modal').closest('div')
      expect(modalContainer).toHaveClass('max-w-md')
    })

    it('applies large size correctly', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="lg">
          <p>Modal content</p>
        </Modal>
      )
      
      const modalContainer = screen.getByText('Test Modal').closest('div')
      expect(modalContainer).toHaveClass('max-w-2xl')
    })
  })

  describe('Interaction', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const closeButton = screen.getByLabelText('Close modal')
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key is pressed', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose for other keys', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Space' })
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('prevents event propagation when modal content is clicked', () => {
      const mockBackdropClick = jest.fn()
      
      render(
        <div onClick={mockBackdropClick}>
          <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <p>Modal content</p>
          </Modal>
        </div>
      )
      
      const modalContent = screen.getByText('Modal content')
      fireEvent.click(modalContent)
      
      expect(mockBackdropClick).not.toHaveBeenCalled()
    })
  })

  describe('Body Overflow Management', () => {
    it('sets body overflow to hidden when modal opens', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('resets body overflow when modal closes', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('hidden')
      
      rerender(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('Styling', () => {
    it('applies correct backdrop styling', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const backdrop = screen.getByText('Test Modal').closest('.fixed')
      expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-black/50', 'backdrop-blur-sm', 'z-50')
    })

    it('applies correct modal container styling', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const modalContainer = screen.getByText('Test Modal').closest('div')
      expect(modalContainer).toHaveClass('bg-gray-900', 'border', 'border-gray-700', 'rounded-lg', 'shadow-xl')
    })

    it('applies transition classes', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const modalContainer = screen.getByText('Test Modal').closest('div')
      expect(modalContainer).toHaveClass('transform', 'transition-all', 'duration-300', 'scale-100', 'opacity-100')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('supports keyboard navigation', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <button>Focusable Button</button>
        </Modal>
      )
      
      const button = screen.getByText('Focusable Button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })
  })
})

describe('ConfirmModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnConfirm = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Confirm Action"
          message="Are you sure?"
        />
      )
      
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('renders custom button text', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Item"
          message="This will delete the item permanently."
          confirmText="Delete"
          cancelText="Keep"
        />
      )
      
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Keep')).toBeInTheDocument()
    })

    it('renders danger type with correct styling', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Danger Action"
          message="This is dangerous."
          type="danger"
        />
      )
      
      expect(screen.getByText('⚠️')).toBeInTheDocument()
      const confirmButton = screen.getByText('Confirm')
      expect(confirmButton).toHaveClass('bg-red-600', 'hover:bg-red-500')
    })

    it('renders warning type with correct styling', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Warning Action"
          message="This is a warning."
          type="warning"
        />
      )
      
      expect(screen.getByText('⚠️')).toBeInTheDocument()
      const confirmButton = screen.getByText('Confirm')
      expect(confirmButton).toHaveClass('bg-yellow-600', 'hover:bg-yellow-500')
    })

    it('renders info type with correct styling', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Info Action"
          message="This is informational."
          type="info"
        />
      )
      
      expect(screen.getByText('ℹ️')).toBeInTheDocument()
      const confirmButton = screen.getByText('Confirm')
      expect(confirmButton).toHaveClass('bg-blue-600', 'hover:bg-blue-500')
    })
  })

  describe('Interaction', () => {
    it('calls onConfirm and onClose when confirm button is clicked', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Confirm Action"
          message="Are you sure?"
        />
      )
      
      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls only onClose when cancel button is clicked', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Confirm Action"
          message="Are you sure?"
        />
      )
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(mockOnConfirm).not.toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('handles multiline messages correctly', () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3"
      
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Multiline Test"
          message={multilineMessage}
        />
      )
      
      const messageElement = screen.getByText('Line 1')
      expect(messageElement).toBeInTheDocument()
      expect(messageElement).toHaveClass('whitespace-pre-line')
    })
  })

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Confirm Action"
          message="Are you sure?"
        />
      )
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3) // Close (X), Cancel, Confirm
    })

    it('supports keyboard navigation between buttons', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Confirm Action"
          message="Are you sure?"
        />
      )
      
      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Confirm')
      
      cancelButton.focus()
      expect(document.activeElement).toBe(cancelButton)
      
      confirmButton.focus()
      expect(document.activeElement).toBe(confirmButton)
    })
  })

  describe('Styling', () => {
    it('applies correct icon and button styling for each type', () => {
      const types = [
        { type: 'danger' as const, icon: '⚠️', buttonClass: 'bg-red-600' },
        { type: 'warning' as const, icon: '⚠️', buttonClass: 'bg-yellow-600' },
        { type: 'info' as const, icon: 'ℹ️', buttonClass: 'bg-blue-600' },
      ]
      
      types.forEach(({ type, icon, buttonClass }) => {
        const { unmount } = render(
          <ConfirmModal
            isOpen={true}
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
            title={`${type} Action`}
            message="Test message"
            type={type}
          />
        )
        
        expect(screen.getByText(icon)).toBeInTheDocument()
        const confirmButton = screen.getByText('Confirm')
        expect(confirmButton).toHaveClass(buttonClass)
        
        unmount()
      })
    })

    it('applies correct layout classes', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      )
      
      const messageContainer = screen.getByText('Test message').parentElement
      expect(messageContainer).toHaveClass('flex', 'items-start', 'gap-4')
      
      const iconElement = screen.getByText('⚠️')
      expect(iconElement).toHaveClass('text-2xl', 'flex-shrink-0')
      
      const messageElement = screen.getByText('Test message')
      expect(messageElement).toHaveClass('text-gray-300', 'leading-relaxed', 'whitespace-pre-line')
    })
  })
})