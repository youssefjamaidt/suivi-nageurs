# 🔥 GUIDE DE CONFIGURATION FIREBASE

## 📋 Vue d'Ensemble

Ce guide vous explique comment configurer Firebase pour le système d'authentification de Suivi Nageurs.

**Durée estimée :** 15-20 minutes  
**Prérequis :** Compte Google

---

## 🚀 ÉTAPE 1 : Créer un Projet Firebase

### 1.1 Accéder à Firebase Console

1. Aller sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Cliquer sur **"Ajouter un projet"** (ou "Create a project")

### 1.2 Configuration du Projet

**Écran 1 - Nom du projet :**
```
Nom du projet : suivi-nageurs
ID du projet : suivi-nageurs-xxxx (généré automatiquement)
```
→ Cliquer "Continuer"

**Écran 2 - Google Analytics :**
```
☑ Activer Google Analytics (recommandé)
```
→ Cliquer "Continuer"

**Écran 3 - Compte Analytics :**
```
Sélectionner : "Default Account for Firebase"
```
→ Cliquer "Créer le projet"

⏱️ **Attendre 30-60 secondes** que le projet soit créé.

→ Cliquer "Continuer" quand c'est prêt.

---

## 🌐 ÉTAPE 2 : Ajouter une Application Web

### 2.1 Enregistrer l'Application

1. Sur la page d'accueil du projet, cliquer sur **l'icône Web** `</>`
2. Remplir le formulaire :

```
Surnom de l'application : Suivi Nageurs Web
☑ Configurer Firebase Hosting (optionnel)
```

3. Cliquer **"Enregistrer l'application"**

### 2.2 Copier la Configuration Firebase

Firebase affiche un code de configuration. **COPIER CES VALEURS** :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "suivi-nageurs-xxxx.firebaseapp.com",
  projectId: "suivi-nageurs-xxxx",
  storageBucket: "suivi-nageurs-xxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

### 2.3 Mettre à Jour firebase-config.js

Ouvrir le fichier **`firebase-config.js`** et **remplacer** les valeurs :

```javascript
// AVANT (valeurs par défaut)
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
    // ...
};

// APRÈS (vos vraies valeurs)
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "suivi-nageurs-xxxx.firebaseapp.com",
    projectId: "suivi-nageurs-xxxx",
    storageBucket: "suivi-nageurs-xxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

**💾 SAUVEGARDER** le fichier.

---

## 🔐 ÉTAPE 3 : Activer Firebase Authentication

### 3.1 Accéder à Authentication

Dans le menu de gauche :
```
Authentication → Get started
```

### 3.2 Activer Email/Password

1. Aller dans l'onglet **"Sign-in method"**
2. Cliquer sur **"Email/Password"**
3. Activer les deux options :
   - ☑️ **Email/Password** (Enable)
   - ☐ **Email link (passwordless sign-in)** (Désactiver pour l'instant)
4. Cliquer **"Save"**

### 3.3 Configurer Templates Email (Optionnel)

Aller dans l'onglet **"Templates"** :

**Template "Password reset" (Réinitialisation) :**
```
Sujet : Réinitialisation de votre mot de passe - Suivi Nageurs
Corps :
Bonjour,

Vous avez demandé à réinitialiser votre mot de passe pour Suivi Nageurs.

Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
%LINK%

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Ce lien expire dans 1 heure.

---
L'équipe Suivi Nageurs
```

**Template "Email address verification" (Vérification) :**
```
Sujet : Vérifiez votre adresse email - Suivi Nageurs
Corps :
Bonjour,

Merci de vous être inscrit sur Suivi Nageurs !

Cliquez sur le lien ci-dessous pour vérifier votre adresse email :
%LINK%

