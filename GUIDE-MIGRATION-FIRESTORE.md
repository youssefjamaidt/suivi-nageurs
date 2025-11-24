# 📦 GUIDE DE MIGRATION VERS FIRESTORE

## Vue d'ensemble

Ce guide explique comment migrer l'application "Suivi Nageurs" de localStorage vers Firebase Firestore.

---

## Étape 1: Configuration Firebase

### 1.1 Suivre le guide de configuration
Référez-vous à `GUIDE-CONFIGURATION-FIREBASE.md` pour :
- Créer le projet Firebase
- Activer Authentication et Firestore
- Copier les identifiants dans `firebase-config.js`

### 1.2 Activer Authentication Email/Password
1. Console Firebase → Authentication → Sign-in method
2. Activer "Email/Password"
3. Sauvegarder

---

## Étape 2: Créer les Collections Firestore

### 2.1 Structure de base
Créer manuellement ces collections dans la console Firestore :
- `users`
- `teams`
- `wellbeing_data`
- `performance_data`
- `medical_data`
- `race_data`
- `technical_data`
- `attendance_data`

### 2.2 Ajouter les règles de sécurité
1. Console Firebase → Firestore Database → Rules
2. Copier le contenu de `FIRESTORE-STRUCTURE.md` (section "Règles de Sécurité")
3. Publier les règles

### 2.3 Créer les index
Les index seront créés automatiquement lors des premières requêtes.
Firebase vous proposera de créer les index manquants avec un lien direct.

---

## Étape 3: Migration des Données

### 3.1 Script de migration automatique

