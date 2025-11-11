# EXTRACTION COMPLÈTE DU CODE ADMIN - WHOOF APPS

## TABLE DES MATIÈRES

1. [Pages Admin](#pages-admin)
2. [Composants Admin](#composants-admin)
3. [Hooks Admin](#hooks-admin)
4. [Edge Functions Admin](#edge-functions-admin)
5. [Navigation Admin](#navigation-admin)

---

## 1. PAGES ADMIN

### 1.1 Dashboard (`src/pages/admin/Dashboard.tsx`)
**Rôle** : Page d'accueil admin avec statistiques globales, graphiques et vue d'ensemble

**Fonctionnalités** :
- Statistiques en temps réel (utilisateurs, pros, matches)
- Alertes urgentes (vérifications, signalements, alertes)
- Graphiques : évolution inscriptions 30j, répartition signalements
- Rafraîchissement automatique toutes les 30s

**Dépendances** :
- `useAdminStats` hook
- Recharts pour les graphiques
- date-fns pour formatage dates

---

### 1.2 Users (`src/pages/admin/Users.tsx`)
**Rôle** : Gestion des utilisateurs particuliers

**Fonctionnalités** :
- Liste tous les utilisateurs avec recherche
- Ban/Unban utilisateurs
- Export CSV
- Affichage statut (banni/actif)

**API Edge Function** : `admin-content` (actions: ban_user, unban_user)

---

### 1.3 Professionals (`src/pages/admin/Professionals.tsx`)
**Rôle** : Gestion des professionnels

**Fonctionnalités** :
- Liste avec stats (rating, vues, clics)
- Filtres : vérification, publication, activité
- Vérifier/Dévérifier profils
- Publier/Dépublier profils
- Export CSV

**Tables Supabase** :
- `pro_profiles`
- `pro_services`

---

### 1.4 ProfessionalDetail (`src/pages/admin/ProfessionalDetail.tsx`)
**Rôle** : Détails et édition d'un professionnel

**Fonctionnalités** :
- Édition complète des infos (nom, contact, description)
- Gestion statut (vérifié, publié)
- Historique des modifications (audit_logs)
- Placeholder services/tarifs/horaires (à implémenter)

**Hook spécifique** : `useProAuditLogs`

---

### 1.5 Moderation (`src/pages/admin/Moderation.tsx`)
**Rôle** : Page de modération centralisée

**Fonctionnalités** :
- 3 onglets : Vérifications, Signalements, Alertes
- Filtres avancés (recherche, date, type, statut)
- Contrôle d'accès : admin + moderator
- Statistiques par catégorie

**Composants utilisés** :
- `VerificationsQueue`
- `ReportsQueue`
- `AlertsQueue`

---

### 1.6 AstroDogCMS (`src/pages/admin/AstroDogCMS.tsx`)
**Rôle** : CMS pour gérer les horoscopes canins

**Fonctionnalités** :
- Création horoscopes par signe zodiacal
- Sélection période hebdomadaire
- Choix mood (énergique, calme, etc.)
- Prévisualisation en direct
- Export CSV horoscopes

**Edge Function** : `admin-content` (action: create_horoscope)
**Table** : `astrodog_horoscopes`

---

### 1.7 EmailTemplates (`src/pages/admin/EmailTemplates.tsx`)
**Rôle** : Gestion des templates d'emails

**Fonctionnalités** :
- CRUD templates (nom, sujet, HTML body, variables)
- Activation/désactivation
- Test d'envoi avec variables dynamiques
- Support variables dynamiques {{variable}}

**Edge Function** : `test-email-template`
**Table** : `email_templates`

---

### 1.8 ABTesting (`src/pages/admin/ABTesting.tsx`)
**Rôle** : Tests A/B pour templates emails

**Fonctionnalités** :
- Création tests A/B avec variantes
- Démarrage/arrêt tests
- Traffic split automatique
- Vue tests en cours et terminés

**Tables Supabase** :
- `ab_tests`
- `email_template_variants`
- `ab_test_results`

---

### 1.9 NotificationDashboard (`src/pages/admin/NotificationDashboard.tsx`)
**Rôle** : Dashboard statistiques notifications

**Fonctionnalités** :
- Taux de livraison, ouverture, clic
- Répartition par canal (Email/SMS)
- Graphiques performance
- Logs récents avec statuts

**Table** : `notification_logs`

---

### 1.10 RolesManagement (`src/pages/admin/RolesManagement.tsx`)
**Rôle** : Gestion des rôles et permissions

**Fonctionnalités** :
- Visualisation permissions par rôle
- Assignation rôles admin/moderator
- Révocation rôles
- Recherche utilisateurs
- Restriction : admin uniquement

**Tables Supabase** :
- `user_roles`
- `role_permissions`

**Hooks** :
- `useUsersWithRoles`
- `useAssignRole`
- `useRevokeRole`

---

## 2. COMPOSANTS ADMIN

### 2.1 PermissionGuard (`src/components/admin/PermissionGuard.tsx`)
**Rôle** : Composant de protection par permission

**Props** :
- `permission`: Permission requise
- `children`: Contenu à afficher si autorisé
- `fallback`: Contenu si non autorisé

**Utilisation** :
```tsx
<PermissionGuard permission="manage_users">
  <UserManagementPanel />
</PermissionGuard>
```

---

### 2.2 AdminNotificationBell (`src/components/admin/AdminNotificationBell.tsx`)
**Rôle** : Cloche de notifications temps réel

**Fonctionnalités** :
- Badge compteur non lues
- Popover avec liste notifications
- Navigation automatique selon type
- Mark as read / Mark all as read
- Supabase Realtime pour updates

**Table** : `admin_notifications`
**Hook** : `useAdminNotifications`

---

### 2.3 VerificationsQueue (`src/components/admin/VerificationsQueue.tsx`)
**Rôle** : File d'attente vérifications

**Fonctionnalités** :
- Table avec infos utilisateur
- Vue document (image)
- Approuver/Rejeter avec notes
- Gain XP automatique si approuvé

**Action** : `useVerifyUser`

---

### 2.4 ReportsQueue (`src/components/admin/ReportsQueue.tsx`)
**Rôle** : File d'attente signalements

**Fonctionnalités** :
- Table avec détails signalement
- Dialog traitement avec actions :
  - Ignorer
  - Retirer le contenu
  - Sanctionner (warn/suspend/ban)
- Sanction uniquement pour admins

**Action** : `useResolveReport`

---

### 2.5 AlertsQueue (`src/components/admin/AlertsQueue.tsx`)
**Rôle** : File d'attente alertes

**Fonctionnalités** :
- Table alertes actives
- Actions : Valider, Résolu (si chien perdu), Masquer
- Types : danger, lost_dog

**Action** : `useValidateAlert`

---

### 2.6 CacheMonitor (`src/components/admin/CacheMonitor.tsx`)
**Rôle** : Monitoring du cache multi-niveau

**Fonctionnalités** :
- Stats IndexedDB (entrées, espace)
- Stats Redis (connexion)
- Actions : Actualiser, Nettoyer, Vider tout
- Auto-refresh toutes les 10s

**API** : `getCacheStats`, `clearAllCache`, `cleanupCache`

---

## 3. HOOKS ADMIN

### 3.1 useAdmin.ts
**Exports** :
- `useAdminRole()` : Vérifie si user est admin/moderator avec permissions
- `usePendingVerifications()` : Récupère vérifications en attente
- `useOpenReports()` : Récupère signalements ouverts
- `useActiveAlerts()` : Récupère alertes actives
- `useVerifyUser()` : Mutation approuver/rejeter vérification
- `useResolveReport()` : Mutation traiter signalement
- `useValidateAlert()` : Mutation traiter alerte

---

### 3.2 useAdminStats.ts
**Export** : `useAdminStats()`

**Retourne** :
```typescript
{
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalPros: number;
  pendingVerifications: number;
  openReports: number;
  activeAlerts: number;
  totalMatches: number;
}
```

**Refresh** : 30s

---

### 3.3 useAdminNotifications.ts
**Export** : `useAdminNotifications()`

**Fonctionnalités** :
- Récupère notifications admin
- Supabase Realtime pour nouvelles notifications
- Toast automatique sur nouvelles notifications
- `markAsRead(id)` et `markAllAsRead()`

**Table** : `admin_notifications`

---

### 3.4 usePermissions.ts
**Exports** :
- `usePermissions()` : Récupère rôle et permissions user
- `useHasPermission(permission)` : Check si user a permission
- `useIsAdmin()` : Check si user est admin
- `useIsModerator()` : Check si user est moderator

**Permissions** :
```typescript
type Permission = 
  | 'manage_users'
  | 'manage_moderators'
  | 'view_all_content'
  | 'delete_content'
  | 'ban_users'
  | 'manage_verifications'
  | 'manage_reports'
  | 'manage_alerts'
  | 'view_analytics'
  | 'manage_settings'
  | 'manage_professionals'
  | 'manage_content';
```

---

### 3.5 useRoleManagement.ts
**Exports** :
- `useUsersWithRoles(searchQuery)` : Liste users avec leurs rôles
- `useAssignRole()` : Mutation assigner rôle
- `useRevokeRole()` : Mutation révoquer rôle
- `useRolePermissions()` : Récupère permissions par rôle

---

### 3.6 useAuditLogs.ts
**Exports** :
- `useAuditLogs(options)` : Récupère logs d'audit
- `useAuditLogStats()` : Statistiques logs

**Options** :
```typescript
{
  entityType?: string;
  action?: string;
  days?: number;
  limit?: number;
}
```

---

## 4. EDGE FUNCTIONS ADMIN

### 4.1 admin-moderation (`supabase/functions/admin-moderation/index.ts`)
**Actions** :
- `/verify` : Approuver/rejeter vérification
  - Award XP et badges si approved
  - Audit log
- `/resolve-report` : Traiter signalement
  - Appliquer sanction si demandé (admin only)
  - Audit log
- `/validate-alert` : Traiter alerte
  - Résoudre si lost_dog + award XP
  - Audit log

**Auth** : JWT required (admin ou moderator)

---

### 4.2 admin-content (`supabase/functions/admin-content/index.ts`)
**Actions** :
- `create_horoscope` : Créer horoscope
- `update_horoscope` : Modifier horoscope
- `publish_horoscope` : Publier horoscope
- `get_horoscopes` : Récupérer horoscopes
- `ban_user` : Bannir utilisateur
- `unban_user` : Débannir utilisateur
- `auto_publish_weekly` : Publication auto hebdomadaire

**Auth** : JWT required (admin only)

---

### 4.3 admin-test-accounts (`supabase/functions/admin-test-accounts/index.ts`)
**Actions** :
- `create` : Créer comptes de test
  - test@whoof.app (user + pro)
  - test.user@whoof.app (user)
  - test.pro@whoof.app (pro)
  - test.admin@whoof.app (admin)
- `list` : Lister comptes de test

**Note** : En développement, accessible sans auth

---

### 4.4 admin-pro (`supabase/functions/admin-pro/index.ts`)
**Endpoints** :
- `GET ?status=pending` : Récupère pros en attente validation
- `GET` : Récupère tous les pros
- `PUT /:id` : Modifier statut pro

**Auth** : JWT required (admin only)

---

## 5. NAVIGATION ADMIN

### 5.1 AdminSidebarMenu (`src/components/layout/AdminSidebarMenu.tsx`)
**Structure** :
```
🔧 Développement
  - Comptes Test (/debug/accounts)
  - Debug Health (/debug/health)
  - Feature Flags (/debug/feature-flags)

📊 Vue d'ensemble
  - Dashboard (/admin)

👥 Gestion Utilisateurs
  - Utilisateurs (/admin/users)
  - Professionnels (/admin/professionals)
  - Modération (/admin/moderation)
  - Rôles & Permissions (/admin/roles)

✨ Contenu & Communication
  - AstroDog CMS (/admin/astrodog-cms)
  - Templates Email (/admin/email-templates)
  - Notifications (/admin/notification-dashboard)
  - A/B Testing (/admin/ab-testing)
```

---

### 5.2 AdminBottomNavigation (`src/components/layout/AdminBottomNavigation.tsx`)
**Items** : Dashboard, Utilisateurs, Modération, Emails, Tests
**Affichage** : Mobile uniquement (md:hidden)
**Routes** : `/admin/*` et `/debug/*`

---

## TABLES SUPABASE UTILISÉES

```sql
-- Utilisateurs et rôles
profiles
user_roles
role_permissions

-- Professionnels
pro_profiles
pro_services
pro_availability
pro_bookings
pro_transactions

-- Modération
verifications
reports
alerts
sanctions
admin_notifications

-- Contenu
astrodog_horoscopes
email_templates
email_template_variants
ab_tests
ab_test_results
notification_logs

-- Audit
audit_logs
```

---

## SCHÉMA DES PERMISSIONS

### Admin
- manage_users
- manage_pros
- manage_content
- view_analytics
- manage_settings
- moderate_content

### Moderator
- view_analytics
- moderate_content

---

## FONCTIONNALITÉS CRITIQUES

### 1. Sécurité
- Row Level Security (RLS) sur toutes les tables
- Vérification JWT sur edge functions sensibles
- Contrôle d'accès granulaire par rôle
- Audit logs exhaustifs

### 2. Notifications Temps Réel
- Supabase Realtime sur `admin_notifications`
- Triggers automatiques pour :
  - Nouvelles vérifications
  - Nouveaux signalements
  - Nouvelles alertes

### 3. Automation
- Cron job publication horoscopes (lundi 6h)
- Cron job rappels booking (quotidien 9h)
- Cleanup automatique notifications expirées

### 4. Performance
- Cache multi-niveau (IndexedDB + Redis)
- Refresh automatique stats (30s)
- Pagination et limites sur toutes les requêtes

---

## POINTS D'AMÉLIORATION FUTURS

1. **Pro Services Management** : Interface complète gestion services/tarifs (placeholder actuellement)
2. **Horaires Pro** : Édition disponibilités hebdomadaires
3. **Analytics Avancés** : Graphiques détaillés performance
4. **Export Reports** : Export PDF/Excel des rapports de modération
5. **Webhooks** : Integration Slack/Discord pour alertes critiques

---

## CONTACT & MAINTENANCE

Pour toute question sur l'architecture admin ou modifications à apporter, se référer à :
- Documentation complète : `/docs/ARCHITECTURE.md`
- Tests E2E : `/tests/e2e/`
- Sécurité : `/tests/security/`

---

*Document généré le ${new Date().toISOString().split('T')[0]}*
*Version : 1.0*
*Projet : Whoof Apps Admin Panel*
