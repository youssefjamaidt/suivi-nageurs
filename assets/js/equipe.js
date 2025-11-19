// =====================================================
// GESTION DES ÉQUIPES - equipe.js
// =====================================================

// ===== CACHE SYSTEM POUR PERFORMANCES =====
const CacheTeam = {
    _data: {},
    _timestamps: {},
    TTL: 5000,
    
    get(key) {
        const now = Date.now();
        if (this._data[key] && (now - this._timestamps[key]) < this.TTL) {
            return this._data[key];
        }
        return null;
    },
    
    set(key, value) {
        this._data[key] = value;
        this._timestamps[key] = Date.now();
    },
    
    clear() {
        this._data = {};
        this._timestamps = {};
    }
};

// ===== CHART REGISTRY =====
const TeamChartRegistry = {
    charts: {},
    
    register(id, chart) {
        if (this.charts[id]) {
            this.charts[id].destroy();
        }
        this.charts[id] = chart;
    },
    
    destroy(id) {
        if (this.charts[id]) {
            this.charts[id].destroy();
            delete this.charts[id];
        }
    },
    
    destroyAll() {
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
    }
};

let currentTeamId = null;
let editingTeamId = null;

// =====================================================
// 1. INITIALISATION
// =====================================================

// Synchronisation automatique entre onglets/pages
window.addEventListener('storage', function(e) {
    if (e.key === 'swimmers') {
        console.log('🔄 Synchronisation: Nageurs modifiés depuis Dashboard');
        // Recharger la liste des nageurs disponibles
        if (currentTeamId) {
            const team = getTeamById(currentTeamId);
            if (team) {
                displayTeamSwimmers(team);
                refreshAllSections(team);
            }
        }
        loadGlobalTeamSelector();
    }
    if (e.key === 'teams') {
        console.log('🔄 Synchronisation: Équipes modifiées depuis une autre page');
        loadTeams();
        loadGlobalTeamSelector();
    }
});

// Actualiser au focus de la page
window.addEventListener('focus', function() {
    console.log('🔄 Rafraîchissement: Retour sur la page équipe');
    loadTeams();
    loadGlobalTeamSelector();
    if (currentTeamId) {
        const team = getTeamById(currentTeamId);
        if (team) {
            refreshAllSections(team);
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Navigation entre sections
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Charger les équipes et les sélecteurs
    loadTeams();
    loadGlobalTeamSelector();
    
    // Écouteur pour le changement de date de présence
    const attendanceDate = document.getElementById('attendanceDate');
    if (attendanceDate) {
        attendanceDate.addEventListener('change', function() {
            if (currentTeamId) {
                const team = getTeamById(currentTeamId);
                if (team) {
                    displayAttendanceForm(team);
                }
            }
        });
    }
    
    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            document.querySelector('nav').classList.toggle('active');
        });
    }
    
    // Effet scroll pour le sélecteur sticky
    window.addEventListener('scroll', function() {
        const stickySelector = document.querySelector('.sticky-selector');
        if (stickySelector) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 50) {
                stickySelector.classList.add('scrolled');
            } else {
                stickySelector.classList.remove('scrolled');
            }
        }
    });
});

// Afficher une section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // Cacher toutes les sections
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block'; // Afficher seulement la section ciblée
    }
}

// =====================================================
// 2. GESTION DES ÉQUIPES (CRUD)
// =====================================================

// Charger toutes les équipes
function loadTeams() {
    const teams = getTeams();
    const teamsList = document.getElementById('teamsList');
    
    if (teams.length === 0) {
        teamsList.innerHTML = `
            <div class="card">
                <p style="text-align: center; color: #999;">Aucune équipe créée. Cliquez sur "Nouvelle Équipe" pour commencer.</p>
            </div>
        `;
        return;
    }

    teamsList.innerHTML = teams.map(team => `
        <div class="card team-card" onclick="window.selectTeam('${team.id}')" style="cursor: pointer;">
            <div class="card-header">
                <h3><i class="fas fa-users"></i> ${team.name}</h3>
                <span class="badge">${team.swimmers.length} nageur(s)</span>
            </div>
            <div class="card-body">
                <p><strong>Catégorie:</strong> ${team.category}</p>
                <p>${team.description || 'Aucune description'}</p>
                <p style="font-size: 0.85rem; color: #999; margin-top: 10px;">
                    Créée le ${new Date(team.createdDate).toLocaleDateString('fr-FR')}
                </p>
            </div>
        </div>
    `).join('');
}

// Obtenir toutes les équipes
function getTeams() {
    const cached = CacheTeam.get('teams');
    if (cached) return cached;
    
    const teams = localStorage.getItem('teams');
    const result = teams ? JSON.parse(teams) : [];
    CacheTeam.set('teams', result);
    return result;
}

// Sauvegarder les équipes
function saveTeamsToStorage(teams) {
    CacheTeam.clear();
    localStorage.setItem('teams', JSON.stringify(teams));
}

// Obtenir une équipe par ID
function getTeamById(teamId) {
    const teams = getTeams();
    return teams.find(team => team.id === teamId);
}

// Afficher modal création équipe
window.showCreateTeamModal = function() {
    editingTeamId = null;
    document.getElementById('teamModalTitle').textContent = 'Nouvelle Équipe';
    document.getElementById('teamForm').reset();
    document.getElementById('teamModal').style.display = 'block';
};

// Fermer modal équipe
window.closeTeamModal = function() {
    document.getElementById('teamModal').style.display = 'none';
    editingTeamId = null;
};

// Sauvegarder équipe (création ou édition)
window.saveTeam = function(event) {
    event.preventDefault();
    
    const name = document.getElementById('teamName').value.trim();
    const description = document.getElementById('teamDescription').value.trim();
    const category = document.getElementById('teamCategory').value;
    
    if (!name) {
        alert('Le nom de l\'équipe est obligatoire.');
        return;
    }

    const teams = getTeams();
    
    if (editingTeamId) {
        // Édition
        const teamIndex = teams.findIndex(t => t.id === editingTeamId);
        if (teamIndex !== -1) {
            teams[teamIndex].name = name;
            teams[teamIndex].description = description;
            teams[teamIndex].category = category;
            saveTeamsToStorage(teams);
            alert('Équipe modifiée avec succès !');
            editingTeamId = null;
        }
    } else {
        // Création
        const newTeam = {
            id: Date.now().toString(),
            name: name,
            description: description,
            category: category,
            swimmers: [],
            createdDate: new Date().toISOString()
        };
        teams.push(newTeam);
        saveTeamsToStorage(teams);
        alert('Équipe créée avec succès !');
    }
    
    loadTeams();
    loadGlobalTeamSelector();
    closeTeamModal();
    
    if (editingTeamId && currentTeamId === editingTeamId) {
        selectTeam(editingTeamId);
    }
};

// Sélectionner une équipe
window.selectTeam = function(teamId) {
    currentTeamId = teamId;
    const team = getTeamById(teamId);
    
    if (!team) return;

    // Afficher détails
    document.getElementById('teamDetailsSection').style.display = 'block';
    document.getElementById('selectedTeamName').textContent = team.name;
    document.getElementById('selectedTeamDescription').textContent = team.description || 'Aucune description';
    document.getElementById('selectedTeamCategory').textContent = team.category;
    document.getElementById('selectedTeamCount').textContent = team.swimmers.length;

    // Afficher liste des nageurs
    displayTeamSwimmers(team);
    
    // Mettre à jour les autres sections
    displayTeamStats(team);
    // Rafraîchir la section Saisie pour forcer la saisie groupée
    refreshDataEntrySection(team);
    displayBulkEntrySection(team);
    // Ne pas afficher de formulaire individuel ici
    displayAttendanceForm(team);
    displayAttendanceStats(team);
    displayAttendanceCharts(team);
    
    // Afficher la section Analyse avec tous les onglets
    showAnalysisSection(team);
    displayRecommendationsSection(team);
    displayComparisonsSection(team);
    displayCalendarSection(team);
    updateCalendarWithAttendance(team);
};

// Afficher les nageurs de l'équipe
function displayTeamSwimmers(team) {
    const container = document.getElementById('teamSwimmersList');
    const swimmers = getAllSwimmers();
    
    if (team.swimmers.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucun nageur dans cette équipe.</p>';
        return;
    }

    const teamSwimmers = swimmers.filter(s => team.swimmers.includes(s.id));
    
    container.innerHTML = teamSwimmers.map(swimmer => `
        <div class="swimmer-item">
            <div>
                <strong>${swimmer.name}</strong>
                <span style="color: #999; font-size: 0.9rem; margin-left: 10px;">
                    ${swimmer.age} ans - ${swimmer.level || 'N/A'}
                </span>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.removeSwimmerFromTeam('${swimmer.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Modifier équipe
window.editTeam = function() {
    if (!currentTeamId) return;
    
    const team = getTeamById(currentTeamId);
    if (!team) return;

    editingTeamId = currentTeamId;
    document.getElementById('teamModalTitle').textContent = 'Modifier l\'Équipe';
    document.getElementById('teamName').value = team.name;
    document.getElementById('teamDescription').value = team.description || '';
    document.getElementById('teamCategory').value = team.category;
    document.getElementById('teamModal').style.display = 'block';
};

// Supprimer équipe
window.deleteTeam = function() {
    if (!currentTeamId) return;
    
    const team = getTeamById(currentTeamId);
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${team.name}" ?`)) {
        return;
    }

    let teams = getTeams();
    teams = teams.filter(t => t.id !== currentTeamId);
    saveTeamsToStorage(teams);

    // Retirer l'équipe de tous les nageurs
    const swimmers = getAllSwimmers();
    swimmers.forEach(swimmer => {
        if (swimmer.teams && swimmer.teams.includes(currentTeamId)) {
            swimmer.teams = swimmer.teams.filter(tid => tid !== currentTeamId);
        }
    });
    saveSwimmers(swimmers);

    currentTeamId = null;
    document.getElementById('teamDetailsSection').style.display = 'none';
    loadTeams();
    loadGlobalTeamSelector();
    alert('Équipe supprimée avec succès.');
};

// Afficher modal ajout nageurs
window.showAddSwimmersModal = function() {
    if (!currentTeamId) return;

    const team = getTeamById(currentTeamId);
    const allSwimmers = getAllSwimmers();
    const availableSwimmers = allSwimmers.filter(s => !team.swimmers.includes(s.id));

    if (availableSwimmers.length === 0) {
        alert('Aucun nageur disponible à ajouter.');
        return;
    }

    const container = document.getElementById('availableSwimmersList');
    container.innerHTML = availableSwimmers.map(swimmer => `
        <label class="checkbox-item">
            <input type="checkbox" value="${swimmer.id}">
            <span>${swimmer.name} (${swimmer.age} ans)</span>
        </label>
    `).join('');

    document.getElementById('swimmersModal').style.display = 'block';
};

// Fermer modal nageurs
window.closeSwimmersModal = function() {
    document.getElementById('swimmersModal').style.display = 'none';
};

// Ajouter nageurs à l'équipe
window.addSwimmersToTeam = function() {
    if (!currentTeamId) return;
    
    const checkboxes = document.querySelectorAll('#availableSwimmersList input[type="checkbox"]:checked');
    const swimmerIds = Array.from(checkboxes).map(cb => cb.value);
    
    if (swimmerIds.length === 0) {
        alert('Veuillez sélectionner au moins un nageur.');
        return;
    }

    const teams = getTeams();
    const teamIndex = teams.findIndex(t => t.id === currentTeamId);
    
    if (teamIndex !== -1) {
        teams[teamIndex].swimmers.push(...swimmerIds);
        saveTeamsToStorage(teams);
        
        // Mettre à jour les nageurs
        const swimmers = getAllSwimmers();
        swimmers.forEach(swimmer => {
            if (swimmerIds.includes(swimmer.id)) {
                if (!swimmer.teams) swimmer.teams = [];
                if (!swimmer.teams.includes(currentTeamId)) {
                    swimmer.teams.push(currentTeamId);
                }
            }
        });
        saveSwimmers(swimmers);
        
        selectTeam(currentTeamId);
        closeSwimmersModal();
    }
};

// Retirer nageur de l'équipe
window.removeSwimmerFromTeam = function(swimmerId) {
    if (!currentTeamId) return;
    
    if (!confirm('Retirer ce nageur de l\'équipe ?')) return;

    const teams = getTeams();
    const teamIndex = teams.findIndex(t => t.id === currentTeamId);
    
    if (teamIndex !== -1) {
        teams[teamIndex].swimmers = teams[teamIndex].swimmers.filter(id => id !== swimmerId);
        saveTeamsToStorage(teams);
        
        // Mettre à jour le nageur
        const swimmers = getAllSwimmers();
        const swimmer = swimmers.find(s => s.id === swimmerId);
        if (swimmer && swimmer.teams) {
            swimmer.teams = swimmer.teams.filter(tid => tid !== currentTeamId);
        }
        saveSwimmers(swimmers);
        
        selectTeam(currentTeamId);
    }
};

// =====================================================
// 4. FONCTIONS UTILITAIRES
// =====================================================

// Obtenir tous les nageurs
function getAllSwimmers() {
    const swimmers = localStorage.getItem('swimmers');
    return swimmers ? JSON.parse(swimmers) : [];
}

// Sauvegarder nageurs
function saveSwimmers(swimmers) {
    localStorage.setItem('swimmers', JSON.stringify(swimmers));
}

// =====================================================
// 5. TABLEAU DE BORD ÉQUIPE - ANALYSES DÉTAILLÉES
// =====================================================

function displayTeamStats(team) {
    const container = document.getElementById('teamStatsSection');
    
    // ⚡ Vérifier cache pour éviter recalculs
    const cacheKey = `teamStats_${team.id}`;
    const cached = CacheTeam.get(cacheKey);
    if (cached && container) {
        container.innerHTML = cached;
        // Re-render graphiques (canvas ne peuvent pas être cachés en HTML)
        const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
        const extract = buildSwimmerExtractors();
        setTimeout(() => renderTeamParameterCharts(team, swimmers, extract), 50);
        return;
    }
    
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    if (swimmers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Aucun nageur dans cette équipe pour afficher des statistiques.</p>';
        return;
    }

    // Calcul des statistiques
    const stats = calculateTeamStats(swimmers);

    // Aides de calcul (robustes aux deux structures de données)
    const extract = buildSwimmerExtractors();
    const attendance = calculateAttendanceStats(team);

    // Moyennes d'équipe (7 paramètres)
    const avgPresence = attendance && attendance.totalSessions > 0 ? attendance.averageRate : 0;
    const avgWellbeing = average(
        swimmers.map(s => extract.wellbeingAvg(s)).filter(isNumber)
    );
    const avgTrainingLoad = average(
        swimmers.map(s => extract.trainingLoadAvg(s)).filter(isNumber)
    );
    const avgVMA = average(
        swimmers.map(s => extract.vmaLatest(s)).filter(isNumber)
    );
    const avgTechnical = average(
        swimmers.map(s => extract.technicalAvg(s)).filter(isNumber)
    );
    const avgMedical = average(
        swimmers.map(s => extract.medicalAvailabilityAvg(s)).filter(isNumber)
    );
    const totalRaces = swimmers.reduce((sum, s) => sum + extract.raceCount(s), 0);

    // Cartes synthèse (7)
    const syntheseCards = `
        <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
            <div class="card stats-card" style="border-left: 4px solid #1a73e8;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-value">${swimmers.length}</div>
                    <div class="stat-label">Nageurs</div>
                </div>
            </div>
            <div class="card stats-card" style="border-left: 4px solid #28a745;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-percent"></i></div>
                    <div class="stat-value">${(avgPresence || 0).toFixed(1)}%</div>
                    <div class="stat-label">Présence</div>
                </div>
            </div>
            <div class="card stats-card" style="border-left: 4px solid #f39c12;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-smile"></i></div>
                    <div class="stat-value">${(avgWellbeing || 0).toFixed(1)}/5</div>
                    <div class="stat-label">Bien-être</div>
                </div>
            </div>
            <div class="card stats-card" style="border-left: 4px solid #9b59b6;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-dumbbell"></i></div>
                    <div class="stat-value">${(avgTrainingLoad || 0).toFixed(0)}</div>
                    <div class="stat-label">Charge (moy.)</div>
                </div>
            </div>
            <div class="card stats-card" style="border-left: 4px solid #e74c3c;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-running"></i></div>
                    <div class="stat-value">${(avgVMA || 0).toFixed(1)}</div>
                    <div class="stat-label">VMA (km/h)</div>
                </div>
            </div>
            <div class="card stats-card" style="border-left: 4px solid #16a085;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-user-md"></i></div>
                    <div class="stat-value">${(avgMedical || 0).toFixed(1)}/3</div>
                    <div class="stat-label">Disponibilité</div>
                </div>
            </div>
            <div class="card stats-card" style="border-left: 4px solid #2c3e50;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-star"></i></div>
                    <div class="stat-value">${(avgTechnical || 0).toFixed(1)}/10</div>
                    <div class="stat-label">Technique</div>
                </div>
            </div>
            <div class="card stats-card" style="border-left: 4px solid #17a2b8;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                    <div class="stat-value">${totalRaces}</div>
                    <div class="stat-label">Courses</div>
                </div>
            </div>
        </div>`;

    // Détails performances moyennes (si disponibles)
    const perfBlock = `
        <div class="card" style="margin-top: 20px;">
            <h3><i class="fas fa-stopwatch"></i> Performances Moyennes</h3>
            ${stats.performances.length > 0 ? `
                ${stats.performances.slice(0, 5).map(perf => `
                    <div class="stat-item">
                        <span>${perf.distance}m ${perf.stroke}:</span>
                        <strong>${perf.avgTime}</strong>
                    </div>
                `).join('')}
            ` : '<p style="color: #999;">Aucune performance enregistrée</p>'}
        </div>`;

    // Conteneurs de graphiques par paramètre
    const chartsBlock = `
        <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-top: 20px;">
            <div class="card"><h3>😊 Bien-être</h3><canvas id="wellbeingChart" style="max-height:280px;"></canvas></div>
            <div class="card"><h3>📊 Entraînement</h3><canvas id="trainingChart" style="max-height:280px;"></canvas></div>
            <div class="card"><h3>💪 VMA</h3><canvas id="vmaChart" style="max-height:280px;"></canvas></div>
            <div class="card"><h3>🏥 Médical</h3><canvas id="medicalChart" style="max-height:280px;"></canvas></div>
            <div class="card"><h3>🏆 Courses</h3><canvas id="raceChart" style="max-height:280px;"></canvas></div>
            <div class="card"><h3>🎯 Technique</h3><canvas id="technicalChart" style="max-height:280px;"></canvas></div>
        </div>`;

    container.innerHTML = syntheseCards + perfBlock + chartsBlock;

    // ⚡ Mettre en cache le HTML (sans les canvas)
    const cacheKey = `teamStats_${team.id}`;
    CacheTeam.set(cacheKey, syntheseCards + perfBlock + chartsBlock);

    // Rendu des graphiques avec délai pour ne pas bloquer l'UI
    requestAnimationFrame(() => {
        renderTeamParameterCharts(team, swimmers, extract);
    });
}

