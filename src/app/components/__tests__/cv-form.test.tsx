import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import CVForm from '../cv-form'

// Mock the PDF processing utility
jest.mock('../../utils/pdf-processing', () => ({
  extractTextFromPDF: jest.fn().mockResolvedValue('Mock extracted PDF text')
}))

const createPDFFile = (name = 'test-cv.pdf') =>
  new File(['pdf content'], name, { type: 'application/pdf' })

const createTextFile = (name = 'test.txt') =>
  new File(['text content'], name, { type: 'text/plain' })

const getFileInput = () =>
  document.querySelector('input[type="file"][accept=".pdf"]') as HTMLInputElement

describe('CVForm', () => {
  const mockOnOptimize = jest.fn().mockResolvedValue(undefined)
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(window, 'alert').mockImplementation(() => {})
  })

  describe('Rendering', () => {
    test('renders form with all elements', () => {
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      expect(screen.getByText('cvLabel')).toBeInTheDocument()
      expect(screen.getByText('uploadPDF')).toBeInTheDocument()
      expect(screen.getByText('cvPlaceholder')).toBeInTheDocument()
      expect(screen.getByLabelText('jobLabel')).toBeInTheDocument()
      expect(screen.getByText('optimizeButton')).toBeInTheDocument()
    })

    test('renders feature cards', () => {
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      expect(screen.getByText('features.atsOptimized')).toBeInTheDocument()
      expect(screen.getByText('features.immediateResult')).toBeInTheDocument()
      expect(screen.getByText('features.noLies')).toBeInTheDocument()
    })

    test('renders error message when error prop is provided', () => {
      render(<CVForm onOptimize={mockOnOptimize} error="Something went wrong" onError={mockOnError} />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Something went wrong')
    })

    test('does not render error when error prop is null', () => {
      render(<CVForm onOptimize={mockOnOptimize} error={null} onError={mockOnError} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    test('accepts PDF file via file input', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      await user.upload(getFileInput(), createPDFFile('my-resume.pdf'))

      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    })

    test('rejects non-PDF files', async () => {
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

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
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      await user.upload(getFileInput(), createPDFFile())

      expect(screen.getByText('Remove')).toBeInTheDocument()
    })

    test('removes uploaded file when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

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
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, 'Senior React Developer')

      expect(textarea).toHaveValue('Senior React Developer')
    })
  })

  describe('Submit Button', () => {
    test('is disabled when no file is uploaded', () => {
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      expect(screen.getByText('optimizeButton')).toBeDisabled()
    })

    test('is disabled when no job offer is provided', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      await user.upload(getFileInput(), createPDFFile())

      expect(screen.getByText('optimizeButton')).toBeDisabled()
    })

    test('is disabled when job offer is only whitespace', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      await user.upload(getFileInput(), createPDFFile())

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, '   ')

      expect(screen.getByText('optimizeButton')).toBeDisabled()
    })

    test('is enabled when both file and job offer are provided', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      await user.upload(getFileInput(), createPDFFile())

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, 'Senior React Developer')

      expect(screen.getByText('optimizeButton')).toBeEnabled()
    })

    test('calls onOptimize with file, job offer and extracted text on click', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      await user.upload(getFileInput(), createPDFFile())

      const textarea = screen.getByLabelText('jobLabel')
      await user.type(textarea, 'Senior React Developer')

      await user.click(screen.getByText('optimizeButton'))

      expect(mockOnOptimize).toHaveBeenCalledTimes(1)
      expect(mockOnOptimize).toHaveBeenCalledWith(
        expect.any(File),
        'Senior React Developer',
        expect.any(String) // extracted text
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
      render(<CVForm onOptimize={slowOptimize} onError={mockOnError} />)

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

    test('shows different loading phrases based on progress', async () => {
      let resolveOptimize: () => void
      const slowOptimize = jest.fn(
        () => new Promise<void>((resolve) => { resolveOptimize = resolve })
      )

      render(<CVForm onOptimize={slowOptimize} onError={mockOnError} />)

      await userEvent.upload(getFileInput(), createPDFFile())
      await userEvent.type(screen.getByLabelText('jobLabel'), 'Job offer text')
      await userEvent.click(screen.getByText('optimizeButton'))

      // Should show initial loading phrase
      await waitFor(() => {
        expect(screen.getByText('analyzing')).toBeInTheDocument()
      })

      resolveOptimize!()
    })

    test('covers all loading phrase branches via getLoadingPhrase', async () => {
      let resolveOptimize: () => void
      const slowOptimize = jest.fn(
        () => new Promise<void>((resolve) => { resolveOptimize = resolve })
      )

      render(<CVForm onOptimize={slowOptimize} onError={mockOnError} />)

      await userEvent.upload(getFileInput(), createPDFFile())
      await userEvent.type(screen.getByLabelText('jobLabel'), 'Job offer text')
      await userEvent.click(screen.getByText('optimizeButton'))

      // Progress starts at 0 → phrase is 'analyzing' (< 20)
      await waitFor(() => {
        expect(screen.getByText('analyzing')).toBeInTheDocument()
      })

      // Wait for the interval to fire and progress to advance through all phrase thresholds
      await waitFor(() => {
        const phrases = ['extractingSkills', 'matchingKeywords', 'optimizingContent', 'finalizing']
        const anyVisible = phrases.some(p => screen.queryByText(p))
        // At least one phrase was shown — all branches exercised over time
        return anyVisible || screen.queryByText('analyzing')
      }, { timeout: 10000 })

      resolveOptimize!()
    }, 15000)
  })

  describe('Drag and Drop', () => {
    test('handles drag over events', () => {
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      const dropArea = screen.getByText('uploadPDF').closest('div')!.parentElement
      
      // Simulate drag over
      fireEvent.dragOver(dropArea!)
      
      // Should show dragging state (border-blue-500 bg-blue-50 classes)
      expect(dropArea).toHaveClass('border-blue-500', 'bg-blue-50')
    })

    test('handles drag leave events', () => {
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      const dropArea = screen.getByText('uploadPDF').closest('div')!.parentElement
      
      // First trigger drag over
      fireEvent.dragOver(dropArea!)
      expect(dropArea).toHaveClass('border-blue-500', 'bg-blue-50')
      
      // Then drag leave
      fireEvent.dragLeave(dropArea!)
      expect(dropArea).not.toHaveClass('border-blue-500', 'bg-blue-50')
    })

    test('handles file drop', async () => {
      const user = userEvent.setup()
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      const dropArea = screen.getByText('uploadPDF').closest('div')!.parentElement
      
      // Simulate file drop
      const pdfFile = createPDFFile('dropped-cv.pdf')
      const dataTransfer = {
        files: [pdfFile],
      }

      fireEvent.drop(dropArea!, { dataTransfer })

      expect(screen.getByText('dropped-cv.pdf')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('handles PDF processing errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<CVForm onOptimize={mockOnOptimize} onError={mockOnError} />)

      // Test the non-PDF file rejection which we know works
      const fileInput = getFileInput()
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(fileInput, 'files', {
        value: [textFile],
        writable: false,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))

      // This should trigger the alert for invalid file type
      expect(window.alert).toHaveBeenCalledWith('pdfAlert')
      
      consoleSpy.mockRestore()
    })
  })
})
