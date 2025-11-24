# 🏊‍♂️ SUIVI NAGEURS - SYSTÈME COMPLET DE GESTION

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Firestore](https://img.shields.io/badge/Firestore-Database-orange)](https://firebase.google.com/products/firestore)
[![Authentication](https://img.shields.io/badge/Auth-Firebase-blue)](https://firebase.google.com/products/auth)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/youssefjamaidt/suivi-nageurs)

Application web complète pour la gestion et le suivi des nageurs avec **authentification multi-rôles**, **base de données temps réel**, et **génération automatique de comptes**.

---

## 🎯 Vue d'Ensemble

**Suivi Nageurs** est une plateforme moderne permettant aux **coachs** de gérer leurs équipes de natation, aux **nageurs** de suivre leurs performances personnelles, et aux **administrateurs** de superviser l'ensemble du système.

### ✨ Fonctionnalités Principales

#### 🔐 **Authentification Multi-Rôles**
- 3 rôles: **Admin**, **Coach**, **Nageur**
- Inscription coach avec validation admin
- Génération automatique de comptes nageurs
- Réinitialisation mot de passe par email
- Protection des routes par rôle

#### 👨‍🏫 **Interface Coach**
- Gestion multi-équipes
- **Génération automatique** de comptes nageurs en 1 clic
- Visualisation données nageurs en temps réel
- Dashboard avec statistiques équipe
- Suivi bien-être, performances, médical, compétitions

#### 🏊 **Interface Nageur**
- Dashboard personnel avec 7 sections
- **Saisie bien-être** quotidien (5 champs, 2 min)
- **Saisie bien-être** hebdomadaire (13 champs, 5 min)
- Score automatiquement calculé
- Synchronisation instantanée avec coach

#### 👑 **Interface Admin**
- Approbation/rejet inscriptions coachs
- Gestion complète des utilisateurs
- Statistiques système globales
- Modification rôles et statuts
- Activation/désactivation comptes

#### ⚡ **Temps Réel**
- Synchronisation instantanée Firestore
- Coach voit données nageur en direct
- Pas de rafraîchissement manuel nécessaire
- Notifications automatiques

---

## 🚀 Installation Rapide

### Prérequis
- Compte Firebase (gratuit)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- Connexion Internet

### Étape 1: Cloner le Projet
```bash
git clone https://github.com/youssefjamaidt/suivi-nageurs.git
cd suivi-nageurs
```

### Étape 2: Configurer Firebase

1. **Créer projet Firebase**
   - Aller sur [Firebase Console](https://console.firebase.google.com/)
   - Créer nouveau projet
   - Nom: "Suivi Nageurs" (ou autre)

2. **Activer Authentication**
   - Authentication → Sign-in method
   - Activer "Email/Password"

3. **Créer Firestore Database**
   - Firestore Database → Create database
   - Mode: Production
   - Location: europe-west (ou plus proche)

4. **Copier Configuration**
   - Project Settings (⚙️) → Vos applications
   - Ajouter une app Web
   - Copier `firebaseConfig`

5. **Configurer l'Application**
   - Ouvrir `assets/js/firebase-config.js`
   - Remplacer les valeurs:
   ```javascript
   const firebaseConfig = {
       apiKey: "VOTRE_API_KEY",
       authDomain: "votre-projet.firebaseapp.com",
       projectId: "votre-projet-id",
       storageBucket: "votre-projet.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abcdef"
   };
   ```

6. **Déployer Règles de Sécurité**
   - Firestore → Rules
   - Copier depuis `FIRESTORE-STRUCTURE.md`
   - Publier

### Étape 3: Créer le Premier Admin

**Manuellement dans Firestore:**
```javascript
// Firebase Console → Firestore → users → Add document

Document ID: [Copier UID depuis Authentication]
{
  email: "admin@votre-club.com",
  firstName: "Admin",
  lastName: "System",
  role: "admin",
  status: "active",
  createdAt: [Timestamp now]
}
```

**Puis créer compte Authentication:**
- Firebase Console → Authentication → Add user
- Email: admin@votre-club.com
- Password: VotreMotDePasse123!
- Copier l'UID généré et l'utiliser comme Document ID ci-dessus

### Étape 4: Tester l'Application

1. **Ouvrir localement**
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Ou avec Node.js
   npx http-server
   ```

2. **Accéder à** http://localhost:8000

3. **Se connecter comme admin**
   - Email: admin@votre-club.com
   - Mot de passe: VotreMotDePasse123!

4. **Tester les flux**
   - Inscription coach
   - Approbation admin
   - Génération compte nageur
   - Saisie bien-être

---

## 📖 Documentation Complète

### 🎓 Guides Utilisateur
- **[DEMARRAGE-RAPIDE.md](./DEMARRAGE-RAPIDE.md)** ⭐ **Commencez ici !**
- **[GUIDE-CONFIGURATION-FIREBASE.md](./GUIDE-CONFIGURATION-FIREBASE.md)** - Configuration pas à pas
- **[GUIDE-TESTS.md](./GUIDE-TESTS.md)** - Scénarios de tests complets
- **[GUIDE-DEPANNAGE.md](./GUIDE-DEPANNAGE.md)** - Résolution de problèmes

### 🔧 Documentation Technique
- **[FIRESTORE-STRUCTURE.md](./FIRESTORE-STRUCTURE.md)** - Structure 8 collections + règles sécurité
- **[GUIDE-MIGRATION-FIRESTORE.md](./GUIDE-MIGRATION-FIRESTORE.md)** - Migration localStorage → Firestore
- **[PHASE-1-COMPLETE.md](./PHASE-1-COMPLETE.md)** - Résumé accomplissements

---

## 🎯 Flux d'Utilisation

### 1️⃣ Inscription Coach
```
register.html → Formulaire 4 étapes
             ↓
Firebase Auth (status: pending)
             ↓
Admin reçoit notification
             ↓
Admin approuve → status: active
             ↓
Coach peut se connecter
```

### 2️⃣ Connexion & Redirection
```
login.html → Vérifier email/password
           ↓
    Récupérer role Firestore
           ↓
    ┌──────┼──────┐
    ↓      ↓      ↓
admin  index  nageur
.html  .html  .html
```

### 3️⃣ Coach Crée Équipe & Génère Nageurs
```
index.html → Équipe → equipe.html
                    ↓
         Créer équipe → Modal
                    ↓
         Sélectionner nageurs
                    ↓
         Firestore teams collection
                    ↓
         Liste nageurs affichée
                    ↓
         Clic "Générer accès"
                    ↓
Email: prenom.nom@club.swim
Password: kF8pLm2rTq (aléatoire)
                    ↓
         Modal avec identifiants
                    ↓
         Copier → Envoyer au nageur
```

### 4️⃣ Nageur Saisit Bien-être
```
Nageur reçoit identifiants
         ↓
login.html → nageur.html
         ↓
Dashboard personnel
         ↓
Clic "Saisir Bien-être"
         ↓
Formulaire quotidien/hebdomadaire
         ↓
Firestore wellbeing_data
         ↓
Coach voit instantanément
```

---

## 🗄️ Architecture Firestore

### Collections (8)
1. **users** - Tous utilisateurs (admin/coach/nageur)
2. **teams** - Équipes créées par coachs
3. **wellbeing_data** - Bien-être quotidien/hebdomadaire
4. **performance_data** - Tests VMA, force, sprint
5. **medical_data** - Blessures, maladies, suivi médical
6. **race_data** - Résultats compétitions
7. **technical_data** - Évaluations techniques
8. **attendance_data** - Présences entraînements

**Documentation détaillée:** `FIRESTORE-STRUCTURE.md`

---

## 💻 Technologies

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Design moderne, animations
- **JavaScript Vanilla** - Logique applicative
- **Chart.js** - Graphiques interactifs
- **Font Awesome** - Icônes

### Backend & Database
- **Firebase Authentication** - Gestion utilisateurs
- **Cloud Firestore** - Base données NoSQL temps réel
- **Firebase Hosting** (optionnel) - Hébergement
- **Firestore Security Rules** - Sécurité avancée

---

## 📂 Structure Projet

```
suivi-nageurs/
├── index.html                     # Hub coach (2 cartes)
├── login.html                     # Page connexion
├── register.html                  # Inscription coach
├── forgot-password.html           # Réinitialisation
├── admin.html                     # Interface admin
├── equipe.html                    # Interface équipe coach
├── nageur.html                    # Dashboard nageur
├── dashboard.html                 # Dashboard original
│
├── assets/
│   ├── css/
│   │   ├── style.css             # Styles principaux
│   │   └── home.css              # Styles hub coach
│   │
│   ├── js/
│   │   ├── firebase-config.js    # Configuration Firebase
│   │   ├── admin-dashboard.js    # Logique admin
│   │   ├── equipe-firestore.js   # Logique coach Firestore
│   │   ├── nageur-dashboard.js   # Logique nageur
│   │   └── app.js                # Dashboard original
│   │
│   └── images/                   # Images/logos
│
├── DEMARRAGE-RAPIDE.md           # Guide démarrage ⭐
├── GUIDE-CONFIGURATION-FIREBASE.md
├── FIRESTORE-STRUCTURE.md
├── GUIDE-MIGRATION-FIRESTORE.md
├── GUIDE-TESTS.md
├── GUIDE-DEPANNAGE.md
├── PHASE-1-COMPLETE.md
└── README.md                     # Ce fichier
```

---

## 🎨 Captures d'Écran

### Interface Coach
- **Hub**: 2 cartes (Nageurs / Équipe)
- **Équipe**: Liste nageurs avec scores bien-être temps réel
- **Génération compte**: Modal identifiants avec copie 1-clic

### Interface Nageur
- **Dashboard**: 7 sections (bien-être, performance, médical, courses, technique, présence, global)
- **Saisie bien-être**: Formulaire quotidien (5 champs) ou hebdomadaire (13 champs)
- **Score**: Calcul automatique et affichage couleur

### Interface Admin
- **Stats**: Utilisateurs total, coachs, nageurs, en attente
- **Demandes**: Liste inscriptions pending avec détails
- **Utilisateurs**: Gestion complète (modifier, activer, désactiver)

---

## 📊 Statistiques Projet

| Métrique | Valeur |
|----------|--------|
| **Lignes de code Firebase** | 1900+ |
| **Collections Firestore** | 8 |
| **Interfaces complètes** | 3 (Admin/Coach/Nageur) |
| **Fonctions implémentées** | 57 |
| **Pages HTML** | 7 |
| **Documentation** | 6 guides complets |
| **Règles sécurité Firestore** | 150+ lignes |
| **Temps de développement** | Phase 1 complète |

---

## ✅ Checklist Déploiement Production

### Configuration
- [ ] Projet Firebase créé
- [ ] Authentication Email/Password activé
- [ ] Firestore Database créé (mode production)
- [ ] Règles de sécurité déployées
- [ ] firebase-config.js configuré
- [ ] Index Firestore créés (automatique)

### Utilisateurs
- [ ] Compte admin créé manuellement
- [ ] Test inscription coach
- [ ] Test approbation admin
- [ ] Test génération compte nageur

### Tests Fonctionnels
- [ ] Connexion tous rôles
- [ ] Protection routes
- [ ] Création équipe
- [ ] Génération compte nageur
- [ ] Saisie bien-être nageur
- [ ] Synchronisation temps réel
- [ ] Export/import données

### Performance & Sécurité
- [ ] Temps chargement < 3s
- [ ] Règles Firestore testées
- [ ] Responsive mobile testé
- [ ] Console sans erreurs

### Documentation
- [ ] Guides utilisateur à jour
- [ ] Identifiants admin documentés
- [ ] Procédures sauvegarde définies

---

## 🚀 Déploiement

### Option 1: Firebase Hosting (Recommandé)
```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser
firebase init hosting

# Déployer
firebase deploy --only hosting
```

### Option 2: GitHub Pages
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# Activer dans Settings → Pages
```

### Option 3: Netlify
- Drag & drop sur [netlify.com](https://netlify.com)
- Ou connecter GitHub repo

### Option 4: Vercel
- Import GitHub sur [vercel.com](https://vercel.com)
- Déploiement automatique

---

## 🔧 Développement

### Développement Local
```bash
# Cloner
git clone https://github.com/youssefjamaidt/suivi-nageurs.git
cd suivi-nageurs

# Serveur local
python -m http.server 8000
# Ou
npx http-server

# Accéder
http://localhost:8000
```

### Structure de Développement
```bash
# Branche principale (production)
main

# Branches de développement
dev/feature-name
fix/bug-description
```

### Contributions
1. Fork le projet
2. Créer branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir Pull Request

---

## 🎓 Formation & Support

### Guides Disponibles
- **Démarrage rapide** (DEMARRAGE-RAPIDE.md) - 5-10 min
- **Configuration Firebase** - 15-20 min
- **Tests complets** - 30-45 min
- **Dépannage** - Référence

### Support
- **Documentation**: Consulter guides dans le repo
- **Issues**: Ouvrir issue GitHub pour bugs/questions
- **Email**: youssef.yakachi@gmail.com (développeur)

---

## 🛣️ Roadmap

### ✅ Phase 1 (COMPLÉTÉ)
- Firebase Authentication
- Interface Admin
- Interface Coach avec génération nageurs
- Interface Nageur avec saisie bien-être
- Synchronisation temps réel
- Structure Firestore 8 collections
- Documentation complète

### 🔄 Phase 2 (En cours)
- [ ] Tests end-to-end automatisés
- [ ] Migration données localStorage
- [ ] Performance optimizations

### 📋 Phase 3 (Planifié)
- [ ] Envoi email automatique identifiants nageur
- [ ] Notifications push (Firebase Cloud Messaging)
- [ ] Export PDF rapports
- [ ] Graphiques comparaison nageurs
- [ ] Calendrier d'entraînement

### 🚀 Phase 4 (Futur)
- [ ] Application mobile (PWA)
- [ ] Mode hors-ligne complet
- [ ] Intégration API montres connectées
- [ ] Machine Learning prédictions
- [ ] Analyse vidéo technique

---

## 📄 Licence

© 2025 Suivi Nageurs - Achbal Sportifs Natation  
Tous droits réservés.

Ce projet est développé pour un usage privé. Toute redistribution, modification ou utilisation commerciale nécessite une autorisation écrite préalable.

---

## 👥 Crédits

**Développement & Architecture**  
Amri Jamai Youssef  
Email: youssef.yakachi@gmail.com  
Téléphone: +212 614 032 759

**Organisation**  
Achbal Sportifs Natation

**Technologies**  
- Firebase (Google)
- Chart.js (MIT License)
- Font Awesome (Free License)

---

## 📞 Contact

**Questions ? Besoin d'aide ?**

- 📧 Email: youssef.yakachi@gmail.com
- 📱 Téléphone: +212 614 032 759
- 🐛 Issues: [GitHub Issues](https://github.com/youssefjamaidt/suivi-nageurs/issues)
- 📖 Documentation: Consultez les guides dans `/docs`

---

<div align="center">

**🏊‍♂️ Fait avec ❤️ pour les nageurs et leurs coachs**

[![GitHub](https://img.shields.io/badge/GitHub-suivi--nageurs-blue?style=flat&logo=github)](https://github.com/youssefjamaidt/suivi-nageurs)
[![Firebase](https://img.shields.io/badge/Powered%20by-Firebase-orange?style=flat&logo=firebase)](https://firebase.google.com/)

[Documentation](./DEMARRAGE-RAPIDE.md) • [Configuration](./GUIDE-CONFIGURATION-FIREBASE.md) • [Tests](./GUIDE-TESTS.md) • [Support](./GUIDE-DEPANNAGE.md)

</div>
