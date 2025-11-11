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

## 🔥 Tests de Charge (k6)

### Qu'est-ce que k6 ?

k6 est un outil de tests de charge moderne pour simuler des pics de trafic et identifier les goulots d'étranglement dans les APIs et edge functions.

### Installation

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### Lancer les tests de charge

```bash
# Tous les tests de charge
npm run test:load

# Test individuel d'authentification (1000 utilisateurs simultanés)
k6 run tests/load/auth-load.js

# Test de swipe (500 utilisateurs simultanés)
k6 run tests/load/swipe-load.js

# Test de réservation pro (300 utilisateurs simultanés)
k6 run tests/load/pro-booking-load.js
```

### Tests disponibles

#### 1. Test d'Authentification (`auth-load.js`)
Simule jusqu'à **1000 utilisateurs simultanés** :
- Endpoints testés : `/profile`, `/suggested`, `/check-subscription`
- Seuils : p(95) < 500ms, p(99) < 1000ms, erreurs < 5%

#### 2. Test de Swipe (`swipe-load.js`)
Simule jusqu'à **500 utilisateurs simultanés** :
- Endpoint testé : `/swipe`
- Seuils : p(95) < 800ms, p(99) < 1500ms, succès > 85%

#### 3. Test de Réservation Pro (`pro-booking-load.js`)
Simule jusqu'à **300 utilisateurs simultanés** :
- Endpoints testés : `/pro-directory`, `/pro-public`, `/create-booking-payment`
- Seuils : p(95) < 1000ms, p(99) < 2000ms, succès > 75%

### Analyser les résultats

Les résultats sont stockés dans `tests/load/results/` au format JSON.

**Métriques clés:**
- `http_req_duration` : Temps de réponse (avg, p95, p99)
- `http_req_failed` : Taux d'échec des requêtes
- `http_reqs` : Nombre total de requêtes (throughput)
- `vus` : Nombre d'utilisateurs virtuels actifs

**Voir le README détaillé:** `tests/load/README.md`

## ⚡ Tests de Performance (Lighthouse CI)

### Qu'est-ce que Lighthouse CI ?

Lighthouse CI mesure et track automatiquement les **Core Web Vitals** et le score SEO sur chaque commit.

### Configuration

Le fichier `lighthouserc.json` définit :
- URLs testées : `/`, `/discover`, `/premium/pricing`, `/annuaire`, `/profile/me`
- 3 runs par URL pour moyenner les résultats
- Preset desktop avec throttling modéré

### Métriques trackées

**Core Web Vitals:**
- **LCP (Largest Contentful Paint)** : < 2500ms
- **FID (First Input Delay)** : via TBT < 300ms
- **CLS (Cumulative Layout Shift)** : < 0.1

**Autres métriques:**
- **FCP (First Contentful Paint)** : < 2000ms
- **Speed Index** : < 3000ms
- **Time to Interactive** : < 3500ms

**Scores:**
- Performance : > 85%
- Accessibilité : > 90%
- Best Practices : > 90%
- SEO : > 90%

### Lancer Lighthouse CI

```bash
# Localement
npm run lighthouse

# Automatiquement dans CI/CD sur chaque push
```

### Interpréter les résultats

Les rapports sont uploadés sur **temporary-public-storage** et disponibles dans les artifacts GitHub Actions.

**✅ Vert (> 90%)** : Excellent, aucune action requise
**🟡 Orange (50-89%)** : Améliorations recommandées
**🔴 Rouge (< 50%)** : Action immédiate requise

## ♿ Tests d'Accessibilité (Axe)

### Qu'est-ce qu'Axe ?

Axe est un moteur de tests d'accessibilité qui garantit la conformité **WCAG 2.1 niveau AA**.

### Lancer les tests d'accessibilité

```bash
# Tous les tests d'accessibilité
npm run test:a11y

# Mode debug
npx playwright test tests/accessibility/axe.spec.ts --debug

# Avec rapport HTML
npx playwright test tests/accessibility/axe.spec.ts --reporter=html
```

