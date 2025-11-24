# 🧪 GUIDE DE TESTS - SUIVI NAGEURS

## Vue d'ensemble

Ce guide présente tous les scénarios de tests pour valider le bon fonctionnement de l'application.

---

## 🔧 Prérequis Tests

### Configuration Firebase
- [ ] Projet Firebase créé
- [ ] Authentication Email/Password activé
- [ ] Firestore Database créé (mode production)
- [ ] Règles de sécurité déployées
- [ ] `firebase-config.js` configuré avec les bonnes clés

### Données de Test
- [ ] 1 compte admin créé manuellement dans Firestore
- [ ] 1 compte coach approuvé
- [ ] 1-2 nageurs avec comptes générés

---

## 📋 Scénarios de Test

### TEST 1: Inscription Coach ✅

**Objectif:** Vérifier que l'inscription coach fonctionne correctement

**Étapes:**
1. Ouvrir `register.html`
2. Remplir l'étape 1 (Informations personnelles):
   - Prénom: Jean
   - Nom: Dupont
   - Email: jean.dupont@test.com
   - Téléphone: +33612345678
3. Cliquer "Suivant" → Vérifier passage étape 2
4. Remplir l'étape 2 (Informations club):
   - Club: CN Paris Test
   - Ville: Paris
5. Cliquer "Suivant" → Vérifier passage étape 3
6. Remplir l'étape 3 (Mot de passe):
   - Mot de passe: Test1234! (minimum 8 caractères)
   - Confirmer: Test1234!
7. Vérifier indicateur de force (devrait être "Fort")
8. Cocher "J'accepte les conditions"
9. Cliquer "Suivant" → Vérifier passage étape 4 (récapitulatif)
10. Cliquer "Créer mon compte"

**Résultats attendus:**
- ✅ Compte créé dans Firebase Authentication
- ✅ Document créé dans Firestore `users` collection:
  ```javascript
  {
    email: "jean.dupont@test.com",
    firstName: "Jean",
    lastName: "Dupont",
    role: "coach",
    status: "pending", // Important!
    club: "CN Paris Test",
    phone: "+33612345678",
    createdAt: Timestamp
  }
  ```
- ✅ Redirection vers `login.html` avec message "En attente d'approbation"
- ✅ Toast de succès affiché

**Erreurs possibles:**
- ❌ "Email already exists" → Email déjà utilisé
- ❌ "Weak password" → Mot de passe trop faible
- ❌ Erreur réseau → Vérifier connexion Internet

---

### TEST 2: Approbation Admin ✅

**Objectif:** Vérifier que l'admin peut approuver les inscriptions

**Prérequis:** Test 1 complété (coach en status "pending")

**Étapes:**
1. Se connecter comme admin sur `login.html`
2. Redirection automatique vers `admin.html`
3. Vérifier section "Demandes d'inscription"
4. Trouver "Jean Dupont" dans la liste
5. Cliquer "Voir détails"
6. Vérifier les informations dans le modal:
   - Email, club, téléphone
   - Date de demande
7. Cliquer "Approuver"
8. Confirmer dans la popup

**Résultats attendus:**
- ✅ Modal se ferme
- ✅ Jean Dupont disparaît de la liste "Demandes"
- ✅ Compteur "En attente" diminue de 1
- ✅ Toast "Demande approuvée avec succès"
- ✅ Dans Firestore: `status: "active"`
- ✅ Jean peut maintenant se connecter

**Vérification Firestore:**
```javascript
// Console Firestore → users → [userId de Jean]
{
  status: "active", // Changé de "pending" à "active"
  updatedAt: Timestamp (nouveau)
}
```

---

### TEST 3: Connexion Coach & Redirection ✅

**Objectif:** Vérifier la connexion et redirection par rôle

**Prérequis:** Test 2 complété (coach approuvé)

**Étapes:**
1. Ouvrir `login.html`
2. Entrer email: jean.dupont@test.com
3. Entrer mot de passe: Test1234!
4. Cliquer "Se connecter"

