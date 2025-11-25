# 🚀 DÉMARRAGE RAPIDE - APPLICATION SUIVI NAGEURS

**Date de déploiement :** 25 Novembre 2025  
**Application :** https://stoked-energy-477102-k5.web.app

---

## 🔑 IDENTIFIANTS ADMIN (UNIQUE)

```
📧 Email : youssef.yakachi@gmail.com
🔐 Mot de passe : Maroc1997
👤 Rôle : Administrateur (Propriétaire)
```

⚠️ **IMPORTANT** : C'est le SEUL compte admin autorisé. Ne partagez jamais ces identifiants.

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### 1️⃣ Configuration Firestore (OBLIGATOIRE)

**Avant toute chose**, vous devez configurer les règles Firestore :

1. Ouvrez la console Firebase :  
   🔗 https://console.firebase.google.com/project/stoked-energy-477102-k5/firestore/rules

2. Cliquez sur **"Modifier les règles"**

3. Remplacez par ces règles (TEMPORAIRES pour l'initialisation) :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Cliquez sur **"Publier"**

---

### 2️⃣ Initialisation Automatique

1. Ouvrez cette page :  
   🔗 **https://stoked-energy-477102-k5.web.app/deploy-final.html**

2. Cliquez sur **"🚀 Déployer et Configurer Maintenant"**

3. Attendez que tous les tests passent au vert ✅

4. Cette page va automatiquement :
   - Vérifier la connexion Firestore
   - Créer votre compte admin dans la base
   - Nettoyer les comptes en double
   - Tester la connexion
   - Vous rediriger vers l'admin

---

### 3️⃣ Accès au Tableau de Bord Admin

1. Allez sur :  
   🔗 **https://stoked-energy-477102-k5.web.app/admin.html**

2. Connectez-vous avec :
   - **Email :** youssef.yakachi@gmail.com
   - **Mot de passe :** Maroc1997

3. Vous êtes connecté ! 🎉

---

## 👥 CRÉER VOTRE PREMIER COACH

### Dans le tableau de bord admin :

1. Cliquez sur **"🏊‍♂️ Gestion Entraîneurs"** dans le menu

2. Cliquez sur **"➕ Créer un Entraîneur"**

3. Remplissez le formulaire :
   - Prénom
   - Nom
   - Email (celui du coach)
   - Club
   - Téléphone

4. Cliquez sur **"Créer l'invitation"**

5. Une alerte s'affiche avec le **lien d'activation** :
   ```
   https://stoked-energy-477102-k5.web.app/activation.html?token=xxxxx
   ```

6. **IMPORTANT** : Copiez ce lien et envoyez-le au coach par email ou SMS

---

## 🏊‍♂️ ACTIVATION DU COMPTE COACH

Le coach doit :

1. Ouvrir le lien d'activation reçu

2. Remplir le formulaire :
   - Vérifier ses informations
   - Définir un mot de passe sécurisé (min 8 caractères)

3. Cliquer sur **"Activer mon compte"**

4. Il est automatiquement redirigé vers son dashboard coach

5. Il peut maintenant créer des nageurs !

---

## 🏊 CRÉER DES NAGEURS (Coach)

### Dans le dashboard coach :

1. Le coach se connecte sur :  
   🔗 https://stoked-energy-477102-k5.web.app

2. Il est redirigé vers **coach-dashboard.html**

3. Il clique sur **"➕ Ajouter un Nageur"**

4. Il remplit le formulaire :
   - Prénom, Nom
   - Email
   - Date de naissance
   - Niveau (Débutant, Intermédiaire, Avancé, Élite)

5. Un **mot de passe temporaire** est généré automatiquement

6. Le coach **DOIT** copier ce mot de passe et le transmettre au nageur

7. Le nageur peut se connecter avec son email + mot de passe temporaire

---

## 🔐 CONNEXION NAGEUR

Le nageur :

1. Va sur :  
   🔗 https://stoked-energy-477102-k5.web.app/login.html

2. Entre :
   - Son email
   - Le mot de passe temporaire reçu du coach

3. Accède à son dashboard avec :
   - 🏊 NAGEUR : Voir ses performances
   - 👥 ÉQUIPE : Voir son équipe

---

## 📊 HIÉRARCHIE DU SYSTÈME

```
ADMIN (vous - Youssef)
  └─→ Crée des COACHES via invitations
       └─→ Les COACHES créent des NAGEURS directement
            └─→ Les NAGEURS utilisent l'application
```

---

## 🔒 SÉCURITÉ

### ✅ Ce qui est sécurisé :

- ✅ Un seul compte admin (vous)
- ✅ Les coaches ne peuvent être créés que par l'admin
- ✅ Les nageurs ne peuvent être créés que par leur coach
- ✅ Chaque nageur est lié à son coach (coachId)
- ✅ Les mots de passe sont hashés par Firebase Auth
- ✅ Système d'invitation avec tokens sécurisés
- ✅ Expiration des invitations après 7 jours

### ⚠️ Règles Firestore actuelles :

Les règles sont actuellement **OUVERTES** (`allow read, write: if true`) pour faciliter l'initialisation.

**APRÈS avoir créé vos premiers utilisateurs**, remplacez-les par les règles sécurisées du fichier `firestore.rules` :

1. Ouvrez : https://console.firebase.google.com/project/stoked-energy-477102-k5/firestore/rules
2. Copiez le contenu de `firestore.rules` (dans votre projet local)
3. Collez et publiez

---

## 🆘 EN CAS DE PROBLÈME

### Erreur "client is offline"
→ Les règles Firestore ne sont pas configurées. Suivez l'étape 1️⃣ ci-dessus.

### Erreur "permission-denied"
→ Les règles Firestore sont trop restrictives. Utilisez les règles temporaires ouvertes.

### Impossible de se connecter
→ Allez sur https://stoked-energy-477102-k5.web.app/deploy-final.html et relancez la configuration.

### Plusieurs comptes admin
→ Utilisez https://stoked-energy-477102-k5.web.app/setup-admin.html pour nettoyer.

---

## 📞 SUPPORT

**Projet Firebase :** stoked-energy-477102-k5  
**Console :** https://console.firebase.google.com/project/stoked-energy-477102-k5  
**Hosting URL :** https://stoked-energy-477102-k5.web.app

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Configurer les règles Firestore (étape 1)
- [ ] Lancer deploy-final.html (étape 2)
- [ ] Se connecter sur admin.html (étape 3)
- [ ] Créer le premier coach
- [ ] Envoyer le lien d'activation au coach
- [ ] Le coach active son compte
- [ ] Le coach crée des nageurs
- [ ] Les nageurs se connectent et utilisent l'app
- [ ] (Optionnel) Remplacer par les règles Firestore sécurisées

---

**🎉 Votre application est prête à l'emploi !**
