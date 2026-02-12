import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test example
describe('Example Test', () => {
  test('should render without crashing', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  test('should show correct text', () => {
    render(<div>Hello Jest</div>)
    expect(screen.getByText('Hello Jest')).toBeInTheDocument()
  })
})
