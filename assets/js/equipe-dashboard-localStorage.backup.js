// ============================================
// DASHBOARD ÉQUIPE - GESTION COMPLÈTE
// ============================================

let currentTeam = null;
let allSwimmers = [];

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du Dashboard Équipe');
    loadTeamsList();
    loadAllSwimmers();
    
    // Fermer le dropdown si on clique en dehors
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('teamDropdownMenu');
        const button = document.getElementById('teamSelectButton');
        
        if (dropdown && button && !button.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            button.classList.remove('open');
        }
    });
});

// ============================================
// GESTION DU DROPDOWN D'ÉQUIPE
// ============================================

function toggleTeamDropdown() {
    const dropdown = document.getElementById('teamDropdownMenu');
    const button = document.getElementById('teamSelectButton');
    
    dropdown.classList.toggle('show');
    button.classList.toggle('open');
}

function selectTeamFromDropdown(teamId, teamName) {
    document.getElementById('selectedTeamName').textContent = teamName;
    document.getElementById('teamDropdownMenu').classList.remove('show');
    document.getElementById('teamSelectButton').classList.remove('open');
    
    // Charger le dashboard de l'équipe
    loadTeamDashboardById(teamId);
}

function loadTeamDashboardById(teamId) {
    if (!teamId) {
        showEmptyState();
        return;
    }
    
    currentTeam = getTeamById(teamId);
    
    if (!currentTeam) {
        alert('Équipe non trouvée');
        return;
    }
    
    console.log('🎯 Chargement dashboard pour:', currentTeam.name);
    
    // Afficher les stats rapides
    displayQuickStats();
    
    // Afficher les sections d'analyse
    document.getElementById('teamContent').style.display = 'none';
    document.getElementById('teamAnalysisSections').style.display = 'block';
    
    // Charger toutes les sections
    loadAllSections();
}

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================

function loadTeamsList() {
    const teams = getTeams();
    const dropdown = document.getElementById('teamDropdownMenu');
    
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    if (teams.length === 0) {
        dropdown.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999;">
                <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p style="margin: 0;">Aucune équipe disponible</p>
                <button onclick="showCreateTeamModal()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Créer une équipe
                </button>
            </div>
        `;
        return;
    }
    
    teams.forEach(team => {
        const swimmerCount = team.swimmerIds ? team.swimmerIds.length : 0;
        const item = document.createElement('div');
        item.className = 'team-dropdown-item';
        item.style.cssText = 'display: flex; align-items: center; gap: 12px; position: relative; padding: 12px 15px;';
        
        item.innerHTML = `
            <div class="team-item-icon" onclick="selectTeamFromDropdown('${team.id}', '${team.name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                <i class="fas fa-users"></i>
            </div>
            <div class="team-item-info" onclick="selectTeamFromDropdown('${team.id}', '${team.name.replace(/'/g, "\\'")}')" style="flex: 1; cursor: pointer;">
                <div class="team-item-name">${team.name}</div>
                <div class="team-item-count">${swimmerCount} nageur${swimmerCount > 1 ? 's' : ''}</div>
            </div>
            <button 
                onclick="event.stopPropagation(); showEditTeamModal('${team.id}')" 
                style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s;"
                onmouseover="this.style.background='#5568d3'"
                onmouseout="this.style.background='#667eea'"
                title="Modifier l'équipe"
            >
                <i class="fas fa-edit"></i>
            </button>
            <button 
                onclick="event.stopPropagation(); deleteTeam('${team.id}', '${team.name.replace(/'/g, "\\'")}')" 
                style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; margin-left: 5px;"
                onmouseover="this.style.background='#c0392b'"
                onmouseout="this.style.background='#e74c3c'"
                title="Supprimer l'équipe"
            >
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        dropdown.appendChild(item);
    });
}

// ============================================
// GESTION DES ÉQUIPES
// ============================================

function showTeamManagement() {
    // Ouvrir le modal de création d'équipe
    showCreateTeamModal();
}

function showCreateTeamModal() {
    const modal = document.getElementById('createTeamModal');
    
    // Réinitialiser le formulaire
    document.getElementById('createTeamForm').reset();
    document.getElementById('teamModalTitle').textContent = 'Créer une Équipe';
    document.getElementById('teamSubmitButton').textContent = 'Créer l\'équipe';
    document.getElementById('createTeamForm').setAttribute('data-mode', 'create');
    document.getElementById('createTeamForm').removeAttribute('data-team-id');
    
    // Charger la liste des nageurs
    loadSwimmersForSelection();
    
    modal.style.display = 'flex';
}

function showEditTeamModal(teamId) {
    const team = getTeamById(teamId);
    if (!team) {
        alert('Équipe non trouvée');
        return;
    }
    
    const modal = document.getElementById('createTeamModal');
    
    // Remplir le formulaire avec les données de l'équipe
    document.getElementById('teamName').value = team.name;
    document.getElementById('teamCategory').value = team.category || '';
    document.getElementById('teamModalTitle').textContent = 'Modifier l\'Équipe';
    document.getElementById('teamSubmitButton').textContent = 'Enregistrer les modifications';
    document.getElementById('createTeamForm').setAttribute('data-mode', 'edit');
    document.getElementById('createTeamForm').setAttribute('data-team-id', teamId);
    
    // Charger la liste des nageurs avec les nageurs de l'équipe pré-cochés
    loadSwimmersForSelection(team.swimmerIds || []);
    
    modal.style.display = 'flex';
}

function closeCreateTeamModal() {
    document.getElementById('createTeamModal').style.display = 'none';
}

function loadSwimmersForSelection(preSelectedIds = []) {
    const swimmersList = document.getElementById('swimmersList');
    const swimmers = getAllSwimmers();
    
    if (swimmers.length === 0) {
        swimmersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-user-plus" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p style="margin: 0;">Aucun nageur disponible</p>
                <a href="index.html" style="display: inline-block; margin-top: 10px; color: #667eea; text-decoration: none; font-weight: 600;">
                    <i class="fas fa-plus"></i> Ajouter un nageur
                </a>
            </div>
        `;
        return;
    }
    
    swimmersList.innerHTML = '';
    
    swimmers.forEach(swimmer => {
        const swimmerItem = document.createElement('div');
        swimmerItem.className = 'swimmer-checkbox-item';
        swimmerItem.setAttribute('data-swimmer-name', (swimmer.name || '').toLowerCase());
        swimmerItem.style.cssText = `
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        const isChecked = preSelectedIds.includes(swimmer.id) ? 'checked' : '';
        
        swimmerItem.innerHTML = `
            <input 
                type="checkbox" 
                id="swimmer_${swimmer.id}" 
                value="${swimmer.id}"
                onchange="updateSelectedCount()"
                style="width: 18px; height: 18px; cursor: pointer;"
                ${isChecked}
            >
            <label for="swimmer_${swimmer.id}" style="flex: 1; cursor: pointer; margin: 0;">
                <div style="font-weight: 600; color: #333; margin-bottom: 3px;">
                    ${swimmer.name || 'N/A'}
                </div>
                <div style="font-size: 0.85rem; color: #666;">
                    👤 ${swimmer.username || 'N/A'} • 📧 ${swimmer.email || 'N/A'}
                </div>
            </label>
        `;
        
        swimmerItem.onmouseover = () => swimmerItem.style.background = '#f8f9fa';
        swimmerItem.onmouseout = () => swimmerItem.style.background = 'white';
        
        // Permettre de cliquer sur toute la div pour cocher/décocher
        swimmerItem.onclick = (e) => {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = swimmerItem.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                updateSelectedCount();
            }
        };
        
        swimmersList.appendChild(swimmerItem);
    });
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('#swimmersList input[type="checkbox"]:checked');
    document.getElementById('selectedSwimmersCount').textContent = checkboxes.length;
}

