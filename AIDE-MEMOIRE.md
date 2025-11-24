# 📝 AIDE-MÉMOIRE DÉPLOIEMENT

## 🔑 Informations Firebase à copier

### Configuration Firebase (à coller dans firebase-config.js)
```javascript
const firebaseConfig = {
    apiKey: "_____________________",
    authDomain: "_____________________",
    projectId: "_____________________",
    storageBucket: "_____________________",
    messagingSenderId: "_____________________",
    appId: "_____________________"
};
```

**Où trouver ?** Firebase Console > ⚙️ Paramètres > Applications Web

---

## 👤 Compte Admin à créer

### Authentication
- **Email** : `admin@votre-club.com`
- **Mot de passe** : `Admin2024!`
- **UID** : `_____________________` ← COPIER !

### Firestore (collection: users)
- **Document ID** : ← Coller l'UID
- **Champs** :
  - email: `admin@votre-club.com`
  - firstName: `Admin`
  - lastName: `Système`
  - role: `admin`
  - status: `active`
  - club: `Mon Club`
  - phone: `0600000000`
  - createdAt: *timestamp*
  - lastLogin: *timestamp*

---

## 🌐 Netlify

### URL du site
`https://_____________________.netlify.app`

**À ajouter dans :** Firebase Console > Authentication > Settings > Authorized domains

---

## ✅ Tests de connexion

### Admin
- URL : `https://votre-site.netlify.app/login.html`
- Email : `admin@votre-club.com`
- Mot de passe : `Admin2024!`
- ✅ Redirection vers : `admin.html`

### Coach (après inscription et approbation)
- Email : `coach@test.com` (exemple)
- ✅ Redirection vers : `index.html`

### Nageur (après génération par coach)
- Email : `prenom.nom@votre-club.swim`
- Mot de passe : *10 caractères aléatoires*
- ✅ Redirection vers : `nageur.html`

---

## 🆘 Commandes utiles

```powershell
# Serveur local pour tester
python -m http.server 8000

# Commit et push
git add .
git commit -m "🔥 Configure Firebase"
git push origin main

# Déploiement automatique Netlify
.\deploy-netlify.ps1
```

---

## 📞 Support

- **Guide complet** : `DEMARRAGE-MAINTENANT.md`
- **Déploiement Netlify** : `DEPLOIEMENT-NETLIFY.md`
- **Tests** : `GUIDE-TESTS.md`
- **Dépannage** : `GUIDE-DEPANNAGE.md`

---

**Date de déploiement** : _____________________
**Déployé par** : _____________________
**Statut** : ⬜ En cours  ⬜ Terminé
