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


describe('ResultView', () => {
    beforeEach(() => {
        // Enable debug mode for testing
        process.env.NEXT_PUBLIC_DEBUG_MODE = 'true'
    })

    test('renders ResultView', () => {
        const mockOnReset = jest.fn()
        
        render(<ResultView result={mockCVResult} onReset={mockOnReset} />)
        
        // Check that unlocked content is rendered
        expect(screen.getByText('unlocked.title')).toBeInTheDocument()
        
        // Use exact text from the rendered output
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('john@example.com · +1 (234) 567-8900 · New York, NY')).toBeInTheDocument()
        expect(screen.getByText('Tech Corp Inc.')).toBeInTheDocument()
        expect(screen.getByText('Led team of 5 developers to rebuild company\'s e-commerce platform, resulting in 40% performance improvement')).toBeInTheDocument()
    })
    
})