import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ResultView from '../result-view'
import { mockCVResult } from '../__mocks__/cv-data'

// Mock React PDF StyleSheet
jest.mock('@react-pdf/renderer', () => ({
  StyleSheet: {
    create: (styles: any) => styles
  },
  Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
  View: ({ children, ...props }: any) => <div data-testid="pdf-view" {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <span data-testid="pdf-text" {...props}>{children}</span>,
  pdf: {
    toBlob: jest.fn().mockResolvedValue(new Blob())
  }
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Mock payment modal
jest.mock('../payment-modal', () => {
  return function MockPaymentModal({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    return (
      <div data-testid="payment-modal">
        <button onClick={onSuccess}>Pay Success</button>
        <button onClick={onCancel}>Pay Cancel</button>
      </div>
    )
  }
})

// Mock PDF render
jest.mock('../../lib/pdf-render', () => ({
  downloadPDF: jest.fn().mockResolvedValue(undefined)
}))

// Mock CV templates
jest.mock('../../lib/cv-templates', () => ({
  getAllTemplates: () => [
    { id: 'modern', name: 'Modern', description: 'Clean and modern design' },
    { id: 'classic', name: 'Classic', description: 'Traditional professional design' },
    { id: 'creative', name: 'Creative', description: 'Bold and creative design' }
  ],
  TemplateType: {
    Modern: 'modern',
    Classic: 'classic',
    Creative: 'creative'
  } as const
}))


const mockOnReset = jest.fn()

describe('ResultView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.NEXT_PUBLIC_DEBUG_MODE = 'true'
    })

    afterEach(() => {
        process.env.NEXT_PUBLIC_DEBUG_MODE = 'true'
    })

    describe('Unlocked state (debug mode)', () => {
        test('renders unlocked content in debug mode', () => {
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            expect(screen.getByText('unlocked.title')).toBeInTheDocument()
            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.getByText('john@example.com · +1 (234) 567-8900 · New York, NY')).toBeInTheDocument()
            expect(screen.getByText('Tech Corp Inc.')).toBeInTheDocument()
        })

        test('calls onReset when new CV button is clicked', async () => {
            const user = userEvent.setup()
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            await user.click(screen.getByText('unlocked.newCV'))

            expect(mockOnReset).toHaveBeenCalledTimes(1)
        })

        test('renders template selection buttons', () => {
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            expect(screen.getByText('Modern')).toBeInTheDocument()
            expect(screen.getByText('Classic')).toBeInTheDocument()
            expect(screen.getByText('Creative')).toBeInTheDocument()
        })

        test('changes selected template on click', async () => {
            const user = userEvent.setup()
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            await user.click(screen.getByText('Classic'))

            expect(screen.getByText('Classic').closest('button')).toHaveClass('border-blue-600')
        })

        test('renders download PDF button', () => {
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            expect(screen.getByText('unlocked.downloadButton')).toBeInTheDocument()
        })

        test('calls downloadPDF when download button is clicked', async () => {
            const { downloadPDF } = require('../../lib/pdf-render')
            const user = userEvent.setup()
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            await user.click(screen.getByText('unlocked.downloadButton'))

            expect(downloadPDF).toHaveBeenCalledTimes(1)
        })

        test('shows comparison tab when originalText is provided', async () => {
            const user = userEvent.setup()
            const resultWithOriginal = { ...mockCVResult, originalText: 'Original CV text here' }
            render(<ResultView result={resultWithOriginal} onReset={mockOnReset} />)

            expect(screen.getByText('unlocked.tabOptimized')).toBeInTheDocument()
            expect(screen.getByText('unlocked.tabComparison')).toBeInTheDocument()

            await user.click(screen.getByText('unlocked.tabComparison'))

            expect(screen.getByText('Original CV text here')).toBeInTheDocument()
        })

        test('does not show tabs when originalText is not provided', () => {
            const resultWithoutOriginal = { ...mockCVResult, originalText: undefined }
            render(<ResultView result={resultWithoutOriginal} onReset={mockOnReset} />)

            expect(screen.queryByText('unlocked.tabOptimized')).not.toBeInTheDocument()
        })

        test('renders keywords section', () => {
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            expect(screen.getByText('unlocked.keywordsLabel')).toBeInTheDocument()
        })
    })

    describe('Locked state (no debug mode)', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_DEBUG_MODE = 'false'
        })

        test('renders locked state when not paid and not in debug mode', () => {
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            expect(screen.getByText('locked.title')).toBeInTheDocument()
            expect(screen.getByText('locked.description')).toBeInTheDocument()
            expect(screen.getByText('locked.payButton')).toBeInTheDocument()
        })

        test('shows payment modal when pay button is clicked', async () => {
            const user = userEvent.setup()
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            await user.click(screen.getByText('locked.payButton'))

            expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
        })

        test('unlocks content after successful payment', async () => {
            const user = userEvent.setup()
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            await user.click(screen.getByText('locked.payButton'))
            await user.click(screen.getByText('Pay Success'))

            expect(screen.getByText('unlocked.title')).toBeInTheDocument()
        })

        test('hides payment modal on cancel', async () => {
            const user = userEvent.setup()
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            await user.click(screen.getByText('locked.payButton'))
            expect(screen.getByTestId('payment-modal')).toBeInTheDocument()

            await user.click(screen.getByText('Pay Cancel'))
            expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
        })

        test('calls onReset from locked state', async () => {
            const user = userEvent.setup()
            render(<ResultView result={mockCVResult} onReset={mockOnReset} />)

            await user.click(screen.getByText('locked.backButton'))

            expect(mockOnReset).toHaveBeenCalledTimes(1)
        })
    })
})