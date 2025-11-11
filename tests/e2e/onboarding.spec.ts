import { test, expect } from '@playwright/test';

/**
 * Tests du parcours d'onboarding
 * 
 * Parcours complet d'un nouvel utilisateur:
 * 1. Bienvenue
 * 2. Création du profil chien
 * 3. Préférences de match
 * 4. Localisation
 */

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Créer un nouvel utilisateur ou utiliser un compte de test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test.user@whoof.app');
    await page.fill('input[type="password"]', 'TestUser123!');
    await page.click('button[type="submit"]');
    
    // Si l'onboarding est déjà fait, on reset le flag
    await context.addCookies([{
      name: 'onboarding_completed',
      value: 'false',
      domain: 'localhost',
      path: '/'
    }]);
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Étape 1: Page de bienvenue
    await page.goto('/onboarding/welcome');
    await expect(page.locator('h1, h2')).toContainText(/Bienvenue/i);
    
    // Cliquer sur "Commencer"
    await page.click('button:has-text("Commencer"), button:has-text("Créer mon profil")');
    
    // Étape 2: Profil chien
    await expect(page).toHaveURL('/onboarding/dog');
    
    // Remplir le formulaire du chien
    await page.fill('input[name="name"]', 'Rex');
    await page.selectOption('select[name="breed"]', { index: 1 }); // Première race disponible
    await page.fill('input[name="age"]', '3');
    
    // Cliquer sur "Suivant"
    await page.click('button:has-text("Suivant"), button[type="submit"]');
    
    // Étape 3: Préférences
    await expect(page).toHaveURL('/onboarding/preferences');
    
    // Sélectionner quelques préférences
    await page.click('button:has-text("Petit"), label:has-text("Petit")');
    await page.click('button:has-text("Moyen"), label:has-text("Moyen")');
    
    // Ajuster le slider de distance si présent
    const distanceSlider = page.locator('input[type="range"]');
    if (await distanceSlider.isVisible()) {
      await distanceSlider.fill('25');
    }
    
    await page.click('button:has-text("Suivant"), button[type="submit"]');
    
    // Étape 4: Localisation
    await expect(page).toHaveURL('/onboarding/location');
    
    // Cliquer sur "Terminer" ou "Activer la localisation"
    await page.click('button:has-text("Terminer"), button:has-text("Continuer")');
    
    // Vérifier la redirection vers l'app principale
    await page.waitForURL(/\/(home|discover|profile)/);
  });

  test('should allow skipping optional steps', async ({ page }) => {
    await page.goto('/onboarding/preferences');
    
    // Chercher un bouton "Passer" ou "Skip"
    const skipButton = page.locator('button:has-text("Passer"), button:has-text("Skip")');
    
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForURL(/\/onboarding\/location|\/discover/);
    }
  });
});
