import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PaymentModal from '../payment-modal'

const mockConfirmPayment = jest.fn()
const mockOnSuccess = jest.fn()
const mockOnCancel = jest.fn()

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => ({
    confirmPayment: mockConfirmPayment,
  }),
  useElements: () => ({}),
}))

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({}),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('PaymentModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ clientSecret: 'test_secret_123' }),
    })
  })

  test('shows loading spinner while fetching client secret', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))

    render(<PaymentModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('renders checkout form after fetching client secret', async () => {
    render(<PaymentModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
    })

    expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    expect(screen.getByText('payButton')).toBeInTheDocument()
    expect(screen.getByText('cancelButton')).toBeInTheDocument()
  })

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<PaymentModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByText('cancelButton')).toBeInTheDocument()
    })

    await user.click(screen.getByText('cancelButton'))

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  test('calls onSuccess after successful payment', async () => {
    mockConfirmPayment.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<PaymentModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByText('payButton')).toBeInTheDocument()
    })

    await user.click(screen.getByText('payButton'))

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  test('shows error message when payment fails', async () => {
    mockConfirmPayment.mockResolvedValue({ error: { message: 'Card declined' } })
    const user = userEvent.setup()
    render(<PaymentModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByText('payButton')).toBeInTheDocument()
    })

    await user.click(screen.getByText('payButton'))

    await waitFor(() => {
      expect(screen.getByText('Card declined')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  test('shows processing state while payment is being processed', async () => {
    mockConfirmPayment.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<PaymentModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByText('payButton')).toBeInTheDocument()
    })

    await user.click(screen.getByText('payButton'))

    await waitFor(() => {
      expect(screen.getByText('processing')).toBeInTheDocument()
    })
  })
})
