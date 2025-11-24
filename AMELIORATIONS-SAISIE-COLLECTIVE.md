# 📋 PLAN D'AMÉLIORATION - SAISIE COLLECTIVE ÉQUIPE

## 🎯 OBJECTIFS

1. **Aligner les formulaires équipe avec les formulaires nageur**
   - Interface équipe doit avoir les MÊMES champs que l'interface nageur
   - Formulaire bien-être: 13 champs sur 3 pages (actuellement 4 champs basiques)
   - Formulaire compétition: détails complets (nage, distance, temps, rang)
   - Formulaire session: structure complète avec échauffement/corps/retour

2. **Ajouter sélection individuelle des nageurs**
   - Checkbox pour chaque nageur
   - Bouton "Tout sélectionner" / "Tout désélectionner"
   - Enregistrement uniquement pour les nageurs cochés
   - Visual feedback des nageurs sélectionnés

3. **Synchronisation bidirectionnelle nageur ↔ équipe**
   - Données saisies en collectif → apparaissent dans dashboard nageur individuel
   - Données saisies par nageur → apparaissent dans analyses équipe
   - Aperçu global équipe utilise TOUTES les données de TOUS les nageurs

4. **Améliorer aperçu global équipe**
   - Section 1 (Vue d'ensemble): stats agrégées de tous les nageurs
   - Section 2 (Bien-être): moyenne équipe, alertes, tendances
   - Section 3 (Performance): comparaisons, évolutions, objectifs
   - Section 4 (Médical): disponibilité, blessures, suivi
   - Section 5 (Compétition): résultats, classements, records
   - Section 6 (Technique): évaluations moyennes par nage
   - Section 7 (Présence): taux de présence, absences, retards

## 📊 ÉTAT ACTUEL VS SOUHAITÉ

### Formulaire Bien-être

| Champ | Nageur (app.js) | Équipe (actuel) | Équipe (souhaité) |
|-------|-----------------|-----------------|-------------------|
| Qualité sommeil (1-10) | ✅ | ❌ (seulement 1-10 générique) | ✅ |
| Niveau énergie (1-10) | ✅ | ❌ | ✅ |
| Motivation (1-10) | ✅ | ❌ | ✅ |
| Stress (1-10) | ✅ | ✅ | ✅ |
| Récupération musculaire (1-10) | ✅ | ❌ | ✅ |
| Heures de sommeil | ✅ | ❌ | ✅ |
| Poids corporel | ✅ | ❌ | ✅ |
| Réveils nocturnes | ✅ | ❌ | ✅ |
| Qualité du réveil | ✅ | ❌ | ✅ |
| Douleur musculaire (0-10) | ✅ | ✅ (pain) | ✅ |
| Localisation douleur | ✅ | ❌ | ✅ |
| Fatigue générale | ✅ | ✅ (1-10) | ✅ |
| Appétit | ✅ | ❌ | ✅ |

**TOTAL:** 13 champs (nageur) vs 4 champs (équipe) → **INCOMPLET** ❌

### Formulaire Performance

| Champ | Nageur | Équipe (actuel) | Équipe (souhaité) |
|-------|--------|-----------------|-------------------|
| VMA (km/h) | ✅ | ✅ | ✅ |
| Saut vertical (cm) | ✅ | ✅ | ✅ |
| Pompes (/min) | ✅ | ✅ | ✅ |
| Gainage (secondes) | ✅ | ✅ | ✅ |

**TOTAL:** 4/4 champs → **COMPLET** ✅

### Formulaire Compétition

| Champ | Nageur | Équipe (actuel) | Équipe (souhaité) |
|-------|--------|-----------------|-------------------|
| Type de nage | ✅ | ✅ | ✅ |
| Distance | ✅ | ✅ | ✅ |
| Temps | ✅ | ✅ | ✅ |
| Classement/Rang | ✅ | ✅ | ✅ |
| Nom compétition | ✅ | ❌ | ✅ |
| Catégorie | ✅ | ❌ | ✅ |
| Objectif temps | ✅ | ❌ | ✅ |
| Record personnel | ✅ | ❌ | ✅ |

**TOTAL:** 8 champs (nageur) vs 4 champs (équipe) → **INCOMPLET** ❌

### Formulaire Session d'Entraînement

| Composant | Nageur | Équipe (actuel) | Équipe (souhaité) |
|-----------|--------|-----------------|-------------------|
| Échauffement | ✅ Complet | ❌ Absent | ✅ |
| Corps de séance (multiple) | ✅ Complet | ❌ Simplifié | ✅ |
| Retour au calme | ✅ Complet | ❌ Absent | ✅ |
| Détails par partie (durée, distance, nage, intensité, notes) | ✅ | ❌ | ✅ |

**TOTAL:** Structure complète (nageur) vs simplifiée (équipe) → **INCOMPLET** ❌

## 🔧 MODIFICATIONS À IMPLÉMENTER

### 1. Fonction `selectCollectiveDataType()` - Ajouter sélection nageurs

```javascript
function selectCollectiveDataType(type) {
    const swimmers = getTeamSwimmers();
    if (swimmers.length === 0) {
        alert('Aucun nageur dans l\'équipe');
        return;
    }
    
    const content = document.getElementById('collectiveDataContent');
    
    // NOUVEAU: Afficher sélecteur de nageurs
    let html = `
        <div style="margin-bottom: 20px;">
            <button onclick="showCollectiveDataEntry()" class="btn btn-outline">
                <i class="fas fa-arrow-left"></i> Retour
            </button>
        </div>
        
        <h4>📋 Sélectionner les nageurs pour la saisie</h4>
        
        <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <button onclick="selectAllSwimmers()" class="btn btn-sm btn-primary">✓ Tout sélectionner</button>
            <button onclick="deselectAllSwimmers()" class="btn btn-sm btn-outline" style="margin-left: 10px;">✗ Tout désélectionner</button>
            <span id="selectedCount" style="margin-left: 20px; font-weight: bold;">0 nageurs sélectionnés</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 25px;">
    `;
    
    swimmers.forEach((swimmer, index) => {
        html += `
            <label class="swimmer-checkbox-card" style="display: flex; align-items: center; padding: 15px; background: white; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" class="swimmer-select-checkbox" data-swimmer-id="${swimmer.id}" onchange="updateSelectedSwimmersCount()" style="width: 20px; height: 20px; margin-right: 12px;" checked>
                <div>
                    <div style="font-weight: 600; color: #333;">${swimmer.name || 'Nageur ' + (index + 1)}</div>
                    <div style="font-size: 0.85rem; color: #666;">${swimmer.email || ''}</div>
                </div>
            </label>
        `;
    });
    
    html += `
        </div>
        
        <button onclick="proceedToCollectiveForm('${type}')" class="btn btn-primary btn-lg" style="width: 100%;">
            <i class="fas fa-arrow-right"></i> Continuer vers le formulaire
        </button>
    `;
    
    content.innerHTML = html;
}
```

### 2. Formulaires alignés avec app.js

#### Bien-être (13 champs, 3 pages)

```javascript
case 'wellbeing':
    return `
        <!-- PAGE 1: Évaluation Subjective -->
        <div class="wellbeing-page" id="wellbeing-page-1">
            <div class="form-row">
                <div class="form-group">
                    <label>😴 Qualité du Sommeil (1-10)</label>
                    <input type="range" id="${prefix}_sleepQuality" min="1" max="10" value="5" class="form-range">
                    <output id="${prefix}_sleepQuality_output">5</output>
                </div>
                <div class="form-group">
                    <label>⚡ Niveau d'Énergie (1-10)</label>
                    <input type="range" id="${prefix}_energyLevel" min="1" max="10" value="5" class="form-range">
                    <output id="${prefix}_energyLevel_output">5</output>
                </div>
            </div>
            <!-- ... autres champs page 1 ... -->
        </div>
        
        <!-- PAGE 2: Données Quantitatives -->
        <div class="wellbeing-page" id="wellbeing-page-2" style="display: none;">
            <div class="form-row">
                <div class="form-group">
                    <label>🕐 Heures de Sommeil</label>
                    <input type="number" id="${prefix}_sleepHours" min="0" max="24" step="0.5" placeholder="Ex: 7.5">
                </div>
                <div class="form-group">
                    <label>⚖️ Poids (kg)</label>
                    <input type="number" id="${prefix}_bodyWeight" min="0" step="0.1" placeholder="Ex: 70.5">
                </div>
            </div>
            <!-- ... autres champs page 2 ... -->
        </div>
        
        <!-- PAGE 3: Symptômes Spécifiques -->
        <div class="wellbeing-page" id="wellbeing-page-3" style="display: none;">
            <!-- ... champs page 3 ... -->
        </div>
    `;
```

### 3. Fonction de sauvegarde améliorée

```javascript
function saveCollectiveData(type) {
    const date = document.getElementById('collectiveDate').value;
    if (!date) {
        alert('Veuillez sélectionner une date');
        return;
    }
    
    const selectedCheckboxes = document.querySelectorAll('.swimmer-select-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Veuillez sélectionner au moins un nageur');
        return;
    }
    
    let savedCount = 0;
    let errors = [];
    
    selectedCheckboxes.forEach((checkbox) => {
        const swimmerId = checkbox.dataset.swimmerId;
        const swimmer = getSwimmerById(swimmerId);
        if (!swimmer) return;
        
        const index = Array.from(selectedCheckboxes).indexOf(checkbox);
        const prefix = `swimmer_${index}`;
        const data = collectSwimmerData(type, prefix, swimmerId, date);
        
        if (data && Object.keys(data).length > 1) {
            try {
                saveSwimmerData(swimmerId, type, data);
                savedCount++;
            } catch (error) {
                errors.push(`${swimmer.name}: ${error.message}`);
            }
        }
    });
    
    if (savedCount > 0) {
        alert(`✅ Données enregistrées avec succès pour ${savedCount} nageur(s) !`);
        closeCollectiveDataModal();
        
        // IMPORTANT: Recharger les sections pour synchroniser
        if (currentTeam) {
            loadAllSections();
            displayQuickStats(); // Mettre à jour les stats rapides
        }
    } else if (errors.length > 0) {
        alert(`❌ Erreurs lors de l'enregistrement:\n${errors.join('\n')}`);
    } else {
        alert('⚠️ Aucune donnée à enregistrer.');
    }
}
```

### 4. Synchronisation avec aperçu global équipe

Chaque section doit utiliser `getAllSwimmers()` et filtrer par `currentTeam.swimmerIds`:

```javascript
function loadGlobalSection(swimmers) {
    // Récupérer TOUTES les données de TOUS les nageurs de l'équipe
    let allWellbeingData = [];
    let allTrainingData = [];
    let allPerformanceData = [];
    // etc.
    
    swimmers.forEach(swimmer => {
        if (swimmer.wellbeingData) allWellbeingData.push(...swimmer.wellbeingData);
        if (swimmer.trainingData) allTrainingData.push(...swimmer.trainingData);
        if (swimmer.performanceData) allPerformanceData.push(...swimmer.performanceData);
        // etc.
    });
    
    // Calculer les statistiques agrégées
    const avgWellbeing = calculateAverageWellbeing(allWellbeingData);
    const totalTrainingSessions = allTrainingData.length;
    const avgPerformance = calculateAveragePerformance(allPerformanceData);
    
    // Afficher les résultats...
}
```

## ✅ CHECKLIST D'IMPLÉMENTATION

- [ ] 1. Ajouter sélection individuelle des nageurs (checkboxes)
- [ ] 2. Implémenter "Tout sélectionner" / "Tout désélectionner"
- [ ] 3. Aligner formulaire bien-être (4 → 13 champs, 3 pages)
- [ ] 4. Aligner formulaire compétition (4 → 8 champs)
- [ ] 5. Aligner formulaire session (structure complète)
- [ ] 6. Aligner formulaire technique (structure complète)
- [ ] 7. Mettre à jour `collectSwimmerData()` pour tous les nouveaux champs
- [ ] 8. Mettre à jour `saveSwimmerData()` pour compatibilité avec app.js
- [ ] 9. Synchroniser aperçu global équipe avec données nageurs
- [ ] 10. Tester sauvegarde collective → affichage dashboard nageur
- [ ] 11. Tester sauvegarde nageur → affichage aperçu équipe
- [ ] 12. Valider toutes les analyses équipe utilisent les bonnes données

## 📝 NOTES TECHNIQUES

- Les données sont stockées dans `localStorage` avec clé `swimmers`
- Structure: `swimmer.wellbeingData[]`, `swimmer.trainingData[]`, etc.
- Chaque entrée a au minimum: `{date: "2025-11-24", ...autres_champs}`
- La sauvegarde doit vérifier si une entrée existe déjà pour la date (update vs create)
- Les sections d'analyse équipe doivent être rechargées après sauvegarde collective
- Les stats rapides équipe doivent se mettre à jour automatiquement

---

**Date:** 24 Novembre 2025  
**Priorité:** HAUTE 🔴  
**Estimation:** 2-3 heures de développement  
**Impact:** Améliore drastiquement l'utilisabilité et la cohérence de l'application