function filterSwimmers() {
    const searchText = document.getElementById('swimmerSearchInput').value.toLowerCase();
    const swimmerItems = document.querySelectorAll('.swimmer-checkbox-item');
    
    swimmerItems.forEach(item => {
        const swimmerName = item.getAttribute('data-swimmer-name');
        if (swimmerName.includes(searchText)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function saveNewTeam(event) {
    event.preventDefault();
    
    const teamName = document.getElementById('teamName').value.trim();
    const teamCategory = document.getElementById('teamCategory').value;
    const mode = document.getElementById('createTeamForm').getAttribute('data-mode');
    const teamId = document.getElementById('createTeamForm').getAttribute('data-team-id');
    
    if (!teamName) {
        alert('Veuillez saisir un nom d\'équipe');
        return;
    }
    
    // Récupérer les nageurs sélectionnés
    const selectedSwimmers = [];
    const checkboxes = document.querySelectorAll('#swimmersList input[type="checkbox"]:checked');
    checkboxes.forEach(cb => selectedSwimmers.push(cb.value));
    
    const teams = getTeams();
    
    if (mode === 'edit' && teamId) {
        // Mode édition
        const teamIndex = teams.findIndex(t => t.id === teamId);
        if (teamIndex !== -1) {
            teams[teamIndex].name = teamName;
            teams[teamIndex].category = teamCategory;
            teams[teamIndex].swimmerIds = selectedSwimmers;
            teams[teamIndex].updatedAt = new Date().toISOString();
            
            saveTeamsToStorage(teams);
            alert(`✅ Équipe "${teamName}" modifiée avec succès !\n${selectedSwimmers.length} nageur(s) dans l'équipe.`);
            
            // Recharger la liste et le dashboard si cette équipe est affichée
            closeCreateTeamModal();
            loadTeamsList();
            if (currentTeam && currentTeam.id === teamId) {
                selectTeamFromDropdown(teamId, teamName);
            }
        }
    } else {
        // Mode création
        const newTeam = {
            id: Date.now().toString(),
            name: teamName,
            category: teamCategory,
            swimmerIds: selectedSwimmers,
            createdAt: new Date().toISOString()
        };
        
        teams.push(newTeam);
        saveTeamsToStorage(teams);
        
        alert(`✅ Équipe "${teamName}" créée avec succès !\n${selectedSwimmers.length} nageur(s) ajouté(s).`);
        
        closeCreateTeamModal();
        loadTeamsList();
        selectTeamFromDropdown(newTeam.id, newTeam.name);
    }
}

function saveTeamsToStorage(teams) {
    localStorage.setItem('teams', JSON.stringify(teams));
}

function loadAllSwimmers() {
    allSwimmers = getAllSwimmers();
    console.log(`📊 ${allSwimmers.length} nageurs chargés`);
}

function getTeams() {
    const teams = localStorage.getItem('teams');
    return teams ? JSON.parse(teams) : [];
}

function getAllSwimmers() {
    const swimmers = localStorage.getItem('swimmers');
    return swimmers ? JSON.parse(swimmers) : [];
}

function getTeamById(teamId) {
    const teams = getTeams();
    return teams.find(t => t.id === teamId);
}

function getSwimmerById(swimmerId) {
    return allSwimmers.find(s => s.id === swimmerId);
}

// ============================================
// CHARGEMENT DU DASHBOARD ÉQUIPE
// ============================================

function showEmptyState() {
    document.getElementById('teamQuickStats').style.display = 'none';
    document.getElementById('teamContent').style.display = 'block';
    document.getElementById('teamAnalysisSections').style.display = 'none';
    currentTeam = null;
}

// ============================================
// STATS RAPIDES
// ============================================

function displayQuickStats() {
    const teamSwimmers = getTeamSwimmers();
    const statsDiv = document.getElementById('teamQuickStats');
    
    // Nombre de nageurs
    document.getElementById('quickNageurs').textContent = teamSwimmers.length;
    
    // Taux de présence moyen
    const avgPresence = calculateTeamAverageAttendance(teamSwimmers);
    document.getElementById('quickPresence').textContent = avgPresence + '%';
    
    // Nombre total de sessions
    const totalSessions = calculateTotalSessions(teamSwimmers);
    document.getElementById('quickSessions').textContent = totalSessions;
    
    // Bien-être moyen
    const avgWellbeing = calculateTeamAverageWellbeing(teamSwimmers);
    document.getElementById('quickBienEtre').textContent = avgWellbeing;
    
    statsDiv.style.display = 'grid';
}

function getTeamSwimmers() {
    if (!currentTeam || !currentTeam.swimmerIds) return [];
    
    return currentTeam.swimmerIds
        .map(id => getSwimmerById(id))
        .filter(s => s !== undefined);
}

function calculateTeamAverageAttendance(swimmers) {
    if (swimmers.length === 0) return 0;
    
    let totalAttendance = 0;
    let count = 0;
    
    swimmers.forEach(swimmer => {
        if (swimmer.medicalData && swimmer.medicalData.length > 0) {
            const present = swimmer.medicalData.filter(d => d.available).length;
            const total = swimmer.medicalData.length;
            if (total > 0) {
                totalAttendance += (present / total) * 100;
                count++;
            }
        }
    });
    
    return count > 0 ? Math.round(totalAttendance / count) : 0;
}

function calculateTotalSessions(swimmers) {
    let total = 0;
    swimmers.forEach(swimmer => {
        if (swimmer.trainingData) {
            total += swimmer.trainingData.length;
        }
    });
    return total;
}

function calculateTeamAverageWellbeing(swimmers) {
    if (swimmers.length === 0) return '0/10';
    
    let totalScore = 0;
    let count = 0;
    
    swimmers.forEach(swimmer => {
        if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
            const recent = swimmer.wellbeingData[swimmer.wellbeingData.length - 1];
            const score = (
                (recent.sleepQuality || 0) +
                (10 - (recent.fatigue || 0)) +
                (recent.energy || 0) +
                (recent.motivation || 0) +
                (10 - (recent.stress || 0)) +
                (recent.recovery || 0)
            ) / 6;
            totalScore += score;
            count++;
        }
    });
    
    const avg = count > 0 ? (totalScore / count).toFixed(1) : 0;
    return avg + '/10';
}

// ============================================
// TOGGLE SECTIONS
// ============================================

function toggleTeamSection(sectionName) {
    const section = document.getElementById(sectionName + 'Section');
    
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        loadSectionContent(sectionName);
    } else {
        section.style.display = 'none';
    }
}

// ============================================
// CHARGEMENT DES SECTIONS
// ============================================

function loadAllSections() {
    // Les sections se chargeront quand l'utilisateur clique dessus
    console.log('✅ Sections prêtes à être chargées');
}

function loadSectionContent(sectionName) {
    const swimmers = getTeamSwimmers();
    
    switch(sectionName) {
        case 'global':
            loadGlobalSection(swimmers);
            break;
        case 'wellbeing':
            loadWellbeingSection(swimmers);
            break;
        case 'performance':
            loadPerformanceSection(swimmers);
            break;
        case 'medical':
            loadMedicalSection(swimmers);
            break;
        case 'race':
            loadRaceSection(swimmers);
            break;
        case 'technical':
            loadTechnicalSection(swimmers);
            break;
        case 'attendance':
            loadAttendanceSection(swimmers);
            break;
    }
}

// ============================================
// SECTION 1: VUE D'ENSEMBLE GLOBALE
// ============================================

function loadGlobalSection(swimmers) {
    const content = document.getElementById('globalContent');
    
    // Calculer des statistiques globales complètes
    const globalStats = calculateGlobalStats(swimmers);
    
    let html = `
        <h3 style="margin-bottom: 25px; color: #fd79a8;">
            <i class="fas fa-chart-pie"></i> Synthèse Globale de l'Équipe
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">${swimmers.length}</div>
                <div style="font-size: 1rem; opacity: 0.9;">👥 Nageurs Actifs</div>
            </div>
            
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">${globalStats.totalDataPoints}</div>
                <div style="font-size: 1rem; opacity: 0.9;">📊 Données Totales</div>
            </div>
            
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">${globalStats.attendanceRate}%</div>
                <div style="font-size: 1rem; opacity: 0.9;">✅ Taux Présence</div>
            </div>
            
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">${globalStats.wellbeingScore}/10</div>
                <div style="font-size: 1rem; opacity: 0.9;">😊 Bien-être Moyen</div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #667eea;">
            <h4 style="margin: 0 0 15px 0; color: #333;">📈 Statistiques Détaillées</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div style="padding: 15px; background: white; border-radius: 8px;">
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">🩺 Bien-être</div>
                    <div style="color: #333; font-weight: 600;">${globalStats.wellbeingEntries} saisies | ${globalStats.swimmersWithWellbeing}/${swimmers.length} nageurs</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px;">
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">💪 Performances</div>
                    <div style="color: #333; font-weight: 600;">${globalStats.performanceEntries} tests | ${globalStats.swimmersWithPerformance}/${swimmers.length} nageurs</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px;">
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">🏥 Médical</div>
                    <div style="color: #333; font-weight: 600;">${globalStats.medicalEntries} suivis | ${globalStats.availableCount} disponible(s)</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px;">
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">🏆 Compétitions</div>
                    <div style="color: #333; font-weight: 600;">${globalStats.raceEntries} courses | ${globalStats.recordsCount} record(s)</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px;">
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">🏊 Technique</div>
                    <div style="color: #333; font-weight: 600;">${globalStats.technicalEntries} évaluations | ${globalStats.swimmersWithTechnical}/${swimmers.length} nageurs</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px;">
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">📅 Assiduité</div>
                    <div style="color: #333; font-weight: 600;">${globalStats.attendanceEntries} enregistrements | ${globalStats.absencesCount} absence(s)</div>
                </div>
            </div>
        </div>
        
        <h4 style="margin: 30px 0 15px 0; color: #333;">📋 Liste des Nageurs</h4>
        <div style="display: grid; gap: 15px;">
    `;
    
    swimmers.forEach(swimmer => {
        const wellbeingScore = getSwimmerWellbeingScore(swimmer);
        const dataCount = (
            (swimmer.wellbeingData?.length || 0) +
            (swimmer.performanceData?.length || 0) +
            (swimmer.medicalData?.length || 0) +
            (swimmer.raceData?.length || 0) +
            (swimmer.technicalData?.length || 0) +
            (swimmer.attendanceData?.length || 0)
        );
        
        html += `
            <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #667eea; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-weight: 600; font-size: 1.1rem; color: #333; margin-bottom: 5px;">
                        ${swimmer.name || 'N/A'}
                    </div>
                    <div style="color: #666; font-size: 0.9rem;">
                        👤 ${swimmer.username || 'N/A'} | 📧 ${swimmer.email || 'N/A'}
                    </div>
                </div>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #4facfe;">${dataCount}</div>
                        <div style="font-size: 0.8rem; color: #666;">Données</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #ff6b35;">${wellbeingScore}/10</div>
                        <div style="font-size: 0.8rem; color: #666;">Bien-être</div>
                    </div>
                    <button onclick="goToSwimmerDashboard('${swimmer.id}')" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-arrow-right"></i> Voir
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    if (swimmers.length === 0) {
        html = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px;"></i><p>Aucun nageur dans cette équipe</p></div>';
    }
    
    content.innerHTML = html;
}

function calculateGlobalStats(swimmers) {
    let wellbeingEntries = 0, performanceEntries = 0, medicalEntries = 0;
    let raceEntries = 0, technicalEntries = 0, attendanceEntries = 0;
    let swimmersWithWellbeing = 0, swimmersWithPerformance = 0, swimmersWithTechnical = 0;
    let totalWellbeingScores = 0, wellbeingScoreCount = 0;
    let availableCount = 0, recordsCount = 0, absencesCount = 0;
    let totalPresences = 0;
    
    swimmers.forEach(swimmer => {
        // Bien-être
        if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
            wellbeingEntries += swimmer.wellbeingData.length;
            swimmersWithWellbeing++;
            const score = getSwimmerWellbeingScore(swimmer);
            if (score > 0) {
                totalWellbeingScores += parseFloat(score);
                wellbeingScoreCount++;
            }
        }
        
        // Performance
        if (swimmer.performanceData && swimmer.performanceData.length > 0) {
            performanceEntries += swimmer.performanceData.length;
            swimmersWithPerformance++;
        }
        
        // Médical
        if (swimmer.medicalData && swimmer.medicalData.length > 0) {
            medicalEntries += swimmer.medicalData.length;
            const recent = swimmer.medicalData[swimmer.medicalData.length - 1];
            if (recent.available === true || recent.available === 'true' || recent.available === 'yes') {
                availableCount++;
            }
        } else {
            availableCount++;
        }
        
        // Compétitions
        if (swimmer.raceData && swimmer.raceData.length > 0) {
            raceEntries += swimmer.raceData.length;
            swimmer.raceData.forEach(race => {
                if (race.personalRecord === true || race.personalRecord === 'yes') {
                    recordsCount++;
                }
            });
        }
        
        // Technique
        if (swimmer.technicalData && swimmer.technicalData.length > 0) {
            technicalEntries += swimmer.technicalData.length;
            swimmersWithTechnical++;
        }
        
        // Assiduité
        if (swimmer.attendanceData && swimmer.attendanceData.length > 0) {
            attendanceEntries += swimmer.attendanceData.length;
            swimmer.attendanceData.forEach(record => {
                if (record.status === 'present' || record.status === 'présent') {
                    totalPresences++;
                } else if (record.status === 'absent' || record.status === 'absence') {
                    absencesCount++;
                }
            });
        }
    });
    
    const totalDataPoints = wellbeingEntries + performanceEntries + medicalEntries + 
                           raceEntries + technicalEntries + attendanceEntries;
    
    const attendanceRate = attendanceEntries > 0 ? 
        Math.round((totalPresences / attendanceEntries) * 100) : 100;
    
    const wellbeingScore = wellbeingScoreCount > 0 ? 
        (totalWellbeingScores / wellbeingScoreCount).toFixed(1) : '0.0';
    
    return {
        totalDataPoints,
        wellbeingEntries,
        performanceEntries,
        medicalEntries,
        raceEntries,
        technicalEntries,
        attendanceEntries,
        swimmersWithWellbeing,
        swimmersWithPerformance,
        swimmersWithTechnical,
        availableCount,
        recordsCount,
        absencesCount,
        attendanceRate,
        wellbeingScore
    };
}

function getSwimmerWellbeingScore(swimmer) {
    if (!swimmer.wellbeingData || swimmer.wellbeingData.length === 0) return 0;
    
    // Utiliser la donnée la plus récente
    const recent = swimmer.wellbeingData[swimmer.wellbeingData.length - 1];
    
    // ✅ NOUVEAU: Utiliser le score calculé automatiquement s'il existe
    if (recent.score) {
        return parseFloat(recent.score).toFixed(1);
    }
    
    // Sinon calculer manuellement avec les 5 métriques subjectives
    const sleepQuality = recent.sleepQuality || 0;
    const energyLevel = recent.energyLevel || 0;
    const motivation = recent.motivation || 0;
    const stressLevel = recent.stressLevel || 0;
    const muscleRecovery = recent.muscleRecovery || 0;
    
    // Formule alignée avec app.js
    const score = (
        sleepQuality + 
        energyLevel + 
        motivation + 
        (11 - stressLevel) + 
        muscleRecovery
    ) / 5;
    
    return score.toFixed(1);
}

function goToSwimmerDashboard(swimmerId) {
    window.location.href = `dashboard.html?id=${swimmerId}`;
}

// ============================================
// SECTION 2: BIEN-ÊTRE & CONDITION
// ============================================

function loadWellbeingSection(swimmers) {
    const content = document.getElementById('wellbeingContent');
    
    const wellbeingStats = calculateTeamWellbeingStats(swimmers);
    
    let html = `
        <h3 style="margin-bottom: 25px; color: #ff6b35;">
            <i class="fas fa-heart"></i> Analyse du Bien-être de l'Équipe
        </h3>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${wellbeingStats.globalScore}/10</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Score Global Équipe</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">📊 ${wellbeingStats.totalEntries} saisies totales</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">👥 ${wellbeingStats.swimmersWithData}/${swimmers.length} nageurs avec données</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">📅 ${wellbeingStats.recentEntries} saisies (7 derniers jours)</div>
                </div>
            </div>
        </div>
        
        <h4 style="margin: 25px 0 15px 0; color: #333;">📊 Métriques Subjectives (1-10)</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.sleepQuality}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">😴 Qualité Sommeil</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f9a825 0%, #fbc02d 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.energyLevel}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">⚡ Énergie</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #0288d1 0%, #03a9f4 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.motivation}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🎯 Motivation</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #c2185b 0%, #d81b60 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.stressLevel}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">😰 Stress</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #7b1fa2 0%, #8e24aa 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.muscleRecovery}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">💪 Récupération</div>
            </div>
        </div>
        
        <h4 style="margin: 25px 0 15px 0; color: #333;">📈 Données Quantitatives</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="padding: 20px; background: #f0f8ff; border-radius: 10px; border-left: 4px solid #2196f3;">
                <div style="font-size: 1.8rem; font-weight: bold; color: #2196f3; margin-bottom: 5px;">${wellbeingStats.sleepHours}h</div>
                <div style="color: #666; font-size: 0.9rem;">🕐 Heures de sommeil moyennes</div>
            </div>
            <div style="padding: 20px; background: #fff3e0; border-radius: 10px; border-left: 4px solid #ff9800;">
                <div style="font-size: 1.8rem; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${wellbeingStats.bodyWeight}kg</div>
                <div style="color: #666; font-size: 0.9rem;">⚖️ Poids corporel moyen</div>
            </div>
            <div style="padding: 20px; background: #ffebee; border-radius: 10px; border-left: 4px solid #f44336;">
                <div style="font-size: 1.8rem; font-weight: bold; color: #f44336; margin-bottom: 5px;">${wellbeingStats.musclePain}/10</div>
                <div style="color: #666; font-size: 0.9rem;">🩹 Douleur musculaire moyenne</div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b35;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📊 Interprétation & Recommandations</h4>
            <div style="color: #666; line-height: 1.6;">
                ${getWellbeingInterpretation(wellbeingStats)}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

function calculateTeamWellbeingStats(swimmers) {
    // ✅ Collecter TOUTES les données de bien-être de TOUS les nageurs
    let allWellbeingData = [];
    swimmers.forEach(swimmer => {
        if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
            allWellbeingData.push(...swimmer.wellbeingData);
        }
    });
    
    if (allWellbeingData.length === 0) {
        return {
            sleepQuality: 0,
            energyLevel: 0,
            motivation: 0,
            stressLevel: 0,
            muscleRecovery: 0,
            sleepHours: 0,
            bodyWeight: 0,
            musclePain: 0,
            globalScore: 0,
            totalEntries: 0,
            swimmersWithData: 0,
            recentEntries: 0
        };
    }
    
    // Calculer les moyennes de tous les champs
    let totals = {
        sleepQuality: 0,
        energyLevel: 0,
        motivation: 0,
        stressLevel: 0,
        muscleRecovery: 0,
        sleepHours: 0,
        bodyWeight: 0,
        musclePain: 0,
        score: 0
    };
    
    let counts = {
        sleepQuality: 0,
        energyLevel: 0,
        motivation: 0,
        stressLevel: 0,
        muscleRecovery: 0,
        sleepHours: 0,
        bodyWeight: 0,
        musclePain: 0,
        score: 0
    };
    
    allWellbeingData.forEach(entry => {
        if (entry.sleepQuality) { totals.sleepQuality += entry.sleepQuality; counts.sleepQuality++; }
        if (entry.energyLevel) { totals.energyLevel += entry.energyLevel; counts.energyLevel++; }
        if (entry.motivation) { totals.motivation += entry.motivation; counts.motivation++; }
        if (entry.stressLevel) { totals.stressLevel += entry.stressLevel; counts.stressLevel++; }
        if (entry.muscleRecovery) { totals.muscleRecovery += entry.muscleRecovery; counts.muscleRecovery++; }
        if (entry.sleepHours) { totals.sleepHours += entry.sleepHours; counts.sleepHours++; }
        if (entry.bodyWeight) { totals.bodyWeight += entry.bodyWeight; counts.bodyWeight++; }
        if (entry.musclePain !== undefined && entry.musclePain !== null) { totals.musclePain += entry.musclePain; counts.musclePain++; }
        if (entry.score) { totals.score += entry.score; counts.score++; }
    });
    
    // Compter les entrées des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = allWellbeingData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo;
    }).length;
    
    const stats = {
        sleepQuality: counts.sleepQuality > 0 ? (totals.sleepQuality / counts.sleepQuality).toFixed(1) : 0,
        energyLevel: counts.energyLevel > 0 ? (totals.energyLevel / counts.energyLevel).toFixed(1) : 0,
        motivation: counts.motivation > 0 ? (totals.motivation / counts.motivation).toFixed(1) : 0,
        stressLevel: counts.stressLevel > 0 ? (totals.stressLevel / counts.stressLevel).toFixed(1) : 0,
        muscleRecovery: counts.muscleRecovery > 0 ? (totals.muscleRecovery / counts.muscleRecovery).toFixed(1) : 0,
        sleepHours: counts.sleepHours > 0 ? (totals.sleepHours / counts.sleepHours).toFixed(1) : 0,
        bodyWeight: counts.bodyWeight > 0 ? (totals.bodyWeight / counts.bodyWeight).toFixed(1) : 0,
        musclePain: counts.musclePain > 0 ? (totals.musclePain / counts.musclePain).toFixed(1) : 0,
        globalScore: counts.score > 0 ? (totals.score / counts.score).toFixed(1) : 0,
        totalEntries: allWellbeingData.length,
        swimmersWithData: swimmers.filter(s => s.wellbeingData && s.wellbeingData.length > 0).length,
        recentEntries: recentEntries
    };
    
    return stats;
}

function getWellbeingInterpretation(stats) {
    const globalScore = parseFloat(stats.globalScore) || 0;
    const sleepQuality = parseFloat(stats.sleepQuality) || 0;
    const energyLevel = parseFloat(stats.energyLevel) || 0;
    const stressLevel = parseFloat(stats.stressLevel) || 0;
    const musclePain = parseFloat(stats.musclePain) || 0;
    
    let interpretation = '';
    let recommendations = [];
    
    // Analyse du score global
    if (globalScore >= 7.5) {
        interpretation = '✅ <strong>Excellente condition générale</strong> - L\'équipe montre des signes de bien-être optimal.';
        recommendations.push('Maintenir le rythme actuel d\'entraînement');
    } else if (globalScore >= 6.0) {
        interpretation = '⚠️ <strong>Condition correcte mais vigilance nécessaire</strong> - Quelques signaux à surveiller.';
        recommendations.push('Surveiller l\'évolution quotidienne des indicateurs');
    } else {
        interpretation = '🚨 <strong>Signes de fatigue importante</strong> - Intervention recommandée.';
        recommendations.push('Envisager une période de récupération ou réduction de charge');
    }
    
    // Analyse détaillée
    if (sleepQuality < 6.0) {
        recommendations.push('⚠️ <strong>Qualité de sommeil insuffisante</strong> - Sensibiliser sur l\'importance du sommeil');
    }
    
    if (energyLevel < 6.0) {
        recommendations.push('⚠️ <strong>Niveau d\'énergie bas</strong> - Vérifier nutrition et hydratation');
    }
    
    if (stressLevel > 7.0) {
        recommendations.push('🚨 <strong>Stress élevé</strong> - Envisager des séances de relaxation ou mental coaching');
    }
    
    if (musclePain > 6.0) {
        recommendations.push('🩹 <strong>Douleurs musculaires significatives</strong> - Renforcer séances de récupération/étirements');
    }
    
    if (stats.swimmersWithData < stats.totalEntries * 0.5) {
        recommendations.push('📊 <strong>Données incomplètes</strong> - Encourager tous les nageurs à saisir régulièrement leurs données');
    }
    
    let html = `
        <p style="margin: 0 0 15px 0; font-size: 1.05rem;">
            ${interpretation}
        </p>
    `;
    
    if (recommendations.length > 0) {
        html += '<p style="margin: 10px 0 5px 0; font-weight: 600;">Recommandations :</p><ul style="margin: 5px 0 0 0; padding-left: 20px;">';
        recommendations.forEach(rec => {
            html += `<li style="margin-bottom: 8px;">${rec}</li>`;
        });
        html += '</ul>';
    }
    
    return html;
}

// ============================================
// SECTION 3: PERFORMANCE PHYSIQUE
// ============================================

function loadPerformanceSection(swimmers) {
    const content = document.getElementById('performanceContent');
    
    const perfStats = calculateTeamPerformanceStats(swimmers);
    
    let html = `
        <h3 style="margin-bottom: 25px; color: #8e44ad;">
            <i class="fas fa-dumbbell"></i> Performance Physique de l'Équipe
        </h3>
        
        <div style="background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-size: 1.3rem; font-weight: bold;">Performances Physiques</div>
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">Suivi des capacités athlétiques</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">📊 ${perfStats.totalEntries} tests effectués</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">👥 ${perfStats.swimmersWithData}/${swimmers.length} nageurs évalués</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${perfStats.vma} km/h</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🏃 VMA Moyenne</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${perfStats.legStrength} cm</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🦵 Détente Jambes</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${perfStats.shoulderStrength}/min</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">💪 Force Épaules</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${perfStats.coreStrength}s</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🔥 Gainage</div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #8e44ad;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📈 Analyse & Recommandations</h4>
            <div style="color: #666; line-height: 1.6;">
                ${getPerformanceRecommendations(perfStats)}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

function calculateTeamPerformanceStats(swimmers) {
    // Collecter TOUTES les données de performance de TOUS les nageurs
    const allPerformanceData = [];
    swimmers.forEach(swimmer => {
        if (swimmer.performanceData && Array.isArray(swimmer.performanceData)) {
            allPerformanceData.push(...swimmer.performanceData);
        }
    });
    
    // Compter les nageurs ayant des données
    const swimmersWithData = swimmers.filter(s => s.performanceData && s.performanceData.length > 0).length;
    
    // Initialiser les compteurs pour chaque métrique
    const metrics = {
        vma: { sum: 0, count: 0 },
        legStrength: { sum: 0, count: 0 },
        shoulderStrength: { sum: 0, count: 0 },
        coreStrength: { sum: 0, count: 0 }
    };
    
    // Agréger toutes les données
    allPerformanceData.forEach(entry => {
        if (entry.vma) {
            metrics.vma.sum += parseFloat(entry.vma);
            metrics.vma.count++;
        }
        if (entry.legStrength) {
            metrics.legStrength.sum += parseFloat(entry.legStrength);
            metrics.legStrength.count++;
        }
        if (entry.shoulderStrength) {
            metrics.shoulderStrength.sum += parseFloat(entry.shoulderStrength);
            metrics.shoulderStrength.count++;
        }
        if (entry.coreStrength) {
            metrics.coreStrength.sum += parseFloat(entry.coreStrength);
            metrics.coreStrength.count++;
        }
    });
    
    // Calculer les moyennes
    const stats = {
        vma: metrics.vma.count > 0 ? (metrics.vma.sum / metrics.vma.count).toFixed(1) : '0.0',
        legStrength: metrics.legStrength.count > 0 ? Math.round(metrics.legStrength.sum / metrics.legStrength.count) : 0,
        shoulderStrength: metrics.shoulderStrength.count > 0 ? Math.round(metrics.shoulderStrength.sum / metrics.shoulderStrength.count) : 0,
        coreStrength: metrics.coreStrength.count > 0 ? Math.round(metrics.coreStrength.sum / metrics.coreStrength.count) : 0,
        totalEntries: allPerformanceData.length,
        swimmersWithData: swimmersWithData
    };
    
    return stats;
}

function getPerformanceRecommendations(stats) {
    let analysis = '';
    let recommendations = [];
    
    const vma = parseFloat(stats.vma);
    const legStrength = parseInt(stats.legStrength);
    const shoulderStrength = parseInt(stats.shoulderStrength);
    const coreStrength = parseInt(stats.coreStrength);
    
    // Analyse globale
    let goodMetrics = 0;
    if (vma >= 12) goodMetrics++;
    if (legStrength >= 40) goodMetrics++;
    if (shoulderStrength >= 30) goodMetrics++;
    if (coreStrength >= 60) goodMetrics++;
    
    if (goodMetrics === 4) {
        analysis = '✅ <strong>Excellentes performances physiques globales</strong> - L\'équipe présente des capacités athlétiques très satisfaisantes.';
        recommendations.push('Maintenir le travail actuel et les tests réguliers');
    } else if (goodMetrics >= 2) {
        analysis = '⚠️ <strong>Performances correctes mais perfectibles</strong> - Certains aspects méritent attention.';
    } else {
        analysis = '🚨 <strong>Amélioration nécessaire</strong> - Plusieurs domaines nécessitent un travail ciblé.';
    }
    
    // Analyses détaillées par métrique
    if (vma < 12) {
        recommendations.push('🏃 <strong>VMA moyenne faible (' + vma + ' km/h)</strong> - Augmenter le volume de travail aérobie et fractionné');
    } else if (vma >= 14) {
        recommendations.push('✅ <strong>Excellente VMA</strong> - Capacité aérobie optimale');
    }
    
    if (legStrength < 40) {
        recommendations.push('🦵 <strong>Détente jambes à améliorer (' + legStrength + ' cm)</strong> - Renforcer pliométrie et explosivité');
    } else if (legStrength >= 50) {
        recommendations.push('✅ <strong>Excellente détente</strong> - Puissance des jambes optimale');
    }
    
    if (shoulderStrength < 30) {
        recommendations.push('💪 <strong>Force épaules insuffisante (' + shoulderStrength + '/min)</strong> - Travail spécifique recommandé (pompes, élastiques)');
    } else if (shoulderStrength >= 40) {
        recommendations.push('✅ <strong>Excellente force épaules</strong> - Endurance musculaire optimale');
    }
    
    if (coreStrength < 60) {
        recommendations.push('🔥 <strong>Gainage à renforcer (' + coreStrength + 's)</strong> - Ajouter exercices core stability et planches');
    } else if (coreStrength >= 90) {
        recommendations.push('✅ <strong>Excellent gainage</strong> - Stabilité du tronc optimale');
    }
    
    if (stats.swimmersWithData < stats.totalEntries * 0.6) {
        recommendations.push('📊 <strong>Données incomplètes</strong> - Encourager tests réguliers pour tous les nageurs');
    }
    
    let html = `<p style="margin: 0 0 15px 0; font-size: 1.05rem;">${analysis}</p>`;
    
    if (recommendations.length > 0) {
        html += '<p style="margin: 10px 0 5px 0; font-weight: 600;">Observations détaillées :</p><ul style="margin: 5px 0 0 0; padding-left: 20px;">';
        recommendations.forEach(rec => {
            html += `<li style="margin-bottom: 8px;">${rec}</li>`;
        });
        html += '</ul>';
    }
    
    return html;
}

// ============================================
// SECTIONS 4-7: STUBS (À COMPLÉTER)
// ============================================

function loadMedicalSection(swimmers) {
    const content = document.getElementById('medicalContent');
    const medicalStats = calculateTeamMedicalStats(swimmers);
    
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #e91e63;">
            <i class="fas fa-heartbeat"></i> Suivi Médical de l'Équipe
        </h3>
        
        <div style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${medicalStats.availableCount}/${swimmers.length}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Nageurs Disponibles</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">📊 ${medicalStats.totalEntries} suivis médicaux</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">⚠️ ${medicalStats.injuredCount} blessé(s)</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">🏥 ${medicalStats.withConditionsCount} condition(s) médicale(s)</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: ${medicalStats.availabilityRate >= 80 ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' : medicalStats.availabilityRate >= 60 ? 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)' : 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'}; border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${medicalStats.availabilityRate}%</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">✅ Taux Disponibilité</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${medicalStats.injuredCount}</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🩹 Blessures Actives</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${medicalStats.withConditionsCount}</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🏥 Conditions Médicales</div>
            </div>
        </div>
        
        ${medicalStats.commonInjuries.length > 0 ? `
        <div style="background: #fff3e0; padding: 20px; border-radius: 10px; border-left: 4px solid #ff9800; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">🩹 Blessures les Plus Fréquentes</h4>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; color: #666;">
                ${medicalStats.commonInjuries.map(inj => `<li style="margin-bottom: 5px;">${inj}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #e91e63;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📋 Analyse & Recommandations</h4>
            <div style="color: #666; line-height: 1.6;">
                ${getMedicalRecommendations(medicalStats, swimmers.length)}
            </div>
        </div>
    `;
}

function calculateTeamMedicalStats(swimmers) {
    // Collecter TOUTES les données médicales
    const allMedicalData = [];
    swimmers.forEach(swimmer => {
        if (swimmer.medicalData && Array.isArray(swimmer.medicalData)) {
            allMedicalData.push(...swimmer.medicalData);
        }
    });
    
    let availableCount = 0;
    let injuredCount = 0;
    let withConditionsCount = 0;
    const injuries = [];
    const conditions = [];
    
    swimmers.forEach(swimmer => {
        if (!swimmer.medicalData || swimmer.medicalData.length === 0) {
            availableCount++;
            return;
        }
        
        // Prendre la donnée la plus récente pour le statut actuel
        const recent = swimmer.medicalData[swimmer.medicalData.length - 1];
        
        if (recent.available === true || recent.available === 'true' || recent.available === 'yes') {
            availableCount++;
        } else {
            if (recent.injury) {
                injuredCount++;
                if (recent.injuryDescription) {
                    injuries.push(recent.injuryDescription);
                }
            }
        }
        
        if (recent.medicalConditions) {
            withConditionsCount++;
            conditions.push(recent.medicalConditions);
        }
    });
    
    // Identifier les blessures les plus courantes
    const injuryCount = {};
    injuries.forEach(inj => {
        const normalized = inj.toLowerCase().trim();
        injuryCount[normalized] = (injuryCount[normalized] || 0) + 1;
    });
    
    const commonInjuries = Object.entries(injuryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([injury, count]) => `${injury} (${count} cas)`);
    
    const stats = {
        availableCount: availableCount,
        availabilityRate: swimmers.length > 0 ? Math.round((availableCount / swimmers.length) * 100) : 100,
        injuredCount: injuredCount,
        withConditionsCount: withConditionsCount,
        commonInjuries: commonInjuries,
        totalEntries: allMedicalData.length,
        swimmersWithData: swimmers.filter(s => s.medicalData && s.medicalData.length > 0).length
    };
    
    return stats;
}

function getMedicalRecommendations(stats, totalSwimmers) {
    let analysis = '';
    let recommendations = [];
    
    const availabilityRate = stats.availabilityRate;
    
    if (availabilityRate >= 90) {
        analysis = '✅ <strong>Excellente disponibilité de l\'équipe</strong> - Très peu de blessures ou indisponibilités.';
        recommendations.push('Maintenir les protocoles de prévention actuels');
    } else if (availabilityRate >= 70) {
        analysis = '⚠️ <strong>Disponibilité correcte</strong> - Quelques blessures à surveiller.';
        recommendations.push('Renforcer la prévention et le suivi des nageurs blessés');
    } else {
        analysis = '🚨 <strong>Disponibilité préoccupante</strong> - Trop de nageurs indisponibles.';
        recommendations.push('Réviser le programme d\'entraînement et intensifier la prévention');
    }
    
    if (stats.injuredCount > 0) {
        const injuryRate = Math.round((stats.injuredCount / totalSwimmers) * 100);
        recommendations.push(`🩹 <strong>${stats.injuredCount} nageur(s) blessé(s)</strong> (${injuryRate}%) - Assurer suivi médical et rééducation`);
    }
    
    if (stats.withConditionsCount > 0) {
        recommendations.push(`🏥 <strong>${stats.withConditionsCount} condition(s) médicale(s)</strong> - Adapter entraînement selon recommandations médicales`);
    }
    
    if (stats.commonInjuries.length > 0) {
        recommendations.push(`📊 <strong>Blessures récurrentes détectées</strong> - Analyser causes et ajuster prévention`);
    }
    
    if (stats.swimmersWithData < totalSwimmers * 0.7) {
        recommendations.push('📋 <strong>Suivi médical incomplet</strong> - Encourager saisies régulières pour tous les nageurs');
    }
    
    let html = `<p style="margin: 0 0 15px 0; font-size: 1.05rem;">${analysis}</p>`;
    
    if (recommendations.length > 0) {
        html += '<p style="margin: 10px 0 5px 0; font-weight: 600;">Actions recommandées :</p><ul style="margin: 5px 0 0 0; padding-left: 20px;">';
        recommendations.forEach(rec => {
            html += `<li style="margin-bottom: 8px;">${rec}</li>`;
        });
        html += '</ul>';
    }
    
    return html;
}

function loadRaceSection(swimmers) {
    const content = document.getElementById('raceContent');
    const raceStats = calculateTeamRaceStats(swimmers);
    
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #3498db;">
            <i class="fas fa-trophy"></i> Performances en Compétition
        </h3>
        
        <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${raceStats.totalRaces}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Courses Totales</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">🏅 ${raceStats.recordsCount} record(s) personnel(s)</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">👥 ${raceStats.swimmersWithRaces}/${swimmers.length} nageurs avec données</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">📊 ${raceStats.averageRacesPerSwimmer} courses/nageur</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 10px; color: #333;">
                <div style="font-size: 2rem; font-weight: bold;">${raceStats.recordsCount}</div>
                <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 5px;">🏅 Records Personnels</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${raceStats.topPerformancesCount}</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">⭐ Meilleures Perfs</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${raceStats.competitionsCount}</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🏆 Compétitions</div>
            </div>
        </div>
        
        ${raceStats.topStrokes.length > 0 ? `
        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; border-left: 4px solid #2196f3; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">🏊 Nages les Plus Pratiquées</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${raceStats.topStrokes.map(stroke => `
                    <span style="background: white; padding: 8px 15px; border-radius: 20px; color: #2196f3; font-weight: 500;">
                        ${stroke.name} (${stroke.count})
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${raceStats.topDistances.length > 0 ? `
        <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; border-left: 4px solid #9c27b0; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📏 Distances les Plus Courues</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${raceStats.topDistances.map(dist => `
                    <span style="background: white; padding: 8px 15px; border-radius: 20px; color: #9c27b0; font-weight: 500;">
                        ${dist.name}m (${dist.count})
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #3498db;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📊 Analyse Compétitions</h4>
            <div style="color: #666; line-height: 1.6;">
                ${getRaceRecommendations(raceStats, swimmers.length)}
            </div>
        </div>
    `;
}

function calculateTeamRaceStats(swimmers) {
    // Collecter TOUTES les données de compétition
    const allRaceData = [];
    swimmers.forEach(swimmer => {
        if (swimmer.raceData && Array.isArray(swimmer.raceData)) {
            allRaceData.push(...swimmer.raceData);
        }
    });
    
    let recordsCount = 0;
    let topPerformancesCount = 0;
    const competitions = new Set();
    const strokesCount = {};
    const distancesCount = {};
    
    allRaceData.forEach(race => {
        if (race.personalRecord === true || race.personalRecord === 'yes') {
            recordsCount++;
        }
        if (race.performance === 'excellent' || race.performance === 'top') {
            topPerformancesCount++;
        }
        if (race.competition) {
            competitions.add(race.competition);
        }
        if (race.stroke) {
            strokesCount[race.stroke] = (strokesCount[race.stroke] || 0) + 1;
        }
        if (race.distance) {
            distancesCount[race.distance] = (distancesCount[race.distance] || 0) + 1;
        }
    });
    
    // Top 5 nages
    const topStrokes = Object.entries(strokesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    
    // Top 5 distances
    const topDistances = Object.entries(distancesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    
    const swimmersWithRaces = swimmers.filter(s => s.raceData && s.raceData.length > 0).length;
    
    const stats = {
        totalRaces: allRaceData.length,
        recordsCount: recordsCount,
        topPerformancesCount: topPerformancesCount,
        competitionsCount: competitions.size,
        topStrokes: topStrokes,
        topDistances: topDistances,
        swimmersWithRaces: swimmersWithRaces,
        averageRacesPerSwimmer: swimmersWithRaces > 0 ? (allRaceData.length / swimmersWithRaces).toFixed(1) : '0.0'
    };
    
    return stats;
}

function getRaceRecommendations(stats, totalSwimmers) {
    let analysis = '';
    let recommendations = [];
    
    const participationRate = (stats.swimmersWithRaces / totalSwimmers) * 100;
    
    if (stats.totalRaces === 0) {
        analysis = '📊 <strong>Aucune donnée de compétition</strong> - Commencer à enregistrer les résultats des courses.';
        recommendations.push('Saisir les performances des prochaines compétitions');
    } else {
        if (participationRate >= 80) {
            analysis = '✅ <strong>Excellent niveau de participation</strong> - La majorité de l\'équipe participe aux compétitions.';
        } else if (participationRate >= 50) {
            analysis = '⚠️ <strong>Participation correcte</strong> - Encourager plus de nageurs à participer.';
            recommendations.push(`Encourager les ${totalSwimmers - stats.swimmersWithRaces} nageur(s) sans course à participer`);
        } else {
            analysis = '🚨 <strong>Participation faible</strong> - Peu de nageurs participent aux compétitions.';
            recommendations.push('Motiver davantage de nageurs à s\'engager en compétition');
        }
        
        if (stats.recordsCount > 0) {
            const recordRate = Math.round((stats.recordsCount / stats.totalRaces) * 100);
            recommendations.push(`🏅 <strong>${stats.recordsCount} record(s) personnel(s)</strong> battu(s) (${recordRate}% des courses) - Excellente progression !`);
        }
        
        if (stats.topPerformancesCount > 0) {
            recommendations.push(`⭐ <strong>${stats.topPerformancesCount} performance(s) d\'excellence</strong> - Féliciter les nageurs concernés`);
        }
        
        if (stats.competitionsCount > 0) {
            recommendations.push(`🏆 <strong>${stats.competitionsCount} compétition(s) différente(s)</strong> - Bonne diversité d\'expérience`);
        }
        
        const avgRaces = parseFloat(stats.averageRacesPerSwimmer);
        if (avgRaces < 2) {
            recommendations.push('📊 Moyenne faible de courses par nageur - Planifier plus de participations');
        } else if (avgRaces >= 5) {
            recommendations.push('✅ Excellente régularité en compétition');
        }
    }
    
    let html = `<p style="margin: 0 0 15px 0; font-size: 1.05rem;">${analysis}</p>`;
    
    if (recommendations.length > 0) {
        html += '<p style="margin: 10px 0 5px 0; font-weight: 600;">Observations :</p><ul style="margin: 5px 0 0 0; padding-left: 20px;">';
        recommendations.forEach(rec => {
            html += `<li style="margin-bottom: 8px;">${rec}</li>`;
        });
        html += '</ul>';
    }
    
    return html;
}

function loadTechnicalSection(swimmers) {
    const content = document.getElementById('technicalContent');
    const techStats = calculateTeamTechnicalStats(swimmers);
    
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #1abc9c;">
            <i class="fas fa-swimming-pool"></i> Suivi Technique de l'Équipe
        </h3>
        
        <div style="background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${techStats.totalEvaluations}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Évaluations Techniques</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">👥 ${techStats.swimmersWithData}/${swimmers.length} nageurs évalués</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">📊 ${techStats.strokesEvaluated} nage(s) évaluée(s)</div>
                </div>
            </div>
        </div>
        
        ${techStats.strokeScores.length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
            ${techStats.strokeScores.map(stroke => `
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%); border-radius: 10px; color: white;">
                    <div style="font-size: 2rem; font-weight: bold;">${stroke.score}/10</div>
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🏊 ${stroke.name}</div>
                    <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 3px;">(${stroke.count} éval.)</div>
                </div>
            `).join('')}
        </div>
        ` : '<p style="text-align: center; color: #999; padding: 40px;">Aucune évaluation technique enregistrée</p>'}
        
        ${techStats.totalEvaluations > 0 ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #1abc9c;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📊 Analyse Technique</h4>
            <div style="color: #666; line-height: 1.6;">
                ${getTechnicalRecommendations(techStats, swimmers.length)}
            </div>
        </div>
        ` : ''}
    `;
}

function calculateTeamTechnicalStats(swimmers) {
    const allTechnicalData = [];
    swimmers.forEach(swimmer => {
        if (swimmer.technicalData && Array.isArray(swimmer.technicalData)) {
            allTechnicalData.push(...swimmer.technicalData);
        }
    });
    
    const strokeScoresMap = {};
    
    allTechnicalData.forEach(evaluation => {
        if (evaluation.stroke && evaluation.score) {
            if (!strokeScoresMap[evaluation.stroke]) {
                strokeScoresMap[evaluation.stroke] = { sum: 0, count: 0 };
            }
            strokeScoresMap[evaluation.stroke].sum += parseFloat(evaluation.score);
            strokeScoresMap[evaluation.stroke].count++;
        }
    });
    
    const strokeScores = Object.entries(strokeScoresMap).map(([name, data]) => ({
        name: name,
        score: (data.sum / data.count).toFixed(1),
        count: data.count
    })).sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    
    const stats = {
        totalEvaluations: allTechnicalData.length,
        swimmersWithData: swimmers.filter(s => s.technicalData && s.technicalData.length > 0).length,
        strokesEvaluated: Object.keys(strokeScoresMap).length,
        strokeScores: strokeScores
    };
    
    return stats;
}

function getTechnicalRecommendations(stats, totalSwimmers) {
    let analysis = '';
    let recommendations = [];
    
    const evaluationRate = (stats.swimmersWithData / totalSwimmers) * 100;
    
    if (stats.totalEvaluations === 0) {
        return '<p style="margin: 0;">💡 Commencer à enregistrer les évaluations techniques pour suivre la progression.</p>';
    }
    
    if (evaluationRate >= 70) {
        analysis = '✅ <strong>Bon suivi technique</strong> - La majorité de l\'équipe est évaluée régulièrement.';
    } else if (evaluationRate >= 40) {
        analysis = '⚠️ <strong>Suivi technique partiel</strong> - Augmenter le nombre d\'évaluations.';
        recommendations.push(`Évaluer les ${totalSwimmers - stats.swimmersWithData} nageur(s) sans donnée technique`);
    } else {
        analysis = '🚨 <strong>Suivi technique insuffisant</strong> - Peu de nageurs évalués.';
        recommendations.push('Mettre en place des évaluations techniques régulières');
    }
    
    // Analyser les nages
    const strongStrokes = stats.strokeScores.filter(s => parseFloat(s.score) >= 7.5);
    const weakStrokes = stats.strokeScores.filter(s => parseFloat(s.score) < 6.0);
    
    if (strongStrokes.length > 0) {
        recommendations.push(`✅ <strong>Nage(s) forte(s)</strong>: ${strongStrokes.map(s => s.name).join(', ')}`);
    }
    
    if (weakStrokes.length > 0) {
        recommendations.push(`⚠️ <strong>Nage(s) à travailler</strong>: ${weakStrokes.map(s => `${s.name} (${s.score}/10)`).join(', ')}`);
    }
    
    if (stats.strokesEvaluated < 4) {
        recommendations.push('📊 Évaluer davantage de nages pour un suivi complet');
    }
    
    let html = `<p style="margin: 0 0 15px 0; font-size: 1.05rem;">${analysis}</p>`;
    
    if (recommendations.length > 0) {
        html += '<p style="margin: 10px 0 5px 0; font-weight: 600;">Observations :</p><ul style="margin: 5px 0 0 0; padding-left: 20px;">';
        recommendations.forEach(rec => {
            html += `<li style="margin-bottom: 8px;">${rec}</li>`;
        });
        html += '</ul>';
    }
    
    return html;
}

function loadAttendanceSection(swimmers) {
    const content = document.getElementById('attendanceContent');
    const attendanceStats = calculateTeamAttendanceStats(swimmers);
    
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #27ae60;">
            <i class="fas fa-calendar-check"></i> Assiduité de l'Équipe
        </h3>
        
        <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${attendanceStats.averageRate}%</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Taux de Présence Moyen</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">📊 ${attendanceStats.totalRecords} enregistrements</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">👥 ${attendanceStats.swimmersWithData}/${swimmers.length} nageurs suivis</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">❌ ${attendanceStats.totalAbsences} absence(s)</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: ${attendanceStats.averageRate >= 80 ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' : attendanceStats.averageRate >= 60 ? 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)' : 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'}; border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${attendanceStats.presentCount}</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">✅ Présences</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f44336 0%, #e57373 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${attendanceStats.totalAbsences}</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">❌ Absences</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${attendanceStats.excusedRate}%</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">📝 Absences Justifiées</div>
            </div>
        </div>
        
        ${attendanceStats.topAbsentees.length > 0 ? `
        <div style="background: #ffebee; padding: 20px; border-radius: 10px; border-left: 4px solid #f44336; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">⚠️ Nageurs avec le Plus d'Absences</h4>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; color: #666;">
                ${attendanceStats.topAbsentees.map(swimmer => `<li style="margin-bottom: 5px;">${swimmer.name} (${swimmer.absences} absence(s))</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #27ae60;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📊 Analyse Assiduité</h4>
            <div style="color: #666; line-height: 1.6;">
                ${getAttendanceRecommendations(attendanceStats, swimmers.length)}
            </div>
        </div>
    `;
}

function calculateTeamAttendanceStats(swimmers) {
    const allAttendanceData = [];
    const swimmerAbsences = [];
    
    swimmers.forEach(swimmer => {
        if (swimmer.attendanceData && Array.isArray(swimmer.attendanceData)) {
            allAttendanceData.push(...swimmer.attendanceData);
            
            const absences = swimmer.attendanceData.filter(record => 
                record.status === 'absent' || record.status === 'absence'
            ).length;
            
            if (absences > 0) {
                swimmerAbsences.push({ name: swimmer.name, absences: absences });
            }
        }
    });
    
    let presentCount = 0;
    let totalAbsences = 0;
    let excusedAbsences = 0;
    
    allAttendanceData.forEach(record => {
        if (record.status === 'present' || record.status === 'présent') {
            presentCount++;
        } else if (record.status === 'absent' || record.status === 'absence') {
            totalAbsences++;
            if (record.excused === true || record.excused === 'yes') {
                excusedAbsences++;
            }
        }
    });
    
    const totalRecords = allAttendanceData.length;
    const averageRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;
    const excusedRate = totalAbsences > 0 ? Math.round((excusedAbsences / totalAbsences) * 100) : 0;
    
    // Top 5 absentéistes
    const topAbsentees = swimmerAbsences
        .sort((a, b) => b.absences - a.absences)
        .slice(0, 5);
    
    const stats = {
        totalRecords: totalRecords,
        presentCount: presentCount,
        totalAbsences: totalAbsences,
        excusedAbsences: excusedAbsences,
        averageRate: averageRate,
        excusedRate: excusedRate,
        topAbsentees: topAbsentees,
        swimmersWithData: swimmers.filter(s => s.attendanceData && s.attendanceData.length > 0).length
    };
    
    return stats;
}

function getAttendanceRecommendations(stats, totalSwimmers) {
    let analysis = '';
    let recommendations = [];
    
    if (stats.totalRecords === 0) {
        return '<p style="margin: 0;">💡 Commencer à enregistrer les présences pour suivre l\'assiduité de l\'équipe.</p>';
    }
    
    const attendanceRate = stats.averageRate;
    
    if (attendanceRate >= 90) {
        analysis = '✅ <strong>Excellente assiduité</strong> - L\'équipe est très régulière aux entraînements.';
        recommendations.push('Féliciter l\'équipe pour sa régularité');
    } else if (attendanceRate >= 75) {
        analysis = '⚠️ <strong>Assiduité correcte</strong> - Quelques absences à surveiller.';
        recommendations.push('Identifier les causes des absences récurrentes');
    } else {
        analysis = '🚨 <strong>Assiduité problématique</strong> - Trop d\'absences dans l\'équipe.';
        recommendations.push('Réunion d\'équipe pour comprendre les causes d\'absentéisme');
    }
    
    if (stats.totalAbsences > 0) {
        const absenceRate = Math.round((stats.totalAbsences / stats.totalRecords) * 100);
        recommendations.push(`❌ <strong>${stats.totalAbsences} absence(s)</strong> enregistrée(s) (${absenceRate}% des enregistrements)`);
        
        if (stats.excusedRate < 50) {
            recommendations.push(`⚠️ Seulement ${stats.excusedRate}% des absences sont justifiées - Rappeler l\'importance de justifier`);
        } else {
            recommendations.push(`✅ ${stats.excusedRate}% des absences sont justifiées`);
        }
    }
    
    if (stats.topAbsentees.length > 0) {
        recommendations.push(`🎯 <strong>${stats.topAbsentees.length} nageur(s)</strong> avec absences répétées - Entretien individuel recommandé`);
    }
    
    if (stats.swimmersWithData < totalSwimmers * 0.7) {
        recommendations.push('📋 Suivi incomplet - Enregistrer les présences pour tous les nageurs');
    }
    
    let html = `<p style="margin: 0 0 15px 0; font-size: 1.05rem;">${analysis}</p>`;
    
    if (recommendations.length > 0) {
        html += '<p style="margin: 10px 0 5px 0; font-weight: 600;">Actions recommandées :</p><ul style="margin: 5px 0 0 0; padding-left: 20px;">';
        recommendations.forEach(rec => {
            html += `<li style="margin-bottom: 8px;">${rec}</li>`;
        });
        html += '</ul>';
    }
    
    return html;
}

// ============================================
// SAISIE COLLECTIVE DE DONNÉES
// ============================================

function showCollectiveDataEntry() {
    if (!currentTeam) {
        alert('Veuillez sélectionner une équipe d\'abord');
        return;
    }
    
    const swimmers = getTeamSwimmers();
    if (swimmers.length === 0) {
        alert('Aucun nageur dans cette équipe');
        return;
    }
    
    const modal = document.getElementById('collectiveDataModal');
    const content = document.getElementById('collectiveDataContent');
    
    let html = `
        <h4 style="margin-bottom: 20px; color: #333;">
            <i class="fas fa-users"></i> Saisir des données pour tous les nageurs de l'équipe
        </h4>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
            <p style="margin: 0; color: #1976d2;">
                <i class="fas fa-info-circle"></i> 
                Les données saisies ici seront enregistrées pour <strong>${swimmers.length} nageurs</strong> de l'équipe <strong>${currentTeam.name}</strong>
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            
            <div class="card" style="border-left: 4px solid #ff6b35; cursor: pointer; transition: transform 0.2s;" onclick="selectCollectiveDataType('wellbeing')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="card-body" style="padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">😊</div>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Bien-être</h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Sommeil, fatigue, stress</p>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #4facfe; cursor: pointer; transition: transform 0.2s;" onclick="selectCollectiveDataType('training')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="card-body" style="padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🏊</div>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Entraînement</h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Volume, RPE, charge</p>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #8e44ad; cursor: pointer; transition: transform 0.2s;" onclick="selectCollectiveDataType('performance')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="card-body" style="padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">💪</div>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Performance</h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Tests physiques</p>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #e91e63; cursor: pointer; transition: transform 0.2s;" onclick="selectCollectiveDataType('medical')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="card-body" style="padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🏥</div>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Médical</h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Disponibilité, santé</p>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #f39c12; cursor: pointer; transition: transform 0.2s;" onclick="selectCollectiveDataType('race')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="card-body" style="padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🏅</div>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Compétition</h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Résultats courses</p>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #00bcd4; cursor: pointer; transition: transform 0.2s;" onclick="selectCollectiveDataType('technical')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="card-body" style="padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📋</div>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Technique</h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Évaluation nages</p>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #27ae60; cursor: pointer; transition: transform 0.2s;" onclick="selectCollectiveDataType('attendance')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="card-body" style="padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Présence</h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Appel journalier</p>
                </div>
            </div>
            
        </div>
    `;
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

function closeCollectiveDataModal() {
    document.getElementById('collectiveDataModal').style.display = 'none';
}

function selectCollectiveDataType(type) {
    const swimmers = getTeamSwimmers();
    if (swimmers.length === 0) {
        alert('Aucun nageur dans l\'équipe');
        return;
    }
    
    const content = document.getElementById('collectiveDataContent');
    
    // Étape 1: Sélection des nageurs
    content.innerHTML = renderSwimmerSelectionScreen(type, swimmers);
}

// Nouvelle fonction pour afficher l'écran de sélection
function renderSwimmerSelectionScreen(type, swimmers) {
    const typeConfig = {
        wellbeing: { icon: '😊', title: 'Bien-être', color: '#ff6b35' },
        training: { icon: '🏊', title: 'Entraînement', color: '#4facfe' },
        performance: { icon: '💪', title: 'Performance', color: '#8e44ad' },
        medical: { icon: '🏥', title: 'Médical', color: '#e91e63' },
        race: { icon: '🏅', title: 'Compétition', color: '#f39c12' },
        technical: { icon: '📋', title: 'Technique', color: '#00bcd4' },
        attendance: { icon: '✅', title: 'Présence', color: '#27ae60' }
    };
    
    const config = typeConfig[type];
    
    return `
        <div style="margin-bottom: 20px;">
            <button onclick="showCollectiveDataEntry()" class="btn btn-outline">
                <i class="fas fa-arrow-left"></i> Retour
            </button>
        </div>
        
        <h4 style="margin: 20px 0; color: #333;">
            <span style="font-size: 2rem;">${config.icon}</span> ${config.title} - Sélectionner les nageurs
        </h4>
        
        <div style="background: ${config.color}15; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${config.color};">
            <p style="margin: 0; color: ${config.color};">
                <i class="fas fa-info-circle"></i> 
                Cochez les nageurs pour lesquels vous souhaitez saisir des données
            </p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <button onclick="selectAllSwimmers()" class="btn btn-sm btn-primary">
                <i class="fas fa-check-double"></i> Tout sélectionner
            </button>
            <button onclick="deselectAllSwimmers()" class="btn btn-sm btn-outline">
                <i class="fas fa-times"></i> Tout désélectionner
            </button>
            <span id="selectedSwimmersCount" style="margin-left: auto; font-weight: bold; color: #333;">
                ${swimmers.length} nageurs sélectionnés
            </span>
        </div>
        
        <div id="swimmersSelectionGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-bottom: 25px;">
            ${swimmers.map((swimmer, index) => `
                <label class="swimmer-checkbox-card" style="display: flex; align-items: center; padding: 15px; background: white; border: 2px solid ${config.color}40; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='${config.color}'; this.style.background='${config.color}05'" onmouseout="this.style.borderColor='${config.color}40'; this.style.background='white'">
                    <input type="checkbox" class="swimmer-select-checkbox" data-swimmer-id="${swimmer.id}" data-swimmer-name="${swimmer.name || 'Nageur ' + (index + 1)}" onchange="updateSelectedSwimmersCount()" style="width: 20px; height: 20px; margin-right: 12px; cursor: pointer;" checked>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 3px;">${swimmer.name || 'Nageur ' + (index + 1)}</div>
                        <div style="font-size: 0.85rem; color: #666;">
                            <i class="fas fa-user"></i> ${swimmer.username || 'N/A'}
                        </div>
                    </div>
                    <i class="fas fa-check-circle" style="color: ${config.color}; font-size: 1.5rem; opacity: 0; transition: opacity 0.2s;"></i>
                </label>
            `).join('')}
        </div>
        
        <button onclick="proceedToCollectiveForm('${type}')" class="btn btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem;">
            <i class="fas fa-arrow-right"></i> Continuer vers le formulaire
        </button>
    `;
}

function selectAllSwimmers() {
    document.querySelectorAll('.swimmer-select-checkbox').forEach(cb => cb.checked = true);
    updateSelectedSwimmersCount();
    updateCheckboxIcons();
}

function deselectAllSwimmers() {
    document.querySelectorAll('.swimmer-select-checkbox').forEach(cb => cb.checked = false);
    updateSelectedSwimmersCount();
    updateCheckboxIcons();
}

function updateSelectedSwimmersCount() {
    const selected = document.querySelectorAll('.swimmer-select-checkbox:checked').length;
    const counter = document.getElementById('selectedSwimmersCount');
    if (counter) {
        counter.textContent = `${selected} nageur${selected > 1 ? 's' : ''} sélectionné${selected > 1 ? 's' : ''}`;
        counter.style.color = selected > 0 ? '#27ae60' : '#e74c3c';
    }
    updateCheckboxIcons();
}

function updateCheckboxIcons() {
    document.querySelectorAll('.swimmer-checkbox-card').forEach(card => {
        const checkbox = card.querySelector('.swimmer-select-checkbox');
        const icon = card.querySelector('.fa-check-circle');
        if (checkbox && icon) {
            icon.style.opacity = checkbox.checked ? '1' : '0';
        }
    });
}

function proceedToCollectiveForm(type) {
    const selectedCheckboxes = document.querySelectorAll('.swimmer-select-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('⚠️ Veuillez sélectionner au moins un nageur');
        return;
    }
    
    const selectedSwimmers = Array.from(selectedCheckboxes).map(cb => ({
        id: cb.dataset.swimmerId,
        name: cb.dataset.swimmerName
    }));
    
    const content = document.getElementById('collectiveDataContent');
    content.innerHTML = renderCollectiveDataForm(type, selectedSwimmers);
    
    // Initialiser les event listeners spécifiques au type
    initializeCollectiveFormListeners(type);
}

// ============================================
// GÉNÉRATION DES FORMULAIRES COLLECTIFS
// ============================================

function renderCollectiveDataForm(type, swimmers) {
    const today = new Date().toISOString().split('T')[0];
    
    const typeConfig = {
        wellbeing: { icon: '😊', title: 'Bien-être', color: '#ff6b35' },
        training: { icon: '🏊', title: 'Entraînement', color: '#4facfe' },
        performance: { icon: '💪', title: 'Performance', color: '#8e44ad' },
        medical: { icon: '🏥', title: 'Médical', color: '#e91e63' },
        race: { icon: '🏅', title: 'Compétition', color: '#f39c12' },
        technical: { icon: '📋', title: 'Technique', color: '#00bcd4' },
        attendance: { icon: '✅', title: 'Présence', color: '#27ae60' }
    };
    
    const config = typeConfig[type];
    
    let html = `
        <div style="margin-bottom: 20px;">
            <button onclick="showCollectiveDataEntry()" class="btn btn-outline" style="float: left;">
                <i class="fas fa-arrow-left"></i> Retour
            </button>
            <div style="clear: both;"></div>
        </div>
        
        <h4 style="margin: 20px 0; color: #333;">
            <span style="font-size: 2rem;">${config.icon}</span> ${config.title} - Saisie Collective
        </h4>
        
        <div style="background: ${config.color}15; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${config.color};">
            <p style="margin: 0; color: ${config.color};">
                <i class="fas fa-info-circle"></i> 
                Remplissez les données pour chaque nageur. Les champs vides seront ignorés.
            </p>
        </div>
        
        <div class="form-group">
            <label for="collectiveDate">📅 Date</label>
            <input type="date" id="collectiveDate" class="form-control" value="${today}" required>
        </div>
        
        <div id="collectiveSwimmersContainer" style="max-height: 60vh; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fafafa;">
    `;
    
    swimmers.forEach((swimmer, index) => {
        html += `
            <div class="swimmer-collective-card" style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${config.color}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                    <span style="background: ${config.color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">${index + 1}</span>
                    ${swimmer.name || 'Nageur ' + (index + 1)}
                </h5>
                <div class="swimmer-collective-fields" data-swimmer-id="${swimmer.id}">
                    ${generateCollectiveFields(type, swimmer.id, index)}
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        
        <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #ddd; display: flex; gap: 15px;">
            <button onclick="closeCollectiveDataModal()" class="btn btn-outline" style="flex: 1;">
                Annuler
            </button>
            <button onclick="saveCollectiveData('${type}')" class="btn btn-primary" style="flex: 2;">
                <i class="fas fa-save"></i> Enregistrer pour ${swimmers.length} nageurs
            </button>
        </div>
    `;
    
    return html;
}

function generateCollectiveFields(type, swimmerId, index) {
    const prefix = `swimmer_${index}`;
    
    switch(type) {
        case 'wellbeing':
            // ✅ FORMULAIRE COMPLET ALIGNÉ AVEC APP.JS (13 champs)
            return `
                <div style="background: #f0f8ff; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <strong style="color: #1976d2;">📊 Évaluation Subjective (1-10)</strong>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>😴 Qualité du Sommeil</label>
                        <input type="number" id="${prefix}_sleepQuality" class="form-control" min="1" max="10" placeholder="Ex: 8">
                        <small style="color: #666;">1=Très mauvais → 10=Excellent</small>
                    </div>
                    <div class="form-group">
                        <label>⚡ Niveau d'Énergie</label>
                        <input type="number" id="${prefix}_energyLevel" class="form-control" min="1" max="10" placeholder="Ex: 7">
                        <small style="color: #666;">1=Épuisé → 10=Pleine forme</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>🎯 Motivation</label>
                        <input type="number" id="${prefix}_motivation" class="form-control" min="1" max="10" placeholder="Ex: 8">
                        <small style="color: #666;">1=Aucune → 10=Très motivé</small>
                    </div>
                    <div class="form-group">
                        <label>😰 Niveau de Stress</label>
                        <input type="number" id="${prefix}_stressLevel" class="form-control" min="1" max="10" placeholder="Ex: 3">
                        <small style="color: #666;">1=Aucun → 10=Très stressé</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>💪 Récupération Musculaire</label>
                        <input type="number" id="${prefix}_muscleRecovery" class="form-control" min="1" max="10" placeholder="Ex: 6">
                        <small style="color: #666;">1=Très courbaturé → 10=Frais</small>
                    </div>
                </div>
                
                <div style="background: #fff3e0; padding: 12px; border-radius: 6px; margin: 15px 0 12px 0;">
                    <strong style="color: #f57c00;">📈 Données Quantitatives</strong>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>🕐 Heures de Sommeil</label>
                        <input type="number" id="${prefix}_sleepHours" class="form-control" min="0" max="24" step="0.5" placeholder="Ex: 7.5">
                        <small style="color: #666;">Nombre d'heures dormies</small>
                    </div>
                    <div class="form-group">
                        <label>⚖️ Poids Corporel (kg)</label>
                        <input type="number" id="${prefix}_bodyWeight" class="form-control" min="0" step="0.1" placeholder="Ex: 70.5">
                        <small style="color: #666;">Poids actuel</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>🌙 Réveils Nocturnes</label>
                        <select id="${prefix}_nightAwakenings" class="form-control">
                            <option value="">-- Sélectionner --</option>
                            <option value="0">Aucun</option>
                            <option value="1-2">1-2 fois</option>
                            <option value="3+">3 fois ou plus</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>🌅 Qualité du Réveil</label>
                        <select id="${prefix}_wakeQuality" class="form-control">
                            <option value="">-- Sélectionner --</option>
                            <option value="1">😫 Très difficile</option>
                            <option value="2">😕 Difficile</option>
                            <option value="3">😐 Normal</option>
                            <option value="4">🙂 Facile</option>
                            <option value="5">😄 Très facile</option>
                        </select>
                    </div>
                </div>
                
                <div style="background: #ffebee; padding: 12px; border-radius: 6px; margin: 15px 0 12px 0;">
                    <strong style="color: #d32f2f;">🩹 Symptômes Spécifiques</strong>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>😣 Douleur Musculaire (0-10)</label>
                        <input type="number" id="${prefix}_musclePain" class="form-control" min="0" max="10" placeholder="Ex: 2">
                        <small style="color: #666;">0=Aucune → 10=Intense</small>
                    </div>
                    <div class="form-group">
                        <label>📍 Localisation Douleur</label>
                        <input type="text" id="${prefix}_painLocation" class="form-control" placeholder="Ex: Épaule droite">
                        <small style="color: #666;">Optionnel si douleur présente</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>🥱 Fatigue Générale</label>
                        <select id="${prefix}_generalFatigue" class="form-control">
                            <option value="">-- Sélectionner --</option>
                            <option value="low">✅ Faible</option>
                            <option value="moderate">⚠️ Modérée</option>
                            <option value="high">❌ Élevée</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>🍽️ Appétit</label>
                        <select id="${prefix}_appetite" class="form-control">
                            <option value="">-- Sélectionner --</option>
                            <option value="low">📉 Faible</option>
                            <option value="normal">✅ Normal</option>
                            <option value="high">📈 Élevé</option>
                        </select>
                    </div>
                </div>
            `;
            
        case 'training':
            return `
                <div class="form-row">
                    <div class="form-group">
                        <label>⏱️ Durée (min)</label>
                        <input type="number" id="${prefix}_duration" class="form-control" min="0" placeholder="Ex: 90">
                    </div>
                    <div class="form-group">
                        <label>🏊 Distance (m)</label>
                        <input type="number" id="${prefix}_distance" class="form-control" min="0" step="100" placeholder="Ex: 4000">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>💪 RPE (1-10)</label>
                        <input type="number" id="${prefix}_rpe" class="form-control" min="1" max="10" placeholder="Ex: 7">
                    </div>
                    <div class="form-group">
                        <label>📝 Type</label>
                        <select id="${prefix}_type" class="form-control">
                            <option value="">-- Sélectionner --</option>
                            <option value="endurance">Endurance</option>
                            <option value="technique">Technique</option>
                            <option value="vitesse">Vitesse</option>
                            <option value="force">Force</option>
                            <option value="recovery">Récupération</option>
                        </select>
                    </div>
                </div>
            `;
            
        case 'performance':
            return `
                <div class="form-row">
                    <div class="form-group">
                        <label>🏃 VMA (km/h)</label>
                        <input type="number" id="${prefix}_vma" class="form-control" min="0" step="0.1" placeholder="Ex: 14.5">
                    </div>
                    <div class="form-group">
                        <label>🦵 Saut Vertical (cm)</label>
                        <input type="number" id="${prefix}_jump" class="form-control" min="0" placeholder="Ex: 45">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>💪 Pompes (/min)</label>
                        <input type="number" id="${prefix}_pushups" class="form-control" min="0" placeholder="Ex: 35">
                    </div>
                    <div class="form-group">
                        <label>⏱️ Gainage (sec)</label>
                        <input type="number" id="${prefix}_plank" class="form-control" min="0" placeholder="Ex: 90">
                    </div>
                </div>
            `;
            
        case 'medical':
            return `
                <div class="form-group">
                    <label>📋 Statut</label>
                    <select id="${prefix}_status" class="form-control">
                        <option value="">-- Sélectionner --</option>
                        <option value="present">✅ Présent</option>
                        <option value="absent_sick">🤒 Absent (Maladie)</option>
                        <option value="absent_injury">🩹 Absent (Blessure)</option>
                        <option value="partial">⚠️ Participation partielle</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>💪 État de forme (1-5)</label>
                    <input type="number" id="${prefix}_condition" class="form-control" min="1" max="5" placeholder="Ex: 3">
                </div>
                <div class="form-group">
                    <label>📝 Notes</label>
                    <textarea id="${prefix}_notes" class="form-control" rows="2" placeholder="Observations médicales..."></textarea>
                </div>
            `;
            
        case 'race':
            return `
                <div class="form-group">
                    <label>🏊 Nage</label>
                    <select id="${prefix}_stroke" class="form-control">
                        <option value="">-- Sélectionner --</option>
                        <option value="crawl">Crawl</option>
                        <option value="dos">Dos</option>
                        <option value="brasse">Brasse</option>
                        <option value="papillon">Papillon</option>
                        <option value="4nages">4 Nages</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>📏 Distance</label>
                        <select id="${prefix}_distance_race" class="form-control">
                            <option value="">-- Sélectionner --</option>
                            <option value="50">50m</option>
                            <option value="100">100m</option>
                            <option value="200">200m</option>
                            <option value="400">400m</option>
                            <option value="800">800m</option>
                            <option value="1500">1500m</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>⏱️ Temps (MM:SS:MS)</label>
                        <input type="text" id="${prefix}_time" class="form-control" placeholder="Ex: 01:15:50">
                    </div>
                </div>
                <div class="form-group">
                    <label>🏆 Classement</label>
                    <input type="number" id="${prefix}_rank" class="form-control" min="1" placeholder="Ex: 3">
                </div>
            `;
            
        case 'technical':
            return `
                <div class="form-group">
                    <label>🏊 Nage évaluée</label>
                    <select id="${prefix}_stroke_eval" class="form-control">
                        <option value="">-- Sélectionner --</option>
                        <option value="crawl">Crawl</option>
                        <option value="dos">Dos</option>
                        <option value="brasse">Brasse</option>
                        <option value="papillon">Papillon</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Position (0-10)</label>
                        <input type="number" id="${prefix}_position" class="form-control" min="0" max="10" placeholder="Ex: 7">
                    </div>
                    <div class="form-group">
                        <label>Respiration (0-10)</label>
                        <input type="number" id="${prefix}_breathing" class="form-control" min="0" max="10" placeholder="Ex: 8">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Bras (0-10)</label>
                        <input type="number" id="${prefix}_arms" class="form-control" min="0" max="10" placeholder="Ex: 6">
                    </div>
                    <div class="form-group">
                        <label>Jambes (0-10)</label>
                        <input type="number" id="${prefix}_legs" class="form-control" min="0" max="10" placeholder="Ex: 7">
                    </div>
                </div>
            `;
            
        case 'attendance':
            return `
                <div class="form-group">
                    <label>📋 Présence</label>
                    <select id="${prefix}_presence" class="form-control">
                        <option value="">-- Sélectionner --</option>
                        <option value="present">✅ Présent</option>
                        <option value="absent">❌ Absent</option>
                        <option value="late">⏰ Retard</option>
                        <option value="excused">📝 Absent Excusé</option>
                    </select>
                </div>
                <div class="form-group" id="${prefix}_reason_container" style="display: none;">
                    <label>📝 Raison absence</label>
                    <select id="${prefix}_reason" class="form-control">
                        <option value="">-- Sélectionner --</option>
                        <option value="maladie">🤒 Maladie</option>
                        <option value="blessure">🩹 Blessure</option>
                        <option value="cours">📚 Cours/Études</option>
                        <option value="familial">🏠 Raison familiale</option>
                        <option value="autre">📝 Autre</option>
                    </select>
                </div>
                <script>
                    setTimeout(function() {
                        const presenceSelect = document.getElementById('${prefix}_presence');
                        if (presenceSelect) {
                            presenceSelect.addEventListener('change', function() {
                                const reasonDiv = document.getElementById('${prefix}_reason_container');
                                if (this.value === 'absent' || this.value === 'excused') {
                                    reasonDiv.style.display = 'block';
                                } else {
                                    reasonDiv.style.display = 'none';
                                }
                            });
                        }
                    }, 100);
                </script>
            `;
            
        default:
            return '<p>Type de données non supporté</p>';
    }
}

function initializeCollectiveFormListeners(type) {
    console.log(`Listeners initialisés pour: ${type}`);
}

function saveCollectiveData(type) {
    const date = document.getElementById('collectiveDate').value;
    if (!date) {
        alert('Veuillez sélectionner une date');
        return;
    }
    
    // ✅ NOUVEAU: Récupérer uniquement les nageurs sélectionnés initialement
    const swimmerCards = document.querySelectorAll('.swimmer-collective-card');
    let savedCount = 0;
    let errors = [];
    let skippedCount = 0;
    
    swimmerCards.forEach((card, index) => {
        const swimmerId = card.querySelector('.swimmer-collective-fields').dataset.swimmerId;
        const swimmer = getSwimmerById(swimmerId);
        if (!swimmer) return;
        
        const prefix = `swimmer_${index}`;
        const data = collectSwimmerData(type, prefix, swimmerId, date);
        
        if (data && Object.keys(data).length > 1) { // > 1 car date toujours présent
            try {
                saveSwimmerData(swimmerId, type, data);
                savedCount++;
                console.log(`✅ Données sauvegardées pour ${swimmer.name}`);
            } catch (error) {
                errors.push(`${swimmer.name}: ${error.message}`);
                console.error(`❌ Erreur pour ${swimmer.name}:`, error);
            }
        } else {
            skippedCount++;
            console.log(`⏭️ Aucune donnée pour ${swimmer.name} (ignoré)`);
        }
    });
    
    // Afficher un résumé détaillé
    let message = '';
    if (savedCount > 0) {
        message += `✅ Données enregistrées avec succès pour ${savedCount} nageur(s) !\n`;
        if (skippedCount > 0) {
            message += `⏭️ ${skippedCount} nageur(s) ignoré(s) (aucune donnée saisie)\n`;
        }
        
        alert(message);
        closeCollectiveDataModal();
        
        // ✅ Recharger les sections d'analyse ET les stats rapides pour synchroniser
        if (currentTeam) {
            loadAllSections();
            displayQuickStats();
            console.log('🔄 Sections d\'analyse et stats équipe rechargées');
        }
    } else if (errors.length > 0) {
        alert(`❌ Erreurs lors de l'enregistrement:\n${errors.join('\n')}`);
    } else {
        alert('⚠️ Aucune donnée à enregistrer. Veuillez remplir au moins un champ pour au moins un nageur.');
    }
}

function collectSwimmerData(type, prefix, swimmerId, date) {
    const data = { date: date };
    let hasData = false;
    
    switch(type) {
        case 'wellbeing':
            // ✅ COLLECTE DES 13 CHAMPS ALIGNÉS AVEC APP.JS
            // Page 1: Évaluation Subjective (1-10)
            const sleepQuality = document.getElementById(`${prefix}_sleepQuality`)?.value;
            const energyLevel = document.getElementById(`${prefix}_energyLevel`)?.value;
            const motivation = document.getElementById(`${prefix}_motivation`)?.value;
            const stressLevel = document.getElementById(`${prefix}_stressLevel`)?.value;
            const muscleRecovery = document.getElementById(`${prefix}_muscleRecovery`)?.value;
            
            // Page 2: Données Quantitatives
            const sleepHours = document.getElementById(`${prefix}_sleepHours`)?.value;
            const bodyWeight = document.getElementById(`${prefix}_bodyWeight`)?.value;
            const nightAwakenings = document.getElementById(`${prefix}_nightAwakenings`)?.value;
            const wakeQuality = document.getElementById(`${prefix}_wakeQuality`)?.value;
            
            // Page 3: Symptômes Spécifiques
            const musclePain = document.getElementById(`${prefix}_musclePain`)?.value;
            const painLocation = document.getElementById(`${prefix}_painLocation`)?.value;
            const generalFatigue = document.getElementById(`${prefix}_generalFatigue`)?.value;
            const appetite = document.getElementById(`${prefix}_appetite`)?.value;
            
            // Remplir data avec les valeurs présentes
            if (sleepQuality) { data.sleepQuality = parseInt(sleepQuality); hasData = true; }
            if (energyLevel) { data.energyLevel = parseInt(energyLevel); hasData = true; }
            if (motivation) { data.motivation = parseInt(motivation); hasData = true; }
            if (stressLevel) { data.stressLevel = parseInt(stressLevel); hasData = true; }
            if (muscleRecovery) { data.muscleRecovery = parseInt(muscleRecovery); hasData = true; }
            if (sleepHours) { data.sleepHours = parseFloat(sleepHours); hasData = true; }
            if (bodyWeight) { data.bodyWeight = parseFloat(bodyWeight); hasData = true; }
            if (nightAwakenings) { data.nightAwakenings = nightAwakenings; hasData = true; }
            if (wakeQuality) { data.wakeQuality = parseInt(wakeQuality); hasData = true; }
            if (musclePain) { data.musclePain = parseInt(musclePain); hasData = true; }
            if (painLocation) { data.painLocation = painLocation; hasData = true; }
            if (generalFatigue) { data.generalFatigue = generalFatigue; hasData = true; }
            if (appetite) { data.appetite = appetite; hasData = true; }
            
            // Calculer le score global de bien-être (moyenne des 5 métriques subjectives)
            if (sleepQuality && energyLevel && motivation && stressLevel && muscleRecovery) {
                data.score = parseFloat((
                    (parseInt(sleepQuality) + parseInt(energyLevel) + parseInt(motivation) + 
                     (11 - parseInt(stressLevel)) + parseInt(muscleRecovery)) / 5
                ).toFixed(2));
            }
            break;
            
        case 'training':
            const duration = document.getElementById(`${prefix}_duration`)?.value;
            const distance = document.getElementById(`${prefix}_distance`)?.value;
            const rpe = document.getElementById(`${prefix}_rpe`)?.value;
            const typeVal = document.getElementById(`${prefix}_type`)?.value;
            
            if (duration) { data.volume = parseInt(duration); hasData = true; }
            if (distance) { data.volumeMeters = parseInt(distance); hasData = true; }
            if (rpe) { data.rpe = parseInt(rpe); hasData = true; }
            if (typeVal) { data.sessionType = typeVal; hasData = true; }
            
            if (data.volume && data.rpe) {
                data.load = data.volume * data.rpe;
            }
            break;
            
        case 'performance':
            const vma = document.getElementById(`${prefix}_vma`)?.value;
            const jump = document.getElementById(`${prefix}_jump`)?.value;
            const pushups = document.getElementById(`${prefix}_pushups`)?.value;
            const plank = document.getElementById(`${prefix}_plank`)?.value;
            
            if (vma) { data.vma = parseFloat(vma); hasData = true; }
            if (jump) { data.legStrength = parseInt(jump); hasData = true; }
            if (pushups) { data.shoulderStrength = parseInt(pushups); hasData = true; }
            if (plank) { data.coreStrength = parseInt(plank); hasData = true; }
            break;
            
        case 'medical':
            const status = document.getElementById(`${prefix}_status`)?.value;
            const condition = document.getElementById(`${prefix}_condition`)?.value;
            const notes = document.getElementById(`${prefix}_notes`)?.value;
            
            if (status) {
                if (status === 'present') data.availability = 3;
                else if (status === 'partial') data.availability = 2;
                else data.availability = 1;
                hasData = true;
            }
            if (condition) { data.condition = parseInt(condition); hasData = true; }
            if (notes) { data.notes = notes; hasData = true; }
            break;
            
        case 'race':
            const stroke = document.getElementById(`${prefix}_stroke`)?.value;
            const distRace = document.getElementById(`${prefix}_distance_race`)?.value;
            const time = document.getElementById(`${prefix}_time`)?.value;
            const rank = document.getElementById(`${prefix}_rank`)?.value;
            
            if (stroke && distRace && time) {
                data.stroke = stroke;
                data.distance = parseInt(distRace);
                data.time = time;
                if (rank) data.rank = parseInt(rank);
                hasData = true;
            }
            break;
            
        case 'technical':
            const strokeEval = document.getElementById(`${prefix}_stroke_eval`)?.value;
            const position = document.getElementById(`${prefix}_position`)?.value;
            const breathing = document.getElementById(`${prefix}_breathing`)?.value;
            const arms = document.getElementById(`${prefix}_arms`)?.value;
            const legs = document.getElementById(`${prefix}_legs`)?.value;
            
            if (strokeEval) {
                data.stroke = strokeEval;
                if (position) data.position = parseInt(position);
                if (breathing) data.respiration = parseInt(breathing);
                if (arms) data.bras = parseInt(arms);
                if (legs) data.battements = parseInt(legs);
                hasData = true;
            }
            break;
            
        case 'attendance':
            const presence = document.getElementById(`${prefix}_presence`)?.value;
            const reason = document.getElementById(`${prefix}_reason`)?.value;
            
            if (presence) {
                data.status = presence;
                if (reason) data.reason = reason;
                hasData = true;
            }
            break;
    }
    
    return hasData ? data : null;
}

function saveSwimmerData(swimmerId, dataType, data) {
    const allSwimmers = getAllSwimmers();
    const swimmer = allSwimmers.find(s => s.id === swimmerId);
    if (!swimmer) {
        throw new Error('Nageur introuvable');
    }
    
    // Initialiser le tableau de données si nécessaire
    if (!swimmer[dataType + 'Data']) {
        swimmer[dataType + 'Data'] = [];
    }
    
    // Vérifier si une entrée existe déjà pour cette date
    const existingIndex = swimmer[dataType + 'Data'].findIndex(entry => entry.date === data.date);
    
    if (existingIndex !== -1) {
        // Mettre à jour l'entrée existante
        swimmer[dataType + 'Data'][existingIndex] = { ...swimmer[dataType + 'Data'][existingIndex], ...data };
    } else {
        // Ajouter une nouvelle entrée
        swimmer[dataType + 'Data'].push(data);
    }
    
    // Sauvegarder dans localStorage
    const swimmerIndex = allSwimmers.findIndex(s => s.id === swimmerId);
    if (swimmerIndex !== -1) {
        allSwimmers[swimmerIndex] = swimmer;
        localStorage.setItem('swimmers', JSON.stringify(allSwimmers));
    }
}

// ============================================
// APERÇU GÉNÉRAL DE L'ÉQUIPE
// ============================================

function showTeamGeneralOverview() {
    if (!currentTeam) {
        alert('Veuillez sélectionner une équipe d\'abord');
        return;
    }
    
    const modal = document.getElementById('teamOverviewModal');
    const content = document.getElementById('teamOverviewContent');
    const swimmers = getTeamSwimmers();
    
    let html = `
        <h4 style="margin-bottom: 25px; color: #333;">
            <i class="fas fa-chart-pie"></i> Aperçu Général - ${currentTeam.name}
        </h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${swimmers.length}</div>
                <div style="font-size: 1.1rem; opacity: 0.9;">👥 Nageurs Actifs</div>
            </div>
            
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${calculateTotalSessions(swimmers)}</div>
                <div style="font-size: 1.1rem; opacity: 0.9;">🏊 Sessions Totales</div>
            </div>
            
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${calculateTeamAverageAttendance(swimmers)}%</div>
                <div style="font-size: 1.1rem; opacity: 0.9;">✅ Présence Moyenne</div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 12px;">
            <h5 style="margin: 0 0 15px 0; color: #333;">📊 Statistiques Détaillées</h5>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
                <li><strong>Catégorie:</strong> ${currentTeam.category || 'Non définie'}</li>
                <li><strong>Créée le:</strong> ${currentTeam.createdAt ? new Date(currentTeam.createdAt).toLocaleDateString() : 'N/A'}</li>
                <li><strong>Bien-être moyen:</strong> ${calculateTeamAverageWellbeing(swimmers)}</li>
                <li><strong>Taux de présence:</strong> ${calculateTeamAverageAttendance(swimmers)}%</li>
            </ul>
        </div>
    `;
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

function closeTeamOverviewModal() {
    document.getElementById('teamOverviewModal').style.display = 'none';
}

// ============================================
// UTILITAIRES
// ============================================

// Fermer les modals en cliquant en dehors
window.onclick = function(event) {
    const collectiveModal = document.getElementById('collectiveDataModal');
    const overviewModal = document.getElementById('teamOverviewModal');
    const createTeamModal = document.getElementById('createTeamModal');
    
    if (event.target === collectiveModal) {
        collectiveModal.style.display = 'none';
    }
    if (event.target === overviewModal) {
        overviewModal.style.display = 'none';
    }
    if (event.target === createTeamModal) {
        createTeamModal.style.display = 'none';
    }
};

function deleteTeam(teamId, teamName) {
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer l'équipe "${teamName}" ?\n\nCette action est irréversible.`)) {
        return;
    }
    
    const teams = getTeams();
    const updatedTeams = teams.filter(t => t.id !== teamId);
    saveTeamsToStorage(updatedTeams);
    
    alert(`✅ Équipe "${teamName}" supprimée avec succès.`);
    
    // Si l'équipe supprimée était affichée, retour à l'état vide
    if (currentTeam && currentTeam.id === teamId) {
        showEmptyState();
    }
    
    // Recharger la liste des équipes
    loadTeamsList();
}

console.log('✅ Dashboard Équipe chargé avec succès');