Créer un fichier `migrate-to-firestore.html` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Migration vers Firestore</title>
</head>
<body>
    <h1>Migration localStorage → Firestore</h1>
    <div id="status">Initialisation...</div>
    <button id="startMigration" style="display:none;">Démarrer Migration</button>
    <pre id="log"></pre>

    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="assets/js/firebase-config.js"></script>
    
    <script>
        const log = (msg) => {
            document.getElementById('log').textContent += msg + '\n';
            console.log(msg);
        };

        async function migrateData() {
            try {
                log('🚀 Début de la migration...');
                
                // 1. Migrer les équipes
                log('\n📋 Migration des équipes...');
                const teams = JSON.parse(localStorage.getItem('teams') || '[]');
                const teamMapping = {}; // ancien ID → nouveau ID Firestore
                
                for (const team of teams) {
                    const teamRef = await db.collection('teams').add({
                        name: team.name,
                        coachId: auth.currentUser.uid, // ID du coach connecté
                        category: team.category || 'Non défini',
                        season: team.season || '2024-2025',
                        swimmers: [], // Sera mis à jour après
                        totalSwimmers: team.swimmers?.length || 0,
                        activeSwimmers: team.swimmers?.length || 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    teamMapping[team.id] = teamRef.id;
                    log(`  ✓ Équipe "${team.name}" migrée (ID: ${teamRef.id})`);
                }
                
                // 2. Migrer les nageurs
                log('\n👤 Migration des nageurs...');
                const swimmers = JSON.parse(localStorage.getItem('swimmers') || '[]');
                const swimmerMapping = {}; // ancien ID → nouveau ID Firestore
                
                for (const swimmer of swimmers) {
                    const newTeamId = teamMapping[swimmer.teamId];
                    
                    // Créer compte Firebase Auth pour le nageur
                    let userId;
                    try {
                        const email = `${swimmer.firstName.toLowerCase()}.${swimmer.lastName.toLowerCase()}@swimmers.local`;
                        const password = generatePassword();
                        
                        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                        userId = userCredential.user.uid;
                        
                        log(`  ✓ Compte créé pour ${swimmer.firstName} ${swimmer.lastName}`);
                        log(`    Email: ${email} | Mot de passe: ${password}`);
                        
                    } catch (error) {
                        log(`  ⚠ Erreur création compte pour ${swimmer.firstName}: ${error.message}`);
                        continue;
                    }
                    
                    // Créer document dans users
                    await db.collection('users').doc(userId).set({
                        email: `${swimmer.firstName.toLowerCase()}.${swimmer.lastName.toLowerCase()}@swimmers.local`,
                        firstName: swimmer.firstName,
                        lastName: swimmer.lastName,
                        role: 'nageur',
                        status: 'active',
                        coachId: auth.currentUser.uid,
                        teamId: newTeamId,
                        hasAccount: true,
                        birthDate: swimmer.birthDate || null,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        createdBy: auth.currentUser.uid
                    });
                    
                    swimmerMapping[swimmer.id] = userId;
                    
                    // Migrer les données du nageur
                    await migrateSwimmerData(swimmer, userId, newTeamId);
                }
                
                // 3. Mettre à jour les IDs des nageurs dans les équipes
                log('\n🔄 Mise à jour des équipes avec les IDs des nageurs...');
                for (const oldTeamId in teamMapping) {
                    const newTeamId = teamMapping[oldTeamId];
                    const teamSwimmers = swimmers.filter(s => s.teamId === oldTeamId);
                    const swimmerIds = teamSwimmers.map(s => swimmerMapping[s.id]).filter(id => id);
                    
                    await db.collection('teams').doc(newTeamId).update({
                        swimmers: swimmerIds,
                        totalSwimmers: swimmerIds.length,
                        activeSwimmers: swimmerIds.length
                    });
                }
                
                log('\n✅ Migration terminée avec succès !');
                log('\n⚠️ IMPORTANT: Notez les mots de passe générés ci-dessus');
                
            } catch (error) {
                log(`\n❌ Erreur: ${error.message}`);
                console.error(error);
            }
        }
        
        async function migrateSwimmerData(swimmer, userId, teamId) {
            const batch = db.batch();
            let count = 0;
            
            // Bien-être
            if (swimmer.wellbeingData) {
                for (const data of swimmer.wellbeingData) {
                    const ref = db.collection('wellbeing_data').doc();
                    batch.set(ref, {
                        swimmerId: userId,
                        teamId: teamId,
                        date: data.date,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date(data.date)),
                        sleepQuality: data.sleepQuality || 0,
                        energyLevel: data.energyLevel || 0,
                        motivation: data.motivation || 0,
                        stressLevel: data.stressLevel || 0,
                        muscleRecovery: data.muscleRecovery || 0,
                        score: data.score || 0,
                        enteredBy: 'migration',
                        enteredByUserId: auth.currentUser.uid
                    });
                    count++;
                }
            }
            
            // Performance
            if (swimmer.performanceData) {
                for (const data of swimmer.performanceData) {
                    const ref = db.collection('performance_data').doc();
                    batch.set(ref, {
                        swimmerId: userId,
                        teamId: teamId,
                        date: data.date,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date(data.date)),
                        testType: data.type || 'VMA',
                        vmaTest: data.vma ? { vma: data.vma } : null,
                        enteredBy: 'migration',
                        enteredByUserId: auth.currentUser.uid
                    });
                    count++;
                }
            }
            
            // Médical
            if (swimmer.medicalData) {
                for (const data of swimmer.medicalData) {
                    const ref = db.collection('medical_data').doc();
                    batch.set(ref, {
                        swimmerId: userId,
                        teamId: teamId,
                        date: data.date,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date(data.date)),
                        type: data.type || 'Blessure',
                        condition: data.condition || '',
                        status: data.status || 'active',
                        enteredBy: 'migration',
                        enteredByUserId: auth.currentUser.uid
                    });
                    count++;
                }
            }
            
            // Races
            if (swimmer.raceData) {
                for (const data of swimmer.raceData) {
                    const ref = db.collection('race_data').doc();
                    batch.set(ref, {
                        swimmerId: userId,
                        teamId: teamId,
                        date: data.date,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date(data.date)),
                        competition: data.competition || '',
                        event: data.event || '',
                        time: data.time || 0,
                        rank: data.rank || 0,
                        enteredBy: 'migration',
                        enteredByUserId: auth.currentUser.uid
                    });
                    count++;
                }
            }
            
            if (count > 0) {
                await batch.commit();
                log(`  → ${count} données migrées pour ${swimmer.firstName}`);
            }
        }
        
        function generatePassword() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
            let password = '';
            for (let i = 0; i < 10; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        }
        
        // Vérifier l'authentification
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                document.getElementById('status').textContent = 
                    '⚠️ Vous devez être connecté comme coach pour migrer les données.';
                window.location.href = 'login.html';
            } else {
                const userData = await getUserData(user.uid);
                if (userData.role !== 'coach') {
                    document.getElementById('status').textContent = 
                        '⚠️ Seuls les coachs peuvent effectuer la migration.';
                    return;
                }
                
                document.getElementById('status').textContent = 
                    `✅ Connecté comme ${userData.firstName} ${userData.lastName}`;
                document.getElementById('startMigration').style.display = 'block';
                document.getElementById('startMigration').onclick = migrateData;
            }
        });
    </script>
