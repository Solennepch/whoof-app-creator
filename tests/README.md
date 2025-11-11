# Tests E2E - Whoof Apps

## 🎯 Vue d'ensemble

Ce dossier contient les tests end-to-end (E2E) de l'application Whoof Apps, écrits avec [Playwright](https://playwright.dev/).

## 🧪 Types de tests

### Tests d'authentification (`auth.spec.ts`)
- Inscription utilisateur
- Connexion
- Déconnexion
- Validation des formulaires

### Tests d'onboarding (`onboarding.spec.ts`)
- Parcours complet du nouvel utilisateur
- Création du profil chien
- Préférences de match
- Activation de la localisation

### Tests de matching (`matching.spec.ts`)
- Swipe left/right
- Super like (fonctionnalité premium)
- Undo (fonctionnalité premium)
- Filtres de recherche
- Animation de match

### Tests de réservation pro (`pro-booking.spec.ts`)
- Navigation dans l'annuaire
- Filtres par catégorie
- Consultation de profils professionnels
- Réservation de services
- Carte interactive

## 🚀 Lancer les tests

### Installation

```bash
# Installer Playwright
npm install

# Installer les navigateurs
npx playwright install
```

### Exécution

```bash
# Tous les tests
npm run test:e2e

# Tests spécifiques
npm run test:e2e -- auth.spec.ts

# Mode UI (interface graphique)
npm run test:e2e:ui

# Mode debug
npm run test:e2e -- --debug

# Tests sur un navigateur spécifique
npm run test:e2e -- --project=chromium
```

### Serveur de développement

Les tests lancent automatiquement le serveur de dev (`npm run dev`). Si vous voulez utiliser un serveur existant :

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e -- --headed
```

## 📝 Écrire des tests

### Structure d'un test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup avant chaque test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');
    
    // Act
    await page.click('button[type="submit"]');
    
    // Assert
    await expect(page).toHaveURL('/expected-page');
  });
});
```

### Bonnes pratiques

1. **Utilisez des sélecteurs robustes**
```typescript
// ✅ BON - Sélecteurs par rôle ou texte
await page.click('button:has-text("Se connecter")');
await page.locator('input[name="email"]').fill('test@example.com');

// ❌ MAUVAIS - Classes CSS fragiles
await page.click('.btn-primary-123');
```

2. **Attendez les états**
```typescript
// ✅ BON - Attendre explicitement
await page.waitForURL('/dashboard');
await expect(page.locator('h1')).toBeVisible();

// ❌ MAUVAIS - Timeout arbitraire
await page.waitForTimeout(5000);
```

3. **Isolez les tests**
```typescript
// ✅ BON - Chaque test est indépendant
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await loginAsUser(page);
});

// ❌ MAUVAIS - Tests dépendants
test('step 1', async ({ page }) => { /* ... */ });
test('step 2 depends on step 1', async ({ page }) => { /* ... */ });
```

4. **Nettoyez après les tests**
```typescript
test.afterEach(async ({ page }) => {
  // Nettoyer les données de test si nécessaire
  await page.evaluate(() => localStorage.clear());
});
```

## 🎭 Fixtures et helpers

### Authentification

```typescript
// tests/helpers/auth.ts
export async function loginAsUser(page, email = 'test.user@whoof.app') {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'TestUser123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(home|profile|discover)/);
}
```

Utilisation:
```typescript
import { loginAsUser } from './helpers/auth';

test('my test', async ({ page }) => {
  await loginAsUser(page);
  // Le reste du test...
});
```

## 📊 Rapports

Les rapports sont générés automatiquement :

```bash
# Générer et ouvrir le rapport HTML
npx playwright show-report

# Rapport JSON
cat test-results/results.json
```

## 🐛 Debug

### Mode UI
```bash
npm run test:e2e:ui
```

### Mode Debug
```bash
npm run test:e2e -- --debug
```

### Screenshots et vidéos
Les screenshots et vidéos sont automatiquement capturés en cas d'échec et sauvegardés dans `test-results/`.

### Trace Viewer
```bash
# Ouvrir le trace viewer pour un test échoué
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 🔧 Configuration

Configuration dans `playwright.config.ts`:

- **testDir**: `./tests/e2e`
- **timeout**: 30s par test
- **retries**: 2 sur CI, 0 en local
- **reporters**: HTML, List, JSON
- **browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## 📱 Tests mobiles

Les tests sont automatiquement exécutés sur mobile :

```bash
# Tous les navigateurs y compris mobile
npm run test:e2e

# Seulement mobile
npm run test:e2e -- --project="Mobile Chrome"
npm run test:e2e -- --project="Mobile Safari"
```

## 🎯 Coverage des parcours critiques

- ✅ Inscription et connexion
- ✅ Onboarding complet
- ✅ Matching (swipe, like, match)
- ✅ Recherche de professionnels
- ✅ Consultation de profils pro
- ⏳ Réservation complète (à implémenter)
- ⏳ Paiement (à implémenter)
- ⏳ Chat/Messagerie (à implémenter)

## 🔄 CI/CD

Les tests sont exécutés automatiquement sur CI via GitHub Actions (à configurer).

## 📚 Ressources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## 🆘 Support

Pour toute question sur les tests:
1. Consulter la [documentation Playwright](https://playwright.dev/)
2. Vérifier les exemples dans les fichiers existants
3. Demander à l'équipe

---

Happy Testing! 🎭✨
