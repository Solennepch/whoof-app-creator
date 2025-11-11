# Tests Unitaires - Whoof Apps

## 🎯 Vue d'ensemble

Ce dossier contient les tests unitaires de l'application Whoof Apps, écrits avec [Vitest](https://vitest.dev/) et [React Testing Library](https://testing-library.com/react).

## 🧪 Tests disponibles

### Hooks
- **useAuth.test.ts** : Tests du hook d'authentification
  - Initialisation avec état de chargement
  - Gestion de la session utilisateur
  - Inscription (signUp)
  - Connexion (signIn, signInWithGoogle)
  - Déconnexion (signOut)

- **useMatches.test.ts** : Tests du hook de matching
  - Récupération des matches
  - Récupération des profils suggérés
  - Actions de swipe (like/pass)

### Composants
- **DogCard.test.tsx** : Tests du composant DogCard
  - Affichage des informations du chien
  - Badge de vaccination
  - Affichage du signe zodiacal
  - Interaction "J'aime"
  - Dialog de détails

## 🚀 Lancer les tests

```bash
# Tous les tests unitaires
npm run test:unit

# Tests en mode watch (auto-reload)
npm run test:unit:watch

# Tests avec interface UI
npm run test:unit:ui

# Tests avec coverage
npm run test:unit:coverage
```

## 📊 Coverage

Les rapports de coverage sont générés dans le dossier `coverage/` :
- `coverage/index.html` : Rapport HTML interactif
- `coverage/coverage-final.json` : Données JSON pour CI

## 📝 Écrire des tests

### Structure d'un test de hook

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des dépendances
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    // Mock des méthodes Supabase
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('MyHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    const { result } = renderHook(() => useMyHook(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.someValue).toBe(expectedValue);
    });
  });
});
```

### Structure d'un test de composant

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle click event', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🛠️ Bonnes pratiques

### 1. Isolation des tests
```typescript
// ✅ BON - Chaque test est indépendant
beforeEach(() => {
  vi.clearAllMocks();
});

// ❌ MAUVAIS - Tests dépendants
let sharedState;
test('step 1', () => { sharedState = 'value'; });
test('step 2', () => { expect(sharedState).toBe('value'); });
```

### 2. Mock des dépendances
```typescript
// ✅ BON - Mock complet et clair
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] }),
}));

// ❌ MAUVAIS - Mock partiel ou flou
vi.mock('@/lib/api');
```

### 3. Assertions claires
```typescript
// ✅ BON - Assertion spécifique
expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

// ❌ MAUVAIS - Sélecteur fragile
expect(document.querySelector('.btn-submit')).toBeTruthy();
```

### 4. Tests async
```typescript
// ✅ BON - Utilisation de waitFor
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});

// ❌ MAUVAIS - Timeout arbitraire
await new Promise(resolve => setTimeout(resolve, 1000));
```

## 🔍 Debugging

### Mode Watch avec UI
```bash
npm run test:unit:ui
```
Ouvre une interface graphique pour explorer et debugger les tests.

### Console.log dans les tests
```typescript
import { screen } from '@testing-library/react';

// Afficher le DOM actuel
screen.debug();

// Afficher un élément spécifique
screen.debug(screen.getByRole('button'));
```

### Verbose mode
```bash
npm run test:unit -- --reporter=verbose
```

## 📚 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Hooks](https://react-hooks-testing-library.com/)

## 🎯 Coverage Goals

Objectifs de couverture :
- **Statements** : > 80%
- **Branches** : > 75%
- **Functions** : > 80%
- **Lines** : > 80%

Les hooks et composants critiques doivent avoir une couverture proche de 100%.

---

Happy Testing! ✨
