// ============================================
// ÉQUIPE DASHBOARD - VERSION FIRESTORE
// ============================================
// Ce fichier remplace equipe-dashboard.js avec intégration Firestore complète
// Fonctionnalités: gestion équipes, génération comptes nageurs, sync temps réel

let currentCoach = null;
let currentCoachId = null;
let currentTeam = null;
let allTeams = [];
let realtimeListeners = [];

// ============================================
// INITIALISATION & AUTHENTIFICATION
// ============================================

async function initializeCoachDashboard() {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        const userData = await getUserData(user.uid);
        
        if (!userData || userData.role !== 'coach' || userData.status !== 'active') {
            console.warn('Accès refusé: rôle non-coach');
            redirectByRole(userData?.role || null);
            return;
        }
        
        currentCoach = userData;
        currentCoachId = user.uid;
        
        console.log('✅ Coach authentifié:', currentCoach.firstName, currentCoach.lastName);
        
        // Charger les équipes du coach
        await loadCoachTeams();
        
        // Configurer les listeners temps réel
        setupRealtimeListeners();
        
    } catch (error) {
        console.error('Erreur initialisation:', error);
        window.location.href = 'login.html';
    }
}

// ============================================
// CHARGEMENT ÉQUIPES
// ============================================

async function loadCoachTeams() {
    try {
        const teamsSnapshot = await db.collection('teams')
            .where('coachId', '==', currentCoachId)
            .orderBy('createdAt', 'desc')
            .get();
        
        allTeams = teamsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`📋 ${allTeams.length} équipe(s) chargée(s)`);
        
        // Mettre à jour le dropdown
        displayTeamsDropdown();
        
        // Sélectionner la première équipe si disponible
        if (allTeams.length > 0 && !currentTeam) {
            selectTeam(allTeams[0].id);
        } else {
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Erreur chargement équipes:', error);
        showToast('Erreur lors du chargement des équipes', 'error');
    }
}

function displayTeamsDropdown() {
    const dropdown = document.getElementById('teamDropdownMenu');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    if (allTeams.length === 0) {
        dropdown.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999;">
                <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p style="margin: 0;">Aucune équipe</p>
                <button onclick="showCreateTeamModal()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Créer une équipe
                </button>
            </div>
        `;
        return;
    }
    
    allTeams.forEach(team => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; cursor: pointer; transition: background 0.2s;"
                 onmouseover="this.style.background='#f5f5f5'"
                 onmouseout="this.style.background='white'"
                 onclick="selectTeam('${team.id}')">
                <div>
                    <div style="font-weight: 600; color: #333;">${team.name}</div>
                    <div style="font-size: 0.85rem; color: #666;">
                        ${team.swimmers?.length || 0} nageur(s) · ${team.category || 'N/A'}
                    </div>
                </div>
                <i class="fas fa-chevron-right" style="color: #999;"></i>
            </div>
        `;
        dropdown.appendChild(item);
    });
    
    // Ajouter bouton créer équipe
    const createBtn = document.createElement('div');
    createBtn.innerHTML = `
        <div style="border-top: 2px solid #f0f0f0; padding: 10px;">
            <button onclick="showCreateTeamModal()" style="width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-plus"></i> Nouvelle équipe
            </button>
        </div>
    `;
    dropdown.appendChild(createBtn);
}

function toggleTeamDropdown() {
    const dropdown = document.getElementById('teamDropdownMenu');
    const button = document.getElementById('teamSelectButton');
    
    if (dropdown && button) {
        dropdown.classList.toggle('show');
        button.classList.toggle('open');
    }
}

async function selectTeam(teamId) {
    try {
        // Fermer dropdown
        const dropdown = document.getElementById('teamDropdownMenu');
        const button = document.getElementById('teamSelectButton');
        if (dropdown) dropdown.classList.remove('show');
        if (button) button.classList.remove('open');
        
        // Trouver l'équipe
        const team = allTeams.find(t => t.id === teamId);
        if (!team) {
            showToast('Équipe introuvable', 'error');
            return;
        }
        
        currentTeam = team;
        
        // Mettre à jour le nom affiché
        const teamNameElement = document.getElementById('selectedTeamName');
        if (teamNameElement) {
            teamNameElement.textContent = team.name;
        }
        
        console.log('📌 Équipe sélectionnée:', team.name);
        
        // Charger les données de l'équipe
        await loadTeamData();
        
    } catch (error) {
        console.error('Erreur sélection équipe:', error);
        showToast('Erreur lors de la sélection de l\'équipe', 'error');
    }
}

