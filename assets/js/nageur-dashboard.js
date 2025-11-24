// ====================================
// NAGEUR DASHBOARD - INTERFACE PERSONNELLE
// ====================================

let currentSwimmer = null;
let currentSwimmerId = null;

// ====================================
// INITIALISATION & AUTHENTIFICATION
// ====================================

async function checkAuth() {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        const userData = await getUserData(user.uid);
        
        if (!userData) {
            console.error('Données utilisateur introuvables');
            await auth.signOut();
            window.location.href = 'login.html';
            return;
        }
        
        // Vérifier que c'est un nageur
        if (userData.role !== 'nageur') {
            console.warn('Accès refusé: rôle non-nageur');
            redirectByRole(userData.role);
            return;
        }
        
        currentSwimmer = userData;
        currentSwimmerId = user.uid;
        
        // Afficher le nom du nageur
        document.getElementById('swimmer-welcome').textContent = 
            `Bienvenue, ${userData.firstName} ${userData.lastName} 👋`;
        
        // Masquer loader et afficher interface
        document.getElementById('auth-loader').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // Charger les données du nageur
        await loadSwimmerDashboard();
        
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        window.location.href = 'login.html';
    }
}

// ====================================
// CHARGEMENT DASHBOARD NAGEUR
// ====================================

async function loadSwimmerDashboard() {
    try {
        showToast('Chargement de vos données...', 'info');
        
        // Récupérer toutes les données du nageur depuis Firestore
        const wellbeingSnapshot = await db.collection('wellbeing_data')
            .where('swimmerId', '==', currentSwimmerId)
            .orderBy('date', 'desc')
            .limit(30)
            .get();
        
        const performanceSnapshot = await db.collection('performance_data')
            .where('swimmerId', '==', currentSwimmerId)
            .orderBy('date', 'desc')
            .limit(20)
            .get();
        
        const medicalSnapshot = await db.collection('medical_data')
            .where('swimmerId', '==', currentSwimmerId)
            .orderBy('date', 'desc')
            .limit(20)
            .get();
        
        const raceSnapshot = await db.collection('race_data')
            .where('swimmerId', '==', currentSwimmerId)
            .orderBy('date', 'desc')
            .limit(20)
            .get();
        
        const technicalSnapshot = await db.collection('technical_data')
            .where('swimmerId', '==', currentSwimmerId)
            .orderBy('date', 'desc')
            .limit(20)
            .get();
        
        const attendanceSnapshot = await db.collection('attendance_data')
            .where('swimmerId', '==', currentSwimmerId)
            .orderBy('date', 'desc')
            .limit(30)
            .get();
        
        // Convertir en tableaux
        const wellbeingData = wellbeingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const performanceData = performanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const medicalData = medicalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const raceData = raceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const technicalData = technicalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const attendanceData = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Créer objet swimmer pour compatibilité avec app.js
        const swimmer = {
            id: currentSwimmerId,
            ...currentSwimmer,
            wellbeingData: wellbeingData.map(convertFirestoreToLocal),
            trainingData: [], // TODO: Ajouter si nécessaire
            performanceData: performanceData.map(convertFirestoreToLocal),
            medicalData: medicalData.map(convertFirestoreToLocal),
            raceData: raceData.map(convertFirestoreToLocal),
            technicalData: technicalData.map(convertFirestoreToLocal),
            attendanceData: attendanceData.map(convertFirestoreToLocal)
        };
        
        // Stocker temporairement dans localStorage pour compatibilité avec app.js
        localStorage.setItem('currentSwimmer', JSON.stringify(swimmer));
        
        // Utiliser les fonctions app.js pour afficher le dashboard
        if (typeof window.displayDashboard === 'function') {
            window.displayDashboard(swimmer);
        } else {
            // Fallback: affichage basique
            displayBasicDashboard(swimmer);
        }
        
    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        showToast('Erreur lors du chargement de vos données', 'error');
    }
}

// Convertir format Firestore vers format localStorage
function convertFirestoreToLocal(firestoreData) {
    const data = { ...firestoreData };
    
    // Convertir Firestore Timestamp en string date
    if (data.date && data.date.toDate) {
        data.date = data.date.toDate().toISOString().split('T')[0];
    }
    
    // Supprimer les champs Firestore non nécessaires
    delete data.swimmerId;
    delete data.enteredBy;
    delete data.enteredByUserId;
    
    return data;
}

