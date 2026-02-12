import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import HomePage from '../home-page'

// Mock all child components
jest.mock('../sections/header', () => {
  return function MockHeader({ onScrollToForm }: { onScrollToForm: () => void }) {
    return <header data-testid="header" onClick={onScrollToForm}>Header</header>
  }
})

jest.mock('../sections/hero-section', () => {
  return function MockHeroSection({ onScrollToForm }: { onScrollToForm: () => void }) {
    return <section data-testid="hero-section" onClick={onScrollToForm}>Hero Section</section>
  }
})

jest.mock('../sections/how-it-works', () => {
  return function MockHowItWorks() {
    return <section data-testid="how-it-works">How It Works</section>
  }
})

jest.mock('../sections/before-after', () => {
  return function MockBeforeAfter() {
    return <section data-testid="before-after">Before After</section>
  }
})

jest.mock('../sections/testimonials', () => {
  return function MockTestimonials() {
    return <section data-testid="testimonials">Testimonials</section>
  }
})

jest.mock('../sections/footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>
  }
})

jest.mock('../cv-form', () => {
  return function MockCVForm({ onOptimize, error }: { onOptimize: (file: File, jobOffer: string) => void, error: string | null }) {
    return (
      <form data-testid="cv-form">
        <button onClick={() => onOptimize(new File(['test'], 'test.pdf'), 'test job')}>
          Optimize
        </button>
        {error && <div data-testid="error">{error}</div>}
      </form>
    )
  }
})

jest.mock('../result-view', () => {
  return function MockResultView({ result, onReset }: { result: any, onReset: () => void }) {
    return (
      <div data-testid="result-view">
        <div>Result: {result.optimizedCV}</div>
        <button onClick={onReset}>Reset</button>
      </div>
    )
  }
})

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en'
}))

// Mock fetch
global.fetch = jest.fn()

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders all sections when no result', () => {
    render(<HomePage />)
    
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument()
    expect(screen.getByTestId('before-after')).toBeInTheDocument()
    expect(screen.getByTestId('testimonials')).toBeInTheDocument()
    expect(screen.getByTestId('cv-form')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.queryByTestId('result-view')).not.toBeInTheDocument()
  })

  test('hides marketing sections when result exists', async () => {
    const mockResponse = {
      optimizedCV: 'optimized content',
      keywords: ['keyword1', 'keyword2']
    }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const user = userEvent.setup()
    render(<HomePage />)
    
    // Submit the form to get a result
    await user.click(screen.getByText('Optimize'))
    
    // Marketing sections should be hidden
    expect(screen.queryByTestId('how-it-works')).not.toBeInTheDocument()
    expect(screen.queryByTestId('before-after')).not.toBeInTheDocument()
    expect(screen.queryByTestId('testimonials')).not.toBeInTheDocument()
    
    // Result view should be shown
    expect(screen.getByTestId('result-view')).toBeInTheDocument()
    expect(screen.queryByTestId('cv-form')).not.toBeInTheDocument()
  })

  test('handles successful optimization', async () => {
    const mockResponse = {
      optimizedCV: 'optimized content',
      keywords: ['keyword1', 'keyword2'],
      cvData: { experience: [] },
      originalText: 'original text'
    }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const user = userEvent.setup()
    render(<HomePage />)
    
    await user.click(screen.getByText('Optimize'))
    
    expect(fetch).toHaveBeenCalledWith('/api/optimize', {
      method: 'POST',
      body: expect.any(FormData)
    })
    
    expect(screen.getByTestId('result-view')).toBeInTheDocument()
    expect(screen.getByText('Result: optimized content')).toBeInTheDocument()
  })

  test('handles API error', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' })
    })

    const user = userEvent.setup()
    render(<HomePage />)
    
    await user.click(screen.getByText('Optimize'))
    
    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toHaveTextContent('API Error')
    expect(screen.getByTestId('cv-form')).toBeInTheDocument()
  })

  test('handles network error', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<HomePage />)
    
    await user.click(screen.getByText('Optimize'))
    
    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByTestId('cv-form')).toBeInTheDocument()
  })

  test('reset functionality works', async () => {
    const mockResponse = {
      optimizedCV: 'optimized content',
      keywords: ['keyword1', 'keyword2']
    }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const user = userEvent.setup()
    render(<HomePage />)
    
    // Get a result first
    await user.click(screen.getByText('Optimize'))
    expect(screen.getByTestId('result-view')).toBeInTheDocument()
    
    // Reset
    await user.click(screen.getByText('Reset'))
    
    // Should go back to initial state
    expect(screen.getByTestId('cv-form')).toBeInTheDocument()
    expect(screen.queryByTestId('result-view')).not.toBeInTheDocument()
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument()
  })

  test('scrollToForm functionality', () => {
    const mockScrollIntoView = jest.fn()
    
    // Mock Element.prototype.scrollIntoView to catch the call
    Element.prototype.scrollIntoView = mockScrollIntoView
    
    render(<HomePage />)
    
    // Trigger scroll
    screen.getByTestId('header').click()
    
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    
    // Clean up
    mockScrollIntoView.mockRestore()
  })

  test('has correct page structure', () => {
    render(<HomePage />)
    
    const mainContainer = screen.getByText('Header').closest('div')
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-linear-to-b', 'from-slate-50', 'to-slate-100')
  })
})
