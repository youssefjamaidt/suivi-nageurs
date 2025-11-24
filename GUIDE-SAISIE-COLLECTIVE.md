# 📝 GUIDE D'UTILISATION - SAISIE COLLECTIVE DES DONNÉES

**Application:** Suivi des Nageurs - Module Équipe  
**Version:** 2.0  
**Date:** 24 Novembre 2025

---

## 🎯 OBJECTIF

La **Saisie Collective** permet à l'entraîneur de saisir les données pour **tous les nageurs de l'équipe en une seule fois**, au lieu de saisir les données individuellement pour chaque nageur.

### Avantages :
✅ **Gain de temps considérable** : Saisie rapide pour toute l'équipe  
✅ **Consistance des données** : Même date pour tous les nageurs  
✅ **Vue d'ensemble immédiate** : Tous les nageurs visibles sur un seul écran  
✅ **Synchronisation automatique** : Les données sont enregistrées dans le dashboard de chaque nageur  
✅ **Analyses collectives** : Les statistiques d'équipe se mettent à jour automatiquement

---

## 🚀 ACCÈS À LA SAISIE COLLECTIVE

### Étape 1 : Sélectionner une équipe
1. Ouvrez l'interface **Équipe** (`equipe.html`)
2. Cliquez sur le **sélecteur d'équipe** en haut de la page
3. Choisissez l'équipe pour laquelle vous voulez saisir des données

### Étape 2 : Ouvrir le menu de saisie
1. Cliquez sur le **bouton circulaire bleu** "Saisie Collective" (icône 🏊)
2. Un modal s'ouvre avec **7 types de données disponibles**

---

## 📊 LES 7 TYPES DE SAISIE COLLECTIVE

### 1. 😊 **BIEN-ÊTRE**
**Utilité :** Évaluer l'état mental et physique quotidien des nageurs

**Champs disponibles :**
- **Sommeil** (1-10) : Qualité du sommeil de la veille
- **Fatigue** (1-10) : Niveau de fatigue ressenti
- **Stress** (1-10) : Niveau de stress (scolaire, personnel, sportif)
- **Douleur** (0-10) : Intensité des douleurs éventuelles

**Quand l'utiliser :**
- 🌅 **Tous les matins avant l'entraînement** (idéal)
- 📅 Au minimum 3 fois par semaine
- ⚠️ Après une compétition ou une séance intense

**Exemple d'utilisation :**
```
Nageur 1 : Sommeil 8, Fatigue 4, Stress 3, Douleur 0
Nageur 2 : Sommeil 6, Fatigue 6, Stress 5, Douleur 2
Nageur 3 : Sommeil 9, Fatigue 3, Stress 2, Douleur 0
```

---

### 2. 🏊 **ENTRAÎNEMENT**
**Utilité :** Suivre la charge d'entraînement et le volume effectué

**Champs disponibles :**
- **Durée** (minutes) : Temps total de la séance
- **Distance** (mètres) : Volume nagé pendant la séance
- **RPE** (1-10) : Perception de l'effort (Rating of Perceived Exertion)
- **Type** : Endurance, Technique, Vitesse, Force, Récupération

**Quand l'utiliser :**
- 🏊 **À la fin de chaque séance d'entraînement**
- 📊 Pour suivre la charge hebdomadaire
- 📈 Pour ajuster l'entraînement selon les réponses

**Calcul automatique :**
- **Charge = Durée × RPE** (calculée automatiquement)

**Exemple d'utilisation :**
```
Session du 24/11/2025 - Type: Endurance
Nageur 1 : 90 min, 4000m, RPE 7 → Charge: 630
Nageur 2 : 85 min, 3800m, RPE 6 → Charge: 510
Nageur 3 : 95 min, 4200m, RPE 8 → Charge: 760
```

---

### 3. 💪 **PERFORMANCE**
**Utilité :** Évaluer les capacités physiques lors de tests

**Champs disponibles :**
- **VMA** (km/h) : Vitesse Maximale Aérobie
- **Saut Vertical** (cm) : Détente verticale (force explosive jambes)
- **Pompes** (nombre/min) : Force musculaire haut du corps
- **Gainage** (secondes) : Force de la ceinture abdominale

**Quand l'utiliser :**
- 📅 **Tous les 15 jours à 1 mois** (tests réguliers)
- 🏁 En début, milieu et fin de saison
- 📊 Pour suivre la progression physique