// ============================================
// CHARGEMENT DONNÉES ÉQUIPE
// ============================================

async function loadTeamData() {
    try {
        showToast('Chargement des données...', 'info');
        
        // Charger les nageurs de l'équipe depuis Firestore
        const swimmersSnapshot = await db.collection('users')
            .where('teamId', '==', currentTeam.id)
            .where('role', '==', 'nageur')
            .get();
        
        const swimmers = [];
        
        for (const doc of swimmersSnapshot.docs) {
            const swimmerData = { id: doc.id, ...doc.data() };
            
            // Charger les données de chaque nageur
            const [wellbeing, performance, medical, races] = await Promise.all([
                loadSwimmerWellbeing(doc.id),
                loadSwimmerPerformance(doc.id),
                loadSwimmerMedical(doc.id),
                loadSwimmerRaces(doc.id)
            ]);
            
            swimmers.push({
                ...swimmerData,
                wellbeingData: wellbeing,
                performanceData: performance,
                medicalData: medical,
                raceData: races
            });
        }
        
        currentTeam.swimmers = swimmers;
        
        console.log(`✅ ${swimmers.length} nageur(s) chargé(s)`);
        
        // Afficher le dashboard
        displayTeamDashboard();
        
    } catch (error) {
        console.error('Erreur chargement données équipe:', error);
        showToast('Erreur lors du chargement des données', 'error');
    }
}

async function loadSwimmerWellbeing(swimmerId) {
    const snapshot = await db.collection('wellbeing_data')
        .where('swimmerId', '==', swimmerId)
        .orderBy('date', 'desc')
        .limit(30)
        .get();
    return snapshot.docs.map(doc => convertFirestoreToLocal(doc.data()));
}

async function loadSwimmerPerformance(swimmerId) {
    const snapshot = await db.collection('performance_data')
        .where('swimmerId', '==', swimmerId)
        .orderBy('date', 'desc')
        .limit(20)
        .get();
    return snapshot.docs.map(doc => convertFirestoreToLocal(doc.data()));
}

async function loadSwimmerMedical(swimmerId) {
    const snapshot = await db.collection('medical_data')
        .where('swimmerId', '==', swimmerId)
        .orderBy('date', 'desc')
        .limit(20)
        .get();
    return snapshot.docs.map(doc => convertFirestoreToLocal(doc.data()));
}

async function loadSwimmerRaces(swimmerId) {
    const snapshot = await db.collection('race_data')
        .where('swimmerId', '==', swimmerId)
        .orderBy('date', 'desc')
        .limit(20)
        .get();
    return snapshot.docs.map(doc => convertFirestoreToLocal(doc.data()));
}

function convertFirestoreToLocal(data) {
    const converted = { ...data };
    if (converted.date && converted.date.toDate) {
        converted.date = converted.date.toDate().toISOString().split('T')[0];
    }
    if (converted.timestamp) delete converted.timestamp;
    if (converted.swimmerId) delete converted.swimmerId;
    return converted;
}

// ============================================
// AFFICHAGE DASHBOARD
// ============================================

function displayTeamDashboard() {
    // Masquer l'état vide et afficher le contenu
    const emptyState = document.getElementById('teamContent');
    const analysisSection = document.getElementById('teamAnalysisSections');
    
    if (emptyState) emptyState.style.display = 'none';
    if (analysisSection) analysisSection.style.display = 'block';
    
    // Afficher les stats rapides
    displayQuickStats();
    
    // Afficher la liste des nageurs
    displaySwimmersList();
    
    // Si app.js existe, utiliser ses fonctions
    if (typeof window.loadAllSections === 'function') {
        window.loadAllSections();
    }
}

