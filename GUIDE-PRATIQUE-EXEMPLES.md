# 📚 GUIDE PRATIQUE - EXEMPLES CONCRETS D'UTILISATION

> **Documentation pratique du système de monitoring de nageurs**  
> Exemples réels de collecte → traitement → analyse → retours

---

## 🎯 SCÉNARIO 1 : SUIVI INDIVIDUEL (Sophie Martin)

### Contexte
**Nageuse** : Sophie Martin, 19 ans, Spécialité Crawl  
**Objectif** : Préparation championnat régional dans 6 semaines  
**Mode** : Dashboard Individuel (dashboard.html)

---

### SEMAINE 1 : Collecte des données de base

#### Lundi 18/11 - Saisie Bien-être
```
📝 FORMULAIRE BIEN-ÊTRE
┌─────────────────────────────┐
│ Date : 2025-11-18           │
│ Sommeil : 4/5 ✅            │
│ Fatigue : 3/5 ✅            │
│ Douleur : 1/5 ✅            │
│ Stress  : 2/5 ✅            │
└─────────────────────────────┘
```

**Action utilisateur** :
1. Clic sur onglet "Saisie"
2. Carte "Bien-être" → Bouton "Saisir"
3. Remplir formulaire
4. Bouton "Enregistrer"

**Résultat stocké** :
```javascript
swimmer.wellbeingData.push({
    date: '2025-11-18',
    sleep: 4,
    fatigue: 3,
    pain: 1,
    stress: 2
})
```

---

#### Lundi 18/11 - Saisie Entraînement (après séance)
```
📝 FORMULAIRE ENTRAÎNEMENT
┌─────────────────────────────┐
│ Date          : 2025-11-18  │
│ Volume (min)  : 90 min      │
│ Volume (m)    : 4500 m      │
│ RPE (1-10)    : 8           │
│ Charge calculée : 720 ✅    │
└─────────────────────────────┘
```

**Calcul automatique** :
```
Charge = 90 × 8 = 720
```

**Résultat stocké** :
```javascript
swimmer.trainingData.push({
    date: '2025-11-18',
    volume: 90,
    volumeMeters: 4500,
    rpe: 8,
    load: 720
})
```

---

#### Mercredi 20/11 - Saisie Performance (test VMA)
```
📝 FORMULAIRE PERFORMANCE
┌─────────────────────────────┐
│ Date : 2025-11-20           │
│ VMA 6min    : 15.2 km/h     │
│ Force épaule : 18 kg        │
│ Force pectoraux : 22 kg     │
│ Force jambes : 25 kg        │
└─────────────────────────────┘
```

**Résultat stocké** :
```javascript
swimmer.performanceData.push({
    date: '2025-11-20',
    vma: 15.2,
    shoulderStrength: 18,
    chestStrength: 22,
    legStrength: 25
})
```

---

#### Samedi 23/11 - Saisie Course (Compétition)
```
📝 FORMULAIRE COURSES
┌─────────────────────────────────────┐
│ Date : 2025-11-23                   │
│ Événement : Piscine Adarissa        │
│                                     │
│ Course 1:                           │
│ ├─ Style : Crawl                    │
│ ├─ Distance : 50m                   │
│ └─ Temps : 00:26.45                 │
│                                     │
│ Course 2:                           │
│ ├─ Style : Crawl                    │
│ ├─ Distance : 100m                  │
│ └─ Temps : 00:58.12                 │
│                                     │
│ Course 3:                           │
│ ├─ Style : Crawl                    │
│ ├─ Distance : 200m                  │
│ └─ Temps : 02:05.34                 │
└─────────────────────────────────────┘
```

**Résultat stocké** :
```javascript
swimmer.raceData.push({
    date: '2025-11-23',
    event: 'Piscine Adarissa',
    races: [
        {style: 'Crawl', distance: '50m', time: '00:26.45'},
        {style: 'Crawl', distance: '100m', time: '00:58.12'},
        {style: 'Crawl', distance: '200m', time: '02:05.34'}
    ]
})
```

---

### APRÈS 2 SEMAINES : Traitement et Analyse automatique

**Données accumulées** :
- 14 entrées bien-être (quotidiennes)
- 10 entrées entraînement (séances)
- 2 tests performance
- 1 compétition (3 courses)

#### Traitement automatique

