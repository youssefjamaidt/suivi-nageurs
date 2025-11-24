# 🧪 Plan de Tests Complets - TODO 5

## 📋 Vue d'Ensemble

**Objectif**: Valider toutes les améliorations implémentées (TODO 1-4) avant déploiement production.

**Prérequis**:
- Navigateur avec DevTools (Chrome recommandé)
- Accès à l'application locale ou de développement
- Jeu de données test (instructions ci-dessous)

---

## 🎯 Catégories de Tests

### 1. Tests Fonctionnels (Priorité: HAUTE)
### 2. Tests Edge Cases (Priorité: HAUTE)
### 3. Tests Performance (Priorité: MOYENNE)
### 4. Tests Cross-Platform (Priorité: HAUTE)
### 5. Tests Synchronisation (Priorité: HAUTE)

---

## 📝 Instructions Préparation

### A. Créer Jeu de Données Test

#### Étape 1: Créer une Équipe Test
1. Ouvrir `equipe.html`
2. Créer équipe "Tests 2024"
3. Ajouter **10 nageurs** avec profils variés

**Profils suggérés**:
```
1. Jean Actif - Beaucoup de données (50+ saisies)
2. Marie Régulière - Données moyennes (20 saisies)
3. Paul Nouveau - Peu de données (5 saisies)
4. Sophie Blessée - Statut médical "indisponible"
5. Luc Champion - Nombreux records
6. Emma Technique - Évaluations techniques
7. Tom Absent - Nombreuses absences
8. Lisa Complète - Tous types de données
9. Marc Partiel - Seulement bien-être
10. Clara Vide - Aucune donnée
```

#### Étape 2: Peupler les Données
Pour chaque nageur (sauf Clara), saisir :
- **Bien-être**: 10-50 saisies variées
- **Performance**: 5-20 tests
- **Médical**: 3-10 suivis
- **Compétitions**: 5-30 courses
- **Technique**: 3-15 évaluations
- **Assiduité**: 20-50 présences/absences

**Tip**: Utiliser saisie collective pour gagner du temps !

---

## 🧪 SECTION 1: Tests Fonctionnels

### Test 1.1: Sélection Nageurs (Saisie Collective)

#### Objectif
Valider le système de checkboxes et sélection individuelle.

#### Procédure
1. Cliquer "Saisie Collective" → "Bien-être"
2. **Vérifier**: Écran sélection apparaît avec 10 checkboxes
3. **Cocher** 3 nageurs aléatoires
4. **Vérifier**: Compteur affiche "3 nageurs sélectionnés"
5. **Cliquer** "Sélectionner tout"
6. **Vérifier**: Les 10 sont cochés, compteur "10 nageurs sélectionnés"
7. **Cliquer** "Désélectionner tout"
8. **Vérifier**: Tous décochés, compteur "0 nageurs sélectionnés"
9. **Tenter** cliquer "Continuer" sans sélection
10. **Vérifier**: Alert "Veuillez sélectionner au moins un nageur"
11. **Cocher** 5 nageurs
12. **Cliquer** "Continuer"
13. **Vérifier**: Formulaire bien-être apparaît

#### Critères de Réussite
- [ ] Checkboxes fonctionnelles (visuellement distinctes coché/décoché)
- [ ] Compteur se met à jour en temps réel
- [ ] Boutons "Tout/Rien" fonctionnent
- [ ] Validation empêche continuer sans sélection
- [ ] Navigation vers formulaire réussie

---

### Test 1.2: Formulaire Bien-être 13 Champs

#### Objectif
Valider expansion du formulaire de 4 à 13 champs.

#### Procédure
1. **Dans le formulaire** (suite Test 1.1)
2. **Compter visuellement**: Vérifier présence des 13 champs
3. **Remplir tous les champs**:
   - sleepQuality: 8
   - energyLevel: 7
   - motivation: 9
   - stressLevel: 4
   - muscleRecovery: 7
   - sleepHours: 8.5
   - bodyWeight: 70
   - nightAwakenings: "1-2"
   - wakeQuality: 4
   - musclePain: 3
   - painLocation: "Épaule droite"
   - generalFatigue: "Modérée"
   - appetite: "Normal"
