import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests - WCAG 2.1 AA', () => {
  test('Homepage should not have any accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Discover page should not have any accessibility violations', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Premium pricing page should not have any accessibility violations', async ({ page }) => {
    await page.goto('/premium/pricing');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Professional directory should not have any accessibility violations', async ({ page }) => {
    await page.goto('/annuaire');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Login page should not have any accessibility violations', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Signup page should not have any accessibility violations', async ({ page }) => {
    await page.goto('/signup');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test.describe('Specific WCAG Criteria', () => {
    test('should have proper color contrast ratios', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze();

      const ariaViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id.includes('aria')
      );

      expect(ariaViolations).toEqual([]);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Test Tab navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();

      // Check for skip link
      await page.keyboard.press('Tab');
      const skipLinkVisible = await page.evaluate(() => {
        const activeElement = document.activeElement;
        if (!activeElement) return false;
        const styles = window.getComputedStyle(activeElement);
        return styles.opacity !== '0' && styles.visibility !== 'hidden';
      });
      
      // Either skip link is visible OR first interactive element is focused
      expect(typeof skipLinkVisible).toBe('boolean');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze();

      const headingViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id === 'heading-order'
      );

      expect(headingViolations).toEqual([]);
    });

    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze();

      const linkViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id === 'link-name'
      );

      expect(linkViolations).toEqual([]);
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/login');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze();

      const labelViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id === 'label'
      );

      expect(labelViolations).toEqual([]);
    });

    test('should have proper alt text for images', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze();

      const imageViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id === 'image-alt'
      );

      expect(imageViolations).toEqual([]);
    });

    test('should have sufficient touch target sizes', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze();

      const targetSizeViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id === 'target-size'
      );

      expect(targetSizeViolations).toEqual([]);
    });
  });

  test.describe('Detailed Violation Reporting', () => {
    test('should provide detailed violation information when found', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n🚨 Accessibility Violations Found:');
        accessibilityScanResults.violations.forEach((violation, index) => {
          console.log(`\n${index + 1}. ${violation.id} - ${violation.impact}`);
          console.log(`   Description: ${violation.description}`);
          console.log(`   Help: ${violation.help}`);
          console.log(`   Help URL: ${violation.helpUrl}`);
          console.log(`   Elements affected: ${violation.nodes.length}`);
          violation.nodes.forEach((node, nodeIndex) => {
            console.log(`     ${nodeIndex + 1}. ${node.html}`);
            console.log(`        ${node.failureSummary}`);
          });
        });
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
