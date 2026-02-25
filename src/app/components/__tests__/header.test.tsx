import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Header from '../sections/header'

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => {
    const mockTranslations: Record<string, Record<string, string>> = {
      home: {
        cta: 'Optimize Now',
      },
      languageSwitcher: {
        en: 'English',
        es: 'Spanish',
      },
    }
    return (key: string) => mockTranslations[namespace]?.[key] || key
  }),
}))

// Mock next-intl routing
jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
}))

// Mock React hooks used in LanguageSwitcher
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: jest.fn(() => [false, jest.fn()]),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/en'),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
  useLocale: jest.fn(() => 'en'),
}))

// Mock LanguageSwitcher component to avoid complex dependency issues
jest.mock('../language-switcher', () => {
  return function MockLanguageSwitcher() {
    return (
      <div data-testid="language-switcher">
        <button>English</button>
        <button>Spanish</button>
      </div>
    )
  }
})


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
    
    const ctaButton = screen.getByRole('button', { name: 'Optimize Now' })
    expect(ctaButton).toBeInTheDocument()
  })

  test('calls onScrollToForm when CTA button is clicked', async () => {
    const user = userEvent.setup()
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    const ctaButton = screen.getByRole('button', { name: 'Optimize Now' })
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
    
    const ctaButton = screen.getByRole('button', { name: 'Optimize Now' })
    expect(ctaButton).toHaveClass('text-sm', 'bg-blue-600', 'hover:bg-blue-700', 'px-4', 'py-2', 'rounded-lg', 'transition-colors', 'font-medium')
  })

  test('renders language switcher', () => {
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()
  })

  test('has correct semantic structure', () => {
    render(<Header onScrollToForm={mockOnScrollToForm} />)
    
    // Header should use semantic <header> element
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // Brand should be a span (not interactive)
    const brand = screen.getByText('TurboCV')
    expect(brand.tagName).toBe('SPAN')
    
    // Should have multiple buttons (CTA + language switcher buttons)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(3) // CTA + 2 language buttons
    
    // CTA button should have specific text
    expect(screen.getByRole('button', { name: 'Optimize Now' })).toBeInTheDocument()
  })
})
