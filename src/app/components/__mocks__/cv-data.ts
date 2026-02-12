import type { StructuredCV } from '../../../lib/cv-types'

export const mockCVResult = {
  optimizedCV: `John Doe
Senior Full Stack Developer
New York, NY | john@example.com | +1 (234) 567-8900

PROFESSIONAL SUMMARY
Experienced Senior Full Stack Developer with 7+ years of expertise in React, TypeScript, and Node.js. Proven track record of leading cross-functional teams and delivering scalable solutions that improve performance by 40% and reduce operational costs by 25%.

KEY ACHIEVEMENTS
• Led team of 5 developers to rebuild company's e-commerce platform, resulting in 40% performance improvement
• Implemented CI/CD pipeline that reduced deployment time by 60% and increased code quality
• Architected microservices solution that handled 1M+ daily users with 99.9% uptime
• Mentored 3 junior developers who promoted to senior roles within 18 months

TECHNICAL EXPERIENCE
Senior Full Stack Developer | Tech Corp Inc. | 2020-Present
• Lead development of React-based dashboard serving 500K+ daily users
• Architected RESTful APIs using Node.js and Express, handling 10M+ requests monthly
• Implemented automated testing suite increasing code coverage from 60% to 95%
• Optimized database queries reducing average response time by 45%

Full Stack Developer | StartupXYZ | 2018-2020
• Built and launched MVP using React and Node.js, securing $2M Series A funding
• Developed real-time collaboration features using WebSockets and Redis
• Integrated third-party payment systems processing $1M+ in transactions

Frontend Developer | Digital Agency | 2016-2018
• Developed responsive websites for 20+ clients using React and modern CSS
• Improved website performance scores from 65 to 95 on average across client portfolio
• Implemented SEO best practices increasing organic traffic by 150%

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2012-2016
GPA: 3.8/4.0, Dean's List 4 semesters

TECHNICAL SKILLS
Frontend: React, TypeScript, Next.js, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, Python, Django, PostgreSQL, MongoDB
DevOps: Docker, Kubernetes, AWS, CI/CD, Git, Jenkins
Tools: Webpack, Vite, Jest, Cypress, Figma, Jira

CERTIFICATIONS
• AWS Certified Solutions Architect (2023)
• Google Cloud Professional Developer (2022)
• MongoDB Certified Developer (2021)

LANGUAGES
English (Native), Spanish (Fluent), Portuguese (Basic)`,

  keywords: [
    'senior full stack developer',
    'react',
    'typescript',
    'nodejs',
    'aws',
    'team leadership',
    'performance optimization',
    'microservices',
    'api development',
    'devops'
  ],

  originalText: `John Doe
Senior Developer
john@example.com
+1234567890
New York

I am a developer with experience in React and Node.js. I have worked at Tech Corp where I did web development. Before that I was at StartupXYZ where I built websites. I know JavaScript, React, Node.js, and some databases. I have a degree in Computer Science. I am looking for a senior developer position.`,

  cvData: {
    name: 'John Doe',
    title: 'Senior Full Stack Developer',
    contact: {
      email: 'john@example.com',
      phone: '+1 (234) 567-8900',
      location: 'New York, NY'
    },
    profile: 'Experienced Senior Full Stack Developer with 7+ years of expertise in React, TypeScript, and Node.js. Proven track record of leading cross-functional teams and delivering scalable solutions that improve performance by 40% and reduce operational costs by 25%.',
    key_accomplishments: [
      'Led team of 5 developers to rebuild company\'s e-commerce platform, resulting in 40% performance improvement',
      'Implemented CI/CD pipeline that reduced deployment time by 60% and increased code quality',
      'Architected microservices solution that handled 1M+ daily users with 99.9% uptime',
      'Mentored 3 junior developers who promoted to senior roles within 18 months'
    ],
    experience: [
      {
        title: 'Senior Full Stack Developer',
        company: 'Tech Corp Inc.',
        dates: '2020-Present',
        description: 'Lead development of React-based dashboard serving 500K+ daily users. Architected RESTful APIs using Node.js and Express, handling 10M+ requests monthly. Implemented automated testing suite increasing code coverage from 60% to 95%. Optimized database queries reducing average response time by 45%.'
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        dates: '2018-2020',
        description: 'Built and launched MVP using React and Node.js, securing $2M Series A funding. Developed real-time collaboration features using WebSockets and Redis. Integrated third-party payment systems processing $1M+ in transactions.'
      },
      {
        title: 'Frontend Developer',
        company: 'Digital Agency',
        dates: '2016-2018',
        description: 'Developed responsive websites for 20+ clients using React and modern CSS. Improved website performance scores from 65 to 95 on average across client portfolio. Implemented SEO best practices increasing organic traffic by 150%.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Technology',
        dates: '2012-2016'
      }
    ],
    skills: [
      'React',
      'TypeScript',
      'Next.js',
      'Vue.js',
      'HTML5',
      'CSS3',
      'Tailwind CSS',
      'Node.js',
      'Express',
      'Python',
      'Django',
      'PostgreSQL',
      'MongoDB'
    ],
    tools: [
      'Docker',
      'Kubernetes',
      'AWS',
      'CI/CD',
      'Git',
      'Jenkins',
      'Webpack',
      'Vite',
      'Jest',
      'Cypress',
      'Figma',
      'Jira'
    ],
    languages: ['English (Native)', 'Spanish (Fluent)', 'Portuguese (Basic)'],
    certifications: [
      'AWS Certified Solutions Architect (2023)',
      'Google Cloud Professional Developer (2022)',
      'MongoDB Certified Developer (2021)'
    ]
  } as StructuredCV
}

export const minimalCVResult = {
  optimizedCV: 'Optimized CV content with basic information.',
  keywords: ['developer', 'javascript'],
  originalText: 'Original basic CV content.'
}

export const emptyCVResult = {
  optimizedCV: 'Optimized content only.',
  keywords: ['keyword']
}
