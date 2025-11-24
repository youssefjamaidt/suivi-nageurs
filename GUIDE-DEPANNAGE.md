# 🔧 GUIDE DE DÉPANNAGE

## Vue d'ensemble

Ce guide aide à résoudre les problèmes courants de l'application Suivi Nageurs.

---

## 🚨 Problèmes d'Authentification

### 1. "Email already exists"

**Symptôme:** Erreur lors de l'inscription ou génération compte nageur

**Causes possibles:**
- Email déjà utilisé dans Firebase Authentication
- Compte créé précédemment mais supprimé de Firestore

**Solutions:**

**Solution A: Supprimer de Firebase Auth**
```
1. Firebase Console → Authentication → Users
2. Rechercher l'email
3. Cliquer sur les 3 points → Delete user
4. Réessayer l'inscription
```

**Solution B: Utiliser un autre email**
```
Pour nageur: Modifier prénom/nom ou ajouter suffixe
Exemple: thomas.martin2@club.swim
```

---

### 2. "Weak password" / "Password should be at least 6 characters"

**Symptôme:** Erreur lors de l'inscription

**Cause:** Mot de passe trop court ou trop simple

**Solution:**
```
Minimum requis:
- 8 caractères minimum (recommandé dans l'interface)
- Au moins 1 majuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (!@#$%^&*)

Exemple: Test1234!
```

---

### 3. "User not found" / "Wrong password"

**Symptôme:** Erreur à la connexion

**Causes possibles:**
- Email ou mot de passe incorrect
- Compte pas encore créé
- Compte supprimé

**Solutions:**

**Vérifier identifiants:**
```
1. Vérifier majuscules/minuscules
2. Vérifier espaces avant/après
3. Essayer "Mot de passe oublié"
```

**Vérifier dans Firebase:**
```
Firebase Console → Authentication → Users
→ Rechercher l'email
→ Si absent: compte n'existe pas
```

---

### 4. "Your account is pending approval"

**Symptôme:** Message lors de la connexion coach

**Cause:** Status = "pending" (normal après inscription)

**Solution:**
```
1. Attendre qu'un admin approuve (admin.html)
2. Ou approuver manuellement dans Firestore:
   
   Firebase Console → Firestore → users → [UID]
   Modifier: status: "pending" → "active"
```

---

### 5. Redirection infinie / Boucle de connexion

**Symptôme:** Page recharge continuellement après connexion

**Causes possibles:**
- Role incorrect dans Firestore
- Status incorrect
- Erreur JavaScript

**Solutions:**

**Vérifier données Firestore:**
```javascript
// Document users/[UID] doit avoir:
{
  role: "coach" | "admin" | "nageur",
  status: "active",
  email: "...",
  firstName: "...",
  lastName: "..."
}
```

**Vérifier console navigateur:**
```
F12 → Console → Lire l'erreur
Souvent: "Cannot read property 'role' of undefined"
→ Document Firestore manquant ou mal formaté
```

**Nettoyer le cache:**
```
1. Ctrl+Shift+Delete (Chrome)
2. Cocher "Cookies" et "Cache"
3. Vider
4. Réessayer
```

---

## 🗄️ Problèmes Firestore

### 1. "Missing or insufficient permissions"

**Symptôme:** Erreur lors de lecture/écriture Firestore

**Causes possibles:**
- Règles de sécurité pas déployées
- Règles trop restrictives
- Utilisateur non authentifié

**Solutions:**

**Déployer les règles:**
```
1. Firebase Console → Firestore Database → Rules
2. Copier le contenu depuis FIRESTORE-STRUCTURE.md
3. Cliquer "Publish"
4. Attendre 30 secondes
5. Réessayer
```

**Vérifier authentification:**
```javascript
// Console navigateur (F12)
firebase.auth().onAuthStateChanged(user => {
  console.log('User:', user);
  // Si null → pas authentifié
});
```

**Mode test (temporaire):**
```javascript
// UNIQUEMENT POUR TESTS - NE PAS UTILISER EN PRODUCTION
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### 2. "The query requires an index"

**Symptôme:** Erreur avec lien vers console Firebase

**Cause:** Index composite manquant (normal)

**Solution:**
```
1. L'erreur contient un lien direct
2. Cliquer sur le lien
3. Firebase ouvre l'écran de création d'index
4. Cliquer "Create index"
5. Attendre 1-5 minutes (création automatique)
6. Réessayer la requête

Exemple d'erreur:
"The query requires an index. You can create it here:
https://console.firebase.google.com/..."
```

**Créer manuellement:**
```
Firebase Console → Firestore → Indexes
→ Composite → Add Index

