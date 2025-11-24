# 🔐 Système d'Authentification Multi-Rôles - Spécifications

## 📋 Vue d'Ensemble

**Objectif**: Transformer l'application locale (localStorage) en système multi-utilisateurs avec authentification, 3 niveaux d'accès et synchronisation temps réel.

**Date**: Décembre 2024  
**Version cible**: 3.0

---

## 🎯 3 Rôles Utilisateurs

### 1. 👑 ADMINISTRATEUR
**Description**: Gestionnaire système qui valide les inscriptions et supervise.

**Fonctionnalités**:
- ✅ **Validation inscriptions**: Voir liste demandes inscription coaches en attente
- ✅ **Accepter/Refuser**: Approuver ou rejeter demandes avec notification email
- ✅ **Gestion utilisateurs**: Voir tous les utilisateurs (coaches + nageurs)
- ✅ **Modifier rôles**: Promouvoir coach → admin, rétrograder admin → coach
- ✅ **Désactiver comptes**: Bloquer accès sans supprimer données
- ✅ **Tableau de bord global**: Statistiques toutes équipes (nombre coaches, nageurs, saisies)
- ✅ **Logs d'activité**: Voir qui s'est connecté quand, actions effectuées

**Interface**: `admin.html`

**Navigation**:
```
admin.html
├── Dashboard (stats globales)
├── Demandes d'inscription (en attente)
├── Gestion utilisateurs (tous)
├── Logs d'activité
└── Paramètres système
```

---

### 2. 🏊‍♂️ ENTRAÎNEUR (COACH)
**Description**: Gère une ou plusieurs équipes de nageurs. Interface actuelle améliorée.

**Fonctionnalités EXISTANTES** (à conserver):
- ✅ Voir aperçu équipe (7 sections)
- ✅ Saisie collective de données
- ✅ Gestion équipes et nageurs
- ✅ Statistiques et analyses

**Fonctionnalités NOUVELLES**:
- ✨ **Générer accès nageur**: Bouton pour créer compte nageur avec email/mdp auto
- ✨ **Inviter nageurs**: Envoyer email d'invitation avec lien + identifiants
- ✨ **Voir statut connexion**: Badge "Jamais connecté" / "Connecté il y a X jours"
- ✨ **Voir données saisies par nageurs**: Distinction visuelle (nageur a rempli vs coach)
- ✨ **Multi-équipes**: Si admin lui donne accès, gérer plusieurs équipes
- ✨ **Profil personnel**: Modifier email, mot de passe, photo

**Interface**: `equipe.html` (actuelle + améliorations)

**Navigation**:
```
equipe.html
├── Mes Équipes (liste + switcher)
├── Dashboard Équipe Sélectionnée
│   ├── Vue d'ensemble
│   ├── Bien-être
│   ├── Performance
│   ├── Médical
│   ├── Compétitions
│   ├── Technique
│   └── Assiduité
├── Gestion Nageurs
│   ├── Liste nageurs
│   ├── [NOUVEAU] Générer accès nageur
│   ├── [NOUVEAU] Voir statut connexion
│   └── Statistiques individuelles
├── Saisie Collective (avec sélection)
└── Mon Profil
```

---

### 3. 🏊 NAGEUR
**Description**: Membre d'une équipe qui consulte ses stats personnelles et saisit son bien-être.

**Fonctionnalités**:
- ✅ **Dashboard personnel**: Voir ses 7 sections (bien-être, performance, médical, compétitions, technique, assiduité, global)
- ✅ **Historique complet**: Graphiques évolution bien-être, performances, etc.
- ✅ **Saisie bien-être quotidien**: Formulaire rapide (5 champs essentiels)
- ✅ **Saisie bien-être hebdomadaire**: Formulaire complet (13 champs)
- ✅ **Notifications**: Rappel "N'oublie pas de remplir ton bien-être aujourd'hui"
- ✅ **Voir données coach**: Performances, médical, compétitions ajoutées par coach (lecture seule)
- ✅ **Comparaison équipe**: Voir sa position vs moyenne équipe (optionnel si anonyme)
- ✅ **Profil personnel**: Photo, infos, modifier mot de passe

