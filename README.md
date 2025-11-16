# 🏊‍♂️ Système de Suivi des Nageurs

Application web complète pour le suivi des performances des nageurs avec collecte, analyse et retours personnalisés.

## ✨ Fonctionnalités

### 1. 📊 Collecte des Données
- ✅ Création de profils de nageurs (nom, âge, genre, spécialité)
- ✅ Saisie manuelle via formulaires intuitifs
- ✅ 4 catégories de données :
  - **Bien-être** : sommeil, fatigue, douleur, stress (échelle 1-5)
  - **Entraînement** : volume (minutes), RPE (1-10), charge calculée automatiquement
  - **Performance** : VMA 6min, force épaule/pectoraux/jambes (kg)
  - **Statut médical** : disponibilité (0-3), maladies, blessures, autres problèmes

### 2. 📈 Analyse et Traitement
- ✅ Analyse automatique multi-critères
- ✅ Calcul de tendances et moyennes
- ✅ Détection de patterns problématiques
- ✅ Évaluation de la monotonie d'entraînement
- ✅ Système d'alertes intelligent (bon/attention/problématique)
- ✅ Graphiques interactifs avec Chart.js

### 3. 💡 Génération de Retours
- ✅ Retours personnalisés par nageur
- ✅ Recommandations automatiques basées sur l'analyse
- ✅ Visualisations claires avec badges de statut
- ✅ Alertes préventives pour éviter le surentraînement

### 4. 💾 Persistance et Sauvegarde **[NOUVEAU]**
- ✅ **Sauvegarde automatique** dans localStorage
- ✅ **Export JSON** des données (backup)
- ✅ **Import JSON** pour restaurer ou partager
- ✅ **Protection contre la perte de données**
- ✅ Notifications visuelles des actions

### 5. 📱 Interface Utilisateur
- ✅ Design moderne et responsive
- ✅ Navigation intuitive par sections
- ✅ Tableaux de bord détaillés par nageur
- ✅ Vue d'ensemble de l'équipe
- ✅ Compatible mobile/tablette/desktop

## 🚀 Installation et Utilisation

### 🌐 Option 1 : Déploiement en Ligne (RECOMMANDÉ)

**Déployez gratuitement sur GitHub Pages en 5 minutes !**

#### Méthode Automatique (PowerShell)
```powershell
cd "c:\Users\ordi\Desktop\suivi-nageurs"
.\deploy.ps1
```

#### Méthode Manuelle
```bash
# 1. Initialiser Git
git init
git add .
git commit -m "Initial commit"

# 2. Créer un repository sur GitHub (https://github.com/new)
# Nom: suivi-nageurs

# 3. Pousser le code
git remote add origin https://github.com/VOTRE-USERNAME/suivi-nageurs.git
git branch -M main
git push -u origin main

# 4. Activer GitHub Pages
# Settings → Pages → Source: GitHub Actions
```

**Votre application sera accessible à :** `https://VOTRE-USERNAME.github.io/suivi-nageurs/`

📖 **Guide détaillé :** Consultez [DEPLOIEMENT.md](./DEPLOIEMENT.md)

---

### 💻 Option 2 : Utilisation Locale Simple

1. **Télécharger le projet**
   ```bash
   git clone https://github.com/youssefjamaidt/suivi-nageurs.git
   cd suivi-nageurs
   ```