4. **Cliquer** "Enregistrer"
5. **Vérifier**: Alert affiche "✅ 5 nageurs enregistrés avec succès"

#### Critères de Réussite
- [ ] Les 13 champs sont visibles
- [ ] Tous les champs acceptent les données
- [ ] Sauvegarde réussie pour nageurs sélectionnés
- [ ] Feedback précis (nombre enregistrés)

---

### Test 1.3: Score Bien-être Automatique

#### Objectif
Valider calcul automatique du score global.

#### Procédure
1. **Ouvrir DevTools** (F12) → Console
2. **Exécuter**:
```javascript
const swimmers = JSON.parse(localStorage.getItem('swimmers'));
const testSwimmer = swimmers.find(s => s.name === 'Jean Actif');
const lastEntry = testSwimmer.wellbeingData[testSwimmer.wellbeingData.length - 1];
console.log('Score auto:', lastEntry.score);
console.log('Valeurs:', lastEntry.sleepQuality, lastEntry.energyLevel, 
            lastEntry.motivation, lastEntry.stressLevel, lastEntry.muscleRecovery);
```
3. **Calculer manuellement**:
```
Score = (sleepQuality + energyLevel + motivation + (11-stressLevel) + muscleRecovery) / 5
Exemple: (8 + 7 + 9 + (11-4) + 7) / 5 = (8+7+9+7+7)/5 = 38/5 = 7.6
```
4. **Comparer** score affiché vs calcul manuel

#### Critères de Réussite
- [ ] Score calculé automatiquement présent dans données
- [ ] Formule correcte (match calcul manuel)
- [ ] Score entre 0 et 10

---

### Test 1.4: Agrégation Section Bien-être

#### Objectif
Valider que toutes les données sont utilisées, pas juste dernière.

#### Procédure
1. **Aller** page équipe → Section "Bien-être"
2. **Vérifier affichage**:
   - Score global équipe (ex: 7.3/10)
   - Total saisies (ex: 245 saisies)
   - Nageurs avec données (ex: 9/10)
   - Saisies récentes 7j (ex: 42)
3. **Calculer manuellement** (échantillon):
   - Choisir un nageur avec 10 saisies
   - Additionner ses 10 valeurs sleepQuality
   - Diviser par 10
   - Comparer avec moyenne affichée
4. **Vérifier** recommandations générées

#### Critères de Réussite
- [ ] Métadonnées affichées (totalEntries, swimmersWithData, recentEntries)
- [ ] Score global calculé sur toutes saisies
- [ ] Recommandations pertinentes générées
- [ ] Aucun "NaN" ou "undefined"

---

### Test 1.5-1.10: Autres Sections

**Répéter logique Test 1.4 pour**:
- [ ] Section Performance (VMA, détente, force, gainage)
- [ ] Section Médicale (disponibilité, blessures, top 5)
- [ ] Section Compétitions (courses, records, top nages/distances)
- [ ] Section Technique (scores par nage, forces/faiblesses)
- [ ] Section Assiduité (présences, absences, top absentéistes)
- [ ] Section Vue Globale (statistiques toutes catégories)

---

## 🔥 SECTION 2: Tests Edge Cases

### Test 2.1: Nageur Sans Données

#### Objectif
Valider comportement avec nageur vide (Clara Vide).

#### Procédure
1. **Vérifier** sections équipe avec Clara présente mais sans données
2. **Attendu**: 
   - Compteurs reflètent "9/10 nageurs" (Clara exclue)
   - Moyennes calculées sur 9 nageurs seulement
   - Pas de crash ou erreur

#### Critères de Réussite
- [ ] Application ne crashe pas
- [ ] Clara ignorée dans calculs
- [ ] Compteurs corrects

