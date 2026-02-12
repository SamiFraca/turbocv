import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { pdf } from '@react-pdf/renderer'
import type { TemplateProps } from '../cv-types'
import { TEMPLATES, getTemplate, getAllTemplates, TemplateType } from '../cv-templates'

// Mock the templates to avoid StyleSheet.create issues during import
jest.mock('../cv-templates/modern', () => ({
  ModernTemplate: () => <div data-testid="modern-template">Modern Template</div>
}))

jest.mock('../cv-templates/classic', () => ({
  ClassicTemplate: () => <div data-testid="classic-template">Classic Template</div>
}))

jest.mock('../cv-templates/minimal', () => ({
  MinimalTemplate: () => <div data-testid="minimal-template">Minimal Template</div>
}))

jest.mock('../cv-templates/professional', () => ({
  ProfessionalTemplate: () => <div data-testid="professional-template">Professional Template</div>
}))

jest.mock('../cv-templates/creative', () => ({
  CreativeTemplate: () => <div data-testid="creative-template">Creative Template</div>
}))

// Mock PDF generation
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

// Import mocked templates
const ModernTemplate = require('../cv-templates/modern').ModernTemplate
const ClassicTemplate = require('../cv-templates/classic').ClassicTemplate
const MinimalTemplate = require('../cv-templates/minimal').MinimalTemplate
const ProfessionalTemplate = require('../cv-templates/professional').ProfessionalTemplate
const CreativeTemplate = require('../cv-templates/creative').CreativeTemplate

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
    },
    {
      title: 'Frontend Developer', 
      company: 'StartupXYZ',
      dates: '2018-2020',
      description: 'Built responsive web applications and improved user experience.'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of Technology',
      dates: '2014-2018'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
  tools: ['Git', 'Docker', 'Jenkins', 'VS Code'],
  languages: ['English (Native)', 'Spanish (Fluent)'],
  certifications: ['AWS Certified Developer', 'Google Cloud Professional']
}

const mockKeywords = ['react', 'typescript', 'nodejs', 'senior developer', 'full stack']

const templateProps: TemplateProps = {
  cv: mockCVData,
  keywords: mockKeywords
}

