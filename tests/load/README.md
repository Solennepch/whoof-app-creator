# 🔥 Tests de Charge - Whoof Apps

## Vue d'ensemble

Les tests de charge simulent des pics de trafic pour identifier les goulots d'étranglement dans les edge functions Supabase et les requêtes API.

## 🛠️ Installation de k6

### macOS
```bash
brew install k6
```

### Linux
```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows
```bash
choco install k6
```

## 📊 Tests Disponibles

### 1. Tests d'Authentification (`auth-load.js`)
Simule jusqu'à **1000 utilisateurs simultanés** testant les endpoints d'authentification et de profil.

**Scénario:**
- 0-1min: Montée à 100 utilisateurs
- 1-4min: Plateau à 100 utilisateurs
- 4-5min: Montée à 500 utilisateurs
- 5-8min: Plateau à 500 utilisateurs
- 8-9min: Pic à 1000 utilisateurs
- 9-11min: Plateau à 1000 utilisateurs
- 11-13min: Descente à 0

**Endpoints testés:**
- `/profile` - Récupération du profil utilisateur
- `/suggested` - Profils suggérés pour le matching
- `/check-subscription` - Vérification du statut premium

**Seuils de performance:**
- ✅ 95% des requêtes < 500ms
- ✅ 99% des requêtes < 1000ms
- ✅ Taux d'erreur < 5%

### 2. Tests de Swipe (`swipe-load.js`)
Teste l'endpoint de swipe sous charge modérée à élevée.

**Scénario:**
- 0-30s: Montée à 50 utilisateurs
- 30s-2m30s: Montée à 200 utilisateurs
- 2m30s-4m30s: Plateau à 200 utilisateurs
- 4m30s-5m30s: Pic à 500 utilisateurs
- 5m30s-6m30s: Plateau à 500 utilisateurs
- 6m30s-7m30s: Descente à 0

**Endpoints testés:**
- `/swipe` - Action de swipe (like/pass)

**Seuils de performance:**
- ✅ 95% des requêtes < 800ms
- ✅ 99% des requêtes < 1500ms
- ✅ Taux de succès > 85%

### 3. Tests de Réservation Pro (`pro-booking-load.js`)
Simule des pics de réservation professionnelle.

**Scénario:**
- 0-1min: Montée à 50 utilisateurs
- 1-3min: Montée à 150 utilisateurs
- 3-4min: Pic à 300 utilisateurs
- 4-6min: Plateau à 300 utilisateurs
- 6-7min: Descente à 0

**Endpoints testés:**
- `/pro-directory` - Liste des professionnels
- `/pro-public` - Profil public d'un professionnel
- `/create-booking-payment` - Création d'une réservation

**Seuils de performance:**
- ✅ 95% des requêtes < 1000ms
- ✅ 99% des requêtes < 2000ms
- ✅ Taux de succès > 75%

## 🚀 Lancer les Tests

### Test individuel
```bash
# Test d'authentification
k6 run tests/load/auth-load.js

# Test de swipe
k6 run tests/load/swipe-load.js

# Test de réservation pro
k6 run tests/load/pro-booking-load.js
```

### Test avec environnement personnalisé
```bash
k6 run -e BASE_URL=https://your-project.supabase.co/functions/v1 \
       -e SUPABASE_ANON_KEY=your-anon-key \
       tests/load/auth-load.js
