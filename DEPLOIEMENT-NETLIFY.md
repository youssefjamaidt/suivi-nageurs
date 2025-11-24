# 🚀 Guide de Déploiement - Netlify + Firebase

## Vue d'ensemble

Ce guide vous aide à déployer l'application **Suivi Nageurs** sur **Netlify** (hébergement) avec **Firebase** (base de données cloud).

**Résultat final** : Application accessible sur `https://votre-site.netlify.app` avec synchronisation multi-appareils via Firebase.

---

## 📋 Prérequis

- ✅ Compte GitHub (pour connecter Netlify)
- ✅ Compte Google (pour Firebase)
- ✅ Compte Netlify gratuit : [netlify.com](https://netlify.com)

---

## PARTIE 1 : Configuration Firebase (Base de données)

### Étape 1.1 : Créer un projet Firebase

1. Allez sur **[console.firebase.google.com](https://console.firebase.google.com)**
2. Cliquez sur **"Ajouter un projet"**
3. Nom du projet : `suivi-nageurs-prod` (ou votre choix)
4. Désactivez Google Analytics (optionnel)
5. Cliquez sur **"Créer le projet"** (⏱️ ~30 secondes)

### Étape 1.2 : Activer Authentication

1. Menu gauche > **Authentication**
2. Cliquez sur **"Commencer"**
3. Onglet **"Sign-in method"**
4. Cliquez sur **"E-mail/Mot de passe"**
5. Activez les deux options :
   - ✅ E-mail/Mot de passe
   - ✅ Lien de connexion par e-mail (optionnel)
6. **Enregistrer**

### Étape 1.3 : Créer la base Firestore

1. Menu gauche > **Firestore Database**
2. Cliquez sur **"Créer une base de données"**
3. Mode : **"Démarrer en mode production"** (recommandé)
4. Région : **europe-west** (pour France/Europe)
5. Cliquez sur **"Activer"** (⏱️ ~1 minute)

### Étape 1.4 : Configurer les règles de sécurité

1. Dans Firestore Database > **Règles**
2. **Remplacez** tout le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ====================================
    // FONCTIONS HELPER
    // ====================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isCoach() {
      return isAuthenticated() && getUserData().role == 'coach';
    }
    
    function isSwimmer() {
      return isAuthenticated() && getUserData().role == 'nageur';
    }
    
    function isActive() {
      return isAuthenticated() && getUserData().status == 'active';
    }
    
    // ====================================
    // COLLECTION USERS
    // ====================================
    
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == userId ||
        isAdmin() ||
        (isCoach() && resource.data.coachId == request.auth.uid)
      );
      
      allow create: if isAdmin() || isCoach();
      
      allow update: if isAuthenticated() && (
        request.auth.uid == userId ||
        isAdmin() ||
        (isCoach() && resource.data.coachId == request.auth.uid)
      ) && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']));
      
      allow delete: if isAdmin();
    }
    
    // ====================================
    // COLLECTION TEAMS
    // ====================================
    
    match /teams/{teamId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.coachId == request.auth.uid ||
        request.auth.uid in resource.data.swimmers
      );
      
      allow create: if isCoach() && isActive();
      
      allow update: if isAuthenticated() && (
        isAdmin() ||
        resource.data.coachId == request.auth.uid
      );
      
      allow delete: if isAdmin() || 
        resource.data.coachId == request.auth.uid;
    }
    
    // ====================================
    // COLLECTION WELLBEING_DATA
    // ====================================
    
    match /wellbeing_data/{dataId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.swimmerId == request.auth.uid ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
      
      allow create: if isAuthenticated() && (
        request.resource.data.swimmerId == request.auth.uid ||
        (isCoach() && isActive())
      );
      
      allow update: if isAuthenticated() && (
        resource.data.swimmerId == request.auth.uid ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
      
      allow delete: if isAdmin() || 
        (isCoach() && resource.data.teamId in getUserData().teams);
    }
    
    // ====================================
    // AUTRES COLLECTIONS
    // ====================================
    
    match /{collection}/{dataId} {
      allow read: if collection in [
        'performance_data', 'medical_data', 'race_data', 
        'technical_data', 'attendance_data'
      ] && isAuthenticated() && (
        isAdmin() ||
        resource.data.swimmerId == request.auth.uid ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
      
      allow create: if collection in [
        'performance_data', 'medical_data', 'race_data', 
        'technical_data', 'attendance_data'
      ] && isAuthenticated() && (
        (isSwimmer() && request.resource.data.swimmerId == request.auth.uid) ||
        (isCoach() && isActive())
      );
      
      allow update, delete: if collection in [
        'performance_data', 'medical_data', 'race_data', 
        'technical_data', 'attendance_data'
      ] && isAuthenticated() && (
        isAdmin() ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
    }
  }
}
```

3. Cliquez sur **"Publier"**

### Étape 1.5 : Récupérer les clés Firebase

1. Cliquez sur **⚙️ Paramètres du projet** (en haut à gauche)
2. Descendez jusqu'à **"Vos applications"**
3. Cliquez sur l'icône **</> Web**
4. Nom : `Suivi Nageurs Web`
5. **NE PAS** cocher Firebase Hosting
6. Cliquez sur **"Enregistrer l'application"**
7. **COPIEZ** la configuration qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "suivi-nageurs-xxxxx.firebaseapp.com",
  projectId: "suivi-nageurs-xxxxx",
  storageBucket: "suivi-nageurs-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Étape 1.6 : Mettre à jour firebase-config.js

1. Ouvrez **`firebase-config.js`** dans votre projet
2. **Remplacez** les lignes 8-14 par vos vraies clés :

```javascript
const firebaseConfig = {
    apiKey: "VOTRE_VRAIE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet-id",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

3. **Enregistrez** le fichier

### Étape 1.7 : Créer le premier admin

**Dans Firebase Console :**

#### A) Créer compte Authentication :
1. **Authentication** > **Users** > **Add user**
2. Email : `admin@suivi-nageurs.com`
3. Mot de passe : `AdminSecure123!`
4. Cliquez sur **Add user**
5. **COPIEZ l'UID** (ex: `AbC123XyZ456...`)

#### B) Créer document Firestore :
1. **Firestore Database** > **Démarrer une collection**
2. ID de collection : `users`
3. **Premier document** :
   - ID du document : *collez l'UID copié*
   - Ajoutez ces champs :

| Champ       | Type      | Valeur                       |
|-------------|-----------|------------------------------|
| email       | string    | admin@suivi-nageurs.com      |
| firstName   | string    | Admin                        |
| lastName    | string    | Système                      |
| role        | string    | admin                        |
| status      | string    | active                       |
| club        | string    | Mon Club de Natation         |
| phone       | string    | 0600000000                   |
| createdAt   | timestamp | *cliquez sur l'horloge*      |
| lastLogin   | timestamp | *cliquez sur l'horloge*      |

4. **Enregistrer**

✅ **Firebase configuré !**

---

## PARTIE 2 : Déploiement sur Netlify

### Étape 2.1 : Pousser le code sur GitHub

**Dans PowerShell (votre dossier projet) :**

```powershell
# Ajouter tous les fichiers
git add .

# Committer avec firebase-config.js mis à jour
git commit -m "🔥 Configure Firebase for production deployment"

# Pousser sur GitHub
git push origin main
```

### Étape 2.2 : Créer un compte Netlify

1. Allez sur **[netlify.com](https://netlify.com)**
2. Cliquez sur **"Sign up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Netlify à accéder à votre compte GitHub

### Étape 2.3 : Importer le projet depuis GitHub

1. Sur Netlify Dashboard > **"Add new site"** > **"Import an existing project"**
2. Choisissez **"Deploy with GitHub"**
3. Autorisez Netlify (si demandé)
4. Cherchez et sélectionnez **`suivi-nageurs`**
5. Configuration du déploiement :
   - **Branch to deploy** : `main`
   - **Build command** : *(laissez vide)*
   - **Publish directory** : *(laissez vide ou mettez `/`)*
6. Cliquez sur **"Deploy site"** (⏱️ ~1 minute)

### Étape 2.4 : Vérifier le déploiement

1. Une fois terminé, Netlify vous donne une URL : `https://random-name-123456.netlify.app`
2. Cliquez dessus pour ouvrir votre site
3. Vous devriez voir la page d'accueil de l'application

### Étape 2.5 : Personnaliser le nom de domaine

1. Sur Netlify > **Site settings** > **Domain management**
2. Cliquez sur **"Options"** > **"Edit site name"**
3. Nom : `suivi-nageurs` (ou votre choix)
4. Votre site devient : `https://suivi-nageurs.netlify.app`

### Étape 2.6 : Configurer le domaine dans Firebase

1. Retournez sur **Firebase Console**
2. **Authentication** > **Settings** > **Authorized domains**
3. Cliquez sur **"Add domain"**
4. Ajoutez : `suivi-nageurs.netlify.app` (votre domaine Netlify)
5. **Enregistrer**

---

## 🎉 TEST FINAL

### Test 1 : Connexion admin

1. Allez sur `https://votre-site.netlify.app/login.html`
2. Connectez-vous :
   - Email : `admin@suivi-nageurs.com`
   - Mot de passe : `AdminSecure123!`
3. ✅ Vous devez être redirigé vers `admin.html`

### Test 2 : Inscription coach

1. Allez sur `/register.html`
2. Inscrivez-vous comme coach
3. ✅ Statut "En attente d'approbation"

### Test 3 : Approbation par admin

1. Connectez-vous en tant qu'admin
2. Approuvez le coach
3. ✅ Le coach peut maintenant se connecter

### Test 4 : Synchronisation multi-appareils

1. **Sur ordinateur** : Connectez-vous comme coach, créez une équipe
2. **Sur téléphone** : Connectez-vous avec le même compte
3. ✅ Vous voyez la même équipe immédiatement

---

## 🔄 Mises à jour futures

Pour mettre à jour l'application :

```powershell
# Modifier vos fichiers localement
# Puis :

git add .
git commit -m "Votre message de mise à jour"
git push origin main
```

**Netlify redéploie automatiquement** en ~30 secondes ! 🚀

---

## 📊 Statistiques d'utilisation

- **Netlify gratuit** : 100 GB bande passante/mois, 300 minutes build/mois
- **Firebase Spark (gratuit)** :
  - 1 GB stockage Firestore
  - 10 GB transfert réseau/mois
  - 50K lectures/jour
  - 20K écritures/jour

*Largement suffisant pour 50-100 nageurs !*

---

## 🆘 Dépannage

### Erreur "Firebase not defined"
- Vérifiez que `firebase-config.js` contient vos vraies clés
- Vérifiez que les scripts Firebase sont chargés dans HTML

### Erreur "Permission denied"
- Vérifiez que les règles Firestore sont bien déployées
- Vérifiez que l'utilisateur a le bon rôle dans Firestore

### Site ne se met pas à jour
- Attendez 1-2 minutes après le push GitHub
- Videz le cache du navigateur (Ctrl + Shift + R)
- Sur Netlify : **Deploys** > **Trigger deploy** > **Clear cache and deploy site**

### Domaine non autorisé
- Firebase Console > Authentication > Settings > Authorized domains
- Ajoutez votre domaine Netlify

---

## 📞 Support

Pour plus d'aide, consultez :
- `GUIDE-TESTS.md` - Tests complets
- `GUIDE-DEPANNAGE.md` - 50+ solutions
- `README-FIREBASE.md` - Documentation complète

---

**🎊 Félicitations !** Votre application est déployée et synchronisée sur tous les appareils !
