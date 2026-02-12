import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Header from '../sections/header'


describe('Header', () => {
  const mockOnScrollToForm = jest.fn()

  beforeEach(() => {
    mockOnScrollToForm.mockClear()
  })

  test('renders header with brand name', () => {
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    expect(screen.getByText('TurboCV')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  test('renders CTA button with translated text', () => {
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    const ctaButton = screen.getByRole('button', { name: 'cta' })
    expect(ctaButton).toBeInTheDocument()
  })

  test('calls onScrollToForm when CTA button is clicked', async () => {
    const user = userEvent.setup()
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    const ctaButton = screen.getByRole('button', { name: 'cta' })
    await user.click(ctaButton)
    
    expect(mockOnScrollToForm).toHaveBeenCalledTimes(1)
  })

  test('applies correct CSS classes', () => {
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-slate-900', 'text-white')
    
    const container = header.querySelector('div')
    expect(container).toHaveClass('max-w-5xl', 'mx-auto', 'px-4', 'py-6', 'flex', 'items-center', 'justify-between')
    
    const brand = screen.getByText('TurboCV')
    expect(brand).toHaveClass('text-xl', 'font-bold', 'tracking-tight')
    
    const ctaButton = screen.getByRole('button')
    expect(ctaButton).toHaveClass('text-sm', 'bg-blue-600', 'hover:bg-blue-700', 'px-4', 'py-2', 'rounded-lg', 'transition-colors', 'font-medium')
  })

  test('has correct semantic structure', () => {
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    // Header should use semantic <header> element
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // Brand should be a span (not interactive)
    const brand = screen.getByText('TurboCV')
    expect(brand.tagName).toBe('SPAN')
    
    // CTA should be a button (interactive)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
