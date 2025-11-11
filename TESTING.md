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
- ✅ **usePremium** - Statut abonnement premium (vérification, état)
- ✅ **useWalks** - Gestion des balades (démarrage, fin, événements)
- ✅ **useMessages** - Messagerie (threads, messages, envoi)
- ✅ **useProBookings** - Réservations pro (création, statut, disponibilités)

#### Composants
- ✅ **DogCard** - Carte de profil chien (affichage, interactions, détails)

### Structure des tests unitaires

```
tests/
├── setup.ts                    # Configuration globale Vitest
├── unit/
│   ├── useAuth.test.ts         # Tests hook authentification
│   ├── useMatches.test.ts      # Tests hook matching
│   ├── usePremium.test.ts      # Tests hook premium
│   ├── useWalks.test.ts        # Tests hook balades
│   ├── useMessages.test.ts     # Tests hook messagerie
│   ├── useProBookings.test.ts  # Tests hook réservations
│   └── DogCard.test.tsx        # Tests composant DogCard
└── unit/README.md              # Documentation détaillée
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

- ✅ **Paiement Stripe** (`payment.spec.ts`)
  - Page de tarification premium
  - Initiation checkout Stripe
  - Gestion annulation paiement
  - Confirmation paiement et redirection
  - Badge premium après paiement
  - Portail client Stripe

### Structure des tests E2E

```
tests/
├── e2e/
│   ├── auth.spec.ts          # Tests authentification
│   ├── onboarding.spec.ts    # Tests onboarding
│   ├── matching.spec.ts      # Tests matching
│   ├── pro-booking.spec.ts   # Tests réservation pro
│   └── payment.spec.ts       # Tests paiement Stripe
└── README.md                 # Documentation détaillée
```

### Navigateurs testés

- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 🎨 Tests de Régression Visuelle (Percy)

### Qu'est-ce que Percy ?

Percy capture automatiquement des screenshots de votre application et détecte les changements visuels non intentionnels entre les versions.

### Configuration

1. **Créer un compte Percy** sur [percy.io](https://percy.io)
2. **Créer un projet** et récupérer votre token
3. **Ajouter le token** aux secrets GitHub : `PERCY_TOKEN`

### Lancer les tests visuels

```bash
# Tests E2E avec captures Percy
npx percy exec -- npm run test:e2e

# Percy capture automatiquement les snapshots définis dans les tests
# Recherchez `percySnapshot(page, 'Nom du snapshot')` dans les fichiers de test
```

### Configuration Percy (`.percyrc.yml`)

```yaml
snapshot:
  widths: [375, 768, 1280]  # Mobile, Tablette, Desktop
  min-height: 1024
  enable-javascript: true
```

### Snapshots disponibles

Les tests E2E incluent des captures Percy pour :
- **Premium Pricing Page** - Page de tarification
- **Stripe Checkout Initiation** - Lancement du paiement
- **Premium Features on Discover Page** - Fonctionnalités premium
- **Payment Success Page** - Confirmation de paiement
- **Profile with Premium Status** - Badge premium affiché
- **Stripe Customer Portal** - Portail de gestion abonnement

### Écrire des tests Percy

```typescript
import percySnapshot from '@percy/playwright';

test('test visuel homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('h1');
  
  // Capturer un snapshot visuel
  await percySnapshot(page, 'Homepage - État initial');
});
```

### Workflow Percy dans CI

Percy s'exécute automatiquement dans le pipeline CI :
- Uniquement sur le navigateur **Chromium** (pour économiser les crédits)
- Compare avec la branche de base (main/develop)
- Affiche les différences visuelles dans le dashboard Percy
- Bloque la CI si des changements visuels non approuvés sont détectés

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
- 🚨 **Alertes personnalisées** par type d'erreur

### Système d'alertes par niveau

Sentry classe automatiquement les erreurs en 3 niveaux :

#### 🔴 Critiques (Notifications email)
- Échecs de paiement (`Payment failed`)
- Erreurs de connexion base de données (`Database connection`)
- Échecs d'authentification (`Authentication failed`)

#### 🟡 Warnings (Dashboard uniquement)
- Requêtes lentes (`Slow query`)
- Rate limiting (`Rate limit`)
- Timeouts API (`API timeout`)

#### 🔵 Info (Dashboard uniquement)
- Toutes les autres erreurs

### Configuration des alertes email

1. Aller dans **Settings** → **Alerts** sur Sentry
2. Créer une règle d'alerte basée sur les tags :
   - Condition : `alert_type` = `critical`
   - Action : Envoyer un email immédiatement
3. Pour les warnings : Créer un digest quotidien
4. Pour les infos : Pas de notification

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
- `PERCY_TOKEN` (pour tests visuels)
- `VITE_SENTRY_DSN` (pour monitoring erreurs)
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

- [x] Tests unitaires des hooks restants (usePremium, useWalks, useMessages, useProBookings)
- [x] Tests E2E du paiement Stripe complet
- [x] Tests de régression visuelle avec Percy
- [ ] Tests des composants de formulaires
- [ ] Tests E2E du chat/messagerie temps réel
- [ ] Tests de performance avec Lighthouse

### Améliorations CI/CD

- [x] Tests de régression visuelle avec Percy
- [x] Alertes Sentry personnalisées par type d'erreur
- [ ] Tests d'accessibilité avec Axe
- [ ] Tests de sécurité avec OWASP ZAP
- [ ] Déploiement automatique après tests réussis

---

**Maintenu par l'équipe Whoof Apps** 🐾