**Interface**: `nageur.html` (nouvelle, inspirée de dashboard.html)

**Navigation**:
```
nageur.html
├── Mon Dashboard
│   ├── Vue d'ensemble personnelle
│   ├── Mon Bien-être (avec bouton "Saisir aujourd'hui")
│   ├── Mes Performances (lecture seule si ajouté par coach)
│   ├── Mon Suivi Médical
│   ├── Mes Compétitions
│   ├── Mes Évaluations Techniques
│   └── Mon Assiduité
├── Saisie Quotidienne (formulaire rapide 5 champs)
├── Saisie Hebdomadaire (formulaire complet 13 champs)
├── Historique & Graphiques
└── Mon Profil
```

---

## 🔄 Flux d'Authentification

### Inscription Coach
```
1. Coach arrive sur le site
2. Clic "S'inscrire" → register.html
3. Remplit formulaire:
   - Prénom, Nom
   - Email (vérifié unique)
   - Mot de passe (min 8 caractères, 1 majuscule, 1 chiffre)
   - Club/Organisation
   - Téléphone (optionnel)
4. Validation côté client (JS) puis serveur
5. Compte créé avec statut "EN ATTENTE"
6. Email automatique à l'admin: "Nouvelle demande d'inscription"
7. Coach voit message: "Votre demande a été envoyée. Un admin validera sous 24-48h"
8. Admin se connecte → voit demande → Accepte/Refuse
9. Si accepté: Email au coach "Votre compte a été validé !" + lien connexion
10. Coach se connecte → Accède à equipe.html
```

### Création Compte Nageur (par Coach)
```
1. Coach connecté sur equipe.html
2. Va dans "Gestion Nageurs" → "Ajouter Nageur"
3. Remplit:
   - Prénom, Nom
   - Date de naissance
   - Email (optionnel pour génération auto)
   - [NOUVEAU] Case à cocher "Générer accès compte"
4. Si case cochée:
   a. Système génère email: prenom.nom@club-nageurs.app (si pas fourni)
   b. Système génère mot de passe: 8 caractères aléatoires sécurisés
   c. Affiche popup avec identifiants (copier-coller)
   d. Bouton "Envoyer par email" (si email fourni)
5. Nageur reçoit email:
   "Ton coach t'a créé un compte !
    Email: xxxx
    Mot de passe temporaire: xxxx
    Lien: https://app.com/nageur.html
    Tu devras changer ton mot de passe à la 1ère connexion"
6. Nageur se connecte → Formulaire "Changer mot de passe" obligatoire
7. Nageur accède à nageur.html
```

### Connexion Utilisateur
```
1. Utilisateur arrive sur login.html
2. Entre email + mot de passe
3. Serveur vérifie:
   - Utilisateur existe ?
   - Mot de passe correct ? (bcrypt)
   - Compte activé ? (pas désactivé par admin)
   - Compte validé ? (pour coaches)
4. Si OK:
   a. Génère JWT token (expire 7 jours)
   b. Stocke token dans localStorage + cookie httpOnly
   c. Redirige selon rôle:
      - admin → admin.html
      - coach → equipe.html
      - nageur → nageur.html
5. Si échec: Message erreur clair
```

### Gestion Session
```
- Token JWT stocké (localStorage + cookie)
- Middleware vérifie token à chaque requête API
- Si token expiré: Redirection auto vers login.html
- Bouton "Se déconnecter" sur toutes les pages
- Déconnexion = Suppression token + redirection login
```

---

## 🗄️ Base de Données

### Choix Technologie