**1. Analyse Bien-être** :
```javascript
analyzeWellbeing(swimmer.wellbeingData)

Résultat:
{
    status: 'good',
    recent: {sleep: 4, fatigue: 3, pain: 1, stress: 2},
    averages: {
        sleep: 4.2,    // Moyenne sur 14 jours
        fatigue: 2.8,
        pain: 1.3,
        stress: 2.1
    },
    trend: +0.15  // Tendance légèrement positive
}
```

**Interprétation** :
- ✅ Sommeil moyen 4.2/5 → BON
- ✅ Fatigue moyenne 2.8/5 → BON
- ✅ Douleur moyenne 1.3/5 → EXCELLENT
- ✅ Trend positif → AMÉLIORATION

---

**2. Analyse Entraînement** :
```javascript
analyzeTraining(swimmer.trainingData)

Résultat:
{
    status: 'good',
    averages: {
        volume: 87,      // Moyenne 87 min
        rpe: 7.6,        // Intensité moyenne
        load: 661        // Charge moyenne
    },
    monotony: 1.8,       // ✅ < 2.0 (bonne variété)
    trend: +0.12         // Charge en légère augmentation
}
```

**Formule Monotonie** :
```
Charges : [720, 630, 640, 525, 680, 700, 595, 750, 680, 690]
Moyenne : 661
Écart-type : 367
Monotonie = 661 ÷ 367 = 1.8 ✅ (< 2.0 = BON)
```

**Interprétation** :
- ✅ Monotonie 1.8 → Bonne variété
- ✅ Charge moyenne 661 → Équilibrée
- ✅ Trend positif → Progression contrôlée

---

**3. Analyse Performance** :
```javascript
analyzePerformance(swimmer.performanceData)

Résultat:
{
    status: 'good',
    recent: {vma: 15.2, shoulder: 18, chest: 22, legs: 25},
    trends: {
        vma: +0.3,        // +0.3 km/h en 2 semaines ✅
        shoulder: +1.5,   // +1.5 kg
        chest: +2.0,      // +2.0 kg
        legs: +3.0        // +3.0 kg
    }
}
```

**Interprétation** :
- ✅ VMA : 14.9 → 15.2 km/h (progression)
- ✅ Forces : toutes en augmentation
- ✅ Condition physique en amélioration

---

**4. Analyse Courses** :
```javascript
analyzeRacePerformances(swimmer.raceData)

Résultat:
{
    status: 'good',
    totalRaces: 3,
    personalBests: ['Crawl 50m : 00:26.45'],  // 🏆 RECORD !
    improvements: [
        {desc: 'Crawl 100m', value: '2.3', percent: true}  // +2.3%
    ],
    regressions: []
}
```

**Détection record** :
```
Crawl 50m :
- Précédent meilleur : 00:26.89
- Temps actuel : 00:26.45
- Différence : -0.44s
→ 🏆 RECORD PERSONNEL !
```

**Interprétation** :
- 🏆 1 record personnel battu
- 📈 Amélioration 100m (+2.3%)
- ✅ Aucune régression

---

### GÉNÉRATION DES RETOURS PERSONNALISÉS

```javascript
generateRecommendations(analysis, swimmer)
```

**Résultat affiché dans l'interface** :

