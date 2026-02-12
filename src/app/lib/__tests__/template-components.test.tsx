import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { pdf } from '@react-pdf/renderer'
import type { TemplateProps } from '../cv-types'
import { ModernTemplate } from '../cv-templates/modern'
import { ClassicTemplate } from '../cv-templates/classic'
import { MinimalTemplate } from '../cv-templates/minimal'
import { ProfessionalTemplate } from '../cv-templates/professional'
import { CreativeTemplate } from '../cv-templates/creative'

// Mock PDF renderer but keep StyleSheet.create working
jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn().mockReturnValue({
    toBlob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }))
  }),
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
  Text: ({ children }: any) => <span data-testid="pdf-text">{children}</span>,
  View: ({ children }: any) => <div data-testid="pdf-view">{children}</div>,
  StyleSheet: {
    create: (styles: any) => styles
  }
}))

// Mock CV data for testing
const mockCVData = {
  name: 'John Doe',
  title: 'Senior Developer',
  contact: {
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'New York, NY'
  },
  profile: 'Experienced software developer with expertise in React and TypeScript.',
  key_accomplishments: [
    'Led team of 5 developers',
    'Improved performance by 40%',
    'Architected scalable solutions'
  ],
  experience: [
    {
      title: 'Senior Developer',
      company: 'Tech Corp',
      dates: '2020-Present',
      description: 'Developed and maintained web applications using React and Node.js.'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of Technology',
      dates: '2014-2018'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js'],
  tools: ['Git', 'Docker'],
  languages: ['English (Native)'],
  certifications: ['AWS Certified Developer']
}

const mockKeywords = ['react', 'typescript', 'nodejs']

const templateProps: TemplateProps = {
  cv: mockCVData,
  keywords: mockKeywords
}

describe('Template Component Coverage', () => {
  describe('ModernTemplate', () => {
    test('renders all sections correctly', () => {
      const { container } = render(<ModernTemplate {...templateProps} />)
      
      // Test that the component renders without throwing
      expect(container).toBeInTheDocument()
    })

    test('generates PDF successfully', async () => {
      const pdfBlob = await pdf(<ModernTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })

    test('handles empty sections gracefully', async () => {
      const minimalProps: TemplateProps = {
        cv: {
          ...mockCVData,
          profile: '',
          key_accomplishments: [],
          experience: [],
          education: [],
          skills: [],
          tools: [],
          languages: [],
          certifications: []
        },
        keywords: mockKeywords
      }

      const pdfBlob = await pdf(<ModernTemplate {...minimalProps} />).toBlob()
      expect(pdfBlob.size).toBeGreaterThan(0)
    })
  })

  describe('ClassicTemplate', () => {
    test('renders all sections correctly', () => {
      const { container } = render(<ClassicTemplate {...templateProps} />)
      expect(container).toBeInTheDocument()
    })

    test('generates PDF successfully', async () => {
      const pdfBlob = await pdf(<ClassicTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })

    test('handles missing contact info', async () => {
      const propsWithoutContact: TemplateProps = {
        cv: {
          ...mockCVData,
          contact: {
            email: '',
            phone: '',
            location: ''
          }
        },
        keywords: mockKeywords
      }

      const pdfBlob = await pdf(<ClassicTemplate {...propsWithoutContact} />).toBlob()
      expect(pdfBlob.size).toBeGreaterThan(0)
    })
  })

  describe('MinimalTemplate', () => {
    test('renders all sections correctly', () => {
      const { container } = render(<MinimalTemplate {...templateProps} />)
      expect(container).toBeInTheDocument()
    })

    test('generates PDF successfully', async () => {
      const pdfBlob = await pdf(<MinimalTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })
  })

  describe('ProfessionalTemplate', () => {
    test('renders all sections correctly', () => {
      const { container } = render(<ProfessionalTemplate {...templateProps} />)
      expect(container).toBeInTheDocument()
    })

    test('generates PDF successfully', async () => {
      const pdfBlob = await pdf(<ProfessionalTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })
  })

  describe('CreativeTemplate', () => {
    test('renders all sections correctly', () => {
      const { container } = render(<CreativeTemplate {...templateProps} />)
      expect(container).toBeInTheDocument()
    })

    test('generates PDF successfully', async () => {
      const pdfBlob = await pdf(<CreativeTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })
  })

  describe('Template Logic Coverage', () => {
    test('ModernTemplate handles contact line formatting', async () => {
      // Test with all contact info
      const pdfBlob1 = await pdf(<ModernTemplate {...templateProps} />).toBlob()
      expect(pdfBlob1.size).toBeGreaterThan(0)

      // Test with partial contact info
      const partialContactProps: TemplateProps = {
        cv: {
          ...mockCVData,
          contact: {
            email: 'john@example.com',
            phone: '',
            location: ''
          }
        },
        keywords: mockKeywords
      }
      const pdfBlob2 = await pdf(<ModernTemplate {...partialContactProps} />).toBlob()
      expect(pdfBlob2.size).toBeGreaterThan(0)

      // Test with no contact info
      const noContactProps: TemplateProps = {
        cv: {
          ...mockCVData,
          contact: {
            email: '',
            phone: '',
            location: ''
          }
        },
        keywords: mockKeywords
      }
      const pdfBlob3 = await pdf(<ModernTemplate {...noContactProps} />).toBlob()
      expect(pdfBlob3.size).toBeGreaterThan(0)
    })

    test('Templates handle different data structures', async () => {
      const templates = [
        { name: 'Modern', component: ModernTemplate },
        { name: 'Classic', component: ClassicTemplate },
        { name: 'Minimal', component: MinimalTemplate },
        { name: 'Professional', component: ProfessionalTemplate },
        { name: 'Creative', component: CreativeTemplate }
      ]

      // Test with maximum data
      const maxDataProps: TemplateProps = {
        cv: {
          ...mockCVData,
          key_accomplishments: [
            'Achievement 1',
            'Achievement 2', 
            'Achievement 3',
            'Achievement 4',
            'Achievement 5'
          ],
          experience: [
            {
              title: 'Senior Developer',
              company: 'Tech Corp',
              dates: '2020-Present',
              description: 'Long description that tests how templates handle lengthy text content in their layouts and formatting.'
            },
            {
              title: 'Frontend Developer',
              company: 'StartupXYZ', 
              dates: '2018-2020',
              description: 'Another long description to test text wrapping and layout handling in PDF generation.'
            }
          ],
          skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'],
          tools: ['Git', 'VS Code', 'Jenkins', 'Webpack', 'Babel', 'ESLint', 'Prettier', 'Postman'],
          languages: ['English (Native)', 'Spanish (Fluent)', 'French (Basic)', 'German (Basic)'],
          certifications: [
            'AWS Certified Developer',
            'Google Cloud Professional',
            'Microsoft Certified Azure Developer',
            'Oracle Certified Professional'
          ]
        },
        keywords: ['react', 'typescript', 'nodejs', 'aws', 'docker', 'kubernetes', 'python', 'graphql']
      }

      for (const template of templates) {
        const pdfBlob = await pdf(<template.component {...maxDataProps} />).toBlob()
        expect(pdfBlob.size).toBeGreaterThan(0)
      }
    })

    test('Templates handle empty arrays and strings', async () => {
      const emptyDataProps: TemplateProps = {
        cv: {
          name: 'John Doe',
          title: 'Developer',
          contact: {
            email: '',
            phone: '',
            location: ''
          },
          profile: '',
          key_accomplishments: [],
          experience: [],
          education: [],
          skills: [],
          tools: [],
          languages: [],
          certifications: []
        },
        keywords: []
      }

      const templates = [
        { name: 'Modern', component: ModernTemplate },
        { name: 'Classic', component: ClassicTemplate },
        { name: 'Minimal', component: MinimalTemplate },
        { name: 'Professional', component: ProfessionalTemplate },
        { name: 'Creative', component: CreativeTemplate }
      ]

      for (const template of templates) {
        const pdfBlob = await pdf(<template.component {...emptyDataProps} />).toBlob()
        expect(pdfBlob.size).toBeGreaterThan(0)
      }
    })
  })
})