### Normes testées

**WCAG 2.1 AA couvre:**
1. **Perceptible** : Contrastes, alternatives textuelles, contenu adaptable
2. **Opérable** : Navigation clavier, temps suffisant, navigation facilitée
3. **Compréhensible** : Texte lisible, prévisibilité, assistance saisie
4. **Robuste** : Compatibilité technologies d'assistance

### Critères spécifiques

- ✅ **Contrastes de couleurs** : Ratio minimum 4.5:1 (texte normal)
- ✅ **Labels ARIA** : Tous les éléments interactifs ont des labels
- ✅ **Navigation clavier** : Tous les éléments sont focusables
- ✅ **Hiérarchie titres** : H1 unique, pas de saut de niveau
- ✅ **Texte des liens** : Descriptif, pas de "cliquez ici"
- ✅ **Labels formulaires** : Tous les champs ont des labels associés
- ✅ **Alt des images** : Toutes les images ont un alt descriptif
- ✅ **Taille cibles tactiles** : Boutons ≥ 44x44px

### Violations détectées

Le test affiche des violations détaillées avec :
- ID de la règle violée
- Impact (critical, serious, moderate, minor)
- Description du problème
- Élément HTML concerné
- Instructions de correction
- Lien vers la documentation

**Voir le guide détaillé:** `tests/accessibility/README.md`

## 🔒 Tests de Sécurité (OWASP ZAP)

### Qu'est-ce qu'OWASP ZAP ?

OWASP ZAP (Zed Attack Proxy) est un outil de sécurité qui détecte automatiquement les vulnérabilités web courantes comme SQL injection, XSS et CSRF.

### Lancer les tests de sécurité

```bash
# Tous les tests de sécurité
chmod +x tests/security/run-zap-scan.sh
./tests/security/run-zap-scan.sh

# Avec Docker (recommandé)
docker run --rm -v "$(pwd):/zap/wrk/:rw" \
  -t zaproxy/zap-stable \
  zap-baseline.py \
  -t "https://ozdaxhiqnfapfevdropz.supabase.co/functions/v1" \
  -r "tests/security/reports/zap-report.html"

# Cibler une URL spécifique
TARGET_URL="https://your-app.com" ./tests/security/run-zap-scan.sh
```

### Vulnérabilités détectées

**🔴 High Risk:**
- SQL Injection (scanner 40018)
- Cross-Site Scripting (scanners 40012, 40014, 40016, 40017)
- Missing Anti-CSRF Tokens (scanner 10202)

**🟡 Medium Risk:**
- Missing security headers (CSP, X-Frame-Options)
- Cross-Domain Misconfiguration
- Weak authentication mechanisms

**🔵 Low Risk:**
- Information disclosure
- Browser cache issues
- Cookie security

### Configuration

Le fichier `tests/security/zap-config.yaml` définit :
- Contextes de scan (Edge Functions Supabase)
- Politiques d'attaque (SQL Injection, XSS, CSRF)
- Durée max (30 minutes) et profondeur (5 niveaux)
- Rapports HTML, JSON et Markdown

### Interpréter les résultats

```bash
# Voir le rapport HTML
open tests/security/reports/zap-report.html

# Analyser les alertes JSON
jq '.site[].alerts[]' tests/security/reports/zap-report.json
```

**Seuils CI/CD:**
- 0 alertes High → ✅ CI passe
- 1+ alertes High → ❌ CI échoue
- 6+ alertes Medium → ⚠️ CI échoue

**Voir le guide complet:** `tests/security/README.md`

## ⚡ Optimisation Performance (Redis Cache)

### Pourquoi le cache ?

Les tests de charge k6 ont identifié des goulots d'étranglement :
- Profils utilisateurs : 350ms → **25ms** (93% plus rapide)
- Profils suggérés : 500ms → **30ms** (94% plus rapide)  
- Annuaire pro : 600ms → **40ms** (93% plus rapide)
- Disponibilités : 400ms → **15ms** (96% plus rapide)

