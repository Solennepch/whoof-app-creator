# ♿ Tests d'Accessibilité - Whoof Apps

## Vue d'ensemble

Les tests d'accessibilité garantissent que l'application respecte les normes **WCAG 2.1 niveau AA** pour être accessible à tous les utilisateurs, y compris ceux avec des handicaps.

## 🎯 Normes Testées

### WCAG 2.1 Niveau AA

Les tests couvrent les quatre principes fondamentaux (POUR):

#### 1. **Perceptible** - L'information doit être présentable
- ✅ Contrastes de couleurs (ratio minimum 4.5:1 pour le texte normal)
- ✅ Alternative textuelle pour images (attributs alt descriptifs)
- ✅ Contenu adaptable (structure sémantique HTML)
- ✅ Distinguabilité (texte redimensionnable, pas d'images de texte)

#### 2. **Opérable** - Les composants doivent être utilisables
- ✅ Navigation au clavier (tous les éléments interactifs accessibles)
- ✅ Temps suffisant (pas de limites de temps restrictives)
- ✅ Convulsions et réactions physiques (pas de flashs > 3 fois/sec)
- ✅ Navigation facilitée (liens de skip, hiérarchie claire)

#### 3. **Compréhensible** - L'information doit être compréhensible
- ✅ Texte lisible (langue définie, termes techniques expliqués)
- ✅ Prévisibilité (navigation cohérente, changements de contexte évidents)
- ✅ Assistance à la saisie (labels, erreurs identifiées, suggestions)

#### 4. **Robuste** - Le contenu doit être compatible
- ✅ Compatibilité technologies d'assistance (HTML valide, ARIA correct)
- ✅ Parsing correct (pas d'erreurs HTML critiques)

## 🧪 Tests Implémentés

### Tests Automatisés (Axe)

Les tests Axe couvrent **automatiquement** plus de 50 règles d'accessibilité:

**Pages testées:**
- `/` - Homepage
- `/discover` - Page de découverte
- `/premium/pricing` - Page de tarification
- `/annuaire` - Annuaire des professionnels
- `/login` - Page de connexion
- `/signup` - Page d'inscription

**Critères spécifiques testés:**
1. **Contrastes de couleurs** (`color-contrast`)
   - Ratio minimum 4.5:1 pour texte normal
   - Ratio minimum 3:1 pour texte large (≥18pt ou ≥14pt bold)

2. **Labels ARIA** (`aria-*`)
   - Tous les éléments interactifs ont des labels accessibles
   - Les rôles ARIA sont correctement utilisés
   - Les états ARIA sont cohérents

3. **Navigation au clavier** (`keyboard-navigation`)
   - Tous les éléments interactifs sont focusables
   - L'ordre de tabulation est logique
   - Les skip links permettent de sauter la navigation

4. **Hiérarchie des titres** (`heading-order`)
   - H1 unique par page
   - Pas de saut de niveau (H1 → H3)
   - Structure logique et cohérente

5. **Texte des liens** (`link-name`)
   - Tous les liens ont un texte descriptif
   - Pas de "cliquez ici" ou "en savoir plus" seul

6. **Labels de formulaires** (`label`)
   - Tous les champs ont des labels associés
   - Les placeholders ne remplacent pas les labels

7. **Texte alternatif des images** (`image-alt`)
   - Toutes les images ont un attribut alt
   - Le texte alt est descriptif et pertinent

8. **Taille des cibles tactiles** (`target-size`)
   - Boutons et liens ≥ 44x44px
   - Espacement suffisant entre éléments

## 🚀 Lancer les Tests

### Tous les tests d'accessibilité
```bash
npm run test:a11y
```

### Test spécifique
```bash
npx playwright test tests/accessibility/axe.spec.ts
```

### Test avec rapport détaillé
```bash
npx playwright test tests/accessibility/axe.spec.ts --reporter=html
```

### Mode debug
```bash
npx playwright test tests/accessibility/axe.spec.ts --debug
```

## 📊 Interpréter les Résultats

### ✅ Aucune Violation
```
✓ Homepage should not have any accessibility violations
✓ Discover page should not have any accessibility violations
✓ Premium pricing page should not have any accessibility violations
```
→ L'application est conforme WCAG 2.1 AA.

### ❌ Violations Détectées
```
❌ Homepage should not have any accessibility violations

🚨 Accessibility Violations Found:

1. color-contrast - serious
   Description: Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds
   Help: Elements must have sufficient color contrast
   Help URL: https://dequeuniversity.com/rules/axe/4.4/color-contrast
   Elements affected: 3
     1. <button class="text-gray-400">Annuler</button>
        Element has insufficient color contrast of 3.2 (foreground color: #9ca3af, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1
```

**Actions à prendre:**
1. Identifier l'élément concerné
2. Calculer le nouveau ratio de contraste nécessaire
3. Ajuster les couleurs dans `index.css` ou `tailwind.config.ts`
4. Re-tester

## 🎨 Corriger les Violations de Contraste

### Outils Recommandés
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- Chrome DevTools (Lighthouse audit)

### Exemples de Corrections

**Avant (ratio 3.2:1):**
```css
/* ❌ Contraste insuffisant */
.text-muted {
  color: #9ca3af; /* gray-400 */
}
```

**Après (ratio 4.7:1):**
```css
/* ✅ Contraste suffisant */
.text-muted {
  color: #6b7280; /* gray-500 */
}
```

**Pour le thème sombre:**
```css
.dark .text-muted {
  color: #d1d5db; /* gray-300 - contraste sur fond sombre */
}
```

## 🔧 Corriger les Violations ARIA

### Labels Manquants

**Avant:**
```tsx
{/* ❌ Bouton sans label accessible */}
<button onClick={handleLike}>
  <Heart className="w-6 h-6" />
</button>
```

**Après:**
```tsx
{/* ✅ Bouton avec label accessible */}
<button 
  onClick={handleLike}
  aria-label="Liker ce profil"
>
  <Heart className="w-6 h-6" />
</button>
```

### États Interactifs

**Avant:**
```tsx
{/* ❌ État actif non communiqué */}
<button onClick={toggle}>
  Menu
</button>
```

**Après:**
```tsx
{/* ✅ État actif accessible */}
<button 
  onClick={toggle}
  aria-expanded={isOpen}
  aria-controls="menu-content"
>
  Menu
</button>
```

## ⌨️ Tester la Navigation au Clavier

### Checklist Manuelle

1. **Tab** - Naviguer vers l'avant
   - Tous les éléments interactifs sont accessibles
   - L'ordre de navigation est logique
   - Le focus est visible (outline)

2. **Shift + Tab** - Naviguer vers l'arrière
   - Fonctionne dans l'ordre inverse

3. **Enter / Space** - Activer l'élément
   - Boutons: Enter et Space
   - Liens: Enter uniquement

4. **Escape** - Fermer les modales/menus
   - Dialogs, dropdowns, menus

5. **Arrow keys** - Navigation dans les listes
   - Radios, tabs, menus

### Ajouter un Skip Link

```tsx
{/* Skip link pour utilisateurs clavier */}
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground"
>
  Aller au contenu principal
</a>
```

## 📱 Accessibilité Mobile

### Taille des Cibles Tactiles

**Minimum WCAG 2.1 AA:** 44x44px

```tsx
{/* ❌ Cible trop petite */}
<button className="w-8 h-8">X</button>

{/* ✅ Cible suffisamment grande */}
<button className="w-11 h-11">X</button>
```

### Espacement

```css
/* Espacement minimum entre éléments tactiles */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  margin: 8px; /* Espace de 8px entre cibles */
}
```

## 🔍 Tests Manuels Complémentaires

### Screen Readers

**macOS:** VoiceOver (Cmd + F5)
**Windows:** NVDA (gratuit) ou JAWS
**Mobile:** TalkBack (Android) ou VoiceOver (iOS)

**Checklist:**
- ✅ Tous les éléments sont annoncés correctement
- ✅ Les images ont des descriptions pertinentes
- ✅ Les formulaires sont compréhensibles
- ✅ La navigation est logique

### Zoom et Agrandissement

**Test:** Zoomer à 200% (Ctrl/Cmd + +)

**Checklist:**
- ✅ Le contenu reste lisible
- ✅ Pas de défilement horizontal
- ✅ Les éléments ne se superposent pas
- ✅ Les fonctionnalités restent accessibles

## 🎯 Bonnes Pratiques

### 1. Sémantique HTML

```tsx
{/* ❌ Mauvais */}
<div onClick={handleClick}>Cliquez ici</div>

{/* ✅ Bon */}
<button onClick={handleClick}>Valider le formulaire</button>
```

### 2. Labels Visibles

```tsx
{/* ❌ Placeholder seul */}
<input placeholder="Votre email" />

{/* ✅ Label + placeholder */}
<label htmlFor="email">Email</label>
<input id="email" placeholder="exemple@domaine.com" />
```

### 3. Messages d'Erreur Descriptifs

```tsx
{/* ❌ Erreur vague */}
<span className="text-red-500">Erreur</span>

{/* ✅ Erreur descriptive */}
<span 
  className="text-red-500" 
  role="alert"
  aria-live="polite"
>
  L'email doit contenir un @ et un domaine valide
</span>
```

### 4. Focus Visible

```css
/* ❌ Supprimer l'outline */
button:focus {
  outline: none; /* Interdit ! */
}

/* ✅ Outline personnalisé visible */
button:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

## 📚 Ressources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## 🎯 Prochaines Étapes

- [ ] Ajouter des tests de navigation au clavier automatisés
- [ ] Tester avec des screen readers réels (VoiceOver, NVDA)
- [ ] Implémenter des modes de lecture simplifiée
- [ ] Ajouter des transcriptions pour contenu audio/vidéo
- [ ] Créer un guide d'accessibilité pour les contributeurs

---

**Maintenu par l'équipe Whoof Apps** 🐾