```

### Test avec sortie JSON
```bash
k6 run --out json=tests/load/results/auth-load-results.json tests/load/auth-load.js
```

### Tous les tests en série
```bash
npm run test:load
```

## 📈 Analyser les Résultats

### Métriques Clés

**http_req_duration**
- Temps de réponse des requêtes HTTP
- Objectifs: p(95) < 500-1000ms, p(99) < 1000-2000ms

**http_req_failed**
- Taux d'échec des requêtes
- Objectif: < 5-8%

**http_reqs**
- Nombre total de requêtes effectuées
- Indicateur de throughput

**vus (Virtual Users)**
- Nombre d'utilisateurs virtuels actifs
- Correspond aux stages définis

**Custom Metrics**
- `errors`: Taux d'erreurs personnalisé
- `swipe_success`: Taux de succès des swipes
- `booking_creation`: Taux de succès des réservations

### Interpréter les Résultats

#### ✅ Test Réussi
```
✓ http_req_duration............: avg=287ms  p(95)=412ms  p(99)=589ms
✓ http_req_failed..............: 2.34%
✓ http_reqs....................: 45672 (380.6/s)
```
→ Les seuils sont respectés, l'application gère bien la charge.

#### ⚠️ Dégradation
```
✗ http_req_duration............: avg=678ms  p(95)=1234ms  p(99)=2345ms
✓ http_req_failed..............: 4.12%
```
→ Les temps de réponse sont élevés mais le taux d'erreur est acceptable. Optimisation recommandée.

#### ❌ Goulot d'Étranglement
```
✗ http_req_duration............: avg=2345ms  p(95)=5678ms  p(99)=8901ms
✗ http_req_failed..............: 23.45%
```
→ Problème critique identifié. Investigation immédiate requise.

## 🔍 Identifier les Goulots d'Étranglement

### 1. Temps de Réponse Élevé
**Symptômes:** p(95) > 1000ms, p(99) > 2000ms

**Causes possibles:**
- Requêtes Supabase non optimisées (manque d'index)
- Edge functions trop lourdes (trop de calculs)
- Connexions base de données saturées
- Appels API externes lents

**Solutions:**
```sql
-- Ajouter des index sur les colonnes fréquemment requêtées
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_likes_target_dog_id ON likes(target_dog_id);
CREATE INDEX idx_pro_bookings_pro_id_date ON pro_bookings(pro_profile_id, booking_date);
```

### 2. Taux d'Erreur Élevé
**Symptômes:** http_req_failed > 5-10%

**Causes possibles:**
- Rate limiting Supabase atteint
- Timeouts base de données
- Erreurs non gérées dans les edge functions
- Connexions concurrentes dépassées

**Solutions:**
- Implémenter un retry logic avec backoff exponentiel
- Augmenter les timeouts
- Mettre en cache les résultats fréquents
- Utiliser un connection pooling

### 3. Débit Faible
**Symptômes:** http_reqs < attendu pour le nombre de VUs

**Causes possibles:**
- Blocage des threads
- Await/Promises non optimisés
- Cold starts des edge functions
- Réseau lent

**Solutions:**
- Paralléliser les requêtes indépendantes
- Warmer les edge functions avant les tests
- Utiliser du caching agressif

## 🎯 Optimisations Recommandées

### Pour les Edge Functions

**Avant:**
```typescript
// ❌ Requêtes séquentielles
const user = await supabase.from('profiles').select('*').eq('id', userId).single();
const dogs = await supabase.from('dogs').select('*').eq('owner_id', userId);
const likes = await supabase.from('likes').select('*').eq('user_id', userId);
```

**Après:**
```typescript
// ✅ Requêtes parallèles
const [userRes, dogsRes, likesRes] = await Promise.all([
  supabase.from('profiles').select('*').eq('id', userId).single(),
  supabase.from('dogs').select('*').eq('owner_id', userId),
  supabase.from('likes').select('*').eq('user_id', userId),
]);
```

### Pour la Base de Données

```sql
-- Analyser les requêtes lentes
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Identifier les index manquants
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND correlation < 0.1
ORDER BY n_distinct DESC;
```

## 📚 Ressources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Best Practices](https://k6.io/docs/misc/fine-tuning-os/)
- [Supabase Performance Tips](https://supabase.com/docs/guides/platform/performance)
- [Edge Functions Best Practices](https://supabase.com/docs/guides/functions/best-practices)

## 🎯 Prochaines Étapes

- [ ] Ajouter des tests de charge pour les websockets (chat temps réel)
- [ ] Tester la montée en charge progressive sur 24h
- [ ] Implémenter des tests de chaos engineering
- [ ] Créer des dashboards de monitoring avec Grafana + k6 Cloud
- [ ] Tester la résilience face aux pannes partielles

---

**Maintenu par l'équipe Whoof Apps** 🐾
