import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jestfn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
  getTranslations: () => (key) => key,
}))

// Mock Stripe
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  CardElement: () => <div data-testid="stripe-card-element" />,
  useStripe: () => ({
    elements: jest.fn(),
    confirmPayment: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
}))

// Mock PDF generation libraries
jest.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }) => <div>{children}</div>,
  Document: ({ children }) => <div>{children}</div>,
  Page: ({ children }) => <div>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
  View: ({ children }) => <div>{children}</div>,
  BlobProvider: ({ children }) => children({ blob: new Blob() }),
}))

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn(() => ({
      addPage: jest.fn(),
      save: jest.fn(() => Promise.resolve(new Uint8Array())),
    })),
  },
  rgb: jest.fn(),
}))

// Mock pdf-parse
jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({
    getText: jest.fn(() => Promise.resolve({ text: 'Mock PDF content' })),
  })),
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings in tests
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) {
      return
    }
    originalWarn(...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})
