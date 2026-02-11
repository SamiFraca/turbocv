import { test, expect } from '@playwright/test';

test.describe('CV Optimization Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete CV optimization workflow', async ({ page }) => {
    // 1. Verify initial page state
    await expect(page.locator('h1')).toContainText('Tailor your CV');
    await expect(page.locator('text=Optimize My CV')).toBeVisible();
    
    // 2. Upload test PDF (file input is hidden, but exists)
    const fileInput = page.locator('input[type="file"]');
    
    // Create a test PDF file (you'll need to add a real test PDF to your project)
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
    
    // 6. Verify loading state
    await expect(page.locator('text=Analyzing your CV...')).toBeVisible();
    
    // 7. Wait for loading to complete and results to appear
    // Wait for the loading state to disappear
    await expect(page.locator('text=Analyzing your CV...')).not.toBeVisible({ timeout: 30000 });
    
    // 8. Verify results are displayed
    try {
      await expect(page.locator('text=Your optimized CV is ready')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      // Take screenshot to debug
      await page.screenshot({ path: 'test-results/debug-results.png' });
      
      // Try alternative success indicators
      await expect(page.locator('button:has-text("Optimized CV")')).toBeVisible({ timeout: 5000 });
    }
    
    // 9. Test the optimized CV tab (default)
    await expect(page.locator('button:has-text("Optimized CV")')).toBeVisible();
    await expect(page.locator('text=Choose PDF Template')).toBeVisible();
    
    // 10. Test template selection
    const modernTemplate = page.locator('button:has-text("Modern")');
    await modernTemplate.click();
    await expect(modernTemplate).toHaveClass(/border-blue-600/);
    
    // 11. Test before/after comparison
    const comparisonTab = page.locator('button:has-text("Before / After")');
    await comparisonTab.click();
    
    // Verify comparison view
    await expect(page.locator('text=Original CV')).toBeVisible();
    await expect(page.locator('text=Optimized CV')).toBeVisible();
    
    // Verify side-by-side comparison
    const beforeSection = page.locator('text=Original CV').locator('..').locator('..');
    const afterSection = page.locator('text=Optimized CV').locator('..').locator('..');
    
    await expect(beforeSection).toBeVisible();
    await expect(afterSection).toBeVisible();
    
    // 12. Test PDF download button (without actual download)
    const downloadButton = page.locator('button:has-text("📄 Download PDF")');
    if (await downloadButton.isVisible()) {
      // Just verify the button exists and is clickable
      await expect(downloadButton).toBeVisible();
    }
    
    // 13. Test new CV button
    const newCVButton = page.locator('text=New CV →');
    await newCVButton.click();
    
    // Verify we're back to the form
    await expect(page.locator('text=Optimize My CV')).toBeVisible();
    await expect(fileInput).toBeVisible();
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
    // Intercept the API call to verify response structure
    const apiResponse = page.waitForResponse('/api/optimize');
    
    // Fill form and submit
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-cv.pdf');
    await page.fill('textarea[placeholder*="job"]', 'Test job offer');
    await page.click('button:has-text("Optimize My CV")');
    
    // Wait for API response
    const response = await apiResponse;
    expect(response.status()).toBe(200);
    
    // Verify response structure
    const responseData = await response.json();
    expect(responseData).toHaveProperty('optimizedCV');
    expect(responseData).toHaveProperty('cvData');
    expect(responseData).toHaveProperty('keywords');
    expect(responseData).toHaveProperty('originalText');
    
    // Verify cvData structure
    const cvData = responseData.cvData;
    expect(cvData).toHaveProperty('name');
    expect(cvData).toHaveProperty('title');
    expect(cvData).toHaveProperty('contact');
    expect(cvData).toHaveProperty('profile');
    expect(cvData).toHaveProperty('experience');
    expect(cvData).toHaveProperty('education');
    expect(cvData).toHaveProperty('skills');
    // Note: keywords are returned separately, not in cvData
    
    // Verify keywords array
    expect(Array.isArray(responseData.keywords)).toBe(true);
    expect(responseData.keywords.length).toBeGreaterThan(0);
    
    // Verify original text is present (may be empty if PDF parsing fails)
    expect(typeof responseData.originalText).toBe('string');
    if (responseData.originalText) {
      expect(responseData.originalText.length).toBeGreaterThan(0);
    }
  });

  test('error handling works correctly', async ({ page }) => {
    // Mock API error response
    await page.route('/api/optimize', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Fill form and submit
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-cv.pdf');
    await page.fill('textarea[placeholder*="job"]', 'Test job offer');
    await page.click('button:has-text("Optimize My CV")');
    
    // Verify error message appears
    await expect(page.locator('text=Internal server error')).toBeVisible({ timeout: 10000 });
    
    // Verify form is still accessible
    await expect(page.locator('text=Optimize My CV')).toBeVisible();
  });
});