**Résultats attendus:**
- ✅ Loader affiché pendant authentification
- ✅ Redirection automatique vers `index.html`
- ✅ Message bienvenue: "Bienvenue, Jean Dupont 👋"
- ✅ 2 cartes visibles: "Nageurs" et "Équipe"
- ✅ Bouton déconnexion en haut à droite
- ✅ Dans Firestore: `lastLogin` mis à jour

**Test redirection par rôle:**
- Admin → `admin.html`
- Coach → `index.html`
- Nageur → `nageur.html`

---

### TEST 4: Création Équipe ✅

**Objectif:** Vérifier la création d'équipe par le coach

**Prérequis:** Connecté comme coach

**Étapes:**
1. Depuis `index.html`, cliquer carte "Équipe"
2. Redirection vers `equipe.html`
3. Cliquer "Nouvelle équipe" (bouton + ou dans dropdown)
4. Modal "Créer une équipe" s'ouvre
5. Remplir le formulaire:
   - Nom: Équipe Compétition 2025
   - Catégorie: Senior
   - Saison: 2024-2025
6. Section "Sélectionner nageurs" (vide si aucun nageur)
7. Cliquer "Créer l'équipe"

**Résultats attendus:**
- ✅ Toast "Équipe créée avec succès"
- ✅ Modal se ferme
- ✅ Nouvelle équipe dans le dropdown
- ✅ Document créé dans Firestore `teams`:
  ```javascript
  {
    name: "Équipe Compétition 2025",
    coachId: "[UID du coach]",
    category: "Senior",
    season: "2024-2025",
    swimmers: [], // Vide pour l'instant
    totalSwimmers: 0,
    activeSwimmers: 0,
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
  ```

---

### TEST 5: Génération Compte Nageur ⭐

**Objectif:** Vérifier la génération automatique de compte nageur

**Prérequis:** 
- Équipe créée (Test 4)
- Aucun nageur dans l'équipe

**Préparation:** Créer un nageur manuellement dans Firestore
```javascript
// Console Firestore → users → Ajouter document (ID auto)
{
  email: "thomas.martin@temp.com",
  firstName: "Thomas",
  lastName: "Martin",
  role: "nageur",
  status: "active",
  coachId: "[UID du coach Jean]",
  teamId: "[ID de l'équipe créée]",
  hasAccount: false, // Important!
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
}
```

**Étapes:**
1. Sur `equipe.html`, sélectionner l'équipe
2. La liste devrait afficher Thomas Martin
3. Vérifier icône "⚠ Pas de compte"
4. Cliquer bouton vert "Générer accès"
5. Confirmer dans la popup

**Résultats attendus:**
- ✅ Modal "Compte créé !" s'affiche
- ✅ Email affiché: `thomas.martin@cnparistest.swim` (format: prénom.nom@club.swim)
- ✅ Mot de passe aléatoire affiché (10 caractères)
- ✅ Bouton "Copier" fonctionne
- ✅ Nouveau compte dans Firebase Authentication
- ✅ Document Firestore mis à jour:
  ```javascript
  {
    hasAccount: true,
    // Ancien document supprimé, nouveau créé avec nouvel UID
  }
  ```
- ✅ Dans la liste: "✓ Compte actif" + "Dernière connexion: Jamais connecté"

**Note:** Noter les identifiants pour Test 6

---

### TEST 6: Connexion Nageur & Dashboard Personnel ✅

**Objectif:** Vérifier l'interface nageur

**Prérequis:** Test 5 complété (compte nageur généré)

**Étapes:**
1. Se déconnecter (si connecté comme coach)
2. Ouvrir `login.html`
3. Entrer identifiants générés (Test 5):
   - Email: thomas.martin@cnparistest.swim
   - Mot de passe: [celui généré]
4. Cliquer "Se connecter"

**Résultats attendus:**
- ✅ Redirection automatique vers `nageur.html`
- ✅ Header: "🏊 Mon Dashboard"
- ✅ Message: "Bienvenue, Thomas Martin 👋"
- ✅ Bouton déconnexion visible
- ✅ Bouton vert proéminent "📝 Saisir Bien-être"
- ✅ Dashboard avec 4 cartes de stats:
  - Bien-être (N/A si aucune donnée)
  - Performances (0)
  - Compétitions (0)
  - Assiduité (0%)
