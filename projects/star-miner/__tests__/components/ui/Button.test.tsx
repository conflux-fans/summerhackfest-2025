import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../../../src/components/ui/Button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-500', 'text-white')
  })

  it('applies secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-600', 'hover:bg-gray-500', 'text-white')
  })

  it('applies success variant correctly', () => {
    render(<Button variant="success">Success Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-green-600', 'hover:bg-green-500', 'text-white')
  })

  it('applies danger variant correctly', () => {
    render(<Button variant="danger">Danger Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600', 'hover:bg-red-500', 'text-white')
  })

  it('applies warning variant correctly', () => {
    render(<Button variant="warning">Warning Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-yellow-600', 'hover:bg-yellow-500', 'text-white')
  })

  it('applies medium size by default', () => {
    render(<Button>Medium Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'text-base')
  })

  it('applies small size correctly', () => {
    render(<Button size="sm">Small Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1', 'text-sm')
  })

  it('applies large size correctly', () => {
    render(<Button size="lg">Large Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('shows loading state when isLoading is true', () => {
    render(<Button isLoading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Loading...')
    expect(button).toBeDisabled()
    
    // Check for spinner
    const spinner = button.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn()
    render(<Button onClick={mockOnClick}>Clickable Button</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const mockOnClick = jest.fn()
    render(<Button onClick={mockOnClick} disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const mockOnClick = jest.fn()
    render(<Button onClick={mockOnClick} isLoading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('passes through additional props', () => {
    render(<Button data-testid="test-button" aria-label="Test button">Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-testid', 'test-button')
    expect(button).toHaveAttribute('aria-label', 'Test button')
  })

  it('has proper focus styles', () => {
    render(<Button>Focusable Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-blue-500')
  })

  it('has transform and transition classes for animations', () => {
    render(<Button>Animated Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('transform', 'transition-all', 'duration-200', 'hover:scale-105', 'active:scale-95')
  })

  it('shows loading spinner with correct styling', () => {
    render(<Button isLoading>Loading</Button>)
    
    const button = screen.getByRole('button')
    const spinner = button.querySelector('.animate-spin')
    
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('w-4', 'h-4', 'border-2', 'border-white', 'border-t-transparent', 'rounded-full')
  })

  it('centers loading content properly', () => {
    render(<Button isLoading>Loading</Button>)
    
    const button = screen.getByRole('button')
    const loadingContainer = button.querySelector('.flex.items-center.justify-center')
    
    expect(loadingContainer).toBeInTheDocument()
  })
})