Exemple pour wellbeing_data:
Collection: wellbeing_data
Fields: 
  - swimmerId (Ascending)
  - date (Descending)
Query scope: Collection
```

---

### 3. Données ne s'affichent pas / Dashboard vide

**Symptôme:** Interface vide alors que données existent

**Causes possibles:**
- Requêtes Firestore retournent vide
- Erreur dans le code de chargement
- IDs incorrects (swimmerId, teamId)

**Solutions:**

**Vérifier dans Console Firestore:**
```
1. Firebase Console → Firestore
2. Ouvrir la collection concernée (wellbeing_data, etc.)
3. Vérifier que les documents existent
4. Vérifier les champs:
   - swimmerId correspond à l'UID Firebase Auth?
   - teamId existe?
   - date au bon format? (YYYY-MM-DD)
```

**Tester requête manuellement:**
```javascript
// Console navigateur (F12)
const userId = firebase.auth().currentUser.uid;

db.collection('wellbeing_data')
  .where('swimmerId', '==', userId)
  .get()
  .then(snap => {
    console.log('Documents trouvés:', snap.size);
    snap.forEach(doc => console.log(doc.data()));
  })
  .catch(err => console.error('Erreur:', err));
```

**Vérifier console navigateur:**
```
F12 → Console → Rechercher erreurs en rouge
Erreurs courantes:
- "Cannot read property 'map' of undefined"
  → Données pas chargées
- "NetworkError"
  → Connexion Internet
```

---

### 4. "Document already exists" lors création

**Symptôme:** Erreur lors de création équipe/nageur

**Cause:** Tentative de créer avec un ID qui existe déjà

**Solution:**
```javascript
// Utiliser .add() au lieu de .doc(id).set()

// ❌ MAUVAIS
db.collection('teams').doc('team1').set({...})

// ✅ BON (ID auto-généré)
db.collection('teams').add({...})
```

---

## 🔄 Problèmes Synchronisation Temps Réel

### 1. Données ne se mettent pas à jour automatiquement

**Symptôme:** Coach/nageur doit rafraîchir manuellement

**Causes possibles:**
- Listeners pas configurés
- Erreur dans onSnapshot
- Connexion Internet instable

**Solutions:**

**Vérifier listeners:**
```javascript
// Dans equipe-firestore.js, vérifier fonction:
function setupRealtimeListeners() {
  const listener = db.collection('wellbeing_data')
    .onSnapshot(snapshot => {
      console.log('Changement détecté!', snapshot.size);
      // Code de mise à jour...
    });
}
```

**Forcer rafraîchissement:**
```javascript
// Bouton temporaire pour tests
<button onclick="loadTeamData()">Rafraîchir</button>
```

**Vérifier connexion:**
```javascript
// Console navigateur
db.enableNetwork()
  .then(() => console.log('Network enabled'))
  .catch(err => console.error('Network error:', err));
```

---

### 2. Délai de synchronisation > 5 secondes

**Symptôme:** Changements visibles mais lentement

**Causes possibles:**
- Connexion Internet lente
- Trop de listeners actifs
- Documents trop volumineux

**Solutions:**

**Optimiser requêtes:**
```javascript
// Limiter le nombre de documents
db.collection('wellbeing_data')
  .where('swimmerId', '==', userId)
  .orderBy('date', 'desc')
  .limit(10) // Au lieu de tout charger
  .onSnapshot(...)
```

**Désactiver listeners inutiles:**
```javascript
// Stocker listeners
const listeners = [];
listeners.push(db.collection(...).onSnapshot(...));

// Nettoyer au changement de page
window.addEventListener('beforeunload', () => {
  listeners.forEach(listener => listener());
});
```

---

## 📝 Problèmes Saisie Bien-être

### 1. Score calculé = "NaN"

**Symptôme:** Score affiché comme "NaN" au lieu d'un nombre

**Causes possibles:**
- Champs non remplis
- Valeurs non numériques
- Erreur calcul

**Solutions:**

**Vérifier valeurs:**
```javascript
// Dans la fonction calculateWellbeingScore
function calculateWellbeingScore(data) {
  console.log('Data:', data); // Debug
  
  const { sleepQuality, energyLevel, motivation, stressLevel, muscleRecovery } = data;
  
  // Vérifier que toutes les valeurs existent
  if (!sleepQuality || !energyLevel || !motivation || !stressLevel || !muscleRecovery) {
    console.error('Champs manquants');
    return 0;
  }
  
  const score = ((sleepQuality + energyLevel + motivation + (11 - stressLevel) + muscleRecovery) / 5).toFixed(1);
  return parseFloat(score);
}
```

**Valeurs par défaut:**
```javascript
// Au chargement du formulaire
document.getElementById('sleepQuality').value = 7;
document.getElementById('energyLevel').value = 7;
// etc.
```

---

### 2. Formulaire ne se soumet pas

**Symptôme:** Clic "Enregistrer" ne fait rien

**Causes possibles:**
- Event listener pas attaché
- Erreur JavaScript
- Validation échoue

**Solutions:**

**Vérifier event listener:**
```javascript
// Dans nageur-dashboard.js
document.getElementById('wellbeingForm').addEventListener('submit', saveWellbeingData);