**Option 1: Firebase (RECOMMANDÉ pour MVP)**
- ✅ **Avantages**: 
  - Rapide à mettre en place
  - Authentification intégrée
  - Base de données temps réel (Firestore)
  - Hébergement gratuit (Firebase Hosting)
  - Pas de serveur à gérer
- ❌ **Inconvénients**:
  - Dépendance à Google
  - Limites quotas gratuits
  - Moins de contrôle

**Option 2: Node.js + Express + MongoDB/PostgreSQL**
- ✅ **Avantages**:
  - Contrôle total
  - Pas de limites
  - Peut ajouter fonctionnalités complexes
- ❌ **Inconvénients**:
  - Plus long à développer
  - Besoin héberger serveur (coût)
  - Maintenance plus complexe

**RECOMMANDATION**: Commencer avec **Firebase** pour MVP, migrer vers backend custom si besoin.

---

### Structure Firestore (si Firebase)

```javascript
// Collection: users
{
  uid: "auto-generated-id",
  email: "coach@example.com",
  role: "coach", // "admin", "coach", "nageur"
  firstName: "Jean",
  lastName: "Dupont",
  club: "Nautic Club",
  phone: "+33612345678",
  status: "active", // "active", "pending", "disabled"
  createdAt: timestamp,
  lastLogin: timestamp,
  profilePicture: "url",
  // Si nageur:
  coachId: "ref-to-coach",
  teamId: "ref-to-team",
  dateOfBirth: "2005-03-15",
  // Si coach:
  teams: ["team-id-1", "team-id-2"]
}

// Collection: teams
{
  id: "auto-generated",
  name: "Équipe Senior Compétition",
  coachId: "ref-to-coach",
  swimmers: ["swimmer-id-1", "swimmer-id-2", ...],
  createdAt: timestamp,
  updatedAt: timestamp
}

// Collection: wellbeing_data
{
  id: "auto-generated",
  swimmerId: "ref-to-swimmer",
  date: "2024-12-01",
  timestamp: timestamp,
  sleepQuality: 8,
  energyLevel: 7,
  motivation: 9,
  stressLevel: 4,
  muscleRecovery: 7,
  sleepHours: 8.5,
  bodyWeight: 70,
  nightAwakenings: "1-2",
  wakeQuality: 4,
  musclePain: 3,
  painLocation: "Épaule droite",
  generalFatigue: "Modérée",
  appetite: "Normal",
  score: 7.6,
  enteredBy: "self", // "self" (nageur) ou "coach" (entraîneur)
  enteredByUserId: "ref-to-user"
}

// Collection: performance_data
{
  id: "auto-generated",
  swimmerId: "ref-to-swimmer",
  date: "2024-12-01",
  vma: 14.2,
  legStrength: 45,
  shoulderStrength: 35,
  coreStrength: 90,
  enteredBy: "coach",
  enteredByUserId: "ref-to-coach"
}

// Collection: medical_data
{
  id: "auto-generated",
  swimmerId: "ref-to-swimmer",
  date: "2024-12-01",
  available: true,
  injury: false,
  injuryDescription: "",
  medicalConditions: "",
  enteredBy: "coach",
  enteredByUserId: "ref-to-coach"
}

// Collection: race_data
{
  id: "auto-generated",
  swimmerId: "ref-to-swimmer",
  date: "2024-12-01",
  competition: "Championnat Régional",
  stroke: "Libre",
  distance: 100,
  time: "00:54.32",
  personalRecord: true,
  performance: "excellent",
  enteredBy: "coach"
}

// Collection: technical_data
{
  id: "auto-generated",
  swimmerId: "ref-to-swimmer",
  date: "2024-12-01",
  stroke: "Papillon",
  score: 8.5,
  notes: "Bonne respiration, améliorer virage",
  enteredBy: "coach"
}

// Collection: attendance_data
{
  id: "auto-generated",
  swimmerId: "ref-to-swimmer",
  date: "2024-12-01",
  status: "present", // "present", "absent"
  excused: false,
  reason: "",
  enteredBy: "coach"
}

// Collection: registration_requests (demandes inscription)
{
  id: "auto-generated",
  email: "newcoach@example.com",
  firstName: "Marie",
  lastName: "Martin",
  club: "Club Aquatique",
  phone: "+33687654321",
  message: "Je souhaite gérer mes équipes...",
  requestDate: timestamp,
  status: "pending", // "pending", "approved", "rejected"
  reviewedBy: "admin-id",
  reviewedAt: timestamp,
  reviewNotes: "Approuvé après vérification"
}
```