---
L'équipe Suivi Nageurs
```

→ Cliquer **"Save"** sur chaque template.

---

## 🗄️ ÉTAPE 4 : Créer Firestore Database

### 4.1 Créer la Base de Données

Dans le menu de gauche :
```
Firestore Database → Create database
```

**Écran 1 - Mode de sécurité :**
```
○ Production mode (recommandé)
```
→ Cliquer "Next"

**Écran 2 - Région :**
```
Sélectionner : europe-west1 (Belgique) ou europe-west3 (Frankfurt)
```
→ Cliquer "Enable"

⏱️ **Attendre 1-2 minutes** que Firestore soit créé.

### 4.2 Configurer les Règles de Sécurité

Aller dans l'onglet **"Rules"** et **remplacer** par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonction helper pour vérifier l'authentification
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Fonction helper pour obtenir les données utilisateur
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Fonction helper pour vérifier le rôle
    function hasRole(role) {
      return isSignedIn() && getUserData().role == role;
    }
    
    // Collection USERS
    match /users/{userId} {
      // Lecture : admin peut tout voir, autres seulement leur profil
      allow read: if isSignedIn() && 
                     (hasRole('admin') || request.auth.uid == userId);
      
      // Création : seulement lors de l'inscription (pas de userId existant)
      allow create: if request.auth.uid == userId;
      
      // Mise à jour : admin ou soi-même, mais ne peut pas changer son rôle
      allow update: if isSignedIn() && 
                       (hasRole('admin') || 
                        (request.auth.uid == userId && 
                         request.resource.data.role == resource.data.role));
      
      // Suppression : seulement admin
      allow delete: if hasRole('admin');
    }
    
    // Collection TEAMS
    match /teams/{teamId} {
      // Lecture : admin, coach propriétaire, ou nageurs de l'équipe
      allow read: if isSignedIn() && 
                     (hasRole('admin') || 
                      resource.data.coachId == request.auth.uid ||
                      request.auth.uid in resource.data.swimmers);
      
      // Création : admin ou coach
      allow create: if isSignedIn() && 
                       (hasRole('admin') || hasRole('coach'));
      
      // Mise à jour : admin ou coach propriétaire
      allow update: if isSignedIn() && 
                       (hasRole('admin') || 
                        resource.data.coachId == request.auth.uid);
      
      // Suppression : admin ou coach propriétaire
      allow delete: if isSignedIn() && 
                       (hasRole('admin') || 
                        resource.data.coachId == request.auth.uid);
    }
    
    // Collections DONNÉES (wellbeing_data, performance_data, etc.)
    match /{dataCollection}/{dataId} {
      // Seulement pour les collections de données
      allow read, write: if dataCollection.matches('.*_data$') && 
                            isSignedIn() && 
                            (hasRole('admin') || 
                             hasRole('coach') || 
                             (hasRole('nageur') && 
                              resource.data.swimmerId == request.auth.uid));
    }
    
    // Collection REGISTRATION_REQUESTS (demandes inscription)
    match /registration_requests/{requestId} {
      // Lecture : seulement admin
      allow read: if hasRole('admin');
      
      // Création : tout le monde (pour inscription)
      allow create: if true;
      
      // Mise à jour et suppression : seulement admin
      allow update, delete: if hasRole('admin');
    }
    
    // Bloquer tout le reste par défaut
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

→ Cliquer **"Publish"**

### 4.3 Créer les Collections Initiales

Aller dans l'onglet **"Data"** et créer ces collections (vides pour l'instant) :

1. **users** (se créera automatiquement à la première inscription)
2. **teams** (se créera automatiquement)
3. **wellbeing_data** (se créera automatiquement)
4. **performance_data** (se créera automatiquement)
5. **registration_requests** (se créera automatiquement)

**Note :** Pas besoin de créer manuellement, elles se créeront lors de la première utilisation.

---

## 👤 ÉTAPE 5 : Créer le Premier Utilisateur Admin

### 5.1 Créer l'Utilisateur dans Authentication

1. Aller dans **Authentication → Users**
2. Cliquer **"Add user"**
3. Remplir :
   ```
   Email : admin@suivi-nageurs.com
   Password : AdminSecure123!
   ```
4. Cliquer **"Add user"**

### 5.2 Ajouter les Données dans Firestore

1. Aller dans **Firestore Database → Data**
2. Cliquer **"Start collection"**
3. Collection ID : `users`
4. **Document ID** : **Copier l'UID** de l'utilisateur créé à l'étape 5.1
   - Retourner dans Authentication → Users
   - Cliquer sur admin@suivi-nageurs.com
   - Copier le **"User UID"** (exemple : `aB1cD2eF3gH4iJ5kL6mN7oP8`)
5. Ajouter les champs :

```
Field              Type      Value
--------------------------------------
email              string    admin@suivi-nageurs.com
firstName          string    Admin
lastName           string    Système
role               string    admin
status             string    active
club               string    Administration
phone              string    
createdAt          timestamp [Cliquer "Set to current time"]
lastLogin          timestamp null
teams              array     [] (vide)
```

6. Cliquer **"Save"**

**✅ TERMINÉ !** Vous pouvez maintenant vous connecter avec admin@suivi-nageurs.com / AdminSecure123!

---

## 🧪 ÉTAPE 6 : Tester l'Application

### 6.1 Lancer le Serveur Local

```powershell
# Dans le terminal
cd C:\Users\ordi\Desktop\suivi-nageurs
python -m http.server 8000
```

### 6.2 Tester la Connexion

1. Ouvrir **http://localhost:8000/login.html**
2. Se connecter avec :
   ```
   Email : admin@suivi-nageurs.com
   Mot de passe : AdminSecure123!
   ```
3. Vérifier la redirection vers `admin.html` (à créer prochainement)

### 6.3 Tester l'Inscription

1. Ouvrir **http://localhost:8000/register.html**
2. Créer un compte coach test :
   ```
   Prénom : Jean
   Nom : Dupont
   Email : jean.dupont@example.com
   Club : Club Test
   Mot de passe : Test1234!
   ```
3. Vérifier dans **Firestore → users** que l'utilisateur est créé avec `status: "pending"`

### 6.4 Tester Mot de Passe Oublié

1. Ouvrir **http://localhost:8000/forgot-password.html**
2. Entrer un email existant
3. Vérifier dans la console Firebase : **Authentication → Templates → History** (l'email est envoyé)

---

## 📧 ÉTAPE 7 : Configurer l'Envoi d'Emails (Important)

### 7.1 Vérifier l'Email d'Envoi

Par défaut, Firebase utilise : `noreply@suivi-nageurs-xxxx.firebaseapp.com`

Pour personnaliser :

1. Aller dans **Authentication → Settings**
2. Section **"Authorized domains"**
3. Ajouter votre domaine personnalisé si vous en avez un

### 7.2 Test d'Envoi d'Email

1. Créer un compte avec votre vraie adresse email
2. Demander une réinitialisation de mot de passe
3. Vérifier que vous recevez l'email

**⚠️ IMPORTANT :** Les emails peuvent arriver dans les **SPAMS** lors des tests.

---

## 🔒 ÉTAPE 8 : Sécuriser le Projet

### 8.1 Configurer les Domaines Autorisés

Dans **Authentication → Settings → Authorized domains** :

Autoriser :
- ✅ `localhost` (pour développement)
- ✅ `votre-domaine.com` (pour production)
- ❌ Supprimer les domaines inutilisés

### 8.2 Limiter les Quotas (Optionnel)

Dans **Project Settings → Usage and billing** :

Configurer des alertes de budget si vous passez au plan payant.

---

## 📊 RÉSUMÉ - Checklist Finale

✅ **Projet Firebase créé**  
✅ **Application Web enregistrée**  
✅ **firebase-config.js mis à jour avec vos clés**  
✅ **Authentication activée (Email/Password)**  
✅ **Firestore Database créée**  
✅ **Règles de sécurité configurées**  
✅ **Premier utilisateur admin créé**  
✅ **Tests de connexion réussis**  
✅ **Envoi d'emails fonctionnel**

---

## 🆘 DÉPANNAGE

### Problème 1 : Erreur "Firebase: Firebase App named '[DEFAULT]' already exists"

**Solution :** Rafraîchir la page, Firebase est déjà initialisé.

---

### Problème 2 : Erreur "Missing or insufficient permissions"

**Solution :** Vérifier que les règles Firestore sont bien publiées (Étape 4.2).

---

### Problème 3 : L'email de réinitialisation n'arrive pas

**Solutions :**
1. Vérifier les **spams**
2. Vérifier **Authentication → Templates → History** pour voir si l'email est parti
3. Attendre 5-10 minutes (parfois délai)
4. Vérifier que l'email existe dans **Authentication → Users**

---

### Problème 4 : "Configuration object is invalid"

**Solution :** Vérifier que toutes les valeurs dans `firebase-config.js` sont correctes (pas de fautes de frappe).

---

## 🎯 PROCHAINES ÉTAPES

Une fois Firebase configuré :

1. ✅ **Pages d'authentification créées** (login, register, forgot-password)
2. ⏭️ **À FAIRE :** Créer interface admin (admin.html)
3. ⏭️ **À FAIRE :** Créer interface nageur (nageur.html)
4. ⏭️ **À FAIRE :** Adapter interface coach (equipe.html)
5. ⏭️ **À FAIRE :** Migration localStorage → Firestore
6. ⏭️ **À FAIRE :** Synchronisation temps réel

---

## 📞 SUPPORT

**Documentation Firebase :**
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

**Problème technique ?**
Vérifier la console du navigateur (F12) pour les erreurs détaillées.

---

**🎉 Configuration terminée ! Vous êtes prêt à utiliser Firebase ! 🎉**