function displayQuickStats() {
    const swimmers = currentTeam.swimmers || [];
    
    // Calculer les stats
    const totalSwimmers = swimmers.length;
    const activeSwimmers = swimmers.filter(s => s.status === 'active').length;
    
    // Score bien-être moyen
    let totalWellbeing = 0;
    let wellbeingCount = 0;
    swimmers.forEach(s => {
        if (s.wellbeingData && s.wellbeingData.length > 0) {
            const lastScore = s.wellbeingData[0].score;
            if (lastScore) {
                totalWellbeing += parseFloat(lastScore);
                wellbeingCount++;
            }
        }
    });
    const avgWellbeing = wellbeingCount > 0 ? (totalWellbeing / wellbeingCount).toFixed(1) : 'N/A';
    
    // Blessures actives
    const activeInjuries = swimmers.reduce((count, s) => {
        return count + (s.medicalData?.filter(m => m.status === 'active').length || 0);
    }, 0);
    
    console.log(`📊 Stats: ${totalSwimmers} nageurs, bien-être: ${avgWellbeing}, blessures: ${activeInjuries}`);
    
    // TODO: Afficher dans l'interface (dépend de la structure HTML existante)
}

function displaySwimmersList() {
    const container = document.getElementById('swimmersList');
    if (!container) return;
    
    const swimmers = currentTeam.swimmers || [];
    
    if (swimmers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #999;">
                <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>Aucun nageur dans cette équipe</p>
                <button onclick="openGenerateSwimmerModal()" style="margin-top: 15px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-user-plus"></i> Ajouter un nageur
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = swimmers.map(swimmer => {
        const lastWellbeing = swimmer.wellbeingData?.[0];
        const score = lastWellbeing?.score || 'N/A';
        const hasAccount = swimmer.hasAccount !== false; // Par défaut true
        const lastLogin = swimmer.lastLogin ? formatDate(swimmer.lastLogin) : 'Jamais connecté';
        
        return `
            <div class="swimmer-card" style="padding: 15px; margin-bottom: 10px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">
                        ${swimmer.firstName?.[0] || '?'}${swimmer.lastName?.[0] || ''}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 1.1rem; color: #333;">
                            ${swimmer.firstName} ${swimmer.lastName}
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            ${swimmer.email || 'Pas d\'email'}
                            ${hasAccount ? `<span style="margin-left: 10px; color: #10b981;">✓ Compte actif</span>` : `<span style="margin-left: 10px; color: #f59e0b;">⚠ Pas de compte</span>`}
                        </div>
                        ${hasAccount ? `<div style="font-size: 0.85rem; color: #999; margin-top: 3px;">Dernière connexion: ${lastLogin}</div>` : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 3px;">Bien-être</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: ${getScoreColor(score)};">
                            ${score}
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        ${!hasAccount ? `
                            <button onclick="generateSwimmerAccount('${swimmer.id}')" style="padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; white-space: nowrap;">
                                <i class="fas fa-key"></i> Générer accès
                            </button>
                        ` : ''}
                        <button onclick="viewSwimmerDetails('${swimmer.id}')" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getScoreColor(score) {
    if (score === 'N/A') return '#999';
    const numScore = parseFloat(score);
    if (numScore >= 7) return '#10b981';
    if (numScore >= 5) return '#f59e0b';
    return '#ef4444';
}

function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    return date.toLocaleDateString('fr-FR');
}

// ============================================
// GÉNÉRATION COMPTE NAGEUR
// ============================================

async function generateSwimmerAccount(swimmerId) {
    try {
        const swimmer = currentTeam.swimmers.find(s => s.id === swimmerId);
        if (!swimmer) {
            showToast('Nageur introuvable', 'error');
            return;
        }
        
        // Confirmer
        const confirmation = confirm(
            `Générer un compte pour ${swimmer.firstName} ${swimmer.lastName}?\n\n` +
            `Un email sera créé automatiquement et les identifiants seront envoyés au nageur.`
        );
        
        if (!confirmation) return;
        
        showToast('Génération du compte en cours...', 'info');
        
        // Générer email et mot de passe
        const email = generateSwimmerEmail(swimmer);
        const password = generateRandomPassword();
        
        // Créer le compte Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUserId = userCredential.user.uid;
        
        // Mettre à jour Firestore avec le rôle nageur
        await db.collection('users').doc(newUserId).set({
            email: email,
            firstName: swimmer.firstName,
            lastName: swimmer.lastName,
            role: 'nageur',
            status: 'active',
            coachId: currentCoachId,
            teamId: currentTeam.id,
            hasAccount: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentCoachId
        });
        
        // Afficher les identifiants
        showCredentialsModal(email, password, swimmer);
        
        // Recharger les données
        await loadTeamData();
        
        showToast('✅ Compte créé avec succès !', 'success');
        
    } catch (error) {
        console.error('Erreur génération compte:', error);
        if (error.code === 'auth/email-already-in-use') {
            showToast('Cet email existe déjà', 'error');
        } else {
            showToast('Erreur lors de la création du compte', 'error');
        }
    }
}

function generateSwimmerEmail(swimmer) {
    const firstName = swimmer.firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lastName = swimmer.lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const club = currentCoach.club?.toLowerCase().replace(/\s+/g, '') || 'club';
    return `${firstName}.${lastName}@${club}.swim`;
}

function generateRandomPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function showCredentialsModal(email, password, swimmer) {
    const modal = document.createElement('div');
    modal.id = 'credentialsModal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
                <h2 style="margin: 0 0 20px 0; color: #10b981;">
                    <i class="fas fa-check-circle"></i> Compte créé !
                </h2>
                
                <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin: 0 0 15px 0; font-weight: 600; color: #333;">
                        Identifiants pour ${swimmer.firstName} ${swimmer.lastName}:
                    </p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Email:</div>
                        <div style="font-family: monospace; font-size: 1.1rem; color: #333; word-break: break-all;">
                            ${email}
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Mot de passe:</div>
                        <div style="font-family: monospace; font-size: 1.3rem; color: #ef4444; font-weight: bold;">
                            ${password}
                        </div>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 0.9rem; color: #92400e;">
                        <strong>⚠️ Important:</strong> Notez ces identifiants maintenant. Ils ne seront plus affichés.
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="copyCredentials('${email}', '${password}')" style="flex: 1; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-copy"></i> Copier
                    </button>
                    <button onclick="closeCredentialsModal()" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-check"></i> OK
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function copyCredentials(email, password) {
    const text = `Email: ${email}\nMot de passe: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Identifiants copiés !', 'success');
    });
}

function closeCredentialsModal() {
    const modal = document.getElementById('credentialsModal');
    if (modal) modal.remove();
}

// ============================================
// TEMPS RÉEL
// ============================================

function setupRealtimeListeners() {
    // Écouter les changements de bien-être
    const wellbeingListener = db.collection('wellbeing_data')
        .where('swimmerId', 'in', currentTeam.swimmers?.map(s => s.id) || [])
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    console.log('🔔 Nouveau bien-être ajouté');
                    // Recharger les données
                    if (currentTeam) loadTeamData();
                }
            });
        });
    
    realtimeListeners.push(wellbeingListener);
}