2. **Ouvrir dans le navigateur**
   - Double-cliquer sur `index.html`, ou
   - Utiliser un serveur local :
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js
   npx http-server
   ```

3. **Accéder à l'application**
   - Ouvrir http://localhost:8000 dans votre navigateur

---

### 🌍 Option 3 : Autres Plateformes Gratuites

**Netlify** (Le plus simple)
- Drag & drop sur [netlify.com](https://netlify.com)
- Déploiement instantané

**Vercel**
- Import GitHub sur [vercel.com](https://vercel.com)
- Déploiement automatique

**Cloudflare Pages**
- Ultra-rapide avec CDN mondial
- [pages.cloudflare.com](https://pages.cloudflare.com)

---

## 📖 Guide d'Utilisation

### Démarrage Rapide

1. **Ajouter un nageur**
   - Cliquer sur "➕ Nouveau Nageur"
   - Remplir le formulaire (nom, âge, genre, spécialité)
   - Valider

2. **Saisir des données**
   - Sélectionner un nageur dans la liste déroulante
   - Aller dans "Saisie des Données"
   - Choisir une catégorie et remplir le formulaire
   - Les données sont **automatiquement sauvegardées**

3. **Consulter l'analyse**
   - Section "Analyse" : graphiques et tendances
   - Section "Retours Personnalisés" : recommandations

4. **Exporter/Importer**
   - **💾 Exporter** : créer une sauvegarde JSON
   - **📂 Importer** : restaurer à partir d'un fichier JSON

### Gestion des Données

**Sauvegarde Automatique :**
- Toutes les actions sont sauvegardées automatiquement dans le navigateur
- Les données persistent après fermeture du navigateur

**Export/Import :**
- Exporter régulièrement pour créer des backups
- Partager les données entre appareils
- Format JSON lisible et éditable

**Réinitialisation :**
- Le bouton "🔄 Réinitialiser" crée automatiquement un export avant de supprimer

## 🎯 Algorithmes d'Analyse

### Bien-être
- **Bon** : sommeil ≥3, fatigue ≤3, douleur ≤2, stress ≤3
- **Attention** : sommeil ≥2, fatigue ≤4, douleur ≤3, stress ≤4
- **Problématique** : en dessous des seuils d'attention

### Entraînement
- **Monotonie** = Charge moyenne / Écart-type charge
- **Alerte** si RPE >8 ET volume >120min
- **Problématique** si RPE >9 OU monotonie >2.0

### Performance
- **VMA** : Bon ≥2200m, Attention 1800-2200m, Faible <1800m
- **Force épaule** : Bon ≥20kg, Attention 15-20kg, Faible <15kg

### Médical
- **Bon** : disponibilité ≥2, pas de blessure
- **Attention** : disponibilité <2 OU maladies >0
- **Problématique** : disponibilité =0 OU blessures >0

## 🔧 Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Design moderne, flexbox, grid, animations
- **JavaScript (Vanilla)** : Logique applicative
- **Chart.js** : Graphiques interactifs
- **LocalStorage API** : Persistance des données
- **Font Awesome** : Icônes

## 📦 Structure du Projet

```
suivi-nageurs/
├── index.html              # Page principale
├── README.md              # Documentation
├── assets/
│   ├── css/
│   │   └── style.css      # Styles CSS
│   ├── js/
│   │   └── app.js         # Logique JavaScript
│   └── images/            # Images (optionnel)
```

## 🔄 Améliorations Récentes (v2.0)

### ✅ Fonctionnalités Ajoutées
1. **Persistance localStorage** - Plus de perte de données !
2. **Export/Import JSON** - Backups et partage facilités
3. **Tableaux de bord complets** - Vue détaillée par nageur
4. **Vue d'ensemble équipe** - Statistiques globales
5. **Notifications visuelles** - Retours utilisateur améliorés
6. **Sauvegarde automatique** - Avant réinitialisation

### 🎨 Améliorations UI/UX
- En-têtes de nageur stylisés avec gradient
- Animations fluides pour les notifications
- Tableaux interactifs avec effets hover
- Badges colorés pour les statuts
- Interface responsive optimisée

## 🚀 Suggestions d'Améliorations Futures

### Phase 1 - Court Terme
- [ ] Édition/suppression de nageurs individuels
- [ ] Modification des données saisies
- [ ] Graphiques de comparaison entre nageurs
- [ ] Filtres par date pour les analyses
- [ ] Mode sombre

### Phase 2 - Moyen Terme
- [ ] Authentification utilisateur
- [ ] Base de données en ligne (Firebase)
- [ ] Génération PDF des rapports
- [ ] Calendrier d'entraînement
- [ ] Photos de profil des nageurs

### Phase 3 - Long Terme
- [ ] Application mobile (PWA)
- [ ] Synchronisation multi-appareils
- [ ] Notifications push
- [ ] Intégration montres connectées
- [ ] Machine Learning pour prédictions

## 📞 Contact et Support

**Développeur** : Amri Jamai Youssef  
**Email** : youssef.yakachi@gmail.com  
**Téléphone** : +212 614 032 759  
**Organisation** : Achbal Sportifs Natation

## 📄 Licence

© 2025 Système de Suivi des Nageurs - Achbal Sportifs Natation  
Tous droits réservés.

---

**Note Technique** : Cette application stocke toutes les données localement dans votre navigateur (localStorage). Pour une utilisation professionnelle avec plusieurs entraîneurs, envisagez l'implémentation d'une base de données en ligne.