---

### Test 2.2: Données Partielles

#### Objectif
Valider nageur avec certains champs manquants.

#### Procédure
1. **Saisir** bien-être pour Marc Partiel avec seulement:
   - sleepQuality: 7
   - energyLevel: 8
   - (Autres champs vides)
2. **Vérifier** section bien-être équipe
3. **Attendu**:
   - sleepQuality moyenne inclut valeur de Marc
   - Champs vides de Marc n'affectent pas moyennes autres champs
   - Score global calculé sur 2 champs (ou invalide)

#### Critères de Réussite
- [ ] Compteurs séparés fonctionnent
- [ ] Pas de "NaN" pour champs manquants
- [ ] Moyennes cohérentes

---

### Test 2.3: Valeurs Extrêmes

#### Objectif
Tester limites du système.

#### Procédure
1. **Saisir** bien-être avec valeurs limites:
   - sleepQuality: 10
   - energyLevel: 0
   - stressLevel: 10
   - sleepHours: 0
   - bodyWeight: 200
2. **Vérifier** calculs et affichage
3. **Tenter** valeurs hors limites (négatives, >10)

#### Critères de Réussite
- [ ] Valeurs limites acceptées
- [ ] Calculs corrects avec extrêmes
- [ ] Validation empêche valeurs hors limites

---

### Test 2.4: Caractères Spéciaux

#### Objectif
Valider gestion caractères spéciaux dans champs texte.

#### Procédure
1. **Saisir** bien-être avec:
   - painLocation: "Épaule droite <script>alert('test')</script>"
