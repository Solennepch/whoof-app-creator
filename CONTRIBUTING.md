# Guide de Contribution - Whoof Apps

## 🎯 Bienvenue

Merci de contribuer à Whoof Apps ! Ce guide vous aidera à comprendre notre flux de travail et nos conventions.

## 📋 Table des matières

- [Architecture](#architecture)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Conventions de code](#conventions-de-code)
- [Workflow Git](#workflow-git)
- [Tests](#tests)
- [Performance](#performance)
- [Déploiement](#déploiement)

## 🏗️ Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour la documentation complète de l'architecture.

### Structure des dossiers

```
src/
├── assets/           # Images, logos, assets statiques
├── auth/             # Gestion de l'authentification
├── components/       # Composants React réutilisables
│   ├── admin/       # Composants spécifiques admin
│   ├── common/      # Composants partagés
│   ├── feed/        # Composants de flux
│   ├── layout/      # Layouts et navigation
│   ├── match/       # Composants de matching
│   ├── pro/         # Composants professionnels
│   ├── profile/     # Composants de profil
│   ├── push/        # Notifications push
│   ├── settings/    # Paramètres
│   └── ui/          # Composants UI shadcn
├── config/          # Configuration centralisée
├── contexts/        # Contextes React
├── hooks/           # Custom hooks
├── integrations/    # Intégrations externes (Supabase)
├── lib/             # Utilitaires et helpers
├── pages/           # Pages de l'application
│   ├── admin/      # Pages admin
│   ├── debug/      # Pages de debug
│   ├── onboarding/ # Onboarding utilisateur
│   ├── premium/    # Pages premium
│   └── pro/        # Pages professionnelles
├── services/        # Services API
├── store/           # État global Zustand
└── utils/           # Fonctions utilitaires
```

## 🔧 Configuration de l'environnement

### Prérequis

- Node.js 18+
- npm ou bun
- Compte Lovable Cloud (pour backend/DB)

### Installation

```bash
# Cloner le repo
git clone [repo-url]
cd whoof-apps

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Lancer en développement
npm run dev
```

### Variables d'environnement

Les variables suivantes sont auto-configurées par Lovable Cloud :

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

### Comptes de test

Utilisez `/debug/test-accounts` pour accéder aux comptes de test pré-configurés :
- Admin: `test.admin@whoof.app` / `TestAdmin123!`
- Pro: `test.pro@whoof.app` / `TestPro123!`
- User: `test.user@whoof.app` / `TestUser123!`
- Dev Master: `dev@whoof.app` / `DevMaster2024!`

## 💻 Conventions de code

### TypeScript

```typescript
// ✅ BON - Types explicites
interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
}

const fetchDog = async (id: string): Promise<Dog> => {
  // ...
}

// ❌ MAUVAIS - Any types
const fetchDog = async (id: any): Promise<any> => {
  // ...
}
```

### React Components

```typescript
// ✅ BON - Export par défaut pour les pages
export default function ProfilePage() {
  return <div>...</div>;
}

// ✅ BON - Export nommé pour les composants réutilisables
export function DogCard({ dog }: { dog: Dog }) {
  return <div>...</div>;
}

// ✅ BON - Hooks customs préfixés par "use"
export function useDogProfile(dogId: string) {
  return useQuery({
    queryKey: ['dog', dogId],
    queryFn: () => fetchDog(dogId)
  });
}
```

### CSS et Design System

**CRITIQUE**: Ne jamais utiliser de couleurs directes comme `text-white`, `bg-blue-500`, etc.

```typescript
// ✅ BON - Utiliser les tokens sémantiques
<div className="bg-background text-foreground">
  <h1 className="text-primary">Titre</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ MAUVAIS - Couleurs directes
<div className="bg-white text-black">
  <h1 className="text-blue-600">Titre</h1>
</div>
```

**Tokens disponibles** (voir `src/index.css`) :
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--brand-violet-woof`, `--brand-rose-woof`
- `--brand-raspberry`, `--brand-yellow`, etc.

### Gestion d'état

```typescript
// ✅ BON - React Query pour données serveur
const { data: profile } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => fetchProfile(userId)
});

// ✅ BON - Zustand pour état global UI
const { isPremium, setPremium } = useAppStore();

// ✅ BON - useState pour état local
const [isOpen, setIsOpen] = useState(false);

// ❌ MAUVAIS - Zustand pour données serveur
const profiles = useAppStore(state => state.profiles);
```

### Nommage

- **Fichiers**: PascalCase pour composants (`DogCard.tsx`), camelCase pour utils (`formatDate.ts`)
- **Composants**: PascalCase (`DogCard`, `ProfileHeader`)
- **Fonctions**: camelCase (`fetchDogs`, `formatAge`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`, `API_BASE_URL`)
- **Hooks**: préfixe `use` (`useDogProfile`, `useAuth`)

### Imports

```typescript
// ✅ BON - Ordre des imports
// 1. React et bibliothèques externes
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Components UI
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 3. Composants custom
import { DogCard } from "@/components/feed/DogCard";

// 4. Hooks et utils
import { useDogProfile } from "@/hooks/useDogProfile";
import { formatAge } from "@/utils/age";

// 5. Types
import type { Dog } from "@/types";
```

## 🔀 Workflow Git

### Branches

- `main` - Production (protégée)
- `develop` - Développement
- `feature/[nom]` - Nouvelles fonctionnalités
- `fix/[nom]` - Corrections de bugs
- `refactor/[nom]` - Refactoring

### Commits

Format: `type(scope): message`

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `refactor`: Refactoring (sans changement de fonctionnalité)
- `style`: Changements de style/format
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

Exemples:
```bash
git commit -m "feat(profile): add dog breed selector"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "refactor(api): extract fetch logic to service"
```

### Pull Requests

1. Créer une branche depuis `develop`
2. Implémenter les changements
3. Tester localement
4. Créer une PR vers `develop`
5. Demander une review
6. Merger après approbation

Template de PR:
```markdown
## 📝 Description
[Description des changements]

## 🎯 Type de changement
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Refactoring
- [ ] Documentation

## ✅ Checklist
- [ ] Code testé localement
- [ ] Tests E2E ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de console.log oubliés
- [ ] Design system respecté (pas de couleurs directes)

## 📸 Screenshots
[Si pertinent]
```

## 🧪 Tests

### Tests E2E avec Playwright

```bash
# Lancer tous les tests
npm run test:e2e

# Mode UI
npm run test:e2e:ui

# Tests spécifiques
npm run test:e2e -- auth.spec.ts
```

Voir [tests/README.md](./tests/README.md) pour plus de détails.

### Écrire des tests

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/onboarding/welcome');
});
```

## ⚡ Performance

### Lazy Loading

```typescript
// ✅ BON - Lazy load des pages
const ProDashboard = lazy(() => import("./pages/pro/Dashboard"));