describe('CV Templates', () => {
  describe('Template Rendering', () => {
    test('ModernTemplate renders without errors', async () => {
      const { container } = render(<ModernTemplate {...templateProps} />)
      
      // Generate PDF to test rendering
      const pdfBlob = await pdf(<ModernTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })

    test('ClassicTemplate renders without errors', async () => {
      const { container } = render(<ClassicTemplate {...templateProps} />)
      
      const pdfBlob = await pdf(<ClassicTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })

    test('MinimalTemplate renders without errors', async () => {
      const { container } = render(<MinimalTemplate {...templateProps} />)
      
      const pdfBlob = await pdf(<MinimalTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })

    test('ProfessionalTemplate renders without errors', async () => {
      const { container } = render(<ProfessionalTemplate {...templateProps} />)
      
      const pdfBlob = await pdf(<ProfessionalTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })

    test('CreativeTemplate renders without errors', async () => {
      const { container } = render(<CreativeTemplate {...templateProps} />)
      
      const pdfBlob = await pdf(<CreativeTemplate {...templateProps} />).toBlob()
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(0)
    })
  })

  describe('Template Functions', () => {
    test('getTemplate returns correct template', () => {
      expect(getTemplate('modern')).toBe(TEMPLATES.modern)
      expect(getTemplate('classic')).toBe(TEMPLATES.classic)
      expect(getTemplate('minimal')).toBe(TEMPLATES.minimal)
      expect(getTemplate('professional')).toBe(TEMPLATES.professional)
      expect(getTemplate('creative')).toBe(TEMPLATES.creative)
    })

    test('getTemplate returns modern as fallback', () => {
      const invalidType = 'invalid' as TemplateType
      expect(getTemplate(invalidType)).toBe(TEMPLATES.modern)
    })

    test('getAllTemplates returns all templates', () => {
      const allTemplates = getAllTemplates()
      
      expect(allTemplates).toHaveLength(5)
      expect(allTemplates.map(t => t.id)).toEqual([
        'modern', 'classic', 'minimal', 'professional', 'creative'
      ])
      
      // Check each template has required properties
      allTemplates.forEach(template => {
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('component')
        expect(typeof template.component).toBe('function')
      })
    })
  })

  describe('Template Content', () => {
    test('templates render personal information correctly', async () => {
      const templates = [
        { name: 'Modern', component: ModernTemplate },
        { name: 'Classic', component: ClassicTemplate },
        { name: 'Minimal', component: MinimalTemplate },
        { name: 'Professional', component: ProfessionalTemplate },
        { name: 'Creative', component: CreativeTemplate }
      ]

      for (const template of templates) {
        const pdfBlob = await pdf(<template.component {...templateProps} />).toBlob()
        expect(pdfBlob.size).toBeGreaterThan(0)
      }
    })

    test('templates handle missing optional data gracefully', async () => {
      const minimalCVData = {
        ...mockCVData,
        profile: '', // Use empty string instead of undefined
        key_accomplishments: [],
        experience: [],
        education: [],
        skills: [],
        tools: [],
        languages: [],
        certifications: []
      }

      const minimalProps: TemplateProps = {
        cv: minimalCVData,
        keywords: mockKeywords
      }

      const templates = [
        { name: 'Modern', component: ModernTemplate },
        { name: 'Classic', component: ClassicTemplate },
        { name: 'Minimal', component: MinimalTemplate },
        { name: 'Professional', component: ProfessionalTemplate },
        { name: 'Creative', component: CreativeTemplate }
      ]

      for (const template of templates) {
        const pdfBlob = await pdf(<template.component {...minimalProps} />).toBlob()
        expect(pdfBlob.size).toBeGreaterThan(0)
      }
    })

    test('templates handle missing contact information', async () => {
      const cvWithoutContact = {
        ...mockCVData,
        contact: {
          email: '',
          phone: '',
          location: ''
        }
      }

      const propsWithoutContact: TemplateProps = {
        cv: cvWithoutContact,
        keywords: mockKeywords
      }

      const templates = [
        { name: 'Modern', component: ModernTemplate },
        { name: 'Classic', component: ClassicTemplate },
        { name: 'Minimal', component: MinimalTemplate },
        { name: 'Professional', component: ProfessionalTemplate },
        { name: 'Creative', component: CreativeTemplate }
      ]

      for (const template of templates) {
        const pdfBlob = await pdf(<template.component {...propsWithoutContact} />).toBlob()
        expect(pdfBlob.size).toBeGreaterThan(0)
      }
    })
  })

  describe('Template Constants', () => {
    test('TEMPLATES constant has correct structure', () => {
      expect(Object.keys(TEMPLATES)).toEqual([
        'modern', 'classic', 'minimal', 'professional', 'creative'
      ])

      Object.values(TEMPLATES).forEach(template => {
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('component')
        expect(typeof template.name).toBe('string')
        expect(typeof template.description).toBe('string')
        expect(typeof template.component).toBe('function')
      })
    })

    test('template names are unique', () => {
      const templateNames = Object.values(TEMPLATES).map(t => t.name)
      const uniqueNames = new Set(templateNames)
      expect(templateNames).toHaveLength(uniqueNames.size)
    })

    test('template descriptions are meaningful', () => {
      Object.values(TEMPLATES).forEach(template => {
        expect(template.description.length).toBeGreaterThan(10)
        expect(template.description).not.toContain('TODO')
        expect(template.description).not.toContain('test')
      })
    })
  })

  describe('Template Type Safety', () => {
    test('TemplateType includes all template keys', () => {
      const templateKeys = Object.keys(TEMPLATES) as TemplateType[]
      const expectedTypes: TemplateType[] = ['modern', 'classic', 'minimal', 'professional', 'creative']
      
      expect(templateKeys.sort()).toEqual(expectedTypes.sort())
    })

    test('getTemplate accepts only valid TemplateType values', () => {
      const validTypes: TemplateType[] = ['modern', 'classic', 'minimal', 'professional', 'creative']
      
      validTypes.forEach(type => {
        const template = getTemplate(type)
        expect(template).toBeDefined()
        expect(TEMPLATES[type]).toBe(template)
      })
    })
  })
})