// Sélectionner une équipe
window.selectTeam = function(teamId) {
    currentTeamId = teamId;
    const team = getTeamById(teamId);
    
    if (!team) return;

    // Afficher détails
    document.getElementById('teamDetailsSection').style.display = 'block';
    document.getElementById('selectedTeamName').textContent = team.name;
    document.getElementById('selectedTeamDescription').textContent = team.description || 'Aucune description';
    document.getElementById('selectedTeamCategory').textContent = team.category;
    document.getElementById('selectedTeamCount').textContent = team.swimmers.length;

    // Afficher liste des nageurs
    displayTeamSwimmers(team);
    
    // Mettre à jour les autres sections
    displayTeamStats(team);
    // Afficher uniquement la saisie groupée dans la section Saisie de Données
        // Rafraîchir la section Saisie pour forcer la saisie groupée
        refreshDataEntrySection(team);
        displayBulkEntrySection(team);
    // Ne pas afficher de formulaire individuel ici
    displayAttendanceForm(team);
    displayAttendanceStats(team);
    displayAttendanceCharts(team);
    displayAnalysisSection(team);
    updateCalendarWithAttendance(team);
};

// Afficher les nageurs de l'équipe
function displayTeamSwimmers(team) {
    const container = document.getElementById('teamSwimmersList');
    const swimmers = getAllSwimmers();
    
    if (team.swimmers.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucun nageur dans cette équipe.</p>';
        return;
    }

    const teamSwimmers = swimmers.filter(s => team.swimmers.includes(s.id));
    
    container.innerHTML = teamSwimmers.map(swimmer => `
        <div class="swimmer-item">
            <div>
                <strong>${swimmer.name}</strong>
                <span style="color: #999; font-size: 0.9rem; margin-left: 10px;">
                    ${swimmer.age} ans - ${swimmer.level || 'N/A'}
                </span>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.removeSwimmerFromTeam('${swimmer.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Modifier équipe
window.editTeam = function() {
    if (!currentTeamId) return;
    
    const team = getTeamById(currentTeamId);
    if (!team) return;

    editingTeamId = currentTeamId;
    document.getElementById('teamModalTitle').textContent = 'Modifier l\'Équipe';
    document.getElementById('teamName').value = team.name;
    document.getElementById('teamDescription').value = team.description || '';
    document.getElementById('teamCategory').value = team.category;
    document.getElementById('teamModal').style.display = 'block';
};

// Supprimer équipe
window.deleteTeam = function() {
    if (!currentTeamId) return;
    
    const team = getTeamById(currentTeamId);
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${team.name}" ?`)) {
        return;
    }

    let teams = getTeams();
    teams = teams.filter(t => t.id !== currentTeamId);
    saveTeamsToStorage(teams);
    
    // Retirer l'équipe des nageurs
    const swimmers = getAllSwimmers();
    swimmers.forEach(swimmer => {
        if (swimmer.teams && swimmer.teams.includes(currentTeamId)) {
            swimmer.teams = swimmer.teams.filter(tid => tid !== currentTeamId);
        }
    });
    saveSwimmers(swimmers);

    currentTeamId = null;
    document.getElementById('teamDetailsSection').style.display = 'none';
    loadTeams();
};

// =====================================================
// 3. GESTION DES NAGEURS DANS L'ÉQUIPE
// =====================================================

// Afficher modal ajout nageurs
window.showAddSwimmersModal = function() {
    if (!currentTeamId) return;
    
    const team = getTeamById(currentTeamId);
    const allSwimmers = getAllSwimmers();
    const availableSwimmers = allSwimmers.filter(s => !team.swimmers.includes(s.id));
    
    const container = document.getElementById('availableSwimmersList');
    
    if (availableSwimmers.length === 0) {
        container.innerHTML = '<p style="color: #999;">Tous les nageurs sont déjà dans cette équipe.</p>';
    } else {
        container.innerHTML = availableSwimmers.map(swimmer => `
            <label class="checkbox-item">
                <input type="checkbox" value="${swimmer.id}">
                <span>${swimmer.name} - ${swimmer.age} ans</span>
            </label>
        `).join('');
    }
    
    document.getElementById('swimmersModal').style.display = 'block';
};

// Fermer modal nageurs
window.closeSwimmersModal = function() {
    document.getElementById('swimmersModal').style.display = 'none';
};

// Ajouter nageurs à l'équipe
window.addSwimmersToTeam = function() {
    if (!currentTeamId) return;
    
    const checkboxes = document.querySelectorAll('#availableSwimmersList input[type="checkbox"]:checked');
    const swimmerIds = Array.from(checkboxes).map(cb => cb.value);
    
    if (swimmerIds.length === 0) {
        alert('Veuillez sélectionner au moins un nageur.');
        return;
    }

    const teams = getTeams();
    const teamIndex = teams.findIndex(t => t.id === currentTeamId);
    
    if (teamIndex !== -1) {
        teams[teamIndex].swimmers.push(...swimmerIds);
        saveTeamsToStorage(teams);
        
        // Mettre à jour les nageurs
        const swimmers = getAllSwimmers();
        swimmers.forEach(swimmer => {
            if (swimmerIds.includes(swimmer.id)) {
                if (!swimmer.teams) swimmer.teams = [];
                if (!swimmer.teams.includes(currentTeamId)) {
                    swimmer.teams.push(currentTeamId);
                }
            }
        });
        saveSwimmers(swimmers);
        
        selectTeam(currentTeamId);
        closeSwimmersModal();
    }
};

// Retirer nageur de l'équipe
window.removeSwimmerFromTeam = function(swimmerId) {
    if (!currentTeamId) return;
    
    if (!confirm('Retirer ce nageur de l\'équipe ?')) return;

    const teams = getTeams();
    const teamIndex = teams.findIndex(t => t.id === currentTeamId);
    
    if (teamIndex !== -1) {
        teams[teamIndex].swimmers = teams[teamIndex].swimmers.filter(id => id !== swimmerId);
        saveTeamsToStorage(teams);
        
        // Mettre à jour le nageur
        const swimmers = getAllSwimmers();
        const swimmer = swimmers.find(s => s.id === swimmerId);
        if (swimmer && swimmer.teams) {
            swimmer.teams = swimmer.teams.filter(tid => tid !== currentTeamId);
        }
        saveSwimmers(swimmers);
        
        selectTeam(currentTeamId);
    }
};

// =====================================================
// 4. FONCTIONS UTILITAIRES
// =====================================================

// Obtenir tous les nageurs
function getAllSwimmers() {
    const swimmers = localStorage.getItem('swimmers');
    return swimmers ? JSON.parse(swimmers) : [];
}

// Sauvegarder nageurs
function saveSwimmers(swimmers) {
    localStorage.setItem('swimmers', JSON.stringify(swimmers));
}

// =====================================================
// 5. TABLEAU DE BORD ÉQUIPE - ANALYSES DÉTAILLÉES (SUPPRIMÉ - Voir nouvelle version ligne 150)
// =====================================================

// Calculer les statistiques de l'équipe
function calculateTeamStats(swimmers) {
    const stats = {
        avgAge: 0,
        performances: [],
        technical: [],
        physical: {
            vmaAvg: 0,
            wellbeingAvg: 0
        },
        strengths: [],
        weaknesses: [],
        topSwimmers: []
    };

    // Âge moyen
    stats.avgAge = (swimmers.reduce((sum, s) => sum + (s.age || 0), 0) / swimmers.length).toFixed(1);

    // Performances moyennes
    const perfMap = new Map();
    swimmers.forEach(swimmer => {
        if (swimmer.performances && swimmer.performances.length > 0) {
            swimmer.performances.forEach(perf => {
                const key = `${perf.distance}_${perf.stroke}`;
                if (!perfMap.has(key)) {
                    perfMap.set(key, { times: [], distance: perf.distance, stroke: perf.stroke });
                }
                perfMap.get(key).times.push(parseTimeToSeconds(perf.time));
            });
        }
    });

    perfMap.forEach((value, key) => {
        const avgSeconds = value.times.reduce((a, b) => a + b, 0) / value.times.length;
        stats.performances.push({
            distance: value.distance,
            stroke: value.stroke,
            avgTime: formatSecondsToTime(avgSeconds)
        });
    });

    // Techniques moyennes
    const techMap = new Map();
    swimmers.forEach(swimmer => {
        if (swimmer.technical) {
            Object.keys(swimmer.technical).forEach(category => {
                const data = swimmer.technical[category];
                if (data && data.length > 0) {
                    const lastEntry = data[data.length - 1];
                    if (!techMap.has(category)) {
                        techMap.set(category, { scores: [], category: getCategoryName(category) });
                    }
                    
                    // Calculer moyenne des scores numériques
                    const numericScores = Object.keys(lastEntry.data)
                        .filter(key => typeof lastEntry.data[key] === 'number')
                        .map(key => lastEntry.data[key]);
                    
                    if (numericScores.length > 0) {
                        const avg = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
                        techMap.get(category).scores.push(avg);
                    }
                }
            });
        }
    });

    techMap.forEach((value, key) => {
        if (value.scores.length > 0) {
            const avgScore = value.scores.reduce((a, b) => a + b, 0) / value.scores.length;
            stats.technical.push({
                category: value.category,
                avgScore: avgScore
            });
        }
    });

    // Condition physique
    let vmaCount = 0, vmaSum = 0;
    let wellbeingCount = 0, wellbeingSum = 0;
    
    swimmers.forEach(swimmer => {
        if (swimmer.vma && swimmer.vma.length > 0) {
            const lastVma = swimmer.vma[swimmer.vma.length - 1];
            if (lastVma.value) {
                vmaSum += lastVma.value;
                vmaCount++;
            }
        }
        if (swimmer.wellbeing && swimmer.wellbeing.length > 0) {
            const lastWellbeing = swimmer.wellbeing[swimmer.wellbeing.length - 1];
            if (lastWellbeing.sleep) {
                wellbeingSum += (lastWellbeing.sleep + lastWellbeing.fatigue + 
                                lastWellbeing.stress + lastWellbeing.motivation) / 4;
                wellbeingCount++;
            }
        }
    });

    stats.physical.vmaAvg = vmaCount > 0 ? vmaSum / vmaCount : 0;
    stats.physical.wellbeingAvg = wellbeingCount > 0 ? wellbeingSum / wellbeingCount : 0;

    // Forces et faiblesses
    stats.technical.forEach(tech => {
        if (tech.avgScore >= 8) {
            stats.strengths.push({
                name: tech.category,
                value: `Score moyen: ${tech.avgScore.toFixed(1)}/10`
            });
        } else if (tech.avgScore <= 5) {
            stats.weaknesses.push({
                name: tech.category,
                value: `Score moyen: ${tech.avgScore.toFixed(1)}/10`
            });
        }
    });

    // Meilleurs nageurs (basé sur performances)
    stats.topSwimmers = swimmers.map(swimmer => {
        let score = 0;
        let reasons = [];
        
        // Score technique
        if (swimmer.technical) {
            const techScores = [];
            Object.keys(swimmer.technical).forEach(cat => {
                const data = swimmer.technical[cat];
                if (data && data.length > 0) {
                    const lastEntry = data[data.length - 1];
                    const numericScores = Object.keys(lastEntry.data)
                        .filter(key => typeof lastEntry.data[key] === 'number')
                        .map(key => lastEntry.data[key]);
                    if (numericScores.length > 0) {
                        techScores.push(numericScores.reduce((a, b) => a + b, 0) / numericScores.length);
                    }
                }
            });
            if (techScores.length > 0) {
                const avgTech = techScores.reduce((a, b) => a + b, 0) / techScores.length;
                score += avgTech;
                reasons.push(`Technique: ${avgTech.toFixed(1)}/10`);
            }
        }
        
        return {
            name: swimmer.name,
            score: score > 0 ? score.toFixed(1) : 'N/A',
            reason: reasons.length > 0 ? reasons.join(', ') : 'Données insuffisantes'
        };
    }).filter(s => s.score !== 'N/A').sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

    return stats;
}

// Fonctions utilitaires
function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
        const [min, sec] = parts;
        return parseInt(min) * 60 + parseFloat(sec);
    }
    return parseFloat(timeStr);
}

function formatSecondsToTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60).toFixed(2);
    return min > 0 ? `${min}:${sec.padStart(5, '0')}` : `${sec}s`;
}

function getCategoryName(key) {
    const names = {
        crawl: 'Crawl',
        breaststroke: 'Brasse',
        backstroke: 'Dos',
        butterfly: 'Papillon',
        medley: '4 Nages',
        startsAndTurns: 'Départs et Virages'
    };
    return names[key] || key;
}

// =====================================================
// 6. SAISIE FACILITÉE - SYSTÈME COMPLET
// =====================================================

// Helpers communs (moyennes, vérifs)
function average(arr) {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}
function isNumber(x) { return typeof x === 'number' && !isNaN(x); }

// Extraire métriques d'un nageur (supporte anciens et nouveaux schémas)
function buildSwimmerExtractors() {
    return {
        wellbeingAvg: (s) => {
            // new: wellbeingData: [{sleep,fatigue,pain,stress} 1..5]
            if (Array.isArray(s.wellbeingData) && s.wellbeingData.length > 0) {
                const last = s.wellbeingData[s.wellbeingData.length - 1];
                const vals = [last.sleep, last.fatigue, last.pain, last.stress].map(v => Number(v) || 0);
                return average(vals);
            }
            // old: wellbeing: [{sleep,fatigue,stress,motivation}]
            if (Array.isArray(s.wellbeing) && s.wellbeing.length > 0) {
                const last = s.wellbeing[s.wellbeing.length - 1];
                const vals = [last.sleep, last.fatigue, last.stress, last.motivation].map(v => Number(v) || 0);
                return average(vals);
            }
            return 0;
        },
        trainingLoadAvg: (s) => {
            // new: trainingData: [{load}] sinon approx volume*rpe
            if (Array.isArray(s.trainingData) && s.trainingData.length > 0) {
                const loads = s.trainingData.map(t => Number(t.load) || (Number(t.volume || 0) * Number(t.rpe || 0)) ).filter(isNumber);
                return average(loads);
            }
            // old: training: array? fallback 0
            return 0;
        },
        vmaLatest: (s) => {
            // old: vma: [{value}]
            if (Array.isArray(s.vma) && s.vma.length > 0) {
                const last = s.vma[s.vma.length - 1];
                return Number(last.value) || 0;
            }
            // new: performanceData might include vma value
            if (Array.isArray(s.performanceData) && s.performanceData.length > 0) {
                const last = s.performanceData[s.performanceData.length - 1];
                if (last.vma) return Number(last.vma) || 0;
            }
            return 0;
        },
        technicalAvg: (s) => {
            // old: technical: {category: [{data: {...}}]}
            if (s.technical) {
                const cats = Object.keys(s.technical);
                const scores = [];
                cats.forEach(cat => {
                    const arr = s.technical[cat];
                    if (Array.isArray(arr) && arr.length > 0) {
                        const last = arr[arr.length - 1];
                        const vals = Object.keys(last.data || {})
                            .map(k => last.data[k])
                            .filter(v => typeof v === 'number');
                        if (vals.length) scores.push(average(vals));
                    }
                });
                return scores.length ? average(scores) : 0;
            }
            return 0;
        },
        medicalAvailabilityAvg: (s) => {
            // new: medicalData: [{availability:0..3}]
            if (Array.isArray(s.medicalData) && s.medicalData.length > 0) {
                const vals = s.medicalData.map(m => Number(m.availability)).filter(isNumber);
                return vals.length ? average(vals) : 0;
            }
            return 0;
        },
        raceCount: (s) => {
            // new: raceData array
            if (Array.isArray(s.raceData)) return s.raceData.length;
            // old: performances array (times)
            if (Array.isArray(s.performances)) return s.performances.length;
            return 0;
        }
    };
}