```
┌────────────────────────────────────────────────────────────────┐
│         📊 Retour Personnalisé pour Sophie Martin              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STATUT GÉNÉRAL : ✅ Situation favorable                        │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  DÉTAILS PAR DOMAINE :                                          │
│                                                                 │
│  😊 Bien-être : ✅ Bon état général                            │
│     • Sommeil : 4.2/5 (excellent)                              │
│     • Fatigue : 2.8/5 (bien géré)                              │
│     • Douleur : 1.3/5 (quasi-nulle)                            │
│     • Stress : 2.1/5 (faible)                                  │
│                                                                 │
│  📊 Entraînement : ✅ Charge équilibrée                        │
│     • Volume moyen : 87 min                                    │
│     • Intensité moyenne : 7.6/10                               │
│     • Monotonie : 1.8 (variété excellente)                     │
│     • Charge : 661 (optimale)                                  │
│                                                                 │
│  💪 Performance : ✅ Progression constante                      │
│     • VMA : 15.2 km/h (+0.3 km/h ↗️)                           │
│     • Forces : toutes en augmentation                          │
│     • Condition physique : amélioration continue               │
│                                                                 │
│  🏊 Courses : 🏆 Excellent                                      │
│     • 1 RECORD PERSONNEL battu (Crawl 50m)                     │
│     • Amélioration Crawl 100m : +2.3%                          │
│     • Aucune régression détectée                               │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  💡 RECOMMANDATIONS :                                           │
│                                                                 │
│  1. 🏆 Félicitations pour le record personnel Crawl 50m !      │
│     Continue sur cette lancée !                                │
│                                                                 │
│  2. 📈 Excellente progression VMA (+0.3 km/h en 2 semaines).   │
│     Prévoir un nouveau test dans 2 semaines pour confirmer.    │
│                                                                 │
│  3. ✅ Équilibre trouvé entre charge et récupération.          │
│     Maintenir cette variété d'entraînement (monotonie: 1.8).   │
│                                                                 │
│  4. 💪 Renforcement musculaire payant (forces en hausse).      │
│     Continuer les exercices de force 2-3x/semaine.             │
│                                                                 │
│  5. 🎯 Prochains objectifs :                                    │
│     • Viser 00:26.20 sur Crawl 50m                             │
│     • Améliorer 200m (temps encore perfectible)                │
│     • Maintenir bien-être actuel                               │
│                                                                 │
│  6. ⚠️ Point de vigilance :                                     │
│     Légère augmentation de la charge d'entraînement détectée.  │
│     Surveiller sommeil et fatigue cette semaine.               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### VISUALISATIONS GRAPHIQUES

**Graphique 1 : Évolution Bien-être** (Ligne multiple)
```
  5 ┤      ●─●─●─●─●─●─●─●─●─●─●─●─●─●  Sommeil
    │     ●   ●   ●   ●   ●   ●   ●     Fatigue
  3 ┤   ●   ●   ●   ●   ●   ●   ●       Douleur
    │ ●   ●   ●   ●   ●   ●   ●         Stress
  1 ┤─●─●─●─●─●─●─●─●─●─●─●─●─●─●
    └─────────────────────────────────
    18/11          →          23/11
```

**Graphique 2 : Volume & RPE** (Double-axe)
```
Volume (m)                         RPE
5000 ┤                            10
     │  ███                        
4000 │  ███ ███ ███ ███ ███       8
     │  ███ ███ ███ ███ ███       
3000 │  ███ ███ ███ ███ ███       6
     │      ─── ─── ─── ───       
2000 │                             4
     └──────────────────────
     18/11    →    23/11
```

**Graphique 3 : Radar Performance** (Comparaison 2 tests)
```
        VMA
         ●────●  Test 2 (20/11)
        /      \
       /        \
   Épaule ●────● Pectoraux
       \        /
        \      /
         ●────●
        Jambes

Test 1 (06/11) : Ligne bleue
Test 2 (20/11) : Ligne verte (expansion = progression)
```

---

## 🎯 SCÉNARIO 2 : GESTION D'ÉQUIPE (Équipe Élite)

### Contexte
**Équipe** : Équipe Élite (4 nageurs)  
**Composition** :
- Sophie Martin (19F, Crawl)
- Lucas Dubois (21M, Papillon)
- Emma Bernard (18F, Dos)
- Thomas Petit (20M, Brasse)

**Objectif** : Préparation championnats régionaux  
**Mode** : Gestion Équipe (equipe.html)

---

### SEMAINE 1 : Saisie Groupée

#### Lundi 18/11 - Présences
```
📝 FEUILLE DE PRÉSENCE
┌─────────────────────────────────────────┐
│ Date : 2025-11-18                       │
│ Séance : Matin (08h-10h)                │
│                                         │
│ ☑ Sophie Martin     → Présent           │
│ ☑ Lucas Dubois      → Présent           │
│ ☐ Emma Bernard      → Absent (Justifié) │
│ ☑ Thomas Petit      → Retard (15 min)   │
└─────────────────────────────────────────┘
```

**Résultat stocké** :
```javascript
swimmers.forEach(swimmer => {
    swimmer.attendance.records.push({
        date: '2025-11-18',
        session: 'morning',
        status: 'present' | 'absent' | 'late',
        lateMinutes: 15,  // Si retard
        reason: 'Transport',
        justified: true
    });
});
```

---

#### Lundi 18/11 - Bien-être Groupé
```
📝 TABLEAU BIEN-ÊTRE COLLECTIF
┌──────────────────────────────────────────────────────────────┐
│ Nageur          │ Sommeil │ Fatigue │ Douleur │ Stress │     │
├──────────────────────────────────────────────────────────────┤
│ Sophie Martin   │    4    │    3    │    1    │    2   │ ✅  │
│ Lucas Dubois    │    3    │    5    │    3    │    4   │ ⚠️  │
│ Emma Bernard    │    5    │    2    │    1    │    1   │ ✅  │
│ Thomas Petit    │    4    │    4    │    2    │    3   │ ✅  │
└──────────────────────────────────────────────────────────────┘
        [Enregistrer pour tous] 