---

## 🎨 Interfaces à Créer/Modifier

### Pages Nouvelles

#### 1. `login.html` - Page de Connexion
```html
Structure:
- Logo centré
- Formulaire:
  * Email (input type="email")
  * Mot de passe (input type="password" avec icône œil)
  * Case "Se souvenir de moi"
  * Bouton "Se connecter"
- Liens:
  * "Mot de passe oublié ?"
  * "Pas encore de compte ? S'inscrire"
- Message erreur si échec
- Loader pendant vérification
```

#### 2. `register.html` - Inscription Coach
```html
Structure:
- Formulaire en plusieurs étapes (wizard):
  Étape 1: Informations personnelles
    * Prénom, Nom
    * Email
  Étape 2: Club & Contact
    * Nom du club/organisation
    * Téléphone (optionnel)
  Étape 3: Mot de passe
    * Mot de passe
    * Confirmer mot de passe
    * Indicateur force mot de passe
  Étape 4: Conditions
    * Accepter CGU
    * Bouton "S'inscrire"
- Message succès: "Demande envoyée, attente validation admin"
```

#### 3. `admin.html` - Interface Administrateur
```html
Structure:
- Sidebar navigation:
  * Dashboard
  * Demandes d'inscription
  * Gestion utilisateurs
  * Logs d'activité
  * Paramètres

Section Dashboard:
  - Cartes statistiques:
    * Nombre coaches (actifs/en attente)
    * Nombre nageurs
    * Nombre équipes
    * Saisies dernières 24h
  - Graphique évolution inscriptions
  - Activité récente

Section Demandes:
  - Tableau avec colonnes:
    * Nom complet
    * Email
    * Club
    * Date demande
    * Actions: [Voir détails] [Accepter] [Refuser]
  - Modal détails demande

Section Gestion Utilisateurs:
  - Filtre par rôle (admin/coach/nageur)
  - Recherche par nom/email
  - Tableau:
    * Photo, Nom, Email, Rôle, Statut, Dernière connexion
    * Actions: [Modifier] [Désactiver] [Supprimer]
```

#### 4. `nageur.html` - Interface Nageur
```html
Structure similaire à dashboard.html mais personnalisée:

Header:
  - Logo
  - "Bienvenue [Prénom] !"
  - Photo profil
  - Bouton déconnexion

Navigation:
  - Mon Dashboard
  - Saisir Bien-être
  - Historique
  - Mon Profil

Section Dashboard:
  - [NOUVEAU] Bouton proéminent: "✨ Saisir mon bien-être aujourd'hui"
  - 7 sections (comme équipe mais personnelles):
    * Vue d'ensemble
    * Mon Bien-être (graphiques évolution)
    * Mes Performances
    * Mon Suivi Médical
    * Mes Compétitions
    * Mes Évaluations Techniques
    * Mon Assiduité

Section Saisie Bien-être:
  - Onglet "Quotidien" (5 champs essentiels):
    * Qualité sommeil
    * Niveau énergie
    * Motivation
    * Niveau stress
    * Récupération musculaire
    * → Rapide, 2 minutes max
  
  - Onglet "Hebdomadaire" (13 champs complets):
    * Tous les champs existants
    * → Détaillé, 5 minutes

  - Calendrier avec historique:
    * Jours remplis: vert
    * Jours manquants: gris
    * Série actuelle: "🔥 5 jours d'affilée !"
```

