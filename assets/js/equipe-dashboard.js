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
    
    content.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(39,174,96,0.3);">
                <i class="fas fa-calendar-check" style="font-size: 3.5rem; color: white;"></i>
            </div>
            <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 2rem;">Assiduité & Présence de l'Équipe</h2>
            <p style="color: #666; font-size: 1.1rem; margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto;">
                Consultez les statistiques détaillées, analysez les données par nageur et gérez les présences de votre équipe
            </p>
            
            <button onclick="openAttendanceDetailedView()" 
                    style="padding: 18px 40px; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; border: none; border-radius: 12px; font-size: 1.15rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(39,174,96,0.3); transition: all 0.3s ease;"
                    onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(39,174,96,0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(39,174,96,0.3)'">
                <i class="fas fa-chart-line"></i> Voir les Statistiques Détaillées
            </button>
        </div>
    `;
}

function openAttendanceDetailedView() {
    const swimmers = getTeamSwimmers();
    const content = document.getElementById('attendanceContent');
    const attendanceStats = calculateTeamAttendanceStats(swimmers);
    
    content.innerHTML = `
        <!-- En-tête avec bouton retour -->
        <div style="margin-bottom: 30px;">
            <button onclick="loadAttendanceSection(getTeamSwimmers())" 
                    style="padding: 10px 20px; background: white; color: #27ae60; border: 2px solid #27ae60; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;"
                    onmouseover="this.style.background='#27ae60'; this.style.color='white'"
                    onmouseout="this.style.background='white'; this.style.color='#27ae60'">
                <i class="fas fa-arrow-left"></i> Retour
            </button>
        </div>
        
        <h3 style="margin-bottom: 25px; color: #27ae60; display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-calendar-check"></i> 
            <span>Assiduité & Présence de l'Équipe</span>
        </h3>
        
        <!-- Navigation par onglets -->
        <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 30px; overflow: hidden;">
            <div style="display: flex; border-bottom: 2px solid #e0e0e0; overflow-x: auto;">
                <button onclick="showAttendanceTab('overview')" 
                        id="tab-overview"
                        class="attendance-tab active"
                        style="flex: 1; min-width: 150px; padding: 18px 20px; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; border-bottom: 3px solid #1e8449;">
                    <i class="fas fa-chart-pie"></i> Vue d'Ensemble
                </button>
                <button onclick="showAttendanceTab('statistics')" 
                        id="tab-statistics"
                        class="attendance-tab"
                        style="flex: 1; min-width: 150px; padding: 18px 20px; background: #f5f5f5; color: #666; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-chart-bar"></i> Statistiques
                </button>
                <button onclick="showAttendanceTab('swimmers')" 
                        id="tab-swimmers"
                        class="attendance-tab"
                        style="flex: 1; min-width: 150px; padding: 18px 20px; background: #f5f5f5; color: #666; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-users"></i> Par Nageur
                </button>
                <button onclick="showAttendanceTab('analysis')" 
                        id="tab-analysis"
                        class="attendance-tab"
                        style="flex: 1; min-width: 150px; padding: 18px 20px; background: #f5f5f5; color: #666; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-lightbulb"></i> Analyse
                </button>
            </div>
            
            <!-- Contenu des onglets -->
            <div id="attendance-tab-content" style="padding: 30px;">
                ${generateAttendanceOverviewTab(attendanceStats, swimmers)}
            </div>
        </div>
    `;
}

// Variable globale pour stocker le filtre de nageur actif
let currentSwimmerFilter = null;

// Fonction pour générer la barre de filtrage par nageur
function generateSwimmerFilterBar(filteredSwimmers, allSwimmers) {
    const currentTab = document.querySelector('.attendance-tab.active')?.id.replace('tab-', '') || 'overview';
    
    return `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(102,126,234,0.3);">
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <label style="color: white; font-weight: 600; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-filter"></i> Filtrer par nageur :
                </label>
                <select onchange="applySwimmerFilter(this.value)" 
                        style="flex: 1; min-width: 250px; padding: 12px 15px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.3); background: white; font-size: 1rem; color: #333; cursor: pointer; font-weight: 500;">
                    <option value="">🏊 Toute l'équipe (${allSwimmers.length} nageurs)</option>
                    ${allSwimmers.map(swimmer => `
                        <option value="${swimmer.id}" ${currentSwimmerFilter === swimmer.id ? 'selected' : ''}>
                            ${swimmer.name}
                        </option>
                    `).join('')}
                </select>
                ${currentSwimmerFilter ? `
                    <button onclick="clearSwimmerFilter()" 
                            style="padding: 12px 20px; background: white; color: #667eea; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)'"
                            onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-times"></i> Réinitialiser
                    </button>
                ` : ''}
            </div>
            ${currentSwimmerFilter ? `
                <div style="margin-top: 15px; padding: 12px 20px; background: rgba(255,255,255,0.2); border-radius: 8px; color: white; font-weight: 500;">
                    <i class="fas fa-info-circle"></i> Affichage des données pour : <strong>${allSwimmers.find(s => s.id === currentSwimmerFilter)?.name || 'Nageur inconnu'}</strong>
                </div>
            ` : ''}
        </div>
    `;
}

// Fonction pour appliquer le filtre par nageur
function applySwimmerFilter(swimmerId) {
    if (swimmerId === '') {
        currentSwimmerFilter = null;
    } else {
        currentSwimmerFilter = swimmerId;
    }
    
    // Récupérer l'onglet actuel
    const activeTab = document.querySelector('.attendance-tab[style*="linear-gradient"]');
    const tabName = activeTab ? activeTab.id.replace('tab-', '') : 'overview';
    
    // Rafraîchir l'affichage avec le filtre appliqué
    showAttendanceTab(tabName);
}

// Fonction pour réinitialiser le filtre
function clearSwimmerFilter() {
    currentSwimmerFilter = null;
    
    // Récupérer l'onglet actuel
    const activeTab = document.querySelector('.attendance-tab[style*="linear-gradient"]');
    const tabName = activeTab ? activeTab.id.replace('tab-', '') : 'overview';
    
    // Rafraîchir l'affichage
    showAttendanceTab(tabName);
}

function showAttendanceTab(tabName) {
    // TOUJOURS recalculer les statistiques avec les données les plus récentes
    let swimmers = getTeamSwimmers();
    const allSwimmers = getAllSwimmers();
    
    // Appliquer le filtre par nageur si actif
    if (currentSwimmerFilter) {
        swimmers = swimmers.filter(s => s.id === currentSwimmerFilter);
    }
    
    // Recharger les données depuis localStorage pour s'assurer qu'elles sont à jour
    const attendanceStats = calculateTeamAttendanceStats(swimmers);
    
    // Mettre à jour les styles des onglets
    document.querySelectorAll('.attendance-tab').forEach(tab => {
        tab.style.background = '#f5f5f5';
        tab.style.color = '#666';
        tab.style.borderBottom = 'none';
    });
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
    activeTab.style.color = 'white';
    activeTab.style.borderBottom = '3px solid #1e8449';
    
    // Mettre à jour le contenu avec les statistiques fraîches
    const content = document.getElementById('attendance-tab-content');
    
    switch(tabName) {
        case 'overview':
            content.innerHTML = generateSwimmerFilterBar(swimmers, getTeamSwimmers()) + generateAttendanceOverviewTab(attendanceStats, swimmers);
            break;
        case 'statistics':
            content.innerHTML = generateSwimmerFilterBar(swimmers, getTeamSwimmers()) + generateAttendanceStatisticsTab(attendanceStats, swimmers);
            break;
        case 'swimmers':
            content.innerHTML = generateSwimmerFilterBar(swimmers, getTeamSwimmers()) + generateAttendanceSwimmersTab(attendanceStats, swimmers);
            break;
        case 'analysis':
            content.innerHTML = generateSwimmerFilterBar(swimmers, getTeamSwimmers()) + generateAttendanceAnalysisTab(attendanceStats, swimmers);
            break;
    }
}

// Fonction pour rafraîchir les données d'assiduité en temps réel
function refreshAttendanceStats(tabName) {
    // Animation visuelle du rafraîchissement
    const content = document.getElementById('attendance-tab-content');
    
    // Effet de fade-out rapide
    content.style.opacity = '0.5';
    content.style.transition = 'opacity 0.2s';
    
    // Après un court délai, recharger les données
    setTimeout(() => {
        // Le filtre actif est conservé dans currentSwimmerFilter
        // La fonction showAttendanceTab l'appliquera automatiquement
        showAttendanceTab(tabName);
        
        // Rétablir l'opacité normale avec effet de fade-in
        setTimeout(() => {
            content.style.opacity = '1';
            
            // Notification de succès (optionnelle)
            showNotification('✓ Données rafraîchies avec succès', 'success');
        }, 100);
    }, 200);
}

// Fonction pour générer l'analyse dynamique de l'assiduité
function getAttendanceRecommendations(stats, totalSwimmers) {
    let analysis = '';
    
    // Détecter si on affiche un seul nageur
    const isSingleSwimmer = currentSwimmerFilter !== null;
    const swimmerName = isSingleSwimmer ? getTeamSwimmers().find(s => s.id === currentSwimmerFilter)?.name : null;
    
    if (isSingleSwimmer && swimmerName) {
        // Analyse personnalisée pour un nageur individuel
        analysis += `<p><strong style="color: #667eea;">👤 Analyse personnalisée pour ${swimmerName}</strong></p>`;
    }
    
    // Analyse du taux de présence global
    if (stats.averageRate >= 90) {
        analysis += isSingleSwimmer 
            ? `<p>🎉 <strong>Excellente assiduité !</strong> Vous affichez un taux de présence exceptionnel de <strong>${stats.averageRate}%</strong>. Continuez sur cette lancée !</p>`
            : `<p>🎉 <strong>Excellente performance !</strong> L'équipe affiche un taux de présence exceptionnel de <strong>${stats.averageRate}%</strong>. Cette régularité est un atout majeur pour la progression collective.</p>`;
    } else if (stats.averageRate >= 75) {
        analysis += isSingleSwimmer
            ? `<p>✅ <strong>Bonne assiduité.</strong> Avec un taux de <strong>${stats.averageRate}%</strong>, vous montrez un bon engagement. Quelques efforts supplémentaires pour atteindre l'excellence !</p>`
            : `<p>✅ <strong>Bonne assiduité globale.</strong> Avec un taux de <strong>${stats.averageRate}%</strong>, l'équipe montre un engagement satisfaisant. Quelques améliorations permettraient d'atteindre l'excellence.</p>`;
    } else if (stats.averageRate >= 60) {
        analysis += isSingleSwimmer
            ? `<p>⚠️ <strong>Assiduité moyenne.</strong> Le taux de <strong>${stats.averageRate}%</strong> indique des absences régulières. Une meilleure régularité améliorerait vos performances.</p>`
            : `<p>⚠️ <strong>Assiduité moyenne.</strong> Le taux de <strong>${stats.averageRate}%</strong> indique des absences régulières qui peuvent impacter la progression. Des actions ciblées sont recommandées.</p>`;
    } else {
        analysis += isSingleSwimmer
            ? `<p>🚨 <strong>Assiduité préoccupante.</strong> Avec seulement <strong>${stats.averageRate}%</strong> de présence, un effort important est nécessaire pour progresser.</p>`
            : `<p>🚨 <strong>Assiduité préoccupante.</strong> Avec seulement <strong>${stats.averageRate}%</strong> de présence, l'équipe nécessite une intervention urgente pour améliorer la régularité.</p>`;
    }
    
    // Analyse des absences
    if (stats.totalAbsences === 0) {
        analysis += `<p>🌟 <strong>Aucune absence enregistrée !</strong> Performance remarquable de tous les nageurs.</p>`;
    } else {
        const absenceRatio = (stats.totalAbsences / stats.totalRecords * 100).toFixed(1);
        
        if (stats.unexcusedAbsences > stats.excusedAbsences) {
            const unexcusedPercent = ((stats.unexcusedAbsences / stats.totalAbsences) * 100).toFixed(0);
            analysis += `<p>⚠️ <strong>${unexcusedPercent}% des absences ne sont pas justifiées</strong> (${stats.unexcusedAbsences}/${stats.totalAbsences}). Il est important d'encourager la communication pour comprendre les raisons des absences.</p>`;
        } else if (stats.excusedAbsences > 0) {
            const excusedPercent = stats.excusedRate;
            analysis += `<p>📋 <strong>Bon taux de justification</strong> : ${excusedPercent}% des absences sont excusées. Cela témoigne d'une bonne communication avec les nageurs.</p>`;
        }
    }
    
    // Analyse des retards
    if (stats.totalLates > 0) {
        const lateRatio = (stats.totalLates / stats.totalRecords * 100).toFixed(1);
        
        if (stats.totalLates > stats.totalAbsences) {
            analysis += `<p>⏰ <strong>Attention aux retards !</strong> On observe <strong>${stats.totalLates} retards</strong>, ce qui dépasse le nombre d'absences. Considérez un rappel sur l'importance de la ponctualité.</p>`;
        } else if (stats.unexcusedLates > stats.excusedLates) {
            analysis += `<p>⏰ <strong>${stats.totalLates} retards enregistrés</strong>, dont ${stats.unexcusedLates} non justifiés. La ponctualité reste un point à améliorer.</p>`;
        } else {
            analysis += `<p>⏰ <strong>${stats.totalLates} retards</strong> au total, avec une bonne communication (${stats.excusedLates} justifiés).</p>`;
        }
    }
    
    // Analyse des nageurs parfaits
    if (stats.perfectAttendanceCount > 0) {
        const perfectPercent = ((stats.perfectAttendanceCount / totalSwimmers) * 100).toFixed(0);
        analysis += `<p>🏆 <strong>${stats.perfectAttendanceCount} nageur(s) avec une assiduité parfaite</strong> (${perfectPercent}% de l'équipe). Ces nageurs sont des exemples à valoriser !</p>`;
    }
    
    // Analyse des nageurs nécessitant un suivi
    if (stats.topAbsentees.length > 0) {
        const maxAbsences = stats.topAbsentees[0].absences;
        
        if (maxAbsences >= 5) {
            analysis += `<p>🔴 <strong>Suivi prioritaire requis :</strong> ${stats.topAbsentees.length} nageur(s) accumulent des absences importantes (jusqu'à ${maxAbsences}). Un entretien individuel est recommandé.</p>`;
        } else if (maxAbsences >= 3) {
            analysis += `<p>🟠 <strong>Vigilance nécessaire :</strong> ${stats.topAbsentees.length} nageur(s) commencent à accumuler des absences. Un suivi préventif est conseillé.</p>`;
        }
    }
    
    // Analyse du volume de données
    if (stats.totalRecords === 0) {
        analysis += `<p>📊 <strong>Aucune donnée disponible.</strong> Commencez à enregistrer les présences pour obtenir des analyses détaillées.</p>`;
    } else if (stats.totalRecords < totalSwimmers * 5) {
        analysis += `<p>📊 <strong>Données limitées</strong> (${stats.totalRecords} enregistrements). Continuez le suivi régulier pour des analyses plus précises.</p>`;
    } else {
        const avgSessionsPerSwimmer = (stats.totalRecords / totalSwimmers).toFixed(1);
        analysis += `<p>📊 <strong>Base de données solide</strong> : ${stats.totalRecords} enregistrements sur ${totalSwimmers} nageurs (moyenne de ${avgSessionsPerSwimmer} sessions/nageur). Les analyses sont fiables.</p>`;
    }
    
    // Recommandation finale basée sur le contexte global
    if (stats.averageRate >= 85 && stats.perfectAttendanceCount > 0 && stats.topAbsentees.length === 0) {
        analysis += `<p>💪 <strong>Continue comme ça !</strong> L'équipe est sur une excellente trajectoire. Maintenez cette dynamique positive.</p>`;
    } else if (stats.averageRate < 70 || stats.topAbsentees.length >= 3) {
        analysis += `<p>💡 <strong>Actions recommandées :</strong> Organisez des entretiens individuels avec les nageurs absents, identifiez les obstacles et proposez des solutions adaptées.</p>`;
    }
    
    return analysis || '<p>📊 Continuez à enregistrer les données pour obtenir une analyse détaillée.</p>';
}