// Ou dans le HTML
<form id="wellbeingForm" onsubmit="saveWellbeingData(event); return false;">
```

**Vérifier console:**
```
F12 → Console → Cliquer "Enregistrer"
→ Lire l'erreur affichée
```

**Désactiver validation temporairement:**
```javascript
async function saveWellbeingData(event) {
  event.preventDefault();
  console.log('Fonction appelée!'); // Debug
  
  // ... reste du code
}
```

---

### 3. Modal ne s'ouvre pas

**Symptôme:** Clic "Saisir Bien-être" ne fait rien

**Causes possibles:**
- ID modal incorrect
- CSS display:none permanent
- Erreur JavaScript

**Solutions:**

**Vérifier ID:**
```javascript
// Dans nageur-dashboard.js
function openWellbeingEntry() {
  const panel = document.getElementById('dataEntryPanel');
  console.log('Panel:', panel); // Si null → ID incorrect
  
  if (panel) {
    panel.classList.add('open');
  }
}
```

**Forcer l'affichage:**
```javascript
// Temporaire pour debug
function openWellbeingEntry() {
  const panel = document.getElementById('dataEntryPanel');
  panel.style.display = 'block';
  panel.style.right = '0px';
}
```

---

## 👥 Problèmes Génération Compte Nageur

### 1. Email généré incorrect

**Symptôme:** Email format bizarre ou erreur

**Causes possibles:**
- Caractères spéciaux dans prénom/nom
- Club non défini
- Accents non gérés

**Solutions:**

**Normaliser fonction:**
```javascript
function generateSwimmerEmail(swimmer) {
  const firstName = swimmer.firstName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlever accents
    .replace(/[^a-z]/g, ''); // Garder que lettres
    
  const lastName = swimmer.lastName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, '');
    
  const club = currentCoach.club?.toLowerCase()
    .replace(/\s+/g, '') // Enlever espaces
    .replace(/[^a-z0-9]/g, '') || 'club';
    
  return `${firstName}.${lastName}@${club}.swim`;
}

// Exemple: "Jean-François Müller" → "jeanfrancois.muller@cnparis.swim"
```

---

### 2. Modal identifiants ne s'affiche pas

**Symptôme:** Compte créé mais pas de modal

**Cause:** Erreur dans showCredentialsModal

**Solution:**
```javascript
function showCredentialsModal(email, password, swimmer) {
  console.log('Modal appelée:', email, password); // Debug
  
  const modal = document.createElement('div');
  modal.id = 'credentialsModal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.background = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '10000';
  
  modal.innerHTML = `...`; // HTML du modal
  
  document.body.appendChild(modal);
  console.log('Modal ajoutée au DOM');
}
```

---

## 🎨 Problèmes Interface

### 1. Page blanche / Rien ne s'affiche

**Symptôme:** Page complètement vide

**Causes possibles:**
- Erreur JavaScript critique
- Firebase pas initialisé
- Fichier JS manquant

**Solutions:**

**Vérifier console (PRIORITÉ):**
```
F12 → Console
→ Lire TOUTES les erreurs en rouge
```

**Erreurs courantes:**

```javascript
// "firebase is not defined"
→ Ajouter scripts Firebase avant firebase-config.js

// "auth is not defined"  
→ Vérifier que firebase-config.js est chargé

// "Cannot read property 'uid' of null"
→ Utilisateur pas authentifié

// "Failed to load resource: net::ERR_FILE_NOT_FOUND"
→ Chemin fichier incorrect (assets/js/...)
```

**Vérifier fichiers chargés:**
```
F12 → Network → Rafraîchir (F5)
→ Vérifier que tous les JS sont en status 200
→ Si 404: fichier manquant ou chemin incorrect
```

---

### 2. Styles CSS cassés

**Symptôme:** Interface moche, pas de couleurs

**Causes possibles:**
- Fichier CSS manquant
- Chemin CSS incorrect
- Cache navigateur

**Solutions:**

**Vérifier chargement CSS:**
```html
<!-- Dans le <head> de la page -->
<link rel="stylesheet" href="assets/css/style.css">

