# 🔐 SYSTÈME D'AUTHENTIFICATION - CLARIFICATION

## 📌 STRUCTURE DU SYSTÈME

### 1️⃣ **ADMIN (Vous - Youssef)**

#### 🔓 Version LOCALE (Sans authentification)
- **Fichier** : `admin-local.html`
- **Accès** : Ouvrir directement depuis le projet local
- **Chemin** : `C:\Users\ordi\Desktop\suivi-nageurs\admin-local.html`
- **🚫 NON déployé** sur le site web
- **Script** : `assets/js/admin-local.js`

**Comment ouvrir :**
```
Double-clic sur : admin-local.html
```

#### 🔒 Version EN LIGNE (Avec authentification)
- **Fichier** : `admin.html`
- **URL** : https://stoked-energy-477102-k5.web.app/admin.html
- **Accès** : Nécessite connexion (si configurée)
- **Script** : `assets/js/admin-dashboard.js`

---

### 2️⃣ **COACHES (Avec authentification)**

- **Dashboard** : `coach-dashboard.html`
- **URL** : https://stoked-energy-477102-k5.web.app/coach-dashboard.html
- **Accès** : Connexion obligatoire
- **Activation** : Via lien avec token (créé par admin)

**Workflow :**
1. Admin crée une invitation depuis `admin-local.html`
2. Coach reçoit le lien : `activation.html?token=xxxxx`
3. Coach définit son mot de passe
4. Coach se connecte sur `login.html`
5. Redirection automatique vers `coach-dashboard.html`

---

### 3️⃣ **NAGEURS (Avec authentification)**

- **Dashboard nageur** : `index.html` → `dashboard.html`
- **URL** : https://stoked-energy-477102-k5.web.app
- **Accès** : Connexion obligatoire
- **Création** : Par le coach depuis son dashboard

**Workflow :**
1. Coach crée un nageur depuis `coach-dashboard.html`
2. Système génère un mot de passe temporaire
3. Coach transmet le mot de passe au nageur
4. Nageur se connecte sur `login.html`
5. Accès à son dashboard

---

## 🚀 UTILISATION QUOTIDIENNE

### Pour VOUS (Admin) :

**Option 1 : Travailler en local (recommandé)**
```
1. Ouvrir : C:\Users\ordi\Desktop\suivi-nageurs\admin-local.html
2. Créer des coaches
3. Gérer les utilisateurs
4. Pas besoin de connexion !
```

**Option 2 : Depuis le web (si authentification configurée)**
```
1. Aller sur : https://stoked-energy-477102-k5.web.app/admin.html
2. Se connecter avec : youssef.yakachi@gmail.com / Maroc1997
3. (Nécessite que Firestore soit bien configuré)
```

### Pour les COACHES :

```
1. Recevoir le lien d'activation de l'admin
2. Ouvrir le lien et définir un mot de passe
3. Se connecter sur : https://stoked-energy-477102-k5.web.app/login.html
4. Créer et gérer ses nageurs
```

### Pour les NAGEURS :

```
1. Recevoir email et mot de passe du coach
2. Se connecter sur : https://stoked-energy-477102-k5.web.app/login.html
3. Accéder aux performances et à l'équipe
```

---

## 📂 FICHIERS IMPORTANTS

### Non déployés (local uniquement) :
- ✅ `admin-local.html` - Interface admin sans authentification
- ✅ `assets/js/admin-local.js` - Script admin local
- ✅ `*.md` - Documentation

### Déployés (accessible en ligne) :
- ✅ `admin.html` - Admin avec authentification (bloquée si pas connecté)
- ✅ `coach-dashboard.html` - Dashboard coaches
- ✅ `index.html` - Dashboard nageurs
- ✅ `login.html` - Page de connexion
- ✅ `activation.html` - Activation compte coach

---

## 🔧 CONFIGURATION FIREBASE

### Fichiers de configuration :
- `firebase.json` - Exclut les fichiers locaux du déploiement
- `firestore.rules` - Règles de sécurité Firestore
- `firebase-config.js` - Configuration Firebase

### Déploiement :
```bash
firebase deploy --only hosting
```

**Note** : Les fichiers `admin-local.html` et `admin-local.js` sont automatiquement exclus.

---

## 🎯 RÉSUMÉ

| Utilisateur | Fichier | Authentification | Accès |
|-------------|---------|------------------|-------|
| **Admin (Vous)** | `admin-local.html` | ❌ NON | 💻 Local uniquement |
| **Admin (Web)** | `admin.html` | ✅ OUI | 🌐 En ligne (si configuré) |
| **Coaches** | `coach-dashboard.html` | ✅ OUI | 🌐 En ligne |
| **Nageurs** | `index.html` / `dashboard.html` | ✅ OUI | 🌐 En ligne |

---

## ⚠️ IMPORTANT

- **NE JAMAIS** déployer `admin-local.html` sur le web
- **NE JAMAIS** partager le fichier `admin-local.html`
- Utiliser `admin-local.html` uniquement depuis votre ordinateur
- Les coaches et nageurs passent TOUJOURS par l'authentification

---

**Date de configuration :** 25 Novembre 2025
