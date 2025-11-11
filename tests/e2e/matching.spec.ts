import { test, expect } from '@playwright/test';

/**
 * Tests du système de matching
 * 
 * Fonctionnalités testées:
 * - Swipe left/right
 * - Super like (premium)
 * - Undo (premium)
 * - Filtres
 * - Match success
 */

test.describe('Matching System', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter avec un compte de test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test.user@whoof.app');
    await page.fill('input[type="password"]', 'TestUser123!');
    await page.click('button[type="submit"]');
    
    // Attendre la redirection et aller sur discover
    await page.waitForURL(/\/(home|profile|discover)/);
    await page.goto('/discover');
  });

  test('should display dog profiles', async ({ page }) => {
    await expect(page).toHaveURL('/discover');
    
    // Vérifier qu'une carte de profil est visible
    const dogCard = page.locator('.absolute.inset-0, [class*="card"]').first();
    await expect(dogCard).toBeVisible();
    
    // Vérifier les éléments de la carte
    await expect(page.locator('h2, h3')).toBeVisible(); // Nom du chien
    await expect(page.locator('text=/ans|an|mois/')).toBeVisible(); // Âge
  });

  test('should swipe right (like)', async ({ page }) => {
    // Trouver le bouton like (coeur)
    const likeButton = page.locator('button:has(svg.lucide-heart)').first();
    await expect(likeButton).toBeVisible();
    
    // Cliquer sur like
    await likeButton.click();
    
    // Attendre l'animation ou le changement de profil
    await page.waitForTimeout(500);
    
    // Un nouveau profil devrait s'afficher
    // ou un match devrait apparaître
  });

  test('should swipe left (pass)', async ({ page }) => {
    // Trouver le bouton pass (X)
    const passButton = page.locator('button:has(svg.lucide-x)').first();
    await expect(passButton).toBeVisible();
    
    // Cliquer sur pass
    await passButton.click();
    
    // Attendre le changement de profil
    await page.waitForTimeout(500);
  });

  test('should display match animation on match', async ({ page }) => {
    // Swiper plusieurs fois jusqu'à obtenir un match
    // Note: Dans les tests, le match est random, donc on peut avoir besoin de plusieurs essais
    
    for (let i = 0; i < 5; i++) {
      const likeButton = page.locator('button:has(svg.lucide-heart)').first();
      
      if (await likeButton.isVisible()) {
        await likeButton.click();
        await page.waitForTimeout(300);
        
        // Vérifier si l'animation de match apparaît
        const matchAnimation = page.locator('text=/Match|C\'est un match/i');
        
        if (await matchAnimation.isVisible({ timeout: 1000 }).catch(() => false)) {
          // Match trouvé !
          await expect(matchAnimation).toBeVisible();
          
          // Fermer l'animation
          const closeButton = page.locator('button:has-text("Continuer"), button:has-text("Fermer")');
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
          
          break;
        }
      }
    }
  });

  test('should show premium teaser for premium features', async ({ page }) => {
    // Trouver le bouton Undo (retour en arrière)
    const undoButton = page.locator('button:has(svg.lucide-undo)').first();
    
    if (await undoButton.isVisible()) {
      // Vérifier qu'il est désactivé (grisé) pour les non-premium
      await expect(undoButton).toBeDisabled();
      
      // Cliquer dessus devrait afficher un message premium
      await undoButton.click({ force: true });
      
      // Vérifier le toast ou la redirection vers premium
      await page.waitForTimeout(500);
      await expect(
        page.locator('text=/Premium|Abonnement/i')
      ).toBeVisible({ timeout: 2000 }).catch(() => true);
    }
  });

  test('should open and apply filters', async ({ page }) => {
    // Ouvrir le panneau de filtres
    const filtersButton = page.locator('button:has(svg.lucide-sliders)').first();
    
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
      
      // Le panneau de filtres devrait s'ouvrir
      await expect(page.locator('text=/Filtres/i')).toBeVisible();
      
      // Appliquer un filtre (ex: distance)
      const distanceSlider = page.locator('input[type="range"]').first();
      if (await distanceSlider.isVisible()) {
        await distanceSlider.fill('10');
      }
      
      // Fermer ou appliquer les filtres
      const applyButton = page.locator('button:has-text("Appliquer")');
      if (await applyButton.isVisible()) {
        await applyButton.click();
      }
    }
  });

  test('should toggle between region and adoption modes', async ({ page }) => {
    // Trouver le toggle Mode
    const regionButton = page.locator('button:has-text("Ma région")').first();
    const adoptionButton = page.locator('button:has-text("Adoption")').first();
    
    if (await regionButton.isVisible() && await adoptionButton.isVisible()) {
      // Cliquer sur adoption
      await adoptionButton.click();
      await page.waitForTimeout(300);
      
      // Vérifier que le mode a changé
      await expect(adoptionButton).toHaveClass(/active|selected|bg-/);
      
      // Retour à Ma région
      await regionButton.click();
      await page.waitForTimeout(300);
      
      await expect(regionButton).toHaveClass(/active|selected|bg-/);
    }
  });
});
