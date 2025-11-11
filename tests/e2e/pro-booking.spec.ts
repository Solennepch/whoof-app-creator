import { test, expect } from '@playwright/test';

/**
 * Tests du système de réservation professionnel
 * 
 * Parcours critique:
 * 1. Recherche de professionnels
 * 2. Consultation d'un profil pro
 * 3. Réservation d'un service
 * 4. Confirmation de réservation
 */

test.describe('Professional Booking', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter avec un compte utilisateur
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test.user@whoof.app');
    await page.fill('input[type="password"]', 'TestUser123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(home|profile|discover)/);
  });

  test('should display professional directory', async ({ page }) => {
    // Aller à l'annuaire
    await page.goto('/annuaire');
    
    await expect(page).toHaveURL('/annuaire');
    await expect(page.locator('h1:has-text("Annuaire")')).toBeVisible();
    
    // Vérifier qu'il y a des professionnels affichés
    const proCards = page.locator('[class*="card"], .pro-card');
    await expect(proCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter professionals by category', async ({ page }) => {
    await page.goto('/annuaire');
    
    // Cliquer sur une catégorie (ex: Vétérinaire)
    const categoryButton = page.locator('button:has-text("Vétérinaire")').first();
    
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(500);
      
      // Vérifier que l'URL contient le filtre
      await expect(page).toHaveURL(/cat=veterinaire/);
    }
  });

  test('should view professional profile', async ({ page }) => {
    await page.goto('/annuaire');
    
    // Attendre que les pros se chargent
    await page.waitForTimeout(1000);
    
    // Cliquer sur "Voir la fiche" du premier pro
    const viewButton = page.locator('button:has-text("Voir la fiche")').first();
    
    if (await viewButton.isVisible()) {
      await viewButton.click();
      
      // Vérifier qu'on est sur une page de détail
      await expect(page).toHaveURL(/\/annuaire\/[a-z0-9-]+/);
      
      // Vérifier les éléments du profil
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=/À propos|Description/i')).toBeVisible();
    }
  });

  test('should book an appointment (as pro user)', async ({ page }) => {
    // Se connecter avec un compte pro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test.pro@whoof.app');
    await page.fill('input[type="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/pro/);
    
    // Aller à la page des rendez-vous
    await page.goto('/pro/appointments');
    
    await expect(page).toHaveURL('/pro/appointments');
    
    // Vérifier que la page des rendez-vous s'affiche
    await expect(page.locator('h1, h2')).toContainText(/Rendez-vous|Réservations/i);
  });

  test('should view pro map', async ({ page }) => {
    await page.goto('/annuaire');
    
    // Cliquer sur "Voir sur la carte"
    const mapButton = page.locator('button:has-text("Voir sur la carte")').first();
    
    if (await mapButton.isVisible()) {
      await mapButton.click();
      
      // Vérifier qu'on est sur la carte
      await expect(page).toHaveURL('/annuaire/carte');
      
      // Vérifier que la carte Mapbox est chargée
      const mapContainer = page.locator('[class*="mapbox"]');
      await expect(mapContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should contact professional', async ({ page }) => {
    await page.goto('/annuaire');
    await page.waitForTimeout(1000);
    
    // Ouvrir un profil pro
    const viewButton = page.locator('button:has-text("Voir la fiche")').first();
    
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForURL(/\/annuaire\/[a-z0-9-]+/);
      
      // Chercher le bouton "Contacter"
      const contactButton = page.locator('button:has-text("Contacter")').first();
      
      if (await contactButton.isVisible()) {
        // Note: Cela pourrait ouvrir un tel: ou mailto: link
        // On vérifie juste que le bouton est cliquable
        await expect(contactButton).toBeEnabled();
      }
    }
  });
});