2. **Vérifier** affichage (pas d'exécution script)
3. **Tenter** autres caractères: émojis, apostrophes, guillemets

#### Critères de Réussite
- [ ] Pas d'injection XSS
- [ ] Caractères spéciaux affichés correctement
- [ ] Émojis supportés

---

### Test 2.5: localStorage Plein

#### Objectif
Tester limite stockage.

#### Procédure
1. **DevTools** → Application → Storage
2. **Vérifier** taille actuelle localStorage
3. **Tenter** remplir avec données massives
4. **Surveiller** erreurs "QuotaExceededError"

#### Critères de Réussite
- [ ] Gestion gracieuse si quota dépassé
- [ ] Message erreur informatif
- [ ] Pas de perte données existantes

---

## ⚡ SECTION 3: Tests Performance

### Test 3.1: Équipe 50 Nageurs

#### Objectif
Valider performance avec grande équipe.

#### Procédure
1. **Créer** équipe test avec 50 nageurs
2. **Peupler** chaque nageur avec 50+ saisies
3. **Mesurer** temps chargement:
```javascript
console.time('loadTeamData');
loadAllSections(swimmers);
console.timeEnd('loadTeamData');
```
4. **Objectif**: < 2 secondes

#### Critères de Réussite
- [ ] Chargement < 2 secondes
- [ ] Interface reste réactive
- [ ] Pas de freeze navigateur

---

### Test 3.2: Nageur 1000 Saisies

#### Objectif
Tester performance calcul avec données massives.

#### Procédure
1. **Script** pour générer 1000 saisies:
```javascript
const swimmer = swimmers[0];
for (let i = 0; i < 1000; i++) {
    swimmer.wellbeingData.push({
        date: new Date(Date.now() - i*86400000).toISOString(),
        sleepQuality: Math.floor(Math.random()*10)+1,
        energyLevel: Math.floor(Math.random()*10)+1,
        // ...
    });
}
localStorage.setItem('swimmers', JSON.stringify(swimmers));
```
2. **Recharger** page équipe
3. **Mesurer** temps calcul stats

#### Critères de Réussite
- [ ] Calcul stats < 1 seconde
- [ ] Affichage fluide
- [ ] Moyennes correctes

---

## 🌐 SECTION 4: Tests Cross-Platform

### Test 4.1: Navigateurs Desktop

#### Chrome
- [ ] Sélection nageurs fonctionne
- [ ] Formulaire 13 champs s'affiche
- [ ] Sections équipe chargent
- [ ] Gradients CSS visibles

#### Firefox
- [ ] Mêmes tests que Chrome
- [ ] Vérifier compatibilité flex/grid

#### Edge
- [ ] Mêmes tests que Chrome

#### Safari (si disponible)
- [ ] Mêmes tests que Chrome
- [ ] Vérifier localStorage fonctionnel

---

### Test 4.2: Mobile Responsive

#### iPhone (Safari)
**Portrait**:
- [ ] Checkboxes cliquables (taille suffisante)
- [ ] Formulaire scrollable
- [ ] Sections équipe lisibles
- [ ] Gradients s'affichent

**Paysage**:
- [ ] Layout adapté
- [ ] Pas de scrolling horizontal

#### Android (Chrome)
**Portrait**:
- [ ] Mêmes tests qu'iPhone

**Paysage**:
- [ ] Mêmes tests qu'iPhone

---

### Test 4.3: Tablette

#### iPad / Android Tablet
- [ ] Interface entre mobile et desktop
- [ ] Grilles (grid) bien dimensionnées
- [ ] Touch interactions fluides

---

## 🔄 SECTION 5: Tests Synchronisation

### Test 5.1: Saisie Collective → Dashboard Individuel

#### Procédure
1. **Interface équipe**: Saisie collective bien-être pour 5 nageurs
2. **Ouvrir** dashboard individuel de l'un des 5 nageurs
3. **Vérifier**: Nouvelle saisie apparaît dans historique
4. **Vérifier**: Graphiques mis à jour

#### Critères de Réussite
- [ ] Données visibles immédiatement (après refresh)
- [ ] Historique complet et ordonné
- [ ] Graphiques reflètent nouvelles données

---

### Test 5.2: Saisie Individuelle → Aperçu Équipe

#### Procédure
1. **Dashboard individuel**: Ajouter saisie bien-être pour Jean
2. **Aller** page équipe → Section bien-être
3. **Vérifier**: 
   - Total saisies +1
   - Moyennes recalculées
   - Score global équipe mis à jour

#### Critères de Réussite
- [ ] Synchronisation bidirectionnelle fonctionne
- [ ] Compteurs augmentent
- [ ] Moyennes actualisées

---

### Test 5.3: Suppression Données

#### Procédure
1. **DevTools**: Supprimer une saisie d'un nageur
```javascript
swimmers[0].wellbeingData.pop();
localStorage.setItem('swimmers', JSON.stringify(swimmers));
```
2. **Recharger** page équipe
3. **Vérifier**: Compteurs et moyennes ajustés

#### Critères de Réussite
- [ ] Suppression reflétée
- [ ] Pas d'erreurs calcul
- [ ] Compteurs corrects

---

## 📊 Tableau de Suivi Tests

| # | Test | Chrome | Firefox | Edge | Safari | Mobile | Statut |
|---|------|--------|---------|------|--------|--------|--------|
| 1.1 | Sélection nageurs | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.2 | Formulaire 13 champs | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.3 | Score automatique | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.4 | Agrégation bien-être | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.5 | Section performance | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.6 | Section médicale | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.7 | Section compétitions | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.8 | Section technique | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.9 | Section assiduité | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 1.10 | Vue globale | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 2.1 | Nageur sans données | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 2.2 | Données partielles | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 2.3 | Valeurs extrêmes | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 2.4 | Caractères spéciaux | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 2.5 | localStorage plein | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 3.1 | 50 nageurs | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 3.2 | 1000 saisies | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 4.1 | Chrome desktop | ☐ | - | - | - | - | ⏳ |
| 4.1 | Firefox desktop | - | ☐ | - | - | - | ⏳ |
| 4.1 | Edge desktop | - | - | ☐ | - | - | ⏳ |
| 4.1 | Safari desktop | - | - | - | ☐ | - | ⏳ |
| 4.2 | iPhone portrait | - | - | - | - | ☐ | ⏳ |
| 4.2 | iPhone paysage | - | - | - | - | ☐ | ⏳ |
| 4.2 | Android portrait | - | - | - | - | ☐ | ⏳ |
| 4.2 | Android paysage | - | - | - | - | ☐ | ⏳ |
| 4.3 | Tablette | - | - | - | - | ☐ | ⏳ |
| 5.1 | Collective → Individuel | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 5.2 | Individuel → Équipe | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |
| 5.3 | Suppression données | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ |

**Légende**: ☐ À faire | ✅ Passé | ❌ Échoué | ⏳ En attente

---

## 🐛 Rapport de Bugs

### Template Bug Report

```markdown
## Bug #XX: [Titre court descriptif]

**Sévérité**: Critique / Majeure / Mineure / Cosmétique

**Environnement**:
- Navigateur: Chrome 120.0
- OS: Windows 11
- Date: YYYY-MM-DD

**Étapes de Reproduction**:
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Résultat Attendu**:
[Ce qui devrait se passer]

**Résultat Observé**:
[Ce qui se passe réellement]

**Capture d'écran**:
[Si pertinent]

**Console Errors**:
```
[Copier erreurs console]
```

**Données Test**:
[Si nécessaire pour reproduire]
```

---

## ✅ Critères de Validation Globale

### Pour Passer TODO 5

- [ ] Au moins **90%** des tests fonctionnels passés
- [ ] Au moins **80%** des tests edge cases passés
- [ ] Au moins **70%** des tests performance passés
- [ ] Au moins **90%** des tests cross-platform passés
- [ ] **100%** des tests synchronisation passés
- [ ] **Aucun** bug critique non résolu
- [ ] **Maximum 3** bugs majeurs non résolus (avec workaround documenté)

---

## 📝 Rapport Final

### Template Rapport de Tests

```markdown
# Rapport de Tests - TODO 5
Date: [YYYY-MM-DD]
Testeur: [Nom]

## Résumé
- Tests exécutés: XX/XX (XX%)
- Tests passés: XX/XX (XX%)
- Bugs trouvés: XX (X critiques, X majeurs, X mineurs)

## Détails par Catégorie

### Fonctionnels: XX/XX ✅
[Liste tests passés/échoués]

### Edge Cases: XX/XX ⚠️
[Liste tests passés/échoués]

### Performance: XX/XX ✅
[Liste tests passés/échoués]

### Cross-Platform: XX/XX ⚠️
[Liste tests passés/échoués]

### Synchronisation: XX/XX ✅
[Liste tests passés/échoués]

## Bugs Critiques
[Liste avec liens vers bug reports]

## Recommandations
[Actions à prendre avant production]

## Conclusion
[Recommandation: Déployer / Corriger d'abord / Retester]
```

---

## 🚀 Actions Post-Tests

### Si Tests Réussis (≥90%)
1. [ ] Créer tag release GitHub (v2.0.0)
2. [ ] Mettre à jour CHANGELOG.md
3. [ ] Déployer en production
4. [ ] Annoncer nouvelles fonctionnalités aux utilisateurs
5. [ ] Surveiller logs 48h après déploiement

### Si Tests Partiels (70-89%)
1. [ ] Documenter bugs connus
2. [ ] Créer issues GitHub pour corrections
3. [ ] Prioriser corrections critiques/majeures
4. [ ] Retester après corrections
5. [ ] Déploiement conditionnel (staging d'abord)

### Si Tests Échoués (<70%)
1. [ ] Analyse approfondie des échecs
2. [ ] Révision code si nécessaire
3. [ ] Corrections majeures
4. [ ] **Retester entièrement** (pas de déploiement)
5. [ ] Réviser plan de tests si besoin

---

**Bon courage pour les tests ! 🧪**

*Document créé: Décembre 2024*
*Version: 1.0*