```

**Action** : 1 clic enregistre les 4 nageurs simultanément

**Résultat** : `saveBulkWellbeing()` boucle sur tous les nageurs
```javascript
team.swimmers.forEach(swimmerId => {
    swimmer.wellbeingData.push({
        date: '2025-11-18',
        sleep: document.getElementById(`sleep_${swimmerId}`).value,
        fatigue: document.getElementById(`fatigue_${swimmerId}`).value,
        // ...
    });
});
```

---

#### Mercredi 20/11 - Entraînement Groupé
```
📝 TABLEAU ENTRAÎNEMENT COLLECTIF
┌────────────────────────────────────────────────────────────────┐
│ Nageur          │ Volume  │ Mètres │ RPE │ Charge │           │
├────────────────────────────────────────────────────────────────┤
│ Sophie Martin   │  90 min │ 4500m  │  8  │  720   │ ✅ Optimal│
│ Lucas Dubois    │  85 min │ 4200m  │  9  │  765   │ ⚠️ Élevé  │
│ Emma Bernard    │  80 min │ 4000m  │  7  │  560   │ ✅ Modéré │
│ Thomas Petit    │  70 min │ 3500m  │  6  │  420   │ ⚠️ Faible │
└────────────────────────────────────────────────────────────────┘
        [Enregistrer pour tous]
```

**Calcul automatique par nageur** :
- Sophie : 90 × 8 = 720
- Lucas : 85 × 9 = 765 ⚠️ (élevé)
- Emma : 80 × 7 = 560
- Thomas : 70 × 6 = 420 ⚠️ (faible)

---

### APRÈS 2 SEMAINES : Analyse Collective

#### Vue d'ensemble équipe

```javascript
calculateDetailedTeamAnalysis(swimmers)

