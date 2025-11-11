import { test, expect } from '@playwright/test';

/**
 * Tests d'authentification
 * 
 * Parcours critiques:
 * - Inscription utilisateur
 * - Connexion utilisateur
 * - Déconnexion
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
  });

  test('should display welcome page', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Bienvenue sur Whoof Apps')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    // Aller à la page d'inscription
    await page.goto('/signup');
    
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('h1:has-text("Créer un compte")')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Aller à la page de connexion
    await page.goto('/login');
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1:has-text("Se connecter")')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/signup');
    
    // Remplir avec email invalide
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'SecurePass123!');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Vérifier que l'erreur s'affiche
    // Note: adapté selon votre implémentation de validation
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should login with test account', async ({ page }) => {
    await page.goto('/login');
    
    // Utiliser un compte de test
    await page.fill('input[type="email"]', 'test.user@whoof.app');
    await page.fill('input[type="password"]', 'TestUser123!');
    
    await page.click('button[type="submit"]');
    
    // Attendre la redirection après login
    await page.waitForURL(/\/(home|profile|discover)/);
    
    // Vérifier que l'utilisateur est connecté
    // (présence du header avec avatar ou menu)
    await expect(page.locator('header')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test.user@whoof.app');
    await page.fill('input[type="password"]', 'TestUser123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(home|profile|discover)/);
    
    // Ouvrir le menu (burger ou sidebar)
    const menuButton = page.locator('button:has-text("Menu"), button[aria-label="Menu"]').first();
    await menuButton.click();
    
    // Cliquer sur déconnexion
    await page.click('button:has-text("Se déconnecter"), button:has-text("Déconnexion")');
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login');
  });
});