---

### Pages Modifiées

#### `equipe.html` - Améliorations
```html
Ajouts:

1. Section "Gestion Nageurs" améliorée:
   
   [Tableau nageurs existant]
   + Colonne "Statut Connexion":
     * Badge rouge "Jamais connecté"
     * Badge vert "Connecté il y a 2 jours"
     * Badge gris "Compte non créé"
   
   + Colonne "Actions":
     * [Voir stats] (existant)
     * [NOUVEAU] [Générer accès] (si pas de compte)
     * [NOUVEAU] [Renvoyer invitation] (si compte non utilisé)
     * [NOUVEAU] [Réinitialiser mot de passe]

2. Modal "Générer Accès Nageur":
   - Affiche email généré (ou permet saisie)
   - Affiche mot de passe temporaire
   - Boutons:
     * [Copier identifiants]
     * [Envoyer par email]
     * [Télécharger PDF] (fiche avec identifiants)
   - Message: "Conservez ces identifiants en lieu sûr"

3. Indicateur source données:
   Dans les sections (bien-être, etc.):
   - Icône "👤" si saisie par nageur
   - Icône "🏊‍♂️" si saisie par coach
   - Tooltip au survol: "Rempli par [Nom] le [Date]"

4. Section "Mon Profil" (nouvelle):
   - Photo
   - Informations personnelles
   - Modifier email / mot de passe
   - Mes équipes (liste)
```

#### `index.html` - Page d'Accueil Publique
```html
Avant: Page d'accueil simple

Après: Landing page avec authentification
- Hero section: "Gérez votre équipe de natation"
- Fonctionnalités principales (3 cartes)
- Boutons CTA:
  * "Se connecter" → login.html
  * "S'inscrire" → register.html
- Section témoignages (optionnel)
- Footer
```

---

## 🔒 Sécurité & Validation

### Mots de Passe
```javascript
Règles:
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (optionnel mais recommandé)

Hashage:
- bcrypt avec cost factor 10
- Jamais stocker en clair
- Salage automatique

Génération (pour nageurs):
- 12 caractères aléatoires
- Mix majuscules, minuscules, chiffres
- Exemple: "Kp9mZx4nQ7vB"
```

### Tokens JWT
```javascript
Structure:
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    uid: "user-id",
    email: "user@example.com",
    role: "coach",
    iat: timestamp,
    exp: timestamp + 7days
  },
  signature: "secret-key"
}

Stockage:
- localStorage: Pour accès côté client
- Cookie httpOnly: Pour sécurité (pas accessible JS)

Expiration:
- 7 jours par défaut
- Refresh automatique si activité
- "Se souvenir de moi" → 30 jours
```

### Protection Routes
```javascript
// Middleware côté serveur
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
  };
}

// Utilisation
app.get('/api/admin/users', requireAuth, requireRole('admin'), getUsers);
app.get('/api/coach/teams', requireAuth, requireRole('coach'), getTeams);
```

### Validation Inputs
```javascript
// Côté client (JS)
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password);
}

// Côté serveur (Node.js avec express-validator)
const { body, validationResult } = require('express-validator');

app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Traitement...
});
```

---

## 🔄 Synchronisation Nageur → Entraîneur

### Problématique
Quand un nageur saisit son bien-être, l'entraîneur doit voir la mise à jour **immédiatement** (ou quasi) dans son dashboard équipe.

### Solution 1: Firestore Real-Time Listeners (RECOMMANDÉ si Firebase)
```javascript
// Côté entraîneur (equipe.html)
const db = firebase.firestore();

// Écouter changements en temps réel
db.collection('wellbeing_data')
  .where('swimmerId', 'in', teamSwimmerIds)
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        console.log('Nouvelle saisie:', change.doc.data());
        updateDashboard(change.doc.data());
        showNotification('📊 Nouveau bien-être ajouté par ' + swimmerName);
      }
    });
  });

// Avantages:
// - Temps réel véritable (< 1 seconde)
// - Pas de polling
// - Firebase gère la complexité
```

