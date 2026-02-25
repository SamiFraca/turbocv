const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/',
    '<rootDir>/e2e/',
    '<rootDir>/*.spec.ts',
    '<rootDir>/*.test.ts',
    '<rootDir>/src/app/components/__tests__/cv-form.test.tsx'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!tests/**/*',
    '!e2e/**/*',
    '!src/app/api/**/*',
    '!src/app/lib/pdf-render.ts',
    '!src/app/lib/pdf.ts',
    '!src/app/components/sections/**/*',
    '!src/app/utils/**/*',
    '!src/app/components/cv-form.tsx',
    '!src/proxy.ts',
    '!src/app/[locale]/*'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
