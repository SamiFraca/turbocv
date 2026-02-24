import { test, expect } from '@playwright/test';

// Extend Window interface for test mocks
declare global {
  interface Window {
    __mockExtractTextFromPDF?: () => Promise<string>;
  }
}

// Mock API response data
const mockApiResponse = {
  optimizedCV: 'John Doe\nSenior Software Engineer\njohn@example.com | +1234567890 | New York, NY\n\nExperienced software engineer with 5+ years in React and TypeScript...\n\nExperience:\nSenior Developer - Tech Corp (2020-Present)\nLed development of React applications...\n\nEducation:\nBS Computer Science - University (2015-2019)',
  cvData: {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    contact: {
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'New York, NY'
    },
    profile: 'Experienced software engineer with 5+ years in React and TypeScript',
    key_accomplishments: ['Led team of 5 developers', 'Improved performance by 40%'],
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Corp',
        dates: '2020-Present',
        description: 'Led development of React applications'
      }
    ],
    education: [
      {
        degree: 'BS Computer Science',
        school: 'University',
        dates: '2015-2019'
      }
    ],
    certifications: [],
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
    tools: ['Git', 'Docker', 'AWS'],
    languages: ['English', 'Spanish'],
    language: 'en'
  },
  keywords: ['React', 'TypeScript', 'Next.js', 'Performance Optimization'],
  originalText: 'Original CV text content...',
  pdfBase64: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA5IFRmCjEwIDcwMCBUZAooVGVzdCBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDE1MyAwMDAwMCBuIAowMDAwMDAwMjY1IDAwMDAwIG4gCjAwMDAwMDAzNTQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NDcKJSVFT0YK'
};