### Solution 2: Polling API (si backend custom)
```javascript
// Côté entraîneur
let lastCheckTimestamp = Date.now();

setInterval(async () => {
  const response = await fetch(`/api/wellbeing/new?since=${lastCheckTimestamp}`);
  const newData = await response.json();
  
  if (newData.length > 0) {
    newData.forEach(entry => {
      updateDashboard(entry);
      showNotification('📊 Nouveau bien-être ajouté');
    });
    lastCheckTimestamp = Date.now();
  }
}, 30000); // Vérifier toutes les 30 secondes

// Avantages:
// - Simple à implémenter
// - Fonctionne partout
// Inconvénients:
// - Délai 30s
// - Charge serveur
```

### Solution 3: WebSockets (temps réel avancé)
```javascript
// Serveur (Node.js + Socket.io)
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Coach connecté');
  
  socket.on('join-team', (teamId) => {
    socket.join(`team-${teamId}`);
  });
});

// Quand nageur saisit données
function onSwimmerDataAdded(data) {
  const teamId = data.teamId;
  io.to(`team-${teamId}`).emit('new-swimmer-data', data);
}

// Client (entraîneur)
const socket = io('https://api.example.com');
socket.emit('join-team', currentTeamId);

socket.on('new-swimmer-data', (data) => {
  updateDashboard(data);
  showNotification('📊 Nouveau bien-être ajouté');
});

// Avantages:
// - Temps réel parfait
// - Bidirectionnel
// Inconvénients:
// - Plus complexe
// - Nécessite infrastructure WebSocket
```

**RECOMMANDATION**: Firebase Real-Time Listeners pour MVP, WebSockets si backend custom.

---

## 📧 Système Email

### Service Email (Choix)

**Option 1: SendGrid (RECOMMANDÉ)**
- Gratuit jusqu'à 100 emails/jour
- API simple
- Templates HTML

**Option 2: Firebase Email Extension**
- Intégré à Firebase
- Utilise SendGrid/Mailgun en backend

**Option 3: Nodemailer (si backend Node.js)**
- Gratuit
- SMTP custom

### Templates Email

#### 1. Validation Inscription Coach
```html
Objet: Nouvelle demande d'inscription - [Nom Coach]

Bonjour Admin,

Un nouveau coach a demandé à rejoindre la plateforme:

Nom: [Prénom Nom]
Email: [Email]
Club: [Club]
Date: [Date demande]

[Voir la demande] → lien vers admin.html

---
Système Suivi Nageurs
```

#### 2. Compte Validé
```html
Objet: Votre compte a été validé ! 🎉

Bonjour [Prénom],

Bonne nouvelle ! Votre demande d'inscription a été approuvée.

Vous pouvez maintenant vous connecter:
👉 [Se connecter]

Vos identifiants:
Email: [Email]
Mot de passe: [Celui que vous avez choisi]

Besoin d'aide ? Consultez notre guide de démarrage.

---
L'équipe Suivi Nageurs
```

#### 3. Invitation Nageur
```html
Objet: Ton coach t'a créé un compte ! 🏊‍♂️

Salut [Prénom],

Ton coach [Nom Coach] t'a créé un compte sur la plateforme Suivi Nageurs.

🔐 Tes identifiants:
Email: [Email généré]
Mot de passe temporaire: [Mot de passe]

👉 [Se connecter]

⚠️ Important: Tu devras changer ton mot de passe lors de ta première connexion.

Qu'est-ce que tu peux faire ?
✅ Voir ton dashboard personnel
✅ Remplir ton bien-être quotidien
✅ Suivre ton évolution
✅ Consulter tes performances

À bientôt sur la plateforme !

---
L'équipe Suivi Nageurs
```