</body>
</html>
```

### 3.2 Exécuter la migration

1. Se connecter comme coach sur l'application
2. Ouvrir `migrate-to-firestore.html` dans le navigateur
3. Cliquer sur "Démarrer Migration"
4. **IMPORTANT**: Noter les mots de passe générés pour les nageurs
5. Vérifier dans la console Firestore que les données sont présentes

---

## Étape 4: Basculer vers les nouvelles interfaces

### 4.1 Pages déjà compatibles Firestore
✅ `login.html` - Authentification Firebase  
✅ `register.html` - Création compte coach  
✅ `forgot-password.html` - Réinitialisation mot de passe  
✅ `index.html` - Hub coach (protégé)  
✅ `admin.html` - Interface admin  
✅ `nageur.html` - Interface nageur personnelle  
✅ `equipe.html` - Interface équipe coach (nouvelle version)

### 4.2 Tester les interfaces

1. **Test nageur:**
   - Se connecter avec un compte nageur
   - Vérifier l'affichage du dashboard personnel
   - Tester la saisie de bien-être
   - Vérifier la synchronisation avec le coach

2. **Test coach:**
   - Se connecter comme coach
   - Aller sur `equipe.html`
   - Vérifier le chargement des équipes
   - Tester la génération d'un compte nageur
   - Vérifier l'affichage des données en temps réel

3. **Test admin:**
   - Se connecter comme admin
   - Approuver une demande d'inscription
   - Gérer les utilisateurs
   - Vérifier les statistiques

---

## Étape 5: Nettoyage

### 5.1 Sauvegarder localStorage (optionnel)
Avant de supprimer, exporter les données :

```javascript
// Dans la console du navigateur
const backup = {
    teams: localStorage.getItem('teams'),
    swimmers: localStorage.getItem('swimmers'),
    currentTeam: localStorage.getItem('currentTeam')
};
console.log(JSON.stringify(backup));
// Copier et sauvegarder le résultat
```

### 5.2 Supprimer localStorage
Une fois la migration vérifiée :

```javascript
localStorage.removeItem('teams');
localStorage.removeItem('swimmers');
localStorage.removeItem('currentTeam');
localStorage.removeItem('currentSwimmer');
```

### 5.3 Supprimer anciens fichiers (optionnel)
Fichiers de backup créés :
- `assets/js/equipe-dashboard.backup.js`
- `assets/js/equipe-dashboard-localStorage.backup.js`

---

## Étape 6: Déploiement

### 6.1 Mettre à jour Netlify
```bash
git add .
git commit -m "Migration Firestore complète"
git push origin main
```

### 6.2 Configurer les variables d'environnement
Si vous utilisez des variables d'environnement pour Firebase config :
1. Netlify → Site settings → Environment variables
2. Ajouter les clés Firebase
3. Modifier `firebase-config.js` pour utiliser `process.env` si nécessaire

---

## Dépannage

### Erreur: "Missing or insufficient permissions"
→ Vérifier les règles Firestore  
→ S'assurer que l'utilisateur est authentifié

### Erreur: "The query requires an index"
→ Cliquer sur le lien fourni par Firebase pour créer l'index automatiquement

### Les données ne s'affichent pas
→ Vérifier la console du navigateur (F12)  
→ Vérifier que Firebase est correctement initialisé  
→ Vérifier les IDs des équipes/nageurs

### Erreur lors de la génération de compte nageur
→ Vérifier que l'email n'existe pas déjà  
→ Vérifier les règles d'authentification Firebase

---

## Support

Pour toute question, consulter :
- `FIRESTORE-STRUCTURE.md` - Structure complète des collections
- `GUIDE-CONFIGURATION-FIREBASE.md` - Configuration Firebase
- `README.md` - Documentation générale