### Configuration Redis (Upstash)

1. Créer une base Redis sur [console.upstash.com](https://console.upstash.com)
2. Récupérer les credentials REST API
3. Ajouter les secrets Lovable Cloud :

```bash
# Via CLI Lovable
lovable secrets add UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN

# Ou via interface Settings → Secrets
```

### Utilisation dans le code

```typescript
import { getCachedProfile, getCachedSuggested } from "@/services/cachedApi";

// Récupérer avec cache automatique (5 min TTL)
const profile = await getCachedProfile();
const suggested = await getCachedSuggested();

// Cache bas niveau
import { cache } from "@/lib/cache";

const data = await cache.getOrSet(
  'my-key',
  async () => fetchDataFromAPI(),
  { type: 'profile', ttl: 300 }
);
```

### TTL par type de données

| Type | TTL | Raison |
|------|-----|--------|
| profile | 5 min | Données utilisateur peu fréquentes |
| suggested | 2 min | Suggestions doivent rester fraîches |
| directory | 10 min | Annuaire pro change rarement |
| availability | 1 min | Créneaux nécessitent précision temps réel |

### Invalidation du cache

```typescript
import { invalidateProfileCache } from "@/services/cachedApi";

// Après mise à jour profil
await updateProfile(data);
await invalidateProfileCache(userId);

// Tout nettoyer (admin uniquement)
await clearAllCache();
```

### Monitoring

**Dashboard Upstash:**
- Taux de cache hit/miss
- Latence des requêtes
- Usage mémoire
- Nombre de clés

**Logs application:**
```
Cache HIT: profile:user123  ✅ Trouvé en cache
Cache MISS: profile:user456 ❌ Pas en cache, fetch API
```

**Guide complet:** `docs/CACHE_SETUP.md`

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
- Run Percy visual tests (Chromium only)
- Upload Playwright reports
```

#### 3. Lint & Type Check
```yaml
- Run ESLint
- Run TypeScript type check
```

#### 4. Lighthouse Performance
```yaml
- Build application
- Run Lighthouse CI
- Upload performance reports
```

#### 5. Accessibility Tests
```yaml
- Install Playwright + Axe
- Run accessibility tests
- Upload accessibility reports
```

#### 6. Security Scan
```yaml
- Pull OWASP ZAP Docker image
- Run ZAP baseline scan
- Check for critical vulnerabilities
- Upload security reports
```

#### 7. Build
```yaml
- Build production bundle (only if all tests pass)
- Upload build artifacts
```

### Configuration requise

Ajoutez ces secrets dans GitHub :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `PERCY_TOKEN` (pour tests visuels)
- `VITE_SENTRY_DSN` (pour monitoring erreurs)
- `LHCI_GITHUB_APP_TOKEN` (optionnel pour Lighthouse)
- `CODECOV_TOKEN` (optionnel)

## 🎯 Prochaines Étapes

### Tests à ajouter

- [x] Tests unitaires des hooks restants (usePremium, useWalks, useMessages, useProBookings)
- [x] Tests E2E du paiement Stripe complet
- [x] Tests de régression visuelle avec Percy
- [x] Tests de charge avec k6
- [x] Tests de performance avec Lighthouse CI
- [x] Tests d'accessibilité avec Axe
- [x] Tests de sécurité avec OWASP ZAP
- [ ] Tests des composants de formulaires
- [ ] Tests E2E du chat/messagerie temps réel
- [ ] Optimisation cache Redis pour toutes les APIs

### Améliorations CI/CD

- [x] Tests de régression visuelle avec Percy
- [x] Alertes Sentry personnalisées par type d'erreur
- [x] Tests d'accessibilité avec Axe
- [x] Tests de performance avec Lighthouse
- [x] Tests de sécurité avec OWASP ZAP
- [x] Système de cache Redis avec Upstash
- [ ] Déploiement automatique après tests réussis
- [ ] Monitoring continu avec Grafana + k6 Cloud

---

**Maintenu par l'équipe Whoof Apps** 🐾
