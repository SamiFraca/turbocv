import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LanguageSwitcher from '../language-switcher'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
  useTranslations: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: jest.fn(),
}))

jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
}))

describe('LanguageSwitcher', () => {
  const mockReplace = jest.fn()
  const mockStartTransition = jest.fn((callback) => callback())
  const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
    }
    return translations[key] || key
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    })
    ;(useTranslations as jest.Mock).mockReturnValue(mockT)
    ;(useTransition as jest.Mock).mockReturnValue([false, mockStartTransition])
  })

  test('renders language buttons for all available locales', () => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')

    render(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spanish' })).toBeInTheDocument()
  })

  test('marks current locale button as disabled', () => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')

    render(<LanguageSwitcher />)

    const englishButton = screen.getByRole('button', { name: 'English' })
    const spanishButton = screen.getByRole('button', { name: 'Spanish' })

    expect(englishButton).toBeDisabled()
    expect(spanishButton).not.toBeDisabled()
  })

  test('applies correct CSS classes to active locale button', () => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')

    render(<LanguageSwitcher />)

    const englishButton = screen.getByRole('button', { name: 'English' })
    const spanishButton = screen.getByRole('button', { name: 'Spanish' })

    expect(englishButton).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(spanishButton).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  test('changes locale when clicking inactive language button', async () => {
    const user = userEvent.setup()
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')

    render(<LanguageSwitcher />)

    const spanishButton = screen.getByRole('button', { name: 'Spanish' })
    await user.click(spanishButton)

    expect(mockStartTransition).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith('/es/home')
  })

  test('correctly replaces locale in pathname', async () => {
    const user = userEvent.setup()
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/dashboard/settings')

    render(<LanguageSwitcher />)

    const spanishButton = screen.getByRole('button', { name: 'Spanish' })
    await user.click(spanishButton)

    expect(mockReplace).toHaveBeenCalledWith('/es/dashboard/settings')
  })

  test('handles root path correctly', async () => {
    const user = userEvent.setup()
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en')

    render(<LanguageSwitcher />)

    const spanishButton = screen.getByRole('button', { name: 'Spanish' })
    await user.click(spanishButton)

    expect(mockReplace).toHaveBeenCalledWith('/es')
  })

  test('disables all buttons when transition is pending', () => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')
    ;(useTransition as jest.Mock).mockReturnValue([true, mockStartTransition])

    render(<LanguageSwitcher />)

    const englishButton = screen.getByRole('button', { name: 'English' })
    const spanishButton = screen.getByRole('button', { name: 'Spanish' })

    expect(englishButton).toBeDisabled()
    expect(spanishButton).toBeDisabled()
  })

  test('uses translations from languageSwitcher namespace', () => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')

    render(<LanguageSwitcher />)

    expect(useTranslations).toHaveBeenCalledWith('languageSwitcher')
    expect(mockT).toHaveBeenCalledWith('en')
    expect(mockT).toHaveBeenCalledWith('es')
  })

  test('renders with correct container structure', () => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')

    const { container } = render(<LanguageSwitcher />)

    const wrapper = container.querySelector('div')
    expect(wrapper).toHaveClass('flex', 'gap-2')
  })

  test('applies opacity class to disabled buttons', () => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(usePathname as jest.Mock).mockReturnValue('/en/home')

    render(<LanguageSwitcher />)

    const englishButton = screen.getByRole('button', { name: 'English' })
    expect(englishButton).toHaveClass('disabled:opacity-50')
  })

  test('switches from Spanish to English', async () => {
    const user = userEvent.setup()
    ;(useLocale as jest.Mock).mockReturnValue('es')
    ;(usePathname as jest.Mock).mockReturnValue('/es/home')

    render(<LanguageSwitcher />)

    const englishButton = screen.getByRole('button', { name: 'English' })
    const spanishButton = screen.getByRole('button', { name: 'Spanish' })

    expect(spanishButton).toBeDisabled()
    expect(englishButton).not.toBeDisabled()

    await user.click(englishButton)

    expect(mockReplace).toHaveBeenCalledWith('/en/home')
  })
})