<!-- Vérifier F12 → Network → Filtrer "CSS" -->
```

**Nettoyer cache:**
```
Ctrl+F5 (hard refresh)
Ou Ctrl+Shift+Delete → Vider cache
```

**CSS inline temporaire:**
```html
<style>
  body { background: white; padding: 20px; }
  .card { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
</style>
```

---

### 3. Graphiques ne s'affichent pas

**Symptôme:** Espace vide où devrait être le graphique

**Causes possibles:**
- Chart.js pas chargé
- Canvas absent
- Données vides

**Solutions:**

**Vérifier Chart.js:**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Console (F12) -->
<script>
  console.log('Chart.js:', typeof Chart);
  // Si "undefined" → pas chargé
</script>
```

**Vérifier données:**
```javascript
function displayChart(data) {
  console.log('Data pour graphique:', data);
  
  if (!data || data.length === 0) {
    console.warn('Pas de données pour le graphique');
    return;
  }
  
  // ... créer le graphique
}
```

---

## 🌐 Problèmes Réseau

### 1. "NetworkError" / "Failed to fetch"

**Symptôme:** Erreurs réseau intermittentes

**Causes possibles:**
- Connexion Internet instable
- Firewall bloque Firebase
- Serveur Firebase down (rare)

**Solutions:**

**Vérifier connexion:**
```javascript
// Console navigateur
fetch('https://firestore.googleapis.com')
  .then(res => console.log('Connexion OK:', res.status))
  .catch(err => console.error('Connexion KO:', err));
```

**Mode offline Firestore:**
```javascript
// Dans firebase-config.js
db.enablePersistence()
  .catch(err => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.warn('Browser doesn\'t support offline');
    }
  });
```

**Retry automatique:**
```javascript
async function fetchWithRetry(fn, retries = 3) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry... (${retries} left)`);
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(fn, retries - 1);
    }
    throw error;
  }
}
```

---

## 📱 Problèmes Mobile

### 1. Interface trop petite sur mobile

**Symptôme:** Textes illisibles, boutons minuscules

**Solutions:**

**Vérifier viewport:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**CSS responsive:**
```css
/* Dans style.css */
@media (max-width: 768px) {
  body { font-size: 16px; }
  .btn { padding: 15px; font-size: 16px; }
  input { font-size: 16px; min-height: 44px; }
}
```

---

### 2. Boutons pas cliquables sur tactile

**Symptôme:** Fonctionne sur desktop, pas sur mobile

**Solutions:**

**Augmenter zone tactile:**
```css
.btn {
  min-height: 44px; /* Minimum Apple recommandé */
  min-width: 44px;
  padding: 12px 24px;
}
```

**Utiliser touch events:**
```javascript
// Au lieu de onclick
element.addEventListener('touchstart', handleTouch);
element.addEventListener('click', handleClick);
```

---

## 🔍 Diagnostic Général

### Checklist Diagnostic

Quand quelque chose ne marche pas:

1. **Console navigateur (F12 → Console)**
   - Lire TOUTES les erreurs rouges
   - Noter l'erreur exacte

2. **Network (F12 → Network)**
   - Vérifier status des requêtes
   - 404 = fichier manquant
   - 403 = permission denied
   - 500 = erreur serveur

3. **Firebase Console**
   - Authentication → Users (compte existe?)
   - Firestore → Collections (données présentes?)
   - Rules → Vérifier règles déployées

4. **Données Firestore**
   - Vérifier structure documents
   - Vérifier IDs corrects
   - Vérifier types de données (string, number, timestamp)

5. **Code source**
   - Vérifier chemins fichiers (assets/js/...)
   - Vérifier IDs HTML (getElementById)
   - Vérifier fonctions appelées existent

---

## 📞 Support Supplémentaire

Si le problème persiste:

1. **Consulter documentation:**
   - `FIRESTORE-STRUCTURE.md` - Structure et règles
   - `GUIDE-CONFIGURATION-FIREBASE.md` - Configuration
   - `GUIDE-TESTS.md` - Scénarios de tests
   - `DEMARRAGE-RAPIDE.md` - Guide rapide

2. **Informations à collecter:**
   - Message d'erreur exact (copier-coller)
   - Console navigateur (screenshot)
   - Étapes pour reproduire
   - Navigateur et version
   - Rôle utilisateur (admin/coach/nageur)

3. **Firebase Status:**
   - Vérifier: https://status.firebase.google.com
   - Vérifier si Firebase a des problèmes

---

**La plupart des problèmes sont résolus en vérifiant la console navigateur (F12) !** 🔍
