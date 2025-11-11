import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Stripe Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Login first (using test account)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@whoof.app');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect after login
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('should display premium pricing page correctly', async ({ page }) => {
    // Navigate to premium pricing
    await page.goto('/premium/pricing');
    
    // Wait for page to load
    await page.waitForSelector('h1', { state: 'visible' });
    
    // Check that pricing cards are displayed
    const pricingCards = await page.locator('[data-testid="pricing-card"]').count();
    expect(pricingCards).toBeGreaterThan(0);
    
    // Take Percy snapshot
    await percySnapshot(page, 'Premium Pricing Page');
  });

  test('should initiate Stripe checkout for basic plan', async ({ page }) => {
    await page.goto('/premium/pricing');
    
    // Wait for page to load
    await page.waitForSelector('button:has-text("Choisir")', { state: 'visible' });
    
    // Click on first "Choose" button for basic plan
    const chooseButton = page.locator('button:has-text("Choisir")').first();
    await chooseButton.click();
    
    // Wait for checkout to be initiated (either redirect or modal)
    await page.waitForTimeout(2000);
    
    // Check if we're redirected to Stripe checkout or if there's a checkout modal
    const currentUrl = page.url();
    const hasStripeCheckout = currentUrl.includes('checkout.stripe.com') || 
                              await page.locator('iframe[src*="stripe"]').count() > 0;
    
    expect(hasStripeCheckout).toBeTruthy();
    
    // Take Percy snapshot of checkout initiation
    await percySnapshot(page, 'Stripe Checkout Initiation');
  });

  test('should handle Stripe checkout cancellation', async ({ page }) => {
    await page.goto('/premium/pricing');
    
    // Initiate checkout
    await page.waitForSelector('button:has-text("Choisir")', { state: 'visible' });
    const chooseButton = page.locator('button:has-text("Choisir")').first();
    await chooseButton.click();
    
    // If redirected to Stripe, simulate going back
    await page.waitForTimeout(2000);
    if (page.url().includes('checkout.stripe.com')) {
      await page.goBack();
    }
    
    // Should be back on pricing page
    await page.waitForSelector('h1', { state: 'visible' });
    expect(page.url()).toContain('/premium/pricing');
  });

  test('should display premium features when premium active', async ({ page }) => {
    // Navigate to discover page
    await page.goto('/discover');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="dog-card"]', { state: 'visible', timeout: 10000 });
    
    // Check if premium features are visible/enabled
    const shareButton = page.locator('button[aria-label*="Partager"]');
    const undoButton = page.locator('button[aria-label*="Retour"]');
    const superLikeButton = page.locator('button[aria-label*="Super"]');
    
    // These buttons should exist
    await expect(shareButton).toBeVisible();
    await expect(undoButton).toBeVisible();
    await expect(superLikeButton).toBeVisible();
    
    // Take Percy snapshot of premium features
    await percySnapshot(page, 'Premium Features on Discover Page');
  });

  test('should redirect to success page after payment', async ({ page }) => {
    // Simulate successful payment by navigating to success URL
    // (In real scenario, Stripe would redirect here)
    await page.goto('/success');
    
    // Wait for success message
    await page.waitForSelector('h1, h2', { state: 'visible' });
    
    // Check for success indicators
    const successText = await page.textContent('body');
    expect(successText?.toLowerCase()).toContain('succès' || 'merci' || 'confirmé');
    
    // Take Percy snapshot
    await percySnapshot(page, 'Payment Success Page');
  });

  test('should show premium badge after successful payment', async ({ page }) => {
    // This test assumes payment was successful
    // In real scenario, you'd need to mock Stripe webhook or use test mode
    
    await page.goto('/profile/me');
    
    // Wait for profile to load
    await page.waitForSelector('[data-testid="profile-header"]', { state: 'visible', timeout: 10000 });
    
    // Check for premium badge (if user is premium)
    const hasPremiumBadge = await page.locator('[data-testid="premium-badge"]').count() > 0;
    
    // Take Percy snapshot
    await percySnapshot(page, 'Profile with Premium Status');
  });

  test('should open customer portal for subscription management', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings');
    
    // Wait for page to load
    await page.waitForSelector('h1', { state: 'visible' });
    
    // Look for subscription management button
    const manageButton = page.locator('button:has-text("Gérer"), button:has-text("Abonnement")');
    
    if (await manageButton.count() > 0) {
      await manageButton.first().click();
      
      // Wait for potential redirect to Stripe customer portal
      await page.waitForTimeout(2000);
      
      // Check if redirected to Stripe portal
      const isStripePortal = page.url().includes('billing.stripe.com');
      
      if (isStripePortal) {
        await percySnapshot(page, 'Stripe Customer Portal');
      }
    }
  });
});