Résultat:
{
    avgVMA: 14.8,              // Moyenne équipe
    performanceTrend: 'Stable',
    avgProgression: '+0.0%',
    attendanceRate: 92,         // 92% présence
    absenceCount: 8,            // 8 absences totales
    alerts: [
        {
            icon: '⚠️',
            title: 'Fatigue élevée',
            message: '2 nageur(s) avec fatigue ≥ 7/10'
        },
        {
            icon: '🏥',
            title: 'Blessure active',
            message: 'Lucas Dubois - Douleur épaule (niveau 4)'
        }
    ]
}
```

---

#### Génération Plan d'Action Collectif

```javascript
generateTeamRecommendations(swimmers, team)
```

**Résultat affiché** :

```
┌────────────────────────────────────────────────────────────────┐
│            💡 RECOMMANDATIONS ÉQUIPE ÉLITE                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  RECOMMANDATIONS GÉNÉRALES                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  🏆 Excellent niveau                                            │
│     VMA moyenne de 14.8 km/h - équipe performante              │
│                                                                 │
│  📊 Assiduité correcte                                          │
│     Taux de présence : 92% (objectif > 95%)                    │
│                                                                 │
│  ⚠️ Points de vigilance                                         │
│     • 2 nageurs avec fatigue élevée (≥7/10)                    │
│     • Volume d'entraînement hétérogène                         │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ALERTES INDIVIDUELLES PRIORITAIRES                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  🔴 Lucas Dubois (Papillon)                                     │
│     ├─ Fatigue élevée : 8/10                                   │
│     ├─ Douleur épaule : 4/5                                    │
│     ├─ Charge excessive : 765 (moyenne : 661)                  │
│     └─ 💡 Action : Repos 2 jours + consultation médecin        │
│                                                                 │
│  🟠 Thomas Petit (Brasse)                                       │
│     ├─ Volume faible : 70 min (vs moyenne : 87 min)            │
│     ├─ Charge insuffisante : 420                               │
│     ├─ 3 absences en 2 semaines                                │
│     └─ 💡 Action : Entretien individuel + plan rattrapage      │
│                                                                 │
│  🟢 Sophie Martin (Crawl)                                       │
│     ├─ Performance excellente                                  │
│     ├─ Record personnel 50m Crawl                              │
│     └─ 💡 Action : Maintenir dynamique actuelle                │
│                                                                 │
│  🟢 Emma Bernard (Dos)                                          │
│     ├─ Bien-être optimal (tous indicateurs verts)              │
│     ├─ Progression régulière                                   │
│     └─ 💡 Action : Poursuivre programme                        │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  PLAN D'ACTION COLLECTIF (Semaine prochaine)                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  ☐ LUNDI                                                        │
│     🏊 Séance technique collective (focus virages)             │
│     📋 Bilan individuel : Lucas + Thomas                       │
│                                                                 │
│  ☐ MARDI                                                        │
│     💪 Renforcement musculaire (groupe)                        │
│     🩺 Lucas : Consultation médecin sports                     │
│                                                                 │
│  ☐ MERCREDI                                                     │
│     🏊 Entraînement fractionné (haute intensité)               │
│     📊 Point présence avec Thomas                              │
│                                                                 │
│  ☐ JEUDI                                                        │
│     🏊 Séance récupération active (tous)                       │
│     💪 Sophie + Emma : préparation compétition                 │
│                                                                 │
│  ☐ VENDREDI                                                     │
│     📊 Test VMA collectif                                      │
│     🎯 Définition objectifs championnats                       │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  OBJECTIFS                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  🎯 COURT TERME (2 semaines)                                    │
│     ├─ Augmenter VMA moyenne à 15 km/h                         │
│     ├─ Réduire fatigue moyenne < 5/10                          │
│     ├─ Résoudre problème épaule Lucas                          │
│     └─ Améliorer assiduité Thomas (objectif 95%)              │
│                                                                 │
│  🎯 MOYEN TERME (6 semaines - Championnats)                    │
│     ├─ 3 nageurs qualifiés championnats                        │
│     ├─ Améliorer technique papillon Lucas (+1.5 pts)          │
│     ├─ 5 records personnels minimum                            │
│     └─ Harmoniser volumes d'entraînement                       │
│                                                                 │
│  🎯 LONG TERME (Saison)                                         │
│     ├─ Top 10 régional                                         │
│     ├─ Records personnels pour 80% de l'équipe                 │
│     ├─ Aucune blessure grave                                   │
│     └─ Taux présence maintenu > 95%                            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### GRAPHIQUES COLLECTIFS

**Graphique 1 : VMA Collective** (Superposition des courbes)
```
VMA (km/h)
16.0 ┤       ●──●──●  Sophie (Crawl)
     │      ●─●─●     Emma (Dos)
15.0 │     ●──●──●    Lucas (Papillon)
     │    ●───●───●   Thomas (Brasse)
14.0 │   ●────●────●
     │  ●─────●─────●
13.0 │
     └─────────────────────────────
     06/11    →    20/11
```

**Interprétation** :
- Sophie et Emma : progression régulière ✅
- Lucas : stagnation (probablement dû à blessure) ⚠️
- Thomas : progression lente ⚠️

---

**Graphique 2 : Bien-être Moyen Équipe** (Moyennes agrégées)
```
Score (0-10)
  5 ┤  ●─●─●─●─●─●─●─●─●─●─●─●─●  Sommeil
    │ ●   ●   ●   ●   ●   ●   ●    Fatigue
  3 │●   ●   ●   ●   ●   ●   ●     Douleur
    │   ●   ●   ●   ●   ●   ●       Stress
  1 ┤─●─●─●─●─●─●─●─●─●─●─●─●─●
    └─────────────────────────────
    18/11          →          23/11

Moyennes équipe (4 nageurs) :
- Sommeil : 4.0 ✅
- Fatigue : 3.5 ⚠️ (limite haute)
- Douleur : 1.8 ✅
- Stress : 2.5 ✅
```

---

**Graphique 3 : Classement Interne** (Tableau)
```
┌────────────────────────────────────────────────────────┐
│              🏆 CLASSEMENT VMA ÉQUIPE                  │
├────┬─────────────────┬───────┬─────────────────────────┤
│ # │ Nageur          │  VMA  │ Évolution               │
├────┼─────────────────┼───────┼─────────────────────────┤
│ 1  │ Sophie Martin   │ 15.2  │ 📈 +0.3 km/h           │
│ 2  │ Emma Bernard    │ 15.0  │ 📈 +0.2 km/h           │
│ 3  │ Lucas Dubois    │ 14.8  │ → Stable               │
│ 4  │ Thomas Petit    │ 14.2  │ 📉 -0.1 km/h           │
└────┴─────────────────┴───────┴─────────────────────────┘

Moyenne équipe : 14.8 km/h
Objectif : 15.0 km/h
```