**Exemple d'utilisation :**
```
Test du 24/11/2025
Nageur 1 : VMA 14.5, Saut 45cm, Pompes 35, Gainage 90s
Nageur 2 : VMA 13.8, Saut 42cm, Pompes 30, Gainage 75s
Nageur 3 : VMA 15.2, Saut 48cm, Pompes 40, Gainage 105s
```

---

### 4. 🏥 **MÉDICAL**
**Utilité :** Suivre la disponibilité et l'état de santé des nageurs

**Champs disponibles :**
- **Statut** : Présent, Absent (Maladie), Absent (Blessure), Participation partielle
- **État de forme** (1-5) : Condition physique du jour
- **Notes** : Observations médicales ou commentaires

**Quand l'utiliser :**
- 🏥 **Tous les jours avant l'entraînement** (appel médical rapide)
- ⚠️ En cas de maladie ou blessure
- 📝 Pour suivi des absences

**Exemple d'utilisation :**
```
Séance du 24/11/2025
Nageur 1 : Présent, Forme 4/5, Notes: RAS
Nageur 2 : Absent (Maladie), Notes: Grippe, retour prévu 26/11
Nageur 3 : Présent, Forme 5/5, Notes: Excellent état
```

---

### 5. 🏅 **COMPÉTITION**
**Utilité :** Enregistrer les résultats de course lors des compétitions

**Champs disponibles :**
- **Nage** : Crawl, Dos, Brasse, Papillon, 4 Nages
- **Distance** : 50m, 100m, 200m, 400m, 800m, 1500m
- **Temps** (MM:SS:MS) : Temps réalisé (ex: 01:15:50)
- **Classement** : Position finale (optionnel)

**Quand l'utiliser :**
- 🏁 **Après chaque compétition** (jour même ou lendemain)
- 📊 Pour historique des performances
- 🎯 Pour suivi des objectifs de temps

**Format du temps :**
- **Courtes distances** (50-200m) : `SS:MS` → Exemple: `26:50` (26 secondes 50)
- **Moyennes distances** (400-800m) : `M:SS:MS` → Exemple: `5:12:35`
- **Longues distances** (1500m) : `MM:SS:MS` → Exemple: `18:45:20`

**Exemple d'utilisation :**
```
Compétition: Championnat Régional - 24/11/2025
Nageur 1 : Crawl 100m, Temps 58:45, Classement 3e
Nageur 2 : Dos 50m, Temps 30:12, Classement 5e
Nageur 3 : Brasse 200m, Temps 2:35:80, Classement 1er
```

---

### 6. 📋 **TECHNIQUE**
**Utilité :** Évaluer la qualité technique des nages

**Champs disponibles :**
- **Nage évaluée** : Crawl, Dos, Brasse, Papillon
- **Position** (0-10) : Alignement du corps
- **Respiration** (0-10) : Qualité de la respiration
- **Bras** (0-10) : Mouvement des bras
- **Jambes** (0-10) : Battements / ciseaux

**Échelle d'évaluation :**
- **0-3** : À améliorer / Débutant
- **4-6** : Moyen / En progression
- **7-8** : Bon niveau
- **9-10** : Excellent / Maîtrisé

**Quand l'utiliser :**
- 📅 **Toutes les 2-3 semaines** (séances techniques)
- 🎥 Après une séance vidéo
- 📊 Pour suivi de la progression technique

**Exemple d'utilisation :**
```
Évaluation Crawl - 24/11/2025
Nageur 1 : Position 7, Respiration 8, Bras 6, Jambes 7
Nageur 2 : Position 6, Respiration 7, Bras 5, Jambes 6
Nageur 3 : Position 8, Respiration 9, Bras 8, Jambes 7
```

---

### 7. ✅ **PRÉSENCE**
**Utilité :** Faire l'appel journalier et suivre l'assiduité

**Champs disponibles :**
- **Présence** : Présent, Absent, Retard, Absent Excusé
- **Raison absence** (si absent) : Maladie, Blessure, Cours/Études, Familial, Autre

**Quand l'utiliser :**
- 📅 **Tous les jours** au début de chaque séance
- ✅ Pour calculer le taux de présence
- 📊 Pour suivi administratif

**Exemple d'utilisation :**
```
Appel du 24/11/2025 - Séance 18h00
Nageur 1 : Présent
Nageur 2 : Absent (Raison: Cours/Études)
Nageur 3 : Retard (arrivé 18h15)
Nageur 4 : Absent Excusé (Raison: Familial)
```

---

## 🔧 MODE D'EMPLOI DÉTAILLÉ

### Procédure de saisie collective :

