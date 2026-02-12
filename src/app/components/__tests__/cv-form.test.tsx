import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import CVForm from '../cv-form'

const createPDFFile = (name = 'test-cv.pdf') =>
  new File(['pdf content'], name, { type: 'application/pdf' })

const createTextFile = (name = 'test.txt') =>
  new File(['text content'], name, { type: 'text/plain' })

const getFileInput = () =>
  document.querySelector('input[type="file"][accept=".pdf"]') as HTMLInputElement

describe('CVForm', () => {
  const mockOnOptimize = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(window, 'alert').mockImplementation(() => {})
  })

  describe('Rendering', () => {
    test('renders form with all elements', () => {
      render(<CVForm onOptimize={mockOnOptimize} />)

      expect(screen.getByText('cvLabel')).toBeInTheDocument()
      expect(screen.getByText('uploadPDF')).toBeInTheDocument()
      expect(screen.getByText('cvPlaceholder')).toBeInTheDocument()
      expect(screen.getByLabelText('jobLabel')).toBeInTheDocument()
      expect(screen.getByText('optimizeButton')).toBeInTheDocument()
    })

    test('renders feature cards', () => {
      render(<CVForm onOptimize={mockOnOptimize} />)

      expect(screen.getByText('features.atsOptimized')).toBeInTheDocument()
      expect(screen.getByText('features.immediateResult')).toBeInTheDocument()
      expect(screen.getByText('features.noLies')).toBeInTheDocument()
    })

    test('renders error message when error prop is provided', () => {
      render(<CVForm onOptimize={mockOnOptimize} error="Something went wrong" />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Something went wrong')
    })

    test('does not render error when error prop is null', () => {
      render(<CVForm onOptimize={mockOnOptimize} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    test('accepts PDF file via file input', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      await user.upload(getFileInput(), createPDFFile('my-resume.pdf'))

      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    })

    test('rejects non-PDF files', async () => {
      render(<CVForm onOptimize={mockOnOptimize} />)

      // Simulate the processPDFFile logic directly via fireEvent
      // since userEvent.upload respects the accept attribute
      const fileInput = getFileInput()
      const textFile = createTextFile()

      Object.defineProperty(fileInput, 'files', {
        value: [textFile],
        writable: false,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))

      expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
      expect(window.alert).toHaveBeenCalledWith('pdfAlert')
    })

    test('shows remove button after file upload', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      await user.upload(getFileInput(), createPDFFile())

      expect(screen.getByText('Remove')).toBeInTheDocument()
    })

    test('removes uploaded file when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      await user.upload(getFileInput(), createPDFFile('my-resume.pdf'))
      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()

      await user.click(screen.getByText('Remove'))

      expect(screen.queryByText('my-resume.pdf')).not.toBeInTheDocument()
      expect(screen.getByText('cvPlaceholder')).toBeInTheDocument()
    })
  })

  describe('Job Offer Input', () => {
    test('allows typing in job offer textarea', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, 'Senior React Developer')

      expect(textarea).toHaveValue('Senior React Developer')
    })
  })

  describe('Submit Button', () => {
    test('is disabled when no file is uploaded', () => {
      render(<CVForm onOptimize={mockOnOptimize} />)

      expect(screen.getByText('optimizeButton')).toBeDisabled()
    })

    test('is disabled when no job offer is provided', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      await user.upload(getFileInput(), createPDFFile())

      expect(screen.getByText('optimizeButton')).toBeDisabled()
    })

    test('is disabled when job offer is only whitespace', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      await user.upload(getFileInput(), createPDFFile())

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, '   ')

      expect(screen.getByText('optimizeButton')).toBeDisabled()
    })

    test('is enabled when both file and job offer are provided', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      await user.upload(getFileInput(), createPDFFile())

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, 'Senior React Developer')

      expect(screen.getByText('optimizeButton')).toBeEnabled()
    })

    test('calls onOptimize with file and job offer on click', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} />)

      await user.upload(getFileInput(), createPDFFile())

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, 'Senior React Developer')

      await user.click(screen.getByText('optimizeButton'))

      expect(mockOnOptimize).toHaveBeenCalledTimes(1)
      expect(mockOnOptimize).toHaveBeenCalledWith(
        expect.any(File),
        'Senior React Developer'
      )
    })
  })

  describe('Loading State', () => {
    test('shows loading indicator when submitting', async () => {
      let resolveOptimize: () => void
      const slowOptimize = jest.fn(
        () => new Promise<void>((resolve) => { resolveOptimize = resolve })
      )

      const user = userEvent.setup()
      render(<CVForm onOptimize={slowOptimize} />)

      await user.upload(getFileInput(), createPDFFile())

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, 'Job offer text')

      await user.click(screen.getByText('optimizeButton'))

      // Button should be replaced by loading indicator
      expect(screen.queryByText('optimizeButton')).not.toBeInTheDocument()

      // Resolve the promise to end loading
      resolveOptimize!()
      await waitFor(() => {
        expect(screen.getByText('optimizeButton')).toBeInTheDocument()
      })
    })
  })
})