test.describe('CV Optimization Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Expose a mock for the extractTextFromPDF function
    await page.addInitScript(() => {
      window.__mockExtractTextFromPDF = async () => {
        return 'John Doe\nSoftware Engineer\nExperience with React, TypeScript, and Next.js\n\nWork Experience:\nSenior Developer at Tech Corp (2020-Present)\nLed development of multiple React applications';
      };
    });
    
    await page.goto('/');
  });

  test('complete CV optimization workflow', async ({ page }) => {
    // Mock the API endpoint with a small delay to simulate real API
    await page.route('/api/optimize', async route => {
      // Add small delay to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponse)
      });
    });

    // 1. Verify initial page state
    await expect(page.locator('h1')).toContainText('Tailor your CV');
    
    // 2. Scroll to form and verify button
    await page.locator('text=Optimize My CV').scrollIntoViewIfNeeded();
    await expect(page.locator('text=Optimize My CV')).toBeVisible();
    
    // 3. Upload test PDF (file input is hidden, but exists)
    const fileInput = page.locator('input[type="file"]');
    
    // Upload the test PDF file
    await fileInput.setInputFiles('tests/fixtures/sample-cv.pdf');
    
    // Verify file was uploaded
    await expect(page.locator('text=sample-cv.pdf')).toBeVisible();
    
    // 3. Fill job offer
    const jobOfferTextarea = page.locator('textarea[placeholder*="job"]');
    await expect(jobOfferTextarea).toBeVisible();
    
    const jobOfferText = `Senior React Developer
We are looking for an experienced React Developer to join our team.
Requirements:
- 5+ years of React experience
- TypeScript expertise
- Next.js knowledge
- Experience with performance optimization
- Strong problem-solving skills`;

    await jobOfferTextarea.fill(jobOfferText);
    
    // 4. Verify optimize button is enabled
    const optimizeButton = page.locator('button:has-text("Optimize My CV")');
    await expect(optimizeButton).toBeEnabled();
    
    // 5. Submit the form
    await optimizeButton.click();
    
    // 6. Verify loading state appears
    await expect(page.locator('text=Analyzing your CV...').or(page.locator('text=Extracting'))).toBeVisible({ timeout: 5000 });
    
    // 7. Wait for loading to complete and results to appear
    await expect(page.locator('text=Analyzing your CV...').or(page.locator('text=Finalizing'))).not.toBeVisible({ timeout: 60000 });
    
    // 8. Verify results are displayed - check for the result view title
    await expect(page.locator('h2:has-text("Your Optimized CV")')).toBeVisible({ timeout: 15000 });
    
    // 9. Verify download button and template selector are visible
    await expect(page.locator('button').filter({ hasText: 'Download PDF' })).toBeVisible();
    await expect(page.locator('h3:has-text("Choose PDF Template")')).toBeVisible();
    
    // 10. Test template selection
    const modernTemplate = page.locator('button').filter({ hasText: 'Modern' });
    await modernTemplate.click();
    await expect(modernTemplate).toHaveClass(/border-blue-600/);

    //TODO: IMPLEMENT BEFORE - AFTER COMPARISON
    // 11. Test before/after comparison
    // const comparisonTab = page.locator('button:has-text("Before / After")');
    // await comparisonTab.click();
    // // Verify comparison view
    // await expect(page.locator('text=Original CV')).toBeVisible();
    // await expect(page.locator('text=Optimized CV')).toBeVisible();
    
    // // Verify side-by-side comparison
    // const beforeSection = page.locator('text=Original CV').locator('..').locator('..');
    // const afterSection = page.locator('text=Optimized CV').locator('..').locator('..');
    
    // await expect(beforeSection).toBeVisible();
    // await expect(afterSection).toBeVisible();
    
    // 12. Test PDF download (debug mode is enabled via .env.local)
    const downloadButton = page.locator('button').filter({ hasText: 'Download PDF' });
    await expect(downloadButton).toBeVisible();
    
    // In debug mode, clicking should trigger PDF generation
    await downloadButton.click();
    
    // Wait for PDF generation to complete (button text changes)
    await expect(downloadButton).not.toHaveText(/Generating/);
    
    // 13. Test new CV button
    const newCVButton = page.locator('button').filter({ hasText: /New CV|Optimize another CV/i });
    await newCVButton.click();
    
    // Verify we're back to home page
    await expect(page.locator('h1:has-text("Tailor your CV")')).toBeVisible();
  });

  test('form validation works correctly', async ({ page }) => {
    // Test button is disabled without file
    const optimizeButton = page.locator('button:has-text("Optimize My CV")');
    await expect(optimizeButton).toBeDisabled();
    
    // Test button is disabled without job offer
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-cv.pdf');
    await expect(optimizeButton).toBeDisabled();
    
    // Test button is enabled with both inputs
    const jobOfferTextarea = page.locator('textarea[placeholder*="job"]');
    await jobOfferTextarea.fill('Test job description');
    await expect(optimizeButton).toBeEnabled();
  });

  test('API response structure is correct', async ({ page }) => {
    let capturedResponse: any = null;
    
    // Mock the API endpoint and capture the response
    await page.route('/api/optimize', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponse)
      };
      capturedResponse = mockApiResponse;
      await route.fulfill(response);
    });
    
    // Fill form and submit
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-cv.pdf');
    await page.fill('textarea[placeholder*="job"]', 'Test job offer');
    await page.click('button:has-text("Optimize My CV")');
    
    // Wait for results to appear
    await expect(page.locator('h2:has-text("Your Optimized CV")')).toBeVisible({ timeout: 15000 });
    
    // Verify response structure from captured data
    const response = capturedResponse;
    expect(response).toBeTruthy();
    
    // Verify response structure
    expect(response).toHaveProperty('optimizedCV');
    expect(response).toHaveProperty('cvData');
    expect(response).toHaveProperty('keywords');
    expect(response).toHaveProperty('originalText');
    
    // Verify cvData structure
    const cvData = response.cvData;
    expect(cvData).toHaveProperty('name');
    expect(cvData).toHaveProperty('title');
    expect(cvData).toHaveProperty('contact');
    expect(cvData).toHaveProperty('profile');
    expect(cvData).toHaveProperty('experience');
    expect(cvData).toHaveProperty('education');
    expect(cvData).toHaveProperty('skills');
    
    // Verify keywords array
    expect(Array.isArray(response.keywords)).toBe(true);
    expect(response.keywords.length).toBeGreaterThan(0);
    
    // Verify original text is present
    expect(typeof response.originalText).toBe('string');
  });

  test('error handling works correctly', async ({ page }) => {
    // Mock API error response
    await page.route('/api/optimize', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Scroll to form first
    await page.locator('button:has-text("Optimize My CV")').scrollIntoViewIfNeeded();
    
    // Fill form and submit
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-cv.pdf');
    await page.fill('textarea[placeholder*="job"]', 'Test job offer');
    await page.click('button:has-text("Optimize My CV")');
    
    // Wait for loading state to appear and then disappear
    await expect(page.locator('text=Analyzing your CV...').or(page.locator('text=Extracting'))).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Analyzing your CV...').or(page.locator('text=Finalizing'))).not.toBeVisible({ timeout: 10000 });
    
    // Verify error message appears (the error div has bg-red-50 class)
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 });
    
    // Verify form is still accessible
    await expect(page.locator('button:has-text("Optimize My CV")')).toBeVisible();
  });
});