// ============================================
// UTILITAIRES
// ============================================

function showEmptyState() {
    const emptyState = document.getElementById('teamContent');
    const analysisSection = document.getElementById('teamAnalysisSections');
    
    if (emptyState) emptyState.style.display = 'block';
    if (analysisSection) analysisSection.style.display = 'none';
}

function viewSwimmerDetails(swimmerId) {
    // TODO: Ouvrir modal avec détails du nageur
    console.log('Voir détails nageur:', swimmerId);
}

// ============================================
// GESTION MODALS
// ============================================

function showCreateTeamModal() {
    const modal = document.getElementById('createTeamModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Réinitialiser le formulaire
        const form = document.getElementById('createTeamForm');
        if (form) form.reset();
        
        // Réinitialiser la sélection des nageurs
        const selectedSwimmers = [];
        updateSelectedSwimmersCount();
        
        // Charger tous les nageurs disponibles
        loadAvailableSwimmers();
    }
}

function closeCreateTeamModal() {
    const modal = document.getElementById('createTeamModal');
    if (modal) modal.style.display = 'none';
}

async function loadAvailableSwimmers() {
    try {
        // Récupérer tous les nageurs sans équipe ou avec équipe du coach
        const swimmersSnapshot = await db.collection('users')
            .where('role', '==', 'nageur')
            .where('coachId', '==', currentCoachId)
            .get();
        
        const swimmersList = document.getElementById('swimmersList');
        if (!swimmersList) return;
        
        const swimmers = swimmersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        if (swimmers.length === 0) {
            swimmersList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #999;">
                    <p>Aucun nageur disponible</p>
                    <button onclick="openGenerateSwimmerModal()" style="margin-top: 10px; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-user-plus"></i> Créer un nageur
                    </button>
                </div>
            `;
            return;
        }
        
        swimmersList.innerHTML = swimmers.map(swimmer => `
            <label style="display: flex; align-items: center; padding: 10px; cursor: pointer; border-radius: 6px; transition: background 0.2s;"
                   onmouseover="this.style.background='#f8f9fa'"
                   onmouseout="this.style.background='white'">
                <input type="checkbox" value="${swimmer.id}" style="margin-right: 10px;" onchange="updateSelectedSwimmersCount()">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${swimmer.firstName} ${swimmer.lastName}</div>
                    <div style="font-size: 0.85rem; color: #666;">${swimmer.email || ''}</div>
                </div>
            </label>
        `).join('');
        
    } catch (error) {
        console.error('Erreur chargement nageurs:', error);
        showToast('Erreur lors du chargement des nageurs', 'error');
    }
}

function updateSelectedSwimmersCount() {
    const swimmersList = document.getElementById('swimmersList');
    if (!swimmersList) return;
    
    const checkboxes = swimmersList.querySelectorAll('input[type="checkbox"]:checked');
    const count = checkboxes.length;
    
    const countElement = document.getElementById('selectedSwimmersCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

async function createTeam(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const teamName = form.querySelector('#teamName')?.value;
        const teamCategory = form.querySelector('#teamCategory')?.value;
        const teamSeason = form.querySelector('#teamSeason')?.value;
        
        if (!teamName) {
            showToast('Nom d\'équipe requis', 'error');
            return;
        }
        
        showToast('Création de l\'équipe...', 'info');
        
        // Récupérer les nageurs sélectionnés
        const swimmersList = document.getElementById('swimmersList');
        const checkboxes = swimmersList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedSwimmers = Array.from(checkboxes).map(cb => cb.value);
        
        // Créer l'équipe dans Firestore
        const teamRef = await db.collection('teams').add({
            name: teamName,
            coachId: currentCoachId,
            category: teamCategory || 'Non défini',
            season: teamSeason || '2024-2025',
            swimmers: selectedSwimmers,
            totalSwimmers: selectedSwimmers.length,
            activeSwimmers: selectedSwimmers.length,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Mettre à jour les nageurs avec l'ID de l'équipe
        const batch = db.batch();
        selectedSwimmers.forEach(swimmerId => {
            const swimmerRef = db.collection('users').doc(swimmerId);
            batch.update(swimmerRef, { teamId: teamRef.id });
        });
        await batch.commit();
        
        showToast('✅ Équipe créée avec succès !', 'success');
        
        closeCreateTeamModal();
        
        // Recharger les équipes
        await loadCoachTeams();
        
    } catch (error) {
        console.error('Erreur création équipe:', error);
        showToast('Erreur lors de la création de l\'équipe', 'error');
    }
}

// Attacher le handler au formulaire
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createTeamForm');
    if (form) {
        form.addEventListener('submit', createTeam);
    }
});

function openGenerateSwimmerModal() {
    // TODO: Implémenter modal de création rapide de nageur
    alert('Fonctionnalité en développement. Utilisez l\'interface admin pour créer des nageurs.');
}

function filterSwimmers() {
    const searchInput = document.getElementById('swimmerSearchInput');
    const swimmersList = document.getElementById('swimmersList');
    
    if (!searchInput || !swimmersList) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const swimmers = swimmersList.querySelectorAll('label');
    
    swimmers.forEach(swimmer => {
        const text = swimmer.textContent.toLowerCase();
        swimmer.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
}

// ============================================
// NETTOYAGE
// ============================================

window.addEventListener('beforeunload', () => {
    realtimeListeners.forEach(listener => listener());
});

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', initializeCoachDashboard);