#### **Étape 1 : Choisir le type de données**
1. Cliquez sur le bouton circulaire **"Saisie Collective"**
2. Sélectionnez l'un des 7 types (exemple: **Bien-être**)

#### **Étape 2 : Remplir les données**
1. Une **carte par nageur** s'affiche
2. La **date du jour** est pré-remplie (modifiable)
3. Remplissez les champs pour chaque nageur

**Astuces :**
- ✅ **Champs vides ignorés** : Pas besoin de tout remplir pour tous les nageurs
- ⏩ **Remplissage rapide** : Utilisez la touche `Tab` pour passer d'un champ à l'autre
- 📱 **Responsive** : Fonctionne sur tablette et smartphone

#### **Étape 3 : Enregistrer**
1. Cliquez sur **"Enregistrer pour X nageurs"** en bas du formulaire
2. Un message de confirmation apparaît
3. Les données sont enregistrées dans le dashboard de chaque nageur

#### **Étape 4 : Vérification**
- Les **analyses d'équipe** se mettent à jour automatiquement
- Vous pouvez aller sur le **dashboard individuel** de chaque nageur pour voir les données

---

## 📈 SYNCHRONISATION AUTOMATIQUE

### Où sont enregistrées les données ?

Les données saisies en collectif sont **automatiquement synchronisées** :

1. **Dashboard Individuel Nageur**
   - Les données apparaissent dans l'historique du nageur
   - Les graphiques se mettent à jour
   - Les statistiques personnelles sont recalculées

2. **Analyses d'Équipe**
   - Section "Vue d'Ensemble Globale" : Mise à jour des moyennes
   - Section "Bien-être & Condition" : Analyses collectives
   - Section "Performance Physique" : Statistiques d'équipe
   - Section "Suivi Médical" : Taux de disponibilité
   - Section "Compétition" : Résultats collectifs
   - Section "Évaluation Technique" : Moyennes par nage
   - Section "Présence" : Taux d'assiduité

