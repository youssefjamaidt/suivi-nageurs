# 🧪 Bouton Test Équipe - Documentation

**Date**: 18 Novembre 2025  
**Fonctionnalité**: Création automatique d'une équipe de démonstration complète

---

## 🎯 **OBJECTIF**

Permettre de tester rapidement l'interface équipe avec des données réalistes sans saisie manuelle.

---

## 📍 **LOCALISATION**

**Interface Équipe** (`equipe.html`)
- Section : **Aperçu de l'Équipe**
- Position : À côté des boutons "Export PDF" et "Export Excel"
- Bouton : **🧪 Test Équipe (Démo)** (orange)

---

## ✨ **FONCTIONNALITÉS**

### **Création Automatique**

Le bouton crée automatiquement :

#### **1️⃣ Une Équipe**
```
Nom: "Équipe Test - Élite"
Catégorie: Senior
Coach: Coach Demo
Date création: Aujourd'hui
```

#### **2️⃣ Quatre Nageurs**
Avec profils variés pour tester différents scénarios :

**Sophie Martin** (19 ans, Femme, Crawl)
- Niveau: Élevé ⭐⭐⭐
- Bien-être: Excellent (7-9/10)
- Performance: VMA 14-16 km/h
- Temps 50m Crawl: ~26 sec

**Lucas Dubois** (21 ans, Homme, Papillon)
- Niveau: Moyen ⭐⭐
- Bien-être: Bon (5-8/10)
- Performance: VMA 12-14 km/h
- Temps 50m Papillon: ~28 sec

**Emma Bernard** (18 ans, Femme, Dos)
- Niveau: Élevé ⭐⭐⭐
- Bien-être: Très bon (7-9/10)
- Performance: VMA 14-16 km/h
- Temps 50m Dos: ~26 sec

**Thomas Petit** (20 ans, Homme, Brasse)
- Niveau: En progression ⭐
- Bien-être: Variable (4-7/10)
- Performance: VMA 10-12 km/h
- Temps 50m Brasse: ~30 sec

---

#### **3️⃣ Données Complètes (10 jours)**

Pour chaque nageur, génération de :

**A) Bien-être (10 entrées)**
```javascript
{
  date: "2024-11-XX",
  sleep: 6-9 (selon niveau),
  fatigue: 2-6 (inversé selon niveau),
  pain: 0-3 (inversé selon niveau),
  stress: 2-6 (inversé selon niveau)
}
```

**B) Entraînement (10 entrées)**
```javascript
{
  date: "2024-11-XX",
  volume: 60-100 min (selon niveau),
  volumeMeters: 3000-5000 m (selon niveau),
  rpe: 5-9,
  load: volume × rpe
}
```

**C) Performance (3-4 entrées)**
```javascript
{
  date: "2024-11-XX",
  vma: 12-16 km/h (selon niveau),
  shoulderStrength: 2-4 kg,
  chestStrength: 1.5-3 kg,
  legStrength: 2.5-4.5 kg
}
```

**D) Médical (10 entrées)**
```javascript
{
  date: "2024-11-XX",
  availability: 1-3 (selon niveau),
  illnesses: 0-1 (aléatoire 10%),
  injuries: 0-1 (aléatoire 5%),
  otherIssues: 0
}
```

**E) Courses (3 compétitions)**
```javascript
{
  date: "2024-11-XX",
  event: "Championnats/Meeting/Compétition",
  races: [
    {style: "Crawl/Papillon/Dos/Brasse", distance: "50m", time: "26-30 sec"},
    {style: "...", distance: "100m", time: "57-67 sec"},
    {style: "...", distance: "200m", time: "2:05-2:25"}
  ]
}
```

---

## 🚀 **UTILISATION**

### **Étape 1 : Cliquer sur le bouton**
```
Interface Équipe → Section Aperçu → Bouton "🧪 Test Équipe (Démo)"
```

### **Étape 2 : Confirmer**
```
Message de confirmation:
"🧪 CRÉER ÉQUIPE DE TEST

Cette fonction va créer automatiquement :
• 1 équipe "Équipe Test - Élite"
• 4 nageurs avec profils complets
• Toutes les données (bien-être, entraînement, performance, médical, courses)
• Graphiques et analyses

Continuer ?"
```

### **Étape 3 : Attendre la création**
```
Console:
🧪 Début création équipe test...
✅ 4 nageurs créés
✅ Équipe créée: Équipe Test - Élite
```

### **Étape 4 : Confirmation**
```
Message de succès:
"✅ ÉQUIPE TEST CRÉÉE !

Équipe: Équipe Test - Élite
Nageurs: 4
• Sophie Martin
• Lucas Dubois
• Emma Bernard
• Thomas Petit

Toutes les données ont été générées.
Explorez les sections Aperçu, Analyse et Gestion !"
```

### **Étape 5 : Explorer**
L'équipe est automatiquement sélectionnée et affichée.

