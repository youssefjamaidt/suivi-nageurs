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
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">${calculateTotalSessions(swimmers)}</div>
                <div style="font-size: 1rem; opacity: 0.9;">🏊 Sessions Totales</div>
            </div>
            
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">${calculateTeamAverageAttendance(swimmers)}%</div>
                <div style="font-size: 1rem; opacity: 0.9;">✅ Taux Présence</div>
            </div>
            
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">${calculateTeamAverageWellbeing(swimmers)}</div>
                <div style="font-size: 1rem; opacity: 0.9;">😊 Bien-être Moyen</div>
            </div>
        </div>
        
        <h4 style="margin: 30px 0 15px 0; color: #333;">📋 Liste des Nageurs</h4>
        <div style="display: grid; gap: 15px;">
    `;
    
    swimmers.forEach(swimmer => {
        const wellbeingScore = getSwimmerWellbeingScore(swimmer);
        const sessionsCount = (swimmer.trainingData || []).length;
        
        html += `
            <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #667eea; display: flex; justify-content: space-between; align-items: center;">
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
                        <div style="font-size: 1.5rem; font-weight: bold; color: #4facfe;">${sessionsCount}</div>
                        <div style="font-size: 0.8rem; color: #666;">Sessions</div>
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

function getSwimmerWellbeingScore(swimmer) {
    if (!swimmer.wellbeingData || swimmer.wellbeingData.length === 0) return 0;
    
    const recent = swimmer.wellbeingData[swimmer.wellbeingData.length - 1];
    const score = (
        (recent.sleepQuality || 0) +
        (10 - (recent.fatigue || 0)) +
        (recent.energy || 0) +
        (recent.motivation || 0) +
        (10 - (recent.stress || 0)) +
        (recent.recovery || 0)
    ) / 6;
    
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
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.sleepQuality}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">😴 Qualité Sommeil</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f9a825 0%, #fbc02d 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.energy}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">⚡ Énergie</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #0288d1 0%, #03a9f4 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.motivation}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🎯 Motivation</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #c2185b 0%, #d81b60 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.stress}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">😰 Stress</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #7b1fa2 0%, #8e24aa 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.recovery}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">🔄 Récupération</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #00796b 0%, #009688 100%); border-radius: 10px; color: white;">
                <div style="font-size: 2rem; font-weight: bold;">${wellbeingStats.fatigue}/10</div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">💤 Fatigue</div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b35;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📊 Interprétation</h4>
            <p style="color: #666; line-height: 1.6; margin: 0;">
                ${getWellbeingInterpretation(wellbeingStats)}
            </p>
        </div>
    `;
    
    content.innerHTML = html;
}

function calculateTeamWellbeingStats(swimmers) {
    const stats = {
        sleepQuality: 0,
        energy: 0,
        motivation: 0,
        stress: 0,
        recovery: 0,
        fatigue: 0,
        count: 0
    };
    
    swimmers.forEach(swimmer => {
        if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
            const recent = swimmer.wellbeingData[swimmer.wellbeingData.length - 1];
            stats.sleepQuality += recent.sleepQuality || 0;
            stats.energy += recent.energy || 0;
            stats.motivation += recent.motivation || 0;
            stats.stress += recent.stress || 0;
            stats.recovery += recent.recovery || 0;
            stats.fatigue += recent.fatigue || 0;
            stats.count++;
        }
    });
    
    if (stats.count > 0) {
        Object.keys(stats).forEach(key => {
            if (key !== 'count') {
                stats[key] = (stats[key] / stats.count).toFixed(1);
            }
        });
    }
    
    return stats;
}

function getWellbeingInterpretation(stats) {
    const avg = ((parseFloat(stats.sleepQuality) + parseFloat(stats.energy) + parseFloat(stats.motivation) + 
                  (10 - parseFloat(stats.stress)) + parseFloat(stats.recovery) + (10 - parseFloat(stats.fatigue))) / 6).toFixed(1);
    
    if (avg >= 7.5) {
        return "✅ Excellente condition générale de l'équipe. Les nageurs sont bien reposés et motivés.";
    } else if (avg >= 6) {
        return "⚠️ Condition correcte mais attention à la fatigue. Surveiller l'évolution.";
    } else {
        return "🚨 Signes de fatigue importante. Envisager une période de récupération ou réduire la charge.";
    }
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
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h4 style="margin: 0 0 15px 0; color: #333;">📈 Évolution & Recommandations</h4>
            <p style="color: #666; line-height: 1.8; margin: 0;">
                ${getPerformanceRecommendations(perfStats)}
            </p>
        </div>
    `;
    
    content.innerHTML = html;
}