- ✅ Sections vides car aucune donnée

---

### TEST 7: Saisie Bien-être Quotidien ⭐⭐

**Objectif:** Tester la saisie de bien-être mode quotidien

**Prérequis:** Connecté comme nageur (Test 6)

**Étapes:**
1. Sur `nageur.html`, cliquer bouton "📝 Saisir Bien-être"
2. Panel s'ouvre à droite
3. Vérifier onglet "Quotidien (5 champs)" actif
4. Remplir les 5 sliders:
   - Sommeil: 8/10
   - Énergie: 7/10
   - Motivation: 9/10
   - Stress: 4/10
   - Récupération: 8/10
5. Observer les valeurs en temps réel sous chaque slider
6. Cliquer "Enregistrer"

**Résultats attendus:**
- ✅ Toast "Enregistrement en cours..."
- ✅ Toast "✅ Bien-être enregistré avec succès !"
- ✅ Panel se ferme
- ✅ Dashboard se recharge
- ✅ Carte "Bien-être" affiche le score calculé:
  ```
  Score = (8 + 7 + 9 + (11-4) + 8) / 5 = 7.8
  ```
- ✅ Document créé dans Firestore `wellbeing_data`:
  ```javascript
  {
    swimmerId: "[UID Thomas]",
    date: "2025-11-24",
    timestamp: Timestamp,
    sleepQuality: 8,
    energyLevel: 7,
    motivation: 9,
    stressLevel: 4,
    muscleRecovery: 8,
    score: 7.8,
    enteredBy: "self",
    enteredByUserId: "[UID Thomas]"
  }
  ```

---

### TEST 8: Saisie Bien-être Hebdomadaire ⭐⭐

**Objectif:** Tester le mode hebdomadaire avec 13 champs

**Prérequis:** Connecté comme nageur

**Étapes:**
1. Cliquer "📝 Saisir Bien-être"
2. Cliquer onglet "Hebdomadaire (13 champs)"
3. Vérifier que les 5 champs quotidiens sont présents
4. Remplir les 8 champs supplémentaires:
   - Heures de sommeil: 8.5
   - Poids corporel: 68.5 kg
   - Réveils nocturnes: 1-2
   - Qualité réveil: 4/5
   - Douleur musculaire: 2/10
   - Localisation: Épaule droite
   - Fatigue générale: Modérée
   - Appétit: Normal
5. Cliquer "Enregistrer"

**Résultats attendus:**
- ✅ Tous les 13 champs sauvegardés dans Firestore
- ✅ Document `wellbeing_data` avec champs supplémentaires
- ✅ Score calculé sur les 5 champs principaux uniquement

---

### TEST 9: Synchronisation Temps Réel ⚡⚡⚡

**Objectif:** Vérifier la synchronisation coach ↔ nageur

**Prérequis:** 
- Test 7 complété (nageur a saisi bien-être)
- 2 navigateurs/fenêtres ou 2 appareils

**Configuration:**
- **Fenêtre 1:** Coach connecté sur `equipe.html`
- **Fenêtre 2:** Nageur connecté sur `nageur.html`

**Étapes:**
1. Fenêtre 1 (Coach): Ouvrir `equipe.html`, sélectionner l'équipe
2. Vérifier que Thomas Martin est visible avec score 7.8
3. Fenêtre 2 (Nageur): Saisir nouveau bien-être (valeurs différentes)
4. Cliquer "Enregistrer"
5. **Immédiatement** observer Fenêtre 1 (Coach)

**Résultats attendus:**
- ✅ Sans rafraîchir, le score de Thomas se met à jour dans les 1-2 secondes
- ✅ Console navigateur (F12) affiche: "🔔 Nouveau bien-être ajouté"
- ✅ Dashboard coach recharge automatiquement
- ✅ Nouveau score visible

**Test inverse:**
1. Fenêtre 1 (Coach): Modifier une donnée nageur (si fonctionnalité existante)
2. Fenêtre 2 (Nageur): Observer mise à jour automatique