// Graphiques par paramètre (équipe)
function renderTeamParameterCharts(team, swimmers, extract) {
    // ⚡ Détruire anciens graphiques pour éviter memory leaks
    ['wellbeingChart', 'trainingChart', 'vmaChart', 'medicalChart', 'raceChart', 'technicalChart'].forEach(id => {
        TeamChartRegistry.destroy(id);
    });
    
    // Bien-être: barres des moyennes par nageur
    const wbCtx = document.getElementById('wellbeingChart');
    if (wbCtx) {
        const labels = swimmers.map(s => s.name);
        const data = swimmers.map(s => extract.wellbeingAvg(s));
        const chart = new Chart(wbCtx, { type: 'bar', data: { labels, datasets: [{ label: 'Score /5', data, backgroundColor: '#1a73e8' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 5 }}}});
        TeamChartRegistry.register('wellbeingChart', chart);
    }

    // Entraînement: barres de charge moyenne
    const trCtx = document.getElementById('trainingChart');
    if (trCtx) {
        const labels = swimmers.map(s => s.name);
        const data = swimmers.map(s => extract.trainingLoadAvg(s));
        const chart = new Chart(trCtx, { type: 'bar', data: { labels, datasets: [{ label: 'Charge (moy.)', data, backgroundColor: '#9b59b6' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }}}});
        TeamChartRegistry.register('trainingChart', chart);
    }

    // VMA: barres
    const vmaCtx = document.getElementById('vmaChart');
    if (vmaCtx) {
        const labels = swimmers.map(s => s.name);
        const data = swimmers.map(s => extract.vmaLatest(s));
        const chart = new Chart(vmaCtx, { type: 'bar', data: { labels, datasets: [{ label: 'VMA (km/h)', data, backgroundColor: '#e74c3c' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }}}});
        TeamChartRegistry.register('vmaChart', chart);
    }

    // Médical: disponibilité /3
    const medCtx = document.getElementById('medicalChart');
    if (medCtx) {
        const labels = swimmers.map(s => s.name);
        const data = swimmers.map(s => extract.medicalAvailabilityAvg(s));
        const chart = new Chart(medCtx, { type: 'bar', data: { labels, datasets: [{ label: 'Disponibilité /3', data, backgroundColor: '#16a085' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 3 }}}});
        TeamChartRegistry.register('medicalChart', chart);
    }

    // Courses: nombre par nageur
    const raceCtx = document.getElementById('raceChart');
    if (raceCtx) {
        const labels = swimmers.map(s => s.name);
        const data = swimmers.map(s => extract.raceCount(s));
        const chart = new Chart(raceCtx, { type: 'bar', data: { labels, datasets: [{ label: 'Courses', data, backgroundColor: '#17a2b8' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }}}});
        TeamChartRegistry.register('raceChart', chart);
    }

    // Technique: moyenne par catégorie
    const techCtx = document.getElementById('technicalChart');
    if (techCtx) {
        // Regrouper par catégorie via calculateTeamStats
        const ts = calculateTeamStats(swimmers);
        if (ts.technical && ts.technical.length > 0) {
            const labels = ts.technical.map(t => t.category);
            const data = ts.technical.map(t => Number(t.avgScore?.toFixed ? t.avgScore.toFixed(2) : t.avgScore));
            new Chart(techCtx, { type: 'bar', data: { labels, datasets: [{ label: 'Score /10', data, backgroundColor: '#2c3e50' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 10 }}}});
        }
    }
}

function displayBulkEntrySection(team) {
    const container = document.getElementById('bulkEntrySection');
    if (!container) return;

    const grid = container.querySelector('.cards-grid');
    const noTeamMsg = document.getElementById('noTeamMessage');
    const swimmers = (team && team.swimmers && team.swimmers.length)
        ? getAllSwimmers().filter(s => team.swimmers.includes(s.id))
        : [];

    // Toujours afficher les cartes; gérer l'absence de nageurs au clic
    if (grid) grid.style.display = 'grid';
    if (noTeamMsg) noTeamMsg.style.display = 'none';

    const bulkButtons = container.querySelectorAll('.bulk-entry-btn');
    bulkButtons.forEach(btn => {
        btn.onclick = function() {
            if (!team || swimmers.length === 0) {
                alert("Cette équipe n'a pas de nageurs. Ajoutez des nageurs avant la saisie.");
                return;
            }
            const dataType = this.dataset.type;
            showBulkEntryModal(team, dataType);
        };
    });
}