3. **Statistiques Rapides** (en haut de l'interface équipe)
   - Nombre de sessions totales
   - Taux de présence moyen
   - Bien-être moyen
   - Charge d'entraînement collective

---

## 💡 BONNES PRATIQUES

### 📅 Routine quotidienne recommandée :

**Matin (avant la séance) :**
1. ✅ **Présence** : Faire l'appel (30 secondes par équipe)
2. 😊 **Bien-être** : Évaluer l'état des nageurs (2 minutes)
3. 🏥 **Médical** : Noter les absences et raisons (1 minute)

**Fin de séance :**
1. 🏊 **Entraînement** : Enregistrer volume, RPE, type (2 minutes)

**Hebdomadaire :**
1. 💪 **Performance** : Tests physiques tous les 15 jours
2. 📋 **Technique** : Évaluation technique 1-2 fois/semaine

**Après compétition :**
1. 🏅 **Compétition** : Enregistrer tous les résultats (5 minutes)

---

## 🎯 CAS D'USAGE PRATIQUES

### **Cas 1 : Séance d'entraînement classique**

**Situation :** Séance de 18h00 avec 12 nageurs

**Actions :**
1. **18h00** : Appel (Présence) → 30 secondes
2. **18h05** : Évaluation bien-être → 2 minutes
3. **19h30** : Fin de séance, saisie entraînement → 2 minutes

**Temps total :** **5 minutes** pour toute l'équipe

---

### **Cas 2 : Compétition du week-end**

**Situation :** 10 nageurs ont participé à une compétition

**Actions :**
1. Lundi soir, ouvrir **Saisie Collective → Compétition**
2. Pour chaque nageur : Nage, Distance, Temps, Classement
3. Enregistrer

**Temps total :** **5-10 minutes** selon le nombre de courses

**Résultat :**
- Historique complet dans le dashboard de chaque nageur
- Analyses de progression automatiques
- Statistiques d'équipe mises à jour

---

### **Cas 3 : Tests physiques mensuels**

**Situation :** Évaluation physique mensuelle

**Actions :**
1. Organiser les 4 tests : VMA, Saut, Pompes, Gainage
2. Noter les résultats sur papier
3. Ouvrir **Saisie Collective → Performance**
4. Saisir tous les résultats en une fois

**Temps total :** **3 minutes de saisie** pour 12 nageurs

**Avantages :**
- Comparaison immédiate entre nageurs
- Graphiques d'évolution automatiques
- Détection des progressions/régressions

---

## ⚠️ DÉPANNAGE

### **Problème : Les données ne s'enregistrent pas**

**Solutions :**
1. Vérifiez que la **date est renseignée**
2. Remplissez **au moins un champ** pour chaque nageur
3. Vérifiez la **connexion internet** (si utilisation en ligne)
4. Effacez le cache du navigateur et rechargez

---

### **Problème : Les données n'apparaissent pas dans le dashboard nageur**

**Solutions :**
1. Actualisez la page du dashboard nageur (F5)
2. Vérifiez que vous avez sélectionné **le bon nageur**
3. Vérifiez la **date de saisie**

---

### **Problème : Je ne vois pas tous les nageurs**

**Solutions :**
1. Vérifiez que l'**équipe est bien sélectionnée**
2. Vérifiez que des **nageurs sont affectés** à cette équipe
3. Rechargez la page équipe

---

## 📊 INDICATEURS DE RÉUSSITE

### Comment savoir si le système fonctionne bien ?

✅ **Après chaque saisie collective :**
- Message de confirmation : "✅ Données enregistrées pour X nageurs"
- Les statistiques rapides d'équipe se mettent à jour
- Les sections d'analyse affichent les nouvelles données

✅ **Dans le dashboard individuel :**
- Les données apparaissent dans l'historique
- Les graphiques se mettent à jour
- Les moyennes sont recalculées

---

## 🎓 FORMATION RAPIDE (5 MINUTES)

### Pour former un nouvel entraîneur :

1. **Démonstration** (2 min)
   - Montrer comment accéder à la saisie collective
   - Remplir un exemple avec 2-3 nageurs
   - Montrer le résultat dans un dashboard nageur

2. **Pratique** (2 min)
   - Laisser l'entraîneur saisir des données de test
   - Vérifier que les données apparaissent correctement

3. **Routine** (1 min)
   - Expliquer la routine quotidienne recommandée
   - Montrer où trouver les analyses d'équipe

---

## 📞 SUPPORT

### Besoin d'aide ?

- 📖 Consultez ce guide
- 🔍 Vérifiez la section "Dépannage"
- 📧 Contactez l'administrateur système

---

## ✨ NOUVEAUTÉS À VENIR

### Fonctionnalités en développement :

- 📱 **Application mobile dédiée**
- 📤 **Export Excel/PDF** des données collectives
- 📧 **Notifications automatiques** aux nageurs absents
- 📊 **Tableaux de bord personnalisables**
- 🔔 **Alertes** en cas de baisse de performance ou bien-être

---

**Développé par :** GitHub Copilot (Claude Sonnet 4.5)  
**Version :** 2.0  
**Date de mise à jour :** 24 Novembre 2025  
**Dernière révision :** Système de saisie collective complet avec 7 types de données

---

## 📋 RÉCAPITULATIF VISUEL

```
┌─────────────────────────────────────────────────────┐
│           INTERFACE ÉQUIPE - DASHBOARD              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Sélectionner Équipe ▼]  🔵 Saisie Collective    │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  📊 Stats Rapides                          │   │
│  │  • 12 Nageurs  • 85% Présence  • 7.5/10    │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌─── SAISIE COLLECTIVE (après clic) ───────┐     │
│  │                                            │     │
│  │  😊 Bien-être    🏊 Entraînement           │     │
│  │  💪 Performance  🏥 Médical                │     │
│  │  🏅 Compétition  📋 Technique              │     │
│  │  ✅ Présence                                │     │
│  │                                            │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌─── FORMULAIRE COLLECTIF ──────────────────┐     │
│  │  📅 Date: [24/11/2025]                     │     │
│  │                                            │     │
│  │  👤 Nageur 1: [Champs à remplir]          │     │
│  │  👤 Nageur 2: [Champs à remplir]          │     │
│  │  👤 Nageur 3: [Champs à remplir]          │     │
│  │  ...                                       │     │
│  │                                            │     │
│  │  [Enregistrer pour 12 nageurs]            │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
         ⬇️ SYNCHRONISATION AUTOMATIQUE ⬇️
┌─────────────────────────────────────────────────────┐
│        DASHBOARD INDIVIDUEL (pour chaque nageur)    │
├─────────────────────────────────────────────────────┤
│  • Données ajoutées à l'historique                  │
│  • Graphiques mis à jour                            │
│  • Statistiques recalculées                         │
│  • Analyses actualisées                             │
└─────────────────────────────────────────────────────┘
```

---

**🎉 Félicitations ! Vous êtes prêt à utiliser la saisie collective efficacement !**