// Fonction pour générer les points positifs dynamiquement
function getPositivePoints(stats, totalSwimmers) {
    const points = [];
    
    if (stats.averageRate >= 80) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Excellent taux de présence global (${stats.averageRate}%)</li>`);
    } else if (stats.averageRate >= 70) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Bon taux de présence (${stats.averageRate}%)</li>`);
    }
    
    if (stats.perfectAttendanceCount > 0) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> ${stats.perfectAttendanceCount} nageur(s) avec assiduité parfaite (${((stats.perfectAttendanceCount/totalSwimmers)*100).toFixed(0)}% de l'équipe)</li>`);
    }
    
    if (stats.excusedRate >= 70 && stats.totalAbsences > 0) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Excellent taux de justification des absences (${stats.excusedRate}%)</li>`);
    } else if (stats.excusedRate >= 50 && stats.totalAbsences > 0) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Bon taux de justification des absences (${stats.excusedRate}%)</li>`);
    }
    
    if (stats.swimmersWithData >= totalSwimmers * 0.9) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Excellent suivi des nageurs (${stats.swimmersWithData}/${totalSwimmers} nageurs suivis)</li>`);
    } else if (stats.swimmersWithData >= totalSwimmers * 0.7) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Bon suivi des nageurs (${stats.swimmersWithData}/${totalSwimmers})</li>`);
    }
    
    if (stats.totalRecords >= totalSwimmers * 10) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Base de données riche (${stats.totalRecords} enregistrements)</li>`);
    }
    
    if (stats.totalAbsences === 0 && stats.totalRecords > 0) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Aucune absence ! Assiduité exemplaire</li>`);
    }
    
    if (stats.totalLates === 0 && stats.totalRecords > 0) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-check" style="margin-right: 8px;"></i> Aucun retard enregistré ! Excellente ponctualité</li>`);
    }
    
    // Si aucun point positif, afficher un message d'encouragement
    if (points.length === 0) {
        points.push(`<li style="padding: 10px; background: #fff9c4; border-radius: 8px; color: #f57f17;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i> Continuez à enregistrer les présences pour identifier les points forts</li>`);
    }
    
    return points.join('');
}

// Fonction pour générer les points d'attention dynamiquement
function getAttentionPoints(stats, totalSwimmers) {
    const points = [];
    
    if (stats.averageRate < 60) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #ffebee; border-radius: 8px; color: #c62828;"><i class="fas fa-times" style="margin-right: 8px;"></i> Taux de présence faible (${stats.averageRate}%) - Action urgente requise</li>`);
    } else if (stats.averageRate < 70) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff3e0; border-radius: 8px; color: #e65100;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> Taux de présence à améliorer (${stats.averageRate}%)</li>`);
    }
    
    if (stats.totalAbsences > totalSwimmers * 3) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #ffebee; border-radius: 8px; color: #c62828;"><i class="fas fa-times" style="margin-right: 8px;"></i> Nombre très élevé d'absences (${stats.totalAbsences} au total)</li>`);
    } else if (stats.totalAbsences > totalSwimmers * 1.5) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff3e0; border-radius: 8px; color: #e65100;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> Nombre élevé d'absences (${stats.totalAbsences})</li>`);
    }
    
    if (stats.unexcusedAbsences > stats.excusedAbsences && stats.totalAbsences > 0) {
        const unexcusedPercent = ((stats.unexcusedAbsences / stats.totalAbsences) * 100).toFixed(0);
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff3e0; border-radius: 8px; color: #e65100;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> ${unexcusedPercent}% des absences non justifiées (${stats.unexcusedAbsences}/${stats.totalAbsences})</li>`);
    }
    
    if (stats.topAbsentees.length >= 5) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #ffebee; border-radius: 8px; color: #c62828;"><i class="fas fa-times" style="margin-right: 8px;"></i> ${stats.topAbsentees.length} nageurs nécessitent un suivi urgent</li>`);
    } else if (stats.topAbsentees.length > 0) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff3e0; border-radius: 8px; color: #e65100;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> ${stats.topAbsentees.length} nageur(s) à suivre de près</li>`);
    }
    
    if (stats.swimmersWithData < totalSwimmers * 0.5) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #ffebee; border-radius: 8px; color: #c62828;"><i class="fas fa-times" style="margin-right: 8px;"></i> Suivi très incomplet (seulement ${stats.swimmersWithData}/${totalSwimmers} nageurs)</li>`);
    } else if (stats.swimmersWithData < totalSwimmers * 0.7) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff3e0; border-radius: 8px; color: #e65100;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> Suivi incomplet des nageurs (${stats.swimmersWithData}/${totalSwimmers})</li>`);
    }
    
    if (stats.totalLates > stats.totalAbsences && stats.totalLates > 5) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff3e0; border-radius: 8px; color: #e65100;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> Problème de ponctualité (${stats.totalLates} retards)</li>`);
    }
    
    if (stats.unexcusedLates > stats.excusedLates && stats.totalLates > 3) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff3e0; border-radius: 8px; color: #e65100;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> Retards majoritairement non justifiés (${stats.unexcusedLates}/${stats.totalLates})</li>`);
    }
    
    if (stats.totalRecords < totalSwimmers * 3 && stats.totalRecords > 0) {
        points.push(`<li style="padding: 10px; margin-bottom: 10px; background: #fff9c4; border-radius: 8px; color: #f57f17;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i> Données limitées - Continuez le suivi régulier</li>`);
    }
    
    // Si aucun point d'attention, afficher un message positif
    if (points.length === 0) {
        points.push(`<li style="padding: 10px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;"><i class="fas fa-thumbs-up" style="margin-right: 8px;"></i> Aucun point d'attention majeur ! Excellente gestion de l'assiduité</li>`);
    }
    
    return points.join('');
}