// Affichage basique si app.js pas disponible
function displayBasicDashboard(swimmer) {
    const container = document.getElementById('dashboardContent');
    
    const lastWellbeing = swimmer.wellbeingData[0];
    const wellbeingScore = lastWellbeing ? lastWellbeing.score : 'N/A';
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="card" style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">😊</div>
                <h3>Bien-être</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: ${getScoreColor(wellbeingScore)};">
                    ${wellbeingScore}
                </div>
                <p style="color: #666;">${swimmer.wellbeingData.length} saisies</p>
            </div>
            
            <div class="card" style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">💪</div>
                <h3>Performances</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #3b82f6;">
                    ${swimmer.performanceData.length}
                </div>
                <p style="color: #666;">tests enregistrés</p>
            </div>
            
            <div class="card" style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🏅</div>
                <h3>Compétitions</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #f59e0b;">
                    ${swimmer.raceData.length}
                </div>
                <p style="color: #666;">courses</p>
            </div>
            
            <div class="card" style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
                <h3>Assiduité</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #10b981;">
                    ${calculateAttendanceRate(swimmer.attendanceData)}%
                </div>
                <p style="color: #666;">taux de présence</p>
            </div>
        </div>
        
        ${lastWellbeing ? `
            <div class="card">
                <h3 style="margin-bottom: 15px;">📊 Dernier Bien-être (${lastWellbeing.date})</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <strong>Sommeil:</strong> ${lastWellbeing.sleepQuality}/10
                    </div>
                    <div>
                        <strong>Énergie:</strong> ${lastWellbeing.energyLevel}/10
                    </div>
                    <div>
                        <strong>Motivation:</strong> ${lastWellbeing.motivation}/10
                    </div>
                    <div>
                        <strong>Stress:</strong> ${lastWellbeing.stressLevel}/10
                    </div>
                    <div>
                        <strong>Récupération:</strong> ${lastWellbeing.muscleRecovery}/10
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

function getScoreColor(score) {
    if (score >= 7) return '#10b981';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
}

function calculateAttendanceRate(attendanceData) {
    if (!attendanceData || attendanceData.length === 0) return 0;
    const present = attendanceData.filter(a => a.status === 'present').length;
    return Math.round((present / attendanceData.length) * 100);
}

// ====================================
// SAISIE BIEN-ÊTRE
// ====================================

function openWellbeingEntry() {
    // Ouvrir le panel de saisie (réutiliser le panel existant de app.js)
    const panel = document.getElementById('dataEntryPanel');
    if (panel) {
        panel.classList.add('open');
        
        // Générer le formulaire bien-être
        generateWellbeingForm();
    } else {
        // Créer modal si panel n'existe pas
        createWellbeingModal();
    }
}

function generateWellbeingForm() {
    const container = document.getElementById('dataEntryContent');
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px; color: #667eea;">
                <i class="fas fa-heart-pulse"></i> Saisie Bien-être
            </h3>
            
            <div class="form-tabs" style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="tab-btn active" onclick="switchWellbeingTab('daily')" id="dailyTab">
                    Quotidien (5 champs)
                </button>
                <button class="tab-btn" onclick="switchWellbeingTab('weekly')" id="weeklyTab">
                    Hebdomadaire (13 champs)
                </button>
            </div>
            
            <form id="wellbeingForm">
                <!-- Formulaire quotidien (5 champs) -->
                <div id="dailyForm" class="wellbeing-tab-content">
                    ${generateDailyWellbeingFields()}
                </div>
                
                <!-- Formulaire hebdomadaire (13 champs) -->
                <div id="weeklyForm" class="wellbeing-tab-content" style="display: none;">
                    ${generateWeeklyWellbeingFields()}
                </div>
                
                <div style="margin-top: 30px; display: flex; gap: 10px;">
                    <button type="button" class="btn btn-outline" onclick="closeWellbeingEntry()">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Ajouter gestionnaire de soumission
    document.getElementById('wellbeingForm').addEventListener('submit', saveWellbeingData);
    
    // Style pour les tabs
    addWellbeingStyles();
}

function generateDailyWellbeingFields() {
    return `
        <div class="card" style="padding: 20px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 15px;">Évaluation Rapide (2 minutes)</h4>
            
            <div class="form-group">
                <label>😴 Qualité du Sommeil</label>
                <input type="range" id="sleepQuality" min="1" max="10" value="7" 
                       oninput="updateRangeValue(this, 'sleepQualityValue')" class="form-range">
                <div class="range-value" id="sleepQualityValue">7/10</div>
            </div>
            
            <div class="form-group">
                <label>⚡ Niveau d'Énergie</label>
                <input type="range" id="energyLevel" min="1" max="10" value="7" 
                       oninput="updateRangeValue(this, 'energyLevelValue')" class="form-range">
                <div class="range-value" id="energyLevelValue">7/10</div>
            </div>
            
            <div class="form-group">
                <label>🎯 Motivation</label>
                <input type="range" id="motivation" min="1" max="10" value="7" 
                       oninput="updateRangeValue(this, 'motivationValue')" class="form-range">
                <div class="range-value" id="motivationValue">7/10</div>
            </div>
            
            <div class="form-group">
                <label>😰 Niveau de Stress</label>
                <input type="range" id="stressLevel" min="1" max="10" value="5" 
                       oninput="updateRangeValue(this, 'stressLevelValue')" class="form-range">
                <div class="range-value" id="stressLevelValue">5/10</div>
            </div>
            
            <div class="form-group">
                <label>💪 Récupération Musculaire</label>
                <input type="range" id="muscleRecovery" min="1" max="10" value="7" 
                       oninput="updateRangeValue(this, 'muscleRecoveryValue')" class="form-range">
                <div class="range-value" id="muscleRecoveryValue">7/10</div>
            </div>
        </div>
    `;
}

function generateWeeklyWellbeingFields() {
    return `
        <div class="card" style="padding: 20px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 15px;">📊 Évaluation Subjective</h4>
            
            ${generateDailyWellbeingFields()}
        </div>
        
        <div class="card" style="padding: 20px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 15px;">📈 Données Quantitatives</h4>
            
            <div class="form-group">
                <label>🕐 Heures de Sommeil</label>
                <input type="number" id="sleepHours" min="0" max="24" step="0.5" value="8" class="form-control">
            </div>
            
            <div class="form-group">
                <label>⚖️ Poids Corporel (kg)</label>
                <input type="number" id="bodyWeight" min="0" step="0.1" class="form-control">
            </div>
            
            <div class="form-group">
                <label>🌙 Réveils Nocturnes</label>
                <select id="nightAwakenings" class="form-control">
                    <option value="0">0 - Aucun</option>
                    <option value="1-2">1-2 fois</option>
                    <option value="3+">3+ fois</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>🌅 Qualité du Réveil</label>
                <input type="range" id="wakeQuality" min="1" max="5" value="3" 
                       oninput="updateRangeValue(this, 'wakeQualityValue')" class="form-range">
                <div class="range-value" id="wakeQualityValue">3/5</div>
            </div>
        </div>
        
        <div class="card" style="padding: 20px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 15px;">🩹 Symptômes Spécifiques</h4>
            
            <div class="form-group">
                <label>😣 Douleur Musculaire (0-10)</label>
                <input type="range" id="musclePain" min="0" max="10" value="0" 
                       oninput="updateRangeValue(this, 'musclePainValue')" class="form-range">
                <div class="range-value" id="musclePainValue">0/10</div>
            </div>
            
            <div class="form-group">
                <label>📍 Localisation Douleur</label>
                <input type="text" id="painLocation" placeholder="Ex: Épaule droite" class="form-control">
            </div>
            
            <div class="form-group">
                <label>🥱 Fatigue Générale</label>
                <select id="generalFatigue" class="form-control">
                    <option value="Faible">Faible</option>
                    <option value="Modérée" selected>Modérée</option>
                    <option value="Élevée">Élevée</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>🍽️ Appétit</label>
                <select id="appetite" class="form-control">
                    <option value="Faible">Faible</option>
                    <option value="Normal" selected>Normal</option>
                    <option value="Élevé">Élevé</option>
                </select>
            </div>
        </div>
    `;
}

function switchWellbeingTab(tab) {
    if (tab === 'daily') {
        document.getElementById('dailyForm').style.display = 'block';
        document.getElementById('weeklyForm').style.display = 'none';
        document.getElementById('dailyTab').classList.add('active');
        document.getElementById('weeklyTab').classList.remove('active');
    } else {
        document.getElementById('dailyForm').style.display = 'none';
        document.getElementById('weeklyForm').style.display = 'block';
        document.getElementById('dailyTab').classList.remove('active');
        document.getElementById('weeklyTab').classList.add('active');
    }
}

function updateRangeValue(input, displayId) {
    const display = document.getElementById(displayId);
    if (display) {
        const max = input.max || 10;
        display.textContent = `${input.value}/${max}`;
    }
}

async function saveWellbeingData(event) {
    event.preventDefault();
    
    try {
        showToast('Enregistrement en cours...', 'info');
        
        // Collecter les données
        const formData = {
            swimmerId: currentSwimmerId,
            date: new Date().toISOString().split('T')[0],
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            sleepQuality: parseInt(document.getElementById('sleepQuality')?.value || 0),
            energyLevel: parseInt(document.getElementById('energyLevel')?.value || 0),
            motivation: parseInt(document.getElementById('motivation')?.value || 0),
            stressLevel: parseInt(document.getElementById('stressLevel')?.value || 0),
            muscleRecovery: parseInt(document.getElementById('muscleRecovery')?.value || 0),
            enteredBy: 'self',
            enteredByUserId: currentSwimmerId
        };
        
        // Champs hebdomadaires (optionnels)
        if (document.getElementById('weeklyForm').style.display !== 'none') {
            formData.sleepHours = parseFloat(document.getElementById('sleepHours')?.value || 0);
            formData.bodyWeight = parseFloat(document.getElementById('bodyWeight')?.value || 0);
            formData.nightAwakenings = document.getElementById('nightAwakenings')?.value || '0';
            formData.wakeQuality = parseInt(document.getElementById('wakeQuality')?.value || 0);
            formData.musclePain = parseInt(document.getElementById('musclePain')?.value || 0);
            formData.painLocation = document.getElementById('painLocation')?.value || '';
            formData.generalFatigue = document.getElementById('generalFatigue')?.value || 'Modérée';
            formData.appetite = document.getElementById('appetite')?.value || 'Normal';
        }
        
        // Calculer le score
        formData.score = calculateWellbeingScore(formData);
        
        // Sauvegarder dans Firestore
        await db.collection('wellbeing_data').add(formData);
        
        showToast('✅ Bien-être enregistré avec succès !', 'success');
        
        closeWellbeingEntry();
        
        // Recharger le dashboard
        await loadSwimmerDashboard();
        
    } catch (error) {
        console.error('Erreur sauvegarde bien-être:', error);
        showToast('Erreur lors de l\'enregistrement', 'error');
    }
}

function calculateWellbeingScore(data) {
    const { sleepQuality, energyLevel, motivation, stressLevel, muscleRecovery } = data;
    return ((sleepQuality + energyLevel + motivation + (11 - stressLevel) + muscleRecovery) / 5).toFixed(1);
}

function closeWellbeingEntry() {
    const panel = document.getElementById('dataEntryPanel');
    if (panel) {
        panel.classList.remove('open');
    }
}

function addWellbeingStyles() {
    if (document.getElementById('wellbeing-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'wellbeing-styles';
    style.textContent = `
        .tab-btn {
            padding: 10px 20px;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
        }
        
        .tab-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
        }
        
        .form-range {
            width: 100%;
            height: 8px;
            border-radius: 5px;
            background: #e5e7eb;
            outline: none;
            -webkit-appearance: none;
        }
        
        .form-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #667eea;
            cursor: pointer;
        }
        
        .range-value {
            text-align: center;
            margin-top: 8px;
            font-weight: 700;
            color: #667eea;
            font-size: 1.1rem;
        }
        
        .form-control {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #667eea;
        }
    `;
    document.head.appendChild(style);
}

// ====================================
// UTILITAIRES
// ====================================

async function handleLogout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        try {
            await logout();
        } catch (error) {
            console.error('Erreur déconnexion:', error);
            alert('Erreur lors de la déconnexion');
        }
    }
}

// ====================================
// INITIALISATION
// ====================================

// Vérifier l'authentification au chargement
checkAuth();

// Rafraîchir le dashboard toutes les 5 minutes
setInterval(() => {
    if (currentSwimmerId) {
        loadSwimmerDashboard();
    }
}, 5 * 60 * 1000);