---

## 🚀 Plan d'Implémentation

### Phase 1: Setup Backend (Durée: 2-3 jours)
```
Étape 1: Créer projet Firebase
  - Console Firebase → Nouveau projet
  - Activer Authentication (Email/Password)
  - Créer Firestore Database
  - Configurer règles sécurité Firestore

Étape 2: Définir structure Firestore
  - Créer collections (users, teams, wellbeing_data...)
  - Règles d'accès par rôle

Étape 3: Configurer Firebase dans l'app
  - Ajouter SDK Firebase
  - Initialiser avec clés API
  - Créer firebase-config.js

Étape 4: API Functions (Firebase Functions ou Cloud)
  - Fonction validation inscription
  - Fonction génération compte nageur
  - Fonction envoi emails
```

### Phase 2: Pages Authentification (Durée: 2 jours)
```
Étape 1: login.html
  - Design formulaire
  - Validation côté client
  - Connexion Firebase Auth
  - Gestion erreurs
  - Redirection selon rôle

Étape 2: register.html
  - Formulaire multi-étapes
  - Validation mot de passe fort
  - Création demande dans Firestore
  - Email automatique à admin

Étape 3: forgot-password.html
  - Formulaire reset
  - Email réinitialisation Firebase
```

### Phase 3: Interface Admin (Durée: 3 jours)
```
Étape 1: admin.html structure
  - Layout sidebar + main
  - Navigation

Étape 2: Dashboard admin
  - Stats globales
  - Graphiques

Étape 3: Gestion demandes inscription
  - Tableau demandes en attente
  - Modal détails
  - Boutons Accepter/Refuser
  - Mise à jour statut + email

Étape 4: Gestion utilisateurs
  - Tableau tous users
  - Filtres et recherche
  - Actions (modifier rôle, désactiver)
```

### Phase 4: Interface Nageur (Durée: 4 jours)
```
Étape 1: nageur.html structure
  - Header personnalisé
  - Navigation

Étape 2: Dashboard nageur
  - 7 sections adaptées (lecture données Firestore)
  - Graphiques personnels

Étape 3: Formulaires bien-être
  - Onglet Quotidien (5 champs)
  - Onglet Hebdomadaire (13 champs)
  - Sauvegarde Firestore avec enteredBy="self"
  - Calendrier historique

Étape 4: Profil nageur
  - Affichage infos
  - Changement mot de passe
  - Upload photo
```

### Phase 5: Amélioration Interface Coach (Durée: 3 jours)
```
Étape 1: Adapter equipe.html
  - Connexion Firestore (remplacer localStorage)
  - Charger équipes du coach connecté

Étape 2: Bouton "Générer accès nageur"
  - Modal génération email/mdp
  - Sauvegarde compte nageur dans Firestore
  - Envoi email invitation

Étape 3: Indicateurs source données
  - Icônes nageur/coach sur chaque donnée
  - Colonne "Statut connexion" dans liste nageurs

Étape 4: Profil coach
  - Modifier infos personnelles
```

### Phase 6: Migration Données (Durée: 1 jour)
```
Étape 1: Script migration localStorage → Firestore
  - Lire données existantes localStorage
  - Transformer format
  - Uploader dans Firestore

Étape 2: Tester migration sur données réelles
```

### Phase 7: Synchronisation Temps Réel (Durée: 1 jour)
```
Étape 1: Firestore Listeners côté coach
  - Écouter ajouts wellbeing_data
  - Mettre à jour dashboard automatiquement
  - Notifications

Étape 2: Tester avec nageur + coach connectés simultanément
```