---

### TEST 10: Protection des Routes 🔒

**Objectif:** Vérifier que les pages sont protégées par rôle

**Test 10.1: Nageur essaie d'accéder admin.html**
1. Connecté comme nageur
2. Taper manuellement: `admin.html` dans l'URL
3. **Attendu:** Redirection automatique vers `nageur.html`

**Test 10.2: Coach essaie d'accéder nageur.html**
1. Connecté comme coach
2. Taper manuellement: `nageur.html` dans l'URL
3. **Attendu:** Redirection vers `index.html`

**Test 10.3: Non-authentifié essaie d'accéder n'importe quelle page**
1. Se déconnecter
2. Taper: `admin.html`, `nageur.html`, `equipe.html`, ou `index.html`
3. **Attendu:** Redirection vers `login.html`

**Test 10.4: Coach avec status "pending"**
1. Dans Firestore, changer status coach → "pending"
2. Essayer de se connecter
3. **Attendu:** Message "Votre compte est en attente d'approbation"

---

### TEST 11: Règles Sécurité Firestore 🔒

**Objectif:** Vérifier les règles de sécurité Firestore

**Prérequis:** Règles déployées depuis `FIRESTORE-STRUCTURE.md`

**Test 11.1: Nageur lit uniquement ses données**
```javascript
// Console navigateur (F12) en tant que nageur
db.collection('wellbeing_data')
  .where('swimmerId', '==', '[autre nageur ID]')
  .get()
  .then(snap => console.log('Données:', snap.size))
  .catch(err => console.log('ERREUR (attendu):', err.code));

// Attendu: ERREUR "permission-denied"
```

**Test 11.2: Coach lit équipe seulement**
```javascript
// En tant que coach
db.collection('teams')
  .where('coachId', '==', '[autre coach ID]')
  .get()
  .then(snap => console.log('Données:', snap.size))
  .catch(err => console.log('ERREUR (attendu):', err.code));

// Attendu: ERREUR "permission-denied"
```

**Test 11.3: Nageur ne peut pas changer son rôle**
```javascript
// En tant que nageur
db.collection('users').doc(auth.currentUser.uid).update({
  role: 'admin'
})
.then(() => console.log('SUCCESS (PAS BON!)'))
.catch(err => console.log('ERREUR (attendu):', err.code));

// Attendu: ERREUR "permission-denied"
```

---

### TEST 12: Gestion Équipes Multiples ✅

**Objectif:** Vérifier qu'un coach peut gérer plusieurs équipes

**Étapes:**
1. Connecté comme coach sur `equipe.html`
2. Créer 2ème équipe: "Équipe Jeunes 2025"
3. Créer 3ème équipe: "Équipe Masters 2025"
4. Cliquer dropdown équipes
5. Vérifier les 3 équipes listées
6. Sélectionner "Équipe Jeunes"
7. Vérifier que le contenu change
8. Sélectionner "Équipe Masters"
9. Vérifier que le contenu change

**Résultats attendus:**
- ✅ 3 équipes dans Firestore avec même `coachId`
- ✅ Dropdown affiche toutes les équipes
- ✅ Changement d'équipe charge les bonnes données
- ✅ Aucun mélange de nageurs entre équipes

---

### TEST 13: Responsive Mobile 📱

**Objectif:** Vérifier l'interface sur mobile

**Étapes:**
1. Ouvrir DevTools (F12) → Mode responsive
2. Sélectionner "iPhone 12 Pro" ou "Samsung Galaxy S20"
3. Tester toutes les pages:
   - `login.html`
   - `register.html`
   - `index.html`
   - `admin.html`
   - `equipe.html`
   - `nageur.html`

**Points à vérifier:**
- ✅ Textes lisibles (pas trop petits)
- ✅ Boutons cliquables (assez grands)
- ✅ Pas de défilement horizontal
- ✅ Modals s'affichent correctement
- ✅ Formulaires utilisables
- ✅ Graphiques adaptés

---

## 🐛 Dépannage Tests