window.updateBulkEntryFields = function() {
    const dataType = document.getElementById('bulkDataType').value;
    const container = document.getElementById('bulkEntryFields');
    
    if (!dataType) {
        container.innerHTML = '';
        return;
    }

    const team = getTeamById(currentTeamId);
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));

    if (dataType === 'performance') {
        container.innerHTML = `
            <div class="card" style="background-color: var(--light-color);">
                <h4>Configuration de la performance</h4>
                <div class="form-group">
                    <label>Distance (m):</label>
                    <select id="bulk_distance" class="form-control">
                        <option value="50">50m</option>
                        <option value="100">100m</option>
                        <option value="200">200m</option>
                        <option value="400">400m</option>
                        <option value="800">800m</option>
                        <option value="1500">1500m</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nage:</label>
                    <select id="bulk_stroke" class="form-control">
                        <option value="Nage Libre">Nage Libre</option>
                        <option value="Dos">Dos</option>
                        <option value="Brasse">Brasse</option>
                        <option value="Papillon">Papillon</option>
                        <option value="4 Nages">4 Nages</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date:</label>
                    <input type="date" id="bulk_date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h4>Saisir les temps pour chaque nageur</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nageur</th>
                            <th>Temps (MM:SS.MS)</th>
                            <th>Lieu</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${swimmers.map(swimmer => `
                            <tr>
                                <td><strong>${swimmer.name}</strong></td>
                                <td>
                                    <input type="text" 
                                           id="time_${swimmer.id}" 
                                           class="form-control" 
                                           placeholder="Ex: 01:23.45"
                                           style="max-width: 150px;">
                                </td>
                                <td>
                                    <input type="text" 
                                           id="location_${swimmer.id}" 
                                           class="form-control" 
                                           placeholder="Compétition/Entraînement"
                                           style="max-width: 200px;">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn btn-primary" onclick="window.saveBulkPerformances()" style="margin-top: 15px;">
                    <i class="fas fa-save"></i> Enregistrer toutes les performances
                </button>
            </div>
        `;
    } else if (dataType === 'technique') {
        container.innerHTML = `
            <div class="card" style="background-color: var(--light-color);">
                <h4>Évaluation technique simplifiée</h4>
                <div class="form-group">
                    <label>Catégorie technique:</label>
                    <select id="bulk_tech_category" class="form-control">
                        <option value="crawl">Crawl</option>
                        <option value="breaststroke">Brasse</option>
                        <option value="backstroke">Dos</option>
                        <option value="butterfly">Papillon</option>
                        <option value="medley">4 Nages</option>
                        <option value="startsAndTurns">Départs et Virages</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Score global (1-10):</label>
                    <p style="font-size: 0.9rem; color: #666;">Donnez un score général pour chaque nageur</p>
                </div>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h4>Noter chaque nageur</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nageur</th>
                            <th>Score (1-10)</th>
                            <th>Observations</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${swimmers.map(swimmer => `
                            <tr>
                                <td><strong>${swimmer.name}</strong></td>
                                <td>
                                    <input type="number" 
                                           id="tech_score_${swimmer.id}" 
                                           class="form-control" 
                                           min="1" max="10" step="0.1"
                                           placeholder="Score"
                                           style="max-width: 100px;">
                                </td>
                                <td>
                                    <input type="text" 
                                           id="tech_obs_${swimmer.id}" 
                                           class="form-control" 
                                           placeholder="Remarques..."
                                           style="max-width: 300px;">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn btn-primary" onclick="window.saveBulkTechnical()" style="margin-top: 15px;">
                    <i class="fas fa-save"></i> Enregistrer toutes les évaluations
                </button>
            </div>
        `;
    } else if (dataType === 'vma') {
        container.innerHTML = `
            <div class="card" style="background-color: var(--light-color);">
                <h4>Test VMA</h4>
                <div class="form-group">
                    <label>Date du test:</label>
                    <input type="date" id="bulk_vma_date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h4>Résultats VMA (km/h)</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nageur</th>
                            <th>VMA (km/h)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${swimmers.map(swimmer => `
                            <tr>
                                <td><strong>${swimmer.name}</strong></td>
                                <td>
                                    <input type="number" 
                                           id="vma_${swimmer.id}" 
                                           class="form-control" 
                                           min="5" max="25" step="0.1"
                                           placeholder="Ex: 14.5"
                                           style="max-width: 120px;">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn btn-primary" onclick="window.saveBulkVMA()" style="margin-top: 15px;">
                    <i class="fas fa-save"></i> Enregistrer tous les résultats VMA
                </button>
            </div>
        `;
    } else if (dataType === 'wellbeing') {
        container.innerHTML = `
            <div class="card" style="background-color: var(--light-color);">
                <h4>Bien-être de l'équipe</h4>
                <div class="form-group">
                    <label>Date:</label>
                    <input type="date" id="bulk_wellbeing_date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <p style="font-size: 0.9rem; color: #666;">Évaluez chaque critère de 1 à 10 pour chaque nageur</p>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h4>Évaluation du bien-être</h4>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nageur</th>
                                <th>Sommeil</th>
                                <th>Fatigue</th>
                                <th>Stress</th>
                                <th>Motivation</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${swimmers.map(swimmer => `
                                <tr>
                                    <td><strong>${swimmer.name}</strong></td>
                                    <td><input type="number" id="sleep_${swimmer.id}" class="form-control" min="1" max="10" placeholder="1-10" style="width: 70px;"></td>
                                    <td><input type="number" id="fatigue_${swimmer.id}" class="form-control" min="1" max="10" placeholder="1-10" style="width: 70px;"></td>
                                    <td><input type="number" id="stress_${swimmer.id}" class="form-control" min="1" max="10" placeholder="1-10" style="width: 70px;"></td>
                                    <td><input type="number" id="motivation_${swimmer.id}" class="form-control" min="1" max="10" placeholder="1-10" style="width: 70px;"></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <button class="btn btn-primary" onclick="window.saveBulkWellbeing()" style="margin-top: 15px;">
                    <i class="fas fa-save"></i> Enregistrer tous les états de bien-être
                </button>
            </div>
        `;
    }
};

// =====================================================
// MODAL DE SAISIE GROUPÉE AVANCÉE
// =====================================================

function showBulkEntryModal(team, dataType) {
    const modal = document.getElementById('bulkEntryModal');
    const title = document.getElementById('bulkEntryModalTitle');
    const subtitle = document.getElementById('bulkEntryModalSubtitle');
    const dateInput = document.getElementById('bulkEntryDate');
    const formContainer = document.getElementById('bulkEntryForm');
    const saveBtn = document.getElementById('saveBulkEntryBtn');
    
    // Définir la date par défaut
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Titres selon le type
    const titles = {
        'wellbeing': {title: '😊 Saisie Groupée - Bien-être', subtitle: 'Saisir sommeil, fatigue, douleur et stress pour toute l\'équipe'},
        'training': {title: '📊 Saisie Groupée - Entraînement', subtitle: 'Saisir volume, RPE et charge pour toute l\'équipe'},
        'performance': {title: '💪 Saisie Groupée - Performance', subtitle: 'Saisir VMA, force et puissance pour toute l\'équipe'},
        'medical': {title: '🏥 Saisie Groupée - Statut Médical', subtitle: 'Saisir disponibilité et problèmes de santé pour toute l\'équipe'},
        'race': {title: '🏊‍♂️ Saisie Groupée - Performances de Course', subtitle: 'Enregistrer les temps de course pour toute l\'équipe'},
        'technical': {title: '🎯 Saisie Groupée - Suivi Technique', subtitle: 'Évaluer les aspects techniques pour toute l\'équipe'}
    };
    
    title.textContent = titles[dataType].title;
    subtitle.textContent = titles[dataType].subtitle;
    
    // Générer le formulaire selon le type
    formContainer.innerHTML = generateBulkForm(team, dataType);
    
    // Configurer le bouton de sauvegarde
    saveBtn.onclick = () => {
        console.log('🔵 Bouton Enregistrer tout cliqué !', {team, dataType});
        saveBulkData(team, dataType);
    };
    
    console.log('✅ Modal configuré, bouton assigné:', saveBtn);
    
    // Afficher le modal
    modal.style.display = 'block';
}

function generateBulkForm(team, dataType) {
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    if (swimmers.length === 0) {
        return '<p style="color: #999;">Aucun nageur dans cette équipe.</p>';
    }
    
    switch(dataType) {
        case 'wellbeing':
            return generateWellbeingForm(swimmers);
        case 'training':
            return generateTrainingForm(swimmers);
        case 'performance':
            return generatePerformanceForm(swimmers);
        case 'medical':
            return generateMedicalForm(swimmers);
        case 'race':
            return generateRaceForm(swimmers);
        case 'technical':
            return generateTechnicalForm(swimmers);
        default:
            return '<p>Type de formulaire inconnu.</p>';
    }
}

function generateWellbeingForm(swimmers) {
    return `
        <table class="data-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="min-width: 150px;">Nageur</th>
                    <th>Sommeil (1-5)</th>
                    <th>Fatigue (1-5)</th>
                    <th>Douleur (1-5)</th>
                    <th>Stress (1-5)</th>
                    <th style="background-color: #e8f0fe;">Score</th>
                </tr>
            </thead>
            <tbody>
                ${swimmers.map(swimmer => `
                    <tr>
                        <td><strong>${swimmer.name}</strong></td>
                        <td>
                            <input type="number" id="sleep_${swimmer.id}" 
                                   class="form-control wellbeing-input" data-swimmer-id="${swimmer.id}"
                                   min="1" max="5" placeholder="1-5" oninput="calculateBulkWellbeingScore('${swimmer.id}')">
                        </td>
                        <td>
                            <input type="number" id="fatigue_${swimmer.id}" 
                                   class="form-control wellbeing-input" data-swimmer-id="${swimmer.id}"
                                   min="1" max="5" placeholder="1-5" oninput="calculateBulkWellbeingScore('${swimmer.id}')">
                        </td>
                        <td>
                            <input type="number" id="pain_${swimmer.id}" 
                                   class="form-control wellbeing-input" data-swimmer-id="${swimmer.id}"
                                   min="1" max="5" placeholder="1-5" oninput="calculateBulkWellbeingScore('${swimmer.id}')">
                        </td>
                        <td>
                            <input type="number" id="stress_${swimmer.id}" 
                                   class="form-control wellbeing-input" data-swimmer-id="${swimmer.id}"
                                   min="1" max="5" placeholder="1-5" oninput="calculateBulkWellbeingScore('${swimmer.id}')">
                        </td>
                        <td style="background-color: #f8f9fa;">
                            <input type="number" id="score_${swimmer.id}" 
                                   class="form-control" readonly 
                                   style="background-color: #e8f0fe; font-weight: bold; text-align: center;" placeholder="Auto">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 10px; padding: 10px; background: #e8f0fe; border-radius: 5px;">
            <small><strong>💡 Échelle :</strong> 1 = Très mauvais, 2 = Mauvais, 3 = Moyen, 4 = Bon, 5 = Excellent</small>
        </div>
    `;
}

function generateTrainingForm(swimmers) {
    // Générer le HTML
    const html = `
        <table class="data-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="min-width: 150px;">Nageur</th>
                    <th>Volume (min)</th>
                    <th>Volume (m)</th>
                    <th>RPE (1-10)</th>
                    <th>Charge (auto)</th>
                </tr>
            </thead>
            <tbody>
                ${swimmers.map(swimmer => `
                    <tr>
                        <td><strong>${swimmer.name}</strong></td>
                        <td>
                            <input type="number" id="volume_${swimmer.id}" 
                                   class="form-control bulk-volume" data-swimmer="${swimmer.id}"
                                   min="0" placeholder="Ex: 90">
                        </td>
                        <td>
                            <input type="number" id="volumeMeters_${swimmer.id}" 
                                   class="form-control" min="0" step="100" placeholder="Ex: 3000">
                        </td>
                        <td>
                            <input type="number" id="rpe_${swimmer.id}" 
                                   class="form-control bulk-rpe" data-swimmer="${swimmer.id}"
                                   min="1" max="10" placeholder="1-10">
                        </td>
                        <td>
                            <span id="load_${swimmer.id}" class="badge" style="background: #007bff; font-size: 1rem;">0</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 10px; padding: 10px; background: #e8f0fe; border-radius: 5px;">
            <small><strong>💡 Charge d'entraînement :</strong> Calculée automatiquement (Volume en minutes × RPE)</small>
        </div>
    `;
    
    // Ajouter les événements après l'insertion dans le DOM
    setTimeout(() => {
        document.querySelectorAll('.bulk-volume, .bulk-rpe').forEach(input => {
            input.addEventListener('input', function() {
                const swimmerId = this.dataset.swimmer;
                const volume = document.getElementById('volume_' + swimmerId)?.value || 0;
                const rpe = document.getElementById('rpe_' + swimmerId)?.value || 0;
                const load = volume * rpe;
                const loadElement = document.getElementById('load_' + swimmerId);
                if (loadElement) {
                    loadElement.textContent = load;
                }
            });
        });
    }, 100);
    
    return html;
}

function generatePerformanceForm(swimmers) {
    return `
        <table class="data-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="min-width: 150px;">Nageur</th>
                    <th>VMA (km/h)</th>
                    <th>Force Épaule (min)</th>
                    <th>Force Pectoraux (min)</th>
                    <th>Force Jambes (min)</th>
                </tr>
            </thead>
            <tbody>
                ${swimmers.map(swimmer => `
                    <tr>
                        <td><strong>${swimmer.name}</strong></td>
                        <td>
                            <input type="number" id="vma_${swimmer.id}" 
                                   class="form-control" min="0" step="0.1" placeholder="Ex: 14.5">
                        </td>
                        <td>
                            <input type="number" id="shoulder_${swimmer.id}" 
                                   class="form-control" min="0" step="0.1" placeholder="Ex: 3.5">
                        </td>
                        <td>
                            <input type="number" id="chest_${swimmer.id}" 
                                   class="form-control" min="0" step="0.1" placeholder="Ex: 2.8">
                        </td>
                        <td>
                            <input type="number" id="legs_${swimmer.id}" 
                                   class="form-control" min="0" step="0.1" placeholder="Ex: 4.2">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 10px; padding: 10px; background: #e8f0fe; border-radius: 5px;">
            <small><strong>💡 VMA :</strong> Vitesse Maximale Aérobie en km/h</small><br>
            <small><strong>💡 Force :</strong> Temps de maintien en minutes</small>
        </div>
    `;
}

function generateMedicalForm(swimmers) {
    return `
        <table class="data-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="min-width: 150px;">Nageur</th>
                    <th>Disponibilité (0-3)</th>
                    <th>Maladies</th>
                    <th>Blessures</th>
                    <th>Autres</th>
                </tr>
            </thead>
            <tbody>
                ${swimmers.map(swimmer => `
                    <tr>
                        <td><strong>${swimmer.name}</strong></td>
                        <td>
                            <select id="availability_${swimmer.id}" class="form-control">
                                <option value="3">3 - Pleinement disponible</option>
                                <option value="2">2 - Disponible avec limitations</option>
                                <option value="1">1 - Partiellement indisponible</option>
                                <option value="0">0 - Totalement indisponible</option>
                            </select>
                        </td>
                        <td>
                            <input type="number" id="illnesses_${swimmer.id}" 
                                   class="form-control" min="0" value="0">
                        </td>
                        <td>
                            <input type="number" id="injuries_${swimmer.id}" 
                                   class="form-control" min="0" value="0">
                        </td>
                        <td>
                            <input type="number" id="other_${swimmer.id}" 
                                   class="form-control" min="0" value="0">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateRaceForm(swimmers) {
    return `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div class="form-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label><strong>Distance (m) :</strong></label>
                    <select id="bulk_race_distance" class="form-control">
                        <option value="50">50m</option>
                        <option value="100">100m</option>
                        <option value="200">200m</option>
                        <option value="400">400m</option>
                        <option value="800">800m</option>
                        <option value="1500">1500m</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><strong>Nage :</strong></label>
                    <select id="bulk_race_stroke" class="form-control">
                        <option value="Nage Libre">Nage Libre</option>
                        <option value="Dos">Dos</option>
                        <option value="Brasse">Brasse</option>
                        <option value="Papillon">Papillon</option>
                        <option value="4 Nages">4 Nages</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><strong>Événement :</strong></label>
                    <input type="text" id="bulk_race_event" class="form-control" placeholder="Ex: Compétition régionale">
                </div>
            </div>
        </div>
        
        <table class="data-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="min-width: 150px;">Nageur</th>
                    <th>Temps</th>
                    <th>Lieu</th>
                </tr>
            </thead>
            <tbody>
                ${swimmers.map(swimmer => `
                    <tr>
                        <td><strong>${swimmer.name}</strong></td>
                        <td>
                            <input type="text" id="race_time_${swimmer.id}" 
                                   class="form-control" placeholder="MM:SS.MS ou MM:SS:MS">
                        </td>
                        <td>
                            <input type="text" id="race_location_${swimmer.id}" 
                                   class="form-control" placeholder="Piscine / Compétition">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 10px; padding: 10px; background: #e8f0fe; border-radius: 5px;">
            <small><strong>💡 Format du temps :</strong></small><br>
            <small>• 50m, 100m, 200m : <strong>SS:MS</strong> (ex: 26:50 pour 26s 50 centièmes)</small><br>
            <small>• 400m, 800m, 1500m : <strong>MM:SS:MS</strong> (ex: 10:45:35)</small>
        </div>
    `;
}

function generateTechnicalForm(swimmers) {
    return `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div class="form-group">
                <label><strong>Catégorie technique :</strong></label>
                <select id="bulk_tech_category" class="form-control">
                    <option value="crawl">Crawl (Nage Libre)</option>
                    <option value="breaststroke">Brasse</option>
                    <option value="backstroke">Dos</option>
                    <option value="butterfly">Papillon</option>
                    <option value="medley">4 Nages</option>
                    <option value="startsAndTurns">Départs et Virages</option>
                </select>
            </div>
        </div>
        
        <table class="data-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="min-width: 150px;">Nageur</th>
                    <th>Score Global (1-10)</th>
                    <th>Observations</th>
                </tr>
            </thead>
            <tbody>
                ${swimmers.map(swimmer => `
                    <tr>
                        <td><strong>${swimmer.name}</strong></td>
                        <td>
                            <input type="number" id="tech_score_${swimmer.id}" 
                                   class="form-control" min="1" max="10" step="0.1" placeholder="1-10">
                        </td>
                        <td>
                            <input type="text" id="tech_obs_${swimmer.id}" 
                                   class="form-control" placeholder="Remarques...">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 10px; padding: 10px; background: #e8f0fe; border-radius: 5px;">
            <small><strong>💡 Échelle :</strong> 1 = Très faible, 5 = Moyen, 10 = Excellent</small>
        </div>
    `;
}

// Calculer le score de bien-être pour un nageur dans le formulaire équipe
window.calculateBulkWellbeingScore = function(swimmerId) {
    const sleep = parseFloat(document.getElementById(`sleep_${swimmerId}`)?.value) || 0;
    const fatigue = parseFloat(document.getElementById(`fatigue_${swimmerId}`)?.value) || 0;
    const pain = parseFloat(document.getElementById(`pain_${swimmerId}`)?.value) || 0;
    const stress = parseFloat(document.getElementById(`stress_${swimmerId}`)?.value) || 0;
    
    const scoreInput = document.getElementById(`score_${swimmerId}`);
    if (scoreInput) {
        if (sleep > 0 && fatigue > 0 && pain > 0 && stress > 0) {
            const score = ((sleep + fatigue + pain + stress) / 4).toFixed(2);
            scoreInput.value = score;
        } else {
            scoreInput.value = '';
        }
    }
};

window.closeBulkEntryModal = function() {
    document.getElementById('bulkEntryModal').style.display = 'none';
};

function saveBulkData(team, dataType) {
    console.log('🟢 saveBulkData appelée', {team, dataType});
    const date = document.getElementById('bulkEntryDate').value;
    console.log('📅 Date sélectionnée:', date);
    if (!date) {
        alert('Veuillez sélectionner une date.');
        return;
    }
    
    switch(dataType) {
        case 'wellbeing':
            saveBulkWellbeing(team, date);
            break;
        case 'training':
            saveBulkTraining(team, date);
            break;
        case 'performance':
            saveBulkPerformanceTests(team, date);
            break;
        case 'medical':
            saveBulkMedical(team, date);
            break;
        case 'race':
            saveBulkRace(team, date);
            break;
        case 'technical':
            saveBulkTechnicalEval(team, date);
            break;
    }
}

function saveBulkWellbeing(team, date) {
    console.log('🔍 saveBulkWellbeing appelée', {team, date});
    const swimmers = getAllSwimmers();
    let savedCount = 0;
    
    team.swimmers.forEach(swimmerId => {
        const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
        if (swimmerIndex === -1) {
            console.log('⚠️ Nageur non trouvé:', swimmerId);
            return;
        }
        
        const sleepElement = document.getElementById(`sleep_${swimmerId}`);
        const fatigueElement = document.getElementById(`fatigue_${swimmerId}`);
        const painElement = document.getElementById(`pain_${swimmerId}`);
        const stressElement = document.getElementById(`stress_${swimmerId}`);
        
        console.log(`📋 Nageur ${swimmers[swimmerIndex].name} (${swimmerId}):`, {
            sleepElement,
            sleep: sleepElement?.value,
            fatigue: fatigueElement?.value,
            pain: painElement?.value,
            stress: stressElement?.value
        });
        
        const sleep = sleepElement?.value;
        const fatigue = fatigueElement?.value;
        const pain = painElement?.value;
        const stress = stressElement?.value;
        
        // Vérifier si au moins un champ est rempli (pas tous obligatoires)
        if (sleep || fatigue || pain || stress) {
            if (!swimmers[swimmerIndex].wellbeingData) {
                swimmers[swimmerIndex].wellbeingData = [];
            }
            
            const sleepVal = sleep ? parseInt(sleep) : 0;
            const fatigueVal = fatigue ? parseInt(fatigue) : 0;
            const painVal = pain ? parseInt(pain) : 0;
            const stressVal = stress ? parseInt(stress) : 0;
            const score = ((sleepVal + fatigueVal + painVal + stressVal) / 4).toFixed(2);
            
            swimmers[swimmerIndex].wellbeingData.push({
                date: date,
                sleep: sleepVal,
                fatigue: fatigueVal,
                pain: painVal,
                stress: stressVal,
                score: parseFloat(score)
            });
            savedCount++;
            console.log(`✅ Données enregistrées pour ${swimmers[swimmerIndex].name}`, {sleep: sleepVal, fatigue: fatigueVal, pain: painVal, stress: stressVal, score});
        }
    });
    
    console.log(`📊 Total enregistré: ${savedCount} nageur(s)`);
    
    if (savedCount > 0) {
        saveSwimmers(swimmers);
        alert(`✅ Bien-être enregistré pour ${savedCount} nageur(s) !`);
        closeBulkEntryModal();
        if (currentTeamId) selectTeam(currentTeamId);
    } else {
        alert('⚠️ Aucune donnée à enregistrer. Veuillez remplir au moins un champ pour un nageur.');
    }
}

function saveBulkTraining(team, date) {
    const swimmers = getAllSwimmers();
    let savedCount = 0;
    
    team.swimmers.forEach(swimmerId => {
        const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
        if (swimmerIndex === -1) return;
        
        const volume = document.getElementById(`volume_${swimmerId}`)?.value;
        const volumeMeters = document.getElementById(`volumeMeters_${swimmerId}`)?.value;
        const rpe = document.getElementById(`rpe_${swimmerId}`)?.value;
        
        if (volume && rpe) {
            if (!swimmers[swimmerIndex].trainingData) {
                swimmers[swimmerIndex].trainingData = [];
            }
            
            const load = parseInt(volume) * parseInt(rpe);
            swimmers[swimmerIndex].trainingData.push({
                date: date,
                volume: parseInt(volume),
                volumeMeters: parseInt(volumeMeters || 0),
                rpe: parseInt(rpe),
                load: load
            });
            savedCount++;
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(swimmers);
        alert(`✅ Entraînement enregistré pour ${savedCount} nageur(s) !`);
        closeBulkEntryModal();
        if (currentTeamId) selectTeam(currentTeamId);
    } else {
        alert('⚠️ Aucune donnée à enregistrer. Veuillez remplir au moins un nageur.');
    }
}

function saveBulkPerformanceTests(team, date) {
    const swimmers = getAllSwimmers();
    let savedCount = 0;
    
    team.swimmers.forEach(swimmerId => {
        const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
        if (swimmerIndex === -1) return;
        
        const vma = document.getElementById(`vma_${swimmerId}`)?.value;
        const shoulder = document.getElementById(`shoulder_${swimmerId}`)?.value;
        const chest = document.getElementById(`chest_${swimmerId}`)?.value;
        const legs = document.getElementById(`legs_${swimmerId}`)?.value;
        
        if (vma || shoulder || chest || legs) {
            if (!swimmers[swimmerIndex].performanceData) {
                swimmers[swimmerIndex].performanceData = [];
            }
            
            swimmers[swimmerIndex].performanceData.push({
                date: date,
                vma: parseFloat(vma || 0),
                shoulderStrength: parseFloat(shoulder || 0),
                chestStrength: parseFloat(chest || 0),
                legStrength: parseFloat(legs || 0)
            });
            savedCount++;
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(swimmers);
        alert(`✅ Tests de performance enregistrés pour ${savedCount} nageur(s) !`);
        closeBulkEntryModal();
        if (currentTeamId) selectTeam(currentTeamId);
    } else {
        alert('⚠️ Aucune donnée à enregistrer. Veuillez remplir au moins un nageur.');
    }
}

function saveBulkMedical(team, date) {
    const swimmers = getAllSwimmers();
    let savedCount = 0;
    
    team.swimmers.forEach(swimmerId => {
        const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
        if (swimmerIndex === -1) return;
        
        const availability = document.getElementById(`availability_${swimmerId}`)?.value;
        const illnesses = document.getElementById(`illnesses_${swimmerId}`)?.value;
        const injuries = document.getElementById(`injuries_${swimmerId}`)?.value;
        const other = document.getElementById(`other_${swimmerId}`)?.value;
        
        if (availability !== undefined) {
            if (!swimmers[swimmerIndex].medicalData) {
                swimmers[swimmerIndex].medicalData = [];
            }
            
            swimmers[swimmerIndex].medicalData.push({
                date: date,
                availability: parseInt(availability),
                illnesses: parseInt(illnesses || 0),
                injuries: parseInt(injuries || 0),
                otherIssues: parseInt(other || 0)
            });
            savedCount++;
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(swimmers);
        alert(`✅ Statut médical enregistré pour ${savedCount} nageur(s) !`);
        closeBulkEntryModal();
        if (currentTeamId) selectTeam(currentTeamId);
    } else {
        alert('⚠️ Aucune donnée à enregistrer.');
    }
}

function saveBulkRace(team, date) {
    const distance = document.getElementById('bulk_race_distance')?.value;
    const stroke = document.getElementById('bulk_race_stroke')?.value;
    const event = document.getElementById('bulk_race_event')?.value || 'Non spécifié';
    
    if (!distance || !stroke) {
        alert('⚠️ Veuillez sélectionner une distance et une nage.');
        return;
    }
    
    const swimmers = getAllSwimmers();
    let savedCount = 0;
    
    team.swimmers.forEach(swimmerId => {
        const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
        if (swimmerIndex === -1) return;
        
        const time = document.getElementById(`race_time_${swimmerId}`)?.value;
        const location = document.getElementById(`race_location_${swimmerId}`)?.value;
        
        if (time && time.trim()) {
            if (!swimmers[swimmerIndex].raceData) {
                swimmers[swimmerIndex].raceData = [];
            }
            
            // Utiliser la nouvelle structure raceData
            swimmers[swimmerIndex].raceData.push({
                date: date,
                event: event,
                races: [{
                    distance: distance,
                    style: stroke,
                    time: time.trim()
                }]
            });
            savedCount++;
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(swimmers);
        alert(`✅ ${savedCount} performance(s) de course enregistrée(s) !`);
        closeBulkEntryModal();
        if (currentTeamId) selectTeam(currentTeamId);
    } else {
        alert('⚠️ Aucune performance à enregistrer. Veuillez saisir au moins un temps.');
    }
}

function saveBulkTechnicalEval(team, date) {
    const category = document.getElementById('bulk_tech_category')?.value;
    
    if (!category) {
        alert('⚠️ Veuillez sélectionner une catégorie technique.');
        return;
    }
    
    const swimmers = getAllSwimmers();
    let savedCount = 0;
    
    team.swimmers.forEach(swimmerId => {
        const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
        if (swimmerIndex === -1) return;
        
        const score = document.getElementById(`tech_score_${swimmerId}`)?.value;
        const obs = document.getElementById(`tech_obs_${swimmerId}`)?.value;
        
        if (score) {
            if (!swimmers[swimmerIndex].technical) {
                swimmers[swimmerIndex].technical = [];
            }
            
            swimmers[swimmerIndex].technical.push({
                date: date,
                category: category,
                score: parseFloat(score),
                observations: obs || ''
            });
            savedCount++;
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(swimmers);
        alert(`✅ Évaluation technique enregistrée pour ${savedCount} nageur(s) !`);
        closeBulkEntryModal();
        if (currentTeamId) selectTeam(currentTeamId);
    } else {
        alert('⚠️ Aucune donnée à enregistrer. Veuillez noter au moins un nageur.');
    }
}

// Sauvegarder performances en masse
window.saveBulkPerformances = function() {
    const team = getTeamById(currentTeamId);
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    const distance = document.getElementById('bulk_distance').value;
    const stroke = document.getElementById('bulk_stroke').value;
    const date = document.getElementById('bulk_date').value;
    
    let savedCount = 0;
    const allSwimmers = getAllSwimmers();
    
    swimmers.forEach(swimmer => {
        const timeInput = document.getElementById(`time_${swimmer.id}`);
        const locationInput = document.getElementById(`location_${swimmer.id}`);
        
        if (timeInput && timeInput.value.trim()) {
            const swimmerIndex = allSwimmers.findIndex(s => s.id === swimmer.id);
            if (swimmerIndex !== -1) {
                if (!allSwimmers[swimmerIndex].performances) {
                    allSwimmers[swimmerIndex].performances = [];
                }
                
                allSwimmers[swimmerIndex].performances.push({
                    date: date,
                    distance: distance,
                    stroke: stroke,
                    time: timeInput.value.trim(),
                    location: locationInput.value.trim() || 'Non spécifié'
                });
                savedCount++;
            }
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(allSwimmers);
        alert(`${savedCount} performance(s) enregistrée(s) avec succès !`);
        selectTeam(currentTeamId); // Rafraîchir les stats
    } else {
        alert('Aucune performance à enregistrer. Veuillez saisir au moins un temps.');
    }
};

// Sauvegarder évaluations techniques en masse
window.saveBulkTechnical = function() {
    const team = getTeamById(currentTeamId);
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    const category = document.getElementById('bulk_tech_category').value;
    
    let savedCount = 0;
    const allSwimmers = getAllSwimmers();
    
    swimmers.forEach(swimmer => {
        const scoreInput = document.getElementById(`tech_score_${swimmer.id}`);
        const obsInput = document.getElementById(`tech_obs_${swimmer.id}`);
        
        if (scoreInput && scoreInput.value) {
            const swimmerIndex = allSwimmers.findIndex(s => s.id === swimmer.id);
            if (swimmerIndex !== -1) {
                if (!allSwimmers[swimmerIndex].technical) {
                    allSwimmers[swimmerIndex].technical = {};
                }
                if (!allSwimmers[swimmerIndex].technical[category]) {
                    allSwimmers[swimmerIndex].technical[category] = [];
                }
                
                allSwimmers[swimmerIndex].technical[category].push({
                    date: new Date().toISOString().split('T')[0],
                    data: {
                        scoreGlobal: parseFloat(scoreInput.value),
                        observations: obsInput.value.trim() || ''
                    }
                });
                savedCount++;
            }
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(allSwimmers);
        alert(`${savedCount} évaluation(s) technique(s) enregistrée(s) avec succès !`);
        selectTeam(currentTeamId);
    } else {
        alert('Aucune évaluation à enregistrer. Veuillez saisir au moins un score.');
    }
};

// Sauvegarder VMA en masse
window.saveBulkVMA = function() {
    const team = getTeamById(currentTeamId);
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    const date = document.getElementById('bulk_vma_date').value;
    
    let savedCount = 0;
    const allSwimmers = getAllSwimmers();
    
    swimmers.forEach(swimmer => {
        const vmaInput = document.getElementById(`vma_${swimmer.id}`);
        
        if (vmaInput && vmaInput.value) {
            const swimmerIndex = allSwimmers.findIndex(s => s.id === swimmer.id);
            if (swimmerIndex !== -1) {
                if (!allSwimmers[swimmerIndex].vma) {
                    allSwimmers[swimmerIndex].vma = [];
                }
                
                allSwimmers[swimmerIndex].vma.push({
                    date: date,
                    value: parseFloat(vmaInput.value)
                });
                savedCount++;
            }
        }
    });
    
    if (savedCount > 0) {
        saveSwimmers(allSwimmers);
        alert(`${savedCount} résultat(s) VMA enregistré(s) avec succès !`);
        selectTeam(currentTeamId);
    } else {
        alert('Aucun résultat à enregistrer. Veuillez saisir au moins une valeur VMA.');
    }
};

// Note: La fonction saveBulkWellbeing() est définie plus haut et appelée par saveBulkData()

window.startBulkEntry = function() {
    updateBulkEntryFields();
};

// =====================================================
// 7. EXPORT PDF (PLACEHOLDER)
// =====================================================

window.exportTeamPDF = function() {
    if (!currentTeamId) {
        alert('Veuillez sélectionner une équipe d\'abord.');
        return;
    }
    
    const team = getTeamById(currentTeamId);
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    if (typeof jsPDF === 'undefined') {
        alert('Bibliothèque PDF non chargée. Veuillez rafraîchir la page.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = 20;

    // Page de garde
    doc.setFontSize(24);
    doc.setTextColor(26, 115, 232);
    doc.text(`Rapport d'Équipe`, 105, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(team.name, 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, yPos, { align: 'center' });
    
    yPos += 20;
    
    // Informations générales
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Informations Générales', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`Catégorie: ${team.category}`, 20, yPos);
    yPos += 8;
    doc.text(`Nombre de nageurs: ${swimmers.length}`, 20, yPos);
    yPos += 8;
    doc.text(`Description: ${team.description || 'N/A'}`, 20, yPos);
    yPos += 15;
    
    // Statistiques
    const stats = calculateTeamStats(swimmers);
    doc.setFontSize(16);
    doc.text('Statistiques', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`Âge moyen: ${stats.avgAge} ans`, 20, yPos);
    yPos += 8;
    
    if (stats.physical.vmaAvg > 0) {
        doc.text(`VMA moyenne: ${stats.physical.vmaAvg.toFixed(1)} km/h`, 20, yPos);
        yPos += 8;
    }
    
    if (stats.physical.wellbeingAvg > 0) {
        doc.text(`Bien-être moyen: ${stats.physical.wellbeingAvg.toFixed(1)}/10`, 20, yPos);
        yPos += 8;
    }
    
    // Liste des nageurs
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    yPos += 10;
    doc.setFontSize(16);
    doc.text('Liste des Nageurs', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    swimmers.forEach((swimmer, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(`${index + 1}. ${swimmer.name} - ${swimmer.age} ans - ${swimmer.specialty || 'N/A'}`, 20, yPos);
        yPos += 7;
    });
    
    // Forces et faiblesses
    if (stats.strengths.length > 0 || stats.weaknesses.length > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        yPos += 10;
        doc.setFontSize(16);
        doc.text('Analyse', 20, yPos);
        yPos += 10;
        
        if (stats.strengths.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(52, 168, 83);
            doc.text('Forces:', 20, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            stats.strengths.forEach(s => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`• ${s.name}: ${s.value}`, 25, yPos);
                yPos += 7;
            });
        }
        
        if (stats.weaknesses.length > 0) {
            yPos += 5;
            doc.setFontSize(14);
            doc.setTextColor(251, 188, 5);
            doc.text('Points à améliorer:', 20, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            stats.weaknesses.forEach(w => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`• ${w.name}: ${w.value}`, 25, yPos);
                yPos += 7;
            });
        }
    }
    
    // Footer sur chaque page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Suivi des Nageurs - ${team.name}`, 20, 285);
        doc.text(`Page ${i} / ${pageCount}`, 190, 285, { align: 'right' });
    }
    
    // Télécharger
    doc.save(`Rapport_Equipe_${team.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    alert('Rapport PDF généré avec succès !');
};

// Export Excel (simulé)
window.exportTeamExcel = function() {
    if (!currentTeamId) {
        alert('Veuillez sélectionner une équipe d\'abord.');
        return;
    }
    
    const team = getTeamById(currentTeamId);
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    // Créer CSV
    let csv = 'Nom,Âge,Genre,Spécialité,Date d\'inscription\n';
    swimmers.forEach(swimmer => {
        csv += `${swimmer.name},${swimmer.age},${swimmer.gender || 'N/A'},${swimmer.specialty || 'N/A'},${swimmer.joinDate || 'N/A'}\n`;
    });
    
    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Equipe_${team.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    alert('Export CSV généré avec succès !');
};

// Fermer modals en cliquant en dehors
window.onclick = function(event) {
    const teamModal = document.getElementById('teamModal');
    const swimmersModal = document.getElementById('swimmersModal');
    const bulkModal = document.getElementById('bulkEntryModal');
    
    if (event.target === teamModal) {
        closeTeamModal();
    }
    if (event.target === swimmersModal) {
        closeSwimmersModal();
    }
    if (event.target === bulkModal) {
        closeBulkEntryModal();
    }
};

window.closeBulkEntryModal = function() {
    document.getElementById('bulkEntryModal').style.display = 'none';
};

// =====================================================
// 10. SÉLECTEUR D'ÉQUIPE GLOBAL
// =====================================================

function loadTeamSelector() {
    const selector = document.getElementById('teamSelector');
    const saisieSelector = document.getElementById('saisieTeamSelector');
    
    const teams = getTeams();
    const optionsHTML = '<option value="">-- Sélectionnez une équipe --</option>' +
        teams.map(team => `<option value="${team.id}">${team.name} (${team.swimmers.length} nageurs)</option>`).join('');
    
    if (selector) {
        selector.innerHTML = optionsHTML;
    }
    
    if (saisieSelector) {
        saisieSelector.innerHTML = optionsHTML;
    }
}

// Charger le sélecteur global
function loadGlobalTeamSelector() {
    const globalSelector = document.getElementById('globalTeamSelector');
    if (!globalSelector) return;
    
    const teams = getTeams();
    const optionsHTML = '<option value="">-- Aucune équipe sélectionnée --</option>' +
        teams.map(team => `<option value="${team.id}">${team.name} (${team.swimmers.length} nageurs)</option>`).join('');
    
    globalSelector.innerHTML = optionsHTML;
    
    // Charger aussi les anciens sélecteurs pour la rétrocompatibilité
    loadTeamSelector();
}

window.onTeamSelect = function() {
    const selector = document.getElementById('teamSelector');
    const teamId = selector.value;
    
    if (teamId) {
        currentTeamId = teamId;
        const team = getTeamById(teamId);
        if (team) {
            // Mettre à jour toutes les sections
            displayTeamStats(team);
            displayBulkEntrySection(team);
            displayAnalysisSection(team);
            displayRecommendationsSection(team);
            displayComparisonsSection(team);
            displayCalendarSection(team);
            displayAttendanceForm(team);
            displayAttendanceStats(team);
            displayAttendanceCharts(team);
            updateCalendarWithAttendance(team);
            
            // Afficher détails dans gestion
            selectTeam(teamId);
        }
    }
};

// Fonction spécifique pour le sélecteur de la section Saisie
window.onSaisieTeamSelect = function() {
    const selector = document.getElementById('saisieTeamSelector');
    const teamId = selector.value;
    
    const attendanceSection = document.getElementById('attendanceEntrySection');
    const bulkSection = document.getElementById('bulkEntrySection');
    
    if (teamId) {
        currentTeamId = teamId;
        const team = getTeamById(teamId);
        
        if (team) {
            // Afficher les sections de saisie
            if (attendanceSection) attendanceSection.style.display = 'block';
            if (bulkSection) bulkSection.style.display = 'block';
            
            // Charger le formulaire de présence
            displayAttendanceForm(team);
            
            // Activer les boutons de saisie groupée
            displayBulkEntrySection(team);
            
            // Synchroniser avec le sélecteur principal
            const mainSelector = document.getElementById('teamSelector');
            if (mainSelector) mainSelector.value = teamId;
        }
    } else {
        // Masquer les sections si aucune équipe n'est sélectionnée
        if (attendanceSection) attendanceSection.style.display = 'none';
        if (bulkSection) bulkSection.style.display = 'none';
    }
};

// =====================================================
// 11. SECTION ANALYSE COLLECTIVE
// =====================================================

function showAnalysisSection(team) {
    // Cacher le message par défaut et afficher les onglets
    const analysisContent = document.getElementById('analysisContent');
    const analysisTabsSection = document.getElementById('analysisTabsSection');
    
    if (analysisContent) analysisContent.style.display = 'none';
    if (analysisTabsSection) analysisTabsSection.style.display = 'block';
    
    // ⚡ OPTIMISATION: Chargement progressif asynchrone
    // Charger d'abord l'onglet actif (Performance), puis les autres en arrière-plan
    requestAnimationFrame(() => {
        displayTeamStats(team); // Immédiat - onglet visible
        
        // Charger les autres onglets après un court délai
        setTimeout(() => {
            displayAttendanceStats(team);
        }, 100);
        
        setTimeout(() => {
            displayAttendanceCharts(team);
        }, 200);
    });
}

function displayAnalysisSection(team) {
    const container = document.getElementById('analysisSection');
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    if (swimmers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Aucun nageur dans cette équipe pour effectuer des analyses.</p>';
        return;
    }

    const analysis = calculateDetailedTeamAnalysis(swimmers);
    
    container.innerHTML = `
        <!-- Graphiques d'évolution -->
        <div class="cards-grid">
            <!-- VMA Collective -->
            <div class="card">
                <h3><i class="fas fa-running"></i> Évolution VMA Collective</h3>
                <div class="chart-container">
                    <canvas id="teamVMAChart"></canvas>
                </div>
            </div>
            
            <!-- Bien-être Collectif -->
            <div class="card">
                <h3><i class="fas fa-heart"></i> Bien-être Collectif</h3>
                <div class="chart-container">
                    <canvas id="teamWellbeingChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Volume d'entraînement -->
        <div class="card" style="margin-top: 20px;">
            <h3><i class="fas fa-chart-bar"></i> Volume d'Entraînement Total</h3>
            <div class="chart-container">
                <canvas id="teamVolumeChart"></canvas>
            </div>
        </div>

        <!-- Analyse par catégories -->
        <div class="cards-grid" style="margin-top: 30px;">
            <div class="card">
                <h3>📊 Performance Collective</h3>
                <p><strong>Tendance:</strong> ${analysis.performanceTrend}</p>
                <p><strong>Progression moyenne:</strong> ${analysis.avgProgression}</p>
            </div>
            
            <div class="card">
                <h3>💪 Condition Physique</h3>
                <p><strong>VMA moyenne:</strong> ${analysis.avgVMA.toFixed(1)} km/h</p>
                <p><strong>Évolution:</strong> ${analysis.vmaEvolution}</p>
            </div>
            
            <div class="card">
                <h3>🎯 Assiduité</h3>
                <p><strong>Taux de présence:</strong> ${analysis.attendanceRate}%</p>
                <p><strong>Absences:</strong> ${analysis.absenceCount} jours</p>
            </div>
        </div>

        <!-- Détection d'alertes -->
        ${analysis.alerts.length > 0 ? `
            <div class="card" style="margin-top: 20px; border-left: 4px solid var(--danger-color);">
                <h3><i class="fas fa-exclamation-triangle"></i> Alertes Équipe</h3>
                <ul style="list-style: none; padding: 0;">
                    ${analysis.alerts.map(alert => `
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                            ${alert.icon} <strong>${alert.title}:</strong> ${alert.message}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
    `;

    // Initialiser les graphiques
    initializeTeamCharts(swimmers);
}

function calculateDetailedTeamAnalysis(swimmers) {
    const analysis = {
        performanceTrend: 'Stable',
        avgProgression: '+0.0%',
        avgVMA: 0,
        vmaEvolution: 'Stable',
        attendanceRate: 95,
        absenceCount: 0,
        alerts: []
    };

    // Calculer VMA moyenne
    let vmaSum = 0, vmaCount = 0;
    swimmers.forEach(swimmer => {
        if (swimmer.vma && swimmer.vma.length > 0) {
            const lastVma = swimmer.vma[swimmer.vma.length - 1];
            if (lastVma.value) {
                vmaSum += lastVma.value;
                vmaCount++;
            }
        }
    });
    analysis.avgVMA = vmaCount > 0 ? vmaSum / vmaCount : 0;

    // Détecter alertes
    let highFatigueCount = 0;
    swimmers.forEach(swimmer => {
        if (swimmer.wellbeing && swimmer.wellbeing.length > 0) {
            const last = swimmer.wellbeing[swimmer.wellbeing.length - 1];
            if (last.fatigue && last.fatigue >= 7) {
                highFatigueCount++;
            }
        }
    });

    if (highFatigueCount > 0) {
        analysis.alerts.push({
            icon: '⚠️',
            title: 'Fatigue élevée',
            message: `${highFatigueCount} nageur(s) avec fatigue ≥ 7/10`
        });
    }

    return analysis;
}

function initializeTeamCharts(swimmers) {
    // VMA Chart
    const vmaCtx = document.getElementById('teamVMAChart');
    if (vmaCtx && Chart) {
        const vmaData = swimmers.map(swimmer => ({
            label: swimmer.name,
            data: swimmer.vma ? swimmer.vma.map(v => ({x: v.date, y: v.value})) : []
        }));

        new Chart(vmaCtx, {
            type: 'line',
            data: {
                datasets: vmaData.map((d, i) => ({
                    label: d.label,
                    data: d.data,
                    borderColor: `hsl(${i * 360 / swimmers.length}, 70%, 50%)`,
                    tension: 0.4
                }))
            },
            options: {
                responsive: true,
                scales: {
                    x: { type: 'time', time: { unit: 'day' } },
                    y: { beginAtZero: false, title: { display: true, text: 'VMA (km/h)' } }
                }
            }
        });
    }

    // Wellbeing Chart
    const wellCtx = document.getElementById('teamWellbeingChart');
    if (wellCtx && Chart) {
        // Calculer moyennes par date
        const wellbeingByDate = {};
        swimmers.forEach(swimmer => {
            if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
                swimmer.wellbeingData.forEach(w => {
                    if (!wellbeingByDate[w.date]) {
                        wellbeingByDate[w.date] = { sleep: [], fatigue: [], pain: [], stress: [], score: [] };
                    }
                    wellbeingByDate[w.date].sleep.push(w.sleep);
                    wellbeingByDate[w.date].fatigue.push(w.fatigue);
                    wellbeingByDate[w.date].pain.push(w.pain);
                    wellbeingByDate[w.date].stress.push(w.stress);
                    wellbeingByDate[w.date].score.push(w.score || ((w.sleep + w.fatigue + w.pain + w.stress) / 4));
                });
            }
        });

        const dates = Object.keys(wellbeingByDate).sort();
        const avgSleep = dates.map(d => wellbeingByDate[d].sleep.reduce((a,b) => a+b, 0) / wellbeingByDate[d].sleep.length);
        const avgFatigue = dates.map(d => wellbeingByDate[d].fatigue.reduce((a,b) => a+b, 0) / wellbeingByDate[d].fatigue.length);
        const avgPain = dates.map(d => wellbeingByDate[d].pain.reduce((a,b) => a+b, 0) / wellbeingByDate[d].pain.length);
        const avgStress = dates.map(d => wellbeingByDate[d].stress.reduce((a,b) => a+b, 0) / wellbeingByDate[d].stress.length);
        const avgScore = dates.map(d => wellbeingByDate[d].score.reduce((a,b) => a+b, 0) / wellbeingByDate[d].score.length);

        new Chart(wellCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'Sommeil', data: avgSleep, borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', borderWidth: 2, tension: 0.4, fill: false },
                    { label: 'Fatigue', data: avgFatigue, borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)', borderWidth: 2, tension: 0.4, fill: false },
                    { label: 'Douleur', data: avgPain, borderColor: 'rgba(255, 159, 64, 1)', backgroundColor: 'rgba(255, 159, 64, 0.2)', borderWidth: 2, tension: 0.4, fill: false },
                    { label: 'Stress', data: avgStress, borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)', borderWidth: 2, tension: 0.4, fill: false },
                    { label: 'Score Global', data: avgScore, borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', borderWidth: 3, tension: 0.4, fill: false, borderDash: [5, 5] }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution du Bien-être de l\'Équipe (5 paramètres - moyennes)',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: { min: 0, max: 5, ticks: { stepSize: 0.5 }, title: { display: true, text: 'Score (1-5)' } }
                }
            }
        });
    }
}

// =====================================================
// 12. SECTION RECOMMANDATIONS ÉQUIPE
// =====================================================

function displayRecommendationsSection(team) {
    const container = document.getElementById('recommendationsSection');
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    if (swimmers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Aucun nageur dans cette équipe.</p>';
        return;
    }

    const recommendations = generateTeamRecommendations(swimmers, team);
    
    container.innerHTML = `
        <!-- Recommandations Générales -->
        <div class="card">
            <h3><i class="fas fa-lightbulb"></i> Recommandations Générales</h3>
            <ul style="list-style: none; padding: 0;">
                ${recommendations.general.map(rec => `
                    <li style="padding: 12px; margin: 8px 0; background: var(--light-color); border-radius: 6px; border-left: 4px solid var(--primary-color);">
                        ${rec.icon} <strong>${rec.title}:</strong> ${rec.message}
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Recommandations par Nageur -->
        <div class="card" style="margin-top: 20px;">
            <h3><i class="fas fa-user-check"></i> Focus Individuel</h3>
            <ul style="list-style: none; padding: 0;">
                ${recommendations.individual.map(rec => `
                    <li style="padding: 12px; margin: 8px 0; background: var(--light-color); border-radius: 6px;">
                        <strong>${rec.swimmer}:</strong> ${rec.message}
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Plan d'Action -->
        <div class="card" style="margin-top: 20px; border-left: 4px solid var(--secondary-color);">
            <h3><i class="fas fa-tasks"></i> Plan d'Action Cette Semaine</h3>
            <ol>
                ${recommendations.actionPlan.map(action => `
                    <li style="padding: 8px 0;">${action.icon} ${action.task}</li>
                `).join('')}
            </ol>
        </div>

        <!-- Objectifs Équipe -->
        <div class="cards-grid" style="margin-top: 30px;">
            <div class="card">
                <h4>🎯 Court Terme (1 mois)</h4>
                <ul>
                    ${recommendations.objectives.shortTerm.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
            </div>
            <div class="card">
                <h4>🎯 Moyen Terme (3 mois)</h4>
                <ul>
                    ${recommendations.objectives.mediumTerm.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
            </div>
            <div class="card">
                <h4>🎯 Long Terme (6 mois)</h4>
                <ul>
                    ${recommendations.objectives.longTerm.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function generateTeamRecommendations(swimmers, team) {
    const recs = {
        general: [],
        individual: [],
        actionPlan: [],
        objectives: {
            shortTerm: [],
            mediumTerm: [],
            longTerm: []
        }
    };

    // Recommandations générales
    const avgVMA = swimmers.reduce((sum, s) => {
        if (s.vma && s.vma.length > 0) {
            return sum + s.vma[s.vma.length - 1].value;
        }
        return sum;
    }, 0) / swimmers.length;

    if (avgVMA > 14) {
        recs.general.push({
            icon: '🏆',
            title: 'Excellent niveau',
            message: `VMA moyenne de ${avgVMA.toFixed(1)} km/h - équipe performante`
        });
    }

    // Recommandations individuelles
    swimmers.forEach(swimmer => {
        if (swimmer.wellbeing && swimmer.wellbeing.length > 0) {
            const last = swimmer.wellbeing[swimmer.wellbeing.length - 1];
            if (last.fatigue && last.fatigue >= 8) {
                recs.individual.push({
                    swimmer: swimmer.name,
                    message: `Repos recommandé (fatigue élevée: ${last.fatigue}/10)`
                });
            }
        }
    });

    // Plan d'action
    recs.actionPlan.push(
        { icon: '🏊', task: 'Séance technique collective mardi' },
        { icon: '💪', task: 'Test VMA équipe vendredi' },
        { icon: '📊', task: 'Bilan individuel (2 nageurs)' }
    );

    // Objectifs
    recs.objectives.shortTerm.push(
        'Augmenter VMA moyenne à 15 km/h',
        'Réduire fatigue moyenne < 5/10'
    );
    recs.objectives.mediumTerm.push(
        '3 nageurs qualifiés championnats',
        'Améliorer technique papillon (+1.5 pts)'
    );
    recs.objectives.longTerm.push(
        'Top 10 régional',
        'Records personnels pour 80% de l\'équipe'
    );

    return recs;
}

// =====================================================
// 13. SECTION COMPARAISONS
// =====================================================

function displayComparisonsSection(team) {
    const container = document.getElementById('comparisonsSection');
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    if (swimmers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Aucun nageur dans cette équipe.</p>';
        return;
    }

    container.innerHTML = `
        <div class="card">
            <h3>🏆 Classement Interne</h3>
            <div class="form-group">
                <label>Critère de classement:</label>
                <select id="rankingCriteria" class="form-control" onchange="window.updateRanking()">
                    <option value="vma">VMA</option>
                    <option value="technique">Score Technique</option>
                    <option value="wellbeing">Bien-être</option>
                    <option value="global">Score Global</option>
                </select>
            </div>
            <div id="rankingTable">
                <!-- Tableau de classement -->
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h3>📊 Comparaison Multi-Nageurs</h3>
            <p>Sélectionnez 2 à 5 nageurs pour comparer:</p>
            <div id="swimmerCheckboxes" style="margin: 15px 0;">
                ${swimmers.map(swimmer => `
                    <label class="checkbox-item">
                        <input type="checkbox" value="${swimmer.id}" onchange="window.updateComparison()">
                        <span>${swimmer.name}</span>
                    </label>
                `).join('')}
            </div>
            <div id="comparisonChart">
                <canvas id="comparisonRadarChart"></canvas>
            </div>
        </div>
    `;

    updateRanking();
}

window.updateRanking = function() {
    const criteria = document.getElementById('rankingCriteria')?.value || 'vma';
    const team = getTeamById(currentTeamId);
    if (!team) return;
    
    const swimmers = getAllSwimmers().filter(s => team.swimmers.includes(s.id));
    
    // Calculer scores
    const ranking = swimmers.map(swimmer => {
        let score = 0;
        if (criteria === 'vma' && swimmer.vma && swimmer.vma.length > 0) {
            score = swimmer.vma[swimmer.vma.length - 1].value || 0;
        } else if (criteria === 'global') {
            // Score global simplifié
            score = Math.random() * 100; // À remplacer par vrai calcul
        }
        return { name: swimmer.name, score: score };
    }).sort((a, b) => b.score - a.score);

    const container = document.getElementById('rankingTable');
    if (container) {
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Rang</th>
                        <th>Nageur</th>
                        <th>Score</th>
                        <th>Évolution</th>
                    </tr>
                </thead>
                <tbody>
                    ${ranking.map((r, i) => `
                        <tr>
                            <td><strong>${i + 1}</strong></td>
                            <td>${r.name}</td>
                            <td>${r.score.toFixed(1)}</td>
                            <td>
                                ${i < 3 ? '<span style="color: green;">↗</span>' : 
                                  i > ranking.length - 3 ? '<span style="color: red;">↘</span>' : 
                                  '<span style="color: gray;">→</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

window.updateComparison = function() {
    const team = getTeamById(currentTeamId);
    if (!team) return;

    const checked = Array.from(document.querySelectorAll('#swimmerCheckboxes input[type="checkbox"]:checked')).map(i => i.value);
    const container = document.getElementById('comparisonChart');
    const canvas = document.getElementById('comparisonRadarChart');
    if (!container || !canvas) return;

    if (checked.length < 2 || checked.length > 5) {
        container.querySelector('canvas').getContext('2d').clearRect(0,0,canvas.width,canvas.height);
        container.insertAdjacentHTML('beforeend', '<p style="color:#999; margin-top:8px;">Sélectionnez 2 à 5 nageurs pour comparer.</p>');
        return;
    }

    // Préparer métriques par nageur
    const swimmersMap = new Map(getAllSwimmers().map(s => [s.id, s]));
    const extract = buildSwimmerExtractors();
    const att = calculateAttendanceStats(team);
    const rateBySwimmer = new Map((att?.swimmerStats || []).map(s => [s.swimmerId, s.rate]));

    const labels = ['Présence %', 'Bien-être /5', 'Charge', 'VMA', 'Technique /10', 'Médical /3', 'Courses'];
    const datasets = [];

    checked.forEach(id => {
        const s = swimmersMap.get(id);
        if (!s) return;
        const data = [
            Number(rateBySwimmer.get(id) || 0),
            extract.wellbeingAvg(s),
            extract.trainingLoadAvg(s),
            extract.vmaLatest(s),
            extract.technicalAvg(s),
            extract.medicalAvailabilityAvg(s),
            extract.raceCount(s)
        ];
        const color = randomColor();
        datasets.push({
            label: s.name,
            data,
            borderColor: color,
            backgroundColor: hexToRgba(color, 0.15),
            pointBackgroundColor: color
        });
    });

    // Détruire un ancien graphique si présent
    if (window._comparisonRadar) {
        window._comparisonRadar.destroy();
    }
    window._comparisonRadar = new Chart(canvas, {
        type: 'radar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { r: { beginAtZero: true } }
        }
    });
};

function randomColor() {
    const h = Math.floor(Math.random()*360);
    return `hsl(${h}, 70%, 45%)`;
}
function hexToRgba(h, a) { // also accept hsl string
    if (h.startsWith('hsl')) return h.replace(')', ` / ${a})`).replace('hsl', 'hsl');
    let c = h.substring(1), r, g, b;
    if (c.length === 3) { r = parseInt(c[0]+c[0],16); g=parseInt(c[1]+c[1],16); b=parseInt(c[2]+c[2],16); }
    else { r=parseInt(c.substr(0,2),16); g=parseInt(c.substr(2,2),16); b=parseInt(c.substr(4,2),16); }
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// =====================================================
// 14. SECTION CALENDRIER
// =====================================================

function displayCalendarSection(team) {
    const container = document.getElementById('calendarSection');
    
    container.innerHTML = `
        <div class="card">
            <h3>📅 Calendrier ${new Date().toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})}</h3>
            <div id="calendarGrid" class="calendar-grid">
                <!-- Calendrier sera généré ici -->
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h3>📊 Statistiques de Présence</h3>
            <div class="cards-grid">
                <div class="stat-item">
                    <span>Taux de présence moyen:</span>
                    <strong>92%</strong>
                </div>
                <div class="stat-item">
                    <span>Absences ce mois:</span>
                    <strong>8 jours</strong>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h3>🎯 Événements à Venir</h3>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 10px; background: var(--light-color); margin: 5px 0; border-radius: 6px;">
                    📅 25 Nov - Compétition régionale
                </li>
                <li style="padding: 10px; background: var(--light-color); margin: 5px 0; border-radius: 6px;">
                    💪 28 Nov - Test VMA collectif
                </li>
            </ul>
        </div>
    `;
    
    generateCalendar();
}

function generateCalendar() {
    const container = document.getElementById('calendarGrid');
    if (!container) return;
    
    // Génération simple d'un calendrier mensuel
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let html = '<div class="calendar-header">';
    ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].forEach(day => {
        html += `<div class="calendar-day-name">${day}</div>`;
    });
    html += '</div><div class="calendar-body">';
    
    // Jours vides avant le premier
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate();
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">${day}</div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

window.addTeamEvent = function() {
    alert('Fonctionnalité d\'ajout d\'événement en cours de développement.');
};

window.refreshTeamStats = function() {
    if (currentTeamId) {
        const team = getTeamById(currentTeamId);
        if (team) {
            displayTeamStats(team);
        }
    }
};

window.refreshAnalysis = function() {
    if (currentTeamId) {
        const team = getTeamById(currentTeamId);
        if (team) {
            displayAnalysisSection(team);
        }
    }
};

// =====================================================
// 11. GESTION DES PRÉSENCES
// =====================================================

// Obtenir toutes les présences
function getAttendances() {
    const attendances = localStorage.getItem('attendances');
    return attendances ? JSON.parse(attendances) : [];
}

// Sauvegarder les présences
function saveAttendancesToStorage(attendances) {
    localStorage.setItem('attendances', JSON.stringify(attendances));
}

// Afficher le formulaire de présence
function displayAttendanceForm(team) {
    const container = document.getElementById('attendanceCheckboxes');
    // Si le conteneur n'existe pas dans cette page (UI via modal), ne rien faire
    if (!container) return;
    if (!team || !team.swimmers || team.swimmers.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucun nageur dans cette équipe.</p>';
        return;
    }
    
    // Définir la date par défaut à aujourd'hui
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Charger les présences existantes pour cette date
    const selectedDate = dateInput && dateInput.value
        ? dateInput.value
        : new Date().toISOString().split('T')[0];
    const existingAttendance = getAttendances().find(
        a => a.teamId === team.id && a.date === selectedDate
    );
    
    const allSwimmers = getAllSwimmers();
    
    let html = '<div class="attendance-list">';
    team.swimmers.forEach(swimmerId => {
        const swimmer = allSwimmers.find(s => s.id === swimmerId);
        if (swimmer) {
            const isPresent = existingAttendance 
                ? existingAttendance.presents.includes(swimmerId)
                : false;
                
            html += `
                <div class="attendance-item">
                    <label>
                        <input type="checkbox" 
                               class="attendance-checkbox" 
                               data-swimmer-id="${swimmerId}"
                               ${isPresent ? 'checked' : ''}>
                        <span class="swimmer-name">${swimmer.name}</span>
                    </label>
                </div>
            `;
        }
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Ouvrir le modal de feuille de présence
window.showAttendanceModal = function() {
    if (!currentTeamId) {
        alert('Veuillez sélectionner une équipe.');
        return;
    }
    
    const team = getTeamById(currentTeamId);
    if (!team || !team.swimmers || team.swimmers.length === 0) {
        alert('Cette équipe n\'a pas de nageurs.');
        return;
    }
    
    // Afficher le modal
    const modal = document.getElementById('attendanceModal');
    modal.style.display = 'block';
    
    // Définir la date du jour par défaut
    const dateInput = document.getElementById('attendanceModalDate');
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Générer la liste des nageurs
    generateAttendanceModalList(team, dateInput.value);
    
    // Écouter les changements de date
    dateInput.addEventListener('change', function() {
        generateAttendanceModalList(team, this.value);
    });
};

// Fermer le modal de présence
window.closeAttendanceModal = function() {
    const modal = document.getElementById('attendanceModal');
    modal.style.display = 'none';
};

// Générer la liste des nageurs avec boutons A/P/E
function generateAttendanceModalList(team, date) {
    const container = document.getElementById('attendanceModalList');
    const allSwimmers = getAllSwimmers();
    const attendances = getAttendances();
    
    // Trouver l'enregistrement existant pour cette date
    const existingAttendance = attendances.find(
        a => a.teamId === team.id && a.date === date
    );
    
    let html = '';
    team.swimmers.forEach(swimmerId => {
        const swimmer = allSwimmers.find(s => s.id === swimmerId);
        if (swimmer) {
            // Déterminer le statut actuel (par défaut: aucun)
            let status = null;
            if (existingAttendance) {
                if (existingAttendance.presents && existingAttendance.presents.includes(swimmerId)) {
                    status = 'present';
                } else if (existingAttendance.absents && existingAttendance.absents.includes(swimmerId)) {
                    status = 'absent';
                } else if (existingAttendance.lates && existingAttendance.lates.includes(swimmerId)) {
                    status = 'late';
                }
            }
            
            html += `
                <div class="attendance-modal-item">
                    <div class="attendance-modal-swimmer-name">${swimmer.name}</div>
                    <div class="attendance-modal-buttons">
                        <button class="attendance-btn attendance-btn-absent ${status === 'absent' ? 'active' : ''}" 
                                onclick="window.setAttendanceStatus('${swimmerId}', 'absent')">
                            A
                        </button>
                        <button class="attendance-btn attendance-btn-present ${status === 'present' ? 'active' : ''}" 
                                onclick="window.setAttendanceStatus('${swimmerId}', 'present')">
                            P
                        </button>
                        <button class="attendance-btn attendance-btn-late ${status === 'late' ? 'active' : ''}" 
                                onclick="window.setAttendanceStatus('${swimmerId}', 'late')">
                            E
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// Définir le statut de présence d'un nageur
window.setAttendanceStatus = function(swimmerId, status) {
    // Trouver la ligne du nageur
    const buttons = document.querySelectorAll(`button[onclick*="${swimmerId}"]`);
    
    buttons.forEach(button => {
        if (button.getAttribute('onclick').includes(`'${status}'`)) {
            // Si déjà actif, désactiver
            if (button.classList.contains('active')) {
                button.classList.remove('active');
            } else {
                // Désactiver tous les autres boutons du nageur
                buttons.forEach(btn => btn.classList.remove('active'));
                // Activer ce bouton
                button.classList.add('active');
            }
        }
    });
};

// Sauvegarder les présences depuis le modal
window.saveAttendanceFromModal = function() {
    if (!currentTeamId) {
        alert('Veuillez sélectionner une équipe.');
        return;
    }
    
    const dateInput = document.getElementById('attendanceModalDate');
    const date = dateInput.value;
    
    if (!date) {
        alert('Veuillez sélectionner une date.');
        return;
    }
    
    const team = getTeamById(currentTeamId);
    if (!team) return;
    
    // Collecter les statuts
    const absents = [];
    const presents = [];
    const lates = [];
    
    team.swimmers.forEach(swimmerId => {
        const buttons = document.querySelectorAll(`button[onclick*="${swimmerId}"]`);
        buttons.forEach(button => {
            if (button.classList.contains('active')) {
                const onclick = button.getAttribute('onclick');
                if (onclick.includes("'absent'")) {
                    absents.push(swimmerId);
                } else if (onclick.includes("'present'")) {
                    presents.push(swimmerId);
                } else if (onclick.includes("'late'")) {
                    lates.push(swimmerId);
                }
            }
        });
    });
    
    // Récupérer les présences existantes
    let attendances = getAttendances();
    
    // Vérifier si une présence existe déjà pour cette équipe et cette date
    const existingIndex = attendances.findIndex(
        a => a.teamId === currentTeamId && a.date === date
    );
    
    const attendanceRecord = {
        id: existingIndex >= 0 ? attendances[existingIndex].id : Date.now().toString(),
        teamId: currentTeamId,
        date: date,
        absents: absents,
        presents: presents,
        lates: lates,
        total: team.swimmers.length,
        timestamp: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
        attendances[existingIndex] = attendanceRecord;
    } else {
        attendances.push(attendanceRecord);
    }
    
    saveAttendancesToStorage(attendances);
    
    alert(`Présences enregistrées !\n✅ Présents: ${presents.length}\n❌ Absents: ${absents.length}\n🟠 Retards: ${lates.length}`);
    
    // Fermer le modal
    window.closeAttendanceModal();
    
    // Rafraîchir les statistiques
    displayAttendanceStats(team);
    displayAttendanceCharts(team);
};

// Sauvegarder les présences
window.saveAttendance = function() {
    if (!currentTeamId) {
        alert('Veuillez sélectionner une équipe.');
        return;
    }
    
    const dateInput = document.getElementById('attendanceDate');
    const date = dateInput.value;
    
    if (!date) {
        alert('Veuillez sélectionner une date.');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    const presents = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            presents.push(checkbox.dataset.swimmerId);
        }
    });
    
    // Récupérer les présences existantes
    let attendances = getAttendances();
    
    // Vérifier si une présence existe déjà pour cette équipe et cette date
    const existingIndex = attendances.findIndex(
        a => a.teamId === currentTeamId && a.date === date
    );
    
    const attendanceRecord = {
        id: existingIndex >= 0 ? attendances[existingIndex].id : Date.now().toString(),
        teamId: currentTeamId,
        date: date,
        presents: presents,
        total: document.querySelectorAll('.attendance-checkbox').length,
        timestamp: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
        attendances[existingIndex] = attendanceRecord;
    } else {
        attendances.push(attendanceRecord);
    }
    
    saveAttendancesToStorage(attendances);
    
    alert(`Présences enregistrées : ${presents.length}/${attendanceRecord.total} nageurs présents`);
    
    // Rafraîchir les statistiques
    if (currentTeamId) {
        const team = getTeamById(currentTeamId);
        displayAttendanceStats(team);
        displayAttendanceCharts(team);
    }
};

// Calculer les statistiques de présence
function calculateAttendanceStats(team) {
    if (!team || !team.swimmers || team.swimmers.length === 0) {
        return null;
    }
    
    const attendances = getAttendances().filter(a => a.teamId === team.id);
    
    if (attendances.length === 0) {
        return {
            totalSessions: 0,
            averageRate: 0,
            bestAttendance: null,
            worstAttendance: null,
            swimmerStats: [],
            recentSessions: [],
            alerts: []
        };
    }
    
    const allSwimmers = getAllSwimmers();
    const swimmerStats = [];
    
    // Statistiques par nageur
    team.swimmers.forEach(swimmerId => {
        const swimmer = allSwimmers.find(s => s.id === swimmerId);
        if (!swimmer) return;
        
        // Supporter les deux formats: ancien (presents seulement) et nouveau (absents/presents/lates)
        const presences = attendances.filter(a => {
            if (a.presents) return a.presents.includes(swimmerId);
            return false;
        }).length;
        
        const lates = attendances.filter(a => {
            if (a.lates) return a.lates.includes(swimmerId);
            return false;
        }).length;
        
        const absences = attendances.length - presences - lates;
        const rate = (presences / attendances.length) * 100;
        
        swimmerStats.push({
            swimmerId: swimmerId,
            name: swimmer.name,
            presences: presences,
            lates: lates,
            absences: absences,
            rate: rate
        });
    });
    
    // Trier par taux de présence
    swimmerStats.sort((a, b) => b.rate - a.rate);
    
    // Calcul du taux moyen
    const averageRate = swimmerStats.reduce((sum, s) => sum + s.rate, 0) / swimmerStats.length;
    
    // Meilleure et pire séance
    const sessionRates = attendances.map(a => {
        const presents = a.presents ? a.presents.length : 0;
        const total = a.total || team.swimmers.length;
        return {
            date: a.date,
            rate: (presents / total) * 100,
            presents: presents,
            total: total
        };
    });
    
    sessionRates.sort((a, b) => b.rate - a.rate);
    const bestAttendance = sessionRates[0];
    const worstAttendance = sessionRates[sessionRates.length - 1];
    
    // Dernières séances
    const recentSessions = attendances
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .map(a => ({
            date: a.date,
            presents: a.presents.length,
            total: a.total,
            rate: (a.presents.length / a.total) * 100
        }));
    
    // Alertes d'absences répétées (< 60% de présence)
    const alerts = swimmerStats
        .filter(s => s.rate < 60 && attendances.length >= 3)
        .map(s => ({
            type: 'absence',
            severity: s.rate < 40 ? 'high' : 'medium',
            swimmer: s.name,
            message: `${s.name} : seulement ${s.rate.toFixed(1)}% de présence (${s.presences}/${attendances.length} séances)`
        }));
    
    return {
        totalSessions: attendances.length,
        averageRate: averageRate,
        bestAttendance: bestAttendance,
        worstAttendance: worstAttendance,
        swimmerStats: swimmerStats,
        recentSessions: recentSessions,
        alerts: alerts
    };
}

// Afficher les statistiques de présence
function displayAttendanceStats(team) {
    const container = document.getElementById('attendanceStatsSection');
    if (!container || !team) return;
    
    const stats = calculateAttendanceStats(team);
    
    if (!stats || stats.totalSessions === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <p style="text-align: center; color: #999;">
                        <i class="fas fa-calendar-check"></i> Aucune présence enregistrée pour cette équipe.
                    </p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '<div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">';
    
    // Carte 1 : Séances totales
    html += `
        <div class="card stats-card">
            <div class="card-body">
                <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                <div class="stat-value">${stats.totalSessions}</div>
                <div class="stat-label">Séances enregistrées</div>
            </div>
        </div>
    `;
    
    // Carte 2 : Taux moyen de présence
    const rateColor = stats.averageRate >= 80 ? '#28a745' : stats.averageRate >= 60 ? '#ffc107' : '#dc3545';
    html += `
        <div class="card stats-card">
            <div class="card-body">
                <div class="stat-icon" style="color: ${rateColor};"><i class="fas fa-percent"></i></div>
                <div class="stat-value" style="color: ${rateColor};">${stats.averageRate.toFixed(1)}%</div>
                <div class="stat-label">Taux moyen de présence</div>
            </div>
        </div>
    `;
    
    // Carte 3 : Meilleure assiduité
    if (stats.swimmerStats.length > 0) {
        const best = stats.swimmerStats[0];
        html += `
            <div class="card stats-card">
                <div class="card-body">
                    <div class="stat-icon" style="color: #28a745;"><i class="fas fa-trophy"></i></div>
                    <div class="stat-value">${best.rate.toFixed(1)}%</div>
                    <div class="stat-label">${best.name}</div>
                    <small style="color: #999;">${best.presences}/${stats.totalSessions} séances</small>
                </div>
            </div>
        `;
    }
    
    // Carte 4 : Alertes
    if (stats.alerts.length > 0) {
        html += `
            <div class="card stats-card">
                <div class="card-body">
                    <div class="stat-icon" style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="stat-value">${stats.alerts.length}</div>
                    <div class="stat-label">Alertes d'absence</div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Alertes détaillées
    if (stats.alerts.length > 0) {
        html += `
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Alertes d'Absences Répétées</h3>
                </div>
                <div class="card-body">
        `;
        
        stats.alerts.forEach(alert => {
            const color = alert.severity === 'high' ? '#dc3545' : '#ffc107';
            html += `
                <div class="alert" style="border-left: 4px solid ${color}; padding: 10px; margin-bottom: 10px; background: #f8f9fa;">
                    <i class="fas fa-exclamation-circle" style="color: ${color};"></i>
                    ${alert.message}
                </div>
            `;
        });
        
        html += '</div></div>';
    }
    
    // Tableau des nageurs
    html += `
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3><i class="fas fa-users"></i> Assiduité par Nageur</h3>
            </div>
            <div class="card-body">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nageur</th>
                            <th>Présences</th>
                            <th>Retards</th>
                            <th>Absences</th>
                            <th>Taux</th>
                            <th>Progression</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    stats.swimmerStats.forEach(s => {
        const barColor = s.rate >= 80 ? '#28a745' : s.rate >= 60 ? '#ffc107' : '#dc3545';
        html += `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td><span class="badge" style="background: #28a745;">${s.presences}</span></td>
                <td><span class="badge" style="background: #ff9800;">${s.lates || 0}</span></td>
                <td><span class="badge" style="background: #dc3545;">${s.absences}</span></td>
                <td>
                    <strong style="color: ${barColor};">${s.rate.toFixed(1)}%</strong>
                </td>
                <td>
                    <div style="width: 100%; background: #eee; border-radius: 10px; height: 20px; overflow: hidden;">
                        <div style="width: ${s.rate}%; background: ${barColor}; height: 100%;"></div>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Dernières séances
    if (stats.recentSessions.length > 0) {
        html += `
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> Historique des 10 Dernières Séances</h3>
                </div>
                <div class="card-body">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Présents</th>
                                <th>Total</th>
                                <th>Taux</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        stats.recentSessions.forEach(session => {
            const rateColor = session.rate >= 80 ? '#28a745' : session.rate >= 60 ? '#ffc107' : '#dc3545';
            html += `
                <tr>
                    <td>${new Date(session.date).toLocaleDateString('fr-FR')}</td>
                    <td>${session.presents}</td>
                    <td>${session.total}</td>
                    <td><strong style="color: ${rateColor};">${session.rate.toFixed(1)}%</strong></td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Afficher les graphiques de présence
function displayAttendanceCharts(team) {
    const container = document.getElementById('attendanceChartsSection');
    if (!container || !team) return;
    
    const stats = calculateAttendanceStats(team);
    
    if (!stats || stats.totalSessions === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-chart-line"></i> Évolution des Présences</h3>
            </div>
            <div class="card-body">
                <canvas id="attendanceChart" style="max-height: 300px;"></canvas>
            </div>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3><i class="fas fa-chart-bar"></i> Assiduité par Nageur</h3>
            </div>
            <div class="card-body">
                <canvas id="swimmerAttendanceChart" style="max-height: 300px;"></canvas>
            </div>
        </div>
    `;
    
    // Graphique d'évolution
    const attendances = getAttendances()
        .filter(a => a.teamId === team.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const ctx1 = document.getElementById('attendanceChart');
    if (ctx1 && attendances.length > 0) {
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: attendances.map(a => new Date(a.date).toLocaleDateString('fr-FR')),
                datasets: [{
                    label: 'Taux de présence (%)',
                    data: attendances.map(a => (a.presents.length / a.total) * 100),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Graphique par nageur
    const ctx2 = document.getElementById('swimmerAttendanceChart');
    if (ctx2 && stats.swimmerStats.length > 0) {
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: stats.swimmerStats.map(s => s.name),
                datasets: [{
                    label: 'Taux de présence (%)',
                    data: stats.swimmerStats.map(s => s.rate),
                    backgroundColor: stats.swimmerStats.map(s => 
                        s.rate >= 80 ? '#28a745' : s.rate >= 60 ? '#ffc107' : '#dc3545'
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Export PDF des présences
window.exportAttendancePDF = function() {
    if (!currentTeamId) {
        alert('Veuillez sélectionner une équipe.');
        return;
    }
    
    const team = getTeamById(currentTeamId);
    if (!team) return;
    
    const stats = calculateAttendanceStats(team);
    if (!stats || stats.totalSessions === 0) {
        alert('Aucune présence enregistrée pour cette équipe.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    
    // Titre
    doc.setFontSize(18);
    doc.text(`Rapport de Présences - ${team.name}`, 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;
    
    // Statistiques générales
    doc.setFontSize(14);
    doc.text('Statistiques Générales', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.text(`Nombre de séances : ${stats.totalSessions}`, 20, y);
    y += 6;
    doc.text(`Taux moyen de présence : ${stats.averageRate.toFixed(1)}%`, 20, y);
    y += 10;
    
    // Alertes
    if (stats.alerts.length > 0) {
        doc.setFontSize(14);
        doc.text('Alertes d\'Absences', 20, y);
        y += 8;
        
        doc.setFontSize(10);
        stats.alerts.forEach(alert => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(`• ${alert.message}`, 20, y);
            y += 6;
        });
        y += 5;
    }
    
    // Tableau par nageur
    doc.setFontSize(14);
    doc.text('Assiduité par Nageur', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    stats.swimmerStats.forEach((s, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(`${index + 1}. ${s.name} : ${s.rate.toFixed(1)}% (${s.presences}/${stats.totalSessions})`, 20, y);
        y += 6;
    });
    
    doc.save(`presences_${team.name}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Mettre à jour le calendrier avec les présences
function updateCalendarWithAttendance(team) {
    if (!team) return;
    
    const attendances = getAttendances().filter(a => a.teamId === team.id);
    const attendanceMap = {};
    
    attendances.forEach(a => {
        const date = new Date(a.date);
        const day = date.getDate();
        attendanceMap[day] = {
            presents: a.presents.length,
            total: a.total,
            rate: (a.presents.length / a.total) * 100
        };
    });
    
    // Ajouter des indicateurs visuels sur les jours du calendrier
    const days = document.querySelectorAll('.calendar-day:not(.empty)');
    days.forEach(dayEl => {
        const day = parseInt(dayEl.textContent);
        if (attendanceMap[day]) {
            const info = attendanceMap[day];
            const color = info.rate >= 80 ? '#28a745' : info.rate >= 60 ? '#ffc107' : '#dc3545';
            dayEl.style.borderBottom = `3px solid ${color}`;
            dayEl.title = `Présence : ${info.presents}/${info.total} (${info.rate.toFixed(1)}%)`;
            dayEl.style.cursor = 'pointer';
        }
    });
}

// =====================================================
// NOUVELLES FONCTIONS POUR L'INTERFACE RÉORGANISÉE
// =====================================================

// Fonction pour le sélecteur global
window.onGlobalTeamSelect = function() {
    const selector = document.getElementById('globalTeamSelector');
    const teamId = selector.value;
    
    if (!teamId) {
        currentTeamId = null;
        hideQuickInfo();
        clearAllSections();
        return;
    }
    
    currentTeamId = teamId;
    const team = getTeamById(teamId);
    
    if (team) {
        // Mettre à jour les infos rapides
        updateQuickInfo(team);
        
        // Synchroniser avec la section Gestion
        updateManagementSection(team);
        
        // Rafraîchir toutes les sections
        refreshAllSections(team);
    }
};

// Afficher les infos rapides
function updateQuickInfo(team) {
    const quickInfo = document.getElementById('quickTeamInfo');
    if (!quickInfo) return;
    
    quickInfo.style.display = 'block';
    
    // Compter les nageurs
    document.getElementById('quickSwimmerCount').textContent = team.swimmers.length;
    document.getElementById('quickTeamCategory').textContent = team.category;
    
    // Compter les séances
    const attendances = getAttendances().filter(a => a.teamId === team.id);
    document.getElementById('quickSessionCount').textContent = attendances.length;
    
    // Calculer le taux de présence moyen
    if (attendances.length > 0) {
        const stats = calculateAttendanceStats(team);
        document.getElementById('quickAttendanceRate').textContent = 
            stats.averageRate.toFixed(1) + '%';
    } else {
        document.getElementById('quickAttendanceRate').textContent = '-';
    }
}

// Cacher les infos rapides
function hideQuickInfo() {
    const quickInfo = document.getElementById('quickTeamInfo');
    if (quickInfo) {
        quickInfo.style.display = 'none';
    }
}

// Rafraîchir toutes les sections
function refreshAllSections(team) {
    // Section Aperçu
    refreshOverviewSection(team);
    
    // Section Saisie
    refreshDataEntrySection(team);
    
    // Section Analyse
    refreshAnalysisSection(team);
}

// Rafraîchir la section Aperçu
function refreshOverviewSection(team) {
    const overviewContent = document.getElementById('overviewContent');
    if (!overviewContent) return;
    
    const stats = calculateAttendanceStats(team);
    const attendances = getAttendances().filter(a => a.teamId === team.id);
    
    let html = '<div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">';
    
    // Carte 1: Nombre de nageurs
    html += `
        <div class="card stats-card" style="border-left: 4px solid #1a73e8;">
            <div class="card-body">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-value">${team.swimmers.length}</div>
                <div class="stat-label">Nageurs</div>
            </div>
        </div>
    `;
    
    // Carte 2: Séances
    html += `
        <div class="card stats-card" style="border-left: 4px solid #28a745;">
            <div class="card-body">
                <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                <div class="stat-value">${attendances.length}</div>
                <div class="stat-label">Séances enregistrées</div>
            </div>
        </div>
    `;
    
    // Carte 3: Taux de présence
    const rateColor = stats.averageRate >= 80 ? '#28a745' : stats.averageRate >= 60 ? '#ffc107' : '#dc3545';
    html += `
        <div class="card stats-card" style="border-left: 4px solid ${rateColor};">
            <div class="card-body">
                <div class="stat-icon" style="color: ${rateColor};"><i class="fas fa-chart-line"></i></div>
                <div class="stat-value" style="color: ${rateColor};">${stats.averageRate.toFixed(1)}%</div>
                <div class="stat-label">Taux de présence</div>
            </div>
        </div>
    `;
    
    // Carte 4: Alertes
    html += `
        <div class="card stats-card" style="border-left: 4px solid #dc3545;">
            <div class="card-body">
                <div class="stat-icon" style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="stat-value">${stats.alerts.length}</div>
                <div class="stat-label">Alertes</div>
            </div>
        </div>
    `;
    
    html += '</div>';
    
    // Dernières séances
    if (stats.recentSessions && stats.recentSessions.length > 0) {
        html += `
            <div class="card" style="margin-top: 30px;">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> Activité Récente</h3>
                </div>
                <div class="card-body">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Présents</th>
                                <th>Absents</th>
                                <th>Retards</th>
                                <th>Taux</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        stats.recentSessions.slice(0, 5).forEach(session => {
            const rateColor = session.rate >= 80 ? '#28a745' : session.rate >= 60 ? '#ffc107' : '#dc3545';
            const lates = session.lates || 0;
            html += `
                <tr>
                    <td><strong>${new Date(session.date).toLocaleDateString('fr-FR')}</strong></td>
                    <td><span class="badge" style="background: #28a745;">${session.presents}</span></td>
                    <td><span class="badge" style="background: #dc3545;">${session.absents}</span></td>
                    <td><span class="badge" style="background: #ff9800;">${lates}</span></td>
                    <td><strong style="color: ${rateColor};">${session.rate.toFixed(1)}%</strong></td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // Alertes
    if (stats.alerts.length > 0) {
        html += `
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Alertes</h3>
                </div>
                <div class="card-body">
        `;
        
        stats.alerts.forEach(alert => {
            const color = alert.severity === 'high' ? '#dc3545' : '#ffc107';
            html += `
                <div class="alert" style="border-left: 4px solid ${color}; padding: 10px; margin-bottom: 10px; background: #f8f9fa;">
                    <i class="fas fa-exclamation-circle" style="color: ${color};"></i>
                    ${alert.message}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    overviewContent.innerHTML = html;
}

// Rafraîchir la section Saisie
function refreshDataEntrySection(team) {
    // Afficher la section de présence
    const attendanceSection = document.getElementById('attendanceEntrySection');
    if (attendanceSection) {
        attendanceSection.style.display = 'block';
        displayAttendanceForm(team);
    }
    
    // Afficher la section de saisie groupée
    const bulkSection = document.getElementById('bulkEntrySection');
    if (bulkSection) {
        bulkSection.style.display = 'block';
    }
    
    // Masquer le message vide
    const dataEntryContent = document.getElementById('dataEntryContent');
    if (dataEntryContent) {
        dataEntryContent.style.display = 'none';
    }
}

// Rafraîchir la section Analyse
function refreshAnalysisSection(team) {
    const analysisContent = document.getElementById('analysisContent');
    const analysisTabsSection = document.getElementById('analysisTabsSection');
    
    if (analysisContent) {
        analysisContent.style.display = 'none';
    }
    
    if (analysisTabsSection) {
        analysisTabsSection.style.display = 'block';
    }
    
    // Afficher l'onglet actif
    displayAttendanceStats(team);
    displayAttendanceCharts(team);
    displayTeamStats(team);
}

// Mettre à jour la section Gestion
function updateManagementSection(team) {
    // Mettre à jour les détails de l'équipe
    window.selectTeam(team.id);
}

// Changer d'onglet dans l'analyse
window.switchAnalysisTab = function(tabName) {
    // Désactiver tous les onglets
    document.querySelectorAll('.analysis-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Masquer tous les contenus
    document.querySelectorAll('.analysis-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Activer l'onglet sélectionné
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Afficher le contenu correspondant
    const contentMap = {
        'attendance': 'attendanceAnalysis',
        'performance': 'performanceAnalysis',
        'comparisons': 'comparisonsAnalysis',
        'recommendations': 'recommendationsAnalysis',
        'calendar': 'calendarAnalysis'
    };
    
    const contentId = contentMap[tabName];
    const content = document.getElementById(contentId);
    if (content) {
        content.classList.add('active');
        content.style.display = 'block';
    }
    
    // Rafraîchir le contenu si nécessaire
    if (currentTeamId) {
        const team = getTeamById(currentTeamId);
        if (team) {
            switch(tabName) {
                case 'comparisons':
                    displayComparisonsSection(team);
                    break;
                case 'recommendations':
                    displayRecommendationsSection(team);
                    break;
                case 'calendar':
                    displayCalendarSection(team);
                    break;
            }
        }
    }
};

// Naviguer vers la section Gestion
window.goToManagement = function() {
    showSection('gestion');
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
    const managementLink = document.querySelector('nav a[href="#gestion"]');
    if (managementLink) {
        managementLink.classList.add('active');
    }
};

// Effacer toutes les sections
function clearAllSections() {
    // Section Aperçu
    const overviewContent = document.getElementById('overviewContent');
    if (overviewContent) {
        overviewContent.innerHTML = `
            <div class="card" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
                <i class="fas fa-users" style="font-size: 4rem; color: #1a73e8; margin-bottom: 20px;"></i>
                <h3 style="color: #333; margin-bottom: 10px;">Sélectionnez une équipe pour commencer</h3>
                <p style="color: #666; font-size: 1.1rem;">Utilisez le sélecteur ci-dessus ou créez une nouvelle équipe</p>
            </div>
        `;
    }
    
    // Section Saisie
    const dataEntryContent = document.getElementById('dataEntryContent');
    if (dataEntryContent) {
        dataEntryContent.style.display = 'block';
    }
    
    const attendanceSection = document.getElementById('attendanceEntrySection');
    if (attendanceSection) {
        attendanceSection.style.display = 'none';
    }
    
    const bulkSection = document.getElementById('bulkEntrySection');
    if (bulkSection) {
        bulkSection.style.display = 'none';
    }
    
    // Section Analyse
    const analysisContent = document.getElementById('analysisContent');
    if (analysisContent) {
        analysisContent.style.display = 'block';
    }
    
    const analysisTabsSection = document.getElementById('analysisTabsSection');
    if (analysisTabsSection) {
        analysisTabsSection.style.display = 'none';
    }
}

// Rafraîchir le dashboard
window.refreshDashboard = function() {
    if (currentTeamId) {
        const team = getTeamById(currentTeamId);
        if (team) {
            refreshOverviewSection(team);
            updateQuickInfo(team);
        }
    }
};

// =============================================
// FONCTION TEST : CRÉER ÉQUIPE DE DÉMONSTRATION
// =============================================
window.createTestTeam = function() {
    const confirm = window.confirm(
        '🧪 CRÉER ÉQUIPE DE TEST\n\n' +
        'Cette fonction va créer automatiquement :\n' +
        '• 1 équipe "Équipe Test - Élite"\n' +
        '• 4 nageurs avec profils complets\n' +
        '• Toutes les données (bien-être, entraînement, performance, médical, courses)\n' +
        '• Graphiques et analyses\n\n' +
        'Continuer ?'
    );
    
    if (!confirm) return;
    
    console.log('🧪 Début création équipe test...');
    
    // 1. CRÉER 4 NAGEURS AVEC DONNÉES COMPLÈTES
    const testSwimmers = createTestSwimmers();
    console.log(`✅ ${testSwimmers.length} nageurs créés`);
    
    // 2. CRÉER L'ÉQUIPE
    const testTeam = {
        id: 'team-test-' + Date.now(),
        name: 'Équipe Test - Élite',
        category: 'Senior',
        coach: 'Coach Demo',
        createdAt: new Date().toISOString().split('T')[0],
        swimmers: testSwimmers.map(s => s.id)
    };
    
    // Sauvegarder équipe
    const teams = getAllTeams();
    teams.push(testTeam);
    saveTeams(teams);
    console.log('✅ Équipe créée:', testTeam.name);
    
    // 3. RECHARGER ET SÉLECTIONNER L'ÉQUIPE
    loadTeamSelector();
    
    // Attendre que le DOM soit mis à jour
    setTimeout(() => {
        const selector = document.getElementById('globalTeamSelector');
        if (selector) {
            selector.value = testTeam.id;
            selectTeam(testTeam.id);
            
            // Afficher message de succès
            alert(
                '✅ ÉQUIPE TEST CRÉÉE !\n\n' +
                `Équipe: ${testTeam.name}\n` +
                `Nageurs: ${testSwimmers.length}\n` +
                `• ${testSwimmers[0].name}\n` +
                `• ${testSwimmers[1].name}\n` +
                `• ${testSwimmers[2].name}\n` +
                `• ${testSwimmers[3].name}\n\n` +
                'Toutes les données ont été générées.\n' +
                'Explorez les sections Aperçu, Analyse et Gestion !'
            );
            
            // Aller à la section Aperçu pour voir les données
            showSection('apercu');
        }
    }, 500);
};

function createTestSwimmers() {
    const swimmers = getAllSwimmers();
    const testSwimmers = [];
    
    // Profils de nageurs variés
    const profiles = [
        {
            name: 'Sophie Martin',
            age: 19,
            gender: 'female',
            specialty: 'crawl',
            level: 'high' // Bon niveau
        },
        {
            name: 'Lucas Dubois',
            age: 21,
            gender: 'male',
            specialty: 'papillon',
            level: 'medium' // Niveau moyen
        },
        {
            name: 'Emma Bernard',
            age: 18,
            gender: 'female',
            specialty: 'dos',
            level: 'high' // Bon niveau
        },
        {
            name: 'Thomas Petit',
            age: 20,
            gender: 'male',
            specialty: 'brasse',
            level: 'low' // En progression
        }
    ];
    
    profiles.forEach(profile => {
        const swimmer = createSwimmerWithData(profile);
        swimmers.push(swimmer);
        testSwimmers.push(swimmer);
    });
    
    // Sauvegarder tous les nageurs
    saveSwimmers(swimmers);
    
    return testSwimmers;
}

function createSwimmerWithData(profile) {
    const swimmerId = 'swimmer-test-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Générer 10 jours de données
    const dates = [];
    for (let i = 9; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    // Générer données selon le niveau
    const levelMultipliers = {
        high: { wellbeing: 1.2, performance: 1.3, training: 1.1 },
        medium: { wellbeing: 1.0, performance: 1.0, training: 1.0 },
        low: { wellbeing: 0.8, performance: 0.7, training: 0.9 }
    };
    
    const mult = levelMultipliers[profile.level];
    
    // Données de bien-être
    const wellbeingData = dates.map(date => ({
        date: date,
        sleep: Math.round(6 + Math.random() * 3 * mult.wellbeing),
        fatigue: Math.round(3 + Math.random() * 4 / mult.wellbeing),
        pain: Math.round(Math.random() * 3 / mult.wellbeing),
        stress: Math.round(2 + Math.random() * 4 / mult.wellbeing)
    }));
    
    // Données d'entraînement
    const trainingData = dates.map(date => {
        const volume = Math.round(60 + Math.random() * 40 * mult.training);
        const volumeMeters = Math.round(3000 + Math.random() * 2000 * mult.training);
        const rpe = Math.round(5 + Math.random() * 4);
        return {
            date: date,
            volume: volume,
            volumeMeters: volumeMeters,
            rpe: rpe,
            load: volume * rpe
        };
    });
    
    // Données de performance
    const performanceData = dates.filter((_, i) => i % 3 === 0).map(date => ({
        date: date,
        vma: parseFloat((12 + Math.random() * 4 * mult.performance).toFixed(1)),
        shoulderStrength: parseFloat((2 + Math.random() * 2 * mult.performance).toFixed(1)),
        chestStrength: parseFloat((1.5 + Math.random() * 1.5 * mult.performance).toFixed(1)),
        legStrength: parseFloat((2.5 + Math.random() * 2 * mult.performance).toFixed(1))
    }));
    
    // Données médicales
    const medicalData = dates.map(date => ({
        date: date,
        availability: profile.level === 'high' ? 3 : (profile.level === 'medium' ? 2 : Math.round(1 + Math.random() * 2)),
        illnesses: Math.random() > 0.9 ? 1 : 0,
        injuries: Math.random() > 0.95 ? 1 : 0,
        otherIssues: 0
    }));
    
    // Données de course (3 compétitions)
    const raceData = [
        {
            date: dates[2],
            event: 'Championnats Régionaux - Novembre 2024',
            races: generateRaces(profile.specialty, profile.level)
        },
        {
            date: dates[5],
            event: 'Meeting Interclubs - Novembre 2024',
            races: generateRaces(profile.specialty, profile.level)
        },
        {
            date: dates[8],
            event: 'Compétition Nationale - Novembre 2024',
            races: generateRaces(profile.specialty, profile.level)
        }
    ];
    
    // Créer le nageur
    const swimmer = {
        id: swimmerId,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        specialty: profile.specialty,
        joinDate: dates[0],
        teams: [],
        
        // Nouvelle structure
        wellbeingData: wellbeingData,
        trainingData: trainingData,
        performanceData: performanceData,
        medicalData: medicalData,
        raceData: raceData,
        
        // Ancienne structure (compatibilité)
        wellbeing: {
            sleep: wellbeingData.map(d => d.sleep),
            fatigue: wellbeingData.map(d => d.fatigue),
            pain: wellbeingData.map(d => d.pain),
            stress: wellbeingData.map(d => d.stress),
            dates: wellbeingData.map(d => d.date)
        },
        training: {
            volume: trainingData.map(d => d.volume),
            volumeMeters: trainingData.map(d => d.volumeMeters),
            rpe: trainingData.map(d => d.rpe),
            charge: trainingData.map(d => d.load),
            dates: trainingData.map(d => d.date)
        },
        performance: {
            vma: performanceData.map(d => d.vma),
            shoulderStrength: performanceData.map(d => d.shoulderStrength),
            chestStrength: performanceData.map(d => d.chestStrength),
            legStrength: performanceData.map(d => d.legStrength),
            dates: performanceData.map(d => d.date)
        },
        medical: {
            availability: medicalData.map(d => d.availability),
            illnesses: medicalData.map(d => d.illnesses),
            injuries: medicalData.map(d => d.injuries),
            otherIssues: medicalData.map(d => d.otherIssues),
            dates: medicalData.map(d => d.date)
        },
        racePerformances: {
            event: raceData.map(r => r.event),
            races: raceData.map(r => r.races),
            dates: raceData.map(r => r.date)
        },
        technical: {},
        attendance: { records: [] }
    };
    
    return swimmer;
}

function generateRaces(specialty, level) {
    const styles = {
        'crawl': 'Crawl',
        'papillon': 'Papillon',
        'dos': 'Dos',
        'brasse': 'Brasse',
        '4nages': '4 Nages'
    };
    
    const mainStyle = styles[specialty] || 'Crawl';
    
    // Temps de base selon niveau
    const baseTimes = {
        high: { '50m': 26, '100m': 57, '200m': 125 },
        medium: { '50m': 28, '100m': 62, '200m': 135 },
        low: { '50m': 30, '100m': 67, '200m': 145 }
    };
    
    const times = baseTimes[level];
    const variation = () => (Math.random() - 0.5) * 2; // ±1 seconde
    
    return [
        {
            style: mainStyle,
            distance: '50m',
            time: formatTime(times['50m'] + variation())
        },
        {
            style: mainStyle,
            distance: '100m',
            time: formatTime(times['100m'] + variation())
        },
        {
            style: mainStyle,
            distance: '200m',
            time: formatTime(times['200m'] + variation())
        }
    ];
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    if (mins > 0) {
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
    }
    return secs.padStart(5, '0');
}

