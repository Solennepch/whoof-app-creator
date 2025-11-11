# 🧪 Guide de Tests - Whoof Apps

## Vue d'ensemble

Whoof Apps utilise deux frameworks de test complémentaires :
- **Vitest** pour les tests unitaires (hooks, composants, utilitaires)
- **Playwright** pour les tests end-to-end (parcours utilisateurs complets)

## 🎯 Tests Unitaires (Vitest)

### Lancer les tests

```bash
# Tous les tests unitaires
npm run test:unit

# Mode watch (auto-reload pendant le développement)
npm run test:unit:watch

# Interface UI interactive
npm run test:unit:ui

# Avec rapport de couverture
npm run test:unit:coverage
```

### Tests disponibles

#### Hooks
- ✅ **useAuth** - Authentification (signup, signin, signout, Google OAuth)
- ✅ **useMatches** - Matching et swipe (matches, suggestions, actions)

#### Composants
- ✅ **DogCard** - Carte de profil chien (affichage, interactions, détails)

### Structure des tests unitaires

```
tests/
├── setup.ts                 # Configuration globale Vitest
├── unit/
│   ├── useAuth.test.ts     # Tests hook authentification
│   ├── useMatches.test.ts  # Tests hook matching
│   └── DogCard.test.tsx    # Tests composant DogCard
└── unit/README.md          # Documentation détaillée
```

### Objectifs de couverture

| Métrique | Objectif | Statut |
|----------|----------|--------|
| Statements | > 80% | 🎯 |
| Branches | > 75% | 🎯 |
| Functions | > 80% | 🎯 |
| Lines | > 80% | 🎯 |

## 🎭 Tests E2E (Playwright)

### Lancer les tests

```bash
# Tous les tests E2E
npm run test:e2e

# Mode UI (interface graphique)
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug (pas à pas)
npm run test:e2e:debug

# Tests spécifiques
npm run test:e2e -- auth.spec.ts
npm run test:e2e -- --project=chromium
```

### Tests disponibles

#### Parcours critiques
- ✅ **Authentification** (`auth.spec.ts`)
  - Inscription utilisateur
  - Connexion email/password
  - Validation des formulaires
  - Gestion des erreurs

- ✅ **Onboarding** (`onboarding.spec.ts`)
  - Parcours complet nouvel utilisateur
  - Création profil chien
  - Définition des préférences
  - Activation de la localisation

- ✅ **Matching** (`matching.spec.ts`)
  - Swipe left/right
  - Animation de match
  - Filtres de recherche
  - Super like (premium)

- ✅ **Réservation Pro** (`pro-booking.spec.ts`)
  - Navigation annuaire
  - Filtres par catégorie
  - Consultation profils professionnels
  - Carte interactive

### Structure des tests E2E

```
tests/
├── e2e/
│   ├── auth.spec.ts          # Tests authentification
│   ├── onboarding.spec.ts    # Tests onboarding
│   ├── matching.spec.ts      # Tests matching
│   └── pro-booking.spec.ts   # Tests réservation pro
└── README.md                 # Documentation détaillée
```

### Navigateurs testés

- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 📊 Monitoring des Erreurs (Sentry)

### Configuration

Ajoutez votre DSN Sentry dans les variables d'environnement :

```bash
# .env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0
```

### Fonctionnalités

- 🔍 **Capture automatique** des erreurs non gérées
- 📹 **Session Replay** pour reproduire les bugs
- 📈 **Performance Monitoring** des requêtes
- 🔐 **Filtrage PII** automatique
- 🌍 **Tracking par environnement** (dev, staging, prod)

### Activation

Sentry est automatiquement activé en **production uniquement** si `VITE_SENTRY_DSN` est défini.

### Utilisation manuelle

```typescript
import * as Sentry from "@sentry/react";

// Capturer une erreur custom
Sentry.captureException(new Error("Erreur custom"));

// Ajouter du contexte utilisateur
Sentry.setUser({ id: user.id, email: user.email });

// Ajouter un breadcrumb
Sentry.addBreadcrumb({
  message: "Action utilisateur",
  data: { action: "click", element: "button" },
});
```

## 🚀 CI/CD (GitHub Actions)

### Workflows automatiques

Le pipeline CI/CD s'exécute automatiquement sur :
- Push sur `main` et `develop`
- Pull requests vers `main` et `develop`

### Jobs CI

#### 1. Tests Unitaires
```yaml
- Install dependencies
- Run Vitest
- Upload coverage to Codecov
```

#### 2. Tests E2E
```yaml
- Install Playwright browsers
- Run E2E tests (Chromium, Firefox, WebKit)
- Upload Playwright reports
- Upload screenshots/videos on failure
```

#### 3. Lint & Type Check
```yaml
- Run ESLint
- Run TypeScript type check
```

#### 4. Build
```yaml
- Build production bundle
- Upload build artifacts
```

### Configuration requise

Ajoutez ces secrets dans GitHub :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `CODECOV_TOKEN` (optionnel)

## 📈 Bonnes Pratiques

### Tests Unitaires

1. **Isoler les tests** - Chaque test doit être indépendant
2. **Mock les dépendances** - Utiliser `vi.mock()` pour Supabase, API, etc.
3. **Assertions claires** - Utiliser des sélecteurs par rôle et texte
4. **Coverage ciblé** - Prioriser les hooks et composants critiques

### Tests E2E

1. **Sélecteurs robustes** - Préférer `getByRole()` et `getByText()`
2. **Attentes explicites** - Utiliser `waitForURL()`, `waitFor()`
3. **Tests indépendants** - Ne pas dépendre de l'ordre d'exécution
4. **Nettoyage** - Supprimer les données de test après chaque run

### Monitoring

1. **Filtrer le bruit** - Ignorer les erreurs des extensions navigateur
2. **Contextualiser** - Ajouter des breadcrumbs pour le debug
3. **Anonymiser** - Ne jamais logger de PII (emails, passwords, tokens)
4. **Alerter intelligemment** - Configurer des alertes sur les erreurs critiques

## 🔧 Dépannage

### Tests unitaires échouent

```bash
# Nettoyer le cache
npm run test:unit -- --clearCache

# Mode debug
npm run test:unit -- --reporter=verbose

# Tester un fichier spécifique
npm run test:unit -- useAuth.test.ts
```

### Tests E2E échouent

```bash
# Réinstaller les navigateurs
npx playwright install --with-deps

# Mode debug avec UI
npm run test:e2e:ui

# Voir les traces
npx playwright show-report
```

### Sentry ne capture pas les erreurs

1. Vérifier que `VITE_SENTRY_DSN` est défini
2. Vérifier que `import.meta.env.PROD` est `true`
3. Consulter la console pour les logs d'initialisation

## 📚 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🎯 Prochaines Étapes

### Tests à ajouter

- [ ] Tests unitaires des hooks restants (usePremium, useWalks, useMessages)
- [ ] Tests des composants de formulaires
- [ ] Tests E2E du chat/messagerie
- [ ] Tests E2E du paiement Stripe
- [ ] Tests de performance avec Lighthouse

### Améliorations CI/CD

- [ ] Tests de régression visuelle avec Percy
- [ ] Tests d'accessibilité avec Axe
- [ ] Tests de sécurité avec OWASP ZAP
- [ ] Déploiement automatique après tests réussis

---

**Maintenu par l'équipe Whoof Apps** 🐾