### Erreur: "Missing or insufficient permissions"
**Cause:** Règles Firestore pas déployées ou incorrectes  
**Solution:** 
1. Firebase Console → Firestore → Rules
2. Copier règles depuis `FIRESTORE-STRUCTURE.md`
3. Publier

### Erreur: "The query requires an index"
**Cause:** Index Firestore manquant  
**Solution:** 
1. Cliquer sur le lien fourni par Firebase dans l'erreur
2. Firebase crée l'index automatiquement
3. Attendre 1-2 minutes
4. Réessayer

### Erreur: "Email already in use"
**Cause:** Email déjà utilisé dans Firebase Auth  
**Solution:**
1. Firebase Console → Authentication → Users
2. Supprimer l'utilisateur existant
3. Réessayer

### Page blanche après connexion
**Cause:** Erreur JavaScript ou Firebase non initialisé  
**Solution:**
1. Ouvrir DevTools (F12) → Console
2. Lire l'erreur affichée
3. Vérifier `firebase-config.js` configuré
4. Vérifier connexion Internet

### Score bien-être "NaN"
**Cause:** Champs non remplis ou valeurs invalides  
**Solution:**
1. Vérifier que tous les 5 champs quotidiens sont remplis
2. Vérifier que les valeurs sont des nombres 1-10
3. Recharger la page

---

## ✅ Checklist Complète des Tests

### Authentification
- [ ] Inscription coach (status pending)
- [ ] Approbation admin
- [ ] Connexion coach → index.html
- [ ] Connexion admin → admin.html
- [ ] Connexion nageur → nageur.html
- [ ] Déconnexion (tous les rôles)
- [ ] Protection routes par rôle
- [ ] Mot de passe oublié

### Admin
- [ ] Dashboard stats à jour
- [ ] Liste demandes pending
- [ ] Approuver demande
- [ ] Rejeter demande
- [ ] Liste tous utilisateurs
- [ ] Modifier rôle utilisateur
- [ ] Activer/désactiver utilisateur

### Coach
- [ ] Créer équipe
- [ ] Lister équipes
- [ ] Sélectionner équipe
- [ ] Générer compte nageur
- [ ] Afficher identifiants
- [ ] Copier identifiants
- [ ] Voir liste nageurs
- [ ] Voir score bien-être nageurs
- [ ] Synchronisation temps réel

### Nageur
- [ ] Dashboard personnel
- [ ] Saisie bien-être quotidien (5 champs)
- [ ] Saisie bien-être hebdomadaire (13 champs)
- [ ] Calcul score automatique
- [ ] Sauvegarde Firestore
- [ ] Affichage données personnelles

### Sécurité
- [ ] Règles Firestore nageur
- [ ] Règles Firestore coach
- [ ] Règles Firestore admin
- [ ] Protection champs sensibles (role, status)
- [ ] Status "pending" ne peut pas se connecter

### Performance
- [ ] Temps de chargement < 3s
- [ ] Synchronisation temps réel < 2s
- [ ] Pas d'erreurs console
- [ ] Pas de memory leaks

### Responsive
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Modals responsive
- [ ] Graphiques responsive

---

## 📊 Résultats Attendus

**Tous les tests doivent passer ✅**

Si un test échoue:
1. Noter l'erreur exacte
2. Consulter section "Dépannage Tests"
3. Vérifier configuration Firebase
4. Consulter `FIRESTORE-STRUCTURE.md` pour règles
5. Vérifier console navigateur (F12)

---

## 🎯 Tests Prioritaires

**Minimum pour production:**
1. ✅ TEST 1: Inscription coach
2. ✅ TEST 2: Approbation admin
3. ✅ TEST 3: Connexion & redirection
4. ✅ TEST 5: Génération compte nageur
5. ✅ TEST 6: Connexion nageur
6. ✅ TEST 7: Saisie bien-être quotidien
7. ✅ TEST 9: Synchronisation temps réel
8. ✅ TEST 10: Protection routes

**Tests recommandés:**
- Tous les autres tests (8, 11, 12, 13)

---

**Une fois tous les tests passés, l'application est prête pour production !** 🚀