function calculateTeamPerformanceStats(swimmers) {
    const stats = {
        vma: 0,
        legStrength: 0,
        shoulderStrength: 0,
        coreStrength: 0,
        count: 0
    };
    
    swimmers.forEach(swimmer => {
        if (swimmer.performanceData && swimmer.performanceData.length > 0) {
            const recent = swimmer.performanceData[swimmer.performanceData.length - 1];
            stats.vma += recent.vma || 0;
            stats.legStrength += recent.legStrength || 0;
            stats.shoulderStrength += recent.shoulderStrength || 0;
            stats.coreStrength += recent.coreStrength || 0;
            stats.count++;
        }
    });
    
    if (stats.count > 0) {
        stats.vma = (stats.vma / stats.count).toFixed(1);
        stats.legStrength = Math.round(stats.legStrength / stats.count);
        stats.shoulderStrength = Math.round(stats.shoulderStrength / stats.count);
        stats.coreStrength = Math.round(stats.coreStrength / stats.count);
    }
    
    return stats;
}

function getPerformanceRecommendations(stats) {
    let recommendations = [];
    
    if (parseFloat(stats.vma) < 12) {
        recommendations.push("⚠️ VMA moyenne faible - Augmenter le travail aérobie");
    }
    if (stats.legStrength < 40) {
        recommendations.push("⚠️ Détente des jambes à améliorer - Renforcer la pliométrie");
    }
    if (stats.shoulderStrength < 30) {
        recommendations.push("⚠️ Force des épaules insuffisante - Travail spécifique recommandé");
    }
    if (stats.coreStrength < 60) {
        recommendations.push("⚠️ Gainage à renforcer - Ajouter des exercices de core");
    }
    
    if (recommendations.length === 0) {
        return "✅ Excellentes performances physiques globales de l'équipe. Maintenir le travail actuel.";
    }
    
    return recommendations.join("<br>");
}

// ============================================
// SECTIONS 4-7: STUBS (À COMPLÉTER)
// ============================================

function loadMedicalSection(swimmers) {
    const content = document.getElementById('medicalContent');
    const availableCount = swimmers.filter(s => {
        if (!s.medicalData || s.medicalData.length === 0) return true;
        const recent = s.medicalData[s.medicalData.length - 1];
        return recent.available;
    }).length;
    
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #e91e63;">
            <i class="fas fa-heartbeat"></i> Suivi Médical de l'Équipe
        </h3>
        <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); border-radius: 12px; color: white;">
            <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${availableCount}/${swimmers.length}</div>
            <div style="font-size: 1.2rem; opacity: 0.9;">Nageurs Disponibles</div>
        </div>
    `;
}

function loadRaceSection(swimmers) {
    const content = document.getElementById('raceContent');
    let totalRaces = 0;
    swimmers.forEach(s => {
        if (s.raceData) totalRaces += s.raceData.length;
    });
    
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #3498db;">
            <i class="fas fa-trophy"></i> Performances de Course
        </h3>
        <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); border-radius: 12px; color: white;">
            <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${totalRaces}</div>
            <div style="font-size: 1.2rem; opacity: 0.9;">🏆 Compétitions Totales</div>
        </div>
    `;
}

function loadTechnicalSection(swimmers) {
    const content = document.getElementById('technicalContent');
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #1abc9c;">
            <i class="fas fa-swimming-pool"></i> Suivi Technique de l'Équipe
        </h3>
        <div style="text-align: center; padding: 40px; color: #999;">
            <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <p>Analyse technique en cours de développement</p>
        </div>
    `;
}

function loadAttendanceSection(swimmers) {
    const content = document.getElementById('attendanceContent');
    const avgAttendance = calculateTeamAverageAttendance(swimmers);
    
    content.innerHTML = `
        <h3 style="margin-bottom: 25px; color: #27ae60;">
            <i class="fas fa-calendar-check"></i> Assiduité de l'Équipe
        </h3>
        <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); border-radius: 12px; color: white;">
            <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${avgAttendance}%</div>
            <div style="font-size: 1.2rem; opacity: 0.9;">✅ Taux de Présence Moyen</div>
        </div>
    `;
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
            
        </div>
    `;
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

function closeCollectiveDataModal() {
    document.getElementById('collectiveDataModal').style.display = 'none';
}

function selectCollectiveDataType(type) {
    alert(`Saisie collective de type "${type}" - Fonctionnalité en cours de développement`);
    // TODO: Implémenter les formulaires de saisie collective
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