---

## 📊 **VÉRIFICATIONS POSSIBLES**

### **Section Aperçu**
✅ Statistiques clés de l'équipe affichées  
✅ Cartes de présentation des 4 nageurs  
✅ Moyennes bien-être, entraînement, performance  

### **Section Saisie**
✅ Liste des 4 nageurs dans présences  
✅ Formulaires de saisie groupée accessibles  
✅ Possibilité d'ajouter de nouvelles données  

### **Section Analyse**
✅ Graphiques équipe générés :
- Évolution bien-être moyen
- Volume d'entraînement total
- Charge collective
- Comparaison performances
- Présences/absences

✅ Tableaux de données :
- Historique entraînements
- Résultats compétitions
- Tests de performance

### **Section Gestion**
✅ Les 4 nageurs listés  
✅ Possibilité de retirer un nageur  
✅ Possibilité d'ajouter d'autres nageurs  
✅ Statistiques individuelles accessibles  

### **Dashboard Individuel**
✅ Ouvrir `dashboard.html`  
✅ Sélectionner un des 4 nageurs  
✅ Vérifier que toutes les données sont présentes :
- Section Aperçu : cartes statistiques
- Section Saisie : possibilité d'ajouter
- Section Analyse : graphiques complets (bien-être, entraînement, performance, courses)
- Section Retours : recommandations personnalisées

---

## 🔧 **DÉTAILS TECHNIQUES**

### **Fonction Principale**
```javascript
window.createTestTeam()
Fichier: assets/js/equipe.js
Ligne: ~3863
```

### **Fonctions Auxiliaires**
```javascript
createTestSwimmers()
- Crée 4 nageurs avec profils variés

createSwimmerWithData(profile)
- Génère toutes les données pour un nageur
- 10 jours de bien-être, entraînement, médical
- 3-4 tests de performance
- 3 compétitions avec résultats

generateRaces(specialty, level)
- Génère performances de course selon spécialité et niveau

formatTime(seconds)
- Formate temps en format MM:SS.ms ou SS.ms
```

### **Structure de Données**
Utilise la **nouvelle structure unifiée** :
- `wellbeingData[]` (array d'objets)
- `trainingData[]` (array d'objets)
- `performanceData[]` (array d'objets)
- `medicalData[]` (array d'objets)
- `raceData[]` (array d'objets)

Conserve aussi l'**ancienne structure** pour compatibilité.

---

## 💡 **CAS D'USAGE**

### **1. Démonstration Client**
Montrer rapidement toutes les fonctionnalités avec données réalistes.

### **2. Tests de Performance**
Vérifier que les graphiques fonctionnent avec plusieurs nageurs et beaucoup de données.

### **3. Validation Interface**
Tester l'affichage des analyses, recommandations, exports avec données complètes.

### **4. Formation Utilisateurs**
Permettre aux nouveaux utilisateurs d'explorer l'interface sans créer manuellement des données.

### **5. Développement**
Tester rapidement des modifications sans saisie manuelle.

---

## ⚠️ **NOTES IMPORTANTES**

1. **Pas de duplication** : Chaque clic crée une NOUVELLE équipe et 4 NOUVEAUX nageurs
2. **localStorage** : Données stockées localement, persistantes entre sessions
3. **Suppression** : Supprimer l'équipe via section Gestion si nécessaire
4. **Compatibilité** : Fonctionne avec dashboard.html (nageurs accessibles individuellement)
5. **Réalisme** : Données générées aléatoirement mais cohérentes (bon nageur = bonnes perfs)

---

## 🧹 **NETTOYAGE**

Pour supprimer l'équipe de test :
1. Aller dans **Section Gestion**
2. Cliquer sur **Supprimer l'équipe**
3. Confirmer

Les 4 nageurs resteront dans le système mais ne seront plus dans l'équipe.

Pour supprimer complètement :
1. Ouvrir `dashboard.html`
2. Supprimer chaque nageur individuellement
3. Ou vider le localStorage via console : `localStorage.clear()`

---

## ✅ **RÉSUMÉ**

| Élément | Quantité | Détails |
|---------|----------|---------|
| **Équipes créées** | 1 | "Équipe Test - Élite" |
| **Nageurs créés** | 4 | Profils variés (high/medium/low) |
| **Jours de données** | 10 | Du jour -9 à aujourd'hui |
| **Entrées bien-être** | 40 | 10 par nageur |
| **Entrées entraînement** | 40 | 10 par nageur |
| **Tests performance** | 12-16 | 3-4 par nageur |
| **Entrées médicales** | 40 | 10 par nageur |
| **Compétitions** | 12 | 3 par nageur |
| **Courses** | 36 | 3 courses par compétition |
| **Total données** | ~180 | Toutes catégories confondues |

---

**🎉 Fonctionnalité opérationnelle et prête à l'emploi !**