// Fonction pour générer des recommandations dynamiques et personnalisées
function getDynamicRecommendations(stats, totalSwimmers) {
    const recommendations = [];
    const isSingleSwimmer = currentSwimmerFilter !== null;
    
    // Recommandation 1: Basée sur le taux de présence
    if (stats.averageRate < 60) {
        recommendations.push(`
            <div style="padding: 15px; background: #ffebee; border-left: 4px solid #f44336; border-radius: 8px;">
                <strong style="color: #c62828; display: block; margin-bottom: 8px;">🚨 ${isSingleSwimmer ? 'URGENCE : Amélioration Nécessaire' : 'URGENCE : Plan d\'Action Immédiat'}</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${isSingleSwimmer 
                    ? `Le taux de présence de ${stats.averageRate}% est préoccupant. Il est important de discuter des obstacles qui empêchent une participation régulière et de trouver des solutions.`
                    : `Le taux de présence de ${stats.averageRate}% nécessite une intervention urgente. Organisez une réunion d'équipe pour identifier les problèmes et établir un plan d'amélioration concret avec des objectifs mesurables.`
                }</p>
            </div>
        `);
    } else if (stats.averageRate < 75) {
        recommendations.push(`
            <div style="padding: 15px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px;">
                <strong style="color: #e65100; display: block; margin-bottom: 8px;">⚠️ Amélioration de l'Assiduité</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${isSingleSwimmer
                    ? `Avec ${stats.averageRate}% de présence, il y a une marge de progression. Identifiez les obstacles et fixez-vous des objectifs réalistes pour améliorer votre régularité.`
                    : `Avec ${stats.averageRate}% de présence, l'équipe peut mieux faire. Identifiez les obstacles principaux et mettez en place des mesures incitatives pour encourager la régularité.`
                }</p>
            </div>
        `);
    } else if (stats.averageRate >= 90) {
        recommendations.push(`
            <div style="padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 8px;">
                <strong style="color: #2e7d32; display: block; margin-bottom: 8px;">🌟 ${isSingleSwimmer ? 'Excellent Travail !' : 'Maintien de l\'Excellence'}</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${isSingleSwimmer
                    ? `Excellent taux de présence (${stats.averageRate}%) ! Vous êtes un exemple pour l'équipe. Continuez cet engagement exemplaire !`
                    : `Excellent taux de présence (${stats.averageRate}%) ! Continuez à célébrer les succès et à valoriser les nageurs assidus pour maintenir cette dynamique positive.`
                }</p>
            </div>
        `);
    }
    
    // Recommandation 2: Basée sur les absences non justifiées
    if (stats.unexcusedAbsences > stats.excusedAbsences && stats.totalAbsences > 0) {
        const unexcusedPercent = ((stats.unexcusedAbsences / stats.totalAbsences) * 100).toFixed(0);
        recommendations.push(`
            <div style="padding: 15px; background: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 8px;">
                <strong style="color: #1565c0; display: block; margin-bottom: 8px;">📞 ${isSingleSwimmer ? 'Importance de Justifier les Absences' : 'Communication Renforcée'}</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${isSingleSwimmer
                    ? `${unexcusedPercent}% de vos absences ne sont pas justifiées. Pensez à prévenir votre coach en cas d'absence pour maintenir une bonne communication et faciliter l'organisation de l'équipe.`
                    : `${unexcusedPercent}% des absences ne sont pas justifiées. Facilitez la communication en créant un canal simple pour signaler les absences (SMS, email, app). Rappelez l'importance de prévenir en cas d'absence.`
                }</p>
            </div>
        `);
    }
    
    // Recommandation 3: Basée sur les nageurs nécessitant un suivi (seulement en mode équipe)
    if (!isSingleSwimmer && stats.topAbsentees.length >= 3) {
        const maxAbsences = stats.topAbsentees[0].absences;
        recommendations.push(`
            <div style="padding: 15px; background: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 8px;">
                <strong style="color: #1565c0; display: block; margin-bottom: 8px;">👥 Suivi Individualisé</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${stats.topAbsentees.length} nageurs accumulent des absences (jusqu'à ${maxAbsences}). Planifiez des entretiens individuels pour comprendre les raisons et proposer des solutions adaptées à chaque situation.</p>
            </div>
        `);
    } else if (!isSingleSwimmer && stats.perfectAttendanceCount > 0) {
        const perfectPercent = ((stats.perfectAttendanceCount / totalSwimmers) * 100).toFixed(0);
        recommendations.push(`
            <div style="padding: 15px; background: #fff9c4; border-left: 4px solid #ffc107; border-radius: 8px;">
                <strong style="color: #f57f17; display: block; margin-bottom: 8px;">🏆 Valorisation des Exemples</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${stats.perfectAttendanceCount} nageur(s) (${perfectPercent}% de l'équipe) ont une assiduité parfaite ! Mettez-les en avant lors des entraînements et organisez une reconnaissance publique pour inspirer les autres.</p>
            </div>
        `);
    }
    
    // Recommandation 4: Basée sur les retards
    if (stats.totalLates > stats.totalAbsences && stats.totalLates > (isSingleSwimmer ? 2 : 5)) {
        recommendations.push(`
            <div style="padding: 15px; background: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 8px;">
                <strong style="color: #1565c0; display: block; margin-bottom: 8px;">⏰ Amélioration de la Ponctualité</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${isSingleSwimmer
                    ? `Vous avez enregistré ${stats.totalLates} retards, ce qui dépasse vos absences. La ponctualité est importante : un échauffement manqué peut impacter vos performances et augmenter les risques de blessure.`
                    : `Les retards (${stats.totalLates}) dépassent les absences. Rappelez l'importance de la ponctualité et envisagez d'ajuster les horaires si nécessaire. Un échauffement manqué peut impacter la performance et augmenter les risques de blessure.`
                }</p>
            </div>
        `);
    }
    
    // Recommandation 5: Basée sur le suivi des données (seulement mode équipe)
    if (!isSingleSwimmer) {
        if (stats.swimmersWithData < totalSwimmers * 0.7) {
            recommendations.push(`
                <div style="padding: 15px; background: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 8px;">
                    <strong style="color: #1565c0; display: block; margin-bottom: 8px;">📊 Amélioration du Suivi</strong>
                    <p style="margin: 0; color: #666; line-height: 1.6;">Seulement ${stats.swimmersWithData} nageurs sur ${totalSwimmers} ont des données enregistrées. Assurez-vous de suivre tous les nageurs régulièrement pour obtenir une vision complète de l'assiduité de l'équipe.</p>
                </div>
            `);
        } else if (stats.totalRecords >= totalSwimmers * 10) {
            recommendations.push(`
                <div style="padding: 15px; background: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 8px;">
                    <strong style="color: #1565c0; display: block; margin-bottom: 8px;">📈 Analyse des Tendances</strong>
                    <p style="margin: 0; color: #666; line-height: 1.6;">Avec ${stats.totalRecords} enregistrements, vous disposez d'une base solide. Analysez les tendances mensuelles et hebdomadaires pour identifier les périodes critiques et adapter votre planification.</p>
                </div>
            `);
        }
    }
    
    // Recommandation toujours présente selon le mode
    if (isSingleSwimmer) {
        recommendations.push(`
            <div style="padding: 15px; background: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 8px;">
                <strong style="color: #1565c0; display: block; margin-bottom: 8px;">🎯 Objectifs Personnels</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">Fixez-vous des objectifs d'assiduité réalistes et suivez vos progrès. Discutez avec votre coach pour établir un plan personnalisé qui vous aidera à maintenir une présence régulière aux entraînements.</p>
            </div>
        `);
    } else {
        recommendations.push(`
            <div style="padding: 15px; background: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 8px;">
                <strong style="color: #1565c0; display: block; margin-bottom: 8px;">👨‍👩‍👧‍👦 Partenariat avec les Parents</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">Partagez régulièrement les statistiques d'assiduité avec les parents via email ou une application. Un suivi transparent favorise l'engagement familial et renforce la motivation des nageurs.</p>
            </div>
        `);
    }
    
    // Si très peu de données, recommander de commencer le suivi
    if (stats.totalRecords === 0) {
        return `
            <div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px;">
                <strong style="color: #1565c0; display: block; margin-bottom: 8px;">🚀 ${isSingleSwimmer ? 'Démarrage du Suivi Personnel' : 'Démarrage du Suivi'}</strong>
                <p style="margin: 0; color: #666; line-height: 1.6;">${isSingleSwimmer
                    ? `Aucune donnée de présence n'a encore été enregistrée. Le suivi régulier de votre assiduité vous aidera à progresser et à rester motivé.`
                    : `Commencez à enregistrer les présences dès maintenant pour obtenir des analyses détaillées et des recommandations personnalisées. Un suivi régulier est la clé d'une bonne gestion de l'équipe.`
                }</p>
            </div>
        `;
    }
    
    return recommendations.join('');
}

// Fonction de notification simple (si elle n'existe pas déjà)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' : 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function generateAttendanceOverviewTab(attendanceStats, swimmers) {
    return `
        <h4 style="margin: 0 0 25px 0; color: #333; font-size: 1.5rem;">📊 Moyennes de l'Équipe</h4>
        
        <!-- Cartes des 5 Statuts -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 15px; color: white; box-shadow: 0 6px 20px rgba(76,175,80,0.4); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-check-circle" style="font-size: 2rem;"></i>
                </div>
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;" id="overview-present-count">${attendanceStats.presentCount}</div>
                <div style="font-size: 1.1rem; opacity: 0.95; font-weight: 600; margin-bottom: 8px;">✅ Présents</div>
                <div style="font-size: 0.9rem; opacity: 0.85; padding: 8px 15px; background: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">
                    <span id="overview-present-rate">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.presentCount / attendanceStats.totalRecords) * 100) : 0}%</span> du total
                </div>
            </div>
            
            <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #f44336 0%, #e57373 100%); border-radius: 15px; color: white; box-shadow: 0 6px 20px rgba(244,67,54,0.4); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-times-circle" style="font-size: 2rem;"></i>
                </div>
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;" id="overview-absent-count">${attendanceStats.unexcusedAbsences}</div>
                <div style="font-size: 1.1rem; opacity: 0.95; font-weight: 600; margin-bottom: 8px;">❌ Absents</div>
                <div style="font-size: 0.9rem; opacity: 0.85; padding: 8px 15px; background: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">
                    <span id="overview-absent-rate">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.unexcusedAbsences / attendanceStats.totalRecords) * 100) : 0}%</span> du total
                </div>
            </div>
            
            <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%); border-radius: 15px; color: white; box-shadow: 0 6px 20px rgba(156,39,176,0.4); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-clipboard-check" style="font-size: 2rem;"></i>
                </div>
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;" id="overview-excused-absent-count">${attendanceStats.excusedAbsences}</div>
                <div style="font-size: 1.1rem; opacity: 0.95; font-weight: 600; margin-bottom: 8px;">📝 Abs. Justifiés</div>
                <div style="font-size: 0.9rem; opacity: 0.85; padding: 8px 15px; background: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">
                    <span id="overview-excused-absent-rate">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.excusedAbsences / attendanceStats.totalRecords) * 100) : 0}%</span> du total
                </div>
            </div>
            
            <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%); border-radius: 15px; color: white; box-shadow: 0 6px 20px rgba(255,152,0,0.4); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-clock" style="font-size: 2rem;"></i>
                </div>
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;" id="overview-late-count">${attendanceStats.unexcusedLates}</div>
                <div style="font-size: 1.1rem; opacity: 0.95; font-weight: 600; margin-bottom: 8px;">⏰ Retards</div>
                <div style="font-size: 0.9rem; opacity: 0.85; padding: 8px 15px; background: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">
                    <span id="overview-late-rate">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.unexcusedLates / attendanceStats.totalRecords) * 100) : 0}%</span> du total
                </div>
            </div>
            
            <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%); border-radius: 15px; color: white; box-shadow: 0 6px 20px rgba(33,150,243,0.4); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-history" style="font-size: 2rem;"></i>
                </div>
                <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;" id="overview-excused-late-count">${attendanceStats.excusedLates}</div>
                <div style="font-size: 1.1rem; opacity: 0.95; font-weight: 600; margin-bottom: 8px;">⏰ Ret. Justifiés</div>
                <div style="font-size: 0.9rem; opacity: 0.85; padding: 8px 15px; background: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">
                    <span id="overview-excused-late-rate">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.excusedLates / attendanceStats.totalRecords) * 100) : 0}%</span> du total
                </div>
            </div>
        </div>
    `;
}

function generateAttendanceStatisticsTab(attendanceStats, swimmers) {
    // Créer les graphiques après un court délai
    setTimeout(() => createAttendanceCharts(attendanceStats), 150);
    
    return `
        <!-- Boutons Rafraîchir et Export PDF -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h4 style="margin: 0; color: #333; font-size: 1.5rem;">📊 Statistiques Détaillées par Statut</h4>
            <div style="display: flex; gap: 10px;">
                <button onclick="exportAttendanceToPDF()" 
                        style="padding: 10px 20px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; box-shadow: 0 3px 10px rgba(231,76,60,0.3); transition: all 0.3s;"
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-file-pdf"></i> Exporter PDF
                </button>
                <button onclick="refreshAttendanceStats('statistics')" 
                        style="padding: 10px 20px; background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%); color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; box-shadow: 0 3px 10px rgba(33,150,243,0.3); transition: all 0.3s;"
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-sync-alt"></i> Rafraîchir
                </button>
            </div>
        </div>
        
        <!-- Message de mise à jour -->
        <div style="background: #e3f2fd; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
            <i class="fas fa-info-circle"></i> <strong>Dernière mise à jour :</strong> ${new Date().toLocaleString('fr-FR')} | <strong>${attendanceStats.totalRecords}</strong> enregistrement(s) | <strong>${swimmers.length}</strong> nageur(s)
        </div>
        
        <!-- Graphiques visuels -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <h5 style="margin: 0 0 20px 0; color: #333; font-size: 1.2rem; text-align: center;">📊 Répartition des Statuts</h5>
                <canvas id="attendanceDistributionChart" style="max-height: 300px;"></canvas>
            </div>
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <h5 style="margin: 0 0 20px 0; color: #333; font-size: 1.2rem; text-align: center;">📈 Évolution Temporelle</h5>
                <canvas id="attendanceTrendChart" style="max-height: 300px;"></canvas>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 25px 20px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(76,175,80,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 2.8rem; font-weight: bold; margin-bottom: 8px;">${attendanceStats.presentCount}</div>
                <div style="font-size: 1rem; opacity: 0.95; font-weight: 500;">✅ Présents</div>
                <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.presentCount / attendanceStats.totalRecords) * 100) : 0}% du total</div>
            </div>
            <div style="text-align: center; padding: 25px 20px; background: linear-gradient(135deg, #f44336 0%, #e57373 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(244,67,54,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 2.8rem; font-weight: bold; margin-bottom: 8px;">${attendanceStats.unexcusedAbsences}</div>
                <div style="font-size: 1rem; opacity: 0.95; font-weight: 500;">❌ Absents</div>
                <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.unexcusedAbsences / attendanceStats.totalRecords) * 100) : 0}% du total</div>
            </div>
            <div style="text-align: center; padding: 25px 20px; background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(156,39,176,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 2.8rem; font-weight: bold; margin-bottom: 8px;">${attendanceStats.excusedAbsences}</div>
                <div style="font-size: 1rem; opacity: 0.95; font-weight: 500;">📝 Abs. Justifiés</div>
                <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.excusedAbsences / attendanceStats.totalRecords) * 100) : 0}% du total</div>
            </div>
            <div style="text-align: center; padding: 25px 20px; background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(255,152,0,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 2.8rem; font-weight: bold; margin-bottom: 8px;">${attendanceStats.unexcusedLates}</div>
                <div style="font-size: 1rem; opacity: 0.95; font-weight: 500;">⏰ Retards</div>
                <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.unexcusedLates / attendanceStats.totalRecords) * 100) : 0}% du total</div>
            </div>
            <div style="text-align: center; padding: 25px 20px; background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(33,150,243,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 2.8rem; font-weight: bold; margin-bottom: 8px;">${attendanceStats.excusedLates}</div>
                <div style="font-size: 1rem; opacity: 0.95; font-weight: 500;">⏰ Ret. Justifiés</div>
                <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">${attendanceStats.totalRecords > 0 ? Math.round((attendanceStats.excusedLates / attendanceStats.totalRecords) * 100) : 0}% du total</div>
            </div>
        </div>
        
        <h4 style="margin: 30px 0 15px 0; color: #333; font-size: 1.3rem;">🏆 Indicateurs Clés de Performance</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #27ae60; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #27ae60, #229954); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-percentage" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #27ae60;">${attendanceStats.averageRate}%</div>
                        <div style="font-size: 0.9rem; color: #666;">Taux Global</div>
                    </div>
                </div>
                <div style="background: #e8f5e9; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Taux de présence moyen de l'équipe
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #9c27b0; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #9c27b0, #ba68c8); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-star" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #9c27b0;">${attendanceStats.perfectAttendanceCount}</div>
                        <div style="font-size: 0.9rem; color: #666;">Assiduité Parfaite</div>
                    </div>
                </div>
                <div style="background: #f3e5f5; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Nageurs avec 100% de présence
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #00bcd4; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #00bcd4, #4dd0e1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-calendar-week" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #00bcd4;">${attendanceStats.averageSessionsPerWeek}</div>
                        <div style="font-size: 0.9rem; color: #666;">Sessions/Semaine</div>
                    </div>
                </div>
                <div style="background: #e0f7fa; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Nombre moyen de sessions hebdomadaires
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #ff5722; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff5722, #ff7043); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-database" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #ff5722;">${attendanceStats.totalRecords}</div>
                        <div style="font-size: 0.9rem; color: #666;">Enregistrements</div>
                    </div>
                </div>
                <div style="background: #fbe9e7; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Total des données de présence
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #673ab7; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #673ab7, #9575cd); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chart-line" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #673ab7;">${attendanceStats.engagementRate || 0}%</div>
                        <div style="font-size: 0.9rem; color: #666;">Engagement</div>
                    </div>
                </div>
                <div style="background: #ede7f6; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Taux d'engagement global
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #009688; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #009688, #4db6ac); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-fire" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #009688;">${attendanceStats.regularityScore || 0}</div>
                        <div style="font-size: 0.9rem; color: #666;">Régularité</div>
                    </div>
                </div>
                <div style="background: #e0f2f1; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Score de régularité des présences
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
            <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 25px; border-radius: 12px; border: 2px solid #f44336;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #9c27b0, #ba68c8); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-star" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #9c27b0;">${attendanceStats.perfectAttendanceCount}</div>
                        <div style="font-size: 0.9rem; color: #666;">Assiduité Parfaite</div>
                    </div>
                </div>
                <div style="background: #f3e5f5; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Nageurs avec 100% de présence
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #00bcd4; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #00bcd4, #4dd0e1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-calendar-week" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #00bcd4;">${attendanceStats.averageSessionsPerWeek}</div>
                        <div style="font-size: 0.9rem; color: #666;">Sessions/Semaine</div>
                    </div>
                </div>
                <div style="background: #e0f7fa; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Nombre moyen de sessions hebdomadaires
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border-left: 5px solid #ff5722; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff5722, #ff7043); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-database" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: #ff5722;">${attendanceStats.totalRecords}</div>
                        <div style="font-size: 0.9rem; color: #666;">Enregistrements</div>
                    </div>
                </div>
                <div style="background: #fbe9e7; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #666;">
                    Total des données de présence
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
            <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 25px; border-radius: 12px; border: 2px solid #f44336;">
                <h5 style="margin: 0 0 15px 0; color: #c62828; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exclamation-triangle"></i> Statistiques Absences
                </h5>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Total Absences:</span>
                        <span style="font-weight: bold; color: #f44336;">${attendanceStats.totalAbsences}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Non Justifiées:</span>
                        <span style="font-weight: bold; color: #f44336;">${attendanceStats.unexcusedAbsences}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Justifiées:</span>
                        <span style="font-weight: bold; color: #9c27b0;">${attendanceStats.excusedAbsences}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Taux Justification:</span>
                        <span style="font-weight: bold; color: #2196f3;">${attendanceStats.excusedRate}%</span>
                    </div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 25px; border-radius: 12px; border: 2px solid #ff9800;">
                <h5 style="margin: 0 0 15px 0; color: #e65100; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-clock"></i> Statistiques Retards
                </h5>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Total Retards:</span>
                        <span style="font-weight: bold; color: #ff9800;">${attendanceStats.totalLates}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Non Justifiés:</span>
                        <span style="font-weight: bold; color: #ff9800;">${attendanceStats.unexcusedLates}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Justifiés:</span>
                        <span style="font-weight: bold; color: #2196f3;">${attendanceStats.excusedLates}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">Taux Justification:</span>
                        <span style="font-weight: bold; color: #2196f3;">${attendanceStats.totalLates > 0 ? Math.round((attendanceStats.excusedLates / attendanceStats.totalLates) * 100) : 0}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateAttendanceSwimmersTab(attendanceStats, swimmers) {
    return `
        <!-- Bouton Rafraîchir -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h4 style="margin: 0; color: #333; font-size: 1.5rem;">👥 Détails par Nageur</h4>
            <button onclick="refreshAttendanceStats('swimmers')" 
                    style="padding: 10px 20px; background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%); color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; box-shadow: 0 3px 10px rgba(33,150,243,0.3); transition: all 0.3s;"
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'">
                <i class="fas fa-sync-alt"></i> Rafraîchir les Données
            </button>
        </div>
        
        <!-- Message de mise à jour -->
        <div style="background: #e3f2fd; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
            <i class="fas fa-info-circle"></i> <strong>Dernière mise à jour :</strong> ${new Date().toLocaleString('fr-FR')} | <strong>${attendanceStats.totalRecords}</strong> enregistrement(s) | <strong>${swimmers.length}</strong> nageur(s)
        </div>
        
        <div style="overflow-x: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white;">
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 0.95rem; position: sticky; left: 0; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); z-index: 10;">👤 Nageur</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">✅ Présents</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">❌ Absents</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">📝 Abs. Just.</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">⏰ Retards</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">⏰ Ret. Just.</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">📊 Total</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">📈 Taux</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">🏆 Statut</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 0.95rem;">📜 Historique</th>
                    </tr>
                </thead>
                <tbody>
                    ${attendanceStats.detailedSwimmerStats.map((stat, index) => `
                        <tr style="border-bottom: 1px solid #e0e0e0; ${index % 2 === 0 ? 'background: #fafafa;' : 'background: white;'} transition: background 0.2s;" onmouseover="this.style.background='#f0f8ff'" onmouseout="this.style.background='${index % 2 === 0 ? '#fafafa' : 'white'}'">
                            <td style="padding: 14px 12px; font-weight: 600; color: #333; position: sticky; left: 0; background: ${index % 2 === 0 ? '#fafafa' : 'white'}; z-index: 5;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.9rem;">
                                        ${stat.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>${stat.name}</span>
                                </div>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <span style="display: inline-block; padding: 6px 12px; background: #e8f5e9; color: #4caf50; font-weight: 600; border-radius: 8px; font-size: 0.95rem;">${stat.presences}</span>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <span style="display: inline-block; padding: 6px 12px; background: #ffebee; color: #f44336; font-weight: 600; border-radius: 8px; font-size: 0.95rem;">${stat.absences}</span>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <span style="display: inline-block; padding: 6px 12px; background: #f3e5f5; color: #9c27b0; font-weight: 600; border-radius: 8px; font-size: 0.95rem;">${stat.excusedAbsences}</span>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <span style="display: inline-block; padding: 6px 12px; background: #fff3e0; color: #ff9800; font-weight: 600; border-radius: 8px; font-size: 0.95rem;">${stat.lates}</span>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <span style="display: inline-block; padding: 6px 12px; background: #e3f2fd; color: #2196f3; font-weight: 600; border-radius: 8px; font-size: 0.95rem;">${stat.excusedLates}</span>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <span style="font-weight: 600; color: #666; font-size: 0.95rem;">${stat.total}</span>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                                    <div style="width: 100%; max-width: 100px; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                                        <div style="height: 100%; background: ${stat.rate >= 80 ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)' : stat.rate >= 60 ? 'linear-gradient(90deg, #ff9800 0%, #ffa726 100%)' : 'linear-gradient(90deg, #f44336 0%, #e57373 100%)'}; width: ${stat.rate}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <span style="font-weight: 700; color: ${stat.rate >= 80 ? '#4caf50' : stat.rate >= 60 ? '#ff9800' : '#f44336'}; font-size: 1rem;">${stat.rate}%</span>
                                </div>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.15); ${
                                    stat.rate >= 95 ? 'background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white;' :
                                    stat.rate >= 80 ? 'background: linear-gradient(135deg, #8bc34a 0%, #9ccc65 100%); color: white;' :
                                    stat.rate >= 60 ? 'background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%); color: white;' :
                                    'background: linear-gradient(135deg, #f44336 0%, #e57373 100%); color: white;'
                                }">
                                    ${stat.rate >= 95 ? '⭐ Excellent' : stat.rate >= 80 ? '✅ Bon' : stat.rate >= 60 ? '⚠️ Moyen' : '❌ Faible'}
                                </span>
                            </td>
                            <td style="padding: 14px 12px; text-align: center;">
                                <button onclick="openSwimmerHistory('${stat.name ? stat.name.replace(/'/g,"\\'") : ''}')" style="padding:6px 10px; border-radius:8px; border:1px solid #e0e0e0; background:white; cursor:pointer;">
                                    <i class="fas fa-history"></i> Voir
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        ${attendanceStats.perfectAttendanceSwimmers.length > 0 ? `
        <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; border: 2px solid #4caf50; margin-top: 30px;">
            <h4 style="margin: 0 0 15px 0; color: #2e7d32; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-trophy"></i> Nageurs avec Assiduité Parfaite (100%)
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                ${attendanceStats.perfectAttendanceSwimmers.map(name => `
                    <div style="background: white; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-star" style="color: #f57f17; font-size: 1.2rem;"></i>
                        </div>
                        <span style="font-weight: 600; color: #333;">${name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${attendanceStats.topAbsentees.length > 0 ? `
        <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 25px; border-radius: 12px; border: 2px solid #f44336; margin-top: 20px;">
            <h4 style="margin: 0 0 15px 0; color: #c62828; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle"></i> Nageurs Nécessitant un Suivi
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
                ${attendanceStats.topAbsentees.map(swimmer => `
                    <div style="background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        <span style="font-weight: 600; color: #333;">${swimmer.name}</span>
                        <span style="padding: 6px 12px; background: #f44336; color: white; border-radius: 12px; font-weight: 700; font-size: 0.9rem;">${swimmer.absences} absence(s)</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

function generateAttendanceAnalysisTab(attendanceStats, swimmers) {
    return `
        <!-- Bouton Rafraîchir -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h4 style="margin: 0; color: #333; font-size: 1.5rem;">💡 Analyse & Recommandations</h4>
            <button onclick="refreshAttendanceStats('analysis')" 
                    style="padding: 10px 20px; background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%); color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; box-shadow: 0 3px 10px rgba(33,150,243,0.3); transition: all 0.3s;"
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'">
                <i class="fas fa-sync-alt"></i> Rafraîchir l'Analyse
            </button>
        </div>
        
        <!-- Message de mise à jour -->
        <div style="background: #e3f2fd; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
            <i class="fas fa-info-circle"></i> <strong>Analyse générée le :</strong> ${new Date().toLocaleString('fr-FR')} | Basée sur <strong>${attendanceStats.totalRecords}</strong> enregistrement(s)
        </div>
        
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; border-left: 5px solid #27ae60; margin-bottom: 25px;">
            <h5 style="margin: 0 0 15px 0; color: #27ae60; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-chart-line"></i> Analyse Globale de l'Assiduité
            </h5>
            <div style="color: #666; line-height: 1.8; font-size: 1.05rem;">
                ${getAttendanceRecommendations(attendanceStats, swimmers.length)}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 3px 12px rgba(0,0,0,0.1); border-top: 4px solid #4caf50;">
                <h5 style="margin: 0 0 15px 0; color: #4caf50; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-check-circle"></i> Points Positifs
                </h5>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${getPositivePoints(attendanceStats, swimmers.length)}
                </ul>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 3px 12px rgba(0,0,0,0.1); border-top: 4px solid #ff9800;">
                <h5 style="margin: 0 0 15px 0; color: #ff9800; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exclamation-circle"></i> Points d'Attention
                </h5>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${getAttentionPoints(attendanceStats, swimmers.length)}
                </ul>
            </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 3px 12px rgba(0,0,0,0.1); border-top: 4px solid #2196f3;">
            <h5 style="margin: 0 0 20px 0; color: #2196f3; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-lightbulb"></i> Recommandations Personnalisées
            </h5>
            <div style="display: grid; gap: 15px;">
                ${getDynamicRecommendations(attendanceStats, swimmers.length)}
            </div>
        </div>
    `;
}

function calculateTeamAttendanceStats(swimmers) {
    const allAttendanceData = [];
    const swimmerAbsences = [];
    const detailedSwimmerStats = [];
    const perfectAttendanceSwimmers = [];
    
    swimmers.forEach(swimmer => {
        if (swimmer.attendanceData && Array.isArray(swimmer.attendanceData)) {
            allAttendanceData.push(...swimmer.attendanceData);
            
            // Calculer les stats détaillées par nageur
            let presences = 0;
            let absences = 0;
            let excusedAbsences = 0;
            let lates = 0;
            let excusedLates = 0;
            
            swimmer.attendanceData.forEach(record => {
                if (record.status === 'present' || record.status === 'présent') {
                    presences++;
                } else if (record.status === 'absent' || record.status === 'absence') {
                    if (record.excused === true || record.excused === 'yes') {
                        excusedAbsences++;
                    } else {
                        absences++;
                    }
                } else if (record.status === 'late' || record.status === 'retard') {
                    if (record.excused === true || record.excused === 'yes') {
                        excusedLates++;
                    } else {
                        lates++;
                    }
                }
            });
            
            const total = swimmer.attendanceData.length;
            const rate = total > 0 ? Math.round((presences / total) * 100) : 100;
            const totalAbsences = absences + excusedAbsences;
            
            if (totalAbsences > 0) {
                swimmerAbsences.push({ name: swimmer.name, absences: totalAbsences });
            }
            
            if (rate === 100 && total > 0) {
                perfectAttendanceSwimmers.push(swimmer.name);
            }
            
            detailedSwimmerStats.push({
                name: swimmer.name,
                presences: presences,
                absences: absences,
                excusedAbsences: excusedAbsences,
                lates: lates,
                excusedLates: excusedLates,
                total: total,
                rate: rate
            , id: swimmer.id });
        } else {
            // Nageur sans données = assiduité parfaite par défaut
            detailedSwimmerStats.push({
                name: swimmer.name,
                presences: 0,
                absences: 0,
                excusedAbsences: 0,
                lates: 0,
                excusedLates: 0,
                total: 0,
                rate: 100
            , id: swimmer.id });
        }
    });
    
    let presentCount = 0;
    let unexcusedAbsences = 0;
    let excusedAbsences = 0;
    let unexcusedLates = 0;
    let excusedLates = 0;
    
    allAttendanceData.forEach(record => {
        if (record.status === 'present' || record.status === 'présent') {
            presentCount++;
        } else if (record.status === 'absent' || record.status === 'absence') {
            if (record.excused === true || record.excused === 'yes') {
                excusedAbsences++;
            } else {
                unexcusedAbsences++;
            }
        } else if (record.status === 'late' || record.status === 'retard') {
            if (record.excused === true || record.excused === 'yes') {
                excusedLates++;
            } else {
                unexcusedLates++;
            }
        }
    });
    
    const totalRecords = allAttendanceData.length;
    const totalAbsences = unexcusedAbsences + excusedAbsences;
    const totalLates = unexcusedLates + excusedLates;
    const averageRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;
    const excusedRate = totalAbsences > 0 ? Math.round((excusedAbsences / totalAbsences) * 100) : 0;
    
    // Top 5 absentéistes
    const topAbsentees = swimmerAbsences
        .sort((a, b) => b.absences - a.absences)
        .slice(0, 5);
    
    // Calculer moyenne sessions par semaine
    const uniqueDates = new Set(allAttendanceData.map(r => r.date));
    const totalDays = uniqueDates.size;
    const totalWeeks = totalDays > 0 ? Math.ceil(totalDays / 7) : 1;
    const averageSessionsPerWeek = totalWeeks > 0 ? (totalRecords / totalWeeks).toFixed(1) : '0.0';
    
    // Trier les stats détaillées par taux de présence (décroissant)
    detailedSwimmerStats.sort((a, b) => b.rate - a.rate);
    
    // Calculer le taux d'engagement (présences + retards / total)
    const engagementRate = totalRecords > 0 ? 
        Math.round(((presentCount + unexcusedLates + excusedLates) / totalRecords) * 100) : 0;
    
    // Calculer le score de régularité (basé sur la variance des présences)
    let regularityScore = 100;
    if (uniqueDates.size > 1) {
        const sortedDates = Array.from(uniqueDates).sort();
        const gaps = [];
        for (let i = 1; i < sortedDates.length; i++) {
            const gap = Math.abs(new Date(sortedDates[i]) - new Date(sortedDates[i-1])) / (1000 * 60 * 60 * 24);
            gaps.push(gap);
        }
        if (gaps.length > 0) {
            const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
            const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
            regularityScore = Math.max(0, Math.min(100, Math.round(100 - (variance / 10))));
        }
    }
    
    // Préparer les données pour les graphiques
    const dateGroups = {};
    allAttendanceData.forEach(record => {
        if (!dateGroups[record.date]) {
            dateGroups[record.date] = {
                present: 0,
                absent: 0,
                excusedAbsent: 0,
                late: 0,
                excusedLate: 0
            };
        }
        
        if (record.status === 'present' || record.status === 'présent') {
            dateGroups[record.date].present++;
        } else if (record.status === 'absent' || record.status === 'absence') {
            if (record.excused) {
                dateGroups[record.date].excusedAbsent++;
            } else {
                dateGroups[record.date].absent++;
            }
        } else if (record.status === 'late' || record.status === 'retard') {
            if (record.excused) {
                dateGroups[record.date].excusedLate++;
            } else {
                dateGroups[record.date].late++;
            }
        }
    });
    
    const stats = {
        totalRecords: totalRecords,
        presentCount: presentCount,
        unexcusedAbsences: unexcusedAbsences,
        excusedAbsences: excusedAbsences,
        totalAbsences: totalAbsences,
        unexcusedLates: unexcusedLates,
        excusedLates: excusedLates,
        totalLates: totalLates,
        averageRate: averageRate,
        excusedRate: excusedRate,
        topAbsentees: topAbsentees,
        perfectAttendanceCount: perfectAttendanceSwimmers.length,
        perfectAttendanceSwimmers: perfectAttendanceSwimmers,
        averageSessionsPerWeek: averageSessionsPerWeek,
        detailedSwimmerStats: detailedSwimmerStats,
        swimmersWithData: swimmers.filter(s => s.attendanceData && s.attendanceData.length > 0).length,
        engagementRate: engagementRate,
        regularityScore: regularityScore,
        dateGroups: dateGroups,
        allDates: Array.from(uniqueDates).sort()
    };
    
    return stats;
}

// Fonction pour créer les graphiques de présence
function createAttendanceCharts(attendanceStats) {
    // Attendre que les canvas soient dans le DOM
    setTimeout(() => {
        // Graphique de répartition (Pie/Doughnut Chart)
        const distributionCanvas = document.getElementById('attendanceDistributionChart');
        if (distributionCanvas) {
            const ctx = distributionCanvas.getContext('2d');
            
            // Détruire le graphique existant s'il existe
            if (window.attendanceDistributionChart) {
                window.attendanceDistributionChart.destroy();
            }
            
            window.attendanceDistributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['✅ Présents', '❌ Absents', '📝 Abs. Justifiés', '⏰ Retards', '⏰ Ret. Justifiés'],
                    datasets: [{
                        data: [
                            attendanceStats.presentCount,
                            attendanceStats.unexcusedAbsences,
                            attendanceStats.excusedAbsences,
                            attendanceStats.unexcusedLates,
                            attendanceStats.excusedLates
                        ],
                        backgroundColor: [
                            '#4caf50',
                            '#f44336',
                            '#9c27b0',
                            '#ff9800',
                            '#2196f3'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12,
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Graphique d'évolution temporelle (Line Chart)
        const trendCanvas = document.getElementById('attendanceTrendChart');
        if (trendCanvas && attendanceStats.dateGroups) {
            const ctx = trendCanvas.getContext('2d');
            
            // Détruire le graphique existant s'il existe
            if (window.attendanceTrendChart) {
                window.attendanceTrendChart.destroy();
            }
            
            const sortedDates = attendanceStats.allDates || [];
            const presentData = sortedDates.map(date => attendanceStats.dateGroups[date]?.present || 0);
            const absentData = sortedDates.map(date => 
                (attendanceStats.dateGroups[date]?.absent || 0) + 
                (attendanceStats.dateGroups[date]?.excusedAbsent || 0)
            );
            const lateData = sortedDates.map(date => 
                (attendanceStats.dateGroups[date]?.late || 0) + 
                (attendanceStats.dateGroups[date]?.excusedLate || 0)
            );
            
            // Formater les dates pour l'affichage
            const formattedDates = sortedDates.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
            });
            
            window.attendanceTrendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: formattedDates,
                    datasets: [
                        {
                            label: '✅ Présents',
                            data: presentData,
                            borderColor: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        },
                        {
                            label: '❌ Absents',
                            data: absentData,
                            borderColor: '#f44336',
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        },
                        {
                            label: '⏰ Retards',
                            data: lateData,
                            borderColor: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12,
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                }
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            },
                            title: {
                                display: true,
                                text: 'Nombre de nageurs',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });
        }
    }, 100);
}

// Fonction pour exporter les données de présence en PDF
function exportAttendanceToPDF() {
    const swimmers = getTeamSwimmers();
    const attendanceStats = calculateTeamAttendanceStats(swimmers);
    
    if (attendanceStats.totalRecords === 0) {
        alert('⚠️ Aucune donnée de présence à exporter.');
        return;
    }
    
    // Créer le contenu HTML pour le PDF
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Rapport de Présence - ${currentTeam?.name || 'Équipe'}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 40px;
                    color: #333;
                }
                h1 {
                    color: #27ae60;
                    text-align: center;
                    margin-bottom: 10px;
                }
                .subtitle {
                    text-align: center;
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    border: 2px solid #e0e0e0;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                }
                .stat-value {
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .stat-label {
                    font-size: 14px;
                    color: #666;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th {
                    background: #27ae60;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #e0e0e0;
                }
                tr:nth-child(even) {
                    background: #f9f9f9;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <h1>📊 Rapport de Présence & Assiduité</h1>
            <div class="subtitle">
                ${currentTeam?.name || 'Équipe'} | Généré le ${new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </div>
            
            <h2>📈 Statistiques Globales</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color: #4caf50;">${attendanceStats.presentCount}</div>
                    <div class="stat-label">✅ Présents</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #f44336;">${attendanceStats.unexcusedAbsences}</div>
                    <div class="stat-label">❌ Absents</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #9c27b0;">${attendanceStats.excusedAbsences}</div>
                    <div class="stat-label">📝 Abs. Justifiés</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #ff9800;">${attendanceStats.unexcusedLates}</div>
                    <div class="stat-label">⏰ Retards</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #2196f3;">${attendanceStats.excusedLates}</div>
                    <div class="stat-label">⏰ Ret. Justifiés</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #27ae60;">${attendanceStats.averageRate}%</div>
                    <div class="stat-label">📊 Taux Global</div>
                </div>
            </div>
            
            <h2>👥 Détails par Nageur</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nageur</th>
                        <th>Présents</th>
                        <th>Absents</th>
                        <th>Abs. Just.</th>
                        <th>Retards</th>
                        <th>Ret. Just.</th>
                        <th>Total</th>
                        <th>Taux</th>
                    </tr>
                </thead>
                <tbody>
                    ${attendanceStats.detailedSwimmerStats.map(stat => `
                        <tr>
                            <td><strong>${stat.name}</strong></td>
                            <td>${stat.presences}</td>
                            <td>${stat.absences}</td>
                            <td>${stat.excusedAbsences}</td>
                            <td>${stat.lates}</td>
                            <td>${stat.excusedLates}</td>
                            <td>${stat.total}</td>
                            <td><strong>${stat.rate}%</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                Document généré automatiquement par l'application Suivi Nageurs<br>
                © ${new Date().getFullYear()} - Tous droits réservés
            </div>
        </body>
        </html>
    `;
    
    // Ouvrir dans une nouvelle fenêtre pour imprimer/sauvegarder en PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis lancer l'impression
    setTimeout(() => {
        printWindow.print();
    }, 500);
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
    // Si c'est la présence, afficher directement le nouveau formulaire
    if (type === 'attendance') {
        return renderAttendanceForm(swimmers);
    }
    
    const typeConfig = {
        wellbeing: { icon: '😊', title: 'Bien-être', color: '#ff6b35' },
        training: { icon: '🏊', title: 'Entraînement', color: '#4facfe' },
        performance: { icon: '💪', title: 'Performance', color: '#8e44ad' },
        medical: { icon: '🏥', title: 'Médical', color: '#e91e63' },
        race: { icon: '🏅', title: 'Compétition', color: '#f39c12' },
        technical: { icon: '📋', title: 'Technique', color: '#00bcd4' }
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

// ============================================
// FORMULAIRE DE PRÉSENCE MODERNE
// ============================================

function renderAttendanceForm(swimmers) {
    const today = new Date().toISOString().split('T')[0];
    
    // Récupérer la dernière date enregistrée pour charger les données
    const lastAttendanceDate = getLastAttendanceDate(swimmers);
    const dateToUse = lastAttendanceDate || today;
    
    // Initialiser le statut de chaque nageur
    if (!window.attendanceStatuses) {
        window.attendanceStatuses = {};
    }
    
    // Charger les données existantes pour la dernière date
    loadAttendanceForDate(swimmers, dateToUse);
    
    // Conserver la date sélectionnée globalement
    window.currentAttendanceDate = dateToUse;
    
    return `
        <div style="margin-bottom: 20px;">
            <button onclick="showCollectiveDataEntry()" class="btn btn-outline">
                <i class="fas fa-arrow-left"></i> Retour
            </button>
        </div>
        
        <h4 style="margin: 25px 0; color: #333; text-align: center;">
            <span style="font-size: 2rem;">✅</span> Feuille de Présence
        </h4>
        
        <!-- Calendrier en haut -->
        <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: white; box-shadow: 0 4px 15px rgba(39,174,96,0.3);">
            <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 1.1rem;">
                <i class="fas fa-calendar-alt"></i> Sélectionner la Date
            </label>
            <input type="date" id="attendanceDate" value="${dateToUse}" style="width: 100%; padding: 12px 15px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.95); font-size: 1.1rem; color: #333; font-weight: 500;" onchange="loadAttendanceForSelectedDate()">
            <div id="attendanceDateDisplay" style="margin-top: 10px; font-size: 1.05rem; opacity: 0.9; text-align: center;">
                ${new Date(dateToUse).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
        
        <!-- Info box -->
        <div style="background: ${lastAttendanceDate ? '#e3f2fd' : '#fff3cd'}; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${lastAttendanceDate ? '#2196f3' : '#ffc107'};">
            <p style="margin: 0; color: ${lastAttendanceDate ? '#1976d2' : '#856404'}; font-weight: 500;">
                <i class="fas fa-${lastAttendanceDate ? 'history' : 'exclamation-triangle'}"></i> 
                ${lastAttendanceDate ? `<strong>Historique chargé:</strong> Données du ${new Date(lastAttendanceDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}. Modifiez si nécessaire.` : '<strong>Nouvelle date:</strong> Tous les nageurs sont définis comme "Absent" par défaut. Modifiez les statuts et enregistrez.'}
            </p>
        </div>
        
        <!-- Compteurs en haut -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 25px;">
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(76,175,80,0.3);">
                <div style="font-size: 2rem; font-weight: bold;" id="presentCount">0</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">✅ Présents</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f44336 0%, #e57373 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(244,67,54,0.3);">
                <div style="font-size: 2rem; font-weight: bold;" id="absentCount">0</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">❌ Absents</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(156,39,176,0.3);">
                <div style="font-size: 2rem; font-weight: bold;" id="absentExcusedCount">0</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">📝 Abs. Justifiés</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(255,152,0,0.3);">
                <div style="font-size: 2rem; font-weight: bold;" id="lateCount">0</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">⏰ Retards</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(33,150,243,0.3);">
                <div style="font-size: 2rem; font-weight: bold;" id="lateExcusedCount">0</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">⏰ Ret. Justifiés</div>
            </div>
        </div>
        
        <!-- Liste des nageurs avec boutons de statut -->
        <div style="max-height: 50vh; overflow-y: auto; border: 2px solid #e0e0e0; border-radius: 12px; padding: 15px; background: #fafafa;">
            ${swimmers.map((swimmer, index) => `
                <div class="attendance-swimmer-card" data-swimmer-id="${swimmer.id}" style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: all 0.3s;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                        <div style="flex: 1; min-width: 200px;">
                            <div style="font-weight: 600; color: #333; font-size: 1.1rem; margin-bottom: 5px;">
                                <span style="display: inline-block; width: 30px; height: 30px; background: #27ae60; color: white; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-size: 0.9rem;">${index + 1}</span>
                                ${swimmer.name || 'Nageur ' + (index + 1)}
                            </div>
                            <div style="font-size: 0.85rem; color: #666; margin-left: 40px;">
                                <i class="fas fa-user"></i> ${swimmer.username || 'N/A'}
                            </div>
                        </div>
                        
                        <div class="attendance-status-buttons" style="display:flex; gap:8px; align-items:center;">
                            <!-- Single-cycle status button: cycles through statuses on each click -->
                            <button onclick="cycleAttendanceStatus('${swimmer.id}')"
                                    class="attendance-status-btn attendance-status-single ${window.attendanceStatuses[swimmer.id] || 'absent'}"
                                    data-status="${window.attendanceStatuses[swimmer.id] || 'absent'}"
                                    style="padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 0.95rem; min-width:160px; transition: all 0.18s;">
                                ${getStatusLabel(window.attendanceStatuses[swimmer.id] || 'absent')}
                            </button>
                            <button onclick="openSwimmerHistory('${swimmer.id}')" title="Visualiser l'historique" style="padding: 8px 10px; border-radius:8px; border:1px solid #e0e0e0; background:white; cursor:pointer; font-size:0.9rem; color:#333;">
                                <i class="fas fa-history"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!-- Boutons en bas -->
        <div style="margin-top: 30px; padding-top: 25px; border-top: 3px solid #e0e0e0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;" id="attendanceButtonsContainer">
            <!-- Bouton Annuler en mode modification (caché par défaut) -->
            <button onclick="cancelAttendanceEdit()" class="btn" id="cancelEditBtn" style="display:none; flex: 1; min-width: 200px; max-width: 250px; padding: 15px; font-size: 1.05rem; background: white; color: #e53935; border: 2px solid #e53935; border-radius: 8px; cursor: pointer; transition: all 0.3s; font-weight: 600;" onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='white'">
                <i class="fas fa-times-circle"></i> Annuler Modification
            </button>
            <button onclick="openAttendanceCalendarForEdit()" class="btn" id="editDateBtn" style="flex: 1; min-width: 200px; max-width: 250px; padding: 15px; font-size: 1.05rem; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 3px 10px rgba(255,152,0,0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <i class="fas fa-edit"></i> Modifier une Date
            </button>
            <button onclick="saveAttendanceData()" class="btn btn-primary" id="saveAttendanceBtn" style="flex: 2; min-width: 280px; max-width: 450px; padding: 15px; font-size: 1.1rem; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 3px 10px rgba(39,174,96,0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <i class="fas fa-save"></i> Enregistrer la Présence (${swimmers.length} nageurs)
            </button>
        </div>
        
        <script>
            // Initialiser les compteurs
            updateAttendanceCounts();
        </script>
    `;
}

function updateAttendanceDateDisplay() {
    const dateInput = document.getElementById('attendanceDate');
    const display = document.getElementById('attendanceDateDisplay');
    if (dateInput && display) {
        const date = new Date(dateInput.value);
        display.textContent = date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Fonction pour obtenir la dernière date avec des données de présence
function getLastAttendanceDate(swimmers) {
    let lastDate = null;
    let maxTimestamp = 0;
    
    swimmers.forEach(swimmer => {
        if (swimmer.attendanceData && Array.isArray(swimmer.attendanceData)) {
            swimmer.attendanceData.forEach(record => {
                const timestamp = new Date(record.timestamp || record.date).getTime();
                if (timestamp > maxTimestamp) {
                    maxTimestamp = timestamp;
                    lastDate = record.date;
                }
            });
        }
    });
    
    return lastDate;
}

// Fonction pour charger les données de présence pour une date spécifique
function loadAttendanceForDate(swimmers, date) {
    if (!window.attendanceStatuses) {
        window.attendanceStatuses = {};
    }
    
    const allSwimmers = getAllSwimmers();
    
    // Vérifier si cette date a déjà des données enregistrées
    const dateHasData = allSwimmers.some(swimmer => 
        swimmer.attendanceData && 
        swimmer.attendanceData.some(record => record.date === date)
    );
    
    swimmers.forEach(swimmer => {
        const fullSwimmer = allSwimmers.find(s => s.id === swimmer.id);
        
        if (fullSwimmer && fullSwimmer.attendanceData) {
            const dateRecord = fullSwimmer.attendanceData.find(record => record.date === date);
            
            if (dateRecord) {
                // Reconstruire le statut complet depuis l'historique
                let status = dateRecord.status;
                if (dateRecord.excused) {
                    if (status === 'absent') {
                        status = 'absent_excused';
                    } else if (status === 'late') {
                        status = 'late_excused';
                    }
                }
                window.attendanceStatuses[swimmer.id] = status;
            } else {
                // Date existe pour d'autres nageurs mais pas celui-ci -> Absent par défaut
                window.attendanceStatuses[swimmer.id] = 'absent';
            }
        } else {
            // Pas de données du tout -> Absent par défaut (nouvelle date)
            window.attendanceStatuses[swimmer.id] = 'absent';
        }
    });
}

// Fonction appelée quand on change la date dans le formulaire
function loadAttendanceForSelectedDate() {
    const dateInput = document.getElementById('attendanceDate');
    if (!dateInput) return;
    
    const selectedDate = dateInput.value;
    const swimmers = getTeamSwimmers();
    
    // Charger les données pour la nouvelle date
    loadAttendanceForDate(swimmers, selectedDate);
    
    // Mettre à jour l'affichage de la date
    updateAttendanceDateDisplay();
    
    // Regénérer le formulaire avec les nouvelles données
    const content = document.getElementById('collectiveDataContent');
    content.innerHTML = renderAttendanceForm(swimmers);
}

// Fonction pour ouvrir le calendrier et modifier une date existante
function openAttendanceCalendarForEdit() {
    const swimmers = getTeamSwimmers();
    const allDates = new Set();
    
    // Collecter toutes les dates disponibles
    swimmers.forEach(swimmer => {
        if (swimmer.attendanceData && Array.isArray(swimmer.attendanceData)) {
            swimmer.attendanceData.forEach(record => {
                allDates.add(record.date);
            });
        }
    });
    
    // Créer un calendrier visuel avec mois/année actuel
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Créer le HTML du calendrier avec grille visuelle
    const calendarHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; max-height: 85vh; overflow-y: auto;">
            <h3 style="margin: 0 0 20px 0; color: #333; display: flex; align-items: center; justify-content: space-between;">
                <span><i class="fas fa-calendar-alt"></i> Sélectionner une date</span>
                <span style="font-size: 1.1rem; font-weight: 600;" id="calendarMonthYear">Décembre 2025</span>
            </h3>
            <p style="color: #666; margin-bottom: 20px; font-size: 0.95rem;">
                Cliquez sur une date pour saisir la présence. Un formulaire vide s'affichera.
            </p>
            
            <!-- Calendrier Visuel -->
            <div style="margin-bottom: 20px;">
                <!-- Jours de la semaine -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 10px;">
                    <div style="text-align: center; font-weight: 600; color: #667eea; font-size: 0.85rem;">Lun</div>
                    <div style="text-align: center; font-weight: 600; color: #667eea; font-size: 0.85rem;">Mar</div>
                    <div style="text-align: center; font-weight: 600; color: #667eea; font-size: 0.85rem;">Mer</div>
                    <div style="text-align: center; font-weight: 600; color: #667eea; font-size: 0.85rem;">Jeu</div>
                    <div style="text-align: center; font-weight: 600; color: #667eea; font-size: 0.85rem;">Ven</div>
                    <div style="text-align: center; font-weight: 600; color: #ff9800; font-size: 0.85rem;">Sam</div>
                    <div style="text-align: center; font-weight: 600; color: #ff9800; font-size: 0.85rem;">Dim</div>
                </div>
                
                <!-- Grille des jours -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;" id="calendarDaysGrid">
                </div>
            </div>
            
            <button onclick="closeModal()" style="width: 100%; padding: 15px; background: #e0e0e0; color: #666; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; margin-top: 10px;">
                <i class="fas fa-times"></i> Annuler
            </button>
        </div>
    `;
    
    // Afficher dans une modal
    showModal(calendarHTML);
    
    // Générer la grille du calendrier
    setTimeout(() => {
        generateCalendarGrid(currentYear, currentMonth, allDates);
    }, 100);
}

// Fonction pour générer la grille du calendrier
function generateCalendarGrid(year, month, existingDates) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
    
    const grid = document.getElementById('calendarDaysGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Ajouter des cases vides avant le premier jour
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        grid.appendChild(emptyDay);
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasData = existingDates.has(dateString);
        
        // Vérifier si c'est aujourd'hui
        const today = new Date();
        const isToday = day === today.getDate() && 
                       month === today.getMonth() && 
                       year === today.getFullYear();
        
        const dayBtn = document.createElement('button');
        dayBtn.textContent = day;
        dayBtn.onclick = () => createNewAttendanceForDate(dateString);
        dayBtn.style.cssText = `
            padding: 12px 8px;
            border-radius: 8px;
            border: 2px solid ${isToday ? '#27ae60' : hasData ? '#667eea' : '#e0e0e0'};
            background: ${isToday ? '#d4edda' : hasData ? '#e8eaf6' : 'white'};
            color: #333;
            font-weight: ${isToday || hasData ? '600' : '400'};
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
        `;
        
        dayBtn.onmouseover = function() {
            this.style.background = '#f0f0f0';
            this.style.transform = 'scale(1.1)';
        };
        dayBtn.onmouseout = function() {
            this.style.background = isToday ? '#d4edda' : hasData ? '#e8eaf6' : 'white';
            this.style.transform = 'scale(1)';
        };
        
        grid.appendChild(dayBtn);
    }
}

// Fonction pour créer une nouvelle saisie pour une date spécifique
function createNewAttendanceForDate(date) {
    const swimmers = getTeamSwimmers();
    
    // Réinitialiser à zéro
    window.attendanceStatuses = {};
    swimmers.forEach(swimmer => {
        window.attendanceStatuses[swimmer.id] = 'absent';
    });
    
    // Mettre à jour la date dans le formulaire
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.value = date;
        updateAttendanceDateDisplay();
    }
    
    // Activer le mode nouvelle saisie (pas modification)
    window.attendanceEditMode = null;
    window.attendanceEditDate = null;
    
    // Regénérer le formulaire
    const content = document.getElementById('collectiveDataContent');
    content.innerHTML = renderAttendanceForm(swimmers);
    
    // Mettre à jour l'UI des boutons
    setTimeout(() => {
        updateEditModeUI();
    }, 50);
    
    // Fermer la modal
    closeModal();
    
    // Message de confirmation
    setTimeout(() => {
        const infoBox = document.querySelector('#collectiveDataContent [style*="background: #e3f2fd"]');
        if (infoBox) {
            infoBox.style.background = '#e8f5e9';
            infoBox.style.borderLeft = '4px solid #27ae60';
            infoBox.innerHTML = `
                <i class="fas fa-plus-circle" style="color: #27ae60; margin-right: 10px;"></i>
                <span style="color: #1b5e20; font-weight: 500;">
                    <strong>Nouvelle saisie:</strong> Formulaire vierge pour le ${new Date(date).toLocaleDateString('fr-FR')}. Sélectionnez les statuts et enregistrez.
                </span>
            `;
        }
    }, 100);
}

// Fonction pour annuler la modification et revenir à nouveau formulaire
function cancelAttendanceEdit() {
    if (!confirm('Voulez-vous abandonner les modifications en cours ?')) {
        return;
    }
    
    // Réinitialiser le mode modification
    window.attendanceEditMode = null;
    window.attendanceEditDate = null;
    
    // Réinitialiser le formulaire pour une nouvelle saisie
    const swimmers = getTeamSwimmers();
    window.attendanceStatuses = {};
    swimmers.forEach(swimmer => {
        window.attendanceStatuses[swimmer.id] = 'absent';
    });
    
    // Réinitialiser la date du jour
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        updateAttendanceDateDisplay();
    }
    
    // Mettre à jour l'interface
    updateEditModeUI();
    
    // Regénérer le formulaire
    const content = document.getElementById('collectiveDataContent');
    content.innerHTML = renderAttendanceForm(swimmers);
    
    alert('✅ Modification annulée. Vous êtes en mode nouvelle saisie.');
}

// Mettre à jour l'affichage selon le mode (modification ou saisie)
function updateEditModeUI() {
    const cancelBtn = document.getElementById('cancelEditBtn');
    const editBtn = document.getElementById('editDateBtn');
    const saveBtn = document.getElementById('saveAttendanceBtn');
    
    if (window.attendanceEditMode === 'edit' && window.attendanceEditDate) {
        // Mode modification
        if (cancelBtn) cancelBtn.style.display = 'block';
        if (editBtn) editBtn.style.display = 'none';
        if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-check-circle"></i> Enregistrer les Modifications pour ${new Date(window.attendanceEditDate).toLocaleDateString('fr-FR')}`;
    } else {
        // Mode nouvelle saisie
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (editBtn) editBtn.style.display = 'block';
        const swimmers = getTeamSwimmers();
        if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-save"></i> Enregistrer la Présence (${swimmers.length} nageurs)`;
    }
}

function setAttendanceStatus(swimmerId, status) {
    // Mettre à jour le statut
    window.attendanceStatuses[swimmerId] = status;
    
    // Mettre à jour l'interface - tous les boutons de ce nageur
    const card = document.querySelector(`.attendance-swimmer-card[data-swimmer-id="${swimmerId}"]`);
    if (card) {
        const buttons = card.querySelectorAll('.attendance-status-btn');
        // If there are multiple status buttons (legacy), update them.
        if (buttons.length > 1) {
            buttons.forEach(btn => {
                const btnStatus = btn.dataset.status;
                const isActive = btnStatus === status;
                btn.classList.toggle('active', isActive);

                const colors = getStatusColors(btnStatus);
                if (colors) {
                    if (isActive) {
                        btn.style.background = colors.bg;
                        btn.style.color = colors.text;
                        btn.style.transform = 'scale(1.05)';
                        btn.style.boxShadow = `0 4px 12px ${colors.bg}66`;
                    } else {
                        btn.style.background = colors.bgInactive;
                        btn.style.color = colors.textInactive;
                        btn.style.transform = 'scale(1)';
                        btn.style.boxShadow = 'none';
                    }
                }
            });
        } else if (buttons.length === 1) {
            // Single-button mode: update the single button label, data and style
            const btn = buttons[0];
            btn.dataset.status = status;
            btn.innerHTML = getStatusLabel(status);
            btn.className = 'attendance-status-btn attendance-status-single ' + status;

            const colors = getStatusColors(status);
            if (colors) {
                btn.style.background = colors.bg;
                btn.style.color = colors.text;
                btn.style.border = `2px solid ${colors.border}`;
                btn.style.boxShadow = `0 6px 14px ${colors.bg}44`;
            }
        }
    }
    
    // Mettre à jour les compteurs
    updateAttendanceCounts();
}

function updateAttendanceCounts() {
    const statuses = window.attendanceStatuses || {};
    const counts = {
        present: 0,
        absent: 0,
        absent_excused: 0,
        late: 0,
        late_excused: 0
    };
    
    Object.values(statuses).forEach(status => {
        if (counts.hasOwnProperty(status)) {
            counts[status]++;
        }
    });
    
    // Mettre à jour l'affichage
    const presentEl = document.getElementById('presentCount');
    const absentEl = document.getElementById('absentCount');
    const absentExcusedEl = document.getElementById('absentExcusedCount');
    const lateEl = document.getElementById('lateCount');
    const lateExcusedEl = document.getElementById('lateExcusedCount');
    
    if (presentEl) presentEl.textContent = counts.present;
    if (absentEl) absentEl.textContent = counts.absent;
    if (absentExcusedEl) absentExcusedEl.textContent = counts.absent_excused;
    if (lateEl) lateEl.textContent = counts.late;
    if (lateExcusedEl) lateExcusedEl.textContent = counts.late_excused;
}

// Retourne le label affiché pour un statut
function getStatusLabel(status) {
    const labels = {
        present: '✅ Présent',
        absent: '❌ Absent',
        absent_excused: '📝 Absent Justifié',
        late: '⏰ Retard',
        late_excused: '⏰ Retard Justifié'
    };
    return labels[status] || '❓ Inconnu';
}

// Couleurs et styles par statut
function getStatusColors(status) {
    const map = {
        present: { border: '#4caf50', bg: '#4caf50', text: 'white', bgInactive: 'white', textInactive: '#4caf50' },
        absent: { border: '#f44336', bg: '#f44336', text: 'white', bgInactive: 'white', textInactive: '#f44336' },
        absent_excused: { border: '#9c27b0', bg: '#9c27b0', text: 'white', bgInactive: 'white', textInactive: '#9c27b0' },
        late: { border: '#ff9800', bg: '#ff9800', text: 'white', bgInactive: 'white', textInactive: '#ff9800' },
        late_excused: { border: '#2196f3', bg: '#2196f3', text: 'white', bgInactive: 'white', textInactive: '#2196f3' }
    };
    return map[status];
}

// Cycle le statut d'un nageur (single-button mode)
function cycleAttendanceStatus(swimmerId) {
    if (!window.attendanceStatuses) window.attendanceStatuses = {};
    const order = ['present', 'absent', 'absent_excused', 'late', 'late_excused'];
    const current = window.attendanceStatuses[swimmerId] || 'absent';
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    setAttendanceStatus(swimmerId, next);
    // Save change in state
    window.attendanceStatuses[swimmerId] = next;
    updateAttendanceCounts();
}

// Ouvrir la modal d'historique pour un nageur
function openSwimmerHistory(swimmerId) {
    const swimmers = getAllSwimmers();
    const swimmer = swimmers.find(s => s.id === swimmerId);
    if (!swimmer) {
        alert('Nageur introuvable');
        return;
    }

    const entries = (swimmer.attendanceData || []).slice().sort((a,b) => new Date(b.date) - new Date(a.date));
    const rows = entries.map(e => `
        <tr>
            <td style="padding:8px 12px">${new Date(e.date).toLocaleDateString('fr-FR')}</td>
            <td style="padding:8px 12px">${getStatusLabel(e.excused ? (e.status === 'absent' ? 'absent_excused' : (e.status === 'late' ? 'late_excused' : e.status)) : e.status)}</td>
            <td style="padding:8px 12px">${e.timestamp ? new Date(e.timestamp).toLocaleString('fr-FR') : ''}</td>
        </tr>`).join('');

    const content = `
        <div style="background:white; padding:20px; max-width:700px; border-radius:10px;">
            <h3 style="margin:0 0 10px 0">Historique - ${swimmer.name}</h3>
            <p style="color:#666; margin:0 0 10px 0">${entries.length} enregistrement(s)</p>
            <div style="max-height: 60vh; overflow-y:auto; margin-top:10px;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f3f3f3; text-align:left;">
                            <th style="padding:10px;">Date</th>
                            <th style="padding:10px;">Statut</th>
                            <th style="padding:10px;">Horodatage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="3" style="padding:12px; color:#666">Aucun enregistrement</td></tr>'}
                    </tbody>
                </table>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:14px;">
                <button onclick="closeModal()" style="padding:10px 14px; border-radius:8px; border:none; background:#e0e0e0; color:#333">Fermer</button>
            </div>
        </div>
    `;

    if (typeof showModal === 'function') {
        showModal(content);
    } else {
        // fallback: open in a new window
        const w = window.open('', '_blank');
        w.document.write(content);
    }
}

// Affiche une modal avec le contenu HTML
function showModal(htmlContent) {
    let modalDiv = document.getElementById('customModal');
    if (!modalDiv) {
        modalDiv = document.createElement('div');
        modalDiv.id = 'customModal';
        document.body.appendChild(modalDiv);
    }
    modalDiv.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;">
            <div style="position:relative; background:white; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.2); max-width:90vw; max-height:90vh; overflow:auto;">
                ${htmlContent}
            </div>
        </div>
    `;
    modalDiv.style.display = 'block';
}

// Ferme la modal
function closeModal() {
    const modalDiv = document.getElementById('customModal');
    if (modalDiv) {
        modalDiv.style.display = 'none';
    }
}

// Fonction pour charger les données existantes et les modifier
function loadExistingAttendanceForEdit() {
    const dateInput = document.getElementById('attendanceDate');
    if (!dateInput || !dateInput.value) {
        alert('⚠️ Veuillez sélectionner une date pour charger les données existantes');
        return;
    }
    
    const selectedDate = dateInput.value;
    const swimmers = getAllSwimmers();
    const teamSwimmers = getTeamSwimmers();
    
    // Réinitialiser les statuts
    window.attendanceStatuses = {};
    
    let foundData = 0;
    
    // Charger les données existantes pour cette date
    teamSwimmers.forEach(swimmer => {
        const fullSwimmer = swimmers.find(s => s.id === swimmer.id);
        if (fullSwimmer && fullSwimmer.attendanceData) {
            const existingEntry = fullSwimmer.attendanceData.find(entry => entry.date === selectedDate);
            
            if (existingEntry) {
                // Reconstruire le statut complet (avec late_excused ou absent_excused)
                let status = existingEntry.status;
                if (existingEntry.status === 'late' && existingEntry.excused) {
                    status = 'late_excused';
                } else if (existingEntry.status === 'absent' && existingEntry.excused) {
                    status = 'absent_excused';
                }
                
                window.attendanceStatuses[swimmer.id] = status;
                foundData++;
                
                // Mettre à jour visuellement le bouton
                setTimeout(() => {
                    const card = document.querySelector(`.attendance-swimmer-card[data-swimmer-id="${swimmer.id}"]`);
                    if (card) {
                        const buttons = card.querySelectorAll('.attendance-status-btn');
                        if (buttons.length > 1) {
                            // Legacy multi-button UI
                            buttons.forEach(btn => {
                                const btnStatus = btn.dataset.status;
                                const isActive = btnStatus === status;
                                btn.classList.toggle('active', isActive);
                                const colors = getStatusColors(btnStatus) || {};
                                btn.style.background = isActive ? (colors.bg || 'white') : (colors.bgInactive || 'white');
                                btn.style.color = isActive ? (colors.text || '#333') : (colors.textInactive || '#333');
                            });
                        } else if (buttons.length === 1) {
                            // Single-button mode
                            const btn = buttons[0];
                            btn.dataset.status = status;
                            btn.innerHTML = getStatusLabel(status);
                            btn.className = 'attendance-status-btn attendance-status-single ' + status;
                            const colors = getStatusColors(status) || {};
                            if (colors.bg) btn.style.background = colors.bg;
                            if (colors.text) btn.style.color = colors.text;
                            if (colors.border) btn.style.border = '2px solid ' + colors.border;
                        }
                    }
                }, 100);
            }
        }
    });
    
    // Mettre à jour les compteurs
    updateAttendanceCounters();
    
    if (foundData > 0) {
        alert(`✅ ${foundData} présence(s) chargée(s) pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')}.\n\nVous pouvez maintenant modifier les statuts et cliquer sur "Enregistrer" pour sauvegarder.`);
    } else {
        alert(`ℹ️ Aucune donnée trouvée pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')}.\n\nVous pouvez créer une nouvelle saisie de présence.`);
    }
}

function saveAttendanceData() {
    const dateInput = document.getElementById('attendanceDate');
    if (!dateInput || !dateInput.value) {
        alert('⚠️ Veuillez sélectionner une date');
        return;
    }
    
    const date = dateInput.value;
    const statuses = window.attendanceStatuses || {};
    
    if (Object.keys(statuses).length === 0) {
        alert('⚠️ Aucun statut défini');
        return;
    }
    
    let savedCount = 0;
    let swimmers = getAllSwimmers();
    
    Object.keys(statuses).forEach(swimmerId => {
        const status = statuses[swimmerId];
        const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
        
        if (swimmerIndex !== -1) {
            const swimmer = swimmers[swimmerIndex];
            
            // Initialiser attendanceData si nécessaire
            if (!swimmer.attendanceData) {
                swimmer.attendanceData = [];
            }
            
            // Vérifier si une entrée existe déjà pour cette date
            const existingIndex = swimmer.attendanceData.findIndex(entry => entry.date === date);
            
            // Préparer les données
            let attendanceEntry = {
                date: date,
                status: status,
                excused: false,
                timestamp: new Date().toISOString()
            };
            
            // Gérer les statuts avec justification
            if (status === 'late_excused') {
                attendanceEntry.status = 'late';
                attendanceEntry.excused = true;
            } else if (status === 'absent_excused') {
                attendanceEntry.status = 'absent';
                attendanceEntry.excused = true;
            }
            
            if (existingIndex !== -1) {
                // Mettre à jour l'entrée existante
                swimmer.attendanceData[existingIndex] = attendanceEntry;
            } else {
                // Ajouter une nouvelle entrée
                swimmer.attendanceData.push(attendanceEntry);
            }
            
            swimmers[swimmerIndex] = swimmer;
            savedCount++;
        }
    });
    
    // Sauvegarder dans localStorage
    localStorage.setItem('swimmers', JSON.stringify(swimmers));
    
    // Déterminer le message selon le mode
    const isEditMode = window.attendanceEditMode === 'edit';
    const dateStr = new Date(date).toLocaleDateString('fr-FR');
    const modeMsg = isEditMode ? 'modifiées' : 'enregistrées';
    
    alert(`✅ Présence ${modeMsg} avec succès pour ${savedCount} nageur(s) le ${dateStr}`);
    
    // Réinitialiser le mode modification après sauvegarde
    if (isEditMode) {
        window.attendanceEditMode = null;
        window.attendanceEditDate = null;
    }
    
    // Mettre à jour l'UI des boutons après sauvegarde
    setTimeout(() => {
        updateEditModeUI();
    }, 100);
    
    // Rafraîchir automatiquement l'affichage si la vue détaillée est ouverte
    const detailedView = document.getElementById('attendanceDetailedView');
    if (detailedView && detailedView.style.display !== 'none') {
        // Rafraîchir les statistiques dans la vue détaillée
        refreshAttendanceStats();
    }
    
    // Réinitialiser et fermer
    window.attendanceStatuses = {};
    closeCollectiveDataModal();
    
    // Recharger la section Présence & Assiduité sur l'aperçu global
    if (currentTeam) {
        const attendanceSection = document.getElementById('attendanceSection');
        if (attendanceSection) {
            // Toujours recharger la section pour mettre à jour les statistiques
            loadAttendanceSection(getTeamSwimmers());
            
            console.log('✅ Section Présence & Assiduité rechargée avec les nouvelles données');
        }
    }
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
// CALENDRIER ÉQUIPE
// ============================================

function showTeamCalendar() {
    if (!currentTeam) {
        alert('Veuillez sélectionner une équipe d\'abord');
        return;
    }
    
    const modal = document.getElementById('teamCalendarModal');
    const content = document.getElementById('teamCalendarContent');
    
    renderTeamCalendar(content);
    modal.style.display = 'flex';
}

function closeTeamCalendar() {
    document.getElementById('teamCalendarModal').style.display = 'none';
}

function renderTeamCalendar(container) {
    const swimmers = getTeamSwimmers();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Obtenir toutes les dates avec des données
    const datesWithData = getAllDatesWithData(swimmers);
    
    let html = `
        <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
            <div>
                <button onclick="changeCalendarMonth(-1)" class="btn btn-outline" style="padding: 8px 16px;">
                    <i class="fas fa-chevron-left"></i> Mois Précédent
                </button>
                <button onclick="changeCalendarMonth(1)" class="btn btn-outline" style="padding: 8px 16px; margin-left: 10px;">
                    Mois Suivant <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <h3 style="margin: 0; color: #333;" id="calendarMonthYear">
                ${getMonthName(currentMonth)} ${currentYear}
            </h3>
            <button onclick="goToToday()" class="btn btn-primary" style="padding: 8px 16px;">
                <i class="fas fa-calendar-day"></i> Aujourd'hui
            </button>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #4caf50; border-radius: 4px;"></div>
                    <span style="color: #333; font-size: 0.9rem;">Jour avec données</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #2196f3; border: 3px solid #1976d2; border-radius: 4px;"></div>
                    <span style="color: #333; font-size: 0.9rem;">Aujourd'hui</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #666; font-size: 0.9rem;">📊 ${datesWithData.size} jour(s) avec données</span>
                </div>
            </div>
        </div>
        
        <div id="calendarGrid">
            ${generateCalendarGrid(currentYear, currentMonth, datesWithData)}
        </div>
    `;
    
    container.innerHTML = html;
}

function generateCalendarGrid(year, month, datesWithData) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const today = new Date();
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #e0e0e0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <!-- En-têtes des jours -->
            ${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => `
                <div style="padding: 12px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; font-weight: 600; text-align: center; font-size: 0.9rem;">
                    ${day}
                </div>
            `).join('')}
            
            <!-- Jours vides avant le 1er du mois -->
            ${Array(startDayOfWeek).fill(0).map(() => `
                <div style="min-height: 100px; background: #f5f5f5;"></div>
            `).join('')}
            
            <!-- Jours du mois -->
            ${Array.from({length: daysInMonth}, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasData = datesWithData.has(dateStr);
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const dataCount = datesWithData.get(dateStr) || 0;
                
                return `
                    <div onclick="showDayData('${dateStr}')" style="
                        min-height: 100px;
                        padding: 10px;
                        background: ${hasData ? '#e8f5e9' : 'white'};
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border: ${isToday ? '3px solid #2196f3' : 'none'};
                        position: relative;
                    " onmouseover="this.style.background='#e3f2fd'" onmouseout="this.style.background='${hasData ? '#e8f5e9' : 'white'}'">
                        <div style="font-weight: ${isToday ? 'bold' : '500'}; color: ${isToday ? '#2196f3' : '#333'}; font-size: 1.2rem; margin-bottom: 5px;">
                            ${day}
                        </div>
                        ${hasData ? `
                            <div style="display: flex; align-items: center; gap: 5px; background: #4caf50; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-top: 5px;">
                                <i class="fas fa-database"></i>
                                <span>${dataCount}</span>
                            </div>
                        ` : ''}
                        ${isToday ? `<div style="position: absolute; top: 5px; right: 5px; background: #2196f3; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.65rem; font-weight: 600;">Aujourd'hui</div>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    return html;
}

function getAllDatesWithData(swimmers) {
    const datesMap = new Map(); // date -> count
    
    swimmers.forEach(swimmer => {
        // Bien-être
        if (swimmer.wellbeingData && Array.isArray(swimmer.wellbeingData)) {
            swimmer.wellbeingData.forEach(entry => {
                if (entry.date) {
                    const count = datesMap.get(entry.date) || 0;
                    datesMap.set(entry.date, count + 1);
                }
            });
        }
        
        // Entraînement
        if (swimmer.trainingData && Array.isArray(swimmer.trainingData)) {
            swimmer.trainingData.forEach(entry => {
                if (entry.date) {
                    const count = datesMap.get(entry.date) || 0;
                    datesMap.set(entry.date, count + 1);
                }
            });
        }
        
        // Performance
        if (swimmer.performanceData && Array.isArray(swimmer.performanceData)) {
            swimmer.performanceData.forEach(entry => {
                if (entry.date) {
                    const count = datesMap.get(entry.date) || 0;
                    datesMap.set(entry.date, count + 1);
                }
            });
        }
        
        // Médical
        if (swimmer.medicalData && Array.isArray(swimmer.medicalData)) {
            swimmer.medicalData.forEach(entry => {
                if (entry.date) {
                    const count = datesMap.get(entry.date) || 0;
                    datesMap.set(entry.date, count + 1);
                }
            });
        }
        
        // Compétition
        if (swimmer.raceData && Array.isArray(swimmer.raceData)) {
            swimmer.raceData.forEach(entry => {
                if (entry.date) {
                    const count = datesMap.get(entry.date) || 0;
                    datesMap.set(entry.date, count + 1);
                }
            });
        }
        
        // Technique
        if (swimmer.technicalData && Array.isArray(swimmer.technicalData)) {
            swimmer.technicalData.forEach(entry => {
                if (entry.date) {
                    const count = datesMap.get(entry.date) || 0;
                    datesMap.set(entry.date, count + 1);
                }
            });
        }
        
        // Assiduité
        if (swimmer.attendanceData && Array.isArray(swimmer.attendanceData)) {
            swimmer.attendanceData.forEach(entry => {
                if (entry.date) {
                    const count = datesMap.get(entry.date) || 0;
                    datesMap.set(entry.date, count + 1);
                }
            });
        }
    });
    
    return datesMap;
}

let currentCalendarYear = new Date().getFullYear();
let currentCalendarMonth = new Date().getMonth();

function changeCalendarMonth(delta) {
    currentCalendarMonth += delta;
    
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    } else if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    
    const swimmers = getTeamSwimmers();
    const datesWithData = getAllDatesWithData(swimmers);
    
    document.getElementById('calendarMonthYear').textContent = 
        `${getMonthName(currentCalendarMonth)} ${currentCalendarYear}`;
    
    document.getElementById('calendarGrid').innerHTML = 
        generateCalendarGrid(currentCalendarYear, currentCalendarMonth, datesWithData);
}

function goToToday() {
    const today = new Date();
    currentCalendarYear = today.getFullYear();
    currentCalendarMonth = today.getMonth();
    
    const swimmers = getTeamSwimmers();
    const datesWithData = getAllDatesWithData(swimmers);
    
    document.getElementById('calendarMonthYear').textContent = 
        `${getMonthName(currentCalendarMonth)} ${currentCalendarYear}`;
    
    document.getElementById('calendarGrid').innerHTML = 
        generateCalendarGrid(currentCalendarYear, currentCalendarMonth, datesWithData);
}

function getMonthName(monthIndex) {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[monthIndex];
}

function showDayData(dateStr) {
    const swimmers = getTeamSwimmers();
    const dayData = collectDayData(swimmers, dateStr);
    
    if (dayData.total === 0) {
        alert(`📅 Aucune donnée pour le ${new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`);
        return;
    }
    
    // Créer un modal pour afficher et modifier les données du jour
    showDayDataModal(dateStr, dayData);
}

function collectDayData(swimmers, dateStr) {
    const data = {
        wellbeing: [],
        training: [],
        performance: [],
        medical: [],
        race: [],
        technical: [],
        attendance: [],
        total: 0
    };
    
    swimmers.forEach(swimmer => {
        // Bien-être
        if (swimmer.wellbeingData && Array.isArray(swimmer.wellbeingData)) {
            swimmer.wellbeingData.forEach((entry, index) => {
                if (entry.date === dateStr) {
                    data.wellbeing.push({ ...entry, swimmerName: swimmer.name, swimmerId: swimmer.id, dataIndex: index });
                    data.total++;
                }
            });
        }
        
        // Entraînement
        if (swimmer.trainingData && Array.isArray(swimmer.trainingData)) {
            swimmer.trainingData.forEach((entry, index) => {
                if (entry.date === dateStr) {
                    data.training.push({ ...entry, swimmerName: swimmer.name, swimmerId: swimmer.id, dataIndex: index });
                    data.total++;
                }
            });
        }
        
        // Performance
        if (swimmer.performanceData && Array.isArray(swimmer.performanceData)) {
            swimmer.performanceData.forEach((entry, index) => {
                if (entry.date === dateStr) {
                    data.performance.push({ ...entry, swimmerName: swimmer.name, swimmerId: swimmer.id, dataIndex: index });
                    data.total++;
                }
            });
        }
        
        // Médical
        if (swimmer.medicalData && Array.isArray(swimmer.medicalData)) {
            swimmer.medicalData.forEach((entry, index) => {
                if (entry.date === dateStr) {
                    data.medical.push({ ...entry, swimmerName: swimmer.name, swimmerId: swimmer.id, dataIndex: index });
                    data.total++;
                }
            });
        }
        
        // Compétition
        if (swimmer.raceData && Array.isArray(swimmer.raceData)) {
            swimmer.raceData.forEach((entry, index) => {
                if (entry.date === dateStr) {
                    data.race.push({ ...entry, swimmerName: swimmer.name, swimmerId: swimmer.id, dataIndex: index });
                    data.total++;
                }
            });
        }
        
        // Technique
        if (swimmer.technicalData && Array.isArray(swimmer.technicalData)) {
            swimmer.technicalData.forEach((entry, index) => {
                if (entry.date === dateStr) {
                    data.technical.push({ ...entry, swimmerName: swimmer.name, swimmerId: swimmer.id, dataIndex: index });
                    data.total++;
                }
            });
        }
        
        // Assiduité
        if (swimmer.attendanceData && Array.isArray(swimmer.attendanceData)) {
            swimmer.attendanceData.forEach((entry, index) => {
                if (entry.date === dateStr) {
                    data.attendance.push({ ...entry, swimmerName: swimmer.name, swimmerId: swimmer.id, dataIndex: index });
                    data.total++;
                }
            });
        }
    });
    
    return data;
}

function showDayDataModal(dateStr, dayData) {
    const formattedDate = new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Créer un modal dynamique
    const modalHtml = `
        <div id="dayDataModal" class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <h3 style="margin: 0; color: white;">
                        <i class="fas fa-calendar-day"></i> Données du ${formattedDate}
                    </h3>
                    <button class="close-modal" onclick="closeDayDataModal()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    ${generateDayDataContent(dateStr, dayData)}
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le modal au body
    const existingModal = document.getElementById('dayDataModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeDayDataModal() {
    const modal = document.getElementById('dayDataModal');
    if (modal) {
        modal.remove();
    }
}

function generateDayDataContent(dateStr, dayData) {
    let html = `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <h4 style="margin: 0; color: #1976d2;">
                <i class="fas fa-database"></i> ${dayData.total} enregistrement(s) total
            </h4>
        </div>
    `;
    
    // Bien-être
    if (dayData.wellbeing.length > 0) {
        html += generateDataSection('Bien-être', '😊', '#ff6b35', dayData.wellbeing, 'wellbeing', dateStr);
    }
    
    // Entraînement
    if (dayData.training.length > 0) {
        html += generateDataSection('Entraînement', '🏊', '#4facfe', dayData.training, 'training', dateStr);
    }
    
    // Performance
    if (dayData.performance.length > 0) {
        html += generateDataSection('Performance', '💪', '#8e44ad', dayData.performance, 'performance', dateStr);
    }
    
    // Médical
    if (dayData.medical.length > 0) {
        html += generateDataSection('Médical', '🏥', '#e91e63', dayData.medical, 'medical', dateStr);
    }
    
    // Compétition
    if (dayData.race.length > 0) {
        html += generateDataSection('Compétition', '🏅', '#f39c12', dayData.race, 'race', dateStr);
    }
    
    // Technique
    if (dayData.technical.length > 0) {
        html += generateDataSection('Technique', '📋', '#00bcd4', dayData.technical, 'technical', dateStr);
    }
    
    // Assiduité
    if (dayData.attendance.length > 0) {
        html += generateDataSection('Présence', '✅', '#27ae60', dayData.attendance, 'attendance', dateStr);
    }
    
    return html;
}

function generateDataSection(title, icon, color, entries, dataType, dateStr) {
    let html = `
        <div style="margin-bottom: 30px; border-left: 4px solid ${color}; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
            <div style="background: ${color}; color: white; padding: 15px;">
                <h4 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <span>${title} (${entries.length})</span>
                </h4>
            </div>
            <div style="padding: 20px;">
    `;
    
    entries.forEach((entry, index) => {
        html += `
            <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: ${color}; font-size: 1.1rem;">
                        <i class="fas fa-user"></i> ${entry.swimmerName}
                    </strong>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="editDayEntry('${entry.swimmerId}', '${dataType}', ${entry.dataIndex}, '${dateStr}')" class="btn btn-sm" style="background: #2196f3; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer;">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button onclick="deleteDayEntry('${entry.swimmerId}', '${dataType}', ${entry.dataIndex}, '${dateStr}')" class="btn btn-sm" style="background: #f44336; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer;">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                <div style="background: #f5f5f5; padding: 10px; border-radius: 6px;">
                    ${formatEntryData(entry, dataType)}
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function formatEntryData(entry, dataType) {
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">';
    
    Object.keys(entry).forEach(key => {
        if (key !== 'swimmerName' && key !== 'swimmerId' && key !== 'dataIndex' && key !== 'date') {
            const value = entry[key];
            if (value !== null && value !== undefined && value !== '') {
                html += `
                    <div>
                        <div style="font-size: 0.85rem; color: #666; font-weight: 500;">${formatFieldName(key)}</div>
                        <div style="color: #333; font-weight: 600;">${value}</div>
                    </div>
                `;
            }
        }
    });
    
    html += '</div>';
    return html;
}

function formatFieldName(fieldName) {
    const fieldNames = {
        sleepHours: '⏰ Heures de sommeil',
        sleepQuality: '😴 Qualité sommeil',
        energyLevel: '⚡ Niveau énergie',
        motivation: '🎯 Motivation',
        stressLevel: '😰 Niveau stress',
        muscleRecovery: '💪 Récupération',
        musclePain: '🩹 Douleur',
        bodyWeight: '⚖️ Poids',
        score: '📊 Score',
        duration: '⏱️ Durée',
        distance: '🏊 Distance',
        rpe: '💪 RPE',
        type: '📝 Type',
        vma: '🏃 VMA',
        legStrength: '🦵 Détente jambes',
        shoulderStrength: '💪 Force épaules',
        coreStrength: '🔥 Gainage',
        available: '✅ Disponible',
        injury: '🩹 Blessure',
        notes: '📝 Notes',
        stroke: '🏊 Nage',
        competitionTime: '⏱️ Temps',
        personalRecord: '🏅 Record',
        technicalScore: '📊 Score technique',
        status: '📋 Statut',
        excused: '📝 Justifiée'
    };
    
    return fieldNames[fieldName] || fieldName;
}

function editDayEntry(swimmerId, dataType, dataIndex, dateStr) {
    const swimmer = getSwimmerById(swimmerId);
    if (!swimmer) return;
    
    const dataArrayName = `${dataType}Data`;
    const entry = swimmer[dataArrayName][dataIndex];
    
    // Créer un formulaire de modification
    showEditEntryForm(swimmer, dataType, dataIndex, entry, dateStr);
}

function deleteDayEntry(swimmerId, dataType, dataIndex, dateStr) {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
        return;
    }
    
    const swimmer = getSwimmerById(swimmerId);
    if (!swimmer) return;
    
    const dataArrayName = `${dataType}Data`;
    swimmer[dataArrayName].splice(dataIndex, 1);
    
    // Sauvegarder
    const swimmers = getAllSwimmers();
    const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
    if (swimmerIndex !== -1) {
        swimmers[swimmerIndex] = swimmer;
        localStorage.setItem('swimmers', JSON.stringify(swimmers));
    }
    
    alert('✅ Enregistrement supprimé avec succès');
    
    // Rafraîchir l'affichage
    closeDayDataModal();
    showDayData(dateStr);
}

function showEditEntryForm(swimmer, dataType, dataIndex, entry, dateStr) {
    const dataTypeNames = {
        wellbeing: 'Bien-être',
        training: 'Entraînement',
        performance: 'Performance',
        medical: 'Médical',
        race: 'Compétition',
        technical: 'Technique',
        attendance: 'Présence'
    };
    
    const modalHtml = `
        <div id="editEntryModal" class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);">
                    <h3 style="margin: 0; color: white;">
                        <i class="fas fa-edit"></i> Modifier - ${dataTypeNames[dataType]}
                    </h3>
                    <button class="close-modal" onclick="closeEditEntryModal()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <strong>👤 Nageur:</strong> ${swimmer.name}<br>
                        <strong>📅 Date:</strong> ${new Date(dateStr).toLocaleDateString('fr-FR')}
                    </div>
                    
                    <form id="editEntryForm" onsubmit="saveEditedEntry(event, '${swimmer.id}', '${dataType}', ${dataIndex}, '${dateStr}')">
                        ${generateEditForm(dataType, entry)}
                        
                        <div style="display: flex; gap: 15px; margin-top: 25px;">
                            <button type="button" onclick="closeEditEntryModal()" class="btn btn-outline" style="flex: 1;">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-primary" style="flex: 2;">
                                <i class="fas fa-save"></i> Enregistrer les modifications
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le modal
    const existingModal = document.getElementById('editEntryModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeEditEntryModal() {
    const modal = document.getElementById('editEntryModal');
    if (modal) {
        modal.remove();
    }
}

function generateEditForm(dataType, entry) {
    let html = '';
    
    switch(dataType) {
        case 'wellbeing':
            html = `
                <div class="form-group">
                    <label>⏰ Heures de sommeil</label>
                    <input type="number" id="edit_sleepHours" class="form-control" value="${entry.sleepHours || ''}" min="0" max="24" step="0.5">
                </div>
                <div class="form-group">
                    <label>😴 Qualité du sommeil (1-10)</label>
                    <input type="number" id="edit_sleepQuality" class="form-control" value="${entry.sleepQuality || ''}" min="1" max="10">
                </div>
                <div class="form-group">
                    <label>⚡ Niveau d'énergie (1-10)</label>
                    <input type="number" id="edit_energyLevel" class="form-control" value="${entry.energyLevel || ''}" min="1" max="10">
                </div>
                <div class="form-group">
                    <label>🎯 Motivation (1-10)</label>
                    <input type="number" id="edit_motivation" class="form-control" value="${entry.motivation || ''}" min="1" max="10">
                </div>
                <div class="form-group">
                    <label>😰 Niveau de stress (1-10)</label>
                    <input type="number" id="edit_stressLevel" class="form-control" value="${entry.stressLevel || ''}" min="1" max="10">
                </div>
                <div class="form-group">
                    <label>💪 Récupération musculaire (1-10)</label>
                    <input type="number" id="edit_muscleRecovery" class="form-control" value="${entry.muscleRecovery || ''}" min="1" max="10">
                </div>
            `;
            break;
            
        case 'training':
            html = `
                <div class="form-group">
                    <label>⏱️ Durée (minutes)</label>
                    <input type="number" id="edit_duration" class="form-control" value="${entry.duration || ''}" min="0">
                </div>
                <div class="form-group">
                    <label>🏊 Distance (mètres)</label>
                    <input type="number" id="edit_distance" class="form-control" value="${entry.distance || ''}" min="0">
                </div>
                <div class="form-group">
                    <label>💪 RPE (1-10)</label>
                    <input type="number" id="edit_rpe" class="form-control" value="${entry.rpe || ''}" min="1" max="10">
                </div>
                <div class="form-group">
                    <label>📝 Type</label>
                    <input type="text" id="edit_type" class="form-control" value="${entry.type || ''}">
                </div>
            `;
            break;
            
        case 'performance':
            html = `
                <div class="form-group">
                    <label>🏃 VMA (km/h)</label>
                    <input type="number" id="edit_vma" class="form-control" value="${entry.vma || ''}" min="0" step="0.1">
                </div>
                <div class="form-group">
                    <label>🦵 Détente jambes (cm)</label>
                    <input type="number" id="edit_legStrength" class="form-control" value="${entry.legStrength || ''}" min="0">
                </div>
                <div class="form-group">
                    <label>💪 Force épaules (/min)</label>
                    <input type="number" id="edit_shoulderStrength" class="form-control" value="${entry.shoulderStrength || ''}" min="0">
                </div>
                <div class="form-group">
                    <label>🔥 Gainage (secondes)</label>
                    <input type="number" id="edit_coreStrength" class="form-control" value="${entry.coreStrength || ''}" min="0">
                </div>
            `;
            break;
            
        case 'attendance':
            html = `
                <div class="form-group">
                    <label>📋 Statut</label>
                    <select id="edit_status" class="form-control">
                        <option value="present" ${entry.status === 'present' ? 'selected' : ''}>✅ Présent</option>
                        <option value="absent" ${entry.status === 'absent' ? 'selected' : ''}>❌ Absent</option>
                        <option value="late" ${entry.status === 'late' ? 'selected' : ''}>⏰ Retard</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>📝 Absence justifiée</label>
                    <select id="edit_excused" class="form-control">
                        <option value="no" ${entry.excused === 'no' || entry.excused === false ? 'selected' : ''}>Non</option>
                        <option value="yes" ${entry.excused === 'yes' || entry.excused === true ? 'selected' : ''}>Oui</option>
                    </select>
                </div>
            `;
            break;
            
        default:
            html = '<p>Type de données non supporté pour l\'édition.</p>';
    }
    
    return html;
}

function saveEditedEntry(event, swimmerId, dataType, dataIndex, dateStr) {
    event.preventDefault();
    
    const swimmer = getSwimmerById(swimmerId);
    if (!swimmer) return;
    
    const dataArrayName = `${dataType}Data`;
    const updatedEntry = { ...swimmer[dataArrayName][dataIndex] };
    
    // Récupérer les valeurs modifiées
    const form = document.getElementById('editEntryForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        const fieldName = input.id.replace('edit_', '');
        let value = input.value;
        
        // Conversion des types
        if (input.type === 'number') {
            value = value ? parseFloat(value) : null;
        } else if (input.type === 'select-one') {
            if (fieldName === 'excused') {
                value = value === 'yes' ? true : false;
            }
        }
        
        if (value !== null && value !== '') {
            updatedEntry[fieldName] = value;
        }
    });
    
    // Mettre à jour
    swimmer[dataArrayName][dataIndex] = updatedEntry;
    
    // Sauvegarder
    const swimmers = getAllSwimmers();
    const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
    if (swimmerIndex !== -1) {
        swimmers[swimmerIndex] = swimmer;
        localStorage.setItem('swimmers', JSON.stringify(swimmers));
    }
    
    alert('✅ Modifications enregistrées avec succès');
    
    // Fermer les modals et rafraîchir
    closeEditEntryModal();
    closeDayDataModal();
    showDayData(dateStr);
}

// ============================================
// UTILITAIRES
// ============================================

// Fermer les modals en cliquant en dehors
window.onclick = function(event) {
    const collectiveModal = document.getElementById('collectiveDataModal');
    const overviewModal = document.getElementById('teamOverviewModal');
    const createTeamModal = document.getElementById('createTeamModal');
    const calendarModal = document.getElementById('teamCalendarModal');
    
    if (event.target === collectiveModal) {
        collectiveModal.style.display = 'none';
    }
    if (event.target === overviewModal) {
        overviewModal.style.display = 'none';
    }
    if (event.target === createTeamModal) {
        createTeamModal.style.display = 'none';
    }
    if (event.target === calendarModal) {
        calendarModal.style.display = 'none';
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