---

## 🔄 SCÉNARIO 3 : DÉTECTION AUTOMATIQUE DE PROBLÈMES

### Cas 1 : Détection Surentraînement

**Données Lucas (Semaine 3)** :
```
Bien-être quotidien :
- Sommeil : 2, 2, 3, 2, 2, 1, 2  (moyenne: 2.0) 🔴
- Fatigue : 7, 8, 8, 9, 8, 8, 9  (moyenne: 8.1) 🔴
- Douleur : 4, 4, 5, 5, 4, 5, 5  (moyenne: 4.6) 🔴

Entraînement :
- Volume : 90, 95, 100, 95, 100, 95, 100 (moyenne: 96.4)
- RPE : 9, 9, 10, 9, 10, 9, 10 (moyenne: 9.4)
- Charge : 810, 855, 1000, 855, 1000, 855, 1000 (moyenne: 910) 🔴
- Monotonie : 0.95 / 0.08 = 11.9 🔴🔴🔴 (>> 2.5)
```

**Traitement automatique** :

```javascript
analyzeSwimmerData(lucas)

Résultat:
{
    wellbeing: {
        status: 'poor',  // 🔴 ALERTE
        recent: {sleep: 2, fatigue: 9, pain: 5, stress: 4},
        message: 'État critique - intervention nécessaire'
    },
    training: {
        status: 'poor',  // 🔴 ALERTE
        monotony: 11.9,   // 🔴 TRÈS ÉLEVÉ (normal < 2.5)
        avgLoad: 910,     // 🔴 TROP ÉLEVÉ (normal < 800)
        message: 'Risque majeur de surentraînement'
    }
}
```

**Génération alertes prioritaires** :

```javascript
generateRecommendations(analysis, lucas)

Résultat:
[
    "🚨 URGENCE - Signes graves de surentraînement détectés",
    "⛔ ARRÊT IMMÉDIAT entraînement pendant 3-5 jours",
    "🩺 Consultation médecin du sport OBLIGATOIRE",
    "🛌 Prioriser sommeil : objectif 8-9h/nuit",
    "💊 Contrôle inflammation (douleur élevée: 5/5)",
    "📊 Monotonie critique (11.9 >> 2.5) - routine trop répétitive",
    "⚠️ Charge excessive (910 >> 800) - réduire intensité 50%",
    "🔄 Après repos : reprise progressive (30% → 50% → 70%)"
]
```

**Affichage dans l'interface** :

```
┌────────────────────────────────────────────────────────────────┐
│  🚨 ALERTE CRITIQUE - Lucas Dubois (Papillon)                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 STATUT : SURENTRAÎNEMENT AVÉRÉ                             │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  INDICATEURS CRITIQUES :                                        │
│                                                                 │
│  🔴 Sommeil : 2.0/5 (seuil alerte: < 2)                        │
│  🔴 Fatigue : 8.1/5 (seuil alerte: > 4)                        │
│  🔴 Douleur : 4.6/5 (seuil alerte: > 3)                        │
│  🔴 Charge : 910 (seuil alerte: > 800)                         │
│  🔴 Monotonie : 11.9 (seuil alerte: > 2.5) ⚠️⚠️⚠️             │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  🚨 ACTIONS IMMÉDIATES REQUISES :                              │
│                                                                 │
│  1. ⛔ ARRÊT COMPLET entraînement (3-5 jours minimum)          │
│  2. 🩺 Consultation médecin du sport (URGENT)                  │
│  3. 🛌 Repos prioritaire : 8-9h sommeil/nuit                   │
│  4. 💊 Suivi douleurs (anti-inflammatoires si prescrit)        │
│  5. 📞 Contact entraîneur principal (aujourd'hui)              │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│  📋 PLAN DE REPRISE (APRÈS repos complet) :                    │
│                                                                 │
│  Semaine 1 : 30% volume habituel, RPE ≤ 5                     │
│  Semaine 2 : 50% volume habituel, RPE ≤ 6                     │
│  Semaine 3 : 70% volume habituel, RPE ≤ 7                     │
│  Semaine 4+ : Reprise normale si indicateurs OK               │
│                                                                 │
│  ⚠️ Surveillance quotidienne bien-être pendant 4 semaines      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Notification entraîneur (mode équipe)** :

```
🚨 ALERTE PRIORITAIRE - Équipe Élite