### Phase 8: Tests & Debug (Durée: 3 jours)
```
Étape 1: Tests unitaires
  - Authentification (login, logout, register)
  - Permissions (admin, coach, nageur)

Étape 2: Tests intégration
  - Flux complet coach: inscription → validation → utilisation
  - Flux nageur: création compte → connexion → saisie → sync coach

Étape 3: Tests cross-browser
  - Chrome, Firefox, Edge, Safari, Mobile

Étape 4: Corrections bugs
```

### Phase 9: Documentation & Déploiement (Durée: 1 jour)
```
Étape 1: Documentation technique
  - Architecture
  - API Firestore
  - Règles sécurité

Étape 2: Guide utilisateur
  - Guide coach
  - Guide nageur
  - Guide admin

Étape 3: Déploiement
  - Firebase Hosting ou autre
  - Configuration domaine
  - SSL
```

---

## ⏱️ Estimation Totale

**Durée totale**: ~20 jours de développement

**Répartition**:
- Backend setup: 3 jours (15%)
- Authentification: 2 jours (10%)
- Interface Admin: 3 jours (15%)
- Interface Nageur: 4 jours (20%)
- Interface Coach: 3 jours (15%)
- Migration données: 1 jour (5%)
- Synchronisation: 1 jour (5%)
- Tests: 3 jours (15%)

---

## 💰 Coûts Estimés (Firebase)

### Gratuit (Plan Spark)
- 10 GB Firestore stockage
- 50K lectures/jour
- 20K écritures/jour
- 100 emails/jour (SendGrid)
- **Suffisant pour**: 20-30 coaches, 200-300 nageurs

### Payant (Plan Blaze - Pay as you go)
- Si dépassement:
  - Stockage: $0.18/GB/mois
  - Lectures: $0.06 / 100K
  - Écritures: $0.18 / 100K
- **Estimation**: $10-30/mois pour 100 coaches, 1000 nageurs

---

## 🎯 Critères de Succès

### Fonctionnels
- [ ] Coach peut s'inscrire et être validé par admin
- [ ] Coach peut créer compte nageur avec email/mdp auto
- [ ] Nageur reçoit email et peut se connecter
- [ ] Nageur voit son dashboard personnel (7 sections)
- [ ] Nageur peut saisir bien-être quotidien/hebdomadaire
- [ ] Données nageur apparaissent instantanément chez coach
- [ ] Admin peut voir/valider toutes demandes inscription
- [ ] Roles respectés (admin ≠ coach ≠ nageur)

### Techniques
- [ ] Authentification sécurisée (JWT + bcrypt)
- [ ] Base de données Firestore structurée
- [ ] Synchronisation temps réel fonctionnelle
- [ ] Performance: chargement < 2s
- [ ] Responsive mobile

### Documentation
- [ ] Guide utilisateur coach
- [ ] Guide utilisateur nageur
- [ ] Guide admin
- [ ] Documentation technique API

---

## 📝 Notes Importantes

### Migration localStorage → Firestore
**Problème**: Actuellement données dans localStorage (local navigateur).  
**Solution**: 
1. Script one-time pour exporter localStorage
2. Uploader dans Firestore sous compte coach existant
3. Garder localStorage en backup temporaire
4. Après validation, supprimer localStorage

### Gestion Multi-Équipes
**Si coach gère plusieurs équipes**:
- Dropdown switcher en haut de equipe.html
- Firestore query: `where('coachId', '==', currentCoachId)`
- Chaque équipe = entrée séparée collection teams

### Offline Mode (Optionnel Phase 2)
Firebase supporte mode hors-ligne natif:
```javascript
firebase.firestore().enablePersistence()
  .then(() => {
    console.log('Mode hors-ligne activé');
  });
```
Données synchronisées automatiquement quand reconnexion.

---

**FIN DES SPÉCIFICATIONS**

**Prêt à commencer l'implémentation ?** 🚀

Dis-moi si:
1. Tu valides ce plan global
2. Tu veux commencer par Firebase ou backend custom
3. Tu as des questions sur certaines parties

Je suis prêt à implémenter ! 💪