// ✅ BON - Suspense avec fallback
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

### Images

```typescript
// ✅ BON - Utiliser OptimizedImage
import { OptimizedImage } from "@/components/ui/OptimizedImage";

<OptimizedImage 
  src={dog.image} 
  alt={dog.name}
  className="w-full h-64 object-cover"
/>

// ❌ MAUVAIS - img standard sans optimisation
<img src={dog.image} alt={dog.name} />
```

### Mémoization

```typescript
// ✅ BON - Mémoriser les composants coûteux
const DogCard = memo(({ dog }) => {
  return <div>...</div>;
});

// ✅ BON - useCallback pour fonctions
const handleLike = useCallback(() => {
  // ...
}, [dependencies]);

// ✅ BON - useMemo pour calculs
const sortedDogs = useMemo(
  () => dogs.sort((a, b) => a.name.localeCompare(b.name)),
  [dogs]
);
```

## 🎨 Feature Flags

Utiliser le système de feature flags pour développer progressivement :

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const showNewFeature = useFeatureFlag('new_matching_algorithm');
  
  if (showNewFeature) {
    return <NewMatchingUI />;
  }
  
  return <OldMatchingUI />;
}
```

Configuration dans `src/config/featureFlags.ts`.

## 🚀 Déploiement

### Lovable Cloud

Le déploiement se fait automatiquement via Lovable :
- **Frontend**: Déploiement automatique sur push (cliquer "Update" dans l'interface)
- **Backend**: Edge functions déployées automatiquement
- **Database**: Migrations exécutées via l'interface Lovable

### Checklist pré-déploiement

- [ ] Tests E2E passent
- [ ] Aucun console.log/console.error dans le code
- [ ] Design system respecté
- [ ] Feature flags configurés correctement
- [ ] Documentation à jour
- [ ] Variables d'environnement vérifiées

## 🐛 Debug

### Outils disponibles

- `/debug/test-accounts` - Comptes de test
- `/debug/health` - État de santé de l'app
- React DevTools
- React Query DevTools (intégré)
- Network tab (requêtes Supabase)

### Logs

```typescript
// ✅ BON - En développement uniquement
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// ❌ MAUVAIS - Console.log en production
console.log('User data:', userData);
```

## 🆘 Aide

- **Documentation Lovable**: https://docs.lovable.dev/
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **React Query**: https://tanstack.com/query/latest

## 📞 Contact

Pour toute question, contactez l'équipe sur [canal de communication].

---

Merci de contribuer à Whoof Apps ! 🐕✨