Lucas Dubois : SURENTRAÎNEMENT DÉTECTÉ
Monotonie : 11.9 (>> 2.5)
Fatigue : 8.1/5
Action : ARRÊT IMMÉDIAT recommandé

Consulter interface pour plan détaillé.
```

---

### Cas 2 : Détection Blessure Émergente

**Données Emma (Semaine 2)** :
```
Bien-être :
- Douleur : 1, 1, 2, 2, 3, 4, 4  (progression rapide) ⚠️
- Localisation (notes) : "Épaule droite"

Performance :
- Force épaule : 20 → 19 → 17 kg (régression) ⚠️
```

**Détection automatique** :

```javascript
analyzeWellbeing(emma.wellbeingData)

// Détection trend douleur
trend = calculateTrend([1, 1, 2, 2, 3, 4, 4])
// trend = +3.0 (forte augmentation)

if (trend > 2.0 && recentPain >= 4) {
    status = 'warning';  // ⚠️ SURVEILLANCE
    recommendations.push(
        "⚠️ Douleur en augmentation rapide (+3 points en 7 jours)",
        "🩺 Consulter médecin/kiné avant aggravation",
        "📊 Réduire exercices sollicitant zone douloureuse"
    );
}
```

**Affichage** :

```
┌────────────────────────────────────────────────────────────────┐
│  ⚠️ SURVEILLANCE REQUISE - Emma Bernard (Dos)                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟠 STATUT : Blessure émergente probable                       │
│                                                                 │
│  ÉVOLUTION DOULEUR (7 derniers jours) :                        │
│  1 → 1 → 2 → 2 → 3 → 4 → 4  (📈 +300% en 1 semaine)           │
│                                                                 │
│  INDICATEURS :                                                  │
│  • Localisation : Épaule droite                                │
│  • Force épaule : 20 → 17 kg (-15%) ⚠️                         │
│  • Augmentation rapide : +3 points                             │
│                                                                 │
│  💡 RECOMMANDATIONS PRÉVENTIVES :                              │
│                                                                 │
│  1. 🩺 Consultation kiné/médecin (cette semaine)              │
│  2. 🏊 Modifier technique dos (moins solliciter épaule)        │
│  3. 💪 Arrêt exercices force épaule (temporaire)              │
│  4. 🧊 Protocole RICE (Repos, Glace, Compression, Élévation)  │
│  5. 📊 Surveillance quotidienne douleur (objectif: < 2)       │
│                                                                 │
│  ⚠️ Si douleur persiste > 3/5 après 3 jours → Arrêt total     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## ✅ CONCLUSION : LOGIQUE COMPLÈTE DÉMONTRÉE

### Récapitulatif du Pipeline

```
1. COLLECTE
   ├─ Individuel : Modale popup (1 nageur)
   └─ Équipe : Tableau groupé (4 nageurs simultanés)
   
2. TRAITEMENT
   ├─ Calculs automatiques (charge, monotonie, trends)
   ├─ Détection anomalies (seuils scientifiques)
   └─ Agrégation (moyennes équipe)
   
3. VISUALISATION
   ├─ 6 types de graphiques Chart.js
   ├─ Badges de statut (vert/orange/rouge)
   └─ Tableaux comparatifs
   
4. RETOURS
   ├─ Individuel : Recommandations ultra-ciblées
   ├─ Équipe : Plan d'action collectif + alertes prioritaires
   └─ Alertes critiques : Détection surentraînement/blessures
```

### Cohérence Totale Vérifiée

✅ **Même structure de données** Individuel/Équipe  
✅ **Algorithmes scientifiques** (monotonie, charge, trends)  
✅ **Détection automatique** problèmes (surentraînement, blessures)  
✅ **Recommandations pertinentes** selon contexte  
✅ **Visualisations claires** (graphiques + badges)  
✅ **Extensibilité** facile (ajout nouveaux types de données)

**Le système respecte parfaitement la logique de monitoring professionnelle !**

---

*Guide pratique généré le 18 Novembre 2025 - Exemples concrets d'utilisation*
