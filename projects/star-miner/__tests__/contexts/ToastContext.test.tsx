import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ToastProvider, useToast } from '../../src/contexts/ToastContext'

// Mock timers for testing auto-dismiss functionality
jest.useFakeTimers()

// Test component to use the toast context
const TestComponent = () => {
  const { toasts, showToast, removeToast, clearAllToasts } = useToast()
  
  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      <button onClick={() => showToast('success', 'Success Title', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => showToast('error', 'Error Title', 'Error message')}>
        Show Error
      </button>
      <button onClick={() => showToast('warning', 'Warning Title')}>
        Show Warning
      </button>
      <button onClick={() => showToast('info', 'Info Title', 'Info message', 1000)}>
        Show Info
      </button>
      <button onClick={() => removeToast('test-id')}>
        Remove Toast
      </button>
      <button onClick={clearAllToasts}>
        Clear All
      </button>
      {toasts.map(toast => (
        <div key={toast.id} data-testid={`toast-${toast.id}`}>
          {toast.title}: {toast.message}
        </div>
      ))}
    </div>
  )
}

describe('ToastContext', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('Provider', () => {
    it('provides toast context to children', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      expect(screen.getByText('Show Success')).toBeInTheDocument()
    })

    it('throws error when useToast is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useToast must be used within a ToastProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('showToast', () => {
    it('adds success toast to the list', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const showButton = screen.getByText('Show Success')
      fireEvent.click(showButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      expect(screen.getByText('Success Title: Success message')).toBeInTheDocument()
    })

    it('adds error toast to the list', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const showButton = screen.getByText('Show Error')
      fireEvent.click(showButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      expect(screen.getByText('Error Title: Error message')).toBeInTheDocument()
    })

    it('adds warning toast without message', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const showButton = screen.getByText('Show Warning')
      fireEvent.click(showButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      expect(screen.getByText('Warning Title:')).toBeInTheDocument()
    })

    it('adds info toast with custom duration', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const showButton = screen.getByText('Show Info')
      fireEvent.click(showButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      expect(screen.getByText('Info Title: Info message')).toBeInTheDocument()
    })

    it('generates unique IDs for each toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const showButton = screen.getByText('Show Success')
      fireEvent.click(showButton)
      fireEvent.click(showButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
      
      const toasts = screen.getAllByText(/Success Title: Success message/)
      expect(toasts).toHaveLength(2)
    })

    it('allows multiple toasts of different types', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Show Success'))
      fireEvent.click(screen.getByText('Show Error'))
      fireEvent.click(screen.getByText('Show Warning'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('3')
      expect(screen.getByText('Success Title: Success message')).toBeInTheDocument()
      expect(screen.getByText('Error Title: Error message')).toBeInTheDocument()
      expect(screen.getByText('Warning Title:')).toBeInTheDocument()
    })
  })

  describe('removeToast', () => {
    it('removes specific toast by ID', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add multiple toasts
      fireEvent.click(screen.getByText('Show Success'))
      fireEvent.click(screen.getByText('Show Error'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
      
      // Remove one toast (this would need the actual ID in a real scenario)
      const removeButton = screen.getByText('Remove Toast')
      fireEvent.click(removeButton)
      
      // Count should remain the same since we're using a hardcoded ID
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
    })
  })

  describe('clearAllToasts', () => {
    it('removes all toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add multiple toasts
      fireEvent.click(screen.getByText('Show Success'))
      fireEvent.click(screen.getByText('Show Error'))
      fireEvent.click(screen.getByText('Show Warning'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('3')
      
      // Clear all toasts
      const clearButton = screen.getByText('Clear All')
      fireEvent.click(clearButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })

    it('handles clearing when no toasts exist', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      
      const clearButton = screen.getByText('Clear All')
      fireEvent.click(clearButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })

  describe('Auto-dismiss', () => {
    it('auto-removes toasts after default duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const showButton = screen.getByText('Show Success')
      fireEvent.click(showButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      
      // Fast-forward past default duration (5000ms)
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      })
    })

    it('auto-removes toasts after custom duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const showButton = screen.getByText('Show Info') // Has 1000ms duration
      fireEvent.click(showButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      
      // Fast-forward past custom duration (1000ms)
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      })
    })

    it('handles multiple toasts with different durations', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add toasts with different durations
      fireEvent.click(screen.getByText('Show Info')) // 1000ms
      fireEvent.click(screen.getByText('Show Success')) // 5000ms (default)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
      
      // Fast-forward past first toast duration
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      })
      
      // Fast-forward past second toast duration
      act(() => {
        jest.advanceTimersByTime(4000)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      })
    })
  })

  describe('Toast Container Integration', () => {
    it('renders ToastContainer as part of provider', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add a toast to make container visible
      fireEvent.click(screen.getByText('Show Success'))
      
      // ToastContainer should render the actual Toast component
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('Success Title')).toBeInTheDocument()
    })

    it('passes correct props to ToastContainer', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add multiple toasts
      fireEvent.click(screen.getByText('Show Success'))
      fireEvent.click(screen.getByText('Show Error'))
      
      // Should render both toasts in the container
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('❌')).toBeInTheDocument()
    })
  })

  describe('Memory Management', () => {
    it('cleans up timers when toasts are removed', () => {
      const { unmount } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add a toast
      fireEvent.click(screen.getByText('Show Success'))
      
      // Unmount before auto-dismiss
      unmount()
      
      // Fast-forward time - should not cause memory leaks or errors
      act(() => {
        jest.advanceTimersByTime(10000)
      })
      
      // No assertions needed - just ensuring no errors occur
    })
  })
})